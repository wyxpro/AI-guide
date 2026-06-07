import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { knowledgeDocs, qaLogs } from "@/lib/db/schema/admin";
import { chatSessions } from "@/lib/db/schema/user-data";
import { ai } from "@eazo/sdk";
import { getUserPreferences } from "@/lib/db/queries/user-data";
import { isRateLimited } from "@/lib/api/rate-limit";
import { getEmbedding, cosineSimilarity } from "@/lib/api/embedding";
import { eq, desc } from "drizzle-orm";

const ACCESS_PROMPTS: Record<string, string> = {
  normal: "你是翠玉景区的专属AI导览员小玉，语气温暖亲切、知识丰富，回答时适当引用历史典故。回答200字以内，段落清晰。必须在回复的最开始以 '[情感: 愉快/平静/伤感/思考]' 格式标注你的情感，例如 '[情感: 愉快]您好！很高兴为您服务。'",
  elder:  "你是翠玉景区的AI导览员小玉，专为老年游客服务。语速慢、语气温和、措辞简洁易懂，避免复杂句子，优先推荐平坦无障碍路线。回答150字以内。必须在回复的最开始以 '[情感: 愉快/平静/伤感/思考]' 格式标注你的情感，例如 '[情感: 平静]老人家您好！请慢慢走。'",
  child:  "你是翠玉景区的AI导览员小玉，专为小朋友服务！用可爱活泼的语气讲故事，多用比喻和有趣的说法，让知识变得好玩！回答100字以内。必须在回复的最开始以 '[情感: 愉快/平静/思考]' 格式标注你的情感，例如 '[情感: 愉快]哇！小朋友，今天想听什么好玩的故事呢？'",
};

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { answer: "您提问的速度太快了，小玉脑子有点转不过来了。请稍等一分钟再试！" },
        { status: 429 }
      );
    }

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

    // Knowledge context (semantic search RAG with dense/sparse hybrid reranking)
    let knowledgeCtx = "";
    try {
      const docs = await db.select().from(knowledgeDocs).where(eq(knowledgeDocs.vectorized, true));
      if (docs.length > 0) {
        const queryVec = await getEmbedding(question);
        
        // 1. Calculate Cosine Similarity
        const scored = docs.map(d => {
          const docVec = (d.embedding as number[]) || [];
          const sim = cosineSimilarity(queryVec, docVec);
          return { ...d, similarity: sim };
        });

        // 2. Keyword score for hybrid search
        const keywordScore = (title: string, content: string, query: string): number => {
          const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
          if (words.length === 0) return 0;
          let matches = 0;
          const text = `${title} ${content}`.toLowerCase();
          for (const word of words) {
            if (text.includes(word)) matches++;
          }
          return matches / words.length;
        };

        // 3. Hybrid Reranker (0.7 semantic + 0.3 keyword match)
        const reranked = scored.map(d => {
          const kw = keywordScore(d.title, d.content, question);
          const rerankScore = 0.7 * d.similarity + 0.3 * kw;
          return { ...d, rerankScore };
        });

        // 4. Filter and select top 3 above a relevance threshold of 0.2
        const relevant = reranked
          .filter(d => d.rerankScore > 0.2)
          .sort((a, b) => b.rerankScore - a.rerankScore)
          .slice(0, 3);

        if (relevant.length > 0) {
          knowledgeCtx = "\n\n【景区知识库参考】\n" +
            relevant.map(d => `${d.title}: ${d.content.slice(0, 200)}`).join("\n");
        }
      }
    } catch (err) {
      console.error("RAG retrieval failed:", err);
    }

    const systemPrompt = ACCESS_PROMPTS[mode] + knowledgeCtx;

    // Multi-turn history (keep last 6 turns max, filter only user & assistant roles to save tokens)
    const chatHistory = (history as Array<{ role: string; content: string }>)
      .filter(m => m.role === "user" || m.role === "assistant")
      .slice(-6)
      .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

    const messages = [
      { role: "user" as const, content: systemPrompt + "\n\n用户问：" + question },
      ...chatHistory.slice(0, -1),
      { role: "user" as const, content: question },
    ];

    // Helper to save chat session interaction
    const saveChatInteraction = async (uId: string, q: string, a: string) => {
      try {
        const existing = await db
          .select()
          .from(chatSessions)
          .where(eq(chatSessions.userId, uId))
          .orderBy(desc(chatSessions.updatedAt))
          .limit(1);

        const timestamp = new Date().toISOString();
        const newMessages = [
          { role: "user" as const, content: q, timestamp },
          { role: "assistant" as const, content: a, timestamp },
        ];

        if (existing[0]) {
          const currentMsgs = (existing[0].messages as Array<any>) || [];
          const updatedMsgs = [...currentMsgs, ...newMessages].slice(-20);
          await db
            .update(chatSessions)
            .set({ messages: updatedMsgs, updatedAt: new Date() })
            .where(eq(chatSessions.id, existing[0].id));
        } else {
          await db.insert(chatSessions).values({
            userId: uId,
            title: q.slice(0, 15) || "导览对话",
            messages: newMessages,
          });
        }
      } catch (err) {
        console.error("Failed to save chat interaction:", err);
      }
    };

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

            let accumulatedAnswer = "";
            for await (const chunk of result as any) {
              const delta = chunk.choices?.[0]?.delta?.content ?? "";
              if (delta) {
                accumulatedAnswer += delta;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
              }
            }

            // Save streamed dialogue to DB
            if (userId) {
              await saveChatInteraction(userId, question, accumulatedAnswer);
              
              // Log daily analytics and QA logs for streaming
              const today = new Date().toISOString().slice(0, 10);
              const sentiment = getSentimentFromAnswer(accumulatedAnswer);
              db.insert(qaLogs).values({
                userId,
                question,
                answer: accumulatedAnswer,
                sentiment,
                date: today,
              }).catch(() => {});
              
              import("@/lib/db/queries/admin").then(({ upsertDailyAnalytics }) => {
                upsertDailyAnalytics(today, {
                  totalQuestions: 1,
                  sentimentPositive: sentiment === "positive" ? 1 : 0,
                  sentimentNeutral: sentiment === "neutral" ? 1 : 0,
                  sentimentNegative: sentiment === "negative" ? 1 : 0,
                }).catch(() => {});
              }).catch(() => {});
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

    // Async: increment daily QA counter and sentiment count
    const today = new Date().toISOString().slice(0, 10);
    const sentiment = getSentimentFromAnswer(answer);

    if (userId) {
      await saveChatInteraction(userId, question, answer);
    }

    db.insert(qaLogs).values({
      userId,
      question,
      answer,
      sentiment,
      date: today,
    }).catch((e) => console.error("Failed to log QA conversation", e));

    import("@/lib/db/queries/admin")
      .then(({ upsertDailyAnalytics }) => upsertDailyAnalytics(today, {
        totalQuestions: 1,
        sentimentPositive: sentiment === "positive" ? 1 : 0,
        sentimentNeutral: sentiment === "neutral" ? 1 : 0,
        sentimentNegative: sentiment === "negative" ? 1 : 0,
      }).catch(() => {}))
      .catch(() => {});

    return NextResponse.json({ answer, userId });
  } catch (error) {
    console.error("[POST /api/qa/chat]", error);
    return NextResponse.json({
      answer: "小玉现在有些忙，请稍后再试。如有紧急问题，请前往景区服务中心。",
    });
  }
}

function getSentimentFromAnswer(text: string): "positive" | "neutral" | "negative" {
  const match = text.match(/\[情感:\s*(愉快|高兴|开心|温和|伤感|抱歉|紧张|思考)\]/);
  if (match) {
    const emo = match[1];
    if (/愉快|高兴|开心/.test(emo)) return "positive";
    if (/伤感|抱歉|紧张/.test(emo)) return "negative";
  }
  if (/抱歉|对不起|遗憾|无法|不便/.test(text)) return "negative";
  if (/开心|愉快|非常高兴|精彩|美丽/.test(text)) return "positive";
  return "neutral";
}

export async function GET(request: NextRequest) {
  const authResult = requireAuth(request);
  if (!authResult.ok) return authResult.response;
  const userId = authResult.user.id;

  try {
    const session = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.updatedAt))
      .limit(1);

    if (session[0]) {
      return NextResponse.json(session[0].messages);
    }
    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch chat session" }, { status: 500 });
  }
}
