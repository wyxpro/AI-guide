"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MessageSquare, Trash2, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { request } from "@/lib/api/request";
import { toast } from "sonner";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 35 };

interface SessionMsg { role: string; content: string; timestamp?: string }
interface Session { id: number; title: string; updatedAt: string; createdAt: string; messages: SessionMsg[] }

export function HistoryScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Session | null>(null);

  useEffect(() => {
    request("/api/qa/sessions").then((r) => r.json())
      .then((d) => { setSessions(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const deleteSession = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await request(`/api/qa/sessions/${id}`, { method: "DELETE" });
    setSessions((prev) => prev.filter((s) => s.id !== id));
    toast.success("已删除对话记录");
  };

  const preview = (msgs: SessionMsg[]) =>
    msgs.filter((m) => m.role === "user").slice(-1)[0]?.content ?? "（空对话）";

  return (
    <div className="min-h-svh" style={{ background: "#FAF8F5" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 pb-3"
        style={{ background: "rgba(250,248,245,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid #E6E2D8", paddingTop: "calc(env(safe-area-inset-top, 44px) + 8px)" }}>
        <Link href="/profile">
          <motion.button whileTap={{ scale: 0.88 }}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "#F0EDE5" }}>
            <ArrowLeft className="w-4 h-4" style={{ color: "#3A4D39" }} />
          </motion.button>
        </Link>
        <h2 className="text-base font-semibold flex-1" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
          历史问答记录
        </h2>
        <span className="text-[11px] px-2 py-1 rounded-full" style={{ background: "rgba(79,111,82,0.1)", color: "#4F6F52" }}>
          {sessions.length} 条
        </span>
      </div>

      <div className="px-4 py-4 space-y-2 max-w-2xl mx-auto">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)
        ) : sessions.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
            className="text-center py-20">
            <p className="text-5xl mb-4">💬</p>
            <p className="text-base font-medium" style={{ color: "#3A4D39", fontFamily: "var(--font-noto-serif)" }}>
              还没有问答记录
            </p>
            <p className="text-sm mt-1 mb-6" style={{ color: "#8F9F8F" }}>
              向导览官小玉提问，对话会自动保存在这里
            </p>
            <Link href="/qa">
              <motion.div whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-medium"
                style={{ background: "linear-gradient(135deg, #4F6F52, #3A5240)" }}>
                <MessageSquare className="w-4 h-4" /> 开始对话
              </motion.div>
            </Link>
          </motion.div>
        ) : sessions.map((s, i) => (
          <motion.div key={s.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: i * 0.04 }}
            onClick={() => setSelected(s)}
            className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer"
            style={{ background: "white", border: "1px solid #E6E2D8" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #4F6F52, #3A5240)" }}>
              <span className="text-white text-sm font-bold" style={{ fontFamily: "var(--font-noto-serif)" }}>玉</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold truncate" style={{ color: "#1E2522", fontFamily: "var(--font-noto-serif)" }}>
                {s.title}
              </p>
              <p className="text-[11px] mt-0.5 truncate" style={{ color: "#8F9F8F" }}>{preview(s.messages || [])}</p>
              <p className="text-[9px] mt-1 font-mono" style={{ color: "#B8B4AC" }}>
                {new Date(s.updatedAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                {" · "}{(s.messages || []).length} 条消息
              </p>
            </div>
            <div className="flex items-center gap-1">
              <motion.button whileTap={{ scale: 0.85 }} onClick={(e) => deleteSession(s.id, e)}
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(220,38,38,0.06)" }}>
                <Trash2 className="w-3.5 h-3.5" style={{ color: "#DC262650" }} />
              </motion.button>
              <ChevronRight className="w-4 h-4" style={{ color: "#E6E2D8" }} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Session detail sheet */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex flex-col justify-end"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring" as const, stiffness: 300, damping: 35 }}
              className="rounded-t-2xl flex flex-col max-h-[80vh]"
              style={{ background: "#FAF8F5" }}>
              <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: "#E6E2D8" }}>
                <h3 className="font-semibold" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
                  {selected.title}
                </h3>
                <motion.button whileTap={{ scale: 0.88 }} onClick={() => setSelected(null)}>
                  <X className="w-5 h-5" style={{ color: "#8F9F8F" }} />
                </motion.button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {(selected.messages || []).map((m, idx) => (
                  <div key={idx} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: m.role === "assistant" ? "linear-gradient(135deg,#4F6F52,#3A5240)" : "rgba(79,111,82,0.12)",
                        color: m.role === "assistant" ? "white" : "#4F6F52",
                        fontFamily: "var(--font-noto-serif)",
                      }}>
                      {m.role === "assistant" ? "玉" : "游"}
                    </div>
                    <div className="max-w-[80%] px-3 py-2 text-[12px] leading-relaxed"
                      style={{
                        background: m.role === "assistant" ? "white" : "linear-gradient(135deg,#4F6F52,#3A5240)",
                        color: m.role === "assistant" ? "#1E2522" : "white",
                        border: m.role === "assistant" ? "1px solid #E6E2D8" : "none",
                        borderRadius: m.role === "assistant" ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
                      }}>
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-4 border-t" style={{ borderColor: "#E6E2D8" }}>
                <Link href="/qa">
                  <motion.div whileTap={{ scale: 0.96 }}
                    className="w-full py-3 rounded-xl text-center text-sm font-semibold text-white"
                    style={{ background: "linear-gradient(135deg, #4F6F52, #3A5240)" }}>
                    继续这个话题
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
