# TheReCreation — Authentisches 4X Weltraum-Strategiespiel

Ein multiplayer-fähiges, tick-basiertes Browser- und Mobile-Strategiespiel im Weltraum, inspiriert vom Klassiker *TheAmarin / The Creation*.

---

## 🌟 Hauptfunktionen

### 🌌 1. Observatorium (Galaxie-Karte)
* **7×7 Sektor-Raster**: Dynamische Kartenansicht mit Planeten, Rohstoffen und Flottenbewegungen.
* **Touch-Gesten & Galaxy Zoom**: 
  * **Wischen / Ziehen (Swipe)**: Flüssiges Verschieben der Galaxie-Koordinaten auf Touchscreens oder per Maus.
  * **Zwei-Finger-Pinch**: Stufenloser Zoom zwischen 70% und 130%.
  * **Touch-Steuerung**: Zoom-Tasten (`🔍 +`, `🔍 −`, `100%`) und ein 4-Wege-Steuerkreuz (◀ ▲ ▼ ▶) für einfache Einhand-Bedienung.
* **Klick-Navigation**: Antippen eines Sektors öffnet direkt den Raumhafen und überträgt die Zielkoordinaten automatisch in die Flottensteuerung.

### 🚀 2. Raumhafen & Flottenmanagement
* **Flottenerstellung**: Schiffe aus dem Hangar zu schlagkräftigen Flotten zusammenstellen.
* **Flottenbewegung**: Entfernungsberechnung nach Chebyshev-Distanz mit Ankunftszeiten basierend auf Flottengeschwindigkeit.
* **Flotten-Haltung**: Defensiv (reagiert nur auf Angriffe) oder Aggressiv (initiiert Gefechte).
* **Trümmerfelder**: Stationäre Flotten können Rohstoffe aus zerstörten Schiffen vor Ort bergen.

### 🔧 3. Werft & Raumschiff-Rechner
* **Prototypen entwerfen**: Beliebige Kombinationen aus Antrieben, Schilden und Waffen zusammenstellen.
  * **Antriebe**: Segel, Rakete, Ionenstrahl, Fusion, Antimaterie.
  * **Schilde**: Stahl, Aluminium, Quarz, Titan, Diamant, Kupfer, Keramik, Chrom.
  * **Waffen**: Laser, Projektil, Konventionell, EMP, Plasma, Abbaueinheit (Mining).
* **Simulationsmodus**: Berechnung von Kampfwert, Geschwindigkeit (`pc/tick`), Gewicht, Baukosten und Bauzeit auch für noch nicht erforschte Stufen (L0 wird mit Level 1 kalkuliert).
* **Produktion**: Gebaute Schiffe werden direkt dem Planeten-Raumhafen gutgeschrieben.

### 🏗️ 4. Gebäude & Einrichtungen
* **Ressourcengebäude**:
  * **Plantage**: Produziert Nahrung pro Tick.
  * **Erzmine**: Produziert Metall pro Tick.
  * **Elektrolysator**: Produziert Wasserstoff pro Tick.
* **Spezialgebäude**:
  * **Werft**: Schaltet zusätzliche Prototyp-Baupläne frei (+1 Slot pro Level).
  * **Raumhafen**: Erhöht das Flottenlimit (+1 Flotte pro Level).
  * **Forschungslabor**: Reduziert die Forschungszeit (-13% pro Level).

### 🔬 5. Forschung & Technologie
* Erforsche neue Stufen in drei Kategorien: Antriebe, Schilde und Waffen.
* Forschungszeit skaliert mit der Technologiestufe und profitiert vom Forschungslabor.

### ⚔️ 6. Kampfsystem
* Automatischer Gefechtsablauf bei Zusammentreffen feindlicher Flotten mit mindestens einer aggressiven Flotte.
* Höherer Kampfwert siegt mit proportionalen Schiffsverlusten.
* Generierung von Trümmerfeldern (20% des Bauwerts der zerstörten Schiffe).

### 👑 7. Admin-Bereich & Rundenkonfiguration
* **Neue Runde**: Vollständige Neugenerierung des Universums mit einstellbarer Spielfeldgröße (15×15 bis 50×50), Planetenanzahl, Startressourcen, Tick-Dauer und Spielerlimit.
* **Zufälliger Spawn**: Jeder Spieler startet bei Registrierung auf einem zufällig ausgewählten Planeten.
* **Einladungscodes**: Erstellung und Verwaltung von Codes mit Nutzungslimit und Ablaufzeit.

---

## 🛠️ Technologie-Stack

* **Backend**: FastAPI (Python 3.11), Motor (Async MongoDB), Pydantic, Passlib/Bcrypt, JWT (HS256).
* **Frontend**: React 19, Tailwind CSS, CRACO/Webpack, Lucide Icons.
* **Datenbank**: MongoDB (persistente Indizes für Spieler, Planeten, Flotten, Designs, Berichte).

---

## 🚀 Lokale Installation & Start

### Voraussetzungen
* Node.js 18+ und Yarn
* Python 3.11+ und `uv` oder `pip`
* Laufende MongoDB-Instanz (`localhost:27017`)

### 1. Backend starten
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### 2. Frontend starten
```bash
cd frontend
yarn install
yarn start
```
Die Weboberfläche ist anschließend unter `http://localhost:3000` (bzw. `http://localhost:5000`) erreichbar.

---

## 💾 Synchronisation mit GitHub

Um den aktuellen Stand dieses Projekts in dein GitHub-Repository zu übertragen:

1. Klicke in der Emergent-Benutzeroberfläche oben rechts auf das GitHub-Symbol oder **„Save to GitHub“**.
2. Wähle dein verknüpftes GitHub-Konto und das gewünschte Ziel-Repository (oder erstelle ein neues).
3. Wähle den Branch (z. B. `main`) und bestätige den Push. Alle aktuellen Dateien, Skripte und Dokumentationen werden direkt synchronisiert.

---

## 📄 Lizenz & Hinweise
Entwickelt mit Emergent Platform. Alle Spielmechaniken basieren auf dem klassischen Authoritative-Tick-Modell.
