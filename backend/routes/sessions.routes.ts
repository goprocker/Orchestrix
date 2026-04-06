import { Router } from "express";
import { db } from "../db/supabase";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const sessions = await db.sessions.getAll();
    res.json(sessions);
  } catch (err: any) {
    console.error('Error fetching sessions:', err);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

router.post("/", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Session name required" });

  try {
    const sessions = await db.sessions.getAll();
    const existing = sessions.find((s: any) => s.name === name);
    if (existing) return res.json(existing);

    const newSession = await db.sessions.create(name);
    res.json({ id: newSession.id, name: newSession.name, created_at: newSession.created_at });
  } catch (err: any) {
    console.error('Error creating session:', err);
    res.status(500).json({ error: "Failed to create session" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const sessions = await db.sessions.getAll();
    const session = sessions.find((s: any) => s.id === parseInt(req.params.id));
    if (!session) return res.status(404).json({ error: "Session not found" });

    const papers = await db.papers.getBySession(parseInt(req.params.id));
    const queries = await db.queries.getBySession(parseInt(req.params.id));
    
    const analyses = [];
    for (const query of queries) {
      const queryAnalyses = await db.analyses.getByQuery(query.id);
      analyses.push(...queryAnalyses);
    }

    res.json({ 
      ...session, 
      papers: papers.map((p: any) => ({ ...p, tags: p.tags || [] })), 
      queries, 
      analyses 
    });
  } catch (err: any) {
    console.error('Error fetching session:', err);
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

router.post("/:id/queries", async (req, res) => {
  const { text } = req.body;
  try {
    const newQuery = await db.queries.create(parseInt(req.params.id), text);
    res.json({ id: newQuery.id, text: newQuery.text });
  } catch (err: any) {
    console.error('Error adding query:', err);
    res.status(500).json({ error: "Failed to add query" });
  }
});

router.patch("/:id/synthesis", async (req, res) => {
  const { synthesis } = req.body;
  try {
    await db.sessions.create(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error updating synthesis:', err);
    res.status(500).json({ error: "Failed to update synthesis" });
  }
});

router.post("/:id/papers", async (req, res) => {
  const { title, abstract, summary, analysis, url, tags, query_id } = req.body;
  try {
    const newPaper = await db.papers.create({
      session_id: parseInt(req.params.id),
      title,
      abstract,
      summary,
      analysis,
      url,
      tags: tags || [],
      query_id: query_id || null
    });
    res.json({ id: newPaper.id, title: newPaper.title });
  } catch (err: any) {
    console.error('Error adding paper:', err);
    res.status(500).json({ error: "Failed to add paper" });
  }
});

export default router;
