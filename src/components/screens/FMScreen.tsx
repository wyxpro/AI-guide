"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Play, Pause, SkipForward, SkipBack, ChevronLeft, Sliders, Music, FileText, Settings, 
  Volume2, VolumeX, Heart, MessageSquare, Shuffle, ListMusic, Smartphone, Download, 
  MoreHorizontal, Compass
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

const TRACKS_DATABASE: Record<string, { title: string; artist: string; cover: string; text: string }> = {
  heritage: {
    title: "指尖上的蜀绣：巴蜀锦绣非遗传奇",
    artist: "AI 导游小玉",
    cover: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=500&q=80",
    text: "蜀绣，又名“川绣”，是中国四大名绣之一，有着两千多年的历史。它以软缎和彩丝为主要原料，结合巴蜀独特的风土人情，形成了细腻针法与亮丽色彩的完美平衡。蜀绣针法严谨、针脚整齐，以“变针”和“晕针”为核心特色。今天，跟随伴游FM的叙事声波，让我们一起走进锦江两岸的刺绣工坊，聆听那细针穿过软缎的沙沙声，感受匠人心尖上的温度与指尖上的华彩。"
  },
  celebrities: {
    title: "草堂留后世：诗圣杜甫的蜀中岁月",
    artist: "AI 导游小玉",
    cover: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=500&q=80",
    text: "杜甫，字子美，唐代伟大的现实主义诗人。安史之乱爆发后，他流落至成都，在浣花溪畔营造了一间茅屋，这便是名扬千古的杜甫草堂。在此期间，他度过了相对安宁的四年，创作了《春夜喜雨》、《蜀相》等无数脍炙人口的经典诗篇。草堂的一草一木，至今仍回荡着诗人的家国情怀与对这片土地的深情眷恋。让我们通过声音，重回那个烟雨朦胧的唐代蓉城。"
  },
  history: {
    title: "蜀地千年史：古蜀国与蓉城起源",
    artist: "AI 导游小玉",
    cover: "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=500&q=80",
    text: "成都，简称“蓉”，是一座有着三千余年建城史的历史文化名城。从宝墩遗址到金沙文明，古蜀先民在这片肥沃的盆地创造了璀璨的青铜文明。西周时期，建都者“一年成邑，二年成都”，由此得名成都，且城名与城址千百年来从未更改。它是南方丝绸之路的起点，汉代全国第二大商业都市，唐代富庶的“扬一益二”。今天，我们将拨开历史的迷雾，重温那段激荡人心的巴蜀史诗。"
  },
  food: {
    title: "舌尖上的麻辣：川菜与火锅的进化史",
    artist: "AI 导游小玉",
    cover: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80",
    text: "川菜作为中国四大名系之一，以“一菜一格，百菜百味”闻名天下。然而，今天川菜标志性的辣椒，其实是在明末清初才传入巴蜀的。在漫长的历史中，花椒、茱萸与生姜才是巴蜀麻辣的核心。而成都火锅更是码头文化的缩影，江边纤夫用简单的佐料与食材烹煮，最终演变为风靡全国的辣味盛宴。这一餐麻辣的背后，是巴蜀人民对生活的热烈期望与包容豁达的性格印记。"
  },
  life: {
    title: "老茶馆的慢时光：盖碗茶里的生活美学",
    artist: "AI 导游小玉",
    cover: "https://images.unsplash.com/photo-1624953901718-e24ee7200b85?w=500&q=80",
    text: "在成都，有一种生活美学叫“喝盖碗茶”。走进街角的老茶馆，一把竹椅，一张矮木桌，一具茶具，三两好友，一坐就是一下午。龙门阵摆起，长嘴铜壶倒出滚烫的开水，茶叶在盖碗中舒展。茶馆不仅是喝茶的地方，更是一个社交、调解纠纷、甚至进行商业谈判的公共场所。这里的慢时光，是天府之国闲适安逸的缩影，也是最本真的市井人间烟火气。"
  },
  landmarks: {
    title: "宽窄巷子：老成都的院落生活缩影",
    artist: "AI 导游小玉",
    cover: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=500&q=80",
    text: "宽窄巷子是成都极具代表性的历史文化保护区，由宽巷子、窄巷子和井巷子平行排列组成。这里原本是清代少城遗留的兵丁胡同，如今完整保留了清末民初的四合院落风貌。宽巷子是“闲生活”的代表，展示着老成都的悠闲惬意；窄巷子则是“慢生活”的缩影，折射出院落文化的精致优雅。漫步于此，青砖黛瓦之间，是古典与现代的交融，是时间的静静流淌。"
  },
  legends: {
    title: "金沙神鸟：太阳神鸟的飞翔传说",
    artist: "AI 导游小玉",
    cover: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=500&q=80",
    text: "在成都金沙遗址出土的“太阳神鸟”金饰，是一件震惊世界的国宝级文物。它极薄的金箔上镂空刻画着四只首尾相接、逆时针飞翔的神鸟，环绕着十二道光芒旋转的太阳。这一构图不仅体现了古蜀先民高超的黄金锻造工艺，更寓意着四季轮回与对光明的无限向往。四只神鸟承载着古蜀国的飞天梦想，飞过三千年的时光，成为中国文化遗产的标志，继续守护着天府之国的祥和与安宁。"
  }
};

