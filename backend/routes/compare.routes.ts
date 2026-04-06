import { Router } from "express";
import pool from "../db/database";

const router = Router();

router.get("/", async (req, res) => {
  const { idA, idB } = req.query;
  if (!idA || !idB) return res.status(400).json({ error: "Two session IDs required" });

  const getSessionData = async (id: any) => {
    const { rows: sessionRows } = await pool.query("SELECT * FROM sessions WHERE id = $1", [id]);
    if (sessionRows.length === 0) return null;
    
    const { rows: papers } = await pool.query("SELECT * FROM papers WHERE session_id = $1", [id]);
    const { rows: queries } = await pool.query("SELECT * FROM queries WHERE session_id = $1", [id]);
    const { rows: analyses } = await pool.query(`
      SELECT a.* FROM analyses a
      JOIN queries q ON a.query_id = q.id
      WHERE q.session_id = $1
    `, [id]);
    
    return { 
      ...sessionRows[0], 
      papers: papers.map((p: any) => ({ ...p, tags: JSON.parse(p.tags || '[]') })), 
      queries, 
      analyses 
    };
  };

  try {
    const [sessionA, sessionB] = await Promise.all([
      getSessionData(idA),
      getSessionData(idB)
    ]);

    res.json({ sessionA, sessionB });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
