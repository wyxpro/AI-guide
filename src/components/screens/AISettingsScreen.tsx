"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEazo } from "@eazo/sdk/react";
import { request } from "@/lib/api/request";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 35 };

const MODES = [
  { id: "normal", emoji: "🍃", title: "标准文旅体验", desc: "常规字号，详实正统的解说风格" },
  { id: "elder", emoji: "🌸", title: "适老陪伴模式", desc: "大字、缓和语速、平缓路线优先", titleSize: "text-[16px]" },
  { id: "child", emoji: "🍬", title: "童趣探秘包", desc: "卡通插画，短篇童话解说" },
];

export function AISettingsScreen() {
  const [selected, setSelected] = useState("normal");
  const router = useRouter();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = useEazo((s: any) => s.auth.user);

  useEffect(() => {
    const local = localStorage.getItem("accessibility_mode") || "normal";
    setSelected(local);
    if (user) {
      request("/api/user/preferences")
        .then(r => r.json())
        .then(p => {
          if (p && p.accessibilityMode) {
            setSelected(p.accessibilityMode);
            localStorage.setItem("accessibility_mode", p.accessibilityMode);
            document.documentElement.setAttribute("data-accessibility-mode", p.accessibilityMode);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const save = async () => {
    localStorage.setItem("accessibility_mode", selected);
    document.documentElement.setAttribute("data-accessibility-mode", selected);
    window.dispatchEvent(new Event("accessibility-mode-change"));
    
    if (user) {
      try {
        await request("/api/user/preferences", {
          method: "PUT",
          body: JSON.stringify({ accessibilityMode: selected })
        });
      } catch (err) {
        console.error(err);
      }
    }
    
    toast.success("设置已保存，已为您更新导览模式...");
    setTimeout(() => router.back(), 800);
  };

  return (
    <div className="flex flex-col min-h-svh garden-bg">
      {/* Drag handle */}
      <div className="w-12 h-1.5 rounded-full mx-auto mt-3 mb-5" style={{ background: "#E6E2D8" }} />

      {/* Header */}
      <div className="px-5 pb-4 flex justify-between items-center" style={{ borderBottom: "1px solid #E6E2D8" }}>
        <h2 className="text-lg font-black" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
          智能陪伴偏好设定
        </h2>
        <motion.button whileTap={{ scale: 0.88 }} onClick={() => router.back()}
          className="p-1.5 rounded-full" style={{ background: "#E6E2D8", color: "#3A4D39" }}>
          <X className="w-[18px] h-[18px]" />
        </motion.button>
      </div>

      {/* Body */}
      <div className="flex-1 px-5 py-6 space-y-4 overflow-y-auto max-w-2xl mx-auto w-full">
        <p className="text-xs leading-relaxed" style={{ color: "#8F9F8F" }}>
          数字人会根据不同的人群切换语速、字体大小及故事风格，选择最适合您的体验模式。
        </p>

        <div className="space-y-3">
          {MODES.map((mode) => {
            const active = selected === mode.id;
            return (
              <motion.label key={mode.id} whileTap={{ scale: 0.98 }}
                className="flex justify-between items-center p-4 rounded-xl cursor-pointer transition-all"
                style={{
                  border: active ? "2px solid #D2A053" : "1px solid #E6E2D8",
                  background: "white",
                  opacity: active ? 1 : 0.82,
                  boxShadow: active ? "0 2px 12px rgba(210,160,83,0.15)" : "0 1px 4px rgba(0,0,0,0.04)",
                }}
                onClick={() => setSelected(mode.id)}>
                <div>
                  <span className={`block font-bold ${mode.titleSize ?? "text-[14px]"}`}
                    style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
                    {mode.emoji} {mode.title}
                  </span>
                  <span className="text-[10px] mt-1 block" style={{ color: "#8F9F8F" }}>{mode.desc}</span>
                </div>
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ border: active ? "2px solid #D2A053" : "2px solid #E6E2D8" }}>
                  {active && <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#D2A053" }} />}
                </div>
              </motion.label>
            );
          })}
        </div>

        {/* Accessibility preview */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="card-ink p-4 space-y-2">
          <p className="text-[11px] font-semibold" style={{ color: "#3A4D39" }}>当前模式预览</p>
          <div className="p-3 rounded-lg" style={{ background: "#F5F0E8" }}>
            <p style={{
              color: "#1E2522",
              fontSize: selected === "elder" ? 18 : 14,
              lineHeight: 1.6,
              fontFamily: "var(--font-noto-serif)",
            }}>
              {selected === "child"
                ? "🌟 小朋友，前面有一个神奇的大池子，里面住着很多可爱的小鱼鱼哦！"
                : selected === "elder"
                ? "揽月亭位于景区制高点，登亭可俯瞰全景。请走平缓的青石步道，大约需要步行15分钟。"
                : "揽月亭始建于明代嘉靖年间，取名源于古诗中揽月入怀之意，是景区的标志性历史建筑。"}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-4 md:pb-6"
        style={{ borderTop: "1px solid #E6E2D8", background: "white" }}>
        <motion.button whileTap={{ scale: 0.97 }} onClick={save}
          className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg,#4F6F52,#3A5240)", fontFamily: "var(--font-noto-serif)" }}>
          <Check className="w-[18px] h-[18px]" strokeWidth={2.5} />
          应用设置并重启向导
        </motion.button>
      </div>
    </div>
  );
}
