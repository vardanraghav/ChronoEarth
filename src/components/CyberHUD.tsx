'use client';

import { useEffect, useRef, useState } from 'react';

const C = {
  emerald: '#00FF88',
  cyan:    '#00E5FF',
  iceBlue: '#00C8FF',
  white:   '#FFFFFF',
  bg:      'rgba(0,8,20,0.82)',
  border:  'rgba(0,229,255,0.18)',
};

// Animated counter hook
function useCounter(target: number, duration = 2000) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      setVal(Math.round(target * easeOut(t)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return val;
}
function easeOut(t: number) { return 1 - Math.pow(1 - t, 3); }

// Sparkline mini chart
function Sparkline({ color, height = 36 }: { color: string; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataRef   = useRef<number[]>(Array.from({ length: 40 }, () => 0.4 + Math.random() * 0.5));
  useEffect(() => {
    const id = setInterval(() => {
      const d = dataRef.current;
      d.push(Math.max(0.1, Math.min(1.0, d[d.length - 1] + (Math.random() - 0.5) * 0.12)));
      if (d.length > 60) d.shift();
      const c = canvasRef.current;
      if (!c) return;
      const ctx = c.getContext('2d')!;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.beginPath();
      d.forEach((v, i) => {
        const x = (i / (d.length - 1)) * c.width;
        const y = c.height - v * c.height;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = color;
      ctx.shadowBlur = 4;
      ctx.stroke();
    }, 80);
    return () => clearInterval(id);
  }, [color]);
  return <canvas ref={canvasRef} width={160} height={height} style={{ width: '100%', height: `${height}px` }} />;
}

// Circular gauge
function CircularGauge({ value, color, label }: { value: number; color: string; label: string }) {
  const r = 34; const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={80} height={80} viewBox="0 0 80 80">
        <circle cx={40} cy={40} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
        <circle cx={40} cy={40} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
          style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dashoffset 0.8s ease' }} />
        <text x={40} y={36} textAnchor="middle" fill={color} fontSize={14} fontWeight={600} fontFamily="monospace">{value}</text>
        <text x={40} y={48} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={7} fontFamily="monospace">%</text>
      </svg>
      <span style={{ fontSize: 7, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>{label}</span>
    </div>
  );
}

// Section header
function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
      <div style={{ width: 3, height: 10, background: C.cyan, boxShadow: `0 0 6px ${C.cyan}` }} />
      <span style={{ fontSize: 7, fontWeight: 600, letterSpacing: '0.30em', color: C.cyan, textTransform: 'uppercase', textShadow: `0 0 8px ${C.cyan}60` }}>
        {title}
      </span>
    </div>
  );
}

// Status row
function StatusRow({ label, value, color = C.emerald, blink = false }: { label: string; value: string | number; color?: string; blink?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
      <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{
        fontSize: 9, fontFamily: 'monospace', fontWeight: 600, color,
        textShadow: `0 0 10px ${color}80`,
        animation: blink ? 'hud-blink 2s ease-in-out infinite' : 'none',
      }}>{value}</span>
    </div>
  );
}

export default function CyberHUD() {
  const [time, setTime] = useState('');
  const [nodeCount,  setNodeCount]  = useState(1247389);
  const [satCount,   setSatCount]   = useState(12842);
  const [beamCount,  setBeamCount]  = useState(834);
  const [dataFlow,   setDataFlow]   = useState(2.41);
  const [aiActivity, setAiActivity] = useState(98.7);

  const displayNodes = useCounter(nodeCount, 2500);

  // Live clock
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}  ${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}:${String(d.getUTCSeconds()).padStart(2,'0')} UTC`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Fluctuating live metrics
  useEffect(() => {
    const id = setInterval(() => {
      setNodeCount(n => n + Math.floor((Math.random() - 0.4) * 120));
      setSatCount(n  => Math.max(12000, n + Math.floor((Math.random() - 0.5) * 8)));
      setBeamCount(n => Math.max(700, n + Math.floor((Math.random() - 0.5) * 20)));
      setDataFlow(v  => Math.max(1.8, +(v + (Math.random() - 0.5) * 0.15).toFixed(2)));
      setAiActivity(v => Math.min(99.9, Math.max(95, +(v + (Math.random() - 0.5) * 0.5).toFixed(1))));
    }, 1200);
    return () => clearInterval(id);
  }, []);

  const panelStyle: React.CSSProperties = {
    background: C.bg,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${C.border}`,
    borderRadius: '2px',
    padding: '14px 16px',
    boxShadow: `0 0 30px rgba(0,229,255,0.06), inset 0 0 20px rgba(0,229,255,0.02)`,
    position: 'relative',
    overflow: 'hidden',
  };

  const cornerAccent = (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 8, height: 8, borderTop: `1px solid ${C.cyan}`, borderLeft: `1px solid ${C.cyan}` }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderTop: `1px solid ${C.cyan}`, borderRight: `1px solid ${C.cyan}` }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: 8, height: 8, borderBottom: `1px solid ${C.cyan}`, borderLeft: `1px solid ${C.cyan}` }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderBottom: `1px solid ${C.cyan}`, borderRight: `1px solid ${C.cyan}` }} />
    </>
  );

  return (
    <>
      <style>{`
        @keyframes hud-blink {
          0%,100% { opacity:1; }
          50% { opacity:0.4; }
        }
        @keyframes hud-scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(600%); }
        }
        @keyframes data-pulse {
          0%,100% { opacity:0.7; }
          50% { opacity:1; }
        }
      `}</style>

      {/* ── LEFT PANEL: LIVE PLANET STATUS ──────────────────────────────────── */}
      <div style={{
        position: 'fixed', left: 40, top: '50%', transform: 'translateY(-50%)',
        zIndex: 30, width: 200, pointerEvents: 'none',
        animation: 'fade-up 0.8s 0.6s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <div style={panelStyle}>
          {cornerAccent}
          <SectionHeader title="Live Planet Status" />

          <StatusRow label="AI Activity"    value={`${aiActivity}%`} color={C.emerald} />
          <StatusRow label="Data Flow"      value={`${dataFlow} PB/s`} color={C.cyan} />
          <StatusRow label="Network Nodes"  value={displayNodes.toLocaleString()} color={C.white} />
          <StatusRow label="Satellites"     value={satCount.toLocaleString()} color={C.iceBlue} />
          <StatusRow label="Uplink Beams"   value={beamCount.toString()} color={C.cyan} />
          <StatusRow label="System Health"  value="OPTIMAL" color={C.emerald} blink />

          <div style={{ marginTop: 12, marginBottom: 4 }}>
            <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.2em', marginBottom: 4 }}>DATA FLOW</div>
            <Sparkline color={C.emerald} height={32} />
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.2em', marginBottom: 4 }}>NETWORK NODES</div>
            <Sparkline color={C.cyan} height={28} />
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: ORBITAL LAYERS ─────────────────────────────────────── */}
      <div style={{
        position: 'fixed', right: 40, top: '50%', transform: 'translateY(-50%)',
        zIndex: 30, width: 190, pointerEvents: 'none',
        animation: 'fade-up 0.8s 0.8s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <div style={panelStyle}>
          {cornerAccent}
          <SectionHeader title="Orbital Layers" />

          {[
            { label: 'LEO Network',        sub: '160 – 2,000 km',   color: C.cyan,    sats: 30, active: true },
            { label: 'MEO Network',        sub: '3,000 – 36,786 km',color: C.iceBlue, sats: 20, active: true },
            { label: 'GEO Network',        sub: '35,786 km',         color: C.emerald, sats: 12, active: true },
            { label: 'Deep Space Links',   sub: 'Beyond GEO',        color: C.white,   sats: 5,  active: false },
          ].map(({ label, sub, color, sats, active }) => (
            <div key={label} style={{ marginBottom: 10, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ marginTop: 2, width: 7, height: 7, borderRadius: '50%', background: color,
                boxShadow: active ? `0 0 8px ${color}` : 'none', flexShrink: 0,
                animation: active ? 'data-pulse 2s ease-in-out infinite' : 'none' }} />
              <div>
                <div style={{ fontSize: 8, color: C.white, letterSpacing: '0.12em' }}>{label}</div>
                <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.08em', marginTop: 1 }}>{sub}</div>
                <div style={{ fontSize: 6, color, marginTop: 2, letterSpacing: '0.1em' }}>{sats} SATELLITES</div>
              </div>
            </div>
          ))}

          <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 4, paddingTop: 10 }}>
            <SectionHeader title="Data Legend" />
            {[
              { color: C.emerald,  symbol: '◉', label: 'AI Hub' },
              { color: C.cyan,     symbol: '●', label: 'Major City' },
              { color: C.iceBlue,  symbol: '◌', label: 'Telemetry Station' },
              { color: C.cyan,     symbol: '—', label: 'Data Route' },
              { color: C.white,    symbol: '↑', label: 'Uplink Beam' },
              { color: C.cyan,     symbol: '⊙', label: 'Scanning Sector' },
              { color: C.emerald,  symbol: '○', label: 'Orbital Path' },
              { color: C.iceBlue,  symbol: '◆', label: 'Satellite' },
            ].map(({ color, symbol, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                <span style={{ fontSize: 9, color, textShadow: `0 0 6px ${color}`, width: 12, textAlign: 'center', flexShrink: 0 }}>{symbol}</span>
                <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.40)', letterSpacing: '0.1em' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM PANELS ───────────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 24, left: 40, right: 40,
        display: 'flex', gap: 12, zIndex: 30, pointerEvents: 'none',
        animation: 'fade-up 0.8s 1.0s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        {/* Global Telemetry */}
        <div style={{ ...panelStyle, flex: 2 }}>
          {cornerAccent}
          <SectionHeader title="Global Telemetry" />
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: 6, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.15em' }}>DATA FLOW (PB/s)</span>
                <span style={{ fontSize: 9, color: C.emerald, fontFamily: 'monospace', fontWeight: 600 }}>{dataFlow.toFixed(1)}</span>
              </div>
              <Sparkline color={C.emerald} height={40} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 6, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.15em' }}>NETWORK NODES</span>
                <span style={{ fontSize: 9, color: C.cyan, fontFamily: 'monospace', fontWeight: 600 }}>{(displayNodes / 1000).toFixed(0)}K</span>
              </div>
              <Sparkline color={C.cyan} height={36} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            {['7H', '6H', '24H', '7D'].map(l => (
              <span key={l} style={{ fontSize: 6, color: l === '24H' ? C.cyan : 'rgba(255,255,255,0.20)', letterSpacing: '0.15em', cursor: 'default',
                textShadow: l === '24H' ? `0 0 6px ${C.cyan}` : 'none' }}>{l}</span>
            ))}
          </div>
        </div>

        {/* Scanning Activity */}
        <div style={{ ...panelStyle, flex: 1.2 }}>
          {cornerAccent}
          <SectionHeader title="Scanning Activity" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Climate Monitoring', val: 87, color: C.emerald },
              { label: 'Ocean Monitoring',   val: 92, color: C.cyan },
              { label: 'Biodiversity',        val: 74, color: C.iceBlue },
              { label: 'Energy Grid',         val: 94, color: C.emerald },
              { label: 'Population Dynamics', val: 81, color: C.cyan },
            ].map(({ label, val, color }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 6, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.1em' }}>{label}</span>
                  <span style={{ fontSize: 7, color, fontFamily: 'monospace' }}>{val}%</span>
                </div>
                <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1 }}>
                  <div style={{ height: '100%', width: `${val}%`, background: color, borderRadius: 1, boxShadow: `0 0 6px ${color}80`, transition: 'width 1s ease' }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 4, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 6, color: 'rgba(255,255,255,0.30)' }}>OVERALL</span>
                <span style={{ fontSize: 9, color: C.emerald, fontFamily: 'monospace', fontWeight: 600 }}>88%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Data Flows */}
        <div style={{ ...panelStyle, flex: 1.6 }}>
          {cornerAccent}
          <SectionHeader title="Active Data Flows" />
          {[
            { route: 'ASIA → EUROPE',     val: 12.6 },
            { route: 'N. AMERICA → ASIA', val: 9.8  },
            { route: 'EUROPE → AFRICA',   val: 7.4  },
            { route: 'S. AMERICA → N. AM',val: 6.1  },
            { route: 'AUSTRALIA → ASIA',  val: 5.7  },
          ].map(({ route, val }) => (
            <div key={route} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
              <span style={{ fontSize: 6.5, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em' }}>{route}</span>
              <span style={{ fontSize: 8, color: C.cyan, fontFamily: 'monospace', fontWeight: 600 }}>{val} PB/s</span>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 2 }}>
            <SectionHeader title="Time & Location" />
            <div style={{ fontSize: 8, color: C.emerald, fontFamily: 'monospace', letterSpacing: '0.15em' }}>{time}</div>
            <div style={{ marginTop: 4, fontSize: 7, color: 'rgba(255,255,255,0.30)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>22.5726° N, 88.3639° E</div>
          </div>
        </div>
      </div>
    </>
  );
}
