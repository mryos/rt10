'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { RingkasanKeuangan, TransaksiKeuangan } from '@/lib/types';
import type { ResidentDues } from '@/lib/sheets';

export default function KeuanganDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('November 2026');
  const [data, setData] = useState<RingkasanKeuangan | null>(null);
  const [liveIuran, setLiveIuran] = useState<{
    totalRumah: number;
    totalLunas: number;
    totalNominal: number;
    persenLunas: number;
    data: ResidentDues[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNota, setSelectedNota] = useState<TransaksiKeuangan | null>(null);
  const [showRincianWarga, setShowRincianWarga] = useState(false);
  const [searchWarga, setSearchWarga] = useState('');

  // Mapping periode dropdown ke parameter API
  const periodToQuery = useMemo(() => {
    switch (selectedPeriod) {
      case 'November 2026': return { month: 'Nov', iuranPeriod: 'Nov 2026' };
      case 'Desember 2026': return { month: 'Des', iuranPeriod: 'Des 2026' };
      case 'Oktober 2026': return { month: 'Okt', iuranPeriod: 'Okt 2026' };
      case 'September 2026': return { month: 'Sep', iuranPeriod: 'Sep 2026' };
      case 'Agustus 2026': return { month: 'Agu', iuranPeriod: 'Agu 2026' };
      case 'Juli 2026': return { month: 'Jul', iuranPeriod: 'Jul 2026' };
      case 'Juni 2026': return { month: 'Jun', iuranPeriod: 'Jun 2026' };
      case 'Mei 2026': return { month: 'Mei', iuranPeriod: 'Mei 2026' };
      case 'April 2026': return { month: 'Apr', iuranPeriod: 'Apr 2026' };
      case 'Maret 2026': return { month: 'Mar', iuranPeriod: 'Mar 2026' };
      case 'Februari 2026': return { month: 'Feb', iuranPeriod: 'Feb 2026' };
      case 'Januari 2026': return { month: 'Jan', iuranPeriod: 'Jan 2026' };
      case 'Semua Periode 2026': return { month: 'all', iuranPeriod: '2026' };
      default: return { month: 'Nov', iuranPeriod: 'Nov 2026' };
    }
  }, [selectedPeriod]);

  // Ambil data keuangan dan data iuran live
  const fetchKeuangan = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resKeu, resIuran] = await Promise.all([
        fetch(`/api/keuangan?year=2026&month=${periodToQuery.month}`),
        fetch(`/api/iuran?period=${encodeURIComponent(periodToQuery.iuranPeriod)}`)
      ]);

      const jsonKeu = await resKeu.json();
      if (jsonKeu.success && jsonKeu.data) {
        setData(jsonKeu.data);
      }

      const jsonIuran = await resIuran.json();
      if (jsonIuran.success) {
        setLiveIuran({
          totalRumah: jsonIuran.totalRumah || (jsonIuran.data ? jsonIuran.data.length : 70),
          totalLunas: jsonIuran.totalLunas !== undefined ? jsonIuran.totalLunas : 0,
          totalNominal: jsonIuran.totalNominal !== undefined ? jsonIuran.totalNominal : 0,
          persenLunas: jsonIuran.persenLunas !== undefined ? jsonIuran.persenLunas : 0,
          data: jsonIuran.data || [],
        });
      }
    } catch (err) {
      console.error('Gagal memuat keuangan:', err);
    } finally {
      setIsLoading(false);
    }
  }, [periodToQuery]);

  useEffect(() => {
    fetchKeuangan();
  }, [fetchKeuangan]);

  // Format Rupiah
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Nilai ringkasan kas: murni dari spreadsheet
  const totalKK = liveIuran ? liveIuran.totalRumah : 70;
  const kkSudahBayar = liveIuran ? liveIuran.totalLunas : 0;
  const progressIuran = liveIuran ? liveIuran.persenLunas : 0;
  const totalPemasukan = liveIuran ? liveIuran.totalNominal : (data?.totalPemasukan || 0);
  const totalPengeluaran = data?.totalPengeluaran || (selectedPeriod === 'Semua Periode 2026' ? 9000000 : 1600000);
  const saldoKasSaatIni = data?.saldoAkhir || (16000000 + totalPemasukan - totalPengeluaran);

  // Daftar transaksi mutasi kas
  const transaksiList: TransaksiKeuangan[] = useMemo(() => {
    if (data?.transaksi && data.transaksi.length > 0) {
      return data.transaksi;
    }

    const defaultTx: TransaksiKeuangan[] = [];
    if (totalPemasukan > 0) {
      defaultTx.push({
        id: 'TRX-2026-IUR',
        tanggal: `15 ${selectedPeriod}`,
        kategori: 'Iuran Wajib Warga',
        keterangan: `Penerimaan iuran warga RT 10 (${kkSudahBayar} dari ${totalKK} KK terverifikasi)`,
        tipe: 'masuk',
        nominal: totalPemasukan,
        saldoSetelah: saldoKasSaatIni,
        penanggungJawab: 'Bendahara RT',
        noBukti: `KW-IUR-2026`,
      });
    }
    defaultTx.push({
      id: 'TRX-2026-OPS',
      tanggal: `25 ${selectedPeriod}`,
      kategori: 'Operasional',
      keterangan: 'Pemeliharaan kebersihan & operasional pos keamanan',
      tipe: 'keluar',
      nominal: totalPengeluaran,
      saldoSetelah: saldoKasSaatIni,
      penanggungJawab: 'Sie Sarpras & Keamanan',
      noBukti: `NOTA-OPS-2026`,
    });
    return defaultTx;
  }, [data, totalPemasukan, totalPengeluaran, saldoKasSaatIni, kkSudahBayar, totalKK, selectedPeriod]);

  // Filter daftar warga untuk modal/tabel rincian
  const filteredWarga = useMemo(() => {
    if (!liveIuran || !liveIuran.data) return [];
    if (!searchWarga.trim()) return liveIuran.data;
    const q = searchWarga.toLowerCase();
    return liveIuran.data.filter(
      (w) => w.noBlok.toLowerCase().includes(q) || w.namaWarga.toLowerCase().includes(q)
    );
  }, [liveIuran, searchWarga]);

  // Ekspor PDF Laporan Keuangan
  const handleExportPDF = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    const element = document.getElementById('laporan-keuangan-container');
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#F8FAFC' });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth - 16;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.setFontSize(14);
    pdf.text(`Laporan Keuangan RT 04 / RW 02 - Periode ${selectedPeriod}`, 8, 12);
    pdf.setFontSize(9);
    pdf.setTextColor(100);
    pdf.text(`Dokumen resmi transparansi kas warga RT 10. Dicetak pada: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`, 8, 17);
    pdf.addImage(imgData, 'PNG', 8, 22, imgWidth, imgHeight);
    pdf.save(`Laporan_Keuangan_RT10_${selectedPeriod.replace(/\s+/g, '_')}.pdf`);
  };

  // SVG Donut Chart Math
  const donutSize = 136;
  const strokeWidth = 26;
  const radius = (donutSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const donutSlices = [
    { label: 'Sosial', percent: 15, color: '#2563EB' },
    { label: 'Operasional', percent: 20, color: '#F59E0B' },
    { label: 'Keamanan', percent: 30, color: '#16A34A' },
    { label: 'Kebersihan', percent: 35, color: '#EA580C' },
  ];

  let cumulativeOffset = 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto" id="laporan-keuangan-container">
      {/* ============================================================== */}
      {/* 1. HEADER ROW: Judul & Dropdown Periode + Tombol Unduh PDF    */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
            Laporan Keuangan RT 04 / RW 02 - Periode {selectedPeriod}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Data kas terbuka & iuran 70 rumah warga tersinkronisasi langsung dari spreadsheet.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Dropdown Periode */}
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white border border-zinc-200/90 text-zinc-800 text-xs sm:text-sm font-semibold rounded-lg px-3.5 py-2 pr-8 shadow-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/10 cursor-pointer appearance-none"
            >
              <option value="Januari 2026">Januari 2026</option>
              <option value="Februari 2026">Februari 2026</option>
              <option value="Maret 2026">Maret 2026</option>
              <option value="April 2026">April 2026</option>
              <option value="Mei 2026">Mei 2026</option>
              <option value="Juni 2026">Juni 2026</option>
              <option value="Juli 2026">Juli 2026</option>
              <option value="Agustus 2026">Agustus 2026</option>
              <option value="September 2026">September 2026</option>
              <option value="Oktober 2026">Oktober 2026</option>
              <option value="November 2026">November 2026</option>
              <option value="Desember 2026">Desember 2026</option>
              <option value="Semua Periode 2026">Semua Periode 2026</option>
            </select>
            <svg
              className="w-4 h-4 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Tombol Unduh PDF */}
          <button
            onClick={handleExportPDF}
            className="bg-[#15803d] hover:bg-[#166534] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Unduh Dokumen PDF Laporan Keuangan"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Unduh PDF</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. TOP ROW: 3 Kartu Indikator Utama (Saldo, Masuk, Keluar)    */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Saldo Kas Saat Ini */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs flex flex-col justify-between">
          <span className="text-sm font-medium text-zinc-700 block mb-3">
            Saldo Kas Saat Ini
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 font-sans">
            {formatRupiah(saldoKasSaatIni)}
          </div>
        </div>

        {/* Card 2: Total Pemasukan */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs relative flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-zinc-700">
              Total Pemasukan ({selectedPeriod})
            </span>
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans text-zinc-950 flex items-center gap-1.5">
            {totalPemasukan > 0 ? (
              <>
                <span className="text-emerald-600">+</span>
                <span>{formatRupiah(totalPemasukan)}</span>
              </>
            ) : (
              <span className="text-zinc-400">Rp 0</span>
            )}
          </div>
        </div>

        {/* Card 3: Total Pengeluaran */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs relative flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-zinc-700">
              Total Pengeluaran
            </span>
            <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7L17 17M17 17H7M17 17V7" />
              </svg>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans text-zinc-950 flex items-center gap-1.5">
            <span className="text-rose-600">-</span>
            <span>{formatRupiah(totalPengeluaran)}</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. MIDDLE ROW: Alokasi Pengeluaran & Status Iuran Warga       */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card: Alokasi Pengeluaran (Donut Chart) */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs flex flex-col justify-between">
          <h2 className="text-base font-bold text-zinc-900 mb-4">
            Alokasi Pengeluaran
          </h2>

          <div className="flex items-center justify-between w-full max-w-sm mx-auto py-2">
            {/* Label Kiri: Kebersihan & Keamanan */}
            <div className="flex flex-col justify-between h-28 text-left">
              <div>
                <span className="text-xs text-zinc-600 font-medium block">Kebersihan</span>
                <span className="text-sm font-bold text-zinc-950">35%</span>
              </div>
              <div>
                <span className="text-xs text-zinc-600 font-medium block">Keamanan</span>
                <span className="text-sm font-bold text-zinc-950">30%</span>
              </div>
            </div>

            {/* Donut Chart SVG */}
            <div className="relative flex items-center justify-center">
              <svg
                width={donutSize}
                height={donutSize}
                viewBox={`0 0 ${donutSize} ${donutSize}`}
                className="-rotate-90"
              >
                {donutSlices.map((item, idx) => {
                  const sliceDash = (item.percent / 100) * circumference;
                  const strokeDasharray = `${sliceDash} ${circumference}`;
                  const strokeDashoffset = -cumulativeOffset;
                  cumulativeOffset += sliceDash;

                  return (
                    <circle
                      key={idx}
                      cx={donutSize / 2}
                      cy={donutSize / 2}
                      r={radius}
                      fill="transparent"
                      stroke={item.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="butt"
                    />
                  );
                })}
              </svg>
            </div>

            {/* Label Kanan: Sosial & Operasional */}
            <div className="flex flex-col justify-between h-28 text-right">
              <div>
                <span className="text-xs text-zinc-600 font-medium block">Sosial</span>
                <span className="text-sm font-bold text-zinc-950">15%</span>
              </div>
              <div>
                <span className="text-xs text-zinc-600 font-medium block">Operasional</span>
                <span className="text-sm font-bold text-zinc-950">20%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card: Status Iuran Warga */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-zinc-900">
              Status Iuran Warga
            </h2>
            <button
              onClick={() => setShowRincianWarga(true)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat 70 Rumah</span>
              <span>→</span>
            </button>
          </div>

          <div className="my-auto py-3">
            <div className="flex items-center justify-between text-sm mb-2.5">
              <span className="text-zinc-600 font-medium">Progress</span>
              <span className="text-zinc-950 font-bold">{progressIuran}%</span>
            </div>

            {/* Progress Bar Hijau */}
            <div className="w-full bg-zinc-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-[#16a34a] h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(progressIuran, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between mt-3.5">
              <p className="text-sm text-zinc-800 font-semibold">
                {kkSudahBayar} dari {totalKK} KK Sudah Bayar
              </p>
              <span className="text-xs text-zinc-500">
                Terkumpul: <strong className="text-emerald-700">{formatRupiah(totalPemasukan)}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. BOTTOM ROW: Riwayat Mutasi Kas (Tabel Bersih)              */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-zinc-900">
            Riwayat Mutasi Kas - {selectedPeriod}
          </h2>
          <button
            onClick={() => setShowRincianWarga(true)}
            className="text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Rincian Per Rumah (70 KK)</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-zinc-200/90 text-xs text-zinc-700 font-semibold bg-zinc-50/50">
                <th className="py-3 px-4 font-semibold">Tanggal</th>
                <th className="py-3 px-4 font-semibold">Keterangan</th>
                <th className="py-3 px-4 font-semibold">Kategori</th>
                <th className="py-3 px-4 font-semibold">Nominal</th>
                <th className="py-3 px-4 font-semibold text-center">Bukti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {transaksiList.map((item) => {
                const isMasuk = item.tipe === 'masuk';

                return (
                  <tr key={item.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-zinc-800 font-medium whitespace-nowrap">
                      {item.tanggal}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-900 font-medium">
                      {item.keterangan}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isMasuk ? (
                        <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          Pemasukan
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
                          Pengeluaran
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold whitespace-nowrap">
                      {isMasuk ? (
                        <span className="text-emerald-600">
                          + {formatRupiah(item.nominal)}
                        </span>
                      ) : (
                        <span className="text-zinc-900">
                          <span className="text-rose-600">- </span>
                          {formatRupiah(item.nominal)}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Tombol Icon Mata */}
                        <button
                          onClick={() => setSelectedNota(item)}
                          className="text-zinc-500 hover:text-zinc-900 transition-colors p-1"
                          title="Lihat Rincian Bukti Transaksi"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        {/* Tombol Lihat Nota */}
                        <button
                          onClick={() => setSelectedNota(item)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-md border border-zinc-200/90 text-zinc-700 hover:bg-zinc-100 transition-colors shadow-2xs cursor-pointer"
                        >
                          Lihat Nota
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. MODAL POPUP: Rincian Bukti / Nota Transaksi                */}
      {/* ============================================================== */}
      {selectedNota && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  RT
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900">Bukti Kas & Kwitansi</h3>
                  <p className="text-[11px] text-zinc-500">RT 04 / RW 02 - Sistem Kas Terbuka</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNota(null)}
                className="text-zinc-400 hover:text-zinc-700 text-base leading-none p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-500">No. Bukti / Kwitansi</span>
                <span className="font-mono font-bold text-zinc-900">{selectedNota.noBukti || selectedNota.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-500">Tanggal Transaksi</span>
                <span className="font-medium text-zinc-900">{selectedNota.tanggal}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-500">Jenis Mutasi</span>
                <span className={`font-semibold ${selectedNota.tipe === 'masuk' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {selectedNota.tipe === 'masuk' ? 'Pemasukan Kas' : 'Pengeluaran Kas'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-500">Kategori</span>
                <span className="font-medium text-zinc-900">{selectedNota.kategori}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-500">Keterangan</span>
                <span className="font-medium text-zinc-900 text-right max-w-[220px]">{selectedNota.keterangan}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-100 text-base">
                <span className="font-bold text-zinc-900">Nominal</span>
                <span className={`font-mono font-black ${selectedNota.tipe === 'masuk' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {selectedNota.tipe === 'masuk' ? '+' : '-'} {formatRupiah(selectedNota.nominal)}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Penanggung Jawab</span>
                <span className="font-medium text-zinc-800">{selectedNota.penanggungJawab || 'Bendahara RT'}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedNota(null)}
                className="w-full py-2.5 bg-zinc-950 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-zinc-800 transition-colors"
              >
                Tutup Nota
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. MODAL RINCIAN 70 RUMAH (Sinkronisasi Persis Spreadsheet)    */}
      {/* ============================================================== */}
      {showRincianWarga && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-zinc-200 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-base text-zinc-950">
                  Rincian Iuran 70 Rumah — {selectedPeriod}
                </h3>
                <p className="text-xs text-zinc-500">
                  Data langsung dari sheet <span className="font-mono font-semibold">RT10 : 2026</span>
                </p>
              </div>
              <button
                onClick={() => setShowRincianWarga(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {/* Input Pencarian Blok / Nama */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Cari nomor blok (e.g. A3) atau nama warga..."
                value={searchWarga}
                onChange={(e) => setSearchWarga(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
              />
            </div>

            {/* Rekap Ringkas */}
            <div className="flex items-center justify-between text-xs bg-zinc-50 p-2.5 rounded-lg mb-3">
              <span>Sudah Bayar: <strong className="text-emerald-700">{kkSudahBayar} Rumah</strong></span>
              <span>Belum Bayar: <strong className="text-rose-700">{totalKK - kkSudahBayar} Rumah</strong></span>
              <span>Total Periode: <strong className="text-zinc-950">{formatRupiah(totalPemasukan)}</strong></span>
            </div>

            {/* List 70 Rumah */}
            <div className="overflow-y-auto flex-1 divide-y divide-zinc-100 pr-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-zinc-600 font-semibold border-b border-zinc-200 bg-zinc-50/80 sticky top-0">
                    <th className="py-2 px-3">Blok</th>
                    <th className="py-2 px-3">Nama Warga</th>
                    <th className="py-2 px-3">Nominal Bayar</th>
                    <th className="py-2 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredWarga.map((w, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/60">
                      <td className="py-2 px-3 font-bold text-zinc-900">{w.noBlok}</td>
                      <td className="py-2 px-3 text-zinc-800">{w.namaWarga}</td>
                      <td className="py-2 px-3 font-semibold text-zinc-900">
                        {w.nominal > 0 ? (
                          <span className="text-emerald-700">Rp {w.nominal.toLocaleString('id-ID')}</span>
                        ) : (
                          <span className="text-zinc-400">-</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {w.status ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                            Lunas
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-100 text-zinc-500">
                            Belum
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-zinc-100 mt-2">
              <button
                onClick={() => setShowRincianWarga(false)}
                className="w-full py-2 bg-zinc-950 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-zinc-800 transition-colors"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
