export const PROJECT_STATUSES = [
  { value: "PLANNING", label: "Planning" },
  { value: "ACTIVE", label: "Active" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ARCHIVED", label: "Archived" },
];

export const PROJECT_PRIORITIES = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

export const PROJECT_ROLES = [
  { value: "MANAGER", label: "Manager" },
  { value: "MEMBER", label: "Member" },
  { value: "VIEWER", label: "Viewer" },
];

export const canCreateProject = (workspaceRole) => {
  return ["ADMIN", "PROJECT_MANAGER"].includes(workspaceRole);
};

export const canManageProject = (project) => {
  return (
    project?.currentUserProjectRole === "MANAGER" ||
    project?.createdBy?._id === project?.currentUserId
  );
};

export const formatRole = (role = "") => {
  return role
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const formatDate = (date) => {
  if (!date) return "Not set";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};