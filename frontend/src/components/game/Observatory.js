import React, { useState, useRef, useCallback } from 'react';

const PLANET_COLORS = {
  green: { core: '#22c55e', edge: '#14532d', label: '#86efac' },
  blue: { core: '#3b82f6', edge: '#1e3a8a', label: '#93c5fd' },
  brown: { core: '#d97706', edge: '#78350f', label: '#fcd34d' },
  orange: { core: '#fb923c', edge: '#7c2d12', label: '#fdba74' },
};

const PlanetSprite = ({ type, size = 32 }) => {
  const c = PLANET_COLORS[type] || PLANET_COLORS.green;
  const r = size / 2;
  const isRinged = type === 'orange';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="planet-sprite pointer-events-none">
      <defs>
        <radialGradient id={`grad-${type}`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor={c.core} stopOpacity="1" />
          <stop offset="60%" stopColor={c.core} stopOpacity="0.95" />
          <stop offset="100%" stopColor={c.edge} stopOpacity="1" />
        </radialGradient>
        <radialGradient id={`glow-${type}`} cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor={c.core} stopOpacity="0.25" />
          <stop offset="100%" stopColor={c.core} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={r} cy={r} r={r} fill={`url(#glow-${type})`} />
      {isRinged && (
        <ellipse
          cx={r}
          cy={r}
          rx={r * 0.95}
          ry={r * 0.25}
          fill="none"
          stroke={c.label}
          strokeWidth="1.5"
          opacity="0.85"
          transform={`rotate(-18 ${r} ${r})`}
        />
      )}
      <circle cx={r} cy={r} r={r * 0.62} fill={`url(#grad-${type})`} />
      {isRinged && (
        <ellipse
          cx={r}
          cy={r}
          rx={r * 0.95}
          ry={r * 0.25}
          fill="none"
          stroke={c.label}
          strokeWidth="1.5"
          opacity="0.85"
          strokeDasharray="22 100"
          strokeDashoffset="-46"
          transform={`rotate(-18 ${r} ${r})`}
        />
      )}
    </svg>
  );
};

