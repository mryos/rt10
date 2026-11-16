export interface ResidentDues {
  noBlok: string;
  namaWarga: string;
  status: boolean;
  nominal: number;
}

export interface ExpenseItem {
  nama: string;
  kategori: string;
  nominal: number;
}

export interface SheetFinancialSummary {
  period: string;
  totalRumah: number;
  totalLunas: number;
  totalPemasukan: number;
  totalNominal: number; // alias untuk totalPemasukan
  persenLunas: number;
  totalPengeluaran: number;
  pengeluaranItems: ExpenseItem[];
  data: ResidentDues[];
}

export const SPREADSHEET_ID = '1PYmo1HrgNpETSJyOEKkvHaTL9wZXhjc_urfzm3ZDMTg';
export const SPREADSHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=0`;

// Pemetaan kolom bulan di spreadsheet (JAN di col 2 ... DES di col 13, TOTAL di col 14)
const MONTH_COL_MAP: { [key: string]: number } = {
  jan: 2,
  januari: 2,
  feb: 3,
  februari: 3,
  pebruari: 3,
  mar: 4,
  maret: 4,
  apr: 5,
  april: 5,
  mei: 6,
  may: 6,
  jun: 7,
  juni: 7,
  jul: 8,
  juli: 8,
  agu: 9,
  agus: 9,
  agustus: 9,
  sep: 10,
  sept: 10,
  september: 10,
  okt: 11,
  oktober: 11,
  nov: 12,
  november: 12,
  des: 13,
  desember: 13,
};

function parseCsvRow(rowStr: string): string[] {
  const result: string[] = [];
  let inQuotes = false;
  let curVal = '';
  for (let i = 0; i < rowStr.length; i++) {
    const char = rowStr[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(curVal.trim());
      curVal = '';
    } else {
      curVal += char;
    }
  }
  result.push(curVal.trim());
  return result;
}

function parseNominal(str: string): number {
  if (!str) return 0;
  let clean = str.replace(/[Rp"\s]/gi, '');
  if (clean.includes(',') && clean.includes('.')) {
    clean = clean.replace(/,/g, '');
  } else if (clean.includes(',')) {
    if (/,\d{3}/.test(clean)) {
      clean = clean.replace(/,/g, '');
    } else {
      clean = clean.replace(/,/g, '.');
    }
  }
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

function mapExpenseCategory(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('keamanan') || lower.includes('satpam') || lower.includes('ronda')) {
    return 'Keamanan';
  }
  if (lower.includes('kebersihan') || lower.includes('sampah')) {
    return 'Kebersihan';
  }
  if (lower.includes('listrik') || lower.includes('lampu') || lower.includes('pju')) {
    return 'Sarpras';
  }
  if (lower.includes('sosial') || lower.includes('santunan') || lower.includes('duka')) {
    return 'Sosial';
  }
  return 'Operasional';
}

/**
 * Mengambil data keuangan (Pemasukan Iuran Warga & Pengeluaran Kas)
 * langsung dari Google Spreadsheet live secara real-time.
 */
export async function fetchLiveSpreadsheetIuran(periodQuery: string): Promise<SheetFinancialSummary> {
  const res = await fetch(SPREADSHEET_CSV_URL, {
    cache: 'no-store',
    redirect: 'follow',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch spreadsheet CSV: ${res.statusText}`);
  }

  const text = await res.text();
  const rawLines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

  const queryNorm = (periodQuery || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const isAll2026 =
    queryNorm === 'all' ||
    queryNorm === '2026' ||
    queryNorm === 'semua' ||
    queryNorm === 'semuaperiode2026' ||
    queryNorm === '';

  // Tentukan indeks kolom bulan yang dicari
  let targetCol = -1;
  if (!isAll2026) {
    for (const [key, colIdx] of Object.entries(MONTH_COL_MAP)) {
      if (queryNorm.includes(key)) {
        targetCol = colIdx;
        break;
      }
    }
  }

  // 1. Ekstraksi Baris Iuran Warga (Baris 3 s/d sebelum Total Pemasukan)
  const residentResults: ResidentDues[] = [];
  let foundPemasukanTotal = false;
  const rawExpenseRows: { label: string; cols: string[] }[] = [];

  for (let i = 3; i < rawLines.length; i++) {
    const cols = parseCsvRow(rawLines[i]);
    const col0 = cols[0] || '';
    const col1 = cols[1] || '';

    // Deteksi batas baris Total Pemasukan
    if (col0.toLowerCase().includes('total pemasukan') || col0.toLowerCase().includes('total pemasukkan')) {
      foundPemasukanTotal = true;
      continue;
    }

    if (!foundPemasukanTotal) {
      // Baris data 70 rumah
      if (col0 && col1 && !col0.startsWith('Rp') && !col0.toLowerCase().includes('total')) {
        let nominal = 0;
        if (isAll2026) {
          nominal = parseNominal(cols[14]);
        } else if (targetCol !== -1 && targetCol < cols.length) {
          nominal = parseNominal(cols[targetCol]);
        }

        const status = nominal > 0;
        residentResults.push({
          noBlok: col0,
          namaWarga: col1,
          status,
          nominal,
        });
      }
    } else {
      // 2. Ekstraksi Baris Pengeluaran (setelah baris Total Pemasukan)
      const label = col1 || col0;
      if (label && !label.toLowerCase().includes('total pemasukan')) {
        const cleanLabel = col0.toLowerCase().includes('pengeluaran') || col0.toLowerCase().includes('pemgeluaran')
          ? (col1 || 'Pengeluaran Umum')
          : label;
        rawExpenseRows.push({ label: cleanLabel, cols });
      }
    }
  }

  // Hitung total pemasukan iuran
  let totalLunas = 0;
  let totalPemasukan = 0;
  for (const r of residentResults) {
    if (r.status) {
      totalLunas++;
      totalPemasukan += r.nominal;
    }
  }

  // Hitung total pengeluaran untuk periode yang dipilih
  const pengeluaranItems: ExpenseItem[] = [];
  let totalPengeluaran = 0;

  for (const exp of rawExpenseRows) {
    let nominal = 0;
    if (isAll2026) {
      // Ambil kolom TOTAL (col 14), jika 0 jumlahkan col 2 s/d 13
      nominal = parseNominal(exp.cols[14]);
      if (nominal === 0) {
        for (let c = 2; c <= 13; c++) {
          nominal += parseNominal(exp.cols[c]);
        }
      }
    } else if (targetCol !== -1 && targetCol < exp.cols.length) {
      nominal = parseNominal(exp.cols[targetCol]);
    }

    if (nominal > 0) {
      totalPengeluaran += nominal;
      pengeluaranItems.push({
        nama: exp.label,
        kategori: mapExpenseCategory(exp.label),
        nominal,
      });
    }
  }

  const totalRumah = residentResults.length || 70;
  const persenLunas = Math.round((totalLunas / totalRumah) * 100);

  return {
    period: periodQuery,
    totalRumah,
    totalLunas,
    totalPemasukan,
    totalNominal: totalPemasukan,
    persenLunas,
    totalPengeluaran,
    pengeluaranItems,
    data: residentResults,
  };
}
