import "dotenv/config";
import express from "express";
import path from "path";

import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { initializeDatabase, getAllKOLs, addKOL, updateKOL, deleteKOL,
  getAllInfluencers,
  addInfluencer,
  updateInfluencer,
  deleteInfluencer, getAllCampaigns, addCampaign, updateCampaign, deleteCampaign } from "./src/kolRepository";



// Initialize the GoogleGenAI instance server-side
// User-Agent: 'aistudio-build' is required for telemetry
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

  // Initialize database schema/connection
  await initializeDatabase();

  // API Route - generate creative direction using Gemini API
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { product, target, tone } = req.body;

      if (!product) {
        res.status(400).json({ error: "Product Name & USP is required" });
        return;
      }

      if (!process.env.GEMINI_API_KEY) {
        res.status(500).json({
          error: "GEMINI_API_KEY is not configured. Please add it to your secrets.",
        });
        return;
      }

      const prompt = `
        Create a detailed, high-impact KOL Master Brief and Content Hook strategy in Thai language.
        
        Product & USP: ${product}
        Target Audience: ${target || "Generic Consumer/General Public"}
        Tone of Voice: ${tone || "Educational & Trustworthy"}

        Provide practical advice, a killer hook that stops viewers in their tracks, an engaging body narrative for a short video format, and clear do's & don'ts.
      `;

      const systemInstruction = `
        You are an elite, creative advertising executive and short-form video master (TikTok/IG Reels specialist) who designs highly optimized visual briefs for influencers in Thailand.
        Your goal is to output a brilliant and practical content campaign recommendation in Thai.
        You must strictly respond with a valid JSON object matching the requested schema.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hook: {
                type: Type.STRING,
                description: "A punchy, attention-grabbing 3-second hook in Thai designed for short-form video starting",
              },
              body: {
                type: Type.STRING,
                description: "Detailed description of the narrative arc and flow of the short video matching the USP and target audience",
              },
              dos: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "At least 2 specific DO's for the KOL for better conversions",
              },
              donts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "At least 2 critical DONT's for the KOL to protect legal/brand identity",
              },
            },
            required: ["hook", "body", "dos", "donts"],
          },
        },
      });

      const responseText = response.text || "{}";
      const cleanedJson = JSON.parse(responseText.trim());
      res.json(cleanedJson);
    } catch (error: any) {
      console.error("Gemini API generation error:", error);
      res.status(500).json({
        error: "Error communicating with Gemini intelligence: " + (error.message || error),
      });
    }
  });

  // Health check API
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Get all KOLs from database or memory
  app.get("/api/kols", async (req, res) => {
    try {
      const kols = await getAllKOLs();
      res.json(kols);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch KOLs" });
    }
  });

  // Add new KOL record
  app.post("/api/kols", async (req, res) => {
    try {
      const newKol = await addKOL(req.body);
      res.json(newKol);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to add KOL" });
    }
  });

  // Update KOL record
  app.put("/api/kols/:id", async (req, res) => {
    try {
      const updated = await updateKOL(req.params.id, req.body);
      if (!updated) {
        res.status(404).json({ error: "KOL not found" });
        return;
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to update KOL" });
    }
  });

  // Delete KOL record
  app.delete("/api/kols/:id", async (req, res) => {
    try {
      const success = await deleteKOL(req.params.id);
      if (!success) {
        res.status(404).json({ error: "KOL not found" });
        return;
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to delete KOL" });
    }
  });

  
  // --- INFLUENCER APIs ---
  app.get("/api/influencers", async (req, res) => {
    try {
      const infs = await getAllInfluencers();
      res.json(infs);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch influencers" });
    }
  });

  app.post("/api/influencers", async (req, res) => {
    try {
      const newInf = await addInfluencer(req.body);
      res.json(newInf);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to add influencer" });
    }
  });

  app.put("/api/influencers/:id", async (req, res) => {
    try {
      const updated = await updateInfluencer(req.params.id, req.body);
      if (!updated) {
        res.status(404).json({ error: "Influencer not found" });
        return;
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to update influencer" });
    }
  });

  app.delete("/api/influencers/:id", async (req, res) => {
    try {
      const success = await deleteInfluencer(req.params.id);
      if (!success) {
        res.status(404).json({ error: "Influencer not found" });
        return;
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to delete influencer" });
    }
  });


  // --- CAMPAIGN APIs ---

  app.get("/api/campaigns", async (req, res) => {
    try {
      const camps = await getAllCampaigns();
      res.json(camps);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch campaigns" });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const newCamp = await addCampaign(req.body);
      res.json(newCamp);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to add campaign" });
    }
  });

  app.put("/api/campaigns/:id", async (req, res) => {
    try {
      const updated = await updateCampaign(req.params.id, req.body);
      if (!updated) {
        res.status(404).json({ error: "Campaign not found" });
        return;
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to update campaign" });
    }
  });

  app.delete("/api/campaigns/:id", async (req, res) => {
    try {
      const success = await deleteCampaign(req.params.id);
      if (!success) {
        res.status(404).json({ error: "Campaign not found" });
        return;
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to delete campaign" });
    }
  });

  // Vite integration
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
