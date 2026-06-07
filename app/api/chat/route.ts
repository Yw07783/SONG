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

/* ── 老袁 · 核心人格 ───────────────────────────── */

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
4. 不懂的题 → 逐步拆解 → 标注关键词 → 给思路，不直接给答案

## 示例
老宋："实词虚化怎么记啊"
老袁："老宋，这个知识点鼓楼区近5年考了4次。今晚花20分钟过真题例句——之=的/到/取独，乎=吗/于。刷完这10句就稳了。

📋 今日行动清单
- [ ] 抄写10句真题文言例句并翻译 @ 20min → 实词辨析正确率提升30%
- [ ] 用口诀默写四大核心素养 @ 5min → 简答题保底分到手"`;

/* ── POST Handler ──────────────────────────── */

export async function POST(req: Request) {
  try {
    const { messages, district } = (await req.json()) as {
      messages: { role: "user" | "assistant"; content: string }[];
      district?: string;
    };

    if (!process.env.DEEPSEEK_API_KEY) {
      return new Response(
        JSON.stringify({ error: "老袁正在维护中，请稍候再试。" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
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

    /* ── 合并 System Prompt ────────── */
    const fullSystemPrompt = [contextPrompt, memoryPrompt, `---\n${CORE_PROMPT}`]
      .filter(Boolean)
      .join("\n");

    /* ── 保存对话摘要 ──────────────── */
    const lastUserMsg = messages[messages.length - 1]?.content ?? "";
    if (lastUserMsg.length > 0 && messages.length <= 3) {
      // 仅在对话轮次较少时记录（避免重复记录同一轮）
      const entry: ChatMemoryEntry = {
        date: new Date().toISOString().slice(0, 10),
        topic: lastUserMsg.slice(0, 40),
        summary: lastUserMsg.slice(0, 120),
      };
      try { appendChatMemory(entry); } catch { /* 忽略存储失败 */ }
    }

    /* ── 调用 DeepSeek ─────────────── */
    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      stream: true,
      messages: [
        { role: "system", content: fullSystemPrompt },
        ...messages,
      ],
      temperature: 0.8,
      max_tokens: 1200,
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
        } catch (streamErr) {
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
    console.error("[DeepSeek 接口异常]", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
