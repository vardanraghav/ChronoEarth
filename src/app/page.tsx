'use client';

import { useState } from 'react';
import Navbar           from '@/components/Navbar';
import CesiumGlobe      from '@/components/CesiumGlobe';
import DataPanel        from '@/components/DataPanel';
import CategoryCards    from '@/components/CategoryCards';
import Timeline         from '@/components/Timeline';
import BackgroundEffects from '@/components/BackgroundEffects';
import ProjectionPanel  from '@/components/ProjectionPanel';
import { CityData }     from '@/data/citiesData';

// Overlay toggles — now managed invisibly (no dashboard panel shown)
const DEFAULT_OVERLAYS = {
  climate:   false,
  pollution: false,
  energy:    true,
  satellite: false,
  ai:        false,
};

export default function Home() {
  const [activeYear,     setActiveYear]     = useState(2050);
  const [activeCategory, setActiveCategory] = useState('Ocean Monitoring');
  const [activeCity,     setActiveCity]     = useState<CityData | null>(null);
  const [overlays]                          = useState(DEFAULT_OVERLAYS);

  return (
    <main
      className="relative h-screen w-screen overflow-hidden"
      style={{ background: '#030508' }}
    >

      {/* ── Layer 0 : Star field ──────────────────────────────────── */}
      <BackgroundEffects />

      {/* ── Layer 1 : Cesium Globe (fills entire viewport) ───────── */}
      <CesiumGlobe
        activeYear={activeYear}
        activeCategory={activeCategory}
        activeCity={activeCity}
        setActiveCity={setActiveCity}
        overlays={overlays}
      />

      {/* ── Layer 2 : Cinematic top-edge vignette ─────────────────── */}
      {/* Creates depth and frames the globe at the top */}
      <div
        className="fixed top-0 left-0 right-0 z-10 pointer-events-none"
        style={{
          height:     '180px',
          background: 'linear-gradient(180deg, rgba(3,5,10,0.55) 0%, transparent 100%)',
        }}
      />

      {/* ── Layer 3 : Navbar (near-invisible, top edge) ───────────── */}
      <Navbar />

      {/* ── Layer 4 : Bottom bar (projection + timeline + controls) ── */}
      {/*
          Layout from bottom up:
          1. Timeline scrubber (very bottom, 28px from floor)
          2. DataPanel metrics + CategoryCards pills (just above timeline)
          3. ProjectionPanel text (centred, just above metrics row)
      */}

      {/* Projection panel — centred above the data row */}
      <div
        className="fixed z-20 w-full pointer-events-none"
        style={{
          bottom:    '90px',
          left:      0,
          right:     0,
          padding:   '0 40px',
          animation: 'fade-up 0.9s 1s cubic-bezier(0.22, 1, 0.36, 1) both',
        }}
      >
        <ProjectionPanel
          activeYear={activeYear}
          activeCategory={activeCategory}
          activeCity={activeCity}
        />
      </div>

      {/* Data metrics — bottom-left */}
      <DataPanel activeYear={activeYear} activeCity={activeCity} />

      {/* Category pills — bottom-right */}
      <CategoryCards
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {/* Timeline scrubber — very bottom edge */}
      <Timeline activeYear={activeYear} setActiveYear={setActiveYear} />

      {/* ── City focus ESC hint ────────────────────────────────────── */}
      {activeCity && (
        <button
          onClick={() => setActiveCity(null)}
          style={{
            position:     'fixed',
            top:          '60px',
            left:         '50%',
            transform:    'translateX(-50%)',
            zIndex:       30,
            background:   'none',
            border:       'none',
            cursor:       'pointer',
            fontSize:     '8px',
            fontWeight:   300,
            letterSpacing:'0.4em',
            color:        'rgba(255,255,255,0.30)',
            textTransform:'uppercase',
            padding:      '6px 12px',
            transition:   'color 0.3s ease',
            animation:    'fade-in 0.5s ease forwards',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.30)')}
        >
          esc · return to orbit
        </button>
      )}

    </main>
  );
}
