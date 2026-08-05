import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { spots } from "@/lib/db/schema/spots";
import { stepChat } from "@/lib/api/stepfun";
import { eq } from "drizzle-orm";

interface SpotItem {
  id: number | string;
  name: string;
  duration?: number;
  lat?: number;
  lng?: number;
  category?: string;
  tags?: string[];
  type?: string;
}

// Calculate approximate distance between two lat/lng coordinates in km
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Generate human-friendly transit instructions between spots
function generateTransitInstructions(selectedSpots: SpotItem[]) {
  const transitSteps: Array<{ from: string; to: string; mode: string; duration: number; distanceStr: string; desc: string }> = [];

  for (let i = 0; i < selectedSpots.length - 1; i++) {
    const s1 = selectedSpots[i];
    const s2 = selectedSpots[i + 1];

    let dist = 1.2;
    if (s1.lat && s1.lng && s2.lat && s2.lng) {
      dist = calculateDistance(s1.lat, s1.lng, s2.lat, s2.lng);
    }

    let mode = "步行";
    let durationMin = Math.round(dist * 12);
    let desc = `从【${s1.name}】步行约 ${durationMin} 分钟可达【${s2.name}】`;

    if (dist > 5) {
      mode = "打车/观光车";
      durationMin = Math.round(dist * 2.5 + 10);
      desc = `距离约 ${dist.toFixed(1)} km，建议乘坐打车或网约车，约 ${durationMin} 分钟`;
    } else if (dist > 1.5) {
      mode = "公共交通/地铁";
      durationMin = Math.round(dist * 4 + 8);
      desc = `距离约 ${dist.toFixed(1)} km，建议乘坐地铁或景区接驳车，约 ${durationMin} 分钟`;
    } else {
      durationMin = Math.max(8, durationMin);
      desc = `距离约 ${(dist * 1000).toFixed(0)} 米，漫步沿途风光约 ${durationMin} 分钟`;
    }

    transitSteps.push({
      from: s1.name,
      to: s2.name,
      mode,
      duration: durationMin,
      distanceStr: dist < 1 ? `${Math.round(dist * 1000)}米` : `${dist.toFixed(1)}公里`,
      desc,
    });
  }

  return transitSteps;
}

export async function POST(request: NextRequest) {
  try {
    const { interests, duration = 120, difficulty = "easy", spots: clientSpots } = await request.json();

    // Fetch matching spots (fallback to database if not provided by client)
    const allSpots: SpotItem[] = clientSpots && clientSpots.length > 0
      ? clientSpots
      : await db.select().from(spots).where(eq(spots.isActive, true));

    let matchingSpots = allSpots.filter((s: SpotItem) => {
      if (!interests || interests.length === 0) return true;
      const tags = s.tags || [];
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

    if (matchingSpots.length === 0) {
      matchingSpots = allSpots;
    }

    // Determine max spots based on user specified duration
    const maxSpots = duration <= 60 ? 2 : duration <= 120 ? 3 : 4;
    const selectedSpots = matchingSpots.slice(0, maxSpots);

    // Calculate transit steps & total time
    const transitSteps = generateTransitInstructions(selectedSpots);
    const totalTransitMin = transitSteps.reduce((sum, step) => sum + step.duration, 0);
    const totalSpotMin = selectedSpots.reduce((sum, s) => sum + (s.duration || 45), 0);
    const requiredTotalMin = totalSpotMin + totalTransitMin;

    // Feasibility note check
    let feasibilityWarning = null;
    if (duration < requiredTotalMin - 15) {
      feasibilityWarning = `游玩建议：游览${selectedSpots.length}个景点及穿梭换乘预计需约${requiredTotalMin}分钟。当前设定时间较紧，建议适度延长行程或优先打卡核心景点。`;
    }

    const spotListStr = selectedSpots.map((s, i) => `${i + 1}. ${s.name}（建议游玩${s.duration || 45}分钟）`).join("\n");

    const prompt = `为游客规划景区游览路线：
游客兴趣：${(interests || []).join("、") || "综合"}
设定游览时长：${duration}分钟
推荐景点与穿梭：
${spotListStr}
交通换乘耗时：约${totalTransitMin}分钟

请生成一个JSON格式的路线方案，包含：
- name: 路线名称（有诗意，贴合选定景点特色）
- description: 路线简介（100字以内，语气优美）
- highlights: 路线亮点数组（3-4个短语）
- tips: 游览小贴士（50字以内，包含交通或最佳出行时段建议）

只返回JSON，不要其他内容。`;

    let routePlan = {
      name: "定制游览路线",
      description: "感受独特的美景与人文之旅",
      highlights: ["核心打卡", "舒适穿梭", "深度漫游"],
      tips: "建议早晨出行，搭配便利交通工具享受轻松行程",
    };

    try {
      const response = await stepChat({
        model: "step-3.7-flash",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
      });
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
        transitSteps,
        feasibilityWarning,
        totalDuration: requiredTotalMin,
        totalDistance: `约${(selectedSpots.length * 1.1).toFixed(1)}公里`,
        interest: (interests || [])[0] || "cultural",
      },
    });
  } catch (error) {
    console.error("[POST /api/routes/generate]", error);
    return NextResponse.json({ error: "Failed to generate route" }, { status: 500 });
  }
}
