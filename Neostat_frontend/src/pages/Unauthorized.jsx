
import { Link } from "react-router-dom";

import { ShieldAlert } from "lucide-react";

const Unauthorized = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="max-w-md text-center">
        <ShieldAlert
          size={56}
          className="mx-auto text-red-400"
        />

        <h1 className="mt-6 text-3xl font-bold">
          Access denied
        </h1>

        <p className="mt-4 text-slate-400">
          You do not have permission to access
          this resource.
        </p>

        <Link
          to="/dashboard"
          className="mt-8 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold transition hover:bg-blue-500"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
