"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, ChevronLeft, ChevronRight, X, Headphones, BookOpen } from "lucide-react";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 35 };

interface Chapter {
  id: number;
  title: string;
  duration: string; // "2:30"
  text: string;
  imageHint: string; // emoji representing scene
  mood: "calm" | "exciting" | "mysterious" | "warm";
}

interface StoryModeProps {
  spotId: number;
  spotName: string;
  onClose: () => void;
}

const MOOD_COLORS = {
  calm:       { bg: "linear-gradient(135deg,#1A2C28,#0E1A15)", accent: "#4F9E6A", text: "#A8D5B5" },
  exciting:   { bg: "linear-gradient(135deg,#2A1A08,#1A0E00)", accent: "#D2A053", text: "#F0CC88" },
  mysterious: { bg: "linear-gradient(135deg,#1A1520,#0E0A18)", accent: "#9A7AC8", text: "#C8A8F0" },
  warm:       { bg: "linear-gradient(135deg,#2A1A10,#1A0E08)", accent: "#D07840", text: "#F0B888" },
};

// Story chapters are generated per spot (real app would call API)
function getChapters(spotName: string): Chapter[] {
  return [
    {
      id: 1, title: "序章：初见", duration: "1:45",
      imageHint: "🌅",
      mood: "calm",
      text: `当晨雾还未完全散去，${spotName}便已在微光中显露出它古老的轮廓。
      \n\n数百年前，第一批工匠踏上这片土地，带着对山水的敬畏，用双手将自然与人文融为一体。
      \n\n每一块青石，每一根檐角，都记录着那个时代对美的极致追求。`,
    },
    {
      id: 2, title: "盛世：鼎盛岁月", duration: "2:20",
      imageHint: "🏯",
      mood: "exciting",
      text: `到了明清鼎盛时期，${spotName}迎来了它最辉煌的年代。
      \n\n达官贵人、文人墨客络绎不绝，留下了无数诗词碑刻。据说当年仅景区内的茶社就有十七家，
      各色雅集、诗会通宵达旦，好不热闹。
      \n\n那些欢声笑语早已随风而逝，但它们的回声，仍然藏在每一处精心雕刻的细节里。`,
    },
    {
      id: 3, title: "秘语：隐藏的故事", duration: "1:55",
      imageHint: "🔍",
      mood: "mysterious",
      text: `很少有人知道，${spotName}其实隐藏着一个从未被正式记录的传说。
      \n\n据当地老人口述，某年大旱时节，此处曾突然涌出清泉，解了周边百姓三月之困。
      人们以为是山神显灵，特地在此立碑祈福。
      \n\n那块石碑至今仍立于某处角落，上面的字迹已被岁月磨平，等待着有缘人去发现。`,
    },
    {
      id: 4, title: "今世：永恒与新生", duration: "1:30",
      imageHint: "🌿",
      mood: "warm",
      text: `如今的${spotName}，既是历史的见证者，也是新时代文旅的主角。
      \n\n每年有数十万游客来到这里，他们带来了现代的目光，也带走了对传统文化的感动。
      \n\n无论时代如何变迁，${spotName}始终静静地伫立于此，以它独有的方式，
      讲述着关于这片土地最动人的故事。`,
    },
  ];
}

