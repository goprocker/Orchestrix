import { Router } from "express";
import cron from "node-cron";
import db from "../db/database";

const router = Router();

router.post("/", (req, res) => {
  const { userId, query, intervalHours } = req.body;
  if (!userId || !query || !intervalHours) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const result = db.prepare(`
    INSERT INTO subscriptions (user_id, query, interval_hours)
    VALUES (?, ?, ?)
  `).run(userId, query, intervalHours);

  cron.schedule(`0 */${intervalHours} * * *`, () => {
    console.log(`[SCHEDULED] Running digest for ${userId}: ${query}`);
    db.prepare("UPDATE subscriptions SET last_run = CURRENT_TIMESTAMP WHERE id = ?").run(result.lastInsertRowid);
  });

  res.json({ status: "Subscribed", nextRun: `In ${intervalHours} hours` });
});

export default router;
