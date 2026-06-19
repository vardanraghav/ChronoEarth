'use client';

import Navbar from '@/components/Navbar';
import BackgroundEffects from '@/components/BackgroundEffects';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function AboutPage() {
  const coreFeatures = [
    { title: 'Earth Visualization', desc: 'Immersive 3D dot-matrix globe tracking planetary simulation parameters in real time.', icon: '🌍', color: '#00E5FF' },
    { title: 'FutureChat AI', desc: 'Sleek terminal-style conversational interface powered by multi-provider cognitive routing.', icon: '💬', color: '#00F5B0' },
    { title: 'Predictions Engine', desc: 'Planetary foresight matrices indexed by confidence ratings and user timeline consensus.', icon: '🔮', color: '#FF9500' },
    { title: 'Knowledge Base', desc: 'Decrypted codex shards outlining future technologies, resource managers, and carbon tariffs.', icon: '📚', color: '#A8B3BC' },
    { title: 'Market Intelligence', desc: 'Decentralized hardware semiconductor index tracking global foundry yields and supply lines.', icon: '📈', color: '#00F5D4' },
    { title: 'Sensor Network', desc: 'Real-time seismic stress, fault lines anomaly warnings, and tectonic telemetry monitoring.', icon: '🌋', color: '#EF4444' },
    { title: 'Space Monitoring', desc: 'Deep-space satellite coverage tracking orbital debris corridors and solar weather anomalies.', icon: '🚀', color: '#BF5AF2' }
  ];

  const techStack = [
    { name: 'Next.js', role: 'App Framework & SSR', desc: 'Production hybrid framework powering dynamic content routing.', color: '#FFFFFF' },
    { name: 'React', role: 'UI Library', desc: 'Component-driven reactive architecture for responsive viewports.', color: '#00D98F' },
    { name: 'TypeScript', role: 'Type Safety', desc: 'Compile-time static typing ensuring clean, robust system calculations.', color: '#00E5FF' },
    { name: 'Supabase', role: 'Backend & Database', desc: 'PostgreSQL relational database housing live predictions, cities, and articles.', color: '#00F5B0' },
    { name: 'Google Gemini', role: 'Primary AI Model', desc: 'Advanced natural language model generating future forecast analyses.', color: '#0A84FF' },
    { name: 'Groq', role: 'Secondary AI Model', desc: 'Ultra-fast Llama inference scaling cognitive failover responses.', color: '#FF9500' },
    { name: 'CesiumJS', role: '3D WebGL Globe', desc: 'High-performance planetary graphics engine rendering spatial telemetry.', color: '#BF5AF2' }
  ];

  return (
    <main className="min-h-screen w-full bg-[#02060A] text-[#e2e8f0] relative pb-24">
      {/* Background Starfield Twinkle */}
      <BackgroundEffects earthMode="cyber" />

      {/* Top Header Vignette */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[rgba(2,6,10,0.95)] to-transparent pointer-events-none z-10" />

      <Navbar />

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-6 pt-32 relative z-20 flex flex-col gap-14 animate-fade-up font-mono">
        
        {/* HERO SECTION */}
        <div className="flex flex-col gap-4 border-b border-white/5 pb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E5FF]/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="flex items-center gap-2 text-[#00E5FF] text-xs font-mono uppercase tracking-[0.3em] font-semibold">
              <span>ℹ️ SYSTEM CODEX SHARD</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
            </div>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('start-chronoearth-tour'))}
              className="premium-glass px-4 py-1.5 rounded text-[10px] font-mono tracking-wider border border-[#00E5FF]/20 hover:border-[#00E5FF] hover:text-[#00E5FF] hover:shadow-[0_0_12px_rgba(0,229,255,0.25)] transition-all cursor-pointer uppercase font-semibold"
            >
              🔄 Restart Tour
            </button>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light text-white tracking-wider uppercase m-0">
            CHRONO<span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#00F5B0]">EARTH</span>
          </h1>
          <p className="text-sm font-semibold uppercase tracking-widest text-white/50 m-0">
            Future Intelligence & Simulation Platform
          </p>
          <p className="text-sm leading-relaxed text-[#7A8694] font-light max-w-3xl font-sans mt-2">
            ChronoEarth is a highly responsive digital twin model of Earth. By combining expert forecasting, real-time planetary sensor feeds, and adaptive simulation algorithms, the platform plots predictive trajectories across critical sectors into 2030, 2040, and 2050 to help anticipate global transition trends.
          </p>
        </div>

        {/* SECTION: WHAT IS CHRONOEARTH */}
        <div className="flex flex-col gap-6">
          <div className="border-l-2 border-[#00F5B0] pl-3 py-0.5">
            <h2 className="text-lg font-semibold text-white uppercase tracking-wider m-0">What is ChronoEarth?</h2>
            <span className="text-[10px] text-white/40 uppercase tracking-widest">Planetary surveillance capabilities</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="premium-glass p-5 rounded-xl border border-white/5 flex flex-col gap-2">
              <span className="text-xs text-[#00E5FF] font-bold uppercase tracking-wider">🌍 Earth Intelligence</span>
              <p className="text-xs text-[#7A8694] leading-relaxed font-sans font-light">
                An immersive WebGL digital twin displaying geographical assets, population density centers, and smart city infrastructure meshes.
              </p>
            </div>
            <div className="premium-glass p-5 rounded-xl border border-white/5 flex flex-col gap-2">
              <span className="text-xs text-[#FF0055] font-bold uppercase tracking-wider">🌡️ Climate Monitoring</span>
              <p className="text-xs text-[#7A8694] leading-relaxed font-sans font-light">
                Assimilation of global temperature rise parameters, regional sea-level variations, and carbon-tariff compliance metrics.
              </p>
            </div>
            <div className="premium-glass p-5 rounded-xl border border-white/5 flex flex-col gap-2">
              <span className="text-xs text-[#FF9500] font-bold uppercase tracking-wider">🔮 Future Predictions</span>
              <p className="text-xs text-[#7A8694] leading-relaxed font-sans font-light">
                Expert-written timeline forecasts spanning AGI adoption, fusion energy breakthroughs, and planetary resource managers.
              </p>
            </div>
            <div className="premium-glass p-5 rounded-xl border border-white/5 flex flex-col gap-2">
              <span className="text-xs text-[#00F5B0] font-bold uppercase tracking-wider">📈 Market Intelligence</span>
              <p className="text-xs text-[#7A8694] leading-relaxed font-sans font-light">
                Silicon stock tracking, hardware fabrication yields, and logistics risk corridor metrics updated under allied blocks.
              </p>
            </div>
            <div className="premium-glass p-5 rounded-xl border border-white/5 flex flex-col gap-2">
              <span className="text-xs text-[#BF5AF2] font-bold uppercase tracking-wider">🛰️ Space Intelligence</span>
              <p className="text-xs text-[#7A8694] leading-relaxed font-sans font-light">
                Orbital satellite constellations, LEO debris sweeping paths, and offworld raw mineral transport logistics.
              </p>
            </div>
            <div className="premium-glass p-5 rounded-xl border border-white/5 flex flex-col gap-2">
              <span className="text-xs text-white font-bold uppercase tracking-wider">🤖 AI-powered Analysis</span>
              <p className="text-xs text-[#7A8694] leading-relaxed font-sans font-light">
                Real-time conversation node utilizing semantic routing to query planetary data, run sandboxes, and fact-check variables.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION: CORE FEATURES */}
        <div className="flex flex-col gap-6">
          <div className="border-l-2 border-[#BF5AF2] pl-3 py-0.5">
            <h2 className="text-lg font-semibold text-white uppercase tracking-wider m-0">Core Platform Features</h2>
            <span className="text-[10px] text-white/40 uppercase tracking-widest">Interface control modules</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feat) => (
              <div
                key={feat.title}
                className="card-tier-2 flex flex-col justify-between p-5 min-h-[160px] hover:-translate-y-1 transition-all duration-300 relative group"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white uppercase tracking-wide">{feat.title}</span>
                    <span className="text-lg" style={{ textShadow: `0 0 10px ${feat.color}40` }}>{feat.icon}</span>
                  </div>
                  <p className="text-xs text-[#7A8694] leading-relaxed font-sans font-light">{feat.desc}</p>
                </div>
                <div 
                  className="absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-300 opacity-20 group-hover:opacity-100" 
                  style={{ background: `linear-gradient(90deg, transparent, ${feat.color}, transparent)`, boxShadow: `0 0 8px ${feat.color}` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* SECTION: TECHNOLOGY STACK */}
        <div className="flex flex-col gap-6">
          <div className="border-l-2 border-[#FF9500] pl-3 py-0.5">
            <h2 className="text-lg font-semibold text-white uppercase tracking-wider m-0">Technology Stack</h2>
            <span className="text-[10px] text-white/40 uppercase tracking-widest">Core infrastructure & frameworks</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techStack.map((tech) => (
              <div 
                key={tech.name} 
                className="premium-glass p-5 rounded-xl border border-white/5 flex flex-col gap-2 hover:border-white/10 transition-colors"
              >
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-bold text-white font-mono tracking-wide">{tech.name}</span>
                  <span className="text-[8px] font-mono uppercase font-semibold px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10" style={{ borderColor: `${tech.color}30`, color: tech.color }}>
                    {tech.role}
                  </span>
                </div>
                <p className="text-[11px] text-[#7A8694] leading-relaxed font-sans font-light m-0 mt-1">
                  {tech.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION: VISION & ROADMAP */}
        <div className="flex flex-col gap-6">
          <div className="border-l-2 border-[#00E5FF] pl-3 py-0.5">
            <h2 className="text-lg font-semibold text-white uppercase tracking-wider m-0">Roadmap & Vision</h2>
            <span className="text-[10px] text-white/40 uppercase tracking-widest">Planetary alignment benchmarks</span>
          </div>

          <div className="relative border-l border-white/10 ml-4 md:ml-6 flex flex-col gap-8 mt-4 pl-6">
            {/* Phase 1 */}
            <div className="relative">
              <div className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-[#00F5B0] border-2 border-[#02060A] shadow-[0_0_8px_#00F5B0]" />
              <div className="text-[9px] text-[#00F5B0] font-bold uppercase tracking-wider">Phase I: Foundation (Current)</div>
              <h3 className="text-sm font-semibold text-white mt-1 mb-2 uppercase">Decentralized UI & Immersive 3D Mesh</h3>
              <p className="text-xs text-[#7A8694] leading-relaxed font-sans font-light max-w-3xl m-0">
                Deployment of the WebGL digital twin, predictions consensus voting nodes, and semantic AI assistant. Skips rate-limiting external writes and relies on optimized client-side integrations.
              </p>
            </div>

            {/* Phase 2 */}
            <div className="relative">
              <div className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-[#00E5FF] border-2 border-[#02060A] shadow-[0_0_8px_#00E5FF]" />
              <div className="text-[9px] text-[#00E5FF] font-bold uppercase tracking-wider">Phase II: Integration (Q4 2026 Target)</div>
              <h3 className="text-sm font-semibold text-white mt-1 mb-2 uppercase">Dynamic Sensor Hooks & Web-Scale Sync</h3>
              <p className="text-xs text-[#7A8694] leading-relaxed font-sans font-light max-w-3xl m-0">
                Piping real-time telemetry from public agencies (NOAA, NASA, USGS) directly into the planetary simulation models. Projections automatically scale when ecological indicators cross thresholds.
              </p>
            </div>

            {/* Phase 3 */}
            <div className="relative">
              <div className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-slate-800 border-2 border-[#02060A]" />
              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Phase III: Autonomy (2027+ Target)</div>
              <h3 className="text-sm font-semibold text-white/50 mt-1 mb-2 uppercase">Cognitive Decentralized Trajectory Sandboxes</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans font-light max-w-3xl m-0">
                Enabling neural agents to spawn isolated sandbox timeline scenarios dynamically based on user prompts. Runs decentralized consensus validations on the blockchain.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION: FOUNDER */}
        <div className="flex flex-col gap-6">
          <div className="border-l-2 border-[#00F5B0] pl-3 py-0.5">
            <h2 className="text-lg font-semibold text-white uppercase tracking-wider m-0">Founder</h2>
            <span className="text-[10px] text-white/40 uppercase tracking-widest">Platform leadership & vision</span>
          </div>

          <div className="premium-glass p-6 rounded-2xl border border-[#00F5B0]/20 flex flex-col gap-4 relative overflow-hidden shadow-[0_0_25px_rgba(0,245,176,0.03)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F5B0]/5 rounded-full blur-[40px] pointer-events-none" />
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider m-0">Vardan Raghav</h3>
              <span className="text-[9px] text-[#00E5FF] uppercase tracking-wider font-semibold font-mono">
                B.Tech Electronics & Communication Engineering (Artificial Intelligence & Machine Learning)
              </span>
            </div>
            <p className="text-xs text-[#7A8694] font-sans font-light max-w-3xl leading-relaxed m-0 mt-1">
              ChronoEarth was developed as an independent future intelligence platform focused on forecasting, technology monitoring, scientific research synthesis, and planetary-scale intelligence visualization.
            </p>
          </div>
        </div>

        {/* SECTION: CONTACT & FEEDBACK */}
        <div className="flex flex-col gap-6">
          <div className="border-l-2 border-[#00E5FF] pl-3 py-0.5">
            <h2 className="text-lg font-semibold text-white uppercase tracking-wider m-0">Contact & Feedback</h2>
            <span className="text-[10px] text-white/40 uppercase tracking-widest">Comms link & support channel</span>
          </div>

          <div className="premium-glass p-6 rounded-2xl border border-[#00E5FF]/20 flex flex-col gap-4 relative overflow-hidden">
            <p className="text-xs text-[#7A8694] font-sans font-light max-w-3xl leading-relaxed m-0">
              We welcome feedback, research discussions, feature suggestions, and collaboration opportunities.
            </p>
            <div className="flex flex-col gap-1.5 font-mono border-b border-white/5 pb-4">
              <span className="text-[10px] text-white/40 uppercase tracking-wider">For questions, suggestions, collaborations, bug reports, or feedback:</span>
              <a 
                href="mailto:raghavvardan123@gmail.com" 
                className="text-[#00E5FF] hover:underline font-bold text-xs tracking-wider transition-all"
              >
                raghavvardan123@gmail.com
              </a>
            </div>
            <div className="w-full flex justify-between items-center text-[8px] text-white/20 mt-2 font-mono">
              <span>CHRONO_OS v4.82 // ALL RIGHTS RESERVED</span>
              <Link href="/sources" className="text-[#00F5B0] hover:underline font-bold no-underline uppercase tracking-wider">Sources & Credits →</Link>
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </main>
  );
}
