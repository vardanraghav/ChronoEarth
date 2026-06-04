'use client';

import { use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BackgroundEffects from '@/components/BackgroundEffects';
import { FUTUROLOGISTS, PREDICTIONS } from '@/data/predictionsData';

const C = {
  emerald: '#00FF88',
  cyan:    '#00E5FF',
  iceBlue: '#00C8FF',
  white:   '#FFFFFF',
  bg:      'rgba(0,6,15,0.85)',
  border:  'rgba(0,229,255,0.15)',
};

interface Params {
  slug: string;
}

export default function FuturologistDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = use(params);
  
  const f = FUTUROLOGISTS.find(fut => fut.slug === slug);

  if (!f) {
    return (
      <main className="h-screen w-screen bg-[#02050a] flex flex-col items-center justify-center text-white gap-4 font-mono">
        <div>[ERROR // PORTFOLIO DATA LINK BROKEN]</div>
        <Link href="/futurologists" className="text-[#00E5FF] hover:underline">[← RETURN TO DIRECTORY]</Link>
      </main>
    );
  }

  // Filter predictions authored by this futurologist
  const authorPredictions = PREDICTIONS.filter(p => p.author === f.name);

  const panelStyle: React.CSSProperties = {
    background: C.bg,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${C.border}`,
    borderRadius: '4px',
    padding: '24px',
    boxShadow: '0 0 30px rgba(0,229,255,0.05), inset 0 0 15px rgba(0,229,255,0.01)',
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
    <main className="h-screen w-screen overflow-y-auto bg-[#02050a] text-[#e2e8f0] relative custom-scrollbar">
      <BackgroundEffects earthMode="cyber" />
      
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[rgba(0,8,20,0.9)] to-transparent pointer-events-none z-10" />

      <Navbar earthMode="cyber" />

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-24 relative z-20 flex flex-col gap-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 font-mono text-[9px] text-cyan-500">
          <Link href="/futurologists" className="hover:text-white transition-colors">FUTUROLOGISTS</Link>
          <span>/</span>
          <span className="text-slate-400">{f.name.toUpperCase()}</span>
        </div>

        {/* 2-Column Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Bio Sheet */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div style={panelStyle} className="flex flex-col gap-6">
              {cornerAccent}
              
              <div className="flex flex-col items-center gap-4 text-center">
                <img 
                  src={f.avatar} 
                  alt={f.name} 
                  className="w-28 h-28 rounded-full border-2 border-[#00E5FF] object-cover shadow-[0_0_20px_rgba(0,229,255,0.3)]"
                />
                <div>
                  <h1 className="text-2xl font-bold tracking-wide text-white uppercase">{f.name}</h1>
                  <span className="text-[9px] font-mono tracking-widest text-[#00E5FF] uppercase block mt-1">{f.role}</span>
                </div>
              </div>

              <div className="border-t border-cyan-950/60 pt-4 flex flex-col gap-3 font-mono text-xs">
                <div>
                  <span className="text-slate-500 text-[9px] block">SPECIALIZATION AREA</span>
                  <span className="text-[#00C8FF] font-semibold">{f.specialization}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[9px] block">TOTAL TIMELINE CONTRIBUTIONS</span>
                  <span className="text-white font-semibold">{f.contributions} Projections</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[9px] block">FORECAST INFLUENCE RATING</span>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 h-2 bg-cyan-950 border border-cyan-500/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-400 to-[#00FF88] rounded-full shadow-[0_0_6px_#00FF88]"
                        style={{ width: `${f.influenceScore}%` }}
                      />
                    </div>
                    <span className="text-[#00FF88] font-bold">{f.influenceScore}%</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-cyan-950/60 pt-4 text-sm text-slate-300 leading-relaxed font-sans">
                <span className="text-slate-500 text-[9px] font-mono block mb-2">BIOGRAPHICAL MATRIX</span>
                {f.bio}
              </div>
            </div>
          </div>

          {/* Right Column: Expert Predictions Feed */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div style={panelStyle} className="h-full flex flex-col gap-6">
              {cornerAccent}
              
              <div className="flex items-center gap-3 border-b border-cyan-950 pb-4">
                <div className="w-1.5 h-5 bg-[#00FF88] shadow-[0_0_8px_#00FF88]" />
                <h2 className="text-lg font-light tracking-wide text-white uppercase">
                  ACTIVE FORECASTS FOR <span className="font-semibold text-[#00FF88]">{f.name.toUpperCase()}</span>
                </h2>
              </div>

              {/* Predictions List */}
              <div className="flex flex-col gap-5">
                {authorPredictions.length === 0 ? (
                  <div className="text-center py-10 font-mono text-xs text-slate-500">
                    NO ACTIVE PROJECTIONS ON RECORD FOR THIS SPECIALIST.
                  </div>
                ) : (
                  authorPredictions.map(p => (
                    <div 
                      key={p.id}
                      className="p-4 bg-cyan-950/10 border border-cyan-950/40 rounded flex flex-col gap-3 hover:border-cyan-400/30 transition-colors"
                    >
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 bg-cyan-950 text-[#00E5FF] border border-cyan-500/20 uppercase tracking-wider rounded-sm">{p.category}</span>
                          <span className="px-2 py-0.5 bg-emerald-950 text-[#00FF88] border border-emerald-500/20 uppercase tracking-wider rounded-sm">{p.year} FORECAST</span>
                        </div>
                        <span className="text-slate-500">CONFIDENCE: {p.confidenceScore}%</span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <h3 className="text-base font-semibold text-white uppercase tracking-wide">{p.title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">{p.description}</p>
                      </div>

                      <div className="flex justify-between items-center border-t border-cyan-950/20 pt-3 text-[10px] font-mono text-cyan-400/50">
                        <span>GEOLOCATION: {p.city}</span>
                        <Link 
                          href={`/predictions/${p.slug}`}
                          className="text-[#00E5FF] hover:underline uppercase font-bold"
                        >
                          Analyze Forecast Protocol &gt;
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
