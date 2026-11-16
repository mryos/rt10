// ============================================================
// GOOGLE APPS SCRIPT - Portal RT Management API & Auto Setup
// Spreadsheet ID: 1PYmo1HrgNpETSJyOEKkvHaTL9wZXhjc_urfzm3ZDMTg
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
}

// ============================================================
// WEB APP API (doGet & doPost)
// ============================================================

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';

    switch (action) {
      case 'getIuran':
        return respond(getIuranData(e.parameter.period));
      case 'getIuran2026':
        return respond(getIuran2026Data());
      case 'getBerita':
        return respond(getBeritaData());
      case 'getBeritaById':
        return respond(getBeritaById(e.parameter.id));
      case 'getKeuangan':
        return respond(getKeuanganData(e.parameter.year, e.parameter.month));
      case 'debugHeaders':
        var ssDbg = SpreadsheetApp.getActiveSpreadsheet();
        var shDbg = ssDbg.getSheetByName('DB_Iuran');
        var shKeu = ssDbg.getSheetByName('DB_Keuangan');
        return respond({
          success: true,
          sheets: ssDbg.getSheets().map(function(s) { return s.getName(); }),
          iuranHeaders: shDbg ? shDbg.getDataRange().getValues()[0].map(function(h) {
            return formatHeader(h);
          }) : null,
          keuanganHeaders: shKeu ? shKeu.getDataRange().getValues()[0].map(function(h) {
            return formatHeader(h);
          }) : null
        });
      default:
        return respond({ success: false, message: 'Aksi tidak valid: ' + action });
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
// PARSER & NORMALISASI IURAN (DUES) - MENDUKUNG ANGKA & CHECKBOX
// ============================================================

/**
 * Parsing sel iuran: mendukung angka biasa (e.g. 50000, 1), 
 * teks nominal (e.g. "Rp 50.000"), maupun boolean checkbox (TRUE/FALSE)
 */
function parseDuesValue(val) {
  if (val === true || val === 'TRUE' || val === 'true') {
    return { status: true, nominal: 50000 };
  }
  if (typeof val === 'number' && !isNaN(val)) {
    if (val > 0) {
      var nom = (val === 1) ? 50000 : val;
      return { status: true, nominal: nom };
    }
    return { status: false, nominal: 0 };
  }
  if (typeof val === 'string') {
    var trimmed = val.trim();
    if (trimmed.toLowerCase() === 'lunas' || trimmed.toLowerCase() === 'v' || trimmed === '✓') {
      return { status: true, nominal: 50000 };
    }
    var cleaned = trimmed.replace(/[^0-9]/g, '');
    if (cleaned.length > 0) {
      var num = parseFloat(cleaned);
      if (num > 0) {
        var nomStr = (num === 1) ? 50000 : num;
        return { status: true, nominal: nomStr };
      }
    }
  }
  return { status: false, nominal: 0 };
}

/**
 * Format header: ubah Date object Google Sheet menjadi format teks baku
 */
function formatHeader(val) {
  if (val === null || val === undefined) return '';
  if (val instanceof Date) {
    var indoMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return indoMonths[val.getMonth()] + ' ' + val.getFullYear();
  }
  return val.toString().trim();
}

/**
 * Normalisasi string bulan/periode untuk pencocokan toleran
 */
function normalizeStr(s) {
  if (!s) return '';
  return s.toString().toLowerCase()
    .replace(/januari/g, 'jan')
    .replace(/februari|pebruari/g, 'feb')
    .replace(/maret/g, 'mar')
    .replace(/april/g, 'apr')
    .replace(/mei|may/g, 'mei')
    .replace(/juni|june/g, 'jun')
    .replace(/juli|july/g, 'jul')
    .replace(/agustus|august/g, 'agu')
    .replace(/september/g, 'sep')
    .replace(/oktober|october/g, 'okt')
    .replace(/november/g, 'nov')
    .replace(/desember|december/g, 'des')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Cari indeks kolom header yang sesuai dengan nama periode
 */
function findHeaderColumn(headers, targetPeriod) {
  var normTarget = normalizeStr(targetPeriod);
  if (!normTarget) return -1;

  // 1. Pencocokan persis
  for (var c = 0; c < headers.length; c++) {
    var hFormatted = formatHeader(headers[c]);
    var normH = normalizeStr(hFormatted);
    if (normH === normTarget) return c;
  }

  // 2. Pencocokan substring
  for (var c2 = 0; c2 < headers.length; c2++) {
    var hFormatted2 = formatHeader(headers[c2]);
    var normH2 = normalizeStr(hFormatted2);
    if (normH2 && (normH2.indexOf(normTarget) !== -1 || normTarget.indexOf(normH2) !== -1)) {
      return c2;
    }
  }

  // 3. Jika target memuat 2026, ambil kolom 2026 terbaru
  if (normTarget.indexOf('2026') !== -1) {
    for (var c3 = headers.length - 1; c3 >= 0; c3--) {
      var normH3 = normalizeStr(formatHeader(headers[c3]));
      if (normH3.indexOf('2026') !== -1) {
        return c3;
      }
    }
  }

  return -1;
}

// ============================================================
// STRUKTUR SPREADSHEET & EKSTRAKSI DATA IURAN FLEKSIBEL
// ============================================================

/**
 * Mengambil sheet iuran: mendukung nama 'RT10 : 2026', 'DB_Iuran', atau tab pertama
 */
function getSheetIuran(ss) {
  return ss.getSheetByName('RT10 : 2026') || 
         ss.getSheetByName('DB_Iuran') || 
         ss.getSheetByName('2026') || 
         ss.getSheets()[0];
}

/**
 * Ekstraksi baris header dan baris warga secara toleran
 * Mendukung format 1-baris header maupun 2-baris header (seperti sheet RT10 : 2026)
 */
function extractIuranStructure(data) {
  if (!data || data.length === 0) return null;

  var headerRowIdx = 0;

  // Cek apakah baris 1 (index 1) adalah baris nama bulan (JAN, FEB, MAR, dst.)
  if (data.length > 1) {
    var row1Str = data[1].join(' ').toLowerCase();
    if (row1Str.indexOf('jan') !== -1 || row1Str.indexOf('feb') !== -1 || row1Str.indexOf('mar') !== -1) {
      headerRowIdx = 1;
    }
  }

  // Gabungkan header dari baris 0 dan baris header bulan
  var headers = [];
  for (var c = 0; c < data[0].length; c++) {
    var val1 = data[headerRowIdx] ? formatHeader(data[headerRowIdx][c]) : '';
    var val0 = formatHeader(data[0][c]);
    var finalHeader = val1 !== '' ? val1 : val0;
    headers.push(finalHeader);
  }

  // Temukan baris awal data warga (melewati header dan baris kosong)
  var startRow = headerRowIdx + 1;
  while (startRow < data.length) {
    var rBlok = (data[startRow][0] || '').toString().trim();
    var rNama = (data[startRow][1] || '').toString().trim();
    if (rBlok !== '' && rNama !== '') {
      break;
    }
    startRow++;
  }

  // Kumpulkan baris-baris warga (abaikan baris kosong dan footer total)
  var rows = [];
  for (var r = startRow; r < data.length; r++) {
    var blok = (data[r][0] || '').toString().trim();
    var nama = (data[r][1] || '').toString().trim();
    if (!blok || !nama || blok.toLowerCase().includes('total') || blok.startsWith('Rp')) {
      continue;
    }
    rows.push({
      rowIndex: r,
      blok: blok,
      nama: nama,
      rowData: data[r]
    });
  }

  return {
    headers: headers,
    rows: rows,
    headerRowIdx: headerRowIdx
  };
}

// ============================================================
// IURAN DATA BULANAN (Mendukung Input Angka & Checkbox)
// ============================================================
function getIuranData(period) {
  if (!period || period === '2026' || period === 'all' || period.toString().trim() === '') {
    return getIuran2026Data();
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetIuran(ss);
  if (!sheet) {
    return { success: false, message: 'Sheet iuran tidak ditemukan.' };
  }

  var data = sheet.getDataRange().getValues();
  var parsedStruct = extractIuranStructure(data);
  if (!parsedStruct) {
    return { success: false, message: 'Sheet iuran kosong atau format tidak sesuai.' };
  }

  var headers = parsedStruct.headers;
  var colIndex = findHeaderColumn(headers, period);

  if (colIndex === -1) {
    return {
      success: false,
      message: 'Periode tidak ditemukan: ' + period,
      availableHeaders: headers
    };
  }

  var result = [];
  var lunasCount = 0;
  var sumNominal = 0;

  for (var i = 0; i < parsedStruct.rows.length; i++) {
    var item = parsedStruct.rows[i];
    var cellVal = item.rowData[colIndex];
    var parsed = parseDuesValue(cellVal);

    if (parsed.status) {
      lunasCount++;
      sumNominal += parsed.nominal;
    }

    result.push({
      noBlok: item.blok,
      namaWarga: item.nama,
      status: parsed.status,
      nominal: parsed.nominal
    });
  }

  var totalRumah = result.length;
  var persenLunas = totalRumah > 0 ? Math.round((lunasCount / totalRumah) * 100) : 0;

  return {
    success: true,
    period: period,
    matchedHeader: headers[colIndex],
    totalRumah: totalRumah,
    totalLunas: lunasCount,
    totalNominal: sumNominal,
    persenLunas: persenLunas,
    data: result,
    availableHeaders: headers
  };
}

// ============================================================
// IURAN DATA TAHUN 2026 (Ringkasan Menyeluruh 2026)
// ============================================================
function getIuran2026Data() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetIuran(ss);
  if (!sheet) {
    return { success: false, message: 'Sheet iuran tidak ditemukan.' };
  }

  var data = sheet.getDataRange().getValues();
  var parsedStruct = extractIuranStructure(data);
  if (!parsedStruct) {
    return { success: false, message: 'Sheet iuran kosong.' };
  }

  var headers = parsedStruct.headers;
  var cols2026 = [];

  // Cari kolom-kolom bulan (JAN s/d DES)
  for (var c = 0; c < headers.length; c++) {
    var hFormatted = headers[c];
    var normH = normalizeStr(hFormatted);
    // Jika kolom memuat nama bulan atau 2026
    if (
      normH.indexOf('jan') !== -1 || normH.indexOf('feb') !== -1 ||
      normH.indexOf('mar') !== -1 || normH.indexOf('apr') !== -1 ||
      normH.indexOf('mei') !== -1 || normH.indexOf('jun') !== -1 ||
      normH.indexOf('jul') !== -1 || normH.indexOf('agu') !== -1 ||
      normH.indexOf('sep') !== -1 || normH.indexOf('okt') !== -1 ||
      normH.indexOf('nov') !== -1 || normH.indexOf('des') !== -1 ||
      normH.indexOf('2026') !== -1
    ) {
      if (normH.indexOf('total') === -1 && normH.indexOf('iuran2026') === -1) {
        cols2026.push({ colIndex: c, header: hFormatted, norm: normH });
      }
    }
  }

  // Jika tidak terdeteksi nama bulan, ambil kolom di antara Nama dan Total
  if (cols2026.length === 0) {
    for (var c2 = 2; c2 < Math.min(headers.length, 14); c2++) {
      cols2026.push({ colIndex: c2, header: headers[c2], norm: normalizeStr(headers[c2]) });
    }
  }

  // Cek apakah ada kolom TOTAL tahunan
  var totalColIdx = -1;
  for (var ct = 0; ct < headers.length; ct++) {
    if (normalizeStr(headers[ct]) === 'total') {
      totalColIdx = ct;
      break;
    }
  }

  var result = [];
  var totalNominal2026 = 0;
  var totalLunasCount = 0;

  for (var i = 0; i < parsedStruct.rows.length; i++) {
    var rItem = parsedStruct.rows[i];
    var noBlok = rItem.blok;
    var namaWarga = rItem.nama;

    var houseNominal = 0;
    var houseBulanLunas = 0;
    var monthlyStatus = {};

    for (var k = 0; k < cols2026.length; k++) {
      var colIdx = cols2026[k].colIndex;
      var hName = cols2026[k].header;
      var cellVal = rItem.rowData[colIdx];
      var parsed = parseDuesValue(cellVal);

      if (parsed.status) {
        houseBulanLunas++;
        houseNominal += parsed.nominal;
      }
      monthlyStatus[hName] = parsed;
    }

    // Jika kolom TOTAL tersedia di spreadsheet, utamakan nilai total dari sheet
    if (totalColIdx !== -1) {
      var parsedTotal = parseDuesValue(rItem.rowData[totalColIdx]);
      if (parsedTotal.nominal > 0) {
        houseNominal = parsedTotal.nominal;
      }
    }

    if (houseBulanLunas > 0 || houseNominal > 0) {
      totalLunasCount++;
    }
    totalNominal2026 += houseNominal;

    result.push({
      noBlok: noBlok,
      namaWarga: namaWarga,
      status: (houseBulanLunas > 0 || houseNominal > 0),
      totalNominal: houseNominal,
      bulanLunasCount: houseBulanLunas,
      totalBulan: cols2026.length,
      monthlyStatus: monthlyStatus
    });
  }

  var totalRumah = result.length;
  var persenKepatuhan = totalRumah > 0 ? Math.round((totalLunasCount / totalRumah) * 100) : 0;

  return {
    success: true,
    year: 2026,
    columns2026: cols2026.map(function(col) { return col.header; }),
    totalRumah: totalRumah,
    totalRumahSudahBayar: totalLunasCount,
    totalNominalTerkumpul: totalNominal2026,
    persenKepatuhan: persenKepatuhan,
    data: result,
    availableHeaders: headers
  };
}

// ============================================================
// KEUANGAN DATA (Mendukung Pembacaan dari RT10 : 2026 atau DB_Keuangan)
// ============================================================
function getKeuanganData(year, month) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetKeu = ss.getSheetByName('DB_Keuangan');

  // Jika ada sheet terpisah DB_Keuangan
  if (sheetKeu) {
    var data = sheetKeu.getDataRange().getValues();
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

  // Jika di sheet utama RT10 : 2026 terdapat baris pengeluaran kas
  var sheetMain = getSheetIuran(ss);
  if (sheetMain) {
    var rawData = sheetMain.getDataRange().getValues();
    var foundPemasukan = false;
    var expenseTx = [];
    var monthNorm = (month || '').toString().toLowerCase().trim();

    for (var r = 0; r < rawData.length; r++) {
      var col0 = (rawData[r][0] || '').toString();
      var col1 = (rawData[r][1] || '').toString();

      if (col0.toLowerCase().includes('total pemasukan') || col0.toLowerCase().includes('total pemasukkan')) {
        foundPemasukan = true;
        continue;
      }

      if (foundPemasukan) {
        var label = col1 || col0;
        if (label && !label.toLowerCase().includes('total pemasukan')) {
          var itemLabel = (col0.toLowerCase().includes('pengeluaran') || col0.toLowerCase().includes('pemgeluaran')) ? (col1 || 'Pengeluaran Kas') : label;
          
          // Cari kolom bulan
          var monthCols = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des'];
          var colIdx = -1;
          for (var m = 0; m < monthCols.length; m++) {
            if (monthNorm.indexOf(monthCols[m]) !== -1) {
              colIdx = m + 2;
              break;
            }
          }

          var nom = 0;
          if (colIdx !== -1 && colIdx < rawData[r].length) {
            nom = parseDuesValue(rawData[r][colIdx]).nominal;
          } else {
            // Ambil total tahunan (col 14)
            nom = parseDuesValue(rawData[r][14]).nominal;
          }

          if (nom > 0) {
            expenseTx.push({
              id: 'TRX-EXP-' + r,
              tanggal: '2026',
              tipe: 'keluar',
              kategori: itemLabel.toLowerCase().includes('keamanan') ? 'Keamanan' : 'Operasional',
              keterangan: 'Pembayaran ' + itemLabel + ' RT 10',
              nominal: nom,
              saldoSetelah: 0,
              penanggungJawab: 'Bendahara / Pengurus RT',
              noBukti: 'NOTA-' + r
            });
          }
        }
      }
    }

    return { success: true, data: expenseTx };
  }

  return { success: false, message: 'Data keuangan tidak ditemukan' };
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
