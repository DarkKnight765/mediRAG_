import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import {
  User,
  Calendar,
  Activity,
  Clock,
  ChevronRight,
  Shield,
  LogOut,
  X,
  CheckCircle2,
  Utensils,
  Moon,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import API_BASE_URL from "../api/config";
import { useNavigate } from "react-router-dom";

interface ProfileData {
  id: number;
  name: string | null;
  email: string;
  createdAt: string;
  appointments: any[];
  healthPlans: any[];
  conversations: any[];
}

const ProfilePage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);

  const parsePlanTitle = (inputStr: string) => {
    try {
      const data = JSON.parse(inputStr);
      const parts = [];
      if (data.age) parts.push(`${data.age}yo`);
      if (data.weight) parts.push(`${data.weight}kg`);
      if (data.dietaryRestrictions && data.dietaryRestrictions !== 'none') parts.push(data.dietaryRestrictions);
      return parts.length > 0 ? `Plan for ${parts.join(', ')}` : 'Personalized Health Plan';
    } catch (e) {
      return 'Personalized Health Plan';
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/user/profile`);
        setProfile(response.data);
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <User className="w-6 h-6 text-emerald-500/50" />
          </div>
        </div>
        <p className="mt-6 text-slate-400 animate-pulse text-lg tracking-wide font-light">
          Loading profile...
        </p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-red-500/30">
          <Shield className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">
          Oops, something went wrong
        </h2>
        <p className="text-slate-400 mb-8 max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium rounded-lg transition-colors shadow-lg shadow-emerald-500/20"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/60 p-8 sm:p-12 shadow-2xl">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-8">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 p-[2px] shadow-lg shadow-emerald-500/20 flex-shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                <span className="text-3xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-cyan-400">
                  {profile.name
                    ? profile.name.charAt(0).toUpperCase()
                    : profile.email.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left space-y-2 pt-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {profile.name || "MediRAG User"}
              </h1>
              <p className="text-emerald-400 flex items-center justify-center sm:justify-start gap-2 font-medium">
                <Shield className="w-4 h-4" />
                Verified Patient
              </p>
              <div className="pt-4 flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-8 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {profile.email}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Joined{" "}
                  {new Date(profile.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 sm:pt-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-300 rounded-xl transition-all border border-slate-700 hover:border-red-500/30 font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1: Appointments */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center ring-1 ring-cyan-500/30">
                <Calendar className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Appointments</h2>
            </div>
            
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800/80 p-5 backdrop-blur-xl">
              {profile.appointments.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p>No appointments booked yet.</p>
                  <button onClick={() => navigate('/appointments')} className="mt-4 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">Book Now →</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {profile.appointments.map((apt: any) => (
                    <div key={apt.id} className="group p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 hover:border-cyan-500/30 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-slate-200 group-hover:text-cyan-400 transition-colors">{apt.visitType}</h3>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${apt.status === 'scheduled' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700 text-slate-400'}`}>
                          {apt.status}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400 space-y-1">
                        <p className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {new Date(apt.date).toLocaleDateString()} at {apt.time}</p>
                        <p className="flex items-center gap-2"><User className="w-3.5 h-3.5" /> Dr. {apt.clinician}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Column 2 & 3: Health Plans & Activity */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Health Plans */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/30">
                  <Activity className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Generated Health Plans</h2>
              </div>

              <div className="bg-slate-900/50 rounded-2xl border border-slate-800/80 p-5 backdrop-blur-xl">
                {profile.healthPlans.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Activity className="w-10 h-10 mx-auto mb-4 opacity-20" />
                    <p className="text-lg mb-2">No health plans generated.</p>
                    <button onClick={() => navigate('/health-plans')} className="mt-2 px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-emerald-400 font-medium transition-colors">Create your first plan</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profile.healthPlans.map((plan: any) => (
                      <div key={plan.id} className="group p-5 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between cursor-pointer" onClick={() => setSelectedPlan(plan)}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-400 mb-1 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(plan.createdAt).toLocaleDateString()}
                          </p>
                          <p className="font-medium text-slate-200 truncate group-hover:text-emerald-400 transition-colors">
                            {parsePlanTitle(plan.input)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="px-3 py-1 rounded-md bg-slate-900/80 text-slate-400 font-mono text-xs border border-slate-700/50">{plan.engine}</span>
                          <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors text-slate-500">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {selectedPlan && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0d1723] rounded-[2rem] border border-white/10 shadow-2xl shadow-black max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
              <h2 className="text-xl font-semibold text-white">
                {parsePlanTitle(selectedPlan.input)}
              </h2>
              <button
                onClick={() => setSelectedPlan(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {(() => {
                try {
                  const resultData = JSON.parse(selectedPlan.result);
                  return (
                    <div className="space-y-6">
                      {resultData.diet_plan && resultData.diet_plan.macronutrients && (
                        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                          <h3 className="mb-3 flex items-center text-lg font-semibold text-white">
                            <Utensils className="mr-2 h-5 w-5 text-amber-300" /> Diet Plan
                          </h3>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-3xl border border-white/10 bg-[#0d1723] p-4">
                              <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Calories</div>
                              <div className="mt-2 text-sm font-medium text-white">{resultData.diet_plan.caloric_intake} kcal</div>
                            </div>
                            <div className="rounded-3xl border border-white/10 bg-[#0d1723] p-4">
                              <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Protein</div>
                              <div className="mt-2 text-sm font-medium text-white">{resultData.diet_plan.macronutrients.proteins}</div>
                            </div>
                          </div>
                          
                          <h4 className="mt-6 text-md font-semibold text-white">Meal Plan</h4>
                          {Object.entries(resultData.diet_plan.meal_plan).map(([meal, details]: [string, any]) => (
                            <div key={meal} className="mt-4 rounded-2xl border border-white/10 bg-[#0d1723] p-4">
                              <h5 className="font-semibold capitalize text-white">
                                {meal} <span className="text-slate-400">({details.time})</span>
                              </h5>
                              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                                {details.items.map((item: string, i: number) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {resultData.sleep_routine && (
                        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                          <h3 className="mb-3 flex items-center text-lg font-semibold text-white">
                            <Moon className="mr-2 h-5 w-5 text-cyan-300" /> Sleep Routine
                          </h3>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-3xl border border-white/10 bg-[#0d1723] p-4">
                              <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Bedtime</div>
                              <div className="mt-2 text-sm font-medium text-white">{resultData.sleep_routine.bedtime}</div>
                            </div>
                            <div className="rounded-3xl border border-white/10 bg-[#0d1723] p-4">
                              <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Wake time</div>
                              <div className="mt-2 text-sm font-medium text-white">{resultData.sleep_routine.wake_time}</div>
                            </div>
                          </div>
                          <ul className="mt-4 space-y-2 text-sm text-slate-300">
                            {resultData.sleep_routine.pre_sleep_activities.map((activity: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                                <span>{activity}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                } catch (e) {
                  return <div className="text-slate-400">Failed to load plan details.</div>;
                }
              })()}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ProfilePage;
