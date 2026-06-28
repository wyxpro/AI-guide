# 🗺️ IPS — Issue & Problem Statement

## 移动端高德地图不显示问题分析与修复报告

---

> **文件**：`src/components/screens/RoutesScreen.tsx`  
> **报告时间**：2026-06-24  
> **严重等级**：🔴 高（核心功能缺失）  
> **影响范围**：移动端（`window.innerWidth < 768px`）行程规划页面 `/routes`

---

## 1. 问题现象（Symptoms）

| 端 | 地图状态 |
|:--|:--|
| 🖥️ 桌面端（`> 768px`） | ✅ 高德地图正常渲染，标记点和路线清晰可见 |
| 📱 移动端（`< 768px`） | ❌ 地图容器为纯灰色底板，地图瓦片从未加载 |

---

## 2. 根本原因（Root Cause Analysis）

### 2.1 `isMobile` 初始值错误 — SSR/CSR 不一致导致第一次渲染选错容器

```tsx
// ❌ 错误：初始值 false，客户端 useEffect 才修正为 true
const [isMobile, setIsMobile] = useState(false);
useEffect(() => {
  setIsMobile(window.innerWidth < 768); // 异步修正，但地图 Effect 已经跑完了
}, []);
```

完整时序（移动端 375px 浏览器）：

```
① useState(false)            → isMobile = false
② 渲染 → 桌面端 div 挂载   → desktopMapRef.current = 桌面div (0×0 hidden)
③ 地图 Effect 运行           → activeMapRef = desktopMapRef → AMapLoader.load() 开始
④ resize useEffect 运行      → setIsMobile(true) → 触发重渲染
⑤ 重渲染                    → 移动端 div 挂载，桌面端 div 卸载
                              desktopMapRef.current = null
⑥ 地图 Effect 清理 & 重跑   → 但 map.destroy() 可能没执行（见 2.2）
⑦ AMapLoader.load().then()  → 在 0×0 容器上 new AMap.Map() → LngLat(NaN, NaN) ❌
```

### 2.2 cleanup 只能销毁 `mapInstanceRef.current`，但该值要等 `complete` 事件才被赋值

```tsx
// ❌ 问题：如果 isMobile 在 complete 事件触发前就翻转，mapInstanceRef.current 仍为 null
map.on("complete", () => {
  mapInstanceRef.current = map; // ← 太晚了，cleanup 已经运行过了
});

return () => {
  if (mapInstanceRef.current) { // ← null → destroy 没执行！
    mapInstanceRef.current.destroy();
  }
};
```

结果：旧地图实例在卸载的桌面容器（clientWidth=0）上继续执行 `renderFrame`，
投影矩阵除零 → `LngLat(NaN, NaN)` 崩溃。

### 2.3 单 `ref` 绑定两个 DOM 节点（上一轮已修复，保留说明）

```tsx
// ❌ 同一 mapRef 被绑定到两处 div，React 只能指向最后挂载的那个
<div ref={mapRef} .../>  // mobile
<div ref={mapRef} .../>  // desktop
```

---

## 3. 修复方案（Fix）

### 3.1 拆分 ref：为移动端和桌面端分别创建独立 ref

```tsx
// ✅ 正确设计：两个布局各用各自的 ref
const mobileMapRef = useRef<HTMLDivElement>(null);   // 移动端地图容器
const desktopMapRef = useRef<HTMLDivElement>(null);  // 桌面端地图容器

// 根据当前布局动态派生活跃 ref
const activeMapRef = isMobile ? mobileMapRef : desktopMapRef;
```

### 3.2 JSX：两个容器挂载各自的 ref

```tsx
// 移动端（line 551）
<div ref={mobileMapRef} className="absolute inset-0 z-0 bg-neutral-200" />

// 桌面端（line 1059）
<div ref={desktopMapRef} className="w-full h-full" />
```

### 3.3 地图初始化 Effect：使用 `activeMapRef`

```tsx
// Derive the active map container ref based on current layout
const activeMapRef = isMobile ? mobileMapRef : desktopMapRef;

useEffect(() => {
  if (typeof window === "undefined") return;

  // ✅ 切换布局时先销毁旧地图实例
  if (mapInstanceRef.current) {
    mapInstanceRef.current.destroy();
    mapInstanceRef.current = null;
    setAmapLoaded(false);
  }

  const initMap = () => {
    const container = activeMapRef.current; // ← 永远是正确的容器
    if (!container) return;
    if (container.clientWidth === 0 || container.clientHeight === 0) {
      setTimeout(initMap, 50);
      return;
    }

    AMapLoader.load({ ... }).then((AMap) => {
      // ✅ 校验仍然针对正确 ref
      if (!activeMapRef.current || container !== activeMapRef.current) return;
      ...
    });
  };

  initMap();
  return () => { /* cleanup */ };
}, [isMobile]); // ← isMobile 变化时重新初始化正确端的地图
```

