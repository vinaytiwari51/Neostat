
import mongoose from "mongoose";

const workResponseSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    workTitle: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },

    message: {
      type: String,
      required: [true, "Feedback message is required"],
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  }
);

const WorkResponse = mongoose.model(
  "WorkResponse",
  workResponseSchema
);

export default WorkResponse;
