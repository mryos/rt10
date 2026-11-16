export interface ResidentDues {
  noBlok: string;
  namaWarga: string;
  status: boolean;
  nominal: number;
}

export interface MonthIuranSummary {
  period: string;
  totalRumah: number;
  totalLunas: number;
  totalNominal: number;
  persenLunas: number;
  data: ResidentDues[];
}

export const SPREADSHEET_ID = '1PYmo1HrgNpETSJyOEKkvHaTL9wZXhjc_urfzm3ZDMTg';
export const SPREADSHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=0`;

// Pemetaan kolom bulan di spreadsheet (Row 2: JAN di col 2 ... DES di col 13, TOTAL di col 14)
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

/**
 * Mengambil data iuran langsung dari Google Spreadsheet live (format CSV publik)
 * Real-time, tanpa cache kadaluarsa (cache: no-store)
 */
export async function fetchLiveSpreadsheetIuran(periodQuery: string): Promise<MonthIuranSummary> {
  const res = await fetch(SPREADSHEET_CSV_URL, {
    cache: 'no-store',
    redirect: 'follow',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch spreadsheet CSV: ${res.statusText}`);
  }

  const text = await res.text();
  const rawLines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

  // Ambil baris warga (baris index 3 s/d 72, total 70 rumah dari Blok A1 s/d G9)
  const residentRows: string[][] = [];
  for (let i = 3; i < rawLines.length; i++) {
    const cols = parseCsvRow(rawLines[i]);
    const blok = cols[0];
    const nama = cols[1];
    // Lewati jika baris kosong atau baris total rekap footer
    if (!blok || !nama || blok.toLowerCase().includes('total') || blok.startsWith('Rp')) {
      continue;
    }
    residentRows.push(cols);
  }

  const queryNorm = (periodQuery || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const isAll2026 =
    queryNorm === 'all' ||
    queryNorm === '2026' ||
    queryNorm === 'semua' ||
    queryNorm === 'semuaperiode2026' ||
    queryNorm === '';

  // Tentukan kolom bulan yang dicari
  let targetCol = -1;
  if (!isAll2026) {
    for (const [key, colIdx] of Object.entries(MONTH_COL_MAP)) {
      if (queryNorm.includes(key)) {
        targetCol = colIdx;
        break;
      }
    }
  }

  const residentResults: ResidentDues[] = [];
  let totalLunas = 0;
  let totalNominal = 0;

  for (const cols of residentRows) {
    const noBlok = cols[0];
    const namaWarga = cols[1];

    let nominal = 0;
    if (isAll2026) {
      // Ambil kolom TOTAL (col 14)
      nominal = parseNominal(cols[14]);
    } else if (targetCol !== -1 && targetCol < cols.length) {
      nominal = parseNominal(cols[targetCol]);
    }

    const status = nominal > 0;
    if (status) {
      totalLunas++;
      totalNominal += nominal;
    }

    residentResults.push({
      noBlok,
      namaWarga,
      status,
      nominal,
    });
  }

  const totalRumah = residentResults.length || 70;
  const persenLunas = Math.round((totalLunas / totalRumah) * 100);

  return {
    period: periodQuery,
    totalRumah,
    totalLunas,
    totalNominal,
    persenLunas,
    data: residentResults,
  };
}
