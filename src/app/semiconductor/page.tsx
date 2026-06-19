'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import BackgroundEffects from '@/components/BackgroundEffects';
import Footer from '@/components/Footer';
import SafeImage from '@/components/SafeImage';
import { SiliconAnalystsPayload } from '@/services/siliconAnalysts';

export default function SemiconductorBloombergTerminal() {
  const [semiData, setSemiData] = useState<SiliconAnalystsPayload | null>(null);
  const [semiError, setSemiError] = useState<string | null>(null);
  const [semiLoading, setSemiLoading] = useState<boolean>(true);
  const [selectedSubTab, setSelectedSubTab] = useState<string>('signals');

  useEffect(() => {
    async function loadTelemetry() {
      try {
        setSemiLoading(true);
        const res = await fetch('/api/semiconductor');
        const payload = await res.json();
        console.log("Breaking Signals Raw", payload?.data);
        if (payload.success && payload.data) {
          setSemiData(payload.data);
          console.log("Breaking Signals Count", payload.data.marketPulse?.length || 0);
        } else {
          setSemiError(payload.error || 'Semiconductor Intelligence temporarily unavailable');
        }
      } catch (err: any) {
        console.error('Failed to load semiconductor terminal:', err);
        setSemiError('Semiconductor Intelligence temporarily unavailable');
      } finally {
        setSemiLoading(false);
      }
    }
    loadTelemetry();
  }, []);

  // Category and company based image mappings with detailed priority resolution
  const getCompanyImage = (company: string, topic: string, apiImage?: string) => {
    // 1. API Image Priority
    if (apiImage) return apiImage;

    const term = `${company} ${topic}`.toLowerCase();

    // 2. Company Image Mapping Priority
    if (term.includes('nvidia')) return 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80'; // AI GPU Cluster
    if (term.includes('amd')) return 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=80'; // MI300 accelerators
    if (term.includes('intel')) return 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80'; // Foundries / fabs
    if (term.includes('tsmc')) return 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80'; // Wafer production
    if (term.includes('samsung')) return 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?w=600&auto=format&fit=crop&q=80'; // Memory fabs
    if (term.includes('micron')) return 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&auto=format&fit=crop&q=80'; // HBM memory
    if (term.includes('asml')) return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'; // EUV lithography machines
    if (term.includes('qualcomm')) return 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80'; // Mobile chipsets
    if (term.includes('broadcom')) return 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80'; // Networking silicon

    // 3. Topic Image Mapping Priority
    if (term.includes('hbm') || term.includes('memory') || term.includes('stack')) {
      return 'https://images.unsplash.com/photo-1562408590-e32931084e23?w=600&auto=format&fit=crop&q=80'; // Memory stack image
    }
    if (term.includes('packaging') || term.includes('cowos')) {
      return 'https://images.unsplash.com/photo-1631553127988-5184fb2c31cc?w=600&auto=format&fit=crop&q=80'; // chip packaging
    }
    if (term.includes('foundry') || term.includes('wafer') || term.includes('fabrication')) {
      return 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80'; // wafer fab
    }
    if (term.includes('geopolitics') || term.includes('trade') || term.includes('supply') || term.includes('geopolitical')) {
      return 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80'; // Supply chain map/network
    }
    if (term.includes('ai chip') || term.includes('gpu') || term.includes('accelerator') || term.includes('processor')) {
      return 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80'; // Datacenter accelerators
    }

    // 4. Category Image Mapping Priority / Universal Fallback
    return 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80'; // Cyber networking
  };

  // Importance Score calculation logic based on user specifications:
  // - market impact
  // - supply chain impact
  // - AI relevance
  // - geopolitical relevance
  const calculateScore = (headline: string, category: string, trend: string, severity: string) => {
    const text = (headline + ' ' + category).toLowerCase();
    let marketScore = 6;
    let supplyScore = 6;
    let aiScore = 6;
    let geoScore = 6;

    if (text.includes('tsmc') || text.includes('foundry') || text.includes('capacity') || text.includes('wafer')) {
      supplyScore += 18;
      marketScore += 10;
    }
    if (text.includes('nvidia') || text.includes('amd') || text.includes('b200') || text.includes('accelerator') || text.includes('h100')) {
      aiScore += 24;
      marketScore += 12;
    }
    if (text.includes('geopolitical') || text.includes('china') || text.includes('us') || text.includes('sanction') || text.includes('taiwan') || text.includes('export')) {
      geoScore += 24;
      supplyScore += 12;
    }
    if (text.includes('hbm') || text.includes('micron') || text.includes('samsung') || text.includes('cowos') || text.includes('packaging')) {
      supplyScore += 18;
      aiScore += 12;
    }
    if (severity === 'critical') {
      marketScore += 15;
      supplyScore += 15;
    } else if (severity === 'high') {
      marketScore += 10;
      supplyScore += 10;
    }

    return Math.min(99, Math.max(30, marketScore + supplyScore + aiScore + geoScore));
  };

  const processedSignals = (semiData?.marketPulse || []).map((sig: any, idx) => {
    const headline = sig?.headline || sig?.title || sig?.message || '';
    const category = sig?.category || 'General';
    const trend = sig?.trend || 'stable';
    const severity = sig?.severity || 'low';
    
    const headlineLower = headline.toLowerCase();
    let company = 'Semiconductor';
    const companies = ['NVIDIA', 'AMD', 'Intel', 'TSMC', 'Samsung', 'ASML', 'Micron', 'Qualcomm', 'Broadcom'];
    for (const comp of companies) {
      if (headlineLower.includes(comp.toLowerCase())) {
        company = comp;
        break;
      }
    }

    const score = calculateScore(headline, category, trend, severity);
    
    // Dynamic Strategic Impact rating based on importance & severity details
    let strategicImpact = 'Moderate manufacturing adjustments.';
    if (score >= 82) {
      strategicImpact = 'High-priority reallocation of supply node limits.';
    } else if (trend === 'up') {
      strategicImpact = 'Enhanced technology capability yield output.';
    } else if (trend === 'down') {
      strategicImpact = 'Logistical disruptions targeting fab operations.';
    }

    // Resolve priority mapping: 1. API image -> 2. Company image mapping -> 3. Topic image mapping -> 4. Category image mapping
    const apiImage = sig?.image_url || sig?.image; 
    const resolvedImage = getCompanyImage(company, category + ' ' + headline, apiImage);

    return {
      ...sig,
      id: `sig-${idx}`,
      headline,
      category,
      trend,
      severity,
      company,
      importanceScore: score,
      strategicImpact,
      image: resolvedImage
    };
  });

  // Terminal Subsections list: BREAKING SIGNALS AT THE TOP
  const tabs = [
    { id: 'signals', label: '1. Breaking Signals', desc: 'System intelligence feeds & reports' },
    { id: 'pulse', label: '2. Market Pulse', desc: 'Global semiconductor telemetry indicators' },
    { id: 'foundry', label: '3. Foundry Intelligence', desc: 'Wafer node pricing indexes' },
    { id: 'accelerators', label: '4. AI Chip Race', desc: 'AI GPUs margins & yields data' },
    { id: 'packaging', label: '5. HBM & Packaging', desc: 'CoWoS capacity & memory metrics' },
    { id: 'geopolitics', label: '6. Geopolitics Grid', desc: 'Trade, regulations & fab security' }
  ];

  return (
    <main className="min-h-screen w-full bg-[#02060A] text-[#e2e8f0] relative">
      <BackgroundEffects earthMode="cyber" />
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[rgba(2,6,10,0.95)] to-transparent pointer-events-none z-10" />
      <Navbar />

      <div className="content-container pt-32 pb-24 relative z-20 flex flex-col gap-8 animate-fade-up">
        {/* Terminal Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border border-indigo-500/20 bg-indigo-950/10 backdrop-blur-md rounded-lg p-6 gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono text-[#00E5FF] uppercase tracking-[0.3em] font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-[#00E5FF] rounded-full animate-ping" />
              SYSTEM ACTIVE // BLOOMBERG MODE
            </span>
            <h1 className="editorial-title text-white tracking-tight m-0 text-3xl font-light">
              Semiconductor <span className="text-[#00F5B0] font-normal">Terminal</span>
            </h1>
            <p className="text-[#7A8694] font-light text-xs max-w-2xl leading-relaxed m-0 font-mono">
              Terminal telemetry connection verified. Accessing live manufacturing wafer matrices, packaging expansion target stats, and geopolitical supply blockades.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 text-right font-mono">
            <div className="flex gap-2 items-center">
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded uppercase font-bold">
                Live Server Connection
              </span>
            </div>
            <span className="text-[10px] text-white/50">Source: Silicon Analysts API</span>
            <span className="text-[9px] text-[#7A8694]">
              Feed Synchronized: {semiData?.lastUpdated ? new Date(semiData.lastUpdated).toLocaleTimeString() : 'Pending Sync'}
            </span>
          </div>
        </div>

        {/* Bloomberg-Style Market Tickers Row */}
        {!semiLoading && !semiError && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 font-mono">
            {/* HBM Ticker */}
            <div className="bg-black/40 border border-white/5 p-3 rounded flex flex-col gap-1">
              <span className="text-[8px] text-white/40 uppercase">HBM Stack Cost</span>
              <span className="text-xs text-white font-bold">${semiData?.hbm?.costPerStackUsd || 1500}</span>
              <span className="text-[8px] text-emerald-400">▲ {semiData?.hbm?.trend || 'Stable'}</span>
            </div>
            {/* CoWoS Ticker */}
            <div className="bg-black/40 border border-white/5 p-3 rounded flex flex-col gap-1">
              <span className="text-[8px] text-white/40 uppercase">CoWoS Capacity</span>
              <span className="text-xs text-white font-bold">{(semiData?.cowosCapacity?.currentWspm || 45000).toLocaleString()} WSPM</span>
              <span className="text-[8px] text-indigo-400">Target {(semiData?.cowosCapacity?.targetWspm || 80000).toLocaleString()}</span>
            </div>
            {/* Wafer Node Index */}
            <div className="bg-black/40 border border-white/5 p-3 rounded flex flex-col gap-1">
              <span className="text-[8px] text-white/40 uppercase">TSMC N3 Wafer</span>
              <span className="text-xs text-[#00F5B0] font-bold">
                ${(semiData?.waferPricing.find(w => w.nodeName.includes('n3'))?.averagePriceUsd || 19500).toLocaleString()}
              </span>
              <span className="text-[8px] text-white/30">USD per wafer</span>
            </div>
            {/* AI Chip Index */}
            <div className="bg-black/40 border border-white/5 p-3 rounded flex flex-col gap-1">
              <span className="text-[8px] text-white/40 uppercase">NVIDIA H100 Margin</span>
              <span className="text-xs text-amber-400 font-bold">
                {semiData?.accelerators.find(a => a.acceleratorName.includes('H100'))?.grossMarginPercent || 78}%
              </span>
              <span className="text-[8px] text-[#7A8694]">High gross margin</span>
            </div>
            {/* Intel Foundry node pricing */}
            <div className="bg-black/40 border border-white/5 p-3 rounded flex flex-col gap-1">
              <span className="text-[8px] text-white/40 uppercase">Intel 18A Node</span>
              <span className="text-xs text-[#00E5FF] font-bold">
                ${(semiData?.waferPricing.find(w => w.nodeName.includes('18a'))?.averagePriceUsd || 15000).toLocaleString()}
              </span>
              <span className="text-[8px] text-emerald-400">92% Util quota</span>
            </div>
            {/* AMD MI300 Margin Ticker */}
            <div className="bg-black/40 border border-white/5 p-3 rounded flex flex-col gap-1">
              <span className="text-[8px] text-white/40 uppercase">AMD MI300X Cost</span>
              <span className="text-xs text-white font-bold">
                ${(semiData?.accelerators.find(a => a.acceleratorName.toLowerCase().includes('mi300'))?.totalManufacturingCostUsd || 4500).toLocaleString()}
              </span>
              <span className="text-[8px] text-white/40">Est. Mfg Cost</span>
            </div>
          </div>
        )}

        {/* Bloomberg-Style Workspace Layout (Sidebar Navigation + Workspace Panel) */}
        {semiError ? (
          <div className="py-16 text-center border border-rose-500/20 bg-rose-500/5 rounded-lg">
            <span className="text-sm font-mono text-rose-400">⚠️ {semiError}</span>
          </div>
        ) : semiLoading ? (
          <div className="py-24 text-center flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-indigo-500 border-t-transparent animate-spin" />
            <span className="text-xs font-mono text-indigo-400 animate-pulse uppercase tracking-wider">
              ESTABLISHING ENCRYPTED DATAFEED LINK...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            
            {/* Terminal Tab Bar Panel */}
            <div className="flex flex-col gap-2 bg-[#040b12]/60 border border-white/5 rounded p-4 font-mono">
              <span className="text-[9px] text-[#7A8694] uppercase tracking-widest pb-2 border-b border-white/5 mb-2 font-bold">
                TERMINAL SYSTEM DIRECTORY
              </span>
              {tabs.map((tab) => {
                const isActive = selectedSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedSubTab(tab.id)}
                    className={`flex flex-col gap-0.5 text-left p-3 rounded cursor-pointer transition-all duration-300 ${
                      isActive 
                        ? 'bg-indigo-500/10 border-l-2 border-indigo-500 text-white'
                        : 'text-white/50 border-l-2 border-transparent hover:text-white/80 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-xs font-bold uppercase">{tab.label}</span>
                    <span className="text-[9px] text-white/30 truncate max-w-[200px]">{tab.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Workspace details render panels */}
            <div className="lg:col-span-3 flex flex-col gap-6">

              {/* Sub-Tab 2: Semiconductor Market Pulse */}
              {selectedSubTab === 'pulse' && (
                <div className="flex flex-col gap-6">
                  <div className="border-b border-indigo-500/20 pb-3 flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">2. Semiconductor Market Pulse</span>
                    <span className="text-[9px] font-mono text-indigo-400">TELEMETRY GRID</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Packaging Details */}
                    <div className="premium-glass bg-black/40 border border-indigo-500/15 p-6 rounded flex flex-col gap-4">
                      <h4 className="text-xs font-mono text-[#00F5B0] uppercase m-0 border-b border-white/5 pb-2">Packaging Yield Matrix</h4>
                      <div className="flex flex-col gap-3 font-mono">
                        {semiData?.packagingCosts.map((p, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs border-b border-white/5 pb-1.5 last:border-0 last:pb-0">
                            <span className="text-white/80">{p.packagingType}</span>
                            <div className="text-right">
                              <div className="text-[#00F5B0] font-bold">${p.costUsd}</div>
                              <div className="text-[9px] text-[#7A8694]">Yield: {p.yieldRate}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stack breakdown */}
                    <div className="premium-glass bg-black/40 border border-indigo-500/15 p-6 rounded flex flex-col gap-4">
                      <h4 className="text-xs font-mono text-[#00E5FF] uppercase m-0 border-b border-white/5 pb-2">HBM Node Spec Allocations</h4>
                      <div className="flex flex-col gap-3 font-mono">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white/70">Silicon HBM Target</span>
                          <span className="text-white font-bold">HBM3e 12-Hi Stack</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white/70">Average Cost / Stack</span>
                          <span className="text-[#00F5B0] font-bold">${semiData?.hbm?.costPerStackUsd || 1500} USD</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white/70">Stacks per Accelerator</span>
                          <span className="text-white">{semiData?.hbm?.stacks || 8} Hi</span>
                        </div>
                        <div className="flex justify-between items-center text-xs border-t border-white/5 pt-2">
                          <span className="text-white/70">Yield Risk Coefficient</span>
                          <span className="text-amber-400">Moderate Stability</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab 1: Breaking Semiconductor Signals */}
              {selectedSubTab === 'signals' && (
                <div className="flex flex-col gap-6">
                  <div className="border-b border-indigo-500/20 pb-3 flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">1. Breaking Semiconductor Signals</span>
                    <span className="text-[9px] font-mono text-indigo-400">REAL-TIME FEEDS</span>
                  </div>

                  {processedSignals.length === 0 ? (
                    <div className="py-16 text-center border border-white/5 bg-black/40 rounded-lg font-mono">
                      <span className="text-xs text-white/50">No signals available</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {processedSignals.map((sig) => (
                        <div key={sig.id} className="premium-glass p-5 rounded border border-white/5 bg-[#040b12]/60 flex flex-col justify-between min-h-[320px] relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full pointer-events-none" />
                          <div className="flex flex-col gap-4">
                            <div className="flex gap-4 items-start">
                              {/* Compact Thumbnail Image */}
                              <div className="relative w-20 h-20 rounded overflow-hidden flex-shrink-0 border border-white/10 group-hover:border-indigo-500/30 transition-all duration-300">
                                <SafeImage
                                  src={sig.image}
                                  fallbackSrc="https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80"
                                  alt={sig.headline}
                                  fill
                                  sizes="80px"
                                  loading="lazy"
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <div className="flex-1 flex flex-col gap-1 min-w-0">
                                <div className="flex justify-between items-center text-[9px] font-mono">
                                  <span className="text-indigo-400 font-bold uppercase truncate max-w-[120px]">{sig.company}</span>
                                  <span className="text-white/40 truncate max-w-[100px]">{sig.date || 'Live Stream'}</span>
                                </div>
                                <h3 className="text-xs font-semibold font-mono text-white leading-normal m-0 group-hover:text-indigo-300 transition-colors">
                                  {sig.headline}
                                </h3>
                              </div>
                            </div>

                            <div className="bg-black/45 border border-indigo-500/10 p-2.5 rounded text-[10px] font-mono">
                              <div className="text-[#00E5FF] font-bold uppercase text-[8px] mb-0.5 tracking-wider">Strategic Impact</div>
                              <p className="text-white/80 m-0 leading-normal">{sig.strategicImpact}</p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-white/5 font-mono">
                            <div className="flex justify-between items-center text-[9px]">
                              <span className="text-white/40">Importance Score</span>
                              <span className="text-amber-400 font-bold">{sig.importanceScore}%</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]" style={{ width: `${sig.importanceScore}%` }} />
                            </div>
                            <div className="flex justify-between items-center text-[8px] text-[#7A8694] pt-1">
                              <span>Category: {sig.category}</span>
                              <span className="text-indigo-400 font-bold">Source: {sig.source}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Tab 3: Foundry Intelligence */}
              {selectedSubTab === 'foundry' && (
                <div className="flex flex-col gap-6">
                  <div className="border-b border-indigo-500/20 pb-3 flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">3. Foundry Intelligence Matrix</span>
                    <span className="text-[9px] font-mono text-[#00F5B0]">WAFER INDEX</span>
                  </div>

                  <div className="bg-[#040b12]/60 border border-indigo-500/10 rounded-lg p-6 flex flex-col gap-4 font-mono">
                    <h3 className="text-sm font-semibold text-white uppercase m-0 border-b border-white/5 pb-2">Global Wafer Production Pricing</h3>
                    <div className="flex flex-col gap-3">
                      {semiData?.waferPricing.map((w, idx) => (
                        <div key={idx} className="grid grid-cols-3 items-center text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0">
                          <span className="text-white font-bold">{w.nodeName}</span>
                          <span className="text-[#00F5B0] text-center">${w.averagePriceUsd.toLocaleString()} USD</span>
                          <div className="text-right flex flex-col gap-0.5">
                            <span className="text-white/60">{w.utilizationPercent}% Node Util</span>
                            <span className="text-[8px] text-[#7A8694]">Range: ${w.minPriceUsd.toLocaleString()} - ${w.maxPriceUsd.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab 4: AI Chip Race */}
              {selectedSubTab === 'accelerators' && (
                <div className="flex flex-col gap-6">
                  <div className="border-b border-indigo-500/20 pb-3 flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">4. AI Chip Race Telemetry</span>
                    <span className="text-[9px] font-mono text-amber-400">AI GPUS MARGINS</span>
                  </div>

                  {/* Vendor coverage warning if only NVIDIA returns */}
                  {semiData?.accelerators && !semiData.accelerators.some(a => a.vendor !== 'NVIDIA') && (
                    <div className="premium-glass bg-rose-950/20 border border-rose-500/30 p-3.5 rounded text-xs font-mono text-rose-400">
                      ⚠️ Limited vendor coverage from current feed
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {semiData?.accelerators.map((a, idx) => {
                      const costVal = a.totalManufacturingCostUsd;
                      const sellVal = a.estimatedSellingPriceUsd;
                      const marginVal = a.grossMarginPercent;

                      const mfgCostDisplay = costVal > 0 ? `$${costVal.toLocaleString()} USD` : 'Cost not disclosed';
                      const aspDisplay = sellVal > 0 ? `$${sellVal.toLocaleString()} USD` : 'ASIC (Internal / Rental)';
                      const marginDisplay = marginVal > 0 ? `${marginVal}%` : 'N/A';

                      return (
                        <div key={idx} className="premium-glass bg-[#040b12]/60 border border-white/5 p-5 rounded font-mono flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start border-b border-white/5 pb-2 mb-3">
                              <h4 className="text-xs text-white font-bold uppercase m-0">{a.acceleratorName}</h4>
                              <span className="text-[9px] bg-amber-400/15 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded">
                                {a.vendor}
                              </span>
                            </div>

                            <div className="flex flex-col gap-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-white/40">Manufacturing Node:</span>
                                <span className="text-white">{a.processNode || 'TSMC / Custom'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/40">Total Mfg Cost:</span>
                                <span className="text-white">{mfgCostDisplay}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/40">Estimated ASP:</span>
                                <span className="text-[#00F5B0] font-bold">{aspDisplay}</span>
                              </div>
                              <div className="flex justify-between border-t border-white/5 pt-2 mt-1">
                                <span className="text-white/40">Gross Margin:</span>
                                <span className="text-amber-400 font-bold">{marginDisplay}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-2 border-t border-white/5 text-[8px] text-[#7A8694] text-right">
                            Source: Silicon Analysts API
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sub-Tab 5: HBM & Packaging */}
              {selectedSubTab === 'packaging' && (
                <div className="flex flex-col gap-6">
                  <div className="border-b border-indigo-500/20 pb-3 flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">5. HBM & Packaging Allocation</span>
                    <span className="text-[9px] font-mono text-indigo-400">COWOS CAPACITY</span>
                  </div>

                  <div className="bg-[#040b12]/60 border border-indigo-500/10 p-6 rounded-lg font-mono flex flex-col gap-4">
                    <h3 className="text-sm font-semibold text-white uppercase m-0 border-b border-white/5 pb-2">Advanced Silicon Packaging Benchmark</h3>
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/60">TSMC CoWoS Allocation Cap</span>
                        <span className="text-[#00E5FF] font-bold">{(semiData?.cowosCapacity?.currentWspm || 45000).toLocaleString()} WSPM</span>
                      </div>
                      <div className="flex justify-between items-center text-xs pb-3 border-b border-white/5">
                        <span className="text-white/60">Global Utilization Target</span>
                        <span className="text-[#00F5B0] font-bold">{semiData?.cowosCapacity?.utilizationPercent || 98}% Capacity</span>
                      </div>
                      {semiData?.packagingCosts.map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs border-b border-white/5 pb-1.5 last:border-0 last:pb-0">
                          <span className="text-white/80">{p.packagingType}</span>
                          <span className="text-indigo-400 font-bold">${p.costUsd} USD</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab 6: Semiconductor Geopolitics */}
              {selectedSubTab === 'geopolitics' && (
                <div className="flex flex-col gap-6">
                  <div className="border-b border-indigo-500/20 pb-3 flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">6. Semiconductor Geopolitical Grid</span>
                    <span className="text-[9px] font-mono text-rose-400">TRADE DISRUPTIONS</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {processedSignals
                      .filter(s => s.category.toLowerCase().includes('geopolitics') || s.category.toLowerCase().includes('supply') || s.importanceScore >= 80)
                      .map((sig) => (
                        <div key={sig.id} className="premium-glass p-5 rounded border border-white/5 bg-[#040b12]/60 flex flex-col justify-between min-h-[300px]">
                          <div className="flex flex-col gap-4">
                            <div className="w-full h-28 rounded overflow-hidden relative border border-white/5">
                              <SafeImage
                                src={sig.image}
                                fallbackSrc="https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80"
                                alt={sig.headline}
                                fill
                                sizes="(max-width: 768px) 100vw, 300px"
                                loading="lazy"
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            </div>

                            <div className="flex justify-between items-center text-[9px] font-mono">
                              <span className="text-rose-400 uppercase font-semibold">{sig.company} • Geopolitical</span>
                              <span className="text-white/40">{sig.date || 'Live update'}</span>
                            </div>

                            <h3 className="text-xs font-semibold font-mono text-white/95 leading-normal m-0">{sig.headline}</h3>

                            <div className="bg-black/30 border border-rose-500/10 p-2 rounded text-[10px] font-mono">
                              <div className="text-rose-400 font-bold uppercase text-[8px] mb-0.5 font-sans">Geopolitical Impact Vector</div>
                              <p className="text-white/80 m-0 leading-normal">{sig.strategicImpact}</p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-white/5">
                            <div className="flex justify-between items-center text-[9px] font-mono">
                              <span className="text-white/40">Disruption Index</span>
                              <span className="text-rose-400 font-bold">{sig.importanceScore}%</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-rose-400" style={{ width: `${sig.importanceScore}%` }} />
                            </div>
                            <div className="flex justify-end text-[8px] text-[#7A8694] font-mono pt-1">
                              Source: Silicon Analysts API
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
