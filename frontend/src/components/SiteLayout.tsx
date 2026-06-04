import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../api/config";
import { useAuth } from "./AuthContext";
import {
  ArrowUpRight,
  Brain,
  CalendarDays,
  HeartPulse,
  LogOut,
  Menu,
  Settings2,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/health-plans", label: "Plans" },
  { to: "/mental-health", label: "AI Support" },
  { to: "/contact", label: "Contact" },
];

const MODEL_MODES = [
  { value: "auto", label: "Auto", desc: "Best available" },
  { value: "mock", label: "Mock", desc: "Local dev" },
  { value: "gemini", label: "Gemini", desc: "Google AI" },
  { value: "groq", label: "Groq", desc: "Fast inference" },
];

const SiteLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modelMode, setModelMode] = useState("auto");
  const [showModelMenu, setShowModelMenu] = useState(false);

  // Fetch current model mode on mount
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/model/mode`)
      .then((res) => setModelMode(res.data.mode))
      .catch(() => {});
  }, []);

  const handleModeChange = async (mode: string) => {
    try {
      await axios.post(`${API_BASE_URL}/model/mode`, { mode });
      setModelMode(mode);
    } catch {
      // ignore
    }
    setShowModelMenu(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const currentMode = MODEL_MODES.find((m) => m.value === modelMode);

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
            {/* Model Mode Selector */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setShowModelMenu(!showModelMenu)}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Model mode selector"
              >
                <Settings2 className="h-3.5 w-3.5" />
                <span className="font-medium">{currentMode?.label || "Auto"}</span>
              </button>

              {showModelMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowModelMenu(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-white/10 bg-[#0b1320] p-1.5 shadow-2xl shadow-black/40">
                    <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                      AI Model
                    </p>
                    {MODEL_MODES.map((mode) => (
                      <button
                        key={mode.value}
                        onClick={() => handleModeChange(mode.value)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                          modelMode === mode.value
                            ? "bg-cyan-500/10 text-cyan-300"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <div
                          className={`h-2 w-2 rounded-full ${
                            modelMode === mode.value
                              ? "bg-cyan-400"
                              : "bg-slate-600"
                          }`}
                        />
                        <div>
                          <p className="font-medium">{mode.label}</p>
                          <p className="text-[10px] text-slate-500">
                            {mode.desc}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Auth Buttons */}
            {user ? (
              <div className="hidden items-center gap-3 sm:flex">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  <User className="h-3.5 w-3.5" />
                  <span className="max-w-[100px] truncate">
                    {user.name || user.email}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400 transition hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30"
                  aria-label="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  to="/login"
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
                >
                  Get started <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 md:hidden"
              aria-label="Open navigation"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-[#071018]/95 backdrop-blur-xl md:hidden">
            <div className="space-y-1 px-6 py-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-xl px-4 py-3 text-sm transition ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-slate-300 hover:bg-white/5"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="my-3 border-t border-white/5" />

              {/* Mobile model mode selector */}
              <div className="px-4 py-2">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  AI Model
                </p>
                <div className="flex flex-wrap gap-2">
                  {MODEL_MODES.map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => handleModeChange(mode.value)}
                      className={`rounded-lg px-3 py-1.5 text-xs transition ${
                        modelMode === mode.value
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          : "bg-white/5 text-slate-400 border border-white/10 hover:text-white"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="my-3 border-t border-white/5" />

              {/* Mobile auth */}
              {user ? (
                <div className="space-y-2 px-4 py-2">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition"
                  >
                    <User className="h-4 w-4" />
                    <span>{user.name || user.email}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm text-red-400 transition hover:text-red-300"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 px-4 py-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-center text-sm text-slate-300 transition hover:bg-white/10"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 rounded-xl border border-amber-300/30 bg-amber-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
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
