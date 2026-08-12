# Was du tun musst

## 1. Dateien ins Repo

```
website/
├── index.html          ← ERSETZEN
├── partner.html        ← NEU
├── impressum.html      ← NEU
├── datenschutz.html    ← NEU
├── assets/
│   ├── css/
│   │   └── style.css   ← NEU
│   ├── js/
│   │   ├── nav.js      ← NEU
│   │   └── futtercheck.js  ← NEU
│   └── fonts/          ← noch leer, siehe Punkt 4
└── img/                ← bleibt unverändert
```

---

## 2. Drei Stellen, die du noch ausfüllen musst

| Datei | Stelle | Was fehlt |
|---|---|---|
| `impressum.html` | Abschnitt „Angaben zum Hersteller" | Vollständige Anschrift der REiCO & Partner Vertriebs GmbH. Ich habe sie **bewusst nicht aus dem Gedächtnis eingesetzt** – bitte aus dem offiziellen Reico-Impressum übernehmen. |
| `index.html` | Telefon-Kontaktkarte | `[Sprechzeiten, z. B. Mo–Fr 9–18 Uhr]` |
| `index.html` | „Über mich" | `[Kurzer persönlicher Satz zu deinem eigenen Hund …]` |

---

## 3. Brevo einrichten (ca. 5 Minuten)

Solange das nicht gemacht ist, läuft der Futtercheck normal durch, die Daten landen
aber noch nicht in Brevo, und die Formulare zeigen eine Fehlermeldung mit Verweis auf
WhatsApp.

**Wichtig vorweg:** Ein Brevo-API-Key darf **nicht** in die Website. Der wäre für jeden
im Quelltext lesbar. Deshalb läuft die Anbindung über ein Brevo-Formular – der Weg,
der ohne eigenen Server funktioniert und trotzdem sicher ist.

1. **Liste anlegen** – Brevo → *Kontakte* → *Listen*, z. B. `Futtercheck Hund`.

2. **Kontakt-Attribute anlegen** – Brevo → *Kontakte* → *Einstellungen* →
   *Kontakt-Attribute*, jeweils Typ **Text**, exakt in dieser Schreibweise:

   | Attribut | Inhalt |
   |---|---|
   | `VORNAME` | Vorname aus dem Check |
   | `TELEFON` | Telefon / WhatsApp (optional) |
   | `TIERART` | Hund oder Katze |
   | `TIERNAME` | Name des Tieres |
   | `SCORE` | Punktzahl 0–100 |
   | `THEMEN` | angekreuzte Auffälligkeiten |
   | `PROFIL` | Gute Basis / Verbesserungspotenzial / Handlungsbedarf |
   | `PARTNERINTERESSE` | Antwort auf die Partner-Frage |
   | `STRASSE` | nur beim Produkthandbuch-Formular |
   | `ORT` | nur beim Produkthandbuch-Formular |

3. **Formular erstellen** – Brevo → *Kontakte* → *Formulare* → *Neues Formular*.
   Liste aus Schritt 1 wählen, alle Attribute als Felder hinzufügen, speichern.

4. **URL kopieren** – im Schritt *Teilen* den HTML-Code anzeigen lassen. Darin steht
   `action="https://sibforms.com/serve/XXXXXXXX"` – genau diese URL kopieren.

5. **URL eintragen** – in `assets/js/futtercheck.js` ganz oben:

   ```js
   const BREVO_FORM_URL = "https://sibforms.com/serve/DEINE-BREVO-URL";
   ```

   Das ist die einzige Stelle, die du anfassen musst.

6. **Auswertungs-Mail automatisieren** – Brevo → *Automation* → Auslöser
   *„Ein Kontakt wird einer Liste hinzugefügt"* → E-Mail senden. Im Template
   personalisieren mit `{{ contact.VORNAME }}`, `{{ contact.TIERNAME }}`,
   `{{ contact.SCORE }}`, `{{ contact.PROFIL }}`, `{{ contact.THEMEN }}`.

---

## 4. Google Fonts abstellen (wichtig)

