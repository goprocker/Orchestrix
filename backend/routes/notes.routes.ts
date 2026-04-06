import { Router } from "express";
import pool from "../db/database";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM notes ORDER BY updated_at DESC");
    res.json(rows.map((n: any) => ({ ...n, tags: JSON.parse(n.tags || '[]') })));
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/", async (req, res) => {
  const { title, content, color, tags, linked_paper_id } = req.body;
  try {
    const { rows } = await pool.query(`
      INSERT INTO notes (title, content, color, tags, linked_paper_id)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [title || "", content || "", color || "#7c5cfc", JSON.stringify(tags || []), linked_paper_id || null]);
    
    res.json({ ...rows[0], tags: JSON.parse(rows[0].tags || '[]') });
  } catch (err) {
    res.status(500).json({ error: "Failed to create note" });
  }
});

router.put("/:id", async (req, res) => {
  const { title, content, color, tags, linked_paper_id } = req.body;
  try {
    await pool.query(`
      UPDATE notes 
      SET title = $1, content = $2, color = $3, tags = $4, linked_paper_id = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
    `, [title, content, color, JSON.stringify(tags || []), linked_paper_id, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update note" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM notes WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete note" });
  }
});

export default router;
