'use client';

import { EarthMode } from './CesiumGlobeContent';
import { CityData }  from '@/data/citiesData';

const statsData: Record<number, { label: string; value: string; unit: string; arrow: 'up' | 'stable' }[]> = {
  2025: [{ label: 'TEMP', value: '+1.1', unit: '°C', arrow: 'up' }, { label: 'SEA', value: '+0.05', unit: 'm', arrow: 'up' }, { label: 'POP', value: '8.15', unit: 'B', arrow: 'stable' }],
  2030: [{ label: 'TEMP', value: '+1.3', unit: '°C', arrow: 'up' }, { label: 'SEA', value: '+0.10', unit: 'm', arrow: 'up' }, { label: 'POP', value: '8.54', unit: 'B', arrow: 'stable' }],
  2035: [{ label: 'TEMP', value: '+1.5', unit: '°C', arrow: 'up' }, { label: 'SEA', value: '+0.15', unit: 'm', arrow: 'up' }, { label: 'POP', value: '8.90', unit: 'B', arrow: 'stable' }],
  2040: [{ label: 'TEMP', value: '+1.7', unit: '°C', arrow: 'up' }, { label: 'SEA', value: '+0.20', unit: 'm', arrow: 'up' }, { label: 'POP', value: '9.21', unit: 'B', arrow: 'stable' }],
  2045: [{ label: 'TEMP', value: '+1.9', unit: '°C', arrow: 'up' }, { label: 'SEA', value: '+0.25', unit: 'm', arrow: 'up' }, { label: 'POP', value: '9.48', unit: 'B', arrow: 'stable' }],
  2050: [{ label: 'TEMP', value: '+2.1', unit: '°C', arrow: 'up' }, { label: 'SEA', value: '+0.30', unit: 'm', arrow: 'up' }, { label: 'POP', value: '9.70', unit: 'B', arrow: 'stable' }],
};

interface DataPanelProps {
  activeYear: number;
  activeCity: CityData | null;
  earthMode?: EarthMode;
}

export default function DataPanel({ activeYear, activeCity, earthMode = 'realistic' }: DataPanelProps) {
  const isCyber = earthMode === 'cyber';
  const base    = statsData[activeYear] || statsData[2050];

  let stats = base;
  if (activeCity) {
    const yi       = (activeYear - 2025) / 5;
    const baseTemp = parseFloat(base[0].value);
    const cityTemp = baseTemp + activeCity.offsets.temp + yi * 0.12 * activeCity.offsets.tempRise;
    const tempStr  = (cityTemp > 0 ? '+' : '') + cityTemp.toFixed(1);
    let seaStr = 'N/A', seaUnit = '';
    if (activeCity.offsets.seaLevel > 0) {
      seaStr  = `+${(parseFloat(base[1].value) * activeCity.offsets.seaLevel).toFixed(2)}`;
      seaUnit = 'm';
    }
    const pop = (activeCity.offsets.population * 1000) * Math.pow(activeCity.offsets.popGrowth, yi);
    stats = [
      { label: 'TEMP', value: tempStr,         unit: '°C', arrow: 'up'     },
      { label: 'SEA',  value: seaStr,           unit: seaUnit, arrow: 'up' },
      { label: 'POP',  value: pop.toFixed(1),   unit: 'M', arrow: 'stable' },
    ];
  }

  return (
    <div
      className="fixed z-20 hidden lg:flex items-center gap-6"
      style={{ bottom: '52px', left: '40px', animation: 'fade-up 0.9s 0.4s cubic-bezier(0.22,1,0.36,1) both' }}
    >
      {isCyber ? (
        // ── Cyber mode: small glassmorphism cards ──────────────────────────
        stats.map((s, i) => (
          <div key={i} style={{
            padding: '8px 14px', minWidth: '80px',
            background: 'rgba(8, 20, 32, 0.55)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.50), 0 0 30px rgba(111, 234, 255, 0.03)',
            transition: 'all 0.6s ease',
          }}>
            <div style={{ fontSize: '6px', fontWeight: 300, letterSpacing: '0.35em', color: 'rgba(0,240,255,0.45)', textTransform: 'uppercase', marginBottom: '5px' }}>
              {s.label}
            </div>
            <div style={{ fontSize: '15px', fontWeight: 200, color: '#00E5FF', letterSpacing: '0.04em', textShadow: 'none' }}>
              {s.value}<span style={{ fontSize: '9px', color: 'rgba(0, 229, 255, 0.50)', marginLeft: '2px' }}>{s.unit}</span>
            </div>
          </div>
        ))
      ) : (
        // ── Realistic mode: floating text row ─────────────────────────────
        stats.map((s, i) => (
          <div key={i} className="flex items-baseline gap-1.5">
            <span style={{ fontSize: '7px', fontWeight: 300, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase' }}>
              {s.label}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: '7px' }}>·</span>
            <span style={{ fontSize: '11px', fontWeight: 200, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.05em' }}>
              {s.value}<span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.35)', marginLeft: '1px' }}>{s.unit}</span>
            </span>
            {i < stats.length - 1 && (
              <span style={{ color: 'rgba(255,255,255,0.08)', fontSize: '8px', marginLeft: '8px' }}>/</span>
            )}
          </div>
        ))
      )}
    </div>
  );
}

