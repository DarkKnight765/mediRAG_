import React, { ChangeEvent, FormEvent, useState } from "react";
import {
  Calendar,
  Check,
  ChevronDown,
  Clipboard,
  Clock,
  Heart,
  Mail,
  Phone,
  Sparkles,
  Stethoscope,
  User,
} from "lucide-react";
import { createAppointment } from "../api/appointmentApi";

interface Appointment {
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  doctor: string;
  appointmentType: string;
  reason: string;
  symptoms: string;
  medicalHistory: string;
}

const doctors = [
  "Dr. Smith - General Practice",
  "Dr. Johnson - Cardiology",
  "Dr. Williams - Pediatrics",
  "Dr. Brown - Dermatology",
  "Dr. Jones - Orthopedics",
];

const appointmentTypes = [
  "Regular Check-up",
  "Follow-up",
  "New Patient Consultation",
  "Urgent Care",
  "Specialist Consultation",
  "Vaccination",
];

const AppointmentScheduling: React.FC = () => {
  const [appointment, setAppointment] = useState<Appointment>({
    date: "",
    time: "",
    name: "",
    email: "",
    phone: "",
    doctor: "",
    appointmentType: "",
    reason: "",
    symptoms: "",
    medicalHistory: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setAppointment((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitted(false);
    setIsSubmitting(true);

    if (
      !appointment.date ||
      !appointment.time ||
      !appointment.name ||
      !appointment.email ||
      !appointment.phone ||
      !appointment.doctor ||
      !appointment.appointmentType
    ) {
      setError("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      await createAppointment(appointment);
      setIsSubmitted(true);
    } catch {
      setError(
        "An error occurred while scheduling your appointment. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <main className="space-y-10">
        <section className="grid gap-8 lg:grid-cols-[1fr_0.92fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-300">
              <Sparkles className="h-4 w-4 text-amber-300" /> Appointment
              booking
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              Schedule care in a calm, premium flow.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              A focused booking experience designed to feel as polished as the
              rest of the site.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Pill>Fast booking</Pill>
              <Pill>Clear next steps</Pill>
              <Pill>Private and calm</Pill>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-white">
              Booking essentials
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <InfoCard label="Doctors" value="5 specialists" />
              <InfoCard label="Types" value="6 visit options" />
              <InfoCard label="Focus" value="Easy completion" />
              <InfoCard label="Style" value="Premium theme" />
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2rem] border border-white/10 bg-[#0d1723] p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <h2 className="text-2xl font-semibold text-white">
              Medical appointment form
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Fill in the form below and we’ll handle the rest.
            </p>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <Field
                    label="Date*"
                    icon={Calendar}
                    type="date"
                    name="date"
                    value={appointment.date}
                    onChange={handleInputChange}
                    required
                  />
                  <Field
                    label="Time*"
                    icon={Clock}
                    type="time"
                    name="time"
                    value={appointment.time}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <Field
                  label="Full Name*"
                  icon={User}
                  type="text"
                  name="name"
                  value={appointment.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                />

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <Field
                    label="Email*"
                    icon={Mail}
                    type="email"
                    name="email"
                    value={appointment.email}
                    onChange={handleInputChange}
                    required
                    placeholder="you@example.com"
                  />
                  <Field
                    label="Phone Number*"
                    icon={Phone}
                    type="tel"
                    name="phone"
                    value={appointment.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="(123) 456-7890"
                  />
                </div>

                <SelectField
                  label="Select Doctor*"
                  icon={Stethoscope}
                  name="doctor"
                  value={appointment.doctor}
                  onChange={handleInputChange}
                  required
                  options={doctors}
                  placeholder="Select a doctor"
                />
                <SelectField
                  label="Appointment Type*"
                  icon={Clipboard}
                  name="appointmentType"
                  value={appointment.appointmentType}
                  onChange={handleInputChange}
                  required
                  options={appointmentTypes}
                  placeholder="Select appointment type"
                />

                <TextareaField
                  label="Reason for Visit"
                  icon={Clipboard}
                  name="reason"
                  value={appointment.reason}
                  onChange={handleInputChange}
                  placeholder="Tell us why you are booking today"
                />
                <TextareaField
                  label="Current Symptoms"
                  icon={Heart}
                  name="symptoms"
                  value={appointment.symptoms}
                  onChange={handleInputChange}
                  placeholder="Describe symptoms if applicable"
                />
                <TextareaField
                  label="Brief Medical History"
                  icon={Clipboard}
                  name="medicalHistory"
                  value={appointment.medicalHistory}
                  onChange={handleInputChange}
                  placeholder="Anything helpful for the clinician to know"
                />

                {error && (
                  <div
                    className="rounded-3xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${
                    isSubmitting
                      ? "cursor-not-allowed bg-white/10 text-slate-500"
                      : "bg-amber-300 text-slate-950 hover:bg-amber-200"
                  }`}
                >
                  {isSubmitting ? "Scheduling..." : "Schedule Appointment"}
                  {!isSubmitting && <Calendar className="h-4 w-4" />}
                </button>
              </form>
            ) : (
              <div className="mt-8 rounded-[1.75rem] border border-emerald-400/20 bg-[linear-gradient(135deg,rgba(16,185,129,0.16),rgba(255,255,255,0.04))] p-8 shadow-lg shadow-black/20">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-emerald-200">
                  <Check className="h-4 w-4" /> Confirmation ready
                </div>
                <h3 className="mt-5 text-3xl font-semibold text-white">
                  Appointment Scheduled
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                  Your appointment with {appointment.doctor} is confirmed for{" "}
                  {appointment.date} at {appointment.time}. We’ll keep
                  everything clear and easy to follow.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <MiniInfo
                    label="Visit type"
                    value={appointment.appointmentType}
                  />
                  <MiniInfo label="Contact" value={appointment.email} />
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-[#0d1723] p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                    Next steps
                  </p>
                  <div className="mt-4 space-y-3 text-sm text-slate-300">
                    <div className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-emerald-300" />{" "}
                      Confirmation sent to your inbox
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-emerald-300" /> Bring any
                      notes or documents you need
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-emerald-300" /> Reach out
                      if you need to adjust the booking
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <h3 className="text-xl font-semibold text-white">
                What happens next
              </h3>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                {[
                  "Pick the clinician and visit type",
                  "Send your preferences in one submit",
                  "Receive a clean confirmation",
                  "Follow up with the care team if needed",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0d1723] px-4 py-3"
                  >
                    <Check className="h-4 w-4 text-emerald-300" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[#0b1320]/90 p-6 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                Calm by design
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                The booking form uses the same dark premium look as the rest of
                the app so every step feels connected.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

const Field: React.FC<{
  label: string;
  icon: React.ElementType;
  type: string;
  name: string;
  value: string;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  required?: boolean;
  placeholder?: string;
}> = ({
  label,
  icon: Icon,
  type,
  name,
  value,
  onChange,
  required,
  placeholder,
}) => (
  <div>
    <label
      htmlFor={name}
      className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200"
    >
      <Icon className="h-4 w-4 text-amber-300" />
      {label}
    </label>
    <input
      type={type}
      name={name}
      id={name}
      required={required}
      placeholder={placeholder}
      className="block w-full rounded-[1.25rem] border border-white/10 bg-[#0b1320] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/40 focus:bg-white/10"
      value={value}
      onChange={onChange}
    />
  </div>
);

const SelectField: React.FC<{
  label: string;
  icon: React.ElementType;
  name: string;
  value: string;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  required?: boolean;
  options: string[];
  placeholder: string;
}> = ({
  label,
  icon: Icon,
  name,
  value,
  onChange,
  required,
  options,
  placeholder,
}) => (
  <div>
    <label
      htmlFor={name}
      className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200"
    >
      <Icon className="h-4 w-4 text-amber-300" />
      {label}
    </label>
    <div className="relative">
      <select
        name={name}
        id={name}
        required={required}
        className="block w-full appearance-none rounded-[1.25rem] border border-white/10 bg-[#0b1320] px-4 py-3 pr-11 text-sm text-white outline-none transition focus:border-amber-300/40 focus:bg-white/10"
        value={value}
        onChange={onChange}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  </div>
);

const TextareaField: React.FC<{
  label: string;
  icon: React.ElementType;
  name: string;
  value: string;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  placeholder?: string;
}> = ({ label, icon: Icon, name, value, onChange, placeholder }) => (
  <div>
    <label
      htmlFor={name}
      className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200"
    >
      <Icon className="h-4 w-4 text-amber-300" />
      {label}
    </label>
    <textarea
      name={name}
      id={name}
      rows={3}
      placeholder={placeholder}
      className="block w-full rounded-[1.25rem] border border-white/10 bg-[#0b1320] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/40 focus:bg-white/10"
      value={value}
      onChange={onChange}
    />
  </div>
);

const InfoCard: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="rounded-3xl border border-white/10 bg-[#0d1723] p-4">
    <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
      {label}
    </div>
    <div className="mt-2 text-lg font-semibold text-white">{value}</div>
  </div>
);

const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200">
    {children}
  </div>
);

const MiniInfo: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="rounded-3xl border border-white/10 bg-[#0d1723] p-4">
    <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
      {label}
    </div>
    <div className="mt-2 text-sm font-semibold text-white">{value}</div>
  </div>
);

export default AppointmentScheduling;
