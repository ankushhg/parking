import { Link } from "react-router-dom";
import { useEffect } from "react";

const values = [
  { icon: "🕊", title: "Simplicity", desc: "We remove friction from every step of the parking experience." },
  { icon: "🔍", title: "Transparency", desc: "Real-time data means no surprises — for drivers or operators." },
  { icon: "⚡", title: "Reliability", desc: "Our platform is built to be available when you need it most." },
];

const team = [
  { name: "Alex Carter", role: "Co-founder & CEO", initials: "AC" },
  { name: "Jordan Lee", role: "Co-founder & CTO", initials: "JL" },
  { name: "Morgan Silva", role: "Head of Product", initials: "MS" },
];

export default function AboutPage() {
  useEffect(() => { document.title = "About — ParkFlow"; }, []);

  return (
    <div style={{ fontFamily: "'Lato',sans-serif", background: "#0d0500", color: "#fff", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;600&display=swap');
        .nav-link:hover { color: #fff !important; }
        .val-card:hover { border-color: #c9a84c !important; transform: translateY(-4px); box-shadow: 0 12px 40px rgba(201,168,76,0.15) !important; }
        .cta-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 36px rgba(255,107,0,0.65) !important; }
      `}</style>

      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg,#ff6b00,#c9a84c,#ff6b00)", zIndex: 100 }} />

      {/* Navbar */}
      <nav style={{ position: "sticky", top: 4, zIndex: 50, background: "rgba(13,5,0,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <span style={{ fontSize: "1.4rem" }}>🕉</span>
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: "1.1rem", color: "#c9a84c", fontWeight: 700 }}>ParkFlow</span>
          </Link>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {[["Features", "/#features"], ["About", "/about"], ["Contact", "/contact"]].map(([l, h]) => (
              <Link key={l} to={h} className="nav-link" style={{ color: l === "About" ? "#fff" : "rgba(255,255,255,0.6)", fontSize: "0.85rem", letterSpacing: 1, textDecoration: "none", transition: "color 0.2s", fontFamily: "'Cinzel',serif" }}>{l}</Link>
            ))}
            <Link to="/login" style={{ padding: "7px 18px", borderRadius: 3, fontFamily: "'Cinzel',serif", fontSize: "0.75rem", letterSpacing: 1.5, textDecoration: "none", background: "rgba(201,168,76,0.08)", color: "#f0d080", border: "1px solid rgba(201,168,76,0.4)", transition: "all 0.2s" }}>Log in</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "80px 24px 60px" }}>
        <p style={{ fontFamily: "'Cinzel',serif", fontSize: "0.78rem", letterSpacing: 6, color: "#f0d080", marginBottom: 16, opacity: 0.8 }}>ABOUT PARKFLOW</p>
        <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, color: "#fff", marginBottom: 20, lineHeight: 1.3 }}>
          Built for <span style={{ color: "#c9a84c" }}>Better Parking.</span>
        </h1>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ width: 60, height: 1, background: "linear-gradient(90deg,transparent,#c9a84c)" }} />
          <div style={{ width: 6, height: 6, background: "#c9a84c", transform: "rotate(45deg)" }} />
          <div style={{ width: 60, height: 1, background: "linear-gradient(90deg,#c9a84c,transparent)" }} />
        </div>
        <p style={{ maxWidth: 520, margin: "0 auto", fontSize: "1rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
          ParkFlow was founded to eliminate the daily frustration of finding a parking spot. We believe smart infrastructure should be accessible to everyone — especially devotees visiting sacred spaces.
        </p>
      </section>

      {/* Values */}
      <section style={{ padding: "40px 24px 60px", background: "#100600" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "1.6rem", color: "#c9a84c", textAlign: "center", marginBottom: 40 }}>Our Values</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 24 }}>
            {values.map(v => (
              <div key={v.title} className="val-card" style={s.card}>
                <div style={{ fontSize: "2rem", marginBottom: 14 }}>{v.icon}</div>
                <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: "1rem", color: "#f0d080", marginBottom: 10 }}>{v.title}</h3>
                <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: "60px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "1.6rem", color: "#c9a84c", textAlign: "center", marginBottom: 40 }}>The Team</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 24 }}>
            {team.map(m => (
              <div key={m.name} style={{ ...s.card, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#ff6b00,#c04500)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel',serif", fontWeight: 700, color: "#fff", fontSize: "0.9rem", flexShrink: 0 }}>
                  {m.initials}
                </div>
                <div>
                  <p style={{ fontFamily: "'Cinzel',serif", fontSize: "0.9rem", color: "#f0d080", marginBottom: 4 }}>{m.name}</p>
                  <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)" }}>{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "60px 24px", background: "#100600", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "1.6rem", color: "#c9a84c", marginBottom: 12 }}>Ready to Park Smarter?</h2>
        <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", marginBottom: 28 }}>Join devotees already using ParkFlow at Sringeri.</p>
        <Link to="/register" className="cta-btn" style={{ padding: "14px 36px", borderRadius: 3, fontFamily: "'Cinzel',serif", fontSize: "0.9rem", letterSpacing: 2, textDecoration: "none", background: "linear-gradient(135deg,#ff6b00,#c04500)", color: "#fff", boxShadow: "0 4px 24px rgba(255,107,0,0.45)", display: "inline-block", transition: "all 0.3s", textTransform: "uppercase" }}>
          Get Started
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ background: "#080300", borderTop: "1px solid rgba(201,168,76,0.2)", padding: "28px 20px", textAlign: "center" }}>
        <div style={{ fontSize: "1.4rem", color: "#c9a84c", marginBottom: 8 }}>🕉</div>
        <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>Sringeri Sharada Peetham &nbsp;|&nbsp; Parking Management System</p>
        <div style={{ margin: "14px auto 0", height: 2, background: "linear-gradient(90deg,transparent,#c9a84c,transparent)", maxWidth: 260 }} />
        <p style={{ marginTop: 10, fontSize: "0.7rem", letterSpacing: 3, color: "rgba(201,168,76,0.4)", textTransform: "uppercase" }}>ॐ श्री शारदाम्बायै नमः</p>
        <p style={{ marginTop: 12, fontSize: "0.7rem", color: "rgba(255,255,255,0.2)" }}>© {new Date().getFullYear()} ParkFlow. All rights reserved.</p>
      </footer>
    </div>
  );
}

const s = {
  card: { background: "linear-gradient(145deg,#1e0c02,#150800)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 8, padding: "28px 24px", transition: "all 0.3s ease" },
};
