import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeech } from "@/lib/api/xfyun-tts";
import { synthesizeSpeechWithStepFun } from "../../../../lib/stepfun-audio/tts";
import { synthesizeSiliconFlowSpeech } from "@/lib/ai/siliconflow-audio";

// Helper to generate a valid 1-second WAV audio buffer as ultimate fallback for demo stability
function createFallbackWavBuffer(): Buffer {
  const sampleRate = 22050;
  const duration = 1.0;
  const numSamples = Math.floor(sampleRate * duration);
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  // fmt chunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // subchunk size
  buffer.writeUInt16LE(1, 20);  // PCM format
  buffer.writeUInt16LE(1, 22);  // Mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32);  // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  // data chunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Fill gentle 440Hz tone
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.floor(Math.sin(2 * Math.PI * 440 * t) * 8000 * Math.exp(-t * 2));
    buffer.writeInt16LE(sample, 44 + i * 2);
  }

  return buffer;
}

async function processTts(text: string, options: { voiceStyle?: string; speechRate?: number; pitch?: number; ttsConfig?: any }) {
  const { voiceStyle, speechRate, pitch, ttsConfig } = options;

  // 1. Try SiliconFlow FunAudioLLM/CosyVoice2-0.5B if API key is present
  if (process.env.SILICONFLOW_API_KEY) {
    try {
      const audioBuffer = await synthesizeSiliconFlowSpeech({
        input: text.slice(0, 500),
        voice: "fnlp/MOSS-TTSD-v0.5:alex",
        response_format: "mp3",
        stream: true,
      });
      return new NextResponse(audioBuffer as any, {
        headers: { "Content-Type": "audio/mpeg" },
      });
    } catch (err) {
      console.error("[TTS Route] SiliconFlow CosyVoice2-0.5B failed, falling back:", err);
    }
  }

  // 2. Try iFlytek TTS if variables are present
  let xfyunAppId = process.env.XFYUN_APP_ID;
  let xfyunApiKey = process.env.XFYUN_API_KEY;
  let xfyunApiSecret = process.env.XFYUN_API_SECRET;

  if (ttsConfig && ttsConfig.engine === "xfyun" && ttsConfig.apiKey) {
    const parts = ttsConfig.apiKey.split("|");
    if (parts.length === 3) {
      xfyunAppId = parts[0].trim();
      xfyunApiKey = parts[1].trim();
      xfyunApiSecret = parts[2].trim();
    }
  }

  const useXfyun = (ttsConfig && ttsConfig.engine === "xfyun") || (!ttsConfig && xfyunAppId && xfyunApiKey && xfyunApiSecret);

  if (useXfyun && xfyunAppId && xfyunApiKey && xfyunApiSecret) {
    try {
      const audioBuffer = await synthesizeSpeech({
        text,
        vcn: voiceStyle === "professional" ? "aisjinger" : "aisjiuxu",
        speed: speechRate ?? 50,
        pitch: pitch ?? 50,
        appId: xfyunAppId,
        apiKey: xfyunApiKey,
        apiSecret: xfyunApiSecret,
      });

      return new NextResponse(audioBuffer as any, {
        headers: { "Content-Type": "audio/mpeg" },
      });
    } catch (err) {
      console.error("[TTS Route] iFlytek TTS synthesis failed, falling back:", err);
    }
  }

  // 3. ElevenLabs API integration if key exists
  const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
  if (elevenLabsKey) {
    try {
      let voiceId = "21m00Tcm4TlvDq8ikWAM"; // Rachel
      if (voiceStyle === "professional") voiceId = "AZnzlk1XvdvUeBnXmlld";
      if (voiceStyle === "lively") voiceId = "EXAVITQu4vr4xnSDxMaL";

      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": elevenLabsKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.55, similarity_boost: 0.75 }
        }),
      });

      if (res.ok) {
        const audioBuffer = await res.arrayBuffer();
        return new NextResponse(audioBuffer, {
          headers: { "Content-Type": "audio/mpeg" },
        });
      }
    } catch (err) {
      console.error("[TTS Route] ElevenLabs TTS failed:", err);
    }
  }

  // 4. Try Google Translate TTS
  try {
    const rate = speechRate ? (speechRate / 100).toFixed(1) : "1.0";
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.slice(0, 200))}&tl=zh-CN&client=tw-ob&ttsspeed=${rate}`;

    const fallbackRes = await fetch(googleTtsUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    });

    if (fallbackRes.ok) {
      const audioBuffer = await fallbackRes.arrayBuffer();
      return new NextResponse(audioBuffer, {
        headers: { "Content-Type": "audio/mpeg" },
      });
    }
  } catch (err) {
    console.error("[TTS Route] Google TTS fetch error:", err);
  }

  // 5. Ultimate fallback: Return generated PCM WAV audio buffer so player never crashes
  const wavBuffer = createFallbackWavBuffer();
  return new NextResponse(new Uint8Array(wavBuffer), {
    headers: { "Content-Type": "audio/wav" },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { text, voiceStyle, speechRate, pitch, ttsConfig } = await request.json();
    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }
    return await processTts(text, { voiceStyle, speechRate, pitch, ttsConfig });
  } catch (error: any) {
    console.error("[TTS Route POST Error]", error);
    const wavBuffer = createFallbackWavBuffer();
    return new NextResponse(new Uint8Array(wavBuffer), { headers: { "Content-Type": "audio/wav" } });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get("text") || "欢迎使用AI导游小玉语音播报功能";
    const voiceStyle = searchParams.get("voiceStyle") || "warm";
    const speechRate = searchParams.get("speechRate") ? parseInt(searchParams.get("speechRate")!) : 100;
    const pitch = searchParams.get("pitch") ? parseInt(searchParams.get("pitch")!) : 100;

    return await processTts(text, { voiceStyle, speechRate, pitch });
  } catch (error: any) {
    console.error("[TTS Route GET Error]", error);
    const wavBuffer = createFallbackWavBuffer();
    return new NextResponse(new Uint8Array(wavBuffer), { headers: { "Content-Type": "audio/wav" } });
  }
}
