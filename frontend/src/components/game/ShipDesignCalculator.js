import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/use-toast';

const COMPONENT_DEFAULTS = {
  drives: {
    segel: { name: 'Segel', speed_base: 200, weight: 20, levels: [1, 2, 3, 4, 5] },
    rakete: { name: 'Rakete', speed_base: 20, weight: 2, levels: [1, 2, 3] },
    ionenstrahl: { name: 'Ionenstrahl', speed_base: 350, weight: 50, levels: [1, 2, 3, 4] },
    fusion: { name: 'Fusion', speed_base: 2000, weight: 500, levels: [1, 2, 3, 4, 5, 6] },
    antimaterie: { name: 'Antimaterie', speed_base: 10000, weight: 1000, levels: [1, 2, 3, 4, 5, 6, 7] },
  },
  shields: {
    stahl: { name: 'Stahl', defense_base: 5, weight: 2, levels: [1, 2, 3, 4, 5] },
    aluminium: { name: 'Aluminium', defense_base: 5, weight: 1, levels: [1, 2, 3, 4, 5] },
    quarz: { name: 'Quarz', defense_base: 20, weight: 5, levels: [1, 2, 3, 4, 5, 6] },
    titan: { name: 'Titan', defense_base: 70, weight: 50, levels: [1, 2, 3, 4, 5, 6] },
    diamant: { name: 'Diamant', defense_base: 25, weight: 20, levels: [1, 2, 3, 4, 5, 6] },
    kupfer: { name: 'Kupfer', defense_base: 500, weight: 400, levels: [1, 2, 3, 4, 5, 6] },
    keramik: { name: 'Keramik', defense_base: 1500, weight: 600, levels: [1, 2, 3, 4, 5, 6] },
    chrom: { name: 'Chrom', defense_base: 200, weight: 150, levels: [1, 2, 3, 4, 5, 6] },
  },
  weapons: {
    laser: { name: 'Laser', attack_base: 20, weight: 60, levels: [1, 2, 3, 4, 5, 6] },
    projektil: { name: 'Projektil', attack_base: 7, weight: 1, levels: [1, 2, 3, 4] },
    konventionell: { name: 'Konventionell', attack_base: 60, weight: 50, levels: [1, 2, 3, 4, 5] },
    emp: { name: 'EMP', attack_base: 25, weight: 150, levels: [1, 2, 3, 4, 5, 6] },
    plasma: { name: 'Plasma', attack_base: 50, weight: 250, levels: [1, 2, 3, 4, 5, 6] },
    abbaueinheit: { name: 'Abbaueinheit', attack_base: 10, weight: 2000, mining_base: 100, levels: [1, 2, 3, 4, 5] },
  },
};

