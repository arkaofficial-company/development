"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { DataGrid } from "./data-grid";
import { OcrUpload } from "./ocr-upload";
import { TemplateSelector } from "./template-selector";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Save, FileCheck, FileX, Scissors, Wand2, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ExperimentFormData, GridRow, ReferenceValues } from "@/types";
import { db } from "@/lib/db";
import { useRouter } from "next/navigation";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

const defaultRef: ReferenceValues = { baseline: null, values: Array(7).fill(null) };

export function ExperimentForm({ experimentId, initialData }: { experimentId?: string, initialData?: ExperimentFormData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dateObj, setDateObj] = useState<Date>(new Date());
  const [timeStr, setTimeStr] = useState(new Date().toTimeString().slice(0, 5));

  const [formData, setFormData] = useState<ExperimentFormData>({
    experiment_date: new Date().toISOString().slice(0, 16),
    measurer_name: "",
    subject: "",
    content: "",
    conditions: "",
    reference_values: { ...defaultRef, values: [...defaultRef.values] },
    rows: [{ id: crypto.randomUUID(), measurement_time: "", cut_type: "", target_name: "", baseline_value: null, values: Array(7).fill(null) }]
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        reference_values: initialData.reference_values || { ...defaultRef, values: [...defaultRef.values] },
      });
      const d = new Date(initialData.experiment_date);
      if (!isNaN(d.getTime())) {
        setDateObj(d);
        setTimeStr(initialData.experiment_date.includes('T') ? initialData.experiment_date.split('T')[1].slice(0, 5) : "00:00");
      }
    }
  }, [initialData]);

  useEffect(() => {
    if (dateObj) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const time = timeStr || "00:00";
      setFormData(prev => ({ ...prev, experiment_date: `${year}-${month}-${day}T${time}` }));
    }
  }, [dateObj, timeStr]);

  const handleGridChange = (newRows: GridRow[]) => {
    setFormData(prev => ({ ...prev, rows: newRows }));
  };

  const handleReferenceChange = (ref: ReferenceValues) => {
    setFormData(prev => ({ ...prev, reference_values: ref }));
  };

  const handleApplyTemplate = (tplData: Partial<ExperimentFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...tplData,
      experiment_date: prev.experiment_date, // 日付は現在のまま
    }));
  };

  const copyRecentConditions = () => {
    setFormData(prev => ({ ...prev, conditions: "・室温24度\n・湿度50%\n・測定器：Model-A" }));
    toast.success("前回の条件をコピーしました");
  };

  const handleOcrDataParsed = (data: any) => {
    if (data.reference_values) {
      setFormData(prev => ({ ...prev, reference_values: data.reference_values }));
    }
    if (data.rows && data.rows.length > 0) {
      setFormData(prev => ({
        ...prev,
        rows: [
          ...prev.rows.filter(r => r.target_name !== "" || r.values.some(v => v !== null)),
          ...data.rows.map((r: any) => ({
            id: crypto.randomUUID(),
            measurement_time: r.measurement_time || "",
            cut_type: r.cut_type || "",
            target_name: r.target_name || "",
            baseline_value: r.baseline_value ?? null,
            values: r.values || Array(7).fill(null),
          }))
        ]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // 二重送信防止
    setLoading(true);
    try {
      await db.saveExperiment(formData, experimentId);
      
      await fetch('/api/analysis', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData) 
      }).catch(e => console.error(e));

      toast.success(experimentId ? "実験データを更新しました！" : "実験データを登録・保存しました！");
      router.push("/experiments");
    } catch {
      toast.error("保存に失敗しました。データベースの設定が正しいか確認してください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl pb-12 fade-in duration-500">
      <Card className="border border-slate-200 shadow-sm bg-white rounded-xl">
        <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50 px-4 md:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg md:text-xl flex items-center gap-2 text-slate-800 font-bold">
                <FileCheck className="w-5 h-5 text-blue-600" /> 
                基本情報の設定
              </CardTitle>
              <CardDescription className="text-slate-500 font-medium mt-1">
                新しい実験のメタデータを入力してください。
              </CardDescription>
            </div>
            <TemplateSelector currentFormData={formData} onApplyTemplate={handleApplyTemplate} />
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-5 px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
            <div className="space-y-2.5">
              <Label className="text-slate-500 font-bold text-xs uppercase tracking-wider">測定日時 <span className="text-rose-500">*</span></Label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-medium bg-white border border-slate-200 hover:border-blue-400 focus-visible:ring-blue-500 h-10 shadow-sm",
                        !dateObj && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                      {dateObj ? format(dateObj, "yyyy年MM月dd日") : <span>日付を選択...</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dateObj} onSelect={(d) => d && setDateObj(d)} initialFocus />
                  </PopoverContent>
                </Popover>

                <Input 
                  type="time" 
                  value={timeStr} 
                  onChange={(e) => setTimeStr(e.target.value)} 
                  className="w-32 bg-white border-slate-200 focus-visible:ring-blue-500 font-medium h-10 shadow-sm"
                />
              </div>
            </div>
            
            <div className="space-y-2.5">
              <Label htmlFor="measurer_name" className="text-slate-500 font-bold text-xs uppercase tracking-wider">測定者 <span className="text-rose-500">*</span></Label>
              <Input 
                id="measurer_name" 
                placeholder="例: 山田太郎" 
                value={formData.measurer_name} 
                onChange={(e) => setFormData({...formData, measurer_name: e.target.value})} 
                required 
                className="bg-white border-slate-200 focus-visible:ring-blue-500 font-medium text-slate-800 shadow-sm"
              />
            </div>

            <div className="space-y-2.5 md:col-span-2">
              <Label htmlFor="subject" className="text-slate-500 font-bold text-xs uppercase tracking-wider">被験者・測定プロジェクト名 <span className="text-rose-500">*</span></Label>
              <Input 
                id="subject" 
                placeholder="例: 株式会社クライアントA様" 
                value={formData.subject} 
                onChange={(e) => setFormData({...formData, subject: e.target.value})} 
                required 
                className="bg-white border-slate-200 focus-visible:ring-blue-500 font-medium text-slate-800 shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="content" className="text-slate-500 font-bold text-xs uppercase tracking-wider">実験内容</Label>
            <Textarea 
              id="content" 
              placeholder="実験の目的や概要を簡潔に記述..." 
              value={formData.content} 
              onChange={(e) => setFormData({...formData, content: e.target.value})} 
              className="resize-none h-24 bg-white border-slate-200 focus-visible:ring-blue-500 font-medium text-slate-800 leading-relaxed shadow-sm"
            />
          </div>

          <div className="space-y-2.5 relative">
            <div className="flex items-center justify-between">
              <Label htmlFor="conditions" className="text-slate-500 font-bold text-xs uppercase tracking-wider">実験条件</Label>
              <Button type="button" variant="ghost" size="sm" onClick={copyRecentConditions} className="h-8 px-3 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold border border-transparent hover:border-blue-100 transition-all rounded-md gap-1.5 shadow-sm">
                <Scissors className="w-3.5 h-3.5" /> 前回をコピー
              </Button>
            </div>
            <Textarea 
              id="conditions" 
              placeholder="・室温など" 
              value={formData.conditions} 
              onChange={(e) => setFormData({...formData, conditions: e.target.value})} 
              className="resize-none h-24 bg-white border-slate-200 focus-visible:ring-blue-500 font-medium text-slate-800 leading-relaxed shadow-sm"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-5">
        <div className="flex items-center justify-between pt-4">
          <h3 className="text-xl font-bold text-slate-800 border-l-4 border-blue-600 pl-3">EAV 測定データ入力</h3>
        </div>
        
        <OcrUpload onDataParsed={handleOcrDataParsed} />
        <DataGrid
          rows={formData.rows}
          referenceValues={formData.reference_values}
          onChange={handleGridChange}
          onReferenceChange={handleReferenceChange}
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-slate-200 mt-8">
        <Button variant="outline" type="button" onClick={() => router.push("/experiments")} className="w-full sm:w-auto sm:min-w-[120px] bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-bold h-12 sm:h-11">
          <FileX className="w-4 h-4 mr-2" /> キャンセル
        </Button>
        <Button type="submit" disabled={loading} className="w-full sm:w-auto sm:min-w-[200px] bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold h-12 sm:h-11">
          {loading ? (
             <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> 保存中...</>
          ) : (
            <>
              {experimentId ? <Save className="w-4 h-4 mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
              {experimentId ? '変更を保存' : '保存してAI・DB同期'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
