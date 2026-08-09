import { config } from "dotenv";
config({ path: ".env" });

import { db } from "./src/lib/db/client";
import { spots } from "./src/lib/db/schema/spots";
import { routes } from "./src/lib/db/schema/routes";
import { knowledgeDocs, avatarConfigs, analyticsDaily } from "./src/lib/db/schema/admin";

async function seed() {
  console.log("Seeding database...");

  // Clean old data to ensure coordinates are updated and no duplicates are created
  await db.delete(routes);
  await db.delete(spots);

  await db.insert(spots).values([
    {
      name: "揽月亭",
      category: "cultural",
      description: "始建于明代的八角揽月亭，是景区制高点，登亭可俯瞰整个翠玉湖全景。每逢中秋，此处是赏月胜地。亭内有清代石碑两块，记载了历代修缮记录。",
      imageUrl: "/images/spots/placeholder.svg",
      duration: 20,
      distance: "距入口800米",
      tags: ["历史", "观景", "明代"],
      rating: 48,
      visitCount: 3820,
      location: { lat: 29.564, lng: 106.579 },
      sortOrder: 1,
    },
    {
      name: "翠玉湖",
      category: "nature",
      description: "翠玉湖因湖水清澈碧绿如翠玉而得名，湖面面积约12公顷，最深处达8米。湖中有鸳鸯、野鸭等水鸟常年栖息，春季荷花盛开时景色尤为壮观。",
      imageUrl: "/images/spots/placeholder.svg",
      duration: 40,
      distance: "距入口300米",
      tags: ["自然", "湖泊", "摄影"],
      rating: 49,
      visitCount: 5230,
      location: { lat: 29.566, lng: 106.575 },
      sortOrder: 2,
    },
    {
      name: "听松轩",
      category: "cultural",
      description: "听松轩是一处幽静的茶舍，掩映在百年古松之间。此处松涛阵阵，清风徐来，是游客休憩品茗的好去处。轩内陈设古朴，提供景区特色翠玉竹叶茶。",
      imageUrl: "/images/spots/placeholder.svg",
      duration: 30,
      distance: "距入口1.2千米",
      tags: ["文化", "茶艺", "休憩"],
      rating: 46,
      visitCount: 2150,
      location: { lat: 29.562, lng: 106.576 },
      sortOrder: 3,
    },
    {
      name: "百花谷",
      category: "nature",
      description: "百花谷长约500米，谷内种植了来自全国各地的300余种花卉。春秋两季百花齐放，色彩斑斓，香气四溢。谷中有专属蝴蝶观察区，是亲子游览的热门选择。",
      imageUrl: "/images/spots/placeholder.svg",
      duration: 35,
      distance: "距入口600米",
      tags: ["自然", "花卉", "亲子"],
      rating: 47,
      visitCount: 4100,
      location: { lat: 29.565, lng: 106.573 },
      sortOrder: 4,
    },
    {
      name: "古窑遗址",
      category: "history",
      description: "宋代官窑遗址，出土陶瓷文物逾千件，现已建成专题博物馆。展馆内可见当年烧窑场景的复原陈列，并有专业讲解员介绍宋代陶瓷工艺。部分展品为国家二级文物。",
      imageUrl: "/images/spots/placeholder.svg",
      duration: 50,
      distance: "距入口1.5千米",
      tags: ["历史", "文物", "宋代"],
      rating: 45,
      visitCount: 1890,
      location: { lat: 29.560, lng: 106.570 },
      sortOrder: 5,
    },
    {
      name: "溪流栈道",
      category: "nature",
      description: "沿溪流修建的木质栈道全长1.2千米，蜿蜒穿行于竹林与山涧之间。溪水清澈见底，可见游鱼，途中有三处跌水瀑布，每处落差约3-5米。",
      imageUrl: "/images/spots/placeholder.svg",
      duration: 45,
      distance: "距入口400米",
      tags: ["自然", "溪流", "步道"],
      rating: 48,
      visitCount: 3560,
      location: { lat: 29.563, lng: 106.572 },
      sortOrder: 6,
    },
  ]).onConflictDoNothing();

  await db.insert(routes).values([
    {
      name: "历史文化精华游",
      description: "穿越千年历史长廊，深度感受翠玉景区的历史底蕴。从揽月亭的明代建筑到古窑遗址的宋代陶瓷文明，领略不同朝代的文化遗产。",
      interest: "history",
      duration: 150,
      difficulty: "easy",
      spotIds: [1, 3, 5],
      highlights: ["明代古亭", "清代石碑", "宋代官窑", "古琴演奏"],
      totalDistance: "约3.5千米",
      imageUrl: "/images/spots/placeholder.svg",
      isPublic: true,
    },
    {
      name: "自然生态漫步游",
      description: "置身山水之间，感受翠玉景区的生态之美。翠玉湖的碧波荡漾、百花谷的姹紫嫣红、溪流栈道的竹影婆娑，让您与自然亲密接触。",
      interest: "nature",
      duration: 120,
      difficulty: "easy",
      spotIds: [2, 4, 6],
      highlights: ["湖光山色", "百花盛开", "观鸟平台", "溪流瀑布"],
      totalDistance: "约2.8千米",
      imageUrl: "/images/spots/placeholder.svg",
      isPublic: true,
    },
    {
      name: "亲子欢乐全景游",
      description: "专为家庭游客设计的亲子路线，寓教于乐。百花谷的蝴蝶观察区、翠玉湖的水鸟科普，让孩子在玩乐中收获知识。",
      interest: "family",
      duration: 180,
      difficulty: "easy",
      spotIds: [4, 2, 5, 3],
      highlights: ["蝴蝶科普", "水鸟观察", "陶瓷文化", "茶艺体验"],
      totalDistance: "约4千米",
      imageUrl: "/images/spots/placeholder.svg",
      isPublic: true,
    },
    {
      name: "人文韵味深度游",
      description: "感受东方园林的人文情怀，从古建筑的精妙设计到传统茶文化的悠然意境，每一处都凝聚着匠人精神与文人雅趣。",
      interest: "cultural",
      duration: 100,
      difficulty: "easy",
      spotIds: [1, 3, 6],
      highlights: ["园林建筑", "竹林茶道", "松间品茗", "栈道寻幽"],
      totalDistance: "约3千米",
      imageUrl: "/images/spots/placeholder.svg",
      isPublic: true,
    },
  ]).onConflictDoNothing();

  await db.insert(avatarConfigs).values([
    {
      name: "小玉·温暖版",
      avatarStyle: "default",
      voiceStyle: "warm",
      speechRate: 100,
      pitch: 105,
      greeting: "您好，欢迎来到翠玉景区！我是您的专属AI导览小玉，请问有什么可以帮助您的吗？",
      isDefault: true,
      isActive: true,
    },
    {
      name: "小玉·专业版",
      avatarStyle: "modern",
      voiceStyle: "professional",
      speechRate: 95,
      pitch: 100,
      greeting: "尊敬的游客，欢迎莅临翠玉景区。本系统已为您准备好完整的导览服务，请告知您的游览需求。",
      isDefault: false,
      isActive: true,
    },
  ]).onConflictDoNothing();

  await db.insert(knowledgeDocs).values([
    {
      title: "翠玉景区概况介绍",
      category: "general",
      content: "翠玉景区位于江南水乡，占地面积约800公顷，始建于北宋年间，是国家AAAA级风景名胜区。景区内汇集了山、水、林、园等多种自然景观，并保存有大量历史文化遗迹，年接待游客超过200万人次。",
      fileType: "text",
      tags: ["概况", "历史", "基础信息"],
      status: "active",
      vectorized: true,
    },
    {
      title: "景区票务与开放时间",
      category: "faq",
      content: "成人票：80元/人；学生票（凭证件）：40元/人；老年票（60岁以上凭证件）：免费；儿童（1.2米以下）：免费。旺季（4-10月）8:00-17:30，淡季（11-3月）8:30-17:00。全年无休。",
      fileType: "text",
      tags: ["票务", "时间", "价格"],
      status: "active",
      vectorized: true,
    },
    {
      title: "景区交通指南",
      category: "transport",
      content: "公共交通：乘坐地铁2号线至翠玉站，步行约15分钟；或乘坐公交38路、56路至翠玉景区站直达。自驾：景区附近有P1（500辆）、P2（300辆）两个停车场，停车费15元/天。",
      fileType: "text",
      tags: ["交通", "地铁", "公交", "停车"],
      status: "active",
      vectorized: true,
    },
    {
      title: "揽月亭历史文献",
      category: "spot",
      content: "揽月亭始建于明代嘉靖年间（1522-1566年），初名观月台，清代乾隆年间重修并更名为揽月亭。亭为八角重檐结构，高约12米，采用苏式彩画装饰，飞檐翘角，典雅庄重。现存清代石碑两块，分别为乾隆二十三年和道光十五年修缮记录。",
      fileType: "text",
      tags: ["揽月亭", "明代", "历史"],
      status: "active",
      vectorized: true,
    },
    {
      title: "景区餐饮服务",
      category: "faq",
      content: "景区内设有三处餐饮区：翠园食府（正餐，人均60-100元）、听松轩茶舍（茶点，人均30-50元）、湖畔小食（快餐，人均20-40元）。推荐翠玉糕、荷叶糯米饭等本地特色。",
      fileType: "text",
      tags: ["餐饮", "美食", "茶艺"],
      status: "active",
      vectorized: true,
    },
  ]).onConflictDoNothing();

  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const base = 800 + Math.floor(Math.random() * 400);

    await db.insert(analyticsDaily).values({
      date: dateStr,
      totalVisitors: base,
      totalSessions: Math.floor(base * 0.8),
      totalQuestions: Math.floor(base * 2.5),
      satisfactionScore: 43 + Math.floor(Math.random() * 5),
      topSpotIds: [2, 1, 4, 6],
      topQuestions: ["揽月亭有什么历史故事？", "景区哪里可以吃饭？", "翠玉湖怎么去？", "门票多少钱？", "停车场在哪里？"],
      sentimentPositive: Math.floor(base * 0.72),
      sentimentNeutral: Math.floor(base * 0.22),
      sentimentNegative: Math.floor(base * 0.06),
    }).onConflictDoNothing();
  }

  console.log("Seed completed!");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
