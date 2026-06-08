"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Heart, Clock, Settings, MessageSquare,
  Share2, Image as ImageIcon, ChevronRight,
  History, Trophy, Bell, Sun, Zap, Baby, ArrowRight, LogOut, X
} from "lucide-react";
import { useEazo } from "@eazo/sdk/react";
import { auth } from "@eazo/sdk";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PosterGenerator } from "@/components/ui/PosterGenerator";
import { request } from "@/lib/api/request";
import { toast } from "sonner";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 35 };

interface VisitRecord { id: number; type: string; spotId: number | null; routeId: number | null; visitedAt: string }
interface FavoriteRecord { id: number; type: string; spotId: number | null; routeId: number | null; spotName?: string; routeName?: string; spotImage?: string; routeImage?: string }

type Mode = "standard" | "elder" | "child";
const MODE_CONFIG: Record<Mode, { label: string; icon: typeof Sun; color: string; desc: string }> = {
  standard: { label: "标准", icon: Sun,  color: "#4F6F52", desc: "默认体验" },
  elder:    { label: "适老", icon: Zap,  color: "#D2A053", desc: "安全大字" },
  child:    { label: "童趣", icon: Baby, color: "#FF6B8B", desc: "探险乐园" },
};

const THEME_STYLES = {
  standard: {
    bg: "#F2EEE7",
    heroBg: "linear-gradient(160deg,#1E2C28 0%,#121815 60%,#0D1510 100%)",
    cardBg: "white",
    cardBorder: "1px solid #E6E2D8",
    textColor: "#1E2522",
    subColor: "#8F9F8F",
    accentColor: "#4F6F52",
    accentBg: "#F5F0E8",
    titleFont: "var(--font-noto-serif)",
    textSizeTitle: "text-[19px]",
    textSizeBody: "text-[13px]",
    textSizeSub: "text-[11px]",
    avatarRing: "rgba(210,160,83,0.4)",
    badgeBg: "#4F6F52",
    tabActiveBg: "#4F6F52",
    btnPadding: "py-2.5 px-4",
    itemGap: "gap-3",
    cardRadius: "rounded-2xl",
  },
  elder: {
    bg: "#FAF6F0",
    heroBg: "linear-gradient(160deg,#2D2219 0%,#1F1610 60%,#120B07 100%)",
    cardBg: "white",
    cardBorder: "2px solid #D2A053",
    textColor: "#111111",
    subColor: "#555555",
    accentColor: "#B8843A",
    accentBg: "#FFF8F0",
    titleFont: "var(--font-noto-sans)",
    textSizeTitle: "text-[24px]",
    textSizeBody: "text-[16px]",
    textSizeSub: "text-[14px]",
    avatarRing: "#D2A053",
    badgeBg: "#D2A053",
    tabActiveBg: "#D2A053",
    btnPadding: "py-3.5 px-5",
    itemGap: "gap-4",
    cardRadius: "rounded-xl",
  },
  child: {
    bg: "#FFFDF9",
    heroBg: "linear-gradient(135deg,#FF6B8B 0%,#FF8E53 100%)",
    cardBg: "white",
    cardBorder: "2px dashed #FFB0B0",
    textColor: "#2D3748",
    subColor: "#718096",
    accentColor: "#FF6B8B",
    accentBg: "#FFF0F2",
    titleFont: "var(--font-noto-serif)",
    textSizeTitle: "text-[21px]",
    textSizeBody: "text-[14px]",
    textSizeSub: "text-[11px]",
    avatarRing: "#FFE5E5",
    badgeBg: "#FF6B8B",
    tabActiveBg: "#FF6B8B",
    btnPadding: "py-3 px-4",
    itemGap: "gap-3.5",
    cardRadius: "rounded-[24px]",
  }
};