### 3.4 修复前后对比

| 场景 | 修复前 | 修复后 |
|:--|:--|:--|
| 桌面端初次加载 | ✅ 正常 | ✅ 正常 |
| 移动端初次加载 | ❌ 灰色底板，无地图 | ✅ 地图正常渲染 |
| 窗口宽度动态变化 | ❌ 无法切换地图实例 | ✅ 销毁旧实例 → 重新在正确容器初始化 |
| `LngLat(NaN, NaN)` 崩溃 | ❌ 频繁出现 | ✅ 已消除（0×0 容器防护） |

---

## 4. 关联问题（Related Issues）

### 4.1 `LngLat(NaN, NaN)` — AMap 内部渲染崩溃

**原因**：AMap 2.0 在 3D 模式下，若地图挂载到 `clientWidth=0` 的容器，GPU 渲染管线进行投影矩阵计算时会产生除零/无穷大，导致所有坐标变为 `NaN`。

**已有防护**：
```tsx
if (container.clientWidth === 0 || container.clientHeight === 0) {
  timer = setTimeout(initMap, 50); // 延迟重试直到容器有实际尺寸
  return;
}
```

### 4.2 Service Worker `Response body is already used`

**原因**：`sw.js` 中的缓存写入在异步 Promise 链里调用 `res.clone()`，此时外层已消费了响应体。

**修复**：在 `.then()` 回调第一行同步创建克隆体。

```js
// ✅ 正确：同步克隆，再异步缓存
fetch(request).then((res) => {
  if (res.ok) {
    const resClone = res.clone(); // 立即克隆
    caches.open(CACHE_NAME).then((c) => c.put(request, resClone));
  }
  return res;
})
```

### 4.3 数据库景点坐标全为 `{lat:0, lng:0}`

**原因**：`seed.ts` 中插入景点时未设置 `location` 字段，Drizzle schema 默认为 `{ lat: 0, lng: 0 }`。

**修复**：为所有 6 个景点注入了真实重庆坐标，并在种子脚本头部加入 `db.delete()` 清理旧记录后重新插入。

### 4.4 Next.js SSR 500 错误（`window is not defined`）

**原因**：`@amap/amap-jsapi-loader` 包在模块求值期包含 `if(!window) throw Error(...)` 判断，在 Node.js 环境中直接崩溃。

**修复**：将 `/routes/page.tsx` 和 `/routes/[id]/page.tsx` 转为 `"use client"` 并使用 `next/dynamic` 的 `{ ssr: false }` 懒加载地图组件，使其仅在浏览器中执行。

---

## 5. 其他错误记录

| 错误 | 原因 | 状态 |
|:--|:--|:--|
| `GET /routes 500` | `window is not defined` in Node SSR | ✅ 已修复 |
| `LngLat(NaN, NaN)` | 地图挂载到 0×0 容器 | ✅ 已修复 |
| `Response body is already used` | sw.js 异步 clone 竞态 | ✅ 已修复 |
| `icon-192.png 404` | 缺少 PWA 图标文件 | ✅ 已修复 |
| 水合不匹配警告 | `isMobile` SSR 默认 `false` vs 客户端实际值 | ⚠️ 预期行为，无破坏性影响 |

---

## 6. 建议（Recommendations）

1. **消除水合不匹配**：将 `isMobile` 的初始值改为 `null`，并在 `null` 时渲染统一的占位符，完全避免 SSR/CSR diff。

   ```tsx
   const [isMobile, setIsMobile] = useState<boolean | null>(null);
   if (isMobile === null) return <MapLoadingPlaceholder />;
   ```

2. **地图实例复用**：如果布局频繁切换，考虑用 `resize` 而非 `destroy/recreate` 来调整地图尺寸。

   ```tsx
   mapInstanceRef.current?.resize();
   ```

3. **加入 `NEXT_PUBLIC_AMAP_KEY` 非空校验**：在 `AMapLoader.load()` 前提前检测 key 是否缺失并显示友好提示，而不是让高德 API 返回鉴权错误。

---

*最后更新：2026-06-24 | 修复作者：Antigravity AI*
