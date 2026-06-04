'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { EarthMode } from './CesiumGlobeContent';
import SearchModal from './SearchModal';

interface NavbarProps {
  earthMode?: EarthMode;
  onSearchClick?: () => void; // Keeping prop for backwards compatibility if needed
  setActiveCity?: (city: any) => void;
}

const realisticNavLinks = [
  { path: '/', label: 'MONITOR' },
  { path: '/predictions', label: 'PREDICTIONS' },
  { path: '/about',   label: 'ABOUT'   },
];

const cyberNavLinks = [
  { path: '/',           label: 'TELEMETRY' },
  { path: '/feed',        label: 'FEED' },
  { path: '/predictions', label: 'PREDICTIONS' },
  { path: '/knowledge',    label: 'KNOWLEDGE BASE' },
  { path: '/futurologists', label: 'FUTUROLOGISTS' },
  { path: '/about',       label: 'ABOUT' },
  { path: '/feedback',    label: 'FEEDBACK' },
];

export default function Navbar({
  earthMode = 'cyber',
  setActiveCity,
}: NavbarProps) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const isCyber = earthMode === 'cyber';

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between"
        style={{
          padding:    '22px 40px',
          background: isCyber
            ? 'linear-gradient(180deg, rgba(2, 8, 15, 0.85) 0%, transparent 100%)'
            : 'linear-gradient(180deg, rgba(2, 8, 15, 0.70) 0%, transparent 100%)',
          transition: 'background 1.5s ease',
          animation:  'fade-in 1.2s ease forwards',
        }}
      >
        {/* Wordmark */}
        <Link
          href="/"
          className="select-none flex items-center gap-[0.6em] hover:opacity-90 transition-opacity font-display"
          style={{
            fontWeight:   300,
            fontSize:     '11px',
            letterSpacing:'0.45em',
            textTransform:'uppercase',
            textDecoration: 'none',
          }}
        >
          <span style={{
            color:      isCyber ? '#00F5B0' : 'rgba(255,255,255,0.95)',
            transition: 'all 0.6s ease',
          }}>CHRONO</span>
          <span style={{ color: isCyber ? 'rgba(0, 245, 176, 0.3)' : 'rgba(255,255,255,0.2)', fontSize: '6px', letterSpacing: 0 }}>·</span>
          <span style={{ color: isCyber ? '#00D98F' : 'rgba(255,255,255,0.6)', transition: 'color 0.6s ease' }}>EARTH</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8 font-display">
          {isCyber ? (
            <>
              {cyberNavLinks.map((link) => {
                const isActive = pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    style={{
                      textDecoration: 'none',
                      fontWeight: isActive ? 500 : 300, 
                      fontSize: '8px', 
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      color: isActive ? '#00F5B0' : 'rgba(255,255,255,0.4)',
                      transition: 'all 0.3s ease',
                      padding: '4px 0',
                      position: 'relative',
                    }}
                  >
                    {link.label}
                    {isActive && (
                      <div style={{
                        position: 'absolute', bottom: -2, left: 0, right: 0, height: 1.5,
                        background: '#00F5B0', boxShadow: '0 1px 4px rgba(0, 245, 176, 0.4)'
                      }} />
                    )}
                  </Link>
                );
              })}
              
              {/* Search Trigger Button */}
              <button
                onClick={() => setSearchOpen(true)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontWeight: 300,
                  fontSize: '8px',
                  letterSpacing: '0.18em',
                  color: 'rgba(255, 255, 255, 0.6)',
                  padding: '5px 14px',
                  marginLeft: '12px',
                  transition: 'all 0.3s ease',
                  fontFamily: 'var(--font-sans)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                }}
              >
                SEARCH
              </button>
            </>
          ) : (
            realisticNavLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  style={{
                    textDecoration: 'none',
                    fontWeight: 300, 
                    fontSize: '9px', 
                    letterSpacing: '0.35em',
                    textTransform: 'uppercase',
                    color: isActive ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.28)',
                    transition: 'color 0.3s ease',
                    padding: '4px 0',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.28)'; }}
                >
                  {link.label}
                </Link>
              );
            })
          )}
        </div>
      </nav>

      {/* Reusable Search Overlay */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} setActiveCity={setActiveCity} />
    </>
  );
}
