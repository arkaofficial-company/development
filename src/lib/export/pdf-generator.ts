import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportToPdf(element: HTMLElement, filename: string = 'report'): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    const innerWidth = pdfWidth - margin * 2;
    const pdfHeight = (canvas.height * innerWidth) / canvas.width;

    // ヘッダー情報
    pdf.setFontSize(10);
    pdf.setTextColor(150);
    pdf.text(`Arcadiamond Lab Connect - AI Generated Report`, margin, 8);

    pdf.addImage(imgData, 'PNG', margin, 12, innerWidth, pdfHeight);
    pdf.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
}
