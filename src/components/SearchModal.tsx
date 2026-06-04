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

  const cornerAccent = (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 8, height: 8, borderTop: `1px solid ${C.primary}`, borderLeft: `1px solid ${C.primary}` }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderTop: `1px solid ${C.primary}`, borderRight: `1px solid ${C.primary}` }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: 8, height: 8, borderBottom: `1px solid ${C.primary}`, borderLeft: `1px solid ${C.primary}` }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderBottom: `1px solid ${C.primary}`, borderRight: `1px solid ${C.primary}` }} />
    </>
  );

  return (
    <div 
      style={{
        position: 'fixed', 
        inset: 0, 
        background: 'rgba(2, 8, 15, 0.75)',
        backdropFilter: 'blur(12px)', 
        zIndex: 9999, 
        display: 'flex',
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px'
      }} 
      onClick={onClose}
    >
      <div style={panelStyle} onClick={e => e.stopPropagation()}>
        {cornerAccent}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 3, height: 10, background: C.primary, boxShadow: `0 0 6px ${C.primary}` }} />
            <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.30em', color: C.primary, textTransform: 'uppercase', fontFamily: 'monospace' }}>
              Global Platform Search Engine
            </span>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: C.primary, 
              cursor: 'pointer', 
              fontSize: 10,
              fontFamily: 'monospace'
            }}
          >
            [✕ CLOSE]
          </button>
        </div>

        <div style={{ position: 'relative' }}>
          <input
            type="text"
            autoFocus
            placeholder="Search cities, predictions, projects, technologies, people..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', 
              padding: '12px 14px', 
              background: '#02060A',
              border: `1px solid ${C.primary}40`, 
              outline: 'none', 
              color: '#fff',
              fontFamily: 'monospace', 
              fontSize: 11, 
              borderRadius: 2,
              boxShadow: '0 0 14px rgba(0, 245, 176, 0.03)'
            }}
          />
          <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 11 }}>🔍</span>
        </div>

        {/* Results container */}
        <div 
          className="custom-scrollbar" 
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 14,
            paddingRight: 4
          }}
        >
          {q.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.12em', fontFamily: 'monospace' }}>
              AWAITING PARAMETERS... ENTER QUERY TO INDEX THE CHRONO-DATABASE.
            </div>
          ) : !hasResults ? (
            <div style={{ padding: '30px 0', textAlign: 'center', fontSize: 9, color: C.primary, letterSpacing: '0.1em', fontFamily: 'monospace' }}>
              NO INDEX ENTRIES FOUND MATCHING QUERY.
            </div>
          ) : (
            <>
              {/* Cities matches */}
              {cityMatches.length > 0 && (
                <div>
                  <div style={{ fontSize: 7, color: 'rgba(0, 245, 176, 0.5)', letterSpacing: '0.15em', marginBottom: 6, fontFamily: 'monospace' }}>🏙️ CITIES MATCHED</div>
                  {cityMatches.map(c => (
                    <div key={c.name}
                      onClick={() => {
                        onClose();
                        if (setActiveCity) {
                          setActiveCity(c);
                        }
                        router.push(`/?city=${encodeURIComponent(c.name)}`);
                      }}
                      style={{
                        padding: '10px 12px', 
                        background: 'rgba(255,255,255,0.01)', 
                        border: '1px solid rgba(0, 245, 176, 0.08)',
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: 6,
                        cursor: 'pointer', 
                        borderRadius: 1,
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = C.primary}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0, 245, 176, 0.08)'}
                    >
                      <span style={{ fontSize: 9.5, color: '#fff', fontWeight: 500 }}>{c.name}, {c.country}</span>
                      <span style={{ fontSize: 7, color: C.secondary, letterSpacing: '0.1em', fontFamily: 'monospace' }}>[LOCATE ON GLOBE]</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Predictions matches */}
              {predMatches.length > 0 && (
                <div>
                  <div style={{ fontSize: 7, color: 'rgba(0, 245, 176, 0.5)', letterSpacing: '0.15em', marginBottom: 6, fontFamily: 'monospace' }}>🔮 GLOBAL FORECAST PREDICTIONS</div>
                  {predMatches.map(p => (
                    <div key={p.id}
                      onClick={() => {
                        onClose();
                        router.push(`/predictions/${p.slug}`);
                      }}
                      style={{
                        padding: '10px 12px', 
                        background: 'rgba(255,255,255,0.01)', 
                        border: '1px solid rgba(0, 245, 176, 0.08)',
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 4, 
                        marginBottom: 6,
                        cursor: 'pointer', 
                        borderRadius: 1,
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = C.primary}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0, 245, 176, 0.08)'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 9.5, color: '#fff', fontWeight: 500 }}>{p.title}</span>
                        <span style={{ fontSize: 7, color: C.secondary, fontFamily: 'monospace' }}>[{p.year} · {p.category.toUpperCase()}]</span>
                      </div>
                      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.40)' }}>{p.description.slice(0, 100)}...</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Project Matches (Landmarks & Projects) */}
              {projectMatches.length > 0 && (
                <div>
                  <div style={{ fontSize: 7, color: 'rgba(0, 245, 176, 0.5)', letterSpacing: '0.15em', marginBottom: 6, fontFamily: 'monospace' }}>🚧 PROJECTS & LANDMARKS</div>
                  {projectMatches.map((proj, idx) => (
                    <div key={idx}
                      onClick={() => {
                        onClose();
                        router.push(`/city/${proj.citySlug}`);
                      }}
                      style={{
                        padding: '10px 12px', 
                        background: 'rgba(255,255,255,0.01)', 
                        border: '1px solid rgba(0, 245, 176, 0.08)',
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 4, 
                        marginBottom: 6,
                        cursor: 'pointer', 
                        borderRadius: 1,
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = C.primary}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0, 245, 176, 0.08)'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 9.5, color: '#fff', fontWeight: 500 }}>{proj.name}</span>
                        <span style={{ fontSize: 7, color: C.accent, fontFamily: 'monospace' }}>[{proj.type.toUpperCase()} · {proj.cityName}]</span>
                      </div>
                      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.40)' }}>{proj.desc.slice(0, 100)}...</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Technologies Matches */}
              {techMatches.length > 0 && (
                <div>
                  <div style={{ fontSize: 7, color: 'rgba(0, 245, 176, 0.5)', letterSpacing: '0.15em', marginBottom: 6, fontFamily: 'monospace' }}>⚡ FUTURE TECH & KNOWLEDGE</div>
                  {techMatches.map(t => (
                    <div key={t.id}
                      onClick={() => {
                        onClose();
                        router.push(`/knowledge?article=${t.id}`);
                      }}
                      style={{
                        padding: '10px 12px', 
                        background: 'rgba(255,255,255,0.01)', 
                        border: '1px solid rgba(0, 245, 176, 0.08)',
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 4, 
                        marginBottom: 6,
                        cursor: 'pointer', 
                        borderRadius: 1,
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = C.primary}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0, 245, 176, 0.08)'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 9.5, color: '#fff', fontWeight: 500 }}>{t.title}</span>
                        <span style={{ fontSize: 7, color: C.emerald, fontFamily: 'monospace' }}>[{t.category.toUpperCase()}]</span>
                      </div>
                      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.40)' }}>{t.shortDesc}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* People Matches (Futurologists & Architects) */}
              {(futurologistMatches.length > 0 || architectMatches.length > 0) && (
                <div>
                  <div style={{ fontSize: 7, color: 'rgba(0, 245, 176, 0.5)', letterSpacing: '0.15em', marginBottom: 6, fontFamily: 'monospace' }}>👤 RESEARCHERS & ARCHITECTS</div>
                  
                  {/* Futurologists */}
                  {futurologistMatches.map(f => (
                    <div key={f.slug}
                      onClick={() => {
                        onClose();
                        router.push(`/futurologists/${f.slug}`);
                      }}
                      style={{
                        padding: '10px 12px', 
                        background: 'rgba(255,255,255,0.01)', 
                        border: '1px solid rgba(0, 245, 176, 0.08)',
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: 6,
                        cursor: 'pointer', 
                        borderRadius: 1,
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = C.primary}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0, 245, 176, 0.08)'}
                    >
                      <div>
                        <div style={{ fontSize: 9.5, color: '#fff', fontWeight: 500 }}>{f.name}</div>
                        <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{f.role}</div>
                      </div>
                      <span style={{ fontSize: 7, color: C.primary, letterSpacing: '0.1em', fontFamily: 'monospace' }}>[EXPERT SHEETS]</span>
                    </div>
                  ))}

                  {/* City Architects */}
                  {architectMatches.map((arch, idx) => (
                    <div key={idx}
                      onClick={() => {
                        onClose();
                        router.push(`/city/${arch.citySlug}`);
                      }}
                      style={{
                        padding: '10px 12px', 
                        background: 'rgba(255, 255, 255, 0.01)', 
                        border: '1px solid rgba(0, 245, 176, 0.08)',
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: 6,
                        cursor: 'pointer', 
                        borderRadius: 1,
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = C.primary}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0, 245, 176, 0.08)'}
                    >
                      <div>
                        <div style={{ fontSize: 9.5, color: '#fff', fontWeight: 500 }}>{arch.name}</div>
                        <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{arch.role} · {arch.cityName}</div>
                      </div>
                      <span style={{ fontSize: 7, color: C.accent, letterSpacing: '0.1em', fontFamily: 'monospace' }}>[METROPOLIS PANEL]</span>
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
