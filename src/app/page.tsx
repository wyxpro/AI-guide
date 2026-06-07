"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Check, ChevronRight, ChevronLeft, Star, ArrowRight,
  Users, Bot, MessageCircle, MapPin, Navigation, TrendingUp
} from "lucide-react";
import { auth } from "@eazo/sdk";

// Animation Spring Config
const SPRING = { type: "spring" as const, stiffness: 100, damping: 20 };

// 1. User Personas Data
const PERSONAS = [
  {
    title: "银发暖心旅伴",
    role: "中老年游客 (60岁+)",
    icon: "🌸",
    desc: "注重适老化无障碍设计。支持超大字体显示、舒缓的语音语速以及无陡坡、有座椅的舒适路线推荐。",
    sliders: [
      { name: "字体大小偏好", value: 95 },
      { name: "语音缓和度", value: 90 },
      { name: "舒适度优先", value: 85 },
      { name: "探险刺激度", value: 15 },
    ],
    bg: "rgba(255, 240, 245, 0.95)",
    border: "border-pink-200",
    themeColor: "#EC4899",
  },
  {
    title: "童趣家庭包",
    role: "亲子家庭与儿童",
    icon: "🍬",
    desc: "趣味化语音讲解，卡通数字人伴游。自动串联洗手间、餐饮及儿童游乐场所，边游览边做科普趣味问答。",
    sliders: [
      { name: "趣味故事化", value: 90 },
      { name: "服务点密集度", value: 95 },
      { name: "科普启发性", value: 85 },
      { name: "纯学术研究", value: 10 },
    ],
    bg: "rgba(254, 249, 195, 0.95)",
    border: "border-yellow-200",
    themeColor: "#EAB308",
  },
  {
    title: "深度文史行者",
    role: "文史爱好者",
    icon: "📜",
    desc: "深度挖掘景区历史古迹的前世今生。提供学术级考证、历代文献引用、深度建筑艺术美学剖析与考证路线。",
    sliders: [
      { name: "历史考证深度", value: 95 },
      { name: "路线学术性", value: 90 },
      { name: "多媒体趣味", value: 30 },
      { name: "观光打卡度", value: 20 },
    ],
    bg: "rgba(240, 253, 244, 0.95)",
    border: "border-green-200",
    themeColor: "#22C55E",
  },
  {
    title: "特种兵极致打卡",
    role: "独立青年探索者",
    icon: "⚡",
    desc: "高效出片首选。算法定制“用时最少、打卡点最全、拍照光线最佳”的极致路线，实时应对拥堵动态规划。",
    sliders: [
      { name: "时间紧凑度", value: 98 },
      { name: "出片出圈率", value: 90 },
      { name: "线路自主性", value: 85 },
      { name: "缓步休憩度", value: 10 },
    ],
    bg: "rgba(240, 249, 255, 0.95)",
    border: "border-blue-200",
    themeColor: "#3B82F6",
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

const COMP_PRODUCTS = [
  {
    name: "旅行吧",
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

// 3. User Reviews Data
const REVIEWS = [
  {
    id: 1,
    name: "王建国 (67岁)",
    role: "退休教师 / 银发旅客",
    avatar: "👴",
    rating: 5,
    tag: "适老模式",
    comment: "大字模式和慢速声音真的太贴心了！以前跟不上导游的脚步，用这个AI导览，自己能看着大字，听着慢慢悠悠的讲解，走到哪讲到哪，极其舒服！",
  },
  {
    id: 2,
    name: "林小萌与妈妈",
    role: "亲子家庭",
    avatar: "👩‍👦",
    rating: 5,
    tag: "童趣体验",
    comment: "小糖果数字人说话萌萌的，孩子一路上跟着听知识问答，平时很调皮这回倒非常专注。路线还很细心地规划了无障碍和厕所，省了我们不少力气。",
  },
  {
    id: 3,
    name: "Alex",
    role: "户外旅行博主",
    avatar: "🧑‍💻",
    rating: 5,
    tag: "高效打卡",
    comment: "特种兵路线吹爆！半天时间把整个翠玉湖和揽月亭最火的机位全走了一遍，AI还能根据前方的实时拥堵避开人群，顺光拍出的大片直接出圈！",
  },
  {
    id: 4,
    name: "陈华教授",
    role: "大学历史系教师",
    avatar: "🧔",
    rating: 5,
    tag: "深度考证",
    comment: "本以为景区的AI只是应付了事，没想到对揽月亭的牌匾典故、宋代古窑的微量元素演变讲解得十分详备扎实，甚至给出了古籍出处，专业度惊人。",
  },
];

// 4. Membership Plans
const PLANS = [
  {
    name: "绿野体验版",
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
    name: "黄金畅游卡",
    price: "19",
    period: "次/24小时",
    desc: "最受游客欢迎的深度畅玩计划",
    features: [
      "专属虚拟人 (古典/宋代/童趣) 形象任选",
      "7×24小时无限次流畅语音对谈",
      "AI独家定制黄金游览路线（防拥堵）",
      "学术级古迹讲解与历史考证档案",
      "离线音频与地图包下载",
      "赠送景区精美电子明信片",
    ],
    cta: "畅享尊贵体验",
    popular: true,
    gradient: "linear-gradient(135deg, #1A2520, #121815)",
    border: "border-[#D2A053]",
    buttonStyle: { background: "linear-gradient(135deg,#D2A053,#B8843A)", color: "#ffffff" },
  },
  {
    name: "翡翠家庭年卡",
    price: "199",
    period: "年",
    desc: "适合家庭出游 and 深度常客",
    features: [
      "支持绑定3个家庭成员账号",
      "全年无限制使用所有数字人形象",
      "儿童科普小助手专享特权",
      "特聘历史学者级语音档案更新",
      "景区线下文创店及特色餐饮85折优惠",
      "专属客服1对1协助",
    ],
    cta: "解锁家庭特权",
    popular: false,
    gradient: "linear-gradient(135deg, #FAF8F5, #F0EDE5)",
    border: "border-[#E6E2D8]",
    buttonStyle: { background: "linear-gradient(135deg,#4F6F52,#3A5240)", color: "#ffffff" },
  },
];

export default function WelcomePage() {
  const [activePersona, setActivePersona] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const stopAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayRef.current = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % REVIEWS.length);
    }, 5000);
  };

  // Auto transition user reviews
  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black text-white"
              style={{ background: "linear-gradient(135deg,#4F6F52,#3A5240)", boxShadow: "0 4px 12px rgba(79,111,82,0.3)" }}>
              旅
            </div>
            <div>
              <h1 className="text-[17px] font-black tracking-wide" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
                旅行吧
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
      <section className="relative pt-12 md:pt-24 pb-20 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={SPRING}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: "rgba(210,160,83,0.12)", color: "#D2A053", border: "1px solid rgba(210,160,83,0.25)" }}
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> 旅行吧·AI智能交互导览系统
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black leading-tight"
            style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}
          >
            让每一块玉石，<br />
            都为你<span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg,#4F6F52,#D2A053)" }}>娓娓道来</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.2 }}
            className="text-base md:text-lg leading-relaxed text-[#8F9F8F] max-w-2xl mx-auto lg:mx-0"
          >
            融汇领先大语言模型与多模态AI技术，推出集「24小时多模态数字人对谈」、「多重无障碍画像关怀」及「即时路线动态规划」于一身的革命性智慧导游平台。
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4"
          >
            <button
              onClick={handleStart}
              className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#4f6f52]/30 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #4F6F52, #3A5240)" }}
            >
              立即使用体验 <ArrowRight className="w-5 h-5" />
            </button>
            <a 
              href="#feature"
              className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-bold transition-all hover:bg-[#F5F0E8] active:scale-95 border border-[#E6E2D8] flex items-center justify-center gap-2"
              style={{ color: "#3A4D39", background: "white" }}
            >
              了解功能特色
            </a>
          </motion.div>
        </div>

        {/* 3D Simulation Virtual Human Block */}
        <div className="lg:col-span-5 flex justify-center">
          <motion.div 
            initial={{ opacity: 0, rotateY: 20 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ ...SPRING, delay: 0.2 }}
            className="relative w-80 h-96 md:w-96 md:h-[450px] rounded-[48px] p-6 shadow-2xl flex flex-col justify-between overflow-hidden group"
            style={{ 
              background: "linear-gradient(180deg, #1C2420 0%, #121815 100%)",
              border: "4px solid #D2A053",
              transformStyle: "preserve-3d",
              perspective: 1000
            }}
          >
            {/* Interactive Hologram Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(79,111,82,0.1)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-40" />
            <div className="absolute top-12 left-12 w-48 h-48 rounded-full bg-[#D2A053]/10 filter blur-[40px] pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
            
            {/* Top Indicator */}
            <div className="flex justify-between items-center relative z-10">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full text-white bg-[#4F6F52] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" /> AI.ACTIVE
              </span>
              <span className="text-white/40 text-[10px] tracking-widest font-mono">SYS-v3.2</span>
            </div>

            {/* Simulated Digital Human (3D SVG Layered Structure) */}
            <div className="my-auto flex flex-col items-center relative z-10 translate-z-10 group-hover:translate-z-20 transition-transform duration-500">
              <div className="relative w-36 h-36 rounded-full flex items-center justify-center mb-6"
                style={{ background: "radial-gradient(circle, rgba(210,160,83,0.18) 0%, transparent 70%)", border: "2px dashed rgba(210,160,83,0.4)" }}>
                
                {/* Rotating ring */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-t border-b border-[#D2A053]/40" 
                />

                <svg width="100" height="110" viewBox="0 0 100 120" className="drop-shadow-[0_8px_16px_rgba(210,160,83,0.3)]">
                  <circle cx="50" cy="15" r="5" fill="#D2A053" />
                  {/* Hair */}
                  <path d="M50,18C38,18 32,28 32,41C32,48 36,55 40,58L42,53C38,43 44,31 50,31C56,31 62,43 58,53L60,58C64,55 68,48 68,41C68,28 62,18 50,18Z" fill="#243029" />
                  {/* Face */}
                  <path d="M40,55C40,55 46,68 50,68C54,68 60,55 60,55C60,55 61,61 50,65C39,61 40,55 40,55Z" fill="#FCE7D6" />
                  {/* Robe */}
                  <path d="M26,120L74,120C74,120 74,78 58,73L50,85L42,73C26,78 26,120 26,120Z" fill="#4F6F52" />
                  {/* Robe Collar */}
                  <path d="M42,73L50,85L58,73" stroke="#D2A053" strokeWidth="2.5" />
                </svg>
              </div>

              {/* Digital Human Name & Speech Bubble */}
              <div className="text-center space-y-1.5">
                <h4 className="text-[#FAF8F5] text-sm font-bold tracking-wider" style={{ fontFamily: "var(--font-noto-serif)" }}>旅行吧AI向导「小旅」</h4>
                <p className="text-[11px] text-[#8F9F8F] px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 italic">
                  &ldquo;您好，我是您的AI导游，今天想去揽月亭还是翠玉湖呢？&rdquo;
                </p>
              </div>
            </div>
 
            {/* Voice Audio Wave */}
            <div className="flex justify-center items-end gap-1.5 h-8 relative z-10">
              {[3, 6, 8, 4, 9, 6, 8, 3, 5, 7, 4].map((h, i) => (
                <motion.div 
                  key={i} 
                  animate={{ height: [h * 2, h * 3.5, h * 2] }}
                  transition={{ duration: 0.8, delay: i * 0.08, repeat: Infinity }}
                  className="w-1.5 rounded-full" 
                  style={{ background: i % 2 === 0 ? "#D2A053" : "#4F6F52" }} 
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>
 
      {/* Project Introduction (项目简介) */}
      <section id="intro" className="py-20 bg-white border-y border-[#E6E2D8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-bold tracking-widest text-[#4F6F52] uppercase">Introduction</span>
            <h3 className="text-3xl md:text-4xl font-black" style={{ fontFamily: "var(--font-noto-serif)" }}>旅行吧智慧，服务每一个瞬间</h3>
            <div className="w-12 h-1 rounded bg-[#4F6F52] mx-auto mt-2" />
            <p className="text-sm text-[#8F9F8F] max-w-xl mx-auto">以技术之美重新诠释景区导游，为每位游客提供专属的管家式贴身服务。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl border border-[#E6E2D8] hover:shadow-xl transition-all duration-300 space-y-4" style={{ background: "#FAF8F5" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(79,111,82,0.1)", color: "#4F6F52" }}>
                <Bot className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold" style={{ fontFamily: "var(--font-noto-serif)" }}>24H多模态数字人伴游</h4>
              <p className="text-sm leading-relaxed text-[#8F9F8F]">
                高度还原东方神韵的AI数字人讲解员，支持无延迟语音交互，表情动作与故事节奏完美契合，让历史传说不再是枯燥的文字。
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-[#E6E2D8] hover:shadow-xl transition-all duration-300 space-y-4" style={{ background: "#FAF8F5" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(210,160,83,0.1)", color: "#D2A053" }}>
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold" style={{ fontFamily: "var(--font-noto-serif)" }}>无障碍多画像适配</h4>
              <p className="text-sm leading-relaxed text-[#8F9F8F]">
                全行业首创的多重体验预设。可智能切换“适老陪伴”、“童趣探秘”、“文史考证”或“特种兵极致游”等专属展示 and 解说引擎。
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-[#E6E2D8] hover:shadow-xl transition-all duration-300 space-y-4" style={{ background: "#FAF8F5" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(79,111,82,0.1)", color: "#4F6F52" }}>
                <Navigation className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold" style={{ fontFamily: "var(--font-noto-serif)" }}>动态避堵算法路线</h4>
              <p className="text-sm leading-relaxed text-[#8F9F8F]">
                不再依赖死板的游览推荐。AI根据景区人流、天气变化、实时营业时间以及您的行进速度，动态重新寻找最佳游行轨迹。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* User Personas (用户画像) */}
      <section id="persona" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-bold tracking-widest text-[#D2A053] uppercase">Target Personas</span>
            <h3 className="text-3xl md:text-4xl font-black" style={{ fontFamily: "var(--font-noto-serif)" }}>定制化解说，听你想听的声音</h3>
            <div className="w-12 h-1 rounded bg-[#D2A053] mx-auto mt-2" />
            <p className="text-sm text-[#8F9F8F] max-w-xl mx-auto">大字、童趣、学术、极速——点击切换，抢先预览不同人群画像的参数定制。</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left selector */}
            <div className="lg:col-span-5 space-y-3">
              {PERSONAS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setActivePersona(i)}
                  className={`w-full p-5 rounded-2xl text-left border transition-all flex items-center gap-4 ${
                    activePersona === i
                      ? "border-l-4 bg-white shadow-md"
                      : "border-[#E6E2D8] bg-[#FAF8F5] opacity-75 hover:opacity-100"
                  }`}
                  style={{ borderLeftColor: activePersona === i ? p.themeColor : undefined }}
                >
                  <span className="text-3xl">{p.icon}</span>
                  <div>
                    <h4 className="font-bold text-sm text-[#1E2522]">{p.title}</h4>
                    <p className="text-xs text-[#8F9F8F] mt-0.5">{p.role}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                </button>
              ))}
            </div>

            {/* Right details */}
            <div className="lg:col-span-7 flex">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePersona}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={SPRING}
                  className={`w-full p-8 rounded-3xl border flex flex-col justify-between ${PERSONAS[activePersona].border}`}
                  style={{ background: PERSONAS[activePersona].bg }}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold" style={{ color: PERSONAS[activePersona].themeColor }}>
                        {PERSONAS[activePersona].title}
                      </span>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white border border-[#E6E2D8]" style={{ color: "#3A4D39" }}>
                        {PERSONAS[activePersona].role}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-[#1E2522]">
                      {PERSONAS[activePersona].desc}
                    </p>
                  </div>

                  {/* Preference sliders */}
                  <div className="space-y-4 pt-6 border-t border-[#E6E2D8]/50">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#8F9F8F]">AI系统适配参数</p>
                    {PERSONAS[activePersona].sliders.map((s, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium">
                          <span>{s.name}</span>
                          <span style={{ color: PERSONAS[activePersona].themeColor }}>{s.value}%</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-[#FAF8F5] border border-[#E6E2D8]/30 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${s.value}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: PERSONAS[activePersona].themeColor }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Capabilities (特色功能) */}
      <section id="feature" className="py-20 bg-white border-y border-[#E6E2D8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-bold tracking-widest text-[#4F6F52] uppercase">Features</span>
            <h3 className="text-3xl md:text-4xl font-black" style={{ fontFamily: "var(--font-noto-serif)" }}>沉浸式交互，数字科技重塑旅途</h3>
            <div className="w-12 h-1 rounded bg-[#4F6F52] mx-auto mt-2" />
            <p className="text-sm text-[#8F9F8F] max-w-xl mx-auto">集顶尖算法于一身，让AI成为最懂您的全能私人出行向导。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Bot,
                title: "虚拟人3D形象",
                desc: "多样化的汉服仕女、童趣卡通、现代精英形象，具备自然表情流露与拟真口型算法。",
                color: "#4F6F52"
              },
              {
                icon: MessageCircle,
                title: "全天候语音对谈",
                desc: "极速的语音语义流式处理，打破呆板的按键指引，就像与一位温婉知性的文史专家面对面交谈。",
                color: "#D2A053"
              },
              {
                icon: MapPin,
                title: "自适应兴趣探路",
                desc: "支持输入您当前的兴趣偏好，如“历史文化优先、走林荫道”，AI自动寻找并规划出最优的旅游足迹。",
                color: "#4F6F52"
              },
              {
                icon: TrendingUp,
                title: "景区分析大屏",
                desc: "景区管理后台支持游客情感指数雷达监测、高频热搜词云实时流计算及今日客流量科学预测。",
                color: "#D2A053"
              }
            ].map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8 }}
                className="p-6 rounded-3xl border border-[#E6E2D8] bg-[#FAF8F5] transition-all hover:shadow-xl space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "white", border: "1px solid #E6E2D8" }}>
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h4 className="text-base font-bold text-[#1E2522]">{f.title}</h4>
                <p className="text-xs leading-relaxed text-[#8F9F8F]">{f.desc}</p>
              </motion.div>
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
            <p className="text-sm text-[#8F9F8F] max-w-xl mx-auto">对比传统语音指南App与昂贵的人工导游，旅行吧提供高性价比、全方位的完美体验。</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Radar Chart (custom SVG) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative p-6 bg-white rounded-3xl border border-[#E6E2D8] shadow-lg w-full max-w-[360px]">
                <h4 className="text-xs font-bold text-center text-[#8F9F8F] mb-4">综合能力雷达评估图</h4>
                <svg width="300" height="300" viewBox="0 0 300 300" className="mx-auto overflow-visible">
                  {/* Concentric grid rings */}
                  {[20, 40, 60, 80, 100].map((r) => (
                    <polygon
                      key={r}
                      points={RADAR_METRICS.map((m) => {
                        const rad = (m.angle * Math.PI) / 180;
                        const x = 150 + r * Math.sin(rad);
                        const y = 150 - r * Math.cos(rad);
                        return `${x},${y}`;
                      }).join(" ")}
                      fill="none"
                      stroke="#E6E2D8"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Axes lines */}
                  {RADAR_METRICS.map((m) => {
                    const rad = (m.angle * Math.PI) / 180;
                    const x = 150 + 100 * Math.sin(rad);
                    const y = 150 - 100 * Math.cos(rad);
                    return <line key={m.name} x1="150" y1="150" x2={x} y2={y} stroke="#E6E2D8" strokeWidth="1" />;
                  })}

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
                    <th className="px-5 py-4 text-xs font-bold text-[#4F6F52] uppercase">旅行吧</th>
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

      {/* User Reviews (游客评价 - 轮播图) */}
      <section id="reviews" className="py-20 bg-white border-y border-[#E6E2D8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-bold tracking-widest text-[#4F6F52] uppercase">Reviews</span>
            <h3 className="text-3xl md:text-4xl font-black" style={{ fontFamily: "var(--font-noto-serif)" }}>看看他们怎么说</h3>
            <div className="w-12 h-1 rounded bg-[#4F6F52] mx-auto mt-2" />
            <p className="text-sm text-[#8F9F8F] max-w-xl mx-auto">数万名来自全国各地的游客体验了旅行吧的陪伴游，真实好评如潮。</p>
          </div>

          {/* Testimonial Carousel */}
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden p-6 md:p-10 rounded-3xl border border-[#E6E2D8] bg-[#FAF8F5] shadow-lg min-h-[220px] flex flex-col justify-between"
                 onMouseEnter={stopAutoPlay}
                 onMouseLeave={startAutoPlay}>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={carouselIndex}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{REVIEWS[carouselIndex].avatar}</span>
                      <div>
                        <h4 className="font-bold text-[#1E2522]">{REVIEWS[carouselIndex].name}</h4>
                        <p className="text-xs text-[#8F9F8F]">{REVIEWS[carouselIndex].role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#4F6F52]/10 text-[#4F6F52] font-semibold">{REVIEWS[carouselIndex].tag}</span>
                      <div className="flex gap-0.5">
                        {[...Array(REVIEWS[carouselIndex].rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 stroke-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm md:text-base leading-relaxed text-[#3A4D39] italic pt-2">
                    &ldquo;{REVIEWS[carouselIndex].comment}&rdquo;
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Indicator dots & pagination */}
              <div className="flex justify-between items-center pt-8 border-t border-[#E6E2D8]/50 mt-6">
                <div className="flex gap-1.5">
                  {REVIEWS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCarouselIndex(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        carouselIndex === i ? "w-6 bg-[#4F6F52]" : "bg-[#8F9F8F]/40"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCarouselIndex((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length)}
                    className="p-1.5 rounded-lg border border-[#E6E2D8] hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCarouselIndex((prev) => (prev + 1) % REVIEWS.length)}
                    className="p-1.5 rounded-lg border border-[#E6E2D8] hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {PLANS.map((plan) => (
              <motion.div
                key={plan.name}
                whileHover={{ y: -8 }}
                className={`rounded-3xl p-8 border flex flex-col justify-between relative overflow-hidden shadow-md ${plan.border}`}
                style={{ background: plan.gradient }}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-[#D2A053] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl">
                    POPULAR
                  </div>
                )}

                <div className="space-y-6">
                  <div className="space-y-1">
                    <h4 className={`text-lg font-bold ${plan.popular ? "text-[#D2A053]" : "text-[#1E2522]"}`} style={{ fontFamily: "var(--font-noto-serif)" }}>
                      {plan.name}
                    </h4>
                    <p className={`text-xs ${plan.popular ? "text-white/60" : "text-[#8F9F8F]"}`}>{plan.desc}</p>
                  </div>

                  <div className="flex items-baseline">
                    <span className={`text-4xl md:text-5xl font-black ${plan.popular ? "text-white" : "text-[#1E2522]"}`}>
                      ￥{plan.price}
                    </span>
                    <span className={`text-xs ml-1 ${plan.popular ? "text-white/50" : "text-[#8F9F8F]"}`}>/{plan.period}</span>
                  </div>

                  {/* Divider */}
                  <div className={`h-px w-full ${plan.popular ? "bg-white/10" : "bg-[#E6E2D8]"}`} />

                  {/* Feature list */}
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs leading-relaxed">
                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: plan.popular ? "#D2A053" : "#4F6F52" }} />
                        <span className={plan.popular ? "text-white/80" : "text-[#3A4D39]"}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStart}
                    className="w-full py-3.5 rounded-xl text-xs font-bold transition-all active:scale-98 shadow-sm flex items-center justify-center gap-2"
                    style={plan.buttonStyle}
                  >
                    {plan.cta} <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#121815] text-[#8F9F8F] border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white"
                style={{ background: "linear-gradient(135deg,#D2A053,#B8843A)" }}>
                旅
              </div>
              <span className="text-white font-bold text-base" style={{ fontFamily: "var(--font-noto-serif)" }}>旅行吧</span>
            </div>
            <p className="text-xs leading-relaxed">
              智能AI数字导览系统。将现代AI数字人对谈与景点人文底蕴完美结合，开启沉浸导览新纪元。
            </p>
          </div>

          <div>
            <h4 className="text-white text-xs font-bold tracking-widest uppercase mb-4">产品路线</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#intro" className="hover:text-white transition-colors">项目简介</a></li>
              <li><a href="#feature" className="hover:text-white transition-colors">特色功能</a></li>
              <li><a href="#membership" className="hover:text-white transition-colors">尊享会员计划</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-bold tracking-widest uppercase mb-4">关于我们</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white transition-colors">智慧文旅开发组</span></li>
              <li><span className="hover:text-white transition-colors">Eazo 平台官方应用支撑</span></li>
              <li><span className="hover:text-white transition-colors">联系邮箱: support@eazo.ai</span></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-white text-xs font-bold tracking-widest uppercase">立即体验</h4>
            <p className="text-xs">
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
          <p>© {new Date().getFullYear()} 旅行吧 Inc. 保留所有权利。由 Eazo Platform 强力驱动。</p>
        </div>
      </footer>
    </div>
  );
}
