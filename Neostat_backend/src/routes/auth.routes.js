import { Router } from "express";

import {
  signup,
  login,
  getCurrentUser,
  logout,
} from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected routes
router.get("/me", protect, getCurrentUser);
router.post("/logout", protect, logout);

export default router;