import { Router } from "express";
import { db } from "../db/supabase";

const router = Router();

router.get("/", async (req, res) => {
  const { idA, idB } = req.query;
  if (!idA || !idB) return res.status(400).json({ error: "Two session IDs required" });

  try {
    const sessions = await db.sessions.getAll();
    const sessionA = sessions.find((s: any) => s.id === parseInt(idA as string));
    const sessionB = sessions.find((s: any) => s.id === parseInt(idB as string));

    if (!sessionA || !sessionB) {
      return res.status(404).json({ error: "Session not found" });
    }

    const [papersA, papersB, queriesA, queriesB] = await Promise.all([
      db.papers.getBySession(parseInt(idA as string)),
      db.papers.getBySession(parseInt(idB as string)),
      db.queries.getBySession(parseInt(idA as string)),
      db.queries.getBySession(parseInt(idB as string))
    ]);

    const analysesA = [];
    const analysesB = [];
    
    for (const query of queriesA) {
      const queryAnalyses = await db.analyses.getByQuery(query.id);
      analysesA.push(...queryAnalyses);
    }
    
    for (const query of queriesB) {
      const queryAnalyses = await db.analyses.getByQuery(query.id);
      analysesB.push(...queryAnalyses);
    }

    res.json({
      sessionA: { 
        ...sessionA, 
        papers: papersA.map((p: any) => ({ ...p, tags: p.tags || [] })), 
        queries: queriesA, 
        analyses: analysesA 
      },
      sessionB: { 
        ...sessionB, 
        papers: papersB.map((p: any) => ({ ...p, tags: p.tags || [] })), 
        queries: queriesB, 
        analyses: analysesB 
      }
    });
  } catch (err: any) {
    console.error('Error comparing sessions:', err);
    res.status(500).json({ error: "Failed to compare sessions" });
  }
});

export default router;
