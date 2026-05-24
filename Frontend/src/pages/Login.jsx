import { useState, useEffect } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";

const Divider = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0" }}>
    <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.2)" }} />
    <div style={{ width: 6, height: 6, background: "#c9a84c", transform: "rotate(45deg)", flexShrink: 0 }} />
    <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.2)" }} />
  </div>
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      setError(err.response?.data?.error || err.response?.data?.message || err.response?.data || "Login failed. Please try again.");
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
          <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: "1.1rem", color: "#fff", marginBottom: 4 }}>Welcome Back</h1>
          <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>Sign in to your account</p>
        </div>

        {error && <div style={s.error}>{error}</div>}

        <div style={{ marginBottom: 16 }}>
          <label style={s.label}>Email</label>
          <input type="email" placeholder="you@example.com" value={email}
            onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()}
            className="t-input" style={s.input} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
            <label style={s.label}>Password</label>
            <Link to="/forgot-password" className="t-link" style={{ fontSize: "0.72rem", color: "rgba(201,168,76,0.7)", textDecoration: "none", transition: "color 0.2s" }}>Forgot password?</Link>
          </div>
          <div style={{ position: "relative" }}>
            <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()}
              className="t-input" style={{ ...s.input, paddingRight: 56 }} />
            <button type="button" onClick={() => setShowPassword(p => !p)}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", cursor: "pointer", fontFamily: "'Cinzel',serif", letterSpacing: 1 }}>
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button onClick={handleLogin} disabled={loading} className="t-btn"
          style={{ ...s.btnPrimary, width: "100%", marginTop: 20, opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Signing in…" : "Sign In"}
        </button>

        <Divider />

        <p style={{ textAlign: "center", fontSize: "0.82rem", color: "rgba(255,255,255,0.4)" }}>
          Don't have an account?{" "}
          <Link to="/register" className="t-link" style={{ color: "#c9a84c", textDecoration: "none", transition: "color 0.2s" }}>Create one</Link>
        </p>

        <Link to="/" className="t-link" style={{ display: "block", textAlign: "center", marginTop: 18, fontSize: "0.78rem", color: "rgba(255,255,255,0.25)", textDecoration: "none", letterSpacing: 1, transition: "color 0.2s" }}>
          ← Back to home
        </Link>
      </div>
    </div>
  );
}

const s = {
  page: { fontFamily: "'Lato',sans-serif", minHeight: "100vh", background: "#0d0500", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px" },
  card: { background: "linear-gradient(160deg,rgba(30,12,2,0.97),rgba(18,6,0,0.99))", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 10, padding: "44px 40px", width: "100%", maxWidth: 400, boxShadow: "0 30px 80px rgba(0,0,0,0.7)" },
  label: { display: "block", fontSize: "0.72rem", letterSpacing: 2, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", marginBottom: 7 },
  input: { width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 5, color: "#fff", fontSize: "0.95rem", outline: "none", transition: "border-color 0.25s, box-shadow 0.25s", boxSizing: "border-box" },
  btnPrimary: { padding: "14px", background: "linear-gradient(135deg,#ff6b00,#c04500)", color: "#fff", border: "none", borderRadius: 5, fontFamily: "'Cinzel',serif", fontSize: "0.9rem", letterSpacing: 2.5, transition: "all 0.3s", boxShadow: "0 4px 20px rgba(255,107,0,0.35)", textTransform: "uppercase", display: "block" },
  error: { background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", borderRadius: 4, padding: "10px 14px", marginBottom: 20, fontSize: "0.82rem", color: "#ff7070", textAlign: "center" },
};
