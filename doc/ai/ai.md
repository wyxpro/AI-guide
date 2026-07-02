# 🗺️ 旅行家Pro - 多模态 AI 接入与技术白皮书

本文档旨在全面规划与规范《旅行家Pro》多模态智能景区导览系统的 AI 接入能力，包括文本模态、音频模态与视觉模态。针对国内部署与高可用生产环境的要求，本系统核心采用了 **九章云极 DeepSeek-V4-Pro** 作为主文本大模型，并集成了 **阶跃星辰 StepFun stepaudio-2.5** 系列模型作为高逼真的音频模态驱动，同时辅以多级高可用容灾与降级方案。

---

## 📊 一、多模态 AI 能力需求与已对接模型

> [!NOTE]
> 价格换算比例参考：$1 USD ≈ 7.25 CNY。大模型计费通常以**每百万 Tokens (1M Tokens)** 为标准单位。

| 模态 | 能力需求 | 对接场景 | 已对接模型 | 调用价格 |
| :--- | :--- | :--- | :--- | :--- |
| **文本模态**<br>(Text) | **智能导游问答**<br>(RAG Chat Engine) | 游客在 C 端进行文本或语音问答，自动基于知识库检索并调整语气（标准/老年/儿童模式），返回特定情感标注。 | **主用**：`deepseek-v4-pro` (九章云极代理)<br>**降级备选**：`deepseek.v3.1` (Eazo SDK) | - **DeepSeek-V4-Pro**：代理单次计费 (代理授权)<br>- **GPT-4o-mini**：输入 $0.15/M (¥1.09), 输出 $0.60/M (¥4.35)<br>- **Qwen-Plus**：输入 ¥0.8/M, 输出 ¥2.0/M |
| | **景区运营建议分析**<br>(Analytics Recommendations) | B 端管理后台定期提取近 40 条游客问答日志，通过 AI 进行痛点提取，并生成 3-4 条改进方案。 | **主用**：`deepseek-v4-pro` | - 同上（单次分析约消耗 2k~4k Tokens） |
| | **知识库文本向量化**<br>(Text Embedding) | 管理员上传 txt/pdf/docx 景区文档时，自动切段并生成向量，存储至 PostgreSQL 以实现 Hybrid RAG 语义相似度匹配。 | **主用**：`text-embedding-3-small` (1536维)<br>**保底备选**：本地哈希与余弦相似度保底 | - **text-embedding-3-small**：$0.02/M Tokens (约 ¥0.15/M)<br>- **阿里 text-embedding-v2**：¥0.70/M Tokens |
| **视觉模态**<br>(Vision) | **VR 即拍即识**<br>(Multimodal Recognition) | 游客拍照或上传风光/展品图片，AI 在 1 秒内提取主体名称、深度历史故事与拍摄建议并输出 JSON。 | **主用**：`step-3.7-flash` (阶跃星辰)<br>**降级备选**：`deepseek.v3.1` (Eazo SDK) | - **DeepSeek V3 (视觉版)**：极低价格<br>- **GPT-4o-mini**：低解像度约 $0.00085/张，高解像度约 $0.00285/张<br>- **Qwen-VL-Plus**：固定计费 ¥0.015/张 |
| **音频模态**<br>(Audio) | **语音输入**<br>(ASR / STT) | 游客在 C 端按住麦克风进行语音提问，录音数据传入后台转换为文字。 | **主用**：`stepaudio-2.5-asr` (阶跃星辰)<br>**多级降级**：`Vosk` (本地离线), OpenAI `Whisper-1` | - **Vosk**：¥0 (本地部署)<br>- **stepaudio-2.5-asr**：¥0.01 / 分钟 (高采样率识别)<br>- **Whisper-1**：$0.006 / 分钟 (约 ¥0.044 / 分钟) |
| | **语音输出**<br>(TTS) | 将大模型生成的答复文本转换为流式语音流，用于驱动 Live2D 数字人面部及口型同步。 | **主用**：`stepaudio-2.5-tts` (阶跃星辰)<br>**多级降级**：科大讯飞流式 TTS, `ElevenLabs`, `Google Translate TTS` | - **stepaudio-2.5-tts**：¥0.02 / 万字符 (情绪饱满)<br>- **科大讯飞流式 TTS**：约合 ¥10.00 - ¥20.00 / 百万字<br>- **ElevenLabs**：约 $0.15 - $0.30 / 万字符 |

---

## 🎯 二、提示词策略与配置参数汇总表

为了规范 AI 的回复逻辑，旅行家Pro 在不同的业务场景中采用了精细化的 Prompt 与调用参数设计。

