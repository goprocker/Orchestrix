import { Router } from "express";
import db from "../db/database";

const router = Router();

router.get("/", (req, res) => {
  const sessions = db.prepare("SELECT * FROM sessions ORDER BY created_at DESC").all();
  res.json(sessions);
});

router.post("/", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Session name required" });

  try {
    const existing = db.prepare("SELECT * FROM sessions WHERE name = ?").get(name);
    if (existing) return res.json(existing);

    const result = db.prepare("INSERT INTO sessions (name) VALUES (?)").run(name);
    res.json({ id: result.lastInsertRowid, name, created_at: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: "Failed to create session" });
  }
});

router.get("/:id", (req, res) => {
  const session = db.prepare("SELECT * FROM sessions WHERE id = ?").get(req.params.id);
  if (!session) return res.status(404).json({ error: "Session not found" });

  const papers = db.prepare("SELECT * FROM papers WHERE session_id = ?").all(req.params.id);
  const queries = db.prepare("SELECT * FROM queries WHERE session_id = ?").all(req.params.id);
  const analyses = db.prepare(`
    SELECT a.* FROM analyses a
    JOIN queries q ON a.query_id = q.id
    WHERE q.session_id = ?
  `).all(req.params.id);

  res.json({ 
    ...session, 
    papers: papers.map((p: any) => ({ ...p, tags: JSON.parse(p.tags || '[]') })), 
    queries, 
    analyses 
  });
});

router.post("/:id/queries", (req, res) => {
  const { text } = req.body;
  try {
    const result = db.prepare("INSERT INTO queries (session_id, text) VALUES (?, ?)").run(req.params.id, text);
    res.json({ id: result.lastInsertRowid, text });
  } catch (err) {
    res.status(500).json({ error: "Failed to add query" });
  }
});

router.patch("/:id/synthesis", (req, res) => {
  const { synthesis } = req.body;
  try {
    db.prepare("UPDATE sessions SET synthesis = ? WHERE id = ?").run(synthesis, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update synthesis" });
  }
});

router.post("/:id/papers", (req, res) => {
  const { title, abstract, summary, analysis, url, tags, query_id } = req.body;
  try {
    const result = db.prepare(`
      INSERT INTO papers (session_id, title, abstract, summary, analysis, url, tags, query_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.params.id, title, abstract, summary, analysis, url, JSON.stringify(tags || []), query_id || null);
    res.json({ id: result.lastInsertRowid, title });
  } catch (err) {
    res.status(500).json({ error: "Failed to add paper" });
  }
});

export default router;
