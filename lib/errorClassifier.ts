/**
 * 错题自动归类归档逻辑
 * 根据题目内容关键词自动判定所属模块与权重
 */

export interface ErrorEntry {
  id: string;
  question: string;
  category: ErrorCategory;
  difficulty: "basic" | "medium" | "hard";
  date: string;
}

export type ErrorCategory =
  | "wenyan"       // 文言文
  | "gushi"        // 古诗鉴赏
  | "xiandaiwen"   // 现代文阅读
  | "zuowen"       // 作文
  | "jiaoyuxue"    // 教育学
  | "xinlixue"     // 心理学
  | "kebiao"       // 新课标
  | "jiaoxue"      // 教学设计
  | "banzhuren" ;   // 班主任/教育法规

export interface CategoryMeta {
  key: ErrorCategory;
  label: string;
  subject: "语文" | "教综";
  weight: number; // 江苏教招该模块的推荐投入权重(%)
  recentCount: number;
  accuracy: number; // 0-100
}

/** 关键词 → 分类映射 */
const KEYWORD_MAP: [RegExp, ErrorCategory][] = [
  [/文言文|实词|虚词|断句|翻译|之乎者也|古文|字词/, "wenyan"],
  [/古诗|诗词|鉴赏|意象|手法|表现手法|情感/, "gushi"],
  [/现代文|阅读|论述文|实用类|文学类|主旨/, "xiandaiwen"],
  [/作文|写作|议论文|审题|立意|文体/, "zuowen"],
  [/教育学|教育产生|教学原则|教学方法|教育目的/, "jiaoyuxue"],
  [/心理学|认知|记忆|动机|学习迁移|发展|皮亚杰|维果茨基/, "xinlixue"],
  [/新课标|课程标准|核心素养|课程理念|学业质量|学习任务群/, "kebiao"],
  [/教学设计|教案|板书|说课|试讲|导入|教学环节/, "jiaoxue"],
  [/班主任|班级|突发事件|教育法规|教师法|义务教育法/, "banzhuren"],
];

/** 判定单题分类 */
export function classifyError(question: string): ErrorCategory {
  for (const [regex, cat] of KEYWORD_MAP) {
    if (regex.test(question)) return cat;
  }
  return "jiaoyuxue"; // 默认教综
}

/** 所有分类元数据 */
export const CATEGORY_META: Record<ErrorCategory, CategoryMeta> = {
  wenyan: { key: "wenyan", label: "文言文", subject: "语文", weight: 18, recentCount: 0, accuracy: 100 },
  gushi: { key: "gushi", label: "古诗鉴赏", subject: "语文", weight: 12, recentCount: 0, accuracy: 100 },
  xiandaiwen: { key: "xiandaiwen", label: "现代文阅读", subject: "语文", weight: 12, recentCount: 0, accuracy: 100 },
  zuowen: { key: "zuowen", label: "作文", subject: "语文", weight: 8, recentCount: 0, accuracy: 100 },
  jiaoyuxue: { key: "jiaoyuxue", label: "教育学", subject: "教综", weight: 15, recentCount: 0, accuracy: 100 },
  xinlixue: { key: "xinlixue", label: "心理学", subject: "教综", weight: 10, recentCount: 0, accuracy: 100 },
  kebiao: { key: "kebiao", label: "新课标", subject: "教综", weight: 15, recentCount: 0, accuracy: 100 },
  jiaoxue: { key: "jiaoxue", label: "教学设计", subject: "教综", weight: 8, recentCount: 0, accuracy: 100 },
  banzhuren: { key: "banzhuren", label: "班主任/法规", subject: "教综", weight: 2, recentCount: 0, accuracy: 100 },
};

/** 统计各分类准确率（基于错题记录） */
export function computeAccuracy(entries: ErrorEntry[]): Record<ErrorCategory, number> {
  const map = new Map<ErrorCategory, { correct: number; total: number }>();
  for (const e of entries) {
    const m = map.get(e.category) ?? { correct: 0, total: 0 };
    m.total++;
    map.set(e.category, m);
  }
  // Mock: 假设每道错题之后又做了 4 道同类题且全对 → accuracy = 80%
  const result = {} as Record<ErrorCategory, number>;
  for (const [cat] of Object.entries(CATEGORY_META)) {
    const key = cat as ErrorCategory;
    const m = map.get(key);
    result[key] = m ? Math.round((100 - m.total * 10)) : 100;
    if (result[key] < 10) result[key] = 10;
  }
  return result;
}
