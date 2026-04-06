import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import "dotenv/config";

import apiRoutes from "./routes/index";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Mount API routes FIRST
app.use("/api", apiRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve built frontend static files
const distPath = path.join(process.cwd(), "dist");
app.use(express.static(distPath));

// Wildcard route for SPA routing (must be AFTER API routes)
app.get("*", (req, res) => {
  const indexPath = path.join(distPath, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Frontend build not found. Please run 'npm run build' to generate the dist folder.");
  }
});

app.listen(PORT as number, "0.0.0.0", () => {
  console.log(`Full-stack Server running on http://0.0.0.0:${PORT}`);
});
