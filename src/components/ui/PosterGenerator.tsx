"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, Image as ImageIcon } from "lucide-react";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 35 };

interface PosterData {
  userName: string;
  userAvatar?: string;
  spotsVisited: number;
  favoriteSpot: string;
  date: string;
  badge: string;
}

interface PosterGeneratorProps {
  data: PosterData;
  onClose: () => void;
}

const POSTER_THEMES = [
  { id: "gold",   label: "暖金风", bg: "#1A1008", accent: "#D2A053", dark: "#0E0800" },
  { id: "ink",    label: "水墨风", bg: "#FAF8F5", accent: "#4F6F52", dark: "#1E2C28" },
  { id: "night",  label: "夜景风", bg: "#0D1A16", accent: "#9ECFB0", dark: "#060D0B" },
];

export function PosterGenerator({ data, onClose }: PosterGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theme, setTheme] = useState(POSTER_THEMES[0]);
  const [generated, setGenerated] = useState(false);
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = 600, H = 900;
    canvas.width = W; canvas.height = H;

    // Background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, W, H);

    // Top dark band
    const grad = ctx.createLinearGradient(0, 0, 0, 340);
    grad.addColorStop(0, theme.dark);
    grad.addColorStop(1, theme.bg);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, 340);

    // Decorative circles (aura)
    ctx.beginPath();
    ctx.arc(W / 2, 180, 100, 0, Math.PI * 2);
    ctx.fillStyle = theme.accent + "22";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(W / 2, 180, 70, 0, Math.PI * 2);
    ctx.fillStyle = theme.accent + "33";
    ctx.fill();

    const userNickname = data.userName || "游客小玉";

    // Complete rest of canvas after avatar
    const drawRestOfCanvas = () => {
      // Title (User Nickname)
      ctx.font = "bold 34px serif";
      ctx.fillStyle = theme.id === "ink" ? "#1E2522" : "#FFFFFF";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(`${userNickname} · 游览打卡`, W / 2, 290);

      ctx.font = "bold 18px sans-serif";
      ctx.fillStyle = theme.id === "ink" ? "#4F6F52" : theme.accent + "EE";
      ctx.fillText("旅行家Pro 智慧导览专属报告", W / 2, 325);

      // Divider
      ctx.strokeStyle = theme.accent + "55";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath(); ctx.moveTo(60, 365); ctx.lineTo(W - 60, 365); ctx.stroke();
      ctx.setLineDash([]);

      // Stats block
      const textColor = theme.id === "ink" ? "#1E2522" : "#FFFFFF";
      const mutedColor = theme.id === "ink" ? "#8F9F8F" : "rgba(255,255,255,0.65)";

      const stats = [
        { label: "打卡景点", value: data.spotsVisited.toString(), unit: "处" },
        { label: "最爱地标", value: data.favoriteSpot || "故宫太和殿", unit: "" },
        { label: "打卡日期", value: data.date || "2026.08", unit: "" },
      ];

      stats.forEach((s, i) => {
        const x = 100 + i * 165;
        const y = 430;
        ctx.font = "bold 26px serif";
        ctx.fillStyle = theme.accent;
        ctx.textAlign = "center";
        ctx.fillText(s.value + s.unit, x, y);
        ctx.font = "14px sans-serif";
        ctx.fillStyle = mutedColor;
        ctx.fillText(s.label, x, y + 30);
      });

      // Badge Frame
      ctx.beginPath();
      const bx = W / 2 - 110, by = 530, bw = 220, bh = 60;
      ctx.roundRect(bx, by, bw, bh, 30);
      ctx.fillStyle = theme.accent + "22";
      ctx.fill();
      ctx.strokeStyle = theme.accent + "88";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.font = "bold 18px sans-serif";
      ctx.fillStyle = theme.accent;
      ctx.textAlign = "center";
      ctx.fillText(data.badge || "Lv.5 问鼎江山", W / 2, by + 37);

      // User name area
      ctx.font = "bold 22px serif";
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.fillText(`"${userNickname}" 的专属足迹海报`, W / 2, 650);

      // Bottom ornament
      ctx.font = "14px sans-serif";
      ctx.fillStyle = mutedColor;
      ctx.fillText("扫码加入导览 · 旅行家Pro 官方智导出品", W / 2, 780);

      // Decorative dots
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(W / 2 - 40 + i * 20, 820, 3, 0, Math.PI * 2);
        ctx.fillStyle = theme.accent + "55";
        ctx.fill();
      }

      const url = canvas.toDataURL("image/png");
      setImgUrl(url);
      setGenerated(true);
    };

    if (data.userAvatar) {
      const avatarImg = new Image();
      avatarImg.crossOrigin = "anonymous";
      avatarImg.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(W / 2, 180, 48, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarImg, W / 2 - 48, 180 - 48, 96, 96);
        ctx.restore();

        // Draw ring border
        ctx.beginPath();
        ctx.arc(W / 2, 180, 48, 0, Math.PI * 2);
        ctx.strokeStyle = theme.accent;
        ctx.lineWidth = 3;
        ctx.stroke();

        drawRestOfCanvas();
      };
      avatarImg.onerror = () => {
        ctx.beginPath();
        ctx.arc(W / 2, 180, 48, 0, Math.PI * 2);
        ctx.fillStyle = theme.accent;
        ctx.fill();
        ctx.font = "bold 38px serif";
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(userNickname.slice(0, 1) || "旅", W / 2, 183);

        drawRestOfCanvas();
      };
      avatarImg.src = data.userAvatar;
    } else {
      ctx.beginPath();
      ctx.arc(W / 2, 180, 48, 0, Math.PI * 2);
      ctx.fillStyle = theme.accent;
      ctx.fill();
      ctx.font = "bold 38px serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(userNickname.slice(0, 1) || "旅", W / 2, 183);

      drawRestOfCanvas();
    }
  };

  useEffect(() => { draw(); }, [theme]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDownload = () => {
    if (!imgUrl) return;
    const a = document.createElement("a"); a.href = imgUrl; a.download = "翠玉游览打卡.png"; a.click();
  };

  const handleShare = async () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "翠玉打卡.png", { type: "image/png" });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "我在翠玉景区打卡了！", text: `游览了${data.spotsVisited}处景点，快来体验AI导览吧！` });
      } else {
        handleDownload();
      }
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring" as const, stiffness: 300, damping: 35 }}
        className="rounded-t-2xl overflow-hidden"
        style={{ background: "#FAF8F5", maxHeight: "88vh", overflowY: "auto" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h3 className="font-bold text-base" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
              生成游览打卡海报
            </h3>
            <p className="text-[11px] mt-0.5" style={{ color: "#8F9F8F" }}>选择风格，保存或分享</p>
          </div>
          <motion.button whileTap={{ scale: 0.88 }} onClick={onClose}>
            <X className="w-5 h-5" style={{ color: "#8F9F8F" }} />
          </motion.button>
        </div>

        {/* Theme selector */}
        <div className="flex gap-2 px-5 mb-4">
          {POSTER_THEMES.map((t) => (
            <motion.button key={t.id} whileTap={{ scale: 0.93 }} onClick={() => setTheme(t)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold"
              style={{
                background: t.id === theme.id ? t.accent + "15" : "white",
                border: `1.5px solid ${t.id === theme.id ? t.accent : "#E6E2D8"}`,
                color: t.id === theme.id ? t.accent : "#8F9F8F",
              }}>
              <div className="w-3 h-3 rounded-full" style={{ background: t.accent }} />
              {t.label}
            </motion.button>
          ))}
        </div>

        {/* Preview */}
        <div className="px-5 mb-4">
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #E6E2D8", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }}>
            <canvas ref={canvasRef} className="w-full" style={{ display: "block", aspectRatio: "2/3" }} />
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-5 pb-[calc(env(safe-area-inset-bottom,20px)+80px)] flex gap-3">
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold"
            style={{ background: "white", border: "1.5px solid #E6E2D8", color: "#3A4D39" }}>
            <Download className="w-4 h-4" />保存图片
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#4F6F52,#3A5240)", boxShadow: "0 4px 16px rgba(79,111,82,0.35)" }}>
            <Share2 className="w-4 h-4" />分享给朋友
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
