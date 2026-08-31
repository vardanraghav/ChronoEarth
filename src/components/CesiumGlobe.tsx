'use client';

import { useState, useEffect } from 'react';
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

export default function CesiumGlobe(props: CesiumGlobeProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Check if Cesium is already initialized globally
    if ((window as any).Cesium) {
      setLoaded(true);
      return;
    }

    // 1. Check if the script is already injected but still loading
    const existingScript = document.getElementById('cesium-global-script') as HTMLScriptElement;
    if (existingScript) {
      const handleLoad = () => {
        setLoaded(true);
      };
      existingScript.addEventListener('load', handleLoad);
      return () => {
        existingScript.removeEventListener('load', handleLoad);
      };
    }

    // 2. Inject widgets.css stylesheet if not present
    if (!document.getElementById('cesium-widgets-style')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/cesium/Widgets/widgets.css';
      link.id = 'cesium-widgets-style';
      document.head.appendChild(link);
    }

    // 3. Inject Cesium.js script
    const script = document.createElement('script');
    script.src = '/cesium/Cesium.js';
    script.id = 'cesium-global-script';
    script.async = true;
    
    const handleScriptLoad = () => {
      // Set window base URL for Cesium assets
      (window as any).CESIUM_BASE_URL = '/cesium/';
      const ionToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || '';
      if ((window as any).Cesium) {
        (window as any).Cesium.Ion.defaultAccessToken = ionToken;
      }
      setLoaded(true);
    };

    script.addEventListener('load', handleScriptLoad);
    document.body.appendChild(script);

    return () => {
      script.removeEventListener('load', handleScriptLoad);
    };
  }, []);

  if (!loaded) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#02060A]/95 z-50 gap-4 font-mono text-xs uppercase tracking-[0.25em]">
        <div className="w-10 h-10 border border-[#00F5B0]/20 border-t-[#00F5B0] rounded-full animate-spin" />
        <span>BOOTING PLANETARY INFRASTRUCTURE GRID…</span>
      </div>
    );
  }

  return (
    <CesiumGlobeContent
      activeYear={props.activeYear}
      activeCategory={props.activeCategory}
      activeCity={props.activeCity}
      setActiveCity={props.setActiveCity}
      activeCountry={props.activeCountry}
      setActiveCountry={props.setActiveCountry}
      overlays={props.overlays}
      earthMode={props.earthMode}
      activeLayers={props.activeLayers}
      activeSimulations={props.activeSimulations}
      cities={props.cities}
      focusCoords={props.focusCoords}
      earthquakes={props.earthquakes}
      onEarthReady={props.onEarthReady}
    />
  );
}
