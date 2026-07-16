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
    const { interests, duration, difficulty = "easy", spots: clientSpots } = await request.json();

    // Fetch matching spots (fallback to database if not provided by client)
    const allSpots = clientSpots && clientSpots.length > 0
      ? clientSpots
      : await db.select().from(spots).where(eq(spots.isActive, true));

    let matchingSpots = allSpots.filter((s: any) => {
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
        return keywords.some((kw) => 
          s.category === interest || 
          (s.type && s.type.includes(kw)) || 
          tags.some((t: string) => t.includes(kw))
        );
      });
    });

    // If matching spots is empty, fallback to using first few spots from all spots
    if (matchingSpots.length === 0) {
      matchingSpots = allSpots;
    }

    // Build a route based on duration
    const maxSpots = duration <= 90 ? 2 : duration <= 150 ? 3 : 4;
    const selectedSpots = matchingSpots.slice(0, maxSpots);

    const spotList = selectedSpots.map((s: any, i: number) => `${i + 1}. ${s.name}（${s.duration || 30}分钟）`).join("\n");

    const prompt = `为游客规划景区游览路线：
游客兴趣：${(interests || []).join("、") || "综合"}
游览时长：${duration}分钟
体力情况：${difficulty === "easy" ? "轻松" : difficulty === "medium" ? "一般" : "充沛"}

可选景点：
${spotList}

请生成一个JSON格式的路线方案，包含：
- name: 路线名称（有诗意，贴合选定景点特色）
- description: 路线简介（100字以内，语气优美）
- highlights: 路线亮点数组（3-4个短语）
- tips: 游览小贴士（50字以内）

只返回JSON，不要其他内容。`;

    const response = await stepChat({
      model: "step-3.7-flash",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
    });

    let routePlan = { name: "定制游览路线", description: "感受独特的美景之旅", highlights: ["核心打卡", "深度漫游"], tips: "建议早晨出行，避开人流高峰" };
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
        totalDuration: selectedSpots.reduce((sum: number, s: any) => sum + (s.duration || 30), 0),
        totalDistance: `约${(selectedSpots.length * 0.8).toFixed(1)}千米`,
        interest: (interests || [])[0] || "cultural",
      },
    });
  } catch (error) {
    console.error("[POST /api/routes/generate]", error);
    return NextResponse.json({ error: "Failed to generate route" }, { status: 500 });
  }
}
