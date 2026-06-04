'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CityData } from '@/data/citiesData';
import { getExtendedCityData, getCitySlug } from '@/data/citiesExtendedData';
import { PREDICTIONS } from '@/data/predictionsData';

interface CityPreviewCardProps {
  city: CityData;
  onClose: () => void;
}

const C = {
  bg: 'rgba(2, 8, 15, 0.75)',
  primary: '#00F5B0',
  secondary: '#00D98F',
  accent: '#FFFFFF',
  white: '#F5F7FA',
};

export default function CityPreviewCard({ city, onClose }: CityPreviewCardProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const cityExtended = getExtendedCityData(city.name);
  const slug = getCitySlug(city.name);

  // Filter 3 predictions for this city
  const cityPredictions = PREDICTIONS.filter(
    p => p.city.toLowerCase() === city.name.toLowerCase()
  ).slice(0, 3);
  
  // Fallback if less than 3
  const finalPredictions = [...cityPredictions];
  if (finalPredictions.length < 3) {
    PREDICTIONS.forEach(p => {
      if (finalPredictions.length < 3 && !finalPredictions.some(fp => fp.id === p.id)) {
        finalPredictions.push(p);
      }
    });
  }

  // Timer loop for redirecting after 5s
  useEffect(() => {
    if (countdown <= 0) {
      window.location.href = `/city/${slug}`;
      return;
    }
    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, slug]);

  const handleOpenNow = () => {
    window.location.href = `/city/${slug}`;
  };

  const cornerAccent = (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 8, height: 8, borderTop: `1px solid ${C.primary}`, borderLeft: `1px solid ${C.primary}` }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderTop: `1px solid ${C.primary}`, borderRight: `1px solid ${C.primary}` }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: 8, height: 8, borderBottom: `1px solid ${C.primary}`, borderLeft: `1px solid ${C.primary}` }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderBottom: `1px solid ${C.primary}`, borderRight: `1px solid ${C.primary}` }} />
    </>
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto"
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="card-tier-1 w-full max-w-[420px] flex flex-col gap-4 relative animate-fade-up"
      >
        {/* Hero image header */}
        <div className="relative w-full h-[160px] overflow-hidden rounded">
          <img 
            src={cityExtended.image} 
            alt={city.name} 
            loading="lazy"
            className="w-full h-full object-cover filter brightness-[0.7]" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#040B12] via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4">
            <h2 className="text-xl font-light text-white uppercase m-0 leading-none">
              {city.name}
            </h2>
            <div className="text-[9px] font-mono text-[#00F5B0] uppercase mt-1">
              {city.country} · {city.lat.toFixed(4)}° N, {city.lon.toFixed(4)}° E
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 bg-transparent border-none text-rose-455 cursor-pointer text-xs font-mono"
          >
            [✕]
          </button>
        </div>

        {/* Narrative Outlook Briefing */}
        <div className="flex flex-col gap-1.5 border-b border-[#00F5B0]/15 pb-4">
          <div className="text-[10px] font-mono text-[#00F5B0] uppercase tracking-widest font-semibold">
            Planetary Outlook Briefing
          </div>
          <p className="font-serif text-xs text-[#7A8694] leading-relaxed">
            {city.name} is projected to stabilize its carrying capacity at {(city.offsets.population * 1000).toFixed(0)} million residents by 2050. 
            The biophilic grid is tracking towards {75 + (city.offsets.popGrowth > 1.08 ? 19 : 8)}% AI coordination and remains highly climate-resilient, maintaining a {68 + (city.offsets.tempRise > 1.0 ? 8 : 22)}% environmental stability rating.
          </p>
        </div>

        {/* Predictions list */}
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-mono text-white uppercase tracking-widest font-semibold">
            Forecast Matrix Shards
          </div>
          <div className="flex flex-col gap-2">
            {finalPredictions.slice(0, 2).map(p => (
              <div 
                key={p.id} 
                className="font-serif text-xs text-[#7A8694] leading-relaxed" 
              >
                <strong className="font-mono text-white font-medium tracking-wide uppercase">{p.year} / {p.title}:</strong> {p.description.slice(0, 100)}...
              </div>
            ))}
          </div>
        </div>

        {/* Countdown timer */}
        <div className="font-mono text-[9px] text-[#7A8694] text-center mt-1">
          Opening Intelligence Page in <span className="font-bold text-[#00F5B0] text-xs">{countdown}</span>s
        </div>

        {/* Action button bar */}
        <div className="flex gap-4 mt-2">
          <button 
            onClick={onClose}
            className="flex-1 py-2 border border-[#00F5B0]/15 hover:border-transparent hover:bg-white/5 hover:text-white rounded text-[9px] font-mono text-[#7A8694] bg-transparent transition-colors uppercase tracking-widest"
          >
            CANCEL
          </button>
          
          <button 
            onClick={handleOpenNow}
            className="flex-[1.4] py-2 border border-[#00F5B0] bg-[#00F5B0] hover:bg-[#00D98F] text-[#02060A] rounded text-[9px] font-mono text-[#02060A] font-bold transition-all uppercase tracking-widest"
          >
            OPEN NOW →
          </button>
        </div>
      </div>
    </div>
  );
}
