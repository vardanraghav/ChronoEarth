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

  const accent       = isCyber ? '#00f0ff' : 'rgba(255,255,255,0.70)';
  const accentFill   = isCyber ? 'rgba(0,240,255,0.50)' : 'rgba(255,255,255,0.35)';
  const trackColor   = isCyber ? 'rgba(0,240,255,0.08)' : 'rgba(255,255,255,0.08)';
  const yearActive   = isCyber ? '#00f0ff'              : 'rgba(255,255,255,0.75)';
  const yearInactive = isCyber ? 'rgba(0,240,255,0.20)' : 'rgba(255,255,255,0.20)';
  const yearHovered  = isCyber ? 'rgba(0,240,255,0.50)' : 'rgba(255,255,255,0.50)';

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        padding:    '0 40px 28px',
        background: isCyber
          ? 'linear-gradient(to top, rgba(0,8,20,0.75) 0%, rgba(0,8,20,0.20) 70%, transparent 100%)'
          : 'linear-gradient(to top, rgba(3,5,10,0.72) 0%, rgba(3,5,10,0.20) 70%, transparent 100%)',
        transition: 'background 1.5s ease',
        animation:  'fade-up 1s 0.8s cubic-bezier(0.22,1,0.36,1) both',
      }}
    >
      <div style={{ maxWidth: '560px', margin: '0 auto', position: 'relative' }}>
        {/* Track */}
        <div style={{ position: 'absolute', top: '5px', left: 0, right: 0, height: '1px', background: trackColor }} />
        {/* Progress fill */}
        <div style={{
          position: 'absolute', top: '5px', left: 0, height: '1px',
          width: `${fillPct}%`,
          background: accentFill,
          transition: 'width 0.7s cubic-bezier(0.22,1,0.36,1)',
          boxShadow: isCyber ? `0 0 6px rgba(0,240,255,0.60)` : 'none',
        }} />

        {/* Year markers */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
                  flexDirection: 'column', alignItems: 'center', gap: '7px', padding: '0 2px',
                }}
              >
                {/* Tick */}
                <div style={{
                  width: '1px',
                  height: isActive ? '10px' : '6px',
                  background: isActive ? accent : (isHov ? yearHovered : 'rgba(255,255,255,0.15)'),
                  transition: 'height 0.3s ease, background 0.3s ease',
                  marginTop:  isActive ? '-2px' : '0',
                  boxShadow:  isActive && isCyber ? `0 0 6px rgba(0,240,255,0.8)` : 'none',
                }} />
                {/* Label */}
                <span style={{
                  fontSize: '8px', fontWeight: isActive ? 300 : 200, letterSpacing: '0.12em',
                  color: isActive ? yearActive : (isHov ? yearHovered : yearInactive),
                  transition: 'color 0.3s ease', userSelect: 'none',
                  textShadow: isActive && isCyber ? `0 0 8px rgba(0,240,255,0.70)` : 'none',
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
