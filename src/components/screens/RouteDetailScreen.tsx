"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Clock, Camera, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import AMapLoader from "@amap/amap-jsapi-loader";

if (typeof window !== "undefined") {
  (window as any)._AMapSecurityConfig = {
    securityJsCode: process.env.NEXT_PUBLIC_AMAP_SECURITY_CODE || "",
  };
}

const SPRING = { type: "spring" as const, stiffness: 280, damping: 35 };

interface Spot { id: number; name: string; duration: number; description: string; imageUrl: string; distance: string; rating: number; tags: string[]; location?: { lat: number; lng: number } }
interface RouteDetail { id: number; name: string; description: string; highlights: string[]; totalDistance: string; duration: number; spots: Spot[] }

export function RouteDetailScreen({ routeId }: { routeId: string }) {
  const [route, setRoute] = useState<RouteDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/routes/${routeId}`)
      .then((r) => r.json())
      .then((data) => { setRoute(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [routeId]);

  const detailMapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);

  useEffect(() => {
    if (loading || !route || !route.spots || route.spots.length === 0) return;

    // 高德 Key 缺失友好提示，避免移动端静默失败
    if (!process.env.NEXT_PUBLIC_AMAP_KEY) {
      console.error("[高德地图] 未配置 NEXT_PUBLIC_AMAP_KEY 环境变量");
      return;
    }

    let map: any = null;
    let timer: any = null;
    let resizeObserver: ResizeObserver | null = null;
    let aborted = false;

    const initDetailMap = () => {
      if (aborted) return;
      const container = detailMapRef.current;
      if (!container) {
        timer = setTimeout(initDetailMap, 50);
        return;
      }

      // 容器还未完成布局 — 使用 ResizeObserver 等待，避免轮询失效
      if (container.clientWidth === 0 || container.clientHeight === 0) {
        if (!resizeObserver) {
          resizeObserver = new ResizeObserver(() => {
            if (aborted) return;
            const c = detailMapRef.current;
            if (c && c.clientWidth > 0 && c.clientHeight > 0) {
              resizeObserver?.disconnect();
              resizeObserver = null;
              initDetailMap();
            }
          });
          resizeObserver.observe(container);
        }
        return;
      }

      AMapLoader.load({
        key: process.env.NEXT_PUBLIC_AMAP_KEY || "",
        version: "2.0",
        plugins: ["AMap.Walking", "AMap.Polyline"],
      }).then((AMap) => {
        if (aborted || !detailMapRef.current) return;

        // Find coordinates of spots - explicitly parse to numbers to avoid AMap string coercion bugs
        const coordinates = route.spots.map((spot: any) => {
          const lat = parseFloat(spot.location?.lat);
          const lng = parseFloat(spot.location?.lng);
          if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) return null;
          return [lng, lat]; // [lng, lat] for Amap
        }).filter(Boolean) as Array<[number, number]>;

        // Defensive coordinates validation
        const validCoords = coordinates;

        const centerCoords = validCoords.length > 0 ? validCoords[0] : [106.578, 29.563];

        map = new AMap.Map(container, {
          viewMode: "3D",
          zoom: 14,
          center: centerCoords,
          theme: "amap://styles/whitesmoke",
          zoomEnable: true,
          dragEnable: true,
          resizeEnable: true,
        });

        // 立即赋值，确保 cleanup 始终可销毁
        mapInstanceRef.current = map;

        // 监听容器尺寸变化(移动端横竖屏切换等)，主动触发 resize
        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(() => {
            if (aborted || !map) return;
            try { map.resize?.(); } catch (_) {}
          });
          resizeObserver.observe(container);
        }

        // Wait for the map to be fully loaded and layouted before rendering markers and pathfinding
        map.on("complete", () => {
          if (aborted || !detailMapRef.current) return;

          // Draw custom markers
          route.spots.forEach((spot: any, i: number) => {
            const lat = parseFloat(spot.location?.lat);
            const lng = parseFloat(spot.location?.lng);
            if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) return;

            const isStart = i === 0;
            const isEnd = i === route.spots.length - 1;
            const spotColor = isStart ? "#4F6F52" : isEnd ? "#DC2626" : "#D2A053";

            const markerContent = `
              <div class="flex flex-col items-center">
                <div class="px-2 py-0.5 bg-white/95 border border-zinc-200 shadow-sm rounded text-[9px] font-bold text-zinc-800 whitespace-nowrap -translate-y-1">
                  ${spot.name}
                </div>
                <div class="w-5 h-5 rounded-full bg-white border-2 flex items-center justify-center shadow-md -translate-y-1" 
                     style="border-color: ${spotColor};">
                  <span class="text-[9px] font-bold" style="color: ${spotColor};">${isStart ? "起" : isEnd ? "终" : i + 1}</span>
                </div>
              </div>
            `;

            const marker = new AMap.Marker({
              position: [lng, lat],
              content: markerContent,
              offset: new AMap.Pixel(-30, -35),
            });
            marker.setMap(map);
          });

          // Route pathfinding/navigation line
          if (validCoords.length >= 2) {
            const walking = new AMap.Walking({
              map: map,
              hideMarkers: true,
              autoFitView: true,
            });

            const origin = validCoords[0];
            const destination = validCoords[validCoords.length - 1];
            const opts = {
              waypoints: validCoords.slice(1, -1),
            };

            walking.search(origin, destination, opts, (status: string, result: any) => {
              if (status === "complete") {
                routeLayerRef.current = walking;
              } else {
                console.warn("Detail map pathfinding failed, fallback to straight line:", result);
                const polyline = new AMap.Polyline({
                  path: validCoords,
                  strokeColor: "#D2A053",
                  strokeOpacity: 0.8,
                  strokeWeight: 4,
                  strokeStyle: "dashed",
                });
                polyline.setMap(map);
                map.setFitView([polyline]);
                routeLayerRef.current = polyline;
              }
            });
          }
        });
      }).catch(err => {
        console.error("加载详情地图失败：", err);
      });
    };

    initDetailMap();

    return () => {
      aborted = true;
      if (timer) clearTimeout(timer);
      if (resizeObserver) {
        try { resizeObserver.disconnect(); } catch (_) {}
        resizeObserver = null;
      }
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.destroy(); } catch (_) {}
        mapInstanceRef.current = null;
      }
    };
  }, [loading, route]);

  if (loading) return <RouteDetailSkeleton />;
  if (!route) return (
    <div className="min-h-svh garden-bg flex items-center justify-center">
      <div className="text-center space-y-2">
        <p style={{ color: "#8F9F8F" }}>路线暂时无法加载</p>
        <Link href="/routes"><span className="text-sm" style={{ color: "#4F6F52" }}>返回路线列表</span></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-svh garden-bg">
      {/* Header */}
      <div className="flex items-center px-3 pb-3 sticky top-0 z-10"
        style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #E6E2D8", paddingTop: "calc(env(safe-area-inset-top, 44px) + 4px)" }}>
        <Link href="/routes">
          <motion.button whileTap={{ scale: 0.9 }} className="p-2 -ml-2 rounded-lg" style={{ color: "#3A4D39" }}>
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
        </Link>
        <h2 className="ml-2 font-bold text-[15px]" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
          {route.name}
        </h2>
      </div>

      {/* ── 真实高德路线地图 ── */}
      <div className="relative overflow-hidden" style={{ height: 280, minHeight: 280 }}>
        {/* 地图挂载 DOM - 明确宽高 + minHeight 兜底，避免移动端容器塌缩 */}
        <div
          ref={detailMapRef}
          className="w-full h-full bg-[#E8E4DA]"
          style={{ width: "100%", height: "100%", minHeight: 280 }}
        />
        
        {/* 地图上的雅致暗色浮层，保持 UI 统一 */}
        <div className="absolute inset-0 pointer-events-none" style={{
          boxShadow: "inset 0 12px 24px rgba(0,0,0,0.05), inset 0 -12px 24px rgba(0,0,0,0.05)",
          background: "linear-gradient(to bottom, rgba(232,228,218,0.1) 0%, transparent 10%, transparent 90%, rgba(232,228,218,0.1) 100%)"
        }} />
        
        {/* 图例 */}
        <div className="absolute bottom-3 left-3 flex items-center gap-3 px-3 py-1.5 rounded-xl z-10"
          style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(6px)", border: "1px solid rgba(232,228,218,0.8)" }}>
          {[{ color: "#4F6F52", label: "起点" }, { color: "#D2A053", label: "途经" }, { color: "#DC2626", label: "终点" }].map((item) => (
            <div key={item.label} className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
              <span className="text-[9px] font-medium" style={{ color: "#3A4D39" }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* 路线信息浮层 */}
        <div className="absolute top-3 right-3 px-3 py-2 rounded-xl z-10"
          style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(6px)", border: "1px solid rgba(232,228,218,0.8)" }}>
          <p className="text-[10px] font-bold" style={{ color: "#1E2522", fontFamily: "var(--font-noto-serif)" }}>
            {route.spots.length} 处景点
          </p>
          <p className="text-[9px]" style={{ color: "#8F9F8F" }}>{route.totalDistance}</p>
        </div>
      </div>

      {/* Route overview */}
      <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
          className="card-ink p-4 space-y-2">
          <p className="text-sm leading-relaxed" style={{ color: "#3A4D39" }}>{route.description}</p>
          <div className="flex items-center gap-4 pt-1">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" style={{ color: "#D2A053" }} />
              <span className="text-xs" style={{ color: "#8F9F8F" }}>{route.duration} 分钟</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" style={{ color: "#4F6F52" }} />
              <span className="text-xs" style={{ color: "#8F9F8F" }}>{route.totalDistance}</span>
            </div>
          </div>
          {((route.highlights as string[]) || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {((route.highlights as string[]) || []).map((h: string) => (
                <span key={h} className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(79,111,82,0.1)", color: "#4F6F52" }}>{h}</span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Steps */}
        <div className="space-y-3">
          {(route.spots || []).map((spot, i) => (
            <motion.div key={spot.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ ...SPRING, delay: i * 0.07 }}
              className="card-ink p-4 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-6 h-full opacity-10"
                style={{ background: i === 1 ? "#4F6F52" : "transparent" }} />
              <div className="flex justify-between items-start mb-2">
                <div>
                  {i === 1 && <p className="text-[10px] font-bold uppercase tracking-widest font-mono" style={{ color: "#D2A053" }}>重点景点</p>}
                  <h3 className="font-bold text-base mt-0.5" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>{spot.name}</h3>
                </div>
                <div className="w-8 h-8 rounded-lg text-white text-sm font-bold flex items-center justify-center flex-shrink-0"
                  style={{ background: i === 0 ? "#3A4D39" : i === route.spots.length - 1 ? "#8F9F8F" : "#D2A053" }}>
                  {i === 0 ? "起" : i === route.spots.length - 1 ? "终" : i + 1}
                </div>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "#8F9F8F" }}>{spot.description}</p>
              <div className="flex items-center gap-1 mt-2">
                <Clock className="w-3 h-3" style={{ color: "#8F9F8F" }} />
                <span className="text-[10px]" style={{ color: "#8F9F8F" }}>建议停留 {spot.duration} 分钟</span>
              </div>
              {i === 1 && (
                <Link href="/qa">
                  <motion.div whileTap={{ scale: 0.97 }}
                    className="mt-3 w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-[13px] font-semibold text-white"
                    style={{ background: "linear-gradient(135deg,#4F6F52,#3A5240)" }}>
                    <Camera className="w-4 h-4" /> 向导览官提问此景点
                  </motion.div>
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}

function RouteDetailSkeleton() {
  return (
    <div className="min-h-svh garden-bg">
      <div className="h-14 border-b" style={{ borderColor: "#E6E2D8", background: "white" }} />
      <div style={{ height: 240 }} className="skeleton" />
      <div className="px-4 py-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-ink p-4">
            <div className="skeleton h-4 w-2/3 mb-2" />
            <div className="skeleton h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
