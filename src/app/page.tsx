'use client';

import { useState, useEffect, useCallback } from 'react';
import MonthYearPicker from '@/components/MonthYearPicker';
import IuranTable from '@/components/IuranTable';
import ExportButtons from '@/components/ExportButtons';
import type { IuranRecord } from '@/lib/types';

export default function DashboardPage() {
  const [period, setPeriod] = useState('Okt 2026');
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">💰 Dashboard Iuran RT</h1>
        <p className="text-gray-500 mt-1">Monitoring pembayaran iuran bulanan warga</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <MonthYearPicker selectedPeriod={period} onPeriodChange={setPeriod} />
        {data.length > 0 && <ExportButtons data={data} period={period} />}
      </div>

      <IuranTable data={data} period={period} isLoading={isLoading} />
    </div>
  );
}
