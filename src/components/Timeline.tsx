'use client';

import { useState } from 'react';

const years = [2025, 2030, 2035, 2040, 2045, 2050];

interface TimelineProps {
  activeYear: number;
  setActiveYear: (year: number) => void;
}

export default function Timeline({ activeYear, setActiveYear }: TimelineProps) {
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  return (
    <>
      <style>{`
        @keyframes timeline-pulse-ring {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, -50%) scale(2.5);
            opacity: 0;
          }
        }
        .timeline-dot {
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .timeline-dot:hover {
          background: #00f0ff !important;
          box-shadow: 0 0 12px #00f0ff, 0 0 24px #00f0ff60 !important;
          transform: scale(1.3);
        }
      `}</style>

      <div
        className="fixed bottom-0 left-0 right-0 z-40 px-6 md:px-16 py-5"
        style={{
          background: 'linear-gradient(to top, rgba(6, 9, 24, 0.85), rgba(6, 9, 24, 0.4), transparent)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <div className="max-w-3xl mx-auto relative">
          {/* Track line */}
          <div
            className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.2) 10%, rgba(0, 240, 255, 0.2) 90%, transparent)',
            }}
          />

          {/* Active progress fill */}
          <div
            className="absolute top-1/2 left-0 h-px -translate-y-1/2"
            style={{
              width: `${((years.indexOf(activeYear)) / (years.length - 1)) * 100}%`,
              background: 'linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.4))',
              boxShadow: '0 0 8px rgba(0, 240, 255, 0.2)',
            }}
          />

          {/* Year dots */}
          <div className="flex items-center justify-between relative">
            {years.map((year, i) => {
              const isActive = year === activeYear;
              const isHovered = year === hoveredYear;
              // On mobile, show first, last, and active; hide others
              const showOnMobile = i === 0 || i === years.length - 1 || isActive;

              return (
                <button
                  key={year}
                  onClick={() => setActiveYear(year)}
                  onMouseEnter={() => setHoveredYear(year)}
                  onMouseLeave={() => setHoveredYear(null)}
                  className={`relative flex flex-col items-center gap-3 group ${showOnMobile ? '' : 'hidden sm:flex'}`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {/* Pulse ring for active */}
                  {isActive && (
                    <span
                      className="absolute top-0 left-1/2 w-4 h-4 rounded-full pointer-events-none"
                      style={{
                        border: '1px solid rgba(0, 240, 255, 0.4)',
                        animation: 'timeline-pulse-ring 2s ease-out infinite',
                      }}
                    />
                  )}

                  {/* Dot */}
                  <span
                    className="timeline-dot relative z-10 rounded-full block"
                    style={{
                      width: isActive ? 14 : 8,
                      height: isActive ? 14 : 8,
                      background: isActive
                        ? '#00f0ff'
                        : isHovered
                          ? '#00f0ff'
                          : 'rgba(0, 240, 255, 0.25)',
                      boxShadow: isActive
                        ? '0 0 12px #00f0ff, 0 0 30px #00f0ff60'
                        : isHovered
                          ? '0 0 10px #00f0ff80'
                          : 'none',
                    }}
                  />

                  {/* Year label */}
                  <span
                    className="text-[10px] font-light"
                    style={{
                      letterSpacing: '0.15em',
                      color: isActive
                        ? '#00f0ff'
                        : isHovered
                          ? 'rgba(0, 240, 255, 0.7)'
                          : 'rgba(255, 255, 255, 0.3)',
                      textShadow: isActive ? '0 0 10px #00f0ff60' : 'none',
                      transition: 'color 0.3s ease',
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
    </>
  );
}
