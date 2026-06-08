import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
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
  Zap,
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

const AI_FEATURE_PATHS = ["/xray-diagnosis", "/health-plans", "/mental-health"];

const SiteLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modelMode, setModelMode] = useState("auto");
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/model/mode`)
      .then((res) => setModelMode(res.data.mode))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
  const showModelSelector = AI_FEATURE_PATHS.some((p) =>
    location.pathname.startsWith(p)
  );

  return (
    <div
      style={{ minHeight: "100vh", background: "#0F0F12", color: "#fff", position: "relative", overflowX: "hidden" }}
    >
      {/* ── Decorative Orbs ── */}
      <div
        className="orb orb-purple"
        style={{ width: 600, height: 600, left: "-200px", top: "-200px" }}
      />
      <div
        className="orb orb-teal"
        style={{ width: 500, height: 500, right: "-150px", top: "300px" }}
      />
      <div
        className="orb orb-amber"
        style={{ width: 400, height: 400, bottom: "-100px", left: "30%" }}
      />

      {/* ─────────── HEADER ─────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
          background: scrolled ? "rgba(15,15,18,0.88)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          transition: "background 0.3s, border-color 0.3s, backdrop-filter 0.3s",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 72,
            padding: "0 1rem",
          }}
          className="sm:px-8"
        >
          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "linear-gradient(135deg, #7C5CFF 0%, #5B3FCC 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 20px rgba(124,92,255,0.4)",
                flexShrink: 0,
              }}
            >
              <HeartPulse style={{ width: 18, height: 18, color: "#fff" }} />
            </div>
            {/* Brand text — hide subtitle on mobile to save space */}
            <div className="hidden xs:block sm:block">
              <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#A1A1AA", textTransform: "uppercase", margin: 0 }}>
                MediRAG
              </p>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0, marginTop: 1, whiteSpace: "nowrap" }}>
                Care that converts into clarity
              </p>
            </div>
            {/* Show only wordmark on mobile */}
            <span className="sm:hidden" style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>
              MediRAG
            </span>
          </Link>

          {/* Desktop Nav — hidden on mobile, shown md+ */}
          <nav className="hidden md:flex" style={{ alignItems: "center", gap: 4 }}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                style={({ isActive }) => ({
                  padding: "7px 18px",
                  borderRadius: 9999,
                  fontSize: 14,
                  fontWeight: 500,
                  color: isActive ? "#fff" : "#A1A1AA",
                  background: isActive ? "rgba(124,92,255,0.15)" : "transparent",
                  border: isActive ? "1px solid rgba(124,92,255,0.35)" : "1px solid transparent",
                  transition: "all 0.2s",
                  textDecoration: "none",
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right section */}
          <div className="flex" style={{ alignItems: "center", gap: 10 }}>
            {/* Model selector */}
            {showModelSelector && (
              <div style={{ position: "relative" }} className="hidden sm:block">
                <button
                  type="button"
                  onClick={() => setShowModelMenu(!showModelMenu)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 9999,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.05)",
                    color: "#A1A1AA",
                    fontSize: 12,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  aria-label="Model mode selector"
                >
                  <Settings2 style={{ width: 14, height: 14 }} />
                  <span style={{ fontWeight: 500 }}>{currentMode?.label || "Auto"}</span>
                </button>

                {showModelMenu && (
                  <>
                    <div
                      style={{ position: "fixed", inset: 0, zIndex: 40 }}
                      onClick={() => setShowModelMenu(false)}
                    />
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "calc(100% + 8px)",
                        zIndex: 50,
                        width: 200,
                        borderRadius: 16,
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "#16161C",
                        padding: "6px",
                        boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
                      }}
                    >
                      <p
                        style={{
                          padding: "8px 12px 4px",
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: "0.15em",
                          color: "#52525B",
                          textTransform: "uppercase",
                          margin: 0,
                        }}
                      >
                        AI Model
                      </p>
                      {MODEL_MODES.map((mode) => (
                        <button
                          key={mode.value}
                          onClick={() => handleModeChange(mode.value)}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "8px 12px",
                            borderRadius: 10,
                            background: modelMode === mode.value ? "rgba(124,92,255,0.15)" : "transparent",
                            color: modelMode === mode.value ? "#7C5CFF" : "#A1A1AA",
                            fontSize: 13,
                            fontWeight: 500,
                            border: "none",
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "all 0.15s",
                          }}
                        >
                          <div
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              background: modelMode === mode.value ? "#7C5CFF" : "#3F3F46",
                              flexShrink: 0,
                            }}
                          />
                          <div>
                            <p style={{ margin: 0, fontSize: 13 }}>{mode.label}</p>
                            <p style={{ margin: 0, fontSize: 10, color: "#52525B" }}>{mode.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Auth Buttons */}
            {user ? (
              <div className="hidden sm:flex" style={{ alignItems: "center", gap: 8 }}>
                <Link
                  to="/profile"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "7px 14px",
                    borderRadius: 9999,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.05)",
                    color: "#E4E4E7",
                    fontSize: 13,
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" style={{ width: 18, height: 18, borderRadius: "50%" }} />
                  ) : (
                    <User style={{ width: 14, height: 14 }} />
                  )}
                  <span style={{ maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.name || user.email}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 12px",
                    borderRadius: 9999,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.05)",
                    color: "#A1A1AA",
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  aria-label="Sign out"
                >
                  <LogOut style={{ width: 14, height: 14 }} />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex" style={{ alignItems: "center", gap: 8 }}>
                <Link
                  to="/login"
                  style={{
                    padding: "7px 18px",
                    borderRadius: 9999,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "transparent",
                    color: "#E4E4E7",
                    fontSize: 14,
                    fontWeight: 500,
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 18px",
                    borderRadius: 9999,
                    background: "#7C5CFF",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "all 0.2s",
                    boxShadow: "0 4px 16px rgba(124,92,255,0.35)",
                  }}
                >
                  Get started <ArrowUpRight style={{ width: 15, height: 15 }} />
                </Link>
              </div>
            )}

            {/* Mobile menu button — hidden on md+ */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.05)",
                color: "#E4E4E7",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
              aria-label="Open navigation"
              className="flex md:hidden"
            >
              {mobileMenuOpen ? (
                <X style={{ width: 18, height: 18 }} />
              ) : (
                <Menu style={{ width: 18, height: 18 }} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(15,15,18,0.97)",
              backdropFilter: "blur(20px)",
            }}
            className="md:hidden"
          >
            <div style={{ padding: "1rem 1.5rem 1.5rem" }}>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setMobileMenuOpen(false)}
                  style={({ isActive }) => ({
                    display: "block",
                    padding: "11px 16px",
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 500,
                    color: isActive ? "#fff" : "#A1A1AA",
                    background: isActive ? "rgba(124,92,255,0.15)" : "transparent",
                    textDecoration: "none",
                    marginBottom: 4,
                    transition: "all 0.2s",
                  })}
                >
                  {item.label}
                </NavLink>
              ))}

              <div style={{ margin: "12px 0", height: 1, background: "rgba(255,255,255,0.06)" }} />

              {showModelSelector && (
                <div style={{ padding: "8px 0" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "#52525B", textTransform: "uppercase", margin: "0 0 10px" }}>
                    AI Model
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {MODEL_MODES.map((mode) => (
                      <button
                        key={mode.value}
                        onClick={() => handleModeChange(mode.value)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 500,
                          background: modelMode === mode.value ? "rgba(124,92,255,0.2)" : "rgba(255,255,255,0.05)",
                          color: modelMode === mode.value ? "#7C5CFF" : "#A1A1AA",
                          border: modelMode === mode.value ? "1px solid rgba(124,92,255,0.4)" : "1px solid rgba(255,255,255,0.1)",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ margin: "12px 0", height: 1, background: "rgba(255,255,255,0.06)" }} />

              {user ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#E4E4E7", padding: "10px 0", textDecoration: "none" }}
                  >
                    <User style={{ width: 16, height: 16 }} />
                    {user.name || user.email}
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#F87171", background: "none", border: "none", cursor: "pointer", padding: "10px 0" }}
                  >
                    <LogOut style={{ width: 16, height: 16 }} />
                    Sign out
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 10 }}>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "#E4E4E7", fontSize: 14, fontWeight: 500, textAlign: "center", textDecoration: "none" }}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ flex: 1, padding: "12px", borderRadius: 12, background: "#7C5CFF", color: "#fff", fontSize: 14, fontWeight: 600, textAlign: "center", textDecoration: "none" }}
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ─────────── MAIN ─────────── */}
      <main style={{ position: "relative", zIndex: 10 }}>{children}</main>

      {/* ─────────── FOOTER ─────────── */}
      <footer
        style={{
          position: "relative",
          zIndex: 10,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(15,15,18,0.95)",
          marginTop: 80,
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "4rem 2rem 3rem" }}>
          <div
            style={{
              borderRadius: 28,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "linear-gradient(135deg, rgba(124,92,255,0.07) 0%, rgba(255,255,255,0.03) 100%)",
              padding: "2.5rem",
              backdropFilter: "blur(20px)",
            }}
          >
            <div
              style={{
                display: "grid",
                gap: "2.5rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              }}
            >
              {/* Brand */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      background: "linear-gradient(135deg, #7C5CFF, #5B3FCC)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 0 16px rgba(124,92,255,0.35)",
                    }}
                  >
                    <HeartPulse style={{ width: 18, height: 18, color: "#fff" }} />
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>MediRAG</span>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.8, color: "#A1A1AA", maxWidth: 280, margin: "0 0 20px" }}>
                  Practical digital healthcare for patients and care teams. Access imaging, plans, appointments, and support in one platform.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {["Fast access", "AI-assisted", "Clean UI"].map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: "4px 12px",
                        borderRadius: 9999,
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(255,255,255,0.04)",
                        fontSize: 11,
                        color: "#A1A1AA",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Explore */}
              <div>
                <h4
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.2em",
                    color: "#52525B",
                    textTransform: "uppercase",
                    margin: "0 0 20px",
                  }}
                >
                  Explore
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { to: "/services", label: "Services" },
                    { to: "/health-plans", label: "Health Plans" },
                    { to: "/mental-health", label: "Mental Health" },
                    { to: "/contact", label: "Contact" },
                  ].map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      style={{ fontSize: 14, color: "#A1A1AA", textDecoration: "none", transition: "color 0.2s" }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Trust card */}
              <div
                style={{
                  borderRadius: 20,
                  border: "1px solid rgba(124,92,255,0.2)",
                  background: "rgba(124,92,255,0.07)",
                  padding: "1.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <ShieldCheck style={{ width: 20, height: 20, color: "#7C5CFF" }} />
                  <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#7C5CFF" }}>
                    Trusted system
                  </span>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.8, color: "#A1A1AA", margin: "0 0 20px" }}>
                  Built for clarity, reliable triage guidance, and clear next actions for follow-up care.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { icon: CalendarDays, label: "24/7 guided support", color: "#7C5CFF" },
                    { icon: Brain, label: "AI-assisted care journeys", color: "#14B8A6" },
                    { icon: Zap, label: "Secure, reassuring interface", color: "#F59E0B" },
                  ].map(({ icon: Icon, label, color }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#E4E4E7" }}>
                      <Icon style={{ width: 15, height: 15, color, flexShrink: 0 }} />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "2rem",
                paddingTop: "1.5rem",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <p style={{ margin: 0, fontSize: 12, color: "#52525B" }}>
                © {new Date().getFullYear()} MediRAG. All rights reserved.
              </p>
              <Link to="/privacy" style={{ fontSize: 12, color: "#52525B", textDecoration: "none" }}>
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SiteLayout;
