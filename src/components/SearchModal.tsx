'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { citiesRawData } from '../data/citiesData';
import { PREDICTIONS, KB_ARTICLES, FUTUROLOGISTS } from '../data/predictionsData';
import { CITIES_EXTENDED_DATA, getCitySlug } from '../data/citiesExtendedData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveCity?: (city: any) => void;
}

const C = {
  emerald: '#00F5B0',
  cyan: '#00D98F',
  iceBlue: '#00D98F',
  white: '#F5F7FA',
  bg:      'rgba(2, 8, 15, 0.92)',
  border: 'rgba(0, 245, 176, 0.15)',
  primary: '#00F5B0',
  secondary: '#00D98F',
  accent: '#FFFFFF',
};

export default function SearchModal({ isOpen, onClose, setActiveCity }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = searchQuery.toLowerCase().trim();

  // Index matches
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

  // Match Famous Places & Future Projects (Projects)
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

  const panelStyle: React.CSSProperties = {
    background: 'rgba(2, 8, 15, 0.95)',
    backdropFilter: 'blur(24px)',
    border: `1px solid rgba(0, 245, 176, 0.25)`,
    borderRadius: '2px',
    padding: '20px',
    boxShadow: '0 0 40px rgba(0,245,176,0.08), inset 0 0 20px rgba(0,245,176,0.02)',
    position: 'relative',
    width: '100%',
    maxWidth: '560px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    pointerEvents: 'auto',
    animation: 'fade-up 0.3s ease-out'
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md pointer-events-auto"
      onClick={onClose}
    >
      <div 
        className="card-tier-2 w-full max-w-[500px] p-6 max-h-[75vh] flex flex-col gap-4 relative animate-fade-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-[#00F5B0]/15 pb-2">
          <span className="text-[10px] font-mono tracking-widest text-[#7A8694] uppercase font-bold">
            Search Archive
          </span>
          <button 
            onClick={onClose} 
            className="bg-transparent border-none text-[#7A8694] hover:text-white cursor-pointer text-[10px] font-mono uppercase"
          >
            [Close]
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            autoFocus
            placeholder="Type keywords, cities, predictions, technologies..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-b border-[#00F5B0]/15 outline-none py-2 text-sm text-white font-light tracking-wide transition-colors focus:border-[#00F5B0]"
          />
        </div>

        {/* Results container */}
        <div className="custom-scrollbar flex-1 overflow-y-auto flex flex-col gap-4 pr-1">
          {q.length === 0 ? (
            <div className="py-8 text-center text-[10px] text-[#7A8694] tracking-widest font-mono">
              AWAITING SCAN CRITERIA... ENTER QUERY TO INDEX MEMORY SHARDS.
            </div>
          ) : !hasResults ? (
            <div className="py-8 text-center text-[10px] text-[#00F5B0] tracking-wider font-mono">
              NO ARCHIVES COMPILED MATCHING PROTOCOL.
            </div>
          ) : (
            <>
              {/* Cities matches */}
              {cityMatches.length > 0 && (
                <div>
                  <div className="text-[9px] text-[#7A8694] tracking-widest mb-1.5 font-mono uppercase font-bold">🏙️ Cities</div>
                  {cityMatches.map(c => (
                    <div key={c.name}
                      onClick={() => {
                        onClose();
                        if (setActiveCity) {
                          setActiveCity(c);
                        }
                        router.push(`/?city=${encodeURIComponent(c.name)}`);
                      }}
                      className="py-2 px-1 bg-transparent hover:bg-white/5 border-b border-[#00F5B0]/10 flex justify-between items-center cursor-pointer transition-all"
                    >
                      <span className="text-xs text-white font-light">{c.name}, {c.country}</span>
                      <span className="text-[8px] text-[#00D98F] font-mono uppercase tracking-wider">[Locate]</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Predictions matches */}
              {predMatches.length > 0 && (
                <div>
                  <div className="text-[9px] text-[#7A8694] tracking-widest mb-1.5 font-mono uppercase font-bold">🔮 Predictions</div>
                  {predMatches.map(p => (
                    <div key={p.id}
                      onClick={() => {
                        onClose();
                        router.push(`/predictions/${p.slug}`);
                      }}
                      className="py-2.5 px-1 bg-transparent hover:bg-white/5 border-b border-[#00F5B0]/10 flex flex-col gap-1 cursor-pointer transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white font-medium truncate pr-2">{p.title}</span>
                        <span className="text-[8px] text-[#00D98F] font-mono uppercase shrink-0">[{p.year}]</span>
                      </div>
                      <span className="text-[10px] text-[#7A8694] line-clamp-1">{p.description}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Project Matches */}
              {projectMatches.length > 0 && (
                <div>
                  <div className="text-[9px] text-[#7A8694] tracking-widest mb-1.5 font-mono uppercase font-bold">🚧 Projects</div>
                  {projectMatches.map((proj, idx) => (
                    <div key={idx}
                      onClick={() => {
                        onClose();
                        router.push(`/city/${proj.citySlug}`);
                      }}
                      className="py-2.5 px-1 bg-transparent hover:bg-white/5 border-b border-[#00F5B0]/10 flex flex-col gap-1 cursor-pointer transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white font-medium truncate pr-2">{proj.name}</span>
                        <span className="text-[8px] text-white/40 font-mono uppercase shrink-0">[{proj.cityName}]</span>
                      </div>
                      <span className="text-[10px] text-[#7A8694] line-clamp-1">{proj.desc}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Technologies Matches */}
              {techMatches.length > 0 && (
                <div>
                  <div className="text-[9px] text-[#7A8694] tracking-widest mb-1.5 font-mono uppercase font-bold">⚡ Tech & Knowledge</div>
                  {techMatches.map(t => (
                    <div key={t.id}
                      onClick={() => {
                        onClose();
                        router.push(`/knowledge?article=${t.id}`);
                      }}
                      className="py-2.5 px-1 bg-transparent hover:bg-white/5 border-b border-[#00F5B0]/10 flex flex-col gap-1 cursor-pointer transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white font-medium truncate pr-2">{t.title}</span>
                        <span className="text-[8px] text-[#00F5B0] font-mono uppercase shrink-0">[{t.category}]</span>
                      </div>
                      <span className="text-[10px] text-[#7A8694] line-clamp-1">{t.shortDesc}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* People Matches */}
              {(futurologistMatches.length > 0 || architectMatches.length > 0) && (
                <div>
                  <div className="text-[9px] text-[#7A8694] tracking-widest mb-1.5 font-mono uppercase font-bold">👥 Research Experts</div>
                  
                  {/* Futurologists */}
                  {futurologistMatches.map(f => (
                    <div key={f.slug}
                      onClick={() => {
                        onClose();
                        router.push(`/futurologists/${f.slug}`);
                      }}
                      className="py-2 px-1 bg-transparent hover:bg-white/5 border-b border-[#00F5B0]/10 flex justify-between items-center cursor-pointer transition-all"
                    >
                      <div>
                        <div className="text-xs text-white font-light">{f.name}</div>
                        <div className="text-[9px] text-[#7A8694] font-mono">{f.role}</div>
                      </div>
                      <span className="text-[8px] text-[#00F5B0] font-mono uppercase tracking-wider">[Expert Sheet]</span>
                    </div>
                  ))}

                  {/* City Architects */}
                  {architectMatches.map((arch, idx) => (
                    <div key={idx}
                      onClick={() => {
                        onClose();
                        router.push(`/city/${arch.citySlug}`);
                      }}
                      className="py-2 px-1 bg-transparent hover:bg-white/5 border-b border-[#00F5B0]/10 flex justify-between items-center cursor-pointer transition-all"
                    >
                      <div>
                        <div className="text-xs text-white font-light">{arch.name}</div>
                        <div className="text-[9px] text-[#7A8694] font-mono">{arch.role} · {arch.cityName}</div>
                      </div>
                      <span className="text-[8px] text-[#7A8694] font-mono uppercase tracking-wider">[Metropolis Panel]</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
