'use client';

import { useEffect, useState } from 'react';
import { CityData, generateCityProjections } from '../data/citiesData';

interface ProjectionPanelProps {
  activeYear: number;
  activeCategory: string;
  activeCity: CityData | null;
}

const projectionsData: Record<
  string,
  Record<number, { text: string; stability: number; status: string }>
> = {
  'Ocean Monitoring': {
    2025: { text: "Automated sensor buoys register stable thermohaline currents. pH levels average 8.05. Coral bleaching affects 15% of reefs.", stability: 70, status: "MONITORING" },
    2030: { text: "Sub-surface autonomous drone fleet fully deployed. Slight thermal anomalies detected in the North Atlantic. Ocean acidification rates stabilizing.", stability: 74, status: "OPTIMIZING" },
    2035: { text: "Desalination runoff mitigation systems active. Average sea surface temperature warming slowed to +0.8°C above pre-industrial levels.", stability: 80, status: "STABILIZING" },
    2040: { text: "Arctic summer ice volume reaches stabilization plateau. Albedo restoration projects active. Coastal surge barriers fully operational.", stability: 85, status: "SECURE" },
    2045: { text: "Deep-sea methane capture vents active. Marine conservation sanctuaries expanded to cover 30% of global ocean surfaces.", stability: 92, status: "SECURE" },
    2050: { text: "Thermohaline circulation stabilized via deep-water heat sinks. Ocean acidification fully reversed to 1990 baseline levels.", stability: 98, status: "RECOVERED" }
  },
  'Biodiversity': {
    2025: { text: "Global genetic archiving of endangered species hits 60% completion. Forest pollinator populations show a minor 12% decline.", stability: 65, status: "CRITICAL" },
    2030: { text: "AI forestation drones plant 1 billion native trees. Ecological migration corridors linked across all major continents.", stability: 72, status: "ADAPTING" },
    2035: { text: "Synthetic biology introduces drought-resilient gene drives. Real-time satellite tracking of wildlife migrations active.", stability: 78, status: "STABILIZING" },
    2040: { text: "Regenerative agricultural zones cover 40% of arable land. Extinction rates decrease by 85% compared to the 2020 baseline.", stability: 84, status: "GROWING" },
    2045: { text: "Vertical urban biomes successfully house 500+ species of native flora and fauna per major metropolis. Micro-climates optimized.", stability: 90, status: "SECURE" },
    2050: { text: "Targeted genetic restoration successfully reintroduces 200 formerly extinct species. Global biodiversity index fully restored.", stability: 96, status: "THRIVING" }
  },
  'Clean Energy': {
    2025: { text: "Global solar and wind grid efficiency reaches 35% average. Nuclear fission plants modernized with next-gen safety systems.", stability: 75, status: "TRANSITION" },
    2030: { text: "First commercial fusion reactor goes online in Tokyo (500MW capacity). Solid-state battery chemistry achieves mass production.", stability: 82, status: "EXPANDING" },
    2035: { text: "Orbital solar power beaming tests succeed. Wireless energy transmission hubs active for remote and high-altitude grids.", stability: 87, status: "ACCELERATING" },
    2040: { text: "Fossil fuels completely phased out in 85% of sovereign nations. Hyperconducting global energy grid becomes fully operational.", stability: 93, status: "SECURE" },
    2045: { text: "Planetary energy demand is 95% met by zero-emission fusion, solar, and wind. High-capacity carbon capture scrubbing active.", stability: 97, status: "SECURE" },
    2050: { text: "Infinite clean power achieved worldwide. Fusion energy grid generates surplus power, driving active global carbon extraction.", stability: 100, status: "ABUNDANT" }
  },
  'Satellite Network': {
    2025: { text: "ChronoNet-1 orbital array launches. Real-time atmospheric density and aerosol mapping goes active with 10-meter resolution.", stability: 80, status: "ONLINE" },
    2030: { text: "Quantum-encrypted satellite communications array deployed. Low-Earth orbit telemetry swarm reaches 1,200 active units.", stability: 85, status: "ONLINE" },
    2035: { text: "Direct atmospheric carbon density feedback loop active. Orbital laser spectroscopy detects greenhouse gas leaks in real-time.", stability: 88, status: "SECURE" },
    2040: { text: "Solar storm early warning network fully operational. Magnetospheric shielding simulations validated via orbital sensors.", stability: 92, status: "SECURE" },
    2045: { text: "Holographic weather-pattern projection grid active. Global weather prediction modeling reaches 99.9% simulation accuracy.", stability: 96, status: "SECURE" },
    2050: { text: "Digital twin of Earth running in real-time with zero latency. Universal telemetry coverage feeds planetary management systems.", stability: 99, status: "MAXIMUM" }
  }
};

