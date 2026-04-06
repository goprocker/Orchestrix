import { Router } from "express";

const router = Router();

const sandbox_permissions: Record<string, string[]> = {
  "draft_paper_001": ["PI_Smith", "PostDoc_Jane", "Student_Kevin", "guest-user-123"]
};

router.get("/:draft_id", (req, res) => {
  const { draft_id } = req.params;
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: "User ID required" });
  }

  const allowedUsers = sandbox_permissions[draft_id] || [];
  if (!allowedUsers.includes(user_id as string)) {
    return res.status(403).json({ error: "Access Denied: You are not a designated peer reviewer for this sandbox." });
  }
  
  res.json({
    status: "Private Sandbox Active",
    content: "Full Draft PDF Content Here... This is a highly confidential research preprint regarding neural architecture efficiency. The proposed model achieves 40% reduction in FLOPs while maintaining 99% accuracy on ImageNet-1K.",
    feedback_threads: [
      { author: "PI_Smith", text: "The methodology section needs more detail on the hyperparameter tuning.", timestamp: "2026-04-05T10:00:00Z" },
      { author: "PostDoc_Jane", text: "I've verified the results in Figure 2. They look solid.", timestamp: "2026-04-06T09:30:00Z" }
    ] 
  });
});

export default router;
