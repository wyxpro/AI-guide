# 🤖旅行吧·景区智能导游系统 

[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-%2361DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-%233178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-%2338B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Bun](https://img.shields.io/badge/Bun-1.3.9-black?style=flat&logo=bun)](https://bun.sh/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45.2-%23C5F74F?style=flat)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-%234169E1?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![AWS Bedrock](https://img.shields.io/badge/AWS_Bedrock-AI_Gateway-%23FF9900?style=flat&logo=amazon-aws)](https://aws.amazon.com/bedrock/)
[![MCP](https://img.shields.io/badge/MCP-1.0.0-%234B32C3?style=flat)](https://modelcontextprotocol.io/)

---

## 📋 项目简介

**旅行吧** 是一款针对现代智慧景区的**智能导游系统**。它完美融合了移动互联网、大语言模型与地理信息技术，为游客提供一站式的、个性化的交互体验。

*   **游客端（C端）**：以 7×24 小时在线的 **AI 数字人“小旅”** 为核心，提供个性化的景点语音讲解、智能 RAG 问答、定制化路线规划、历史足迹打卡以及适老化与童趣的多模式人机交互。
*   **管理端（B端）**：为景区运营方提供实时的**数据大屏**，支持知识库文档上传与分词标签管理、数字人形象与音色配置、游客交互情感倾向及满意度数据分析，助力景区实现精细化智慧运营。

---

## 🛠️ 技术栈

整个系统基于高效、稳定且现代的 TypeScript 全栈技术链构建：

| 分类 | 核心技术/依赖 | 关键特性 / 用途 |
| :--- | :--- | :--- |
| **前端核心** | `Next.js 16 (App Router)` + `React 19` | 采用最新的 React 服务端组件与优秀的客户端渲染混合架构 |
| **样式与动画** | `Tailwind CSS v4` + `framer-motion` | 极致流畅的微交互、流畅手势，原生支持安全区域与响应式适配 |
| **数据库/数据层** | `Drizzle ORM` + `postgres.js` + `PostgreSQL` | 强类型、轻量级的数据库交互，支持复杂数据指标聚合查询 |
| **平台级 SDK** | `@eazo/sdk` (React / 核心 / 服务端) | 包含 `auth`（会话安全校验）、`device`（平台适配）、`ai`（大模型网关）、`memory`（用户语义化行为记录）、`notifications`（系统推送） |
| **AI 大模型网关** | `AWS Bedrock` (接入 `deepseek.v3.1`) | 服务端流式交互（Server-Sent Events），配合本地 RAG 知识检索 |
| **智能体协议** | `@modelcontextprotocol/sdk` | 业界领先的 MCP 模型上下文协议，将景区查询封装成 AI 工具集 |
| **运行/包管理** | `Bun` / `npm` + `dotenv` + `eslint` | 使用 Bun 构建速度极快，在本地环境中亦兼容 npm |
---

## 📁 目录结构

以下是项目的核心目录结构，展示了模块化与按端隔离的架构设计：

```text
AI-guide/
├── public/                       # 静态资源 (图片、字体、PWA manifest、ServiceWorker)
├── scripts/                      # 系统运行辅助脚本 (如 Demo 清理工具、SDK 调试脚本)
├── src/
│   ├── app/                      # Next.js 路由与入口
│   │   ├── admin/                # B端 - 管理后台页面
│   │   │   ├── analytics/        # 游客洞察与数据分析
│   │   │   ├── avatar/           # 数字人形象外观音色配置
│   │   │   ├── knowledge/        # 景区知识库 RAG 文档管理
│   │   │   ├── spots/            # 景区景点信息增删改查
│   │   │   └── page.tsx          # 管理大屏主页
│   │   ├── ai-settings/          # C端 - 适老化、童趣模式偏好配置
│   │   ├── api/                  # 后端 API 路由层 (B端与C端公共路由)
│   │   │   ├── admin/            # 后台数据管理 API (spots, knowledge, avatar, analytics)
│   │   │   ├── mcp/              # MCP 智能体接口
│   │   │   ├── notifications/    # 系统通知发布 (测试/Cron 定时触发器)
│   │   │   ├── qa/               # 智能问答流与会话历史
│   │   │   ├── routes/           # 旅行线路 API
│   │   │   ├── spots/            # 景点信息及打卡 API
│   │   │   └── user/             # 用户 Profile 与同步 API
│   │   ├── spots/                # C端 - 景点列表及详情页面
│   │   ├── routes/               # C端 - 游览路线列表及详情页面
│   │   ├── qa/                   # C端 - 智能人机问答界面
│   │   ├── profile/              # C端 - 个人中心 (打卡足迹、收藏、消息通知)
│   │   ├── search/               # C端 - 统一关键词检索
│   │   ├── layout.tsx            # 全局 Root Layout (挂载 Provider 与 Shell)
│   │   └── page.tsx              # 游客端首页 (AI 数字人交互中心)
│   ├── components/               # 可复用 React 组件
│   │   ├── layout/               # 页面骨架 (LayoutShell, SidebarNav, BottomTabBar)
│   │   ├── screens/              # 页面级高内聚视图组件 (HomeScreen, QAScreen 等 16 个)
│   │   ├── ui/                   # 基础 UI 原生原子组件 (弹窗、卡片、Toast)
│   │   ├── user-profile/         # 用户身份显示与自动同步组件
│   │   └── notifications/        # 消息推送开关与订阅控制组件
│   ├── lib/                      # 基础逻辑库
│   │   ├── api/                  # 封装的 Axios/Fetch 客户端 (自动注入 Session 签名)
│   │   ├── auth/                 # 服务端 Auth 守卫 (requireAuth)
│   │   ├── db/                   # 数据库连接、Drizzle 实体定义与查询
│   │   │   ├── schema/           # 表结构 (users, admin, spots, routes, user-data)
│   │   │   └── queries/          # 封装 of CRUD 核心查询逻辑
│   │   └── mcp/                  # MCP 核心逻辑与智能体工具注册
│   └── utils/                    # 工具函数 (Tailwind 类合并 helper 等)
├── tsconfig.json                 # TypeScript 强类型配置文件
├── vercel.json                   # 部署策略与 Cron 定时提醒配置
└── package.json                  # 项目依赖与启动脚本
```

---

## ⚡ 核心功能模块和工作流程

### 1. 景区双端功能模块

#### 🙋 游客端 (C端)
*   **数字人互动主页**：首页展示动态数字人形象，模拟眨眼与说话动作。支持点击快速指令（如“适合老人路线”、“门票价格”），小旅自动发声讲解。
*   **混合智能 RAG 问答**：整合景点详情与后台知识库，智能识别用户问题并匹配最佳答案，以 SSE 流式格式极速回传游客，确保互动无延迟。
*   **路线与景点游览**：显示推荐路线（提供耗时、难度与景点数量标签）。进入景点详情后可播放语音讲解，记录用户打卡，并进行星级评分。
*   **适老化与多模式体验**：提供标准、适老和儿童三种模式。适老模式自动放大字号、采用更慢更温和的措辞，并优先推荐无障碍平坦路线；儿童模式则将景点知识以趣味童话故事的形式趣味讲授。
*   **全新登录中心**：提供支持密码登录及验证码登录的独立全屏中心，配置测试账号快捷一键登录（管理员/普通游客），支持将登录状态在前后端统一维护。
*   **个人中心（我的）**：提供统计展示和自适应显示，集成了已登录和未登录状态下的交互。内置消息通知弹窗，支持展示天气动态及运营通知，以及“退出当前登录”功能。

#### 📊 管理端 (B端)
*   **实时数据大屏**：通过精致的可视化仪表盘展示今日总客流、会话提问量、游客满意度评分及热门打卡景点排行。
*   **RAG 知识库管理**：支持上传文本或政策文件，定义标签。AI 系统会自动匹配这些参考上下文，确保回答不偏离景区事实。
*   **数字人个性配置**：在线调节数字人的基础设定、服装形象、音色特点（温暖/专业/活泼）、语速、音调以及专属首句欢迎词。
*   **情感倾向量化分析**：对游客提出的问题进行后台语义聚类与情感打分（正面/中性/负面），以便管理层实时掌控游客舆情。

---

### 2. 典型核心工作流

#### A. AI 数字人智能问答工作流 (RAG + SSE)
```text
[游客提问] ──► [请求 /api/qa/chat] ──► [读取用户模式: 适老/儿童/正常]
                                                │
[流式响应] ◄── [DeepSeek-V3.1 推理] ◄── [构建 Prompt 模板] ◄── [从数据库检索前3条相关知识]
```

#### B. 游客行为足迹与智能记忆同步流 (Gum Service)
```text
[用户完成打卡/收藏] ──► [写入本地 PostgreSQL 数据库]
                              │
                    [异步调用 memory.reportAction()]
                              │
                    [上传至 Eazo 语义记忆 Gum 服务] ──► [为游客下一次旅行提供个性化上下文支持]
```

#### C. MCP 智能体代理协同流 (Model Context Protocol)
```text
[智能体 Agent] ──► [带 Token 请求 /api/mcp] ──► [McpServer 解析工具调用]
                                                        │
[AI 生成回复] ◄── [返回 JSON 格式结果] ◄── [触发对应 Tool (如 get-spot/list-routes)]
```

---

## ⚙️ 部署指南

### 1. 本地开发调试
请确保本地已安装 **Node.js (v22+)**，如安装了 **Bun** 体验更佳。

```bash
# 1. 克隆并进入项目根目录
cd AI-guide

# 2. 安装项目依赖
npm install    # 或使用 bun install

# 3. 配置环境变量
# 复制配置文件模板
cp .env.example .env
# 编辑 .env 文件，填写你的 EAZO_PRIVATE_KEY 与 DATABASE_URL

# 4. 同步数据库结构
npm run db:push

# 5. 启动开发服务器
npm run dev    # 或使用 bun dev
```
打开浏览器访问 `http://localhost:3000` 即可开始开发。

### 2. 生产环境部署 (Vercel)
本项目完美适配 Serverless 部署：
1. 在 Vercel 后台导入该 Git 仓库。
2. 配置以下环境变量：
   * `NEXT_PUBLIC_EAZO_APP_ID`: 你的 Eazo 应用 ID。
   * `EAZO_APP_ID`: 你的 Eazo 应用 ID。
   * `EAZO_PRIVATE_KEY`: Eazo 开发者私钥（16进制，64位字符）。
   * `DATABASE_URL`: PostgreSQL 数据库连接 URI。
   * `CRON_SECRET`: Vercel Cron 定时任务鉴权秘钥。
3. 部署成功后，Vercel 将会根据 `vercel.json` 自动配置每日 17:00 UTC 的定时推送任务 (`/api/notifications/cron/daily-digest`)。

---

## 📦 API 接口

系统包含游客端、管理端及辅助系统的完整 RESTful API 设计：

### 👤 用户与认证
*   `GET /api/user/profile` - 获取当前登录用户的 Profile 详情，触发数据库自动 upsert。

### 🤖 智能问答与 MCP
*   `POST /api/qa/chat` - 发送提问。支持普通 JSON 响应及 Server-Sent Events 流式响应（请求中带 `stream: true`）。
*   `GET/POST/DELETE /api/mcp` - 标准 Model Context Protocol 端点，向 AI 助手暴露景区查询工具。

### 🏞️ 景点与路线
*   `GET /api/spots` - 检索景点列表，支持按分类筛选。
*   `GET /api/spots/[id]` - 获取景点详细信息、音导地址、经纬度与推荐关联线路。
*   `POST /api/spots/[id]/favorite` - 收藏/取消收藏景点。
*   `POST /api/spots/[id]/visit` - 登记游客在景点的参观打卡记录，并可录入星级评分与感悟。
*   `GET /api/routes` - 检索推荐线路列表。
*   `GET /api/routes/[id]` - 线路详情，包括途径所有景点的时序列表。

### 📈 B端运营管理
*   `GET /api/admin/analytics` - 读取景区历史综合数据报表。
*   `GET /api/admin/analytics/hot-spots` - 热门打卡景点比率分析。
*   `GET /api/admin/analytics/wordcloud` - 游客问询高频词云分析。
*   `GET/POST/DELETE /api/admin/knowledge` - 景区知识库文档管理。
*   `GET/POST /api/admin/avatar` - 数字人语音配置、语速、音调及欢迎词修改。
*   `GET/POST/PATCH/DELETE /api/admin/spots` - 后台景点数据维护。

---

## 👾 项目代码及界面规模

系统规模完备，界面精致美观，代码编写严谨：

*   **代码总行数**：**8,735 行** (TypeScript + TSX + CSS，不包含依赖与打包结果)
*   **源码文件总数**：**109 个** 源文件
*   **页面及屏幕视图组件数**：**17 个** 核心视图及路由模块
    *   **游客端视图 (10个)**：欢迎官网页、全屏独立登录中心、首页数字人交互、问答面板、景点广场、景点详情、推荐线路、线路详情、全局检索、个人中心。
    *   **管理后台视图 (5个)**：管理大屏、景区景点录入、知识库文件管理、数字人参数在线调整、游客诉求情感报表。
    *   **公共基础视图 (2个)**：页面布局外壳、自适应导航骨架。

---

## 💡 常见问题

### Q1：手机移动端和普通浏览器之间的数据与登录状态是如何保持同步的？
系统使用了 `@eazo/sdk` 统一的 Token 流。在 Web 端，用户通过内置 UI 快捷登录；在手机 App 容器内，SDK 会截获 WebView 的握手协议自动交换登录态。两者在载入时均会触发 `/api/user/profile`，自动将最新的身份同步至项目的 PostgreSQL 用户表中，实现多端一致性。

### Q2：适老化模式和普通模式在 AI 问答上有何底层差异？
当用户在偏好中心选择“适老模式”后，该配置将保存在数据库中。当游客提问时，问答后端 `/api/qa/chat` 会拉取该偏好，自动替换 System Prompt，引导大模型调整生成风格（改用更慢、更和蔼、更直白的语气，控制字数在 150 字以内，并在推荐路线时特意增加对“平坦、无台阶、有休息区”等无障碍词组的偏重）。