# 翠玉AI导览 · 后续开发计划

> 基于PRD需求分析 + 现状功能缺口，制定分阶段开发计划。
> 优先级：P0（必做/BugFix）→ P1（核心补完）→ P2（特色创新）→ P3（加分亮点）

---

## 第一阶段：BugFix与安全加固（建议优先完成，约1-2天）

### 必修Bug修复

| 编号 | 功能模块 | 具体任务 | 输入 | 输出 | 技术方案 | 优先级 |
|---|---|---|---|---|---|---|
| F-01 | 管理后台鉴权 | 为 /api/admin/* 所有接口添加管理员身份验证 | HTTP请求Header中的x-eazo-session | 401/403拒绝非管理员请求；合法请求正常处理 | requireAuth + users表增加role字段（admin/user），接口校验role | P0 |
| F-02 | QA接口鉴权 | /api/qa/chat 添加requireAuth或请求限速 | 无鉴权的问答请求 | 未登录用户返回401或可匿名但限速（3次/分钟） | 方案A：requireAuth强制登录；方案B：IP限速中间件 | P0 |
| F-03 | 取消收藏接口 | 实现 DELETE /api/user/favorites/[id] | 收藏记录ID | 删除成功/失败JSON响应 | Drizzle `db.delete(favorites).where(eq(favorites.id, id) & eq(favorites.userId, userId))` | P0 |
| F-04 | removeFavorite SQL逻辑错误 | 修复lib/db/queries/user-data.ts中removeFavorite两个分支逻辑相同的bug | type: "spot"\|"route", id: number | 正确按spotId或routeId+userId删除对应收藏 | 分两个条件：spot用`and(eq(userId), eq(spotId, id))`；route用`and(eq(userId), eq(routeId, id))` | P0 |
| F-05 | favorites唯一约束 | 数据库添加防重复收藏约束 | 重复收藏同一景点 | 数据库拒绝重复插入，接口返回友好提示 | `unique("user_spot_unique", favorites.userId, favorites.spotId)` 迁移 | P0 |
| F-06 | 个人中心数据真实化 | ProfileScreen从数据库读取真实游览记录和统计数字 | 用户ID | 实际游览过的景点列表、真实问答条数、收藏数量 | 前端调用 /api/user/visits 和 /api/user/favorites，计算stats | P0 |

---

## 第二阶段：核心功能补完（P1，约3-5天）

### 2A. 对话历史持久化

| 编号 | 功能模块 | 具体任务 | 输入 | 输出 | 技术方案 | 优先级 |
|---|---|---|---|---|---|---|
| C-01 | QA对话持久化 | 实现对话session的保存、读取和恢复 | 用户发送/接收消息事件 | 历史对话可在个人中心查看，重进问答页可续接 | POST /api/qa/sessions（创建session）；PATCH /api/qa/sessions/[id]（追加消息）；GET /api/qa/sessions（历史列表）| P1 |
| C-02 | QA多轮上下文 | 请求AI时携带最近N轮对话历史 | 当前session的消息数组 | AI回答基于上下文，不再"失忆" | 将messages[-6:]传入ai.chat的messages参数，role轮换user/assistant | P1 |
| C-03 | 适老化/童趣模式接入AI | QA接口读取user_preferences.accessibilityMode动态调整system prompt | accessibilityMode: "normal"\|"elder"\|"child" | 适老版：语速慢/简洁话术；童趣版：卡通风格回答 | /api/qa/chat接口：requireAuth后读取user_preferences，根据mode替换system prompt模板 | P1 |
| C-04 | 历史问答记录页 | 个人中心展示历史对话session列表 | 用户ID | 历史会话卡片列表（标题+时间+首句预览），可点击查看全文 | 新建 /profile/history 页面，调用GET /api/qa/sessions，展示列表 | P1 |

### 2B. 景点导览模块（PRD P0核心功能，当前缺失）

| 编号 | 功能模块 | 具体任务 | 输入 | 输出 | 技术方案 | 优先级 |
|---|---|---|---|---|---|---|
| C-05 | 景点导览页 | 新增 /spots 页面，展示景点网格/列表，含分类筛选 | 分类筛选参数、搜索关键词 | 景点卡片网格（图片+名称+标签+评分+停留时长）| 新建 src/app/spots/page.tsx，调用/api/spots，支持网格/列表切换视图 | P1 |
| C-06 | 景点详情页 | 新增 /spots/[id] 景点详情，含详细介绍+AI讲解入口 | 景点ID | 景点封面图、历史介绍、标签、评分、数字人讲解触发按钮 | 新建 src/app/spots/[id]/page.tsx，调用/api/spots/[id]，集成QA问答入口（携带景点context） | P1 |
| C-07 | 首页增加景点导览入口 | 首页HomeNavCards增加第三张"景点导览"入口卡片 | 点击事件 | 跳转到/spots页面 | 修改HomeNavCards组件，添加 href="/spots" 卡片，icon用 MapPin | P1 |
| C-08 | B端景点管理 | 新增 /admin/spots 管理页，支持景点CRUD和图片管理 | 管理员操作（新增/编辑/启用/禁用景点）| 景点数据实时更新，C端同步生效 | 新建 src/app/admin/spots/page.tsx，后端新增 /api/admin/spots CRUD接口 | P1 |

### 2C. 收藏功能完整闭环

| 编号 | 功能模块 | 具体任务 | 输入 | 输出 | 技术方案 | 优先级 |
|---|---|---|---|---|---|---|
| C-09 | 景点/路线收藏按钮 | 在景点详情页和路线卡片添加收藏Heart按钮，接入真实API | 点击Heart，用户已登录 | 收藏成功/取消收藏Toast提示；Heart图标切换红色/灰色 | 前端调用POST/DELETE /api/user/favorites；useAuthStore检查登录态 | P1 |
| C-10 | 个人中心收藏列表页 | 展示用户收藏的景点和路线 | 用户ID | 收藏的景点/路线卡片列表，可取消收藏 | 新建 /profile/favorites 页面，调用GET /api/user/favorites，关联spots/routes数据展示 | P1 |

### 2D. 游览记录与评分

| 编号 | 功能模块 | 具体任务 | 输入 | 输出 | 技术方案 | 优先级 |
|---|---|---|---|---|---|---|
| C-11 | 游览签到与记录写入 | 用户进入景点详情时自动记录游览行为 | 访问景点详情页（已登录）| 自动写入visit_records，更新足迹时间线 | 景点详情页useEffect中调用POST /api/user/visits；memory.reportAction记录行为事件 | P1 |
| C-12 | 游览评分 | 用户完成游览后可对景点1-5星评分 | 1-5星点击、可选文字备注 | 评分写入visit_records.rating，景点avgRating更新 | 景点详情底部评分组件，调用PATCH /api/user/visits/[id]（新增接口）| P1 |

---

## 第三阶段：AI多模态能力接入（P1-P2，约5-7天）

### 3A. 语音交互（STT）

| 编号 | 功能模块 | 具体任务 | 输入 | 输出 | 技术方案 | 优先级 |
|---|---|---|---|---|---|---|
| A-01 | 浏览器端语音识别 | Mic按钮实现真实语音录制和识别 | 用户按住说话的音频流 | 识别文字回填到输入框，自动发送 | Web Speech API（SpeechRecognition，Chrome/Edge支持）；fallback提示用户手动输入 | P1 |
| A-02 | 后端Whisper语音识别（可选）| 接入OpenAI Whisper API作为高质量STT后端 | 音频Blob（webm/mp3）| 识别文字JSON | 新建 /api/qa/stt 接口，接收base64音频，调用Whisper API，返回text | P2 |

### 3B. 语音合成（TTS）

| 编号 | 功能模块 | 具体任务 | 输入 | 输出 | 技术方案 | 优先级 |
|---|---|---|---|---|---|---|
| A-03 | AI回复语音播报 | AI回复文字同步生成语音并自动播放 | AI回复文本字符串 | 音频流自动播放，播放/暂停按钮 | 接入ElevenLabs TTS（已集成elevenlabs_tts工具）；或使用浏览器内置SpeechSynthesis API（零成本fallback）| P1 |
| A-04 | 语速适配无障碍模式 | 适老模式使用慢语速TTS，童趣模式使用活泼语速 | accessibilityMode偏好设置 | 对应语速的TTS音频 | ElevenLabs API的stability/similarity参数；或SpeechSynthesis.rate属性 | P2 |

### 3C. 情感分析自动采集

| 编号 | 功能模块 | 具体任务 | 输入 | 输出 | 技术方案 | 优先级 |
|---|---|---|---|---|---|---|
| A-05 | 用户情感实时分类 | 每次用户提问后，后台对该文本做情感判断并写入统计 | 用户输入文本 | positive/neutral/negative分类写入analytics_daily | /api/qa/chat接口额外调用AI做情感分类（追加一个轻量请求）；或用正则关键词快速判断 | P2 |
| A-06 | 情感趋势可视化 | 数据大屏增加情感趋势折线图（7日积极/消极趋势） | analytics_daily历史数据 | 三色折线图（积极/中性/消极随时间变化）| AdminDashboard新增折线图组件（CSS绘制或引入轻量图表库recharts）| P2 |

---

## 第四阶段：特色功能与亮点创新（P2-P3，约3-5天）

### 4A. 知识库语义检索升级

| 编号 | 功能模块 | 具体任务 | 输入 | 输出 | 技术方案 | 优先级 |
|---|---|---|---|---|---|---|
| S-01 | 知识库向量化 | 新增知识库文档自动向量化，建立embedding索引 | 知识库文档内容text | 文档embedding向量存储至pgvector | 安装pgvector扩展；schema增加embedding列（vector(1536)）；调用AI embedding接口 | P2 |
| S-02 | 语义检索替代全文拼接 | QA接口改用向量检索召回最相关文档片段 | 用户问题文本 | 召回Top-K相关文档作为精准上下文 | 问题文本→embedding→pgvector向量相似度搜索→拼接TopK结果→送入AI | P2 |
| S-03 | 知识库文档解析增强 | 支持PDF/Word文件真实解析（非仅TXT）| PDF/Word文件上传 | 解析文本内容自动填入知识库 | 后端接入pdfjs-dist解析PDF；mammoth.js解析docx；返回提取文本 | P2 |

### 4B. 二维码实景联动

| 编号 | 功能模块 | 具体任务 | 输入 | 输出 | 技术方案 | 优先级 |
|---|---|---|---|---|---|---|
| S-04 | 景点二维码生成 | B端管理后台为每个景点生成专属导览二维码 | 景点ID | 包含景点ID的二维码图片，可打印 | 引入qrcode.js生成二维码Data URL；下载为PNG | P2 |
| S-05 | 扫码自动触发深度讲解 | 游客扫码进入景点详情，数字人自动开始讲解 | URL参数 ?spot=id&autoplay=true | 页面自动发起该景点的AI讲解请求，TTS播报 | 景点详情页检测URL参数autoplay，自动触发讲解；结合TTS实现语音播放 | P2 |

### 4C. 离线PWA适配

| 编号 | 功能模块 | 具体任务 | 输入 | 输出 | 技术方案 | 优先级 |
|---|---|---|---|---|---|---|
| S-06 | PWA基础配置 | 配置manifest.json和Service Worker，支持添加到主屏幕 | 浏览器PWA安装提示 | 可离线访问首页和已缓存景点，添加到手机主屏幕 | next-pwa插件；配置offline缓存策略（stale-while-revalidate）| P2 |
| S-07 | 景点内容离线缓存 | 用户浏览过的景点详情自动缓存，弱网可查看 | 游客预览景点详情 | 无网络时展示缓存内容+提示"离线模式" | Service Worker Cache API缓存/api/spots/*响应；前端检测navigator.onLine | P3 |

### 4D. 数字人接入（核心亮点/P1）

| 编号 | 功能模块 | 具体任务 | 输入 | 输出 | 技术方案 | 优先级 |
|---|---|---|---|---|---|---|
| S-08 | 2D数字人基础接入 | 替换SVG为真实可动的2D数字人渲染 | 数字人配置参数（外观/音色）| 可运动的数字人动画形象，支持待机/说话/点头动作 | 方案A：D-ID API（云端渲染，简单但需API Key）；方案B：Live2D开源SDK（本地渲染，复杂但效果好）；方案C：CSS+SVG动画增强（低成本替代）| P1 |
| S-09 | 数字人口型同步 | AI回复TTS播放时，数字人嘴型同步 | TTS音频流 + 文本 | 数字人口型跟随语音节奏开合 | D-ID Streaming API（内置口型同步）；或基于音频分析的简单口型状态机（open/close按音量切换）| P2 |

### 4E. 实时分析数据自动采集

| 编号 | 功能模块 | 具体任务 | 输入 | 输出 | 技术方案 | 优先级 |
|---|---|---|---|---|---|---|
| S-10 | 问答行为自动写入分析 | 每次QA请求自动累加analytics_daily的totalQuestions | QA接口POST请求 | analytics_daily当日记录实时更新 | /api/qa/chat成功响应后，调用upsertDailyAnalytics累加计数 | P1 |
| S-11 | 景点热度自动排名 | 根据visit_records统计真实热门景点排行 | visit_records历史数据 | 替换AdminAnalyticsScreen中硬编码的topSpots | 新增 /api/admin/analytics/hot-spots 接口，GROUP BY spotId统计游览次数 | P2 |
| S-12 | 高频词云真实计算 | 对topQuestions历史数据做词频分析生成词云 | 历史问题文本列表 | 真实词频词云展示 | 后端做简单分词（jieba-wasm或正则词频统计）；前端按频率渲染不同字号 | P2 |

---

## 第五阶段：体验优化与竞赛加分项（P3，约2-3天）

| 编号 | 功能模块 | 具体任务 | 输入 | 输出 | 技术方案 | 优先级 |
|---|---|---|---|---|---|---|
| X-01 | 游客满意度评星 | QA对话结束后弹出满意度评价（5星） | 对话结束/离开QA页 | 评分写入数据库，影响满意度分析数据 | QA页底部"本次对话满意吗？"5星组件；调用POST /api/user/feedback新接口 | P3 |
| X-02 | 首页欢迎语个性化 | 根据登录用户姓名和偏好生成个性欢迎语 | 用户名+偏好标签+当前时间 | 数字人气泡显示"下午好，[姓名]！您上次游览了揽月亭..." | 首页加载时调用AI生成个性化问候（轻量，50token内）| P3 |
| X-03 | 游览进度勋章体系 | 游客游览N个景点后解锁对应成就勋章 | 游览记录数量 | 首页/个人中心展示已解锁勋章图标 | 前端计算visitRecords数量，满足阈值显示勋章SVG；接入eazo achievement share | P3 |
| X-04 | 景区公告与消息推送 | 管理员发布景区公告，推送到订阅用户 | 公告文本+推送目标 | 用户收到系统通知（Eazo通知体系）| 接入integrate-eazo-notifications技能；新增 /api/admin/announcements 接口 | P3 |
| X-05 | 多语言支持（英日韩）| 界面和AI问答支持多语言切换 | 用户语言选择 | 界面文案+AI回复均用对应语言 | next-intl国际化框架；AI接口在system prompt中指定回答语言 | P3 |

---

## 开发优先级路线图总览

```
Week 1（基础稳固）：
  [P0] F-01~F-06（安全加固+数据真实化）
  [P1] C-05~C-07（景点导览模块）
  [P1] C-01~C-02（对话历史持久化+多轮上下文）

Week 2（AI能力跃升）：
  [P1] A-01/A-03（语音录入+TTS语音播报）
  [P1] C-03（适老化/童趣模式接入AI）
  [P1] C-09~C-12（收藏+游览记录完整闭环）
  [P1] S-10（分析数据自动采集）

Week 3（特色亮点）：
  [P2] S-08（2D数字人基础接入）
  [P2] S-01~S-02（知识库向量化语义检索）
  [P2] S-04~S-05（二维码实景联动）
  [P2] A-05~A-06（情感分析+趋势图）

Week 4（竞赛加分）：
  [P3] X-01/X-02/X-03（满意度评星+个性欢迎+勋章体系）
  [P2] S-06（PWA离线适配）
  [P3] X-04/X-05（推送通知+多语言）
```

---

## 技术选型参考

| 能力方向 | 推荐方案（免费/开源优先）| 备选商业方案 |
|---|---|---|
| 语音识别STT | Web Speech API（浏览器原生，免费）| OpenAI Whisper API |
| 语音合成TTS | 浏览器SpeechSynthesis（免费）| ElevenLabs / 阿里云TTS |
| 2D数字人 | CSS动画增强（最快）→ Live2D Cubism SDK（开源）| D-ID API / HeyGen API |
| 知识库向量化 | pgvector扩展（已有PG）+ 内置AI embedding | Chroma / FAISS + Python后端 |
| PDF解析 | pdfjs-dist（前端/Node.js，MIT开源）| Apache Tika |
| Word解析 | mammoth.js（Node.js，MIT开源）| — |
| 词频分析 | nodejieba / TinySegmenter（轻量分词）| — |
| 地图渲染 | Leaflet.js（开源）+ OpenStreetMap | 高德地图 / 百度地图 |
| PWA | next-pwa（Next.js插件，MIT）| — |
| 国际化 | next-intl（MIT）| — |
