'use client';

import { useEffect, useRef, useState } from 'react';
import { CityData, citiesRawData, generateCityProjections } from '../data/citiesData';

const C = {
  emerald: '#ffffff',
  cyan:    '#ffffff',
  iceBlue: '#ffffff',
  white:   '#FFFFFF',
  bg:      'rgba(5, 21, 34, 0.45)',
  border:  'rgba(255, 255, 255, 0.05)',
  accentBg:'rgba(255, 255, 255, 0.02)',
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
    <div className="font-display text-[9px] font-light tracking-[0.25em] text-white/60 uppercase border-b border-white/5 pb-1.5 mb-3 select-none">
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
    background: 'rgba(3, 5, 10, 0.55)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '4px',
    padding: '20px 24px',
    position: 'relative',
    overflow: 'hidden',
    pointerEvents: 'auto',
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

      {/* LEFT HUD: LIVE PLANET STATUS */}
      <div style={{
        position: 'fixed', left: 40, top: '50%', transform: 'translateY(-50%)',
        zIndex: 30, width: 220, pointerEvents: 'none',
        animation: 'fade-up 0.8s 0.6s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <div style={panelStyle}>
          {cornerAccent}
          <SectionHeader title="Planet Status" />
          
          <div className="font-serif text-[11px] text-white/60 leading-relaxed flex flex-col gap-3">
            <p>
              AI networks manage <span className="font-sans-editorial font-medium text-white">{aiActivity}%</span> of infrastructure telemetry.
            </p>
            <p>
              Global data stream operates at <span className="font-sans-editorial font-medium text-white">{dataFlow} PB/s</span>.
            </p>
            <p>
              Active grid nodes number <span className="font-sans-editorial font-medium text-white">{displayNodes.toLocaleString()}</span>.
            </p>
            <p>
              Decentralized orbit tracks <span className="font-sans-editorial font-medium text-white">{satCount.toLocaleString()}</span> satellites.
            </p>
            <p>
              Planetary system health remains within <span className="text-emerald-400">optimal margins</span>.
            </p>
          </div>

          <div style={{ marginTop: 16, marginBottom: 4 }}>
            <div className="font-display" style={{ fontSize: 7, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', marginBottom: 6 }}>DATA MATRIX TRENDS</div>
            <Sparkline color={C.emerald} height={32} />
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: ORBITAL LAYERS / CITY INTELLIGENCE PANEL */}
      <div style={{
        position: 'fixed', right: 40, top: '50%', transform: 'translateY(-50%)',
        zIndex: 30, width: 220, pointerEvents: 'none',
        animation: 'fade-up 0.8s 0.8s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        {activeCity === null ? (
          <div style={panelStyle}>
            {cornerAccent}
            <SectionHeader title="Orbital Infrastructure" />
            <div className="font-serif text-[11px] text-white/60 leading-relaxed flex flex-col gap-3">
              <p>
                <span className="font-sans-editorial font-medium text-white block text-[9.5px]">Low Earth Orbit (550 km)</span>
                A mesh of 12 telemetry satellites mapping active urban zones.
              </p>
              <p>
                <span className="font-sans-editorial font-medium text-white block text-[9.5px]">Medium Earth Orbit (3,200 km)</span>
                8 high-frequency arrays coordinating climate recovery grids.
              </p>
              <p>
                <span className="font-sans-editorial font-medium text-white block text-[9.5px]">Geostationary Orbit (10,000 km)</span>
                5 localized monitors tracking planetary albedo dynamics.
              </p>
            </div>

            <div className="border-t border-white/5 mt-4 pt-4">
              <SectionHeader title="System Guide" />
              <div className="font-sans-editorial text-[9px] text-white/45 flex flex-col gap-1.5">
                <div className="flex items-center gap-2"><span className="text-white">◉</span> Major Urban Hubs</div>
                <div className="flex items-center gap-2"><span className="text-emerald-400">●</span> Regional Synced Nodes</div>
                <div className="flex items-center gap-2"><span className="text-cyan-400">◌</span> Climate Telemetry Points</div>
                <div className="flex items-center gap-2"><span className="text-cyan-300">—</span> Energy Pathways</div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ ...panelStyle, maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }} className="custom-scrollbar">
            {cornerAccent}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
              <span className="font-sans-editorial" style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em' }}>INTELLIGENCE BRIEF</span>
              <button onClick={() => setActiveCity(null)} className="font-sans-editorial hover:text-white transition-colors" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.40)', cursor: 'pointer', fontSize: 8 }}>[DISMISS]</button>
            </div>
            
            <div className="font-display text-base font-light text-white tracking-wide uppercase">
              {activeCity.name}
            </div>
            <div className="font-sans-editorial text-[8px] text-white/45 tracking-wider uppercase mb-1">
              COORDINATES: {activeCity.lat.toFixed(4)}° N, {activeCity.lon.toFixed(4)}° E
            </div>

            <div className="font-serif text-[11px] text-white/70 leading-relaxed border-b border-white/5 pb-3 mb-2">
              The municipal core operates with <span className="font-sans-editorial font-semibold text-white">{(75 + (activeCity.offsets.popGrowth > 1.08 ? 19 : 8))}% AI integration</span>. 
              Environmental systems are rated at <span className="font-sans-editorial font-semibold text-white">{(68 + (activeCity.offsets.tempRise > 1.0 ? 8 : 22))}% stability</span> under active adaptation profiles.
            </div>

            <SectionHeader title="Planetary Projections" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
              <div style={{ padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '10.5px' }} className="font-serif text-white/75 leading-relaxed">
                <div className="font-sans-editorial text-white/50 text-[8px] tracking-wider uppercase mb-0.5">CLIMATE ADAPTATION</div>
                {activeCity.details.climate}
              </div>
              <div style={{ padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '10.5px' }} className="font-serif text-white/75 leading-relaxed">
                <div className="font-sans-editorial text-white/50 text-[8px] tracking-wider uppercase mb-0.5">POWER GENERATION</div>
                {activeCity.details.energy}
              </div>
              <div style={{ padding: '4px 0', fontSize: '10.5px' }} className="font-serif text-white/75 leading-relaxed">
                <div className="font-sans-editorial text-white/50 text-[8px] tracking-wider uppercase mb-0.5">ORBITAL SATELLITE LINKS</div>
                {activeCity.details.satellites}
              </div>
            </div>

            <SectionHeader title="Futurologist Brief" />
            <div className="font-serif text-[11px] text-white/70 leading-relaxed mb-4">
              {generateCityProjections(activeCity, 'Ocean Monitoring', 2050).text}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => toggleBookmarkCity(activeCity.name)}
                className={`w-full py-1.5 text-[9px] tracking-widest uppercase border transition-all duration-300 font-sans-editorial ${
                  bookmarkedCities.includes(activeCity.name)
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-transparent border-white/10 hover:border-white hover:bg-white hover:text-black text-white'
                }`}
              >
                {bookmarkedCities.includes(activeCity.name) ? '🔖 BOOKMARKED' : 'BOOKMARK CITY'}
              </button>

              <button
                onClick={() => startReportGeneration(activeCity.name, 2050)}
                className="w-full py-1.5 text-[9px] tracking-widest uppercase border border-white/10 hover:border-white hover:bg-white hover:text-black bg-transparent text-white transition-all duration-300 font-sans-editorial"
              >
                GENERATE FORECAST REPORT
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM PANELS: Global Telemetry, Scanning Activity, Active Data Flows */}
      <div style={{
        position: 'fixed', bottom: 24, left: 40, right: 40,
        display: 'flex', gap: 12, zIndex: 30, pointerEvents: 'none',
        animation: 'fade-up 0.8s 1.0s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <div style={{ ...panelStyle, flex: 2 }}>
          {cornerAccent}
          <SectionHeader title="Global Telemetry" />
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span className="font-sans-editorial" style={{ fontSize: 6.5, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.15em' }}>DATA FLOW (PB/s)</span>
                <span className="font-sans-editorial" style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{dataFlow.toFixed(1)}</span>
              </div>
              <Sparkline color="#ffffff" height={40} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, marginBottom: 2 }}>
                <span className="font-sans-editorial" style={{ fontSize: 6.5, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.15em' }}>NETWORK NODES</span>
                <span className="font-sans-editorial" style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{(displayNodes / 1000).toFixed(0)}K</span>
              </div>
              <Sparkline color="#ffffff" height={36} />
            </div>
          </div>
        </div>

        <div style={{ ...panelStyle, flex: 1.2 }}>
          {cornerAccent}
          <SectionHeader title="Scanning Activity" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Climate Monitoring', val: 87 },
              { label: 'Ocean Monitoring',   val: 92 },
              { label: 'Biodiversity',        val: 74 },
              { label: 'Energy Grid',         val: 94 },
            ].map(({ label, val }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span className="font-sans-editorial" style={{ fontSize: 7, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em' }}>{label}</span>
                  <span className="font-sans-editorial" style={{ fontSize: 8, color: 'rgba(255,255,255,0.7)' }}>{val}%</span>
                </div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }}>
                  <div style={{ height: '100%', width: `${val}%`, background: 'rgba(255,255,255,0.4)', transition: 'width 1s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...panelStyle, flex: 1.6 }}>
          {cornerAccent}
          <SectionHeader title="Active Data Flows" />
          {[
            { route: 'ASIA → EUROPE',     val: 12.6 },
            { route: 'N. AMERICA → ASIA', val: 9.8  },
            { route: 'EUROPE → AFRICA',   val: 7.4  },
          ].map(({ route, val }) => (
            <div key={route} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
              <span className="font-sans-editorial" style={{ fontSize: 7, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em' }}>{route}</span>
              <span className="font-sans-editorial" style={{ fontSize: 8, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{val} PB/s</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 8, marginTop: 2 }}>
            <SectionHeader title="Time & Location" />
            <div className="font-sans-editorial" style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em' }}>{time}</div>
          </div>
        </div>
      </div>

      {/* FLOATING HOLOGRAPHIC REPORT GENERATOR OVERLAY */}
      {(generatingReport || activeReport) && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(2, 6, 17, 0.75)',
          backdropFilter: 'blur(12px)', zIndex: 100, display: 'flex',
          alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto'
        }}>
          <div style={{ ...panelStyle, width: '560px', height: '460px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {cornerAccent}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 10 }}>
              <span className="font-display text-[10px] text-white/50 tracking-[0.2em] font-light uppercase">
                CHRONOEARTH FUTURES COMMISSION // MATRIX ENGINE
              </span>
              <button 
                onClick={() => {
                  setGeneratingReport(false);
                  setActiveReport(null);
                }} 
                className="font-sans-editorial text-[9px] text-red-400 hover:text-red-300 uppercase tracking-widest bg-transparent border-none cursor-pointer"
              >
                [✕ CLOSE]
              </button>
            </div>

            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {!activeReport && reportLog.map((logLine, idx) => (
                <div key={idx} className="font-sans-editorial text-[9px] text-white/40 tracking-wider">
                  {logLine}
                </div>
              ))}

              {activeReport && (
                <div className="font-serif text-slate-200 text-xs leading-relaxed p-4 bg-white/[0.02] border border-white/5 rounded" style={{ whiteSpace: 'pre-wrap' }}>
                  {activeReport.text}
                </div>
              )}
            </div>

            {activeReport && (
              <div style={{ display: 'flex', gap: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
                <button
                  onClick={saveGeneratedReport}
                  className="flex-1 py-2 text-[9px] tracking-widest uppercase border border-white/10 hover:border-white hover:bg-white hover:text-black bg-transparent text-white transition-all duration-300 font-sans-editorial"
                >
                  SAVE BRIEF
                </button>
                <button
                  onClick={() => downloadReport(activeReport)}
                  className="flex-1 py-2 text-[9px] tracking-widest uppercase border border-white/10 hover:border-white hover:bg-white hover:text-black bg-transparent text-white transition-all duration-300 font-sans-editorial"
                >
                  DOWNLOAD BRIEF
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
