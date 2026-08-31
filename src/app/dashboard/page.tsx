'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar            from '@/components/Navbar';
import dynamic           from 'next/dynamic';
import LightweightGlobe  from '@/components/LightweightGlobe';

const CesiumGlobe = dynamic(() => import('@/components/CesiumGlobe'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#02060A]/95 z-50 gap-4 font-mono text-xs uppercase tracking-[0.25em]">
      <div className="w-10 h-10 border border-[#00F5B0]/20 border-t-[#00F5B0] rounded-full animate-spin" />
      <span>BOOTING PLANETARY INFRASTRUCTURE GRID…</span>
    </div>
  ),
});

import BackgroundEffects from '@/components/BackgroundEffects';
import CityPreviewCard   from '@/components/CityPreviewCard';
import CommandDesk       from '@/components/CommandDesk';
import { getCitySlug } from '@/data/citiesExtendedData';
import { CityData, citiesRawData, generateCityIntelligence } from '@/data/citiesData';
import { generateCountryProjections } from '@/data/countryData';
import { getKnowledgeCard } from '@/data/knowledgeCards';
import { PREDICTIONS, Prediction } from '@/data/predictionsData';
import { useCities } from '@/hooks/useCities';
import { usePredictions } from '@/hooks/usePredictions';
import { useSpaceEvents } from '@/hooks/useSpaceEvents';
import { useEarthquakes } from '@/hooks/useEarthquakes';
import { useMarketOverview } from '@/hooks/useMarketOverview';
import { useNews } from '@/hooks/useNews';
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase';
import Image from 'next/image';
import { getIntelFeedImage, getPredictionImage, getSensorImage, getMarketLogo } from '@/lib/imageUtils';
import { SiliconAnalystsPayload } from '@/services/siliconAnalysts';

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
  
  const width = 120;
  const height = 30;
  const padding = 2;
  
  const coords = points.map((val, idx) => {
    const x = padding + (idx * (width - padding * 2)) / 4;
    const y = (height - padding) - ((val - min) / range) * (height - padding * 2);
    return { x, y, val };
  });
  
  const svgPoints = coords.map(c => `${c.x},${c.y}`).join(' ');
  const areaPoints = `${coords[0].x},${height} ${svgPoints} ${coords[coords.length-1].x},${height}`;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <svg className="w-full h-8" viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="sparklineGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Background reference grid lines */}
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="2,2" strokeWidth="0.8" />
        <line x1="0" y1={height - 2} x2={width} y2={height - 2} stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
        
        {/* Glow Area */}
        <polygon points={areaPoints} fill="url(#sparklineGlow)" />
        
        {/* Line */}
        <polyline points={svgPoints} fill="none" stroke="#00E5FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Data points dots */}
        {coords.map((c, idx) => (
          <circle 
            key={idx} 
            cx={c.x} 
            cy={c.y} 
            r={idx === coords.length - 1 ? 2.5 : 1.5} 
            fill={idx === coords.length - 1 ? '#FFFFFF' : '#00E5FF'} 
            stroke="#02060A" 
            strokeWidth="0.5" 
          />
        ))}
      </svg>
    </div>
  );
};

