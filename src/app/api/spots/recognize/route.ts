import { NextRequest, NextResponse } from "next/server";
import { ai } from "@eazo/sdk";
import { recognizeImageWithStepFun } from "@/lib/stepfun-vision/recognize";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const contextSpot = (formData.get("spot") as string) || "";

    if (!imageFile) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    // Convert to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = imageFile.type || "image/jpeg";

    // 1. Try StepFun step-3.7-flash model if key is present
    if (process.env.STEP_API_KEY) {
      try {
        const result = await recognizeImageWithStepFun(base64, mimeType, contextSpot);
        return NextResponse.json(result);
      } catch (stepError) {
        console.error("[Recognize Route] StepFun step-3.7-flash vision recognition failed, falling back:", stepError);
      }
    }

    // 2. Fallback to default SDK model (deepseek.v3.1)
    const systemPrompt = `你是翠玉景区的专属AI导览员小玉，精通景区所有景点的历史、文化和自然知识。
${contextSpot ? `当前游客正在参观：${contextSpot}附近区域。` : ""}

请分析图片，识别其中的景物、建筑、植物或自然风光，然后用温暖亲切的语气：
1. 说出识别到的主要景物（30字内）
2. 介绍相关历史文化背景或趣味知识（100字内）
3. 给出游览建议或拍照技巧（50字内）

请用JSON格式回复，字段：subject（识别内容）、story（历史/文化介绍）、tip（游览建议）`;

    const response = await ai.chat({
      model: "deepseek.v3.1",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: systemPrompt,
            },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64}` },
            },
          ] as unknown as string,
        },
      ],
      max_tokens: 600,
    });

    const raw = response.choices?.[0]?.message?.content ?? "";
    let result = { subject: "您拍摄的景物", story: "这是一处充满历史韵味的景点。", tip: "建议在晨光或夕阳时分拍摄，效果最佳。" };
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) result = { ...result, ...JSON.parse(match[0]) };
      else result.story = raw.slice(0, 200);
    } catch { result.story = raw.slice(0, 200); }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[POST /api/spots/recognize]", error);
    return NextResponse.json({
      subject: "识别暂时不可用",
      story: "小玉正在努力学习更多景物知识，请稍候再试！",
      tip: "建议拍摄清晰、光线充足的照片以获得最佳识别效果。",
    });
  }
}
