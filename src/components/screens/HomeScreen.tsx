"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, ChevronRight, Star, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getLocalScenicImage } from "@/lib/scenic-image";

const SPRING = { type: "spring" as const, stiffness: 300, damping: 32 };
interface Spot { id: number; name: string; imageUrl: string; rating: number; duration: number }

const CITY_BANNERS = [
  { city: "重庆", title: "洪崖洞夜色", img: "/images/spots/10011.webp" },
  { city: "杭州", title: "西湖烟柳", img: "/images/spots/10005.webp" },
  { city: "北京", title: "故宫红墙", img: "/images/spots/10001.webp" },
  { city: "西安", title: "古城晨光", img: "/images/spots/10004.webp" },
  { city: "上海", title: "外滩天际", img: "/images/spots/10009.webp" },
];

/* ═══════════════════════════════════════════════════════
   根组件
   PCView / MobileView Unified
   ═══════════════════════════════════════════════════════ */
export default function HomeScreen() {
  return (
    <>
      {/* ── 移动端 ── */}
      <div className="md:hidden min-h-svh flex flex-col w-full max-w-full overflow-x-hidden bg-white">
        <MobileView />
      </div>
      {/* ── PC 端 ── */}
      <div className="hidden md:flex h-screen overflow-hidden bg-[#FAF8F5]">
        <PCView />
      </div>
    </>
  );
}

