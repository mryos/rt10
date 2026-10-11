import AduanForm from '@/components/AduanForm';

export default function AduanPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-zinc-200/60">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 text-[11px] font-semibold mb-3 border border-zinc-200/50">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-900"></span>
          Layanan Warga
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
          Aspirasi & Aduan Warga
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Sampaikan keluhan fasilitas lingkungan, kebersihan, keamanan, atau saran perbaikan demi kenyamanan bersama.
        </p>
      </div>

      <AduanForm />
    </div>
  );
}
