'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar            from '@/components/Navbar';
import CesiumGlobe       from '@/components/CesiumGlobe';
import DataPanel         from '@/components/DataPanel';
import CategoryCards     from '@/components/CategoryCards';
import Timeline          from '@/components/Timeline';
import BackgroundEffects from '@/components/BackgroundEffects';
import ProjectionPanel   from '@/components/ProjectionPanel';
import CyberHUD          from '@/components/CyberHUD';
import CityPreviewCard   from '@/components/CityPreviewCard';
import { CityData, citiesRawData } from '@/data/citiesData';
import { EarthMode }     from '@/components/CesiumGlobeContent';

const DEFAULT_OVERLAYS = { climate: false, pollution: false, energy: true, satellite: false, ai: false };

function HomeContent() {
  const searchParams = useSearchParams();
  const cityParam = searchParams.get('city');

  const [activeYear,     setActiveYear]     = useState(2050);
  const [activeCategory, setActiveCategory] = useState('Ocean Monitoring');
  const [activeCity,     setActiveCity]     = useState<CityData | null>(null);
  const [overlays]                          = useState(DEFAULT_OVERLAYS);
  const [earthMode,      setEarthMode]      = useState<EarthMode>('cyber'); // Default to Cyber mode for future theme
  const [transitioning,  setTransitioning]  = useState(false);

  const isCyber = earthMode === 'cyber';

  // Automatically locate and focus city if present in query params
  useEffect(() => {
    if (cityParam) {
      const cityObj = citiesRawData.find(c => c.name.toLowerCase() === cityParam.toLowerCase());
      if (cityObj) {
        setActiveCity(cityObj as any);
      }
    }
  }, [cityParam]);

  const switchMode = useCallback((mode: EarthMode) => {
    if (mode === earthMode || transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setEarthMode(mode);
      setTimeout(() => setTransitioning(false), 600);
    }, 300);
  }, [earthMode, transitioning]);

  return (
    <main className="relative h-screen w-screen overflow-hidden" style={{ background: '#02060A' }}>

      {/* ── Layer 0: Star field ─────────────────────────────────────────── */}
      <BackgroundEffects earthMode={earthMode} />

      {/* ── Layer 1: Cesium Globe ──────────────────────────────────────── */}
      <CesiumGlobe
        activeYear={activeYear}
        activeCategory={activeCategory}
        activeCity={activeCity}
        setActiveCity={setActiveCity}
        overlays={overlays}
        earthMode={earthMode}
      />

      {/* ── Mode transition flash ──────────────────────────────────────── */}
      <div
        className="fixed inset-0 z-[90] pointer-events-none"
        style={{
          background: '#02060A',
          opacity:    transitioning ? 1 : 0,
          transition: `opacity ${transitioning ? '0.3s' : '0.6s'} ease`,
        }}
      />

      {/* ── Top vignette ──────────────────────────────────────────────── */}
      <div
        className="fixed top-0 left-0 right-0 z-10 pointer-events-none"
        style={{
          height: '200px',
          background: `linear-gradient(180deg, ${isCyber ? 'rgba(0,5,14,0.75)' : 'rgba(2,4,8,0.60)'} 0%, transparent 100%)`,
          transition: 'background 1.5s ease',
        }}
      />

      {/* ── Bottom vignette ───────────────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-10 pointer-events-none"
        style={{
          height: '220px',
          background: `linear-gradient(0deg, ${isCyber ? 'rgba(0,5,14,0.85)' : 'rgba(2,4,8,0.70)'} 0%, transparent 100%)`,
          transition: 'background 1.5s ease',
        }}
      />

      {/* ── Navbar ────────────────────────────────────────────────────── */}
      <Navbar earthMode={earthMode} setActiveCity={setActiveCity} />

      {/* ── Mode toggle ───────────────────────────────────────────────── */}
      <div
        className="fixed z-50"
        style={{
          top:   '52px',
          right: '40px',
          display: 'flex',
          borderRadius: '2px',
          border: `1px solid ${isCyber ? 'rgba(0,229,255,0.25)' : 'rgba(255,255,255,0.10)'}`,
          background:    isCyber ? 'rgba(2, 8, 15, 0.75)' : 'rgba(2,4,8,0.70)',
          backdropFilter: 'blur(24px)',
          overflow: 'hidden',
          transition: 'border-color 0.6s ease, background 0.6s ease',
          boxShadow: isCyber ? '0 0 24px rgba(0,229,255,0.12), inset 0 0 12px rgba(0,229,255,0.04)' : 'none',
          animation: 'fade-in 1.2s 0.5s ease both',
        }}
      >
        {([['realistic', 'REALISTIC'], ['cyber', 'CYBER 2050']] as [EarthMode, string][]).map(([mode, label]) => {
          const isActive = earthMode === mode;
          return (
            <button
              key={mode}
              onClick={() => switchMode(mode)}
              style={{
                padding:       '8px 20px',
                fontSize:      '7px',
                fontWeight:    isActive ? 500 : 300,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                background:    isActive
                  ? (mode === 'cyber' ? 'rgba(0,229,255,0.12)' : 'rgba(255,255,255,0.08)')
                  : 'transparent',
                color: isActive
                  ? (mode === 'cyber' ? '#00F5B0' : 'rgba(255,255,255,0.90)')
                  : 'rgba(255,255,255,0.22)',
                textShadow: isActive && mode === 'cyber'
                  ? '0 0 14px rgba(0,229,255,0.80)'
                  : 'none',
                border: 'none',
                cursor:  'pointer',
                transition: 'all 0.35s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Cyber 2050: Full Command Center HUD ───────────────────────── */}
      {isCyber && !transitioning && (
        <CyberHUD 
          activeCity={activeCity}
          setActiveCity={setActiveCity}
        />
      )}

      {/* ── City Preview Card Overlay ─────────────────────────────────── */}
      {isCyber && activeCity && (
        <CityPreviewCard 
          city={activeCity}
          onClose={() => setActiveCity(null)}
        />
      )}

      {/* ── Realistic mode panels ─────────────────────────────────────── */}
      {!isCyber && (
        <>
          <div
            className="fixed z-20 w-full pointer-events-none"
            style={{
              bottom: '90px', left: 0, right: 0,
              padding: '0 40px',
              animation: 'fade-up 0.9s 1s cubic-bezier(0.22, 1, 0.36, 1) both',
            }}
          >
            <ProjectionPanel
              activeYear={activeYear}
              activeCategory={activeCategory}
              activeCity={activeCity}
              earthMode={earthMode}
            />
          </div>

          <DataPanel activeYear={activeYear} activeCity={activeCity} earthMode={earthMode} />

          <CategoryCards
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            earthMode={earthMode}
          />

          <Timeline activeYear={activeYear} setActiveYear={setActiveYear} earthMode={earthMode} />
        </>
      )}

      {/* ── City focus dismiss ─────────────────────────────────────────── */}
      {activeCity && (
        <button
          onClick={() => setActiveCity(null)}
          style={{
            position: 'fixed', top: '60px', left: '50%',
            transform: 'translateX(-50%)', zIndex: 40,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '8px', fontWeight: 300, letterSpacing: '0.4em',
            color: isCyber ? 'rgba(0,229,255,0.40)' : 'rgba(255,255,255,0.30)',
            textTransform: 'uppercase', padding: '6px 12px',
            transition: 'color 0.3s ease', animation: 'fade-in 0.5s ease forwards',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = isCyber ? 'rgba(0,229,255,0.90)' : 'rgba(255,255,255,0.70)')}
          onMouseLeave={e => (e.currentTarget.style.color = isCyber ? 'rgba(0,229,255,0.40)' : 'rgba(255,255,255,0.30)')}
        >
          esc · return to orbit
        </button>
      )}

    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen bg-[#02060A] flex items-center justify-center font-mono text-[#00F5B0] text-xs">
        CONNECTING TO ORBITAL CHRONO_GRID...
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
