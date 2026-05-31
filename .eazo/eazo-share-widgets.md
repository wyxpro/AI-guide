# 翠玉AI导览 · Share Widget Spec

## App Identity
- **App name**: 翠玉AI导览
- **Primary color**: `#4F6F52` (deep garden green)
- **Accent color**: `#D2A053` (warm gold)
- **Background**: `#FAF8F5` (cream parchment)
- **Font heading**: Noto Serif SC (elegant East Asian serif)
- **Visual identity**: Oriental garden aesthetics — bamboo, stone texture, ink wash motifs

## Share Scenarios

### 1. Route Completion Share
**Trigger**: User completes a scenic route

**Payload structure**:
```
今日在翠玉景区完成了「{route.name}」路线游览！
游览时长：{duration}分钟 | 足迹：{totalDistance}
途经：{spotNames.join('→')}
#翠玉景区 #AI导览 #文旅打卡
```

**Widget inner content** (300px × 400px inner frame):
- Top: App logo + "翠玉AI导览" heading in Noto Serif SC
- Center: Route name in large serif font over parchment (#FAF8F5) background
- Route timeline: gold dots connected by dashed green line, spot names alongside
- Stats row: duration chips in gold (#D2A053), distance in green (#4F6F52)
- Bottom: "翠玉景区 · AI智能导览" tagline in muted (#8F9F8F)

### 2. Knowledge Discovery Share
**Trigger**: User receives a meaningful QA answer about a specific scenic spot

**Payload structure**:
```
刚从翠玉AI导览官小玉处了解到：{key_insight}
——关于「{spot_name}」的{category}知识
#翠玉景区 #文化探秘 #历史故事
```

**Widget inner content**:
- Decorative ink-wash motif border (thin #E6E2D8 lines)
- Quote-style card: key insight text in Noto Serif SC
- Attribution: "AI导览官小玉 · 翠玉景区" in small muted text
- Spot image thumbnail if available

## Visual Style Notes
- Do NOT use blue or purple tones
- Subtle bamboo/garden SVG pattern as background texture (low opacity ~5%)
- Rounded corners: 16px on cards
- Warm, inviting tone — not corporate or tech-heavy
