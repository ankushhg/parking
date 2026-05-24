import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { document.title = "Contact — ParkFlow"; }, []);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleSubmit = e => { e.preventDefault(); setSubmitted(true); };

  return (
    <div style={{ fontFamily: "'Lato',sans-serif", background: "#0d0500", color: "#fff", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;600&display=swap');
        .nav-link:hover { color: #fff !important; }
        .t-input:focus { border-color: #c9a84c !important; box-shadow: 0 0 0 3px rgba(201,168,76,0.12) !important; }
        .t-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(255,107,0,0.55) !important; }
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
              <Link key={l} to={h} className="nav-link" style={{ color: l === "Contact" ? "#fff" : "rgba(255,255,255,0.6)", fontSize: "0.85rem", letterSpacing: 1, textDecoration: "none", transition: "color 0.2s", fontFamily: "'Cinzel',serif" }}>{l}</Link>
            ))}
            <Link to="/login" style={{ padding: "7px 18px", borderRadius: 3, fontFamily: "'Cinzel',serif", fontSize: "0.75rem", letterSpacing: 1.5, textDecoration: "none", background: "rgba(201,168,76,0.08)", color: "#f0d080", border: "1px solid rgba(201,168,76,0.4)", transition: "all 0.2s" }}>Log in</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "80px 24px 60px" }}>
        <p style={{ fontFamily: "'Cinzel',serif", fontSize: "0.78rem", letterSpacing: 6, color: "#f0d080", marginBottom: 16, opacity: 0.8 }}>REACH OUT</p>
        <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, color: "#fff", marginBottom: 20, lineHeight: 1.3 }}>
          Get in <span style={{ color: "#c9a84c" }}>Touch.</span>
        </h1>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ width: 60, height: 1, background: "linear-gradient(90deg,transparent,#c9a84c)" }} />
          <div style={{ width: 6, height: 6, background: "#c9a84c", transform: "rotate(45deg)" }} />
          <div style={{ width: 60, height: 1, background: "linear-gradient(90deg,#c9a84c,transparent)" }} />
        </div>
        <p style={{ maxWidth: 480, margin: "0 auto", fontSize: "1rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
          Have a question, feedback, or want to partner with us? We'd love to hear from you.
        </p>
      </section>

      {/* Content */}
      <section style={{ padding: "20px 24px 80px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Map */}
          <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid rgba(201,168,76,0.2)", lineHeight: 0 }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1331.5413377111793!2d75.25273881879211!3d13.416967097206754!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bbb417b558b61b3%3A0x7c880a166acf2b63!2sC783%2BJ72%20Sringeri%20Parking%20Lot%2C%2001%2C%20Sringeri%2C%20Menase%2C%20Karnataka%20577139!5e1!3m2!1sen!2sin!4v1777019046347!5m2!1sen!2sin"
              width="100%"
              height="340"
              style={{ border: 0, display: "block", filter: "invert(0.9) hue-rotate(180deg) saturate(0.6) brightness(0.85)" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Sringeri Parking Lot"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 24 }}>

          {/* Info cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              ["📧 Email", "support@sringeri.temple"],
              ["📍 Location", "Sringeri, Chikkamagaluru District\nKarnataka, India"],
              ["⏱ Response Time", "We typically respond within 1 business day."],
            ].map(([t, d]) => (
              <div key={t} style={s.card}>
                <p style={{ fontFamily: "'Cinzel',serif", fontSize: "0.85rem", color: "#f0d080", marginBottom: 8 }}>{t}</p>
                <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.55)", whiteSpace: "pre-line", lineHeight: 1.6 }}>{d}</p>
              </div>
            ))}
          </div>

          {/* Form */}
          <div style={s.card}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ fontSize: "2rem", color: "#c9a84c", marginBottom: 12 }}>✓</div>
                <p style={{ fontFamily: "'Cinzel',serif", color: "#c9a84c", marginBottom: 6 }}>Message Sent!</p>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[["name", "text", "Your Name"], ["email", "email", "you@example.com"]].map(([name, type, ph]) => (
                  <div key={name}>
                    <label style={s.label}>{name}</label>
                    <input name={name} type={type} value={form[name]} onChange={handleChange} required placeholder={ph}
                      className="t-input" style={s.input} />
                  </div>
                ))}
                <div>
                  <label style={s.label}>Message</label>
                  <textarea name="message" value={form.message} onChange={handleChange} required rows={4}
                    placeholder="How can we help?" className="t-input" style={{ ...s.input, resize: "none" }} />
                </div>
                <button type="submit" className="t-btn" style={s.btnPrimary}>Send Message</button>
              </form>
            )}
          </div>
          </div>
        </div>
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
  label: { display: "block", fontSize: "0.72rem", letterSpacing: 2, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", marginBottom: 7 },
  input: { width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 4, color: "#fff", fontSize: "0.95rem", outline: "none", boxSizing: "border-box", transition: "border-color 0.25s, box-shadow 0.25s" },
  btnPrimary: { padding: "14px 36px", borderRadius: 3, fontFamily: "'Cinzel',serif", fontSize: "0.9rem", letterSpacing: 2, cursor: "pointer", border: "none", transition: "all 0.3s ease", textTransform: "uppercase", background: "linear-gradient(135deg,#ff6b00,#c04500)", color: "#fff", boxShadow: "0 4px 24px rgba(255,107,0,0.45)", display: "inline-block" },
};
