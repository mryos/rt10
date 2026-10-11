'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Berita } from '@/lib/types';

const KATEGORI_STYLE: Record<string, string> = {
  'Berita Duka': 'bg-red-100 text-red-800',
  Pengumuman: 'bg-yellow-100 text-yellow-800',
  Kegiatan: 'bg-green-100 text-green-800',
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
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        <span className="ml-3 text-gray-500">Memuat berita...</span>
      </div>
    );
  }

  if (!berita) {
    return (
      <div className="text-center py-16">
        <p className="text-5xl mb-4">\uD83D\uDE15</p>
        <p className="text-gray-500 text-lg">Berita tidak ditemukan.</p>
        <Link href="/berita" className="text-blue-600 hover:underline mt-4 inline-block">
          \u2190 Kembali ke daftar berita
        </Link>
      </div>
    );
  }

  const badgeStyle = KATEGORI_STYLE[berita.kategori] || 'bg-gray-100 text-gray-800';

  return (
    <article className="max-w-3xl mx-auto">
      <Link href="/berita" className="inline-flex items-center text-blue-600 hover:underline mb-6">
        \u2190 Kembali
      </Link>

      {berita.urlGambar && (
        <div className="rounded-xl overflow-hidden mb-6">
          <img src={berita.urlGambar} alt={berita.judul} className="w-full h-64 sm:h-80 object-cover" />
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeStyle}`}>
          {berita.kategori}
        </span>
        <span className="text-sm text-gray-400">{berita.tanggal}</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">{berita.judul}</h1>

      <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
        {berita.isiKonten}
      </div>
    </article>
  );
}