export function FMScreen() {
  const router = useRouter();
  const [view, setView] = useState<"interests" | "player" | "lyrics">("interests");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["history", "landmarks", "celebrities"]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); 
  const [duration, setDuration] = useState(120); 
  const [isLiked, setIsLiked] = useState(false);

  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // Derive playlist from selected interests
  const playlist = selectedInterests.length > 0 
    ? selectedInterests.map(id => ({ id, ...TRACKS_DATABASE[id] })).filter(t => t.title)
    : Object.keys(TRACKS_DATABASE).map(id => ({ id, ...TRACKS_DATABASE[id] }));

  const currentTrack = playlist[currentTrackIndex] || {
    title: "成都市介绍",
    artist: "AI 导游小玉",
    cover: "https://images.unsplash.com/photo-1624953901718-e24ee7200b85?w=500&q=80",
    text: "和我在成都的街头走一走，直到所有的灯都熄灭了也不停留。游客朋友们，今天西游兔带你来了解的是天府之国——成都。成都，简称“蓉”，别称蓉城、锦城，是四川省的省会，也是首批国家历史文化名城，古蜀文明发祥地，中国最佳旅游城市。"
  };

  // Sync progress and duration using HTML5 Audio Events
  useEffect(() => {
    if (!audioInstance) return;

    const onTimeUpdate = () => {
      setProgress(Math.floor(audioInstance.currentTime));
    };

    const onLoadedMetadata = () => {
      setDuration(Math.floor(audioInstance.duration || 120));
    };

    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      // Auto-play next track if available
      if (playlist.length > 1) {
        playTrack((currentTrackIndex + 1) % playlist.length, true);
      }
    };

    audioInstance.addEventListener("timeupdate", onTimeUpdate);
    audioInstance.addEventListener("loadedmetadata", onLoadedMetadata);
    audioInstance.addEventListener("ended", onEnded);

    return () => {
      audioInstance.removeEventListener("timeupdate", onTimeUpdate);
      audioInstance.removeEventListener("loadedmetadata", onLoadedMetadata);
      audioInstance.removeEventListener("ended", onEnded);
    };
  }, [audioInstance, currentTrackIndex, playlist.length]);

  // Audio Playback handler
  const playTrack = (index: number, autoPlay = true) => {
    if (audioInstance) {
      audioInstance.pause();
    }
    
    setCurrentTrackIndex(index);
    setProgress(0);
    setIsLiked(false);
    
    const track = playlist[index];
    if (!track) return;
    
    const audioUrl = "/api/qa/tts?text=" + encodeURIComponent(track.text);
    const audio = new Audio(audioUrl);
    
    setAudioInstance(audio);
    
    if (autoPlay) {
      setIsPlaying(true);
      audio.play().catch(() => {
        toast.error("语音播报加载失败，请重试");
        setIsPlaying(false);
      });
    } else {
      setIsPlaying(false);
    }
  };

  const handlePlayToggle = () => {
    if (!audioInstance) {
      playTrack(currentTrackIndex, true);
      return;
    }

    if (isPlaying) {
      audioInstance.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      audioInstance.play().catch(() => {
        toast.error("播放失败，请重试");
        setIsPlaying(false);
      });
    }
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
    <div 
      className="min-h-screen text-zinc-800 flex flex-col font-sans select-none overflow-x-hidden pb-24 md:pb-6 relative"
      style={{ background: "linear-gradient(135deg, #FFF6F3 0%, #FFFDF9 50%, #FCF7F2 100%)" }}
    >
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .styled-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .styled-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 91, 69, 0.03);
        }
        .styled-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 91, 69, 0.15);
          border-radius: 2px;
        }
      `}</style>

      {/* Ambient blurred cover background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <img 
          src={currentTrack.cover} 
          className="w-full h-full object-cover opacity-5 blur-[90px] scale-150 saturate-150" 
          alt="" 
        />
        <div className="absolute inset-0 bg-orange-500/[0.02]" />
      </div>
      
      {/* ── Top Header ── */}
      <header className="sticky top-0 z-30 bg-white/30 backdrop-blur-md border-b border-[#FFE8E2] px-4 py-3.5 flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/home")}
            className="w-9 h-9 rounded-xl bg-white border border-[#FFE8E2] flex items-center justify-center transition-all text-zinc-700 hover:bg-orange-50 active:scale-95 cursor-pointer shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-extrabold text-sm tracking-wide text-zinc-800">
              伴游FM
            </h1>
            <p className="text-[10px] text-zinc-500">旅途畅听 · 智能人文精讲</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF5B45] animate-pulse"></span>
          <span className="text-[10px] font-bold text-[#FF5B45] bg-[#FFF0ED] px-2.5 py-0.5 rounded border border-[#FFE8E2] font-mono">
            FM TUNER LIVE
          </span>
        </div>
      </header>

      {/* ── Main Layout Wrapper ── */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8 flex flex-col items-center justify-center relative z-10">
        
        <div className="w-full max-w-md bg-white/90 backdrop-blur-2xl rounded-[36px] border border-[#FFE8E2] shadow-[0_24px_50px_rgba(255,91,69,0.06)] overflow-hidden min-h-[620px] flex flex-col justify-between p-6">
          <AnimatePresence mode="wait">

            {/* ═══════════════════════════════════════════════════════
               1. 配置偏好 (Select Interests)
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
                    <h2 className="text-2xl font-black text-[#FF5B45] tracking-wide" style={{ fontFamily: "var(--font-noto-serif)" }}>
                      配置收听偏好
                    </h2>
                    <p className="text-xs text-zinc-500">定制您的 FM 专属故事推荐库</p>
                  </div>

                  {/* Bubble / Orbit arrangements */}
                  <div className="relative h-[300px] flex items-center justify-center">
                    {/* Ring graphics */}
                    <div className="absolute w-[260px] h-[260px] rounded-full border border-dashed border-[#FFE8E2]" />
                    <div className="absolute w-[160px] h-[160px] rounded-full border border-dashed border-orange-100" />

                    {/* Center point logo */}
                    <div className="w-16 h-16 rounded-full bg-orange-50 border border-[#FFE8E2] shadow-inner flex items-center justify-center text-2xl relative z-10">
                      📻
                    </div>

                    {/* Orbit Positions */}
                    {INTEREST_OPTIONS.map((opt, idx) => {
                      const checked = selectedInterests.includes(opt.id);
                      const angle = (idx * 2 * Math.PI) / INTEREST_OPTIONS.length;
                      const radius = idx % 2 === 0 ? 120 : 85; 
                      const x = Math.cos(angle) * radius;
                      const y = Math.sin(angle) * radius;

                      return (
                        <motion.div
                          key={opt.id}
                          onClick={() => toggleInterest(opt.id)}
                          style={{ x, y }}
                          className="absolute w-16 h-16 rounded-full cursor-pointer flex flex-col items-center justify-center transition-all z-20 group"
                        >
                          <div className={`w-12 h-12 rounded-full overflow-hidden border-2 relative transition-all duration-300 group-hover:scale-105 ${
                            checked ? "border-[#FF5B45] shadow-[0_0_12px_rgba(255,91,69,0.25)]" : "border-zinc-200"
                          }`}>
                            <img src={opt.img} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-black/25" />
                            {checked && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF5B45] text-white text-[9px] rounded-full flex items-center justify-center border border-white font-extrabold">
                                ✓
                              </span>
                            )}
                          </div>
                          <span className="text-[9.5px] font-black text-zinc-600 mt-1 block truncate w-full text-center">
                            {opt.label}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (playlist.length === 0) {
                      toast.warning("请至少选择一个收听偏好");
                      return;
                    }
                    setView("player");
                    playTrack(0, true);
                  }}
                  className="w-full py-4 bg-gradient-to-r from-[#FF7A5A] to-[#FF5B45] text-white text-xs font-black rounded-2xl shadow-lg shadow-orange-200/50 hover:brightness-105 transition-all cursor-pointer mt-6"
                >
                  选好了，开始收听
                </motion.button>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════
               2. 播放 (Audio Player - NetEase Cloud Style)
               ═══════════════════════════════════════════════════════ */}
            {view === "player" && (
              <motion.div
                key="player"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={SPRING}
                className="flex flex-col justify-between flex-1 relative"
              >
                {/* Top Segment Controller */}
                <div className="flex items-center justify-between">
                  <div className="bg-orange-50/70 border border-[#FFE8E2] rounded-full p-0.5 flex">
                    <button 
                      onClick={() => setView("player")}
                      className="px-4.5 py-1 text-[10.5px] font-black rounded-full bg-gradient-to-r from-[#FF7A5A] to-[#FF5B45] text-white shadow-sm"
                    >
                      播放
                    </button>
                    <button 
                      onClick={() => setView("lyrics")}
                      className="px-4.5 py-1 text-[10.5px] font-bold rounded-full text-zinc-500 hover:text-zinc-800 transition-colors"
                    >
                      文史词
                    </button>
                  </div>
                  <button 
                    onClick={() => setView("interests")}
                    className="text-[10px] font-black text-[#FF5B45] bg-[#FFF0ED] px-3.5 py-1.5 rounded-full hover:bg-[#FFE0DB] border border-[#FFE0DB] transition-colors cursor-pointer"
                  >
                    配置偏好
                  </button>
                </div>

                {/* NetEase Vinyl Record Core */}
                <div className="relative flex-1 flex flex-col items-center justify-center py-6 min-h-[300px]">
                  
                  {/* SVG Tonearm Needle */}
                  <div className="absolute top-[-10px] left-[calc(50%-20px)] z-40 origin-[30px_30px] pointer-events-none">
                    <motion.svg
                      width="90"
                      height="140"
                      viewBox="0 0 100 150"
                      style={{ originX: "30px", originY: "30px" }}
                      animate={{ rotate: isPlaying ? 3 : -28 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="drop-shadow-[0_8px_15px_rgba(0,0,0,0.15)]"
                    >
                      {/* Metallic needle arm shadow and path */}
                      <path d="M 30 30 L 30 55 L 72 108 L 68 122" fill="none" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
                      <path d="M 30 30 L 30 55 L 72 108 L 68 122" fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
                      {/* Pivot cap */}
                      <circle cx="30" cy="30" r="14" fill="url(#pivotGrad)" stroke="#64748b" strokeWidth="1" />
                      <circle cx="30" cy="30" r="5" fill="#334155" />
                      {/* Cartridge head */}
                      <g transform="rotate(-15, 68, 122)">
                        <rect x="62" y="116" width="12" height="18" rx="2" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
                        <rect x="65" y="128" width="6" height="4" fill="#FF5B45" />
                      </g>
                      <defs>
                        <radialGradient id="pivotGrad" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#e2e8f0" />
                          <stop offset="100%" stopColor="#64748b" />
                        </radialGradient>
                      </defs>
                    </motion.svg>
                  </div>

                  {/* Vinyl Disc Body */}
                  <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-[#0d0d0d] border-[8px] border-[#1c1c1c] shadow-[0_20px_45px_rgba(0,0,0,0.35),inset_0_0_25px_rgba(0,0,0,0.95)] flex items-center justify-center overflow-hidden">
                    {/* Vinyl grooves (concentric ring borders) */}
                    <div className="absolute inset-2 rounded-full border border-white/5 opacity-40 pointer-events-none" />
                    <div className="absolute inset-5 rounded-full border border-black pointer-events-none" />
                    <div className="absolute inset-8 rounded-full border border-white/5 opacity-20 pointer-events-none" />
                    <div className="absolute inset-12 rounded-full border border-black pointer-events-none" />
                    <div className="absolute inset-16 rounded-full border border-white/5 opacity-10 pointer-events-none" />
                    <div className="absolute inset-20 rounded-full border border-black pointer-events-none" />

                    {/* Gloss / Reflection highlights */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent rotate-45 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-white/[0.04] to-transparent rotate-45 pointer-events-none" />

                    {/* Rotating album cover container */}
                    <div 
                      className="w-36 h-36 sm:w-40 sm:h-40 rounded-full overflow-hidden border-[10px] border-black/90 relative shadow-inner"
                      style={{
                        animation: "spin 22s linear infinite",
                        animationPlayState: isPlaying ? "running" : "paused",
                      }}
                    >
                      <img 
                        src={currentTrack.cover} 
                        className="w-full h-full object-cover select-none pointer-events-none" 
                        alt="Cover" 
                      />
                    </div>
                  </div>
                </div>

                {/* Track Title and Social Actions */}
                <div className="flex items-center justify-between px-1.5 mt-3">
                  <div className="text-left max-w-[70%]">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-zinc-800 truncate">
                        {currentTrack.title}
                      </h3>
                      <span className="text-[8px] bg-[#FFF0ED] text-[#FF5B45] font-extrabold px-1 py-0.5 rounded-sm border border-[#FFE8E2] flex-shrink-0">
                        导览 FM
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1 truncate">
                      {currentTrack.artist}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-zinc-500">
                    <button 
                      onClick={() => {
                        setIsLiked(!isLiked);
                        toast(isLiked ? "已取消喜欢" : "已添加到喜欢的精讲列表");
                      }}
                      className="flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all text-zinc-500"
                    >
                      <Heart className={`w-5 h-5 transition-colors ${isLiked ? 'fill-red-500 text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.2)]' : 'hover:text-zinc-800'}`} />
                      <span className="text-[8px] mt-0.5 font-mono">{isLiked ? "1.2w" : "1.1w"}</span>
                    </button>

                    <button 
                      onClick={() => toast.info("收听反馈已收集")}
                      className="flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all hover:text-zinc-800"
                    >
                      <MessageSquare className="w-5 h-5 text-zinc-500" />
                      <span className="text-[8px] mt-0.5 font-mono">99+</span>
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 mt-5">
                  <input 
                    type="range" 
                    min={0} 
                    max={duration} 
                    value={progress}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setProgress(val);
                      if (audioInstance) {
                        audioInstance.currentTime = val;
                      }
                    }}
                    className="w-full accent-[#FF5B45] h-[3px] bg-zinc-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
                    <span>{formatTime(progress)}</span>
                    <span className="bg-orange-50 border border-[#FFE8E2] text-[#FF5B45] px-2 py-0.5 rounded text-[8px] tracking-wider scale-90">
                      超高音质
                    </span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Playback controllers */}
                <div className="flex items-center justify-between px-4 mt-5">
                  <button 
                    onClick={() => toast("随机播放模式开启")}
                    className="text-zinc-400 hover:text-[#FF5B45] transition-colors cursor-pointer active:scale-95"
                  >
                    <Shuffle className="w-4.5 h-4.5" />
                  </button>

                  <button 
                    onClick={() => {
                      const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
                      playTrack(prevIndex, true);
                    }}
                    className="text-zinc-600 hover:text-[#FF5B45] transition-colors cursor-pointer active:scale-95"
                  >
                    <SkipBack className="w-6 h-6" />
                  </button>

                  <button 
                    onClick={handlePlayToggle}
                    className="w-13 h-13 bg-gradient-to-r from-[#FF7A5A] to-[#FF5B45] text-white rounded-full flex items-center justify-center active:scale-95 hover:brightness-110 transition-all shadow-md shadow-orange-300/30"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-white text-white" /> : <Play className="w-5 h-5 ml-1 fill-white text-white" />}
                  </button>

                  <button 
                    onClick={() => {
                      const nextIndex = (currentTrackIndex + 1) % playlist.length;
                      playTrack(nextIndex, true);
                    }}
                    className="text-zinc-600 hover:text-[#FF5B45] transition-colors cursor-pointer active:scale-95"
                  >
                    <SkipForward className="w-6 h-6" />
                  </button>

                  <button 
                    onClick={() => toast.info(`当前播单共 ${playlist.length} 首精讲`)}
                    className="text-zinc-400 hover:text-[#FF5B45] transition-colors cursor-pointer active:scale-95"
                  >
                    <ListMusic className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Bottom utility row */}
                <div className="flex items-center justify-between px-8 mt-5 pt-3 border-t border-zinc-100 text-zinc-400">
                  <button onClick={() => toast.success("正在投屏到周边音箱...")} className="hover:text-[#FF5B45] transition-colors active:scale-95">
                    <Smartphone className="w-4.5 h-4.5" />
                  </button>
                  <button onClick={() => toast.success("离线包下载开始...")} className="hover:text-[#FF5B45] transition-colors active:scale-95">
                    <Download className="w-4.5 h-4.5" />
                  </button>
                  <button onClick={() => toast.info("更多操作选项")} className="hover:text-[#FF5B45] transition-colors active:scale-95">
                    <MoreHorizontal className="w-4.5 h-4.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════
               3. 词 (Lyrics View)
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
                {/* Segment Controls */}
                <div className="flex items-center justify-between">
                  <div className="bg-orange-50/70 border border-[#FFE8E2] rounded-full p-0.5 flex">
                    <button 
                      onClick={() => setView("player")}
                      className="px-4.5 py-1 text-[10.5px] font-bold rounded-full text-zinc-500 hover:text-zinc-800 transition-colors"
                    >
                      播放
                    </button>
                    <button 
                      onClick={() => setView("lyrics")}
                      className="px-4.5 py-1 text-[10.5px] font-black rounded-full bg-gradient-to-r from-[#FF7A5A] to-[#FF5B45] text-white shadow-sm"
                    >
                      文史词
                    </button>
                  </div>
                  <button 
                    onClick={() => setView("interests")}
                    className="text-[10px] font-black text-[#FF5B45] bg-[#FFF0ED] px-3.5 py-1.5 rounded-full hover:bg-[#FFE0DB] border border-[#FFE0DB] transition-colors cursor-pointer"
                  >
                    配置偏好
                  </button>
                </div>

                {/* Scrollable lyrics container */}
                <div className="flex-1 my-5 space-y-4 max-h-[340px] overflow-y-auto pr-1.5 styled-scrollbar">
                  <div className="text-center space-y-1 pb-2">
                    <h3 className="text-base font-bold text-zinc-800">{currentTrack.title}</h3>
                    <p className="text-[10px] text-zinc-500">— AI 导览精讲材料 —</p>
                  </div>

                  <div className="text-xs leading-relaxed text-zinc-700 space-y-4 tracking-wide font-medium bg-[#FFFDF9]/60 p-4.5 rounded-2xl border border-[#FFE8E2]">
                    <p className="text-[#FF5B45] font-extrabold text-[12.5px] leading-relaxed text-center">
                      “听小玉导览讲解，带您漫步在蜀地的大街小巷...”
                    </p>
                    <p className="indent-6 text-justify">
                      {currentTrack.text}
                    </p>
                  </div>
                </div>

                {/* Bottom Mini Player */}
                <div className="bg-orange-50/50 border border-[#FFE8E2] rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <button 
                      onClick={handlePlayToggle}
                      className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#FF7A5A] to-[#FF5B45] text-white flex items-center justify-center active:scale-95 cursor-pointer hover:brightness-105"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white text-white" /> : <Play className="w-3.5 h-3.5 ml-0.5 fill-white text-white" />}
                    </button>
                    <div className="text-left max-w-[160px]">
                      <span className="text-[10.5px] font-black text-zinc-800 block truncate">{currentTrack.title}</span>
                      <span className="text-[8.5px] text-zinc-500">正在播放小玉配音</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#FF5B45] font-extrabold">{formatTime(progress)} / {formatTime(duration)}</span>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>
    </div>
  );
}
