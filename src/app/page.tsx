"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Check, ChevronRight, ChevronLeft, Star, ArrowRight,
  Users, Bot, MessageCircle, MapPin, Navigation, TrendingUp
} from "lucide-react";
import { auth } from "@eazo/sdk";

const Live2DViewer = dynamic(() => import("@/components/ui/Live2DViewer"), { ssr: false });

// Animation Spring Config
const SPRING = { type: "spring" as const, stiffness: 100, damping: 20 };

// 1. User Personas Data
const PERSONAS = [
  {
    id: "elder",
    title: "银发暖心旅伴",
    role: "60岁+ 银发长者",
    icon: "🌸",
    tag: "适老关物 · 大字缓速",
    desc: "针对中老年游客的无障碍设计，提供大字号播报、舒缓语音与平坦休憩路线。",
    themeColor: "#EC4899",
    bgGradient: "from-pink-500/10 via-rose-500/5 to-transparent",
    borderColor: "border-pink-200 hover:border-pink-400",
    badgeBg: "bg-pink-50 text-pink-600 border-pink-200",
    features: ["超大字号清晰读", "舒缓温和语速", "无陡坡平坦路线"],
    sliders: [
      { name: "字体大小关怀", value: 95 },
      { name: "防摔舒适指数", value: 90 },
    ],
  },
  {
    id: "child",
    title: "童趣家庭伴游",
    role: "亲子家庭与儿童",
    icon: "🍬",
    tag: "卡通拟音 · 趣味问答",
    desc: "卡通数字人化身探险队长，将历史知识转化为童话故事与趣味闯关问答。",
    themeColor: "#F59E0B",
    bgGradient: "from-amber-500/10 via-yellow-500/5 to-transparent",
    borderColor: "border-amber-200 hover:border-amber-400",
    badgeBg: "bg-amber-50 text-amber-600 border-amber-200",
    features: ["卡通数字人音色", "启发式科普问答", "洗手间游乐点串联"],
    sliders: [
      { name: "故事化趣味度", value: 92 },
      { name: "服务点密集度", value: 95 },
    ],
  },
  {
    id: "scholar",
    title: "深度文史行者",
    role: "文史古建爱好者",
    icon: "📜",
    tag: "考证典故 · 学术解说",
    desc: "深度挖掘历史古迹的前世今生，提供学术级考证、文献引用与建筑美学剖析。",
    themeColor: "#10B981",
    bgGradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
    borderColor: "border-emerald-200 hover:border-emerald-400",
    badgeBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
    features: ["历代典故学术考证", "古建筑结构拆解", "深度人文探寻路线"],
    sliders: [
      { name: "历史考证深度", value: 96 },
      { name: "学术严谨指数", value: 92 },
    ],
  },
  {
    id: "speed",
    title: "特种兵极致打卡",
    role: "独立青年与摄友",
    icon: "⚡",
    tag: "用时最少 · 极致出片",
    desc: "算法定制“用时最少、打卡最全、光线最佳”路线，动态避堵高频精讲。",
    themeColor: "#3B82F6",
    bgGradient: "from-blue-500/10 via-indigo-500/5 to-transparent",
    borderColor: "border-blue-200 hover:border-blue-400",
    badgeBg: "bg-blue-50 text-blue-600 border-blue-200",
    features: ["出片最佳光线机位", "即时避堵路线重构", "3分钟要点精炼"],
    sliders: [
      { name: "时间紧凑指数", value: 98 },
      { name: "出片胜率预测", value: 94 },
    ],
  },
];

// 2. Competitive Analysis Chart Metrics & Paths
// Center: (150, 150), Radius: 100
// Metrics: Q&A (0 deg), Cost (72 deg), Personalization (144 deg), Speed (216 deg), Depth (288 deg)
const RADAR_METRICS = [
  { name: "智能问答精度", angle: 0 },
  { name: "成本效益", angle: 72 },
  { name: "个性定制能力", angle: 144 },
  { name: "动态响应速度", angle: 216 },
  { name: "文化解说深度", angle: 288 },
];

const buildRadarPoint = (angle: number, radius: number) => {
  const rad = (angle * Math.PI) / 180;
  return {
    x: Number((150 + radius * Math.sin(rad)).toFixed(3)),
    y: Number((150 - radius * Math.cos(rad)).toFixed(3)),
  };
};

const RADAR_GRID_POINTS = [20, 40, 60, 80, 100].map((radius) => ({
  radius,
  points: RADAR_METRICS.map((m) => {
    const { x, y } = buildRadarPoint(m.angle, radius);
    return `${x},${y}`;
  }).join(" "),
}));

const RADAR_AXIS_LINES = RADAR_METRICS.map((m) => ({
  name: m.name,
  ...buildRadarPoint(m.angle, 100),
}));

