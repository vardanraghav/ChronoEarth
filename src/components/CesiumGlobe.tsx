'use client';

import dynamic from 'next/dynamic';
import '../lib/cesium-setup';
import { EarthMode } from './CesiumGlobeContent';

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
}

const CesiumGlobeContent = dynamic(
  () => import('./CesiumGlobeContent'),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex flex-col items-center justify-center z-50" style={{ background: '#030508' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.10)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'breathe 2.5s ease-in-out infinite' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', border: '1px dashed rgba(255,255,255,0.07)' }} />
        </div>
        <p style={{ marginTop: 16, fontSize: 8, fontWeight: 300, letterSpacing: '0.4em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)' }}>
          Loading Globe
        </p>
      </div>
    ),
  }
);

export default function CesiumGlobe({
  activeYear, activeCategory, activeCity, setActiveCity, activeCountry, setActiveCountry, overlays, earthMode, activeLayers, activeSimulations, cities, focusCoords, earthquakes
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
    />
  );
}
