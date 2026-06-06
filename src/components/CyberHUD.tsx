'use client';

import { useEffect, useRef, useState } from 'react';
import { CityData, citiesRawData, generateCityProjections } from '../data/citiesData';

const C = {
  emerald: '#00F5B0',
  cyan: '#00D98F',
  iceBlue: '#00D98F',
  accent: '#FFFFFF',
  white: '#F5F7FA',
  bg: 'rgba(2, 8, 15, 0.75)',
  border: 'rgba(0, 245, 176, 0.15)',
  accentBg: 'rgba(0, 245, 176, 0.05)',
};

interface CyberHUDProps {
  activeCity: CityData | null;
  setActiveCity: (city: CityData | null) => void;
}

// Animated counter hook
function useCounter(target: number, duration = 2000) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      setVal(Math.round(target * easeOut(t)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return val;
}
function easeOut(t: number) { return 1 - Math.pow(1 - t, 3); }

// Sparkline mini chart (editorial style, thin, low-opacity, no glow)
function Sparkline({ color, height = 36 }: { color: string; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataRef   = useRef<number[]>(Array.from({ length: 40 }, () => 0.4 + Math.random() * 0.5));
  
  useEffect(() => {
    const id = setInterval(() => {
      const d = dataRef.current;
      d.push(Math.max(0.1, Math.min(1.0, d[d.length - 1] + (Math.random() - 0.5) * 0.12)));
      if (d.length > 60) d.shift();
      const c = canvasRef.current;
      if (!c) return;
      const ctx = c.getContext('2d')!;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.beginPath();
      d.forEach((v, i) => {
        const x = (i / (d.length - 1)) * c.width;
        const y = c.height - v * c.height;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.0;
      ctx.shadowBlur = 0;
      ctx.stroke();
    }, 80);
    return () => clearInterval(id);
  }, [color]);
  
  return <canvas ref={canvasRef} width={160} height={height} style={{ width: '100%', height: `${height}px` }} />;
}

// Section header - clean, elegant, letter-spaced print header
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="font-display text-[12px] font-light tracking-[-0.02em] text-white/70 border-b border-white/5 pb-1 mb-2.5 select-none">
      {title}
    </div>
  );
}

export default function CyberHUD({
  activeCity,
  setActiveCity,
}: CyberHUDProps) {
  const [time, setTime] = useState('');
  const [nodeCount,  setNodeCount]  = useState(1247389);
  const [satCount,   setSatCount]   = useState(12842);
  const [beamCount,  setBeamCount]  = useState(834);
  const [dataFlow,   setDataFlow]   = useState(2.41);
  const [aiActivity, setAiActivity] = useState(98.7);

  // Bookmarking and report generation states
  const [bookmarkedCities, setBookmarkedCities] = useState<string[]>([]);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportLog, setReportLog] = useState<string[]>([]);
  const [activeReport, setActiveReport] = useState<{ city: string; year: number; text: string } | null>(null);

  const displayNodes = useCounter(nodeCount, 2500);

  // Load bookmarked cities from localStorage
  useEffect(() => {
    try {
      const savedCities = localStorage.getItem('chrono_bookmarked_cities');
      if (savedCities) setBookmarkedCities(JSON.parse(savedCities));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleBookmarkCity = (name: string) => {
    let updated;
    if (bookmarkedCities.includes(name)) {
      updated = bookmarkedCities.filter(x => x !== name);
    } else {
      updated = [...bookmarkedCities, name];
    }
    setBookmarkedCities(updated);
    localStorage.setItem('chrono_bookmarked_cities', JSON.stringify(updated));
  };

  // Live clock
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}  ${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}:${String(d.getUTCSeconds()).padStart(2,'0')} UTC`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Fluctuating live metrics
  useEffect(() => {
    const id = setInterval(() => {
      setNodeCount(n => n + Math.floor((Math.random() - 0.4) * 120));
      setSatCount(n  => Math.max(12000, n + Math.floor((Math.random() - 0.5) * 8)));
      setBeamCount(n => Math.max(700, n + Math.floor((Math.random() - 0.5) * 20)));
      setDataFlow(v  => Math.max(1.8, +(v + (Math.random() - 0.5) * 0.15).toFixed(2)));
      setAiActivity(v => Math.min(99.9, Math.max(95, +(v + (Math.random() - 0.5) * 0.5).toFixed(1))));
    }, 1200);
    return () => clearInterval(id);
  }, []);

  // AI report generation sequence
  const startReportGeneration = (cityName: string, yearNum: 2030 | 2040 | 2050) => {
    setGeneratingReport(true);
    setActiveReport(null);
    setReportLog([]);

    const steps = [
      'SECURE UPLINK ESTABLISHED WITH GLOBAL DATA NEST...',
      'RETRIEVING GEOSPATIAL ENVIRONMENTAL TELEMETRY...',
      'SCANNING SHIFTING CLIMATE SCENARIOS FOR TARGET COORDINATES...',
      'CORRELATING QUANTUM INDUSTRIAL AND POPULATION GROWTH MODELS...',
      'COMPILING FUTURES BRIEFING [YEAR ' + yearNum + ']...',
      'REPORT COMPILATION COMPLETE.'
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setReportLog(prev => [...prev, `[${new Date().toISOString().slice(11, 19)}] ${step}`]);
        if (idx === steps.length - 1) {
          const targetCityObj = citiesRawData.find(c => c.name === cityName);
          if (targetCityObj) {
            const climateProjection = generateCityProjections(targetCityObj, 'Climate Recovery', yearNum);
            const energyProjection = generateCityProjections(targetCityObj, 'Clean Energy', yearNum);
            const transitProjection = generateCityProjections(targetCityObj, 'Transportation Networks', yearNum);
            const popProjection = generateCityProjections(targetCityObj, 'Population Growth', yearNum);

            const reportText = `### FUTURES MATRIX BRIEFING: ${cityName.toUpperCase()} (${yearNum})

**1. ENVIRONMENTAL MATRIX**
- Stability Rating: ${climateProjection.stability}%
- Operational Status: ${climateProjection.status}
- Strategic Focus: ${climateProjection.text}

**2. ENERGY INFRASTRUCTURE**
- Grid Resilience: ${energyProjection.stability}%
- Systemic Integration: Active grid conversion systems.
- Power Profile: ${energyProjection.text}

**3. MOBILITY & TRANSPORT HUB**
- Network Coverage: ${transitProjection.text}
- Autonomy Rating: Secure decentralized mesh link.

**4. DEMOGRAPHICS & CARRYING CAPACITY**
- Projected Capacity: ${popProjection.text}
- Techno-social carrying capacity stabilized.`;

            setActiveReport({ city: cityName, year: yearNum, text: reportText });
          }
        }
      }, (idx + 1) * 600);
    });
  };

  const saveGeneratedReport = () => {
    if (!activeReport) return;
    try {
      const savedReps = localStorage.getItem('chrono_saved_reports');
      const list = savedReps ? JSON.parse(savedReps) : [];
      const newReport = {
        id: `rep-${Date.now()}`,
        city: activeReport.city,
        year: activeReport.year,
        text: activeReport.text,
        date: new Date().toLocaleDateString()
      };
      localStorage.setItem('chrono_saved_reports', JSON.stringify([newReport, ...list]));
      alert('Report saved to user saved database!');
    } catch (e) {
      console.error(e);
    }
  };

  const downloadReport = (rep: { city: string; year: number; text: string }) => {
    const element = document.createElement("a");
    const file = new Blob([rep.text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${rep.city}_forecast_${rep.year}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const panelStyle: React.CSSProperties = {
    background: 'rgba(5, 12, 18, 0.55)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(0, 245, 176, 0.08)',
    borderRadius: '4px',
    padding: '12px 14px',
    position: 'relative',
    overflow: 'hidden',
    pointerEvents: 'auto',
    width: '100%',
  };

  const cornerAccent = null;

  return (
    <>
      <style>{`
        @keyframes hud-blink {
          0%,100% { opacity:1; }
          50% { opacity:0.4; }
        }
        @keyframes data-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.7; }
        }
        .cyber-hud-grid {
          display: grid;
          grid-template-columns: 143px 1fr 143px;
          grid-template-rows: 1fr auto;
          gap: 16px;
          position: fixed;
          inset: 80px 40px 12px 40px;
          height: calc(100vh - 92px);
          pointer-events: none;
          box-sizing: border-box;
        }
        @media (min-width: 1440px) {
          .cyber-hud-grid {
            grid-template-columns: 150px 1fr 150px;
            gap: 20px;
            inset: 88px 40px 12px 40px;
            height: calc(100vh - 100px);
          }
        }
        @media (min-width: 1600px) {
          .cyber-hud-grid {
            grid-template-columns: 156px 1fr 156px;
            gap: 24px;
          }
        }
        .cyber-hud-left {
          grid-column: 1;
          grid-row: 1 / span 2;
          align-self: center;
          width: 100%;
          pointer-events: none;
        }
        .cyber-hud-right {
          grid-column: 3;
          grid-row: 1 / span 2;
          align-self: center;
          width: 100%;
          pointer-events: none;
          max-height: 100%;
        }
        .cyber-hud-bottom {
          grid-column: 2;
          grid-row: 2;
          display: flex;
          gap: 12px;
          width: 100%;
          align-self: end;
          pointer-events: none;
        }
        .cyber-hud-card {
          flex: 1;
          height: 70px;
          display: flex;
          flex-direction: column;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,229,255,0.2);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,229,255,0.5);
        }
      `}</style>

      {/* GRID CONTAINER */}
      <div className="cyber-hud-grid">
        
        {/* LEFT HUD: LIVE PLANET STATUS */}
        <div className="cyber-hud-left" style={{ animation: 'fade-up 0.8s 0.6s cubic-bezier(0.22,1,0.36,1) both' }}>
          <div style={panelStyle}>
            {cornerAccent}
            <SectionHeader title="Planet status" />
            
            <div className="font-sans-editorial text-[10.5px] text-white/70 leading-relaxed flex flex-col gap-2.5">
              <p>
                AI networks manage <span className="font-semibold text-white" style={{ color: C.emerald }}>{aiActivity}%</span> of infrastructure telemetry.
              </p>
              <p>
                Global data stream operates at <span className="font-semibold text-white" style={{ color: C.cyan }}>{dataFlow} PB/s</span>.
              </p>
              <p>
                Active grid nodes number <span className="font-semibold text-white">{displayNodes.toLocaleString()}</span>.
              </p>
              <p>
                Decentralized orbit tracks <span className="font-semibold text-white" style={{ color: C.accent }}>{satCount.toLocaleString()}</span> satellites.
              </p>
              <p>
                Planetary system health remains within <span className="font-medium text-emerald-400" style={{ color: '#00F5B0' }}>optimal margins</span>.
              </p>
            </div>

            <div style={{ marginTop: 10, marginBottom: 2 }}>
              <div className="font-sans-editorial" style={{ fontSize: 7, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', marginBottom: 4 }}>Data matrix trends</div>
              <Sparkline color={C.emerald} height={20} />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: ORBITAL LAYERS / CITY INTELLIGENCE PANEL */}
        <div className="cyber-hud-right" style={{ animation: 'fade-up 0.8s 0.8s cubic-bezier(0.22,1,0.36,1) both' }}>
          {activeCity === null ? (
            <div style={panelStyle}>
              {cornerAccent}
              <SectionHeader title="Orbital infrastructure" />
              <div className="font-sans-editorial text-[10.5px] text-white/70 leading-relaxed flex flex-col gap-2.5">
                <p>
                  <span className="font-semibold text-white block text-[9px] tracking-normal" style={{ color: C.cyan }}>Low Earth orbit (550 km)</span>
                  A mesh of 12 telemetry satellites mapping active urban zones.
                </p>
                <p>
                  <span className="font-semibold text-white block text-[9px] tracking-normal" style={{ color: C.emerald }}>Medium Earth orbit (3,200 km)</span>
                  8 high-frequency arrays coordinating climate recovery grids.
                </p>
                <p>
                  <span className="font-semibold text-white block text-[9px] tracking-normal" style={{ color: C.accent }}>Geostationary orbit (10,000 km)</span>
                  5 localized monitors tracking planetary albedo dynamics.
                </p>
              </div>

              <div className="border-t border-white/5 mt-3 pt-3">
                <SectionHeader title="System guide" />
                <div className="font-sans-editorial text-[9px] text-white/50 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2"><span className="text-white">◉</span> Major urban hubs</div>
                  <div className="flex items-center gap-2"><span className="text-emerald-400" style={{ color: C.emerald }}>●</span> Regional synced nodes</div>
                  <div className="flex items-center gap-2"><span className="text-[#00F5B0]" style={{ color: C.cyan }}>◌</span> Climate telemetry points</div>
                  <div className="flex items-center gap-2"><span className="text-cyan-300" style={{ color: C.cyan }}>—</span> Energy pathways</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ ...panelStyle, maxHeight: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }} className="custom-scrollbar">
              {cornerAccent}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <span className="font-sans-editorial" style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em' }}>Intelligence brief</span>
                <button onClick={() => setActiveCity(null)} className="font-sans-editorial hover:text-white transition-colors" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.40)', cursor: 'pointer', fontSize: 8 }}>[Dismiss]</button>
              </div>
              
              <div className="font-sans-editorial text-sm font-semibold text-white tracking-normal capitalize">
                {activeCity.name}
              </div>
              <div className="font-sans-editorial text-[8px] text-white/45 tracking-normal mb-1">
                Coordinates: {activeCity.lat.toFixed(4)}° N, {activeCity.lon.toFixed(4)}° E
              </div>

              <div className="font-sans-editorial text-[10.5px] text-white/70 leading-relaxed border-b border-white/5 pb-3 mb-2">
                The municipal core operates with <span className="font-semibold text-white" style={{ color: C.cyan }}>{(75 + (activeCity.offsets.popGrowth > 1.08 ? 19 : 8))}% AI integration</span>. 
                Environmental systems are rated at <span className="font-semibold text-white" style={{ color: C.emerald }}>{(68 + (activeCity.offsets.tempRise > 1.0 ? 8 : 22))}% stability</span> under active adaptation profiles.
              </div>

              <SectionHeader title="Planetary projections" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                <div style={{ padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '10px' }} className="font-sans-editorial text-white/75 leading-relaxed">
                  <div className="text-white/50 text-[7.5px] tracking-normal mb-0.5" style={{ color: C.emerald }}>Climate adaptation</div>
                  {activeCity.details.climate}
                </div>
                <div style={{ padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '10px' }} className="font-sans-editorial text-white/75 leading-relaxed">
                  <div className="text-white/50 text-[7.5px] tracking-normal mb-0.5" style={{ color: C.cyan }}>Power generation</div>
                  {activeCity.details.energy}
                </div>
                <div style={{ padding: '4px 0', fontSize: '10px' }} className="font-sans-editorial text-white/75 leading-relaxed">
                  <div className="text-white/50 text-[7.5px] tracking-normal mb-0.5" style={{ color: C.accent }}>Orbital satellite links</div>
                  {activeCity.details.satellites}
                </div>
              </div>

              <SectionHeader title="Futurologist brief" />
              <div className="font-sans-editorial text-[10.5px] text-white/70 leading-relaxed mb-3">
                {generateCityProjections(activeCity, 'Ocean Monitoring', 2050).text}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 mt-auto">
                <button
                  onClick={() => toggleBookmarkCity(activeCity.name)}
                  className={`w-full py-1.5 text-[12px] tracking-normal border transition-all duration-300 font-sans-editorial ${
                    bookmarkedCities.includes(activeCity.name)
                      ? 'bg-white/10 border-white/20 text-white'
                      : 'bg-transparent border-white/10 hover:border-white hover:bg-white hover:text-black text-white'
                  }`}
                >
                  {bookmarkedCities.includes(activeCity.name) ? '🔖 Bookmarked' : 'Bookmark city'}
                </button>

                <button
                  onClick={() => startReportGeneration(activeCity.name, 2050)}
                  className="w-full py-1.5 text-[12px] tracking-normal border border-white/10 hover:border-white hover:bg-white hover:text-black bg-transparent text-white transition-all duration-300 font-sans-editorial"
                >
                  Generate forecast report
                </button>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM PANELS: Global Telemetry, Scanning Activity, Active Data Flows */}
        <div className="cyber-hud-bottom" style={{ animation: 'fade-up 0.8s 1.0s cubic-bezier(0.22,1,0.36,1) both' }}>
          
          {/* Global Telemetry */}
          <div style={{ ...panelStyle, padding: '8px 12px' }} className="cyber-hud-card">
            {cornerAccent}
            <SectionHeader title="Global telemetry" />
            <div style={{ display: 'flex', gap: 10, flex: 1, alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 1 }}>
                  <span className="font-sans-editorial text-[7px] text-white/50 tracking-wider">Data flow</span>
                  <span className="font-sans-editorial text-[8px] text-white font-medium" style={{ color: C.cyan }}>{dataFlow.toFixed(1)} PB/s</span>
                </div>
                <Sparkline color={C.cyan} height={14} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 1 }}>
                  <span className="font-sans-editorial text-[7px] text-white/50 tracking-wider">Nodes</span>
                  <span className="font-sans-editorial text-[8px] text-white font-medium" style={{ color: C.emerald }}>{(displayNodes / 1000).toFixed(0)}K</span>
                </div>
                <Sparkline color={C.emerald} height={14} />
              </div>
            </div>
          </div>

          {/* Scanning Activity */}
          <div style={{ ...panelStyle, padding: '8px 12px' }} className="cyber-hud-card">
            {cornerAccent}
            <SectionHeader title="Scanning activity" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 10px', flex: 1, alignItems: 'center' }}>
              {[
                { label: 'Climate', val: 87, col: C.cyan },
                { label: 'Ocean',   val: 92, col: C.emerald },
                { label: 'Biodiversity', val: 74, col: C.accent },
                { label: 'Energy grid', val: 94, col: C.cyan },
              ].map(({ label, val, col }) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 1 }}>
                    <span className="font-sans-editorial text-[7px] text-white/50 tracking-wider">{label}</span>
                    <span className="font-sans-editorial text-[8px] text-white font-medium">{val}%</span>
                  </div>
                  <div style={{ height: 1.5, background: 'rgba(255,255,255,0.06)' }}>
                    <div style={{ height: '100%', width: `${val}%`, background: col, transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Data Flows */}
          <div style={{ ...panelStyle, padding: '8px 12px' }} className="cyber-hud-card">
            {cornerAccent}
            <SectionHeader title="Active data flows" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, justifyContent: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
                {[
                  { route: 'Asia→Eur',     val: 12.6, col: C.cyan },
                  { route: 'N.Am→Asia',    val: 9.8, col: C.emerald  },
                  { route: 'Eur→Afr',      val: 7.4, col: C.accent  },
                ].map(({ route, val, col }) => (
                  <div key={route} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <span className="font-sans-editorial text-[6.5px] text-white/50 tracking-wider">{route}</span>
                    <span className="font-sans-editorial text-[7.5px] text-white font-medium" style={{ color: col }}>{val} PB/s</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 2, marginTop: 4 }}>
                <div className="font-sans-editorial text-center" style={{ fontSize: 7, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>{time}</div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* FLOATING HOLOGRAPHIC REPORT GENERATOR OVERLAY */}
      {(generatingReport || activeReport) && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(2, 8, 15, 0.75)',
          backdropFilter: 'blur(12px)', zIndex: 100, display: 'flex',
          alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto'
        }}>
          <div style={{ ...panelStyle, width: '560px', height: '460px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {cornerAccent}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 10 }}>
              <span className="font-sans-editorial text-[10px] text-white/50 tracking-normal font-light">
                ChronoEarth futures commission // Matrix engine
              </span>
              <button 
                onClick={() => {
                  setGeneratingReport(false);
                  setActiveReport(null);
                }} 
                className="font-sans-editorial text-[9px] text-red-400 hover:text-red-300 tracking-normal bg-transparent border-none cursor-pointer"
              >
                [✕ Close]
              </button>
            </div>

            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {!activeReport && reportLog.map((logLine, idx) => (
                <div key={idx} className="font-sans-editorial text-[9px] text-white/40 tracking-normal">
                  {logLine}
                </div>
              ))}

              {activeReport && (
                <div className="font-sans-editorial text-slate-200 text-xs leading-relaxed p-4 bg-white/[0.02] border border-white/5 rounded" style={{ whiteSpace: 'pre-wrap' }}>
                  {activeReport.text}
                </div>
              )}
            </div>

            {activeReport && (
              <div style={{ display: 'flex', gap: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
                <button
                  onClick={saveGeneratedReport}
                  className="flex-1 py-2 text-[9px] tracking-normal border border-white/10 hover:border-white hover:bg-white hover:text-black bg-transparent text-white transition-all duration-300 font-sans-editorial"
                >
                  Save brief
                </button>
                <button
                  onClick={() => downloadReport(activeReport)}
                  className="flex-1 py-2 text-[9px] tracking-normal border border-white/10 hover:border-white hover:bg-white hover:text-black bg-transparent text-white transition-all duration-300 font-sans-editorial"
                >
                  Download brief
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
