'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { citiesRawData } from '../data/citiesData';
import { PREDICTIONS, KB_ARTICLES, FUTUROLOGISTS } from '../data/predictionsData';
import { CITIES_EXTENDED_DATA, getCitySlug } from '../data/citiesExtendedData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveCity?: (city: any) => void;
}

export default function SearchModal({ isOpen, onClose, setActiveCity }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Auto-focus input on mount
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Simulate a quick cognitive query analysis when user types
  useEffect(() => {
    if (searchQuery) {
      setIsAnalyzing(true);
      const timer = setTimeout(() => setIsAnalyzing(false), 200);
      return () => clearTimeout(timer);
    } else {
      setIsAnalyzing(false);
    }
  }, [searchQuery]);

  if (!isOpen) return null;

  const q = searchQuery.toLowerCase().trim();

  // Search Match Categories
  const cityMatches = q ? citiesRawData.filter(c => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)) : [];
  const techMatches = q ? KB_ARTICLES.filter(t => t.title.toLowerCase().includes(q) || t.shortDesc.toLowerCase().includes(q)) : [];
  const predMatches = q ? PREDICTIONS.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) : [];

  // Match Futurologists & City Architects
  const futurologistMatches = q ? FUTUROLOGISTS.filter(f => f.name.toLowerCase().includes(q) || f.specialization.toLowerCase().includes(q) || f.role.toLowerCase().includes(q)) : [];
  
  const architectMatches: { name: string; role: string; citySlug: string; cityName: string }[] = [];
  if (q) {
    Object.entries(CITIES_EXTENDED_DATA).forEach(([citySlug, data]) => {
      data.notablePeople.forEach(p => {
        if (p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q) || p.specialty?.toLowerCase().includes(q) || (p as any).specialization?.toLowerCase().includes(q)) {
          const cityName = citiesRawData.find(c => getCitySlug(c.name) === citySlug)?.name || citySlug;
          architectMatches.push({ name: p.name, role: p.role, citySlug, cityName });
        }
      });
    });
  }

  // Match Famous Places & Future Projects
  const projectMatches: { name: string; desc: string; type: 'Landmark' | 'Project'; citySlug: string; cityName: string }[] = [];
  if (q) {
    Object.entries(CITIES_EXTENDED_DATA).forEach(([citySlug, data]) => {
      const cityName = citiesRawData.find(c => getCitySlug(c.name) === citySlug)?.name || citySlug;
      
      data.famousPlaces.forEach(p => {
        if (p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)) {
          projectMatches.push({ name: p.name, desc: p.desc, type: 'Landmark', citySlug, cityName });
        }
      });
      data.futureProjects.forEach(p => {
        if (p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)) {
          projectMatches.push({ name: p.name, desc: p.desc, type: 'Project', citySlug, cityName });
        }
      });
    });
  }

  const hasResults = 
    cityMatches.length > 0 || 
    techMatches.length > 0 || 
    predMatches.length > 0 || 
    futurologistMatches.length > 0 ||
    architectMatches.length > 0 ||
    projectMatches.length > 0;

  const totalResultsCount = 
    cityMatches.length + 
    techMatches.length + 
    predMatches.length + 
    futurologistMatches.length +
    architectMatches.length +
    projectMatches.length;

  const promptSuggestions = [
    { text: 'What happens if AGI arrives in 2040?', query: 'AGI' },
    { text: 'India semiconductor industry in 2050', query: 'semiconductor' },
    { text: 'Future of fusion energy', query: 'fusion' },
    { text: 'How will floating cities scale?', query: 'floating' }
  ];

  const handlePromptClick = (queryVal: string) => {
    setSearchQuery(queryVal);
    inputRef.current?.focus();
  };

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
            className="bg-transparent border-none text-[#7A8694] hover:text-white cursor-pointer tracking-wider transition-colors"
          >
            [ESC // CLOSE]
          </button>
        </div>

        {/* AI prompt Search Bar */}
        <div className="flex flex-col gap-1.5">
          <div className="relative flex items-center bg-black/40 border border-white/5 focus-within:border-[#00F5B0]/40 rounded px-4 py-3 transition-all">
            <span className="text-[#00F5B0] mr-2 font-bold select-none">chrono_os:~$ &gt;</span>
            <input
              ref={inputRef}
              type="text"
              placeholder="Query matrix parameters..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-xs text-white placeholder-white/20 font-mono tracking-wide"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 text-[10px] text-[#7A8694] hover:text-white cursor-pointer bg-transparent border-none"
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
        <div className="custom-scrollbar flex-1 overflow-y-auto flex flex-col gap-5 pr-1 min-h-[200px]">
          {q.length === 0 ? (
            /* AI prompt Suggestions */
            <div className="flex flex-col gap-4 py-2">
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
                    <span className="group-hover:text-white transition-colors">&gt; "{p.text}"</span>
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
              &gt; ERROR: NO INTEL CHANNELS CORRESPONDING TO VECTOR "{q.toUpperCase()}"
            </div>
          ) : (
            /* Dossier Results Grid */
            <div className="flex flex-col gap-5">
              
              {/* Predictions Shards */}
              {predMatches.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-[#7A8694] uppercase tracking-wider font-semibold">
                    Dossier // Forecast Shards ({predMatches.length})
                  </span>
                  {predMatches.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => {
                        onClose();
                        router.push(`/predictions/${p.slug}`);
                      }}
                      className="group p-4 bg-black/20 hover:bg-[#00F5B0]/5 border border-white/5 hover:border-[#00F5B0]/25 rounded flex flex-col gap-2 cursor-pointer transition-all duration-300"
                    >
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-[#00F5B0] font-semibold uppercase">{p.category} // {p.city.toUpperCase()}</span>
                        <span className="text-white/40">{p.year} FORECAST</span>
                      </div>
                      <h4 className="text-xs font-semibold text-white group-hover:text-[#00F5B0] transition-colors leading-snug tracking-wide m-0">
                        {p.title}
                      </h4>
                      <p className="text-[10px] text-[#7A8694] leading-relaxed line-clamp-2 m-0 font-light">
                        {p.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Cities Nodes */}
              {cityMatches.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-[#7A8694] uppercase tracking-wider font-semibold">
                    Dossier // City Nodes ({cityMatches.length})
                  </span>
                  {cityMatches.map(c => (
                    <div 
                      key={c.name}
                      onClick={() => {
                        onClose();
                        router.push(`/dashboard?city=${encodeURIComponent(c.name)}`);
                      }}
                      className="group p-3 bg-black/20 hover:bg-[#0A84FF]/5 border border-white/5 hover:border-[#0A84FF]/25 rounded flex justify-between items-center cursor-pointer transition-all duration-300"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-white font-semibold">{c.name}</span>
                        <span className="text-[9px] text-[#7A8694] uppercase tracking-wider">{c.country}</span>
                      </div>
                      <span className="text-[9px] text-[#0A84FF] font-semibold tracking-wider">[LOCATE GLOBE]</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Project Shards */}
              {projectMatches.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-[#7A8694] uppercase tracking-wider font-semibold">
                    Dossier // Project Systems ({projectMatches.length})
                  </span>
                  {projectMatches.map((proj, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        onClose();
                        router.push(`/city/${proj.citySlug}`);
                      }}
                      className="group p-4 bg-black/20 hover:bg-[#BF5AF2]/5 border border-white/5 hover:border-[#BF5AF2]/25 rounded flex flex-col gap-2 cursor-pointer transition-all duration-300"
                    >
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-[#BF5AF2] font-semibold uppercase">{proj.type} // {proj.cityName.toUpperCase()}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-white group-hover:text-[#BF5AF2] transition-colors leading-snug tracking-wide m-0">
                        {proj.name}
                      </h4>
                      <p className="text-[10px] text-[#7A8694] leading-relaxed line-clamp-2 m-0 font-light">
                        {proj.desc}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Technology Shards */}
              {techMatches.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-[#7A8694] uppercase tracking-wider font-semibold">
                    Dossier // Codex Shards ({techMatches.length})
                  </span>
                  {techMatches.map(t => (
                    <div 
                      key={t.id}
                      onClick={() => {
                        onClose();
                        router.push(`/knowledge?article=${t.id}`);
                      }}
                      className="group p-4 bg-black/20 hover:bg-[#00F5B0]/5 border border-white/5 hover:border-[#00F5B0]/25 rounded flex flex-col gap-2 cursor-pointer transition-all duration-300"
                    >
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-[#00F5B0] font-semibold uppercase">CODEX // {t.category.toUpperCase()}</span>
                        <span className="text-white/40">READINESS: {t.readinessIndex}%</span>
                      </div>
                      <h4 className="text-xs font-semibold text-white group-hover:text-[#00F5B0] transition-colors leading-snug tracking-wide m-0">
                        {t.title}
                      </h4>
                      <p className="text-[10px] text-[#7A8694] leading-relaxed line-clamp-2 m-0 font-light">
                        {t.shortDesc}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Futurologist Shards */}
              {(futurologistMatches.length > 0 || architectMatches.length > 0) && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-[#7A8694] uppercase tracking-wider font-semibold">
                    Dossier // Personnel Files ({futurologistMatches.length + architectMatches.length})
                  </span>
                  
                  {/* Futurologists */}
                  {futurologistMatches.map(f => (
                    <div 
                      key={f.slug}
                      onClick={() => {
                        onClose();
                        router.push(`/futurologists/${f.slug}`);
                      }}
                      className="group p-3 bg-black/20 hover:bg-[#FFB300]/5 border border-white/5 hover:border-[#FFB300]/25 rounded flex justify-between items-center cursor-pointer transition-all duration-300"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-white font-semibold">{f.name}</span>
                        <span className="text-[9px] text-[#7A8694] uppercase tracking-wider">{f.role} // {f.specialization}</span>
                      </div>
                      <span className="text-[9px] text-[#FFB300] font-semibold tracking-wider">[DOSSIER PROFILE]</span>
                    </div>
                  ))}

                  {/* City Architects */}
                  {architectMatches.map((arch, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        onClose();
                        router.push(`/city/${arch.citySlug}`);
                      }}
                      className="group p-3 bg-black/20 hover:bg-[#FFB300]/5 border border-white/5 hover:border-[#FFB300]/25 rounded flex justify-between items-center cursor-pointer transition-all duration-300"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-white font-semibold">{arch.name}</span>
                        <span className="text-[9px] text-[#7A8694] uppercase tracking-wider">{arch.role} // {arch.cityName.toUpperCase()} NODE</span>
                      </div>
                      <span className="text-[9px] text-[#7A8694] font-semibold tracking-wider">[METROPOLIS]</span>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
