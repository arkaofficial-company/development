"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ReferenceLine, Legend,
  LineChart, Line, Cell,
} from "recharts";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, FileText, Loader2, BarChart2, Target, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { ExportButton } from "@/components/export/export-button";

const COL_NAMES = ["抵抗力", "短期的精神系", "感情系", "こだわり性", "体内エネルギー", "生理的感情", "長期的精神系"];
const IDEAL = 50;

export default function DeepAnalysisPage() {
  const [dataCount, setDataCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportText, setReportText] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [experiments, setExperiments] = useState<any[]>([]);
  
  // localStorageから直近レポートを復元
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lab_report");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.text) setReportText(parsed.text);
        if (parsed.date) setReportDate(parsed.date);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const data = await db.getExperiments();
      setExperiments(data);
      setDataCount(data.length);
    };
    fetchData();
  }, []);

  const generateReport = async () => {
    if (experiments.length === 0) {
      toast.error("保存されたデータがありません");
      return;
    }
    
    setIsGenerating(true);
    try {
      const res = await fetch("/api/analysis/deep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experiments: experiments })
      });
      const result = await res.json();
      if(result.success) {
        const now = new Date().toLocaleString("ja-JP");
        setReportText(result.text);
        setReportDate(now);
        // localStorageに保存
        localStorage.setItem("lab_report", JSON.stringify({ text: result.text, date: now }));
        toast.success("詳細レポートが生成されました");
      } else {
        throw new Error("Failed to generate");
      }
    } catch {
      toast.error("レポートの生成に失敗しました");
    } finally {
      setIsGenerating(false);
    }
  };

  // ── グラフデータ生成 ──

  // 1. 各項目の「50からの平均偏差」棒グラフ
  const deviationData = useMemo(() => {
    return COL_NAMES.map((name, colIdx) => {
      const allVals: number[] = [];
      experiments.forEach(exp => {
        (exp.rows || []).forEach((r: any) => {
          if (r.values[colIdx] != null) allVals.push(r.values[colIdx]);
        });
      });
      const avg = allVals.length > 0
        ? Math.round((allVals.reduce((a, b) => a + b, 0) / allVals.length) * 10) / 10
        : 0;
      const deviation = Math.round((avg - IDEAL) * 10) / 10;
      return { name, avg, deviation, count: allVals.length };
    });
  }, [experiments]);

  // 2. 実験ごとの時系列推移（全7項目の平均が50にどれだけ近いか）
  const timeSeriesData = useMemo(() => {
    return experiments
      .slice()
      .sort((a, b) => new Date(a.experiment_date || 0).getTime() - new Date(b.experiment_date || 0).getTime())
      .map((exp) => {
        const allVals: number[] = [];
        (exp.rows || []).forEach((r: any) => {
          r.values.forEach((v: number | null) => {
            if (v != null) allVals.push(v);
          });
        });
        const avg = allVals.length > 0
          ? Math.round((allVals.reduce((a, b) => a + b, 0) / allVals.length) * 10) / 10
          : 0;
        const avgDeviation = allVals.length > 0
          ? Math.round((allVals.reduce((a, b) => a + Math.abs(b - IDEAL), 0) / allVals.length) * 10) / 10
          : 0;
        const dateLabel = exp.experiment_date
          ? new Date(exp.experiment_date).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })
          : "-";
        return { name: dateLabel, avg, avgDeviation, subject: exp.subject || "" };
      });
  }, [experiments]);

  // 3. 全体統計
  const totalStats = useMemo(() => {
    const allVals: number[] = [];
    experiments.forEach(exp => {
      (exp.rows || []).forEach((r: any) => {
        r.values.forEach((v: number | null) => {
          if (v != null) allVals.push(v);
        });
      });
    });
    if (allVals.length === 0) return { avgDev: 0, within5: 0, totalMeasurements: 0 };
    const avgDev = Math.round((allVals.reduce((a, b) => a + Math.abs(b - IDEAL), 0) / allVals.length) * 10) / 10;
    const within5 = Math.round((allVals.filter(v => Math.abs(v - IDEAL) <= 5).length / allVals.length) * 100);
    return { avgDev, within5, totalMeasurements: allVals.length };
  }, [experiments]);

  return (
    <div className="space-y-6 fade-in duration-500 pb-12" id="deep-analysis-content">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">AI レポート & 分析</h2>
          <p className="text-slate-500 mt-1 text-sm font-medium">EAV測定データを「50からの偏差」軸で分析します。</p>
        </div>
        {reportText && (
          <ExportButton targetElementId="deep-analysis-content" />
        )}
      </div>

      {/* ── 統計サマリー ── */}
      {dataCount > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">平均偏差 |値-50|</p>
                <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{totalStats.avgDev}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">50±5 以内の割合</p>
                <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{totalStats.within5}<span className="text-base font-semibold text-slate-500">%</span></p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                <BarChart2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">総測定ポイント数</p>
                <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{totalStats.totalMeasurements}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── グラフ ── */}
      {dataCount > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 50からの偏差バーチャート */}
          <Card className="border border-slate-200 shadow-sm bg-white rounded-xl">
            <CardHeader className="border-b border-slate-100 bg-slate-50 py-4">
              <CardTitle className="text-sm font-bold text-slate-800">7項目の「50からの偏差」（全実験平均）</CardTitle>
              <CardDescription className="text-xs text-slate-500">0が理想。正の値＝ストレス過多、負の値＝機能低下</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deviationData} margin={{ top: 10, right: 10, bottom: 5, left: -15 }}>
                    <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" interval={0} angle={-20} textAnchor="end" height={50} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="#94a3b8" />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                      formatter={(value: any, name: any) => [
                        `${value > 0 ? "+" : ""}${value}`,
                        name === "deviation" ? "50からの偏差" : name
                      ]}
                    />
                    <ReferenceLine y={0} stroke="#3b82f6" strokeDasharray="4 4" strokeWidth={2} label={{ value: "理想値(50)", fill: "#3b82f6", fontSize: 10, position: "insideTopRight" }} />
                    <Bar dataKey="deviation" name="偏差" radius={[4, 4, 0, 0]}>
                      {deviationData.map((entry, i) => (
                        <Cell key={i} fill={Math.abs(entry.deviation) <= 3 ? "#22c55e" : Math.abs(entry.deviation) <= 8 ? "#f59e0b" : "#ef4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-4 mt-2 px-2 text-[10px] text-slate-500 font-medium">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-green-500" /> ±3以内（良好）</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500" /> ±3〜8（注意）</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500" /> ±8超（要改善）</span>
              </div>
            </CardContent>
          </Card>

          {/* 時系列推移 */}
          <Card className="border border-slate-200 shadow-sm bg-white rounded-xl">
            <CardHeader className="border-b border-slate-100 bg-slate-50 py-4">
              <CardTitle className="text-sm font-bold text-slate-800">時系列: 50への収束推移</CardTitle>
              <CardDescription className="text-xs text-slate-500">実験ごとの全項目平均値（青線=平均, 赤線=平均偏差）</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData} margin={{ top: 10, right: 10, bottom: 5, left: -15 }}>
                    <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} stroke="#94a3b8" />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="#94a3b8" domain={[0, 100]} />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                      labelFormatter={(label) => `実験: ${label}`}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                    <ReferenceLine y={50} stroke="#3b82f6" strokeDasharray="6 3" strokeWidth={2} label={{ value: "50", fill: "#3b82f6", fontSize: 11, position: "right" }} />
                    <Line type="monotone" dataKey="avg" name="全項目平均" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: "#3b82f6" }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="avgDeviation" name="平均偏差|値-50|" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3, fill: "#ef4444" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── レポート生成ボタン ── */}
      {!reportText && (
        <Card className="border border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-sm rounded-xl">
          <CardContent className="p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="bg-blue-600 text-white p-4 rounded-xl shadow-md">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-lg md:text-xl">Gemini AI 統合レポート</p>
                <p className="text-sm font-medium text-slate-500 mt-1">分析対象: <span className="font-extrabold text-blue-600 text-lg mx-1">{dataCount}</span> 件のEAV測定データ</p>
              </div>
            </div>
            <Button 
              type="button"
              onClick={generateReport} 
              disabled={isGenerating || dataCount === 0}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 font-bold h-12 md:h-14 px-8 shadow-md shadow-blue-500/20 text-base gap-2 rounded-xl transition-all"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <BarChart2 className="w-5 h-5" />}
              {isGenerating ? "Gemini 推論中..." : "詳細レポートを生成する"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── レポート本文 ── */}
      {reportText && (
        <Card className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden fade-in duration-700">
          <CardHeader className="border-b border-slate-100 bg-slate-50 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-slate-800 text-lg">
                <FileText className="w-5 h-5 text-blue-600" />
                EAV空間安定実験 — Gemini 分析レポート
              </CardTitle>
              <div className="flex items-center gap-3">
                {reportDate && (
                  <span className="text-xs text-slate-400 font-medium">生成: {reportDate}</span>
                )}
                <Button
                  type="button"
                  onClick={generateReport}
                  disabled={isGenerating || dataCount === 0}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-bold h-8 text-xs"
                >
                  {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  {isGenerating ? "生成中..." : "レポートを更新"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 md:p-8">
            <div 
              className="prose prose-slate max-w-none 
              prose-headings:text-slate-800 prose-headings:font-bold
              prose-h2:border-b prose-h2:pb-2 prose-h2:text-xl prose-h2:mt-8
              prose-h3:text-lg prose-p:text-slate-700 prose-p:leading-relaxed prose-p:font-medium
              prose-li:text-slate-700 prose-li:font-medium prose-strong:text-blue-700"
              dangerouslySetInnerHTML={{ __html: reportText }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
