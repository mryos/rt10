'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import MonthYearPicker from '@/components/MonthYearPicker';
import IuranTable from '@/components/IuranTable';
import ExportButtons from '@/components/ExportButtons';
import type { IuranRecord } from '@/lib/types';

export default function DashboardPage() {
  const [period, setPeriod] = useState('Jan 2024');
  const [data, setData] = useState<IuranRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchIuran = useCallback(async (p: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/iuran?period=${encodeURIComponent(p)}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setData([]);
      }
    } catch {
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIuran(period);
  }, [period, fetchIuran]);

  return (
    <div className="space-y-8">
      {/* Hero Header Minimalist */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-zinc-200/60">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 text-[11px] font-semibold mb-3 border border-zinc-200/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            RT 10 Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
            Pencatatan Iuran Kas Warga
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-xl">
            Transparansi monitoring keuangan dan status pembayaran 70 hunian warga RT 10 secara real-time.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <MonthYearPicker selectedPeriod={period} onPeriodChange={setPeriod} />
          {data.length > 0 && <ExportButtons data={data} period={period} />}
        </div>
      </div>

      {/* Modern Financial Dashboard Highlight Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-800 text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-emerald-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-semibold tracking-tight">
              Laporan Keuangan & Mutasi Kas Terbuka
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Lihat neraca saldo kas, grafik alokasi belanja satpam & sampah, serta buku kas mutasi transparan.
            </p>
          </div>
        </div>

        <Link
          href="/keuangan"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white text-zinc-900 hover:bg-zinc-100 text-xs font-semibold rounded-xl transition-all shadow-xs shrink-0"
        >
          <span>Buka Dashboard Keuangan</span>
          <svg className="w-3.5 h-3.5 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

      {/* Table Section */}
      <IuranTable data={data} period={period} isLoading={isLoading} />
    </div>
  );
}
