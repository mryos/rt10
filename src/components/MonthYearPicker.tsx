'use client';

interface MonthYearPickerProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

const MONTHS = [
  { val: 'Jan', label: 'Januari' },
  { val: 'Feb', label: 'Februari' },
  { val: 'Mar', label: 'Maret' },
  { val: 'Apr', label: 'April' },
  { val: 'Mei', label: 'Mei' },
  { val: 'Jun', label: 'Juni' },
  { val: 'Jul', label: 'Juli' },
  { val: 'Agu', label: 'Agustus' },
  { val: 'Sep', label: 'September' },
  { val: 'Okt', label: 'Oktober' },
  { val: 'Nov', label: 'November' },
  { val: 'Des', label: 'Desember' },
];
const YEARS = [2024, 2025, 2026];

export default function MonthYearPicker({ selectedPeriod, onPeriodChange }: MonthYearPickerProps) {
  const parts = selectedPeriod.split(' ');
  const currentMonth = parts[0] || 'Okt';
  const currentYear = parts[1] || '2026';

  return (
    <div className="inline-flex items-center gap-1.5 p-1 bg-white rounded-xl border border-zinc-200/80 shadow-xs">
      <div className="flex items-center pl-2.5 text-zinc-400">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      <select
        value={currentMonth}
        onChange={(e) => onPeriodChange(`${e.target.value} ${currentYear}`)}
        className="px-2.5 py-1.5 bg-transparent text-xs font-semibold text-zinc-800 focus:outline-none cursor-pointer hover:text-zinc-950 transition-colors"
      >
        {MONTHS.map((m) => (
          <option key={m.val} value={m.val}>
            {m.label}
          </option>
        ))}
      </select>

      <span className="text-zinc-300 text-xs">/</span>

      <select
        value={currentYear}
        onChange={(e) => onPeriodChange(`${currentMonth} ${e.target.value}`)}
        className="px-2.5 py-1.5 bg-transparent text-xs font-semibold text-zinc-800 focus:outline-none cursor-pointer hover:text-zinc-950 transition-colors"
      >
        {YEARS.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
