"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import AIPredictModal from "./AIPredictModal";
import DataUploadZone from "./DataUploadZone";
import AdminReviewView from "./AdminReviewView";

/* ── Mock: 江苏十三市 → 区县 → 年份卷种 ───── */

const REGION_DATA: Record<string, string[]> = {
  南京市: ["鼓楼区", "玄武区", "秦淮区", "建邺区", "栖霞区", "江宁区", "浦口区", "六合区"],
  苏州市: ["姑苏区", "虎丘区", "吴中区", "相城区", "吴江区", "常熟市", "张家港市", "昆山市", "太仓市"],
  无锡市: ["梁溪区", "锡山区", "惠山区", "滨湖区", "新吴区", "江阴市", "宜兴市"],
  常州市: ["天宁区", "钟楼区", "新北区", "武进区", "金坛区", "溧阳市"],
  镇江市: ["京口区", "润州区", "丹徒区", "丹阳市", "扬中市", "句容市"],
  扬州市: ["广陵区", "邗江区", "江都区", "仪征市", "高邮市", "宝应县"],
  泰州市: ["海陵区", "高港区", "姜堰区", "兴化市", "靖江市", "泰兴市"],
  南通市: ["崇川区", "通州区", "海门区", "如东县", "启东市", "如皋市", "海安市"],
  徐州市: ["鼓楼区", "云龙区", "贾汪区", "泉山区", "铜山区", "丰县", "沛县", "睢宁县", "新沂市", "邳州市"],
  连云港市: ["连云区", "海州区", "赣榆区", "东海县", "灌云县", "灌南县"],
  淮安市: ["清江浦区", "淮安区", "淮阴区", "洪泽区", "涟水县", "盱眙县", "金湖县"],
  盐城市: ["亭湖区", "盐都区", "大丰区", "响水县", "滨海县", "阜宁县", "射阳县", "建湖县", "东台市"],
  宿迁市: ["宿城区", "宿豫区", "沭阳县", "泗阳县", "泗洪县"],
};

const YEARS = ["2025", "2024", "2023", "2022", "2021"];
const EXAM_TYPES = ["统考卷", "校招卷", "骨干教师卷"];

/* ── Mock: 各地区考情分析 ─────────────────── */

interface AnalysisData {
  redZone: { topic: string; freq: string }[];
  grayZone: string[];
  objPct: number;
  subjPct: number;
}

function getAnalysisFor(district: string): AnalysisData {
  const seed = district.length * 7 + district.charCodeAt(0);
  return {
    redZone: [
      { topic: "文言文实词辨析（120 常用实词）", freq: seed % 3 === 0 ? "近5年考4次" : "近5年考5次" },
      { topic: "新课标核心素养四维度简答", freq: seed % 2 === 0 ? "近5年考5次" : "近5年考4次" },
      { topic: "教学设计（教案）板块逻辑", freq: "近5年考5次" },
      { topic: seed % 2 === 0 ? "古诗鉴赏之意象分析" : "现代文阅读之主旨归纳", freq: "近5年考4次" },
    ],
    grayZone: [
      "文学常识·外国文学史",
      "语法修辞·复句层次划分",
      "作文·议论文写作理论",
      "教材教法·特殊教育融合策略",
    ],
    objPct: seed % 2 === 0 ? 42 : 38,
    subjPct: seed % 2 === 0 ? 58 : 62,
  };
}

/* ── Mock: 历年试卷 ────────────────────────── */

interface ExamEntry {
  id: string;
  year: string;
  type: string;
  label: string;
  questionCount: number;
}

function getExamsFor(city: string, district: string): ExamEntry[] {
  return YEARS.flatMap((y) =>
    EXAM_TYPES.map((t) => ({
      id: `${city}-${district}-${y}-${t}`,
      year: y,
      type: t,
      label: `${y}年${city}${district}${t}`,
      questionCount: t === "校招卷" ? 25 : t === "骨干教师卷" ? 30 : 35,
    })),
  );
}

/* ── 饼图：纯 CSS 实现 ────────────────────── */

