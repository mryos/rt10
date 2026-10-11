'use client';

import type { IuranRecord } from '@/lib/types';

interface ExportButtonsProps {
  data: IuranRecord[];
  period: string;
}

export default function ExportButtons({ data, period }: ExportButtonsProps) {
  const exportCSV = () => {
    const headers = ['No', 'No. Blok', 'Nama Warga', 'Status'];
    const rows = data.map((row, idx) => [
      idx + 1,
      row.noBlok,
      row.namaWarga,
      row.status ? 'LUNAS' : 'BELUM BAYAR',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Iuran_${period.replace(' ', '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    const element = document.getElementById('iuran-table');
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.setFontSize(16);
    pdf.text(`Laporan Iuran RT - ${period}`, 10, 15);
    pdf.setFontSize(10);
    pdf.text(`Dicetak: ${new Date().toLocaleDateString('id-ID')}`, 10, 22);
    pdf.addImage(imgData, 'PNG', 10, 28, imgWidth, imgHeight);
    pdf.save(`Laporan_Iuran_${period.replace(' ', '_')}.pdf`);
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={exportCSV}
        className="inline-flex items-center px-4 py-2.5 bg-green-600 text-white text-sm font-medium
                   rounded-lg hover:bg-green-700 transition-colors shadow-sm"
      >
        📊 Ekspor CSV
      </button>
      <button
        onClick={exportPDF}
        className="inline-flex items-center px-4 py-2.5 bg-red-600 text-white text-sm font-medium
                   rounded-lg hover:bg-red-700 transition-colors shadow-sm"
      >
        📄 Ekspor PDF
      </button>
    </div>
  );
}
