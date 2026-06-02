'use client';

import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

interface EarthPlaceholderProps {
  activeYear: number;
  activeCategory: string;
}

const categoryThemes: Record<
  string,
  { primary: string; secondary: string; glow: string; particleColor: string }
> = {
  'Ocean Monitoring': {
    primary: '#00f0ff',
    secondary: '#14b8a6',
    glow: 'rgba(0, 240, 255, 0.15)',
    particleColor: '#00f0ff',
  },
  'Biodiversity': {
    primary: '#10b981',
    secondary: '#34d399',
    glow: 'rgba(16, 185, 129, 0.15)',
    particleColor: '#10b981',
  },
  'Clean Energy': {
    primary: '#8b5cf6',
    secondary: '#f97316',
    glow: 'rgba(139, 92, 246, 0.15)',
    particleColor: '#8b5cf6',
  },
  'Satellite Network': {
    primary: '#3b82f6',
    secondary: '#00f0ff',
    glow: 'rgba(59, 130, 246, 0.15)',
    particleColor: '#3b82f6',
  },
};

export default function EarthPlaceholder({ activeYear, activeCategory }: EarthPlaceholderProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const theme = categoryThemes[activeCategory] || categoryThemes['Ocean Monitoring'];

  useEffect(() => {
    const generated: Particle[] = Array.from({ length: 10 }, (_, i) => {
      const angle = (i / 10) * Math.PI * 2;
      const radius = 220 + Math.random() * 60;
      return {
        id: i,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        size: 1.5 + Math.random() * 2.5,
        duration: 4 + Math.random() * 4,
        delay: Math.random() * 3,
      };
    });
    setParticles(generated);
  }, []);

  // Calculate speeds based on the active year (unstable years spin faster, stable 2050 spins slower)
  const speedFactor = (2050 - activeYear) / 25; // Ranges from 0 (at 2050) to 1 (at 2025)
  const rotSpeedCwSlow = 60 - speedFactor * 40;  // 60s at 2050, 20s at 2025
  const rotSpeedCcw = 45 - speedFactor * 30;     // 45s at 2050, 15s at 2025
  const rotSpeedCwFast = 30 - speedFactor * 20;    // 30s at 2050, 10s at 2025

  return (
    <>
      <style>{`
        @keyframes ring-rotate-cw-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes ring-rotate-ccw {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(-360deg); }
        }
        @keyframes earth-pulse {
          0%, 100% {
            box-shadow: 0 0 60px 15px ${theme.primary}26,
                        0 0 120px 40px ${theme.primary}0f,
                        inset 0 0 60px 10px ${theme.primary}14;
          }
          50% {
            box-shadow: 0 0 80px 25px ${theme.primary}40,
                        0 0 160px 60px ${theme.primary}1a,
                        inset 0 0 80px 20px ${theme.primary}1f;
          }
        }
        @keyframes particle-float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.6;
          }
          25% {
            transform: translate(8px, -12px) scale(1.3);
            opacity: 1;
          }
          50% {
            transform: translate(-4px, -20px) scale(0.8);
            opacity: 0.4;
          }
          75% {
            transform: translate(12px, -8px) scale(1.1);
            opacity: 0.8;
          }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes text-glow-pulse {
          0%, 100% { text-shadow: 0 0 8px ${theme.primary}40; }
          50%      { text-shadow: 0 0 16px ${theme.primary}80, 0 0 32px ${theme.primary}30; }
        }
      `}</style>

      <div
        className="relative flex flex-col items-center justify-center"
        style={{ animation: 'fade-in-up 1.2s ease-out both' }}
      >
        {/* Container */}
        <div
          className="relative w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] md:w-[460px] md:h-[460px] lg:w-[500px] lg:h-[500px]"
        >
          {/* Outer Ring */}
          <div
            className="absolute top-1/2 left-1/2 w-full h-full rounded-full"
            style={{
              border: `1px solid ${theme.primary}33`,
              animation: `ring-rotate-cw-slow ${rotSpeedCwSlow}s linear infinite`,
              boxShadow: `0 0 20px ${theme.primary}0d`,
            }}
          >
            {/* Orbital marker */}
            <div
              className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
              style={{
                background: theme.primary,
                boxShadow: `0 0 8px ${theme.primary}, 0 0 16px ${theme.primary}80`,
              }}
            />
          </div>

          {/* Middle Ring */}
          <div
            className="absolute top-1/2 left-1/2 rounded-full"
            style={{
              width: '82%',
              height: '82%',
              border: `1px dashed ${theme.primary}1f`,
              animation: `ring-rotate-ccw ${rotSpeedCcw}s linear infinite`,
            }}
          >
            <div
              className="absolute top-1/2 -right-1 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
              style={{
                background: theme.secondary,
                boxShadow: `0 0 6px ${theme.secondary}, 0 0 12px ${theme.secondary}80`,
              }}
            />
          </div>

          {/* Inner Ring */}
          <div
            className="absolute top-1/2 left-1/2 rounded-full"
            style={{
              width: '64%',
              height: '64%',
              border: `1px solid ${theme.secondary}40`,
              animation: `ring-rotate-cw-slow ${rotSpeedCwFast}s linear infinite`,
              boxShadow: `0 0 15px ${theme.secondary}14`,
            }}
          >
            <div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
              style={{
                background: theme.primary,
                boxShadow: `0 0 6px ${theme.primary}`,
              }}
            />
          </div>

          {/* Earth Sphere */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: '42%',
              height: '42%',
              background: `
                radial-gradient(circle at 35% 35%,
                  ${theme.primary}14 0%,
                  rgba(6, 9, 24, 0.95) 40%,
                  rgba(6, 9, 24, 1) 60%,
                  ${theme.primary}0a 80%,
                  ${theme.primary}26 100%
                )
              `,
              animation: 'earth-pulse 4s ease-in-out infinite',
            }}
          >
            {/* Surface detail overlay */}
            <div
              className="absolute inset-0 rounded-full opacity-30"
              style={{
                background: `
                  radial-gradient(ellipse at 30% 40%, ${theme.secondary}4d 0%, transparent 50%),
                  radial-gradient(ellipse at 60% 60%, ${theme.primary}26 0%, transparent 40%),
                  radial-gradient(ellipse at 70% 30%, ${theme.secondary}26 0%, transparent 35%)
                `,
              }}
            />
            {/* Highlight arc */}
            <div
              className="absolute inset-1 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)',
              }}
            />
          </div>

          {/* Floating Particles */}
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full"
              style={{
                top: '50%',
                left: '50%',
                width: p.size,
                height: p.size,
                marginTop: p.y,
                marginLeft: p.x,
                background: p.id % 3 === 0 ? theme.secondary : theme.primary,
                boxShadow: `0 0 ${p.size * 3}px ${p.id % 3 === 0 ? theme.secondary + '80' : theme.primary + '80'}`,
                animation: `particle-float ${p.duration}s ease-in-out infinite`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Dynamic Telemetry Label */}
        <div
          className="mt-6 text-center select-none"
          style={{ animation: 'fade-in-up 1.5s ease-out 0.5s both' }}
        >
          <p
            className="text-[10px] font-light uppercase"
            style={{
              letterSpacing: '0.4em',
              color: `${theme.primary}bf`,
              animation: 'text-glow-pulse 3s ease-in-out infinite',
            }}
          >
            PLANETARY DIGITAL TWIN // {activeYear}
          </p>
        </div>
      </div>
    </>
  );
}
