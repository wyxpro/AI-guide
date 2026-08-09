"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import {
  Compass, ArrowRight, Loader2, MapPin, Clock, ChevronLeft, ChevronRight,
  Share2, MessageSquare, ShieldAlert, Award, Search, Send,
  Volume2, VolumeX, Eye, BookOpen, Navigation, Landmark, Sparkles,
  X, Smile, Image as ImageIcon, Film, Mic, Menu, Bot, User
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { request } from "@/lib/api/request";
import { useEazo } from "@eazo/sdk/react";
import AMapLoader from "@amap/amap-jsapi-loader";

if (typeof window !== "undefined") {
  (window as any)._AMapSecurityConfig = {
    securityJsCode: process.env.NEXT_PUBLIC_AMAP_SECURITY_CODE || "",
  };
}

const SPRING = { type: "spring" as const, stiffness: 280, damping: 35 };

const INTERESTS = [
  { id: "history", label: "人文史学", emoji: "📖" },
  { id: "nature", label: "山水自然", emoji: "🏔️" },
  { id: "family", label: "亲子游览", emoji: "👨‍👩‍👧" },
  { id: "special_forces", label: "特种兵", emoji: "⚡" },
];

const TRAVEL_EMOJIS = ["😊", "👍", "🗺️", "🌟", "📸", "🏛️", "🍜", "❤️", "✨", "🙌", "🚗", "🌸"];

const CHONGQING_SPOTS = [
  { id: 1, name: "洪崖洞民俗风貌区", type: "地标", lat: 29.563, lng: 106.578, price: "免费", time: "全天开放", addr: "重庆市渝中区嘉陵江滨江路88号", distance: "距您 1.2km", rating: "5A景区", img: "/images/spots/10011.webp", desc: "以巴渝传统建筑特色的“吊脚楼”风貌为主体，依山就势，沿江而建。" },
  { id: 2, name: "解放碑步行街", type: "文化", lat: 29.557, lng: 106.577, price: "免费", time: "全天开放", addr: "重庆市渝中区民族路177号", distance: "距您 1.8km", rating: "4A景区", img: "/images/spots/10066.webp", desc: "重庆的标志性地标，纪念抗日战争胜利的纪念碑，也是繁华的商业中心。" },
  { id: 3, name: "朝天门广场", type: "地标", lat: 29.569, lng: 106.583, price: "免费", time: "全天开放", addr: "重庆市渝中区长滨路1号", distance: "距您 2.5km", rating: "4A景区", img: "/images/spots/route-3.webp", desc: "嘉陵江与长江交汇处，两江汇流，泾渭分明，雄伟壮观。" },
  { id: 4, name: "李子坝轻轨穿楼", type: "自然", lat: 29.553, lng: 106.517, price: "免费", time: "全天开放", addr: "重庆市渝中区李子坝正街39号", distance: "距您 5.4km", rating: "网红打卡点", img: "/images/spots/10067.webp", desc: "轻轨2号线穿楼而过，极具立体魔幻都市的特色景观。" },
  { id: 5, name: "磁器口古镇", type: "文化", lat: 29.582, lng: 106.452, price: "免费", time: "全天开放", addr: "重庆市沙坪坝区磁南街1号", distance: "距您 11km", rating: "4A景区", img: "/images/spots/10068.webp", desc: "一条石板路，千年磁器口。典型的川东民居古镇，特色小吃汇聚。" },
  { id: 6, name: "南山一棵树观景台", type: "自然", lat: 29.550, lng: 106.592, price: "¥30", time: "09:00-22:30", addr: "重庆市南岸区龙黄公路", distance: "距您 4.6km", rating: "4A景区", img: "/images/spots/route-6.webp", desc: "俯瞰渝中半岛、欣赏重庆魔幻璀璨夜景的绝佳地点。" },
  { id: 7, name: "长江索道", type: "地标", lat: 29.557, lng: 106.581, price: "¥20", time: "07:30-22:00", addr: "重庆市渝中区新华路151号", distance: "距您 1.5km", rating: "4A景区", img: "/images/spots/route-7.webp", desc: "重庆“空中公交”，滑行于两江之上，体验跨江凌空的震撼感。" },
  { id: 8, name: "罗汉寺", type: "寺庙", lat: 29.560, lng: 106.579, price: "¥20", time: "08:00-17:00", addr: "重庆市渝中区罗汉寺街7号", distance: "距您 1.4km", rating: "全国重点寺庙", img: "/images/spots/route-8.webp", desc: "千年古刹，闹市之中的静谧清修之地，电影《疯狂的石头》取景地。" },
  { id: 9, name: "十八梯老街", type: "文化", lat: 29.551, lng: 106.568, price: "免费", time: "全天开放", addr: "重庆市渝中区中兴路1号", distance: "距您 2.1km", rating: "历史风貌区", img: "/images/spots/route-9.webp", desc: "承载着老重庆的市井记忆，吊脚楼与青石板阶梯层层叠叠。" },
  { id: 10, name: "重庆大剧院", type: "演出", lat: 29.569, lng: 106.572, price: "按剧目收费", time: "按演出时间", addr: "重庆市江北区江北嘴文华街1号", distance: "距您 2.8km", rating: "城市地标", img: "/images/spots/route-10.webp", desc: "玻璃外墙如璀璨的水晶，是重庆江畔高雅艺术的殿堂。" },
  { id: 11, name: "三峡博物馆", type: "文化", lat: 29.559, lng: 106.549, price: "免费", time: "09:00-17:00", addr: "重庆市渝中区人民路236号", distance: "距您 3.9km", rating: "国家一级博物馆", img: "/images/spots/route-11.webp", desc: "弘扬三峡文化、保护长江文明的标志性艺术殿堂。" }
];

