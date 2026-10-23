import { Router } from "express";

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

import {
  loadProject,
  requireProjectAccess,
  requireProjectManager,
} from "../middleware/project.middleware.js";

import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  updateProjectMemberRole,
  removeProjectMember,
} from "../controllers/project.controller.js";

const router = Router();

router.use(protect);

// Project list and creation
router
  .route("/")
  .get(getProjects)
  .post(
    authorizeRoles("ADMIN", "PROJECT_MANAGER"),
    createProject
  );

// Project details
router
  .route("/:id")
  .get(loadProject, requireProjectAccess, getProjectById)
  .patch(
    loadProject,
    requireProjectAccess,
    requireProjectManager,
    updateProject
  )
  .delete(
    loadProject,
    requireProjectAccess,
    requireProjectManager,
    deleteProject
  );

// Project membership
router.post(
  "/:id/members",
  loadProject,
  requireProjectAccess,
  requireProjectManager,
  addProjectMember
);

router.patch(
  "/:id/members/:userId",
  loadProject,
  requireProjectAccess,
  requireProjectManager,
  updateProjectMemberRole
);

router.delete(
  "/:id/members/:userId",
  loadProject,
  requireProjectAccess,
  requireProjectManager,
  removeProjectMember
);

export default router;