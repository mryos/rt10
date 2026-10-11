import Link from 'next/link';
import type { Berita } from '@/lib/types';

interface BeritaCardProps {
  berita: Berita;
}

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

export default function BeritaCard({ berita }: BeritaCardProps) {
  const config = KATEGORI_CONFIG[berita.kategori] || {
    badge: 'bg-zinc-50 text-zinc-700 border-zinc-200/70',
    dot: 'bg-zinc-400',
  };

  return (
    <Link href={`/berita/${berita.id}`} className="group block h-full">
      <article className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-xs hover:border-zinc-300 hover:shadow-md transition-all duration-300 flex flex-col h-full">
        {berita.urlGambar ? (
          <div className="relative h-44 sm:h-48 w-full bg-zinc-100 overflow-hidden">
            <img
              src={berita.urlGambar}
              alt={berita.judul}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
            />
          </div>
        ) : (
          <div className="h-28 bg-gradient-to-br from-zinc-50 to-zinc-100 border-b border-zinc-100 p-4 flex items-end">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Warta RT 10</span>
          </div>
        )}

        <div className="p-5 flex flex-col flex-1">
          {/* Metadata */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${config.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
              {berita.kategori}
            </span>
            <span className="text-[11px] text-zinc-400 font-medium">{berita.tanggal}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-zinc-900 text-base leading-snug mb-2 group-hover:text-zinc-600 transition-colors line-clamp-2">
            {berita.judul}
          </h3>

          {/* Excerpt */}
          <p className="text-zinc-500 text-xs leading-relaxed line-clamp-3 flex-1 mb-4">
            {berita.isiKonten}
          </p>

          {/* Read more */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-semibold text-zinc-900 group-hover:translate-x-0.5 transition-transform">
            <span>Baca selengkapnya</span>
            <svg className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </article>
    </Link>
  );
}