const ALL_CITIES_SPOTS: Record<string, typeof CHONGQING_SPOTS> = {
  "重庆": CHONGQING_SPOTS,
  "北京": [
    { id: 101, name: "故宫博物院", type: "地标", lat: 39.916, lng: 116.397, price: "¥60", time: "08:30-17:00", addr: "北京市东城区景山前街4号", distance: "距您 2.1km", rating: "5A景区", img: "/images/spots/10001.webp", desc: "明清两代的皇家宫殿，世界上现存规模最大、保存最为完整的木质结构古建筑之一。" },
    { id: 102, name: "天坛公园", type: "文化", lat: 39.882, lng: 116.413, price: "¥15", time: "06:00-22:00", addr: "北京市东城区天坛路甲1号", distance: "距您 4.5km", rating: "5A景区", img: "/images/spots/10051.webp", desc: "明清两代皇帝祭天、祈谷的场所，建筑设计精巧，寓意天圆地方。" },
    { id: 103, name: "颐和园", type: "自然", lat: 39.999, lng: 116.273, price: "¥30", time: "06:00-20:00", addr: "北京市海淀区新建宫门路19号", distance: "距您 15km", rating: "5A景区", img: "/images/spots/10052.webp", desc: "著名的皇家园林，保存最完整的皇家行宫御苑，被誉为“皇家园林博物馆”。" },
    { id: 104, name: "八达岭长城", type: "地标", lat: 40.360, lng: 116.024, price: "¥40", time: "06:30-19:00", addr: "北京市延庆区G110辅道", distance: "距您 60km", rating: "5A景区", img: "/images/spots/10002.webp", desc: "万里长城的重要组成部分，气势磅礴，是长城建筑的精华。" },
    { id: 105, name: "景山公园", type: "自然", lat: 39.923, lng: 116.397, price: "¥2", time: "06:00-21:00", addr: "北京市东城区景山前街11号", distance: "距您 2.3km", rating: "4A景区", img: "/images/spots/route-105.webp", desc: "坐落在北京城中轴线上的皇家园林，登顶可俯瞰整个故宫的全景。" },
    { id: 106, name: "什刹海历史文化区", type: "文化", lat: 39.940, lng: 116.385, price: "免费", time: "全天开放", addr: "北京市西城区羊房胡同", distance: "距您 3.2km", rating: "历史街区", img: "/images/spots/10053.webp", desc: "保留了大量老北京胡同、四合院和前海、后海、西海三湖水域的著名文化区。" },
    { id: 107, name: "南锣鼓巷", type: "文化", lat: 39.938, lng: 116.403, price: "免费", time: "全天开放", addr: "北京市东城区南锣鼓巷胡同", distance: "距您 2.8km", rating: "网红老街", img: "/images/spots/route-107.webp", desc: "北京最古老的街区之一，完整的胡同肌理，散发着老北京胡同的烟火气。" },
    { id: 108, name: "奥林匹克公园", type: "地标", lat: 40.016, lng: 116.392, price: "免费", time: "06:00-22:00", addr: "北京市朝阳区科荟路33号", distance: "距您 11km", rating: "5A景区", img: "/images/spots/route-108.webp", desc: "举办了2008年北京奥运会与2022年冬奥会的体育盛会园区，有“鸟巢”和“水立方”。" }
  ],
  "上海": [
    { id: 201, name: "外滩", type: "地标", lat: 31.240, lng: 121.490, price: "免费", time: "全天开放", addr: "上海市黄浦区中山东一路", distance: "距您 1.5km", rating: "地标街区", img: "/images/spots/10009.webp", desc: "上海的风景线，矗立着数十栋风格迥异的古典复兴建筑，与陆家嘴隔江相望。" },
    { id: 202, name: "东方明珠电视塔", type: "地标", lat: 31.239, lng: 121.499, price: "¥199起", time: "09:00-21:00", addr: "上海市浦东新区世纪大道1号", distance: "距您 2.3km", rating: "5A景区", img: "/images/spots/10063.webp", desc: "坐落于黄浦江畔，塔高468米，是上海标志性的城市地标景观。" },
    { id: 203, name: "豫园", type: "文化", lat: 31.227, lng: 121.492, price: "¥40", time: "09:00-16:30", addr: "上海市黄浦区安仁街279号", distance: "距您 1.8km", rating: "4A景区", img: "/images/spots/10010.webp", desc: "著名的江南古典园林，设计精巧，蕴含着浓郁的传统文化氛围。" },
    { id: 204, name: "南京路步行街", type: "地标", lat: 31.235, lng: 121.479, price: "免费", time: "全天开放", addr: "上海市黄浦区南京东路", distance: "距您 1.2km", rating: "中华商业第一街", img: "/images/spots/route-204.webp", desc: "上海开埠后最早建立的一条商业街，商贾云集，是繁华的代名词。" },
    { id: 205, name: "上海博物馆", type: "文化", lat: 31.228, lng: 121.475, price: "免费", time: "09:00-17:00", addr: "上海市黄浦区人民大道201号", distance: "距您 1.1km", rating: "国家一级博物馆", img: "/images/spots/route-205.webp", desc: "大型的中国古代艺术博物馆，收藏文物珍贵，设计独特，天圆地方。" },
    { id: 206, name: "田子坊", type: "文化", lat: 31.207, lng: 121.468, price: "免费", time: "全天开放", addr: "上海市黄浦区泰康路210弄", distance: "距您 4.2km", rating: "创意老街", img: "/images/spots/route-206.webp", desc: "由上海石库门建筑群改建而成的艺术创意街区，充满艺术氛围和市井气息。" },
    { id: 207, name: "陆家嘴中心绿地", type: "自然", lat: 31.235, lng: 121.505, price: "免费", time: "08:30-22:00", addr: "上海市浦东新区陆家嘴环路717号", distance: "距您 2.8km", rating: "城市绿洲", img: "/images/spots/route-207.webp", desc: "位于陆家嘴金融城中心，四周摩天大楼环抱，绿意葱茏，闹中取静。" },
    { id: 208, name: "中共一大纪念馆", type: "文化", lat: 31.221, lng: 121.476, price: "免费", time: "全天开放", addr: "上海市黄浦区兴业路76号", distance: "距您 2.5km", rating: "红色地标", img: "/images/spots/route-208.webp", desc: "石库门里弄与时尚商业融合，也是极具纪念意义的中国革命红色发祥地。" }
  ],
  "成都": [
    { id: 301, name: "成都杜甫草堂博物馆", type: "文化", lat: 30.660, lng: 104.028, price: "¥50", time: "09:00-18:00", addr: "四川省成都市青羊区青华路37号", distance: "距您 3.0km", rating: "4A景区", img: "/images/spots/route-301.webp", desc: "唐代大诗人杜甫流寓成都时的故居，清幽古朴，是诗歌文化的圣地。" },
    { id: 302, name: "宽窄巷子", type: "文化", lat: 30.663, lng: 104.053, price: "免费", time: "全天开放", addr: "四川省成都市青羊区长顺街", distance: "距您 1.2km", rating: "特色街区", img: "/images/spots/10060.webp", desc: "由宽巷子、窄巷子、井巷子平行排列组成，保留了清代川西民居的院落格局。" },
    { id: 303, name: "大熊猫繁育研究基地", type: "自然", lat: 30.733, lng: 104.143, price: "¥55", time: "07:30-18:00", addr: "四川省成都市成华区外北熊猫大道1375号", distance: "距您 12km", rating: "5A景区", img: "/images/spots/10007.webp", desc: "大熊猫迁地保护的重要场所，近距离观赏国宝大熊猫的生态家园。" },
    { id: 304, name: "武侯祠", type: "文化", lat: 30.645, lng: 104.048, price: "¥50", time: "09:00-18:00", addr: "四川省成都市武侯区武侯祠大街231号", distance: "距您 2.8km", rating: "5A景区", img: "/images/spots/10061.webp", desc: "中国唯一君臣合祀的祠庙，刘备与诸葛亮的合葬地，也是著名的三国遗迹纪念地。" },
    { id: 305, name: "锦里古街", type: "文化", lat: 30.644, lng: 104.049, price: "免费", time: "全天开放", addr: "四川省成都市武侯区锦里街", distance: "距您 2.9km", rating: "商业古街", img: "/images/spots/10008.webp", desc: "西蜀历史上最古老、最具有商业气息的街道之一，浓缩了成都生活风貌。" },
    { id: 306, name: "春熙路步行街", type: "地标", lat: 30.655, lng: 104.080, price: "免费", time: "全天开放", addr: "四川省成都市锦江区春熙路", distance: "距您 3.5km", rating: "繁华商业街", img: "/images/spots/route-306.webp", desc: "百年商业街，引领着成都的潮流与时尚，旁边还有攀爬大楼的大熊猫网红雕塑。" },
    { id: 307, name: "人民公园", type: "自然", lat: 30.656, lng: 104.058, price: "免费", time: "全天开放", addr: "四川省成都市青羊区少城路12号", distance: "距您 1.5km", rating: "特色公园", img: "/images/spots/route-307.webp", desc: "体验最地道成都慢生活的地方，这里可以品盖碗茶、掏耳朵和划船。" },
    { id: 308, name: "太古里", type: "地标", lat: 30.653, lng: 104.084, price: "免费", time: "10:00-22:00", addr: "四川省成都市锦江区中纱帽街8号", distance: "距您 3.7km", rating: "时尚街区", img: "/images/spots/route-308.webp", desc: "开放式、低密度的街区形态购物中心，传统川西民居建筑与现代风尚完美碰撞。" }
  ],
  "西安": [
    { id: 401, name: "秦始皇帝陵博物院", type: "文化", lat: 34.385, lng: 109.278, price: "¥120", time: "08:30-17:00", addr: "陕西省西安市临潼区秦陵路", distance: "距您 35km", rating: "5A景区", img: "/images/spots/10003.webp", desc: "被誉为“世界第八大奇迹”的兵马俑坑，展示了秦代雄壮的地下军阵。" },
    { id: 402, name: "大唐芙蓉园", type: "文化", lat: 34.218, lng: 108.969, price: "¥120", time: "09:00-22:00", addr: "陕西省西安市雁塔区芙蓉西路99号", distance: "距您 5.5km", rating: "5A景区", img: "/images/spots/route-402.webp", desc: "全方位展示盛唐风貌的大型皇家园林式文化主题公园。" },
    { id: 403, name: "西安钟楼", type: "地标", lat: 34.261, lng: 108.942, price: "¥30", time: "08:30-20:30", addr: "陕西省西安市碑林区东西南北四条大街交汇处", distance: "距您 0.5km", rating: "4A景区", img: "/images/spots/route-403.webp", desc: "中国现存钟楼中形制最大、保存最完整的一座，建于明代，是西安的核心地标。" },
    { id: 404, name: "西安城墙", type: "地标", lat: 34.253, lng: 108.942, price: "¥54", time: "08:00-22:00", addr: "陕西省西安市碑林区南大街2号", distance: "距您 1.2km", rating: "5A景区", img: "/images/spots/10004.webp", desc: "中国现存规模最大、保存最完整的古代城垣，可在上面骑行，感受历史厚重。" },
    { id: 405, name: "大雁塔·大唐不夜城", type: "地标", lat: 34.218, lng: 108.963, price: "免费", time: "全天开放", addr: "陕西省西安市雁塔区大雁塔广场", distance: "距您 5.0km", rating: "5A景区", img: "/images/spots/10054.webp", desc: "大雁塔为唐代名僧玄奘译经而建。大唐不夜城是绚丽璀璨的盛唐文化网红街区。" },
    { id: 406, name: "陕西历史博物馆", type: "文化", lat: 34.225, lng: 108.955, price: "免费（需预约）", time: "09:00-17:30", addr: "陕西省西安市雁塔区小寨东路91号", distance: "距您 4.8km", rating: "国家一级博物馆", img: "/images/spots/10056.webp", desc: "被誉为“古都明珠，华夏宝库”，收藏着商周青铜器、唐代金银器等顶级国宝。" },
    { id: 407, name: "回民街", type: "文化", lat: 34.264, lng: 108.939, price: "免费", time: "全天开放", addr: "陕西省西安市莲湖区北院门", distance: "距您 0.8km", rating: "美食街区", img: "/images/spots/route-407.webp", desc: "西安著名的小吃一条街，拥有深厚的清真饮食文化底蕴，肉夹馍与泡馍汇聚于此。" },
    { id: 408, name: "华清宫", type: "自然", lat: 34.364, lng: 109.213, price: "¥120", time: "07:30-18:00", addr: "陕西省西安市临潼区华清路38号", distance: "距您 30km", rating: "5A景区", img: "/images/spots/10055.webp", desc: "倚骊山之秀，依温泉之灵。著名的皇家温泉离宫，也是《长恨歌》发生地。" }
  ],
  "杭州": [
    { id: 501, name: "西湖风景名胜区", type: "自然", lat: 30.244, lng: 120.155, price: "免费", time: "全天开放", addr: "浙江省杭州市西湖区龙井路1号", distance: "距您 1.1km", rating: "5A景区", img: "/images/spots/10005.webp", desc: "以秀丽的湖光山色 and 深厚的历史底蕴著称，断桥残雪、苏堤春晓美不胜收。" },
    { id: 502, name: "灵隐寺", type: "寺庙", lat: 30.242, lng: 120.098, price: "¥30", time: "07:00-18:15", addr: "浙江省杭州市西湖区灵隐路法云弄1号", distance: "距您 6.2km", rating: "全国重点文物", img: "/images/spots/10006.webp", desc: "江南禅宗古刹之一，环境幽雅清静，飞来峰石刻造像精美绝伦。" },
    { id: 503, name: "雷峰塔", type: "地标", lat: 30.233, lng: 120.148, price: "¥40", time: "08:00-17:30", addr: "浙江省杭州市西湖区南山路15号", distance: "距您 2.5km", rating: "4A景区", img: "/images/spots/route-503.webp", desc: "著名雷峰夕照发生地，传说中法海和白娘子的故事让它名扬天下。" },
    { id: 504, name: "清河坊历史街区", type: "文化", lat: 30.242, lng: 120.169, price: "免费", time: "全天开放", addr: "浙江省杭州市上城区河坊街", distance: "距您 3.0km", rating: "历史街区", img: "/images/spots/route-504.webp", desc: "杭州历史上最繁华的街区，胡庆余堂、五味和等老字号商铺鳞次栉比。" },
    { id: 505, name: "西溪国家湿地公园", type: "自然", lat: 30.267, lng: 120.063, price: "¥80", time: "07:30-18:30", addr: "浙江省杭州市西湖区天目山路518号", distance: "距您 8.5km", rating: "5A景区", img: "/images/spots/10058.webp", desc: "中国第一个国家湿地公园，也是《非诚勿扰》的取景地，有着极佳的自然野趣。" },
    { id: 506, name: "六和塔", type: "地标", lat: 30.198, lng: 120.126, price: "¥20", time: "06:30-18:00", addr: "浙江省杭州市西湖区之江路16号", distance: "距您 8.2km", rating: "全国重点文物", img: "/images/spots/route-506.webp", desc: "面临钱塘江，建于北宋年间，是宣泄钱塘潮水的风水之塔，登高可瞰江。" },
    { id: 507, name: "钱江新城灯光秀", type: "地标", lat: 30.212, lng: 120.218, price: "免费", time: "按时间安排", addr: "浙江省杭州市上城区新业路", distance: "距您 7.5km", rating: "都市景观", img: "/images/spots/route-507.webp", desc: "钱塘江畔的城市新地标，高楼群联动上演壮观炫酷的动态灯光视觉秀。" },
    { id: 508, name: "京杭大运河拱宸桥", type: "文化", lat: 30.318, lng: 120.140, price: "免费", time: "全天开放", addr: "浙江省杭州市拱墅区拱宸桥北", distance: "距您 8.0km", rating: "世界文化遗产", img: "/images/spots/route-508.webp", desc: "大运河南端终点的标志性石桥，古色古香，周边分布有多个国家级博物馆。" }
  ],
  "南京": [
    { id: 601, name: "中山陵景区", type: "地标", lat: 32.062, lng: 118.848, price: "免费", time: "08:30-17:00", addr: "江苏省南京市玄武区石象路7号", distance: "距您 6.1km", rating: "5A景区", img: "/images/spots/10029.webp", desc: "中国民主革命先行者孙中山先生的陵寝，雄伟庄严，气势磅礴。" },
    { id: 602, name: "夫子庙秦淮风光带", type: "文化", lat: 32.022, lng: 118.788, price: "免费", time: "全天开放", addr: "江苏省南京市秦淮区贡院街", distance: "距您 2.8km", rating: "5A景区", img: "/images/spots/10030.webp", desc: "“秦淮八艳”故事发生地，江南贡院旧址，桨声灯影中感受秦淮河风情。" },
    { id: 603, name: "玄武湖公园", type: "自然", lat: 32.072, lng: 118.797, price: "免费", time: "05:00-22:00", addr: "江苏省南京市玄武区玄武巷1号", distance: "距您 1.5km", rating: "4A景区", img: "/images/spots/10073.webp", desc: "江南最大的城内公园，远眺紫金山，环抱玄武湖，风景如画。" },
    { id: 604, name: "鸡鸣寺", type: "寺庙", lat: 32.063, lng: 118.792, price: "¥10", time: "07:30-17:30", addr: "江苏省南京市玄武区鸡鸣寺路1号", distance: "距您 1.3km", rating: "著名古刹", img: "/images/spots/route-604.webp", desc: "南京最古老的梵刹之一，樱花大道和药师佛塔非常著名，极具求缘人缘的人气。" },
    { id: 605, name: "明孝陵", type: "文化", lat: 32.061, lng: 118.831, price: "¥70", time: "06:30-18:30", addr: "江苏省南京市玄武区明陵路", distance: "距您 4.8km", rating: "世界文化遗产", img: "/images/spots/route-605.webp", desc: "明太祖朱元璋与皇后的合葬陵寝，神道石刻精美异常，秋季红枫迷人。" },
    { id: 606, name: "总统府", type: "地标", lat: 32.044, lng: 118.796, price: "¥40", time: "08:30-17:00", addr: "江苏省南京市玄武区长江路292号", distance: "距您 0.8km", rating: "4A景区", img: "/images/spots/10072.webp", desc: "中国近代史上具有核心意义的建筑群，融江南古典园林与民国建筑风格为一体。" },
    { id: 607, name: "雨花台风景区", type: "文化", lat: 32.007, lng: 118.783, price: "免费", time: "08:00-17:00", addr: "江苏省南京市雨花台区雨花路215号", distance: "距您 4.5km", rating: "红色景区", img: "/images/spots/route-607.webp", desc: "新石器时代以来的历史高地，也是雨花石的产地和烈士陵园所在地。" },
    { id: 608, name: "南京博物院", type: "文化", lat: 32.042, lng: 118.819, price: "免费（需预约）", time: "09:00-17:00", addr: "江苏省南京市玄武区中山东路321号", distance: "距您 3.5km", rating: "国家一级博物馆", img: "/images/spots/route-608.webp", desc: "中国三大博物馆之一，“一院六馆”格调高雅，珍藏着40万余件国宝奇珍。" }
  ],
  "武汉": [
    { id: 701, name: "黄鹤楼", type: "地标", lat: 30.544, lng: 114.302, price: "¥70", time: "08:30-17:00", addr: "湖北省武汉市武昌区蛇山西山坡特1号", distance: "距您 2.5km", rating: "5A景区", img: "/images/spots/10027.webp", desc: "“天下江山第一楼”，历代文人墨客在此留诗无数，登顶眺望长江大桥绝佳。" },
    { id: 702, name: "东湖听涛景区", type: "自然", lat: 30.575, lng: 114.375, price: "免费", time: "全天开放", addr: "湖北省武汉市武昌区沿湖大道20号", distance: "距您 6.8km", rating: "5A景区", img: "/images/spots/10028.webp", desc: "中国最大的城中湖之一，林木茂盛，清风拂面，有听松、寓言雕塑等景点。" },
    { id: 703, name: "户部巷特色街区", type: "文化", lat: 30.548, lng: 114.296, price: "免费", time: "全天开放", addr: "湖北省武汉市武昌区司门口", distance: "距您 2.6km", rating: "小吃名街", img: "/images/spots/route-703.webp", desc: "“汉味小吃第一巷”，长约150米的百年老巷，尝热干面、豆皮和鸭脖首选。" },
    { id: 704, name: "湖北省博物馆", type: "文化", lat: 30.561, lng: 114.358, price: "免费（需预约）", time: "09:00-17:00", addr: "湖北省武汉市武昌区东湖路160号", distance: "距您 5.5km", rating: "国家一级博物馆", img: "/images/spots/10092.webp", desc: "珍藏曾侯乙编钟、越王勾践剑、元青花四爱图梅瓶等绝世国宝的顶尖博物馆。" },
    { id: 705, name: "武汉长江大桥", type: "地标", lat: 30.551, lng: 114.288, price: "免费", time: "全天开放", addr: "湖北省武汉市武昌区与汉阳区接壤处", distance: "距您 2.8km", rating: "第一座跨江大桥", img: "/images/spots/10093.webp", desc: "万里长江第一桥，一桥飞架南北，天堑变通途，可步行横穿，极为震撼。" },
    { id: 706, name: "昙华林", type: "文化", lat: 30.554, lng: 114.312, price: "免费", time: "全天开放", addr: "湖北省武汉市武昌区昙华林路", distance: "距您 1.8km", rating: "文艺历史街区", img: "/images/spots/route-706.webp", desc: "汇聚了大量近代中西融合的老建筑，现改建为极具小清新色彩的手艺文创街区。" },
    { id: 707, name: "江汉路步行街", type: "地标", lat: 30.584, lng: 114.289, price: "免费", time: "全天开放", addr: "湖北省武汉市江汉区江汉路", distance: "距您 2.1km", rating: "百年商业街", img: "/images/spots/route-707.webp", desc: "著名的“欧陆建筑博物馆”，长达1600米的老商业街，欧式银行大楼极具特色。" },
    { id: 708, name: "晴川阁", type: "文化", lat: 30.550, lng: 114.282, price: "免费", time: "09:00-17:00", addr: "湖北省武汉市汉阳区洗马长街88号", distance: "距您 3.2km", rating: "三大名阁", img: "/images/spots/route-708.webp", desc: "与黄鹤楼隔江相望，取“晴川历历汉阳树”之意，古雅清幽，临江而立。" }
  ],
  "苏州": [
    { id: 801, name: "拙政园", type: "地标", lat: 31.326, lng: 120.625, price: "¥80", time: "07:30-17:30", addr: "江苏省苏州市姑苏区东北街178号", distance: "距您 1.2km", rating: "5A景区", img: "/images/spots/10013.webp", desc: "中国四大名园之首，江南古典园林的代表作，水乡园林的精妙布局。" },
    { id: 802, name: "虎丘山风景名胜区", type: "自然", lat: 31.344, lng: 120.578, price: "¥60", time: "07:30-18:00", addr: "江苏省苏州市姑苏区山塘街虎丘山8号", distance: "距您 4.8km", rating: "5A景区", img: "/images/spots/route-802.webp", desc: "苏东坡赞曰“尝读《东坡全集》评：到苏州不游虎丘，乃憾事也”。有著名的东方斜塔虎丘塔。" },
    { id: 803, name: "留园", type: "地标", lat: 31.317, lng: 120.588, price: "¥45", time: "07:30-17:00", addr: "江苏省苏州市姑苏区留园路338号", distance: "距您 3.5km", rating: "5A景区", img: "/images/spots/10070.webp", desc: "以奇石精美、庭院空间巧妙著称的古典园林，尤以太湖石冠云峰闻名。" },
    { id: 804, name: "寒山寺", type: "寺庙", lat: 31.313, lng: 120.567, price: "¥20", time: "07:30-17:00", addr: "江苏省苏州市姑苏区寒山寺弄24号", distance: "距您 5.0km", rating: "4A景区", img: "/images/spots/10069.webp", desc: "“姑苏城外寒山寺，夜半钟声到客船”。唐代诗人张继的一首名诗让这座古刹举世闻名。" },
    { id: 805, name: "金鸡湖景区", type: "地标", lat: 31.311, lng: 120.697, price: "免费", time: "全天开放", addr: "江苏省苏州市工业园区星港街158号", distance: "距您 7.5km", rating: "5A景区", img: "/images/spots/route-805.webp", desc: "现代苏州的时尚代表，湖畔矗立着“东方之门”等地标，夜景灯光繁华旖旎。" },
    { id: 806, name: "山塘街", type: "文化", lat: 31.321, lng: 120.597, price: "免费", time: "全天开放", addr: "江苏省苏州市姑苏区山塘街", distance: "距您 2.8km", rating: "七里山塘", img: "/images/spots/route-806.webp", desc: "被誉为“姑苏第一街”，粉墙黛瓦，桨声灯影，完美保留了江南水乡街区风貌。" },
    { id: 807, name: "平江路历史街区", type: "文化", lat: 31.314, lng: 120.630, price: "免费", time: "全天开放", addr: "江苏省苏州市姑苏区平江路", distance: "距您 1.1km", rating: "历史街区", img: "/images/spots/10071.webp", desc: "苏州古城保存最完整的一个区域，堪称江南水乡古城的活化石，特色民谣茶社汇集。" },
    { id: 808, name: "苏州博物馆", type: "文化", lat: 31.325, lng: 120.622, price: "免费（需预约）", time: "09:00-17:00", addr: "江苏省苏州市姑苏区东北街204号", distance: "距您 1.0km", rating: "国家一级博物馆", img: "/images/spots/route-808.webp", desc: "世界建筑大师贝聿铭设计的收官之作，融汇现代建筑几何与传统江南园林白墙黛瓦。" }
  ],
  "广州": [
    { id: 901, name: "广州塔", type: "地标", lat: 23.109, lng: 113.324, price: "¥150起", time: "09:30-22:30", addr: "广东省广州市海珠区阅江西路222号", distance: "距您 3.5km", rating: "5A景区", img: "/images/spots/10031.webp", desc: "中国第一高塔，昵称“小蛮腰”，登顶可俯瞰浩瀚珠江与全城璀璨夜景。" },
    { id: 902, name: "陈家祠", type: "文化", lat: 23.126, lng: 113.244, price: "¥10", time: "09:00-17:30", addr: "广东省广州市荔湾区中山七路恩龙里34号", distance: "距您 3.0km", rating: "4A景区", img: "/images/spots/10075.webp", desc: "广东民间工艺博物馆，三雕二塑一铁铸精美绝伦，是岭南祠堂建筑的集大成者。" },
    { id: 903, name: "沙面岛", type: "文化", lat: 23.109, lng: 113.242, price: "免费", time: "全天开放", addr: "广东省广州市荔湾区沙面北街83号", distance: "距您 3.2km", rating: "5A景区", img: "/images/spots/10032.webp", desc: "曾是英法租界，保留有百余栋欧式新古典、新巴洛克和券廊式风情洋楼，犹如童话街区。" },
    { id: 904, name: "越秀公园五羊雕像", type: "地标", lat: 23.142, lng: 113.264, price: "免费", time: "06:00-22:00", addr: "广东省广州市越秀区解放北路988号", distance: "距您 1.5km", rating: "5A景区", img: "/images/spots/route-904.webp", desc: "广州市的象征地标，根据五羊衔谷仙人降临广州的传说设计雕刻，栩栩如生。" },
    { id: 905, name: "白云山风景区", type: "自然", lat: 23.177, lng: 113.298, price: "¥5", time: "06:00-21:00", addr: "广东省广州市白云区广园中路801号", distance: "距您 6.2km", rating: "5A景区", img: "/images/spots/route-905.webp", desc: "“羊城第一秀”，重峦叠嶂，云雾缭绕，登高可一览羊城全景，是城市的天然氧吧。" },
    { id: 906, name: "荔枝湾涌", type: "文化", lat: 23.120, lng: 113.232, price: "免费", time: "全天开放", addr: "广东省广州市荔湾区龙津西路", distance: "距您 3.9km", rating: "西关风情区", img: "/images/spots/route-906.webp", desc: "“一湾溪水绿，两岸荔枝红”，保留了传统的岭南水乡风格与浓厚的西关市井风情。" },
    { id: 907, name: "珠江夜游天字码头", type: "自然", lat: 23.116, lng: 113.269, price: "¥80起", time: "18:00-22:30", addr: "广东省广州市越秀区沿江东路200号", distance: "距您 1.2km", rating: "著名景观", img: "/images/spots/10077.webp", desc: "乘游船荡漾于江面，两岸高楼广厦的璀璨霓虹，体验不夜广州夜色浮动的独特温婉。" },
    { id: 908, name: "广东省博物馆", type: "文化", lat: 23.115, lng: 113.326, price: "免费（需预约）", time: "09:00-17:00", addr: "广东省广州市天河区珠江东路2号", distance: "距您 3.6km", rating: "国家一级博物馆", img: "/images/spots/route-908.webp", desc: "形似一个精美的中国传统漆盒“粤光宝盒”，展出了极具特色的岭南潮州木雕及自然文物珍藏。" }
  ]
};


