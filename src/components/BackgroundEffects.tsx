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
    const nodeCount = isMobileDevice ? 12 : 60; // 80% reduction from 60
    const maxDistance = isMobileDevice ? 70 : 120;
    const starCount = isMobileDevice ? 36 : 180; // increased star count for better space density

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
    const dustCount = isMobileDevice ? 15 : 60; // increased space dust particles
    if (isCyber) {
      for (let i = 0; i < dustCount; i++) {
        dustParticles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.06,
          vy: (Math.random() - 0.5) * 0.06,
          size: Math.random() * 2.2 + 0.6,
          opacity: Math.random() * 0.35,
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
    const starColors = isCyber 
      ? ['#00F5B0', '#00D98F', '#ffffff', '#8df3cf'] 
      : ['#ddeeff', '#eef2ff', '#ffffff', '#fff9ee'];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.4,
        opacity: Math.random(),
        targetOpacity: Math.random() * 0.6 + 0.1,
        speed: 0.005 + Math.random() * 0.015,
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
        vx: 0.05,
        vy: -0.03,
        radius: Math.min(width, height) * 0.8,
        color: isCyber ? 'rgba(0, 245, 176, 0.028)' : 'rgba(30, 50, 120, 0.06)',
      },
      {
        x: width * 0.75,
        y: height * 0.7,
        vx: -0.04,
        vy: 0.04,
        radius: Math.min(width, height) * 0.9,
        color: isCyber ? 'rgba(148, 0, 211, 0.022)' : 'rgba(10, 20, 60, 0.05)',
      },
      {
        x: width * 0.45,
        y: height * 0.15,
        vx: 0.02,
        vy: 0.03,
        radius: Math.min(width, height) * 0.7,
        color: isCyber ? 'rgba(0, 217, 143, 0.018)' : 'rgba(80, 20, 100, 0.035)',
      },
      {
        x: width * 0.8,
        y: height * 0.25,
        vx: -0.03,
        vy: -0.02,
        radius: Math.min(width, height) * 0.65,
        color: isCyber ? 'rgba(75, 0, 130, 0.015)' : 'rgba(25, 45, 95, 0.04)',
      },
      {
        x: width * 0.6,
        y: height * 0.4,
        vx: 0.03,
        vy: -0.03,
        radius: Math.min(width, height) * 0.75,
        color: isCyber ? 'rgba(0, 229, 255, 0.018)' : 'rgba(20, 80, 180, 0.03)',
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
      ctx.fillStyle = isCyber ? '#02060A' : '#050710';
      ctx.fillRect(0, 0, width, height);

      // Draw Grid overlay
      if (isCyber) {
        ctx.strokeStyle = 'rgba(0, 245, 176, 0.005)';
        ctx.lineWidth = 1;
        const gridStep = 75;
        for (let x = 0; x < width; x += gridStep) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridStep) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }

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
          s.targetOpacity = Math.random() * 0.6 + 0.1;
        }

        // Twinkling swell effect
        const starPhase = (elapsedSeconds * 0.5 + idx) % (Math.PI * 2);
        const isTwinkleStar = idx % 7 === 0;
        const twinkleFactor = isTwinkleStar ? (1.0 + 1.2 * Math.sin(starPhase)) : 1.0;
        const finalSize = Math.max(0.2, s.size * twinkleFactor);
        const finalOpacity = Math.min(1.0, s.opacity * (isTwinkleStar ? (0.7 + 0.3 * Math.sin(starPhase)) : 1.0));

        ctx.fillStyle = s.color;
        ctx.globalAlpha = finalOpacity;
        ctx.beginPath();
        ctx.arc(s.x, s.y, finalSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // Draw Central Behind-Globe Nebula Flare
      if (isCyber) {
        const centerX = width * 0.38;
        const centerY = height * 0.52;
        const radius = Math.min(width, height) * 0.45;
        const breathe = 1.0 + 0.05 * Math.sin(elapsedSeconds * 0.5);

        const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * breathe);
        grad.addColorStop(0, 'rgba(0, 245, 176, 0.055)');
        grad.addColorStop(0.5, 'rgba(148, 0, 211, 0.03)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * breathe, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Space Dust
      if (isCyber) {
        ctx.fillStyle = 'rgba(0, 245, 176, 0.25)';
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

      // Draw Neural connections
      if (isCyber) {
        ctx.lineWidth = 0.8;
        for (let i = 0; i < nodes.length; i++) {
          const n1 = nodes[i];
          for (let j = i + 1; j < nodes.length; j++) {
            const n2 = nodes[j];
            const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
            if (dist < maxDistance) {
              const alpha = (1 - dist / maxDistance) * 0.05;
              ctx.strokeStyle = `rgba(0, 245, 176, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(n1.x, n1.y);
              ctx.lineTo(n2.x, n2.y);
              ctx.stroke();
            }
          }
        }

        ctx.fillStyle = 'rgba(0, 245, 176, 0.2)';
        nodes.forEach((n) => {
          n.x += n.vx;
          n.y += n.vy;

          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;

          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
          ctx.fill();
        });
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
            background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(2, 6, 10, 0.3) 75%, rgba(0, 0, 0, 0.8) 100%)',
            boxShadow: 'inset 0 0 100px rgba(0, 245, 176, 0.02)',
          }}
        />
      )}
    </div>
  );
}
