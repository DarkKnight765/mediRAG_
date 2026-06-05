import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDoctorDetails } from "../api/doctorApi";
import { Star, MapPin, Phone, Globe, Clock, Calendar } from "lucide-react";

interface DoctorDetails {
  placeId: string;
  name: string;
  address: string;
  phone: string | null;
  rating: number;
  totalRatings: number;
  website: string | null;
  photoUrl: string | null;
  lat: number | null;
  lng: number | null;
  openingHours: string[];
  reviews: any[];
}

const DoctorProfile: React.FC = () => {
  const { placeId } = useParams<{ placeId: string }>();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<DoctorDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!placeId) return;
      try {
        setLoading(true);
        const response = await getDoctorDetails(placeId);
        setDoctor(response.data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch doctor details:", err);
        setError(err.response?.data?.message || "Failed to load doctor profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [placeId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="text-center p-8">
        <p className="text-red-400 mb-4">{error || "Doctor not found"}</p>
        <button
          onClick={() => navigate("/appointments")}
          className="px-4 py-2 bg-slate-800 text-teal-400 rounded-lg hover:bg-slate-700 transition-colors"
        >
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header Profile Section */}
      <div className="bg-slate-900 rounded-2xl p-6 md:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row gap-8 items-start mb-8">
        {/* Photo */}
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-slate-800 flex-shrink-0 bg-slate-800 flex items-center justify-center">
          {doctor.photoUrl ? (
            <img src={doctor.photoUrl} alt={doctor.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-5xl text-slate-600">👨‍⚕️</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-2">{doctor.name}</h1>
          <div className="flex items-center gap-2 text-teal-400 font-semibold mb-4">
            <Star className="text-yellow-400 w-4 h-4 fill-current" />
            <span>{doctor.rating.toFixed(1)}</span>
            <span className="text-slate-400 text-sm font-normal">
              ({doctor.totalRatings} reviews)
            </span>
          </div>

          <div className="space-y-2 text-slate-300">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 flex-shrink-0 text-slate-400 w-4 h-4" />
              <span>{doctor.address}</span>
            </div>
            {doctor.phone && (
              <div className="flex items-center gap-3">
                <Phone className="text-slate-400 w-4 h-4" />
                <span>{doctor.phone}</span>
              </div>
            )}
            {doctor.website && (
              <div className="flex items-center gap-3">
                <Globe className="text-slate-400 w-4 h-4" />
                <a
                  href={doctor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-400 hover:underline"
                >
                  Visit Website
                </a>
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
               onClick={() =>
                 navigate("/appointments", {
                   state: {
                     preselectedDoctor: doctor.name,
                     preselectedLocation: doctor.address,
                     placeId: doctor.placeId,
                   },
                 })
               }
              className="w-full md:w-auto px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-teal-500/25 flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Book Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Opening Hours */}
        {doctor.openingHours && doctor.openingHours.length > 0 && (
          <div className="bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="text-teal-400 w-5 h-5" /> Opening Hours
            </h2>
            <ul className="space-y-2 text-slate-300 text-sm">
              {doctor.openingHours.map((hour, idx) => (
                <li key={idx} className="flex border-b border-slate-800 pb-2 last:border-0">
                  {hour}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reviews */}
        {doctor.reviews && doctor.reviews.length > 0 && (
          <div className="bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Star className="text-teal-400 w-5 h-5" /> Top Reviews
            </h2>
            <div className="space-y-4">
              {doctor.reviews.map((review, idx) => (
                <div key={idx} className="bg-slate-800/50 p-4 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-teal-400 text-sm">{review.author}</span>
                    <span className="text-xs text-slate-400">{review.time}</span>
                  </div>
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={i < review.rating ? "text-yellow-400 fill-current w-3 h-3" : "text-slate-600 w-3 h-3"}
                      />
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm italic">"{review.text}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;
