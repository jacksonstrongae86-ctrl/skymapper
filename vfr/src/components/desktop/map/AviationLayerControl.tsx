// components/AviationLayerControl.tsx
import React from 'react';

type AviationLayers = {
  airports: boolean;
  airspaces: boolean;
  navigation: boolean;
  obstacles: boolean;
  hotspots: boolean;
};

interface AviationLayerControlProps {
  layers: AviationLayers;
  onLayerToggle: (layer: keyof AviationLayers, enabled: boolean) => void;
  showAviationData: boolean;
  onToggleAviationData: (enabled: boolean) => void;
}

const AviationLayerControl: React.FC<AviationLayerControlProps> = ({
  layers,
  onLayerToggle,
  showAviationData,
  onToggleAviationData,
}) => {
  return (
    <div className="aviation-layer-control">
      <div className="layer-control-header">
        <label>
          <input
            type="checkbox"
            checked={showAviationData}
            onChange={(e) => onToggleAviationData(e.target.checked)}
          />
          Show Aviation Data
        </label>
      </div>

      {showAviationData && (
        <div className="layer-control-options">
          <label>
            <input
              type="checkbox"
              checked={layers.airports}
              onChange={(e) => onLayerToggle('airports', e.target.checked)}
            />
            ✈️ Airports
          </label>

          <label>
            <input
              type="checkbox"
              checked={layers.airspaces}
              onChange={(e) => onLayerToggle('airspaces', e.target.checked)}
            />
            🛡️ Airspaces
          </label>

          <label>
            <input
              type="checkbox"
              checked={layers.navigation}
              onChange={(e) => onLayerToggle('navigation', e.target.checked)}
            />
            📡 Navigation
          </label>

          <label>
            <input
              type="checkbox"
              checked={layers.obstacles}
              onChange={(e) => onLayerToggle('obstacles', e.target.checked)}
            />
            ⚠️ Obstacles
          </label>

          <label>
            <input
              type="checkbox"
              checked={layers.hotspots}
              onChange={(e) => onLayerToggle('hotspots', e.target.checked)}
            />
            🔥 Hotspots
          </label>
        </div>
      )}
    </div>
  );
};

export default AviationLayerControl;
