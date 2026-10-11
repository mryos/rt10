import { NextResponse } from 'next/server';

const DEFAULT_URL = 'https://script.google.com/macros/s/AKfycbzplG4lUzK7HbaVVs5w22Ch5uDIlVFS7QkTP5Q15wBN6ptZKQ2W3MUvq68Os7ZGDKPqaw/exec';
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || DEFAULT_URL;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    const action = id ? 'getBeritaById' : 'getBerita';
    const url = id
      ? `${APPS_SCRIPT_URL}?action=${action}&id=${encodeURIComponent(id)}`
      : `${APPS_SCRIPT_URL}?action=${action}`;

    const res = await fetch(url, { next: { revalidate: 60 }, redirect: 'follow' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching berita:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data berita' },
      { status: 500 }
    );
  }
}
