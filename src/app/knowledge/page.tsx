'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BackgroundEffects from '@/components/BackgroundEffects';
import { KB_ARTICLES } from '@/data/predictionsData';

// Extended database articles to support Geopolitics and Economics sections
const ALL_KB_ARTICLES = [
  ...KB_ARTICLES,
  {
    id: 'kb-8',
    title: 'Global Semiconductor Alliance',
    category: 'Geopolitics',
    shortDesc: 'Decentralized fabrication nodes and shipping corridors across trade blocks.',
    content: 'Global silicon production has shifted away from centralized coastal nodes to secure, decentralized alliances. Allied regions construct high-yield fabrication centers inland, connected by secure rail networks and defended by orbital monitoring constellations to protect hardware supply lines against disruption vectors.',
    readinessIndex: 85,
    impactLevel: 'Critical' as const
  },
  {
    id: 'kb-9',
    title: 'Lifecycle Carbon Tariffs',
    category: 'Economics',
    shortDesc: 'Algorithmic border tax adjustments based on lifecycle carbon emissions.',
    content: 'Enforces carbon taxation dynamically at regional borders using digital ledgers. The carbon footprint of every imported raw material or finished pod is calculated using real-time sensor metrics and taxed instantly, funding geo-engineering cooling grids and incentivizing clean local manufacturing.',
    readinessIndex: 90,
    impactLevel: 'High' as const
  }
];

