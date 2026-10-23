import mongoose from "mongoose";

const projectMemberSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["MANAGER", "MEMBER", "VIEWER"],
      default: "MEMBER",
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// A user can only be a member of a project once.
projectMemberSchema.index(
  { project: 1, user: 1 },
  { unique: true }
);

projectMemberSchema.index({ user: 1, project: 1 });

const ProjectMember = mongoose.model(
  "ProjectMember",
  projectMemberSchema
);

export default ProjectMember;