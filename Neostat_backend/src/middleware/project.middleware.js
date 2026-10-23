import mongoose from "mongoose";
import Project from "../models/Project.js";
import ProjectMember from "../models/ProjectMember.js";
import ApiError from "../utils/ApiError.js";

export const loadProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid project ID");
    }

    const project = await Project.findById(id).populate(
      "createdBy",
      "fullName email role isActive"
    );

    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    req.project = project;

    next();
  } catch (error) {
    next(error);
  }
};

export const requireProjectAccess = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();

    const isAdmin = req.user.role === "ADMIN";

    const isOwner =
      req.project.createdBy?._id?.toString() === userId;

    const membership = await ProjectMember.findOne({
      project: req.project._id,
      user: req.user._id,
    }).populate("user", "fullName email role isActive");

    if (!isAdmin && !isOwner && !membership) {
      throw new ApiError(
        403,
        "You do not have permission to access this project"
      );
    }

    req.projectMembership = membership;
    req.isProjectOwner = isOwner;
    req.isProjectAdmin = isAdmin;

    next();
  } catch (error) {
    next(error);
  }
};

export const requireProjectManager = (req, res, next) => {
  const isAdmin = req.isProjectAdmin;

  const isOwner = req.isProjectOwner;

  const isProjectManager =
    req.projectMembership?.role === "MANAGER";

  if (!isAdmin && !isOwner && !isProjectManager) {
    return next(
      new ApiError(
        403,
        "Only an Admin or Project Manager can manage this project"
      )
    );
  }

  next();
};