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
  bg: 'rgba(5, 21, 34, 0.85)',
  primary: '#00f5d4',
  secondary: '#00d9ff',
  accent: '#8a7dff',
  white: '#ffffff',
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
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(2, 6, 17, 0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
      }}
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          width: '400px',
          background: 'rgba(5, 21, 34, 0.85)',
          backdropFilter: 'blur(32px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
          padding: '24px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          animation: 'fade-up 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Hero image header */}
        <div style={{ position: 'relative', width: '100%', height: '160px', overflow: 'hidden', borderRadius: '2px' }}>
          <img 
            src={cityExtended.image} 
            alt={city.name} 
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.8)' }} 
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(5,21,34,0.95) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
            <h2 className="font-display" style={{ fontSize: '20px', fontWeight: 450, color: C.white, letterSpacing: '0.02em', textTransform: 'uppercase', margin: 0 }}>
              {city.name}
            </h2>
            <div className="font-display" style={{ fontSize: '8px', color: C.secondary, letterSpacing: '0.08em', marginTop: 2, textTransform: 'uppercase' }}>
              {city.country} · {city.lat.toFixed(4)}° N, {city.lon.toFixed(4)}° E
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: '10px', fontFamily: 'monospace' }}
          >
            [✕]
          </button>
        </div>

        {/* Narrative Outlook Briefing */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: 14 }}>
          <div className="font-display" style={{ fontSize: '8.5px', color: C.primary, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500 }}>
            Planetary Outlook Briefing
          </div>
          <p className="font-serif" style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5em', margin: 0 }}>
            {city.name} is projected to stabilize its carrying capacity at {(city.offsets.population * 1000).toFixed(0)} million residents by 2050. 
            The biophilic grid is tracking towards {75 + (city.offsets.popGrowth > 1.08 ? 19 : 8)}% AI coordination and remains highly climate-resilient, maintaining a {68 + (city.offsets.tempRise > 1.0 ? 8 : 22)}% environmental stability rating.
          </p>
        </div>

        {/* Predictions list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="font-display" style={{ fontSize: '8.5px', color: C.accent, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500 }}>
            Forecast Matrix Shards
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {finalPredictions.slice(0, 2).map(p => (
              <div 
                key={p.id} 
                className="font-serif" 
                style={{ fontSize: '11.5px', lineHeight: '1.5em', color: 'rgba(255,255,255,0.65)' }}
              >
                <strong className="font-display" style={{ color: C.white, fontWeight: 500, letterSpacing: '0.02em' }}>{p.year} / {p.title}:</strong> {p.description.slice(0, 100)}...
              </div>
            ))}
          </div>
        </div>

        {/* Countdown timer */}
        <div className="font-display" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 4, letterSpacing: '0.05em' }}>
          Opening Intelligence Page in <span style={{ fontWeight: 500, color: C.primary, fontSize: '11px' }}>{countdown}</span>s
        </div>

        {/* Action button bar */}
        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
          <button 
            onClick={onClose}
            style={{
              flex: 1, padding: '8px 0', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
              color: 'rgba(255,255,255,0.6)', fontSize: '8.5px', letterSpacing: '0.12em', fontWeight: 500,
              cursor: 'pointer', fontFamily: 'Space Grotesk', transition: 'all 0.3s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          >
            CANCEL
          </button>
          
          <button 
            onClick={handleOpenNow}
            style={{
              flex: 1.4, padding: '8px 0', border: '1px solid #00f5d4',
              background: '#00f5d4',
              color: '#020611', fontSize: '8.5px', letterSpacing: '0.12em', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Space Grotesk', transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            OPEN NOW →
          </button>
        </div>
      </div>
    </div>
  );
}