export function StoryModePlayer({ spotId, spotName, onClose }: StoryModeProps) {
  const chapters = getChapters(spotName);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [textVisible, setTextVisible] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const ch = chapters[current];
  const colors = MOOD_COLORS[ch.mood];

  // Simulate progress bar when playing
  useEffect(() => {
    if (!playing) { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(intervalRef.current!);
          setPlaying(false);
          // auto-advance
          if (current < chapters.length - 1) {
            setTimeout(() => { setCurrent((c) => c + 1); setProgress(0); setPlaying(true); }, 800);
          }
          return 100;
        }
        return p + 0.4;
      });
    }, 80);
    return () => clearInterval(intervalRef.current!);
  }, [playing, current, chapters.length]);

  // TTS: read chapter text
  useEffect(() => {
    if (!playing || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(ch.text.replace(/\n/g, " ").slice(0, 400));
    utter.lang = "zh-CN"; utter.rate = 0.85; utter.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find((x) => x.lang.startsWith("zh") && x.name.includes("Female")) || voices.find((x) => x.lang.startsWith("zh"));
    if (v) utter.voice = v;
    window.speechSynthesis.speak(utter);
    return () => window.speechSynthesis.cancel();
  }, [playing, current, ch.text]);

  const goTo = (idx: number) => {
    window.speechSynthesis?.cancel();
    setCurrent(idx); setProgress(0); setPlaying(false); setTextVisible(false);
    setTimeout(() => setTextVisible(true), 300);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: colors.bg, transition: "background 0.8s ease" }}>

      {/* Ambient particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div key={i}
            className="absolute rounded-full"
            style={{ width: 3 + i, height: 3 + i, background: colors.accent, opacity: 0.15, left: `${10 + i * 12}%`, top: `${20 + (i % 3) * 25}%` }}
            animate={{ y: [-10, -30, -10], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: i * 0.6, ease: "easeInOut" }} />
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top,44px)+12px)] pb-3 relative z-10">
        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4" style={{ color: colors.accent }} />
          <span className="text-[11px] font-semibold tracking-wider" style={{ color: colors.accent }}>
            故事导览 · {spotName}
          </span>
        </div>
        <motion.button whileTap={{ scale: 0.88 }} onClick={() => { window.speechSynthesis?.cancel(); onClose(); }}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.1)" }}>
          <X className="w-4 h-4 text-white" />
        </motion.button>
      </div>

      {/* Chapter indicator */}
      <div className="flex justify-center gap-2 px-5 mb-4 relative z-10">
        {chapters.map((c, i) => (
          <motion.button key={c.id} whileTap={{ scale: 0.9 }} onClick={() => goTo(i)}
            className="flex-1 h-1 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.15)" }}>
            <motion.div className="h-full rounded-full"
              style={{ background: colors.accent, width: i < current ? "100%" : i === current ? `${progress}%` : "0%" }}
              transition={{ duration: 0.1 }} />
          </motion.button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        {/* Scene emoji */}
        <AnimatePresence mode="wait">
          <motion.div key={current + "-emoji"}
            initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.3, opacity: 0 }} transition={SPRING}
            className="text-6xl mb-6 select-none"
            style={{ filter: `drop-shadow(0 0 24px ${colors.accent}66)` }}>
            {ch.imageHint}
          </motion.div>
        </AnimatePresence>

        {/* Chapter title */}
        <AnimatePresence mode="wait">
          <motion.h2 key={current + "-title"}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={SPRING}
            className="text-xl font-bold text-center mb-1"
            style={{ fontFamily: "var(--font-noto-serif)", color: colors.text }}>
            {ch.title}
          </motion.h2>
        </AnimatePresence>

        <p className="text-[11px] mb-6 font-mono" style={{ color: `${colors.text}66` }}>
          第 {current + 1} 章 · {ch.duration}
        </p>

        {/* Story text */}
        <div className="max-w-sm w-full">
          <AnimatePresence mode="wait">
            {textVisible && (
              <motion.div key={current + "-text"}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ ...SPRING, delay: 0.15 }}
                className="px-5 py-4 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${colors.accent}30` }}>
                {ch.text.split("\n\n").map((para, i) => (
                  <p key={i} className="text-[13px] leading-relaxed mb-3 last:mb-0"
                    style={{ color: "rgba(255,255,255,0.78)" }}>
                    {para.trim()}
                  </p>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 pb-[calc(env(safe-area-inset-bottom,20px)+80px)] pt-4 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => current > 0 && goTo(current - 1)}
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.08)", opacity: current === 0 ? 0.35 : 1 }}>
            <ChevronLeft className="w-5 h-5 text-white" />
          </motion.button>

          {/* Play/Pause */}
          <motion.button whileTap={{ scale: 0.88 }}
            onClick={() => setPlaying(!playing)}
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}AA)`, boxShadow: `0 4px 24px ${colors.accent}55` }}>
            {playing
              ? <Pause className="w-7 h-7 text-white" />
              : <Play className="w-7 h-7 text-white ml-1" />}
          </motion.button>

          <motion.button whileTap={{ scale: 0.88 }} onClick={() => current < chapters.length - 1 && goTo(current + 1)}
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.08)", opacity: current === chapters.length - 1 ? 0.35 : 1 }}>
            <ChevronRight className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        {/* Chapter list */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {chapters.map((c, i) => (
            <motion.button key={c.id} whileTap={{ scale: 0.94 }} onClick={() => goTo(i)}
              className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-left"
              style={{
                background: i === current ? `${colors.accent}25` : "rgba(255,255,255,0.06)",
                border: `1px solid ${i === current ? colors.accent + "60" : "rgba(255,255,255,0.1)"}`,
                minWidth: 120,
              }}>
              <BookOpen className="w-3 h-3 flex-shrink-0" style={{ color: colors.accent }} />
              <div>
                <p className="text-[10px] font-semibold" style={{ color: i === current ? colors.text : "rgba(255,255,255,0.5)" }}>
                  {c.title}
                </p>
                <p className="text-[9px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>{c.duration}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
