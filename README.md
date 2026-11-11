# Kalkulator Marży SU - Adamowscy

Kreator krok po kroku liczący **marżę I netto** na aucie używanym (auta krajowe):

1. Podstawa zakupu: faktura VAT-marża, faktura VAT 23% albo umowa kupna-sprzedaży (PCC 2% doliczany automatycznie, sprzedaż na VAT-marża)
2. Dane auta: VIN, data zakupu, data sprzedaży, cena zakupu (pola obowiązkowe)
3. Detailing: tak/nie, kwota, VAT usługi (bez VAT / 8% / 23%)
4. Naprawy i usprawnienia (z odliczeniem VAT z faktur) + certyfikat Renew 340 zł netto
5. Finansowanie: bank i prowizja
6. Cena sprzedaży
7. Wynik: marża I netto, marża %, dni w stocku, maksymalna cena zakupu i minimalna cena sprzedaży

Marża I netto = sprzedaż netto − zakup netto − detailing netto − usprawnienia netto + prowizja z finansowania.

Jeden plik `index.html`, bez instalacji. Otwórz go w przeglądarce albo włącz GitHub Pages.

## Wysyłka raportu PDF na maila

Na końcu kalkulacji przycisk **Wyślij raport PDF** wysyła raport na stały adres firmowy. W temacie maila jest VIN: `Marża I – VIN XXXXXXXXXXXXXXXXX – model`.

Wysyłkę obsługuje darmowy skrypt Google Apps Script (`apps-script/wysylka.gs`), który działa na koncie Gmail właściciela:

1. Otwórz https://script.google.com → Nowy projekt → wklej `apps-script/wysylka.gs`.
2. Wpisz `ODBIORCA` (adres odbiorcy raportów).
3. Wdróż → Nowe wdrożenie → Aplikacja internetowa → Wykonaj jako: Ja, Dostęp: Każdy.
4. Skopiuj adres `…/exec` i wpisz go w `index.html` w `CONFIG.SEND_URL`.

## Udostępnienie pracownikom

Settings → Pages → Branch `main`, folder `/ (root)`. Kalkulator będzie dostępny pod
`https://mikulskiwojtek4-debug.github.io/Kalkulator/` i działa na telefonie bez logowania.
