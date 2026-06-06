'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Navbar            from '@/components/Navbar';
import CesiumGlobe       from '@/components/CesiumGlobe';
import BackgroundEffects from '@/components/BackgroundEffects';
import { CityData, citiesRawData } from '@/data/citiesData';
import { PREDICTIONS } from '@/data/predictionsData';

const DEFAULT_OVERLAYS = { climate: false, pollution: false, energy: true, satellite: false, ai: false };

const categoryImages: Record<string, string> = {
  AI: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80',
  Climate: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80',
  Energy: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&auto=format&fit=crop&q=80',
  Space: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
  Cities: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&auto=format&fit=crop&q=80',
  Transport: 'https://images.unsplash.com/photo-1494783367193-149034c01e8f?w=600&auto=format&fit=crop&q=80',
  Healthcare: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
  Society: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
};

const getRegionForCity = (cityName: string): string => {
  const map: Record<string, string> = {
    'Nairobi': 'Kenya',
    'London': 'United Kingdom',
    'Masdar City': 'UAE',
    'Silicon Valley': 'United States',
    'Hsinchu': 'Taiwan',
    'Shenzhen': 'China',
    'Munich': 'Germany',
    'Seoul': 'South Korea',
    'Singapore': 'Singapore',
    'Austin': 'United States',
    'Iter Cadarache': 'France',
    'Naka': 'Japan',
    'Hefei': 'China',
    'Boston': 'United States',
    'Culham': 'United Kingdom',
    'Cape Canaveral': 'United States',
    'Kourou': 'French Guiana',
    'Tanegashima': 'Japan',
    'Baikonur': 'Kazakhstan',
    'Wenchang': 'China',
    'Katanga': 'Congo',
    'Pilbara': 'Australia',
    'Salar De Uyuni': 'Bolivia',
    'Malacca': 'Malaysia',
    'Suez': 'Egypt',
    'Panama': 'Panama',
    'Hormuz': 'Iran',
    'New Delhi': 'India',
    'Mumbai': 'India',
    'Tokyo': 'Japan',
    'New York': 'United States',
    'Paris': 'France',
    'Dubai': 'UAE',
    'Seoul ': 'South Korea',
    'Sydney': 'Australia',
    'São Paulo': 'Brazil',
    'Lagos': 'Nigeria',
    'Cairo': 'Egypt',
    'Beijing': 'China',
    'Los Angeles': 'United States',
  };
  return map[cityName] || 'Global';
};

const getImpactLevel = (score: number): 'Critical' | 'High' | 'Moderate' => {
  if (score > 80) return 'Critical';
  if (score > 65) return 'High';
  return 'Moderate';
};

const getCategoryStyle = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('ai')) return { color: '#00F5D4', shadow: 'rgba(0, 245, 212, 0.15)', bg: 'rgba(0, 245, 212, 0.04)' };
  if (cat.includes('climate')) return { color: '#FF0055', shadow: 'rgba(255, 0, 85, 0.15)', bg: 'rgba(255, 0, 85, 0.04)' };
  if (cat.includes('energy')) return { color: '#00F5B0', shadow: 'rgba(0, 245, 176, 0.15)', bg: 'rgba(0, 245, 176, 0.04)' };
  if (cat.includes('space')) return { color: '#BF5AF2', shadow: 'rgba(191, 90, 242, 0.15)', bg: 'rgba(191, 90, 242, 0.04)' };
  if (cat.includes('cities')) return { color: '#0A84FF', shadow: 'rgba(10, 132, 255, 0.15)', bg: 'rgba(10, 132, 255, 0.04)' };
  if (cat.includes('transport')) return { color: '#CCFF00', shadow: 'rgba(204, 255, 0, 0.15)', bg: 'rgba(204, 255, 0, 0.04)' };
  if (cat.includes('healthcare')) return { color: '#00E5FF', shadow: 'rgba(0, 229, 255, 0.15)', bg: 'rgba(0, 229, 255, 0.04)' };
  return { color: '#00F5B0', shadow: 'rgba(0, 245, 176, 0.15)', bg: 'rgba(0, 245, 176, 0.04)' };
};

