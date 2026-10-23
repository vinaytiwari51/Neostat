
import ProjectMembership from "../models/ProjectMembership.js";
import Task from "../models/Task.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // Count projects where the logged-in user is a member
    const totalProjects = await ProjectMembership.countDocuments({
      user: userId,
    });

    // Count tasks assigned to the logged-in user
    const [activeTasks, completedTasks, pendingTasks] =
      await Promise.all([
        Task.countDocuments({
          assignedTo: userId,
          status: "IN_PROGRESS",
        }),

        Task.countDocuments({
          assignedTo: userId,
          status: "COMPLETED",
        }),

        Task.countDocuments({
          assignedTo: userId,
          status: "TODO",
        }),
      ]);

    return res.status(200).json({
      success: true,
      message: "Dashboard summary fetched successfully.",
      data: {
        totalProjects,
        activeTasks,
        completedTasks,
        pendingTasks,
      },
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch dashboard summary.",
    });
  }
};
