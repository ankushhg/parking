import { useState, useEffect } from "react";
import API from "../services/api";
import { Link, useNavigate } from "react-router-dom";

const Divider = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0" }}>
    <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.2)" }} />
    <div style={{ width: 6, height: 6, background: "#c9a84c", transform: "rotate(45deg)", flexShrink: 0 }} />
    <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.2)" }} />
  </div>
);

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
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
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;600&display=swap');
        .t-input:focus { border-color: #c9a84c !important; box-shadow: 0 0 0 3px rgba(201,168,76,0.12) !important; }
        .t-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(255,107,0,0.55) !important; }
        .t-link:hover { color: #f0d080 !important; }
      `}</style>

      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg,#ff6b00,#c9a84c,#ff6b00)", zIndex: 100 }} />

      <div style={s.card}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <span style={{ fontSize: "2rem", display: "block", marginBottom: 10 }}>🕉</span>
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: "1.3rem", color: "#c9a84c", fontWeight: 700 }}>ParkFlow</span>
          </Link>
          <Divider />

          {/* Step indicator */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
            {[1, 2].map(n => (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, background: step >= n ? "linear-gradient(135deg,#ff6b00,#c04500)" : "rgba(255,255,255,0.08)", color: step >= n ? "#fff" : "rgba(255,255,255,0.3)", border: step >= n ? "none" : "1px solid rgba(255,255,255,0.1)" }}>
                  {n}
                </div>
                {n < 2 && <div style={{ width: 32, height: 1, background: step > n ? "#c9a84c" : "rgba(255,255,255,0.1)" }} />}
              </div>
            ))}
            <span style={{ marginLeft: 8, fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>
              {step === 1 ? "Enter email" : "Set new password"}
            </span>
          </div>

          <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: "1.1rem", color: "#fff", marginBottom: 4 }}>
            {step === 1 ? "Forgot Password?" : "Reset Password"}
          </h1>
          <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
            {step === 1 ? "Enter your email to get a reset token." : "Enter the token and your new password."}
          </p>
        </div>

        {error && <div style={s.error}>{error}</div>}
        {success && <div style={s.success}>{success}</div>}

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={s.label}>Email Address</label>
              <input type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleForgot()}
                className="t-input" style={s.input} />
            </div>
            <button onClick={handleForgot} disabled={loading} className="t-btn"
              style={{ ...s.btnPrimary, opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Sending…" : "Get Reset Token"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={s.label}>Reset Token</label>
              <input type="text" placeholder="Paste your reset token" value={token}
                onChange={e => setToken(e.target.value)}
                className="t-input" style={{ ...s.input, fontFamily: "monospace" }} />
              <p style={{ marginTop: 6, fontSize: "0.72rem", color: "#10b981" }}>✓ Token auto-filled (demo mode)</p>
            </div>
            <div>
              <label style={s.label}>New Password</label>
              <div style={{ position: "relative" }}>
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={newPassword}
                  onChange={e => setNewPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleReset()}
                  className="t-input" style={{ ...s.input, paddingRight: 56 }} />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", cursor: "pointer", fontFamily: "'Cinzel',serif", letterSpacing: 1 }}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <button onClick={handleReset} disabled={loading} className="t-btn"
              style={{ ...s.btnPrimary, opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Resetting…" : "Reset Password"}
            </button>
            <button onClick={() => { setStep(1); setError(""); }}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: "0.78rem", cursor: "pointer", letterSpacing: 1, transition: "color 0.2s" }}
              className="t-link">
              ← Back to email
            </button>
          </div>
        )}

        <Divider />

        <Link to="/login" className="t-link" style={{ display: "block", textAlign: "center", fontSize: "0.78rem", color: "rgba(255,255,255,0.25)", textDecoration: "none", letterSpacing: 1, transition: "color 0.2s" }}>
          ← Back to login
        </Link>
      </div>
    </div>
  );
}

const s = {
  page: { fontFamily: "'Lato',sans-serif", minHeight: "100vh", background: "#0d0500", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px" },
  card: { background: "linear-gradient(160deg,rgba(30,12,2,0.97),rgba(18,6,0,0.99))", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 10, padding: "44px 40px", width: "100%", maxWidth: 420, boxShadow: "0 30px 80px rgba(0,0,0,0.7)" },
  label: { display: "block", fontSize: "0.72rem", letterSpacing: 2, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", marginBottom: 7 },
  input: { width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 5, color: "#fff", fontSize: "0.95rem", outline: "none", transition: "border-color 0.25s, box-shadow 0.25s", boxSizing: "border-box" },
  btnPrimary: { padding: "14px", background: "linear-gradient(135deg,#ff6b00,#c04500)", color: "#fff", border: "none", borderRadius: 5, fontFamily: "'Cinzel',serif", fontSize: "0.9rem", letterSpacing: 2.5, transition: "all 0.3s", boxShadow: "0 4px 20px rgba(255,107,0,0.35)", textTransform: "uppercase", display: "block", width: "100%" },
  error: { background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", borderRadius: 4, padding: "10px 14px", marginBottom: 20, fontSize: "0.82rem", color: "#ff7070", textAlign: "center" },
  success: { background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 4, padding: "10px 14px", marginBottom: 20, fontSize: "0.82rem", color: "#10b981", textAlign: "center" },
};
