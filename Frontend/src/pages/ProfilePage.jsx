import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useToast } from "../components/Toast";
import { useTheme } from "../hooks/useTheme";

export default function ProfilePage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const toast = useToast();
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  const token = localStorage.getItem("token");
  const payload = token ? JSON.parse(atob(token.split(".")[1])) : {};
  const userName = payload.name || "User";
  const userEmail = payload.sub || "";

  useEffect(() => {
    document.title = "My Profile — ParkFlow";
    setNameInput(payload.name || "");
  }, []);

  const handleUpdateName = async () => {
    setNameError("");
    if (!nameInput.trim()) return setNameError("Name cannot be empty.");
    if (nameInput.trim() === userName) return;
    setNameLoading(true);
    try {
      const res = await API.put("/auth/update-name", { name: nameInput.trim() });
      localStorage.setItem("token", res.data.token);
      toast("Name updated!", "success");
      window.location.reload();
    } catch (err) {
      setNameError(err.response?.data || "Failed to update name.");
    } finally {
      setNameLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setError("");
    if (!currentPassword || !newPassword || !confirmPassword)
      return setError("All fields are required.");
    if (newPassword !== confirmPassword)
      return setError("New passwords do not match.");
    if (newPassword.length < 8)
      return setError("New password must be at least 8 characters.");
    setLoading(true);
    try {
      await API.post("/auth/change-password", { currentPassword, newPassword });
      toast("Password changed successfully!", "success");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#f6efe5] dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-neutral-900/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 w-full">
        <div className="flex items-center justify-between px-6 py-3 w-full">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-950 text-white font-black text-sm">P</div>
            <span className="font-bold text-base tracking-tight">ParkFlow</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 px-4 py-1.5 text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 transition">
              ← Dashboard
            </Link>
            <button onClick={toggle} className="rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 px-3 py-1.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 transition">
              {dark ? "☀️" : "🌙"}
            </button>
            <button onClick={logout} className="rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 px-4 py-1.5 text-sm font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950 dark:hover:text-red-400 transition">
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10 flex flex-col gap-6">

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-950">My Profile</h1>
          <p className="mt-1 text-sm text-neutral-500">View your account details and manage your password.</p>
        </div>

        {/* Account Info */}
        <div className="rounded-2xl bg-white/80 dark:bg-neutral-900 border border-black/5 dark:border-white/5 p-6 shadow-sm flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-neutral-950 text-white text-2xl font-black flex items-center justify-center shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-lg font-bold text-neutral-950 dark:text-white">{userName}</p>
            <p className="text-sm text-neutral-500">{userEmail}</p>
            <span className="mt-1 inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              Active account
            </span>
          </div>
        </div>

        {/* Update Name */}
        <div className="rounded-2xl bg-white/80 dark:bg-neutral-900 border border-black/5 dark:border-white/5 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-950 dark:text-white mb-5">Display Name</h2>
          {nameError && <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{nameError}</div>}
          <div className="flex gap-3 max-w-sm">
            <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleUpdateName()}
              placeholder="Your name"
              className="flex-1 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neutral-950/20 transition" />
            <button onClick={handleUpdateName} disabled={nameLoading || nameInput.trim() === userName}
              className="rounded-full bg-neutral-950 dark:bg-white px-5 py-2.5 text-sm font-bold text-white! dark:text-neutral-950 hover:bg-neutral-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {nameLoading ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="rounded-2xl bg-white/80 dark:bg-neutral-900 border border-black/5 dark:border-white/5 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-950 dark:text-white mb-5">Change Password</h2>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Current password</label>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neutral-950/20 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1.5">New password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neutral-950/20 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Confirm new password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e => e.key === "Enter" && handleChangePassword()}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neutral-950/20 transition" />
            </div>
          </div>

          <button onClick={handleChangePassword} disabled={loading}
            className="mt-5 rounded-full bg-neutral-950 px-6 py-2.5 text-sm font-bold text-white! shadow-md shadow-black/20 hover:bg-neutral-800 transition disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? "Saving…" : "Update password"}
          </button>
        </div>

      </main>
    </div>
  );
}
