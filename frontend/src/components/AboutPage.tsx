import React from "react";
import { Activity, ClipboardList, HeartPulse, ShieldCheck } from "lucide-react";

const AboutPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-300">
            <ShieldCheck className="h-4 w-4 text-amber-300" /> About MediRAG
          </div>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            Clinical guidance and care navigation in one platform.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            MediRAG helps patients and care teams move from symptoms to next
            actions with structured AI-assisted workflows for imaging review,
            health plans, appointment intake, and behavioral support.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="text-xl font-semibold text-white">Platform focus</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Metric label="Care paths" value="4" />
            <Metric label="Support access" value="24/7" />
            <Metric label="Data format" value="Structured" />
            <Metric label="Primary goal" value="Clinical clarity" />
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <CapabilityCard
          icon={Activity}
          title="Image analysis"
          text="Converts uploaded images and PDFs into concise diagnostic summaries with confidence indicators and suggested follow-up."
        />
        <CapabilityCard
          icon={ClipboardList}
          title="Health planning"
          text="Generates nutrition and sleep plans from profile inputs, with clear meal timing and routine guidance."
        />
        <CapabilityCard
          icon={HeartPulse}
          title="Behavioral support"
          text="Provides conversational mental-health check-ins and practical coping prompts with escalation-aware language."
        />
        <CapabilityCard
          icon={ShieldCheck}
          title="Operational safety"
          text="Maintains service continuity through local model fallback paths and deterministic mock mode for reliability."
        />
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-[#0b1320]/90 p-8 backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">
            Product objective
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Reduce uncertainty for patients and reduce intake friction for care
            teams by presenting actionable guidance at each stage of the care
            journey.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[#0b1320]/90 p-8 backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">
            Scope
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            MediRAG supports early guidance and workflow orchestration. It does
            not replace emergency care, physician diagnosis, or treatment
            decisions.
          </p>
        </div>
      </section>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="rounded-3xl border border-white/10 bg-[#0d1723] p-4">
    <div className="text-2xl font-semibold text-white">{value}</div>
    <div className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-500">
      {label}
    </div>
  </div>
);

const CapabilityCard: React.FC<{
  icon: React.ElementType;
  title: string;
  text: string;
}> = ({ icon: Icon, title, text }) => (
  <div className="rounded-[1.75rem] border border-white/10 bg-[#0d1723] p-6">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-amber-300">
      <Icon className="h-6 w-6" />
    </div>
    <h2 className="mt-5 text-xl font-semibold text-white">{title}</h2>
    <p className="mt-3 text-sm leading-7 text-slate-400">{text}</p>
  </div>
);

export default AboutPage;
