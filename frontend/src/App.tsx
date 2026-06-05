import React from "react";
import "./styles/animations.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./components/HomePage";
import XrayDiagnosis from "./components/XrayDiagnosis";
import HealthPlans from "./components/HealthPlans";
import AppointmentScheduling from "./components/AppointmentScheduling";
import MentalHealthSupport from "./components/MentalHealthSupport";
import ServicesPage from "./components/ServicesPage";
import AboutPage from "./components/AboutPage";
import ContactPage from "./components/ContactPage";
import PrivacyPolicy from "./components/PrivacyPolicy";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import ProfilePage from "./components/ProfilePage";
import DoctorProfile from "./components/DoctorProfile";
import SiteLayout from "./components/SiteLayout";

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <SiteLayout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected routes (require authentication) */}
            <Route
              path="/xray-diagnosis"
              element={
                <ProtectedRoute>
                  <XrayDiagnosis />
                </ProtectedRoute>
              }
            />
            <Route
              path="/health-plans"
              element={
                <ProtectedRoute>
                  <HealthPlans />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <ProtectedRoute>
                  <AppointmentScheduling />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctors/:placeId"
              element={
                <ProtectedRoute>
                  <DoctorProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mental-health"
              element={
                <ProtectedRoute>
                  <MentalHealthSupport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </SiteLayout>
      </AuthProvider>
    </Router>
  );
};

export default App;
