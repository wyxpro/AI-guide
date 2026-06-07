"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Send, Volume2, VolumeX,
  History, X, ChevronUp, ChevronDown, Camera, Sparkles,
} from "lucide-react";
import { request } from "@/lib/api/request";
import { useSearchParams } from "next/navigation";
import { SatisfactionModal } from "@/components/ui/SatisfactionModal";
import { DigitalAvatar, type AvatarState } from "@/components/ui/DigitalAvatar";
import { CameraRecognize } from "@/components/ui/CameraRecognize";
import { toast } from "sonner";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 35 };
interface Message { role: "user" | "assistant"; content: string; timestamp: string }

const QUICK_PROMPTS = [
  "揽月亭历史故事", "景区门票价格", "适合老人路线",
  "翠玉湖怎么走", "亲子游推荐", "景区开放时间",
  "有哪些特色小吃", "最美拍照地点",
];

function detectEmotion(text: string): AvatarState {
  const match = text.match(/\[情感:\s*(愉快|高兴|开心|温和|伤感|抱歉|紧张|思考)\]/);
  if (match) {
    const emo = match[1];
    if (/愉快|高兴|开心/.test(emo)) return "happy";
    if (/伤感|抱歉|紧张/.test(emo)) return "concerned";
    if (/思考/.test(emo)) return "thinking";
  }
  if (/欢迎|很高兴|精彩|美丽|推荐|惊喜/.test(text)) return "happy";
  if (/抱歉|对不起|无法|不知道|暂时/.test(text)) return "concerned";
  if (text.length > 40) return "speaking";
  return "idle";
}

function initMsg(spotName?: string | null): Message {
  return {
    role: "assistant",
    content: spotName
      ? `您好！我已为您准备好「${spotName}」的详细讲解，想了解历史渊源、文化典故还是游览小贴士？`
      : "您好！我是旅行吧AI导览官小玉，随时为您解答景区一切问题。可语音提问，也可文字输入。",
    timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
  };
}