const ProgressBar = ({ value, label, isRisk = false }: { value: number; label: string; isRisk?: boolean }) => {
  const color = isRisk ? (value > 70 ? '#FF3B30' : (value > 45 ? '#FF9500' : '#00E5FF')) : '#00F5B0';
  const shadowColor = isRisk ? (value > 70 ? 'rgba(255, 59, 48, 0.4)' : (value > 45 ? 'rgba(255, 149, 0, 0.4)' : 'rgba(0, 229, 255, 0.4)')) : 'rgba(0, 245, 176, 0.4)';
  return (
    <div className="flex flex-col gap-1.5 font-mono">
      <div className="flex justify-between items-center text-[10px] tracking-wider text-[#94a3b8]">
        <span className="font-light uppercase">{label}</span>
        <span style={{ color, fontWeight: 600 }}>{value}%</span>
      </div>
      <div className="w-full h-[5px] bg-black/50 border border-white/5 rounded-full overflow-hidden relative">
        <div 
          className="h-full rounded-full transition-all duration-500" 
          style={{ 
            width: `${value}%`, 
            backgroundColor: color, 
            boxShadow: `0 0 8px ${shadowColor}` 
          }} 
        />
      </div>
    </div>
  );
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { cities } = useCities();
  const { predictions } = usePredictions();
  const { spaceEvents } = useSpaceEvents();
  const { earthquakes } = useEarthquakes(4.0);
  const { snapshots } = useMarketOverview();
  const { news } = useNews();
  const { kbArticles } = useKnowledgeBase();

  const [focusCoords, setFocusCoords] = useState<{ lat: number; lon: number; height?: number } | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('AI');
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  const cityParam = searchParams.get('city');
  const countryParam = searchParams.get('country');
  const predictionParam = searchParams.get('prediction');
  const latParam = searchParams.get('lat');
  const lonParam = searchParams.get('lon');
  const heightParam = searchParams.get('height');
  const layerParam = searchParams.get('layer');
  const yearParam = searchParams.get('year');
  const eqParam = searchParams.get('eq');
  const viewParam = searchParams.get('view');

  const [dashboardMode, setDashboardMode] = useState<'feed' | 'map'>((viewParam === 'map' || cityParam || countryParam || predictionParam || eqParam || latParam) ? 'map' : 'feed');
  const [cesiumLoaded, setCesiumLoaded] = useState(dashboardMode === 'map');

  const [activeYear, setActiveYear] = useState(2050);
  const [activeCity, setActiveCity] = useState<CityData | null>(null);
  const [activeCountry, setActiveCountry] = useState<string | null>(null);
  const [activePrediction, setActivePrediction] = useState<Prediction | null>(null);
  const [activeEarthquake, setActiveEarthquake] = useState<any | null>(null);
  const [selectedDossier, setSelectedDossier] = useState<string | null>(null);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [feedFilter, setFeedFilter] = useState<string>('All');

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

  const [isAppReady, setIsAppReady] = useState(false);

  const handleEarthReady = useCallback(() => {
    console.log("[EXEC_TRACE] J = global loader disappears at " + performance.now().toFixed(1) + "ms");
    setIsAppReady(true);
  }, []);

  useEffect(() => {
    console.log("[EXEC_TRACE] B = global loading component mounts at " + performance.now().toFixed(1) + "ms");
    console.log("[EXEC_TRACE] C = main dashboard component mounts at " + performance.now().toFixed(1) + "ms");
    setMounted(true);
    
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (window.innerWidth < 1024) {
        setIsLeftPanelCollapsed(true);
        setIsRightPanelCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Safety fallback: if WebGL or satellite tile network has issues, do not lock forever
    const safetyTimeout = setTimeout(() => {
      setIsAppReady(prev => {
        if (!prev) {
          console.log("[EXEC_TRACE] J = global loader fallback triggered at " + performance.now().toFixed(1) + "ms");
          return true;
        }
        return prev;
      });
    }, 12000);

    return () => {
      clearTimeout(safetyTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const [semiData, setSemiData] = useState<SiliconAnalystsPayload | null>(null);
  const [semiError, setSemiError] = useState<string | null>(null);
  const [semiLoading, setSemiLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchSemiIntel() {
      try {
        setSemiLoading(true);
        const res = await fetch('/api/semiconductor');
        const payload = await res.json();
        if (payload.success && payload.data) {
          setSemiData(payload.data);
        } else {
          setSemiError(payload.error || 'Semiconductor Intelligence temporarily unavailable');
        }
      } catch (err: any) {
        console.error('Failed to fetch semiconductor intelligence:', err);
        setSemiError('Semiconductor Intelligence temporarily unavailable');
      } finally {
        setSemiLoading(false);
      }
    }
    fetchSemiIntel();
  }, []);

  const [activeLayers, setActiveLayers] = useState({
    cities: true,
    climate: true,
    tech: true,
    semiconductor: true,
    energy: false,
    space: false,
    geopolitical: true,
    seismic: false,
    markets: false,
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
    if (yearParam) {
      const yr = Number(yearParam);
      if (yr === 2030 || yr === 2040 || yr === 2050) {
        setActiveYear(yr);
      }
    }

    if (latParam && lonParam) {
      setFocusCoords({
        lat: Number(latParam),
        lon: Number(lonParam),
        height: heightParam ? Number(heightParam) : undefined
      });
    }

    if (layerParam) {
      setActiveLayers(prev => ({
        ...prev,
        [layerParam]: true
      }));
    }

    if (cityParam) {
      const cityObj = cities.find(c => c.name.toLowerCase() === cityParam.toLowerCase());
      if (cityObj) {
        setActiveCity(cityObj as any);
        setActiveCountry(null);
        setActivePrediction(null);
        setActiveEarthquake(null);
        setIsRightPanelCollapsed(false); // Auto-expand right panel on selection
      }
    } else if (countryParam) {
      setActiveCountry(countryParam.toUpperCase());
      setActiveCity(null);
      setActivePrediction(null);
      setActiveEarthquake(null);
      setIsRightPanelCollapsed(false); // Auto-expand right panel on selection
    } else if (predictionParam) {
      const predObj = predictions.find(p => p.slug === predictionParam);
      if (predObj) {
        setActivePrediction(predObj);
        setActiveCity(null);
        setActiveCountry(null);
        setActiveEarthquake(null);
        setIsRightPanelCollapsed(false); // Auto-expand right panel on selection
      }
    } else if (eqParam && earthquakes && earthquakes.length > 0) {
      const eqObj = earthquakes.find(e => (e.id === eqParam || e.place.toLowerCase().includes(eqParam.toLowerCase())));
      if (eqObj) {
        setActiveEarthquake(eqObj);
        setActiveCity(null);
        setActiveCountry(null);
        setActivePrediction(null);
      }
    } else {
      setActiveCity(null);
      setActiveCountry(null);
      setActivePrediction(null);
    }
  }, [cityParam, countryParam, predictionParam, latParam, lonParam, heightParam, layerParam, yearParam, eqParam, cities, predictions, earthquakes]);

  // Sync viewParam
  useEffect(() => {
    if (viewParam === 'map') {
      setDashboardMode('map');
      setCesiumLoaded(true);
    } else if (viewParam === 'feed') {
      setDashboardMode('feed');
      setCesiumLoaded(false); // Unmount Cesium when viewing feed
    }
  }, [viewParam]);

  const handleToggleMode = (mode: 'feed' | 'map') => {
    setDashboardMode(mode);
    if (mode === 'map') {
      setCesiumLoaded(true);
    } else {
      setCesiumLoaded(false); // Unmount Cesium when toggling back to feed
    }
    const url = new URL(window.location.href);
    url.searchParams.set('view', mode);
    router.push(url.pathname + url.search);
  };

  const handleFeedClick = (item: { lat: number; lon: number; height?: number; layer?: string; city?: any; prediction?: any; eq?: any }) => {
    if (item.lat !== undefined && item.lon !== undefined) {
      setFocusCoords({ lat: item.lat, lon: item.lon, height: item.height });
    }
    if (item.layer) {
      setActiveLayers(prev => ({ ...prev, [item.layer!]: true }));
    }
    if (item.city) {
      setActiveCity(item.city);
      setActiveCountry(null);
      setActivePrediction(null);
      setActiveEarthquake(null);
    } else if (item.prediction) {
      setActivePrediction(item.prediction);
      setActiveCity(null);
      setActiveCountry(null);
      setActiveEarthquake(null);
    } else if (item.eq) {
      setActiveEarthquake(item.eq);
      setActiveCity(null);
      setActiveCountry(null);
      setActivePrediction(null);
    }
    setDashboardMode('map');
    setCesiumLoaded(true);
    
    const url = new URL(window.location.origin + '/dashboard');
    url.searchParams.set('view', 'map');
    url.searchParams.set('year', activeYear.toString());
    if (item.lat !== undefined && item.lon !== undefined) {
      url.searchParams.set('lat', item.lat.toString());
      url.searchParams.set('lon', item.lon.toString());
      if (item.height) url.searchParams.set('height', item.height.toString());
    }
    if (item.layer) url.searchParams.set('layer', item.layer);
    if (item.city) url.searchParams.set('city', typeof item.city === 'string' ? item.city : item.city.name);
    if (item.prediction) url.searchParams.set('prediction', item.prediction.slug);
    if (item.eq) url.searchParams.set('eq', item.eq.id || item.eq.place);
    router.push(url.pathname + url.search);
  };

  const handleCityClick = (cityName: string) => {
    const cityObj = cities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
    if (cityObj) {
      handleFeedClick({
        lat: cityObj.lat,
        lon: cityObj.lon,
        height: 1200000,
        layer: 'cities',
        city: cityObj
      });
    }
  };

  const renderMiniSparkline = (points: number[], color: string) => {
    const max = Math.max(...points, 1);
    const min = Math.min(...points, 0);
    const range = max - min || 1;
    const svgPoints = points.map((val, idx) => {
      const x = idx * 20;
      const y = 18 - ((val - min) / range) * 14;
      return `${x},${y}`;
    }).join(' ');
    return (
      <svg className="w-20 h-6" viewBox="0 0 100 20" style={{ overflow: 'visible' }}>
        <polyline points={svgPoints} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

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
    setActiveEarthquake(null);
    router.push('/dashboard');
  };

  // Calculate dynamic indices based on live database data and active simulations
  const aiReadinessIndex = Math.round(
    cities.reduce((acc, c) => {
      const cityStats = generateCityIntelligence(c as any, activeYear, activeSimulations);
      return acc + cityStats.aiAdoption;
    }, 0) / (cities.length || 1)
  );

  const climateRiskIndex = Math.round(
    cities.reduce((acc, c) => {
      const cityStats = generateCityIntelligence(c as any, activeYear, activeSimulations);
      return acc + cityStats.climateRisk;
    }, 0) / (cities.length || 1)
  );

  const marketStabilityIndex = Math.round(
    snapshots.length > 0
      ? Math.max(10, 100 - snapshots.reduce((acc, s) => acc + Math.abs(s.change), 0) * 1.5)
      : 82
  );

  const spaceActivityIndex = Math.round(
    Math.min(98, 48 + (spaceEvents.length * 3.5) + (activeYear >= 2040 ? 15 : 0))
  );

  const seismicActivityIndex = Math.round(
    Math.max(12, 100 - (earthquakes.length * 4.2))
  );

  const predictionsCountIndex = Math.min(99, 45 + (predictions.length * 2.5));

  // ─── UNIFIED INTELLIGENCE FEED ──────────────────────────────────────────────
  const unifiedFeed = [
    // 0. Silicon Analysts Semiconductor Intelligence Feed
    ...(semiData?.marketPulse || []).map((signal, idx) => {
      // Map company based on headline words
      const headlineLower = signal.headline.toLowerCase();
      let matchedCompany = 'Semiconductor';
      const companies = ['NVIDIA', 'AMD', 'Intel', 'TSMC', 'Samsung', 'ASML', 'Micron', 'Qualcomm', 'Broadcom'];
      for (const comp of companies) {
        if (headlineLower.includes(comp.toLowerCase())) {
          matchedCompany = comp;
          break;
        }
      }
      
      // Determine strategic impact & severity
      let strategicImpact = 'Neutral supply stability.';
      if (signal.severity === 'critical' || signal.severity === 'high') {
        strategicImpact = 'High strategic threat/disruption to tech operations.';
      } else if (signal.trend === 'up') {
        strategicImpact = 'Positive expansion & development yield.';
      } else if (signal.trend === 'down') {
        strategicImpact = 'Supply chain strain & logistics friction.';
      }

      // Format importance score
      const importanceScore = signal.severity === 'critical' ? 95 : (signal.severity === 'high' ? 82 : (signal.severity === 'medium' ? 60 : 35));

      return {
        category: 'SEMICONDUCTOR',
        source: 'Silicon Analysts API',
        title: signal.headline,
        description: `Importance Score: ${importanceScore}% | Impact: ${strategicImpact} | Category: ${signal.category}`,
        timestamp: signal.date || 'Live update',
        timeSort: signal.date ? new Date(signal.date).getTime() : (new Date().getTime() - idx * 10000),
        severity: signal.severity === 'critical' ? 'Critical' : (signal.severity === 'high' ? 'High' : (signal.severity === 'medium' ? 'Medium' : 'Low')),
        image: '/images/semi-fab-stock.jpg', // we will download this or map it to a themed asset
        onClick: () => {
          setActiveEarthquake(null);
          setActiveCity(null);
          setActiveCountry(null);
          setActivePrediction(null);
          setActiveCategory('AI');
          setActiveLayers(prev => ({ ...prev, semiconductor: true }));
          setFocusCoords({ lat: 24.78, lon: 120.97, height: 1800000 }); // Hsinchu, TSMC Hub
        }
      };
    }),
    // 1. GNews / News feed
    ...news.map(n => {
      let publishedTimeStr = "Timestamp unavailable";
      let relativeTimeStr = "";
      
      const rawCreated = (n as any).created_at || (n as any).createdAt;
      if (rawCreated) {
        const dateObj = new Date(rawCreated);
        if (!isNaN(dateObj.getTime())) {
          publishedTimeStr = `Published: ${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
          const diffMs = new Date().getTime() - dateObj.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMins / 60000);
          const diffDays = Math.floor(diffHours / 24);
          if (diffMins < 60) relativeTimeStr = `${diffMins} hours ago`; // offset/simulated hours
          else if (diffHours < 24) relativeTimeStr = `${diffHours} hours ago`;
          else relativeTimeStr = `${diffDays} days ago`;
        }
      } else if (n.time) {
        relativeTimeStr = n.time;
        publishedTimeStr = `Published: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      }

      return {
        category: 'NEWS',
        source: 'GNews',
        title: n.title,
        description: n.description,
        timestamp: relativeTimeStr ? `${publishedTimeStr} (${relativeTimeStr})` : publishedTimeStr,
        timeSort: new Date().getTime() - 3600000, // proxy timestamp
        severity: 'Low',
        image: getIntelFeedImage({ source: 'GNews', title: n.title, image_url: n.image }),
        onClick: () => {
          setActiveEarthquake(null);
          setActiveCity(null);
          setActiveCountry(null);
          setActivePrediction(null);
          setFocusCoords({ lat: 20.0, lon: 0.0, height: 8000000 }); // Global view
        }
      };
    }),
    // 2. Space events
    ...spaceEvents.map(se => {
      let publishedTimeStr = "Timestamp unavailable";
      let relativeTimeStr = "";
      
      if (se.event_date) {
        const dateObj = new Date(se.event_date);
        if (!isNaN(dateObj.getTime())) {
          publishedTimeStr = `Published: ${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
          const diffMs = new Date().getTime() - dateObj.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMins / 60000);
          const diffDays = Math.floor(diffHours / 24);
          if (diffMins < 60) relativeTimeStr = `${diffMins} minutes ago`;
          else if (diffHours < 24) relativeTimeStr = `${diffHours} hours ago`;
          else relativeTimeStr = `${diffDays} days ago`;
        }
      }

      return {
        category: 'SPACE',
        source: se.event_type === 'APOD' ? 'NASA APOD' : se.event_type || 'NASA',
        title: se.title,
        description: se.description || 'Orbital observation data registered.',
        timestamp: relativeTimeStr ? `${publishedTimeStr} (${relativeTimeStr})` : publishedTimeStr,
        timeSort: se.event_date ? new Date(se.event_date).getTime() : new Date().getTime(),
        severity: se.event_type === 'NEO' ? 'Medium' : 'Low',
        image: se.image_url || getSensorImage(se, 'space'),
        onClick: () => {
          setActiveEarthquake(null);
          setActiveCity(null);
          setActiveCountry(null);
          setActivePrediction(null);
          setActiveLayers(prev => ({ ...prev, space: true }));
          setFocusCoords({ lat: 25.0, lon: -45.0, height: 16000000 }); // spaceports LEO view
        }
      };
    }),
    // 3. Earthquakes
    ...earthquakes.map(eq => {
      let publishedTimeStr = "Timestamp unavailable";
      let relativeTimeStr = "";

      if (eq.time) {
        const dateObj = new Date(eq.time);
        if (!isNaN(dateObj.getTime())) {
          publishedTimeStr = `Published: ${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
          const diffMs = new Date().getTime() - dateObj.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMins / 60000);
          if (diffMins < 60) relativeTimeStr = `${diffMins} minutes ago`;
          else relativeTimeStr = `${diffHours} hours ago`;
        }
      }

      return {
        category: 'SEISMIC',
        source: 'USGS',
        title: `M ${eq.magnitude.toFixed(1)} - ${eq.place}`,
        description: `Depth: ${eq.depth?.toFixed(1) || '0.0'} km. Seismic alert registered near fault zone.`,
        timestamp: relativeTimeStr ? `${publishedTimeStr} (${relativeTimeStr})` : publishedTimeStr,
        timeSort: eq.time ? new Date(eq.time).getTime() : new Date().getTime(),
        severity: eq.magnitude >= 6.0 ? 'Critical' : (eq.magnitude >= 5.0 ? 'High' : 'Medium'),
        image: getSensorImage(eq, 'earthquake'),
        onClick: () => {
          setActiveLayers(prev => ({ ...prev, seismic: true }));
          setFocusCoords({ lat: eq.lat, lon: eq.lon, height: 1500000 });
          setActiveEarthquake(eq);
          setActiveCity(null);
          setActiveCountry(null);
          setActivePrediction(null);
          setIsRightPanelCollapsed(false);
        }
      };
    }),
    // 4. Market Snapshots
    ...snapshots.map(s => {
      const isDown = s.change < 0;
      let publishedTimeStr = "Timestamp unavailable";
      let relativeTimeStr = "";

      if (s.timestamp) {
        const dateObj = new Date(s.timestamp);
        if (!isNaN(dateObj.getTime())) {
          publishedTimeStr = `Published: ${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
          const diffMs = new Date().getTime() - dateObj.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          if (diffMins < 60) relativeTimeStr = `${diffMins} minutes ago`;
          else relativeTimeStr = `${Math.floor(diffMins / 60)} hours ago`;
        }
      }

      return {
        category: 'MARKETS',
        source: 'Alpha Vantage',
        title: `${s.ticker} ${isDown ? '▼' : '▲'} ${s.change_percent}`,
        description: `Silicon stock yield active. Trading at $${s.price.toFixed(2)} USD.`,
        timestamp: relativeTimeStr ? `${publishedTimeStr} (${relativeTimeStr})` : publishedTimeStr,
        timeSort: s.timestamp ? new Date(s.timestamp).getTime() : new Date().getTime(),
        severity: Math.abs(parseFloat(s.change_percent)) > 2.0 ? 'High' : 'Low',
        image: getMarketLogo(s.ticker),
        onClick: () => {
          setActiveEarthquake(null);
          setActiveCity(null);
          setActiveCountry(null);
          setActivePrediction(null);
          setActiveLayers(prev => ({ ...prev, geopolitical: true, markets: true }));
          setFocusCoords({ lat: 22.3, lon: 114.1, height: 1200000 }); // Shenzhen silicon node
        }
      };
    }),
    // 5. Climate Alerts
    ...cities.slice(0, 10).map((c, idx) => {
      const cityStats = generateCityIntelligence(c as any, activeYear, activeSimulations);
      
      return {
        category: 'CLIMATE',
        source: 'Open-Meteo',
        title: `Climate alert: ${c.name} risk at ${cityStats.climateRisk}%`,
        description: `Projected temp delta +${c.offsets.tempRise.toFixed(1)}°C, sea level rise +${(c.offsets.seaLevel || 0.1).toFixed(2)}m.`,
        timestamp: `Last Updated: Jun 19, 2026 08:31 UTC`,
        timeSort: 1770000000000 - 7200000 - idx * 60000,
        severity: cityStats.climateRisk >= 75 ? 'Critical' : (cityStats.climateRisk >= 50 ? 'High' : 'Medium'),
        image: getSensorImage(c, 'climate'),
        onClick: () => {
          setActiveEarthquake(null);
          setActiveCountry(null);
          setActivePrediction(null);
          setActiveLayers(prev => ({ ...prev, climate: true }));
          handleSelectCity(c);
        }
      };
    }),
    // 6. Predictions
    ...predictions.filter(p => p.year <= activeYear).slice(0, 10).map((p, idx) => {
      let sourceTag = 'ChronoEarth Intelligence';
      if (p.category === 'AI') sourceTag = 'Gemini Analysis';
      else if (p.category === 'Climate') sourceTag = 'Research Synthesis';
      else if (p.category === 'Space') sourceTag = 'NASA';
      else if (p.category === 'Energy') sourceTag = 'Research Synthesis';
      else if (p.category === 'Cities') sourceTag = 'ChronoEarth Intelligence';

      return {
        category: 'PREDICTIONS',
        source: sourceTag,
        title: `Forecast: ${p.title} (${p.confidenceScore}% probability)`,
        description: p.description,
        timestamp: `${p.year} Target`,
        timeSort: 1770000000000 - 14400000 - idx * 60000,
        severity: p.confidenceScore >= 80 ? 'High' : 'Medium',
        image: getPredictionImage(p),
        onClick: () => {
          setActiveEarthquake(null);
          setActiveCity(null);
          setActiveCountry(null);
          setActivePrediction(p);
          setIsRightPanelCollapsed(false);
          const cityObj = cities.find(c => c.name.toLowerCase() === p.city.toLowerCase());
          if (cityObj) {
            setFocusCoords({ lat: cityObj.lat, lon: cityObj.lon, height: 1200000 });
          }
        }
      };
    })
  ].sort((a, b) => b.timeSort - a.timeSort);

  const globalIntelligenceScore = Math.round(
    (aiReadinessIndex + (100 - climateRiskIndex) + marketStabilityIndex + spaceActivityIndex + seismicActivityIndex) / 5
  );

  const spaceSweep = activeYear === 2050 ? '42 Sweep' : (activeYear === 2040 ? '28 Sweep' : (activeYear === 2030 ? '15 Sweep' : '8 Sweep'));
  const climateTemp = activeYear === 2050 ? '+1.8°C' : (activeYear === 2040 ? '+1.45°C' : (activeYear === 2030 ? '+1.10°C' : '+0.85°C'));
  const siliconYield = activeYear === 2050 ? '98.5%' : (activeYear === 2040 ? '95.8%' : (activeYear === 2030 ? '92.5%' : '88.2%'));
  const seismicMag = activeYear === 2050 ? '4.8 Mag' : (activeYear === 2040 ? '4.5 Mag' : (activeYear === 2030 ? '4.2 Mag' : '3.8 Mag'));

  const yearPredictions = predictions.filter(p => p.year === activeYear);
  const sortedPredictions = [...yearPredictions].sort((a, b) => b.votes - a.votes);
  const latestPrediction = predictions.length > 0 ? predictions[0] : null;
  const latestSpaceEvent = spaceEvents.length > 0 ? spaceEvents[0] : null;
  const apodEvent = spaceEvents.find(e => e.event_type === 'APOD') || spaceEvents.find(e => e.image_url);
  const marketAlert = snapshots.length > 0 ? snapshots[0] : null;
  const latestQuake = earthquakes.length > 0 ? earthquakes[0] : null;

  return (
    <main 
      className={`relative min-h-screen w-full ${dashboardMode === 'feed' ? 'overflow-y-auto custom-scrollbar pb-20' : 'h-screen w-screen overflow-hidden'}`} 
      style={{ background: '#02060A' }}
    >
      {/* Global Application Loading Overlay: EXPLORING NEW WAYS... */}
      <div
        className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#02060A] text-white/60 font-mono text-[11px] tracking-[0.35em] uppercase transition-opacity duration-500 ${
          (!isAppReady && dashboardMode === 'map') ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
          <span>EXPLORING NEW WAYS…</span>
        </div>
      </div>

      {/* Top Navigation */}
      <Navbar setActiveCity={handleSelectCity} />

      {/* Switcher Mode: FEED | MAP */}
      <div 
        style={{ top: isMobile ? '84px' : '96px' }}
        className="fixed left-1/2 -translate-x-1/2 z-50 flex items-center bg-[#02060A]/85 border border-[#00F5B0]/30 p-1 rounded-full backdrop-blur-xl shadow-[0_4px_20px_rgba(0,245,176,0.15)]"
      >
        <button
          id="dashboard-switcher-feed"
          onClick={() => handleToggleMode('feed')}
          className={`px-6 py-1.5 rounded-full font-mono text-[10px] tracking-widest uppercase transition-all duration-300 cursor-pointer ${
            dashboardMode === 'feed'
              ? 'bg-[#00F5B0] text-[#02060A] font-semibold'
              : 'text-[#8CA8B8] hover:text-white bg-transparent'
          }`}
        >
          FEED
        </button>
        <button
          id="dashboard-switcher-map"
          onClick={() => handleToggleMode('map')}
          className={`px-6 py-1.5 rounded-full font-mono text-[10px] tracking-widest uppercase transition-all duration-300 cursor-pointer ${
            dashboardMode === 'map'
              ? 'bg-[#00F5B0] text-[#02060A] font-semibold'
              : 'text-[#8CA8B8] hover:text-white bg-transparent'
          }`}
        >
          MAP
        </button>
      </div>

      {/* Command Desk view (FEED mode) */}
      {dashboardMode === 'feed' && (
        <CommandDesk
          activeYear={activeYear}
          setActiveYear={setActiveYear}
          cities={cities}
          predictions={predictions}
          spaceEvents={spaceEvents}
          earthquakes={earthquakes}
          snapshots={snapshots}
          kbArticles={kbArticles}
          handleFeedClick={handleFeedClick}
          handleCityClick={handleCityClick}
          handleToggleMode={handleToggleMode}
        />
      )}



      {/* Full screen Globe (Holographic projection when idle, Cesium when map active) */}
      {mounted && (
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
          {dashboardMode === 'feed' ? (
            <LightweightGlobe />
          ) : (
            cesiumLoaded && (
              <CesiumGlobe
                activeYear={activeYear}
                activeCategory={activeCategory}
                activeCity={activeCity}
                setActiveCity={handleSelectCity}
                activeCountry={activeCountry}
                setActiveCountry={handleSelectCountry}
                overlays={DEFAULT_OVERLAYS}
                earthMode="cyber"
                activeLayers={activeLayers}
                activeSimulations={activeSimulations}
                cities={cities}
                focusCoords={focusCoords}
                earthquakes={earthquakes}
                onEarthReady={handleEarthReady}
              />
            )
          )}
        </div>
      )}

      {/* Depth Vignettes */}
      {dashboardMode === 'map' && (
        <>
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
        </>
      )}

      {/* Floating Left: Intelligence Layers Panel */}
      {dashboardMode === 'map' && (
        <div 
          style={{
            position: 'fixed',
            left: isMobile ? '16px' : '40px',
            right: isMobile ? '16px' : 'auto',
            top: isMobile ? 'auto' : '120px',
            bottom: isMobile ? '100px' : 'auto',
            width: isMobile ? 'auto' : '280px',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            pointerEvents: 'auto',
            transform: isMobile
              ? (isLeftPanelCollapsed ? 'translateY(calc(100% + 150px))' : 'translateY(0)')
              : (isLeftPanelCollapsed ? 'translateX(calc(-100% - 60px))' : 'translateX(0)'),
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          className="premium-glass p-6 rounded-lg animate-fade-in"
        >
          {/* Left Chevron Toggler Button */}
          {!isMobile && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLeftPanelCollapsed(!isLeftPanelCollapsed);
              }}
              aria-label={isLeftPanelCollapsed ? "Expand planetary layers panel" : "Collapse planetary layers panel"}
              aria-expanded={!isLeftPanelCollapsed}
              className="absolute top-0 -right-6 w-6 h-12 bg-[#02060A]/85 backdrop-blur-md border-y border-r border-[#00F5B0]/30 hover:border-[#00F5B0]/60 rounded-r-md text-[10px] text-[#00F5B0] flex items-center justify-center transition-all duration-300 cursor-pointer shadow-[5px_0_15px_rgba(0,245,176,0.15)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00F5B0]"
            >
              {isLeftPanelCollapsed ? '❯' : '❮'}
            </button>
          )}
          <div className="flex justify-between items-center border-b border-[#00F5B0]/15 pb-3">
            <div className="flex flex-col gap-1 text-left">
              <span className="text-[10px] font-mono text-[#00F5B0] uppercase tracking-widest font-semibold">Intelligence</span>
              <h3 className="text-sm font-light text-white tracking-wider uppercase font-mono m-0">Planetary Layers</h3>
            </div>
            {isMobile && (
              <button
                onClick={() => setIsLeftPanelCollapsed(true)}
                className="bg-transparent border-none text-rose-450 hover:text-rose-450 font-mono text-[10px] cursor-pointer"
              >
                [✕ CLOSE]
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {([
              { key: 'cities', label: 'Future Cities', icon: '🏙️' },
              { key: 'climate', label: 'Climate Intel', icon: '🌍' },
              { key: 'tech', label: 'AI & Technology', icon: '💻' },
              { key: 'semiconductor', label: 'Semiconductor Intel', icon: '💾' },
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
                  role="switch"
                  aria-checked={activeLayers[key]}
                  aria-label={`Toggle ${label} layer`}
                  className="relative w-9 h-5 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00F5B0] focus-visible:ring-offset-1 cursor-pointer"
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
      )}

      {/* Floating Center-Bottom: Timeline Selector */}
      {dashboardMode === 'map' && (
        <div 
          style={{
            position: 'fixed',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 40,
            pointerEvents: 'auto',
            width: isMobile ? 'calc(100% - 120px)' : 'auto',
            maxWidth: isMobile ? '240px' : 'none',
            justifyContent: 'center',
          }}
          className={`premium-glass rounded-full flex items-center justify-between ${isMobile ? 'px-4 py-2 gap-3' : 'px-8 py-3 gap-6'} animate-fade-in`}
        >
          <span className="text-[10px] font-mono text-[#7A8694] uppercase tracking-[0.2em] font-semibold">Timeline</span>
          <div className="flex items-center">
            {([2030, 2040, 2050] as const).map((year, index) => {
              const isActive = activeYear === year;
              return (
                <div key={year} className="flex items-center">
                  {index > 0 && (
                    <div className={`${isMobile ? 'w-8' : 'w-16'} h-[1px] bg-white/10 mx-2 relative`}>
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
                      fontSize: isMobile ? '10px' : '12px',
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
      )}

      {/* Floating Layers Panel Trigger for Mobile */}
      {isMobile && dashboardMode === 'map' && (
        <button
          onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
          aria-label="Toggle planetary layers panel"
          aria-expanded={!isLeftPanelCollapsed}
          className="fixed bottom-10 left-4 z-50 p-3 rounded-full bg-[#02060A]/85 border border-[#00F5B0]/30 text-[#00F5B0] shadow-[0_0_15px_rgba(0,245,176,0.2)] backdrop-blur-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform outline-none focus-visible:ring-2 focus-visible:ring-[#00F5B0]"
          style={{ width: '44px', height: '44px' }}
          title="Toggle Layers"
        >
          🗺️
        </button>
      )}

      {/* City Return Overlay */}
      {dashboardMode === 'map' && (activeCity || activeCountry || activePrediction) && (
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
      {dashboardMode === 'map' && activeCity && (
        <CityPreviewCard 
          city={activeCity}
          activeYear={activeYear}
          activeSimulations={activeSimulations}
          onClose={() => handleSelectCity(null)}
        />
      )}

      {/* Interactive Dossier modal */}
      {dashboardMode === 'map' && selectedDossier && (
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
                  aria-label="Close dossier briefing"
                  className="absolute top-4 right-4 bg-transparent border-none text-rose-450 hover:text-rose-400 cursor-pointer text-xs transition-colors"
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
      <div className="h-screen w-screen bg-[#02060A] flex flex-col items-center justify-center font-mono text-[11px] text-white/50 tracking-[0.35em] uppercase">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
          <span>EXPLORING NEW WAYS…</span>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
