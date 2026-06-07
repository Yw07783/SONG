/**
 * 个性化记忆系统 (Personalized Memory Store)
 * - 向量化用户偏好（学习风格 / 弱项模块 / 近期进度）
 * - 聊天历史摘要
 * - 文件上传记录
 */
import fs from "fs";
import path from "path";

const MEMORY_DIR = path.join(process.cwd(), "data", "question-bank");
const PREFERENCES_PATH = path.join(MEMORY_DIR, "preferences.json");
const CHAT_HISTORY_PATH = path.join(MEMORY_DIR, "chat_summary.json");
const UPLOAD_LOG_PATH = path.join(MEMORY_DIR, "upload_log.json");

/* ── 类型 ─────────────────────────────────── */

export interface UserPreferences {
  weakModules: string[];        // 薄弱模块关键词
  strongModules: string[];      // 擅长模块
  preferredStyle: "mnemonic" | "principle" | "hybrid"; // 口诀记忆 / 原理拆解 / 混合
  recentTopics: string[];       // 近期高频话题
  totalFilesUploaded: number;
  totalQuestionsParsed: number;
  lastActiveDate: string;
  feedbackHistory: { topic: string; sentiment: "positive" | "negative"; date: string }[];
}

export interface ChatMemoryEntry {
  date: string;
  topic: string;
  summary: string;
}

export interface UploadLogEntry {
  id: string;
  fileName: string;
  type: "pdf" | "docx" | "text";
  parsedType: string;   // AI 识别的资料类型
  questionCount: number;
  date: string;
  reviewed: boolean;
  filePath: string;
}

/* ── 默认偏好 ──────────────────────────────── */

const DEFAULT_PREFERENCES: UserPreferences = {
  weakModules: [],
  strongModules: [],
  preferredStyle: "hybrid",
  recentTopics: [],
  totalFilesUploaded: 0,
  totalQuestionsParsed: 0,
  lastActiveDate: new Date().toISOString().slice(0, 10),
  feedbackHistory: [],
};

/* ── 初始化 ────────────────────────────────── */

function ensureDir() {
  if (!fs.existsSync(MEMORY_DIR)) fs.mkdirSync(MEMORY_DIR, { recursive: true });
}

function readJSON<T>(filePath: string, defaults: T): T {
  ensureDir();
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
    }
  } catch { /* 忽略解析错误，使用默认值 */ }
  return defaults;
}

function writeJSON(filePath: string, data: unknown) {
  ensureDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

/* ── 偏好管理 ──────────────────────────────── */

export function getPreferences(): UserPreferences {
  return readJSON(PREFERENCES_PATH, DEFAULT_PREFERENCES);
}

export function updatePreferences(partial: Partial<UserPreferences>) {
  const current = getPreferences();
  const updated = {
    ...current,
    ...partial,
    lastActiveDate: new Date().toISOString().slice(0, 10),
    // 合并数组字段（不直接覆盖）
    weakModules: partial.weakModules ?? current.weakModules,
    strongModules: partial.strongModules ?? current.strongModules,
    recentTopics: partial.recentTopics
      ? [...new Set([...partial.recentTopics, ...current.recentTopics].slice(0, 30))]
      : current.recentTopics,
    feedbackHistory: partial.feedbackHistory ?? current.feedbackHistory,
  };
  writeJSON(PREFERENCES_PATH, updated);
  return updated;
}

export function recordFeedback(topic: string, sentiment: "positive" | "negative") {
  const prefs = getPreferences();
  prefs.feedbackHistory.push({ topic, sentiment, date: new Date().toISOString().slice(0, 10) });
  // 仅保留最近 50 条
  if (prefs.feedbackHistory.length > 50) {
    prefs.feedbackHistory = prefs.feedbackHistory.slice(-50);
  }
  writeJSON(PREFERENCES_PATH, prefs);
}

/* ── 聊天记忆 ──────────────────────────────── */

export function getChatMemory(): ChatMemoryEntry[] {
  return readJSON<ChatMemoryEntry[]>(CHAT_HISTORY_PATH, []);
}

export function appendChatMemory(entry: ChatMemoryEntry) {
  const memory = getChatMemory();
  memory.push(entry);
  // 仅保留最近 30 条摘要
  if (memory.length > 30) memory.shift();
  writeJSON(CHAT_HISTORY_PATH, memory);
}

/** 构建聊天记忆注入文本 */
export function buildMemoryPrompt(): string {
  const prefs = getPreferences();
  const memory = getChatMemory();
  const logs = getUploadLogs();

  if (
    prefs.weakModules.length === 0 &&
    memory.length === 0 &&
    logs.length === 0
  ) return "";

  const parts: string[] = [];

  if (prefs.weakModules.length > 0) {
    parts.push(`- 老宋当前薄弱模块：${prefs.weakModules.join("、")}`);
  }
  if (prefs.strongModules.length > 0) {
    parts.push(`- 老宋掌握较好的模块：${prefs.strongModules.join("、")}`);
  }
  if (prefs.preferredStyle) {
    const styleLabel = prefs.preferredStyle === "mnemonic" ? "口诀记忆" : prefs.preferredStyle === "principle" ? "原理拆解" : "混合";
    parts.push(`- 老宋偏好学习风格：${styleLabel}，请在此风格基础上给出建议`);
  }

  if (logs.length > 0) {
    const recent = logs.slice(0, 3);
    parts.push(`- 老宋近期上传了 ${logs.length} 份资料，最近一份是 ${recent[0]?.fileName ?? "—"}`);
    parts.push(`- 累计已解析 ${prefs.totalQuestionsParsed} 道题目`);
  }

  if (memory.length > 0) {
    const recentMem = memory.slice(-3);
    parts.push(`- 最近讨论话题：${recentMem.map((m) => m.topic).join(" · ")}`);
  }

  // 主动学习总结触发提示
  if (logs.length >= 3 && prefs.totalQuestionsParsed > 10) {
    parts.push(`
> ⚡ 主动总结提示：老宋最近投喂了 ${logs.length} 份文档，累计 ${prefs.totalQuestionsParsed} 道题。若无新问题，请主动根据这些数据做一次简短的阶段性总结，肯定进步并指出下一个攻坚方向。`);
  }

  const feedbackNeg = prefs.feedbackHistory.filter((f) => f.sentiment === "negative");
  if (feedbackNeg.length > 0) {
    parts.push(`- ⚠ 老宋表示过以下策略/建议不适用：${feedbackNeg.slice(-5).map((f) => f.topic).join("、")}。请避免类似建议。`);
  }

  return parts.length > 0
    ? `\n\n## 📝 长期记忆（老宋的学习档案）\n${parts.join("\n")}\n`
    : "";
}

/* ── 上传日志 ──────────────────────────────── */

export function getUploadLogs(): UploadLogEntry[] {
  return readJSON<UploadLogEntry[]>(UPLOAD_LOG_PATH, []);
}

export function appendUploadLog(entry: UploadLogEntry) {
  const logs = getUploadLogs();
  logs.push(entry);
  writeJSON(UPLOAD_LOG_PATH, logs);

  // 同步更新偏好统计
  const prefs = getPreferences();
  prefs.totalFilesUploaded = logs.length;
  prefs.totalQuestionsParsed = logs.reduce((sum, l) => sum + l.questionCount, 0);
  writeJSON(PREFERENCES_PATH, prefs);
}

export function markReviewed(id: string) {
  const logs = getUploadLogs();
  const entry = logs.find((l) => l.id === id);
  if (entry) {
    entry.reviewed = true;
    writeJSON(UPLOAD_LOG_PATH, logs);
  }
}
