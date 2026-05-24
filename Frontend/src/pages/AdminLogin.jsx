import { useState, useEffect } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1920&q=85",
  "https://images.unsplash.com/photo-1548013146-72479768bada?w=1920&q=85",
  "https://images.unsplash.com/photo-1609920658906-8223bd289001?w=1920&q=85",
];

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    document.title = "Admin Portal — Sringeri Temple Parking";
    BG_IMAGES.forEach((src) => { const img = new Image(); img.src = src; });
    const timer = setInterval(() => setCurrentBg((p) => (p + 1) % BG_IMAGES.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) { setError("Please enter both email and password."); return; }
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      if (res.data.role !== "ADMIN") { setError("Access denied. Admin credentials required."); setLoading(false); return; }
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);
      window.location.href = "/admin";
    } catch (err) {
      setError(err.response?.data || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Lato',sans-serif", minHeight: "100vh", background: "#0d0500", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;600&display=swap');
        @keyframes zoomSlow { from { transform: scale(1.06); } to { transform: scale(1.0); } }
        @keyframes pulse {
          0%,100% { text-shadow: 0 0 30px rgba(201,168,76,0.8), 0 0 60px rgba(201,168,76,0.4); }
          50%      { text-shadow: 0 0 50px rgba(201,168,76,1), 0 0 90px rgba(201,168,76,0.7); }
        }
        .admin-input:focus { border-color: #c9a84c !important; box-shadow: 0 0 0 3px rgba(201,168,76,0.12) !important; }
        .admin-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(255,107,0,0.55) !important; }
        .admin-submit:active { transform: translateY(0); }
        .back-link:hover { color: #f0d080 !important; }
      `}</style>

      {/* Top accent bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg,#ff6b00,#c9a84c,#ff6b00)", zIndex: 100 }} />

      {/* Background slides */}
      {BG_IMAGES.map((src, idx) => (
        <div key={idx} style={{
          position: "fixed", inset: 0,
          backgroundImage: `url('${src}')`,
          backgroundSize: "cover", backgroundPosition: "center",
          opacity: currentBg === idx ? 1 : 0,
          transition: "opacity 1.5s ease-in-out",
          animation: currentBg === idx ? "zoomSlow 10s ease-in-out forwards" : "none",
          zIndex: 0,
        }} />
      ))}
      {/* Overlay */}
      <div style={{ position: "fixed", inset: 0, background: "linear-gradient(135deg,rgba(10,4,0,0.85) 0%,rgba(26,10,0,0.78) 100%)", zIndex: 1 }} />

      {/* Card */}
      <div style={{
        position: "relative", zIndex: 2,
        background: "linear-gradient(160deg,rgba(30,12,2,0.97),rgba(18,6,0,0.99))",
        border: "1px solid rgba(201,168,76,0.35)",
        borderRadius: 10,
        padding: "48px 44px",
        width: "100%", maxWidth: 420,
        boxShadow: "0 30px 80px rgba(0,0,0,0.7), 0 0 60px rgba(201,168,76,0.06)",
        margin: "0 16px",
      }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ fontSize: "2.8rem", display: "block", marginBottom: 12, animation: "pulse 3.5s ease-in-out infinite" }}>🕉</span>
          <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: "1.4rem", color: "#c9a84c", marginBottom: 4 }}>Admin Portal</h1>
          <p style={{ fontSize: "0.78rem", letterSpacing: 3, color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>Sringeri Temple Parking</p>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.2)" }} />
          <div style={{ width: 6, height: 6, background: "#c9a84c", transform: "rotate(45deg)", flexShrink: 0 }} />
          <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.2)" }} />
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", borderRadius: 4, padding: "10px 14px", marginBottom: 20, fontSize: "0.82rem", color: "#ff7070", textAlign: "center" }}>
            {error}
          </div>
        )}

        {/* Fields */}
        <div style={{ marginBottom: 20 }}>
          <label style={s.label}>Admin Email</label>
          <input
            type="email"
            placeholder="admin@sringeri.temple"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="admin-input"
            style={s.input}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={s.label}>Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="admin-input"
              style={{ ...s.input, paddingRight: 56 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", cursor: "pointer", fontFamily: "'Cinzel',serif", letterSpacing: 1 }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="admin-submit"
          style={{
            width: "100%", padding: "14px", marginTop: 20,
            background: loading ? "rgba(255,107,0,0.5)" : "linear-gradient(135deg,#ff6b00,#c04500)",
            color: "#fff", border: "none", borderRadius: 5,
            fontFamily: "'Cinzel',serif", fontSize: "0.9rem", letterSpacing: 2.5,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.3s",
            boxShadow: "0 4px 20px rgba(255,107,0,0.35)",
            textTransform: "uppercase",
          }}
        >
          {loading ? "Signing in…" : "Enter Admin Panel"}
        </button>

        {/* Back link */}
        <Link to="/" className="back-link" style={{ display: "block", textAlign: "center", marginTop: 22, fontSize: "0.8rem", color: "rgba(255,255,255,0.3)", textDecoration: "none", letterSpacing: 1, transition: "color 0.2s" }}>
          ← Back to main page
        </Link>
      </div>
    </div>
  );
}

const s = {
  label: { display: "block", fontSize: "0.72rem", letterSpacing: 2, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", marginBottom: 8, fontFamily: "'Lato',sans-serif" },
  input: { width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 5, color: "#fff", fontSize: "0.95rem", outline: "none", transition: "border-color 0.25s, box-shadow 0.25s", boxSizing: "border-box" },
};
