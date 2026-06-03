'use client';

import { useState, useCallback } from 'react';
import Navbar            from '@/components/Navbar';
import CesiumGlobe       from '@/components/CesiumGlobe';
import DataPanel         from '@/components/DataPanel';
import CategoryCards     from '@/components/CategoryCards';
import Timeline          from '@/components/Timeline';
import BackgroundEffects from '@/components/BackgroundEffects';
import ProjectionPanel   from '@/components/ProjectionPanel';
import { CityData }      from '@/data/citiesData';
import { EarthMode }     from '@/components/CesiumGlobeContent';

const DEFAULT_OVERLAYS = { climate: false, pollution: false, energy: true, satellite: false, ai: false };

export default function Home() {
  const [activeYear,     setActiveYear]     = useState(2050);
  const [activeCategory, setActiveCategory] = useState('Ocean Monitoring');
  const [activeCity,     setActiveCity]     = useState<CityData | null>(null);
  const [overlays]                          = useState(DEFAULT_OVERLAYS);
  const [earthMode,      setEarthMode]      = useState<EarthMode>('realistic');
  const [transitioning,  setTransitioning]  = useState(false);

  const isCyber = earthMode === 'cyber';

  // Mode switch with brief fade transition
  const switchMode = useCallback((mode: EarthMode) => {
    if (mode === earthMode || transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setEarthMode(mode);
      setTimeout(() => setTransitioning(false), 600);
    }, 300);
  }, [earthMode, transitioning]);

  return (
    <main className="relative h-screen w-screen overflow-hidden" style={{ background: '#030508' }}>

      {/* ── Layer 0: Star field (adapts to mode) ──────────────────────── */}
      <BackgroundEffects earthMode={earthMode} />

      {/* ── Layer 1: Cesium Globe ─────────────────────────────────────── */}
      <CesiumGlobe
        activeYear={activeYear}
        activeCategory={activeCategory}
        activeCity={activeCity}
        setActiveCity={setActiveCity}
        overlays={overlays}
        earthMode={earthMode}
      />

      {/* ── Mode transition flash ─────────────────────────────────────── */}
      <div
        className="fixed inset-0 z-[90] pointer-events-none"
        style={{
          background: '#030508',
          opacity:    transitioning ? 1 : 0,
          transition: `opacity ${transitioning ? '0.3s' : '0.6s'} ease`,
        }}
      />

      {/* ── Top vignette ─────────────────────────────────────────────── */}
      <div
        className="fixed top-0 left-0 right-0 z-10 pointer-events-none"
        style={{
          height:     '180px',
          background: `linear-gradient(180deg, ${isCyber ? 'rgba(0,8,20,0.60)' : 'rgba(3,5,10,0.55)'} 0%, transparent 100%)`,
          transition: 'background 1.5s ease',
        }}
      />

      {/* ── Navbar ────────────────────────────────────────────────────── */}
      <Navbar earthMode={earthMode} />

      {/* ══════════════════════════════════════════════════════════════
          MODE TOGGLE — top-right pill below navbar
          Realistic ←→ Cyber 2050
         ══════════════════════════════════════════════════════════════ */}
      <div
        className="fixed z-50"
        style={{
          top:   '52px',
          right: '40px',
          display: 'flex',
          borderRadius: '2px',
          border: `1px solid ${isCyber ? 'rgba(0,240,255,0.20)' : 'rgba(255,255,255,0.10)'}`,
          background:    isCyber ? 'rgba(0,8,20,0.75)' : 'rgba(3,5,10,0.65)',
          backdropFilter: 'blur(20px)',
          overflow: 'hidden',
          transition: 'border-color 0.6s ease, background 0.6s ease',
          boxShadow: isCyber ? '0 0 20px rgba(0,240,255,0.10)' : 'none',
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
                padding:      '7px 16px',
                fontSize:     '7px',
                fontWeight:   isActive ? 400 : 300,
                letterSpacing:'0.32em',
                textTransform:'uppercase',
                background:   isActive
                  ? (mode === 'cyber' ? 'rgba(0,240,255,0.10)' : 'rgba(255,255,255,0.07)')
                  : 'transparent',
                color: isActive
                  ? (mode === 'cyber' ? '#00f0ff' : 'rgba(255,255,255,0.85)')
                  : 'rgba(255,255,255,0.25)',
                textShadow: isActive && mode === 'cyber'
                  ? '0 0 12px rgba(0,240,255,0.70)'
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

      {/* ── Projection panel ─────────────────────────────────────────── */}
      <div
        className="fixed z-20 w-full pointer-events-none"
        style={{
          bottom:    '90px',
          left: 0, right: 0,
          padding:   '0 40px',
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

      {/* ── Data metrics ─────────────────────────────────────────────── */}
      <DataPanel activeYear={activeYear} activeCity={activeCity} earthMode={earthMode} />

      {/* ── Category selector ─────────────────────────────────────────── */}
      <CategoryCards
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        earthMode={earthMode}
      />

      {/* ── Timeline ─────────────────────────────────────────────────── */}
      <Timeline activeYear={activeYear} setActiveYear={setActiveYear} earthMode={earthMode} />

      {/* ── City focus hint ───────────────────────────────────────────── */}
      {activeCity && (
        <button
          onClick={() => setActiveCity(null)}
          style={{
            position:     'fixed', top: '60px', left: '50%',
            transform:    'translateX(-50%)', zIndex: 30,
            background:   'none', border: 'none', cursor: 'pointer',
            fontSize: '8px', fontWeight: 300, letterSpacing: '0.4em',
            color: isCyber ? 'rgba(0,240,255,0.35)' : 'rgba(255,255,255,0.30)',
            textTransform: 'uppercase', padding: '6px 12px',
            transition: 'color 0.3s ease', animation: 'fade-in 0.5s ease forwards',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = isCyber ? 'rgba(0,240,255,0.80)' : 'rgba(255,255,255,0.65)'}
          onMouseLeave={(e) => e.currentTarget.style.color = isCyber ? 'rgba(0,240,255,0.35)' : 'rgba(255,255,255,0.30)'}
        >
          esc · return to orbit
        </button>
      )}

    </main>
  );
}
