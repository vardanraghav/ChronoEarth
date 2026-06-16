'use client';

import { useEffect, useRef } from 'react';

interface BackgroundEffectsProps {
  earthMode?: 'realistic' | 'cyber';
}

export default function BackgroundEffects({ earthMode = 'realistic' }: BackgroundEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isCyber = earthMode === 'cyber';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Responsive setting
    const isMobileDevice = width < 768;

    // Configs
    const nodeCount = 0; // Disable neural nodes entirely to move away from cyberpunk hacker style
    const maxDistance = 0;
    const starCount = isMobileDevice ? 24 : 120; // Faint, subtle starfield

    const startTime = Date.now();

    // Space Dust Setup
    interface Dust {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }
    const dustParticles: Dust[] = [];
    const dustCount = isMobileDevice ? 10 : 35; // Faint moving dust particles
    if (isCyber) {
      for (let i = 0; i < dustCount; i++) {
        dustParticles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.03, // Slow drift velocities
          vy: (Math.random() - 0.5) * 0.03,
          size: Math.random() * 1.5 + 0.4,
          opacity: Math.random() * 0.25,
        });
      }
    }

    // 1. Stars Setup
    interface Star {
      x: number;
      y: number;
      size: number;
      opacity: number;
      targetOpacity: number;
      speed: number;
      color: string;
    }
    const stars: Star[] = [];
    const starColors = ['#EAF7FF', '#6FEAFF', '#ffffff', '#8CA8B8']; // Icy white/blue premium star colors

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.2 + 0.2, // Smaller, subtle stars
        opacity: Math.random() * 0.5,
        targetOpacity: Math.random() * 0.4 + 0.05,
        speed: 0.003 + Math.random() * 0.008,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      });
    }

    // 2. Nebula Setup
    interface Nebula {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
    }
    const nebulae: Nebula[] = [
      {
        x: width * 0.25,
        y: height * 0.3,
        vx: 0.015,
        vy: -0.01,
        radius: Math.min(width, height) * 0.8,
        color: 'rgba(10, 30, 44, 0.45)', // Faint space-fog blue-gray
      },
      {
        x: width * 0.75,
        y: height * 0.7,
        vx: -0.01,
        vy: 0.01,
        radius: Math.min(width, height) * 0.9,
        color: 'rgba(18, 56, 78, 0.35)', // Accent blue-slate radial glow
      },
      {
        x: width * 0.45,
        y: height * 0.15,
        vx: 0.008,
        vy: 0.008,
        radius: Math.min(width, height) * 0.7,
        color: 'rgba(111, 234, 255, 0.012)', // Subtle highlight soft glow fog
      },
      {
        x: width * 0.8,
        y: height * 0.25,
        vx: -0.008,
        vy: -0.008,
        radius: Math.min(width, height) * 0.65,
        color: 'rgba(10, 30, 44, 0.3)',
      },
      {
        x: width * 0.6,
        y: height * 0.4,
        vx: 0.008,
        vy: -0.008,
        radius: Math.min(width, height) * 0.75,
        color: 'rgba(111, 234, 255, 0.01)',
      }
    ];

    // 3. Neural Nodes Setup
    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }
    const nodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 1.5 + 0.8,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    const draw = () => {
      // Clear Background
      ctx.fillStyle = '#02060B'; // New Base color
      ctx.fillRect(0, 0, width, height);

      // Draw Nebulae
      nebulae.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < -n.radius || n.x > width + n.radius) n.vx *= -1;
        if (n.y < -n.radius || n.y > height + n.radius) n.vy *= -1;

        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
        grad.addColorStop(0, n.color);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Stars
      const elapsedSeconds = (Date.now() - startTime) / 1000;
      stars.forEach((s, idx) => {
        s.opacity += (s.targetOpacity - s.opacity) * s.speed;
        if (Math.abs(s.opacity - s.targetOpacity) < 0.05) {
          s.targetOpacity = Math.random() * 0.4 + 0.05;
        }

        // Twinkling swell effect
        const starPhase = (elapsedSeconds * 0.5 + idx) % (Math.PI * 2);
        const isTwinkleStar = idx % 7 === 0;
        const twinkleFactor = isTwinkleStar ? (1.0 + 1.2 * Math.sin(starPhase)) : 1.0;
        const finalSize = Math.max(0.2, s.size * twinkleFactor);
        const finalOpacity = Math.min(0.8, s.opacity * (isTwinkleStar ? (0.7 + 0.3 * Math.sin(starPhase)) : 1.0));

        ctx.fillStyle = s.color;
        ctx.globalAlpha = finalOpacity;
        ctx.beginPath();
        ctx.arc(s.x, s.y, finalSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });



      // Draw Space Dust
      if (isCyber) {
        ctx.fillStyle = 'rgba(111, 234, 255, 0.15)'; // Soft blue-cyan particles
        dustParticles.forEach((d) => {
          d.x += d.vx;
          d.y += d.vy;

          if (d.x < 0) d.x = width;
          if (d.x > width) d.x = 0;
          if (d.y < 0) d.y = height;
          if (d.y > height) d.y = 0;

          ctx.beginPath();
          ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
          ctx.globalAlpha = d.opacity;
          ctx.fill();
        });
        ctx.globalAlpha = 1.0;
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [isCyber]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      
      {/* Fractal noise overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Glow Vignette */}
      {isCyber && (
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(10, 30, 44, 0.2) 75%, rgba(6, 18, 27, 0.7) 100%)',
            boxShadow: 'inset 0 0 100px rgba(111, 234, 255, 0.01)',
          }}
        />
      )}
    </div>
  );
}

