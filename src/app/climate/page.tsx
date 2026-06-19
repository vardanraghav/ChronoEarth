'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BackgroundEffects from '@/components/BackgroundEffects';
import { useClimateSnapshots } from '@/hooks/useClimateSnapshots';
import Image from 'next/image';
import { getSensorImage } from '@/lib/imageUtils';
import { citiesRawData } from '@/data/citiesData';

function ClimateContent() {
  const searchParams = useSearchParams();
  const cityParam = searchParams.get('city');
  const [selectedCity, setSelectedCity] = useState('New Delhi');

  useEffect(() => {
    if (cityParam) {
      const matchedCity = citiesRawData.find(c => c.name.toLowerCase() === cityParam.toLowerCase());
      if (matchedCity) {
        setSelectedCity(matchedCity.name);
      }
    }
  }, [cityParam]);

  const { climateSnapshots, loading, error, refetch } = useClimateSnapshots(selectedCity);

  const activeCityData = citiesRawData.find(c => c.name === selectedCity);

  const currentSnapshot = climateSnapshots.find(s => s.scenario === 'current');
  const projections = climateSnapshots.filter(s => s.scenario === 'projection');

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
            <div className="flex items-center gap-2 text-[#FF0055] font-mono text-xs uppercase tracking-[0.25em] mb-1">
              <span>🌡️ CLIMATE FORECAST SYSTEMS</span>
            </div>
            <h1 className="text-3xl font-light tracking-wider uppercase">
              Global Climate <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#FF0055] to-[#FF8000]">Projections</span>
            </h1>
          </div>

          <div className="flex gap-4 items-center">
            {/* City Selector */}
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="premium-glass bg-black/40 text-white border border-white/10 rounded-full px-5 py-2 text-xs font-mono tracking-wider focus:outline-none focus:border-[#FF0055]/50 transition-colors"
            >
              {citiesRawData.slice(0, 15).map(c => (
                <option key={c.name} value={c.name} className="bg-[#02060A] text-white">
                  {c.name} ({c.country})
                </option>
              ))}
            </select>

            <button
              onClick={() => refetch()}
              className="premium-glass px-5 py-2.5 rounded-full text-xs font-mono tracking-wider border border-[#FF0055]/20 hover:border-[#FF0055] hover:shadow-[0_0_15px_rgba(255,0,85,0.3)] transition-all duration-300 cursor-pointer"
            >
              🔄 RE-PROJECT
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-12 h-12 border-2 border-[#FF0055]/20 border-t-[#FF0055] rounded-full animate-spin" />
            <span className="font-mono text-xs text-white/50 uppercase tracking-widest animate-pulse">Running planetary simulation...</span>
          </div>
        ) : error ? (
          <div className="premium-glass border border-red-500/20 p-8 rounded-2xl text-center">
            <span className="text-2xl">⚠️</span>
            <h3 className="font-mono text-sm uppercase text-red-400 mt-2">Simulation Run Aborted</h3>
            <p className="text-xs text-white/55 mt-1">{error.message}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left/Middle Column: Climate Current and Forecast Dashboard */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              
              {/* Baseline Weather Card */}
              {currentSnapshot && (
                <div className="premium-glass rounded-2xl border border-white/5 p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF0055]/5 rounded-full blur-[100px] pointer-events-none" />
                  
                  <span className="text-[10px] font-mono text-[#FF0055] uppercase tracking-wider">CURRENT WEATHER BASELINE (LIVE)</span>
                  <h2 className="text-2xl font-light tracking-wide uppercase mt-1 mb-6">
                    {selectedCity} <span className="text-white/40 font-mono text-sm">@{activeCityData?.lat.toFixed(2)}°, {activeCityData?.lon.toFixed(2)}°</span>
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="premium-glass bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                      <span className="text-2xl block mb-2">🌡️</span>
                      <span className="text-2xl font-semibold">{currentSnapshot.temperature}°C</span>
                      <span className="text-[9px] font-mono text-white/40 block mt-1 uppercase">Temperature</span>
                    </div>

                    <div className="premium-glass bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                      <span className="text-2xl block mb-2">💧</span>
                      <span className="text-2xl font-semibold">{currentSnapshot.humidity}%</span>
                      <span className="text-[9px] font-mono text-white/40 block mt-1 uppercase">Humidity</span>
                    </div>

                    <div className="premium-glass bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                      <span className="text-2xl block mb-2">💨</span>
                      <span className="text-2xl font-semibold">{currentSnapshot.windspeed} km/h</span>
                      <span className="text-[9px] font-mono text-white/40 block mt-1 uppercase">Wind Speed</span>
                    </div>

                    <div className="premium-glass bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                      <span className="text-2xl block mb-2">🌧️</span>
                      <span className="text-2xl font-semibold">{currentSnapshot.rainfall} mm</span>
                      <span className="text-[9px] font-mono text-white/40 block mt-1 uppercase">Precipitation</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Climate Timeline */}
              <div className="premium-glass rounded-2xl border border-white/5 p-6 shadow-xl">
                <span className="text-[10px] font-mono text-[#FF0055] uppercase tracking-wider block mb-4">CLIMATE PROJECTIONS TIMELINE</span>
                
                <div className="flex flex-col gap-6 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
                  {projections.map((proj, idx) => {
                    const tempDiff = (proj.temperature - (currentSnapshot?.temperature || 20)).toFixed(1);
                    return (
                      <div key={proj.id || idx} className="flex gap-6 relative">
                        <div className="w-12 h-12 rounded-full bg-black border-2 border-[#FF0055] flex items-center justify-center font-mono text-sm font-bold text-[#FF0055] z-10 shadow-[0_0_10px_rgba(255,0,85,0.4)]">
                          {proj.year}
                        </div>
                        <div className="flex-1 premium-glass bg-white/5 p-4 rounded-xl border border-white/5">
                          <div className="flex justify-between items-start flex-wrap gap-2 mb-3">
                            <h4 className="text-sm font-semibold uppercase font-mono text-white/90">RCP 8.5 Projection Scenario</h4>
                            <span className="text-[10px] font-mono text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full">
                              +{tempDiff}°C Delta
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                            <div className="py-1.5 bg-black/40 rounded border border-white/5">
                              <span className="text-white/40 block text-[9px]">TEMP</span>
                              <span className="font-semibold text-white/90">{proj.temperature}°C</span>
                            </div>
                            <div className="py-1.5 bg-black/40 rounded border border-white/5">
                              <span className="text-white/40 block text-[9px]">HUMIDITY</span>
                              <span className="font-semibold text-white/90">{proj.humidity}%</span>
                            </div>
                            <div className="py-1.5 bg-black/40 rounded border border-white/5">
                              <span className="text-white/40 block text-[9px]">PRECIP</span>
                              <span className="font-semibold text-white/90">{proj.rainfall} mm</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Column: Localized Features & Offset Metrics */}
            <div className="flex flex-col gap-8">
              
              {/* Climate Telemetry Image */}
              <div className="premium-glass rounded-2xl border border-white/5 overflow-hidden shadow-xl group">
                <div className="relative w-full h-48">
                  <Image
                    src={getSensorImage({ category: 'climate' }, 'climate')}
                    alt="Climate Telemetry Grid"
                    fill
                    sizes="(max-width: 768px) 100vw, 380px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#02060A]/80 via-[#02060A]/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-[9px] font-mono text-[#FF0055] uppercase tracking-widest font-semibold bg-[#FF0055]/10 px-2 py-0.5 rounded border border-[#FF0055]/20">Active Satellite feed</span>
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-white mt-1.5 font-mono">Radar Telemetry Layer</h3>
                  </div>
                </div>
              </div>

              {/* Offset Coefficients Panel */}
              <div className="premium-glass rounded-2xl border border-white/5 p-6 shadow-xl">
                <span className="text-[10px] font-mono text-[#FF0055] uppercase tracking-wider">REGIONAL COEFFICIENTS</span>
                <h3 className="text-sm font-semibold tracking-wide uppercase mt-0.5 mb-4">Warming Susceptibility</h3>

                {activeCityData && (
                  <div className="flex flex-col gap-4 font-mono text-xs">
                    <div className="border-b border-white/5 pb-2">
                      <div className="flex justify-between text-white/50 mb-1">
                        <span>Baseline Temp Offset:</span>
                        <span className="text-white font-bold">{activeCityData.offsets.temp > 0 ? `+${activeCityData.offsets.temp}` : activeCityData.offsets.temp}°C</span>
                      </div>
                      <p className="text-[9px] text-white/40 leading-relaxed font-sans">
                        Regional delta vs standard planetary baseline temperature.
                      </p>
                    </div>

                    <div className="border-b border-white/5 pb-2">
                      <div className="flex justify-between text-white/50 mb-1">
                        <span>Warming Rate (Annual):</span>
                        <span className="text-[#FF0055] font-bold">+{activeCityData.offsets.tempRise}°C/yr</span>
                      </div>
                      <p className="text-[9px] text-white/40 leading-relaxed font-sans">
                        Rate of temperature increase compounding annually.
                      </p>
                    </div>

                    <div className="border-b border-white/5 pb-2">
                      <div className="flex justify-between text-white/50 mb-1">
                        <span>Sea-Level Impact Factor:</span>
                        <span className="text-blue-400 font-bold">{activeCityData.offsets.seaLevel}x</span>
                      </div>
                      <p className="text-[9px] text-white/40 leading-relaxed font-sans">
                        Vulnerability coefficient to rising ocean shorelines.
                      </p>
                    </div>

                    <div className="pb-2">
                      <div className="flex justify-between text-white/50 mb-1">
                        <span>Projected Population:</span>
                        <span className="text-[#00F5B0] font-bold">{(activeCityData.offsets.population * 1000).toFixed(1)}M</span>
                      </div>
                      <p className="text-[9px] text-white/40 leading-relaxed font-sans">
                        Compound target city population by year 2050.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Localized Features Details */}
              {activeCityData?.details && (
                <div className="premium-glass rounded-2xl border border-white/5 p-6 shadow-xl">
                  <span className="text-[10px] font-mono text-[#FF0055] uppercase tracking-wider block mb-4">LOCAL ADAPTATION PROTOCOLS</span>
                  
                  <div className="flex flex-col gap-4 text-xs">
                    {Object.entries(activeCityData.details).map(([key, desc]) => (
                      <div key={key} className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-[9px] font-mono text-[#FF0055] uppercase tracking-wider font-bold block mb-1">{key}</span>
                        <p className="text-[11px] text-white/70 leading-relaxed font-sans">{desc}</p>
                      </div>
                    ))}
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

export default function ClimateDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#02060A] text-white flex items-center justify-center font-mono text-xs uppercase tracking-widest">
        Loading climate telemetry simulation...
      </div>
    }>
      <ClimateContent />
    </Suspense>
  );
}
