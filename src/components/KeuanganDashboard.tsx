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

  // Ekspor PDF Laporan Keuangan
  const handleExportPDF = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    const element = document.getElementById('laporan-keuangan-export');
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#FAFAFA' });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth - 16;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.setFontSize(14);
    pdf.text(`Laporan Keuangan Terbuka Kas RT 10 - Periode ${data?.periode || selectedYear}`, 8, 12);
    pdf.setFontSize(8);
    pdf.setTextColor(100);
    pdf.text(`Dokumen resmi transparansi kas warga. Dicetak pada: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`, 8, 17);
    pdf.addImage(imgData, 'PNG', 8, 22, imgWidth, imgHeight);
    pdf.save(`Laporan_Keuangan_RT10_${selectedYear}_${selectedMonth}.pdf`);
  };

  const monthOptions = [
    { val: 'all', label: 'Seluruh Bulan (Akumulatif)' },
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
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-zinc-900 border-t-transparent" />
        <p className="mt-4 text-xs font-medium text-zinc-400">Menyinkronkan data buku kas & laporan keuangan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8" id="laporan-keuangan-export">
      {/* Header Banner Transparansi Publik */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-zinc-200/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold mb-3 border border-emerald-200/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Akses Publik Terbuka • Transparansi Kas Warga RT 10
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
            Dashboard Laporan Keuangan Kas
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-xl">
            Laporan pertanggungjawaban kas kasbon, realisasi iuran bulanan 70 hunian, dan rekap mutasi belanja operasional lingkungan secara terbuka.
          </p>
        </div>

        {/* Filter Controls & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Year Switcher */}
          <div className="inline-flex items-center p-1 bg-white rounded-xl border border-zinc-200/80 shadow-xs text-xs">
            {['2024', '2025', '2026'].map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  selectedYear === yr
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>

          {/* Month Selector */}
          <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs px-2.5 py-1.5 text-xs">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-medium text-zinc-800 focus:outline-none cursor-pointer"
            >
              {monthOptions.map((m) => (
                <option key={m.val} value={m.val}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Export Actions */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-zinc-700 text-xs font-semibold
                       rounded-xl border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 transition-all shadow-xs"
            title="Download CSV Buku Kas"
          >
            <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white text-xs font-semibold
                       rounded-xl hover:bg-zinc-800 transition-all shadow-xs"
            title="Download Dokumen PDF Laporan Keuangan"
          >
            <svg className="w-3.5 h-3.5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Unduh PDF</span>
          </button>
        </div>
      </div>

      {/* Row 1: 4 Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo Kas Bersih */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs hover:border-zinc-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-400 font-medium uppercase tracking-wider mb-2">
              <span>Saldo Akhir Kas</span>
              <span className="p-1 rounded-md bg-zinc-100 text-zinc-700">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </span>
            </div>
            <div className="text-2xl font-bold tracking-tight text-zinc-950">
              {formatRupiah(data?.saldoAkhir || 0)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
              <span>↑</span> {formatRupiah(data?.surplusDefisit || 0)} surplus
            </span>
            <span className="text-zinc-400">Kas Aman</span>
          </div>
        </div>

        {/* Card 2: Total Penerimaan Kas */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs hover:border-zinc-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-emerald-700 font-medium uppercase tracking-wider mb-2">
              <span>Total Pemasukan</span>
              <span className="p-1 rounded-md bg-emerald-50 text-emerald-600">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </span>
            </div>
            <div className="text-2xl font-bold tracking-tight text-emerald-800">
              {formatRupiah(data?.totalPemasukan || 0)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px]">
            <span className="text-zinc-500">Iuran + Donasi Warga</span>
            <span className="text-emerald-700 font-medium">100% Tercatat</span>
          </div>
        </div>

        {/* Card 3: Total Pengeluaran */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs hover:border-zinc-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-rose-600 font-medium uppercase tracking-wider mb-2">
              <span>Realisasi Belanja</span>
              <span className="p-1 rounded-md bg-rose-50 text-rose-600">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              </span>
            </div>
            <div className="text-2xl font-bold tracking-tight text-rose-700">
              {formatRupiah(data?.totalPengeluaran || 0)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px]">
            <span className="text-zinc-500">
              Rasio Belanja:{' '}
              {data ? Math.round((data.totalPengeluaran / (data.totalPemasukan || 1)) * 100) : 0}%
            </span>
            <span className="text-zinc-400">Efisiensi Tinggi</span>
          </div>
        </div>

        {/* Card 4: Kepatuhan Iuran */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs hover:border-zinc-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-500 font-medium uppercase tracking-wider mb-2">
              <span>Tingkat Kepatuhan Warga</span>
              <span className="p-1 rounded-md bg-zinc-100 text-zinc-700">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-zinc-950">
                {data?.persenKepatuhan || 0}%
              </span>
              <span className="text-xs text-zinc-500 font-medium">70 Hunian</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100">
            <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${data?.persenKepatuhan || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Dua Kartu Alokasi Anggaran (Card Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card A: Pos Alokasi Pengeluaran */}
        <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
                Pos Alokasi Pengeluaran Kas
              </h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Rincian belanja rutin, honor satpam, kebersihan, dan pemeliharaan lingkungan
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 font-mono">
              {formatRupiah(data?.totalPengeluaran || 0)}
            </span>
          </div>

          <div className="space-y-4">
            {data?.alokasiPengeluaran.map((item) => (
              <div key={item.kategori} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.warna }}
                    />
                    <span className="font-semibold text-zinc-800">{item.kategori}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-bold text-zinc-900">{formatRupiah(item.nominal)}</span>
                    <span className="text-zinc-400 font-mono">({item.persentase}%)</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${item.persentase}%`,
                      backgroundColor: item.warna,
                    }}
                  />
                </div>
                <p className="text-[10px] text-zinc-400 pl-4">{item.deskripsi}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Card B: Sumber Penerimaan Kas */}
        <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-xs space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
                  Komposisi Sumber Pemasukan
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Asal penerimaan kas dari iuran wajib bulanan dan partisipasi sukarela warga
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-mono">
                {formatRupiah(data?.totalPemasukan || 0)}
              </span>
            </div>

            <div className="space-y-4 mt-5">
              {data?.alokasiPemasukan.map((item) => (
                <div key={item.kategori} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.warna }}
                      />
                      <span className="font-semibold text-zinc-800">{item.kategori}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="font-bold text-emerald-800">{formatRupiah(item.nominal)}</span>
                      <span className="text-zinc-400 font-mono">({item.persentase}%)</span>
                    </div>
                  </div>

                  <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${item.persentase}%`,
                        backgroundColor: item.warna,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-400 pl-4">{item.deskripsi}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mini Transparency Note */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/60 mt-4 text-xs text-zinc-600 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-zinc-900">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Ketentuan Iuran Kas Warga RT 10</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Iuran rutin ditetapkan sebesar <strong>Rp 50.000 / rumah / bulan</strong>, dibayarkan selambatnya tanggal 10 tiap bulan untuk kelancaran honor satpam malam dan operasional pemeliharaan lingkungan.
            </p>
          </div>
        </div>
      </div>

      {/* Row 3: Card Monitoring Kepatuhan Pembayaran Per Blok (7 Blok Hunian) */}
      <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
              Monitoring Kepatuhan Iuran Berdasarkan Blok (70 Rumah)
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Sebaran realisasi pembayaran kas warga per cluster hunian Blok A sampai dengan Blok G
            </p>
          </div>
          <span className="text-xs text-zinc-500 bg-zinc-50 px-3 py-1 rounded-lg border border-zinc-200/50">
            Total Target: 70 Rumah
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {data?.performaBlok.map((b) => {
            const isTertib = b.persentase >= 80;
            return (
              <div
                key={b.blok}
                className="p-4 rounded-xl border border-zinc-200/70 bg-zinc-50/50 hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-zinc-900">{b.blok}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isTertib
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {isTertib ? 'Tertib' : 'Sebagian'}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs mt-1">
                    <span className="text-zinc-500 text-[11px]">Lunas:</span>
                    <span className="font-bold text-zinc-900">
                      {b.lunas} / {b.totalRumah} rumah
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs mt-0.5">
                    <span className="text-zinc-500 text-[11px]">Terkumpul:</span>
                    <span className="font-semibold text-emerald-700 text-[11px]">
                      {formatRupiah(b.nominalTerkumpul)}
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                    <span>Realisasi</span>
                    <span className="font-bold text-zinc-700">{b.persentase}%</span>
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
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 4: Card Buku Kas / Catatan Mutasi Terbuka (Public Ledger Card) */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden space-y-4 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
              Buku Kas & Catatan Mutasi Terbuka (Public Ledger)
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Seluruh riwayat arus kas masuk dan pengeluaran belanja lingkungan dapat diperiksa oleh siapapun
            </p>
          </div>

          {/* Filter Tab & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-0.5 bg-zinc-100/70 rounded-xl border border-zinc-200/60 text-xs">
              <button
                onClick={() => setActiveTab('semua')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  activeTab === 'semua'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setActiveTab('masuk')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  activeTab === 'masuk'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Masuk (+)
              </button>
              <button
                onClick={() => setActiveTab('keluar')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  activeTab === 'keluar'
                    ? 'bg-white text-rose-700 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Keluar (-)
              </button>
            </div>

            {/* Live Search Box */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari transaksi / kwitansi..."
                className="pl-8 pr-3 py-1.5 text-xs text-zinc-900 bg-zinc-50 border border-zinc-200/70 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all placeholder:text-zinc-400 w-full sm:w-52"
              />
              <svg
                className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Mutasi Table */}
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-200/70 bg-zinc-50/70 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <th className="py-3 px-6">Tanggal / No Bukti</th>
                <th className="py-3 px-4">Kategori Pos</th>
                <th className="py-3 px-4">Rincian & Keterangan Belanja</th>
                <th className="py-3 px-4 text-right">Nominal</th>
                <th className="py-3 px-4 text-right">Saldo Kas</th>
                <th className="py-3 px-6 text-right">Verifikator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {filteredTransaksi.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    Tidak ada transaksi kas yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredTransaksi.map((item) => {
                  const isMasuk = item.tipe === 'masuk';
                  return (
                    <tr key={item.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <div className="font-semibold text-zinc-900">{item.tanggal}</div>
                        <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                          {item.noBukti || item.id}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200/50">
                          {item.kategori}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-800 max-w-xs">
                        <div className="line-clamp-2 leading-relaxed">{item.keterangan}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-bold font-mono text-xs ${
                            isMasuk ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {isMasuk ? '+' : '-'} {formatRupiah(item.nominal)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono text-zinc-600 text-[11px]">
                        {formatRupiah(item.saldoSetelah)}
                      </td>
                      <td className="py-3.5 px-6 text-right whitespace-nowrap text-zinc-500 text-[11px]">
                        {item.penanggungJawab}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-100">
          <span>Menampilkan {filteredTransaksi.length} catatan mutasi kas</span>
          <span>Buku Kas Terbuka RT 10</span>
        </div>
      </div>

      {/* Row 5: Rekening Resmi Kas RT & Informasi Bendahara */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl bg-zinc-900 text-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
              Rekening Resmi Kas RT
            </span>
            <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-emerald-400 text-[10px] font-semibold">
              BCA / Virtual Account
            </span>
          </div>
          <div>
            <p className="text-xl font-mono font-bold tracking-wider">8240-1928-3019</p>
            <p className="text-xs text-zinc-400 mt-1">Atas Nama: <strong>KAS PAGUYUBAN RT 10</strong></p>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed pt-2 border-t border-zinc-800">
            Warga yang membayar secara transfer dimohon mencantumkan berita transfer berupa <strong>[Blok Rumah - Nama]</strong> untuk memudahkan rekonsiliasi bendahara.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
              <span className="font-semibold uppercase tracking-wider">Verifikasi & Konfirmasi</span>
              <span className="text-emerald-600 font-medium">Buku Kas Terbuka</span>
            </div>
            <h3 className="font-bold text-sm text-zinc-900">
              Pertanyaan atau Bukti Transfer Kwitansi
            </h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Jika terdapat ketidaksesuaian pencatatan atau warga ingin meminta salinan kwitansi resmi, silakan hubungi Bendahara RT atau kirim aspirasi melalui form aduan.
            </p>
          </div>
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
            <span className="text-zinc-600 font-medium">Bendahara RT 10</span>
            <span className="text-zinc-400 text-[11px]">Audit Bulanan Tiap Tanggal 28</span>
          </div>
        </div>
      </div>
    </div>
  );
}
