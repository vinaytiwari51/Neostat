import mongoose from "mongoose";

import Project from "../models/Project.js";
import ProjectMember from "../models/ProjectMember.js";
import User from "../models/User.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const PROJECT_STATUSES = [
  "PLANNING",
  "ACTIVE",
  "ON_HOLD",
  "COMPLETED",
  "ARCHIVED",
];

const PROJECT_PRIORITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];

const PROJECT_ROLES = ["MANAGER", "MEMBER", "VIEWER"];

const getCurrentProjectRole = async (project, user) => {
  if (user.role === "ADMIN") {
    return "MANAGER";
  }

  if (project.createdBy?._id?.toString() === user._id.toString()) {
    return "MANAGER";
  }

  const membership = await ProjectMember.findOne({
    project: project._id,
    user: user._id,
  });

  return membership?.role || null;
};

const serializeProject = async (project, user) => {
  const [members, currentUserProjectRole] = await Promise.all([
    ProjectMember.find({ project: project._id })
      .populate("user", "fullName email role isActive")
      .sort({ joinedAt: 1 }),

    getCurrentProjectRole(project, user),
  ]);

  return {
    _id: project._id,
    name: project.name,
    description: project.description,
    status: project.status,
    priority: project.priority,
    startDate: project.startDate,
    dueDate: project.dueDate,
    createdBy: project.createdBy,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,

    currentUserProjectRole,

    members: members.map((membership) => ({
      _id: membership._id,
      user: membership.user,
      role: membership.role,
      joinedAt: membership.joinedAt,
    })),

    memberCount: members.length,
  };
};

const validateDates = (startDate, dueDate) => {
  if (
    startDate &&
    dueDate &&
    new Date(dueDate) < new Date(startDate)
  ) {
    throw new ApiError(400, "Due date cannot be before start date");
  }

  if (startDate && Number.isNaN(new Date(startDate).getTime())) {
    throw new ApiError(400, "Invalid start date");
  }

  if (dueDate && Number.isNaN(new Date(dueDate).getTime())) {
    throw new ApiError(400, "Invalid due date");
  }
};

