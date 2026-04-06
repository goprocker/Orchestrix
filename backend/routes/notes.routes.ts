import { Router } from "express";
import { db } from "../db/supabase";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const notes = await db.notes.getAll();
    res.json(notes.map((n: any) => ({ ...n, tags: n.tags || [] })));
  } catch (err: any) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

router.post("/", async (req, res) => {
  const { title, content, color, tags, linked_paper_id } = req.body;
  try {
    const newNote = await db.notes.create({
      title: title || "",
      content: content || "",
      color: color || "#7c5cfc",
      tags: tags || [],
      linked_paper_id: linked_paper_id || null
    });
    res.json({ ...newNote, tags: newNote.tags || [] });
  } catch (err: any) {
    console.error('Error creating note:', err);
    res.status(500).json({ error: "Failed to create note" });
  }
});

router.put("/:id", async (req, res) => {
  const { title, content, color, tags, linked_paper_id } = req.body;
  try {
    await db.notes.update(parseInt(req.params.id), {
      title,
      content,
      color,
      tags: tags || [],
      linked_paper_id,
      updated_at: new Date().toISOString()
    });
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error updating note:', err);
    res.status(500).json({ error: "Failed to update note" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.notes.delete(parseInt(req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting note:', err);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

export default router;
