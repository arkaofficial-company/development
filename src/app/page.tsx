"use client";

import { useEffect, useState } from "react";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { InsightCard } from "@/components/dashboard/insight-card";
import { ClipboardList, Activity, Users, Loader2 } from "lucide-react";
import { db } from "@/lib/db";

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, subjects: 0, analyses: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const experiments = await db.getExperiments();
      const uniqueSubjects = new Set(experiments.map(e => e.subject).filter(Boolean));

      setStats({
        total: experiments.length,
        subjects: uniqueSubjects.size,
        analyses: experiments.length, // 各データ登録時に分析を実行しているため同数
      });

      // 直近5件からチャートデータを生成 — 50からの偏差軸
      const recent = experiments.slice(0, 5).reverse();
      const cd = recent.map((exp) => {
        const allVals: number[] = [];
        if (exp.rows && exp.rows.length > 0) {
          exp.rows.forEach((r: any) => {
            r.values.forEach((v: number | null) => {
              if (v != null) allVals.push(v);
            });
          });
        }
        const avg = allVals.length > 0
          ? Math.round((allVals.reduce((a: number, b: number) => a + b, 0) / allVals.length) * 10) / 10
          : 0;
        const deviation = allVals.length > 0
          ? Math.round((allVals.reduce((a: number, b: number) => a + Math.abs(b - 50), 0) / allVals.length) * 10) / 10
          : 0;
        const dateLabel = exp.experiment_date
          ? new Date(exp.experiment_date).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })
          : "-";
        return { name: dateLabel, avg, deviation };
      });
      setChartData(cd);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div id="dashboard-content" className="space-y-6 pb-10">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">ダッシュボード</h2>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            プロジェクトの全体傾向と最新のAI分析レポート
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-5 transition-shadow hover:shadow-md">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-lg">
            <ClipboardList className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">総実験データ数</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{stats.total} <span className="text-base font-semibold text-slate-500">件</span></h3>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-5 transition-shadow hover:shadow-md">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">対象プロジェクト</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{stats.subjects} <span className="text-base font-semibold text-slate-500">名</span></h3>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-5 transition-shadow hover:shadow-md">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-lg">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">AI分析生成</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{stats.analyses} <span className="text-base font-semibold text-slate-500">回</span></h3>
          </div>
        </div>
      </div>
      
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TrendChart data={chartData} />
          </div>
          <div className="lg:col-span-1">
            <InsightCard />
          </div>
        </div>
      )}
    </div>
  );
}
