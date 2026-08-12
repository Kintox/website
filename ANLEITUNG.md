# Was du tun musst

## 1. Dateien ins Repo

Die Struktur hat sich geändert – CSS und JavaScript liegen jetzt in eigenen Dateien,
damit `index.html` und `partner.html` sich dasselbe Design teilen.

```
website/
├── index.html          ← ERSETZEN
├── partner.html        ← NEU
├── assets/
│   ├── css/
│   │   └── style.css   ← NEU
│   └── js/
│       ├── nav.js      ← NEU
│       └── futtercheck.js  ← NEU
└── img/                ← bleibt wie es ist
```

Die `img/`-Dateien bleiben unangetastet. Die Dateinamen in den neuen HTML-Dateien
verweisen auf `logo-alge.png`, `logo-sauerstoff-white.png`, `hero-hund.png`,
`about-portrait.png` und `handbuch-cover.png` – also genau auf das, was schon im
Repo liegt.

---

## 2. Brevo einrichten (ca. 5 Minuten)

Solange das nicht gemacht ist, läuft der Futtercheck ganz normal durch, die Daten
landen aber noch nicht in Brevo. Es kommt dann eine Fehlermeldung mit Verweis auf
WhatsApp.

**Wichtig vorweg:** Ein Brevo-API-Key darf **nicht** in die Website. Der wäre für
jeden im Quelltext lesbar, und jeder könnte damit auf dein Konto zugreifen. Deshalb
läuft die Anbindung über ein Brevo-Formular – das ist der Weg, der ohne Server
funktioniert und trotzdem sicher ist.

### Schritt für Schritt

1. **Liste anlegen**
   Brevo → *Kontakte* → *Listen* → neue Liste, z. B. `Futtercheck Hund`.

2. **Kontakt-Attribute anlegen**
   Brevo → *Kontakte* → *Einstellungen* → *Kontakt-Attribute*.
   Diese Attribute vom Typ **Text** anlegen, exakt in dieser Schreibweise:

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

3. **Formular erstellen**
   Brevo → *Kontakte* → *Formulare* → *Neues Formular*.
   Die Liste aus Schritt 1 auswählen, alle Attribute als Felder hinzufügen,
   Double-Opt-In nach Wunsch aktivieren, speichern.

4. **URL kopieren**
   Im Schritt *Teilen* den HTML-Code anzeigen lassen. Darin steht:
   `action="https://sibforms.com/serve/XXXXXXXX"`
   Genau diese URL kopieren.

5. **URL eintragen**
   In `assets/js/futtercheck.js`, ganz oben:

   ```js
   const BREVO_FORM_URL = "https://sibforms.com/serve/DEINE-BREVO-URL";
   ```

   → durch deine URL ersetzen. Das ist die einzige Stelle, die du anfassen musst.

6. **Auswertungs-Mail automatisieren**
   Brevo → *Automation* → Auslöser *„Ein Kontakt wird einer Liste hinzugefügt"* →
   E-Mail senden. Im Template kannst du personalisieren mit:

   ```
   {{ contact.VORNAME }}, {{ contact.TIERNAME }}, {{ contact.SCORE }},
   {{ contact.PROFIL }}, {{ contact.THEMEN }}
   ```

---

## 3. Noch offen (unverändert von vorher)

- Telefon-Kontaktkarte: Platzhalter `[Sprechzeiten, z. B. Mo–Fr 9–18 Uhr]`
- Impressum und Datenschutz sind nur leere Anker (`#impressum`, `#datenschutz`).
  Bevor die Seite mit einem Formular live geht, brauchst du beides als echte Seiten –
  spätestens für den Futtercheck ist eine Datenschutzerklärung Pflicht, in der Brevo
  als Auftragsverarbeiter genannt wird.
- Persönlicher Satz im „Über mich"-Abschnitt auf `index.html` steht noch in eckigen Klammern.

---

## 4. Warum die Partner-Seite so zurückhaltend formuliert ist

Das ist kein Zufall, sondern folgt den Reico-Richtlinien (Stand 06/2026):

- **Kein „Jobs"/„Stellenanzeigen"-Framing.** Abschnitt 6h untersagt die Gewinnung von
  Vertriebspartnern über Jobbörsen und Stellenanzeigen. Deshalb heißt der Button
  „Partner werden" und die Seite spricht durchgehend von selbstständiger Tätigkeit.
- **Keine Verdienstangaben.** Abschnitt 4: Inhalte aus dem Marketing-/Vergütungsplan
  dürfen nicht veröffentlicht werden. Also keine Provisionssätze, keine Rechenbeispiele,
  keine Einkommensversprechen – auch keine wie auf cedricnitsch.de („200–500 € nebenher").
  Die FAQ beantwortet die Verdienstfrage bewusst mit einem Verweis aufs Gespräch.
- **Keine Region.** Es gibt keinen Gebietsschutz, also keine Ortsangaben im Zusammenhang
  mit der Tätigkeit.
- **Kein Shop-Charakter**, keine Preisliste, keine Bestellfunktion.
- Die Portalgebühr (70,00 € netto pro Vertragsjahr) ist eine Gebühr laut
  Gebührenverzeichnis, keine Marketingplan-Information – die darf genannt werden.
