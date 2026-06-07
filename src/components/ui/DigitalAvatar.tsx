"use client";
import { useState, useEffect, useRef, useId } from "react";
import { motion } from "framer-motion";

export type AvatarState = "idle" | "thinking" | "speaking" | "happy" | "concerned";

interface Props {
  state: AvatarState;
  size?: "sm" | "md" | "lg" | "hero" | "desktop-hero";
  audioElement?: HTMLAudioElement | null; // Pass TTS audio element for lip-sync
  avatarStyle?: string; // Links configured style
}

const PALETTE: Record<AvatarState, {
  skin: string; shadow: string; robeTop: string; robeBot: string;
  aura: string; pupil: string; lipFill: string; ring: string;
}> = {
  idle:      { skin: "#F5E6D0", shadow: "#D4A882", robeTop: "#4F6F52", robeBot: "#3A5240", aura: "rgba(79,111,82,0.18)",   pupil: "#2B3530", lipFill: "#C98B6A", ring: "rgba(79,111,82,0.5)"   },
  thinking:  { skin: "#F5E6D0", shadow: "#D4A882", robeTop: "#7A6040", robeBot: "#5A4530", aura: "rgba(210,160,83,0.22)", pupil: "#3A2B10", lipFill: "#C98B6A", ring: "rgba(210,160,83,0.5)"  },
  speaking:  { skin: "#FAECD8", shadow: "#E0B088", robeTop: "#D2A053", robeBot: "#A07030", aura: "rgba(210,160,83,0.35)", pupil: "#2B3530", lipFill: "#D07050", ring: "rgba(210,160,83,0.75)" },
  happy:     { skin: "#FAEEDD", shadow: "#E5B890", robeTop: "#5A8F5A", robeBot: "#3A6A3A", aura: "rgba(90,143,90,0.28)",  pupil: "#1A3A1A", lipFill: "#C86050", ring: "rgba(90,143,90,0.6)"   },
  concerned: { skin: "#F0E0CC", shadow: "#C8926A", robeTop: "#7A5548", robeBot: "#5A3A30", aura: "rgba(180,100,80,0.22)", pupil: "#3A1A0A", lipFill: "#B87060", ring: "rgba(180,100,80,0.5)"  },
};

function getMouthPath(state: AvatarState, open: boolean): string {
  if (state === "happy")    return open ? "M 43 72 Q 50 82 57 72" : "M 43 70 Q 50 77 57 70";
  if (state === "concerned") return "M 45 73 Q 50 69 55 73";
  if (state === "speaking") return open ? "M 44 71 Q 50 80 56 71" : "M 45 70 Q 50 74 55 70";
  return "M 45 70 Q 50 74 55 70";
}

function getEyebrows(state: AvatarState) {
  if (state === "concerned") return { L: "M 36 42 Q 42 39 44 41", R: "M 56 41 Q 58 39 64 42" };
  if (state === "happy")     return { L: "M 36 41 Q 42 37 44 39", R: "M 56 39 Q 58 37 64 41" };
  if (state === "thinking")  return { L: "M 36 42 Q 41 40 44 42", R: "M 56 40 Q 59 38 64 41" };
  return { L: "M 36 43 Q 42 40 44 42", R: "M 56 42 Q 58 40 64 43" };
}

