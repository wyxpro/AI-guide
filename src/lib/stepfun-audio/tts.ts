/**
 * Synthesize speech from text using StepFun stepaudio-2.5-tts model.
 * @param text The input text to synthesize.
 * @param voiceStyle Optional voice style requested.
 * @returns The audio file buffer as an ArrayBuffer.
 */
export async function synthesizeSpeechWithStepFun(text: string, voiceStyle?: string): Promise<ArrayBuffer> {
  const apiKey = process.env.STEP_API_KEY;
  if (!apiKey) {
    throw new Error("STEP_API_KEY is not defined in the environment variables.");
  }

  // Map requested style to StepFun voices
  // Standard natural female voice "linjiajiejie" matches the guide avatar "小玉".
  let voice = "linjiajiejie";
  if (voiceStyle === "professional") {
    voice = "cixingnansheng";
  }

  const payload = {
    model: "stepaudio-2.5-tts",
    input: text.slice(0, 300), // Standard safe input limit
    voice,
    instruction: "语气温和亲切，语速适中，富有情感",
    response_format: "mp3",
  };

  const response = await fetch("https://api.stepfun.com/step_plan/v1/audio/speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`StepFun TTS API error: ${response.status} - ${errText}`);
  }

  return await response.arrayBuffer();
}