Die Seite lädt die Schrift Poppins aktuell von Googles Servern. Dabei geht die
IP-Adresse jedes Besuchers an Google in die USA. Das **LG München I** hat genau das
2022 (Az. 3 O 17493/20) als DSGVO-Verstoß gewertet und dem Kläger Schadenersatz
zugesprochen – seitdem ist das ein beliebtes Abmahnthema.

Die Datenschutzerklärung deckt das ab, solange es so bleibt. Besser ist aber, es
abzustellen. Dauert ca. 10 Minuten und macht die Seite nebenbei schneller:

1. https://gwfh.mranftl.com/fonts/poppins öffnen
2. Stärken **300, 400, 500, 600, 700, 800** auswählen, Charsets **latin + latin-ext**
3. „Download files" → ZIP entpacken
4. Alle `.woff2`-Dateien nach `assets/fonts/` legen
5. In `index.html`, `partner.html`, `impressum.html` und `datenschutz.html`
   die drei `<link>`-Zeilen zu `fonts.googleapis.com` / `fonts.gstatic.com` löschen
6. In `assets/css/style.css` den vorbereiteten `@font-face`-Block auskommentieren
   (die `/*` davor und `*/` dahinter entfernen) – die Anleitung steht direkt dort
7. In `datenschutz.html` **Abschnitt 9 „Google Fonts"** komplett löschen, samt
   Eintrag im Inhaltsverzeichnis

---

## 5. Zu den Rechtstexten

Ich habe die Angaben aus deinem bestehenden Impressum und deiner Datenschutzerklärung
auf cedricnitsch.de übernommen und dabei folgendes aktualisiert bzw. ergänzt:

**Aktualisiert:**
- `§ 5 TMG` → `§ 5 DDG`. Das Telemediengesetz wurde im Mai 2024 durch das
  Digitale-Dienste-Gesetz ersetzt; dein altes Impressum verweist noch aufs TMG.
- `§ 55 Abs. 2 RStV` → `§ 18 Abs. 2 MStV`. Der Rundfunkstaatsvertrag ist seit
  November 2020 durch den Medienstaatsvertrag ersetzt.
- Der Verweis auf die EU-Plattform zur Online-Streitbeilegung. Die wurde zum
  20. Juli 2025 eingestellt; ein Link darauf geht heute ins Leere.

**Neu, weil diese Seite mehr macht als die alte:**
- **Brevo** als Auftragsverarbeiter (Abschnitt 8) – ohne diesen Abschnitt darf der
  Futtercheck nicht live gehen
- **GitHub Pages** als Hoster mit US-Drittlandbezug (Abschnitt 3)
- **Futtercheck** mit genauer Auflistung der abgefragten Daten (Abschnitt 6)
- **WhatsApp** mit dem Hinweis, dass beim bloßen Seitenaufruf noch nichts übertragen
  wird (Abschnitt 10)
- **Weitergabe an Reico** nur bei aktiver Entscheidung zur Registrierung (Abschnitt 11)
- Eine Übersichtstabelle ganz oben, damit Besucher nicht 16 Abschnitte lesen müssen
- Zuständige Aufsichtsbehörde (LDI NRW)

**Weggelassen:** die Cookie-Passagen aus deiner alten Erklärung. Diese Seite setzt
keine Cookies und speichert nichts im Browser – ein Cookie-Banner brauchst du hier
also nicht. Wenn du später Meta-Pixel oder Google Analytics einbaust, ändert sich
das und du brauchst beides: Banner und neuen Abschnitt.

> **Ich bin kein Anwalt.** Die Texte sind sorgfältig auf deine tatsächliche
> Datenverarbeitung zugeschnitten, ersetzen aber keine Rechtsberatung. Lass am besten
> einmal jemanden mit Fachkunde drüberschauen, bevor du mit dem Futtercheck live gehst
> – das ist der Teil mit dem größten Risiko, weil dort E-Mail-Adressen erhoben werden.

---

## 6. Reihenfolge vor dem Livegang

1. Reico-Anschrift im Impressum ergänzen
2. Brevo einrichten und die URL eintragen
3. Testdurchlauf: Futtercheck ausfüllen → kommt die Mail an? steht der Kontakt in Brevo?
4. Google Fonts abstellen (Punkt 4)
5. Rechtstexte prüfen lassen