const MODE_TEXTS = {
  standard: {
    spotCountLabel: "游览景点",
    visitCountLabel: "足迹次数",
    favCountLabel: "我的收藏",
    visitsTab: "游览记录",
    favoritesTab: "我的收藏",
    emptyVisits: "还没有游览记录，快去探索吧！",
    emptyFavs: "还没有收藏，探索后随心收藏吧",
    quickQALabel: "历史问答",
    quickQASub: "查看对话记录",
    quickBadgeLabel: "我的徽章",
    quickBadgeSub: (visits: number) => `已获 ${Math.min(Math.ceil(visits/4)+1,3)} 枚`,
    quickNotifLabel: "消息通知",
    quickNotifSub: "景区最新动态",
    quickSettingLabel: "导览设置",
    quickSettingSub: "偏好与个性化",
    footerText: "翠玉文旅运营中心 · AI导览官小玉",
  },
  elder: {
    spotCountLabel: "去过的景点",
    visitCountLabel: "打卡总次数",
    favCountLabel: "保存的景点",
    visitsTab: "游览历史记录",
    favoritesTab: "我的收藏夹",
    emptyVisits: "暂时还没有去过景点，去景区转转吧！",
    emptyFavs: "还没有保存过景点，点击心形图标即可保存",
    quickQALabel: "问答历史记录",
    quickQASub: "看以前的提问",
    quickBadgeLabel: "荣誉勋章",
    quickBadgeSub: (visits: number) => `已获得 ${Math.min(Math.ceil(visits/4)+1,3)} 枚荣誉勋章`,
    quickNotifLabel: "景区公告通知",
    quickNotifSub: "看景区的最新消息",
    quickSettingLabel: "大字导览设置",
    quickSettingSub: "修改字号与声音偏好",
    footerText: "翠玉景区服务热线与管理中心 · 祝您旅途愉快",
  },
  child: {
    spotCountLabel: "探索景点 👑",
    visitCountLabel: "探险足迹 🐾",
    favCountLabel: "神奇口袋 💖",
    visitsTab: "我的冒险足迹 🐾",
    favoritesTab: "魔法口袋宝盒 🎁",
    emptyVisits: "冒险还没有开始呢，快去寻找宝藏吧！",
    emptyFavs: "魔法口袋空空的，把喜欢的景点放进来吧！",
    quickQALabel: "小玉树洞 💬",
    quickQASub: "翻看历史悄悄话",
    quickBadgeLabel: "探险家勋章 🏅",
    quickBadgeSub: (visits: number) => `已收集 ${Math.min(Math.ceil(visits/4)+1,3)} 个神奇勋章`,
    quickNotifLabel: "景区小喇叭 📢",
    quickNotifSub: "有什么好玩的活动呢",
    quickSettingLabel: "魔法口袋设置 ⚙️",
    quickSettingSub: "调大音量或者更换导游",
    footerText: "翠玉童趣大冒险乐园 · 探索更多奇妙故事",
  }
};

function getSpotInfo(id: number, mode: Mode) {
  const SPOT_NAMES: Record<number, { name: string; emoji: string }> = {
    1: { name: "揽月亭", emoji: "🏯" },
    2: { name: "翠玉湖", emoji: "🌊" },
    3: { name: "听松轩", emoji: "🌲" },
    4: { name: "百花谷", emoji: "🌸" },
    5: { name: "古窑遗址", emoji: "🏺" },
    6: { name: "溪流栈道", emoji: "🌉" },
  };
  const defaultInfo = SPOT_NAMES[id] || { name: "未知景点", emoji: "📍" };
  if (mode === "child") {
    const childNames: Record<number, { name: string; emoji: string }> = {
      1: { name: "揽月大城堡", emoji: "🏰" },
      2: { name: "绿宝石大湖", emoji: "🏄" },
      3: { name: "松鼠小松林", emoji: "🏕️" },
      4: { name: "梦幻百花谷", emoji: "🦋" },
      5: { name: "时空古窑洞", emoji: "🏺" },
      6: { name: "溪水大冒险", emoji: "🧗" },
    };
    return childNames[id] || defaultInfo;
  } else if (mode === "elder") {
    const elderNames: Record<number, { name: string; emoji: string }> = {
      1: { name: "揽月亭 (平坦步道)", emoji: "🏯" },
      2: { name: "翠玉湖 (无障碍坡道)", emoji: "🌊" },
      3: { name: "听松轩 (有歇脚茶水)", emoji: "🌲" },
      4: { name: "百花谷 (平坦无阶梯)", emoji: "🌸" },
      5: { name: "古窑遗址 (设休息长椅)", emoji: "🏺" },
      6: { name: "溪流栈道 (平缓防滑)", emoji: "🌉" },
    };
    return elderNames[id] || defaultInfo;
  }
  return defaultInfo;
}