function AvatarSVG({ state, mouthOpen, mouthPathOverride, avatarStyle, idSuffix }: { state: AvatarState; mouthOpen: boolean; mouthPathOverride?: string; avatarStyle?: string; idSuffix: string }) {
  const p = PALETTE[state];
  const eb = getEyebrows(state);
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 110);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(id);
  }, []);

  const eyeH = blink ? 0.4 : state === "happy" ? 3 : 4.5;

  let robeTop = p.robeTop;
  let robeBot = p.robeBot;
  let hasGlasses = false;

  if (avatarStyle === "female_hanfu") {
    robeTop = "#4F6F52";
    robeBot = "#3A5240";
  } else if (avatarStyle === "female_student") {
    robeTop = "#FCE4EC";
    robeBot = "#E91E63";
  } else if (avatarStyle === "female_business") {
    robeTop = "#2B3E50";
    robeBot = "#1A252F";
    hasGlasses = true;
  } else if (avatarStyle === "female_anchor") {
    robeTop = "#8E44AD";
    robeBot = "#5B2C6F";
  } else if (avatarStyle === "female_princess") {
    robeTop = "#E74C3C";
    robeBot = "#78281F";
  } else if (avatarStyle === "male_scholar") {
    robeTop = "#A3E4D7";
    robeBot = "#117864";
  } else if (avatarStyle === "male_student") {
    robeTop = "#F1C40F";
    robeBot = "#D68910";
  } else if (avatarStyle === "male_business") {
    robeTop = "#BDC3C7";
    robeBot = "#7F8C8D";
    hasGlasses = true;
  } else if (avatarStyle === "male_anchor") {
    robeTop = "#1ABC9C";
    robeBot = "#117864";
  } else if (avatarStyle === "male_cool") {
    robeTop = "#34495E";
    robeBot = "#1C2833";
  } else if (avatarStyle === "modern") {
    robeTop = "#4A6984";
    robeBot = "#2C3E50";
  } else if (avatarStyle === "ancient") {
    robeTop = "#A94A42";
    robeBot = "#6B2A25";
  } else if (avatarStyle === "cartoon") {
    robeTop = "#E29E4A";
    robeBot = "#B86B1E";
  }

  const isMale = avatarStyle?.startsWith("male_");

  const gradientId = `rg-${state}-${avatarStyle || "default"}-${idSuffix}`;
  const skinGradientId = `sg-${state}-${idSuffix}`;

  return (
    <svg viewBox="0 0 100 120" width="100%" height="100%" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id={skinGradientId} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={p.skin} />
          <stop offset="100%" stopColor={p.shadow} />
        </radialGradient>
        <radialGradient id={gradientId} cx="50%" cy="0%" r="100%">
          <stop offset="0%" stopColor={robeTop} />
          <stop offset="100%" stopColor={robeBot} />
        </radialGradient>
        <filter id="ds">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Aura rings */}
      {[0, 1, 2].map((i) => (
        <motion.circle key={i} cx="50" cy="56" fill="none" stroke={p.aura} strokeWidth="0.5"
          initial={{ r: 42 + i * 10, opacity: 0 }}
          animate={{ r: [42 + i * 10, 62 + i * 12], opacity: [0.55, 0] }}
          transition={{ duration: 2.6, delay: i * 0.75, repeat: Infinity, ease: "easeOut" }} />
      ))}

      {/* Floating particles (speaking/happy) */}
      {(state === "speaking" || state === "happy") && [0, 1, 2, 3].map((i) => (
        <motion.circle key={i} cx={36 + i * 9} r={1.2} fill={p.ring}
          initial={{ cy: 90, opacity: 0 }}
          animate={{ cy: [90, 15 + i * 6], opacity: [0, 0.9, 0] }}
          transition={{ duration: 2.2, delay: i * 0.45, repeat: Infinity, ease: "easeOut" }} />
      ))}

      {/* Body robe */}
      <motion.path d="M 15 120 Q 18 94 30 90 L 42 86 Q 50 92 58 86 L 70 90 Q 82 94 85 120 Z"
        fill={`url(#${gradientId})`} filter="url(#ds)"
        animate={state === "speaking" ? { scaleY: [1, 1.01, 1] } : { scaleY: 1 }}
        style={{ transformOrigin: "50% 100%" }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} />

      {/* Collar gold trim */}
      <path d="M 42 86 Q 50 97 58 86" fill="none" stroke="rgba(210,160,83,0.65)" strokeWidth="1.4" />
      <circle cx="50" cy="92" r="2.2" fill="rgba(210,160,83,0.75)" />

      {/* Neck */}
      <rect x="44" y="79" width="12" height="11" rx="5" fill={`url(#${skinGradientId})`} />

      {/* Head */}
      <motion.ellipse cx="50" cy="52" rx="22.5" ry="27"
        fill={`url(#${skinGradientId})`} filter="url(#ds)"
        animate={state === "thinking" ? { rotate: [-4, 4, -4] } : { rotate: 0 }}
        transition={{ duration: 2.8, repeat: state === "thinking" ? Infinity : 0, ease: "easeInOut" }} />

      {/* Hair */}
      {isMale ? (
        <>
          <path d="M 26 42 Q 28 15 50 13 Q 72 15 74 42 Q 62 25 50 25 Q 38 25 26 42" fill={p.pupil} />
          <path d="M 27 38 Q 23 28 29 18 Q 36 14 50 12" fill={p.pupil} opacity="0.8" />
          <path d="M 73 38 Q 77 28 71 18 Q 64 14 50 12" fill={p.pupil} opacity="0.8" />
          {/* Custom male hats/details */}
          {avatarStyle === "male_scholar" && (
            <>
              <path d="M 38 22 L 38 10 L 62 10 L 62 22 Z" fill="#2C3E50" />
              <rect x="36" y="20" width="28" height="4" fill="#D2A053" rx="1" />
            </>
          )}
          {avatarStyle === "male_student" && (
            <>
              <path d="M 32 94 Q 50 110 68 94" fill="none" stroke="#FF5722" strokeWidth="4" />
              <circle cx="30" cy="92" r="4.5" fill="#FF5722" />
              <circle cx="70" cy="92" r="4.5" fill="#FF5722" />
            </>
          )}
          {avatarStyle === "male_anchor" && (
            <>
              <path d="M 30 20 Q 50 6 70 20 Z" fill="#1ABC9C" />
              <path d="M 40 18 Q 50 12 75 14" stroke="#1ABC9C" strokeWidth="3.5" fill="none" />
            </>
          )}
        </>
      ) : (
        <>
          <path d="M 27 40 Q 28 18 50 17 Q 72 18 73 40 Q 65 27 50 25 Q 35 27 27 40" fill={p.pupil} />
          <path d="M 28 46 Q 25 34 27 26 Q 29 19 50 17" fill={p.pupil} opacity="0.75" />
          <path d="M 72 46 Q 75 34 73 26 Q 71 19 50 17" fill={p.pupil} opacity="0.75" />
          {/* Gold hairpin for Hanfu */}
          {avatarStyle === "female_hanfu" && (
            <>
              <line x1="57" y1="20" x2="68" y2="14" stroke="#D2A053" strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="68" cy="14" r="2.2" fill="#D2A053" />
              <circle cx="65" cy="18" r="1.4" fill="#E8C96A" />
              <circle cx="62" cy="21" r="0.9" fill="#D2A053" opacity="0.7" />
            </>
          )}
          {/* Custom female hats/details */}
          {avatarStyle === "female_student" && (
            <>
              <path d="M 28 35 Q 50 12 72 35" fill="none" stroke="#F48FB1" strokeWidth="3" />
              <path d="M 32 30 L 26 24 L 28 32 Z" fill="#F48FB1" />
              <path d="M 32 30 L 38 24 L 36 32 Z" fill="#F48FB1" />
              <circle cx="32" cy="30" r="2" fill="#E91E63" />
            </>
          )}
          {avatarStyle === "female_anchor" && (
            <>
              <path d="M 25 50 Q 50 5 75 50" fill="none" stroke="#BA68C8" strokeWidth="3.5" />
              <rect x="23" y="46" width="5" height="15" rx="2.5" fill="#8E44AD" />
              <rect x="72" y="46" width="5" height="15" rx="2.5" fill="#8E44AD" />
            </>
          )}
          {avatarStyle === "female_princess" && (
            <>
              <path d="M 40 22 L 44 14 L 50 20 L 56 14 L 60 22 Z" fill="#FFD700" stroke="#DAA520" strokeWidth="1" />
              <circle cx="44" cy="14" r="1.5" fill="#E74C3C" />
              <circle cx="50" cy="20" r="1.5" fill="#E74C3C" />
              <circle cx="56" cy="14" r="1.5" fill="#E74C3C" />
            </>
          )}
        </>
      )}

      {/* Ears */}
      <ellipse cx="27.5" cy="54" rx="3.2" ry="4.5" fill={`url(#${skinGradientId})`} />
      <ellipse cx="72.5" cy="54" rx="3.2" ry="4.5" fill={`url(#${skinGradientId})`} />

      {/* Eyebrows */}
      <motion.path d={eb.L} fill="none" stroke={p.pupil} strokeWidth="1.8" strokeLinecap="round"
        animate={{ d: eb.L }} transition={{ duration: 0.35 }} />
      <motion.path d={eb.R} fill="none" stroke={p.pupil} strokeWidth="1.8" strokeLinecap="round"
        animate={{ d: eb.R }} transition={{ duration: 0.35 }} />

      {/* Eyes */}
      <ellipse cx="42" cy="52" rx="5" ry={eyeH} fill="white" />
      <ellipse cx="42.8" cy="52" rx="2.8" ry={Math.min(eyeH * 0.72, 3.8)} fill={p.pupil} />
      <ellipse cx="44" cy="50.5" rx="1.1" ry="1.1" fill="rgba(255,255,255,0.75)" />
      <ellipse cx="58" cy="52" rx="5" ry={eyeH} fill="white" />
      <ellipse cx="58.8" cy="52" rx="2.8" ry={Math.min(eyeH * 0.72, 3.8)} fill={p.pupil} />
      <ellipse cx="60" cy="50.5" rx="1.1" ry="1.1" fill="rgba(255,255,255,0.75)" />

      {/* Sunglasses for male_cool, Glasses for business */}
      {avatarStyle === "male_cool" ? (
        <>
          <polygon points="34,48 48,48 46,58 36,58" fill="#111" />
          <polygon points="52,48 66,48 64,58 54,58" fill="#111" />
          <path d="M 48 50 L 52 50" stroke="#111" strokeWidth="2.5" />
          <line x1="38" y1="50" x2="42" y2="56" stroke="white" strokeWidth="1" opacity="0.6" />
          <line x1="56" y1="50" x2="60" y2="56" stroke="white" strokeWidth="1" opacity="0.6" />
        </>
      ) : hasGlasses ? (
        <>
          <circle cx="42.5" cy="52" r="6" stroke="#D2A053" strokeWidth="1.2" fill="none" />
          <circle cx="57.5" cy="52" r="6" stroke="#D2A053" strokeWidth="1.2" fill="none" />
          <path d="M 48.5 52 L 51.5 52" stroke="#D2A053" strokeWidth="1.2" fill="none" />
          <path d="M 36.5 52 Q 33 50 31.5 49" stroke="#D2A053" strokeWidth="0.9" fill="none" />
          <path d="M 63.5 52 Q 67 50 68.5 49" stroke="#D2A053" strokeWidth="0.9" fill="none" />
        </>
      ) : null}

      {/* Nose */}
      <path d="M 49 59 Q 47 64 49 66 Q 51 67 53 66 Q 55 64 51 59"
        fill="none" stroke={p.shadow} strokeWidth="0.9" strokeLinecap="round" />

      {/* Mouth */}
      <motion.path d={mouthPathOverride ?? getMouthPath(state, mouthOpen)}
        fill={state === "speaking" || state === "happy" ? p.lipFill + "88" : "none"}
        stroke={p.lipFill} strokeWidth="1.5" strokeLinecap="round"
        animate={{ d: mouthPathOverride ?? getMouthPath(state, mouthOpen) }}
        transition={{ duration: 0.1 }} />

      {/* Dimples */}
      {state === "happy" && <>
        <circle cx="37" cy="68" r="2.2" fill={p.shadow} opacity="0.3" />
        <circle cx="63" cy="68" r="2.2" fill={p.shadow} opacity="0.3" />
      </>}

      {/* Thinking bubbles */}
      {state === "thinking" && [0, 1, 2].map((i) => (
        <motion.circle key={i} cx={73 + i * 5} cy={30 - i * 6} r={1.5 + i * 0.6}
          fill="rgba(210,160,83,0.55)"
          animate={{ opacity: [0, 1, 0], y: [0, -5, 0] }}
          transition={{ duration: 1.3, delay: i * 0.38, repeat: Infinity }} />
      ))}
    </svg>
  );
}

