'use client';

import { useState } from 'react';

const BLOK_LIST = [
  ...Array.from({ length: 10 }, (_, i) => `A${i + 3}`),
  ...Array.from({ length: 11 }, (_, i) => `B${i + 1}`),
  ...Array.from({ length: 14 }, (_, i) => `C${i + 1}`),
  ...Array.from({ length: 5 }, (_, i) => `D${i + 3}`),
  ...Array.from({ length: 7 }, (_, i) => `E${i + 1}`),
  ...Array.from({ length: 14 }, (_, i) => `F${i + 1}`),
  ...Array.from({ length: 9 }, (_, i) => `G${i + 1}`),
];

const KATEGORI_ADUAN = [
  'Kebersihan',
  'Keamanan',
  'Infrastruktur',
  'Kebisingan',
  'Parkir',
  'Lainnya',
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
      setResult({ success: false, message: 'Harap isi No. Rumah, Kategori, dan Isi Aduan.' });
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
      setResult({ success: false, message: 'Terjadi kesalahan jaringan. Coba lagi.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
      {/* Nama */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Nama <span className="text-gray-400 font-normal">(kosongkan jika anonim)</span>
        </label>
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Nama Anda..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2
                     focus:ring-blue-500 focus:border-blue-500 transition"
        />
      </div>

      {/* No. Rumah */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          No. Rumah <span className="text-red-500">*</span>
        </label>
        <select
          value={noRumah}
          onChange={(e) => setNoRumah(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          required
        >
          <option value="">-- Pilih No. Rumah --</option>
          {BLOK_LIST.map((blok) => (
            <option key={blok} value={blok}>
              {blok}
            </option>
          ))}
        </select>
      </div>

      {/* Kategori */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Kategori <span className="text-red-500">*</span>
        </label>
        <select
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          required
        >
          <option value="">-- Pilih Kategori --</option>
          {KATEGORI_ADUAN.map((kat) => (
            <option key={kat} value={kat}>
              {kat}
            </option>
          ))}
        </select>
      </div>

      {/* Isi Aduan */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Isi Aduan <span className="text-red-500">*</span>
        </label>
        <textarea
          value={isiAduan}
          onChange={(e) => setIsiAduan(e.target.value)}
          rows={4}
          placeholder="Tuliskan aduan Anda..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2
                     focus:ring-blue-500 focus:border-blue-500 transition resize-none"
          required
        />
      </div>

      {/* Result */}
      {result && (
        <div
          className={`p-4 rounded-lg text-sm ${
            result.success
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {result.message}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg
                   hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed
                   transition-colors shadow-sm"
      >
        {isSubmitting ? 'Mengirim...' : '\uD83D\uDCE8 Kirim Aduan'}
      </button>
    </form>
  );
}
