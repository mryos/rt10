import AduanForm from '@/components/AduanForm';

export default function AduanPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">\uD83D\uDCDD Form Aduan Warga</h1>
        <p className="text-gray-500 mt-1">
          Sampaikan keluhan atau masukan Anda untuk lingkungan RT yang lebih baik
        </p>
      </div>
      <AduanForm />
    </div>
  );
}
