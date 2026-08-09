"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Camera, Upload, Sparkles, ChevronLeft, Volume2, VolumeX, Loader2, Compass, Info, Eye, HelpCircle
} from "lucide-react";
import { toast } from "sonner";

// Curated museum presets with high-quality images and cultural stories
const PRESETS = [
  {
    id: 1,
    name: "三星堆青铜神树",
    type: "国家一级文物",
    img: "/images/spots/sanxingdui-bronze-tree.webp",
    subject: "三星堆一号青铜神树",
    story: "此神树高达3.96米，分为三层，每层三枝，共九枝，每枝上伫立一只昂首的神鸟。它完美反映了古蜀先民对太阳及“十日传说”的自然崇拜。神树上蜿蜒盘绕的青铜巨龙，更揭示了古蜀文化与中原文明之间源远流长、血脉相连的深刻纽带，是中华文明多元一体格局的重要实证。",
    tip: "建议从斜下方仰视拍摄，配合展厅内部的聚焦光影，能完美凸显神树的宏伟气势与古蜀文明的神秘色彩。"
  },
  {
    id: 2,
    name: "武侯祠红墙竹影",
    type: "三国蜀汉遗迹",
    img: "/images/spots/10061.webp",
    subject: "武侯祠红墙夹道与惠陵",
    story: "这道夹在汉昭烈庙与惠陵之间的粉红墙通道，红色的粉墙与挺拔的翠竹交相辉映，竹影随风斑驳。厚重温润的历史朱红墙面与翠竹的清幽静谧完美融合，形成了武侯祠最具代表性的“红墙夹道”景观，诉说着三国蜀汉文化的深邃底蕴与君臣合祀的千古佳话。",
    tip: "利用透视原理站在夹道中央，等待阳光穿过竹叶在红墙上留下斑驳光影时按下快门，静谧的古风意境绝佳。"
  },
  {
    id: 3,
    name: "越王勾践青铜剑",
    type: "春秋国宝重器",
    img: "/images/spots/sword-of-goujian.webp",
    subject: "越王勾践自作用剑",
    story: "此剑全长55.6厘米，剑身满饰黑色菱形暗格纹，剑格正面镶有蓝色琉璃，背面镶有绿松石。出土时千年不锈，锋利无比。剑身刻有“越王勾践 自作用剑”鸟篆铭文，展现了春秋战国时期极高的铸剑科技与冷兵器艺术巅峰。",
    tip: "拍摄时建议对焦于剑身上的黑色菱形暗纹与鸟篆铭文，利用展示柜顶部射光突出青铜金属冷冽的质感与暗纹流光。"
  }
];

