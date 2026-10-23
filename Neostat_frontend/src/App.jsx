
// import { useEffect, useState } from "react";
// import AppRoutes from "./routes/AppRoutes";

// import {
//   Activity,
//   Database,
//   Server,
//   RefreshCw,
//   CheckCircle2,
//   XCircle
// } from "lucide-react";

// import toast, { Toaster } from "react-hot-toast";

// import api from "./api/axios";

// function App() {
//   const [health, setHealth] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const checkHealth = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const response = await api.get("/health");

//       setHealth(response.data);

//       toast.success("Backend connection successful");
//     } catch (err) {
//       setHealth(null);

//       const message =
//         err.response?.data?.message ||
//         err.message ||
//         "Unable to connect to backend";

//       setError(message);

//       toast.error(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     checkHealth();
//   }, []);

//   const isConnected =
//     health?.success === true &&
//     health?.database === "connected";

//   return (
//     <div className="min-h-screen bg-slate-950 text-white">
//       <Toaster position="top-right" />

//       <header className="border-b border-slate-800">
//         <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
//           <div className="flex items-center gap-3">
//             <div className="rounded-xl bg-blue-600 p-2">
//               <Activity size={22} />
//             </div>

//             <div>
//               <h1 className="text-lg font-bold">
//                 CollabFlow
//               </h1>

//               <p className="text-xs text-slate-400">
//                 Project Management Platform
//               </p>
//             </div>
//           </div>

//           <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
//             Development
//           </span>
//         </div>
//       </header>

//       <main className="mx-auto max-w-6xl px-6 py-16">
//         <div className="mb-10">
//           <p className="mb-3 text-sm font-medium uppercase tracking-widest text-blue-400">
//             Phase 1 · Project Setup
//           </p>

//           <h2 className="text-4xl font-bold tracking-tight">
//             System Status
//           </h2>

//           <p className="mt-3 max-w-xl text-slate-400">
//             Verify that your frontend, backend, and
//             local database are connected correctly.
//           </p>
//         </div>

//         <div className="grid gap-6 md:grid-cols-2">
//           <StatusCard
//             title="Express Backend"
//             icon={<Server size={24} />}
//             status={
//               health?.server === "running"
//                 ? "Running"
//                 : "Unavailable"
//             }
//             active={health?.server === "running"}
//           />

//           <StatusCard
//             title="MongoDB Database"
//             icon={<Database size={24} />}
//             status={
//               health?.database === "connected"
//                 ? "Connected"
//                 : "Disconnected"
//             }
//             active={health?.database === "connected"}
//           />
//         </div>

//         <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
//           <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <h3 className="text-lg font-semibold">
//                 API Connection
//               </h3>

//               <p className="mt-1 text-sm text-slate-400">
//                 GET /api/health
//               </p>
//             </div>

//             <button
//               onClick={checkHealth}
//               disabled={loading}
//               className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               <RefreshCw
//                 size={16}
//                 className={
//                   loading ? "animate-spin" : ""
//                 }
//               />

//               {loading
//                 ? "Checking..."
//                 : "Check Connection"}
//             </button>
//           </div>

//           {error && (
//             <div className="mt-5 rounded-xl border border-red-900 bg-red-950/50 p-4 text-sm text-red-300">
//               <div className="flex items-center gap-2">
//                 <XCircle size={18} />

//                 <span>{error}</span>
//               </div>
//             </div>
//           )}

//           {health && (
//             <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
//               <pre className="overflow-x-auto text-sm text-slate-300">
//                 {JSON.stringify(health, null, 2)}
//               </pre>
//             </div>
//           )}

//           {isConnected && (
//             <div className="mt-5 flex items-center gap-2 text-sm text-emerald-400">
//               <CheckCircle2 size={18} />

//               All systems are operational.
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }

// function StatusCard({
//   title,
//   icon,
//   status,
//   active
// }) {
//   return (
//     <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
//       <div className="flex items-center justify-between">
//         <div className="rounded-xl bg-slate-800 p-3 text-blue-400">
//           {icon}
//         </div>

//         {active ? (
//           <CheckCircle2
//             className="text-emerald-400"
//             size={22}
//           />
//         ) : (
//           <XCircle
//             className="text-red-400"
//             size={22}
//           />
//         )}
//       </div>

//       <h3 className="mt-6 text-lg font-semibold">
//         {title}
//       </h3>

//       <p
//         className={`mt-2 text-sm ${
//           active
//             ? "text-emerald-400"
//             : "text-red-400"
//         }`}
//       >
//         {status}
//       </p>
//     </div>
//   );
// }

// export default App;



import AppRoutes from "./routes/AppRoutes";

function App() {
  return <AppRoutes />;
}

export default App;
