
import { LoaderCircle } from "lucide-react";

const LoadingScreen = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <LoaderCircle
          size={36}
          className="animate-spin text-blue-500"
        />

        <p className="text-sm text-slate-400">
          Verifying your session...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
