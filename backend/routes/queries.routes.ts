import { Router } from "express";
import pool from "../db/database";

const router = Router();

router.post("/:id/analysis", async (req, res) => {
  const { text } = req.body;
  try {
    const { rows } = await pool.query("INSERT INTO analyses (query_id, text) VALUES ($1, $2) RETURNING id, text", [req.params.id, text]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to add analysis" });
  }
});

export default router;
