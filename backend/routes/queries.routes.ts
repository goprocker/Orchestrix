import { Router } from "express";
import db from "../db/database";

const router = Router();

router.post("/:id/analysis", (req, res) => {
  const { text } = req.body;
  try {
    const result = db.prepare("INSERT INTO analyses (query_id, text) VALUES (?, ?)").run(req.params.id, text);
    res.json({ id: result.lastInsertRowid, text });
  } catch (err) {
    res.status(500).json({ error: "Failed to add analysis" });
  }
});

export default router;
