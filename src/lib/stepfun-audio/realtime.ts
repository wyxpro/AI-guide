import { Buffer } from "buffer";

/**
 * Options for StepAudio 2.5 Realtime engine
 */
export interface StepAudioRealtimeOptions {
  audioBlob?: Blob;
  audioBase64?: string;
  textInput?: string;
  voiceStyle?: string;
  spotName?: string;
}

export interface StepAudioRealtimeResponse {
  userText: string;
  aiText: string;
  audioBase64?: string;
  audioUrl?: string;
}

/**
 * Process end-to-end real-time speech recognition, LLM guide intelligence, and speech synthesis
 * using StepFun StepAudio 2.5 models without exposing API Key to client.
 */
export async function processStepAudioRealtime(options: StepAudioRealtimeOptions): Promise<StepAudioRealtimeResponse> {
  const apiKey = process.env.STEP_API_KEY;
  if (!apiKey) {
    throw new Error("STEP_API_KEY is not configured in environment variables");
  }

  let userText = options.textInput || "";

  // 1. StepAudio 2.5 ASR: Transcribe audio if provided
  if (options.audioBlob && !userText) {
    try {
      const arrayBuffer = await options.audioBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Data = buffer.toString("base64");

      const asrPayload = {
        audio: {
          data: base64Data,
          input: {
            transcription: {
              model: "stepaudio-2.5-asr",
              language: "zh",
              enable_itn: true
            },
            format: { type: "ogg" }
          }
        }
      };

      const asrRes = await fetch("https://api.stepfun.com/step_plan/v1/audio/asr/sse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(asrPayload)
      });

      if (asrRes.ok) {
        const reader = asrRes.body!.getReader();
        const decoder = new TextDecoder();
        let bufferText = "";
        let text = "";

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
                text += parsed.delta;
              }
            } catch (e) {}
          }
        }
        userText = text.trim();
      }
    } catch (err) {
      console.warn("[StepAudio Realtime] ASR transcription warning:", err);
    }
  }

  if (!userText) {
    userText = "你好，请推荐一下这里的精选路线。";
  }

  // 2. StepFun LLM Chat Completion for scenic guide persona
  const spotName = options.spotName || "景区";
  const systemPrompt = `你叫Hiyori（小玉），是${spotName}的专属AI智慧导游。请使用自然亲切、富有感染力的口吻进行解答。语言请简明扼要（100字以内），方便实时语音流畅播报。`;

  const chatPayload = {
    model: "step-2.5-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userText }
    ],
    temperature: 0.7,
    max_tokens: 180
  };

  let aiText = `欢迎来到${spotName}！很高兴能为您导览，请问您想先了解门票价格还是路线规划？`;
  try {
    const chatRes = await fetch("https://api.stepfun.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(chatPayload)
    });

    if (chatRes.ok) {
      const chatData = await chatRes.json();
      if (chatData.choices?.[0]?.message?.content) {
        aiText = chatData.choices[0].message.content.trim();
      }
    }
  } catch (err) {
    console.warn("[StepAudio Realtime] LLM completion warning:", err);
  }

  // 3. StepAudio 2.5 TTS: Synthesize speech audio response
  let audioBase64 = "";
  try {
    const ttsPayload = {
      model: "stepaudio-2.5-tts",
      input: aiText,
      voice: options.voiceStyle === "professional" ? "cixingnansheng" : "livelybreezy-female",
      instruction: "语气温和亲切，语速适中，带有导游热情的情感",
      response_format: "mp3",
    };

    const ttsRes = await fetch("https://api.stepfun.com/step_plan/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(ttsPayload)
    });

    if (ttsRes.ok) {
      const audioArrayBuffer = await ttsRes.arrayBuffer();
      const buffer = Buffer.from(audioArrayBuffer);
      audioBase64 = buffer.toString("base64");
    }
  } catch (err) {
    console.warn("[StepAudio Realtime] TTS synthesis warning:", err);
  }

  return {
    userText,
    aiText,
    audioBase64: audioBase64 ? `data:audio/mp3;base64,${audioBase64}` : undefined
  };
}
