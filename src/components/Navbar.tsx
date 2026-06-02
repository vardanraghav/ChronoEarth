'use client';

import { useState } from 'react';

const navLinks = ['EXPLORE', 'CLIMATE', 'TECHNOLOGY', 'TIMELINE', 'ABOUT'];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('EXPLORE');

  return (
    <>
      <style>{`
        @keyframes nav-glow-underline {
          0% { width: 0; opacity: 0; }
          100% { width: 100%; opacity: 1; }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }
        @keyframes slide-down {
          0% { opacity: 0; transform: translateY(-12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .nav-link-hover::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          height: 1px;
          width: 0;
          background: linear-gradient(90deg, transparent, #00f0ff, transparent);
          transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          box-shadow: 0 0 8px #00f0ff80;
        }
        .nav-link-hover:hover::after {
          width: 100%;
        }
        .nav-link-hover:hover {
          color: #00f0ff;
          text-shadow: 0 0 12px #00f0ff60;
        }
        .pulse-dot {
          animation: pulse-dot 2s ease-in-out infinite;
        }
        .mobile-menu-enter {
          animation: slide-down 0.3s ease-out forwards;
        }
      `}</style>

      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4"
        style={{
          background: 'rgba(6, 9, 24, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 240, 255, 0.08)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center select-none">
          <span
            className="text-sm font-light uppercase"
            style={{
              letterSpacing: '0.3em',
              color: '#00f0ff',
              textShadow: '0 0 20px #00f0ff80, 0 0 40px #00f0ff30',
            }}
          >
            CHRONO
          </span>
          <span
            className="text-sm font-light uppercase text-white ml-1"
            style={{ letterSpacing: '0.3em' }}
          >
            EARTH
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link}
              onClick={() => setActiveLink(link)}
              className="nav-link-hover relative flex items-center gap-2 text-xs font-light uppercase transition-colors duration-300"
              style={{
                letterSpacing: '0.2em',
                color: activeLink === link ? '#00f0ff' : 'rgba(255,255,255,0.5)',
                textShadow: activeLink === link ? '0 0 12px #00f0ff60' : 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {activeLink === link && (
                <span
                  className="pulse-dot inline-block w-1.5 h-1.5 rounded-full"
                  style={{
                    background: '#00f0ff',
                    boxShadow: '0 0 6px #00f0ff, 0 0 12px #00f0ff80',
                  }}
                />
              )}
              {link}
            </button>
          ))}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col items-center justify-center w-8 h-8 gap-1.5"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <span
            className="block w-5 h-px transition-all duration-300"
            style={{
              background: '#00f0ff',
              transform: mobileOpen ? 'rotate(45deg) translateY(4px)' : 'none',
              boxShadow: '0 0 4px #00f0ff80',
            }}
          />
          <span
            className="block w-5 h-px transition-all duration-300"
            style={{
              background: '#00f0ff',
              opacity: mobileOpen ? 0 : 1,
              boxShadow: '0 0 4px #00f0ff80',
            }}
          />
          <span
            className="block w-5 h-px transition-all duration-300"
            style={{
              background: '#00f0ff',
              transform: mobileOpen ? 'rotate(-45deg) translateY(-4px)' : 'none',
              boxShadow: '0 0 4px #00f0ff80',
            }}
          />
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="fixed top-[57px] left-0 right-0 z-50 flex flex-col items-center gap-1 py-4 md:hidden mobile-menu-enter"
          style={{
            background: 'rgba(6, 9, 24, 0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(0, 240, 255, 0.08)',
          }}
        >
          {navLinks.map((link, i) => (
            <button
              key={link}
              onClick={() => {
                setActiveLink(link);
                setMobileOpen(false);
              }}
              className="flex items-center gap-2 py-3 px-6 w-full justify-center text-xs font-light uppercase transition-colors duration-300"
              style={{
                letterSpacing: '0.2em',
                color: activeLink === link ? '#00f0ff' : 'rgba(255,255,255,0.5)',
                textShadow: activeLink === link ? '0 0 12px #00f0ff60' : 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                animationDelay: `${i * 0.05}s`,
              }}
            >
              {activeLink === link && (
                <span
                  className="pulse-dot inline-block w-1.5 h-1.5 rounded-full"
                  style={{
                    background: '#00f0ff',
                    boxShadow: '0 0 6px #00f0ff, 0 0 12px #00f0ff80',
                  }}
                />
              )}
              {link}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
