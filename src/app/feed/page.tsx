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

      <div className="content-container pt-32 pb-20 relative z-20 flex flex-col gap-10 animate-fade-up">
        {/* Page Header */}
        <div className="flex flex-col gap-3 border-b border-[#00F5B0]/15 pb-6">
          <h1 className="editorial-title text-white">
            Forecasts <span className="text-[#00F5B0] font-normal">Feed</span>
          </h1>
          <p className="editorial-subtitle text-[#7A8694]">
            Global timeline predictions simulated in real-time. Review upcoming milestones, analyze systemic indicators, and participate in discussion logs.
          </p>
        </div>

        {/* Main Grid: Left Column for Editorial News, Right Column for Trending */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-start">
          
          {/* Left Column: Editorial Articles */}
          <div className="flex flex-col gap-8">
            
            {/* Top Story - Large Editorial Feature Card */}
            {hotPredictions[0] && (() => {
              const p = hotPredictions[0];
              const authorObj = FUTUROLOGISTS.find(f => f.name === p.author);
              return (
                <div className="card-tier-1 flex flex-col justify-between min-h-[340px]">
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-[10px] font-mono text-[#00F5B0]">
                      <span className="uppercase tracking-wider">{p.category} // {p.city}</span>
                      <span className="px-2.5 py-0.5 bg-[#02060A] border border-[#00F5B0]/20 rounded font-bold uppercase">{p.year} TARGET</span>
                    </div>

                    <h2 className="text-3xl font-light text-white uppercase tracking-tight leading-tight">
                      {p.title}
                    </h2>
                    
                    <p className="text-sm text-[#7A8694] leading-relaxed line-clamp-3">
                      {p.description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center border-t border-[#00F5B0]/15 pt-4 mt-6">
                    {authorObj && (
                      <Link href={`/futurologists/${authorObj.slug}`} className="flex items-center gap-2 group">
                        <img src={authorObj.avatar} alt={p.author} className="w-7 h-7 rounded-full border border-[#00F5B0]/20 object-cover" />
                        <span className="text-[10px] font-mono text-[#7A8694] group-hover:text-white transition-colors uppercase">{p.author}</span>
                      </Link>
                    )}
                    <Link href={`/predictions/${p.slug}`} className="text-xs font-mono text-[#00F5B0] hover:underline uppercase font-bold tracking-wider">
                      Read Analysis &gt;
                    </Link>
                  </div>
                </div>
              );
            })()}

            {/* 2-Column Article Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hot Story 2 */}
              {hotPredictions[1] && (() => {
                const p = hotPredictions[1];
                const authorObj = FUTUROLOGISTS.find(f => f.name === p.author);
                return (
                  <div className="card-tier-2 flex flex-col justify-between min-h-[240px]">
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center text-[9px] font-mono text-[#00F5B0]">
                        <span className="uppercase tracking-wider">{p.category} // {p.city}</span>
                        <span className="text-[#7A8694]">{p.year} FORECAST</span>
                      </div>
                      <h3 className="text-lg font-light text-white uppercase tracking-wide leading-snug line-clamp-2">{p.title}</h3>
                      <p className="text-xs text-[#7A8694] leading-relaxed line-clamp-3">{p.description}</p>
                    </div>
                    <div className="flex justify-between items-center border-t border-[#00F5B0]/15 pt-3 mt-4">
                      {authorObj && (
                        <span className="text-[9px] font-mono text-[#7A8694] uppercase">By {p.author}</span>
                      )}
                      <Link href={`/predictions/${p.slug}`} className="text-[10px] font-mono text-[#00F5B0] hover:underline uppercase font-semibold">
                        Read &gt;
                      </Link>
                    </div>
                  </div>
                );
              })()}

              {/* Feed Categories (Compact editorial cells) */}
              {PREDICTIONS.filter(p => p.id !== hotPredictions[0]?.id && p.id !== hotPredictions[1]?.id).slice(0, 3).map(p => {
                const authorObj = FUTUROLOGISTS.find(f => f.name === p.author);
                return (
                  <div key={p.id} className="card-tier-2 flex flex-col justify-between min-h-[240px]">
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center text-[9px] font-mono text-[#00F5B0]">
                        <span className="uppercase tracking-wider">{p.category} // {p.city}</span>
                        <span className="text-[#7A8694]">{p.year} FORECAST</span>
                      </div>
                      <h3 className="text-lg font-light text-white uppercase tracking-wide leading-snug line-clamp-2">{p.title}</h3>
                      <p className="text-xs text-[#7A8694] leading-relaxed line-clamp-3">{p.description}</p>
                    </div>
                    <div className="flex justify-between items-center border-t border-[#00F5B0]/15 pt-3 mt-4">
                      {authorObj && (
                        <span className="text-[9px] font-mono text-[#7A8694] uppercase">By {p.author}</span>
                      )}
                      <Link href={`/predictions/${p.slug}`} className="text-[10px] font-mono text-[#00F5B0] hover:underline uppercase font-semibold">
                        Read &gt;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Trending Sidebar */}
          <div className="flex flex-col gap-6">
            
            {/* Trending Predictions */}
            <div className="card-tier-3 flex flex-col gap-4">
              <div className="border-b border-[#00F5B0]/15 pb-2">
                <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">Trending Metrics</span>
              </div>

              <div className="flex flex-col gap-4">
                {trendingPredictions.map((p, idx) => (
                  <Link 
                    href={`/predictions/${p.slug}`}
                    key={p.id} 
                    className="flex gap-3 items-start group hover:opacity-90 transition-opacity"
                  >
                    <span className="text-sm font-bold font-mono text-[#00F5B0]/35 group-hover:text-[#00F5B0] transition-colors leading-none w-5 pt-0.5">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 flex flex-col gap-1 border-b border-[#00F5B0]/10 pb-2">
                      <h4 className="text-[11px] font-medium uppercase text-white group-hover:text-[#00F5B0] transition-colors tracking-wide leading-snug">
                        {p.title}
                      </h4>
                      <div className="flex justify-between items-center text-[8px] font-mono text-[#7A8694] uppercase">
                        <span>{p.category} · {p.year}</span>
                        <span className="text-[#00F5B0] font-bold">▲ {getVotesCount(p)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Metrics HUD */}
            <div className="card-tier-3 flex flex-col gap-3">
              <div className="border-b border-[#00F5B0]/15 pb-2">
                <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">System Readings</span>
              </div>
              <div className="flex flex-col gap-2 font-mono text-[9px]">
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
