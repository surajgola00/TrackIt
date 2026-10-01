import express from "express";
import axios from "axios";

const app = express();
const REAL_API_BASE = "https://kaluajee.pythonanywhere.com";

app.use(express.json());

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

export default app;
