
import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", (req, res) => {
  const databaseState =
    mongoose.connection.readyState;

  const databaseConnected = databaseState === 1;

  res.status(databaseConnected ? 200 : 503).json({
    success: databaseConnected,
    message: databaseConnected
      ? "Backend and database are running"
      : "Backend is running, but database is unavailable",
    server: "running",
    database: databaseConnected
      ? "connected"
      : "disconnected",
    timestamp: new Date().toISOString()
  });
});

export default router;
