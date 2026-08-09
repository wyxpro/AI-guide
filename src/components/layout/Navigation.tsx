"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, MessageCircle, MapPin, Navigation, User, Music,
  BarChart2, BookOpen, Bot, TrendingUp, Settings, ChevronRight,
  Bell, Gift, LogOut
} from "lucide-react";
import { GlobalSearch } from "@/components/ui/GlobalSearch";
import { useEazo } from "@eazo/sdk/react";
import { auth } from "@eazo/sdk";
import { toast } from "sonner";

/* ─── C端标签 ─────────────────────────────────────────────── */
const C_TABS = [
  { href: "/home", label: "首页", icon: Home },
  { href: "/spots", label: "热门景点", icon: MapPin },
  { href: "/qa", label: "AI数字人导游", icon: MessageCircle },
  { href: "/routes", label: "行程规划", icon: Navigation },
  { href: "/profile", label: "我的", icon: User },
];

/* ─── B端侧栏导航 ──────────────────────────────────────────── */
const ADMIN_ITEMS = [
  { href: "/admin", label: "数据大屏", icon: BarChart2, desc: "运营总览" },
  { href: "/admin/spots", label: "景点管理", icon: MapPin, desc: "增删改查" },
  { href: "/admin/knowledge", label: "知识库", icon: BookOpen, desc: "内容管理" },
  { href: "/admin/avatar", label: "数字人", icon: Bot, desc: "形象配置" },
];

