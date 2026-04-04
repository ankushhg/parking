import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const features = [
  { title: "Live Availability", desc: "See open spots in real time before you arrive." },
  { title: "Easy Reservations", desc: "Book a slot in seconds with instant confirmation." },
  { title: "Ops Dashboard", desc: "Manage occupancy and bookings from one clean view." },
];

const steps = [
  { id: "01", title: "Create an account", desc: "Sign up in under a minute." },
  { id: "02", title: "Find a spot", desc: "Browse live availability and pick your slot." },
  { id: "03", title: "Park with ease", desc: "Show up, park, and skip the search." },
];

function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="rounded-2xl bg-white/80 border border-black/5 p-6 shadow-sm">
      {submitted ? (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-950 text-white text-xl">✓</div>
          <h3 className="font-semibold text-neutral-950">Message sent!</h3>
          <p className="text-sm text-neutral-600">Thanks for reaching out. We’ll get back to you soon.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">Name</label>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Your name"
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neutral-950/20 transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com"
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neutral-950/20 transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">Message</label>
            <textarea name="message" value={form.message} onChange={handleChange} required rows={5} placeholder="How can we help?"
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neutral-950/20 transition resize-none" />
          </div>
          <button type="submit"
            className="rounded-full bg-neutral-950 px-6 py-3 text-sm font-bold text-white! shadow-md shadow-black/30 hover:bg-neutral-800 transition">
            Send message
          </button>
        </form>
      )}
    </div>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => { document.title = "ParkFlow — Smart Parking, Simplified"; }, []);
  return (
    <div className="min-h-screen bg-[#f6efe5] text-neutral-900 flex flex-col">

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-md border-b border-black/5 w-full">
        <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 text-white font-black">
              P
            </div>
            <span className="font-semibold text-lg tracking-tight">ParkFlow</span>
          </Link>

          {/* Nav links - hidden on mobile */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-neutral-600 hover:text-neutral-950 transition">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-neutral-600 hover:text-neutral-950 transition">How it works</a>
            <a href="#about" className="text-sm font-medium text-neutral-600 hover:text-neutral-950 transition">About</a>
            <a href="#contact" className="text-sm font-medium text-neutral-600 hover:text-neutral-950 transition">Contact</a>
          </nav>

          {/* CTA buttons + hamburger */}
          <div className="flex items-center gap-3">
            <Link to="/login" className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold hover:bg-neutral-50 transition">
              Log in
            </Link>
            <Link to="/register" className="hidden sm:block rounded-full bg-neutral-950 px-4 py-2 text-sm font-bold text-white! shadow-md shadow-black/30 hover:bg-neutral-800 transition">
              Get started
            </Link>
            {/* Hamburger - visible on mobile only */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden flex flex-col justify-center items-center h-9 w-9 rounded-xl border border-black/10 bg-white gap-1.5 hover:bg-neutral-50 transition"
              aria-label="Toggle menu"
            >
              <span className={`block h-0.5 w-4 bg-neutral-700 transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 w-4 bg-neutral-700 transition-all ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-4 bg-neutral-700 transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-black/5 bg-white/90 backdrop-blur-md px-6 py-4 flex flex-col gap-3">
            <a href="#features" onClick={closeMenu} className="text-sm font-medium text-neutral-700 hover:text-neutral-950 transition py-1">Features</a>
            <a href="#how-it-works" onClick={closeMenu} className="text-sm font-medium text-neutral-700 hover:text-neutral-950 transition py-1">How it works</a>
            <a href="#about" onClick={closeMenu} className="text-sm font-medium text-neutral-700 hover:text-neutral-950 transition py-1">About</a>
            <a href="#contact" onClick={closeMenu} className="text-sm font-medium text-neutral-700 hover:text-neutral-950 transition py-1">Contact</a>
            <div className="pt-2 border-t border-black/5">
              <Link to="/register" onClick={closeMenu} className="block w-full text-center rounded-full bg-neutral-950 px-4 py-2.5 text-sm font-bold text-white! shadow-md shadow-black/30 hover:bg-neutral-800 transition">
                Get started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-16 sm:py-24 w-full">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-5xl max-w-xl">
          Smart parking, simplified.
        </h1>
        <p className="mt-4 max-w-md text-base leading-7 text-neutral-600">
          Reserve a spot, check live availability, and manage your parking — all in one place.
        </p>
        <div className="mt-8 flex gap-3">
          <Link to="/register" className="rounded-full bg-neutral-950 px-6 py-3 text-sm font-bold text-white! shadow-lg shadow-black/30 hover:bg-neutral-800 transition">
            Get started
          </Link>
          <Link to="/login" className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold hover:bg-neutral-50 transition">
            Log in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto w-full px-6 py-12">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 mb-8 text-center">Why ParkFlow?</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl bg-white/80 border border-black/5 p-6 shadow-sm">
              <h3 className="font-semibold text-neutral-950">{f.title}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-6xl mx-auto w-full px-6 py-12">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 mb-8 text-center">How it works</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.id} className="rounded-2xl bg-white/80 border border-black/5 p-6 shadow-sm">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">{s.id}</span>
              <h3 className="mt-2 font-semibold text-neutral-950">{s.title}</h3>
              <p className="mt-1 text-sm leading-6 text-neutral-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="max-w-6xl mx-auto w-full px-6 py-12">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 mb-8 text-center">About ParkFlow</h2>
        <div className="rounded-2xl bg-white/80 border border-black/5 p-8 shadow-sm flex flex-col sm:flex-row gap-8 items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-neutral-950 text-white font-black text-3xl">
            P
          </div>
          <div>
            <p className="text-sm leading-7 text-neutral-600">
              ParkFlow was built to eliminate the daily frustration of finding a parking spot. We believe smart infrastructure should be accessible to everyone — from daily commuters to parking operators managing hundreds of spaces.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                { title: "Simplicity", desc: "We remove friction from every step of the parking experience." },
                { title: "Transparency", desc: "Real-time data means no surprises — for drivers or operators." },
                { title: "Reliability", desc: "Our platform is built to be available when you need it most." },
              ].map((v) => (
                <div key={v.title}>
                  <p className="font-semibold text-neutral-950 text-sm">{v.title}</p>
                  <p className="mt-1 text-xs leading-5 text-neutral-500">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="max-w-6xl mx-auto w-full px-6 py-12">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 mb-8 text-center">Get in touch</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Info cards */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl bg-white/80 border border-black/5 p-6 shadow-sm">
              <h3 className="font-semibold text-neutral-950 mb-1">Email us</h3>
              <p className="text-sm text-neutral-600">support@parkflow.io</p>
            </div>
            <div className="rounded-2xl bg-white/80 border border-black/5 p-6 shadow-sm">
              <h3 className="font-semibold text-neutral-950 mb-1">Office</h3>
              <p className="text-sm text-neutral-600">123 Parking Ave, Suite 400<br />San Francisco, CA 94103</p>
            </div>
            <div className="rounded-2xl bg-white/80 border border-black/5 p-6 shadow-sm">
              <h3 className="font-semibold text-neutral-950 mb-1">Response time</h3>
              <p className="text-sm text-neutral-600">We typically respond within 1 business day.</p>
            </div>
          </div>

          {/* Form */}
          <ContactForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-black/10 bg-white/40">
        <div className="max-w-6xl mx-auto w-full px-6 py-10 grid gap-8 grid-cols-1 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-950 text-white font-black text-sm">
                P
              </div>
              <span className="font-semibold tracking-tight">ParkFlow</span>
            </Link>
            <p className="text-sm text-neutral-500 leading-6">Smart parking, simplified. Reserve spots and manage occupancy in real time.</p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li><Link to="/register" className="hover:text-neutral-950 transition">Get started</Link></li>
              <li><Link to="/login" className="hover:text-neutral-950 transition">Log in</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li><a href="#about" className="hover:text-neutral-950 transition">About</a></li>
              <li><a href="#contact" className="hover:text-neutral-950 transition">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-black/10 py-4 text-center text-xs text-neutral-400">
          © {new Date().getFullYear()} ParkFlow. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
