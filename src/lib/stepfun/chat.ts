/**
 * StepFun API Client for step-3.7-flash
 * Connects to StepFun completions endpoint.
 */
import { ai } from "@eazo/sdk";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatOptions {
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export async function stepfunChat(options: ChatOptions, customAgent?: any) {
  const {
    messages,
    temperature = 0.7,
    max_tokens = 400,
    stream = false,
  } = options;

  // Read API key from environment variables
  const apiKey = process.env.STEP_API_KEY;
  const baseUrl = "https://api.stepfun.com/step_plan/v1/chat/completions";

  if (!apiKey) {
    throw new Error("STEP_API_KEY is not defined in the environment variables.");
  }

  try {
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    };

    const body = JSON.stringify({
      model: "step-3.7-flash",
      messages,
      temperature,
      max_tokens,
      stream,
    });

    const response = await fetch(baseUrl, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(3500),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`StepFun API error: ${response.status} - ${errorText}`);
    }

    if (!stream) {
      return await response.json();
    }

    // SSE Stream parsing
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    return {
      [Symbol.asyncIterator]: async function* () {
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;

              const dataStr = trimmed.slice(5).trim();
              if (dataStr === "[DONE]") continue;

              try {
                const parsed = JSON.parse(dataStr);
                yield parsed;
              } catch (e) {
                // Ignore incomplete or invalid JSON chunks
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      },
    };
  } catch (error) {
    console.warn(
      `[StepFun API Connector] Warning: Failed to call step-3.7-flash. Falling back to default SDK model.`,
      error
    );

    // Seamless fallback to Eazo SDK default model
    return ai.chat({
      model: "deepseek.v3.1",
      messages: messages as any,
      temperature,
      stream: stream as any,
      max_tokens,
    });
  }
}
