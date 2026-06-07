export interface NationalSpot {
  id: number;
  name: string;
  category: "cultural" | "nature" | "history" | "family";
  city: string;
  description: string;
  imageUrl: string;
  audioGuide?: string;
  duration: number;
  distance: string;
  rating: number;
  visitCount: number;
  tags: string[];
  location: { lat: number; lng: number };
}

export const CITIES = [
  { id: "beijing", name: "北京", icon: "🏯" },
  { id: "xian", name: "西安", icon: "📜" },
  { id: "hangzhou", name: "杭州", icon: "⛵" },
  { id: "chengdu", name: "成都", icon: "🐼" },
  { id: "shanghai", name: "上海", icon: "🗼" },
  { id: "chongqing", name: "重庆", icon: "🌶️" },
  { id: "suzhou", name: "苏州", icon: "🛶" },
  { id: "xiamen", name: "厦门", icon: "🏖️" },
  { id: "guilin", name: "桂林", icon: "⛰️" },
  { id: "lijiang", name: "丽江", icon: "❄️" },
];

export const NATIONAL_SPOTS: NationalSpot[] = [
  // 北京
  {
    id: 10001,
    name: "北京故宫博物院",
    category: "history",
    city: "北京",
    description: "北京故宫是世界上现存规模最大、保存最为完整的木质结构古建筑之一，明清两代的皇家宫殿，被誉为世界五大宫之首。这里收藏了上百万件珍贵的历史文物，是了解中国古代历史与皇家文化的必游之地。",
    imageUrl: "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1000&q=80",
    duration: 240,
    distance: "北京市中心",
    rating: 49,
    visitCount: 154000,
    tags: ["皇家宫殿", "历史文化", "世界遗产", "国宝级文物"],
    location: { lat: 39.9163, lng: 116.3972 }
  },
  {
    id: 10002,
    name: "八达岭长城",
    category: "history",
    city: "北京",
    description: "八达岭长城是万里长城向游人开放最早的路段，山峦起伏之间长城如巨龙盘旋。其地势险要，建筑雄伟，是中华民族伟大力量与智慧的象征，也是中外游客打卡中国的第一地标。",
    imageUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1000&q=80",
    duration: 180,
    distance: "距北京市中心约60公里",
    rating: 48,
    visitCount: 98000,
    tags: ["雄伟长城", "世界奇迹", "登高望远", "壮丽山景"],
    location: { lat: 40.3601, lng: 116.0125 }
  },
  // 西安
  {
    id: 10003,
    name: "秦始皇兵马俑博物馆",
    category: "history",
    city: "西安",
    description: "被誉为“世界第八大奇迹”的秦始皇兵马俑，展示了中国历史上第一个皇帝秦始皇的地下浩荡大军。成百上千个神态各异、雕刻精美的陶俑陶马整齐列队，场面震撼人心，展现了极高的古代秦代工艺水准。",
    imageUrl: "https://images.unsplash.com/photo-1599889958709-e609f27d1191?w=1000&q=80",
    duration: 150,
    distance: "距西安市中心约30公里",
    rating: 49,
    visitCount: 128000,
    tags: ["世界奇迹", "秦代遗迹", "考古巨制", "震撼人心"],
    location: { lat: 34.3841, lng: 109.2785 }
  },
  {
    id: 10004,
    name: "西安古城墙",
    category: "cultural",
    city: "西安",
    description: "西安城墙是中国现存规模最大、保存最完整的古代城垣建筑，始建于明代。城墙呈长方形，全长13.7公里。游客可以在宽阔的城墙上租辆自行车骑行，俯瞰城墙内外古老与现代交融的市井风光。",
    imageUrl: "https://images.unsplash.com/photo-1582236968779-7a5611f7c177?w=1000&q=80",
    duration: 120,
    distance: "西安市中心",
    rating: 47,
    visitCount: 75000,
    tags: ["隋唐遗风", "骑行打卡", "古老城垣", "夜景极美"],
    location: { lat: 34.2543, lng: 108.9424 }
  },
  // 杭州
  {
    id: 10005,
    name: "杭州西湖风景区",
    category: "nature",
    city: "杭州",
    description: "西湖凭着独有的湖光山色和深厚的人文底蕴，被列入《世界遗产名录》。苏堤春晓、断桥残雪、平湖秋月等西湖十景如诗如画。漫步湖畔或乘画舫泛舟湖上，能深刻体会“淡妆浓抹总相宜”的江南意境。",
    imageUrl: "https://images.unsplash.com/photo-1596495573105-d1a6a5b49d9d?w=1000&q=80",
    duration: 180,
    distance: "杭州市中心",
    rating: 49,
    visitCount: 189000,
    tags: ["湖光山色", "世界遗产", "浪漫断桥", "诗画江南"],
    location: { lat: 30.2439, lng: 120.1472 }
  },
  {
    id: 10006,
    name: "灵隐寺",
    category: "cultural",
    city: "杭州",
    description: "灵隐寺创建于东晋年间，是杭州历史最悠久、名声最响亮的江南古刹。寺庙掩映在飞来峰的奇石翠竹之中，清幽庄严，佛香缭绕，寺内供奉众多精美佛像，是中外游客祈福静心的极佳去处。",
    imageUrl: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1000&q=80",
    duration: 120,
    distance: "西湖景区西北侧",
    rating: 48,
    visitCount: 84000,
    tags: ["佛教圣地", "祈福静心", "飞来峰石刻", "千年古刹"],
    location: { lat: 30.2413, lng: 120.0969 }
  },
  // 成都
  {
    id: 10007,
    name: "成都大熊猫繁育研究基地",
    category: "family",
    city: "成都",
    description: "这里是全球知名的大熊猫保护与科研繁育基地。基地内翠竹环抱，绿意盎然，模拟了大熊猫的野外生存环境。在这里，你可以近距离观看不同年龄段的大熊猫嬉戏、吃竹子，还有超萌的熊猫幼仔和红熊猫。",
    imageUrl: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=1000&q=80",
    duration: 180,
    distance: "距成都市中心约10公里",
    rating: 49,
    visitCount: 162000,
    tags: ["国宝熊猫", "亲子游推荐", "科研科普", "生态绿肺"],
    location: { lat: 30.7335, lng: 104.1437 }
  },
  {
    id: 10008,
    name: "锦里古街",
    category: "cultural",
    city: "成都",
    description: "锦里古街紧邻武侯祠，以明清川西民居为基础，融入了丰富的三国文化。青石板路两旁茶楼林立，商铺高挂红灯笼。这里汇集了三大炮、叶儿粑等四川地道小吃，还有皮影戏、变脸等民间民俗表演，充满烟火气。",
    imageUrl: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1000&q=80",
    duration: 90,
    distance: "成都市中心武侯区",
    rating: 46,
    visitCount: 95000,
    tags: ["川味小吃", "市井风情", "变脸表演", "茶馆文化"],
    location: { lat: 30.6485, lng: 104.0493 }
  },
  // 上海
  {
    id: 10009,
    name: "上海外滩",
    category: "cultural",
    city: "上海",
    description: "外滩是上海开埠的起点，也是这座国际大都市的象征。黄浦江西岸矗立着52幢风格各异的古典复兴洋楼，被称为“万国建筑博览群”；东岸则是高耸入云的陆家嘴现代摩天大楼。夜幕降临，两岸灯光秀璀璨夺目。",
    imageUrl: "https://images.unsplash.com/photo-1508873696983-2df519f0397e?w=1000&q=80",
    duration: 90,
    distance: "上海市黄浦区江畔",
    rating: 48,
    visitCount: 145000,
    tags: ["万国建筑", "魔都地标", "璀璨夜景", "江风漫步"],
    location: { lat: 31.2406, lng: 121.4904 }
  },
  {
    id: 10010,
    name: "老城厢豫园",
    category: "cultural",
    city: "上海",
    description: "豫园是著名的江南古典园林，始建于明代，已有400余年历史。园内亭台楼阁玲珑雅致，水榭回廊错落有致，以“奇秀甲江南”的太湖石排山和精美浮雕著称。豫园外的老城厢九曲桥也是品尝小笼包的胜地。",
    imageUrl: "https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=1000&q=80",
    duration: 120,
    distance: "黄浦区老城厢中心",
    rating: 46,
    visitCount: 68000,
    tags: ["古典园林", "老上海风情", "九曲桥打卡", "传统年味"],
    location: { lat: 31.2272, lng: 121.4921 }
  },
  // 重庆
  {
    id: 10011,
    name: "洪崖洞民俗风貌区",
    category: "cultural",
    city: "重庆",
    description: "洪崖洞位于嘉陵江畔的悬崖峭壁上，是极具巴渝传统建筑特色的“吊脚楼”风貌群。依山就势，高低错落。每当夜幕降临，整座建筑金碧辉煌，在江水的倒影下如同梦幻的动漫天宫，是重庆最具人气的魔幻夜景打卡点。",
    imageUrl: "https://images.unsplash.com/photo-1627914488349-f9c49d63e9f4?w=1000&q=80",
    duration: 120,
    distance: "重庆市渝中区江畔",
    rating: 49,
    visitCount: 139000,
    tags: ["魔幻吊脚楼", "千与千寻夜景", "立体交通", "江景美食"],
    location: { lat: 29.5639, lng: 106.5796 }
  },
  {
    id: 10012,
    name: "武隆天生三桥",
    category: "nature",
    city: "重庆",
    description: "这是世界规模最大、最高的天然石桥群，属于典型的喀斯特地貌。天龙桥、青龙桥和黑龙桥三座天然石拱桥横跨在万丈深渊的峡谷之上，谷底溪流潺潺，飞泉垂悬。这里也是著名电影《满城尽带黄金甲》的取景地。",
    imageUrl: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1000&q=80",
    duration: 180,
    distance: "距重庆市区约2.5小时车程",
    rating: 48,
    visitCount: 52000,
    tags: ["喀斯特地貌", "大自然奇迹", "峡谷幽深", "大片取景地"],
    location: { lat: 29.3515, lng: 107.8021 }
  },
  // 苏州
  {
    id: 10013,
    name: "拙政园",
    category: "history",
    city: "苏州",
    description: "拙政园是苏州园林的杰出代表，也是中国四大名园之首。全园以水为中心，山水萦绕，亭台错落。长廊逶迤，借景巧妙，粉墙黛瓦，竹树婆娑，极尽文人墨客的清雅意境，是展现中国古典美学巅峰的经典力作。",
    imageUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=1000&q=80",
    duration: 150,
    distance: "苏州市姑苏区",
    rating: 49,
    visitCount: 88000,
    tags: ["苏州园林", "古典美学", "水木清华", "东方艺术"],
    location: { lat: 31.3259, lng: 120.6288 }
  },
  {
    id: 10014,
    name: "周庄古镇",
    category: "cultural",
    city: "苏州",
    description: "周庄有“中国第一水乡”之称，完整保存了江南水乡的经典格调。古镇依河成街，桥街相连，河道上横跨着多座元明清时期的古石桥。乘着一叶摇橹船穿行于粉墙黛瓦的古宅民居之间，听着吴侬软语的船歌，时光仿佛慢了下来。",
    imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1000&q=80",
    duration: 180,
    distance: "苏州市昆山市周庄镇",
    rating: 47,
    visitCount: 69000,
    tags: ["江南水乡", "摇橹船体验", "水墨古镇", "特色万三蹄"],
    location: { lat: 31.1166, lng: 120.8447 }
  },
  // 厦门
  {
    id: 10015,
    name: "鼓浪屿景区",
    category: "nature",
    city: "厦门",
    description: "鼓浪屿是座风光旖旎的浪漫海岛，因岛上西南隅有一巨礁受浪潮冲击声如擂鼓而得名。这里禁止机动车通行，完好保留了中西合璧的万国历史建筑，被称为“琴岛”和“万国建筑博览会”。阳光沙滩，绿树繁花，文艺气息十足。",
    imageUrl: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1000&q=80",
    duration: 240,
    distance: "厦门岛西南江畔",
    rating: 48,
    visitCount: 112000,
    tags: ["海岛风光", "文艺打卡", "万国老洋房", "钢琴之岛"],
    location: { lat: 24.4449, lng: 118.0636 }
  },
  {
    id: 10016,
    name: "曾厝垵文艺文创村",
    category: "family",
    city: "厦门",
    description: "曾厝垵三面临山，一临大海，曾经是个宁静的临海小渔村。如今这里蜕变为备受年轻人追捧的文艺文创村，各式特色民宿、创意小店、海鲜小吃摊位鳞次栉比，是体验厦门慵懒与浪漫民谣风情的好去处。",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&q=80",
    duration: 120,
    distance: "厦门思明区环岛南路旁",
    rating: 45,
    visitCount: 81000,
    tags: ["文艺小渔村", "小吃一条街", "特色民宿", "临海慢活"],
    location: { lat: 24.4283, lng: 118.1259 }
  },
  // 桂林
  {
    id: 10017,
    name: "阳朔漓江竹筏漫游",
    category: "nature",
    city: "桂林",
    description: "漓江是桂林山水的精华所在。这里奇峰耸立、江水清澈，翠竹摇曳。乘坐一叶竹筏顺流而下，黄布倒影、二十元人民币背景打卡地等美景扑面而来，人在画中游，是对漓江水墨风光最好的诠释。",
    imageUrl: "https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?w=1000&q=80",
    duration: 240,
    distance: "桂林至阳朔水上航段",
    rating: 49,
    visitCount: 93000,
    tags: ["桂林山水", "人民币背景", "竹筏漂流", "喀斯特峰峦"],
    location: { lat: 24.7785, lng: 110.4908 }
  },
  {
    id: 10018,
    name: "象鼻山景区",
    category: "nature",
    city: "桂林",
    description: "象鼻山地处漓江与桃花江汇合处，因山形酷似一只临江吸水的巨象而闻名，是桂林无可争议的城市象征和徽章。山中绿树覆盖，象鼻与象腿之间的水月洞有众多摩崖石刻，是一处自然美景与历史文化交融的奇观。",
    imageUrl: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1000&q=80",
    duration: 90,
    distance: "桂林市中心漓江畔",
    rating: 46,
    visitCount: 63000,
    tags: ["城市象征", "象山水月", "漓江江畔", "江边漫步"],
    location: { lat: 25.2676, lng: 110.2926 }
  },
  // 丽江
  {
    id: 10019,
    name: "丽江古城",
    category: "cultural",
    city: "丽江",
    description: "丽江古城（大研古镇）始建于宋末元初，拥有著名的纳西族民居、纵横交错的古朴石板街和清澈湍急的小桥流水。背靠圣洁的玉龙雪山，城内繁花似锦，民歌悠扬。无数都市人在这里停下脚步，体验慢节奏的慵懒生活。",
    imageUrl: "https://images.unsplash.com/photo-1520116468816-95b69f847357?w=1000&q=80",
    duration: 180,
    distance: "丽江市古城区",
    rating: 48,
    visitCount: 115000,
    tags: ["世界文化遗产", "纳西风情", "古老水车", "民谣慢生活"],
    location: { lat: 26.8722, lng: 100.2339 }
  },
  {
    id: 10020,
    name: "玉龙雪山国家级风景区",
    category: "nature",
    city: "丽江",
    description: "玉龙雪山是纳西族心目中的神山，十三座山峰银装素裹，绵延不绝。主峰扇子陡海拔5596米，险峻雄奇。你可以乘坐大索道直达冰川公园，近距离触摸千年冰川，或者欣赏倒映着巍峨雪山的翡翠蓝月谷。",
    imageUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1000&q=80",
    duration: 240,
    distance: "距丽江古城约15公里",
    rating: 49,
    visitCount: 87000,
    tags: ["终年积雪", "神山朝圣", "冰川大索道", "蓝月谷绝景"],
    location: { lat: 27.1009, lng: 100.1743 }
  }
];
