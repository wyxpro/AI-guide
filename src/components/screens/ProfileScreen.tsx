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

const FEMALE_PRESET_AVATARS = [
  "https://img0.baidu.com/it/u=830713058,3987335577&fm=253&app=138&f=JPEG?w=819&h=800",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80"
];

const MALE_PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80"
];

const BG_PRESET_COVERS = [
  "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&auto=format&fit=crop&q=80"
];

export function ProfileScreen() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = useEazo((s: any) => s.auth.user) as { name?: string | null; username?: string | null; email?: string | null; avatarUrl?: string | null } | null;

  const [activeSection, setActiveSection] = useState<ActiveSection>("home");
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [favorites, setFavorites] = useState<FavoriteRecord[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [mode, setMode] = useState<Mode>("standard");
  const [showPoster, setShowPoster] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showVisitedSpots, setShowVisitedSpots] = useState(false);
  const [showCheckinHistory, setShowCheckinHistory] = useState(false);
  const [allSpots, setAllSpots] = useState<any[]>([]);

  // States for sub-views
  const [routeTab, setRouteTab] = useState<"ongoing" | "completed" | "cancelled">("ongoing");
  const [favoriteTag, setFavoriteTag] = useState<"all" | "spot" | "relic" | "route" | "audio">("all");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["history", "nature", "architecture"]);
  const [cacheSize, setCacheSize] = useState("23.6MB");

  // Local profile states
  const [profileName, setProfileName] = useState("游客小玉");
  const [profileLevel, setProfileLevel] = useState("Lv.5 问鼎江山");
  const [profileAvatar, setProfileAvatar] = useState("https://img0.baidu.com/it/u=830713058,3987335577&fm=253&app=138&f=JPEG?w=819&h=800");
  const [profileBio, setProfileBio] = useState("用双脚丈量世界，用声音感受历史。");
  const [profileGender, setProfileGender] = useState("女");
  const [profileRegion, setProfileRegion] = useState("四川 成都");
  const [profileBg, setProfileBg] = useState("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80");

  // Edit states for form fields
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editLevel, setEditLevel] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editRegion, setEditRegion] = useState("");
  const [editBg, setEditBg] = useState("");

  // Settings sub-view state
  const [settingsSubView, setSettingsSubView] = useState<string | null>(null);

  // Settings sub-view states
  const [privacyShareFootprint, setPrivacyShareFootprint] = useState(true);
  const [privacyShareFav, setPrivacyShareFav] = useState(false);
  const [privacyAIActive, setPrivacyAIActive] = useState(true);

  const [notiSystem, setNotiSystem] = useState(true);
  const [notiGuide, setNotiGuide] = useState(true);
  const [notiDaily, setNotiDaily] = useState(false);

  const [voiceSpeaker, setVoiceSpeaker] = useState("xinxin");
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [voiceBgmVolume, setVoiceBgmVolume] = useState(30);

  const [pwdOld, setPwdOld] = useState("");
  const [pwdNew, setPwdNew] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");

  const [feedbackCategory, setFeedbackCategory] = useState("suggest");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackContact, setFeedbackContact] = useState("");

  const [maps, setMaps] = useState([
    { id: 1, name: "岳阳楼景区离线地图", size: "12.8MB", status: "downloaded" },
    { id: 2, name: "君山岛景区离线地图", size: "24.5MB", status: "none" },
    { id: 3, name: "岳阳市区离线大图", size: "56.0MB", status: "downloading", progress: 32 }
  ]);

  const displayName = profileName;
  const initial = displayName.slice(0, 1);

  // Sync profile values with local storage and user info on mount/change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("profile_name") || (user ? (user.name || user.username || "游客小玉") : "游客小玉");
      const storedLevel = localStorage.getItem("profile_level") || "Lv.5 问鼎江山";
      let storedAvatar = localStorage.getItem("profile_avatar");
      if (!storedAvatar || storedAvatar.includes("photo-1494790108377-be9c29b29330")) {
        storedAvatar = (user && user.avatarUrl) || "https://img0.baidu.com/it/u=830713058,3987335577&fm=253&app=138&f=JPEG?w=819&h=800";
        localStorage.setItem("profile_avatar", storedAvatar);
      }
      const storedBio = localStorage.getItem("profile_bio") || "用双脚丈量世界，用声音感受历史。";
      const storedGender = localStorage.getItem("profile_gender") || "女";
      const storedRegion = localStorage.getItem("profile_region") || "四川 成都";
      const storedBg = localStorage.getItem("profile_bg") || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80";

      setProfileName(storedName);
      setProfileLevel(storedLevel);
      setProfileAvatar(storedAvatar);
      setProfileBio(storedBio);
      setProfileGender(storedGender);
      setProfileRegion(storedRegion);
      setProfileBg(storedBg);
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

  useEffect(() => {
    request("/api/spots")
      .then(r => r.json())
      .then(data => {
        setAllSpots(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
  }, []);

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
    <div className="min-h-svh bg-[#F4F7F5] pb-10 md:pb-12 text-[#2C3E35] selection:bg-[#4F6F52]/20 selection:text-[#4F6F52]">

      {/* ── Main Viewport Wrapper ── */}
      <div className="w-full max-w-[1280px] mx-auto px-0 sm:px-4 md:px-6 py-0 md:py-8 flex flex-col lg:flex-row gap-8 items-start">

        {/* ── Desktop Sidebar (Hidden on Mobile) ── */}
        <aside className="hidden lg:block w-[240px] flex-shrink-0 bg-white rounded-[24px] border border-[#E2EAE5] p-6 shadow-sm h-fit">
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
        <div className="flex-1 w-full min-h-[600px] flex flex-col">
          {/* Mobile Profile Card (Hidden on Desktop) */}
          {/* Mobile Profile Card (Hidden on Desktop) */}
          <div className="lg:hidden w-full relative">
            {/* Background Cover Overlay wrapper - spans over header, user info, and bio description */}
            <div className="relative overflow-hidden px-4 pt-6 pb-5">
              {/* Background Cover Overlay */}
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-500 filter brightness-[0.72] contrast-[0.95]"
                style={{ backgroundImage: `url(${profileBg})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/15 to-black/45 z-0" />

              {/* Content on top of background */}
              <div className="relative z-10">
                {/* Header row with Title and Icons */}
                <div className="flex items-center justify-between mb-5">
                  <h1 className="text-[20px] font-extrabold text-white tracking-tight drop-shadow-sm">个人中心</h1>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowNotifications(true)}
                      className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-95 transition-transform cursor-pointer relative shadow-sm hover:bg-white/25"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-red-500" />
                    </button>
                    <button
                      onClick={() => {
                        setSettingsSubView(null);
                        setActiveSection("settings");
                      }}
                      className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-95 transition-transform cursor-pointer shadow-sm hover:bg-white/25"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex items-end gap-3.5 mb-4">
                  <img
                    src={profileAvatar}
                    className="w-16 h-16 rounded-2xl border-2 border-white/80 shadow-md object-cover flex-shrink-0"
                    alt="Avatar"
                  />
                  <div className="min-w-0 flex-1 pb-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-black text-white truncate max-w-[140px] drop-shadow-sm">{displayName}</h2>
                      <span className="px-1.5 py-0.5 rounded-full bg-white/20 border border-white/10 text-white text-[8.5px] font-black flex items-center gap-0.5 flex-shrink-0 backdrop-blur-xs shadow-xs">
                        <Trophy className="w-2.5 h-2.5 text-yellow-300" /> {profileLevel}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/80 font-bold mt-0.5 drop-shadow-xs">{profileGender} | {profileRegion}</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditName(profileName);
                      setEditLevel(profileLevel);
                      setEditAvatar(profileAvatar);
                      setEditBio(profileBio);
                      setEditGender(profileGender);
                      setEditRegion(profileRegion);
                      setEditBg(profileBg);
                      setShowEditProfile(true);
                    }}
                    className="text-[9.5px] font-extrabold text-white px-3.5 py-2 rounded-xl border border-white/30 bg-white/10 backdrop-blur-md shadow-md active:scale-95 transition-transform cursor-pointer flex-shrink-0 hover:bg-white/20"
                  >
                    编辑资料
                  </button>
                </div>

                {/* Bio text */}
                <p className="text-xs font-medium text-white/95 leading-relaxed bg-black/20 border border-white/10 p-3 rounded-2xl backdrop-blur-xs shadow-xs">
                  {profileBio}
                </p>
              </div>
            </div>

            {/* Stats Card sitting below the background banner, on the solid page background */}
            <div className="px-4 py-4">
              <div className="grid grid-cols-3 gap-2.5 bg-white border border-[#E8EDE9] rounded-2xl p-3.5 shadow-sm">
                <div 
                  onClick={() => setShowVisitedSpots(true)}
                  className="text-center relative after:absolute after:right-0 after:top-1/4 after:h-1/2 after:w-[1px] after:bg-[#E2EAE5] cursor-pointer active:opacity-75 transition-opacity"
                >
                  <span className="block text-base font-black text-[#2C3E35]">{spotCount}</span>
                  <span className="text-[10px] font-bold text-[#8F9F8F]">足迹景区</span>
                </div>
                <div 
                  onClick={() => setActiveSection("favorites")}
                  className="text-center relative after:absolute after:right-0 after:top-1/4 after:h-1/2 after:w-[1px] after:bg-[#E2EAE5] cursor-pointer active:opacity-75 transition-opacity"
                >
                  <span className="block text-base font-black text-[#2C3E35]">{favCount}</span>
                  <span className="text-[10px] font-bold text-[#8F9F8F]">我的收藏</span>
                </div>
                <div 
                  onClick={() => setShowCheckinHistory(true)}
                  className="text-center cursor-pointer active:opacity-75 transition-opacity"
                >
                  <span className="block text-base font-black text-[#2C3E35]">{totalVisits}</span>
                  <span className="text-[10px] font-bold text-[#8F9F8F]">足迹打卡</span>
                </div>
              </div>
            </div>
          </div>

          {/* iOS Segment Control */}
          <div className="lg:hidden mx-4 flex bg-[#E8EDE9] p-0.75 rounded-2xl border border-[#DEEAE3] mt-2.5 mb-1.5">
            {[
              { id: "home", label: "首页", icon: User },
              { id: "routes", label: "行程", icon: Map },
              { id: "favorites", label: "收藏", icon: Heart },
              { id: "interests", label: "兴趣", icon: Sparkles },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as ActiveSection)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-center text-[11px] font-extrabold rounded-xl transition-all cursor-pointer ${activeSection === item.id
                  ? "bg-white text-[#4F6F52] shadow-sm"
                  : "text-[#8F9F8F] hover:text-[#4F6F52]"
                  }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-0 flex-1">
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
                className="bg-white lg:rounded-[24px] lg:border lg:border-[#E2EAE5] lg:shadow-sm rounded-3xl border border-[#E2EAE5] shadow-sm overflow-hidden"
              >
                {/* Banner & User profile header (Desktop styled, hidden on mobile to avoid duplication) */}
                <div
                  className="hidden lg:flex relative h-[230px] p-6 flex-col justify-between"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.45)), url('${profileBg}')`,
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
                        setEditBg(profileBg);
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

                      {/* Experience Mode Toggle Switcher */}
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

                {/* Mobile header info section (Compact experience mode selection) */}
                <div className="lg:hidden p-4.5 bg-[#FAFBFB] border-b border-[#E8EDE9] flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-extrabold text-[#4F6F52]">界面辅助适配</span>
                    <span className="text-[9px] text-zinc-400">选择适合您阅读与互动的交互模式</span>
                  </div>
                  <div className="bg-[#E8EDE9] p-0.75 rounded-2xl flex items-center gap-1 shadow-inner">
                    {(["standard", "elder", "child"] as Mode[]).map(m => (
                      <button
                        key={m}
                        onClick={() => changeMode(m)}
                        className={`flex-1 text-[11px] font-black py-2 rounded-xl transition-all cursor-pointer ${mode === m
                          ? "bg-white text-[#4F6F52] shadow-sm"
                          : "text-[#8F9F8F] hover:text-[#4F6F52]"
                          }`}
                      >
                        {m === "standard" ? "标准" : m === "elder" ? "适老" : "童趣"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Body */}
                <div className="p-4 sm:p-6 space-y-5">
                  {/* Desktop Quick Entry Cards (Hidden on Mobile) */}
                  <div className="hidden lg:grid grid-cols-4 gap-2 text-center">
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
                    {settingsSubView ? (
                      <button
                        onClick={() => setSettingsSubView(null)}
                        className="flex items-center gap-1.5 text-xs font-bold text-[#4F6F52] hover:bg-neutral-50 px-2.5 py-1.5 rounded-xl border border-[#D5E5DC] transition-all cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        返回列表
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveSection("home")}
                        className="lg:hidden p-1.5 hover:bg-neutral-50 rounded-lg"
                      >
                        <ChevronLeft className="w-5 h-5 text-zinc-600" />
                      </button>
                    )}
                    <h2 className="text-sm font-black flex items-center gap-1.5">
                      <Settings className="w-4.5 h-4.5 text-zinc-600" />
                      {settingsSubView ? (
                        <span>
                          {settingsSubView === "account" && "账号与安全"}
                          {settingsSubView === "privacy" && "隐私设置"}
                          {settingsSubView === "notifications" && "消息通知"}
                          {settingsSubView === "voice" && "语音设置"}
                          {settingsSubView === "cache" && "清除缓存"}
                          {settingsSubView === "maps" && "离线地图管理"}
                          {settingsSubView === "feedback" && "意见反馈"}
                          {settingsSubView === "about" && "关于我们"}
                          {settingsSubView === "help" && "帮助中心"}
                        </span>
                      ) : (
                        "设置与帮助"
                      )}
                    </h2>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">V1.2.0</span>
                </div>

                <div className="p-4 sm:p-6 space-y-6">
                  {settingsSubView === null ? (
                    <>
                      {/* Options List */}
                      <div className="rounded-3xl border border-[#EEF2F0] overflow-hidden divide-y divide-[#EEF2F0] bg-white">
                        {[
                          { label: "账号与安全", icon: Shield, action: () => setSettingsSubView("account") },
                          { label: "隐私设置", icon: Eye, action: () => setSettingsSubView("privacy") },
                          { label: "消息通知", icon: Bell, action: () => setSettingsSubView("notifications") },
                          { label: "语音设置", icon: Volume2, action: () => setSettingsSubView("voice") },
                          { label: "清除缓存", icon: Trash2, sub: cacheSize, action: () => setSettingsSubView("cache") },
                          { label: "离线地图管理", icon: MapPin, action: () => setSettingsSubView("maps") },
                          { label: "意见反馈", icon: MessageSquare, action: () => setSettingsSubView("feedback") },
                          { label: "关于我们", icon: Info, action: () => setSettingsSubView("about") },
                          { label: "帮助中心", icon: HelpCircle, action: () => setSettingsSubView("help") },
                        ].map((opt, idx) => (
                          <div
                            key={idx}
                            onClick={opt.action}
                            className="flex items-center justify-between px-4 py-3.5 hover:bg-zinc-50/50 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <opt.icon className="w-4 h-4 text-zinc-400" />
                              <span className="text-xs font-semibold text-zinc-700">{opt.label}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-zinc-400">
                              {opt.sub && <span className="text-[10.5px] font-mono font-bold text-[#8F9F8F]">{opt.sub}</span>}
                              <ChevronRight className="w-4 h-4 text-zinc-300" />
                            </div>
                          </div>
                        ))}
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
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-100 text-red-500 text-xs font-bold bg-red-50/30 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          退出当前账号
                        </motion.button>
                      )}
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      {/* 1. Account & Security */}
                      {settingsSubView === "account" && (
                        <div className="space-y-5">
                          <div className="rounded-3xl border border-[#EEF2F0] bg-white divide-y divide-[#EEF2F0] overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3.5">
                              <div>
                                <p className="text-xs font-extrabold text-zinc-800">绑定手机</p>
                                <p className="text-[10px] text-zinc-400 mt-0.5">已绑定：138****8888</p>
                              </div>
                              <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-1 rounded-lg">修改绑定</span>
                            </div>
                            <div className="flex items-center justify-between px-4 py-3.5">
                              <div>
                                <p className="text-xs font-extrabold text-zinc-800">微信账号</p>
                                <p className="text-[10px] text-zinc-400 mt-0.5">绑定后可使用微信一键快速登录</p>
                              </div>
                              <button 
                                onClick={() => toast.success("微信绑定授权已发起")}
                                className="text-[10px] font-black text-white bg-[#4F6F52] px-3 py-1.5 rounded-lg shadow-sm cursor-pointer"
                              >
                                立即绑定
                              </button>
                            </div>
                          </div>

                          <div className="rounded-3xl border border-[#EEF2F0] p-4 bg-white space-y-4">
                            <h4 className="text-xs font-black text-zinc-800">修改登录密码</h4>
                            <div className="space-y-3">
                              <input
                                type="password"
                                placeholder="请输入原密码"
                                value={pwdOld}
                                onChange={(e) => setPwdOld(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-white text-xs outline-none focus:border-[#4F6F52] transition-all"
                              />
                              <input
                                type="password"
                                placeholder="请输入新密码"
                                value={pwdNew}
                                onChange={(e) => setPwdNew(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-white text-xs outline-none focus:border-[#4F6F52] transition-all"
                              />
                              <input
                                type="password"
                                placeholder="请再次确认新密码"
                                value={pwdConfirm}
                                onChange={(e) => setPwdConfirm(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-white text-xs outline-none focus:border-[#4F6F52] transition-all"
                              />
                              <button
                                onClick={() => {
                                  if (!pwdOld || !pwdNew || !pwdConfirm) {
                                    toast.error("所有密码框均不能为空");
                                    return;
                                  }
                                  if (pwdNew !== pwdConfirm) {
                                    toast.error("两次输入的新密码不一致");
                                    return;
                                  }
                                  toast.success("密码修改成功，下次请使用新密码登录");
                                  setPwdOld("");
                                  setPwdNew("");
                                  setPwdConfirm("");
                                }}
                                className="w-full py-2.5 bg-[#4F6F52] text-white text-xs font-black rounded-xl shadow-md hover:bg-[#3D5640] transition-colors cursor-pointer"
                              >
                                确认修改密码
                              </button>
                            </div>
                          </div>

                          <div className="pt-2">
                            <button
                              onClick={() => {
                                const confirmDel = confirm("注销账号是不可逆的操作，您的全部行程及打卡足迹将被清空。确认注销吗？");
                                if (confirmDel) {
                                  toast.error("账户注销申请已提交，系统将在3个工作日内受理注销。");
                                }
                              }}
                              className="w-full py-2.5 border border-red-200 text-red-500 text-xs font-bold rounded-xl bg-red-50/20 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              注销此账户
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 2. Privacy Settings */}
                      {settingsSubView === "privacy" && (
                        <div className="rounded-3xl border border-[#EEF2F0] bg-white divide-y divide-[#EEF2F0] overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-3.5">
                            <div>
                              <p className="text-xs font-extrabold text-zinc-800">公开我的足迹与轨迹</p>
                              <p className="text-[10px] text-zinc-400 mt-0.5">开启后，其他游客可在探索地图中看见您的推荐行程</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setPrivacyShareFootprint(!privacyShareFootprint)}
                              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${privacyShareFootprint ? "bg-[#4F6F52]" : "bg-zinc-200"}`}
                            >
                              <span className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${privacyShareFootprint ? "translate-x-5" : "translate-x-0"}`} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between px-4 py-3.5">
                            <div>
                              <p className="text-xs font-extrabold text-zinc-800">公开我的收藏夹</p>
                              <p className="text-[10px] text-zinc-400 mt-0.5">公开您珍藏的景点、文物与路线列表</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setPrivacyShareFav(!privacyShareFav)}
                              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${privacyShareFav ? "bg-[#4F6F52]" : "bg-zinc-200"}`}
                            >
                              <span className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${privacyShareFav ? "translate-x-5" : "translate-x-0"}`} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between px-4 py-3.5">
                            <div>
                              <p className="text-xs font-extrabold text-zinc-800">允许数字人主动打招呼</p>
                              <p className="text-[10px] text-zinc-400 mt-0.5">当您行进至特定景点时，AI助手小玉将自动探头向您发出问候</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setPrivacyAIActive(!privacyAIActive)}
                              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${privacyAIActive ? "bg-[#4F6F52]" : "bg-zinc-200"}`}
                            >
                              <span className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${privacyAIActive ? "translate-x-5" : "translate-x-0"}`} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 3. Message Notification */}
                      {settingsSubView === "notifications" && (
                        <div className="space-y-4">
                          <div className="rounded-3xl border border-[#EEF2F0] bg-white divide-y divide-[#EEF2F0] overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3.5">
                              <div>
                                <p className="text-xs font-extrabold text-zinc-800">系统公告与活动通知</p>
                                <p className="text-[10px] text-zinc-400 mt-0.5">接收新功能上线、景区动态等最新推送</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setNotiSystem(!notiSystem)}
                                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${notiSystem ? "bg-[#4F6F52]" : "bg-zinc-200"}`}
                              >
                                <span className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${notiSystem ? "translate-x-5" : "translate-x-0"}`} />
                              </button>
                            </div>
                            <div className="flex items-center justify-between px-4 py-3.5">
                              <div>
                                <p className="text-xs font-extrabold text-zinc-800">智能导览提醒</p>
                                <p className="text-[10px] text-zinc-400 mt-0.5">到达打卡地后自动触发通知播报</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setNotiGuide(!notiGuide)}
                                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${notiGuide ? "bg-[#4F6F52]" : "bg-zinc-200"}`}
                              >
                                <span className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${notiGuide ? "translate-x-5" : "translate-x-0"}`} />
                              </button>
                            </div>
                            <div className="flex items-center justify-between px-4 py-3.5">
                              <div>
                                <p className="text-xs font-extrabold text-zinc-800">每日出行简报推送</p>
                                <p className="text-[10px] text-zinc-400 mt-0.5">获取次日天气、人流指数与穿衣出行建议</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setNotiDaily(!notiDaily)}
                                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${notiDaily ? "bg-[#4F6F52]" : "bg-zinc-200"}`}
                              >
                                <span className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${notiDaily ? "translate-x-5" : "translate-x-0"}`} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 4. Voice Settings */}
                      {settingsSubView === "voice" && (
                        <div className="space-y-5">
                          {/* Speaker selector */}
                          <div className="rounded-3xl border border-[#EEF2F0] p-4 bg-white space-y-3">
                            <h4 className="text-xs font-black text-zinc-800">选择讲解员音色</h4>
                            <div className="grid grid-cols-4 gap-2">
                              {[
                                { id: "xinxin", name: "欣欣", label: "甜美女生", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80" },
                                { id: "xiaoyu", name: "小玉", label: "江南古韵", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" },
                                { id: "dazhuang", name: "大壮", label: "磁性男中音", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" },
                                { id: "star", name: "智多星", label: "说书泰斗", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80" }
                              ].map((sp) => (
                                <button
                                  key={sp.id}
                                  type="button"
                                  onClick={() => {
                                    setVoiceSpeaker(sp.id);
                                    toast.success(`配音员已成功切换为：${sp.name}`);
                                  }}
                                  className={`p-2 rounded-2xl border text-center transition-all cursor-pointer ${voiceSpeaker === sp.id
                                    ? "bg-[#EBF3EE] border-[#4F6F52] text-[#4F6F52]"
                                    : "bg-white border-zinc-100 text-zinc-600 hover:bg-zinc-50"
                                  }`}
                                >
                                  <img src={sp.img} className="w-10 h-10 rounded-full mx-auto object-cover mb-1.5" alt="" />
                                  <p className="text-[10px] font-black leading-none">{sp.name}</p>
                                  <p className="text-[7.5px] text-zinc-400 mt-1 leading-none truncate">{sp.label}</p>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Speech Speed */}
                          <div className="rounded-3xl border border-[#EEF2F0] p-4 bg-white space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-black text-zinc-800">语速调节</h4>
                              <span className="text-[10px] font-bold text-[#4F6F52] bg-[#EBF3EE] px-2 py-0.5 rounded-full">{voiceSpeed.toFixed(2)}x</span>
                            </div>
                            <div className="flex gap-2">
                              {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                                <button
                                  key={speed}
                                  type="button"
                                  onClick={() => setVoiceSpeed(speed)}
                                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-black border transition-all cursor-pointer ${voiceSpeed === speed
                                    ? "bg-[#4F6F52] border-[#4F6F52] text-white shadow-sm"
                                    : "bg-white border-[#E6E2D8] text-zinc-600"
                                  }`}
                                >
                                  {speed === 1.0 ? "常速 1.0" : `${speed}x`}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* BGM Volume */}
                          <div className="rounded-3xl border border-[#EEF2F0] p-4 bg-white space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-black text-zinc-800">背景配乐音量</h4>
                              <span className="text-[10px] font-mono font-bold text-zinc-500">{voiceBgmVolume}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={voiceBgmVolume}
                              onChange={(e) => setVoiceBgmVolume(parseInt(e.target.value))}
                              className="w-full accent-[#4F6F52] h-1.5 bg-neutral-100 rounded-lg cursor-pointer"
                            />
                          </div>
                        </div>
                      )}

                      {/* 5. Clear Cache */}
                      {settingsSubView === "cache" && (
                        <div className="space-y-5">
                          <div className="rounded-3xl border border-[#EEF2F0] p-5 bg-white space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-xs font-black text-zinc-800">当前占用空间</h4>
                                <p className="text-[9.5px] text-zinc-400 mt-0.5">缓存包含离线语音文件、地图切片与临时数据</p>
                              </div>
                              <span className="text-sm font-black text-[#4F6F52]">{cacheSize}</span>
                            </div>

                            <div className="space-y-3 pt-2">
                              <div className="flex items-center justify-between text-[10.5px]">
                                <span className="text-zinc-500">离线语音包缓存</span>
                                <span className="font-bold text-zinc-700">{cacheSize !== "0.0MB" ? "12.5 MB" : "0.0 MB"}</span>
                              </div>
                              <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-[#4F6F52] h-full transition-all duration-500" style={{ width: cacheSize !== "0.0MB" ? "53%" : "0%" }} />
                              </div>

                              <div className="flex items-center justify-between text-[10.5px] pt-1">
                                <span className="text-zinc-500">离线瓦片地图缓存</span>
                                <span className="font-bold text-zinc-700">{cacheSize !== "0.0MB" ? "10.2 MB" : "0.0 MB"}</span>
                              </div>
                              <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-[#D2A053] h-full transition-all duration-500" style={{ width: cacheSize !== "0.0MB" ? "43%" : "0%" }} />
                              </div>

                              <div className="flex items-center justify-between text-[10.5px] pt-1">
                                <span className="text-zinc-500">搜索轨迹与其它数据</span>
                                <span className="font-bold text-zinc-700">{cacheSize !== "0.0MB" ? "0.9 MB" : "0.0 MB"}</span>
                              </div>
                              <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-zinc-400 h-full transition-all duration-500" style={{ width: cacheSize !== "0.0MB" ? "4%" : "0%" }} />
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              if (cacheSize === "0.0MB") {
                                toast.info("当前缓存空间已是最低，无需清理");
                                return;
                              }
                              setCacheSize("0.0MB");
                              toast.success("缓存清理成功，已释放23.6MB空间！");
                            }}
                            className="w-full py-2.5 bg-red-500 text-white text-xs font-black rounded-xl shadow-md hover:bg-red-600 transition-colors cursor-pointer"
                          >
                            立即清理本地缓存
                          </button>
                        </div>
                      )}

                      {/* 6. Offline Map Management */}
                      {settingsSubView === "maps" && (
                        <div className="space-y-4">
                          <div className="rounded-3xl border border-[#EEF2F0] p-4 bg-white flex justify-between items-center">
                            <div>
                              <p className="text-[10px] text-zinc-400">存储位置：默认内部存储</p>
                              <p className="text-xs font-extrabold text-zinc-800 mt-1">剩余可用空间：12.4 GB</p>
                            </div>
                            <button
                              onClick={() => toast.success("所有离线地图包已是最新版本")}
                              className="text-[9.5px] font-bold text-[#4F6F52] border border-[#D5E5DC] bg-[#EBF3EE] px-3 py-1.5 rounded-xl cursor-pointer"
                            >
                              检测新版本
                            </button>
                          </div>

                          <div className="rounded-3xl border border-[#EEF2F0] bg-white divide-y divide-[#EEF2F0] overflow-hidden">
                            {maps.map((map) => (
                              <div key={map.id} className="p-4 flex items-center justify-between">
                                <div className="flex-1 min-w-0 pr-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-zinc-800 truncate">{map.name}</span>
                                    <span className="text-[8.5px] font-mono text-zinc-400 font-bold bg-neutral-100 px-1.5 py-0.5 rounded leading-none">{map.size}</span>
                                  </div>
                                  
                                  {map.status === "downloading" && (
                                    <div className="mt-2.5 space-y-1">
                                      <div className="w-full bg-zinc-100 h-1 rounded-full overflow-hidden">
                                        <div className="bg-[#4F6F52] h-full transition-all duration-300 animate-pulse" style={{ width: `${map.progress}%` }} />
                                      </div>
                                      <p className="text-[8.5px] text-zinc-400 font-mono">正在下载：{map.progress}% (剩余约12秒)</p>
                                    </div>
                                  )}
                                </div>

                                <div>
                                  {map.status === "downloaded" && (
                                    <button
                                      onClick={() => {
                                        setMaps(prev => prev.map(m => m.id === map.id ? { ...m, status: "none" } : m));
                                        toast.success("已成功删除离线包");
                                      }}
                                      className="px-3 py-1 bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                                    >
                                      删除
                                    </button>
                                  )}
                                  {map.status === "none" && (
                                    <button
                                      onClick={() => {
                                        setMaps(prev => prev.map(m => m.id === map.id ? { ...m, status: "downloading", progress: 5 } : m));
                                        // Simulate progress
                                        let prog = 5;
                                        const timer = setInterval(() => {
                                          prog += 15;
                                          if (prog >= 100) {
                                            clearInterval(timer);
                                            setMaps(prev => prev.map(m => m.id === map.id ? { ...m, status: "downloaded" } : m));
                                            toast.success(`${map.name} 下载完成！`);
                                          } else {
                                            setMaps(prev => prev.map(m => m.id === map.id ? { ...m, progress: prog } : m));
                                          }
                                        }, 400);
                                      }}
                                      className="px-3 py-1 bg-[#4F6F52] text-white text-[10px] font-black rounded-lg shadow-sm hover:bg-[#3D5640] cursor-pointer transition-colors"
                                    >
                                      下载离线包
                                    </button>
                                  )}
                                  {map.status === "downloading" && (
                                    <span className="text-[10px] font-bold text-zinc-400 px-2">暂停</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 7. Feedback */}
                      {settingsSubView === "feedback" && (
                        <div className="rounded-3xl border border-[#EEF2F0] p-4 sm:p-5 bg-white space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-zinc-700 block">反馈类型</label>
                            <div className="relative">
                              <select
                                value={feedbackCategory}
                                onChange={(e) => setFeedbackCategory(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-white text-zinc-800 text-xs outline-none focus:border-[#4F6F52] cursor-pointer appearance-none"
                              >
                                <option value="suggest">功能建议与体验设计</option>
                                <option value="spot_error">景区景点数据与讲解勘误</option>
                                <option value="audio_issue">语音播放卡顿与翻译故障</option>
                                <option value="bug">系统错误或意外崩溃</option>
                                <option value="other">其它业务合作咨询</option>
                              </select>
                              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                                <ChevronDown className="w-4 h-4" />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-zinc-700 block">详细描述您的建议/问题</label>
                            <textarea
                              rows={4}
                              placeholder="请写下至少10个字的描述，以便我们技术团队定位排查..."
                              value={feedbackText}
                              onChange={(e) => setFeedbackText(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-white text-xs outline-none focus:border-[#4F6F52] transition-all resize-none"
                            />
                            <p className="text-[9px] text-zinc-400 text-right">{feedbackText.length}/200</p>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-zinc-700 block">联系方式</label>
                            <input
                              type="text"
                              placeholder="手机号 / 微信 / 邮箱 (选填)"
                              value={feedbackContact}
                              onChange={(e) => setFeedbackContact(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-white text-xs outline-none focus:border-[#4F6F52] transition-all"
                            />
                          </div>

                          <button
                            onClick={() => {
                              if (feedbackText.trim().length < 10) {
                                toast.error("反馈描述请不要少于10个字哦");
                                return;
                              }
                              toast.success("意见提交成功！感谢您的宝贵建议！");
                              setFeedbackText("");
                              setFeedbackContact("");
                            }}
                            className="w-full py-2.5 bg-[#4F6F52] text-white text-xs font-black rounded-xl shadow-md hover:bg-[#3D5640] transition-colors cursor-pointer"
                          >
                            提交意见反馈
                          </button>
                        </div>
                      )}

                      {/* 8. About Us */}
                      {settingsSubView === "about" && (
                        <div className="space-y-5 text-center p-4">
                          <div className="w-20 h-20 rounded-3xl bg-[#EBF3EE] border border-[#D5E5DC] flex items-center justify-center mx-auto shadow-sm relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#5A8F65]/10 to-[#4F6F52]/10" />
                            <Navigation className="w-10 h-10 text-[#4F6F52] transform group-hover:rotate-12 transition-transform" />
                          </div>

                          <div className="space-y-1">
                            <h3 className="text-sm font-black text-zinc-800">旅行家Pro</h3>
                            <p className="text-[10px] text-zinc-400 font-mono">智能景区导游 V1.2.0 (Build 260630)</p>
                          </div>

                          <p className="text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto text-justify">
                            本产品致力于为您打造全沉浸式、交互式智能游览体验。将前沿数字人技术、实时空间算法与历史人文深度融合，做您最贴心的数字口袋导游。
                          </p>

                          <div className="rounded-3xl border border-[#EEF2F0] bg-white divide-y divide-[#EEF2F0] overflow-hidden text-left max-w-xs mx-auto">
                            <div className="px-4 py-2.5 flex justify-between items-center text-[10.5px]" onClick={() => toast.info("已加载用户协议文档")}>
                              <span className="text-zinc-600 font-bold cursor-pointer">用户协议</span>
                              <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
                            </div>
                            <div className="px-4 py-2.5 flex justify-between items-center text-[10.5px]" onClick={() => toast.info("已加载隐私条款文档")}>
                              <span className="text-zinc-600 font-bold cursor-pointer">隐私条款说明</span>
                              <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
                            </div>
                          </div>

                          <p className="text-[8.5px] text-zinc-300 font-medium">© 2026 旅行家Pro 团队 版权所有</p>
                        </div>
                      )}

                      {/* 9. Help Center */}
                      {settingsSubView === "help" && (
                        <div className="space-y-4">
                          <div className="rounded-3xl border border-[#EEF2F0] p-4 bg-zinc-50/50">
                            <p className="text-xs font-extrabold text-zinc-800">常见问题解答 (FAQ)</p>
                          </div>

                          <div className="space-y-2.5">
                            {[
                              {
                                q: "Q: GPS定位偏移，导致导览音频不触发怎么办？",
                                a: "A: 请确保手机系统的定位服务已开启，并在手机隐私设置中授予应用最高精度的定位授权。此外，处于厚墙或地下室内可能会减弱信号，建议您可以在地图上直接手动点击播放。"
                              },
                              {
                                q: "Q: 离线地图包下载后可以在断网环境用吗？",
                                a: "A: 完全可以。离线地图包包含了景区的完整手绘地图、导游点坐标以及离线语音包。下载完成后，无需网络连接也可以使用全部智能语音讲解功能。"
                              },
                              {
                                q: "Q: 积分与步数有什么用？如何兑换福利？",
                                a: "A: 您行走的步数会自动同步积累步数，并在积分页面中兑换定制周边、合作景区门票优惠，或者换取数字人语音讲解特权及小玉深度对话服务包。"
                              }
                            ].map((faq, idx) => (
                              <div key={idx} className="rounded-2xl border border-[#EEF2F0] p-4 bg-white space-y-2">
                                <h4 className="text-xs font-black text-zinc-800 leading-snug">{faq.q}</h4>
                                <p className="text-[10.5px] text-zinc-500 leading-relaxed">{faq.a}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
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
                {/* Current Profile Preview */}
                <div className="relative rounded-2xl overflow-hidden h-28 flex items-end p-4 border border-[#E6E2D8] mb-1">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-all duration-300 filter brightness-[0.75]"
                    style={{ backgroundImage: `url(${editBg || profileBg})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40" />
                  <div className="relative z-10 flex items-center gap-3 w-full">
                    <img 
                      src={editAvatar || profileAvatar} 
                      className="w-12 h-12 rounded-full border-2 border-white object-cover" 
                      alt="Preview" 
                    />
                    <div className="min-w-0 flex-1 text-white">
                      <p className="text-xs font-bold leading-tight truncate">{editName || displayName}</p>
                      <p className="text-[9px] text-white/80 leading-none mt-1">{editLevel || profileLevel}</p>
                    </div>
                  </div>
                </div>

                {/* Avatar Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black text-[#5C6B73] block">选择头像</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="file" 
                        id="avatar-upload" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              toast.error("头像文件大小不能超过 2MB");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setEditAvatar(event.target.result as string);
                                toast.success("已成功加载本地头像");
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                        className="flex items-center gap-1 px-2.5 py-1.5 border border-[#D5E5DC] text-[#4F6F52] hover:bg-[#EBF3EE] text-[9.5px] font-black rounded-lg transition-all cursor-pointer"
                      >
                        <ImageIcon className="w-3 h-3" /> 自定义上传
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-[9px] text-zinc-400 font-bold">女生预设头像</p>
                      <div className="flex gap-2 py-1 overflow-x-auto scrollbar-none">
                        {FEMALE_PRESET_AVATARS.map((avUrl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setEditAvatar(avUrl)}
                            className={`relative rounded-full p-0.5 flex-shrink-0 transition-all duration-200 ${editAvatar === avUrl ? "ring-2 ring-[#4F6F52]" : "opacity-80 hover:opacity-100"}`}
                          >
                            <img src={avUrl} className="w-9 h-9 rounded-full object-cover" alt="" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[9px] text-zinc-400 font-bold">男生预设头像</p>
                      <div className="flex gap-2 py-1 overflow-x-auto scrollbar-none">
                        {MALE_PRESET_AVATARS.map((avUrl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setEditAvatar(avUrl)}
                            className={`relative rounded-full p-0.5 flex-shrink-0 transition-all duration-200 ${editAvatar === avUrl ? "ring-2 ring-[#4F6F52]" : "opacity-80 hover:opacity-100"}`}
                          >
                            <img src={avUrl} className="w-9 h-9 rounded-full object-cover" alt="" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Cover Background Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black text-[#5C6B73] block">选择背景主图</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="file" 
                        id="bg-upload" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 4 * 1024 * 1024) {
                              toast.error("背景图片大小不能超过 4MB");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setEditBg(event.target.result as string);
                                toast.success("已成功加载本地背景图");
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('bg-upload')?.click()}
                        className="flex items-center gap-1 px-2.5 py-1.5 border border-[#D5E5DC] text-[#4F6F52] hover:bg-[#EBF3EE] text-[9.5px] font-black rounded-lg transition-all cursor-pointer"
                      >
                        <ImageIcon className="w-3 h-3" /> 自定义上传
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] text-zinc-400 font-bold">风景预设背景</p>
                    <div className="grid grid-cols-5 gap-2 py-1.5">
                      {BG_PRESET_COVERS.map((bgUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditBg(bgUrl)}
                          className={`relative rounded-xl overflow-hidden h-10 border transition-all duration-200 ${editBg === bgUrl ? "border-2 border-[#4F6F52] scale-105" : "border-[#E6E2D8] opacity-80 hover:opacity-100"}`}
                        >
                          <img src={bgUrl} className="w-full h-full object-cover" alt="" />
                        </button>
                      ))}
                    </div>
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
                    setProfileBg(editBg);
                    localStorage.setItem("profile_name", editName);
                    localStorage.setItem("profile_level", editLevel);
                    localStorage.setItem("profile_avatar", editAvatar);
                    localStorage.setItem("profile_bio", editBio);
                    localStorage.setItem("profile_gender", editGender);
                    localStorage.setItem("profile_region", editRegion);
                    localStorage.setItem("profile_bg", editBg);
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

      {/* Visited Spots Modal ("足迹景区") */}
      <AnimatePresence>
        {showVisitedSpots && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs" onClick={() => setShowVisitedSpots(false)}>
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={SPRING}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-[28px] max-h-[82vh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-[#EEF2F0] flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#4F6F52]" />
                  <div>
                    <h3 className="font-black text-sm text-zinc-800">已到访景区</h3>
                    <p className="text-[9.5px] text-zinc-400 mt-0.5">您用双脚丈量过的历史名胜</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowVisitedSpots(false)}
                  className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Spots List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {visits.filter(v => v.type === "spot" && v.spotId).length === 0 ? (
                  <div className="text-center py-16 text-zinc-400">
                    <MapPin className="w-10 h-10 mx-auto text-zinc-300 mb-2" />
                    <p className="text-xs font-bold">暂无景区足迹记录</p>
                    <p className="text-[10px] mt-1">快去探索打卡您喜爱的景区吧！</p>
                  </div>
                ) : (
                  Array.from(new Set(visits.filter(v => v.type === "spot" && v.spotId).map(v => v.spotId))).map(spotId => {
                    const spot = allSpots.find(s => s.id === spotId);
                    if (!spot) return null;
                    return (
                      <div
                        key={spotId}
                        onClick={() => {
                          setShowVisitedSpots(false);
                          router.push(`/spots/${spotId}`);
                        }}
                        className="flex gap-3.5 p-3 rounded-2xl border border-[#EEF2F0] bg-white hover:bg-neutral-50 active:scale-[0.99] transition-all cursor-pointer shadow-xs"
                      >
                        <img
                          src={spot.imageUrl || "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=300&q=80"}
                          className="w-16 h-16 rounded-xl object-cover shadow-xs flex-shrink-0"
                          alt={spot.name}
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <div className="flex items-center justify-between">
                              <h4 className="font-extrabold text-[13px] text-zinc-800 truncate">{spot.name}</h4>
                              <span className="text-[9px] font-bold text-[#D2A053] bg-[#FCF8EE] px-1.5 py-0.5 rounded-sm">
                                ★ {spot.rating || "5.0"}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-400 truncate mt-1">{spot.description || "景区底蕴深厚，文化璀璨"}</p>
                          </div>
                          <div className="flex items-center gap-1.5 text-[9px] text-[#4F6F52] font-black">
                            <span>查看景区详情</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Checkin History Modal ("足迹打卡") */}
      <AnimatePresence>
        {showCheckinHistory && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs" onClick={() => setShowCheckinHistory(false)}>
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={SPRING}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-[28px] max-h-[82vh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-[#EEF2F0] flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#4F6F52]" />
                  <div>
                    <h3 className="font-black text-sm text-zinc-800">足迹打卡历史</h3>
                    <p className="text-[9.5px] text-zinc-400 mt-0.5">记录您走过的每一次心动瞬间</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCheckinHistory(false)}
                  className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* History Timeline List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {visits.length === 0 ? (
                  <div className="text-center py-16 text-zinc-400">
                    <Clock className="w-10 h-10 mx-auto text-zinc-300 mb-2" />
                    <p className="text-xs font-bold">暂无打卡记录</p>
                    <p className="text-[10px] mt-1">走遍山水，打卡记录您的旅程</p>
                  </div>
                ) : (
                  <div className="relative border-l border-[#E2EAE5] ml-3 pl-5.5 space-y-5.5 py-1">
                    {visits.map((record, index) => {
                      const spot = allSpots.find(s => s.id === record.spotId);
                      const displayTitle = record.type === "spot" && spot ? spot.name : "打卡路线行程";
                      const dateStr = new Date(record.visitedAt).toLocaleDateString("zh-CN", {
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      });

                      return (
                        <div key={record.id} className="relative group">
                          {/* Timeline dot */}
                          <span className="absolute -left-[30px] top-1.5 w-3 h-3 rounded-full border-2 border-white bg-[#4F6F52] shadow-sm group-hover:scale-110 transition-transform" />
                          
                          <div className="bg-[#FAFBFB] border border-[#EEF2F0] rounded-2xl p-3.5 shadow-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono text-zinc-400">{dateStr}</span>
                              <span className="text-[8.5px] font-extrabold text-[#4F6F52] bg-[#EBF3EE] px-1.5 py-0.5 rounded-sm">
                                {record.type === "spot" ? "景区打卡" : "行程打卡"}
                              </span>
                            </div>
                            <h4 className="font-extrabold text-xs text-zinc-800 mt-1.5">{displayTitle}</h4>
                            
                            {record.type === "spot" && spot && (
                              <p className="text-[10px] text-zinc-400 mt-1.5 line-clamp-1">
                                {spot.description || "游览翠玉胜地，尽享文化底蕴"}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
