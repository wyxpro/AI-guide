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

const SIM_QA_DATA = {
  history: [
    {
      label: "🤔 询问飞来石景点的传说与科学历史",
      q: "这里为什么叫“飞来石”？听说它有什么神奇的传说？",
      a: "这块飞来石相传是当年八仙之首铁拐李云游至此，见此地群山环抱、钟灵毓秀，特随手抛下一块灵石镇守此山。其实在科学上，它是一块典型的第四纪冰川冰川漂砾，经过数百万年的风化侵蚀，巧妙地立于石台上。"
    },
    {
      label: "⛩️ 了解景区的文化底蕴及寺庙历史",
      q: "这个古寺始建于哪一年？里面有什么珍贵的文物？",
      a: "您眼前的这座古刹始建于唐代贞观三年（公元629年），距今已有近1400年的历史了。寺内保存最完好的，是主殿大雄宝殿内的金铜药师佛像，属于国家一级保护文物，其背光上的浮雕花纹展示了盛唐时期极高超的铸造工艺。"
    }
  ],
  route: [
    {
      label: "🚦 避堵避拥的智能分流线路规划",
      q: "现在主景区人好像非常多，能帮我推荐一条人少的观光路线吗？",
      a: "好的，帮您调用了B端客流热力图。当前迎客松主干道客流拥挤指数已达92%。建议您选择我们推荐的“清凉避暑秘境线”：从西海瑶台出发，穿过松鼠步道至排云亭。这条路线目前人流非常少，且绿荫覆盖率高达88%！"
    },
    {
      label: "⏱️ 3小时时限内的核心地标游览方案",
      q: "我想在3小时内看完最核心的3个景点，应该怎么走最合理？",
      a: "为您量身定制3小时极速路线：西大门入园 ➡️ 乘坐云谷索道（10分钟） ➡️ 游览始信峰（40分） ➡️ 徒步至光明顶看全景（50分） ➡️ 从白鹅岭索道下山。这样不仅时间刚刚好，而且省时省力，能最大化游览核心地标。"
    }
  ],
  accessibility: [
    {
      label: "♿ 适合推婴儿车的全无障碍路线推荐",
      q: "我推着婴儿车，有没有完全没有台阶、都是坡道的游览道路？",
      a: "没问题！小旅已自动帮您开启【爱心无障碍模式】。已为您重新规划了一条专门规避台阶的坡道路线。我们将从东侧的无障碍通道进，沿木栈道行进至天海景区。沿途所有洗手间均配备了无障碍设施，您可以放心前行。"
    },
    {
      label: "🗣️ 大字大音量长辈伴读播报模式",
      q: "字太小了看不清，能不能大声给我读一下这个景点的背景？",
      a: "没问题！小旅已将系统界面切换为【大字护眼版】，并调大了音量。下面我为您大声播报：“黄山迎客松，立于玉屏楼左侧，破石而生，高10米，树龄已有千年，是中华民族热情好客的象征…”"
    }
  ]
};