// Rich technical details for each article (Stats, Opportunities, Risks, Outlook, Sources)
const ARTICLE_DETAILS: Record<string, {
  stats: Record<string, string>;
  opportunities: string[];
  risks: string[];
  outlook: string;
  sources: string[];
}> = {
  'kb-1': {
    stats: { 'Superconductor Coils': 'Double intensity', 'Reactor Footprint': '-90% size reduction', 'Net Energy Gain Ratio': 'Q = 22' },
    opportunities: ['Modular integration into city microgrids', 'Abundant energy output for carbon-scrubbing systems'],
    risks: ['Entangled signal cyber outages', 'Centralization vectors on high-capacity nodes'],
    outlook: 'Commercialized targets set to supply 85% of planetary grids by 2050.',
    sources: [
      'Wright, E. & Carter, L. (2042). Superconductor Confinement Metrics. Journal of Applied Fusion, 18(4).',
      'ITER Fusion Highway Protocol V3.1 (2039).'
    ]
  },
  'kb-2': {
    stats: { 'Surface/Deep Delta Temp': '20°C differential', 'Operational Cost': '$0.02 per kWh', 'Baseload Reliability': '99.9%' },
    opportunities: ['Constant, non-fluctuating green power output', 'Co-generation of fresh desalinated water'],
    risks: ['Ecological disturbance to marine layers', 'High initial capital expense for subsea pipelines'],
    outlook: 'Ocean kinetic grids will anchor tropical coastal energy mix models by 2040.',
    sources: [
      'IPCC Energy Working Group Report (2041). OTEC System Integrations.',
      'Carter, L. (2039). Baseload marine power generation. Ocean Systems Design (Vol. 12).'
    ]
  },
  'kb-3': {
    stats: { 'Soil Moisture Increase': '+35%', 'Species Recovery Rate': '1.8x acceleration', 'Biodiversity Score': '88/100' },
    opportunities: ['Self-repairing biomes absorbing carbon spikes', 'Engineered microflora filtering river chemicals'],
    risks: ['Unintended genetic drift in wild populations', 'Biosphere adaptation latency under extreme heat'],
    outlook: 'Synthetic biosphere anchors will reclaim 40% of desertification zones by 2050.',
    sources: [
      'Jenkins, S. (2040). Genetic engineering of desert flora. Synthetic Ecosystems, 32(8).',
      'Global Biosphere Restoration Index (2043).'
    ]
  },
  'kb-4': {
    stats: { 'Solar Deflection Rate': '1.5% globally', 'Global Cooling Index': '-0.5°C target', 'Operational Window': '12-year lifecycle' },
    opportunities: ['Immediate halting of polar feedback loops', 'Preservation of critical sea-level ice sheets'],
    risks: ['Acidification impacts on oceanic layers', 'Geopolitical disputes over temperature settings'],
    outlook: 'LEO mirror arrays slated for launch by 2038 to check runaway sea-level rise.',
    sources: [
      'Carter, L., et al. (2041). Albedo deflection simulation models. Atmospheric Interventions, 9(1).',
      'UN Climate Geo-engineering Accord Guidelines (2039).'
    ]
  },
  'kb-5': {
    stats: { 'Regolith Grade': '15 ppb (parts per billion)', 'Mining Efficiency': '+120%', 'Helium-3 Transport Cap': '120 tons/yr' },
    opportunities: ['Clean, zero-waste aneutronic fusion fuel', 'Establishes LEO logistical staging hubs'],
    risks: ['Debris collision vectors in launch corridors', 'High initial cargo freight costs from orbit'],
    outlook: 'Robotic regolith mining terminals will achieve commercial output scale by 2045.',
    sources: [
      'Sato, K. (2043). Lunar Helium-3 logistics pipelines. Journal of Offworld Mining, 22(11).',
      'Lunar Resources Commission Annual Outlook (2044).'
    ]
  },
  'kb-6': {
    stats: { 'Qubit Node Capacity': '10,000 entangled qubits', 'Transit Delays': '<0.5ms global', 'Interception Vectors': '0.00%' },
    opportunities: ['100% intercept-secure structural data grids', 'Instantaneous synchronization of smart city pods'],
    risks: ['Logic array decryption vector leakage', 'Heavy hardware dependency on raw mineral imports'],
    outlook: 'Entangled orbital networks will coordinate 90% of transport algorithms by 2035.',
    sources: [
      'Wright, E. (2037). Quantum Cryptographic Infrastructures. Security Systems Quarterly, 104(3).',
      'Global Network Security Syndicate Assessment (2039).'
    ]
  },
  'kb-7': {
    stats: { 'Accretion Speed': '3cm per year', 'Tensile Strength': '3x standard concrete', 'Surge Buffer Capacity': '75%' },
    opportunities: ['Self-healing foundations housing floating cities', 'Reforestation of coral nurseries in tropical bays'],
    risks: ['High local electrical load requirements', 'Potential heavy metal precipitation in closed lagoons'],
    outlook: 'Accreted reef dikes will buffer 80% of vulnerable delta zones by 2050.',
    sources: [
      'Carter, L. & Jenkins, S. (2044). Minerals accretion under marine current grids. Structural Oceanography, 15(2).',
      'Floating Metropolis Design Consortium Standard Protocols (2042).'
    ]
  },
  'kb-8': {
    stats: { 'Fabs Operational': '8 global clusters', 'Yield Rate': '98.5%', 'Critical Mineral Buffer': '78% secure' },
    opportunities: ['Resilient decentralized local chip production', 'Bypasses traditional shipping bottlenecks'],
    risks: ['High water consumption in fabrication nodes', 'Blockade risk on East Asian maritime corridors'],
    outlook: 'Digital block alliances will enforce local fabrication nodes by 2035.',
    sources: [
      'Sato, K., et al. (2040). Supply chain security in digital blocs. Geopolitical Materials, 17(5).',
      'GSA Fabrication Output Report (2042).'
    ]
  },
  'kb-9': {
    stats: { 'Carbon Tariff Rate': '$45 per ton', 'Scrubbing Subsidy': '35% reinvestment', 'Compliance Score': '94%' },
    opportunities: ['Rapid phasing out of high-carbon logistics', 'Generates trillions for polar geo-engineering projects'],
    risks: ['Trade friction between competing economic blocks', 'Tariff evasion via third-party shipping channels'],
    outlook: 'Lifecycle carbon accounting grids will scale globally by 2030.',
    sources: [
      'Global Economics Commission Carbon Adjustment Guidelines (2038).',
      'Jenkins, S. (2041). Ledgers for lifecycle carbon tracking. Journal of Futures Economics, 28(6).'
    ]
  }
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

  const categories = ['ALL', 'AI', 'Climate', 'Energy', 'Cities', 'Space', 'Geopolitics'];

  // Map database categories to user-requested sections
  const getMappedCategory = (cat: string, id: string): string => {
    if (id === 'kb-1' || id === 'kb-2') return 'Energy';
    if (id === 'kb-3' || id === 'kb-4') return 'Climate';
    if (id === 'kb-5') return 'Space';
    if (id === 'kb-6') return 'AI';
    if (id === 'kb-7') return 'Cities';
    if (id === 'kb-8' || id === 'kb-9') return 'Geopolitics';
    
    // Fallback mapping
    const c = cat.toLowerCase();
    if (c === 'technologies' || c === 'future jobs') return 'AI';
    return cat;
  };

  const getCategoryStyle = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('ai')) return { color: '#00F5D4', shadow: 'rgba(0, 245, 212, 0.18)' };
    if (cat.includes('climate')) return { color: '#FF0055', shadow: 'rgba(255, 0, 85, 0.18)' };
    if (cat.includes('energy')) return { color: '#00F5B0', shadow: 'rgba(0, 245, 176, 0.18)' };
    if (cat.includes('space')) return { color: '#BF5AF2', shadow: 'rgba(191, 90, 242, 0.18)' };
    if (cat.includes('cities')) return { color: '#0A84FF', shadow: 'rgba(10, 132, 255, 0.18)' };
    if (cat.includes('geopolitics')) return { color: '#FFB300', shadow: 'rgba(255, 179, 0, 0.18)' };
    return { color: '#00F5B0', shadow: 'rgba(0, 245, 176, 0.18)' };
  };

  const filteredArticles = ALL_KB_ARTICLES.filter(art => {
    const mapped = getMappedCategory(art.category, art.id);
    return selectedCategory === 'ALL' || mapped.toLowerCase() === selectedCategory.toLowerCase();
  });

  const activeArticle = ALL_KB_ARTICLES.find(x => x.id === expandedArticleId);
  const activeDetails = activeArticle ? (ARTICLE_DETAILS[activeArticle.id] || {
    stats: {},
    opportunities: [],
    risks: [],
    outlook: 'Projections are verifying.',
    sources: []
  }) : null;

  return (
    <div className={`${activeArticle ? 'reading-container' : 'content-container'} pt-32 pb-24 relative z-20 flex flex-col gap-8 animate-fade-up`}>
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-mono text-[#00F5B0] uppercase tracking-[0.25em] font-semibold">
            Foresight Codex
          </span>
          <h1 className="editorial-title text-white tracking-tight m-0 text-3xl font-light">
            Planetary <span style={{ color: '#00F5B0' }} className="font-normal">Knowledge Base</span>
          </h1>
          <p className="text-[#7A8694] font-light text-sm max-w-2xl leading-relaxed m-0">
            Technical specifications, biological/geological coefficients, and deployment parameters for futuristic technologies.
          </p>
        </div>

        {activeArticle && (
          <button
            onClick={() => setExpandedArticleId(null)}
            className="self-start md:self-auto px-4 py-2 border border-[#00F5B0]/30 hover:border-[#00F5B0] text-[#00F5B0] text-xs font-mono rounded transition-all duration-300 bg-transparent cursor-pointer tracking-wider uppercase font-semibold hover:shadow-[0_0_10px_rgba(0, 245, 176, 0.15)]"
          >
            ← Return to Database
          </button>
        )}
      </div>

      {/* Filter Options */}
      {!activeArticle && (
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            const style = getCategoryStyle(cat === 'ALL' ? 'Energy' : cat);
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs rounded transition-all duration-300 font-mono cursor-pointer border ${
                  isSelected 
                    ? 'bg-[#00F5B0] text-[#02060A] border-transparent font-semibold shadow-[0_0_10px_rgba(0,245,176,0.3)]'
                    : 'bg-transparent border-white/5 text-[#7A8694] hover:bg-white/5 hover:border-[#00F5B0]/30 hover:text-white'
                }`}
                style={isSelected ? { backgroundColor: style.color, boxShadow: `0 0 10px ${style.shadow}` } : {}}
              >
                {cat === 'ALL' ? 'All Sectors' : cat}
              </button>
            );
          })}
        </div>
      )}

      {/* Dynamic Main Body Content */}
      <div className="min-h-[400px]">
        {activeArticle && activeDetails ? (
          
          /* Detailed View - Tier 1 Container */
          <div 
            className="premium-glass p-8 rounded-lg grid grid-cols-1 lg:grid-cols-3 gap-8"
            style={{ backgroundColor: 'rgba(4, 11, 18, 0.8)' }}
          >
            
            {/* Left Metrics Column */}
            <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-white/5 pb-6 lg:pb-0 lg:pr-8 flex flex-col gap-6">
              <div>
                <span className="text-[9px] font-mono text-[#7A8694] uppercase tracking-wider block mb-1">Sector Classification</span>
                <span 
                  className="text-sm font-mono font-semibold"
                  style={{ color: getCategoryStyle(getMappedCategory(activeArticle.category, activeArticle.id)).color }}
                >
                  {getMappedCategory(activeArticle.category, activeArticle.id).toUpperCase()}
                </span>
              </div>
              
              <div>
                <span className="text-[9px] font-mono text-[#7A8694] uppercase tracking-wider block mb-2">Deployment Readiness</span>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full"
                      style={{ 
                        width: `${activeArticle.readinessIndex}%`, 
                        backgroundColor: getCategoryStyle(getMappedCategory(activeArticle.category, activeArticle.id)).color,
                        boxShadow: `0 0 6px ${getCategoryStyle(getMappedCategory(activeArticle.category, activeArticle.id)).color}` 
                      }}
                    />
                  </div>
                  <span className="font-mono text-xs font-semibold text-white/90">{activeArticle.readinessIndex}%</span>
                </div>
              </div>

              <div>
                <span className="text-[9px] font-mono text-[#7A8694] uppercase tracking-wider block mb-1">Impact Coefficient</span>
                <span className={`px-2 py-0.5 text-[10px] font-mono rounded font-semibold inline-block ${
                  activeArticle.impactLevel === 'Critical' 
                    ? 'bg-rose-950/40 text-rose-400 border border-rose-500/30' 
                    : 'bg-[#040B12] text-[#00F5B0] border border-[#00F5B0]/15'
                }`}>
                  {activeArticle.impactLevel.toUpperCase()}
                </span>
              </div>

              {/* Key Stats Table */}
              {Object.keys(activeDetails.stats).length > 0 && (
                <div className="border border-white/5 bg-black/40 rounded p-4 flex flex-col gap-2.5">
                  <span className="text-[9px] font-mono text-[#7A8694] uppercase tracking-wider">Research Parameters</span>
                  <table className="w-full text-[11px] text-left font-mono">
                    <tbody>
                      {Object.entries(activeDetails.stats).map(([k, v]) => (
                        <tr key={k} className="border-b border-white/5 last:border-0">
                          <td className="py-2 text-[#7A8694] font-light">{k}</td>
                          <td className="py-2 text-white text-right font-medium">{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-auto pt-4 flex flex-col gap-1.5 text-[9px] font-mono text-[#7A8694]">
                <span>Database Ref: <span className="text-white">KB-{activeArticle.id.toUpperCase()}</span></span>
                <span className="text-[#00F5B0] font-semibold">Status: Verified protocol</span>
              </div>
            </div>

            {/* Right Details Column */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-light text-white mb-1 tracking-wide">{activeArticle.title}</h2>
                <p className="text-[#00D98F] text-xs font-mono tracking-wider">{activeArticle.shortDesc}</p>
              </div>

              <div className="bg-black/35 border border-white/5 rounded-lg p-5 text-xs text-[#A8B3BC] leading-relaxed font-light">
                {activeArticle.content}
              </div>

              {/* Opportunities & Risks list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/5 pt-4">
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] text-rose-400 font-mono uppercase tracking-wider font-semibold">Key Vulnerabilities</span>
                  <ul className="list-none p-0 m-0 flex flex-col gap-2.5 text-xs text-[#7A8694] font-light">
                    {activeDetails.risks.map((risk, idx) => (
                      <li key={idx} className="flex gap-2 items-start leading-relaxed text-left">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] text-[#00F5B0] font-mono uppercase tracking-wider font-semibold">Strategic Opportunities</span>
                  <ul className="list-none p-0 m-0 flex flex-col gap-2.5 text-xs text-[#7A8694] font-light">
                    {activeDetails.opportunities.map((opp, idx) => (
                      <li key={idx} className="flex gap-2 items-start leading-relaxed text-left">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00F5B0] mt-1.5 flex-shrink-0" />
                        <span>{opp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Future Outlook */}
              <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
                <span className="text-[10px] text-[#7A8694] font-mono uppercase tracking-wider font-semibold">Future Outlook</span>
                <p className="text-xs text-[#00F5B0]/95 font-mono italic m-0 bg-[#00F5B0]/5 border border-[#00F5B0]/10 rounded p-3">
                  {activeDetails.outlook}
                </p>
              </div>

              {/* Sources Bibliography */}
              {activeDetails.sources && activeDetails.sources.length > 0 && (
                <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
                  <span className="text-[10px] text-[#7A8694] font-mono uppercase tracking-wider font-semibold">Sources & Citations</span>
                  <div className="flex flex-col gap-1">
                    {activeDetails.sources.map((src, idx) => (
                      <div key={idx} className="text-[10px] text-white/55 font-mono leading-relaxed border-l-2 border-white/10 pl-3 py-0.5">
                        {src}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        ) : (
          
          /* Database Grid View - 3 columns */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.length === 0 ? (
              <div className="col-span-3 text-center py-20 text-xs text-[#7A8694] premium-glass rounded-lg">
                No resource shards compiled in this sector.
              </div>
            ) : (
              filteredArticles.map(art => {
                const mappedCategory = getMappedCategory(art.category, art.id);
                const style = getCategoryStyle(mappedCategory);
                return (
                  <div
                    key={art.id}
                    onClick={() => setExpandedArticleId(art.id)}
                    className="group premium-glass cursor-pointer flex flex-col justify-between p-6 min-h-[260px] border border-white/5 hover:translate-y-[-4px] transition-all duration-300"
                    style={{
                      backgroundColor: 'rgba(4, 11, 18, 0.75)',
                      '--glow-color': style.color
                    } as any}
                  >
                    <div className="flex flex-col gap-4 flex-1">
                      <div className="flex justify-between items-center text-[10px] font-mono tracking-wider">
                        <span className="font-semibold uppercase" style={{ color: style.color }}>{mappedCategory}</span>
                        <span className={art.impactLevel === 'Critical' ? 'text-rose-400 font-semibold' : 'text-[#7A8694]'}>
                          {art.impactLevel.toUpperCase()} IMPACT
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        <h3 className="text-sm font-semibold text-white group-hover:text-white leading-snug tracking-wide m-0 transition-colors">
                          {art.title}
                        </h3>
                        <p className="text-xs text-[#7A8694] leading-relaxed line-clamp-3 font-light m-0">{art.shortDesc}</p>
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-3 mt-6 flex justify-between items-center text-[10px] font-mono">
                      <span className="text-[#7A8694]">Readiness: <span className="text-white font-semibold">{art.readinessIndex}%</span></span>
                      <span 
                        className="group-hover:underline uppercase tracking-wider font-semibold"
                        style={{ color: style.color }}
                      >
                        Inspect →
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        .group:hover {
          border-color: var(--glow-color, rgba(0, 245, 176, 0.3)) !important;
          box-shadow: 0 0 20px var(--glow-color, rgba(0, 245, 176, 0.1)) !important;
        }
      `}</style>
    </div>
  );
}

export default function KnowledgePage() {
  return (
    <main className="h-screen w-screen overflow-y-auto bg-[#02060A] text-[#e2e8f0] relative custom-scrollbar">
      <BackgroundEffects earthMode="cyber" />
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[rgba(2,6,10,0.95)] to-transparent pointer-events-none z-10" />
      <Navbar />
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