function PCView() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(false);
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setBannerIndex((i) => (i + 1) % CITY_BANNERS.length), 4200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch("/api/spots?category=national&limit=8")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSpots(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAudioPlay = () => {
    if (isPlaying) {
      audio?.pause();
      setIsPlaying(false);
    } else {
      if (audio) {
        audio.play();
        setIsPlaying(true);
      } else {
        const newAudio = new Audio("/api/qa/tts?text=" + encodeURIComponent("欢迎来到智慧景区导览系统！我们为您精选了多处名胜大川，并集成了AI专属路线规划与语音讲解。祝您拥有完美的旅程！"));
        newAudio.play();
        newAudio.onended = () => setIsPlaying(false);
        setAudio(newAudio);
        setIsPlaying(true);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audio) audio.pause();
    };
  }, [audio]);

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#FAF8F5] text-zinc-800 overflow-y-auto">
      {/* Main Body */}
      <div className="flex-1 w-full max-w-full px-6 lg:px-10 py-8 space-y-10">
        {/* Hero Banner Area */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: Banner Cover */}
          <div className="lg:col-span-8 rounded-3xl overflow-hidden relative min-h-[350px] shadow-lg flex flex-col justify-end p-8 text-white group">
            <div className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-105">
              <AnimatePresence mode="wait">
                <motion.img
                  key={CITY_BANNERS[bannerIndex].city}
                  src={CITY_BANNERS[bannerIndex].img}
                  alt={CITY_BANNERS[bannerIndex].title}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                  className="absolute inset-0 w-full h-full object-cover brightness-[0.72]"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            </div>
            <div className="relative z-10 space-y-4 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="bg-[#FF5B45] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">热门推荐</span>
                <span className="text-xs text-white/80 font-medium">{CITY_BANNERS[bannerIndex].city} · {CITY_BANNERS[bannerIndex].title}</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-wide drop-shadow-md leading-tight" style={{ fontFamily: "var(--font-noto-serif)" }}>
                十座名山大川，邀你登顶揽胜
              </h1>
              <p className="text-sm text-zinc-200/90 leading-relaxed drop-shadow-sm">
                去爬爬山，呼吸下新鲜空气，看看不一样的风景！融合AI专属路线规划与语音沉浸讲解，带给您全新的智慧旅游探秘体验。
              </p>
              {/* Search Box */}
              <div className="flex items-center bg-white rounded-full p-1.5 shadow-md max-w-md border border-zinc-200 text-zinc-900 mt-2">
                <div className="flex items-center gap-1.5 px-3 flex-shrink-0 font-semibold text-zinc-800 text-xs border-r border-zinc-200">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  <span>景区探索</span>
                </div>
                <input
                  type="text"
                  placeholder="搜索想去的景区..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && router.push(`/spots?search=${encodeURIComponent(search)}`)}
                  className="flex-1 bg-transparent text-xs outline-none px-3 text-zinc-800"
                />
                <button
                  onClick={() => router.push(`/spots?search=${encodeURIComponent(search)}`)}
                  className="w-8 h-8 rounded-full bg-[#3A4D39] text-white flex items-center justify-center hover:bg-[#4F6F52] transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2 pt-1">
                {CITY_BANNERS.map((banner, index) => (
                  <button
                    key={banner.city}
                    onClick={() => setBannerIndex(index)}
                    className={`h-1.5 rounded-full transition-all ${index === bannerIndex ? "w-8 bg-white" : "w-2 bg-white/45 hover:bg-white/70"}`}
                    aria-label={`切换到${banner.city}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: AI Assistant Box */}
          <div className="lg:col-span-4 rounded-3xl bg-white border border-zinc-200/70 p-6 flex flex-col justify-between shadow-md">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border border-zinc-100 bg-[#FAF8F5] flex-shrink-0 flex items-center justify-center">
                  <img
                    src="/images/spots/10007.webp"
                    alt="成都大熊猫基地"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-sm leading-snug">智能导览官</h3>
                  <span className="text-[10px] text-zinc-500 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                    AI小玉 · 在线讲解中
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#F5EED8] text-xs leading-relaxed text-zinc-700">
                "欢迎来到智慧文旅门户！我是您的AI导览官小玉。点击下方播放按钮即可听取城市景区的专属语音导览讲解，或点击视频互动按钮直接与我的数字人分身开启聊天！"
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
              <button
                onClick={() => router.push("/spots/10001?showStory=true")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FFF0ED] text-[#FF5B45] hover:bg-[#FFE0DB] transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                </svg>
                语音讲解
              </button>

              <button
                onClick={() => router.push("/qa")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#3A4D39] text-white hover:bg-[#4F6F52] transition-colors shadow-sm"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                数字人导游
              </button>
            </div>
          </div>
        </section>

        {/* Entrance Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ y: -4 }}
            onClick={() => router.push("/spots?category=cultural")}
            className="relative bg-gradient-to-br from-[#FFF5F2] to-[#FFF8F6] border border-[#FFE8E2] rounded-3xl p-6 min-h-[120px] flex items-center justify-between overflow-hidden shadow-sm cursor-pointer group"
          >
            <div className="space-y-2 relative z-10">
              <span className="text-lg font-black text-[#FF5B45] tracking-wide block">全国热门</span>
              <p className="text-xs text-zinc-600 max-w-[280px]">感受名校文化底蕴与学府风范，量身定制名校求索打卡路线。</p>
              <span className="text-[10px] font-bold text-white bg-[#FF5B45] px-2.5 py-0.5 rounded-full inline-flex items-center gap-0.5 shadow-sm mt-1">
                立即前往
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>
            <span className="text-6xl select-none opacity-80 transition-transform duration-300 group-hover:scale-110">🏫</span>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            onClick={() => router.push("/fm")}
            className="relative bg-gradient-to-br from-[#FCF8EE] to-[#FAF6E8] border border-[#F5EED8] rounded-3xl p-6 min-h-[120px] flex items-center justify-between overflow-hidden shadow-sm cursor-pointer group"
          >
            <div className="space-y-2 relative z-10">
              <span className="text-lg font-black text-[#D2A053] tracking-wide block">伴游FM</span>
              <p className="text-xs text-zinc-600 max-w-[280px]">聆听历史的回响，伴随旅途开启FM精讲与人文漫步收听。</p>
              <span className="text-[10px] font-bold text-white bg-[#D2A053] px-2.5 py-0.5 rounded-full inline-flex items-center gap-0.5 shadow-sm mt-1">
                立即收听
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>
            <span className="text-6xl select-none opacity-80 transition-transform duration-300 group-hover:scale-110">📻</span>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            onClick={() => router.push("/vr-recognize")}
            className="relative bg-gradient-to-br from-[#EEF7F2] to-[#E8F2EC] border border-[#D5EDE0] rounded-3xl p-6 min-h-[120px] flex items-center justify-between overflow-hidden shadow-sm cursor-pointer group"
          >
            <div className="space-y-2 relative z-10">
              <span className="text-lg font-black text-[#4F6F52] tracking-wide block">VR 3D 识景</span>
              <p className="text-xs text-zinc-600 max-w-[280px]">即拍即识，AI 即时识别并输出深度文化解读，带您开启沉浸式体验。</p>
              <span className="text-[10px] font-bold text-white bg-[#4F6F52] px-2.5 py-0.5 rounded-full inline-flex items-center gap-0.5 shadow-sm mt-1">
                立即识别
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>
            <span className="text-6xl select-none opacity-80 transition-transform duration-300 group-hover:scale-110">🕶️</span>
          </motion.div>
        </section>

        {/* Hot Spots Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-zinc-900 flex items-center gap-2" style={{ fontFamily: "var(--font-noto-serif)" }}>
              <Star className="w-4.5 h-4.5 text-[#D2A053]" fill="#D2A053" />
              热门景区推荐
            </h2>
            <Link href="/spots" className="text-sm text-[#3A4D39] hover:text-[#4F6F52] font-semibold flex items-center gap-0.5">
              全部景区 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {loading || spots.length === 0
              ? [1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton h-[240px] rounded-3xl" />
              ))
              : spots.slice(0, 8).map((spot, i) => (
                <Link key={spot.id} href={`/spots/${spot.id}`} className="block">
                  <motion.div
                    whileHover={{ y: -6, boxShadow: "0 12px 28px rgba(0,0,0,0.08)" }}
                    className="rounded-3xl overflow-hidden bg-white border border-zinc-200/60 shadow-sm flex flex-col h-full"
                  >
                    <div className="relative h-[150px] overflow-hidden">
                      <img
                        src={getLocalScenicImage(spot.imageUrl)}
                        alt={spot.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                      <div className="absolute bottom-3 right-3 flex items-center gap-0.5 bg-black/45 backdrop-blur-md px-2 py-0.5 rounded-full">
                        <Star className="w-3.5 h-3.5 text-[#D2A053]" fill="#D2A053" />
                        <span className="text-[11px] text-white font-bold">
                          {(spot.rating / 10).toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                      <h4 className="font-bold text-zinc-900 text-sm truncate" style={{ fontFamily: "var(--font-noto-serif)" }}>
                        {spot.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        <span>建议游玩 {spot.duration} 分钟</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
          </div>
        </section>
      </div>

      {/* Desktop Footer */}
      <footer className="w-full bg-white border-t border-zinc-200/60 py-6 mt-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-zinc-400">
          <span>© 2026 旅行家Pro·智慧景区导游系统. All Rights Reserved.</span>
          <div className="flex gap-4 mt-2 md:mt-0">
            <a href="#" className="hover:text-zinc-600">服务条款</a>
            <a href="#" className="hover:text-zinc-600">隐私权政策</a>
            <a href="#" className="hover:text-zinc-600">联系我们</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   移动端整体视图
   ═══════════════════════════════════════════════════════ */
function MobileView() {
  return (
    <div className="flex flex-col bg-white w-full">
      <MobileHeaderAndBanner />
      <MobileChengduPanel />
      <MobileEntranceCards />
      <MobileSpots />
      {/* Bottom spacer for bottom navigation bar */}
      <div style={{ height: 80 }} />
    </div>
  );
}

function MobileCityStrip() {
  return (
    <div className="px-4 pt-3 -mt-2">
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2">
        {CITY_BANNERS.map((banner) => (
          <div
            key={banner.city}
            className="flex-shrink-0 w-44 rounded-2xl overflow-hidden border border-zinc-200 shadow-sm bg-white"
          >
            <div className="relative h-20">
              <img src={banner.img} alt={banner.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
              <div className="absolute left-2.5 bottom-2.5">
                <div className="text-[11px] font-black text-white">{banner.city}</div>
                <div className="text-[10px] text-white/80 font-semibold">{banner.title}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Header, Weather, Search Pill, Banner (strictly mirrors mockup)
   ═══════════════════════════════════════════════════════ */
function MobileHeaderAndBanner() {
  const router = useRouter();
  const [time, setTime] = useState("09:41");
  const [search, setSearch] = useState("");
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setBannerIndex((i) => (i + 1) % CITY_BANNERS.length), 4200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      setTime(`${h}:${m}`);
    };
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-neutral-900 aspect-[375/300] flex flex-col justify-between pb-8">
      {/* Background Banner Image */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence>
          <motion.img
            key={CITY_BANNERS[bannerIndex].city}
            src={CITY_BANNERS[bannerIndex].img}
            alt={CITY_BANNERS[bannerIndex].title}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full object-cover brightness-[0.75]"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/60" />
      </div>

      {/* 2. Search Bar Pill + Map Button (Weather Status Bar Removed, Height expanded) */}
      <div className="relative z-10 px-4 pt-5 flex items-center gap-2">
        {/* Search Pill Container */}
        <div className="flex-1 h-12 flex items-center bg-white/95 backdrop-blur-md rounded-full px-4 border border-zinc-200/50 shadow-sm">
          {/* Location Trigger */}
          <Link href="/spots" className="flex items-center gap-0.5 text-xs font-bold text-zinc-800 flex-shrink-0 cursor-pointer">
            <MapPin className="w-3.5 h-3.5 text-zinc-700" fill="currentColor" />
            <span>成都</span>
            <ChevronRight className="w-3 h-3 text-zinc-500 rotate-90" />
          </Link>
          <div className="w-[1px] h-3.5 bg-zinc-300 mx-2" />

          {/* Search Input */}
          <div className="flex-1 flex items-center gap-1.5">
            <input
              type="text"
              placeholder="搜索景区"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && router.push(`/spots?search=${encodeURIComponent(search)}`)}
              className="w-full bg-transparent text-xs outline-none text-zinc-900 placeholder-zinc-500 font-medium"
            />
            <button onClick={() => router.push(`/spots?search=${encodeURIComponent(search)}`)}>
              <Search className="w-4 h-4 text-zinc-600 hover:text-black flex-shrink-0" />
            </button>
          </div>
        </div>

        {/* Map Button */}
        <Link href="/routes">
          <div className="w-12 h-12 bg-white/95 backdrop-blur-md border border-zinc-200/50 rounded-xl shadow-sm flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 transition-colors">
            <svg className="w-4 h-4 text-[#FF5B45]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
              <line x1="9" y1="3" x2="9" y2="18" />
              <line x1="15" y1="6" x2="15" y2="21" />
            </svg>
            <span className="text-[8px] font-bold text-zinc-800 mt-0.5 leading-none">地图</span>
          </div>
        </Link>
      </div>

      {/* 3. Banner Slogan Text Overlay */}
      <div className="relative z-10 px-6 mt-auto mb-2 flex flex-col select-none">
        <h1 className="text-2xl font-black text-white tracking-wide drop-shadow-md" style={{ fontFamily: "var(--font-noto-serif)" }}>
          十座名山大川 <span className="inline-block bg-[#FF5B45] text-white text-[10px] px-1.5 py-0.5 rounded ml-1 align-middle font-bold">热门</span>
        </h1>
        <h2 className="text-xl font-bold text-white tracking-wide mt-0.5 drop-shadow-md" style={{ fontFamily: "var(--font-noto-serif)" }}>
          邀你登顶揽胜
        </h2>

        {/* Soft translucent red sub-banner */}
        <div className="mt-2.5 bg-[#FF5B45]/90 text-white text-[10px] px-3.5 py-1.5 rounded-full font-semibold w-fit shadow-sm">
          去爬爬山，呼吸下新鲜空气，看看不一样的风景！
        </div>
      </div>

      {/* 4. Banner Carousel Indicator dots */}
      <div className="absolute bottom-11 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
        {CITY_BANNERS.map((banner, index) => (
          <button
            key={banner.city}
            onClick={() => setBannerIndex(index)}
            className={index === bannerIndex ? "w-3.5 h-1 bg-white rounded-full" : "w-1 h-1 bg-white/50 rounded-full"}
            aria-label={`切换到${banner.city}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Chengdu City Summary Panel with TTS Audio Guide
   ═══════════════════════════════════════════════════════ */
function MobileChengduPanel() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const handleAudioPlay = () => {
    if (isPlaying) {
      audio?.pause();
      setIsPlaying(false);
    } else {
      if (audio) {
        audio.play();
        setIsPlaying(true);
      } else {
        const newAudio = new Audio("/api/qa/tts?text=" + encodeURIComponent("欢迎来到锦绣蓉城成都！成都是四川省省会，古蜀文明的发祥地，拥有武侯祠、杜甫草堂、金沙遗址等名胜古迹，还有可爱的大熊猫和令人垂涎的川味美食。祝您旅途愉快！"));
        newAudio.play();
        newAudio.onended = () => setIsPlaying(false);
        setAudio(newAudio);
        setIsPlaying(true);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [audio]);

  return (
    <div className="relative z-20 px-4 -mt-6">
      <div className="bg-white rounded-2xl p-3 flex items-center justify-between shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-neutral-100">

        {/* Left: Panda Avatar and title */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-neutral-100 flex-shrink-0 bg-neutral-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/spots/10007.webp"
              alt="成都大熊猫基地"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-zinc-900 leading-tight">成都市概况</span>
            <div className="flex items-center gap-0.5 mt-0.5 cursor-pointer">
              <span className="text-[10px] text-zinc-500 font-semibold">讲解词</span>
              <svg className="w-2.5 h-2.5 text-zinc-400 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right: Audio and Video buttons */}
        <div className="flex items-center gap-3">
          {/* Audio/Explain button */}
          <div
            onClick={() => router.push("/spots/10001?showStory=true")}
            className="flex flex-col items-center cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all bg-[#FFF0ED] text-[#FF5B45] hover:bg-[#FFE0DB]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            </div>
            <span className="text-[9px] font-bold text-zinc-700 mt-1">语音讲解</span>
          </div>

          {/* Digital Human button */}
          <div
            onClick={() => router.push("/qa")}
            className="flex flex-col items-center cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-full bg-[#FFF0ED] text-[#FF5B45] flex items-center justify-center shadow-sm hover:bg-[#FFE0DB] transition-colors">
              <svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <span className="text-[9px] font-bold text-zinc-700 mt-1">数字人导游</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Custom Entrance Buttons (全国热门 & 文博精讲 & VR识别)
   ═══════════════════════════════════════════════════════ */
function MobileEntranceCards() {
  const router = useRouter();

  return (
    <div className="px-4 mt-4 grid grid-cols-3 gap-2 select-none">
      {/* 1. 全国热门 */}
      <motion.div
        whileTap={{ scale: 0.96 }}
        onClick={() => router.push("/spots?category=cultural")}
        className="relative bg-gradient-to-br from-[#FFF5F2] to-[#FFF8F6] border border-[#FFE8E2] rounded-2xl p-2.5 h-[84px] flex flex-col justify-between overflow-hidden shadow-[0_2px_8px_rgba(255,91,69,0.03)] cursor-pointer"
      >
        <div className="flex flex-col">
          <span className="text-[11px] font-black text-[#FF5B45] tracking-wide">全国热门</span>
          <span className="text-[7.5px] font-bold text-white bg-[#FF5B45] px-1 py-0.5 rounded-full w-fit mt-1 shadow-sm leading-none flex items-center gap-0.5">
            热门景点
            <svg className="w-1.5 h-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </div>

        <span className="absolute bottom-1 right-1 text-[30px] leading-none opacity-85 select-none pointer-events-none">
          🏫
        </span>
      </motion.div>
      {/* 2. 伴游FM */}
      <motion.div
        whileTap={{ scale: 0.96 }}
        onClick={() => router.push("/fm")}
        className="relative bg-gradient-to-br from-[#FCF8EE] to-[#FAF6E8] border border-[#F5EED8] rounded-2xl p-2.5 h-[84px] flex flex-col justify-between overflow-hidden shadow-[0_2px_8px_rgba(210,160,83,0.03)] cursor-pointer"
      >
        <div className="flex flex-col">
          <span className="text-[11px] font-black text-[#D2A053] tracking-wide">伴游FM</span>
          <span className="text-[7.5px] font-bold text-white bg-[#D2A053] px-1 py-0.5 rounded-full w-fit mt-1 shadow-sm leading-none flex items-center gap-0.5">
            旅途FM
            <svg className="w-1.5 h-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </div>

        <span className="absolute bottom-1.5 right-1.5 text-[26px] leading-none opacity-85 select-none pointer-events-none">
          📻
        </span>
      </motion.div>
      {/* 3. VR 识别 */}
      <motion.div
        whileTap={{ scale: 0.96 }}
        onClick={() => router.push("/vr-recognize")}
        className="relative bg-gradient-to-br from-[#EEF7F2] to-[#E8F2EC] border border-[#D5EDE0] rounded-2xl p-2.5 h-[84px] flex flex-col justify-between overflow-hidden shadow-[0_2px_8px_rgba(79,111,82,0.03)] cursor-pointer"
      >
        <div className="flex flex-col">
          <span className="text-[11px] font-black text-[#4F6F52] tracking-wide">VR识别</span>
          <span className="text-[7.5px] font-bold text-white bg-[#4F6F52] px-1 py-0.5 rounded-full w-fit mt-1 shadow-sm leading-none flex items-center gap-0.5">
            即拍即识
            <svg className="w-1.5 h-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </div>

        <span className="absolute bottom-1.5 right-1.5 text-[26px] leading-none opacity-85 select-none pointer-events-none">
          🕶️
        </span>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   热门景点横滑 (UNCHANGED - As strictly requested by the user)
   ═══════════════════════════════════════════════════════ */
function MobileSpots() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadSpots = async (p: number) => {
    if (loading) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/spots?category=national&page=${p}&limit=6`);
      const d = await r.json();
      if (Array.isArray(d)) {
        if (d.length < 4) setHasMore(false);
        setSpots(prev => {
          const ids = new Set(prev.map(s => s.id));
          const uniq = d.filter(s => !ids.has(s.id));
          return [...prev, ...uniq];
        });
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpots(1);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollLeft + target.clientWidth >= target.scrollWidth - 60) {
      if (hasMore && !loading) {
        const next = page + 1;
        setPage(next);
        loadSpots(next);
      }
    }
  };

  return (
    <div className="pt-3">
      <div className="flex items-center justify-between px-4 mb-2">
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5" fill="#D2A053" style={{ color: "#D2A053" }} />
          <span className="text-[12px] font-semibold"
            style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>热门景点</span>
        </div>
        <Link href="/spots">
          <span className="text-[11px] flex items-center gap-0.5" style={{ color: "#4F6F52" }}>
            全部 <ChevronRight className="w-3 h-3" />
          </span>
        </Link>
      </div>
      <div
        className="flex gap-3 pl-4 pr-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
        onScroll={handleScroll}
      >
        {spots.length === 0 && loading
          ? [1, 2, 3].map(i => (
            <div key={i} className="skeleton rounded-2xl flex-shrink-0"
              style={{ width: 130, height: 160 }} />
          ))
          : spots.map((spot, i) => (
            <Link key={spot.id} href={`/spots/${spot.id}`} className="flex-shrink-0 block" style={{ width: 130 }}>
              <motion.div whileTap={{ scale: 0.94 }}
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ ...SPRING, delay: i * 0.05 }}
                className="w-full h-full rounded-2xl overflow-hidden"
                style={{
                  background: "white", border: "1px solid #E6E2D8",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                }}>
                <div className="relative" style={{ height: 100 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getLocalScenicImage(spot.imageUrl)}
                    alt={spot.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0"
                    style={{ background: "linear-gradient(to top,rgba(0,0,0,0.38) 0%,transparent 55%)" }} />
                  <div className="absolute bottom-1.5 right-2 flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5" fill="#D2A053" style={{ color: "#D2A053" }} />
                    <span className="text-[10px] text-white font-semibold">
                      {(spot.rating / 10).toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="px-2.5 py-2">
                  <p className="font-semibold text-[12px] truncate"
                    style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
                    {spot.name}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="w-2.5 h-2.5" style={{ color: "#8F9F8F" }} />
                    <span className="text-[10px]" style={{ color: "#8F9F8F" }}>{spot.duration}分钟</span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        {loading && spots.length > 0 && (
          <div className="flex items-center justify-center flex-shrink-0 w-24 h-[160px] rounded-2xl border border-dashed border-[#8F9F8F] text-[11px]" style={{ color: "#8F9F8F" }}>
            加载中...
          </div>
        )}
      </div>
    </div>
  );
}

// Named re-exports kept for backward compatibility
export { HomeScreen as HomeHero };
export function HomeNavCards() { return null; }
export function HomeSpotRoll() { return null; }
export function HomeMapTease() { return null; }