export default function WelcomePage() {
  const [activePersona, setActivePersona] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(2); // Center initial card
  const [windowWidth, setWindowWidth] = useState(1200);

  // Simulator State
  const [simTab, setSimTab] = useState<"history" | "route" | "accessibility">("history");
  const [simUsers, setSimUsers] = useState(3492);
  const [simRoutes, setSimRoutes] = useState(142);
  const [simInput, setSimInput] = useState("");
  const [simMessages, setSimMessages] = useState<Array<{ sender: "user" | "system"; text: string }>>([
    {
      sender: "system",
      text: "您好！我是您的AI伴游小旅。今天想去探索人文历史路线，还是轻松的避堵亲子路线呢？可以点击左边的提问场景测试我哦！"
    }
  ]);
  const [isSimTyping, setIsSimTyping] = useState(false);
  const [simToast, setSimToast] = useState("");
  const [showSimToast, setShowSimToast] = useState(false);
  const simChatRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerToast = (msg: string) => {
    setSimToast(msg);
    setShowSimToast(true);
    setTimeout(() => {
      setShowSimToast(false);
    }, 2500);
  };

  const triggerDialogue = (question: string, answer: string) => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
    }
    setIsSimTyping(true);
    setSimInput(question);
    
    // Add user question and empty system placeholder
    setSimMessages(prev => [
      ...prev,
      { sender: "user" as const, text: question },
      { sender: "system" as const, text: "小旅思考中..." }
    ]);

    // B-end statistics update
    const rand = Math.floor(Math.random() * 5) + 1;
    setSimUsers(prev => prev + rand);

    if (question.includes("路") || question.includes("走") || question.includes("堵")) {
      setSimRoutes(prev => prev + 1);
    }

    let charIndex = 0;
    typingTimerRef.current = setInterval(() => {
      if (charIndex <= answer.length) {
        const textTyped = answer.substring(0, charIndex);
        setSimMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { sender: "system" as const, text: textTyped || "..." };
          return updated;
        });
        charIndex++;
        if (simChatRef.current) {
          simChatRef.current.scrollTop = simChatRef.current.scrollHeight;
        }
      } else {
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
        setIsSimTyping(false);
        triggerToast("导览官小旅语音播报完毕");
      }
    }, 35);
  };

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, []);

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
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black text-white"
              style={{ background: "linear-gradient(135deg,#4F6F52,#3A5240)", boxShadow: "0 4px 12px rgba(79,111,82,0.3)" }}>
              旅
            </div>
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
            <a href="#simulator" className="hover:text-[#4F6F52] transition-colors">实机对谈</a>
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
              <a href="#simulator" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-[#FAF8F5] text-base font-semibold">实机对谈</a>
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
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> 旅行家Pro·AI智能交互导览系统
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
                <h4 className="text-[#FAF8F5] text-sm font-bold tracking-wider" style={{ fontFamily: "var(--font-noto-serif)" }}>旅行家ProAI向导「小旅」</h4>
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



      {/* Featured Capabilities (特色功能) - 3D Auto-play Carousel (Light Theme & Upload Style) */}
      <section id="feature" className="py-24 bg-[#FAF8F5] border-y border-[#E6E2D8] relative overflow-hidden text-[#1E2522]">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full filter blur-[120px] pointer-events-none opacity-10"
          style={{ background: "radial-gradient(circle, #4F6F52 0%, transparent 70%)" }} />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center space-y-4 mb-12">
            <span className="text-xs font-black tracking-[0.2em] text-[#4F6F52] uppercase block">
              Features
            </span>
            <h3 className="text-3xl md:text-5xl font-black tracking-tight text-[#1E2522]" style={{ fontFamily: "var(--font-noto-serif)" }}>
              沉浸式交互，数字科技重塑旅途
            </h3>
            <div className="w-12 h-1.5 rounded-full bg-[#4F6F52] mx-auto mt-4" />
            <p className="text-sm md:text-base text-[#8F9F8F] max-w-2xl mx-auto leading-relaxed">
              集顶尖算法于一身，让AI成为最懂您的全能私人出行向导。
            </p>
          </div>

          {/* Carousel Container */}
          <div className="relative w-full h-[400px] md:h-[460px] flex items-center justify-center overflow-hidden">
            {[
              {
                icon: Bot,
                num: "01",
                title: "虚拟人3D拟真交互",
                desc: "提供仕女古风、童趣卡通、现代精英数字人形象，具备自然表情流露与拟真口型算法。",
                color: "#8B5CF6", // Purple
              },
              {
                icon: MessageCircle,
                num: "02",
                title: "全天候双工语音对谈",
                desc: "极速的语音语义流式处理，打破呆板的按键指引，就像与一位温婉知性的文史专家面对面交谈。",
                color: "#10B981", // Emerald
              },
              {
                icon: MapPin,
                num: "03",
                title: "自适应智能专属路径",
                desc: "支持输入您当前的兴趣偏好，如“历史文化优先、走平坦道”，AI自动动态避堵并规划最优旅游足迹。",
                color: "#D2A053", // Gold/Amber
              },
              {
                icon: Sparkles,
                num: "04",
                title: "AR/VR实景研判识别",
                desc: "对准展品文物拍摄即可开展多模态文物识别，提取背后的深度文化故事，变走马观花为沉浸感悟。",
                color: "#06B6D4", // Cyan
              },
              {
                icon: Users,
                num: "05",
                title: "适老/童趣多模态适配",
                desc: "首创三大体验模式，老年大字伴读、儿童故事科普、标准沉浸研读，贴心照顾全家出游偏好。",
                color: "#EC4899", // Rose/Pink
              },
              {
                icon: TrendingUp,
                num: "06",
                title: "景区大屏与情感雷达",
                desc: "景区管理后台支持游客情感指数雷达监测、高频热搜词云实时流计算及今日客流量科学预测。",
                color: "#3B82F6", // Blue
              }
            ].map((f, i) => {
              // Calculate relative offset wrap-around correctly in range [-3, 2]
              let diff = i - activeFeatureIndex;
              if (diff < -3) diff += 6;
              if (diff > 2) diff -= 6;

              const isActive = diff === 0;
              const isPrev = diff === -1;
              const isNext = diff === 1;
              const isFarPrev = diff === -2;
              const isFarNext = diff === 2;

              // Responsive offsets
              const isMobile = windowWidth < 768;
              let translateX = 0;
              if (isMobile) {
                translateX = diff * 280;
              } else {
                if (isActive) translateX = 0;
                else if (isPrev) translateX = -380;
                else if (isNext) translateX = 380;
                else if (isFarPrev) translateX = -720;
                else if (isFarNext) translateX = 720;
                else translateX = diff < 0 ? -1060 : 1060;
              }

              return (
                <motion.div
                  key={i}
                  onClick={() => setActiveFeatureIndex(i)}
                  animate={{
                    x: translateX,
                    scale: isActive ? 1.05 : 0.85,
                    opacity: isActive ? 1 : (Math.abs(diff) === 1 ? 0.75 : (Math.abs(diff) === 2 ? 0.3 : 0)),
                    zIndex: isActive ? 10 : (Math.abs(diff) === 1 ? 5 : 2),
                    pointerEvents: isActive || Math.abs(diff) === 1 ? "auto" : "none"
                  }}
                  transition={{ type: "spring", stiffness: 150, damping: 22 }}
                  style={{
                    background: isActive
                      ? "linear-gradient(180deg, #FFFFFF 0%, #FFFDF9 100%)"
                      : "linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(250, 248, 245, 0.9) 100%)",
                    border: isActive
                      ? `2px solid ${f.color}`
                      : `1px solid ${f.color}40`,
                    boxShadow: isActive
                      ? `0 20px 45px -12px ${f.color}35`
                      : `0 4px 15px -3px ${f.color}10`
                  }}
                  className={`absolute w-[260px] md:w-[350px] h-[340px] md:h-[380px] rounded-3xl p-6 md:p-8 flex flex-col justify-between cursor-pointer select-none transition-shadow duration-300 group`}
                >
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex justify-between items-start">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-105"
                        style={{
                          background: `linear-gradient(135deg, ${f.color} 0%, ${f.color}bb 100%)`,
                          boxShadow: `0 8px 20px ${f.color}30`
                        }}
                      >
                        <f.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xl md:text-3xl font-black font-mono select-none opacity-25 tracking-tight" style={{ color: f.color }}>
                        {f.num}
                      </span>
                    </div>

                    <div className="space-y-2 text-left">
                      <h4 className="text-base md:text-xl font-black text-[#1E2522] tracking-tight group-hover:text-[#4F6F52] transition-colors duration-300">
                        {f.title}
                      </h4>
                      <p className="text-xs md:text-sm leading-relaxed text-[#374151] font-medium min-h-[50px] md:min-h-[72px]">
                        {f.desc}
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStart();
                    }}
                    className="pt-4 mt-4 border-t border-[#E6E2D8] flex items-center gap-2 text-xs font-black transition-all duration-300 hover:opacity-80 justify-start"
                    style={{ color: f.color }}
                  >
                    <span>立即体验</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center items-center gap-2 mt-10">
            {[...Array(6)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveFeatureIndex(idx)}
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: activeFeatureIndex === idx ? "24px" : "8px",
                  backgroundColor: activeFeatureIndex === idx
                    ? "#4F6F52"
                    : "rgba(79, 111, 82, 0.2)"
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
      <section id="persona" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-bold tracking-widest text-[#D2A053] uppercase">Target Personas</span>
            <h3 className="text-3xl md:text-4xl font-black" style={{ fontFamily: "var(--font-noto-serif)" }}>定制化解说，听你想听的声音</h3>
            <div className="w-12 h-1 rounded bg-[#D2A053] mx-auto mt-2" />
            <p className="text-sm text-[#8F9F8F] max-w-xl mx-auto">大字、童趣、学术、极速——鼠标悬停切换，抢先预览不同人群画像的参数定制。</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left selector */}
            <div className="lg:col-span-5 space-y-3">
              {PERSONAS.map((p, i) => (
                <button
                  key={i}
                  onMouseEnter={() => setActivePersona(i)}
                  onClick={() => setActivePersona(i)}
                  className={`w-full p-5 rounded-2xl text-left border transition-all flex items-center gap-4 ${activePersona === i
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

      {/* Interactive Simulator Section (实机对谈模拟体验沙盒) */}
      <section id="simulator" className="py-20 bg-white border-y border-[#E6E2D8] relative overflow-hidden">
        <style dangerouslySetInnerHTML={{ __html: `
          .digital-human-view {
            height: 220px;
            flex-shrink: 0;
            background: linear-gradient(to bottom, rgba(79, 111, 82, 0.1), rgba(13, 19, 14, 0.8));
            border-radius: 24px;
            position: relative;
            overflow: hidden;
            margin-bottom: 0.8rem;
            display: flex;
            justify-content: center;
            align-items: flex-end;
          }
          .avatar-artwork {
            width: 140px;
            height: 180px;
            position: relative;
            z-index: 2;
            transform: scale(1.3);
            transform-origin: bottom center;
            animation: idle-sway 4s ease-in-out infinite alternate;
          }
          .avatar-hair-back {
            width: 90px;
            height: 110px;
            background: #3b2a20;
            border-radius: 40px;
            position: absolute;
            top: 45px;
            left: 25px;
          }
          .avatar-head {
            width: 70px;
            height: 70px;
            background: #ffe3d1;
            border-radius: 50%;
            position: absolute;
            top: 40px;
            left: 35px;
            box-shadow: inset 0 -5px 10px rgba(0,0,0,0.05);
          }
          .avatar-eye {
            width: 8px;
            height: 8px;
            background: #4a3728;
            border-radius: 50%;
            position: absolute;
            top: 30px;
          }
          .avatar-eye.left { left: 16px; }
          .avatar-eye.right { left: 46px; }
          .avatar-blush {
            width: 12px;
            height: 6px;
            background: rgba(255, 105, 120, 0.4);
            border-radius: 50%;
            position: absolute;
            top: 38px;
          }
          .avatar-blush.left { left: 10px; }
          .avatar-blush.right { left: 48px; }
          .avatar-mouth {
            width: 10px;
            height: 6px;
            background: #ff5e62;
            border-radius: 0 0 10px 10px;
            position: absolute;
            top: 44px;
            left: 30px;
            transition: all 0.2s;
          }
          .avatar-hair-front {
            width: 80px;
            height: 50px;
            background: #3b2a20;
            border-radius: 40px 40px 10px 10px;
            position: absolute;
            top: 35px;
            left: 30px;
          }
          .avatar-body {
            width: 90px;
            height: 100px;
            background: linear-gradient(135deg, #4F6F52 0%, #739072 100%);
            border-radius: 30px 30px 0 0;
            position: absolute;
            top: 105px;
            left: 25px;
            border: 1px solid rgba(250,248,245,0.1);
          }
          .avatar-hat {
            width: 90px;
            height: 30px;
            background: #D2A053;
            border-radius: 50px 50px 0 0;
            position: absolute;
            top: 15px;
            left: 25px;
            transform: rotate(-10deg);
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          }
          .avatar-hat::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: -5px;
            width: 100px;
            height: 8px;
            background: #cba843;
            border-radius: 5px;
          }
          @keyframes idle-sway {
            0% { transform: rotate(-1.5deg) translateY(0); }
            100% { transform: rotate(1.5deg) translateY(-2px); }
          }
          @keyframes mouth-talk {
            0%, 100% { height: 4px; border-radius: 50%; }
            50% { height: 10px; border-radius: 0 0 10px 10px; }
          }
          .mouth-talking {
            animation: mouth-talk 0.15s infinite alternate;
          }
        ` }} />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-bold tracking-widest text-[#4F6F52] uppercase">04 / Interactive Simulator</span>
            <h3 className="text-3xl md:text-4xl font-black text-[#1E2522]" style={{ fontFamily: "var(--font-noto-serif)" }}>
              实机对谈模拟体验沙盒
            </h3>
            <div className="w-12 h-1 rounded bg-[#4F6F52] mx-auto mt-2" />
            <p className="text-sm text-[#8F9F8F] max-w-xl mx-auto">
              在这里零距离体验 AI 导览官的智能对谈与自适应参数响应，变“走马观花”为“深度解读”。
            </p>
          </div>

          {/* Simulator Container */}
          <div className="bg-[#FAF8F5] border border-[#E6E2D8] rounded-3xl p-6 md:p-10 shadow-[0_20px_50px_rgba(79,111,82,0.05)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Selector & Admin dashboard preview */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-4">
                  <h4 className="text-base font-bold text-[#1E2522] flex items-center gap-2">
                    <span>💬</span> 模拟游客发起提问
                  </h4>
                  <p className="text-xs text-[#8F9F8F] leading-relaxed">
                    点击下方预设的游客提问场景，观察右侧手机模拟器中 AI 导览官小旅的**表情口型联动**与**流式回复内容**：
                  </p>
                  
                  {/* Category Tabs */}
                  <div className="flex gap-2 bg-[#FAF8F5] border border-[#E6E2D8] p-1 rounded-xl shadow-sm">
                    {[
                      { id: "history", name: "📜 历史人文讲解" },
                      { id: "route", name: "🗺️ 智慧路线规划" },
                      { id: "accessibility", name: "♿ 适老无障碍" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setSimTab(tab.id as any);
                          triggerToast(`已切换至：${tab.name}`);
                        }}
                        className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-lg transition-all ${
                          simTab === tab.id
                            ? "bg-[#4F6F52] text-white shadow-md shadow-[#4F6F52]/20"
                            : "text-[#8F9F8F] hover:text-[#4F6F52]"
                        }`}
                      >
                        {tab.name}
                      </button>
                    ))}
                  </div>

                  {/* QA List per Category */}
                  <div className="space-y-2 pt-2">
                    {SIM_QA_DATA[simTab].map((qa, index) => (
                      <div
                        key={index}
                        onClick={() => triggerDialogue(qa.q, qa.a)}
                        className="bg-white border border-[#E6E2D8] p-4 rounded-xl cursor-pointer hover:bg-[#4F6F52]/5 hover:border-[#4F6F52]/40 transition-all flex items-center justify-between group shadow-sm hover:translate-x-1"
                      >
                        <span className="text-xs md:text-sm font-medium text-[#1E2522]">{qa.label}</span>
                        <span className="text-[#D2A053] font-bold group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* B-end admin dashboard mockup */}
                <div className="bg-[#121815] border border-[#D2A053]/20 rounded-2xl p-5 text-white space-y-4 shadow-lg text-left">
                  <h5 className="text-xs font-bold text-[#D2A053] border-b border-[#D2A053]/20 pb-2 flex items-center gap-1.5">
                    <span>🎛️</span> B端景区实时调度大屏数据预览
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                      <div className="text-[10px] text-[#8F9F8F] uppercase tracking-wider">今日AI伴游人数</div>
                      <div className="text-lg md:text-xl font-bold text-[#D2A053] mt-1">{simUsers.toLocaleString()}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                      <div className="text-[10px] text-[#8F9F8F] uppercase tracking-wider">主动避堵引流次数</div>
                      <div className="text-lg md:text-xl font-bold text-[#D2A053] mt-1">{simRoutes}</div>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span>🔥 游客热门问答词云统计</span>
                      <span className="text-[#D2A053]">Top Topics</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { name: "1. 飞来石传说讲解", value: 42, color: "#D2A053" },
                        { name: "2. 避堵路线指引", value: 35, color: "#4F6F52" },
                        { name: "3. 无障碍坡道查询", value: 23, color: "#8F9F8F" }
                      ].map((topic, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-[9px] text-[#8F9F8F]">
                            <span>{topic.name}</span>
                            <span>{topic.value}%</span>
                          </div>
                          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${topic.value}%`, backgroundColor: topic.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Phone Simulator */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-[290px] h-[480px] bg-[#0D130E] border-[8px] border-[#1C261E] rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative scale-[1.03]">
                  {/* Notch */}
                  <div className="w-[120px] h-[18px] bg-[#1C261E] absolute top-0 left-1/2 -translate-x-1/2 rounded-b-[15px] z-20" />

                  {/* Screen Content */}
                  <div className="flex-1 flex flex-col p-4 pt-6 relative select-none text-left">
                    {/* Header */}
                    <div className="flex justify-between items-center pb-2 border-b border-[#4F6F52]/20 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#D2A053] to-[#4F6F52] flex items-center justify-center text-[10px] font-bold text-white">
                          小
                        </div>
                        <span className="text-xs font-bold text-white">小旅 Pro</span>
                      </div>
                      <div className="text-[9px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> AI伴游中
                      </div>
                    </div>

                    {/* Live2D Digital Human Area */}
                    <div className="digital-human-view">
                      <div className="avatar-artwork">
                        <div className="avatar-hat" />
                        <div className="avatar-hair-back" />
                        <div className="avatar-body" />
                        <div className="avatar-head">
                          <div className="avatar-eye left" />
                          <div className="avatar-eye right" />
                          <div className="avatar-blush left" />
                          <div className="avatar-blush right" />
                          <div className={`avatar-mouth ${isSimTyping ? "mouth-talking" : ""}`} />
                        </div>
                        <div className="avatar-hair-front" />
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div ref={simChatRef} className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 font-sans text-[11px] overflow-y-auto space-y-2 scrollbar-none flex flex-col">
                      {simMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`max-w-[85%] p-2 rounded-lg leading-relaxed ${
                            msg.sender === "user"
                              ? "bg-white/10 text-[#D2A053] self-end text-right"
                              : "bg-[#4F6F52]/20 border-l-2 border-[#D2A053] text-[#FAF8F5] self-start text-left"
                          }`}
                        >
                          {msg.text}
                        </div>
                      ))}
                    </div>

                    {/* Input Area */}
                    <div className="flex gap-2 mt-3">
                      <input
                        type="text"
                        value={simInput}
                        readOnly
                        placeholder="请在左侧选择提问内容..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-[10px] text-white outline-none"
                      />
                      <button className="w-7 h-7 rounded-full bg-[#4F6F52] hover:bg-[#5D8260] active:scale-95 transition-all flex items-center justify-center text-white text-xs">
                        💬
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Simulator Toast Notification */}
        <div
          className={`fixed bottom-8 right-8 z-50 bg-[#121815] border border-[#D2A053]/40 border-l-4 border-l-[#D2A053] px-5 py-3 rounded-lg shadow-xl text-xs text-white flex items-center gap-2 transition-all duration-300 transform ${
            showSimToast ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"
          }`}
        >
          <span>💡</span>
          <span>{simToast}</span>
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
              <a href="#simulator" className="hover:text-white transition-colors">实机体验沙盒</a>
              <span className="text-white/10">•</span>
              <a href="#membership" className="hover:text-white transition-colors">尊享会员计划</a>

              <span className="text-white/20 mx-2 hidden lg:inline">|</span>

              <span className="text-white font-bold">关于我们：</span>
              <span>智慧文旅开发组</span>
              <span className="text-white/10">•</span>
              <span>Eazo 平台官方应用支撑</span>
              <span className="text-white/10">•</span>
              <span>联系邮箱：support@eazo.ai</span>
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
          <p>© {new Date().getFullYear()} 旅行家Pro Inc. 保留所有权利。由 Eazo Platform 强力驱动。</p>
        </div>
      </footer>
    </div>
  );
}
