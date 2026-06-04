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
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-24 relative z-20 flex flex-col gap-16">
        
        {/* Title Header */}
        <div className="text-center md:text-left flex flex-col gap-4 border-b border-white/5 pb-8">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-[10px] font-sans-editorial text-white/45 tracking-[0.25em] uppercase font-medium">
              PROJECT SPECIFICATION BRIEF
            </span>
          </div>
          <h1 className="text-4xl md:text-[#FFFFFF]xl font-display font-light text-white tracking-wide">
            ChronoEarth Forecast Matrix
          </h1>
          <p className="text-sm font-serif text-white/60 max-w-2xl leading-relaxed">
            Simulating planetary trajectory vectors and future intelligence alignment parameters for 2030, 2040, and 2050.
          </p>
        </div>

        {/* Section 1: Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div style={panelStyle} className="flex flex-col gap-4">
            <h2 className="text-base font-display font-light text-white tracking-wider uppercase">
              01 // System Vision
            </h2>
            <p className="text-sm leading-relaxed text-white/70 font-serif font-light">
              To construct a highly responsive digital twin model of planet Earth that integrates quantum forecasting, ecological telemetry, and technological trajectories. ChronoEarth serves as an active planetary operating system dashboard, enabling humanity to visualize, anticipate, and mitigate multi-dimensional systemic risks before they manifest.
            </p>
            <div className="mt-auto border-t border-white/5 pt-4 flex justify-between items-center text-[9px] font-sans-editorial text-white/30">
              <span>ESTABLISHED: 2026</span>
              <span>NETWORK STATUS: ACTIVE</span>
            </div>
          </div>

          <div style={panelStyle} className="flex flex-col gap-4">
            <h2 className="text-base font-display font-light text-white tracking-wider uppercase">
              02 // Core Mission
            </h2>
            <p className="text-sm leading-relaxed text-white/70 font-serif font-light">
              Our mission is to crowdsource and simulate future scenarios with empirical precision. By matching projections from leading futurologists with real-time planetary sensor readings, we enable citizens, policy makers, and systems engineers to vote on forecast likelihoods, test local technology impacts, and adapt urban centers dynamically.
            </p>
            <div className="mt-auto border-t border-white/5 pt-4 flex justify-between items-center text-[9px] font-sans-editorial text-white/30">
              <span>TARGETS: 2030 / 2040 / 2050</span>
              <span>COMPILATION: ONGOING</span>
            </div>
          </div>
        </div>

        {/* Section 2: Methodology & Forecast Engine */}
        <div style={panelStyle}>
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-display font-light text-white tracking-wider uppercase">
              Forecasting Engine Methodology
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-2">
              <div className="p-5 border border-white/5 rounded flex flex-col gap-2">
                <div className="text-[10px] font-sans-editorial text-white/40 uppercase tracking-wider font-semibold">Step 01 // Sensor Assimilation</div>
                <p className="text-xs text-white/60 leading-relaxed font-serif">
                  Decentralized nodes monitor global telemetry including carbon coefficients, oceanic thermal differentials, and LEO satellite arrays.
                </p>
              </div>
              <div className="p-5 border border-white/5 rounded flex flex-col gap-2">
                <div className="text-[10px] font-sans-editorial text-white/40 uppercase tracking-wider font-semibold">Step 02 // Expert Synthesis</div>
                <p className="text-xs text-white/60 leading-relaxed font-serif">
                  Leading specialists in Quantum Intelligence, Geo-engineering, and Nanomedicine input projection parameters into the Chrono-matrix.
                </p>
              </div>
              <div className="p-5 border border-white/5 rounded flex flex-col gap-2">
                <div className="text-[10px] font-sans-editorial text-white/40 uppercase tracking-wider font-semibold">Step 03 // Branch Simulation</div>
                <p className="text-xs text-white/60 leading-relaxed font-serif">
                  Predictive neural models run continuous timelines, scoring confidence ratings based on user validation, upvotes, and environmental trends.
                </p>
              </div>
            </div>

            <div className="border border-white/10 p-5 rounded font-sans-editorial text-xs text-white/50 mt-4 flex flex-col gap-2 bg-black/20">
              <div>&gt; RUNNING CHRONO_FORECAST_CORE v4.12...</div>
              <div>&gt; CORRELATING ENVIRONMENTAL DYNAMICS MATRIX... OPTIMAL</div>
              <div className="text-emerald-400">&gt; TARGET PROJECTION STABILITY SCENARIO: COOPERATIVE SYSTEMS ALIGNMENT (82%)</div>
            </div>
          </div>
        </div>

        {/* Section 3: Data Sources */}
        <div style={panelStyle}>
          <h2 className="text-xl font-display font-light text-white mb-6 tracking-wider uppercase">
            Primary Data Feed Sources
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans-editorial text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-white/50 text-[10px] uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Feed Channel</th>
                  <th className="pb-3 font-semibold">Sensor Origin</th>
                  <th className="pb-3 font-semibold">Update Frequency</th>
                  <th className="pb-3 font-semibold text-right">Integrity Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/70 font-serif">
                <tr>
                  <td className="py-4 font-semibold text-white font-sans-editorial">LEO Satellites</td>
                  <td className="py-4 font-light">Autonomous Debris Patrollers & Reflectance Trackers</td>
                  <td className="py-4 font-light">Real-time (0.04s latency)</td>
                  <td className="py-4 text-right text-emerald-400 font-sans-editorial">99.8%</td>
                </tr>
                <tr>
                  <td className="py-4 font-semibold text-white font-sans-editorial">Marine Telemetry</td>
                  <td className="py-4 font-light">OTEC Baseline Probes & Reef MINERAL Collectors</td>
                  <td className="py-4 font-light">Every 60s</td>
                  <td className="py-4 text-right text-emerald-400 font-sans-editorial">98.2%</td>
                </tr>
                <tr>
                  <td className="py-4 font-semibold text-white font-sans-editorial">Urban Neural Mesh</td>
                  <td className="py-4 font-light">Transit Zone Microgrids & Carbon-Tax Contracts</td>
                  <td className="py-4 font-light">Event-triggered (Instant)</td>
                  <td className="py-4 text-right text-emerald-400 font-sans-editorial">99.1%</td>
                </tr>
                <tr>
                  <td className="py-4 font-semibold text-white font-sans-editorial">Expert Networks</td>
                  <td className="py-4 font-light">UN forecasting collectives & Nobel-grade nodes</td>
                  <td className="py-4 font-light">Bi-weekly consensus cycles</td>
                  <td className="py-4 text-right text-emerald-400 font-sans-editorial">95.4%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Roadmap */}
        <div style={panelStyle}>
          <h2 className="text-xl font-display font-light text-white mb-8 tracking-wider uppercase text-center md:text-left">
            Forecast Engine Roadmap
          </h2>
          
          <div className="relative border-l border-white/10 ml-4 md:ml-8 flex flex-col gap-10">
            {/* Phase 1 */}
            <div className="relative pl-8">
              <div className="absolute -left-1 w-2 h-2 rounded-full bg-white mt-1.5" />
              <div className="text-[10px] font-sans-editorial text-white/50 uppercase mb-1 font-semibold">Phase 1 // System Foundation (Current)</div>
              <h3 className="text-base font-display font-light text-white uppercase tracking-wider mb-2">Immersive Globe Visualizer & Routing</h3>
              <p className="text-xs text-white/65 max-w-3xl leading-relaxed font-serif">
                Releasing the 3D planetary dot-matrix globe. Deploying Next.js content routers for the database, expert tracking, and interactive prediction layouts.
              </p>
            </div>

            {/* Phase 2 */}
            <div className="relative pl-8">
              <div className="absolute -left-1 w-2 h-2 rounded-full bg-white mt-1.5" />
              <div className="text-[10px] font-sans-editorial text-white/50 uppercase mb-1 font-semibold">Phase 2 // Engagement Layer (Q3 2026)</div>
              <h3 className="text-base font-display font-light text-white uppercase tracking-wider mb-2">Nested Comment Protocols & Custom Reports</h3>
              <p className="text-xs text-white/65 max-w-3xl leading-relaxed font-serif">
                Activating persistent local storage upvotes, bookmarked timelines, and recursive commenting hierarchies to build structured futurological debates.
              </p>
            </div>

            {/* Phase 3 */}
            <div className="relative pl-8">
              <div className="absolute -left-1 w-2 h-2 rounded-full bg-white/40 mt-1.5" />
              <div className="text-[10px] font-sans-editorial text-white/40 uppercase mb-1">Phase 3 // Live Sensor Sync (Q1 2027)</div>
              <h3 className="text-base font-display font-light text-white/70 uppercase tracking-wider mb-2">Active Climate Data Pipeline Integration</h3>
              <p className="text-xs text-white/50 max-w-3xl leading-relaxed font-serif">
                Plugging in direct API pipelines from planetary monitoring networks. Projections will automatically scale their confidence scores when climate thresholds are crossed.
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
