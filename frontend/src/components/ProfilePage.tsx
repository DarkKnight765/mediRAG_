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
import { getAppointments, cancelAppointment, updateAppointment } from "../api/appointmentApi";
import { dialogOverlayClass, dialogPanelClass, fieldInputClass, fieldLabelClass, alertPanelClass } from "./ui/formTheme";
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

  const [appointments, setAppointments] = useState<any[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);

  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [modalMode, setModalMode] = useState<'detail' | 'cancel' | 'reschedule' | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const openModal = (mode: 'detail' | 'cancel' | 'reschedule', apt: any) => {
    setSelectedAppointment(apt);
    setModalMode(mode);
    setModalError(null);
    if (mode === 'reschedule') {
      const dateObj = new Date(apt.date);
      setRescheduleDate(dateObj.toISOString().split('T')[0]);
      setRescheduleTime(apt.time);
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedAppointment(null);
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    setModalLoading(true);
    setModalError(null);
    try {
      await cancelAppointment(selectedAppointment.id);
      setAppointments(prev => prev.map(a => a.id === selectedAppointment.id ? { ...a, status: 'CANCELLED' } : a));
      closeModal();
    } catch (err: any) {
      setModalError(err.response?.data?.message || "Failed to cancel appointment");
    } finally {
      setModalLoading(false);
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    setModalLoading(true);
    setModalError(null);
    
    const selectedDate = new Date(rescheduleDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (selectedDate < today) {
      setModalError("Date cannot be in the past");
      setModalLoading(false);
      return;
    }
    
    try {
      await updateAppointment(selectedAppointment.id, { date: rescheduleDate, time: rescheduleTime });
      setAppointments(prev => prev.map(a => a.id === selectedAppointment.id ? { ...a, date: rescheduleDate, time: rescheduleTime } : a));
      closeModal();
    } catch (err: any) {
      setModalError(err.response?.data?.message || "Failed to reschedule appointment");
    } finally {
      setModalLoading(false);
    }
  };

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

  useEffect(() => {
    const fetchUserAppointments = async () => {
      try {
        const response = await getAppointments();
        setAppointments(response.data);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setAppointmentsError("Failed to load appointments.");
      } finally {
        setAppointmentsLoading(false);
      }
    };

    fetchUserAppointments();
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
              <h2 className="text-xl font-semibold text-white">Your Appointments</h2>
            </div>
            
            {/* Stats Row */}
            {!appointmentsLoading && appointments.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
                  <div className="text-xs uppercase text-slate-500 mb-1">Upcoming</div>
                  <div className="text-2xl font-bold text-cyan-400">{appointments.filter(a => new Date(a.date) >= new Date(new Date().setHours(0,0,0,0)) && a.status !== 'CANCELLED' && a.status !== 'COMPLETED').length}</div>
                </div>
                <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
                  <div className="text-xs uppercase text-slate-500 mb-1">Total</div>
                  <div className="text-2xl font-bold text-white">{appointments.length}</div>
                </div>
              </div>
            )}
            
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800/80 p-5 backdrop-blur-xl">
              {appointmentsLoading ? (
                <div className="text-center py-8 text-slate-400 animate-pulse">
                  Loading appointments...
                </div>
              ) : appointmentsError ? (
                <div className="text-center py-8 text-red-400 bg-red-500/10 rounded-xl border border-red-500/20">
                  {appointmentsError}
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p>No appointments booked yet.</p>
                  <button onClick={() => navigate('/appointments')} className="mt-4 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">Book your first appointment →</button>
                </div>
              ) : (
                <div className="space-y-6">
                  {(() => {
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    const upcoming = appointments.filter(a => new Date(a.date) >= today && a.status !== 'CANCELLED' && a.status !== 'COMPLETED');
                    const past = appointments.filter(a => new Date(a.date) < today || a.status === 'COMPLETED' || a.status === 'CANCELLED');

                    const renderAptList = (list: any[]) => list.map((apt: any) => (
                      <div 
                        key={apt.id} 
                        onClick={() => openModal('detail', apt)}
                        className="group p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 hover:border-cyan-500/30 transition-all cursor-pointer flex flex-col mb-3 last:mb-0"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-slate-200 group-hover:text-cyan-400 transition-colors">
                            {apt.specialty ? `${apt.specialty} — ` : ''}{apt.appointmentType}
                          </h3>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                            apt.status === 'SCHEDULED' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 
                            apt.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            apt.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                            apt.status === 'IN_PROGRESS' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                            apt.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            apt.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                            'bg-slate-700 text-slate-400 border-slate-600'
                          }`}>
                            {apt.status === 'CONFIRMED' ? '✅ Confirmed' :
                             apt.status === 'PENDING' ? '⏳ Pending' :
                             apt.status === 'IN_PROGRESS' ? '🏥 In Progress' :
                             apt.status === 'COMPLETED' ? '✔ Completed' :
                             apt.status}
                          </span>
                        </div>
                        <div className="text-sm text-slate-400 space-y-1">
                          <p className="flex items-center gap-2">📅 {new Date(apt.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          <p className="flex items-center gap-2">⏰ {apt.time}</p>
                          <p className="flex items-center gap-2">👨‍⚕️ {apt.doctor}</p>
                        </div>
                        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                          {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); openModal('reschedule', apt); }}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/50 text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors border border-transparent hover:border-cyan-500/30"
                            >
                              Reschedule
                            </button>
                          )}
                          {(apt.status === 'SCHEDULED' || apt.status === 'PENDING') && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); openModal('cancel', apt); }}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/50 text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-colors border border-transparent hover:border-red-500/30"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    ));

                    return (
                      <>
                        {upcoming.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Upcoming</h3>
                            {renderAptList(upcoming)}
                          </div>
                        )}
                        {past.length > 0 && (
                          <div className={upcoming.length > 0 ? "mt-6" : ""}>
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Past</h3>
                            {renderAptList(past)}
                          </div>
                        )}
                      </>
                    );
                  })()}
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

      {/* Appointment Modals */}
      {modalMode && selectedAppointment && createPortal(
        <div className={dialogOverlayClass} onClick={closeModal}>
          <div className={`${dialogPanelClass} max-w-xl`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">
                {modalMode === 'cancel' ? 'Cancel Appointment' : modalMode === 'reschedule' ? 'Reschedule Appointment' : 'Appointment Details'}
              </h2>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {modalError && (
                <div className={`${alertPanelClass} mb-4`} role="alert">
                  {modalError}
                </div>
              )}

              {modalMode === 'cancel' && (
                <div className="space-y-6">
                  <p className="text-slate-300">Are you sure you want to cancel your appointment with {selectedAppointment.doctor} on {new Date(selectedAppointment.date).toLocaleDateString()} at {selectedAppointment.time}?</p>
                  <div className="flex gap-3 justify-end mt-6">
                    <button onClick={closeModal} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors" disabled={modalLoading}>Keep Appointment</button>
                    <button onClick={handleCancelAppointment} className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors" disabled={modalLoading}>
                      {modalLoading ? "Cancelling..." : "Cancel Appointment"}
                    </button>
                  </div>
                </div>
              )}

              {modalMode === 'reschedule' && (
                <form onSubmit={handleRescheduleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={fieldLabelClass}>New Date</label>
                      <input type="date" required value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)} className={fieldInputClass} />
                    </div>
                    <div>
                      <label className={fieldLabelClass}>New Time</label>
                      <input type="time" required value={rescheduleTime} onChange={e => setRescheduleTime(e.target.value)} className={fieldInputClass} />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end mt-6">
                    <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors" disabled={modalLoading}>Discard</button>
                    <button type="submit" className="px-4 py-2 rounded-xl text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-colors" disabled={modalLoading}>
                      {modalLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}

              {modalMode === 'detail' && (
                <div className="space-y-4 text-sm text-slate-300">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 border-b border-white/10 pb-4">
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Patient</span>
                      <span className="text-white font-medium">{selectedAppointment.patientName}</span>
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Status</span>
                      <span className="text-white font-medium">{selectedAppointment.status}</span>
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Doctor</span>
                      <span className="text-white font-medium">{selectedAppointment.doctor}</span>
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Specialty</span>
                      <span className="text-white font-medium">{selectedAppointment.specialty}</span>
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Date</span>
                      <span className="text-white font-medium">{new Date(selectedAppointment.date).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Time</span>
                      <span className="text-white font-medium">{selectedAppointment.time}</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <span className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Reason for Visit</span>
                    <p className="bg-[#0b1320] p-3 rounded-xl border border-white/5">{selectedAppointment.reasonForVisit}</p>
                  </div>
                  {selectedAppointment.symptoms && (
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Symptoms</span>
                      <p className="bg-[#0b1320] p-3 rounded-xl border border-white/5">{selectedAppointment.symptoms}</p>
                    </div>
                  )}
                  {selectedAppointment.medicalHistory && (
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Medical History</span>
                      <p className="bg-[#0b1320] p-3 rounded-xl border border-white/5">{selectedAppointment.medicalHistory}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3 justify-end mt-6 pt-4 border-t border-white/10">
                    <button onClick={() => {
                       const startDate = new Date(selectedAppointment.date);
                       const [hours, minutes] = selectedAppointment.time.split(":");
                       startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                       const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);
                       const formatICSDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
                       
                       const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Appointment with ' + selectedAppointment.doctor)}&dates=${formatICSDate(startDate)}/${formatICSDate(endDate)}&details=${encodeURIComponent(selectedAppointment.reasonForVisit)}&location=${encodeURIComponent(selectedAppointment.address || selectedAppointment.location || 'Clinic')}`;
                       window.open(googleCalendarUrl, '_blank');
                    }} className="px-4 py-2 rounded-xl text-sm font-medium bg-teal-500 hover:bg-teal-600 text-white transition-colors flex items-center gap-2">
                       <Calendar className="w-4 h-4" /> Google Calendar
                    </button>
                    <a href={`${API_BASE_URL}/appointments/${selectedAppointment.id}/ics`} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-700 hover:bg-slate-600 text-white transition-colors flex items-center gap-2">
                       Download ICS
                    </a>
                    <button onClick={closeModal} className="px-4 py-2 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 text-white transition-colors">Close</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ProfilePage;
