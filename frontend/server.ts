import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REAL_API_BASE = "https://kaluajee.pythonanywhere.com";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Proxy Routes
  
  // 1. Get Full Session
  app.get("/api/tracking/session/:bus_id", async (req, res) => {
    try {
      const response = await axios.get(`${REAL_API_BASE}/tracking/session/${req.params.bus_id}`);
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching session from real API:", error);
      res.status(500).json({ error: "Failed to fetch session from upstream" });
    }
  });

  // 2. Get Incremental Updates
  app.get("/api/location/updates", async (req, res) => {
    try {
      const { bus_id, since } = req.query;
      const response = await axios.get(`${REAL_API_BASE}/location/updates`, {
        params: { bus_id, since }
      });
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching updates from real API:", error);
      res.status(500).json({ error: "Failed to fetch updates from upstream" });
    }
  });

  // 3. Reset Session
  app.post("/api/tracking/reset", async (req, res) => {
    try {
      const response = await axios.post(`${REAL_API_BASE}/tracking/reset`, req.body);
      res.json(response.data);
    } catch (error) {
      console.error("Error resetting session on real API:", error);
      res.status(500).json({ error: "Failed to reset session on upstream" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
