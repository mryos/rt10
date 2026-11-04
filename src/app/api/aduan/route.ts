import { NextResponse } from 'next/server';
import type { AduanPayload } from '@/lib/types';

const DEFAULT_URL = 'https://script.google.com/macros/s/AKfycbw3H1EvZq5Oq97SbZKiR110py_1AqWOCHX08h4iWfeEmbQqrwZinF4ho3OYfOSLrbQUEA/exec';
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || DEFAULT_URL;

export async function POST(request: Request) {
  try {
    const body: AduanPayload = await request.json();

    // Validasi server-side: hanya kategori dan isiAduan yang wajib
    if (!body.kategori || !body.isiAduan) {
      return NextResponse.json(
        { success: false, message: 'Kategori dan rincian aduan/aspirasi wajib diisi' },
        { status: 400 }
      );
    }

    const payload: AduanPayload = {
      nama: body.nama ? body.nama.trim() || 'Anonim' : 'Anonim',
      noRumah: body.noRumah ? body.noRumah.trim() || '-' : '-',
      kategori: body.kategori,
      isiAduan: body.isiAduan,
    };

    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      redirect: 'follow',
      body: JSON.stringify({
        action: 'submitAduan',
        data: payload,
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
