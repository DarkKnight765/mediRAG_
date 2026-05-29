import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  LifeBuoy,
  Mail,
  MapPin,
  MessageSquareMore,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const ContactPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.96fr_1.04fr] lg:items-start">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-300">
            <Sparkles className="h-4 w-4 text-amber-300" /> Contact & support
          </div>

          <h1 className="mt-6 max-w-2xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            Let’s make every next step feel easier.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300">
            Reach out for demos, support, scheduling questions, or help finding
            the right care path.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <ContactCard icon={Phone} label="Phone" value="+1 (555) 123-4567" />
            <ContactCard icon={Mail} label="Email" value="hello@medirag.ai" />
            <ContactCard
              icon={MapPin}
              label="Location"
              value="Los Angeles, CA"
            />
            <ContactCard
              icon={MessageSquareMore}
              label="Response"
              value="Usually within 1 business day"
            />
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-[#0d1723] p-6">
            <div className="flex items-center gap-3 text-amber-300">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-[0.35em]">
                Trusted support
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              We’ll respond with clear guidance, not clutter — so you always
              know where to go next.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" /> Quick
                response window
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                <Clock3 className="h-4 w-4 text-cyan-300" /> Calm, clear
                follow-up
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
            >
              Home <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              to="/appointments"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Book an appointment
            </Link>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-[#0b1320]/90 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-white">Send a message</h2>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Share what you need and we’ll route you to the right place.
          </p>

          <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <LifeBuoy className="h-4 w-4 text-amber-300" />
              Designed for fast triage and friendly support.
            </div>
          </div>

          <form className="mt-8 space-y-5">
            <Field label="Name" placeholder="Your name" />
            <Field label="Email" type="email" placeholder="you@example.com" />
            <Field label="Subject" placeholder="How can we help?" />
            <Field
              label="Message"
              as="textarea"
              placeholder="Tell us a little about your request..."
            />

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
            >
              Send message <ArrowUpRight className="h-4 w-4" />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

const ContactCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string;
}> = ({ icon: Icon, label, value }) => (
  <div className="rounded-3xl border border-white/10 bg-[#0d1723] p-4">
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-amber-300">
      <Icon className="h-5 w-5" />
    </div>
    <p className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-500">
      {label}
    </p>
    <p className="mt-2 text-sm leading-6 text-slate-200">{value}</p>
  </div>
);

const Field: React.FC<{
  label: string;
  placeholder: string;
  type?: string;
  as?: "input" | "textarea";
}> = ({ label, placeholder, type = "text", as = "input" }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-slate-200">
      {label}
    </span>
    {as === "textarea" ? (
      <textarea
        placeholder={placeholder}
        rows={5}
        className="w-full rounded-[1.25rem] border border-white/10 bg-[#0d1723] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-amber-300/40 focus:bg-white/10"
      />
    ) : (
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-[1.25rem] border border-white/10 bg-[#0d1723] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-amber-300/40 focus:bg-white/10"
      />
    )}
  </label>
);

export default ContactPage;
