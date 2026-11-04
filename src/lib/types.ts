export interface IuranRecord {
  noBlok: string;
  namaWarga: string;
  status: boolean;
}

export interface IuranResponse {
  success: boolean;
  period: string;
  data: IuranRecord[];
}

export interface Berita {
  id: string;
  tanggal: string;
  judul: string;
  kategori: 'Berita Duka' | 'Pengumuman' | 'Kegiatan';
  isiKonten: string;
  urlGambar: string;
}

export interface AduanPayload {
  nama: string;
  noRumah?: string;
  kategori: string;
  isiAduan: string;
}

export interface TransaksiKeuangan {
  id: string;
  tanggal: string;
  kategori: string;
  keterangan: string;
  tipe: 'masuk' | 'keluar';
  nominal: number;
  saldoSetelah: number;
  penanggungJawab: string;
  noBukti?: string;
}

export interface KategoriAlokasi {
  kategori: string;
  nominal: number;
  persentase: number;
  warna: string;
  deskripsi: string;
  iconName?: string;
}

export interface PerformaBlokKeuangan {
  blok: string;
  totalRumah: number;
  lunas: number;
  nominalTerkumpul: number;
  targetNominal: number;
  persentase: number;
}

export interface RiwayatSaldoBulanan {
  periode: string;
  namaBulan: string;
  label: string;
  saldoAwal: number;
  pemasukan: number;
  pengeluaran: number;
  saldoAkhir: number;
  selisih: number;
  isBerjalan?: boolean;
}

export interface RingkasanKeuangan {
  periode: string;
  tahun: number;
  saldoAwal: number;
  saldoBulanLalu: number;
  selisihBulanLalu: number;
  riwayatSaldo?: RiwayatSaldoBulanan[];
  totalPemasukan: number;
  totalPengeluaran: number;
  saldoAkhir: number;
  surplusDefisit: number;
  targetIuran: number;
  realisasiIuran: number;
  persenKepatuhan: number;
  alokasiPengeluaran: KategoriAlokasi[];
  alokasiPemasukan: KategoriAlokasi[];
  performaBlok: PerformaBlokKeuangan[];
  transaksi: TransaksiKeuangan[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}
