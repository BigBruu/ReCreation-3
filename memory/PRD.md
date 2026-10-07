# Product Requirements Document (PRD) — TheReCreation

## 1. Original Problem Statement
Authentic recreation and bug fix of the 4X space strategy browser game "TheReCreation".
Recent User Instructions:
- Removed all Alliance references and scripts.
- Implemented random start coordinates across unowned planets.
- Admin configurable new round parameters and resources.
- Galaxy Zoom: Made the 7x7 Observatory grid touch-pinchable, swipeable, with responsive zoom buttons and D-Pad pan navigation on mobile touch devices.

## 2. Architecture & Tech Stack
- **Backend**: FastAPI (Python 3.11), Motor (async MongoDB), JWT security, authoritative tick engine.
- **Frontend**: React 19, Tailwind CSS, CRACO/Webpack, responsive mobile-first UI with starfield canvas.
- **Database**: MongoDB with indexed collections for users, planets, fleets, ship_designs, buildings, research, battle_reports, debris_fields, invite_codes, game_config.

## 3. Implemented Features & Bug Fixes
- **Galaxy Zoom & Touch Navigation**: Integrated multi-touch pinch-to-zoom (70%–130%), one-finger touch swipe/drag panning, mouse dragging, touch-friendly zoom in/out/reset buttons, and a 4-way D-Pad (◀ ▲ ▼ ▶) with >=36px touch targets.
- **Observatory Coordinate Auto-Fill**: Tap on any grid cell navigates directly to Spaceport and auto-populates the fleet movement coordinates.
- **Random Start Coordinates**: Every player receives a uniformly distributed random unowned planet coordinate as their spaceport on registration.
- **Allianz Removal**: All alliance-related code, references, and backlog items completely removed.
- **Admin New Round & Config**: Dedicated admin tabs for universe size, planet count, resources per planet, max players, and tick duration.
- **Critical Bugs 1-3**: Ship design calculator, building initialization, and React controlled state in Spaceport/Shipyard all fixed and verified.

## 4. Prioritized Backlog
- [P1] Mobile Bottom-Navigation Bar for thumb-friendly mobile gameplay.
- [P1] Moving fleet live arrival countdown timers (MM:SS).
- [P2] In-game trade center (Handelszentrum) for direct resource exchanges.
