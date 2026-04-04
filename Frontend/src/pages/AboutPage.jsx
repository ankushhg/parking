import { Link } from "react-router-dom";

const team = [
  { name: "Alex Carter", role: "Co-founder & CEO", initials: "AC" },
  { name: "Jordan Lee", role: "Co-founder & CTO", initials: "JL" },
  { name: "Morgan Silva", role: "Head of Product", initials: "MS" },
];

const values = [
  { title: "Simplicity", desc: "We remove friction from every step of the parking experience." },
  { title: "Transparency", desc: "Real-time data means no surprises — for drivers or operators." },
  { title: "Reliability", desc: "Our platform is built to be available when you need it most." },
];

export default function AboutPage() {
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
          Built for better parking.
        </h1>
        <p className="mt-4 max-w-md text-base leading-7 text-neutral-600">
          ParkFlow was founded to eliminate the daily frustration of finding a parking spot. We believe smart infrastructure should be accessible to everyone.
        </p>
      </section>

      {/* Values */}
      <section className="max-w-5xl mx-auto w-full px-6 py-12">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 mb-8 text-center">Our values</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="rounded-2xl bg-white/80 border border-black/5 p-6 shadow-sm">
              <h3 className="font-semibold text-neutral-950">{v.title}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="max-w-5xl mx-auto w-full px-6 py-12">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 mb-8 text-center">The team</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {team.map((m) => (
            <div key={m.name} className="rounded-2xl bg-white/80 border border-black/5 p-6 shadow-sm flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white font-bold text-sm">
                {m.initials}
              </div>
              <div>
                <p className="font-semibold text-neutral-950">{m.name}</p>
                <p className="text-sm text-neutral-500">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-col items-center text-center px-6 py-16">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">Ready to park smarter?</h2>
        <p className="mt-3 text-sm text-neutral-600">Join thousands of drivers and operators already using ParkFlow.</p>
        <Link to="/register" className="mt-6 rounded-full bg-neutral-950 px-6 py-3 text-sm font-bold text-white! shadow-lg shadow-black/30 hover:bg-neutral-800 transition">
          Get started
        </Link>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-black/10 py-4 text-center text-xs text-neutral-400">
        © {new Date().getFullYear()} ParkFlow. All rights reserved.
      </footer>

    </div>
  );
}
