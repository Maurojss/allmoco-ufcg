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

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
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

    const text = response.text || "{}";
    const parsed = JSON.parse(text);

    return res.json({
      calories: Math.round(parsed.calories || 0),
      protein: Math.round((parsed.protein || 0) * 10) / 10,
      carbs: Math.round((parsed.carbs || 0) * 10) / 10,
      fats: Math.round((parsed.fats || 0) * 10) / 10,
      fiber: Math.round((parsed.fiber || 0) * 10) / 10,
      explanation: parsed.explanation || `Estimativa nutricional calculada para porção de ${weight}g.`,
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
