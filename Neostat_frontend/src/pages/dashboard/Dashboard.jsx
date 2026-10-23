
import { useCallback, useEffect, useState } from "react";

import {
  FolderKanban,
  CheckCircle2,
  Clock3,
  ListTodo,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getDashboardSummary } from "../../service/dashboardService";

const initialStats = {
  totalProjects: 0,
  activeTasks: 0,
  completedTasks: 0,
  pendingTasks: 0,
};

const Dashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async (isManual = false) => {
    try {
      if (isManual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      // Fetch dashboard statistics from the backend
      const result = await getDashboardSummary();

      if (!result?.success || !result?.data) {
        throw new Error(
          result?.message || "Invalid dashboard response."
        );
      }

      const dashboardData = result.data;

      // Set values received from the backend
      setStats({
        totalProjects: Number(dashboardData.totalProjects ?? 0),
        activeTasks: Number(dashboardData.activeTasks ?? 0),
        completedTasks: Number(dashboardData.completedTasks ?? 0),
        pendingTasks: Number(dashboardData.pendingTasks ?? 0),
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchDashboard(true);
      }
    };

    const handleDashboardRefresh = () => {
      fetchDashboard(true);
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener(
      "dashboard:refresh",
      handleDashboardRefresh
    );

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchDashboard(true);
      }
    }, 30000);

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.removeEventListener(
        "dashboard:refresh",
        handleDashboardRefresh
      );

      clearInterval(interval);
    };
  }, [fetchDashboard]);

  const statCards = [
    {
      title: "Total Projects",
      value: stats.totalProjects,
      icon: FolderKanban,
      description: "Projects in your workspace",
    },
    {
      title: "Active Tasks",
      value: stats.activeTasks,
      icon: ListTodo,
      description: "Tasks currently in progress",
    },
    {
      title: "Completed Tasks",
      value: stats.completedTasks,
      icon: CheckCircle2,
      description: "Tasks successfully completed",
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks,
      icon: Clock3,
      description: "Tasks waiting to be started",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-slate-400">
            Overview
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white">
            Welcome back, {user?.fullName || "User"}
          </h1>

          <p className="mt-3 text-slate-400">
            Here is your project workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0"
          />

          <div>
            <p className="font-medium">
              Unable to load dashboard
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>

            <button
              type="button"
              onClick={() => fetchDashboard(true)}
              className="mt-3 text-sm font-semibold underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Statistics from backend */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  {stat.title}
                </p>

                <div className="rounded-xl bg-slate-800 p-3 text-blue-400">
                  <Icon size={22} />
                </div>
              </div>

              <h2 className="mt-6 text-3xl font-bold text-white">
                {loading ? (
                  <span className="inline-block h-9 w-12 animate-pulse rounded bg-slate-800" />
                ) : (
                  stat.value
                )}
              </h2>

              <p className="mt-2 text-xs text-slate-500">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Workspace section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <h2 className="text-xl font-semibold text-white">
          Your workspace
        </h2>

        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
          Your project and task statistics are fetched from
          your workspace. Create projects, manage tasks, and
          track your progress as your team works.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
