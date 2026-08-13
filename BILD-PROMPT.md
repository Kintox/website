# KI-Prompt für das Hero-Bild der Partner-Seite

## Vorab: die eine Sache, die schiefgehen kann

Bildgeneratoren können **keine Schrift**. Wenn das Produkthandbuch oder eine
HEIMATGLÜCK-Wurst gut lesbar im Bild liegt, produziert die KI mit hoher
Wahrscheinlichkeit ein verunstaltetes REiCO-Logo und Fantasie-Buchstaben auf der
Verpackung. Das ist gleich doppelt schlecht: Es sieht billig aus, **und** es ist eine
verfremdete Darstellung der Marke — der Vertriebspartnervertrag (§ 3) erlaubt Werbung
für Produkte nur mit den von REiCO bereitgestellten Materialien, und die Richtlinien
verlangen eine unveränderte Logo-Nutzung.

**Deshalb im Prompt bewusst so gesteuert:** Das Handbuch liegt aufgeschlagen auf dem
Tisch, ist aber **angeschnitten und unscharf** — man erkennt Farben, Fotos und das
Layout, aber keine Schrift. Genau das reicht, damit die Szene echt wirkt.

Wenn du die Doppelseite später scharf und korrekt im Bild haben willst: KI-Bild ohne
lesbares Buch generieren und den echten Screenshot hinterher in Photoshop/Canva
perspektivisch auf die Seite legen. Dauert zehn Minuten und ist hundertprozentig sauber.

---

## So gibst du die Referenzen mit

| Referenz | Wie du sie beschriftest |
|---|---|
| 2–3 Fotos von dir (Gesicht frontal + halbes Profil, gutes Licht) | „Reference for the man's face and hair — keep his likeness" |
| Screenshot der Handbuch-Doppelseite | „Color and layout reference for the open book on the table only — do NOT reproduce any text or logos" |

Bei Midjourney: deine Fotos mit `--cref <URL> --cw 80` einbinden (80 heißt: Gesicht
übernehmen, Kleidung frei). Bei ChatGPT/Gemini/Firefly einfach hochladen und den Satz
oben dazuschreiben.

---

## Prompt 1 — Beratungsgespräch am Tisch (meine Empfehlung)

**Englisch, für die Bildgenerierung:**

```
Candid documentary photograph, vertical 4:5 portrait format.

A friendly man in his early thirties with short blond hair (use the reference photos
for his likeness) sits at a warm wooden kitchen table, turned three-quarters towards
a woman in her forties sitting across from him. They are mid-conversation — he is
listening, leaning slightly forward, one hand resting relaxed on the table, genuine
attentive expression. Neither of them looks at the camera.

On the table between them: two ceramic coffee cups, a small notepad and pen, and an
open magazine lying flat, cropped by the frame edge and rendered soft and out of focus
so that no text or logo is legible — only warm beige, deep olive green and photographic
imagery are recognizable.

A medium-sized dog lies calmly on the floor beside the table in the lower foreground,
partly cropped, relaxed, not the main subject.

Setting: a bright, homely kitchen or dining room, plain light wall, a window out of
frame on the left providing soft natural daylight, a few green plants blurred in the
background. Late morning light, warm and gentle, no harsh shadows.

Photographic style: shot on a 35mm lens at f/2.0, shallow depth of field, natural
colours, subtle film grain, realistic skin texture. Colour palette of warm beige,
cream, deep olive green and soft daylight. Editorial reportage look, not advertising,
not stock photography.

Composition: the man positioned slightly right of centre, comfortable empty space
around the upper area, nothing important in the outer 10 percent of the frame.
```

**Negativ-Prompt (falls dein Tool ein Feld dafür hat):**

```
text, letters, words, writing, logo, watermark, brand name, packaging labels,
readable book page, money, coins, banknotes, charts, arrows pointing up, car keys,
laptop, office, suit and tie, handshake, thumbs up, posed smiling at camera,
stock photo look, oversaturated, HDR, plastic skin, distorted hands, extra fingers,
deformed dog, blurry face, cartoon, illustration, 3d render
```

---

## Prompt 2 — Spaziergang zu zweit (Alternative)

Lockerer, weniger „Termin". Gut, falls dir Variante 1 zu formell ist.

