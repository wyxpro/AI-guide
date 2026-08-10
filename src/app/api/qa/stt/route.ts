import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { transcribeAudioWithStepFun } from "../../../../lib/stepfun-audio/asr";
import { transcribeSiliconFlowAudio } from "@/lib/ai/siliconflow-audio";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Try SiliconFlow TeleAI/TeleSpeechASR if SILICONFLOW_API_KEY is present
    if (process.env.SILICONFLOW_API_KEY) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = file.type || "audio/wav";
        const fileName = file.name || "audio.wav";

        const text = await transcribeSiliconFlowAudio(buffer, mimeType, fileName);
        if (text) {
          return NextResponse.json({ text: text.trim() });
        }
      } catch (sfError) {
        console.warn("[STT Route] SiliconFlow TeleAI/TeleSpeechASR failed, falling back:", sfError);
      }
    }
    const voskModelPath = path.join(process.cwd(), "models", "vosk-model-cn");
    if (fs.existsSync(voskModelPath)) {
      try {
        const { Model, Recognizer } = eval('require')("vosk");
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
        console.warn("[STT Route] Local Vosk ASR failed, falling back:", voskError);
      }
    }

    // 2. Try StepFun stepaudio-2.5-asr if API key is present
    if (process.env.STEP_API_KEY) {
      try {
        const text = await transcribeAudioWithStepFun(file);
        if (text) {
          return NextResponse.json({ text });
        }
      } catch (stepError) {
        console.warn("[STT Route] StepFun ASR failed, falling back to Whisper:", stepError);
      }
    }

    // 3. Whisper ASR Fallback
    const asrConfigStr = formData.get("asrConfig") as string;
    let asrConfig: any = null;
    if (asrConfigStr) {
      try {
        asrConfig = JSON.parse(asrConfigStr);
      } catch (e) {}
    }

    let apiKey = process.env.EAZO_PRIVATE_KEY;
    let baseURL = `${process.env.EAZO_PLATFORM_API_BASE || "https://eazo.ai"}/v1`;

    if (asrConfig && asrConfig.engine === "whisper" && asrConfig.apiKey) {
      apiKey = asrConfig.apiKey;
      baseURL = "https://api.openai.com/v1";
    }

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
    return NextResponse.json({ error: error.message || "STT failed", text: "" }, { status: 500 });
  }
}
