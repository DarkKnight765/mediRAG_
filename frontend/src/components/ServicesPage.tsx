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
  },
  {
    icon: Target,
    title: "Personalized Health Plans",
    description:
      "Generate nutrition and sleep guidance based on your profile and lifestyle needs.",
    link: "/health-plans",
  },
  {
    icon: CalendarDays,
    title: "Appointment Scheduling",
    description:
      "Book care with a guided flow that feels clean, fast, and easy to complete.",
    link: "/appointments",
  },
  {
    icon: Brain,
    title: "Mental Health Support",
    description:
      "Access a calm AI chat experience for check-ins, support, and next steps.",
    link: "/mental-health",
  },
];

const ServicesPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-300">
            <Sparkles className="h-4 w-4 text-amber-300" /> Core services
          </div>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            Services built to feel premium and easy to act on.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Every service is presented like part of one connected journey — less
            clutter, more clarity, better follow-through.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 text-amber-300">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-[0.3em]">
              Designed for trust
            </span>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <MiniMetric value="4" label="Primary paths" />
            <MiniMetric value="24/7" label="Support access" />
            <MiniMetric value="1" label="Connected system" />
            <MiniMetric value="Fast" label="Action-focused UX" />
          </div>
        </div>
      </section>

      <section className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <Link
              key={service.title}
              to={service.link}
              className="group rounded-[1.75rem] border border-white/10 bg-[#0d1723] p-6 transition hover:-translate-y-1 hover:border-amber-300/30 hover:bg-[#111d2a]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-amber-300">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-white">
                {service.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                {service.description}
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-amber-300">
                Open{" "}
                <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          );
        })}
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
            Why it works
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-white">
            Simple entry points, one polished system.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            The UI keeps each service visually aligned so users can move between
            diagnosis, planning, booking, and support without feeling lost.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[#0b1320]/90 p-8 backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
            Flow
          </p>
          <div className="mt-6 space-y-4">
            {[
              "Capture intent quickly",
              "Route users to the right care path",
              "Make next actions obvious",
              "Keep follow-up clear and calm",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
              >
                <Stethoscope className="h-4 w-4 text-cyan-300" /> {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const MiniMetric: React.FC<{ value: string; label: string }> = ({
  value,
  label,
}) => (
  <div className="rounded-3xl border border-white/10 bg-[#0d1723] p-4">
    <div className="text-2xl font-semibold text-white">{value}</div>
    <div className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-500">
      {label}
    </div>
  </div>
);

export default ServicesPage;
