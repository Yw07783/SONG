"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDrawer } from "@/contexts/DrawerContext";

/* ── Mock 素材数据 ────────────────────────── */

interface MaterialItem {
  id: string;
  quote: string;
  source?: string;
}

interface MaterialCategory {
  emoji: string;
  title: string;
  items: MaterialItem[];
}

const MOCK_MATERIALS: MaterialCategory[] = [
  {
    emoji: "✨",
    title: "新课标必背金句",
    items: [
      { id: "g1", quote: "语文课程是一门学习国家通用语言文字运用的综合性、实践性课程。", source: "《义务教育语文课程标准（2022年版）》" },
      { id: "g2", quote: "立足学生核心素养发展，充分发挥语文课程育人功能。", source: "《义务教育语文课程标准（2022年版）》" },
      { id: "g3", quote: "义务教育语文课程培养的核心素养，是学生在积极的语文实践活动中积累、建构并在真实的语言运用情境中表现出来的。", source: "《义务教育语文课程标准（2022年版）》" },
    ],
  },
  {
    emoji: "📝",
    title: "文言文导入模板",
    items: [
      { id: "w1", quote: "同学们，今天我们要穿越千年，与一位____（朝代）的____（身份）对话。他就是____（作者），让我们走进他的名篇《____》。", source: "情境导入 · 通用模板" },
      { id: "w2", quote: "请大家看大屏幕上的这幅____（图片/书法），你们能联想到我们学过的哪篇古文吗？今天，我们将继续探索文言文的魅力。", source: "视觉导入 · 通用模板" },
      { id: "w3", quote: "上节课我们学习了____，大家还记得____吗？今天我们将运用这个方法，自主学习《____》。", source: "温故知新 · 通用模板" },
    ],
  },
  {
    emoji: "🧠",
    title: "班级突发事件处理",
    items: [
      { id: "c1", quote: "课堂上两名学生发生口角争执。处理原则：① 立即制止，冷静隔离；② 课后分别谈话，了解原委；③ 引导双方换位思考，达成和解；④ 以此为契机开展班会，强化班级公约。", source: "教育机智 · 课堂冲突" },
      { id: "c2", quote: "一名学生突然在课堂上哭泣。处理原则：① 低声安抚，不公开追问；② 安排同桌陪同去办公室或医务室；③ 课后私下关心，了解家庭或同伴困扰；④ 必要时联系班主任与家长沟通。", source: "教育机智 · 情绪危机" },
      { id: "c3", quote: "全班大面积未完成作业。处理原则：① 不当堂发怒或集体惩罚；② 询问原因——是任务量过大还是学情薄弱；③ 分层布置，给予补交期限；④ 反思自身教学节奏与作业设计。", source: "教育机智 · 作业管理" },
    ],
  },
];

/* ── 组件 ─────────────────────────────────── */

export default function InspirationDrawer() {
  const { open, close } = useDrawer();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={close}
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-stone-900/15 backdrop-blur-[1px]"
          />

          {/* 抽屉 */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="素材灵感库"
            initial={{ x: "100%" }}
            animate={{
              x: 0,
              transition: { type: "spring", stiffness: 280, damping: 30 },
            }}
            exit={{
              x: "100%",
              transition: { type: "spring", stiffness: 300, damping: 28 },
            }}
            className="fixed top-0 right-0 z-50 h-full w-[min(400px,85vw)] bg-rose-50/95 backdrop-blur-xl border-l border-rose-100/60 shadow-[-8px_0_40px_-16px_rgba(140,100,100,0.12)] flex flex-col"
          >
            {/* 头部 */}
            <div className="shrink-0 flex items-center justify-between px-6 pt-7 pb-5 border-b border-rose-100/50">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">💡</span>
                <h2 className="text-[17px] font-medium tracking-wide text-stone-600">素材灵感库</h2>
              </div>
              <button
                type="button"
                onClick={close}
                className="flex items-center justify-center w-9 h-9 rounded-xl text-stone-300 hover:text-stone-500 hover:bg-white/60 transition-colors duration-200 touch-target"
                aria-label="关闭素材库"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* 内容 */}
            <div className="flex-1 overflow-y-auto hide-scrollbar px-5 py-6 space-y-8">
              {MOCK_MATERIALS.map((cat) => (
                <section key={cat.title}>
                  <h3 className="flex items-center gap-2 text-[14px] font-medium tracking-wide text-stone-500 mb-4 px-1">
                    <span>{cat.emoji}</span>
                    <span>{cat.title}</span>
                  </h3>
                  <div className="space-y-3">
                    {cat.items.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + idx * 0.06, duration: 0.35, ease: "easeOut" }}
                        whileHover={{ scale: 1.02, boxShadow: "0 6px 22px -8px rgba(180,130,130,0.12)" }}
                        className="card-hover bg-white/80 rounded-2xl px-5 py-4 border border-rose-100/40"
                      >
                        <p className="text-[14px] leading-relaxed text-stone-600 tracking-wide">{item.quote}</p>
                        {item.source && (
                          <p className="text-[11px] text-stone-300 tracking-wide mt-2.5 pt-2.5 border-t border-stone-50">{item.source}</p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* 底部 */}
            <div className="shrink-0 px-6 py-4 border-t border-rose-100/50 bg-white/30">
              <p className="text-[11px] text-stone-300 text-center tracking-wide">长按素材可复制 · 持续更新中</p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
