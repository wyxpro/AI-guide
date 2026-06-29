"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import {
  Compass, ArrowRight, Loader2, MapPin, Clock, ChevronLeft, ChevronRight,
  Share2, MessageSquare, ShieldAlert, Award, Search, Send,
  Volume2, VolumeX, Eye, BookOpen, Navigation, Landmark, Sparkles,
  X, Smile, Image as ImageIcon, Film, Mic, Menu
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

const TRAVEL_EMOJIS = ["😊", "👍", "🗺️", "🌟", "📸", "🏛️", "🍜", "❤️", "✨", "🙌", "🚗", "🌸"];

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
    { id: 401, name: "秦始皇帝陵博物院", type: "文化", lat: 34.385, lng: 109.278, price: "¥120", time: "08:30-17:00", addr: "陕西省西安市临潼区秦陵路", distance: "距您 35km", rating: "5A景区", img: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&q=80", desc: "被誉为“世界第八大奇迹”的兵马俑坑，展示了秦代雄壮的地下军阵。" },
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
  const [mapRotation, setMapRotation] = useState(0);

  // Mobile drawers & responsive sidebar toggle states
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [showArtifactsDrawer, setShowArtifactsDrawer] = useState(false);

  // AI Chat Panel
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    { role: "assistant", content: "您好！我是您的智能导览助手小慧。已为您定位至重庆核心景区。想了解哪些景点的门票、历史和特色，或者让我为您定制路线？" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [attachedMedia, setAttachedMedia] = useState<Array<{type: 'image' | 'video', url: string, name: string}>>([]);

  // Auto-play TTS switch
  const [autoplayEnabled, setAutoplayEnabled] = useState(false);

  // Desktop City Carousel Drag Scroll
  const cityScrollRef = useRef<HTMLDivElement>(null);
  const [cityDragState, setCityDragState] = useState({ isDragging: false, startX: 0, scrollLeft: 0 });

  // Responsive state
  const [isMobile, setIsMobile] = useState<boolean>(
    () => typeof window !== "undefined" && window.innerWidth < 768
  );
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Map elements
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const AMapInstanceRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);
  const [amapLoaded, setAmapLoaded] = useState(false);

  // Chat popups
  const [showFloatChat, setShowFloatChat] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Drag controls for Q&A panel
  const dragControls = useDragControls();

  // Audio Playback
  const [isPlayingNarration, setIsPlayingNarration] = useState(false);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);

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

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Voice recording states & refs
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  const handleSpeechInputToggle = async () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (recording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setRecording(false);
      } else if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setRecording(false);
      }
    } else {
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
              console.error("Whisper STT error:", err);
              setChatInput("（语音识别失败）");
            }
          };

          mediaRecorder.start();
          setRecording(true);
        } catch (err) {
          console.error("Mic access denied:", err);
          setChatInput("（无法获取麦克风权限）");
        }
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

  // Helper: Open custom AMap InfoWindow directly on map for a spot
  const showAmapInfoWindow = (spot: any) => {
    if (!mapInstanceRef.current || !AMapInstanceRef.current) return;
    
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    const contentHtml = `
      <div style="font-family: system-ui, -apple-system, sans-serif; padding: 12px; width: 285px; background: white; border-radius: 14px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1); border: 1px solid #e4e4e7; position: relative;">
        <button id="infowin-close-btn" style="position: absolute; right: 10px; top: 10px; border: none; background: transparent; color: #a1a1aa; font-size: 18px; font-weight: bold; cursor: pointer; padding: 0 4px; line-height: 1; outline: none;">×</button>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-right: 15px;">
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              <h4 style="margin: 0; font-size: 13px; font-weight: 800; color: #18181b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${spot.name}</h4>
              <span style="background: rgba(79, 111, 82, 0.1); color: #4F6F52; font-size: 8px; font-weight: 700; padding: 2px 6px; border-radius: 4px; flex-shrink: 0;">⭐ ${spot.rating}</span>
            </div>
            <p style="margin: 6px 0 0 0; font-size: 9.5px; color: #71717a; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${spot.desc}</p>
          </div>
          <img src="${spot.img}" alt="${spot.name}" style="width: 54px; height: 54px; border-radius: 8px; object-fit: cover; border: 1px solid #e4e4e7; flex-shrink: 0;" />
        </div>
        
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px; padding-top: 8px; border-top: 1px solid #f4f4f5;">
          <button id="infowin-speech-btn" style="display: flex; align-items: center; gap: 4px; padding: 5px 10px; border-radius: 8px; border: none; background: #FFF0ED; color: #FF5B45; font-size: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s;">
            <span>🔊</span> 语音讲解
          </button>
          <button id="infowin-artifacts-btn" style="padding: 5px 10px; border-radius: 8px; border: none; background: #EEF2EE; color: #4F6F52; font-size: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s;">
            文物陈列
          </button>
        </div>
      </div>
    `;

    const infoWindow = new AMapInstanceRef.current.InfoWindow({
      isCustom: true,
      content: contentHtml,
      offset: new AMapInstanceRef.current.Pixel(0, -35),
    });

    infoWindow.open(mapInstanceRef.current, [spot.lng, spot.lat]);
    infoWindowRef.current = infoWindow;

    // Bind click events inside InfoWindow
    setTimeout(() => {
      const speechBtn = document.getElementById("infowin-speech-btn");
      const artBtn = document.getElementById("infowin-artifacts-btn");
      const closeBtn = document.getElementById("infowin-close-btn");
      
      if (speechBtn) {
        speechBtn.onclick = () => speakSpotNarration(spot.name, spot.desc);
      }
      if (artBtn) {
        artBtn.onclick = () => setShowArtifactsDrawer(true);
      }
      if (closeBtn) {
        closeBtn.onclick = () => infoWindow.close();
      }
    }, 150);
  };

  // Map initialization
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.destroy();
      mapInstanceRef.current = null;
      setAmapLoaded(false);
    }

    if (!process.env.NEXT_PUBLIC_AMAP_KEY) {
      console.error("[高德地图] 未配置 NEXT_PUBLIC_AMAP_KEY 环境变量");
      toast.error("地图未配置，请联系管理员添加 NEXT_PUBLIC_AMAP_KEY");
      return;
    }

    let map: any = null;
    let timer: any = null;
    let aborted = false;
    let resizeObserver: ResizeObserver | null = null;

    const initMap = () => {
      if (aborted) return;
      const container = mapRef.current;
      if (!container) {
        timer = setTimeout(initMap, 50);
        return;
      }

      if (container.clientWidth === 0 || container.clientHeight === 0) {
        if (!resizeObserver) {
          resizeObserver = new ResizeObserver(() => {
            if (aborted) return;
            const c = mapRef.current;
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
          if (!mapRef.current || container !== mapRef.current) return;

          AMapInstanceRef.current = AMap;

          const activeCityCenter = POPULAR_CITIES.find(c => c.name === selectedCity)?.center || [106.578, 29.563];
          map = new AMap.Map(container, {
            viewMode: "3D",
            zoom: 13,
            center: activeCityCenter,
            theme: "amap://styles/whitesmoke",
            zoomEnable: true,
            dragEnable: true,
            resizeEnable: true,
          });

          mapInstanceRef.current = map;

          map.on("rotate", () => {
            if (!aborted) {
              setMapRotation(map.getRotation() || 0);
            }
          });

          map.on("complete", () => {
            if (aborted) return;
            setAmapLoaded(true);
            const currentCitySpots = ALL_CITIES_SPOTS[selectedCity] || CHONGQING_SPOTS;
            renderAmapMarkers(AMap, map, currentCitySpots);
          });

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
      if (map) {
        try { map.destroy(); } catch (_) {}
        map = null;
      }
      mapInstanceRef.current = null;
      setAmapLoaded(false);
    };
  }, []);

  // Cleanup audio & infoWindow on unmount
  useEffect(() => {
    return () => {
      if (audioInstance) {
        audioInstance.pause();
      }
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, [audioInstance]);

  // Render markers whenever selectedCity changes or amapLoaded becomes true
  useEffect(() => {
    if (amapLoaded && mapInstanceRef.current && AMapInstanceRef.current) {
      renderAmapMarkers(AMapInstanceRef.current, mapInstanceRef.current, currentSpots);
    }
  }, [selectedCity, amapLoaded]);

  // Close infoWindow when city changes
  useEffect(() => {
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }
  }, [selectedCity]);

  const handleCityClick = (city: typeof POPULAR_CITIES[0]) => {
    setSelectedCity(city.name);
    const citySpots = ALL_CITIES_SPOTS[city.name];
    if (citySpots && citySpots.length > 0) {
      setActiveSpot(citySpots[0]);
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoomAndCenter(13, city.center, false, 300);
    }
    toast.success(`已切换至城市：${city.name}`);
  };

  // Re-draw route polylines when activeRoute changes
  useEffect(() => {
    const AMap = AMapInstanceRef.current;
    const map = mapInstanceRef.current;
    if (!AMap || !map || !activeRoute) return;

    if (routePolylineRef.current) {
      if (typeof routePolylineRef.current.clear === "function") {
        routePolylineRef.current.clear();
      } else {
        routePolylineRef.current.setMap(null);
      }
      routePolylineRef.current = null;
    }

    const coordinates = activeRoute.spots.map(s => {
      let original: any = null;
      for (const spots of Object.values(ALL_CITIES_SPOTS)) {
        const found = spots.find(orig => orig.id === s.id);
        if (found) {
          original = found;
          break;
        }
      }
      return original ? [original.lng, original.lat] : null;
    }).filter(Boolean) as Array<[number, number]>;

    if (coordinates.length < 2) return;

    const walking = new AMap.Walking({
      map: map,
      panel: undefined,
      hideMarkers: true,
      autoFitView: true,
    });

    walking.search(coordinates[0], coordinates[coordinates.length - 1], {
      waypoints: coordinates.slice(1, -1)
    }, (status: string, result: any) => {
      if (status === "complete" && result.routes && result.routes[0]) {
        const path: Array<[number, number]> = [];
        result.routes[0].steps.forEach((step: any) => {
          step.path.forEach((p: any) => {
            path.push([p.lng, p.lat]);
          });
        });

        const polyline = new AMap.Polyline({
          path: path,
          strokeColor: "#4F6F52",
          strokeWeight: 6,
          strokeOpacity: 0.9,
          strokeStyle: "solid",
          lineJoin: "round",
          lineCap: "round",
          showDir: true,
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

  const renderAmapMarkers = (AMap: any, map: any, spotsList: typeof CHONGQING_SPOTS) => {
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    spotsList.forEach(s => {
      if (!s || typeof s.lng !== "number" || typeof s.lat !== "number" || isNaN(s.lng) || isNaN(s.lat)) {
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
        showAmapInfoWindow(s);
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
        mapInstanceRef.current.setZoomAndCenter(14, [foundSpot.lng, foundSpot.lat], false, 300);
        showAmapInfoWindow(foundSpot);
        if (autoplayEnabled) {
          speakSpotNarration(foundSpot.name, foundSpot.desc);
        }
      }
      toast.success(`已找到景点「${foundSpot.name}」，已切换至 ${foundCity}`);
    } else if (q.trim()) {
      toast.error("未在全国范围内找到对应景点，请换个词试试。");
    }
  };

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

  const handleGenerateRoute = async () => {
    setGenerating(true);
    setActiveRoute(null);

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
    toast.success("专属路线生成成功！已为您在地图上绘制路径。");
  };

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
    <div className="relative w-full h-[100dvh] flex flex-col overflow-hidden bg-[#F7F6F3] select-none text-zinc-800">
      
      {/* Hidden File Inputs for AI chat attachments */}
      <input
        type="file"
        accept="image/*"
        multiple
        ref={imageInputRef}
        onChange={handleImageSelect}
        className="hidden"
      />
      <input
        type="file"
        accept="video/*"
        multiple
        ref={videoInputRef}
        onChange={handleVideoSelect}
        className="hidden"
      />

      {/* 1. Integrated Header (Mobile only) */}
      <div className="md:hidden flex items-center justify-between px-4 h-14 bg-white border-b border-zinc-200/80 shadow-sm z-40 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowLeftSidebar(!showLeftSidebar);
              setShowRightSidebar(false);
            }}
            className="w-8 h-8 rounded-lg bg-[#4F6F52]/10 flex items-center justify-center text-[#4F6F52] hover:bg-[#4F6F52]/20 active:scale-95 transition-all"
            title="查看选项"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Integrated Top Search in mobile header */}
        <div className="flex-1 max-w-[180px] h-8.5 mx-2 flex items-center bg-zinc-100/90 rounded-full px-2.5 border border-zinc-200/40">
          <Search className="w-3.5 h-3.5 text-zinc-400 mr-1.5 flex-shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
            placeholder={`搜索${selectedCity}...`}
            className="w-full bg-transparent outline-none text-[10.5px] font-semibold text-zinc-800 placeholder:text-zinc-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowLeftSidebar(true);
              setShowRightSidebar(false);
            }}
            className="px-2.5 h-8.5 rounded-full bg-[#4F6F52] text-white flex items-center gap-0.5 text-[10.5px] font-extrabold active:scale-95 transition-all"
          >
            <MapPin className="w-3 h-3" />
            <span>{selectedCity}</span>
          </button>

          <button
            onClick={() => {
              setShowRightSidebar(!showRightSidebar);
              setShowLeftSidebar(false);
            }}
            className="w-8 h-8 rounded-lg bg-[#3A4D39] text-white flex items-center justify-center hover:bg-[#4F6F52] active:scale-95 transition-all"
            title="AI咨询"
          >
            <MessageSquare className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* 2. Main Workspace */}
      <div className="flex-1 flex w-full overflow-hidden relative">
        
        {/* Mobile Backdrop Overlay */}
        {isMobile && (showLeftSidebar || showRightSidebar) && (
          <div
            onClick={() => {
              setShowLeftSidebar(false);
              setShowRightSidebar(false);
            }}
            className="absolute inset-0 bg-black/40 z-20 backdrop-blur-sm transition-opacity duration-300"
          />
        )}

        {/* COLUMN 1: LEFT SIDEBAR (City switch, routes, spots list) */}
        <div className={`
          bg-white border-zinc-200/80 flex flex-col p-4 space-y-5 flex-shrink-0 shadow-lg z-30 transition-all duration-300
          ${isMobile ? 'absolute top-0 bottom-0 left-0 w-[290px] h-full' : 'w-[320px] border-r'}
          ${isMobile && !showLeftSidebar ? '-translate-x-full' : 'translate-x-0'}
        `}>
          <div className="pb-1 border-b border-zinc-100 flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-base text-zinc-900 flex items-center gap-1.5" style={{ fontFamily: "var(--font-noto-serif)" }}>
                <Landmark className="w-[18px] h-[18px] text-[#3A4D39]" />
                景区导航地图
              </h2>
              <p className="text-[10.5px] text-zinc-400 mt-0.5">点击景点查看详情和导航</p>
            </div>
            {isMobile && (
              <button onClick={() => setShowLeftSidebar(false)} className="text-zinc-400 hover:text-zinc-600 text-xs font-bold">关闭</button>
            )}
          </div>

          {/* City switcher carousel */}
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
                      onClick={() => {
                        handleCityClick(c);
                        if (isMobile) {
                          setShowLeftSidebar(false);
                        }
                      }}
                      className={`flex-shrink-0 w-28 rounded-xl overflow-hidden border text-left transition-all snap-start select-none ${
                        isActive ? "border-[#4F6F52] bg-[#4F6F52]/5 ring-1 ring-[#4F6F52]/20" : "border-zinc-200/80 bg-white hover:border-zinc-300"
                      }`}
                    >
                      <div className="relative h-20 w-full">
                        <img src={c.img} alt={c.name} className="w-full h-full object-cover" pointerEvents="none" />
                        <span className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-sm text-[8px] text-white px-1.5 py-0.5 rounded font-black">
                          {c.badge}
                        </span>
                      </div>
                      <div className="p-1.5 flex items-center justify-between">
                        <span className={`text-[11.5px] font-black ${isActive ? "text-[#4F6F52]" : "text-zinc-700"}`}>{c.name}</span>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#4F6F52]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Route Generator preferences */}
          <div className="space-y-3.5 pt-1.5 border-t">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-zinc-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#D2A053] animate-pulse" />
                智能专属路线生成
              </h3>
            </div>
            
            <div className="space-y-2 bg-[#FAF8F5] border border-zinc-200/50 p-2.5 rounded-xl">
              <div className="space-y-1">
                <span className="text-[9.5px] font-bold text-zinc-500 block">游玩偏好:</span>
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
                onClick={() => {
                  handleGenerateRoute();
                  if (isMobile) {
                    setShowLeftSidebar(false);
                  }
                }}
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
                <div className="p-2.5 rounded-xl bg-white border border-zinc-200 text-[10px] space-y-2 max-h-[140px] overflow-y-auto">
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
          </div>

          {/* List of Scenic Spots */}
          <div className="space-y-2 pt-2 border-t flex-1 flex flex-col overflow-hidden">
            <h3 className="text-xs font-black text-zinc-800">景区全部景点 ({currentSpots.length})</h3>
            <div className="space-y-1 pr-1 pb-6 overflow-y-auto flex-1 scrollbar-thin">
              {currentSpots.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveSpot(s);
                    if (isMobile) {
                      setShowLeftSidebar(false);
                    }
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.setZoomAndCenter(14, [s.lng, s.lat], false, 300);
                      showAmapInfoWindow(s);
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

        {/* COLUMN 2: CENTER MAP COMPONENT */}
        <div className="flex-1 relative bg-zinc-100 h-full overflow-hidden z-10">
          <div ref={mapRef} className="w-full h-full" />

          {/* Map Top horizontal Popular Spots Cards overlay (Aligned to left, avoiding top-right controls) */}
          <div className="absolute top-4 left-4 z-25 flex gap-2 overflow-x-auto scrollbar-none pb-1.5 snap-x w-[calc(100%-65px)] md:max-w-[calc(100%-180px)]">
            {currentSpots.slice(0, 6).map((spot) => {
              const isActive = activeSpot?.id === spot.id;
              return (
                <button
                  key={spot.id}
                  onClick={() => {
                    setActiveSpot(spot);
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.setZoomAndCenter(15, [spot.lng, spot.lat], false, 300);
                      showAmapInfoWindow(spot);
                    }
                    if (autoplayEnabled) {
                      speakSpotNarration(spot.name, spot.desc);
                    }
                  }}
                  className={`flex-shrink-0 w-[140px] rounded-xl overflow-hidden bg-white/95 backdrop-blur-md border transition-all text-left shadow-md flex flex-col snap-start ${
                    isActive ? "border-[#4F6F52] ring-2 ring-[#4F6F52]/20" : "border-zinc-200/40"
                  }`}
                >
                  <div className="relative h-14 w-full flex-shrink-0">
                    <img src={spot.img} alt={spot.name} className="w-full h-full object-cover" />
                    <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-sm text-[7px] text-white px-1.5 py-0.5 rounded-full font-black">
                      ⭐ {spot.rating}
                    </div>
                  </div>
                  <div className="p-2 flex flex-col justify-between flex-1 min-w-0">
                    <div className="text-[11px] font-black text-zinc-900 truncate leading-tight">{spot.name}</div>
                    <div className="flex items-center justify-between mt-1 text-[9px] text-[#4F6F52] font-bold">
                      <span>地标：{spot.type}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Category filters legends */}
          <div className="hidden md:flex absolute left-4 bottom-4 z-10 bg-white/95 backdrop-blur shadow-md border border-zinc-200/80 rounded-xl px-4 py-2 items-center gap-4 text-xs font-bold text-zinc-700">
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> 地标</div>
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> 演出</div>
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> 寺庙</div>
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> 文化</div>
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> 祈福</div>
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> 自然</div>
          </div>

          {/* Floating Compass and Zoom controls stacked in the top-right corner (Pushed lower on mobile) */}
          <div className="absolute right-4 top-36 md:top-4 z-30 flex flex-col gap-2">
            <button
              onClick={() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.setPitch(0);
                  mapInstanceRef.current.setRotation(0);
                  setMapRotation(0);
                  toast.success("已重置地图方向为正北");
                }
              }}
              className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-zinc-200/50 flex items-center justify-center text-zinc-700 hover:bg-zinc-50 active:scale-95 transition-all"
              title="重置正北"
            >
              <div style={{ transform: `rotate(${-mapRotation}deg)` }} className="transition-transform duration-100 ease-out">
                <Compass className="w-5 h-5 text-[#FF5B45]" />
              </div>
            </button>

            <button
              onClick={() => {
                if (mapInstanceRef.current) {
                  const center = POPULAR_CITIES.find(c => c.name === selectedCity)?.center || [106.578, 29.563];
                  mapInstanceRef.current.setZoomAndCenter(13, center, false, 300);
                  toast.info(`已定位至 ${selectedCity} 核心区`);
                }
              }}
              className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-zinc-200/50 flex items-center justify-center text-zinc-700 hover:bg-zinc-50 active:scale-95 transition-all"
              title="定位核心"
            >
              <Navigation className="w-4.5 h-4.5 text-zinc-600" />
            </button>

            <button onClick={() => mapInstanceRef.current?.zoomIn()} className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md border shadow-lg flex items-center justify-center font-bold text-zinc-700 hover:bg-neutral-50 active:scale-95">+</button>
            <button onClick={() => mapInstanceRef.current?.zoomOut()} className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md border shadow-lg flex items-center justify-center font-bold text-zinc-700 hover:bg-neutral-50 active:scale-95">-</button>
          </div>

          {/* Desktop Draggable Float AI Assistant Panel (Wider and shorter: w-360px h-500px) */}
          {!isMobile && !showFloatChat && (
            <button
              onClick={() => setShowFloatChat(true)}
              className="absolute bottom-4 right-4 z-30 w-14 h-14 rounded-full bg-[#4F6F52] text-white shadow-2xl flex flex-col items-center justify-center hover:bg-[#3A5240] active:scale-95 transition-all group"
            >
              <MessageSquare className="w-6 h-6 animate-pulse" />
              <span className="text-[9px] font-black mt-0.5 scale-90">智能向导</span>
            </button>
          )}

          {!isMobile && showFloatChat && (
            <motion.div
              drag
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ left: -800, right: 50, top: -400, bottom: 100 }}
              dragElastic={0.05}
              dragMomentum={false}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute bottom-4 right-4 z-30 w-[360px] h-[420px] bg-white/95 backdrop-blur-md rounded-2xl border border-zinc-200/80 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header acts as drag handle */}
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="p-3 bg-zinc-50/50 border-b border-zinc-100 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
              >
                <div className="flex items-center gap-2 pointer-events-none">
                  <div className="w-7 h-7 rounded-full bg-[#4F6F52]/10 flex items-center justify-center text-[#4F6F52]">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs text-zinc-800">智能向导小慧</h3>
                    <span className="text-[8.5px] text-zinc-400 block mt-0.5">按住此处可上下左右拖拽</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowFloatChat(false)}
                  className="w-6 h-6 rounded-full hover:bg-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3.5 bg-zinc-50/40">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-sm ${
                      msg.role === "user" ? "bg-[#3A4D39] text-white" : "bg-white text-zinc-800 border"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border text-zinc-500 rounded-2xl px-3 py-1.5 text-xs flex items-center gap-1.5 shadow-sm">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>思考中...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Attachments view */}
              {attachedMedia.length > 0 && (
                <div className="px-3 py-1.5 bg-neutral-100 border-t flex flex-wrap gap-2">
                  {attachedMedia.map((m, idx) => (
                    <div key={idx} className="bg-white rounded-lg border px-2 py-0.5 text-[8.5px] font-bold text-zinc-600 flex items-center gap-1">
                      <span>{m.type === 'image' ? '🖼️' : '🎬'}</span>
                      <span className="truncate max-w-[80px]">{m.name}</span>
                      <button onClick={() => setAttachedMedia(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 font-extrabold text-[10px]">×</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Chat Inputs */}
              <div className="p-2 border-t border-zinc-100 bg-white flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="w-7 h-7 rounded-full border border-zinc-200 text-zinc-500 hover:bg-neutral-50 flex items-center justify-center cursor-pointer transition-colors"
                    title="选择图片"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleSpeechInputToggle}
                    className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                      recording ? "border-amber-500 bg-amber-50 text-amber-600 shadow" : "border-zinc-200 text-zinc-500 hover:bg-neutral-50"
                    }`}
                    title="语音提问"
                  >
                    {recording ? <Mic className="w-3.5 h-3.5 animate-bounce" /> : <Mic className="w-3.5 h-3.5" />}
                  </button>

                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                    placeholder={recording ? "正在聆听..." : "向小慧提问..."}
                    className="flex-1 bg-neutral-50 border border-zinc-200/80 rounded-full px-3 py-2 text-xs outline-none focus:border-[#4F6F52] focus:bg-white transition-all text-[#2C3E35]"
                  />

                  <button
                    onClick={handleSendChatMessage}
                    className="w-7 h-7 rounded-full bg-[#4F6F52] text-white flex items-center justify-center hover:bg-[#3A5240] transition-colors shadow-md flex-shrink-0 active:scale-95"
                  >
                    <Send className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* COLUMN 3: RIGHT SIDEBAR (AI Q&A Guide Chat Panel - Mobile Drawer version only) */}
        {isMobile && (
          <div className={`
            bg-white border-zinc-200/80 flex flex-col overflow-hidden shadow-lg z-30 transition-all duration-300
            absolute top-0 bottom-0 right-0 w-[300px]
            ${!showRightSidebar ? 'translate-x-full' : 'translate-x-0'}
          `}>
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#4F6F52]/10 flex items-center justify-center text-[#4F6F52]">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-zinc-800">智能向导小慧</h3>
                  <span className="text-[8.5px] text-zinc-400 block mt-0.5">支持语音提问与多媒体识别</span>
                </div>
              </div>
              <button onClick={() => setShowRightSidebar(false)} className="text-zinc-400 hover:text-zinc-600 text-xs font-bold">关闭</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/40">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-sm ${
                    msg.role === "user" ? "bg-[#3A4D39] text-white" : "bg-white text-zinc-800 border"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border text-zinc-500 rounded-2xl px-3.5 py-2 text-xs flex items-center gap-1.5 shadow-sm">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>思考中...</span>
                  </div>
                </div>
              )}
            </div>

            {attachedMedia.length > 0 && (
              <div className="px-4 py-2 bg-neutral-100 border-t flex flex-wrap gap-2 flex-shrink-0">
                {attachedMedia.map((m, idx) => (
                  <div key={idx} className="bg-white rounded-lg border px-2 py-1 text-[9px] font-bold text-zinc-600 flex items-center gap-1">
                    <span>{m.type === 'image' ? '🖼️' : '🎬'}</span>
                    <span className="truncate max-w-[80px]">{m.name}</span>
                    <button onClick={() => setAttachedMedia(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 font-extrabold text-[10px]">×</button>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 border-t border-zinc-100 bg-white flex-shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="w-8 h-8 rounded-full border border-zinc-200 text-zinc-500 hover:bg-neutral-50 flex items-center justify-center cursor-pointer transition-colors"
                  title="选择图片"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                <button
                  onClick={handleSpeechInputToggle}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                    recording ? "border-amber-500 bg-amber-50 text-amber-600 shadow" : "border-zinc-200 text-zinc-500 hover:bg-neutral-50"
                  }`}
                  title="语音提问"
                >
                  {recording ? <Mic className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                  placeholder={recording ? "正在聆听..." : "向小慧提问..."}
                  className="flex-1 bg-neutral-50 border border-zinc-200/80 rounded-full px-4 py-2.5 text-xs outline-none focus:border-[#4F6F52] focus:bg-white transition-all text-[#2C3E35]"
                />

                <button
                  onClick={handleSendChatMessage}
                  className="w-8 h-8 rounded-full bg-[#4F6F52] text-white flex items-center justify-center hover:bg-[#3A5240] transition-colors shadow-md flex-shrink-0 active:scale-95"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Artifacts drawer modal */}
      <AnimatePresence>
        {showArtifactsDrawer && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              onClick={() => setShowArtifactsDrawer(false)}
              className="absolute inset-0 bg-black z-45" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25 }}
              className="absolute bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-5 space-y-3 max-h-[70vh] overflow-y-auto md:max-w-[460px] md:mx-auto md:rounded-3xl md:bottom-[10%] md:top-[10%] md:h-[600px]">
              <div className="flex items-center justify-between pb-2 border-b">
                <h3 className="font-extrabold text-sm text-zinc-900" style={{ fontFamily: "var(--font-noto-serif)" }}>巴蜀文博陈列</h3>
                <button onClick={() => setShowArtifactsDrawer(false)} className="text-zinc-400 hover:text-zinc-750 text-xs font-bold">关闭</button>
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
  );
}
