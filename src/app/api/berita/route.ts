import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

  // Jika tidak ada URL Apps Script khusus berita, kembalikan array kosong (karena spreadsheet baru hanya berisi kas)
  if (!APPS_SCRIPT_URL) {
    return NextResponse.json({
      success: true,
      data: [],
    });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    const action = id ? 'getBeritaById' : 'getBerita';
    const url = id
      ? `${APPS_SCRIPT_URL}?action=${action}&id=${encodeURIComponent(id)}`
      : `${APPS_SCRIPT_URL}?action=${action}`;

    const res = await fetch(url, { cache: 'no-store', redirect: 'follow' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching berita:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data berita', data: [] },
      { status: 500 }
    );
  }
}
