"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Send, Volume2, VolumeX,
  History, X, ChevronUp, ChevronDown, Camera, Sparkles,
  Image as ImageIcon, User,
} from "lucide-react";
import { request } from "@/lib/api/request";
import { useSearchParams, useRouter } from "next/navigation";
import { SatisfactionModal } from "@/components/ui/SatisfactionModal";
import { DigitalAvatar, type AvatarState } from "@/components/ui/DigitalAvatar";
import { AvatarSelectorModal } from "@/components/ui/AvatarSelectorModal";
import { toast } from "sonner";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 35 };
interface Message { role: "user" | "assistant"; content: string; timestamp: string }

const QUICK_PROMPTS = [
  "揽月亭历史故事", "景区门票价格", "适合老人路线",
  "翠玉湖怎么走", "亲子游推荐", "景区开放时间",
  "有哪些特色小吃", "最美拍照地点",
];

const BG_PRESETS = [
  { id: "beijing", label: "北京", url: "/background/北京.png" },
  { id: "hangzhou", label: "杭州", url: "/background/杭州.png" },
  { id: "pavilion", label: "山景", url: "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?auto=format&fit=crop&w=800&q=80" },
  { id: "chongqing", label: "重庆", url: "/background/重庆.png" },
];

const PERSONAS_FEMALE = [
  { id: "female_hanfu", label: "汉服古风 · 小玉", desc: "典雅端庄，文旅专属" },
  { id: "female_student", label: "青春校花 · 晓彤", desc: "阳光活力，温柔知性" },
  { id: "female_business", label: "职场丽人 · 雅琪", desc: "端庄大方，干练成熟" },
  { id: "female_anchor", label: "甜美主播 · 诗诗", desc: "亲切活泼，古灵精怪" },
  { id: "female_princess", label: "异域公主 · 迪丽", desc: "高贵神秘，风情万种" }
];

const PERSONAS_MALE = [
  { id: "male_scholar", label: "儒雅书生 · 子轩", desc: "温文尔雅，满腹经纶" },
  { id: "male_student", label: "帅气校草 · 宇航", desc: "朝气蓬勃，充满活力" },
  { id: "male_business", label: "商业精英 · 伟祺", desc: "睿智沉稳，专业干练" },
  { id: "male_anchor", label: "幽默主播 · 强哥", desc: "风趣幽默，极具亲和力" },
  { id: "male_cool", label: "潮流酷哥 · 阿杰", desc: "时尚前卫，极具个性" }
];

const PERSONAS = [...PERSONAS_FEMALE, ...PERSONAS_MALE];

function detectEmotion(text: string): AvatarState {
  const match = text.match(/\[情感[:：]\s*(愉快|高兴|开心|温和|伤感|抱歉|紧张|思考)\]/);
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
      : "您好！我是旅行家ProAI导览官小玉，随时为您解答景区一切问题。可语音提问，也可文字输入。",
    timestamp: "刚刚",
  };
}

