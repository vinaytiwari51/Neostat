
import { useState } from "react";

import {
  Activity,
  LayoutDashboard,
  FolderKanban,
  Users,
  UserCircle,
  LogOut,
  Menu,
  X,
  ShieldCheck
} from "lucide-react";

import {
  NavLink,
  Outlet,
  useNavigate
} from "react-router-dom";


import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";

const DashboardLayout = () => {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const handleLogout = async () => {
    await logout();

    toast.success("Logged out successfully");

    navigate("/login", {
      replace: true
    });
  };

  const navigation = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard
    },
    {
      name: "Projects",
      path: "/projects",
      icon: FolderKanban
    },
    {
      name: "Profile",
      path: "/profile",
      icon: UserCircle
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Mobile header */}
      <header className="flex items-center justify-between border-b border-slate-800 px-5 py-4 lg:hidden">
        <div className="flex items-center gap-3">
          <Activity className="text-blue-500" />

          <span className="font-bold">
            CollabFlow
          </span>
        </div>

        <button
          onClick={() =>
            setMobileMenuOpen((previous) => !previous)
          }
          className="rounded-lg p-2 hover:bg-slate-800"
        >
          {mobileMenuOpen ? (
            <X size={22} />
          ) : (
            <Menu size={22} />
          )}
        </button>
      </header>

      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-800 bg-slate-950 p-5 transition-transform lg:static lg:translate-x-0 ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >
          <div className="mb-10 hidden items-center gap-3 lg:flex">
            <div className="rounded-xl bg-blue-600 p-2">
              <Activity size={22} />
            </div>

            <span className="text-lg font-bold">
              CollabFlow
            </span>
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:bg-slate-900 hover:text-white"
                    }`
                  }
                >
                  <Icon size={19} />

                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          <div className="absolute bottom-5 left-5 right-5">
            <div className="mb-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
              <p className="truncate text-sm font-semibold">
                {user?.fullName}
              </p>

              <p className="mt-1 truncate text-xs text-slate-400">
                {user?.email}
              </p>

              <span className="mt-3 inline-block rounded-full bg-blue-950 px-3 py-1 text-xs font-medium text-blue-400">
                {user?.role?.replace("_", " ")}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-red-950 hover:text-red-400"
            >
              <LogOut size={19} />

              Logout
            </button>
          </div>
        </aside>
        {/* Main content */}
        <main className="min-w-0 flex-1 p-5 sm:p-8">
          <Outlet />
        </main>
      </div>

      {mobileMenuOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
        />
      )}
    </div>
  );
};

export default DashboardLayout;
