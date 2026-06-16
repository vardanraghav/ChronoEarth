'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BackgroundEffects from '@/components/BackgroundEffects';
import { FUTUROLOGISTS } from '@/data/predictionsData';

const C = {
  emerald: '#00E5FF',
  cyan: '#6FEAFF',
  iceBlue: '#6FEAFF',
  white: '#F5F7FA',
  bg: 'rgba(10, 20, 35, 0.55)',
  border: 'rgba(0, 229, 255, 0.15)',
};

export default function FuturologistsPage() {
  const [failedAvatars, setFailedAvatars] = useState<Record<string, boolean>>({});
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
    <main className="h-screen w-screen overflow-y-auto bg-[#02060B] text-[#e2e8f0] relative custom-scrollbar">
      <BackgroundEffects earthMode="cyber" />
      
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[rgba(10, 20, 35, 0.75)] to-transparent pointer-events-none z-10" />

      <Navbar earthMode="cyber" />

      <div className="content-container pt-32 pb-20 relative z-20 flex flex-col gap-10 animate-fade-up">
        {/* Page Header */}
        <div className="flex flex-col gap-3 border-b border-[#00E5FF]/15 pb-6">
          <h1 className="editorial-title text-white">
            Futurologists <span className="text-[#00E5FF] font-normal">Directory</span>
          </h1>
          <p className="editorial-subtitle text-[#7A8694]">
            Meet the primary system architects and analysts modeling ChronoEarth's future timeline matrices.
          </p>
        </div>

        {/* Specialists Grid - 3 Columns on desktop for maximum above fold density */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FUTUROLOGISTS.map((f) => (
            <div 
              key={f.slug} 
              className="card-tier-2 flex flex-col justify-between p-5 min-h-[260px] group"
            >
              <div className="flex flex-col gap-3.5">
                <div className="flex gap-3.5 items-center">
                  {failedAvatars[f.name] ? (
                    <div className="w-12 h-12 rounded-full border border-[#00E5FF]/20 flex items-center justify-center bg-[#040B12] text-xs font-mono text-[#00E5FF] font-bold group-hover:scale-105 transition-transform shrink-0">
                      {f.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  ) : (
                    <img 
                      src={f.avatar} 
                      alt={f.name} 
                      loading="lazy"
                      onError={() => setFailedAvatars(prev => ({ ...prev, [f.name]: true }))}
                      className="w-12 h-12 rounded-full border border-[#00E5FF]/20 object-cover shadow-none group-hover:scale-105 transition-transform shrink-0"
                    />
                  )}
                  
                  <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                    <div className="flex justify-between items-baseline gap-1">
                      <h2 className="text-base font-light text-white truncate">
                        {f.name}
                      </h2>
                      <span className="text-xs font-mono text-[#00E5FF]" title="Influence Score">{f.influenceScore}%</span>
                    </div>
                    <div className="text-xs text-[#00E5FF] truncate">{f.role}</div>
                  </div>
                </div>

                <div className="text-xs text-[#7A8694] truncate border-b border-[#00E5FF]/10 pb-1.5">{f.specialization}</div>

                <p className="text-xs text-[#7A8694] leading-relaxed line-clamp-3">
                  {f.bio}
                </p>
              </div>

              <div className="flex justify-between items-center border-t border-[#00E5FF]/15 pt-3 mt-4">
                <div className="flex flex-col text-xs">
                  <span className="text-[#7A8694]">Active shards</span>
                  <span className="text-white"><span className="font-mono">{f.contributions}</span> active</span>
                </div>

                <Link
                  href={`/futurologists/${f.slug}`}
                  className="px-3 py-1 text-xs border border-[#00E5FF]/20 bg-[#00E5FF]/5 hover:bg-[#00E5FF] hover:text-[#02060A] hover:border-transparent text-[#00E5FF] rounded transition-all duration-200"
                >
                  View profile →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

