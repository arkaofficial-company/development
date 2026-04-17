import * as XLSX from 'xlsx';

export async function exportToExcel(data: any[], filename: string = 'data'): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const exportData = data && data.length > 0 ? data : [{ "測定日時": "データがありません" }];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Auto-fit columns roughly
    const colWidths = Object.keys(exportData[0] || {}).map(() => ({ wch: 15 }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "実験データ");
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    console.error('Excel generation failed:', error);
    throw error;
  }
}
