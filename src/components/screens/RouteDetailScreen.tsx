"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Clock, Camera, ChevronRight } from "lucide-react";
import Link from "next/link";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 35 };

interface Spot { id: number; name: string; duration: number; description: string; imageUrl: string; distance: string; rating: number; tags: string[] }
interface RouteDetail { id: number; name: string; description: string; highlights: string[]; totalDistance: string; duration: number; spots: Spot[] }

export function RouteDetailScreen({ routeId }: { routeId: string }) {
  const [route, setRoute] = useState<RouteDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/routes/${routeId}`)
      .then((r) => r.json())
      .then((data) => { setRoute(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [routeId]);

  if (loading) return <RouteDetailSkeleton />;
  if (!route) return (
    <div className="min-h-svh garden-bg flex items-center justify-center">
      <div className="text-center space-y-2">
        <p style={{ color: "#8F9F8F" }}>路线暂时无法加载</p>
        <Link href="/routes"><span className="text-sm" style={{ color: "#4F6F52" }}>返回路线列表</span></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-svh garden-bg">
      {/* Header */}
      <div className="flex items-center px-3 pb-3 sticky top-0 z-10"
        style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #E6E2D8", paddingTop: "calc(env(safe-area-inset-top, 44px) + 4px)" }}>
        <Link href="/routes">
          <motion.button whileTap={{ scale: 0.9 }} className="p-2 -ml-2 rounded-lg" style={{ color: "#3A4D39" }}>
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
        </Link>
        <h2 className="ml-2 font-bold text-[15px]" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
          {route.name}
        </h2>
      </div>

      {/* ── 精美路线地图 ── */}
      <div className="relative overflow-hidden" style={{ height: 260, background: "linear-gradient(135deg, #E8E4DA, #DDD8CC)" }}>
        {/* 地形纹理背景 */}
        <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="spotGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#D2A053" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#D2A053" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* 地形曲线 */}
          <path d="M0,180 Q80,140 160,160 T320,140 T400,150" fill="none" stroke="#4F6F52" strokeWidth="0.6" opacity="0.4" />
          <path d="M0,200 Q100,170 200,190 T400,175" fill="none" stroke="#4F6F52" strokeWidth="0.5" opacity="0.3" />
          <path d="M0,220 Q120,200 240,215 T400,200" fill="none" stroke="#8F9F8F" strokeWidth="0.4" opacity="0.3" />
          {/* 水域 */}
          <ellipse cx="300" cy="180" rx="60" ry="28" fill="rgba(79,111,82,0.12)" stroke="rgba(79,111,82,0.25)" strokeWidth="0.8" />
          <text x="300" y="184" textAnchor="middle" fontSize="8" fill="rgba(79,111,82,0.6)">翠玉湖</text>
        </svg>

        {/* 动画路径 + 景点 Pin */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
          {route.spots.length > 1 && (() => {
            const pts = route.spots.map((_, i) => ({
              x: 40 + (i * 320) / Math.max(route.spots.length - 1, 1),
              y: [130, 90, 155, 80, 145, 100][i % 6],
            }));
            const pathD = pts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `Q ${(pts[i-1].x + p.x)/2} ${pts[i-1].y} ${p.x} ${p.y}`)).join(" ");
            return (
              <>
                {/* 虚线底层 */}
                <path d={pathD} fill="none" stroke="rgba(210,160,83,0.3)" strokeWidth="3" strokeDasharray="8 5" />
                {/* 动画实线 */}
                <motion.path d={pathD} fill="none" stroke="#D2A053" strokeWidth="2.5" strokeLinecap="round"
                  strokeDasharray="600" strokeDashoffset={600}
                  animate={{ strokeDashoffset: 0 }} transition={{ duration: 2.2, ease: "easeInOut", delay: 0.3 }} />
                {/* Pin dots */}
                {pts.map((p, i) => (
                  <g key={i}>
                    <motion.circle cx={p.x} cy={p.y} r="14" fill="url(#spotGlow)"
                      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 + i * 0.3, type: "spring", stiffness: 300, damping: 20 }} />
                    <motion.circle cx={p.x} cy={p.y} r={i === 0 || i === pts.length - 1 ? 8 : 6}
                      fill={i === 0 ? "#4F6F52" : i === pts.length - 1 ? "#DC2626" : "#D2A053"}
                      stroke="white" strokeWidth="2"
                      initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5 + i * 0.3, type: "spring", stiffness: 400, damping: 20 }} />
                    <motion.text x={p.x} y={p.y - 14} textAnchor="middle" fontSize="9" fontWeight="600"
                      fill="#1E2522" fontFamily="Noto Serif SC, serif"
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + i * 0.3 }}>
                      {route.spots[i].name.slice(0, 3)}
                    </motion.text>
                  </g>
                ))}
              </>
            );
          })()}
        </svg>

        {/* 图例 */}
        <div className="absolute bottom-3 left-3 flex items-center gap-3 px-3 py-1.5 rounded-xl"
          style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.6)" }}>
          {[{ color: "#4F6F52", label: "起点" }, { color: "#D2A053", label: "途经" }, { color: "#DC2626", label: "终点" }].map((item) => (
            <div key={item.label} className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
              <span className="text-[9px] font-medium" style={{ color: "#3A4D39" }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* 路线信息浮层 */}
        <div className="absolute top-3 right-3 px-3 py-2 rounded-xl"
          style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.7)" }}>
          <p className="text-[10px] font-bold" style={{ color: "#1E2522", fontFamily: "var(--font-noto-serif)" }}>
            {route.spots.length} 处景点
          </p>
          <p className="text-[9px]" style={{ color: "#8F9F8F" }}>{route.totalDistance}</p>
        </div>
      </div>

      {/* Route overview */}
      <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
          className="card-ink p-4 space-y-2">
          <p className="text-sm leading-relaxed" style={{ color: "#3A4D39" }}>{route.description}</p>
          <div className="flex items-center gap-4 pt-1">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" style={{ color: "#D2A053" }} />
              <span className="text-xs" style={{ color: "#8F9F8F" }}>{route.duration} 分钟</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" style={{ color: "#4F6F52" }} />
              <span className="text-xs" style={{ color: "#8F9F8F" }}>{route.totalDistance}</span>
            </div>
          </div>
          {((route.highlights as string[]) || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {((route.highlights as string[]) || []).map((h: string) => (
                <span key={h} className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(79,111,82,0.1)", color: "#4F6F52" }}>{h}</span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Steps */}
        <div className="space-y-3">
          {(route.spots || []).map((spot, i) => (
            <motion.div key={spot.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ ...SPRING, delay: i * 0.07 }}
              className="card-ink p-4 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-6 h-full opacity-10"
                style={{ background: i === 1 ? "#4F6F52" : "transparent" }} />
              <div className="flex justify-between items-start mb-2">
                <div>
                  {i === 1 && <p className="text-[10px] font-bold uppercase tracking-widest font-mono" style={{ color: "#D2A053" }}>重点景点</p>}
                  <h3 className="font-bold text-base mt-0.5" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>{spot.name}</h3>
                </div>
                <div className="w-8 h-8 rounded-lg text-white text-sm font-bold flex items-center justify-center flex-shrink-0"
                  style={{ background: i === 0 ? "#3A4D39" : i === route.spots.length - 1 ? "#8F9F8F" : "#D2A053" }}>
                  {i === 0 ? "起" : i === route.spots.length - 1 ? "终" : i + 1}
                </div>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "#8F9F8F" }}>{spot.description}</p>
              <div className="flex items-center gap-1 mt-2">
                <Clock className="w-3 h-3" style={{ color: "#8F9F8F" }} />
                <span className="text-[10px]" style={{ color: "#8F9F8F" }}>建议停留 {spot.duration} 分钟</span>
              </div>
              {i === 1 && (
                <Link href="/qa">
                  <motion.div whileTap={{ scale: 0.97 }}
                    className="mt-3 w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-[13px] font-semibold text-white"
                    style={{ background: "linear-gradient(135deg,#4F6F52,#3A5240)" }}>
                    <Camera className="w-4 h-4" /> 向导览官提问此景点
                  </motion.div>
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}

function RouteDetailSkeleton() {
  return (
    <div className="min-h-svh garden-bg">
      <div className="h-14 border-b" style={{ borderColor: "#E6E2D8", background: "white" }} />
      <div style={{ height: 240 }} className="skeleton" />
      <div className="px-4 py-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-ink p-4">
            <div className="skeleton h-4 w-2/3 mb-2" />
            <div className="skeleton h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