const COMP_PRODUCTS = [
  {
    name: "旅行家Pro",
    color: "#4F6F52",
    fill: "rgba(79, 111, 82, 0.4)",
    points: "150,55 235.6,122.2 205.8,226.9 92.4,229.3 64.4,122.2", // Values: 95, 90, 95, 98, 90
    values: [95, 90, 95, 98, 90],
  },
  {
    name: "传统导览App",
    color: "#8F9F8F",
    fill: "rgba(143, 159, 143, 0.2)",
    points: "150,110 221.3,126.8 167.6,174.3 103.5,197.1 102.5,135.5", // Values: 40, 75, 30, 80, 50
    values: [40, 75, 30, 80, 50],
  },
  {
    name: "人工金牌导游",
    color: "#D2A053",
    fill: "rgba(210, 160, 83, 0.3)",
    points: "150,65 169.0,143.8 197.0,214.7 120.6,190.9 61.4,120.7", // Values: 85, 20, 80, 50, 95
    values: [85, 20, 80, 50, 95],
  },
];

// 3. User Reviews Data for Double-row Marquee
const ROW1_REVIEWS = [
  {
    name: "王建国 (67岁)",
    role: "退休教师 / 银发旅客",
    avatar: "👴",
    rating: 5,
    tag: "适老陪伴",
    comment: "大字模式和慢速声音真的太贴心了！以前跟不上导游的脚步，用这个AI导览，自己能看着大字，听着慢慢悠悠的讲解，走到哪讲到哪，极其舒服！",
  },
  {
    name: "林小萌与妈妈",
    role: "亲子家庭",
    avatar: "👩‍👦",
    rating: 5,
    tag: "童趣体验",
    comment: "小糖果数字人说话萌萌的，孩子一路上跟着听知识问答，平时很调皮这回倒非常专注。路线还很细心地规划了无障碍和厕所，省了我们不少力气。",
  },
  {
    name: "Alex",
    role: "户外旅行博主",
    avatar: "🧑‍💻",
    rating: 5,
    tag: "高效打卡",
    comment: "特种兵路线吹爆！半天时间把整个渝中半岛最火的机位全走了一遍，AI还能根据前方的实时拥堵避开人群，顺光拍出的大片直接出圈！",
  },
  {
    name: "陈华教授",
    role: "大学历史系教师",
    avatar: "🧔",
    rating: 5,
    tag: "深度考证",
    comment: "本以为景区的AI只是应付了事，没想到对洪崖洞的牌匾典故、宋代古迹的微量元素演变讲解得十分详备扎实，甚至给出了古籍出处，专业度惊人。",
  },
];

const ROW2_REVIEWS = [
  {
    name: "李阿姨 (62岁)",
    role: "退休职工 / 银发游客",
    avatar: "👵",
    rating: 5,
    tag: "语言适配",
    comment: "这个系统的语音非常清晰，支持方言识别，我的普通话不标准它也能听懂！而且还会推荐平坦的轮椅通道，对老人太方便了。",
  },
  {
    name: "张阳 (28岁)",
    role: "科技数码狂热者",
    avatar: "🧑",
    rating: 5,
    tag: "3D扫描",
    comment: "用手机扫一扫珍玩古迹，3D扫描拓扑结构马上就出来了，数字人导游还能进行中英文双语高精讲解，交互延迟低，体验极其硬核！",
  },
  {
    name: "沫沫与爸爸",
    role: "小学生家庭",
    avatar: "👧",
    rating: 5,
    tag: "科普探索",
    comment: "AI导游变成了一个可爱的数字人，一边讲古遗迹的科学奥秘一边给我们发徽章奖励。沫沫玩了一天也不喊累，学到了不少历史知识！",
  },
  {
    name: "杜航 (33岁)",
    role: "自由行达人",
    avatar: "🎒",
    rating: 5,
    tag: "智能避堵",
    comment: "下午三点突然下大雨，系统自动帮我把户外路线改成了重庆大剧院和室内博物馆，不仅防雨而且人流极少，这个智能避堵和实时微调简直神了。",
  },
];

// 4. Membership Plans
const PLANS = [
  {
    name: "Free 体验版",
    price: "0",
    period: "天",
    desc: "适合单日轻度尝鲜的游客",
    features: [
      "基础AI文字互动问答",
      "景区标准导游地图",
      "5个核心景点基础文本介绍",
      "每日限制问答10条",
    ],
    cta: "立即体验",
    popular: false,
    gradient: "linear-gradient(135deg, #FAF8F5, #F0EDE5)",
    border: "border-[#E6E2D8]",
    buttonStyle: { background: "#FAF8F5", color: "#4F6F52", border: "1px solid #4F6F52" },
  },
  {
    name: "VIP 畅游卡",
    price: "19",
    period: "次/24h",
    desc: "最受游客欢迎的深度畅玩计划",
    features: [
      "专属虚拟人 (古典/宋代/童趣) 形象任选",
      "7×24小时无限次流畅语音对谈",
      "AI独家定制黄金游览路线（防拥堵）",
      "学术级古迹讲解与历史考证档案",
      "离线音频与地图包下载",
    ],
    cta: "畅游体验",
    popular: true,
    gradient: "linear-gradient(135deg, #1A2520, #121815)",
    border: "border-[#D2A053]",
    buttonStyle: { background: "linear-gradient(135deg,#D2A053,#B8843A)", color: "#ffffff" },
  },
  {
    name: "SVIP 家庭年卡",
    price: "199",
    period: "年",
    desc: "适合家庭出游 and 深度常客",
    features: [
      "支持绑定3个家庭成员账号",
      "全年无限制使用所有数字人形象",
      "儿童科普小助手专享特权",
      "特聘历史学者级语音档案更新",
      "景区线下文创及特色餐饮85折优惠",
    ],
    cta: "解锁特权",
    popular: false,
    gradient: "linear-gradient(135deg, #FAF8F5, #F0EDE5)",
    border: "border-[#E6E2D8]",
    buttonStyle: { background: "linear-gradient(135deg,#4F6F52,#3A5240)", color: "#ffffff" },
  },
  {
    name: "终身至尊会员",
    price: "399",
    period: "永久",
    desc: "一次性解锁全部终身特权权益",
    features: [
      "终身免费无限制全平台服务",
      "优先体验AI新功能与3D数字人",
      "线下VIP金牌接待绿色通道",
      "全国合作景区通用导览特权",
      "特邀历史文化线下沙龙名额",
    ],
    cta: "尊享特权",
    popular: false,
    gradient: "linear-gradient(135deg, #FAF8F5, #F0EDE5)",
    border: "border-[#D2A053]/50",
    buttonStyle: { background: "linear-gradient(135deg,#D2A053,#9E7233)", color: "#ffffff" },
  },
];



