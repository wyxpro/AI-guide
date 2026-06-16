"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { X, Check, Upload, Play, Sparkles } from "lucide-react";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 35 };

interface AvatarSelectorModalProps {
  onClose: () => void;
  allAvatars: any[];
  customAvatars: any[];
  selectedStyle: string;
  onSelect: (urlOrId: string) => void;
  onUploadClick: () => void;
}

export function AvatarSelectorModal({
  onClose,
  allAvatars,
  customAvatars,
  selectedStyle,
  onSelect,
  onUploadClick,
}: AvatarSelectorModalProps) {
  const [activeTab, setActiveTab] = useState<"presets" | "custom">("presets");
  const [activeGender, setActiveGender] = useState<"all" | "female" | "male">("all");

  const isMale = (avatar: any) => {
    const maleNames = ["元气少年", "商业精英", "潮流酷哥", "阳光运动男", "儒雅书生", "男生", "帅气"];
    return (
      maleNames.some((m) => avatar.name?.includes(m)) ||
      avatar.avatarStyle?.includes("male")
    );
  };

  const filteredPresets = allAvatars.filter((a) => {
    if (activeGender === "all") return true;
    const male = isMale(a);
    return activeGender === "male" ? male : !male;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={SPRING}
        className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-3 flex justify-between items-center border-b border-neutral-100">
          <h3 className="text-base font-bold text-neutral-800" style={{ fontFamily: "var(--font-noto-serif)" }}>
            选择您的AI数字人形象
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-neutral-100 transition-colors">
            <X className="w-5 h-5 text-neutral-400 hover:text-neutral-600" />
          </button>
        </div>

        {/* Top Segmented Tabs */}
        <div className="px-6 py-3 flex-shrink-0">
          <div className="flex bg-neutral-100 rounded-full p-1 w-full max-w-[320px] mx-auto">
            <button
              onClick={() => setActiveTab("presets")}
              className={`flex-1 py-1.5 text-center text-xs font-bold rounded-full transition-all ${
                activeTab === "presets"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              预设库
            </button>
            <button
              onClick={() => setActiveTab("custom")}
              className={`flex-1 py-1.5 text-center text-xs font-bold rounded-full transition-all ${
                activeTab === "custom"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              我的分身
            </button>
          </div>
        </div>

        {/* Gender Filters (Only show for Preset tab) */}
        {activeTab === "presets" && (
          <div className="px-6 py-2 flex gap-1.5 justify-center flex-shrink-0">
            {["all", "female", "male"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveGender(tab as any)}
                className={`px-4 py-1 rounded-full text-xs font-semibold border transition-all ${
                  activeGender === tab
                    ? "bg-indigo-50 border-indigo-200 text-indigo-600 font-bold"
                    : "bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                }`}
              >
                {tab === "all" ? "全部" : tab === "female" ? "女生" : "男生"}
              </button>
            ))}
          </div>
        )}

        {/* Content Scroll Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeTab === "presets" ? (
            <div className="grid grid-cols-3 gap-3">
              {filteredPresets.map((avatar) => {
                const isSelected = selectedStyle === avatar.avatarStyle;
                const isVideo = avatar.avatarStyle?.endsWith(".mp4") || avatar.avatarStyle?.endsWith(".webm") || avatar.avatarStyle?.includes("video");

                return (
                  <motion.div
                    key={avatar.id}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      onSelect(avatar.avatarStyle);
                      onClose();
                    }}
                    className={`relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer border-2 transition-all shadow-sm group ${
                      isSelected ? "border-indigo-600 ring-2 ring-indigo-100" : "border-neutral-100 hover:border-indigo-300"
                    }`}
                  >
                    {/* Media render */}
                    {isVideo ? (
                      <div className="w-full h-full bg-[#1A2520] flex items-center justify-center">
                        <Play className="w-5 h-5 text-white opacity-60" />
                      </div>
                    ) : (
                      <img
                        src={avatar.imageUrl || avatar.avatarStyle}
                        alt={avatar.name}
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                    {/* Checkmark Badge */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center backdrop-blur-[1px]">
                        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg text-white">
                          <Check className="w-4 h-4" />
                        </div>
                      </div>
                    )}

                    {/* Name Label */}
                    <div className="absolute bottom-2 left-2 right-2 text-center">
                      <p className="text-[10px] font-bold text-white drop-shadow truncate">
                        {avatar.name}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Custom Clone Tab */
            <div className="grid grid-cols-3 gap-3">
              {/* Upload Card */}
              <motion.div
                whileTap={{ scale: 0.96 }}
                onClick={onUploadClick}
                className="relative aspect-[3/4] rounded-2xl border-2 border-dashed border-neutral-300 hover:border-indigo-500 cursor-pointer flex flex-col items-center justify-center p-3 bg-neutral-50/50 hover:bg-neutral-50 transition-colors"
              >
                <Upload className="w-5 h-5 text-neutral-400 mb-2" />
                <span className="text-[9px] font-bold text-neutral-500 text-center">添加我的分身</span>
                <span className="text-[8px] text-neutral-400 mt-1 text-center">(图片/视频)</span>
              </motion.div>

              {customAvatars.map((avatar) => {
                const isSelected = selectedStyle === avatar.avatarStyle;
                const isVideo = avatar.avatarStyle?.endsWith(".mp4") || avatar.avatarStyle?.endsWith(".webm") || avatar.avatarStyle?.includes("video");

                return (
                  <motion.div
                    key={avatar.id}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      onSelect(avatar.avatarStyle);
                      onClose();
                    }}
                    className={`relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer border-2 transition-all shadow-sm ${
                      isSelected ? "border-indigo-600 ring-2 ring-indigo-100" : "border-neutral-100 hover:border-indigo-300"
                    }`}
                  >
                    {/* Media render */}
                    {isVideo ? (
                      <video src={avatar.avatarStyle} className="w-full h-full object-cover" />
                    ) : (
                      <img src={avatar.imageUrl || avatar.avatarStyle} alt={avatar.name} className="w-full h-full object-cover" />
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                    {/* Checkmark Badge */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center backdrop-blur-[1px]">
                        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg text-white">
                          <Check className="w-4 h-4" />
                        </div>
                      </div>
                    )}

                    {/* Name Label */}
                    <div className="absolute bottom-2 left-2 right-2 text-center">
                      <p className="text-[10px] font-bold text-white drop-shadow truncate">
                        {avatar.name}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
