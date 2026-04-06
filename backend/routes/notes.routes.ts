import { Router } from "express";
import db from "../db/database";

const router = Router();

router.get("/", (req, res) => {
  const notes = db.prepare("SELECT * FROM notes ORDER BY updated_at DESC").all();
  res.json(notes.map((n: any) => ({ ...n, tags: JSON.parse(n.tags) })));
});

router.post("/", (req, res) => {
  const { title, content, color, tags, linked_paper_id } = req.body;
  try {
    const result = db.prepare(`
      INSERT INTO notes (title, content, color, tags, linked_paper_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(title || "", content || "", color || "#7c5cfc", JSON.stringify(tags || []), linked_paper_id || null);
    
    const newNote = db.prepare("SELECT * FROM notes WHERE id = ?").get(result.lastInsertRowid);
    res.json({ ...(newNote as any), tags: JSON.parse((newNote as any).tags) });
  } catch (err) {
    res.status(500).json({ error: "Failed to create note" });
  }
});

router.put("/:id", (req, res) => {
  const { title, content, color, tags, linked_paper_id } = req.body;
  try {
    db.prepare(`
      UPDATE notes 
      SET title = ?, content = ?, color = ?, tags = ?, linked_paper_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, content, color, JSON.stringify(tags || []), linked_paper_id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update note" });
  }
});

router.delete("/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM notes WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete note" });
  }
});

export default router;
