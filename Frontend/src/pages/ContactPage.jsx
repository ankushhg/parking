import { Link } from "react-router-dom";
import { useState } from "react";

export default function ContactPage() {
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
    <div className="min-h-screen bg-[#f6efe5] text-neutral-900 flex flex-col">

      {/* Navbar */}
      <header className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 text-white font-black">
            P
          </div>
          <span className="font-semibold text-lg tracking-tight">ParkFlow</span>
        </Link>
        <div className="flex gap-3">
          <Link to="/login" className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold hover:bg-neutral-50 transition">
            Log in
          </Link>
          <Link to="/register" className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-bold text-white! shadow-md shadow-black/30 hover:bg-neutral-800 transition">
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 py-16">
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl max-w-xl">
          Get in touch.
        </h1>
        <p className="mt-4 max-w-md text-base leading-7 text-neutral-600">
          Have a question, feedback, or want to partner with us? We'd love to hear from you.
        </p>
      </section>

      {/* Content */}
      <section className="max-w-5xl mx-auto w-full px-6 py-4 pb-16 grid gap-8 sm:grid-cols-2">

        {/* Contact info */}
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
        <div className="rounded-2xl bg-white/80 border border-black/5 p-6 shadow-sm">
          {submitted ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-950 text-white text-xl">✓</div>
              <h3 className="font-semibold text-neutral-950">Message sent!</h3>
              <p className="text-sm text-neutral-600">Thanks for reaching out. We'll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neutral-950/20 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neutral-950/20 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="How can we help?"
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neutral-950/20 transition resize-none"
                />
              </div>
              <button
                type="submit"
                className="rounded-full bg-neutral-950 px-6 py-3 text-sm font-bold text-white! shadow-md shadow-black/30 hover:bg-neutral-800 transition"
              >
                Send message
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-black/10 py-4 text-center text-xs text-neutral-400">
        © {new Date().getFullYear()} ParkFlow. All rights reserved.
      </footer>

    </div>
  );
}
