import Link from 'next/link';
import type { Berita } from '@/lib/types';

interface BeritaCardProps {
  berita: Berita;
}

const KATEGORI_STYLE: Record<string, string> = {
  'Berita Duka': 'bg-red-100 text-red-800 border-red-200',
  'Pengumuman': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Kegiatan': 'bg-green-100 text-green-800 border-green-200',
};

export default function BeritaCard({ berita }: BeritaCardProps) {
  const badgeStyle = KATEGORI_STYLE[berita.kategori] || 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <Link href={`/berita/${berita.id}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden
                      hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer h-full flex flex-col">
        {berita.urlGambar && (
          <div className="relative h-48 bg-gray-100">
            <img
              src={berita.urlGambar}
              alt={berita.judul}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-3">
            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyle}`}>
              {berita.kategori}
            </span>
            <span className="text-xs text-gray-400">{berita.tanggal}</span>
          </div>
          <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">{berita.judul}</h3>
          <p className="text-gray-500 text-sm line-clamp-3 flex-1">{berita.isiKonten}</p>
          <div className="mt-4 text-blue-600 text-sm font-medium">
            Baca selengkapnya \u2192
          </div>
        </div>
      </div>
    </Link>
  );
}
