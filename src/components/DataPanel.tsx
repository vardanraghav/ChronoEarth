'use client';

import { CityData } from '@/data/citiesData';

const statsData: Record<number, { label: string; value: string; unit: string }[]> = {
  2025: [
    { label: 'TEMP',  value: '+1.1', unit: '°C' },
    { label: 'SEA',   value: '+0.05', unit: 'm'  },
    { label: 'POP',   value: '8.15', unit: 'B'   },
  ],
  2030: [
    { label: 'TEMP',  value: '+1.3', unit: '°C' },
    { label: 'SEA',   value: '+0.10', unit: 'm'  },
    { label: 'POP',   value: '8.54', unit: 'B'   },
  ],
  2035: [
    { label: 'TEMP',  value: '+1.5', unit: '°C' },
    { label: 'SEA',   value: '+0.15', unit: 'm'  },
    { label: 'POP',   value: '8.90', unit: 'B'   },
  ],
  2040: [
    { label: 'TEMP',  value: '+1.7', unit: '°C' },
    { label: 'SEA',   value: '+0.20', unit: 'm'  },
    { label: 'POP',   value: '9.21', unit: 'B'   },
  ],
  2045: [
    { label: 'TEMP',  value: '+1.9', unit: '°C' },
    { label: 'SEA',   value: '+0.25', unit: 'm'  },
    { label: 'POP',   value: '9.48', unit: 'B'   },
  ],
  2050: [
    { label: 'TEMP',  value: '+2.1', unit: '°C' },
    { label: 'SEA',   value: '+0.30', unit: 'm'  },
    { label: 'POP',   value: '9.70', unit: 'B'   },
  ],
};

interface DataPanelProps {
  activeYear: number;
  activeCity: CityData | null;
}

export default function DataPanel({ activeYear, activeCity }: DataPanelProps) {
  const base = statsData[activeYear] || statsData[2050];

  // Derive city-specific metrics when a city is focused
  let stats = base;
  if (activeCity) {
    const yearIndex = (activeYear - 2025) / 5;
    const baseTemp  = parseFloat(base[0].value);
    const cityTemp  = baseTemp + activeCity.offsets.temp + yearIndex * 0.12 * activeCity.offsets.tempRise;
    const tempStr   = (cityTemp > 0 ? '+' : '') + cityTemp.toFixed(1);

    let seaStr  = 'N/A';
    let seaUnit = '';
    if (activeCity.offsets.seaLevel > 0) {
      const baseSea = parseFloat(base[1].value);
      seaStr  = `+${(baseSea * activeCity.offsets.seaLevel).toFixed(2)}`;
      seaUnit = 'm';
    }

    const cityPop = (activeCity.offsets.population * 1000) *
      Math.pow(activeCity.offsets.popGrowth, yearIndex);

    stats = [
      { label: 'TEMP',  value: tempStr,            unit: '°C' },
      { label: 'SEA',   value: seaStr,              unit: seaUnit },
      { label: 'POP',   value: cityPop.toFixed(1),  unit: 'M'  },
    ];
  }

  return (
    <div
      className="fixed z-20 hidden lg:flex items-center gap-6"
      style={{
        bottom: '52px',
        left:   '40px',
        animation: 'fade-up 0.9s 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
      }}
    >
      {stats.map((stat, i) => (
        <div key={i} className="flex items-baseline gap-1.5">
          {/* Label */}
          <span
            style={{
              fontSize:     '7px',
              fontWeight:   300,
              letterSpacing:'0.3em',
              color:        'rgba(255,255,255,0.28)',
              textTransform:'uppercase',
            }}
          >
            {stat.label}
          </span>
          {/* Separator */}
          <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: '7px' }}>·</span>
          {/* Value */}
          <span
            style={{
              fontSize:  '11px',
              fontWeight: 200,
              color:     'rgba(255,255,255,0.75)',
              letterSpacing: '0.05em',
            }}
          >
            {stat.value}
            <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.35)', marginLeft: '1px' }}>
              {stat.unit}
            </span>
          </span>
          {/* Inter-metric divider */}
          {i < stats.length - 1 && (
            <span style={{ color: 'rgba(255,255,255,0.08)', fontSize: '8px', marginLeft: '8px' }}>
              /
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
