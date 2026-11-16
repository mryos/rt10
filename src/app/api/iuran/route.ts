import { NextResponse } from 'next/server';
import { fetchLiveSpreadsheetIuran } from '@/lib/sheets';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '2026';

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
      source: 'live_spreadsheet',
    });
  } catch (error) {
    console.error('Error fetching iuran from spreadsheet:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data iuran dari spreadsheet' },
      { status: 500 }
    );
  }
}
