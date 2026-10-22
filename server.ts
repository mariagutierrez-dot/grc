import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint for generating a single-sentence Action Plan using Gemini 3.5 Flash
  app.post("/api/generate-action-plan", async (req, res) => {
    try {
      const { description, processArea } = req.body;
      if (!description) {
        return res.status(400).json({ error: "Risk description is required" });
      }

      const prompt = `Analiza el siguiente riesgo operativo para una Fintech internacional (Global66) con metodología ISO 31000 y formato 5W-2H:
Riesgo: "${description}"
Área: "${processArea || ""}"

Genera un Plan de Acción Express inmutable en UNA SOLA frase directa, concisa y clara de acción ejecutable.
Ejemplo: "Implementar flujo dual Maker-Checker para transacciones en el portal Admin, asignando como responsable al área de Operaciones."
No incluyas explicaciones, viñetas, ni preámbulos, solo la frase de acción exacta.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const text = response.text || "";
      const cleanedText = text.replace(/^["'«]+|["'»]+$/g, "").trim();

      return res.json({ actionPlan: cleanedText });
    } catch (error: any) {
      console.error("Error in generate-action-plan endpoint:", error);
      return res.status(500).json({ error: error.message || "Error generating action plan" });
    }
  });

  // Serve Vite frontend
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
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
