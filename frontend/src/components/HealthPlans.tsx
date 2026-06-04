import React, { useState } from "react";
import axios from "axios";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Moon,
  Sparkles,
  Utensils,
} from "lucide-react";
import API_BASE_URL from "../api/config";
import {
  alertPanelClass,
  fieldInputClass,
  fieldLabelClass,
  fieldOptionClass,
  fieldSelectClass,
  fieldTextareaClass,
} from "./ui/formTheme";

interface HealthPlanData {
  diet_plan: {
    caloric_intake: number;
    macronutrients: {
      carbohydrates: string;
      proteins: string;
      fats: string;
    };
    meal_plan: {
      [key: string]: {
        time: string;
        items: string[];
      };
    };
  };
  sleep_routine: {
    bedtime: string;
    wake_time: string;
    pre_sleep_activities: string[];
  };
}

const HealthPlans: React.FC = () => {
  const [formData, setFormData] = useState({
    age: "",
    weight: "",
    height: "",
    activityLevel: "",
    dietaryRestrictions: "",
    sleepIssues: "",
  });
  const [healthPlan, setHealthPlan] = useState<HealthPlanData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setHealthPlan(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/HealthPlans`, formData);
      setHealthPlan(response.data.healthPlan);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "An error occurred while processing your request. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <main className="space-y-10">
        <section className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-300">
              <Sparkles className="h-4 w-4 text-amber-300" /> Personalized
              health planning
            </div>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              Build a plan that feels practical, not overwhelming.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Enter a few details and generate nutrition and sleep guidance in a
              polished, easy-to-scan format.
            </p>
          </div>

        </section>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2rem] border border-white/10 bg-[#0d1723] p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <h2 className="text-2xl font-semibold text-white">
              Health Questionnaire
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Share a few basics and we’ll generate a plan centered on your
              routine.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <Field
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleInputChange}
                required
                min="1"
                max="120"
              />
              <Field
                label="Weight (kg)"
                name="weight"
                type="number"
                value={formData.weight}
                onChange={handleInputChange}
                required
                min="1"
                max="500"
                step="0.1"
              />
              <Field
                label="Height (cm)"
                name="height"
                type="number"
                value={formData.height}
                onChange={handleInputChange}
                required
                min="1"
                max="300"
              />

              <div>
                <label htmlFor="activityLevel" className={fieldLabelClass}>
                  Activity Level
                </label>
                <div className="relative">
                  <select
                    id="activityLevel"
                    name="activityLevel"
                    value={formData.activityLevel}
                    onChange={handleInputChange}
                    className={fieldSelectClass}
                    required
                  >
                    <option value="" className="bg-[#0b1320] text-slate-400">
                      Select activity level
                    </option>
                    <option value="sedentary" className={fieldOptionClass}>
                      Sedentary
                    </option>
                    <option value="lightly active" className={fieldOptionClass}>
                      Lightly Active
                    </option>
                    <option
                      value="moderately active"
                      className={fieldOptionClass}
                    >
                      Moderately Active
                    </option>
                    <option value="very active" className={fieldOptionClass}>
                      Very Active
                    </option>
                    <option value="extra active" className={fieldOptionClass}>
                      Extra Active
                    </option>
                  </select>
                </div>
              </div>

              <Field
                label="Dietary Restrictions"
                name="dietaryRestrictions"
                type="text"
                value={formData.dietaryRestrictions}
                onChange={handleInputChange}
                placeholder="e.g., vegetarian, gluten-free, nut allergy"
              />

              <div>
                <label htmlFor="sleepIssues" className={fieldLabelClass}>
                  Sleep Issues
                </label>
                <textarea
                  id="sleepIssues"
                  name="sleepIssues"
                  value={formData.sleepIssues}
                  onChange={handleInputChange}
                  className={fieldTextareaClass}
                  rows={3}
                  placeholder="Describe any sleep issues you're experiencing"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${loading ? "cursor-not-allowed bg-white/10 text-slate-500" : "bg-amber-300 text-slate-950 hover:bg-amber-200"}`}
              >
                {loading ? "Generating..." : "Generate Health Plan"}
                {!loading && <ArrowUpRight className="h-4 w-4" />}
              </button>
            </form>
          </section>

          <aside className="space-y-5">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <h3 className="text-xl font-semibold text-white">
                What you’ll get
              </h3>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                {[
                  "Calorie guidance",
                  "Macro breakdowns",
                  "Meal timing suggestions",
                  "Sleep routine recommendations",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0d1723] px-4 py-3"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className={alertPanelClass} role="alert">
                <AlertCircle className="mr-2 inline h-4 w-4" />
                <span className="block sm:inline">{error}</span>
              </div>
            )}
          </aside>
        </div>

        {healthPlan && (
          <section className="rounded-[2rem] border border-white/10 bg-[#0d1723] p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <h2 className="text-2xl font-semibold text-white">
              Your Personalized Health Plan
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              A clearer snapshot of diet and sleep guidance, organized so it’s
              easy to scan and act on.
            </p>

            {healthPlan.diet_plan && healthPlan.diet_plan.macronutrients && (
              <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                <h3 className="mb-3 flex items-center text-xl font-semibold text-white">
                  <Utensils className="mr-2 h-5 w-5 text-amber-300" /> Diet Plan
                </h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  <InfoTile
                    label="Calories"
                    value={`${healthPlan.diet_plan.caloric_intake} kcal`}
                  />
                  <InfoTile
                    label="Carbs"
                    value={healthPlan.diet_plan.macronutrients.carbohydrates}
                  />
                  <InfoTile
                    label="Proteins"
                    value={healthPlan.diet_plan.macronutrients.proteins}
                  />
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <InfoTile
                    label="Fats"
                    value={healthPlan.diet_plan.macronutrients.fats}
                  />
                </div>

                <h4 className="mt-6 text-lg font-semibold text-white">
                  Meal Plan
                </h4>
                {Object.entries(healthPlan.diet_plan.meal_plan).map(
                  ([meal, details]) => (
                    <div
                      key={meal}
                      className="mt-4 rounded-2xl border border-white/10 bg-[#0d1723] p-4"
                    >
                      <h5 className="font-semibold capitalize text-white">
                        {meal}{" "}
                        <span className="text-slate-400">({details.time})</span>
                      </h5>
                      <ul className="mt-3 space-y-2 text-sm text-slate-300">
                        {details.items.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ),
                )}
              </div>
            )}

            {healthPlan.sleep_routine && (
              <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                <h3 className="mb-3 flex items-center text-xl font-semibold text-white">
                  <Moon className="mr-2 h-5 w-5 text-cyan-300" /> Sleep Routine
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoTile
                    label="Bedtime"
                    value={healthPlan.sleep_routine.bedtime}
                  />
                  <InfoTile
                    label="Wake time"
                    value={healthPlan.sleep_routine.wake_time}
                  />
                </div>
                <h4 className="mt-6 text-lg font-semibold text-white">
                  Pre-sleep Activities
                </h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  {healthPlan.sleep_routine.pre_sleep_activities.map(
                    (activity, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                        <span>{activity}</span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

const Field: React.FC<{
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  required?: boolean;
  min?: string;
  max?: string;
  step?: string;
  placeholder?: string;
}> = ({
  label,
  name,
  type,
  value,
  onChange,
  required,
  min,
  max,
  step,
  placeholder,
}) => (
  <div>
    <label htmlFor={name} className={fieldLabelClass}>
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      className={fieldInputClass}
    />
  </div>
);



const InfoTile: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="rounded-3xl border border-white/10 bg-[#0d1723] p-4">
    <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
      {label}
    </div>
    <div className="mt-2 text-sm font-medium text-white">{value}</div>
  </div>
);

export default HealthPlans;