/* ════════════════════════════════════════════════════════════
   移动端底部 Tab（仅 C 端，md 以下显示）
════════════════════════════════════════════════════════════ */
export function BottomTabBar() {
  const pathname = usePathname();
  const [showSearch, setShowSearch] = useState(false);

  const MOBILE_TABS = [
    { href: "/home", label: "首页", icon: Home },
    { href: "/spots", label: "热门景点", icon: MapPin },
    { href: "/qa", label: "AI数字人导游", icon: MessageCircle },
    { href: "/routes", label: "行程规划", icon: Navigation },
    { href: "/profile", label: "我的", icon: User },
  ];
  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([35, 30, 35]);
      } catch {}
    }
  };

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 md:hidden z-30"
        style={{
          background: "rgba(250,248,245,0.97)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid #E6E2D8",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}>
        <div className="flex justify-around items-end h-16 px-2">
          {MOBILE_TABS.map((tab) => {
            const active = tab.href && (tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href));
            const Icon = tab.icon;
            const isCenterButton = tab.label === "AI数字人导游";

            const el = isCenterButton ? (
              <div className="relative -top-3.5 flex flex-col items-center justify-center cursor-pointer min-w-[56px] select-none">
                <motion.div
                  animate={{ scale: active ? 1.15 : 1, y: active ? -2 : 0 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 450, damping: 22 }}
                  className="relative w-13 h-13 rounded-full border-2 border-[#FF4D8D] shadow-[0_4px_18px_rgba(255,77,141,0.5)] bg-white flex items-center justify-center p-0.5 overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/image/logo.png"
                    alt="旅行家Pro Logo"
                    className="w-full h-full object-cover rounded-full"
                  />
                </motion.div>
                <span
                  className="text-[9.5px] font-black mt-1 leading-none transition-colors"
                  style={{ color: active ? "#FF4D8D" : "#71717A" }}
                >
                  数字人导游
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 flex-1 py-2 min-h-[44px] cursor-pointer relative select-none">
                <motion.div
                  animate={{ scale: active ? 1.18 : 1, y: active ? -1 : 0 }}
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: "spring", stiffness: 450, damping: 22 }}
                  className="relative flex items-center justify-center"
                >
                  <Icon
                    className="w-5 h-5 transition-colors"
                    style={{ color: active ? "#D2A053" : "#9CA3AF", strokeWidth: active ? 2.3 : 1.7 }}
                  />
                  {active && (
                    <motion.div
                      layoutId="active-tab-glow"
                      className="absolute -inset-1.5 bg-[#D2A053]/25 rounded-full blur-xs -z-10"
                    />
                  )}
                </motion.div>
                <span
                  className="text-[9.5px] font-extrabold leading-none transition-colors"
                  style={{ color: active ? "#D2A053" : "#71717A" }}
                >
                  {tab.label}
                </span>
              </div>
            );
            return tab.href
              ? <Link key={tab.label} href={tab.href} onClick={triggerHaptic}>{el}</Link>
              : <div key={tab.label} onClick={triggerHaptic}>{el}</div>;
          })}
        </div>
      </nav>
      <AnimatePresence>
        {showSearch && <GlobalSearch onClose={() => setShowSearch(false)} />}
      </AnimatePresence>
    </>
  );
}
/* ════════════════════════════════════════════════════════════
   PC 端左侧边栏（md 以上显示，C端 + B端共用）
════════════════════════════════════════════════════════════ */
export function SidebarNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const items = isAdmin ? ADMIN_ITEMS : C_TABS.map(t => ({ ...t, desc: "" }));

  const user = useEazo((s: any) => s.auth.user);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifyRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const notifications = [
    { id: 1, title: "AI 向导小旅已就绪", content: "您的专属智能伴游小旅已准备就绪，点击开始实机对谈！", time: "10分钟前", unread: true },
    { id: 2, title: "限时充值优惠特权", content: "VIP 畅游卡特惠充值立享 85 折优惠，赶紧抢购吧！", time: "2小时前", unread: false },
  ];

  const handleLogout = async () => {
    try {
      await auth.logout();
      toast.success("退出登录成功");
      window.location.href = "/login";
    } catch {
      toast.error("退出登录失败，请重试");
    }
  };

  const handleExitAdmin = async () => {
    try {
      localStorage.removeItem("eazo.session");
      await auth.logout();
      toast.success("已退出管理员后台");
      window.location.href = "/home";
    } catch {
      toast.error("退出失败，请重试");
    }
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifyRef.current && !notifyRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside
      className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-20"
      style={{
        width: 240,
        background: isAdmin
          ? "linear-gradient(180deg, #1A2520 0%, #121815 100%)"
          : "rgba(250,248,245,0.98)",
        borderRight: `1px solid ${isAdmin ? "rgba(255,255,255,0.07)" : "#E6E2D8"}`,
        backdropFilter: "blur(20px)",
      }}>

      {/* Logo area */}
      <Link href="/welcome" className="block group">
        <div className="px-5 pt-6 pb-4" style={{ borderBottom: isAdmin ? "1px solid rgba(255,255,255,0.07)" : "1px solid #E6E2D8" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 relative shadow-[0_4px_12px_rgba(79,111,82,0.15)] border border-[#E6E2D8]/50">
              <Image
                src="/image/logo.png"
                alt="Logo"
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className={`text-[18px] font-bold truncate transition-colors ${isAdmin ? "text-white/90 group-hover:text-[#D2A053]" : "text-[#1E2522] group-hover:text-[#4F6F52]"}`}
                style={{ fontFamily: "var(--font-noto-serif)" }}>
                旅行家Pro
              </p>
              <p className="text-[13px] truncate transition-colors group-hover:opacity-80"
                style={{ color: isAdmin ? "rgba(255,255,255,0.35)" : "#8F9F8F" }}>
                {isAdmin ? "运营管理中心" : "AI数字人导览"}
              </p>
            </div>
          </div>
        </div>
      </Link>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col justify-between">
        <div className="space-y-1.5">
          {items.map((item) => {
            const active = item.href === (isAdmin ? "/admin" : "/home")
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileTap={{ scale: 0.97 }}
                  whileHover={!active ? { x: 3 } : {}}
                  className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl cursor-pointer transition-colors"
                  style={{
                    background: active
                      ? isAdmin ? "rgba(210,160,83,0.15)" : "rgba(79,111,82,0.1)"
                      : "transparent",
                    color: active
                      ? isAdmin ? "#D2A053" : "#4F6F52"
                      : isAdmin ? "rgba(255,255,255,0.45)" : "#8F9F8F",
                  }}>
                  <item.icon className="w-5 h-5 flex-shrink-0" strokeWidth={active ? 2.2 : 1.6} />
                  <div className="flex-1 min-w-0">
                    <p className={`${isAdmin ? "text-base" : "text-[18px]"} font-${active ? "semibold" : "normal"} truncate`}>
                      {item.label}
                    </p>
                    {"desc" in item && item.desc && (
                      <p className="text-xs truncate" style={{ opacity: 0.6 }}>{item.desc}</p>
                    )}
                  </div>
                  {active && <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: isAdmin ? "#D2A053" : "#4F6F52" }} />}
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* C-side additional controls below '我的' */}
        {mounted && !isAdmin && (
          <div className="mt-6 pt-4 border-t border-[#E6E2D8] space-y-2.5 px-1 flex-shrink-0 relative">
            {/* 1. Invite & Points Button (Top) */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => window.dispatchEvent(new CustomEvent("open-points-modal", { detail: { tab: "invite" } }))}
              className="w-full py-2.5 px-4 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:brightness-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #FF9D42 0%, #FF5E3A 100%)", boxShadow: "0 3px 8px rgba(255,94,58,0.15)" }}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>邀请有礼 · 积分</span>
            </motion.button>

            {/* 2. User & Role Switcher Card (Bottom) */}
            <div className="flex flex-col gap-2 bg-white border border-[#E6E2D8] p-2.5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between">
                <Link href="/profile" className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-85 active:scale-98 transition-all">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[#E6E2D8] flex-shrink-0 relative">
                    <Image
                      src={user?.avatarUrl ? (user.avatarUrl.startsWith("//") ? `https:${user.avatarUrl}` : user.avatarUrl) : "https://img0.baidu.com/it/u=830713058,3987335577&fm=253&app=138&f=JPEG?w=819&h=800"}
                      alt="avatar"
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1E2522] truncate">{user?.name ?? "游客用户"}</p>
                    <p className="text-[10px] text-[#8F9F8F] font-semibold">当前游客角色</p>
                  </div>
                </Link>

                <motion.button
                  whileTap={{ scale: 0.90 }}
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-[#1E2522]/50 transition-colors"
                  title="退出登录"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </motion.button>
              </div>

              {/* Grid Role Switch Toggle (Guest side) */}
              <div className="grid grid-cols-2 gap-1.5 mt-1.5 h-8">
                <button
                  disabled={true}
                  className="rounded-lg text-center text-xs font-bold bg-[#4F6F52]/10 text-[#4F6F52] border border-[#4F6F52]/20 flex items-center justify-center"
                >
                  游客
                </button>
                <button
                  onClick={() => {
                    window.location.href = "/admin/login";
                  }}
                  className="rounded-lg text-center text-xs font-semibold text-[#8F9F8F] hover:text-[#D2A053] hover:bg-[#D2A053]/5 border border-transparent hover:border-[#D2A053]/20 transition-all flex items-center justify-center"
                >
                  管理员
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom area: User & Admin Switcher Card (Admin only) */}
      <div className="px-3 pb-5 pt-3"
        style={{ borderTop: isAdmin ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
        {isAdmin && (
          <div className="flex flex-col gap-2 bg-white/5 border border-white/10 p-2.5 rounded-2xl">
            {/* Top row: Admin Profile */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-[#D2A053]/20 flex items-center justify-center border border-white/10 flex-shrink-0">
                  <span className="text-xs font-black text-[#D2A053]">管</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white/90 truncate">{user?.name ?? "系统管理员"}</p>
                  <p className="text-[10px] text-white/40 font-semibold">管理后台模式</p>
                </div>
              </div>
            </div>

            {/* Grid Role Switch Toggle (Admin side) */}
            <div className="grid grid-cols-2 gap-1.5 mt-1.5 h-8">
              <button
                onClick={handleExitAdmin}
                className="rounded-lg text-center text-xs font-semibold text-white/40 hover:text-[#86a889] hover:bg-white/5 border border-transparent hover:border-white/10 transition-all flex items-center justify-center"
              >
                游客
              </button>
              <button
                disabled={true}
                className="rounded-lg text-center text-xs font-bold bg-[#D2A053]/20 text-[#D2A053] border border-[#D2A053]/30 flex items-center justify-center"
              >
                管理员
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

/* ════════════════════════════════════════════════════════════
   移动端底部 Tab（仅 B 端管理员后台，md 以下显示）
   ════════════════════════════════════════════════════════════ */
export function AdminBottomTabBar() {
  const pathname = usePathname();

  const handleExitAdmin = async () => {
    try {
      localStorage.removeItem("eazo.session");
      await auth.logout();
      toast.success("已退出管理员后台");
      window.location.href = "/home";
    } catch {
      toast.error("退出失败，请重试");
    }
  };

  const ADMIN_MOBILE_TABS = [
    { href: "/admin", label: "数据大屏", icon: BarChart2 },
    { href: "/admin/spots", label: "景点管理", icon: MapPin },
    { href: "/admin/knowledge", label: "知识库", icon: BookOpen },
    { href: "/admin/avatar", label: "数字人", icon: Bot },
    { label: "退出后台", icon: LogOut, onClick: handleExitAdmin },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 md:hidden z-30"
      style={{
        background: "rgba(18, 24, 21, 0.97)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}>
      <div className="flex justify-around items-end h-15 px-2">
        {ADMIN_MOBILE_TABS.map((tab) => {
          const active = tab.href && (tab.href === "/admin" ? pathname === "/admin" : pathname.startsWith(tab.href));
          const Icon = tab.icon;

          const el = (
            <div 
              onClick={tab.onClick}
              className="flex flex-col items-center justify-center gap-1 py-2 min-h-[44px] cursor-pointer relative"
            >
              <motion.div animate={{ scale: active ? 1.12 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                <Icon className="w-4.5 h-4.5"
                  style={{ color: active ? "#D2A053" : "rgba(255, 255, 255, 0.4)", strokeWidth: active ? 2.2 : 1.6 }} />
              </motion.div>
              <span className="text-[9px] font-bold leading-none"
                style={{ color: active ? "#D2A053" : "rgba(255, 255, 255, 0.4)" }}>{tab.label}</span>
              {active && (
                <motion.div layoutId="admin-tab-indicator"
                  className="absolute bottom-0 w-8 h-0.5 rounded-full"
                  style={{ background: "#D2A053" }} />
              )}
            </div>
          );

          return tab.href ? (
            <Link key={tab.label} href={tab.href} className="flex-1">
              {el}
            </Link>
          ) : (
            <div key={tab.label} className="flex-1">
              {el}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

