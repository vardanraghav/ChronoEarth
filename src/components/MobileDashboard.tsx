// src/components/MobileDashboard.tsx
'use client';

import { useState } from 'react';
import CesiumGlobe from '@/components/CesiumGlobe';

// Simple glass style utility class (Tailwind)
const glassClass = 'bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-lg';

const MOBILE_ACTIVE_LAYERS = {
  cities: true,
  climate: true,
  tech: true,
  energy: true,
  space: true,
  geopolitical: true,
};

const MOBILE_ACTIVE_SIMULATIONS = {
  seaLevelRise: 0,
  fusionBreakthrough: false,
  agiEmergence: false,
  popDecline: false,
  renewableTransition: false,
  arcticDominance: false,
  semiDisruptions: false,
};

export default function MobileDashboard({ activeYear, setActiveYear }: { activeYear: number; setActiveYear: (y: number) => void }) {
  const [activeTab, setActiveTab] = useState<'map' | 'hot' | 'predictions' | 'search'>('map');

  // Handler for closing bottom sheets
  const closeSheet = () => setActiveTab('map');

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#02060B] text-white">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-2 z-10 relative">
        <h1 className="text-xl font-bold tracking-wider">CHRONOEARTH</h1>
        <div className="flex gap-2">
          {[2030, 2040, 2050].map((year) => {
            const isActive = activeYear === year;
            return (
              <button
                key={year}
                onClick={() => setActiveYear(year)}
                className={`px-2 py-1 text-sm ${isActive ? 'text-[#00E5FF] font-medium' : 'text-white/60'}
                  transition-colors`}
              >
                {year}
              </button>
            );
          })}
        </div>
      </header>

      {/* Globe – occupies 70% of viewport height */}
      <div className="h-[70vh] w-full">
        <CesiumGlobe
          activeYear={activeYear}
          activeCategory="AI"
          activeCity={null}
          setActiveCity={() => {}}
          activeCountry={null}
          setActiveCountry={() => {}}
          overlays={{ climate: false, pollution: false, energy: true, satellite: false, ai: false }}
          earthMode="cyber"
          activeLayers={MOBILE_ACTIVE_LAYERS}
          activeSimulations={MOBILE_ACTIVE_SIMULATIONS}
        />
      </div>

      {/* Bottom Navigation Dock */}
      <nav className={`fixed bottom-4 left-1/2 -translate-x-1/2 ${glassClass} px-4 py-2 flex gap-4`}
        style={{ minWidth: '260px' }}
      >
        {['map', "what's hot", 'predictions', 'search'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`text-sm ${activeTab === tab ? 'text-[#00E5FF]' : 'text-white/70'}
              hover:text-[#00E5FF] transition-colors`}
          >
            {tab.replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </nav>

      {/* Bottom Sheet Overlays */}
      {activeTab !== 'map' && (
        <div className={`fixed inset-x-0 bottom-0 h-1/2 ${glassClass} p-4 overflow-y-auto`}> 
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium">{activeTab === 'hot' ? "What\'s Hot" : activeTab === 'predictions' ? 'Predictions' : 'Search'}</h2>
            <button onClick={closeSheet} className="text-xs text-white/60 hover:text-white">Close</button>
          </div>
          {/* Placeholder content – replace with real cards later */}
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-3 bg-black/30 rounded border border-white/10">
                <p className="text-sm">{activeTab} card #{i + 1}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

