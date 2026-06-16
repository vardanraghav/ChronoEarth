'use client';

import { useState, useEffect } from 'react';
import { CityData, generateCityIntelligence } from '@/data/citiesData';
import { getExtendedCityData, getCitySlug } from '@/data/citiesExtendedData';

interface CityPreviewCardProps {
  city: CityData;
  activeYear: number;
  activeSimulations: {
    seaLevelRise: number;
    fusionBreakthrough: boolean;
    agiEmergence: boolean;
    popDecline: boolean;
    renewableTransition: boolean;
    arcticDominance: boolean;
    semiDisruptions: boolean;
  };
  onClose: () => void;
}

const COUNTRY_FLAGS: Record<string, string> = {
  'India': '🇮🇳',
  'Japan': '🇯🇵',
  'South Korea': '🇰🇷',
  'Singapore': '🇸🇬',
  'Middle East': '🇦🇪',
  'United Arab Emirates': '🇦🇪',
  'Saudi Arabia': '🇸🇦',
  'Qatar': '🇶🇦',
  'Kuwait': '🇰🇼',
  'United Kingdom': '🇬🇧',
  'UK': '🇬🇧',
  'France': '🇫🇷',
  'Germany': '🇩🇪',
  'Netherlands': '🇳🇱',
  'Spain': '🇪🇸',
  'Italy': '🇮🇹',
  'Switzerland': '🇨🇭',
  'Sweden': '🇸🇪',
  'United States': '🇺🇸',
  'USA': '🇺🇸',
  'China': '🇨🇳',
  'Russia': '🇷🇺',
  'Turkey': '🇹🇷',
  'Egypt': '🇪🇬',
  'Canada': '🇨🇦',
  'Australia': '🇦🇺',
  'Brazil': '🇧🇷',
  'South Africa': '🇿🇦',
  'Global': '🌐',
};

const MAJOR_HUBS = [
  'Tokyo', 'Singapore', 'New York', 'London', 'Shanghai', 'Dubai', 'Delhi', 'Mumbai', 'Seoul'
];

