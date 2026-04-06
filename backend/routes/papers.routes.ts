import { Router } from "express";
import db from "../db/database";

const router = Router();

router.patch("/:id/notes", (req, res) => {
  const { notes } = req.body;
  try {
    db.prepare("UPDATE papers SET user_notes = ? WHERE id = ?").run(notes, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update notes" });
  }
});

export default router;
