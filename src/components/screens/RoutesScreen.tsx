"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, ArrowRight, Loader2, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { request } from "@/lib/api/request";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 35 };

const INTERESTS = [
  { id: "history", label: "人文史学", emoji: "📖" },
  { id: "nature", label: "山水自然", emoji: "🏔️" },
  { id: "family", label: "亲子游览", emoji: "👨‍👩‍👧" },
  { id: "cultural", label: "东方人文", emoji: "🏛️" },
];

interface GeneratedRoute {
  name: string; description: string; highlights: string[];
  tips: string; spots: Array<{ id: number; name: string; duration: number; description: string }>;
  totalDuration: number; totalDistance: string;
}

export function RoutesScreen() {
  const [selected, setSelected] = useState<string[]>(["history"]);
  const [duration, setDuration] = useState(120);
  const [generating, setGenerating] = useState(false);
  const [route, setRoute] = useState<GeneratedRoute | null>(null);

  const toggle = (id: string) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const generate = async () => {
    setGenerating(true);
    setRoute(null);
    try {
      const res = await request("/api/routes/generate", {
        method: "POST",
        body: JSON.stringify({ interests: selected, duration }),
      });
      const data = await res.json();
      setRoute(data.route);
    } catch {
      setRoute(null);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-svh garden-bg">
      {/* PC: two-column. Mobile: single column */}
      <div className="md:flex md:h-svh md:overflow-hidden">

        {/* Left column: generator + header */}
        <div className="md:w-80 md:flex-shrink-0 md:overflow-y-auto md:border-r"
          style={{ borderColor: "#E6E2D8" }}>
        <div className="px-4 pt-4 pb-6 space-y-5 max-w-2xl mx-auto md:max-w-none md:mx-0">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
          className="pb-3" style={{ borderBottom: "1px solid #E6E2D8" }}>
          <h2 className="font-bold text-base flex items-center gap-1.5" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
            <Compass className="w-[18px] h-[18px]" style={{ color: "#D2A053" }} />
            智能探幽路线生成器
          </h2>
          <p className="text-xs mt-1" style={{ color: "#8F9F8F" }}>融合兴趣偏好与体力情况，定制化计算最佳路线。</p>
        </motion.div>

        {/* Interest tags */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.1 }} className="space-y-2">
          <p className="text-[11px] font-bold" style={{ color: "#3A4D39" }}>1. 选择您感兴趣的游玩偏好</p>
          <div className="grid grid-cols-4 gap-2">
            {INTERESTS.map((item) => {
              const active = selected.includes(item.id);
              return (
                <motion.button key={item.id} whileTap={{ scale: 0.92 }} onClick={() => toggle(item.id)}
                  className="py-2.5 px-1 text-center rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: active ? "#3A4D39" : "white",
                    color: active ? "white" : "#3A4D39",
                    border: active ? "1px solid #3A4D39" : "1px solid #E6E2D8",
                    boxShadow: active ? "0 2px 8px rgba(58,77,57,0.2)" : "none",
                  }}>
                  <span className="block text-base mb-0.5">{item.emoji}</span>
                  <span className="text-[10px]">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Duration slider */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.15 }}
          className="card-ink p-4 space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-xs font-bold" style={{ color: "#1E2522" }}>2. 预备游玩时长</p>
            <span className="text-sm font-bold font-mono" style={{ color: "#D2A053" }}>{duration} 分钟</span>
          </div>
          <div className="relative">
            <div className="w-full rounded-full h-2" style={{ background: "#F0EDE5", border: "1px solid #E6E2D8" }}>
              <div className="h-full rounded-full" style={{ width: `${((duration - 60) / 180) * 100}%`, background: "linear-gradient(90deg,#D2A053,#B8843A)" }} />
            </div>
            <input type="range" min={60} max={240} step={30} value={duration} onChange={(e) => setDuration(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-2" />
          </div>
          <div className="flex justify-between text-[10px]" style={{ color: "#8F9F8F" }}>
            <span>小试牛刀（1h）</span><span>深度漫游（4h）</span>
          </div>
        </motion.div>

        {/* Generate button */}
        <motion.button whileTap={{ scale: 0.97 }} onClick={generate} disabled={generating}
          className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm text-white"
          style={{ background: generating ? "#8F9F8F" : "linear-gradient(135deg,#4F6F52,#3A5240)", fontFamily: "var(--font-noto-serif)" }}>
          {generating ? <><Loader2 className="w-4 h-4 animate-spin" />正在规划路线...</> : <><Compass className="w-4 h-4" />生成专属路线</>}
        </motion.button>

        {/* Generated route */}
        <AnimatePresence>
          {route && (
            <motion.div key="route-result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={SPRING}
              className="card-ink p-4 space-y-4">
              <div className="flex justify-between items-center pb-2" style={{ borderBottom: "1px solid #E6E2D8" }}>
                <span className="text-[10px] px-2.5 py-1 rounded font-mono font-bold" style={{ background: "#F5F0E8", border: "1px solid #E6E2D8", color: "#4F6F52" }}>
                  AI专属路线 · {route.name}
                </span>
                <div className="flex items-center gap-1 text-[11px] font-mono" style={{ color: "#8F9F8F" }}>
                  <MapPin className="w-3 h-3" />{route.totalDistance}
                </div>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "#3A4D39" }}>{route.description}</p>
              {/* Timeline */}
              <div className="space-y-4 relative">
                <div className="absolute left-[11px] top-4 bottom-4 w-0.5" style={{ background: "#E6E2D8" }} />
                {route.spots.map((spot, i) => (
                  <motion.div key={spot.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ ...SPRING, delay: i * 0.06 }}
                    className="flex items-start gap-3 relative">
                    <span className="w-6 h-6 rounded-full text-white text-[11px] flex items-center justify-center font-bold z-10 flex-shrink-0"
                      style={{ background: i === 0 ? "#3A4D39" : i === route.spots.length - 1 ? "#8F9F8F" : "#D2A053" }}>
                      {i === 0 ? "起" : i === route.spots.length - 1 ? "终" : i + 1}
                    </span>
                    <div>
                      <h5 className="font-bold text-[13px]" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
                        {spot.name}
                        {i === 1 && <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded font-sans" style={{ background: "#F5F0E8", border: "1px solid #E6E2D8", color: "#4F6F52" }}>重点景点</span>}
                      </h5>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" style={{ color: "#8F9F8F" }} />
                        <span className="text-[10px]" style={{ color: "#8F9F8F" }}>建议停留 {spot.duration} 分钟</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {/* Tips */}
              {route.tips && (
                <div className="rounded-lg px-3 py-2 text-[11px]" style={{ background: "rgba(210,160,83,0.08)", border: "1px solid rgba(210,160,83,0.2)", color: "#3A4D39" }}>
                  💡 {route.tips}
                </div>
              )}
              <Link href={`/routes/${route.spots[0]?.id ?? 1}`}>
                <motion.div whileTap={{ scale: 0.97 }}
                  className="w-full py-3 rounded-xl flex items-center justify-center gap-1.5 text-[13px] font-semibold text-white mt-2"
                  style={{ background: "linear-gradient(135deg,#4F6F52,#3A5240)", fontFamily: "var(--font-noto-serif)" }}>
                  锁定此路线 · 展开详情
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile: preset routes (below generator) */}
        {!route && !generating && (
          <div className="md:hidden">
            <PresetRoutes />
          </div>
        )}
        </div>{/* end inner px div */}
        </div>{/* end left column */}

        {/* Right column: preset routes (PC only) */}
        <div className="hidden md:flex flex-1 flex-col overflow-hidden">
          <div className="px-5 py-4 flex-shrink-0" style={{ borderBottom: "1px solid #E6E2D8" }}>
            <h3 className="font-bold text-sm" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
              精选主题路线
            </h3>
            <p className="text-[11px] mt-0.5" style={{ color: "#8F9F8F" }}>
              专业策划，覆盖景区核心体验
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <PresetRoutes />
          </div>
        </div>

      </div>{/* end PC wrapper */}
    </div>
  );
}

function PresetRoutes() {
  const presets = [
    { id: 1, name: "历史文化精华游", duration: "150分钟", distance: "约3.5千米", tag: "history", img: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=70" },
    { id: 2, name: "自然生态漫步游", duration: "120分钟", distance: "约2.8千米", tag: "nature", img: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=70" },
    { id: 3, name: "亲子欢乐全景游", duration: "180分钟", distance: "约4千米", tag: "family", img: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=400&q=70" },
    { id: 4, name: "人文韵味深度游", duration: "100分钟", distance: "约3千米", tag: "cultural", img: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&q=70" },
  ];
  const tagColors: Record<string, string> = { history: "#3A4D39", nature: "#4F6F52", family: "#D2A053", cultural: "#8F9F8F" };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-3">
      <p className="text-xs font-semibold" style={{ color: "#1E2522", fontFamily: "var(--font-noto-serif)" }}>精选路线</p>
      {presets.map((r, i) => (
        <Link key={r.id} href={`/routes/${r.id}`}>
          <motion.div whileTap={{ scale: 0.97 }} whileHover={{ y: -2 }}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: i * 0.06 }}
            className="card-ink flex items-center gap-3 p-3 cursor-pointer mb-3">
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.img} alt={r.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded-full text-white" style={{ background: tagColors[r.tag] }}>
                  {INTERESTS.find((x) => x.id === r.tag)?.label}
                </span>
              </div>
              <h4 className="font-semibold text-[13px] truncate" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>{r.name}</h4>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px]" style={{ color: "#8F9F8F" }}><Clock className="w-3 h-3 inline mr-0.5" />{r.duration}</span>
                <span className="text-[10px]" style={{ color: "#8F9F8F" }}><MapPin className="w-3 h-3 inline mr-0.5" />{r.distance}</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: "#8F9F8F" }} />
          </motion.div>
        </Link>
      ))}
    </motion.div>
  );
}
