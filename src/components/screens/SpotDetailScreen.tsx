"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, MessageCircle, Clock, MapPin, Star, Volume2, Users, BookOpen, Camera, Share2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEazo } from "@eazo/sdk/react";
import { request } from "@/lib/api/request";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { StoryModePlayer } from "@/components/ui/StoryModePlayer";
import { CameraRecognize } from "@/components/ui/CameraRecognize";
import { getLocalScenicImage } from "@/lib/scenic-image";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 35 };

interface Spot { id: number; name: string; category: string; city?: string; description: string; imageUrl: string; audioGuide: string; duration: number; distance: string; rating: number; visitCount: number; tags: string[]; location?: { lat: number; lng: number } }

export function SpotDetailScreen({ spotId }: { spotId: string }) {
  const user = useEazo((s) => s.auth.user);
  const searchParams = useSearchParams();
  const autoplay = searchParams.get("autoplay") === "true";
  const [spot, setSpot] = useState<Spot | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const [favId, setFavId] = useState<number | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [autoplayBanner, setAutoplayBanner] = useState(autoplay);
  const [nearbySpots, setNearbySpots] = useState<Array<any>>([]);
  const [guideExpanded, setGuideExpanded] = useState(false);
  const [storyExpanded, setStoryExpanded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isPC = window.innerWidth >= 768;
      if (isPC) {
        setGuideExpanded(true);
        setStoryExpanded(true);
      }
    }
  }, []);

  useEffect(() => {
    fetch(`/api/spots/${spotId}`)
      .then((r) => r.json())
      .then((d) => { setSpot(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [spotId]);

  useEffect(() => {
    if (!spot) return;
    fetch("/api/spots?limit=100")
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const others = data.filter((s) => s.id !== spot.id);
        
        import("@turf/turf").then((turf) => {
          const fromLoc = spot.location || { lat: 0, lng: 0 };
          const fromPt = turf.point([fromLoc.lng, fromLoc.lat]);
          
          const mapped = others.map((s) => {
            const toLoc = s.location || { lat: 0, lng: 0 };
            const toPt = turf.point([toLoc.lng, toLoc.lat]);
            const dist = Math.round(turf.distance(fromPt, toPt, { units: "meters" }));
            return { ...s, distanceMeters: dist };
          });

          mapped.sort((a, b) => a.distanceMeters - b.distanceMeters);
          setNearbySpots(mapped.slice(0, 3));
        });
      })
      .catch((e) => console.error("Failed to load nearby spots", e));
  }, [spot]);

  const submitRating = async () => {
    if (!user || !spot) return;
    try {
      const res = await request(`/api/spots/${spot.id}/rating`, {
        method: "POST",
        body: JSON.stringify({ rating: userRating }),
      });
      if (res.ok) {
        setRatingSubmitted(true);
        toast.success("评分已提交，感谢您的反馈！");
        fetch(`/api/spots/${spotId}`)
          .then((r) => r.json())
          .then((d) => setSpot(d));
      } else {
        toast.error("评分提交失败");
      }
    } catch {
      toast.error("提交评分出错，请稍候再试");
    }
  };

  // Auto-log visit and check favorite status
  useEffect(() => {
    if (!spot || !user) return;
    // Log visit
    request("/api/user/visits", { method: "POST", body: JSON.stringify({ type: "spot", id: spot.id }) }).catch(() => {});
    // Check favorite
    request("/api/user/favorites").then((r) => r.json()).then((favs: Array<{ id: number; spotId: number; type: string }>) => {
      const fav = favs.find((f) => f.type === "spot" && f.spotId === spot.id);
      if (fav) { setFavorited(true); setFavId(fav.id); }
    }).catch(() => {});
  }, [spot, user]);

  const toggleFavorite = async () => {
    if (!user) { toast.info("请先登录后再收藏"); return; }
    if (favorited && favId) {
      await request(`/api/user/favorites/${favId}`, { method: "DELETE" });
      setFavorited(false); setFavId(null);
      toast.success("已取消收藏");
    } else {
      const res = await request("/api/user/favorites", { method: "POST", body: JSON.stringify({ type: "spot", id: Number(spotId) }) });
      const data = await res.json();
      setFavorited(true); setFavId(data.id);
      toast.success("已加入收藏");
    }
  };

  const speakDescription = () => {
    if (!spot) return;
    if (speaking) { window.speechSynthesis?.cancel(); setSpeaking(false); return; }
    const text = `${spot.name}。${spot.description}`;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "zh-CN"; utter.rate = 0.9;
    const voices = window.speechSynthesis?.getVoices() ?? [];
    const zhVoice = voices.find((v) => v.lang.startsWith("zh") && v.name.includes("Female")) || voices.find((v) => v.lang.startsWith("zh"));
    if (zhVoice) utter.voice = zhVoice;
    utter.onend = () => setSpeaking(false);
    window.speechSynthesis?.speak(utter);
    setSpeaking(true);
  };

  // Auto-play voice guide if opened via QR code scan
  useEffect(() => {
    if (!autoplay || !spot || speaking) return;
    const timer = setTimeout(() => {
      toast.info(`扫码成功！正在为您播放「${spot.name}」语音讲解`, { duration: 3000 });
      speakDescription();
    }, 800);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, spot]);

  if (loading) return <SpotDetailSkeleton />;
  if (!spot) return (
    <div className="min-h-svh flex items-center justify-center" style={{ background: "#FAF8F5" }}>
      <div className="text-center">
        <p className="text-4xl mb-3">🗺️</p>
        <p style={{ color: "#8F9F8F" }}>景点信息暂时无法加载</p>
        <Link href="/spots"><p className="text-sm mt-2" style={{ color: "#4F6F52" }}>返回景点列表</p></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-svh relative" style={{ background: "#FAF8F5" }}>
      {/* Draggable & Expandable Card 1: 导览官小玉 */}
      <motion.div
        drag
        dragMomentum={false}
        className="fixed z-40 touch-none"
        style={{ right: 16, top: "55%" }}
      >
        <motion.div
          layout
          className="flex flex-row-reverse items-center shadow-xl border border-[#D2A053]/50 backdrop-blur-md overflow-hidden bg-[#1A2D23]/95"
          style={{
            borderRadius: guideExpanded ? "16px" : "28px",
            padding: "8px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.3)"
          }}
        >
          {/* The circle button avatar on the right */}
          <motion.button
            layout
            onClick={() => setGuideExpanded(!guideExpanded)}
            className="w-12 h-12 rounded-full bg-[#1F2E26] border border-[#D2A053]/70 flex items-center justify-center text-sm font-extrabold text-[#D2A053] shadow-md flex-shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            style={{ fontFamily: "var(--font-noto-serif)" }}
          >
            玉
          </motion.button>

          {/* Expanded Content on the left */}
          <AnimatePresence>
            {guideExpanded && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 220, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="overflow-hidden flex items-center gap-3 pr-3"
              >
                <div className="flex flex-col text-left w-32 flex-shrink-0">
                  <h4 className="text-xs font-black text-[#D2A053]" style={{ fontFamily: "var(--font-noto-serif)" }}>导览官小玉</h4>
                  <p className="text-[9px] text-white/70 mt-0.5 leading-tight truncate">提问景区历史与文化</p>
                </div>
                <Link href={`/qa?spot=${spot.id}&name=${encodeURIComponent(spot.name)}`} className="flex-shrink-0">
                  <button className="px-3 py-1.5 bg-[#D2A053] hover:bg-[#cda052] text-[#1A2D23] text-[10px] font-black rounded-lg shadow-sm whitespace-nowrap cursor-pointer transition-colors">
                    去对话
                  </button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Draggable & Expandable Card 2: 故事讲解模式 */}
      <motion.div
        drag
        dragMomentum={false}
        className="fixed z-40 touch-none"
        style={{ right: 16, top: "67%" }}
      >
        <motion.div
          layout
          className="flex flex-row-reverse items-center shadow-xl border border-orange-500/50 backdrop-blur-md overflow-hidden bg-[#3C1A1A]/95"
          style={{
            borderRadius: storyExpanded ? "16px" : "28px",
            padding: "8px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.3)"
          }}
        >
          {/* The circle button avatar on the right */}
          <motion.button
            layout
            onClick={() => setStoryExpanded(!storyExpanded)}
            className="w-12 h-12 rounded-full bg-[#3C1A1A] border border-orange-500/70 flex items-center justify-center text-lg flex-shrink-0 cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-transform"
          >
            📖
          </motion.button>

          {/* Expanded Content on the left */}
          <AnimatePresence>
            {storyExpanded && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 220, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="overflow-hidden flex items-center gap-3 pr-3"
              >
                <div className="flex flex-col text-left w-32 flex-shrink-0">
                  <h4 className="text-xs font-black text-orange-400" style={{ fontFamily: "var(--font-noto-serif)" }}>故事讲解模式</h4>
                  <p className="text-[9px] text-white/70 mt-0.5 leading-tight truncate">4章节沉浸式语音剧情</p>
                </div>
                <button
                  onClick={() => { setShowStory(true); setStoryExpanded(false); }}
                  className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black rounded-lg shadow-sm whitespace-nowrap cursor-pointer transition-colors"
                >
                  开始
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* PC layout wrapper */}
      <div className="md:flex md:h-svh md:overflow-hidden">
        {/* Mobile/PC left: content scroll column */}
        <div className="flex-1 md:overflow-y-auto pb-12">

          {/* Autoplay / QR scan banner */}
          {autoplayBanner && (
            <motion.div initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3"
              style={{ background: "linear-gradient(135deg, #2B3530, #1A2420)", borderBottom: "1px solid rgba(210,160,83,0.3)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: "linear-gradient(135deg,#4F6F52,#3A5240)", color: "#D2A053", fontFamily: "var(--font-noto-serif)" }}>玉</div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold">扫码讲解已启动</p>
                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.6)" }}>正在为您播放「{spot.name}」深度讲解</p>
              </div>
              <motion.button whileTap={{ scale: 0.88 }} onClick={() => { setAutoplayBanner(false); window.speechSynthesis?.cancel(); setSpeaking(false); }}
                className="text-[10px] px-2.5 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
                关闭
              </motion.button>
            </motion.div>
          )}

          {/* Hero media section */}
          <div className="relative overflow-hidden bg-black" style={{ height: 320 }}>
            <div className="relative w-full h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getLocalScenicImage(spot.imageUrl)}
                alt={spot.name}
                className="w-full h-full object-cover transition-all duration-500"
              />
            </div>

            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 60%, rgba(0,0,0,0.4) 100%)" }} />

            {/* Back + Favorite buttons */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 z-20"
              style={{ paddingTop: "calc(env(safe-area-inset-top, 44px) + 8px)" }}>
              <Link href="/spots">
                <motion.button whileTap={{ scale: 0.88 }}
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-black/35 backdrop-blur-md hover:bg-black/50 transition-colors">
                  <ArrowLeft className="w-4 h-4 text-white" />
                </motion.button>
              </Link>
              <motion.button whileTap={{ scale: 0.88 }} onClick={toggleFavorite}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-black/35 backdrop-blur-md hover:bg-black/50 transition-colors">
                <Heart className="w-4 h-4" fill={favorited ? "#DC2626" : "none"} style={{ color: favorited ? "#DC2626" : "white" }} />
              </motion.button>
            </div>

            {/* Rating overlay badge */}
            <div className="absolute top-16 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full backdrop-blur-md bg-red-600/90 text-white shadow-md z-20">
              <Star className="w-3 h-3 fill-white text-white" />
              <span className="text-xs font-bold">{(spot.rating / 10).toFixed(1)}</span>
              <span className="text-[9px] opacity-90">很棒</span>
            </div>
          </div>

          {/* Card 1: Title and core details */}
          <div className="relative z-10 -mt-10 mx-4 bg-white rounded-3xl p-5 shadow-md border border-neutral-100/80 flex justify-between items-stretch">
            {/* Left Part */}
            <div className="flex-1 pr-4 min-w-0">
              <h1 className="text-lg font-bold text-[#1E2522] truncate" style={{ fontFamily: "var(--font-noto-serif)" }}>
                {spot.name}
              </h1>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-[#4F6F52]/10 text-[#4F6F52] border border-[#4F6F52]/20">
                  5A景区
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                  景区Wi-Fi: 有
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-zinc-500 text-xs">
                <MapPin className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                <span className="truncate">{spot.city}景区中心 · 距您 {spot.distance || '11.2km'}</span>
              </div>
            </div>
            
            {/* Divider */}
            <div className="w-[1px] bg-neutral-200 self-stretch mx-1.5" />

            {/* Right Part: Actions */}
            <div className="flex flex-col justify-around items-center pl-3 w-14 flex-shrink-0">
              <motion.button whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1 text-center"
                onClick={() => toast.success("正在唤起地图导航...")}>
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-[9px] font-semibold text-zinc-500">导航</span>
              </motion.button>
              <motion.button whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1 text-center"
                onClick={() => toast.success("正在拨打景区服务电话: 010-85007055")}>
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                  <Volume2 className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-[9px] font-semibold text-zinc-500">电话</span>
              </motion.button>
            </div>
          </div>

          {/* Card 2: Practical travel information */}
          <div className="mx-4 mt-3.5 bg-white rounded-3xl p-5 shadow-md border border-neutral-100/80 space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-[#D2A053] mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-zinc-800">开放时间</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">周一至周日 08:00 - 18:00 (16:00 停止入场)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Star className="w-4 h-4 text-[#4F6F52] mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-zinc-800">建议游玩时间</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">{spot.duration}分钟 (约 {Math.ceil(spot.duration / 60)}小时)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-zinc-800">景区门票</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">成人票60元、儿童票20元、70岁以上老人免票</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BookOpen className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-zinc-800">交通指南</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">乘坐地铁或公共大巴直达{spot.name}景区</p>
              </div>
            </div>
          </div>

          {/* Card 4: Description (景点介绍) */}
          <div className="mx-4 mt-3.5 bg-white rounded-3xl p-5 shadow-md border border-neutral-100/80 space-y-3">
            <h3 className="text-xs font-bold text-zinc-800" style={{ fontFamily: "var(--font-noto-serif)" }}>景点介绍</h3>
            <p className="text-xs leading-relaxed text-zinc-600">{spot.description}</p>
          </div>

          {/* Card 5: Nearby recommendation (附近推荐) */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...SPRING, delay: 0.25 }}
            className="mx-4 mt-3.5 bg-white rounded-3xl p-5 shadow-md border border-neutral-100/80 space-y-3">
            <h3 className="text-xs font-bold text-[#1E2522]" style={{ fontFamily: "var(--font-noto-serif)" }}>附近推荐</h3>
            
            {nearbySpots.length > 0 ? (
              <div className="grid grid-cols-1 gap-2.5">
                {nearbySpots.map((nSpot) => (
                  <Link href={`/spots/${nSpot.id}`} key={nSpot.id}>
                    <motion.div whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-3 p-2 rounded-2xl border border-[#E6E2D8] hover:bg-neutral-50 transition-colors">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={getLocalScenicImage(nSpot.imageUrl)} alt={nSpot.name} className="w-12 h-12 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1E2522] truncate">{nSpot.name}</p>
                        <p className="text-[10px] text-[#8F9F8F] mt-0.5">
                          距离当前景点约 <span className="font-mono font-bold text-[#D2A053]">{nSpot.distanceMeters}米</span>
                        </p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#8F9F8F]" />
                    </motion.div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-[#8F9F8F] py-2">正在计算附近推荐景点...</div>
            )}

            <Link href="/spots">
              <motion.div whileTap={{ scale: 0.97 }}
                className="flex items-center justify-between pt-1.5 text-xs font-bold cursor-pointer"
                style={{ color: "#4F6F52" }}>
                <span>查看全部景点导览 →</span>
              </motion.div>
            </Link>
          </motion.div>
        </div>{/* end left scroll column */}

        {/* PC right panel: sticky info + actions */}
        <div className="hidden md:flex flex-col flex-shrink-0 overflow-y-auto"
          style={{ width: 320, borderLeft: "1px solid #E6E2D8", background: "white" }}>

          {/* Hero thumbnail */}
          <div className="relative" style={{ height: 200 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getLocalScenicImage(spot.imageUrl)}
              alt={spot.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)" }} />
            <div className="absolute bottom-3 left-4 right-4">
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-noto-serif)" }}>{spot.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Star className="w-3 h-3" fill="#D2A053" style={{ color: "#D2A053" }} />
                <span className="text-[11px] text-white font-medium">{(spot.rating / 10).toFixed(1)}</span>
                <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.6)" }}>· {spot.visitCount} 次游览</span>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3 flex-1">
            {/* Stats row */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Clock, label: "建议时长", value: `${spot.duration} 分钟` },
                { icon: MapPin, label: "距入口", value: spot.distance || "景区内" },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded-xl text-center"
                  style={{ background: "#F5F0E8", border: "1px solid #E6E2D8" }}>
                  <s.icon className="w-4 h-4 mx-auto mb-1" style={{ color: "#4F6F52" }} />
                  <p className="text-[11px]" style={{ color: "#8F9F8F" }}>{s.label}</p>
                  <p className="text-[12px] font-semibold mt-0.5" style={{ color: "#1E2522" }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="space-y-2">
              <Link href={`/qa?name=${encodeURIComponent(spot.name)}`}>
                <motion.div whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer"
                  style={{ background: "linear-gradient(135deg,#4F6F52,#3A5240)", boxShadow: "0 4px 14px rgba(79,111,82,0.3)" }}>
                  <MessageCircle className="w-4 h-4" />向小玉提问
                </motion.div>
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowStory(true)}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold"
                  style={{ background: "#F5F0E8", color: "#3A4D39", border: "1px solid #E6E2D8" }}>
                  <BookOpen className="w-3.5 h-3.5" />故事讲解
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowCamera(true)}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold"
                  style={{ background: "#F5F0E8", color: "#3A4D39", border: "1px solid #E6E2D8" }}>
                  <Camera className="w-3.5 h-3.5" />拍照识景
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={speakDescription}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold"
                  style={{
                    background: speaking ? "rgba(79,111,82,0.1)" : "#F5F0E8",
                    color: speaking ? "#4F6F52" : "#3A4D39",
                    border: `1px solid ${speaking ? "rgba(79,111,82,0.3)" : "#E6E2D8"}`,
                  }}>
                  <Volume2 className="w-3.5 h-3.5" />{speaking ? "播放中" : "语音导览"}
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    try {
                      await navigator.share?.({ title: spot.name, text: spot.description, url: window.location.href });
                    } catch { toast.info("复制链接分享给好友"); }
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold"
                  style={{ background: "#F5F0E8", color: "#3A4D39", border: "1px solid #E6E2D8" }}>
                  <Share2 className="w-3.5 h-3.5" />分享
                </motion.button>
              </div>
            </div>

            {/* Tags */}
            {(spot.tags as string[])?.length > 0 && (
              <div>
                <p className="text-[11px] font-medium mb-2" style={{ color: "#8F9F8F" }}>景点标签</p>
                <div className="flex flex-wrap gap-1.5">
                  {(spot.tags as string[]).map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(79,111,82,0.08)", color: "#4F6F52", border: "1px solid rgba(79,111,82,0.2)" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>{/* end PC layout wrapper */}

      {/* Story Mode overlay */}
      <AnimatePresence>
        {showStory && (
          <StoryModePlayer
            spotId={spot.id}
            spotName={spot.name}
            onClose={() => setShowStory(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showCamera && <CameraRecognize currentSpot={spot.name} onClose={() => setShowCamera(false)} />}
      </AnimatePresence>
    </div>
  );
}

function SpotDetailSkeleton() {
  return (
    <div className="min-h-svh" style={{ background: "#FAF8F5" }}>
      <div className="skeleton" style={{ height: 280 }} />
      <div className="px-4 py-5 space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
      </div>
    </div>
  );
}
