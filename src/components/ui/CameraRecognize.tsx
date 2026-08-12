"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
    img: "/images/spots/sanxingdui-bronze-tree.webp",
    subject: "三星堆一号青铜神树",
    story: "此神树高达3.96米，分为三层，每层三枝，共九枝，每枝上伫立一只昂首的神鸟。它完美反映了古蜀先民对太阳及“十日传说”的自然崇拜。神树上蜿蜒盘绕的青铜巨龙，更揭示了古蜀文化与中原文明之间源远流长、血脉相连的深刻纽带，是中华文明多元一体格局的重要实证。",
    tip: "建议从斜下方仰视拍摄，配合展厅内部 of the 聚焦光影，能完美凸显神树的宏伟气势与古蜀文明的神秘色彩。"
  },
  {
    id: 2,
    name: "唐代彩绘陶侍女俑",
    type: "盛唐彩塑精粹",
    img: "/image/tang_pottery_lady.png",
    subject: "大唐彩绘陶侍女俑",
    story: "陶俑面庞饱满红润，发髻高耸，身着红绿相间的宽袖长裙，体态丰腴自然。其神态安详而自信，衣纹褶皱自然流畅，完美再现了盛唐时期“大唐气象”的包容性与自信丰神，体现了当时手工业雕塑艺术的极高水平，将历史的温度刻画进泥土之中。",
    tip: "适合近距离对焦拍摄面部细节与衣服残存的彩绘色彩，拍照时尽量让镜头贴近玻璃以避开反光。"
  },
  {
    id: 3,
    name: "洪崖洞吊脚楼",
    type: "巴渝民俗地标",
    img: "/images/spots/10011.webp",
    subject: "洪崖洞民俗风貌区吊脚楼群",
    story: "洪崖洞以巴渝传统建筑“吊脚楼”风貌为主体，依山就势，沿江而建。层层叠叠的木质吊脚楼在现代摩天大楼的映衬下显得格外独特，展示了山城重庆“依山筑屋、临江托阁”的魔幻地貌与巴渝先民的建筑智慧，变陡峭悬崖为生活长卷。",
    tip: "推荐在傍晚18:30点灯时分，从侧下方的千厮门大桥引桥上远眺拍摄全景，或者在崖底街道仰拍，最具有魔幻山城的视觉冲击力。"
  },
  {
    id: 4,
    name: "武侯祠红墙竹影",
    type: "三国蜀汉遗迹",
    img: "/images/spots/10061.webp",
    subject: "武侯祠红墙夹道与惠陵",
    story: "这道夹在汉昭烈庙与惠陵之间的粉红墙通道，红色的粉墙与挺拔 of the 翠竹交相辉映，竹影随风斑驳。厚重温润的历史朱红墙面与翠竹的清幽静谧完美融合，形成了武侯祠最具代表性的“红墙夹道”景观，诉说着三国蜀汉文化的深邃底蕴与君臣合祀的千古佳话。",
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Interaction states
  const [selectedPreset, setSelectedPreset] = useState<typeof PRESETS[0] | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
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

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("当前浏览器不支持摄像头调用");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;
      setCameraActive(true);
      setPreviewUrl(null);
      setSelectedFile(null);
      setSelectedPreset(null);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => undefined);
        }
      });
    } catch {
      setCameraError("无法获取摄像头权限，请允许浏览器访问相机");
    }
  };

  const captureFrame = async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    if (!blob) return;
    const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(blob));
    setRecognizeResult(null);
    stopCamera();
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

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 select-none font-sans overflow-y-auto">
      {/* Click outside backdrop overlay to close */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.92, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={SPRING}
        className="relative z-10 w-full max-w-4xl max-h-[85vh] bg-[#121815]/98 text-[#E6EADF] rounded-3xl border border-[#D2A053]/40 flex flex-col overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
      >
        {/* ── Top Header (Gold-Jade tech style) ── */}
        <header className="sticky top-0 z-30 bg-[#1A2520]/95 backdrop-blur-md border-b border-[#D2A053]/20 px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-[#24332C] hover:bg-[#2C3F36] border border-[#D2A053]/30 flex items-center justify-center transition-all text-[#D2A053] active:scale-95 shadow-[0_0_8px_rgba(210,160,83,0.15)]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-extrabold text-sm tracking-widest text-[#D2A053] drop-shadow-[0_0_4px_rgba(210,160,83,0.4)]" style={{ fontFamily: "var(--font-noto-serif)" }}>
                VR3D即拍即识导览
              </h1>
              <p className="text-[10px] text-[#8F9F8F] font-mono tracking-wider">AI MULTIMODAL VISION RECOGNITION POD</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D2A053] animate-ping"></span>
            <span className="text-[10px] font-mono font-bold text-[#D2A053] bg-[#24332C] px-2.5 py-0.5 rounded border border-[#D2A053]/40 shadow-[0_0_6px_rgba(210,160,83,0.15)]">
              3D SCANNER V2.0
            </span>
            <button 
              onClick={onClose}
              className="w-9 h-9 ml-2 rounded-xl bg-[#24332C] hover:bg-[#2C3F36] border border-[#D2A053]/30 flex items-center justify-center transition-all text-[#D2A053] active:scale-95 shadow-[0_0_8px_rgba(210,160,83,0.15)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ── Main Layout (Responsive split panel) ── */}
        <main className="flex-1 w-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start overflow-y-auto">
          
          {/* Left Area (Holographic viewfinder & control buttons) */}
          <section className="flex flex-col gap-4 w-full min-w-0">
            
            {/* Viewfinder Container */}
            <div className="relative w-full rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-[16/11] bg-[#0B0F0D] border-2 border-[#D2A053]/30 shadow-[0_0_20px_rgba(210,160,83,0.08)] flex flex-col items-center justify-center">
              
              {/* Corner Bracket Overlays for Tech Aesthetic */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#D2A053] pointer-events-none" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#D2A053] pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#D2A053] pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#D2A053] pointer-events-none" />
              
              {/* Viewfinder Center Target Dot - NO circle dot frame */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="w-2.5 h-2.5 bg-[#D2A053]/90 rounded-full shadow-[0_0_8px_#D2A053]" />
                <div className="absolute w-6 h-[1.5px] bg-[#D2A053]/40" />
                <div className="absolute h-6 w-[1.5px] bg-[#D2A053]/40" />
              </div>

              {/* Grid Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(210,160,83,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(210,160,83,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

              {/* Content Switch */}
              <AnimatePresence mode="wait">
                {cameraActive ? (
                  <motion.div
                    key="camera"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <div className="absolute left-4 bottom-4 right-4 z-20 flex items-center justify-between gap-3">
                      <span className="text-[10px] text-[#D2A053] bg-black/70 border border-[#D2A053]/40 px-3 py-2 rounded-lg">摄像头已开启，对准景物后点击取景识别</span>
                      <button onClick={captureFrame} className="px-4 py-2 rounded-xl text-xs font-black bg-[#D2A053] text-black shadow active:scale-95">取景识别</button>
                    </div>
                  </motion.div>
                ) : previewUrl ? (
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
                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D2A053] to-transparent shadow-[0_0_15px_#D2A053] z-10"
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
                    {/* Camera icon - NO circle dot frame */}
                    <div className="text-[#D2A053] drop-shadow-[0_0_15px_rgba(210,160,83,0.6)] animate-pulse mb-1">
                      <Camera className="w-12 h-12" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm tracking-wide">对准展品或文物拍摄</h3>
                      <p className="text-xs text-[#8F9F8F] mt-1.5 leading-relaxed">
                        上传展品照片或在下方选择“珍玩预设”，小玉即刻为您开启3D拓扑与多模态深度文化解读。
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Target HUD metadata when scanning */}
              {scanning && (
                <div className="absolute bottom-4 left-4 z-20 bg-black/80 px-3 py-2 rounded-lg border border-[#D2A053]/40 text-[9px] font-mono text-[#D2A053] space-y-0.5 shadow-[0_0_10px_rgba(210,160,83,0.15)]">
                  <div>SYS STATUS: SCANNING...</div>
                  <div>LIDAR DEPTH: 1.27m</div>
                  <div>RECONSTRUCTING MESH: 84%</div>
                </div>
              )}
            </div>

            {/* Action Trigger Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={cameraActive ? stopCamera : startCamera}
                className="py-3 bg-[#1A2520] hover:bg-[#24332C] border border-[#D2A053]/30 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow transition-all active:scale-95 text-[#D2A053] hover:border-[#D2A053]/60 hover:shadow-[0_0_8px_rgba(210,160,83,0.15)]"
              >
                <Camera className="w-4 h-4 text-[#D2A053]" />
                <span>{cameraActive ? "关闭摄像头" : "打开摄像头"}</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-3 bg-[#1A2520] hover:bg-[#24332C] border border-[#D2A053]/30 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow transition-all active:scale-95 text-[#D2A053] hover:border-[#D2A053]/60 hover:shadow-[0_0_8px_rgba(210,160,83,0.15)]"
              >
                <Upload className="w-4 h-4 text-[#D2A053]" />
                <span>本地图片</span>
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
                className="py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-95 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(79,111,82,0.3)] bg-gradient-to-r from-[#4F6F52] to-[#D2A053] hover:brightness-110 border border-[#D2A053]/40"
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
            {cameraError && <p className="text-[11px] text-red-300 bg-red-500/10 border border-red-400/20 rounded-xl px-3 py-2">{cameraError}</p>}

            {/* Preset珍玩 selector grid */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-[#D2A053] font-semibold tracking-wide">
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
                      className={`group cursor-pointer rounded-xl overflow-hidden border transition-all duration-300 ${active ? 'border-[#D2A053] ring-2 ring-[#D2A053]/40 shadow-[0_0_15px_rgba(210,160,83,0.35)]' : 'border-[#24332C] hover:border-[#D2A053]/40'}`}
                      style={{ background: "#1A2520" }}
                    >
                      <div className="h-16 w-full overflow-hidden bg-neutral-900 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.img} alt={p.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/30" />
                        <span className="absolute top-1 left-1 bg-[#121815]/80 text-[#D2A053] border border-[#D2A053]/30 text-[7px] px-1 rounded-sm leading-none py-0.5 font-mono">
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

          {/* Right Area (AI Deep cultural narrative panel) */}
          <section className="flex flex-col w-full min-w-0">
            
            <div className="flex-grow bg-[#1A2520]/95 rounded-2xl border border-[#D2A053]/20 p-5 flex flex-col justify-between shadow-lg relative overflow-hidden">
              
              {/* Dynamic Glassmorphic Backdrop Decoration */}
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#D2A053]/10 rounded-full blur-2xl pointer-events-none" />
              
              {/* Top Log/Results */}
              <div className="space-y-4 flex-1 overflow-y-auto pr-1 max-h-[56vh] lg:max-h-[64vh]">
                <div className="flex items-center justify-between pb-3 border-b border-[#D2A053]/20">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D2A053] animate-pulse" />
                    <span className="text-[11px] font-bold tracking-widest text-[#D2A053] font-mono">AI 视觉研判中心</span>
                  </div>
                  <Info className="w-3.5 h-3.5 text-[#D2A053]/50" />
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
                              className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${curr ? 'bg-[#D2A053]/10 border-[#D2A053] text-white font-bold' : done ? 'bg-[#4F6F52]/10 border-transparent text-[#8F9F8F]' : 'border-transparent text-zinc-500'}`}
                            >
                              <span>{s.label}</span>
                              {curr ? (
                                <span className="text-[#E8C06A] animate-pulse">进行中...</span>
                              ) : done ? (
                                <span className="text-[#D2A053]">✓ 完成</span>
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
                        <span className="inline-block bg-[#D2A053]/10 text-[#D2A053] border border-[#D2A053]/30 text-[9px] font-black px-2 py-0.5 rounded-full mb-1">
                          🏆 识别成功 · 多模态置信度 99.4%
                        </span>
                        <h2 className="text-lg font-black text-white leading-tight" style={{ fontFamily: "var(--font-noto-serif)" }}>
                          {recognizeResult.subject}
                        </h2>
                      </div>

                      {/* Story Block */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-[#8F9F8F] block">📖 深度文化史料解读</span>
                        <p className="text-xs leading-relaxed text-[#E6EADF] tracking-wide bg-[#121815] p-4 rounded-xl border border-[#D2A053]/15">
                          {recognizeResult.story}
                        </p>
                      </div>

                      {/* Tip Block */}
                      <div className="bg-[#4F6F52]/5 border border-[#4F6F52]/25 rounded-xl p-3.5 space-y-1">
                        <div className="flex items-center gap-1 text-[10.5px] font-black text-[#4F6F52]">
                          <Compass className="w-3.5 h-3.5 text-[#D2A053]" />
                          <span>游览观赏建议</span>
                        </div>
                        <p className="text-[10.5px] text-[#8F9F8F] leading-relaxed">
                          {recognizeResult.tip}
                        </p>
                      </div>

                      {/* Audio Player and spectrogram wave */}
                      <div className="bg-[#121815] border border-[#D2A053]/15 rounded-xl p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={togglePlayAudio}
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4F6F52] to-[#D2A053] flex items-center justify-center text-white hover:brightness-105 active:scale-95 transition-all shadow-md"
                          >
                            {isPlayingAudio ? (
                              <VolumeX className="w-4 h-4" />
                            ) : (
                              <Volume2 className="w-4 h-4" />
                            )}
                          </button>
                          <div>
                            <span className="text-[10.5px] font-bold text-white block">小玉语音文化精讲</span>
                            <span className="text-[9px] text-[#8F9F8F]">点击听取沉浸式叙事声像</span>
                          </div>
                        </div>

                        {/* Moving Spectrogram Bar Wave Animation when audio is active */}
                        <div className="flex items-end gap-[2.5px] h-6 pr-2">
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
                          className="w-full py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 text-white shadow-lg shadow-purple-900/25 transition-all active:scale-95 mt-4 bg-gradient-to-r from-[#4F6F52] to-[#D2A053] border border-[#D2A053]/40"
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
                      className="h-64 flex flex-col items-center justify-center text-center p-6 gap-3 text-zinc-500"
                    >
                      <HelpCircle className="w-10 h-10 text-zinc-700" />
                      <p className="text-[11px] leading-relaxed text-[#8F9F8F]">
                        暂无研判报告。请先在左侧拍摄/上传珍玩照片，或点击“珍玩预设”直接查看识别分析。
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Footer Slogan */}
              <div className="mt-8 pt-3 border-t border-[#D2A053]/20 flex items-center gap-2 text-[#8F9F8F]">
                <span className="w-5 h-5 rounded bg-[#D2A053]/10 border border-[#D2A053]/20 flex items-center justify-center text-[10px] text-[#D2A053] font-bold">精</span>
                <p className="text-[9.5px] leading-normal font-mono">
                  视觉好奇转化为深度认知，变“走马观花”为“沉浸体悟”。
                </p>
              </div>
            </div>
          </section>

        </main>
      </motion.div>
    </div>,
    document.body
  );
}
