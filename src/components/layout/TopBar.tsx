"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Gift, LogOut } from "lucide-react";
import { auth } from "@eazo/sdk";
import { useEazo } from "@eazo/sdk/react";
import { GlobalSearch } from "@/components/ui/GlobalSearch";
import { toast } from "sonner";

export function TopBar() {
  const user = useEazo((s) => s.auth.user);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifyRef.current && !notifyRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    try {
      await auth.logout();
      toast.success("退出登录成功");
      window.location.href = "/login";
    } catch {
      toast.error("退出登录失败，请重试");
    }
  };

  const notifications = [
    { id: 1, title: "AI 向导小旅已就绪", content: "您的专属智能伴游小旅已准备就绪，点击开始实机对谈！", time: "10分钟前", unread: true },
    { id: 2, title: "限时充值优惠特权", content: "VIP 畅游卡特惠充值立享 85 折优惠，赶紧抢购吧！", time: "2小时前", unread: false },
  ];

  return (
    <>
      <div
        role="banner"
        className="hidden md:flex fixed top-0 right-0 left-[240px] h-[70px] z-30"
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          background: "rgba(250,248,245,0.88)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid #E6E2D8",
          paddingLeft: 0,
          paddingRight: "32px"
        }}
      >
        {/* RIGHT: Actions */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <div ref={notifyRef} className="relative">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full hover:bg-[#E6E2D8]/50 text-[#1E2522] transition-colors"
              title="通知"
            >
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1 right-1 w-[14px] h-[14px] bg-[#FF5E3A] rounded-full text-[8px] font-black text-white flex items-center justify-center leading-none">1</span>
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-[#E6E2D8] bg-white shadow-xl overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-[#E6E2D8]/50 flex justify-between items-center bg-[#FAF8F5]">
                    <span className="text-xs font-black text-[#1E2522]">系统通知</span>
                    <button onClick={() => toast.success("已全部标记为已读")} className="text-[10px] text-[#4F6F52] font-bold hover:underline">全部已读</button>
                  </div>
                  <div className="divide-y divide-[#E6E2D8]/30 max-h-60 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-3.5 hover:bg-[#FAF8F5]/60 transition-colors flex gap-2.5">
                        {n.unread && <div className="w-1.5 h-1.5 rounded-full bg-[#FF5E3A] mt-1.5 flex-shrink-0" />}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#1E2522] truncate">{n.title}</p>
                          <p className="text-[10px] text-[#8F9F8F] mt-0.5 leading-relaxed">{n.content}</p>
                          <span className="text-[9px] text-[#8F9F8F]/60 mt-1 block">{n.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Invite & Points */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => window.dispatchEvent(new CustomEvent("open-points-modal", { detail: { tab: "invite" } }))}
            className="px-4 py-1.5 rounded-full text-white text-[11px] font-bold flex items-center gap-1.5 transition-all whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #FF9D42 0%, #FF5E3A 100%)", boxShadow: "0 4px 12px rgba(255,94,58,0.20)" }}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>邀请有礼 · 积分</span>
          </motion.button>

          {/* User Profile */}
          <button
            onClick={() => { window.location.href = "/profile"; }}
            className="flex items-center gap-2 py-1 px-1 pr-2.5 rounded-full border border-[#E6E2D8] hover:bg-white hover:shadow-md transition-all"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden bg-[#4F6F52]/10 flex items-center justify-center border border-[#E6E2D8] flex-shrink-0">
              {user?.avatarUrl ? (
                <Image src={user.avatarUrl.startsWith("//") ? `https:${user.avatarUrl}` : user.avatarUrl} alt="avatar" width={28} height={28} className="object-cover w-full h-full" />
              ) : (
                <span className="text-xs font-black text-[#4F6F52]">{(user?.name ?? user?.email ?? "游")[0].toUpperCase()}</span>
              )}
            </div>
            <span className="text-xs font-semibold text-[#1E2522] max-w-[80px] truncate">{user?.name ?? "游客用户"}</span>
          </button>

          {/* Logout */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-red-50 hover:text-red-500 text-[#1E2522]/50 transition-colors"
            title="退出登录"
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showSearch && <GlobalSearch onClose={() => setShowSearch(false)} />}
      </AnimatePresence>
    </>
  );
}
