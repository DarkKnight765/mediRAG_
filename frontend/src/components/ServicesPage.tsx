import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Brain,
  CalendarDays,
  FileText,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Target,
} from "lucide-react";

const services = [
  {
    icon: FileText,
    title: "Image & Document Analysis",
    description:
      "Upload scans or documents for fast AI-assisted review with clear, structured output.",
    link: "/xray-diagnosis",
    color: "#7C5CFF",
  },
  {
    icon: Target,
    title: "Personalized Health Plans",
    description:
      "Generate nutrition and sleep guidance based on your profile and lifestyle needs.",
    link: "/health-plans",
    color: "#14B8A6",
  },
  {
    icon: CalendarDays,
    title: "Appointment Scheduling",
    description:
      "Book care with a guided flow that feels clean, fast, and easy to complete.",
    link: "/appointments",
    color: "#F59E0B",
  },
  {
    icon: Brain,
    title: "Mental Health Support",
    description:
      "Access a calm AI chat experience for check-ins, support, and next steps.",
    link: "/mental-health",
    color: "#EC4899",
  },
];

const ServicesPage: React.FC = () => {
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "4rem 2rem 6rem" }}>
      {/* Header */}
      <section style={{ marginBottom: "4rem" }}>
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
            textTransform: "uppercase" as const,
            color: "#A78BFA",
            marginBottom: 24,
          }}
        >
          <Sparkles style={{ width: 14, height: 14 }} />
          Core services
        </div>
        <h1
          style={{
            fontSize: "clamp(2rem, 4.5vw, 3.2rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#fff",
            margin: "0 0 18px",
            maxWidth: 700,
          }}
        >
          Core healthcare services in one connected platform.
        </h1>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.75,
            color: "#A1A1AA",
            maxWidth: 540,
            margin: 0,
          }}
        >
          Every service is presented as part of one connected journey — less clutter, more clarity, better follow-through.
        </p>
      </section>

      {/* Services Grid */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
          marginBottom: "4rem",
        }}
      >
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <Link
              key={service.title}
              to={service.link}
              style={{
                borderRadius: 24,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(22,22,28,0.9)",
                padding: "1.75rem",
                textDecoration: "none",
                display: "block",
                transition: "transform 0.25s, border-color 0.25s, box-shadow 0.25s",
                backdropFilter: "blur(12px)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.transform = "translateY(-5px)";
                el.style.borderColor = `${service.color}40`;
                el.style.boxShadow = `0 20px 50px rgba(0,0,0,0.3), 0 0 0 1px ${service.color}20`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.transform = "translateY(0)";
                el.style.borderColor = "rgba(255,255,255,0.08)";
                el.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: `${service.color}18`,
                  border: `1px solid ${service.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                <Icon style={{ width: 24, height: 24, color: service.color }} />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: "0 0 10px" }}>
                {service.title}
              </h2>
              <p style={{ fontSize: 14, lineHeight: 1.75, color: "#A1A1AA", margin: "0 0 22px" }}>
                {service.description}
              </p>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 700,
                  color: service.color,
                }}
              >
                Open <ArrowUpRight style={{ width: 14, height: 14 }} />
              </div>
            </Link>
          );
        })}
      </section>

      {/* Bottom info cards */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 20,
        }}
      >
        {/* Why it works */}
        <div
          style={{
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(22,22,28,0.7)",
            padding: "2rem",
            backdropFilter: "blur(12px)",
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "#52525B", margin: "0 0 14px" }}>
            Why it works
          </p>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 14px" }}>
            Simple entry points, one polished system.
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: "#A1A1AA", margin: 0 }}>
            The UI keeps each service visually aligned so users can move between diagnosis, planning, booking, and support without feeling lost.
          </p>
        </div>

        {/* Platform metrics */}
        <div
          style={{
            borderRadius: 24,
            border: "1px solid rgba(124,92,255,0.2)",
            background: "rgba(124,92,255,0.06)",
            padding: "2rem",
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <ShieldCheck style={{ width: 20, height: 20, color: "#7C5CFF" }} />
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "#7C5CFF" }}>
              Built for patient trust
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              { value: "4", label: "Primary paths" },
              { value: "24/7", label: "Support access" },
              { value: "1", label: "Connected system" },
              { value: "Clear", label: "Clinical next steps" },
            ].map((m) => (
              <div
                key={m.label}
                style={{
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(15,15,18,0.6)",
                  padding: "14px 16px",
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{m.value}</div>
                <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#52525B", marginTop: 4 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Flow checklist */}
        <div
          style={{
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(22,22,28,0.7)",
            padding: "2rem",
            backdropFilter: "blur(12px)",
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "#52525B", margin: "0 0 20px" }}>
            Flow
          </p>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {[
              "Capture intent quickly",
              "Route users to the right care path",
              "Make next actions obvious",
              "Keep follow-up clear and calm",
            ].map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(15,15,18,0.5)",
                  padding: "12px 16px",
                  fontSize: 14,
                  color: "#E4E4E7",
                }}
              >
                <Stethoscope style={{ width: 15, height: 15, color: "#7C5CFF", flexShrink: 0 }} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
