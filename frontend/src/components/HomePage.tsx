import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Brain,
  CalendarDays,
  FileText,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

/* ── Feature cards matching the reference 3-col grid ── */
const features = [
  {
    emoji: "🫀",
    gradientFrom: "#7C5CFF",
    gradientTo: "#5B3FCC",
    title: "Clinical Imaging",
    description:
      "AI-assisted X-ray and clinical document review. Get fast, structured insights for faster triage and decision-making.",
    link: "/xray-diagnosis",
    cta: "Analyse now",
    accentColor: "#7C5CFF",
  },
  {
    emoji: "🧠",
    gradientFrom: "#14B8A6",
    gradientTo: "#0D9488",
    title: "Mental Health Support",
    description:
      "Access a calm AI chat experience for supportive check-ins, risk-aware guidance, and clear next steps.",
    link: "/mental-health",
    cta: "Start session",
    accentColor: "#14B8A6",
  },
  {
    emoji: "📋",
    gradientFrom: "#F59E0B",
    gradientTo: "#D97706",
    title: "Personalized Care Plans",
    description:
      "Generate nutrition and sleep guidance based on your profile. Tailored recommendations for your lifestyle.",
    link: "/health-plans",
    cta: "View plans",
    accentColor: "#F59E0B",
  },
];

/* ── Quick links grid below hero ── */
const quickLinks = [
  {
    icon: FileText,
    title: "Imaging Review",
    text: "AI-assisted X-ray and clinical document insights",
    to: "/xray-diagnosis",
    color: "#7C5CFF",
  },
  {
    icon: Target,
    title: "Care Plans",
    text: "Nutrition and sleep plans tailored to your profile",
    to: "/health-plans",
    color: "#14B8A6",
  },
  {
    icon: CalendarDays,
    title: "Appointments",
    text: "Schedule follow-up care with guided intake",
    to: "/appointments",
    color: "#F59E0B",
  },
  {
    icon: Brain,
    title: "Behavioral Support",
    text: "Supportive check-ins with risk-aware guidance",
    to: "/mental-health",
    color: "#EC4899",
  },
];

/* ── Stats strip ── */
const stats = [
  { value: "25,000+", label: "Patients helped" },
  { value: "5 yrs", label: "Platform maturity" },
  { value: "4", label: "AI-powered tools" },
  { value: "24/7", label: "Support availability" },
];

