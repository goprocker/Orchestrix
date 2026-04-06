import { Router } from "express";
import pool from "../db/database";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM sessions ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Session name required" });

  try {
    const { rows: existing } = await pool.query("SELECT * FROM sessions WHERE name = $1", [name]);
    if (existing.length > 0) return res.json(existing[0]);

    const { rows } = await pool.query("INSERT INTO sessions (name) VALUES ($1) RETURNING *", [name]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create session" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { rows: sessionRows } = await pool.query("SELECT * FROM sessions WHERE id = $1", [req.params.id]);
    if (sessionRows.length === 0) return res.status(404).json({ error: "Session not found" });

    const { rows: papers } = await pool.query("SELECT * FROM papers WHERE session_id = $1", [req.params.id]);
    const { rows: queries } = await pool.query("SELECT * FROM queries WHERE session_id = $1", [req.params.id]);
    const { rows: analyses } = await pool.query(`
      SELECT a.* FROM analyses a
      JOIN queries q ON a.query_id = q.id
      WHERE q.session_id = $1
    `, [req.params.id]);

    res.json({ 
      ...sessionRows[0], 
      papers: papers.map((p: any) => ({ ...p, tags: JSON.parse(p.tags || '[]') })), 
      queries, 
      analyses 
    });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/:id/queries", async (req, res) => {
  const { text } = req.body;
  try {
    const { rows } = await pool.query("INSERT INTO queries (session_id, text) VALUES ($1, $2) RETURNING id, text", [req.params.id, text]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to add query" });
  }
});

router.patch("/:id/synthesis", async (req, res) => {
  const { synthesis } = req.body;
  try {
    await pool.query("UPDATE sessions SET synthesis = $1 WHERE id = $2", [synthesis, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update synthesis" });
  }
});

router.post("/:id/papers", async (req, res) => {
  const { title, abstract, summary, analysis, url, tags, query_id } = req.body;
  try {
    const { rows } = await pool.query(`
      INSERT INTO papers (session_id, title, abstract, summary, analysis, url, tags, query_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, title
    `, [req.params.id, title, abstract, summary, analysis, url, JSON.stringify(tags || []), query_id || null]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to add paper" });
  }
});

export default router;