function PieChart({ objPct, subjPct }: { objPct: number; subjPct: number }) {
  return (
    <div className="flex items-center gap-5">
      <div
        className="w-16 h-16 rounded-full shrink-0"
        style={{
          background: `conic-gradient(#e0b0b0 0deg ${objPct * 3.6}deg, #f5e8e8 ${objPct * 3.6}deg 360deg)`,
        }}
      />
      <div className="space-y-2 text-[13px] tracking-wide">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-rose-400/60 shrink-0" />
          <span className="text-stone-500">客观题</span>
          <span className="text-stone-600 font-medium tabular-nums">{objPct}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-rose-100 shrink-0" />
          <span className="text-stone-500">主观题</span>
          <span className="text-stone-600 font-medium tabular-nums">{subjPct}%</span>
        </div>
      </div>
    </div>
  );
}

/* ── 组件 ─────────────────────────────────── */

export default function ExamDashboard() {
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [year, setYear] = useState("");
  const [examType, setExamType] = useState("");
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const districts = useMemo(() => (city ? REGION_DATA[city] ?? [] : []), [city]);
  const analysis = useMemo(() => (district ? getAnalysisFor(district) : null), [district]);
  const exams = useMemo(
    () => (city && district ? getExamsFor(city, district) : []),
    [city, district],
  );

  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      if (year && e.year !== year) return false;
      if (examType && e.type !== examType) return false;
      return true;
    });
  }, [exams, year, examType]);

  const handleCityChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setCity(e.target.value);
    setDistrict("");
    setYear("");
    setExamType("");
  }, []);

  const showDashboard = city && district;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 pt-8 pb-12 space-y-8">

          {/* ── 标题 + 上传/审核入口 ──────── */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.2em] text-stone-300 uppercase">
                靶向题库
              </p>
              <h2 className="text-xl font-medium text-stone-700 tracking-wide mt-1">
                地区选单 · 考情透视
              </h2>
            </div>
            <div className="flex items-center gap-2 shrink-0 pt-1">
              <DataUploadZone />
              <AdminReviewView />
            </div>
          </div>

          {/* ── 三级联动选择器 ──────────────── */}
          <div className="bg-white rounded-2xl border border-stone-100 px-6 py-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 城市 */}
              <div>
                <label className="block text-[12px] text-stone-400 tracking-wide mb-1.5">城市</label>
                <SelectWrapper>
                  <select value={city} onChange={handleCityChange} className="select-base">
                    <option value="">江苏十三市…</option>
                    {Object.keys(REGION_DATA).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </SelectWrapper>
              </div>

              {/* 区县 */}
              <div>
                <label className="block text-[12px] text-stone-400 tracking-wide mb-1.5">区县</label>
                <SelectWrapper>
                  <select
                    value={district}
                    onChange={(e) => { const d = e.target.value; setDistrict(d); setYear(""); setExamType(""); if (d && typeof window !== "undefined") { const key = `${city}·${d}`; localStorage.setItem("jiaozhao_selected_district", key); } }}
                    disabled={!city}
                    className="select-base"
                  >
                    <option value="">{city ? "选择区县…" : "请先选城市"}</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </SelectWrapper>
              </div>

              {/* 年份 */}
              <div>
                <label className="block text-[12px] text-stone-400 tracking-wide mb-1.5">年份</label>
                <SelectWrapper>
                  <select value={year} onChange={(e) => setYear(e.target.value)} disabled={!district} className="select-base">
                    <option value="">全部年份</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}年</option>
                    ))}
                  </select>
                </SelectWrapper>
              </div>

              {/* 卷种 */}
              <div>
                <label className="block text-[12px] text-stone-400 tracking-wide mb-1.5">卷种</label>
                <SelectWrapper>
                  <select value={examType} onChange={(e) => setExamType(e.target.value)} disabled={!district} className="select-base">
                    <option value="">全部卷种</option>
                    {EXAM_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </SelectWrapper>
              </div>
            </div>
          </div>

          {/* ── AI 考情透视面板 ──────────────── */}
          {showDashboard && analysis && (
            <div className="space-y-6" style={{ animation: "taskSlideIn 0.5s ease-out both" }}>
              {/* 面板标题栏 + AI 预测按钮 */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-[11px] tracking-[0.2em] text-stone-300 uppercase">
                    考情透视
                  </p>
                  <p className="text-[13px] text-stone-400 mt-0.5 tracking-wide">
                    {city} · {district} 出题规律总结
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setAiModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl text-[14px] font-medium tracking-wide text-white shadow-[0_4px_20px_-6px_rgba(180,120,120,0.4)] transition-all duration-300 hover:shadow-[0_6px_24px_-4px_rgba(180,120,120,0.5)] active:scale-[0.985] touch-target"
                  style={{
                    background: "linear-gradient(135deg, #e8b8b8 0%, #d49a9a 50%, #c88080 100%)",
                  }}
                >
                  <span>✨</span>
                  <span>AI 预测模拟卷生成</span>
                </button>
              </div>

              {/* 三栏卡片：红区 / 灰区 / 占比 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* 🔴 高频红区 */}
                <div className="bg-white rounded-2xl border border-rose-100/60 px-5 py-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)]">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">🔴</span>
                    <h3 className="text-[13px] font-medium text-stone-600 tracking-wide">
                      高频红区 · 必考重点
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {analysis.redZone.map((item, i) => (
                      <li key={i} className="text-[13px] text-stone-600 leading-relaxed tracking-wide pl-3 border-l-2 border-rose-300/60">
                        <span>{item.topic}</span>
                        <span className="block text-[11px] text-rose-400/80 mt-0.5">{item.freq}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ⚪ 避坑灰区 */}
                <div className="bg-white rounded-2xl border border-stone-100 px-5 py-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)]">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">⚪</span>
                    <h3 className="text-[13px] font-medium text-stone-600 tracking-wide">
                      避坑灰区 · 几乎不考
                    </h3>
                  </div>
                  <ul className="space-y-2.5">
                    {analysis.grayZone.map((item, i) => (
                      <li key={i} className="text-[13px] text-stone-400 leading-relaxed tracking-wide pl-3 border-l-2 border-stone-200">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 📊 题型占比 */}
                <div className="bg-white rounded-2xl border border-stone-100 px-5 py-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)]">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">📊</span>
                    <h3 className="text-[13px] font-medium text-stone-600 tracking-wide">
                      题型占比
                    </h3>
                  </div>
                  <div className="flex justify-center pt-1">
                    <PieChart objPct={analysis.objPct} subjPct={analysis.subjPct} />
                  </div>
                  <p className="text-[11px] text-stone-300 text-center mt-3 tracking-wide">
                    基于近5年真题统计
                  </p>
                </div>
              </div>

              {/* ── 历年试卷列表 ──────────────── */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[11px] tracking-[0.2em] text-stone-300 uppercase">
                      历年试卷
                    </p>
                    <p className="text-[13px] text-stone-400 mt-0.5 tracking-wide">
                      点击进入分屏刷题
                    </p>
                  </div>
                  <span className="text-[12px] text-stone-300 tracking-wide">
                    共 {filteredExams.length} 套
                  </span>
                </div>

                {filteredExams.length === 0 ? (
                  <div className="text-center py-10 text-[13px] text-stone-300 tracking-wide">
                    请选择筛选条件查看历年试卷
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredExams.map((exam) => (
                      <Link
                        key={exam.id}
                        href={`/question-bank/${encodeURIComponent(exam.id)}`}
                        className="group flex flex-col gap-2 px-5 py-4 bg-white rounded-2xl border border-stone-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.03)] transition-all duration-300 hover:border-rose-200/60 hover:shadow-[0_4px_16px_-6px_rgba(180,130,130,0.1)] touch-target"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[14px] font-medium text-stone-600 tracking-wide group-hover:text-rose-600 transition-colors">
                            {exam.label}
                          </span>
                          <svg
                            width="14" height="14" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor"
                            strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
                            className="text-stone-300 group-hover:text-rose-400 transition-colors"
                          >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </div>
                        <span className="text-[12px] text-stone-300 tracking-wide">
                          {exam.questionCount} 题 · {exam.type}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── 未选中提示 ──────────────────── */}
          {!showDashboard && (
            <div className="text-center py-16">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-rose-50 mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-rose-300">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <p className="text-[15px] text-stone-400 tracking-wide">
                请在上方选择城市和区县
              </p>
              <p className="text-[13px] text-stone-300 mt-1.5 tracking-wide">
                系统将为你透视该区历年出题规律
              </p>
            </div>
          )}

          {/* 底部留白 */}
          <div className="h-4" />
        </div>
      </div>

      {/* AI 预测弹窗 */}
      <AIPredictModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        city={city}
        district={district}
      />
    </div>
  );
}

/* ── 下拉框包装器 ──────────────────────────── */

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <svg
        width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor"
        strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}
