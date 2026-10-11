'use client';

import { useState, useEffect, useCallback } from 'react';
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

      {/* Table Section */}
      <IuranTable data={data} period={period} isLoading={isLoading} />
    </div>
  );
}
