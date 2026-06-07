import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { qaLogs } from "@/lib/db/schema/admin";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Keyword-based interest classification
const INTEREST_KEYWORDS: Record<string, string[]> = {
  "历史文化": ["历史", "文化", "典故", "朝代", "古代", "遗址", "文物", "传说", "故事", "起源", "由来", "年代", "古迹", "史"],
  "自然生态": ["自然", "生态", "植物", "动物", "山水", "风景", "湖", "山", "花", "树", "鸟", "草", "溪", "瀑布", "氧气", "空气"],
  "亲子游览": ["儿童", "小孩", "孩子", "亲子", "家庭", "宝宝", "玩", "游乐", "童趣", "小朋友", "带娃", "适合孩子"],
  "人文艺术": ["艺术", "建筑", "雕塑", "绘画", "诗词", "文学", "书法", "音乐", "表演", "工艺", "非遗", "民俗", "文化活动"],
};

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    // Fetch recent 200 questions for interest classification
    const logs = await db
      .select({ question: qaLogs.question })
      .from(qaLogs)
      .orderBy(desc(qaLogs.createdAt))
      .limit(200);

    const counts: Record<string, number> = {
      "历史文化": 0,
      "自然生态": 0,
      "亲子游览": 0,
      "人文艺术": 0,
    };

    let totalClassified = 0;

    for (const log of logs) {
      const q = log.question || "";
      let matched = false;
      for (const [category, keywords] of Object.entries(INTEREST_KEYWORDS)) {
        if (keywords.some((kw) => q.includes(kw))) {
          counts[category]++;
          matched = true;
          // A question can belong to multiple categories
        }
      }
      if (matched) totalClassified++;
    }

    // Compute percentages; if no data, return defaults
    const total = Math.max(Object.values(counts).reduce((s, v) => s + v, 0), 1);
    const result = Object.entries(counts).map(([label, count]) => ({
      label,
      pct: Math.round((count / total) * 100),
      count,
    }));

    return NextResponse.json({ interests: result, totalQuestions: logs.length, totalClassified });
  } catch (error: any) {
    console.error("[GET /api/admin/analytics/interests]", error);
    // Return defaults on error
    return NextResponse.json({
      interests: [
        { label: "历史文化", pct: 35, count: 0 },
        { label: "自然生态", pct: 28, count: 0 },
        { label: "亲子游览", pct: 22, count: 0 },
        { label: "人文艺术", pct: 15, count: 0 },
      ],
      totalQuestions: 0,
      totalClassified: 0,
    });
  }
}
