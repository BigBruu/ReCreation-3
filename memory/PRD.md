# Product Requirements Document (PRD) — TheReCreation

## 1. Original Problem Statement
Audit and bug fix for the 4X space strategy multiplayer game "TheReCreation", recreating the mechanics of "TheAmarin / The Creation". The user requested identification of bugs/problematic parts from previous incomplete sessions and specifically asked to resolve Critical Bugs 1-3 (Ship Design Calculator, Building initialization upon registration/login, and React state conversion for Spaceport and Shipyard).

## 2. Architecture & Tech Stack
- **Backend**: FastAPI (Python 3.11), Motor (async MongoDB), JWT security, automatic authoritative tick engine.
- **Frontend**: React 19, Tailwind CSS, CRACO/Webpack, responsive mobile-first UI with starfield canvas.
- **Database**: MongoDB with indexed collections for users, planets, fleets, ship_designs, buildings, research, battle_reports, debris_fields.

## 3. Implemented Fixes & Features (Current Iteration)
- **Bug 1 Fix (Ship Design Calculator)**: Synchronized component catalogs with `COMPONENT_LEVELS` (drives: segel, rakete, ionenstrahl, fusion, antimaterie; shields: stahl, aluminium, quarz, titan, diamant, kupfer, keramik, chrom; weapons: laser, projektil, konventionell, emp, plasma, abbaueinheit). Fixed calculation formulas for combat value, speed, weight, build time, and costs. Supported Level 0 simulation calculation.
- **Bug 2 Fix (Building Initialization)**: Added `init_user_buildings(user.id)` in `register()` and `login()` fallback to ensure all players start with valid building documents.
- **Bug 3 Fix (React Controlled State)**: Removed brittle `document.getElementById` calls in `SpaceportTab` and `ShipyardTab`. Replaced with React `useState` hooks. Fixed Observatory grid click navigation and coordinate auto-fill.
- **UI/UX Polish**: Fixed toast viewport pointer events, adjusted modal scrolling and testIDs across all interactive components.

## 4. Prioritized Backlog
- [P1] Mobile Bottom-Navigation Bar for thumb-friendly mobile gameplay.
- [P1] Live Countdown Timers for moving fleets (`HH:MM:SS` format).
- [P2] Alliance system (`Allianzen`) and in-game communication (`Kommunikation`).
- [P2] Highscore / Rangliste enhancements with activity indicators and location coordinates.