const ShipDesignCalculator = ({ onClose, onSave, componentLevels, userResearch }) => {
  const { toast } = useToast();

  const getResearchedLevel = (category, techKey) => {
    if (!userResearch?.research_levels) return 0;
    const tech = userResearch.research_levels.find(
      (t) => t.category === category && t.technology === techKey
    );
    return tech ? tech.level : 0;
  };

  const getInitialComponent = (category, fallback) => {
    if (userResearch?.research_levels) {
      const researched = userResearch.research_levels.filter(
        (t) => t.category === category && t.level > 0
      );
      if (researched.length > 0) {
        researched.sort((a, b) => b.level - a.level);
        return { type: researched[0].technology, level: researched[0].level };
      }
    }
    return { type: fallback, level: 1 };
  };

  const initialDrive = getInitialComponent('drives', 'segel');
  const initialShield = getInitialComponent('shields', 'stahl');
  const initialWeapon = getInitialComponent('weapons', 'laser');

  const [design, setDesign] = useState({
    name: '',
    drive_type: initialDrive.type,
    drive_level: initialDrive.level,
    drive_quantity: 1,
    shield_type: initialShield.type,
    shield_level: initialShield.level,
    shield_quantity: 1,
    weapon_type: initialWeapon.type,
    weapon_level: initialWeapon.level,
    weapon_quantity: 1,
  });

  // When component type changes, update level based on research (or default to 1 for calculation simulation)
  useEffect(() => {
    const driveRes = getResearchedLevel('drives', design.drive_type);
    const shieldRes = getResearchedLevel('shields', design.shield_type);
    const weaponRes = getResearchedLevel('weapons', design.weapon_type);

    setDesign((prev) => ({
      ...prev,
      drive_level: driveRes > 0 ? driveRes : 1,
      shield_level: shieldRes > 0 ? shieldRes : 1,
      weapon_level: weaponRes > 0 ? weaponRes : 1,
    }));
  }, [design.drive_type, design.shield_type, design.weapon_type, userResearch]);

  // Retrieve metadata
  const drivesCatalog = componentLevels?.drives || COMPONENT_DEFAULTS.drives;
  const shieldsCatalog = componentLevels?.shields || COMPONENT_DEFAULTS.shields;
  const weaponsCatalog = componentLevels?.weapons || COMPONENT_DEFAULTS.weapons;

  const driveData = drivesCatalog[design.drive_type] || COMPONENT_DEFAULTS.drives.segel;
  const shieldData = shieldsCatalog[design.shield_type] || COMPONENT_DEFAULTS.shields.stahl;
  const weaponData = weaponsCatalog[design.weapon_type] || COMPONENT_DEFAULTS.weapons.laser;

  // Calculate stats matching backend formula exactly (backend/services/ships.py)
  const driveWeight = (driveData.weight || 20) * (design.drive_quantity || 1);
  const shieldWeight = (shieldData.weight || 2) * (design.shield_quantity || 1);
  const weaponWeight = (weaponData.weight || 60) * (design.weapon_quantity || 1);
  const totalWeight = driveWeight + shieldWeight + weaponWeight;

  const baseSpeed = (driveData.speed_base || 200) * design.drive_level * (design.drive_quantity || 1);
  const speed = Math.max(1, Math.floor(baseSpeed / Math.max(1, totalWeight / 100)));

  const attackPower = (weaponData.attack_base || 20) * design.weapon_level * (design.weapon_quantity || 1);
  const defensePower = (shieldData.defense_base || 5) * design.shield_level * (design.shield_quantity || 1);
  const combatValue = attackPower + defensePower;

  const miningCapacity = weaponData.mining_base
    ? weaponData.mining_base * design.weapon_level * (design.weapon_quantity || 1)
    : 0;

  const baseFoodCost = 0;
  const baseMetalCost =
    (driveWeight + weaponWeight) * design.drive_level * 10 +
    (shieldWeight + weaponWeight) * design.shield_level * 5;
  const baseHydrogenCost = weaponWeight * design.weapon_level * 2;

  const buildTimeTicks =
    Math.max(1, Math.floor(totalWeight / 100)) +
    design.drive_level +
    design.shield_level +
    design.weapon_level;

  const handleSave = () => {
    if (!design.name.trim()) {
      toast({
        title: 'Fehler',
        description: 'Bitte geben Sie einen Namen für den Prototyp ein',
        variant: 'destructive',
      });
      return;
    }

    onSave({
      name: design.name.trim(),
      drive_type: design.drive_type,
      drive_level: design.drive_level,
      drive_quantity: parseInt(design.drive_quantity, 10) || 1,
      shield_type: design.shield_type,
      shield_level: design.shield_level,
      shield_quantity: parseInt(design.shield_quantity, 10) || 1,
      weapon_type: design.weapon_type,
      weapon_level: design.weapon_level,
      weapon_quantity: parseInt(design.weapon_quantity, 10) || 1,
    });
  };

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ship-calculator" testID="ship-design-calculator-modal">
        <div className="calculator-header">
          <div>
            <h3 className="text-xl font-bold text-blue-400">Rechner — Prototypen entwerfen</h3>
            <p className="text-xs text-gray-400 mt-1">
              Bei noch nicht erforschten Technologien (L0) wird bei der Kostenberechnung Level 1 angenommen.
            </p>
          </div>
          <button onClick={onClose} className="close-btn" testID="close-calculator-btn">
            ×
          </button>
        </div>

        <div className="calculator-content">
          <div className="design-inputs space-y-4">
            <div className="input-group">
              <label className="text-sm font-medium text-gray-300">Prototyp-Name:</label>
              <input
                type="text"
                value={design.name}
                onChange={(e) => setDesign({ ...design, name: e.target.value })}
                placeholder="z.B. Raider Mk1"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                testID="prototype-name-input"
              />
            </div>

            {/* Drive Component */}
            <div className="component-section bg-gray-800 p-3 rounded border border-gray-700">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">🚀 Antrieb</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Typ:</label>
                  <select
                    value={design.drive_type}
                    onChange={(e) => setDesign({ ...design, drive_type: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                    testID="drive-type-select"
                  >
                    {Object.keys(drivesCatalog).map((key) => {
                      const resLevel = getResearchedLevel('drives', key);
                      const label = COMPONENT_DEFAULTS.drives[key]?.name || key;
                      return (
                        <option key={key} value={key}>
                          {label} (L{resLevel > 0 ? resLevel : 0})
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Level (berechnet):</label>
                  <div className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm font-mono text-center text-blue-300">
                    L{design.drive_level}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Anzahl:</label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={design.drive_quantity}
                    onChange={(e) =>
                      setDesign({
                        ...design,
                        drive_quantity: Math.max(1, parseInt(e.target.value, 10) || 1),
                      })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm text-center"
                    testID="drive-quantity-input"
                  />
                </div>
              </div>
            </div>

            {/* Shield Component */}
            <div className="component-section bg-gray-800 p-3 rounded border border-gray-700">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">🛡️ Schild</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Typ:</label>
                  <select
                    value={design.shield_type}
                    onChange={(e) => setDesign({ ...design, shield_type: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                    testID="shield-type-select"
                  >
                    {Object.keys(shieldsCatalog).map((key) => {
                      const resLevel = getResearchedLevel('shields', key);
                      const label = COMPONENT_DEFAULTS.shields[key]?.name || key;
                      return (
                        <option key={key} value={key}>
                          {label} (L{resLevel > 0 ? resLevel : 0})
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Level (berechnet):</label>
                  <div className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm font-mono text-center text-blue-300">
                    L{design.shield_level}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Anzahl:</label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={design.shield_quantity}
                    onChange={(e) =>
                      setDesign({
                        ...design,
                        shield_quantity: Math.max(1, parseInt(e.target.value, 10) || 1),
                      })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm text-center"
                    testID="shield-quantity-input"
                  />
                </div>
              </div>
            </div>

            {/* Weapon Component */}
            <div className="component-section bg-gray-800 p-3 rounded border border-gray-700">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">⚔️ Waffe</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Typ:</label>
                  <select
                    value={design.weapon_type}
                    onChange={(e) => setDesign({ ...design, weapon_type: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                    testID="weapon-type-select"
                  >
                    {Object.keys(weaponsCatalog).map((key) => {
                      const resLevel = getResearchedLevel('weapons', key);
                      const label = COMPONENT_DEFAULTS.weapons[key]?.name || key;
                      return (
                        <option key={key} value={key}>
                          {label} (L{resLevel > 0 ? resLevel : 0})
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Level (berechnet):</label>
                  <div className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm font-mono text-center text-blue-300">
                    L{design.weapon_level}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Anzahl:</label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={design.weapon_quantity}
                    onChange={(e) =>
                      setDesign({
                        ...design,
                        weapon_quantity: Math.max(1, parseInt(e.target.value, 10) || 1),
                      })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm text-center"
                    testID="weapon-quantity-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Overview */}
          <div className="space-y-4">
            <div className="calculated-stats bg-gray-800 p-4 rounded border border-gray-700">
              <h4 className="text-sm font-semibold text-green-400 mb-3 uppercase tracking-wider">
                Berechnete Schiffswerte
              </h4>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-700">
                    <td className="py-1 text-gray-400">Beschleunigung:</td>
                    <td className="py-1 text-right font-mono font-bold text-white">{baseSpeed.toLocaleString('de-DE')}</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-1 text-gray-400">Kampfwert:</td>
                    <td className="py-1 text-right font-mono font-bold text-red-400">{combatValue.toLocaleString('de-DE')}</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-1 text-gray-400">Geschwindigkeit:</td>
                    <td className="py-1 text-right font-mono font-bold text-blue-400">{speed} pc/tick</td>
                  </tr>
                  {miningCapacity > 0 && (
                    <tr className="border-b border-gray-700">
                      <td className="py-1 text-gray-400">Abbaukapazität:</td>
                      <td className="py-1 text-right font-mono font-bold text-yellow-400">{miningCapacity} Ressourcen/Tick</td>
                    </tr>
                  )}
                  <tr className="border-b border-gray-700">
                    <td className="py-1 text-gray-400">Gesamtgewicht:</td>
                    <td className="py-1 text-right font-mono font-bold text-gray-300">{totalWeight.toLocaleString('de-DE')}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-400">Bauzeit:</td>
                    <td className="py-1 text-right font-mono font-bold text-orange-400">{buildTimeTicks} Ticks</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <h4 className="text-sm font-semibold text-blue-400 mb-2 uppercase tracking-wider">
                Baukosten pro Schiff
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-gray-900 p-2 rounded">
                  <div className="text-gray-400 mb-1">Nahrung</div>
                  <div className="font-bold text-green-400 font-mono">{baseFoodCost}</div>
                </div>
                <div className="bg-gray-900 p-2 rounded">
                  <div className="text-gray-400 mb-1">Metall</div>
                  <div className="font-bold text-gray-200 font-mono">{baseMetalCost.toLocaleString('de-DE')}</div>
                </div>
                <div className="bg-gray-900 p-2 rounded">
                  <div className="text-gray-400 mb-1">Wasserstoff</div>
                  <div className="font-bold text-purple-400 font-mono">{baseHydrogenCost.toLocaleString('de-DE')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="calculator-actions mt-6 pt-4 border-t border-gray-700 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary" testID="cancel-prototype-btn">
            Abbrechen
          </button>
          <button onClick={handleSave} className="btn-primary" testID="save-prototype-btn">
            Prototyp speichern
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShipDesignCalculator;