export function ProfileScreen() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = useEazo((s: any) => s.auth.user) as { name?: string | null; username?: string | null; email?: string | null } | null;

  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [visitsExpanded, setVisitsExpanded] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteRecord[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<"visits" | "favorites">("visits");
  const [mode, setMode] = useState<Mode>("standard");
  const [showPoster, setShowPoster] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const displayName = user ? (user.name || user.username || "游客") : "未登录账号";
  const initial = user ? displayName.slice(0, 1) : "🔑";

  useEffect(() => {
    Promise.all([
      request("/api/user/visits").then(r => r.json()),
      request("/api/user/favorites").then(r => r.json()),
      request("/api/user/preferences").then(r => r.json()).catch(() => null),
    ]).then(([v, f, p]) => {
      setVisits(Array.isArray(v) ? v : []);
      setFavorites(Array.isArray(f) ? f : []);
      if (p && p.accessibilityMode) {
        const mapped = p.accessibilityMode === "normal" ? "standard" : p.accessibilityMode;
        setMode(mapped);
        localStorage.setItem("accessibility_mode", p.accessibilityMode);
        document.documentElement.setAttribute("data-accessibility-mode", p.accessibilityMode);
      } else {
        const local = localStorage.getItem("accessibility_mode") || "normal";
        setMode(local === "normal" ? "standard" : (local as Mode));
      }
      setLoadingData(false);
    }).catch(() => setLoadingData(false));
  }, [user]);

  const changeMode = async (newMode: Mode) => {
    setMode(newMode);
    const dbMode = newMode === "standard" ? "normal" : newMode;
    localStorage.setItem("accessibility_mode", dbMode);
    document.documentElement.setAttribute("data-accessibility-mode", dbMode);
    window.dispatchEvent(new Event("accessibility-mode-change"));
    
    if (user) {
      try {
        await request("/api/user/preferences", {
          method: "PUT",
          body: JSON.stringify({ accessibilityMode: dbMode })
        });
      } catch (err) {
        console.error("[changeMode] error", err);
      }
    }
  };

  const unfavorite = async (id: number) => {
    await request(`/api/user/favorites/${id}`, { method: "DELETE" });
    setFavorites(prev => prev.filter(f => f.id !== id));
    toast.success("已取消收藏");
  };

  const spotCount = new Set(visits.map(v => v.spotId).filter(Boolean)).size;
  const favCount = favorites.length;
  const totalVisits = visits.length;

  const getBadge = () => {
    if (mode === "child") {
      return totalVisits >= 10
        ? { label: "传奇冒险王", icon: "👑", color: "#FF6B8B" }
        : totalVisits >= 4
        ? { label: "勇敢探险家", icon: "⭐", color: "#FF8E53" }
        : { label: "见习小勇士", icon: "🌱", color: "#8F9F8F" };
    } else if (mode === "elder") {
      return totalVisits >= 10
        ? { label: "荣誉徐行者", icon: "🏆", color: "#D2A053" }
        : totalVisits >= 4
        ? { label: "快乐旅行家", icon: "⭐", color: "#4F6F52" }
        : { label: "新晋体验官", icon: "🌱", color: "#8F9F8F" };
    }
    return totalVisits >= 10
      ? { label: "资深探索者", icon: "🏆", color: "#D2A053" }
      : totalVisits >= 4
      ? { label: "游览达人",   icon: "⭐", color: "#4F6F52" }
      : { label: "初心游客",   icon: "🌱", color: "#8F9F8F" };
  };

  const badge = getBadge();
  const theme = THEME_STYLES[mode];
  const texts = MODE_TEXTS[mode];

  const links = [
    { icon: MessageSquare, label: texts.quickQALabel, sub: texts.quickQASub, href: "/qa", onClick: undefined, color: mode === "child" ? "#FF6B8B" : "#4F6F52", bg: mode === "child" ? "#FFF0F2" : theme.cardBg },
    { icon: Trophy, label: texts.quickBadgeLabel, sub: texts.quickBadgeSub(totalVisits), href: "/profile/history", onClick: undefined, color: mode === "child" ? "#FFA800" : "#D2A053", bg: mode === "child" ? "#FFFBF0" : theme.cardBg },
    { icon: Bell, label: texts.quickNotifLabel, sub: texts.quickNotifSub, href: null, onClick: () => setShowNotifications(true), color: mode === "child" ? "#4ECE8C" : "#8FBF8A", bg: mode === "child" ? "#F0FCF5" : theme.cardBg },
    { icon: Settings, label: texts.quickSettingLabel, sub: texts.quickSettingSub, href: "/ai-settings", onClick: undefined, color: mode === "child" ? "#4D96FF" : "#8F9F8F", bg: mode === "child" ? "#F0F5FF" : theme.cardBg },
  ];

  return (
    <div className="min-h-svh transition-colors duration-300" style={{ background: theme.bg }}>

      {/* ── Hero header ── */}
      <div className="relative overflow-hidden transition-all duration-300"
        style={{
          background: theme.heroBg,
          paddingTop: "calc(env(safe-area-inset-top,44px) + 12px)",
          paddingBottom: 32,
        }}>

        {/* ambient glows */}
        {mode !== "child" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute rounded-full"
              style={{ width: 300, height: 300, top: -100, left: "50%", transform: "translateX(-50%)",
                background: "radial-gradient(circle,rgba(210,160,83,0.14) 0%,transparent 65%)" }} />
            <div className="absolute rounded-full"
              style={{ width: 200, height: 200, bottom: -40, right: -20,
                background: "radial-gradient(circle,rgba(79,111,82,0.1) 0%,transparent 65%)" }} />
          </div>
        )}
        {mode === "child" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute rounded-full bg-white/10 w-16 h-16 top-10 left-8 blur-[1px] animate-bounce" style={{ animationDuration: "3s" }} />
            <div className="absolute rounded-full bg-white/10 w-24 h-24 bottom-6 right-10 blur-[1px] animate-bounce" style={{ animationDuration: "5s" }} />
            <div className="absolute rounded-full bg-white/5 w-12 h-12 top-4 right-1/4 blur-[1px] animate-pulse" />
          </div>
        )}

        <div className="relative px-5 md:max-w-2xl md:mx-auto">
          {/* Top row: name + settings */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3.5">
              {/* Avatar */}
              <div className="relative">
                <div className="w-[68px] h-[68px] rounded-2xl flex items-center justify-center text-2xl font-black transition-all"
                  style={{
                    background: mode === "child" 
                      ? "linear-gradient(135deg,#FF8E53 0%,#FF6B8B 100%)" 
                      : "linear-gradient(135deg,#4F6F52 0%,#D2A053 100%)",
                    fontFamily: theme.titleFont, color: "white",
                    boxShadow: `0 0 0 3px ${theme.avatarRing}, 0 6px 24px rgba(0,0,0,0.2)`,
                  }}>
                  {initial}
                </div>
                {/* badge pill */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap"
                  style={{ background: badge.color, color: "white", border: "1.5px solid rgba(255,255,255,0.25)" }}>
                  {badge.icon} {badge.label}
                </div>
              </div>
              <div className="pt-1">
                <p className={`font-bold text-white leading-tight ${theme.textSizeTitle}`}
                  style={{ fontFamily: theme.titleFont }}>{displayName}</p>
                {!user ? (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { window.location.href = "/login"; }}
                    className="mt-2 px-3 py-1 rounded-full text-[10px] font-black text-white shadow-md cursor-pointer flex items-center gap-1"
                    style={{
                      background: "linear-gradient(135deg, #D2A053 0%, #B8843A 100%)",
                    }}
                  >
                    立即登录 <ArrowRight className="w-2.5 h-2.5" />
                  </motion.button>
                ) : (
                  <p className="text-[11px] mt-1.5" style={{ color: mode === "child" ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.4)" }}>
                    {user?.email || "旅行吧游客"}
                  </p>
                )}
              </div>
            </div>
            <Link href="/ai-settings">
              <motion.div whileTap={{ scale: 0.88 }}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.08)" }}>
                <Settings className="w-4 h-4" style={{ color: "rgba(255,255,255,0.5)" }} />
              </motion.div>
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { v: spotCount,   label: texts.spotCountLabel, icon: MapPin,   color: mode === "child" ? "#FFE699" : "#8FBF8A" },
              { v: totalVisits, label: texts.visitCountLabel, icon: Clock,    color: mode === "child" ? "#FFC47E" : "#D2A053" },
              { v: favCount,    label: texts.favCountLabel, icon: Heart,    color: mode === "child" ? "#FF9E9E" : "#E87878" },
            ].map(stat => (
              <div key={stat.label} className="rounded-2xl py-3 text-center transition-all"
                style={{ 
                  background: mode === "child" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.07)", 
                  border: mode === "child" ? "1px solid rgba(255,255,255,0.25)" : "1px solid rgba(255,255,255,0.1)" 
                }}>
                <stat.icon className="w-4 h-4 mx-auto mb-1"
                  fill={stat.color} style={{ color: stat.color }} />
                <p className={`font-black text-white leading-none ${mode === "elder" ? "text-[28px]" : "text-[22px]"}`}
                  style={{ fontFamily: theme.titleFont }}>{stat.v}</p>
                <p className={`mt-1 ${mode === "elder" ? "text-[12px]" : "text-[9px]"}`} style={{ color: mode === "child" ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.38)" }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={async () => {
                if (!user) {
                  toast.error("请先登录账号以分享游览足迹");
                  return;
                }
                try {
                  const { share } = await import("@eazo/sdk");
                  await share.compose({ text: `我在旅行吧游览了 ${spotCount} 处景点！` });
                } catch { toast.info("分享功能暂不可用"); }
              }}
              className={`flex items-center justify-center gap-2 rounded-xl font-semibold transition-all ${theme.textSizeSub} ${theme.btnPadding} cursor-pointer`}
              style={{ 
                background: mode === "child" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.09)", 
                border: mode === "child" ? "1px solid rgba(255,255,255,0.3)" : "1px solid rgba(255,255,255,0.14)", 
                color: "white" 
              }}>
              <Share2 className="w-3.5 h-3.5" />分享游览足迹
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (!user) {
                  toast.error("请先登录账号以生成打卡海报");
                  return;
                }
                setShowPoster(true);
              }}
              className={`flex items-center justify-center gap-2 rounded-xl font-semibold transition-all ${theme.textSizeSub} ${theme.btnPadding} cursor-pointer`}
              style={{ 
                background: mode === "child" ? "#FFFFFF" : "rgba(210,160,83,0.18)", 
                border: mode === "child" ? "1px solid #FFE5E5" : "1px solid rgba(210,160,83,0.38)", 
                color: mode === "child" ? "#FF6B8B" : "#D2A053" 
              }}>
              <ImageIcon className="w-3.5 h-3.5" />生成打卡海报
            </motion.button>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: 20 }}>
          <svg viewBox="0 0 400 20" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,20 Q100,0 200,10 T400,0 L400,20 Z" fill={theme.bg} style={{ transition: "fill 300ms" }} />
          </svg>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-4 pb-8 mt-2 space-y-4 md:max-w-2xl md:mx-auto">

        {/* Mode switcher card */}
        <div className={`${theme.cardRadius} p-4 transition-all duration-300`} style={{ background: theme.cardBg, border: theme.cardBorder }}>
          <p className="text-[11px] font-semibold mb-3 tracking-wide uppercase"
            style={{ color: theme.subColor }}>导览模式</p>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(MODE_CONFIG) as [Mode, typeof MODE_CONFIG[Mode]][]).map(([k, cfg]) => (
              <motion.button key={k} whileTap={{ scale: 0.93 }} onClick={() => changeMode(k)}
                className={`flex flex-col items-center gap-1.5 py-3 ${theme.cardRadius} transition-colors`}
                style={{
                  background: mode === k ? `${cfg.color}14` : "#F5F0E8",
                  border: `1.5px solid ${mode === k ? cfg.color : "transparent"}`,
                }}>
                <cfg.icon className="w-4 h-4" style={{ color: cfg.color }} />
                <p className={`${theme.textSizeSub} font-bold`}
                  style={{ color: mode === k ? cfg.color : "#8F9F8F" }}>{cfg.label}</p>
                <p className="text-[9px]" style={{ color: "#B8B4AC" }}>{cfg.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* History / Favorites tabs */}
        <div className={`${theme.cardRadius} overflow-hidden transition-all duration-300`} style={{ background: theme.cardBg, border: theme.cardBorder }}>
          {/* Tab bar */}
          <div className="grid grid-cols-2 relative" style={{ borderBottom: "1px solid #F0EDE5" }}>
            {(["visits", "favorites"] as const).map(tab => (
              <motion.button key={tab} whileTap={{ scale: 0.97 }} onClick={() => setActiveTab(tab)}
                className={`py-3.5 font-bold relative flex items-center justify-center gap-1.5 ${theme.textSizeBody}`}
                style={{ color: activeTab === tab ? theme.accentColor : "#B8B4AC" }}>
                {tab === "visits"
                  ? <><History className="w-3.5 h-3.5" />{texts.visitsTab} ({totalVisits})</>
                  : <><Heart className="w-3.5 h-3.5" />{texts.favoritesTab} ({favCount})</>}
                {activeTab === tab && (
                  <motion.div layoutId="profile-tab-line"
                    className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
                    style={{ background: theme.accentColor }} />
                )}
              </motion.button>
            ))}
          </div>

          {/* Content */}
          <div style={{ minHeight: 180 }}>
            {loadingData ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {activeTab === "visits" ? (
                  <motion.div key="v" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }} transition={SPRING}>
                    {visits.length === 0
                      ? <EmptyState icon="🗺️" text={texts.emptyVisits} />
                      : (
                        <div className="divide-y" style={{ borderColor: "#F5F2EC" }}>
                          {(visitsExpanded ? visits.slice(0, 10) : visits.slice(0, 2)).map((v, i) => {
                            const info = v.spotId ? getSpotInfo(v.spotId, mode) : null;
                            return (
                              <motion.div key={v.id}
                                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ ...SPRING, delay: i * 0.03 }}
                                className="flex items-center gap-3 px-4 py-3">
                                <div className={`w-10 h-10 ${theme.cardRadius} flex items-center justify-center text-xl flex-shrink-0`}
                                  style={{ 
                                    background: mode === "child" ? "#FFF0F2" : mode === "elder" ? "#FFF8F0" : "#F5F0E8",
                                    border: mode === "child" ? "1px dashed #FFB0B0" : mode === "elder" ? "1px solid #D2A053" : "none"
                                  }}>
                                  {info?.emoji ?? "📍"}
                                  </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`font-bold truncate ${theme.textSizeBody}`} style={{ color: theme.textColor }}>
                                    {info?.name ?? (v.routeId ? "游览路线" : "景区参观")}
                                  </p>
                                  <p className={`mt-0.5 ${theme.textSizeSub}`} style={{ color: theme.subColor }}>
                                    {new Date(v.visitedAt).toLocaleDateString("zh-CN",{ month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })}
                                  </p>
                                </div>
                                {v.spotId && (
                                  <Link href={`/spots/${v.spotId}`}>
                                    <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "#E6E2D8" }} />
                                  </Link>
                                )}
                              </motion.div>
                            );
                          })}
                          {visits.length > 2 && (
                            <button
                              onClick={() => setVisitsExpanded(!visitsExpanded)}
                              className="w-full py-3 text-center text-xs font-bold transition-colors hover:bg-neutral-50/50 flex items-center justify-center gap-1"
                              style={{ color: theme.accentColor, borderTop: "1px solid #F5F2EC" }}
                            >
                              {visitsExpanded ? "收起游览记录 ↑" : `展开更多记录 (共 ${visits.length} 条) ↓`}
                            </button>
                          )}
                          {visits.length > 10 && visitsExpanded && (
                            <Link href="/profile/history">
                              <div className="px-4 py-3 text-center font-bold" style={{ color: theme.accentColor, fontSize: mode === "elder" ? 15 : 12 }}>
                                查看全部 {visits.length} 条 →
                              </div>
                            </Link>
                          )}
                        </div>
                      )}
                  </motion.div>
                ) : (
                  <motion.div key="f" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }} transition={SPRING}>
                    {favorites.length === 0
                      ? <EmptyState icon="💛" text={texts.emptyFavs} />
                      : (
                        <div className="divide-y" style={{ borderColor: "#F5F2EC" }}>
                          {favorites.map((fav, i) => {
                            const info = fav.spotId ? getSpotInfo(fav.spotId, mode) : null;
                            const displayName = fav.spotName || fav.routeName || info?.name || "收藏景点";
                            return (
                              <motion.div key={fav.id}
                                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ ...SPRING, delay: i * 0.03 }}
                                className="flex items-center gap-3 px-4 py-3">
                                <div className={`w-10 h-10 ${theme.cardRadius} flex items-center justify-center text-xl flex-shrink-0`}
                                  style={{ 
                                    background: mode === "child" ? "#FFE5E5" : "#FEF3F3",
                                    border: mode === "child" ? "1px dashed #FFB0B0" : "none"
                                  }}>
                                  {info?.emoji ?? (fav.type === "route" ? "🗺️" : "📍")}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`font-bold truncate ${theme.textSizeBody}`} style={{ color: theme.textColor }}>
                                    {displayName}
                                  </p>
                                  <p className={`mt-0.5 ${theme.textSizeSub}`} style={{ color: theme.subColor }}>已收藏</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {fav.spotId && (
                                    <Link href={`/spots/${fav.spotId}`}>
                                      <motion.span whileTap={{ scale: 0.9 }}
                                        className="px-3 py-1.5 rounded-lg font-bold block"
                                        style={{ background: theme.accentBg, color: theme.accentColor, fontSize: mode === "elder" ? 14 : 11 }}>
                                        查看
                                      </motion.span>
                                    </Link>
                                  )}
                                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => unfavorite(fav.id)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ background: "rgba(220,38,38,0.07)", color: "#DC2626" }}>
                                    <Heart className="w-3.5 h-3.5" fill="#DC2626" />
                                  </motion.button>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Quick link grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {links.map(item => (
            <motion.div key={item.label} whileTap={{ scale: 0.96 }}
              onClick={item.onClick}
              className={`${theme.cardRadius} p-4 cursor-pointer transition-all duration-300`}
              style={{ background: item.bg, border: theme.cardBorder }}>
              {item.href ? (
                <Link href={item.href}>
                  <QuickItem item={item} theme={theme} />
                </Link>
              ) : <QuickItem item={item} theme={theme} />}
            </motion.div>
          ))}
        </div>

        {/* Sign Out Action Card */}
        {user && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={async () => {
              try {
                await auth.logout();
                toast.success("已成功退出登录");
                window.location.href = "/welcome";
              } catch (err: any) {
                toast.error(err?.message || "退出登录失败");
              }
            }}
            className="w-full py-3.5 rounded-2xl text-xs font-bold text-center transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            style={{ 
              background: "rgba(220,38,38,0.06)", 
              border: "1px solid rgba(220,38,38,0.18)",
              color: "#DC2626"
            }}
          >
            <LogOut className="w-3.5 h-3.5" /> 退出当前登录
          </motion.button>
        )}

        <p className="text-center text-[10px] py-2" style={{ color: "#C0BAB0" }}>
          {texts.footerText}
        </p>
      </div>

      {/* Poster */}
      <AnimatePresence>
        {showPoster && (
          <PosterGenerator
            data={{
              userName: displayName,
              spotsVisited: spotCount,
              favoriteSpot: favorites[0] ? (getSpotInfo(favorites[0].spotId ?? 0, mode).name) : "揽月亭",
              date: new Date().toLocaleDateString("zh-CN"),
              badge: `${badge.icon} ${badge.label}`,
            }}
            onClose={() => setShowPoster(false)}
          />
        )}
      </AnimatePresence>

      {/* Notifications Modal */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowNotifications(false)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              transition={SPRING}
              className="w-full max-w-md bg-[#FAF8F5] rounded-3xl border border-[#E6E2D8] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#E6E2D8]"
                style={{ background: theme.accentBg }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${theme.accentColor}20`, color: theme.accentColor }}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-[#1E2522]" style={{ fontFamily: "var(--font-noto-serif)" }}>
                    {texts.quickNotifLabel}
                  </h3>
                </div>
                <button onClick={() => setShowNotifications(false)} className="text-[#8F9F8F] hover:text-[#1E2522] transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {[
                  { title: "旅行吧智慧系统版本升级", time: "10分钟前", detail: "已全面更新至 1.2.0 版本。全新引入 3D 拟真对谈数字人与智能避堵路线规划系统，让每一次出游更加得心应手。", type: "update" },
                  { title: "今日景区游览与气象指南", time: "2小时前", detail: "今日气温 22℃-28℃，微风，紫外线强度中等。部分路段正在进行防滑绿化作业，请游客朋友在溪流栈道行走时注意慢行。", type: "info" },
                  { title: "揽月亭落日集章特惠活动", time: "5小时前", detail: "今天下午 16:30 至 18:30，在揽月亭与 AI 数字人成功开启对话并上传任意落日合影，即可至服务中心兑换景区定制版精美古风徽章一枚！数量有限，先到先得。", type: "promo" }
                ].map((notif, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-[#E6E2D8] bg-white space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                        style={{ 
                          background: notif.type === "update" ? "rgba(77,150,255,0.1)" : notif.type === "info" ? "rgba(79,111,82,0.1)" : "rgba(210,160,83,0.1)",
                          color: notif.type === "update" ? "#4D96FF" : notif.type === "info" ? "#4F6F52" : "#D2A053"
                        }}>
                        {notif.type === "update" ? "系统更新" : notif.type === "info" ? "景区广播" : "活动特惠"}
                      </span>
                      <span className="text-[9px] text-[#B8B4AC] font-mono">{notif.time}</span>
                    </div>
                    <h4 className="text-xs font-bold text-[#1E2522]" style={{ fontFamily: "var(--font-noto-serif)" }}>{notif.title}</h4>
                    <p className="text-[11px] leading-relaxed text-[#8F9F8F]">{notif.detail}</p>
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-[#FAF8F5] border-t border-[#E6E2D8] text-center">
                <button onClick={() => setShowNotifications(false)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer"
                  style={{ background: theme.accentColor }}>
                  我已了解
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuickItem({ item, theme }: {
  item: { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; label: string; sub: string; color: string };
  theme: typeof THEME_STYLES[Mode];
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${item.color}14` }}>
        <item.icon className="w-4 h-4" style={{ color: item.color }} />
      </div>
      <div>
        <p className={`font-semibold ${theme.textSizeBody}`} style={{ color: theme.textColor }}>{item.label}</p>
        <p className={`mt-0.5 ${theme.textSizeSub}`} style={{ color: theme.subColor }}>{item.sub}</p>
      </div>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="py-12 text-center">
      <p className="text-4xl mb-3">{icon}</p>
      <p className="text-sm" style={{ color: "#8F9F8F" }}>{text}</p>
    </div>
  );
}
