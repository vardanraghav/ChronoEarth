'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BackgroundEffects from '@/components/BackgroundEffects';
import { KB_ARTICLES } from '@/data/predictionsData';

const C = {
  emerald: '#00F5B0',
  cyan: '#00D98F',
  iceBlue: '#00D98F',
  white: '#F5F7FA',
  bg: 'rgba(2, 8, 15, 0.75)',
  border: 'rgba(0, 245, 176, 0.15)',
};

function KnowledgeBaseContent() {
  const searchParams = useSearchParams();
  const articleParam = searchParams.get('article');

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);

  // If a specific article is requested via query param, expand it
  useEffect(() => {
    if (articleParam) {
      setExpandedArticleId(articleParam);
    }
  }, [articleParam]);

  const categories = ['ALL', 'Technologies', 'Future Jobs', 'Climate', 'Energy', 'Space'];

  const filteredArticles = KB_ARTICLES.filter(art => 
    selectedCategory === 'ALL' || art.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  const activeArticle = KB_ARTICLES.find(x => x.id === expandedArticleId);

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
    <div className="max-w-6xl mx-auto px-6 pt-32 pb-24 relative z-20 flex flex-col gap-10">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#00F5B0]/15 pb-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#00D98F] shadow-[0_0_10px_#00D98F]" />
            <span className="text-xs font-semibold tracking-[0.4em] text-[#00D98F] uppercase font-mono">
              HOLOGRAPHIC RESOURCE ARCHIVE
            </span>
          </div>
          <h1 className="text-4xl font-light tracking-tight text-white uppercase">
            KNOWLEDGE <span className="font-semibold text-[#00D98F]">BASE</span>
          </h1>
          <p className="text-sm font-mono text-[#7A8694] max-w-xl">
            Technical specs, deployment logs, and readiness parameters for futuristic technologies.
          </p>
        </div>

        {activeArticle && (
          <button
            onClick={() => setExpandedArticleId(null)}
            className="self-start md:self-auto px-4 py-2 border border-[#00F5B0]/20 bg-[#00F5B0]/5 hover:bg-[#00F5B0] hover:text-[#02060A] hover:border-transparent text-[#00F5B0] font-mono text-[9px] tracking-widest uppercase rounded transition-all duration-300"
          >
            [← Back to Database]
          </button>
        )}
      </div>

      {/* Filter Options */}
      {!activeArticle && (
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 font-mono text-[9px] tracking-widest uppercase border rounded transition-all duration-200 ${
                  isSelected 
                    ? 'bg-[#00F5B0] text-[#000] border-transparent font-bold shadow-[0_0_12px_rgba(0,229,255,0.35)]'
                    : 'bg-[#00F5B0]/5 border-[#00F5B0]/20 text-[#00F5B0] hover:bg-[#00F5B0]/10'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {/* Dynamic Main Body Content */}
      <div className="min-h-[400px]">
        {activeArticle ? (
          
          /* Detailed View */
          <div style={panelStyle} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cornerAccent}
            
            {/* Left Metrics Column */}
            <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-[#00F5B0]/60 pb-6 md:pb-0 md:pr-8 flex flex-col gap-6">
              <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">Resource Parameters</span>
              
              <div>
                <span className="text-[8px] text-slate-400 font-mono block mb-1">CLASSIFICATION</span>
                <span className="text-sm font-semibold font-mono text-[#00F5B0] uppercase">{activeArticle.category}</span>
              </div>
              
              <div>
                <span className="text-[8px] text-slate-400 font-mono block mb-2">DEPLOYMENT READINESS STATUS</span>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-[#040B12] border border-[#00F5B0]/20 rounded overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-[#00F5B0] shadow-[0_0_6px_#00F5B0]"
                      style={{ width: `${activeArticle.readinessIndex}%` }}
                    />
                  </div>
                  <span className="text-[#00F5B0] font-bold font-mono text-xs">{activeArticle.readinessIndex}%</span>
                </div>
              </div>

              <div>
                <span className="text-[8px] text-slate-400 font-mono block mb-1">BIOSPHERE IMPACT COEFFICIENT</span>
                <span className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded-sm ${
                  activeArticle.impactLevel === 'Critical' 
                    ? 'bg-rose-950 text-rose-400 border border-rose-500/30' 
                    : 'bg-[#040B12] text-emerald-400 border border-emerald-500/30'
                }`}>
                  {activeArticle.impactLevel}
                </span>
              </div>

              <div className="mt-auto border-t border-[#00F5B0]/60 pt-4 flex flex-col gap-2">
                <span className="text-[7px] font-mono text-slate-500">DATABASE REF: KB-{activeArticle.id.toUpperCase()}</span>
                <span className="text-[7px] font-mono text-emerald-400">STATUS: INTEGRATED PROTOCOL</span>
              </div>
            </div>

            {/* Right Details Column */}
            <div className="md:col-span-2 flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-semibold text-white uppercase tracking-wide mb-1">{activeArticle.title}</h2>
                <p className="text-[#00D98F] text-xs font-mono font-medium">{activeArticle.shortDesc}</p>
              </div>

              <div className="bg-[#00050c]/60 border border-[#00F5B0]/50 p-6 rounded text-sm text-slate-300 leading-relaxed font-mono whitespace-pre-line">
                {activeArticle.content}
              </div>
            </div>

          </div>
        ) : (
          
          /* Database Grid View */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredArticles.length === 0 ? (
              <div className="col-span-3 text-center py-20 font-mono text-xs text-slate-500">
                NO RESOURCE SHARDS COMPILED IN THIS SECTOR.
              </div>
            ) : (
              filteredArticles.map(art => (
                <div
                  key={art.id}
                  onClick={() => setExpandedArticleId(art.id)}
                  style={panelStyle}
                  className="hover:border-[#00F5B0]/40 hover:shadow-[0_0_24px_rgba(0,229,255,0.12)] cursor-pointer group flex flex-col justify-between min-h-[220px]"
                >
                  {cornerAccent}
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center text-[8px] font-mono">
                      <span className="text-[#00F5B0] uppercase tracking-wider">{art.category}</span>
                      <span className={art.impactLevel === 'Critical' ? 'text-rose-400' : 'text-slate-400'}>{art.impactLevel}</span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <h3 className="text-base font-semibold text-white group-hover:text-[#00F5B0] transition-colors uppercase tracking-wide">
                        {art.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">{art.shortDesc}</p>
                    </div>
                  </div>

                  <div className="border-t border-[#00F5B0]/40 pt-3 mt-4 flex justify-between items-center text-[8px] font-mono">
                    <span className="text-slate-500">READINESS: {art.readinessIndex}%</span>
                    <span className="text-[#00F5B0] group-hover:translate-x-1 transition-transform font-bold">[EXPAND SHEETS &gt;]</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

    </div>
  );
}

export default function KnowledgePage() {
  return (
    <main className="h-screen w-screen overflow-y-auto bg-[#02060A] text-[#e2e8f0] relative custom-scrollbar">
      <BackgroundEffects earthMode="cyber" />
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[rgba(2,8,15,0.95)] to-transparent pointer-events-none z-10" />
      <Navbar earthMode="cyber" />
      <Suspense fallback={
        <div className="h-full w-full flex items-center justify-center font-mono text-[#00F5B0] text-xs">
          DECRYPTING KNOWLEDGE SHEETS...
        </div>
      }>
        <KnowledgeBaseContent />
      </Suspense>
    </main>
  );
}
