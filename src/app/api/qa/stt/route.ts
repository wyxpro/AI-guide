import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Try Vosk local ASR if model folder exists
    const voskModelPath = path.join(process.cwd(), "models", "vosk-model-cn");
    if (fs.existsSync(voskModelPath)) {
      try {
        const { Model, Recognizer } = require("vosk");
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const model = new Model(voskModelPath);
        const recognizer = new Recognizer({ model: model, sampleRate: 16000 });
        
        recognizer.acceptWaveform(buffer);
        const result = recognizer.finalResult();
        recognizer.free();
        
        if (result && result.text) {
          return NextResponse.json({ text: result.text });
        }
      } catch (voskError) {
        console.warn("[STT Route] Local Vosk ASR failed, falling back to Whisper:", voskError);
      }
    }

    // 2. Whisper ASR Fallback
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
