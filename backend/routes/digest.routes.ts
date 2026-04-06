import { Router } from "express";
import cron from "node-cron";
import pool from "../db/database";

const router = Router();

router.post("/", async (req, res) => {
  const { userId, query, intervalHours } = req.body;
  if (!userId || !query || !intervalHours) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const { rows } = await pool.query(`
      INSERT INTO subscriptions (user_id, query, interval_hours)
      VALUES ($1, $2, $3) RETURNING id
    `, [userId, query, intervalHours]);

    const subId = rows[0].id;

    cron.schedule(`0 */${intervalHours} * * *`, async () => {
      console.log(`[SCHEDULED] Running digest for ${userId}: ${query}`);
      try {
        await pool.query("UPDATE subscriptions SET last_run = CURRENT_TIMESTAMP WHERE id = $1", [subId]);
      } catch (err) {
        console.error("Failed to update subscription last_run", err);
      }
    });

    res.json({ status: "Subscribed", nextRun: `In ${intervalHours} hours` });
  } catch (err) {
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

export default router;
