import OpenAI from "openai";
import { getExamContext, buildContextPrompt, getDefaultContext } from "@/lib/examContext";
import {
  buildMemoryPrompt,
  getPreferences,
  appendChatMemory,
  type ChatMemoryEntry,
} from "@/lib/memoryStore";

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY ?? "",
  baseURL: "https://api.deepseek.com",
});

/* ══════════════════════════════════════════════
 * 老袁 · 核心人格（可叠加场景 System Prompt）
 * ══════════════════════════════════════════════ */

const CORE_PROMPT = `你是一位专业、严谨、极其熟悉江苏省初中语文教师招聘考试的资深备考顾问老袁。

## 身份
- 你叫老袁，教龄 12 年，江苏省初中语文教研组长，多次参与教招命题与阅卷。
- 对话对象是正在实习并备考的宋老师（老宋），你以资深顾问身份为她提供专业备考指导。
- 她白天上课、管班、改作业，晚上挤时间备考，需要高效精准的复习策略。

## 语气风格
- 专业严谨、简洁务实，像资深导师对后辈的精准指点。
- 口语化但不随意，可称"老宋"。严禁使用"姐妹""宝贝"等轻佻称呼。
- 禁用冰冷机器人语气，也禁用过度亲昵的闺蜜化表达。回复控制在 200 字内。

## 专业领域
- 江苏初中语文教招：学科专业知识（文言文、现代文、作文、古诗鉴赏）、教育综合（教育学、心理学、新课标 2022 版）。
- 面试试讲：教学设计框架、说课逻辑、板书设计。
- 江苏十三市考情：各市题型偏好、高频考点、命题趋势。

## 🔴 强制输出约束（铁律，不可违反）

### 1. 严禁空洞安慰
禁止说"加油""你能行""相信自己"之类泛泛情绪安慰。
每一条建议必须包含：
  （1）一个具体操作步骤 —— 今晚做什么
  （2）一个明确时间节点 —— 花多少分钟
  （3）一个预期效果 —— 做完能达成什么

### 2. 强制行动清单
每条回复结尾必须附加「📋 今日行动清单」模块（1-3 条），格式：
  - [ ] 具体行动 @ 时间预算 → 预期收益

### 3. 情境化引导
- 距考试 ≤15 天 → 强制引导重做真题，禁止推荐"慢慢打基础"
- 距考试 16-30 天 → 真题为主 + 专项补漏
- 距考试 >30 天 → 专项攻坚薄弱模块

### 4. 考区精准打击
- 根据上方提供的目标考区数据，只推荐该区高频考点
- 若用户问到灰区内容（几乎不考），必须明确告知"这个考点在XX区近5年没考过，别浪费时间"，并立刻拉回红区

### 5. 长期记忆引用
- 若上方提供"长期记忆"数据，请结合老宋的学习档案进行个性化建议。
- 如无新问题但记忆中有近期进步数据，请主动做阶段性总结：肯定具体进步 + 指出下一个攻坚方向。

## 回答原则
1. 考点 → 先点明考频 → 简明讲解 → 记忆口诀
2. 教学设计 → 搭框架（导入→初读→精读→拓展→小结）→ 逐块说明
3. 情绪/压力 → 先认可感受，再给出可执行的具体方案
4. 不懂的题 → 逐步拆解 → 标注关键词 → 给思路，不直接给答案`;

/* ══════════════════════════════════════════════
 * 作业批改专属 Prompt（叠加层）
 * ══════════════════════════════════════════════ */

const GRADING_PROMPT = `
## 🖊️ 作业批改模式
你现在处于智能助教批改模式。回复语调必须幽默、仗义、极其专业。

### 多模态批改规则
- 若消息中包含学生作业图片（image/jpeg），必须结合图片中的手写内容进行深度批改。
- 同时参考用户补录的文字内容（题干或参考答案），进行多模态融合分析。
- 批改时先逐题指出对错，再逐个错题深度剖析错因。

### 作文评分标准（4维 × 各20分 = 满分80）
如果是大作文，必须严格按以下4个维度各打一个分，并给出简短评语：
- 立意（20分）：思想深度与新颖度
- 结构（20分）：框架完整性与层次感
- 语言（20分）：文采表达与修辞运用
- 核心素养要求（20分）：新课标 2022 版语文核心素养对标
最后给出总分（满分80），并做一个总评总结。

### 🔴 强制结尾
回复结尾必须单独输出「📋 今日教学行动建议」模块（1-2 条），给出明确的操作步骤、时间节点和预期效果。`;

/* ══════════════════════════════════════════════
 * ContentPart 类型（多模态兼容）
 * ══════════════════════════════════════════════ */

interface ContentPartText {
  type: "text";
  text: string;
}

interface ContentPartImage {
  type: "image_url";
  image_url: {
    url: string; // data:image/jpeg;base64,...
    detail?: "low" | "high" | "auto";
  };
}

