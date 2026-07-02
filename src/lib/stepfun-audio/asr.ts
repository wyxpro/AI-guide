import { Buffer } from "buffer";

/**
 * Transcribe audio using StepFun stepaudio-2.5-asr model.
 * @param file The browser-uploaded audio file.
 * @returns The transcribed text string.
 */
export async function transcribeAudioWithStepFun(file: File): Promise<string> {
  const apiKey = process.env.STEP_API_KEY;
  if (!apiKey) {
    throw new Error("STEP_API_KEY is not defined in the environment variables.");
  }

  // Convert File arrayBuffer to Buffer, then Base64 encode
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Data = buffer.toString("base64");

  // Detect and set the correct format type
  let formatType = "wav";
  if (file.type.includes("mp3")) {
    formatType = "mp3";
  } else if (file.type.includes("ogg") || file.type.includes("webm")) {
    formatType = "ogg";
  }

  const payload = {
    audio: {
      data: base64Data,
      input: {
        transcription: {
          model: "stepaudio-2.5-asr",
          language: "zh",
          enable_itn: true
        },
        format: {
          type: formatType
        }
      }
    }
  };

  const response = await fetch("https://api.stepfun.com/step_plan/v1/audio/asr/sse", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`StepFun ASR API error: ${response.status} - ${errText}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let transcriptionText = "";
  let bufferText = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      bufferText += decoder.decode(value, { stream: true });
      const lines = bufferText.split("\n");
      bufferText = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;

        const dataStr = trimmed.slice(5).trim();
        if (dataStr === "[DONE]") continue;

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.type === "transcript.text.delta" && parsed.delta) {
            transcriptionText += parsed.delta;
          }
        } catch (e) {
          // Ignore parse errors for incomplete JSON lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return transcriptionText.trim();
}
