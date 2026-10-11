// ============================================================
// GOOGLE APPS SCRIPT - Portal RT Management API & Auto Setup
// Spreadsheet ID: 1sTcyZpkS5JUirU5GDHYpee0XEh4wqXOr3mLGUWJox-E
// ============================================================

/**
 * JALANKAN FUNGSI INI SEKALI SAJA: setupSheets()
 * Fungsi ini akan otomatis:
 * 1. Membuat tab DB_Iuran lengkap dengan 70 daftar blok/rumah (A3-A12, B1-B11, C1-C14, D3-D7, E1-E7, F1-F14, G1-G9),
 *    header Jan 2024 - Des 2026, dan Checkbox boolean.
 * 2. Membuat tab DB_Aduan dengan header kolom yang sesuai.
 * 3. Membuat tab DB_Berita dengan header dan data contoh awal.
 */
function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // ------------------------------------------------------------
  // 1. SETUP DB_Iuran
  // ------------------------------------------------------------
  var sheetIuran = ss.getSheetByName('DB_Iuran');
  if (!sheetIuran) {
    sheetIuran = ss.insertSheet('DB_Iuran');
  } else {
    sheetIuran.clear();
  }

  // Buat list 70 Rumah berdasarkan persebaran blok yang ditentukan
  var blokList = [];
  var i;
  for (i = 3; i <= 12; i++) blokList.push('Blok A' + i);
  for (i = 1; i <= 11; i++) blokList.push('Blok B' + i);
  for (i = 1; i <= 14; i++) blokList.push('Blok C' + i);
  for (i = 3; i <= 7; i++)  blokList.push('Blok D' + i);
  for (i = 1; i <= 7; i++)  blokList.push('Blok E' + i);
  for (i = 1; i <= 14; i++) blokList.push('Blok F' + i);
  for (i = 1; i <= 9; i++)  blokList.push('Blok G' + i);

  // Buat header bulan: Jan 2024 s/d Des 2026 (36 bulan)
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  var years = [2024, 2025, 2026];
  var periodHeaders = [];

  for (var y = 0; y < years.length; y++) {
    for (var m = 0; m < months.length; m++) {
      periodHeaders.push(months[m] + ' ' + years[y]);
    }
  }

  var headerRowIuran = ['No. Blok', 'Nama Warga'].concat(periodHeaders);
  sheetIuran.appendRow(headerRowIuran);

  // Format header Iuran
  var headerRangeIuran = sheetIuran.getRange(1, 1, 1, headerRowIuran.length);
  headerRangeIuran.setBackground('#1E40AF')
                  .setFontColor('#FFFFFF')
                  .setFontWeight('bold');
  sheetIuran.setFrozenRows(1);
  sheetIuran.setFrozenColumns(2);

  // Nama-nama warga realistis untuk 70 rumah
  var dummyNamaWarga = [
    'Budi Santoso', 'Siti Rahmawati', 'Agus Setiawan', 'Dewi Lestari', 'Eko Prasetyo',
    'Rina Wulandari', 'Hadi Purnomo', 'Sri Wahyuni', 'Bambang Irawan', 'Yuni Astuti',
    'Ahmad Fauzi', 'Tri Mulyani', 'Rudi Hartono', 'Nur Hidayah', 'Hendro Wijaya',
    'Endang Purwanti', 'Joko Susilo', 'Ratna Sari', 'Dedi Kurniawan', 'Anisa Putri',
    'Surya Pratama', 'Indah Permata', 'Wahyu Wibowo', 'Maya Anggraini', 'Teguh Saputra',
    'Dian Kusuma', 'Aris Munandar', 'Lestari Handayani', 'Fajar Nugroho', 'Retno Palupi',
    'Bayu Aji', 'Ika Novita', 'Denny Firmansyah', 'Fitri Handayani', 'Hendra Gunawan',
    'Nita Anggraeni', 'Rizky Ramadhan', 'Wulan Dari', 'Sigit Pamungkas', 'Erna Susanti',
    'Ari Wibowo', 'Tuti Alawiyah', 'Imam Syafi\'i', 'Mega Utami', 'Panji Asmoro',
    'Linda Herawati', 'Bagus Prakoso', 'Eni Sulistyo', 'Danang Joyo', 'Kartika Dewi',
    'Yudi Hermawan', 'Farida Aryani', 'Anton Nugraha', 'Ratih Puspita', 'Haris Fadillah',
    'Lia Amelia', 'Kurniawan Dwi', 'Desi Ratnasari', 'Lukman Hakim', 'Siska Maharani',
    'Faisal Tanjung', 'Citra Kirana', 'Ridwan Kamil', 'Gita Gutawa', 'Iqbal Ramadhan',
    'Tara Basro', 'Chicco Jerikho', 'Raisa Andriana', 'Afgan Syahreza', 'Isyana Sarasvati'
  ];

  // Masukkan 70 baris rumah beserta data dummy 2024
  var rowsIuran = [];
  for (var r = 0; r < blokList.length; r++) {
    var namaWarga = dummyNamaWarga[r] || ('Warga ' + blokList[r]);
    var row = [blokList[r], namaWarga];
    
    // Period headers ada 36 bulan (0-11: 2024, 12-23: 2025, 24-35: 2026)
    for (var p = 0; p < periodHeaders.length; p++) {
      if (p < 12) {
        // Tahun 2024: Sebagian besar warga lunas (sekitar 80-85% lunas untuk simulasi realistis)
        // Pola deterministik berbasis index agar ada variasi yang konsisten
        var isLunas = ((r + p) % 7 !== 0 && (r * 3 + p) % 11 !== 0);
        row.push(isLunas);
      } else {
        // Tahun 2025 & 2026 default belum lunas (false)
        row.push(false);
      }
    }
    rowsIuran.push(row);
  }

  var dataRangeIuran = sheetIuran.getRange(2, 1, rowsIuran.length, headerRowIuran.length);
  dataRangeIuran.setValues(rowsIuran);

  // Ubah cell data bulan menjadi Checkbox
  var checkboxRange = sheetIuran.getRange(2, 3, rowsIuran.length, periodHeaders.length);
  checkboxRange.insertCheckboxes();

  // ------------------------------------------------------------
  // 2. SETUP DB_Aduan
  // ------------------------------------------------------------
  var sheetAduan = ss.getSheetByName('DB_Aduan');
  if (!sheetAduan) {
    sheetAduan = ss.insertSheet('DB_Aduan');
  } else {
    sheetAduan.clear();
  }

  var headersAduan = ['Timestamp', 'Nama/Anonim', 'No. Rumah', 'Kategori', 'Isi Aduan', 'Status Tindakan'];
  sheetAduan.appendRow(headersAduan);
  sheetAduan.getRange(1, 1, 1, headersAduan.length)
            .setBackground('#B91C1C')
            .setFontColor('#FFFFFF')
            .setFontWeight('bold');
  sheetAduan.setFrozenRows(1);

  // ------------------------------------------------------------
  // 3. SETUP DB_Berita
  // ------------------------------------------------------------
  var sheetBerita = ss.getSheetByName('DB_Berita');
  if (!sheetBerita) {
    sheetBerita = ss.insertSheet('DB_Berita');
  } else {
    sheetBerita.clear();
  }

  var headersBerita = ['ID', 'Tanggal', 'Judul', 'Kategori', 'IsiKonten', 'UrlGambar'];
  sheetBerita.appendRow(headersBerita);
  sheetBerita.getRange(1, 1, 1, headersBerita.length)
             .setBackground('#047857')
             .setFontColor('#FFFFFF')
             .setFontWeight('bold');
  sheetBerita.setFrozenRows(1);

  // Tambahkan contoh berita awal
  var todayStr = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd MMM yyyy');
  sheetBerita.appendRow([
    '1',
    todayStr,
    'Kerja Bakti Bersama dan Fogging Lingkungan RT',
    'Kegiatan',
    'Diberitahukan kepada seluruh warga RT bahwa pada hari Minggu mendatang akan diadakan kerja bakti dan fogging serentak mulai pukul 07.00 WIB. Dimohon partisipasi seluruh warga.',
    'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&auto=format&fit=crop&q=80'
  ]);

  // Hapus sheet default 'Sheet1' jika ada dan tab lain sudah terbuat
  var sheet1 = ss.getSheetByName('Sheet1') || ss.getSheetByName('Sheet 1');
  if (sheet1 && ss.getSheets().length > 1) {
    try { ss.deleteSheet(sheet1); } catch (e) {}
  }

  SpreadsheetApp.getUi().alert('✅ Berhasil! Semua sheet (DB_Iuran, DB_Aduan, DB_Berita) telah siap dibuat dengan 70 rumah, nama warga, dan data dummy iuran 2024.');
}

