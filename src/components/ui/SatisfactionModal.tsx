"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X } from "lucide-react";

const SPRING = { type: "spring" as const, stiffness: 300, damping: 32 };

const LABELS = ["", "不满意", "基本满意", "一般", "满意", "非常满意！"];
const EMOJIS = ["", "😞", "😐", "🙂", "😊", "🥰"];

interface Props {
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

export function SatisfactionModal({ onClose, onSubmit }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit(rating, comment);
    setSubmitted(true);
    setTimeout(onClose, 2000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center pb-[env(safe-area-inset-bottom)]"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
        transition={SPRING}
        className="w-full max-w-md rounded-t-3xl px-6 pt-6 pb-8 space-y-5"
        style={{ background: "white" }}>
        <div className="flex items-center justify-between">
          <div className="w-10 h-1 rounded-full mx-auto" style={{ background: "#E6E2D8" }} />
          <motion.button whileTap={{ scale: 0.88 }} onClick={onClose} className="ml-auto">
            <X className="w-5 h-5" style={{ color: "#8F9F8F" }} />
          </motion.button>
        </div>

        {submitted ? (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={SPRING}
            className="text-center py-4 space-y-3">
            <p className="text-4xl">🎋</p>
            <p className="text-base font-semibold" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
              感谢您的评价！
            </p>
            <p className="text-sm" style={{ color: "#8F9F8F" }}>您的反馈将帮助我们提升服务品质</p>
          </motion.div>
        ) : (
          <>
            <div className="text-center space-y-1">
              <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center text-2xl"
                style={{ background: "linear-gradient(135deg, #4F6F52, #3A5240)" }}>
                {EMOJIS[hover || rating] || "🌿"}
              </div>
              <h3 className="text-base font-semibold mt-2" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
                本次导览体验如何？
              </h3>
              <p className="text-xs" style={{ color: "#8F9F8F" }}>您的满意度对我们很重要</p>
            </div>

            {/* Stars */}
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <motion.button key={s} whileTap={{ scale: 0.8 }}
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(s)}>
                  <motion.div animate={{ scale: s <= (hover || rating) ? 1.15 : 1 }} transition={SPRING}>
                    <Star className="w-9 h-9"
                      fill={s <= (hover || rating) ? "#D2A053" : "none"}
                      style={{ color: s <= (hover || rating) ? "#D2A053" : "#E6E2D8" }} />
                  </motion.div>
                </motion.button>
              ))}
            </div>

            {/* Label */}
            <div className="text-center h-5">
              <AnimatePresence mode="wait">
                {(hover || rating) > 0 && (
                  <motion.p key={hover || rating}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    className="text-sm font-semibold" style={{ color: "#D2A053" }}>
                    {LABELS[hover || rating]}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Comment */}
            <textarea value={comment} onChange={(e) => setComment(e.target.value)}
              placeholder="还有什么想说的？（选填）"
              rows={2}
              className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none"
              style={{ background: "#F5F0E8", border: "1px solid #E6E2D8", color: "#1E2522", fontSize: 16 }} />

            {/* Submit */}
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit}
              className="w-full py-3.5 rounded-2xl text-white font-semibold"
              style={{ background: rating > 0 ? "linear-gradient(135deg,#4F6F52,#3A5240)" : "#E6E2D8", color: rating > 0 ? "white" : "#8F9F8F", transition: "all 0.3s" }}>
              提交评价
            </motion.button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
