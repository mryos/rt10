// ============================================================
// GOOGLE APPS SCRIPT - Portal RT Management API
// Deploy sebagai Web App: Execute as Me, Anyone can access
// ============================================================

/**
 * Handler GET requests
 * @param {Object} e - Event parameter dengan query string
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
 * @param {Object} e - Event parameter dengan postData
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

/**
 * Helper: Kirim JSON response
 */
function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// IURAN
// ============================================================

/**
 * Ambil data iuran berdasarkan periode (misal: "Okt 2026")
 * Header kolom di sheet: [No. Blok, Nama Warga, Jan 2024, Feb 2024, ..., Des 2026]
 */
function getIuranData(period) {
  if (!period) {
    return { success: false, message: 'Parameter period wajib diisi' };
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('DB_Iuran');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];

  // Cari index kolom yang sesuai dengan periode
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
// BERITA
// ============================================================

/**
 * Ambil semua data berita, urutkan dari terbaru
 */
function getBeritaData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('DB_Berita');
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

  // Urutkan dari ID terbesar (terbaru) ke terkecil
  result.sort(function(a, b) { return parseInt(b.id) - parseInt(a.id); });

  return { success: true, data: result };
}

/**
 * Ambil detail satu berita berdasarkan ID
 */
function getBeritaById(id) {
  if (!id) {
    return { success: false, message: 'Parameter id wajib diisi' };
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('DB_Berita');
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
// ADUAN
// ============================================================

/**
 * Simpan aduan baru ke sheet DB_Aduan
 */
function submitAduan(aduanData) {
  if (!aduanData.noRumah || !aduanData.kategori || !aduanData.isiAduan) {
    return { success: false, message: 'Data aduan tidak lengkap' };
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('DB_Aduan');

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
