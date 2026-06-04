'use client';

import { useEffect, useRef, useState } from 'react';
import { CityData, citiesRawData, generateCityProjections } from '../data/citiesData';
import { 
  PREDICTIONS, 
  FUTUROLOGISTS, 
  KB_ARTICLES, 
  Prediction, 
  KBArticle, 
  Futurologist 
} from '../data/predictionsData';

const C = {
  emerald: '#00FF88',
  cyan:    '#00E5FF',
  iceBlue: '#00C8FF',
  white:   '#FFFFFF',
  bg:      'rgba(0,8,20,0.85)',
  border:  'rgba(0,229,255,0.18)',
  accentBg:'rgba(0,229,255,0.06)',
};

interface CyberHUDProps {
  activeTab: 'telemetry' | 'predictions' | 'kb' | 'reports' | 'saved';
  setActiveTab: (tab: any) => void;
  activeCity: CityData | null;
  setActiveCity: (city: CityData | null) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
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

// Sparkline mini chart
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
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = color;
      ctx.shadowBlur = 4;
      ctx.stroke();
    }, 80);
    return () => clearInterval(id);
  }, [color]);
  return <canvas ref={canvasRef} width={160} height={height} style={{ width: '100%', height: `${height}px` }} />;
}

// Circular gauge
function CircularGauge({ value, color, label }: { value: number; color: string; label: string }) {
  const r = 26; const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <svg width={64} height={64} viewBox="0 0 64 64">
        <circle cx={32} cy={32} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={4} />
        <circle cx={32} cy={32} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 32 32)"
          style={{ filter: `drop-shadow(0 0 4px ${color})`, transition: 'stroke-dashoffset 0.8s ease' }} />
        <text x={32} y={32} textAnchor="middle" dominantBaseline="middle" fill={color} fontSize={11} fontWeight={600} fontFamily="monospace">{value}%</text>
      </svg>
      <span style={{ fontSize: 6, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', textAlign: 'center' }}>{label}</span>
    </div>
  );
}

// Section header
function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
      <div style={{ width: 3, height: 10, background: C.cyan, boxShadow: `0 0 6px ${C.cyan}` }} />
      <span style={{ fontSize: 7, fontWeight: 600, letterSpacing: '0.30em', color: C.cyan, textTransform: 'uppercase', textShadow: `0 0 8px ${C.cyan}60` }}>
        {title}
      </span>
    </div>
  );
}

// Status row
function StatusRow({ label, value, color = C.emerald, blink = false }: { label: string; value: string | number; color?: string; blink?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
      <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{
        fontSize: 9, fontFamily: 'monospace', fontWeight: 600, color,
        textShadow: `0 0 10px ${color}80`,
        animation: blink ? 'hud-blink 2s ease-in-out infinite' : 'none',
      }}>{value}</span>
    </div>
  );
}

