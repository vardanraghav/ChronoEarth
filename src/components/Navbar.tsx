'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchModal from './SearchModal';

interface NavbarProps {
  onSearchClick?: () => void;
  setActiveCity?: (city: any) => void;
  earthMode?: 'cyber' | 'realistic';
  activeView?: 'map' | 'feed';
  onViewChange?: (view: 'map' | 'feed') => void;
}

export default function Navbar({ setActiveCity }: NavbarProps) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hubsDropdownOpen, setHubsDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for product tour sensors events
  useEffect(() => {
    const handleOpen = () => {
      if (window.innerWidth < 768) {
        setMobileMenuOpen(true);
      } else {
        setHubsDropdownOpen(true);
      }
    };
    const handleClose = () => {
      setMobileMenuOpen(false);
      setHubsDropdownOpen(false);
    };

    window.addEventListener('chronoearth-tour-sensors-open', handleOpen);
    window.addEventListener('chronoearth-tour-sensors-close', handleClose);
    return () => {
      window.removeEventListener('chronoearth-tour-sensors-open', handleOpen);
      window.removeEventListener('chronoearth-tour-sensors-close', handleClose);
    };
  }, []);

  // Ctrl+K Global key binding
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Disable body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setHubsDropdownOpen(false);
      }

    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const primaryLinks = [
    { href: '/', label: 'Map', icon: '🌍', activePattern: /^\/($|dashboard)/ },
    { href: '/feed', label: 'Intel Feed', icon: '📰', activePattern: /^\/feed/ },
    { href: '/semiconductor', label: 'Semiconductor', icon: '💾', activePattern: /^\/semiconductor/ },
    { href: '/knowledge', label: 'Knowledge', icon: '📚', activePattern: /^\/knowledge/ },
    { href: '/about', label: 'About', icon: 'ℹ️', activePattern: /^\/about/ },
  ];

  const secondaryLinks = [
    { href: '/semiconductor', label: 'Semiconductor Terminal', icon: '💾', description: 'Flagship semiconductor analytics' },
    { href: '/climate', label: 'Climate Core', icon: '🌡️', description: 'Real-time weather & sea anomalies' },
    { href: '/space', label: 'Space Center', icon: '🚀', description: 'Orbit tracking & solar forecast' },
    { href: '/earthquakes', label: 'Seismic Core', icon: '🌋', description: 'Global earthquake telemetry' },
    { href: '/markets', label: 'Markets Matrix', icon: '📈', description: 'Securities & indices data' },
    { href: '/futurologists', label: 'Futurologists', icon: '🧠', description: 'System architects & designers' },
    { href: '/about', label: 'System Codex', icon: 'ℹ️', description: 'About the ChronoEarth grid' },
    { href: '/sources', label: 'Sources & Credits', icon: '📚', description: 'Attributions & tech providers' },
    { href: '/feedback', label: 'Comms Uplink', icon: '📡', description: 'Submit diagnostic telemetry' }
  ];

  return (
    <>
      <nav
        className={`fixed z-50 flex items-center justify-between transition-all duration-300 premium-glass ${
          isMobile ? 'top-2 left-2 right-2' : 'top-4 left-6 right-6'
        }`}
        style={{
          padding: isMobile ? '8px 16px' : '12px 30px',
          border: '1px solid rgba(0, 229, 255, 0.15)',
          boxShadow: '0 8px 32px 0 rgba(0, 6, 12, 0.5), inset 0 0 12px rgba(0, 229, 255, 0.05)',
        }}
      >
        {/* Brand Logo - Futuristic, Sleek */}
        <Link
          href="/"
          className="group flex flex-col no-underline mr-4"
          style={{ letterSpacing: '0.25em' }}
        >
          <div className="flex items-center gap-1.5 font-light text-base tracking-[0.3em] text-white uppercase font-sans">
            <span>CHRONO</span>
            <span style={{ color: '#00E5FF', textShadow: '0 0 10px rgba(0, 229, 255, 0.4)' }} className="font-semibold">EARTH</span>
          </div>
          <span className="text-[8px] font-mono text-[#8CA8B8] uppercase tracking-[0.15em] mt-0.5 transition-colors group-hover:text-white/50">
            Future Intelligence Platform
          </span>
        </Link>

        {/* Minimalist Centered Navigation Links */}
        <div className="hidden lg:flex items-center gap-6">
          {primaryLinks.map((link) => {
            const isActive = link.activePattern.test(pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                id={`nav-${link.label.toLowerCase().replace(/\s+/g, '')}`}
                className="group relative flex items-center gap-1 py-1 px-1.5 no-underline text-xs tracking-wider uppercase font-mono transition-colors"
                style={{
                  color: isActive ? '#FFFFFF' : 'rgba(234, 247, 255, 0.55)',
                }}
              >
                <span className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'animate-breathe' : ''}`}>
                  {link.icon}
                </span>
                <span className="group-hover:text-white transition-colors">{link.label}</span>
                {isActive && (
                  <span
                    className="absolute bottom-[-14px] left-0 right-0 h-[2px] rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent, #00E5FF, transparent)',
                      boxShadow: '0 0 8px #00E5FF',
                    }}
                  />
                )}
              </Link>
            );
          })}

          {/* Hubs Dropdown Trigger */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setHubsDropdownOpen(!hubsDropdownOpen)}
              id="nav-sensors"
              className="group flex items-center gap-1 py-1 px-1.5 bg-transparent border-none cursor-pointer text-xs tracking-wider uppercase font-mono transition-colors text-white/55 hover:text-white"
            >
              <span>⚙️</span>
              <span>Sensors</span>
              <span className={`text-[8px] transition-transform duration-300 ${hubsDropdownOpen ? 'rotate-180 text-[#00E5FF]' : ''}`}>▼</span>
            </button>

            {/* Dropdown Menu */}
            {hubsDropdownOpen && (
              <div 
                id="sensors-dropdown"
                className="absolute top-8 right-0 w-64 p-3 flex flex-col gap-2 rounded-lg premium-glass border"
                style={{
                  backgroundColor: 'rgba(2, 6, 12, 0.95)',
                  borderColor: 'rgba(0, 229, 255, 0.2)',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 229, 255, 0.1)',
                }}
              >
                <div className="text-[9px] font-mono text-[#8CA8B8] border-b border-white/5 pb-1 uppercase tracking-widest mb-1">
                  INTELLIGENCE SYSTEMS
                </div>
                {secondaryLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      id={link.label === 'Sources & Credits' ? 'sensor-sources' : link.label === 'Comms Uplink' ? 'sensor-feedback' : undefined}
                      className="group flex items-start gap-2.5 p-2 rounded no-underline transition-all hover:bg-white/5"
                      onClick={() => setHubsDropdownOpen(false)}
                    >
                      <span className="text-sm mt-0.5 group-hover:scale-110 transition-transform">{link.icon}</span>
                      <div className="flex flex-col">
                        <span 
                          className="text-xs uppercase font-mono tracking-wide"
                          style={{ color: isActive ? '#00E5FF' : 'rgba(255, 255, 255, 0.85)' }}
                        >
                          {link.label}
                        </span>
                        <span className="text-[9px] text-white/40 group-hover:text-white/60 font-mono transition-colors mt-0.5">
                          {link.description}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Search Trigger */}
          <button
            id="nav-search"
            onClick={() => setSearchOpen(true)}
            className="group flex items-center gap-1.5 py-1 px-2.5 bg-white/5 hover:bg-[#00E5FF]/10 rounded border border-[#00E5FF]/20 cursor-pointer text-xs tracking-wider uppercase font-mono transition-all text-white/70 hover:text-whitemr-2"
            title="Search database (Ctrl+K)"
          >
            <span>🔍</span>
            <span>Search</span>
            <kbd className="text-[9px] font-sans px-1.5 py-0.5 rounded bg-black/40 text-[#8CA8B8] border border-white/10 ml-1">
              Ctrl+K
            </kbd>
          </button>

          {/* Settings Link */}
          <Link
            id="nav-settings"
            href="/settings"
            className="group flex items-center gap-1.5 py-1 px-2.5 bg-white/5 hover:bg-[#00E5FF]/10 rounded border border-[#00E5FF]/20 cursor-pointer text-xs tracking-wider uppercase font-mono transition-all text-white/70 hover:text-white"
            title="System Settings"
          >
            <span>⚙️</span>
            <span>Settings</span>
          </Link>
        </div>

        {/* Mobile / Mid-size layout action buttons */}
        <div className="lg:hidden flex items-center gap-3">
          {/* Quick search button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 cursor-pointer bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
          >
            🔍
          </button>

          {/* Mobile menu trigger */}
          <button
            id="mobile-menu-trigger"
            className="flex flex-col gap-1.5 cursor-pointer bg-transparent border-none p-2 relative z-[100001]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="w-6 h-[1.5px] bg-white transition-all duration-300" style={{ transform: mobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none', background: mobileMenuOpen ? '#00E5FF' : '#FFF' }} />
            <div className="w-6 h-[1.5px] bg-white transition-all duration-300" style={{ opacity: mobileMenuOpen ? 0 : 1 }} />
            <div className="w-6 h-[1.5px] bg-white transition-all duration-300" style={{ transform: mobileMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none', background: mobileMenuOpen ? '#00E5FF' : '#FFF' }} />
          </button>
        </div>
      </nav>

      {/* Full-Screen Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 w-screen h-screen z-[99999] flex flex-col justify-between p-8 lg:hidden animate-slide-in-right font-mono"
          style={{
            background: 'rgba(2, 6, 12, 0.98)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            borderLeft: '1px solid rgba(0, 229, 255, 0.1)',
          }}
        >
          {/* Menu Header */}
          <div className="flex justify-between items-center mt-14 border-b border-[#00E5FF]/10 pb-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 font-light text-lg tracking-[0.3em] text-white uppercase font-sans">
                <span>CHRONO</span>
                <span style={{ color: '#00E5FF', textShadow: '0 0 10px rgba(0, 229, 255, 0.4)' }} className="font-semibold">EARTH</span>
              </div>
              <span className="text-[9px] text-[#8CA8B8] uppercase tracking-[0.15em] mt-0.5">
                SYSTEM MENU
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="bg-transparent border border-[#00E5FF]/20 text-[#00E5FF] hover:text-[#6FEAFF] cursor-pointer text-xs font-mono uppercase tracking-widest px-3 py-1 rounded transition-all"
              style={{ textShadow: '0 0 10px rgba(0, 229, 255, 0.4)' }}
            >
              [✕ CLOSE]
            </button>
          </div>

          {/* Scrollable Links Area */}
          <div className="flex-1 overflow-y-auto py-6 pr-2 flex flex-col gap-6 custom-scrollbar">
            {/* Local Calibration Interface */}
            <div className="flex flex-col gap-2 border border-white/5 p-4 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
              <div className="text-[9px] text-[#8CA8B8] uppercase tracking-widest font-bold font-mono">System Calibration</div>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <Link
                  href="/settings"
                  className="flex items-center justify-center p-2 rounded border border-[#00E5FF]/30 bg-[#00E5FF]/10 text-[10px] text-[#00E5FF] no-underline uppercase font-mono font-bold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ⚙️ Settings
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.dispatchEvent(new CustomEvent('start-chronoearth-tour'));
                  }}
                  className="flex items-center justify-center p-2 rounded border border-white/10 bg-white/5 text-[10px] text-white cursor-pointer font-mono uppercase bg-transparent"
                >
                  🔄 Tour
                </button>
              </div>
            </div>

            {/* Primary Operations Section */}
            <div className="flex flex-col gap-2">
              <div className="text-[10px] text-[#00E5FF] font-bold tracking-widest border-l-2 border-[#00E5FF] pl-2 mb-1">
                PRIMARY INTERFACES
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {primaryLinks.map((link) => {
                  const isActive = link.activePattern.test(pathname);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-3.5 p-3 rounded-lg border transition-all duration-300 no-underline"
                      style={{
                        backgroundColor: isActive ? 'rgba(0, 229, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                        borderColor: isActive ? 'rgba(0, 229, 255, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                        color: isActive ? '#00E5FF' : 'rgba(255, 255, 255, 0.8)',
                      }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="text-lg">{link.icon}</span>
                      <span className="text-sm uppercase tracking-wide font-semibold">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Real-time Telemetry Section */}
            <div id="mobile-sensors-section" className="flex flex-col gap-2">
              <div className="text-[10px] text-[#BF5AF2] font-bold tracking-widest border-l-2 border-[#BF5AF2] pl-2 mb-1">
                SENSORS & COGNITIVE CHANNELS
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {secondaryLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      id={link.label === 'Sources & Credits' ? 'mobile-sensor-sources' : link.label === 'Comms Uplink' ? 'mobile-sensor-feedback' : undefined}
                      className="flex flex-col gap-0.5 p-3 rounded-lg border transition-all duration-300 no-underline"
                      style={{
                        backgroundColor: isActive ? 'rgba(191, 90, 242, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                        borderColor: isActive ? 'rgba(191, 90, 242, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                        color: isActive ? '#BF5AF2' : 'rgba(255, 255, 255, 0.8)',
                      }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{link.icon}</span>
                        <span className="text-sm uppercase tracking-wide font-semibold">{link.label}</span>
                      </div>
                      <span className="text-[9px] text-white/40 mt-1 pl-7">{link.description}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Diagnostic Panel */}
          <div className="border-t border-white/5 pt-4 text-[9px] text-[#7A8694] flex justify-between items-center">
            <span>CHRONO_OS v4.82 // NODE STATUS: ONLINE</span>
            <span>SECURE ENCRYPTED UPLINK</span>
          </div>
        </div>
      )}

      {/* CSS Keyframes for mobile menu slide-in */}
      <style>{`
         @keyframes slideInRight {
           from {
             transform: translateX(100%);
             opacity: 0;
           }
           to {
             transform: translateX(0);
             opacity: 1;
           }
         }
         .animate-slide-in-right {
           animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
         }
      `}</style>

      {/* Center Command Menu / Reusable Search Overlay */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} setActiveCity={setActiveCity} />
    </>
  );
}
