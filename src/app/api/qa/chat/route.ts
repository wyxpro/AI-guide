import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { knowledgeDocs } from "@/lib/db/schema/admin";
import { ai } from "@eazo/sdk";
import { getUserPreferences } from "@/lib/db/queries/user-data";

const ACCESS_PROMPTS: Record<string, string> = {
  normal: "你是翠玉景区的专属AI导览员小玉，语气温暖亲切、知识丰富，回答时适当引用历史典故。回答200字以内，段落清晰。",
  elder:  "你是翠玉景区的AI导览员小玉，专为老年游客服务。语速慢、语气温和、措辞简洁易懂，避免复杂句子，优先推荐平坦无障碍路线。回答150字以内。",
  child:  "你是翠玉景区的AI导览员小玉，专为小朋友服务！用可爱活泼的语气讲故事，多用比喻和有趣的说法，让知识变得好玩！回答100字以内。",
};

export async function POST(request: NextRequest) {
  try {
    // Soft auth — allow anonymous for demo
    const authResult = requireAuth(request);
    const userId = authResult.ok ? authResult.user.id : null;

    const { question, history = [], stream: wantStream = false } = await request.json();
    if (!question?.trim()) {
      return NextResponse.json({ answer: "请输入您的问题，小玉随时为您解答！" });
    }

    // User preference → mode
    let mode = "normal";
    if (userId) {
      try {
        const prefs = await getUserPreferences(userId);
        if (prefs?.accessibilityMode) mode = prefs.accessibilityMode;
      } catch { /* ignore */ }
    }

    // Knowledge context (top 3 relevant docs)
    let knowledgeCtx = "";
    try {
      const docs = await db.select().from(knowledgeDocs).limit(6);
      const relevant = docs
        .filter(d => {
          const q = question.toLowerCase();
          return d.title.toLowerCase().includes(q.slice(0,4)) ||
                 d.content.toLowerCase().includes(q.slice(0,4)) ||
                 (d.tags as string[])?.some(t => question.includes(t));
        })
        .slice(0, 3);
      if (relevant.length > 0) {
        knowledgeCtx = "\n\n【景区知识库参考】\n" +
          relevant.map(d => `${d.title}: ${d.content.slice(0, 200)}`).join("\n");
      }
    } catch { /* ignore */ }

    const systemPrompt = ACCESS_PROMPTS[mode] + knowledgeCtx;

    // Multi-turn history (keep last 6 turns max to save tokens)
    const chatHistory = (history as Array<{ role: string; content: string }>)
      .slice(-6)
      .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

    const messages = [
      { role: "user" as const, content: systemPrompt + "\n\n用户问：" + question },
      ...chatHistory.slice(0, -1),
      { role: "user" as const, content: question },
    ];

    // ── Streaming response ──────────────────────────────────────────────────
    if (wantStream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const result = await ai.chat({
              model: "deepseek.v3.1",
              messages,
              stream: true,
              max_tokens: 400,
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            for await (const chunk of result as any) {
              const delta = chunk.choices?.[0]?.delta?.content ?? "";
              if (delta) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
              }
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          } catch (e) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: "小玉现在有些忙，请稍后再试。" })}\n\n`));
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    // ── Non-streaming (default) ─────────────────────────────────────────────
    const result = await ai.chat({
      model: "deepseek.v3.1",
      messages: [
        { role: "user", content: systemPrompt },
        ...chatHistory,
        { role: "user", content: question },
      ],
      max_tokens: 400,
    });
    const answer = result.choices?.[0]?.message?.content?.trim() ?? "小玉暂时无法回答，请稍后再试。";

    // Async: increment daily QA counter
    const today = new Date().toISOString().slice(0, 10);
    import("@/lib/db/queries/admin")
      .then(({ upsertDailyAnalytics }) => upsertDailyAnalytics(today, { totalQuestions: 1 }).catch(() => {}))
      .catch(() => {});

    return NextResponse.json({ answer, userId });
  } catch (error) {
    console.error("[POST /api/qa/chat]", error);
    return NextResponse.json({
      answer: "小玉现在有些忙，请稍后再试。如有紧急问题，请前往景区服务中心。",
    });
  }
}
