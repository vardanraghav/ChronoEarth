'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
    background: 'rgba(2, 8, 15, 0.75)',
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
    <div className="content-container pt-32 pb-20 relative z-20 flex flex-col gap-10 animate-fade-up">
      
      {/* Page Header */}
      <div className="flex flex-col gap-3 border-b border-[#00F5B0]/15 pb-6">
        <h1 className="editorial-title text-white">
          Forecast Matrix Directory
        </h1>
        <p className="editorial-subtitle text-[#7A8694]">
          Search and filter all timeline predictions. Select a prediction card to open the detail sheets and participate in discussions.
        </p>
      </div>

      {/* Filter and Search Bar: 280px sidebar layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
        
        {/* Left Side Filters Sidebar */}
        <div className="flex flex-col gap-6">
          
          {/* Search Box */}
          <div className="card-tier-3 flex flex-col gap-3">
            <span className="text-[10px] font-mono tracking-widest text-[#7A8694] uppercase">Search Archive</span>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Keywords, authors, cities..."
                className="w-full bg-transparent border-b border-[#00F5B0]/15 px-0 py-2 text-xs font-mono text-white outline-none focus:border-[#00F5B0] transition-colors"
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
          <div className="card-tier-3 flex flex-col gap-3">
            <span className="text-[10px] font-mono tracking-widest text-[#7A8694] uppercase font-medium">Chrono Year</span>
            <div className="flex flex-col gap-2">
              {['ALL', 2030, 2040, 2050].map((yr) => {
                const isSelected = selectedYear === yr;
                return (
                  <button
                    key={yr}
                    onClick={() => setSelectedYear(yr as any)}
                    className={`text-left px-3 py-2 font-mono text-[10px] uppercase rounded border tracking-wider transition-all duration-150 ${
                      isSelected 
                         ? 'bg-[#00F5B0] border-[#00F5B0] text-[#02060A] font-semibold'
                        : 'bg-transparent border-[#00F5B0]/15 text-[#7A8694] hover:border-[#00F5B0]/30 hover:text-white'
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
        <div className="flex flex-col gap-6">
          
          {/* Categories Horizontal Scrolling */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 font-mono text-[9px] uppercase border rounded tracking-widest transition-all duration-150 ${
                    isSelected
                      ? 'bg-[#00F5B0] text-[#02060A] border-transparent font-medium'
                      : 'bg-transparent border-[#00F5B0]/15 text-[#7A8694] hover:bg-white/5 hover:border-[#00F5B0]/30'
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
              <div className="col-span-2 text-center py-20 font-mono text-xs text-[#7A8694]">
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
                    className="card-tier-2 flex flex-col justify-between p-5 min-h-[170px]"
                  >
                    <div className="flex flex-col gap-2.5">
                      {/* Badge Header */}
                      <div className="flex justify-between items-center text-[9px] font-mono">
                        <span className="text-[#00F5B0] font-semibold uppercase">{p.category} // {p.city}</span>
                        <span className="text-white font-bold">{p.year} FORECAST</span>
                      </div>

                      {/* Content */}
                      <div className="flex flex-col gap-1.5">
                        <h3 className="text-base font-light text-white group-hover:text-[#00F5B0] transition-colors uppercase leading-snug">
                          {p.title}
                        </h3>
                        <p className="text-xs text-[#7A8694] leading-relaxed line-clamp-2">
                          {p.description}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center border-t border-[#00F5B0]/15 pt-2.5 mt-3 font-mono text-[9px]">
                      <span className="text-slate-500">BY {p.author.toUpperCase()}</span>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleVote(p.id, e)}
                          className="hover:text-[#00F5B0] text-[#7A8694] font-bold transition-colors flex items-center gap-1"
                        >
                          ▲ {predVotes}
                        </button>
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
    <main className="h-screen w-screen overflow-y-auto bg-[#02060A] text-[#e2e8f0] relative custom-scrollbar">
      <BackgroundEffects earthMode="cyber" />
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[rgba(2,8,15,0.95)] to-transparent pointer-events-none z-10" />
      <Navbar earthMode="cyber" />
      <Suspense fallback={
        <div className="h-full w-full flex items-center justify-center font-mono text-[#00F5B0] text-xs">
          LOADING FORECAST DIRECTORY...
        </div>
      }>
        <PredictionsDirectoryContent />
      </Suspense>
    </main>
  );
}
