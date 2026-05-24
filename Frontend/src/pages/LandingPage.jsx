import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const IMAGES = [
  { src: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1920&q=85", caption: "Sharada Peetham — Main Temple" },
  { src: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1920&q=85", caption: "Sharadamba Temple — Divine Sanctum" },
  { src: "https://images.unsplash.com/photo-1548013146-72479768bada?w=1920&q=85", caption: "Temple Complex — Sacred Grounds" },
  { src: "https://images.unsplash.com/photo-1609920658906-8223bd289001?w=1920&q=85", caption: "Vidyashankara Temple — Ancient Architecture" },
  { src: "https://images.unsplash.com/photo-1600697395543-a6c6b0b4b9c0?w=1920&q=85", caption: "Tunga River — Holy Waters" },
];

const FEATURES = [
  { icon: "🚗", title: "Instant Check-In", desc: "Auto-assign or choose your preferred zone. Real-time slot availability at your fingertips." },
  { icon: "📍", title: "Zone Selection", desc: "Three dedicated zones — A, B & C — for two-wheelers, four-wheelers, and heavy vehicles." },
  { icon: "💰", title: "Transparent Billing", desc: "Automated fare calculation. Pay only for what you use with clear hourly rates." },
  { icon: "♿", title: "Handicap Reserved", desc: "Dedicated slots A-01 & A-02 reserved for differently-abled devotees." },
  { icon: "🔔", title: "Live Updates", desc: "WebSocket-powered real-time slot status. Always know what's available instantly." },
  { icon: "📜", title: "Parking History", desc: "Complete session history with digital receipts for every visit." },
];

const STATS = [
  { number: "60", label: "Total Slots" },
  { number: "3", label: "Parking Zones" },
  { number: "24/7", label: "Live Monitoring" },
  { number: "₹10", label: "Starting Rate" },
];

function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => { e.preventDefault(); setSubmitted(true); };

  return (
    <div style={styles.card}>
      {submitted ? (
        <div style={{ textAlign: "center", padding: "32px 0" }}>
          <div style={{ ...styles.omSmall, fontSize: "2rem", marginBottom: 12 }}>✓</div>
          <p style={{ ...styles.cinzel, color: "#c9a84c", marginBottom: 6 }}>Message Sent!</p>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>We'll get back to you soon.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[["name", "text", "Your Name"], ["email", "email", "you@example.com"]].map(([name, type, ph]) => (
            <div key={name}>
              <label style={styles.label}>{name}</label>
              <input name={name} type={type} value={form[name]} onChange={handleChange} required placeholder={ph} style={styles.input} />
            </div>
          ))}
          <div>
            <label style={styles.label}>Message</label>
            <textarea name="message" value={form.message} onChange={handleChange} required rows={4} placeholder="How can we help?" style={{ ...styles.input, resize: "none" }} />
          </div>
          <button type="submit" style={styles.btnPrimary}>Send Message</button>
        </form>
      )}
    </div>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    document.title = "ParkFlow — Sringeri Temple Parking";
  }, []);

  const toggleSection = (section) =>
    setActiveSection((prev) => (prev === section ? null : section));

  return (
    <div style={{ fontFamily: "'Lato', sans-serif", background: "#0d0500", color: "#fff", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;600&display=swap');
        @keyframes zoomSlow { from { transform: scale(1.06); } to { transform: scale(1.0); } }
        @keyframes pulse {
          0%,100% { text-shadow: 0 0 35px rgba(201,168,76,0.9), 0 0 70px rgba(201,168,76,0.5); }
          50%      { text-shadow: 0 0 55px rgba(201,168,76,1), 0 0 100px rgba(201,168,76,0.8); }
        }
        @keyframes shimmer { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }
        .temple-btn-primary:hover { transform: translateY(-3px); box-shadow: 0 10px 36px rgba(255,107,0,0.65) !important; }
        .temple-btn-outline:hover { background: rgba(201,168,76,0.2) !important; transform: translateY(-3px); }
        .temple-btn-admin:hover   { background: rgba(255,255,255,0.08) !important; color: rgba(255,255,255,0.85) !important; transform: translateY(-2px); }
        .feature-card:hover { border-color: #c9a84c !important; transform: translateY(-4px); box-shadow: 0 12px 40px rgba(201,168,76,0.15) !important; }
        .nav-link:hover { color: #fff !important; }
        .dot-btn:hover { background: rgba(201,168,76,0.6) !important; }
      `}</style>

      {/* ── TOP ACCENT BAR ── */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg,#ff6b00,#c9a84c,#ff6b00)", zIndex: 100 }} />

      {/* ── HERO ── */}
      <section style={{ position: "relative", height: "100vh", minHeight: 600, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>

        {/* Background Image */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url('${IMAGES[0].src}')`, backgroundSize: "cover", backgroundPosition: "center", animation: "zoomSlow 8s ease-in-out forwards" }} />

        {/* Overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,4,0,0.50) 0%, rgba(26,10,0,0.30) 35%, rgba(10,4,0,0.72) 75%, rgba(10,4,0,0.97) 100%)", zIndex: 1 }} />

        {/* Navbar */}
        <nav style={{ position: "absolute", top: 4, left: 0, right: 0, zIndex: 10, background: "rgba(0,0,0,0.30)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>🕉</span>
              <span style={{ ...styles.cinzel, fontSize: "1.1rem", color: "#c9a84c", fontWeight: 700 }}>ParkFlow</span>
            </Link>
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              {["Features", "About", "Contact"].map((l) => (
                <a key={l} href="#" onClick={(e) => { e.preventDefault(); toggleSection(l.toLowerCase()); }} className="nav-link" style={{ color: activeSection === l.toLowerCase() ? "#c9a84c" : "rgba(255,255,255,0.75)", fontSize: "0.85rem", letterSpacing: 1, textDecoration: "none", transition: "color 0.2s", fontFamily: "'Cinzel',serif" }}>{l}</a>
              ))}
              <Link to="/login" style={{ ...styles.btnOutlineSmall }}>Log in</Link>
              <Link to="/admin/login" style={{ ...styles.btnAdminSmall }} className="temple-btn-admin">Admin</Link>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 20px", maxWidth: 860 }}>
          <span style={{ fontSize: "3.8rem", display: "block", marginBottom: 14, animation: "pulse 3.5s ease-in-out infinite", filter: "drop-shadow(0 0 20px rgba(255,107,0,0.3))" }}>🕉</span>
          <p style={{ ...styles.cinzel, fontSize: "0.88rem", letterSpacing: 7, color: "#f0d080", marginBottom: 16, opacity: 0.95, textShadow: "0 2px 10px rgba(0,0,0,0.7)" }}>
            SRINGERI SHARADA PEETHAM
          </p>
          <h1 style={{ ...styles.cinzel, fontSize: "clamp(2.2rem, 5.5vw, 4rem)", fontWeight: 700, lineHeight: 1.2, color: "#fff", textShadow: "0 3px 25px rgba(0,0,0,0.9)", marginBottom: 10 }}>
            Sacred Temple<br />
            <span style={{ color: "#c9a84c", textShadow: "0 3px 25px rgba(0,0,0,0.9), 0 0 50px rgba(201,168,76,0.4)" }}>Parking System</span>
          </h1>
          <p style={{ fontSize: "clamp(0.95rem,2vw,1.15rem)", color: "rgba(255,255,255,0.82)", fontWeight: 300, letterSpacing: 1, marginBottom: 40, textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>
            Seamless parking management for devotees visiting the divine abode
          </p>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 36 }}>
            <div style={{ width: 80, height: 1, background: "linear-gradient(90deg,transparent,#c9a84c)" }} />
            <div style={{ width: 8, height: 8, background: "#c9a84c", transform: "rotate(45deg)" }} />
            <div style={{ width: 80, height: 1, background: "linear-gradient(90deg,#c9a84c,transparent)" }} />
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/register" className="temple-btn-primary" style={styles.btnPrimary}>Devotee Login</Link>
            <Link to="/login" className="temple-btn-outline" style={styles.btnOutline}>Register</Link>
            <Link to="/admin/login" className="temple-btn-admin" style={styles.btnAdmin}>Admin Login</Link>
          </div>
        </div>

        {/* Caption */}
        <div style={{ position: "absolute", bottom: 70, left: "50%", transform: "translateX(-50%)", zIndex: 3, opacity: 1, transition: "opacity 0.8s", whiteSpace: "nowrap" }}>
          <span style={{ ...styles.cinzel, fontSize: "0.75rem", letterSpacing: 4, color: "rgba(240,208,128,0.85)", background: "rgba(0,0,0,0.35)", padding: "5px 18px", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 2 }}>
            {IMAGES[0].caption}
          </span>
        </div>


      </section>

      {/* ── STATS BAR ── */}
      <div style={{ background: "linear-gradient(135deg,#1a0800,#2d1200)", borderTop: "2px solid #c9a84c", borderBottom: "1px solid rgba(201,168,76,0.2)", padding: "28px 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 20 }}>
          {STATS.map(({ number, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ ...styles.cinzel, fontSize: "2rem", fontWeight: 700, color: "#c9a84c" }}>{number}</div>
              <div style={{ fontSize: "0.78rem", letterSpacing: 2, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      {activeSection === "features" && <section id="features" style={{ padding: "80px 20px", background: "#0d0500" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ ...styles.cinzel, fontSize: "clamp(1.5rem,3vw,2.2rem)", color: "#c9a84c", marginBottom: 12 }}>🙏 Devotee Services</h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.95rem" }}>Everything you need for a peaceful temple visit</p>
        </div>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 24 }}>
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className="feature-card" style={styles.card}>
              <div style={{ fontSize: "2.4rem", marginBottom: 16 }}>{icon}</div>
              <h3 style={{ ...styles.cinzel, fontSize: "1rem", color: "#f0d080", marginBottom: 10 }}>{title}</h3>
              <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>}

      {/* ── ABOUT ── */}
      {activeSection === "about" && <section id="about" style={{ padding: "60px 20px", background: "#100600" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ ...styles.cinzel, fontSize: "clamp(1.5rem,3vw,2rem)", color: "#c9a84c", textAlign: "center", marginBottom: 40 }}>About ParkFlow</h2>
          <div style={{ ...styles.card, display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center" }}>
            <span style={{ fontSize: "3rem" }}>🕌</span>
            <div style={{ flex: 1, minWidth: 220 }}>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.8, color: "rgba(255,255,255,0.65)", marginBottom: 24 }}>
                ParkFlow was built to serve the devotees of Sri Sringeri Sharada Peetham. We believe smart infrastructure should support the spiritual experience — from daily visitors to operators managing hundreds of spaces.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 16 }}>
                {[["Simplicity", "Friction-free parking for every devotee."], ["Transparency", "Real-time data, no surprises."], ["Reliability", "Available when you need it most."]].map(([t, d]) => (
                  <div key={t}>
                    <p style={{ ...styles.cinzel, fontSize: "0.85rem", color: "#f0d080", marginBottom: 4 }}>{t}</p>
                    <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>}

      {/* ── CONTACT ── */}
      {activeSection === "contact" && <section id="contact" style={{ padding: "60px 20px", background: "#0d0500" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ ...styles.cinzel, fontSize: "clamp(1.5rem,3vw,2rem)", color: "#c9a84c", textAlign: "center", marginBottom: 40 }}>Get in Touch</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[["📧 Email", "support@sringeri.temple"], ["📍 Location", "Sringeri, Chikkamagaluru District\nKarnataka, India"], ["⏱ Response", "We typically respond within 1 business day."]].map(([t, d]) => (
                <div key={t} style={styles.card}>
                  <p style={{ ...styles.cinzel, fontSize: "0.85rem", color: "#f0d080", marginBottom: 6 }}>{t}</p>
                  <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.55)", whiteSpace: "pre-line" }}>{d}</p>
                </div>
              ))}
            </div>
            <ContactForm />
          </div>
        </div>
      </section>}

      {/* ── FOOTER ── */}
      <footer style={{ background: "#080300", borderTop: "1px solid rgba(201,168,76,0.2)", padding: "32px 20px", textAlign: "center" }}>
        <div style={{ fontSize: "1.6rem", color: "#c9a84c", marginBottom: 8 }}>🕉</div>
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)", letterSpacing: 1 }}>Sringeri Sharada Peetham &nbsp;|&nbsp; Parking Management System</p>
        <p style={{ marginTop: 6, fontSize: "0.8rem", color: "rgba(255,255,255,0.25)" }}>
          Built with devotion &nbsp;·&nbsp;
          <a href="mailto:support@sringeri.temple" style={{ color: "#c9a84c", textDecoration: "none" }}>support@sringeri.temple</a>
        </p>
        <div style={{ margin: "18px auto 0", height: 2, background: "linear-gradient(90deg,transparent,#c9a84c,transparent)", maxWidth: 300 }} />
        <p style={{ marginTop: 12, fontSize: "0.7rem", letterSpacing: 3, color: "rgba(201,168,76,0.4)", textTransform: "uppercase" }}>ॐ श्री शारदाम्बायै नमः</p>
        <p style={{ marginTop: 16, fontSize: "0.72rem", color: "rgba(255,255,255,0.2)" }}>© {new Date().getFullYear()} ParkFlow. All rights reserved.</p>
      </footer>
    </div>
  );
}

const styles = {
  cinzel: { fontFamily: "'Cinzel', serif" },
  card: {
    background: "linear-gradient(145deg,#1e0c02,#150800)",
    border: "1px solid rgba(201,168,76,0.2)",
    borderRadius: 8,
    padding: "28px 24px",
    transition: "all 0.3s ease",
  },
  label: { display: "block", fontSize: "0.72rem", letterSpacing: 2, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", marginBottom: 7, fontFamily: "'Lato',sans-serif" },
  input: { width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 4, color: "#fff", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" },
  btnPrimary: { padding: "14px 36px", borderRadius: 3, fontFamily: "'Cinzel',serif", fontSize: "0.9rem", letterSpacing: 2, textDecoration: "none", cursor: "pointer", border: "none", transition: "all 0.3s ease", textTransform: "uppercase", background: "linear-gradient(135deg,#ff6b00,#c04500)", color: "#fff", boxShadow: "0 4px 24px rgba(255,107,0,0.45)", display: "inline-block" },
  btnOutline: { padding: "13px 34px", borderRadius: 3, fontFamily: "'Cinzel',serif", fontSize: "0.9rem", letterSpacing: 2, textDecoration: "none", cursor: "pointer", transition: "all 0.3s ease", textTransform: "uppercase", background: "rgba(201,168,76,0.08)", color: "#f0d080", border: "1.5px solid #c9a84c", display: "inline-block" },
  btnAdmin: { padding: "12px 24px", borderRadius: 3, fontFamily: "'Cinzel',serif", fontSize: "0.78rem", letterSpacing: 1.5, textDecoration: "none", cursor: "pointer", transition: "all 0.3s ease", textTransform: "uppercase", background: "transparent", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.2)", display: "inline-block" },
  btnOutlineSmall: { padding: "7px 18px", borderRadius: 3, fontFamily: "'Cinzel',serif", fontSize: "0.75rem", letterSpacing: 1.5, textDecoration: "none", background: "rgba(201,168,76,0.08)", color: "#f0d080", border: "1px solid rgba(201,168,76,0.4)", transition: "all 0.2s" },
  btnAdminSmall: { padding: "7px 18px", borderRadius: 3, fontFamily: "'Cinzel',serif", fontSize: "0.75rem", letterSpacing: 1.5, textDecoration: "none", background: "transparent", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.15)", transition: "all 0.2s" },
  omSmall: { color: "#c9a84c", display: "block" },
};
