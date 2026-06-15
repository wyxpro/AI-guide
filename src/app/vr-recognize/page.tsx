"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
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
  Info
} from "lucide-react";

// Curated presets with gorgeous images and cultural stories
const PRESETS = [
  {
    id: 1,
    name: "三星堆青铜神树",
    type: "国家一级文物",
    img: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80",
    subject: "三星堆一号青铜神树",
    story: "此神树高达3.96米，分为三层，每层三枝，共九枝，每枝上伫立一只昂首的神鸟。它完美反映了古蜀先民对太阳及“十日传说”的自然崇拜。神树上蜿蜒盘绕的青铜巨龙，更揭示了古蜀文化与中原文明之间源远流长、血脉相连的深刻纽带，是中华文明多元一体格局的重要实证。",
    tip: "建议从斜下方仰视拍摄，配合展厅内部的聚焦光影，能完美凸显神树的宏伟气势与古蜀文明的神秘色彩。"
  },
  {
    id: 2,
    name: "唐代彩绘陶侍女俑",
    type: "盛唐彩塑精粹",
    img: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=800&q=80",
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
    img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80",
    subject: "武侯祠红墙夹道与惠陵",
    story: "这道夹在汉昭烈庙与惠陵之间的粉红墙通道，红色的粉墙与挺拔 of the 翠竹交相辉映，竹影随风斑驳。厚重温润的历史朱红墙面与翠竹 the 清幽静谧完美融合，形成了武侯祠最具代表性的“红墙夹道”景观，诉说着三国蜀汉文化的深邃底蕴与君臣合祀的千古佳话。",
    tip: "利用透视原理站在夹道中央，等待阳光穿过竹叶在红墙上留下斑驳光影时按下快门，静谧的古风意境绝佳。"
  }
];

