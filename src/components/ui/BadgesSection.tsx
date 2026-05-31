"use client";
import { motion } from "framer-motion";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 35 };

export const BADGES = [
  { id: "first_step", icon: "👣", name: "初探翠玉", desc: "首次游览景点", threshold: 1, type: "spot" },
  { id: "explorer", icon: "🧭", name: "探路者", desc: "游览 3 处景点", threshold: 3, type: "spot" },
  { id: "connoisseur", icon: "🏮", name: "翠玉行家", desc: "游览 5 处景点", threshold: 5, type: "spot" },
  { id: "master", icon: "🏆", name: "景区达人", desc: "游览全部 6 处景点", threshold: 6, type: "spot" },
  { id: "curious", icon: "💬", name: "好奇心旺盛", desc: "提出 5 个问题", threshold: 5, type: "qa" },
  { id: "scholar", icon: "📚", name: "文化学者", desc: "提出 20 个问题", threshold: 20, type: "qa" },
];

interface Props {
  uniqueSpots: number;
  totalQA: number;
}

export function BadgesSection({ uniqueSpots, totalQA }: Props) {
  const unlocked = BADGES.filter((b) => {
    if (b.type === "spot") return uniqueSpots >= b.threshold;
    if (b.type === "qa") return totalQA >= b.threshold;
    return false;
  });
  const locked = BADGES.filter((b) => !unlocked.includes(b));

  if (uniqueSpots === 0 && totalQA === 0) return null;

  return (
    <div className="card-ink p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
          游览勋章
        </h3>
        <span className="text-[11px] px-2 py-0.5 rounded-full"
          style={{ background: "rgba(210,160,83,0.12)", color: "#D2A053" }}>
          {unlocked.length}/{BADGES.length} 已解锁
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {BADGES.map((b, i) => {
          const isUnlocked = unlocked.includes(b);
          return (
            <motion.div key={b.id}
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ ...SPRING, delay: i * 0.06 }}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl text-center"
              style={{
                background: isUnlocked ? "rgba(210,160,83,0.08)" : "rgba(230,226,216,0.4)",
                border: `1px solid ${isUnlocked ? "rgba(210,160,83,0.3)" : "#E6E2D8"}`,
                opacity: isUnlocked ? 1 : 0.55,
              }}>
              <span className="text-2xl" style={{ filter: isUnlocked ? "none" : "grayscale(1)" }}>
                {b.icon}
              </span>
              <p className="text-[10px] font-semibold leading-tight" style={{ color: isUnlocked ? "#B8843A" : "#8F9F8F" }}>
                {b.name}
              </p>
              <p className="text-[9px] leading-tight" style={{ color: "#8F9F8F" }}>{b.desc}</p>
              {isUnlocked && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...SPRING, delay: 0.3 }}
                  className="text-[9px] px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(210,160,83,0.2)", color: "#D2A053" }}>
                  已获得
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