const POPULAR_CITIES = [
  { name: "重庆", center: [106.578, 29.563], img: "/images/spots/10011.webp", badge: "魔幻山城" },
  { name: "北京", center: [116.397, 39.916], img: "/images/spots/10001.webp", badge: "历史帝都" },
  { name: "上海", center: [121.473, 31.230], img: "/images/spots/10009.webp", badge: "摩登都市" },
  { name: "成都", center: [104.066, 30.572], img: "/images/spots/10007.webp", badge: "天府之国" },
  { name: "西安", center: [108.940, 34.341], img: "/images/spots/10004.webp", badge: "古丝路起点" },
  { name: "杭州", center: [120.155, 30.274], img: "/images/spots/10005.webp", badge: "人间天堂" },
  { name: "南京", center: [118.796, 32.060], img: "/images/spots/10029.webp", badge: "六朝古都" },
  { name: "武汉", center: [114.305, 30.593], img: "/images/spots/10027.webp", badge: "江城武汉" },
  { name: "苏州", center: [120.585, 31.299], img: "/images/spots/10013.webp", badge: "园林之城" },
  { name: "广州", center: [113.264, 23.129], img: "/images/spots/10031.webp", badge: "花城" }
];

const PRESET_THEME_ROUTES = [
  { id: "route-1", name: "巴渝文化历史游", duration: "约6小时", spots: [11, 2, 8, 1, 9] },
  { id: "route-2", name: "魔幻两江风光游", duration: "约5小时", spots: [4, 10, 3, 7, 6] },
  { id: "route-3", name: "亲子合家欢乐游", duration: "约4小时", spots: [5, 4, 1, 7] }
];

