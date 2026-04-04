import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function NotFound() {
  useEffect(() => { document.title = "404 Not Found — ParkFlow"; }, []);
  return (
    <div className="min-h-screen bg-[#f6efe5] text-neutral-900 flex flex-col">

      {/* Header */}
      <header className="w-full px-6 py-4">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 text-white font-black">
            P
          </div>
          <span className="font-semibold text-lg tracking-tight">ParkFlow</span>
        </Link>
      </header>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-neutral-950 text-white font-black text-4xl mb-6">
          ?
        </div>
        <h1 className="text-6xl font-black tracking-tight text-neutral-950">404</h1>
        <p className="mt-3 text-lg font-semibold text-neutral-700">Page not found</p>
        <p className="mt-2 max-w-sm text-sm text-neutral-500 leading-6">
          Looks like this spot doesn't exist. It may have been moved or the URL might be wrong.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            to="/"
            className="rounded-full bg-neutral-950 px-6 py-3 text-sm font-bold text-white! shadow-md shadow-black/20 hover:bg-neutral-800 transition"
          >
            Back to home
          </Link>
          <Link
            to="/dashboard"
            className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold hover:bg-neutral-50 transition"
          >
            My dashboard
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-neutral-400">
        © {new Date().getFullYear()} ParkFlow. All rights reserved.
      </footer>

    </div>
  );
}
