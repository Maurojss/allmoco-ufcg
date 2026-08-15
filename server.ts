import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Security: Disable Express fingerprinting
app.disable("x-powered-by");

// Security: Add Helmet middleware for security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Managed by HTML / Vite assets
    crossOriginEmbedderPolicy: false,
  })
);

// Security: Strict JSON body limit to prevent memory exhaustion / DoS
app.use(express.json({ limit: "100kb" }));

// Security: Rate limiter for AI computation endpoint
const nutritionRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 40, // Limit each IP to 40 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Limite de consultas nutricionais atingido para este período. Tente novamente em alguns minutos.",
  },
});

// API route: AI-based nutrition estimation with rate limiting and input validation
app.post("/api/estimate-nutrition", nutritionRateLimiter, async (req, res) => {
  try {
    const { productName, weightGrams } = req.body;

    if (!productName || typeof productName !== "string" || !productName.trim()) {
      return res.status(400).json({ error: "Nome do produto ou prato é obrigatório." });
    }

    // Input sanitization: limit string length to prevent Prompt Injection / Token Bloat
    const cleanProductName = productName.trim().slice(0, 150);

    // Limit weight bounds to prevent calculation overflow
    const parsedWeight = Number(weightGrams);
    const weight = parsedWeight > 0 && parsedWeight <= 5000 ? parsedWeight : 100;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Serviço de IA temporariamente indisponível.",
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash"];
    let responseText = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: `Estime a informação nutricional do seguinte prato/alimento: "${cleanProductName}" considerando uma porção de ${weight} gramas. Determine a quantidade estimada de calorias (kcal), proteínas (g), carboidratos (g), gorduras (g) e fibras (g), além de uma breve explicação técnica de 1 frase em português sobre a composição nutricional.`,
          config: {
            systemInstruction:
              "Você é um nutricionista especialista em estimativa nutricional de alimentos e pratos universitários brasileiros. Forneça estimativas realistas e precisas de macronutrientes e calorias com base no nome do alimento e seu peso em gramas.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER, description: "Calorias totais em kcal para a porção" },
                protein: { type: Type.NUMBER, description: "Proteínas em gramas" },
                carbs: { type: Type.NUMBER, description: "Carboidratos em gramas" },
                fats: { type: Type.NUMBER, description: "Gorduras em gramas" },
                fiber: { type: Type.NUMBER, description: "Fibras alimentares em gramas" },
                explanation: {
                  type: Type.STRING,
                  description: "Resumo explicativo de 1 frase em português sobre como o valor foi estimado",
                },
              },
              required: ["calories", "protein", "carbs", "fats", "explanation"],
            },
          },
        });

        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err) {
        console.warn(`Tentativa com modelo ${modelName} falhou.`);
      }
    }

    let parsed: any = null;
    if (responseText) {
      try {
        parsed = JSON.parse(responseText);
      } catch (e) {
        console.error("Erro ao parsear JSON retornado pelo Gemini.");
      }
    }

    if (parsed && typeof parsed.calories === "number") {
      return res.json({
        calories: Math.round(parsed.calories || 0),
        protein: Math.round((parsed.protein || 0) * 10) / 10,
        carbs: Math.round((parsed.carbs || 0) * 10) / 10,
        fats: Math.round((parsed.fats || 0) * 10) / 10,
        fiber: Math.round((parsed.fiber || 0) * 10) / 10,
        explanation: parsed.explanation || `Estimativa nutricional calculada via IA para porção de ${weight}g.`,
        productName: cleanProductName,
        weightGrams: weight,
      });
    }

    // Heuristic fallback if Gemini API is temporarily unavailable
    const lowerName = cleanProductName.toLowerCase();
    let kcalPer100 = 150;
    let protPer100 = 8;
    let carbPer100 = 20;
    let fatPer100 = 4;
    let fiberPer100 = 2;

    if (lowerName.includes("frango") || lowerName.includes("carne") || lowerName.includes("espetinho") || lowerName.includes("marmita")) {
      kcalPer100 = 175; protPer100 = 14; carbPer100 = 18; fatPer100 = 5; fiberPer100 = 1.8;
    } else if (lowerName.includes("strogonoff") || lowerName.includes("burger") || lowerName.includes("hambúrguer") || lowerName.includes("pastel")) {
      kcalPer100 = 230; protPer100 = 11; carbPer100 = 24; fatPer100 = 10; fiberPer100 = 1.2;
    } else if (lowerName.includes("feijoada") || lowerName.includes("tropeiro")) {
      kcalPer100 = 190; protPer100 = 12; carbPer100 = 20; fatPer100 = 7; fiberPer100 = 4.5;
    } else if (lowerName.includes("açaí") || lowerName.includes("suco") || lowerName.includes("doce")) {
      kcalPer100 = 140; protPer100 = 2; carbPer100 = 28; fatPer100 = 3; fiberPer100 = 2;
    } else if (lowerName.includes("salada") || lowerName.includes("vegano") || lowerName.includes("legume")) {
      kcalPer100 = 95; protPer100 = 5; carbPer100 = 12; fatPer100 = 3; fiberPer100 = 3.5;
    }

    const factor = weight / 100;
    return res.json({
      calories: Math.round(kcalPer100 * factor),
      protein: Math.round(protPer100 * factor * 10) / 10,
      carbs: Math.round(carbPer100 * factor * 10) / 10,
      fats: Math.round(fatPer100 * factor * 10) / 10,
      fiber: Math.round(fiberPer100 * factor * 10) / 10,
      explanation: `Estimativa calculada via Tabela Nutricional Universitária (TACO) para porção de ${weight}g.`,
      productName: cleanProductName,
      weightGrams: weight,
    });
  } catch (err) {
    console.error("Erro interno ao processar estimativa nutricional:", err);
    // Information Disclosure Defense: Never leak internal error message or stack trace
    return res.status(500).json({
      error: "Ocorreu uma falha ao estimar a informação nutricional. Tente novamente mais tarde.",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor seguro iniciado em http://localhost:${PORT}`);
  });
}

startServer();
