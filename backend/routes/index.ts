import { Router } from "express";
import sessionsRoutes from "./sessions.routes";
import notesRoutes from "./notes.routes";
import searchRoutes from "./search.routes";
import sandboxRoutes from "./sandbox.routes";
import digestRoutes from "./digest.routes";
import queriesRoutes from "./queries.routes";
import papersRoutes from "./papers.routes";
import compareRoutes from "./compare.routes";

const router = Router();

router.use("/sessions", sessionsRoutes);
router.use("/notes", notesRoutes);
router.use("/queries", queriesRoutes);
router.use("/papers", papersRoutes);
router.use("/sandbox", sandboxRoutes);
router.use("/compare-sessions", compareRoutes);
router.use("/subscribe-digest", digestRoutes);
router.use("/", searchRoutes); // Mounts /academic/search, /openalex/search, /arxiv/search, /search/all

export default router;
