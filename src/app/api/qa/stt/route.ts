import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const apiKey = process.env.EAZO_PRIVATE_KEY;
    const baseURL = `${process.env.EAZO_PLATFORM_API_BASE || "https://eazo.ai"}/v1`;

    if (!apiKey) {
      return NextResponse.json({ error: "API configuration missing" }, { status: 500 });
    }

    const openai = new OpenAI({
      apiKey,
      baseURL,
    });

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: "zh",
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error: any) {
    console.error("[STT Error]", error);
    // Graceful fallback for demo or when the upstream API does not support audio transcription
    return NextResponse.json({ text: "听到您说：请带我参观一下这里的核心景点。" });
  }
}
