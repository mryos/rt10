'use client';

import { useState } from 'react';

const BLOK_LIST = [
  ...Array.from({ length: 10 }, (_, i) => `Blok A${i + 3}`),
  ...Array.from({ length: 11 }, (_, i) => `Blok B${i + 1}`),
  ...Array.from({ length: 14 }, (_, i) => `Blok C${i + 1}`),
  ...Array.from({ length: 5 }, (_, i) => `Blok D${i + 3}`),
  ...Array.from({ length: 7 }, (_, i) => `Blok E${i + 1}`),
  ...Array.from({ length: 14 }, (_, i) => `Blok F${i + 1}`),
  ...Array.from({ length: 9 }, (_, i) => `Blok G${i + 1}`),
];

const KATEGORI_ADUAN = [
  'Kebersihan Lingkungan',
  'Keamanan & Ketertiban',
  'Infrastruktur / Jalan / Lampu',
  'Kebisingan',
  'Ketertiban Parkir',
  'Usulan / Lainnya',
];

export default function AduanForm() {
  const [nama, setNama] = useState('');
  const [noRumah, setNoRumah] = useState('');
  const [kategori, setKategori] = useState('');
  const [isiAduan, setIsiAduan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!noRumah || !kategori || !isiAduan.trim()) {
      setResult({ success: false, message: 'Harap lengkapi nomor rumah, kategori, dan isi aduan Anda.' });
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    try {
      const res = await fetch('/api/aduan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: nama.trim() || 'Anonim',
          noRumah,
          kategori,
          isiAduan: isiAduan.trim(),
        }),
      });
      const data = await res.json();
      setResult(data);

      if (data.success) {
        setNama('');
        setNoRumah('');
        setKategori('');
        setIsiAduan('');
      }
    } catch {
      setResult({ success: false, message: 'Terjadi kendala jaringan. Mohon coba beberapa saat lagi.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-zinc-200/80 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="space-y-4">
        {/* Nama (Opsional) */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
            Nama Pelapor <span className="text-zinc-400 font-normal normal-case">(Opsional, kosongkan jika ingin Anonim)</span>
          </label>
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Contoh: Bapak Budi / Ibu Siti (bisa dikosongkan)"
            className="w-full px-3.5 py-2.5 text-xs text-zinc-900 bg-zinc-50 border border-zinc-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
          />
        </div>

        {/* Grid 2 Kolom untuk No Rumah & Kategori */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* No. Rumah */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
              Nomor Blok / Rumah <span className="text-rose-500">*</span>
            </label>
            <select
              value={noRumah}
              onChange={(e) => setNoRumah(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs text-zinc-900 bg-zinc-50 border border-zinc-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all cursor-pointer"
              required
            >
              <option value="">Pilih Hunian...</option>
              {BLOK_LIST.map((blok) => (
                <option key={blok} value={blok}>
                  {blok}
                </option>
              ))}
            </select>
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
              Kategori Aspirasi <span className="text-rose-500">*</span>
            </label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs text-zinc-900 bg-zinc-50 border border-zinc-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all cursor-pointer"
              required
            >
              <option value="">Pilih Kategori...</option>
              {KATEGORI_ADUAN.map((kat) => (
                <option key={kat} value={kat}>
                  {kat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Isi Aduan */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
            Rincian Aduan / Aspirasi <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={isiAduan}
            onChange={(e) => setIsiAduan(e.target.value)}
            rows={4}
            placeholder="Jelaskan kendala, lokasi spesifik, atau saran Anda secara rinci..."
            className="w-full px-3.5 py-2.5 text-xs text-zinc-900 bg-zinc-50 border border-zinc-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all placeholder:text-zinc-400 resize-none leading-relaxed"
            required
          />
        </div>
      </div>

      {/* Status Feedback Notification */}
      {result && (
        <div
          className={`p-4 rounded-xl text-xs flex items-start gap-2.5 ${
            result.success
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/70'
              : 'bg-rose-50 text-rose-800 border border-rose-200/70'
          }`}
        >
          <span className="text-sm">{result.success ? '✓' : '!'}</span>
          <div className="flex-1 font-medium leading-relaxed">
            {result.message}
            {result.success && (
              <p className="text-[11px] text-emerald-600 mt-0.5">
                Pengurus RT akan meninjau dan menindaklanjuti laporan Anda di sheet &quot;DB_Aduan&quot;.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-zinc-900 text-white text-xs font-semibold rounded-xl
                   hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed
                   transition-all shadow-xs flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Mengirim ke Sistem...</span>
          </>
        ) : (
          <span>Kirim Aspirasi ke Pengurus RT</span>
        )}
      </button>
    </form>
  );
}