| 业务场景 | 调用的 API 端点 | 目标 AI 模型 | 温度 (Temp) | 最大 Token 数 | 提示词策略 (System Prompt & User Content) | 响应格式 (Response Format) |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| **标准导览模式**<br>(normal) | `POST /api/qa/chat` | `deepseek-v4-pro` | `0.7` | `400` | **System Prompt**: 你是翠玉景区的专属AI导览员小玉，语气温暖亲切、知识丰富。回答200字以内。必须在回复的最开始以 `[情感: 愉快/平静/伤感/思考]` 格式标注你的情感，例如 `[情感: 愉快]您好！很高兴为您服务。` | 纯文本 + 情感标注前缀 (如 `[情感: 愉快]...`) |
| **老年无障碍模式**<br>(elder) | `POST /api/qa/chat` | `deepseek-v4-pro` | `0.5` | `400` | **System Prompt**: 你是翠玉景区的AI导览员小玉，专为老年游客服务。语速慢、语气温和、措辞简洁易懂，避免复杂句子，优先推荐平坦无障碍路线。回答150字以内。必须在回复的最开始以 `[情感: 愉快/平静/伤感/思考]` 格式标注你的情感。 | 纯文本 + 情感标注前缀 (限制 150字) |
| **儿童童趣模式**<br>(child) | `POST /api/qa/chat` | `deepseek-v4-pro` | `0.85` | `400` | **System Prompt**: 你是翠玉景区的AI导览员小玉，专为小朋友服务！用可爱活泼的语气讲故事，多用比喻和有趣的说法。回答100字以内。必须在回复的最开始以 `[情感: 愉快/平静/思考]` 格式标注你的情感。 | 纯文本 + 情感标注前缀 (限制 100字) |
| **RAG 上下文注入** | `POST /api/qa/chat` | — | — | — | **动态拼接在 System Prompt 之后**: `\n\n【景区知识库参考】\n{title}: {content}\n\n用户问：{question}` | 用于增强大模型生成事实的准确率 |
| **VR 即拍即识** | `POST /api/spots/recognize` | `deepseek.v3.1`<br>(或 `gpt-4o-mini`) | `0.2` | `600` | **System Prompt**: 你是翠玉景区的专属AI导览员小玉。请分析图片识别景物：1.主景物名称(30字内)；2.相关历史文化背景(100字内)；3.游览建议或拍照技巧(50字内)。请用JSON回复，包含字段：`subject`、`story`、`tip`。 | **JSON 格式**:<br>`{ "subject": "...", "story": "...", "tip": "..." }` |
| **后台运营分析** | `GET /api/admin/analytics/recommendations` | `deepseek-v4-pro` | `0.3` | `800` | **System Prompt**: 你设计为一位顶级的景区运营规划专家与AI服务分析师。基于游客问答内容分析近期的核心痛点与关注点并提供3-4项具体的改进建议。 | 结构化 Markdown 文本 |

---

## 🛡️ 三、系统多级容灾与降级逻辑 (Failover Strategy)

为了保证系统在高并发、第三方网络异常或账单超限下的稳定性，系统设计了多级容灾架构：

```mermaid
graph TD
    subgraph STT 语音识别容灾
        STT1[本地 Vosk 离线模型] -- 失败/无模型 --> STT2[StepFun stepaudio-2.5-asr API]
        STT2 -- 失败 --> STT3[OpenAI Whisper-1 API]
        STT3 -- 失败 --> STT4[静态提示文本/Web Speech API 降级]
    end

    subgraph TTS 语音合成容灾
        TTS1[StepFun stepaudio-2.5-tts API] -- 失败 --> TTS2[科大讯飞流式 Websocket TTS]
        TTS2 -- 失败/无配置 --> TTS3[ElevenLabs API]
        TTS3 -- 失败 --> TTS4[Google Translate 免费 TTS 接口]
    end

    subgraph LLM 问答与多模态容灾
        LLM1[九章云极 DeepSeek-V4-Pro] -- 超时/异常 --> LLM2[Eazo SDK 托管 DeepSeek-V3.1]
        LLM2 -- 失败 --> LLM3[本地模拟智能兜底答复]
    end

    subgraph Embedding 向量生成容灾
        EMB1[OpenAI text-embedding-3-small] -- 异常/无秘钥 --> EMB2[本地哈希余弦余弦相似度保底]
    end
```

