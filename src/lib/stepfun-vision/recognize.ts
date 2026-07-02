/**
 * StepFun Step-3.7-Flash Vision/Multimodal API Client
 * This helper handles image recognition for the VR / Multimodal tour guide features.
 */

interface RecognitionResult {
  subject: string;
  story: string;
  tip: string;
}

/**
 * Recognize an image using StepFun step-3.7-flash model.
 * @param base64Data The base64-encoded image data.
 * @param mimeType The MIME type of the image (e.g. image/jpeg, image/png).
 * @param contextSpot Optional contextual spot information.
 * @returns The parsed JSON response containing subject, story, and tip.
 */
export async function recognizeImageWithStepFun(
  base64Data: string,
  mimeType: string,
  contextSpot?: string
): Promise<RecognitionResult> {
  const apiKey = process.env.STEP_API_KEY;
  if (!apiKey) {
    throw new Error("STEP_API_KEY is not defined in the environment variables.");
  }

  const systemPrompt = `你是翠玉景区的专属AI导览员小玉，精通景区所有景点的历史、文化和自然知识。
${contextSpot ? `当前游客正在参观：${contextSpot}附近区域。` : ""}

请分析图片，识别其中的景物、建筑、植物或自然风光，然后用温暖亲切的语气：
1. 说出识别到的主要景物（30字内）
2. 介绍相关历史文化背景或趣味知识（100字内）
3. 给出游览建议或拍照技巧（50字内）

请用JSON格式回复，且只返回JSON内容本身，包含字段：subject（识别内容）、story（历史/文化介绍）、tip（游览建议）`;

  const payload = {
    model: "step-3.7-flash",
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
            image_url: {
              url: `data:${mimeType};base64,${base64Data}`,
            },
          },
        ],
      },
    ],
    max_tokens: 600,
  };

  const response = await fetch("https://api.stepfun.com/step_plan/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`StepFun Vision API error: ${response.status} - ${errText}`);
  }

  const resultData = await response.json();
  const rawContent = resultData.choices?.[0]?.message?.content ?? "";

  // Resilient JSON parser
  let result: RecognitionResult = {
    subject: "您拍摄的景物",
    story: "这是一处充满历史韵味的景点。",
    tip: "建议在晨光或夕阳时分拍摄，效果最佳。",
  };

  try {
    const match = rawContent.match(/\{[\s\S]*\}/);
    if (match) {
      result = { ...result, ...JSON.parse(match[0]) };
    } else {
      result.story = rawContent.slice(0, 200);
    }
  } catch (e) {
    console.error("[recognizeImageWithStepFun] JSON parsing failed, raw content:", rawContent);
    result.story = rawContent.slice(0, 200);
  }

  return result;
}