function HomeContent() {
  const router = useRouter();

  const [activeYear, setActiveYear] = useState(2050);
  const [isPanelOpen, setIsPanelOpen] = useState(false); // Mobile toggle

  // Redirect callbacks on interaction
  const handleSelectCity = (city: CityData | null) => {
    if (city) {
      router.push(`/dashboard?city=${encodeURIComponent(city.name)}`);
    }
  };

  const handleSelectCountry = (code: string | null) => {
    if (code) {
      router.push(`/dashboard?country=${code}`);
    }
  };

  // Filter and sort events for the "WHAT'S HOT" section
  const yearPredictions = PREDICTIONS.filter(p => p.year === activeYear);
  const sortedYearPredictions = [...yearPredictions].sort((a, b) => b.votes - a.votes);

  return (
    <main className="relative h-screen w-screen overflow-hidden" style={{ background: '#02060A' }}>
      {/* Top Navigation */}
      <Navbar setActiveCity={handleSelectCity} />

      {/* Global starfield/atmosphere background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <BackgroundEffects earthMode="cyber" />
      </div>

      {/* Centered-Left Hero Circular Globe Container */}
      <div className="home-globe-container">
        <CesiumGlobe
          activeYear={activeYear}
          activeCategory="AI"
          activeCity={null}
          setActiveCity={handleSelectCity}
          activeCountry={null}
          setActiveCountry={handleSelectCountry}
          overlays={DEFAULT_OVERLAYS}
          earthMode="cyber"
          activeLayers={{
            cities: true,
            climate: true,
            tech: false,
            energy: false,
            space: false,
            geopolitical: false,
          }}
          activeSimulations={{
            seaLevelRise: 0,
            fusionBreakthrough: false,
            agiEmergence: false,
            popDecline: false,
            renewableTransition: false,
            arcticDominance: false,
            semiDisruptions: false,
          }}
        />
      </div>

      {/* Timeline Selector floating under the globe */}
      <div className="home-timeline-container premium-glass px-10 py-4 rounded-full flex items-center gap-8">
        <span className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-[0.25em] font-bold select-none">Timeline</span>
        <div className="flex items-center">
          {([2030, 2040, 2050] as const).map((year, index) => {
            const isActive = activeYear === year;
            return (
              <div key={year} className="flex items-center">
                {index > 0 && (
                  <div className="w-20 h-[3px] bg-white/10 mx-3 relative rounded-full">
                    <div 
                      className="absolute inset-0 bg-[#00F5B0] transition-all duration-500 rounded-full"
                      style={{
                        opacity: activeYear >= year ? 0.8 : 0,
                        boxShadow: activeYear >= year ? '0 0 10px #00F5B0, 0 0 20px #00F5B0' : 'none'
                      }}
                    />
                  </div>
                )}
                <button
                  onClick={() => setActiveYear(year)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: isActive ? 800 : 550,
                    color: isActive ? '#00F5B0' : 'rgba(255, 255, 255, 0.45)',
                    transition: 'all 0.3s ease',
                    textShadow: isActive ? '0 0 12px rgba(0,245,176,0.95), 0 0 24px rgba(0,245,176,0.4)' : 'none',
                    fontFamily: 'monospace',
                    transform: isActive ? 'scale(1.15)' : 'none',
                  }}
                  className={`hover:text-white flex flex-col items-center gap-1 ${isActive ? 'timeline-dot-pulse font-bold' : ''}`}
                >
                  <span>{year}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Side: "WHAT'S HOT" Event Panel */}
      <div className={`custom-scrollbar premium-glass p-6 whats-hot-panel ${isPanelOpen ? 'open' : ''}`}>
        <div className="flex flex-col gap-1 border-b border-[#00F5B0]/15 pb-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-[#00F5B0] uppercase tracking-widest font-semibold">Discovery Grid</span>
            <button 
              className="md:hidden text-[10px] font-mono text-rose-400 bg-transparent border-none cursor-pointer"
              onClick={() => setIsPanelOpen(false)}
            >
              [CLOSE]
            </button>
          </div>
          <h3 className="text-sm font-bold text-white tracking-wider uppercase font-mono m-0 mt-1">What's Hot in {activeYear}</h3>
        </div>

        {/* Scrollable Events List */}
        <div key={activeYear} className="flex flex-col gap-4">
          {sortedYearPredictions.map((story, index) => {
            const region = getRegionForCity(story.city).toUpperCase();
            const impact = getImpactLevel(story.confidenceScore);
            const catStyle = getCategoryStyle(story.category);
            
            return (
              <div 
                key={story.id} 
                className="group whats-hot-panel-card flex flex-col gap-3 p-4 bg-black/55 border border-white/5 rounded-lg cursor-pointer transition-all duration-300 hover:translate-y-[-4px]"
                style={{
                  '--glow-color': catStyle.color,
                  '--glow-shadow-color': catStyle.shadow,
                  animation: 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
                  animationDelay: `${index * 0.08}s`
                } as any}
                onClick={() => router.push(`/dashboard?prediction=${story.slug}`)}
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="thumbnail-container w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-white/5 border border-white/15 transition-all duration-300">
                    <img
                      src={categoryImages[story.category] || categoryImages.AI}
                      alt={story.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=150&auto=format&fit=crop&q=60';
                      }}
                    />
                  </div>
                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[10px] font-mono tracking-wider">
                        <span className="font-bold" style={{ color: catStyle.color }}>{story.year} • {region}</span>
                        <span className={`px-1.5 py-0.5 rounded-[2px] font-bold border ${
                          impact === 'Critical' 
                            ? 'bg-rose-950/40 text-rose-400 border-rose-500/25' 
                            : impact === 'High'
                              ? 'bg-amber-950/40 text-amber-400 border-amber-500/25'
                              : 'bg-emerald-950/40 text-[#00F5B0] border-[#00F5B0]/25'
                        }`}>
                          {impact}
                        </span>
                      </div>
                      <h4 className="text-[13px] font-bold text-[#F5F5F5] group-hover:text-white transition-colors leading-snug m-0 pr-1 tracking-wide">
                        {story.title}
                      </h4>
                    </div>
                    
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8] uppercase tracking-wider mt-1">
                      <span>Category: <span style={{ color: catStyle.color }} className="font-semibold">{story.category}</span></span>
                      <span>Likelihood: <span style={{ color: catStyle.color }} className="font-bold">{story.confidenceScore}%</span></span>
                    </div>
                  </div>
                </div>
                <p className="text-[12px] text-[#CBD5E1] leading-relaxed font-normal line-clamp-2 m-0 border-t border-white/5 pt-2 mt-1">
                  {story.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Toggle Tab for "WHAT'S HOT" on Mobile */}
      <button
        onClick={() => setIsPanelOpen(true)}
        className={`fixed md:hidden z-20 bottom-6 right-6 px-4 py-2.5 bg-[#02060A] border border-[#00F5B0]/30 hover:border-[#00F5B0]/60 rounded-full text-xs font-mono text-[#00F5B0] uppercase tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(0,245,176,0.15)]
          ${isPanelOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        🔥 What's Hot
      </button>

      {/* Media Queries & Responsive Overrides */}
      <style jsx global>{`
        .home-globe-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          z-index: 5;
          border-radius: 0;
          overflow: hidden;
          border: none;
          box-shadow: none;
          transform: none;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @media (min-width: 768px) {
          .home-globe-container {
            left: -24vw; /* Offset container left to center globe around 38% width */
            top: 0;
            width: 124vw; /* Fills the screen to the right edge to prevent horizontal clipping */
            height: 100vh;
            transform: none;
            border-radius: 0;
            border: none;
            box-shadow: none;
          }
        }

        .home-timeline-container {
          position: absolute;
          bottom: 10%;
          left: 50%;
          transform: translateX(-50%);
          z-index: 15;
          pointer-events: auto;
        }
        @media (min-width: 768px) {
          .home-timeline-container {
            left: 38%;
          }
        }

        .whats-hot-panel {
          position: fixed;
          z-index: 30;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: auto;
          overflow-y: auto;
          
          /* Mobile Bottom Sheet style */
          bottom: 0;
          left: 0;
          right: 0;
          width: 100%;
          height: 45vh;
          border-radius: 1rem 1rem 0 0;
          border: none;
          border-top: 1px solid rgba(0, 245, 176, 0.2);
          transform: translateY(100%);
        }

        .whats-hot-panel.open {
          transform: translateY(0);
        }

        @media (min-width: 768px) {
          .whats-hot-panel {
            /* Desktop right panel floating HUD style */
            top: 115px;
            bottom: 3rem;
            right: 3rem;
            left: auto;
            width: 380px;
            height: auto;
            border-radius: 0.5rem;
            transform: none;
          }
          .whats-hot-panel.open {
            transform: none;
          }
        }

        .whats-hot-panel-card {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .whats-hot-panel-card:hover {
          border-color: var(--glow-color, rgba(0, 245, 176, 0.3)) !important;
          box-shadow: 0 0 15px var(--glow-shadow-color, rgba(0, 245, 176, 0.08)) !important;
        }
        .whats-hot-panel-card:hover .thumbnail-container {
          border-color: var(--glow-color, rgba(0, 245, 176, 0.3)) !important;
          box-shadow: 0 0 12px var(--glow-shadow-color, rgba(0, 245, 176, 0.15)) !important;
        }
      `}</style>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen bg-[#02060A] flex items-center justify-center font-mono text-[#00F5B0] text-xs">
        CONNECTING TO ORBITAL CHRONO_GRID...
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
