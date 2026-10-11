'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Berita } from '@/lib/types';

const KATEGORI_CONFIG: Record<string, { badge: string; dot: string }> = {
  'Berita Duka': {
    badge: 'bg-rose-50 text-rose-700 border-rose-200/70',
    dot: 'bg-rose-500',
  },
  'Pengumuman': {
    badge: 'bg-amber-50 text-amber-700 border-amber-200/70',
    dot: 'bg-amber-500',
  },
  'Kegiatan': {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
    dot: 'bg-emerald-500',
  },
};

export default function BeritaDetailPage({ params }: { params: { id: string } }) {
  const [berita, setBerita] = useState<Berita | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/berita?id=${params.id}`);
        const json = await res.json();
        if (json.success) setBerita(json.data);
      } catch {
        // handle error
      } finally {
        setIsLoading(false);
      }
    })();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-zinc-200/80 p-12 text-center shadow-xs">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-zinc-900 border-t-transparent" />
        <p className="mt-4 text-xs font-medium text-zinc-400">Memuat isi warta...</p>
      </div>
    );
  }

  if (!berita) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-2xl border border-zinc-200/80 p-12 text-center shadow-xs">
        <p className="text-zinc-800 font-semibold text-sm">Warta tidak ditemukan</p>
        <p className="text-zinc-400 text-xs mt-1">Artikel mungkin telah dihapus atau ID tidak valid.</p>
        <Link
          href="/berita"
          className="inline-flex items-center gap-1.5 mt-5 px-4 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-xl hover:bg-zinc-800 transition-colors"
        >
          ← Kembali ke Berita
        </Link>
      </div>
    );
  }

  const config = KATEGORI_CONFIG[berita.kategori] || {
    badge: 'bg-zinc-50 text-zinc-700 border-zinc-200/70',
    dot: 'bg-zinc-400',
  };

  return (
    <article className="max-w-2xl mx-auto">
      {/* Back button */}
      <Link
        href="/berita"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-6 group"
      >
        <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Kembali ke Warta RT</span>
      </Link>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
        {berita.urlGambar && (
          <div className="w-full h-64 sm:h-80 bg-zinc-100 overflow-hidden">
            <img
              src={berita.urlGambar}
              alt={berita.judul}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 sm:p-8">
          {/* Metadata */}
          <div className="flex items-center gap-3 mb-4">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${config.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
              {berita.kategori}
            </span>
            <span className="text-zinc-300">•</span>
            <span className="text-xs text-zinc-400 font-medium">{berita.tanggal}</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 mb-6 leading-tight">
            {berita.judul}
          </h1>

          {/* Content */}
          <div className="prose prose-zinc max-w-none text-zinc-700 text-sm sm:text-[15px] leading-relaxed whitespace-pre-line border-t border-zinc-100 pt-6">
            {berita.isiKonten}
          </div>
        </div>
      </div>
    </article>
  );
}
