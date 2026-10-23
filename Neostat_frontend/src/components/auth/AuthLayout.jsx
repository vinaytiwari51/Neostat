
import {
  Activity,
  ShieldCheck,
  Users,
  CheckCircle2
} from "lucide-react";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Left side */}
        <div className="hidden flex-col justify-between border-r border-slate-800 p-12 lg:flex">

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-3">
              <Activity size={24} />
            </div>

            <div>
              <h1 className="text-xl font-bold">
                CollabFlow
              </h1>

              <p className="text-sm text-slate-400">
                Project Management Platform
              </p>
            </div>
          </div>

          <div className="max-w-lg">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-blue-400">
              Work together
            </p>

            <h2 className="text-5xl font-bold leading-tight">
              Bring your team
              <span className="text-blue-500">
                {" "}together.
              </span>
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-400">
              Organize projects, manage tasks,
              collaborate with your team, and
              keep every project moving forward.
            </p>

            <div className="mt-10 space-y-4">
              <Feature
                icon={<Users size={20} />}
                text="Collaborate with your team"
              />

              <Feature
                icon={<CheckCircle2 size={20} />}
                text="Track project progress"
              />

              <Feature
                icon={<ShieldCheck size={20} />}
                text="Role-based access control"
              />
            </div>
          </div>

          <p className="text-sm text-slate-500">
            Collaborative Project Management Platform
          </p>
        </div>

        {/* Right side */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="rounded-xl bg-blue-600 p-2">
                <Activity size={22} />
              </div>

              <span className="text-xl font-bold">
                CollabFlow
              </span>
            </div>

            {children}
          </div>
        </div>

      </div>
    </div>
  );
};

const Feature = ({ icon, text }) => {
  return (
    <div className="flex items-center gap-3 text-slate-300">
      <div className="text-blue-400">
        {icon}
      </div>

      <span>{text}</span>
    </div>
  );
};

export default AuthLayout;
