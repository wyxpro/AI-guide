/**
 * DeepSeek-V4-Flash API Client Integration
 * Base URL: https://ai.dxkp.com/v1
 * Model: DeepSeek-V4-Flash
 */

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

export async function deepseekV4Chat(options: ChatOptions, customAgent?: any) {
  const {
    messages,
    temperature = 0.7,
    max_tokens = 600,
    stream = true,
  } = options;

  const apiKey = process.env.DEEPSEEK_V4_API_KEY;
  const baseUrl = (process.env.DEEPSEEK_V4_BASE_URL || "https://ai.dxkp.com/v1").replace(/\/$/, "");
  const endpoint = `${baseUrl}/chat/completions`;

  if (!apiKey) {
    throw new Error("DEEPSEEK_V4_API_KEY is not configured in environment variables.");
  }

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
  };

  const body = JSON.stringify({
    model: "DeepSeek-V4-Flash",
    messages,
    temperature,
    max_tokens,
    stream,
  });

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(6000), // 6-second timeout for rapid response
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek-V4-Flash API error: ${response.status} - ${errorText}`);
  }

  if (!stream) {
    return await response.json();
  }

  // SSE Stream Parsing for fast typewriter effect
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
              // Ignore partial JSON chunk errors
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    },
  };
}
