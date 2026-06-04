'use client';

import Navbar from '@/components/Navbar';
import BackgroundEffects from '@/components/BackgroundEffects';

const C = {
  emerald: '#00F5B0',
  cyan: '#00D98F',
  iceBlue: '#00D98F',
  white: '#F5F7FA',
  bg: 'rgba(2, 8, 15, 0.75)',
  border: 'rgba(0, 245, 176, 0.15)',
};

export default function AboutPage() {
  const panelStyle: React.CSSProperties = {
    background: 'rgba(2, 8, 15, 0.75)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '4px',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
  };

  const cornerAccent = null;

  return (
    <main className="h-screen w-screen overflow-y-auto bg-[#02060A] text-[#e2e8f0] relative custom-scrollbar">
      {/* Background Twinkling Stars */}
      <BackgroundEffects earthMode="cyber" />

      {/* Top Gradient Vignette */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[rgba(2,8,15,0.95)] to-transparent pointer-events-none z-10" />

      {/* Navigation Header */}
      <Navbar earthMode="cyber" />

      {/* Main Container */}
      <div className="content-container pt-32 pb-20 relative z-20 flex flex-col gap-10 animate-fade-up">
        
        {/* Title Header */}
        <div className="flex flex-col gap-3 border-b border-[#00F5B0]/15 pb-6">
          <h1 className="editorial-title text-white">
            About ChronoEarth
          </h1>
          <p className="editorial-subtitle text-[#7A8694]">
            Simulating planetary trajectory vectors and future intelligence alignment parameters for 2030, 2040, and 2050.
          </p>
        </div>

        {/* Section 1: Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-4">
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-light text-white tracking-wide uppercase font-display border-b border-[#00F5B0]/15 pb-2">
              Planetary Vision
            </h2>
            <p className="text-sm leading-relaxed text-[#7A8694] font-serif font-light">
              To construct a highly responsive digital twin model of planet Earth that integrates quantum forecasting, ecological telemetry, and technological trajectories. ChronoEarth serves as an active planetary operating system dashboard, enabling humanity to visualize, anticipate, and mitigate multi-dimensional systemic risks before they manifest.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-light text-white tracking-wide uppercase font-display border-b border-[#00F5B0]/15 pb-2">
              Our Core Mission
            </h2>
            <p className="text-sm leading-relaxed text-[#7A8694] font-serif font-light">
              Our mission is to crowdsource and simulate future scenarios with empirical precision. By matching projections from leading futurologists with real-time planetary sensor readings, we enable citizens, policy makers, and systems engineers to vote on forecast likelihoods, test local technology impacts, and adapt urban centers dynamically.
            </p>
          </div>
        </div>

        {/* Section 2: Methodology */}
        <div className="flex flex-col gap-6 my-6">
          <h2 className="text-xl font-light text-white tracking-wide uppercase font-display border-b border-[#00F5B0]/15 pb-2">
            Forecasting Engine Methodology
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-tier-2 flex flex-col gap-3 p-5">
              <span className="text-[10px] font-mono text-[#00F5B0] uppercase tracking-wider font-semibold">Sensor Assimilation</span>
              <p className="text-xs text-[#7A8694] leading-relaxed font-serif">
                Decentralized nodes monitor global telemetry including carbon coefficients, oceanic thermal differentials, and LEO satellite arrays.
              </p>
            </div>
            <div className="card-tier-2 flex flex-col gap-3 p-5">
              <span className="text-[10px] font-mono text-[#00F5B0] uppercase tracking-wider font-semibold">Expert Synthesis</span>
              <p className="text-xs text-[#7A8694] leading-relaxed font-serif">
                Leading specialists in Quantum Intelligence, Geo-engineering, and Nanomedicine input projection parameters into the Chrono-matrix.
              </p>
            </div>
            <div className="card-tier-2 flex flex-col gap-3 p-5">
              <span className="text-[10px] font-mono text-[#00F5B0] uppercase tracking-wider font-semibold">Branch Simulation</span>
              <p className="text-xs text-[#7A8694] leading-relaxed font-serif">
                Predictive neural models run continuous timelines, scoring confidence ratings based on user validation, upvotes, and environmental trends.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Data Sources */}
        <div className="flex flex-col gap-6 my-6">
          <h2 className="text-xl font-light text-white tracking-wide uppercase font-display border-b border-[#00F5B0]/15 pb-2">
            Primary Data Feed Sources
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'LEO Satellites', desc: 'Autonomous Debris Patrollers & Reflectance Trackers', freq: 'Real-time (0.04s latency)', score: '99.8% Integrity' },
              { title: 'Marine Telemetry', desc: 'OTEC Baseline Probes & Reef MINERAL Collectors', freq: 'Every 60 seconds', score: '98.2% Integrity' },
              { title: 'Urban Neural Mesh', desc: 'Transit Zone Microgrids & Carbon-Tax Contracts', freq: 'Instant (Event-triggered)', score: '99.1% Integrity' },
              { title: 'Expert Networks', desc: 'UN forecasting collectives & Nobel-grade nodes', freq: 'Bi-weekly consensus cycles', score: '95.4% Integrity' }
            ].map(source => (
              <div key={source.title} className="card-tier-2 flex flex-col justify-between p-5 min-h-[140px]">
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-white font-mono uppercase">{source.title}</h3>
                  <p className="text-xs text-[#7A8694] leading-relaxed font-serif">{source.desc}</p>
                </div>
                <div className="border-t border-[#00F5B0]/10 pt-2 mt-3 flex justify-between text-[9px] font-mono text-[#7A8694] uppercase">
                  <span>{source.freq}</span>
                  <span className="text-[#00F5B0] font-bold">{source.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Roadmap */}
        <div className="flex flex-col gap-6 my-6">
          <h2 className="text-xl font-light text-white tracking-wide uppercase font-display border-b border-[#00F5B0]/15 pb-2">
            Forecast Engine Roadmap
          </h2>
          
          <div className="relative border-l border-[#00F5B0]/15 ml-4 md:ml-6 flex flex-col gap-8 mt-4">
            {/* Phase 1 */}
            <div className="relative pl-6">
              <div className="absolute -left-1 w-2 h-2 rounded-full bg-[#00F5B0] mt-1.5" />
              <div className="text-[9px] font-mono text-[#7A8694] uppercase mb-1 font-semibold">System Foundation (Current Phase)</div>
              <h3 className="text-base font-light text-white uppercase tracking-wider mb-2">Immersive Globe Visualizer & Routing</h3>
              <p className="text-xs text-[#7A8694] max-w-3xl leading-relaxed font-serif">
                Releasing the 3D planetary dot-matrix globe. Deploying Next.js content routers for the database, expert tracking, and interactive prediction layouts.
              </p>
            </div>

            {/* Phase 2 */}
            <div className="relative pl-6">
              <div className="absolute -left-1 w-2 h-2 rounded-full bg-[#00F5B0] mt-1.5" />
              <div className="text-[9px] font-mono text-[#7A8694] uppercase mb-1 font-semibold">Engagement Layer (Q3 2026 Target)</div>
              <h3 className="text-base font-light text-white uppercase tracking-wider mb-2">Nested Comment Protocols & Custom Reports</h3>
              <p className="text-xs text-[#7A8694] max-w-3xl leading-relaxed font-serif">
                Activating persistent local storage upvotes, bookmarked timelines, and recursive commenting hierarchies to build structured futurological debates.
              </p>
            </div>

            {/* Phase 3 */}
            <div className="relative pl-6">
              <div className="absolute -left-1 w-2 h-2 rounded-full bg-[#00F5B0]/40 mt-1.5" />
              <div className="text-[9px] font-mono text-[#7A8694] uppercase mb-1">Live Sensor Sync (Q1 2027 Target)</div>
              <h3 className="text-base font-light text-white/70 uppercase tracking-wider mb-2">Active Climate Data Pipeline Integration</h3>
              <p className="text-xs text-[#7A8694]/70 max-w-3xl leading-relaxed font-serif">
                Plugging in direct API pipelines from planetary monitoring networks. Projections will automatically scale their confidence scores when climate thresholds are crossed.
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
