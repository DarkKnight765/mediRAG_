import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import {
  HeartPulse,
  UserPlus,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
} from "lucide-react";

const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordChecks = [
    { label: "At least 6 characters", valid: password.length >= 6 },
    { label: "Passwords match", valid: password === confirmPassword && confirmPassword.length > 0 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await signup(name, email, password);
      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/30 bg-white/5 shadow-lg shadow-black/20">
            <HeartPulse className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="mt-2 text-sm text-slate-400">
            Get started with MediRAG healthcare tools
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="signup-name"
                className="mb-2 block text-xs font-medium uppercase tracking-widest text-slate-400"
              >
                Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
              />
            </div>

            <div>
              <label
                htmlFor="signup-email"
                className="mb-2 block text-xs font-medium uppercase tracking-widest text-slate-400"
              >
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
              />
            </div>

            <div>
              <label
                htmlFor="signup-password"
                className="mb-2 block text-xs font-medium uppercase tracking-widest text-slate-400"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="signup-confirm-password"
                className="mb-2 block text-xs font-medium uppercase tracking-widest text-slate-400"
              >
                Confirm Password
              </label>
              <input
                id="signup-confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
              />
            </div>

            {/* Password strength indicators */}
            {password.length > 0 && (
              <div className="space-y-2 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                {passwordChecks.map((check, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded-full transition ${
                        check.valid
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-white/5 text-slate-600"
                      }`}
                    >
                      <Check className="h-3 w-3" />
                    </div>
                    <span
                      className={
                        check.valid ? "text-emerald-400" : "text-slate-500"
                      }
                    >
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-cyan-400 transition hover:text-cyan-300"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