// GET /api/projects
export const getProjects = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.user.role !== "ADMIN") {
      const memberships = await ProjectMember.find({
        user: req.user._id,
      }).select("project");

      const projectIds = memberships.map(
        (membership) => membership.project
      );

      filter.$or = [
        { createdBy: req.user._id },
        { _id: { $in: projectIds } },
      ];
    }

    if (req.query.status) {
      if (!PROJECT_STATUSES.includes(req.query.status)) {
        throw new ApiError(400, "Invalid project status");
      }

      filter.status = req.query.status;
    }

    if (req.query.priority) {
      if (!PROJECT_PRIORITIES.includes(req.query.priority)) {
        throw new ApiError(400, "Invalid project priority");
      }

      filter.priority = req.query.priority;
    }

    if (req.query.search) {
      const search = req.query.search.trim();

      if (search.length > 100) {
        throw new ApiError(400, "Search query is too long");
      }

      filter.$and = [
        ...(filter.$and || []),
        {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        },
      ];
    }

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate("createdBy", "fullName email role isActive")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),

      Project.countDocuments(filter),
    ]);

    const serializedProjects = await Promise.all(
      projects.map((project) => serializeProject(project, req.user))
    );

    res.status(200).json(
      new ApiResponse(
        200,
        {
          projects: serializedProjects,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
        "Projects fetched successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/projects
export const createProject = async (req, res, next) => {
  try {
    const {
      name,
      description = "",
      status = "PLANNING",
      priority = "MEDIUM",
      startDate = null,
      dueDate = null,
    } = req.body;

    if (typeof name !== "string" || name.trim().length < 2) {
      throw new ApiError(
        400,
        "Project name must contain at least 2 characters"
      );
    }

    if (name.trim().length > 120) {
      throw new ApiError(400, "Project name is too long");
    }

    if (!PROJECT_STATUSES.includes(status)) {
      throw new ApiError(400, "Invalid project status");
    }

    if (!PROJECT_PRIORITIES.includes(priority)) {
      throw new ApiError(400, "Invalid project priority");
    }

    validateDates(startDate, dueDate);

    const project = await Project.create({
      name: name.trim(),
      description: description.trim(),
      status,
      priority,
      startDate: startDate || null,
      dueDate: dueDate || null,
      createdBy: req.user._id,
    });

    // Project creator is automatically the project manager.
    await ProjectMember.create({
      project: project._id,
      user: req.user._id,
      role: "MANAGER",
    });

    const populatedProject = await Project.findById(project._id)
      .populate("createdBy", "fullName email role isActive");

    const result = await serializeProject(populatedProject, req.user);

    res.status(201).json(
      new ApiResponse(
        201,
        { project: result },
        "Project created successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/projects/:id
export const getProjectById = async (req, res, next) => {
  try {
    const project = await serializeProject(req.project, req.user);

    res.status(200).json(
      new ApiResponse(
        200,
        { project },
        "Project details fetched successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

// PATCH /api/projects/:id
export const updateProject = async (req, res, next) => {
  try {
    const allowedFields = [
      "name",
      "description",
      "status",
      "priority",
      "startDate",
      "dueDate",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (
      updates.name !== undefined &&
      (typeof updates.name !== "string" ||
        updates.name.trim().length < 2 ||
        updates.name.trim().length > 120)
    ) {
      throw new ApiError(400, "Invalid project name");
    }

    if (updates.description !== undefined) {
      if (
        typeof updates.description !== "string" ||
        updates.description.length > 2000
      ) {
        throw new ApiError(400, "Invalid project description");
      }
    }

    if (
      updates.status !== undefined &&
      !PROJECT_STATUSES.includes(updates.status)
    ) {
      throw new ApiError(400, "Invalid project status");
    }

    if (
      updates.priority !== undefined &&
      !PROJECT_PRIORITIES.includes(updates.priority)
    ) {
      throw new ApiError(400, "Invalid project priority");
    }

    if (updates.name) {
      updates.name = updates.name.trim();
    }

    if (updates.description !== undefined) {
      updates.description = updates.description.trim();
    }

    const startDate = updates.startDate ?? req.project.startDate;
    const dueDate = updates.dueDate ?? req.project.dueDate;

    validateDates(startDate, dueDate);

    Object.assign(req.project, updates);

    await req.project.save();

    const project = await Project.findById(req.project._id)
      .populate("createdBy", "fullName email role isActive");

    const result = await serializeProject(project, req.user);

    res.status(200).json(
      new ApiResponse(
        200,
        { project: result },
        "Project updated successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

// DELETE /api/projects/:id
export const deleteProject = async (req, res, next) => {
  try {
    // Remove memberships as part of project deletion.
    await ProjectMember.deleteMany({
      project: req.project._id,
    });

    await Project.findByIdAndDelete(req.project._id);

    res.status(200).json(
      new ApiResponse(200, {}, "Project deleted successfully")
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/projects/:id/members
export const addProjectMember = async (req, res, next) => {
  try {
    const { userId, role = "MEMBER" } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid user ID");
    }

    if (!PROJECT_ROLES.includes(role)) {
      throw new ApiError(400, "Invalid project role");
    }

    const user = await User.findById(userId);

    if (!user || !user.isActive) {
      throw new ApiError(404, "Active user not found");
    }

    const existingMembership = await ProjectMember.findOne({
      project: req.project._id,
      user: user._id,
    });

    if (existingMembership) {
      throw new ApiError(409, "User is already a project member");
    }

    await ProjectMember.create({
      project: req.project._id,
      user: user._id,
      role,
    });

    const project = await Project.findById(req.project._id)
      .populate("createdBy", "fullName email role isActive");

    const result = await serializeProject(project, req.user);

    res.status(201).json(
      new ApiResponse(
        201,
        { project: result },
        "Project member added successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

// PATCH /api/projects/:id/members/:userId
export const updateProjectMemberRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!PROJECT_ROLES.includes(role)) {
      throw new ApiError(400, "Invalid project role");
    }

    const membership = await ProjectMember.findOne({
      project: req.project._id,
      user: userId,
    });

    if (!membership) {
      throw new ApiError(404, "Project member not found");
    }

    if (
      membership.user.toString() ===
      req.project.createdBy._id.toString()
    ) {
      throw new ApiError(
        400,
        "The project creator's role cannot be changed"
      );
    }

    membership.role = role;

    await membership.save();

    const project = await Project.findById(req.project._id)
      .populate("createdBy", "fullName email role isActive");

    const result = await serializeProject(project, req.user);

    res.status(200).json(
      new ApiResponse(
        200,
        { project: result },
        "Project member role updated successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

// DELETE /api/projects/:id/members/:userId
export const removeProjectMember = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (
      req.project.createdBy._id.toString() === userId
    ) {
      throw new ApiError(
        400,
        "The project creator cannot be removed"
      );
    }

    const membership = await ProjectMember.findOneAndDelete({
      project: req.project._id,
      user: userId,
    });

    if (!membership) {
      throw new ApiError(404, "Project member not found");
    }

    res.status(200).json(
      new ApiResponse(200, {}, "Project member removed successfully")
    );
  } catch (error) {
    next(error);
  }
};