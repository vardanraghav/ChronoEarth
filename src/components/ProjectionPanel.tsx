'use client';

import { useEffect, useState, useRef } from 'react';
import { CityData, generateCityProjections } from '../data/citiesData';

interface ProjectionPanelProps {
  activeYear:     number;
  activeCategory: string;
  activeCity:     CityData | null;
}

const projectionsData: Record<string, Record<number, { text: string; stability: number; status: string }>> = {
  'Ocean Monitoring': {
    2025: { text: 'Automated sensor buoys register stable thermohaline currents. Ocean acidification stabilizing.', stability: 70, status: 'MONITORING' },
    2030: { text: 'Sub-surface drone fleet deployed. Slight thermal anomalies in the North Atlantic detected.', stability: 74, status: 'OPTIMIZING' },
    2035: { text: 'Desalination runoff mitigation active. Sea surface warming slowed to +0.8°C above pre-industrial.', stability: 80, status: 'STABILIZING' },
    2040: { text: 'Arctic ice stabilization plateau reached. Albedo restoration projects fully operational.', stability: 85, status: 'SECURE' },
    2045: { text: 'Deep-sea methane capture active. Marine sanctuaries cover 30% of global ocean surfaces.', stability: 92, status: 'SECURE' },
    2050: { text: 'Thermohaline circulation stabilized. Ocean acidification reversed to 1990 baseline.', stability: 98, status: 'RECOVERED' },
  },
  'Biodiversity': {
    2025: { text: 'Genetic archiving of endangered species at 60% completion. Pollinator populations declining.', stability: 65, status: 'CRITICAL' },
    2030: { text: 'AI forestation drones plant 1 billion native trees. Ecological corridors linked globally.', stability: 72, status: 'ADAPTING' },
    2035: { text: 'Drought-resilient gene drives introduced. Wildlife migrations tracked via satellite in real-time.', stability: 78, status: 'STABILIZING' },
    2040: { text: 'Regenerative zones cover 40% of arable land. Extinction rates down 85% from 2020 baseline.', stability: 84, status: 'GROWING' },
    2045: { text: 'Urban biomes house 500+ native species per metropolis. Micro-climates fully optimized.', stability: 90, status: 'SECURE' },
    2050: { text: 'Genetic restoration reintroduces 200 formerly extinct species. Biodiversity index restored.', stability: 96, status: 'THRIVING' },
  },
  'Clean Energy': {
    2025: { text: 'Global solar and wind grid efficiency reaches 35%. Nuclear plants modernized globally.', stability: 75, status: 'TRANSITION' },
    2030: { text: 'First commercial fusion reactor online in Tokyo. Solid-state battery chemistry in mass production.', stability: 82, status: 'EXPANDING' },
    2035: { text: 'Orbital solar power beaming tests succeed. Wireless transmission hubs active for remote grids.', stability: 87, status: 'ACCELERATING' },
    2040: { text: 'Fossil fuels phased out in 85% of nations. Hyperconducting global energy grid operational.', stability: 93, status: 'SECURE' },
    2045: { text: '95% of planetary energy demand met by zero-emission sources. Carbon capture scaling.', stability: 97, status: 'SECURE' },
    2050: { text: 'Fusion grid generates surplus power, driving active global carbon extraction worldwide.', stability: 100, status: 'ABUNDANT' },
  },
  'Satellite Network': {
    2025: { text: 'ChronoNet-1 array launches. Atmospheric density and aerosol mapping active at 10m resolution.', stability: 80, status: 'ONLINE' },
    2030: { text: 'Quantum-encrypted communications array deployed. 1,200 low-Earth orbit units active.', stability: 85, status: 'ONLINE' },
    2035: { text: 'Carbon feedback loop active. Orbital laser spectroscopy detects greenhouse leaks in real-time.', stability: 88, status: 'SECURE' },
    2040: { text: 'Solar storm early warning fully operational. Magnetospheric shielding simulations validated.', stability: 92, status: 'SECURE' },
    2045: { text: 'Holographic weather-pattern projection grid active. Prediction modeling at 99.9% accuracy.', stability: 96, status: 'SECURE' },
    2050: { text: 'Digital twin of Earth running in real-time with zero latency. Universal telemetry coverage.', stability: 99, status: 'MAXIMUM' },
  },
};

