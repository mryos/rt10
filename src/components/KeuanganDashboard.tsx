'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { RingkasanKeuangan, TransaksiKeuangan } from '@/lib/types';

export default function KeuanganDashboard() {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [activeTab, setActiveTab] = useState<'semua' | 'masuk' | 'keluar'>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<RingkasanKeuangan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedRekening, setCopiedRekening] = useState(false);

  // Ambil data keuangan
  const fetchKeuangan = useCallback(async (year: string, month: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/keuangan?year=${year}&month=${month}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Gagal memuat keuangan:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeuangan(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth, fetchKeuangan]);

  // Format Rupiah
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Salin No Rekening
  const handleCopyRekening = () => {
    navigator.clipboard.writeText('8240-1928-3019');
    setCopiedRekening(true);
    setTimeout(() => setCopiedRekening(false), 2000);
  };

  // Filter transaksi
  const filteredTransaksi = useMemo(() => {
    if (!data?.transaksi) return [];
    return data.transaksi.filter((t: TransaksiKeuangan) => {
      const matchTab = activeTab === 'semua' ? true : t.tipe === activeTab;
      const matchSearch =
        t.keterangan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.kategori.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.penanggungJawab.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.noBukti && t.noBukti.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchTab && matchSearch;
    });
  }, [data, activeTab, searchQuery]);

  // Ekspor CSV Buku Kas
  const handleExportCSV = () => {
    if (!data || !data.transaksi.length) return;

    const headers = ['No Bukti', 'Tanggal', 'Tipe', 'Kategori', 'Keterangan', 'Nominal (Rp)', 'Saldo Setelah (Rp)', 'Penanggung Jawab'];
    const rows = data.transaksi.map((t) => [
      t.noBukti || '-',
      t.tanggal,
      t.tipe === 'masuk' ? 'Pemasukan' : 'Pengeluaran',
      t.kategori,
      `"${t.keterangan.replace(/"/g, '""')}"`,
      t.nominal,
      t.saldoSetelah,
      t.penanggungJawab,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Kas_RT10_${selectedYear}_${selectedMonth}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Ekspor PDF Laporan Keuangan Bento
  const handleExportPDF = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    const element = document.getElementById('bento-keuangan-container');
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#FAFAFA' });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth - 16;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.setFontSize(14);
    pdf.text(`Laporan Keuangan Kas Terbuka RT 10 - ${data?.periode || selectedYear}`, 8, 12);
    pdf.setFontSize(9);
    pdf.setTextColor(100);
    pdf.text(`Dokumen transparansi kas warga. Dicetak pada: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`, 8, 17);
    pdf.addImage(imgData, 'PNG', 8, 22, imgWidth, imgHeight);
    pdf.save(`Laporan_Keuangan_RT10_${selectedYear}_${selectedMonth}.pdf`);
  };

  const monthOptions = [
    { val: 'all', label: 'Semua Bulan (Kumulatif)' },
    { val: 'Jan', label: 'Januari' },
    { val: 'Feb', label: 'Februari' },
    { val: 'Mar', label: 'Maret' },
    { val: 'Apr', label: 'April' },
    { val: 'Mei', label: 'Mei' },
    { val: 'Jun', label: 'Juni' },
    { val: 'Jul', label: 'Juli' },
    { val: 'Agu', label: 'Agustus' },
    { val: 'Sep', label: 'September' },
    { val: 'Okt', label: 'Oktober' },
    { val: 'Nov', label: 'November' },
    { val: 'Des', label: 'Desember' },
  ];

  if (isLoading && !data) {
    return (
      <div className="bg-white rounded-3xl border border-zinc-200/80 p-16 text-center shadow-xs">
        <div className="inline-block animate-spin rounded-full h-9 w-9 border-3 border-zinc-900 border-t-transparent" />
        <p className="mt-4 text-sm font-semibold text-zinc-500">Menyinkronkan data buku kas & laporan keuangan...</p>
      </div>
    );
  }

  // Perhitungan Keuangan
  const rasioPengeluaran = data ? Math.round((data.totalPengeluaran / (data.totalPemasukan || 1)) * 100) : 0;
  const sisaKasSurplus = data ? data.totalPemasukan - data.totalPengeluaran : 0;
  const saldoBulanLalu = data?.saldoBulanLalu || 23000000;
  const selisihBulanLalu = (data?.saldoAkhir || 0) - saldoBulanLalu;
  const persentaseKenaikan = saldoBulanLalu > 0 ? Math.round((selisihBulanLalu / saldoBulanLalu) * 100) : 0;

  return (
    <div className="space-y-6" id="bento-keuangan-container">
      {/* Bento Top Header & Control Strip */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-zinc-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
              Kas Terbuka 70 Hunian
            </span>
            <span className="text-zinc-300">•</span>
            <span className="text-xs text-zinc-500 font-semibold">Buku Kas Real-time</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
            Laporan Keuangan Kas Warga RT 10
          </h1>
          <p className="text-sm text-zinc-600 mt-1 leading-relaxed">
            Transparansi pembukuan kas warga, realisasi iuran bulanan 70 hunian, dan perbandingan saldo real-time secara terbuka.
          </p>
        </div>

        {/* Structured Control Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          {/* Periode Filter Group (Tahun & Bulan) */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100/90 rounded-2xl border border-zinc-200/70">
            {/* Year Switcher */}
            <div className="inline-flex items-center">
              {['2024', '2025', '2026'].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    selectedYear === yr
                      ? 'bg-white text-zinc-950 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>

            <span className="w-px h-5 bg-zinc-300/80 mx-0.5"></span>

            {/* Month Dropdown */}
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent pl-2.5 pr-8 py-1.5 text-xs sm:text-sm font-bold text-zinc-800 focus:outline-none cursor-pointer appearance-none"
              >
                {monthOptions.map((m) => (
                  <option key={m.val} value={m.val}>
                    {m.label}
                  </option>
                ))}
              </select>
              <svg
                className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Action Buttons Group (CSV & PDF) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white text-zinc-800 text-xs sm:text-sm font-bold
                         rounded-2xl border border-zinc-200/80 hover:bg-zinc-50 transition-all shadow-xs"
              title="Download CSV Buku Kas"
            >
              <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>CSV</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-950 text-white text-xs sm:text-sm font-bold
                         rounded-2xl hover:bg-zinc-800 transition-all shadow-xs"
              title="Unduh Dokumen PDF Laporan"
            >
              <svg className="w-4 h-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Unduh PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* BENTO GRID LEVEL 1: Financial Health Core (Rincian Kas 3 Bulan) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Bento 1: Saldo Kas Utama & Rincian Histori 3 Bulan (Col Span 7) */}
        <div className="lg:col-span-7 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-900 text-white rounded-3xl p-6 sm:p-7 shadow-sm border border-zinc-800/80 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                Saldo Kas Saat Ini (Bulan Berjalan)
              </span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Kas Sehat
              </span>
            </div>

            {/* Nominal Saldo Besar */}
            <div className="text-3xl sm:text-5xl font-black tracking-tight font-mono text-white mt-1">
              {formatRupiah(data?.saldoAkhir || 0)}
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-medium">
              Posisi kas riil warga RT 10 terverifikasi buku kas kasbon per periode berjalan.
            </p>

            {/* Rincian Pergerakan Kas (2 Bulan Lalu s/d Bulan Berjalan Saat Ini) */}
            <div className="mt-5 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                    Rincian Saldo (2 Bulan Lalu s/d Saat Ini)
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400 font-medium hidden sm:inline">Mutasi Kas Riil</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {(data?.riwayatSaldo && data.riwayatSaldo.length > 0
                  ? data.riwayatSaldo
                  : [
                      {
                        periode: 'September 2024',
                        namaBulan: 'Sep 2024',
                        label: '2 Bulan Lalu',
                        saldoAwal: 20320000,
                        pemasukan: 3100000,
                        pengeluaran: 0,
                        saldoAkhir: 23420000,
                        selisih: 3100000,
                        isBerjalan: false,
                      },
                      {
                        periode: 'Oktober 2024',
                        namaBulan: 'Okt 2024',
                        label: '1 Bulan Lalu',
                        saldoAwal: 23420000,
                        pemasukan: 0,
                        pengeluaran: 420000,
                        saldoAkhir: 23000000,
                        selisih: -420000,
                        isBerjalan: false,
                      },
                      {
                        periode: 'November 2024',
                        namaBulan: 'Nov 2024',
                        label: 'Saat Ini',
                        saldoAwal: 23000000,
                        pemasukan: 3150000,
                        pengeluaran: 0,
                        saldoAkhir: 26150000,
                        selisih: 3150000,
                        isBerjalan: true,
                      },
                    ]
                ).map((item) => (
                  <div
                    key={item.periode}
                    className={`rounded-2xl p-3 border transition-all flex flex-col justify-between ${
                      item.isBerjalan
                        ? 'bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20 hover:bg-emerald-500/15'
                        : 'bg-white/5 border-white/10 hover:bg-white/[0.08]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className={`font-semibold ${item.isBerjalan ? 'text-emerald-300 flex items-center gap-1.5' : 'text-zinc-400'}`}>
                          {item.isBerjalan && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
                          {item.label}
                        </span>
                        <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          item.isBerjalan ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/10 text-zinc-300'
                        }`}>
                          {item.namaBulan}
                        </span>
                      </div>
                      <div className={`text-base sm:text-lg font-black font-mono whitespace-nowrap ${item.isBerjalan ? 'text-white' : 'text-zinc-100'}`}>
                        {formatRupiah(item.saldoAkhir)}
                      </div>
                    </div>
                    <div className={`mt-2.5 pt-2 border-t text-[11px] space-y-1 ${item.isBerjalan ? 'border-emerald-500/25' : 'border-white/10'}`}>
                      <div className="flex justify-between items-center text-zinc-300">
                        <span className="text-zinc-400">Masuk:</span>
                        <span className="text-emerald-300 font-mono font-bold whitespace-nowrap">
                          {item.pemasukan > 0 ? `+${formatRupiah(item.pemasukan)}` : 'Rp 0'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-300">
                        <span className="text-zinc-400">
                          {item.isBerjalan ? 'Surplus:' : item.pengeluaran > 0 ? 'Keluar:' : 'Keluar:'}
                        </span>
                        <span className={`font-mono font-bold whitespace-nowrap ${
                          item.isBerjalan ? 'text-emerald-400' : item.pengeluaran > 0 ? 'text-rose-400' : 'text-zinc-400'
                        }`}>
                          {item.isBerjalan
                            ? `+${formatRupiah(item.selisih)}`
                            : item.pengeluaran > 0
                            ? `−${formatRupiah(item.pengeluaran)}`
                            : 'Rp 0'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rekapitulasi Akumulasi Total Tahunan */}
          <div className="mt-5 pt-4 border-t border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
              Rekapitulasi Total Kumulatif Tahun Berjalan
            </span>
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
              <div className="bg-white/[0.06] rounded-xl p-2.5 sm:p-3 border border-white/5 flex flex-col justify-between">
                <span className="text-zinc-400 block text-[11px] sm:text-xs font-semibold mb-1">Saldo Awal</span>
                <span className="font-bold text-zinc-100 font-mono text-xs sm:text-sm whitespace-nowrap block tracking-tight">
                  {formatRupiah(data?.saldoAwal || 0)}
                </span>
              </div>

              <div className="bg-white/[0.06] rounded-xl p-2.5 sm:p-3 border border-white/5 flex flex-col justify-between">
                <span className="text-emerald-400 block text-[11px] sm:text-xs font-semibold mb-1">Total Masuk</span>
                <span className="font-bold text-emerald-300 font-mono text-xs sm:text-sm whitespace-nowrap block tracking-tight">
                  +{formatRupiah(data?.totalPemasukan || 0)}
                </span>
              </div>

              <div className="bg-white/[0.06] rounded-xl p-2.5 sm:p-3 border border-white/5 flex flex-col justify-between">
                <span className="text-rose-400 block text-[11px] sm:text-xs font-semibold mb-1">Total Keluar</span>
                <span className="font-bold text-rose-300 font-mono text-xs sm:text-sm whitespace-nowrap block tracking-tight">
                  −{formatRupiah(data?.totalPengeluaran || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Kolom Kanan: Arus Kas & Rekening Resmi RT 10 (Col Span 5 Stacked) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Bento 2: Arus Kas & Efisiensi Belanja */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-zinc-200/80 shadow-xs flex flex-col justify-between flex-1">
            <div>
              <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-500 font-bold uppercase tracking-wider mb-2">
                <span>Arus Masuk vs Belanja</span>
                <span className="text-zinc-950 font-mono font-extrabold text-sm">{rasioPengeluaran}% Terpakai</span>
              </div>
              
              {/* Visual Dual Progress Bar */}
              <div className="space-y-4 mt-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-emerald-800 font-bold flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      Total Penerimaan
                    </span>
                    <span className="font-extrabold text-zinc-950 font-mono text-sm sm:text-base whitespace-nowrap">
                      {formatRupiah(data?.totalPemasukan || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-emerald-100/70 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-2.5 rounded-full w-full"></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-rose-700 font-bold flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      Total Pengeluaran
                    </span>
                    <span className="font-extrabold text-zinc-950 font-mono text-sm sm:text-base whitespace-nowrap">
                      {formatRupiah(data?.totalPengeluaran || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-2.5 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(rasioPengeluaran, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs sm:text-sm text-zinc-600">
              <span className="font-medium">Sisa Kas Tersimpan:</span>
              <span className="font-black font-mono text-zinc-950 text-base">{formatRupiah(sisaKasSurplus)}</span>
            </div>
          </div>

          {/* Rekening Kas Resmi RT 10 (Virtual Account / Setor Iuran) */}
          <div className="bg-zinc-950 text-white rounded-3xl p-6 shadow-xs border border-zinc-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Rekening Kas Resmi RT 10
              </span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/20">
                BCA
              </span>
            </div>

            <div className="my-2 flex items-center justify-between gap-4">
              <div>
                <p className="text-2xl sm:text-3xl font-mono font-black tracking-wider text-white">8240-1928-3019</p>
                <p className="text-sm text-zinc-400 mt-1">a.n. <strong className="text-zinc-100">KAS PAGUYUBAN RT 10</strong></p>
              </div>
              <button
                onClick={handleCopyRekening}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs sm:text-sm font-bold rounded-2xl transition-all border border-white/20 shrink-0"
              >
                {copiedRekening ? '✓ Tersalin' : 'Salin Rekening'}
              </button>
            </div>

            <p className="text-xs text-zinc-400 pt-3 border-t border-white/10 mt-2">
              Cantumkan berita transfer: <strong className="text-zinc-200">[No. Blok - Nama]</strong> saat setor iuran.
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* BENTO GRID LEVEL 2: Transparansi Belanja & Mutasi Buku Kas     */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Buku Kas & Catatan Mutasi Terbuka (Col Span 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-zinc-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4 mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-zinc-950 tracking-tight flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Buku Kas & Mutasi Terbuka
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                  Daftar transaksi kas masuk dan pengeluaran yang dapat diaudit siapapun
                </p>
              </div>

              {/* Mini Filter Tabs with readable font */}
              <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-2xl text-xs sm:text-sm">
                <button
                  onClick={() => setActiveTab('semua')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    activeTab === 'semua' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setActiveTab('masuk')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    activeTab === 'masuk' ? 'bg-white text-emerald-800 shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  Masuk (+)
                </button>
                <button
                  onClick={() => setActiveTab('keluar')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    activeTab === 'keluar' ? 'bg-white text-rose-800 shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  Keluar (-)
                </button>
              </div>
            </div>

            {/* Search Input with readable size */}
            <div className="relative mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari transaksi, kwitansi, atau keperluan..."
                className="w-full pl-9 pr-3.5 py-2.5 text-sm text-zinc-950 bg-zinc-50 border border-zinc-200/80 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all placeholder:text-zinc-400 font-medium"
              />
              <svg
                className="w-4 h-4 text-zinc-400 absolute left-3 top-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Scrollable Mini Table Container with larger font sizes */}
            <div className="overflow-y-auto max-h-[340px] border border-zinc-200/70 rounded-2xl divide-y divide-zinc-100 pr-1">
              {filteredTransaksi.length === 0 ? (
                <div className="py-14 text-center text-sm font-semibold text-zinc-400">
                  Tidak ada transaksi kas yang sesuai filter.
                </div>
              ) : (
                filteredTransaksi.map((item) => {
                  const isMasuk = item.tipe === 'masuk';
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 hover:bg-zinc-50/80 transition-colors flex items-center justify-between gap-4 text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 mb-1">
                          <span className="text-xs text-zinc-500 font-bold font-mono">{item.tanggal}</span>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200/50">
                            {item.kategori}
                          </span>
                        </div>
                        <p className="font-bold text-zinc-950 text-sm sm:text-base leading-snug">{item.keterangan}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{item.penanggungJawab} • <span className="font-mono">{item.noBukti || item.id}</span></p>
                      </div>

                      <div className="text-right shrink-0">
                        <div
                          className={`font-mono font-black text-sm sm:text-base whitespace-nowrap ${
                            isMasuk ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {isMasuk ? '+' : '−'} {formatRupiah(item.nominal)}
                        </div>
                        <div className="text-xs text-zinc-500 font-mono mt-0.5 font-semibold whitespace-nowrap">
                          Saldo: {formatRupiah(item.saldoSetelah)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs sm:text-sm text-zinc-500">
            <span>Menampilkan <strong className="text-zinc-900">{filteredTransaksi.length}</strong> catatan mutasi kas</span>
            <span className="font-medium">Scroll untuk melihat histori transaksi</span>
          </div>
        </div>

        {/* Kolom Kanan: Pos Belanja & Sumber Pemasukan (Col Span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Pos Alokasi Belanja Rutin Lingkungan */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-zinc-200/80 shadow-xs flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-3">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-zinc-950 tracking-tight flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                  Pos Belanja Lingkungan
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Operasional rutin satpam, kebersihan & sarpras
                </p>
              </div>
              <span className="text-xs sm:text-sm font-extrabold font-mono text-zinc-950 bg-zinc-100 px-3 py-1.5 rounded-xl border border-zinc-200/60 whitespace-nowrap">
                {formatRupiah(data?.totalPengeluaran || 0)}
              </span>
            </div>

            <div className="space-y-3">
              {data?.alokasiPengeluaran.map((item) => (
                <div key={item.kategori} className="space-y-1">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.warna }}
                      />
                      <span className="font-bold text-zinc-900 text-xs sm:text-sm">{item.kategori}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-zinc-950 font-mono text-xs sm:text-sm whitespace-nowrap">{formatRupiah(item.nominal)}</span>
                      <span className="text-zinc-500 font-bold font-mono text-[11px]">({item.persentase}%)</span>
                    </div>
                  </div>

                  <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${item.persentase}%`,
                        backgroundColor: item.warna,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 text-xs text-zinc-500 flex items-center justify-between">
              <span>Audit rutin Sie Sarpras & Keamanan</span>
              <span className="font-semibold text-zinc-800">5 Pos Pengeluaran</span>
            </div>
          </div>

          {/* Komposisi Sumber Pemasukan Kas */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-3">
              <span className="text-sm font-extrabold text-zinc-950">Sumber Pemasukan Kas</span>
              <span className="text-sm font-mono font-black text-emerald-700 whitespace-nowrap">{formatRupiah(data?.totalPemasukan || 0)}</span>
            </div>

            <div className="space-y-3">
              {data?.alokasiPemasukan.map((item) => (
                <div key={item.kategori} className="space-y-1">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-zinc-800 font-bold">{item.kategori}</span>
                    <span className="font-extrabold text-emerald-800 font-mono whitespace-nowrap">{formatRupiah(item.nominal)}</span>
                  </div>
                  <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.persentase}%`, backgroundColor: item.warna }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-zinc-500 pt-3 mt-3 border-t border-zinc-100 leading-relaxed">
              Iuran rutin 70 rumah @ Rp 50.000 / bln ditambah donatur sukarela warga.
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* BENTO GRID LEVEL 3: Monitoring Kepatuhan Iuran Warga (Bawah)    */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Ringkasan Kepatuhan 70 Rumah (Col Span 4) */}
        <div className="md:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-zinc-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-500 font-bold uppercase tracking-wider mb-2">
              <span>Kepatuhan 70 Rumah</span>
              <span className="text-emerald-800 font-extrabold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 text-xs">
                {data?.persenKepatuhan || 0}% Lunas
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2.5">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-950 font-mono">
                {data ? Math.round((data.persenKepatuhan * 70) / 100) : 0}
              </span>
              <span className="text-sm font-semibold text-zinc-500">/ 70 Rumah</span>
            </div>

            <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden mt-4">
              <div
                className="bg-zinc-950 h-2.5 rounded-full transition-all duration-700"
                style={{ width: `${data?.persenKepatuhan || 0}%` }}
              ></div>
            </div>

            <p className="text-xs text-zinc-500 mt-4 leading-relaxed">
              Persentase kepatuhan warga dalam menyetor iuran rutin bulanan untuk operasional RT 10.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs sm:text-sm text-zinc-600">
            <span className="font-medium">Iuran Wajib:</span>
            <span className="font-bold text-zinc-950 text-sm sm:text-base">Rp 50.000 / bln</span>
          </div>
        </div>

        {/* Kepatuhan Per Blok Hunian A s/d G (Col Span 8) */}
        <div className="md:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-zinc-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-zinc-950 tracking-tight flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                Kepatuhan Per Blok (70 Rumah)
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                Monitoring ketercapaian kas per klaster hunian Blok A s/d Blok G
              </p>
            </div>
            <span className="text-xs font-bold text-zinc-700 bg-zinc-100 px-3 py-1 rounded-lg font-mono">
              7 Blok Hunian
            </span>
          </div>

          {/* Grid 2-kolom untuk 7 blok hunian agar hemat ruang vertikal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data?.performaBlok.map((b) => {
              const isTertib = b.persentase >= 80;
              return (
                <div
                  key={b.blok}
                  className="p-3.5 rounded-2xl bg-zinc-50/80 border border-zinc-200/70 hover:bg-white hover:border-zinc-300 transition-all flex items-center justify-between gap-3"
                >
                  <div className="w-16 font-black text-sm sm:text-base text-zinc-950 shrink-0 font-mono">
                    {b.blok}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-zinc-600 font-semibold">
                        {b.lunas}/{b.totalRumah} rumah
                      </span>
                      <span className="font-extrabold text-zinc-950 font-mono text-xs">{b.persentase}%</span>
                    </div>
                    <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          isTertib ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${b.persentase}%` }}
                      />
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span
                      className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        isTertib
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      {isTertib ? 'Tertib' : 'Sebagian'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
            <span>Total Target: 70 Hunian Warga RT 10</span>
            <span className="font-semibold text-zinc-800">Update berkala per awal bulan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
