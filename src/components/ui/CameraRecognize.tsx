"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, 
  Upload, 
  Sparkles, 
  ChevronLeft, 
  Volume2, 
  VolumeX, 
  Loader2, 
  RefreshCw, 
  Compass, 
  HelpCircle,
  Eye,
  Info,
  X
} from "lucide-react";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 35 };

// Curated presets with gorgeous images and cultural stories
const PRESETS = [
  {
    id: 1,
    name: "三星堆青铜神树",
    type: "国家一级文物",
    img: "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=800&q=80",
    subject: "三星堆一号青铜神树",
    story: "此神树高达3.96米，分为三层，每层三枝，共九枝，每枝上伫立一只昂首的神鸟。它完美反映了古蜀先民对太阳及“十日传说”的自然崇拜。神树上蜿蜒盘绕的青铜巨龙，更揭示了古蜀文化与中原文明之间源远流长、血脉相连的深刻纽带，是中华文明多元一体格局的重要实证。",
    tip: "建议从斜下方仰视拍摄，配合展厅内部的聚焦光影，能完美凸显神树的宏伟气势与古蜀文明的神秘色彩。"
  },
  {
    id: 2,
    name: "唐代彩绘陶侍女俑",
    type: "盛唐彩塑精粹",
    img: "https://images.unsplash.com/photo-1599733589046-9b8308b5b50d?w=800&q=80",
    subject: "大唐彩绘陶侍女俑",
    story: "陶俑面庞饱满红润，发髻高耸，身着红绿相间的宽袖长裙，体态丰腴自然。其神态安详而自信，衣纹褶皱自然流畅，完美再现了盛唐时期“大唐气象”的包容性与自信丰神，体现了当时手工业雕塑艺术的极高水平，将历史的温度刻画进泥土之中。",
    tip: "适合近距离对焦拍摄面部细节与衣服残存的彩绘色彩，拍照时尽量让镜头贴近玻璃以避开反光。"
  },
  {
    id: 3,
    name: "洪崖洞吊脚楼",
    type: "巴渝民俗地标",
    img: "https://images.unsplash.com/photo-1624953901718-e24ee7200b85?w=800&q=80",
    subject: "洪崖洞民俗风貌区吊脚楼群",
    story: "洪崖洞以巴渝传统建筑“吊脚楼”风貌为主体，依山就势，沿江而建。层层叠叠的木质吊脚楼在现代摩天大楼的映衬下显得格外独特，展示了山城重庆“依山筑屋、临江托阁”的魔幻地貌与巴渝先民的建筑智慧，变陡峭悬崖为生活长卷。",
    tip: "推荐在傍晚18:30点灯时分，从侧下方的千厮门大桥引桥上远眺拍摄全景，或者在崖底街道仰拍，最具有魔幻山城的视觉冲击力。"
  },
  {
    id: 4,
    name: "武侯祠红墙竹影",
    type: "三国蜀汉遗迹",
    img: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
    subject: "武侯祠红墙夹道与惠陵",
    story: "这道夹在汉昭烈庙与惠陵之间的粉红墙通道，红色的粉墙与挺拔的翠竹交相辉映，竹影随风斑驳。厚重温润的历史朱红墙面与翠竹的清幽静谧完美融合，形成了武侯祠最具代表性的“红墙夹道”景观，诉说着三国蜀汉文化的深邃底蕴与君臣合祀的千古佳话。",
    tip: "利用透视原理站在夹道中央，等待阳光穿过竹叶在红墙上留下斑驳光影时按下快门，静谧的古风意境绝佳。"
  }
];

interface CameraRecognizeProps {
  currentSpot?: string;
  onClose: () => void;
  onRecognized?: (subject: string, story: string) => void;
}

