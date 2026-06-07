/* ── Mock 阅读材料：周敦颐《爱莲说》 ────── */

const READING_MOCK = {
  title: "爱莲说",
  author: "宋 · 周敦颐",
  paragraphs: [
    "水陆草木之花，可爱者甚蕃。晋陶渊明独爱菊。自李唐来，世人甚爱牡丹。",
    "予独爱莲之出淤泥而不染，濯清涟而不妖，中通外直，不蔓不枝，香远益清，亭亭净植，可远观而不可亵玩焉。",
    "予谓菊，花之隐逸者也；牡丹，花之富贵者也；莲，花之君子者也。噫！菊之爱，陶后鲜有闻。莲之爱，同予者何人？牡丹之爱，宜乎众矣！",
  ],
  source: "选自《周元公集》",
} as const;

/* ── 组件 ─────────────────────────────────── */

export default function ReadingPanel() {
  return (
    <section className="flex flex-col h-full bg-white">
      {/* 顶部标题栏 */}
      <div className="shrink-0 px-6 pt-7 pb-5 border-b border-stone-100/80">
        <p className="text-[11px] tracking-[0.2em] text-stone-300 uppercase mb-2">
          阅读材料
        </p>
        <h2 className="text-xl font-medium tracking-wide text-stone-700">
          {READING_MOCK.title}
        </h2>
        <p className="text-[13px] text-stone-400 mt-1 tracking-wide">
          {READING_MOCK.author}
        </p>
      </div>

      {/* 正文滚动区 */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-6 py-6">
        <div className="space-y-4 text-[16px] leading-[2] tracking-wide text-stone-600">
          {READING_MOCK.paragraphs.map((p, i) => (
            <p key={i} className="indent-8">
              {p}
            </p>
          ))}
        </div>

        {/* 出处标注 */}
        <div className="mt-8 pt-5 border-t border-stone-100">
          <p className="text-[12px] text-stone-300 tracking-wide">
            {READING_MOCK.source}
          </p>
        </div>
      </div>
    </section>
  );
}