type ContentPart = ContentPartText | ContentPartImage;

interface ChatMessageInput {
  role: "user" | "assistant" | "system";
  content: string | ContentPart[];
}

/* ══════════════════════════════════════════════
 * 检测是否为批改请求
 * ══════════════════════════════════════════════ */

function isGradingRequest(messages: ChatMessageInput[]): boolean {
  const userTexts = messages
    .filter((m) => m.role === "user")
    .flatMap((m) => {
      if (typeof m.content === "string") return [m.content];
      return m.content
        .filter((p): p is ContentPartText => p.type === "text")
        .map((p) => p.text);
    });

  const combined = userTexts.join(" ");
  return /批改|作文|这篇.*答案|阅读理解.*学生答案|简答题.*学生答案|默写.*学生答案|文言文.*学生答案|赏析.*学生答案/iu.test(combined);
}

function hasImageContent(messages: ChatMessageInput[]): boolean {
  return messages.some((m) => {
    if (typeof m.content === "string") return false;
    return m.content.some((p) => p.type === "image_url");
  });
}

/* ══════════════════════════════════════════════
 * POST Handler
 * ══════════════════════════════════════════════ */

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      messages: ChatMessageInput[];
      district?: string;
      mode?: "grading" | "diagnosis" | "chat";
    };

    const { messages, district, mode } = body;

    if (!process.env.DEEPSEEK_API_KEY) {
      return new Response(
        JSON.stringify({ error: "老袁正在维护中，请稍候再试。" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "消息不能为空" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    /* ── 考情注入 ────────────────── */
    let contextPrompt = "";
    if (district) {
      const parts = district.split(/[-·]/);
      if (parts.length >= 2) {
        const ctx = getExamContext(parts[0], parts[1]);
        contextPrompt = buildContextPrompt(ctx);
      }
    }
    if (!contextPrompt) {
      contextPrompt = buildContextPrompt(getDefaultContext());
    }

    /* ── 长期记忆注入 ──────────────── */
    const memoryPrompt = buildMemoryPrompt();

    /* ── 检测场景 ────────────────── */
    const grading = mode === "grading" || isGradingRequest(messages);
    const multimodal = hasImageContent(messages);

    /* ── 构建 System Prompt ────────── */
    const scenePrompt = grading ? GRADING_PROMPT : "";
    const fullSystemPrompt = [
      contextPrompt,
      memoryPrompt,
      scenePrompt,
      `---\n${CORE_PROMPT}`,
    ]
      .filter(Boolean)
      .join("\n");

    /* ── 保存对话摘要 ──────────────── */
    const lastUserContent = messages[messages.length - 1]?.content;
    const lastUserText =
      typeof lastUserContent === "string"
        ? lastUserContent
        : (lastUserContent as ContentPart[])
            ?.filter((p) => p.type === "text")
            .map((p) => (p as ContentPartText).text)
            .join(" ") ?? "";

    if (lastUserText.length > 0 && messages.length <= 3) {
      const entry: ChatMemoryEntry = {
        date: new Date().toISOString().slice(0, 10),
        topic: lastUserText.slice(0, 40),
        summary: lastUserText.slice(0, 120),
      };
      try {
        appendChatMemory(entry);
      } catch {
        /* 忽略存储失败 */
      }
    }

    /* ── 构建 DeepSeek API 消息 ────── */
    const apiMessages = messages.map((m) => {
      /* content 可以是 string 或 ContentPart[] — 两种都原样传递给 DeepSeek */
      if (typeof m.content === "string") {
        return { role: m.role, content: m.content };
      }
      /* 多模态 content: 验证并转换 image_url */
      const parts = m.content.map((p) => {
        if (p.type === "text") return p;
        if (p.type === "image_url") {
          const url = p.image_url?.url ?? "";
          /* 只允许 base64 data URL 通过 */
          if (!url.startsWith("data:image/")) {
            return { type: "text" as const, text: "[图片格式不支持，请使用 JPEG base64]" };
          }
          return {
            type: "image_url" as const,
            image_url: {
              url,
              detail: (p.image_url?.detail as "low" | "high" | "auto") ?? "auto",
            },
          };
        }
        return p;
      });
      return { role: m.role, content: parts };
    });

    /* ── 调用 DeepSeek（流式） ─────── */
    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      stream: true,
      messages: [
        { role: "system" as const, content: fullSystemPrompt },
        ...apiMessages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      ],
      temperature: grading ? 0.6 : 0.8,
      max_tokens: grading ? 1600 : 1200,
    });

    /* ── 流式输出 ──────────────────── */
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const delta = chunk.choices[0]?.delta?.content ?? "";
            if (delta) controller.enqueue(encoder.encode(delta));
          }
        } catch {
          controller.enqueue(encoder.encode("[回复中断，请重试]"));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "老袁正在维护中，请稍候再试。";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
