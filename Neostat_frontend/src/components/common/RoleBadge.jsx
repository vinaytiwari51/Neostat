import { formatRole } from "../../utils/projectConstants";

const roleStyles = {
  ADMIN: "bg-purple-100 text-purple-700",
  PROJECT_MANAGER: "bg-blue-100 text-blue-700",
  TEAM_MEMBER: "bg-emerald-100 text-emerald-700",
  VIEWER: "bg-slate-100 text-slate-700",

  MANAGER: "bg-blue-100 text-blue-700",
  MEMBER: "bg-emerald-100 text-emerald-700",
};

export default function RoleBadge({ role }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        roleStyles[role] || "bg-gray-100 text-gray-700"
      }`}
    >
      {formatRole(role)}
    </span>
  );
}