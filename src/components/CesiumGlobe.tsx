'use client';

import dynamic from 'next/dynamic';
import '../lib/cesium-setup'; // Ensure setup runs before Resium loads

interface CesiumGlobeProps {
  activeYear: number;
  activeCategory: string;
  activeCity: any;
  setActiveCity: (city: any) => void;
  overlays: {
    climate: boolean;
    pollution: boolean;
    energy: boolean;
    satellite: boolean;
    ai: boolean;
  };
}

const CesiumGlobeContent = dynamic(
  () => import('./CesiumGlobeContent'),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#060918] z-0">
        {/* Futuristic pulsing loader */}
        <div className="relative w-24 h-24 rounded-full border border-cyan-500/30 flex items-center justify-center animate-pulse">
          <div className="absolute inset-0 rounded-full border border-dashed border-cyan-400/20 animate-spin" style={{ animationDuration: '8s' }} />
          <div className="w-16 h-16 rounded-full bg-cyan-950/20 border border-cyan-400/50 flex items-center justify-center">
            <span className="text-[10px] tracking-widest text-cyan-400 uppercase font-mono">GRID</span>
          </div>
        </div>
        <p className="mt-4 text-xs font-light text-cyan-400/60 uppercase tracking-[0.25em] font-mono">
          Loading WebGL Digital Twin...
        </p>
      </div>
    ),
  }
);

export default function CesiumGlobe({ activeYear, activeCategory, activeCity, setActiveCity, overlays }: CesiumGlobeProps) {
  return <CesiumGlobeContent activeYear={activeYear} activeCategory={activeCategory} activeCity={activeCity} setActiveCity={setActiveCity} overlays={overlays} />;
}
