# Anleitung & Änderungsprotokoll

## 1. Dateien ins Repo

```
website/
├── index.html            ← ERSETZEN
├── partner.html          ← ERSETZEN
├── impressum.html        ← ERSETZEN
├── datenschutz.html      ← ERSETZEN
├── 404.html              ← NEU
├── robots.txt            ← NEU
├── sitemap.xml           ← NEU (Domain vorher prüfen, siehe Punkt 5)
├── assets/
│   ├── css/style.css     ← ERSETZEN
│   ├── js/nav.js         ← unverändert
│   ├── js/futtercheck.js ← ERSETZEN
│   └── fonts/            ← noch leer, siehe Punkt 4
└── img/                  ← KOMPLETT ERSETZEN (neue Dateien, alte löschen)
```

> **Achtung beim `img/`-Ordner:** Die alten `hero-hund.png`, `about-portrait.png` und
> `handbuch-cover.png` werden nicht mehr gebraucht und sollten gelöscht werden — sie sind
> zusammen über 4 MB groß. Die neuen Dateien heißen `.jpg` und `.webp`.

---

## 2. Was sich in dieser Runde geändert hat

### Kritisch

| Punkt | Vorher | Jetzt |
|---|---|---|
| **Bildgrößen** | 4,1 MB für drei Fotos | 430 KB als JPG, 160 KB als WebP — Faktor 10 |
| **Kontrast Korall auf Weiß** | 2,08 : 1 (durchgefallen) | neue Textfarbe `#A8341C`, 6,62 : 1 |
| **Gedämpfter Text auf Kalk** | 4,08 : 1 (durchgefallen) | `#5F6136`, 5,03 : 1 |
| **Weiße Texte auf Dunkel** | teils 4,13 : 1 | alle Deckkraft-Werte auf ≥ 0,72 angehoben, ≥ 6,4 : 1 |
| **Touch-Targets** | Nav 36 px, kleine Buttons 40 px | alle ≥ 44 px, automatisch geprüft |
| **Firmenlogo** | REiCO-Firmenlogo im Header | **VP-Signet „REiCO PARTNER"** (Richtlinien Ziff. 6a) |
| **Platzhalter im Livetext** | zwei sichtbare `[...]` | beide durch echten Text ersetzt |

### Conversion

- **Handbuch-Formular verschlankt.** Pflicht sind nur noch Name und E-Mail. Straße,
  Ort und Telefon sind in ein aufklappbares „Lieber gedruckt per Post?" gewandert.
  Von fünf Pflichtfeldern auf zwei.
