'use client';

import { useEffect, useState } from 'react';
import { CityData } from '@/data/citiesData';

interface StatCard {
  label: string;
  value: string;
  arrow: 'up-red' | 'up-orange' | 'dot-green';
  unit?: string;
}

const statsData: Record<number, StatCard[]> = {
  2025: [
    { label: 'GLOBAL TEMP', value: '+1.1', unit: '°C', arrow: 'up-red' },
    { label: 'SEA LEVEL', value: '+0.05', unit: 'm', arrow: 'up-orange' },
    { label: 'POPULATION', value: '8.15', unit: 'B', arrow: 'dot-green' },
  ],
  2030: [
    { label: 'GLOBAL TEMP', value: '+1.3', unit: '°C', arrow: 'up-red' },
    { label: 'SEA LEVEL', value: '+0.10', unit: 'm', arrow: 'up-orange' },
    { label: 'POPULATION', value: '8.54', unit: 'B', arrow: 'dot-green' },
  ],
  2035: [
    { label: 'GLOBAL TEMP', value: '+1.5', unit: '°C', arrow: 'up-red' },
    { label: 'SEA LEVEL', value: '+0.15', unit: 'm', arrow: 'up-orange' },
    { label: 'POPULATION', value: '8.90', unit: 'B', arrow: 'dot-green' },
  ],
  2040: [
    { label: 'GLOBAL TEMP', value: '+1.7', unit: '°C', arrow: 'up-red' },
    { label: 'SEA LEVEL', value: '+0.20', unit: 'm', arrow: 'up-orange' },
    { label: 'POPULATION', value: '9.21', unit: 'B', arrow: 'dot-green' },
  ],
  2045: [
    { label: 'GLOBAL TEMP', value: '+1.9', unit: '°C', arrow: 'up-red' },
    { label: 'SEA LEVEL', value: '+0.25', unit: 'm', arrow: 'up-orange' },
    { label: 'POPULATION', value: '9.48', unit: 'B', arrow: 'dot-green' },
  ],
  2050: [
    { label: 'GLOBAL TEMP', value: '+2.1', unit: '°C', arrow: 'up-red' },
    { label: 'SEA LEVEL', value: '+0.30', unit: 'm', arrow: 'up-orange' },
    { label: 'POPULATION', value: '9.70', unit: 'B', arrow: 'dot-green' },
  ],
};

interface DataPanelProps {
  activeYear: number;
  activeCity: CityData | null;
}

function ArrowIndicator({ type }: { type: StatCard['arrow'] }) {
  if (type === 'dot-green') {
    return (
      <span
        className="inline-block w-2 h-2 rounded-full ml-2"
        style={{
          background: '#22c55e',
          boxShadow: '0 0 8px #22c55e80',
        }}
      />
    );
  }
  const color = type === 'up-red' ? '#ef4444' : '#f97316';
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      className="ml-2 inline-block"
      style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
    >
      <path d="M6 2 L10 8 L2 8 Z" fill={color} />
    </svg>
  );
}

export default function DataPanel({ activeYear, activeCity }: DataPanelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const baseStats = statsData[activeYear] || statsData[2050];

  let stats: StatCard[] = [];
  if (activeCity) {
    const yearIndex = (activeYear - 2025) / 5;

    // 1. Local Temp Offset calculation
    const baseTemp = parseFloat(baseStats[0].value);
    const cityTemp = baseTemp + activeCity.offsets.temp + yearIndex * 0.12 * activeCity.offsets.tempRise;
    const tempFormatted = (cityTemp > 0 ? '+' : '') + cityTemp.toFixed(1);

    // 2. Local Sea Level calculation
    let seaFormatted = 'LANDLOCKED';
    let seaUnit = '';
    let seaArrow: StatCard['arrow'] = 'dot-green';
    if (activeCity.offsets.seaLevel > 0) {
      const baseSea = parseFloat(baseStats[1].value);
      const citySea = baseSea * activeCity.offsets.seaLevel;
      seaFormatted = `+${citySea.toFixed(2)}`;
      seaUnit = 'm';
      seaArrow = 'up-orange';
    }

    // 3. Nodal Population calculation (Millions)
    const cityPop = (activeCity.offsets.population * 1000) * Math.pow(activeCity.offsets.popGrowth, yearIndex);
    const popFormatted = cityPop.toFixed(1);

    stats = [
      { label: 'LOCAL TEMP', value: tempFormatted, unit: '°C', arrow: 'up-red' },
      { label: 'LOCAL SEA LEVEL', value: seaFormatted, unit: seaUnit, arrow: seaArrow },
      { label: 'NODAL POPULATION', value: popFormatted, unit: 'M', arrow: 'dot-green' },
    ];
  } else {
    stats = baseStats;
  }

  return (
    <>
      <style>{`
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes scan-line {
          0% {
            top: -2px;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: calc(100% + 2px);
            opacity: 0;
          }
        }
        .data-card {
          position: relative;
          overflow: hidden;
        }
        .data-card::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.3), transparent);
          animation: scan-line 4s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>

      <div
        className="hidden lg:flex fixed left-6 xl:left-10 top-1/2 -translate-y-1/2 z-10 flex-col gap-3"
      >
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="data-card rounded-lg px-5 py-4 min-w-[180px]"
            style={{
              background: 'rgba(6, 9, 24, 0.6)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(0, 240, 255, 0.12)',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateX(0)' : 'translateX(-40px)',
              transition: `all 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.15}s`,
            }}
          >
            {/* Label */}
            <p
              className="text-[10px] font-light uppercase mb-2"
              style={{
                letterSpacing: '0.2em',
                color: 'rgba(0, 240, 255, 0.45)',
              }}
            >
              {stat.label}
            </p>

            {/* Value */}
            <div className="flex items-center">
              <span
                className="text-xl font-light text-white"
                style={{ textShadow: '0 0 20px rgba(255,255,255,0.08)' }}
              >
                {stat.value}
              </span>
              <span
                className="text-sm font-light ml-0.5"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                {stat.unit}
              </span>
              <ArrowIndicator type={stat.arrow} />
            </div>

            {/* Mini bar decoration */}
            <div
              className="mt-3 h-px w-full"
              style={{
                background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.2), transparent)',
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
