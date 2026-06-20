"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Sparkles, Check, Copy, Share2, Download, QrCode, Coins, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface PointsInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "packages" | "invite";
}

export function PointsInviteModal({ isOpen, onClose, initialTab = "packages" }: PointsInviteModalProps) {
  const [activeTab, setActiveTab] = useState<"packages" | "invite">(initialTab);
  const [selectedPack, setSelectedPack] = useState<number>(1); // Index of selected package (200 points)
  const [payMethod, setPayMethod] = useState<"wechat" | "alipay">("wechat");
  const [isPaying, setIsPaying] = useState(false);
  const [showPoster, setShowPoster] = useState(false);

  const packages = [
    {
      id: 1,
      points: 50,
      price: 9.9,
      description: "单次对话尝鲜首选",
      badge: "尝鲜包",
      popular: false,
    },
    {
      id: 2,
      points: 200,
      price: 29.9,
      description: "解锁全景区语音包",
      badge: "畅玩包",
      popular: true,
    },
    {
      id: 3,
      points: 1000,
      price: 99.9,
      description: "终身无限特权特惠",
      badge: "尊享包",
      popular: false,
    },
  ];

  const copyText = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const handlePay = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      toast.success(`支付成功！已成功充值 ${packages[selectedPack].points} 积分！`);
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div 
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            zIndex: 55,
          }}
        >
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(18, 24, 21, 0.65)",
              backdropFilter: "blur(12px)",
              zIndex: 1,
            }}
          />

          {/* Modal body */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="relative rounded-[32px] overflow-hidden shadow-2xl flex flex-col z-10"
            style={{
              background: "#FAF8F5",
              border: "1px solid #E6E2D8",
              width: "100%",
              maxWidth: "480px",
              margin: "0 auto",
            }}
          >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#E6E2D8]/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#D2A053]/10 flex items-center justify-center text-[#D2A053]">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <h2 className="text-base font-black text-[#1E2522]" style={{ fontFamily: "var(--font-noto-serif)" }}>
                旅行家Pro · 会员中心
              </h2>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#E6E2D8]/40 hover:bg-[#E6E2D8]/70 flex items-center justify-center text-[#1E2522]/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Navigation Tabs */}
          <div className="px-6 pt-4">
            <div className="flex bg-[#E6E2D8]/30 p-1 rounded-2xl relative">
              <button
                onClick={() => setActiveTab("packages")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all relative z-10 ${
                  activeTab === "packages" ? "text-white" : "text-[#A69B8F] hover:text-[#D2A053]"
                }`}
              >
                积分充值
              </button>
              <button
                onClick={() => setActiveTab("invite")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all relative z-10 ${
                  activeTab === "invite" ? "text-white" : "text-[#A69B8F] hover:text-[#D2A053]"
                }`}
              >
                邀请有礼
              </button>
              {/* Tab indicator sliding effect */}
              <motion.div
                layoutId="modal-tab-indicator"
                className="absolute top-1 bottom-1 rounded-xl bg-[#D2A053] shadow-sm z-0"
                style={{
                  left: activeTab === "packages" ? "4px" : "calc(50% + 2px)",
                  width: "calc(50% - 6px)",
                }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
            {activeTab === "packages" ? (
              // Points Recharge Tab
              <div className="space-y-5">
                {/* Balance display card */}
                <div
                  className="rounded-2xl p-4 flex justify-between items-center text-white relative overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #D2A053 0%, #B8843A 100%)",
                    boxShadow: "0 8px 24px rgba(210, 160, 83, 0.15)",
                  }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 translate-x-4 -translate-y-4 filter blur-lg" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/12 flex items-center justify-center text-white">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/70 tracking-wider uppercase font-bold">可用积分余额</p>
                      <h3 className="text-xl font-black mt-0.5" style={{ fontFamily: "var(--font-noto-serif)" }}>
                        180 <span className="text-xs font-medium text-white/80">积分</span>
                      </h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                      尊享畅游权益
                    </span>
                  </div>
                </div>

                {/* 3-Column Horizontal Grid of Recharge Packages */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-[#8F9F8F] uppercase tracking-wider">选择积分套餐</p>
                  <div className="grid grid-cols-3 gap-3">
                    {packages.map((pkg, idx) => (
                      <motion.div
                        key={pkg.id}
                        onClick={() => setSelectedPack(idx)}
                        whileTap={{ scale: 0.96 }}
                        className={`relative rounded-2xl p-3 border cursor-pointer transition-all flex flex-col justify-between aspect-[1/1.25] ${
                          selectedPack === idx
                            ? "border-[#D2A053] bg-white"
                            : "border-[#E6E2D8] bg-white hover:border-[#8F9F8F]"
                        }`}
                        style={{
                          boxShadow: selectedPack === idx ? "0 8px 20px rgba(210, 160, 83, 0.1)" : "none",
                        }}
                      >
                        {/* Popular / Best value badge */}
                        {pkg.popular && (
                          <div
                            className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[8px] font-black text-white whitespace-nowrap"
                            style={{ background: "linear-gradient(135deg, #FF9D42, #FF5E3A)" }}
                          >
                            BEST · 超值
                          </div>
                        )}

                        <div className="text-center pt-1">
                          <span className="text-[8px] bg-[#D2A053]/10 text-[#B8843A] px-2 py-0.5 rounded font-black">
                            {pkg.badge}
                          </span>
                          <h4 className="text-lg font-black text-[#1E2522] mt-3" style={{ fontFamily: "var(--font-noto-serif)" }}>
                            {pkg.points} <span className="text-[10px] font-bold text-[#8F9F8F]">分</span>
                          </h4>
                          <p className="text-[9px] text-[#8F9F8F] mt-1.5 leading-tight">{pkg.description}</p>
                        </div>

                        <div className="text-center border-t border-[#E6E2D8]/50 pt-2.5">
                          <span className="text-xs text-[#8F9F8F] font-bold">¥ </span>
                          <span className="text-base font-black text-[#1E2522]">{pkg.price}</span>
                        </div>

                        {/* Selection check ring */}
                        <div
                          className={`absolute bottom-2 right-2 w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            selectedPack === idx ? "bg-[#D2A053] border-[#D2A053] text-white" : "border-[#E6E2D8]"
                          }`}
                        >
                          {selectedPack === idx && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-[#8F9F8F] uppercase tracking-wider">支付方式</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPayMethod("wechat")}
                      className={`flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-bold transition-all ${
                        payMethod === "wechat"
                          ? "border-[#09BB07] bg-[#09BB07]/5 text-[#09BB07]"
                          : "border-[#E6E2D8] bg-white hover:border-[#8F9F8F]"
                      }`}
                    >
                      <span className="text-sm">🟢</span> 微信支付
                    </button>
                    <button
                      onClick={() => setPayMethod("alipay")}
                      className={`flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-bold transition-all ${
                        payMethod === "alipay"
                          ? "border-[#00A0E9] bg-[#00A0E9]/5 text-[#00A0E9]"
                          : "border-[#E6E2D8] bg-white hover:border-[#8F9F8F]"
                      }`}
                    >
                      <span className="text-sm">🔵</span> 支付宝
                    </button>
                  </div>
                </div>

                {/* Pay button */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  disabled={isPaying}
                  onClick={handlePay}
                  className="w-full py-3.5 rounded-2xl text-xs font-black text-white flex items-center justify-center gap-2 transition-all mt-3"
                  style={{
                    background: "linear-gradient(135deg, #FF9D42 0%, #FF5E3A 100%)",
                    boxShadow: "0 6px 20px rgba(255, 94, 58, 0.22)",
                  }}
                >
                  {isPaying ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      支付处理中...
                    </>
                  ) : (
                    <>立即支付 ￥{packages[selectedPack].price}</>
                  )}
                </motion.button>
              </div>
            ) : (
              // Invite Rewards Tab
              <div className="space-y-5">
                {/* Promo banner */}
                <div
                  className="rounded-2xl p-4 text-white relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #D2A053 0%, #B8843A 100%)" }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 translate-x-4 -translate-y-4 filter blur-lg" />
                  <div className="flex gap-3.5 items-center">
                    <div className="w-10 h-10 rounded-xl bg-white/12 flex items-center justify-center text-white text-lg">
                      🎁
                    </div>
                    <div>
                      <h4 className="text-xs font-black" style={{ fontFamily: "var(--font-noto-serif)" }}>
                        有礼同享 · 邀请好友注册
                      </h4>
                      <p className="text-[10px] text-white/80 mt-1 leading-normal">
                        好友注册并使用您的邀请码，双方均可直接获得 <span className="text-[#D2A053] font-bold">50 积分</span> 奖励！
                      </p>
                    </div>
                  </div>
                </div>

                {/* Invite statistics cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-[#E6E2D8] rounded-2xl p-3.5 text-center">
                    <p className="text-[9px] text-[#8F9F8F] font-bold">成功邀请好友</p>
                    <p className="text-lg font-black text-[#1E2522] mt-1" style={{ fontFamily: "var(--font-noto-serif)" }}>
                      3 <span className="text-xs text-[#8F9F8F] font-medium">人</span>
                    </p>
                  </div>
                  <div className="bg-white border border-[#E6E2D8] rounded-2xl p-3.5 text-center">
                    <p className="text-[9px] text-[#8F9F8F] font-bold">累计奖励积分</p>
                    <p className="text-lg font-black text-[#D2A053] mt-1" style={{ fontFamily: "var(--font-noto-serif)" }}>
                      150 <span className="text-xs text-[#8F9F8F] font-medium">分</span>
                    </p>
                  </div>
                </div>

                {/* Invitation Code & Link Blocks */}
                <div className="space-y-2.5">
                  <div className="bg-white border border-[#E6E2D8] rounded-2xl p-3 flex justify-between items-center">
                    <div>
                      <p className="text-[9px] text-[#8F9F8F] font-bold">我的专属邀请码</p>
                      <p className="text-sm font-black text-[#B8843A] mt-0.5 tracking-wider select-all">TRV888</p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => copyText("TRV888", "邀请码已复制到剪贴板！")}
                      className="px-3 py-1.5 rounded-xl bg-[#D2A053]/10 hover:bg-[#D2A053]/15 text-[#B8843A] text-[10px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-3 h-3" /> 复制
                    </motion.button>
                  </div>

                  <div className="bg-white border border-[#E6E2D8] rounded-2xl p-3 flex justify-between items-center">
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="text-[9px] text-[#8F9F8F] font-bold">我的专属推广链接</p>
                      <p className="text-xs text-[#1E2522]/80 mt-0.5 truncate select-all">
                        http://localhost:3000/welcome?ref=TRV888
                      </p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => copyText("http://localhost:3000/welcome?ref=TRV888", "推广链接已复制到剪贴板！")}
                      className="px-3 py-1.5 rounded-xl bg-[#D2A053]/10 hover:bg-[#D2A053]/15 text-[#B8843A] text-[10px] font-bold flex items-center gap-1 flex-shrink-0 transition-colors"
                    >
                      <Copy className="w-3 h-3" /> 复制
                    </motion.button>
                  </div>
                </div>

                {/* Generate Poster button */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPoster(true)}
                  className="w-full py-3 rounded-2xl text-xs font-black text-white shadow-md shadow-[#D2A053]/15 flex items-center justify-center gap-2 transition-all mt-2 hover:opacity-90 active:scale-[0.99]"
                  style={{
                    background: "linear-gradient(135deg, #D2A053 0%, #B8843A 100%)",
                  }}
                >
                  <Share2 className="w-3.5 h-3.5" /> 生成专属分享海报
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Share Poster Sub-Modal Overlay */}
      {showPoster && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setShowPoster(false)}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-[#FAF8F5] border border-[#E6E2D8] rounded-[28px] p-5 w-full max-w-[360px] overflow-hidden shadow-2xl flex flex-col z-10"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-black text-[#1E2522]">您的推广海报</h4>
              <button
                onClick={() => setShowPoster(false)}
                className="w-6 h-6 rounded-full bg-[#E6E2D8]/50 flex items-center justify-center text-[#1E2522]/60 hover:bg-[#E6E2D8] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Poster Card */}
            <div
              className="rounded-2xl p-6 text-white text-center relative overflow-hidden flex flex-col justify-between aspect-[3/4]"
              style={{
                background: "linear-gradient(135deg, #1C2420 0%, #121815 100%)",
                border: "3px solid #D2A053",
              }}
            >
              <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-[#D2A053]/10 filter blur-xl" />

              {/* Title block */}
              <div className="space-y-1 relative z-10 mt-2">
                <h2 className="text-lg font-black tracking-wider text-[#D2A053]" style={{ fontFamily: "var(--font-noto-serif)" }}>
                  旅行家Pro
                </h2>
                <p className="text-[9px] text-[#8F9F8F] uppercase tracking-widest">Next-Gen Virtual Guide</p>
                <div className="w-6 h-[2px] bg-[#D2A053] mx-auto mt-2" />
              </div>

              {/* Tagline & code */}
              <div className="my-4 relative z-10 px-2">
                <p className="text-xs text-white/95 leading-relaxed font-bold">
                  让每一块古迹玉石，<br />
                  都为你娓娓道来
                </p>
                <p className="text-[10px] text-[#D2A053] mt-2.5 bg-[#D2A053]/10 border border-[#D2A053]/25 py-1 px-3 rounded-full inline-block">
                  专属邀请码：<span className="font-black select-all">TRV888</span>
                </p>
              </div>

              {/* QR block */}
              <div className="flex flex-col items-center gap-1.5 relative z-10 mb-2">
                <div className="w-14 h-14 bg-white rounded-lg p-1.5 flex items-center justify-center shadow-lg">
                  <QrCode className="w-full h-full text-black stroke-[1.5]" />
                </div>
                <p className="text-[9px] text-white/60">
                  扫码注册，立领 <span className="text-[#D2A053] font-bold">50 积分</span> 好礼
                </p>
              </div>
            </div>

            {/* Poster download/share buttons */}
            <div className="flex gap-2.5 mt-4">
              <button
                onClick={() => {
                  toast.success("分享链接已复制到剪贴板！");
                  setShowPoster(false);
                }}
                className="flex-1 py-2.5 rounded-xl border border-[#E6E2D8] bg-white text-xs font-bold text-[#1E2522]/80 hover:bg-[#E6E2D8]/30 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" /> 分享
              </button>
              <button
                onClick={() => {
                  toast.success("海报已成功保存到相册！");
                  setShowPoster(false);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-[#D2A053] hover:bg-[#B8843A] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> 保存海报
              </button>
            </div>
          </motion.div>
        </div>
      )}
        </>
      )}
    </AnimatePresence>
  );
}
