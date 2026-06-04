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
    <div className="content-container pt-32 pb-20 relative z-20 flex flex-col gap-10 animate-fade-up">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#00F5B0]/15 pb-6">
        <div className="flex flex-col gap-3">
          <h1 className="editorial-title text-white">
            Knowledge <span className="text-[#00F5B0] font-normal">Base</span>
          </h1>
          <p className="editorial-subtitle text-[#7A8694]">
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
                    ? 'bg-[#00F5B0] text-[#02060A] border-transparent font-bold'
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
          
          /* Detailed View - Tier 1 Container */
          <div className="card-tier-1 grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left Metrics Column */}
            <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-[#00F5B0]/15 pb-6 md:pb-0 md:pr-8 flex flex-col gap-6">
              <span className="text-[10px] font-mono tracking-widest text-[#7A8694] uppercase">Resource Parameters</span>
              
              <div>
                <span className="text-[8px] text-[#7A8694] font-mono block mb-1">CLASSIFICATION</span>
                <span className="text-sm font-semibold font-mono text-[#00F5B0] uppercase">{activeArticle.category}</span>
              </div>
              
              <div>
                <span className="text-[8px] text-[#7A8694] font-mono block mb-2">DEPLOYMENT READINESS STATUS</span>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-[#040B12] border border-[#00F5B0]/15 rounded overflow-hidden">
                    <div 
                      className="h-full bg-[#00F5B0]"
                      style={{ width: `${activeArticle.readinessIndex}%` }}
                    />
                  </div>
                  <span className="text-[#00F5B0] font-bold font-mono text-xs">{activeArticle.readinessIndex}%</span>
                </div>
              </div>

              <div>
                <span className="text-[8px] text-[#7A8694] font-mono block mb-1">BIOSPHERE IMPACT COEFFICIENT</span>
                <span className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded-sm ${
                  activeArticle.impactLevel === 'Critical' 
                    ? 'bg-rose-950 text-rose-455 border border-rose-500/30' 
                    : 'bg-[#040B12] text-[#00F5B0] border border-[#00F5B0]/15'
                }`}>
                  {activeArticle.impactLevel}
                </span>
              </div>

              <div className="mt-auto border-t border-[#00F5B0]/15 pt-4 flex flex-col gap-2">
                <span className="text-[9px] font-mono text-slate-500">DATABASE REF: KB-{activeArticle.id.toUpperCase()}</span>
                <span className="text-[9px] font-mono text-[#00F5B0]">STATUS: INTEGRATED PROTOCOL</span>
              </div>
            </div>

            {/* Right Details Column */}
            <div className="md:col-span-2 flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-light text-white uppercase tracking-wide mb-1">{activeArticle.title}</h2>
                <p className="text-[#00D98F] text-xs font-mono font-medium">{activeArticle.shortDesc}</p>
              </div>

              <div className="card-tier-3 text-sm text-[#7A8694] leading-relaxed font-mono whitespace-pre-line">
                {activeArticle.content}
              </div>
            </div>

          </div>
        ) : (
          
          /* Database Grid View - 3 columns */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.length === 0 ? (
              <div className="col-span-3 text-center py-20 font-mono text-xs text-[#7A8694]">
                NO RESOURCE SHARDS COMPILED IN THIS SECTOR.
              </div>
            ) : (
              filteredArticles.map(art => (
                <div
                  key={art.id}
                  onClick={() => setExpandedArticleId(art.id)}
                  className="card-tier-2 cursor-pointer flex flex-col justify-between p-5 min-h-[300px]"
                >
                  {/* Thumbnail Area Placeholder */}
                  <div className="h-28 w-full bg-[#02060A]/85 border border-[#00F5B0]/15 rounded flex items-center justify-center relative overflow-hidden group-hover:border-[#00F5B0]/30 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#00F5B0]/5 to-transparent opacity-40" />
                    <div className="text-[9px] font-mono text-[#00F5B0]/35 tracking-wider uppercase font-semibold">DB-SHARD REF: {art.id.toUpperCase()}</div>
                    {/* Subtle grid line decorative pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,245,176,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,245,176,0.02)_1px,transparent_1px)] bg-[size:10px_10px]" />
                  </div>

                  <div className="flex flex-col gap-2.5 flex-1">
                    <div className="flex justify-between items-center text-[9px] font-mono">
                      <span className="text-[#00F5B0] font-semibold uppercase">{art.category}</span>
                      <span className={art.impactLevel === 'Critical' ? 'text-rose-400 font-bold text-[8px] uppercase' : 'text-[#7A8694] text-[8px] uppercase'}>{art.impactLevel} Impact</span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <h3 className="text-base font-light text-white group-hover:text-[#00F5B0] transition-colors uppercase leading-snug tracking-wide">
                        {art.title}
                      </h3>
                      <p className="text-xs text-[#7A8694] leading-relaxed line-clamp-3">{art.shortDesc}</p>
                    </div>
                  </div>

                  <div className="border-t border-[#00F5B0]/10 pt-2.5 mt-auto flex justify-between items-center text-[9px] font-mono">
                    <span className="text-[#7A8694]">READINESS: {art.readinessIndex}%</span>
                    <span className="text-[#00F5B0] font-bold uppercase tracking-wider group-hover:underline">Inspect &gt;</span>
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
