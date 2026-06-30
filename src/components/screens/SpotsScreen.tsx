"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, MapPin, X, Music } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NATIONAL_SPOTS, type NationalSpot } from "@/lib/data/national-spots";

const SIDEBAR_ITEMS = [
  { id: "hot", label: "热门", city: null },
  { id: "changsha", label: "长沙市", city: "长沙" },
  { id: "chongqing", label: "重庆市", city: "重庆" },
  { id: "chengdu", label: "成都市", city: "成都" },
  { id: "xian", label: "西安市", city: "西安" },
  { id: "guilin", label: "桂林市", city: "桂林" },
  { id: "beijing", label: "北京市", city: "北京" },
  { id: "hangzhou", label: "杭州市", city: "杭州" },
  { id: "wuhan", label: "武汉市", city: "武汉" },
  { id: "shanghai", label: "上海市", city: "上海" },
  { id: "nanjing", label: "南京市", city: "南京" },
  { id: "suzhou", label: "苏州市", city: "苏州" },
  { id: "guangzhou", label: "广州市", city: "广州" },
  { id: "qingdao", label: "青岛市", city: "青岛" },
  { id: "xiamen", label: "厦门市", city: "厦门" },
];

// Hot spots order from screenshot: 布达拉宫, 九寨沟, 西湖, 故宫, 泰山, 黄山
const HOT_SPOTS_IDS = [10021, 10022, 10005, 10001, 10023, 10024];

const getShortName = (name: string) => {
  if (name === "北京故宫博物院") return "故宫博物院";
  if (name === "杭州西湖风景区") return "西湖";
  if (name === "秦始皇兵马俑博物馆") return "兵马俑";
  if (name === "成都大熊猫繁育研究基地") return "大熊猫基地";
  if (name === "洪崖洞民俗风貌区") return "洪崖洞";
  if (name === "阳朔漓江竹筏漫游") return "漓江竹筏";
  if (name === "玉龙雪山国家级风景区") return "玉龙雪山";
  return name;
};

const CITY_BANNERS: Record<string, string> = {
  hot: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80",
  hangzhou: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
  xian: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80",
  chongqing: "https://images.unsplash.com/photo-1542359649-31e03cd4d909?w=800&q=80",
  chengdu: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800&q=80",
  beijing: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80",
  changsha: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=80",
  wuhan: "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=800&q=80",
  guilin: "https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?w=800&q=80",
  shanghai: "https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403?w=800&q=80",
};

