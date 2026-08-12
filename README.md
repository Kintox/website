# Website

Statische Website (Single-Page) für REiCO / Cedric Nitsch.

## Projektstruktur

```
.
├── index.html            # Haupt-HTML-Seite (CSS & JS inline)
├── assets/
│   └── images/           # Alle Bilddateien
│       ├── about-portrait.jpg
│       ├── handbuch-cover.jpg
│       ├── hero-hund.jpg
│       ├── logo-alge.png
│       └── logo-sauerstoff-white.png
└── README.md
```

## Hinweise

- Alle Bilder liegen zentral unter `assets/images/`.
- Die Bildpfade in `index.html` verweisen relativ auf `assets/images/...`.

## Lokal öffnen

Einfach `index.html` im Browser öffnen oder einen lokalen Server starten:

```bash
python3 -m http.server 8000
# danach http://localhost:8000 aufrufen
```
