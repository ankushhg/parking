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
      const d = err.response?.data;
      setNameError(typeof d === "string" ? d : d?.error || d?.message || "Failed to update name.");
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
      const d = err.response?.data;
      setError(typeof d === "string" ? d : d?.error || d?.message || "Failed to change password.");
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
    <div className="min-h-screen dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col" style={{ background: "#0d0500", fontFamily: "'Lato',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;600&display=swap');`}</style>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg,#ff6b00,#c9a84c,#ff6b00)", zIndex: 100 }} />

      {/* Header */}
      <header className="sticky z-50 w-full" style={{ top: 4, background: "rgba(13,5,0,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(201,168,76,0.2)" }}>
        <div className="flex items-center justify-between px-6 py-3 w-full">
          <Link to="/dashboard" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
            <span style={{ fontSize: "1.3rem" }}>🕉</span>
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: "1rem", color: "#c9a84c", fontWeight: 700 }}>ParkFlow</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" style={{ borderRadius: 20, border: "1px solid rgba(201,168,76,0.2)", background: "rgba(201,168,76,0.06)", padding: "6px 14px", fontSize: "0.78rem", fontWeight: 600, color: "rgba(240,208,128,0.8)", textDecoration: "none", fontFamily: "'Cinzel',serif", letterSpacing: 0.5, transition: "all 0.2s" }}>
              ← Dashboard
            </Link>
            <button onClick={toggle} style={{ borderRadius: 20, border: "1px solid rgba(201,168,76,0.2)", background: "rgba(255,255,255,0.04)", padding: "6px 12px", fontSize: "0.85rem", cursor: "pointer", color: "#fff" }}>
              {dark ? "☀️" : "🌙"}
            </button>
            <button onClick={logout} style={{ borderRadius: 20, border: "1px solid rgba(255,80,80,0.25)", background: "rgba(255,80,80,0.06)", padding: "6px 14px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", color: "rgba(255,120,120,0.9)", fontFamily: "'Cinzel',serif", letterSpacing: 1, transition: "all 0.2s" }}>
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10 flex flex-col gap-6">
        <style>{`
          .t-input:focus { border-color: #c9a84c !important; box-shadow: 0 0 0 3px rgba(201,168,76,0.12) !important; }
        `}</style>

        <div>
          <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: "1.4rem", color: "#c9a84c", marginBottom: 4 }}>My Profile</h1>
          <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>View your account details and manage your password.</p>
        </div>

        {/* Account Info */}
        <div style={s.card}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 60, height: 60, borderRadius: 12, background: "linear-gradient(135deg,#ff6b00,#c04500)", color: "#fff", fontSize: "1.6rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "'Cinzel',serif" }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <p style={{ fontFamily: "'Cinzel',serif", fontSize: "1rem", color: "#f0d080", fontWeight: 600 }}>{userName}</p>
              <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.45)" }}>{userEmail}</p>
              <span style={{ display: "inline-flex", alignItems: "center", borderRadius: 20, background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", padding: "2px 10px", fontSize: "0.7rem", fontWeight: 600, color: "#10b981", letterSpacing: 1 }}>
                Active account
              </span>
            </div>
          </div>
        </div>

        {/* Update Name */}
        <div style={s.card}>
          <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "0.95rem", color: "#f0d080", marginBottom: 16, letterSpacing: 1 }}>Display Name</h2>
          {nameError && <div style={s.error}>{nameError}</div>}
          <div style={{ display: "flex", gap: 10, maxWidth: 380 }}>
            <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleUpdateName()}
              placeholder="Your name"
              className="t-input"
              style={s.input} />
            <button onClick={handleUpdateName} disabled={nameLoading || nameInput.trim() === userName}
              style={{ ...s.btnPrimary, padding: "10px 20px", opacity: (nameLoading || nameInput.trim() === userName) ? 0.5 : 1, cursor: (nameLoading || nameInput.trim() === userName) ? "not-allowed" : "pointer", flexShrink: 0 }}>
              {nameLoading ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div style={s.card}>
          <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "0.95rem", color: "#f0d080", marginBottom: 16, letterSpacing: 1 }}>Change Password</h2>

          {error && <div style={s.error}>{error}</div>}

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[["Current password", currentPassword, setCurrentPassword], ["New password", newPassword, setNewPassword], ["Confirm new password", confirmPassword, setConfirmPassword]].map(([label, val, set]) => (
              <div key={label}>
                <label style={s.label}>{label}</label>
                <input type="password" value={val} onChange={e => set(e.target.value)}
                  placeholder="••••••••" className="t-input" style={s.input}
                  onKeyDown={label === "Confirm new password" ? e => e.key === "Enter" && handleChangePassword() : undefined} />
              </div>
            ))}
          </div>

          <button onClick={handleChangePassword} disabled={loading}
            style={{ ...s.btnPrimary, marginTop: 20, opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Saving…" : "Update Password"}
          </button>
        </div>

      </main>
    </div>
  );
}

const s = {
  card: { background: "linear-gradient(145deg,#1e0c02,#150800)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 10, padding: "28px 24px" },
  label: { display: "block", fontSize: "0.72rem", letterSpacing: 2, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", marginBottom: 7 },
  input: { width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 5, color: "#fff", fontSize: "0.95rem", outline: "none", transition: "border-color 0.25s, box-shadow 0.25s", boxSizing: "border-box" },
  btnPrimary: { padding: "12px 28px", background: "linear-gradient(135deg,#ff6b00,#c04500)", color: "#fff", border: "none", borderRadius: 5, fontFamily: "'Cinzel',serif", fontSize: "0.85rem", letterSpacing: 2, transition: "all 0.3s", boxShadow: "0 4px 20px rgba(255,107,0,0.35)", textTransform: "uppercase", display: "inline-block", cursor: "pointer" },
  error: { background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", borderRadius: 4, padding: "10px 14px", marginBottom: 16, fontSize: "0.82rem", color: "#ff7070" },
};
