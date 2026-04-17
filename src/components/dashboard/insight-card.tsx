"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, Info } from "lucide-react";
import Link from "next/link";

export function InsightCard() {
  const [loading, setLoading] = useState(false);

  return (
    <Card className="border border-slate-200 shadow-sm bg-white rounded-xl flex-col h-full overflow-hidden">
      <CardHeader className="pb-3 border-b border-blue-100 mb-4 bg-gradient-to-r from-blue-50 to-white">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-700 font-bold">
            <Sparkles className="w-5 h-5" />
            AI 分析インサイト
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6 gap-3">
          <Info className="w-8 h-8 text-slate-300" />
          <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-[240px]">
            実験データを登録すると、AIが自動で分析インサイトを生成します。
          </p>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center bg-white">
          <span className="inline-flex items-center gap-1.5 font-semibold">Gemini 3.1 Flash</span>
          <Link href="/analysis" className="text-blue-600 hover:text-blue-800 hover:underline font-bold transition-colors">
            詳細レポート →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
