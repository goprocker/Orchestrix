import { Router } from "express";
import db from "../db/database";

const router = Router();

router.get("/", (req, res) => {
  const { idA, idB } = req.query;
  if (!idA || !idB) return res.status(400).json({ error: "Two session IDs required" });

  const getSessionData = (id: any) => {
    const session = db.prepare("SELECT * FROM sessions WHERE id = ?").get(id);
    if (!session) return null;
    const papers = db.prepare("SELECT * FROM papers WHERE session_id = ?").all(id);
    const queries = db.prepare("SELECT * FROM queries WHERE session_id = ?").all(id);
    const analyses = db.prepare(`
      SELECT a.* FROM analyses a
      JOIN queries q ON a.query_id = q.id
      WHERE q.session_id = ?
    `).all(id);
    return { 
      ...session, 
      papers: papers.map((p: any) => ({ ...p, tags: JSON.parse(p.tags || '[]') })), 
      queries, 
      analyses 
    };
  };

  res.json({
    sessionA: getSessionData(idA),
    sessionB: getSessionData(idB)
  });
});

export default router;
