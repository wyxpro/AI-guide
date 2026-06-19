"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Heart, Clock, Settings, MessageSquare,
  Share2, Image as ImageIcon, ChevronRight, ChevronLeft, ChevronDown,
  History, Trophy, Bell, Sun, Zap, Baby, ArrowRight, LogOut, X,
  Shield, Eye, BookOpen, Volume2, Trash2, HelpCircle, Info, Sparkles, Map, User, Navigation
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

// Sub-views tabs
type ActiveSection = "home" | "routes" | "favorites" | "interests" | "settings";

export function ProfileScreen() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = useEazo((s: any) => s.auth.user) as { name?: string | null; username?: string | null; email?: string | null } | null;

  const [activeSection, setActiveSection] = useState<ActiveSection>("home");
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [favorites, setFavorites] = useState<FavoriteRecord[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [mode, setMode] = useState<Mode>("standard");
  const [showPoster, setShowPoster] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // States for sub-views
  const [routeTab, setRouteTab] = useState<"ongoing" | "completed" | "cancelled">("ongoing");
  const [favoriteTag, setFavoriteTag] = useState<"all" | "spot" | "relic" | "route" | "audio">("all");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["history", "nature", "architecture"]);
  const [cacheSize, setCacheSize] = useState("23.6MB");

  // Local profile states
  const [profileName, setProfileName] = useState("游客小玉");
  const [profileLevel, setProfileLevel] = useState("Lv.5 问鼎江山");
  const [profileAvatar, setProfileAvatar] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80");
  const [profileBio, setProfileBio] = useState("用双脚丈量世界，用声音感受历史。");
  const [profileGender, setProfileGender] = useState("女");
  const [profileRegion, setProfileRegion] = useState("四川 成都");

  // Edit states for form fields
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editLevel, setEditLevel] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editRegion, setEditRegion] = useState("");

  const displayName = profileName;
  const initial = displayName.slice(0, 1);

  // Sync profile values with local storage and user info on mount/change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("profile_name") || (user ? (user.name || user.username || "游客小玉") : "游客小玉");
      const storedLevel = localStorage.getItem("profile_level") || "Lv.5 问鼎江山";
      const storedAvatar = localStorage.getItem("profile_avatar") || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80";
      const storedBio = localStorage.getItem("profile_bio") || "用双脚丈量世界，用声音感受历史。";
      const storedGender = localStorage.getItem("profile_gender") || "女";
      const storedRegion = localStorage.getItem("profile_region") || "四川 成都";

      setProfileName(storedName);
      setProfileLevel(storedLevel);
      setProfileAvatar(storedAvatar);
      setProfileBio(storedBio);
      setProfileGender(storedGender);
      setProfileRegion(storedRegion);
    }
  }, [user]);

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

  // Clear cache action
  const handleClearCache = () => {
    setCacheSize("0.0MB");
    toast.success("本地缓存已成功清除");
  };

  // Switch Interest Tag
  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(prev => prev.filter(item => item !== id));
    } else {
      setSelectedInterests(prev => [...prev, id]);
    }
  };

  return (
    <div className="min-h-svh bg-[#F4F7F5] pb-24 md:pb-12 text-[#2C3E35]">

      {/* ── Main Viewport Wrapper ── */}
      <div className="w-full max-w-[1280px] lg:mx-0 lg:pl-12 px-0 md:px-6 py-0 md:py-8 flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Desktop Sidebar (Hidden on Mobile) ── */}
        <aside className="hidden lg:block w-[220px] lg:ml-20 flex-shrink-0 bg-white rounded-[24px] border border-[#E2EAE5] p-6 shadow-sm h-fit">
          <div className="flex items-center gap-3.5 mb-8">
            <img
              src={profileAvatar}
              className="w-14 h-14 rounded-2xl border-2 border-white shadow-md object-cover flex-shrink-0"
              alt="Avatar"
            />
            <div>
              <h3 className="font-black text-base leading-tight">{displayName}</h3>
              <p className="text-[11px] text-[#8F9F8F] mt-1">{profileLevel} | 9步电</p>
            </div>
          </div>

          {/* Nav list */}
          <nav className="space-y-1">
            {[
              { id: "home", label: "01 我的首页", icon: User },
              { id: "routes", label: "02 我的行程", icon: Map },
              { id: "favorites", label: "03 我的收藏", icon: Heart },
              { id: "interests", label: "04 我的兴趣", icon: Sparkles },
              { id: "settings", label: "05 设置与帮助", icon: Settings },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as ActiveSection)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[13px] font-bold transition-all ${activeSection === item.id
                  ? "bg-[#EBF3EE] text-[#4F6F52]"
                  : "text-zinc-600 hover:bg-zinc-50"
                  }`}
              >
                <item.icon className={`w-4 h-4 ${activeSection === item.id ? "text-[#4F6F52]" : "text-zinc-400"}`} />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Main Content Area ── */}
        <main className="flex-1 w-full min-h-[600px]">
          <AnimatePresence mode="wait">

            {/* ═══════════════════════════════════════════════════════
               01. 我的首页 (My Homepage)
               ═══════════════════════════════════════════════════════ */}
            {activeSection === "home" && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={SPRING}
                className="bg-white lg:rounded-[24px] lg:border lg:border-[#E2EAE5] lg:shadow-sm overflow-hidden"
              >
                {/* Banner & User profile header */}
                <div
                  className="relative h-[230px] p-6 flex flex-col justify-between"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=1200&q=80')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-white bg-black/40 px-2 py-0.5 rounded-full border border-white/15 backdrop-blur-sm">
                      游客中心
                    </span>
                    <button
                      onClick={() => {
                        setEditName(profileName);
                        setEditLevel(profileLevel);
                        setEditAvatar(profileAvatar);
                        setEditBio(profileBio);
                        setEditGender(profileGender);
                        setEditRegion(profileRegion);
                        setShowEditProfile(true);
                      }}
                      className="text-[10px] font-black text-[#4F6F52] bg-white px-3 py-1 rounded-full shadow-md cursor-pointer hover:bg-neutral-50 transition-colors"
                    >
                      编辑资料
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white w-full">
                    <div className="flex flex-wrap items-center justify-between gap-4 w-full">
                      <div className="flex items-center gap-4 min-w-0">
                        <img
                          src={profileAvatar}
                          className="w-16 h-16 rounded-full border-2 border-white/60 object-cover shadow-lg flex-shrink-0"
                          alt="User Avatar"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg font-black">{displayName}</h2>
                            <span className="text-[9px] font-extrabold bg-[#D2A053] text-white px-1.5 py-0.5 rounded-md flex-shrink-0">{profileLevel}</span>
                          </div>
                          <p className="text-[10px] text-white/70 mt-1 flex items-center gap-1">
                            <span>⚡ 9 步电</span>
                            <span>|</span>
                            <span>📍 {profileRegion}</span>
                          </p>
                        </div>
                      </div>

                      {/* Redesigned Experience Mode Toggle Switcher - Moved to the right */}
                      <div className="bg-white/15 backdrop-blur-md border border-white/20 p-1 rounded-2xl flex items-center gap-1 shadow-inner flex-shrink-0">
                        {(["standard", "elder", "child"] as Mode[]).map(m => (
                          <button
                            key={m}
                            onClick={() => changeMode(m)}
                            className={`text-[11px] md:text-[12px] font-black px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${mode === m
                              ? "bg-white text-[#4F6F52] shadow-sm scale-105"
                              : "text-white/80 hover:text-white hover:bg-white/5"
                              }`}
                          >
                            {m === "standard" ? "标准" : m === "elder" ? "适老" : "童趣"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Body */}
                <div className="p-4 sm:p-6 space-y-6">
                  {/* AI Banner top (Moved from bottom) */}
                  <div className="bg-gradient-to-br from-[#EEF7F2] to-[#E5F1EB] rounded-3xl p-5 border border-[#D5EDE0] flex items-center justify-between relative overflow-hidden shadow-sm">
                    <div className="space-y-2.5 relative z-10 max-w-[65%]">
                      <span className="text-[9px] font-extrabold text-white bg-[#4F6F52] px-2 py-0.5 rounded-full inline-block shadow-sm">
                        AI 数字人导游
                      </span>
                      <h4 className="text-xs font-black text-zinc-800 leading-tight">随时为您提供智能讲解与路线推荐</h4>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push("/qa")}
                          className="px-3.5 py-1.5 bg-[#4F6F52] text-white text-[10px] font-black rounded-lg shadow-sm hover:bg-[#3D5640] transition-colors cursor-pointer"
                        >
                          去对话
                        </button>
                        <button
                          onClick={() => router.push("/qa")}
                          className="px-3.5 py-1.5 bg-white text-[#4F6F52] border border-[#D5EDE0] text-[10px] font-black rounded-lg shadow-sm hover:bg-neutral-50 transition-colors cursor-pointer"
                        >
                          去问答
                        </button>
                      </div>
                    </div>
                    <img
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80"
                      className="absolute right-3 bottom-0 w-24 h-24 object-cover object-top rounded-t-full mask-image border-b-0 border border-white/20"
                      alt=""
                    />
                  </div>



                  {/* 4 Quick Entry Cards */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { label: "我的行程", color: "bg-[#EBF3EE] text-[#4F6F52]", icon: Map, action: () => setActiveSection("routes") },
                      { label: "我的收藏", color: "bg-[#FFF0ED] text-[#FF5B45]", icon: Heart, action: () => setActiveSection("favorites") },
                      { label: "我的兴趣", color: "bg-[#FCF8EE] text-[#D2A053]", icon: Sparkles, action: () => setActiveSection("interests") },
                      { label: "我的消息", color: "bg-[#F0F5FF] text-[#4D96FF]", icon: Bell, action: () => setShowNotifications(true), badge: 3 },
                    ].map((btn, index) => (
                      <motion.div
                        key={index}
                        whileTap={{ scale: 0.94 }}
                        onClick={btn.action}
                        className="flex flex-col items-center cursor-pointer group"
                      >
                        <div className={`w-12 h-12 rounded-2xl ${btn.color} flex items-center justify-center relative shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                          <btn.icon className="w-5 h-5" />
                          {btn.badge && (
                            <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                              {btn.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[10.5px] font-bold text-zinc-700 mt-2">{btn.label}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Recently Viewed (最近浏览) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black flex items-center gap-1.5">
                        <History className="w-4 h-4 text-[#4F6F52]" />
                        最近浏览
                      </h3>
                      <button
                        onClick={() => setActiveSection("favorites")}
                        className="text-[10px] font-bold text-zinc-400 hover:text-zinc-600 transition-colors"
                      >
                        全部 &gt;
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        { name: "岳阳楼", time: "今天 10:32", desc: "江南三大名楼之一", img: "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=300&q=80", label: "景点" },
                        { name: "商后母戊鼎", time: "昨天 18:40", desc: "中国国家博物馆藏", img: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=300&q=80", label: "文物" },
                        { name: "黄鹤楼", time: "09-15 15:30", desc: "天下江山第一楼", img: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&q=80", label: "景点" },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-3.5 p-3 rounded-2xl border border-[#EEF2F0] hover:bg-neutral-50 transition-colors">
                          <img src={item.img} className="w-11 h-11 rounded-xl object-cover shadow-sm flex-shrink-0" alt="" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-[12.5px] truncate">{item.name}</span>
                              <span className="text-[8.5px] text-zinc-400 bg-zinc-100 px-1 py-0.5 rounded">{item.label}</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 truncate mt-0.5">{item.desc}</p>
                          </div>
                          <span className="text-[9.5px] font-mono text-zinc-300 flex-shrink-0">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════
               02. 我的行程 (My Itinerary)
               ═══════════════════════════════════════════════════════ */}
            {activeSection === "routes" && (
              <motion.div
                key="routes"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={SPRING}
                className="bg-white lg:rounded-[24px] lg:border lg:border-[#E2EAE5] lg:shadow-sm overflow-hidden"
              >
                {/* Header view */}
                <div className="px-6 py-5 border-b border-[#EEF2F0] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setActiveSection("home")}
                      className="lg:hidden p-1.5 hover:bg-neutral-50 rounded-lg"
                    >
                      <ChevronLeft className="w-5 h-5 text-zinc-600" />
                    </button>
                    <h2 className="text-sm font-black flex items-center gap-1.5">
                      <Map className="w-4.5 h-4.5 text-[#4F6F52]" />
                      我的行程
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowPoster(true)}
                    className="text-[10.5px] font-black text-[#4F6F52] bg-[#EBF3EE] px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm cursor-pointer hover:bg-[#DBEAE0] transition-colors"
                  >
                    <ImageIcon className="w-3 h-3" />
                    生成海报
                  </button>
                </div>

                {/* Sub Tab bar */}
                <div className="flex border-b border-[#EEF2F0] bg-zinc-50/50">
                  {[
                    { id: "ongoing", label: "进行中" },
                    { id: "completed", label: "已完成" },
                    { id: "cancelled", label: "已取消" },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setRouteTab(tab.id as any)}
                      className={`flex-1 text-center py-3.5 text-xs font-bold relative transition-colors ${routeTab === tab.id ? "text-[#4F6F52]" : "text-zinc-400 hover:text-zinc-600"
                        }`}
                    >
                      {tab.label}
                      {routeTab === tab.id && (
                        <motion.div
                          layoutId="route-tab-border"
                          className="absolute bottom-0 left-6 right-6 h-0.5 bg-[#4F6F52] rounded-full"
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Routes Cards List */}
                <div className="p-4 sm:p-6 space-y-5">
                  {[
                    {
                      title: "岳阳楼一日游",
                      date: "2024.05.20 周一",
                      status: "ongoing",
                      img: "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=600&q=80",
                    },
                    {
                      title: "历史文化之旅",
                      date: "2024.05.15 周六",
                      status: "completed",
                      img: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600&q=80",
                    },
                    {
                      title: "自然风光之旅",
                      date: "2024.05.10 周五",
                      status: "cancelled",
                      img: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80",
                    },
                  ].filter(r => r.status === routeTab).map((route, idx) => (
                    <div key={idx} className="rounded-3xl border border-[#EEF2F0] bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="relative h-[160px]">
                        <img src={route.img} className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4 text-white">
                          <h4 className="text-sm font-black">{route.title}</h4>
                          <p className="text-[10px] text-white/70 mt-1 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {route.date}
                          </p>
                        </div>
                      </div>

                      {/* Control row */}
                      <div className="grid grid-cols-3 divide-x divide-[#EEF2F0] border-t border-[#EEF2F0] text-center bg-zinc-50/50">
                        <button
                          onClick={() => router.push("/routes")}
                          className="py-3 text-[11px] font-bold text-zinc-600 hover:text-[#4F6F52] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          路线地图
                        </button>
                        <button
                          onClick={() => router.push("/routes")}
                          className="py-3 text-[11px] font-bold text-zinc-600 hover:text-[#4F6F52] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          跟走导览
                        </button>
                        <button
                          onClick={() => toast.success("行程分享链接已复制到剪贴板！")}
                          className="py-3 text-[11px] font-bold text-zinc-600 hover:text-[#4F6F52] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          行程分享
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Empty state fallback */}
                  {routeTab === "cancelled" && (
                    <div className="py-12 text-center text-zinc-400 space-y-2">
                      <div className="text-4xl">📭</div>
                      <p className="text-xs">暂无已取消的行程计划</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════
               03. 我的收藏 (My Favorites)
               ═══════════════════════════════════════════════════════ */}
            {activeSection === "favorites" && (
              <motion.div
                key="favorites"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={SPRING}
                className="bg-white lg:rounded-[24px] lg:border lg:border-[#E2EAE5] lg:shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div className="px-6 py-5 border-b border-[#EEF2F0] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setActiveSection("home")}
                      className="lg:hidden p-1.5 hover:bg-neutral-50 rounded-lg"
                    >
                      <ChevronLeft className="w-5 h-5 text-zinc-600" />
                    </button>
                    <h2 className="text-sm font-black flex items-center gap-1.5">
                      <Heart className="w-4.5 h-4.5 text-[#FF5B45]" />
                      我的收藏
                    </h2>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400">已选 {favorites.length} 项</span>
                </div>

                {/* Filter tag list */}
                <div className="flex gap-1.5 px-4 py-3 border-b border-[#EEF2F0] overflow-x-auto select-none no-scrollbar">
                  {[
                    { id: "all", label: "全部" },
                    { id: "spot", label: "景点" },
                    { id: "relic", label: "文物" },
                    { id: "route", label: "路线" },
                    { id: "audio", label: "讲解" },
                  ].map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => setFavoriteTag(tag.id as any)}
                      className={`text-[10.5px] font-bold px-3.5 py-1.5 rounded-full transition-colors flex-shrink-0 cursor-pointer ${favoriteTag === tag.id
                        ? "bg-[#4F6F52] text-white"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                        }`}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>

                {/* Favorite cards list */}
                <div className="p-4 sm:p-6 space-y-3">
                  {[
                    { id: 1, type: "relic", name: "商后母戊鼎", desc: "中国国家博物馆藏，商代晚期青铜重器...", date: "2024.06.18 收藏", img: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=300&q=80" },
                    { id: 2, type: "spot", name: "岳阳楼", desc: "江南三大名楼之一，登楼远眺，气象万千...", date: "2024.05.20 收藏", img: "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=300&q=80" },
                    { id: 3, type: "spot", name: "黄鹤楼", desc: "天下江山第一楼，武汉地标古迹建筑...", date: "2024.05.15 收藏", img: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&q=80" },
                    { id: 4, type: "route", name: "历史文化路线", desc: "探寻千年巴渝文化，感受红岩精神底蕴...", date: "2024.05.10 收藏", img: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=300&q=80" },
                    { id: 5, type: "audio", name: "瓷器发展史讲解", desc: "从原始陶器到青花瓷器演变历程的沉浸声景...", date: "2024.05.08 收藏", img: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=300&q=80" },
                  ].filter(item => favoriteTag === "all" || item.type === favoriteTag).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3.5 p-3 rounded-2xl border border-[#EEF2F0] hover:bg-neutral-50 transition-colors">
                      <img src={item.img} className="w-16 h-16 rounded-xl object-cover shadow-sm flex-shrink-0" alt="" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[13px] truncate">{item.name}</span>
                          <span className="text-[8.5px] text-zinc-400 bg-zinc-100 px-1 py-0.5 rounded">
                            {item.type === "relic" ? "文物" : item.type === "spot" ? "景点" : item.type === "route" ? "路线" : "讲解"}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 truncate mt-0.5">{item.desc}</p>
                        <span className="text-[9px] text-zinc-300 mt-1 block">{item.date}</span>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            if (item.type === "spot") router.push(`/spots/1`);
                            else router.push(`/routes`);
                          }}
                          className="px-2.5 py-1 text-[10px] font-black text-white bg-[#4F6F52] rounded-lg shadow-sm cursor-pointer hover:bg-[#3D5640] transition-colors"
                        >
                          查看
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toast.success("已取消收藏")}
                          className="w-7 h-7 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors cursor-pointer"
                        >
                          <Heart className="w-3.5 h-3.5" fill="#EF4444" stroke="#EF4444" />
                        </motion.button>
                      </div>
                    </div>
                  ))}

                  <div className="text-center py-6 text-zinc-300 text-[10.5px]">
                    没有更多了
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════
               04. 我的兴趣 (My Interests)
               ═══════════════════════════════════════════════════════ */}
            {activeSection === "interests" && (
              <motion.div
                key="interests"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={SPRING}
                className="bg-white lg:rounded-[24px] lg:border lg:border-[#E2EAE5] lg:shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div className="px-6 py-5 border-b border-[#EEF2F0] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setActiveSection("home")}
                      className="lg:hidden p-1.5 hover:bg-neutral-50 rounded-lg"
                    >
                      <ChevronLeft className="w-5 h-5 text-zinc-600" />
                    </button>
                    <h2 className="text-sm font-black flex items-center gap-1.5">
                      <Sparkles className="w-4.5 h-4.5 text-[#D2A053]" />
                      我的兴趣
                    </h2>
                  </div>
                  <button
                    onClick={() => toast.success("兴趣画像配置保存成功！")}
                    className="text-[10.5px] font-black text-white bg-[#4F6F52] px-4.5 py-1.5 rounded-full shadow-sm hover:bg-[#3D5640] transition-colors cursor-pointer"
                  >
                    保存
                  </button>
                </div>

                <div className="p-4 sm:p-6 space-y-6">
                  {/* Selector Header */}
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-zinc-800">选择你的兴趣偏好</h4>
                    <p className="text-[10px] text-zinc-400">我们将根据您的喜好偏好推荐更合适的展品讲解、周边商户及游览路线</p>
                  </div>

                  {/* Interests checklist */}
                  <div className="space-y-2.5">
                    {[
                      { id: "history", label: "历史文化", desc: "博物馆、出土文物与千年古迹讲解", icon: "🏛️" },
                      { id: "nature", label: "自然风光", desc: "山林古木、溪流栈道与落日拍摄", icon: "🏔️" },
                      { id: "architecture", label: "古建筑艺术", desc: "飞檐翘角、中式牌楼与传统建筑彩画", icon: "🏯" },
                      { id: "food", label: "美食体验", desc: "巴渝小吃、盖碗茶与经典川味推荐", icon: "🍵" },
                      { id: "folklore", label: "民俗风情", desc: "非遗展演、地方手工艺与说书表演", icon: "🏺" },
                      { id: "family", label: "亲子游玩", desc: "平坦安全步道、故事树洞与童趣互动", icon: "👨‍👩‍👧" },
                      { id: "photo", label: "摄影打卡", desc: "最美机位标注、逆光打卡时间指南", icon: "📷" },
                    ].map(item => {
                      const checked = selectedInterests.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleInterest(item.id)}
                          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${checked
                            ? "bg-[#EBF3EE] border-[#4F6F52]/30 text-[#4F6F52]"
                            : "bg-white border-[#EEF2F0] text-zinc-700 hover:bg-neutral-50"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{item.icon}</span>
                            <div>
                              <p className="text-xs font-extrabold">{item.label}</p>
                              <p className={`text-[9.5px] mt-0.5 ${checked ? "text-[#4F6F52]/70" : "text-zinc-400"}`}>
                                {item.desc}
                              </p>
                            </div>
                          </div>

                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${checked ? "bg-[#4F6F52] border-[#4F6F52] text-white" : "border-zinc-300 bg-white"
                            }`}>
                            {checked && (
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Recommendation Card */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-black text-zinc-800">根据偏好为您推荐</h4>
                    <div className="rounded-3xl border border-[#EEF2F0] p-4 bg-zinc-50/50 flex items-center gap-4">
                      <img
                        src="https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=300&q=80"
                        className="w-16 h-16 rounded-2xl object-cover shadow-sm flex-shrink-0"
                        alt=""
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-zinc-800">历史文化深度游</span>
                          <span className="text-[7.5px] font-bold text-white bg-[#D2A053] px-1.5 py-0.5 rounded-full leading-none">官推精选</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-1 truncate">文化遗迹 / 古建筑 / 博物馆</p>
                        <p className="text-[9.5px] text-zinc-400 mt-0.5">时长: 1天 | 步行约 8km</p>
                      </div>
                      <button
                        onClick={() => router.push("/routes")}
                        className="px-3 py-1.5 bg-[#4F6F52] text-white text-[10px] font-black rounded-lg shadow-sm flex-shrink-0 hover:bg-[#3D5640] transition-colors cursor-pointer"
                      >
                        查看详情
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════
               05. 设置与帮助 (Settings & Help)
               ═══════════════════════════════════════════════════════ */}
            {activeSection === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={SPRING}
                className="bg-white lg:rounded-[24px] lg:border lg:border-[#E2EAE5] lg:shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div className="px-6 py-5 border-b border-[#EEF2F0] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setActiveSection("home")}
                      className="lg:hidden p-1.5 hover:bg-neutral-50 rounded-lg"
                    >
                      <ChevronLeft className="w-5 h-5 text-zinc-600" />
                    </button>
                    <h2 className="text-sm font-black flex items-center gap-1.5">
                      <Settings className="w-4.5 h-4.5 text-zinc-600" />
                      设置与帮助
                    </h2>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">V1.2.0</span>
                </div>

                <div className="p-4 sm:p-6 space-y-6">
                  {/* Options List */}
                  <div className="rounded-3xl border border-[#EEF2F0] overflow-hidden divide-y divide-[#EEF2F0] bg-white">
                    {[
                      { label: "账号与安全", icon: Shield },
                      { label: "隐私设置", icon: Eye },
                      { label: "消息通知", icon: Bell, action: () => setShowNotifications(true) },
                      { label: "语音设置", icon: Volume2, action: () => router.push("/ai-settings") },
                      { label: "清除缓存", icon: Trash2, sub: cacheSize, action: handleClearCache },
                      { label: "离线地图管理", icon: MapPin },
                      { label: "意见反馈", icon: MessageSquare },
                      { label: "关于我们", icon: Info },
                      { label: "帮助中心", icon: HelpCircle },
                    ].map((opt, idx) => (
                      <div
                        key={idx}
                        onClick={opt.action || (() => toast.info(`${opt.label}模块开发中`))}
                        className="flex items-center justify-between px-4 py-3.5 hover:bg-zinc-50/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <opt.icon className="w-4 h-4 text-zinc-400" />
                          <span className="text-xs font-semibold text-zinc-700">{opt.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          {opt.sub && <span className="text-[10.5px] font-mono font-bold text-zinc-300">{opt.sub}</span>}
                          <ChevronRight className="w-4 h-4 text-zinc-300" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI banner small */}
                  <div className="bg-gradient-to-r from-[#F0F5FF] to-[#E5EDFF] rounded-3xl p-4 border border-[#D0DFFA] flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <img
                        src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80"
                        className="w-10 h-10 rounded-full object-cover object-top border-2 border-white"
                        alt=""
                      />
                      <div>
                        <h4 className="text-xs font-extrabold text-zinc-800">AI数字人导游</h4>
                        <p className="text-[9.5px] text-zinc-400 mt-0.5">有问题随时问欣欣~</p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push("/qa")}
                      className="px-3.5 py-1.5 bg-[#4D96FF] text-white text-[10px] font-black rounded-lg shadow-sm hover:bg-[#3D85EF] transition-colors cursor-pointer"
                    >
                      开始对话
                    </button>
                  </div>

                  {/* Logout Button */}
                  {user && (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
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
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* Poster Generator Modal */}
      <AnimatePresence>
        {showPoster && (
          <PosterGenerator
            data={{
              userName: displayName,
              spotsVisited: spotCount,
              favoriteSpot: favorites[0] ? (favorites[0].spotName || "岳阳楼") : "岳阳楼",
              date: new Date().toLocaleDateString("zh-CN"),
              badge: "🏅 资深探索者",
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
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#E6E2D8]"
                style={{ background: "#EEF7F2" }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#4F6F52]/20 text-[#4F6F52]">
                    <Bell className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-[#1E2522]">
                    消息通知
                  </h3>
                </div>
                <button onClick={() => setShowNotifications(false)} className="text-[#8F9F8F] hover:text-[#1E2522] transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {[
                  { title: "旅行家Pro智慧系统版本升级", time: "10分钟前", detail: "已全面更新至 1.2.0 版本。全新引入 3D 拟真对谈数字人与智能避堵路线规划系统，让每一次出游更加得心应手。", type: "update" },
                  { title: "今日景区游览与气象指南", time: "2小时前", detail: "今日气温 22℃-28℃，微风，紫外线强度中等。部分路段正在进行防滑绿化作业，请游客朋友在溪流栈道行走时注意慢行。", type: "info" },
                  { title: "览月亭落日集章特惠活动", time: "5小时前", detail: "今天下午 16:30 至 18:30，在揽月亭与 AI 数字人成功开启对话并上传任意落日合影，即可至服务中心兑换景区定制版精美古风徽章一枚！数量有限，先到先得。", type: "promo" }
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
                    <h4 className="text-xs font-bold text-[#1E2522]">{notif.title}</h4>
                    <p className="text-[11px] leading-relaxed text-[#8F9F8F]">{notif.detail}</p>
                  </div>
                ))}
              </div>

              <div className="px-6 py-4 bg-[#FAF8F5] border-t border-[#E6E2D8] text-center">
                <button onClick={() => setShowNotifications(false)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer"
                  style={{ background: "#4F6F52" }}>
                  我已了解
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowEditProfile(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={SPRING}
              className="w-full max-w-md bg-[#FAF8F5] rounded-3xl border border-[#E6E2D8] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#E6E2D8]"
                style={{ background: "#EEF7F2" }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#4F6F52]/20 text-[#4F6F52]">
                    <User className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-[#1E2522]">
                    编辑个人资料
                  </h3>
                </div>
                <button onClick={() => setShowEditProfile(false)} className="text-[#8F9F8F] hover:text-[#1E2522] transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto scrollbar-none">
                {/* Avatar Selection */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-[#5C6B73] block">选择头像</label>
                  <div className="flex justify-around items-center gap-3 py-2">
                    {[
                      { url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80", name: "探索者" },
                      { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80", name: "行者" },
                      { url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80", name: "摄影师" },
                      { url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80", name: "冒险家" }
                    ].map((av) => (
                      <button
                        key={av.url}
                        type="button"
                        onClick={() => setEditAvatar(av.url)}
                        className={`relative rounded-full p-1 transition-all duration-300 ${editAvatar === av.url ? "ring-4 ring-[#4F6F52]" : "ring-2 ring-transparent opacity-75 hover:opacity-100"
                          }`}
                      >
                        <img src={av.url} className="w-12 h-12 rounded-full object-cover" alt={av.name} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nickname Field */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-[#5C6B73] block">昵称</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="请输入您的昵称"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-white text-xs outline-none focus:border-[#4F6F52] focus:ring-1 focus:ring-[#4F6F52] transition-all"
                  />
                </div>

                {/* Level / Travel Title */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-[#5C6B73] block">旅行达人称号</label>
                  <div className="relative">
                    <select
                      value={editLevel}
                      onChange={(e) => setEditLevel(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-white text-zinc-800 text-xs outline-none focus:border-[#4F6F52] focus:ring-1 focus:ring-[#4F6F52] appearance-none transition-all cursor-pointer"
                    >
                      <option value="Lv.5 问鼎江山">Lv.5 问鼎江山</option>
                      <option value="Lv.4 独步江湖">Lv.4 独步江湖</option>
                      <option value="Lv.3 寻幽探秘">Lv.3 寻幽探秘</option>
                      <option value="Lv.2 浮生半闲">Lv.2 浮生半闲</option>
                      <option value="Lv.1 初出茅庐">Lv.1 初出茅庐</option>
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8F9F8F]">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Gender selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-[#5C6B73] block">性别</label>
                  <div className="flex gap-2">
                    {["男", "女", "保密"].map((g) => (
                      <button
                        type="button"
                        key={g}
                        onClick={() => setEditGender(g)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${editGender === g
                          ? "bg-[#4F6F52] border-[#4F6F52] text-white shadow-sm"
                          : "bg-white border-[#E6E2D8] text-zinc-600 hover:bg-neutral-50"
                          }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location / Region */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-[#5C6B73] block">常用定位 / 地区</label>
                  <input
                    type="text"
                    value={editRegion}
                    onChange={(e) => setEditRegion(e.target.value)}
                    placeholder="例如: 四川 成都"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-white text-xs outline-none focus:border-[#4F6F52] focus:ring-1 focus:ring-[#4F6F52] transition-all"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-[#5C6B73] block">个人签名</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="介绍一下自己吧..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-white text-xs outline-none focus:border-[#4F6F52] focus:ring-1 focus:ring-[#4F6F52] transition-all resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 bg-[#FAF8F5] border-t border-[#E6E2D8] flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-white border border-[#E6E2D8] text-zinc-600 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileName(editName);
                    setProfileLevel(editLevel);
                    setProfileAvatar(editAvatar);
                    setProfileBio(editBio);
                    setProfileGender(editGender);
                    setProfileRegion(editRegion);
                    localStorage.setItem("profile_name", editName);
                    localStorage.setItem("profile_level", editLevel);
                    localStorage.setItem("profile_avatar", editAvatar);
                    localStorage.setItem("profile_bio", editBio);
                    localStorage.setItem("profile_gender", editGender);
                    localStorage.setItem("profile_region", editRegion);
                    setShowEditProfile(false);
                    toast.success("个人资料保存成功！");
                  }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white hover:bg-[#3A5240] transition-colors cursor-pointer"
                  style={{ background: "#4F6F52" }}
                >
                  保存修改
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile Tab Navigation (Fixed bottom) ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2EAE5] py-2 px-4 flex items-center justify-around z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        {[
          { id: "home", label: "我的首页", icon: User },
          { id: "routes", label: "我的行程", icon: Map },
          { id: "favorites", label: "我的收藏", icon: Heart },
          { id: "interests", label: "我的兴趣", icon: Sparkles },
          { id: "settings", label: "设置与帮助", icon: Settings },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id as ActiveSection)}
            className="flex flex-col items-center gap-1 text-center"
          >
            <div className={`p-1.5 rounded-xl transition-colors ${activeSection === item.id ? "bg-[#EBF3EE] text-[#4F6F52]" : "text-zinc-400"
              }`}>
              <item.icon className="w-4.5 h-4.5" />
            </div>
            <span className={`text-[9px] font-bold ${activeSection === item.id ? "text-[#4F6F52]" : "text-zinc-400"
              }`}>{item.label.slice(3)}</span>
          </button>
        ))}
      </div>

    </div>
  );
}
