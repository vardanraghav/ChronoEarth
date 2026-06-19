'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BackgroundEffects from '@/components/BackgroundEffects';
import { useEarthquakes } from '@/hooks/useEarthquakes';
import Image from 'next/image';
import { getSensorImage } from '@/lib/imageUtils';
import { citiesRawData } from '@/data/citiesData';
import { getCitySlug } from '@/data/citiesExtendedData';

export default function EarthquakesDashboard() {
  const [minMag, setMinMag] = useState(4.5);
  const { earthquakes, loading, error, refetch } = useEarthquakes(minMag);

  const majorQuakes = earthquakes.filter(q => q.magnitude >= 6.0);
  const maxQuake = earthquakes.length > 0 ? [...earthquakes].sort((a, b) => b.magnitude - a.magnitude)[0] : null;

  // Haversine/Euclidean distance helper to find closest city
  const getClosestCity = (quakeLat: number, quakeLon: number) => {
    let closestCity = null;
    let minDistance = Infinity;

    for (const city of citiesRawData) {
      const latDiff = city.lat - quakeLat;
      const lonDiff = city.lon - quakeLon;
      const dist = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
      if (dist < minDistance) {
        minDistance = dist;
        closestCity = city;
      }
    }

    if (closestCity && minDistance < 15) {
      return {
        name: closestCity.name,
        slug: getCitySlug(closestCity.name),
        distance: minDistance * 111
      };
    }
    return null;
  };

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
            <div className="flex items-center gap-2 text-[#E11D48] font-mono text-xs uppercase tracking-[0.25em] mb-1">
              <span>🌋 SEISMIC INTELLIGENCE PLATFORM</span>
            </div>
            <h1 className="text-3xl font-light tracking-wider uppercase">
              Global Tectonic <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#E11D48] to-[#F97316]">Surveillance</span>
            </h1>
          </div>

          <div className="flex gap-4 items-center">
            {/* Magnitude Filter */}
            <div className="flex items-center gap-2 premium-glass px-4 py-1.5 rounded-full border border-white/10 text-xs font-mono">
              <span className="text-white/45">Min Mag:</span>
              <button
                onClick={() => setMinMag(4.5)}
                className={`px-2 py-0.5 rounded ${minMag === 4.5 ? 'bg-[#E11D48] text-white' : 'text-white/60 bg-transparent border-none cursor-pointer'}`}
              >
                4.5
              </button>
              <button
                onClick={() => setMinMag(5.5)}
                className={`px-2 py-0.5 rounded ${minMag === 5.5 ? 'bg-[#E11D48] text-white' : 'text-white/60 bg-transparent border-none cursor-pointer'}`}
              >
                5.5
              </button>
              <button
                onClick={() => setMinMag(6.5)}
                className={`px-2 py-0.5 rounded ${minMag === 6.5 ? 'bg-[#E11D48] text-white' : 'text-white/60 bg-transparent border-none cursor-pointer'}`}
              >
                6.5
              </button>
            </div>

            <button
              onClick={() => refetch()}
              className="premium-glass px-5 py-2.5 rounded-full text-xs font-mono tracking-wider border border-[#E11D48]/20 hover:border-[#E11D48] hover:shadow-[0_0_15px_rgba(225,29,72,0.3)] transition-all duration-300 cursor-pointer"
            >
              🔄 FETCH USGS FEED
            </button>
          </div>
        </div>

        {/* Flashing Major Alert Panel */}
        {majorQuakes.length > 0 && (
          <div className="mb-8 p-5 rounded-2xl bg-red-950/20 border border-red-500/30 flex items-center gap-4 animate-pulse">
            <span className="text-3xl">🚨</span>
            <div>
              <h4 className="text-sm font-semibold uppercase text-red-400 font-mono">CRITICAL SEISMIC DISTURBANCE DETECTED</h4>
              <p className="text-xs text-white/70 leading-normal mt-0.5 font-sans">
                {majorQuakes.length} earthquake(s) measuring &gt;= 6.0 magnitude have occurred in the last 24 hours. Ensure tectonic warning layers are active on the Cesium globe.
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-12 h-12 border-2 border-[#E11D48]/20 border-t-[#E11D48] rounded-full animate-spin" />
            <span className="font-mono text-xs text-white/50 uppercase tracking-widest animate-pulse">Connecting to USGS feed...</span>
          </div>
        ) : error ? (
          <div className="premium-glass border border-red-500/20 p-8 rounded-2xl text-center">
            <span className="text-2xl">⚠️</span>
            <h3 className="font-mono text-sm uppercase text-red-400 mt-2">USGS Connection Timeout</h3>
            <p className="text-xs text-white/55 mt-1">{error.message}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Column 1 & 2: Recent Earthquake Feed */}
            <div className="lg:col-span-2 premium-glass rounded-2xl border border-white/5 p-6 shadow-xl flex flex-col h-[650px]">
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <span className="text-[10px] font-mono text-[#E11D48] uppercase tracking-wider">TECTONIC ACTIVITY FEED</span>
                <span className="text-[10px] font-mono text-white/40">{earthquakes.length} EVENTS LOADED</span>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2">
                {earthquakes.length === 0 ? (
                  <div className="text-center py-20 text-white/40 text-xs font-mono">
                    No seismic events matched the current filter.
                  </div>
                ) : (
                  earthquakes.map((quake) => {
                    const isMajor = quake.magnitude >= 6.0;
                    const isModerate = quake.magnitude >= 5.0 && quake.magnitude < 6.0;
                    const color = isMajor ? '#EF4444' : (isModerate ? '#F97316' : '#EAB308');
                    const shadow = isMajor ? 'rgba(239,68,68,0.3)' : (isModerate ? 'rgba(249,115,22,0.2)' : 'rgba(234,179,8,0.1)');
                    
                    const closestCity = getClosestCity(quake.lat, quake.lon);
                    
                    return (
                      <div
                        key={quake.id}
                        className="premium-glass rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all duration-300 flex items-center justify-between gap-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-semibold text-white/95">{quake.place}</h4>
                            {closestCity && (
                              <Link 
                                href={`/city/${closestCity.slug}`}
                                className="text-[9px] bg-[#00F5B0]/10 text-[#00F5B0] border border-[#00F5B0]/20 px-2 py-0.5 rounded hover:bg-[#00F5B0] hover:text-[#02060A] transition-all no-underline font-mono"
                              >
                                📍 Close to {closestCity.name} (~{closestCity.distance.toFixed(0)}km)
                              </Link>
                            )}
                          </div>
                          <div className="flex gap-4 items-center text-[10px] font-mono text-white/40 mt-1">
                            <span>Time: {new Date(quake.time).toLocaleTimeString()}</span>
                            <span>Depth: {quake.depth?.toFixed(1) || '0.0'} km</span>
                            <span>Coords: {quake.lat.toFixed(3)}°, {quake.lon.toFixed(3)}°</span>
                          </div>
                        </div>

                        <div
                          className="w-14 h-14 rounded-full flex flex-col items-center justify-center font-mono font-bold z-10 transition-all duration-300"
                          style={{
                            background: `${color}15`,
                            color: color,
                            border: `2px solid ${color}`,
                            boxShadow: `0 0 12px ${shadow}`
                          }}
                        >
                          <span className="text-sm">{quake.magnitude.toFixed(1)}</span>
                          <span className="text-[7px] uppercase tracking-wider -mt-0.5">MAG</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Column 3: Stats Summary & Cesium Globe Layer Info */}
            <div className="flex flex-col gap-8">
              
              {/* Tectonic Telemetry Image */}
              <div className="premium-glass rounded-2xl border border-white/5 overflow-hidden shadow-xl group">
                <div className="relative w-full h-48">
                  <Image
                    src={getSensorImage({ category: 'seismic' }, 'earthquake')}
                    alt="Seismic Telemetry Grid"
                    fill
                    sizes="(max-width: 768px) 100vw, 380px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#02060A]/85 via-[#02060A]/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-[9px] font-mono text-[#E11D48] uppercase tracking-widest font-semibold bg-[#E11D48]/10 px-2 py-0.5 rounded border border-[#E11D48]/20">Active USGS feed</span>
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-white mt-1.5 font-mono">Tectonic Map Snapshot</h3>
                  </div>
                </div>
              </div>

              {/* Peak Disturbance summary */}
              {maxQuake && (
                <div className="premium-glass rounded-2xl border border-white/5 p-6 shadow-xl text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
                  
                  <span className="text-[10px] font-mono text-[#E11D48] uppercase tracking-wider">PEAK DISTURBANCE REPORT</span>
                  <div className="my-6">
                    <span className="text-6xl font-light text-[#E11D48] font-mono">{maxQuake.magnitude.toFixed(1)}</span>
                    <span className="text-xs font-mono text-white/40 uppercase block mt-1">Maximum Magnitude Detected</span>
                  </div>

                  <h4 className="text-xs font-mono font-bold uppercase tracking-wide text-white/95 mb-1">{maxQuake.place}</h4>
                  <p className="text-[10px] text-white/50 leading-relaxed font-sans mb-3">
                    Depth recorded: {maxQuake.depth?.toFixed(1) || '0.0'} km. Coordinates: Lat {maxQuake.lat.toFixed(3)} / Lon {maxQuake.lon.toFixed(3)}.
                  </p>
                </div>
              )}

              {/* Cesium integration notes */}
              <div className="premium-glass rounded-2xl border border-white/5 p-6 shadow-xl">
                <span className="text-[10px] font-mono text-[#E11D48] uppercase tracking-wider">GLOBE LAYERS</span>
                <h3 className="text-sm font-semibold tracking-wide uppercase mt-0.5 mb-4">Cesium Visualisation</h3>
                
                <p className="text-xs text-white/70 leading-relaxed font-sans mb-4">
                  Seismic data is plotted dynamically on the Cesium globe as pulsing hot-spots. Red zones indicate high-severity fault line friction, corresponding directly to major USGS warnings.
                </p>

                <div className="flex flex-col gap-2 font-mono text-[10px] text-white/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span>Mag &gt;= 6.0 (Major Danger)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    <span>Mag 5.0 - 5.9 (Moderate Shake)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <span>Mag 4.5 - 4.9 (Minor Shift)</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </main>
  );
}
