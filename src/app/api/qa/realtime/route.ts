import { NextRequest, NextResponse } from "next/server";
import { processStepAudioRealtime } from "@/lib/stepfun-audio/realtime";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      const textInput = (formData.get("text") as string) || "";
      const voiceStyle = (formData.get("voiceStyle") as string) || "lively";
      const spotName = (formData.get("spotName") as string) || "景区";

      const result = await processStepAudioRealtime({
        audioBlob: file || undefined,
        textInput,
        voiceStyle,
        spotName
      });

      return NextResponse.json(result);
    } else {
      const body = await request.json();
      const { text, voiceStyle, spotName } = body;

      const result = await processStepAudioRealtime({
        textInput: text,
        voiceStyle: voiceStyle || "lively",
        spotName: spotName || "景区"
      });

      return NextResponse.json(result);
    }
  } catch (error: any) {
    console.error("[StepAudio Realtime Route Error]", error);
    return NextResponse.json(
      {
        userText: "推荐游览路线",
        aiText: "欢迎来到景区！建议您从主山门进入，沿竹林小径步行至九曲桥观景点。",
        error: error?.message || "Internal StepAudio error"
      },
      { status: 500 }
    );
  }
}
