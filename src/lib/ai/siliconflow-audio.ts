/**
 * SiliconFlow AI Audio Capability Integration Module
 * Models integrated:
 * - Speech Synthesis (TTS): FunAudioLLM/CosyVoice2-0.5B
 * - Speech Recognition (ASR): TeleAI/TeleSpeechASR
 */

const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY;
const SILICONFLOW_BASE_URL = process.env.SILICONFLOW_BASE_URL || "https://api.siliconflow.cn/v1";

export interface SiliconFlowTtsOptions {
  input: string;
  model?: string;
  voice?: string;
  response_format?: string;
  stream?: boolean;
}

/**
 * Synthesize Speech using SiliconFlow CosyVoice2-0.5B model
 */
export async function synthesizeSiliconFlowSpeech(options: SiliconFlowTtsOptions): Promise<Uint8Array> {
  const apiKey = SILICONFLOW_API_KEY || process.env.SILICONFLOW_API_KEY;
  if (!apiKey) {
    throw new Error("SILICONFLOW_API_KEY is missing in environment variables");
  }

  const payload = {
    model: options.model || "FunAudioLLM/CosyVoice2-0.5B",
    input: options.input,
    voice: options.voice || "fnlp/MOSS-TTSD-v0.5:anna",
    response_format: options.response_format || "mp3",
    stream: options.stream !== undefined ? options.stream : true,
  };

  const response = await fetch(`${SILICONFLOW_BASE_URL}/audio/speech`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SiliconFlow TTS API Error (${response.status}): ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

/**
 * Transcribe Audio Speech using SiliconFlow TeleAI/TeleSpeechASR model
 */
export async function transcribeSiliconFlowAudio(
  audioBuffer: Buffer | Uint8Array,
  mimeType: string = "audio/wav",
  fileName: string = "audio.wav"
): Promise<string> {
  const apiKey = SILICONFLOW_API_KEY || process.env.SILICONFLOW_API_KEY;
  if (!apiKey) {
    throw new Error("SILICONFLOW_API_KEY is missing in environment variables");
  }

  const formData = new FormData();
  const uint8 = new Uint8Array(audioBuffer);
  const blob = new Blob([uint8], { type: mimeType });
  formData.append("file", blob, fileName);
  formData.append("model", "TeleAI/TeleSpeechASR");

  const response = await fetch(`${SILICONFLOW_BASE_URL}/audio/transcriptions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SiliconFlow ASR API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.text || "";
}
