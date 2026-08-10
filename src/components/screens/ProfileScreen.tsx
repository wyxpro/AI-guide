"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Heart, Clock, Settings, MessageSquare,
  Share2, Image as ImageIcon, ChevronRight, ChevronLeft, ChevronDown,
  History, Trophy, Bell, Sun, Zap, Baby, ArrowRight, LogOut, X,
  Shield, Eye, BookOpen, Volume2, Trash2, HelpCircle, Info, Sparkles, Compass, Map, User, Navigation, Check, Pencil
} from "lucide-react";
import { useEazo } from "@eazo/sdk/react";
import { auth } from "@eazo/sdk";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PosterGenerator } from "@/components/ui/PosterGenerator";
import { request } from "@/lib/api/request";
import { toast } from "sonner";
import { getLocalScenicImage } from "@/lib/scenic-image";
import { NATIONAL_SPOTS } from "@/lib/data/national-spots";

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
  "/images/spots/10022.webp",
  "/images/spots/10024.webp",
  "/images/spots/10011.webp",
  "/images/spots/10015.webp",
  "/images/spots/10080.webp"
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
  const [showTravelReportModal, setShowTravelReportModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  const [favTabFilter, setFavTabFilter] = useState<string>("all");
  const [vipSelectedTier, setVipSelectedTier] = useState<string>("year");
  const [selectedPosterSpot, setSelectedPosterSpot] = useState<any>(null);
  const [allSpots, setAllSpots] = useState<any[]>([]);

  // States for sub-views
  const [routeTab, setRouteTab] = useState<"ongoing" | "completed" | "cancelled">("ongoing");
  const [favoriteTag, setFavoriteTag] = useState<"all" | "spot" | "relic" | "route" | "audio">("all");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["history", "nature"]);
  const [cacheSize, setCacheSize] = useState("23.6MB");

  // Local profile states
  const [profileName, setProfileName] = useState("游客小玉");
  const [profileLevel, setProfileLevel] = useState("Lv.5 问鼎江山");
  const [profileAvatar, setProfileAvatar] = useState("https://img0.baidu.com/it/u=830713058,3987335577&fm=253&app=138&f=JPEG?w=819&h=800");
  const [profileBio, setProfileBio] = useState("用双脚丈量世界，用声音感受历史。");
  const [profileGender, setProfileGender] = useState("女");
  const [profileRegion, setProfileRegion] = useState("四川 成都");
  const [profileBg, setProfileBg] = useState("/images/spots/10015.webp");

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
      const storedBg = localStorage.getItem("profile_bg") || "/images/spots/10015.webp";

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
    let localFavs: FavoriteRecord[] = [];
    try {
      const stored = localStorage.getItem("user_favorites");
      if (stored) localFavs = JSON.parse(stored);
    } catch {}

    Promise.all([
      request("/api/user/visits").then(r => r.json()),
      request("/api/user/favorites").then(r => r.json()),
      request("/api/user/preferences").then(r => r.json()).catch(() => null),
    ]).then(([v, f, p]) => {
      setVisits(Array.isArray(v) ? v : []);
      const loadedFavs = Array.isArray(f) ? f : localFavs;
      setFavorites(loadedFavs);
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
    }).catch(() => {
      setFavorites(localFavs);
      setLoadingData(false);
    });
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
          <div className="lg:hidden w-full relative pb-6">
            {/* Top Real Scenic Background Banner (No Pink/Purple Gradient Overlay) */}
            <div
              className="relative px-5 pt-8 pb-10 overflow-hidden rounded-b-3xl bg-zinc-900 shadow-md"
              style={{
                backgroundImage: `url('${profileBg || "/images/spots/10011.webp"}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Dark translucent backdrop overlay for text contrast */}
              <div className="absolute inset-0 bg-black/45 backdrop-blur-[0.5px]" />
              
              <div className="relative z-10 flex items-start justify-between">
                {/* Avatar & User Info */}
                <div className="flex items-center gap-3.5">
                  <div className="relative flex-shrink-0">
                    <img
                      src={profileAvatar}
                      className="w-16 h-16 rounded-full border-2 border-white shadow-xl object-cover"
                      alt="Avatar"
                    />
                    <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white shadow-sm" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-extrabold text-white tracking-tight drop-shadow-sm">
                        {displayName || "xiaoye"}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 border border-purple-300/40 text-white text-[10.5px] font-black shadow-md flex-shrink-0 flex items-center gap-1">
                        <span>👑</span> <span>{profileLevel || "Lv.5 问鼎江山"}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500/85 backdrop-blur-md border border-rose-300/40 text-white text-[10.5px] font-bold shadow-xs flex items-center gap-1">
                        <span>♀</span> <span>{profileGender || "女"}</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-sky-500/85 backdrop-blur-md border border-sky-300/40 text-white text-[10.5px] font-bold shadow-xs flex items-center gap-1">
                        <span>📍</span> <span>{profileRegion || "四川 成都"}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit Profile Top Right Button (shifted leftwards by another 3 spaces with Pencil icon) */}
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
                  className="mr-16 w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white active:scale-95 transition-transform cursor-pointer shadow-md hover:bg-white/30"
                  title="编辑资料"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Featured Hero Card (Elevated Assessment Card) */}
            <div className="-mt-6 mx-4 relative z-10">
              <div
                onClick={() => setShowTravelReportModal(true)}
                className="bg-gradient-to-r from-white via-white to-[#F5F3FF] border border-white/90 shadow-[0_8px_24px_rgba(0,0,0,0.06)] rounded-3xl p-4 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                    <span className="text-2xl select-none">🏆</span>
                  </div>
                  <div>
                    <h3 className="font-black text-base text-zinc-900 tracking-tight">专属旅游报告</h3>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">多模态评估结果与专属导览建议</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
              </div>
            </div>

            {/* Menu List Group Card */}
            <div className="mx-4 mt-4 bg-white rounded-3xl p-2 shadow-sm border border-neutral-100/90 divide-y divide-neutral-100/70">
              {[
                {
                  id: "visits",
                  icon: MapPin,
                  colorBg: "bg-blue-100/80 text-blue-600",
                  title: "行程足迹",
                  desc: "打卡轨迹与历史漫游记录",
                  onClick: () => setShowVisitedSpots(true)
                },
                {
                  id: "favorites",
                  icon: Heart,
                  colorBg: "bg-purple-100/80 text-purple-600",
                  title: "我的收藏",
                  desc: "已收藏的景区、导览与路线",
                  onClick: () => setShowFavoritesModal(true)
                },
                {
                  id: "interests",
                  icon: Compass,
                  colorBg: "bg-amber-100/80 text-amber-600",
                  title: "我的兴趣",
                  desc: "设置观看景点喜好与专属偏好",
                  onClick: () => setShowInterestsModal(true)
                },
                {
                  id: "avatar",
                  icon: User,
                  colorBg: "bg-rose-100/80 text-rose-600",
                  title: "主题切换",
                  desc: "标准模式 · 童趣模式 · 适老模式",
                  onClick: () => setShowThemeModal(true)
                },
                {
                  id: "privacy",
                  icon: Shield,
                  colorBg: "bg-emerald-100/80 text-emerald-600",
                  title: "隐私安全",
                  desc: "账号安全加固与加密管理",
                  onClick: () => setShowPrivacyModal(true)
                },
                {
                  id: "about",
                  icon: HelpCircle,
                  colorBg: "bg-slate-100/80 text-slate-600",
                  title: "关于我们",
                  desc: "旅行家Pro 智慧导览 v2.5",
                  onClick: () => setShowAboutModal(true)
                },
                {
                  id: "admin",
                  icon: Settings,
                  colorBg: "bg-zinc-100/80 text-zinc-700",
                  title: "后台管理登录",
                  desc: "知识库配置与系统管理后台",
                  onClick: () => router.push("/admin")
                }
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={item.onClick}
                  className="flex items-center justify-between p-3.5 hover:bg-neutral-50 rounded-2xl cursor-pointer active:scale-[0.99] transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-2xl ${item.colorBg} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-zinc-800">{item.title}</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-400 transition-colors" />
                </div>
              ))}
            </div>

            {/* Bottom Logout Red Button */}
            <div className="mt-4 px-4">
              <button
                onClick={async () => {
                  try {
                    await auth.logout();
                    toast.success("已安全退出登录");
                    router.push("/login");
                  } catch {
                    toast.error("退出登录失败，请重试");
                  }
                }}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-extrabold text-rose-500 hover:text-rose-600 active:scale-95 transition-all cursor-pointer hover:bg-rose-50/50"
              >
                <LogOut className="w-4.5 h-4.5" />
                <span>退出当前账号</span>
              </button>
            </div>
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
                className="hidden lg:block bg-white lg:rounded-[24px] lg:border lg:border-[#E2EAE5] lg:shadow-sm overflow-hidden"
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
                      img: "/images/spots/yueyang-tower.webp",
                    },
                    {
                      title: "历史文化之旅",
                      date: "2024.05.15 周六",
                      status: "completed",
                      img: "/images/spots/10001.webp",
                    },
                    {
                      title: "自然风光之旅",
                      date: "2024.05.10 周五",
                      status: "cancelled",
                      img: "/images/spots/10022.webp",
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
                    { id: 1, type: "relic", name: "商后母戊鼎", desc: "中国国家博物馆藏，商代晚期青铜重器...", date: "2024.06.18 收藏", img: "/images/spots/houmuwu-ding.webp" },
                    { id: 2, type: "spot", name: "岳阳楼", desc: "江南三大名楼之一，登楼远眺，气象万千...", date: "2024.05.20 收藏", img: "/images/spots/yueyang-tower.webp" },
                    { id: 3, type: "spot", name: "黄鹤楼", desc: "天下江山第一楼，武汉地标古迹建筑...", date: "2024.05.15 收藏", img: "/images/spots/10027.webp" },
                    { id: 4, type: "route", name: "历史文化路线", desc: "探寻千年巴渝文化，感受红岩精神底蕴...", date: "2024.05.10 收藏", img: "/images/spots/10011.webp" },
                    { id: 5, type: "audio", name: "瓷器发展史讲解", desc: "从原始陶器到青花瓷器演变历程的沉浸声景...", date: "2024.05.08 收藏", img: "/images/spots/placeholder.svg" },
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
                        src="/images/spots/10001.webp"
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
                          src={getLocalScenicImage(spot.imageUrl)}
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

      {/* Travel Assessment & Publicity Poster Modal ("查看行程评估报告") */}
      <AnimatePresence>
        {showTravelReportModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md" onClick={() => setShowTravelReportModal(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={SPRING}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[88vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col text-zinc-800 border border-zinc-200"
            >
              {/* Report Header Banner */}
              <div className="relative p-6 bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#4C1D95] text-white flex-shrink-0">
                <button
                  onClick={() => setShowTravelReportModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 backdrop-blur flex items-center justify-center text-yellow-300">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-purple-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                      多模态AI智游评估
                    </span>
                    <h3 className="text-xl font-extrabold tracking-tight mt-1" style={{ fontFamily: "var(--font-noto-serif)" }}>
                      个人行程评估报告
                    </h3>
                  </div>
                </div>

                {/* Score badge */}
                <div className="mt-5 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-purple-200 font-medium">综合探索等级</span>
                    <h4 className="text-lg font-black text-white">98分 · 资深文旅探索家</h4>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-yellow-400 text-purple-950 font-black text-lg flex items-center justify-center shadow-lg border-2 border-white">
                    S+
                  </div>
                </div>
              </div>

              {/* Report Content Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* AI Advice Summary */}
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 space-y-2">
                  <h4 className="font-extrabold text-xs text-purple-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    AI 伴游智能分析结论
                  </h4>
                  <p className="text-xs text-purple-800 leading-relaxed font-medium">
                    根据您最近打卡的 <strong>{spotCount || 5}</strong> 大景点及漫游轨迹，您偏爱包含深厚文史底蕴与拍照热搜的地标景观。系统为您量身生成专属的景区打卡宣传海报！
                  </p>
                </div>

                {/* Poster Showcase Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-zinc-900">打卡景点宣传海报</h4>
                    <span className="text-[10px] text-zinc-400">点击景点生成高清晰海报</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 10011, name: "洪崖洞民俗风貌区", img: "/images/spots/10011.webp", tag: "夜景首选" },
                      { id: 10001, name: "故宫博物院", img: "/images/spots/10001.webp", tag: "帝都胜景" },
                      { id: 10005, name: "东方明珠广播电视塔", img: "/images/spots/10005.webp", tag: "时尚地标" },
                      { id: 10067, name: "李子坝轻轨穿楼", img: "/images/spots/10067.webp", tag: "魔幻城际" },
                    ].map((posterSpot) => (
                      <div
                        key={posterSpot.id}
                        onClick={() => setSelectedPosterSpot(posterSpot)}
                        className="group relative rounded-2xl overflow-hidden border border-zinc-200 shadow-sm cursor-pointer hover:shadow-md transition-all"
                      >
                        <div className="h-32 w-full relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={posterSpot.img} alt={posterSpot.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-[8.5px] text-white px-2 py-0.5 rounded-full font-bold">
                            {posterSpot.tag}
                          </span>
                        </div>
                        <div className="p-2.5 bg-white flex items-center justify-between">
                          <span className="text-xs font-extrabold text-zinc-800 truncate">{posterSpot.name}</span>
                          <Share2 className="w-3.5 h-3.5 text-purple-600 group-hover:scale-110 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Poster Generator Container */}
                {selectedPosterSpot && (
                  <div className="pt-2">
                    <PosterGenerator
                      data={{
                        userName: displayName,
                        userAvatar: profileAvatar,
                        spotsVisited: spotCount || 5,
                        favoriteSpot: selectedPosterSpot.name,
                        date: new Date().toLocaleDateString("zh-CN"),
                        badge: selectedPosterSpot.tag || "文旅打卡"
                      }}
                      onClose={() => setSelectedPosterSpot(null)}
                    />
                  </div>
                )}
              </div>

              {/* Bottom Action Footer */}
              <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex gap-2 justify-end flex-shrink-0">
                <button
                  onClick={() => {
                    toast.success("行程评估报告已生成并可随时下载分享！");
                    setShowTravelReportModal(false);
                  }}
                  className="w-full py-3 rounded-xl bg-[#7C3AED] text-white font-extrabold text-xs shadow-md hover:bg-[#6D28D9] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-4 h-4" />
                  生成并保存全部宣传海报
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dedicated My Favorites Modal ("我的收藏") */}
      <AnimatePresence>
        {showFavoritesModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md" onClick={() => setShowFavoritesModal(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={SPRING}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col text-zinc-800 border border-zinc-200"
            >
              {/* Header */}
              <div className="p-5 border-b border-zinc-100 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-sm">
                    <Heart className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-zinc-900">我的收藏库</h3>
                    <p className="text-xs text-zinc-400">分类浏览已收藏的文旅资产</p>
                  </div>
                </div>
                <button onClick={() => setShowFavoritesModal(false)} className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 5 Tab Filter Pills: 全部 景点 文物 路线 讲解 */}
              <div className="px-5 pt-3 pb-2 border-b border-zinc-100 flex items-center gap-2 overflow-x-auto scrollbar-none flex-shrink-0">
                {[
                  { id: "all", label: "全部" },
                  { id: "spot", label: "景点" },
                  { id: "relic", label: "文物" },
                  { id: "route", label: "路线" },
                  { id: "audio", label: "讲解" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setFavTabFilter(t.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all flex-shrink-0 cursor-pointer ${
                      favTabFilter === t.id
                        ? "bg-purple-600 text-white shadow-sm"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Favorites Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
                {(() => {
                  const filteredFavs = favorites.filter((fav) => {
                    if (favTabFilter === "all") return true;
                    return fav.type === favTabFilter;
                  });

                  if (filteredFavs.length === 0) {
                    return (
                      <div className="text-center py-16 text-zinc-400">
                        <Heart className="w-12 h-12 mx-auto text-zinc-300 mb-2" />
                        <p className="text-xs font-bold">暂无「{favTabFilter === "all" ? "收藏" : favTabFilter}」类型项目</p>
                        <p className="text-[10px] mt-1">在景点详情页点击心形图标即可一键收藏</p>
                      </div>
                    );
                  }

                  const findSpotMeta = (fav: FavoriteRecord) => {
                    const targetId = Number(fav.spotId);
                    if (fav.spotName && fav.spotImage && !fav.spotName.includes("精选")) {
                      return { name: fav.spotName, img: fav.spotImage };
                    }
                    const national = NATIONAL_SPOTS.find(s => Number(s.id) === targetId);
                    if (national) {
                      return { name: national.name, img: (national as any).img || national.imageUrl || fav.spotImage || "/images/spots/10001.webp" };
                    }
                    const foundApi = allSpots.find(s => Number(s.id) === targetId);
                    if (foundApi) {
                      return { name: foundApi.name, img: foundApi.img || foundApi.imageUrl || fav.spotImage || "/images/spots/10001.webp" };
                    }
                    return {
                      name: fav.spotName || "精选名胜景点",
                      img: fav.spotImage || "/images/spots/10001.webp"
                    };
                  };

                  return filteredFavs.map((fav) => {
                    const meta = findSpotMeta(fav);
                    const title = meta.name;
                    const imgUrl = meta.img;

                    return (
                      <div key={fav.id} className="p-3 rounded-2xl border border-zinc-200/80 bg-[#FAF9F6] flex items-center gap-3.5 group hover:border-purple-300 transition-all">
                        <img
                          src={imgUrl}
                          alt={title}
                          onClick={() => {
                            setShowFavoritesModal(false);
                            router.push(`/spots/${fav.spotId || 10001}`);
                          }}
                          className="w-16 h-16 rounded-xl object-cover flex-shrink-0 shadow-sm cursor-pointer hover:opacity-90 active:scale-95 transition-all"
                        />
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => {
                            setShowFavoritesModal(false);
                            router.push(`/spots/${fav.spotId || 10001}`);
                          }}
                        >
                          <h4 className="font-extrabold text-xs text-zinc-900 truncate hover:text-purple-600 transition-colors">{title}</h4>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[9.5px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                              {fav.type === "spot" ? "精选景点" : fav.type === "relic" ? "镇馆之宝" : fav.type === "route" ? "专属路线" : "语音讲解"}
                            </span>
                            <span className="text-[9px] text-zinc-400">包含 3D 交互与讲解</span>
                          </div>
                        </div>
                        <button
                          onClick={() => unfavorite(fav.id)}
                          className="w-8 h-8 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer"
                          title="取消收藏"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  });
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Theme Switcher Modal ("主题切换") */}
      <AnimatePresence>
        {showThemeModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md" onClick={() => setShowThemeModal(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={SPRING}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col text-zinc-800 border border-zinc-200"
            >
              <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-sm">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-zinc-900">界面与主题切换</h3>
                    <p className="text-xs text-zinc-400">适配全人群与不同场景的无障碍体验</p>
                  </div>
                </div>
                <button onClick={() => setShowThemeModal(false)} className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-3">
                {[
                  {
                    id: "standard",
                    title: "🌟 标准模式",
                    desc: "经典高显色调，全功能AI智导与沉浸3D地图",
                    tag: "推荐",
                    img: "/images/spots/10001.webp"
                  },
                  {
                    id: "child",
                    title: "🎈 童趣模式",
                    desc: "卡通趣彩插画，趣味萌音讲解与故事闯关",
                    tag: "趣味",
                    img: "/images/spots/10011.webp"
                  },
                  {
                    id: "elder",
                    title: "👓 适老模式",
                    desc: "特大醒目标示，大按键极简操作与一键语音播报",
                    tag: "关爱",
                    img: "/images/spots/10007.webp"
                  },
                ].map((tItem) => {
                  const isSelected = mode === tItem.id;
                  return (
                    <div
                      key={tItem.id}
                      onClick={() => {
                        changeMode(tItem.id as Mode);
                        toast.success(`已成功切换为「${tItem.title}」！`);
                        setShowThemeModal(false);
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 justify-between ${
                        isSelected
                          ? "bg-rose-50/70 border-rose-400 shadow-md ring-2 ring-rose-300/40"
                          : "bg-zinc-50 border-zinc-200/80 hover:border-rose-200"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={tItem.img} alt={tItem.title} className="w-14 h-14 rounded-xl object-cover shadow-sm flex-shrink-0" />
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-xs text-zinc-900">{tItem.title}</h4>
                          <span className="text-[9.5px] font-black px-2 py-0.5 rounded-full bg-rose-500 text-white">
                            {tItem.tag}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-tight">{tItem.desc}</p>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dedicated VIP Membership Modal ("加入会员，尊享高定伴游") */}
      <AnimatePresence>
        {showVipModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md" onClick={() => setShowVipModal(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={SPRING}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col text-zinc-800 border border-zinc-200"
            >
              {/* VIP Gold Card Header - 官网宣传页风格 */}
              <div className="p-6 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-black relative flex-shrink-0 shadow-inner">
                <button onClick={() => setShowVipModal(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-black transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-black text-amber-400 flex items-center justify-center shadow-xl">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-black/80 bg-white/40 px-2.5 py-0.5 rounded-full border border-black/10">
                      旅行家Pro 官方尊享套餐
                    </span>
                    <h3 className="text-xl font-black tracking-tight mt-1" style={{ fontFamily: "var(--font-noto-serif)" }}>
                      加入会员 · 尊享高定伴游
                    </h3>
                  </div>
                </div>
              </div>

              {/* 4 Subscription Tier Options & Feature Details */}
              <div className="p-5 space-y-4 max-h-[62vh] overflow-y-auto">
                <h4 className="font-extrabold text-xs text-zinc-800">选择您的专属高定伴游套餐</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "month", name: "连续月卡", price: "19", period: "/月", orig: "¥30", tag: "首月优惠", desc: "✨ 解锁 1000+ 景区无界伴游 · 无限次 AI 对话与标准音色" },
                    { id: "quarter", name: "季卡套餐", price: "48", period: "/季", orig: "¥90", tag: "热门推荐", desc: "✨ 赠送专属知性/磁性高品质音色 · 双向实时对谈与沉浸地图" },
                    { id: "year", name: "年度尊享", price: "128", period: "/年", orig: "¥360", tag: "立省60%", desc: "✨ 送全城特种兵路线库 + 4K 3D 三维高精地图与全局智导" },
                    { id: "lifetime", name: "终身尊享", price: "298", period: "终身", orig: "¥999", tag: "限量尊享", desc: "✨ 终身无限次全景三维地图 + 官方 VIP 极速优先服务通道" },
                  ].map((tier) => {
                    const isSelected = vipSelectedTier === tier.id;
                    return (
                      <div
                        key={tier.id}
                        onClick={() => setVipSelectedTier(tier.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? "bg-amber-50/80 border-amber-500 shadow-md ring-2 ring-amber-400/50"
                            : "bg-zinc-50 border-zinc-200/80 hover:border-amber-300"
                        }`}
                      >
                        <span className="absolute top-0 right-0 bg-amber-500 text-black text-[8.5px] font-black px-2 py-0.5 rounded-bl-lg">
                          {tier.tag}
                        </span>
                        <div>
                          <h5 className="font-black text-xs text-amber-950">{tier.name}</h5>
                          <div className="mt-1.5 flex items-baseline gap-1">
                            <span className="text-xl font-black text-amber-900">¥{tier.price}</span>
                            <span className="text-[10px] text-amber-700 font-bold">{tier.period}</span>
                            <span className="text-[9px] text-zinc-400 line-through ml-1">{tier.orig}</span>
                          </div>
                        </div>
                        <p className="text-[9.5px] text-amber-900/80 mt-2 font-semibold leading-relaxed">{tier.desc}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Additional membership guarantee badges */}
                <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-[10px] text-amber-900 flex items-center justify-around font-bold">
                  <span>🔒 安全极速开通</span>
                  <span>⚡ 即刻生效解锁</span>
                  <span>🎧 全平台设备同步</span>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-zinc-100 bg-zinc-50">
                <button
                  onClick={() => {
                    toast.success("已成功订购会员！开通尊享高定伴游！");
                    setShowVipModal(false);
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-black font-extrabold text-xs shadow-md hover:from-amber-600 hover:to-yellow-600 active:scale-95 transition-all cursor-pointer"
                >
                  立即开通 · 尊享高定伴游
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dedicated Privacy Modal ("隐私安全") */}
      <AnimatePresence>
        {showPrivacyModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md" onClick={() => setShowPrivacyModal(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={SPRING}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col text-zinc-800 border border-zinc-200"
            >
              {/* Header */}
              <div className="p-5 border-b border-zinc-100 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-zinc-900">隐私与数据安全中心</h3>
                    <p className="text-xs text-zinc-400">端到端数据加密与自主权限保护</p>
                  </div>
                </div>
                <button onClick={() => setShowPrivacyModal(false)} className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Toggles */}
              <div className="p-5 space-y-4">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-900">安全防护级别：100分 (极其安全)</span>
                  <span className="text-[10px] font-bold text-white bg-emerald-600 px-2 py-0.5 rounded-full">AES-256 加密</span>
                </div>

                {[
                  { title: "行程足迹公开保护", desc: "仅允许个人查看景区打卡轨迹", state: privacyShareFootprint, setter: setPrivacyShareFootprint },
                  { title: "AI 交互数据加密", desc: "对话文本及音色数据本地脱敏存储", state: privacyAIActive, setter: setPrivacyAIActive },
                  { title: "高精度 GPS 动态定位", desc: "仅在浏览地图与导览时获取精准坐标", state: privacyShareFav, setter: setPrivacyShareFav },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-2xl border border-zinc-200/80 bg-neutral-50">
                    <div>
                      <h4 className="font-extrabold text-xs text-zinc-800">{item.title}</h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => item.setter(!item.state)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${item.state ? "bg-emerald-500" : "bg-zinc-300"}`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${item.state ? "translate-x-5" : ""}`} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex justify-end">
                <button
                  onClick={() => {
                    toast.success("隐私安全设置已全局生效");
                    setShowPrivacyModal(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
                >
                  保存安全策略
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dedicated About Modal ("关于我们") */}
      <AnimatePresence>
        {showAboutModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md" onClick={() => setShowAboutModal(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={SPRING}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col text-zinc-800 border border-zinc-200"
            >
              {/* Header */}
              <div className="p-6 bg-gradient-to-br from-[#2E4F32] to-[#1D3320] text-white text-center relative flex-shrink-0">
                <button onClick={() => setShowAboutModal(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/image/logo.png" alt="Logo" className="w-16 h-16 mx-auto rounded-2xl shadow-xl border-2 border-white/20 object-contain bg-white p-1" />
                <h3 className="text-xl font-black tracking-wide mt-3" style={{ fontFamily: "var(--font-noto-serif)" }}>
                  旅行家Pro · 智慧文旅伴游系统
                </h3>
                <span className="text-[10px] font-mono font-bold text-emerald-200 bg-white/15 px-3 py-0.5 rounded-full mt-1.5 inline-block border border-white/20">
                  v2.5.0 Premium Release
                </span>
              </div>

              {/* Developer & Contact Card */}
              <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-black text-emerald-950">项目主理与开发者信息</span>
                    </div>
                    <span className="text-[9.5px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">官方认证</span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500 font-semibold flex items-center gap-1">
                        👨‍💻 开发者：
                      </span>
                      <span className="font-black text-zinc-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-200/60 shadow-2xs">
                        晓叶
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500 font-semibold flex items-center gap-1">
                        💬 联系微信：
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200/60 shadow-2xs select-all">
                          wyx200265
                        </span>
                        <button
                          onClick={() => {
                            if (typeof navigator !== "undefined" && navigator.clipboard) {
                              navigator.clipboard.writeText("wyx200265");
                              toast.success("微信账号 wyx200265 已成功复制！");
                            }
                          }}
                          className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] font-bold shadow-2xs transition-colors cursor-pointer"
                        >
                          复制
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tech Highlights */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-xs text-zinc-800">核心智驾引擎支持</h4>
                  <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                    <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/70 font-semibold text-zinc-700 flex items-center gap-1.5">
                      <span>🤖 Live2D 数字人交互</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/70 font-semibold text-zinc-700 flex items-center gap-1.5">
                      <span>🗺️ 高德 3D 地图导航</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/70 font-semibold text-zinc-700 flex items-center gap-1.5">
                      <span>🎙️ 神经语音 TTS 合成</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/70 font-semibold text-zinc-700 flex items-center gap-1.5">
                      <span>📸 VR / Camera 识景</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex gap-2">
                <button
                  onClick={() => {
                    if (typeof navigator !== "undefined" && navigator.clipboard) {
                      navigator.clipboard.writeText("wyx200265");
                      toast.success("微信 wyx200265 已复制，欢迎沟通交流！");
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-extrabold text-xs transition-colors cursor-pointer"
                >
                  联系开发者 (微信)
                </button>
                <button
                  onClick={() => setShowAboutModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#2E4F32] hover:bg-[#1D3320] text-white font-extrabold text-xs transition-colors cursor-pointer"
                >
                  确认关闭
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dedicated Interests Modal ("我的兴趣") */}
      <AnimatePresence>
        {showInterestsModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md" onClick={() => setShowInterestsModal(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={SPRING}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col text-zinc-800 border border-zinc-200"
            >
              {/* Header */}
              <div className="p-5 border-b border-zinc-100 flex items-center justify-between flex-shrink-0 bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-zinc-900">我的观景兴趣设置</h3>
                    <p className="text-xs text-zinc-500">勾选偏好，系统将自动推荐定制游览路线与讲解</p>
                  </div>
                </div>
                <button onClick={() => setShowInterestsModal(false)} className="w-8 h-8 rounded-full hover:bg-zinc-200/60 flex items-center justify-center text-zinc-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Interests Checklist Grid */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {[
                  { id: "history", label: "历史古迹", desc: "博物馆、帝陵古刹与千年历史典故", icon: "🏛️" },
                  { id: "nature", label: "山水自然", desc: "名山大川、湖光山色与森林氧吧", icon: "🏔️" },
                  { id: "photography", label: "网红打卡", desc: "极具出片视觉地标、最美夜景与绝美视角", icon: "📸" },
                  { id: "architecture", label: "传统建筑", desc: "川东吊脚楼、江南古典园林与飞檐梁栋", icon: "🏯" },
                  { id: "food", label: "特色美食", desc: "百年老街美食、盖碗茶与市井烟火小吃", icon: "🍜" },
                  { id: "family", label: "亲子研学", desc: "大熊猫基地、科普互动馆与轻松平坦步道", icon: "👨‍👩‍👧" },
                  { id: "temple", label: "梵刹寺庙", desc: "深山古刹、禅宗石刻与清修之地", icon: "🎭" },
                  { id: "museum", label: "文博展览", desc: "镇馆之宝、青铜重器与艺术书画名作", icon: "🎨" },
                  { id: "nightview", label: "绚丽夜景", desc: "江畔灯光秀、霓虹街区与夜游船票", icon: "🌃" },
                ].map((item) => {
                  const isChecked = selectedInterests.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleInterest(item.id)}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                        isChecked
                          ? "bg-amber-50 border-amber-500 text-amber-950 shadow-sm ring-1 ring-amber-400/30"
                          : "bg-zinc-50 border-zinc-200/80 text-zinc-700 hover:border-amber-200 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="text-2xl flex-shrink-0">{item.icon}</span>
                        <div>
                          <h4 className="font-black text-xs text-zinc-900">{item.label}</h4>
                          <p className="text-[10.5px] text-zinc-500 mt-0.5 leading-tight">{item.desc}</p>
                        </div>
                      </div>

                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all flex-shrink-0 ${
                        isChecked ? "bg-amber-500 border-amber-500 text-white shadow-sm" : "border-zinc-300 bg-white"
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500">
                  已选择 <span className="font-black text-amber-600">{selectedInterests.length}</span> 项偏好
                </span>
                <button
                  onClick={() => {
                    localStorage.setItem("user_selected_interests", JSON.stringify(selectedInterests));
                    toast.success("兴趣偏好已成功更新！全站算法将优先推送相关项目");
                    setShowInterestsModal(false);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  保存兴趣配置
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
