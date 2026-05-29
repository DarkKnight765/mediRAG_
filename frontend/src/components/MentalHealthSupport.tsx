import React, { useState, useRef, useEffect } from "react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const sendMessageToBackend = async (message: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/mental-health-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to get response from server";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Keep the default message if the response is not JSON.
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Error sending message to backend:", error);
      return error instanceof Error
        ? error.message
        : "I'm sorry, I'm having trouble connecting right now. Please try again later.";
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
        const res = await fetch(`${API_BASE_URL}/model/health`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const localOk = data?.models?.localModel === "ok";
        const geminiConfigured = data?.models?.gemini === "ok";
        setIsMockMode(localOk && !geminiConfigured);
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
    <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-7xl flex-col px-6 py-8 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-emerald-300">
            <HeartPulse className="h-4 w-4" />
            Atlas support
          </div>
          <h1 className="mt-5 text-3xl font-semibold text-white">
            A calmer way to start the conversation.
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Ask about stress, routines, sleep, or how to take the next step. The
            assistant keeps the experience warm, concise, and supportive.
          </p>

          <div className="mt-6 space-y-3">
            {[
              "Gentle, low-friction chat UI",
              "Helpful prompts for getting started",
              "File, audio, and video support actions",
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
              title="Mood check"
              description="Start with a single sentence about how today feels."
            />
            <InfoCard
              icon={CalendarDays}
              title="Next step"
              description="Move into scheduling or health planning when ready."
            />
          </div>
        </aside>

        <section className="rounded-[2rem] border border-white/10 bg-[#0b1320]/90 shadow-2xl shadow-black/30 backdrop-blur-xl">
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
            <div className="flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-200">
              <Sparkles className="h-4 w-4" />
              Always on
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-b border-white/10 px-6 py-4">
            {[
              "Feeling overwhelmed",
              "Need a quick reset",
              "Talk about sleep",
              "Plan my next step",
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInput(prompt)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="max-h-[54vh] overflow-y-auto px-6 py-6">
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
                  placeholder="Describe how you're feeling..."
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
      {isVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
          <div className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-[#0b1320] p-4 shadow-2xl shadow-black/50">
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
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        </div>
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
