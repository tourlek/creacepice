import re

with open("server.ts", "r") as f:
    content = f.read()

# Add imports for new influencer functions
content = content.replace("deleteKOL,", "deleteKOL,\n  getAllInfluencers,\n  addInfluencer,\n  updateInfluencer,\n  deleteInfluencer,")

influencer_apis = """
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
"""

content = content.replace("// --- CAMPAIGN APIs ---", influencer_apis + "\n\n  // --- CAMPAIGN APIs ---")

with open("server.ts", "w") as f:
    f.write(content)
