# 🤖 旅行吧 · 景区智能导游与智慧运营系统 (AI-Guide)

[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?style=flat&logo=next.js)](https://nextjs.org/) [![React](https://img.shields.io/badge/React-19.2.4-%2361DAFB?style=flat&logo=react)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-%233178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-%2338B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/) [![Bun](https://img.shields.io/badge/Bun-1.3.9-black?style=flat&logo=bun)](https://bun.sh/) [![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45.2-%23C5F74F?style=flat)](https://orm.drizzle.team/) [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-%234169E1?style=flat&logo=postgresql)](https://www.postgresql.org/) [![DeepSeek](https://img.shields.io/badge/DeepSeek-V3.1-blue?style=flat&logo=deepseek)](https://deepseek.com/) [![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-green?style=flat&logo=leaflet)](https://leafletjs.com/)

---

## 📋 项目简介

**旅行吧** 是一款针对现代智慧景区深度定制开发的**智能导游与数字化管理系统**。项目有机融合了移动定位服务 (LBS)、大型语言模型 (LLM)、流式音频渲染 (TTS) 与视觉多模态分析技术，为游客提供极具沉浸感、定制化的一站式游览伴随服务，同时赋予景区运营方强大的数据洞察与运营调优能力。

*   **🙋 游客端 (C端)**：以 7×24 小时在线的 **AI 数字人**为交互核心，支持快速语音交互精讲。特色功能包括：基于大模型偏好的**智能行程一键规划**、真实重庆高精地图导航渲染、**VR拍照即拍即识文物解读**、足迹勋章打卡，以及适配老年（无障碍字号与路线）和儿童（童趣配音与故事性引导）的专属定制偏好模式。
*   **📊 管理端 (B端)**：提供实时的**景区运行仪表盘**（今日客流量、满意度指标、提问聚合与情感倾向词云分析等），支持动态配置数字人声音音色/性别形象、RAG 向量知识库文档管理，以及景区景点属性的快速录入维护。

---

## 🛠️ 技术栈

整个系统基于高效、稳定且现代的 TypeScript 全栈技术链构建：

| 分类 | 核心技术 / 依赖 | 关键特性与应用用途 |
| :--- | :--- | :--- |
| **前端核心** | `Next.js 16.2 (App Router)` + `React 19` | 混合架构（RSC 服务端组件与 Client 交互组件结合），首屏极速加载。 |
| **地图导航** | `Leaflet 1.9.4` + `React-Leaflet` | 集成真实重庆市区卫星及街道地图，进行多点坐标折线（Polyline）绘制及轨迹跟走。 |
| **样式与动画** | `Tailwind CSS v4` + `framer-motion` | 完美适配移动端与 PC 端的响应式布局，极具质感的平滑卡片过渡与手势微交互。 |
| **数据库** | `Drizzle ORM` + `PostgreSQL` | 强类型模式定义，快速实现游客浏览痕迹、打卡星级以及满意度数据聚合。 |
| **视觉多模态** | `DeepSeek-VL` + `/api/spots/recognize` | 针对游客拍摄上传的展品或建筑图像，进行深度文化脉络解读与避坑指南输出。 |
| **AI 问答/音频** | `deepseek.v3.1` (Bedrock API) + TTS / STT | Server-Sent Events 流式生成，支持多轮对话、角色化偏好自适应及智能音频播报。 |
| **智能体协议** | `@modelcontextprotocol/sdk` (MCP) | 实现景点获取 (`get-spot`)、门票预订模拟 (`book-ticket`) 等 Tool 接口的标准化封装。 |

---

## 📁 目录结构

以下为项目的核心目录结构，展示了前后端逻辑、数据库层和 MCP 协议的高度模块化设计：

```text
AI-guide/
├── public/                       # 静态资源 (数字人贴图、三维扫描雷达图片)
├── scripts/                      # 系统运行辅助与 Demo 数据清理脚本
├── src/
│   ├── app/                      # Next.js 路由路由与入口层
│   │   ├── admin/                # B端 - 管理后台页面
│   │   │   ├── analytics/        # 游客行为大屏与高频诉求词云分析
│   │   │   ├── avatar/           # 数字人形象（男女）及音色音速参数配置
│   │   │   ├── knowledge/        # RAG 知识库参考文档在线上传
│   │   │   ├── spots/            # 景区景点增删改查页面
│   │   │   └── page.tsx          # 管理端仪表盘首页
│   │   ├── ai-settings/          # C端 - 适老化、童趣模式配置页
│   │   ├── vr-recognize/         # C端 - VR 拍图即拍即识智能解读页
│   │   ├── api/                  # 后端 API 接口层
│   │   │   ├── admin/            # 后台数据管理 API (analytics, knowledge, avatar, spots)
│   │   │   ├── mcp/              # 标准 Model Context Protocol (MCP) 接口
│   │   │   ├── qa/               # 智能问答流 (chat, tts, stt) 接口
│   │   │   ├── routes/           # 路线生成及详情接口
│   │   │   ├── spots/            # 景点获取、评分、即拍即识接口
│   │   │   └── user/             # 用户 Profile 及偏好设置同步接口
│   │   ├── spots/                # C端 - 景点广场及列表
│   │   ├── routes/               # C端 - 专属路线规划及 Leaflet 地图页
│   │   ├── qa/                   # C端 - 智能人机对话与数字人导览中心
│   │   ├── profile/              # C端 - 个人中心 (五合一面板)
│   │   ├── search/               # C端 - 景区全局检索
│   │   ├── layout.tsx            # 全局 Root Layout
│   │   └── page.tsx              # 游客端首页 (AI 数字人交互中心)
│   ├── components/               # 可复用 React 组件
│   │   ├── layout/               # 页面骨架 (Shell、响应式侧栏及底部 Tab 栏)
│   │   ├── screens/              # 页面级高内聚视图组件 (ProfileScreen 等 15 个)
│   │   └── ui/                   # 基础 UI 交互组件 (海报生成器等)
│   ├── lib/                      # 基础服务与逻辑库
│   │   ├── api/                  # Axios/Fetch 客户端封装
│   │   ├── db/                   # Drizzle 实体定义、表结构与数据库客户端配置
│   │   └── mcp/                  # MCP 核心逻辑与智能体工具注册 (book-ticket 等)
│   └── utils/                    # 格式化、坐标距离计算等工具函数
├── tsconfig.json                 # TypeScript 强类型配置文件
├── package.json                  # 项目依赖与启动脚本
└── README.md                     # 项目自述文档
```

---

## ⚡ 核心功能模块和工作流程

### 1. 核心业务工作流

#### 🧭 智能路线规划工作流 (LLM + 地图定位)
```text
[用户选择偏好/时长] ──► [发起 /api/routes/generate] ──► [请求 DeepSeek-V3 优化推理]
                                                                  │
[Leaflet 地图绘制 Polyline] ◄── [返回有时序、难度与景点的完整路线 JSON] ◄──┘
```

#### 👁️ VR 拍照即拍即识工作流 (视觉多模态 RAG)
```text
[游客拍照/上传图片] ──► [转换为 Base64 数据] ──► [发起 /api/spots/recognize]
                                                                │
[高精雷达波扫描动画] ◄── [返回包含名称、深度历史与避坑建议的结构体] ◄── [视觉模型分析]
```

#### 🗣️ 自适应数字人问答流 (SSE 流式多模态)
```text
[游客提问] ──► [获取用户偏好模式(标准/适老/儿童)] ──► [检索 RAG 景点知识向量库]
                                                                 │
[流式文字渲染及 TTS 分句发音] ◄── [Server-Sent Events 持续输出] ◄── [装配 System Prompt]
```

### 2. 双端特色功能矩阵

*   **适老与童趣模式**：适老模式提供无障碍大字号，改用和蔼温润的 TTS 音色，优先过滤推荐平坦无台阶路线；儿童模式采用卡通数字人外框，使用拟人化奇遇故事语音精讲。
*   **全屏独立登录中心**：提供管理员和普通游客一键登录通道，支持验证码和常规密码，前后端同步会话状态。
*   **个人中心（五合一）**：合并了“我的首页”（今日聚意值、最近浏览）、“我的行程”（进行中/已完成线路）、“我的收藏”（按景点/文物分类）、“我的兴趣”（自选标签配置）与“设置与帮助”板块，完美实现双端自适应。

---

## ⚙️ 部署指南

### 1. 本地开发与调试
系统要求使用 **Node.js (v20+)** 进行构建，推荐使用 **Bun** 加速依赖安装。

```bash
# 克隆仓库并进入根目录
git clone <repository-url>
cd AI-guide

# 安装项目依赖
npm install # 或者 bun install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填写你的 DATABASE_URL 及大模型网关 Key

# 推送数据库 schema 结构并初始化表
npm run db:push

# 启动开发服务器
npm run dev
```
启动后访问 `http://localhost:3000` 即可开始本地开发与交互测试。

### 2. 生产环境部署 (Vercel 示例)
1. 在 Vercel 控制台导入 Git 仓库，设置 `Framework Preset` 为 **Next.js**。
2. 填写相应的环境变量，包括 `DATABASE_URL` (PostgreSQL 实例) 及大模型网关鉴权参数。
3. 部署成功后，Vercel 将根据项目根目录的 `vercel.json` 自动配置每日 17:00 UTC 的定时推送任务 (`/api/notifications/cron/daily-digest`)。

---

## 📦 API 接口

系统集成了完整的 RESTful 接口体系，包含以下主要服务端点：

### 👤 用户与偏好接口
*   `GET /api/user/profile` - 获取或创建当前登录用户的 Profile 详情。
*   `PUT /api/user/preferences` - 更新用户的辅助偏好模式（`normal`/`elder`/`child`）。
*   `GET /api/user/visits` - 读取该游客在景点的历史游览打卡与评分数据。

### 🤖 智能问答与 VR 识别
*   `POST /api/qa/chat` - 发送对话问答，支持普通响应或 Server-Sent Events 流式响应 (`stream: true`)。
*   `POST /api/spots/recognize` - 上传图像，经过大模型多模态分析，输出文物或景点的背景解读。
*   `GET/POST /api/mcp` - 标准 Model Context Protocol (MCP) 端点，暴露出景区内部数据工具包。

### 🗺️ 景点与专属路线
*   `GET /api/spots` - 条件检索景点列表。
*   `GET /api/spots/[id]` - 获取单个景点的坐标、图片、多媒体音频讲解及关联线路。
*   `POST /api/spots/[id]/favorite` - 收藏或取消收藏特定景点。
*   `POST /api/routes/generate` - 根据偏好标签和耗时滑块，一键算路生成个性化行程。

### 📊 B端运营管理
*   `GET /api/admin/analytics` - 拉取景区流量、提问量及情感分析报表。
*   `GET/POST/DELETE /api/admin/knowledge` - RAG 向量知识库参考资料上传及管理。
*   `GET/POST /api/admin/avatar` - 在线微调数字人的服装形象（男/女）、语速及专属引导词。

---

## 👾 项目代码及界面规模

系统设计完备，兼顾工程规范与界面美学：

*   **代码总规模**：约 **8,735 行** TypeScript + TSX 源码文件（不包含 `node_modules` 与构建包缓存）。
*   **核心视图组件**：由 **16 个** 页面级高内聚视图模块构成：
    *   *C端游客页 (11个)*：欢迎导航页、登录控制中心、数字人交互主页、流式问答面板、景点广场、景点详情（支持多图与语音切换）、推荐路线列表、Leaflet 地图跟走详情、VR拍照识别、全局统一检索、个人中心（五合一）。
    *   *B端管理页 (5个)*：数据大屏大仪表盘、景区景点增删改查页、向量知识库管理、数字人参数在线调整、游客诉求情感聚类报表。

---

## 💡 常见问题 (FAQ)

### Q1：智能路线规划功能中的 Leaflet 地图为何需要支持双端自适应？
在移动端游览时，地图作为路线指引的核心载体，需要高频响应单指滑移与手势缩放；而在 PC 端，地图与左侧的行程详情列表呈左右布局。系统使用了 `tailwind` 的 `md:flex-row` 响应式栅格，确保地图视图在各种屏幕分辨率下均可全宽或分屏拉伸，并且交互图层不会发生漂移。

### Q2：适老化模式和童趣模式在 AI 问答上有何底层差异？
当用户在偏好中心选择“适老模式”后，该配置将保存在数据库中。当游客提问时，问答后端 `/api/qa/chat` 会拉取该偏好，自动替换 System Prompt，引导大模型调整生成风格（改用更慢、更和蔼、更直白的语气，控制字数在 150 字以内，并在推荐路线时特意增加对“平坦、无台阶、有休息区”等无障碍词组的偏重）。

### Q3：VR 即拍即识是如何模拟文物检测流程的？
前端通过激光网格雷达对上传的图像进行扫描动画渲染，后端 `/api/spots/recognize` 采用大模型视觉检测接口，提取特征后结合系统内置的“三星堆青铜神树”、“唐彩绘女俑”等知识做相似度校正，从而快速反馈出极具专业感的文化底蕴解读及避坑指南。