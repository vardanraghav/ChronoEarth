'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BackgroundEffects from '@/components/BackgroundEffects';
import { PREDICTIONS, FUTUROLOGISTS } from '@/data/predictionsData';

// Reusable Circular SVG Progress Ring Component
const ProbabilityRing = ({ 
  value, 
  label, 
  subtitle, 
  color = '#00F5B0', 
  shadowColor = 'rgba(0, 245, 176, 0.25)' 
}: { 
  value: number; 
  label: string; 
  subtitle: string;
  color?: string;
  shadowColor?: string;
}) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  return (
    <div 
      className="premium-glass p-6 rounded-lg flex flex-col items-center gap-4 text-center hover:translate-y-[-4px] transition-all duration-300 group"
      style={{
        backgroundColor: 'rgba(4, 11, 18, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}
    >
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Glow behind the ring */}
        <div 
          className="absolute w-20 h-20 rounded-full blur-[14px] opacity-15 transition-all duration-300 group-hover:opacity-30"
          style={{ backgroundColor: color }}
        />
        <svg className="w-full h-full transform -rotate-90">
          {/* Base track */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            stroke="rgba(255, 255, 255, 0.03)"
            strokeWidth="4.5"
            fill="transparent"
          />
          {/* Active indicator */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            stroke={color}
            strokeWidth="4.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: `drop-shadow(0 0 5px ${shadowColor})`
            }}
          />
        </svg>
        <span 
          className="absolute text-lg font-mono font-semibold text-white tracking-tighter"
          style={{ textShadow: `0 0 8px ${shadowColor}` }}
        >
          {value}%
        </span>
      </div>
      
      <div className="flex flex-col gap-1">
        <h4 className="text-xs font-semibold tracking-wide text-white uppercase font-sans m-0 group-hover:text-white transition-colors">
          {label}
        </h4>
        <span className="text-[9px] font-mono text-[#7A8694] uppercase tracking-wider">{subtitle}</span>
      </div>
    </div>
  );
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
    e.preventDefault();
    e.stopPropagation();
    
    const current = votes[id] || 0;
    const updated = { ...votes, [id]: current + 1 };
    setVotes(updated);
    localStorage.setItem('chrono_votes', JSON.stringify(updated));
  };

  const categories = ['ALL', 'AI', 'Climate', 'Energy', 'Space', 'Cities', 'Transport', 'Healthcare'];

  const getCategoryStyle = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('ai')) return { color: '#00F5D4', shadow: 'rgba(0, 245, 212, 0.18)', bg: 'rgba(0, 245, 212, 0.04)', border: 'rgba(0, 245, 212, 0.25)' };
    if (cat.includes('climate')) return { color: '#FF0055', shadow: 'rgba(255, 0, 85, 0.18)', bg: 'rgba(255, 0, 85, 0.04)', border: 'rgba(255, 0, 85, 0.25)' };
    if (cat.includes('energy')) return { color: '#00F5B0', shadow: 'rgba(0, 245, 176, 0.18)', bg: 'rgba(0, 245, 176, 0.04)', border: 'rgba(0, 245, 176, 0.25)' };
    if (cat.includes('space')) return { color: '#BF5AF2', shadow: 'rgba(191, 90, 242, 0.18)', bg: 'rgba(191, 90, 242, 0.04)', border: 'rgba(191, 90, 242, 0.25)' };
    if (cat.includes('cities')) return { color: '#0A84FF', shadow: 'rgba(10, 132, 255, 0.18)', bg: 'rgba(10, 132, 255, 0.04)', border: 'rgba(10, 132, 255, 0.25)' };
    if (cat.includes('transport')) return { color: '#CCFF00', shadow: 'rgba(204, 255, 0, 0.18)', bg: 'rgba(204, 255, 0, 0.04)', border: 'rgba(204, 255, 0, 0.25)' };
    if (cat.includes('healthcare')) return { color: '#00E5FF', shadow: 'rgba(0, 229, 255, 0.18)', bg: 'rgba(0, 229, 255, 0.04)', border: 'rgba(0, 229, 255, 0.25)' };
    return { color: '#00F5B0', shadow: 'rgba(0, 245, 176, 0.18)', bg: 'rgba(0, 245, 176, 0.04)', border: 'rgba(0, 245, 176, 0.25)' };
  };

  const getImpactLevel = (score: number): 'Critical' | 'High' | 'Moderate' => {
    if (score > 80) return 'Critical';
    if (score > 65) return 'High';
    return 'Moderate';
  };

  const getSupportingIndicators = (category: string): string => {
    const cat = category.toLowerCase();
    if (cat.includes('ai')) return 'Compute flops, neural parameter scaling, algorithmic density';
    if (cat.includes('climate')) return 'Global mean sea levels, CO2 concentration, ocean heat content';
    if (cat.includes('energy')) return 'Grid interconnect capacity, grid-scale storage, LCOE trends';
    if (cat.includes('space')) return 'Launch frequency, low Earth orbit payload cost, launch weights';
    if (cat.includes('cities')) return 'Micro-grid nodes, decentralization ratios, smart grid connectivity';
    if (cat.includes('transport')) return 'Electric vehicle sales share, battery cell costs, battery density';
    if (cat.includes('healthcare')) return 'Synthetic gene speed, genetic edit accuracy, senescence markers';
    return 'System parameters, adoption levels, market penetration rates';
  };

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

  return (
    <div className="content-container pt-32 pb-24 relative z-20 flex flex-col gap-10 animate-fade-up">
      
      {/* Page Header */}
      <div className="flex flex-col gap-3 border-b border-white/5 pb-6">
        <span className="text-[10px] font-mono text-[#00F5B0] uppercase tracking-[0.25em] font-semibold">
          Foresight Engine
        </span>
        <h1 className="editorial-title text-white tracking-tight m-0 text-3xl font-light">
          Probability <span style={{ color: '#00F5B0' }} className="font-normal">Matrix</span>
        </h1>
        <p className="text-[#7A8694] font-light text-sm max-w-2xl leading-relaxed m-0">
          Planetary forecasts indexed by confidence scores. Review key system developments and explore timeline likelihoods.
        </p>
      </div>

      {/* Flagship Probability Visualizer Hub */}
      <div className="flex flex-col gap-4">
        <span className="text-[10px] font-mono text-[#7A8694] uppercase tracking-[0.2em] font-bold">
          Flagship Intelligence Signals
        </span>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <ProbabilityRing value={72} label="AGI Realisation" subtitle="Target 2040" color="#00F5D4" shadowColor="rgba(0, 245, 212, 0.25)" />
          <ProbabilityRing value={81} label="India GDP Rank #3" subtitle="Target 2030" color="#00F5B0" shadowColor="rgba(0, 245, 176, 0.25)" />
          <ProbabilityRing value={67} label="Fusion Dominance" subtitle="Target 2050" color="#BF5AF2" shadowColor="rgba(191, 90, 242, 0.25)" />
          <ProbabilityRing value={88} label="Global EV Adoption" subtitle="Target 2040" color="#0A84FF" shadowColor="rgba(10, 132, 255, 0.25)" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-5 mt-2">
        <span className="text-[10px] font-mono text-[#7A8694] uppercase tracking-[0.2em] font-bold">
          Forecast Directory Shards
        </span>
        
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
          
          {/* Left Side Filters Sidebar */}
          <div className="flex flex-col gap-6">
            
            {/* Search Box */}
            <div className="premium-glass p-5 rounded-lg flex flex-col gap-4" style={{ backgroundColor: 'rgba(4, 11, 18, 0.75)' }}>
              <span className="text-xs text-[#7A8694] font-medium tracking-wide uppercase font-mono">Search archive</span>
              <div className="relative border-b border-white/10 focus-within:border-[#00F5B0] transition-colors py-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Keywords, authors, cities..."
                  className="w-full bg-transparent border-none px-0 text-xs text-white outline-none font-light placeholder-white/20"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white cursor-pointer bg-transparent border-none"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Year Box */}
            <div className="premium-glass p-5 rounded-lg flex flex-col gap-4" style={{ backgroundColor: 'rgba(4, 11, 18, 0.75)' }}>
              <span className="text-xs text-[#7A8694] font-medium tracking-wide uppercase font-mono">Chrono year</span>
              <div className="flex flex-col gap-2">
                {['ALL', 2030, 2040, 2050].map((yr) => {
                  const isSelected = selectedYear === yr;
                  return (
                    <button
                      key={yr}
                      onClick={() => setSelectedYear(yr as any)}
                      className={`text-left px-3 py-2 text-xs rounded transition-all duration-300 font-mono cursor-pointer border ${
                        isSelected 
                          ? 'bg-[#00F5B0] border-[#00F5B0] text-[#02060A] font-semibold shadow-[0_0_10px_rgba(0,245,176,0.3)]'
                          : 'bg-transparent border-white/5 text-[#7A8694] hover:border-[#00F5B0]/30 hover:text-white'
                      }`}
                    >
                      {yr === 'ALL' ? 'All years' : `${yr} forecast`}
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
                const style = getCategoryStyle(cat === 'ALL' ? 'Energy' : cat);
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 text-xs rounded transition-all duration-300 font-mono cursor-pointer border ${
                      isSelected
                        ? 'bg-[#00F5B0] text-[#02060A] border-transparent font-semibold shadow-[0_0_10px_rgba(0,245,176,0.3)]'
                        : 'bg-transparent border-white/5 text-[#7A8694] hover:bg-white/5 hover:border-[#00F5B0]/30'
                    }`}
                    style={isSelected ? { backgroundColor: style.color, boxShadow: `0 0 10px ${style.shadow}` } : {}}
                  >
                    {cat === 'ALL' ? 'All Sectors' : cat}
                  </button>
                );
              })}
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPredictions.length === 0 ? (
                <div className="col-span-2 text-center py-20 text-xs text-[#7A8694] font-light premium-glass rounded-lg" style={{ backgroundColor: 'rgba(4, 11, 18, 0.75)' }}>
                  No predictions found matching your filters.
                </div>
              ) : (
                filteredPredictions.map(p => {
                  const predVotes = p.initialVotes + (votes[p.id] || 0);
                  const style = getCategoryStyle(p.category);
                  const impact = getImpactLevel(p.confidenceScore);
                  const authorObj = FUTUROLOGISTS.find(f => f.name === p.author);

                  return (
                    <Link
                      href={`/predictions/${p.slug}`}
                      key={p.id}
                      className="group premium-glass flex flex-col justify-between p-6 min-h-[260px] border border-white/5 hover:translate-y-[-4px] transition-all duration-300 no-underline"
                      style={{
                        backgroundColor: 'rgba(4, 11, 18, 0.75)',
                        '--glow-color': style.color
                      } as any}
                    >
                      <div className="flex flex-col gap-3">
                        {/* Badge Header */}
                        <div className="flex justify-between items-center text-[10px] font-mono tracking-wider">
                          <span className="font-semibold uppercase" style={{ color: style.color }}>{p.category} · {p.city}</span>
                          <span className="text-[#7A8694] uppercase">{p.year} Target</span>
                        </div>

                        {/* Title */}
                        <div className="flex flex-col gap-2">
                          <h3 className="text-sm font-semibold text-white group-hover:text-white leading-snug tracking-wide transition-colors duration-300">
                            {p.title}
                          </h3>
                          <p className="text-xs text-[#7A8694] leading-relaxed line-clamp-2 font-light">
                            {p.description}
                          </p>
                        </div>

                        {/* Technical Parameters Matrix */}
                        <div className="grid grid-cols-2 gap-2 mt-1 border-t border-b border-white/5 py-2.5">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[8px] font-mono text-[#7A8694] uppercase tracking-wider">Confidence Level</span>
                            <span className="text-[10px] text-white/90 font-mono font-medium">
                              {p.confidenceScore > 75 ? 'HIGH (LEVEL III)' : 'MODERATE (LEVEL II)'}
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[8px] font-mono text-[#7A8694] uppercase tracking-wider">Impact Tier</span>
                            <span className={`text-[10px] font-mono font-semibold ${
                              impact === 'Critical' ? 'text-rose-400' : impact === 'High' ? 'text-amber-400' : 'text-[#00F5B0]'
                            }`}>
                              {impact.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Supporting Indicators */}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[8px] font-mono text-[#7A8694] uppercase tracking-wider">Supporting Indicators</span>
                          <span className="text-[10px] text-white/60 font-mono truncate leading-normal">
                            {getSupportingIndicators(p.category)}
                          </span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          {authorObj?.avatar ? (
                            <img 
                              src={authorObj.avatar} 
                              alt={p.author} 
                              className="w-4 h-4 rounded-full object-cover border border-white/10"
                            />
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[7px] font-mono text-white">
                              {p.author.charAt(0)}
                            </div>
                          )}
                          <span className="text-[9px] text-[#7A8694] font-semibold tracking-wide uppercase font-mono">{p.author}</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span 
                            className="text-[9px] font-mono rounded px-1.5 py-0.5 font-semibold"
                            style={{ color: style.color, backgroundColor: `${style.color}15`, border: `1px solid ${style.color}25` }}
                          >
                            Likelihood: {p.confidenceScore}%
                          </span>
                          <button
                            onClick={(e) => handleVote(p.id, e)}
                            className="hover:text-white text-[#7A8694] font-mono text-[10px] transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-none"
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
    </div>
  );
}

export default function PredictionsDirectoryPage() {
  return (
    <main className="h-screen w-screen overflow-y-auto bg-[#02060A] text-[#e2e8f0] relative custom-scrollbar">
      <BackgroundEffects earthMode="cyber" />
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[rgba(2,6,10,0.95)] to-transparent pointer-events-none z-10" />
      <Navbar />
      <Suspense fallback={
        <div className="h-full w-full flex items-center justify-center font-mono text-[#00F5B0] text-xs">
          LOADING FORECAST DIRECTORY...
        </div>
      }>
        <PredictionsDirectoryContent />
      </Suspense>

      <style jsx global>{`
        .group:hover {
          border-color: var(--glow-color, rgba(0, 245, 176, 0.3)) !important;
          box-shadow: 0 0 20px var(--glow-color, rgba(0, 245, 176, 0.1)) !important;
        }
      `}</style>
    </main>
  );
}
