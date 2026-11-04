// ============================================================
// GOOGLE APPS SCRIPT - Portal RT Management API & Auto Setup
// Spreadsheet ID: 1sTcyZpkS5JUirU5GDHYpee0XEh4wqXOr3mLGUWJox-E
// ============================================================

/**
 * JALANKAN FUNGSI INI: setupSheets()
 * Fungsi ini akan otomatis membuat 4 Tab:
 * 1. DB_Iuran (70 rumah, Jan 2024 - Des 2026, Checkboxes)
 * 2. DB_Aduan (Pencatatan aduan warga)
 * 3. DB_Berita (Kanal warta RT)
 * 4. DB_Keuangan (Laporan kas terbuka & mutasi buku kas)
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
    
    for (var p = 0; p < periodHeaders.length; p++) {
      if (p < 12) {
        var isLunas = ((r + p) % 7 !== 0 && (r * 3 + p) % 11 !== 0);
        row.push(isLunas);
      } else {
        row.push(false);
      }
    }
    rowsIuran.push(row);
  }

  var dataRangeIuran = sheetIuran.getRange(2, 1, rowsIuran.length, headerRowIuran.length);
  dataRangeIuran.setValues(rowsIuran);

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

  var todayStr = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd MMM yyyy');
  sheetBerita.appendRow([
    '1',
    todayStr,
    'Kerja Bakti Bersama dan Fogging Lingkungan RT',
    'Kegiatan',
    'Diberitahukan kepada seluruh warga RT bahwa pada hari Minggu mendatang akan diadakan kerja bakti dan fogging serentak mulai pukul 07.00 WIB. Dimohon partisipasi seluruh warga.',
    'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&auto=format&fit=crop&q=80'
  ]);

  // ------------------------------------------------------------
  // 4. SETUP DB_Keuangan (Buku Kas & Mutasi Terbuka)
  // ------------------------------------------------------------
  setupDBKeuanganInternal(ss);

  // Hapus sheet default 'Sheet1' jika ada
  var sheet1 = ss.getSheetByName('Sheet1') || ss.getSheetByName('Sheet 1');
  if (sheet1 && ss.getSheets().length > 1) {
    try { ss.deleteSheet(sheet1); } catch (e) {}
  }

  SpreadsheetApp.getUi().alert('✅ Berhasil! Semua sheet (DB_Iuran, DB_Aduan, DB_Berita, DB_Keuangan) telah siap dibuat dengan data terisi.');
}

/**
 * Fungsi khusus membuat atau mereset Tab DB_Keuangan saja
 */
function setupDBKeuangan() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  setupDBKeuanganInternal(ss);
  SpreadsheetApp.getUi().alert('✅ Tab DB_Keuangan berhasil dibuat/diperbarui dengan data mutasi kas terbaru.');
}

function setupDBKeuanganInternal(ss) {
  var sheet = ss.getSheetByName('DB_Keuangan');
  if (!sheet) {
    sheet = ss.insertSheet('DB_Keuangan');
  } else {
    sheet.clear();
  }

  var headers = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Keterangan', 'Nominal', 'SaldoSetelah', 'PenanggungJawab', 'NoBukti'];
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length)
       .setBackground('#0F172A')
       .setFontColor('#FFFFFF')
       .setFontWeight('bold');
  sheet.setFrozenRows(1);

  var sampleData = [
    ['TRX-001', '05/01/2024', 'masuk', 'Iuran Wajib Warga', 'Penerimaan iuran kas bulanan warga (58 rumah lunas)', 2900000, 18400000, 'Bendahara RT', 'KW-01/IUR/2024'],
    ['TRX-002', '08/01/2024', 'keluar', 'Keamanan Lingkungan', 'Honor dan konsumsi pos satpam malam 2 personel', 1600000, 16800000, 'Sie Keamanan', 'NOTA-01/SEC'],
    ['TRX-003', '15/01/2024', 'keluar', 'Kebersihan Lingkungan', 'Biaya pemeliharaan kebersihan lingkungan warga', 950000, 15850000, 'Sie Kebersihan', 'KWT-DPS-01'],
    ['TRX-004', '22/01/2024', 'keluar', 'Fasilitas & Lampu Jalan', 'Penggantian 4 unit bohlam LED PJU gang Blok C dan F', 260000, 15590000, 'Sie Sarpras', 'STR-TOKO-LISTRIK'],
    ['TRX-005', '05/02/2024', 'masuk', 'Iuran Wajib Warga', 'Penerimaan iuran kas bulanan warga (61 rumah lunas)', 3050000, 18640000, 'Bendahara RT', 'KW-02/IUR/2024'],
    ['TRX-006', '10/02/2024', 'masuk', 'Donasi & Sumbangan', 'Sumbangan sukarela renovasi kanopi Pos Ronda', 1250000, 19890000, 'Ketua RT', 'DON-02/E-KNP'],
    ['TRX-007', '12/02/2024', 'keluar', 'Keamanan Lingkungan', 'Honor bulanan petugas satpam lingkungan & senter', 1650000, 18240000, 'Sie Keamanan', 'NOTA-02/SEC'],
    ['TRX-008', '05/03/2024', 'masuk', 'Iuran Wajib Warga', 'Penerimaan iuran kas bulanan warga (59 rumah lunas)', 2950000, 21190000, 'Bendahara RT', 'KW-03/IUR/2024'],
    ['TRX-009', '15/03/2024', 'keluar', 'Kebersihan Lingkungan', 'Honor petugas kebersihan bulanan dan pembersihan parit', 950000, 20240000, 'Sie Kebersihan', 'KWT-DPS-03'],
    ['TRX-010', '10/04/2024', 'keluar', 'Kegiatan Warga', 'Perlengkapan dan konsumsi Halal Bihalal Idul Fitri', 1350000, 18890000, 'Panitia HB', 'NOTA-HB-1445']
  ];

  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
}

