import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import healthRoutes from "./src/routes/health.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import projectRoutes from "./src/routes/project.routes.js";
import teamRoutes from "./src/routes/team.routes.js";
import dashboardRoutes from "./src/routes/dashboard.routes.js";
import profileRoutes from "./src/routes/profile.routes.js";


import {
  notFound,
  errorHandler,
} from "./src/middleware/error.middleware.js";

const app = express();

// Security headers
app.use(helmet());


app.use(cors());

// Request logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}
app.set("etag", false);

// Parse JSON request bodies
app.use(express.json({ limit: "10kb" }));

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CollabFlow backend is running",
  });
});

// API routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api", teamRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);

// 404 and error handling must come after API routes.
app.use(notFound);
app.use(errorHandler);

export default app;