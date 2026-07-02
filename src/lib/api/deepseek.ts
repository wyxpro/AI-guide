import { ai } from "@eazo/sdk";
import { deepseekV4ProChat } from "../deepseek-v4-pro/chat";

interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface DeepSeekChatOptions {
  model?: string;
  messages: DeepSeekMessage[];
  temperature?: number;
  stream?: boolean;
  max_tokens?: number;
}

export async function deepseekChat(options: DeepSeekChatOptions, customAgent?: any) {
  const {
    model = "deepseek-v4-pro",
    messages,
    temperature = 0.7,
    stream = false,
    max_tokens = 400,
  } = options;

  try {
    // If there is a custom agent configured (e.g. custom key/endpoint in settings),
    // we use the inline custom agent fetch flow. Otherwise, we use the optimized deepseekV4ProChat client.
    if (customAgent && customAgent.enable) {
      let apiKey = customAgent.apiKey || process.env.DEEPSEEK_API_KEY || "sk-02260d10c28c4bb4b65bace15ba5f754";
      let proxyUrl = "";
      if (customAgent.baseUrl) {
        let base = customAgent.baseUrl.trim();
        if (base.endsWith("/")) {
          base = base.slice(0, -1);
        }
        proxyUrl = base.includes("/chat/completions") ? base : `${base}/chat/completions`;
      } else {
        if (customAgent.provider === "openai") {
          proxyUrl = "https://api.openai.com/v1/chat/completions";
        } else if (customAgent.provider === "deepseek") {
          proxyUrl = "https://api.deepseek.com/v1/chat/completions";
        } else if (customAgent.provider === "qwen") {
          proxyUrl = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
        } else if (customAgent.provider === "kimi") {
          proxyUrl = "https://api.moonshot.cn/v1/chat/completions";
        }
      }
      const targetModel = customAgent.model || model;
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      };

      const response = await fetch(proxyUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: targetModel,
          messages,
          temperature,
          stream,
          max_tokens,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Custom Agent API error: ${response.status} - ${errorText}`);
      }

      if (!stream) {
        return await response.json();
      }

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
                  // Ignore malformed JSON chunks
                }
              }
            }
          } finally {
            reader.releaseLock();
          }
        },
      };
    }

    // Default primary flow: call our new deepseek-v4-pro client
    return await deepseekV4ProChat({
      messages,
      temperature,
      max_tokens,
      stream,
    });

  } catch (error) {
    console.warn(
      `[DeepSeek API Connector] Warning: Failed to call ${model} at proxyUrl. Falling back to default SDK model.`,
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
