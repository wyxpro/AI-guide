"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, MessageCircle, MapPin, Navigation, User, Music,
  BarChart2, BookOpen, Bot, TrendingUp, Settings, ChevronRight,
} from "lucide-react";
import { GlobalSearch } from "@/components/ui/GlobalSearch";

/* ─── C端标签 ─────────────────────────────────────────────── */
const C_TABS = [
  { href: "/home",    label: "首页",  icon: Home },
  { href: "/spots",   label: "热门景点",  icon: MapPin },
  { href: "/qa",      label: "AI数字人导游",  icon: MessageCircle },
  { href: "/routes",  label: "行程规划",  icon: Navigation },
  { href: "/profile", label: "我的",  icon: User },
];

/* ─── B端侧栏导航 ──────────────────────────────────────────── */
const ADMIN_ITEMS = [
  { href: "/admin",            label: "数据大屏",  icon: BarChart2,  desc: "运营总览" },
  { href: "/admin/knowledge",  label: "知识库",    icon: BookOpen,   desc: "内容管理" },
  { href: "/admin/spots",      label: "景点管理",  icon: MapPin,     desc: "增删改查" },
  { href: "/admin/avatar",     label: "数字人",    icon: Bot,        desc: "形象配置" },
  { href: "/admin/analytics",  label: "数据分析",  icon: TrendingUp, desc: "游客洞察" },
];

/* ════════════════════════════════════════════════════════════
   移动端底部 Tab（仅 C 端，md 以下显示）
════════════════════════════════════════════════════════════ */
export function BottomTabBar() {
  const pathname = usePathname();
  const [showSearch, setShowSearch] = useState(false);

  const MOBILE_TABS = [
    { href: "/home",    label: "智能导游",  icon: Home },
    { href: "/spots",   label: "热门景点",  icon: MapPin },
    { href: "/qa",      label: "AI数字人导游", icon: MessageCircle },
    { href: "/routes",  label: "行程规划",  icon: Navigation },
    { href: "/profile", label: "我的",      icon: User },
  ];
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
        <div className="flex justify-around items-end h-15 px-2">
          {MOBILE_TABS.map((tab) => {
            const active = tab.href && (tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href));
            const Icon = tab.icon;
            const isCenterButton = tab.label === "AI数字人导游";
            
            const el = isCenterButton ? (
              <div className="relative -top-3 flex flex-col items-center justify-center cursor-pointer min-w-[56px] select-none">
                <motion.div
                  animate={{ scale: active ? 1.08 : 1 }}
                  whileTap={{ scale: 0.92 }}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF7A5A] to-[#FF5B45] border-4 border-[#FFFDF9] shadow-[0_4px_12px_rgba(255,91,69,0.22)] flex items-center justify-center text-white text-[10px] font-black text-center"
                >
                  AI导游
                </motion.div>
                <span className="text-[9px] font-black mt-1 leading-none transition-colors"
                  style={{ color: active ? "#FF5B45" : "#B8B4AC" }}>
                  AI数字人导游
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 flex-1 py-2 min-h-[44px] cursor-pointer relative">
                <motion.div animate={{ scale: active ? 1.12 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                  <Icon className="w-4.5 h-4.5"
                    style={{ color: active ? "#4F6F52" : "#B8B4AC", strokeWidth: active ? 2.2 : 1.6 }} />
                </motion.div>
                <span className="text-[9px] font-bold leading-none"
                  style={{ color: active ? "#4F6F52" : "#B8B4AC" }}>{tab.label}</span>
                {active && (
                  <motion.div layoutId="tab-indicator"
                    className="absolute bottom-0 w-8 h-0.5 rounded-full"
                    style={{ background: "#4F6F52" }} />
                )}
              </div>
            );
            return tab.href
              ? <Link key={tab.label} href={tab.href}>{el}</Link>
              : <div key={tab.label}>{el}</div>;
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
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base font-black flex-shrink-0 transition-transform group-hover:scale-105"
              style={{
                background: isAdmin
                  ? "linear-gradient(135deg,#D2A053,#B8843A)"
                  : "linear-gradient(135deg,#4F6F52,#3A5240)",
                color: "white",
                fontFamily: "var(--font-noto-serif)",
                boxShadow: "0 4px 12px rgba(79,111,82,0.3)",
              }}>
              旅
            </div>
            <div className="min-w-0">
              <p className={`text-[18px] font-bold truncate transition-colors ${isAdmin ? "text-white/90 group-hover:text-[#D2A053]" : "text-[#1E2522] group-hover:text-[#4F6F52]"}`}
                style={{ fontFamily: "var(--font-noto-serif)" }}>
                旅行吧
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
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
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

      {/* Bottom area: cross-end switch */}
      <div className="px-3 pb-5 pt-3"
        style={{ borderTop: isAdmin ? "1px solid rgba(255,255,255,0.07)" : "1px solid #E6E2D8" }}>
        {!isAdmin ? (
          <Link href="/admin">
            <motion.div whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl cursor-pointer text-sm"
              style={{ background: "rgba(79,111,82,0.07)", color: "#4F6F52" }}>
              <Settings className="w-4 h-4" />
              <span className="font-medium">管理后台</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />
            </motion.div>
          </Link>
        ) : (
          <Link href="/home">
            <motion.div whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl cursor-pointer text-sm"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
              <Home className="w-4 h-4" />
              <span className="font-medium">游客端首页</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-40" />
            </motion.div>
          </Link>
        )}
      </div>
    </aside>
  );
}
