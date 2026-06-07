"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, Star, ChevronRight, Search, Filter } from "lucide-react";
import Link from "next/link";
import { CITIES } from "@/lib/data/national-spots";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 35 };

interface Spot { id: number; name: string; category: string; description: string; imageUrl: string; duration: number; distance: string; rating: number; visitCount: number; tags: string[] }

const CATS = [
  { id: "all", label: "全部", color: "#4F6F52" },
  { id: "national", label: "全国热门", color: "#B8843A" },
  { id: "cultural", label: "人文", color: "#3A4D39" },
  { id: "nature", label: "自然", color: "#4F6F52" },
  { id: "history", label: "历史", color: "#8F7A5A" },
  { id: "family", label: "亲子", color: "#D2A053" },
];

const CAT_ICONS: Record<string, string> = { cultural: "🏯", nature: "🌿", history: "📜", family: "👨‍👩‍👧", all: "✨", national: "🔥" };

function StarRating({ rating }: { rating: number }) {
  const stars = rating / 10; // out of 5
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className="w-3 h-3" fill={s <= Math.round(stars) ? "#D2A053" : "none"}
          style={{ color: s <= Math.round(stars) ? "#D2A053" : "#E6E2D8" }} />
      ))}
      <span className="ml-1 text-[10px]" style={{ color: "#8F9F8F" }}>{(stars).toFixed(1)}</span>
    </div>
  );
}

export function SpotsScreen() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCity, setSelectedCity] = useState("北京");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const cityParam = cat === "national" ? `&city=${encodeURIComponent(selectedCity)}` : "";
    const url = `/api/spots?category=${cat}${cityParam}&search=${encodeURIComponent(debouncedSearch)}&limit=50`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setSpots(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [cat, debouncedSearch, selectedCity]);

  return (
    <div className="min-h-svh" style={{ background: "#FAF8F5" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 pb-3 space-y-3"
        style={{ background: "rgba(250,248,245,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid #E6E2D8", paddingTop: "calc(env(safe-area-inset-top, 44px) + 8px)" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>景点导览</h2>
          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.88 }}
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="p-1.5 rounded-lg" style={{ background: "#F0EDE5", color: "#4F6F52" }}>
              <Filter className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-full"
          style={{ background: "white", border: "1px solid #E6E2D8" }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: "#8F9F8F" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索景点名称或标签..." className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "#1E2522", fontSize: 16 }} />
        </div>
        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {CATS.map((c) => (
            <motion.button key={c.id} whileTap={{ scale: 0.92 }} onClick={() => setCat(c.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0"
              style={{
                background: cat === c.id ? c.color : "white",
                color: cat === c.id ? "white" : "#3A4D39",
                border: `1px solid ${cat === c.id ? c.color : "#E6E2D8"}`,
              }}>
              <span>{CAT_ICONS[c.id]}</span>{c.label}
            </motion.button>
          ))}
        </div>
        {/* City selector */}
        <AnimatePresence>
          {cat === "national" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={SPRING}
              className="overflow-hidden"
            >
              <div className="flex gap-2 overflow-x-auto py-2 scrollbar-none" style={{ scrollbarWidth: "none" }}>
                {CITIES.map((city) => (
                  <motion.button
                    key={city.id}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setSelectedCity(city.name)}
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 transition-all"
                    style={{
                      background: selectedCity === city.name ? "rgba(210,160,83,0.15)" : "#F5F0E8",
                      color: selectedCity === city.name ? "#B8843A" : "#8F9F8F",
                      border: `1px solid ${selectedCity === city.name ? "rgba(210,160,83,0.4)" : "transparent"}`,
                    }}
                  >
                    <span>{city.icon}</span>
                    <span>{city.name}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Spot count */}
      <div className="px-4 py-2">
        <p className="text-[11px]" style={{ color: "#8F9F8F" }}>共 {spots.length} 处景点</p>
      </div>

      {/* List */}
      <div className={`px-4 pb-8 ${viewMode === "grid" ? "grid grid-cols-2 gap-3" : "space-y-3"}`}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`skeleton ${viewMode === "grid" ? "h-52" : "h-24"} rounded-xl`} />
          ))
        ) : spots.length === 0 ? (
          <div className="col-span-2 text-center py-16">
            <p className="text-2xl mb-2">🔍</p>
            <p className="text-sm" style={{ color: "#8F9F8F" }}>没有找到相关景点</p>
          </div>
        ) : (
          spots.map((spot, i) => (
            <motion.div key={spot.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: i * 0.04 }}>
              {viewMode === "grid"
                ? <SpotGridCard spot={spot} />
                : <SpotListCard spot={spot} />}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function SpotGridCard({ spot }: { spot: Spot }) {
  const catColor = { cultural: "#3A4D39", nature: "#4F6F52", history: "#8F7A5A", family: "#D2A053" }[spot.category] || "#4F6F52";
  return (
    <Link href={`/spots/${spot.id}`}>
      <motion.div whileTap={{ scale: 0.94 }} whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(79,111,82,0.18)" }}
        className="rounded-2xl overflow-hidden cursor-pointer"
        style={{ background: "white", border: "1px solid #E6E2D8", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
        {/* Image */}
        <div className="relative" style={{ height: 120 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={spot.imageUrl || "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=70"}
            alt={spot.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)" }} />
          {/* Category chip */}
          <div className="absolute top-2 left-2">
            <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: `${catColor}cc`, color: "white", backdropFilter: "blur(4px)" }}>
              {CAT_ICONS[spot.category]} {CATS.find((c) => c.id === spot.category)?.label}
            </span>
          </div>
          {/* Visit count */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            <Star className="w-2.5 h-2.5" fill="#D2A053" style={{ color: "#D2A053" }} />
            <span className="text-[9px] text-white font-mono">{(spot.rating / 10).toFixed(1)}</span>
          </div>
        </div>
        {/* Info */}
        <div className="p-2.5">
          <h4 className="font-semibold text-[12px] leading-tight" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
            {spot.name}
          </h4>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" style={{ color: "#8F9F8F" }} />
              <span className="text-[9px]" style={{ color: "#8F9F8F" }}>{spot.duration}分钟</span>
            </div>
            <div className="flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5" style={{ color: "#8F9F8F" }} />
              <span className="text-[9px] truncate" style={{ color: "#8F9F8F" }}>{spot.distance}</span>
            </div>
          </div>
          {/* Rating bar */}
          <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "#F0EDE5" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${(spot.rating / 50) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${catColor}, #D2A053)` }} />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function SpotListCard({ spot }: { spot: Spot }) {
  return (
    <Link href={`/spots/${spot.id}`}>
      <motion.div whileTap={{ scale: 0.98 }}
        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer"
        style={{ background: "white", border: "1px solid #E6E2D8" }}>
        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={spot.imageUrl || "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=70"} alt={spot.name}
            className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="font-semibold text-[13px]" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>{spot.name}</h4>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(79,111,82,0.1)", color: "#4F6F52" }}>
              {CATS.find((c) => c.id === spot.category)?.label}
            </span>
          </div>
          <StarRating rating={spot.rating} />
          <p className="text-[11px] mt-1 line-clamp-1" style={{ color: "#8F9F8F" }}>{spot.description}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px]" style={{ color: "#8F9F8F" }}><Clock className="w-3 h-3 inline mr-0.5" />{spot.duration}分钟</span>
            <span className="text-[10px]" style={{ color: "#8F9F8F" }}><MapPin className="w-3 h-3 inline mr-0.5" />{spot.distance}</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "#8F9F8F" }} />
      </motion.div>
    </Link>
  );
}
