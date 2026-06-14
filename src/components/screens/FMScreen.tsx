"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Play, Pause, SkipForward, SkipBack, ChevronLeft, Sliders, Music, FileText, Settings, Volume2, VolumeX
} from "lucide-react";
import { toast } from "sonner";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 35 };

interface InterestItem {
  id: string;
  label: string;
  img: string;
  icon: string;
}

const INTEREST_OPTIONS: InterestItem[] = [
  { id: "heritage", label: "非遗文化", img: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=150&q=80", icon: "🏺" },
  { id: "celebrities", label: "城市名人", img: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=150&q=80", icon: "👑" },
  { id: "history", label: "历史典故", img: "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=150&q=80", icon: "🏯" },
  { id: "food", label: "美食起源", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=150&q=80", icon: "🍜" },
  { id: "life", label: "市井生活", img: "https://images.unsplash.com/photo-1624953901718-e24ee7200b85?w=150&q=80", icon: "🏮" },
  { id: "landmarks", label: "城市地标", img: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=150&q=80", icon: "📸" },
  { id: "legends", label: "民间传说", img: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=150&q=80", icon: "📖" },
];

export function FMScreen() {
  const router = useRouter();
  const [view, setView] = useState<"interests" | "player" | "lyrics">("interests");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["history", "landmarks", "celebrities"]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(8); // in seconds
  const duration = 120; // 2 minutes

  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);

  // Timer simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Audio Playback using our TTS endpoint for Chengdu Introduction
  const handlePlayToggle = () => {
    if (isPlaying) {
      audioInstance?.pause();
      setIsPlaying(false);
      return;
    }

    // Play synthesized guide speech
    const chengduIntro = "和我在成都的街头走一走，直到所有的灯都熄灭了也不停留。游客朋友们，今天西游兔带你来了解的是天府之国——成都。成都，简称“蓉”，别称蓉城、锦城，是四川省的省会，也是首批国家历史文化名城，古蜀文明发祥地，中国最佳旅游城市。地处四川盆地西部，青藏高原东缘，总面积达14335平方千米，常住人口超过2100万。成都属亚热带季风气候区，四季分明，雨量充沛，年平均气温约为16℃，是一个宜居宜游的好地方。";
    const audioUrl = "/api/qa/tts?text=" + encodeURIComponent(chengduIntro);
    const audio = audioInstance || new Audio(audioUrl);
    
    audio.play().catch(() => {
      toast.error("语音播报加载失败，请重试");
    });
    
    audio.onended = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    setAudioInstance(audio);
    setIsPlaying(true);
  };

  useEffect(() => {
    return () => {
      if (audioInstance) {
        audioInstance.pause();
      }
    };
  }, [audioInstance]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(prev => prev.filter(x => x !== id));
    } else {
      setSelectedInterests(prev => [...prev, id]);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#2C3E35] flex flex-col font-sans select-none overflow-x-hidden pb-24 md:pb-6">
      
      {/* ── Top Header ── */}
      <header className="sticky top-0 z-30 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#F0EDE5] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/home")}
            className="w-9 h-9 rounded-xl bg-white hover:bg-neutral-50 border border-[#E6E2D8] flex items-center justify-center transition-colors text-zinc-600 active:scale-95 cursor-pointer shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-black text-sm tracking-wide text-[#4F6F52]">
              伴游FM
            </h1>
            <p className="text-[10px] text-zinc-400">旅途畅听 · 智能解密说唱</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-bold text-zinc-500 bg-[#F5F2EB] px-2.5 py-0.5 rounded border border-[#E6E2D8]">
            FM TUNER LIVE
          </span>
        </div>
      </header>

      {/* ── Main Layout Wrapper ── */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8 flex flex-col items-center justify-center">
        
        <div className="w-full max-w-md bg-white rounded-[32px] border border-[#F0EDE5] shadow-[0_12px_40px_rgba(79,111,82,0.06)] overflow-hidden min-h-[580px] flex flex-col justify-between p-6">
          <AnimatePresence mode="wait">

            {/* ═══════════════════════════════════════════════════════
               1. 选择兴趣 (Select Interests)
               ═══════════════════════════════════════════════════════ */}
            {view === "interests" && (
              <motion.div
                key="interests"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={SPRING}
                className="flex flex-col justify-between flex-1"
              >
                <div className="space-y-6">
                  {/* Title */}
                  <div className="text-center space-y-1 relative">
                    <h2 className="text-2xl font-black text-[#D2A053] tracking-wide" style={{ fontFamily: "var(--font-noto-serif)" }}>
                      选择兴趣
                    </h2>
                    <p className="text-xs text-zinc-400">定制您的FM专属故事推荐</p>
                    <span className="absolute top-0 right-2 text-3xl animate-bounce">🐰</span>
                  </div>

                  {/* Bubble / Orbit arrangements */}
                  <div className="relative h-[300px] flex items-center justify-center">
                    {/* Ring graphics */}
                    <div className="absolute w-[260px] h-[260px] rounded-full border border-dashed border-[#E5E1D5]" />
                    <div className="absolute w-[160px] h-[160px] rounded-full border border-dashed border-[#E5E1D5]" />

                    {/* Center point logo */}
                    <div className="w-16 h-16 rounded-full bg-[#FFF5F2] border border-[#FFE8E2] shadow-inner flex items-center justify-center text-2xl relative z-10">
                      📻
                    </div>

                    {/* Orbit Positions */}
                    {INTEREST_OPTIONS.map((opt, idx) => {
                      const checked = selectedInterests.includes(opt.id);
                      // Calculate positions distributed on outer orbit
                      const angle = (idx * 2 * Math.PI) / INTEREST_OPTIONS.length;
                      const radius = idx % 2 === 0 ? 120 : 85; // alternate orbit radiuses
                      const x = Math.cos(angle) * radius;
                      const y = Math.sin(angle) * radius;

                      return (
                        <motion.div
                          key={opt.id}
                          onClick={() => toggleInterest(opt.id)}
                          style={{ x, y }}
                          className="absolute w-16 h-16 rounded-full cursor-pointer flex flex-col items-center justify-center transition-all z-20 group"
                        >
                          <div className={`w-12 h-12 rounded-full overflow-hidden border-2 relative transition-transform group-hover:scale-105 ${
                            checked ? "border-[#FF5B45]" : "border-[#E6E2D8]"
                          }`}>
                            <img src={opt.img} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-black/10" />
                            {checked && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF5B45] text-white text-[9px] rounded-full flex items-center justify-center border border-white">
                                ✓
                              </span>
                            )}
                          </div>
                          <span className="text-[9.5px] font-black text-zinc-700 mt-1 block truncate w-full text-center">
                            {opt.label}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setView("player")}
                  className="w-full py-4 bg-gradient-to-r from-[#FF7A5A] to-[#FF5B45] text-white text-xs font-black rounded-2xl shadow-lg shadow-orange-500/15 hover:brightness-105 transition-all cursor-pointer mt-6"
                >
                  选好了，开始收听
                </motion.button>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════
               2. 播放 (Audio Player)
               ═══════════════════════════════════════════════════════ */}
            {view === "player" && (
              <motion.div
                key="player"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={SPRING}
                className="flex flex-col justify-between flex-1"
              >
                {/* Top Toggle Row */}
                <div className="flex items-center justify-between">
                  <div className="bg-[#FAF8F5] border border-[#E6E2D8] rounded-full p-0.5 flex">
                    <button 
                      onClick={() => setView("player")}
                      className="px-4.5 py-1 text-[10.5px] font-black rounded-full bg-[#FF5B45] text-white shadow-sm"
                    >
                      播放
                    </button>
                    <button 
                      onClick={() => setView("lyrics")}
                      className="px-4.5 py-1 text-[10.5px] font-bold rounded-full text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                      词
                    </button>
                  </div>
                  <button 
                    onClick={() => setView("interests")}
                    className="text-[10px] font-black text-[#FF5B45] bg-[#FFF0ED] px-3.5 py-1.5 rounded-full hover:bg-[#FFE0DB] transition-colors cursor-pointer"
                  >
                    收听偏好
                  </button>
                </div>

                {/* Cover & Audio Info */}
                <div className="space-y-6 my-6 text-center">
                  <div className="relative mx-auto w-[220px] h-[220px] rounded-[36px] overflow-hidden border border-[#E6E2D8] shadow-md bg-zinc-50">
                    <img 
                      src="https://images.unsplash.com/photo-1624953901718-e24ee7200b85?w=500&q=80" 
                      className="w-full h-full object-cover" 
                      alt="Chengdu Street" 
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-zinc-800">成都市介绍</h3>
                    <p className="text-[10.5px] text-zinc-400">— 历史人文 —</p>
                  </div>

                  {/* Lyrics Preview */}
                  <div className="h-14 flex flex-col justify-center gap-1.5 overflow-hidden">
                    <p className="text-[12.5px] font-black text-[#FF5B45] leading-none animate-pulse">
                      和我在成都的街头走一走走一走
                    </p>
                    <p className="text-[10.5px] text-zinc-400 leading-none">
                      直到所有的灯都熄灭了也不停留
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <input 
                    type="range" 
                    min={0} 
                    max={duration} 
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="w-full accent-[#FF5B45] h-1 bg-zinc-100 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                    <span>{formatTime(progress)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Play controls */}
                <div className="flex items-center justify-center gap-8 mt-4">
                  <button 
                    onClick={() => setProgress(Math.max(0, progress - 10))}
                    className="p-3 bg-zinc-50 hover:bg-zinc-100 rounded-full text-zinc-500 active:scale-95 transition-all cursor-pointer shadow-sm border border-[#E6E2D8]"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={handlePlayToggle}
                    className="w-14 h-14 bg-gradient-to-br from-[#FF7A5A] to-[#FF5B45] rounded-full flex items-center justify-center text-white active:scale-95 hover:brightness-105 transition-all shadow-lg shadow-orange-500/20 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-white text-white" /> : <Play className="w-5 h-5 ml-1 fill-white text-white" />}
                  </button>

                  <button 
                    onClick={() => setProgress(Math.min(duration, progress + 10))}
                    className="p-3 bg-zinc-50 hover:bg-zinc-100 rounded-full text-zinc-500 active:scale-95 transition-all cursor-pointer shadow-sm border border-[#E6E2D8]"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════
               3. 词 (Lyrics)
               ═══════════════════════════════════════════════════════ */}
            {view === "lyrics" && (
              <motion.div
                key="lyrics"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={SPRING}
                className="flex flex-col justify-between flex-1"
              >
                {/* Top Toggle Row */}
                <div className="flex items-center justify-between">
                  <div className="bg-[#FAF8F5] border border-[#E6E2D8] rounded-full p-0.5 flex">
                    <button 
                      onClick={() => setView("player")}
                      className="px-4.5 py-1 text-[10.5px] font-bold rounded-full text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                      播放
                    </button>
                    <button 
                      onClick={() => setView("lyrics")}
                      className="px-4.5 py-1 text-[10.5px] font-black rounded-full bg-[#FF5B45] text-white shadow-sm"
                    >
                      词
                    </button>
                  </div>
                  <button 
                    onClick={() => setView("interests")}
                    className="text-[10px] font-black text-[#FF5B45] bg-[#FFF0ED] px-3.5 py-1.5 rounded-full hover:bg-[#FFE0DB] transition-colors cursor-pointer"
                  >
                    收听偏好
                  </button>
                </div>

                {/* Lyrics Content */}
                <div className="flex-1 my-6 space-y-4 max-h-[360px] overflow-y-auto pr-2 styled-scrollbar">
                  <div className="text-center space-y-1">
                    <h3 className="text-base font-black text-zinc-800">成都市介绍</h3>
                    <p className="text-[10.5px] text-zinc-400">— 历史人文 —</p>
                  </div>

                  <div className="text-xs leading-relaxed text-zinc-600 space-y-4 tracking-wide font-medium bg-[#FFFDF9]/60 p-4.5 rounded-2xl border border-[#F0EDE5]">
                    <p className="text-[#FF5B45] font-extrabold text-[12.5px] leading-relaxed">
                      “和我在成都的街头走一走，直到所有的灯都熄灭了也不停留...”
                    </p>
                    <p>
                      游客朋友们，今天西游兔带你来了解的是天府之国——成都。
                    </p>
                    <p>
                      成都，简称“蓉”，别称蓉城、锦城，是四川省的省会，也是首批国家历史文化名城，古蜀文明发祥地，中国最佳旅游城市。地处四川盆地西部，青藏高原东缘，<span className="text-[#FF5B45] font-extrabold">总面积达14335平方千米</span>，常住人口超过2100万。成都属亚热带季风气候区，四季分明，雨量充沛，年平均气温约为16℃，是一个宜居宜游的好地方。
                    </p>
                    <p>
                      早在距今约4500年至3700年，成都平原已出现被后世称为“宝墩文化”的一系列古蜀先民的聚落中心，古蜀文化在此落地生根。关于“成都”的取名来源，据《太平寰宇记》记载，是借用西周建都的历史经过，取“一年成邑，二年成都，三年成都”而得名。汉代时，成都成为全国第二大商业都会，唐代更是“剑南四川道”的富庶之地，有“扬一益二”之称。
                    </p>
                    <p>
                      成都拥有都江堰水利工程、武侯祠、杜甫草堂、永陵、望江楼、青羊宫、文殊院、明蜀王陵等众多名胜古迹，期待您跟着伴游FM的声音，漫步在蓉城的大街小巷，沉浸感悟这里的历史与温情。
                    </p>
                  </div>
                </div>

                {/* Small Mini-Player row at bottom of lyrics */}
                <div className="bg-zinc-50 border border-[#E6E2D8] rounded-2xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <button 
                      onClick={handlePlayToggle}
                      className="w-8 h-8 rounded-lg bg-[#FF5B45] text-white flex items-center justify-center active:scale-95 cursor-pointer hover:brightness-105"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white text-white" /> : <Play className="w-3.5 h-3.5 ml-0.5 fill-white text-white" />}
                    </button>
                    <div className="text-left">
                      <span className="text-[10.5px] font-black text-zinc-800 block">成都市介绍</span>
                      <span className="text-[8.5px] text-zinc-400">播音精讲进行中</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#FF5B45] font-extrabold">{formatTime(progress)} / 02:00</span>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>
    </div>
  );
}
