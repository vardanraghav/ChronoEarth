'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCities } from '@/hooks/useCities';
import { usePredictions } from '@/hooks/usePredictions';
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase';
import { useFuturologists } from '@/hooks/useFuturologists';
import { CITIES_EXTENDED_DATA, getCitySlug } from '../data/citiesExtendedData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveCity?: (city: any) => void;
}

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: 'City' | 'Prediction' | 'Knowledge' | 'Futurologist' | 'Climate Record' | 'Market Signal';
  route: string;
  score: number;
}

export default function SearchModal({ isOpen, onClose, setActiveCity }: SearchModalProps) {
  const { cities } = useCities();
  const { predictions } = usePredictions();
  const { kbArticles } = useKnowledgeBase();
  const { futurologists } = useFuturologists();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('chrono_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  const addToRecentSearches = (query: string) => {
    if (!query.trim()) return;
    const next = [query, ...recentSearches.filter(q => q !== query)].slice(0, 5);
    setRecentSearches(next);
    try {
      localStorage.setItem('chrono_recent_searches', JSON.stringify(next));
    } catch (e) {}
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Simulate cognitive query analysis
  useEffect(() => {
    if (searchQuery) {
      setIsAnalyzing(true);
      const timer = setTimeout(() => setIsAnalyzing(false), 200);
      return () => clearTimeout(timer);
    } else {
      setIsAnalyzing(false);
    }
  }, [searchQuery]);

  const q = searchQuery.toLowerCase().trim();
  const results: SearchResult[] = [];

  if (q) {
    // 1. Cities
    cities.forEach(c => {
      let score = 0;
      const nameLower = c.name.toLowerCase();
      const countryLower = c.country.toLowerCase();
      
      if (nameLower === q || countryLower === q) score += 98;
      else if (nameLower.startsWith(q) || countryLower.startsWith(q)) score += 85;
      else if (nameLower.includes(q) || countryLower.includes(q)) score += 65;
      
      if (score > 0) {
        const carryingCapacity = (c.offsets.population * 1000 * c.offsets.popGrowth).toFixed(1) + "M";
        results.push({
          id: `city-${c.name}`,
          title: c.name,
          subtitle: `${c.country} // carrying capacity: ${carryingCapacity}`,
          description: `Metropolis node status. Carrying capacity: ${carryingCapacity}. Target year 2050 simulated data.`,
          category: 'City',
          route: `/city/${getCitySlug(c.name)}`,
          score
        });
      }
    });

    // 2. Predictions
    predictions.forEach(p => {
      let score = 0;
      const titleLower = p.title.toLowerCase();
      const descLower = p.description.toLowerCase();
      const tagsLower = p.tags.map(t => t.toLowerCase());
      
      if (titleLower === q) score += 100;
      else if (titleLower.startsWith(q)) score += 90;
      else if (titleLower.includes(q)) score += 70;
      else if (descLower.includes(q)) score += 45;
      else if (tagsLower.some(t => t.includes(q))) score += 60;
      
      if (score > 0) {
        results.push({
          id: `pred-${p.id}`,
          title: p.title,
          subtitle: `${p.category} // ${p.year} FORECAST // focus: ${p.city}`,
          description: p.description,
          category: 'Prediction',
          route: `/predictions/${p.slug}`,
          score
        });
      }
    });

    // 3. Knowledge Base / Codex Shards
    kbArticles.forEach(t => {
      let score = 0;
      const titleLower = t.title.toLowerCase();
      const descLower = t.shortDesc.toLowerCase();
      const contentLower = t.content.toLowerCase();
      
      if (titleLower === q) score += 98;
      else if (titleLower.startsWith(q)) score += 85;
      else if (titleLower.includes(q)) score += 65;
      else if (descLower.includes(q)) score += 50;
      else if (contentLower.includes(q)) score += 35;
      
      if (score > 0) {
        results.push({
          id: `kb-${t.id}`,
          title: t.title,
          subtitle: `Foresight Codex // ${t.category.toUpperCase()}`,
          description: t.shortDesc,
          category: 'Knowledge',
          route: `/knowledge?article=${t.id}`,
          score
        });
      }
    });

    // 4. Futurologists
    futurologists.forEach(f => {
      let score = 0;
      const nameLower = f.name.toLowerCase();
      const bioLower = f.bio.toLowerCase();
      const specLower = f.specialization.toLowerCase();
      
      if (nameLower === q) score += 95;
      else if (nameLower.startsWith(q)) score += 80;
      else if (nameLower.includes(q)) score += 60;
      else if (bioLower.includes(q) || specLower.includes(q)) score += 45;
      
      if (score > 0) {
        results.push({
          id: `fut-${f.slug}`,
          title: f.name,
          subtitle: `${f.role} // focus: ${f.specialization}`,
          description: f.bio,
          category: 'Futurologist',
          route: `/futurologists/${f.slug}`,
          score
        });
      }
    });

    // 5. Climate Records
    cities.forEach(c => {
      let score = 0;
      const nameLower = c.name.toLowerCase();
      const countryLower = c.country.toLowerCase();
      
      if (nameLower.includes(q) || countryLower.includes(q)) score += 55;
      else if ('climate records weather stress risk outlook 2050'.includes(q)) score += 35;
      
      if (score > 0) {
        const heatRiskVal = Math.round(Math.min(99, c.offsets.tempRise * 65));
        const waterStressVal = c.offsets.seaLevel > 0 ? Math.round(Math.min(99, c.offsets.seaLevel * 45 + 35)) : (c.name === 'New Delhi' || c.name === 'Cairo' || c.name === 'Nairobi' ? 88 : 42);
        const carryingCapVal = (c.offsets.population * 1000 * c.offsets.popGrowth).toFixed(1) + "M";

        results.push({
          id: `climate-${c.name}`,
          title: `${c.name} 2050 Climate Outlook`,
          subtitle: `carrying capacity: ${carryingCapVal} // heat risk: ${heatRiskVal}% // water stress: ${waterStressVal}%`,
          description: `Projected carrying capacity, heat stress index, water scarcity telemetry, and adaptation parameters for ${c.name} in 2050.`,
          category: 'Climate Record',
          route: `/city/${getCitySlug(c.name)}#climate`,
          score
        });
      }
    });

    // 6. Market Signals / Stocks
    const SEMI_COMPANIES = [
      { name: 'NVIDIA', ticker: 'NVDA', desc: 'AI hardware accelerator grids, tensor processing units, and quantum simulators.' },
      { name: 'AMD', ticker: 'AMD', desc: 'Enterprise high-performance computing, neural processors, and server matrices.' },
      { name: 'Intel', ticker: 'INTC', desc: 'Planetary lithography node developments, sub-2nm fabrication corridors.' },
      { name: 'TSMC', ticker: 'TSM', desc: 'Fabrication foundry hubs, extreme ultraviolet lithography wafer yields.' },
      { name: 'ASML', ticker: 'ASML', desc: 'High-NA EUV lithography systems, process tool chains, and chip alliances.' },
      { name: 'Qualcomm', ticker: 'QCOM', desc: 'System-on-chip network modems, mobile hardware, and edge computing architectures.' }
    ];
    
    SEMI_COMPANIES.forEach(comp => {
      let score = 0;
      const nameLower = comp.name.toLowerCase();
      const tickLower = comp.ticker.toLowerCase();
      const descLower = comp.desc.toLowerCase();
      
      if (nameLower === q || tickLower === q) score += 95;
      else if (nameLower.includes(q) || tickLower.includes(q)) score += 75;
      else if (descLower.includes(q) || 'semiconductor hardware stocks chip'.includes(q)) score += 40;
      
      if (score > 0) {
        results.push({
          id: `market-${comp.ticker}`,
          title: `${comp.name} (${comp.ticker})`,
          subtitle: `Silicon Market Signal // Semiconductor Supply Chain`,
          description: comp.desc,
          category: 'Market Signal',
          route: `/markets`,
          score
        });
      }
    });
  }

  results.sort((a, b) => b.score - a.score);

  // Reset activeIndex when query or results change
  useEffect(() => {
    setActiveIndex(results.length > 0 ? 0 : -1);
  }, [searchQuery, results.length]);

  const handleSelectResult = (res: SearchResult) => {
    addToRecentSearches(searchQuery);
    onClose();
    if (res.category === 'City' && setActiveCity) {
      const cityObj = cities.find(c => c.name === res.title);
      if (cityObj) setActiveCity(cityObj);
    }
    router.push(res.route);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      
      if (results.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setActiveIndex(prev => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < results.length) {
            handleSelectResult(results[activeIndex]);
          } else {
            handleSelectResult(results[0]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [results, activeIndex]);

  const totalResultsCount = results.length;
  const hasResults = totalResultsCount > 0;

  const promptSuggestions = [
    { text: 'What happens if AGI arrives in 2040?', query: 'AGI' },
    { text: 'India semiconductor industry in 2050', query: 'semiconductor' },
    { text: 'Future of fusion energy', query: 'fusion' },
    { text: 'How will floating cities scale?', query: 'floating' }
  ];

  const handlePromptClick = (queryVal: string) => {
    setSearchQuery(queryVal);
    addToRecentSearches(queryVal);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md pointer-events-auto"
      onClick={onClose}
    >
      <div 
        className="premium-glass w-full max-w-[660px] p-6 max-h-[85vh] flex flex-col gap-6 relative rounded-xl animate-fade-up font-mono"
        onClick={e => e.stopPropagation()}
        style={{
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(0, 245, 176, 0.15), inset 0 0 20px rgba(0, 245, 176, 0.02)',
          backgroundColor: 'rgba(2, 6, 10, 0.92)'
        }}
      >
        {/* Terminal Shell Header */}
        <div className="flex justify-between items-center border-b border-[#00F5B0]/20 pb-3 text-[10px] text-[#7A8694]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F5B0] animate-pulse" />
            <span className="text-[#00F5B0] uppercase tracking-wider font-semibold">CHRONO_OS v4.82 // COGNITIVE CORE</span>
          </div>
          <button 
            onClick={onClose} 
            aria-label="Close search"
            className="bg-transparent border-none text-[#7A8694] hover:text-white cursor-pointer tracking-wider transition-colors outline-none focus-visible:ring-1 focus-visible:ring-[#00F5B0]"
          >
            [ESC // CLOSE]
          </button>
        </div>

        {/* AI prompt Search Bar */}
        <div className="flex flex-col gap-1.5">
          <div className="relative flex items-center bg-black/40 border border-white/5 focus-within:border-[#00F5B0]/40 focus-within:ring-1 focus-within:ring-[#00F5B0] rounded px-4 py-3 transition-all">
            <span className="text-[#00F5B0] mr-2 font-bold select-none">chrono_os:~$ &gt;</span>
            <input
              ref={inputRef}
              type="text"
              name="q"
              autoComplete="search"
              placeholder="Query matrix parameters…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-xs text-white placeholder-white/20 font-mono tracking-wide"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
                className="absolute right-4 text-[10px] text-[#7A8694] hover:text-white cursor-pointer bg-transparent border-none outline-none focus-visible:ring-1 focus-visible:ring-[#00F5B0]"
              >
                [RESET]
              </button>
            )}
          </div>
          <div className="flex justify-between items-center px-1 text-[9px] text-[#7A8694]">
            <span>Status: {isAnalyzing ? 'Analyzing cognitive tensors...' : 'Terminal ready'}</span>
            {searchQuery && <span>Matches: {totalResultsCount} nodes</span>}
          </div>
        </div>

        {/* Dynamic Display Area */}
        <div className="custom-scrollbar flex-1 overflow-y-auto flex flex-col gap-4 pr-1 min-h-[200px]">
          {q.length === 0 ? (
            /* AI prompt Suggestions & Recent Searches */
            <div className="flex flex-col gap-4 py-2">
              {recentSearches.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-[#7A8694] uppercase tracking-wider font-semibold border-b border-white/5 pb-1.5 flex justify-between items-center">
                    <span>Recent Searches</span>
                    <button 
                      onClick={() => {
                        setRecentSearches([]);
                        try { localStorage.removeItem('chrono_recent_searches'); } catch (e) {}
                      }} 
                      className="text-[8px] text-red-400 hover:underline bg-transparent border-none cursor-pointer"
                    >
                      [CLEAR ALL]
                    </button>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePromptClick(s)}
                        className="px-2 py-0.5 bg-white/5 hover:bg-[#00F5B0]/15 border border-white/10 hover:border-[#00F5B0]/40 rounded text-[9px] text-white/70 hover:text-white transition-all cursor-pointer font-mono"
                      >
                        🔍 {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <span className="text-[10px] text-[#7A8694] uppercase tracking-wider font-semibold border-b border-white/5 pb-2">
                Executive Prompt Signals
              </span>
              <div className="flex flex-col gap-2">
                {promptSuggestions.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePromptClick(p.query)}
                    className="group text-left px-4 py-3 bg-white/2 hover:bg-[#00F5B0]/5 border border-white/5 hover:border-[#00F5B0]/20 rounded transition-all duration-300 font-mono cursor-pointer flex justify-between items-center text-xs text-white/80"
                  >
                    <span className="group-hover:text-white transition-colors">&gt; &quot;{p.text}&quot;</span>
                    <span className="text-[#7A8694] group-hover:text-[#00F5B0] text-[9px] font-semibold tracking-wider font-mono">
                      [EXECUTE PROMPT]
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[#7A8694] leading-relaxed mt-4 font-mono font-light">
                * Terminal searches full planetary index files including 2030/2040/2050 timeline targets, cities data records, knowledge sheets, and strategic vulnerability indexes.
              </p>
            </div>
          ) : isAnalyzing ? (
            /* Simulated Loading State */
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#00F5B0] text-xs">
              <div className="w-8 h-8 rounded-full border border-t-[#00F5B0] border-[#00F5B0]/15 animate-spin" />
              <span>ALIGNING QUANTUM COGNITIVE TENSORS...</span>
            </div>
          ) : !hasResults ? (
            <div className="py-16 text-center text-xs text-[#FF0055] font-mono font-light border border-white/5 bg-black/20 rounded">
              &gt; ERROR: NO INTEL CHANNELS CORRESPONDING TO VECTOR &quot;{q.toUpperCase()}&quot;
            </div>
          ) : (
            /* Unified Ranked Results List */
            <div className="flex flex-col gap-3">
              {results.map((res, idx) => {
                let neonColor = '#00F5B0';
                if (res.category === 'City') neonColor = '#0A84FF';
                else if (res.category === 'Knowledge') neonColor = '#00E5FF';
                else if (res.category === 'Futurologist') neonColor = '#BF5AF2';
                else if (res.category === 'Climate Record') neonColor = '#FF0055';
                else if (res.category === 'Market Signal') neonColor = '#FFB300';

                const isHighlighted = idx === activeIndex;

                // Relevance Badges setup
                const getRelevanceBadge = (score: number) => {
                  if (score >= 90) return { label: 'CORE INTEL', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
                  if (score >= 70) return { label: 'STRONG NODE', class: 'bg-orange-500/10 text-orange-400 border border-orange-500/20' };
                  return { label: 'CORRELATION', class: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' };
                };
                const badge = getRelevanceBadge(res.score);

                return (
                  <div
                    key={res.id}
                    onClick={() => handleSelectResult(res)}
                    className={`group p-4 rounded-lg cursor-pointer transition-all duration-200 flex flex-col gap-1.5 border-y border-r ${
                      isHighlighted 
                        ? 'bg-[#00F5B0]/10 border-t-[#00F5B0]/30 border-b-[#00F5B0]/30 border-r-[#00F5B0]/30 scale-[1.01] shadow-[0_0_15px_rgba(0,245,176,0.08)]' 
                        : 'bg-black/30 hover:bg-[#00F5B0]/5 border-t-white/5 border-b-white/5 border-r-white/5 hover:border-white/20'
                    }`}
                    style={{
                      borderLeft: `3px solid ${isHighlighted ? '#00F5B0' : neonColor}`
                    }}
                  >
                    <div className="flex justify-between items-center text-[9px] font-mono">
                      <div className="flex items-center gap-2">
                        <span style={{ color: isHighlighted ? '#00F5B0' : neonColor }} className="font-semibold uppercase tracking-wider">
                          {res.category}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[7px] font-bold ${badge.class}`}>
                          {badge.label} ({res.score}%)
                        </span>
                      </div>
                      <span className={`uppercase tracking-widest ${isHighlighted ? 'text-[#00F5B0]' : 'text-white/30'}`}>
                        {isHighlighted ? '[PRESS ENTER]' : '[INSPECT NODE]'}
                      </span>
                    </div>
                    <h4 className={`text-xs font-semibold m-0 tracking-wide font-mono transition-colors ${isHighlighted ? 'text-[#00F5B0]' : 'text-white group-hover:text-[#00F5B0]'}`}>
                      {res.title}
                    </h4>
                    <span className="text-[10px] text-white/50 font-mono font-medium">
                      {res.subtitle}
                    </span>
                    <p className="text-[10px] text-white/40 leading-relaxed font-sans font-light m-0 line-clamp-2">
                      {res.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
