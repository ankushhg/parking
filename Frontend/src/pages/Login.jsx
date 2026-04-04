import { useState, useEffect } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => { document.title = "Sign in — ParkFlow"; }, []);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      window.location.href = res.data.role === "ADMIN" ? "/admin" : "/dashboard";
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
              <h1 className="text-2xl font-bold tracking-tight text-neutral-950">Welcome back</h1>
              <p className="mt-1.5 text-sm text-neutral-500">Sign in to your ParkFlow account</p>
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
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-neutral-950/20 transition placeholder:text-neutral-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-neutral-500">Password</label>
                </div>
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

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-black/8" />
              <span className="text-xs text-neutral-400">or</span>
              <div className="h-px flex-1 bg-black/8" />
            </div>

            {/* Register link */}
            <p className="text-center text-sm text-neutral-500">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-neutral-950 hover:underline">
                Create one
              </Link>
            </p>
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
