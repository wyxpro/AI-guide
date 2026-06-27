"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import {
  Compass, ArrowRight, Loader2, MapPin, Clock, ChevronLeft, ChevronRight,
  Share2, MessageSquare, ShieldAlert, Award, Search, Send,
  Volume2, VolumeX, Eye, BookOpen, Navigation, Landmark, Sparkles,
  X, Smile, Image as ImageIcon, Film, Mic
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { request } from "@/lib/api/request";
import AMapLoader from "@amap/amap-jsapi-loader";

if (typeof window !== "undefined") {
  (window as any)._AMapSecurityConfig = {
    securityJsCode: process.env.NEXT_PUBLIC_AMAP_SECURITY_CODE || "",
  };
}

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

const ALL_CITIES_SPOTS: Record<string, typeof CHONGQING_SPOTS> = {
  "重庆": CHONGQING_SPOTS,
  "北京": [
    { id: 101, name: "故宫博物院", type: "地标", lat: 39.916, lng: 116.397, price: "¥60", time: "08:30-17:00", addr: "北京市东城区景山前街4号", distance: "距您 2.1km", rating: "5A景区", img: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&q=80", desc: "明清两代的皇家宫殿，世界上现存规模最大、保存最为完整的木质结构古建筑之一。" },
    { id: 102, name: "天坛公园", type: "文化", lat: 39.882, lng: 116.413, price: "¥15", time: "06:00-22:00", addr: "北京市东城区天坛路甲1号", distance: "距您 4.5km", rating: "5A景区", img: "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=400&q=80", desc: "明清两代皇帝祭天、祈谷的场所，建筑设计精巧，寓意天圆地方。" },
    { id: 103, name: "颐和园", type: "自然", lat: 39.999, lng: 116.273, price: "¥30", time: "06:00-20:00", addr: "北京市海淀区新建宫门路19号", distance: "距您 15km", rating: "5A景区", img: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=80", desc: "著名的皇家园林，保存最完整的皇家行宫御苑，被誉为“皇家园林博物馆”。" },
    { id: 104, name: "八达岭长城", type: "地标", lat: 40.360, lng: 116.024, price: "¥40", time: "06:30-19:00", addr: "北京市延庆区G110辅道", distance: "距您 60km", rating: "5A景区", img: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&q=80", desc: "万里长城的重要组成部分，气势磅礴，是长城建筑的精华。" }
  ],
  "上海": [
    { id: 201, name: "外滩", type: "地标", lat: 31.240, lng: 121.490, price: "免费", time: "全天开放", addr: "上海市黄浦区中山东一路", distance: "距您 1.5km", rating: "地标街区", img: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&q=80", desc: "上海的风景线，矗立着数十栋风格迥异的古典复兴建筑，与陆家嘴隔江相望。" },
    { id: 202, name: "东方明珠电视塔", type: "地标", lat: 31.239, lng: 121.499, price: "¥199起", time: "09:00-21:00", addr: "上海市浦东新区世纪大道1号", distance: "距您 2.3km", rating: "5A景区", img: "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=400&q=80", desc: "坐落于黄浦江畔，塔高468米，是上海标志性的城市地标景观。" },
    { id: 203, name: "豫园", type: "文化", lat: 31.227, lng: 121.492, price: "¥40", time: "09:00-16:30", addr: "上海市黄浦区安仁街279号", distance: "距您 1.8km", rating: "4A景区", img: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=80", desc: "著名的江南古典园林，设计精巧，蕴含着浓郁的传统文化氛围。" }
  ],
  "成都": [
    { id: 301, name: "成都杜甫草堂博物馆", type: "文化", lat: 30.660, lng: 104.028, price: "¥50", time: "09:00-18:00", addr: "四川省成都市青羊区青华路37号", distance: "距您 3.0km", rating: "4A景区", img: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&q=80", desc: "唐代大诗人杜甫流寓成都时的故居，清幽古朴，是诗歌文化的圣地。" },
    { id: 302, name: "宽窄巷子", type: "文化", lat: 30.663, lng: 104.053, price: "免费", time: "全天开放", addr: "四川省成都市青羊区长顺街", distance: "距您 1.2km", rating: "特色街区", img: "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=400&q=80", desc: "由宽巷子、窄巷子、井巷子平行排列组成，保留了清代川西民居的院落格局。" },
    { id: 303, name: "大熊猫繁育研究基地", type: "自然", lat: 30.733, lng: 104.143, price: "¥55", time: "07:30-18:00", addr: "四川省成都市成华区外北熊猫大道1375号", distance: "距您 12km", rating: "5A景区", img: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=80", desc: "大熊猫迁地保护的重要场所，近距离观赏国宝大熊猫的生态家园。" }
  ],
  "西安": [
    { id: 401, name: "秦始皇帝陵博物院", type: "文化", lat: 34.385, lng: 109.278, price: "¥120", time: "08:30-17:00", addr: "陕西省西安市临潼区秦陵路", distance: "距您 35km", rating: "5A景区", img: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&q=80", desc: "被誉为“世界第八大奇迹”的兵马俑坑，展示了秦代雄壮 of 的地下军阵。" },
    { id: 402, name: "大唐芙蓉园", type: "文化", lat: 34.218, lng: 108.969, price: "¥120", time: "09:00-22:00", addr: "陕西省西安市雁塔区芙蓉西路99号", distance: "距您 5.5km", rating: "5A景区", img: "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=400&q=80", desc: "全方位展示盛唐风貌的大型皇家园林式文化主题公园。" }
  ],
  "杭州": [
    { id: 501, name: "西湖风景名胜区", type: "自然", lat: 30.244, lng: 120.155, price: "免费", time: "全天开放", addr: "浙江省杭州市西湖区龙井路1号", distance: "距您 1.1km", rating: "5A景区", img: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&q=80", desc: "以秀丽的湖光山色 and 深厚的历史底蕴著称，断桥残雪、苏堤春晓美不胜收。" },
    { id: 502, name: "灵隐寺", type: "寺庙", lat: 30.242, lng: 120.098, price: "¥30", time: "07:00-18:15", addr: "浙江省杭州市西湖区灵隐路法云弄1号", distance: "距您 6.2km", rating: "全国重点文物", img: "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=400&q=80", desc: "江南禅宗古刹之一，环境幽雅清静，飞来峰石刻造像精美绝伦。" }
  ]
};

const POPULAR_CITIES = [
  { name: "重庆", center: [106.578, 29.563], img: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=200&q=80", badge: "魔幻山城" },
  { name: "北京", center: [116.397, 39.916], img: "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=200&q=80", badge: "历史帝都" },
  { name: "上海", center: [121.473, 31.230], img: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200&q=80", badge: "摩登都市" },
  { name: "成都", center: [104.066, 30.572], img: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=200&q=80", badge: "天府之国" },
  { name: "西安", center: [108.940, 34.341], img: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=200&q=80", badge: "古丝路起点" },
  { name: "杭州", center: [120.155, 30.274], img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&q=80", badge: "人间天堂" }
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
  const [selectedCity, setSelectedCity] = useState("重庆");
  const currentSpots = ALL_CITIES_SPOTS[selectedCity] || CHONGQING_SPOTS;

  const [selectedInterests, setSelectedInterests] = useState<string[]>(["history"]);
  const [duration, setDuration] = useState(120);
  const [generating, setGenerating] = useState(false);
  const [activeRoute, setActiveRoute] = useState<GeneratedRoute | null>(null);

  // Active highlighted spot
  const [activeSpot, setActiveSpot] = useState<typeof CHONGQING_SPOTS[0]>(CHONGQING_SPOTS[0]);
  const [searchQuery, setSearchQuery] = useState("");

  // Map elements — separate refs for mobile and desktop to avoid React single-ref collision
  const mobileMapRef = useRef<HTMLDivElement>(null);
  const desktopMapRef = useRef<HTMLDivElement>(null);
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
  const [showFloatChat, setShowFloatChat] = useState(true);

  // Auto-play TTS switch
  const [autoplayEnabled, setAutoplayEnabled] = useState(false);

  // Desktop City Carousel Drag Scroll
  const cityScrollRef = useRef<HTMLDivElement>(null);
  const [cityDragState, setCityDragState] = useState({ isDragging: false, startX: 0, scrollLeft: 0 });

  const handleCityMouseDown = (e: React.MouseEvent) => {
    if (!cityScrollRef.current) return;
    setCityDragState({
      isDragging: true,
      startX: e.pageX - cityScrollRef.current.offsetLeft,
      scrollLeft: cityScrollRef.current.scrollLeft
    });
  };

  const handleCityMouseMove = (e: React.MouseEvent) => {
    if (!cityDragState.isDragging || !cityScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - cityScrollRef.current.offsetLeft;
    const walk = (x - cityDragState.startX) * 1.5;
    cityScrollRef.current.scrollLeft = cityDragState.scrollLeft - walk;
  };

  const handleCityMouseUpOrLeave = () => {
    setCityDragState(prev => ({ ...prev, isDragging: false }));
  };

  const scrollCityCarousel = (direction: "left" | "right") => {
    if (!cityScrollRef.current) return;
    const scrollAmount = 180;
    cityScrollRef.current.scrollTo({
      left: cityScrollRef.current.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount),
      behavior: "smooth"
    });
  };

  const dragControls = useDragControls();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [attachedMedia, setAttachedMedia] = useState<Array<{type: 'image' | 'video', url: string, name: string}>>([]);

  // Voice recording states & refs
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  const toggleRecording = async () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (recording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setRecording(false);
      } else if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setRecording(false);
      }
      return;
    }

    if (SR) {
      const rec = new SR();
      rec.lang = "zh-CN"; rec.continuous = false; rec.interimResults = false;
      rec.onresult = (e: any) => {
        const txt = e.results[0][0].transcript;
        setChatInput(txt);
      };
      rec.onend = () => setRecording(false);
      rec.onerror = () => setRecording(false);
      rec.start();
      recognitionRef.current = rec;
      mediaRecorderRef.current = null;
      setRecording(true);
    } else {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setChatInput("（浏览器不支持录音）");
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        recognitionRef.current = null;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach((track) => track.stop());
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const formData = new FormData();
          formData.append("file", audioBlob, "audio.webm");

          setChatInput("正在识别语音...");
          try {
            const res = await request("/api/qa/stt", {
              method: "POST",
              body: formData,
            });
            const data = await res.json();
            if (data.text) {
              setChatInput(data.text);
            } else {
              setChatInput("");
            }
          } catch (err) {
            console.error("Whisper STT fallback error:", err);
            setChatInput("（语音识别失败）");
          }
        };

        mediaRecorder.start();
        setRecording(true);
      } catch (err) {
        console.error("Mic access denied or error:", err);
        setChatInput("（无法获取麦克风权限）");
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAttachedMedia(prev => [...prev, { type: 'image', url: ev.target?.result as string, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      setAttachedMedia(prev => [...prev, { type: 'video', url, name: file.name }]);
    });
  };

  // Lazy-initialize from window.innerWidth so it's correct on the FIRST render.
  // RoutesScreen is loaded with { ssr: false } so window is always available here.
  const [isMobile, setIsMobile] = useState<boolean>(
    () => typeof window !== "undefined" && window.innerWidth < 768
  );
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [amapLoaded, setAmapLoaded] = useState(false);
  const AMapInstanceRef = useRef<any>(null);

  // Derive the active map container ref based on current layout
  const activeMapRef = isMobile ? mobileMapRef : desktopMapRef;

  // Initialize map instance with Amap JSAPI Loader
  useEffect(() => {
    // Destroy any pre-existing map instance (guards against layout flip races)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.destroy();
      mapInstanceRef.current = null;
      setAmapLoaded(false);
    }

    // 高德 Key 缺失友好提示，避免移动端静默失败
    if (!process.env.NEXT_PUBLIC_AMAP_KEY) {
      console.error("[高德地图] 未配置 NEXT_PUBLIC_AMAP_KEY 环境变量");
      toast.error("地图未配置，请联系管理员添加 NEXT_PUBLIC_AMAP_KEY");
      return;
    }

    // local variable — captured by BOTH initMap AND the cleanup closure so the
    // cleanup can always reach and destroy the map even if map.on('complete')
    // hasn't fired yet (which is when mapInstanceRef.current would still be null).
    let map: any = null;
    let timer: any = null;
    let aborted = false;
    let resizeObserver: ResizeObserver | null = null;

    const initMap = () => {
      if (aborted) return;
      const container = activeMapRef.current;
      if (!container) {
        // 容器还没挂载，下一帧再试（避免移动端 hydration 时机问题）
        timer = setTimeout(initMap, 50);
        return;
      }

      // 容器还未完成布局 — 使用 ResizeObserver 等待，避免无限轮询
      if (container.clientWidth === 0 || container.clientHeight === 0) {
        if (!resizeObserver) {
          resizeObserver = new ResizeObserver(() => {
            if (aborted) return;
            const c = activeMapRef.current;
            if (c && c.clientWidth > 0 && c.clientHeight > 0) {
              resizeObserver?.disconnect();
              resizeObserver = null;
              initMap();
            }
          });
          resizeObserver.observe(container);
        }
        return;
      }

      AMapLoader.load({
        key: process.env.NEXT_PUBLIC_AMAP_KEY || "",
        version: "2.0",
        plugins: ["AMap.Walking", "AMap.Driving", "AMap.Polyline"],
      })
        .then((AMap) => {
          if (aborted) return;
          if (!activeMapRef.current || container !== activeMapRef.current) return;

          // Re-check size — layout could shift while the JSAPI script was loading
          if (container.clientWidth === 0 || container.clientHeight === 0) {
            timer = setTimeout(initMap, 50);
            return;
          }

          AMapInstanceRef.current = AMap;

          const activeCityCenter = POPULAR_CITIES.find(c => c.name === selectedCity)?.center || [106.578, 29.563];
          map = new AMap.Map(container, {
            viewMode: "3D",
            zoom: 13,
            center: activeCityCenter,
            theme: "amap://styles/whitesmoke",
            zoomEnable: true,
            dragEnable: true,
            resizeEnable: true, // 启用容器尺寸变化时自动 resize
          });

          // ↓ Set immediately so cleanup can always destroy it
          mapInstanceRef.current = map;

          map.on("complete", () => {
            if (aborted) return;
            if (!activeMapRef.current || container !== activeMapRef.current) return;
            setAmapLoaded(true);
            const currentCitySpots = ALL_CITIES_SPOTS[selectedCity] || CHONGQING_SPOTS;
            renderAmapMarkers(AMap, map, currentCitySpots);
          });

          // 监听容器尺寸变化(例如移动端虚拟键盘弹起/抽屉打开)，主动触发 resize
          // 这是移动端地图最容易出现"灰屏/不显示"的根因之一
          if (typeof ResizeObserver !== "undefined") {
            resizeObserver = new ResizeObserver(() => {
              if (aborted || !map) return;
              try { map.resize?.(); } catch (_) {}
            });
            resizeObserver.observe(container);
          }
        })
        .catch((e) => {
          if (!aborted) {
            console.error("高德地图加载失败:", e);
            toast.error("地图加载失败，请检查网络或配置");
          }
        });
    };

    initMap();

    return () => {
      aborted = true;
      if (timer) clearTimeout(timer);
      if (resizeObserver) {
        try { resizeObserver.disconnect(); } catch (_) {}
        resizeObserver = null;
      }
      // Destroy via local closure variable — reliable even if complete hasn't fired
      if (map) {
        try { map.destroy(); } catch (_) {}
        map = null;
      }
      mapInstanceRef.current = null;
      setAmapLoaded(false);
    };
  // activeMapRef identity changes whenever isMobile flips (new ref object selected)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  // Audio clean up
  useEffect(() => {
    return () => {
      if (audioInstance) {
        audioInstance.pause();
      }
    };
  }, [audioInstance]);

  // Render markers whenever selectedCity changes or amapLoaded becomes true
  useEffect(() => {
    if (amapLoaded && mapInstanceRef.current && AMapInstanceRef.current) {
      renderAmapMarkers(AMapInstanceRef.current, mapInstanceRef.current, currentSpots);
    }
  }, [selectedCity, amapLoaded]);

  const handleCityClick = (city: typeof POPULAR_CITIES[0]) => {
    setSelectedCity(city.name);
    const citySpots = ALL_CITIES_SPOTS[city.name];
    if (citySpots && citySpots.length > 0) {
      setActiveSpot(citySpots[0]);
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoomAndCenter(13, city.center);
    }
    toast.success(`已切换至城市：${city.name}`);
  };

  // Re-draw route polylines when activeRoute changes (uses real road navigation)
  useEffect(() => {
    const AMap = AMapInstanceRef.current;
    const map = mapInstanceRef.current;
    if (!AMap || !map || !activeRoute) return;

    // Clear old polyline
    if (routePolylineRef.current) {
      if (typeof routePolylineRef.current.clear === "function") {
        routePolylineRef.current.clear();
      } else {
        routePolylineRef.current.setMap(null);
      }
      routePolylineRef.current = null;
    }

    // Connect generated spot coordinates
    const coordinates = activeRoute.spots.map(s => {
      let original: any = null;
      for (const spots of Object.values(ALL_CITIES_SPOTS)) {
        const found = spots.find(orig => orig.id === s.id);
        if (found) {
          original = found;
          break;
        }
      }
      return original ? [original.lng, original.lat] : null; // [lng, lat] for Amap
    }).filter(Boolean) as Array<[number, number]>;

    if (coordinates.length < 2) return;

    // Use AMap.Walking to plan the path along roads
    const walking = new AMap.Walking({
      map: map,
      panel: undefined,
      hideMarkers: true,
      autoFitView: true,
    });

    const origin = coordinates[0];
    const destination = coordinates[coordinates.length - 1];
    const opts = {
      waypoints: coordinates.slice(1, -1),
    };

    walking.search(origin, destination, opts, (status: string, result: any) => {
      if (status === "complete") {
        routePolylineRef.current = walking;
      } else {
        console.warn("高德步行规划失败，降级为折线连接:", result);
        const polyline = new AMap.Polyline({
          path: coordinates,
          strokeColor: "#FF5B45",
          strokeOpacity: 0.85,
          strokeWeight: 6,
          strokeStyle: "dashed",
          strokeDasharray: [10, 10],
        });
        polyline.setMap(map);
        map.setFitView([polyline]);
        routePolylineRef.current = polyline;
      }
    });

    return () => {
      if (routePolylineRef.current) {
        if (typeof routePolylineRef.current.clear === "function") {
          routePolylineRef.current.clear();
        } else {
          routePolylineRef.current.setMap(null);
        }
        routePolylineRef.current = null;
      }
    };
  }, [activeRoute, amapLoaded]);

  // Render markers function using Amap custom markers
  const renderAmapMarkers = (AMap: any, map: any, spotsList: typeof CHONGQING_SPOTS) => {
    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    spotsList.forEach(s => {
      if (!s || typeof s.lng !== "number" || typeof s.lat !== "number" || isNaN(s.lng) || isNaN(s.lat)) {
        console.warn("跳过无效坐标的景点标点:", s);
        return;
      }

      const themeColor =
        s.type === "地标" ? "#EF4444" : s.type === "演出" ? "#F59E0B" : s.type === "寺庙" ? "#8B5CF6" : s.type === "文化" ? "#3B82F6" : s.type === "自然" ? "#10B981" : "#FF5B45";

      const markerHtml = `
        <div class="flex flex-col items-center select-none cursor-pointer">
          <div class="px-2 py-1 bg-white/95 border border-zinc-200 shadow-md rounded-md text-[10px] font-bold text-zinc-800 whitespace-nowrap -translate-y-1" style="border-top: 3px solid ${themeColor};">
            ${s.name}
          </div>
          <div class="w-3.5 h-3.5 rounded-full bg-white border-2 flex items-center justify-center shadow-md -translate-y-1" style="border-color: ${themeColor};">
            <div class="w-1.5 h-1.5 rounded-full" style="background-color: ${themeColor};"></div>
          </div>
        </div>
      `;

      const marker = new AMap.Marker({
        position: [s.lng, s.lat],
        content: markerHtml,
        offset: new AMap.Pixel(-40, -40),
      });

      marker.on("click", () => {
        setActiveSpot(s);
        map.setZoomAndCenter(15, [s.lng, s.lat], false, 300);
        if (autoplayEnabled) {
          speakSpotNarration(s.name, s.desc);
        }
      });

      marker.setMap(map);
      markersRef.current.push(marker);
    });
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    
    let foundSpot: any = null;
    let foundCity = "";
    
    for (const [cityName, spots] of Object.entries(ALL_CITIES_SPOTS)) {
      const match = spots.find(s => s.name.includes(q) || s.addr.includes(q) || s.desc.includes(q));
      if (match) {
        foundSpot = match;
        foundCity = cityName;
        break;
      }
    }

    if (foundSpot) {
      setSelectedCity(foundCity);
      setActiveSpot(foundSpot);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setZoomAndCenter(14, [foundSpot.lng, foundSpot.lat]);
        if (autoplayEnabled) {
          speakSpotNarration(foundSpot.name, foundSpot.desc);
        }
      }
      toast.success(`已找到景点「${foundSpot.name}」，已切换至 ${foundCity}`);
    } else if (q.trim()) {
      toast.error("未在全国范围内找到对应景点，请换个词试试。");
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
    toast.success(`已在 ${selectedCity} 地图上高亮标出附近的「${cat}」设施`);
  };

  // Custom Local generator
  const handleGenerateRoute = async () => {
    setGenerating(true);
    setActiveRoute(null);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const selectedSpots = currentSpots.filter(s => {
      if (selectedInterests.includes("history") && (s.type === "文化" || s.type === "寺庙")) return true;
      if (selectedInterests.includes("nature") && s.type === "自然") return true;
      if (selectedInterests.includes("cultural") && s.type === "地标") return true;
      if (selectedInterests.includes("family")) return true;
      return false;
    });

    const routeSpots = selectedSpots.length > 0 ? selectedSpots.slice(0, 4) : currentSpots.slice(0, 3);
    const mockRoute: GeneratedRoute = {
      name: selectedInterests.includes("history") ? `${selectedCity} · 历史印记之旅` : `${selectedCity} · 都市探秘游`,
      description: `结合您的个人喜好，为您量身规划的一条 ${selectedCity} 游览路线。`,
      highlights: ["核心打卡", "深度慢游", "当地特色"],
      tips: `${selectedCity}景区步行较多，请备好舒适运动鞋，防晒防暑。`,
      spots: routeSpots.map((s, idx) => ({
        id: s.id,
        name: s.name,
        duration: Math.min(30 + idx * 15, duration / 3),
        description: s.desc
      })),
      totalDuration: duration,
      totalDistance: `约 ${(1.2 + routeSpots.length * 0.8).toFixed(1)} 千米`
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
      let foundSpot: any = null;
      for (const spots of Object.values(ALL_CITIES_SPOTS)) {
        const found = spots.find(s => s.id === id);
        if (found) {
          foundSpot = found;
          break;
        }
      }
      return foundSpot;
    }).filter(Boolean);

    const mockRoute: GeneratedRoute = {
      name: preset.name,
      description: `专为体验当地特色而策划的主题游览路线，用时约 ${preset.duration}。`,
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

  // AI Chat responder using backend Q&A RAG chat
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() && attachedMedia.length === 0) return;
    let content = chatInput.trim();
    if (attachedMedia.length > 0) {
      const mediaText = attachedMedia.map(m => m.type === 'image' ? `![图片](${m.url})` : `🎬 [视频: ${m.name}]`).join('\n');
      content = mediaText + (chatInput.trim() ? '\n\n' + chatInput.trim() : '');
    }
    const userMsg = content;
    const updated = [...chatMessages, { role: "user" as const, content: userMsg }];
    setChatMessages(updated);
    setChatInput("");
    setAttachedMedia([]);
    setChatLoading(true);

    try {
      const spotsContext = currentSpots.map(s => `- ${s.name}: ${s.desc} (类型: ${s.type}, 价格: ${s.price}, 开放时间: ${s.time}, 地址: ${s.addr})`).join("\n");
      const questionWithContext = `【景区导航地图信息】:\n${spotsContext}\n\n【用户问题】:\n${userMsg}`;
      const history = updated.slice(0, -1).map(m => ({ role: m.role, content: m.content }));
      
      const res = await request("/api/qa/chat", {
        method: "POST",
        body: JSON.stringify({ question: questionWithContext, history })
      });
      const data = await res.json();
      const answerRaw = data.answer || "抱歉，暂时无法回答。";
      const answer = answerRaw.replace(/\[情感[:：]\s*[^\]]+\]/g, "").trim();
      setChatMessages(prev => [...prev, { role: "assistant", content: answer }]);
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", content: "目前AI服务正在维护中，请稍候片刻。如需帮助，请前往景区服务中心。" }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="relative min-h-svh w-full overflow-hidden bg-neutral-100 select-none">
      {isMobile ? (
        <div
          className="relative w-full flex flex-col overflow-hidden"
          style={{ height: "100svh", minHeight: "100dvh" }}
        >
        
        {/* Full Map Container - 使用 inline 尺寸避免 flex/svh 在移动端初次水合时高度为 0 */}
        <div
          ref={mobileMapRef}
          className="absolute inset-0 z-0 bg-neutral-200"
          style={{
            width: "100%",
            height: "100%",
            minHeight: "100dvh",
          }}
        />

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

          {/* City Switch Carousel on Mobile */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none pt-0.5">
            {POPULAR_CITIES.map((c) => {
              const isActive = selectedCity === c.name;
              return (
                <button
                  key={c.name}
                  onClick={() => handleCityClick(c)}
                  className={`flex-shrink-0 px-3 py-1 rounded-full border text-[11px] font-bold transition-all shadow-sm ${
                    isActive
                      ? "bg-[#4F6F52] text-white border-[#4F6F52]"
                      : "bg-white/95 text-zinc-700 border-zinc-200/60"
                  }`}
                >
                  📍 {c.name}
                </button>
              );
            })}
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

        {/* Floating Smart Route Generator Button */}
        <motion.button
          drag
          dragMomentum={false}
          onClick={() => setShowGeneratorDrawer(true)}
          className="absolute z-30 touch-none w-12 h-12 rounded-full border-2 border-white flex items-center justify-center text-lg shadow-2xl cursor-pointer active:scale-95 transition-all duration-200"
          style={{ right: 12, top: "370px", backgroundColor: "#1D4ED8", boxShadow: "0 8px 24px rgba(29, 78, 216, 0.45)" }}
        >
          🧭
        </motion.button>

        {/* GPS location target button */}
        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setZoomAndCenter(13, [106.578, 29.563]);
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
        <div className="mt-auto relative z-10 w-full px-3 pb-[76px] flex flex-col gap-2.5">




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
                  <h3 className="font-extrabold text-sm text-zinc-900" style={{ fontFamily: "var(--font-noto-serif)" }}>景区全部景点 ({currentSpots.length})</h3>
                  <button onClick={() => setShowSpotsListDrawer(false)} className="text-zinc-400 hover:text-zinc-700 text-xs font-bold">关闭</button>
                </div>
                <div className="space-y-2.5 pt-1.5">
                  {currentSpots.map(s => (
                    <div
                      key={s.id}
                      onClick={() => {
                        setActiveSpot(s);
                        setShowSpotsListDrawer(false);
                        if (mapInstanceRef.current) {
                          mapInstanceRef.current.setZoomAndCenter(14, [s.lng, s.lat]);
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
      ) : (
        <div className="flex flex-col w-full h-screen overflow-hidden bg-[#F7F6F3]">
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

            {/* City Switch Carousel */}
            <div className="flex flex-col gap-1.5 pt-0.5 relative group/carousel">
              <span className="text-[9.5px] font-black text-zinc-400 uppercase tracking-wider">切换热门城市</span>
              <div className="relative w-full">
                <div
                  ref={cityScrollRef}
                  onMouseDown={handleCityMouseDown}
                  onMouseMove={handleCityMouseMove}
                  onMouseUp={handleCityMouseUpOrLeave}
                  onMouseLeave={handleCityMouseUpOrLeave}
                  className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none"
                >
                  {POPULAR_CITIES.map((c) => {
                    const isActive = selectedCity === c.name;
                    return (
                      <button
                        key={c.name}
                        onClick={() => handleCityClick(c)}
                        className={`flex-shrink-0 w-24 rounded-xl border p-1 text-left transition-all snap-start relative overflow-hidden flex flex-col justify-between ${
                          isActive
                            ? "border-[#4F6F52] bg-[#4F6F52]/5 ring-1 ring-[#4F6F52]"
                            : "border-zinc-200 hover:border-zinc-300 bg-white"
                        }`}
                      >
                        <div className="w-full h-11 rounded-lg overflow-hidden relative pointer-events-none">
                          <img src={c.img} alt={c.name} className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 right-1 bg-black/60 text-[7px] text-white/90 px-1 py-0.5 rounded font-black">
                            {c.badge}
                          </span>
                        </div>
                        <div className="mt-1 px-1 flex items-center justify-between pointer-events-none">
                          <span className={`text-[11px] font-extrabold ${isActive ? "text-[#4F6F52]" : "text-zinc-800"}`}>
                            {c.name}
                          </span>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#4F6F52]" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Left/Right scroll buttons */}
                <button
                  type="button"
                  onClick={() => scrollCityCarousel("left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 border border-zinc-200 shadow-md flex items-center justify-center text-zinc-600 hover:bg-neutral-100 hover:text-black transition-all opacity-0 group-hover/carousel:opacity-100 focus:opacity-100 cursor-pointer z-10"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCityCarousel("right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 border border-zinc-200 shadow-md flex items-center justify-center text-zinc-600 hover:bg-neutral-100 hover:text-black transition-all opacity-0 group-hover/carousel:opacity-100 focus:opacity-100 cursor-pointer z-10"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
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

            {/* List of Spots */}
            <div className="space-y-2 pt-2 border-t">
              <h3 className="text-xs font-black text-zinc-800">景区全部景点 ({currentSpots.length})</h3>
              <div className="space-y-1 pr-1 pb-6">
                {currentSpots.map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveSpot(s);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.setZoomAndCenter(14, [s.lng, s.lat]);
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
            <div ref={desktopMapRef} className="w-full h-full" />

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



            {/* Float chat toggle button */}
            {!showFloatChat && (
              <button
                onClick={() => setShowFloatChat(true)}
                className="absolute right-6 bottom-6 z-[1010] w-14 h-14 rounded-full bg-gradient-to-br from-[#4F6F52] to-[#3A5240] text-white shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all border border-[#4F6F52]/30 cursor-pointer"
                title="打开AI导游"
              >
                <MessageSquare className="w-6 h-6 text-white" />
              </button>
            )}

            {/* Floating AI Guide Widget (Image 1 Style) */}
            <AnimatePresence>
              {showFloatChat && (
                <motion.div
                  drag
                  dragControls={dragControls}
                  dragListener={false}
                  dragMomentum={false}
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 50, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute right-6 bottom-6 z-[1010] w-[360px] h-[520px] bg-white border border-[#E6E2D8] rounded-[24px] shadow-2xl flex flex-col overflow-hidden touch-none"
                >
                  {/* Header */}
                  <div
                    onPointerDown={(e) => dragControls.start(e)}
                    className="cursor-move select-none px-4 py-3.5 flex items-center justify-between bg-[#FAF6EE] border-b border-[#E6E2D8]/70 flex-shrink-0"
                  >
                    <div className="flex items-center gap-2.5 pointer-events-none">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-[#D2A053]/30 bg-neutral-100 flex-shrink-0">
                        <img
                          src="https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=100&q=80"
                          alt="AI导游小慧"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-left">
                        <h3 className="font-extrabold text-sm text-[#2C3E35]">AI导游小慧</h3>
                        <span className="text-[10px] text-[#4F6F52] font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                          灵山胜境 • 在线服务中
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowFloatChat(false)}
                        className="text-zinc-500 hover:text-zinc-800 p-1.5 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Chat Dialog Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FDFBF7] scrollbar-thin">
                    {chatMessages.map((msg, i) => {
                      const isUser = msg.role === "user";
                      return (
                        <div key={i} className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
                          <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${isUser ? "bg-neutral-200 text-zinc-700" : "bg-[#3A4D39] text-white"}`}>
                            {isUser ? "我" : "慧"}
                          </div>
                          <div className="flex flex-col space-y-1 max-w-[75%]">
                            <div className={`p-3 rounded-2xl text-[11px] leading-relaxed shadow-sm text-left ${isUser ? "bg-[#4F6F52] text-white rounded-tr-none" : "bg-white border border-[#E6E2D8] text-[#2C3E35] rounded-tl-none"}`}>
                              {/* Attached image renderer */}
                              {msg.content.includes('![图片](') && (
                                <div className="mb-1.5 space-y-1">
                                  {msg.content.match(/!\[图片\]\(([^)]+)\)/g)?.map((match, idx) => {
                                    const url = match.match(/!\[图片\]\(([^)]+)\)/)?.[1];
                                    return url ? <img key={idx} src={url} alt="上传的图片" className="max-w-full max-h-[120px] rounded-lg object-contain border border-white/20 shadow" /> : null;
                                  })}
                                </div>
                              )}
                              {/* Attached video renderer */}
                              {msg.content.includes('🎬 [视频:') && (
                                <div className="mb-1.5 flex items-center gap-1.5 text-[9px] text-[#2C3E35] bg-neutral-100 p-1.5 rounded-lg border border-[#E6E2D8]">
                                  <span>🎬</span>
                                  <span className="truncate flex-1 font-mono">{msg.content.match(/🎬 \[视频: ([^\]]+)\]/)?.[1] || "视频文件"}</span>
                                </div>
                              )}
                              <div>{msg.content.replace(/!\[图片\]\([^)]+\)\n?/g, '').replace(/🎬 \[视频: [^\]]+\]\n?/g, '')}</div>
                            </div>
                            <span className={`text-[8.5px] text-zinc-400 font-mono px-1 ${isUser ? "text-right" : "text-left"}`}>
                              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {chatLoading && (
                      <div className="flex gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-[#3A4D39] text-white flex items-center justify-center text-[10px] font-bold">慧</div>
                        <div className="p-3 rounded-2xl bg-white border border-[#E6E2D8] flex items-center gap-1">
                          <div className="w-1 h-1 bg-[#3A4D39] rounded-full animate-bounce" />
                          <div className="w-1 h-1 bg-[#3A4D39] rounded-full animate-bounce [animation-delay:0.1s]" />
                          <div className="w-1 h-1 bg-[#3A4D39] rounded-full animate-bounce [animation-delay:0.2s]" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Attached Media Previews */}
                  {attachedMedia.length > 0 && (
                    <div className="flex gap-2 flex-wrap px-4 py-2 border-t border-[#E6E2D8]/50 bg-[#FDFBF7] flex-shrink-0">
                      {attachedMedia.map((m, idx) => (
                        <div key={idx} className="relative">
                          {m.type === 'image' ? (
                            <img src={m.url} alt={m.name} className="w-12 h-12 rounded-lg object-cover border border-[#E6E2D8]" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-neutral-100 flex flex-col items-center justify-center border border-[#E6E2D8] text-[10px]">
                              <span className="text-base">🎬</span>
                              <span className="text-[8px] text-zinc-500 scale-90 truncate max-w-full">视频</span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => setAttachedMedia(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] shadow hover:bg-red-600 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Input Bar */}
                  <div className="p-3.5 border-t border-[#E6E2D8]/70 bg-white flex items-center gap-2 flex-shrink-0">
                    <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="w-9 h-9 rounded-full border border-[#E6E2D8] bg-white flex items-center justify-center text-zinc-500 hover:text-[#4F6F52] hover:bg-zinc-50 transition-colors shadow-sm cursor-pointer"
                      title="上传图片"
                    >
                      <ImageIcon className="w-4.5 h-4.5" />
                    </button>

                    <button
                      type="button"
                      onClick={toggleRecording}
                      className="w-9 h-9 rounded-full border border-[#E6E2D8] flex items-center justify-center transition-colors shadow-sm cursor-pointer relative"
                      style={{
                        background: recording ? "rgba(79,111,82,0.15)" : "white",
                        borderColor: recording ? "rgba(79,111,82,0.5)" : "#E6E2D8",
                        color: recording ? "#D2A053" : "#71717a"
                      }}
                      title="语音输入"
                    >
                      {recording && (
                        <motion.div animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 0.9, repeat: Infinity }}
                          className="absolute inset-0 rounded-full"
                          style={{ background: "rgba(210,160,83,0.15)" }} />
                      )}
                      {recording ? (
                        <Mic className="w-4.5 h-4.5 animate-bounce text-[#D2A053]" />
                      ) : (
                        <Mic className="w-4.5 h-4.5" />
                      )}
                    </button>
                    
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                      placeholder={recording ? "正在聆听..." : "向小慧提问...（Enter发送）"}
                      className="flex-1 bg-neutral-50 border border-zinc-200/80 rounded-full px-4 py-2 text-xs outline-none focus:border-[#4F6F52] focus:bg-white transition-all text-[#2C3E35]"
                    />
                    
                    <button
                      onClick={handleSendChatMessage}
                      className="w-9 h-9 rounded-full bg-[#4F6F52] text-white flex items-center justify-center hover:bg-[#3A5240] transition-colors shadow-md flex-shrink-0 active:scale-95 cursor-pointer"
                    >
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
      )}
    </div>
  );
}
