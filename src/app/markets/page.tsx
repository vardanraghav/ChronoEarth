'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BackgroundEffects from '@/components/BackgroundEffects';
import { useMarketOverview } from '@/hooks/useMarketOverview';
import { useSemiconductorNews } from '@/hooks/useSemiconductorNews';

const COMPANY_MAP: Record<string, {
  ticker: string;
  name: string;
  codex: { id: string; title: string; category: string; desc: string }[];
  predictions: { slug: string; title: string; year: number; category: string }[];
  supplyChain: {
    status: string;
    riskLevel: string;
    leadTime: string;
    assessment: string;
  };
}> = {
  NVIDIA: {
    ticker: 'NVDA',
    name: 'NVIDIA',
    codex: [
      { id: 'kb-6', title: 'Quantum Grid Architect', category: 'FUTURE JOBS', desc: 'Designing quantum entangled infrastructure communication loops.' },
      { id: 'layer-tech', title: 'AI & Technology Backbone', category: 'THEMATIC LAYER', desc: 'Monitors the planetary logical operations system.' }
    ],
    predictions: [
      { slug: 'quantum-weather-supercomputers', title: 'Quantum Weather Supercomputers', year: 2040, category: 'AI' },
      { slug: 'earth-wide-cybernetic-singularity', title: 'Earth-wide Cybernetic Singularity', year: 2050, category: 'AI' }
    ],
    supplyChain: {
      status: 'Highly Entangled',
      riskLevel: 'CRITICAL',
      leadTime: '6.2 months',
      assessment: 'Critical dependencies on sub-2nm foundry nodes. Securing packaging loops in Singapore is vital to offset shipping bottlenecks.'
    }
  },
  AMD: {
    ticker: 'AMD',
    name: 'AMD',
    codex: [
      { id: 'kb-6', title: 'Quantum Grid Architect', category: 'FUTURE JOBS', desc: 'Designing quantum entangled infrastructure communication loops.' },
      { id: 'layer-tech', title: 'AI & Technology Backbone', category: 'THEMATIC LAYER', desc: 'Monitors the planetary logical operations system.' }
    ],
    predictions: [
      { slug: 'quantum-weather-supercomputers', title: 'Quantum Weather Supercomputers', year: 2040, category: 'AI' },
      { slug: 'earth-wide-cybernetic-singularity', title: 'Earth-wide Cybernetic Singularity', year: 2050, category: 'AI' }
    ],
    supplyChain: {
      status: 'Diversified',
      riskLevel: 'HIGH',
      leadTime: '4.8 months',
      assessment: 'Arizona fab ramps help offset local logistical bottlenecks, but high-end memory packaging remains heavily clustered in Asia.'
    }
  },
  Intel: {
    ticker: 'INTC',
    name: 'Intel',
    codex: [
      { id: 'kb-8', title: 'Decentralized Fab Alliances', category: 'GEOPOLITICS', desc: 'Bypasses traditional shipping bottlenecks through localized fabrication nodes.' },
      { id: 'layer-tech', title: 'AI & Technology Backbone', category: 'THEMATIC LAYER', desc: 'Monitors the planetary logical operations system.' }
    ],
    predictions: [
      { slug: 'ai-decides-regional-agriculture', title: 'AI Decides Regional Agriculture', year: 2030, category: 'AI' },
      { slug: 'nanobot-synthetic-immune-systems', title: 'Nanobot Synthetic Immune Systems', year: 2050, category: 'Healthcare' }
    ],
    supplyChain: {
      status: 'Inland Hub Protected',
      riskLevel: 'LOW',
      leadTime: '5.1 months',
      assessment: 'Arizona Fab 52 and Ohio sites provide robust supply chain isolation under block alliances. Vulnerabilities reside in component sourcing.'
    }
  },
  TSMC: {
    ticker: 'TSM',
    name: 'TSMC',
    codex: [
      { id: 'kb-8', title: 'Decentralized Fab Alliances', category: 'GEOPOLITICS', desc: 'Bypasses traditional shipping bottlenecks through localized fabrication nodes.' },
      { id: 'layer-tech', title: 'AI & Technology Backbone', category: 'THEMATIC LAYER', desc: 'Monitors the planetary logical operations system.' }
    ],
    predictions: [
      { slug: 'debris-sweeper-satellites-patrol-leo', title: 'Debris Sweeper Satellites Patrol LEO', year: 2030, category: 'Space' },
      { slug: 'asteroid-mining-ship-returns-with-metals', title: 'Asteroid Mining Ship Returns with Metals', year: 2050, category: 'Space' }
    ],
    supplyChain: {
      status: 'Primary Foundry Loop',
      riskLevel: 'EXTREME',
      leadTime: '3.5 months',
      assessment: 'Foundry nodes face extreme geopolitical risk. Disruptions on coastal Taiwan lines would freeze 74% of global AI hardware yield.'
    }
  },
  ASML: {
    ticker: 'ASML',
    name: 'ASML',
    codex: [
      { id: 'kb-8', title: 'Decentralized Fab Alliances', category: 'GEOPOLITICS', desc: 'Bypasses traditional shipping bottlenecks through localized fabrication nodes.' },
      { id: 'layer-tech', title: 'AI & Technology Backbone', category: 'THEMATIC LAYER', desc: 'Monitors the planetary logical operations system.' }
    ],
    predictions: [
      { slug: 'debris-sweeper-satellites-patrol-leo', title: 'Debris Sweeper Satellites Patrol LEO', year: 2030, category: 'Space' },
      { slug: 'asteroid-mining-ship-returns-with-metals', title: 'Asteroid Mining Ship Returns with Metals', year: 2050, category: 'Space' }
    ],
    supplyChain: {
      status: 'Equipment Monopolist',
      riskLevel: 'HIGH',
      leadTime: '14.2 months',
      assessment: 'Lithography production is a global single point of failure. Extreme lead times for EUV machinery restrict high-NA wafer ramp-ups.'
    }
  },
  Qualcomm: {
    ticker: 'QCOM',
    name: 'Qualcomm',
    codex: [
      { id: 'kb-6', title: 'Quantum Grid Architect', category: 'FUTURE JOBS', desc: 'Designing quantum entangled infrastructure communication loops.' },
      { id: 'layer-tech', title: 'AI & Technology Backbone', category: 'THEMATIC LAYER', desc: 'Monitors the planetary logical operations system.' }
    ],
    predictions: [
      { slug: 'autonomous-transit-zones-in-europe', title: 'Autonomous Transit Zones in Europe', year: 2030, category: 'Transport' },
      { slug: 'vacuum-tube-hyperloop-global-web', title: 'Vacuum Tube Hyperloop Global Web', year: 2050, category: 'Transport' }
    ],
    supplyChain: {
      status: 'Edge Network Bound',
      riskLevel: 'MEDIUM',
      leadTime: '4.2 months',
      assessment: 'Heavy reliance on third-party foundry contracts for edge processing units. Blockades on shipping paths present serious threats.'
    }
  },
  Micron: {
    ticker: 'MU',
    name: 'Micron',
    codex: [
      { id: 'layer-tech', title: 'AI & Technology Backbone', category: 'THEMATIC LAYER', desc: 'Monitors the planetary logical operations system.' }
    ],
    predictions: [
      { slug: 'quantum-weather-supercomputers', title: 'Quantum Weather Supercomputers', year: 2040, category: 'AI' }
    ],
    supplyChain: {
      status: 'Memory Bloc Centered',
      riskLevel: 'LOW',
      leadTime: '3.8 months',
      assessment: 'Robust memory fabrication nodes inland. Strong structural alignment with Western block alliances minimizes routing risks.'
    }
  },
  'Samsung Semiconductor': {
    ticker: 'SMSN',
    name: 'Samsung Semiconductor',
    codex: [
      { id: 'kb-8', title: 'Decentralized Fab Alliances', category: 'GEOPOLITICS', desc: 'Bypasses traditional shipping bottlenecks through localized fabrication nodes.' },
      { id: 'layer-tech', title: 'AI & Technology Backbone', category: 'THEMATIC LAYER', desc: 'Monitors the planetary logical operations system.' }
    ],
    predictions: [
      { slug: 'ai-decides-regional-agriculture', title: 'AI Decides Regional Agriculture', year: 2030, category: 'AI' }
    ],
    supplyChain: {
      status: 'Vertically Integrated',
      riskLevel: 'MEDIUM',
      leadTime: '4.5 months',
      assessment: 'Internal memory and foundry systems offer insulation, though raw material chemical blocks are exposed to East Asian tariff loops.'
    }
  }
};

