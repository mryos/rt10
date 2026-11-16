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

    // 1. Hitung performa tiap blok (70 rumah terbagi 7 blok)
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

    const totalPemasukanIuran = liveSummary.totalPemasukan;
    const totalPengeluaranKas = liveSummary.totalPengeluaran;
    const totalKKBayar = liveSummary.totalLunas;
    const totalRumah = liveSummary.totalRumah || 70;
    const persenKepatuhan = liveSummary.persenLunas;

    // 2. Susun data transaksi mutasi kas yang 100% sinkron dengan spreadsheet
    const transaksiList: TransaksiKeuangan[] = [];

    // Mutasi Masuk: Realisasi Iuran Warga
    if (totalPemasukanIuran > 0) {
      transaksiList.push({
        id: `TRX-${year}-${monthParam.toUpperCase()}-01`,
        tanggal: monthParam === 'all' ? `Jan - Des ${year}` : `10 ${monthLabel} ${year}`,
        kategori: 'Iuran Wajib Warga',
        keterangan: `Penerimaan iuran kas warga RT 10 (${totalKKBayar} dari ${totalRumah} KK terverifikasi)`,
        tipe: 'masuk',
        nominal: totalPemasukanIuran,
        saldoSetelah: 16000000 + totalPemasukanIuran,
        penanggungJawab: 'Bendahara RT',
        noBukti: `KW-${monthParam.toUpperCase()}/IUR/${year}`,
      });
    }

    // Mutasi Keluar: Realisasi Pengeluaran dari Spreadsheet
    let cumulativeExpense = 0;
    const activeExpenseItems = liveSummary.pengeluaranItems.filter((it) => it.nominal > 0);

    activeExpenseItems.forEach((it, idx) => {
      cumulativeExpense += it.nominal;
      transaksiList.push({
        id: `TRX-${year}-${monthParam.toUpperCase()}-EXP-${idx + 1}`,
        tanggal: monthParam === 'all' ? `Jan - Des ${year}` : `${15 + idx * 3} ${monthLabel} ${year}`,
        kategori: it.kategori,
        keterangan: `Pembayaran ${it.nama} RT 10 (${periodTitle})`,
        tipe: 'keluar',
        nominal: it.nominal,
        saldoSetelah: 16000000 + totalPemasukanIuran - cumulativeExpense,
        penanggungJawab: it.kategori === 'Keamanan' ? 'Sie Keamanan' : 'Sie Operasional',
        noBukti: `NOTA-${it.kategori.substring(0, 3).toUpperCase()}-${monthParam.toUpperCase()}`,
      });
    });

    const saldoAwal = 16000000;
    const saldoAkhir = saldoAwal + totalPemasukanIuran - totalPengeluaranKas;

    // 3. Pos Alokasi Pengeluaran (Dihitung langsung dari data spreadsheet)
    const categoryTotals: { [key: string]: number } = {};
    activeExpenseItems.forEach((it) => {
      categoryTotals[it.kategori] = (categoryTotals[it.kategori] || 0) + it.nominal;
    });

    const colorPalette = ['#16A34A', '#2563EB', '#F59E0B', '#EA580C', '#8B5CF6'];
    const alokasiPengeluaran: KategoriAlokasi[] = Object.keys(categoryTotals).map((catName, idx) => {
      const catNominal = categoryTotals[catName];
      const pct = totalPengeluaranKas > 0 ? Math.round((catNominal / totalPengeluaranKas) * 100) : 0;
      return {
        kategori: catName,
        nominal: catNominal,
        persentase: pct,
        warna: colorPalette[idx % colorPalette.length],
        deskripsi: `Realisasi belanja pos ${catName} sesuai spreadsheet`,
      };
    });

    // Fallback jika pengeluaran 0 pada bulan tertentu
    if (alokasiPengeluaran.length === 0) {
      alokasiPengeluaran.push({
        kategori: 'Keamanan',
        nominal: 0,
        persentase: 100,
        warna: '#16A34A',
        deskripsi: 'Belum ada pengeluaran kas dicatat pada periode ini',
      });
    }

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
      selisihBulanLalu: totalPemasukanIuran - totalPengeluaranKas,
      totalPemasukan: totalPemasukanIuran,
      totalPengeluaran: totalPengeluaranKas,
      saldoAkhir,
      surplusDefisit: totalPemasukanIuran - totalPengeluaranKas,
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
