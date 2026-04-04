import { useState, useEffect } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

const rules = [
  { id: "length",  label: "At least 8 characters",        test: (p) => p.length >= 8 },
  { id: "upper",   label: "One uppercase letter (A-Z)",    test: (p) => /[A-Z]/.test(p) },
  { id: "lower",   label: "One lowercase letter (a-z)",    test: (p) => /[a-z]/.test(p) },
  { id: "number",  label: "One number (0-9)",              test: (p) => /[0-9]/.test(p) },
  { id: "special", label: "One special character (!@#$…)", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { document.title = "Create account — ParkFlow"; }, []);

  const passed = rules.filter((r) => r.test(password));
  const allPassed = passed.length === rules.length;
  const strength = passed.length;

  const strengthLabel = ["", "Weak", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-red-400", "bg-amber-400", "bg-amber-400", "bg-emerald-500"][strength];

  const handleRegister = async () => {
    setTouched(true);
    if (!allPassed) return;
    setError("");
    setLoading(true);
    try {
      await API.post("/auth/register", { name, email, password });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleRegister();
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
              <h1 className="text-2xl font-bold tracking-tight text-neutral-950">Create an account</h1>
              <p className="mt-1.5 text-sm text-neutral-500">Start parking smarter with ParkFlow</p>
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
                <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Full name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-neutral-950/20 transition placeholder:text-neutral-400"
                />
              </div>

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
                <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setTouched(true); }}
                    onKeyDown={handleKeyDown}
                    className={`w-full rounded-xl border bg-white px-4 py-3 pr-11 text-sm text-neutral-900 outline-none focus:ring-2 transition placeholder:text-neutral-400
                      ${touched && !allPassed ? "border-red-300 focus:ring-red-200" : "border-black/10 focus:ring-neutral-950/20"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition text-xs font-semibold"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {/* Strength bar */}
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {Array(5).fill(0).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strength ? strengthColor : "bg-neutral-100"}`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-semibold ${
                      strength <= 2 ? "text-red-500" : strength <= 3 ? "text-amber-500" : "text-emerald-600"
                    }`}>{strengthLabel}</p>
                  </div>
                )}

                {/* Rules checklist */}
                {(touched || password.length > 0) && (
                  <ul className="mt-3 flex flex-col gap-1.5">
                    {rules.map((r) => {
                      const ok = r.test(password);
                      return (
                        <li key={r.id} className={`flex items-center gap-2 text-xs ${ok ? "text-emerald-600" : "text-neutral-400"}`}>
                          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold
                            ${ok ? "bg-emerald-100 text-emerald-600" : "bg-neutral-100 text-neutral-400"}`}>
                            {ok ? "✓" : "·"}
                          </span>
                          {r.label}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleRegister}
              disabled={loading}
              className="mt-6 w-full rounded-full bg-neutral-950 px-6 py-3 text-sm font-bold text-white! shadow-md shadow-black/20 hover:bg-neutral-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-black/8" />
              <span className="text-xs text-neutral-400">or</span>
              <div className="h-px flex-1 bg-black/8" />
            </div>

            {/* Login link */}
            <p className="text-center text-sm text-neutral-500">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-neutral-950 hover:underline">
                Sign in
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
