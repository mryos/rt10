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

    pdf.setFontSize(14);
    pdf.text(`Laporan Iuran Warga RT 10 - Periode ${period}`, 10, 15);
    pdf.setFontSize(9);
    pdf.setTextColor(120);
    pdf.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}`, 10, 21);
    pdf.addImage(imgData, 'PNG', 10, 26, imgWidth, imgHeight);
    pdf.save(`Laporan_Iuran_${period.replace(' ', '_')}.pdf`);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={exportCSV}
        className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-zinc-700 text-xs font-semibold
                   rounded-xl border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 transition-all shadow-xs"
        title="Download file CSV spreadsheet"
      >
        <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>CSV</span>
      </button>

      <button
        onClick={exportPDF}
        className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-900 text-white text-xs font-semibold
                   rounded-xl hover:bg-zinc-800 transition-all shadow-xs"
        title="Cetak dan Download Dokumen PDF"
      >
        <svg className="w-3.5 h-3.5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        <span>Export PDF</span>
      </button>
    </div>
  );
}
