import { NextRequest, NextResponse } from "next/server";

const TRACK_TEXTS: Record<string, string> = {
  heritage: "蜀绣，又名川绣，是中国四大名绣之一。今天，让我们一起走进锦江两岸的刺绣工坊，感受匠人心尖上的温度与指尖上的华彩。",
  celebrities: "草堂留后世，诗圣杜甫流落至成都，在此创作了春夜喜雨等无数脍炙人口的经典诗篇。",
  history: "成都，简称蓉，是一座有着三千余年建城史的历史文化名城，从宝墩遗址到金沙文明，古蜀先民创造了璀璨的青铜文明。",
  food: "川菜作为中国四大菜系之一，以一菜一格，百菜百味闻名天下。成都火锅更是码头文化的缩影。",
  life: "老茶馆的慢时光，走进街角的老茶馆，一把竹椅，一张矮木桌，茶馆不仅是喝茶的地方，更是最本真的市井烟火气。",
  landmarks: "宽窄巷子是成都极具代表性的历史文化保护区，完美保留了清末民初的四合院落风貌。",
  legends: "在成都金沙遗址出土的太阳神鸟金饰，四只神鸟承载着古蜀国的飞天梦想，成为中国文化遗产的标志。"
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const track = searchParams.get("track") || "history";
  const text = TRACK_TEXTS[track] || "欢迎收听伴游FM，祝您旅途愉快！";

  // Redirect to qa/tts endpoint to produce speech audio
  const ttsUrl = new URL("/api/qa/tts", request.url);
  ttsUrl.searchParams.set("text", text);

  return NextResponse.redirect(ttsUrl);
}