### 1. 语音识别 (STT) 容灾逻辑
* **第一级 (本地离线)**：使用本地轻量级开源 `Vosk` 模型（`models/vosk-model-cn`），提供零流量消耗、低延迟的近距离解析。
* **第二级 (商业在线)**：如果未部署本地模型，优先调用 **阶跃星辰 `stepaudio-2.5-asr`** API。它基于 SSE 流式响应，能够提取高精度的中文普通话和地方口音。
* **第三级 (海外备选)**：若阶跃星辰服务断开，自动降级切换至 `OpenAI Whisper-1` 全球网关。
* **第四级 (最终兜底)**：若全部请求失败，接口将返回静态识别占位提示（如“听到您说：请带我参观一下这里的核心景点”），保障对话流不断开。

### 2. 语音合成 (TTS) 容灾逻辑
* **第一级 (国内首选)**：首选调用 **阶跃星辰 `stepaudio-2.5-tts`**，生成具备情感和拟真度的女性声线（林家姐姐），完美对应导览员小玉的虚拟形象。
* **第二级 (企业级)**：如果阶跃星辰失效，自动降级至科大讯飞 WebAPI 引擎（`vcn: aisjinger`）。
* **第三级 (高精多音色)**：讯飞欠费时，降级至 `ElevenLabs` 多语种大模型。
* **第四级 (永久免费)**：全部商业 API 均失效时，采用 `Google Translate TTS` 公开接口进行实时合成。

---

## 💻 四、核心代码实现结构

### 1. 文本模态 - `deepseek-v4-pro` 对接
新建文件夹 `src/lib/deepseek-v4-pro`，并在 `chat.ts` 中实现 API 交互，从环境变量 `.env` 中安全读取 `DEEPSEEK_PROXY_URL` 与 `DEEPSEEK_API_KEY`：

```typescript
// src/lib/deepseek-v4-pro/chat.ts
export async function deepseekV4ProChat(options: ChatOptions) {
  const { messages, temperature = 0.7, max_tokens = 400, stream = false } = options;
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const rawProxyUrl = process.env.DEEPSEEK_PROXY_URL || "https://mangdream.com/api/innoreation/v1/proxy";
  
  const proxyUrl = rawProxyUrl.endsWith("/chat/completions") 
    ? rawProxyUrl 
    : `${rawProxyUrl.replace(/\/+$/, "")}/chat/completions`;

  const headers = {
    "Content-Type": "application/json",
    "Proxy API Key": apiKey!,
    "X-Proxy-Key": apiKey!,
    "Authorization": `Bearer ${apiKey}`
  };

  const response = await fetch(proxyUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ model: "deepseek-v4-pro", messages, temperature, max_tokens, stream })
  });

  // ... 流式/非流式响应解析
}
```

### 2. 音频模态 - `stepaudio-2.5` ASR/TTS 对接
新建文件夹 `src/lib/stepfun-audio`，分别在 `asr.ts` 与 `tts.ts` 中对接阶跃星辰语音模型：

```typescript
// src/lib/stepfun-audio/asr.ts
export async function transcribeAudioWithStepFun(file: File): Promise<string> {
  const apiKey = process.env.STEP_API_KEY!;
  const arrayBuffer = await file.arrayBuffer();
  const base64Data = Buffer.from(arrayBuffer).toString("base64");
  
  // 组装格式，支持 ogg, mp3, wav 等
  const payload = {
    audio: {
      data: base64Data,
      input: {
        transcription: { model: "stepaudio-2.5-asr", language: "zh", enable_itn: true },
        format: { type: file.type.includes("mp3") ? "mp3" : "ogg" }
      }
    }
  };

  const response = await fetch("https://api.stepfun.com/step_plan/v1/audio/asr/sse", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });
  // ... 实时 SSE 解析 Delta 事件（transcript.text.delta）拼接输出
}
```

```typescript
// src/lib/stepfun-audio/tts.ts
export async function synthesizeSpeechWithStepFun(text: string, voiceStyle?: string): Promise<ArrayBuffer> {
  const apiKey = process.env.STEP_API_KEY!;
  const payload = {
    model: "stepaudio-2.5-tts",
    input: text.slice(0, 300),
    voice: voiceStyle === "professional" ? "cixingnansheng" : "linjiajiejie",
    instruction: "语气温和亲切，语速适中，富有情感",
    response_format: "mp3"
  };

  const response = await fetch("https://api.stepfun.com/step_plan/v1/audio/speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });
  
  return await response.arrayBuffer();
}
```

以上设计及代码实现均已并入系统底层，可在不破坏项目稳定性的前提下，实现 C/B 端多模态体验。
