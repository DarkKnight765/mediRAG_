import React, { useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Loader,
  Sparkles,
  Upload,
} from "lucide-react";
import API_BASE_URL from "../api/config";
import { alertPanelClass } from "./ui/formTheme";

interface DiagnosisResult {
  primaryDiagnosis: string;
  confidenceLevel: number;
  additionalFindings: string[];
  recommendedActions: string;
  aiAnalysis: string;
}

const Alert: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={alertPanelClass} role="alert">
    <span className="block sm:inline">{children}</span>
  </div>
);

const MetricCard: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="rounded-3xl border border-white/10 bg-[#0d1723] p-4">
    <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
      {label}
    </div>
    <div className="mt-2 text-xl font-semibold text-white">{value}</div>
  </div>
);

const ImageAnalysisPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) setFile(uploadedFile);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    if (file) formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/analyze-image`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || `Server error (${response.status})`);
      }

      const data: DiagnosisResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while processing your request. Please try again.",
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
              <Sparkles className="h-4 w-4 text-amber-300" /> Document & image
              analysis
            </div>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              Upload a scan and receive a structured clinical summary.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Submit medical images or PDFs for AI-assisted review, confidence
              scoring, and recommended follow-up actions.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="grid gap-4 sm:grid-cols-2">
              <MetricCard label="Input" value="Image or PDF" />
              <MetricCard label="Tone" value="Clear" />
              <MetricCard label="Result" value="Actionable" />
              <MetricCard label="Output" value="Structured" />
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2rem] border border-white/10 bg-[#0d1723] p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <h2 className="text-2xl font-semibold text-white">Upload file</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Choose an image or PDF and submit it for analysis.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-white/5 p-6 text-center transition hover:border-amber-300/30 hover:bg-white/10">
              <Upload className="h-12 w-12 text-amber-300" />
              <p className="mt-3 text-sm font-semibold text-white">
                Upload Image or PDF
              </p>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-amber-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
              >
                Select File <ArrowUpRight className="h-4 w-4" />
              </label>
              {file && (
                <p className="mt-3 text-sm text-slate-300">{file.name}</p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!file || loading}
              className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${
                !file || loading
                  ? "cursor-not-allowed bg-white/10 text-slate-500"
                  : "bg-amber-300 text-slate-950 hover:bg-amber-200"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader className="mr-3 h-5 w-5 animate-spin text-slate-950" />
                  Analyzing...
                </span>
              ) : (
                "Analyze File"
              )}
            </button>

            {error && (
              <div className="mt-6">
                <Alert>
                  <AlertCircle className="mr-2 inline h-4 w-4" />
                  {error}
                </Alert>
              </div>
            )}
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <h2 className="text-2xl font-semibold text-white">
              Analysis results
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Results appear here once the file has been processed.
            </p>

            {result ? (
              <div className="mt-8 space-y-4">
                <div className="rounded-3xl border border-white/10 bg-[#0d1723] p-5">
                  <h3 className="text-sm uppercase tracking-[0.3em] text-slate-500">
                    Primary diagnosis
                  </h3>
                  <p className="mt-2 text-white">{result.primaryDiagnosis}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-[#0d1723] p-5">
                  <h3 className="text-sm uppercase tracking-[0.3em] text-slate-500">
                    Confidence
                  </h3>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-amber-300"
                      style={{ width: `${result.confidenceLevel}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-slate-300">
                    {result.confidenceLevel}% confidence
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-[#0d1723] p-5">
                  <h3 className="text-sm uppercase tracking-[0.3em] text-slate-500">
                    Additional findings
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    {result.additionalFindings.map((finding, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-3xl border border-white/10 bg-[#0d1723] p-5">
                  <h3 className="text-sm uppercase tracking-[0.3em] text-slate-500">
                    Recommended actions
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {result.recommendedActions}
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-[#0d1723] p-5">
                  <h3 className="text-sm uppercase tracking-[0.3em] text-slate-500">
                    Detailed AI analysis
                  </h3>
                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-300">
                    {result.aiAnalysis}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="mt-8 rounded-[1.75rem] border border-dashed border-white/10 bg-[#0d1723] p-8 text-sm leading-7 text-slate-400">
                No file analyzed yet. Upload an image or PDF to view findings,
                confidence level, and recommended next actions.
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default ImageAnalysisPage;
