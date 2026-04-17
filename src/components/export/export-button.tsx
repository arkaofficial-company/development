"use client";

import React, { useState } from 'react';
import { Download, FileText, TableProperties, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { exportToPdf } from '@/lib/export/pdf-generator';
import { exportToExcel } from '@/lib/export/excel-generator';

interface ExportButtonProps {
  targetElementId?: string;
  dataToExport?: any;
}

export function ExportButton({ targetElementId = 'dashboard-content', dataToExport }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (type: 'pdf' | 'excel') => {
    setIsExporting(true);
    try {
      if (type === 'pdf') {
        const targetElement = document.getElementById(targetElementId);
        if (!targetElement) throw new Error('Export target not found');
        await exportToPdf(targetElement, 'arcadiamond_lab_report');
        toast.success('PDFの作成が完了しました');
      } else {
        await exportToExcel(dataToExport || [{ 測定日時: "2026-04-04 15:00", 被験者: "テスト対象", 条件: "テスト", 指標1: 4.5, 指標2: 3.2 }], 'arcadiamond_lab_data');
        toast.success('Excelデータの作成が完了しました');
      }
    } catch (err) {
      console.error(err);
      toast.error('エクスポート中にエラーが発生しました');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-background shadow-sm hover:bg-accent" disabled={isExporting}>
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isExporting ? '生成中...' : 'レポート出力'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuItem onClick={() => handleExport('pdf')} className="gap-2 cursor-pointer py-2.5">
          <FileText className="w-4 h-4 text-rose-500" />
          <span>PDFレポート生成</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel')} className="gap-2 cursor-pointer py-2.5">
          <TableProperties className="w-4 h-4 text-emerald-500" />
          <span>Excelデータ出力</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
