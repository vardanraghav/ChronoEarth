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
}

export default function BackgroundEffects() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const count = 70;
    const generated: Star[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.5 + Math.random() * 2,
      opacity: 0.2 + Math.random() * 0.6,
      duration: 2 + Math.random() * 5,
      delay: Math.random() * 5,
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
            opacity: 0.05;
            transform: scale(0.5);
          }
        }
        @keyframes aurora-wave {
          0% {
            transform: translateX(-30%) scaleY(1);
            opacity: 0.3;
          }
          50% {
            transform: translateX(10%) scaleY(1.2);
            opacity: 0.5;
          }
          100% {
            transform: translateX(-30%) scaleY(1);
            opacity: 0.3;
          }
        }
        @keyframes aurora-wave-2 {
          0% {
            transform: translateX(20%) scaleY(1.1);
            opacity: 0.2;
          }
          50% {
            transform: translateX(-20%) scaleY(0.8);
            opacity: 0.4;
          }
          100% {
            transform: translateX(20%) scaleY(1.1);
            opacity: 0.2;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Base gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 50% 50%,
                rgba(6, 15, 40, 1) 0%,
                rgba(6, 9, 24, 1) 50%,
                rgba(3, 4, 12, 1) 100%
              )
            `,
          }}
        />

        {/* Hex grid pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(30deg, rgba(0, 240, 255, 0.02) 12%, transparent 12.5%, transparent 87%, rgba(0, 240, 255, 0.02) 87.5%, rgba(0, 240, 255, 0.02)),
              linear-gradient(150deg, rgba(0, 240, 255, 0.02) 12%, transparent 12.5%, transparent 87%, rgba(0, 240, 255, 0.02) 87.5%, rgba(0, 240, 255, 0.02)),
              linear-gradient(30deg, rgba(0, 240, 255, 0.02) 12%, transparent 12.5%, transparent 87%, rgba(0, 240, 255, 0.02) 87.5%, rgba(0, 240, 255, 0.02)),
              linear-gradient(150deg, rgba(0, 240, 255, 0.02) 12%, transparent 12.5%, transparent 87%, rgba(0, 240, 255, 0.02) 87.5%, rgba(0, 240, 255, 0.02)),
              linear-gradient(60deg, rgba(0, 240, 255, 0.015) 25%, transparent 25.5%, transparent 75%, rgba(0, 240, 255, 0.015) 75%, rgba(0, 240, 255, 0.015)),
              linear-gradient(60deg, rgba(0, 240, 255, 0.015) 25%, transparent 25.5%, transparent 75%, rgba(0, 240, 255, 0.015) 75%, rgba(0, 240, 255, 0.015))
            `,
            backgroundSize: '80px 140px',
            backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px',
          }}
        />

        {/* Aurora Wave 1 */}
        <div
          className="absolute -top-10 left-0 right-0 h-[200px]"
          style={{
            background: `
              linear-gradient(180deg,
                rgba(0, 240, 255, 0.06) 0%,
                rgba(139, 92, 246, 0.03) 40%,
                transparent 100%
              )
            `,
            filter: 'blur(40px)',
            animation: 'aurora-wave 15s ease-in-out infinite',
          }}
        />

        {/* Aurora Wave 2 */}
        <div
          className="absolute -top-10 left-0 right-0 h-[160px]"
          style={{
            background: `
              linear-gradient(180deg,
                rgba(139, 92, 246, 0.04) 0%,
                rgba(20, 184, 166, 0.02) 50%,
                transparent 100%
              )
            `,
            filter: 'blur(50px)',
            animation: 'aurora-wave-2 20s ease-in-out infinite',
          }}
        />

        {/* Vignette overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 50% 50%,
                transparent 30%,
                rgba(3, 4, 12, 0.4) 70%,
                rgba(3, 4, 12, 0.8) 100%
              )
            `,
          }}
        />

        {/* Star field */}
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              background: star.id % 7 === 0
                ? 'rgba(139, 92, 246, 0.8)'
                : star.id % 5 === 0
                  ? 'rgba(0, 240, 255, 0.6)'
                  : 'rgba(255, 255, 255, 0.8)',
              boxShadow: star.size > 1.5
                ? `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.3)`
                : 'none',
              ['--star-opacity' as string]: star.opacity,
              opacity: star.opacity,
              animation: `twinkle ${star.duration}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}

        {/* Subtle center glow for earth area */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0, 240, 255, 0.02) 0%, transparent 70%)',
          }}
        />
      </div>
    </>
  );
}
