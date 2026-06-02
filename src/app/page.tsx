'use client';

import { useState } from "react";
import Navbar from "@/components/Navbar";
import CesiumGlobe from "@/components/CesiumGlobe";
import DataPanel from "@/components/DataPanel";
import CategoryCards from "@/components/CategoryCards";
import Timeline from "@/components/Timeline";
import BackgroundEffects from "@/components/BackgroundEffects";
import ProjectionPanel from "@/components/ProjectionPanel";
import { CityData } from "@/data/citiesData";

export default function Home() {
  const [activeYear, setActiveYear] = useState(2050);
  const [activeCategory, setActiveCategory] = useState("Ocean Monitoring");
  const [activeCity, setActiveCity] = useState<CityData | null>(null);
  const [overlays, setOverlays] = useState({
    climate: false,
    pollution: false,
    energy: true,
    satellite: false,
    ai: false,
  });

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {/* Atmospheric background layer */}
      <BackgroundEffects />

      {/* Navigation */}
      <Navbar />

      {/* Planetary Sensor Filters Control Panel */}
      <div className="absolute top-[76px] left-6 xl:left-10 z-40 hidden lg:block select-none max-w-[200px]">
        <div
          className="rounded p-4 border"
          style={{
            background: 'rgba(6, 9, 24, 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderColor: 'rgba(0, 240, 255, 0.15)',
            boxShadow: '0 0 15px rgba(0, 240, 255, 0.05)',
          }}
        >
          <div className="flex items-center gap-2 mb-3 border-b border-cyan-400/10 pb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-[9px] font-bold tracking-[0.2em] text-cyan-400/80 uppercase font-mono">
              PLANETARY SENSORS
            </h3>
          </div>
          
          <div className="flex flex-col gap-2.5">
            {Object.entries({
              climate: 'CLIMATE TEMP',
              pollution: 'AQI POLLUTION',
              energy: 'HYPERGRIDS',
              satellite: 'SATCOM SHIELD',
              ai: 'AI NETWORKS'
            }).map(([key, label]) => {
              const active = overlays[key as keyof typeof overlays];
              return (
                <button
                  key={key}
                  onClick={() => setOverlays(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                  className="flex items-center justify-between text-left cursor-pointer transition-all duration-300 w-full hover:translate-x-1"
                  style={{ background: 'none', border: 'none' }}
                >
                  <span className="text-[8px] tracking-widest text-white/70 uppercase font-mono">{label}</span>
                  <div
                    className="w-7 h-3.5 rounded-full relative p-0.5 transition-colors duration-300"
                    style={{
                      background: active ? 'rgba(0, 240, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      border: active ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.15)'
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full transition-all duration-300"
                      style={{
                        background: active ? '#00f0ff' : 'rgba(255, 255, 255, 0.3)',
                        boxShadow: active ? '0 0 6px #00f0ff' : 'none',
                        transform: active ? 'translateX(12px)' : 'translateX(0)',
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Left data panels */}
      <DataPanel activeYear={activeYear} activeCity={activeCity} />

      {/* 3D Cesium Earth Globe Canvas */}
      <CesiumGlobe
        activeYear={activeYear}
        activeCategory={activeCategory}
        activeCity={activeCity}
        setActiveCity={setActiveCity}
        overlays={overlays}
      />

      {/* Right category cards */}
      <CategoryCards activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

      {/* Dynamic Simulation Details HUD */}
      <div className="absolute bottom-[96px] left-1/2 -translate-x-1/2 z-20 w-full max-w-[290px] sm:max-w-[400px] md:max-w-[450px]">
        <ProjectionPanel activeYear={activeYear} activeCategory={activeCategory} activeCity={activeCity} />
      </div>

      {/* Close Nodal Telemetry HUD Button */}
      {activeCity && (
        <div className="absolute bottom-[275px] left-1/2 -translate-x-1/2 z-30">
          <button
            onClick={() => setActiveCity(null)}
            className="px-4 py-1.5 rounded-full border text-[9px] font-light tracking-[0.2em] uppercase transition-all duration-300 pointer-events-auto hover:bg-[#00f0ff1a]"
            style={{
              background: 'rgba(6, 12, 30, 0.85)',
              borderColor: 'rgba(0, 240, 255, 0.35)',
              color: '#00f0ff',
              boxShadow: '0 0 15px rgba(0, 240, 255, 0.15)',
              cursor: 'pointer',
            }}
          >
            CLOSE NODAL TELEMETRY // GLOBAL VIEW
          </button>
        </div>
      )}

      {/* Bottom timeline */}
      <Timeline activeYear={activeYear} setActiveYear={setActiveYear} />

      {/* Corner decorative elements */}
      <CornerDecorations />
    </main>
  );
}

/* Decorative corner brackets for the sci-fi frame */
function CornerDecorations() {
  return (
    <>
      {/* Top-left corner */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path
            d="M0 20V2C0 0.895 0.895 0 2 0H20"
            stroke="rgba(0,240,255,0.2)"
            strokeWidth="1"
          />
          <circle cx="20" cy="0" r="2" fill="rgba(0,240,255,0.3)" />
        </svg>
      </div>

      {/* Top-right corner */}
      <div className="absolute top-4 right-4 z-20 pointer-events-none">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path
            d="M40 20V2C40 0.895 39.105 0 38 0H20"
            stroke="rgba(0,240,255,0.2)"
            strokeWidth="1"
          />
          <circle cx="20" cy="0" r="2" fill="rgba(0,240,255,0.3)" />
        </svg>
      </div>

      {/* Bottom-left corner */}
      <div className="absolute bottom-20 left-4 z-20 pointer-events-none">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path
            d="M0 20V38C0 39.105 0.895 40 2 40H20"
            stroke="rgba(0,240,255,0.2)"
            strokeWidth="1"
          />
          <circle cx="20" cy="40" r="2" fill="rgba(0,240,255,0.3)" />
        </svg>
      </div>

      {/* Bottom-right corner */}
      <div className="absolute bottom-20 right-4 z-20 pointer-events-none">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path
            d="M40 20V38C40 39.105 39.105 40 38 40H20"
            stroke="rgba(0,240,255,0.2)"
            strokeWidth="1"
          />
          <circle cx="20" cy="40" r="2" fill="rgba(0,240,255,0.3)" />
        </svg>
      </div>

      {/* Status indicator — bottom left */}
      <div className="absolute bottom-24 left-8 z-20 hidden lg:flex items-center gap-2 pointer-events-none">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] tracking-[0.2em] uppercase text-emerald-400/60 font-mono">
          System Online
        </span>
      </div>

      {/* Coordinates display — bottom right */}
      <div className="absolute bottom-24 right-8 z-20 hidden lg:flex items-center gap-3 pointer-events-none">
        <span className="text-[10px] tracking-[0.15em] text-cyan-400/40 font-mono">
          LAT 0.00° — LON 0.00°
        </span>
        <div className="w-px h-3 bg-cyan-400/20" />
        <span className="text-[10px] tracking-[0.15em] text-cyan-400/40 font-mono">
          ALT 35,786 KM
        </span>
      </div>
    </>
  );
}
