'use client';

import { useState } from 'react';

const navLinks = [
  { id: 'monitor',  label: 'MONITOR'  },
  { id: 'explore',  label: 'EXPLORE'  },
  { id: 'about',    label: 'ABOUT'    },
];

export default function Navbar() {
  const [active, setActive] = useState('monitor');

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between"
      style={{
        padding: '22px 40px',
        background: 'linear-gradient(180deg, rgba(3, 5, 10, 0.7) 0%, transparent 100%)',
        animation: 'fade-in 1.2s ease forwards',
      }}
    >
      {/* Wordmark */}
      <div
        className="select-none cursor-default flex items-center gap-[0.6em]"
        style={{
          fontWeight: 200,
          fontSize: '11px',
          letterSpacing: '0.55em',
          color: 'rgba(255,255,255,0.6)',
          textTransform: 'uppercase',
        }}
      >
        <span style={{ color: 'rgba(255,255,255,0.9)' }}>CHRONO</span>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '6px', letterSpacing: 0 }}>·</span>
        <span>EARTH</span>
      </div>

      {/* Navigation links — desktop only */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => setActive(link.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 300,
              fontSize: '9px',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: active === link.id
                ? 'rgba(255,255,255,0.85)'
                : 'rgba(255,255,255,0.28)',
              transition: 'color 0.4s ease',
              padding: '4px 0',
              // Thin underline only on active — not glowing, just present
              borderBottom: active === link.id
                ? '1px solid rgba(255,255,255,0.35)'
                : '1px solid transparent',
            }}
          >
            {link.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