const statusPalette: Record<string, string> = {
  CRITICAL:     '#ff6b6b',
  MONITORING:   'rgba(255,255,255,0.5)',
  ADAPTING:     'rgba(255,255,255,0.5)',
  TRANSITION:   'rgba(255,255,255,0.5)',
  OPTIMIZING:   'rgba(180,200,255,0.7)',
  STABILIZING:  'rgba(180,200,255,0.7)',
  GROWING:      'rgba(180,200,255,0.7)',
  EXPANDING:    'rgba(180,200,255,0.7)',
  ACCELERATING: 'rgba(180,200,255,0.7)',
  SECURE:       'rgba(255,255,255,0.65)',
  RECOVERED:    'rgba(255,255,255,0.65)',
  THRIVING:     'rgba(255,255,255,0.65)',
  ABUNDANT:     'rgba(255,255,255,0.65)',
  ONLINE:       'rgba(255,255,255,0.65)',
  MAXIMUM:      'rgba(255,255,255,0.65)',
};

export default function ProjectionPanel({ activeYear, activeCategory, activeCity }: ProjectionPanelProps) {
  const [visible, setVisible]   = useState(true);
  const [content, setContent]   = useState({ text: '', stability: 0, status: '' });
  const prevKey                 = useRef('');

  useEffect(() => {
    const key = `${activeYear}-${activeCategory}-${activeCity?.name ?? ''}`;
    if (key === prevKey.current) return;
    prevKey.current = key;

    const next = activeCity
      ? generateCityProjections(activeCity, activeCategory, activeYear)
      : (projectionsData[activeCategory]?.[activeYear] ?? { text: '', stability: 50, status: 'ONLINE' });

    // Fade out → swap content → fade in
    setVisible(false);
    const t = setTimeout(() => {
      setContent(next);
      setVisible(true);
    }, 280);
    return () => clearTimeout(t);
  }, [activeYear, activeCategory, activeCity]);

  // Initialise on first render
  useEffect(() => {
    const initial = projectionsData[activeCategory]?.[activeYear] ?? { text: '', stability: 50, status: 'ONLINE' };
    setContent(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusColor = statusPalette[content.status] ?? 'rgba(255,255,255,0.5)';

  return (
    <div
      style={{
        transition: 'opacity 0.28s ease',
        opacity:    visible ? 1 : 0,
        textAlign:  'center',
        maxWidth:   '420px',
        width:      '100%',
        margin:     '0 auto',
      }}
    >
      {/* Status badge */}
      <div
        style={{
          fontSize:     '7px',
          fontWeight:   300,
          letterSpacing:'0.45em',
          textTransform:'uppercase',
          color:        statusColor,
          marginBottom: '8px',
        }}
      >
        {activeCity ? activeCity.name.toUpperCase() : activeCategory.toUpperCase()}
        <span style={{ margin: '0 8px', color: 'rgba(255,255,255,0.15)' }}>·</span>
        {content.status}
      </div>

      {/* Projection sentence */}
      <p
        style={{
          fontSize:   '10px',
          fontWeight: 300,
          lineHeight: 1.7,
          color:      'rgba(255,255,255,0.42)',
          letterSpacing: '0.02em',
        }}
      >
        {content.text}
      </p>

      {/* Stability bar — 1px thin track */}
      <div
        style={{
          marginTop:      '14px',
          height:         '1px',
          width:          '100%',
          background:     'rgba(255,255,255,0.06)',
          position:       'relative',
          borderRadius:   '1px',
          overflow:       'hidden',
        }}
      >
        <div
          style={{
            position:   'absolute',
            top:        0,
            left:       0,
            height:     '100%',
            width:      `${content.stability}%`,
            background: 'rgba(255,255,255,0.35)',
            transition: 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
            borderRadius: '1px',
          }}
        />
      </div>
      {/* Stability label */}
      <div
        style={{
          marginTop:    '5px',
          display:      'flex',
          justifyContent:'space-between',
          fontSize:     '7px',
          fontWeight:   300,
          letterSpacing:'0.25em',
          color:        'rgba(255,255,255,0.18)',
          textTransform:'uppercase',
        }}
      >
        <span>PLANETARY STABILITY</span>
        <span>{content.stability}%</span>
      </div>
    </div>
  );
}
