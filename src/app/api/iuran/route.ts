import { NextResponse } from 'next/server';

const DEFAULT_URL = 'https://script.google.com/macros/s/AKfycbw3H1EvZq5Oq97SbZKiR110py_1AqWOCHX08h4iWfeEmbQqrwZinF4ho3OYfOSLrbQUEA/exec';
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || DEFAULT_URL;

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
      { next: { revalidate: 60 }, redirect: 'follow' }
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
