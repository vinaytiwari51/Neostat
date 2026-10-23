
import mongoose from "mongoose";

const projectMembershipSchema = new mongoose.Schema(
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

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// A user can only be assigned once to a specific project.
projectMembershipSchema.index(
  { project: 1, user: 1 },
  { unique: true }
);

const ProjectMembership = mongoose.model(
  "ProjectMembership",
  projectMembershipSchema
);

export default ProjectMembership;
