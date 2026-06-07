"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass, ArrowRight, Loader2, MapPin, Clock, ChevronLeft,
  Share2, MessageSquare, ShieldAlert, Award, Search, Send,
  Volume2, VolumeX, Eye, BookOpen, Navigation, Landmark, Sparkles
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 35 };

const INTERESTS = [
  { id: "history", label: "人文史学", emoji: "📖" },
  { id: "nature", label: "山水自然", emoji: "🏔️" },
  { id: "family", label: "亲子游览", emoji: "👨‍👩‍👧" },
  { id: "cultural", label: "东方人文", emoji: "🏛️" },
];

const CHONGQING_SPOTS = [
  { id: 1, name: "洪崖洞民俗风貌区", type: "地标", lat: 29.563, lng: 106.578, price: "免费", time: "全天开放", addr: "重庆市渝中区嘉陵江滨江路88号", distance: "距您 1.2km", rating: "5A景区", img: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&q=80", desc: "以巴渝传统建筑特色的“吊脚楼”风貌为主体，依山就势，沿江而建。" },
  { id: 2, name: "解放碑步行街", type: "文化", lat: 29.557, lng: 106.577, price: "免费", time: "全天开放", addr: "重庆市渝中区民族路177号", distance: "距您 1.8km", rating: "4A景区", img: "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=400&q=80", desc: "重庆的标志性地标，纪念抗日战争胜利的纪念碑，也是繁华的商业中心。" },
  { id: 3, name: "朝天门广场", type: "地标", lat: 29.569, lng: 106.583, price: "免费", time: "全天开放", addr: "重庆市渝中区长滨路1号", distance: "距您 2.5km", rating: "4A景区", img: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=80", desc: "嘉陵江与长江交汇处，两江汇流，泾渭分明，雄伟壮观。" },
  { id: 4, name: "李子坝轻轨穿楼", type: "自然", lat: 29.553, lng: 106.517, price: "免费", time: "全天开放", addr: "重庆市渝中区李子坝正街39号", distance: "距您 5.4km", rating: "网红打卡点", img: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&q=80", desc: "轻轨2号线穿楼而过，极具立体魔幻都市的特色景观。" },
  { id: 5, name: "磁器口古镇", type: "文化", lat: 29.582, lng: 106.452, price: "免费", time: "全天开放", addr: "重庆市沙坪坝区磁南街1号", distance: "距您 11km", rating: "4A景区", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80", desc: "一条石板路，千年磁器口。典型的川东民居古镇，特色小吃汇聚。" },
  { id: 6, name: "南山一棵树观景台", type: "自然", lat: 29.550, lng: 106.592, price: "¥30", time: "09:00-22:30", addr: "重庆市南岸区龙黄公路", distance: "距您 4.6km", rating: "4A景区", img: "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=400&q=80", desc: "俯瞰渝中半岛、欣赏重庆魔幻璀璨夜景的绝佳地点。" },
  { id: 7, name: "长江索道", type: "地标", lat: 29.557, lng: 106.581, price: "¥20", time: "07:30-22:00", addr: "重庆市渝中区新华路151号", distance: "距您 1.5km", rating: "4A景区", img: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&q=80", desc: "重庆“空中公交”，滑行于两江之上，体验跨江凌空的震撼感。" },
  { id: 8, name: "罗汉寺", type: "寺庙", lat: 29.560, lng: 106.579, price: "¥20", time: "08:00-17:00", addr: "重庆市渝中区罗汉寺街7号", distance: "距您 1.4km", rating: "全国重点寺庙", img: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&q=80", desc: "千年古刹，闹市之中的静谧清修之地，电影《疯狂的石头》取景地。" },
  { id: 9, name: "十八梯老街", type: "文化", lat: 29.551, lng: 106.568, price: "免费", time: "全天开放", addr: "重庆市渝中区中兴路1号", distance: "距您 2.1km", rating: "历史风貌区", img: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=80", desc: "承载着老重庆的市井记忆，吊脚楼与青石板阶梯层层叠叠。" },
  { id: 10, name: "重庆大剧院", type: "演出", lat: 29.569, lng: 106.572, price: "按剧目收费", time: "按演出时间", addr: "重庆市江北区江北嘴文华街1号", distance: "距您 2.8km", rating: "城市地标", img: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=400&q=80", desc: "玻璃外墙如璀璨的水晶，是重庆江畔高雅艺术的殿堂。" },
  { id: 11, name: "三峡博物馆", type: "文化", lat: 29.559, lng: 106.549, price: "免费", time: "09:00-17:00", addr: "重庆市渝中区人民路236号", distance: "距您 3.9km", rating: "国家一级博物馆", img: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=80", desc: "弘扬三峡文化、保护长江文明的标志性艺术殿堂。" }
];

const PRESET_THEME_ROUTES = [
  { id: "route-1", name: "巴渝文化历史游", duration: "约6小时", spots: [11, 2, 8, 1, 9] },
  { id: "route-2", name: "魔幻两江风光游", duration: "约5小时", spots: [4, 10, 3, 7, 6] },
  { id: "route-3", name: "亲子合家欢乐游", duration: "约4小时", spots: [5, 4, 1, 7] }
];

interface GeneratedRoute {
  name: string;
  description: string;
  highlights: string[];
  tips: string;
  spots: Array<{ id: number; name: string; duration: number; description: string }>;
  totalDuration: number;
  totalDistance: string;
}

export function RoutesScreen() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["history"]);
  const [duration, setDuration] = useState(120);
  const [generating, setGenerating] = useState(false);
  const [activeRoute, setActiveRoute] = useState<GeneratedRoute | null>(null);

  // Active highlighted spot
  const [activeSpot, setActiveSpot] = useState<typeof CHONGQING_SPOTS[0]>(CHONGQING_SPOTS[0]);
  const [searchQuery, setSearchQuery] = useState("");

  // Map elements
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Mobile Drawers
  const [showGeneratorDrawer, setShowGeneratorDrawer] = useState(false);
  const [showSpotsListDrawer, setShowSpotsListDrawer] = useState(false);
  const [showArtifactsDrawer, setShowArtifactsDrawer] = useState(false);

  // Audio Playback
  const [isPlayingNarration, setIsPlayingNarration] = useState(false);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);

  // AI Chat Panel (Desktop)
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    { role: "assistant", content: "您好！我是您的智能导览助手小慧。已为您定位至重庆核心景区。想了解哪些景点的门票、历史和特色，或者让我为您定制路线？" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Auto-play TTS switch
  const [autoplayEnabled, setAutoplayEnabled] = useState(false);

  // Load Leaflet map script and stylesheet dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      const L = (window as any).L;
      if (!L || !mapRef.current) return;

      // Initialize map instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
      
      const map = L.map(mapRef.current, { zoomControl: false }).setView([29.563, 106.578], 13);
      mapInstanceRef.current = map;

      // OpenStreetMap Tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      // Render default markers
      renderMarkers(CHONGQING_SPOTS);
    };
    document.body.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Audio clean up
  useEffect(() => {
    return () => {
      if (audioInstance) {
        audioInstance.pause();
      }
    };
  }, [audioInstance]);

  // Re-draw route polylines when activeRoute changes
  useEffect(() => {
    const L = (window as any).L;
    const map = mapInstanceRef.current;
    if (!L || !map || !activeRoute) return;

    // Clear old polyline
    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
    }

    // Connect generated spot coordinates
    const coordinates = activeRoute.spots.map(s => {
      const original = CHONGQING_SPOTS.find(orig => orig.id === s.id);
      return original ? [original.lat, original.lng] : null;
    }).filter(Boolean) as Array<[number, number]>;

    if (coordinates.length > 0) {
      routePolylineRef.current = L.polyline(coordinates, {
        color: "#FF5B45",
        weight: 5,
        opacity: 0.85,
        dashArray: "5, 10"
      }).addTo(map);

      map.fitBounds(routePolylineRef.current.getBounds(), { padding: [60, 60] });
    }
  }, [activeRoute]);

  // Render markers function
  const renderMarkers = (spotsList: typeof CHONGQING_SPOTS) => {
    const L = (window as any).L;
    const map = mapInstanceRef.current;
    if (!L || !map) return;

    // Clear old markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    // Create marker styles according to category
    spotsList.forEach(s => {
      const markerHtml = `
        <div class="flex flex-col items-center select-none">
          <div class="px-2 py-1 bg-white/95 border border-zinc-200 shadow-md rounded-md text-[10px] font-bold text-zinc-800 whitespace-nowrap -translate-y-1" style="border-top: 3px solid ${
            s.type === "地标" ? "#EF4444" : s.type === "演出" ? "#F59E0B" : s.type === "寺庙" ? "#8B5CF6" : s.type === "文化" ? "#3B82F6" : s.type === "自然" ? "#10B981" : "#FF5B45"
          };">
            ${s.name}
          </div>
          <div class="w-3.5 h-3.5 rounded-full bg-white border-2 flex items-center justify-center shadow-md -translate-y-1" style="border-color: ${
            s.type === "地标" ? "#EF4444" : s.type === "演出" ? "#F59E0B" : s.type === "寺庙" ? "#8B5CF6" : s.type === "文化" ? "#3B82F6" : s.type === "自然" ? "#10B981" : "#FF5B45"
          };">
            <div class="w-1.5 h-1.5 rounded-full" style="background-color: ${
              s.type === "地标" ? "#EF4444" : s.type === "演出" ? "#F59E0B" : s.type === "寺庙" ? "#8B5CF6" : s.type === "文化" ? "#3B82F6" : s.type === "自然" ? "#10B981" : "#FF5B45"
            };"></div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: "custom-marker-icon",
        iconSize: [80, 40],
        iconAnchor: [40, 40]
      });

      const marker = L.marker([s.lat, s.lng], { icon: customIcon }).addTo(map);
      marker.on("click", () => {
        setActiveSpot(s);
        map.setView([s.lat, s.lng], 14, { animate: true });
        if (autoplayEnabled) {
          speakSpotNarration(s.name, s.desc);
        }
      });
      markersRef.current.push(marker);
    });
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    const found = CHONGQING_SPOTS.find(s => s.name.includes(q));
    if (found && mapInstanceRef.current) {
      setActiveSpot(found);
      mapInstanceRef.current.setView([found.lat, found.lng], 14, { animate: true });
      if (autoplayEnabled) {
        speakSpotNarration(found.name, found.desc);
      }
    } else if (q.trim()) {
      toast.error("未找到对应景点，请换个词试试。");
    }
  };

  // Play narration TTS
  const speakSpotNarration = (name: string, desc: string) => {
    if (isPlayingNarration) {
      audioInstance?.pause();
      setIsPlayingNarration(false);
      return;
    }

    const text = `您正在查看：${name}。${desc}`;
    const newAudio = new Audio("/api/qa/tts?text=" + encodeURIComponent(text));
    newAudio.play();
    newAudio.onended = () => setIsPlayingNarration(false);
    setAudioInstance(newAudio);
    setIsPlayingNarration(true);
  };

  // Switch category markers
  const handleCategoryFilter = (cat: string) => {
    toast.success(`已在重庆地图上高亮标出附近的「${cat}」设施`);
  };

  // Custom Local generator
  const handleGenerateRoute = async () => {
    setGenerating(true);
    setActiveRoute(null);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const selectedSpots = CHONGQING_SPOTS.filter(s => {
      if (selectedInterests.includes("history") && (s.type === "文化" || s.type === "寺庙")) return true;
      if (selectedInterests.includes("nature") && s.type === "自然") return true;
      if (selectedInterests.includes("cultural") && s.type === "地标") return true;
      if (selectedInterests.includes("family")) return true;
      return false;
    });

    const routeSpots = selectedSpots.length > 0 ? selectedSpots.slice(0, 4) : CHONGQING_SPOTS.slice(0, 3);
    const mockRoute: GeneratedRoute = {
      name: selectedInterests.includes("history") ? "山水巴渝 · 历史印记之旅" : "山城奇观 · 魔幻探秘游",
      description: "融合您的游玩喜好，为您量身规划的一条避堵省力线路。串联重庆标志性景区，带给您极佳的游览体验。",
      highlights: ["名胜打卡", "吊脚楼观赏", "两江夜航"],
      tips: "重庆道路落差大，步行较多，请备好舒适运动鞋，防晒防暑。",
      spots: routeSpots.map((s, idx) => ({
        id: s.id,
        name: s.name,
        duration: Math.min(30 + idx * 15, duration / 3),
        description: s.desc
      })),
      totalDuration: duration,
      totalDistance: "约 4.5 千米"
    };

    setActiveRoute(mockRoute);
    setGenerating(false);
    setShowGeneratorDrawer(false);
    toast.success("专属路线生成成功！已为您在地图上绘制路径。");
  };

  // Trigger Preset Routes
  const selectPresetThemeRoute = (presetId: string) => {
    const preset = PRESET_THEME_ROUTES.find(r => r.id === presetId);
    if (!preset) return;

    const matchedSpots = preset.spots.map(id => {
      return CHONGQING_SPOTS.find(s => s.id === id);
    }).filter(Boolean) as typeof CHONGQING_SPOTS;

    const mockRoute: GeneratedRoute = {
      name: preset.name,
      description: `专为体验重庆特色而策划的主题游览路线，用时约 ${preset.duration}。`,
      highlights: ["核心景点", "深度慢游"],
      tips: "跟着官方推荐路线走，不迷路不绕弯！",
      spots: matchedSpots.map(s => ({
        id: s.id,
        name: s.name,
        duration: 45,
        description: s.desc
      })),
      totalDuration: 180,
      totalDistance: "约 3.8 千米"
    };

    setActiveRoute(mockRoute);
    toast.success(`已锁定「${preset.name}」，请在地图上查看。`);
  };

  // AI Chat Local responder
  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setChatInput("");
    setChatLoading(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    let reply = "您好！我是您的智能助手。我可以为您介绍重庆景点的特色、门票、开放时间等，请问还有什么疑问吗？";
    const q = userMsg.toLowerCase();
    if (q.includes("洪崖洞")) {
      reply = "洪崖洞以经典的吊脚楼风貌著称，夜景一般在每天18:00后点亮，无需门票免费参观，非常推荐从江北嘴一侧远眺拍摄！";
    } else if (q.includes("门票")) {
      reply = "重庆的主流街区景点如洪崖洞、解放碑、朝天门都是免费开放的。长江索道往返30元/单程20元，建议提前线上预约预约购票。";
    } else if (q.includes("路线") || q.includes("怎么走")) {
      reply = "建议您点击左下角的「推荐游览路线」，我们预设了‘巴渝文化历史游’，完美融合了三峡博物馆和洪崖洞，或者您可以直接使用智能生成器！";
    } else if (q.includes("美食") || q.includes("好吃")) {
      reply = "来到重庆一定要尝尝九宫格火锅、重庆小面、酸辣粉和磁器口的陈麻花，这些在洪崖洞和解放碑步行街周边均能轻松找到！";
    }

    setChatMessages(prev => [...prev, { role: "assistant", content: reply }]);
    setChatLoading(false);
  };

  return (
    <div className="relative min-h-svh w-full overflow-hidden bg-neutral-100 select-none">
      
      {/* ══════════════════════════════════════════════
          MOBILE VIEW (Strictly mirrors Image 1)
          ══════════════════════════════════════════════ */}
      <div className="md:hidden relative w-full h-svh flex flex-col overflow-hidden">
        
        {/* Full Map Container */}
        <div ref={mapRef} className="absolute inset-0 z-0 bg-neutral-200" />

        {/* 1. Status Bar Spacing & Header Row */}
        <div className="relative z-10 w-full px-4 pt-3 flex flex-col gap-2">
          {/* Header Card */}
          <div className="bg-white/95 backdrop-blur-md shadow-lg rounded-2xl p-2.5 flex items-center justify-between border border-zinc-200/50">
            {/* Title & Back button */}
            <Link href="/home" className="flex items-center gap-1.5 flex-1 min-w-0">
              <ChevronLeft className="w-5 h-5 text-zinc-700 flex-shrink-0" />
              <span className="font-bold text-sm text-zinc-800 truncate" style={{ fontFamily: "var(--font-noto-serif)" }}>
                {activeSpot?.name || "成都杜甫草堂博物馆"}
              </span>
            </Link>
            
            {/* Share & Feedback */}
            <div className="flex items-center gap-2">
              <button onClick={() => toast.success("已分享当前景区地图")}
                className="flex flex-col items-center justify-center p-1 rounded-lg text-zinc-600 hover:text-zinc-950 transition-colors">
                <Share2 className="w-4 h-4" />
                <span className="text-[7.5px] font-bold mt-0.5">分享</span>
              </button>
              <Link href="/profile" className="flex flex-col items-center justify-center p-1 rounded-lg text-zinc-600 hover:text-zinc-950 transition-colors">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-[7.5px] font-bold mt-0.5">反馈</span>
              </Link>
            </div>
          </div>

          {/* Categories Bar */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-0.5 py-1">
            {[
              { label: "景点", icon: "🔴", color: "text-red-500" },
              { label: "卫生间", icon: "🚻", color: "text-blue-500" },
              { label: "售票处", icon: "🎫", color: "text-orange-500" },
              { label: "出入口", icon: "🚪", color: "text-emerald-500" },
              { label: "停车场", icon: "🅿️", color: "text-sky-500" }
            ].map(item => (
              <button
                key={item.label}
                onClick={() => handleCategoryFilter(item.label)}
                className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/95 border border-zinc-200/60 shadow-sm text-[10px] font-bold text-zinc-700 hover:bg-neutral-50 transition-colors"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Floating action buttons on the right side */}
        <div className="absolute right-3 top-36 z-10 flex flex-col gap-2.5">
          {/* Overview button */}
          <button onClick={() => setShowSpotsListDrawer(true)}
            className="w-10 h-10 rounded-xl bg-white shadow-lg border border-zinc-200/50 flex flex-col items-center justify-center hover:bg-zinc-50 transition-all">
            <Landmark className="w-4.5 h-4.5 text-zinc-700" />
            <span className="text-[8px] font-bold text-zinc-800 mt-0.5">概览</span>
          </button>
          
          {/* Routes Generator trigger button */}
          <button onClick={() => setShowGeneratorDrawer(true)}
            className="w-10 h-10 rounded-xl bg-white shadow-lg border border-zinc-200/50 flex flex-col items-center justify-center hover:bg-zinc-50 transition-all">
            <Compass className="w-4.5 h-4.5 text-[#3A4D39]" />
            <span className="text-[8px] font-bold text-[#3A4D39] mt-0.5">路线</span>
          </button>

          {/* Tickets button */}
          <button onClick={() => toast.success(`已打开 ${activeSpot.name} 的门票预订`)}
            className="w-10 h-10 rounded-xl bg-white shadow-lg border border-zinc-200/50 flex flex-col items-center justify-center hover:bg-zinc-50 transition-all">
            <BookOpen className="w-4.5 h-4.5 text-orange-500" />
            <span className="text-[8px] font-bold text-zinc-800 mt-0.5">门票</span>
          </button>

          {/* Auto-play toggle button */}
          <div className="bg-white rounded-xl shadow-lg border border-zinc-200/50 p-1 flex flex-col items-center justify-center">
            <span className="text-[7.5px] font-bold text-zinc-500 leading-none">自动播</span>
            <input
              type="checkbox"
              checked={autoplayEnabled}
              onChange={(e) => setAutoplayEnabled(e.target.checked)}
              className="mt-1 w-6 h-3.5 bg-neutral-200 rounded-full appearance-none relative cursor-pointer outline-none transition-colors duration-200 checked:bg-[#3A4D39] before:content-[''] before:absolute before:left-0.5 before:top-0.5 before:w-2.5 before:h-2.5 before:bg-white before:rounded-full before:transition-all checked:before:translate-x-2.5"
            />
          </div>
        </div>

        {/* GPS location target button */}
        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([29.563, 106.578], 13);
              toast.info("已回到重庆核心区域");
            }
          }}
          className="absolute left-4 bottom-56 z-10 w-9 h-9 rounded-full bg-white shadow-lg border border-zinc-200/50 flex items-center justify-center text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          <Navigation className="w-4.5 h-4.5" />
        </button>

        {/* Small "关闭5s" notification */}
        <div className="absolute right-4 bottom-52 z-10 bg-black/75 text-white/90 text-[9px] px-2 py-0.5 rounded-full backdrop-blur-sm shadow-md border border-white/10 flex items-center gap-1">
          <span>AI自动播已启动</span>
          <button className="font-semibold underline">关闭5s</button>
        </div>

        {/* Bottom card & panel layout */}
        <div className="mt-auto relative z-10 w-full px-3 pb-3 flex flex-col gap-2.5">
          {/* Spot detail card */}
          {activeSpot && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-zinc-200/40 flex items-center gap-3.5 relative overflow-hidden">
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100">
                <img src={activeSpot.img} alt={activeSpot.name} className="w-full h-full object-cover" />
              </div>

              {/* Text metadata */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-[13px] text-zinc-900 truncate" style={{ fontFamily: "var(--font-noto-serif)" }}>
                    {activeSpot.name}
                  </span>
                  <span className="bg-orange-500/10 text-orange-600 text-[8px] font-black px-1.5 py-0.5 rounded-md flex-shrink-0">
                    {activeSpot.rating}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-500 flex items-center gap-2 truncate">
                  <span>门票: {activeSpot.price}</span>
                  <span>开放时间: {activeSpot.time}</span>
                </div>
                <div className="text-[10px] text-zinc-400 flex items-center justify-between">
                  <span className="truncate flex-1 pr-2">{activeSpot.addr}</span>
                  <span className="font-mono text-[9px] text-[#3A4D39] font-bold flex-shrink-0">{activeSpot.distance}</span>
                </div>
              </div>

              {/* Navigation button */}
              <button onClick={() => toast.success(`正在拉起导航前往 ${activeSpot.name}`)}
                className="flex flex-col items-center justify-center bg-gradient-to-br from-orange-500 to-[#FF5B45] text-white rounded-xl px-2.5 py-2.5 shadow-md hover:brightness-105 transition-all flex-shrink-0 gap-0.5 self-stretch justify-center">
                <Navigation className="w-3.5 h-3.5" />
                <span className="text-[8.5px] font-black">导航</span>
              </button>
            </motion.div>
          )}

          {/* Under card control bar panel */}
          <div className="bg-[#FAF8F5]/95 backdrop-blur-md border border-zinc-200/50 shadow-2xl rounded-2xl p-2 flex items-center justify-between">
            {/* Speech explain audio play */}
            <button
              onClick={() => speakSpotNarration(activeSpot.name, activeSpot.desc)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF0ED] text-[#FF5B45] hover:bg-[#FFE0DB] transition-colors shadow-sm"
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-[#FF5B45] text-white ${isPlayingNarration ? "animate-pulse" : ""}`}>
                <Volume2 className="w-3 h-3" />
              </div>
              <span className="text-[10.5px] font-bold">语音讲解</span>
            </button>

            <div className="flex gap-2">
              <button onClick={() => setShowSpotsListDrawer(true)}
                className="px-3.5 py-1.5 bg-[#FAF6E8] border border-[#F5EED8] hover:bg-[#FAF0D0] text-[#D2A053] rounded-xl text-[10.5px] font-bold shadow-sm transition-colors">
                景点列表
              </button>
              <button onClick={() => setShowArtifactsDrawer(true)}
                className="px-3.5 py-1.5 bg-[#EEF2EE] border border-[#E0EAE0] hover:bg-[#DFEDDF] text-[#4F6F52] rounded-xl text-[10.5px] font-bold shadow-sm transition-colors">
                文物陈列
              </button>
            </div>
          </div>
        </div>

        {/* Sliding drawer 1: Custom Route generator */}
        <AnimatePresence>
          {showGeneratorDrawer && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
                onClick={() => setShowGeneratorDrawer(false)}
                className="absolute inset-0 bg-black z-30" />
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25 }}
                className="absolute bottom-0 left-0 right-0 z-40 bg-white rounded-t-3xl p-5 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-2 border-b">
                  <h3 className="font-extrabold text-sm text-zinc-900" style={{ fontFamily: "var(--font-noto-serif)" }}>智能专属路线生成器</h3>
                  <button onClick={() => setShowGeneratorDrawer(false)} className="text-zinc-400 hover:text-zinc-700 text-xs font-bold">关闭</button>
                </div>

                {/* Tags selection */}
                <div className="space-y-1.5">
                  <p className="text-[10.5px] font-black text-zinc-700">1. 选择您感兴趣的游玩偏好</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {INTERESTS.map(item => {
                      const active = selectedInterests.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSelectedInterests(prev => prev.includes(item.id) ? prev.filter(x => x !== item.id) : [...prev, item.id]);
                          }}
                          className={`py-2 px-1 text-center rounded-lg border text-xs font-bold transition-all ${active ? "bg-[#3A4D39] text-white border-[#3A4D39] shadow-sm" : "bg-neutral-50 text-zinc-600 border-zinc-200"}`}
                        >
                          <span className="block text-sm mb-0.5">{item.emoji}</span>
                          <span className="text-[9.5px]">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Duration Slider */}
                <div className="space-y-1.5 p-3 rounded-2xl bg-neutral-50 border">
                  <div className="flex justify-between items-center text-[10.5px] font-black text-zinc-700">
                    <span>2. 预备游玩时长</span>
                    <span className="font-mono text-[#D2A053] font-black">{duration} 分钟</span>
                  </div>
                  <input
                    type="range" min={60} max={240} step={30} value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#D2A053]"
                  />
                  <div className="flex justify-between text-[8.5px] text-zinc-400 font-bold">
                    <span>小试牛刀(1h)</span>
                    <span>深度漫游(4h)</span>
                  </div>
                </div>

                {/* Generate Action Button */}
                <button
                  onClick={handleGenerateRoute}
                  disabled={generating}
                  className="w-full py-3 bg-gradient-to-br from-[#4F6F52] to-[#3A5240] text-white rounded-xl text-xs font-black shadow-lg flex items-center justify-center gap-1.5 hover:brightness-105 active:scale-95 transition-all"
                >
                  {generating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />正在生成专属规划...</>
                  ) : (
                    <><Compass className="w-4 h-4" />生成专属路线</>
                  )}
                </button>

                {/* Display active generated route */}
                {activeRoute && (
                  <div className="mt-4 p-3 rounded-2xl bg-neutral-50 border border-zinc-200/60 space-y-3">
                    <div className="flex justify-between items-center pb-1.5 border-b border-zinc-200">
                      <span className="text-[10px] font-bold text-[#3A4D39]">AI专属路线 · {activeRoute.name}</span>
                      <span className="text-[9px] font-mono text-zinc-500">{activeRoute.totalDistance}</span>
                    </div>
                    <p className="text-[10.5px] text-zinc-600 leading-relaxed">{activeRoute.description}</p>
                    <div className="space-y-2 relative pl-3.5">
                      <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-zinc-300" />
                      {activeRoute.spots.map((spot, i) => (
                        <div key={spot.id} className="text-[11px] relative">
                          <span className="absolute -left-[14.5px] top-0.5 w-2.5 h-2.5 rounded-full bg-[#3A4D39] border border-white" />
                          <span className="font-extrabold text-zinc-800">{spot.name}</span>
                          <span className="text-[9px] text-zinc-400 block">停留约 {spot.duration} 分钟</span>
                        </div>
                      ))}
                    </div>
                    {activeRoute.tips && (
                      <div className="p-2 bg-orange-50 border border-orange-200/50 rounded-lg text-[9.5px] text-orange-800">
                        💡 {activeRoute.tips}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Sliding drawer 2: Spots list overview */}
        <AnimatePresence>
          {showSpotsListDrawer && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
                onClick={() => setShowSpotsListDrawer(false)}
                className="absolute inset-0 bg-black z-30" />
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25 }}
                className="absolute bottom-0 left-0 right-0 z-40 bg-white rounded-t-3xl p-5 space-y-3 max-h-[75vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-2 border-b">
                  <h3 className="font-extrabold text-sm text-zinc-900" style={{ fontFamily: "var(--font-noto-serif)" }}>景区全部景点 (11)</h3>
                  <button onClick={() => setShowSpotsListDrawer(false)} className="text-zinc-400 hover:text-zinc-700 text-xs font-bold">关闭</button>
                </div>
                <div className="space-y-2.5 pt-1.5">
                  {CHONGQING_SPOTS.map(s => (
                    <div
                      key={s.id}
                      onClick={() => {
                        setActiveSpot(s);
                        setShowSpotsListDrawer(false);
                        if (mapInstanceRef.current) {
                          mapInstanceRef.current.setView([s.lat, s.lng], 14, { animate: true });
                          if (autoplayEnabled) {
                            speakSpotNarration(s.name, s.desc);
                          }
                        }
                      }}
                      className="flex gap-3 p-2 rounded-xl hover:bg-neutral-50 cursor-pointer border border-transparent hover:border-zinc-200 transition-all"
                    >
                      <img src={s.img} alt={s.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[12px] text-zinc-800">{s.name}</span>
                          <span className="bg-neutral-100 text-zinc-500 text-[8px] px-1 rounded">{s.type}</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 truncate mt-0.5">{s.addr}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Sliding drawer 3: Artifacts museum display */}
        <AnimatePresence>
          {showArtifactsDrawer && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
                onClick={() => setShowArtifactsDrawer(false)}
                className="absolute inset-0 bg-black z-30" />
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25 }}
                className="absolute bottom-0 left-0 right-0 z-40 bg-white rounded-t-3xl p-5 space-y-3 max-h-[70vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-2 border-b">
                  <h3 className="font-extrabold text-sm text-zinc-900" style={{ fontFamily: "var(--font-noto-serif)" }}>巴蜀文博陈列</h3>
                  <button onClick={() => setShowArtifactsDrawer(false)} className="text-zinc-400 hover:text-zinc-700 text-xs font-bold">关闭</button>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {[
                    { name: "巴国青铜剑", period: "战国时期", emoji: "🗡️", desc: "柳叶形扁茎无格，表面带有精致暗斑文饰，巴人标志性兵器。" },
                    { name: "汉代宴乐陶俑", period: "东汉", emoji: "🏺", desc: "陶俑神态逼真，生动体现了东汉时期川蜀地区的乐舞生活面貌。" },
                    { name: "三峡夔门石刻拓片", period: "明清", emoji: "📜", desc: "镌刻着历代文人墨客描绘瞿塘峡天险的雄浑墨宝。" },
                    { name: "巴渝木雕隔扇", period: "清代", emoji: "🪵", desc: "镂空透雕的吉祥花鸟鸟兽图案，极其精细的镂空技法。" }
                  ].map(a => (
                    <div key={a.name} className="p-3 bg-[#FAF8F5] border border-zinc-200/50 rounded-xl space-y-1.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{a.emoji}</span>
                        <span className="text-[8px] bg-zinc-200 px-1 py-0.5 rounded text-zinc-500 font-bold">{a.period}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-[11.5px] text-zinc-900">{a.name}</h4>
                        <p className="text-[9.5px] text-zinc-500 leading-normal mt-0.5">{a.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>

      {/* ══════════════════════════════════════════════
          DESKTOP VIEW (Strictly mirrors Image 2)
          ══════════════════════════════════════════════ */}
      <div className="hidden md:flex flex-col w-full h-screen overflow-hidden bg-[#F7F6F3]">
        
        {/* Desktop Custom Nav Header */}
        <header className="w-full bg-white border-b border-zinc-200 px-6 py-3 flex items-center justify-between z-10 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#3A4D39] flex items-center justify-center text-white font-serif text-base font-bold shadow-md">灵</div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-wider text-[#3A4D39]" style={{ fontFamily: "var(--font-noto-serif)" }}>
                灵山胜境
              </span>
              <span className="text-[8px] font-bold text-zinc-400 tracking-widest font-mono uppercase">LINGSHAN SCENIC AREA</span>
            </div>
          </div>
          <nav className="flex items-center gap-7 text-xs font-bold">
            <Link href="/home" className="text-zinc-500 hover:text-zinc-950 transition-colors">首页</Link>
            <Link href="/spots" className="text-zinc-500 hover:text-zinc-950 transition-colors">景点</Link>
            <Link href="/routes" className="text-[#3A4D39] hover:text-[#4F6F52] transition-colors relative after:content-[''] after:absolute after:bottom-[-6px] after:left-0 after:w-full after:h-[2.5px] after:bg-[#3A4D39]">路线</Link>
            <Link href="/routes" className="text-zinc-500 hover:text-zinc-950 transition-colors">地图导航</Link>
            <Link href="/spots/5" className="text-zinc-500 hover:text-zinc-950 transition-colors">拈花湾</Link>
            <Link href="/home" className="text-zinc-500 hover:text-zinc-950 transition-colors">游览指南</Link>
            <Link href="/profile" className="text-zinc-500 hover:text-zinc-950 transition-colors">历史文化</Link>
          </nav>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#D2A053] border border-[#D2A053]/50 px-3 py-1 rounded-full bg-[#D2A053]/5 shadow-sm">
              ★ 国家5A级景区
            </span>
          </div>
        </header>

        {/* Main Panel Content split into 3 columns */}
        <div className="flex-1 flex w-full overflow-hidden">
          
          {/* Column 1: Left Navigation panel */}
          <div className="w-[320px] bg-white border-r border-zinc-200/80 flex flex-col overflow-y-auto p-4 space-y-5 flex-shrink-0 shadow-sm">
            <div className="pb-1 border-b border-zinc-100">
              <h2 className="font-extrabold text-base text-zinc-900 flex items-center gap-1.5" style={{ fontFamily: "var(--font-noto-serif)" }}>
                <Landmark className="w-[18px] h-[18px] text-[#3A4D39]" />
                景区导航地图
              </h2>
              <p className="text-[10.5px] text-zinc-400 mt-0.5">点击景点查看详情和导航</p>
            </div>

            {/* Local Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="搜索地点... (如: 洪崖洞)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
                className="w-full bg-neutral-50 border border-zinc-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-[#3A4D39] transition-colors"
              />
            </div>

            {/* Presets Theme Routes */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-black text-zinc-800 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-[#D2A053]" />
                推荐游览路线
              </h3>
              <div className="space-y-1.5">
                {PRESET_THEME_ROUTES.map((route, i) => (
                  <button
                    key={route.id}
                    onClick={() => selectPresetThemeRoute(route.id)}
                    className="w-full text-left p-3 rounded-xl border border-zinc-200/60 bg-neutral-50 hover:bg-neutral-100/50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-zinc-800">{route.name}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">建议耗时: {route.duration}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Accordion trigger original route generator */}
            <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-zinc-200/60 space-y-3.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D2A053] animate-pulse" />
                <span className="text-xs font-black text-[#3A4D39]">智能专属路线生成</span>
              </div>
              
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 block">选择兴趣偏好:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {INTERESTS.map(item => {
                    const active = selectedInterests.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedInterests(prev => prev.includes(item.id) ? prev.filter(x => x !== item.id) : [...prev, item.id]);
                        }}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold transition-all ${active ? "bg-[#3A4D39] text-white border-[#3A4D39]" : "bg-white text-zinc-600 border-zinc-200 hover:bg-neutral-50"}`}
                      >
                        {item.emoji} {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                  <span>游玩时长:</span>
                  <span className="font-mono text-[#D2A053]">{duration} 分钟</span>
                </div>
                <input
                  type="range" min={60} max={240} step={30} value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full h-1 bg-neutral-200 rounded accent-[#D2A053] cursor-pointer"
                />
              </div>

              <button
                onClick={handleGenerateRoute}
                disabled={generating}
                className="w-full py-2 bg-[#3A4D39] hover:bg-[#4F6F52] text-white rounded-xl text-[11px] font-extrabold shadow flex items-center justify-center gap-1.5 transition-colors"
              >
                {generating ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" />规划中...</>
                ) : (
                  <><Compass className="w-3.5 h-3.5" />生成专属路线</>
                )}
              </button>

              {activeRoute && (
                <div className="p-2.5 rounded-xl bg-white border border-zinc-200 text-[10px] space-y-2">
                  <div className="font-bold text-[#3A4D39] border-b pb-1 flex justify-between">
                    <span>{activeRoute.name}</span>
                    <span className="font-mono">{activeRoute.totalDistance}</span>
                  </div>
                  <div className="space-y-1">
                    {activeRoute.spots.map((s, idx) => (
                      <div key={s.id} className="text-zinc-700 truncate">
                        {idx + 1}. {s.name} <span className="text-zinc-400">({s.duration}分钟)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* List of 11 Spots */}
            <div className="space-y-2 pt-2 border-t">
              <h3 className="text-xs font-black text-zinc-800">景区全部景点 (11)</h3>
              <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
                {CHONGQING_SPOTS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveSpot(s);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.setView([s.lat, s.lng], 14, { animate: true });
                        if (autoplayEnabled) {
                          speakSpotNarration(s.name, s.desc);
                        }
                      }
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between border transition-all ${activeSpot?.id === s.id ? "bg-[#3A4D39]/5 border-[#3A4D39]/30 font-bold" : "border-transparent hover:bg-neutral-50"}`}
                  >
                    <span className="truncate text-zinc-800 pr-2">{s.name}</span>
                    <span className="bg-neutral-100 text-zinc-500 text-[8.5px] px-1.5 py-0.5 rounded flex-shrink-0">{s.type}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Center Map component */}
          <div className="flex-1 relative bg-zinc-100 h-full">
            <div ref={mapRef} className="w-full h-full" />

            {/* Map Top-left Category Legend */}
            <div className="absolute left-4 top-4 z-10 bg-white/95 backdrop-blur shadow-md border border-zinc-200/80 rounded-xl px-4 py-2 flex items-center gap-4 text-xs font-bold text-zinc-700">
              <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> 地标</div>
              <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> 演出</div>
              <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> 寺庙</div>
              <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> 文化</div>
              <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> 祈福</div>
              <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> 自然</div>
            </div>

            {/* Map Top-right Zoom control mock */}
            <div className="absolute right-4 top-4 z-10 flex flex-col gap-1.5">
              <button onClick={() => mapInstanceRef.current?.zoomIn()}
                className="w-8 h-8 rounded-lg bg-white border shadow-md flex items-center justify-center font-bold text-zinc-700 hover:bg-neutral-50">+</button>
              <button onClick={() => mapInstanceRef.current?.zoomOut()}
                className="w-8 h-8 rounded-lg bg-white border shadow-md flex items-center justify-center font-bold text-zinc-700 hover:bg-neutral-50">-</button>
            </div>

            {/* Map Bottom-left scale indicator bar */}
            <div className="absolute left-4 bottom-4 z-10 bg-white/90 border rounded px-2.5 py-1 text-[10px] font-mono text-zinc-500">
              <span>比例尺 100 米</span>
            </div>

            {/* Floating details popup inside desktop map */}
            {activeSpot && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-6 z-10 w-[420px] bg-white rounded-2xl p-3 flex gap-3 shadow-2xl border border-zinc-200">
                <img src={activeSpot.img} alt={activeSpot.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-[13px] text-zinc-800 truncate">{activeSpot.name}</h4>
                    <span className="bg-[#D2A053]/10 text-[#D2A053] text-[8.5px] px-1.5 py-0.5 rounded font-black">{activeSpot.rating}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1 truncate">{activeSpot.addr}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5 leading-normal truncate">{activeSpot.desc}</p>
                </div>
                <div className="flex flex-col justify-between items-end flex-shrink-0">
                  <button onClick={() => speakSpotNarration(activeSpot.name, activeSpot.desc)}
                    className={`p-1.5 rounded-full ${isPlayingNarration ? "bg-[#FF5B45] text-white" : "bg-[#FFF0ED] text-[#FF5B45]"}`}>
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => toast.success(`正在为您拉起大图导航`)}
                    className="px-3 py-1.5 bg-[#FF5B45] text-white font-extrabold text-[9.5px] rounded-lg shadow-sm hover:brightness-105">
                    导航
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Column 3: Right floating / side panel AI chat Guide widget */}
          <div className="w-[300px] bg-white border-l border-zinc-200 flex flex-col overflow-hidden h-full flex-shrink-0">
            {/* AI widget header */}
            <div className="p-4 border-b flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl overflow-hidden border bg-neutral-100 flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=100&q=80"
                    alt="Panda"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-zinc-800">AI 导游小慧</h3>
                  <span className="text-[9px] text-[#4F6F52] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                    景区服务中
                  </span>
                </div>
              </div>
              <button className="text-zinc-400 hover:text-zinc-700">
                <ChevronLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>

            {/* Chat dialog messages list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-neutral-50/50">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${msg.role === "assistant" ? "bg-[#3A4D39] text-white" : "bg-neutral-200 text-zinc-700"}`}>
                    {msg.role === "assistant" ? "慧" : "我"}
                  </div>
                  <div className={`p-2.5 rounded-2xl text-[11px] leading-relaxed max-w-[80%] ${msg.role === "assistant" ? "bg-white border text-zinc-800 shadow-sm" : "bg-[#3A4D39] text-white"}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#3A4D39] text-white flex items-center justify-center text-[10px] font-bold">慧</div>
                  <div className="p-2.5 rounded-2xl bg-white border flex items-center gap-1">
                    <div className="w-1 h-1 bg-[#3A4D39] rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-[#3A4D39] rounded-full animate-bounce [animation-delay:0.1s]" />
                    <div className="w-1 h-1 bg-[#3A4D39] rounded-full animate-bounce [animation-delay:0.2s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Chat panel bottom input bar */}
            <div className="p-3 border-t bg-white flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                placeholder="向小慧提问... (Enter发送)"
                className="flex-1 bg-neutral-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#3A4D39]"
              />
              <button
                onClick={handleSendChatMessage}
                className="w-8 h-8 rounded-xl bg-[#3A4D39] text-white flex items-center justify-center hover:bg-[#4F6F52] transition-colors shadow-sm flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
