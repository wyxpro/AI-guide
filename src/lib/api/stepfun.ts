import { stepfunChat } from "../stepfun/chat";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatOptions {
  model?: string;
  messages: Message[];
  temperature?: number;
  stream?: boolean;
  max_tokens?: number;
}

export async function stepChat(options: ChatOptions, customAgent?: any) {
  return stepfunChat(options, customAgent);
}
