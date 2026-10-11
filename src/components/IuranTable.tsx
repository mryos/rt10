'use client';

import type { IuranRecord } from '@/lib/types';

interface IuranTableProps {
  data: IuranRecord[];
  period: string;
  isLoading: boolean;
}

export default function IuranTable({ data, period, isLoading }: IuranTableProps) {
  const lunas = data.filter((r) => r.status).length;
  const belum = data.filter((r) => !r.status).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        <span className="ml-3 text-gray-500">Memuat data...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-5xl mb-4">📊</p>
        <p>Tidak ada data untuk periode ini.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{data.length}</p>
          <p className="text-sm text-blue-600">Total Rumah</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{lunas}</p>
          <p className="text-sm text-green-600">Lunas ✅</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center col-span-2 sm:col-span-1">
          <p className="text-2xl font-bold text-red-700">{belum}</p>
          <p className="text-sm text-red-600">Belum Bayar ❌</p>
        </div>
      </div>

      {/* Table */}
      <div id="iuran-table" className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No. Blok</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama Warga</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status ({period})
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, idx) => (
              <tr key={row.noBlok} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.noBlok}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{row.namaWarga}</td>
                <td className="px-4 py-3 text-center">
                  {row.status ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      LUNAS ✅
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                      BELUM BAYAR ❌
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
