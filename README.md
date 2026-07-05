# 🤖 旅行家Pro · 多模态AI数字人导游与智慧运营平台

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js) ![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript) ![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss) ![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?style=flat-square&logo=drizzle) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql) ![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-BB4BFF?style=flat-square&logo=framer) ![Eazo SDK](https://img.shields.io/badge/Eazo_SDK-0.19-FF7A5A?style=flat-square) ![DeepSeek](https://img.shields.io/badge/DeepSeek-v4--Pro-00B4D8?style=flat-square) ![StepFun](https://img.shields.io/badge/StepFun-3.7--Flash-FF4500?style=flat-square) ![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=flat-square&logo=vercel) ![Bun](https://img.shields.io/badge/Bun-1.3-FBF0DF?style=flat-square&logo=bun) ![MCP](https://img.shields.io/badge/MCP-Protocol-7C3AED?style=flat-square)

---

## 📋 项目简介

**旅行家Pro** 是一款专为现代化智慧景区深度定制研发的**智能伴游与数字化管理运营系统**。系统通过高度集成的**移动定位服务 (LBS)**、**多模态大语言模型 (LLM)**、**流式语音合成与识别 (TTS/STT)** 以及**向量知识库检索 (RAG)** 技术，为游客提供沉浸式、个性化、全天候的导览陪伴服务；同时，为景区运营方提供强大的实时数据分析看板，实现全方位的客流监控与决策调优。

*   **🙋 游客伴游端 (C端)**：以 7×24 小时在线的 **AI 数字人“小玉”**为交互核心，支持流式对话响应。拥有基于地理围栏的**智能行程一键规划**、**VR拍照即拍即识文物解读**、足迹勋章打卡和景区 FM 语音广播功能。针对特殊群体，特设专属偏好模式（包括适合老年的大字号、无障碍路线，以及适合儿童的童趣配音与故事性引导）。
*   **📊 景区运营管理后台 (B端)**：提供实时的**运行仪表盘**（实时客流、提问频率、满意度折线图、情感倾向词云分析等），支持动态的**数字人形象/音色装扮**、**RAG 向量知识库文档管理**以及**景区景点属性 CRUD 维护**。
*   **🔌 开放式 Agent 接口**：标准集成了 **MCP (Model Context Protocol) 协议**，支持外部大模型智能体直接挂载调用景区的核心数据库与票务服务。

---

## 🛠️ 技术栈

### 💻 前端技术栈

| 技术 | 版本 | 说明 |
| :--- | :--- | :--- |
| **Next.js** | `16.2.4` (App Router) | 全栈框架，提供服务端渲染 (SSR) 与客户端自适应路由 |
| **React** | `19.2.4` | 核心视图库，完美对接最新并发模式和客户端 Hooks |
| **TypeScript** | `5.x` | 类型安全层，确保严苛的编译时类型校验 |
| **Tailwind CSS** | `v4` | 实用优先 CSS 框架，支持最先进的 CSS 级变量及高速编译 |
| **Framer Motion** | `12.38.0` | 动效引擎，为数字人对话气泡、LIDAR 扫描、FM 频谱提供平滑过渡 |
| **Shadcn UI & Base UI**| `latest` | 具备极佳可访问性 (WAI-ARIA) 的无样式及定制化组件库 |
| **Lucide React** | `1.8.0` | 统一高品质 SVG 图标系统 |

### ⚙️ 后端与数据库技术栈

| 技术 | 版本 | 说明 |
| :--- | :--- | :--- |
| **Drizzle ORM** | `0.45.2` | 轻量、高强度的 SQL-like ORM，提供完全的类型安全与极致性能 |
| **PostgreSQL** | `16` | 核心关系型数据库，存储用户信息、景点数据、QA 日志及每日分析 |
| **Postgres.js** | `3.4.9` | 高速原生 PostgreSQL 数据库连接驱动 |
| **Drizzle Kit** | `0.31.10` | 迁移管理工具，支持自动化 SQL 生成和 Studio 可视化面板 |
| **@turf/turf** | `7.3.5` | 地理空间分析计算库，辅助进行智能路线景点间距离测算与规划 |

### 🤖 AI 服务技术栈

| 服务/模型 | 提供商 | 核心职责与应用场景 |
| :--- | :--- | :--- |
| **DeepSeek-V4-Pro** | 深度求索 (DeepSeek) | 主对话大模型，负责 C 端流式智能导览问答与情感标注 |
| **Step-3.7-Flash** | 阶跃星辰 (StepFun) | 多模态视觉模型，负责 VR 拍照即拍即识，分析解析照片文物史料 |
| **DeepSeek-V3.1** | Eazo SDK 内置 | 备用对话与多模态识别模型，实现异常发生时的无缝热切换 |
| **Eazo TTS & STT** | Eazo AI 平台 | 文本转语音 (TTS) 与语音转文本 (STT) 服务，支持流式音频播放 |
| **Text-Embedding-3** | Eazo API (自建相似度) | 提供文本的向量化（Embedding）表示，实现基于余弦相似度的 RAG 检索 |

---

## 📁 目录结构

```
AI-guide/
├── src/
│   ├── app/                        # Next.js App Router 页面路由
│   │   ├── page.tsx                # 欢迎落地页（高保真沉浸式动画）
│   │   ├── layout.tsx              # 根布局（提供 SDK Provider 与字体注入）
│   │   ├── globals.css             # 全局样式与 CSS 变量（主题切换）
│   │   ├── home/                   # 🏠 游客端首页 (HomeScreen)
│   │   ├── spots/                  # 📍 景点列表及详情页面
│   │   ├── qa/                     # 🤖 AI 数字人问答交互中心 (QAScreen)
│   │   ├── routes/                 # 🗺️ 游览行程规划列表及详情 (RoutesScreen)
│   │   ├── profile/                # 👤 游客个人资料与足迹中心
│   │   ├── search/                 # 🔍 景区全局模糊检索页
│   │   ├── vr-recognize/           # 📷 VR 即拍即识导览模块
│   │   ├── fm/                     # 🎵 景区 FM 播客式语音广播 (FMScreen)
│   │   ├── welcome/                # 🎉 交互式欢迎引导界面
│   │   ├── login/                  # 🔐 安全登录入口
│   │   ├── ai-settings/            # ⚙️ AI 个性化模式设置
│   │   └── admin/                  # 🖥️ B 端管理后台
│   │       ├── page.tsx            # 可视化数据大屏看板
│   │       ├── knowledge/          # 知识库管理（RAG 上传、解析、向量化）
│   │       ├── spots/              # 景点信息管理 (CRUD)
│   │       ├── avatar/             # 数字人装扮配置（三列弹性排版）
│   │       └── analytics/          # 运营数据趋势与情感分析详情
│   │
│   ├── app/api/                    # Next.js 后端 API 路由层
│   │   ├── qa/                     # 智能对话、TTS、STT、会话、反馈、数字人激活等
│   │   ├── spots/                  # 景点查询、景点详情、图像识别 (/recognize)
│   │   ├── routes/                 # 行程规划获取与智能路线生成
│   │   ├── search/                 # 全局模糊检索服务
│   │   ├── user/                   # 个人信息、游览足迹、偏好设置、优惠券
│   │   ├── admin/                  # B 端管理专有接口
│   │   ├── notifications/cron/     # 每日 Vercel Cron 定时任务推送
│   │   └── mcp/                    # MCP 协议端点
│   │
│   ├── components/                 # 公共 UI 组件
│   │   ├── layout/                 # LayoutShell 响应式布局外壳、Navigation 导航
│   │   ├── screens/                # 核心业务大组件（共 17 个主场景）
│   │   ├── ui/                     # 基础粒子 UI 组件
│   │   ├── notifications/          # 消息通知及警示栏
│   │   └── user-profile/           # 用户专有卡片
│   │
│   ├── lib/                        # 公共服务库
│   │   ├── db/                     # 数据库连接、 schema 表结构设计、迁移与查询
│   │   ├── auth/                   # Eazo SDK 授权/JWT 解密逻辑
│   │   ├── api/                    # 频率限制 (rate-limit)、向量检索重排 (embedding)
│   │   ├── mcp/                    # MCP 服务端及其 Tool 工具套件定义
│   │   └── data/                   # 全国热门景点静态预置数据
│   │
│   ├── utils/                      # 基础辅助类与纯函数
│   └── instrumentation.ts          # Next.js 运行时环境初始化与注入
│
├── public/                         # 静态文件、图片资源
├── scripts/                        # 运维/部署/清理脚本
├── doc/                            # 开发方案与交互计划文档
├── run.ps1                         # Windows 开发环境一键配置启动脚本
├── drizzle.config.ts               # Drizzle ORM 配置文件
├── vercel.json                     # Vercel 部署及 Cron 定时任务参数
└── seed.ts                         # 数据库种子填充脚本
```

---

## ⚡ 核心功能模块和工作流程

### 1. 🤖 AI 数字人导游 RAG 问答

数字人“小玉”是整个系统的交互中枢。其后台运行了一套高效的**检索增强生成 (RAG) 引擎**加**混合重排**算法。

```mermaid
graph TD
    A[用户输入提问] --> B{IP 速率限制限制?}
    B -- 是 (429) --> C[返回友好限流提示]
    B -- 否 --> D[软鉴权校验/获取用户无障碍偏好]
    D --> E[查询知识库 vectorized=true 记录]
    E --> F[1. 计算余弦相似度 Cosine Similarity]
    E --> G[2. 计算关键词相关性评分 Keyword Score]
    F & G --> H[3. 混合重排评分 = 0.7*语义 + 0.3*关键词]
    H --> I[4. 阈值筛选 >0.2 并提取 Top-3 片段]
    I --> J[拼装 System Prompt 并结合无障碍偏好提示]
    J --> K[调用 DeepSeek-V4-Pro]
    K --> L{是否需要流式输出?}
    L -- 是 (Stream) --> M[返回 SSE 字符流并异步解析情感 & 写入 QA 数据库]
    L -- 否 (Block) --> N[返回完整回复 JSON 并更新每日大屏数据]
```

---

### 2. 📷 VR 即拍即识

游客在景区内可以对感兴趣的雕塑、碑刻、建筑或古树进行拍照上传，AI 多模态大模型将在数毫秒内对图片进行全方位扫描，输出文物的由来与游览建议。

```mermaid
sequenceDiagram
    autonumber
    游客C端->>页面 UI: 开启摄像头拍摄或选择预设珍玩
    页面 UI->>页面 UI: 启动模拟 LIDAR 3D 拓扑扫描动效 (4步加载)
    页面 UI->>识别 API (/api/spots/recognize): 上传图片文件 (FormData)
    识别 API->>识别 API: 校验是否存在 STEP_API_KEY
    alt 存在 StepFun 密钥
        识别 API->>StepFun step-3.7-flash: 调用视觉分析大模型
    else 键值不存在或失效
        识别 API->>Eazo SDK (deepseek.v3.1): 调用多模态备用接口
    end
    识别 API-->>页面 UI: 返回识别数据 { subject, story, tip }
    页面 UI->>Eazo TTS: 自动转换为语音朗读
    页面 UI->>页面 UI: 运行动态波形动画，提供语音精讲播放
```

---

### 3. 🗺️ 智能路线规划与空间距离测算

*   **路线智能生成**：游客在 `RoutesScreen` 可根据个人偏好标签（历史、自然、文化、亲子）和理想游览时长，一键生成符合体力的路径。
*   **地图轨迹渲染**：在重庆高精三维模拟地图上，动态绘制多景点折线（Polyline）。
*   **Turf 空间计算**：借助 `@turf/turf` 库，根据各个景点的经纬度计算连续点位之间的球面距离（Great Circle Distance），并在后台对游客当前的偏离距离进行监控与路径动态纠偏。

---
### 🎵 4. 景区 FM 语音广播

FMScreen 组件实现播客式文化广播，集成 Eazo TTS 引擎，用户可收听景区故事和文化讲解。

---

### 🖥️ 5. B端景区智慧运营管理后台

| 模块 | 功能 |
|------|------|
| **数据大屏** | 实时访客量、问答数、满意度、热门景点 |
| **知识库管理** | 上传 PDF/Word/文本，自动向量化（Embedding），支持分类标签 |
| **景点管理** | 景点增删改查，坐标定位，排序权重，语音导览配置 |
| **数字人配置** | 形象风格（古风/现代/卡通）、声音风格、语速音调、欢迎语定制 |
| **数据分析** | 每日 QA 量趋势、情感分布（正面/中性/负面），搜索热词 |

---
### ♿ 无障碍多模态偏好系统
根据用户的不同偏好，AI 对话的风格与路由推荐策略会动态自适应：
*   **普通模式 (`normal`)**：以温婉专业的导游形象进行讲解，回答在 200 字内，富有历史典故色彩。
*   **老年模式 (`elder`)**：字号全局放大，AI 语气语速放慢放缓。回答在 150 字内，无门槛易理解，且路线规划优先选择“坡度平缓、设有扶手和无障碍通道”的路线。
*   **儿童模式 (`child`)**：界面切换为活泼的卡通风格，大模型切换为充满童趣的拟人化表达（如“大树爷爷”、“石头将军”），回答在 100 字内，提供生动的神话传说故事。

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


---

## ⚙️ 部署指南

### 方式一：Windows 一键脚本自动部署（推荐开发环境）

项目根目录集成了高度自动化的配置脚本 `run.ps1`，能够一键解决包管理器、依赖、环境变量和数据库表结构的初始化。

在 Windows 系统中以管理员权限打开 PowerShell，进入项目根目录并运行：
```powershell
powershell -ExecutionPolicy Bypass -File .\run.ps1
```

**该脚本的自动化逻辑：**
1.  **包管理器检测**：优先检测系统环境是否拥有 `bun`，若无则自动降级使用 `npm` 进行编译。
2.  **配置环境依赖**：自动检测是否存在 `.env` 环境变量文件。如果不存在，则根据模板自动拷贝 `.env.example` 到 `.env`。
3.  **依赖包下载**：执行 `bun install` / `npm install`。
4.  **数据库迁移**：运行 `drizzle-kit generate` 生成 SQL 迁移脚本，并利用 `db:migrate` 导入表结构。如失败，会自适应调用 `db:push` 绕过版本记录直接同步表结构。
5.  **启动服务器**：启动 Next.js Turbopack 编译内核，热加载服务。

---

### 方式二：手动开发环境搭建

1.  **安装 Bun 运行时**（若使用 npm，请将 `bun` 替换为 `npm run`）：
    ```bash
    powershell -c "irm bun.sh/install.ps1 | iex"
    ```
2.  **克隆依赖与配置文件**：
    ```bash
    bun install
    cp .env.example .env
    ```
3.  **配置环境变量 (`.env`)**：
    ```env
    # Drizzle PostgreSQL 数据库连接地址
    DATABASE_URL="postgresql://username:password@localhost:5432/travel_db"

    # Eazo 开放平台配置
    EAZO_APP_ID="your_eazo_app_id"
    EAZO_PRIVATE_KEY="your_eazo_private_key"

    # DeepSeek 核心接口配置（直接通过中继网关访问）
    DEEPSEEK_API_KEY="your_deepseek_api_key"
    DEEPSEEK_PROXY_URL="https://mangdream.com/api/innoreation/v1/proxy"

    # StepFun 视觉模型密钥
    STEP_API_KEY="your_stepfun_api_key"
    ```
4.  **同步表结构并填充种子数据**：
    ```bash
    bun run db:generate
    bun run db:migrate
    bun run seed.ts
    ```
5.  **开启 Dev 本地服务器**：
    ```bash
    bun run dev
    ```

---

### 方式三：Vercel 生产部署与自动化任务

1.  **一键上传部署**：
    ```bash
    npm install -g vercel
    vercel --prod
    ```
2.  **配置生产环境变量**：在 Vercel 后台的 `Environment Variables` 中，正确填入 `.env` 中的全部配置。
3.  **Cron 自动归档任务**：根据项目根目录下的 `vercel.json` 规则，每天的 **UTC 17:00**（北京时间凌晨 01:00）会自动请求 `/api/notifications/cron/daily-digest` 接口。
    *   该接口利用 `CRON_SECRET` 校验安全性，并将昨日所有游客提问的 `qa_logs` 日志打包进行情感分类和满意度计算，写入 `analytics_daily` 存档表，确保 B 端大屏数据的连续性。

---

## 📦 API 接口

### 🤖 1. AI 对话与语音合成

| 接口名称 | 请求路径 | 请求方法 | 输入参数 (JSON / Query) | 响应格式 (JSON) | 功能说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **智能对话导览** | `/api/qa/chat` | `POST` | `question` (string), `history` (array), `stream` (bool) | 流式: SSE `data: {...}`<br>非流式: `{ answer, userId }` | 核心对话，支持 RAG 混合重排与无障碍 Prompt 输出 |
| **获取历史记录** | `/api/qa/chat` | `GET` | *需 Token 认证* | `[{ role: "user", content: "..." }]` | 获取当前登录用户的历史多轮对话记录 |
| **文字转语音 (TTS)**| `/api/qa/tts` | `GET` | `text` (string) | 二进制音频流或语音路径 | 将文本流转换为高自然度数字人配音 |
| **语音转文字 (STT)**| `/api/qa/stt` | `POST` | `audio` (File) | `{ text: string }` | 识别游客的语音输入转化为文本 |
| **点赞/踩反馈** | `/api/qa/feedback` | `POST` | `qaLogId` (number), `rating` (1/5) | `{ success: true }` | 收集游客对 AI 讲解满意度评分 |

### 📍 2. 景点与视觉识别

| 接口名称 | 请求路径 | 请求方法 | 输入参数 (JSON / Query) | 响应格式 (JSON) | 功能说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **获取景点列表** | `/api/spots` | `GET` | `category` (string), `search` (string) | `[{ id, name, location, ... }]` | 列表查询，`category=national` 将回退到全国热门景点静态包 |
| **景点详情查询** | `/api/spots/[id]` | `GET` | `id` (path variable) | `{ id, name, description, tags }` | 获取具体景点的语音指引链接、经纬度与详图 |
| **VR 即拍即识** | `/api/spots/recognize`| `POST` | `image` (File), `spot` (string) | `{ subject, story, tip }` | 视觉分析多模态接口，默认调用 StepFun，备用 DeepSeek-VL |

### 🗺️ 3. 行程与偏好

| 接口名称 | 请求路径 | 请求方法 | 输入参数 (JSON / Query) | 响应格式 (JSON) | 功能说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **获取行程推荐** | `/api/routes` | `GET` | `interest` (history/nature/etc) | `[{ id, name, spotIds, ... }]` | 预置游览行程获取，包含预计用时与计算总距离 |
| **生成定制路线** | `/api/routes/generate`| `POST` | `interests` (array), `accessibilityMode` | `{ id, name, spotIds, ... }` | 根据身体状况及无障碍需要动态调配规划景点路径 |
| **更新个人偏好** | `/api/user/preferences`| `PUT` | `accessibilityMode` (string), `interests` | `{ success: true }` | 切换 normal/elder/child 偏好模式，写入 user_preferences 表 |
| **足迹记录** | `/api/user/visits` | `POST` | `spotId` (number), `rating` (number) | `{ success: true }` | 登记游客到访历史，用以触发成就和勋章发放 |

### 🖥️ 4. 后台运营与 MCP 互操作

| 接口名称 | 请求路径 | 请求方法 | 输入参数 (JSON / Query) | 响应格式 (JSON) | 功能说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **数据大屏监控** | `/api/admin/analytics`| `GET` | *需管理员权限* | `{ totalVisitors, totalSessions, ... }` | 抓取 B 端大屏幕所需的所有聚合图表指标 |
| **知识库文档操作** | `/api/admin/knowledge`| `POST` | `file` (Word/PDF) 或 `text` (string) | `{ success: true, docId }` | 允许管理员上传景区历史材料，上传后自动完成 Embedding |
| **文档列表/删除** | `/api/admin/knowledge`| `DELETE` | `id` (Query) | `{ success: true }` | 剔除指定的知识库文章，并同步更新向量化库 |
| **MCP 端点接口** | `/api/mcp` | `POST` | `{ method: "tools/call", params: {...} }` | MCP 协议标准 JSON-RPC 响应 | 允许外部智能体 Agent 执行 `list-spots` 等 7 个内置工具 |

---

## 💡 总结与展望

### 🌟 项目核心优势总结

1.  **卓越的工程规范与极速技术栈**：采用 Next.js 16 (App Router/Turbopack) 和 React 19 的前沿搭配，完全重构的 Tailwind CSS v4 大幅压缩了 CSS 构建包大小。在底层应用 Bun 的极速生态，构建效率与启动响应均达到了毫秒级。
2.  **独具匠心的智能导览 RAG 算法**：不依赖外部第三方检索服务，在 PostgreSQL 层实现了具有**余弦相似度 + 混合重排 (Cosine Similarity + Sparse Hybrid Reranker)** 的搜索逻辑，达到了 0.7 语义与 0.3 关键词检索的最优融合，彻底避免大模型在景区讲解时的幻觉问题。
3.  **人文关怀的无障碍体验**：真正将“适老化”与“童趣化”沉淀在产品的交互逻辑与大模型提示词设计中，让智能导览不再是年轻人的专利。
4.  **三列独立弹性保护排版 (Flex Column Auto-Adjust)**：在 PC 后台配置页上使用极致优雅的 Flex 固定与自适应方案，从根本上杜绝了因容器尺寸缩放导致的溢出和折行。

---

### 🚀 未来版本展望与规划

#### 🎨 1. Live2D/3D 数字人模型实时口型对齐
*   **当前状况**：目前数字人以静态精美图片为主，语音采用后台流式 TTS 转换为音频流进行播放。
*   **演进目标**：在前端集成 Live2D 轻量级渲染器或 WebGL 3D 渲染，通过分析 TTS 音频的振幅与声谱数据，在客户端实时计算并驱动数字人的眼部眨动与口型变化（Viseme 对齐），极大提升沉浸感。

#### 📶 2. 离线 AR 实景导览与手机陀螺仪追踪
*   **当前状况**：依靠高精度三维渲染重庆地图并结合 Turf.js 进行坐标测算。
*   **演进目标**：利用 WebXR 协议，游客只需拿起手机对准景区建筑，AI 即可直接将对应的历史古物介绍通过 AR 虚实融合图层叠加在屏幕上，并结合罗盘/陀螺仪，判断游客面朝的方向做指向性精讲。

#### 📞 3. WebRTC 双向实时语音免唤醒交互 (VoIP)
*   **当前状况**：依靠传统的语音录入（STT）再生成回复的单工机制。
*   **演进目标**：搭建基于 WebRTC 协议的 VoIP 语音信道，游客可以像拨打微信电话一样与“小玉”进行通话，AI 支持实时打断与连续对话，彻底释放双手。

#### 🎫 4. 真实票务核验与商户营销生态链打通
*   **当前状况**：拥有模拟优惠券与景区足迹卡片等功能。
*   **演进目标**：打通景区的真实闸机核销系统，通过将购票订单直接生成标准动态加密 QR 码，实现真正的在线支付、现场核销、积分商城和商户分佣系统。

---

<div align="center">

**🌿 旅行家Pro · 让每一次旅行都留下深刻记忆**

*Built with ❤️ by Eazo AI Platform*

</div>
