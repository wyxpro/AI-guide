import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { ai } from "@eazo/sdk";
import { deepseekChat } from "@/lib/api/deepseek";
import { getUserPreferences } from "@/lib/db/queries/user-data";
import { getVisitRecordsByUser } from "@/lib/db/queries/user-data";
import { db } from "@/lib/db/client";
import { spots } from "@/lib/db/schema/spots";
import { eq } from "drizzle-orm";

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 6) return "深夜";
  if (h < 10) return "清晨";
  if (h < 12) return "上午";
  if (h < 14) return "中午";
  if (h < 17) return "下午";
  if (h < 19) return "傍晚";
  return "夜晚";
}

export async function GET(request: NextRequest) {
  const result = requireAuth(request);
  if (!result.ok) {
    return NextResponse.json({ greeting: "您好！欢迎来到翠玉景区，我是导览官小玉 ✨" });
  }
  const { id: userId, name } = result.user as { id: string; name?: string; username?: string };
  const displayName = (name as string) || "游客";
  const timeOfDay = getTimeOfDay();

  try {
    const [prefs, visits] = await Promise.all([
      getUserPreferences(userId),
      getVisitRecordsByUser(userId),
    ]);

    let lastSpot = null;
    if (visits[0]?.spotId) {
      const spotRow = await db.select({ name: spots.name }).from(spots).where(eq(spots.id, visits[0].spotId)).limit(1);
      if (spotRow[0]) {
        lastSpot = spotRow[0].name;
      }
    }
    const mode = prefs?.accessibilityMode ?? "normal";
    const interests = (prefs?.interests as string[] | null)?.slice(0, 2).join("、") || "";

    const systemPrompt = `你是翠玉景区AI导览官小玉，为游客生成个性化欢迎语。
要求：
- 称呼游客姓名"${displayName}"
- 结合时段"${timeOfDay}"
- ${lastSpot ? `提及上次游览的"${lastSpot}"` : "鼓励开始探索"}
- ${interests ? `结合兴趣偏好"${interests}"` : ""}
- ${mode === "elder" ? "语气温和简洁，适合老年人" : mode === "child" ? "活泼可爱，适合小朋友" : "自然亲切"}
- 限制：30字以内，不要带任何emoji，不要说"欢迎来到"`;

    const response = await deepseekChat({
      model: "deepseek-v4-pro",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "生成欢迎语" },
      ],
      max_tokens: 80,
    });

    const greeting = response.choices?.[0]?.message?.content?.trim()
      ?? `${timeOfDay}好，${displayName}！今日翠玉景色正好，欢迎继续探索。`;

    return NextResponse.json({ greeting });
  } catch {
    return NextResponse.json({
      greeting: `${timeOfDay}好，${displayName}！今日翠玉景色正好，随时向我提问。`,
    });
  }
}
