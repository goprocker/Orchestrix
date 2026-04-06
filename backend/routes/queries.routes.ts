import { Router } from "express";
import { db } from "../db/supabase";

const router = Router();

router.post("/:id/analysis", async (req, res) => {
  const { text } = req.body;
  try {
    const newAnalysis = await db.analyses.create(parseInt(req.params.id), text);
    res.json({ id: newAnalysis.id, text: newAnalysis.text });
  } catch (err: any) {
    console.error('Error adding analysis:', err);
    res.status(500).json({ error: "Failed to add analysis" });
  }
});

export default router;
