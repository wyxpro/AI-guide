# 🤖 旅行家Pro · 景区AI数字人导游与运营系统平台
![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?style=flat-square&logo=drizzle)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-BB4BFF?style=flat-square&logo=framer)
![Eazo SDK](https://img.shields.io/badge/Eazo_SDK-0.19-FF7A5A?style=flat-square)
![DeepSeek](https://img.shields.io/badge/DeepSeek-v3.1-00B4D8?style=flat-square)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=flat-square&logo=vercel)
![Bun](https://img.shields.io/badge/Bun-1.3-FBF0DF?style=flat-square&logo=bun)
![MCP](https://img.shields.io/badge/MCP-Protocol-7C3AED?style=flat-square)

## 📋 项目简介

**旅行家Pro** 是一款针对现代智慧景区深度定制开发的**智能导游与数字化管理系统**。项目有机融合了移动定位服务 (LBS)、大型语言模型 (LLM)、流式音频渲染 (TTS) 与视觉多模态分析技术，为游客提供极具沉浸感、定制化的一站式游览伴随服务，同时赋予景区运营方强大的数据洞察与运营调优能力。

*   **🙋 游客端 (C端)**：以 7×24 小时在线的 **AI 数字人**为交互核心，支持快速语音交互精讲。特色功能包括：基于大模型偏好的**智能行程一键规划**、真实重庆高精地图导航渲染、**VR拍照即拍即识文物解读**、足迹勋章打卡，以及适配老年（无障碍字号与路线）和儿童（童趣配音与故事性引导）的专属定制偏好模式。
*   **📊 管理端 (B端)**：提供实时的**景区运行仪表盘**（今日客流量、满意度指标、提问聚合与情感倾向词云分析等），支持动态配置数字人声音音色/性别形象、RAG 向量知识库文档管理，以及景区景点属性的快速录入维护。

## ✨亮点功能

### 🤖 AI 数字人导览（核心交互中枢）
系统搭载 7×24 小时在线的 AI 数字人"小玉"（可切换男/女声音音色），支持多轮对话式智能讲解。通过先进的流式 TTS（Text-to-Speech）与 STT（Speech-to-Text）技术，实现语音对话的无缝收听与输出。支持根据用户偏好（如"讲解详细"、"通俗易懂"、"风趣幽默"等）调整回复风格，实现千人千面的个性化导览体验。
### 🎨 数字人形象配置（AI 形象自定义）
提供数字人形象与声音配置管理功能。管理员可选择**数字人的性别**、**声音音色**、**语音语速**等参数，调整 AI 的交互风格。通过后台管理，实现数字人形象的动态配置与实时生效。
### 🎯 知识库与内容管理（RAG 知识库）
管理员可在后台上传景区的介绍文档、历史资料等（支持 PDF/Word 格式），系统自动进行**分块与向量化**。在AI回答时，系统自动从向量库中检索相关片段进行参考，确保答案的专业性与权威性。支持文档的在线浏览、编辑与删除。
### 🏛️ VR 即拍即识（多模态智能识别）
集成 DeepSeek-VL（视觉大模型）能力，游客可拍摄任意展品或建筑照片，系统在 1 秒内返回详细的**文化脉络解读**、历史渊源介绍，并提供避坑指南等实用信息。该功能利用 AI 工具调用（Tool Calling）机制，结合多源 RAG（Retrieval-Augmented Generation）知识库检索，确保解析结果的专业性与准确性。
### 🗺️ 智能行程规划（AI 行程规划助手）
基于大语言模型（LLM）的偏好分析与多点位路线优化算法（基于 `@turf/turf` 空间计算库），系统可根据游客的兴趣、体力水平、时间预算等个性化偏好，自动生成**多条备选游览路线**。每条路线均包含详细的导航路径、站点推荐及预计游览时间，支持在真实重庆高精地图上进行直观的折线（Polyline）轨迹渲染与路径导航。
### 💰 智能票务服务（模拟交易系统）
内建完整的门票预订与销售管理模块，支持配置不同票种（成人票、学生票、亲子票等）及价格策略。游客可在线选择日期、购票数量，系统模拟生成订单并进行支付管理。通过后台数据分析，实时掌握**实时售票情况**及销售
### 🔄 路线实时更新（动态路线调整）
支持游览过程中动态调整路线，系统可根据当前位置（LBS）与用户需求（如"我想去人少的地方"、"带我去看非遗展示"），实时重构最优导航路径，并自动计算增减距离与时间，确保行程始终高效顺畅。
### 📊 景区运营仪表盘（数据驱动运营决策）
提供实时的B端数据监控大屏，展示**今日客流量**、**实时满意度指标**、**热门景点排行榜**、**AI 问题高频词云**等关键运营数据。通过智能分析，管理者可快速洞察游客行为特征与需求热点，为景区运营决策提供有力的数据支持。
### 💬 交互气泡与内嵌式加载（单气泡响应体验）
在数字人问答界面，AI回复气泡采用了“单气泡渐进加载与流式打字”的深度交互融合。提问发送后仅生成唯一的回复气泡，在等待期间内嵌 bouncing 弹跳动画，数据到达后无缝切换成打字机文本流输出，避免生成多余的空载/等待气泡。同时配合毫秒级自动滚动对齐，提供极其丝滑的沉浸式对话体验。
### 📐 三列独立弹性排版系统（B端自适应）
对数字人配置管理页面（`AdminAvatarScreen`）进行了界面重构，将定位架构从 CSS Grid 迁移至 Flex 弹性轴线排版 (`flex flex-col lg:flex-row gap-6 items-start`)，并利用高权重 CSS 规则对各列进行宽度保护：左侧 Preset List 固定 `280px` 以防长文本挤压折行；右侧 Preview 固定 `360px` 保持预览框合理占比；中间 Column 自适应拉伸。

---

## 🛠️ 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **框架** | Next.js 16.2 (App Router) | 全栈 SSR/SSG + API Routes |
| **UI 库** | React 19 + Framer Motion 12 | 流畅动画与微交互 |
| **样式** | Tailwind CSS v4 + 自定义 CSS | 双端主题（暖米白/深绿暗色） |
| **组件** | ShadCN UI + Base UI React | 可访问性友好的基础组件 |
| **图标** | Lucide React 1.8 | 统一图标系统 |
| **ORM** | Drizzle ORM 0.45 | 类型安全数据库操作 |
| **数据库** | PostgreSQL 16 | 主数据库，托管于 Eazo 平台 |
| **AI 引擎** | Eazo SDK + DeepSeek v3.1 | 对话、TTS、STT、图像识别 |
| **向量检索** | 余弦相似度 + 关键词混合重排 | 自建 RAG 知识库检索 |
| **协议** | MCP (Model Context Protocol) | AI 工具调用标准协议 |
| **包管理** | Bun 1.3.9 | 极速依赖安装与运行 |
| **部署** | Vercel | 一键部署，定时 Cron 任务 |
| **地图** | @turf/turf | 空间计算（行程距离规划） |

---

## 📁 目录结构

```
AI-guide/
├── src/
│   ├── app/                        # Next.js App Router 页面
│   │   ├── page.tsx                # 欢迎/落地页（47KB 大型组件）
│   │   ├── layout.tsx              # 根布局（EazoProvider + 字体注入）
│   │   ├── globals.css             # 全局样式与 CSS 变量
│   │   ├── home/                   # 🏠 C端首页
│   │   ├── spots/                  # 📍 热门景点列表与详情
│   │   ├── qa/                     # 🤖 AI数字人导览对话
│   │   ├── routes/                 # 🗺️ 行程规划列表与详情
│   │   ├── profile/                # 👤 用户个人中心
│   │   ├── search/                 # 🔍 全局搜索
│   │   ├── vr-recognize/           # 📷 VR即拍即识导览
│   │   ├── fm/                     # 🎵 景区FM语音广播
│   │   ├── welcome/                # 🎉 引导欢迎页
│   │   ├── login/                  # 🔐 登录页
│   │   ├── ai-settings/            # ⚙️ AI偏好设置
│   │   └── admin/                  # 🖥️ B端管理后台
│   │       ├── page.tsx            # 数据大屏总览
│   │       ├── knowledge/          # 知识库管理
│   │       ├── spots/              # 景点管理
│   │       ├── avatar/             # 数字人配置
│   │       └── analytics/          # 数据分析
│   │
│   ├── app/api/                    # API 路由层
│   │   ├── qa/
│   │   │   ├── chat/               # POST/GET 对话（RAG+流式）
│   │   │   ├── tts/                # 文字转语音
│   │   │   ├── stt/                # 语音转文字
│   │   │   ├── sessions/           # 会话管理
│   │   │   ├── feedback/           # 对话反馈
│   │   │   └── avatar-active/      # 数字人激活
│   │   ├── spots/
│   │   │   ├── route.ts            # 景点列表（含全国热门景点）
│   │   │   ├── [id]/               # 景点详情
│   │   │   └── recognize/          # 图像识别接口
│   │   ├── routes/                 # 行程路线 CRUD
│   │   ├── search/                 # 全局模糊搜索
│   │   ├── user/                   # 用户信息与偏好
│   │   ├── notifications/
│   │   │   └── cron/daily-digest/  # Vercel Cron 每日推送
│   │   ├── admin/                  # 管理端接口
│   │   └── mcp/                    # MCP 协议入口
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── LayoutShell.tsx     # 双端布局外壳（C端/B端自适应）
│   │   │   └── Navigation.tsx      # 底部TabBar + PC侧边栏
│   │   ├── screens/                # 核心业务屏幕组件（17个）
│   │   │   ├── HomeScreen.tsx      # 首页（34KB）
│   │   │   ├── QAScreen.tsx        # AI对话屏幕（49KB）
│   │   │   ├── RoutesScreen.tsx    # 行程规划（58KB）
│   │   │   ├── ProfileScreen.tsx   # 个人中心（62KB）
│   │   │   ├── SpotsScreen.tsx     # 景点列表
│   │   │   ├── SpotDetailScreen.tsx# 景点详情（29KB）
│   │   │   ├── AdminDashboard.tsx  # 管理大屏（12KB）
│   │   │   ├── AdminKnowledgeScreen.tsx # 知识库管理
│   │   │   ├── AdminSpotsScreen.tsx     # 景点CRUD（24KB）
│   │   │   ├── AdminAnalyticsScreen.tsx # 数据分析（25KB）
│   │   │   ├── AdminAvatarScreen.tsx    # 数字人配置
│   │   │   ├── FMScreen.tsx        # FM广播（21KB）
│   │   │   └── SearchScreen.tsx    # 全局搜索页
│   │   ├── ui/                     # 基础UI组件（GlobalSearch等）
│   │   ├── notifications/          # 通知组件
│   │   └── user-profile/           # 用户资料组件
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── client.ts           # Drizzle 数据库连接
│   │   │   ├── migrate.ts          # 迁移执行脚本
│   │   │   ├── schema/             # 数据库表定义
│   │   │   │   ├── admin.ts        # 知识库/数字人/分析/QA日志
│   │   │   │   ├── spots.ts        # 景点表
│   │   │   │   ├── routes.ts       # 行程路线表
│   │   │   │   ├── user-data.ts    # 会话/收藏/偏好/优惠券
│   │   │   │   └── users.ts        # 用户表
│   │   │   ├── queries/            # 数据查询封装
│   │   │   └── migrations/         # 自动生成的迁移 SQL
│   │   ├── auth/                   # JWT 认证（Eazo SDK）
│   │   ├── api/
│   │   │   ├── rate-limit.ts       # IP 频率限制
│   │   │   └── embedding.ts        # 向量嵌入 + 余弦相似度
│   │   ├── mcp/
│   │   │   ├── server.ts           # MCP 服务器实例
│   │   │   └── tools/              # 7个 MCP 工具定义
│   │   └── data/
│   │       └── national-spots.ts   # 全国热门景点静态数据
│   │
│   ├── utils/                      # 通用工具函数
│   └── instrumentation.ts          # Next.js 运行时环境注入
│
├── public/                         # 静态资源
├── scripts/                        # 辅助脚本（SDK同步、清理）
├── doc/                            # 项目文档
├── run.ps1                         # Windows 一键启动脚本
├── drizzle.config.ts               # Drizzle ORM 配置
├── vercel.json                     # Vercel 部署 + Cron 配置
├── next.config.ts                  # Next.js 配置
├── package.json                    # 依赖声明（packageManager: bun）
└── seed.ts                         # 数据库种子数据
```

---

## ⚡ 核心功能模块和工作流程

### 🤖 1. AI 数字人导览（RAG 问答引擎）

**工作流程：**
```
用户提问
  → IP 频率限制检查（rate-limit）
  → 软鉴权（允许游客匿名使用）
  → 读取用户偏好（普通 / 老年 / 儿童 模式）
  → 查询知识库向量 → 余弦相似度计算
  → 混合重排（0.7×语义 + 0.3×关键词）
  → Top-3 相关文档注入 System Prompt
  → 调用 DeepSeek v3.1（支持流式 SSE）
  → 情感标注解析（愉快/平静/伤感/思考）
  → 异步写入 QA 日志 + 每日分析统计
```

**三种无障碍模式：**
| 模式 | 目标人群 | 回复风格 |
|------|---------|---------|
| `normal` | 普通游客 | 温暖知识型，引用典故，≤200字 |
| `elder` | 老年游客 | 慢速温和，简洁易懂，无障碍路线优先，≤150字 |
| `child` | 儿童游客 | 活泼有趣，故事化讲解，≤100字 |

---

### 🗺️ 2. 智能行程规划

- 支持按兴趣标签筛选（历史 / 自然 / 文化 / 家庭）
- 路线含景点列表、距离、时长、难度级别
- 结合 `@turf/turf` 进行空间距离计算
- 支持收藏、访问记录保存

---

### 📷 3. VR 即拍即识导览

**流程：**
```
上传图片 / 选择预设珍玩
  → 模拟 LIDAR 3D 拓扑扫描动画（4步进度）
  → 调用 /api/spots/recognize（多模态视觉识别）
  → 展示：文物名称 + 深度文化史料 + 游览建议
  → 触发 TTS 生成语音（小玉语音讲解）
  → 频谱波形动画展示播放状态
```

内置 4 个高质量预设（三星堆青铜神树、唐代彩绘陶俑、洪崖洞吊脚楼、武侯祠红墙竹影）

---

### 🎵 4. 景区 FM 语音广播

FMScreen 组件实现播客式文化广播，集成 Eazo TTS 引擎，用户可收听景区故事和文化讲解。

---

### 🖥️ 5. B端运营管理后台

| 模块 | 功能 |
|------|------|
| **数据大屏** | 实时访客量、问答数、满意度、热门景点 |
| **知识库管理** | 上传 PDF/Word/文本，自动向量化（Embedding），支持分类标签 |
| **景点管理** | 景点增删改查，坐标定位，排序权重，语音导览配置 |
| **数字人配置** | 形象风格（古风/现代/卡通）、声音风格、语速音调、欢迎语定制 |
| **数据分析** | 每日 QA 量趋势、情感分布（正面/中性/负面），搜索热词 |

---

### 🔌 6. MCP 协议集成

提供标准 Model Context Protocol 工具接口，支持外部 AI 客户端调用：

| 工具 | 功能 |
|------|------|
| `list-spots` | 获取景点列表 |
| `get-spot` | 获取指定景点详情 |
| `list-routes` | 获取行程路线 |
| `ask-question` | 向 AI 导览提问 |
| `add-favorite` | 添加收藏 |
| `record-visit-rating` | 记录游览评分 |
| `book-ticket` | 预订门票 |

---

### 📱 7. 双端导航系统

- **移动端（< md）**：底部 TabBar，AI 数字人导游按钮悬浮居中突出
- **PC端（≥ md）**：左侧 240px 固定侧边栏，C/B 端样式主题切换

### 🔄 8. 交互细节与排版优化

- **优化滚动对齐**：移除多余的视口展开判定限制，使 auto-scroll 效果作用于每一次的回复与打字输出，视口流畅定位到底部。
- **重新设计交互按键**：将底部的拍照和语音按钮进行了高质感重绘：拍照按钮使用金黄/琥珀色渐变；语音按钮使用翠绿/青色渐变，且录音时带有炫酷的脉冲动效。
- **PC端B端大屏防遮挡定位**：使用嵌入式 CSS 媒体查询锁定各列分配，形象列表、属性配置与媒体预览三大组件并排铺开，不再发生重叠或被遮挡。

---

## ⚙️ 部署指南

### 方式一：Windows 一键启动（开发环境）

```powershell
# 克隆项目后，直接在项目根目录运行
.\run.ps1
```

脚本自动完成：
1. ✅ 检测 Bun / npm 包管理器
2. ✅ 自动复制 `.env.example` → `.env`（如不存在）
3. ✅ 安装 / 更新依赖（`bun install`）
4. ✅ 生成数据库迁移文件（`db:generate`）
5. ✅ 执行数据库迁移（`db:migrate`，失败自动降级为 `db:push`）
6. ✅ 启动 Next.js 开发服务器（`bun run dev`）

---

### 方式二：手动启动

```bash
# 1. 安装依赖
bun install        # 或 npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，填入 EAZO_PRIVATE_KEY、EAZO_APP_ID、DATABASE_URL

# 3. 数据库迁移
bun run db:generate
bun run db:migrate

# 4. 启动开发服务器
bun run dev
```

访问 `http://localhost:3000`

---

### 方式三：Vercel 生产部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

**Vercel 环境变量配置：**

| 变量名 | 说明 |
|--------|------|
| `EAZO_APP_ID` | Eazo 平台应用 ID |
| `EAZO_PRIVATE_KEY` | Eazo 私钥（用于解密用户 Token） |
| `DATABASE_URL` | PostgreSQL 连接字符串 |
| `CRON_SECRET` | Vercel Cron 鉴权密钥（每日推送） |

**Cron 任务：** 每天 UTC 17:00（北京时间 01:00）触发 `/api/notifications/cron/daily-digest`

---

### 数据库命令速查

```bash
bun run db:generate   # 生成迁移文件
bun run db:migrate    # 执行迁移
bun run db:push       # 直接推送 Schema（跳过迁移）
bun run db:studio     # 打开 Drizzle Studio 可视化管理
bun run db:drop       # 删除迁移记录
```

---

## 📦 API 接口

### 🤖 AI 对话接口

#### `POST /api/qa/chat` — AI 导览问答（支持流式）
```json
请求体:
{
  "question": "翠玉景区有哪些历史文物？",
  "history": [{"role": "user", "content": "..."}],
  "stream": true
}

响应（非流式）:
{"answer": "...", "userId": "xxx"}

响应（流式 SSE）:
data: {"delta": "翠玉"}
data: {"delta": "景区..."}
data: [DONE]
```

#### `GET /api/qa/chat` — 获取用户历史会话（需认证）

#### `GET /api/qa/tts?text=xxx` — 文字转语音

#### `POST /api/qa/stt` — 语音转文字（上传音频）

---

### 📍 景点接口

#### `GET /api/spots` — 景点列表
```
参数: category, search, city, page, limit
特殊: category=national 返回全国热门景点静态数据
```

#### `GET /api/spots/[id]` — 景点详情

#### `POST /api/spots/recognize` — 图像识别（multipart/form-data）
```
body: FormData { image: File }
响应: { subject, story, tip }
```

---

### 🗺️ 行程路线接口

#### `GET /api/routes` — 路线列表
```
参数: interest (history | nature | cultural | family | all)
```

---

### 🔍 全局搜索接口

#### `GET /api/search?q=关键词`
```json
响应:
{
  "spots": [{ "id", "name", "category", "description", "imageUrl", "rating", "duration" }],
  "knowledge": [{ "id", "title", "category", "preview" }]
}
```

---

### 👤 用户接口

#### `GET/PUT /api/user` — 获取/更新用户信息（需认证）

#### `GET/PUT /api/user/preferences` — 用户偏好（无障碍模式等）

---

### 🔌 MCP 接口

#### `POST /api/mcp` — MCP 协议端点（JSON-RPC 2.0）

---

## 👾 项目代码及界面规模

### 📊 代码规模

| 类别 | 数量 / 规模 |
|------|------------|
| 页面路由（App Router） | 13 个页面目录 |
| API 路由 | 8 个功能组，约 20+ 端点 |
| 核心屏幕组件 | 17 个（screens/） |
| 数据库表 | 9 张（spots, routes, users, knowledge_docs, avatar_configs, analytics_daily, qa_logs, chat_sessions, favorites, coupons, merchants, visit_records, user_preferences, search_queries） |
| MCP 工具 | 7 个 |
| 最大单文件 | ProfileScreen.tsx（62KB）、QAScreen.tsx（49KB）、page.tsx 落地页（47KB） |
| 主要依赖 | 24 个生产依赖，8 个开发依赖 |
| 包管理器 | Bun 1.3.9 |
| TypeScript 覆盖 | 全量 TypeScript（strict） |

### 🖼️ 界面规模

| 界面 | 描述 |
|------|------|
| **欢迎落地页** | 全屏沉浸式动画、景区特色介绍、引导入口 |
| **智能导游首页** | 轮播 Banner、热门景点横滑、快捷功能入口 |
| **AI 数字人对话** | 聊天气泡界面、流式打字机效果、语音输入/输出 |
| **热门景点** | 卡片网格、分类筛选、搜索、收藏、地图坐标 |
| **行程规划** | 路线卡片、兴趣标签筛选、步骤化行程详情 |
| **VR 即拍即识** | 全屏取景框、LIDAR 动效、识别结果+语音讲解 |
| **景区 FM** | 播客式广播界面、频谱动画 |
| **个人中心** | 资料卡、偏好设置、收藏、访问历史、优惠券 |
| **管理大屏** | KPI 卡片、图表、实时数据流 |
| **知识库管理** | 文档列表、上传解析、向量化状态、标签管理 |
| **数字人配置** | 形象预览、声音参数滑块、欢迎语编辑 |
| **数据分析** | 折线图趋势、情感饼图、热词排行 |

---

## 💡 常见问题

### ❓ 启动时报错 `DATABASE_URL` 连接失败？

**解决：** 检查 `.env` 文件中的 `DATABASE_URL` 格式是否正确：
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME
```
如使用托管数据库，请确认网络白名单已开放本机 IP。

---

### ❓ `bun` 命令未找到？

`run.ps1` 会自动降级到 `npm`。若要使用 Bun，按照官方文档安装：
```powershell
# Windows 安装 Bun
powershell -c "irm bun.sh/install.ps1 | iex"
```

---

### ❓ AI 问答返回"小玉现在有些忙"？

可能原因：
1. `EAZO_APP_ID` 或 `EAZO_PRIVATE_KEY` 配置错误
2. Eazo 平台配额耗尽
3. `DeepSeek v3.1` 模型调用超时

检查 `next.config.ts` 中的 `ENV_DEFAULTS` 是否包含有效凭据。


---

<div align="center">

**🌿 旅行家Pro · 让每一次旅行都留下深刻记忆**

*Built with ❤️ by Eazo AI Platform*

</div>
