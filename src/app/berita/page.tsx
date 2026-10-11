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
        // handle error silently
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        <span className="ml-3 text-gray-500">Memuat berita...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">\uD83D\uDCF0 Berita & Pengumuman</h1>
        <p className="text-gray-500 mt-1">Info terbaru seputar kegiatan dan pengumuman RT</p>
      </div>

      {beritaList.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-4">\uD83D\uDCED</p>
          <p>Belum ada berita atau pengumuman.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {beritaList.map((berita) => (
            <BeritaCard key={berita.id} berita={berita} />
          ))}
        </div>
      )}
    </div>
  );
}