export default function WelcomePage() {
  const [activePersona, setActivePersona] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(2); // Center initial card
  const [windowWidth, setWindowWidth] = useState(1200);



  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeatureIndex((prev) => (prev + 1) % 6);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const handleStart = () => {
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: "#FAF8F5", color: "#1E2522" }}>
      {/* 3D Ambient Orbs */}
      <div className="absolute top-[10%] left-[-10%] w-[40vw] h-[40vw] rounded-full filter blur-[120px] pointer-events-none opacity-20" style={{ background: "radial-gradient(circle, #4F6F52, transparent)" }} />
      <div className="absolute top-[40%] right-[-15%] w-[45vw] h-[45vw] rounded-full filter blur-[140px] pointer-events-none opacity-15" style={{ background: "radial-gradient(circle, #D2A053, transparent)" }} />
      <div className="absolute bottom-[5%] left-[20%] w-[35vw] h-[35vw] rounded-full filter blur-[100px] pointer-events-none opacity-10" style={{ background: "radial-gradient(circle, #6B8F6E, transparent)" }} />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 border-b border-[#E6E2D8]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/image/logo.png" alt="旅行家Pro Logo" className="w-10 h-10 object-contain rounded-xl" />
            <div>
              <h1 className="text-[17px] font-black tracking-wide" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
                旅行家Pro
              </h1>
              <p className="text-[10px] tracking-widest text-[#8F9F8F] uppercase">Next-Gen Virtual Guide</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#intro" className="hover:text-[#4F6F52] transition-colors">项目简介</a>
            <a href="#persona" className="hover:text-[#4F6F52] transition-colors">用户画像</a>
            <a href="#feature" className="hover:text-[#4F6F52] transition-colors">特色功能</a>
            <a href="#comp" className="hover:text-[#4F6F52] transition-colors">竞品分析</a>
            <a href="#reviews" className="hover:text-[#4F6F52] transition-colors">游客评价</a>
            <a href="#membership" className="hover:text-[#4F6F52] transition-colors">会员计划</a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={handleStart}
              className="hidden md:flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#4f6f52]/20"
              style={{ background: "linear-gradient(135deg, #4F6F52, #3A5240)" }}
            >
              立即使用 <ArrowRight className="w-4 h-4" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border border-[#E6E2D8] hover:bg-[#F5F0E8] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 left-0 right-0 bg-white border-b border-[#E6E2D8] py-6 px-8 flex flex-col gap-4 shadow-xl z-50 md:hidden"
            >
              <a href="#intro" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-[#FAF8F5] text-base font-semibold">项目简介</a>
              <a href="#persona" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-[#FAF8F5] text-base font-semibold">用户画像</a>
              <a href="#feature" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-[#FAF8F5] text-base font-semibold">特色功能</a>
              <a href="#comp" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-[#FAF8F5] text-base font-semibold">竞品分析</a>
              <a href="#reviews" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-[#FAF8F5] text-base font-semibold">游客评价</a>
              <a href="#membership" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-[#FAF8F5] text-base font-semibold">会员计划</a>
              <button
                onClick={() => { setIsMobileMenuOpen(false); handleStart(); }}
                className="w-full py-3.5 rounded-full text-center text-sm font-bold text-white mt-4"
                style={{ background: "linear-gradient(135deg, #4F6F52, #3A5240)" }}
              >
                立即使用
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-12 md:pt-20 pb-16 md:pb-20 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
        {/* Hero Character Image (/image/gw.png) - Order 1 on mobile (above title text), Order 2 on desktop */}
        <div className="order-1 lg:order-2 lg:col-span-5 flex justify-center items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...SPRING, delay: 0.1 }}
            className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[480px] md:h-[520px] max-w-full flex justify-center items-center"
          >
            {/* Soft Ambient Glow Effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#4F6F52]/20 via-[#D2A053]/20 to-transparent filter blur-3xl -z-10" />
            <img
              src="/image/gw.webp"
              alt="AI Digital Guide Character"
              className="w-full h-full object-contain filter drop-shadow-2xl transition-transform duration-500 hover:scale-105"
            />
          </motion.div>
        </div>

        {/* Main Text Content - Order 2 on mobile (underneath character image), Order 1 on desktop */}
        <div className="order-2 lg:order-1 lg:col-span-7 space-y-6 text-center lg:text-left">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-6xl font-black leading-tight text-transparent bg-clip-text"
            style={{ fontFamily: "var(--font-noto-serif)", backgroundImage: "linear-gradient(135deg, #1E2522 0%, #E11D48 50%, #D2A053 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            多模态AI数字人导游<br />
            与智慧运营系统
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.2 }}
            className="text-base md:text-lg leading-relaxed text-[#8F9F8F] max-w-2xl mx-auto lg:mx-0"
          >
            一款面向（C端游客 + B端运营）AI 数字人导游与智慧运营Agent。集成高德地图IP，满血 DeepSeek-V4-Flash，打造全国热门景点攻略、伴游FM、VR 3D识景、 RAG 景区知识检索、行程智能规划与运营服务。
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4"
          >
            <button
              onClick={handleStart}
              className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#D2A053]/30 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #D2A053, #B8843A)" }}
            >
              立即使用体验 <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="https://my.feishu.cn/wiki/HdfKwpExliHhdckDrD7cyqVtnSd?from=from_copylink"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#0D9488]/20 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #0D9488, #0EA5E9)" }}
            >
              开源文档
            </a>
          </motion.div>
        </div>
      </section>

      {/* Featured Capabilities (特色功能) - Horizontal Expandable Accordion (Hover Auto-expand & Matching Images) */}
      <section id="feature" className="py-16 md:py-24 bg-[#FAF8F5] border-y border-[#E6E2D8] relative overflow-hidden text-[#1E2522]">
        {/* Subtle ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full filter blur-[140px] pointer-events-none opacity-15"
          style={{ background: "radial-gradient(circle, #4F6F52 0%, transparent 70%)" }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Section Header */}
          <div className="text-center space-y-3 mb-10 md:mb-14">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#4F6F52]/10 border border-[#4F6F52]/20 text-[#4F6F52] text-xs font-black tracking-wider">
              <span>差异化优势</span>
            </div>
            <h3 className="text-3xl md:text-5xl font-black tracking-tight text-[#1E2522]" style={{ fontFamily: "var(--font-noto-serif)" }}>
              六大核心特色功能
            </h3>
            <p className="text-sm md:text-base text-[#8F9F8F] max-w-2xl mx-auto leading-relaxed">
              每个功能都针对旅途中的核心痛点精心设计，数字科技重塑出行体验
            </p>
          </div>

          {/* Cards Accordion Container - Reduced Height (h-[440px] to h-[540px]), Hover Auto-expand */}
          <div className="w-full flex flex-row items-center justify-center gap-2.5 sm:gap-3.5 md:gap-4 h-[440px] sm:h-[500px] md:h-[540px] overflow-x-auto md:overflow-visible pb-4 pt-2 scrollbar-none">
            {[
              {
                num: "01",
                title: "虚拟人3D拟真交互",
                shortTitle: ["虚拟", "人3D", "交互"],
                desc: "支持仕女古风、童趣卡通、现代精英数字人形象，具备自然表情流露与拟真口型算法。",
                bgImage: "https://th.bing.com/th/id/R.6d1bf349506fbd5ff4909ff64948d2d2?rik=F3pOSWN7eFHisA&riu=http%3a%2f%2fyujikeji-home.oss-cn-shenzhen.aliyuncs.com%2fimg%2fnews%2f271.png&ehk=lPND4D1JHp%2bD5fo0qH5GnttqEPnKH2husM%2byADtv8Lw%3d&risl=&pid=ImgRaw&r=0",
                widget: {
                  tag: "Virtual Guide AI",
                  text: "“欢迎来到重庆洪崖洞，我是您的专属AI数字人导游，现在为您进行景点深度讲解。”",
                  footer: "> Live2D_Avatar_Active"
                }
              },
              {
                num: "02",
                title: "全国热门景点",
                shortTitle: ["全国", "热门", "景点"],
                desc: "覆盖全国热门景区与历史文化胜地，提供高精地图标注、AI动态导览与实时客流避拥堵服务。",
                bgImage: "/image/jd.webp",
                widget: {
                  tag: "Hot Scenic Spots",
                  text: "“已为您联动全国各大热门景点知识库与全景语音档案。”",
                  footer: "> National_Scenic_Database"
                }
              },
              {
                num: "03",
                title: "自适应智能专属路径",
                shortTitle: ["智能", "专属", "路径"],
                desc: "支持输入您当前的兴趣偏好，如“历史文化优先、走平坦道”，AI自动动态避堵并规划最优旅游足迹。",
                bgImage: "/image/1.webp",
                widget: {
                  tag: "Smart Route Agent",
                  text: "已自动避开前方拥堵路段，重构最佳顺光摄影片段路径。",
                  footer: "> GPS_Avoid_Traffic"
                }
              },
              {
                num: "04",
                title: "AR/VR实景研判识别",
                shortTitle: ["实景", "研判", "识别"],
                desc: "对准展品文物拍摄即可开展多模态文物识别，提取背后的深度文化故事，变走马观花为沉浸感悟。",
                bgImage: "/image/VR.webp",
                widget: {
                  tag: "Multimodal Vision",
                  text: "已识别文物斗拱拓扑结构，调取宋代建筑规范考证。",
                  footer: "> Vision_RAG_Ready"
                }
              },
              {
                num: "05",
                title: "旅游打卡报告",
                shortTitle: ["旅游", "打卡", "报告"],
                desc: "一键自动生成高质感专属旅游打卡海报与出游报告，定格美好旅途瞬间。",
                bgImage: "/image/2.webp",
                widget: {
                  tag: "Travel Report AI",
                  text: "“AI已为您一键生成金牌打卡路线总结与专属出游分析报告。”",
                  footer: "> Poster_Generator_Ready"
                }
              },
              {
                num: "06",
                title: "景区大屏与情感雷达",
                shortTitle: ["情感", "雷达", "监测"],
                desc: "景区管理后台支持游客情感指数雷达监测、高频热搜词云实时流计算及今日客流量科学预测。",
                bgImage: "/image/3.webp",
                widget: {
                  tag: "Emotion Radar",
                  text: "游客实时情绪指数 98.4%，高频词“绝美夜景”占比第一。",
                  footer: "> BigData_Analytics"
                }
              }
            ].map((f, i) => {
              const isActive = activeFeatureIndex === i;
              return (
                <div
                  key={i}
                  onMouseEnter={() => setActiveFeatureIndex(i)}
                  onClick={() => setActiveFeatureIndex(i)}
                  className={`relative h-full rounded-[24px] sm:rounded-[32px] md:rounded-[36px] overflow-hidden cursor-pointer select-none transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex-shrink-0 ${
                    isActive
                      ? "flex-[3.5] sm:flex-[4] min-w-[270px] sm:min-w-[360px] md:min-w-[480px] shadow-2xl border border-white/40"
                      : "flex-[0.7] sm:flex-[0.8] min-w-[50px] sm:min-w-[68px] md:min-w-[84px] hover:flex-[1.1] shadow-lg border border-white/20 hover:border-white/40 opacity-95 hover:opacity-100"
                  }`}
                >
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out scale-105"
                    style={{ backgroundImage: `url(${f.bgImage})` }}
                  />

                  {/* Soft Warm Gradient Overlay */}
                  <div
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      isActive
                        ? "bg-gradient-to-t from-black/85 via-black/35 to-black/10"
                        : "bg-gradient-to-t from-black/80 via-black/40 to-black/15 hover:via-black/30"
                    }`}
                  />

                  {/* Active Card Expanded View */}
                  {isActive ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.05 }}
                      className="relative h-full p-5 sm:p-7 md:p-8 flex flex-col justify-end text-white z-10"
                    >
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        {/* Main Text Content */}
                        <div className="space-y-2 md:space-y-3 max-w-md">
                          <div className="text-4xl md:text-5xl font-black font-mono tracking-tighter text-white/90">
                            {f.num}
                          </div>
                          <h4 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                            {f.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-normal line-clamp-3 md:line-clamp-none">
                            {f.desc}
                          </p>
                          <div className="pt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStart();
                              }}
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 hover:bg-white/35 active:scale-95 backdrop-blur-md border border-white/50 text-white font-bold text-xs sm:text-sm transition-all shadow-xl"
                            >
                              <span>立即体验</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Floating Glass Widget */}
                        {f.widget && (
                          <div className="hidden sm:flex flex-col justify-between p-4 rounded-2xl bg-black/45 backdrop-blur-xl border border-white/25 w-44 md:w-56 h-36 md:h-44 shadow-2xl flex-shrink-0 self-end mb-1">
                            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="font-bold tracking-wide">{f.widget.tag}</span>
                            </div>
                            <p className="text-xs text-white/95 leading-relaxed font-medium italic my-auto">
                              {f.widget.text}
                            </p>
                            <div className="text-[10px] text-white/60 font-mono pt-1.5 border-t border-white/20 flex justify-between items-center">
                              <span>{f.widget.footer}</span>
                              <span className="text-emerald-400 font-bold">● ONLINE</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    /* Collapsed Narrow Card View */
                    <div className="relative h-full p-2 sm:p-4 flex flex-col justify-end items-center text-white z-10 pb-6 sm:pb-8">
                      <div className="flex flex-col items-center gap-3">
                        <div className="text-2xl sm:text-3xl md:text-4xl font-black font-mono text-white/90 tracking-tighter">
                          {f.num}
                        </div>
                        {/* Stacked Vertical Title */}
                        <div className="flex flex-col items-center text-xs sm:text-sm font-bold text-white/95 leading-tight space-y-0.5 tracking-wider text-center">
                          {f.shortTitle.map((charChunk, idx) => (
                            <span key={idx} className="whitespace-nowrap">
                              {charChunk}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Dots Navigation Bar */}
          <div className="flex justify-center items-center gap-2 mt-8 md:mt-10">
            {[...Array(6)].map((_, idx) => (
              <button
                key={idx}
                onMouseEnter={() => setActiveFeatureIndex(idx)}
                onClick={() => setActiveFeatureIndex(idx)}
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: activeFeatureIndex === idx ? "28px" : "8px",
                  backgroundColor: activeFeatureIndex === idx ? "#4F6F52" : "rgba(79, 111, 82, 0.25)"
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Competitive Analysis (竞品分析) */}
      <section id="comp" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-bold tracking-widest text-[#D2A053] uppercase">Competitor Analysis</span>
            <h3 className="text-3xl md:text-4xl font-black" style={{ fontFamily: "var(--font-noto-serif)" }}>核心指标大PK，AI导览完胜</h3>
            <div className="w-12 h-1 rounded bg-[#D2A053] mx-auto mt-2" />
            <p className="text-sm text-[#8F9F8F] max-w-xl mx-auto">对比传统语音指南App与昂贵的人工导游，旅行家Pro提供高性价比、全方位的完美体验。</p>
          </div>

          {/* Radar Chart & Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Radar Chart (custom SVG) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative p-6 bg-white rounded-3xl border border-[#E6E2D8] shadow-lg w-full max-w-[360px]">
                <h4 className="text-xs font-bold text-center text-[#8F9F8F] mb-4">综合能力雷达评估图</h4>
                <svg width="300" height="300" viewBox="0 0 300 300" className="mx-auto overflow-visible">
                  {/* Concentric grid rings */}
                  {RADAR_GRID_POINTS.map(({ radius, points }) => (
                    <polygon
                      key={radius}
                      points={points}
                      fill="none"
                      stroke="#E6E2D8"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Axes lines */}
                  {RADAR_AXIS_LINES.map((line) => (
                    <line key={line.name} x1="150" y1="150" x2={line.x} y2={line.y} stroke="#E6E2D8" strokeWidth="1" />
                  ))}

                  {/* Polygons */}
                  {COMP_PRODUCTS.map((prod) => (
                    <polygon
                      key={prod.name}
                      points={prod.points}
                      fill={prod.fill}
                      stroke={prod.color}
                      strokeWidth="2.5"
                    />
                  ))}

                  {/* Labels */}
                  {RADAR_METRICS.map((m) => {
                    const rad = (m.angle * Math.PI) / 180;
                    const offset = 18;
                    const x = 150 + (100 + offset) * Math.sin(rad);
                    const y = 150 - (100 + offset) * Math.cos(rad);
                    let textAnchor: "inherit" | "end" | "start" | "middle" = "middle";
                    if (m.angle > 0 && m.angle < 180) textAnchor = "start";
                    if (m.angle > 180 && m.angle < 360) textAnchor = "end";

                    return (
                      <text
                        key={m.name}
                        x={x}
                        y={y}
                        textAnchor={textAnchor}
                        className="text-[9px] font-bold fill-[#3A4D39]"
                        alignmentBaseline="middle"
                      >
                        {m.name}
                      </text>
                    );
                  })}
                </svg>

                {/* Legend */}
                <div className="flex justify-around items-center pt-5 mt-2 border-t border-[#E6E2D8]">
                  {COMP_PRODUCTS.map((p) => (
                    <div key={p.name} className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-[10px] font-medium" style={{ color: "#3A4D39" }}>{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Detailed Comparison Table */}
            <div className="lg:col-span-7 overflow-x-auto rounded-3xl border border-[#E6E2D8] bg-white shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ background: "#F5F0E8" }}>
                    <th className="px-5 py-4 text-xs font-bold text-[#8F9F8F] uppercase">评测维度</th>
                    <th className="px-5 py-4 text-xs font-bold text-[#4F6F52] uppercase">旅行家Pro</th>
                    <th className="px-5 py-4 text-xs font-bold text-[#8F9F8F] uppercase">传统导览App</th>
                    <th className="px-5 py-4 text-xs font-bold text-[#D2A053] uppercase">人工金牌导游</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E2D8] text-xs">
                  {[
                    { dim: "智能语音交互", a: "实时双向对谈，支持任意追问", b: "单向音频播放，不支持问答", c: "可人工对谈，但精力受限" },
                    { dim: "路线自适应定制", a: "支持动态避堵、人群画像偏好", b: "固定死板路线推荐", c: "按团规划，无法兼顾个人" },
                    { dim: "服务时长", a: "7×24小时全天候在线", b: "纯客户端，但偏离路线失效", c: "有限工作时间，按时收费" },
                    { dim: "起步资费", a: "基础版免费，至尊会员19元/次", b: "购买景区包 10-30元", c: "300-800元/天，且需提前预约" },
                    { dim: "适老与童趣关怀", a: "支持超大字体及童趣专属包", b: "无适老/童趣模式", c: "需看导游个人性格与经验" }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="px-5 py-3.5 font-bold text-[#1E2522]">{row.dim}</td>
                      <td className="px-5 py-3.5 font-semibold text-[#4F6F52] bg-[#4F6F52]/5">{row.a}</td>
                      <td className="px-5 py-3.5 text-[#8F9F8F]">{row.b}</td>
                      <td className="px-5 py-3.5 text-[#8F9F8F]">{row.c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* User Personas (用户画像) */}
      <section id="persona" className="py-20 bg-[#FAF8F5]/60 border-t border-[#E6E2D8] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center space-y-3 mb-14">
            <span className="text-xs font-black tracking-[0.2em] text-[#4F6F52] uppercase block">
              Profiles & Accessibility
            </span>
            <h3 className="text-3xl md:text-4xl font-black text-[#1E2522]" style={{ fontFamily: "var(--font-noto-serif)" }}>
              千人千面 · 适老化与全人群智能感知
            </h3>
            <div className="w-12 h-1 rounded-full bg-[#4F6F52] mx-auto mt-2" />
            <p className="text-sm text-[#8F9F8F] max-w-2xl mx-auto leading-relaxed">
              针对银发长者、亲子家庭、文史学者与极致打卡客群，AI 智能感知识别，自动重构语音语速、界面字号与文化解说深度。
            </p>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 items-stretch pb-4 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0">
            {PERSONAS.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`w-[82vw] sm:w-[320px] md:w-auto flex-shrink-0 md:flex-shrink snap-center p-6 rounded-3xl bg-white border ${p.borderColor} shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group`}
              >
                {/* Subtle light accent background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${p.bgGradient} opacity-60 pointer-events-none`} />

                <div className="space-y-4 relative z-10">
                  {/* Card Top Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-2 rounded-2xl bg-[#FAF8F5] border border-[#E6E2D8]/50 shadow-inner">
                      {p.icon}
                    </span>
                    <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${p.badgeBg}`}>
                      {p.role}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-[#1E2522] group-hover:text-[#4F6F52] transition-colors">
                      {p.title}
                    </h4>
                    <p className="text-xs text-[#8F9F8F] font-semibold mt-1">
                      {p.tag}
                    </p>
                  </div>

                  <p className="text-xs leading-relaxed text-[#556358] min-h-[40px]">
                    {p.desc}
                  </p>

                  {/* Bullet features */}
                  <ul className="space-y-1.5 pt-2 border-t border-[#EEF2F0]">
                    {p.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-1.5 text-[11px] text-[#374151] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.themeColor }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom preference sliders */}
                <div className="pt-4 mt-5 border-t border-[#EEF2F0] space-y-2.5 relative z-10">
                  {p.sliders.map((s, sIdx) => (
                    <div key={sIdx} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-[#4B5563]">
                        <span>{s.name}</span>
                        <span style={{ color: p.themeColor }}>{s.value}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#FAF8F5] border border-[#E6E2D8]/40 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${s.value}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.0, delay: sIdx * 0.15 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: p.themeColor }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* User Reviews (游客评价 - 轮播图) */}
      <section id="reviews" className="py-20 bg-white border-y border-[#E6E2D8] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-12 text-center space-y-3">
          <span className="text-xs font-bold tracking-widest text-[#4F6F52] uppercase">Reviews</span>
          <h3 className="text-3xl md:text-4xl font-black" style={{ fontFamily: "var(--font-noto-serif)" }}>听听他们怎么说</h3>
          <div className="w-12 h-1 rounded bg-[#4F6F52] mx-auto mt-2" />
          <p className="text-sm text-[#8F9F8F] max-w-xl mx-auto">数万名来自全国各地的游客体验了旅行家Pro的陪伴游，真实好评如潮。</p>
        </div>

        {/* Custom Keyframe Styles */}
        <style jsx global>{`
          @keyframes marquee-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes marquee-right {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .animate-marquee-left {
            animation: marquee-left 35s linear infinite;
          }
          .animate-marquee-right {
            animation: marquee-right 35s linear infinite;
          }
          .marquee-container:hover .animate-marquee-left,
          .marquee-container:hover .animate-marquee-right {
            animation-play-state: paused;
          }
        `}</style>

        <div className="marquee-container space-y-6 w-full overflow-hidden relative">
          {/* Fade edges overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          {/* Row 1: Leftward Marquee */}
          <div className="flex w-[200%] md:w-max gap-6 animate-marquee-left">
            {[...ROW1_REVIEWS, ...ROW1_REVIEWS].map((rev, idx) => (
              <div
                key={idx}
                className="w-[310px] md:w-[350px] flex-shrink-0 bg-[#FAF8F5] border border-[#E6E2D8] rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 relative group"
              >
                <span className="absolute top-4 right-6 text-5xl text-[#4F6F52]/10 font-serif pointer-events-none select-none">“</span>

                <div className="space-y-4">
                  <div className="flex gap-0.5">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-yellow-500 stroke-yellow-500" />
                    ))}
                  </div>
                  <p className="text-[13px] leading-relaxed text-[#3A4D39] font-medium min-h-[72px] text-left">
                    {rev.comment}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#E6E2D8]/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{rev.avatar}</span>
                    <div className="text-left">
                      <h4 className="font-bold text-xs text-[#1E2522]">{rev.name}</h4>
                      <p className="text-[10px] text-[#8F9F8F]">{rev.role}</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-[#4F6F52]/10 text-[#4F6F52] font-extrabold flex-shrink-0">
                    {rev.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Row 2: Rightward Marquee */}
          <div className="flex w-[200%] md:w-max gap-6 animate-marquee-right">
            {[...ROW2_REVIEWS, ...ROW2_REVIEWS].map((rev, idx) => (
              <div
                key={idx}
                className="w-[310px] md:w-[350px] flex-shrink-0 bg-[#FAF8F5] border border-[#E6E2D8] rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 relative group"
              >
                <span className="absolute top-4 right-6 text-5xl text-[#4F6F52]/10 font-serif pointer-events-none select-none">“</span>

                <div className="space-y-4">
                  <div className="flex gap-0.5">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-yellow-500 stroke-yellow-500" />
                    ))}
                  </div>
                  <p className="text-[13px] leading-relaxed text-[#3A4D39] font-medium min-h-[72px] text-left">
                    {rev.comment}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#E6E2D8]/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{rev.avatar}</span>
                    <div className="text-left">
                      <h4 className="font-bold text-xs text-[#1E2522]">{rev.name}</h4>
                      <p className="text-[10px] text-[#8F9F8F]">{rev.role}</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-[#D2A053]/15 text-[#D2A053] font-extrabold flex-shrink-0">
                    {rev.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Plan (会员计划) */}
      <section id="membership" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-bold tracking-widest text-[#D2A053] uppercase">Pricing Plans</span>
            <h3 className="text-3xl md:text-4xl font-black" style={{ fontFamily: "var(--font-noto-serif)" }}>加入会员，尊享高定伴游</h3>
            <div className="w-12 h-1 rounded bg-[#D2A053] mx-auto mt-2" />
            <p className="text-sm text-[#8F9F8F] max-w-xl mx-auto">价格透明划算，自由定制出行偏好，解锁更深度的景区历史古迹游览特权。</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 items-stretch max-w-6xl mx-auto">
            {PLANS.map((plan) => (
              <motion.div
                key={plan.name}
                whileHover={{ y: -8 }}
                className={`rounded-xl md:rounded-3xl p-4 md:p-8 border flex flex-col justify-start relative overflow-hidden shadow-md ${plan.border}`}
                style={{ background: plan.gradient }}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-[#D2A053] text-white text-[6px] md:text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 md:px-4 md:py-1.5 rounded-bl-lg">
                    POPULAR
                  </div>
                )}

                <div className="space-y-3 md:space-y-6">
                  <div className="space-y-1">
                    <h4 className={`text-xs md:text-lg font-bold leading-tight ${plan.popular ? "text-[#D2A053]" : "text-[#1E2522]"}`} style={{ fontFamily: "var(--font-noto-serif)" }}>
                      {plan.name}
                    </h4>
                    <p className={`text-[9px] leading-tight md:text-xs ${plan.popular ? "text-white/60" : "text-[#8F9F8F]"}`}>{plan.desc}</p>
                  </div>

                  <div className="flex items-baseline flex-wrap md:flex-nowrap">
                    <span className={`text-sm md:text-5xl font-black ${plan.popular ? "text-white" : "text-[#1E2522]"}`}>
                      ￥{plan.price}
                    </span>
                    <span className={`text-[8px] ml-0.5 md:ml-1 ${plan.popular ? "text-white/50" : "text-[#8F9F8F]"}`}>/{plan.period}</span>
                  </div>

                  {/* Divider */}
                  <div className={`h-px w-full my-1 md:my-3 ${plan.popular ? "bg-white/10" : "bg-[#E6E2D8]"}`} />

                  {/* Feature list */}
                  <ul className="space-y-1.5 md:space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 md:gap-2.5 text-[9px] md:text-xs leading-relaxed">
                        <Check className="w-3 h-3 md:w-4 md:h-4 mt-0.5 flex-shrink-0" style={{ color: plan.popular ? "#D2A053" : "#4F6F52" }} />
                        <span className={plan.popular ? "text-white/80" : "text-[#3A4D39]"}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#121815] text-[#8F9F8F] border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-5 max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white"
                style={{ background: "linear-gradient(135deg,#D2A053,#B8843A)" }}>
                旅
              </div>
              <span className="text-white font-bold text-base" style={{ fontFamily: "var(--font-noto-serif)" }}>旅行家Pro</span>
            </div>
            <p className="text-xs leading-relaxed max-w-xl">
              智能AI数字导览系统。将现代AI数字人对谈与景点人文底蕴完美结合，开启沉浸导览新纪元。
            </p>

            {/* Footer Links in a single row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs border-t border-white/5 pt-4 text-[#8F9F8F]">
              <span className="text-white font-bold">产品路线：</span>
              <a href="#intro" className="hover:text-white transition-colors">项目简介</a>
              <span className="text-white/10">•</span>
              <a href="#feature" className="hover:text-white transition-colors">特色功能</a>
              <span className="text-white/10">•</span>
              <a href="#membership" className="hover:text-white transition-colors">尊享会员计划</a>

              <span className="text-white/20 mx-2 hidden lg:inline">|</span>

              <span className="text-white font-bold">关于我们：</span>
              <span>智慧文旅开发组</span>
              <span className="text-white/10">•</span>
              <span></span>
              <span className="text-white/10">•</span>
              <span>联系邮箱：wyxcode@qq.com</span>
            </div>
          </div>

          <div className="w-full md:w-64 space-y-3 bg-white/5 p-5 rounded-2xl border border-white/5 flex-shrink-0">
            <h4 className="text-white text-xs font-bold tracking-widest uppercase">立即体验</h4>
            <p className="text-[11px] leading-relaxed text-[#8F9F8F]">
              点击下方按钮即可一键登录/注册，立即解锁多模态虚拟人数字伴游。
            </p>
            <button
              onClick={handleStart}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white text-center hover:opacity-90 active:scale-95 transition-all shadow-md"
              style={{ background: "linear-gradient(135deg,#D2A053,#B8843A)" }}
            >
              一键立即使用
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-white/5 text-center text-[10px]">
          <p>© {new Date().getFullYear()} 旅行家Pro 保留所有权利。由阿里云 强力驱动。</p>
        </div>
      </footer>
    </div>
  );
}
