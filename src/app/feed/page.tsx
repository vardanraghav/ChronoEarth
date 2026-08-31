'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BackgroundEffects from '@/components/BackgroundEffects';
import Footer from '@/components/Footer';
import SafeImage from '@/components/SafeImage';
import { useCities } from '@/hooks/useCities';
import { usePredictions } from '@/hooks/usePredictions';
import { useSpaceEvents } from '@/hooks/useSpaceEvents';
import { useEarthquakes } from '@/hooks/useEarthquakes';
import { useMarketOverview } from '@/hooks/useMarketOverview';
import { useNews } from '@/hooks/useNews';
import { getIntelFeedImage, getPredictionImage, getSensorImage, getMarketLogo } from '@/lib/imageUtils';
import { CityData, generateCityIntelligence } from '@/data/citiesData';
import { Prediction } from '@/data/predictionsData';

const getCategoryStyle = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('ai') || cat.includes('tech')) return { color: '#00F5D4', shadow: 'rgba(0, 245, 212, 0.18)', bg: 'rgba(0, 245, 212, 0.04)', border: 'rgba(0, 245, 212, 0.25)' };
  if (cat.includes('climate') || cat.includes('eco')) return { color: '#FF0055', shadow: 'rgba(255, 0, 85, 0.18)', bg: 'rgba(255, 0, 85, 0.04)', border: 'rgba(255, 0, 85, 0.25)' };
  if (cat.includes('energy')) return { color: '#00F5B0', shadow: 'rgba(0, 245, 176, 0.18)', bg: 'rgba(0, 245, 176, 0.04)', border: 'rgba(0, 245, 176, 0.25)' };
  if (cat.includes('space')) return { color: '#BF5AF2', shadow: 'rgba(191, 90, 242, 0.18)', bg: 'rgba(191, 90, 242, 0.04)', border: 'rgba(191, 90, 242, 0.25)' };
  if (cat.includes('cities')) return { color: '#0A84FF', shadow: 'rgba(10, 132, 255, 0.18)', bg: 'rgba(10, 132, 255, 0.04)', border: 'rgba(10, 132, 255, 0.25)' };
  if (cat.includes('seismic')) return { color: '#EF4444', shadow: 'rgba(239, 68, 68, 0.18)', bg: 'rgba(239, 68, 68, 0.04)', border: 'rgba(239, 68, 68, 0.25)' };
  if (cat.includes('semiconductor')) return { color: '#D4AF37', shadow: 'rgba(212, 175, 55, 0.18)', bg: 'rgba(212, 175, 55, 0.04)', border: 'rgba(212, 175, 55, 0.25)' };
  return { color: '#00F5B0', shadow: 'rgba(0, 245, 176, 0.18)', bg: 'rgba(0, 245, 176, 0.04)', border: 'rgba(0, 245, 176, 0.25)' };
};

function FeedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Load core shared datasets
  const { cities } = useCities();
  const { predictions } = usePredictions();
  const { spaceEvents } = useSpaceEvents();
  const { earthquakes } = useEarthquakes(4.0);
  const { snapshots } = useMarketOverview();
  const { news } = useNews();

  // Local semiconductor telemetry
  const [semiData, setSemiData] = useState<any>(null);
  useEffect(() => {
    fetch('/api/semiconductor')
      .then(res => res.json())
      .then(payload => {
        if (payload.success && payload.data) {
          setSemiData(payload.data);
        }
      })
      .catch(err => console.error(err));
  }, []);

  // Shared active parameters
  const [activeYear, setActiveYear] = useState(2050);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    cities: true,
    climate: true,
    tech: true,
    semiconductor: true,
    energy: true,
    space: true,
    geopolitical: true,
    seismic: true,
    markets: true,
  });

  const [visibleCount, setVisibleCount] = useState(9);
  const [loadingMore, setLoadingMore] = useState(false);

  // Re-sync parameter changes from url
  const yearParam = searchParams.get('year');
  useEffect(() => {
    if (yearParam) {
      const yr = Number(yearParam);
      if (yr === 2030 || yr === 2040 || yr === 2050) {
        setActiveYear(yr);
      }
    }
  }, [yearParam]);

  const activeSimulations = {
    seaLevelRise: 0,
    fusionBreakthrough: false,
    agiEmergence: false,
    popDecline: false,
    renewableTransition: false,
    arcticDominance: false,
    semiDisruptions: false,
  };

  // Generate the shared intelligence feed exactly like Dashboard
  const unifiedFeed: any[] = [];

  // 1. Semiconductor Market Pulse
  if (activeLayers.semiconductor && semiData?.marketPulse) {
    semiData.marketPulse.forEach((signal: any, idx: number) => {
      let strategicImpact = 'Neutral supply stability.';
      if (signal.severity === 'critical' || signal.severity === 'high') {
        strategicImpact = 'High strategic threat to operations.';
      } else if (signal.trend === 'up') {
        strategicImpact = 'Positive expansion & development yield.';
      }
      const importanceScore = signal.severity === 'critical' ? 95 : (signal.severity === 'high' ? 82 : 35);
      
      unifiedFeed.push({
        id: `semi-${idx}`,
        category: 'SEMICONDUCTOR',
        source: 'Silicon Analysts API',
        title: signal.headline,
        description: `Importance Score: ${importanceScore}% | Impact: ${strategicImpact} | Category: ${signal.category}`,
        timestamp: signal.date || 'Live update',
        timeSort: signal.date ? new Date(signal.date).getTime() : Date.now() - idx * 60000,
        severity: signal.severity === 'critical' ? 'Critical' : (signal.severity === 'high' ? 'High' : 'Low'),
        image: getIntelFeedImage({ id: `semi-${idx}`, title: signal.headline, category: 'SEMICONDUCTOR', source: 'Silicon Analysts API' }),
        lat: 24.78,
        lon: 120.97,
        height: 1800000,
        layer: 'semiconductor'
      });
    });
  }

  // 2. Space observations
  if (activeLayers.space && spaceEvents) {
    spaceEvents.forEach((se: any, idx: number) => {
      unifiedFeed.push({
        id: `space-${idx}`,
        category: 'SPACE',
        source: se.event_type === 'APOD' ? 'NASA APOD' : se.event_type || 'NASA',
        title: se.title,
        description: se.description || 'Orbital satellite observation data registered.',
        timestamp: se.event_date ? new Date(se.event_date).toLocaleDateString() : 'Live feed',
        timeSort: se.event_date ? new Date(se.event_date).getTime() : Date.now() - idx * 60000,
        severity: se.event_type === 'NEO' ? 'Medium' : 'Low',
        image: se.image_url || getIntelFeedImage({ id: `space-${idx}`, title: se.title, category: 'SPACE', source: se.event_type || 'NASA' }),
        lat: 25.0,
        lon: -45.0,
        height: 16000000,
        layer: 'space'
      });
    });
  }

  // 3. Seismic Events
  if (activeLayers.seismic && earthquakes) {
    earthquakes.forEach((eq: any, idx: number) => {
      unifiedFeed.push({
        id: `seismic-${idx}`,
        category: 'SEISMIC',
        source: 'USGS API',
        title: `M ${eq.magnitude.toFixed(1)} - ${eq.place}`,
        description: `Depth: ${eq.depth?.toFixed(1) || '0.0'} km. Seismic alert registered near fault line zone.`,
        timestamp: eq.time ? new Date(eq.time).toLocaleTimeString() : 'Live alert',
        timeSort: eq.time ? new Date(eq.time).getTime() : Date.now() - idx * 60000,
        severity: eq.magnitude >= 6.0 ? 'Critical' : (eq.magnitude >= 5.0 ? 'High' : 'Medium'),
        image: getIntelFeedImage({ id: `seismic-${idx}`, title: eq.place, category: 'SEISMIC', source: 'USGS API' }),
        lat: eq.lat,
        lon: eq.lon,
        height: 1500000,
        layer: 'seismic',
        eq: eq.id || eq.place
      });
    });
  }

  // 4. Financial Markets
  if (activeLayers.markets && snapshots) {
    snapshots.forEach((s: any, idx: number) => {
      unifiedFeed.push({
        id: `market-${idx}`,
        category: 'MARKETS',
        source: 'Alpha Vantage',
        title: `${s.ticker} ${s.change < 0 ? '▼' : '▲'} ${s.change_percent}`,
        description: `Silicon stock yield active. Trading at $${s.price.toFixed(2)} USD.`,
        timestamp: s.timestamp ? new Date(s.timestamp).toLocaleTimeString() : 'Live feed',
        timeSort: s.timestamp ? new Date(s.timestamp).getTime() : Date.now() - idx * 60000,
        severity: Math.abs(parseFloat(s.change_percent)) > 2.0 ? 'High' : 'Low',
        image: getIntelFeedImage({ id: `market-${idx}`, title: s.ticker, category: 'MARKETS', source: 'Alpha Vantage' }),
        lat: 22.3,
        lon: 114.1,
        height: 1200000,
        layer: 'markets'
      });
    });
  }

  // 5. Future Cities (Climate)
  if (activeLayers.cities && cities) {
    cities.forEach((c: any, idx: number) => {
      const cityStats = generateCityIntelligence(c, activeYear, activeSimulations);
      unifiedFeed.push({
        id: `city-${idx}`,
        category: 'CLIMATE',
        source: 'Open-Meteo',
        title: `Climate profile: ${c.name} risk index at ${cityStats.climateRisk}%`,
        description: `Projected temp delta +${c.offsets.tempRise.toFixed(1)}°C, sea level rise +${(c.offsets.seaLevel || 0.1).toFixed(2)}m.`,
        timestamp: `${activeYear} Horizon`,
        timeSort: Date.now() - 3600000 - idx * 60000,
        severity: cityStats.climateRisk >= 75 ? 'Critical' : (cityStats.climateRisk >= 50 ? 'High' : 'Medium'),
        image: getIntelFeedImage({ id: `city-${idx}`, title: c.name, category: 'CLIMATE', source: 'Open-Meteo' }),
        lat: c.lat,
        lon: c.lon,
        height: 1200000,
        layer: 'cities',
        city: c.name
      });
    });
  }

  // 6. Futurologist Predictions
  if (activeLayers.tech && predictions) {
    predictions.filter(p => p.year <= activeYear).forEach((p: any, idx: number) => {
      const cityObj = cities?.find(c => c.name.toLowerCase() === p.city.toLowerCase());
      unifiedFeed.push({
        id: `prediction-${p.id}`,
        category: 'PREDICTIONS',
        source: p.author,
        title: `Forecast: ${p.title}`,
        description: p.description,
        timestamp: `${p.year} Projections`,
        timeSort: Date.now() - 7200000 - idx * 60000,
        severity: p.confidenceScore >= 80 ? 'High' : 'Medium',
        image: getIntelFeedImage({ id: `prediction-${p.id}`, title: p.title, category: 'PREDICTIONS', source: p.author }),
        lat: cityObj?.lat ?? 20.0,
        lon: cityObj?.lon ?? 0.0,
        height: 1200000,
        layer: 'tech',
        prediction: p.slug
      });
    });
  }

  // Sort feed items chronologically
  const sortedFeed = unifiedFeed.sort((a, b) => b.timeSort - a.timeSort);

  const handleFeedClick = (item: any) => {
    const url = new URL('/dashboard', window.location.origin);
    url.searchParams.set('year', activeYear.toString());
    
    if (item.lat !== undefined && item.lon !== undefined) {
      url.searchParams.set('lat', item.lat.toString());
      url.searchParams.set('lon', item.lon.toString());
      if (item.height) {
        url.searchParams.set('height', item.height.toString());
      }
    }
    if (item.layer) {
      url.searchParams.set('layer', item.layer);
    }
    if (item.city) {
      url.searchParams.set('city', item.city);
    } else if (item.prediction) {
      url.searchParams.set('prediction', item.prediction);
    } else if (item.eq) {
      url.searchParams.set('eq', item.eq);
    }

    router.push(url.pathname + url.search);
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + 6, sortedFeed.length));
      setLoadingMore(false);
    }, 600);
  };

  return (
    <main className="min-h-screen w-full bg-[#02060A] text-[#e2e8f0] relative">
      <BackgroundEffects earthMode="cyber" />
      <Navbar />

      <div className="content-container pt-32 pb-24 relative z-20 flex flex-col lg:flex-row gap-8 animate-fade-up">
        
        {/* Left Control Sidebar */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col gap-6">
          
          {/* Header Info */}
          <div className="flex flex-col gap-3 border-b border-white/5 pb-6">
            <span className="text-[10px] font-mono text-[#00F5B0] uppercase tracking-[0.25em] font-semibold">
              Telemetry Stream
            </span>
            <h1 className="editorial-title text-white tracking-tight m-0 text-3xl font-light">
              System <span style={{ color: '#00F5B0' }} className="font-normal">Feed</span>
            </h1>
            <p className="text-[#7A8694] font-light text-xs leading-relaxed m-0">
              Direct telemetry mapping ChronoEarth’s active system events and future predictions.
            </p>
          </div>

          {/* Timeline Selector */}
          <div className="premium-glass p-5 rounded-lg flex flex-col gap-3">
            <span className="text-[10px] font-mono text-[#7A8694] uppercase tracking-wider font-semibold">Timeline</span>
            <div className="flex items-center justify-between border-t border-white/5 pt-2">
              {([2030, 2040, 2050] as const).map((year) => {
                const isActive = activeYear === year;
                return (
                  <button
                    key={year}
                    onClick={() => setActiveYear(year)}
                    className={`font-mono text-xs cursor-pointer transition-all duration-300 ${
                      isActive ? 'text-[#00F5B0] font-semibold' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Planetary Layers Filter */}
          <div className="premium-glass p-5 rounded-lg flex flex-col gap-4">
            <div className="flex flex-col gap-1 border-b border-white/5 pb-2">
              <span className="text-[10px] font-mono text-[#00F5B0] uppercase tracking-wider font-semibold">Intelligence</span>
              <span className="text-xs font-light text-white tracking-wide uppercase font-mono">Planetary Layers</span>
            </div>

            <div className="flex flex-col gap-3.5">
              {([
                { key: 'cities', label: 'Future Cities', icon: '🏙️' },
                { key: 'climate', label: 'Climate Intel', icon: '🌍' },
                { key: 'tech', label: 'AI & Predictions', icon: '💻' },
                { key: 'semiconductor', label: 'Semiconductor Intel', icon: '💾' },
                { key: 'space', label: 'Space Infrastructure', icon: '🚀' },
                { key: 'seismic', label: 'Seismic Activity', icon: '🌋' },
                { key: 'markets', label: 'Future Markets', icon: '📈' }
              ] as const).map(({ key, label, icon }) => (
                <div key={key} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs">{icon}</span>
                    <span className="text-[11px] text-white/70 tracking-wide font-sans">{label}</span>
                  </div>
                  <button
                    onClick={() => setActiveLayers(prev => ({ ...prev, [key]: !prev[key] }))}
                    role="switch"
                    aria-checked={activeLayers[key]}
                    aria-label={`Toggle ${label} layer`}
                    className="relative w-8 h-4.5 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00F5B0] focus-visible:ring-offset-1 cursor-pointer"
                    style={{
                      background: activeLayers[key] ? '#00F5B0' : 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <span
                      className="absolute top-[1.5px] left-[2px] w-[12px] h-[12px] rounded-full bg-white transition-transform duration-300"
                      style={{
                        transform: activeLayers[key] ? 'translateX(14px)' : 'translateX(0)',
                      }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Feed Column */}
        <div className="flex-1 flex flex-col gap-6">
          {sortedFeed.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center font-mono text-[#7A8694] border border-white/5 bg-black/20 rounded-lg">
              <span>NO ACTIVE TELEMETRY STREAMS MATCHING CURRENT LAYERS</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedFeed.slice(0, visibleCount).map((item) => {
                const style = getCategoryStyle(item.category);
                
                return (
                  <div
                    key={item.id}
                    onClick={() => handleFeedClick(item)}
                    className="group premium-glass p-5 rounded-lg flex flex-col justify-between min-h-[290px] border border-white/5 hover:translate-y-[-4px] hover:border-[#00F5B0]/30 transition-all duration-300 cursor-pointer animate-fade-in relative overflow-hidden"
                    style={{
                      backgroundColor: 'rgba(4, 11, 18, 0.75)',
                    }}
                  >
                    <div className="flex flex-col gap-4">
                      {/* Thumbnail Image */}
                      {item.image ? (
                        <div className="w-full h-28 rounded overflow-hidden relative border border-white/5 shrink-0">
                          <SafeImage
                            src={item.image}
                            fallbackSrc="/images/semi-fab-stock.jpg"
                            alt={item.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 300px"
                            loading="lazy"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>
                      ) : null}

                      {/* Header info metadata */}
                      <div className="flex justify-between items-center text-[9px] font-mono tracking-wider">
                        <span style={{ color: style.color }} className="font-semibold uppercase">
                          {item.category}
                        </span>
                        <span className="text-white/30 truncate max-w-[125px]">{item.source}</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xs font-semibold text-white/95 leading-snug m-0 tracking-wide transition-colors">
                        {item.title}
                      </h3>

                      {/* Description / Summary */}
                      <p className="text-[10px] text-[#A8B3BC] font-sans font-light leading-relaxed m-0 line-clamp-3">
                        {item.description}
                      </p>
                    </div>

                    {/* Bottom Metadata & Click connection */}
                    <div className="flex justify-between items-center text-[9px] font-mono border-t border-white/5 pt-3 mt-4">
                      <span className="text-white/30">{item.timestamp}</span>
                      <span style={{ color: style.color }} className="font-semibold group-hover:underline uppercase flex items-center gap-1">
                        Fly to Orbit 🌍
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More Button */}
          {visibleCount < sortedFeed.length && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-5 py-2 border border-[#00F5B0]/30 hover:border-[#00F5B0] text-[#00F5B0] font-mono text-xs rounded transition-all duration-300 bg-transparent cursor-pointer tracking-wider uppercase font-semibold disabled:opacity-50"
              >
                {loadingMore ? 'Decrypting telemetry...' : 'Load More Telemetry ↓'}
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default function FeedPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen bg-[#02060A] flex flex-col items-center justify-center font-mono text-[11px] text-white/50 tracking-[0.35em] uppercase">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
          <span>SYNCHRONIZING TELEMETRY STREAM...</span>
        </div>
      </div>
    }>
      <FeedContent />
    </Suspense>
  );
}
