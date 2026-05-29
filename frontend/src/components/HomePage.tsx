import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Brain,
  CalendarDays,
  FileText,
  Sparkles,
  Target,
} from "lucide-react";

const quickLinks = [
  {
    icon: FileText,
    title: "Diagnosis",
    text: "X-ray and document analysis",
    to: "/xray-diagnosis",
  },
  {
    icon: Target,
    title: "Plans",
    text: "Personalized health plans",
    to: "/health-plans",
  },
  {
    icon: CalendarDays,
    title: "Appointments",
    text: "Book care in a few steps",
    to: "/appointments",
  },
  {
    icon: Brain,
    title: "AI Support",
    text: "Calm guided conversation",
    to: "/mental-health",
  },
];

const HomePage: React.FC = () => {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8 lg:py-24">
      <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-300">
            <Sparkles className="h-4 w-4 text-amber-300" /> MediRAG
          </div>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
            One home page. Separate pages for everything else.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Use the homepage to orient visitors, then send them to dedicated
            pages for services, plans, appointments, and AI support.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
            >
              View services <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Contact us
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
            Separate pages
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  to={item.to}
                  className="rounded-3xl border border-white/10 bg-[#0d1723] p-5 transition hover:border-amber-300/30 hover:bg-[#111d2a]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-amber-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-white">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
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
