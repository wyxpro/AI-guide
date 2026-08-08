"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  Radio,
  Minimize2
} from "lucide-react";
import { DigitalAvatar } from "@/components/ui/DigitalAvatar";

interface WeChatVoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatarName?: string;
  avatarStyle?: string;
  avatarImage?: string;
  spotName?: string;
  onSendMessage: (text: string) => Promise<void>;
  aiStreamingContent?: string;
  isAiThinking?: boolean;
  isAiSpeaking?: boolean;
}

export function WeChatVoiceCallModal({
  isOpen,
  onClose,
  avatarName = "Hiyori (Live2D)",
  avatarStyle = "live2d_Hiyori",
  avatarImage = "/sentio/characters/free/Hiyori/Hiyori.png",
  spotName = "清溪烟雨景区",
  onSendMessage,
  aiStreamingContent = "",
  isAiThinking = false,
  isAiSpeaking = false,
}: WeChatVoiceCallModalProps) {
  // Call Timer
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userTranscript, setUserTranscript] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronized refs to avoid stale closures in Web Speech API event callbacks
  const isOpenRef = useRef(isOpen);
  const isMutedRef = useRef(isMuted);
  const isAiSpeakingRef = useRef(isAiSpeaking);
  const isAiThinkingRef = useRef(isAiThinking);

  useEffect(() => {
    isOpenRef.current = isOpen;
    isMutedRef.current = isMuted;
    isAiSpeakingRef.current = isAiSpeaking;
    isAiThinkingRef.current = isAiThinking;
  }, [isOpen, isMuted, isAiSpeaking, isAiThinking]);

  // Call duration counter
  useEffect(() => {
    if (isOpen) {
      setCallDuration(0);
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      stopRecognition();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      stopRecognition();
    };
  }, [isOpen]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Speech Recognition Control
  const startRecognition = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setLiveTranscript("您的浏览器暂不支持实时语音识别，建议使用 Chrome / Edge");
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      const rec = new SR();
      recognitionRef.current = rec;
      rec.lang = "zh-CN";
      rec.continuous = true;
      rec.interimResults = true;

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (e: any) => {
        let fullText = "";
        for (let i = 0; i < e.results.length; ++i) {
          fullText += e.results[i][0].transcript;
        }
        const trimmed = fullText.trim();
        if (trimmed) {
          setLiveTranscript(trimmed);
          setUserTranscript(trimmed);

          // Auto-send silence timer: if user stops speaking for 1.8 seconds, automatically send question
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            handleSendCurrentSpeech();
          }, 1800);
        }
      };

      rec.onerror = (err: any) => {
        console.warn("Speech recognition error:", err);
      };

      rec.onend = () => {
        // Auto restart speech recognition if call is active and not speaking/thinking/muted
        if (
          isOpenRef.current &&
          !isMutedRef.current &&
          !isAiSpeakingRef.current &&
          !isAiThinkingRef.current
        ) {
          try {
            rec.start();
            return; // Maintain isListening state true during seamless restart
          } catch {}
        }
        setIsListening(false);
      };

      rec.start();
    } catch (err) {
      console.error("Failed to start speech recognition", err);
    }
  };

  const stopRecognition = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  // Auto start listening when call modal opens
  useEffect(() => {
    if (isOpen && !isMuted && !isAiSpeaking && !isAiThinking) {
      startRecognition();
    } else if (isAiSpeaking || isAiThinking || isMuted) {
      stopRecognition();
    }
  }, [isOpen, isMuted, isAiSpeaking, isAiThinking]);

  // Handle Send User Speech
  const handleSendCurrentSpeech = async () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    const textToSend = userTranscript.trim() || liveTranscript.trim();
    if (!textToSend) return;
    
    stopRecognition();
    setUserTranscript("");
    setLiveTranscript("");
    await onSendMessage(textToSend);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
    } else {
      setIsMuted(true);
      stopRecognition();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className="fixed inset-0 z-[200] flex flex-col justify-between p-4 md:p-6 text-[#E6EADF] font-sans select-none overflow-hidden"
        style={{
          background: "radial-gradient(circle at center, #152B20 0%, #070D09 100%)",
        }}
      >
        {/* Dynamic Background Ambient Glow Effects */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#10B981]/15 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#D2A053]/15 rounded-full blur-[110px] pointer-events-none z-0" />

        {/* ── Top Header Bar ── */}
        <header className="relative z-30 flex items-center justify-between pt-2 px-2 flex-shrink-0">
          <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs text-[#8F9F8F] shadow-md">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span className="font-mono font-bold text-white">{formatTimer(callDuration)}</span>
            <span className="text-[10px] text-emerald-400 font-mono">· StepAudio 2.5 Realtime</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`p-2.5 rounded-full border backdrop-blur-md transition-all active:scale-95 shadow-md ${
                isSpeakerOn
                  ? "bg-[#10B981]/20 border-[#10B981]/40 text-[#10B981]"
                  : "bg-white/5 border-white/10 text-zinc-400"
              }`}
            >
              {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-all active:scale-95 shadow-md"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ── Central Stage: Live2D Digital Avatar Perfectly Sized & Centered ── */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 py-2 my-auto overflow-hidden">
          
          {/* Sized & Proportionate Live2D Model Stage */}
          <div className="relative w-full max-w-sm h-[320px] sm:h-[360px] flex items-center justify-center my-auto pointer-events-none">
            
            {/* Concentric Ambient Aura Effect behind Avatar */}
            {(isListening || isAiSpeaking) && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <motion.div
                  animate={{
                    scale: [1, 1.18, 1],
                    opacity: [0.15, 0.35, 0.15],
                  }}
                  transition={{
                    duration: 5.0,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-72 h-72 md:w-96 md:h-96 rounded-full bg-[#10B981]/20 blur-2xl"
                />
              </div>
            )}

            {/* Scaled Live2D Avatar Frame - Clean & Unclipped */}
            <div className="scale-[0.78] sm:scale-[0.85] md:scale-[0.90] origin-center flex items-center justify-center">
              <DigitalAvatar
                state={
                  isAiSpeaking
                    ? "speaking"
                    : isAiThinking
                    ? "thinking"
                    : isListening
                    ? "happy"
                    : "idle"
                }
                size="hero"
                avatarStyle={avatarStyle || "live2d_Hiyori"}
              />
            </div>
          </div>

          {/* Real-time Soundwave Spectrum Bars */}
          <div className="flex items-center justify-center gap-1.5 h-7 mb-3 relative z-20">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => {
              const active = isListening || isAiSpeaking;
              return (
                <motion.span
                  key={bar}
                  animate={{
                    height: active
                      ? [`${Math.floor(Math.random() * 16) + 4}px`, `${Math.floor(Math.random() * 24) + 6}px`, `${Math.floor(Math.random() * 12) + 3}px`]
                      : "4px",
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.6,
                    delay: bar * 0.08,
                    ease: "easeInOut",
                  }}
                  className={`w-1 rounded-full transition-colors ${
                    isAiSpeaking
                      ? "bg-[#D2A053]"
                      : isListening
                      ? "bg-[#10B981]"
                      : "bg-white/20"
                  }`}
                />
              );
            })}
          </div>

          {/* Live Call Transcript / Status Box */}
          <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-2xl rounded-2xl p-4 min-h-[96px] flex flex-col justify-center items-center shadow-2xl relative z-20">
            {liveTranscript ? (
              <div className="space-y-1 text-left w-full animate-fade-in">
                <span className="text-[10px] font-bold text-[#10B981] tracking-widest uppercase block flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                  实时识别您的语音
                </span>
                <p className="text-sm font-semibold text-white leading-relaxed">
                  “{liveTranscript}”
                </p>
              </div>
            ) : (isAiThinking && !aiStreamingContent) ? (
              <div className="flex items-center gap-2 text-xs text-[#D2A053] font-bold animate-pulse">
                <Radio className="w-4 h-4 animate-spin" />
                <span>导览官正在智能思考并检索中...</span>
              </div>
            ) : aiStreamingContent ? (
              <div className="space-y-1 text-left w-full animate-fade-in">
                <span className="text-[10px] font-bold text-[#D2A053] tracking-widest uppercase block flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D2A053] animate-ping" />
                  🗣️ AI导游 实时回答中
                </span>
                <p className="text-sm font-semibold text-white leading-relaxed line-clamp-3">
                  {aiStreamingContent}
                </p>
              </div>
            ) : (
              <div className="space-y-0.5 text-center">
                <p className="text-xs font-bold text-emerald-400">
                  {isMuted ? "已静音麦克风" : "正在聆听中，请直接说话…"}
                </p>
                <p className="text-[11px] text-[#8F9F8F]">
                  随时提问“门票怎么买”、“景点的历史故事”
                </p>
              </div>
            )}
          </div>
        </main>

        {/* ── Bottom Call Action Control Bar (微信通话经典风格) ── */}
        <footer className="relative z-30 w-full max-w-md mx-auto pb-4 px-4 flex-shrink-0">
          <div className="flex items-center justify-around">
            {/* Mute Button */}
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={toggleMute}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 border shadow-lg ${
                  isMuted
                    ? "bg-red-500/20 border-red-500/40 text-red-400"
                    : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                }`}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              <span className="text-[11px] text-zinc-400 font-medium">
                {isMuted ? "取消静音" : "静音"}
              </span>
            </div>

            {/* Hangup Red Main Circle Button */}
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => {
                  stopRecognition();
                  onClose();
                }}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-[0_10px_25px_rgba(225,29,72,0.5)] transition-all active:scale-90 hover:brightness-110"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
              <span className="text-[11px] text-red-400 font-bold">挂断</span>
            </div>

            {/* Instant Send Speech Button */}
            <div className="flex flex-col items-center gap-1.5">
              <button
                disabled={!liveTranscript.trim() && !userTranscript.trim()}
                onClick={handleSendCurrentSpeech}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 border shadow-lg ${
                  liveTranscript.trim() || userTranscript.trim()
                    ? "bg-[#10B981] border-[#10B981] text-black shadow-emerald-950/40 cursor-pointer"
                    : "bg-white/5 border-white/10 text-zinc-600 cursor-not-allowed"
                }`}
              >
                <Send className="w-5 h-5 fill-current" />
              </button>
              <span className="text-[11px] text-zinc-400 font-medium">发送本句</span>
            </div>
          </div>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
}
