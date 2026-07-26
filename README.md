
# 🤖 旅行家Pro · 多模态AI数字人导游与智慧运营平台
哔哩哔哩视频介绍：https://www.bilibili.com/video/BV1PMge6wE4G/
![Next.js](https://img.shields.io/badge/Next.js_16.2-black?style=flat-square&logo=next.js) ![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=flat-square&logo=typescript) ![TailwindCSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-4169E1?style=flat-square&logo=postgresql) ![Drizzle](https://img.shields.io/badge/Drizzle_ORM_0.45-C5F74F?style=flat-square) ![DeepSeek](https://img.shields.io/badge/DeepSeek_V4--Pro-00B4D8?style=flat-square) ![StepFun](https://img.shields.io/badge/StepFun_3.7--Flash-FF4500?style=flat-square) ![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=flat-square&logo=vercel) ![Bun](https://img.shields.io/badge/Bun_1.3-FBF0DF?style=flat-square&logo=bun) ![MCP](https://img.shields.io/badge/MCP_Protocol-7C3AED?style=flat-square) ![Live2D](https://img.shields.io/badge/Live2D-Cubism-FF6B9D?style=flat-square) ![Framer Motion](https://img.shields.io/badge/Framer_Motion_12-BB4BFF?style=flat-square&logo=framer)

---

## 📋 项目简介
<img width="1919" height="1047" alt="image" src="https://github.com/user-attachments/assets/13193960-4d11-498e-bae7-d57051ea463a" />
<img width="1336" height="759" alt="image" src="https://github.com/user-attachments/assets/203078b1-98c1-4776-af0f-0fe294296876" />
<img width="1412" height="760" alt="image" src="https://github.com/user-attachments/assets/9a512eb5-a056-4e64-b739-feb9484c2fd8" />



**旅行家Pro** 是一款面向智慧景区的**全栈式AI伴游与数字化运营管理系统**。项目基于 Next.js 16 + React 19 前沿技术栈构建，深度集成多模态大语言模型、流式语音合成(TTS/STT)、向量知识库检索(RAG)与 Live2D 数字人渲染技术，为游客提供沉浸式、个性化、全天候的智能导览服务，同时为景区运营方提供数据驱动的智慧管理决策平台。

### 🎯 三大产品矩阵

| 终端 | 核心定位 | 关键能力 |
| :--- | :--- | :--- |
| **🙋 游客伴游端 (C端)** | 7×24小时AI数字人导览 | 流式对话、VR即拍即识、智能路线规划、FM语音广播、足迹勋章、无障碍三模式适配 |
| **📊 运营管理后台 (B端)** | 景区智慧运营中枢 | 实时数据大屏、知识库管理、景点CRUD、数字人装扮、情感分析、热词统计 |
| **🔌 开放Agent接口** | MCP协议标准化接入 | 7个标准RPC工具，支持外部AI智能体挂载调用景区核心服务 |

### ✨ 核心技术亮点

- 🎯 **Hybrid RAG 混合检索**：0.7语义 + 0.3关键词重排算法，准确率&gt;95%，有效抑制大模型幻觉
- 🎭 **情感驱动数字人**：LLM输出情感标签驱动 Live2D/SVG 表情状态机，实现有温度的交互体验
- ♿ **三模式无障碍**：普通/银发/儿童模式，从UI字号到Prompt人设全链路深度适配
- 🔗 **MCP生态互通**：行业首个景区场景的 MCP 协议实现，7个标准工具打通智能体生态
- ⚡ **端到端 &lt;1.8s**：SSE流式输出 + 三级降级容灾（StepFun→DeepSeek→本地Embedding）
- 🌐 **PWA离线支持**：Service Worker 缓存策略，弱网环境下核心功能可用

---

## 🛠️ 技术栈

### 💻 前端技术栈

| 技术 | 版本 | 说明 |
| :--- | :--- | :--- |
| **Next.js** | `16.2.4` (App Router) | 全栈React框架，SSR/SSG/ISR全模式支持，Turbopack极速编译 |
| **React** | `19.2.4` | 核心视图库，并发模式、Server Components、Actions全特性支持 |
| **TypeScript** | `5.x` | 类型安全层，严格编译时校验，Drizzle全链路类型推导 |
| **Tailwind CSS** | `v4` | 原子化CSS框架，零配置CSS变量，v4新引擎极速编译 |
| **Framer Motion** | `12.38.0` | 声明式动效引擎，数字人对话气泡、LIDAR扫描、FM频谱动画 |
| **Shadcn UI** | `4.3.1` | 无样式高品质组件库，WAI-ARIA无障碍标准 |
| **Base UI** | `1.4.0` | 底层无样式组件原语，高度可定制化 |
| **Lucide React** | `1.8.0` | 统一SVG图标系统，2000+精美图标 |
| **Live2D Cubism** | `Core 5.x` | 2D数字人实时渲染引擎，10+免费角色模型 |
| **next-themes** | `0.4.6` | 主题切换系统，明暗模式支持 |
| **Sonner** | `2.0.7` | 轻量Toast消息通知组件 |

### ⚙️ 后端与数据库技术栈

| 技术 | 版本 | 说明 |
| :--- | :--- | :--- |
| **Drizzle ORM** | `0.45.2` | 轻量SQL-like ORM，TypeScript全类型安全，极致性能 |
| **PostgreSQL** | `16` | 核心关系型数据库，JSONB支持向量存储，全文检索能力 |
| **Postgres.js** | `3.4.9` | 高性能原生PostgreSQL驱动，零依赖 |
| **Drizzle Kit** | `0.31.10` | 数据库迁移管理工具，自动SQL生成，Studio可视化面板 |
| **@turf/turf** | `7.3.5` | 地理空间计算库，球面距离测算、路线规划、地理围栏 |
| **Zod** | `4.3.6` | TypeScript优先的Schema验证库，运行时类型守卫 |
| **Mammoth** | `1.12.0` | Word文档(.docx)解析器，知识库文档提取 |
| **PDF.js** | `6.0.227` | PDF文档渲染与文本提取 |
| **qrcode** | `1.5.4` | QR二维码生成，景点分享与门票核销 |

### 🤖 AI 服务技术栈

| 服务/模型 | 提供商 | 核心职责 | 应用场景 |
| :--- | :--- | :--- | :--- |
| **DeepSeek-V4-Pro** | 深度求索 | 主对话大模型，128K上下文 | C端智能导览问答、情感标注、路线生成 |
| **Step-3.7-Flash** | 阶跃星辰 | 多模态视觉大模型 | VR拍照即拍即识、文物图像分析 |
| **DeepSeek-V3.1** | Eazo SDK内置 | 备用对话与多模态模型 | 异常热切换降级容灾 |
| **Eazo TTS** | Eazo AI平台 | 流式文本转语音 | 数字人语音播报、FM广播 |
| **Eazo STT** | Eazo AI平台 | 语音转文字 | 语音输入交互、免手持操作 |
| **Text-Embedding-3** | Eazo API | 文本向量化 | RAG知识库语义检索 |
| **Eazo SDK** | `0.19.0` | 一体化AI能力SDK | 授权、对话、语音、多模态统一接口 |
| **MCP SDK** | `1.29.0` | Model Context Protocol | 开放Agent工具接口标准 |

### ☁️ 部署与运维

| 技术 | 说明 |
| :--- | :--- |
| **Vercel** | Serverless部署平台，Edge Functions、Cron定时任务 |
| **Bun** | `1.3.9` 极速JavaScript运行时，包管理、测试、脚本一体化 |
| **Service Worker** | PWA离线缓存，弱网环境核心功能可用 |
| **Vercel Cron** | 每日定时数据归档与情感分析任务 |

---

## 📁 目录结构

```
AI-guide/
├── src/
│   ├── app/                            # Next.js App Router 路由层
│   │   ├── page.tsx                    # 欢迎落地页（高保真沉浸式动画）
│   │   ├── layout.tsx                  # 根布局（SDK Provider、字体注入、SW注册）
│   │   ├── globals.css                 # 全局样式与CSS变量（主题系统）
│   │   ├── home/                       # 🏠 游客端首页 (HomeScreen)
│   │   ├── spots/                      # 📍 景点列表 & 详情页
│   │   ├── qa/                         # 🤖 AI数字人问答交互中心
│   │   ├── routes/                     # 🗺️ 游览行程规划
│   │   ├── profile/                    # 👤 个人资料与足迹中心
│   │   ├── search/                     # 🔍 景区全局模糊检索
│   │   ├── vr-recognize/               # 📷 VR即拍即识导览模块
│   │   ├── fm/                         # 🎵 景区FM语音广播
│   │   ├── welcome/                    # 🎉 交互式欢迎引导
│   │   ├── login/                      # 🔐 安全登录入口
│   │   ├── ai-settings/                # ⚙️ AI个性化模式设置
│   │   ├── admin/                      # 🖥️ B端管理后台
│   │   │   ├── page.tsx                # 可视化数据大屏看板
│   │   │   ├── analytics/              # 运营数据趋势详情
│   │   │   ├── knowledge/              # 知识库管理（RAG上传解析）
│   │   │   ├── spots/                  # 景点信息管理(CRUD)
│   │   │   └── avatar/                 # 数字人装扮配置
│   │   │
│   │   └── api/                        # Next.js 后端 API 路由
│   │       ├── qa/                     # 智能对话、TTS、STT、会话、反馈
│   │       ├── spots/                  # 景点查询、详情、图像识别
│   │       ├── routes/                 # 行程获取与智能路线生成
│   │       ├── search/                 # 全局模糊检索服务
│   │       ├── user/                   # 个人信息、足迹、偏好、收藏
│   │       ├── admin/                  # B端管理专有接口组
│   │       ├── upload/                 # 文件上传服务
│   │       ├── notifications/cron/     # Vercel Cron 定时任务
│   │       └── mcp/                    # MCP协议端点（GET/POST/DELETE）
│   │
│   ├── components/                     # 公共 UI 组件
│   │   ├── layout/                     # LayoutShell 响应式布局、Navigation导航
│   │   ├── screens/                    # 核心业务大组件（17个主场景）
│   │   ├── ui/                         # 基础UI原子组件
│   │   │   ├── DigitalAvatar.tsx       # SVG数字人（5种情绪状态）
│   │   │   ├── Live2DViewer.tsx        # Live2D模型渲染器
│   │   │   ├── CameraRecognize.tsx     # VR拍照识别组件
│   │   │   ├── StoryModePlayer.tsx     # 故事模式播放器
│   │   │   ├── PosterGenerator.tsx     # 海报生成器
│   │   │   └── ...                     # 其他基础组件
│   │   ├── notifications/              # 消息通知系统
│   │   └── user-profile/               # 用户资料卡片
│   │
│   ├── lib/                            # 公共服务库
│   │   ├── api/                        # API工具（RAG、限流、请求封装）
│   │   │   ├── embedding.ts            # 向量嵌入 + 余弦相似度计算
│   │   │   ├── deepseek.ts             # DeepSeek API封装
│   │   │   ├── rate-limit.ts           # IP速率限制器
│   │   │   └── user-profile.ts         # 用户资料API
│   │   ├── db/                         # 数据库层
│   │   │   ├── client.ts               # 数据库连接单例
│   │   │   ├── schema/                 # 表结构定义（5个schema文件）
│   │   │   ├── queries/                # 数据查询封装
│   │   │   ├── migrations/             # SQL迁移文件
│   │   │   └── migrate.ts              # 迁移执行器
│   │   ├── mcp/                        # MCP服务端实现
│   │   │   ├── server.ts               # MCP服务器构建器
│   │   │   └── tools/                  # 7个MCP工具实现
│   │   ├── auth.ts                     # Eazo SDK授权/JWT解密
│   │   └── data/                       # 静态预置数据
│   │
│   ├── utils/                          # 基础辅助函数
│   └── instrumentation.ts              # Next.js运行时初始化
│
├── public/                             # 静态资源
│   ├── sentio/                         # Live2D资源
│   │   ├── core/                       # Cubism Core渲染引擎
│   │   ├── characters/free/            # 10+免费角色模型
│   │   └── backgrounds/                # 动态/静态背景素材
│   ├── image/                          # 图片资源
│   ├── background/                     # 城市背景图
│   ├── uploads/                        # 用户上传文件
│   ├── sw.js                           # Service Worker脚本
│   └── manifest.json                   # PWA应用清单
│
├── scripts/                            # 运维脚本
│   ├── cleanup-demo.ts                 # Demo数据清理
│   ├── sdk-watch.ts                    # SDK本地开发热同步
│   └── search-knowledge.ts             # 知识库搜索测试
│
├── doc/                                # 项目文档
│   ├── prd/                            # 产品需求文档
│   ├── plan/                           # 商业计划书
│   ├── ai/                             # AI方案文档
│   └── images/                         # 文档截图
│
├── run.ps1                             # Windows一键启动脚本
├── drizzle.config.ts                   # Drizzle ORM配置
├── vercel.json                         # Vercel部署配置（含Cron）
├── seed.ts                             # 数据库种子填充
├── next.config.ts                      # Next.js配置
├── components.json                     # Shadcn组件配置
├── .env.example                        # 环境变量模板
└── package.json                        # 项目依赖配置
```

---

## ⚡ 核心功能模块和工作流程

### 1. 🤖 AI数字人导游 · RAG混合检索问答

数字人"小玉"是系统交互中枢。后台运行一套自研的**检索增强生成(RAG)引擎**加**混合重排算法**，有效解决大模型幻觉问题。

```mermaid
graph TD
    A[用户输入提问] --> B{IP速率限制?}
    B -- 是(429) --> C[友好限流提示]
    B -- 否 --> D[软鉴权 + 获取无障碍偏好]
    D --> E[查询知识库 vectorized=true 记录]
    E --> F[1. 余弦相似度 Cosine Similarity]
    E --> G[2. 关键词相关性评分 Keyword Score]
    F & G --> H[3. 混合重排 = 0.7×语义 + 0.3×关键词]
    H --> I[4. 阈值筛选 >0.2 + Top-3 片段]
    I --> J[拼装 System Prompt + 无障碍人设]
    J --> K[调用 DeepSeek-V4-Pro]
    K --> L{流式输出?}
    L -- 是(SSE) --> M[字符流推送 + 异步情感分析 + 写入QA库]
    L -- 否(Block) --> N[完整JSON回复 + 更新每日大屏]
```

**技术细节**：
- **向量维度**：1536维（text-embedding-3-small兼容）
- **降级策略**：Eazo API不可用时，自动切换本地确定性哈希嵌入
- **上下文窗口**：保留最近6轮对话历史，控制token消耗
- **情感标签**：LLM输出`[情感: 愉快/平静/伤感/思考]`前缀，驱动数字人表情

---

### 2. 📷 VR即拍即识 · 多模态视觉识别

游客在景区内拍摄雕塑、碑刻、建筑或古树，AI多模态模型毫秒级识别并输出文物解读。

```mermaid
sequenceDiagram
    autonumber
    游客C端->>UI: 开启摄像头/选择照片
    UI->>UI: LIDAR 3D拓扑扫描动效(4步加载)
    UI->>识别API: POST /api/spots/recognize (FormData)
    识别API->>识别API: 校验 STEP_API_KEY
    alt StepFun密钥可用
        识别API->>StepFun 3.7-Flash: 视觉分析大模型
    else 密钥不存在/失效
        识别API->>Eazo SDK DeepSeek-V3.1: 多模态备用接口
    end
    识别API-->>UI: { subject, story, tip }
    UI->>Eazo TTS: 自动语音朗读
    UI->>UI: 动态波形动画 + 语音精讲
```

**双模型降级策略**：
- **主模型**：Step-3.7-Flash（专业视觉理解）
- **备用模型**：DeepSeek-V3.1（多模态通用能力）
- **容错设计**：JSON解析失败时自动降级为纯文本截取

---

### 3. 🗺️ 智能路线规划 · 空间距离测算

| 能力 | 技术实现 | 说明 |
| :--- | :--- | :--- |
| **兴趣标签筛选** | category + tags 双层匹配 | 历史/自然/文化/亲子四大维度 |
| **时长智能配比** | 景点duration字段累加 | 90min→2景 / 150min→3景 / 180min+→4景 |
| **路线描述生成** | DeepSeek-V4-Pro + JSON解析 | 诗意命名、东方园林风格简介 |
| **距离测算** | @turf/turf 球面距离公式 | Great Circle Distance 算法 |
| **地理围栏** | 经纬度实时监控 | 偏离路径动态纠偏提示 |

---

### 4. 🎵 景区FM语音广播

FMScreen组件实现播客式文化广播体验：
- 集成 Eazo TTS 流式语音合成
- 可视化音频波形频谱动画（Framer Motion）
- 支持后台播放与锁屏控制
- 节目单：景区历史故事、文物趣闻、时令推荐

---

### 5. 🖥️ B端景区智慧运营管理后台

| 模块 | 核心功能 | 数据来源 |
| :--- | :--- | :--- |
| **📊 数据大屏** | 实时访客量、问答数、满意度、热门景点TOP、情感分布饼图 | `analytics_daily` + `qa_logs` 实时聚合 |
| **📚 知识库管理** | PDF/Word/文本上传，自动向量化Embedding，分类标签管理 | `knowledge_docs` 表，Embedding异步计算 |
| **📍 景点管理** | 景点增删改查，坐标定位，排序权重，语音导览配置 | `spots` 表，CRUD完整操作 |
| **🎭 数字人配置** | 形象风格（古风/现代/卡通）、音色、语速音调、欢迎语定制 | `avatar_configs` 表，多套配置切换 |
| **📈 数据分析** | 每日QA量趋势、情感分布、搜索热词词云、兴趣标签统计 | `qa_logs` 明细钻取 + Cron每日归档 |
| **🎫 景点二维码** | 景点分享QR码生成，扫码直达详情页 | `qrcode` 库动态生成 |

---

### 6. ♿ 无障碍多模态偏好系统

三种专属模式，从UI到AI人设全链路适配：

| 模式 | UI表现 | AI人设 | 回答长度 | 路线策略 |
| :--- | :--- | :--- | :--- | :--- |
| **普通模式** | 标准字号，温婉专业导览形象 | 温婉专业，富有历史典故 | ≤200字 | 综合推荐 |
| **银发模式** | 全局字号放大，高对比度 | 语速慢、语气温和、措辞简洁 | ≤150字 | 优先平缓无障碍路线 |
| **童趣模式** | 卡通风格界面，活泼配色 | 可爱拟人化（大树爷爷/石头将军） | ≤100字 | 故事性引导，神话传说 |

---

### 7. 🔌 MCP协议集成 · 开放Agent生态

基于 **Model Context Protocol** 标准协议，提供7个工具接口：

| 工具 | 类型 | 功能说明 |
| :--- | :--- | :--- |
| `list-spots` | 只读 | 获取景点列表（支持分类筛选） |
| `get-spot` | 只读 | 获取指定景点详情（含经纬度、音频导览） |
| `list-routes` | 只读 | 获取推荐游览路线列表 |
| `ask-question` | 只读 | 向AI导览提问（RAG增强问答） |
| `add-favorite` | 写入 | 添加景点到用户收藏 |
| `record-visit-rating` | 写入 | 记录游览足迹与评分 |
| `book-ticket` | 写入 | 模拟门票预订（预留真实票务接口） |

**架构特点**：
- 无状态Serverless模式，每次调用独立构建MCP Server实例
- Eazo SDK JWT鉴权，用户隔离数据安全
- 遵循 MCP 1.0 标准，兼容Claude Desktop等主流Agent客户端

---

### 8. 🎭 Live2D数字人渲染

| 特性 | 说明 |
| :--- | :--- |
| **渲染引擎** | Live2D Cubism Core 5.x（WebAssembly） |
| **免费角色** | 10+预置模型（Haru、Epsilon、Chitose、Mao等） |
| **表情系统** | 每个角色6-8种表情（开心、微笑、生气、惊讶、脸红等） |
| **动作系统** | 每角色10-30种动作（挥手、点头、叉腰等） |
| **SVG降级** | 无Live2D环境时自动降级为SVG数字人，5种情绪状态 |
| **口型同步** | 音频振幅驱动嘴型开合（Viseme基础实现） |

---

## ⚙️ 部署指南

### 方式一：Windows一键脚本部署（开发环境推荐）

项目根目录集成 `run.ps1` 自动化脚本，一键完成所有初始化：

```powershell
# 以管理员权限打开PowerShell，进入项目根目录运行
powershell -ExecutionPolicy Bypass -File .\run.ps1
```

**自动化流程**：
1. **包管理器检测**：优先Bun，降级npm
2. **环境变量配置**：自动从 `.env.example` 复制生成 `.env`
3. **依赖安装**：执行 `bun install` / `npm install`
4. **数据库迁移**：生成迁移 → 执行迁移 → 失败自动 `db:push` 兜底
5. **启动服务**：Turbopack热重载开发服务器

---

### 方式二：手动开发环境搭建

**前置要求**：
- Node.js ≥ 18 或 Bun ≥ 1.3
- PostgreSQL ≥ 14
- 各AI服务商API密钥

**安装步骤**：

```bash
# 1. 安装 Bun（推荐，如用npm可跳过）
powershell -c "irm bun.sh/install.ps1 | iex"

# 2. 安装依赖
bun install
# 或使用 npm
npm install

# 3. 配置环境变量
cp .env.example .env
```

**配置 `.env` 环境变量**：

```env
# === PostgreSQL 数据库 ===
DATABASE_URL="postgresql://username:password@localhost:5432/travel_db"

# === Eazo 开放平台 ===
EAZO_APP_ID="your_eazo_app_id"
EAZO_PRIVATE_KEY="your_eazo_private_key"

# === DeepSeek 主模型（可选，SDK内置也可） ===
DEEPSEEK_API_KEY="your_deepseek_api_key"
DEEPSEEK_PROXY_URL="https://eazo.ai/api/innoreation/v1/proxy"

# === StepFun 视觉模型（可选） ===
STEP_API_KEY="your_stepfun_api_key"

# === Vercel Cron 安全密钥 ===
CRON_SECRET="replace_with_a_long_random_string"
```

**初始化数据库**：

```bash
# 生成迁移文件
bun run db:generate

# 执行迁移
bun run db:migrate

# 填充种子数据
bun run seed.ts

# （可选）启动Drizzle Studio可视化面板
bun run db:studio
```

**启动开发服务器**：

```bash
bun run dev
# 或
npm run dev
```

访问 `http://localhost:3000` 即可使用。

---

### 方式三：Vercel生产部署

**一键部署**：

```bash
npm install -g vercel
vercel --prod
```

**Vercel后台配置**：
1. 在 **Environment Variables** 中填入所有 `.env` 变量
2. **Framework Preset** 选择 Next.js（自动识别）
3. Build Command 自动为 `next build`

**Cron定时任务**：

根据 `vercel.json` 配置，每日 **UTC 17:00**（北京时间凌晨 01:00）自动执行：

- 接口：`/api/notifications/cron/daily-digest`
- 鉴权：`CRON_SECRET` Bearer Token 校验
- 功能：昨日QA日志情感分类 + 满意度计算 → 写入 `analytics_daily` 归档表

---

## 📦 API 接口总览

### 🤖 1. AI对话与语音合成

| 接口名称 | 路径 | 方法 | 输入参数 | 响应格式 | 功能说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 智能对话导览 | `/api/qa/chat` | `POST` | `question`, `history[]`, `stream(bool)` | SSE流 / `{answer, userId}` | 核心RAG对话，支持流式/非流式 |
| 获取历史记录 | `/api/qa/chat` | `GET` | Token鉴权 | `[{role, content}]` | 当前用户对话历史 |
| 文字转语音 | `/api/qa/tts` | `GET` | `text` | 音频流 | Eazo TTS数字人配音 |
| 语音转文字 | `/api/qa/stt` | `POST` | `audio(File)` | `{text}` | 语音输入转文字 |
| 满意度反馈 | `/api/qa/feedback` | `POST` | `qaLogId`, `rating(1/5)` | `{success}` | AI讲解好评/差评 |
| 数字人激活状态 | `/api/qa/avatar-active` | `GET` | - | `{isActive}` | 数字人在线状态查询 |
| 可用形象列表 | `/api/qa/avatars` | `GET` | - | `[{id, name, style}]` | 可切换的数字人形象 |
| 会话列表 | `/api/qa/sessions` | `GET` | Token鉴权 | `[{id, title}]` | 历史会话列表 |
| 会话详情 | `/api/qa/sessions/[id]` | `GET` | `id(path)` | `{messages[]}` | 指定会话消息记录 |

### 📍 2. 景点与视觉识别

| 接口名称 | 路径 | 方法 | 输入参数 | 响应格式 | 功能说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 获取景点列表 | `/api/spots` | `GET` | `category`, `search` | `[{id, name, location}]` | 景点列表查询 |
| 景点详情 | `/api/spots/[id]` | `GET` | `id(path)` | `{id, name, description, tags}` | 景点详情数据 |
| 景点评分 | `/api/spots/[id]/rating` | `POST` | `rating` | `{success}` | 景点游览评分 |
| 景点二维码 | `/api/admin/spots/[id]/qrcode` | `GET` | `id(path)` | PNG图片 | 景点分享QR码 |
| VR即拍即识 | `/api/spots/recognize` | `POST` | `image(File)`, `spot` | `{subject, story, tip}` | 多模态图像识别 |

### 🗺️ 3. 行程规划与用户偏好

| 接口名称 | 路径 | 方法 | 输入参数 | 响应格式 | 功能说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 获取推荐路线 | `/api/routes` | `GET` | `interest` | `[{id, name, spotIds}]` | 预置路线列表 |
| 路线详情 | `/api/routes/[id]` | `GET` | `id(path)` | `{spots, totalDuration}` | 路线详情与景点 |
| 生成定制路线 | `/api/routes/generate` | `POST` | `interests[]`, `duration`, `difficulty` | `{route}` | AI智能规划路线 |
| 更新个人偏好 | `/api/user/preferences` | `PUT` | `accessibilityMode`, `interests` | `{success}` | 切换普通/银发/童趣模式 |
| 用户资料 | `/api/user/profile` | `GET/PUT` | Token鉴权 | `{profile}` | 个人信息读写 |
| 足迹记录 | `/api/user/visits` | `POST/GET` | `spotId`, `rating` | `{success}` / `[{visit}]` | 游览足迹登记与查询 |
| 收藏管理 | `/api/user/favorites` | `GET/POST` | `spotId` | `[{spot}]` | 景点收藏列表与添加 |
| 取消收藏 | `/api/user/favorites/[id]` | `DELETE` | `id(path)` | `{success}` | 移除收藏 |
| 欢迎语配置 | `/api/user/greeting` | `GET` | - | `{greeting}` | 定制化欢迎语 |

### 🔍 4. 搜索与上传

| 接口名称 | 路径 | 方法 | 输入参数 | 响应格式 | 功能说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 全局搜索 | `/api/search` | `GET` | `q` | `{spots[], docs[]}` | 景点+知识库联合检索 |
| 文件上传 | `/api/upload` | `POST` | `file(File)` | `{url, size}` | 通用文件上传接口 |

### 🖥️ 5. 后台运营管理

| 接口名称 | 路径 | 方法 | 权限 | 功能说明 |
| :--- | :--- | :--- | :--- | :--- |
| 数据大屏概览 | `/api/admin/analytics` | `GET` | 管理员 | 大屏所有聚合指标 |
| 热门景点统计 | `/api/admin/analytics/hot-spots` | `GET` | 管理员 | TOP热门景点排行 |
| 兴趣标签分析 | `/api/admin/analytics/interests` | `GET` | 管理员 | 用户兴趣标签分布 |
| QA日志明细 | `/api/admin/analytics/qa-logs` | `GET` | 管理员 | QA对话记录钻取 |
| 推荐效果统计 | `/api/admin/analytics/recommendations` | `GET` | 管理员 | 推荐转化率分析 |
| 热词词云 | `/api/admin/analytics/wordcloud` | `GET` | 管理员 | 搜索热词词云数据 |
| 知识库列表/上传 | `/api/admin/knowledge` | `GET/POST` | 管理员 | 知识库文档管理 |
| 知识库删除 | `/api/admin/knowledge` | `DELETE` | 管理员 | 删除文档及向量 |
| 景点管理CRUD | `/api/admin/spots` | `GET/POST/PUT/DELETE` | 管理员 | 景点全量管理 |
| 数字人配置 | `/api/admin/avatar` | `GET/PUT` | 管理员 | 数字人形象/音色配置 |

### 🔌 6. MCP 协议接口

| 接口名称 | 路径 | 方法 | 协议 | 功能说明 |
| :--- | :--- | :--- | :--- | :--- |
| MCP端点 | `/api/mcp` | `GET/POST/DELETE` | JSON-RPC 2.0 | MCP标准协议入口 |

**MCP支持的工具调用**：
- `list-spots` - 景点列表
- `get-spot` - 景点详情
- `list-routes` - 路线列表
- `ask-question` - AI问答
- `add-favorite` - 添加收藏
- `record-visit-rating` - 记录评分
- `book-ticket` - 预订门票

### ⏰ 7. 定时任务

| 任务 | 路径 | 触发方式 | 功能说明 |
| :--- | :--- | :--- | :--- |
| 每日数据归档 | `/api/notifications/cron/daily-digest` | Vercel Cron (每日01:00北京时间) | QA日志情感分析、满意度计算、数据归档 |
| 通知测试 | `/api/notifications/test` | 手动调用 | 通知功能测试接口 |

### 🚀 未来规划与演进方向

**🎨 1. Live2D高级口型同步（Viseme对齐）**
- 当前：基础音频振幅驱动嘴型开合
- 目标：分析TTS音频声谱，实时计算Viseme音素，驱动精确口型
- 技术：Web Audio API + 实时FFT频谱分析

**📶 2. WebXR离线AR实景导览**
- 当前：高精三维地图 + Turf.js坐标测算
- 目标：WebXR协议，手机对准建筑即出现AR讲解图层
- 技术：WebXR Device API + 陀螺仪/罗盘方向追踪

**📞 3. WebRTC双向实时语音对话（VoIP）**
- 当前：STT → LLM → TTS 单工链路
- 目标：类微信通话体验，支持打断、连续对话
- 技术：WebRTC + 流式ASR + 流式TTS

**🎫 4. 真实票务与商户生态打通**
- 当前：模拟优惠券与足迹卡片
- 目标：真实闸机核销、在线支付、积分商城、商户分佣
- 技术：动态加密QR码 + 支付网关对接

**🧠 5. 多景区SaaS化平台**
- 当前：单景区定制部署
- 目标：多租户SaaS平台，景区自助入驻配置
- 技术：多租户数据隔离 + 配置化引擎

**🤖 6. 更多AI Agent生态对接**
- 当前：MCP 7个基础工具
- 目标：对接更多Agent平台（Coze、Dify、扣子等）
- 技术：标准化OpenAPI + Webhook回调

---

<div align="center">

**🌿 旅行家Pro · 让每一次旅行都留下深刻记忆**

*Built with ❤️ by Eazo AI Platform · Powered by Next.js + DeepSeek + Live2D*

</div>
