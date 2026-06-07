"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Loader2, Sparkles, Upload } from "lucide-react";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 35 };

interface RecognizeResult {
  subject: string;
  story: string;
  tip: string;
}

interface CameraRecognizeProps {
  currentSpot?: string;
  onClose: () => void;
  onRecognized?: (subject: string, story: string) => void;
}

export function CameraRecognize({ currentSpot, onClose, onRecognized }: CameraRecognizeProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecognizeResult | null>(null);

  const handleFile = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
    setResult(null);
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      if (currentSpot) form.append("spot", currentSpot);
      const res = await fetch("/api/spots/recognize", { method: "POST", body: form });
      const data = await res.json();
      setResult(data);
      // Notify parent so result can be injected into conversation
      if (onRecognized && data.subject && data.story) {
        onRecognized(data.subject, data.story);
      }
    } catch {
      setResult({ subject: "识别失败", story: "请检查网络后重试", tip: "确保图片清晰且光线充足" });
    } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring" as const, stiffness: 300, damping: 35 }}
        className="rounded-t-2xl overflow-hidden"
        style={{ background: "#FAF8F5", maxHeight: "85vh", overflowY: "auto" }}>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "#E6E2D8" }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5" style={{ color: "#4F6F52" }} />
            <h3 className="font-bold text-base" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
              拍照识景
            </h3>
          </div>
          <motion.button whileTap={{ scale: 0.88 }} onClick={onClose}>
            <X className="w-5 h-5" style={{ color: "#8F9F8F" }} />
          </motion.button>
        </div>

        <div className="px-5 pb-[calc(env(safe-area-inset-bottom,20px)+90px)] space-y-4">
          {/* Upload zone */}
          <motion.div whileTap={{ scale: 0.98 }}
            onClick={() => fileRef.current?.click()}
            className="rounded-2xl overflow-hidden cursor-pointer flex items-center justify-center"
            style={{
              height: 220,
              background: preview ? "transparent" : "#F0EDE5",
              border: `2px dashed ${preview ? "transparent" : "#D2A053"}`,
              position: "relative",
            }}>
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(210,160,83,0.12)", border: "1px solid rgba(210,160,83,0.3)" }}>
                  <Camera className="w-7 h-7" style={{ color: "#D2A053" }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold" style={{ color: "#3A4D39" }}>拍照或上传图片</p>
                  <p className="text-[11px] mt-1" style={{ color: "#8F9F8F" }}>小玉将识别景物并为您讲解</p>
                </div>
              </div>
            )}
          </motion.div>

          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

          {/* Buttons */}
          <div className="flex gap-3">
            {preview && (
              <motion.button whileTap={{ scale: 0.94 }}
                onClick={() => { setPreview(null); setFile(null); setResult(null); }}
                className="px-4 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: "white", border: "1px solid #E6E2D8", color: "#8F9F8F" }}>
                重拍
              </motion.button>
            )}
            <motion.button whileTap={{ scale: 0.94 }}
              onClick={preview ? analyze : () => fileRef.current?.click()}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white"
              style={{
                background: preview ? "linear-gradient(135deg,#4F6F52,#3A5240)" : "linear-gradient(135deg,#D2A053,#B8843A)",
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 4px 14px rgba(79,111,82,0.3)",
              }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : preview ? <Sparkles className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
              {loading ? "小玉正在识别…" : preview ? "开始识别" : "选择图片"}
            </motion.button>
          </div>

          {/* Result */}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={SPRING}
                className="space-y-3">

                {/* Subject */}
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                  style={{ background: "rgba(79,111,82,0.08)", border: "1px solid rgba(79,111,82,0.18)" }}>
                  <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: "#4F6F52" }} />
                  <p className="text-sm font-semibold" style={{ color: "#3A4D39" }}>
                    识别到：{result.subject}
                  </p>
                </div>

                {/* AI story */}
                <div className="p-4 rounded-2xl space-y-3"
                  style={{ background: "white", border: "1px solid #E6E2D8" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: "linear-gradient(135deg,#4F6F52,#3A5240)", color: "white", fontFamily: "var(--font-noto-serif)" }}>玉</div>
                    <p className="text-[11px] font-semibold" style={{ color: "#4F6F52" }}>小玉为您讲解</p>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "#3A4D39" }}>{result.story}</p>
                  <div className="pt-2 border-t" style={{ borderColor: "#F0EDE5" }}>
                    <p className="text-[11px]" style={{ color: "#8F9F8F" }}>
                      <span className="font-medium" style={{ color: "#D2A053" }}>小玉建议：</span>
                      {result.tip}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
