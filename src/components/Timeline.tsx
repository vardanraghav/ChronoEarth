'use client';

import { useState } from 'react';
import { EarthMode } from './CesiumGlobeContent';

const years = [2025, 2030, 2035, 2040, 2045, 2050];

interface TimelineProps {
  activeYear:    number;
  setActiveYear: (y: number) => void;
  earthMode?:    EarthMode;
}

export default function Timeline({ activeYear, setActiveYear, earthMode = 'realistic' }: TimelineProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const activeIdx = years.indexOf(activeYear);
  const fillPct   = (activeIdx / (years.length - 1)) * 100;
  const isCyber   = earthMode === 'cyber';

  const accent       = isCyber ? '#00E5FF' : 'rgba(255,255,255,0.90)';
  const accentFill   = isCyber ? 'rgba(0, 229, 255, 0.80)' : 'rgba(255,255,255,0.50)';
  const trackColor   = isCyber ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255,255,255,0.12)';
  const yearActive   = isCyber ? '#00E5FF'              : 'rgba(255,255,255,0.95)';
  const yearInactive = isCyber ? 'rgba(94, 234, 212, 0.35)' : 'rgba(255,255,255,0.35)';
  const yearHovered  = isCyber ? '#00E5FF'              : 'rgba(255,255,255,0.75)';

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        padding:    '0 40px 28px',
        background: isCyber
          ? 'linear-gradient(to top, rgba(10, 20, 35, 0.55) 0%, rgba(2, 8, 15, 0.20) 70%, transparent 100%)'
          : 'linear-gradient(to top, rgba(2, 8, 15, 0.72) 0%, rgba(2, 8, 15, 0.20) 70%, transparent 100%)',
        transition: 'background 1.5s ease',
        animation:  'fade-up 1s 0.8s cubic-bezier(0.22,1,0.36,1) both',
      }}
    >
      <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative' }}>
        {/* Track */}
        <div style={{ position: 'absolute', top: '7px', left: 0, right: 0, height: '3px', borderRadius: '99px', background: trackColor }} />
        {/* Progress fill */}
        <div style={{
          position: 'absolute', top: '7px', left: 0, height: '3px', borderRadius: '99px',
          width: `${fillPct}%`,
          background: accentFill,
          transition: 'width 0.7s cubic-bezier(0.22,1,0.36,1)',
          boxShadow: isCyber ? `0 0 12px rgba(0, 229, 255, 0.95)` : 'none',
        }} />

        {/* Year markers */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 5 }}>
          {years.map((year) => {
            const isActive  = year === activeYear;
            const isHov     = year === hovered;
            const isMobVis  = year === 2025 || year === 2050 || isActive;

            return (
              <button
                key={year}
                onClick={() => setActiveYear(year)}
                onMouseEnter={() => setHovered(year)}
                onMouseLeave={() => setHovered(null)}
                className={isMobVis ? '' : 'hidden sm:flex'}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: isMobVis ? 'flex' : undefined,
                  flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '0 2px',
                }}
              >
                {/* Tick / Glowing Dot indicator */}
                <div style={{
                  width: isActive ? '8px' : '4px',
                  height: isActive ? '8px' : '4px',
                  borderRadius: '50%',
                  background: isActive ? accent : (isHov ? yearHovered : 'rgba(255,255,255,0.25)'),
                  transition: 'all 0.3s ease',
                  marginTop:  isActive ? '4px' : '6px',
                  boxShadow:  isActive && isCyber ? `0 0 10px #00E5FF, 0 0 20px #00E5FF` : 'none',
                }} />
                {/* Label */}
                <span style={{
                  fontSize: '11px', fontWeight: isActive ? 800 : 500, letterSpacing: '0.12em',
                  color: isActive ? yearActive : (isHov ? yearHovered : yearInactive),
                  transition: 'all 0.3s ease', userSelect: 'none',
                  textShadow: isActive && isCyber ? `0 0 12px rgba(0, 229, 255, 0.95), 0 0 24px rgba(0, 229, 255, 0.4)` : 'none',
                  transform: isActive ? 'scale(1.15)' : 'none',
                }}>
                  {year}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

