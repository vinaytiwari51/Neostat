
import User from "../models/User.js";
import Project from "../models/Project.js";
import ProjectMembership from "../models/ProjectMembership.js";
import WorkResponse from "../models/WorkResponse.js";

const canManageTeam = (user) => {
  return ["ADMIN", "PROJECT_MANAGER"].includes(user?.role);
};

// GET /api/projects/:projectId/team
export const getProjectTeam = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const memberships = await ProjectMembership.find({
      project: projectId,
    })
      .populate("user", "fullName email role isActive")
      .populate("addedBy", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: memberships.length,
      data: memberships,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/projects/:projectId/team
export const addProjectMember = async (req, res, next) => {
  try {
    if (!canManageTeam(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only admins and project managers can add members.",
      });
    }

    const { projectId } = req.params;
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Member email is required.",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No registered user found with this email.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "This user's account is disabled.",
      });
    }

    const existingMembership = await ProjectMembership.findOne({
      project: projectId,
      user: user._id,
    });

    if (existingMembership) {
      return res.status(409).json({
        success: false,
        message: "This user is already a member of the project.",
      });
    }

    const membership = await ProjectMembership.create({
      project: projectId,
      user: user._id,
      addedBy: req.user._id,
    });

    await membership.populate("user", "fullName email role isActive");
    await membership.populate("addedBy", "fullName email");

    return res.status(201).json({
      success: true,
      message: "Team member added successfully.",
      data: membership,
    });
  } catch (error) {
    // Handles the unique index if two requests add the same member at once.
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This user is already a member of the project.",
      });
    }

    next(error);
  }
};

// DELETE /api/projects/:projectId/team/:userId
export const removeProjectMember = async (req, res, next) => {
  try {
    if (!canManageTeam(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only admins and project managers can remove members.",
      });
    }

    const { projectId, userId } = req.params;

    const membership = await ProjectMembership.findOneAndDelete({
      project: projectId,
      user: userId,
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Member is not assigned to this project.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Member removed from this project successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/projects/:projectId/team/:userId/responses
export const addWorkResponse = async (req, res, next) => {
  try {
    if (!canManageTeam(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only admins and project managers can send work feedback.",
      });
    }

    const { projectId, userId } = req.params;
    const { workTitle, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Feedback message is required.",
      });
    }

    const membership = await ProjectMembership.findOne({
      project: projectId,
      user: userId,
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "This user is not a member of the project.",
      });
    }

    const response = await WorkResponse.create({
      project: projectId,
      member: userId,
      respondedBy: req.user._id,
      workTitle: workTitle?.trim() || "",
      message: message.trim(),
    });

    await response.populate("member", "fullName email");
    await response.populate("respondedBy", "fullName email");

    return res.status(201).json({
      success: true,
      message: "Work feedback added successfully.",
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/projects/:projectId/team/:userId/responses
export const getWorkResponses = async (req, res, next) => {
  try {
    const { projectId, userId } = req.params;

    const responses = await WorkResponse.find({
      project: projectId,
      member: userId,
    })
      .populate("member", "fullName email")
      .populate("respondedBy", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: responses.length,
      data: responses,
    });
  } catch (error) {
    next(error);
  }
};
