/**
 * 全局 Spring 动效配置（阻尼感完全统一）
 * 所有 framer-motion 组件必须引用此文件中的常量。
 */

/** 页面切换 */
export const PAGE_TRANSITION = {
  duration: 0.3,
  ease: [0.25, 0.46, 0.45, 0.94] as const, // easeInOutCubic
};

/** 抽屉/模态框入场（带弹性） */
export const DRAWER_SPRING = {
  type: "spring" as const,
  stiffness: 280,
  damping: 30,
};

/** 抽屉/模态框出场（略快） */
export const DRAWER_EXIT = {
  type: "spring" as const,
  stiffness: 300,
  damping: 28,
};

/** 弹窗入场（紧致） */
export const MODAL_SPRING = {
  type: "spring" as const,
  stiffness: 400,
  damping: 28,
};

/** 按钮 Tap */
export const TAP_SCALE = { scale: 0.96 };

/** 卡片悬浮 */
export const HOVER_LIFT = { y: -2 };

/** 淡入上移 */
export const FADE_UP = { opacity: 0, y: 10 };
export const FADE_DOWN = { opacity: 0, y: -8 };
