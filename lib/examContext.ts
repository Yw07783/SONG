/* ── 江苏十三市考情速查数据 ──────────────────── */

export interface ExamContextItem {
  city: string;
  district: string;
  summary: string;
  redZone: string[];      // 必考重点
  grayZone: string[];     // 几乎不考（严禁引导）
  objSubjRatio: string;   // 客观:主观
  examStyle: string;      // 出题风格简述
  recentTrends: string;   // 近年趋势
  daysUntilExam?: number; // Mock: 距考试天数
}

/* ── 基准数据（覆盖江苏主要考区）────────────────── */

const EXAM_DATA: ExamContextItem[] = [
  {
    city: "南京市", district: "鼓楼区",
    summary: "南京鼓楼区历年偏好新课标应用与教学设计，客观题占比高，注重理论与实践结合。",
    redZone: ["2022版新课标四大核心素养", "教学设计（教案）板块逻辑", "文言文实词辨析", "现代文阅读之主旨归纳"],
    grayZone: ["语法修辞·复句层次划分", "文学常识·外国文学史", "作文·议论文理论"],
    objSubjRatio: "42:58",
    examStyle: "稳健规范，紧扣课标，不设偏题怪题",
    recentTrends: "近2年新课标简答题分值持续增加，主观题倾向情境化命题",
    daysUntilExam: 45,
  },
  {
    city: "南京市", district: "玄武区",
    summary: "玄武区卷重视古诗鉴赏与写作能力考查，主观题分值占比高于全市平均。",
    redZone: ["古诗鉴赏之意象分析", "作文审题与立意", "新课标简答题", "班级管理案例分析"],
    grayZone: ["语法修辞·复句层次划分", "教材教法·特殊教育融合策略", "外国文学史"],
    objSubjRatio: "35:65",
    examStyle: "灵活开放，重语文素养与应用能力",
    recentTrends: "情境化作文命题趋势明显，2024年首次采用任务驱动型作文",
    daysUntilExam: 45,
  },
  {
    city: "苏州市", district: "姑苏区",
    summary: "苏州卷整体难度偏高，文言文与古诗鉴赏占分重大，重视传统文化素养。",
    redZone: ["文言文阅读·断句与翻译", "古诗鉴赏·手法与情感分析", "新课标简答题", "教育心理学·学习动机"],
    grayZone: ["现代汉语语法", "教育测量与评价·统计术语"],
    objSubjRatio: "38:62",
    examStyle: "典雅厚重，重文言功底与审美素养",
    recentTrends: "2024年新增'群文阅读'题型，考查多文本比较分析能力",
    daysUntilExam: 60,
  },
  {
    city: "无锡市", district: "梁溪区",
    summary: "无锡卷中规中矩，教育综合知识占比稳定，适合系统备考。",
    redZone: ["教育学·教学原则与方法", "心理学·学习理论", "文言文实词", "新课标四大核心素养"],
    grayZone: ["作文理论·文体知识", "教材教法·特殊教育融合"],
    objSubjRatio: "45:55",
    examStyle: "均衡稳健，题量适中，偏重记忆与理解层级",
    recentTrends: "近3年未出现较大变化，建议按常规节奏备考",
    daysUntilExam: 75,
  },
  {
    city: "徐州市", district: "鼓楼区",
    summary: "徐州卷偏好教育学理论与教育法规，客观题居多，重基础知识考查。",
    redZone: ["教育学·教育的产生与发展", "教育法规·教师法/义务教育法", "新课标课程理念", "心理学·认知发展"],
    grayZone: ["古诗鉴赏·表现手法深析", "作文·议论文写作"],
    objSubjRatio: "48:52",
    examStyle: "重基础知识，题面直接，少设陷阱",
    recentTrends: "2024年首次出现教育热点材料分析题",
    daysUntilExam: 30,
  },
  {
    city: "南通市", district: "崇川区",
    summary: "南通卷以高难度著称，主观题考查深度远超其他区县，教学设计要求完整。",
    redZone: ["完整教学设计（含学情分析+板书）", "文言文·全文翻译+主旨分析", "教育心理学·学习迁移理论", "新课标·学业质量标准"],
    grayZone: ["语法修辞基础", "文学常识·中国现当代"],
    objSubjRatio: "30:70",
    examStyle: "魔鬼级别，重深度思维与教学实践能力",
    recentTrends: "2024年主观题增设'限时说课'书面模拟，考查教学逻辑",
    daysUntilExam: 15,
  },
];

/* ── 查询 ────────────────────────────────────── */

export function getExamContext(city: string, district: string): ExamContextItem | null {
  return EXAM_DATA.find(
    (e) => e.city === city && (e.district === district || district.includes(e.district)),
  ) ?? null;
}

export function getDefaultContext(): ExamContextItem {
  return EXAM_DATA[0]; // 默认南京鼓楼
}

/* ── 构建考情注入文本 ────────────────────────── */

export function buildContextPrompt(ctx: ExamContextItem | null): string {
  if (!ctx) return "";

  const daysInfo = ctx.daysUntilExam
    ? `\n- ⏰ 距考试还有 **${ctx.daysUntilExam} 天**${
        ctx.daysUntilExam <= 15
          ? "（进入冲刺期，必须重真题轻新课）"
          : ctx.daysUntilExam <= 30
            ? "（进入强化期，真题+专项并行）"
            : "（备考时间充裕，建议专项攻坚薄弱模块）"
      }`
    : "";

  return `
## 老宋当前目标考区：${ctx.city} · ${ctx.district}

### 该区出题规律
- 📊 客观:主观 ≈ ${ctx.objSubjRatio}
- 📝 风格：${ctx.examStyle}
- 📈 趋势：${ctx.recentTrends}${daysInfo}

### 🔴 高频红区（必考重点，必须引导练习）
${ctx.redZone.map((z) => `- ${z}`).join("\n")}

### ⚪ 避坑灰区（几乎不考，严禁引导相关练习）
${ctx.grayZone.map((z) => `- ${z}`).join("\n")}

> 老袁回复规则：若老宋问到灰区内的内容，直接告诉她「这个考点在 ${ctx.district} 近 5 年没考过，别浪费时间」，并立刻将话题拉回红区。`;
}
