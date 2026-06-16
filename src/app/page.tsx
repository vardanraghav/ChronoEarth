'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import CesiumGlobe       from '@/components/CesiumGlobe';
import BackgroundEffects from '@/components/BackgroundEffects';
import IntroCinematic    from '@/components/IntroCinematic';
import SearchModal       from '@/components/SearchModal';
import { CityData }      from '@/data/citiesData';

const DEFAULT_OVERLAYS = { climate: false, pollution: false, energy: true, satellite: false, ai: false };

const ACTIVE_LAYERS = {
  cities: true,
  climate: true,
  tech: true,
  energy: true,
  space: false,
  geopolitical: true,
};

const ACTIVE_SIMULATIONS = {
  seaLevelRise: 0,
  fusionBreakthrough: false,
  agiEmergence: false,
  popDecline: false,
  renewableTransition: false,
  arcticDominance: false,
  semiDisruptions: false,
};

const getHotBriefings = (year: number) => {
  if (year === 2030) {
    return [
      {
        category: 'TECHNOLOGY',
        time: '2h ago',
        title: 'AI Decides Regional Agriculture',
        desc: 'Decentralized AI grids are given full autonomous authority to distribute regional seed supplies and water allocations.',
        image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=120&auto=format&fit=crop&q=80',
        slug: 'ai-decides-regional-agriculture'
      },
      {
        category: 'ENERGY',
        time: '5h ago',
        title: 'First Commercial Fusion Plant Connects',
        desc: 'A 500MW magnetized target fusion reactor officially begins feeding electricity into the regional grid.',
        image: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=120&auto=format&fit=crop&q=80',
        slug: 'first-commercial-fusion-plant-connects'
      },
      {
        category: 'CLIMATE',
        time: '7h ago',
        title: 'Carbon-Tax Smart Contracts Go Live',
        desc: 'Global trade agreements enforce automatic blockchain carbon tariffs on all industrial logistics.',
        image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=120&auto=format&fit=crop&q=80',
        slug: 'carbon-tax-smart-contracts-go-live'
      },
      {
        category: 'GEOPOLITICS',
        time: '9h ago',
        title: 'Debris Sweeper Satellites Patrol LEO',
        desc: 'An international fleet of autonomous lasers and sweepers begins clearing orbital debris corridors.',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=120&auto=format&fit=crop&q=80',
        slug: 'debris-sweeper-satellites-patrol-leo'
      }
    ];
  } else if (year === 2040) {
    return [
      {
        category: 'TECHNOLOGY',
        time: '2h ago',
        title: 'Quantum Weather Supercomputers',
        desc: '10,000-qubit quantum arrays forecast monsoons and storms with 99% accuracy up to 30 days in advance.',
        image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=120&auto=format&fit=crop&q=80',
        slug: 'quantum-weather-supercomputers'
      },
      {
        category: 'ENERGY',
        time: '5h ago',
        title: 'Wireless Orbital Power Transmissions',
        desc: 'GEO solar satellites successfully beam high-frequency microwaves to rectenna fields in arid deserts.',
        image: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=120&auto=format&fit=crop&q=80',
        slug: 'wireless-orbital-power-transmissions'
      },
      {
        category: 'CLIMATE',
        time: '7h ago',
        title: 'Atmospheric Aerosol Injection Begins',
        desc: 'Under strict UN supervision, sulfur-dispensing sub-orbital drones deploy reflectant aerosols above the Arctic.',
        image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=120&auto=format&fit=crop&q=80',
        slug: 'atmospheric-aerosol-injection-begins'
      },
      {
        category: 'GEOPOLITICS',
        time: '9h ago',
        title: 'Moon Base Artemis Operational',
        desc: 'A permanent habitat at Shackleton Crater houses 50 astronauts and robotic engineers for launch expansions.',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=120&auto=format&fit=crop&q=80',
        slug: 'moon-base-artemis-operational'
      }
    ];
  } else {
    // 2050 and 2060+
    return [
      {
        category: 'TECHNOLOGY',
        time: '2h ago',
        title: 'AI Breakthrough',
        desc: 'New multi-modal AI systems achieve human-level reasoning in complex tasks.',
        image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=120&auto=format&fit=crop&q=80',
        slug: 'earth-wide-cybernetic-singularity'
      },
      {
        category: 'ENERGY',
        time: '5h ago',
        title: 'Global Fusion Milestone',
        desc: 'First net-positive fusion reactor brings clean energy closer to reality.',
        image: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=120&auto=format&fit=crop&q=80',
        slug: 'global-fusion-grid-meets-85-percent-demand'
      },
      {
        category: 'CLIMATE',
        time: '7h ago',
        title: 'Sea Level Acceleration',
        desc: 'New data shows 1.5x faster ice melt than predicted by previous models.',
        image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=120&auto=format&fit=crop&q=80',
        slug: 'sahara-fully-greened-by-desal-grids'
      },
      {
        category: 'GEOPOLITICS',
        time: '9h ago',
        title: 'New Global Alliances',
        desc: 'South-South partnerships reshape economic and geopolitical balance.',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=120&auto=format&fit=crop&q=80',
        slug: 'fully-biophilic-floating-megacities'
      }
    ];
  }
};

