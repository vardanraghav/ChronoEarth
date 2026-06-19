'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#02060A]/85 backdrop-blur-md border-t border-white/5 py-10 mt-auto relative z-20 font-mono">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Brand */}
        <div className="flex flex-col gap-2">
          <Link href="/" className="group flex flex-col no-underline" style={{ letterSpacing: '0.25em' }}>
            <div className="flex items-center gap-1.5 font-light text-sm tracking-[0.3em] text-white uppercase font-sans">
              <span>CHRONO</span>
              <span style={{ color: '#00E5FF', textShadow: '0 0 10px rgba(0, 229, 255, 0.4)' }} className="font-semibold">EARTH</span>
            </div>
            <span className="text-[8px] text-[#8CA8B8] uppercase tracking-[0.15em] mt-0.5">
              Future Intelligence Platform
            </span>
          </Link>
          <p className="text-[10px] text-slate-500 leading-relaxed font-sans max-w-xs mt-2">
            Simulating global warming parameters, technology indices, and decentralized forecast matrices into 2050.
          </p>
        </div>

        {/* Center Column: Direct Shards Links */}
        <div className="flex flex-col gap-3">
          <span className="text-[9px] text-[#00E5FF] uppercase tracking-[0.2em] font-bold">Planetary Core Nodes</span>
          <div className="grid grid-cols-2 gap-2 text-xs font-light">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors no-underline">🌍 Map View</Link>
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors no-underline">📊 Dashboard</Link>
            <Link href="/feed" className="text-slate-400 hover:text-white transition-colors no-underline">📰 Intel Feed</Link>
            <Link href="/predictions" className="text-slate-400 hover:text-white transition-colors no-underline">🔮 Predictions</Link>
            <Link href="/knowledge" className="text-slate-400 hover:text-white transition-colors no-underline">📚 Knowledge</Link>
            <Link href="/futurechat" className="text-slate-400 hover:text-white transition-colors no-underline">💬 FutureChat</Link>
            <Link href="/about" className="text-slate-400 hover:text-white transition-colors no-underline font-semibold text-[#00F5B0]">ℹ️ About Codex</Link>
            <Link href="/sources" className="text-slate-400 hover:text-white transition-colors no-underline font-semibold text-[#BF5AF2]">📜 Sources</Link>
          </div>
        </div>

        {/* Right Column: Credits & Stats */}
        <div className="flex flex-col gap-3 font-mono">
          <span className="text-[9px] text-rose-400 uppercase tracking-[0.2em] font-bold">Platform Credits</span>
          <div className="flex flex-col gap-1.5 text-xs text-slate-400">
            <span className="text-white">Creator: <span className="font-semibold text-white/95">Vardan Raghav</span></span>
            <span className="text-[9px] text-slate-500">Strategic Systems Architect</span>
          </div>
          <div className="border-t border-white/5 pt-3 mt-1 flex flex-col gap-1 text-[8px] text-slate-500 uppercase tracking-wider">
            <span>CHRONO_OS v4.82 // SECURED LINK</span>
            <span>NODE STATUS: ONLINE</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
