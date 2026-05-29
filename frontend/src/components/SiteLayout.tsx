import React from "react";
import { Link, NavLink } from "react-router-dom";
import {
  ArrowUpRight,
  Brain,
  CalendarDays,
  HeartPulse,
  Menu,
  ShieldCheck,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/health-plans", label: "Plans" },
  { to: "/mental-health", label: "AI Support" },
  { to: "/contact", label: "Contact" },
];

const SiteLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#071018] text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12rem] top-[-10rem] h-[28rem] w-[28rem] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-[-8rem] top-[12rem] h-[24rem] w-[24rem] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-[30%] h-[24rem] w-[24rem] rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#071018]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/30 bg-white/5 shadow-lg shadow-black/20">
              <HeartPulse className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
                MediRAG
              </p>
              <p className="text-lg font-semibold text-white">
                Care that converts into clarity
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm transition ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/appointments"
              className="hidden items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 sm:inline-flex"
            >
              Book a demo <ArrowUpRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 md:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10">{children}</main>

      <footer className="relative z-10 border-t border-white/10 bg-[#071018]/95">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-16">
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-8 shadow-2xl shadow-black/20 backdrop-blur-xl lg:p-10">
            <div className="grid gap-10 lg:grid-cols-[1.4fr_0.9fr_1fr] lg:items-start">
              <div>
                <p className="text-xs uppercase tracking-[0.45em] text-slate-500">
                  MediRAG
                </p>
                <h3 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight text-white sm:text-4xl">
                  Practical digital healthcare for patients and care teams.
                </h3>
                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                  Access imaging support, care plans, appointment booking, and
                  behavioral check-ins in one connected platform.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200">
                    Fast access to care tools
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200">
                    AI-assisted support
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200">
                    Clean, focused UI
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                  Explore
                </h4>
                <div className="mt-5 grid gap-3 text-sm text-slate-300">
                  <Link className="transition hover:text-white" to="/services">
                    Services
                  </Link>
                  <Link
                    className="transition hover:text-white"
                    to="/health-plans"
                  >
                    Health Plans
                  </Link>
                  <Link
                    className="transition hover:text-white"
                    to="/mental-health"
                  >
                    Mental Health
                  </Link>
                  <Link className="transition hover:text-white" to="/contact">
                    Contact
                  </Link>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-[#0b1320] p-6">
                <div className="flex items-center gap-3 text-amber-300">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-xs font-semibold uppercase tracking-[0.35em]">
                    Trusted system
                  </span>
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Built for clarity, reliable triage guidance, and clear next
                  actions for follow-up care.
                </p>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-200">
                    <CalendarDays className="h-4 w-4 text-cyan-300" />
                    24/7 guided support
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-200">
                    <Brain className="h-4 w-4 text-emerald-300" />
                    AI-assisted care journeys
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-200">
                    <ShieldCheck className="h-4 w-4 text-amber-300" />
                    Secure, reassuring interface
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SiteLayout;
