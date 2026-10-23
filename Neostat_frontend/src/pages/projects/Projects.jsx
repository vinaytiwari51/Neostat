
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  Plus,
  Search,
  CalendarDays,
  Users,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../../api/projects.api";

import ProjectForm from "../../components/projects/ProjectForm";
import RoleBadge from "../../components/common/RoleBadge";

import {
  PROJECT_STATUSES,
  PROJECT_PRIORITIES,
  canCreateProject,
  formatDate,
} from "../../utils/projectConstants";

// Project status styles
const statusStyles = {
  PLANNING: "bg-slate-800 text-slate-300",
  ACTIVE: "bg-emerald-950 text-emerald-400",
  ON_HOLD: "bg-amber-950 text-amber-400",
  COMPLETED: "bg-blue-950 text-blue-400",
  ARCHIVED: "bg-gray-800 text-gray-400",
};

// Project priority styles
const priorityStyles = {
  LOW: "text-slate-400",
  MEDIUM: "text-blue-400",
  HIGH: "text-orange-400",
  URGENT: "text-red-400",
};

// Common input styles
const inputStyles =
  "w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-gray-300 outline-none transition placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

// Common secondary button styles
const buttonStyles =
  "flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 font-medium text-gray-300 transition hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50";

export default function Projects() {
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);

  // Current page is kept separate from pagination metadata.
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    limit: 9,
    total: 0,
    totalPages: 0,
  });

  // Search and filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  // Loading states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Project form states
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Fetch projects from backend
  const fetchProjects = useCallback(
    async ({ showRefresh = false } = {}) => {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const result = await getProjects({
          page,
          limit: pagination.limit,
          search: search.trim() || undefined,
          status: status || undefined,
          priority: priority || undefined,
        });

        setProjects(result.projects || []);

        setPagination((current) => ({
          ...current,
          ...(result.pagination || {}),
        }));
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Unable to load projects"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, pagination.limit, search, status, priority]
  );

  // Fetch projects when page or filters change
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Open create project form
  const openCreateForm = () => {
    setEditingProject(null);
    setFormOpen(true);
  };

  // Open edit project form
  const openEditForm = (project) => {
    setEditingProject(project);
    setFormOpen(true);
  };

  // Create or update project
  const handleSaveProject = async (formData) => {
    setSubmitting(true);

    try {
      if (editingProject) {
        await updateProject(editingProject._id, formData);

        toast.success("Project updated successfully");
      } else {
        await createProject(formData);

        toast.success("Project created successfully");

        // Show the newly created project on the first page.
        setPage(1);
      }

      setFormOpen(false);
      setEditingProject(null);

      await fetchProjects();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          (editingProject
            ? "Unable to update project"
            : "Unable to create project")
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Delete project
  const handleDeleteProject = async (project) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteProject(project._id);

      toast.success("Project deleted successfully");

      // Move back if the last project on the current page was deleted.
      if (projects.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await fetchProjects();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to delete project"
      );
    }
  };

  // Reset pagination when filters change
  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    setPage(1);
  };

  const handlePriorityChange = (value) => {
    setPriority(value);
    setPage(1);
  };

  // User permissions
  const canCreate = canCreateProject(user?.role);

  const canManageProject = (project) =>
    user?.role === "ADMIN" ||
    project.currentUserProjectRole === "MANAGER";

  return (
    <div className="min-h-screen space-y-6 bg-slate-950 text-gray-300">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FolderKanban size={16} />

            Workspace

            <span>/</span>

            <span className="text-gray-300">
              Projects
            </span>
          </div>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-100">
            Projects
          </h1>

          <p className="mt-2 text-gray-400">
            Manage projects, track progress, and collaborate with your team.
          </p>
        </div>

        {/* Header actions */}
{/* Header actions */}
<div className="flex flex-wrap gap-3">
  {/* Refresh button */}
  <button
    type="button"
    onClick={() => fetchProjects({ showRefresh: true })}
    disabled={refreshing}
    className={buttonStyles}
  >
    <RefreshCw
      size={17}
      className={refreshing ? "animate-spin" : ""}
    />
    Refresh
  </button>

  {/* Create New Project button */}
  <button
    type="button"
    onClick={openCreateForm}
    className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 active:scale-95"
  >
    <Plus size={19} />
    Create New Project
  </button>
</div>
      </div>

      {/* Search and filters */}
      <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-3">

        {/* Search */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              handleSearchChange(event.target.value)
            }
            placeholder="Search projects..."
            className={`${inputStyles} pl-10`}
          />
        </div>

        {/* Status filter */}
        <select
          value={status}
          onChange={(event) =>
            handleStatusChange(event.target.value)
          }
          className={inputStyles}
        >
          <option value="">All statuses</option>

          {PROJECT_STATUSES.map((item) => (
            <option
              key={item.value}
              value={item.value}
              className="bg-slate-900 text-gray-300"
            >
              {item.label}
            </option>
          ))}
        </select>

        {/* Priority filter */}
        <select
          value={priority}
          onChange={(event) =>
            handlePriorityChange(event.target.value)
          }
          className={inputStyles}
        >
          <option value="">All priorities</option>

          {PROJECT_PRIORITIES.map((item) => (
            <option
              key={item.value}
              value={item.value}
              className="bg-slate-900 text-gray-300"
            >
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {/* Project list */}
      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-64 animate-pulse rounded-2xl border border-slate-800 bg-slate-900"
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        // Empty state
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 px-6 py-16 text-center">
          <FolderKanban
            size={40}
            className="mx-auto text-gray-600"
          />

          <h2 className="mt-4 text-lg font-semibold text-gray-200">
            No projects found
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            Try changing your filters or create a new project.
          </p>

          {/* Empty state create button */}
          {canCreate && (
            <button
              type="button"
              onClick={openCreateForm}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-500"
            >
              <Plus size={18} />

              Create Your First Project
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Project cards */}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <article
                key={project._id}
                className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-xl hover:shadow-black/20"
              >

                {/* Card header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-950 text-blue-400">
                    <FolderKanban size={22} />
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        statusStyles[project.status] ||
                        "bg-slate-800 text-gray-400"
                      }`}
                    >
                      {project.status?.replaceAll("_", " ")}
                    </span>

                    <RoleBadge
                      role={project.currentUserProjectRole}
                    />
                  </div>
                </div>

                {/* Project name */}
                <Link to={`/projects/${project._id}`}>
                  <h2 className="mt-5 line-clamp-1 text-lg font-bold text-gray-100 transition group-hover:text-blue-400">
                    {project.name}
                  </h2>
                </Link>

                {/* Project description */}
                <p className="mt-2 line-clamp-3 min-h-[60px] text-sm leading-6 text-gray-400">
                  {project.description ||
                    "No project description provided."}
                </p>

                {/* Project information */}
                <div className="mt-5 space-y-3 border-t border-slate-800 pt-4">

                  {/* Priority */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Priority
                    </span>

                    <span
                      className={`font-semibold ${
                        priorityStyles[project.priority] ||
                        "text-gray-400"
                      }`}
                    >
                      {project.priority || "N/A"}
                    </span>
                  </div>

                  {/* Due date */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-500">
                      <CalendarDays size={15} />

                      Due date
                    </span>

                    <span className="font-medium text-gray-300">
                      {formatDate(project.dueDate)}
                    </span>
                  </div>

                  {/* Team members */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-500">
                      <Users size={15} />

                      Team members
                    </span>

                    <span className="font-medium text-gray-300">
                      {project.memberCount || 0}
                    </span>
                  </div>
                </div>

                {/* Project manager and details */}
                <div className="mt-5 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">
                      Project manager
                    </p>

                    <p className="mt-1 truncate text-sm font-medium text-gray-300">
                      {project.createdBy?.fullName || "Unknown"}
                    </p>
                  </div>

                  <Link
                    to={`/projects/${project._id}`}
                    className="flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-gray-300 transition hover:bg-slate-700 hover:text-blue-400"
                  >
                    Details

                    <ArrowUpRight size={16} />
                  </Link>
                </div>

                {/* Edit and delete actions */}
                {canManageProject(project) && (
                  <div className="mt-4 flex gap-3 border-t border-slate-800 pt-4">

                    <button
                      type="button"
                      onClick={() => openEditForm(project)}
                      className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteProject(project)}
                      className="text-sm font-medium text-red-400 transition hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:flex-row">
            <p className="text-sm text-gray-400">
              Page {page} of {pagination.totalPages || 1}

              {" · "}

              {pagination.total} projects
            </p>

            <div className="flex gap-2">
              {/* Previous page */}
              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  setPage((current) => current - 1)
                }
                className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              {/* Next page */}
              <button
                type="button"
                disabled={
                  page >= (pagination.totalPages || 1)
                }
                onClick={() =>
                  setPage((current) => current + 1)
                }
                className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Create/Edit Project Modal */}
      {formOpen && (
        <ProjectForm
          project={editingProject}
          submitting={submitting}
          onClose={() => {
            setFormOpen(false);
            setEditingProject(null);
          }}
          onSubmit={handleSaveProject}
        />
      )}
    </div>
  );
}
