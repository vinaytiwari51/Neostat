
import express from "express";
import {protect} from "../middleware/auth.middleware.js";

import {
  getProjectTeam,
  addProjectMember,
  removeProjectMember,
  addWorkResponse,
  getWorkResponses,
} from "../controllers/team.controller.js";

const router = express.Router();

// All routes require a valid JWT.
router.use(protect);

// Project team
router.get("/projects/:projectId/team", getProjectTeam);

router.post(
  "/projects/:projectId/team",
  addProjectMember
);

router.delete(
  "/projects/:projectId/team/:userId",
  removeProjectMember
);

// Member work feedback
router.post(
  "/projects/:projectId/team/:userId/responses",
  addWorkResponse
);

router.get(
  "/projects/:projectId/team/:userId/responses",
  getWorkResponses
);

export default router;
