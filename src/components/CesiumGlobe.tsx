'use client';

import CesiumGlobeContent, { EarthMode } from './CesiumGlobeContent';

interface CesiumGlobeProps {
  activeYear:        number;
  activeCategory:    string;
  activeCity:        any;
  setActiveCity:     (city: any) => void;
  activeCountry:     string | null;
  setActiveCountry:  (code: string | null) => void;
  overlays:          { climate: boolean; pollution: boolean; energy: boolean; satellite: boolean; ai: boolean };
  earthMode:         EarthMode;
  activeLayers:      {
    cities: boolean;
    climate: boolean;
    tech: boolean;
    energy: boolean;
    space: boolean;
    geopolitical: boolean;
    seismic?: boolean;
    markets?: boolean;
  };
  activeSimulations: {
    seaLevelRise: number;
    fusionBreakthrough: boolean;
    agiEmergence: boolean;
    popDecline: boolean;
    renewableTransition: boolean;
    arcticDominance: boolean;
    semiDisruptions: boolean;
  };
  cities?: any[];
  focusCoords?: { lat: number; lon: number; height?: number } | null;
  earthquakes?: any[];
  onEarthReady?: () => void;
}



export default function CesiumGlobe({
  activeYear, activeCategory, activeCity, setActiveCity, activeCountry, setActiveCountry, overlays, earthMode, activeLayers, activeSimulations, cities, focusCoords, earthquakes, onEarthReady
}: CesiumGlobeProps) {
  return (
    <CesiumGlobeContent
      activeYear={activeYear}
      activeCategory={activeCategory}
      activeCity={activeCity}
      setActiveCity={setActiveCity}
      activeCountry={activeCountry}
      setActiveCountry={setActiveCountry}
      overlays={overlays}
      earthMode={earthMode}
      activeLayers={activeLayers}
      activeSimulations={activeSimulations}
      cities={cities}
      focusCoords={focusCoords}
      earthquakes={earthquakes}
      onEarthReady={onEarthReady}
    />
  );
}
