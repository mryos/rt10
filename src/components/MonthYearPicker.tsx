'use client';

interface MonthYearPickerProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];
const YEARS = [2024, 2025, 2026];

export default function MonthYearPicker({ selectedPeriod, onPeriodChange }: MonthYearPickerProps) {
  const parts = selectedPeriod.split(' ');
  const currentMonth = parts[0];
  const currentYear = parts[1];

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <select
        value={currentMonth}
        onChange={(e) => onPeriodChange(`${e.target.value} ${currentYear}`)}
        className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
      >
        {MONTHS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <select
        value={currentYear}
        onChange={(e) => onPeriodChange(`${currentMonth} ${e.target.value}`)}
        className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
