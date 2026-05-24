import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function NotFound() {
  useEffect(() => { document.title = "404 Not Found — ParkFlow"; }, []);

  return (
    <div style={{ fontFamily: "'Lato',sans-serif", background: "#0d0500", color: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;600&display=swap');
        @keyframes pulse {
          0%,100% { text-shadow: 0 0 35px rgba(201,168,76,0.9), 0 0 70px rgba(201,168,76,0.5); }
          50%      { text-shadow: 0 0 55px rgba(201,168,76,1), 0 0 100px rgba(201,168,76,0.8); }
        }
        .t-btn-primary:hover { transform: translateY(-3px); box-shadow: 0 10px 36px rgba(255,107,0,0.65) !important; }
        .t-btn-outline:hover { background: rgba(201,168,76,0.2) !important; transform: translateY(-3px); }
      `}</style>

      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg,#ff6b00,#c9a84c,#ff6b00)", zIndex: 100 }} />

      {/* Header */}
      <header style={{ padding: "18px 24px" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", width: "fit-content" }}>
          <span style={{ fontSize: "1.4rem" }}>🕉</span>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: "1.1rem", color: "#c9a84c", fontWeight: 700 }}>ParkFlow</span>
        </Link>
      </header>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px 24px" }}>
        <span style={{ fontSize: "3rem", display: "block", marginBottom: 16, animation: "pulse 3.5s ease-in-out infinite" }}>🕉</span>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ width: 60, height: 1, background: "linear-gradient(90deg,transparent,#c9a84c)" }} />
          <div style={{ width: 6, height: 6, background: "#c9a84c", transform: "rotate(45deg)" }} />
          <div style={{ width: 60, height: 1, background: "linear-gradient(90deg,#c9a84c,transparent)" }} />
        </div>

        <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(4rem,12vw,7rem)", fontWeight: 700, color: "#c9a84c", lineHeight: 1, marginBottom: 8 }}>404</h1>
        <p style={{ fontFamily: "'Cinzel',serif", fontSize: "1.1rem", color: "#f0d080", marginBottom: 12 }}>Page Not Found</p>
        <p style={{ maxWidth: 380, fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 36 }}>
          Looks like this spot doesn't exist. It may have been moved or the URL might be wrong.
        </p>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <Link to="/" className="t-btn-primary" style={{ padding: "13px 32px", borderRadius: 3, fontFamily: "'Cinzel',serif", fontSize: "0.88rem", letterSpacing: 2, textDecoration: "none", background: "linear-gradient(135deg,#ff6b00,#c04500)", color: "#fff", boxShadow: "0 4px 24px rgba(255,107,0,0.45)", display: "inline-block", transition: "all 0.3s", textTransform: "uppercase" }}>
            Back to Home
          </Link>
          <Link to="/dashboard" className="t-btn-outline" style={{ padding: "12px 30px", borderRadius: 3, fontFamily: "'Cinzel',serif", fontSize: "0.88rem", letterSpacing: 2, textDecoration: "none", background: "rgba(201,168,76,0.08)", color: "#f0d080", border: "1.5px solid #c9a84c", display: "inline-block", transition: "all 0.3s", textTransform: "uppercase" }}>
            My Dashboard
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: "#080300", borderTop: "1px solid rgba(201,168,76,0.2)", padding: "24px 20px", textAlign: "center" }}>
        <div style={{ margin: "0 auto 10px", height: 2, background: "linear-gradient(90deg,transparent,#c9a84c,transparent)", maxWidth: 260 }} />
        <p style={{ fontSize: "0.7rem", letterSpacing: 3, color: "rgba(201,168,76,0.4)", textTransform: "uppercase" }}>ॐ श्री शारदाम्बायै नमः</p>
        <p style={{ marginTop: 8, fontSize: "0.7rem", color: "rgba(255,255,255,0.2)" }}>© {new Date().getFullYear()} ParkFlow. All rights reserved.</p>
      </footer>
    </div>
  );
}