export function QAScreen() {
  const searchParams = useSearchParams();
  const spotName = searchParams.get("name");

  const [messages, setMessages] = useState<Message[]>([initMsg(spotName)]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>("idle");
  const [recording, setRecording] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showSatisfaction, setShowSatisfaction] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [subtitle, setSubtitle] = useState(initMsg(spotName).content);
  const satisfactionShownRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // Audio playback and recording refs
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Avatar config state
  const [avatarConfig, setAvatarConfig] = useState<any>(null);

  useEffect(() => {
    fetch("/api/qa/avatar-active")
      .then((r) => r.json())
      .then((d) => setAvatarConfig(d))
      .catch((e) => console.error("Failed to load active avatar config", e));
  }, []);

  useEffect(() => {
    fetch("/api/qa/chat")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d) && d.length > 0) {
          const mapped = d.map((m: any) => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp ? new Date(m.timestamp).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) : new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
          }));
          setMessages(mapped);
          const lastMsg = mapped[mapped.length - 1];
          if (lastMsg) {
            setSubtitle(lastMsg.content);
            setAvatarState(detectEmotion(lastMsg.content));
          }
        }
      })
      .catch((e) => console.error("Failed to load chat history", e));
  }, []);

  const [avatarWidth, setAvatarWidth] = useState(380); // Default to a wider layout (380px)
  const panelRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizingRef.current) return;
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;
      if (newWidth >= 300 && newWidth <= 650) {
        setAvatarWidth(newWidth);
      }
    }
  }, []);

  function handleMouseUp() {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleMouseMove]);

  useEffect(() => {
    if (chatExpanded) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatExpanded]);

  useEffect(() => {
    if (loading) {
      setTimeout(() => setAvatarState("thinking"), 0);
      return;
    }
    const last = messages[messages.length - 1];
    if (!last || last.role === "user") {
      setTimeout(() => setAvatarState("idle"), 0);
      return;
    }
    const s = detectEmotion(last.content);
    setTimeout(() => setAvatarState(s), 0);
    const t = setTimeout(() => setAvatarState("idle"), 6000);
    return () => clearTimeout(t);
  }, [loading, messages]);

  const speak = async (text: string) => {
    if (!ttsEnabled) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setAvatarState("speaking");
    try {
      const payload = {
        text: text.slice(0, 320),
        voiceStyle: avatarConfig?.voiceStyle || "warm",
        speechRate: avatarConfig?.speechRate || 100,
        pitch: avatarConfig?.pitch || 100,
      };

      const res = await fetch("/api/qa/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("TTS generation failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onplay = () => setAvatarState("speaking");
      audio.onended = () => {
        setAvatarState("idle");
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setAvatarState("idle");
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch (err) {
      console.error("TTS audio play error, falling back to Web Speech API:", err);
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text.slice(0, 320));
        utter.lang = "zh-CN";
        utter.rate = (avatarConfig?.speechRate || 100) / 110;
        utter.pitch = (avatarConfig?.pitch || 100) / 100;
        utter.onstart = () => setAvatarState("speaking");
        utter.onend = () => setAvatarState("idle");
        window.speechSynthesis.speak(utter);
      } else {
        setAvatarState("idle");
      }
    }
  };

  const toggleRecording = async () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (recording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setRecording(false);
      } else if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setRecording(false);
      }
      return;
    }

    if (SR) {
      const rec = new SR();
      rec.lang = "zh-CN"; rec.continuous = false; rec.interimResults = false;
      rec.onresult = (e: any) => {
        const txt = e.results[0][0].transcript;
        setInput(txt);
        sendMessage(txt);
      };
      rec.onend = () => setRecording(false);
      rec.onerror = () => setRecording(false);
      rec.start();
      recognitionRef.current = rec;
      mediaRecorderRef.current = null;
      setRecording(true);
    } else {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setInput("（浏览器不支持录音）");
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        recognitionRef.current = null;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach((track) => track.stop());
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const formData = new FormData();
          formData.append("file", audioBlob, "audio.webm");

          setInput("正在识别语音...");
          try {
            const res = await fetch("/api/qa/stt", {
              method: "POST",
              body: formData,
            });
            const data = await res.json();
            if (data.text) {
              setInput(data.text);
              sendMessage(data.text);
            } else {
              setInput("");
            }
          } catch (err) {
            console.error("Whisper STT fallback error:", err);
            setInput("（语音识别失败）");
          }
        };

        mediaRecorder.start();
        setRecording(true);
      } catch (err) {
        console.error("Mic access denied or error:", err);
        setInput("（无法获取麦克风权限）");
      }
    }
  };

  const sendMessage = async (question: string) => {
    if (!question.trim() || loading) return;
    const ts = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    const updated = [...messages, { role: "user" as const, content: question, timestamp: ts }];
    setMessages(updated); setInput(""); setLoading(true); setChatExpanded(true);

    const aiTs = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    // Placeholder for streaming answer
    setMessages((prev) => [...prev, { role: "assistant" as const, content: "", timestamp: aiTs }]);

    try {
      const history = updated.slice(1).map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/qa/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history, stream: true }),
      });

      if (!res.ok || !res.body) throw new Error("Stream unavailable");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullAnswer = "";
      let ttsBuffer = "";
      let ttsStarted = false;

      const flushTTS = (text: string) => {
        if (!ttsEnabled || text.trim().length < 10) return;
        // Speak first sentence immediately, rest after
        speak(text.trim());
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") break;
          try {
            const { delta } = JSON.parse(payload);
            if (delta) {
              fullAnswer += delta;
              ttsBuffer += delta;
              const clean = fullAnswer.replace(/\[情感:\s*[^\]]+\]/g, "").trim();
              // Update streaming message in real-time
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { ...copy[copy.length - 1], content: clean };
                return copy;
              });
              setSubtitle(clean);
              // Detect sentence boundary → flush TTS
              const sentenceEnd = /[。！？.!?]/.test(delta);
              if (sentenceEnd && !ttsStarted && ttsBuffer.replace(/\[情感:\s*[^\]]+\]/g, "").trim().length > 12) {
                ttsStarted = true;
                const firstSentence = ttsBuffer.replace(/\[情感:\s*[^\]]+\]/g, "").trim();
                ttsBuffer = "";
                flushTTS(firstSentence);
              }
            }
          } catch { /* ignore parse errors */ }
        }
      }

      // If TTS wasn't started yet (short answer), speak the full answer
      if (!ttsStarted) {
        const clean = fullAnswer.replace(/\[情感:\s*[^\]]+\]/g, "").trim();
        speak(clean);
      }

      const exchanges = updated.filter((m) => m.role === "user").length;
      if (exchanges >= 3 && !satisfactionShownRef.current) {
        satisfactionShownRef.current = true;
        setTimeout(() => setShowSatisfaction(true), 1500);
      }
    } catch {
      // Fallback to non-streaming
      try {
        const history = updated.slice(1).map((m) => ({ role: m.role, content: m.content }));
        const res2 = await request("/api/qa/chat", { method: "POST", body: JSON.stringify({ question, history }) });
        const data = await res2.json();
        const answerRaw = data.answer || "抱歉，暂时无法回答。";
        const answer = answerRaw.replace(/\[情感:\s*[^\]]+\]/g, "").trim();
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { ...copy[copy.length - 1], content: answer };
          return copy;
        });
        setSubtitle(answer);
        speak(answer);
      } catch {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { ...copy[copy.length - 1], content: "小玉现在有些忙，请稍候再试。" };
          return copy;
        });
      }
    } finally { setLoading(false); }
  };

  // Camera recognition → inject into conversation as multimodal context
  const handleCameraRecognized = (subject: string, story: string) => {
    setShowCamera(false);
    const question = `我拍到了「${subject}」，请给我讲讲它的更多历史和文化内涵。`;
    // Pre-fill context: tell AI what was identified so it can expand
    sendMessage(question);
    toast.success(`已识别「${subject}」，正在小玉讲解中…`);
  };

  /* ── Message list (shared between mobile & desktop) ── */
  const renderMessageList = () => (
    <div className="space-y-3">
      {messages.map((msg, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0 }}
          className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
            style={{
              background: msg.role === "assistant" ? "linear-gradient(135deg,#4F6F52,#3A5240)" : "rgba(79,111,82,0.12)",
              color: msg.role === "assistant" ? "white" : "#4F6F52",
              fontFamily: "var(--font-noto-serif)",
            }}>
            {msg.role === "assistant" ? "玉" : "我"}
          </div>
          <div className={`flex flex-col gap-0.5 max-w-[78%] ${msg.role === "user" ? "items-end" : ""}`}>
            <div className="px-3.5 py-2.5 text-[13px] leading-relaxed"
              style={{
                borderRadius: msg.role === "assistant" ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
                background: msg.role === "assistant" ? "white" : "linear-gradient(135deg,#4F6F52,#3A5240)",
                border: msg.role === "assistant" ? "1px solid #E6E2D8" : "none",
                color: msg.role === "assistant" ? "#1E2522" : "white",
                boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
              }}>
              {msg.content}
            </div>
            <span className="text-[9px] font-mono px-1" style={{ color: "#B8B4AC" }}>{msg.timestamp}</span>
          </div>
        </motion.div>
      ))}
      {loading && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#4F6F52,#3A5240)", color: "white", fontFamily: "var(--font-noto-serif)" }}>玉</div>
          <div className="px-4 py-3 flex items-center gap-1.5"
            style={{ background: "white", border: "1px solid #E6E2D8", borderRadius: "4px 16px 16px 16px" }}>
            {[0,1,2].map((i) => (
              <motion.div key={i} animate={{ y: [0,-5,0] }}
                transition={{ duration: 0.55, delay: i * 0.14, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full" style={{ background: "#4F6F52" }} />
            ))}
          </div>
        </motion.div>
      )}
      <div ref={bottomRef} />
    </div>
  );

  /* ── Input bar (shared) ── */
  const renderInputBar = (dark = false) => (
    <div className={`flex items-center gap-2`}>
      {/* Camera */}
      <motion.button whileTap={{ scale: 0.84 }} onClick={() => setShowCamera(true)}
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: dark ? "rgba(255,255,255,0.1)" : "rgba(210,160,83,0.1)",
          border: `1.5px solid ${dark ? "rgba(255,255,255,0.2)" : "rgba(210,160,83,0.3)"}`,
          color: dark ? "rgba(255,255,255,0.6)" : "#D2A053",
        }}>
        <Camera className="w-4 h-4" />
      </motion.button>

      {/* Voice */}
      <motion.button whileTap={{ scale: 0.84 }} onClick={toggleRecording}
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative"
        style={{
          background: recording ? "rgba(220,38,38,0.1)" : dark ? "rgba(255,255,255,0.1)" : "rgba(79,111,82,0.09)",
          border: `1.5px solid ${recording ? "rgba(220,38,38,0.45)" : dark ? "rgba(255,255,255,0.2)" : "rgba(79,111,82,0.28)"}`,
          color: recording ? "#DC2626" : dark ? "rgba(255,255,255,0.6)" : "#4F6F52",
        }}>
        {recording && (
          <motion.div animate={{ scale: [1,1.8,1], opacity: [0.5,0,0.5] }}
            transition={{ duration: 0.9, repeat: Infinity }}
            className="absolute inset-0 rounded-full"
            style={{ background: "rgba(220,38,38,0.15)" }} />
        )}
        {recording ? <MicOff className="w-4 h-4 relative z-10" /> : <Mic className="w-4 h-4" />}
      </motion.button>

      {/* Text input */}
      <div className="flex-1 flex items-center px-3.5 py-2.5 rounded-2xl"
        style={{
          background: dark ? "rgba(255,255,255,0.1)" : "#F5F0E8",
          border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "#E6E2D8"}`,
          minHeight: 44,
        }}>
        <input type="text" value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
          placeholder={recording ? "正在聆听…" : "向小玉提问…"}
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: dark ? "rgba(255,255,255,0.9)" : "#1E2522", fontSize: 16 }} />
      </div>

      {/* Send */}
      <AnimatePresence mode="wait">
        {input.trim() ? (
          <motion.button key="send"
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }} whileTap={{ scale: 0.84 }}
            onClick={() => sendMessage(input)}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg,#4F6F52,#3A5240)",
              boxShadow: "0 3px 12px rgba(79,111,82,0.38)",
            }}>
            <Send className="w-4 h-4 text-white" />
          </motion.button>
        ) : <div key="gap" className="w-10 h-10 flex-shrink-0" />}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {/* ══════════════════════════════════════════════
          MOBILE — full-screen immersive (hidden on md+)
          ══════════════════════════════════════════════ */}
      <div className="flex flex-col min-h-svh md:hidden"
        style={{ background: "linear-gradient(180deg,#131C18 0%,#1A2520 45%,#0E1710 100%)" }}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pb-3 flex-shrink-0"
          style={{ paddingTop: "calc(env(safe-area-inset-top,44px)+8px)" }}>
          <div className="flex items-center gap-2">
            <motion.div animate={{ backgroundColor: loading ? "#D2A053" : "#34C759" }}
              className="w-2 h-2 rounded-full" />
            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>
              {loading ? "小玉思考中…" : "旅行吧导览官 · 在线"}
            </span>
          </div>
          <div className="flex gap-2">
            <motion.button whileTap={{ scale: 0.85 }}
              onClick={() => { setTtsEnabled(!ttsEnabled); if (ttsEnabled) window.speechSynthesis?.cancel(); }}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.08)", color: ttsEnabled ? "#D2A053" : "rgba(255,255,255,0.3)" }}>
              {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </motion.button>
            <motion.button whileTap={{ scale: 0.85 }} onClick={() => setShowHistory(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>
              <History className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>

        {/* Avatar zone */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 relative min-h-0">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 50% at 50% 40%,rgba(79,111,82,0.12) 0%,transparent 70%)" }} />
          {spotName && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-[11px]"
              style={{ background: "rgba(210,160,83,0.12)", border: "1px solid rgba(210,160,83,0.28)", color: "#D2A053" }}>
              <Sparkles className="w-3 h-3" />当前聚焦：<strong>{spotName}</strong>
            </motion.div>
          )}
          <DigitalAvatar state={avatarState} size="hero" audioElement={audioRef.current} avatarStyle={avatarConfig?.avatarStyle} />
          <AnimatePresence mode="wait">
            <motion.div key={subtitle.slice(0,20)}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ ...SPRING, delay: 0.1 }}
              className="mt-5 mx-4 px-4 py-3 rounded-2xl text-center max-w-xs"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
              <p className="text-[13px] leading-relaxed line-clamp-3"
                style={{ color: "rgba(255,255,255,0.82)" }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2 py-1">
                    {[0,1,2].map((i) => (
                      <motion.span key={i} animate={{ y: [0,-4,0] }}
                        transition={{ duration: 0.6, delay: i*0.18, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full inline-block bg-[#D2A053]" />
                    ))}
                  </span>
                ) : subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
          {!chatExpanded && messages.length <= 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="flex flex-wrap justify-center gap-2 mt-4 px-4">
              {QUICK_PROMPTS.slice(0,4).map((p) => (
                <motion.button key={p} whileTap={{ scale: 0.92 }} onClick={() => sendMessage(p)}
                  className="text-[11px] px-3 py-1.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.65)" }}>
                  {p}
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Chat drawer */}
        <motion.div
          animate={{ height: chatExpanded ? "42vh" : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          className="overflow-hidden flex-shrink-0 mx-3 rounded-t-2xl"
          style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="h-full overflow-y-auto px-4 py-3">
            {renderMessageList()}
          </div>
        </motion.div>

        {/* Input zone */}
        <div className="flex-shrink-0 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+72px)] pt-2"
          style={{ background: "rgba(0,0,0,0.2)", backdropFilter: "blur(16px)" }}>
          <div className="flex justify-center mb-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setChatExpanded(!chatExpanded)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px]"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}>
              {chatExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              {chatExpanded ? "收起对话" : `查看对话 (${messages.length}条)`}
            </motion.button>
          </div>
          {renderInputBar(true)}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          DESKTOP — two-column layout (hidden on mobile)
          ══════════════════════════════════════════════ */}
      <div className="hidden md:flex h-svh overflow-hidden"
        style={{ background: "#FAF8F5" }}>

        {/* Left: Digital human panel */}
        <div ref={panelRef} className="flex flex-col items-center justify-center flex-shrink-0 relative select-none"
          style={{
            width: avatarWidth,
            background: "linear-gradient(180deg,#1E2C28 0%,#121815 55%,#0E1710 100%)",
            borderRight: "1px solid rgba(255,255,255,0.07)",
          }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 80% 60% at 50% 35%,rgba(79,111,82,0.14) 0%,transparent 70%)" }} />

          {/* Resizer Handle */}
          <div
            className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-[#4F6F52]/40 active:bg-[#4F6F52] transition-colors z-20 group"
            onMouseDown={handleMouseDown}
          >
            {/* Visual drag indicator */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-8 bg-white/20 group-hover:bg-white/50 rounded transition-colors" />
          </div>

          <div className="relative z-10 flex flex-col items-center px-6 w-full">
            <DigitalAvatar state={avatarState} size="hero" audioElement={audioRef.current} avatarStyle={avatarConfig?.avatarStyle} />

            {spotName && (
              <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px]"
                style={{ background: "rgba(210,160,83,0.12)", border: "1px solid rgba(210,160,83,0.28)", color: "#D2A053" }}>
                <Sparkles className="w-3 h-3" />聚焦：{spotName}
              </div>
            )}

            {/* Subtitle bubble */}
            <AnimatePresence mode="wait">
              <motion.div key={subtitle.slice(0,20)}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={SPRING}
                className="mt-4 w-full px-4 py-3 rounded-2xl text-center text-[12.5px] leading-relaxed max-h-40 overflow-y-auto"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <p style={{ color: "rgba(255,255,255,0.85)" }}>
                  {loading ? "正在思考中…" : subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Quick prompts */}
            <div className="mt-5 w-full grid grid-cols-2 gap-2">
              {QUICK_PROMPTS.slice(0,6).map((p) => (
                <motion.button key={p} whileTap={{ scale: 0.93 }} onClick={() => sendMessage(p)}
                  className="text-[10px] px-2 py-1.5 rounded-lg text-left truncate"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }}>
                  {p}
                </motion.button>
              ))}
            </div>

            {/* TTS + history controls */}
            <div className="mt-5 flex gap-2 justify-center">
              <motion.button whileTap={{ scale: 0.88 }}
                onClick={() => { setTtsEnabled(!ttsEnabled); if (ttsEnabled) window.speechSynthesis?.cancel(); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px]"
                style={{ background: "rgba(255,255,255,0.08)", color: ttsEnabled ? "#D2A053" : "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.1)" }}>
                {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                {ttsEnabled ? "语音开" : "语音关"}
              </motion.button>
              <motion.button whileTap={{ scale: 0.88 }} onClick={() => setShowHistory(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px]"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <History className="w-3.5 h-3.5" />历史
              </motion.button>
            </div>
          </div>
        </div>

        {/* Right: Chat panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
            style={{ borderBottom: "1px solid #E6E2D8", background: "rgba(250,248,245,0.98)" }}>
            <div>
              <h2 className="font-bold text-base" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
                智能导览问答
              </h2>
              <p className="text-[11px] mt-0.5" style={{ color: "#8F9F8F" }}>
                可语音提问 · 多轮对话 · 知识库实时检索
              </p>
            </div>
            <div className="flex items-center gap-2">
              <motion.div animate={{ backgroundColor: loading ? "#D2A053" : "#34C759" }}
                className="w-2 h-2 rounded-full" />
              <span className="text-[11px]" style={{ color: loading ? "#D2A053" : "#4F6F52" }}>
                {loading ? "思考中" : "在线"}
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4"
            style={{ background: "#FAF8F5" }}>
            {renderMessageList()}
          </div>

          {/* Input */}
          <div className="px-6 py-4 flex-shrink-0"
            style={{ borderTop: "1px solid #E6E2D8", background: "rgba(250,248,245,0.98)" }}>
            {renderInputBar()}
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showHistory && <HistorySheet onClose={() => setShowHistory(false)} onResume={(q) => { setShowHistory(false); sendMessage(q); }} />}
      </AnimatePresence>
      <AnimatePresence>
        {showSatisfaction && (
          <SatisfactionModal onClose={() => setShowSatisfaction(false)}
            onSubmit={async (rating, comment) => {
              try {
                await request("/api/qa/feedback", {
                  method: "POST",
                  body: JSON.stringify({ rating, comment })
                });
                toast.success("感谢您的评价！");
              } catch {
                toast.error("评价提交失败，请稍后再试。");
              }
              setShowSatisfaction(false);
            }} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showCamera && <CameraRecognize currentSpot={spotName ?? undefined} onClose={() => setShowCamera(false)} onRecognized={handleCameraRecognized} />}
      </AnimatePresence>
    </>
  );
}

function HistorySheet({ onClose, onResume }: { onClose: () => void; onResume: (q: string) => void }) {
  const [sessions, setSessions] = useState<Array<{ id: number; title: string; updatedAt: string; messages: Array<{ role: string; content: string }> }>>([]);
  const [ld, setLd] = useState(true);
  useEffect(() => {
    request("/api/qa/sessions").then((r) => r.json()).then((d) => { setSessions(Array.isArray(d) ? d : []); setLd(false); }).catch(() => setLd(false));
  }, []);
  const lastMsg = (msgs: Array<{ role: string; content: string }>) =>
    msgs.filter((m) => m.role === "user").slice(-1)[0]?.content || "（空对话）";
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex flex-col justify-end"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring" as const, stiffness: 300, damping: 35 }}
        className="rounded-t-2xl p-5 space-y-3 overflow-y-auto"
        style={{ background: "#1A2520", maxHeight: "65vh" }}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-white" style={{ fontFamily: "var(--font-noto-serif)" }}>历史对话</h3>
          <motion.button whileTap={{ scale: 0.88 }} onClick={onClose}>
            <X className="w-5 h-5" style={{ color: "rgba(255,255,255,0.45)" }} />
          </motion.button>
        </div>
        {ld ? <div className="skeleton h-16 rounded-xl" /> :
          sessions.length === 0 ? (
            <div className="text-center py-8"><p className="text-2xl mb-2">💬</p><p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>暂无历史对话</p></div>
          ) : sessions.map((s) => (
            <motion.div key={s.id} whileTap={{ scale: 0.98 }} onClick={() => onResume(lastMsg(s.messages ?? []))}
              className="p-3 rounded-xl cursor-pointer"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <p className="text-[13px] font-medium truncate text-white">{s.title}</p>
              <p className="text-[11px] mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{lastMsg(s.messages ?? [])}</p>
              <p className="text-[9px] mt-1 font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>
                {new Date(s.updatedAt).toLocaleDateString("zh-CN")} · {(s.messages ?? []).length} 条
              </p>
            </motion.div>
          ))}
      </motion.div>
    </motion.div>
  );
}
