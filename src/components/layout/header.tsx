"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { ExportButton } from "@/components/export/export-button";

export function Header() {
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("ja-JP", {
        year: "numeric", month: "long", day: "numeric", weekday: "short",
      })
    );
  }, []);

  const handleOpenMenu = () => {
    if (typeof window !== "undefined" && (window as any).__openMobileMenu) {
      (window as any).__openMobileMenu();
    }
  };

  return (
    <header className="h-14 md:h-16 border-b border-slate-200 bg-white/80 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shadow-sm flex-shrink-0">
      {/* モバイル左側: ハンバーガー + ロゴ */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          type="button"
          onClick={handleOpenMenu}
          className="p-2 -ml-1 hover:bg-slate-100 active:bg-slate-200 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>
        <span className="font-bold text-slate-800 text-sm">Lab Connect</span>
      </div>

      {/* デスクトップ左側: パンくず */}
      <div className="hidden md:flex flex-1">
        <h2 className="text-sm font-medium text-slate-500">
          Arcadiamond / <span className="text-slate-800 font-semibold">Workspace</span>
        </h2>
      </div>

      {/* 右側: エクスポート + 日付 */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:block">
          <ExportButton />
        </div>
        {today && (
          <>
            <div className="h-5 w-px bg-slate-200 hidden sm:block" />
            <time className="text-xs sm:text-sm font-medium text-slate-600 tabular-nums">
              {today}
            </time>
          </>
        )}
      </div>
    </header>
  );
}
