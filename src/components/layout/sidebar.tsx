"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Home, ClipboardList, PlusCircle, BarChart2, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "ダッシュボード", match: (p: string) => p === "/" },
  { href: "/experiments", icon: ClipboardList, label: "実験データ一覧", match: (p: string) => p.startsWith("/experiments") && p !== "/experiments/new" },
  { href: "/analysis", icon: BarChart2, label: "AI 詳細分析", match: (p: string) => p === "/analysis" },
];

function NavContent({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  return (
    <>
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-b from-slate-800/50 to-transparent relative z-10">
        <div>
          <h1 className="text-xl font-bold tracking-wider text-white">Lab Connect</h1>
          <p className="text-xs text-blue-400 mt-1 font-bold tracking-widest uppercase opacity-80">Arcadiamond</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors md:hidden" type="button">
            <X className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      <nav className="flex-1 py-6 px-4 w-full relative z-10">
        <ul className="space-y-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-300",
                  item.match(pathname)
                    ? "bg-gradient-to-r from-blue-600/20 to-blue-600/5 text-blue-300 border border-blue-500/20 shadow-inner translate-x-1"
                    : "text-slate-400 hover:bg-slate-800/80 hover:text-white border border-transparent hover:translate-x-1"
                )}
              >
                <item.icon className="w-5 h-5 opacity-90" />
                {item.label}
              </Link>
            </li>
          ))}

          <div className="pt-6 mt-4 border-t border-white/5">
            <li>
              <Link
                href="/experiments/new"
                onClick={onClose}
                className={cn(
                  "flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg",
                  pathname === "/experiments/new"
                    ? "bg-blue-600 text-white shadow-blue-500/30 ring-2 ring-blue-500/20 ring-offset-2 ring-offset-slate-900 border border-transparent scale-[1.02]"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/5 hover:scale-[1.02]"
                )}
              >
                <PlusCircle className="w-4 h-4" />
                新規データ登録
              </Link>
            </li>
          </div>
        </ul>
      </nav>

      <div className="p-4 border-t border-white/10 bg-slate-900/50 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs ring-1 ring-white/10 shadow-sm">
            AR
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-slate-200 truncate">ARCA Researcher</p>
            <p className="text-[10px] text-blue-400/80 truncate uppercase tracking-widest font-bold">Admin</p>
          </div>
        </div>
      </div>
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── デスクトップ: 固定サイドバー ── */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900 h-screen sticky top-0 flex-col hidden md:flex text-slate-100 shadow-2xl z-20 flex-shrink-0 relative overflow-hidden">
        <NavContent pathname={pathname} />
      </aside>

      {/* ── モバイル: オーバーレイ + スライドイン ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog">
          {/* 背景オーバーレイ */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          {/* サイドバー本体 */}
          <aside className="fixed top-0 left-0 bottom-0 w-72 bg-slate-900 text-slate-100 flex flex-col shadow-2xl overflow-hidden animate-slide-in">
            <NavContent pathname={pathname} onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* ── ハンバーガーボタン (Headerから使えるようにグローバルにエクスポート) ── */}
      <MobileMenuButton onOpen={() => setMobileOpen(true)} />
    </>
  );
}

// Headerで使うためにモバイルメニューボタンをexport
function MobileMenuButton({ onOpen }: { onOpen: () => void }) {
  // このコンポーネントはHeader内に配置される代わりに、
  // window上のカスタムイベントで通信する。
  // 代わりに、ここではCSS displayで直接配置する
  if (typeof window !== "undefined") {
    (window as any).__openMobileMenu = onOpen;
  }
  return null;
}
