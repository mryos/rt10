'use client';

import { useState, useMemo } from 'react';
import type { IuranRecord } from '@/lib/types';

interface IuranTableProps {
  data: IuranRecord[];
  period: string;
  isLoading: boolean;
}

export default function IuranTable({ data, period, isLoading }: IuranTableProps) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'lunas' | 'belum'>('all');

  const lunas = useMemo(() => data.filter((r) => r.status).length, [data]);
  const belum = useMemo(() => data.filter((r) => !r.status).length, [data]);
  const percentLunas = data.length > 0 ? Math.round((lunas / data.length) * 100) : 0;

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        item.namaWarga.toLowerCase().includes(search.toLowerCase()) ||
        item.noBlok.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;
      if (filterStatus === 'lunas') return item.status;
      if (filterStatus === 'belum') return !item.status;
      return true;
    });
  }, [data, search, filterStatus]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-12 text-center shadow-xs">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-zinc-900 border-t-transparent" />
        <p className="mt-4 text-xs font-medium text-zinc-400">Sinkronisasi data Google Sheets...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-16 text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="font-semibold text-zinc-800 text-sm">Tidak ada data untuk periode {period}</p>
        <p className="text-zinc-400 text-xs mt-1">Pastikan header kolom di Google Sheets sesuai atau pilih bulan lain.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* KPI Minimalist Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Total Rumah</span>
            <span className="w-2 h-2 rounded-full bg-zinc-300"></span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900">{data.length}</span>
            <span className="text-xs text-zinc-400">Hunian (7 Blok)</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Sudah Lunas</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-emerald-700">{lunas}</span>
              <span className="text-xs text-zinc-400">/ {data.length}</span>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              {percentLunas}%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-600 uppercase tracking-wider">Tunggakan</span>
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-rose-600">{belum}</span>
              <span className="text-xs text-zinc-400">Hunian</span>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60">
              {100 - percentLunas}%
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nomor blok atau nama warga..."
            className="w-full pl-9 pr-3 py-1.5 text-xs text-zinc-900 bg-zinc-50 border border-zinc-200/70 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-0.5 bg-zinc-100/70 rounded-xl border border-zinc-200/60 text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              filterStatus === 'all'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Semua ({data.length})
          </button>
          <button
            onClick={() => setFilterStatus('lunas')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              filterStatus === 'lunas'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Lunas ({lunas})
          </button>
          <button
            onClick={() => setFilterStatus('belum')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              filterStatus === 'belum'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Belum ({belum})
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div id="iuran-table" className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200/70 bg-zinc-50/70 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4 w-32">Blok / No</th>
                <th className="py-3 px-4">Nama Warga</th>
                <th className="py-3 px-4 w-44 text-right">Status ({period})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-zinc-400">
                    Tidak ada warga yang cocok dengan pencarian &quot;{search}&quot;
                  </td>
                </tr>
              ) : (
                filteredData.map((row, idx) => (
                  <tr key={row.noBlok} className="hover:bg-zinc-50/80 transition-colors group">
                    <td className="py-3 px-4 text-center text-zinc-400 font-mono text-[11px]">{idx + 1}</td>
                    <td className="py-3 px-4 font-semibold text-zinc-900">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 font-mono text-[11px]">
                        {row.noBlok}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-zinc-800 group-hover:text-zinc-950">
                      {row.namaWarga}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {row.status ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Lunas
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/70">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          Belum Bayar
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="py-3 px-4 bg-zinc-50/50 border-t border-zinc-200/60 flex items-center justify-between text-[11px] text-zinc-400">
          <span>Menampilkan {filteredData.length} dari total {data.length} rumah</span>
          <span>Update otomatis via Google Sheets</span>
        </div>
      </div>
    </div>
  );
}
