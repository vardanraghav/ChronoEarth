'use client';

import { useEffect, useState, useRef } from 'react';
import { CityData, generateCityProjections } from '../data/citiesData';
import { EarthMode } from './CesiumGlobeContent';

interface ProjectionPanelProps {
  activeYear:     number;
  activeCategory: string;
  activeCity:     CityData | null;
  earthMode?:     EarthMode;
}

const projectionsData: Record<string, Record<number, { text: string; stability: number; status: string }>> = {
  'Climate Recovery': {
    2025: { text: 'Carbon sequestration hubs active. Global CO2 levels stabilize at 418 ppm.', stability: 62, status: 'CRITICAL' },
    2030: { text: 'Albedo restoration meshes deployed over Arctic boundaries. Ice-pack loss rate drops 35%.', stability: 68, status: 'TRANSITION' },
    2035: { text: 'Ocean iron fertilization trials succeed. Massive marine plankton blooms capture 2GT carbon.', stability: 74, status: 'MONITORING' },
    2040: { text: 'Global temperature anomaly peak reached. Net-negative emissions achieved in 92 countries.', stability: 82, status: 'STABILIZING' },
    2045: { text: 'Direct-air capture arrays scale globally, extracting 15GT of greenhouse gases per annum.', stability: 90, status: 'SECURE' },
    2050: { text: 'Atmospheric methane levels returned to pre-industrial baselines. Planetary temperature anomaly stabilized.', stability: 98, status: 'RECOVERED' },
  },
  'Clean Energy': {
    2025: { text: 'Global solar and wind grid efficiency reaches 35%. Nuclear plants modernized globally.', stability: 75, status: 'TRANSITION' },
    2030: { text: 'First commercial fusion reactor online in Tokyo. Solid-state battery chemistry in mass production.', stability: 82, status: 'EXPANDING' },
    2035: { text: 'Orbital solar power beaming tests succeed. Wireless transmission hubs active for remote grids.', stability: 87, status: 'ACCELERATING' },
    2040: { text: 'Fossil fuels phased out in 85% of nations. Hyperconducting global energy grid operational.', stability: 93, status: 'SECURE' },
    2045: { text: '95% of planetary energy demand met by zero-emission sources. Carbon capture scaling.', stability: 97, status: 'SECURE' },
    2050: { text: 'Fusion grid generates surplus power, driving active global carbon extraction worldwide.', stability: 100, status: 'ABUNDANT' },
  },
  'Biodiversity': {
    2025: { text: 'Genetic archiving of endangered species at 60% completion. Pollinator populations declining.', stability: 65, status: 'CRITICAL' },
    2030: { text: 'AI forestation drones plant 1 billion native trees. Ecological corridors linked globally.', stability: 72, status: 'ADAPTING' },
    2035: { text: 'Drought-resilient gene drives introduced. Wildlife migrations tracked via satellite in real-time.', stability: 78, status: 'STABILIZING' },
    2040: { text: 'Regenerative zones cover 40% of arable land. Extinction rates down 85% from 2020 baseline.', stability: 84, status: 'GROWING' },
    2045: { text: 'Urban biomes house 500+ native species per metropolis. Micro-climates fully optimized.', stability: 90, status: 'SECURE' },
    2050: { text: 'Genetic restoration reintroduces 200 formerly extinct species. Biodiversity index restored.', stability: 96, status: 'THRIVING' },
  },
  'AI Infrastructure': {
    2025: { text: 'Decentralized compute grids interlink regional hubs. Basic quantum routing protocols deployed.', stability: 70, status: 'MONITORING' },
    2030: { text: 'Global neural network array (ChronoOS) initialized. Autonomous telemetry streams online.', stability: 76, status: 'OPTIMIZING' },
    2035: { text: 'Real-time resource prediction models online. Artificial intelligence manages 45% of power grids.', stability: 83, status: 'STABILIZING' },
    2040: { text: 'Quantum-internet backbone bridges continents. Latency-free global sync loops established.', stability: 89, status: 'SECURE' },
    2045: { text: 'Autonomous biosphere defense loops active, monitoring ecosystem health via deep neural telemetry.', stability: 94, status: 'SECURE' },
    2050: { text: 'Cognitive digital twin of Earth running in real-time, executing millions of sustainability projections per second.', stability: 99, status: 'MAXIMUM' },
  },
  'Smart Cities': {
    2025: { text: 'First generation eco-districts deploy greywater loop arrays and building-integrated PV glass.', stability: 72, status: 'MONITORING' },
    2030: { text: 'Sponge-city water management projects active. Real-time air purification grids deployed.', stability: 78, status: 'ADAPTING' },
    2035: { text: 'Self-repairing smart concrete implemented. Hyper-local vertical farm systems feed 30% of cities.', stability: 84, status: 'GROWING' },
    2040: { text: 'AI-driven traffic and logistics routing removes congestion. Noise pollution down 90%.', stability: 91, status: 'SECURE' },
    2045: { text: 'Net-zero modular high-rises dominate metropolises. Automated solar cooling vents active.', stability: 95, status: 'SECURE' },
    2050: { text: 'Eco-metropolises reach full carbon-negative status. Smart urban structures completely integrated with local biomes.', stability: 98, status: 'THRIVING' },
  },
  'Transportation Networks': {
    2025: { text: 'Autonomous cargo drone corridors established. Inter-city rail lines electrified.', stability: 74, status: 'MONITORING' },
    2030: { text: 'Maglev rail link between major regional centers online. Battery-electric aviation arrays scale.', stability: 80, status: 'EXPANDING' },
    2035: { text: 'First global Hyperloop tube network becomes active, bridging high-density logistics hubs.', stability: 85, status: 'ACCELERATING' },
    2040: { text: 'Autonomous ocean shipping lanes active, powered by wind-wing sails and hydrogen fuels.', stability: 90, status: 'SECURE' },
    2045: { text: 'Atmospheric drone flight grids optimized. Multi-modal automated transit hubs operational.', stability: 94, status: 'SECURE' },
    2050: { text: 'Global zero-emission transit networks fully integrated, cutting logistics latency to record lows.', stability: 99, status: 'MAXIMUM' },
  },
  'Ocean Monitoring': {
    2025: { text: 'Automated sensor buoys register stable thermohaline currents. Ocean acidification stabilizing.', stability: 70, status: 'MONITORING' },
    2030: { text: 'Sub-surface drone fleet deployed. Slight thermal anomalies in the North Atlantic detected.', stability: 74, status: 'OPTIMIZING' },
    2035: { text: 'Desalination runoff mitigation active. Sea surface warming slowed to +0.8°C above pre-industrial.', stability: 80, status: 'STABILIZING' },
    2040: { text: 'Arctic ice stabilization plateau reached. Albedo restoration projects fully operational.', stability: 85, status: 'SECURE' },
    2045: { text: 'Deep-sea methane capture active. Marine sanctuaries cover 30% of global ocean surfaces.', stability: 92, status: 'SECURE' },
    2050: { text: 'Thermohaline circulation stabilized. Ocean acidification reversed to 1990 baseline.', stability: 98, status: 'RECOVERED' },
  },
  'Population Growth': {
    2025: { text: 'Global population rises to 8.2 billion. High-density urban carrying limits monitored.', stability: 68, status: 'MONITORING' },
    2030: { text: 'Population shift to smart regional hubs. Decentralized demographic grids active.', stability: 73, status: 'TRANSITION' },
    2035: { text: 'Suburban de-densification projects restore farmland. Demographic sustainability loops active.', stability: 79, status: 'STABILIZING' },
    2040: { text: 'Global population stabilizes at 9.2 billion. Universal quality-of-life indexes improve.', stability: 86, status: 'SECURE' },
    2045: { text: 'Zero-impact micro-settlements house 15% of population. Megacities maintain sustainable capacities.', stability: 92, status: 'SECURE' },
    2050: { text: 'Planetary carrying capacity balanced at 9.7 billion. Universal demographic stability achieved.', stability: 97, status: 'STABLE' },
  },
  'Water Systems': {
    2025: { text: 'Aquifer replenishment grids initialized. Smart agricultural watering systems deployed.', stability: 66, status: 'CRITICAL' },
    2030: { text: 'Atmospheric moisture harvesters scale in arid regions. Groundwater depletion rates drop 40%.', stability: 72, status: 'ADAPTING' },
    2035: { text: 'Closed-loop municipal bio-reactors active. Desalination plant energy requirement cut in half.', stability: 78, status: 'STABILIZING' },
    2040: { text: 'Smart watershed telemetry grids online. Glacier runoff regulation systems active.', stability: 85, status: 'SECURE' },
    2045: { text: 'Global clean water access reaches 100%. Major river basins monitored in real-time.', stability: 91, status: 'SECURE' },
    2050: { text: 'Planetary aquifers fully recharged. Sustainable closed-loop water cycles operational in all metropolises.', stability: 96, status: 'RECOVERED' },
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

export default function ProjectionPanel({ activeYear, activeCategory, activeCity, earthMode = 'realistic' }: ProjectionPanelProps) {
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
          color:        earthMode === 'cyber' ? 'rgba(0,240,255,0.60)' : statusColor,
          marginBottom: '8px',
          textShadow:   earthMode === 'cyber' ? '0 0 10px rgba(0,240,255,0.40)' : 'none',
        }}
      >
        {activeCity ? activeCity.name.toUpperCase() : activeCategory.toUpperCase()}
        <span style={{ margin: '0 8px', color: earthMode === 'cyber' ? 'rgba(0,240,255,0.15)' : 'rgba(255,255,255,0.15)' }}>·</span>
        {content.status}
      </div>

      {/* Projection sentence */}
      <p
        style={{
          fontSize:      '10px',
          fontWeight:    300,
          lineHeight:    1.7,
          color:         earthMode === 'cyber' ? 'rgba(0,240,255,0.50)' : 'rgba(255,255,255,0.42)',
          letterSpacing: '0.02em',
          transition:    'color 0.6s ease',
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
            position: 'absolute', top: 0, left: 0, height: '100%',
            width:    `${content.stability}%`,
            background: earthMode === 'cyber' ? 'rgba(0,240,255,0.60)' : 'rgba(255,255,255,0.35)',
            transition: 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
            borderRadius: '1px',
            boxShadow: earthMode === 'cyber' ? '0 0 6px rgba(0,240,255,0.70)' : 'none',
          }}
        />
      </div>
      {/* Stability label */}
      <div
        style={{
          marginTop:     '5px',
          display:       'flex',
          justifyContent:'space-between',
          fontSize:      '7px',
          fontWeight:    300,
          letterSpacing: '0.25em',
          color:         earthMode === 'cyber' ? 'rgba(0,240,255,0.25)' : 'rgba(255,255,255,0.18)',
          textTransform: 'uppercase',
          transition:    'color 0.6s ease',
        }}
      >
        <span>PLANETARY STABILITY</span>
        <span>{content.stability}%</span>
      </div>
    </div>
  );
}
