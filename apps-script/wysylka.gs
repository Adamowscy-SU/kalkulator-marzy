/**
 * Wysyłka raportów z Kalkulatora marży (Google Apps Script).
 *
 * Konfiguracja (jednorazowo, ok. 5 minut):
 * 1. Wejdź na https://script.google.com, kliknij „Nowy projekt”, wklej cały ten plik.
 * 2. Uzupełnij ODBIORCA (adres, na który mają przychodzić raporty).
 *    TOKEN musi być taki sam jak CONFIG.TOKEN w index.html.
 * 3. Wdróż → Nowe wdrożenie → typ „Aplikacja internetowa”.
 *    Wykonaj jako: Ja. Kto ma dostęp: Każdy.
 * 4. Zatwierdź uprawnienia (Gmail, Dysk), skopiuj adres URL aplikacji (…/exec)
 *    i wpisz go w index.html w CONFIG.SEND_URL.
 *
 * Opcjonalnie: wpisz ID arkusza Google w ARKUSZ_ID, a każdy raport
 * zostanie też dopisany jako wiersz (łatwe wyszukiwanie po VIN).
 */
var ODBIORCA = 'wpisz@adres.pl';
var TOKEN = 'wybrane-auto-2026';
var ARKUSZ_ID = '1IRIGOlww5pN75rK9WLPL7IAUX7kYfeu2ETFxNtpdrF4'; // Rejestr transakcji – SU Adamowscy

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    if (d.token !== TOKEN) return out_('brak dostępu');
    var vin = String(d.vin || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (vin.length !== 17) return out_('zły VIN');

    var html = raport_(d, vin);
    var pdf = Utilities.newBlob(html, MimeType.HTML, 'raport.html')
      .getAs(MimeType.PDF)
      .setName('Karta_transakcyjna_' + vin + '.pdf');

    var temat = 'Marża I – VIN ' + vin + (d.car ? ' – ' + d.car : '');
    GmailApp.sendEmail(ODBIORCA, temat, d.text || temat, {
      htmlBody: '<p>Raport marży w załączniku.</p><pre style="font-family:Arial,sans-serif">' + esc_(d.text || '') + '</pre>',
      attachments: [pdf],
      name: 'Kalkulator Marży SU - Adamowscy'
    });

    if (ARKUSZ_ID) zapiszWiersz_(d, vin);
    return out_('ok');
  } catch (err) {
    return out_('błąd: ' + err);
  }
}

function zapiszWiersz_(d, vin) {
  var n = d.num || {};
  var dt = function (s) { return s ? Utilities.parseDate(s, 'Europe/Warsaw', 'yyyy-MM-dd') : ''; };
  var sh = SpreadsheetApp.openById(ARKUSZ_ID).getSheetByName('Transakcje');
  sh.appendRow([
    new Date(), vin, d.car || '', d.seller || '', d.basis || '', dt(n.buyDate), dt(n.saleDate),
    d.days == null ? '' : d.days, d.saleDoc ? "'" + d.saleDoc : '',
    n.saleGross, n.saleNet, n.buy, n.pcc, n.det, n.rep, d.bank || '', n.comm, n.carMargin, n.margin, n.pct
  ]);
}

function raport_(d, vin) {
  var rows = (d.rows || []).map(function (r) {
    var style = r[2] === 'total' ? 'font-weight:bold;font-size:15px;border-top:2px solid #0f1b2d'
              : r[2] === 'b' ? 'font-weight:bold;border-top:1px solid #0f1b2d' : '';
    return '<tr style="' + style + '"><td>' + esc_(r[0]) + '</td><td style="text-align:right">' + esc_(r[1]) + '</td></tr>';
  }).join('');
  var info = [
    ['VIN', vin], ['Auto', d.car || '–'], ['Handlowiec', d.seller || '–'], ['Podstawa zakupu', d.basis],
    ['Data zakupu', d.buyDate], ['Data sprzedaży', d.saleDate], ['Nr faktury sprzedaży', d.saleDoc || '–'], ['Dni w stocku', d.days == null ? '–' : d.days],
    ['Finansowanie', d.bank || 'brak']
  ].map(function (r) { return '<tr><td style="color:#5f6b7a">' + r[0] + '</td><td>' + esc_(r[1]) + '</td></tr>'; }).join('');
  return '<html><head><meta charset="utf-8"><style>' +
    'body{font-family:Arial,sans-serif;color:#0f1b2d;font-size:13px}' +
    'h1{font-size:20px;margin:0 0 4px}table{width:100%;border-collapse:collapse;margin-top:12px}' +
    'td{padding:6px 4px;border-bottom:1px solid #e3e6eb}.big{font-size:28px;font-weight:bold;color:#1f7a5a}' +
    '</style></head><body>' +
    '<h1>Karta transakcyjna</h1><div style="font-size:15px;font-weight:bold">Marża I netto · SU - Adamowscy</div><div style="color:#5f6b7a">Wygenerowano ' +
    Utilities.formatDate(new Date(), 'Europe/Warsaw', 'dd.MM.yyyy HH:mm') + '</div>' +
    '<p class="big">' + esc_(d.margin) + ' <span style="font-size:15px;color:#5f6b7a">(' + esc_(d.pct) + ')</span></p>' +
    '<table>' + info + '</table><h2 style="font-size:15px;margin-top:20px">Rozliczenie</h2><table>' + rows + '</table>' +
    '</body></html>';
}

function esc_(t) {
  return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}
function out_(t) { return ContentService.createTextOutput(t); }
