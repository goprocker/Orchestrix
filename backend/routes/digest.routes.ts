import { Router } from "express";
import cron from "node-cron";
import { db } from "../db/supabase";

const router = Router();

router.post("/", async (req, res) => {
  const { userId, query, intervalHours } = req.body;
  if (!userId || !query || !intervalHours) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const subscription = await db.subscriptions.create({
      user_id: userId,
      query,
      interval_hours: intervalHours
    });

    cron.schedule(`0 */${intervalHours} * * *`, () => {
      console.log(`[SCHEDULED] Running digest for ${userId}: ${query}`);
      db.subscriptions.update(subscription.id, { last_run: new Date().toISOString() });
    });

    res.json({ status: "Subscribed", nextRun: `In ${intervalHours} hours` });
  } catch (err: any) {
    console.error('Error creating subscription:', err);
    res.status(500).json({ error: "Failed to create subscription" });
  }
});

export default router;
