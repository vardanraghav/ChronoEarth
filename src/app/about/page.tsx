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
      <div className="reading-container pt-32 pb-20 relative z-20 flex flex-col gap-10 animate-fade-up">
        
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
            <h2 className="text-xl font-light text-white border-b border-[#00F5B0]/15 pb-2">
              Planetary vision
            </h2>
            <p className="text-sm leading-relaxed text-[#7A8694] font-light">
              To construct a highly responsive digital twin model of planet Earth that integrates quantum forecasting, ecological telemetry, and technological trajectories. ChronoEarth serves as an active planetary operating system dashboard, enabling humanity to visualize, anticipate, and mitigate multi-dimensional systemic risks before they manifest.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-light text-white border-b border-[#00F5B0]/15 pb-2">
              Our core mission
            </h2>
            <p className="text-sm leading-relaxed text-[#7A8694] font-light">
              Our mission is to crowdsource and simulate future scenarios with empirical precision. By matching predictions from leading futurologists with real-time planetary sensor readings, we enable citizens, policy makers, and systems engineers to vote on forecast likelihoods, test local technology impacts, and adapt urban centers dynamically.
            </p>
          </div>
        </div>

        {/* Section 2: Methodology */}
        <div className="flex flex-col gap-6 my-6">
          <h2 className="text-xl font-light text-white border-b border-[#00F5B0]/15 pb-2">
            Forecasting engine methodology
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-tier-2 flex flex-col gap-3 p-5">
              <span className="text-xs text-[#00F5B0]">Sensor assimilation</span>
              <p className="text-xs text-[#7A8694] leading-relaxed">
                Decentralized nodes monitor global telemetry including carbon coefficients, oceanic thermal differentials, and LEO satellite arrays.
              </p>
            </div>
            <div className="card-tier-2 flex flex-col gap-3 p-5">
              <span className="text-xs text-[#00F5B0]">Expert synthesis</span>
              <p className="text-xs text-[#7A8694] leading-relaxed">
                Leading specialists in Quantum Intelligence, Geo-engineering, and Nanomedicine input projection parameters into the Chrono-matrix.
              </p>
            </div>
            <div className="card-tier-2 flex flex-col gap-3 p-5">
              <span className="text-xs text-[#00F5B0]">Branch simulation</span>
              <p className="text-xs text-[#7A8694] leading-relaxed">
                Predictive neural models run continuous timelines, scoring confidence ratings based on user validation, upvotes, and environmental trends.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Data Sources */}
        <div className="flex flex-col gap-6 my-6">
          <h2 className="text-xl font-light text-white border-b border-[#00F5B0]/15 pb-2">
            Primary data feed sources
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
                  <h3 className="text-sm font-light text-white">{source.title}</h3>
                  <p className="text-xs text-[#7A8694] leading-relaxed">{source.desc}</p>
                </div>
                <div className="border-t border-[#00F5B0]/10 pt-2 mt-3 flex justify-between text-xs text-[#7A8694]">
                  <span>{source.freq}</span>
                  <span className="text-[#00F5B0] font-mono">{source.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Roadmap */}
        <div className="flex flex-col gap-6 my-6">
          <h2 className="text-xl font-light text-white border-b border-[#00F5B0]/15 pb-2">
            Forecast engine roadmap
          </h2>
          
          <div className="relative border-l border-[#00F5B0]/15 ml-4 md:ml-6 flex flex-col gap-8 mt-4">
            {/* Phase 1 */}
            <div className="relative pl-6">
              <div className="absolute -left-1 w-2 h-2 rounded-full bg-[#00F5B0] mt-1.5" />
              <div className="text-xs text-[#7A8694] mb-1">System foundation (current phase)</div>
              <h3 className="text-base font-light text-white mb-2">Immersive globe visualizer & routing</h3>
              <p className="text-xs text-[#7A8694] max-w-3xl leading-relaxed">
                Releasing the 3D planetary dot-matrix globe. Deploying Next.js content routers for the database, expert tracking, and interactive prediction layouts.
              </p>
            </div>

            {/* Phase 2 */}
            <div className="relative pl-6">
              <div className="absolute -left-1 w-2 h-2 rounded-full bg-[#00F5B0] mt-1.5" />
              <div className="text-xs text-[#7A8694] mb-1">Engagement layer (Q3 2026 target)</div>
              <h3 className="text-base font-light text-white mb-2">Nested comment protocols & custom reports</h3>
              <p className="text-xs text-[#7A8694] max-w-3xl leading-relaxed">
                Activating persistent local storage upvotes, bookmarked timelines, and recursive commenting hierarchies to build structured futurological debates.
              </p>
            </div>

            {/* Phase 3 */}
            <div className="relative pl-6">
              <div className="absolute -left-1 w-2 h-2 rounded-full bg-[#00F5B0]/40 mt-1.5" />
              <div className="text-xs text-[#7A8694] mb-1">Live sensor sync (Q1 2027 target)</div>
              <h3 className="text-base font-light text-white/70 mb-2">Active climate data pipeline integration</h3>
              <p className="text-xs text-[#7A8694]/70 max-w-3xl leading-relaxed">
                Plugging in direct API pipelines from planetary monitoring networks. Projections will automatically scale their confidence scores when climate thresholds are crossed.
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