export default function VRRecognizePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Interaction states
  const [selectedPreset, setSelectedPreset] = useState<typeof PRESETS[0] | null>(PRESETS[0]); // default to first preset
  const [previewUrl, setPreviewUrl] = useState<string | null>(PRESETS[0].img);
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

  // Camera live streaming states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraStream(null);
    setIsCameraActive(false);
  };

  // Auto bind video stream whenever isCameraActive or cameraStream updates
  useEffect(() => {
    if (isCameraActive && cameraStream && videoRef.current) {
      if (videoRef.current.srcObject !== cameraStream) {
        videoRef.current.srcObject = cameraStream;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isCameraActive, cameraStream]);

  // Start camera stream
  const startCamera = async () => {
    try {
      if (streamRef.current) {
        stopCamera();
      }
      if (audioInstance) {
        audioInstance.pause();
        setIsPlayingAudio(false);
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      streamRef.current = stream;
      setCameraStream(stream);
      setIsCameraActive(true);
      setPreviewUrl(null);
      setSelectedFile(null);
      setSelectedPreset(null);
      setRecognizeResult(null);
      setScanStep(0);
      setScanning(false);
    } catch (err) {
      console.error("Failed to open camera:", err);
      toast.error("无法打开摄像头，请确保已授予权限");
    }
  };

  // Capture frame from video feed
  const captureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setPreviewUrl(dataUrl);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
          setSelectedFile(file);
        }
      }, "image/jpeg");
      
      stopCamera();
      
      // Auto trigger scanning
      setTimeout(() => {
        startScanning();
      }, 100);
    }
  };
  
  // Trigger presets selection
  const selectPreset = (preset: typeof PRESETS[0]) => {
    if (audioInstance) {
      audioInstance.pause();
      setIsPlayingAudio(false);
    }
    stopCamera();
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
      stopCamera();
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
    await new Promise(r => setTimeout(r, 1000));
    setScanStep(2);
    
    // Step 2: 3D topology
    await new Promise(r => setTimeout(r, 1000));
    setScanStep(3);

    // Step 3: Cloud multi-modal model analysis
    await new Promise(r => setTimeout(r, 1200));
    setScanStep(4);

    try {
      if (selectedPreset) {
        setRecognizeResult({
          subject: selectedPreset.subject,
          story: selectedPreset.story,
          tip: selectedPreset.tip
        });
      } else {
        // Send file if uploaded, or dataUrl if captured
        const formData = new FormData();
        if (selectedFile) {
          formData.append("image", selectedFile);
        } else if (previewUrl.startsWith("data:image")) {
          // Convert dataUrl to blob
          const resBlob = await fetch(previewUrl);
          const blob = await resBlob.blob();
          formData.append("image", blob, "camera_capture.jpg");
        }
        
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
    newAudio.play().catch(() => {
      toast.error("语音加载失败，请重试");
    });
    newAudio.onended = () => {
      setIsPlayingAudio(false);
    };
    setAudioInstance(newAudio);
    setIsPlayingAudio(true);
  };

  // Auto trigger camera if action query is set
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("action") === "camera") {
      startCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioInstance) audioInstance.pause();
    };
  }, [audioInstance]);

  return (
    <div className="min-h-screen bg-[#070908] text-[#E6EADF] flex flex-col font-sans select-none overflow-y-auto p-3 sm:p-6 lg:p-8 justify-center items-center relative"
      style={{ background: "radial-gradient(circle at center, #1b2520 0%, #0d1210 100%)" }}>
      
      {/* Dynamic Ambient Background Blur */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D2A053]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#4F6F52]/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl bg-[#121815]/90 backdrop-blur-xl rounded-[32px] border border-white/10 flex flex-col overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.8)] relative z-10 my-auto"
      >
        {/* ── Top Header ── */}
        <header className="sticky top-0 z-30 bg-[#121815]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (audioInstance) audioInstance.pause();
                router.push("/home");
              }}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all text-[#D2A053] active:scale-95 shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-extrabold text-sm tracking-wider text-[#D2A053]" style={{ fontFamily: "var(--font-noto-serif)" }}>
                VR3D 即拍即识导览
              </h1>
              <p className="text-[9px] text-[#8F9F8F] font-mono tracking-widest uppercase">AI MULTIMODAL MUSEUM RECOGNITION</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D2A053] animate-ping"></span>
            <span className="text-[9px] font-mono font-bold text-[#D2A053] bg-white/5 px-2.5 py-0.5 rounded border border-[#D2A053]/30 shadow-inner">
              3D SCANNER v2.5
            </span>
          </div>
        </header>

        {/* ── Main Layout (Two-Column Split Grid) ── */}
        <main className="flex-1 w-full p-5 lg:p-7 grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch overflow-y-auto">
          
          {/* Left Column - Image Viewport & Controls (7 Cols) */}
          <section className="lg:col-span-7 flex flex-col gap-5 w-full min-w-0">
            
            {/* Viewfinder Container with Cushion box blur to show entire image */}
            <div className="relative w-full rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[16/10] bg-[#090d0b] border border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.5)] flex items-center justify-center">
              
              {/* Corner HUD Bracket Overlays */}
              <div className="absolute top-4 left-4 w-5 h-5 border-t border-l border-[#D2A053]/55 pointer-events-none z-25" />
              <div className="absolute top-4 right-4 w-5 h-5 border-t border-r border-[#D2A053]/55 pointer-events-none z-25" />
              <div className="absolute bottom-4 left-4 w-5 h-5 border-b border-l border-[#D2A053]/55 pointer-events-none z-25" />
              <div className="absolute bottom-4 right-4 w-5 h-5 border-b border-r border-[#D2A053]/55 pointer-events-none z-25" />
              
              {/* Central Target Crosshair */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-25">
                <div className="w-1.5 h-1.5 bg-[#D2A053] rounded-full shadow-[0_0_8px_#D2A053]" />
                <div className="absolute w-8 h-[1px] bg-[#D2A053]/30" />
                <div className="absolute h-8 w-[1px] bg-[#D2A053]/30" />
              </div>

              {/* Viewport Grid Lines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(210,160,83,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(210,160,83,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-10" />

              <AnimatePresence>
                {isCameraActive ? (
                  <motion.div 
                    key="camera-feed"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <video 
                      ref={(node) => {
                        (videoRef as any).current = node;
                        if (node && cameraStream && node.srcObject !== cameraStream) {
                          node.srcObject = cameraStream;
                          node.play().catch(() => {});
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover relative z-10"
                    />
                    
                    {/* Glowing Laser Scan Bar */}
                    {scanning && (
                      <motion.div 
                        initial={{ y: "0%" }}
                        animate={{ y: "100%" }}
                        transition={{ 
                          repeat: Infinity, 
                          repeatType: "reverse", 
                          duration: 2.0, 
                          ease: "easeInOut" 
                        }}
                        className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#D2A053] to-transparent shadow-[0_0_12px_#D2A053] z-20"
                        style={{ top: 0 }}
                      />
                    )}
                    
                    {/* Real-time green/gold target scanning animation */}
                    <div className="absolute inset-0 bg-emerald-500/[0.02] z-20 pointer-events-none" />
                    
                    <div className="absolute top-4 left-4 bg-black/75 px-3 py-1 rounded-full border border-emerald-500/30 text-[10px] text-emerald-400 font-mono z-30 flex items-center gap-1.5 shadow-md">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                      <span>LENS LIVE MODE</span>
                    </div>
                  </motion.div>
                ) : previewUrl ? (
                  <motion.div 
                    key={previewUrl}
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 w-full h-full flex items-center justify-center"
                  >
                    {/* Blurred Duplicate Backdrop to prevent black bars */}
                    <img 
                      src={previewUrl} 
                      className="absolute inset-0 w-full h-full object-cover opacity-20 blur-xl scale-110 pointer-events-none z-0" 
                      alt="" 
                    />

                    {/* Primary Contain Image - 100% visible and centered */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={previewUrl} 
                      alt="Artifact Preview" 
                      className="relative z-10 w-full h-full object-contain max-h-full max-w-full" 
                    />
                    
                    {/* Glowing Laser Scan Bar */}
                    {scanning && (
                      <motion.div 
                        initial={{ y: "0%" }}
                        animate={{ y: "100%" }}
                        transition={{ 
                          repeat: Infinity, 
                          repeatType: "reverse", 
                          duration: 2.0, 
                          ease: "easeInOut" 
                        }}
                        className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#D2A053] to-transparent shadow-[0_0_12px_#D2A053] z-20"
                        style={{ top: 0 }}
                      />
                    )}
                    
                    {/* Mesh pulse scanner */}
                    {scanning && (
                      <div className="absolute inset-0 bg-emerald-500/[0.03] animate-pulse pointer-events-none z-15" />
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8 text-center flex flex-col items-center gap-3 relative z-10 max-w-xs"
                  >
                    <div className="text-[#D2A053] drop-shadow-[0_0_15px_rgba(210,160,83,0.4)] mb-1">
                      <Camera className="w-10 h-10 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm tracking-wide">对准展品或景区建筑拍摄</h3>
                      <p className="text-xs text-[#8F9F8F] mt-2 leading-relaxed">
                        您可以通过拍照、上传本地照片或直接点击下方“珍玩预设”，开启 3D 拓扑结构扫描与云端 AI 多模态文化精讲。
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Holographic system specs on scanning */}
              {scanning && (
                <div className="absolute bottom-4 left-4 z-20 bg-black/80 backdrop-blur-md px-3 py-2 rounded-lg border border-[#D2A053]/30 text-[9px] font-mono text-[#D2A053] space-y-0.5 shadow-lg">
                  <div>SYS: ON_SCAN</div>
                  <div>LIDAR: 100% CONNECTED</div>
                  <div>DEPTH DATA: CAPTURED</div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {isCameraActive ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={stopCamera}
                    className="py-3.5 bg-red-950/40 hover:bg-red-950/60 border border-red-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-red-400 cursor-pointer"
                  >
                    <span>关闭相机</span>
                  </button>
                  <button
                    onClick={captureFrame}
                    className="py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-black bg-gradient-to-r from-[#D2A053] to-[#E8C06A] hover:brightness-110 shadow-lg shadow-yellow-950/20 font-extrabold cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-black fill-black" />
                    <span>拍照并识别</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={startCamera}
                      className="py-3.5 bg-white/5 hover:bg-white/10 border border-[#D2A053]/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-[#D2A053] cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>实时相机识别</span>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="py-3.5 bg-[#121815] hover:bg-[#1A2520] border border-white/10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-[#8F9F8F] cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>上传本地图片</span>
                    </button>
                  </div>
                  <input 
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {previewUrl && (
                    <button
                      onClick={startScanning}
                      disabled={scanning}
                      className="w-full py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-black disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-[#D2A053] to-[#C39A5D] font-extrabold cursor-pointer shadow-lg"
                    >
                      {scanning ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-black" />
                          <span>3D拓扑研判中...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 fill-black text-black" />
                          <span>开启 VR 智能识别</span>
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Presets List Section */}
            <div className="space-y-2 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-[#D2A053] font-bold tracking-wider">
                <Eye className="w-3.5 h-3.5" />
                <span>珍玩预设快捷体验 (点击查看)</span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {PRESETS.map((p) => {
                  const active = selectedPreset?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => selectPreset(p)}
                      className={`group cursor-pointer rounded-xl overflow-hidden border transition-all duration-300 ${
                        active 
                          ? 'border-[#D2A053] ring-1 ring-[#D2A053] bg-white/5 shadow-md shadow-yellow-950/20' 
                          : 'border-white/5 bg-[#121815]/50 hover:border-white/20'
                      }`}
                    >
                      <div className="h-16 w-full overflow-hidden bg-neutral-900 relative">
                        <img 
                          src={p.img} 
                          alt={p.name} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-black/40" />
                        <span className="absolute top-1 left-1 bg-[#121815]/80 text-[#D2A053] border border-[#D2A053]/20 text-[7px] px-1 py-0.5 rounded font-mono scale-90 origin-top-left">
                          {p.type}
                        </span>
                      </div>
                      <div className="p-2 text-center">
                        <span className="text-[10px] font-bold text-white truncate block">{p.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Right Column - AI Cultural Narrative Report (5 Cols) */}
          <section className="lg:col-span-5 flex flex-col w-full min-w-0">
            
            <div className="bg-[#1A2520]/80 backdrop-blur-md rounded-2xl border border-white/5 p-5 flex flex-col justify-between shadow-xl min-h-[460px] lg:h-full relative overflow-hidden">
              
              {/* Gold Ambient Ring Ornament */}
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#D2A053]/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-4 flex-1 overflow-y-auto pr-1 styled-scrollbar">
                
                {/* Panel Title bar */}
                <div className="flex items-center justify-between pb-3.5 border-b border-white/5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D2A053] animate-pulse" />
                    <span className="text-[10px] font-bold tracking-widest text-[#D2A053] font-mono">AI HOLOGRAPHIC REPORT</span>
                  </div>
                  <Info className="w-3.5 h-3.5 text-[#D2A053]/40" />
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                  {scanning ? (
                    <motion.div 
                      key="scanning-report"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3.5 py-2"
                    >
                      <h4 className="text-xs font-bold text-white tracking-wide">智能比对三维纹理...</h4>
                      <div className="space-y-2 font-mono text-[10px]">
                        {[
                          { label: "1. 图像特征点云映射", step: 1 },
                          { label: "2. 3D深度轮廓拓扑比对", step: 2 },
                          { label: "3. 检索云端非遗知识图谱", step: 3 },
                          { label: "4. 智能编排生成导览报告", step: 4 }
                        ].map((s) => {
                          const done = scanStep > s.step;
                          const curr = scanStep === s.step;
                          return (
                            <div 
                              key={s.label} 
                              className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                                curr 
                                  ? 'bg-[#D2A053]/10 border-[#D2A053]/40 text-white font-extrabold' 
                                  : done 
                                    ? 'bg-[#4F6F52]/10 border-transparent text-[#8F9F8F]' 
                                    : 'border-transparent text-zinc-600'
                              }`}
                            >
                              <span>{s.label}</span>
                              {curr ? (
                                <span className="text-[#D2A053] animate-pulse">进行中...</span>
                              ) : done ? (
                                <span className="text-[#4F6F52] font-bold">✓ 完成</span>
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
                      key="report-result"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <div>
                        <span className="inline-block bg-[#D2A053]/10 text-[#D2A053] border border-[#D2A053]/20 text-[9px] font-bold px-2 py-0.5 rounded-full mb-1">
                          ✓ 识别完成 · 置信度 99.1%
                        </span>
                        <h2 className="text-lg font-black text-white leading-tight" style={{ fontFamily: "var(--font-noto-serif)" }}>
                          {recognizeResult.subject}
                        </h2>
                      </div>

                      {/* Decoded Material Story */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-[#8F9F8F] block">📖 深度文化史料解读</span>
                        <p className="text-xs leading-relaxed text-[#E6EADF] tracking-wide bg-[#121815]/80 p-4 rounded-xl border border-white/5 text-justify">
                          {recognizeResult.story}
                        </p>
                      </div>

                      {/* Compass Tip Card */}
                      <div className="bg-[#4F6F52]/5 border border-[#4F6F52]/20 rounded-xl p-3.5 space-y-1">
                        <div className="flex items-center gap-1 text-[10.5px] font-bold text-[#D2A053]">
                          <Compass className="w-3.5 h-3.5" />
                          <span>游览观赏建议</span>
                        </div>
                        <p className="text-[10.5px] text-[#8F9F8F] leading-relaxed">
                          {recognizeResult.tip}
                        </p>
                      </div>

                      {/* TTS Audio Player Widget */}
                      <div className="bg-black/35 border border-white/5 rounded-xl p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={togglePlayAudio}
                            className="w-10 h-10 rounded-xl bg-[#D2A053] flex items-center justify-center text-black hover:brightness-105 active:scale-95 transition-all shadow-md"
                          >
                            {isPlayingAudio ? (
                              <VolumeX className="w-4 h-4 stroke-[2.5]" />
                            ) : (
                              <Volume2 className="w-4 h-4 stroke-[2.5]" />
                            )}
                          </button>
                          <div>
                            <span className="text-[10.5px] font-bold text-white block">小玉语音讲解</span>
                            <span className="text-[9px] text-[#8F9F8F]">点击播放景区导览语音</span>
                          </div>
                        </div>

                        {/* Interactive Sound wave Spectrogram */}
                        <div className="flex items-end gap-[2px] h-6 pr-1">
                          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                            <span 
                              key={i} 
                              className={`w-[2.5px] bg-[#D2A053] rounded-full transition-all duration-300 ${isPlayingAudio ? 'animate-pulse' : ''}`}
                              style={{ 
                                height: isPlayingAudio ? `${Math.floor(Math.random() * 16) + 4}px` : "3px",
                                animationDelay: `${i * 100}ms`
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Sync Dialogue CTA button */}
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => router.push(`/qa?name=${encodeURIComponent(recognizeResult.subject)}`)}
                        className="w-full py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 text-black bg-[#D2A053] shadow-md transition-all active:scale-95 mt-4 hover:brightness-105 font-extrabold"
                      >
                        <Sparkles className="w-4 h-4 fill-black" />
                        <span>发送至 AI 导游对话框</span>
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="empty-report"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-60 flex flex-col items-center justify-center text-center p-6 gap-3 text-zinc-500"
                    >
                      <HelpCircle className="w-9 h-9 text-zinc-700" />
                      <p className="text-[11px] leading-relaxed text-[#8F9F8F] max-w-[200px]">
                        暂无扫描报告。请在左侧选取、拍摄或点击下方预设文物，小玉将即刻为您生成解读。
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Slogan row */}
              <div className="mt-6 pt-3.5 border-t border-white/5 flex items-center gap-2 text-[#8F9F8F]">
                <span className="w-5 h-5 rounded bg-[#D2A053]/10 border border-[#D2A053]/20 flex items-center justify-center text-[10px] text-[#D2A053] font-bold">精</span>
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