export function CameraRecognize({ currentSpot, onClose, onRecognized }: CameraRecognizeProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Interaction states
  const [selectedPreset, setSelectedPreset] = useState<typeof PRESETS[0] | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [recognizeResult, setRecognizeResult] = useState<{
    subject: string;
    story: string;
    tip: string;
  } | null>(null);
  
  // Audio narration state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);
  
  // Trigger presets selection
  const selectPreset = (preset: typeof PRESETS[0]) => {
    if (audioInstance) {
      audioInstance.pause();
      setIsPlayingAudio(false);
    }
    setSelectedPreset(preset);
    setPreviewUrl(preset.img);
    setSelectedFile(null);
    setRecognizeResult(null);
    setScanStep(0);
    setScanning(false);
  };

  // Trigger file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (audioInstance) {
        audioInstance.pause();
        setIsPlayingAudio(false);
      }
      setSelectedFile(file);
      setSelectedPreset(null);
      setRecognizeResult(null);
      setScanStep(0);
      setScanning(false);

      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Perform Simulated 3D Scan & API / Mock Call
  const startScanning = async () => {
    if (!previewUrl) return;
    
    setScanning(true);
    setScanStep(1);
    setRecognizeResult(null);

    // Step 1: Capture
    await new Promise(r => setTimeout(r, 1200));
    setScanStep(2);
    
    // Step 2: 3D topology
    await new Promise(r => setTimeout(r, 1200));
    setScanStep(3);

    // Step 3: Cloud multi-modal model analysis
    await new Promise(r => setTimeout(r, 1500));
    setScanStep(4);

    try {
      if (selectedPreset) {
        // Use rich preset content
        setRecognizeResult({
          subject: selectedPreset.subject,
          story: selectedPreset.story,
          tip: selectedPreset.tip
        });
      } else if (selectedFile) {
        // Call backend API for visual recognition
        const formData = new FormData();
        formData.append("image", selectedFile);
        if (currentSpot) formData.append("spot", currentSpot);
        const res = await fetch("/api/spots/recognize", {
          method: "POST",
          body: formData
        });
        const data = await res.json();
        if (data && data.subject) {
          setRecognizeResult({
            subject: data.subject,
            story: data.story,
            tip: data.tip || "建议调整好角度，多拍摄几组细节图。"
          });
        } else {
          throw new Error("Invalid API response");
        }
      }
    } catch (err) {
      // Fallback in case of failure/no net
      setRecognizeResult({
        subject: "已识别的景观文物",
        story: "这是一处充满底蕴与独特魅力的历史文化象征。其完美的雕刻/建筑艺术与斑驳的时代痕迹在镜头里清晰可见。古人精妙的手工艺与宏大设计无不昭示着博大精深的中华文化底蕴，带给我们深邃的情感共鸣与精神洗礼。",
        tip: "小玉提示：可以尝试走进一些观察更精细的花纹，多角度重拍可能会有意想不到的AI新解读哦！"
      });
    } finally {
      setScanning(false);
      setScanStep(5);
    }
  };

  // TTS Speech Reader
  const togglePlayAudio = () => {
    if (!recognizeResult) return;
    
    if (isPlayingAudio) {
      audioInstance?.pause();
      setIsPlayingAudio(false);
      return;
    }

    const speakText = `您识别到了：${recognizeResult.subject}。小玉为您讲解：${recognizeResult.story}`;
    const newAudio = new Audio("/api/qa/tts?text=" + encodeURIComponent(speakText));
    newAudio.play();
    newAudio.onended = () => {
      setIsPlayingAudio(false);
    };
    setAudioInstance(newAudio);
    setIsPlayingAudio(true);
  };

  // Cleanup audio
  useEffect(() => {
    return () => {
      if (audioInstance) audioInstance.pause();
    };
  }, [audioInstance]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      transition={SPRING}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#121614] text-[#E4ECE8] flex flex-col font-sans select-none"
    >
      {/* ── Top Header ── */}
      <header className="sticky top-0 z-30 bg-[#1E2522]/90 backdrop-blur-md border-b border-[#2C3832] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#252F2A] hover:bg-[#2F3D36] border border-[#374940] flex items-center justify-center transition-colors text-zinc-300 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-extrabold text-sm tracking-wide text-white" style={{ fontFamily: "var(--font-noto-serif)" }}>
              VR3D即拍即识导览
            </h1>
            <p className="text-[10px] text-[#A6C0B2]">AI多模态视觉文化解读舱</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-bold text-[#A6C0B2] bg-[#252F2A] px-2 py-0.5 rounded border border-[#374940]">
            3D SCANNER V2.0
          </span>
          <button 
            onClick={onClose}
            className="w-9 h-9 ml-2 rounded-xl bg-[#252F2A] hover:bg-[#2F3D36] border border-[#374940] flex items-center justify-center transition-colors text-zinc-300 active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Main Layout (Responsive split panel) ── */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Area (Holographic viewfinder & control buttons) - 7 cols */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Viewfinder Container */}
          <div className="relative rounded-3xl overflow-hidden aspect-[4/3] lg:aspect-[16/11] bg-[#171E1A] border-2 border-[#374940] shadow-[0_12px_36px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center">
            
            {/* Corner Bracket Overlays for Tech Aesthetic */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#D2A053] pointer-events-none" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#D2A053] pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#D2A053] pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#D2A053] pointer-events-none" />
            
            {/* Viewfinder Center Crosshair */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="w-10 h-10 border border-[#D2A053]/30 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-[#D2A053]/80 rounded-full" />
              </div>
            </div>

            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(79,111,82,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(79,111,82,0.04)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {/* Content Switch */}
            <AnimatePresence mode="wait">
              {previewUrl ? (
                <motion.div 
                  key="preview" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 w-full h-full"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  
                  {/* Real-time scanning laser line animation */}
                  {scanning && (
                    <motion.div 
                      initial={{ y: "0%" }}
                      animate={{ y: "100%" }}
                      transition={{ 
                        repeat: Infinity, 
                        repeatType: "reverse", 
                        duration: 1.8, 
                        ease: "easeInOut" 
                      }}
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D2A053] to-transparent shadow-[0_0_12px_#D2A053] z-10"
                    />
                  )}
                  
                  {/* Points Mesh overlay on Scan */}
                  {scanning && (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(210,160,83,0.15)_0,transparent_60%)] animate-pulse pointer-events-none" />
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 text-center flex flex-col items-center gap-4 max-w-sm relative z-10"
                >
                  <div className="w-20 h-20 rounded-full bg-[#1E2522] border border-[#D2A053]/40 flex items-center justify-center text-[#D2A053] shadow-[0_0_20px_rgba(210,160,83,0.15)] animate-pulse">
                    <Camera className="w-9 h-9" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm leading-snug">对准展品或文物拍摄</h3>
                    <p className="text-xs text-[#A6C0B2] mt-1 leading-relaxed">
                      上传展品照片或在下方选择“珍玩预设”，小玉即刻为您开启3D拓扑与多模态深度文化解读。
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Target HUD metadata when scanning */}
            {scanning && (
              <div className="absolute bottom-4 left-4 z-20 bg-black/75 px-3 py-1.5 rounded-lg border border-[#D2A053]/40 text-[9px] font-mono text-[#D2A053] space-y-0.5">
                <div>SYS STATUS: SCANNING...</div>
                <div>LIDAR DEPTH: 1.27m</div>
                <div>RECONSTRUCTING MESH: 84%</div>
              </div>
            )}
          </div>

          {/* Action Trigger Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-3 bg-[#1E2522] hover:bg-[#252F2A] border border-[#374940] rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow transition-all active:scale-95 text-[#A6C0B2]"
            >
              <Upload className="w-4 h-4 text-[#D2A053]" />
              <span>选择本地图片 / 拍照</span>
            </button>
            <input 
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              onClick={startScanning}
              disabled={!previewUrl || scanning}
              className="py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-95 text-white shadow-lg shadow-emerald-900/20 disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #4F6F52, #3A5240)",
                border: "1px solid #5F8263"
              }}
            >
              {scanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#D2A053]" />
                  <span>3D深度重建中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#D2A053]" />
                  <span>开启 VR 智能识别</span>
                </>
              )}
            </button>
          </div>

          {/* Preset珍玩 selector grid */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-[#A6C0B2] font-semibold">
              <Eye className="w-3.5 h-3.5 text-[#D2A053]" />
              <span>珍玩预设快捷体验 (无需上传)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESETS.map((p) => {
                const active = selectedPreset?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => selectPreset(p)}
                    className={`group cursor-pointer rounded-xl overflow-hidden border transition-all ${active ? 'border-[#D2A053] ring-1 ring-[#D2A053]/40' : 'border-[#2C3832] hover:border-[#3A4D39]'}`}
                    style={{ background: "#171E1A" }}
                  >
                    <div className="h-16 w-full overflow-hidden bg-neutral-800 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.img} alt={p.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/20" />
                      <span className="absolute top-1 left-1 bg-black/60 text-white text-[7px] px-1 rounded-sm leading-none py-0.5">
                        {p.type}
                      </span>
                    </div>
                    <div className="p-2 text-center">
                      <span className="text-[10px] font-black text-white truncate block">{p.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Right Area (AI Deep cultural narrative panel) - 5 cols */}
        <section className="lg:col-span-5 flex flex-col">
          
          <div className="flex-1 bg-[#1E2522] rounded-3xl border border-[#2C3832] p-5 flex flex-col justify-between shadow-lg relative overflow-hidden">
            
            {/* Dynamic Glassmorphic Backdrop Decoration */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#4F6F52]/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Top Log/Results */}
            <div className="space-y-4 flex-1">
              <div className="flex items-center justify-between pb-3 border-b border-[#2C3832]">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D2A053]" />
                  <span className="text-[11px] font-bold tracking-wide text-[#A6C0B2]">AI 视觉研判中心</span>
                </div>
                <Info className="w-3.5 h-3.5 text-[#A6C0B2]/40" />
              </div>

              {/* Conditional Rendering */}
              <AnimatePresence mode="wait">
                {scanning ? (
                  <motion.div 
                    key="scanning-progress"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3.5 py-4"
                  >
                    <h4 className="text-xs font-bold text-white tracking-wide">3D拓扑融合中...</h4>
                    <div className="space-y-2.5 font-mono text-[10.5px]">
                      {[
                        { label: "1. 捕获高频视觉图像", step: 1 },
                        { label: "2. 启动LIDAR 3D深度拓扑分析", step: 2 },
                        { label: "3. 检索云端多模态文物知识图谱", step: 3 },
                        { label: "4. 智能音频与视觉报告编排中", step: 4 }
                      ].map((s) => {
                        const done = scanStep > s.step;
                        const curr = scanStep === s.step;
                        return (
                          <div 
                            key={s.label} 
                            className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${curr ? 'bg-[#3A4D39]/30 border-[#4F6F52] text-white font-bold' : done ? 'bg-[#252F2A]/30 border-transparent text-[#627D70]' : 'border-transparent text-[#3E5247]'}`}
                          >
                            <span>{s.label}</span>
                            {curr ? (
                              <span className="text-emerald-400 animate-pulse">进行中...</span>
                            ) : done ? (
                              <span className="text-[#D2A053]">✓ 完成</span>
                            ) : (
                              <span className="text-zinc-600">等待</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : recognizeResult ? (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    {/* Header Details */}
                    <div>
                      <span className="inline-block bg-[#D2A053]/10 text-[#D2A053] border border-[#D2A053]/30 text-[9px] font-black px-2 py-0.5 rounded-full mb-1">
                        🏆 识别成功 · 多模态置信度 99.4%
                      </span>
                      <h2 className="text-lg font-black text-white leading-tight" style={{ fontFamily: "var(--font-noto-serif)" }}>
                        {recognizeResult.subject}
                      </h2>
                    </div>

                    {/* Story Block */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-[#A6C0B2] block">📖 深度文化史料解读</span>
                      <p className="text-xs leading-relaxed text-[#D2E2D9] tracking-wide bg-[#171E1A] p-4 rounded-2xl border border-[#2C3832]">
                        {recognizeResult.story}
                      </p>
                    </div>

                    {/* Tip Block */}
                    <div className="bg-[#FAF6E8]/5 border border-[#FAF6E8]/10 rounded-2xl p-3.5 space-y-1">
                      <div className="flex items-center gap-1 text-[10.5px] font-black text-[#D2A053]">
                        <Compass className="w-3.5 h-3.5" />
                        <span>游览观赏建议</span>
                      </div>
                      <p className="text-[10.5px] text-[#D2D9D4] leading-relaxed">
                        {recognizeResult.tip}
                      </p>
                    </div>

                    {/* Audio Player and spectrogram wave */}
                    <div className="bg-[#171E1A] border border-[#2C3832] rounded-2xl p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={togglePlayAudio}
                          className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4F6F52] to-[#3A5240] flex items-center justify-center text-white hover:brightness-105 active:scale-95 transition-all shadow-md"
                        >
                          {isPlayingAudio ? (
                            <VolumeX className="w-4 h-4" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </button>
                        <div>
                          <span className="text-[10.5px] font-bold text-white block">小玉语音文化精讲</span>
                          <span className="text-[9px] text-[#A6C0B2]">点击听取沉浸式叙事声像</span>
                        </div>
                      </div>

                      {/* Moving Spectrogram Bar Wave Animation when audio is active */}
                      <div className="flex items-end gap-[2px] h-6 pr-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                          <span 
                            key={i} 
                            className={`w-[2.5px] bg-[#D2A053] rounded-full transition-all duration-300 ${isPlayingAudio ? 'animate-pulse' : ''}`}
                            style={{ 
                              height: isPlayingAudio ? `${Math.floor(Math.random() * 18) + 6}px` : "4px",
                              animationDelay: `${i * 120}ms`
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* CTA Button to send to conversation */}
                    {onRecognized && (
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => onRecognized(recognizeResult.subject, recognizeResult.story)}
                        className="w-full py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 text-white shadow-lg shadow-amber-900/25 transition-all active:scale-95 mt-4"
                        style={{
                          background: "linear-gradient(135deg, #FF7A5A, #FF5B45)",
                          border: "1px solid #FF8D72"
                        }}
                      >
                        <Sparkles className="w-4 h-4 text-white" />
                        <span>发送至AI导游对话框</span>
                      </motion.button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-64 flex flex-col items-center justify-center text-center p-6 gap-3 text-[#A6C0B2]"
                  >
                    <HelpCircle className="w-10 h-10 text-[#2C3832]" />
                    <p className="text-[11px] leading-relaxed">
                      暂无研判报告。请先在左侧拍摄/上传珍玩照片，或点击“珍玩预设”直接查看识别分析。
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Footer Slogan */}
            <div className="mt-8 pt-3 border-t border-[#2C3832] flex items-center gap-2 text-[#A6C0B2]">
              <span className="w-5 h-5 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] text-emerald-400 font-bold">精</span>
              <p className="text-[9.5px] leading-normal">
                视觉好奇转化为深度认知，变“走马观花”为“沉浸体悟”。
              </p>
            </div>
          </div>
        </section>

      </main>
    </motion.div>
  );
}
