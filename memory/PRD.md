# Product Requirements Document (PRD) — TheReCreation

## 1. Original Problem Statement
Recreation of the 4X space strategy multiplayer game "TheReCreation".
Recent User Instructions:
- Remove all Alliance / "Allianz" references, scripts, and backlog tasks.
- Ensure every player starts randomly on a coordinate (random unowned planet / spaceport location).
- Ensure new round resources and universe parameters are configurable in the Admin area.

## 2. Architecture & Tech Stack
- **Backend**: FastAPI (Python 3.11), Motor (async MongoDB), JWT security, authoritative tick engine.
- **Frontend**: React 19, Tailwind CSS, CRACO/Webpack, responsive mobile view.
- **Database**: MongoDB with indexed collections for users, planets, fleets, ship_designs, buildings, research, battle_reports, debris_fields, invite_codes, game_config.

## 3. Implemented Features & Bug Fixes
- **Allianz Removal**: Removed all alliance-related scripts, references, and backlog items.
- **Random Start Coordinates**: Updated `services/spaceport.py` to randomly sample unowned planets across the map upon player registration, ensuring evenly distributed random spawn positions.
- **Admin Round Configuration**: Implemented & verified `/admin/new-round` and `/admin/config` APIs with frontend controls in `NewRoundTab` and `ConfigTab` (Ressourcen pro Planet, Planetenanzahl, Spielfeldgröße, Tick-Dauer, Max. Spieler).
- **Critical Bugs 1-3**: Ship Design Calculator, Building initialization, and React controlled state in Spaceport/Shipyard all resolved and verified.

## 4. Prioritized Backlog
- [P1] Mobile Bottom-Navigation Bar for one-handed mobile play.
- [P1] Moving fleet live arrival countdown timers (MM:SS).
- [P2] In-game messaging and trading center between spaceports.
