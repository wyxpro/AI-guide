import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeech } from "@/lib/api/xfyun-tts";

export async function POST(request: NextRequest) {
  try {
    const { text, voiceStyle, speechRate, pitch } = await request.json();
    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // 1. Try iFlytek TTS if variables are present
    const xfyunAppId = process.env.XFYUN_APP_ID;
    const xfyunApiKey = process.env.XFYUN_API_KEY;
    const xfyunApiSecret = process.env.XFYUN_API_SECRET;

    if (xfyunAppId && xfyunApiKey && xfyunApiSecret) {
      try {
        const audioBuffer = await synthesizeSpeech({
          text,
          vcn: voiceStyle === "professional" ? "aisjinger" : "aisjiuxu",
          speed: speechRate ?? 50,
          pitch: pitch ?? 50,
        });

        return new NextResponse(audioBuffer as any, {
          headers: {
            "Content-Type": "audio/mpeg",
          },
        });
      } catch (err) {
        console.error("[TTS Route] iFlytek TTS synthesis failed, falling back:", err);
      }
    }

    // 2. ElevenLabs API integration if key exists
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    if (elevenLabsKey) {
      let voiceId = "21m00Tcm4TlvDq8ikWAM"; // Rachel
      if (voiceStyle === "professional") voiceId = "AZnzlk1XvdvUeBnXmlld"; // Domi
      if (voiceStyle === "lively") voiceId = "EXAVITQu4vr4xnSDxMaL"; // Bella

      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": elevenLabsKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.55,
            similarity_boost: 0.75,
          }
        }),
      });

      if (res.ok) {
        const audioBuffer = await res.arrayBuffer();
        return new NextResponse(audioBuffer, {
          headers: {
            "Content-Type": "audio/mpeg",
          },
        });
      }
    }

    // 3. Fallback: Google Translate TTS which supports the ttsspeed parameter
    const rate = speechRate ? (speechRate / 100).toFixed(1) : "1.0";
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.slice(0, 200))}&tl=zh-CN&client=tw-ob&ttsspeed=${rate}`;

    const fallbackRes = await fetch(googleTtsUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      }
    });

    if (fallbackRes.ok) {
      const audioBuffer = await fallbackRes.arrayBuffer();
      return new NextResponse(audioBuffer, {
        headers: {
          "Content-Type": "audio/mpeg",
        },
      });
    }

    return NextResponse.json({ error: "Failed to generate audio" }, { status: 500 });
  } catch (error: any) {
    console.error("[TTS Route Error]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
