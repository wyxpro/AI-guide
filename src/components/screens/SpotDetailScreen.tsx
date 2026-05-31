"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, MessageCircle, Clock, MapPin, Star, Volume2, Users, BookOpen, Camera, Share2 } from "lucide-react";
import Link from "next/link";
import { useEazo } from "@eazo/sdk/react";
import { request } from "@/lib/api/request";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { StoryModePlayer } from "@/components/ui/StoryModePlayer";
import { CameraRecognize } from "@/components/ui/CameraRecognize";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 35 };

interface Spot { id: number; name: string; category: string; description: string; imageUrl: string; audioGuide: string; duration: number; distance: string; rating: number; visitCount: number; tags: string[] }

export function SpotDetailScreen({ spotId }: { spotId: string }) {
  const user = useEazo((s) => s.auth.user);
  const searchParams = useSearchParams();
  const autoplay = searchParams.get("autoplay") === "true";
  const [spot, setSpot] = useState<Spot | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const [favId, setFavId] = useState<number | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [showStory, setShowStory] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [autoplayBanner, setAutoplayBanner] = useState(autoplay);

  useEffect(() => {
    fetch(`/api/spots/${spotId}`)
      .then((r) => r.json())
      .then((d) => { setSpot(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [spotId]);

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
    <div className="min-h-svh" style={{ background: "#FAF8F5" }}>
      {/* PC layout wrapper */}
      <div className="md:flex md:h-svh md:overflow-hidden">
        {/* Mobile/PC left: content scroll column */}
        <div className="flex-1 md:overflow-y-auto">

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

      {/* Hero image */}
      <div className="relative" style={{ height: 280 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={spot.imageUrl || "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80"} alt={spot.name}
          className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(0,0,0,0.5) 100%)" }} />

        {/* Back + Favorite */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4"
          style={{ paddingTop: "calc(env(safe-area-inset-top, 44px) + 8px)" }}>
          <Link href="/spots">
            <motion.button whileTap={{ scale: 0.88 }}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}>
              <ArrowLeft className="w-4 h-4 text-white" />
            </motion.button>
          </Link>
          <motion.button whileTap={{ scale: 0.88 }} onClick={toggleFavorite}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}>
            <Heart className="w-4 h-4" fill={favorited ? "#DC2626" : "none"} style={{ color: favorited ? "#DC2626" : "white" }} />
          </motion.button>
        </div>

        {/* Bottom title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: "rgba(210,160,83,0.85)", color: "white" }}>
              {spot.category === "cultural" ? "人文" : spot.category === "nature" ? "自然" : spot.category === "history" ? "历史" : "亲子"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-noto-serif)", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
            {spot.name}
          </h1>
        </div>
      </div>

      {/* Info bar */}
      <div className="px-4 py-3 flex items-center gap-4" style={{ background: "white", borderBottom: "1px solid #E6E2D8" }}>
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" style={{ color: "#D2A053" }} />
          <span className="text-xs" style={{ color: "#3A4D39" }}>{spot.duration} 分钟</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" style={{ color: "#4F6F52" }} />
          <span className="text-xs" style={{ color: "#3A4D39" }}>{spot.distance}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" style={{ color: "#8F9F8F" }} />
          <span className="text-xs" style={{ color: "#8F9F8F" }}>{(spot.visitCount / 1000).toFixed(1)}k 游览</span>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Star className="w-3.5 h-3.5" fill="#D2A053" style={{ color: "#D2A053" }} />
          <span className="text-xs font-semibold" style={{ color: "#1E2522" }}>{(spot.rating / 10).toFixed(1)}</span>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4 max-w-2xl mx-auto">
        {/* AI导览官 CTA */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
          className="rounded-2xl p-4 flex items-center gap-4"
          style={{ background: "linear-gradient(135deg, #2B3530, #1A2420)", border: "1px solid rgba(210,160,83,0.3)" }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bold"
            style={{ background: "linear-gradient(135deg, #4F6F52, #3A5240)", color: "#D2A053", fontFamily: "var(--font-noto-serif)", boxShadow: "0 0 16px rgba(210,160,83,0.4)" }}>
            玉
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold" style={{ color: "#D2A053", fontFamily: "var(--font-noto-serif)" }}>导览官小玉</p>
            <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>点击向我提问关于{spot.name}的任何问题</p>
          </div>
          <Link href={`/qa?spot=${spot.id}&name=${encodeURIComponent(spot.name)}`}>
            <motion.div whileTap={{ scale: 0.92 }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: "rgba(210,160,83,0.2)", color: "#D2A053", border: "1px solid rgba(210,160,83,0.4)" }}>
              <MessageCircle className="w-3.5 h-3.5 inline mr-1" />提问
            </motion.div>
          </Link>
        </motion.div>

        {/* Story Mode CTA */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.08 }}
          className="rounded-2xl overflow-hidden cursor-pointer"
          style={{ background: "linear-gradient(135deg,#2A1A08,#1A0E00)", border: "1px solid rgba(210,160,83,0.25)" }}
          onClick={() => setShowStory(true)}>
          <div className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: "rgba(210,160,83,0.15)", border: "1px solid rgba(210,160,83,0.3)" }}>
              📖
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: "#F0CC88", fontFamily: "var(--font-noto-serif)" }}>
                故事讲解模式
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                4章节沉浸式剧情叙事 · 语音+文字同步
              </p>
            </div>
            <motion.div whileTap={{ scale: 0.9 }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
              style={{ background: "rgba(210,160,83,0.2)", color: "#D2A053", border: "1px solid rgba(210,160,83,0.35)" }}>
              <BookOpen className="w-3 h-3" />开启
            </motion.div>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.1 }}
          className="card-ink p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>景点介绍</h3>
            <motion.button whileTap={{ scale: 0.88 }} onClick={speakDescription}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px]"
              style={{ background: speaking ? "rgba(79,111,82,0.15)" : "#F5F0E8", color: speaking ? "#4F6F52" : "#8F9F8F", border: `1px solid ${speaking ? "rgba(79,111,82,0.4)" : "#E6E2D8"}` }}>
              <Volume2 className="w-3 h-3" />{speaking ? "停止" : "语音讲解"}
            </motion.button>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#3A4D39" }}>{spot.description}</p>
        </motion.div>

        {/* Tags */}
        {((spot.tags as string[]) || []).length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...SPRING, delay: 0.15 }}
            className="flex flex-wrap gap-2">
            {(spot.tags as string[]).map((tag) => (
              <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full"
                style={{ background: "rgba(79,111,82,0.1)", color: "#4F6F52", border: "1px solid rgba(79,111,82,0.2)" }}>
                {tag}
              </span>
            ))}
          </motion.div>
        )}

        {/* User Rating */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.2 }}
          className="card-ink p-4">
          <h3 className="text-sm font-semibold mb-3" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
            {user ? "您的评分" : "游览评分"}
          </h3>
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <motion.button key={s} whileTap={{ scale: 0.85 }} onClick={() => setUserRating(s)}>
                      <Star className="w-7 h-7" fill={s <= userRating ? "#D2A053" : "none"}
                        style={{ color: s <= userRating ? "#D2A053" : "#E6E2D8" }} />
                    </motion.button>
                  ))}
                </div>
                {userRating > 0 && (
                  <span className="text-sm font-semibold" style={{ color: "#D2A053" }}>
                    {userRating === 5 ? "非常满意" : userRating === 4 ? "满意" : userRating === 3 ? "一般" : userRating === 2 ? "不太满意" : "不满意"}
                  </span>
                )}
              </div>
              {userRating > 0 && (
                <motion.button whileTap={{ scale: 0.97 }}
                  className="text-xs px-4 py-2 rounded-lg text-white"
                  style={{ background: "linear-gradient(135deg, #4F6F52, #3A5240)" }}
                  onClick={() => toast.success("评分已提交，感谢您的反馈！")}>
                  提交评分
                </motion.button>
              )}
            </div>
          ) : (
            <p className="text-sm" style={{ color: "#8F9F8F" }}>
              <Link href="/profile"><span style={{ color: "#4F6F52" }}>登录</span></Link> 后可以为景点评分
            </p>
          )}
        </motion.div>

        {/* Related spots suggestion */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...SPRING, delay: 0.25 }}
          className="card-ink p-4">
          <h3 className="text-sm font-semibold mb-2" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>附近推荐</h3>
          <Link href="/spots">
            <motion.div whileTap={{ scale: 0.97 }}
              className="flex items-center justify-between py-2 text-sm"
              style={{ color: "#4F6F52" }}>
              查看全部景点导览 →
            </motion.div>
          </Link>
        </motion.div>
      </div>
      <div style={{ height: 24 }} />
        </div>{/* end left scroll column */}

        {/* PC right panel: sticky info + actions */}
        <div className="hidden md:flex flex-col flex-shrink-0 overflow-y-auto"
          style={{ width: 320, borderLeft: "1px solid #E6E2D8", background: "white" }}>

          {/* Hero thumbnail */}
          <div className="relative" style={{ height: 200 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={spot.imageUrl || "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80"}
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