export function QAScreen() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const spotName = searchParams.get("name");

  const [messages, setMessages] = useState<Message[]>([initMsg(spotName)]);
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    setIsDesktop(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);
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
  const mobileBottomRef = useRef<HTMLDivElement>(null);
  const desktopBottomRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const desktopScrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (mobileBottomRef.current) {
      mobileBottomRef.current.scrollIntoView({ behavior, block: "end" });
    }
    if (mobileScrollRef.current) {
      mobileScrollRef.current.scrollTop = mobileScrollRef.current.scrollHeight;
    }
    if (desktopBottomRef.current) {
      desktopBottomRef.current.scrollIntoView({ behavior, block: "end" });
    }
    if (desktopScrollRef.current) {
      desktopScrollRef.current.scrollTop = desktopScrollRef.current.scrollHeight;
    }
  };

  // Audio playback and recording refs
  const recognitionRef = useRef<any>(null);
  const recognitionManualStopRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudio = () => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch (e) {}
      audioRef.current = null;
    }
    try {
      const { Live2dManager } = require("@/lib/live2d/live2dManager");
      Live2dManager.getInstance().stopAudio();
    } catch (e) {}
    setAvatarState("idle");
  };

  // Avatar config state (Default to Hiyori Live2D to avoid any loading screen flicker/delay)
  const [avatarConfig, setAvatarConfig] = useState<any>({
    name: "Hiyori (Live2D)",
    avatarStyle: "live2d_Hiyori",
    voiceStyle: "warm",
    speechRate: 100,
    pitch: 105,
    greeting: "你好，我是日和！很高兴在这个美好的天气里遇见你，今天想听我介绍哪个景点呢？",
    isDefault: true,
    isActive: true,
    imageUrl: "/sentio/characters/free/Hiyori/Hiyori.png"
  });

  // Background selection state
  const [bgImage, setBgImage] = useState<string>("/background/北京.png");
  const [showBgMenu, setShowBgMenu] = useState(false);

  // Persona selection state
  const [selectedStyle, setSelectedStyle] = useState<string>("live2d_Hiyori");
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [allAvatars, setAllAvatars] = useState<any[]>([]);
  const [customAvatars, setCustomAvatars] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarUploadRef = useRef<HTMLInputElement>(null);

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBgImage(event.target.result as string);
          toast.success("背景上传成功！");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const loadAvatars = () => {
    request("/api/qa/avatars")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllAvatars(data);
          const defaultAvatar = data.find((a) => a.isDefault);
          if (defaultAvatar) {
            setSelectedStyle(defaultAvatar.avatarStyle);
            setAvatarConfig(defaultAvatar);
          }
        }
      })
      .catch((e) => console.error("Failed to load avatars", e));
  };

  useEffect(() => {
    loadAvatars();
    try {
      const stored = localStorage.getItem("custom_avatars");
      if (stored) {
        setCustomAvatars(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const selectAvatar = (styleUrlOrId: string) => {
    setSelectedStyle(styleUrlOrId);
    const found = [...allAvatars, ...customAvatars].find((a) => a.avatarStyle === styleUrlOrId);
    if (found) {
      setAvatarConfig(found);
    } else {
      setAvatarConfig({
        avatarStyle: styleUrlOrId,
        voiceStyle: "warm",
        speechRate: 100,
        pitch: 100,
      });
    }
  };

  const handleCustomAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const toastId = toast.loading("正在上传您的分身形象...");
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        const name = prompt("请输入您分身形象的名称：", `分身形象 #${customAvatars.length + 1}`) || `分身形象 #${customAvatars.length + 1}`;
        const newAvatar = {
          id: -Date.now(),
          name,
          avatarStyle: data.url,
          imageUrl: data.url,
          voiceStyle: "warm",
          speechRate: 100,
          pitch: 100,
        };
        const updated = [newAvatar, ...customAvatars];
        setCustomAvatars(updated);
        localStorage.setItem("custom_avatars", JSON.stringify(updated));
        selectAvatar(data.url);
        toast.success("分身生成并启用成功！");
      } else {
        toast.error(data.error || "上传失败");
      }
    } catch {
      toast.error("网络故障，上传失败");
    } finally {
      toast.dismiss(toastId);
    }
  };

  // Sync loaded default style
  useEffect(() => {
    if (avatarConfig?.avatarStyle) {
      setSelectedStyle(avatarConfig.avatarStyle);
    }
  }, [avatarConfig]);

  useEffect(() => {
    request("/api/qa/avatar-active")
      .then((r) => r.json())
      .then((d) => {
        if (d && d.avatarStyle) {
          setAvatarConfig(d);
        }
      })
      .catch((e) => console.error("Failed to load active avatar config", e));
  }, []);

  useEffect(() => {
    request("/api/qa/chat")
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

  const [avatarWidth, setAvatarWidth] = useState(450); // Default to a wider layout (450px)
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
      stopAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleMouseMove]);

  useEffect(() => {
    scrollToBottom("auto");
    const t1 = setTimeout(() => scrollToBottom("smooth"), 80);
    const t2 = setTimeout(() => scrollToBottom("smooth"), 250);
    const t3 = setTimeout(() => scrollToBottom("smooth"), 450);
    const t4 = setTimeout(() => scrollToBottom("smooth"), 650);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
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

    stopAudio();

    setAvatarState("speaking");
    try {
      const payload = {
        text: text.slice(0, 320),
        voiceStyle: avatarConfig?.voiceStyle || "warm",
        speechRate: avatarConfig?.speechRate || 100,
        pitch: avatarConfig?.pitch || 100,
        ttsConfig: avatarConfig?.settings?.tts,
      };

      const res = await request("/api/qa/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("TTS generation failed");

      const isLive2D = avatarConfig?.avatarStyle?.startsWith("live2d_");

      const blob = await res.blob();
      if (isLive2D) {
        const arrayBuffer = await blob.arrayBuffer();
        const { Live2dManager } = require("@/lib/live2d/live2dManager");
        Live2dManager.getInstance().onAudioStarted = () => setAvatarState("speaking");
        Live2dManager.getInstance().onAudioEnded = () => setAvatarState("idle");
        Live2dManager.getInstance().pushAudioQueue(arrayBuffer);
      } else {
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
      }
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
      recognitionManualStopRef.current = true;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setRecording(false);
      } else if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setRecording(false);
      }
      return;
    }

    stopAudio();

    const asrEngine = avatarConfig?.settings?.asr?.engine || "browser";

    if (SR && asrEngine !== "whisper") {
      const rec = new SR();
      recognitionManualStopRef.current = false;
      rec.lang = "zh-CN"; rec.continuous = true; rec.interimResults = true;
      rec.onresult = (e: any) => {
        const result = e.results[e.results.length - 1];
        const txt = result?.[0]?.transcript?.trim() || "";
        if (!txt) return;
        setInput(txt);
        if (result.isFinal) {
          recognitionManualStopRef.current = true;
          setRecording(false);
          rec.stop();
          sendMessage(txt);
        }
      };
      rec.onend = () => {
        if (recognitionManualStopRef.current) {
          recognitionManualStopRef.current = false;
          setRecording(false);
          return;
        }
        try {
          rec.start();
        } catch {
          setRecording(false);
        }
      };
      rec.onerror = (e: any) => {
        if (e?.error === "no-speech") return;
        setRecording(false);
      };
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
          if (avatarConfig?.settings?.asr) {
            formData.append("asrConfig", JSON.stringify(avatarConfig.settings.asr));
          }

          setInput("正在识别语音...");
          try {
            const res = await request("/api/qa/stt", {
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
    stopAudio();
    const ts = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    const updated = [...messages, { role: "user" as const, content: question, timestamp: ts }];
    setMessages(updated); setInput(""); setLoading(true); setChatExpanded(true);

    const aiTs = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    // Placeholder for streaming answer
    setMessages((prev) => [...prev, { role: "assistant" as const, content: "", timestamp: aiTs }]);

    try {
      const history = updated.slice(1).map((m) => ({ role: m.role, content: m.content }));
      const res = await request("/api/qa/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history, stream: true, agentConfig: avatarConfig?.settings?.agent }),
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
              const clean = fullAnswer.replace(/\[情感[:：]\s*[^\]]+\]/g, "").trim();
              // Update streaming message in real-time
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { ...copy[copy.length - 1], content: clean };
                return copy;
              });
              if (mobileBottomRef.current) mobileBottomRef.current.scrollIntoView({ behavior: "auto", block: "end" });
              if (mobileScrollRef.current) mobileScrollRef.current.scrollTop = mobileScrollRef.current.scrollHeight;
              if (desktopBottomRef.current) desktopBottomRef.current.scrollIntoView({ behavior: "auto", block: "end" });
              if (desktopScrollRef.current) desktopScrollRef.current.scrollTop = desktopScrollRef.current.scrollHeight;
              setSubtitle(clean);
              // Detect sentence boundary → flush TTS
              const sentenceEnd = /[。！？.!?]/.test(delta);
              if (sentenceEnd && !ttsStarted && ttsBuffer.replace(/\[情感[:：]\s*[^\]]+\]/g, "").trim().length > 12) {
                ttsStarted = true;
                const firstSentence = ttsBuffer.replace(/\[情感[:：]\s*[^\]]+\]/g, "").trim();
                ttsBuffer = "";
                flushTTS(firstSentence);
              }
            }
          } catch { /* ignore parse errors */ }
        }
      }

      // If TTS wasn't started yet (short answer), speak the full answer
      if (!ttsStarted) {
        const clean = fullAnswer.replace(/\[情感[:：]\s*[^\]]+\]/g, "").trim();
        speak(clean);
      }

      // Satisfaction modal disabled per user request
    } catch {
      // Fallback to non-streaming
      try {
        const history = updated.slice(1).map((m) => ({ role: m.role, content: m.content }));
        const res2 = await request("/api/qa/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, history, agentConfig: avatarConfig?.settings?.agent }),
        });
        const data = await res2.json();
        const answerRaw = data.answer || "抱歉，暂时无法回答。";
        const answer = answerRaw.replace(/\[情感[:：]\s*[^\]]+\]/g, "").trim();
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

  // AvatarSelectorModal takes care of selection dialog now

  /* ── Message list (shared between mobile & desktop) ── */
  const renderMessageList = (isMobileImmersive = false, bottomRefToUse?: React.RefObject<HTMLDivElement | null>) => (
    <div className="space-y-3">
      {messages.map((msg, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0 }}
          className={`flex gap-2 items-end ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center shadow-md"
            style={{ border: isMobileImmersive ? "1.5px solid rgba(255,255,255,0.25)" : "1.5px solid #E6E2D8" }}>
            {msg.role === "assistant" ? (
              <div className="w-full h-full bg-[#1A2520]">
                <DigitalAvatar state="idle" size="sm" avatarStyle={selectedStyle} />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[11px] font-black rounded-full"
                style={{ background: "linear-gradient(135deg,#4B9EFF,#2563EB)", color: "white" }}>
                我
              </div>
            )}
          </div>
          {/* Bubble */}
          <div className={`flex flex-col gap-0.5 max-w-[76%] ${msg.role === "user" ? "items-end" : ""}`}>
            <div className="px-4 py-3 text-[13px] leading-relaxed"
              style={isMobileImmersive ? {
                borderRadius: msg.role === "assistant" ? "4px 18px 18px 18px" : "18px 4px 18px 18px",
                background: msg.role === "assistant"
                  ? "linear-gradient(135deg, rgba(255,100,160,0.82) 0%, rgba(180,60,220,0.82) 100%)"
                  : "linear-gradient(135deg, rgba(59,130,246,0.92) 0%, rgba(37,99,235,0.92) 100%)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: msg.role === "assistant"
                  ? "1px solid rgba(255,120,180,0.35)"
                  : "1px solid rgba(96,165,250,0.35)",
                color: "white",
                boxShadow: msg.role === "assistant"
                  ? "0 4px 20px rgba(220,60,180,0.25)"
                  : "0 4px 20px rgba(37,99,235,0.3)",
              } : {
                borderRadius: msg.role === "assistant" ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
                background: msg.role === "assistant" ? "white" : "linear-gradient(135deg,#4F6F52,#3A5240)",
                border: msg.role === "assistant" ? "1px solid #E6E2D8" : "none",
                color: msg.role === "assistant" ? "#1E2522" : "white",
                boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
              }}>
              {msg.role === "assistant" && !msg.content.trim() ? (
                <span className="flex items-center gap-1.5 py-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span key={i} animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.55, delay: i * 0.14, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full inline-block"
                      style={{ background: isMobileImmersive ? "rgba(255,255,255,0.9)" : "#4F6F52" }} />
                  ))}
                </span>
              ) : (
                msg.content.replace(/\[情感[:：]\s*[^\]]+\]/g, "").trim()
              )}
            </div>
            <span className="text-[9px] font-mono px-1" style={{ color: isMobileImmersive ? "rgba(255,255,255,0.4)" : "#B8B4AC" }}>{msg.timestamp}</span>
          </div>
        </motion.div>
      ))}
      <div ref={bottomRefToUse} />
    </div>
  );

  /* ── Input bar (shared) ── */
  const renderInputBar = (dark = false) => (
    <div className={`flex items-center gap-2`}>
      {/* Camera */}
      <motion.button type="button" whileTap={{ scale: 0.84 }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push("/vr-recognize?action=camera"); }}
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md transition-all hover:brightness-105"
        style={{
          background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)",
          boxShadow: "0 2px 8px rgba(245, 158, 11, 0.3)",
          border: "1.5px solid rgba(255, 255, 255, 0.25)",
          color: "white",
        }}>
        <Camera className="w-4 h-4" />
      </motion.button>

      {/* Voice */}
      <motion.button type="button" whileTap={{ scale: 0.84 }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleRecording(); }}
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative shadow-md transition-all hover:brightness-105"
        style={{
          background: recording
            ? "linear-gradient(135deg,#EF4444,#DC2626)"
            : "linear-gradient(135deg,#10B981,#059669)",
          boxShadow: recording
            ? "0 2px 8px rgba(220, 38, 38, 0.3)"
            : "0 2px 8px rgba(5, 150, 105, 0.3)",
          border: "1.5px solid rgba(255, 255, 255, 0.25)",
          color: "white",
        }}>
        {recording && (
          <motion.div animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 0.9, repeat: Infinity }}
            className="absolute inset-0 rounded-full"
            style={{ background: "rgba(255,255,255,0.25)" }} />
        )}
        {recording ? (
          <Mic className="w-4 h-4 relative z-10 animate-bounce text-white" />
        ) : (
          <Mic className="w-4 h-4 text-white" />
        )}
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
      <div className="flex flex-col md:hidden transition-all duration-500 overflow-hidden"
        style={{
          height: "calc(100svh - 56px - env(safe-area-inset-bottom, 0px))",
          background: bgImage
            ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.5)), url(${bgImage})`
            : "linear-gradient(180deg,#131C18 0%,#1A2520 45%,#0E1710 100%)",
          backgroundSize: bgImage ? "cover" : undefined,
          backgroundPosition: bgImage ? "center" : undefined,
        }}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pb-3 flex-shrink-0"
          style={{ paddingTop: "calc(env(safe-area-inset-top,44px) + 24px)" }}>
          <div className="flex items-center gap-2">
            <motion.div animate={{ backgroundColor: loading ? "#D2A053" : "#34C759" }}
              className="w-2 h-2 rounded-full" />
            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>
              {loading ? "小玉思考中…" : "旅行家Pro导览官 · 在线"}
            </span>
          </div>
          <div className="flex gap-2 relative">
            <motion.button whileTap={{ scale: 0.85 }} onClick={() => { setShowBgMenu(!showBgMenu); setShowPersonaMenu(false); }}
              className="w-8 h-8 rounded-full flex items-center justify-center animate-fade-in"
              style={{ background: "rgba(255,255,255,0.08)", color: showBgMenu ? "#D2A053" : "rgba(255,255,255,0.6)" }}>
              <ImageIcon className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.85 }} onClick={() => { setShowPersonaMenu(true); setShowBgMenu(false); }}
              className="w-8 h-8 rounded-full flex items-center justify-center animate-fade-in"
              style={{ background: "rgba(255,255,255,0.08)", color: showPersonaMenu ? "#D2A053" : "rgba(255,255,255,0.6)" }}>
              <User className="w-3.5 h-3.5" />
            </motion.button>
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

            {/* Background Dropdown Menu */}
            {showBgMenu && (
              <div className="absolute right-0 top-10 z-50 w-56 rounded-2xl p-3 border border-white/10 backdrop-blur-xl bg-black/80 shadow-2xl space-y-2.5">
                <div className="flex justify-between items-center pb-1.5 border-b border-white/10">
                  <span className="text-xs font-semibold text-white/90">切换景点背景</span>
                  <button onClick={() => setShowBgMenu(false)} className="text-white/40 hover:text-white"><X className="w-3 h-3" /></button>
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-0.5">
                  {BG_PRESETS.map((bg) => (
                    <button key={bg.id} onClick={() => { setBgImage(bg.url); setShowBgMenu(false); }}
                      className="p-1.5 rounded-lg text-left text-[11px] font-medium transition-all border text-white hover:bg-white/10"
                      style={{
                        borderColor: (bgImage === bg.url) ? "#D2A053" : "transparent",
                        background: (bgImage === bg.url) ? "rgba(210,160,83,0.25)" : "rgba(255,255,255,0.05)"
                      }}>
                      <div className="truncate">{bg.label}</div>
                    </button>
                  ))}
                </div>
                <div className="pt-1.5 border-t border-white/10">
                  <button onClick={() => fileInputRef.current?.click()}
                    className="w-full py-1.5 rounded-lg text-center text-[11px] font-semibold text-black bg-[#D2A053] hover:bg-[#b8843a] transition-colors">
                    上传自定义背景
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Avatar zone */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 relative min-h-0 pb-36">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 50% at 50% 40%,rgba(79,111,82,0.12) 0%,transparent 70%)" }} />
          {spotName && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-[11px]"
              style={{ background: "rgba(210,160,83,0.12)", border: "1px solid rgba(210,160,83,0.28)", color: "#D2A053" }}>
              <Sparkles className="w-3 h-3" />当前聚焦：<strong>{spotName}</strong>
            </motion.div>
          )}
          {!isDesktop && <DigitalAvatar state={avatarState} size="hero" audioElement={audioRef.current} avatarStyle={selectedStyle} />}
        </div>

        {/* Chat drawer — fully transparent, no background mask */}
        <motion.div
          animate={{ height: chatExpanded ? "42vh" : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          className="overflow-hidden absolute left-3 right-3 bottom-[128px] z-30 rounded-t-2xl pointer-events-auto">
          <div ref={mobileScrollRef} className="h-full overflow-y-auto px-4 py-3"
            style={{
              maskImage: "linear-gradient(to bottom, transparent 0%, black 12%, black 86%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 12%, black 86%, transparent 100%)",
            }}>
            {renderMessageList(true, mobileBottomRef)}
          </div>
        </motion.div>

        {/* Input zone — styled like reference image */}
        <div className="flex-shrink-0 px-3 pb-8 pt-2 relative z-40">
          {/* Quick prompts */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none mb-2.5 px-1">
            {["揽月亭历史故事", "景区门票价格", "适合老人路线", "翠玉湖怎么走"].map((p) => (
              <motion.button
                key={p}
                whileTap={{ scale: 0.94 }}
                onClick={() => sendMessage(p)}
                className="flex-shrink-0 text-[11px] px-3.5 py-1.5 rounded-full transition-colors"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  color: "rgba(255,255,255,0.9)"
                }}
              >
                {p}
              </motion.button>
            ))}
          </div>
          {/* Input row: [Camera] [Mic] [Input pill] [Send/Camera] */}
          <div className="flex items-center gap-2.5">
            {/* Camera button — left of mic */}
            <motion.button type="button" whileTap={{ scale: 0.88 }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push("/vr-recognize?action=camera"); }}
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg transition-all hover:brightness-105"
              style={{
                background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                boxShadow: "0 4px 14px rgba(217, 119, 6, 0.4)",
                border: "1.5px solid rgba(255,255,255,0.25)",
              }}>
              <Camera className="w-5 h-5 text-white" />
            </motion.button>

            {/* Voice button */}
            <motion.button type="button" whileTap={{ scale: 0.88 }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleRecording(); }}
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 relative shadow-lg transition-all hover:brightness-105"
              style={{
                background: recording
                  ? "linear-gradient(135deg,#EF4444,#DC2626)"
                  : "linear-gradient(135deg,#10B981,#059669)",
                boxShadow: recording
                  ? "0 4px 14px rgba(220, 38, 38, 0.45)"
                  : "0 4px 14px rgba(5, 150, 105, 0.45)",
                border: "1.5px solid rgba(255,255,255,0.25)",
              }}>
              {recording && (
                <motion.div animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                  className="absolute inset-0 rounded-full"
                  style={{ background: "rgba(255,255,255,0.3)" }} />
              )}
              {recording
                ? <MicOff className="w-5 h-5 text-white relative z-10" />
                : <Mic className="w-5 h-5 text-white" />}
            </motion.button>

            {/* Text input pill */}
            <div className="flex-1 flex items-center px-4 py-3 rounded-full"
              style={{
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.28)",
                minHeight: 48,
              }}>
              <input type="text" value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                placeholder={recording ? "正在聆听…" : "想聊点什么…"}
                className="flex-1 bg-transparent outline-none"
                style={{ color: "rgba(255,255,255,0.95)", fontSize: 15, caretColor: "white" }} />
            </div>

            {/* Send button */}
            <AnimatePresence mode="wait">
              {input.trim() ? (
                <motion.button key="send"
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }} whileTap={{ scale: 0.84 }}
                  onClick={() => sendMessage(input)}
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg,rgba(255,255,255,0.9),rgba(220,220,220,0.9))",
                    boxShadow: "0 4px 16px rgba(255,255,255,0.25)",
                  }}>
                  <Send className="w-4.5 h-4.5" style={{ color: "#1A2520" }} />
                </motion.button>
              ) : (
                <div key="gap" className="w-12 h-12 flex-shrink-0" />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          DESKTOP — two-column layout (hidden on mobile)
          ══════════════════════════════════════════════ */}
      <div className="hidden md:flex h-svh overflow-hidden"
        style={{ background: "#FAF8F5" }}>

        {/* Left: Digital human panel */}
        <div ref={panelRef} className="flex flex-col items-center justify-center flex-shrink-0 relative select-none transition-all duration-500"
          style={{
            width: avatarWidth,
            background: bgImage
              ? `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.55)), url(${bgImage})`
              : "linear-gradient(180deg,#1E2C28 0%,#121815 55%,#0E1710 100%)",
            backgroundSize: bgImage ? "cover" : undefined,
            backgroundPosition: bgImage ? "center" : undefined,
            borderRight: "1px solid rgba(255,255,255,0.07)",
          }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: bgImage ? "none" : "radial-gradient(ellipse 80% 60% at 50% 35%,rgba(79,111,82,0.14) 0%,transparent 70%)" }} />

          {/* Desktop Left Panel Floating Controls */}
          <div className="absolute top-8 left-4 right-4 flex justify-between items-center z-20">
            <div className="text-[11px] font-medium tracking-wide text-white/50 bg-black/30 backdrop-blur px-2.5 py-1 rounded-full border border-white/5">
              旅行家Pro导览官 · 在线
            </div>
            <div className="flex gap-2 relative">
              <motion.button whileTap={{ scale: 0.85 }} onClick={() => { setShowBgMenu(!showBgMenu); setShowPersonaMenu(false); }}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-black/35 backdrop-blur hover:bg-black/55 transition-colors border border-white/10"
                style={{ color: showBgMenu ? "#D2A053" : "rgba(255,255,255,0.75)" }}>
                <ImageIcon className="w-3.5 h-3.5" />
              </motion.button>
              <motion.button whileTap={{ scale: 0.85 }} onClick={() => { setShowPersonaMenu(true); setShowBgMenu(false); }}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-black/35 backdrop-blur hover:bg-black/55 transition-colors border border-white/10"
                style={{ color: showPersonaMenu ? "#D2A053" : "rgba(255,255,255,0.75)" }}>
                <User className="w-3.5 h-3.5" />
              </motion.button>

              {/* Background Dropdown Menu */}
              {showBgMenu && (
                <div className="absolute right-0 top-10 z-50 w-56 rounded-2xl p-3 border border-white/10 backdrop-blur-xl bg-black/80 shadow-2xl space-y-2.5">
                  <div className="flex justify-between items-center pb-1.5 border-b border-white/10">
                    <span className="text-xs font-semibold text-white/90">切换景点背景</span>
                    <button onClick={() => setShowBgMenu(false)} className="text-white/40 hover:text-white"><X className="w-3 h-3" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-0.5">
                    {BG_PRESETS.map((bg) => (
                      <button key={bg.id} onClick={() => { setBgImage(bg.url); setShowBgMenu(false); }}
                        className="p-1.5 rounded-lg text-left text-[11px] font-medium transition-all border text-white hover:bg-white/10"
                        style={{
                          borderColor: (bgImage === bg.url) ? "#D2A053" : "transparent",
                          background: (bgImage === bg.url) ? "rgba(210,160,83,0.25)" : "rgba(255,255,255,0.05)"
                        }}>
                        <div className="truncate">{bg.label}</div>
                      </button>
                    ))}
                  </div>
                  <div className="pt-1.5 border-t border-white/10">
                    <button onClick={() => fileInputRef.current?.click()}
                      className="w-full py-1.5 rounded-lg text-center text-[11px] font-semibold text-black bg-[#D2A053] hover:bg-[#b8843a] transition-colors">
                      上传自定义背景
                    </button>
                  </div>
                </div>
              )}


            </div>
          </div>

          {/* Resizer Handle */}
          <div
            className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-[#4F6F52]/40 active:bg-[#4F6F52] transition-colors z-20 group"
            onMouseDown={handleMouseDown}
          >
            {/* Visual drag indicator */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-8 bg-white/20 group-hover:bg-white/50 rounded transition-colors" />
          </div>

          <div className="relative z-10 flex flex-col items-center px-6 w-full animate-fade-in">
            {isDesktop && <DigitalAvatar state={avatarState} size="desktop-hero" audioElement={audioRef.current} avatarStyle={selectedStyle} />}

            {spotName && (
              <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px]"
                style={{ background: "rgba(210,160,83,0.12)", border: "1px solid rgba(210,160,83,0.28)", color: "#D2A053" }}>
                <Sparkles className="w-3 h-3" />聚焦：{spotName}
              </div>
            )}

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

          {/* Messages — same immersive bubble style as mobile */}
          <div ref={desktopScrollRef} className="flex-1 overflow-y-auto px-6 py-4"
            style={{
              background: "#FAF8F5",
              maskImage: "linear-gradient(to bottom, transparent 0%, black 6%, black 94%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 6%, black 94%, transparent 100%)",
            }}>
            {renderMessageList(true, desktopBottomRef)}
          </div>

          {/* Input */}
          <div className="px-6 py-4 flex-shrink-0"
            style={{ borderTop: "1px solid #E6E2D8", background: "rgba(250,248,245,0.98)" }}>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none mb-3 px-1 py-0.5">
              {["揽月亭历史故事", "景区门票价格", "适合老人路线", "翠玉湖怎么走"].map((p) => (
                <motion.button
                  key={p}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => sendMessage(p)}
                  className="flex-shrink-0 text-[11px] px-3.5 py-1.5 rounded-full transition-all border text-zinc-600 hover:text-[#4F6F52] hover:border-[#4F6F52] bg-white border-neutral-200 shadow-sm whitespace-nowrap"
                >
                  {p}
                </motion.button>
              ))}
            </div>
            {renderInputBar()}
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <input type="file" ref={fileInputRef} onChange={handleBgUpload} accept="image/*" className="hidden" />
      <input type="file" ref={avatarUploadRef} onChange={handleCustomAvatarUpload} accept="image/*,video/*" className="hidden" />
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
      </AnimatePresence>
      <AnimatePresence>
        {showPersonaMenu && (
          <AvatarSelectorModal
            onClose={() => setShowPersonaMenu(false)}
            allAvatars={allAvatars}
            customAvatars={customAvatars}
            selectedStyle={selectedStyle}
            onSelect={selectAvatar}
            onUploadClick={() => avatarUploadRef.current?.click()}
          />
        )}
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
