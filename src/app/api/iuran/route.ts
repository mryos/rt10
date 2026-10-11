import { NextResponse } from 'next/server';

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL!;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period');

  if (!period) {
    return NextResponse.json(
      { success: false, message: 'Parameter period wajib diisi' },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${APPS_SCRIPT_URL}?action=getIuran&period=${encodeURIComponent(period)}`,
      { next: { revalidate: 60 } }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching iuran:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data iuran' },
      { status: 500 }
    );
  }
}