export function SpotsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("hot");
  const [search, setSearch] = useState("");
  const [filteredSpots, setFilteredSpots] = useState<NationalSpot[]>([]);

  useEffect(() => {
    let list: NationalSpot[] = [];

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      list = NATIONAL_SPOTS.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.tags.some((t) => t.toLowerCase().includes(query))
      );
    } else {
      if (activeTab === "hot") {
        list = HOT_SPOTS_IDS.map((id) => NATIONAL_SPOTS.find((s) => s.id === id)).filter(Boolean) as NationalSpot[];
      } else {
        const activeItem = SIDEBAR_ITEMS.find((item) => item.id === activeTab);
        if (activeItem && activeItem.city) {
          list = NATIONAL_SPOTS.filter((s) => s.city === activeItem.city);
        }
      }
    }
    setFilteredSpots(list);
  }, [activeTab, search]);

  const handleLocationClick = () => {
    setActiveTab("chengdu");
    setSearch("");
  };

  const activeLabel = SIDEBAR_ITEMS.find((i) => i.id === activeTab)?.label || "热门";

  return (
    <div className="min-h-svh flex flex-col bg-white select-none">
      {/* Top Header */}
      <div className="px-4 pb-3 flex-shrink-0 flex items-center gap-3 bg-white"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 44px) + 8px)" }}>
        
        <button onClick={() => router.push("/home")}
          className="p-1 rounded-full text-zinc-700 hover:text-black transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#C4CBD0] bg-white">
          <Search className="w-4 h-4 text-[#8A959E] flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索目的地或景区"
            className="flex-1 bg-transparent text-sm outline-none text-[#1E2522]"
            style={{ fontSize: 14 }}
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-zinc-400 hover:text-zinc-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* City Cards Strip (from home screen) */}
      <div className="px-4 pt-2 pb-1.5 bg-white flex-shrink-0 border-b border-[#EEF2F0]">
        <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-0.5">
          {[
            { city: "重庆", tab: "chongqing", title: "洪崖洞夜色", img: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=300&q=90" },
            { city: "北京", tab: "beijing", title: "故宫红墙", img: "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=300&q=90" },
            { city: "杭州", tab: "hangzhou", title: "西湖烟柳", img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=300&q=90" },
            { city: "西安", tab: "xian", title: "古城晨光", img: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=300&q=90" },
            { city: "上海", tab: "shanghai", title: "外滩天际", img: "https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403?auto=format&fit=crop&w=300&q=90" },
            { city: "成都", tab: "chengdu", title: "大熊猫基地", img: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=300&q=90" },
            { city: "南京", tab: "nanjing", title: "金陵夜色", img: "https://images.unsplash.com/photo-1542359649-31e03cd4d909?auto=format&fit=crop&w=300&q=90" },
            { city: "武汉", tab: "wuhan", title: "江城樱花", img: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=300&q=90" },
            { city: "苏州", tab: "suzhou", title: "江南园林", img: "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=300&q=90" },
            { city: "广州", tab: "guangzhou", title: "珠江夜韵", img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=300&q=90" },
            { city: "青岛", tab: "qingdao", title: "红瓦绿树", img: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=300&q=90" },
            { city: "厦门", tab: "xiamen", title: "鹭岛海风", img: "https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403?auto=format&fit=crop&w=300&q=90" },
          ].map((banner) => {
            const isActive = activeTab === banner.tab;
            return (
              <div
                key={banner.city}
                onClick={() => {
                  setActiveTab(banner.tab);
                  setSearch("");
                }}
                className={`flex-shrink-0 w-[116px] rounded-xl overflow-hidden border shadow-sm bg-white cursor-pointer transition-all active:scale-95 ${
                  isActive ? "border-[#FF5B45] ring-2 ring-[#FF5B45]/15" : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="relative h-20">
                  <img src={banner.img} alt={banner.title} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute left-2.5 bottom-2 z-10">
                    <div className="text-[11px] font-black text-white leading-tight">{banner.city}</div>
                    <div className="text-[9px] text-white/80 font-medium truncate max-w-[95px] leading-tight mt-0.5">{banner.title}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Location Section */}
      <div className="px-4 py-2 border-b border-[#EEF2F0] flex-shrink-0 bg-white flex items-center justify-between">
        <div>
          <span className="text-[11px] text-[#8A959E] font-medium block">当前定位</span>
          <motion.div
            whileTap={{ scale: 0.96 }}
            onClick={handleLocationClick}
            className="mt-1 flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-[#FF5B45] bg-[#FFF0ED] w-fit cursor-pointer border border-[#FFE2DC] hover:bg-[#FFE6E1] transition-all"
          >
            <MapPin className="w-3 h-3 text-[#FF5B45]" fill="#FF5B45" />
            <span>成都市</span>
          </motion.div>
        </div>

        {/* 伴游FM Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/fm")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FF7A5A] to-[#FF5B45] text-white text-[11px] font-black shadow-[0_4px_10px_rgba(255,91,69,0.18)] hover:opacity-95 transition-opacity"
        >
          <Music className="w-3.5 h-3.5" />
          <span>伴游FM</span>
        </motion.button>
      </div>

      {/* Sidebar and content */}
      <div className="flex-1 flex overflow-hidden bg-white">
        {/* Left Sidebar */}
        <div className="w-[100px] flex-shrink-0 bg-[#F5F7F8] border-r border-[#E6E2D8] overflow-y-auto scrollbar-none" style={{ scrollbarWidth: "none" }}>
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSearch("");
                }}
                className="w-full py-4 px-2 relative text-center text-[13px] transition-all flex items-center justify-center min-h-[52px]"
                style={{
                  background: isActive ? "white" : "transparent",
                  color: isActive ? "#FF5B45" : "#5C6B73",
                  fontWeight: isActive ? "700" : "500",
                }}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] bg-[#FF5B45] rounded-r" />
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content */}
        <div className="flex-1 bg-white overflow-y-auto px-4 py-3 scrollbar-none" style={{ scrollbarWidth: "none" }}>
          {!search.trim() && CITY_BANNERS[activeTab] && (
            <div className="w-full h-24 rounded-xl overflow-hidden relative mb-4 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={CITY_BANNERS[activeTab]}
                alt={activeLabel}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center px-4">
                <span className="text-white font-bold text-sm tracking-wide" style={{ fontFamily: "var(--font-noto-serif)" }}>
                  遇见{activeLabel.replace("市", "")}
                </span>
              </div>
            </div>
          )}

          <div className="mb-4">
            <h2 className="text-[13px] font-bold text-[#1E2522]">
              {search.trim() ? "搜索结果" : activeLabel}
            </h2>
          </div>

          {filteredSpots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-3xl mb-2">🔍</span>
              <p className="text-xs text-[#8A959E]">没有找到相关目的地</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-2.5 gap-y-4 pb-12">
              {filteredSpots.map((spot) => (
                <Link key={spot.id} href={`/spots/${spot.id}`}>
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center cursor-pointer group"
                  >
                    <div className="w-full aspect-square rounded-xl overflow-hidden shadow-sm bg-neutral-100 border border-neutral-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={spot.imageUrl}
                        alt={spot.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <span className="mt-1.5 text-[11px] font-medium text-[#2F3E46] text-center w-full truncate px-0.5">
                      {getShortName(spot.name)}
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