```
Candid documentary photograph, vertical 4:5 portrait format.

Two people walking side by side on a soft dirt path at the edge of a meadow — a
friendly man in his early thirties with short blond hair (use the reference photos for
his likeness) and a woman in her forties. They are turned slightly towards each other
in relaxed conversation, natural gestures, neither looking at the camera. A
medium-sized dog walks ahead of them on a loose leash, slightly out of focus.

Setting: gentle countryside, tall grass, a few bare trees, overcast-to-golden late
afternoon light, soft and warm, no harsh sun.

Photographic style: shot on an 85mm lens at f/2.2, shallow depth of field, natural
muted colours, subtle film grain, realistic skin texture. Warm earthy palette with
olive green and beige tones. Editorial reportage look, not advertising, not stock
photography.

Composition: both figures in the lower two thirds, open sky and blurred background
above, nothing important in the outer 10 percent of the frame.
```

Gleicher Negativ-Prompt wie oben.

---

## Prompt 3 — Infostand / Markt

Falls du Fotos aus deiner Standzeit hast, nimm die lieber als echtes Material. Wenn
nicht:

```
Candid documentary photograph, vertical 4:5 portrait format.

A friendly man in his early thirties with short blond hair (use the reference photos
for his likeness) stands behind a simple wooden table at an outdoor market, talking to
a visitor who stands with a dog on a leash. He gestures naturally while explaining
something, warm and open body language, not looking at the camera. On the table:
neutral beige and olive display materials, a roll-up banner blurred in the background —
all text and logos unreadable and out of focus.

Setting: outdoor market or small fair, other stands blurred in the far background,
soft overcast daylight.

Photographic style: 50mm lens at f/2.5, shallow depth of field, natural colours,
subtle film grain. Warm beige and olive palette. Editorial reportage look.
```

---

## Deutsche Fassung von Prompt 1

Falls dein Tool auf Deutsch besser arbeitet:

```
Dokumentarische Reportagefotografie, Hochformat 4:5.

Ein sympathischer Mann Anfang dreißig mit kurzen blonden Haaren (Gesicht gemäß den
Referenzfotos) sitzt an einem warmen Holztisch in einer hellen Küche, dreiviertel zur
Kamera gedreht, im Gespräch mit einer Frau Anfang vierzig ihm gegenüber. Er hört
aufmerksam zu, leicht nach vorne gelehnt, eine Hand entspannt auf dem Tisch. Keiner
von beiden schaut in die Kamera.

Auf dem Tisch: zwei Keramik-Kaffeetassen, ein kleiner Notizblock mit Stift und eine
aufgeschlagene Broschüre, die vom Bildrand angeschnitten und unscharf ist, sodass
keine Schrift und kein Logo lesbar sind — erkennbar sind nur warme Beigetöne, dunkles
Olivgrün und Fotoflächen.

Ein mittelgroßer Hund liegt ruhig auf dem Boden neben dem Tisch im unteren Vordergrund,
teilweise angeschnitten, entspannt, nicht im Mittelpunkt.

Umgebung: helle, wohnliche Küche, schlichte helle Wand, Fenster außerhalb des Bildes
links sorgt für weiches Tageslicht, im Hintergrund unscharfe Grünpflanzen. Später
Vormittag, warmes weiches Licht, keine harten Schatten.

Fotografischer Stil: 35-mm-Objektiv bei Blende 2.0, geringe Schärfentiefe, natürliche
Farben, feines Filmkorn, realistische Hauttextur. Farbwelt aus warmem Beige, Creme,
dunklem Olivgrün. Redaktioneller Reportage-Look, keine Werbefotografie, kein Stockfoto.
```

---

## Nach der Generierung

1. **Gesicht prüfen.** Wenn es dir nicht ähnlich sieht, lieber nochmal generieren —
   ein „fast wie du" wirkt unheimlich und fällt Leuten auf, die dich kennen.
2. **Hände und Hundepfoten kontrollieren.** Klassische KI-Schwachstelle.
3. **Format:** 4:5 hochkant, mindestens 900 px breit. Die Seite schneidet auf 4:5 zu.
4. **Speichern als** `img/partner-hero.jpg`, Qualität etwa 82, danach in `partner.html`
   im Hero `img/hero-hund.png` durch `img/partner-hero.jpg` ersetzen.
5. **Alt-Text anpassen:** aktuell steht dort „Cedric Nitsch im Gespräch" — das passt
   dann ja auch.

## Ehrlich gesagt

Ein echtes Foto schlägt jedes KI-Bild, gerade auf einer Seite, deren ganzer Verkaufs-
punkt Ehrlichkeit ist. Wenn du in den nächsten Wochen ohnehin ein Beratungsgespräch
oder einen Stand hast: einmal jemanden bitten, mit dem Handy zwanzig Fotos zu machen.
Das kostet nichts, ist rechtlich unangreifbar und du hast Material für alles Weitere.
Das KI-Bild ist die gute Zwischenlösung, bis es so weit ist.