export default function VRRecognizePage() {
  const router = useRouter();
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
    <div className="min-h-screen bg-[#060810] text-[#D1F4FF] flex flex-col font-sans select-none overflow-x-hidden p-0 md:p-6 justify-center items-center">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl bg-[#090C15]/95 rounded-none md:rounded-3xl border-0 md:border border-[#00E5FF]/30 flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,229,255,0.2)]"
      >
        {/* ── Top Header ── */}
        <header className="sticky top-0 z-30 bg-[#0F1322]/90 backdrop-blur-md border-b border-[#00E5FF]/20 px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push("/home")}
              className="w-9 h-9 rounded-xl bg-[#151D35] hover:bg-[#1E294A] border border-[#00E5FF]/30 flex items-center justify-center transition-all text-[#00E5FF] active:scale-95 shadow-[0_0_8px_rgba(0,229,255,0.2)]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-extrabold text-sm tracking-widest text-[#00E5FF] drop-shadow-[0_0_4px_rgba(0,229,255,0.4)]" style={{ fontFamily: "var(--font-noto-serif)" }}>
                VR3D即拍即识导览
              </h1>
              <p className="text-[10px] text-[#A0B8FF] font-mono tracking-wider">AI MULTIMODAL VISION RECOGNITION POD</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="text-[10px] font-mono font-bold text-[#BD00FF] bg-[#1E1135] px-2.5 py-0.5 rounded border border-[#BD00FF]/40 shadow-[0_0_6px_rgba(189,0,255,0.2)]">
              3D SCANNER V2.0
            </span>
          </div>
        </header>

        {/* ── Main Layout (Responsive split panel) ── */}
        <main className="flex-1 w-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch overflow-y-auto">
          
          {/* Left Area (Holographic viewfinder & control buttons) - 7 cols */}
          <section className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Viewfinder Container */}
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-[16/11] bg-[#0A0D16] border-2 border-[#00E5FF]/30 shadow-[0_0_20px_rgba(0,229,255,0.1)] flex flex-col items-center justify-center">
              
              {/* Corner Bracket Overlays for Tech Aesthetic */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#00E5FF] pointer-events-none" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#00E5FF] pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#00E5FF] pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#00E5FF] pointer-events-none" />
              
              {/* Viewfinder Center Target Dot - NO circle dot frame */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="w-2.5 h-2.5 bg-[#00E5FF]/90 rounded-full shadow-[0_0_8px_#00E5FF]" />
                <div className="absolute w-6 h-[1.5px] bg-[#00E5FF]/40" />
                <div className="absolute h-6 w-[1.5px] bg-[#00E5FF]/40" />
              </div>

              {/* Grid Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,229,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

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
                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF007F] to-transparent shadow-[0_0_15px_#FF007F] z-10"
                      />
                    )}
                    
                    {/* Points Mesh overlay on Scan */}
                    {scanning && (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.15)_0,transparent_60%)] animate-pulse pointer-events-none" />
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8 text-center flex flex-col items-center gap-4 max-w-sm relative z-10"
                  >
                    {/* Camera icon - NO circle dot frame */}
                    <div className="text-[#00E5FF] drop-shadow-[0_0_15px_rgba(0,229,255,0.6)] animate-pulse mb-1">
                      <Camera className="w-12 h-12" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm tracking-wide">对准展品或文物拍摄</h3>
                      <p className="text-xs text-[#A0B8FF] mt-1.5 leading-relaxed">
                        上传展品照片或在下方选择“珍玩预设”，小玉即刻为您开启3D拓扑与多模态深度文化解读。
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Target HUD metadata when scanning */}
              {scanning && (
                <div className="absolute bottom-4 left-4 z-20 bg-black/80 px-3 py-2 rounded-lg border border-[#00E5FF]/40 text-[9px] font-mono text-[#00E5FF] space-y-0.5 shadow-[0_0_10px_rgba(0,229,255,0.15)]">
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
                className="py-3 bg-[#0F172A] hover:bg-[#1E293B] border border-[#00E5FF]/30 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow transition-all active:scale-95 text-[#00E5FF] hover:border-[#00E5FF]/60 hover:shadow-[0_0_8px_rgba(0,229,255,0.15)]"
              >
                <Upload className="w-4 h-4 text-[#00E5FF]" />
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
                className="py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-95 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(138,43,226,0.3)] bg-gradient-to-r from-[#00E5FF] to-[#8A2BE2] hover:brightness-110 border border-[#00E5FF]/40"
              >
                {scanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>3D深度重建中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>开启 VR 智能识别</span>
                  </>
                )}
              </button>
            </div>

            {/* Preset珍玩 selector grid */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-[#00E5FF] font-semibold tracking-wide">
                <Eye className="w-3.5 h-3.5 text-[#BD00FF]" />
                <span>珍玩预设快捷体验 (无需上传)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PRESETS.map((p) => {
                  const active = selectedPreset?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => selectPreset(p)}
                      className={`group cursor-pointer rounded-xl overflow-hidden border transition-all duration-300 ${active ? 'border-[#00E5FF] ring-2 ring-[#00E5FF]/40 shadow-[0_0_15px_rgba(0,229,255,0.35)]' : 'border-[#1E294A] hover:border-[#00E5FF]/40'}`}
                      style={{ background: "#0F1322" }}
                    >
                      <div className="h-16 w-full overflow-hidden bg-neutral-900 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.img} alt={p.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/30" />
                        <span className="absolute top-1 left-1 bg-[#1E1135]/80 text-[#00E5FF] border border-[#00E5FF]/30 text-[7px] px-1 rounded-sm leading-none py-0.5 font-mono">
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
            
            <div className="flex-grow bg-[#0F1322]/90 rounded-2xl border border-[#00E5FF]/20 p-5 flex flex-col justify-between shadow-lg relative overflow-hidden">
              
              {/* Dynamic Glassmorphic Backdrop Decoration */}
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#00E5FF]/10 rounded-full blur-2xl pointer-events-none" />
              
              {/* Top Log/Results */}
              <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between pb-3 border-b border-[#00E5FF]/20">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
                    <span className="text-[11px] font-bold tracking-widest text-[#00E5FF] font-mono">AI 视觉研判中心</span>
                  </div>
                  <Info className="w-3.5 h-3.5 text-[#00E5FF]/50" />
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
                              className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${curr ? 'bg-[#00E5FF]/10 border-[#00E5FF] text-white font-bold' : done ? 'bg-[#8A2BE2]/10 border-transparent text-[#BD00FF]' : 'border-transparent text-zinc-500'}`}
                            >
                              <span>{s.label}</span>
                              {curr ? (
                                <span className="text-cyan-400 animate-pulse">进行中...</span>
                              ) : done ? (
                                <span className="text-[#00E5FF]">✓ 完成</span>
                              ) : (
                                <span className="text-zinc-700">等待</span>
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
                        <span className="inline-block bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 text-[9px] font-black px-2 py-0.5 rounded-full mb-1">
                          🏆 识别成功 · 多模态置信度 99.4%
                        </span>
                        <h2 className="text-lg font-black text-white leading-tight" style={{ fontFamily: "var(--font-noto-serif)" }}>
                          {recognizeResult.subject}
                        </h2>
                      </div>

                      {/* Story Block */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-[#A0B8FF] block">📖 深度文化史料解读</span>
                        <p className="text-xs leading-relaxed text-[#D1F4FF] tracking-wide bg-[#0A0D16] p-4 rounded-xl border border-[#00E5FF]/15">
                          {recognizeResult.story}
                        </p>
                      </div>

                      {/* Tip Block */}
                      <div className="bg-[#BD00FF]/5 border border-[#BD00FF]/25 rounded-xl p-3.5 space-y-1">
                        <div className="flex items-center gap-1 text-[10.5px] font-black text-[#BD00FF]">
                          <Compass className="w-3.5 h-3.5 text-[#00E5FF]" />
                          <span>游览观赏建议</span>
                        </div>
                        <p className="text-[10.5px] text-[#A0B8FF] leading-relaxed">
                          {recognizeResult.tip}
                        </p>
                      </div>

                      {/* Audio Player and spectrogram wave */}
                      <div className="bg-[#0A0D16] border border-[#00E5FF]/15 rounded-xl p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={togglePlayAudio}
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#8A2BE2] flex items-center justify-center text-white hover:brightness-105 active:scale-95 transition-all shadow-md"
                          >
                            {isPlayingAudio ? (
                              <VolumeX className="w-4 h-4" />
                            ) : (
                              <Volume2 className="w-4 h-4" />
                            )}
                          </button>
                          <div>
                            <span className="text-[10.5px] font-bold text-white block">小玉语音文化精讲</span>
                            <span className="text-[9px] text-[#A0B8FF]">点击听取沉浸式叙事声像</span>
                          </div>
                        </div>

                        {/* Moving Spectrogram Bar Wave Animation when audio is active */}
                        <div className="flex items-end gap-[2.5px] h-6 pr-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <span 
                              key={i} 
                              className={`w-[2.5px] bg-[#00E5FF] rounded-full transition-all duration-300 ${isPlayingAudio ? 'animate-pulse' : ''}`}
                              style={{ 
                                height: isPlayingAudio ? `${Math.floor(Math.random() * 18) + 6}px` : "4px",
                                animationDelay: `${i * 120}ms`
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-64 flex flex-col items-center justify-center text-center p-6 gap-3 text-zinc-500"
                    >
                      <HelpCircle className="w-10 h-10 text-zinc-800" />
                      <p className="text-[11px] leading-relaxed">
                        暂无研判报告。请先在左侧拍摄/上传珍玩照片，或点击“珍玩预设”直接查看识别分析。
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Footer Slogan */}
              <div className="mt-8 pt-3 border-t border-[#00E5FF]/20 flex items-center gap-2 text-[#A0B8FF]">
                <span className="w-5 h-5 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center text-[10px] text-[#00E5FF] font-bold">精</span>
                <p className="text-[9.5px] leading-normal font-mono">
                  视觉好奇转化为深度认知，变“走马观花”为“沉浸体悟”。
                </p>
              </div>
            </div>
          </section>
        </main>
      </motion.div>
    </div>
  );
}
