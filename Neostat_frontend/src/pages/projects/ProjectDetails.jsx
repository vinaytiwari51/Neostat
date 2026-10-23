import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Edit3,
  FolderKanban,
  Trash2,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";

import {
  getProjectById,
  updateProject,
  deleteProject,
} from "../../api/projects.api";

import ProjectForm from "../../components/projects/ProjectForm";
import RoleBadge from "../../components/common/RoleBadge";

import {
  formatDate,
  formatRole,
} from "../../utils/projectConstants";

const statusStyles = {
  PLANNING: "bg-slate-100 text-slate-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  ON_HOLD: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  ARCHIVED: "bg-gray-100 text-gray-600",
};

const priorityStyles = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchProject = useCallback(async () => {
    setLoading(true);

    try {
      const result = await getProjectById(id);

      setProject(result);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to load project details"
      );

      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const canManage =
    user?.role === "ADMIN" ||
    project?.currentUserProjectRole === "MANAGER";

  const handleUpdate = async (formData) => {
    setSubmitting(true);

    try {
      const updatedProject = await updateProject(id, formData);

      setProject(updatedProject);
      setFormOpen(false);

      toast.success("Project updated successfully");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${project.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteProject(id);

      toast.success("Project deleted successfully");

      navigate("/projects", { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to delete project"
      );
    }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-100" />
        <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-black p-10 text-center">
        <FolderKanban
          size={40}
          className="mx-auto text-slate-300"
        />

        <h2 className="mt-4 text-xl font-bold text-slate-900">
          Project not found
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          This project may have been deleted or you may not have access.
        </p>

        <Link
          to="/projects"
          className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white"
        >
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link
          to="/projects"
          className="hover:text-blue-600"
        >
          Projects
        </Link>

        <span>/</span>

        <span className="font-medium text-gray-300">
          {project.name}
        </span>
      </div>

      {/* Project header */}
      <section className="rounded-2xl border border-black bg-black p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <FolderKanban size={26} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    statusStyles[project.status]
                  }`}
                >
                  {formatRole(project.status)}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    priorityStyles[project.priority]
                  }`}
                >
                  {formatRole(project.priority)} priority
                </span>
              </div>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-300">
                {project.name}
              </h1>

              <p className="mt-2 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-slate-500">
                {project.description ||
                  "No description has been added to this project."}
              </p>
            </div>
          </div>

          {canManage && (
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => setFormOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-50"
              >
                <Edit3 size={16} />
                Edit
              </button>

              <button
                onClick={handleDelete}
                className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Project metadata */}
        <div className="mt-7 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Project manager
            </p>

            <p className="mt-2 font-semibold text-slate-300">
              {project.createdBy?.fullName || "Unknown"}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              {project.createdBy?.email || ""}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Your project role
            </p>

            <div className="mt-2">
              <RoleBadge role={project.currentUserProjectRole} />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Start date
            </p>

            <p className="mt-2 flex items-center gap-2 font-semibold text-slate-300">
              <CalendarDays size={16} className="text-slate-400" />
              {formatDate(project.startDate)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Due date
            </p>

            <p className="mt-2 flex items-center gap-2 font-semibold text-slate-900">
              <Clock3 size={16} className="text-slate-400" />
              {formatDate(project.dueDate)}
            </p>
          </div>
        </div>
      </section>

      {/* Project navigation */}
      <div className="flex flex-wrap gap-2">
        <Link
          to={`/projects/${id}`}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-black"
        >
          Overview
        </Link>

        <Link
          to={`/projects/${id}/tasks`}
          className="rounded-xl border border-slate-200 bg-black px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-50"
        >
          Tasks
        </Link>

        <Link
          to={`/projects/${id}/team`}
          className="rounded-xl border border-slate-200 bg-black px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-50"
        >
          Team
        </Link>
      </div>

      {/* Project overview */}
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-black p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Users size={20} />
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Project team
              </p>

              <p className="text-2xl font-bold text-slate-300">
                {project.memberCount || 0}
              </p>
            </div>
          </div>

          <Link
            to={`/projects/${id}/team`}
            className="mt-5 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View team members →
          </Link>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-black p-5">
          <p className="text-sm text-slate-500">
            Created on
          </p>

          <p className="mt-2 text-xl font-bold text-slate-300">
            {formatDate(project.createdAt)}
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Project creation date
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-black p-5">
          <p className="text-sm text-slate-400">
            Last updated
          </p>

          <p className="mt-2 text-xl font-bold text-slate-300">
            {formatDate(project.updatedAt)}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Latest project modification
          </p>
        </section>
      </div>

      {/* Team preview */}
      <section className="rounded-2xl border border-slate-200 bg-black">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="text-lg font-bold text-slate-400">
              Project team
            </h2>

            <p className="mt-1 text-sm text-slate-300">
              People collaborating on this project and their roles.
            </p>
          </div>

          <Link
            to={`/projects/${id}/team`}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View all
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {project.members?.length ? (
            project.members.map((membership) => (
              <div
                key={membership._id}
                className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600">
                    {membership.user?.fullName
                      ?.split(" ")
                      .map((word) => word[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "U"}
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900">
                      {membership.user?.fullName || "Unknown user"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {membership.user?.email || ""}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <RoleBadge role={membership.user?.role} />

                  <span className="text-xs text-slate-400">
                    Workspace role
                  </span>

                  <RoleBadge role={membership.role} />

                  <span className="text-xs text-slate-400">
                    Project role
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-slate-500">
              No team members have been added.
            </div>
          )}
        </div>
      </section>

      {formOpen && (
        <ProjectForm
          project={project}
          submitting={submitting}
          onClose={() => setFormOpen(false)}
          onSubmit={handleUpdate}
        />
      )}
    </div>
  );
}