"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useDrawer } from "@/contexts/DrawerContext";
import { useFluxImmersive } from "@/contexts/FluxImmersiveContext";
import RewardGift from "@/components/RewardGift";
import SettingsPopover from "@/components/SettingsPopover";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: "/",
    label: "备考罗盘",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M16.24 7.76L14.12 14.12L7.76 16.24L9.88 9.88L16.24 7.76Z" />
      </svg>
    ),
  },
  {
    href: "/question-bank",
    label: "靶向题库",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
      </svg>
    ),
  },
  {
    href: "/review",
    label: "错题与复盘",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
        <path d="M12 18v-6" />
        <path d="M9 15h6" />
      </svg>
    ),
  },
  {
    href: "/energy",
    label: "能量补给站",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    href: "/journal",
    label: "实习日记",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { toggle } = useDrawer();
  const { immersive } = useFluxImmersive();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`
        flex flex-col h-full w-56 lg:w-60 bg-rose-50/80 border-r border-rose-100/60 select-none
        transition-all duration-500 ease-in-out
        ${immersive ? "-translate-x-full opacity-0 pointer-events-none" : "translate-x-0 opacity-100"}
      `}
    >
      {/* 品牌区 */}
      <div className="flex items-center gap-2.5 px-5 pt-8 pb-6">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-rose-200/50">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-rose-600/70"
          >
            <path d="M12 2L2 7L12 12L22 7L12 2Z" />
            <path d="M2 17L12 22L22 17" />
            <path d="M2 12L12 17L22 12" />
          </svg>
        </div>
        <span className="text-base font-medium tracking-wide text-rose-800/70">
          教招备考
        </span>

        {/* 奖励彩蛋 */}
        <RewardGift />

        {/* 设置 */}
        <SettingsPopover />
      </div>

      {/* 导航菜单 */}
      <nav className="flex flex-col gap-1 px-3 flex-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-xl
                text-[15px] leading-none tracking-wide
                transition-colors duration-200
                touch-target
                ${
                  active
                    ? "bg-white text-rose-700 shadow-sm"
                    : "text-stone-500 hover:text-rose-600 hover:bg-white/60"
                }
              `}
            >
              <span className={active ? "text-rose-500" : "text-stone-400"}>
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 底部操作区 */}
      <div className="px-3 pb-6">
        <button
          type="button"
          onClick={toggle}
          className="
            w-full flex items-center gap-3 px-3 py-3 rounded-xl
            text-[15px] leading-none tracking-wide
            text-stone-400 hover:text-rose-500
            hover:bg-white/60
            transition-colors duration-200
            touch-target
          "
          aria-label="打开素材灵感库"
        >
          <span className="text-lg">💡</span>
          <span className="font-medium">素材灵感库</span>
        </button>
      </div>
    </aside>
  );
}
