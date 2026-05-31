"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Map, Compass, Star, Clock, ChevronRight, Home, Navigation, User, Sparkles, Search } from "lucide-react";
import Link from "next/link";
import { useEazo } from "@eazo/sdk/react";
import { request } from "@/lib/api/request";
import { UserBadge } from "@/components/user-profile/user-badge";

const SPRING = { type: "spring" as const, stiffness: 300, damping: 32 };
interface Spot { id: number; name: string; imageUrl: string; rating: number; duration: number }


// ─── 移动端功能卡（横向小卡片）───────────────────────
const FUNC_CARDS = [
  { href: "/qa",     icon: MessageCircle, label: "智能问答", accent: "#D2A053",
    bg: "linear-gradient(135deg,#2B3A2B,#1A2420)", glow: "rgba(210,160,83,0.3)" },
  { href: "/spots",  icon: Compass,       label: "景点导览", accent: "#8FBF8A",
    bg: "linear-gradient(135deg,#1E2E1E,#162016)", glow: "rgba(143,191,138,0.3)" },
  { href: "/routes", icon: Map,           label: "路线规划", accent: "#E8C96A",
    bg: "linear-gradient(135deg,#2E2510,#1C1608)", glow: "rgba(232,201,106,0.3)" },
];

/* ═══════════════════════════════════════════════════════
   根组件
═══════════════════════════════════════════════════════ */
export default function HomeScreen() {
  return (
    <>
      {/* ── 移动端 ── */}
      <div className="md:hidden min-h-svh flex flex-col w-full max-w-full overflow-x-hidden" style={{ background: "#F2EFE8" }}>
        <MobileView />
      </div>
      {/* ── PC 端 ── */}
      <div className="hidden md:flex h-screen overflow-hidden" style={{ background: "#FAF8F5" }}>
        <PCView />
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   移动端整体视图
═══════════════════════════════════════════════════════ */
function MobileView() {
  return (
    <>
      <MobileHero />
      <MobileFuncCards />
      <MobileToday />
      <MobileSpots />
      <MobileRouteBanner />
      {/* 底部导航占位 */}
      <div style={{ height: 80 }} />
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   Hero — 紧凑版（头像+名字+问候泡，控制在25vh以内）
═══════════════════════════════════════════════════════ */
function MobileHero() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = useEazo((s: any) => s.auth.user) as { name?: string | null; username?: string | null } | null;
  const [greeting, setGreeting] = useState("欢迎来到旅行吧，随时可向我提问");
  const name = user?.name || user?.username || "游客";

  useEffect(() => {
    if (!user) return;
    request("/api/user/greeting")
      .then(r => r.json())
      .then(d => d.greeting && setGreeting(d.greeting))
      .catch(() => {});
  }, [user]);

  return (
    <div
      className="relative flex-shrink-0 overflow-hidden"
      style={{
        background: "linear-gradient(165deg,#1E2C28 0%,#121815 55%,#0D1510 100%)",
        paddingTop: "env(safe-area-inset-top, 44px)",
      }}
    >
      {/* 背景光晕 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute rounded-full"
          style={{ width: 220, height: 220, top: -80, left: "50%", transform: "translateX(-50%)",
            background: "radial-gradient(circle,rgba(210,160,83,0.13) 0%,transparent 65%)" }} />
      </div>

      {/* 顶部栏：logo + 用户徽章 */}
      <div className="relative flex items-center justify-between px-4 pt-2 pb-1">
        <div>
          <p className="text-[10px] tracking-widest font-medium"
            style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-noto-sans)" }}>
            TRAVEL BAR
          </p>
          <p className="text-[15px] font-bold leading-tight"
            style={{ fontFamily: "var(--font-noto-serif)", color: "white" }}>旅行吧</p>
        </div>
        <UserBadge />
      </div>

      {/* 头像 + 问候区（横向排列，节省纵向空间）*/}
      <div className="relative flex items-center gap-3 px-4 py-3">
        {/* 头像 */}
        <div className="relative flex-shrink-0">
          <motion.div
            animate={{ boxShadow: ["0 0 0 0 rgba(210,160,83,0.4)", "0 0 0 8px rgba(210,160,83,0)", "0 0 0 0 rgba(210,160,83,0.4)"] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-xl font-black"
            style={{
              background: "linear-gradient(135deg,#4F6F52,#D2A053)",
              fontFamily: "var(--font-noto-serif)",
              color: "white",
            }}>玉</motion.div>
          <div className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-[1.5px]"
            style={{ background: "#34C759", borderColor: "#121815" }} />
        </div>

        {/* 问候文字 */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-white truncate"
            style={{ fontFamily: "var(--font-noto-serif)" }}>
            {name}，你好
          </p>
          <p className="text-[11px] mt-0.5 line-clamp-2 leading-snug"
            style={{ color: "rgba(255,255,255,0.55)" }}>{greeting}</p>
        </div>
      </div>

      {/* 快捷 CTA 按钮（扁平横向，省空间）*/}
      <div className="relative px-4 pb-4">
        <Link href="/qa">
          <motion.div whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl text-[13px] font-semibold"
            style={{
              background: "linear-gradient(90deg,#D2A053,#B8843A)",
              color: "white",
              boxShadow: "0 3px 14px rgba(210,160,83,0.4)",
            }}>
            <MessageCircle className="w-4 h-4" />
            开始导览对话
          </motion.div>
        </Link>
        {/* 搜索入口 */}
        <Link href="/search">
          <motion.div whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 mt-2 px-4 py-2 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" }}>
            <Search className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.5)" }} />
            <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.45)" }}>搜索景点、路线、知识…</span>
          </motion.div>
        </Link>
      </div>

      {/* 底部圆弧过渡 */}
      <div className="relative h-4 overflow-hidden">
        <svg viewBox="0 0 400 16" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full">
          <path d="M0 16 Q200 0 400 16 L400 16 L0 16 Z" fill="#F2EFE8" />
        </svg>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   功能卡：横向 3 列，高度紧凑
═══════════════════════════════════════════════════════ */
function MobileFuncCards() {
  return (
    <div className="px-4 pt-3 pb-1">
      <div className="grid grid-cols-3 gap-2.5">
        {FUNC_CARDS.map((card, i) => (
          <Link key={card.href} href={card.href} className="w-full block">
            <motion.div
              whileTap={{ scale: 0.93 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: i * 0.06 }}
              className="rounded-2xl overflow-hidden relative"
              style={{
                background: card.bg,
                boxShadow: `0 4px 14px ${card.glow}`,
                padding: "12px 8px 10px",
              }}>
              {/* 光泽膜 */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(145deg,rgba(255,255,255,0.09) 0%,transparent 55%)", borderRadius: "inherit" }} />
              <div className="flex flex-col items-center gap-1.5 relative z-10">
                {/* 图标圆 */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${card.accent}20`, border: `1px solid ${card.accent}40` }}>
                  <card.icon className="w-[18px] h-[18px]" style={{ color: card.accent }} />
                </div>
                {/* 文字 */}
                <p className="text-[11px] font-bold text-white leading-tight text-center"
                  style={{ fontFamily: "var(--font-noto-serif)" }}>
                  {card.label}
                </p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Today 推荐（单张精简卡片 + 时段贴士）
═══════════════════════════════════════════════════════ */
function getTimePeriod(): { greeting: string; tip: string } {
  const h = new Date().getHours();
  if (h < 6)  return { greeting: "清晨好",  tip: "清晨是拍摄晨雾景色的最佳时机" };
  if (h < 11) return { greeting: "上午好",  tip: "上午光线柔和，最适合游览历史文化区" };
  if (h < 14) return { greeting: "午间好",  tip: "午间避开人流，可先用餐再游览" };
  if (h < 17) return { greeting: "下午好",  tip: "下午适合漫步自然景观区" };
  if (h < 20) return { greeting: "傍晚好",  tip: "日落时分，揽月亭的夕照最为壮观" };
  return      { greeting: "晚上好",  tip: "夜游景区别有一番意境" };
}

const TODAY_CARDS = [
  { id: "t1", emoji: "🏯", badge: "今日热门", badgeColor: "#DC2626",
    title: "揽月亭", sub: "当前等待约15分钟，建议提前出发", href: "/spots/1" },
  { id: "t2", emoji: "🗺️", badge: "推荐路线", badgeColor: "#4F6F52",
    title: "旅行吧精华2小时游", sub: "覆盖5个核心景点，适合当日游客", href: "/routes/1" },
];

function MobileToday() {
  const { greeting, tip } = getTimePeriod();
  const [idx, setIdx] = useState(0);
  const card = TODAY_CARDS[idx];

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % TODAY_CARDS.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="px-4 pt-3 pb-1">
      {/* 标题行 */}
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className="w-3 h-3" style={{ color: "#D2A053" }} />
        <span className="text-[11px] font-semibold tracking-wide"
          style={{ color: "#8F9F8F" }}>{greeting} · 今日推荐</span>
        {/* 分页点 */}
        <div className="flex gap-1 ml-auto">
          {TODAY_CARDS.map((_, i) => (
            <motion.div key={i} animate={{ width: i === idx ? 14 : 5 }} onClick={() => setIdx(i)}
              className="h-1.5 rounded-full cursor-pointer"
              style={{ background: i === idx ? "#4F6F52" : "#E6E2D8" }} />
          ))}
        </div>
      </div>

      {/* 推荐卡 */}
      <Link href={card.href}>
        <motion.div key={card.id} whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
          className="flex items-center gap-3 px-3.5 py-3 rounded-2xl"
          style={{ background: "white", border: "1px solid #E6E2D8", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <div className="text-3xl leading-none flex-shrink-0">{card.emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                style={{ background: card.badgeColor }}>{card.badge}</span>
            </div>
            <p className="text-[13px] font-bold truncate"
              style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>{card.title}</p>
            <p className="text-[11px] mt-0.5 truncate" style={{ color: "#8F9F8F" }}>{card.sub}</p>
          </div>
          <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "#E6E2D8" }} />
        </motion.div>
      </Link>

      {/* 时段贴士 */}
      <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl"
        style={{ background: "rgba(79,111,82,0.07)", border: "1px solid rgba(79,111,82,0.12)" }}>
        <span className="text-[11px]" style={{ color: "#4F6F52" }}>⏰ {tip}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   热门景点横滑
═══════════════════════════════════════════════════════ */
function MobileSpots() {
  const [spots, setSpots] = useState<Spot[]>([]);
  useEffect(() => {
    fetch("/api/spots?limit=6")
      .then(r => r.json())
      .then(d => setSpots(Array.isArray(d) ? d.slice(0, 6) : []))
      .catch(() => {});
  }, []);

  return (
    <div className="pt-3">
      <div className="flex items-center justify-between px-4 mb-2">
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5" fill="#D2A053" style={{ color: "#D2A053" }} />
          <span className="text-[12px] font-semibold"
            style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>热门景点</span>
        </div>
        <Link href="/spots">
          <span className="text-[11px] flex items-center gap-0.5" style={{ color: "#4F6F52" }}>
            全部 <ChevronRight className="w-3 h-3" />
          </span>
        </Link>
      </div>
      <div className="flex gap-3 pl-4 pr-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {spots.length === 0
          ? [1, 2, 3].map(i => (
              <div key={i} className="skeleton rounded-2xl flex-shrink-0"
                style={{ width: 130, height: 160 }} />
            ))
          : spots.map((spot, i) => (
              <Link key={spot.id} href={`/spots/${spot.id}`} className="flex-shrink-0 block" style={{ width: 130 }}>
                <motion.div whileTap={{ scale: 0.94 }}
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ ...SPRING, delay: i * 0.05 }}
                  className="w-full h-full rounded-2xl overflow-hidden"
                  style={{ background: "white", border: "1px solid #E6E2D8",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <div className="relative" style={{ height: 100 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={spot.imageUrl || "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=300&q=70"}
                      alt={spot.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0"
                      style={{ background: "linear-gradient(to top,rgba(0,0,0,0.38) 0%,transparent 55%)" }} />
                    <div className="absolute bottom-1.5 right-2 flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5" fill="#D2A053" style={{ color: "#D2A053" }} />
                      <span className="text-[10px] text-white font-semibold">
                        {(spot.rating / 10).toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="px-2.5 py-2">
                    <p className="font-semibold text-[12px] truncate"
                      style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
                      {spot.name}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5" style={{ color: "#8F9F8F" }} />
                      <span className="text-[10px]" style={{ color: "#8F9F8F" }}>{spot.duration}分钟</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   路线横幅
═══════════════════════════════════════════════════════ */
function MobileRouteBanner() {
  return (
    <div className="px-4 pt-3">
      <Link href="/routes">
        <motion.div whileTap={{ scale: 0.97 }}
          className="rounded-2xl overflow-hidden relative"
          style={{ background: "linear-gradient(135deg,#1E2C28,#0E1710)", height: 80 }}>
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 80" preserveAspectRatio="xMidYMid slice">
            <path d="M20 55 Q100 18 200 45 T380 28" fill="none" stroke="#D2A053" strokeWidth="2" strokeDasharray="8 5"/>
            {[20,110,200,290,380].map((x, i) => (
              <circle key={i} cx={x} cy={[55,22,45,30,32][i]} r="4.5" fill="#D2A053" opacity="0.8"/>
            ))}
          </svg>
          <div className="relative z-10 flex items-center justify-between h-full px-4">
            <div>
              <p className="text-[13px] font-bold text-white"
                style={{ fontFamily: "var(--font-noto-serif)" }}>AI 智能路线规划</p>
              <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                告诉小玉兴趣，定制专属游览方案
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-full text-[11px] font-semibold flex-shrink-0"
              style={{ background: "rgba(210,160,83,0.22)", color: "#E8C96A",
                border: "1px solid rgba(210,160,83,0.35)" }}>
              立即规划
            </div>
          </div>
        </motion.div>
      </Link>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PC 视图
═══════════════════════════════════════════════════════ */
function PCView() {
  const [spots, setSpots] = useState<Spot[]>([]);

  useEffect(() => {
    fetch("/api/spots?limit=6").then(r => r.json())
      .then(d => setSpots(Array.isArray(d) ? d.slice(0, 6) : [])).catch(() => {});
  }, []);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
      {/* 功能卡 */}
      <div className="grid grid-cols-3 gap-3">
        {FUNC_CARDS.map((card, i) => (
          <Link key={card.href} href={card.href}>
            <motion.div whileTap={{ scale: 0.96 }} whileHover={{ y: -3 }}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: i * 0.07 }}
              className="rounded-2xl p-5 flex flex-col items-center gap-2 relative overflow-hidden"
              style={{ background: card.bg, boxShadow: `0 6px 20px ${card.glow}` }}>
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(145deg,rgba(255,255,255,0.1) 0%,transparent 55%)" }} />
              <div className="w-10 h-10 rounded-xl flex items-center justify-center relative z-10"
                style={{ background: `${card.accent}22`, border: `1px solid ${card.accent}44` }}>
                <card.icon className="w-5 h-5" style={{ color: card.accent }} />
              </div>
              <p className="text-[13px] font-bold text-white relative z-10"
                style={{ fontFamily: "var(--font-noto-serif)" }}>{card.label}</p>
            </motion.div>
          </Link>
        ))}
      </div>
      {/* 热门景点 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Star className="w-3.5 h-3.5" fill="#D2A053" style={{ color: "#D2A053" }} />
            <span className="text-[13px] font-semibold"
              style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>热门景点</span>
          </div>
          <Link href="/spots">
            <span className="text-[11px] flex items-center gap-0.5" style={{ color: "#4F6F52" }}>
              全部 <ChevronRight className="w-3 h-3" />
            </span>
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {spots.map((spot, i) => (
            <Link key={spot.id} href={`/spots/${spot.id}`}>
              <motion.div whileTap={{ scale: 0.95 }} whileHover={{ y: -3 }}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING, delay: i * 0.05 }}
                className="rounded-2xl overflow-hidden"
                style={{ background: "white", border: "1px solid #E6E2D8", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <div className="relative" style={{ height: 100 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={spot.imageUrl || "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=300&q=70"}
                    alt={spot.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0"
                    style={{ background: "linear-gradient(to top,rgba(0,0,0,0.35) 0%,transparent 55%)" }} />
                  <div className="absolute bottom-1.5 right-2 flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5" fill="#D2A053" style={{ color: "#D2A053" }} />
                    <span className="text-[9px] text-white font-semibold">{(spot.rating/10).toFixed(1)}</span>
                  </div>
                </div>
                <div className="px-2.5 py-2">
                  <p className="font-semibold text-[11px] truncate"
                    style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>{spot.name}</p>
                  <p className="text-[9px] mt-0.5" style={{ color: "#8F9F8F" }}>{spot.duration}分钟</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
      {/* 路线横幅 */}
      <MobileRouteBanner />
    </div>
  );
}

// Named re-exports kept for backward compatibility
export { HomeScreen as HomeHero };
export function HomeNavCards() { return null; }
export function HomeSpotRoll() { return null; }
export function HomeMapTease() { return null; }
