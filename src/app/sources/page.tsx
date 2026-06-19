'use client';

import Navbar from '@/components/Navbar';
import BackgroundEffects from '@/components/BackgroundEffects';
import Footer from '@/components/Footer';

// Inline SVGs for all services to ensure compilation safety and clean look
const Icons = {
  nasa: (
    <svg className="w-6 h-6 text-[#BF5AF2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  ),
  usgs: (
    <svg className="w-6 h-6 text-[#EF4444]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 12c.5 0 1-.3 1.2-.8l1.6-4.4c.2-.5.7-.8 1.2-.8s1 .3 1.2.8l2.6 7.4c.2.5.7.8 1.2.8s1-.3 1.2-.8l1.6-4.4c.2-.5.7-.8 1.2-.8s1 .3 1.2.8l2.6 7.4c.2.5.7.8 1.2.8s1-.3 1.2-.8l1.6-4.4c.2-.5.7-.8 1.2-.8.5 0 1 .3 1.2.8" />
    </svg>
  ),
  financial: (
    <svg className="w-6 h-6 text-[#00F5B0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  weather: (
    <svg className="w-6 h-6 text-[#00E5FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ),
  news: (
    <svg className="w-6 h-6 text-[#FF9500]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <path d="M16 8h2M16 12h2M16 16h2M6 8h6M6 12h6M6 16h6" />
    </svg>
  ),
  ai: (
    <svg className="w-6 h-6 text-[#9b5de5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  mapping: (
    <svg className="w-6 h-6 text-[#00E5FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  ),
  db: (
    <svg className="w-6 h-6 text-[#3ecf8e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </svg>
  ),
  firebase: (
    <svg className="w-6 h-6 text-[#FFCA28]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2L3 21h18L12 2z" />
      <path d="M12 2l4.5 13.5H7.5L12 2z" />
    </svg>
  ),
  vercel: (
    <svg className="w-6 h-6 text-[#ffffff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="12 2 2 22 22 22" />
    </svg>
  ),
  code: (
    <svg className="w-6 h-6 text-[#00D98F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  external: (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
    </svg>
  )
};

export default function SourcesPage() {
  const dataFeeds = [
    {
      name: 'NASA APIs (APOD, NEO, EPIC)',
      desc: 'NASA Open Innovation Services provides active data feeds including near-Earth object orbit calculations, earth polychromatic imagery, and astronomy image cataloging.',
      useCase: 'Used in the Space Center dashboard, Asteroid Risk telemetry charts, and Earth Observation widgets to map real-time cosmic vectors.',
      url: 'https://api.nasa.gov',
      icon: Icons.nasa,
      color: 'rgba(191, 90, 242, 0.15)',
      borderColor: 'border-[#BF5AF2]/30 hover:border-[#BF5AF2]/60'
    },
    {
      name: 'USGS Earthquake API',
      desc: 'The United States Geological Survey Earthquake Hazards Program publishes minute-by-minute seismic measurements including global epicenter coordinates, depths, and fault magnitudes.',
      useCase: 'Feeds coordinates directly into the Seismic Core telemetry logs, generating the 3D tectonic compression markers displayed on the globe.',
      url: 'https://earthquake.usgs.gov',
      icon: Icons.usgs,
      color: 'rgba(239, 68, 68, 0.15)',
      borderColor: 'border-[#EF4444]/30 hover:border-[#EF4444]/60'
    },
    {
      name: 'Alpha Vantage Market Index',
      desc: 'Alpha Vantage offers automated equity datasets, commodity price ratios, and stock quote variables with robust, real-time update frequencies.',
      useCase: 'Supplies baseline market metrics for foundries and semiconductor manufacturers, specifically NVIDIA, AMD, INTC, TSMC, ASML, and QCOM.',
      url: 'https://www.alphavantage.co',
      icon: Icons.financial,
      color: 'rgba(0, 245, 176, 0.15)',
      borderColor: 'border-[#00F5B0]/30 hover:border-[#00F5B0]/60'
    },
    {
      name: 'Open-Meteo Weather Core',
      desc: 'Open-Meteo provides developer-friendly meteorology data APIs. Resolves climate data on coordinates worldwide without caching bottlenecks.',
      useCase: 'Establishes the real-time weather and temperature baseline for cities worldwide, forming the start-values of predictive future simulations.',
      url: 'https://open-meteo.com',
      icon: Icons.weather,
      color: 'rgba(0, 229, 255, 0.15)',
      borderColor: 'border-[#00E5FF]/30 hover:border-[#00E5FF]/60'
    },
    {
      name: 'GNews Search System',
      desc: 'GNews indexes and updates breaking articles from global publishers, returning structured search summaries and image attributions.',
      useCase: 'Pulls the latest geopolitical news, climate updates, and global semiconductor news feeds seen throughout dashboard panels.',
      url: 'https://gnews.io',
      icon: Icons.news,
      color: 'rgba(255, 149, 0, 0.15)',
      borderColor: 'border-[#FF9500]/30 hover:border-[#FF9500]/60'
    }
  ];

  const aiProviders = [
    {
      name: 'Google Gemini Platform',
      desc: 'Google Gemini delivers state-of-the-art cognitive modeling, deep conversational context preservation, and intent parsing.',
      useCase: 'Acts as the primary intelligence processor behind FutureChat, resolving conversational inquiries, analyzing news trends, and projecting timeline predictions.',
      url: 'https://ai.google.dev',
      icon: Icons.ai,
      color: 'rgba(155, 93, 229, 0.15)',
      borderColor: 'border-[#9b5de5]/30 hover:border-[#9b5de5]/60'
    },
    {
      name: 'Groq LPU Network',
      desc: 'Groq LPU (Language Processing Unit) architecture processes open models with ultra-low latency, yielding near-instant responses.',
      useCase: 'Acts as the secondary fallback reasoning agent. Handles dialogue workflows in case of Gemini rate limit exhaustion.',
      url: 'https://groq.com',
      icon: Icons.ai,
      color: 'rgba(241, 91, 181, 0.15)',
      borderColor: 'border-[#f15bb5]/30 hover:border-[#f15bb5]/60'
    }
  ];

  const mappingSystems = [
    {
      name: 'CesiumJS WebGL Globe',
      desc: 'An open-source JavaScript library for world-class 3D globes and map rendering, incorporating complex geospatial math and hardware-accelerated WebGL layers.',
      useCase: 'Serves as the foundation for the visual globe interface, rendering historical maps, orbital paths, and geopolitical border meshes.',
      url: 'https://cesium.com/platform/cesiumjs/',
      icon: Icons.mapping,
      color: 'rgba(0, 229, 255, 0.15)',
      borderColor: 'border-[#00E5FF]/30 hover:border-[#00E5FF]/60'
    },
    {
      name: 'CartoDB Base Maps',
      desc: 'CartoDB provides dark theme raster tiles designed for maps with vibrant overlays, maintaining low bandwidth and excellent contrast.',
      useCase: 'Renders the "Dark Matter" base layer backdrop behind the interactive globe, highlighting tectonic lines and orbital visualizers.',
      url: 'https://carto.com',
      icon: Icons.mapping,
      color: 'rgba(255, 255, 255, 0.05)',
      borderColor: 'border-white/10 hover:border-white/30'
    }
  ];

  const infrastructure = [
    {
      name: 'Firebase Auth Protocol',
      desc: 'Google Firebase Authentication provides secure client-side user sessions, OAuth federated logins, password verification, and reset loops.',
      useCase: 'Secures ChronoEarth accounts, managing Google SSO login flows, credentials, and protected dashboard routing filters.',
      url: 'https://firebase.google.com',
      icon: Icons.firebase,
      color: 'rgba(255, 202, 40, 0.12)',
      borderColor: 'border-[#FFCA28]/30 hover:border-[#FFCA28]/60'
    },
    {
      name: 'Supabase Database Node',
      desc: 'Supabase bundles PostgreSQL database instances with direct PostgREST endpoints, secure row-level security, and real-time subscription channels.',
      useCase: 'Acts as the central relational storage mesh. Houses user states, earthquake catalogs, news cache, and semiconductor indices.',
      url: 'https://supabase.com',
      icon: Icons.db,
      color: 'rgba(62, 207, 142, 0.12)',
      borderColor: 'border-[#3ecf8e]/30 hover:border-[#3ecf8e]/60'
    },
    {
      name: 'Vercel Deployment Mesh',
      desc: 'Vercel provides developer-friendly serverless host meshes, globally cached edge CDNs, and robust continuous integration triggers.',
      useCase: 'Hosts the client-side Next.js applications and handles edge function execution, securing speedy loading worldwide.',
      url: 'https://vercel.com',
      icon: Icons.vercel,
      color: 'rgba(255, 255, 255, 0.05)',
      borderColor: 'border-white/20 hover:border-white/50'
    }
  ];

  const frameworks = [
    {
      name: 'Next.js Framework',
      desc: 'React meta-framework optimized for server rendering, static compilation, and routing.',
      url: 'https://nextjs.org'
    },
    {
      name: 'React Library',
      desc: 'Component-driven frontend client library supplying highly reactive UI component behaviors.',
      url: 'https://react.dev'
    },
    {
      name: 'TypeScript Protocol',
      desc: 'Typed dialect of JavaScript that compile-checks errors, increasing stability.',
      url: 'https://www.typescriptlang.org'
    },
    {
      name: 'Tailwind CSS Utility',
      desc: 'Utility-first utility structure for speedy styling adjustments and modern typography scales.',
      url: 'https://tailwindcss.com'
    }
  ];

  return (
    <main className="min-h-screen w-full bg-[#02060A] text-[#e2e8f0] relative pb-24 font-mono">
      {/* Background Starfield */}
      <BackgroundEffects earthMode="cyber" />

      {/* Top Gradient Overlay */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[rgba(2,6,10,0.95)] to-transparent pointer-events-none z-10" />

      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-32 relative z-20 flex flex-col gap-12 animate-fade-up">
        
        {/* ====================================================
            SECTION 1 — PAGE HEADER
            ==================================================== */}
        <div className="flex flex-col gap-3 border-b border-white/5 pb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E5FF]/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="flex items-center gap-2 text-[#00E5FF] text-xs font-semibold uppercase tracking-[0.3em]">
            <span>📚 CITED CREDENTIAL DATABASE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
          </div>
          <h1 className="text-3xl font-light text-white tracking-wider uppercase m-0">
            Sources & <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#BF5AF2]">Attributions</span>
          </h1>
          <p className="text-xs text-white/50 uppercase tracking-widest m-0 leading-relaxed font-sans font-light max-w-3xl">
            ChronoEarth is built using publicly available datasets, APIs, open-source technologies, visualization frameworks, cloud infrastructure, and AI systems. We acknowledge and credit all providers listed below.
          </p>
        </div>

        {/* ====================================================
            SECTION 2 — DATA SOURCES
            ==================================================== */}
        <div className="flex flex-col gap-6">
          <div className="border-l-2 border-[#00E5FF] pl-3 py-0.5">
            <h2 className="text-lg font-semibold text-white uppercase tracking-wider m-0">1. Data Sources</h2>
            <span className="text-[10px] text-white/40 uppercase tracking-widest">Planetary telemetry & indices feeds</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dataFeeds.map((src) => (
              <div 
                key={src.name} 
                className={`premium-glass p-5 rounded border ${src.borderColor} flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(0,229,255,0.1)]`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 rounded" style={{ backgroundColor: src.color }}>
                        {src.icon}
                      </div>
                      <span className="text-xs font-bold text-white uppercase tracking-wider">{src.name}</span>
                    </div>
                    <a 
                      href={src.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[9px] text-[#00E5FF] hover:underline font-bold uppercase tracking-wider no-underline flex items-center gap-1 group"
                    >
                      <span>OFFICIAL LINK</span>
                      <span className="opacity-70 group-hover:opacity-100 transition-opacity">{Icons.external}</span>
                    </a>
                  </div>
                  <p className="text-xs text-[#7A8694] leading-relaxed font-sans font-light">
                    {src.desc}
                  </p>
                </div>
                <div className="border-t border-white/5 pt-3.5 mt-4 flex flex-col gap-1.5">
                  <span className="text-[8px] font-mono text-[#00E5FF] uppercase tracking-wider font-bold">ChronoEarth Usage:</span>
                  <p className="text-[11px] text-white/80 leading-relaxed font-sans font-light m-0">
                    {src.useCase}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ====================================================
            SECTION 3 — AI PROVIDERS
            ==================================================== */}
        <div className="flex flex-col gap-6">
          <div className="border-l-2 border-[#9b5de5] pl-3 py-0.5">
            <h2 className="text-lg font-semibold text-white uppercase tracking-wider m-0">2. AI Providers</h2>
            <span className="text-[10px] text-white/40 uppercase tracking-widest">Cognitive processing & dialog nodes</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiProviders.map((ai) => (
              <div 
                key={ai.name} 
                className={`premium-glass p-5 rounded border ${ai.borderColor} flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(155,93,229,0.1)]`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 rounded" style={{ backgroundColor: ai.color }}>
                        {ai.icon}
                      </div>
                      <span className="text-xs font-bold text-white uppercase tracking-wider">{ai.name}</span>
                    </div>
                    <a 
                      href={ai.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[9px] text-[#9b5de5] hover:underline font-bold uppercase tracking-wider no-underline flex items-center gap-1 group"
                    >
                      <span>OFFICIAL SITE</span>
                      <span className="opacity-70 group-hover:opacity-100 transition-opacity">{Icons.external}</span>
                    </a>
                  </div>
                  <p className="text-xs text-[#7A8694] leading-relaxed font-sans font-light">
                    {ai.desc}
                  </p>
                </div>
                <div className="border-t border-white/5 pt-3.5 mt-4 flex flex-col gap-1.5">
                  <span className="text-[8px] font-mono text-[#9b5de5] uppercase tracking-wider font-bold">Model Usage:</span>
                  <p className="text-[11px] text-white/80 leading-relaxed font-sans font-light m-0">
                    {ai.useCase}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ====================================================
            SECTION 4 — VISUALIZATION & MAPPING
            ==================================================== */}
        <div className="flex flex-col gap-6">
          <div className="border-l-2 border-[#00E5FF] pl-3 py-0.5">
            <h2 className="text-lg font-semibold text-white uppercase tracking-wider m-0">3. Visualization & Mapping</h2>
            <span className="text-[10px] text-white/40 uppercase tracking-widest">Geospatial layout engine & vector layers</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mappingSystems.map((map) => (
              <div 
                key={map.name} 
                className={`premium-glass p-5 rounded border ${map.borderColor} flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(0,229,255,0.1)]`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 rounded" style={{ backgroundColor: map.color }}>
                        {map.icon}
                      </div>
                      <span className="text-xs font-bold text-white uppercase tracking-wider">{map.name}</span>
                    </div>
                    <a 
                      href={map.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[9px] text-[#00E5FF] hover:underline font-bold uppercase tracking-wider no-underline flex items-center gap-1 group"
                    >
                      <span>OFFICIAL SITE</span>
                      <span className="opacity-70 group-hover:opacity-100 transition-opacity">{Icons.external}</span>
                    </a>
                  </div>
                  <p className="text-xs text-[#7A8694] leading-relaxed font-sans font-light">
                    {map.desc}
                  </p>
                </div>
                <div className="border-t border-white/5 pt-3.5 mt-4 flex flex-col gap-1.5">
                  <span className="text-[8px] font-mono text-[#00E5FF] uppercase tracking-wider font-bold">Purpose:</span>
                  <p className="text-[11px] text-white/80 leading-relaxed font-sans font-light m-0">
                    {map.useCase}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ====================================================
            SECTION 5 — PLATFORM INFRASTRUCTURE
            ==================================================== */}
        <div className="flex flex-col gap-6">
          <div className="border-l-2 border-[#FFCA28] pl-3 py-0.5">
            <h2 className="text-lg font-semibold text-white uppercase tracking-wider m-0">4. Platform Infrastructure</h2>
            <span className="text-[10px] text-white/40 uppercase tracking-widest">Authentication databases & hosting endpoints</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {infrastructure.map((inf) => (
              <div 
                key={inf.name} 
                className={`premium-glass p-5 rounded border ${inf.borderColor} flex flex-col justify-between min-h-[240px] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(255,202,40,0.08)]`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded" style={{ backgroundColor: inf.color }}>
                        {inf.icon}
                      </div>
                      <span className="text-[11px] font-bold text-white uppercase tracking-wider truncate max-w-[100px]" title={inf.name}>{inf.name}</span>
                    </div>
                    <a 
                      href={inf.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[8px] text-[#FFCA28] hover:underline font-bold uppercase tracking-wider no-underline flex items-center gap-0.5 group shrink-0"
                    >
                      <span>LINK</span>
                      <span className="opacity-70 group-hover:opacity-100 transition-opacity scale-75">{Icons.external}</span>
                    </a>
                  </div>
                  <p className="text-[11px] text-[#7A8694] leading-relaxed font-sans font-light">
                    {inf.desc}
                  </p>
                </div>
                <div className="border-t border-white/5 pt-3 mt-4 flex flex-col gap-1">
                  <span className="text-[8px] font-mono text-[#FFCA28] uppercase tracking-wider font-bold">Purpose:</span>
                  <p className="text-[11px] text-white/80 leading-normal font-sans font-light m-0">
                    {inf.useCase}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ====================================================
            SECTION 6 — DEVELOPMENT FRAMEWORKS
            ==================================================== */}
        <div className="flex flex-col gap-6">
          <div className="border-l-2 border-[#00D98F] pl-3 py-0.5">
            <h2 className="text-lg font-semibold text-white uppercase tracking-wider m-0">5. Development Frameworks</h2>
            <span className="text-[10px] text-white/40 uppercase tracking-widest">Base developer configurations & languages</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {frameworks.map((fw) => (
              <div 
                key={fw.name} 
                className="premium-glass p-4 rounded border border-white/5 flex flex-col justify-between min-h-[140px] hover:border-[#00D98F]/40 transition-colors group"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-white tracking-wide uppercase">{fw.name}</span>
                    <a 
                      href={fw.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[8px] text-[#00D98F] hover:underline font-bold no-underline flex items-center gap-0.5 group-hover:opacity-100 opacity-60 transition-opacity"
                    >
                      {Icons.external}
                    </a>
                  </div>
                  <p className="text-[11px] text-[#7A8694] leading-relaxed font-sans font-light">
                    {fw.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ====================================================
            SECTION 7 — IMAGE ATTRIBUTIONS
            ==================================================== */}
        <div className="flex flex-col gap-6">
          <div className="border-l-2 border-[#BF5AF2] pl-3 py-0.5">
            <h2 className="text-lg font-semibold text-white uppercase tracking-wider m-0">6. Image Attributions</h2>
            <span className="text-[10px] text-white/40 uppercase tracking-widest">Digital content assets & sourcing parameters</span>
          </div>

          <div className="premium-glass p-6 rounded border border-[#BF5AF2]/20 flex flex-col gap-4 font-sans font-light">
            <p className="text-xs text-[#E2E8F0] leading-relaxed m-0">
              ChronoEarth strictly structures image content resolution using an automated priority sequence:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono mt-2">
              <div className="bg-white/5 border border-white/5 p-4 rounded flex flex-col gap-1.5">
                <span className="text-[10px] text-[#00E5FF] font-bold uppercase tracking-wider">1. Official API Data</span>
                <span className="text-[11px] text-[#7A8694] font-sans">Fetches live imagery directly from provider endpoints (such as NASA APOD HD imagery and NASA EPIC daily planetary observations).</span>
              </div>
              <div className="bg-white/5 border border-white/5 p-4 rounded flex flex-col gap-1.5">
                <span className="text-[10px] text-[#00E5FF] font-bold uppercase tracking-wider">2. Cache Database lookup</span>
                <span className="text-[11px] text-[#7A8694] font-sans">Locates verified static images stored via Supabase buckets or external news references.</span>
              </div>
              <div className="bg-white/5 border border-white/5 p-4 rounded flex flex-col gap-1.5">
                <span className="text-[10px] text-[#00E5FF] font-bold uppercase tracking-wider">3. Category Fallbacks</span>
                <span className="text-[11px] text-[#7A8694] font-sans">Loads thematic imagery via public image banks (such as Unsplash) mapping to specific metadata classes (e.g. semiconductor cleanrooms, fusion research, satellite arrays).</span>
              </div>
            </div>
            <p className="text-xs text-[#7A8694] leading-relaxed m-0 mt-2 font-sans border-t border-white/5 pt-4">
              All external imagery and brand logos remain the property of their respective owners. ChronoEarth does not claim ownership over raw dataset graphics or third-party imagery.
            </p>
          </div>
        </div>

        {/* ====================================================
            SECTION 8 — OPEN SOURCE ACKNOWLEDGEMENT
            ==================================================== */}
        <div className="flex flex-col gap-6">
          <div className="border-l-2 border-[#00F5B0] pl-3 py-0.5">
            <h2 className="text-lg font-semibold text-white uppercase tracking-wider m-0">7. Community & Research</h2>
            <span className="text-[10px] text-white/40 uppercase tracking-widest">Public technology credits</span>
          </div>

          <div className="premium-glass p-6 rounded border border-[#00F5B0]/20 flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F5B0]/5 rounded-full blur-[40px] pointer-events-none" />
            <span className="text-[10px] font-mono text-[#00F5B0] uppercase tracking-[0.25em] font-bold">🤝 Open Source Acknowledgement</span>
            <p className="text-xs text-[#7A8694] font-sans font-light leading-relaxed m-0 mt-1">
              "ChronoEarth would not be possible without the open-source community and the organizations that provide public datasets, APIs, research, and development tools."
            </p>
          </div>
        </div>

        {/* ====================================================
            SECTION 9 — LEGAL DISCLAIMER
            ==================================================== */}
        <div className="flex flex-col gap-6">
          <div className="border-l-2 border-red-500 pl-3 py-0.5">
            <h2 className="text-lg font-semibold text-white uppercase tracking-wider m-0">8. Legal & system disclaimers</h2>
            <span className="text-[10px] text-white/40 uppercase tracking-widest">Regulatory compliance statements</span>
          </div>

          <div className="premium-glass p-6 rounded border border-red-500/20 flex flex-col gap-4">
            <span className="text-[10px] font-mono text-red-400 uppercase tracking-[0.25em] font-bold">⚠️ DIAGNOSTIC CORE DISCLAIMER</span>
            <ul className="text-xs text-[#7A8694] font-sans font-light leading-relaxed m-0 flex flex-col gap-2 list-none p-0">
              <li className="flex gap-2 items-start text-[#7A8694]">
                <span className="text-red-400 font-mono select-none font-bold">[-]</span>
                <span>ChronoEarth is an educational and research platform. It is not configured for commercial real-time trade execution or critical life-safety applications.</span>
              </li>
              <li className="flex gap-2 items-start text-[#7A8694]">
                <span className="text-red-400 font-mono select-none font-bold">[-]</span>
                <span>Predictions, projection timelines, and forecasts are analytical simulations generated via machine learning algorithms and meteorological model scripts. They should not be considered absolute factual forecasts.</span>
              </li>
              <li className="flex gap-2 items-start text-[#7A8694]">
                <span className="text-red-400 font-mono select-none font-bold">[-]</span>
                <span>All telemetry updates, seismic logs, and financial rates depend entirely on upstream API endpoints and external providers. ChronoEarth holds no liability for downstream transmission delays or content accuracy.</span>
              </li>
              <li className="flex gap-2 items-start text-[#7A8694]">
                <span className="text-red-400 font-mono select-none font-bold">[-]</span>
                <span>All trademarks, product names, logos, and service descriptions are property of their respective owners. Their mention in this portal does not imply endorsement or affiliation.</span>
              </li>
            </ul>
            <div className="border-t border-white/5 pt-4 w-full flex justify-between items-center text-[8px] text-white/20 mt-2 font-mono">
              <span>CHRONO_OS v4.95 // SOURCE ATTESTATION VERIFIED</span>
              <span>COMPLIANT STATUS: PASS</span>
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </main>
  );
}
