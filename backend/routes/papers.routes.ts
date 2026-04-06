import { Router } from "express";
import { db } from "../db/supabase";

const router = Router();

router.patch("/:id/notes", async (req, res) => {
  const { notes } = req.body;
  try {
    await db.papers.update(parseInt(req.params.id), { user_notes: notes });
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error updating notes:', err);
    res.status(500).json({ error: "Failed to update notes" });
  }
});

export default router;
