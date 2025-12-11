# 📅 Stundenplan Formatter - Browser Version

Eine vollständig clientseitige Single Page Application (SPA) zum Formatieren von Eltern-Portal Stundenplänen.

## ✨ Features

- ✅ **Komplett offline** - Läuft vollständig im Browser, keine Server nötig
- ✅ **Drag & Drop** - HTML-Dateien einfach in den Browser ziehen
- ✅ **Automatische Fach-Erkennung** - Alle Fächer werden automatisch erkannt
- ✅ **Dynamische Farbanpassung** - Farben für jedes Fach individuell anpassen
- ✅ **Unbekannte Fächer** - Neue Fächer werden erkannt und können zugewiesen werden
- ✅ **Live-Vorschau** - Änderungen werden sofort angezeigt
- ✅ **LocalStorage** - Eigene Farbanpassungen werden gespeichert
- ✅ **Config Export/Import** - Konfiguration als JSON teilen
- ✅ **HTML Download** - Formatierte Stundenpläne herunterladen
- ✅ **PDF Export** - Via Browser "Drucken → PDF speichern"
- ✅ **Responsive** - Funktioniert auf Desktop, Tablet und Handy

## 🚀 Verwendung

### Methode 1: Direkt vom Dateisystem

1. Öffnen Sie `index.html` in einem modernen Browser
2. Ziehen Sie eine Eltern-Portal HTML-Datei in den Upload-Bereich
3. Passen Sie Farben nach Bedarf an
4. Laden Sie das Ergebnis herunter oder drucken Sie es als PDF

### Methode 2: Über einen Webserver

```bash
# Mit Python
cd web
python3 -m http.server 8000

# Mit PHP
cd web
php -S localhost:8000

# Mit Node.js (npx http-server)
cd web
npx http-server -p 8000
```

Dann öffnen Sie: `http://localhost:8000`

## 📋 Funktionen im Detail

### 1. HTML-Upload
- **Drag & Drop**: Datei einfach in den Bereich ziehen
- **File Picker**: Oder mit Button "Datei auswählen"
- Unterstützt: `.html` und `.htm` Dateien

### 2. Fächer-Verwaltung

#### Bekannte Fächer
- Vordefinierte Fächer mit Standardfarben
- Farben per Color-Picker anpassbar
- Änderungen werden sofort in der Vorschau angezeigt

#### Unbekannte Fächer
- Werden automatisch erkannt und hervorgehoben
- Mit einem Klick Farbe zuweisen
- Werden dann zu den bekannten Fächern hinzugefügt

#### Neue Fächer hinzufügen
1. Abkürzung eingeben (z.B. "BIO")
2. Name eingeben (z.B. "Biologie")
3. Farbe wählen
4. Textfarbe wählen (Weiß oder Schwarz)
5. "Hinzufügen" klicken

### 3. Konfiguration

#### Export
- Speichert alle Farbanpassungen als JSON
- Kann mit anderen geteilt werden
- Backup für eigene Einstellungen

#### Import
- JSON-Datei laden
- Alle gespeicherten Anpassungen werden wiederhergestellt

#### Reset
- Setzt alle Anpassungen auf Standard zurück
- Löscht LocalStorage-Daten

### 4. Export-Optionen

#### HTML herunterladen
- Standalone HTML-Datei
- Alle Styles eingebettet
- Kann direkt geöffnet werden
- Druckoptimiert

#### Drucken / PDF
- Öffnet Browser-Druckdialog
- Option "Als PDF speichern"
- Optimiert für A4 Hochformat
- Perfekt für Ausdrucke

## 🎨 Standard-Fächer & Farben

