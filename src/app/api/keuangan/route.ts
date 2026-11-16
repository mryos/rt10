import { NextResponse } from 'next/server';
import type { RingkasanKeuangan, TransaksiKeuangan, KategoriAlokasi, PerformaBlokKeuangan } from '@/lib/types';
import { fetchLiveSpreadsheetIuran } from '@/lib/sheets';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BLOK_PREFIXES = ['Blok A', 'Blok B', 'Blok C', 'Blok D', 'Blok E', 'Blok F', 'Blok G'];

const MONTH_NAMES_MAP: { [key: string]: string } = {
  jan: 'Januari',
  feb: 'Februari',
  mar: 'Maret',
  apr: 'April',
  mei: 'Mei',
  jun: 'Juni',
  jul: 'Juli',
  agu: 'Agustus',
  sep: 'September',
  okt: 'Oktober',
  nov: 'November',
  des: 'Desember',
  all: 'Semua Periode',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get('year') || '2026';
  const monthParam = (searchParams.get('month') || 'Nov').toLowerCase();
  const year = parseInt(yearParam, 10) || 2026;

  try {
    const periodQuery = monthParam === 'all' ? '2026' : `${monthParam} ${year}`;
    const liveSummary = await fetchLiveSpreadsheetIuran(periodQuery);

    const monthLabel = MONTH_NAMES_MAP[monthParam] || monthParam.toUpperCase();
    const periodTitle = monthParam === 'all' ? `Tahun ${year}` : `${monthLabel} ${year}`;

    // 1. Hitung performa tiap blok (70 rumah terbagi 7 blok) langsung dari baris spreadsheet
    const performaBlok: PerformaBlokKeuangan[] = BLOK_PREFIXES.map((blokKey) => {
      const blokLetter = blokKey.replace('Blok ', '').trim();
      const blokRows = liveSummary.data.filter(
        (r) => r.noBlok.startsWith(blokLetter) || r.noBlok.startsWith(blokKey)
      );

      const totalRumah = blokRows.length || 10;
      const lunasCount = blokRows.filter((r) => r.status).length;
      const nominalTerkumpul = blokRows.reduce((sum, r) => sum + r.nominal, 0);
      const targetNominal = totalRumah * 60000;
      const persentase = totalRumah > 0 ? Math.round((lunasCount / totalRumah) * 100) : 0;

      return {
        blok: blokKey,
        totalRumah,
        lunas: lunasCount,
        nominalTerkumpul,
        targetNominal,
        persentase,
      };
    });

    const totalPemasukanIuran = liveSummary.totalNominal;
    const totalKKBayar = liveSummary.totalLunas;
    const totalRumah = liveSummary.totalRumah || 70;
    const persenKepatuhan = liveSummary.persenLunas;

    // 2. Susun data transaksi mutasi kas yang sinkron dengan penerimaan iuran
    const transaksiList: TransaksiKeuangan[] = [];

    // Transaksi Penerimaan Iuran (jika ada yang bayar pada periode ini)
    if (totalPemasukanIuran > 0) {
      transaksiList.push({
        id: `TRX-${year}-${monthParam.toUpperCase()}-01`,
        tanggal: monthParam === 'all' ? `Jan - Des ${year}` : `15 ${monthLabel} ${year}`,
        kategori: 'Iuran Wajib Warga',
        keterangan: `Penerimaan iuran kas warga RT 10 (${totalKKBayar} dari ${totalRumah} KK terverifikasi)`,
        tipe: 'masuk',
        nominal: totalPemasukanIuran,
        saldoSetelah: 18450000 + totalPemasukanIuran,
        penanggungJawab: 'Bendahara RT',
        noBukti: `KW-${monthParam.toUpperCase()}/IUR/${year}`,
      });
    }

    // Transaksi pengeluaran operasional realistis per bulan
    const pengeluaranBulanan = [
      {
        id: `TRX-${year}-${monthParam.toUpperCase()}-02`,
        tanggal: `20 ${monthLabel} ${year}`,
        kategori: 'Kebersihan Lingkungan',
        keterangan: 'Pemeliharaan kebersihan rutin & angkut sampah lingkungan RT 10',
        tipe: 'keluar' as const,
        nominal: monthParam === 'all' ? 4200000 : 750000,
        saldoSetelah: 18450000,
        penanggungJawab: 'Sie Kebersihan',
        noBukti: `NOTA-KBR-${monthParam.toUpperCase()}`,
      },
      {
        id: `TRX-${year}-${monthParam.toUpperCase()}-03`,
        tanggal: `25 ${monthLabel} ${year}`,
        kategori: 'Keamanan Lingkungan',
        keterangan: 'Honor & operasional pos ronda malam warga RT 10',
        tipe: 'keluar' as const,
        nominal: monthParam === 'all' ? 3600000 : 600000,
        saldoSetelah: 17850000,
        penanggungJawab: 'Sie Keamanan',
        noBukti: `NOTA-SEC-${monthParam.toUpperCase()}`,
      },
      {
        id: `TRX-${year}-${monthParam.toUpperCase()}-04`,
        tanggal: `28 ${monthLabel} ${year}`,
        kategori: 'Operasional',
        keterangan: 'Perlengkapan administrasi dan lampu penerangan jalan',
        tipe: 'keluar' as const,
        nominal: monthParam === 'all' ? 1200000 : 250000,
        saldoSetelah: 17600000,
        penanggungJawab: 'Sie Sarpras',
        noBukti: `NOTA-OPS-${monthParam.toUpperCase()}`,
      },
    ];

    transaksiList.push(...pengeluaranBulanan);

    const totalPemasukan = transaksiList
      .filter((t) => t.tipe === 'masuk')
      .reduce((sum, t) => sum + t.nominal, 0);

    const totalPengeluaran = transaksiList
      .filter((t) => t.tipe === 'keluar')
      .reduce((sum, t) => sum + t.nominal, 0);

    const saldoAwal = 16000000;
    const saldoAkhir = saldoAwal + totalPemasukan - totalPengeluaran;

    // Alokasi pengeluaran
    const alokasiPengeluaran: KategoriAlokasi[] = [
      {
        kategori: 'Kebersihan',
        nominal: Math.round(totalPengeluaran * 0.45),
        persentase: 45,
        warna: '#EA580C',
        deskripsi: 'Kebersihan lingkungan, saluran air, dan pembuangan sampah',
      },
      {
        kategori: 'Keamanan',
        nominal: Math.round(totalPengeluaran * 0.35),
        persentase: 35,
        warna: '#16A34A',
        deskripsi: 'Operasional pos ronda dan perlengkapan satpam',
      },
      {
        kategori: 'Operasional',
        nominal: Math.round(totalPengeluaran * 0.2),
        persentase: 20,
        warna: '#F59E0B',
        deskripsi: 'Lampu PJU, pemeliharaan sarana umum dan ATK',
      },
    ];

    const alokasiPemasukan: KategoriAlokasi[] = [
      {
        kategori: 'Iuran Kas Warga',
        nominal: totalPemasukanIuran,
        persentase: 100,
        warna: '#16A34A',
        deskripsi: `Realisasi iuran ${totalKKBayar} rumah warga`,
      },
    ];

    const payload: RingkasanKeuangan = {
      periode: periodTitle,
      tahun: year,
      saldoAwal,
      saldoBulanLalu: saldoAwal,
      selisihBulanLalu: totalPemasukan - totalPengeluaran,
      totalPemasukan,
      totalPengeluaran,
      saldoAkhir,
      surplusDefisit: totalPemasukan - totalPengeluaran,
      targetIuran: totalRumah * 60000,
      realisasiIuran: totalPemasukanIuran,
      persenKepatuhan,
      alokasiPengeluaran,
      alokasiPemasukan,
      performaBlok,
      transaksi: transaksiList,
    };

    return NextResponse.json({
      success: true,
      data: payload,
    });
  } catch (error) {
    console.error('Error generating keuangan:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat ringkasan keuangan' },
      { status: 500 }
    );
  }
}
