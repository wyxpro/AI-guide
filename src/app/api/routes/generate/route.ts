import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { routes } from "@/lib/db/schema/routes";
import { spots } from "@/lib/db/schema/spots";
import { ai } from "@eazo/sdk";
import { stepChat } from "@/lib/api/stepfun";
import { eq, inArray } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { interests, duration, difficulty = "easy" } = await request.json();

    // Fetch matching spots
    const allSpots = await db.select().from(spots).where(eq(spots.isActive, true));

    const matchingSpots = allSpots.filter((s) => {
      if (!interests || interests.length === 0) return true;
      const tags = (s.tags as string[]) || [];
      const categoryMap: Record<string, string[]> = {
        history: ["history", "历史", "文物"],
        nature: ["nature", "自然", "生态"],
        cultural: ["cultural", "文化", "人文"],
        family: ["family", "亲子"],
      };
      return interests.some((interest: string) => {
        const keywords = categoryMap[interest] || [interest];
        return keywords.some((kw) => s.category === interest || tags.some((t) => t.includes(kw)));
      });
    });

    // Build a route based on duration
    const maxSpots = duration <= 90 ? 2 : duration <= 150 ? 3 : 4;
    const selectedSpots = matchingSpots.slice(0, maxSpots);

    const spotList = selectedSpots.map((s, i) => `${i + 1}. ${s.name}（${s.duration}分钟）`).join("\n");

    const prompt = `为游客规划翠玉景区游览路线：
游客兴趣：${(interests || []).join("、") || "综合"}
游览时长：${duration}分钟
体力情况：${difficulty === "easy" ? "轻松" : difficulty === "medium" ? "一般" : "充沛"}

可选景点：
${spotList}

请生成一个JSON格式的路线方案，包含：
- name: 路线名称（有诗意）
- description: 路线简介（100字以内，有东方园林风格）
- highlights: 路线亮点数组（3-4个短语）
- tips: 游览小贴士（50字以内）

只返回JSON，不要其他内容。`;

    const response = await stepChat({
      model: "step-3.7-flash",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
    });

    let routePlan = { name: "翠玉游览路线", description: "感受东方园林之美", highlights: ["湖光山色", "古迹探幽"], tips: "建议早晨出行，避开人流高峰" };
    try {
      const content = response.choices?.[0]?.message?.content ?? "{}";
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      routePlan = JSON.parse(cleaned);
    } catch {
      // use default
    }

    return NextResponse.json({
      route: {
        ...routePlan,
        spots: selectedSpots,
        totalDuration: selectedSpots.reduce((sum, s) => sum + s.duration, 0),
        totalDistance: `约${(selectedSpots.length * 0.8).toFixed(1)}千米`,
        interest: (interests || [])[0] || "cultural",
      },
    });
  } catch (error) {
    console.error("[POST /api/routes/generate]", error);
    return NextResponse.json({ error: "Failed to generate route" }, { status: 500 });
  }
}
