'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BackgroundEffects from '@/components/BackgroundEffects';
import { PREDICTIONS, FUTUROLOGISTS } from '@/data/predictionsData';

const C = {
  emerald: '#00F5B0',
  cyan: '#00D98F',
  iceBlue: '#00D98F',
  white: '#F5F7FA',
  bg: 'rgba(2, 8, 15, 0.75)',
  border: 'rgba(0, 245, 176, 0.15)',
};

export default function FeedPage() {
  const [votes, setVotes] = useState<Record<string, number>>({});

  // Load votes from localStorage
  useEffect(() => {
    try {
      const savedVotes = localStorage.getItem('chrono_votes');
      if (savedVotes) {
        setVotes(JSON.parse(savedVotes));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const getVotesCount = (p: any) => {
    return p.initialVotes + (votes[p.id] || 0);
  };

  // What's Hot (Top 2 predictions by votes)
  const hotPredictions = [...PREDICTIONS]
    .sort((a, b) => getVotesCount(b) - getVotesCount(a))
    .slice(0, 2);

  // What's New (Chronological - 2030 predictions)
  const newPredictions = PREDICTIONS.filter(p => p.year === 2030).slice(0, 4);

  // Trending sidebar (Sorted by votes, top 5)
  const trendingPredictions = [...PREDICTIONS]
    .sort((a, b) => getVotesCount(b) - getVotesCount(a))
    .slice(0, 5);

  // Categories list
  const feedCategories = ['AI', 'Climate', 'Cities', 'Energy', 'Space', 'Transport'];

  const panelStyle: React.CSSProperties = {
    background: C.bg,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${C.border}`,
    borderRadius: '4px',
    padding: '24px',
    boxShadow: '0 0 30px rgba(0,229,255,0.05)',
    position: 'relative',
    overflow: 'hidden',
  };

  const cornerAccent = (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 8, height: 8, borderTop: `1px solid ${C.cyan}`, borderLeft: `1px solid ${C.cyan}` }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderTop: `1px solid ${C.cyan}`, borderRight: `1px solid ${C.cyan}` }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: 8, height: 8, borderBottom: `1px solid ${C.cyan}`, borderLeft: `1px solid ${C.cyan}` }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderBottom: `1px solid ${C.cyan}`, borderRight: `1px solid ${C.cyan}` }} />
    </>
  );

  return (
    <main className="h-screen w-screen overflow-y-auto bg-[#02060A] text-[#e2e8f0] relative custom-scrollbar">
      <BackgroundEffects earthMode="cyber" />
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[rgba(2,8,15,0.95)] to-transparent pointer-events-none z-10" />
      <Navbar earthMode="cyber" />

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-24 relative z-20 flex flex-col gap-12">
        {/* Page Header */}
        <div className="flex flex-col gap-4 border-b border-[#00F5B0]/15 pb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#00F5B0] shadow-[0_0_10px_#00F5B0]" />
            <span className="text-xs font-semibold tracking-[0.4em] text-[#00F5B0] uppercase font-mono">
              FUTURES BROADCAST INTEL
            </span>
          </div>
          <h1 className="text-4xl font-light tracking-tight text-white uppercase">
            FORECASTS <span className="font-semibold text-[#00F5B0]">FEED</span>
          </h1>
          <p className="text-sm font-mono text-[#7A8694] max-w-2xl">
            Global timeline predictions streamed in real-time. Discover what is trending, explore new models, and jump into analysis sheets.
          </p>
        </div>

        {/* SECTION 1: WHAT'S HOT HERO SECTION */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-[10px] font-mono text-[#00F5B0]">
            <div className="w-2 h-2 rounded-full bg-[#00F5B0] animate-pulse" />
            <span>CRITICAL PATH // WHAT'S HOT</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {hotPredictions.map((p, idx) => {
              const authorObj = FUTUROLOGISTS.find(f => f.name === p.author);
              return (
                <div key={p.id} style={panelStyle} className="flex flex-col justify-between hover:border-[#00F5B0]/40 hover:shadow-[0_0_24px_rgba(0,245,176,0.1)] transition-colors min-h-[300px]">
                  {cornerAccent}
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-[9px] font-mono text-[#00F5B0]">
                      <span>{p.category.toUpperCase()} // REGION: {p.city}</span>
                      <span className="px-2 py-0.5 bg-[#040B12] border border-[#00F5B0]/20 rounded">{p.year} FORECAST</span>
                    </div>

                    <h2 className="text-2xl font-light tracking-wide text-white uppercase leading-snug">
                      {p.title}
                    </h2>
                    
                    <p className="text-sm text-slate-350 leading-relaxed font-sans line-clamp-4">
                      {p.description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center border-t border-[#00F5B0]/40 pt-4 mt-6">
                    {authorObj && (
                      <Link href={`/futurologists/${authorObj.slug}`} className="flex items-center gap-2 group">
                        <img src={authorObj.avatar} alt={p.author} className="w-6 h-6 rounded-full border border-[#00F5B0]/20 object-cover" />
                        <span className="text-[10px] font-mono text-[#7A8694] group-hover:text-white transition-colors">{p.author}</span>
                      </Link>
                    )}
                    <Link href={`/predictions/${p.slug}`} className="text-xs font-mono font-bold text-[#00F5B0] hover:underline uppercase">
                      Inspect Forecast &gt;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: MAIN COLUMN & SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Feed Column (Left) */}
          <div className="lg:col-span-2 flex flex-col gap-10">
            
            {/* What's New Section */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2 border-b border-[#00F5B0]/15 pb-3">
                <span className="text-xs font-mono font-bold tracking-widest text-[#00F5B0] uppercase">⚡ WHAT'S NEW</span>
              </div>

              <div className="flex flex-col gap-4">
                {newPredictions.map(p => (
                  <div key={p.id} style={panelStyle} className="p-5 flex flex-col gap-3 hover:border-[#00F5B0]/30 transition-colors">
                    {cornerAccent}
                    <div className="flex justify-between text-[8px] font-mono text-slate-400">
                      <span>{p.category.toUpperCase()} · {p.city}</span>
                      <span>YEAR: {p.year}</span>
                    </div>
                    <h3 className="text-base font-semibold uppercase text-white tracking-wide">{p.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{p.description}</p>
                    <div className="flex justify-between items-center text-[9px] font-mono border-t border-[#00F5B0]/30 pt-3 mt-1">
                      <span className="text-slate-500">AUTHOR: {p.author}</span>
                      <Link href={`/predictions/${p.slug}`} className="text-[#00F5B0] hover:underline uppercase font-bold">
                        Read full shards &gt;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Feed Shards */}
            {feedCategories.map(cat => {
              const catPreds = PREDICTIONS.filter(p => p.category === cat).slice(0, 2);
              if (catPreds.length === 0) return null;

              return (
                <div key={cat} className="flex flex-col gap-6">
                  <div className="flex items-center gap-2 border-b border-[#00F5B0]/15 pb-3">
                    <span className="text-xs font-mono font-bold tracking-widest text-[#00D98F] uppercase">🗂️ {cat} FORECASTS</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {catPreds.map(p => (
                      <Link href={`/predictions/${p.slug}`} key={p.id} style={panelStyle} className="hover:border-[#00F5B0]/40 hover:shadow-[0_0_24px_rgba(0,245,176,0.1)] transition-all flex flex-col justify-between min-h-[180px]">
                        {cornerAccent}
                        <div className="flex flex-col gap-3">
                          <span className="text-[7px] font-mono text-slate-500 tracking-wider uppercase">{p.year} · {p.city}</span>
                          <h4 className="text-sm font-semibold uppercase text-white tracking-wide line-clamp-2">{p.title}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{p.description}</p>
                        </div>
                        <div className="border-t border-[#00F5B0]/20 pt-2.5 mt-4 text-[9px] font-mono text-[#7A8694] uppercase tracking-widest flex justify-between items-center">
                          <span>By {p.author}</span>
                          <span>Read &gt;</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}

          </div>

          {/* Sidebar Column (Right) */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Trending Predictions */}
            <div style={panelStyle} className="flex flex-col gap-4">
              {cornerAccent}
              
              <div className="flex items-center gap-2 border-b border-[#00F5B0]/15 pb-3">
                <div className="w-1 h-3 bg-[#00F5B0] shadow-[0_0_6px_#00D98F]" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">📈 TRENDING MATRIX</span>
              </div>

              <div className="flex flex-col gap-5">
                {trendingPredictions.map((p, idx) => (
                  <Link 
                    href={`/predictions/${p.slug}`}
                    key={p.id} 
                    className="flex gap-4 items-start group hover:opacity-90 transition-opacity"
                  >
                    <span className="text-xl font-bold font-mono text-[#00F5B0]/35 group-hover:text-[#00F5B0] transition-colors leading-none w-6">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 flex flex-col gap-1 border-b border-[#00F5B0]/45 pb-3">
                      <h4 className="text-xs font-semibold uppercase text-white group-hover:text-[#00F5B0] transition-colors tracking-wide">
                        {p.title}
                      </h4>
                      <div className="flex justify-between items-center text-[7.5px] font-mono text-slate-500 uppercase mt-0.5">
                        <span>{p.category} · {p.year}</span>
                        <span className="text-[#00F5B0] font-bold">▲ {getVotesCount(p)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Metrics HUD */}
            <div style={panelStyle} className="flex flex-col gap-4">
              {cornerAccent}
              <div className="flex items-center gap-2 border-b border-[#00F5B0]/15 pb-2">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">🔬 SYSTEM READINGS</span>
              </div>
              <div className="flex flex-col gap-3 font-mono text-[9px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">QUANTUM FLOW</span>
                  <span className="text-[#00F5B0]">98.7% ACCURACY</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">INDEXED FIELDS</span>
                  <span className="text-white">12,842 CONCEPTS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">DECISION ALIGNED</span>
                  <span className="text-[#00F5B0]">COOPERATIVE</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
