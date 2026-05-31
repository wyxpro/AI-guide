"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { request } from "@/lib/api/request";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 35 };

const STYLES = [
  { id: "default", label: "古典汉服", desc: "典雅东方，文旅专属" },
  { id: "modern", label: "现代职业", desc: "专业气质，国际范儿" },
  { id: "ancient", label: "宋代仕女", desc: "历史韵味，穿越时空" },
  { id: "cartoon", label: "卡通童趣", desc: "活泼可爱，亲子首选" },
];

const VOICES = [
  { id: "warm", label: "温暖知心", desc: "柔和亲切，如好友相伴" },
  { id: "professional", label: "专业解说", desc: "沉稳有力，知识权威" },
  { id: "lively", label: "活力少女", desc: "明快灵动，充满活力" },
];

interface AvatarConfig { id: number; name: string; avatarStyle: string; voiceStyle: string; speechRate: number; pitch: number; greeting: string; isDefault: boolean }

export function AdminAvatarScreen() {
  const [configs, setConfigs] = useState<AvatarConfig[]>([]);
  const [selected, setSelected] = useState<AvatarConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewText, setPreviewText] = useState("您好，欢迎来到翠玉景区！我是您的专属AI导览官，很高兴为您服务。");

  useEffect(() => {
    request("/api/admin/avatar").then((r) => r.json()).then((d) => {
      const list = Array.isArray(d) ? d : [];
      setConfigs(list);
      setSelected(list.find((c: AvatarConfig) => c.isDefault) ?? list[0] ?? null);
    });
  }, []);

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    await request("/api/admin/avatar", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(selected) });
    toast.success("配置已保存");
    setSaving(false);
  };

  if (!selected) return (
    <div className="min-h-svh flex items-center justify-center" style={{ background: "#FAF8F5" }}>
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#4F6F52" }} />
    </div>
  );

  return (
    <div className="min-h-svh" style={{ background: "#FAF8F5" }}>
      <div className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid #E6E2D8" }}>
        <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>数字人配置</h1>
        <p className="text-xs mt-1" style={{ color: "#8F9F8F" }}>自定义AI导览官的外观与声音</p>
      </div>

      <div className="p-6 space-y-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: config panels */}
          <div className="space-y-5">
            {/* Style selection */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={SPRING} className="card-ink p-5">
              <h3 className="text-sm font-semibold mb-3" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>外观风格</h3>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map((s) => {
                  const active = selected.avatarStyle === s.id;
                  return (
                    <motion.div key={s.id} whileTap={{ scale: 0.96 }}
                      onClick={() => setSelected({ ...selected, avatarStyle: s.id })}
                      className="p-3 rounded-xl cursor-pointer transition-all"
                      style={{ border: active ? "2px solid #4F6F52" : "1px solid #E6E2D8", background: active ? "rgba(79,111,82,0.06)" : "white" }}>
                      <p className="text-[13px] font-semibold" style={{ color: "#1E2522" }}>{s.label}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "#8F9F8F" }}>{s.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Voice selection */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.1 }} className="card-ink p-5">
              <h3 className="text-sm font-semibold mb-3" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>音色风格</h3>
              <div className="space-y-2">
                {VOICES.map((v) => {
                  const active = selected.voiceStyle === v.id;
                  return (
                    <motion.div key={v.id} whileTap={{ scale: 0.98 }}
                      onClick={() => setSelected({ ...selected, voiceStyle: v.id })}
                      className="flex items-center gap-3 p-3 rounded-xl cursor-pointer"
                      style={{ border: active ? "2px solid #D2A053" : "1px solid #E6E2D8", background: active ? "rgba(210,160,83,0.06)" : "white" }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ border: active ? "2px solid #D2A053" : "2px solid #E6E2D8" }}>
                        {active && <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#D2A053" }} />}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium" style={{ color: "#1E2522" }}>{v.label}</p>
                        <p className="text-[10px]" style={{ color: "#8F9F8F" }}>{v.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Speed & pitch sliders */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.15 }} className="card-ink p-5 space-y-4">
              <h3 className="text-sm font-semibold" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>语速与音调</h3>
              {[{ key: "speechRate" as const, label: "语速", min: 50, max: 200 }, { key: "pitch" as const, label: "音调", min: 50, max: 200 }].map((p) => (
                <div key={p.key} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs" style={{ color: "#3A4D39" }}>{p.label}</span>
                    <span className="text-xs font-mono font-bold" style={{ color: "#D2A053" }}>{selected[p.key]}%</span>
                  </div>
                  <div className="relative">
                    <div className="w-full h-2 rounded-full" style={{ background: "#F0EDE5" }}>
                      <div className="h-full rounded-full" style={{ width: `${((selected[p.key] - p.min) / (p.max - p.min)) * 100}%`, background: "linear-gradient(90deg,#D2A053,#B8843A)" }} />
                    </div>
                    <input type="range" min={p.min} max={p.max} step={5} value={selected[p.key]}
                      onChange={(e) => setSelected({ ...selected, [p.key]: Number(e.target.value) })}
                      className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer" />
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: preview */}
          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.2 }}
              className="card-ink p-5 space-y-4">
              <h3 className="text-sm font-semibold" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>实时预览</h3>
              {/* Avatar preview */}
              <div className="flex justify-center">
                <div className="relative flex items-end justify-center overflow-hidden"
                  style={{ width: 140, height: 140, borderRadius: "70px 70px 16px 16px", border: "3px solid #D2A053", background: "linear-gradient(to bottom, #2B3530, #121815)" }}>
                  <div className="absolute top-4 w-20 h-20 rounded-full" style={{ background: "radial-gradient(circle,rgba(210,160,83,0.3) 0%,transparent 70%)" }} />
                  <div className="relative z-10 pb-1">
                    <svg width="80" height="96" viewBox="0 0 100 120" fill="none">
                      <circle cx="50" cy="12" r="5" fill="#D2A053" />
                      <path d="M50,15C38,15 32,25 32,38C32,45 36,52 40,55L42,50C38,40 44,28 50,28C56,28 62,40 58,50L60,55C64,52 68,45 68,38C68,25 62,15 50,15Z" fill="#1C211F" />
                      <path d="M40,52C40,52 46,65 50,65C54,65 60,52 60,52C60,52 61,58 50,62C39,58 40,52 40,52Z" fill="#F8E5D5" />
                      <path d="M28,120L72,120C72,120 72,75 58,70L50,82L42,70C28,75 28,120 28,120Z" fill="#3A4D39" />
                      <path d="M42,70L50,82L58,70" stroke="#D2A053" strokeWidth="2.5" />
                    </svg>
                  </div>
                  {/* Style badge */}
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] px-1.5 py-0.5 rounded-full text-white whitespace-nowrap"
                    style={{ background: "rgba(210,160,83,0.8)" }}>
                    {STYLES.find((s) => s.id === selected.avatarStyle)?.label}
                  </div>
                </div>
              </div>

              {/* Greeting preview */}
              <div>
                <p className="text-[11px] font-medium mb-2" style={{ color: "#3A4D39" }}>问候语预览</p>
                <textarea value={selected.greeting ?? ""} onChange={(e) => setSelected({ ...selected, greeting: e.target.value })}
                  rows={3} className="w-full px-3 py-2.5 text-sm rounded-lg outline-none resize-none"
                  style={{ background: "#F5F0E8", border: "1px solid #E6E2D8", color: "#1E2522" }} />
              </div>

              {/* Voice indicator */}
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ background: "rgba(79,111,82,0.08)" }}>
                <div className="flex gap-0.5 items-end">
                  {[3, 6, 4, 8, 5, 7, 3].map((h, i) => (
                    <motion.div key={i} animate={{ height: [h, h * 1.5, h] }} transition={{ duration: 0.8, delay: i * 0.1, repeat: Infinity }}
                      className="w-1 rounded-full" style={{ background: "#4F6F52", height: h * (selected.speechRate / 100) }} />
                  ))}
                </div>
                <span className="text-[11px]" style={{ color: "#4F6F52" }}>
                  {VOICES.find((v) => v.id === selected.voiceStyle)?.label} · {selected.speechRate}% 语速
                </span>
              </div>
            </motion.div>

            <motion.button whileTap={{ scale: 0.97 }} onClick={save} disabled={saving}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
              style={{ background: saving ? "#8F9F8F" : "linear-gradient(135deg,#4F6F52,#3A5240)", fontFamily: "var(--font-noto-serif)" }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {saving ? "保存中..." : "保存配置"}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
