/**
 * DeepSeek-V4-Pro API Client
 * This client connects to the DeepSeek-V4-Pro model via the proxy gateway.
 * Safely reads the base URL and API key from environment variables.
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

export async function deepseekV4ProChat(options: ChatOptions) {
  const {
    messages,
    temperature = 0.7,
    max_tokens = 400,
    stream = false,
  } = options;

  const apiKey = process.env.DEEPSEEK_API_KEY;
  const rawProxyUrl = process.env.DEEPSEEK_PROXY_URL || "https://mangdream.com/api/innoreation/v1/proxy";

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not defined in the environment variables.");
  }

  // Safely construct the full completions endpoint
  const proxyUrl = rawProxyUrl.endsWith("/chat/completions") 
    ? rawProxyUrl 
    : `${rawProxyUrl.replace(/\/+$/, "")}/chat/completions`;

  // Set the headers, including the requested "Proxy API Key", "X-Proxy-Key", and standard auth headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Proxy API Key": apiKey,
    "Proxy-API-Key": apiKey,
    "X-Proxy-Key": apiKey,
    "Authorization": `Bearer ${apiKey}`,
  };

  const body = JSON.stringify({
    model: "deepseek-v4-pro",
    messages,
    temperature,
    max_tokens,
    stream,
  });

  const response = await fetch(proxyUrl, {
    method: "POST",
    headers,
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek-V4-Pro proxy error: ${response.status} - ${errorText}`);
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
}
