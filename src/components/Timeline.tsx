'use client';

import { useState } from 'react';

const years = [2025, 2030, 2035, 2040, 2045, 2050];

interface TimelineProps {
  activeYear:    number;
  setActiveYear: (year: number) => void;
}

export default function Timeline({ activeYear, setActiveYear }: TimelineProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const activeIdx = years.indexOf(activeYear);
  const fillPct   = (activeIdx / (years.length - 1)) * 100;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        padding:    '0 40px 28px',
        background: 'linear-gradient(to top, rgba(3,5,10,0.72) 0%, rgba(3,5,10,0.20) 70%, transparent 100%)',
        animation:  'fade-up 1s 0.8s cubic-bezier(0.22, 1, 0.36, 1) both',
      }}
    >
      <div
        style={{
          maxWidth: '560px',
          margin:   '0 auto',
          position: 'relative',
        }}
      >
        {/* ── Track ───────────────────────────────────────────────────── */}
        <div
          style={{
            position:   'absolute',
            top:        '5px',
            left:       0,
            right:      0,
            height:     '1px',
            background: 'rgba(255,255,255,0.08)',
          }}
        />

        {/* ── Progress fill ────────────────────────────────────────────── */}
        <div
          style={{
            position:   'absolute',
            top:        '5px',
            left:       0,
            height:     '1px',
            width:      `${fillPct}%`,
            background: 'rgba(255,255,255,0.35)',
            transition: 'width 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />

        {/* ── Year markers ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {years.map((year) => {
            const isActive  = year === activeYear;
            const isHovered = year === hovered;
            // Mobile: show only first, last, active
            const isMobileVisible = year === 2025 || year === 2050 || isActive;

            return (
              <button
                key={year}
                onClick={() => setActiveYear(year)}
                onMouseEnter={() => setHovered(year)}
                onMouseLeave={() => setHovered(null)}
                className={isMobileVisible ? '' : 'hidden sm:flex'}
                style={{
                  background:    'none',
                  border:        'none',
                  cursor:        'pointer',
                  display:       isMobileVisible ? 'flex' : undefined,
                  flexDirection: 'column',
                  alignItems:    'center',
                  gap:           '7px',
                  padding:       '0 2px',
                }}
              >
                {/* Tick mark */}
                <div
                  style={{
                    width:      '1px',
                    height:     isActive ? '10px' : '6px',
                    background: isActive
                      ? 'rgba(255,255,255,0.70)'
                      : isHovered
                        ? 'rgba(255,255,255,0.45)'
                        : 'rgba(255,255,255,0.18)',
                    transition: 'height 0.3s ease, background 0.3s ease',
                    marginTop:  isActive ? '-2px' : '0',
                  }}
                />

                {/* Year label */}
                <span
                  style={{
                    fontSize:     '8px',
                    fontWeight:   isActive ? 300 : 200,
                    letterSpacing:'0.12em',
                    color:        isActive
                      ? 'rgba(255,255,255,0.75)'
                      : isHovered
                        ? 'rgba(255,255,255,0.50)'
                        : 'rgba(255,255,255,0.20)',
                    transition:   'color 0.3s ease',
                    userSelect:   'none',
                  }}
                >
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