/**
 * JALANKAN FUNGSI INI JIKA SHEET SUDAH ADA: isiDummyIuran2024()
 * Fungsi ini khusus mengisi/mengupdate data dummy iuran tahun 2024 (Jan - Des 2024)
 * tanpa menghapus struktur sheet yang sudah ada.
 */
function isiDummyIuran2024() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('DB_Iuran');
  if (!sheet) {
    SpreadsheetApp.getUi().alert('❌ Sheet DB_Iuran tidak ditemukan. Jalankan setupSheets() terlebih dahulu.');
    return;
  }

  var data = sheet.getDataRange().getValues();
  var headers = data[0];

  // Cari index kolom Jan 2024 s/d Des 2024
  var months = ['Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'Mei 2024', 'Jun 2024',
                'Jul 2024', 'Agu 2024', 'Sep 2024', 'Okt 2024', 'Nov 2024', 'Des 2024'];
  
  var colIndices = [];
  for (var m = 0; m < months.length; m++) {
    for (var c = 0; c < headers.length; c++) {
      if (headers[c].toString().trim() === months[m]) {
        colIndices.push(c);
        break;
      }
    }
  }

  if (colIndices.length === 0) {
    SpreadsheetApp.getUi().alert('❌ Kolom 2024 tidak ditemukan di header DB_Iuran.');
    return;
  }

  // Isi data dummy ke baris 2 s/d baris terakhir
  var totalRows = data.length - 1;
  for (var r = 0; r < totalRows; r++) {
    for (var i = 0; i < colIndices.length; i++) {
      var colIdx = colIndices[i];
      // Simulasi 80-85% warga lunas di 2024
      var isLunas = ((r + i) % 7 !== 0 && (r * 3 + i) % 11 !== 0);
      sheet.getRange(r + 2, colIdx + 1).setValue(isLunas);
    }
  }

  SpreadsheetApp.getUi().alert('✅ Selesai! Data dummy iuran tahun 2024 (Jan - Des) berhasil diisi untuk ' + totalRows + ' rumah.');
}