| Fach | Farbe | Erkennungsmuster |
|------|-------|------------------|
| Sport (DSU) | Grün (#548235) | DSU, SW, SM, SKD |
| Französisch (F) | Blau (#305496) | F, F/, /F |
| Latein (L) | Blau (#305496) | L, L/, /L |
| Mathematik (M) | Hellblau (#8EA9DB) | M, M/, M_ |
| Geschichte (G) | Schwarz (#000000) | G, G/, G_ |
| Englisch (E) | Orange (#FFC000) | E, E/, E_ |
| Deutsch (D) | Rot (#E74748) | D, D/, D_ |
| NuT | Hellgrün (#00B050) | NUT, NWT, NWA |
| Geographie | Braun (#C65911) | GEO |
| Klassenstunde | Grau (#D9D9D9) | STD |
| Kunst | Lila (#7030A0) | KU |
| Musik | Pink (#F45FED) | MU |
| Religion/Ethik | Hellgrau (#E7E6E6) | EV, ETH, K |

## 💾 LocalStorage

Die App speichert automatisch:
- Alle Farbanpassungen
- Selbst hinzugefügte Fächer
- Bleibt erhalten bei erneutem Besuch

Zum Löschen:
1. Browser-Entwicklertools öffnen (F12)
2. Console-Tab
3. Eingeben: `localStorage.clear()`

## 🌐 Browser-Kompatibilität

Funktioniert in allen modernen Browsern:
- ✅ Chrome/Edge (ab Version 90)
- ✅ Firefox (ab Version 88)
- ✅ Safari (ab Version 14)
- ✅ Opera (ab Version 76)

## 📱 Mobile Nutzung

Die App ist vollständig responsive und funktioniert auch auf:
- Smartphones (iOS & Android)
- Tablets
- Touch-Geräte

## 🔧 Technische Details

### Technologie-Stack
- **HTML5** - Struktur
- **CSS3** - Styling mit Flexbox & Grid
- **Vanilla JavaScript** - Keine Abhängigkeiten!

### APIs verwendet
- `FileReader API` - Datei-Upload
- `DOMParser` - HTML-Parsing
- `localStorage` - Persistenz
- `Blob & URL.createObjectURL` - Download
- `window.print()` - PDF-Export

### Datenschutz
- ✅ **100% clientseitig** - Keine Daten verlassen Ihren Browser
- ✅ **Keine Server-Kommunikation**
- ✅ **Keine Cookies**
- ✅ **Open Source**

## 🆚 Vergleich Python vs. Browser Version

| Feature | Python | Browser |
|---------|--------|---------|
| Installation | uv + System-Libs | Keine |
| PDF-Generierung | WeasyPrint | Browser Print |
| Offline-Nutzung | ✅ | ✅ |
| Plattform | macOS/Linux | Alle mit Browser |
| Farbanpassung | Code editieren | UI mit Live-Preview |
| Geschwindigkeit | Schnell | Sofort |
| Teilbar | Nein | Ja (3 Dateien) |

## 📦 Deployment

### Als Zip teilen
```bash
cd web
zip -r stundenplan-formatter.zip *
```

### Auf GitHub Pages
1. Repository erstellen
2. `web/` Inhalt hochladen
3. GitHub Pages aktivieren
4. Fertig!

### Auf eigenem Server
Einfach `web/` Ordner auf einen Webserver kopieren.

## 🐛 Problemlösung

### "Keine Stundenplan-Tabelle gefunden"
- Stellen Sie sicher, dass die HTML-Datei vom Eltern-Portal ist
- Die Tabelle muss die Klassen `table-condensed` und `table-bordered` haben

### Farben werden nicht gespeichert
- LocalStorage im Browser aktiviert?
- Privater Modus deaktiviert?
- Cookies/Site-Daten erlaubt?

### Preview zeigt nichts
- Browser-Console öffnen (F12)
- JavaScript-Fehler prüfen
- Browser aktualisieren

## 📄 Lizenz

Für den persönlichen Gebrauch bestimmt.

## 🤝 Beitragen

Verbesserungsvorschläge? 
1. Issue erstellen
2. Fork erstellen
3. Pull Request senden

---

**Viel Erfolg beim Formatieren Ihrer Stundenpläne! 📚✨**
