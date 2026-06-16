'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════
   CHRONOEARTH CINEMATIC INTRO v2
   Premium opening — NASA documentary × Apple product film
   Canvas starfield + Earth horizon + cinematic camera drift
   ═══════════════════════════════════════════════════════════ */

// ── Loading messages that cycle sequentially ──
const LOADING_MESSAGES = [
  'Initializing Planetary Intelligence...',
  'Loading Climate Systems...',
  'Loading Technology Networks...',
  'Loading Future Scenarios...',
  'Loading Global Intelligence...',
];

// ── Taglines that transition sequentially ──
const TAGLINES = [
  'Make the Future Visible.',
  'Explore where the world is going.',
];

interface IntroCinematicProps {
  onComplete: () => void;
  forcePlay?: boolean;
}

export default function IntroCinematic({ onComplete, forcePlay = false }: IntroCinematicProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);

  // Phase machine: stars → brand → tagline1 → tagline2 → loading → exit
  const [phase, setPhase] = useState<
    'stars' | 'brand' | 'tagline1' | 'tagline2' | 'loading' | 'exit'
  >('stars');
  const [visible, setVisible] = useState(true);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // ── Check localStorage ──
  useEffect(() => {
    if (!forcePlay && typeof window !== 'undefined') {
      const seen = localStorage.getItem('chronoearth_intro_seen');
      if (seen === 'true') {
        setVisible(false);
        onComplete();
        return;
      }
    }
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
    }
  }, [forcePlay, onComplete]);

  // ── Phase timeline (total ~4.2s) ──
  useEffect(() => {
    if (!visible) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    // 0ms       → stars settle
    // 500ms     → brand appears (CHRONOEARTH + subtitle)
    timers.push(setTimeout(() => setPhase('brand'), 500));
    // 1400ms    → first tagline: "Make the Future Visible."
    timers.push(setTimeout(() => setPhase('tagline1'), 1400));
    // 2200ms    → second tagline: "Explore where the world is going."
    timers.push(setTimeout(() => setPhase('tagline2'), 2200));
    // 2800ms    → loading sequence begins
    timers.push(setTimeout(() => setPhase('loading'), 2800));
    // 3700ms    → exit fade
    timers.push(setTimeout(() => setPhase('exit'), 3700));
    // 4300ms    → complete
    timers.push(setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('chronoearth_intro_seen', 'true');
      }
      setVisible(false);
      onComplete();
    }, 4300));

    return () => timers.forEach(clearTimeout);
  }, [visible, onComplete]);

  // ── Cycle loading messages ──
  useEffect(() => {
    if (phase !== 'loading' && phase !== 'exit') return;

    let idx = 0;
    setLoadingMsgIndex(0);
    const interval = setInterval(() => {
      idx++;
      if (idx < LOADING_MESSAGES.length) {
        setLoadingMsgIndex(idx);
      } else {
        clearInterval(interval);
      }
    }, 180);

    return () => clearInterval(interval);
  }, [phase]);

  // ── Canvas: starfield + nebulae + Earth + camera drift ──
  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = window.innerWidth;
    let h = window.innerHeight;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const mobile = w < 768;

    // ── Stars — dense realistic field ──
    interface Star {
      x: number; y: number; z: number;
      size: number; color: string;
      twinkleSpeed: number; twinkleOffset: number;
    }
    const starCount = mobile ? 180 : Math.min(500, Math.floor(w * h / 3500));
    const starColors = ['#ffffff', '#ffffff', '#EAF7FF', '#EAF7FF', '#d4e5ff', '#6FEAFF', '#a8ceff', '#f0f4ff'];
    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random(),
        size: Math.random() * 2.0 + 0.2,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        twinkleSpeed: 0.6 + Math.random() * 3.0,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }

    // ── Shooting stars ──
    interface Meteor {
      x: number; y: number; vx: number; vy: number;
      length: number; life: number; maxLife: number; opacity: number;
    }
    const meteors: Meteor[] = [];
    const spawnMeteor = () => {
      if (meteors.length >= 2) return;
      const dir = Math.random() > 0.5 ? 1 : -1;
      meteors.push({
        x: Math.random() * w * 0.7 + w * 0.15,
        y: Math.random() * h * 0.35,
        vx: (2.5 + Math.random() * 2.5) * dir,
        vy: 1.2 + Math.random() * 1.8,
        length: 70 + Math.random() * 100,
        life: 0,
        maxLife: 45 + Math.random() * 35,
        opacity: 0.5 + Math.random() * 0.5,
      });
    };
    const meteorTimers = [
      setTimeout(spawnMeteor, 600),
      setTimeout(spawnMeteor, 2000),
      setTimeout(spawnMeteor, 3200),
    ];

    // ── Camera state — very subtle slow drift ──
    let camX = 0;
    let camY = 0;
    const camSpeedX = mobile ? 0.8 : 1.5; // pixels per second
    const camSpeedY = mobile ? 0.3 : 0.6;

    const startTime = performance.now();

    const draw = (now: number) => {
      const elapsed = (now - startTime) / 1000;

      // Camera drift (slow, cinematic)
      camX = Math.sin(elapsed * 0.15) * camSpeedX * elapsed;
      camY = Math.cos(elapsed * 0.1) * camSpeedY * elapsed * 0.5;

      // ── Background gradient ──
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#010306');
      bgGrad.addColorStop(0.25, '#02060B');
      bgGrad.addColorStop(0.5, '#040B12');
      bgGrad.addColorStop(0.75, '#07111A');
      bgGrad.addColorStop(1, '#07111A');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Nebula fog layers ──
      const nebulae = [
        { cx: w * 0.2 + camX * 0.3, cy: h * 0.2 + camY * 0.2, r: w * 0.65, c: 'rgba(18, 56, 78, 0.14)' },
        { cx: w * 0.75 - camX * 0.2, cy: h * 0.55 - camY * 0.15, r: w * 0.55, c: 'rgba(12, 40, 60, 0.1)' },
        { cx: w * 0.5 + camX * 0.1, cy: h * 0.75 + camY * 0.1, r: w * 0.8, c: 'rgba(0, 229, 255, 0.012)' },
        { cx: w * 0.85, cy: h * 0.15, r: w * 0.4, c: 'rgba(111, 234, 255, 0.018)' },
        { cx: w * 0.35, cy: h * 0.65, r: w * 0.5, c: 'rgba(10, 30, 50, 0.12)' },
      ];
      nebulae.forEach(n => {
        const grad = ctx.createRadialGradient(n.cx, n.cy, 0, n.cx, n.cy, n.r);
        grad.addColorStop(0, n.c);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.cx, n.cy, n.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Stars with parallax camera movement ──
      const baseDrift = elapsed * 0.25;
      stars.forEach((s, idx) => {
        const parallax = 0.3 + s.z * 0.7;
        // Apply camera drift + slow orbital drift
        let sx = s.x - baseDrift * parallax * 6 + camX * parallax * 0.5;
        let sy = s.y + camY * parallax * 0.3;
        // Wrap
        sx = ((sx % w) + w) % w;
        sy = ((sy % h) + h) % h;

        const twinkle = 0.25 + 0.75 * ((Math.sin(elapsed * s.twinkleSpeed + s.twinkleOffset) + 1) / 2);
        const depthAlpha = 0.2 + s.z * 0.8;
        const finalAlpha = twinkle * depthAlpha;
        const finalSize = s.size * (0.4 + s.z * 0.6);

        ctx.globalAlpha = finalAlpha;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(sx, sy, finalSize, 0, Math.PI * 2);
        ctx.fill();

        // Cross-flare on bright foreground stars
        if (s.size > 1.4 && s.z > 0.75) {
          ctx.globalAlpha = finalAlpha * 0.25;
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 0.4;
          const fLen = s.size * 4;
          ctx.beginPath();
          ctx.moveTo(sx - fLen, sy); ctx.lineTo(sx + fLen, sy);
          ctx.moveTo(sx, sy - fLen); ctx.lineTo(sx, sy + fLen);
          ctx.stroke();

          // Soft glow halo
          if (s.z > 0.9) {
            ctx.globalAlpha = finalAlpha * 0.08;
            const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.size * 6);
            halo.addColorStop(0, s.color);
            halo.addColorStop(1, 'transparent');
            ctx.fillStyle = halo;
            ctx.beginPath();
            ctx.arc(sx, sy, s.size * 6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });
      ctx.globalAlpha = 1;

      // ── Shooting stars ──
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx; m.y += m.vy; m.life++;

        const lifeRatio = m.life / m.maxLife;
        const alpha = m.opacity * (
          lifeRatio < 0.15 ? lifeRatio / 0.15 :
          lifeRatio > 0.65 ? (1 - lifeRatio) / 0.35 : 1
        );

        const angle = Math.atan2(m.vy, m.vx);
        const tailX = m.x - Math.cos(angle) * m.length;
        const tailY = m.y - Math.sin(angle) * m.length;

        const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.6, `rgba(111, 234, 255, ${alpha * 0.3})`);
        grad.addColorStop(0.9, `rgba(200, 240, 255, ${alpha * 0.7})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${alpha})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY); ctx.lineTo(m.x, m.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Head glow
        const headGlow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 5);
        headGlow.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        headGlow.addColorStop(0.5, `rgba(111, 234, 255, ${alpha * 0.3})`);
        headGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = headGlow;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 5, 0, Math.PI * 2);
        ctx.fill();

        if (m.life >= m.maxLife) meteors.splice(i, 1);
      }

      // ── Earth (enormous, bottom of screen) ──
      const earthRadius = w * 2.2;
      const earthCenterX = w / 2 + camX * 0.15;
      const earthCenterY = h * 0.92 + earthRadius - h * 0.08 + camY * 0.1;

      // Outer atmospheric glow (multiple layers for realism)
      const atmoLayers = [
        { offset: 120, color: 'rgba(0, 120, 200, 0.006)' },
        { offset: 80,  color: 'rgba(0, 180, 255, 0.01)' },
        { offset: 55,  color: 'rgba(0, 229, 255, 0.018)' },
        { offset: 35,  color: 'rgba(80, 200, 255, 0.03)' },
        { offset: 20,  color: 'rgba(111, 234, 255, 0.045)' },
        { offset: 8,   color: 'rgba(150, 240, 255, 0.065)' },
        { offset: 2,   color: 'rgba(200, 250, 255, 0.09)' },
      ];

      atmoLayers.forEach(layer => {
        const r = earthRadius + layer.offset;
        const grad = ctx.createRadialGradient(
          earthCenterX, earthCenterY, earthRadius - 30,
          earthCenterX, earthCenterY, r
        );
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.8, layer.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(earthCenterX, earthCenterY, r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Earth body
      const earthGrad = ctx.createRadialGradient(
        earthCenterX, earthCenterY, earthRadius * 0.75,
        earthCenterX, earthCenterY, earthRadius
      );
      earthGrad.addColorStop(0, '#010408');
      earthGrad.addColorStop(0.5, '#02060B');
      earthGrad.addColorStop(0.75, '#040B12');
      earthGrad.addColorStop(0.9, '#07111A');
      earthGrad.addColorStop(1, '#07111A');
      ctx.fillStyle = earthGrad;
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthRadius, 0, Math.PI * 2);
      ctx.fill();

      // Rim light (bright atmospheric edge)
      const rimGrad = ctx.createRadialGradient(
        earthCenterX, earthCenterY, earthRadius - 4,
        earthCenterX, earthCenterY, earthRadius + 6
      );
      rimGrad.addColorStop(0, 'rgba(111, 234, 255, 0.18)');
      rimGrad.addColorStop(0.3, 'rgba(80, 200, 255, 0.1)');
      rimGrad.addColorStop(0.6, 'rgba(0, 229, 255, 0.04)');
      rimGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthRadius + 6, 0, Math.PI * 2);
      ctx.fill();

      // ── City lights along the horizon curve ──
      const cityCount = mobile ? 15 : 35;
      const breathe = Math.sin(elapsed * 0.6);
      for (let i = 0; i < cityCount; i++) {
        const angle = Math.PI + (Math.PI * (i / cityCount)) * 0.35 + Math.PI * 0.325;
        const jitter = (Math.sin(i * 137.508) * 0.5 + 0.5) * 12; // Fibonacci scatter
        const r = earthRadius - 1 - jitter;
        const cx = earthCenterX + Math.cos(angle) * r;
        const cy = earthCenterY + Math.sin(angle) * r;

        if (cy > h + 5) continue;

        const flicker = 0.3 + 0.7 * ((Math.sin(elapsed * (0.8 + i * 0.25) + i * 2.39) + 1) / 2);
        const glowR = 2.5 + breathe * 0.4 + (i % 3 === 0 ? 1.5 : 0);

        // Warm golden city glow
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
        glow.addColorStop(0, `rgba(255, 210, 120, ${0.6 * flicker})`);
        glow.addColorStop(0.4, `rgba(255, 180, 70, ${0.25 * flicker})`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Some cities get a faint cyan data-glow (futuristic tech hubs)
        if (i % 5 === 0) {
          const techGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR * 2.5);
          techGlow.addColorStop(0, `rgba(0, 229, 255, ${0.12 * flicker})`);
          techGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = techGlow;
          ctx.beginPath();
          ctx.arc(cx, cy, glowR * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── Horizon atmospheric haze line ──
      const hazeGrad = ctx.createLinearGradient(0, h * 0.82, 0, h);
      hazeGrad.addColorStop(0, 'transparent');
      hazeGrad.addColorStop(0.4, 'rgba(0, 180, 255, 0.015)');
      hazeGrad.addColorStop(0.7, 'rgba(6, 18, 27, 0.4)');
      hazeGrad.addColorStop(1, 'rgba(6, 18, 27, 0.95)');
      ctx.fillStyle = hazeGrad;
      ctx.fillRect(0, h * 0.82, w, h * 0.18);

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
      meteorTimers.forEach(clearTimeout);
    };
  }, [visible]);

  // ── Skip handler ──
  const handleSkip = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chronoearth_intro_seen', 'true');
    }
    setPhase('exit');
    setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 500);
  }, [onComplete]);

  if (!visible) return null;

  const isExiting = phase === 'exit';
  const showBrand = phase !== 'stars';
  const showTagline1 = phase === 'tagline1';
  const showTagline2 = phase === 'tagline2' || phase === 'loading' || phase === 'exit';
  const showLoading = phase === 'loading' || phase === 'exit';

  return (
    <div
      ref={containerRef}
      id="intro-cinematic"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        overflow: 'hidden',
        opacity: isExiting ? 0 : 1,
        transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        background: '#02060B',
      }}
      onClick={handleSkip}
    >
      {/* Canvas layer (HiDPI-aware) */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, display: 'block' }}
      />

      {/* Top cinematic vignette */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '35%',
        background: 'linear-gradient(to bottom, rgba(1, 5, 9, 0.7), transparent)',
        pointerEvents: 'none', zIndex: 2,
      }} />

      {/* Side vignettes for cinematic widescreen feel */}
      <div style={{
        position: 'absolute', inset: 0,
        boxShadow: 'inset 80px 0 120px -40px rgba(1, 5, 9, 0.5), inset -80px 0 120px -40px rgba(1, 5, 9, 0.5)',
        pointerEvents: 'none', zIndex: 2,
      }} />

      {/* ═══════════ BRANDING CONTENT ═══════════ */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', zIndex: 10,
        transform: `translateY(${isExiting ? '-8px' : '0'})`,
        transition: 'transform 0.7s ease',
      }}>

        {/* ── Emblem line ── */}
        <div style={{
          width: showBrand ? '60px' : '0px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.6), transparent)',
          marginBottom: '24px',
          transition: 'width 1s cubic-bezier(0.22, 1, 0.36, 1)',
        }} />

        {/* ── CHRONOEARTH ── */}
        <h1 style={{
          fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif",
          fontSize: isMobile ? 'clamp(2rem, 10vw, 3rem)' : 'clamp(3rem, 5.5vw, 4.5rem)',
          fontWeight: 200,
          letterSpacing: '0.4em',
          color: '#EAF7FF',
          textTransform: 'uppercase',
          margin: 0,
          opacity: showBrand ? 1 : 0,
          transform: showBrand ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.98)',
          transition: 'all 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
          textShadow: '0 0 60px rgba(0, 229, 255, 0.12), 0 0 120px rgba(111, 234, 255, 0.04)',
          lineHeight: 1.1,
        }}>
          ChronoEarth
        </h1>

        {/* ── Subtitle: Future Intelligence Platform ── */}
        <p style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: isMobile ? '10px' : '12px',
          fontWeight: 400,
          letterSpacing: '0.35em',
          color: 'rgba(140, 168, 184, 0.7)',
          textTransform: 'uppercase',
          margin: 0,
          marginTop: '12px',
          opacity: showBrand ? 1 : 0,
          transform: showBrand ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 1s cubic-bezier(0.22, 1, 0.36, 1) 0.15s',
        }}>
          Future Intelligence Platform
        </p>

        {/* ── Separator ── */}
        <div style={{
          width: (showTagline1 || showTagline2 || showLoading) ? '100px' : '0px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.35), transparent)',
          marginTop: '28px',
          marginBottom: '24px',
          transition: 'width 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.1s',
        }} />

        {/* ── Tagline container (crossfade between two) ── */}
        <div style={{ position: 'relative', height: '28px', minWidth: '300px' }}>
          {/* Tagline 1: "Make the Future Visible." */}
          <p style={{
            position: 'absolute',
            width: '100%',
            textAlign: 'center',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: isMobile ? '13px' : '16px',
            fontWeight: 300,
            letterSpacing: '0.08em',
            color: '#EAF7FF',
            margin: 0,
            opacity: showTagline1 ? 1 : 0,
            transform: showTagline1 ? 'translateY(0)' : (showTagline2 ? 'translateY(-8px)' : 'translateY(10px)'),
            transition: 'all 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
            fontStyle: 'italic',
          }}>
            {TAGLINES[0]}
          </p>

          {/* Tagline 2: "Explore where the world is going." */}
          <p style={{
            position: 'absolute',
            width: '100%',
            textAlign: 'center',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: isMobile ? '13px' : '16px',
            fontWeight: 300,
            letterSpacing: '0.08em',
            color: '#EAF7FF',
            margin: 0,
            opacity: showTagline2 ? 1 : 0,
            transform: showTagline2 ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
            fontStyle: 'italic',
          }}>
            {TAGLINES[1]}
          </p>
        </div>

        {/* ── Loading sequence ── */}
        <div style={{
          marginTop: '44px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
          opacity: showLoading ? 1 : 0,
          transform: showLoading ? 'translateY(0)' : 'translateY(6px)',
          transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        }}>
          {/* Progress bar */}
          <div style={{
            width: isMobile ? '160px' : '220px',
            height: '1px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '1px',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              top: 0, left: 0,
              height: '100%',
              width: showLoading
                ? `${Math.min(100, ((loadingMsgIndex + 1) / LOADING_MESSAGES.length) * 100)}%`
                : '0%',
              background: 'linear-gradient(90deg, rgba(0, 229, 255, 0.4), #00E5FF, #6FEAFF)',
              transition: 'width 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
              boxShadow: '0 0 10px rgba(0, 229, 255, 0.35), 0 0 20px rgba(0, 229, 255, 0.15)',
            }} />
          </div>

          {/* Cycling status messages */}
          <div style={{ position: 'relative', height: '14px', minWidth: '250px' }}>
            {LOADING_MESSAGES.map((msg, idx) => (
              <span
                key={msg}
                style={{
                  position: 'absolute',
                  width: '100%',
                  textAlign: 'center',
                  fontFamily: "'Space Grotesk', monospace",
                  fontSize: '10px',
                  letterSpacing: '0.2em',
                  color: 'rgba(0, 229, 255, 0.45)',
                  textTransform: 'uppercase',
                  opacity: loadingMsgIndex === idx ? 1 : 0,
                  transform: loadingMsgIndex === idx ? 'translateY(0)' : (loadingMsgIndex > idx ? 'translateY(-4px)' : 'translateY(4px)'),
                  transition: 'all 0.25s ease',
                }}
              >
                {msg}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Skip button ── */}
      <div style={{
        position: 'absolute',
        bottom: '28px',
        right: '36px',
        zIndex: 20,
        opacity: phase === 'stars' ? 0 : 0.35,
        transition: 'opacity 0.8s ease 0.6s',
        pointerEvents: 'auto',
      }}>
        <button
          onClick={(e) => { e.stopPropagation(); handleSkip(); }}
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '7px 18px',
            color: '#8CA8B8',
            fontSize: '10px',
            fontFamily: "'Space Grotesk', monospace",
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(8px)',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.borderColor = 'rgba(0, 229, 255, 0.25)';
            el.style.color = '#EAF7FF';
            el.style.background = 'rgba(0, 229, 255, 0.06)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            el.style.color = '#8CA8B8';
            el.style.background = 'rgba(255, 255, 255, 0.03)';
          }}
        >
          Skip ›
        </button>
      </div>

      {/* Subtle scan-line overlay (very faint) */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0, 229, 255, 0.005) 4px, rgba(0, 229, 255, 0.005) 5px)',
        pointerEvents: 'none',
        zIndex: 3,
        opacity: 0.4,
      }} />
    </div>
  );
}
