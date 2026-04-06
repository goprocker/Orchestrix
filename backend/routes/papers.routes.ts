import { Router } from "express";
import pool from "../db/database";

const router = Router();

router.patch("/:id/notes", async (req, res) => {
  const { notes } = req.body;
  try {
    await pool.query("UPDATE papers SET user_notes = $1 WHERE id = $2", [notes, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update notes" });
  }
});

export default router;
