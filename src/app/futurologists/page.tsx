'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BackgroundEffects from '@/components/BackgroundEffects';
import { FUTUROLOGISTS } from '@/data/predictionsData';

const C = {
  emerald: '#00F5B0',
  cyan: '#00D98F',
  iceBlue: '#00D98F',
  white: '#F5F7FA',
  bg: 'rgba(2, 8, 15, 0.75)',
  border: 'rgba(0, 245, 176, 0.15)',
};

export default function FuturologistsPage() {
  const panelStyle: React.CSSProperties = {
    background: C.bg,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${C.border}`,
    borderRadius: '4px',
    padding: '24px',
    boxShadow: '0 0 30px rgba(0,229,255,0.05), inset 0 0 15px rgba(0,229,255,0.01)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    transition: 'all 0.3s ease',
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
              CERTIFIED FORECASTING EXPERTS
            </span>
          </div>
          <h1 className="text-4xl font-light tracking-tight text-white uppercase">
            FUTUROLOGISTS <span className="font-semibold text-[#00F5B0]">DIRECTORY</span>
          </h1>
          <p className="text-sm font-mono text-[#7A8694] max-w-2xl">
            Meet the primary system architects and analysts modeling ChronoEarth's future timeline matrices.
          </p>
        </div>

        {/* Specialists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {FUTUROLOGISTS.map((f) => (
            <div 
              key={f.slug} 
              style={panelStyle}
              className="hover:border-cyan-400/50 hover:shadow-none group"
            >
              {cornerAccent}
              
              <div className="flex gap-5 items-start">
                <img 
                  src={f.avatar} 
                  alt={f.name} 
                  className="w-20 h-20 rounded-full border border-[#00F5B0]/30 object-cover shadow-none group-hover:scale-105 transition-transform"
                />
                
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold text-white tracking-wide uppercase font-sans">
                      {f.name}
                    </h2>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] text-[#00F5B0] font-mono tracking-widest uppercase">Influence</span>
                      <span className="text-sm font-mono font-bold text-white">{f.influenceScore}%</span>
                    </div>
                  </div>
                  <div className="text-xs text-[#00F5B0] font-mono uppercase tracking-wider">{f.role}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1 font-semibold">{f.specialization}</div>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed font-sans mt-2">
                {f.bio}
              </p>

              <div className="flex justify-between items-center border-t border-[#00F5B0]/40 pt-4 mt-auto">
                <div className="flex gap-4">
                  <div className="flex flex-col">
                    <span className="text-[7px] text-[#7A8694] font-mono tracking-wider uppercase">Contributions</span>
                    <span className="text-xs font-mono font-semibold text-white">{f.contributions} Active</span>
                  </div>
                </div>

                <Link
                  href={`/futurologists/${f.slug}`}
                  className="px-4 py-2 border border-[#00F5B0]/20 bg-[#00F5B0]/5 hover:bg-[#00F5B0] hover:text-[#02060A] hover:border-transparent text-[#00F5B0] font-mono text-[9px] tracking-widest uppercase rounded transition-all duration-300"
                >
                  View Profile Portfolio &gt;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