export default function MarketsDashboard() {
  const { snapshots, loading: marketLoading, error: marketError, refetch: refetchMarkets } = useMarketOverview();
  const [selectedCompany, setSelectedCompany] = useState<string | undefined>(undefined);
  const { semiNews, loading: newsLoading, error: newsError, refetch: refetchNews } = useSemiconductorNews(selectedCompany);

  const handleSyncAll = () => {
    refetchMarkets();
    refetchNews();
  };

  const activeCompany = selectedCompany || 'NVIDIA';

  return (
    <main className="min-h-screen text-white relative overflow-x-hidden pb-12" style={{ background: '#02060A' }}>
      {/* Navbar */}
      <Navbar />

      {/* Atmospheric Starfield */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <BackgroundEffects earthMode="cyber" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 text-[#00F5B0] font-mono text-xs uppercase tracking-[0.25em] mb-1">
              <span>📈 SEMICONDUCTOR & MARKET TRACKING</span>
            </div>
            <h1 className="text-3xl font-light tracking-wider uppercase">
              Technology Market <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#00F5B0] to-[#0A84FF]">Intelligence</span>
            </h1>
          </div>

          <button
            onClick={handleSyncAll}
            className="premium-glass px-5 py-2.5 rounded-full text-xs font-mono tracking-wider border border-[#00F5B0]/20 hover:border-[#00F5B0] hover:shadow-[0_0_15px_rgba(0,245,176,0.3)] transition-all duration-300 cursor-pointer"
          >
            🔄 SYNC TICKER & CHIP FEEDS
          </button>
        </div>

        {/* Stock Tickers Panel */}
        <div className="mb-8">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-3">GLOBAL HARDWARE STOCKS (ALPHA VANTAGE)</span>
          {marketLoading ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-[#00F5B0]/20 border-t-[#00F5B0] rounded-full animate-spin" />
            </div>
          ) : marketError ? (
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-center text-xs font-mono text-red-400">
              Failed to query stock prices. Using fallback cached data.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {snapshots.map((snap) => {
                const isDown = snap.change < 0;
                return (
                  <div
                    key={snap.ticker}
                    onClick={() => {
                      // Find company mapping to this ticker
                      const foundCompany = Object.keys(COMPANY_MAP).find(k => COMPANY_MAP[k].ticker === snap.ticker);
                      if (foundCompany) {
                        setSelectedCompany(foundCompany);
                      }
                    }}
                    className={`premium-glass p-4 rounded-2xl border flex flex-col justify-between hover:border-[#00F5B0]/40 transition-all duration-300 cursor-pointer ${
                      COMPANY_MAP[activeCompany]?.ticker === snap.ticker ? 'border-[#00F5B0]/50 shadow-[0_0_15px_rgba(0,245,176,0.15)] bg-[#00F5B0]/5' : 'border-white/5'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold font-mono tracking-wider">{snap.ticker}</span>
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                          isDown ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                        }`}
                      >
                        {isDown ? '▼' : '▲'} {snap.change_percent}
                      </span>
                    </div>
                    <div>
                      <span className="text-xl font-bold font-mono">${snap.price.toFixed(2)}</span>
                      <div className="flex justify-between text-[9px] font-mono text-white/40 mt-1">
                        <span>Vol: {(snap.volume / 1000000).toFixed(1)}M</span>
                        <span style={{ color: isDown ? '#EF4444' : '#10B981' }}>
                          {isDown ? '' : '+'}{snap.change.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Semiconductor Intelligence Center */}
        {(() => {
          const companyInfo = COMPANY_MAP[activeCompany] || COMPANY_MAP['NVIDIA'];
          const stockQuote = snapshots.find(s => s.ticker === companyInfo.ticker);
          const isDownStock = stockQuote ? stockQuote.change < 0 : false;

          return (
            <div className="premium-glass p-6 rounded-2xl border border-white/5 mb-8 flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#00F5B0]/5 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-4 gap-4 z-10">
                <div>
                  <span className="text-[10px] font-mono text-[#00F5B0] uppercase tracking-wider">SEMICONDUCTOR COGNITIVE COUPLING // COMMAND STATION</span>
                  <h2 className="text-lg font-light tracking-wide uppercase mt-1">
                    {activeCompany} <span className="font-semibold text-[#00F5B0]">INTELLIGENCE SHARDS</span>
                  </h2>
                </div>
                
                {/* Clickable tabs for the tracked companies */}
                <div className="flex flex-wrap gap-1.5">
                  {['NVIDIA', 'AMD', 'Intel', 'TSMC', 'ASML', 'Qualcomm'].map(c => {
                    const isActive = activeCompany === c;
                    return (
                      <button
                        key={c}
                        onClick={() => setSelectedCompany(c)}
                        className={`px-3 py-1 text-[10px] font-mono rounded-full border transition-all duration-300 cursor-pointer ${
                          isActive 
                            ? 'bg-[#00F5B0]/10 border-[#00F5B0] text-[#00F5B0] shadow-[0_0_10px_rgba(0,245,176,0.2)] font-semibold'
                            : 'bg-transparent border-white/10 text-white/50 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 z-10">
                {/* 1. Stock Data Card */}
                <div className="p-4 bg-black/45 border border-white/5 rounded-xl flex flex-col justify-between min-h-[140px] hover:border-[#00F5B0]/20 transition-all">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-mono text-[#00F5B0] uppercase tracking-wider">STOCK TELEMETRY ({companyInfo.ticker || 'N/A'})</span>
                      {stockQuote && (
                        <span
                          className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                            isDownStock ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                          }`}
                        >
                          {isDownStock ? '▼' : '▲'} {stockQuote.change_percent}
                        </span>
                      )}
                    </div>
                    {stockQuote ? (
                      <div>
                        <span className="text-3xl font-bold font-mono text-white">${stockQuote.price.toFixed(2)}</span>
                        <div className="flex justify-between text-[10px] font-mono text-white/40 mt-2">
                          <span>Vol: {(stockQuote.volume / 1000000).toFixed(1)}M</span>
                          <span style={{ color: isDownStock ? '#EF4444' : '#10B981' }}>
                            {isDownStock ? '' : '+'}{stockQuote.change.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs font-mono text-white/40 py-2">
                        Telemetry stream offline. Check API integration key.
                      </div>
                    )}
                  </div>
                  <div className="border-t border-white/5 pt-2 mt-2">
                    <span className="text-[8px] font-mono text-white/30">Alpha Vantage Realtime Feed</span>
                  </div>
                </div>

                {/* 2. Codex Shards */}
                <div className="flex flex-col gap-3">
                  <span className="text-[9px] font-mono text-[#00F5B0] uppercase tracking-wider">RELEVANT CODEX SHARDS</span>
                  <div className="flex flex-col gap-2">
                    {companyInfo.codex.map(item => (
                      <Link 
                        key={item.id}
                        href={`/knowledge?article=${item.id}`}
                        className="p-3 bg-black/45 hover:bg-[#00F5B0]/5 border border-white/5 hover:border-[#00F5B0]/30 rounded-xl no-underline group transition-all flex flex-col gap-0.5"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] font-mono text-[#00F5B0] uppercase tracking-wider">{item.category}</span>
                          <span className="text-[8px] font-mono text-white/30">ID: {item.id.toUpperCase()}</span>
                        </div>
                        <h4 className="text-xs font-semibold text-white group-hover:text-[#00F5B0] m-0 transition-colors font-mono">{item.title}</h4>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* 3. Future Predictions */}
                <div className="flex flex-col gap-3">
                  <span className="text-[9px] font-mono text-[#00F5B0] uppercase tracking-wider">TIMELINE ANOMALIES & PREDICTIONS</span>
                  <div className="flex flex-col gap-2">
                    {companyInfo.predictions.map(pred => (
                      <Link 
                        key={pred.slug}
                        href={`/predictions/${pred.slug}`}
                        className="p-3 bg-black/45 hover:bg-[#0A84FF]/5 border border-white/5 hover:border-[#0A84FF]/30 rounded-xl no-underline group transition-all flex flex-col gap-0.5"
                      >
                        <div className="flex justify-between items-center text-[8px] font-mono text-white/40">
                          <span className="text-[#0A84FF]">{pred.category} {"//"} {pred.year} FORECAST</span>
                        </div>
                        <h4 className="text-xs font-semibold text-white group-hover:text-[#0A84FF] m-0 transition-colors font-mono truncate">{pred.title}</h4>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* 4. Supply Chain Impact */}
                <div className="flex flex-col gap-3">
                  <span className="text-[9px] font-mono text-[#00F5B0] uppercase tracking-wider">SUPPLY CHAIN IMPACT</span>
                  <div className="p-4 bg-black/45 border border-white/5 rounded-xl flex flex-col justify-between min-h-[140px] hover:border-[#00F5B0]/20 transition-all text-xs font-mono">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-white/45 text-[9px]">Risk Level:</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                        companyInfo.supplyChain.riskLevel === 'EXTREME' || companyInfo.supplyChain.riskLevel === 'CRITICAL'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : (companyInfo.supplyChain.riskLevel === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20')
                      }`}>
                        {companyInfo.supplyChain.riskLevel}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between">
                        <span className="text-white/45">Status:</span>
                        <span className="text-white/90">{companyInfo.supplyChain.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/45">Lead Time:</span>
                        <span className="text-[#00F5B0]">{companyInfo.supplyChain.leadTime}</span>
                      </div>
                      <div className="border-t border-white/5 pt-2 mt-1">
                        <p className="text-[10px] text-white/50 leading-relaxed font-sans font-light m-0">
                          {companyInfo.supplyChain.assessment}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Bottom Section: Chip News Feed and Filter */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1 & 2: Chip News Feed */}
          <div className="lg:col-span-2 premium-glass rounded-2xl border border-white/5 p-6 shadow-xl flex flex-col h-[650px]">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 flex-wrap gap-2">
              <div>
                <span className="text-[10px] font-mono text-[#00F5B0] uppercase tracking-wider">CHIP INDUSTRY NEWS</span>
                <h3 className="text-sm font-semibold uppercase mt-0.5">Supply Chain & Tech Tracker</h3>
              </div>

              {/* Company Filter Dropdown */}
              <select
                value={selectedCompany || ''}
                onChange={(e) => setSelectedCompany(e.target.value ? e.target.value : undefined)}
                className="premium-glass bg-black/40 text-white border border-white/10 rounded-full px-4 py-1.5 text-[10px] font-mono focus:outline-none"
              >
                <option value="">All Companies</option>
                {['NVIDIA', 'AMD', 'Intel', 'TSMC', 'ASML', 'Qualcomm', 'Micron', 'Samsung Semiconductor'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 pr-2">
              {newsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-8 h-8 border-2 border-[#00F5B0]/20 border-t-[#00F5B0] rounded-full animate-spin" />
                  <span className="text-xs font-mono text-white/45">Fetching industry updates...</span>
                </div>
              ) : newsError ? (
                <div className="text-center py-20 text-xs font-mono text-white/40">
                  Failed to load news feed.
                </div>
              ) : semiNews.length === 0 ? (
                <div className="text-center py-20 text-xs font-mono text-white/40">
                  No articles currently recorded for this filter.
                </div>
              ) : (
                semiNews.map((news) => (
                  <a
                    key={news.id}
                    href={news.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="premium-glass rounded-xl p-4 border border-white/5 hover:border-[#00F5B0]/30 hover:bg-[#00F5B0]/5 transition-all duration-300 flex flex-col md:flex-row gap-4 no-underline group"
                  >
                    {news.image_url && (
                      <div className="w-full md:w-28 h-20 rounded-lg overflow-hidden bg-black/20 shrink-0">
                        <img
                          src={news.image_url}
                          alt="article preview"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-mono text-[#00F5B0] uppercase tracking-wider bg-[#00F5B0]/10 border border-[#00F5B0]/20 px-2 py-0.5 rounded">
                          {news.company}
                        </span>
                        <span className="text-[9px] font-mono text-white/40">
                          {new Date(news.published_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-white/90 group-hover:text-[#00F5B0] transition-colors line-clamp-1">{news.title}</h4>
                      <p className="text-[11px] text-white/60 leading-relaxed mt-1 font-sans line-clamp-2">
                        {news.description}
                      </p>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>

          {/* Column 3: Silicon Trends & Fabrication Nodes Info */}
          <div className="flex flex-col gap-8">
            
            {/* Fabrication Nodes Status */}
            <div className="premium-glass rounded-2xl border border-white/5 p-6 shadow-xl">
              <span className="text-[10px] font-mono text-[#00F5B0] uppercase tracking-wider block mb-4">FABRICATION NODE STATUS</span>
              
              <div className="flex flex-col gap-3 font-mono text-xs">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex justify-between text-white/80 font-bold mb-1">
                    <span>ASML High-NA EUV</span>
                    <span className="text-[#00F5B0]">ONLINE</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-[#00F5B0]" style={{ width: '95%' }} />
                  </div>
                  <span className="text-[8px] text-white/40 block mt-1.5">Node target: 1.4nm (A14) lithography standard.</span>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex justify-between text-white/80 font-bold mb-1">
                    <span>TSMC Fab 20 (Hsinchu)</span>
                    <span className="text-[#00F5B0]">ONLINE</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-[#00F5B0]" style={{ width: '85%' }} />
                  </div>
                  <span className="text-[8px] text-white/40 block mt-1.5">Production phase: 2nm mass yield ramp.</span>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex justify-between text-white/80 font-bold mb-1">
                    <span>Intel Fab 52 (Arizona)</span>
                    <span className="text-[#0A84FF]">RAMPING</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-[#0A84FF]" style={{ width: '60%' }} />
                  </div>
                  <span className="text-[8px] text-white/40 block mt-1.5">Target process: Intel 18A sub-2nm.</span>
                </div>
              </div>
            </div>

            {/* Supply Chain Security Index */}
            <div className="premium-glass rounded-2xl border border-white/5 p-6 shadow-xl">
              <span className="text-[10px] font-mono text-[#00F5B0] uppercase tracking-wider block mb-3">SUPPLY CHAIN SECURITY</span>
              <h3 className="text-sm font-semibold uppercase mt-0.5 mb-4">Risk Vectors</h3>
              
              <div className="flex flex-col gap-3 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-white/50">Decentralization:</span>
                  <span className="text-[#00F5B0] font-bold">85% (Safe)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Logistics Vulnerability:</span>
                  <span className="text-[#FF0055] font-bold">Medium Risk</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">High-End Yield Rates:</span>
                  <span className="text-white/80 font-bold">72% Average</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}
