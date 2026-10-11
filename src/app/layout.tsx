import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Portal RT 10 — Sistem Informasi & Manajemen Warga',
  description: 'Portal internal pencatatan iuran, berita kegiatan, dan layanan aspirasi warga RT 10',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <body className={`${jakarta.className} min-h-screen flex flex-col bg-[#FBFBFB]`}>
        <Navbar />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          {children}
        </main>
        <footer className="border-t border-zinc-200/60 bg-white/50 backdrop-blur py-6 text-center text-xs text-zinc-400">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© {new Date().getFullYear()} Rukun Tetangga (RT) 10. Sistem Informasi Terpadu.</p>
            <p className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              Sistem Aktif & Terhubung ke Google Sheets
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
