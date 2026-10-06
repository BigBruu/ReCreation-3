import React, { useState } from 'react';
import { useToast } from '../../../hooks/use-toast';

const ShipyardTab = ({ shipDesigns = [], userPlanets = [], onShowCalculator, onBuildShips }) => {
  const { toast } = useToast();

  const [selectedPlanets, setSelectedPlanets] = useState({});
  const [buildQuantities, setBuildQuantities] = useState({});

  const handleBuild = async (designId) => {
    const planetId = selectedPlanets[designId] || (userPlanets.length > 0 ? userPlanets[0].id : '');
    const quantity = parseInt(buildQuantities[designId], 10) || 1;

    if (!planetId) {
      toast({
        title: 'Fehler',
        description: 'Bitte wählen Sie einen Planeten für die Produktion',
        variant: 'destructive',
      });
      return;
    }

    if (!quantity || quantity < 1) {
      toast({
        title: 'Fehler',
        description: 'Bitte geben Sie eine gültige Anzahl (mindestens 1) ein',
        variant: 'destructive',
      });
      return;
    }

    const ok = await onBuildShips(designId, planetId, quantity);
    if (ok) {
      setBuildQuantities((prev) => ({ ...prev, [designId]: 1 }));
    }
  };

  return (
    <div className="werft-content" testID="shipyard-tab-container">
      <div className="werft-header flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-blue-400">Werft — Raumschiff-Prototypen</h3>
          <p className="text-xs text-gray-400 mt-1">
            Hier können Sie Prototypen entwerfen und Schiffe im Raumhafen produzieren.
          </p>
        </div>
        <button onClick={onShowCalculator} className="btn-primary" testID="open-calculator-btn">
          Rechner — Prototypen entwerfen
        </button>
      </div>

      <div className="prototypes-list space-y-4">
        <h4 className="text-lg font-semibold text-gray-300 mb-3">
          Ihre Prototypen ({shipDesigns.length})
        </h4>

        {shipDesigns.length === 0 ? (
          <div className="bg-gray-800 p-6 rounded border border-gray-700 text-center text-gray-400">
            <p className="mb-3">Sie haben noch keine Schiff-Prototypen entworfen.</p>
            <button onClick={onShowCalculator} className="btn-primary text-sm">
              Ersten Prototyp erstellen
            </button>
          </div>
        ) : (
          shipDesigns.map((design) => {
            const currentPlanet = selectedPlanets[design.id] || (userPlanets.length > 0 ? userPlanets[0].id : '');
            const currentQty = buildQuantities[design.id] ?? 1;

            return (
              <div key={design.id} className="prototype-card bg-gray-800 p-4 rounded border border-gray-700" testID={`prototype-card-${design.id}`}>
                <div className="flex justify-between items-start mb-2">
                  <h5 className="text-lg font-bold text-white">{design.name}</h5>
                  <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded font-mono">
                    {design.calculated_stats?.speed || 1} pc/tick
                  </span>
                </div>

                <div className="prototype-stats text-sm text-gray-300 space-y-1 mb-4">
                  <div>Antrieb: {design.drive?.component_name} (L{design.drive?.level}) x{design.drive?.quantity}</div>
                  <div>Schild: {design.shield?.component_name} (L{design.shield?.level}) x{design.shield?.quantity}</div>
                  <div>Waffe: {design.weapon?.component_name} (L{design.weapon?.level}) x{design.weapon?.quantity}</div>

                  <div className="stats-row flex flex-wrap gap-4 pt-2 border-t border-gray-700 mt-2 text-xs text-gray-400 font-mono">
                    <span>Geschwindigkeit: <strong className="text-blue-300">{design.calculated_stats?.speed} pc/tick</strong></span>
                    <span>Kampfwert: <strong className="text-red-400">{design.calculated_stats?.combat_value}</strong></span>
                    {design.calculated_stats?.mining_capacity > 0 && (
                      <span>Abbau: <strong className="text-yellow-400">{design.calculated_stats?.mining_capacity}/tick</strong></span>
                    )}
                    <span>Bauzeit: <strong className="text-orange-400">{design.calculated_stats?.build_time_ticks} Ticks</strong></span>
                    <span>Gewicht: <strong className="text-gray-300">{design.calculated_stats?.total_weight}</strong></span>
                  </div>
                </div>

                {/* Production Form */}
                <div className="production-section mt-4 pt-4 border-t border-gray-700">
                  <h6 className="text-sm font-semibold text-blue-400 mb-2">Schiffe produzieren:</h6>
                  <div className="production-controls">
                    {userPlanets.length > 0 ? (
                      <div className="production-form flex flex-wrap gap-2 items-center mb-3">
                        <select
                          value={currentPlanet}
                          onChange={(e) =>
                            setSelectedPlanets((prev) => ({ ...prev, [design.id]: e.target.value }))
                          }
                          className="production-select px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                          testID={`planet-select-${design.id}`}
                        >
                          {userPlanets.map((planet) => (
                            <option key={planet.id} value={planet.id}>
                              {planet.name} ({planet.position.x}:{planet.position.y})
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          placeholder="Anzahl"
                          min="1"
                          max="1000"
                          value={currentQty}
                          onChange={(e) =>
                            setBuildQuantities((prev) => ({
                              ...prev,
                              [design.id]: Math.max(1, parseInt(e.target.value, 10) || 1),
                            }))
                          }
                          className="production-input px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm w-24 text-center"
                          testID={`build-quantity-input-${design.id}`}
                        />
                        <button
                          onClick={() => handleBuild(design.id)}
                          className="btn-success production-btn px-4 py-2 text-sm"
                          testID={`build-ship-btn-${design.id}`}
                        >
                          Im Raumhafen bauen
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">Keine Planeten verfügbar für Produktion</p>
                    )}
                  </div>

                  <div className="build-costs mt-2">
                    <h6 className="text-xs font-semibold text-gray-400 mb-1">Baukosten pro Schiff:</h6>
                    <div className="cost-display flex gap-3 text-xs">
                      <span className="resource-food bg-gray-900 px-2 py-1 rounded">
                        🌾 {design.calculated_stats?.build_cost?.food || 0}
                      </span>
                      <span className="resource-metal bg-gray-900 px-2 py-1 rounded">
                        ⚙️ {design.calculated_stats?.build_cost?.metal?.toLocaleString('de-DE') || 0}
                      </span>
                      <span className="resource-hydrogen bg-gray-900 px-2 py-1 rounded">
                        ⚡ {design.calculated_stats?.build_cost?.hydrogen?.toLocaleString('de-DE') || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ShipyardTab;