// ============================================================
// WEB APP API (doGet & doPost)
// ============================================================

/**
 * Handler GET requests
 */
function doGet(e) {
  try {
    var action = e.parameter.action;

    switch (action) {
      case 'getIuran':
        return respond(getIuranData(e.parameter.period));
      case 'getBerita':
        return respond(getBeritaData());
      case 'getBeritaById':
        return respond(getBeritaById(e.parameter.id));
      default:
        return respond({ success: false, message: 'Aksi tidak valid' });
    }
  } catch (err) {
    return respond({ success: false, message: err.toString() });
  }
}

/**
 * Handler POST requests
 */
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);

    switch (payload.action) {
      case 'submitAduan':
        return respond(submitAduan(payload.data));
      default:
        return respond({ success: false, message: 'Aksi tidak valid' });
    }
  } catch (err) {
    return respond({ success: false, message: err.toString() });
  }
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// IURAN DATA
// ============================================================
function getIuranData(period) {
  if (!period) {
    return { success: false, message: 'Parameter period wajib diisi' };
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('DB_Iuran');
  if (!sheet) {
    return { success: false, message: 'Sheet DB_Iuran belum dibuat. Jalankan fungsi setupSheets() terlebih dahulu.' };
  }

  var data = sheet.getDataRange().getValues();
  var headers = data[0];

  var colIndex = -1;
  for (var c = 0; c < headers.length; c++) {
    if (headers[c].toString().trim() === period.trim()) {
      colIndex = c;
      break;
    }
  }

  if (colIndex === -1) {
    return { success: false, message: 'Periode tidak ditemukan: ' + period };
  }

  var result = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === '' || data[i][0] === null) continue;
    result.push({
      noBlok: data[i][0].toString(),
      namaWarga: data[i][1].toString(),
      status: data[i][colIndex] === true || data[i][colIndex] === 'TRUE'
    });
  }

  return { success: true, period: period, data: result };
}

// ============================================================
// BERITA DATA
// ============================================================
function getBeritaData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('DB_Berita');
  if (!sheet) {
    return { success: false, message: 'Sheet DB_Berita belum dibuat.' };
  }

  var data = sheet.getDataRange().getValues();
  var result = [];

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === '' || data[i][0] === null) continue;
    result.push({
      id: data[i][0].toString(),
      tanggal: data[i][1] instanceof Date
        ? Utilities.formatDate(data[i][1], 'Asia/Jakarta', 'dd MMM yyyy')
        : data[i][1].toString(),
      judul: data[i][2].toString(),
      kategori: data[i][3].toString(),
      isiKonten: data[i][4].toString(),
      urlGambar: (data[i][5] || '').toString()
    });
  }

  result.sort(function(a, b) { return parseInt(b.id) - parseInt(a.id); });
  return { success: true, data: result };
}

function getBeritaById(id) {
  if (!id) {
    return { success: false, message: 'Parameter id wajib diisi' };
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('DB_Berita');
  if (!sheet) {
    return { success: false, message: 'Sheet DB_Berita belum dibuat.' };
  }

  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      return {
        success: true,
        data: {
          id: data[i][0].toString(),
          tanggal: data[i][1] instanceof Date
            ? Utilities.formatDate(data[i][1], 'Asia/Jakarta', 'dd MMM yyyy')
            : data[i][1].toString(),
          judul: data[i][2].toString(),
          kategori: data[i][3].toString(),
          isiKonten: data[i][4].toString(),
          urlGambar: (data[i][5] || '').toString()
        }
      };
    }
  }

  return { success: false, message: 'Berita tidak ditemukan' };
}

// ============================================================
// ADUAN DATA
// ============================================================
function submitAduan(aduanData) {
  if (!aduanData.noRumah || !aduanData.kategori || !aduanData.isiAduan) {
    return { success: false, message: 'Data aduan tidak lengkap' };
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('DB_Aduan');
  if (!sheet) {
    return { success: false, message: 'Sheet DB_Aduan belum dibuat.' };
  }

  var timestamp = Utilities.formatDate(
    new Date(), 'Asia/Jakarta', 'dd/MM/yyyy HH:mm:ss'
  );

  sheet.appendRow([
    timestamp,
    aduanData.nama || 'Anonim',
    aduanData.noRumah,
    aduanData.kategori,
    aduanData.isiAduan,
    'Diproses \u23F3'
  ]);

  return { success: true, message: 'Aduan berhasil dikirim!' };
}
