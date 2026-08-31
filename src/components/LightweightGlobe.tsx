'use client';

import React, { useRef, useEffect } from 'react';

export default function LightweightGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 3D coordinates for major ChronoEarth cities (latitude, longitude in radians)
  const cities = [
    { name: 'New York', lat: 0.71, lon: -1.29 },
    { name: 'London', lat: 0.90, lon: -0.003 },
    { name: 'Tokyo', lat: 0.62, lon: 2.44 },
    { name: 'New Delhi', lat: 0.50, lon: 1.35 },
    { name: 'Sydney', lat: -0.59, lon: 2.63 },
    { name: 'São Paulo', lat: -0.41, lon: -0.81 },
    { name: 'Nairobi', lat: -0.02, lon: 0.64 },
    { name: 'Cairo', lat: 0.52, lon: 0.54 },
    { name: 'Reykjavik', lat: 1.12, lon: -0.38 },
  ];

  // Geodesic transport paths between major nodes
  const paths = [
    { from: 0, to: 1 }, // NY - London
    { from: 1, to: 7 }, // London - Cairo
    { from: 7, to: 3 }, // Cairo - Delhi
    { from: 3, to: 2 }, // Delhi - Tokyo
    { from: 2, to: 4 }, // Tokyo - Sydney
    { from: 5, to: 0 }, // Sao Paulo - NY
    { from: 6, to: 7 }, // Nairobi - Cairo
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle screen responsiveness
    const resizeCanvas = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      canvas.width = (rect?.width || window.innerWidth) * dpr;
      canvas.height = (rect?.height || window.innerHeight) * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initial parameters
    let rotationAngle = 0;
    let lastTime = performance.now();

    // Check system preference for reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = motionQuery.matches;
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    motionQuery.addEventListener('change', handleMotionChange);

    // Dynamic rotation speed
    const rotationSpeed = 0.04; // Radians per second

    const draw = (timestamp: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      const width = rect?.width || window.innerWidth;
      const height = rect?.height || window.innerHeight;

      // Adjust canvas coordinates if resized
      if (canvas.width !== (width * (window.devicePixelRatio || 1)) || canvas.height !== (height * (window.devicePixelRatio || 1))) {
        resizeCanvas();
      }

      const dt = (timestamp - lastTime) / 1000;
      lastTime = timestamp;

      // Only increment rotation if motion is not reduced
      if (!prefersReducedMotion) {
        rotationAngle += rotationSpeed * dt;
      }

      // Clear with very dark slate space background color
      ctx.fillStyle = '#02060A';
      ctx.fillRect(0, 0, width, height);

      // Globe dimensions
      const minDim = Math.min(width, height);
      const radius = minDim * 0.35;
      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Draw glowing space back-halo
      const haloGrad = ctx.createRadialGradient(centerX, centerY, radius * 0.8, centerX, centerY, radius * 1.3);
      haloGrad.addColorStop(0, 'rgba(0, 229, 255, 0.03)');
      haloGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw static coordinate grids (outer radar rings)
      ctx.strokeStyle = 'rgba(0, 245, 176, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.08, 0, Math.PI * 2);
      ctx.stroke();

      // Draw faint scanner sweeps
      const sweepAngle = (timestamp * 0.0003) % (Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 245, 176, 0.08)';
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(sweepAngle) * radius * 1.08, centerY + Math.sin(sweepAngle) * radius * 1.08);
      ctx.stroke();

      // 3. Draw Globe Boundary Sphere Outline
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Project spherical coordinates (lat, lon) to 2D screen space
      const project = (lat: number, lon: number) => {
        const theta = lon + rotationAngle;
        const x = radius * Math.cos(lat) * Math.sin(theta);
        const y = radius * Math.sin(lat);
        const z = radius * Math.cos(lat) * Math.cos(theta); // depth check
        return { x: centerX + x, y: centerY - y, z, visible: z > 0 };
      };

      // 4. Draw Latitude Grid Rings
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.06)';
      ctx.lineWidth = 0.8;
      const latIntervals = [-Math.PI / 4, -Math.PI / 8, 0, Math.PI / 8, Math.PI / 4];
      latIntervals.forEach(lat => {
        ctx.beginPath();
        const step = Math.PI / 18;
        let first = true;
        // Draw the front-facing half of the ring
        for (let th = -Math.PI / 2; th <= Math.PI / 2; th += step) {
          const pt = project(lat, th - rotationAngle);
          if (first) {
            ctx.moveTo(pt.x, pt.y);
            first = false;
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
        ctx.stroke();
      });

      // 5. Draw Longitude Grid Rings
      const lonIntervals = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4];
      lonIntervals.forEach(lon => {
        ctx.beginPath();
        const step = Math.PI / 18;
        let first = true;
        // Draw facing meridian lines
        for (let lt = -Math.PI / 2; lt <= Math.PI / 2; lt += step) {
          const pt = project(lt, lon);
          if (pt.visible) {
            if (first) {
              ctx.moveTo(pt.x, pt.y);
              first = false;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          }
        }
        ctx.stroke();
      });

      // Project cities
      const projectedCities = cities.map(c => project(c.lat, c.lon));

      // 6. Draw Geodesic Paths (Transport Routes)
      ctx.lineWidth = 0.8;
      paths.forEach(path => {
        const fromPt = projectedCities[path.from];
        const toPt = projectedCities[path.to];

        // Draw line if both endpoints are front-facing/visible
        if (fromPt.visible && toPt.visible) {
          ctx.strokeStyle = 'rgba(0, 245, 176, 0.18)';
          ctx.beginPath();
          ctx.moveTo(fromPt.x, fromPt.y);
          
          // Draw curved bezier line to simulate earth curvature
          const midX = (fromPt.x + toPt.x) / 2;
          const midY = (fromPt.y + toPt.y) / 2;
          const dist = Math.hypot(toPt.x - fromPt.x, toPt.y - fromPt.y);
          
          // Pull control point away from center slightly
          const dx = midX - centerX;
          const dy = midY - centerY;
          const pull = 0.15;
          ctx.quadraticCurveTo(midX + dx * pull, midY + dy * pull, toPt.x, toPt.y);
          ctx.stroke();
        }
      });

      // 7. Draw City Nodes and Labels
      cities.forEach((c, idx) => {
        const pt = projectedCities[idx];
        if (pt.visible) {
          // Pulse value
          const pulse = 0.8 + 0.2 * Math.sin(timestamp * 0.003 + idx);

          // Draw node point
          ctx.fillStyle = '#00F5B0';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2.5 * pulse, 0, Math.PI * 2);
          ctx.fill();

          // Small neon ring
          ctx.strokeStyle = 'rgba(0, 245, 176, 0.4)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 5 * pulse, 0, Math.PI * 2);
          ctx.stroke();

          // Text labels for a premium look
          ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
          ctx.font = '8px monospace';
          ctx.fillText(c.name.toUpperCase(), pt.x + 8, pt.y + 3);
        }
      });

      // Faint orbital satellites
      const satCount = 2;
      for (let s = 0; s < satCount; s++) {
        const satAngle = rotationAngle * 1.5 + (s * Math.PI);
        const satRadiusX = radius * 1.15;
        const satRadiusY = radius * 0.3;
        const satX = centerX + Math.cos(satAngle) * satRadiusX;
        const satY = centerY + Math.sin(satAngle) * satRadiusY;
        const satZ = Math.sin(satAngle);

        if (satZ > 0) {
          ctx.fillStyle = '#00E5FF';
          ctx.beginPath();
          ctx.arc(satX, satY, 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.arc(satX, satY, 4, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    // Monitor document visibility to pause animation frame loop when hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      } else {
        if (!animationFrameRef.current) {
          lastTime = performance.now();
          animationFrameRef.current = requestAnimationFrame(draw);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      motionQuery.removeEventListener('change', handleMotionChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full overflow-hidden" 
      style={{ background: '#02060A' }}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block"
      />
    </div>
  );
}
