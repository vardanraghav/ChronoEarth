'use client';

import { useEffect, useState } from 'react';
import { EarthMode } from './CesiumGlobeContent';

interface BackgroundEffectsProps {
  earthMode?: EarthMode;
}

interface Star {
  id: number; x: number; y: number;
  size: number; opacity: number; duration: number; delay: number; color: string;
}

// Realistic spectral distribution
const REALISTIC_COLORS = [
  { color: '#ddeeff', weight: 12 }, { color: '#eef2ff', weight: 15 },
  { color: '#f8f9ff', weight: 25 }, { color: '#ffffff',  weight: 28 },
  { color: '#fff9ee', weight: 12 }, { color: '#fff5e0', weight: 8  },
  { color: '#c8d8ff', weight: 5  }, { color: '#ffd9a0', weight: 3  },
  { color: '#ffb8a0', weight: 2  },
];

const CYBER_COLORS = [
  { color: '#00F5B0', weight: 35 },
  { color: '#00D98F', weight: 30 },
  { color: '#ffffff', weight: 35 },
];

function pickColor(palette: { color: string; weight: number }[]): string {
  const total = palette.reduce((s, c) => s + c.weight, 0);
  let rand = Math.random() * total;
  for (const e of palette) { rand -= e.weight; if (rand <= 0) return e.color; }
  return '#ffffff';
}

function generateStars(mode: EarthMode): Star[] {
  const palette = mode === 'cyber' ? CYBER_COLORS : REALISTIC_COLORS;
  const count   = mode === 'cyber' ? 280 : 180;
  return Array.from({ length: count }, (_, i) => ({
    id:       i,
    x:        Math.random() * 100,
    y:        Math.random() * 100,
    size:     i % 40 === 0 ? 2.5 + Math.random() * 1.5 : i % 12 === 0 ? 1.5 + Math.random() : 0.5 + Math.random() * 0.8,
    opacity:  0.25 + Math.random() * 0.65,
    duration: 3 + Math.random() * 6,
    delay:    Math.random() * 8,
    color:    pickColor(palette),
  }));
}

export default function BackgroundEffects({ earthMode = 'realistic' }: BackgroundEffectsProps) {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => { setStars(generateStars(earthMode)); }, [earthMode]);

  const isCyber = earthMode === 'cyber';

  return (
    <>
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: var(--op); transform: scale(1); }
          50%       { opacity: calc(var(--op) * 0.28); transform: scale(0.55); }
        }
        @keyframes twinkle-bright {
          0%, 100% { opacity: var(--op); transform: scale(1);    filter: brightness(1);   }
          40%       { opacity: calc(var(--op) * 0.45); transform: scale(0.65); filter: brightness(0.6); }
          65%       { opacity: var(--op); transform: scale(1.2); filter: brightness(1.4); }
        }
        @keyframes hex-drift {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-80px); }
        }
        @keyframes scanline-sweep {
          0%   { top: -2px; opacity: 0; }
          5%   { opacity: 0.4; }
          95%  { opacity: 0.4; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes cyber-pulse {
          0%, 100% { opacity: 0.04; }
          50%       { opacity: 0.10; }
        }
      `}</style>

      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">

        {/* ── Base background ─────────────────────────────────────────── */}
        <div className="absolute inset-0" style={{
          background: isCyber
            ? `radial-gradient(ellipse at 50% 50%, #040B12 0%, #02060A 50%, #000000 100%)`
            : `radial-gradient(ellipse at 50% 50%, #07091a 0%, #050710 45%, #020308 100%)`,
          transition: 'background 1.5s ease',
        }} />

        {/* ── Star field ──────────────────────────────────────────────── */}
        {stars.map((star) => {
          const isBright = star.size > 2.0;
          const isMed    = star.size > 1.5;
          const glow     = isCyber ? `0 0 ${star.size * 4}px ${star.size * 2}px ${star.color}50, 0 0 ${star.size}px ${star.color}` : undefined;
          return (
            <div key={star.id} className="absolute rounded-full" style={{
              left: `${star.x}%`, top: `${star.y}%`,
              width:  `${star.size}px`, height: `${star.size}px`,
              background: star.color,
              boxShadow: isBright ? (isCyber ? glow : `0 0 ${star.size * 3}px ${star.size * 1.5}px ${star.color}40`) : isMed ? `0 0 ${star.size * 2}px ${star.color}30` : 'none',
              ['--op' as string]: star.opacity,
              opacity: star.opacity,
              animation: isBright ? `twinkle-bright ${star.duration}s ease-in-out infinite` : `twinkle ${star.duration}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
            }} />
          );
        })}

        {/* ── Corner vignette ─────────────────────────────────────────── */}
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(2,3,8,${isCyber ? '0.45' : '0.35'}) 70%, rgba(2,3,8,${isCyber ? '0.85' : '0.75'}) 100%)`,
        }} />

        {/* ── Nebula glow ─────────────────────────────────────────────── */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{
          width: '900px', height: '900px', borderRadius: '50%',
          background: isCyber
            ? 'radial-gradient(circle, rgba(0,245,176,0.06) 0%, rgba(0,217,143,0.02) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(30,50,120,0.06) 0%, rgba(10,20,60,0.03) 50%, transparent 70%)',
          filter: 'blur(40px)',
          transition: 'background 1.5s ease',
        }} />

        {/* ── Cyber-only overlays ─────────────────────────────────────── */}
        {isCyber && (
          <>
            {/* Hex grid pattern */}
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(30deg,  rgba(0,245,176,0.02) 12%, transparent 12.5%, transparent 87%, rgba(0,245,176,0.02) 87.5%),
                linear-gradient(150deg, rgba(0,245,176,0.02) 12%, transparent 12.5%, transparent 87%, rgba(0,245,176,0.02) 87.5%),
                linear-gradient(60deg,  rgba(0,245,176,0.015) 25%, transparent 25.5%, transparent 75%, rgba(0,245,176,0.015) 75%)
              `,
              backgroundSize: '80px 140px',
              backgroundPosition: '0 0, 0 0, 40px 70px',
              animation: 'hex-drift 60s linear infinite',
              opacity: 1,
            }} />

            {/* Scanline sweep */}
            <div style={{
              position: 'absolute', left: 0, right: 0, height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(0,245,176,0.15), transparent)',
              animation: 'scanline-sweep 12s ease-in-out infinite',
            }} />

            {/* Aurora glow top */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '200px',
              background: 'linear-gradient(180deg, rgba(0,245,176,0.03) 0%, transparent 100%)',
              animation: 'cyber-pulse 4s ease-in-out infinite',
            }} />

            {/* Aurora glow bottom */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '150px',
              background: 'linear-gradient(0deg, rgba(0,245,176,0.03) 0%, transparent 100%)',
              animation: 'cyber-pulse 6s ease-in-out infinite',
            }} />
          </>
        )}
      </div>
    </>
  );
}