export default function ProjectionPanel({ activeYear, activeCategory, activeCity }: ProjectionPanelProps) {
  const [displayText, setDisplayText] = useState('');
  const currentProjection = activeCity
    ? generateCityProjections(activeCity, activeCategory, activeYear)
    : (projectionsData[activeCategory]?.[activeYear] || {
        text: 'Simulation data unavailable.',
        stability: 50,
        status: 'UNKNOWN',
      });

  // Telemetry typing effect / instant fade-in when activeYear or activeCategory changes
  useEffect(() => {
    let active = true;
    let currentText = '';
    const fullText = currentProjection.text;
    let i = 0;
    
    // Quick typing simulation
    const interval = setInterval(() => {
      if (!active) return;
      if (i < fullText.length) {
        currentText += fullText[i];
        setDisplayText(currentText);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 12);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [activeYear, activeCategory, currentProjection.text]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return '#ef4444';
      case 'MONITORING':
      case 'ADAPTING':
      case 'TRANSITION':
        return '#f97316';
      case 'OPTIMIZING':
      case 'STABILIZING':
      case 'GROWING':
      case 'EXPANDING':
      case 'ACCELERATING':
        return '#8b5cf6';
      case 'SECURE':
      case 'RECOVERED':
      case 'THRIVING':
      case 'ABUNDANT':
      case 'ONLINE':
      case 'MAXIMUM':
      default:
        return '#00f0ff';
    }
  };

  const statusColor = getStatusColor(currentProjection.status);

  return (
    <>
      <style>{`
        @keyframes panel-glow-pulse {
          0%, 100% { box-shadow: 0 0 15px rgba(0, 240, 255, 0.05); }
          50%      { box-shadow: 0 0 25px rgba(0, 240, 255, 0.1); }
        }
        .hud-panel {
          animation: panel-glow-pulse 4s ease-in-out infinite;
        }
      `}</style>

      <div
        className="hud-panel relative w-full rounded-lg p-5 border select-none"
        style={{
          background: 'rgba(6, 9, 24, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'rgba(0, 240, 255, 0.15)',
        }}
      >
        {/* Sci-Fi Decorative Corner ticks */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400/40" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400/40" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400/40" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400/40" />

        {/* Panel Header */}
        <div className="flex items-center justify-between mb-3 border-b border-cyan-400/10 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3
              className="text-[9px] font-semibold tracking-[0.25em] uppercase"
              style={{ color: 'rgba(0, 240, 255, 0.7)' }}
            >
              {activeCity ? `NODAL TELEMETRY // ${activeCity.name.toUpperCase()}` : `DECADE TELEMETRY // ${activeCategory}`}
            </h3>
          </div>
          <span
            className="text-[8px] font-mono tracking-widest px-1.5 py-0.5 rounded border uppercase"
            style={{
              borderColor: `${statusColor}40`,
              color: statusColor,
              background: `${statusColor}08`,
            }}
          >
            {currentProjection.status}
          </span>
        </div>

        {/* Projection Year Title */}
        <div className="mb-2">
          <h4 className="text-sm font-light text-white tracking-[0.15em] uppercase">
            Simulation Year <span className="font-semibold text-cyan-400">{activeYear}</span>
          </h4>
        </div>

        {/* Typewritten projection content */}
        <div className="min-h-[50px] mb-4">
          <p className="text-xs font-light text-white/80 leading-relaxed font-mono">
            {displayText}
            <span className="inline-block w-1.5 h-3 bg-cyan-400 ml-1 animate-pulse" />
          </p>
        </div>

        {/* Stability Index */}
        <div>
          <div className="flex justify-between text-[9px] tracking-widest uppercase mb-1.5">
            <span className="text-white/40">{activeCity ? "Nodal Stability Index" : "Planetary Stability Index"}</span>
            <span className="font-mono text-cyan-400">{currentProjection.stability}%</span>
          </div>
          {/* Progress bar container */}
          <div className="h-1 w-full bg-cyan-950/40 rounded-full overflow-hidden border border-cyan-400/10">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${currentProjection.stability}%`,
                background: `linear-gradient(90deg, #8b5cf6 0%, #00f0ff 100%)`,
                boxShadow: '0 0 8px rgba(0, 240, 255, 0.5)',
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
