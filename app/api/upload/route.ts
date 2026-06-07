import { NextResponse } from "next/server";
import OpenAI from "openai";
import mammoth from "mammoth";
import { appendUploadLog, updatePreferences, type UploadLogEntry } from "@/lib/memoryStore";
import fs from "fs";
import path from "path";

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY ?? "",
  baseURL: "https://api.deepseek.com",
});

const UPLOAD_DIR = path.join(process.cwd(), "data", "question-bank");

/* ── AI 解析 Prompt ────────────────────────── */

const PARSE_PROMPT = `你是一个专业的备考资料解析引擎。请分析以下文档内容，并返回严格的 JSON 格式结果（不要包含任何 markdown 标记，直接输出 JSON 对象）。

## 解析规则
1. **资料类型识别**：判断这是「真题试卷」「考纲文件」「备考笔记」「教学案例」「实习心得」还是「其他」。字段名：type。
2. **题目提取**：如果是试卷或题库类文档，提取所有题目，每道题包含：
   - stem: 题干
   - options: 选项数组（选择题才有，简答题为空数组）
   - answer: 参考答案或要点
   - category: 自动归类到「wenyan/gushi/xiandaiwen/zuowen/jiaoyuxue/xinlixue/kebiao/jiaoxue/banzhuren」之一
   - difficulty: "basic" | "medium" | "hard"
3. **考点提取**：提取文档覆盖的核心考点关键词数组。字段名：keyPoints。
4. **地区判断**：若内容中提到江苏某市/区，标注出来。字段名：region（如 "南京市·鼓楼区"，无则为 null）。
5. **质量评分**：对资料完整度和清晰度给出 1-10 分。字段名：qualityScore。

## 输出 JSON 格式示例
{
  "type": "真题试卷",
  "title": "自动生成的标题",
  "questions": [
    { "stem": "...", "options": ["A. ...", "B. ..."], "answer": "B", "category": "wenyan", "difficulty": "medium" }
  ],
  "keyPoints": ["文言文实词", "虚词辨析"],
  "region": "南京市·鼓楼区",
  "qualityScore": 8
}

请严格按照上述 JSON 格式输出，不要附加任何解释文字。`;

/* ── POST Handler ──────────────────────────── */

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const textContent = formData.get("text") as string | null;

    let content = "";
    let fileName = "手动粘贴";
    let fileType: UploadLogEntry["type"] = "text";

    /* ── 读取文件 ────────────────────── */
    if (file) {
      fileName = file.name;
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name).toLowerCase();

      if (ext === ".pdf") {
        // pdf-parse 需要 Buffer
        const pdfParse = (await import("pdf-parse")).default;
        try {
          const data = await pdfParse(buffer);
          content = data.text;
        } catch {
          // pdf-parse 失败时使用文件大小判断
          content = `[PDF 文件: ${fileName}, 大小: ${(buffer.length / 1024).toFixed(1)} KB。请根据文件名和大小推测内容类型。]`;
        }
        fileType = "pdf";
      } else if (ext === ".docx") {
        const result = await mammoth.extractRawText({ buffer });
        content = result.value;
        fileType = "docx";
      } else if (ext === ".txt" || ext === ".md") {
        content = buffer.toString("utf-8");
        fileType = "text";
      } else {
        // 其他格式尝试作为文本读取
        content = buffer.toString("utf-8");
        fileType = "text";
      }

      // 保存原始文件
      const savePath = path.join(UPLOAD_DIR, `${Date.now()}_${fileName}`);
      if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      fs.writeFileSync(savePath, buffer);
    } else if (textContent) {
      content = textContent;
      fileName = `paste_${Date.now()}`;
      const savePath = path.join(UPLOAD_DIR, `${fileName}.txt`);
      if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      fs.writeFileSync(savePath, content, "utf-8");
    } else {
      return NextResponse.json({ error: "请提供文件或文本内容" }, { status: 400 });
    }

    /* ── 内容截断（DeepSeek 上下文限制）──────── */
    const maxChars = 8000;
    const truncated = content.length > maxChars
      ? content.slice(0, maxChars) + "\n\n[文档过长，已截取前 8000 字进行解析]"
      : content;

    /* ── AI 解析 ────────────────────── */
    let parsed: { type: string; title: string; questions: unknown[]; keyPoints: string[]; region: string | null; qualityScore: number } | null = null;

    try {
      const response = await deepseek.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: PARSE_PROMPT },
          { role: "user", content: `请解析以下文档内容：\n\n${truncated}` },
        ],
        temperature: 0.3,
        max_tokens: 2048,
      });

      const resultText = response.choices[0]?.message?.content ?? "";
      // 尝试提取 JSON（可能被 markdown 包裹）
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch (parseErr) {
      console.error("[AI 解析失败]", parseErr);
    }

    /* ── 存储解析结果 ────────────────── */
    const id = `upload_${Date.now()}`;
    const resultPath = path.join(UPLOAD_DIR, `${id}_parsed.json`);
    const resultData = {
      id,
      originalFile: fileName,
      parsedAt: new Date().toISOString(),
      ...(parsed ?? { type: "未识别", title: fileName, questions: [], keyPoints: [], region: null, qualityScore: 0 }),
    };
    fs.writeFileSync(resultPath, JSON.stringify(resultData, null, 2), "utf-8");

    /* ── 更新记忆 ───────────────────── */
    const questionCount = parsed?.questions?.length ?? 0;
    appendUploadLog({
      id,
      fileName,
      type: fileType,
      parsedType: parsed?.type ?? "未识别",
      questionCount,
      date: new Date().toISOString().slice(0, 10),
      reviewed: false,
      filePath: resultPath,
    });

    if (parsed?.keyPoints?.length) {
      updatePreferences({ recentTopics: parsed.keyPoints });
    }

    return NextResponse.json({
      success: true,
      id,
      message: "资料已成功吸收，已自动匹配到您的复习计划中！",
      parsed,
      questionCount,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "处理失败";
    console.error("[Upload Error]", message);
    return NextResponse.json({ error: `资料解析失败：${message}` }, { status: 500 });
  }
}
