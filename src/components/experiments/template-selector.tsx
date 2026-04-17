"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BookTemplate, Save, Trash2, ChevronDown, Loader2, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { ExperimentFormData } from "@/types";

interface TemplateSelectorProps {
  currentFormData: ExperimentFormData;
  onApplyTemplate: (data: Partial<ExperimentFormData>) => void;
}

export function TemplateSelector({ currentFormData, onApplyTemplate }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [open, setOpen] = useState(false);

  const loadTemplates = async () => {
    setLoading(true);
    const data = await db.getTemplates();
    setTemplates(data);
    setLoading(false);
  };

  useEffect(() => {
    if (open) loadTemplates();
  }, [open]);

  const buildTemplatePayload = (name: string) => ({
    name,
    measurer_name: currentFormData.measurer_name,
    subject: currentFormData.subject,
    content: currentFormData.content,
    conditions: currentFormData.conditions,
    reference_values: currentFormData.reference_values,
    default_rows: currentFormData.rows.map(r => ({
      target_name: r.target_name,
      cut_type: r.cut_type || "",
      baseline_value: r.baseline_value,
      values: r.values,
    })),
  });

  const handleSaveAsTemplate = async () => {
    if (!newName.trim()) { toast.error("テンプレート名を入力してください"); return; }
    setSaving(true);
    try {
      await db.saveTemplate(buildTemplatePayload(newName.trim()));
      toast.success(`テンプレート「${newName}」を保存しました`);
      setNewName(""); setShowSaveInput(false);
      loadTemplates();
    } catch { toast.error("テンプレートの保存に失敗しました"); }
    finally { setSaving(false); }
  };

  const handleUpdateTemplate = async (id: string) => {
    setSaving(true);
    try {
      const tpl = templates.find(t => t.id === id);
      const name = editingName.trim() || tpl?.name || "テンプレート";
      await db.saveTemplate(buildTemplatePayload(name), id);
      toast.success(`テンプレート「${name}」を更新しました`);
      setEditingId(null); setEditingName("");
      loadTemplates();
    } catch { toast.error("更新に失敗しました"); }
    finally { setSaving(false); }
  };

  const handleApply = (tpl: any) => {
    onApplyTemplate({
      measurer_name: tpl.measurer_name || "",
      subject: tpl.subject || "",
      content: tpl.content || "",
      conditions: tpl.conditions || "",
      reference_values: tpl.reference_values || { baseline: null, values: Array(7).fill(null) },
      rows: (tpl.default_rows || []).length > 0
        ? tpl.default_rows.map((r: any) => ({
            id: crypto.randomUUID(),
            measurement_time: "",
            cut_type: r.cut_type || "",
            target_name: r.target_name || "",
            baseline_value: r.baseline_value ?? null,
            values: r.values || Array(7).fill(null),
          }))
        : [{ id: crypto.randomUUID(), measurement_time: "", cut_type: "", target_name: "", baseline_value: null, values: Array(7).fill(null) }],
    });
    toast.success(`テンプレート「${tpl.name}」を適用しました`);
    setOpen(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (!confirm(`テンプレート「${name}」を削除しますか？`)) return;
    try { await db.deleteTemplate(id); toast.success("削除しました"); loadTemplates(); }
    catch { toast.error("削除に失敗しました"); }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="gap-2 bg-white border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 font-bold shadow-sm h-10 transition-all">
          <BookTemplate className="w-4 h-4" />
          テンプレート
          <ChevronDown className="w-3.5 h-3.5 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-3 border-b border-slate-100 bg-slate-50 rounded-t-lg">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">実験テンプレート</p>
        </div>

        <div className="max-h-72 overflow-y-auto">
          {loading ? (
            <div className="p-6 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-blue-500" /></div>
          ) : templates.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-400 font-medium">テンプレートがありません</div>
          ) : (
            templates.map((tpl) => (
              <div key={tpl.id} className="border-b border-slate-100 last:border-b-0">
                {editingId === tpl.id ? (
                  /* ── 編集モード ── */
                  <div className="p-3 bg-blue-50/50 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleUpdateTemplate(tpl.id)}
                        className="h-8 text-sm bg-white flex-1"
                        placeholder="テンプレート名"
                        autoFocus
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      ※ 現在のフォーム内容でテンプレートを上書き更新します
                    </p>
                    <div className="flex items-center gap-2 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setEditingName(""); }} className="h-7 text-xs text-slate-500">
                        キャンセル
                      </Button>
                      <Button size="sm" onClick={() => handleUpdateTemplate(tpl.id)} disabled={saving} className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-4">
                        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : "更新する"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* ── 通常表示 ── */
                  <div
                    onClick={() => handleApply(tpl)}
                    className="flex items-center justify-between px-3 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <BookTemplate className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{tpl.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{tpl.conditions ? tpl.conditions.slice(0, 40) : "条件なし"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 text-blue-400 hover:text-blue-600 hover:bg-blue-50"
                        onClick={(e) => { e.stopPropagation(); setEditingId(tpl.id); setEditingName(tpl.name); }}
                        title="テンプレートを編集"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                        onClick={(e) => handleDelete(e, tpl.id, tpl.name)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-slate-100 bg-slate-50/50 rounded-b-lg">
          {showSaveInput ? (
            <div className="flex items-center gap-2">
              <Input
                placeholder="テンプレート名..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveAsTemplate()}
                className="h-8 text-sm bg-white"
                autoFocus
              />
              <Button size="sm" onClick={handleSaveAsTemplate} disabled={saving} className="h-8 bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 flex-shrink-0">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowSaveInput(false); setNewName(""); }} className="h-8 px-2 text-slate-400">✕</Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setShowSaveInput(true)} className="w-full gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 h-8">
              <Plus className="w-3.5 h-3.5" />
              現在の内容をテンプレートとして保存
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
