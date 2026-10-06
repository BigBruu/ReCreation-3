import React, { useState, useEffect } from 'react';
import { useToast } from '../../../hooks/use-toast';

const SpaceportTab = ({
  spaceportShips = {},
  userFleets = [],
  shipDesigns = [],
  battleReports = [],
  debrisFields = [],
  targetCoordinates,
  setTargetCoordinates,
  onSetFleetStance,
  onCollectDebris,
  onMoveFleet,
  onCreateFleet,
}) => {
  const { toast } = useToast();

  const [fleetNames, setFleetNames] = useState({});
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [fleetCoords, setFleetCoords] = useState({});

  useEffect(() => {
    if (targetCoordinates && targetCoordinates.x !== undefined && targetCoordinates.y !== undefined) {
      const updated = {};
      userFleets.forEach((fleet) => {
        if (!fleet.movement_end_time) {
          updated[fleet.id] = {
            x: String(targetCoordinates.x),
            y: String(targetCoordinates.y),
          };
        }
      });
      setFleetCoords((prev) => ({ ...prev, ...updated }));
    }
  }, [targetCoordinates, userFleets]);

  const handleFleetNameChange = (planetId, name) => {
    setFleetNames((prev) => ({ ...prev, [planetId]: name }));
  };

  const handleShipQuantityChange = (shipId, qty, maxQty) => {
    const num = Math.max(0, Math.min(maxQty, parseInt(qty, 10) || 0));
    setSelectedQuantities((prev) => ({ ...prev, [shipId]: num }));
  };

  const handleCreateFleetSubmit = (planetData) => {
    const fleetName = (fleetNames[planetData.planet_id] || '').trim();
    if (!fleetName) {
      toast({
        title: 'Fehler',
        description: 'Bitte geben Sie einen Flottennamen ein',
        variant: 'destructive',
      });
      return;
    }

    const ships = [];
    for (const ship of planetData.ships) {
      const quantity = selectedQuantities[ship.id] || 0;
      if (quantity > 0) {
        ships.push({ design_id: ship.design_id, quantity });
      }
    }

    if (ships.length === 0) {
      toast({
        title: 'Fehler',
        description: 'Bitte wählen Sie mindestens ein Schiff für die Flotte aus',
        variant: 'destructive',
      });
      return;
    }

    onCreateFleet(planetData.planet_id, fleetName, ships);
    setFleetNames((prev) => ({ ...prev, [planetData.planet_id]: '' }));
    setSelectedQuantities((prev) => {
      const updated = { ...prev };
      planetData.ships.forEach((s) => delete updated[s.id]);
      return updated;
    });
  };

  const handleCoordChange = (fleetId, axis, val) => {
    setFleetCoords((prev) => ({
      ...prev,
      [fleetId]: {
        ...(prev[fleetId] || { x: '', y: '' }),
        [axis]: val,
      },
    }));
  };

  const handleMoveFleetSubmit = async (fleetId) => {
    const coords = fleetCoords[fleetId] || {};
    const x = parseInt(coords.x, 10);
    const y = parseInt(coords.y, 10);

    if (isNaN(x) || isNaN(y) || x < 0 || x > 46 || y < 0 || y > 46) {
      toast({
        title: 'Ungültige Koordinaten',
        description: 'Bitte geben Sie Koordinaten zwischen 0 und 46 ein',
        variant: 'destructive',
      });
      return;
    }

    const ok = await onMoveFleet(fleetId, x, y);
    if (ok && setTargetCoordinates) {
      setTargetCoordinates(null);
    }
  };

  return (
    <div className="spaceport-content" testID="spaceport-tab-container" data-testid="spaceport-tab-container">
      <h3 className="text-xl font-bold text-blue-400 mb-4">🚀 Raumhafen — Schiffe & Flotten</h3>

      <div className="spaceport-ships">
        <h4 className="text-lg font-semibold text-white mb-3">Schiffe im Raumhafen</h4>
        {Object.keys(spaceportShips).length > 0 ? (
          Object.entries(spaceportShips).map(([planetKey, planetData]) => (
            <div key={planetKey} className="spaceport-planet bg-gray-800 p-4 rounded border border-gray-700 mb-4">
              <h5 className="font-semibold text-blue-300 mb-3">
                {planetData.planet_name} ({planetData.position.x}:{planetData.position.y})
              </h5>
              <div className="spaceport-ships-list space-y-2 mb-4">
                {planetData.ships.map((ship) => (
                  <div key={ship.id} className="spaceport-ship flex justify-between items-center bg-gray-900 p-2 rounded">
                    <span className="ship-design font-medium text-white">{ship.design_name}</span>
                    <span className="ship-quantity text-blue-400 font-semibold">x{ship.quantity}</span>
                    <span className="ship-date text-xs text-gray-400">
                      {new Date(ship.created_at).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="fleet-creation mt-4 pt-4 border-t border-gray-700">
                <h6 className="text-sm font-semibold text-green-400 mb-2">Neue Flotte zusammenstellen:</h6>
                <input
                  type="text"
                  placeholder="Flottenname (z.B. Patrouille Alpha)"
                  value={fleetNames[planetData.planet_id] || ''}
                  onChange={(e) => handleFleetNameChange(planetData.planet_id, e.target.value)}
                  className="w-full px-3 py-2 mb-3 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  testID={`fleet-name-input-${planetData.planet_id}`}
                  data-testid={`fleet-name-input-${planetData.planet_id}`}
                />
                <div className="ship-selection space-y-2 mb-3">
                  {planetData.ships.map((ship) => (
                    <div key={ship.id} className="flex items-center justify-between text-sm bg-gray-900 p-2 rounded">
                      <label className="text-gray-300">{ship.design_name}:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max={ship.quantity}
                          value={selectedQuantities[ship.id] ?? 0}
                          onChange={(e) => handleShipQuantityChange(ship.id, e.target.value, ship.quantity)}
                          className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white w-20 text-center text-sm"
                          testID={`ship-qty-input-${ship.id}`}
                          data-testid={`ship-qty-input-${ship.id}`}
                        />
                        <span className="text-gray-400 text-xs">/ {ship.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleCreateFleetSubmit(planetData)}
                  className="btn-primary w-full py-2 text-sm"
                  testID={`create-fleet-btn-${planetData.planet_id}`}
                  data-testid={`create-fleet-btn-${planetData.planet_id}`}
                >
                  Flotte erstellen
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-gray-800 p-4 rounded border border-gray-700 text-gray-400 text-sm">
            Keine Schiffe im Raumhafen. Produzieren Sie Schiffe in der Werft.
          </div>
        )}
      </div>

      <div className="active-fleets mt-6">
        <h4 className="text-lg font-semibold text-white mb-3">Aktive Flotten ({userFleets.length})</h4>
        {userFleets.length === 0 ? (
          <div className="bg-gray-800 p-4 rounded border border-gray-700 text-gray-400 text-sm">
            Keine aktiven Flotten vorhanden.
          </div>
        ) : (
          userFleets.map((fleet) => {
            const coords = fleetCoords[fleet.id] || { x: '', y: '' };
            return (
              <div
                key={fleet.id}
                className={`fleet-card ${fleet.stance === 'aggressive' ? 'fleet-aggressive' : 'fleet-defensive'}`}
                testID={`fleet-card-${fleet.id}`}
                data-testid={`fleet-card-${fleet.id}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-bold text-white text-base">
                    {fleet.name}
                    {fleet.movement_end_time ? ' (unterwegs*)' : ''}
                  </h5>
                  <span className="text-xs font-mono text-gray-400 bg-gray-900 px-2 py-1 rounded">
                    ({fleet.position.x}:{fleet.position.y})
                  </span>
                </div>

                <div className="fleet-stance flex items-center gap-2 my-2 py-2 border-t border-b border-gray-700 text-sm">
                  <label className="text-gray-400">Haltung:</label>
                  <select
                    value={fleet.stance || 'defensive'}
                    onChange={(e) => onSetFleetStance(fleet.id, e.target.value)}
                    className={`stance-select ${fleet.stance === 'aggressive' ? 'stance-aggressive' : 'stance-defensive'}`}
                    testID={`fleet-stance-select-${fleet.id}`}
                    data-testid={`fleet-stance-select-${fleet.id}`}
                  >
                    <option value="defensive">🛡️ Defensiv</option>
                    <option value="aggressive">⚔️ Aggressiv</option>
                  </select>
                </div>

                <div className="fleet-ships space-y-1 mb-3">
                  {fleet.ships.map((shipGroup, i) => {
                    const design = shipDesigns.find((d) => d.id === shipGroup.design_id);
                    return (
                      <div key={i} className="fleet-ship-group text-sm text-gray-300 bg-gray-900 px-2 py-1 rounded">
                        {design?.name || 'Unbekanntes Design'}: {shipGroup.quantity} Stück
                      </div>
                    );
                  })}
                </div>

                <div className="fleet-stats text-xs text-gray-400 space-y-1">
                  <div>Geschwindigkeit: <span className="text-blue-300 font-mono">{fleet.fleet_speed} pc/tick</span></div>
                  {fleet.movement_end_time && (
                    <div className="movement-info text-orange-400 font-semibold">
                      Ankunft: {new Date(fleet.movement_end_time).toLocaleString('de-DE')}
                    </div>
                  )}
                </div>

                {!fleet.movement_end_time && (
                  <div className="fleet-movement mt-3 pt-3 border-t border-gray-700">
                    <h6 className="text-sm font-semibold text-blue-400 mb-2">Flotte bewegen:</h6>
                    <div className="movement-controls flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="X"
                        min="0"
                        max="46"
                        value={coords.x ?? ''}
                        onChange={(e) => handleCoordChange(fleet.id, 'x', e.target.value)}
                        className="coordinate-input px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white w-16 text-center text-sm"
                        testID={`fleet-${fleet.id}-x`}
                        data-testid={`fleet-${fleet.id}-x`}
                      />
                      <span className="text-gray-400 font-bold">:</span>
                      <input
                        type="number"
                        placeholder="Y"
                        min="0"
                        max="46"
                        value={coords.y ?? ''}
                        onChange={(e) => handleCoordChange(fleet.id, 'y', e.target.value)}
                        className="coordinate-input px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white w-16 text-center text-sm"
                        testID={`fleet-${fleet.id}-y`}
                        data-testid={`fleet-${fleet.id}-y`}
                      />
                      <button
                        onClick={() => handleMoveFleetSubmit(fleet.id)}
                        className="btn-primary px-4 py-1 text-sm"
                        testID={`move-fleet-btn-${fleet.id}`}
                        data-testid={`move-fleet-btn-${fleet.id}`}
                      >
                        Bewegen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {battleReports.length > 0 && (
        <div className="battle-reports-section mt-6 pt-6 border-t border-gray-700">
          <h4 className="text-xl font-bold text-red-400 mb-4">⚔️ Kampfberichte ({battleReports.length})</h4>
          <div className="battle-reports-list space-y-4">
            {battleReports.slice(0, 5).map((report) => (
              <div
                key={report.id}
                className={`battle-report ${report.winner === 'attacker' ? 'report-attacker-won' : 'report-defender-won'}`}
              >
                <div className="report-header">
                  <span className="report-tick">Tick {report.tick}</span>
                  <span className="report-position">({report.position.x}:{report.position.y})</span>
                </div>
                <div className="report-combatants">
                  <div className={`combatant attacker ${report.winner === 'attacker' ? 'winner' : 'loser'}`}>
                    <span className="combatant-name">⚔️ {report.attacker_username}</span>
                    <span className="combatant-fleet">{report.attacker_fleet_name}</span>
                    <span className="combatant-cv">KW: {report.attacker_combat_value}</span>
                    <span className="combatant-losses">
                      Verluste: {report.attacker_ships_lost.reduce((sum, s) => sum + s.quantity, 0)} Schiffe
                    </span>
                  </div>
                  <div className="vs">VS</div>
                  <div className={`combatant defender ${report.winner === 'defender' ? 'winner' : 'loser'}`}>
                    <span className="combatant-name">🛡️ {report.defender_username}</span>
                    <span className="combatant-fleet">{report.defender_fleet_name}</span>
                    <span className="combatant-cv">KW: {report.defender_combat_value}</span>
                    <span className="combatant-losses">
                      Verluste: {report.defender_ships_lost.reduce((sum, s) => sum + s.quantity, 0)} Schiffe
                    </span>
                  </div>
                </div>
                {report.debris_created && (
                  <div className="report-debris">
                    💥 Trümmerfeld: {report.debris_created.amount.toLocaleString('de-DE')} {
                      report.debris_created.resource_type === 'food' ? 'Nahrung' :
                      report.debris_created.resource_type === 'metal' ? 'Metall' : 'Wasserstoff'
                    }
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {debrisFields.length > 0 && (
        <div className="debris-section mt-6 pt-6 border-t border-gray-700">
          <h4 className="text-xl font-bold text-yellow-400 mb-4">💥 Trümmerfelder ({debrisFields.length})</h4>
          <div className="debris-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {debrisFields.map((debris) => {
              const hasFleetAtPosition = userFleets.some(
                (f) =>
                  f.position.x === debris.position.x &&
                  f.position.y === debris.position.y &&
                  !f.movement_end_time
              );
              return (
                <div key={debris.id} className="debris-card bg-gray-800 p-4 rounded border border-yellow-600 flex flex-col gap-2">
                  <div className="debris-position text-sm text-gray-400">({debris.position.x}:{debris.position.y})</div>
                  <div className="debris-amount text-lg font-semibold text-yellow-300">
                    {debris.resource_type === 'food' && '🌾'}
                    {debris.resource_type === 'metal' && '⚙️'}
                    {debris.resource_type === 'hydrogen' && '⚡'}{' '}
                    {debris.amount.toLocaleString('de-DE')} {
                      debris.resource_type === 'food' ? 'Nahrung' :
                      debris.resource_type === 'metal' ? 'Metall' : 'Wasserstoff'
                    }
                  </div>
                  {hasFleetAtPosition ? (
                    <button
                      onClick={() => onCollectDebris(debris.id)}
                      className="btn-success collect-btn mt-2"
                      testID={`collect-debris-btn-${debris.id}`}
                      data-testid={`collect-debris-btn-${debris.id}`}
                    >
                      Sammeln
                    </button>
                  ) : (
                    <span className="no-fleet-warning text-sm text-gray-500 italic">Keine Flotte vor Ort</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpaceportTab;
