import { NextRequest, NextResponse } from "next/server";
import { synthesizeSiliconFlowSpeech } from "@/lib/ai/siliconflow-audio";

export async function POST(request: NextRequest) {
  try {
    const { text, input, voice, voiceStyle, response_format } = await request.json();
    const queryText = input || text;

    if (!queryText) {
      return NextResponse.json({ error: "Input text is required" }, { status: 400 });
    }

    let voiceParam = voice || "fnlp/MOSS-TTSD-v0.5:alex";
    if (voiceStyle === "female" || voiceStyle === "warm") {
      voiceParam = "fnlp/MOSS-TTSD-v0.5:alex";
    }

    const audioBuffer = await synthesizeSiliconFlowSpeech({
      input: queryText.slice(0, 500),
      voice: voiceParam,
      response_format: response_format || "mp3",
      stream: true,
    });

    return new NextResponse(audioBuffer as any, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("[SiliconFlow TTS API Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to synthesize speech" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryText = searchParams.get("input") || searchParams.get("text") || "您好！我是旅行家小玉，很高兴为您提供智游导览解说！";

    const audioBuffer = await synthesizeSiliconFlowSpeech({
      input: queryText.slice(0, 500),
      voice: "fnlp/MOSS-TTSD-v0.5:alex",
      response_format: "mp3",
      stream: true,
    });

    return new NextResponse(audioBuffer as any, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("[SiliconFlow TTS GET Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to synthesize speech" },
      { status: 500 }
    );
  }
}
