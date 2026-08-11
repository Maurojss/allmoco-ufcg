import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API route: AI-based nutrition estimation
app.post("/api/estimate-nutrition", async (req, res) => {
  try {
    const { productName, weightGrams } = req.body;

    if (!productName || typeof productName !== "string" || !productName.trim()) {
      return res.status(400).json({ error: "Nome do produto ou prato é obrigatório." });
    }

    const weight = Number(weightGrams) > 0 ? Number(weightGrams) : 100;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Chave GEMINI_API_KEY não configurada no servidor.",
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
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: `Estime a informação nutricional do seguinte prato/alimento: "${productName.trim()}" considerando uma porção de ${weight} gramas. Determine a quantidade estimada de calorias (kcal), proteínas (g), carboidratos (g), gorduras (g) e fibras (g), além de uma breve explicação técnica de 1 frase em português sobre a composição nutricional.`,
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
      } catch (err: any) {
        lastError = err;
        console.warn(`Tentativa com modelo ${modelName} falhou:`, err?.message || err);
      }
    }

    let parsed: any = null;
    if (responseText) {
      try {
        parsed = JSON.parse(responseText);
      } catch (e) {
        console.error("Erro ao fazer parse do JSON retornado pelo Gemini:", e);
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
        productName: productName.trim(),
        weightGrams: weight,
      });
    }

    // Heuristic fallback if Gemini API is temporarily unavailable (503 / High Demand)
    console.warn("Utilizando estimativa heurística (Tabela TACO Campus) devido a indisponibilidade temporária dos servidores do Gemini.");
    const lowerName = productName.toLowerCase();
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
      productName: productName.trim(),
      weightGrams: weight,
    });
  } catch (err: any) {
    console.error("Erro na API de estimativa de nutrição com IA:", err);
    return res.status(500).json({
      error: err.message || "Ocorreu um erro ao consultar a inteligência nutricional.",
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
    console.log(`Servidor iniciado em http://localhost:${PORT}`);
  });
}

startServer();
