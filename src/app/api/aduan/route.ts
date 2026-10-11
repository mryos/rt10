import { NextResponse } from 'next/server';
import type { AduanPayload } from '@/lib/types';

const DEFAULT_URL = 'https://script.google.com/macros/s/AKfycbw3H1EvZq5Oq97SbZKiR110py_1AqWOCHX08h4iWfeEmbQqrwZinF4ho3OYfOSLrbQUEA/exec';
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || DEFAULT_URL;

export async function POST(request: Request) {
  try {
    const body: AduanPayload = await request.json();

    // Validasi server-side
    if (!body.noRumah || !body.kategori || !body.isiAduan) {
      return NextResponse.json(
        { success: false, message: 'Semua field wajib diisi (kecuali Nama)' },
        { status: 400 }
      );
    }

    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      redirect: 'follow',
      body: JSON.stringify({
        action: 'submitAduan',
        data: body,
      }),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error submitting aduan:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengirim aduan' },
      { status: 500 }
    );
  }
}
