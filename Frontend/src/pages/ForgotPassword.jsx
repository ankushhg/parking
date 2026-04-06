import { useState, useEffect } from "react";
import API from "../services/api";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter token + new password
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => { document.title = "Reset Password — ParkFlow"; }, []);

  const handleForgot = async () => {
    setError("");
    if (!email.trim()) return setError("Please enter your email.");
    setLoading(true);
    try {
      const res = await API.post("/auth/forgot-password", { email });
      // For demo: auto-fill the token from response
      setToken(res.data.resetToken);
      setStep(2);
    } catch (err) {
      setError(err.response?.data || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setError("");
    if (!token.trim()) return setError("Please enter the reset token.");
    if (!newPassword.trim()) return setError("Please enter a new password.");
    if (newPassword.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      await API.post("/auth/reset-password", { token, newPassword });
      setSuccess("Password reset successfully! Redirecting to login…");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data || "Reset failed. Token may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6efe5] flex flex-col">

      {/* Header */}
      <header className="w-full px-6 py-4">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 text-white font-black">P</div>
          <span className="font-semibold text-lg tracking-tight text-neutral-900">ParkFlow</span>
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          <div className="rounded-3xl bg-white/80 border border-black/5 shadow-xl shadow-black/5 p-8 sm:p-10">

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-8">
              {[1, 2].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition
                    ${step >= s ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-400"}`}>
                    {s}
                  </div>
                  {s < 2 && <div className={`h-px w-8 ${step > s ? "bg-neutral-950" : "bg-neutral-200"}`} />}
                </div>
              ))}
              <span className="ml-2 text-xs text-neutral-500 font-medium">
                {step === 1 ? "Enter your email" : "Set new password"}
              </span>
            </div>

            {/* Title */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-950">
                {step === 1 ? "Forgot password?" : "Reset your password"}
              </h1>
              <p className="mt-1.5 text-sm text-neutral-500">
                {step === 1
                  ? "Enter your email and we'll generate a reset token."
                  : "Enter the reset token and your new password."}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</div>
            )}

            {/* Success */}
            {success && (
              <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700">{success}</div>
            )}

            {/* Step 1 — Email */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Email address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleForgot()}
                    className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-neutral-950/20 transition placeholder:text-neutral-400"
                  />
                </div>
                <button
                  onClick={handleForgot}
                  disabled={loading}
                  className="w-full rounded-full bg-neutral-950 px-6 py-3 text-sm font-bold text-white! shadow-md shadow-black/20 hover:bg-neutral-800 transition disabled:opacity-60"
                >
                  {loading ? "Sending…" : "Get reset token"}
                </button>
              </div>
            )}

            {/* Step 2 — Token + New Password */}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Reset token</label>
                  <input
                    type="text"
                    placeholder="Paste your reset token"
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-neutral-950/20 transition placeholder:text-neutral-400 font-mono"
                  />
                  <p className="mt-1.5 text-xs text-emerald-600 font-medium">✓ Token auto-filled from response (demo mode)</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1.5">New password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleReset()}
                      className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 pr-11 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-neutral-950/20 transition placeholder:text-neutral-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition text-xs font-semibold"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="w-full rounded-full bg-neutral-950 px-6 py-3 text-sm font-bold text-white! shadow-md shadow-black/20 hover:bg-neutral-800 transition disabled:opacity-60"
                >
                  {loading ? "Resetting…" : "Reset password"}
                </button>
                <button onClick={() => { setStep(1); setError(""); }} className="text-xs text-neutral-400 hover:text-neutral-600 transition text-center">
                  ← Back to email
                </button>
              </div>
            )}

          </div>

          <p className="mt-6 text-center text-sm text-neutral-400">
            <Link to="/login" className="hover:text-neutral-600 transition">← Back to login</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
