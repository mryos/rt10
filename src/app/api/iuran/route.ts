import { NextResponse } from 'next/server';
import { fetchLiveSpreadsheetIuran } from '@/lib/sheets';

const DEFAULT_URL = 'https://script.google.com/macros/s/AKfycbw3H1EvZq5Oq97SbZKiR110py_1AqWOCHX08h4iWfeEmbQqrwZinF4ho3OYfOSLrbQUEA/exec';
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || DEFAULT_URL;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '2026';

  // 1. Coba ambil dari Apps Script Web App
  try {
    const res = await fetch(
      `${APPS_SCRIPT_URL}?action=getIuran&period=${encodeURIComponent(period)}`,
      { next: { revalidate: 30 }, redirect: 'follow' }
    );
    const data = await res.json();
    if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
      return NextResponse.json(data);
    }
  } catch {
    // Lanjut ke fallback Google Sheet langsung
  }

  // 2. Fallback sinkronisasi langsung ke Google Spreadsheet via CSV publik (selalu update & real-time)
  try {
    const liveSummary = await fetchLiveSpreadsheetIuran(period);
    return NextResponse.json({
      success: true,
      period: liveSummary.period,
      totalRumah: liveSummary.totalRumah,
      totalLunas: liveSummary.totalLunas,
      totalNominal: liveSummary.totalNominal,
      persenLunas: liveSummary.persenLunas,
      data: liveSummary.data,
      source: 'live_spreadsheet_sync',
    });
  } catch (error) {
    console.error('Error fetching iuran from spreadsheet:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data iuran dari spreadsheet' },
      { status: 500 }
    );
  }
}
