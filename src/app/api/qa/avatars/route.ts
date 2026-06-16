import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { avatarConfigs } from "@/lib/db/schema/admin";
import { eq, desc } from "drizzle-orm";

// 5 Female & 5 Male realistic portrait presets
const DEFAULT_PRESETS = [
  {
    name: "AI数字人",
    avatarStyle: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80",
    voiceStyle: "lively",
    speechRate: 100,
    pitch: 100,
    greeting: "您好，欢迎来到翠玉景区！我是您的AI数字人导览官小玉，很高兴为您服务。",
    isDefault: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80"
  },
  {
    name: "职场专家",
    avatarStyle: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80",
    voiceStyle: "professional",
    speechRate: 100,
    pitch: 100,
    greeting: "您好，我是您的景区历史文化讲解专家，有什么需要解答的吗？",
    isDefault: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80"
  },
  {
    name: "元气甜妹",
    avatarStyle: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&h=400&q=80",
    voiceStyle: "lively",
    speechRate: 105,
    pitch: 110,
    greeting: "嗨！我是元气满满的导览小甜，今天想和我一起去哪里打卡呢？",
    isDefault: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&h=400&q=80"
  },
  {
    name: "古风女子",
    avatarStyle: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&h=400&q=80",
    voiceStyle: "warm",
    speechRate: 95,
    pitch: 95,
    greeting: "客官安好。小女子在此恭候多时，愿为您细细道来景区的千年风华。",
    isDefault: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&h=400&q=80"
  },
  {
    name: "韩系女神",
    avatarStyle: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=400&q=80",
    voiceStyle: "warm",
    speechRate: 100,
    pitch: 105,
    greeting: "你好呀！今天天气很棒，让我带你一同领略这里的浪漫美景吧。",
    isDefault: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=400&q=80"
  },
  {
    name: "元气少年",
    avatarStyle: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&h=400&q=80",
    voiceStyle: "lively",
    speechRate: 105,
    pitch: 100,
    greeting: "嗨！我是元气少年阿杰，今天就跟着我开启探险之旅吧！",
    isDefault: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&h=400&q=80"
  },
  {
    name: "商业精英",
    avatarStyle: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80",
    voiceStyle: "professional",
    speechRate: 100,
    pitch: 90,
    greeting: "您好，我是您的专业导览顾问，我们将为您作景点最详实的解说。",
    isDefault: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80"
  },
  {
    name: "潮流酷哥",
    avatarStyle: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&h=400&q=80",
    voiceStyle: "lively",
    speechRate: 100,
    pitch: 95,
    greeting: "Yo! 欢迎来玩，我是潮流导游阿星，带你解锁这里最酷的打卡点。",
    isDefault: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&h=400&q=80"
  },
  {
    name: "阳光运动男",
    avatarStyle: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&h=400&q=80",
    voiceStyle: "lively",
    speechRate: 105,
    pitch: 100,
    greeting: "哈哈，你好！今天准备挑战哪条徒步路线？交给我来带路！",
    isDefault: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&h=400&q=80"
  },
  {
    name: "儒雅书生",
    avatarStyle: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80",
    voiceStyle: "warm",
    speechRate: 90,
    pitch: 95,
    greeting: "久仰大名，在下子轩。愿借此良辰美景，同阁下共话这景区古今史诗。",
    isDefault: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80"
  }
];

export async function GET() {
  try {
    let configs = await db.select().from(avatarConfigs).where(eq(avatarConfigs.isActive, true)).orderBy(desc(avatarConfigs.createdAt));
    
    // Seed database if configurations are incomplete or outdated
    if (configs.length < 10) {
      await db.delete(avatarConfigs);
      for (const preset of DEFAULT_PRESETS) {
        await db.insert(avatarConfigs).values(preset);
      }
      configs = await db.select().from(avatarConfigs).where(eq(avatarConfigs.isActive, true)).orderBy(desc(avatarConfigs.createdAt));
    }
    
    return NextResponse.json(configs);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch avatars" }, { status: 500 });
  }
}