export default function CyberHUD({
  activeTab,
  setActiveTab,
  activeCity,
  setActiveCity,
  searchOpen,
  setSearchOpen
}: CyberHUDProps) {
  const [time, setTime] = useState('');
  const [nodeCount,  setNodeCount]  = useState(1247389);
  const [satCount,   setSatCount]   = useState(12842);
  const [beamCount,  setBeamCount]  = useState(834);
  const [dataFlow,   setDataFlow]   = useState(2.41);
  const [aiActivity, setAiActivity] = useState(98.7);

  // Platform states (Votes, Bookmarks, Search, Report Generator)
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [bookmarkedPreds, setBookmarkedPreds] = useState<string[]>([]);
  const [bookmarkedCities, setBookmarkedCities] = useState<string[]>([]);
  const [bookmarkedKB, setBookmarkedKB] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [kbFilter, setKbFilter] = useState<string>('ALL');
  const [expandedKbArticle, setExpandedKbArticle] = useState<string | null>(null);

  // Predictions filter states
  const [selectedYear, setSelectedYear] = useState<2030 | 2040 | 2050>(2050);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // AI report generator states
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportTargetCity, setReportTargetCity] = useState<string>('Tokyo');
  const [reportTargetYear, setReportTargetYear] = useState<2030 | 2040 | 2050>(2050);
  const [reportLog, setReportLog] = useState<string[]>([]);
  const [activeReport, setActiveReport] = useState<{ city: string; year: number; text: string } | null>(null);
  const [savedReports, setSavedReports] = useState<{ id: string; city: string; year: number; text: string; date: string }[]>([]);

  const displayNodes = useCounter(nodeCount, 2500);

  // Load state from local storage on mount
  useEffect(() => {
    try {
      const savedPreds = localStorage.getItem('chrono_bookmarked_preds');
      if (savedPreds) setBookmarkedPreds(JSON.parse(savedPreds));

      const savedCities = localStorage.getItem('chrono_bookmarked_cities');
      if (savedCities) setBookmarkedCities(JSON.parse(savedCities));

      const savedKB = localStorage.getItem('chrono_bookmarked_kb');
      if (savedKB) setBookmarkedKB(JSON.parse(savedKB));

      const savedVotes = localStorage.getItem('chrono_votes');
      if (savedVotes) setVotes(JSON.parse(savedVotes));

      const savedReps = localStorage.getItem('chrono_saved_reports');
      if (savedReps) setSavedReports(JSON.parse(savedReps));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Synchronize state changes to localStorage
  const handleVote = (id: string, dir: 'up' | 'down') => {
    const current = votes[id] || 0;
    const delta = dir === 'up' ? 1 : -1;
    const updated = { ...votes, [id]: current + delta };
    setVotes(updated);
    localStorage.setItem('chrono_votes', JSON.stringify(updated));
  };

  const toggleBookmarkPred = (id: string) => {
    let updated;
    if (bookmarkedPreds.includes(id)) {
      updated = bookmarkedPreds.filter(x => x !== id);
    } else {
      updated = [...bookmarkedPreds, id];
    }
    setBookmarkedPreds(updated);
    localStorage.setItem('chrono_bookmarked_preds', JSON.stringify(updated));
  };

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

  const toggleBookmarkKB = (id: string) => {
    let updated;
    if (bookmarkedKB.includes(id)) {
      updated = bookmarkedKB.filter(x => x !== id);
    } else {
      updated = [...bookmarkedKB, id];
    }
    setBookmarkedKB(updated);
    localStorage.setItem('chrono_bookmarked_kb', JSON.stringify(updated));
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
    setReportTargetCity(cityName);
    setReportTargetYear(yearNum);
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
          // Generate final forecast text
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
    const newReport = {
      id: `rep-${Date.now()}`,
      city: activeReport.city,
      year: activeReport.year,
      text: activeReport.text,
      date: new Date().toLocaleDateString()
    };
    const updated = [newReport, ...savedReports];
    setSavedReports(updated);
    localStorage.setItem('chrono_saved_reports', JSON.stringify(updated));
    alert('Report saved to your Saved Intelligence database!');
  };

  const deleteReport = (id: string) => {
    const updated = savedReports.filter(r => r.id !== id);
    setSavedReports(updated);
    localStorage.setItem('chrono_saved_reports', JSON.stringify(updated));
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
    background: C.bg,
    backdropFilter: 'blur(24px)',
    border: `1px solid ${C.border}`,
    borderRadius: '2px',
    padding: '14px 16px',
    boxShadow: `0 0 30px rgba(0,229,255,0.06), inset 0 0 20px rgba(0,229,255,0.02)`,
    position: 'relative',
    overflow: 'hidden',
    pointerEvents: 'auto',
  };

  const cornerAccent = (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 8, height: 8, borderTop: `1px solid ${C.cyan}`, borderLeft: `1px solid ${C.cyan}` }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderTop: `1px solid ${C.cyan}`, borderRight: `1px solid ${C.cyan}` }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: 8, height: 8, borderBottom: `1px solid ${C.cyan}`, borderLeft: `1px solid ${C.cyan}` }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderBottom: `1px solid ${C.cyan}`, borderRight: `1px solid ${C.cyan}` }} />
    </>
  );

  // Categories list for predictions feed
  const categories = ['ALL', 'AI', 'Climate', 'Energy', 'Space', 'Cities', 'Transport', 'Healthcare'];

  // Filtered Predictions list
  const filteredPredictions = PREDICTIONS.filter(p => {
    const matchYear = p.year === selectedYear;
    const matchCat = selectedCategory === 'ALL' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchYear && matchCat;
  });

  return (
    <>
      <style>{`
        @keyframes hud-blink {
          0%,100% { opacity:1; }
          50% { opacity:0.4; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
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

      {/* ── SEARCH OVERLAY MODAL ──────────────────────────────────────────────── */}
      {searchOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,4,10,0.60)',
          backdropFilter: 'blur(8px)', zIndex: 99, display: 'flex',
          alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto'
        }} onClick={() => setSearchOpen(false)}>
          <div style={{
            ...panelStyle, width: '560px', maxHeight: '420px',
            display: 'flex', flexDirection: 'column', gap: 14
          }} onClick={e => e.stopPropagation()}>
            {cornerAccent}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <SectionHeader title="Global Platform Search Engine" />
              <button onClick={() => setSearchOpen(false)} style={{ background: 'none', border: 'none', color: C.cyan, cursor: 'pointer', fontSize: 10 }}>[✕ CLOSE]</button>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                autoFocus
                placeholder="Search cities, future technologies, forecasting models..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', background: 'rgba(0,10,25,0.85)',
                  border: `1px solid ${C.cyan}40`, outline: 'none', color: '#fff',
                  fontFamily: 'monospace', fontSize: 11, borderRadius: 2,
                  boxShadow: `0 0 14px rgba(0,229,255,0.08)`
                }}
              />
              <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 11 }}>🔍</span>
            </div>

            {/* Results container */}
            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {searchQuery.trim().length === 0 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.12em' }}>
                  AWAITING PARAMETERS... ENTER QUERY TO INDEX THE CHRONO-DATABASE.
                </div>
              ) : (
                (() => {
                  const q = searchQuery.toLowerCase();
                  const cityMatches = citiesRawData.filter(c => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q));
                  const techMatches = KB_ARTICLES.filter(t => t.title.toLowerCase().includes(q) || t.shortDesc.toLowerCase().includes(q));
                  const predMatches = PREDICTIONS.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));

                  if (cityMatches.length === 0 && techMatches.length === 0 && predMatches.length === 0) {
                    return (
                      <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 9, color: C.cyan, letterSpacing: '0.1em' }}>
                        NO INDEX ENTRIES FOUND MATCHING QUERY.
                      </div>
                    );
                  }

                  return (
                    <>
                      {/* Cities matches */}
                      {cityMatches.length > 0 && (
                        <div>
                          <div style={{ fontSize: 7, color: 'rgba(0,229,255,0.5)', letterSpacing: '0.15em', marginBottom: 6 }}>🏙️ CITIES MATCHED</div>
                          {cityMatches.map(c => (
                            <div key={c.name}
                              onClick={() => {
                                const fullCityObj = citiesRawData.find(cr => cr.name === c.name);
                                if (fullCityObj) setActiveCity(fullCityObj);
                                setSearchOpen(false);
                              }}
                              style={{
                                padding: '8px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,229,255,0.08)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4,
                                cursor: 'pointer', borderRadius: 1
                              }}
                            >
                              <span style={{ fontSize: 9, color: '#fff', fontWeight: 500 }}>{c.name}, {c.country}</span>
                              <span style={{ fontSize: 7, color: C.cyan, letterSpacing: '0.1em' }}>[LOCATE ON GLOBE]</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tech matches */}
                      {techMatches.length > 0 && (
                        <div>
                          <div style={{ fontSize: 7, color: 'rgba(0,229,255,0.5)', letterSpacing: '0.15em', marginBottom: 6 }}>⚡ FUTURE TECH & KNOWLEDGE</div>
                          {techMatches.map(t => (
                            <div key={t.id}
                              onClick={() => {
                                setKbFilter('ALL');
                                setExpandedKbArticle(t.id);
                                setActiveTab('kb');
                                setSearchOpen(false);
                              }}
                              style={{
                                padding: '8px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,229,255,0.08)',
                                display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 4,
                                cursor: 'pointer', borderRadius: 1
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 9, color: '#fff', fontWeight: 500 }}>{t.title}</span>
                                <span style={{ fontSize: 7, color: C.emerald }}>[{t.category.toUpperCase()}]</span>
                              </div>
                              <span style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.40)' }}>{t.shortDesc}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Predictions matches */}
                      {predMatches.length > 0 && (
                        <div>
                          <div style={{ fontSize: 7, color: 'rgba(0,229,255,0.5)', letterSpacing: '0.15em', marginBottom: 6 }}>🔮 GLOBAL FORECAST PREDICTIONS</div>
                          {predMatches.map(p => (
                            <div key={p.id}
                              onClick={() => {
                                setSelectedYear(p.year);
                                setSelectedCategory(p.category);
                                setActiveTab('predictions');
                                setSearchOpen(false);
                              }}
                              style={{
                                padding: '8px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,229,255,0.08)',
                                display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 4,
                                cursor: 'pointer', borderRadius: 1
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 9, color: '#fff', fontWeight: 500 }}>{p.title}</span>
                                <span style={{ fontSize: 7, color: C.iceBlue }}>[{p.year} · {p.category.toUpperCase()}]</span>
                              </div>
                              <span style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.40)' }}>{p.description.slice(0, 80)}...</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── GLOBAL VIEWPORTS ──────────────────────────────────────────────────── */}

      {/* VIEW: TELEMETRY (Original Layout) */}
      {activeTab === 'telemetry' && (
        <>
          {/* LEFT HUD: LIVE PLANET STATUS */}
          <div style={{
            position: 'fixed', left: 40, top: '50%', transform: 'translateY(-50%)',
            zIndex: 30, width: 200, pointerEvents: 'none',
            animation: 'fade-up 0.8s 0.6s cubic-bezier(0.22,1,0.36,1) both',
          }}>
            <div style={panelStyle}>
              {cornerAccent}
              <SectionHeader title="Live Planet Status" />

              <StatusRow label="AI Activity"    value={`${aiActivity}%`} color={C.emerald} />
              <StatusRow label="Data Flow"      value={`${dataFlow} PB/s`} color={C.cyan} />
              <StatusRow label="Network Nodes"  value={displayNodes.toLocaleString()} color={C.white} />
              <StatusRow label="Satellites"     value={satCount.toLocaleString()} color={C.iceBlue} />
              <StatusRow label="Uplink Beams"   value={beamCount.toString()} color={C.cyan} />
              <StatusRow label="System Health"  value="OPTIMAL" color={C.emerald} blink />

              <div style={{ marginTop: 12, marginBottom: 4 }}>
                <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.2em', marginBottom: 4 }}>DATA FLOW</div>
                <Sparkline color={C.emerald} height={32} />
              </div>
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.2em', marginBottom: 4 }}>NETWORK NODES</div>
                <Sparkline color={C.cyan} height={28} />
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: ORBITAL LAYERS / CITY INTELLIGENCE PANEL */}
          <div style={{
            position: 'fixed', right: 40, top: '50%', transform: 'translateY(-50%)',
            zIndex: 30, width: 210, pointerEvents: 'none',
            animation: 'fade-up 0.8s 0.8s cubic-bezier(0.22,1,0.36,1) both',
          }}>
            {activeCity === null ? (
              // Normal Orbital Layers Panel
              <div style={panelStyle}>
                {cornerAccent}
                <SectionHeader title="Orbital Layers" />

                {[
                  { label: 'LEO Network',        sub: '550 km',           color: C.cyan,    sats: 12, active: true },
                  { label: 'MEO Network',        sub: '3,200 km',         color: C.iceBlue, sats: 8,  active: true },
                  { label: 'GEO Network',        sub: '10,000 km',        color: C.emerald, sats: 5,  active: true },
                ].map(({ label, sub, color, sats, active }) => (
                  <div key={label} style={{ marginBottom: 10, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ marginTop: 2, width: 7, height: 7, borderRadius: '50%', background: color,
                      boxShadow: active ? `0 0 8px ${color}` : 'none', flexShrink: 0,
                      animation: active ? 'data-pulse 2s ease-in-out infinite' : 'none' }} />
                    <div>
                      <div style={{ fontSize: 8, color: C.white, letterSpacing: '0.12em' }}>{label}</div>
                      <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.08em', marginTop: 1 }}>{sub}</div>
                      <div style={{ fontSize: 6, color, marginTop: 2, letterSpacing: '0.1em' }}>{sats} SATELLITES</div>
                    </div>
                  </div>
                ))}

                <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 4, paddingTop: 10 }}>
                  <SectionHeader title="Data Legend" />
                  {[
                    { color: C.white,    symbol: '◉', label: '8 Major AI Hubs' },
                    { color: C.emerald,  symbol: '●', label: 'Other Cities' },
                    { color: C.iceBlue,  symbol: '◌', label: 'Telemetry Stations' },
                    { color: C.cyan,     symbol: '—', label: 'Highways' },
                    { color: C.white,    symbol: '↑', label: 'Uplink Beams' },
                    { color: C.cyan,     symbol: '○', label: 'Rotating Scan Ring' },
                  ].map(({ color, symbol, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                      <span style={{ fontSize: 9, color, textShadow: `0 0 6px ${color}`, width: 12, textAlign: 'center', flexShrink: 0 }}>{symbol}</span>
                      <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.40)', letterSpacing: '0.1em' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // City Intelligence Panel (Phase 1, Requirement 2)
              <div style={{ ...panelStyle, maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }} className="custom-scrollbar">
                {cornerAccent}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <span style={{ fontSize: 6, color: C.cyan, letterSpacing: '0.2em' }}>CITY PROTOCOL ACTIVE</span>
                  <button onClick={() => setActiveCity(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.40)', cursor: 'pointer', fontSize: 8 }}>[DISMISS]</button>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', color: C.white, textTransform: 'uppercase' }}>
                  {activeCity.name}
                </div>
                <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 6 }}>
                  COORDINATES: {activeCity.lat.toFixed(4)}° N, {activeCity.lon.toFixed(4)}° E
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-around', margin: '4px 0 10px 0', borderBottom: `1px solid ${C.border}`, paddingBottom: 10 }}>
                  <CircularGauge value={68 + (activeCity.offsets.tempRise > 1.0 ? 8 : 22)} color={C.emerald} label="Climate Status" />
                  <CircularGauge value={75 + (activeCity.offsets.popGrowth > 1.08 ? 19 : 8)} color={C.cyan} label="AI Integration" />
                </div>

                <SectionHeader title="Future Matrix telemetry" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                  <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.02)', borderLeft: `2px solid ${C.emerald}`, fontSize: 7.5 }}>
                    <div style={{ color: C.emerald, fontWeight: 500, fontSize: 6, letterSpacing: '0.08em', marginBottom: 2 }}>CLIMATE ADAPTATION</div>
                    {activeCity.details.climate}
                  </div>
                  <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.02)', borderLeft: `2px solid ${C.cyan}`, fontSize: 7.5 }}>
                    <div style={{ color: C.cyan, fontWeight: 500, fontSize: 6, letterSpacing: '0.08em', marginBottom: 2 }}>POWER GENERATION</div>
                    {activeCity.details.energy}
                  </div>
                  <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.02)', borderLeft: `2px solid ${C.iceBlue}`, fontSize: 7.5 }}>
                    <div style={{ color: C.iceBlue, fontWeight: 500, fontSize: 6, letterSpacing: '0.08em', marginBottom: 2 }}>ORBITAL SATELLITE LINKS</div>
                    {activeCity.details.satellites}
                  </div>
                </div>

                <SectionHeader title="Futuristic Forecaster" />
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.70)', lineHeight: '1.4em', marginBottom: 10, fontFamily: 'monospace' }}>
                  {generateCityProjections(activeCity, 'Ocean Monitoring', 2050).text}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button
                    onClick={() => toggleBookmarkCity(activeCity.name)}
                    style={{
                      width: '100%', padding: '7px 0', border: '1px solid rgba(0,229,255,0.25)',
                      background: bookmarkedCities.includes(activeCity.name) ? 'rgba(0,229,255,0.18)' : 'transparent',
                      color: C.white, fontSize: 7.5, letterSpacing: '0.15em', fontWeight: 500,
                      cursor: 'pointer', borderRadius: 2, transition: 'all 0.3s ease'
                    }}
                  >
                    {bookmarkedCities.includes(activeCity.name) ? '🔖 CITY BOOKMARKED' : '🔖 BOOKMARK CITY'}
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('reports');
                      startReportGeneration(activeCity.name, 2050);
                    }}
                    style={{
                      width: '100%', padding: '7px 0', border: 'none',
                      background: `linear-gradient(90deg, ${C.cyan}, ${C.emerald})`,
                      color: '#000', fontSize: 7.5, letterSpacing: '0.15em', fontWeight: 600,
                      cursor: 'pointer', borderRadius: 2, transition: 'all 0.3s ease',
                      boxShadow: `0 0 14px ${C.cyan}30`
                    }}
                  >
                    ⚡ GENERATE FORECAST REPORT
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
            {/* Global Telemetry */}
            <div style={{ ...panelStyle, flex: 2 }}>
              {cornerAccent}
              <SectionHeader title="Global Telemetry" />
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 6, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.15em' }}>DATA FLOW (PB/s)</span>
                    <span style={{ fontSize: 9, color: C.emerald, fontFamily: 'monospace', fontWeight: 600 }}>{dataFlow.toFixed(1)}</span>
                  </div>
                  <Sparkline color={C.emerald} height={40} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 6, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.15em' }}>NETWORK NODES</span>
                    <span style={{ fontSize: 9, color: C.cyan, fontFamily: 'monospace', fontWeight: 600 }}>{(displayNodes / 1000).toFixed(0)}K</span>
                  </div>
                  <Sparkline color={C.cyan} height={36} />
                </div>
              </div>
            </div>

            {/* Scanning Activity */}
            <div style={{ ...panelStyle, flex: 1.2 }}>
              {cornerAccent}
              <SectionHeader title="Scanning Activity" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Climate Monitoring', val: 87, color: C.emerald },
                  { label: 'Ocean Monitoring',   val: 92, color: C.cyan },
                  { label: 'Biodiversity',        val: 74, color: C.iceBlue },
                  { label: 'Energy Grid',         val: 94, color: C.emerald },
                ].map(({ label, val, color }) => (
                  <div key={label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 6, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.1em' }}>{label}</span>
                      <span style={{ fontSize: 7, color, fontFamily: 'monospace' }}>{val}%</span>
                    </div>
                    <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1 }}>
                      <div style={{ height: '100%', width: `${val}%`, background: color, borderRadius: 1, boxShadow: `0 0 6px ${color}80`, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Data Flows */}
            <div style={{ ...panelStyle, flex: 1.6 }}>
              {cornerAccent}
              <SectionHeader title="Active Data Flows" />
              {[
                { route: 'ASIA → EUROPE',     val: 12.6 },
                { route: 'N. AMERICA → ASIA', val: 9.8  },
                { route: 'EUROPE → AFRICA',   val: 7.4  },
              ].map(({ route, val }) => (
                <div key={route} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                  <span style={{ fontSize: 6.5, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em' }}>{route}</span>
                  <span style={{ fontSize: 8, color: C.cyan, fontFamily: 'monospace', fontWeight: 600 }}>{val} PB/s</span>
                </div>
              ))}
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 2 }}>
                <SectionHeader title="Time & Location" />
                <div style={{ fontSize: 8, color: C.emerald, fontFamily: 'monospace', letterSpacing: '0.15em' }}>{time}</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* VIEW: PREDICTIONS FEED (Phase 1, Requirement 1 & Phase 2, Requirement 6/7) */}
      {activeTab === 'predictions' && (
        <div style={{
          position: 'fixed', left: 40, top: '100px', bottom: '40px',
          width: '380px', pointerEvents: 'none', zIndex: 30,
          display: 'flex', flexDirection: 'column', gap: 12
        }}>
          <div style={{ ...panelStyle, height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cornerAccent}
            <SectionHeader title="Global Futures Predictions" />
            
            {/* Year selector filters */}
            <div style={{ display: 'flex', gap: 6, margin: '2px 0 6px 0' }}>
              {([2030, 2040, 2050] as const).map(yr => {
                const isSelected = selectedYear === yr;
                return (
                  <button
                    key={yr}
                    onClick={() => setSelectedYear(yr)}
                    style={{
                      flex: 1, padding: '6px 0', border: '1px solid rgba(0,229,255,0.18)',
                      background: isSelected ? 'rgba(0,229,255,0.15)' : 'rgba(0,10,25,0.3)',
                      color: isSelected ? C.cyan : 'rgba(0,229,255,0.5)',
                      fontWeight: isSelected ? 600 : 300,
                      fontSize: 8.5, letterSpacing: '0.1em', cursor: 'pointer',
                      borderRadius: 1, transition: 'all 0.3s ease',
                      boxShadow: isSelected ? '0 0 10px rgba(0,229,255,0.15)' : 'none'
                    }}
                  >
                    {yr} FORECAST
                  </button>
                );
              })}
            </div>

            {/* Category filter badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
              {categories.map(cat => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '4px 8px', border: 'none',
                      background: isSelected ? C.cyan : 'rgba(255,255,255,0.04)',
                      color: isSelected ? '#000' : 'rgba(255,255,255,0.50)',
                      fontSize: 7, fontWeight: isSelected ? 600 : 300,
                      letterSpacing: '0.08em', cursor: 'pointer',
                      borderRadius: 1, transition: 'all 0.2s ease',
                      textTransform: 'uppercase'
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Predictions list scroll container */}
            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredPredictions.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.30)' }}>
                  NO INTEL RECORDS COMPILED FOR THIS FILTER COMBINATION.
                </div>
              ) : (
                filteredPredictions.map(pred => {
                  const saved = bookmarkedPreds.includes(pred.id);
                  const predVotes = (votes[pred.id] || 0) + pred.initialVotes;
                  const authorObj = FUTUROLOGISTS.find(f => f.name === pred.author);

                  return (
                    <div key={pred.id} style={{
                      padding: '10px 12px', background: 'rgba(255,255,255,0.015)',
                      border: '1px solid rgba(0,229,255,0.08)', borderRadius: 2,
                      display: 'flex', flexDirection: 'column', gap: 8,
                      position: 'relative'
                    }}>
                      {/* Top Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          padding: '2px 6px', background: 'rgba(0,255,136,0.08)',
                          color: C.emerald, fontSize: 6.5, fontWeight: 500,
                          borderRadius: 1, letterSpacing: '0.08em'
                        }}>
                          {pred.category.toUpperCase()}
                        </span>
                        <button
                          onClick={() => toggleBookmarkPred(pred.id)}
                          style={{ background: 'none', border: 'none', color: saved ? C.cyan : 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 9 }}
                          title="Bookmark Prediction"
                        >
                          {saved ? '🔖 SAVED' : '🔖 SAVE'}
                        </button>
                      </div>

                      {/* Content */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <div style={{ fontSize: 9.5, fontWeight: 600, color: C.white }}>{pred.title}</div>
                        <div style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.55)', lineHeight: '1.4em' }}>{pred.description}</div>
                      </div>

                      {/* Footer: Author info & Voting */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 8, marginTop: 2 }}>
                        {/* Author */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} title={authorObj?.bio}>
                          {authorObj && (
                            <img src={authorObj.avatar} alt={pred.author} style={{ width: 16, height: 16, borderRadius: '50%', border: `1px solid ${C.cyan}40` }} />
                          )}
                          <span style={{ fontSize: 7, color: C.iceBlue }}>{pred.author}</span>
                        </div>

                        {/* Voting system */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button
                            onClick={() => handleVote(pred.id, 'up')}
                            style={{ background: 'none', border: 'none', color: C.emerald, cursor: 'pointer', fontSize: 9, fontWeight: 600 }}
                          >
                            ▲
                          </button>
                          <span style={{ fontSize: 8, fontFamily: 'monospace', color: C.white, minWidth: 20, textAlign: 'center' }}>
                            {predVotes}
                          </span>
                          <button
                            onClick={() => handleVote(pred.id, 'down')}
                            style={{ background: 'none', border: 'none', color: 'rgba(255,0,0,0.6)', cursor: 'pointer', fontSize: 9, fontWeight: 600 }}
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: KNOWLEDGE BASE (Phase 1, Requirement 4) */}
      {activeTab === 'kb' && (
        <div style={{
          position: 'fixed', left: 40, right: 40, top: '100px', bottom: '40px',
          zIndex: 30, pointerEvents: 'none'
        }}>
          <div style={{ ...panelStyle, height: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {cornerAccent}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <SectionHeader title="Futuristic Knowledge Base Hub" />
              <button
                onClick={() => setExpandedKbArticle(null)}
                style={{
                  background: 'none', border: 'none', color: C.cyan,
                  cursor: 'pointer', fontSize: 8, letterSpacing: '0.1em',
                  display: expandedKbArticle ? 'block' : 'none'
                }}
              >
                [← RETURN TO GRID]
              </button>
            </div>

            {/* Articles filters */}
            {!expandedKbArticle && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['ALL', 'Technologies', 'Future Jobs', 'Climate', 'Energy', 'Space'].map(cat => {
                  const isSelected = kbFilter === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setKbFilter(cat)}
                      style={{
                        padding: '5px 12px', border: 'none',
                        background: isSelected ? C.cyan : 'rgba(255,255,255,0.04)',
                        color: isSelected ? '#000' : 'rgba(255,255,255,0.5)',
                        fontSize: 8, fontWeight: isSelected ? 600 : 300,
                        cursor: 'pointer', borderRadius: 1, textTransform: 'uppercase'
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Content pane */}
            <div style={{ flex: 1, minHeight: 0 }} className="custom-scrollbar">
              {expandedKbArticle ? (
                // Article Detail View
                (() => {
                  const art = KB_ARTICLES.find(x => x.id === expandedKbArticle);
                  if (!art) return null;
                  const isSaved = bookmarkedKB.includes(art.id);
                  return (
                    <div style={{ display: 'flex', gap: 20, height: '100%' }}>
                      {/* Left info column */}
                      <div style={{ width: '220px', borderRight: `1px solid ${C.border}`, paddingRight: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>RESOURCE SCHEMATICS</div>
                        <div>
                          <div style={{ fontSize: 6.5, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>CATEGORY</div>
                          <span style={{ fontSize: 9, color: C.cyan, textTransform: 'uppercase' }}>{art.category}</span>
                        </div>
                        <div>
                          <div style={{ fontSize: 6.5, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>DEPLOYMENT READINESS</div>
                          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, margin: '4px 0' }}>
                            <div style={{ height: '100%', width: `${art.readinessIndex}%`, background: C.emerald, borderRadius: 2, boxShadow: `0 0 6px ${C.emerald}` }} />
                          </div>
                          <span style={{ fontSize: 9, color: C.emerald, fontFamily: 'monospace' }}>{art.readinessIndex}% Readiness Index</span>
                        </div>
                        <div>
                          <div style={{ fontSize: 6.5, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>BIOSPHERE IMPACT LEVEL</div>
                          <span style={{
                            fontSize: 7.5, color: art.impactLevel === 'Critical' ? '#FF5555' : C.white,
                            padding: '2px 6px', background: 'rgba(255,255,255,0.04)', borderRadius: 1
                          }}>{art.impactLevel.toUpperCase()}</span>
                        </div>
                        <button
                          onClick={() => toggleBookmarkKB(art.id)}
                          style={{
                            width: '100%', padding: '6px 0', border: '1px solid rgba(0,229,255,0.2)',
                            background: isSaved ? 'rgba(0,229,255,0.12)' : 'transparent',
                            color: C.white, fontSize: 8, cursor: 'pointer', borderRadius: 1, marginTop: 'auto'
                          }}
                        >
                          {isSaved ? '🔖 BOOKMARKED' : '🔖 BOOKMARK RESOURCE'}
                        </button>
                      </div>

                      {/* Right article text */}
                      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }} className="custom-scrollbar">
                        <div style={{ fontSize: 16, fontWeight: 600, color: C.white }}>{art.title}</div>
                        <div style={{ fontSize: 10, color: C.cyan, fontStyle: 'italic' }}>{art.shortDesc}</div>
                        <div style={{
                          fontSize: 10, color: 'rgba(255,255,255,0.7)', lineHeight: '1.6em',
                          fontFamily: 'monospace', background: 'rgba(255,255,255,0.01)',
                          padding: '12px 14px', border: '1px solid rgba(255,255,255,0.03)',
                          borderRadius: 2
                        }}>
                          {art.content}
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                // Article Grid View
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, height: '100%', overflowY: 'auto', paddingBottom: 10 }} className="custom-scrollbar">
                  {KB_ARTICLES.filter(art => kbFilter === 'ALL' || art.category === kbFilter).map(art => (
                    <div
                      key={art.id}
                      onClick={() => setExpandedKbArticle(art.id)}
                      style={{
                        padding: '12px 14px', background: 'rgba(0,12,28,0.3)',
                        border: '1px solid rgba(0,229,255,0.08)', borderRadius: 2,
                        cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8,
                        transition: 'all 0.3s ease', position: 'relative'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'rgba(0,229,255,0.3)';
                        e.currentTarget.style.background = 'rgba(0,12,28,0.6)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(0,229,255,0.08)';
                        e.currentTarget.style.background = 'rgba(0,12,28,0.3)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 6.5, color: C.cyan, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{art.category}</span>
                        <span style={{ fontSize: 6.5, color: art.impactLevel === 'Critical' ? '#FF5555' : 'rgba(255,255,255,0.3)' }}>{art.impactLevel}</span>
                      </div>
                      <div style={{ fontSize: 10.5, fontWeight: 600, color: C.white }}>{art.title}</div>
                      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', flex: 1 }}>{art.shortDesc}</div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 8 }}>
                        <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>READINESS: {art.readinessIndex}%</span>
                        <span style={{ fontSize: 7.5, color: C.cyan }}>[READ LOGS]</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: REPORTS GENERATOR TERMINAL (Phase 3, Requirement 8) */}
      {activeTab === 'reports' && (
        <div style={{
          position: 'fixed', left: 40, right: 40, top: '100px', bottom: '40px',
          zIndex: 30, pointerEvents: 'none'
        }}>
          <div style={{ ...panelStyle, height: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {cornerAccent}
            <SectionHeader title="Futuristic AI Forecast Report Generator" />

            <div style={{ display: 'flex', gap: 20, height: '100%' }}>
              {/* Controls Column */}
              <div style={{ width: '220px', borderRight: `1px solid ${C.border}`, paddingRight: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>REPORT COMPILATION SETTINGS</div>
                
                <div>
                  <label style={{ fontSize: 6.5, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>TARGET GEOGRAPHY</label>
                  <select
                    value={reportTargetCity}
                    onChange={e => setReportTargetCity(e.target.value)}
                    style={{
                      width: '100%', padding: '6px 8px', background: 'rgba(0,10,25,0.85)',
                      border: '1px solid rgba(0,229,255,0.2)', color: C.cyan,
                      fontSize: 9, fontFamily: 'monospace', outline: 'none'
                    }}
                  >
                    {citiesRawData.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 6.5, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>TARGET CHRONO-YEAR</label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {([2030, 2040, 2050] as const).map(yr => (
                      <button
                        key={yr}
                        onClick={() => setReportTargetYear(yr)}
                        style={{
                          flex: 1, padding: '6px 0', border: '1px solid rgba(0,229,255,0.18)',
                          background: reportTargetYear === yr ? 'rgba(0,229,255,0.15)' : 'rgba(0,10,25,0.3)',
                          color: reportTargetYear === yr ? C.cyan : 'rgba(255,255,255,0.4)',
                          fontSize: 8.5, fontFamily: 'monospace', cursor: 'pointer'
                        }}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => startReportGeneration(reportTargetCity, reportTargetYear)}
                  disabled={generatingReport}
                  style={{
                    width: '100%', padding: '8px 0', border: 'none',
                    background: `linear-gradient(90deg, ${C.cyan}, ${C.emerald})`,
                    color: '#000', fontSize: 7.5, letterSpacing: '0.15em', fontWeight: 600,
                    cursor: generatingReport ? 'not-allowed' : 'pointer', borderRadius: 2, marginTop: 10,
                    boxShadow: `0 0 14px ${C.cyan}20`
                  }}
                >
                  {generatingReport ? 'GENERATING...' : 'INITIALIZE NEURAL REPORT'}
                </button>

                {activeReport && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 'auto' }}>
                    <button
                      onClick={saveGeneratedReport}
                      style={{
                        width: '100%', padding: '6px 0', border: '1px solid rgba(0,255,136,0.3)',
                        background: 'rgba(0,255,136,0.04)', color: C.emerald, fontSize: 8, cursor: 'pointer'
                      }}
                    >
                      💾 SAVE TO DATABASE
                    </button>
                    <button
                      onClick={() => downloadReport(activeReport)}
                      style={{
                        width: '100%', padding: '6px 0', border: '1px solid rgba(0,229,255,0.3)',
                        background: 'rgba(0,229,255,0.04)', color: C.cyan, fontSize: 8, cursor: 'pointer'
                      }}
                    >
                      📥 DOWNLOAD TXT FILE
                    </button>
                  </div>
                )}
              </div>

              {/* Terminal Display */}
              <div style={{
                flex: 1, background: 'rgba(0,4,10,0.95)', border: '1px solid rgba(0,229,255,0.12)',
                borderRadius: 2, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10
              }}>
                <div style={{ fontSize: 6.5, color: 'rgba(0,229,255,0.5)', letterSpacing: '0.15em', borderBottom: '1px solid rgba(0,229,255,0.12)', paddingBottom: 6 }}>
                  CHRONO_NEURAL_LOGS // CORE FORECASTER MAIN TERMINAL
                </div>

                <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'monospace', fontSize: 8.5 }}>
                  {/* Compilation Logs */}
                  {reportLog.map((logLine, idx) => (
                    <div key={idx} style={{ color: logLine.includes('COMPLETE') ? C.emerald : 'rgba(255,255,255,0.6)' }}>
                      {logLine}
                    </div>
                  ))}

                  {/* Generated Report Display */}
                  {activeReport && (
                    <div style={{
                      marginTop: 14, borderTop: '1px dashed rgba(0,229,255,0.2)', paddingTop: 14,
                      color: C.white, whiteSpace: 'pre-wrap', lineHeight: '1.6em', fontSize: 9.5
                    }}>
                      {activeReport.text}
                    </div>
                  )}

                  {!generatingReport && !activeReport && (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.20)', fontSize: 9 }}>
                      [TERMINAL STANDBY. SELECT CITY AND COMPILATION SETTINGS TO FORECAST THE TIMELINE]
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: SAVED INTELLIGENCE DATABASE (Phase 2, Requirement 6/7) */}
      {activeTab === 'saved' && (
        <div style={{
          position: 'fixed', left: 40, right: 40, top: '100px', bottom: '40px',
          zIndex: 30, pointerEvents: 'none'
        }}>
          <div style={{ ...panelStyle, height: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {cornerAccent}
            <SectionHeader title="Saved Intelligence Database" />

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', gap: 18, height: '100%', overflowY: 'auto' }} className="custom-scrollbar">
              {/* Bookmarked Predictions */}
              <div style={{ borderRight: `1px solid ${C.border}`, paddingRight: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 7, color: C.cyan, letterSpacing: '0.12em', borderBottom: '1px solid rgba(0,229,255,0.1)', paddingBottom: 4 }}>🔮 SAVED FORECASTS ({bookmarkedPreds.length})</div>
                <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {bookmarkedPreds.length === 0 ? (
                    <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>NO BOOKMARKED PREDICTIONS</div>
                  ) : (
                    bookmarkedPreds.map(id => {
                      const p = PREDICTIONS.find(x => x.id === id);
                      if (!p) return null;
                      return (
                        <div key={id} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(0,229,255,0.06)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                            <span style={{ fontSize: 8.5, fontWeight: 600, color: C.white }}>{p.title}</span>
                            <button onClick={() => toggleBookmarkPred(id)} style={{ background: 'none', border: 'none', color: '#ff5555', cursor: 'pointer', fontSize: 7 }}>[✕]</button>
                          </div>
                          <div style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.40)' }}>{p.description.slice(0, 100)}...</div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Bookmarked Cities */}
              <div style={{ borderRight: `1px solid ${C.border}`, paddingRight: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 7, color: C.emerald, letterSpacing: '0.12em', borderBottom: '1px solid rgba(0,229,255,0.1)', paddingBottom: 4 }}>🏙️ SAVED GEOGRAPHIES ({bookmarkedCities.length})</div>
                <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {bookmarkedCities.length === 0 ? (
                    <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>NO BOOKMARKED CITIES</div>
                  ) : (
                    bookmarkedCities.map(name => {
                      const c = citiesRawData.find(x => x.name === name);
                      if (!c) return null;
                      return (
                        <div key={name}
                          onClick={() => {
                            setActiveCity(c);
                            setActiveTab('telemetry');
                          }}
                          style={{
                            padding: '8px 10px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(0,255,136,0.06)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 8.5, fontWeight: 600, color: C.white }}>{c.name}</div>
                            <div style={{ fontSize: 6.5, color: 'rgba(255,255,255,0.40)' }}>{c.country}</div>
                          </div>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              toggleBookmarkCity(name);
                            }}
                            style={{ background: 'none', border: 'none', color: '#ff5555', cursor: 'pointer', fontSize: 7 }}
                          >
                            [✕]
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Saved Forecast Reports */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 7, color: C.iceBlue, letterSpacing: '0.12em', borderBottom: '1px solid rgba(0,229,255,0.1)', paddingBottom: 4 }}>📝 COMPILED REPORTS ({savedReports.length})</div>
                <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {savedReports.length === 0 ? (
                    <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>NO COMPILED REPORTS</div>
                  ) : (
                    savedReports.map(rep => (
                      <div key={rep.id} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(0,200,255,0.06)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                          <span style={{ fontSize: 8.5, fontWeight: 600, color: C.white }}>{rep.city} - {rep.year} Forecast</span>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => downloadReport(rep)} style={{ background: 'none', border: 'none', color: C.cyan, cursor: 'pointer', fontSize: 7 }}>[📥]</button>
                            <button onClick={() => deleteReport(rep.id)} style={{ background: 'none', border: 'none', color: '#ff5555', cursor: 'pointer', fontSize: 7 }}>[✕]</button>
                          </div>
                        </div>
                        <div style={{ fontSize: 6.5, color: 'rgba(255,255,255,0.40)' }}>COMPILED ON {rep.date}</div>
                        <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.60)', whiteSpace: 'pre-wrap', fontFamily: 'monospace', maxHeight: '50px', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 4 }}>
                          {rep.text.slice(0, 80)}...
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
