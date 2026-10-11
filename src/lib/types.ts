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
  noRumah: string;
  kategori: string;
  isiAduan: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}
