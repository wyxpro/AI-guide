# 🗺️ 高德地图 API 接入行程规划系统集成方案 (Implementation Plan)

本方案旨在指导如何将现有的 **旅行家Pro** 行程规划系统（`RoutesScreen` 和 `RouteDetailScreen`）中的静态 SVG 和 Leaflet 开源地图替换为**真实的高德地图 API (Amap JS API v2.0)**。接入高德地图后，系统将获得真实路网路径规划（步行/驾车导航）、高精度POI检索、精细化地图样式和国内更稳定的LBS定位体验。

---

## 🧭 准备工作：高德开放平台配置

在开发前，必须申请高德地图开发者凭证，这是调用 JS API 的基础。

### 1. 注册并获取 Key 和安全密钥 (jsCode)
1. 访问 [高德开放平台官网](https://lbs.amap.com/) 并注册/登录开发者账号。
2. 进入控制台 -> **应用管理** -> **我的应用**。
3. 点击 **创建新应用**，填入应用名称和类型。
4. 在新创建的应用下点击 **添加Key**：
   * **Key名称**：例如 `TravelerPro-Web`
   * **服务平台**：选择 **Web端 (JS API)**
   * **域名限制**：本地测试可不填，生产环境下建议限制为您的域名。
5. 提交后，您将获得：
   * **Key (Client Key)**: 用于前端调用鉴权。
   * **安全密钥 (Security JS Code)**: 自 2021 年 12 月起，高德要求必须配置安全密钥，否则无法正常加载地图服务。

---

## 🛠️ 第一步：环境配置与依赖安装

### 1. 配置环境变量
在项目根目录的 `.env` 或 `.env.local` 文件中添加高德地图配置：

```env
# 高德地图 API 配置
NEXT_PUBLIC_AMAP_KEY=你的高德地图APIKey
NEXT_PUBLIC_AMAP_SECURITY_CODE=你的高德地图安全密钥
```

### 2. 安装官方 JS API Loader
官方推荐使用 `@amap/amap-jsapi-loader` 动态加载器，它能有效解决 React/Next.js 等单页应用中脚本重复加载和并发冲突问题。

在终端运行以下命令进行安装：
```bash
bun add @amap/amap-jsapi-loader
```

---

## 📦 第二步：编写地图底层初始化配置

在 Next.js (React) 中使用高德地图，我们需要在脚本加载前将安全密钥写入 `window._AMapSecurityConfig`。

我们可以在 `src/lib/` 或直接在组件中进行全局定义。为了确保在 Next.js 的 SSR (服务端渲染) 环境中不报错，我们必须且只能在**客户端 (浏览器端)**执行此操作。

```typescript
// 确保该代码块仅在客户端执行
if (typeof window !== "undefined") {
  (window as any)._AMapSecurityConfig = {
    securityJsCode: process.env.NEXT_PUBLIC_AMAP_SECURITY_CODE,
  };
}
```

---

## 🚀 第三步：重构 `RoutesScreen.tsx` (景区路线概览与生成)

### 1. 核心技术差异点对比与避坑指南

> [!CAUTION]
> **坐标顺序反转（极其重要）**
> * **Leaflet / Leaflet.js** 的坐标数组格式为：`[纬度 lat, 经度 lng]`，例如 `[29.563, 106.578]`。
> * **高德地图 (AMap)** 的坐标数组格式为：`[经度 lng, 纬度 lat]`，例如 `[106.578, 29.563]`。
> * **必须**在将景点数据传递给高德 API 时，颠倒坐标顺序，否则地图会定位至索马里海域！

### 2. 代码重构实现

我们将修改 `src/components/screens/RoutesScreen.tsx`，将 Leaflet 替换为 `AMapLoader`。

#### A. 引入依赖
替换原有的 Leaflet CDN 注入逻辑，改用官方 Loader。

```diff
-  const [leafletLoaded, setLeafletLoaded] = useState(false);
-
-  // Load Leaflet map script and stylesheet dynamically
-  useEffect(() => {
-    if (typeof window === "undefined") return;
-    if ((window as any).L) {
-      setLeafletLoaded(true);
-      return;
-    }
-    const link = document.createElement("link");
-    link.rel = "stylesheet";
-    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
-    document.head.appendChild(link);
-
-    const script = document.createElement("script");
-    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
-    script.onload = () => {
-      setLeafletLoaded(true);
-    };
-    document.body.appendChild(script);
-  }, []);
```

替换为：

```typescript
import AMapLoader from "@amap/amap-jsapi-loader";

// 在组件外部或内部头部配置安全密钥
if (typeof window !== "undefined") {
  (window as any)._AMapSecurityConfig = {
    securityJsCode: process.env.NEXT_PUBLIC_AMAP_SECURITY_CODE || "",
  };
}
```

#### B. 初始化高德地图实例
修改组件中的地图初始化 `useEffect`：

```typescript
  const [amapLoaded, setAmapLoaded] = useState(false);
  const AMapInstanceRef = useRef<any>(null); // 存储 AMap 命名空间对象

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    AMapLoader.load({
      key: process.env.NEXT_PUBLIC_AMAP_KEY || "", // 申请好的Key
      version: "2.0", // 指定要加载的 JSAPI 的版本
      plugins: ["AMap.Walking", "AMap.Driving", "AMap.Polyline"], // 需要使用的插件
    })
      .then((AMap) => {
        AMapInstanceRef.current = AMap;
        setAmapLoaded(true);

        // 初始化地图对象
        const map = new AMap.Map(mapRef.current, {
          viewMode: "3D", // 开启3D视图，更加立体 premium
          zoom: 14, // 初始化地图级别
          center: [106.578, 29.563], // 重庆洪崖洞中心点 [lng, lat]
          theme: "amap://styles/whitesmoke", // 浅色雅致主题，匹配项目巴渝新中式色调
          zoomEnable: true,
          dragEnable: true,
        });

        mapInstanceRef.current = map;

        // 渲染高德地图点标记
        renderAmapMarkers(AMap, map, CHONGQING_SPOTS);
      })
      .catch((e) => {
        console.error("高德地图加载失败:", e);
        toast.error("地图加载失败，请检查网络或配置");
      });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [isMobile]);
```

#### C. 重构标记点绘制 (`renderMarkers` 替换为高德写法)
高德地图的自定义标记通过 `AMap.Marker` 的 `content` 属性直接支持 HTML 字符串或 DOM 节点，这比 Leaflet 的 `L.divIcon` 更加简单和可定制。

```typescript
  const renderAmapMarkers = (AMap: any, map: any, spotsList: typeof CHONGQING_SPOTS) => {
    // 清理旧标记
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    spotsList.forEach((s) => {
      // 匹配类别的主题颜色
      const themeColor =
        s.type === "地标" ? "#EF4444" :
        s.type === "演出" ? "#F59E0B" :
        s.type === "寺庙" ? "#8B5CF6" :
        s.type === "文化" ? "#3B82F6" :
        s.type === "自然" ? "#10B981" : "#FF5B45";

      // 组装 Marker DOM 内容
      const markerContent = `
        <div class="flex flex-col items-center select-none cursor-pointer">
          <div class="px-2 py-1 bg-white/95 border border-zinc-200 shadow-md rounded-md text-[10px] font-bold text-zinc-800 whitespace-nowrap -translate-y-1" 
               style="border-top: 3px solid ${themeColor};">
            ${s.name}
          </div>
          <div class="w-3.5 h-3.5 rounded-full bg-white border-2 flex items-center justify-center shadow-md -translate-y-1" 
               style="border-color: ${themeColor};">
            <div class="w-1.5 h-1.5 rounded-full" style="background-color: ${themeColor};"></div>
          </div>
        </div>
      `;

      // 实例化高德 Marker
      const marker = new AMap.Marker({
        position: [s.lng, s.lat], // 注意高德是 [lng, lat]
        content: markerContent,
        offset: new AMap.Pixel(-40, -40), // 调整偏移量使标点居中对齐
      });

      // 绑定点击事件
      marker.on("click", () => {
        setActiveSpot(s);
        map.setZoomAndCenter(15, [s.lng, s.lat], false, 300); // 平滑平移至该点
        if (autoplayEnabled) {
          speakSpotNarration(s.name, s.desc);
        }
      });

      marker.setMap(map);
      markersRef.current.push(marker);
    });
  };
```

#### D. 重构路线绘制与真实路径规划 (升级为真实路网规划)
原来在 Leaflet 中，折线是以虚线直线连接各个景点。高德地图提供了 `AMap.Walking` 或 `AMap.Driving` 插件，能获取**真实人行步道/车道的导航线路**。

```typescript
  // 监听 activeRoute 变化，绘制真实路线
  useEffect(() => {
    const AMap = AMapInstanceRef.current;
    const map = mapInstanceRef.current;
    if (!AMap || !map || !activeRoute) return;

    // 1. 清理旧的折线与导航图层
    if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null);
      routePolylineRef.current = null;
    }

    // 2. 匹配出当前线路中所有景点的经纬度列表 [lng, lat]
    const coordinates = activeRoute.spots
      .map((s) => {
        const original = CHONGQING_SPOTS.find((orig) => orig.id === s.id);
        return original ? [original.lng, original.lat] : null;
      })
      .filter(Boolean) as Array<[number, number]>;

    if (coordinates.length < 2) return;

    // 3. 使用高德步行路线规划插件 AMap.Walking 绘制贴合道路的路线
    const walking = new AMap.Walking({
      map: map,
      panel: undefined, // 不需要右侧文字导航面板
      hideMarkers: true, // 隐藏高德默认的起终点 Pin，保持我们精致的自定义 Pin
      autoFitView: true, // 自动缩放地图适应整条线路
    });

    // 串联多点导航（高德步行最多支持一个起点、一个终点和多个途经点）
    const origin = coordinates[0];
    const destination = coordinates[coordinates.length - 1];
    const opts = {
      waypoints: coordinates.slice(1, -1),
    };

    walking.search(origin, destination, opts, (status: string, result: any) => {
      if (status === "complete") {
        // 保存规划图层实例，便于后续销毁
        routePolylineRef.current = walking;
        toast.success(`路线绘制成功！共规划了 ${coordinates.length} 个景点`);
      } else {
        console.warn("高德步行规划失败，降级为折线连接:", result);
        
        // 降级方案：直接使用折线连接 (直线)
        const polyline = new AMap.Polyline({
          path: coordinates,
          strokeColor: "#FF5B45",
          strokeOpacity: 0.85,
          strokeWeight: 6,
          strokeStyle: "dashed",
          strokeDasharray: [10, 10],
        });
        polyline.setMap(map);
        map.setFitView([polyline]);
        routePolylineRef.current = polyline;
      }
    });

    return () => {
      if (routePolylineRef.current) {
        // 清除导航图层
        if (typeof routePolylineRef.current.clear === "function") {
          routePolylineRef.current.clear();
        } else {
          routePolylineRef.current.setMap(null);
        }
        routePolylineRef.current = null;
      }
    };
  }, [activeRoute, amapLoaded]);
```

---

## 🎨 第四步：重构 `RouteDetailScreen.tsx` (详情页精细地图)

在 `RouteDetailScreen.tsx` 中，地图目前使用的是静态 SVG 绘制的伪地图（线条 and 波浪线）。我们将这里升级为**真实的微缩高德地图**，实现交互感和真实性。

### 1. 替换 SVG 地图区为 DOM 地图容器

```diff
-      {/* ── 精美路线地图 ── */}
-      <div className="relative overflow-hidden" style={{ height: 260, background: "linear-gradient(135deg, #E8E4DA, #DDD8CC)" }}>
-        {/* 地形纹理背景 */}
-        ...
-        {/* 动画路径 + 景点 Pin */}
-        ...
-      </div>
```

替换为高德地图容器：

```tsx
      {/* ── 真实高德路线地图 ── */}
      <div className="relative overflow-hidden" style={{ height: 280 }}>
        {/* 地图挂载 DOM */}
        <div id="detail-map-container" className="w-full h-full bg-[#E8E4DA]" />
        
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
```

### 2. 编写高德地图渲染逻辑

在 `RouteDetailScreen` 中添加 `useEffect`，以挂载并初始化高德地图，并利用真实坐标绘制沿路轨迹和带序号的数字标点。

> [!TIP]
> 这里的景点数据来自于接口 `/api/routes/${routeId}`。我们需要在返回的景点中增加 `lng` 和 `lat` 坐标数据支持。

```typescript
  const mapInstanceRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);

  useEffect(() => {
    if (loading || !route || !route.spots || route.spots.length === 0) return;

    let map: any = null;

    AMapLoader.load({
      key: process.env.NEXT_PUBLIC_AMAP_KEY || "",
      version: "2.0",
      plugins: ["AMap.Walking", "AMap.Polyline"],
    }).then((AMap) => {
      // 1. 初始化微型地图
      map = new AMap.Map("detail-map-container", {
        viewMode: "3D",
        zoom: 14,
        theme: "amap://styles/whitesmoke", // 保持古朴雅致格调
        zoomEnable: false, // 详情小图禁用缩放，仅用作展示
        dragEnable: true,
      });
      mapInstanceRef.current = map;

      // 2. 将景点转换为高德坐标数组（[lng, lat]）
      // 注意：后端数据库内必须保存真实的经纬度
      const coordinates = route.spots.map((spot: any) => {
        // 如果 spot 里已有经纬度直接使用，否则可配置静态映射
        return [spot.lng || 106.578, spot.lat || 29.563];
      });

      // 3. 绘制自定义标点 (起、途、终)
      route.spots.forEach((spot: any, i: number) => {
        const isStart = i === 0;
        const isEnd = i === route.spots.length - 1;
        const spotColor = isStart ? "#4F6F52" : isEnd ? "#DC2626" : "#D2A053";

        const markerContent = `
          <div class="flex flex-col items-center">
            <!-- 气泡文字 -->
            <div class="px-2 py-0.5 bg-white/95 border border-zinc-200 shadow-sm rounded text-[9px] font-bold text-zinc-800 whitespace-nowrap -translate-y-1">
              ${spot.name}
            </div>
            <!-- 中心圆点 -->
            <div class="w-5 h-5 rounded-full bg-white border-2 flex items-center justify-center shadow-md -translate-y-1" 
                 style="border-color: ${spotColor};">
              <span class="text-[9px] font-bold" style="color: ${spotColor};">${isStart ? "起" : isEnd ? "终" : i + 1}</span>
            </div>
          </div>
        `;

        const marker = new AMap.Marker({
          position: coordinates[i],
          content: markerContent,
          offset: new AMap.Pixel(-30, -35),
        });
        marker.setMap(map);
      });

      // 4. 真实道路导航连线
      const walking = new AMap.Walking({
        map: map,
        hideMarkers: true,
        autoFitView: true,
      });

      const origin = coordinates[0];
      const destination = coordinates[coordinates.length - 1];
      const opts = {
        waypoints: coordinates.slice(1, -1),
      };

      walking.search(origin, destination, opts, (status: string, result: any) => {
        if (status === "complete") {
          routeLayerRef.current = walking;
        } else {
          // 降级为直连折线
          const polyline = new AMap.Polyline({
            path: coordinates,
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
    }).catch(err => {
      console.error("加载详情地图失败：", err);
    });

    return () => {
      if (map) {
        map.destroy();
      }
    };
  }, [loading, route]);
```

---

## 📝 第五步：测试与上线验证清单

高德地图 JS API 在不同环境下有一定限制，发布前请检查以下事项：

### 1. 本地调试 (Localhost)
* 访问 `http://localhost:3000` 时，高德地图可以无视 HTTPS 限制正常工作。
* 确保控制台没有报 `USERKEY_PLAT_NOMATCH` (Key与平台类型不匹配，请检查是否误申请成了“Web服务”或“Android SDK”，必须为 **Web端 (JS API)**)。
* 确保没有报 `INVALID_USER_SCODE` (安全密钥未配置，请确认 `window._AMapSecurityConfig` 是否正确赋值并早于 `AMapLoader.load` 执行)。

### 2. 生产环境部署 (Production)
* **开启 HTTPS**：线上必须通过 HTTPS 协议访问，否则浏览器将拒绝授予高德定位 API 所需的地理位置权限 (`Geolocation.getCurrentPosition`)。
* **白名单绑定**：为了防盗刷，建议在高德控制台的 Key配置中，绑定您线上项目的 IP 或域名白名单。
* **移动端 WebView 适配**：如果在 Capacitor/Cordova 转换打包的移动 App 中打开，需要在 `AndroidManifest.xml` 中配置 `<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />` 权限。