/**
 * Isi Dummy Iuran 2024
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

  var totalRows = data.length - 1;
  for (var r = 0; r < totalRows; r++) {
    for (var i = 0; i < colIndices.length; i++) {
      var colIdx = colIndices[i];
      var isLunas = ((r + i) % 7 !== 0 && (r * 3 + i) % 11 !== 0);
      sheet.getRange(r + 2, colIdx + 1).setValue(isLunas);
    }
  }

  SpreadsheetApp.getUi().alert('✅ Selesai! Data dummy iuran tahun 2024 (Jan - Des) berhasil diisi untuk ' + totalRows + ' rumah.');
}

// ============================================================
// WEB APP API (doGet & doPost)
// ============================================================

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
      case 'getKeuangan':
        return respond(getKeuanganData(e.parameter.year, e.parameter.month));
      case 'debugHeaders':
        var ssDbg = SpreadsheetApp.getActiveSpreadsheet();
        var shDbg = ssDbg.getSheetByName('DB_Iuran');
        return respond({
          success: true,
          sheets: ssDbg.getSheets().map(function(s) { return s.getName(); }),
          headers: shDbg ? shDbg.getDataRange().getValues()[0].map(function(h) {
            return h instanceof Date ? Utilities.formatDate(h, 'Asia/Jakarta', 'yyyy-MM-dd') : h.toString();
          }) : null
        });
      default:
        return respond({ success: false, message: 'Aksi tidak valid' });
    }
  } catch (err) {
    return respond({ success: false, message: err.toString() });
  }
}

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
  var targetPeriod = period.toString().trim().toLowerCase().replace(/\s+/g, '');

  for (var c = 0; c < headers.length; c++) {
    var hVal = headers[c];
    var hStr = '';
    if (hVal instanceof Date) {
      hStr = Utilities.formatDate(hVal, 'Asia/Jakarta', 'MMM yyyy').toLowerCase().replace(/\s+/g, '');
    } else {
      hStr = hVal.toString().trim().toLowerCase().replace(/\s+/g, '');
    }

    if (hStr === targetPeriod) {
      colIndex = c;
      break;
    }
  }

  if (colIndex === -1) {
    for (var c2 = 0; c2 < headers.length; c2++) {
      var hVal2 = headers[c2];
      var hStr2 = (hVal2 instanceof Date 
        ? Utilities.formatDate(hVal2, 'Asia/Jakarta', 'MMM yyyy') 
        : hVal2.toString()).trim().toLowerCase().replace(/\s+/g, '');
      if (hStr2.indexOf(targetPeriod) !== -1 || targetPeriod.indexOf(hStr2) !== -1) {
        colIndex = c2;
        break;
      }
    }
  }

  if (colIndex === -1) {
    var availableHeaders = [];
    for (var k = 0; k < Math.min(headers.length, 15); k++) {
      var val = headers[k];
      availableHeaders.push(val instanceof Date ? Utilities.formatDate(val, 'Asia/Jakarta', 'dd/MM/yyyy') : val.toString());
    }
    return { 
      success: false, 
      message: 'Periode tidak ditemukan: ' + period,
      availableHeadersPreview: availableHeaders
    };
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
// KEUANGAN DATA
// ============================================================
function getKeuanganData(year, month) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('DB_Keuangan');
  if (!sheet) {
    return { success: false, message: 'Sheet DB_Keuangan belum ada. Menggunakan mode kalkulasi otomatis.' };
  }

  var data = sheet.getDataRange().getValues();
  var result = [];

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === '' || data[i][0] === null) continue;
    result.push({
      id: data[i][0].toString(),
      tanggal: data[i][1] instanceof Date ? Utilities.formatDate(data[i][1], 'Asia/Jakarta', 'dd MMM yyyy') : data[i][1].toString(),
      tipe: data[i][2].toString(),
      kategori: data[i][3].toString(),
      keterangan: data[i][4].toString(),
      nominal: Number(data[i][5]) || 0,
      saldoSetelah: Number(data[i][6]) || 0,
      penanggungJawab: (data[i][7] || '').toString(),
      noBukti: (data[i][8] || '').toString()
    });
  }

  return { success: true, data: result };
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
  if (!aduanData.kategori || !aduanData.isiAduan) {
    return { success: false, message: 'Data aduan tidak lengkap (kategori dan isi aduan wajib diisi)' };
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('DB_Aduan');
  if (!sheet) {
    return { success: false, message: 'Sheet DB_Aduan belum dibuat.' };
  }

  var timestamp = Utilities.formatDate(
    new Date(), 'Asia/Jakarta', 'dd/MM/yyyy HH:mm:ss'
  );

  var noRumahVal = (aduanData.noRumah && aduanData.noRumah.trim() !== '') ? aduanData.noRumah : '-';
  var namaVal = (aduanData.nama && aduanData.nama.trim() !== '') ? aduanData.nama : 'Anonim';

  sheet.appendRow([
    timestamp,
    namaVal,
    noRumahVal,
    aduanData.kategori,
    aduanData.isiAduan,
    'Menunggu Tindakan'
  ]);

  return { success: true, message: 'Aduan berhasil dikirim!' };
}
