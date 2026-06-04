'use client';

import { EarthMode } from './CesiumGlobeContent';

interface NavbarProps {
  earthMode?: EarthMode;
  activeTab?: string;
  setActiveTab?: (tab: any) => void;
  onSearchClick?: () => void;
}

const realisticNavLinks = [
  { id: 'monitor', label: 'MONITOR' },
  { id: 'explore', label: 'EXPLORE' },
  { id: 'about',   label: 'ABOUT'   },
];

const cyberNavLinks = [
  { id: 'telemetry',   label: 'TELEMETRY' },
  { id: 'predictions', label: 'PREDICTIONS FEED' },
  { id: 'kb',          label: 'KNOWLEDGE BASE' },
  { id: 'reports',     label: 'AI REPORTS' },
  { id: 'saved',       label: 'SAVED INTELLIGENCE' },
];

export default function Navbar({
  earthMode = 'realistic',
  activeTab = 'telemetry',
  setActiveTab,
  onSearchClick
}: NavbarProps) {
  const isCyber  = earthMode === 'cyber';

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
      <div className="hidden md:flex items-center gap-6">
        {isCyber ? (
          <>
            {cyberNavLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab && setActiveTab(link.id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontWeight: isActive ? 500 : 300, 
                    fontSize: '8px', letterSpacing: '0.28em',
                    textTransform: 'uppercase',
                    color: isActive ? '#00E5FF' : 'rgba(0,229,255,0.45)',
                    textShadow: isActive ? '0 0 8px rgba(0,229,255,0.60)' : 'none',
                    transition: 'all 0.3s ease',
                    padding: '4px 0',
                    position: 'relative',
                  }}
                >
                  {link.label}
                  {isActive && (
                    <div style={{
                      position: 'absolute', bottom: -2, left: '20%', right: '20%', height: 1,
                      background: '#00E5FF', boxShadow: '0 0 8px #00E5FF'
                    }} />
                  )}
                </button>
              );
            })}
            
            {/* Search Trigger Button */}
            <button
              onClick={onSearchClick}
              style={{
                background: 'rgba(0,229,255,0.06)',
                border: '1px solid rgba(0,229,255,0.18)',
                borderRadius: '2px',
                cursor: 'pointer',
                fontWeight: 400,
                fontSize: '8px',
                letterSpacing: '0.22em',
                color: '#00E5FF',
                padding: '4px 10px',
                marginLeft: '8px',
                transition: 'all 0.3s ease',
                boxShadow: '0 0 8px rgba(0,229,255,0.04)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0,229,255,0.12)';
                e.currentTarget.style.boxShadow = '0 0 12px rgba(0,229,255,0.18)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0,229,255,0.06)';
                e.currentTarget.style.boxShadow = '0 0 8px rgba(0,229,255,0.04)';
              }}
            >
              SEARCH 🔍
            </button>
          </>
        ) : (
          realisticNavLinks.map((link) => (
            <button
              key={link.id}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontWeight: 300, fontSize: '9px', letterSpacing: '0.35em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.28)',
                transition: 'color 0.3s ease',
                padding: '4px 0',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.28)'}
            >
              {link.label}
            </button>
          ))
        )}
      </div>
    </nav>
  );
}
