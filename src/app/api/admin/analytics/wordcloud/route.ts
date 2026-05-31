import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { chatSessions } from "@/lib/db/schema/user-data";
import { sql } from "drizzle-orm";

// Lightweight Chinese word frequency — segment by common stop-words and punctuation
const STOP_WORDS = new Set(["的", "了", "吗", "是", "在", "我", "你", "他", "她", "它", "和", "与", "也", "都", "有", "到", "这", "那", "个", "们", "请问", "可以", "怎么", "什么", "哪里", "如何", "能", "会", "请", "谢谢", "好", "吧", "呢", "啊", "嗯"]);

function tokenize(text: string): string[] {
  // Extract Chinese 2-4 char ngrams as pseudo-words
  const tokens: string[] = [];
  const clean = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, " ").replace(/\s+/g, " ").trim();
  const words = clean.split(" ").filter(Boolean);
  for (const word of words) {
    if (/^[\u4e00-\u9fa5]{2,4}$/.test(word) && !STOP_WORDS.has(word)) {
      tokens.push(word);
    }
  }
  // bigrams for longer text
  const cn = clean.replace(/[^\u4e00-\u9fa5]/g, "");
  for (let i = 0; i < cn.length - 1; i++) {
    const bi = cn.slice(i, i + 2);
    if (!STOP_WORDS.has(bi)) tokens.push(bi);
  }
  return tokens;
}

export async function GET() {
  try {
    const sessions = await db.select({ messages: chatSessions.messages }).from(chatSessions).limit(200);
    const freq: Record<string, number> = {};
    for (const s of sessions) {
      const msgs = (s.messages ?? []) as Array<{ role: string; content: string }>;
      for (const m of msgs.filter((x) => x.role === "user")) {
        for (const tok of tokenize(m.content)) {
          freq[tok] = (freq[tok] ?? 0) + 1;
        }
      }
    }
    const words = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([word, count]) => ({ word, count }));
    return NextResponse.json(words);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
