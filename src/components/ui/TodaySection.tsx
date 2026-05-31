"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Clock, ChevronRight, MapPin, Thermometer } from "lucide-react";
import Link from "next/link";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 35 };

interface TodayCard {
  id: string;
  type: "spot" | "route" | "tip" | "event";
  emoji: string;
  title: string;
  subtitle: string;
  href: string;
  badge?: string;
  badgeColor?: string;
}

function getTimeContext(): { greeting: string; period: "morning" | "afternoon" | "evening"; tip: string } {
  const h = new Date().getHours();
  if (h < 6)  return { greeting: "早安", period: "morning",   tip: "清晨是拍摄晨雾景色的最佳时机" };
  if (h < 11) return { greeting: "上午好", period: "morning", tip: "上午光线柔和，最适合游览历史文化区" };
  if (h < 14) return { greeting: "午间好", period: "afternoon", tip: "午间避开人流，可先用餐再游览" };
  if (h < 17) return { greeting: "下午好", period: "afternoon", tip: "下午适合漫步自然景观区" };
  if (h < 20) return { greeting: "傍晚好", period: "evening",   tip: "日落时分，揽月亭的夕照最为壮观" };
  return { greeting: "晚上好", period: "evening", tip: "夜游景区别有一番意境" };
}

const SEASONAL_CARDS: TodayCard[] = [
  {
    id: "hot1", type: "spot", emoji: "🏯", badge: "今日热门",
    badgeColor: "#DC2626",
    title: "揽月亭", subtitle: "当前等待时间约15分钟，建议提前出发",
    href: "/spots/1",
  },
  {
    id: "route1", type: "route", emoji: "🗺️", badge: "推荐路线",
    badgeColor: "#4F6F52",
    title: "翠玉精华2小时游", subtitle: "覆盖5个核心景点，适合当日游客",
    href: "/routes/1",
  },
  {
    id: "tip1", type: "tip", emoji: "☀️", badge: "贴士",
    badgeColor: "#D2A053",
    title: "今日天气适宜游览", subtitle: "建议携带防晒与雨伞，备足饮水",
    href: "/spots",
  },
  {
    id: "spot2", type: "spot", emoji: "🌿", badge: "人少推荐",
    badgeColor: "#8F7A5A",
    title: "碧波苑", subtitle: "此时段人流较少，是安静游览的好时机",
    href: "/spots/3",
  },
];

export function TodaySection() {
  const ctx = getTimeContext();
  const [cards] = useState<TodayCard[]>(SEASONAL_CARDS);
  const [activeIdx, setActiveIdx] = useState(0);

  // Auto-rotate cards
  useEffect(() => {
    const t = setInterval(() => setActiveIdx((i) => (i + 1) % cards.length), 4000);
    return () => clearInterval(t);
  }, [cards.length]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay: 0.1 }}
      className="mx-4 mb-1">

      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-3.5 h-3.5" style={{ color: "#D2A053" }} />
        <span className="text-[11px] font-semibold tracking-wider uppercase"
          style={{ color: "#8F9F8F", fontFamily: "var(--font-noto-sans)" }}>
          {ctx.greeting} · 今日推荐
        </span>
      </div>

      {/* Featured card (tall) */}
      <AnimatePresence mode="wait">
        {cards[0] && (
          <Link href={cards[activeIdx].href}>
            <motion.div key={cards[activeIdx].id}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} transition={SPRING}
              whileTap={{ scale: 0.97 }}
              className="rounded-2xl p-4 mb-3 flex items-center gap-4"
              style={{ background: "white", border: "1px solid #E6E2D8", boxShadow: "0 2px 16px rgba(79,111,82,0.08)" }}>
              <div className="text-4xl flex-shrink-0">{cards[activeIdx].emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {cards[activeIdx].badge && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ background: cards[activeIdx].badgeColor }}>
                      {cards[activeIdx].badge}
                    </span>
                  )}
                </div>
                <p className="text-[14px] font-bold truncate" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
                  {cards[activeIdx].title}
                </p>
                <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: "#8F9F8F" }}>
                  {cards[activeIdx].subtitle}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "#E6E2D8" }} />
            </motion.div>
          </Link>
        )}
      </AnimatePresence>

      {/* Pagination dots */}
      <div className="flex items-center justify-center gap-1.5 mb-3">
        {cards.map((_, i) => (
          <motion.button key={i} onClick={() => setActiveIdx(i)}
            animate={{ width: i === activeIdx ? 16 : 6, opacity: i === activeIdx ? 1 : 0.4 }}
            className="h-1.5 rounded-full"
            style={{ background: "#4F6F52", minWidth: 6 }} />
        ))}
      </div>

      {/* Time-based tip banner */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{ background: "rgba(79,111,82,0.07)", border: "1px solid rgba(79,111,82,0.12)" }}>
        <Clock className="w-3 h-3 flex-shrink-0" style={{ color: "#4F6F52" }} />
        <p className="text-[11px]" style={{ color: "#4F6F52" }}>{ctx.tip}</p>
      </div>
    </motion.div>
  );
}
