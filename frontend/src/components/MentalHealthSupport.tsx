import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import {
  Bot,
  Brain,
  CalendarDays,
  HeartPulse,
  Mic,
  Paperclip,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  Video,
  X,
} from "lucide-react";
import API_BASE_URL from "../api/config";
import {
  dialogOverlayClass,
  dialogPanelClass,
  fieldOptionClass,
  fieldSelectClass,
} from "./ui/formTheme";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  attachmentType?: "image" | "file" | "audio";
  attachmentUrl?: string;
}

const MentalHealthSupport: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);
  const [runtimeMode, setRuntimeMode] = useState<
    "auto" | "mock" | "gemini" | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const sendMessageToBackend = async (message: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/mental-health-chat`, { message });
      return response.data.response;
    } catch (error: any) {
      console.error("Error sending message to backend:", error);
      return error.response?.data?.error || error.message || "I'm sorry, I'm having trouble connecting right now. Please try again later.";
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (messagesContainerRef.current) {
      try {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      } catch (e) {
        // fallback
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      }
    }
  }, [messages]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/model/health`);
        if (cancelled) return;
        const data = res.data;
        const localOk = data?.models?.localModel === "ok";
        const geminiConfigured = data?.models?.gemini === "ok";
        setIsMockMode(localOk && !geminiConfigured);
        // also fetch explicit runtime mode if available
        try {
          const mres = await axios.get(`${API_BASE_URL}/model/mode`);
          setRuntimeMode(
            mres.data.mode || (localOk && !geminiConfigured ? "mock" : "auto"),
          );
        } catch (e) {
          // ignore
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function setMode(mode: "auto" | "mock" | "gemini") {
    try {
      await axios.post(`${API_BASE_URL}/model/mode`, { mode });
      setRuntimeMode(mode);
      // refresh health banner
      try {
        const h = await axios.get(`${API_BASE_URL}/model/health`);
        const data = h.data;
        const localOk = data?.models?.localModel === "ok";
        const geminiConfigured = data?.models?.gemini === "ok";
        setIsMockMode(localOk && !geminiConfigured);
      } catch (err) {}
    } catch (err) {
      console.error("Failed to set mode", err);
    }
  }

  const handleSend = async () => {
    if (input.trim() || selectedFile) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: input,
        sender: "user",
        timestamp: new Date(),
      };

      if (selectedFile) {
        newMessage.attachmentType = selectedFile.type.startsWith("image/")
          ? "image"
          : "file";
        newMessage.attachmentUrl = URL.createObjectURL(selectedFile);
      }

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInput("");
      setSelectedFile(null);

      // Get response from backend
      const botResponse = await sendMessageToBackend(input);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRecordAudio = () => {
    setIsRecording(!isRecording);
    // Here you would implement actual audio recording logic
  };

  const handleOpenVideo = () => {
    setIsVideoOpen(true);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-6rem)] max-w-7xl flex-col px-6 py-6 lg:px-8">
      <div className="grid h-full gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl h-fit lg:h-full lg:overflow-y-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-emerald-300">
            <HeartPulse className="h-4 w-4" />
            Atlas support
          </div>
          <h1 className="mt-5 text-3xl font-semibold text-white">
            Behavioral health check-in and guidance.
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Use this channel to discuss stress, sleep, mood, and next-step
            planning. Responses are designed for practical support and safe
            escalation language.
          </p>

          <div className="mt-6 space-y-3">
            {[
              "Structured prompts for symptom check-ins",
              "Clear next-step suggestions",
              "Attachment and voice input support",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0d1723] px-4 py-3 text-sm text-slate-200"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                {item}
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <InfoCard
              icon={Brain}
              title="Mood snapshot"
              description="Start with your current concern and recent symptoms."
            />
            <InfoCard
              icon={CalendarDays}
              title="Care pathway"
              description="Move to appointment booking or plan generation when needed."
            />
          </div>
        </aside>

        <section className="flex flex-col rounded-[2rem] border border-white/10 bg-[#0b1320]/90 shadow-2xl shadow-black/30 backdrop-blur-xl h-full overflow-hidden">
          {isMockMode && (
            <div className="px-6 pt-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
                Running in mock AI mode (local model)
              </div>
            </div>
          )}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                Conversation
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Mental health support
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-200">
                <Sparkles className="h-4 w-4" />
                Always on
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-300 mr-2">Mode</label>
                <select
                  value={runtimeMode || "auto"}
                  onChange={(e) => setMode(e.target.value as any)}
                  className={`${fieldSelectClass} w-[8rem] rounded-md py-1.5 pr-8`}
                >
                  <option value="auto" className={fieldOptionClass}>
                    Auto
                  </option>
                  <option value="mock" className={fieldOptionClass}>
                    Mock
                  </option>
                  <option value="gemini" className={fieldOptionClass}>
                    Gemini
                  </option>
                  <option value="groq" className={fieldOptionClass}>
                    Groq
                  </option>
                </select>
              </div>
            </div>
          </div>

          {messages.length === 0 && (
            <div className="flex flex-nowrap overflow-x-auto gap-3 border-b border-white/10 px-6 py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {[
                "Feeling overwhelmed",
                "Need a short grounding exercise",
                "Talk about sleep",
                "Plan next clinical step",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="whitespace-nowrap shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-6 py-6">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`mb-4 flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`flex max-w-[85%] items-end gap-3 ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${message.sender === "user" ? "bg-amber-300 text-slate-950" : "bg-white/10 text-cyan-200"}`}
                  >
                    {message.sender === "user" ? (
                      <User size={18} />
                    ) : (
                      <Bot size={18} />
                    )}
                  </div>
                  <div
                    className={`rounded-3xl px-4 py-3 ${
                      message.sender === "user"
                        ? "bg-amber-300 text-slate-950"
                        : "border border-white/10 bg-white/5 text-slate-100"
                    }`}
                  >
                    {message.attachmentType === "image" && (
                      <img
                        src={message.attachmentUrl}
                        alt="Uploaded"
                        className="mb-2 max-w-xs rounded-2xl"
                      />
                    )}
                    {message.attachmentType === "file" && (
                      <a
                        href={message.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-amber-300/40 underline-offset-4"
                      >
                        Attached File
                      </a>
                    )}
                    <p className="whitespace-pre-wrap text-sm leading-6">
                      {message.text}
                    </p>
                    <div className="mt-1 text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 px-6 py-5">
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-500">
              <span
                className={`h-2 w-2 rounded-full ${isRecording ? "bg-red-400" : "bg-emerald-400"}`}
              />
              {isRecording ? "Recording" : "Ready"}
            </div>

            <div className="flex items-end gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
              >
                <Paperclip size={18} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={handleRecordAudio}
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition ${
                  isRecording
                    ? "border-red-400/30 bg-red-400/10 text-red-200"
                    : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                }`}
              >
                <Mic size={18} />
              </button>
              <button
                onClick={handleOpenVideo}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
              >
                <Video size={18} />
              </button>

              <div className="flex-1 rounded-[1.5rem] border border-white/10 bg-white/5 p-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Describe your concern, symptoms, or what support you need..."
                  className="min-h-[52px] w-full resize-none bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  rows={1}
                />
              </div>

              <button
                onClick={handleSend}
                disabled={isLoading}
                className={`flex h-12 items-center gap-2 rounded-2xl px-5 text-sm font-semibold transition ${
                  isLoading
                    ? "cursor-not-allowed bg-white/10 text-slate-500"
                    : "bg-amber-300 text-slate-950 hover:bg-amber-200"
                }`}
              >
                <Send size={16} />
                Send
              </button>
            </div>

            {selectedFile && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                Attached: {selectedFile.name}
              </div>
            )}

            {isLoading && (
              <div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-400">
                <Sparkles className="h-4 w-4 text-amber-300" />
                Atlas is composing a response...
              </div>
            )}
          </div>
        </section>
      </div>
      {isVideoOpen && createPortal(
        <div className={dialogOverlayClass}>
          <div className={dialogPanelClass}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Relaxation Video
              </h2>
              <button
                onClick={() => setIsVideoOpen(false)}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10"
              >
                <X size={24} />
              </button>
            </div>
            <div className="overflow-hidden rounded-[1.5rem]">
              <iframe
                src="https://www.youtube.com/embed/inpok4MKVLM"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Relaxation video"
                className="w-full aspect-video"
              ></iframe>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const InfoCard: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
}> = ({ icon: Icon, title, description }) => (
  <div className="rounded-[1.75rem] border border-white/10 bg-[#0d1723] p-5">
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-amber-300">
      <Icon className="h-5 w-5" />
    </div>
    <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
  </div>
);

export default MentalHealthSupport;
