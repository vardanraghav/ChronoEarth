'use client';

import { useState, useEffect } from 'react';
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

  const navLinks = [
    { href: '/', label: 'Map', icon: '🌍', activePattern: /^\/$/ },
    { href: '/feed', label: 'Feed', icon: '📰', activePattern: /^\/feed/ },
    { href: '/predictions', label: 'Predictions', icon: '🔮', activePattern: /^\/predictions/ },
    { href: '/knowledge', label: 'Knowledge', icon: '📚', activePattern: /^\/knowledge/ },
    { href: '/futurechat', label: 'FutureChat', icon: '💬', activePattern: /^\/futurechat/ },
  ];

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between transition-all duration-300"
        style={{
          padding: '24px 48px',
          background: 'linear-gradient(180deg, rgba(2, 6, 10, 0.9) 0%, rgba(2, 6, 10, 0.4) 60%, transparent 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 245, 176, 0.08)',
        }}
      >
        {/* Brand Logo - Futuristic, Sleek */}
        <Link
          href="/"
          className="group flex flex-col no-underline"
          style={{ letterSpacing: '0.25em' }}
        >
          <div className="flex items-center gap-1.5 font-light text-base tracking-[0.3em] text-white uppercase font-sans">
            <span>CHRONO</span>
            <span style={{ color: '#00F5B0', textShadow: '0 0 10px rgba(0, 245, 176, 0.4)' }} className="font-semibold">EARTH</span>
          </div>
          <span className="text-[9px] font-mono text-white/30 uppercase tracking-[0.15em] mt-0.5 transition-colors group-hover:text-white/50">
            Future Intelligence Platform
          </span>
        </Link>

        {/* Minimalist Centered Navigation Links */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => {
            const isActive = link.activePattern.test(pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group relative flex items-center gap-1.5 py-1.5 px-1 no-underline text-xs tracking-wider uppercase font-mono transition-colors"
                style={{
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.55)',
                }}
              >
                <span className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'animate-breathe' : ''}`}>
                  {link.icon}
                </span>
                <span className="group-hover:text-white transition-colors">{link.label}</span>
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent, #00F5B0, transparent)',
                      boxShadow: '0 0 8px #00F5B0',
                    }}
                  />
                )}
              </Link>
            );
          })}

          {/* Search Trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="group flex items-center gap-1.5 py-1.5 px-1 bg-transparent border-none cursor-pointer text-xs tracking-wider uppercase font-mono transition-colors text-white/55 hover:text-white"
          >
            <span className="transition-transform duration-300 group-hover:scale-110">
              🔍
            </span>
            <span>Search</span>
          </button>
        </div>

        {/* Mobile menu trigger */}
        <button
          className="md:hidden flex flex-col gap-1.5 cursor-pointer bg-transparent border-none p-2 relative z-50"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <div className="w-6 h-[1px] bg-white transition-all duration-300" style={{ transform: mobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none', background: mobileMenuOpen ? '#00F5B0' : '#FFF' }} />
          <div className="w-6 h-[1px] bg-white transition-all duration-300" style={{ opacity: mobileMenuOpen ? 0 : 1 }} />
          <div className="w-6 h-[1px] bg-white transition-all duration-300" style={{ transform: mobileMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none', background: mobileMenuOpen ? '#00F5B0' : '#FFF' }} />
        </button>

      </nav>

      {/* Full-Screen Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 w-screen h-screen z-[99999] flex flex-col justify-center items-center gap-8 md:hidden animate-slide-in-right"
          style={{
            background: 'rgba(2, 6, 10, 0.96)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
          }}
        >
          {/* Close Button top-right */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="fixed top-6 right-6 bg-transparent border-none text-[#00F5B0] hover:text-[#00D98F] cursor-pointer text-xs font-mono uppercase tracking-widest transition-colors p-2.5 z-[100000]"
            style={{ textShadow: '0 0 10px rgba(0, 245, 176, 0.4)' }}
          >
            [✕ close]
          </button>

          {/* Menu Header */}
          <div className="flex flex-col items-center gap-1 mb-6">
            <div className="flex items-center gap-1.5 font-light text-lg tracking-[0.3em] text-white uppercase font-sans">
              <span>CHRONO</span>
              <span style={{ color: '#00F5B0', textShadow: '0 0 10px rgba(0, 245, 176, 0.4)' }} className="font-semibold">EARTH</span>
            </div>
            <span className="text-[9px] font-mono text-white/30 uppercase tracking-[0.15em]">
              System Directory
            </span>
          </div>

          {/* Vertical Links */}
          <div className="flex flex-col gap-6 items-center">
            {navLinks.map((link) => {
              const isActive = link.activePattern.test(pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-4 py-2.5 px-6 text-base tracking-[0.2em] uppercase font-mono no-underline transition-all duration-300 hover:scale-105"
                  style={{
                    color: isActive ? '#00F5B0' : 'rgba(255, 255, 255, 0.65)',
                    textShadow: isActive ? '0 0 12px rgba(0, 245, 176, 0.5)' : 'none',
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className={isActive ? 'animate-breathe' : ''}>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
            
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchOpen(true);
              }}
              className="flex items-center gap-4 py-2.5 px-6 bg-transparent border-none text-base tracking-[0.2em] uppercase font-mono cursor-pointer text-white/65 hover:text-white transition-all duration-300 hover:scale-105"
            >
              <span>🔍</span>
              <span>Search</span>
            </button>
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
          animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Center Command Menu / Reusable Search Overlay */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} setActiveCity={setActiveCity} />
    </>
  );
}
