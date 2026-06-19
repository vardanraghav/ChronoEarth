'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import CesiumGlobe from '@/components/CesiumGlobe';
import BackgroundEffects from '@/components/BackgroundEffects';
import { useCities } from '@/hooks/useCities';
import { usePredictions } from '@/hooks/usePredictions';
import { useSpaceEvents } from '@/hooks/useSpaceEvents';
import { useEarthquakes } from '@/hooks/useEarthquakes';
import { useMarketOverview } from '@/hooks/useMarketOverview';
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase';

const DEFAULT_OVERLAYS = { climate: true, pollution: false, energy: true, satellite: true, ai: false };

export function HomeContent() {
  const router = useRouter();
  const { cities } = useCities();
  const { predictions } = usePredictions();
  const { spaceEvents, loading: spaceLoading } = useSpaceEvents();
  const { earthquakes, loading: quakeLoading } = useEarthquakes(4.5);
  const { snapshots, loading: marketLoading } = useMarketOverview();
  const { kbArticles } = useKnowledgeBase();

  const [activeYear, setActiveYear] = useState<2025 | 2030 | 2040 | 2050>(2050);
  const [activeSection, setActiveSection] = useState<'dossier' | 'globe'>('dossier');
  const [globeHovered, setGlobeHovered] = useState(false);

  const spaceSweep = activeYear === 2050 ? '42 Sweep' : (activeYear === 2040 ? '28 Sweep' : (activeYear === 2030 ? '15 Sweep' : '8 Sweep'));
  const climateTemp = activeYear === 2050 ? '+1.8°C' : (activeYear === 2040 ? '+1.45°C' : (activeYear === 2030 ? '+1.10°C' : '+0.85°C'));
  const siliconYield = activeYear === 2050 ? '98.5%' : (activeYear === 2040 ? '95.8%' : (activeYear === 2030 ? '92.5%' : '88.2%'));
  const seismicMag = activeYear === 2050 ? '4.8 Mag' : (activeYear === 2040 ? '4.5 Mag' : (activeYear === 2030 ? '4.2 Mag' : '3.8 Mag'));

  // Filter and sort predictions for selected year
  const yearPredictions = predictions.filter(p => p.year === activeYear || (p.year <= activeYear && activeYear === 2025));
  const sortedPredictions = [...yearPredictions].sort((a, b) => b.votes - a.votes);

  // Latest prediction for alerts
  const latestPrediction = predictions.length > 0 ? predictions[0] : null;

  // NASA space event for alerts
  const latestSpaceEvent = spaceEvents.length > 0 ? spaceEvents[0] : null;

  // NASA APOD event for image card
  const apodEvent = spaceEvents.find(e => e.event_type === 'APOD') || spaceEvents.find(e => e.image_url);

  // Markets ticker alert
  const marketAlert = snapshots.length > 0 ? snapshots[0] : null;

  // Latest earthquake alert
  const latestQuake = earthquakes.length > 0 ? earthquakes[0] : null;

  // Helper for sparklines
  const renderMiniSparkline = (points: number[], color: string) => {
    const max = Math.max(...points, 1);
    const min = Math.min(...points, 0);
    const range = max - min || 1;
    const svgPoints = points.map((val, idx) => {
      const x = idx * 20;
      const y = 18 - ((val - min) / range) * 14;
      return `${x},${y}`;
    }).join(' ');
    return (
      <svg className="w-20 h-6" viewBox="0 0 100 20" style={{ overflow: 'visible' }}>
        <polyline points={svgPoints} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  return (
    <main className="relative min-h-screen bg-[#02060A] text-[#e2e8f0] overflow-y-auto overflow-x-hidden custom-scrollbar font-mono pb-20 selection:bg-[#00E5FF]/20">
      
      {/* ── BACKGROUND 3D GLOBE AREA ───────────────────────────────────── */}
      <div 
        className={`fixed inset-0 transition-all duration-700 ease-in-out ${
          activeSection === 'globe' ? 'z-40 scale-100 opacity-100' : 'z-0 opacity-45 scale-95'
        }`}
        style={{ pointerEvents: activeSection === 'globe' ? 'auto' : 'none' }}
      >
        <CesiumGlobe
          activeYear={activeYear}
          activeCategory="AI"
          activeCity={null}
          setActiveCity={(c) => {
            if (c) router.push(`/city/${c.name.toLowerCase().replace(/\s+/g, '-')}`);
          }}
          activeCountry={null}
          setActiveCountry={(code) => {
            if (code) router.push(`/dashboard?country=${code}`);
          }}
          overlays={DEFAULT_OVERLAYS}
          earthMode="cyber"
          cities={cities}
          activeLayers={{
            cities: true,
            climate: true,
            tech: true,
            energy: true,
            space: activeYear >= 2040,
            geopolitical: true,
          }}
          activeSimulations={{
            seaLevelRise: activeYear === 2050 ? 0.45 : (activeYear === 2040 ? 0.20 : 0.05),
            fusionBreakthrough: activeYear >= 2040,
            agiEmergence: activeYear >= 2030,
            popDecline: false,
            renewableTransition: activeYear >= 2030,
            arcticDominance: activeYear >= 2040,
            semiDisruptions: false,
          }}
        />
      </div>

      {/* Atmospheric Space Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <BackgroundEffects earthMode="cyber" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#02060A]/85 via-transparent to-[#02060A]/95" />
      </div>

      {/* Top Global Navigation */}
      <Navbar />

      {/* Interactive Toggle for Globe vs Dashboard mode */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center bg-black/60 border border-[#00E5FF]/30 p-1.5 rounded-full backdrop-blur-xl">
        <button
          onClick={() => setActiveSection('dossier')}
          className={`px-5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
            activeSection === 'dossier' 
              ? 'bg-[#00E5FF] text-[#02060A] shadow-[0_0_12px_rgba(0,229,255,0.4)]' 
              : 'text-white/60 hover:text-white bg-transparent'
          }`}
        >
          🎛️ Command Desk
        </button>
        <button
          onClick={() => setActiveSection('globe')}
          className={`px-5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
            activeSection === 'globe' 
              ? 'bg-[#00E5FF] text-[#02060A] shadow-[0_0_12px_rgba(0,229,255,0.4)]' 
              : 'text-white/60 hover:text-white bg-transparent'
          }`}
        >
          🌍 Orbit View
        </button>
      </div>

      {/* ── COMMAND DESK INTERFACE OVERLAY ──────────────────────────────── */}
      {activeSection === 'dossier' && (
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 flex flex-col gap-10 animate-fade-up">
          
          {/* Top Panel: Left Brand Info & Right Alert Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Brand HUD (Col 4) */}
            <div className="lg:col-span-4 premium-glass p-6 rounded-2xl flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#00E5FF]/5 rounded-full blur-[65px] pointer-events-none" />
              <div>
                <div className="flex items-center gap-1.5 text-white tracking-[0.35em] uppercase font-sans text-xl mb-1">
                  <span>CHRONO</span>
                  <span className="text-[#00E5FF] font-semibold glow-primary">EARTH</span>
                </div>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-0.5">Explore Earth 2050</p>
              </div>

              {/* Dynamic Live Status Counts */}
              <div className="flex flex-col gap-3 font-mono text-xs border-y border-white/5 py-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/50">Planetary Nodes:</span>
                  <span className="text-white font-bold">{cities.length} Cities</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50">Timeline Projections:</span>
                  <span className="text-white font-bold">{predictions.length} Forecasts</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50">Codex Tech Shards:</span>
                  <span className="text-white font-bold">{kbArticles.length} Articles</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50">Live Climate Feed:</span>
                  <span className="text-[#00F5B0] font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00F5B0] animate-pulse" /> Active
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50">Space Surveillance:</span>
                  <span className="text-[#BF5AF2] font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#BF5AF2] animate-pulse" /> Scanning
                  </span>
                </div>
              </div>

              {/* Action Uplinks */}
              <div className="flex flex-col gap-2">
                <Link
                  href="/dashboard"
                  className="w-full py-2.5 bg-[#00E5FF] hover:bg-[#00D98F] text-[#02060A] text-xs font-semibold rounded text-center transition-all duration-300 no-underline tracking-wider uppercase font-mono shadow-[0_0_12px_rgba(0,229,255,0.2)]"
                >
                  Explore Future Desk
                </Link>
                <Link
                  href="/feed"
                  className="w-full py-2 border border-[#00E5FF]/20 hover:border-[#00E5FF]/50 text-white/80 hover:text-white text-xs rounded transition-all duration-300 font-mono uppercase tracking-wider text-center no-underline hover:bg-white/5"
                >
                  Open Intelligence Feed
                </Link>
              </div>
            </div>

            {/* Right Alerts List (Col 8) */}
            <div className="lg:col-span-8 premium-glass p-6 rounded-2xl flex flex-col gap-5">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block border-b border-white/5 pb-2.5">
                LIVE INTELLIGENCE // REAL-TIME ALERT MATRIX
              </span>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Alert Cards list (Col 7) */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Alert 1: Latest Prediction */}
                  {latestPrediction && (
                    <Link 
                      href={`/predictions/${latestPrediction.slug}`}
                      className="p-4 bg-black/40 border border-white/5 hover:border-[#00E5FF]/30 rounded-xl flex flex-col gap-2 no-underline group transition-all"
                    >
                      <div className="flex justify-between items-center text-[9px] font-mono text-[#00E5FF]">
                        <span>🔮 TIMELINE SHARD ALERT</span>
                        <span>{latestPrediction.confidenceScore}% Likelihood</span>
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-[#00E5FF] transition-colors truncate m-0 font-mono">
                        {latestPrediction.title}
                      </h4>
                      <p className="text-[10px] text-white/50 m-0 font-sans line-clamp-2 leading-relaxed">
                        {latestPrediction.description}
                      </p>
                    </Link>
                  )}

                  {/* Alert 2: NASA Space Event */}
                  {latestSpaceEvent && (
                    <Link 
                      href="/space" 
                      className="p-4 bg-black/40 border border-white/5 hover:border-[#BF5AF2]/30 rounded-xl flex flex-col gap-2 no-underline group transition-all"
                    >
                      <div className="flex justify-between items-center text-[9px] font-mono text-[#BF5AF2]">
                        <span>🚀 ORBITAL EVENT SPEC</span>
                        <span>{new Date(latestSpaceEvent.event_date).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-[#BF5AF2] transition-colors truncate m-0 font-mono">
                        {latestSpaceEvent.title}
                      </h4>
                      <p className="text-[10px] text-white/50 m-0 font-sans line-clamp-2 leading-relaxed">
                        {latestSpaceEvent.description || 'Live orbital telemetry scanning for near-Earth object corridors.'}
                      </p>
                    </Link>
                  )}

                  {/* Alert 3: Market Alert */}
                  {marketAlert && (
                    <Link 
                      href="/markets" 
                      className="p-4 bg-black/40 border border-white/5 hover:border-[#00F5B0]/30 rounded-xl flex flex-col gap-2 no-underline group transition-all"
                    >
                      <div className="flex justify-between items-center text-[9px] font-mono text-[#00F5B0]">
                        <span>📈 HARDWARE MARKET INDEX</span>
                        <span>{marketAlert.change_percent}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-[#00F5B0] transition-colors m-0 font-mono">
                        {marketAlert.ticker} Stock Ticker
                      </h4>
                      <p className="text-[10px] text-white/50 m-0 font-sans line-clamp-2 leading-relaxed">
                        Current Price: ${marketAlert.price.toFixed(2)} USD. High volume trading detected on silicon hardware nodes.
                      </p>
                    </Link>
                  )}

                  {/* Alert 4: Seismic Alert */}
                  {latestQuake && (
                    <Link 
                      href="/earthquakes" 
                      className="p-4 bg-black/40 border border-white/5 hover:border-red-500/30 rounded-xl flex flex-col gap-2 no-underline group transition-all"
                    >
                      <div className="flex justify-between items-center text-[9px] font-mono text-red-400">
                        <span>🌋 FAULT LINE ANOMALY</span>
                        <span>{latestQuake.magnitude.toFixed(1)} Magnitude</span>
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors truncate m-0 font-mono">
                        {latestQuake.place}
                      </h4>
                      <p className="text-[10px] text-white/50 m-0 font-sans line-clamp-2 leading-relaxed">
                        Depth recorded: {latestQuake.depth?.toFixed(1) || '0.0'} km. Fault line activity registered under USGS.
                      </p>
                    </Link>
                  )}
                </div>

                {/* Image Intelligence Card (Col 5) */}
                <div className="lg:col-span-5 flex flex-col gap-3">
                  <div className="relative flex-1 min-h-[200px] rounded-xl overflow-hidden border border-white/5 group bg-black/40">
                    {apodEvent?.image_url ? (
                      <>
                        <img 
                          src={apodEvent.image_url} 
                          alt={apodEvent.title} 
                          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-[#071826] to-[#040B12] border border-[#00E5FF]/20">
                        <span className="text-2xl mb-1">🛰️</span>
                        <span className="text-[9px] font-mono text-white/50 uppercase tracking-wider">Establishing Imagery Link...</span>
                        <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden mt-3">
                          <div className="h-full bg-[#00E5FF] animate-pulse" style={{ width: '60%' }} />
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#BF5AF2]/30 flex items-center gap-1.5 z-10">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#BF5AF2] animate-pulse" />
                      <span className="text-[8px] font-mono text-[#BF5AF2] uppercase tracking-wider">ORBITAL IMAGERY</span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-1 z-10">
                      <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">{apodEvent?.event_date || 'LIVE SCAN'}</span>
                      <h4 className="text-[11px] font-bold text-white m-0 truncate font-mono tracking-wide group-hover:text-[#00E5FF] transition-colors">
                        {apodEvent?.title || 'Telemetry Camera Feed Active'}
                      </h4>
                    </div>
                  </div>
                  
                  <Link 
                    href="/space" 
                    className="w-full py-2 bg-[#BF5AF2]/10 hover:bg-[#BF5AF2]/20 border border-[#BF5AF2]/20 text-[#BF5AF2] text-[10px] font-bold rounded text-center transition-all duration-300 no-underline tracking-widest uppercase font-mono"
                  >
                    Open Space Surveillance
                  </Link>
                </div>

              </div>
            </div>
          </div>

          {/* ── SECTION: 4 LARGE CORE TELEMETRY WIDGETS ───────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Widget 1: Space Intelligence */}
            <div className="premium-glass p-5 rounded-2xl flex flex-col justify-between min-h-[200px] border hover:border-[#BF5AF2]/30 hover:shadow-[0_0_15px_rgba(191,90,242,0.1)] transition-all duration-300">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start text-xs font-mono text-[#BF5AF2]">
                  <span>🚀 SPACE INTEL</span>
                  <span className="w-2 h-2 rounded-full bg-[#BF5AF2] animate-pulse" />
                </div>
                <h3 className="text-base font-semibold text-white mt-1 m-0">LEO ORBIT PATROLS</h3>
                <p className="text-[10px] text-white/40 font-mono">Lunar Helium-3 Logistics Loop</p>
              </div>

              <div className="my-3 flex justify-between items-center">
                <span className="text-2xl font-bold font-mono text-white/95">{spaceSweep}</span>
                {renderMiniSparkline([10, 15, 8, 25, 42], '#BF5AF2')}
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <Link
                  href="/space"
                  className="w-full py-1.5 bg-[#BF5AF2]/15 hover:bg-[#BF5AF2]/30 border border-[#BF5AF2]/20 text-[#BF5AF2] text-[10px] font-bold rounded text-center transition-all duration-300 no-underline tracking-widest uppercase font-mono"
                >
                  UPLINK HUB
                </Link>
                <div className="text-[8px] text-[#7A8694] font-mono text-center uppercase tracking-widest mt-1">Timeline: LEO Core Clear</div>
              </div>
            </div>

            {/* Widget 2: Climate Intelligence */}
            <div className="premium-glass p-5 rounded-2xl flex flex-col justify-between min-h-[200px] border hover:border-[#FF0055]/30 hover:shadow-[0_0_15px_rgba(255,0,85,0.1)] transition-all duration-300">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start text-xs font-mono text-[#FF0055]">
                  <span>🌡️ CLIMATE INTEL</span>
                  <span className="w-2 h-2 rounded-full bg-[#FF0055] animate-pulse" />
                </div>
                <h3 className="text-base font-semibold text-white mt-1 m-0">PLANETARY WARMING</h3>
                <p className="text-[10px] text-white/40 font-mono">RCP 8.5 Scenario Projection</p>
              </div>

              <div className="my-3 flex justify-between items-center">
                <span className="text-2xl font-bold font-mono text-white/95">{climateTemp}</span>
                {renderMiniSparkline([1.1, 1.3, 1.5, 1.7, 1.8], '#FF0055')}
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <Link
                  href="/climate"
                  className="w-full py-1.5 bg-[#FF0055]/15 hover:bg-[#FF0055]/30 border border-[#FF0055]/20 text-[#FF0055] text-[10px] font-bold rounded text-center transition-all duration-300 no-underline tracking-widest uppercase font-mono"
                >
                  UPLINK HUB
                </Link>
                <div className="text-[8px] text-[#7A8694] font-mono text-center uppercase tracking-widest mt-1">Timeline: Geo-engineering Open</div>
              </div>
            </div>

            {/* Widget 3: Semiconductor Markets */}
            <div className="premium-glass p-5 rounded-2xl flex flex-col justify-between min-h-[200px] border hover:border-[#00F5B0]/30 hover:shadow-[0_0_15px_rgba(0,245,176,0.1)] transition-all duration-300">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start text-xs font-mono text-[#00F5B0]">
                  <span>📈 SILICON MARKETS</span>
                  <span className="w-2 h-2 rounded-full bg-[#00F5B0] animate-pulse" />
                </div>
                <h3 className="text-base font-semibold text-white mt-1 m-0">FABRICATION YIELDS</h3>
                <p className="text-[10px] text-white/40 font-mono">NVIDIA / TSMC A14 Lithography</p>
              </div>

              <div className="my-3 flex justify-between items-center">
                <span className="text-2xl font-bold font-mono text-white/95">{siliconYield}</span>
                {renderMiniSparkline([80, 85, 92, 95, 98.5], '#00F5B0')}
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <Link
                  href="/markets"
                  className="w-full py-1.5 bg-[#00F5B0]/15 hover:bg-[#00F5B0]/30 border border-[#00F5B0]/20 text-[#00F5B0] text-[10px] font-bold rounded text-center transition-all duration-300 no-underline tracking-widest uppercase font-mono"
                >
                  UPLINK HUB
                </Link>
                <div className="text-[8px] text-[#7A8694] font-mono text-center uppercase tracking-widest mt-1">Timeline: ASML EUV Stable</div>
              </div>
            </div>

            {/* Widget 4: Earthquake Monitor */}
            <div className="premium-glass p-5 rounded-2xl flex flex-col justify-between min-h-[200px] border hover:border-red-500/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.1)] transition-all duration-300">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start text-xs font-mono text-red-400">
                  <span>🌋 SEISMIC MONITOR</span>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                </div>
                <h3 className="text-base font-semibold text-white mt-1 m-0">FAULT LINE COMPRESSION</h3>
                <p className="text-[10px] text-white/40 font-mono">USGS Surveillance Feed</p>
              </div>

              <div className="my-3 flex justify-between items-center">
                <span className="text-2xl font-bold font-mono text-white/95">{seismicMag}</span>
                {renderMiniSparkline([5.2, 4.2, 6.1, 4.9, 4.8], '#EF4444')}
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <Link
                  href="/earthquakes"
                  className="w-full py-1.5 bg-red-500/15 hover:bg-red-500/30 border border-red-500/20 text-red-400 text-[10px] font-bold rounded text-center transition-all duration-300 no-underline tracking-widest uppercase font-mono"
                >
                  UPLINK HUB
                </Link>
                <div className="text-[8px] text-[#7A8694] font-mono text-center uppercase tracking-widest mt-1">Timeline: Ring of Fire active</div>
              </div>
            </div>

          </div>

          {/* ── SECTION: YEAR TIMELINE SELECTOR ───────────────────────────── */}
          <div className="premium-glass px-10 py-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-[#00E5FF] font-bold uppercase tracking-wider">Planetary Timeline</span>
              <span className="text-[9px] text-white/40">Select chrono-year parameter to update dashboard simulations</span>
            </div>
            
            <div className="flex items-center gap-1 font-mono">
              {([2025, 2030, 2040, 2050] as const).map((yr, idx) => {
                const isActive = activeYear === yr;
                return (
                  <div key={yr} className="flex items-center">
                    {idx > 0 && <span className="h-[2px] w-8 md:w-16 bg-white/10" />}
                    <button
                      onClick={() => setActiveYear(yr)}
                      className={`px-4 py-2 font-mono text-xs rounded transition-all duration-300 font-semibold cursor-pointer border ${
                        isActive 
                          ? 'bg-[#00E5FF] text-[#02060A] border-transparent shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                          : 'bg-transparent border-white/5 text-white/50 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {yr}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── SECTION: NETFLIX-STYLE TOP PREDICTIONS SECTION ────────────── */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-baseline border-b border-white/5 pb-2">
              <h2 className="text-lg font-light text-white tracking-wide uppercase m-0">
                Top Projections for <span className="text-[#00E5FF] font-semibold">{activeYear} Timeline Shard</span>
              </h2>
              <span className="text-[9px] text-white/40 uppercase font-mono">Hover to decypher coefficients</span>
            </div>

            {/* Horizontally scrolling gallery */}
            <div className="flex gap-6 overflow-x-auto pb-4 pt-2 snap-x snap-mandatory scroll-smooth custom-scrollbar">
              {sortedPredictions.length === 0 ? (
                <div className="w-full text-center py-12 text-xs text-white/40 bg-black/20 rounded border border-white/5">
                  No active prediction shards simulated for this timeline target.
                </div>
              ) : (
                sortedPredictions.map(p => (
                  <div 
                    key={p.id}
                    className="snap-start shrink-0 w-[300px] h-[360px] premium-glass rounded-xl flex flex-col justify-between p-5 relative overflow-hidden group transition-all duration-300 hover:-translate-y-2 hover:border-[#00E5FF]/40"
                    style={{ backgroundColor: 'rgba(2, 6, 12, 0.94)' }}
                  >
                    {/* Background glow effects */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/3 rounded-full blur-3xl pointer-events-none transition-all duration-300 group-hover:bg-[#00E5FF]/10" />
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center text-[9px] font-mono">
                        <span className="text-[#00E5FF] uppercase font-bold tracking-wider">{p.category}</span>
                        <span className="text-white/40">{p.year} FORECAST</span>
                      </div>
                      
                      <h4 className="text-sm font-semibold text-white tracking-wide leading-snug m-0 min-h-[44px]">
                        {p.title}
                      </h4>
                      
                      <p className="text-xs text-white/55 leading-relaxed font-sans font-light m-0 line-clamp-3">
                        {p.description}
                      </p>
                    </div>

                    {/* Reveal details on hover */}
                    <div className="border-t border-white/5 pt-3 mt-4 flex flex-col gap-2 font-mono text-[10px]">
                      <div className="flex justify-between text-white/40">
                        <span>Confidence:</span>
                        <span className="text-[#00E5FF] font-semibold">{p.confidenceScore}%</span>
                      </div>
                      <div className="flex justify-between text-white/40">
                        <span>City Node:</span>
                        <span className="text-white font-medium">{p.city}</span>
                      </div>
                      <div className="flex justify-between text-white/40">
                        <span>Specialist:</span>
                        <span className="text-white/85 truncate max-w-[120px]">{p.author}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                      <Link 
                        href={`/predictions/${p.slug}`}
                        className="flex-1 py-2 bg-[#00E5FF]/10 hover:bg-[#00E5FF] text-[#00E5FF] hover:text-[#02060A] border border-[#00E5FF]/20 hover:border-transparent text-[10px] font-bold rounded text-center transition-all duration-300 no-underline tracking-wider uppercase font-mono"
                      >
                        Quick Read
                      </Link>
                      <Link
                        href={`/dashboard?city=${encodeURIComponent(p.city)}`}
                        className="p-2 border border-white/10 hover:border-white/30 text-white/60 hover:text-white rounded hover:bg-white/5 transition-colors flex items-center justify-center"
                        title="Locate Smart City"
                      >
                        📍
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── SECTION: SMART CITY EXPLORER ──────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <div className="border-b border-white/5 pb-2">
              <h2 className="text-lg font-light text-white tracking-wide uppercase m-0">Smart City Explorer</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Singapore', flag: '🇸🇬', slug: 'singapore', description: 'Quantum microgrids and biophilic canopy systems.' },
                { name: 'Dubai', flag: '🇦🇪', slug: 'dubai', description: 'Autonomous logistic drones and marine current dynamos.' },
                { name: 'Tokyo', flag: '🇯🇵', slug: 'tokyo', description: 'Biophilic skyscraper zones and subsea hyperloop links.' },
                { name: 'New York', flag: '🇺🇸', slug: 'new-york', description: 'Dynamic tidal barriers and ecological forest loops.' }
              ].map(c => (
                <Link
                  key={c.name}
                  href={`/city/${c.slug}`}
                  className="p-5 bg-black/40 hover:bg-[#00E5FF]/5 border border-white/5 hover:border-[#00E5FF]/30 rounded-2xl flex flex-col justify-between min-h-[140px] no-underline group transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-white group-hover:text-[#00E5FF] transition-colors">{c.flag} {c.name}</span>
                      <span className="text-[8px] font-mono text-white/30 tracking-widest uppercase font-bold group-hover:text-[#00E5FF]/50">2050 NODE</span>
                    </div>
                    <p className="text-[11px] text-white/50 m-0 font-sans leading-relaxed font-light mt-1">
                      {c.description}
                    </p>
                  </div>
                  <span className="text-[9px] text-[#00E5FF] font-mono tracking-wider uppercase font-semibold mt-4 block">
                    Inspect Metorpolis →
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* ── SECTION: KNOWLEDGE HUB (APPLE NEWS+ STYLE) ────────────────── */}
          <div className="flex flex-col gap-4">
            <div className="border-b border-white/5 pb-2">
              <h2 className="text-lg font-light text-white tracking-wide uppercase m-0">Foresight Codex Hub</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kbArticles.slice(0, 6).map(art => {
                let catColor = '#00F5B0';
                if (art.category.toLowerCase().includes('space')) catColor = '#BF5AF2';
                else if (art.category.toLowerCase().includes('climate')) catColor = '#FF0055';
                else if (art.category.toLowerCase().includes('ai')) catColor = '#00F5D4';
                
                return (
                  <Link 
                    key={art.id}
                    href={`/knowledge?article=${art.id}`}
                    className="p-6 bg-black/45 hover:bg-white/5 border border-white/5 hover:border-white/15 rounded-2xl flex flex-col justify-between min-h-[220px] no-underline group transition-all duration-300"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center text-[9px] font-mono">
                        <span style={{ color: catColor }} className="uppercase font-bold tracking-wider">{art.category}</span>
                        <span className="text-white/30">Readiness: {art.readinessIndex}%</span>
                      </div>
                      
                      <h4 className="text-sm font-semibold text-white group-hover:text-[#00E5FF] transition-colors leading-snug m-0 font-mono">
                        {art.title}
                      </h4>
                      
                      <p className="text-[11px] text-white/50 leading-relaxed font-sans font-light m-0 line-clamp-3">
                        {art.shortDesc}
                      </p>
                    </div>

                    <div className="border-t border-white/5 pt-3 mt-4 flex justify-between items-center text-[9px] font-mono text-white/40">
                      <span>Impact: <span className="text-white font-medium">{art.impactLevel}</span></span>
                      <span className="group-hover:text-white transition-colors">DECYPHER →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ── SECTION: LIVE GLOBAL INTELLIGENCE FEED ───────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="border-b border-white/5 pb-2">
                <h2 className="text-lg font-light text-white tracking-wide uppercase m-0">Live Global Feed</h2>
              </div>
              
              {/* Mixed Feed Timeline */}
              <div className="premium-glass p-6 rounded-2xl flex flex-col gap-4 h-[450px] overflow-y-auto custom-scrollbar">
                
                {/* NASA Space Events */}
                {spaceEvents.slice(0, 3).map(evt => (
                  <div key={evt.id} className="border-l-2 border-[#BF5AF2] pl-4 py-1 flex flex-col gap-1.5 font-mono text-xs">
                    <div className="flex justify-between items-center text-[9px] text-[#BF5AF2]">
                      <span>🌌 NASA SURVEILLANCE CORRIDOR</span>
                      <span>{new Date(evt.event_date).toLocaleDateString()}</span>
                    </div>
                    <h5 className="font-bold text-white/90 m-0">{evt.title}</h5>
                    <p className="text-[10px] text-white/55 leading-relaxed font-sans m-0">
                      {evt.description || 'Live orbital photography data and APOD imagery verification logs compiled.'}
                    </p>
                  </div>
                ))}

                {/* Earthquake Logs */}
                {earthquakes.slice(0, 3).map(quake => (
                  <div key={quake.id} className="border-l-2 border-red-500 pl-4 py-1 flex flex-col gap-1.5 font-mono text-xs">
                    <div className="flex justify-between items-center text-[9px] text-red-400">
                      <span>🌋 FAULT ZONE REGISTER</span>
                      <span>Seismic Node Live</span>
                    </div>
                    <h5 className="font-bold text-white/90 m-0">{quake.magnitude.toFixed(1)} Mag at {quake.place}</h5>
                    <p className="text-[10px] text-white/55 leading-relaxed font-sans m-0">
                      Tectonic shift detected at depth {quake.depth?.toFixed(1) || '0.0'} km. Fault line friction logs updated.
                    </p>
                  </div>
                ))}

                {/* Stock Tickers */}
                {snapshots.slice(0, 3).map(stock => (
                  <div key={stock.id} className="border-l-2 border-[#00F5B0] pl-4 py-1 flex flex-col gap-1.5 font-mono text-xs">
                    <div className="flex justify-between items-center text-[9px] text-[#00F5B0]">
                      <span>📈 HARDWARE STOCK MONITOR</span>
                      <span>Market Node Feed</span>
                    </div>
                    <h5 className="font-bold text-white/90 m-0">{stock.ticker} trading at ${stock.price.toFixed(2)}</h5>
                    <p className="text-[10px] text-white/55 leading-relaxed font-sans m-0">
                      Index change registered at {stock.change_percent} with a compounding daily volume of {(stock.volume / 1000000).toFixed(1)}M.
                    </p>
                  </div>
                ))}

              </div>
            </div>

            {/* Quick Command Help (Col 4) */}
            <div className="lg:col-span-4 premium-glass p-6 rounded-2xl flex flex-col gap-4">
              <span className="text-[10px] font-mono text-[#00E5FF] uppercase tracking-wider block border-b border-white/5 pb-2">
                COGNITIVE HUD OPTIONS
              </span>
              <p className="text-xs text-white/50 leading-relaxed font-sans font-light">
                * Explore Future features interactive albedo mirrors, sea-level rise controllers, and fusion breakthrough trackers.
              </p>
              <p className="text-xs text-white/50 leading-relaxed font-sans font-light">
                * Terminal searches the full 2050 timeline index including city profiles, futurology personnel records, and codex cards.
              </p>
              <div className="mt-auto border-t border-white/5 pt-4 text-[9px] text-white/30 font-mono uppercase tracking-widest text-center">
                CHRONO_OS v4.82 // DESK STATUS: READY
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── ESC CLOSE TOGGLE TAB FOR ORBIT VIEW ────────────────────────── */}
      {activeSection === 'globe' && (
        <>
          <div 
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 premium-glass px-8 py-3 rounded-full flex items-center gap-6 border border-[#00E5FF]/20 backdrop-blur-xl"
            style={{ pointerEvents: 'auto' }}
          >
            <span className="text-[10px] font-mono text-[#00E5FF] uppercase tracking-[0.2em] font-semibold">Timeline</span>
            <div className="flex items-center gap-1">
              {([2025, 2030, 2040, 2050] as const).map((year, index) => {
                const isActive = activeYear === year;
                return (
                  <div key={year} className="flex items-center">
                    {index > 0 && <span className="h-[1px] w-8 md:w-12 bg-white/10" />}
                    <button
                      onClick={() => setActiveYear(year)}
                      className={`px-3 py-1.5 font-mono text-[10px] rounded transition-all duration-300 cursor-pointer border ${
                        isActive 
                          ? 'bg-[#00E5FF] text-[#02060A] border-transparent shadow-[0_0_10px_rgba(0,229,255,0.4)] font-bold'
                          : 'bg-transparent border-transparent text-white/50 hover:text-white'
                      }`}
                    >
                      {year}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          <button
            onClick={() => setActiveSection('dossier')}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-[#02060A] border border-[#00E5FF]/40 rounded-full text-xs font-semibold text-[#00E5FF] uppercase tracking-[0.25em] shadow-[0_0_20px_rgba(0,229,255,0.35)] transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            [esc // close orbit view]
          </button>
        </>
      )}

      {/* Custom Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
          display: block;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(2, 6, 10, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 229, 255, 0.2);
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 229, 255, 0.4);
        }
      `}</style>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen bg-[#02060A] flex items-center justify-center font-mono text-[#00E5FF] text-xs tracking-widest">
        CONNECTING TO ORBITAL CHRONO_GRID...
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
