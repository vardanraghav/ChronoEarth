'use client';

import { use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BackgroundEffects from '@/components/BackgroundEffects';
import { FUTUROLOGISTS, PREDICTIONS } from '@/data/predictionsData';

const C = {
  emerald: '#00F5B0',
  cyan: '#00D98F',
  iceBlue: '#00D98F',
  white: '#F5F7FA',
  bg: 'rgba(2, 8, 15, 0.75)',
  border: 'rgba(0, 245, 176, 0.15)',
};

interface Params {
  slug: string;
}

export default function FuturologistDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = use(params);
  
  const f = FUTUROLOGISTS.find(fut => fut.slug === slug);

  if (!f) {
    return (
      <main className="h-screen w-screen bg-[#02060A] flex flex-col items-center justify-center text-white gap-4 font-mono">
        <div>[ERROR // PORTFOLIO DATA LINK BROKEN]</div>
        <Link href="/futurologists" className="text-[#00F5B0] hover:underline">[← RETURN TO DIRECTORY]</Link>
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
    <main className="h-screen w-screen overflow-y-auto bg-[#02060A] text-[#e2e8f0] relative custom-scrollbar">
      <BackgroundEffects earthMode="cyber" />
      
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[rgba(2,8,15,0.95)] to-transparent pointer-events-none z-10" />

      <Navbar earthMode="cyber" />

      <div className="content-container pt-32 pb-20 relative z-20 flex flex-col gap-8 animate-fade-up">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 font-mono text-[10px] text-[#00F5B0]">
          <Link href="/futurologists" className="hover:text-white transition-colors">FUTUROLOGISTS</Link>
          <span>/</span>
          <span className="text-[#7A8694]">{f.name.toUpperCase()}</span>
        </div>

        {/* 2-Column Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Bio Sheet - Tier 1 */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="card-tier-1 flex flex-col gap-6">
              
              <div className="flex flex-col items-center gap-4 text-center">
                <img 
                  src={f.avatar} 
                  alt={f.name} 
                  className="w-28 h-28 rounded-full border-2 border-[#00F5B0] object-cover shadow-none"
                />
                <div>
                  <h1 className="text-2xl font-light tracking-wide text-white uppercase">{f.name}</h1>
                  <span className="text-[9px] font-mono tracking-widest text-[#00F5B0] uppercase block mt-1">{f.role}</span>
                </div>
              </div>

              <div className="border-t border-[#00F5B0]/15 pt-4 flex flex-col gap-3 font-mono text-xs">
                <div>
                  <span className="text-[#7A8694] text-[9px] block">SPECIALIZATION AREA</span>
                  <span className="text-[#00D98F] font-semibold">{f.specialization}</span>
                </div>
                <div>
                  <span className="text-[#7A8694] text-[9px] block">TOTAL TIMELINE CONTRIBUTIONS</span>
                  <span className="text-white font-semibold">{f.contributions} Projections</span>
                </div>
                <div>
                  <span className="text-[#7A8694] text-[9px] block">FORECAST INFLUENCE RATING</span>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 h-2 bg-[#040B12] border border-[#00F5B0]/15 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#00F5B0] rounded-full"
                        style={{ width: `${f.influenceScore}%` }}
                      />
                    </div>
                    <span className="text-[#00F5B0] font-bold">{f.influenceScore}%</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#00F5B0]/15 pt-4 text-sm text-[#7A8694] leading-relaxed font-sans">
                <span className="text-[#7A8694] text-[9px] font-mono block mb-2">BIOGRAPHICAL MATRIX</span>
                {f.bio}
              </div>
            </div>
          </div>

          {/* Right Column: Expert Predictions Feed - Tier 2 */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="card-tier-2 h-full flex flex-col gap-6">
              
              <div className="flex items-center gap-3 border-b border-[#00F5B0]/15 pb-4">
                <h2 className="text-lg font-light tracking-wide text-white uppercase">
                  ACTIVE FORECASTS FOR <span className="font-semibold text-[#00F5B0]">{f.name.toUpperCase()}</span>
                </h2>
              </div>

              {/* Predictions List */}
              <div className="flex flex-col gap-5">
                {authorPredictions.length === 0 ? (
                  <div className="text-center py-10 font-mono text-xs text-[#7A8694]">
                    NO ACTIVE PROJECTIONS ON RECORD FOR THIS SPECIALIST.
                  </div>
                ) : (
                  authorPredictions.map(p => (
                    <div 
                      key={p.id}
                      className="card-tier-3 flex flex-col gap-3"
                    >
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 bg-[#040B12] text-[#00F5B0] border border-[#00F5B0]/15 uppercase tracking-wider rounded-sm">{p.category}</span>
                          <span className="px-2 py-0.5 bg-[#040B12] text-[#00F5B0] border border-emerald-500/15 uppercase tracking-wider rounded-sm">{p.year} FORECAST</span>
                        </div>
                        <span className="text-[#7A8694]">CONFIDENCE: {p.confidenceScore}%</span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <h3 className="text-base font-semibold text-white uppercase tracking-wide">{p.title}</h3>
                        <p className="text-xs text-[#7A8694] leading-relaxed font-sans">{p.description}</p>
                      </div>

                      <div className="flex justify-between items-center border-t border-[#00F5B0]/15 pt-3 text-[10px] font-mono text-[#7A8694]">
                        <span>GEOLOCATION: {p.city}</span>
                        <Link 
                          href={`/predictions/${p.slug}`}
                          className="text-[#00F5B0] hover:underline uppercase font-bold"
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
