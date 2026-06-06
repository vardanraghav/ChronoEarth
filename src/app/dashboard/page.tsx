'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar            from '@/components/Navbar';
import CesiumGlobe       from '@/components/CesiumGlobe';
import BackgroundEffects from '@/components/BackgroundEffects';
import CityPreviewCard   from '@/components/CityPreviewCard';
import { getCitySlug } from '@/data/citiesExtendedData';
import { CityData, citiesRawData, generateCityIntelligence } from '@/data/citiesData';
import { generateCountryProjections } from '@/data/countryData';
import { getKnowledgeCard } from '@/data/knowledgeCards';
import { PREDICTIONS, Prediction } from '@/data/predictionsData';

const DEFAULT_OVERLAYS = { climate: false, pollution: false, energy: true, satellite: false, ai: false };

const generateSparkline = (baseVal: number, growthRate: number) => {
  const points = [];
  let currentVal = baseVal;
  for (let i = 0; i < 5; i++) {
    points.push(currentVal);
    currentVal *= growthRate;
  }
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const svgPoints = points.map((val, idx) => {
    const x = idx * 25;
    const y = 25 - ((val - min) / range) * 20;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg className="w-full h-8" viewBox="0 0 100 30" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00F5B0" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#00F5B0" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={svgPoints} fill="none" stroke="#00F5B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points={`0,30 ${svgPoints} 100,30`} fill="url(#glowGrad)" />
    </svg>
  );
};

const ProgressBar = ({ value, label, isRisk = false }: { value: number; label: string; isRisk?: boolean }) => {
  const color = isRisk ? (value > 70 ? '#F43F5E' : (value > 45 ? '#FFB800' : '#00F5B0')) : '#00F5B0';
  const shadowColor = isRisk ? (value > 70 ? 'rgba(244, 63, 94, 0.4)' : (value > 45 ? 'rgba(255, 184, 0, 0.4)' : 'rgba(0, 245, 176, 0.4)')) : 'rgba(0, 245, 176, 0.4)';
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center text-[10px] font-mono tracking-wider text-[#7A8694]">
        <span>{label}</span>
        <span style={{ color, fontWeight: 500 }}>{value}%</span>
      </div>
      <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden relative">
        <div 
          className="h-full rounded-full transition-all duration-500" 
          style={{ 
            width: `${value}%`, 
            backgroundColor: color, 
            boxShadow: `0 0 6px ${shadowColor}` 
          }} 
        />
      </div>
    </div>
  );
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const cityParam = searchParams.get('city');
  const countryParam = searchParams.get('country');
  const predictionParam = searchParams.get('prediction');

  const [activeYear, setActiveYear] = useState(2050);
  const [activeCity, setActiveCity] = useState<CityData | null>(null);
  const [activeCountry, setActiveCountry] = useState<string | null>(null);
  const [activePrediction, setActivePrediction] = useState<Prediction | null>(null);
  const [selectedDossier, setSelectedDossier] = useState<string | null>(null);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);

  const [countryChatMessages, setCountryChatMessages] = useState<Record<string, Array<{ author: string; text: string; time: string }>>>({
    'IND': [
      { author: 'Vikram_Aravind', text: 'Semiconductor fabs in Gujarat will reach peak output by 2040, yaar.', time: '09:12' },
      { author: 'Sanya_2050', text: 'Solar microgrids are completely transforming rural power dynamics here, solid progress.', time: '09:25' }
    ],
    'USA': [
      { author: 'Amit_Austin', text: 'Fusion net-gain targets will likely hit grid commercialization in CA by 2045, guys.', time: '08:50' },
      { author: 'Sneha_California', text: 'AGI safety guidelines need international coordination or they won\'t work, simple as that.', time: '09:10' }
    ],
    'CHN': [
      { author: 'Rajesh_Beijing', text: 'The new quantum cryptography hubs in Shenzhen are now fully operational, checked the logs.', time: '09:15' },
      { author: 'Divya_Shanghai', text: 'Gobi solar deflector arrays are blocking 1.2% solar irradiance, really awesome yield.', time: '09:20' }
    ]
  });
  const [newDossierMsg, setNewDossierMsg] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsLeftPanelCollapsed(true);
      setIsRightPanelCollapsed(true);
    }
  }, []);

  const [activeLayers, setActiveLayers] = useState({
    cities: true,
    climate: true,
    tech: true,
    energy: false,
    space: false,
    geopolitical: true,
  });

  const [activeSimulations, setActiveSimulations] = useState({
    seaLevelRise: 0,
    fusionBreakthrough: false,
    agiEmergence: false,
    popDecline: false,
    renewableTransition: false,
    arcticDominance: false,
    semiDisruptions: false,
  });

  // Sync state with query parameters
  useEffect(() => {
    if (cityParam) {
      const cityObj = citiesRawData.find(c => c.name.toLowerCase() === cityParam.toLowerCase());
      if (cityObj) {
        setActiveCity(cityObj as any);
        setActiveCountry(null);
        setActivePrediction(null);
        setIsRightPanelCollapsed(false); // Auto-expand right panel on selection
      }
    } else if (countryParam) {
      setActiveCountry(countryParam.toUpperCase());
      setActiveCity(null);
      setActivePrediction(null);
      setIsRightPanelCollapsed(false); // Auto-expand right panel on selection
    } else if (predictionParam) {
      const predObj = PREDICTIONS.find(p => p.slug === predictionParam);
      if (predObj) {
        setActivePrediction(predObj);
        setActiveCity(null);
        setActiveCountry(null);
        setIsRightPanelCollapsed(false); // Auto-expand right panel on selection
      }
    } else {
      setActiveCity(null);
      setActiveCountry(null);
      setActivePrediction(null);
    }
  }, [cityParam, countryParam, predictionParam]);

  const handleSelectCity = (city: CityData | null) => {
    const url = new URL(window.location.href);
    if (city) {
      url.searchParams.set('city', city.name);
      url.searchParams.delete('country');
      url.searchParams.delete('prediction');
    } else {
      url.searchParams.delete('city');
    }
    router.push(url.pathname + url.search);
  };

  const handleSelectCountry = (code: string | null) => {
    const url = new URL(window.location.href);
    if (code) {
      url.searchParams.set('country', code);
      url.searchParams.delete('city');
      url.searchParams.delete('prediction');
    } else {
      url.searchParams.delete('country');
    }
    router.push(url.pathname + url.search);
  };

  const handleClearSelection = () => {
    router.push('/dashboard');
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden" style={{ background: '#02060A' }}>
      {/* Top Navigation */}
      <Navbar setActiveCity={handleSelectCity} />

      {/* Full screen Globe */}
      <div 
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100vw',
          height: '100%',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        <BackgroundEffects earthMode="cyber" />
        <CesiumGlobe
          activeYear={activeYear}
          activeCategory="AI"
          activeCity={activeCity}
          setActiveCity={handleSelectCity}
          activeCountry={activeCountry}
          setActiveCountry={handleSelectCountry}
          overlays={DEFAULT_OVERLAYS}
          earthMode="cyber"
          activeLayers={activeLayers}
          activeSimulations={activeSimulations}
        />
      </div>

      {/* Depth Vignettes */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1,
          height: '160px',
          background: 'linear-gradient(180deg, rgba(2,6,10,0.85) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1,
          height: '180px',
          background: 'linear-gradient(0deg, rgba(2,6,10,0.90) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Floating Left: Intelligence Layers Panel */}
      <div 
        style={{
          position: 'fixed',
          left: '40px',
          top: '110px',
          width: '280px',
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          pointerEvents: 'auto',
          transform: isLeftPanelCollapsed ? 'translateX(calc(-100% - 60px))' : 'translateX(0)',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="premium-glass p-6 rounded-lg animate-fade-in"
      >
        {/* Left Chevron Toggler Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLeftPanelCollapsed(!isLeftPanelCollapsed);
          }}
          className="absolute top-0 -right-6 w-6 h-12 bg-[#02060A]/85 backdrop-blur-md border-y border-r border-[#00F5B0]/30 hover:border-[#00F5B0]/60 rounded-r-md text-[10px] text-[#00F5B0] flex items-center justify-center transition-all duration-300 cursor-pointer shadow-[5px_0_15px_rgba(0,245,176,0.15)] focus:outline-none"
        >
          {isLeftPanelCollapsed ? '❯' : '❮'}
        </button>
        <div className="flex flex-col gap-1 border-b border-[#00F5B0]/15 pb-3">
          <span className="text-[10px] font-mono text-[#00F5B0] uppercase tracking-widest font-semibold">Intelligence</span>
          <h3 className="text-sm font-light text-white tracking-wider uppercase font-mono m-0">Planetary Layers</h3>
        </div>

        <div className="flex flex-col gap-4">
          {([
            { key: 'cities', label: 'Future Cities', icon: '🏙️' },
            { key: 'climate', label: 'Climate Intel', icon: '🌍' },
            { key: 'tech', label: 'AI & Technology', icon: '💻' },
            { key: 'energy', label: 'Planetary Energy', icon: '⚡' },
            { key: 'space', label: 'Space Infrastructure', icon: '🚀' },
            { key: 'geopolitical', label: 'Geopolitical Grid', icon: '🗺️' }
          ] as const).map(({ key, label, icon }) => (
            <div key={key} className="flex items-center justify-between group py-1">
              <div className="flex items-center gap-3">
                <span className="text-base group-hover:scale-110 transition-transform">{icon}</span>
                <span className="text-xs text-white/75 group-hover:text-white transition-colors tracking-wide font-sans">{label}</span>
              </div>
              <button
                onClick={() => setActiveLayers(prev => ({ ...prev, [key]: !prev[key] }))}
                className="relative w-9 h-5 rounded-full transition-colors duration-300 focus:outline-none cursor-pointer"
                style={{
                  background: activeLayers[key] ? '#00F5B0' : 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  boxShadow: activeLayers[key] ? '0 0 10px rgba(0, 245, 176, 0.4)' : 'none',
                }}
              >
                <span
                  className="absolute top-[2px] left-[2px] w-[14px] h-[14px] rounded-full bg-white transition-transform duration-300"
                  style={{
                    transform: activeLayers[key] ? 'translateX(16px)' : 'translateX(0)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Center-Bottom: Timeline Selector */}
      <div 
        style={{
          position: 'fixed',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
          pointerEvents: 'auto',
        }}
        className="premium-glass px-8 py-3 rounded-full flex items-center gap-6"
      >
        <span className="text-[10px] font-mono text-[#7A8694] uppercase tracking-[0.2em] font-semibold">Timeline</span>
        <div className="flex items-center">
          {([2030, 2040, 2050] as const).map((year, index) => {
            const isActive = activeYear === year;
            return (
              <div key={year} className="flex items-center">
                {index > 0 && (
                  <div className="w-16 h-[1px] bg-white/10 mx-3 relative">
                    <div 
                      className="absolute inset-0 bg-[#00F5B0] transition-all duration-500"
                      style={{
                        opacity: activeYear >= year ? 0.35 : 0,
                        boxShadow: activeYear >= year ? '0 0 4px #00F5B0' : 'none'
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
                    fontSize: '12px',
                    fontWeight: isActive ? 600 : 300,
                    color: isActive ? '#00F5B0' : 'rgba(255, 255, 255, 0.45)',
                    transition: 'all 0.3s ease',
                    textShadow: isActive ? '0 0 10px rgba(0,245,176,0.6)' : 'none',
                    fontFamily: 'monospace'
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

      {/* Floating Right: Briefing Profile Panel */}
      <div 
        style={{
          position: 'fixed',
          right: '40px',
          top: '110px',
          bottom: '40px',
          width: 'min(340px, calc(100vw - 80px))',
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          pointerEvents: 'auto',
          overflowY: 'auto',
          transform: isRightPanelCollapsed ? 'translateX(calc(100% + 60px))' : 'translateX(0)',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="premium-glass p-6 rounded-lg custom-scrollbar animate-fade-in"
      >
        {/* Right Chevron Toggler Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsRightPanelCollapsed(!isRightPanelCollapsed);
          }}
          className="absolute top-0 -left-6 w-6 h-12 bg-[#02060A]/85 backdrop-blur-md border-y border-l border-[#00F5B0]/30 hover:border-[#00F5B0]/60 rounded-l-md text-[10px] text-[#00F5B0] flex items-center justify-center transition-all duration-300 cursor-pointer shadow-[-5px_0_15px_rgba(0,245,176,0.15)] focus:outline-none"
        >
          {isRightPanelCollapsed ? '❮' : '❯'}
        </button>
        {activeCity ? (
          // CITY DOSSIER
          (() => {
            const cityStats = generateCityIntelligence(activeCity, activeYear, activeSimulations);
            const cityGdp = cityStats.population * 0.045 * (cityStats.smartCityIndex / 100);
            return (
              <div className="flex flex-col gap-5">
                <div className="border-b border-[#00F5B0]/15 pb-3">
                  <span className="text-[10px] font-mono text-[#00F5B0] uppercase tracking-widest font-semibold">City Dossier</span>
                  <h2 className="text-lg font-light text-white m-0 mt-0.5 tracking-wide">{activeCity.name}</h2>
                  <span className="text-[10px] text-[#7A8694] font-mono uppercase tracking-wider">{activeCity.country}</span>
                </div>

                <div className="flex flex-col gap-2 bg-black/30 border border-white/5 rounded-lg p-3">
                  <div className="flex justify-between items-center text-[10px] font-mono text-[#7A8694]">
                    <span>Growth Vector</span>
                    <span className="text-white">Active</span>
                  </div>
                  {generateSparkline(cityStats.population, 1.05)}
                </div>

                <div className="flex flex-col gap-4 bg-black/20 border border-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[10px] text-[#7A8694] font-mono uppercase tracking-wider">Population</span>
                    <span className="text-xs font-medium text-white">{cityStats.population.toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[10px] text-[#7A8694] font-mono uppercase tracking-wider">Estimated GDP</span>
                    <span className="text-xs font-medium text-white">${cityGdp.toFixed(1)}B</span>
                  </div>
                  <ProgressBar value={cityStats.smartCityIndex} label="AI Readiness" />
                  <ProgressBar value={cityStats.climateRisk} label="Climate Risk" isRisk={true} />
                </div>

                <div className="flex flex-col gap-2.5 mt-auto">
                  <Link
                    href={`/city/${getCitySlug(activeCity.name)}`}
                    className="w-full py-2.5 bg-[#00F5B0] hover:bg-[#00D98F] text-[#02060A] text-xs font-semibold rounded text-center transition-all duration-300 no-underline cursor-pointer tracking-wider uppercase font-mono shadow-[0_0_15px_rgba(0,245,176,0.2)] hover:shadow-[0_0_20px_rgba(0,245,176,0.4)]"
                  >
                    Open Full Briefing →
                  </Link>
                  <button
                    onClick={handleClearSelection}
                    className="w-full py-2 bg-transparent hover:bg-white/5 border border-white/10 hover:border-white/20 text-[#7A8694] hover:text-white text-xs rounded transition-all duration-300 cursor-pointer font-mono uppercase tracking-wider"
                  >
                    Close Briefing
                  </button>
                  <Link
                    href="/"
                    className="w-full py-2 border border-[#00F5B0]/30 hover:border-[#00F5B0]/60 text-[#00F5B0] hover:text-[#00F5B0]/80 text-xs rounded transition-all duration-300 cursor-pointer font-mono uppercase tracking-wider text-center no-underline"
                  >
                    ← Return to Orbit
                  </Link>
                </div>
              </div>
            );
          })()
        ) : activeCountry ? (
          // COUNTRY DOSSIER
          (() => {
            const countryProfile = generateCountryProjections(activeCountry, activeYear, activeSimulations);
            return (
              <div className="flex flex-col gap-5">
                <div className="border-b border-[#00F5B0]/15 pb-3">
                  <span className="text-[10px] font-mono text-[#00F5B0] uppercase tracking-widest font-semibold">Country Dossier</span>
                  <h2 className="text-lg font-light text-white m-0 mt-0.5 tracking-wide">{countryProfile.name}</h2>
                  <span className="text-[10px] text-[#7A8694] font-mono uppercase tracking-wider">Timeline {activeYear}</span>
                </div>

                <div className="flex flex-col gap-2 bg-black/30 border border-white/5 rounded-lg p-3">
                  <div className="flex justify-between items-center text-[10px] font-mono text-[#7A8694]">
                    <span>Macro Growth Forecast</span>
                    <span className="text-white">Active</span>
                  </div>
                  {generateSparkline(countryProfile.stats.gdp, 1.03)}
                </div>

                <div className="flex flex-col gap-4 bg-black/20 border border-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[10px] text-[#7A8694] font-mono uppercase tracking-wider">Population</span>
                    <span className="text-xs font-medium text-white">{countryProfile.stats.population.toFixed(2)}B</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[10px] text-[#7A8694] font-mono uppercase tracking-wider">GDP (Trillion)</span>
                    <span className="text-xs font-medium text-white">${countryProfile.stats.gdp.toFixed(1)}T</span>
                  </div>
                  <ProgressBar value={countryProfile.scores.aiReadiness} label="AI Readiness" />
                  <ProgressBar value={countryProfile.scores.climateRisk} label="Climate Risk" isRisk={true} />
                </div>

                <div className="flex flex-col gap-2 bg-black/10 border border-white/5 rounded-lg p-3">
                  <span className="text-[9px] text-[#7A8694] uppercase tracking-wider font-mono">Future Core Industries</span>
                  <div className="flex flex-wrap gap-1.5 mt-0.5">
                    {countryProfile.industries.map((ind, idx) => (
                      <span key={idx} className="text-[9px] bg-white/5 border border-white/10 text-white/85 rounded px-2 py-0.5 font-mono">
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Future Community Live Feed */}
                <div className="flex flex-col gap-3 bg-black/35 border border-[#00F5B0]/20 rounded-lg p-3">
                  <div className="flex justify-between items-center border-b border-[#00F5B0]/15 pb-1.5">
                    <span className="text-[10px] text-[#00F5B0] font-mono uppercase tracking-wider font-bold">Future Community</span>
                    <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {Math.floor(((countryProfile.stats.population * 17) % 5) + 5)} Online
                    </span>
                  </div>

                  {/* Micro message stream */}
                  <div className="flex flex-col gap-2 max-h-[110px] overflow-y-auto custom-scrollbar">
                    {((countryChatMessages[activeCountry] || [
                      { author: 'Gita_Citizen', text: 'Monitoring developmental coefficients for this region...', time: '09:00' },
                      { author: 'Pooja_Predictor', text: 'Planetary stabilization forecast index stable.', time: '09:12' }
                    ])).map((msg, idx) => (
                      <div key={idx} className="flex flex-col gap-0.5 text-[10px] border-l border-white/5 pl-2">
                        <div className="flex justify-between font-mono text-[8px] text-[#94A3B8]">
                          <span className="font-bold">{msg.author}</span>
                          <span>{msg.time}</span>
                        </div>
                        <p className="text-white/85 leading-normal m-0 font-light text-[10px]">{msg.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Submission form */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newDossierMsg.trim()) return;
                      const newMsg = {
                        author: 'You_Citizen',
                        text: newDossierMsg,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      };
                      setCountryChatMessages(prev => ({
                        ...prev,
                        [activeCountry]: [...(prev[activeCountry] || []), newMsg]
                      }));
                      setNewDossierMsg('');
                    }}
                    className="flex border border-white/10 rounded overflow-hidden"
                  >
                    <input
                      type="text"
                      placeholder="Comment on future..."
                      value={newDossierMsg}
                      onChange={(e) => setNewDossierMsg(e.target.value)}
                      className="flex-1 bg-black/40 border-none outline-none text-[10px] text-white px-2 py-1 font-mono placeholder-white/20"
                    />
                    <button type="submit" className="px-2 bg-[#00F5B0]/10 border-l border-white/10 text-[#00F5B0] text-[9px] font-mono hover:bg-[#00F5B0] hover:text-black transition-colors font-bold uppercase cursor-pointer">
                      Send
                    </button>
                  </form>
                </div>

                <div className="flex flex-col gap-2.5 mt-auto">
                  <Link
                    href={`/futurechat?room=${activeCountry}`}
                    className="w-full py-2.5 bg-[#00F5B0] hover:bg-[#00D98F] text-[#02060A] text-xs font-semibold rounded text-center transition-all duration-300 cursor-pointer tracking-wider uppercase font-mono shadow-[0_0_15px_rgba(0,245,176,0.2)] no-underline"
                  >
                    ⚡ Join Live Debate Stage
                  </Link>
                  <button
                    onClick={() => setSelectedDossier('layer-geopolitical')}
                    className="w-full py-2 bg-transparent hover:bg-white/5 border border-white/10 hover:border-white/20 text-[#7A8694] hover:text-white text-xs rounded transition-all duration-300 cursor-pointer font-mono uppercase tracking-wider"
                  >
                    Open Full Briefing →
                  </button>
                  <button
                    onClick={handleClearSelection}
                    className="w-full py-2 bg-transparent hover:bg-white/5 border border-white/10 hover:border-white/20 text-[#7A8694] hover:text-white text-xs rounded transition-all duration-300 cursor-pointer font-mono uppercase tracking-wider"
                  >
                    Close Briefing
                  </button>
                  <Link
                    href="/"
                    className="w-full py-2 border border-[#00F5B0]/30 hover:border-[#00F5B0]/60 text-[#00F5B0] hover:text-[#00F5B0]/80 text-xs rounded transition-all duration-300 cursor-pointer font-mono uppercase tracking-wider text-center no-underline"
                  >
                    ← Return to Orbit
                  </Link>
                </div>
              </div>
            );
          })()
        ) : activePrediction ? (
          // EVENT/PREDICTION DOSSIER
          (scalePrediction => {
            return (
              <div className="flex flex-col gap-5">
                <div className="border-b border-[#00F5B0]/15 pb-3">
                  <span className="text-[10px] font-mono text-[#00F5B0] uppercase tracking-widest font-semibold">Event Dossier</span>
                  <h2 className="text-lg font-light text-white m-0 mt-0.5 tracking-wide">{activePrediction.title}</h2>
                  <span className="text-[10px] text-[#7A8694] font-mono uppercase tracking-wider">{activePrediction.category} • {activePrediction.city}</span>
                </div>

                <div className="flex flex-col gap-3 bg-black/20 border border-white/5 rounded-lg p-4">
                  <p className="text-xs text-[#A8B3BC] leading-relaxed font-light m-0">{activePrediction.description}</p>
                  <ProgressBar value={activePrediction.confidenceScore} label="Confidence Score" />
                </div>

                <div className="flex flex-col gap-2 bg-black/10 border border-white/5 rounded-lg p-3">
                  <span className="text-[9px] text-[#7A8694] uppercase tracking-wider font-mono">Futurologist Vector</span>
                  <div className="flex justify-between items-center text-xs font-mono text-white/90 mt-1">
                    <span>{activePrediction.author}</span>
                    <span className="text-[#00F5B0]">{activePrediction.votes} Votes</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 bg-black/10 border border-white/5 rounded-lg p-3">
                  <span className="text-[9px] text-[#7A8694] uppercase tracking-wider font-mono">Comments & Signals</span>
                  <div className="max-h-[140px] overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-2 mt-1">
                    {activePrediction.comments && activePrediction.comments.map((comment: any) => (
                      <div key={comment.id} className="text-[10px] bg-white/5 p-2 rounded border border-white/5">
                        <div className="flex justify-between text-[#7A8694] mb-1 font-mono">
                          <span>@{comment.author}</span>
                          <span>{comment.votes} pts</span>
                        </div>
                        <p className="text-white/80 m-0 font-light leading-normal">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 mt-auto">
                  <Link
                    href={`/predictions/${activePrediction.slug}`}
                    className="w-full py-2.5 bg-[#00F5B0] hover:bg-[#00D98F] text-[#02060A] text-xs font-semibold rounded text-center transition-all duration-300 no-underline cursor-pointer tracking-wider uppercase font-mono shadow-[0_0_15px_rgba(0,245,176,0.2)]"
                  >
                    Open Deep Analysis →
                  </Link>
                  <button
                    onClick={handleClearSelection}
                    className="w-full py-2 bg-transparent hover:bg-white/5 border border-white/10 hover:border-white/20 text-[#7A8694] hover:text-white text-xs rounded transition-all duration-300 cursor-pointer font-mono uppercase tracking-wider"
                  >
                    Close Briefing
                  </button>
                  <Link
                    href="/"
                    className="w-full py-2 border border-[#00F5B0]/30 hover:border-[#00F5B0]/60 text-[#00F5B0] hover:text-[#00F5B0]/80 text-xs rounded transition-all duration-300 cursor-pointer font-mono uppercase tracking-wider text-center no-underline"
                  >
                    ← Return to Orbit
                  </Link>
                </div>
              </div>
            );
          })()
        ) : (
          // PLANET EARTH (DEFAULT GLOBAL BRIEFING)
          (() => {
            let baseTemp = 1.4 + ((activeYear - 2025) / 25) * 1.0;
            if (activeSimulations.fusionBreakthrough) baseTemp -= 0.4;
            else if (activeSimulations.renewableTransition) baseTemp -= 0.2;

            let baseSeaLevel = 0.1 + ((activeYear - 2025) / 25) * 0.4;
            if (activeSimulations.seaLevelRise > 0) {
              baseSeaLevel = activeSimulations.seaLevelRise;
            }

            let basePop = 8.0 + ((activeYear - 2025) / 25) * 1.7;
            if (activeSimulations.popDecline) {
              basePop *= 0.88;
            }

            let baseGdp = 105.0 + ((activeYear - 2025) / 25) * 65.0;
            if (activeSimulations.semiDisruptions) baseGdp -= 10.0;

            const aiReadiness = activeSimulations.agiEmergence ? 92 : (activeYear === 2030 ? 62 : (activeYear === 2040 ? 76 : 85));
            const climateRisk = activeSimulations.seaLevelRise > 0 ? 82 : (activeSimulations.fusionBreakthrough ? 35 : 55);

            return (
              <div className="flex flex-col gap-5">
                <div className="border-b border-[#00F5B0]/15 pb-3">
                  <span className="text-[10px] font-mono text-[#00F5B0] uppercase tracking-widest font-semibold">Planetary Dossier</span>
                  <h2 className="text-lg font-light text-white m-0 mt-0.5 tracking-wide">Planet Earth</h2>
                  <span className="text-[10px] text-[#7A8694] font-mono uppercase tracking-wider">Simulation Timeline {activeYear}</span>
                </div>

                <div className="flex flex-col gap-2 bg-black/30 border border-white/5 rounded-lg p-3">
                  <div className="flex justify-between items-center text-[10px] font-mono text-[#7A8694]">
                    <span>Global GDP Projection</span>
                    <span className="text-[#00F5B0] font-semibold">${baseGdp.toFixed(0)}T</span>
                  </div>
                  {generateSparkline(baseGdp, 1.04)}
                </div>

                <div className="flex flex-col gap-4 bg-black/20 border border-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[10px] text-[#7A8694] font-mono uppercase tracking-wider">Population</span>
                    <span className="text-xs font-medium text-white">{basePop.toFixed(1)}B</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[10px] text-[#7A8694] font-mono uppercase tracking-wider">Sea Level Rise</span>
                    <span className="text-xs font-medium text-white">+{baseSeaLevel.toFixed(2)}m</span>
                  </div>
                  <ProgressBar value={aiReadiness} label="AI Readiness" />
                  <ProgressBar value={climateRisk} label="Climate Risk" isRisk={true} />
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-[10px] text-[#7A8694] font-mono uppercase tracking-wider border-t border-white/5 pt-3">
                    Explore Country Profiles
                  </span>
                  <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                    {[
                      { code: 'USA', name: '🇺🇸 United States' },
                      { code: 'IND', name: '🇮🇳 India' },
                      { code: 'CHN', name: '🇨🇳 China' },
                      { code: 'JPN', name: '🇯🇵 Japan' },
                      { code: 'GBR', name: '🇬🇧 United Kingdom' },
                      { code: 'DEU', name: '🇩🇪 Germany' },
                      { code: 'SGP', name: '🇸🇬 Singapore' },
                      { code: 'ARE', name: '🇦🇪 UAE' }
                    ].map((c) => (
                      <button
                        key={c.code}
                        onClick={() => handleSelectCountry(c.code)}
                        className="py-1.5 px-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00F5B0]/30 rounded text-left text-[11px] text-white/90 hover:text-white transition-all cursor-pointer font-mono truncate"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-white/5">
                  <Link
                    href="/"
                    className="w-full py-2.5 border border-[#00F5B0]/30 hover:border-[#00F5B0]/60 text-[#00F5B0] hover:text-[#00F5B0]/80 text-xs rounded transition-all duration-300 cursor-pointer font-mono uppercase tracking-wider text-center no-underline"
                  >
                    ← Return to Orbit
                  </Link>
                </div>
              </div>
            );
          })()
        )}
      </div>

      {/* City Return Overlay */}
      {(activeCity || activeCountry || activePrediction) && (
        <button
          onClick={handleClearSelection}
          style={{
            position: 'fixed',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 40,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '10px',
            fontWeight: 300,
            letterSpacing: '0.3em',
            color: 'rgba(0, 245, 176, 0.5)',
            textTransform: 'uppercase',
            padding: '8px 16px',
            transition: 'color 0.3s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#00F5B0')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(0, 245, 176, 0.5)')}
        >
          esc · reset focus
        </button>
      )}

      {/* City Preview Card Modal */}
      {activeCity && (
        <CityPreviewCard 
          city={activeCity}
          activeYear={activeYear}
          activeSimulations={activeSimulations}
          onClose={() => handleSelectCity(null)}
        />
      )}

      {/* Interactive Dossier modal */}
      {selectedDossier && (
        (() => {
          const card = getKnowledgeCard(selectedDossier);
          return (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md pointer-events-auto"
              onClick={() => setSelectedDossier(null)}
            >
              <div 
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '500px', background: 'rgba(4, 11, 18, 0.96)', border: '1px solid rgba(0, 245, 176, 0.3)', boxShadow: '0 0 40px rgba(0, 245, 176, 0.25)' }}
                className="card-tier-1 w-full max-h-[85vh] overflow-y-auto flex flex-col gap-4 p-6 relative rounded-lg animate-fade-up custom-scrollbar"
              >
                <button
                  onClick={() => setSelectedDossier(null)}
                  className="absolute top-4 right-4 bg-transparent border-none text-rose-400/60 hover:text-rose-400 cursor-pointer text-xs transition-colors"
                >
                  [✕]
                </button>
                <div>
                  <span className="text-[10px] font-mono text-[#00F5B0] uppercase tracking-widest font-semibold">{card.category}</span>
                  <h2 className="text-xl font-light text-white m-0 mt-0.5 tracking-wide">{card.title}</h2>
                </div>
                <div className="border border-[#00F5B0]/20 bg-black/40 rounded p-3">
                  <table className="w-full text-xs text-left font-mono">
                    <tbody>
                      {Object.entries(card.stats).map(([k, v]) => (
                        <tr key={k} className="border-b border-white/5 last:border-0">
                          <td className="py-1.5 text-[#7A8694] font-medium">{k}</td>
                          <td className="py-1.5 text-white text-right font-semibold">{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-[#7A8694] uppercase tracking-wider font-mono">Core System Explanation</span>
                  <p className="text-xs text-white/80 leading-relaxed font-light m-0">{card.explanation}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-[#7A8694] uppercase tracking-wider font-mono">Foresight Projections</span>
                  <p className="text-xs text-[#00F5B0]/95 leading-relaxed font-light m-0">{card.forecast}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-rose-400 uppercase tracking-wider font-mono">Key Vulnerabilities</span>
                    <ul className="list-none p-0 m-0 flex flex-col gap-1 text-[11px] text-white/70 font-light">
                      {card.risks.map((risk, idx) => (
                        <li key={idx} className="flex gap-1.5 items-start leading-relaxed text-left">
                          <span className="text-rose-400 select-none">•</span>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-[#00F5B0] uppercase tracking-wider font-mono">Strategic Opportunities</span>
                    <ul className="list-none p-0 m-0 flex flex-col gap-1 text-[11px] text-white/70 font-light">
                      {card.opportunities.map((opp, idx) => (
                        <li key={idx} className="flex gap-1.5 items-start leading-relaxed text-left">
                          <span className="text-[#00F5B0] select-none">•</span>
                          <span>{opp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="border-t border-white/5 pt-3 flex justify-between items-center text-[10px] text-[#7A8694] font-mono">
                  <span>Sources: {card.sources.join(', ')}</span>
                </div>
              </div>
            </div>
          );
        })()
      )}
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen bg-[#02060A] flex items-center justify-center font-mono text-[#00F5B0] text-xs">
        CONNECTING TO ORBITAL ANALYTICS...
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