// ── Voice wave ────────────────────────────────────────────────────────────────
export function VoiceWave({ active, color = "rgba(210,160,83,0.85)" }: { active: boolean; color?: string }) {
  return (
    <div className="flex items-center justify-center gap-[3px]" style={{ height: 28 }}>
      {Array.from({ length: 11 }).map((_, i) => (
        <motion.div key={i} className="rounded-full flex-shrink-0"
          style={{ width: 3, background: color }}
          animate={active ? {
            height: [3, 6 + Math.abs(Math.sin(i * 0.9)) * 14, 3],
            opacity: [0.45, 1, 0.45],
          } : { height: 3, opacity: 0.25 }}
          transition={{ duration: 0.5 + i * 0.04, delay: i * 0.06, repeat: active ? Infinity : 0, ease: "easeInOut" }} />
      ))}
    </div>
  );
}

// ── Public hero component ─────────────────────────────────────────────────────
const SIZES_PX = { sm: 56, md: 88, lg: 148, hero: 220, "desktop-hero": 350 } as const;
const STATE_LABEL: Record<AvatarState, string> = {
  idle: "恭候中", thinking: "思考中", speaking: "讲解中", happy: "很高兴", concerned: "关切中",
};

export function DigitalAvatar({ state, size = "md", audioElement, avatarStyle }: Props) {
  const px = SIZES_PX[size];
  const idSuffix = useId().replace(/:/g, "");
  const p = PALETTE[state];
  const [mouthOpen, setMouthOpen] = useState(false);
  const [mouthAmplitude, setMouthAmplitude] = useState(0); // 0–1 normalized loudness
  const animFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Web Audio API analyser for dynamic lip-sync
  useEffect(() => {
    if (!audioElement) {
      setMouthOpen(false);
      setMouthAmplitude(0);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const setupAnalyser = () => {
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === "suspended") ctx.resume();

        if (!sourceRef.current) {
          sourceRef.current = ctx.createMediaElementSource(audioElement);
        }
        if (!analyserRef.current) {
          analyserRef.current = ctx.createAnalyser();
          analyserRef.current.fftSize = 256;
          analyserRef.current.smoothingTimeConstant = 0.75;
          sourceRef.current.connect(analyserRef.current);
          analyserRef.current.connect(ctx.destination);
        }
      } catch (e) {
        console.warn("Web Audio API setup error:", e);
      }
    };

    const tick = () => {
      if (!analyserRef.current) {
        setMouthOpen(state === "speaking");
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }
      const bufLen = analyserRef.current.frequencyBinCount;
      const data = new Uint8Array(bufLen);
      analyserRef.current.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < bufLen; i++) sum += data[i];
      const avg = sum / bufLen;
      const normalized = Math.min(avg / 80, 1);
      setMouthAmplitude(normalized);
      setMouthOpen(normalized > 0.08);
      animFrameRef.current = requestAnimationFrame(tick);
    };

    setupAnalyser();
    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [audioElement, state]);

  // Fallback fixed-interval toggle when no audio element
  useEffect(() => {
    if (audioElement) return; // Web Audio API takes over
    if (state !== "speaking") {
      setMouthOpen(false);
      return;
    }
    const id = setInterval(() => setMouthOpen((v) => !v), 155);
    return () => clearInterval(id);
  }, [state, audioElement]);

  // Dynamic mouth path based on amplitude
  const getDynamicMouthPath = (st: AvatarState, open: boolean, amplitude: number): string => {
    if (audioElement && amplitude > 0) {
      const openness = 8 + amplitude * 12; // 8–20px arc
      if (st === "concerned") return "M 45 73 Q 50 69 55 73";
      return `M 44 71 Q 50 ${71 + openness} 56 71`;
    }
    return getMouthPath(st, open);
  };

  if (size === "hero" || size === "desktop-hero") {
    return (
      <div className="relative flex flex-col items-center select-none">
        {/* Outer ambient glow */}
        <motion.div className="absolute rounded-full pointer-events-none"
          style={{ width: px + 60, height: px + 60, top: -30, left: -(30),
            background: `radial-gradient(circle, ${p.aura} 0%, transparent 68%)` }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.65, 1, 0.65] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }} />
        {/* Avatar */}
        <motion.div style={{ width: px, height: px * 1.12 }}
          animate={state === "speaking" ? { y: [0, -3, 0] } : { y: 0 }}
          transition={{ duration: 1.3, repeat: state === "speaking" ? Infinity : 0, ease: "easeInOut" }}>
          <AvatarSVG state={state} mouthOpen={mouthOpen} mouthPathOverride={audioElement ? getDynamicMouthPath(state, mouthOpen, mouthAmplitude) : undefined} avatarStyle={avatarStyle} idSuffix={idSuffix} />
        </motion.div>
        {/* Status label + wave */}
        <div className="flex flex-col items-center gap-1 mt-2">
          <motion.span key={state}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="text-[11px] font-medium tracking-wider"
            style={{ color: "rgba(255,255,255,0.55)" }}>
            {STATE_LABEL[state]}
          </motion.span>
          <VoiceWave active={state === "speaking"} />
        </div>
      </div>
    );
  }

  // sm / md / lg — circular badge
  return (
    <div className="relative flex-shrink-0" style={{ width: px, height: px }}>
      <motion.div className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${p.aura} 0%, transparent 70%)` }}
        animate={{ scale: [1, 1.14, 1] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }} />
      <div className="relative w-full h-full rounded-full overflow-hidden"
        style={{ border: `2px solid ${p.ring}`, boxShadow: `0 0 16px ${p.aura}` }}>
        <AvatarSVG state={state} mouthOpen={mouthOpen} mouthPathOverride={audioElement ? getDynamicMouthPath(state, mouthOpen, mouthAmplitude) : undefined} avatarStyle={avatarStyle} idSuffix={idSuffix} />
      </div>
      {size === "lg" && (
        <motion.div className="absolute -bottom-1 -right-1 rounded-full flex items-center justify-center"
          style={{ width: 20, height: 20, background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.18)", fontSize: 11 }}
          animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 2.2, repeat: Infinity }}>
          {state === "idle" ? "🌿" : state === "thinking" ? "💭" : state === "speaking" ? "🔊" : state === "happy" ? "✨" : "🤗"}
        </motion.div>
      )}
    </div>
  );
}
