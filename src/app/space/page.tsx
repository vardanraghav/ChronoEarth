'use client';

import { useState } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import BackgroundEffects from '@/components/BackgroundEffects';
import { useSpaceEvents } from '@/hooks/useSpaceEvents';

export default function SpaceDashboard() {
  const { spaceEvents, loading, error, refetch } = useSpaceEvents();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Filter events
  const apodEvent = spaceEvents.find(e => e.event_type === 'APOD');
  const neoEvents = spaceEvents.filter(e => e.event_type === 'NEO');
  const epicEvent = spaceEvents.find(e => e.event_type === 'EPIC');

  return (
    <main className="min-h-screen text-white relative overflow-x-hidden pb-12" style={{ background: '#02060A' }}>
      {/* Navbar */}
      <Navbar />

      {/* Atmospheric Starfield */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <BackgroundEffects earthMode="cyber" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 text-[#BF5AF2] font-mono text-xs uppercase tracking-[0.25em] mb-1">
              <span>🛰️ DEEP SPACE INTELLIGENCE SYSTEM</span>
            </div>
            <h1 className="text-3xl font-light tracking-wider uppercase">
              Cosmic & Orbital <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#BF5AF2] to-[#00F5B0]">Surveillance</span>
            </h1>
          </div>
          <button
            onClick={() => refetch()}
            className="premium-glass px-5 py-2.5 rounded-full text-xs font-mono tracking-wider border border-[#BF5AF2]/20 hover:border-[#BF5AF2] hover:shadow-[0_0_15px_rgba(191,90,242,0.3)] transition-all duration-300 cursor-pointer"
          >
            🔄 SYNC REAL-TIME METRICS
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-12 h-12 border-2 border-[#BF5AF2]/20 border-t-[#BF5AF2] rounded-full animate-spin" />
            <span className="font-mono text-xs text-white/50 uppercase tracking-widest animate-pulse">Establishing orbital link...</span>
          </div>
        ) : error ? (
          <div className="premium-glass border border-red-500/20 p-8 rounded-2xl text-center">
            <span className="text-2xl">⚠️</span>
            <h3 className="font-mono text-sm uppercase text-red-400 mt-2">Telemetry Connection Interrupted</h3>
            <p className="text-xs text-white/55 mt-1">{error.message}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Column 1 & 2: Space Briefing & APOD / EPIC */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              
              {/* Daily Briefing / EPIC Card */}
              {epicEvent && (
                <div className="premium-glass rounded-2xl overflow-hidden border border-white/5 shadow-2xl relative group">
                  <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#00F5B0]/30 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00F5B0] animate-pulse" />
                    <span className="text-[10px] font-mono text-[#00F5B0] uppercase tracking-wider">DSCOVR LIVE FEED</span>
                  </div>
                  {epicEvent.image_url && (
                    <div className="relative h-96 w-full overflow-hidden bg-black/40">
                      <Image
                        src={epicEvent.image_url}
                        alt="EPIC Earth"
                        fill
                        sizes="(max-width: 768px) 100vw, 768px"
                        className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#02060A] via-transparent to-black/30" />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-light tracking-wide mb-2 uppercase">{epicEvent.title}</h3>
                    <p className="text-xs text-white/70 leading-relaxed font-sans">{epicEvent.description}</p>
                  </div>
                </div>
              )}

              {/* APOD Card */}
              {apodEvent && (
                <div className="premium-glass rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                  <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-wider text-white/40 uppercase">ASTRONOMY PICTURE OF THE DAY</span>
                    <span className="text-[10px] font-mono text-[#BF5AF2]">{apodEvent.event_date}</span>
                  </div>
                  {apodEvent.image_url && (
                    <div className="relative h-80 w-full overflow-hidden bg-black/30">
                      <Image
                        src={apodEvent.image_url}
                        alt={apodEvent.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 768px"
                        className="object-cover opacity-75"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#02060A] to-transparent" />
                    </div>
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-light tracking-wide mb-3">{apodEvent.title}</h2>
                    <p className="text-xs text-white/70 leading-relaxed font-sans">{apodEvent.description}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Column 3: Near Earth Object Tracker */}
            <div className="flex flex-col gap-8">
              
              {/* NEO Tracker Box */}
              <div className="premium-glass rounded-2xl border border-white/5 p-6 flex flex-col h-[600px]">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <div>
                    <span className="text-[10px] font-mono text-[#BF5AF2] uppercase tracking-wider">RADAR DETECTED</span>
                    <h3 className="text-sm font-semibold tracking-wide uppercase mt-0.5">Near Earth Objects</h3>
                  </div>
                  <span className="bg-[#BF5AF2]/10 text-[#BF5AF2] border border-[#BF5AF2]/20 px-2.5 py-1 rounded-full text-[9px] font-mono">
                    {neoEvents.length} DETECTED
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2">
                  {neoEvents.length === 0 ? (
                    <div className="text-center py-20 text-white/40 text-xs font-mono">
                      No Close Approaches Found Today.
                    </div>
                  ) : (
                    neoEvents.map((neo, idx) => {
                      const isHazardous = neo.metadata?.is_potentially_hazardous_asteroid;
                      return (
                        <div
                          key={neo.id || idx}
                          onClick={() => setSelectedEvent(neo)}
                          className="premium-glass rounded-xl p-4 border border-white/5 hover:border-[#BF5AF2]/30 hover:bg-[#BF5AF2]/5 cursor-pointer transition-all duration-300"
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-mono font-bold tracking-wide text-white/90">{neo.title.replace('NEO: ', '')}</h4>
                            <span
                              className={`text-[8px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                isHazardous
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.2)]'
                                  : 'bg-green-500/10 text-green-400 border border-green-500/20'
                              }`}
                            >
                              {isHazardous ? '⚠️ Hazardous' : '✓ Safe'}
                            </span>
                          </div>
                          
                          <p className="text-[11px] text-white/60 leading-relaxed mt-2 font-sans">
                            {neo.description}
                          </p>

                          <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-white/5 text-[9px] font-mono text-white/40">
                            <span>Vel: {parseFloat(neo.metadata?.velocity_km_h || 0).toLocaleString()} km/h</span>
                            <span>Miss: {parseFloat(neo.metadata?.close_approach_data?.[0]?.miss_distance?.kilometers || 0).toLocaleString()} km</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* NEO Details Modal/Card */}
              {selectedEvent && (
                <div className="premium-glass rounded-2xl border border-[#BF5AF2]/30 p-5 animate-fade-in relative">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="absolute top-3 right-3 text-white/40 hover:text-white bg-transparent border-none text-xs font-mono cursor-pointer"
                  >
                    [✕]
                  </button>
                  <span className="text-[9px] font-mono text-[#BF5AF2] uppercase tracking-wider">NEO SPECIFICATIONS</span>
                  <h4 className="text-sm font-semibold uppercase mt-0.5 mb-3">{selectedEvent.title}</h4>
                  
                  <div className="flex flex-col gap-2 text-[10px] font-mono">
                    <div className="flex justify-between border-b border-white/5 py-1">
                      <span className="text-white/40">Hazard Potential:</span>
                      <span className={selectedEvent.metadata?.is_potentially_hazardous_asteroid ? 'text-red-400 font-bold' : 'text-green-400'}>
                        {selectedEvent.metadata?.is_potentially_hazardous_asteroid ? 'CRITICAL' : 'MINIMAL'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 py-1">
                      <span className="text-white/40">Velocity:</span>
                      <span>{parseFloat(selectedEvent.metadata?.velocity_km_h || 0).toFixed(2)} km/h</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 py-1">
                      <span className="text-white/40">Miss Distance:</span>
                      <span>{parseFloat(selectedEvent.metadata?.close_approach_data?.[0]?.miss_distance?.kilometers || 0).toFixed(2)} km</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 py-1">
                      <span className="text-white/40">Absolute Magnitude:</span>
                      <span>{selectedEvent.metadata?.absolute_magnitude_h} H</span>
                    </div>
                    <a
                      href={selectedEvent.metadata?.nasa_jpl_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-center mt-3 block py-2 rounded-lg bg-[#BF5AF2]/20 hover:bg-[#BF5AF2]/40 text-[#BF5AF2] hover:text-white no-underline transition-all duration-300 font-mono tracking-wider"
                    >
                      VIEW JPL ORBIT DIAGRAM ↗
                    </a>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}
      </div>
    </main>
  );
}
