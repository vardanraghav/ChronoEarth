'use client';

import { EarthMode } from './CesiumGlobeContent';

const navLinks = [
  { id: 'monitor', label: 'MONITOR' },
  { id: 'explore', label: 'EXPLORE' },
  { id: 'about',   label: 'ABOUT'   },
];

export default function Navbar({ earthMode = 'realistic' }: { earthMode?: EarthMode }) {
  const isCyber  = earthMode === 'cyber';
  const accent   = isCyber ? '#00f0ff' : undefined;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between"
      style={{
        padding:    '22px 40px',
        background: isCyber
          ? 'linear-gradient(180deg, rgba(0,8,20,0.72) 0%, transparent 100%)'
          : 'linear-gradient(180deg, rgba(3,5,10,0.70) 0%, transparent 100%)',
        transition: 'background 1.5s ease',
        animation:  'fade-in 1.2s ease forwards',
      }}
    >
      {/* Wordmark */}
      <div
        className="select-none cursor-default flex items-center gap-[0.6em]"
        style={{
          fontWeight:   200,
          fontSize:     '11px',
          letterSpacing:'0.55em',
          textTransform:'uppercase',
          transition:   'all 0.6s ease',
        }}
      >
        <span style={{
          color:      isCyber ? '#00f0ff' : 'rgba(255,255,255,0.9)',
          textShadow: isCyber ? '0 0 18px rgba(0,240,255,0.65), 0 0 40px rgba(0,240,255,0.25)' : 'none',
          transition: 'all 0.6s ease',
        }}>CHRONO</span>
        <span style={{ color: isCyber ? 'rgba(0,240,255,0.35)' : 'rgba(255,255,255,0.35)', fontSize: '6px', letterSpacing: 0 }}>·</span>
        <span style={{ color: isCyber ? 'rgba(0,240,255,0.70)' : 'rgba(255,255,255,0.60)', transition: 'color 0.6s ease' }}>EARTH</span>
      </div>

      {/* Desktop nav links */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <button
            key={link.id}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontWeight: 300, fontSize: '9px', letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: isCyber ? 'rgba(0,240,255,0.45)' : 'rgba(255,255,255,0.28)',
              transition: 'color 0.3s ease',
              padding: '4px 0',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = isCyber ? '#00f0ff' : 'rgba(255,255,255,0.75)'}
            onMouseLeave={(e) => e.currentTarget.style.color = isCyber ? 'rgba(0,240,255,0.45)' : 'rgba(255,255,255,0.28)'}
          >
            {link.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
