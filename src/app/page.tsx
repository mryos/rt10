import type { Metadata } from 'next';
import KeuanganDashboard from '@/components/KeuanganDashboard';

export const metadata: Metadata = {
  title: 'Laporan Keuangan & Kas Warga — Portal RT 10',
  description: 'Transparansi laporan kas terbuka, realisasi iuran warga 70 rumah, dan rincian alokasi belanja operasional RT 10 yang dapat dilihat oleh siapapun.',
};

export default function HomePage() {
  return <KeuanganDashboard />;
}
