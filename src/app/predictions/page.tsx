'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BackgroundEffects from '@/components/BackgroundEffects';
import { PREDICTIONS, FUTUROLOGISTS } from '@/data/predictionsData';

const C = {
  emerald: '#00FF88',
  cyan:    '#00E5FF',
  iceBlue: '#00C8FF',
  white:   '#FFFFFF',
  bg:      'rgba(0,6,15,0.85)',
  border:  'rgba(0,229,255,0.15)',
};

function PredictionsDirectoryContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedYear, setSelectedYear] = useState<2030 | 2040 | 2050 | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [votes, setVotes] = useState<Record<string, number>>({});

  // Sync initial query param
  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

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

  const handleVote = (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // Don't trigger link navigation
    e.stopPropagation();
    
    const current = votes[id] || 0;
    const updated = { ...votes, [id]: current + 1 };
    setVotes(updated);
    localStorage.setItem('chrono_votes', JSON.stringify(updated));
  };

  const categories = ['ALL', 'AI', 'Climate', 'Energy', 'Space', 'Cities', 'Transport', 'Healthcare'];

  const filteredPredictions = PREDICTIONS.filter(p => {
    const matchYear = selectedYear === 'ALL' || p.year === selectedYear;
    const matchCategory = selectedCategory === 'ALL' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch = !searchQuery.trim() || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase());

    return matchYear && matchCategory && matchSearch;
  });

  const panelStyle: React.CSSProperties = {
    background: 'rgba(3, 5, 10, 0.55)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '4px',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  };

  const cornerAccent = null;

  return (
    <div className="max-w-6xl mx-auto px-6 pt-32 pb-24 relative z-20 flex flex-col gap-10">
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-white/5 pb-8">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-sans-editorial text-white/40 tracking-[0.25em] uppercase font-medium">
            TIMELINE ARCHIVE & INDEX
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-light text-white tracking-wide">
          Forecast Matrix Directory
        </h1>
        <p className="text-sm font-serif text-white/60 max-w-2xl leading-relaxed">
          Search and filter all timeline predictions. Select a prediction card to open the detail sheets and participate in discussions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Side Filters Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Search Box */}
          <div style={panelStyle} className="p-5 flex flex-col gap-3">
            <span className="text-[9px] font-sans-editorial tracking-widest text-white/40 uppercase font-medium">Search Archive</span>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Keywords, authors, cities..."
                className="w-full bg-transparent border-b border-white/10 px-0 py-2 text-xs font-sans-editorial text-white outline-none focus:border-white transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] text-white/40 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Year Box */}
          <div style={panelStyle} className="p-5 flex flex-col gap-3">
            <span className="text-[9px] font-sans-editorial tracking-widest text-white/40 uppercase font-medium">Chrono Year</span>
            <div className="flex flex-col gap-2">
              {['ALL', 2030, 2040, 2050].map((yr) => {
                const isSelected = selectedYear === yr;
                return (
                  <button
                    key={yr}
                    onClick={() => setSelectedYear(yr as any)}
                    className={`text-left px-3 py-2 font-sans-editorial text-[10px] uppercase rounded border tracking-wider transition-all duration-150 ${
                      isSelected 
                        ? 'bg-white border-white text-black font-semibold'
                        : 'bg-transparent border-white/10 text-white/50 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {yr === 'ALL' ? 'ALL YEARS' : `${yr} FORECAST`}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side Categories & Cards Feed */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Categories Horizontal Scrolling */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 font-sans-editorial text-[9px] uppercase border rounded tracking-widest transition-all duration-150 ${
                    isSelected
                      ? 'bg-white text-black border-transparent font-medium'
                      : 'bg-transparent border-white/10 text-white/60 hover:bg-white/5 hover:border-white/30'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPredictions.length === 0 ? (
              <div className="col-span-2 text-center py-20 font-sans-editorial text-xs text-white/30">
                NO FUTURES MATRIX FOUND MATCHING PROTOCOL CRITERIA.
              </div>
            ) : (
              filteredPredictions.map(p => {
                const predVotes = p.initialVotes + (votes[p.id] || 0);
                const authorObj = FUTUROLOGISTS.find(f => f.name === p.author);

                return (
                  <Link
                    href={`/predictions/${p.slug}`}
                    key={p.id}
                    style={panelStyle}
                    className="hover:border-white/20 hover:shadow-[0_0_24px_rgba(255,255,255,0.02)] group flex flex-col justify-between"
                  >
                    <div className="flex flex-col gap-4">
                      {/* Badge Header */}
                      <div className="flex justify-between items-center text-[9px] font-sans-editorial">
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 border border-white/10 text-white/60 uppercase rounded-sm text-[8px]">{p.category}</span>
                          <span className="px-2 py-0.5 border border-white/15 text-white uppercase rounded-sm text-[8px]">{p.year}</span>
                        </div>
                        <span className="text-white/40">{p.city}</span>
                      </div>

                      {/* Content */}
                      <div className="flex flex-col gap-2">
                        <h3 className="text-lg font-display font-light text-white group-hover:text-white/80 transition-colors uppercase leading-snug">
                          {p.title}
                        </h3>
                        <p className="text-xs text-white/65 leading-relaxed font-serif line-clamp-3">
                          {p.description}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-5 font-sans-editorial text-[9px]">
                      {/* Author */}
                      <div className="flex items-center gap-2">
                        {authorObj && (
                          <img 
                            src={authorObj.avatar} 
                            alt={p.author} 
                            className="w-4 h-4 rounded-full border border-white/10 object-cover"
                          />
                        )}
                        <span className="text-white/50 uppercase">{p.author}</span>
                      </div>

                      {/* Votes & Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => handleVote(p.id, e)}
                          className="hover:text-white text-white/40 font-bold transition-colors flex items-center gap-1"
                        >
                          ▲ {predVotes}
                        </button>
                        <span className="text-white/40 font-semibold uppercase group-hover:underline text-[8px] tracking-wider">Read &gt;</span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default function PredictionsDirectoryPage() {
  return (
    <main className="h-screen w-screen overflow-y-auto bg-[#02050a] text-[#e2e8f0] relative custom-scrollbar">
      <BackgroundEffects earthMode="cyber" />
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[rgba(0,8,20,0.9)] to-transparent pointer-events-none z-10" />
      <Navbar earthMode="cyber" />
      <Suspense fallback={
        <div className="h-full w-full flex items-center justify-center font-mono text-cyan-400 text-xs">
          LOADING FORECAST DIRECTORY...
        </div>
      }>
        <PredictionsDirectoryContent />
      </Suspense>
    </main>
  );
}