export default function CityPreviewCard({ city, activeYear, activeSimulations, onClose }: CityPreviewCardProps) {
  const [countdown, setCountdown] = useState(5);
  const [isAutoNavigating, setIsAutoNavigating] = useState(true);
  const [imageError, setImageError] = useState(false);

  const cityExtended = getExtendedCityData(city.name);
  const slug = getCitySlug(city.name);
  const stats = generateCityIntelligence(city, activeYear, activeSimulations);

  // Timer loop for redirecting after 5s
  useEffect(() => {
    if (!isAutoNavigating) return;
    if (countdown <= 0) {
      window.location.href = `/city/${slug}`;
      return;
    }
    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, slug, isAutoNavigating]);

  const handleOpenNow = () => {
    window.location.href = `/city/${slug}`;
  };

  const getMetricColor = (val: number, isRisk = false) => {
    if (isRisk) {
      if (val > 70) return '#FF3366';
      if (val > 45) return '#FF9900';
      return '#00F5D4';
    }
    if (val > 75) return '#00F5D4';
    if (val > 50) return '#00E7C2';
    return '#FF9900';
  };

  const getStrategicImportance = () => {
    const isHub = MAJOR_HUBS.some(h => h.toLowerCase() === city.name.toLowerCase() || 
                                      (city.name.toLowerCase() === 'new delhi' && h.toLowerCase() === 'delhi'));
    if (isHub) return 'Critical (98%)';
    if (city.offsets.population > 5) return 'High (85%)';
    return 'Regional (72%)';
  };

  const getPredictions = () => {
    if (cityExtended.futureProjects && cityExtended.futureProjects.length > 0) {
      return cityExtended.futureProjects.map(proj => proj.name);
    }
    const fallbackList = [];
    if (activeSimulations.agiEmergence) {
      fallbackList.push("AGI Central Node Optimization");
    } else {
      fallbackList.push("Cognitive Data Cluster Expansion");
    }
    if (activeSimulations.fusionBreakthrough) {
      fallbackList.push("Thermonuclear Grid Integration");
    } else {
      fallbackList.push("Quantum Solar Storage Array");
    }
    fallbackList.push("Planetary Drone Logistics Sync");
    return fallbackList.slice(0, 3);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm pointer-events-auto"
      onClick={onClose}
    >
      <style jsx>{`
        @keyframes premiumOpen {
          0% {
            opacity: 0;
            transform: scale(0.92) translateY(30px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-premium-open {
          animation: premiumOpen 280ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div 
        onClick={e => e.stopPropagation()}
        className="animate-premium-open w-full max-w-[800px] p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden"
        style={{
          background: 'rgba(3, 15, 18, 0.95)',
          border: '1px solid rgba(0, 245, 212, 0.08)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 245, 212, 0.10)',
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 bg-transparent border-none text-[#7A8694] hover:text-white cursor-pointer text-xs font-mono transition-colors"
        >
          [✕]
        </button>

        {/* LEFT COLUMN: Circular City Image */}
        <div className="flex flex-col items-center justify-start shrink-0" style={{ width: '160px' }}>
          <div 
            className="rounded-full overflow-hidden border-2 border-[#00F5D4]/30 shadow-[0_0_20px_rgba(0,245,212,0.15)] relative group"
            style={{ width: '140px', height: '140px' }}
          >
            {imageError ? (
              <div className="w-full h-full bg-[#05182D] flex flex-col items-center justify-center text-xs font-mono text-[#00F5D4] tracking-widest">
                OFFLINE
              </div>
            ) : (
              <img 
                src={cityExtended.image} 
                alt={city.name} 
                onError={() => setImageError(true)}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#02060A]/60 to-transparent pointer-events-none" />
          </div>
          
          {/* Status Badge */}
          <div className="mt-4 px-3 py-1 rounded-full bg-[#030f12]/40 border border-[#00f5d4]/20 text-[9px] font-mono text-[#00F5D4] tracking-widest uppercase shadow-[0_0_10px_rgba(0,245,212,0.05)]">
            {activeYear && city.year && city.year <= activeYear ? 'ACTIVE NODE' : 'MONITORING'}
          </div>
        </div>

        {/* RIGHT COLUMN: Info, Stats and Predictions */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-1 border-b border-[#00f5d4]/10 pb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-light text-white m-0 tracking-wide">
                {city.name}
              </h2>
              <span className="text-2xl md:text-3xl filter drop-shadow-[0_0_8px_rgba(0,245,212,0.3)]">
                {COUNTRY_FLAGS[city.country] || '🌐'}
              </span>
            </div>
            <div className="text-[10px] text-[#00F5D4] font-mono tracking-[0.25em] uppercase font-semibold">
              {city.country} // NODE METRICS
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {/* Population */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-[#7A8694] uppercase tracking-wider font-mono">Population</span>
              <span className="text-base font-semibold text-white font-mono">{stats.population.toFixed(1)}M</span>
            </div>
            {/* AI Index */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-[#7A8694] uppercase tracking-wider font-mono">AI Index</span>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-white font-mono">{stats.aiAdoption}%</span>
                <div className="flex-1 h-[3px] bg-white/5 rounded-full overflow-hidden hidden sm:block">
                  <div className="h-full bg-[#00F5D4]" style={{ width: `${stats.aiAdoption}%`, boxShadow: '0 0 4px rgba(0, 245, 212, 0.4)' }} />
                </div>
              </div>
            </div>
            {/* Climate Risk */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-[#7A8694] uppercase tracking-wider font-mono">Climate Risk</span>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold font-mono" style={{ color: getMetricColor(stats.climateRisk, true) }}>{stats.climateRisk}%</span>
                <div className="flex-1 h-[3px] bg-white/5 rounded-full overflow-hidden hidden sm:block">
                  <div className="h-full" style={{ width: `${stats.climateRisk}%`, backgroundColor: getMetricColor(stats.climateRisk, true) }} />
                </div>
              </div>
            </div>
            {/* Energy Score */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-[#7A8694] uppercase tracking-wider font-mono">Energy Score</span>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-white font-mono">{stats.sustainability}%</span>
                <div className="flex-1 h-[3px] bg-white/5 rounded-full overflow-hidden hidden sm:block">
                  <div className="h-full bg-[#00F5D4]" style={{ width: `${stats.sustainability}%`, boxShadow: '0 0 4px rgba(0, 245, 212, 0.4)' }} />
                </div>
              </div>
            </div>
            {/* Technology Score */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-[#7A8694] uppercase tracking-wider font-mono">Technology Score</span>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-white font-mono">{stats.smartCityIndex}%</span>
                <div className="flex-1 h-[3px] bg-white/5 rounded-full overflow-hidden hidden sm:block">
                  <div className="h-full bg-[#00F5D4]" style={{ width: `${stats.smartCityIndex}%`, boxShadow: '0 0 4px rgba(0, 245, 212, 0.4)' }} />
                </div>
              </div>
            </div>
            {/* Strategic Importance */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-[#7A8694] uppercase tracking-wider font-mono">Strategic Importance</span>
              <span className="text-base font-semibold text-[#00F5D4] font-mono">{getStrategicImportance()}</span>
            </div>
          </div>

          {/* Predictions Section */}
          <div className="border-t border-[#00f5d4]/10 pt-4 flex flex-col gap-3">
            <span className="text-[10px] text-[#00F5D4] font-mono tracking-[0.2em] uppercase font-semibold">
              Predictions ({getPredictions().length})
            </span>
            <ul className="m-0 p-0 flex flex-col gap-2 list-none">
              {getPredictions().map((pred, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] md:text-xs text-[#7A8694] font-light leading-relaxed">
                  <span className="text-[#00F5D4] font-mono mt-0.5">•</span>
                  <span>{pred}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer Action Bar */}
          <div className="border-t border-[#00f5d4]/10 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-[10px] text-[#7A8694] font-mono">
              {isAutoNavigating ? (
                <>
                  Opening briefing in <span className="font-semibold text-[#00F5D4] font-mono glow-primary animate-pulse">{countdown}s...</span>
                </>
              ) : (
                <span className="text-[#7A8694]/50">Auto-navigation paused</span>
              )}
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto shrink-0">
              <button 
                onClick={() => setIsAutoNavigating(false)}
                disabled={!isAutoNavigating}
                className={`px-4 py-2 border rounded-lg text-xs font-mono transition-all duration-300 cursor-pointer ${
                  isAutoNavigating
                    ? 'border-white/10 hover:border-white/20 hover:bg-white/5 text-[#7A8694] hover:text-white bg-transparent'
                    : 'border-transparent bg-white/5 text-[#7A8694]/20 cursor-default'
                }`}
              >
                Hold
              </button>
              
              <button 
                onClick={handleOpenNow}
                className="px-6 py-2 bg-[#00F5D4] hover:bg-[#00E7C2] text-[#02060A] rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer tracking-wider uppercase font-mono shadow-[0_0_10px_rgba(0, 245, 212,0.15)] hover:shadow-[0_0_15px_rgba(0, 245, 212,0.3)]"
              >
                Open Briefing →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