const Observatory = ({
  centerPosition,
  onPositionChange,
  view = {},
  onFieldClick,
  userFleets = [],
  userPlanets = [],
  onNavigateToSpaceport,
  currentUsername,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1.0);

  const touchStartRef = useRef(null);
  const pinchDistRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartPosRef = useRef(null);

  const shiftCoordinates = useCallback((dx, dy) => {
    onPositionChange((prev) => {
      const newX = Math.max(0, Math.min(46, prev.x + dx));
      const newY = Math.max(0, Math.min(46, prev.y + dy));
      return { x: newX, y: newY };
    });
  }, [onPositionChange]);

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
      pinchDistRef.current = null;
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchDistRef.current = dist;
      touchStartRef.current = null;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && pinchDistRef.current !== null) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const diff = currentDist - pinchDistRef.current;
      if (Math.abs(diff) > 15) {
        const factor = diff > 0 ? 0.05 : -0.05;
        setZoomLevel((prev) => Math.max(0.7, Math.min(1.3, Math.round((prev + factor) * 100) / 100)));
        pinchDistRef.current = currentDist;
      }
      return;
    }

    if (e.touches.length === 1 && touchStartRef.current) {
      const deltaX = e.touches[0].clientX - touchStartRef.current.x;
      const deltaY = e.touches[0].clientY - touchStartRef.current.y;
      const threshold = 40;

      if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
        let stepX = 0;
        let stepY = 0;

        if (Math.abs(deltaX) > threshold) stepX = deltaX < 0 ? 1 : -1;
        if (Math.abs(deltaY) > threshold) stepY = deltaY < 0 ? 1 : -1;

        shiftCoordinates(stepX, stepY);
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          time: Date.now(),
        };
      }
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
    pinchDistRef.current = null;
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !dragStartPosRef.current) return;
    const deltaX = e.clientX - dragStartPosRef.current.x;
    const deltaY = e.clientY - dragStartPosRef.current.y;
    const threshold = 45;

    if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
      let stepX = 0;
      let stepY = 0;
      if (Math.abs(deltaX) > threshold) stepX = deltaX < 0 ? 1 : -1;
      if (Math.abs(deltaY) > threshold) stepY = deltaY < 0 ? 1 : -1;

      shiftCoordinates(stepX, stepY);
      dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    dragStartPosRef.current = null;
  };

  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 0.05 : -0.05;
      setZoomLevel((prev) => Math.max(0.7, Math.min(1.3, Math.round((prev + factor) * 100) / 100)));
    }
  };

  const renderField = (x, y) => {
    const key = `${x},${y}`;
    const fieldData = view[key] || { planet: null, fleets: [] };
    const { planet, fleets } = fieldData;

    const centerX = Math.floor(centerPosition.x);
    const centerY = Math.floor(centerPosition.y);
    const isCenter = x === centerX && y === centerY;

    let ownership = 'neutral';
    if (planet && planet.owner_username) {
      ownership = planet.owner_username === currentUsername ? 'own' : 'enemy';
    }

    const dominantResource = planet
      ? Math.max(planet.resources.food || 0, planet.resources.metal || 0, planet.resources.hydrogen || 0)
      : 0;

    const labelColorClass =
      ownership === 'own' ? 'label-own' : ownership === 'enemy' ? 'label-enemy' : 'label-neutral';

    const spriteSize = Math.round(32 * zoomLevel);

    return (
      <div
        key={key}
        className={`obs-cell ${planet ? 'has-planet' : 'empty'} ${isCenter ? 'center-cell' : ''}`}
        onClick={() => onFieldClick(x, y, fieldData)}
        title={`(${x}:${y}) ${planet ? planet.name : 'Leerer Raum'}${
          fleets.length ? ` - ${fleets.length} Flotte(n)` : ''
        }`}
        testID={`obs-cell-${x}-${y}`}
        data-testid={`obs-cell-${x}-${y}`}
        style={{
          height: `${Math.round(72 * zoomLevel)}px`,
        }}
      >
        <div className="obs-coord">{x}:{y}</div>

        {planet && (
          <div className={`obs-planet-wrap owner-${ownership}`}>
            <div className={`obs-label obs-label-top ${labelColorClass}`}>
              {planet.owner_username || planet.name}
            </div>
            <PlanetSprite type={planet.planet_type} size={spriteSize} />
            <div className={`obs-label obs-label-bottom ${labelColorClass}`}>
              {dominantResource.toLocaleString('de-DE')}
            </div>
          </div>
        )}

        {fleets.length > 0 && (
          <div className="obs-fleets">
            {fleets.slice(0, 3).map((fleet, i) => (
              <span key={i} className="obs-fleet-tag" title={fleet.name}>
                F.{i + 1}
                {fleet.movement_end_time ? '*' : ''}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="observatory-container"
      testID="observatory-container"
      data-testid="observatory-container"
    >
      <div className="observatory-header mb-2 pb-2 border-b border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-blue-400">Observatorium</h3>
            <span className="font-mono text-sm font-bold text-yellow-300 bg-gray-800 px-2 py-0.5 rounded border border-blue-500">
              ({centerPosition.x}:{centerPosition.y})
            </span>
          </div>

          {/* Compact Zoom Controls */}
          <div className="flex items-center gap-1.5 bg-gray-800 px-2 py-1 rounded border border-gray-700 text-xs">
            <button
              onClick={() => setZoomLevel((prev) => Math.max(0.7, Math.round((prev - 0.1) * 10) / 10))}
              className="bg-gray-700 hover:bg-gray-600 px-2 py-0.5 rounded text-white font-bold"
              testID="zoom-out-btn"
              data-testid="zoom-out-btn"
              title="Zoom verkleinern"
            >
              🔍 −
            </button>
            <span className="font-mono text-xs text-blue-300 w-10 text-center" testID="zoom-level-indicator" data-testid="zoom-level-indicator">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((prev) => Math.min(1.3, Math.round((prev + 0.1) * 10) / 10))}
              className="bg-gray-700 hover:bg-gray-600 px-2 py-0.5 rounded text-white font-bold"
              testID="zoom-in-btn"
              data-testid="zoom-in-btn"
              title="Zoom vergrößern"
            >
              🔍 +
            </button>
            <button
              onClick={() => setZoomLevel(1.0)}
              className="bg-gray-700 hover:bg-gray-600 px-1.5 py-0.5 rounded text-gray-300"
              testID="zoom-reset-btn"
              data-testid="zoom-reset-btn"
            >
              100%
            </button>
          </div>
        </div>

        {/* Navigation & D-Pad row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  const fleet = userFleets.find((f) => f.id === e.target.value);
                  if (fleet) {
                    onPositionChange({ x: fleet.position.x, y: fleet.position.y });
                  }
                }
              }}
              value=""
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs max-w-36"
              testID="jump-to-fleet-select"
              data-testid="jump-to-fleet-select"
            >
              <option value="">Zu Flotte...</option>
              {userFleets.map((fleet) => (
                <option key={fleet.id} value={fleet.id}>
                  {fleet.name} ({fleet.position.x}:{fleet.position.y})
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (userPlanets.length > 0) {
                  const sp = userPlanets[0];
                  onPositionChange({ x: sp.position.x, y: sp.position.y });
                  if (onNavigateToSpaceport) onNavigateToSpaceport();
                }
              }}
              className="btn-secondary px-2 py-1 text-xs whitespace-nowrap"
              testID="jump-to-spaceport-btn"
              data-testid="jump-to-spaceport-btn"
            >
              🚀 Raumhafen
            </button>
          </div>

          {/* D-Pad Buttons */}
          <div className="flex items-center gap-1 bg-gray-800 p-0.5 rounded border border-gray-700">
            <button
              onClick={() => shiftCoordinates(-1, 0)}
              className="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white"
              testID="pan-left-btn"
              data-testid="pan-left-btn"
              title="Nach links"
            >
              ◀
            </button>
            <button
              onClick={() => shiftCoordinates(0, -1)}
              className="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white"
              testID="pan-up-btn"
              data-testid="pan-up-btn"
              title="Nach oben"
            >
              ▲
            </button>
            <button
              onClick={() => shiftCoordinates(0, 1)}
              className="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white"
              testID="pan-down-btn"
              data-testid="pan-down-btn"
              title="Nach unten"
            >
              ▼
            </button>
            <button
              onClick={() => shiftCoordinates(1, 0)}
              className="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white"
              testID="pan-right-btn"
              data-testid="pan-right-btn"
              title="Nach rechts"
            >
              ▶
            </button>
          </div>
        </div>
      </div>

      {/* Swipeable & Pinchable Starfield Grid */}
      <div
        className="obs-starfield select-none touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isDraggingRef.current ? 'grabbing' : 'grab' }}
      >
        <div
          className="obs-grid"
          style={{
            gridTemplateColumns: `22px repeat(7, minmax(0, 1fr))`,
          }}
        >
          <div className="obs-row obs-header-row">
            <div className="obs-axis-corner"></div>
            {Array.from({ length: 7 }, (_, col) => {
              const x = centerPosition.x - 3 + col;
              return (
                <div key={col} className="obs-col-label">
                  {x >= 0 && x < 47 ? x : ''}
                </div>
              );
            })}
          </div>

          {Array.from({ length: 7 }, (_, row) => {
            const y = centerPosition.y - 3 + row;
            return (
              <div key={row} className="obs-row">
                <div className="obs-row-label">{y >= 0 && y < 47 ? y : ''}</div>
                {Array.from({ length: 7 }, (_, col) => {
                  const x = centerPosition.x - 3 + col;
                  if (x >= 0 && x < 47 && y >= 0 && y < 47) {
                    return renderField(x, y);
                  }
                  return <div key={col} className="obs-cell empty" style={{ height: `${Math.round(72 * zoomLevel)}px` }} />;
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="observatory-legend flex flex-wrap gap-3 text-xs text-gray-300 mt-2 pt-2 border-t border-gray-700">
        <div className="legend-item flex items-center gap-1">
          <PlanetSprite type="green" size={14} />
          <span>Nahrung</span>
        </div>
        <div className="legend-item flex items-center gap-1">
          <PlanetSprite type="blue" size={14} />
          <span>Wasserstoff</span>
        </div>
        <div className="legend-item flex items-center gap-1">
          <PlanetSprite type="brown" size={14} />
          <span>Metall</span>
        </div>
        <div className="legend-item flex items-center gap-1">
          <PlanetSprite type="orange" size={14} />
          <span>Wasserstoff</span>
        </div>
      </div>
    </div>
  );
};

export default Observatory;
