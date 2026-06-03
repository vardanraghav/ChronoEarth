'use client';

import { useEffect, useState } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  color: string;
}

// Real star color distribution — based on stellar spectral classes.
// Most stars visible from Earth appear white to blue-white.
// A small fraction are warm yellow-white or orange (like Arcturus, Vega etc).
const STAR_COLORS = [
  // Blue-white (O/B type) — very bright, common in deep-field views
  { color: '#ddeeff', weight: 12 },
  { color: '#eef2ff', weight: 15 },
  // Pure white (A type) — most visually prominent
  { color: '#f8f9ff', weight: 25 },
  { color: '#ffffff',  weight: 28 },
  // Warm white (F/G type — like our sun)
  { color: '#fff9ee', weight: 12 },
  { color: '#fff5e0', weight: 8  },
  // Very faint blue (distant hot stars)
  { color: '#c8d8ff', weight: 5  },
  // Occasional warm orange-yellow (K type — Arcturus-like)
  { color: '#ffd9a0', weight: 3  },
  // Rare red (M type giant)
  { color: '#ffb8a0', weight: 2  },
];

function pickStarColor(): string {
  const total = STAR_COLORS.reduce((s, c) => s + c.weight, 0);
  let rand = Math.random() * total;
  for (const entry of STAR_COLORS) {
    rand -= entry.weight;
    if (rand <= 0) return entry.color;
  }
  return '#ffffff';
}

export default function BackgroundEffects() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    // 180 stars gives a rich deep-field without feeling cluttered
    const count = 180;
    const generated: Star[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      // Natural size distribution — most stars are tiny points of light
      size: i % 40 === 0
        ? 2.5 + Math.random() * 1.5   // rare bright stars
        : i % 12 === 0
          ? 1.5 + Math.random() * 1.0  // occasional medium stars
          : 0.5 + Math.random() * 0.8, // most are pinpoints
      // Natural opacity — brighter stars are more opaque
      opacity: 0.25 + Math.random() * 0.65,
      duration: 3 + Math.random() * 6,
      delay: Math.random() * 8,
      color: pickStarColor(),
    }));
    setStars(generated);
  }, []);

  return (
    <>
      <style>{`
        @keyframes twinkle {
          0%, 100% {
            opacity: var(--star-opacity);
            transform: scale(1);
          }
          50% {
            opacity: calc(var(--star-opacity) * 0.3);
            transform: scale(0.6);
          }
        }
        @keyframes twinkle-bright {
          0%, 100% {
            opacity: var(--star-opacity);
            transform: scale(1);
            filter: brightness(1);
          }
          40% {
            opacity: calc(var(--star-opacity) * 0.5);
            transform: scale(0.7);
            filter: brightness(0.7);
          }
          60% {
            opacity: var(--star-opacity);
            transform: scale(1.15);
            filter: brightness(1.3);
          }
        }
      `}</style>

      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">

        {/* ── Deep space background ───────────────────────────────────────────── */}
        {/* Near-black with the tiniest hint of deep blue, like a real long-exposure */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 50% 50%,
                #07091a 0%,
                #050710 45%,
                #020308 100%
              )
            `,
          }}
        />

        {/* ── Star field ──────────────────────────────────────────────────────── */}
        {stars.map((star) => {
          const isBright = star.size > 2.0;
          const isMedium = star.size > 1.5;
          return (
            <div
              key={star.id}
              className="absolute rounded-full"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width:  `${star.size}px`,
                height: `${star.size}px`,
                background: star.color,
                // Natural diffraction glow only on brighter stars
                boxShadow: isBright
                  ? `0 0 ${star.size * 3}px ${star.size * 1.5}px ${star.color}40, 0 0 ${star.size}px ${star.color}80`
                  : isMedium
                    ? `0 0 ${star.size * 2}px ${star.color}30`
                    : 'none',
                ['--star-opacity' as string]: star.opacity,
                opacity: star.opacity,
                animation: isBright
                  ? `twinkle-bright ${star.duration}s ease-in-out infinite`
                  : `twinkle ${star.duration}s ease-in-out infinite`,
                animationDelay: `${star.delay}s`,
              }}
            />
          );
        })}

        {/* ── Deep vignette ───────────────────────────────────────────────────── */}
        {/* Darkens the extreme corners so the Earth globe feels centered and lit */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 50% 50%,
                transparent 35%,
                rgba(2, 3, 8, 0.35) 70%,
                rgba(2, 3, 8, 0.75) 100%
              )
            `,
          }}
        />

        {/* ── Subtle space nebula glow ─────────────────────────────────────────── */}
        {/* An extremely faint large-radius glow near center — like a galaxy arm.
            Barely visible but adds depth to the dark background. */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width:  '900px',
            height: '900px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(30, 50, 120, 0.06) 0%, rgba(10, 20, 60, 0.03) 50%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

      </div>
    </>
  );
}
