import { useState, useEffect } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";

const ADMIN_EMAIL = "admin@parking.com";
const ADMIN_PASSWORD = "admin123";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { document.title = "Admin Login — ParkFlow"; }, []);

  const handleLogin = async () => {
    setError("");
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      setError("Invalid admin credentials.");
      return;
    }
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      window.location.href = "/admin";
    } catch (err) {
      setError(err.response?.data || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen bg-[#f6efe5] flex flex-col">

      {/* Header */}
      <header className="w-full px-6 py-4">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 text-white font-black">
            P
          </div>
          <span className="font-semibold text-lg tracking-tight text-neutral-900">ParkFlow</span>
        </Link>
      </header>

      {/* Main */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="rounded-3xl bg-white/80 border border-black/5 shadow-xl shadow-black/5 p-8 sm:p-10">

            {/* Title */}
            <div className="mb-8 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700 mb-4">
                Admin Access
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-950">Admin Sign in</h1>
              <p className="mt-1.5 text-sm text-neutral-500">Sign in with your admin credentials</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Fields */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="admin@parking.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-neutral-950/20 transition placeholder:text-neutral-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 pr-11 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-neutral-950/20 transition placeholder:text-neutral-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition text-xs font-semibold"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="mt-6 w-full rounded-full bg-neutral-950 px-6 py-3 text-sm font-bold text-white! shadow-md shadow-black/20 hover:bg-neutral-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

          </div>

          {/* Back link */}
          <p className="mt-6 text-center text-sm text-neutral-400">
            <Link to="/" className="hover:text-neutral-600 transition">← Back to home</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
