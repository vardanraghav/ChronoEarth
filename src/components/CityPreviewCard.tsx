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

const C = {
  primary: '#00F5B0',
};

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
      return '#00F5B0';
    }
    if (val > 75) return '#00F5B0';
    if (val > 50) return '#00D98F';
    return '#FF9900';
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm pointer-events-auto"
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="premium-glass w-full max-w-[380px] p-8 flex flex-col gap-6 relative rounded-xl animate-fade-up"
        style={{
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(0, 245, 176, 0.2), inset 0 0 20px rgba(0, 245, 176, 0.02)'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          aria-label="Close city preview"
          className="absolute top-5 right-5 bg-transparent border-none text-[#7A8694] hover:text-white cursor-pointer text-[10px] font-mono uppercase tracking-wider transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#00F5B0]"
        >
          [✕]
        </button>

        {/* Circular portrait image */}
        <div className="flex justify-center mt-2">
          {imageError ? (
            <div className="w-24 h-24 rounded-full border border-[#00F5B0]/30 flex flex-col items-center justify-center bg-[#040B12] text-[9px] font-mono text-[#00F5B0]/50 tracking-wider shadow-[0_0_20px_rgba(0,245,176,0.1)]">
              OFFLINE
            </div>
          ) : (
            <img 
              src={cityExtended.image} 
              alt={city.name} 
              loading="lazy"
              width={96}
              height={96}
              onError={() => setImageError(true)}
              className="w-24 h-24 rounded-full object-cover border border-[#00F5B0]/30 shadow-[0_0_20px_rgba(0,245,176,0.2)] shrink-0" 
            />
          )}
        </div>

        {/* City and Country header */}
        <div className="text-center flex flex-col gap-1">
          <h2 className="text-xl font-light text-white m-0 tracking-wide">
            {city.name}
          </h2>
          <div className="text-[10px] text-[#00F5B0] font-mono tracking-[0.2em] uppercase font-semibold">
            {city.country}
          </div>
        </div>

        {/* Dashboard Grid Container */}
        <div className="bg-black/20 border border-white/5 rounded-lg p-4 flex flex-col gap-4">
          {/* Metric Dashboard */}
          <div className="grid grid-cols-2 gap-4">
            {/* Pop */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] text-[#7A8694] uppercase tracking-wider font-mono">Population</span>
              <span className="text-xs font-semibold text-white">{stats.population.toFixed(1)}M</span>
            </div>
            {/* Smart Index */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-[#7A8694] uppercase tracking-wider font-mono">Smart Index</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white font-mono">{stats.smartCityIndex}%</span>
                <div className="flex-1 h-[2px] bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00F5B0]" style={{ width: `${stats.smartCityIndex}%`, boxShadow: '0 0 4px #00F5B0' }} />
                </div>
              </div>
            </div>
            {/* AI Adoption */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-[#7A8694] uppercase tracking-wider font-mono">AI Adoption</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white font-mono">{stats.aiAdoption}%</span>
                <div className="flex-1 h-[2px] bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00F5B0]" style={{ width: `${stats.aiAdoption}%`, boxShadow: '0 0 4px #00F5B0' }} />
                </div>
              </div>
            </div>
            {/* Sustainability */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-[#7A8694] uppercase tracking-wider font-mono">Sustainability</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white font-mono">{stats.sustainability}%</span>
                <div className="flex-1 h-[2px] bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00F5B0]" style={{ width: `${stats.sustainability}%`, boxShadow: '0 0 4px #00F5B0' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Climate Risk Row (full width) */}
          <div className="border-t border-white/5 pt-3 flex justify-between items-center">
            <span className="text-[9px] text-[#7A8694] uppercase tracking-wider font-mono">Climate Risk</span>
            <div className="flex items-center gap-2 w-2/3">
              <span className="text-xs font-semibold font-mono" style={{ color: getMetricColor(stats.climateRisk, true) }}>{stats.climateRisk}%</span>
              <div className="flex-1 h-[2px] bg-white/5 rounded-full overflow-hidden">
                <div className="h-full" style={{ width: `${stats.climateRisk}%`, backgroundColor: getMetricColor(stats.climateRisk, true) }} />
              </div>
            </div>
          </div>
        </div>

        {/* Growth Forecast sentence */}
        <p className="text-[11px] text-[#7A8694] font-light leading-relaxed m-0 text-center px-1">
          {stats.growthForecast}
        </p>

        {/* Countdown display */}
        <div className="text-[10px] text-[#7A8694] text-center font-mono py-0.5">
          {isAutoNavigating ? (
            <>
              Opening full briefing in <span className="font-semibold text-[#00F5B0] font-mono glow-primary animate-breathe">{countdown}s...</span>
            </>
          ) : (
            <span className="text-[#7A8694]/50">Auto-navigation paused</span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-1">
          <button 
            onClick={() => setIsAutoNavigating(false)}
            disabled={!isAutoNavigating}
            className={`flex-1 py-2.5 border rounded-lg text-xs font-mono transition-all duration-300 cursor-pointer ${
              isAutoNavigating
                ? 'border-white/10 hover:border-white/20 hover:bg-white/5 text-[#7A8694] hover:text-white bg-transparent'
                : 'border-transparent bg-white/5 text-[#7A8694]/20 cursor-default'
            }`}
          >
            Cancel
          </button>
          
          <button 
            onClick={handleOpenNow}
            className="flex-[1.4] py-2.5 bg-[#00F5B0] hover:bg-[#00D98F] text-[#02060A] rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer tracking-wider uppercase font-mono shadow-[0_0_15px_rgba(0,245,176,0.2)] hover:shadow-[0_0_20px_rgba(0,245,176,0.4)]"
          >
            Open now →
          </button>
        </div>
      </div>
    </div>
  );
}