const HomePage: React.FC = () => {
  /* Animate cards on mount */
  const featureRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const els = featureRef.current?.querySelectorAll<HTMLElement>(".feature-card");
    els?.forEach((el, i) => {
      el.style.animationDelay = `${0.1 + i * 0.13}s`;
      el.classList.add("fade-in-up");
    });
  }, []);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1rem" }} className="sm:px-8">
      {/* ─────────────────── HERO ─────────────────── */}
      <section
        style={{
          paddingTop: "3rem",
          paddingBottom: "3rem",
          textAlign: "center",
          position: "relative",
        }}
        className="sm:pt-20 sm:pb-16 fade-in-up"
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 18px",
            borderRadius: 9999,
            border: "1px solid rgba(124,92,255,0.35)",
            background: "rgba(124,92,255,0.1)",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#A78BFA",
            marginBottom: 28,
          }}
        >
          <Sparkles style={{ width: 14, height: 14 }} />
          MediRAG — Healthcare Platform
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: "clamp(2.6rem, 6vw, 4.4rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            color: "#fff",
            margin: "0 auto 24px",
            maxWidth: 820,
          }}
        >
          Support Better{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #7C5CFF 0%, #A78BFA 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Healthcare
          </span>
        </h1>

        {/* Sub-headline */}
        <p
          style={{
            fontSize: "clamp(1rem, 2vw, 1.15rem)",
            color: "#A1A1AA",
            lineHeight: 1.75,
            maxWidth: 560,
            margin: "0 auto 40px",
          }}
        >
          We've spent the last 5 years helping over{" "}
          <strong style={{ color: "#E4E4E7", fontWeight: 600 }}>25,000 patients</strong>{" "}
          just like yourself access and sustain connected, reliable healthcare support.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            to="/services"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 32px",
              borderRadius: 9999,
              background: "linear-gradient(135deg, #7C5CFF, #5B3FCC)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 8px 28px rgba(124,92,255,0.45)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            id="cta-view-services"
          >
            View Services <ArrowUpRight style={{ width: 16, height: 16 }} />
          </Link>
          <Link
            to="/contact"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "13px 32px",
              borderRadius: 9999,
              border: "1.5px solid rgba(255,255,255,0.22)",
              background: "transparent",
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
              transition: "border-color 0.2s, background 0.2s, transform 0.2s",
            }}
            id="cta-contact-us"
          >
            Contact Us
          </Link>
        </div>

        {/* Stats strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
            marginTop: 48,
            paddingTop: 32,
            borderTop: "1px solid rgba(255,255,255,0.07)",
          }}
          className="sm:flex sm:justify-center sm:flex-wrap"
        >
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "clamp(1.6rem, 3vw, 2rem)",
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: "-0.02em",
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: "#71717A", marginTop: 4, letterSpacing: "0.04em" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────── FEATURE GRID (3-col) ─────────────────── */}
      <section style={{ paddingBottom: "5rem" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#7C5CFF",
              marginBottom: 12,
            }}
          >
            Our Core Services
          </p>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            How we make a difference
          </h2>
        </div>

        <div
          ref={featureRef}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          {features.map((f) => (
            <div
              key={f.title}
              className="feature-card"
              style={{
                borderRadius: 24,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(22,22,28,0.9)",
                padding: "2rem",
                backdropFilter: "blur(12px)",
                transition: "transform 0.25s, border-color 0.25s, box-shadow 0.25s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.transform = "translateY(-6px)";
                el.style.borderColor = `${f.accentColor}40`;
                el.style.boxShadow = `0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px ${f.accentColor}20`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.transform = "translateY(0)";
                el.style.borderColor = "rgba(255,255,255,0.08)";
                el.style.boxShadow = "none";
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  background: `linear-gradient(135deg, ${f.gradientFrom}22, ${f.gradientTo}15)`,
                  border: `1px solid ${f.gradientFrom}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  marginBottom: 20,
                }}
              >
                {f.emoji}
              </div>

              {/* Title */}
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#fff",
                  margin: "0 0 12px",
                }}
              >
                {f.title}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.75,
                  color: "#A1A1AA",
                  margin: "0 0 24px",
                }}
              >
                {f.description}
              </p>

              {/* CTA Link */}
              <Link
                to={f.link}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 14,
                  fontWeight: 700,
                  color: f.accentColor,
                  textDecoration: "none",
                  transition: "gap 0.2s",
                }}
              >
                {f.cta} <ArrowUpRight style={{ width: 15, height: 15 }} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────── QUICK LINKS CARD GRID ─────────────────── */}
      <section style={{ paddingBottom: "6rem" }}>
        <div
          style={{
            borderRadius: 28,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(22,22,28,0.6)",
            padding: "2.5rem",
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#52525B", margin: "0 0 6px" }}>
                Care pathways
              </p>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: 0 }}>
                Jump into a service
              </h2>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 16px",
                borderRadius: 9999,
                border: "1px solid rgba(124,92,255,0.3)",
                background: "rgba(124,92,255,0.1)",
                fontSize: 12,
                color: "#A78BFA",
                fontWeight: 600,
              }}
            >
              <Users style={{ width: 13, height: 13 }} />
              Open access
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  to={item.to}
                  style={{
                    borderRadius: 18,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "#0F0F12",
                    padding: "1.25rem",
                    textDecoration: "none",
                    display: "block",
                    transition: "border-color 0.2s, background 0.2s, transform 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = `${item.color}40`;
                    el.style.background = "rgba(22,22,28,0.9)";
                    el.style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = "rgba(255,255,255,0.08)";
                    el.style.background = "#0F0F12";
                    el.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: `${item.color}18`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 14,
                    }}
                  >
                    <Icon style={{ width: 20, height: 20, color: item.color }} />
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 13, color: "#71717A", margin: 0, lineHeight: 1.6 }}>
                    {item.text}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