function HomeContent() {
  const router = useRouter();

  const [activeYear, setActiveYear] = useState(2050);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');

  // Search Placeholders Cycle
  const placeholders = [
    "Try: India 2050",
    "Try: AGI",
    "Try: Climate Risk",
    "Try: Fusion Energy",
    "Try: Semiconductor Race"
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeState('out');
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        setFadeState('in');
      }, 500);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut listener for Search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Telemetry dynamic Sparkline wave generator
  const [sparklinePoints, setSparklinePoints] = useState<string>("");
  useEffect(() => {
    let t = 0;
    const interval = setInterval(() => {
      t += 0.12;
      const points = [];
      for (let i = 0; i <= 12; i++) {
        const x = i * 14;
        const y = 20 + Math.sin(t + i * 0.7) * 7 + Math.cos(t * 0.4 + i * 0.3) * 3;
        points.push(`${x},${y}`);
      }
      setSparklinePoints(points.join(' '));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleSelectCity = (city: CityData | null) => {
    if (city) {
      router.push(`/dashboard?city=${encodeURIComponent(city.name)}`);
    }
  };

  const handleSelectCountry = (code: string | null) => {
    if (code) {
      router.push(`/dashboard?country=${code}`);
    }
  };

  const hotBriefings = getHotBriefings(activeYear);

  return (
    <main className="relative h-screen w-screen overflow-hidden select-none" style={{ background: '#02060B' }}>
      {/* Background Starfield and Nebula */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <BackgroundEffects earthMode="cyber" />
      </div>

      {/* Hero Globe Canvas Container */}
      <div className="home-globe-container">
        <CesiumGlobe
          activeYear={activeYear}
          activeCategory="AI"
          hoveredCategory={hoveredCategory}
          activeCity={null}
          setActiveCity={handleSelectCity}
          activeCountry={null}
          setActiveCountry={handleSelectCountry}
          overlays={DEFAULT_OVERLAYS}
          earthMode="cyber"
          activeLayers={ACTIVE_LAYERS}
          activeSimulations={ACTIVE_SIMULATIONS}
        />
      </div>

      {/* LEFT Navigation Sidebar */}
      <div className="absolute left-6 top-6 bottom-6 w-[280px] z-20 flex flex-col justify-between sidebar-glass p-6">
        {/* Brand Logo & Subtitle */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-[#00F5D4] flex items-center justify-center relative shadow-[0_0_6px_rgba(0,245,212,0.25)]">
              <div className="w-2 h-2 rounded-full bg-[#00F5D4]" />
            </div>
            <span className="text-[17px] font-bold text-white tracking-[0.25em] font-sans">
              CHRONO<span className="text-[#00F5D4]">EARTH</span>
            </span>
          </div>
          <span className="text-[9px] font-mono text-[#8CA8B8]/60 uppercase tracking-[0.18em] mt-1.5 pl-7">
            FUTURE INTELLIGENCE PLATFORM
          </span>
        </div>

        {/* Directory Navigation Links */}
        <div className="flex flex-col gap-2.5 my-8">
          {[
            { label: 'Overview', icon: '⚡', active: true, path: '/' },
            { label: 'Map', icon: '🌍', active: false, path: '/dashboard' },
            { label: 'Predictions', icon: '🔮', active: false, path: '/predictions' },
            { label: 'What\'s Hot', icon: '🔥', active: false, path: '/feed' },
            { label: 'FutureChat', icon: '💬', badge: 'AI', active: false, path: '/futurechat' },
            { label: 'Watchlist', icon: '⏱️', active: false, path: '/dashboard?watchlist=true' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.path)}
              className={`flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-300 font-mono text-xs uppercase tracking-wider text-left border cursor-pointer
                ${item.active 
                  ? 'bg-[#00F5D4]/8 text-white border-[#00F5D4]/20 shadow-[0_0_10px_rgba(0,245,212,0.08)]' 
                  : 'bg-transparent text-[#A2CCE2]/50 hover:text-white/90 border-transparent hover:bg-white/2'
                }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-[13px] ${item.active ? 'text-[#00F5D4]' : ''}`}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[8px] font-bold font-sans bg-[#00F5D4]/15 text-[#00F5D4] px-1.5 py-0.5 rounded-md">
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          {/* More Dropdown button */}
          <div className="relative group">
            <button className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl font-mono text-[10px] uppercase tracking-wider text-left border border-transparent text-[#8CA8B8]/50 hover:text-white hover:bg-white/3 cursor-pointer">
              <span>More Options</span>
              <span>▼</span>
            </button>
            <div className="absolute left-0 right-0 bottom-full mb-2 bg-[#07111A]/98 border border-white/8 backdrop-blur-xl rounded-xl p-2 hidden group-hover:flex flex-col gap-1 z-30 shadow-2xl">
              <button onClick={() => router.push('/about')} className="text-left py-2 px-3 text-[10px] font-mono text-[#8CA8B8] hover:text-white hover:bg-white/5 rounded-lg border-none bg-transparent cursor-pointer uppercase tracking-wider">About ChronoEarth</button>
              <button onClick={() => router.push('/feedback')} className="text-left py-2 px-3 text-[10px] font-mono text-[#8CA8B8] hover:text-white hover:bg-white/5 rounded-lg border-none bg-transparent cursor-pointer uppercase tracking-wider">Submit Feedback</button>
            </div>
          </div>
        </div>

      </div>

      {/* TOP Floating Header Area (Centered Search + Right Utility Icons) */}
      <div className="absolute top-6 left-[310px] right-[410px] h-[54px] z-20 flex justify-between items-center">
        {/* Floating Centered Search Bar */}
        <div 
          onClick={() => setSearchOpen(true)}
          className="flex-1 max-w-[500px] h-full premium-glass px-5 flex items-center justify-between cursor-pointer border border-white/8 hover:border-[#00F5D4]/20 hover:shadow-[0_0_12px_rgba(0,245,212,0.05)] transition-all duration-300 rounded-full"
        >
          <div className="flex items-center gap-3.5">
            <span className="text-[#8CA8B8]/70 text-sm">🔍</span>
            <span 
              className="text-xs font-mono text-[#8CA8B8]/80 select-none tracking-wide transition-opacity duration-500"
              style={{ opacity: fadeState === 'in' ? 0.8 : 0 }}
            >
              {placeholders[placeholderIndex]}
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#8CA8B8]/40 border border-white/10 px-2 py-0.5 rounded-md uppercase tracking-widest font-bold">
            ⌘ K
          </span>
        </div>
      </div>

      {/* Onboarding hint */}
      <div className="absolute top-[92px] left-[310px] right-[410px] flex justify-center z-20 pointer-events-none select-none">
        <div className="sidebar-glass px-5 py-2 rounded-full border border-white/8 flex items-center gap-2.5 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-pulse" />
          <span className="text-[10px] font-mono text-[#EAF7FF]/90 uppercase tracking-[0.2em] font-bold">
            CLICK ANY INTELLIGENCE NODE TO EXPLORE
          </span>
        </div>
      </div>

      {/* TOP RIGHT Control Buttons */}
      <div className="absolute top-6 right-6 h-[54px] z-20 flex items-center gap-3">
        {/* Notification Bell */}
        <button className="w-11 h-11 bg-[#030F12]/60 border border-white/8 rounded-full flex items-center justify-center hover:border-[#00F5D4]/20 hover:bg-[#030F12]/85 text-white cursor-pointer relative transition-all duration-300">
          <span className="text-sm">🔔</span>
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#00F5D4]" />
        </button>
        {/* Settings gear */}
        <button 
          onClick={() => router.push('/feedback')}
          className="w-11 h-11 bg-[#030F12]/60 border border-white/8 rounded-full flex items-center justify-center hover:border-[#00F5D4]/20 hover:bg-[#030F12]/85 text-white cursor-pointer transition-all duration-300"
        >
          <span className="text-sm">⚙️</span>
        </button>
        {/* Profile Circle */}
        <button 
          onClick={() => router.push('/about')}
          className="w-11 h-11 bg-[#00F5D4]/10 border border-[#00F5D4]/20 rounded-full flex items-center justify-center hover:border-[#00F5D4]/35 text-[#00F5D4] font-mono font-bold text-sm cursor-pointer transition-all duration-300"
        >
          A
        </button>
      </div>

      {/* HERO Overlay Text (Left beside the globe) */}
      <div className="absolute left-[310px] top-[26%] max-w-[280px] z-10 flex flex-col gap-4.5 animate-fade-up">
        <h1 className="text-3xl md:text-[40px] font-black tracking-tight leading-[1.05] m-0 uppercase font-sans text-white">
          MAKE THE<br />
          <span className="text-[#00F5D4]">FUTURE</span><br />
          VISIBLE.
        </h1>
        <div className="w-12 h-[2px] bg-gradient-to-r from-[#00F5D4] to-transparent" />
        <p className="text-[12px] leading-relaxed text-[#8CA8B8] font-light tracking-wide m-0">
          Explore future scenarios and global intelligence.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-6 self-start bg-[#030F12]/60 hover:bg-[#00F5D4]/8 text-white hover:text-[#00F5D4] border border-[#00F5D4]/20 hover:border-[#00F5D4]/40 px-5 py-2.5 rounded-full font-mono text-[10px] uppercase tracking-widest cursor-pointer transition-all duration-300"
        >
          EXPLORE THE FUTURE
        </button>
      </div>

      {/* Globe Legend */}
      <div className="absolute left-[310px] bottom-[165px] z-20 flex gap-4.5 p-2 px-3.5 sidebar-glass border border-white/5 rounded-xl font-mono text-[9px] uppercase tracking-wider text-[#8CA8B8]/80 select-none backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4]" />
          <span>TECHNOLOGY</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] shadow-[0_0_6px_#F59E0B]" />
          <span>ENERGY</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] shadow-[0_0_6px_#EF4444]" />
          <span>GEOPOLITICS</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]" />
          <span>CLIMATE</span>
        </div>
      </div>

      {/* BOTTOM CENTER Timeline Selector */}
      <div className="absolute bottom-[80px] left-[310px] right-[410px] flex flex-col items-center gap-3.5 z-20">
        <div className="premium-glass px-8 py-3.5 rounded-2xl flex items-center gap-6 border border-white/8 shadow-2xl">
          {([2030, 2040, 2050, 2060] as const).map((year, idx) => {
            const isActive = activeYear === year;
            const labels = ['THE NEXT SHIFT', 'EMERGING WORLD', 'FUTURE WORLD', 'BEYOND HORIZONS'];
            const label = labels[idx];
            return (
              <button
                key={year}
                onClick={() => setActiveYear(year)}
                className="bg-transparent border-none flex flex-col items-center cursor-pointer transition-all duration-300 group py-1.5 px-3 rounded-lg"
              >
                <span className={`text-[15px] font-mono font-bold tracking-wider transition-all duration-300
                  ${isActive 
                    ? 'text-[#00F5D4] scale-110' 
                    : 'text-[#8CA8B8]/50 group-hover:text-white'
                  }`}
                >
                  {year === 2060 ? '2060+' : year}
                </span>
                <span className={`text-[8px] font-mono uppercase tracking-widest mt-1.5 transition-all duration-300
                  ${isActive ? 'text-[#8CA8B8] font-bold' : 'text-[#8CA8B8]/30 group-hover:text-[#8CA8B8]/60'}`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Timeline Slider Tracker Dot Indicator */}
        <div className="w-[340px] h-[3px] bg-white/5 relative rounded-full">
          <div 
            className="absolute h-full bg-[#00F5D4] transition-all duration-500 rounded-full"
            style={{
              left: `${activeYear === 2030 ? 12 : activeYear === 2040 ? 37 : activeYear === 2050 ? 63 : 88}%`,
              width: '4px',
              height: '4px',
              top: '-0.5px',
              borderRadius: '50%',
              boxShadow: '0 0 6px #00F5D4',
            }}
          />
          {/* Horizontal dot slide path */}
          <div className="absolute inset-0 flex justify-between px-3">
            {[2030, 2040, 2050, 2060].map((y) => (
              <div 
                key={y} 
                className={`w-1 h-1 rounded-full transition-all duration-300
                  ${activeYear >= y ? 'bg-[#00F5D4]/35' : 'bg-white/10'}`} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Scroll to Explore indicator at absolute bottom center */}
      <div className="absolute bottom-4 left-[310px] right-[410px] flex items-center justify-center gap-2 z-20 pointer-events-none text-[#8CA8B8]/40 animate-breathe">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold">SCROLL TO EXPLORE</span>
        <div className="w-5 h-7 border border-[#8CA8B8]/30 rounded-full relative flex justify-center">
          <div className="w-1 h-1.5 bg-[#00F5D4]/60 rounded-full absolute top-1.5 animate-ping" />
          <div className="w-1 h-1.5 bg-[#00F5D4]/80 rounded-full absolute top-1.5" />
        </div>
      </div>

      {/* RIGHT Sidebar Panel (Live Feed & Quote) */}
      <div className="absolute right-6 top-[90px] bottom-6 w-[380px] z-20 flex flex-col justify-between">
        {/* Live News Feed Column */}
        <div className="flex-1 sidebar-glass p-5 flex flex-col justify-between mb-6 h-[60%]">
          <div className="flex justify-between items-center border-b border-white/5 pb-3.5 mb-2.5">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-[#00F5D4] uppercase tracking-[0.2em] font-semibold">WHAT'S HOT</span>
              <span className="text-[8px] font-mono text-[#8CA8B8]/50 uppercase tracking-widest mt-0.5">LIVE INTELLIGENCE FEED</span>
            </div>
            <button 
              onClick={() => router.push('/feed')}
              className="bg-transparent border-none p-0 text-[10px] font-mono text-[#00F5D4] hover:text-[#00E7C2] cursor-pointer uppercase tracking-widest flex items-center gap-1 font-bold"
            >
              <span>VIEW ALL</span>
              <span>→</span>
            </button>
          </div>

          {/* Feed Cards Loop */}
          <div className="flex-1 flex flex-col gap-2.5 justify-center">
            {hotBriefings.map((story) => {
              const catColor = story.category === 'TECHNOLOGY' ? 'text-[#00F5D4]' :
                               story.category === 'ENERGY' ? 'text-[#F59E0B]' :
                               story.category === 'GEOPOLITICS' ? 'text-[#EF4444]' :
                               story.category === 'CLIMATE' ? 'text-[#10B981]' : 'text-[#00F5D4]';
              return (
                <div 
                  key={story.title} 
                  onClick={() => router.push(`/dashboard?prediction=${story.slug}`)}
                  onMouseEnter={() => setHoveredCategory(story.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className="group flex gap-3.5 p-3 bg-[#030F12]/40 border border-white/5 hover:border-[#00F5D4]/15 hover:bg-[#030F12]/60 rounded-xl cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition-all duration-300 hover:scale-[1.01]"
                >
                  {/* Image Thumbnail with cyan glow border */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/8 group-hover:border-[#00F5D4]/20 flex-shrink-0 transition-colors duration-300 relative">
                    <img 
                      src={story.image} 
                      alt={story.title} 
                      className="w-full h-full object-cover desaturate-[0.35] brightness-[0.7] group-hover:scale-110 group-hover:brightness-[0.95] group-hover:desaturate-0 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-[#040B12]/20 mix-blend-color" />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-center text-[8.5px] font-mono text-[#8CA8B8]/50 tracking-wider">
                      <span className={`font-bold uppercase ${catColor}`}>{story.category}</span>
                      <span>{story.time}</span>
                    </div>
                    <h4 className="text-[12px] font-bold text-white group-hover:text-[#00F5D4] transition-colors leading-snug m-0 mt-0.5 tracking-wide">
                      {story.title}
                    </h4>
                    <p className="text-[10.5px] text-[#8CA8B8]/75 leading-relaxed font-light line-clamp-1 m-0 mt-0.5">
                      {story.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            onClick={() => router.push('/feed')}
            className="w-full bg-[#030F12]/50 border border-white/5 hover:border-[#00F5D4]/15 py-2 rounded-xl text-[9px] font-mono text-[#8CA8B8] hover:text-white cursor-pointer uppercase tracking-wider text-center transition-all duration-300 mt-2.5"
          >
            VIEW ALL BRIEFINGS →
          </button>
        </div>
      </div>


      {/* Credibility Footer */}
      <div className="absolute left-[310px] bottom-4 z-20 flex items-center gap-6 text-[9px] font-mono uppercase tracking-[0.2em] text-[#8CA8B8]/75 select-none">
        <span onClick={() => router.push('/about')} className="hover:text-[#00F5D4] hover:underline transition-all cursor-pointer">SOURCES</span>
        <span className="text-[#8CA8B8]/20">•</span>
        <span onClick={() => router.push('/about')} className="hover:text-[#00F5D4] hover:underline transition-all cursor-pointer">METHODOLOGY</span>
        <span className="text-[#8CA8B8]/20">•</span>
        <span onClick={() => router.push('/about')} className="hover:text-[#00F5D4] hover:underline transition-all cursor-pointer">ABOUT</span>
        <span className="text-[#8CA8B8]/20">•</span>
        <span onClick={() => router.push('/about')} className="hover:text-[#00F5D4] hover:underline transition-all cursor-pointer font-semibold">RESEARCH & REFERENCES</span>
        <span className="text-[#8CA8B8]/20">•</span>
        <span onClick={() => router.push('/feedback')} className="hover:text-[#00F5D4] hover:underline transition-all cursor-pointer">CONTACT</span>
      </div>

      {/* Centered Command Menu Search Overlay */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} setActiveCity={handleSelectCity} />

      {/* Reusable styles for animations */}
      <style jsx global>{`
        .home-globe-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 100vw;
          height: 100vh;
          z-index: 5;
          pointer-events: auto;
        }
        @media (min-width: 768px) {
          .home-globe-container {
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
          }
        }

        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-cursor {
          animation: cursorBlink 1.1s step-end infinite;
        }
      `}</style>
    </main>
  );
}

export default function Home() {
  const [introComplete, setIntroComplete] = useState(false);
  const [introChecked, setIntroChecked] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('chronoearth_intro_seen');
      if (seen === 'true') {
        setIntroComplete(true);
      }
    }
    setIntroChecked(true);
  }, []);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
  }, []);

  if (!introChecked) {
    return (
      <div className="h-screen w-screen bg-[#02060B] flex items-center justify-center font-mono text-[#00E5FF] text-xs" />
    );
  }

  return (
    <>
      {!introComplete && (
        <IntroCinematic onComplete={handleIntroComplete} />
      )}

      <div style={{
        opacity: introComplete ? 1 : 0,
        transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: introComplete ? 'auto' : 'none',
      }}>
        <Suspense fallback={
          <div className="h-screen w-screen bg-[#02060B] flex items-center justify-center font-mono text-[#00E5FF] text-xs">
            CONNECTING TO ORBITAL CHRONO_GRID...
          </div>
        }>
          <HomeContent />
        </Suspense>
      </div>
    </>
  );
}
