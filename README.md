# Stundenplan Formatter

[![CI](https://github.com/macmacs/stundenplaner/actions/workflows/deploy.yml/badge.svg)](https://github.com/macmacs/stundenplaner/actions/workflows/deploy.yml)

Formatiert Stundenpläne aus dem Eltern-Portal — direkt im Browser, ohne Installation.

## → [Stundenplaner öffnen](https://macmacs.github.io/stundenplaner/)

---

## Verwendung

1. **Stundenplan herunterladen** — Im Eltern-Portal den Stundenplan öffnen, dann `Rechtsklick → Seite speichern unter…` und als HTML-Datei speichern.
2. **Datei hochladen** — Die gespeicherte HTML-Datei in den Upload-Bereich der App ziehen (oder per Klick auswählen).
3. **Farben anpassen** — Bekannte Fächer werden automatisch erkannt und eingefärbt. Unbekannte Fächer können mit einem Klick zugewiesen werden.
4. **Exportieren** — Stundenplan als druckfertiges PDF speichern (`Drucken → Als PDF speichern`) oder als standalone HTML-Datei herunterladen.

Ihre Daten verlassen den Browser nicht — alles läuft lokal auf Ihrem Gerät.

## Funktionen

- **Automatische Fach-Erkennung** — 13 vordefierte Fächer mit Standardfarben
- **Farbanpassung** — Farben per Color-Picker individuell anpassen, Änderungen sofort in der Vorschau sichtbar
- **Unbekannte Fächer** — neu auftauchende Fächer werden erkannt und können zugewiesen werden
- **Zelleneditor** — einzelne Zellen manuell bearbeiten
- **Einstellungen speichern** — Farbanpassungen bleiben beim nächsten Besuch erhalten (localStorage)
- **Config Export/Import** — Einstellungen als JSON-Datei sichern und wiederherstellen
- **PDF-Export** — über den Browser-Druckdialog, optimiert für A4 Hochformat
- **HTML-Download** — Stundenplan als eigenständige HTML-Datei speichern
- **Offline-fähig** — funktioniert ohne Internetverbindung
- **Responsive** — nutzbar auf Desktop, Tablet und Smartphone

## Browser-Kompatibilität

Aktuelle Versionen von Chrome, Firefox, Safari und Edge werden unterstützt.

---

## Entwicklung

### Voraussetzungen

- Node.js 22+
- npm

### Setup

```bash
npm install
```

### Linting

```bash
npm run lint        # JS, CSS und HTML prüfen
npm run lint:js     # nur JavaScript (ESLint)
npm run lint:css    # nur CSS (Stylelint)
npm run lint:html   # nur HTML (HTMLHint)
```

### Build

Minifiziert JS, CSS und HTML nach `dist/`:

```bash
npm run build
```

### CI/CD

Pull Requests lösen automatisch Lint und Build aus. Merges auf `main` deployen zusätzlich auf GitHub Pages.

Der Workflow ist in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) definiert.
