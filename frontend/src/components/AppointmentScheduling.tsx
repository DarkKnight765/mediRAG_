import React, { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Calendar,
  Check,
  Clipboard,
  Heart,
  Mail,
  Phone,
  Sparkles,
  Stethoscope,
  User,
  MapPin,
  Bot,
  Video,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { createAppointment, getAvailableSlots } from "../api/appointmentApi";
import { searchDoctors } from "../api/doctorApi";
import axios from "axios";
import API_BASE_URL from "../api/config";
import {
  fieldInputClass,
  fieldLabelClass,
  fieldOptionClass,
  fieldSelectClass,
  fieldTextareaClass,
} from "./ui/formTheme";

interface Appointment {
  patientName: string;
  email: string;
  phone: string;
  reasonForVisit: string;
  symptoms: string;
  medicalHistory: string;
  appointmentType: string;
  consultationMode: "IN_PERSON" | "VIDEO";
}

const appointmentTypes = [
  "Regular Check-up",
  "Follow-up",
  "New Patient Consultation",
  "Urgent Care",
  "Specialist Consultation",
  "Vaccination",
];

const specialties = [
  "General Practice",
  "Cardiology",
  "Orthopedics",
  "Dermatology",
  "Pediatrics",
  "Neurology",
  "Gastroenterology",
  "Ophthalmology",
  "ENT",
  "Pulmonology",
  "Psychiatry",
  "Gynecology",
  "Urology"
];

const AppointmentScheduling: React.FC = () => {
  const routerLocation = useLocation();
  const preselected = routerLocation.state as {
    preselectedDoctor?: string;
    preselectedLocation?: string;
    placeId?: string;
  };

  const [step, setStep] = useState(1);
  const [appointment, setAppointment] = useState<Appointment>({
    patientName: "",
    email: "",
    phone: "",
    reasonForVisit: "",
    symptoms: "",
    medicalHistory: "",
    appointmentType: "",
    consultationMode: "IN_PERSON",
  });
  
  const [locationStr, setLocationStr] = useState(preselected?.preselectedLocation || "");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [specialty, setSpecialty] = useState("");
  const [aiSymptoms, setAiSymptoms] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  // Step 2 State
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  // Step 3 State
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<any[]>([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (preselected?.preselectedDoctor) {
      // If we came from a doctor profile, skip to step 3
      setSelectedDoctor({
        name: preselected.preselectedDoctor,
        address: preselected.preselectedLocation,
        placeId: preselected.placeId
      });
      setStep(3);
    }
  }, [preselected]);

  useEffect(() => {
    if (step === 3 && date && selectedDoctor) {
      const fetchSlots = async () => {
        setIsFetchingSlots(true);
        try {
          const res = await getAvailableSlots(selectedDoctor.name, date);
          setSlots(res.data);
          setSelectedTime("");
        } catch (err) {
          console.error(err);
        } finally {
          setIsFetchingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [date, selectedDoctor, step]);

  const analyzeSymptoms = async () => {
    if (!aiSymptoms) return;
    setIsAnalyzing(true);
    setAiResult(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE_URL}/symptoms/analyze`, 
        { symptoms: aiSymptoms },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAiResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyAiSpecialty = () => {
    if (aiResult?.recommendedSpecialty) {
      setSpecialty(aiResult.recommendedSpecialty);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setErrors({ location: "Geolocation is not supported by your browser" });
      return;
    }
    
    setIsDetectingLocation(true);
    setErrors({ ...errors, location: undefined });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          
          if (res.data && res.data.display_name) {
            // Get the first two comma-separated segments for a more precise & readable location
            // E.g. "Sector 14, Gurgaon" instead of just "Gurgaon"
            const parts = res.data.display_name.split(",").map((p: string) => p.trim());
            const shortLocation = parts.slice(0, 2).join(", ");
            setLocationStr(shortLocation);
          } else {
            setErrors({ location: "Could not resolve your location" });
          }
        } catch (err) {
          console.error("Error reverse geocoding:", err);
          setErrors({ location: "Failed to detect location address" });
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setErrors({ location: "Unable to retrieve your location. Please type it manually." });
        setIsDetectingLocation(false);
      }
    );
  };

  const handleSearchDoctors = async () => {
    if (!locationStr) {
      setErrors({ location: "Location is required" });
      return;
    }
    setErrors({});
    setIsSearching(true);
    try {
      const res = await searchDoctors(locationStr, specialty);
      setDoctors(res.data);
      setStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setAppointment((prev) => ({ ...prev, [name]: value }));
  };

  const handleStep4Validation = () => {
    const newErrors: Partial<Record<string, string>> = {};
    if (!appointment.patientName) newErrors.patientName = "Full Name is required";
    if (!appointment.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(appointment.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!appointment.phone) {
      newErrors.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(appointment.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Phone must be 10 numeric digits";
    }
    if (!appointment.appointmentType) newErrors.appointmentType = "Appointment Type is required";
    if (!appointment.reasonForVisit) newErrors.reasonForVisit = "Reason for Visit is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!handleStep4Validation()) return;
    
    setApiError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await createAppointment({
        ...appointment,
        doctor: selectedDoctor.name,
        specialty: specialty || selectedDoctor.specialty || "General",
        date,
        time: selectedTime,
        location: selectedDoctor.name,
        address: selectedDoctor.address,
        latitude: selectedDoctor.lat,
        longitude: selectedDoctor.lng,
        consultationFee: selectedDoctor.consultationFee
      });
      setSuccessMessage("Appointment booked successfully. A confirmation message has been sent.");
      setStep(5); // Success step
    } catch (err: any) {
      setApiError(
        err.response?.data?.error || err.response?.data?.message || "An error occurred while scheduling."
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
              <Sparkles className="h-4 w-4 text-amber-300" /> Appointment booking
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              Book your medical appointment.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Find nearby specialists, choose a time that works for you, and confirm your booking instantly.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-white">Steps</h2>
            <div className="mt-5 flex items-center justify-between">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${step >= s ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                    {s}
                  </div>
                  <span className={`text-xs ${step >= s ? 'text-teal-400' : 'text-slate-500'}`}>
                    {s === 1 ? 'Search' : s === 2 ? 'Doctor' : s === 3 ? 'Time' : 'Details'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.4fr]">
          <section className="rounded-[2rem] border border-white/10 bg-[#0d1723] p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
            
            {apiError && <p className="mb-4 text-sm text-red-400">{apiError}</p>}

            {/* STEP 1: Search */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-semibold text-white">Find a Doctor</h2>
                
                {/* AI Assist */}
                <div className="rounded-xl border border-teal-500/30 bg-teal-900/20 p-5">
                  <h3 className="flex items-center gap-2 text-teal-400 font-medium mb-3">
                    <Bot className="w-5 h-5" /> AI Symptom Analyzer
                  </h3>
                  <textarea
                    value={aiSymptoms}
                    onChange={(e) => setAiSymptoms(e.target.value)}
                    placeholder="Describe your symptoms (e.g., severe headache and nausea for 3 days)..."
                    className={`${fieldTextareaClass} mb-3`}
                    rows={2}
                  />
                  <div className="flex gap-3 items-center">
                    <button
                      type="button"
                      onClick={analyzeSymptoms}
                      disabled={isAnalyzing || !aiSymptoms}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
                    >
                      {isAnalyzing ? "Analyzing..." : "Analyze Symptoms"}
                    </button>
                    {aiResult && (
                      <div className="flex-1 text-sm text-slate-300">
                        <span className="text-teal-400 font-semibold">{aiResult.recommendedSpecialty}</span> ({aiResult.confidence} match)
                        <button onClick={applyAiSpecialty} className="ml-3 text-amber-300 hover:underline">Use this specialty</button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className={`${fieldLabelClass} flex items-center gap-2`}>
                        <MapPin className="h-4 w-4 text-amber-300" /> Location *
                      </label>
                      <button 
                        type="button" 
                        onClick={detectLocation}
                        disabled={isDetectingLocation}
                        className="text-xs text-teal-400 hover:text-teal-300 font-medium"
                      >
                        {isDetectingLocation ? "Detecting..." : "Detect Location"}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={locationStr}
                      onChange={(e) => setLocationStr(e.target.value)}
                      placeholder="City or Neighborhood"
                      className={`${fieldInputClass} ${errors.location ? "border-red-400/50" : ""}`}
                    />
                    {errors.location && <p className="mt-1 text-xs text-red-400">{errors.location}</p>}
                  </div>
                  
                  <div>
                    <label className={`${fieldLabelClass} flex items-center gap-2`}>
                      <Stethoscope className="h-4 w-4 text-amber-300" /> Specialty (Optional)
                    </label>
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className={fieldSelectClass}
                    >
                      <option value="" className={fieldOptionClass}>Any Specialty</option>
                      {specialties.map(s => <option key={s} value={s} className={fieldOptionClass}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                   <label className={`${fieldLabelClass} mb-2 flex items-center gap-2`}>
                      Consultation Mode
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer bg-slate-800 px-4 py-3 rounded-lg flex-1 border border-transparent hover:border-teal-500/50">
                        <input type="radio" name="mode" checked={appointment.consultationMode === "IN_PERSON"} onChange={() => setAppointment({...appointment, consultationMode: "IN_PERSON"})} className="text-teal-500" />
                        <span className="text-slate-200">In-Person</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer bg-slate-800 px-4 py-3 rounded-lg flex-1 border border-transparent hover:border-teal-500/50 relative overflow-hidden">
                        <input type="radio" name="mode" checked={appointment.consultationMode === "VIDEO"} onChange={() => setAppointment({...appointment, consultationMode: "VIDEO"})} className="text-teal-500" disabled />
                        <span className="text-slate-500 flex items-center gap-2"><Video className="w-4 h-4"/> Video Call</span>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded">COMING SOON</div>
                      </label>
                    </div>
                </div>

                <button
                  onClick={handleSearchDoctors}
                  disabled={isSearching}
                  className="w-full mt-4 flex items-center justify-center gap-2 rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-200 disabled:opacity-50"
                >
                  {isSearching ? "Searching..." : "Search Doctors"} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2: Doctor Selection */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-4 mb-6">
                  <button onClick={() => setStep(1)} className="text-slate-400 hover:text-white"><ChevronLeft /></button>
                  <h2 className="text-2xl font-semibold text-white">Select a Doctor</h2>
                </div>

                <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {doctors.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No doctors found in this area.</p>
                  ) : (
                    doctors.map((doc, idx) => (
                      <div key={idx} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex gap-4 items-center hover:border-teal-500/50 transition-colors cursor-pointer"
                           onClick={() => { setSelectedDoctor(doc); setStep(3); }}>
                        <div className="w-16 h-16 rounded-full bg-slate-700 flex-shrink-0 overflow-hidden flex items-center justify-center text-2xl">
                          {doc.photoUrl ? <img src={doc.photoUrl} alt="" className="w-full h-full object-cover" /> : "👨‍⚕️"}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white">{doc.name}</h4>
                          <p className="text-sm text-teal-400">{doc.specialty || specialty}</p>
                          <div className="flex gap-4 text-xs text-slate-400 mt-1">
                            <span>⭐ {doc.rating} ({doc.totalRatings})</span>
                            {doc.distance && <span>📍 {doc.distance}km</span>}
                            {doc.consultationFee && <span>💰 {doc.consultationFee}</span>}
                          </div>
                        </div>
                        <ChevronRight className="text-slate-500" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Date & Slot Selection */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                 <div className="flex items-center gap-4 mb-6">
                  <button onClick={() => { if(preselected?.preselectedDoctor) routerLocation.state = null; setStep(preselected?.preselectedDoctor ? 1 : 2)}} className="text-slate-400 hover:text-white"><ChevronLeft /></button>
                  <h2 className="text-2xl font-semibold text-white">Select Date & Time</h2>
                </div>
                
                <div className="bg-slate-800 p-4 rounded-xl mb-6 flex gap-4 items-center">
                   <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-xl">👨‍⚕️</div>
                   <div>
                     <h4 className="font-bold text-white">{selectedDoctor?.name}</h4>
                     <p className="text-xs text-slate-400">{selectedDoctor?.address}</p>
                   </div>
                </div>

                <div>
                  <label className={`${fieldLabelClass} flex items-center gap-2 mb-2`}>
                    <Calendar className="h-4 w-4 text-amber-300" /> Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={fieldInputClass}
                  />
                </div>

                {date && (
                  <div>
                    <label className={`${fieldLabelClass} flex items-center gap-2 mb-2`}>
                       Available Slots
                    </label>
                    {isFetchingSlots ? (
                      <p className="text-slate-400 text-sm">Loading slots...</p>
                    ) : slots.length === 0 ? (
                      <p className="text-red-400 text-sm">No slots available for this date.</p>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {slots.map(slot => (
                          <button
                            key={slot.time}
                            disabled={!slot.available}
                            onClick={() => setSelectedTime(slot.time)}
                            className={`py-2 rounded-lg text-sm font-medium transition-colors border ${
                              !slot.available ? 'bg-slate-800/50 border-transparent text-slate-600 cursor-not-allowed'
                              : selectedTime === slot.time ? 'bg-teal-500 border-teal-400 text-white'
                              : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-teal-500/50'
                            }`}
                          >
                            {slot.displayTime}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => setStep(4)}
                  disabled={!date || !selectedTime}
                  className="w-full mt-8 flex items-center justify-center gap-2 rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-200 disabled:opacity-50"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 4: Details & Confirm */}
            {step === 4 && (
              <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-4 mb-6">
                  <button type="button" onClick={() => setStep(3)} className="text-slate-400 hover:text-white"><ChevronLeft /></button>
                  <h2 className="text-2xl font-semibold text-white">Patient Details</h2>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full Name" icon={User} type="text" name="patientName" value={appointment.patientName} onChange={handleInputChange} error={errors.patientName} />
                  <Field label="Email" icon={Mail} type="email" name="email" value={appointment.email} onChange={handleInputChange} error={errors.email} />
                  <Field label="Phone" icon={Phone} type="tel" name="phone" value={appointment.phone} onChange={handleInputChange} placeholder="10 digits" error={errors.phone} />
                  <SelectField label="Appointment Type" icon={Clipboard} name="appointmentType" value={appointment.appointmentType} onChange={handleInputChange} options={appointmentTypes} placeholder="Select type" error={errors.appointmentType} />
                </div>
                
                <Field label="Reason for Visit" icon={Heart} type="text" name="reasonForVisit" value={appointment.reasonForVisit} onChange={handleInputChange} placeholder="e.g. Annual check-up, headache" error={errors.reasonForVisit} />
                
                <TextareaField label="Current Symptoms" icon={Heart} name="symptoms" value={appointment.symptoms} onChange={handleInputChange} placeholder="Describe symptoms if applicable" />
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-8 flex items-center justify-center gap-2 rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-200 disabled:opacity-50"
                >
                  {isSubmitting ? "Confirming..." : "Confirm Booking"} <Check className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* STEP 5: Success */}
            {step === 5 && (
              <div className="text-center py-12 animate-fade-in">
                <div className="w-20 h-20 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Booking Confirmed!</h2>
                <p className="text-slate-300 mb-8 max-w-md mx-auto">{successMessage}</p>
                <div className="flex gap-4 justify-center">
                  <button onClick={() => window.location.href = "/profile"} className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500">View My Appointments</button>
                  <button onClick={() => {setStep(1); setDate(""); setSelectedTime("");}} className="px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700">Book Another</button>
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <h3 className="text-xl font-semibold text-white">Why book with us?</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0d1723] px-4 py-3"><Check className="h-4 w-4 text-emerald-300" /> Instant confirmation</div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0d1723] px-4 py-3"><Check className="h-4 w-4 text-emerald-300" /> WhatsApp & SMS alerts</div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0d1723] px-4 py-3"><Check className="h-4 w-4 text-emerald-300" /> AI Symptom mapping</div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0d1723] px-4 py-3"><Check className="h-4 w-4 text-emerald-300" /> Calendar Sync</div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

// Helper Components
const Field: React.FC<any> = ({ label, icon: Icon, type, name, value, onChange, placeholder, error }) => (
  <div>
    <label className={`${fieldLabelClass} flex items-center gap-2`}><Icon className="h-4 w-4 text-amber-300" />{label}</label>
    <input type={type} name={name} placeholder={placeholder} className={`${fieldInputClass} ${error ? "border-red-400/50 focus:border-red-400/50" : ""}`} value={value} onChange={onChange} />
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
  </div>
);

const SelectField: React.FC<any> = ({ label, icon: Icon, name, value, onChange, options, placeholder, error }) => (
  <div>
    <label className={`${fieldLabelClass} flex items-center gap-2`}><Icon className="h-4 w-4 text-amber-300" />{label}</label>
    <select name={name} className={`${fieldSelectClass} ${error ? "border-red-400/50 focus:border-red-400/50" : ""}`} value={value} onChange={onChange}>
      <option value="" className={fieldOptionClass}>{placeholder}</option>
      {options.map((o: string) => <option key={o} value={o} className={fieldOptionClass}>{o}</option>)}
    </select>
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
  </div>
);

const TextareaField: React.FC<any> = ({ label, icon: Icon, name, value, onChange, placeholder, error }) => (
  <div>
    <label className={`${fieldLabelClass} flex items-center gap-2`}><Icon className="h-4 w-4 text-amber-300" />{label}</label>
    <textarea name={name} rows={3} placeholder={placeholder} className={`${fieldTextareaClass} ${error ? "border-red-400/50 focus:border-red-400/50" : ""}`} value={value} onChange={onChange} />
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
  </div>
);

export default AppointmentScheduling;
