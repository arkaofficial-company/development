"use client";

import React, { useRef, KeyboardEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GridRow, ReferenceValues } from "@/types";

const COL_HEADERS = ["1 抵抗力", "2 短期的精神系", "3 感情系", "4 こだわり性", "5 体内エネルギー", "6 生理的感情", "7 長期的精神系"];

interface DataGridProps {
  rows: GridRow[];
  referenceValues: ReferenceValues;
  onChange: (rows: GridRow[]) => void;
  onReferenceChange: (ref: ReferenceValues) => void;
}

export function DataGrid({ rows, referenceValues, onChange, onReferenceChange }: DataGridProps) {
  const tableRef = useRef<HTMLTableElement>(null);

  const emptyRow = (): GridRow => ({
    id: crypto.randomUUID(),
    measurement_time: "",
    cut_type: "",
    target_name: "",
    baseline_value: null,
    values: Array(7).fill(null),
  });

  const addRow = () => onChange([...rows, emptyRow()]);

  const removeRow = (index: number) => {
    const newRows = [...rows];
    newRows.splice(index, 1);
    if (newRows.length === 0) newRows.push(emptyRow());
    onChange(newRows);
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...rows];
    if (colIndex === -4) {
      newRows[rowIndex].measurement_time = value;
    } else if (colIndex === -3) {
      newRows[rowIndex].cut_type = value;
    } else if (colIndex === -2) {
      newRows[rowIndex].target_name = value;
    } else if (colIndex === -1) {
      newRows[rowIndex].baseline_value = value === "" ? null : Number(value);
    } else {
      newRows[rowIndex].values[colIndex] = value === "" ? null : Number(value);
    }
    onChange(newRows);
  };

  const handleRefChange = (colIndex: number, value: string) => {
    const newRef = { ...referenceValues };
    if (colIndex === -1) {
      newRef.baseline = value === "" ? null : Number(value);
    } else {
      const newVals = [...newRef.values];
      newVals[colIndex] = value === "" ? null : Number(value);
      newRef.values = newVals;
    }
    onReferenceChange(newRef);
  };

  const focusCell = (rowIndex: number, colIndex: number) => {
    if (!tableRef.current) return;
    const input = tableRef.current.querySelector(
      `input[data-row="${rowIndex}"][data-col="${colIndex}"]`
    ) as HTMLInputElement | null;
    if (input) { input.focus(); setTimeout(() => input.select(), 0); }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, rowIndex: number, colIndex: number) => {
    let nextRow = rowIndex, nextCol = colIndex;
    const rowCount = rows.length;
    if (e.key === "ArrowUp") nextRow = Math.max(0, rowIndex - 1);
    else if (e.key === "ArrowDown") nextRow = Math.min(rowCount - 1, rowIndex + 1);
    else if (e.key === "ArrowLeft") {
      if (e.currentTarget.type === "number" || e.currentTarget.selectionStart === 0) nextCol = Math.max(-4, colIndex - 1);
      else return;
    } else if (e.key === "ArrowRight") {
      if (e.currentTarget.type === "number" || e.currentTarget.selectionStart === e.currentTarget.value.length) nextCol = Math.min(6, colIndex + 1);
      else return;
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (rowIndex === rowCount - 1) { addRow(); setTimeout(() => focusCell(rowIndex + 1, colIndex), 50); return; }
      else nextRow = rowIndex + 1;
    } else return;
    e.preventDefault();
    focusCell(nextRow, nextCol);
  };

  const thCls = "px-2 py-3 font-bold text-center text-[11px] border-r border-slate-700 tracking-wider";

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
      {/* モバイルスクロールヒント */}
      <div className="md:hidden px-3 py-2 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-400 font-medium text-center">
        ← 横にスクロールできます →
      </div>
      <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
        <table className="w-full text-sm text-left border-collapse min-w-[900px]" ref={tableRef}>
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="px-2 py-3 w-10 border-r border-slate-700"></th>
              <th className={`${thCls} w-24`}>時刻</th>
              <th className={`${thCls} w-24`}>カット</th>
              <th className={`${thCls} min-w-[150px] text-left pl-4`}>測定対象</th>
              <th className={`${thCls} w-20 bg-amber-700/60`}>基本値</th>
              {COL_HEADERS.map((h, i) => (
                <th key={i} className={`${thCls} w-[84px] ${i === 6 ? 'border-r-0' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {/* ── 基準値行 ── */}
            <tr className="bg-amber-50/80 border-b-2 border-amber-300">
              <td className="px-2 py-1.5 text-center border-r border-slate-200 bg-amber-100/60">
                <span className="text-[10px] font-black text-amber-700 tracking-widest">REF</span>
              </td>
              <td className="border-r border-slate-200 bg-amber-100/30"></td>
              <td className="border-r border-slate-200 bg-amber-100/30"></td>
              <td className="px-3 py-1.5 border-r border-slate-200 bg-amber-100/40">
                <span className="font-bold text-amber-800 text-sm">基準値</span>
              </td>
              <td className="px-1 py-1.5 border-r border-slate-200 bg-amber-100/30">
                <input type="number" step="any" className="w-full h-9 px-2 text-center tabular-nums bg-white/80 border-2 border-amber-300 focus:border-amber-500 focus:bg-white focus:ring-0 outline-none rounded font-bold text-amber-900 text-sm" value={referenceValues.baseline ?? ""} onChange={(e) => handleRefChange(-1, e.target.value)} placeholder="-" />
              </td>
              {[0,1,2,3,4,5,6].map(ci => (
                <td key={ci} className="px-1 py-1.5 border-r border-slate-200 last:border-r-0 bg-amber-50/40">
                  <input type="number" step="any" className="w-full h-9 px-2 text-center tabular-nums bg-white/80 border-2 border-amber-200 focus:border-amber-500 focus:bg-white focus:ring-0 outline-none rounded font-bold text-amber-800 text-sm" value={referenceValues.values[ci] ?? ""} onChange={(e) => handleRefChange(ci, e.target.value)} placeholder="-" />
                </td>
              ))}
            </tr>

            {/* ── 測定データ行 ── */}
            {rows.map((row, ri) => (
              <tr key={row.id} className="hover:bg-blue-50/40 transition-colors group">
                <td className="px-2 py-1 text-center border-r border-slate-200 bg-[#f8fafc] group-hover:bg-blue-50/60">
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-rose-100" onClick={() => removeRow(ri)} tabIndex={-1}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
                {/* 時刻 */}
                <td className="px-1 py-1 border-r border-slate-200 bg-slate-50/50">
                  <input type="text" className="w-full h-9 px-2 text-center bg-transparent border-2 border-transparent focus:border-blue-500 focus:bg-white focus:ring-0 outline-none rounded text-slate-700 font-mono text-xs font-semibold" value={row.measurement_time} onChange={(e) => handleCellChange(ri, -4, e.target.value)} onKeyDown={(e) => handleKeyDown(e, ri, -4)} data-row={ri} data-col={-4} placeholder="16:25" />
                </td>
                {/* カット */}
                <td className="px-1 py-1 border-r border-slate-200 bg-slate-50/30">
                  <input type="text" className="w-full h-9 px-2 text-center bg-transparent border-2 border-transparent focus:border-blue-500 focus:bg-white focus:ring-0 outline-none rounded text-slate-700 text-xs font-semibold" value={row.cut_type} onChange={(e) => handleCellChange(ri, -3, e.target.value)} onKeyDown={(e) => handleKeyDown(e, ri, -3)} data-row={ri} data-col={-3} placeholder="CBKG" />
                </td>
                {/* 測定対象 */}
                <td className="px-1 py-1 min-w-[150px] border-r border-slate-200">
                  <input type="text" className="w-full h-9 px-3 bg-transparent border-2 border-transparent focus:border-blue-500 focus:bg-white focus:ring-0 outline-none rounded text-slate-800 font-semibold text-sm" value={row.target_name} onChange={(e) => handleCellChange(ri, -2, e.target.value)} onKeyDown={(e) => handleKeyDown(e, ri, -2)} data-row={ri} data-col={-2} placeholder="対象名..." />
                </td>
                {/* 基本値 */}
                <td className="px-1 py-1 border-r border-slate-200 bg-amber-50/30">
                  <input type="number" step="any" className="w-full h-9 px-2 text-center tabular-nums bg-transparent border-2 border-transparent focus:border-amber-500 focus:bg-white focus:ring-0 outline-none rounded text-slate-800 font-bold text-sm" value={row.baseline_value ?? ""} onChange={(e) => handleCellChange(ri, -1, e.target.value)} onKeyDown={(e) => handleKeyDown(e, ri, -1)} data-row={ri} data-col={-1} placeholder="-" />
                </td>
                {/* 列1〜7 */}
                {[0,1,2,3,4,5,6].map(ci => (
                  <td key={ci} className="px-1 py-1 border-r border-slate-200 last:border-r-0">
                    <input type="number" step="any" className="w-full h-9 px-2 text-center tabular-nums bg-transparent border-2 border-transparent focus:border-blue-500 focus:bg-white focus:ring-0 outline-none rounded text-slate-800 font-medium text-sm" value={row.values[ci] ?? ""} onChange={(e) => handleCellChange(ri, ci, e.target.value)} onKeyDown={(e) => handleKeyDown(e, ri, ci)} data-row={ri} data-col={ci} placeholder="-" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-3 bg-[#f8fafc] border-t border-slate-200">
        <Button type="button" onClick={addRow} variant="outline" size="sm" className="gap-2 bg-white text-slate-700 hover:text-blue-700 hover:border-blue-300 hover:bg-blue-50 shadow-sm font-bold border-slate-300">
          <Plus className="h-4 w-4" /> 測定対象の行を追加
        </Button>
      </div>
    </div>
  );
}
