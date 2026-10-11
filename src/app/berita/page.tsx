'use client';

import { useState, useEffect } from 'react';
import BeritaCard from '@/components/BeritaCard';
import type { Berita } from '@/lib/types';

export default function BeritaPage() {
  const [beritaList, setBeritaList] = useState<Berita[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/berita');
        const json = await res.json();
        if (json.success) setBeritaList(json.data);
      } catch {
        // handle silently
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-12 text-center shadow-xs">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-zinc-900 border-t-transparent" />
        <p className="mt-4 text-xs font-medium text-zinc-400">Memuat warta & kegiatan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-zinc-200/60">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 text-[11px] font-semibold mb-3 border border-zinc-200/50">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-900"></span>
          Kanal Informasi
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
          Warta & Pengumuman RT
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-xl">
          Kumpulan informasi kegiatan sosial, kerja bakti, pengumuman warga, serta kabar duka lingkungan RT 10.
        </p>
      </div>

      {/* Grid */}
      {beritaList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-16 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <p className="font-semibold text-zinc-800 text-sm">Belum ada warta diterbitkan</p>
          <p className="text-zinc-400 text-xs mt-1">Pengurus dapat menambahkan warta baru langsung di tab &quot;DB_Berita&quot;.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {beritaList.map((berita) => (
            <BeritaCard key={berita.id} berita={berita} />
          ))}
        </div>
      )}
    </div>
  );
}
