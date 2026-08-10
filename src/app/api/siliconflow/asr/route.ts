import { NextRequest, NextResponse } from "next/server";
import { transcribeSiliconFlowAudio } from "@/lib/ai/siliconflow-audio";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || "audio/wav";
    const fileName = file.name || "audio.wav";

    const text = await transcribeSiliconFlowAudio(buffer, mimeType, fileName);

    return NextResponse.json({
      ok: true,
      text: text.trim(),
    });
  } catch (error: any) {
    console.error("[SiliconFlow ASR API Error]", error);
    return NextResponse.json(
      { error: error.message || "Speech recognition failed" },
      { status: 500 }
    );
  }
}
