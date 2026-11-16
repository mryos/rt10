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
    const { jsPDF } = await import('jspdf');

    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;

    // Header
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, 5, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(24, 24, 27);
    pdf.text(`LAPORAN IURAN WARGA RT 10`, margin, 17);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Periode: ${period} — Dicetak pada: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`, margin, 23);

    // Table Header
    let tableY = 30;
    pdf.setFillColor(241, 245, 249);
    pdf.setDrawColor(203, 213, 225);
    pdf.rect(margin, tableY, contentWidth, 6.5, 'FD');

    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(51, 65, 85);
    pdf.text('NO', margin + 3, tableY + 4.5);
    pdf.text('NO. BLOK', margin + 18, tableY + 4.5);
    pdf.text('NAMA WARGA', margin + 55, tableY + 4.5);
    pdf.text('STATUS IURAN', pageWidth - margin - 3, tableY + 4.5, { align: 'right' });

    tableY += 6.5;

    data.forEach((row, idx) => {
      if (tableY > pageHeight - 20) {
        pdf.addPage();
        tableY = 16;
        pdf.setFillColor(241, 245, 249);
        pdf.rect(margin, tableY, contentWidth, 6.5, 'FD');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.5);
        pdf.setTextColor(51, 65, 85);
        pdf.text('NO', margin + 3, tableY + 4.5);
        pdf.text('NO. BLOK', margin + 18, tableY + 4.5);
        pdf.text('NAMA WARGA', margin + 55, tableY + 4.5);
        pdf.text('STATUS IURAN', pageWidth - margin - 3, tableY + 4.5, { align: 'right' });
        tableY += 6.5;
      }

      const isEven = idx % 2 === 0;
      pdf.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
      pdf.setDrawColor(226, 232, 240);
      pdf.rect(margin, tableY, contentWidth, 6, 'FD');

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(71, 85, 105);
      pdf.text(String(idx + 1), margin + 3, tableY + 4.2);
      pdf.text(row.noBlok, margin + 18, tableY + 4.2);
      pdf.text(row.namaWarga, margin + 55, tableY + 4.2);

      pdf.setFont('helvetica', 'bold');
      if (row.status) {
        pdf.setTextColor(22, 101, 52);
        pdf.text('LUNAS', pageWidth - margin - 3, tableY + 4.2, { align: 'right' });
      } else {
        pdf.setTextColor(185, 28, 28);
        pdf.text('BELUM BAYAR', pageWidth - margin - 3, tableY + 4.2, { align: 'right' });
      }

      tableY += 6;
    });

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