- **Handbuch als hürdenfreier Einstieg positioniert**, das Kontaktformular als
  bewusster zweiter Schritt („Lieber direkt beraten werden?").
- **Kundenschutz-Checkbox erklärt.** Statt einer unkommentierten Negativ-Abfrage steht
  jetzt darunter, warum sie da ist.
- **Neuer Vertrauensabschnitt** auf beiden Seiten mit belegbaren Unternehmensdaten
  (1992, zweite Generation, BDD seit 2006, 8 Länder / 8.500+ Partnerschaften) — jeweils
  mit Quellenangabe. Dazu drei **deutlich markierte Platzhalter** für echte Kundenstimmen.
- **Futtercheck zählt jetzt ehrlich.** Vorher „Frage 13 von 13" auf dem Kontaktformular,
  das keine Frage ist. Jetzt: 12 Fragen, danach „Alle 12 Fragen beantwortet".

### Technik

- WebP mit JPG-Fallback über `<picture>`, `loading="lazy"` für alles unterhalb der Falte,
  `fetchpriority="high"` fürs Hero-Bild, `width`/`height` überall (verhindert Layout-Sprünge)
- `404.html`, `robots.txt`, `sitemap.xml` ergänzt
- Alle internen Links automatisch auf tote Ziele geprüft — keine gefunden

---

## 3. Was du noch ausfüllen musst

| Datei | Stelle | Was fehlt |
|---|---|---|
| `assets/js/futtercheck.js` | ganz oben | **Brevo-URL** — ohne die geht keine Anfrage durch (Punkt 4) |
| `index.html` | Abschnitt „Vertrauen" | **drei echte Kundenstimmen** statt der Platzhalter |
| `impressum.html` | „Angaben zum Hersteller" | vollständige Anschrift der REiCO GmbH |

**Zu den Kundenstimmen — bitte unbedingt lesen:** Die Platzhalter sind absichtlich
auffällig gestaltet (gestrichelter Rahmen, kursiv, rot), damit sie nicht versehentlich
live gehen. Ersetze `class="voice placeholder"` durch `class="voice"`, sobald ein echtes
Zitat drin steht.

Nimm **keine Wirkungsaussagen** wie „nach vier Wochen kein Juckreiz mehr" — das ist eine
Gesundheitsaussage und nach Ziff. 8 der Richtlinien nicht zulässig, unabhängig davon, ob
es als Zitat formuliert ist. Ein Zitat wird dem Werbenden zugerechnet.

Was funktioniert und erlaubt ist, sind Aussagen über den **Beratungsablauf**:

> „Cedric hat sich am Telefon 40 Minuten Zeit genommen und mir am Ende von einem
> Produkt abgeraten, das ich eigentlich kaufen wollte."

Das transportiert mehr Vertrauen als jede Wirkungsbehauptung — und ist rechtlich sauber.

---

## 4. Brevo einrichten (ca. 5 Minuten)

Ohne diesen Schritt geht **jede Anfrage verloren**. Das ist der wichtigste Punkt vor
jedem Werbe-Euro.

**Wichtig vorweg:** Ein Brevo-API-Key darf nicht in die Website — der wäre im Quelltext
für jeden lesbar. Deshalb läuft es über ein Brevo-Formular.

1. **Liste anlegen** — Brevo → *Kontakte* → *Listen*, z. B. `Futtercheck Hund`.

2. **Kontakt-Attribute anlegen** — Brevo → *Kontakte* → *Einstellungen* →
   *Kontakt-Attribute*, jeweils Typ **Text**, exakt in dieser Schreibweise:

   | Attribut | Inhalt |
   |---|---|
   | `VORNAME` | Vorname |
   | `TELEFON` | Telefon / WhatsApp |
   | `TIERART` | Hund oder Katze |
   | `TIERNAME` | Name des Tieres |
   | `SCORE` | Punktzahl 0–100 |
   | `THEMEN` | angekreuzte Auffälligkeiten |
   | `PROFIL` | Gute Basis / Verbesserungspotenzial / Handlungsbedarf |
   | `PARTNERINTERESSE` | Antwort auf die Partner-Frage |
   | `STRASSE` | nur beim Handbuch-Formular, jetzt optional |
   | `ORT` | nur beim Handbuch-Formular, jetzt optional |

3. **Formular erstellen** — *Kontakte* → *Formulare* → *Neues Formular*, Liste wählen,
   alle Attribute als Felder hinzufügen, speichern.

4. **URL kopieren** — im Schritt *Teilen* den HTML-Code anzeigen lassen, darin steht
   `action="https://sibforms.com/serve/XXXXXXXX"`.

5. **URL eintragen** — in `assets/js/futtercheck.js` ganz oben:

   ```js
   const BREVO_FORM_URL = "https://sibforms.com/serve/DEINE-BREVO-URL";
   ```

6. **Auswertungs-Mail automatisieren** — *Automation* → Auslöser
   *„Ein Kontakt wird einer Liste hinzugefügt"* → E-Mail senden. Personalisieren mit
   `{{ contact.VORNAME }}`, `{{ contact.TIERNAME }}`, `{{ contact.SCORE }}`,
   `{{ contact.PROFIL }}`, `{{ contact.THEMEN }}`.

7. **Testen.** Beide Formulare und den Futtercheck einmal mit einer echten Adresse
   ausfüllen und prüfen, ob die Mail ankommt und der Kontakt in Brevo steht. Erst
   danach ist die Seite bereit für Werbebudget.

---

## 5. Google Fonts abstellen

Die Seite lädt Poppins noch von Googles Servern; die IP jedes Besuchers geht damit in
die USA. Das LG München I hat genau das 2022 (Az. 3 O 17493/20) als DSGVO-Verstoß
gewertet — seitdem ein beliebtes Abmahnthema. Die Datenschutzerklärung deckt es ab,
solange es so bleibt, aber sauberer ist Selbst-Hosten:

1. https://gwfh.mranftl.com/fonts/poppins öffnen
2. Stärken **300, 400, 500, 600, 700, 800**, Charsets **latin + latin-ext**
3. „Download files" → ZIP entpacken
4. Alle `.woff2`-Dateien nach `assets/fonts/`
5. In `index.html`, `partner.html`, `impressum.html`, `datenschutz.html` und `404.html`
   die drei `<link>`-Zeilen zu `fonts.googleapis.com` / `fonts.gstatic.com` löschen
6. In `assets/css/style.css` den vorbereiteten `@font-face`-Block auskommentieren
7. In `datenschutz.html` **Abschnitt 9 „Google Fonts"** löschen, samt Eintrag im
   Inhaltsverzeichnis

Nebeneffekt: die Seite wird spürbar schneller, weil zwei zusätzliche Verbindungen
zu fremden Servern wegfallen.

---

## 6. Umzug auf cedricnitsch.de

Die Datei `CNAME_ZUM_UMZUG.txt` enthält nur eine Zeile: `cedricnitsch.de`.

**Lade sie noch nicht hoch.** Sobald eine Datei namens `CNAME` (ohne Endung) im Repo
liegt, stellt GitHub Pages sofort auf die eigene Domain um — und die Seite ist unter
`kintox.github.io` nicht mehr erreichbar, bis das DNS steht.

Richtige Reihenfolge:

1. Beim Domain-Anbieter für `cedricnitsch.de` die GitHub-Pages-DNS-Einträge setzen
   (vier A-Records auf `185.199.108–111.153`, plus ein CNAME für `www` auf
   `kintox.github.io`)
2. Warten, bis die DNS-Änderung greift
3. Datei in `CNAME` umbenennen (ohne Endung) und ins Repo legen
4. In den Repo-Einstellungen unter *Pages* „Enforce HTTPS" aktivieren
5. In `robots.txt` und `sitemap.xml` die Domain prüfen
6. Alte Seite abschalten und die alten URLs per 301 auf die neuen weiterleiten

---

## 7. Was ich nicht anfassen konnte

- **Die alte cedricnitsch.de** liegt in einem anderen Repo (`Kintox/mentor`). Die dort
  in der Analyse genannten Punkte — „90 % aller Tierprobleme", das Wirkungs-Testimonial,
  „Begrenzte Plätze", „100 Mio. € Umsatz", „ab 83,30 €/Jahr" in der Kunden-Hero — sind
  hier nicht enthalten. Sag Bescheid, wenn ich das Repo auch überarbeiten soll.
- **Brand-Bidding auf „Reico" bei Google Ads.** Die Richtlinien regeln nur die Domain
  und verbieten „Preis"/„Online Shop" als Keywords, äußern sich aber nicht zum
  Marken-Keyword. Die Richtlinien verweisen für Zweifelsfälle selbst auf die Zentrale —
  eine kurze schriftliche Anfrage dort ist die billigste Absicherung im ganzen Projekt.

> **Ich bin kein Anwalt.** Die Rechtstexte sind auf deine tatsächliche Datenverarbeitung
> zugeschnitten, ersetzen aber keine Rechtsberatung.