interface GeneratedRoute {
  name: string;
  description: string;
  highlights: string[];
  tips: string;
  spots: Array<{ id: number; name: string; duration: number; description: string }>;
  totalDuration: number;
  totalDistance: string;
}

export function RoutesScreen() {
  const router = useRouter();
  const user = useEazo((s: any) => s.auth.user) as { name?: string | null; avatar?: string | null } | null;
  const [selectedCity, setSelectedCity] = useState("重庆");
  const currentSpots = ALL_CITIES_SPOTS[selectedCity] || CHONGQING_SPOTS;

  const [selectedInterests, setSelectedInterests] = useState<string[]>(["history"]);
  const [duration, setDuration] = useState(120);
  const [generating, setGenerating] = useState(false);
  const [activeRoute, setActiveRoute] = useState<GeneratedRoute | null>(null);

  // Progress modal state
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStep, setProgressStep] = useState("");

  // Active highlighted spot
  const [activeSpot, setActiveSpot] = useState<typeof CHONGQING_SPOTS[0]>(CHONGQING_SPOTS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapRotation, setMapRotation] = useState(0);

  // Mobile drawers & responsive sidebar toggle states
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [showArtifactsDrawer, setShowArtifactsDrawer] = useState(false);

  // AI Chat Panel
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    { role: "assistant", content: "您好！我是您的智能导览助手小慧。已为您定位至重庆核心景区。想了解哪些景点的门票、历史和特色，或者让我为您定制路线？" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [attachedMedia, setAttachedMedia] = useState<Array<{type: 'image' | 'video', url: string, name: string}>>([]);

  // Auto-play TTS switch
  const [autoplayEnabled, setAutoplayEnabled] = useState(false);

  // Desktop City Carousel Drag Scroll
  const cityScrollRef = useRef<HTMLDivElement>(null);
  const [cityDragState, setCityDragState] = useState({ isDragging: false, startX: 0, scrollLeft: 0 });

  // Responsive state
  const [isMobile, setIsMobile] = useState<boolean>(
    () => typeof window !== "undefined" && window.innerWidth < 768
  );
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Map elements
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const AMapInstanceRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);
  const [amapLoaded, setAmapLoaded] = useState(false);

  // Chat popups
  const [showFloatChat, setShowFloatChat] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Drag controls for Q&A panel
  const dragControls = useDragControls();

  // Audio Playback
  const [isPlayingNarration, setIsPlayingNarration] = useState(false);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);

  const handleCityMouseDown = (e: React.MouseEvent) => {
    if (!cityScrollRef.current) return;
    setCityDragState({
      isDragging: true,
      startX: e.pageX - cityScrollRef.current.offsetLeft,
      scrollLeft: cityScrollRef.current.scrollLeft
    });
  };

  const handleCityMouseMove = (e: React.MouseEvent) => {
    if (!cityDragState.isDragging || !cityScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - cityScrollRef.current.offsetLeft;
    const walk = (x - cityDragState.startX) * 1.5;
    cityScrollRef.current.scrollLeft = cityDragState.scrollLeft - walk;
  };

  const handleCityMouseUpOrLeave = () => {
    setCityDragState(prev => ({ ...prev, isDragging: false }));
  };

  const scrollCities = (direction: "left" | "right") => {
    if (!cityScrollRef.current) return;
    const scrollAmount = 140;
    cityScrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Voice recording states & refs
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  const handleSpeechInputToggle = async () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (recording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setRecording(false);
      } else if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setRecording(false);
      }
    } else {
      if (SR) {
        const rec = new SR();
        rec.lang = "zh-CN"; rec.continuous = false; rec.interimResults = false;
        rec.onresult = (e: any) => {
          const txt = e.results[0][0].transcript;
          setChatInput(txt);
        };
        rec.onend = () => setRecording(false);
        rec.onerror = () => setRecording(false);
        rec.start();
        recognitionRef.current = rec;
        mediaRecorderRef.current = null;
        setRecording(true);
      } else {
        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setChatInput("（浏览器不支持录音）");
            return;
          }
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          recognitionRef.current = null;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };

          mediaRecorder.onstop = async () => {
            stream.getTracks().forEach((track) => track.stop());
            const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
            const formData = new FormData();
            formData.append("file", audioBlob, "audio.webm");

            setChatInput("正在识别语音...");
            try {
              const res = await request("/api/qa/stt", {
                method: "POST",
                body: formData,
              });
              const data = await res.json();
              if (data.text) {
                setChatInput(data.text);
              } else {
                setChatInput("");
              }
            } catch (err) {
              console.error("Whisper STT error:", err);
              setChatInput("（语音识别失败）");
            }
          };

          mediaRecorder.start();
          setRecording(true);
        } catch (err) {
          console.error("Mic access denied:", err);
          setChatInput("（无法获取麦克风权限）");
        }
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAttachedMedia(prev => [...prev, { type: 'image', url: ev.target?.result as string, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      setAttachedMedia(prev => [...prev, { type: 'video', url, name: file.name }]);
    });
  };

  // Helper: Open custom AMap InfoWindow directly on map for a spot
  const showAmapInfoWindow = (spot: any) => {
    if (!mapInstanceRef.current || !AMapInstanceRef.current) return;
    
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    const contentHtml = `
      <div style="font-family: system-ui, -apple-system, sans-serif; padding: 12px; width: 285px; background: white; border-radius: 14px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1); border: 1px solid #e4e4e7; position: relative;">
        <button id="infowin-close-btn" style="position: absolute; right: 10px; top: 10px; border: none; background: transparent; color: #a1a1aa; font-size: 18px; font-weight: bold; cursor: pointer; padding: 0 4px; line-height: 1; outline: none; z-index: 10;">×</button>
        
        <div id="infowin-card-area" style="cursor: pointer; display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-right: 15px; transition: opacity 0.2s;" onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1">
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              <h4 style="margin: 0; font-size: 13px; font-weight: 800; color: #18181b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${spot.name}</h4>
              <span style="background: rgba(79, 111, 82, 0.1); color: #4F6F52; font-size: 8px; font-weight: 700; padding: 2px 6px; border-radius: 4px; flex-shrink: 0;">★ ${spot.rating}</span>
            </div>
            <p style="margin: 6px 0 4px 0; font-size: 9.5px; color: #71717a; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${spot.desc}</p>
            <span style="font-size: 8.5px; color: #3B82F6; font-weight: 700; display: inline-flex; align-items: center; gap: 2px;">查看景点详情 <span style="font-size: 10px;">→</span></span>
          </div>
          <img src="${spot.img}" alt="${spot.name}" style="width: 54px; height: 54px; border-radius: 8px; object-fit: cover; border: 1px solid #e4e4e7; flex-shrink: 0;" />
        </div>
        
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px; padding-top: 8px; border-top: 1px solid #f4f4f5;">
          <button id="infowin-speech-btn" style="display: flex; align-items: center; gap: 4px; padding: 5px 10px; border-radius: 8px; border: none; background: #FFF0ED; color: #FF5B45; font-size: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s;">
            <span>🔊</span> 语音讲解
          </button>
          <button id="infowin-artifacts-btn" style="padding: 5px 10px; border-radius: 8px; border: none; background: #EEF2EE; color: #4F6F52; font-size: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s;">
            文物陈列
          </button>
        </div>
      </div>
    `;

    const infoWindow = new AMapInstanceRef.current.InfoWindow({
      isCustom: true,
      content: contentHtml,
      offset: new AMapInstanceRef.current.Pixel(0, -35),
    });

    infoWindow.open(mapInstanceRef.current, [spot.lng, spot.lat]);
    infoWindowRef.current = infoWindow;

    // Bind click events inside InfoWindow
    setTimeout(() => {
      const speechBtn = document.getElementById("infowin-speech-btn");
      const artBtn = document.getElementById("infowin-artifacts-btn");
      const closeBtn = document.getElementById("infowin-close-btn");
      const cardArea = document.getElementById("infowin-card-area");
      
      if (speechBtn) {
        speechBtn.onclick = () => {
          router.push(`/qa?name=${encodeURIComponent(spot.name)}`);
        };
      }
      if (artBtn) {
        artBtn.onclick = () => setShowArtifactsDrawer(true);
      }
      if (closeBtn) {
        closeBtn.onclick = () => infoWindow.close();
      }
      if (cardArea) {
        cardArea.onclick = () => {
          router.push(`/spots/${spot.id}`);
        };
      }
    }, 150);
  };

  // Map initialization
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.destroy();
      mapInstanceRef.current = null;
      setAmapLoaded(false);
    }

    if (!process.env.NEXT_PUBLIC_AMAP_KEY) {
      console.error("[高德地图] 未配置 NEXT_PUBLIC_AMAP_KEY 环境变量");
      toast.error("地图未配置，请联系管理员添加 NEXT_PUBLIC_AMAP_KEY");
      return;
    }

    let map: any = null;
    let timer: any = null;
    let aborted = false;
    let resizeObserver: ResizeObserver | null = null;

    const initMap = () => {
      if (aborted) return;
      const container = mapRef.current;
      if (!container) {
        timer = setTimeout(initMap, 50);
        return;
      }

      if (container.clientWidth === 0 || container.clientHeight === 0) {
        if (!resizeObserver) {
          resizeObserver = new ResizeObserver(() => {
            if (aborted) return;
            const c = mapRef.current;
            if (c && c.clientWidth > 0 && c.clientHeight > 0) {
              resizeObserver?.disconnect();
              resizeObserver = null;
              initMap();
            }
          });
          resizeObserver.observe(container);
        }
        return;
      }

      AMapLoader.load({
        key: process.env.NEXT_PUBLIC_AMAP_KEY || "",
        version: "2.0",
        plugins: ["AMap.Walking", "AMap.Driving", "AMap.Polyline"],
      })
        .then((AMap) => {
          if (aborted) return;
          if (!mapRef.current || container !== mapRef.current) return;

          AMapInstanceRef.current = AMap;

          const activeCityCenter = POPULAR_CITIES.find(c => c.name === selectedCity)?.center || [106.578, 29.563];
          map = new AMap.Map(container, {
            viewMode: "3D",
            zoom: 13,
            center: activeCityCenter,
            theme: "amap://styles/whitesmoke",
            zoomEnable: true,
            dragEnable: true,
            resizeEnable: true,
          });

          mapInstanceRef.current = map;

          map.on("rotate", () => {
            if (!aborted) {
              setMapRotation(map.getRotation() || 0);
            }
          });

          map.on("complete", () => {
            if (aborted) return;
            setAmapLoaded(true);
            const currentCitySpots = ALL_CITIES_SPOTS[selectedCity] || CHONGQING_SPOTS;
            renderAmapMarkers(AMap, map, currentCitySpots);
          });

          if (typeof ResizeObserver !== "undefined") {
            resizeObserver = new ResizeObserver(() => {
              if (aborted || !map) return;
              try { map.resize?.(); } catch (_) {}
            });
            resizeObserver.observe(container);
          }
        })
        .catch((e) => {
          if (!aborted) {
            console.error("高德地图加载失败:", e);
            toast.error("地图加载失败，请检查网络或配置");
          }
        });
    };

    initMap();

    return () => {
      aborted = true;
      if (timer) clearTimeout(timer);
      if (resizeObserver) {
        try { resizeObserver.disconnect(); } catch (_) {}
        resizeObserver = null;
      }
      if (map) {
        try { map.destroy(); } catch (_) {}
        map = null;
      }
      mapInstanceRef.current = null;
      setAmapLoaded(false);
    };
  }, []);

  // Cleanup audio & infoWindow on unmount
  useEffect(() => {
    return () => {
      if (audioInstance) {
        audioInstance.pause();
      }
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, [audioInstance]);

  // Render markers whenever selectedCity changes, amapLoaded becomes true, or activeRoute changes
  useEffect(() => {
    if (amapLoaded && mapInstanceRef.current && AMapInstanceRef.current) {
      renderAmapMarkers(AMapInstanceRef.current, mapInstanceRef.current, currentSpots);
    }
  }, [selectedCity, amapLoaded, activeRoute]);

  // Close infoWindow when city changes
  useEffect(() => {
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }
  }, [selectedCity]);

  const handleCityClick = (city: typeof POPULAR_CITIES[0]) => {
    setSelectedCity(city.name);
    const citySpots = ALL_CITIES_SPOTS[city.name];
    if (citySpots && citySpots.length > 0) {
      setActiveSpot(citySpots[0]);
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoomAndCenter(13, city.center, false, 300);
    }
    toast.success(`已切换至城市：${city.name}`);
  };

  // Re-draw route polylines when activeRoute changes
  useEffect(() => {
    const AMap = AMapInstanceRef.current;
    const map = mapInstanceRef.current;
    if (!AMap || !map || !activeRoute) {
      if (routePolylineRef.current) {
        try {
          routePolylineRef.current.setMap(null);
        } catch (_) {}
        routePolylineRef.current = null;
      }
      return;
    }

    if (routePolylineRef.current) {
      try {
        routePolylineRef.current.setMap(null);
      } catch (_) {}
      routePolylineRef.current = null;
    }

    const coordinates = activeRoute.spots.map(s => {
      let original: any = null;
      for (const spots of Object.values(ALL_CITIES_SPOTS)) {
        const found = spots.find(orig => orig.id === s.id);
        if (found) {
          original = found;
          break;
        }
      }
      return original ? [original.lng, original.lat] : null;
    }).filter(Boolean) as Array<[number, number]>;

    if (coordinates.length < 2) return;

    // Helper: Interpolate points between two coordinates for a smooth drawing effect
    const interpolatePoints = (p1: [number, number], p2: [number, number], steps: number): Array<[number, number]> => {
      const pts: Array<[number, number]> = [];
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        pts.push([
          p1[0] + (p2[0] - p1[0]) * t,
          p1[1] + (p2[1] - p1[1]) * t
        ]);
      }
      return pts;
    };

    const animatedPath: Array<[number, number]> = [];
    const stepsPerSegment = 25; // 25 interpolation frames per segment for rich micro-animation
    for (let i = 0; i < coordinates.length - 1; i++) {
      const segmentPoints = interpolatePoints(coordinates[i], coordinates[i + 1], stepsPerSegment);
      if (i > 0) {
        segmentPoints.shift(); // Avoid duplicating boundaries
      }
      animatedPath.push(...segmentPoints);
    }

    // Temporarily fit view boundaries immediately so the user can watch the drawing animation
    const boundsPolyline = new AMap.Polyline({
      path: coordinates,
      strokeOpacity: 0
    });
    boundsPolyline.setMap(map);
    map.setFitView([boundsPolyline]);
    setTimeout(() => {
      try { boundsPolyline.setMap(null); } catch (_) {}
    }, 100);

    // Create polyline initially starting at the first spot
    const polyline = new AMap.Polyline({
      path: [coordinates[0]],
      strokeColor: "#3B82F6", // Beautiful tech blue for high contrast
      strokeWeight: 8,
      strokeOpacity: 0.95,
      strokeStyle: "solid",
      lineJoin: "round",
      lineCap: "round",
      showDir: true,
      isOutline: true,
      outlineColor: "#ffffff",
      borderWeight: 2,
    });
    polyline.setMap(map);
    routePolylineRef.current = polyline;

    let movingMarker: any = null;
    let flowTimer: any = null;

    let currentIndex = 0;
    const intervalTime = 16; // 60fps
    const drawTimer = setInterval(() => {
      if (currentIndex >= animatedPath.length) {
        clearInterval(drawTimer);
        // Bind original coordinates to polyline to ensure clean direction arrows alignment
        polyline.setPath(coordinates);

        // --- PATH FLOW ANIMATION ---
        const travelerHtml = `
          <div class="traveler-marker-root">
            <style>
              @keyframes traveler-walk {
                0% { transform: translateY(0) rotate(-4deg); }
                50% { transform: translateY(-4px) rotate(4deg); }
                100% { transform: translateY(0) rotate(-4deg); }
              }
              .traveler-container {
                width: 28px;
                height: 28px;
                background: #ffffff;
                border: 2px solid #3B82F6;
                border-radius: 50%;
                box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                animation: traveler-walk 0.6s infinite ease-in-out;
              }
              .traveler-emoji {
                font-size: 16px;
                line-height: 1;
              }
            </style>
            <div class="traveler-container">
              <span class="traveler-emoji">🚶‍♂️</span>
            </div>
          </div>
        `;
        
        movingMarker = new AMap.Marker({
          position: coordinates[0],
          content: travelerHtml,
          offset: new AMap.Pixel(-14, -14),
          zIndex: 300,
        });
        movingMarker.setMap(map);

        let flowIndex = 0;
        flowTimer = setInterval(() => {
          if (!movingMarker) return;
          flowIndex = (flowIndex + 1) % animatedPath.length;
          movingMarker.setPosition(animatedPath[flowIndex]);
        }, 80);
        return;
      }
      currentIndex += 2; // Incremental steps for smooth drawing speed
      const currentPath = animatedPath.slice(0, Math.min(currentIndex, animatedPath.length));
      polyline.setPath(currentPath);
    }, intervalTime);

    return () => {
      clearInterval(drawTimer);
      clearInterval(flowTimer);
      if (movingMarker) {
        try { movingMarker.setMap(null); } catch (_) {}
      }
      if (routePolylineRef.current) {
        try {
          routePolylineRef.current.setMap(null);
        } catch (_) {}
        routePolylineRef.current = null;
      }
    };
  }, [activeRoute, amapLoaded]);

  const renderAmapMarkers = (AMap: any, map: any, spotsList: typeof CHONGQING_SPOTS) => {
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    spotsList.forEach(s => {
      if (!s || typeof s.lng !== "number" || typeof s.lat !== "number" || isNaN(s.lng) || isNaN(s.lat)) {
        return;
      }

      const routeSpotIndex = activeRoute
        ? activeRoute.spots.findIndex(rs => rs.id === s.id)
        : -1;
      const isInRoute = routeSpotIndex !== -1;

      let themeColor =
        s.type === "地标" ? "#EF4444" : s.type === "演出" ? "#F59E0B" : s.type === "寺庙" ? "#8B5CF6" : s.type === "文化" ? "#3B82F6" : s.type === "自然" ? "#10B981" : "#FF5B45";

      if (isInRoute && activeRoute) {
        if (routeSpotIndex === 0) {
          themeColor = "#10B981"; // Start point color: Emerald Green
        } else if (routeSpotIndex === activeRoute.spots.length - 1) {
          themeColor = "#EF4444"; // End point color: Vibrant Rose Red
        } else {
          themeColor = "#D2A053"; // Middle points color: Luxury Gold
        }
      }

      const numPrefix = isInRoute 
        ? `<span style="background-color:${themeColor};color:white;border-radius:50%;width:14px;height:14px;display:inline-flex;align-items:center;justify-content:center;margin-right:4px;font-size:9px;font-weight:900;">${routeSpotIndex + 1}</span>` 
        : "";

      const markerHtml = `
        <div class="flex flex-col items-center select-none cursor-pointer">
          <div class="px-2 py-1 bg-white/95 border ${isInRoute ? 'ring-2 scale-105 font-black' : 'border-zinc-200'} shadow-md rounded-md text-[10px] font-bold text-zinc-800 whitespace-nowrap -translate-y-1 flex items-center" style="border-top: 3px solid ${themeColor}; border-color: ${isInRoute ? themeColor : '#e4e4e7'}; --tw-ring-color: ${isInRoute ? themeColor + '40' : 'transparent'};">
            ${numPrefix}${s.name}
          </div>
          <div class="w-3.5 h-3.5 rounded-full bg-white border-2 flex items-center justify-center shadow-md -translate-y-1 ${isInRoute ? 'scale-110' : ''}" style="border-color: ${themeColor};">
            <div class="w-1.5 h-1.5 rounded-full" style="background-color: ${themeColor};"></div>
          </div>
        </div>
      `;

      const marker = new AMap.Marker({
        position: [s.lng, s.lat],
        content: markerHtml,
        offset: isInRoute ? new AMap.Pixel(-45, -45) : new AMap.Pixel(-40, -40),
        zIndex: isInRoute ? 200 : 100,
      });

      marker.on("click", () => {
        setActiveSpot(s);
        map.setZoomAndCenter(15, [s.lng, s.lat], false, 300);
        showAmapInfoWindow(s);
        if (autoplayEnabled) {
          speakSpotNarration(s.name, s.desc);
        }
      });

      marker.setMap(map);
      markersRef.current.push(marker);
    });
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    
    let foundSpot: any = null;
    let foundCity = "";
    
    for (const [cityName, spots] of Object.entries(ALL_CITIES_SPOTS)) {
      const match = spots.find(s => s.name.includes(q) || s.addr.includes(q) || s.desc.includes(q));
      if (match) {
        foundSpot = match;
        foundCity = cityName;
        break;
      }
    }

    if (foundSpot) {
      setSelectedCity(foundCity);
      setActiveSpot(foundSpot);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setZoomAndCenter(14, [foundSpot.lng, foundSpot.lat], false, 300);
        showAmapInfoWindow(foundSpot);
        if (autoplayEnabled) {
          speakSpotNarration(foundSpot.name, foundSpot.desc);
        }
      }
      toast.success(`已找到景点「${foundSpot.name}」，已切换至 ${foundCity}`);
    } else if (q.trim()) {
      toast.error("未在全国范围内找到对应景点，请换个词试试。");
    }
  };

  const speakSpotNarration = (name: string, desc: string) => {
    if (isPlayingNarration) {
      audioInstance?.pause();
      setIsPlayingNarration(false);
      return;
    }

    const text = `您正在查看：${name}。${desc}`;
    const newAudio = new Audio("/api/qa/tts?text=" + encodeURIComponent(text));
    newAudio.play();
    newAudio.onended = () => setIsPlayingNarration(false);
    setAudioInstance(newAudio);
    setIsPlayingNarration(true);
  };

  const handleGenerateRoute = async () => {
    setGenerating(true);
    setActiveRoute(null);
    setProgressPercent(12);
    setProgressStep("🤖 AI 智能引擎正在深度分析您的游玩偏好与包含景点...");
    setShowProgressModal(true);

    const t1 = setTimeout(() => {
      setProgressPercent(42);
      setProgressStep("📍 正在调取高德地图 3D 拓扑空间坐标，计算景点间最短距离...");
    }, 450);

    const t2 = setTimeout(() => {
      setProgressPercent(76);
      setProgressStep("🚗 正在实时分析城市交通避堵网格与客流，优化最佳路线游览顺序...");
    }, 950);

    const t3 = setTimeout(() => {
      setProgressPercent(95);
      setProgressStep("🎙️ 正在生成全路线 3D 导航轨迹与沉浸式 AI 导览解说词...");
    }, 1450);

    const isSpecialForces = selectedInterests.includes("special_forces");

    setTimeout(() => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setProgressPercent(100);

      setTimeout(() => {
        setShowProgressModal(false);
        setGenerating(false);

        if (isSpecialForces) {
          // Special Forces mode: Connect ALL current spots in selected city
          const formattedRoute: GeneratedRoute = {
            name: `【${selectedCity}全景极限特种兵】打卡专线`,
            description: `为“特种兵”玩家量身定制的高能极限路线，贯穿${selectedCity}全城 ${currentSpots.length} 大核心名胜景观，高效打卡无遗漏！`,
            highlights: [`贯穿全部 ${currentSpots.length} 个城市名胜`, "极致高效打卡路线", "立体魔幻全景打卡"],
            tips: "特种兵打卡路线强度较大，建议穿着舒适运动鞋，保持充足水分补充！",
            spots: currentSpots.map((s) => ({
              id: s.id,
              name: s.name,
              duration: 35,
              description: s.desc,
            })),
            totalDuration: currentSpots.length * 35 + 50,
            totalDistance: `约 ${(currentSpots.length * 2.2).toFixed(1)}km`,
          };
          setActiveRoute(formattedRoute);
          toast.success(`「${formattedRoute.name}」生成成功！已贯穿当前全城 ${currentSpots.length} 个景点。`);
        } else {
          // Standard simulated route based on selected preferences
          const filtered = currentSpots.filter((s) => {
            if (selectedInterests.includes("history") && (s.type === "文化" || s.type === "寺庙")) return true;
            if (selectedInterests.includes("nature") && s.type === "自然") return true;
            if (selectedInterests.includes("family") && (s.type === "地标" || s.type === "演出")) return true;
            return false;
          });
          const picked = filtered.length >= 2 ? filtered.slice(0, 5) : currentSpots.slice(0, 4);
          const formattedRoute: GeneratedRoute = {
            name: `【${selectedCity}精选智游】定制主题路线`,
            description: `根据您的游玩偏好为您精选 ${picked.length} 处热门景点，享受轻松舒适的游览体验。`,
            highlights: ["个性化偏好匹配", "最佳路径优化", "全程语音伴游"],
            tips: "建议错峰前往热门景点，提前在小程序预约门票。",
            spots: picked.map((s) => ({
              id: s.id,
              name: s.name,
              duration: 40,
              description: s.desc,
            })),
            totalDuration: picked.length * 40 + 30,
            totalDistance: `约 ${(picked.length * 1.8).toFixed(1)}km`,
          };
          setActiveRoute(formattedRoute);
          toast.success("专属路线生成成功！已为您在地图上绘制路径。");
        }
      }, 350);
    }, 1800);
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() && attachedMedia.length === 0) return;
    let content = chatInput.trim();
    if (attachedMedia.length > 0) {
      const mediaText = attachedMedia.map(m => m.type === 'image' ? `![图片](${m.url})` : `🎬 [视频: ${m.name}]`).join('\n');
      content = mediaText + (chatInput.trim() ? '\n\n' + chatInput.trim() : '');
    }
    const userMsg = content;
    const updated = [...chatMessages, { role: "user" as const, content: userMsg }];
    setChatMessages(updated);
    setChatInput("");
    setAttachedMedia([]);
    setChatLoading(true);

    try {
      const spotsContext = currentSpots.map(s => `- ${s.name}: ${s.desc} (类型: ${s.type}, 价格: ${s.price}, 开放时间: ${s.time}, 地址: ${s.addr})`).join("\n");
      const questionWithContext = `【景区导航地图信息】:\n${spotsContext}\n\n【用户问题】:\n${userMsg}`;
      const history = updated.slice(0, -1).map(m => ({ role: m.role, content: m.content }));
      
      const res = await request("/api/qa/chat", {
        method: "POST",
        body: JSON.stringify({
          question: questionWithContext,
          history,
          agentConfig: {
            enable: true,
            prompt: "你是翠玉景区的智能行程向导“小慧”，专为游客提供旅游路线规划和景点特色咨询服务。你语气热情专业、条理清晰，多给一些实用的旅行建议。回答200字以内，段落清晰。必须在回复的最开始以 '[情感: 愉快/平静/思考]' 格式标注你的情感，例如 '[情感: 愉快]您好！我是您的智能向导小慧。'"
          }
        })
      });
      const data = await res.json();
      const answerRaw = data.answer || "抱歉，暂时无法回答。";
      const answer = answerRaw.replace(/\[情感[:：]\s*[^\]]+\]/g, "").trim();
      setChatMessages(prev => [...prev, { role: "assistant", content: answer }]);
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", content: "目前AI服务正在维护中，请稍候片刻。如需帮助，请前往景区服务中心。" }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="relative w-full h-[100dvh] flex flex-col overflow-hidden bg-[#F7F6F3] select-none text-zinc-800">
      
      {/* Hidden File Inputs for AI chat attachments */}
      <input
        type="file"
        accept="image/*"
        multiple
        ref={imageInputRef}
        onChange={handleImageSelect}
        className="hidden"
      />
      <input
        type="file"
        accept="video/*"
        multiple
        ref={videoInputRef}
        onChange={handleVideoSelect}
        className="hidden"
      />

      {/* 1. Integrated Header (Mobile only) */}
      <div className="md:hidden flex items-center justify-between px-4 h-14 bg-white border-b border-zinc-200/80 shadow-sm z-40 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowLeftSidebar(!showLeftSidebar);
              setShowRightSidebar(false);
            }}
            className="w-8 h-8 rounded-lg bg-[#4F6F52]/10 flex items-center justify-center text-[#4F6F52] hover:bg-[#4F6F52]/20 active:scale-95 transition-all"
            title="查看选项"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Integrated Top Search in mobile header */}
        <div className="flex-1 max-w-[180px] h-8.5 mx-2 flex items-center bg-zinc-100/90 rounded-full px-2.5 border border-zinc-200/40">
          <Search className="w-3.5 h-3.5 text-zinc-400 mr-1.5 flex-shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
            placeholder={`搜索${selectedCity}...`}
            className="w-full bg-transparent outline-none text-[10.5px] font-semibold text-zinc-800 placeholder:text-zinc-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowLeftSidebar(true);
              setShowRightSidebar(false);
            }}
            className="px-2.5 h-8.5 rounded-full bg-[#D2A053] text-white flex items-center gap-0.5 text-[10.5px] font-extrabold active:scale-95 transition-all"
          >
            <MapPin className="w-3 h-3" />
            <span>{selectedCity}</span>
          </button>

          <button
            onClick={() => {
              setShowRightSidebar(!showRightSidebar);
              setShowLeftSidebar(false);
            }}
            className="w-8 h-8 rounded-lg bg-[#4D96FF] text-white flex items-center justify-center hover:bg-[#3D85EF] active:scale-95 transition-all"
            title="AI咨询"
          >
            <MessageSquare className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* 2. Main Workspace */}
      <div className="flex-1 flex w-full overflow-hidden relative">
        
        {/* Mobile Backdrop Overlay */}
        {isMobile && (showLeftSidebar || showRightSidebar) && (
          <div
            onClick={() => {
              setShowLeftSidebar(false);
              setShowRightSidebar(false);
            }}
            className="absolute inset-0 bg-black/40 z-20 backdrop-blur-sm transition-opacity duration-300"
          />
        )}

        {/* COLUMN 1: LEFT SIDEBAR (City switch, routes, spots list) */}
        <div className={`
          bg-white border-zinc-200/80 flex flex-col p-4 space-y-5 flex-shrink-0 shadow-lg z-30 transition-all duration-300
          ${isMobile ? 'absolute top-0 bottom-[calc(60px+env(safe-area-inset-bottom))] left-0 w-[290px]' : 'w-[320px] border-r'}
          ${isMobile && !showLeftSidebar ? '-translate-x-full' : 'translate-x-0'}
        `}>
          <div className="pb-1 border-b border-zinc-100 flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-base text-zinc-900 flex items-center gap-1.5" style={{ fontFamily: "var(--font-noto-serif)" }}>
                <Landmark className="w-[18px] h-[18px] text-[#3A4D39]" />
                景区导航地图
              </h2>
              <p className="text-[10.5px] text-zinc-400 mt-0.5">点击景点查看详情和导航</p>
            </div>
            {isMobile && (
              <button onClick={() => setShowLeftSidebar(false)} className="text-zinc-400 hover:text-zinc-600 text-xs font-bold">关闭</button>
            )}
          </div>

          {/* City switcher carousel */}
          <div className="flex flex-col gap-1.5 pt-0.5 relative group/carousel">
            <span className="text-[9.5px] font-black text-zinc-400 uppercase tracking-wider">切换热门城市</span>
            <div className="relative w-full">
              <div
                ref={cityScrollRef}
                onMouseDown={handleCityMouseDown}
                onMouseMove={handleCityMouseMove}
                onMouseUp={handleCityMouseUpOrLeave}
                onMouseLeave={handleCityMouseUpOrLeave}
                className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none"
              >
                {POPULAR_CITIES.map((c) => {
                  const isActive = selectedCity === c.name;
                  return (
                    <button
                      key={c.name}
                      onClick={() => {
                        handleCityClick(c);
                        if (isMobile) {
                          setShowLeftSidebar(false);
                        }
                      }}
                      className={`flex-shrink-0 w-28 rounded-xl overflow-hidden border text-left transition-all snap-start select-none ${
                        isActive ? "border-[#4F6F52] bg-[#4F6F52]/5 ring-1 ring-[#4F6F52]/20" : "border-zinc-200/80 bg-white hover:border-zinc-300"
                      }`}
                    >
                      <div className="relative h-20 w-full">
                        <img src={c.img} alt={c.name} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-sm text-[8px] text-white px-1.5 py-0.5 rounded font-black">
                          {c.badge}
                        </span>
                      </div>
                      <div className="p-1.5 flex items-center justify-between">
                        <span className={`text-[11.5px] font-black ${isActive ? "text-[#4F6F52]" : "text-zinc-700"}`}>{c.name}</span>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#4F6F52]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              {/* Left / Right nav buttons */}
              <button
                type="button"
                onClick={() => scrollCities("left")}
                className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 items-center justify-center rounded-full bg-white/90 border border-zinc-200 text-zinc-600 hover:bg-white hover:text-[#4F6F52] shadow-sm cursor-pointer active:scale-95 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollCities("right")}
                className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 items-center justify-center rounded-full bg-white/90 border border-zinc-200 text-zinc-600 hover:bg-white hover:text-[#4F6F52] shadow-sm cursor-pointer active:scale-95 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Route Generator preferences */}
          <div className="space-y-3.5 pt-1.5 border-t">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-zinc-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#D2A053] animate-pulse" />
                智能专属路线生成
              </h3>
            </div>
            
            <div className="space-y-2 bg-[#FAF8F5] border border-zinc-200/50 p-2.5 rounded-xl">
              <div className="space-y-1">
                <span className="text-[9.5px] font-bold text-zinc-500 block">游玩偏好:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {INTERESTS.map(item => {
                    const active = selectedInterests.includes(item.id);
                    const activeStyles: Record<string, string> = {
                      history: "bg-rose-500 border-rose-500 text-white shadow-sm shadow-rose-500/10 hover:bg-rose-600",
                      nature: "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/10 hover:bg-emerald-600",
                      family: "bg-sky-500 border-sky-500 text-white shadow-sm shadow-sky-500/10 hover:bg-sky-600",
                      cultural: "bg-amber-500 border-amber-500 text-white shadow-sm shadow-amber-500/10 hover:bg-amber-600",
                    };
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedInterests(prev => prev.includes(item.id) ? prev.filter(x => x !== item.id) : [...prev, item.id]);
                        }}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold transition-all ${active ? activeStyles[item.id] : "bg-white text-zinc-600 border-zinc-200 hover:bg-neutral-50"}`}
                      >
                        {item.emoji} {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                  <span>游玩时长:</span>
                  <span className="font-mono text-[#D2A053]">{duration} 分钟</span>
                </div>
                <input
                  type="range" min={60} max={240} step={30} value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full h-1 bg-neutral-200 rounded accent-[#D2A053] cursor-pointer"
                />
              </div>

              <button
                onClick={() => {
                  handleGenerateRoute();
                  if (isMobile) {
                    setShowLeftSidebar(false);
                  }
                }}
                disabled={generating}
                className="w-full py-2 bg-gradient-to-r from-[#D2A053] to-[#B8843A] hover:from-[#E3B064] hover:to-[#C9954B] text-white rounded-xl text-[11px] font-extrabold shadow flex items-center justify-center gap-1.5 transition-colors"
              >
                {generating ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" />规划中...</>
                ) : (
                  <><Compass className="w-3.5 h-3.5" />生成专属路线</>
                )}
              </button>

              {activeRoute && (
                <div className="p-2.5 rounded-xl bg-white border border-zinc-200 text-[10px] space-y-2 max-h-[140px] overflow-y-auto">
                  <div className="font-bold text-[#3A4D39] border-b pb-1 flex justify-between">
                    <span>{activeRoute.name}</span>
                    <span className="font-mono">{activeRoute.totalDistance}</span>
                  </div>
                  <div className="space-y-1">
                    {activeRoute.spots.map((s, idx) => (
                      <div key={s.id} className="text-zinc-700 truncate">
                        {idx + 1}. {s.name} <span className="text-zinc-400">({s.duration}分钟)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* List of Scenic Spots */}
          <div className="space-y-2 pt-2 border-t flex-1 flex flex-col overflow-hidden">
            <h3 className="text-xs font-black text-zinc-800">景区全部景点 ({currentSpots.length})</h3>
            <div className="space-y-1 pr-1 pb-6 overflow-y-auto flex-1 scrollbar-thin">
              {currentSpots.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveSpot(s);
                    if (isMobile) {
                      setShowLeftSidebar(false);
                    }
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.setZoomAndCenter(14, [s.lng, s.lat], false, 300);
                      showAmapInfoWindow(s);
                      if (autoplayEnabled) {
                        speakSpotNarration(s.name, s.desc);
                      }
                    }
                  }}
                  className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between border transition-all ${activeSpot?.id === s.id ? "bg-[#3A4D39]/5 border-[#3A4D39]/30 font-bold" : "border-transparent hover:bg-neutral-50"}`}
                >
                  <span className="truncate text-zinc-800 pr-2">{s.name}</span>
                  <span className="bg-neutral-100 text-zinc-500 text-[8.5px] px-1.5 py-0.5 rounded flex-shrink-0">{s.type}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMN 2: CENTER MAP COMPONENT */}
        <div className="flex-1 relative bg-zinc-100 h-full overflow-hidden z-10">
          <div ref={mapRef} className="w-full h-full" />

          {/* Map Top horizontal Popular Spots Cards overlay (Aligned to left, avoiding top-right controls) */}
          <div className="absolute top-4 left-4 z-25 flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none pb-1.5 snap-x w-[calc(100%-40px)] sm:w-[calc(100%-65px)] md:max-w-[calc(100%-180px)]">
            {currentSpots.slice(0, 6).map((spot) => {
              const isActive = activeSpot?.id === spot.id;
              return (
                <button
                  key={spot.id}
                  onClick={() => {
                    setActiveSpot(spot);
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.setZoomAndCenter(15, [spot.lng, spot.lat], false, 300);
                      showAmapInfoWindow(spot);
                    }
                    if (autoplayEnabled) {
                      speakSpotNarration(spot.name, spot.desc);
                    }
                  }}
                  className={`flex-shrink-0 w-[100px] sm:w-[140px] rounded-xl overflow-hidden bg-white/95 backdrop-blur-md border transition-all text-left shadow-md flex flex-col snap-start ${
                    isActive ? "border-[#4F6F52] ring-2 ring-[#4F6F52]/20" : "border-zinc-200/40"
                  }`}
                >
                  <div className="relative h-10 sm:h-14 w-full flex-shrink-0">
                    <img src={spot.img} alt={spot.name} className="w-full h-full object-cover" />
                    <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-sm text-[7px] text-white px-1.5 py-0.5 rounded-full font-black">
                      ⭐ {spot.rating}
                    </div>
                  </div>
                  <div className="p-1.5 sm:p-2 flex flex-col justify-between flex-1 min-w-0">
                    <div className="text-[10px] sm:text-[11px] font-black text-zinc-900 truncate leading-tight">{spot.name}</div>
                    <div className="flex items-center justify-between mt-1 text-[8px] sm:text-[9px] text-[#4F6F52] font-bold">
                      <span className="truncate">{spot.type}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>



          {/* Floating Compass and Zoom controls stacked in the top-right corner (Pushed lower on mobile) */}
          <div className="absolute right-4 top-36 md:top-4 z-30 flex flex-col gap-2">
            <button
              onClick={() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.setPitch(0);
                  mapInstanceRef.current.setRotation(0);
                  setMapRotation(0);
                  toast.success("已重置地图方向为正北");
                }
              }}
              className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-zinc-200/50 flex items-center justify-center text-zinc-700 hover:bg-zinc-50 active:scale-95 transition-all"
              title="重置正北"
            >
              <div style={{ transform: `rotate(${-mapRotation}deg)` }} className="transition-transform duration-100 ease-out">
                <Compass className="w-5 h-5 text-[#FF5B45]" />
              </div>
            </button>

            <button
              onClick={() => {
                if (mapInstanceRef.current) {
                  const center = POPULAR_CITIES.find(c => c.name === selectedCity)?.center || [106.578, 29.563];
                  mapInstanceRef.current.setZoomAndCenter(13, center, false, 300);
                  toast.info(`已定位至 ${selectedCity} 核心区`);
                }
              }}
              className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-zinc-200/50 flex items-center justify-center text-zinc-700 hover:bg-zinc-50 active:scale-95 transition-all"
              title="定位核心"
            >
              <Navigation className="w-4.5 h-4.5 text-zinc-600" />
            </button>

            <button onClick={() => mapInstanceRef.current?.zoomIn()} className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md border shadow-lg flex items-center justify-center font-bold text-zinc-700 hover:bg-neutral-50 active:scale-95">+</button>
            <button onClick={() => mapInstanceRef.current?.zoomOut()} className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md border shadow-lg flex items-center justify-center font-bold text-zinc-700 hover:bg-neutral-50 active:scale-95">-</button>
          </div>

          {/* Desktop Draggable Float AI Assistant Panel (Wider and shorter: w-360px h-500px) */}
          {!isMobile && !showFloatChat && (
            <button
              onClick={() => setShowFloatChat(true)}
              className="absolute bottom-4 right-4 z-30 w-14 h-14 rounded-full bg-[#4F6F52] text-white shadow-2xl flex flex-col items-center justify-center hover:bg-[#3A5240] active:scale-95 transition-all group"
            >
              <MessageSquare className="w-6 h-6 animate-pulse" />
              <span className="text-[9px] font-black mt-0.5 scale-90">智能向导</span>
            </button>
          )}

          {!isMobile && showFloatChat && (
            <motion.div
              drag
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ left: -800, right: 50, top: -400, bottom: 100 }}
              dragElastic={0.05}
              dragMomentum={false}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute bottom-4 right-4 z-30 w-[300px] h-[420px] bg-white/95 backdrop-blur-md rounded-2xl border border-zinc-200/80 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header acts as drag handle */}
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="p-3 bg-zinc-50/50 border-b border-zinc-100 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
              >
                <div className="flex items-center gap-2 pointer-events-none">
                  <div className="w-7 h-7 rounded-full bg-[#4F6F52]/10 flex items-center justify-center text-[#4F6F52]">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs text-zinc-800">智能向导小慧</h3>
                    <span className="text-[8.5px] text-zinc-400 block mt-0.5">按住此处可上下左右拖拽</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowFloatChat(false)}
                  className="w-6 h-6 rounded-full hover:bg-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3.5 bg-zinc-50/40">
                {chatMessages.map((msg, idx) => {
                  const isUser = msg.role === "user";
                  const avatarSrc = isUser
                    ? (user?.avatar || "https://img0.baidu.com/it/u=830713058,3987335577&fm=253&app=138&f=JPEG?w=819&h=800")
                    : "https://img2.baidu.com/it/u=3788583827,2446405164&fm=253&app=138&f=JPEG?w=817&h=800";
                  return (
                    <div key={idx} className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                      <div className="flex-shrink-0 w-7 h-7 rounded-full overflow-hidden border border-zinc-200 bg-white">
                        <img src={avatarSrc} alt={isUser ? "我" : "小慧"} className="w-full h-full object-cover" />
                      </div>
                      <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-sm ${
                        isUser ? "bg-[#4D96FF] text-white rounded-br-sm" : "bg-white text-zinc-800 border rounded-bl-sm"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                {chatLoading && (
                  <div className="flex gap-2">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full overflow-hidden border border-zinc-200 bg-white">
                      <img src="https://img2.baidu.com/it/u=3788583827,2446405164&fm=253&app=138&f=JPEG?w=817&h=800" alt="小慧" className="w-full h-full object-cover" />
                    </div>
                    <div className="bg-white border text-zinc-500 rounded-2xl rounded-bl-sm px-3 py-1.5 text-xs flex items-center gap-1.5 shadow-sm">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>思考中...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Attachments view */}
              {attachedMedia.length > 0 && (
                <div className="px-3 py-1.5 bg-neutral-100 border-t flex flex-wrap gap-2">
                  {attachedMedia.map((m, idx) => (
                    <div key={idx} className="bg-white rounded-lg border px-2 py-0.5 text-[8.5px] font-bold text-zinc-600 flex items-center gap-1">
                      <span>{m.type === 'image' ? '🖼️' : '🎬'}</span>
                      <span className="truncate max-w-[80px]">{m.name}</span>
                      <button onClick={() => setAttachedMedia(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 font-extrabold text-[10px]">×</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Chat Inputs */}
              <div className="p-1.5 border-t border-zinc-100 bg-white flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="w-7 h-7 rounded-full border border-zinc-200 text-zinc-500 hover:bg-neutral-50 flex items-center justify-center cursor-pointer transition-colors"
                    title="选择图片"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleSpeechInputToggle}
                    className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                      recording ? "border-amber-500 bg-amber-50 text-amber-600 shadow" : "border-zinc-200 text-zinc-500 hover:bg-neutral-50"
                    }`}
                    title="语音提问"
                  >
                    {recording ? <Mic className="w-3.5 h-3.5 animate-bounce" /> : <Mic className="w-3.5 h-3.5" />}
                  </button>

                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                    placeholder={recording ? "正在聆听..." : "向小慧提问..."}
                    className="flex-1 bg-neutral-50 border border-zinc-200/80 rounded-full px-3 py-2 text-xs outline-none focus:border-[#4F6F52] focus:bg-white transition-all text-[#2C3E35]"
                  />

                  <button
                    onClick={handleSendChatMessage}
                    className="w-7 h-7 rounded-full bg-[#4F6F52] text-white flex items-center justify-center hover:bg-[#3A5240] transition-colors shadow-md flex-shrink-0 active:scale-95"
                  >
                    <Send className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* COLUMN 3: RIGHT SIDEBAR (AI Q&A Guide Chat Panel - Mobile Drawer version only) */}
        {isMobile && (
          <div className={`
            bg-white border-zinc-200/80 flex flex-col overflow-hidden shadow-lg z-30 transition-all duration-300
            absolute top-0 bottom-[calc(60px+env(safe-area-inset-bottom))] right-0 w-[300px]
            ${!showRightSidebar ? 'translate-x-full' : 'translate-x-0'}
          `}>
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#4F6F52]/10 flex items-center justify-center text-[#4F6F52]">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-zinc-800">智能向导小慧</h3>
                  <span className="text-[8.5px] text-zinc-400 block mt-0.5">支持语音提问与多媒体识别</span>
                </div>
              </div>
              <button onClick={() => setShowRightSidebar(false)} className="text-zinc-400 hover:text-zinc-600 text-xs font-bold">关闭</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/40">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-sm ${
                    msg.role === "user" ? "bg-[#3A4D39] text-white" : "bg-white text-zinc-800 border"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border text-zinc-500 rounded-2xl px-3.5 py-2 text-xs flex items-center gap-1.5 shadow-sm">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>思考中...</span>
                  </div>
                </div>
              )}
            </div>

            {attachedMedia.length > 0 && (
              <div className="px-4 py-2 bg-neutral-100 border-t flex flex-wrap gap-2 flex-shrink-0">
                {attachedMedia.map((m, idx) => (
                  <div key={idx} className="bg-white rounded-lg border px-2 py-1 text-[9px] font-bold text-zinc-600 flex items-center gap-1">
                    <span>{m.type === 'image' ? '🖼️' : '🎬'}</span>
                    <span className="truncate max-w-[80px]">{m.name}</span>
                    <button onClick={() => setAttachedMedia(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 font-extrabold text-[10px]">×</button>
                  </div>
                ))}
              </div>
            )}

            <div className="p-2 border-t border-zinc-100 bg-white flex-shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="w-8 h-8 rounded-full border border-zinc-200 text-zinc-500 hover:bg-neutral-50 flex items-center justify-center cursor-pointer transition-colors"
                  title="选择图片"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                <button
                  onClick={handleSpeechInputToggle}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                    recording ? "border-amber-500 bg-amber-50 text-amber-600 shadow" : "border-zinc-200 text-zinc-500 hover:bg-neutral-50"
                  }`}
                  title="语音提问"
                >
                  {recording ? <Mic className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                  placeholder={recording ? "正在聆听..." : "向小慧提问..."}
                  className="flex-1 bg-neutral-50 border border-zinc-200/80 rounded-full px-4 py-2.5 text-xs outline-none focus:border-[#4F6F52] focus:bg-white transition-all text-[#2C3E35]"
                />

                <button
                  onClick={handleSendChatMessage}
                  className="w-8 h-8 rounded-full bg-[#4F6F52] text-white flex items-center justify-center hover:bg-[#3A5240] transition-colors shadow-md flex-shrink-0 active:scale-95"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Artifacts drawer modal */}
      <AnimatePresence>
        {showArtifactsDrawer && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              onClick={() => setShowArtifactsDrawer(false)}
              className="absolute inset-0 bg-black z-45" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25 }}
              className="absolute bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-5 space-y-3 max-h-[70vh] overflow-y-auto md:max-w-[460px] md:mx-auto md:rounded-3xl md:bottom-[10%] md:top-[10%] md:h-[600px]">
              <div className="flex items-center justify-between pb-2 border-b">
                <h3 className="font-extrabold text-sm text-zinc-900" style={{ fontFamily: "var(--font-noto-serif)" }}>巴蜀文博陈列</h3>
                <button onClick={() => setShowArtifactsDrawer(false)} className="text-zinc-400 hover:text-zinc-750 text-xs font-bold">关闭</button>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                {[
                  { name: "巴国青铜剑", period: "战国时期", emoji: "🗡️", desc: "柳叶形扁茎无格，表面带有精致暗斑文饰，巴人标志性兵器。" },
                  { name: "汉代宴乐陶俑", period: "东汉", emoji: "🏺", desc: "陶俑神态逼真，生动体现了东汉时期川蜀地区的乐舞生活面貌。" },
                  { name: "三峡夔门石刻拓片", period: "明清", emoji: "📜", desc: "镌刻着历代文人墨客描绘瞿塘峡天险的雄浑墨宝。" },
                  { name: "巴渝木雕隔扇", period: "清代", emoji: "🪵", desc: "镂空透雕的吉祥花鸟鸟兽图案，极其精细的镂空技法。" }
                ].map(a => (
                  <div key={a.name} className="p-3 bg-[#FAF8F5] border border-zinc-200/50 rounded-xl space-y-1.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{a.emoji}</span>
                      <span className="text-[8px] bg-zinc-200 px-1 py-0.5 rounded text-zinc-500 font-bold">{a.period}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[11.5px] text-zinc-900">{a.name}</h4>
                      <p className="text-[9.5px] text-zinc-500 leading-normal mt-0.5">{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AI Route Generation Progress Modal */}
      <AnimatePresence>
        {showProgressModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="w-full max-w-sm rounded-3xl p-6 bg-[#16201B] border border-white/20 shadow-2xl text-white space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#D2A053]/20 border border-[#D2A053]/40 flex items-center justify-center flex-shrink-0">
                  <Compass className="w-6 h-6 text-[#D2A053] animate-spin" style={{ animationDuration: "3s" }} />
                </div>
                <div>
                  <h3 className="font-bold text-base tracking-wide" style={{ fontFamily: "var(--font-noto-serif)" }}>
                    AI 智能路线规划中
                  </h3>
                  <p className="text-xs text-white/50">大语言模型与空间地理算法融合分析</p>
                </div>
              </div>

              {/* Progress bar container */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-[#D2A053] font-bold">规划进度</span>
                  <span className="font-bold text-white">{progressPercent}%</span>
                </div>
                <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#D2A053] via-amber-400 to-emerald-400 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Step message */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/90 min-h-[50px] flex items-center leading-relaxed">
                <span>{progressStep}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
