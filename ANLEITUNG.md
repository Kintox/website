# Update 13.08. (vierte Runde): Über-mich-Text & Brevo-Segmentierung

## 1. Über-mich-Abschnitt aktualisiert

`index.html`, Abschnitt „Über mich": mit deinem neuen Text ersetzt (Physiotherapie-
Hintergrund, 2016 nebenberuflich → nach einem Jahr hauptberuflich, „keine Diagnosen,
kein Verkaufsdruck"). Den alten Satz zur Mutter habe ich rausgenommen, da er in
deinem neuen Text nicht mehr vorkam. Bewusst NICHT reingeschrieben: was genau sich
bei dir persönlich verändert hat – dein Text sagt ja explizit, das sei besser ein
Gesprächsthema als ein Website-Text. Das passt auch strategisch besser: es gibt den
Leuten einen Grund, dich anzurufen statt nur zu lesen.

Außerdem „Mensch" ergänzt, wo bisher nur Hund/Katze/Pferd stand: im Badge unter
„Über mich" (`index.html`), im Badge auf `partner.html`, und in der Trustline im
Hero oben auf der Startseite. Die Handbuch-Beschreibung („Alle REiCO Produkte für
Hund, Katze & Pferd") habe ich unverändert gelassen – das Produkthandbuch selbst
führt ja nur diese drei, das wäre sonst falsch.

## 2. Deine Frage: Produkthandbuch & Kundenzugang – eigene Brevo-Formulare/Listen?

**Meine Empfehlung: nein, bei der einen gemeinsamen Liste bleiben.** Gründe:

- Du hast diese eine Anbindung gerade mühsam bis aufs Byte durchgetestet (die
  `.click()`-vs-`.submit()`-Geschichte). Jedes weitere Formular ist eine weitere
  Brevo-URL, ein weiterer DOI-Prozess, eine weitere Fehlerquelle – und bringt dir
  keinen Vorteil, den du nicht auch mit einer Liste hättest.
- Wenn jemand z. B. erst das Handbuch anfordert und später den Futtercheck macht,
  landet er bei getrennten Listen doppelt (oder Brevo verschickt die
  Bestätigungsmail zweimal) – bei einer Liste wird der bestehende Kontakt einfach
  aktualisiert.
- Segmentierung und unterschiedliche Automations-E-Mails brauchen keine getrennten
  Listen. Brevo-Automationen können auch innerhalb einer Liste nach einem
  Attributwert filtern („wenn QUELLE = handbuch, dann Automation A").

**Was ich stattdessen gemacht habe:** ein sauberes, eigenes Attribut `QUELLE`
ergänzt (`futtercheck` / `handbuch` / `kundenzugang`), statt wie bisher nur das
zweckentfremdete Feld `FUTTERCHECK_FARB_SCORE` als Marker zu missbrauchen. Das alte
Feld wird aus Kompatibilitätsgründen weiterhin mitgeschickt (falls du es schon in
einer Automation nutzt), `QUELLE` kommt zusätzlich dazu.

**Ein Schritt fehlt noch von deiner Seite, ist aber unkritisch:**
Brevo → Kontakte → Einstellungen → Kontakt-Attribute → neues Attribut `QUELLE`,
Typ Text, anlegen. Bis du das gemacht hast, schickt die Seite das Feld zwar mit,
Brevo ignoriert es aber einfach – der Futtercheck und die beiden anderen Formulare
funktionieren auch ohne diesen Schritt weiter ganz normal (getestet: unbekannte
Felder ändern nichts am `{"success":true}`). Sobald das Attribut existiert, kannst
du in *Automation* eine Bedingung „QUELLE ist gleich handbuch" (bzw. `kundenzugang`,
`futtercheck`) bauen und jeweils eine passende Folge-Mail auslösen – z. B. beim
Handbuch direkt den PDF-Link, bei Kundenzugang einen Hinweis, dass du dich meldest.

Getestet mit Playwright: beide Formulare (Handbuch, Kundenzugang) übergeben jetzt
korrekt alle Felder inkl. `QUELLE` ans versteckte Brevo-Formular, genau wie der
Futtercheck. Kein Feld fehlt, keine Regression.

---

# Futtercheck laeuft (Stand 13.08., dritte Runde) — jetzt echt getestet

## Was diesmal anders ist: ich habe es gegen deinen Endpunkt geprueft

Ich hatte zweimal geraten und zweimal danebengelegen. Diesmal habe ich einen
echten POST an deine Brevo-URL geschickt und die Antwort angesehen:

```
HTTP 200  {"success":true}
```

Getestet wurden auch die Grenzfaelle — Telefonnummer wie getippt (015678…),
international (4915678…), Telefon ganz weggelassen, Pflichtfelder leer, nur
E-Mail und Vorname. **Alle fuenf: `{"success":true}`.** Brevos Server nimmt
einen ganz normalen Formular-POST an.

## Was der eigentliche Fehler war

Meine letzte Fassung hat den Brevo-Submit-Button per `click()` ausgeloest —
so wie es deine alte Seite macht. Ein Klick loest aber zuerst die
HTML5-Validierung aus. Und weil das Formular ausgeblendet ist, bricht Chrome
mit *"An invalid form control is not focusable"* ab und sendet **gar nichts**.
Kein Fehler in der Konsole, keine Meldung — es passiert einfach nichts.

Jetzt wird `form.submit()` benutzt. Das ueberspringt die Validierung und
postet direkt.

## Dein Design bleibt unberuehrt

Genau das war deine Sorge, und sie war berechtigt: Brevos `sib-styles.css`
enthaelt Regeln fuer `input`, `button` und `.input` — die haetten dein Design
ueberschrieben.

**Es wird jetzt weder Brevos CSS noch Brevos JavaScript geladen.** Beides
braucht nur das sichtbare Brevo-Formular. Da wir den POST selbst machen,
faellt beides ersatzlos weg. Uebrig bleibt ein schlankes Formular aus
`<input type="hidden">`-Feldern am Ende von `index.html`.

Drei Nebeneffekte, alle positiv:

1. **Adblocker-fest.** Wer sibforms.com blockt, konnte vorher nichts absenden.
2. **Schneller.** Zwei Verbindungen zu fremden Servern weniger.
3. **Datenschutzfreundlicher.** Vorher wurde beim blossen Aufruf der Startseite
   die IP jedes Besuchers an Brevo uebertragen. Jetzt entsteht die Verbindung
   erst beim Absenden. Ich habe den entsprechenden Absatz in der
   Datenschutzerklaerung wieder zurueckgenommen und richtig gestellt.

## Getestet im Browser, mit abgefangenem POST

Alle drei Formulare senden nachweislich:

**Futtercheck**
```
EMAIL=kunde@example.de · VORNAME=Cedric · HUND_KATZE=hund · TIERNAME=Balu
FUTTERCHECK_SCORE=36 · FUTTERCHECK_FARB_SCORE=rot
FUTTERCHECK_FUTTER=Trockenfutter (Standard) · PARTNER_INTERESSE=Stark
SMS=015678516818 · SMS__COUNTRY_CODE=+49 · email_address_check= · locale=de
```
Ergebnis bleibt sichtbar, Seite navigiert nicht weg.

**Produkthandbuch** — `FUTTERCHECK_FARB_SCORE=handbuch`, Bestaetigung sichtbar
**Kundenzugang** — `FUTTERCHECK_FARB_SCORE=kundenzugang`, Bestaetigung sichtbar

An diesen beiden Markern kannst du die Anfragen in Brevo auseinanderhalten
und getrennte Automationen darauf bauen.

## Bitte in Brevo aufraeumen

Fuer den Test sind **sechs Kontakte** in deiner Liste gelandet:

```
futtercheck-test@example.com
t2@example.com  t3@example.com  t4@example.com  t5@example.com  t6@example.com
```

Die kannst du loeschen. Die Bestaetigungsmails gehen an example.com und
kommen nirgends an — das ist eine reservierte Testdomain.

## Sprechzeiten

Startseite und Partnerseite: „Erreichbar von 9:30 bis 20:00 Uhr."

---

# Änderungen dieser Runde (Feedback vom 13.08.)

## Partner-Seite

**Ton beim Thema Einkommen.** Der Satz „du ein festes, planbares Gehalt brauchst –
das gibt es hier nicht" war sachlich schief: Am Anfang stimmt er, mit Kundenstamm
nicht mehr. Neu: *„du ab dem ersten Monat ein festes Gehalt brauchst – der Aufbau
braucht am Anfang Geduld."* Dazu ist der Wiederkauf-Gedanke jetzt an drei Stellen
positiv gesetzt, ohne eine einzige Zahl zu nennen:

- Pro-Liste: „du dir lieber etwas aufbaust, das bleibt, statt jeden Monat bei null anzufangen"
- neue Kachel „Kundschaft, die bleibt" bei den Rahmenbedingungen
- FAQ „Wie viel kann ich verdienen": erklärt jetzt das Prinzip Verbrauchsprodukt →
  Wiederbestellung → wachsende Basis, statt nur abzublocken

**Der Satz mit den Produkten ist raus.** „…hinter denen du selbst nicht stehst" hat
einen Zweifel gesät, den vorher niemand hatte.

**Abschluss „Über mich" motivierend.** Statt „Deshalb verspreche ich dir hier nichts"
jetzt: *„Der Unterschied lag selten am Talent, sondern fast immer an der Vorbereitung.
… Mit einem realistischen Plan, Offenheit und etwas Engagement ist das absolut machbar.
Und du musst es nicht alleine herausfinden."*

**Ein Hinweis dazu, den ich dir schulde:** Einen klaren Satz „keine garantierten
Einnahmen, provisionsbasiert" habe ich bewusst stehen lassen — jetzt aber nur noch
**einmal** statt an drei Stellen, und in Kombination mit dem machbar-Teil. Der Satz
ist deine rechtliche Absicherung: Bei Vertriebspartnergewinnung im Direktvertrieb ist
das der Punkt, an dem man angreifbar wird, wenn er fehlt. Und laut deiner eigenen
Analyse ist genau diese Ehrlichkeit das Differenzierungsmerkmal gegenüber den anderen
Partnerseiten. Deine konkreten Zahlen (3.400–3.700 €) dürfen aus einem anderen Grund
ohnehin nicht auf die Seite: Ziff. 4 der Richtlinien untersagt die Veröffentlichung von
Marketingplan-Inhalten, dazu zählen Verdienstbeispiele. Im persönlichen Gespräch kannst
du sie natürlich nennen.

## Layout

- **Vier Schritte stehen jetzt in einer Reihe.** Ursache war eine CSS-Regel mit drei
  Spalten, die von der Startseite stammt. Neue Klasse `steps-4`: ab 1060 px vier
  nebeneinander mit Pfeilen, darunter 2×2, auf dem Handy untereinander.
- **Die Kacheln bei „Rahmenbedingungen" sind jetzt sichtbar.** Vorher weiße Karten auf
  weißem Grund. Jetzt Kalk-Fläche mit dunklem Balken. Die neue fünfte Kachel läuft über
  die volle Breite, damit unten keine einzelne Karte allein steht.
- **Hero hat ein Bild.** Vorläufig das Foto der Startseite, damit die rechte Hälfte
  nicht mehr leer ist. Empfehlung für ein eigenes Motiv unten.

## Startseite

**Der Futtercheck hat eine Überschrift bekommen.** Vorher stand da unvermittelt eine
Frage nach dem Tier, ohne dass klar war, worum es geht:

> **Kostenlos & unverbindlich**
> **Der Futtercheck: Wie gut passt die aktuelle Fütterung zu deinem Tier?**
> 12 kurze Fragen … Dauert etwa zwei Minuten, kostet nichts und verpflichtet zu nichts.

Dabei ist mir aufgefallen, dass der Zähler „Frage 13 von 13" auf dem Kontaktformular
stand, das gar keine Frage ist. Sonst hätte die neue Überschrift („12 Fragen") der
Anzeige widersprochen. Jetzt: 12 Fragen, danach „Alle 12 Fragen beantwortet".

---

# Bildempfehlung für den Partner-Hero

**Das aktuelle Foto ist ein Platzhalter.** Es zeigt dich mit Hund — das passt zur
Kundenseite, aber auf der Partnerseite geht es nicht um Fütterung, sondern um die
Frage „Kann ich das auch?".

## Was das Bild leisten muss

Der Besucher soll in einer Sekunde sehen, **was die Tätigkeit konkret ist**. Und die
Tätigkeit ist: mit Menschen reden. Nicht verkaufen, nicht Pakete schleppen, nicht am
Laptop sitzen.

## Meine Empfehlung, in dieser Reihenfolge

**1. Beratungsgespräch am Tisch (beste Wahl)**
Du und eine zweite Person an einem Küchen- oder Cafétisch, seitlich fotografiert.
Kaffeetassen, ein aufgeschlagenes Produkthandbuch, ein Hund liegt entspannt daneben.
Ihr seid im Gespräch, nicht in die Kamera lächelnd. Tageslicht, warme Töne.

Das zeigt exakt den Job und wirkt sofort machbar — jeder denkt „so ein Gespräch
könnte ich auch führen". Genau das ist die Botschaft der Seite.

**2. Zwei Menschen mit Hund draußen**
Ihr geht zu zweit mit einem Hund spazieren und unterhaltet euch. Lockerer, weniger
„Termin"-Anmutung, funktioniert gut für die nebenberufliche Zielgruppe.

**3. Du am Infostand oder auf einem Markt**
Falls du aus deiner Face-to-Face-Phase noch Fotos hast: Das belegt echte Praxis und
ist der glaubwürdigste Beweis, dass du das wirklich machst.

## Was ich vermeiden würde

- **Geld, Münzen, Diagramme nach oben, Autoschlüssel.** Das ist die Bildsprache, vor
  der deine Zielgruppe fliehen will — und der Grund, warum viele bei „Direktvertrieb"
  sofort abschalten.
- **Laptop am Strand / Homeoffice-Lifestyle.** Passt inhaltlich nicht: Der Job ist
  persönliche Beratung, nicht Online-Business.
- **Gestellte Handshakes und Stockfoto-Teams.** Erkennt jeder, kostet Vertrauen.
- **Fremde Bilder aus dem Netz.** Ziff. 6g der Richtlinien verlangt, dass du die
  Bildrechte hast. Entweder eigene Fotos oder lizenzierte Bilddatenbanken.

## Technisch

Hochformat oder quadratisch, mindestens 900 px breit, als `img/partner-hero.jpg`
ablegen und im Hero den Dateinamen tauschen. Das Seitenverhältnis ist auf 4:5
eingestellt, das Bild wird passend beschnitten.

---

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
