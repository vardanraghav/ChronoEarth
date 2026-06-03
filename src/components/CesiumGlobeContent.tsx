'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as Cesium from 'cesium';
import { Viewer, Scene, Entity, Polyline, useCesium } from 'resium';
import { citiesRawData, CityData } from '../data/citiesData';
import "cesium/Build/Cesium/Widgets/widgets.css";

export type EarthMode = 'realistic' | 'cyber';

// ─── ViewerConfigurator ────────────────────────────────────────────────────
function ViewerConfigurator({ onReady }: { onReady: (viewer: any) => void }) {
  const { viewer } = useCesium();
  useEffect(() => {
    if (viewer && !viewer.isDestroyed()) onReady(viewer);
  }, [viewer, onReady]);
  return null;
}

// ─── Props ─────────────────────────────────────────────────────────────────
interface CesiumGlobeContentProps {
  activeYear:     number;
  activeCategory: string;
  activeCity:     CityData | null;
  setActiveCity:  (city: CityData | null) => void;
  overlays: { climate: boolean; pollution: boolean; energy: boolean; satellite: boolean; ai: boolean };
  earthMode:      EarthMode;
}

// ─── Category colour palette ───────────────────────────────────────────────
const categoryThemes: Record<string, { primary: string; glow: string; cesiumColor: Cesium.Color }> = {
  'Ocean Monitoring': {
    primary: '#00f0ff', glow: 'rgba(0,240,255,0.15)',
    cesiumColor: Cesium.Color.fromCssColorString('#00f0ff'),
  },
  'Biodiversity': {
    primary: '#10b981', glow: 'rgba(16,185,129,0.15)',
    cesiumColor: Cesium.Color.fromCssColorString('#10b981'),
  },
  'Clean Energy': {
    primary: '#8b5cf6', glow: 'rgba(139,92,246,0.15)',
    cesiumColor: Cesium.Color.fromCssColorString('#8b5cf6'),
  },
  'Satellite Network': {
    primary: '#3b82f6', glow: 'rgba(59,130,246,0.15)',
    cesiumColor: Cesium.Color.fromCssColorString('#3b82f6'),
  },
};

// ─── Static data ────────────────────────────────────────────────────────────
const cityConnections = [
  { start: 'Mumbai',    end: 'Delhi'     }, { start: 'Bangalore', end: 'Hyderabad'  },
  { start: 'Hyderabad', end: 'Mumbai'    }, { start: 'Bangalore', end: 'Chennai'    },
  { start: 'Kolkata',   end: 'Delhi'     }, { start: 'Ahmedabad', end: 'Mumbai'     },
  { start: 'Delhi',     end: 'Islamabad' }, { start: 'Mumbai',    end: 'Dubai'      },
  { start: 'Dubai',     end: 'Riyadh'   }, { start: 'Shanghai',  end: 'Delhi'      },
  { start: 'Moscow',    end: 'Berlin'    }, { start: 'Berlin',    end: 'London'     },
  { start: 'London',    end: 'New York'  }, { start: 'New York',  end: 'Toronto'    },
  { start: 'Moscow',    end: 'Shanghai'  }, { start: 'Riyadh',   end: 'Dubai'      },
];

const getCityCoords = (name: string) => {
  const c = citiesRawData.find(x => x.name === name);
  return c ? { lat: c.lat, lon: c.lon } : null;
};

const climateZones  = [
  { lat:   0.0, lon: -140.0 }, { lat: 20.0, lon: -40.0 }, { lat: -10.0, lon:  75.0 },
];
const pollutionZones = [
  { lat: 28.6139, lon:  77.2090 }, { lat: 31.2304, lon: 121.4737 },
  { lat: 40.7128, lon: -74.0060 }, { lat: 55.7558, lon:  37.6173 },
  { lat: 51.5074, lon:  -0.1278 }, { lat: 25.2048, lon:  55.2708 },
];
const aiZones = [
  { lat: 12.9716, lon:  77.5946 }, { lat: 40.7128, lon: -74.0060 },
  { lat: 31.2304, lon: 121.4737 }, { lat: 51.5074, lon:  -0.1278 },
  { lat: 25.2048, lon:  55.2708 },
];

// ─── Component ─────────────────────────────────────────────────────────────
export default function CesiumGlobeContent({
  activeYear, activeCategory, activeCity, setActiveCity, overlays, earthMode,
}: CesiumGlobeContentProps) {
  const viewerRef  = useRef<any>(null);
  const [time,         setTime]         = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [hoveredCity,   setHoveredCity]   = useState<CityData | null>(null);
  const [hoverPos,      setHoverPos]      = useState<{ x: number; y: number } | null>(null);
  const [isGlobeReady,  setIsGlobeReady]  = useState(false);

  const theme = categoryThemes[activeCategory] || categoryThemes['Ocean Monitoring'];

  // Always-current mode ref (avoids stale closure in useCallback([]))
  const earthModeRef    = useRef<EarthMode>(earthMode);
  earthModeRef.current  = earthMode;
  const tileLoadCleanupRef = useRef<(() => void) | null>(null);

  // Stable Viewer constructor props — refs prevent Viewer recreation crashes
  const contextOptionsRef = useRef({ webgl: { alpha: true } });
  const creditContainerRef = useRef<HTMLDivElement | undefined>(undefined);
  if (typeof document !== 'undefined' && !creditContainerRef.current) {
    creditContainerRef.current = document.createElement('div');
  }

  // Unmount cleanup
  useEffect(() => () => { if (tileLoadCleanupRef.current) tileLoadCleanupRef.current(); }, []);

  // Animation time counter
  useEffect(() => {
    let id: number;
    const start = Date.now();
    const tick = () => { setTime((Date.now() - start) / 1000); id = requestAnimationFrame(tick); };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  // 2D hover position tracker (follows city in canvas space during camera movement)
  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current?.cesiumElement) return;
    const viewer = viewerRef.current.cesiumElement;
    if (viewer.isDestroyed() || !viewer.scene) return;
    const update = () => {
      if (viewer.isDestroyed() || !viewer.scene) return;
      if (hoveredCity) {
        const cart = Cesium.Cartesian3.fromDegrees(hoveredCity.lon, hoveredCity.lat);
        const pos  = viewer.scene.cartesianToCanvasCoordinates(cart);
        setHoverPos(pos ? { x: pos.x, y: pos.y } : null);
      } else { setHoverPos(null); }
    };
    const r1 = viewer.scene.postRender.addEventListener(update);
    const r2 = viewer.camera.changed.addEventListener(update);
    return () => { try { r1(); } catch(e){} try { r2(); } catch(e){} };
  }, [hoveredCity, isGlobeReady]);

  // Fly to selected city
  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current?.cesiumElement || !activeCity) return;
    const viewer = viewerRef.current.cesiumElement;
    if (viewer.isDestroyed() || !viewer.camera) return;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(activeCity.lon, activeCity.lat - 1.2, 1400000),
      duration: 3.5,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
    });
  }, [activeCity, isGlobeReady]);

  // Fly to category region
  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current?.cesiumElement || activeCity) return;
    const viewer = viewerRef.current.cesiumElement;
    if (viewer.isDestroyed() || !viewer.camera) return;
    const targets: Record<string, [number, number, number]> = {
      'Ocean Monitoring':  [-18.3, 147.7, 2200000],
      'Biodiversity':      [ -3.5, -62.2, 2800000],
      'Clean Energy':      [ 24.0,  12.0, 3200000],
      'Satellite Network': [ 25.0, -45.0, 16000000],
    };
    const [lat, lon, height] = targets[activeCategory] ?? [0, 0, 18000000];
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
      duration: 3.5,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
    });
  }, [activeCategory, activeCity, isGlobeReady]);

  // Slow rotation via postRender (safe, decoupled from RAF)
  useEffect(() => {
    if (isInteracting || activeCity || !isGlobeReady) return;
    if (!viewerRef.current?.cesiumElement) return;
    const viewer = viewerRef.current.cesiumElement;
    if (viewer.isDestroyed() || !viewer.scene) return;
    let last  = Date.now();
    const speed = 0.012;
    const spin  = () => {
      if (!viewerRef.current?.cesiumElement) return;
      const v = viewerRef.current.cesiumElement;
      if (v.isDestroyed() || !v.scene?.camera) return;
      const now = Date.now(); const delta = (now - last) / 1000; last = now;
      v.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, speed * delta);
    };
    let remove: (() => void) | undefined;
    const t = setTimeout(() => {
      const v = viewerRef.current?.cesiumElement;
      if (!v || v.isDestroyed() || !v.scene) return;
      remove = v.scene.postRender.addEventListener(spin);
    }, 1500);
    return () => { clearTimeout(t); if (remove) try { remove(); } catch(e){} };
  }, [isInteracting, activeCity, isGlobeReady]);

  // ═══════════════════════════════════════════════════════════════════════════
  //  applyRenderingMode — switches imagery, lighting & atmosphere in one call.
  //  Called from handleViewerReady (initial) AND the earthMode effect (on switch).
  // ═══════════════════════════════════════════════════════════════════════════
  const applyRenderingMode = useCallback((viewer: any, mode: EarthMode) => {
    if (!viewer || viewer.isDestroyed() || !viewer.scene) return;

    // Clear existing layers — always start fresh
    viewer.imageryLayers.removeAll();

    if (mode === 'realistic') {
      // ── Real Bing Aerial satellite photography ──────────────────────────
      Cesium.createWorldImageryAsync({ style: Cesium.IonWorldImageryStyle.AERIAL })
        .then((provider: any) => {
          if (viewer.isDestroyed()) return;
          const lyr = viewer.imageryLayers.addImageryProvider(provider);
          lyr.brightness = 1.05; lyr.contrast = 1.05; lyr.saturation = 1.0; lyr.hue = 0.0;
        })
        .catch(() => {
          if (viewer.isDestroyed()) return;
          const fb = new Cesium.ArcGisMapServerImageryProvider({
            url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
          });
          const lyr = viewer.imageryLayers.addImageryProvider(fb);
          lyr.brightness = 1.05; lyr.contrast = 1.05; lyr.saturation = 1.0;
        });

      // Warm natural sunlight
      viewer.scene.light = new Cesium.DirectionalLight({
        direction: new Cesium.Cartesian3(-0.7, -0.5, -0.5),
        color:     Cesium.Color.fromCssColorString('#fff8f0'),
        intensity: 2.2,
      });
      viewer.scene.ambientColor = new Cesium.Color(0.03, 0.03, 0.04, 1.0);

      if (viewer.scene.globe) {
        viewer.scene.globe.showGroundAtmosphere = true;
        viewer.scene.globe.enableLighting       = true;
        viewer.scene.globe.atmosphereLightIntensity  = 10.0;
        viewer.scene.globe.atmosphereHueShift        = 0.0;
        viewer.scene.globe.atmosphereSaturationShift = 0.0;
        viewer.scene.globe.atmosphereBrightnessShift = 0.08;
      }
      if (viewer.scene.skyAtmosphere) {
        viewer.scene.skyAtmosphere.show = true;
        viewer.scene.skyAtmosphere.hueShift = 0.0;
        viewer.scene.skyAtmosphere.saturationShift = 0.0;
        viewer.scene.skyAtmosphere.brightnessShift = 0.08;
      }

    } else {
      // ── Holographic dark-map with neon rendering ────────────────────────
      // CartoDB Dark (no labels) — clean black Earth surface for cyber look
      const cyberProvider = new Cesium.UrlTemplateImageryProvider({
        url:          'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',
        subdomains:   ['a', 'b', 'c', 'd'],
        minimumLevel: 0, maximumLevel: 18,
      });
      const lyr = viewer.imageryLayers.addImageryProvider(cyberProvider);
      // Lifted from black so continents read through the holographic atmosphere
      lyr.brightness = 1.75;
      lyr.contrast   = 1.20;
      lyr.saturation = 0.60;
      lyr.hue        = 0.54; // Shifts to cyan-blue for holographic tint

      // Bright cyan-white directional — makes the lit face glow like a hologram
      viewer.scene.light = new Cesium.DirectionalLight({
        direction: new Cesium.Cartesian3(-0.7, -0.5, -0.5),
        color:     Cesium.Color.fromCssColorString('#80ffef'),
        intensity: 4.5,
      });
      // Deep glowing ambient — night side looks like it's lit from within
      viewer.scene.ambientColor = new Cesium.Color(0.06, 0.14, 0.28, 1.0);

      if (viewer.scene.globe) {
        viewer.scene.globe.showGroundAtmosphere = true;
        viewer.scene.globe.enableLighting       = true;
        viewer.scene.globe.atmosphereLightIntensity  = 20.0; // Dramatic limb glow
        viewer.scene.globe.atmosphereHueShift        = 0.52; // Cyan atmosphere
        viewer.scene.globe.atmosphereSaturationShift = 0.70;
        viewer.scene.globe.atmosphereBrightnessShift = 0.30;
      }
      if (viewer.scene.skyAtmosphere) {
        viewer.scene.skyAtmosphere.show = true;
        viewer.scene.skyAtmosphere.hueShift          = 0.52;
        viewer.scene.skyAtmosphere.saturationShift   = 0.70;
        viewer.scene.skyAtmosphere.brightnessShift   = 0.30;
      }
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  //  handleViewerReady — runs once when Viewer mounts
  // ═══════════════════════════════════════════════════════════════════════════
  const handleViewerReady = useCallback((viewer: any) => {
    if (!viewer || viewer.isDestroyed() || !viewer.scene || !viewer.camera) return;

    // Cinematic opening angle — full sphere visible
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(20.0, 22.0, 18000000),
      orientation: { heading: Cesium.Math.toRadians(0), pitch: Cesium.Math.toRadians(-18), roll: 0.0 },
    });

    // Transparent WebGL canvas — CSS star field shows through
    viewer.scene.backgroundColor = Cesium.Color.TRANSPARENT;

    // Apply whichever mode is current at mount time
    applyRenderingMode(viewer, earthModeRef.current);

    // Tile load watcher — fades the globe loader when imagery is ready
    let done = false;
    let removeTileListener: (() => void) | undefined;
    if (viewer.scene.globe) {
      removeTileListener = viewer.scene.globe.tileLoadProgressEvent.addEventListener(
        (q: number) => {
          if (q === 0 && !done) {
            done = true; setIsGlobeReady(true);
            if (removeTileListener) removeTileListener();
          }
        }
      );
    }
    const safety = setTimeout(() => {
      if (!done) {
        done = true; setIsGlobeReady(true);
        if (removeTileListener) try { removeTileListener(); } catch(e){}
      }
    }, 5000);

    tileLoadCleanupRef.current = () => {
      clearTimeout(safety);
      if (removeTileListener) try { removeTileListener(); } catch(e){}
    };
  }, [applyRenderingMode]);

  // ═══════════════════════════════════════════════════════════════════════════
  //  Re-apply rendering whenever earthMode changes after initial load
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current?.cesiumElement) return;
    const viewer = viewerRef.current.cesiumElement;
    if (viewer.isDestroyed()) return;
    applyRenderingMode(viewer, earthMode);
  }, [earthMode, isGlobeReady, applyRenderingMode]);

  // ─── Satellite geometry ─────────────────────────────────────────────────
  const generateOrbitPoints = (tilt: number, height: number) => {
    const r = 6378137 + height;
    return Array.from({ length: 73 }, (_, i) => {
      const a = (i / 72) * Math.PI * 2;
      return new Cesium.Cartesian3(r * Math.cos(a), r * Math.sin(a) * Math.cos(tilt), r * Math.sin(a) * Math.sin(tilt));
    });
  };
  const getSatPos = (tilt: number, height: number, speed: number) => {
    const r = 6378137 + height;
    const a = (time * speed) % (Math.PI * 2);
    return new Cesium.Cartesian3(r * Math.cos(a), r * Math.sin(a) * Math.cos(tilt), r * Math.sin(a) * Math.sin(tilt));
  };

  const orbits = [
    { tilt:  0.4,  height: 1400000, speed: 0.08, color: Cesium.Color.fromCssColorString('#00f0ff') },
    { tilt: -0.7,  height: 2000000, speed: 0.05, color: Cesium.Color.fromCssColorString('#8b5cf6') },
    { tilt:  1.2,  height: 1700000, speed: 0.07, color: Cesium.Color.fromCssColorString('#14b8a6') },
    { tilt:  0.1,  height: 2500000, speed: 0.06, color: Cesium.Color.fromCssColorString('#3b82f6') },
    { tilt: -1.1,  height: 2200000, speed: 0.09, color: Cesium.Color.fromCssColorString('#00f0ff') },
  ];
  const yearFactor  = (activeYear - 2025) / 25;
  const activeSats  = orbits.slice(0, activeYear <= 2025 ? 1 : activeYear <= 2030 ? 2 : activeYear <= 2040 ? 3 : 5);

  // ─── Mode-aware overlay flags ───────────────────────────────────────────
  // Cyber mode: all overlays on for maximum impact.
  // Realistic mode: use props as passed.
  const ov = earthMode === 'cyber'
    ? { climate: true, pollution: true, energy: true, satellite: true, ai: true }
    : overlays;

  // ─── Overlay computed values ────────────────────────────────────────────
  const cyberBoost = earthMode === 'cyber' ? 1.8 : 1.0;

  const climateRadius   = 1200000 + yearFactor * 1600000;
  const climateAlpha    = (0.08 + yearFactor * 0.17) * cyberBoost;
  const climateColor    = Cesium.Color.fromCssColorString(
    yearFactor < 0.3 ? '#3b82f6' : yearFactor < 0.6 ? '#f97316' : '#ef4444'
  ).withAlpha(Math.min(climateAlpha, 0.45));

  const pollRadius  = 350000 - yearFactor * 230000;
  const pollAlpha   = (0.24 - yearFactor * 0.14) * cyberBoost;
  const pollColor   = Cesium.Color.fromCssColorString(
    yearFactor > 0.75 ? '#10b981' : yearFactor > 0.4 ? '#84cc16' : '#eab308'
  ).withAlpha(Math.min(pollAlpha, 0.55));

  const aiRadius = 100000 + yearFactor * 900000;
  const aiAlpha  = (0.06 + yearFactor * 0.14) * cyberBoost;
  const aiColor  = Cesium.Color.fromCssColorString('#8b5cf6').withAlpha(Math.min(aiAlpha, 0.40));

  const pktCount  = activeYear <= 2025 ? 1 : activeYear <= 2035 ? 2 : 3;
  const pktSpeed  = 0.05 + yearFactor * 0.10;
  const lineAlpha = earthMode === 'cyber' ? 0.25 : 0.10;
  const orbitAlpha= earthMode === 'cyber' ? 0.50 : 0.25;

  const getPulsePos = (s: {lat:number;lon:number}, e: {lat:number;lon:number}, sp: number, off: number) => {
    const t = ((time * sp) + off) % 1.0;
    return Cesium.Cartesian3.fromDegrees(s.lon + (e.lon - s.lon) * t, s.lat + (e.lat - s.lat) * t);
  };

  const pulseFactor = (time * 1.2) % 1.0;
  const pulseRadius = pulseFactor * 320000;
  const pulseAlpha  = 0.65 * (1 - pulseFactor);

  // ─── JSX ───────────────────────────────────────────────────────────────
  return (
    <div
      className="absolute inset-0 w-screen h-screen bg-transparent z-0 overflow-hidden"
      onMouseDown={() => setIsInteracting(true)}   onMouseUp={() => setIsInteracting(false)}
      onTouchStart={() => setIsInteracting(true)}  onTouchEnd={() => setIsInteracting(false)}
    >
      <Viewer
        ref={viewerRef} full
        timeline={false} animation={false} baseLayerPicker={false}
        navigationHelpButton={false} homeButton={false} sceneModePicker={false}
        geocoder={false} infoBox={false} selectionIndicator={false}
        fullscreenButton={false} skyBox={false}
        contextOptions={contextOptionsRef.current}
        creditContainer={creditContainerRef.current}
        style={{ width: '100vw', height: '100vh' }}
      >
        <ViewerConfigurator onReady={handleViewerReady} />
        <Scene backgroundColor={Cesium.Color.TRANSPARENT} />

        {/* ── City markers — size + colour adapt to mode ────────────────── */}
        {citiesRawData.map((city) => {
          const isSel  = activeCity?.name === city.name;
          const isCyber = earthMode === 'cyber';
          return (
            <Entity
              key={city.name}
              position={Cesium.Cartesian3.fromDegrees(city.lon, city.lat)}
              point={{
                pixelSize:    isCyber ? (isSel ? 14 : 8)   : (isSel ? 6 : 4),
                color:        isCyber
                  ? theme.cesiumColor.withAlpha(isSel ? 1.0 : 0.75)
                  : Cesium.Color.WHITE.withAlpha(isSel ? 0.90 : 0.50),
                outlineColor: isCyber
                  ? Cesium.Color.WHITE.withAlpha(isSel ? 0.9 : 0.25)
                  : Cesium.Color.WHITE.withAlpha(0.0),
                outlineWidth: isCyber ? (isSel ? 2.5 : 1.0) : 0,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
              }}
              onClick={() => setActiveCity(city as CityData)}
              onMouseEnter={() => setHoveredCity(city as CityData)}
              onMouseLeave={() => setHoveredCity(null)}
            />
          );
        })}

        {/* ── Selected city pulse ───────────────────────────────────────── */}
        {activeCity && (
          <Entity
            position={Cesium.Cartesian3.fromDegrees(activeCity.lon, activeCity.lat)}
            ellipse={{
              semiMajorAxis: pulseRadius,
              semiMinorAxis: pulseRadius,
              material: earthMode === 'cyber'
                ? theme.cesiumColor.withAlpha(pulseAlpha)
                : Cesium.Color.WHITE.withAlpha(pulseAlpha * 0.35),
              height: 0,
            }}
          />
        )}

        {/* ── Climate heatmap ───────────────────────────────────────────── */}
        {ov.climate && climateZones.map((z, i) => (
          <Entity key={`cl-${i}`} position={Cesium.Cartesian3.fromDegrees(z.lon, z.lat)}
            ellipse={{ semiMajorAxis: climateRadius, semiMinorAxis: climateRadius, material: climateColor, height: 5000 }} />
        ))}

        {/* ── Pollution nodes ───────────────────────────────────────────── */}
        {ov.pollution && pollutionZones.map((z, i) => (
          <Entity key={`pl-${i}`} position={Cesium.Cartesian3.fromDegrees(z.lon, z.lat)}
            ellipse={{ semiMajorAxis: pollRadius, semiMinorAxis: pollRadius, material: pollColor, height: 10000 }} />
        ))}

        {/* ── AI infrastructure zones ───────────────────────────────────── */}
        {ov.ai && aiZones.map((z, i) => (
          <Entity key={`ai-${i}`} position={Cesium.Cartesian3.fromDegrees(z.lon, z.lat)}
            ellipse={{ semiMajorAxis: aiRadius, semiMinorAxis: aiRadius, material: aiColor, height: 8000 }} />
        ))}

        {/* ── Energy hypergrids + transmission packets ──────────────────── */}
        {ov.energy && cityConnections.map((conn, i) => {
          const c1 = getCityCoords(conn.start);
          const c2 = getCityCoords(conn.end);
          if (!c1 || !c2) return null;
          return (
            <span key={`eg-${i}`}>
              <Polyline
                positions={[Cesium.Cartesian3.fromDegrees(c1.lon, c1.lat), Cesium.Cartesian3.fromDegrees(c2.lon, c2.lat)]}
                width={earthMode === 'cyber' ? 1.5 : 1}
                material={Cesium.Material.fromType('Color', { color: theme.cesiumColor.withAlpha(lineAlpha) })}
              />
              {Array.from({ length: pktCount }, (_, k) => (
                <Entity key={`pk-${i}-${k}`}
                  position={getPulsePos(c1, c2, pktSpeed, k / pktCount)}
                  point={{
                    pixelSize: earthMode === 'cyber' ? 5.5 : 4.5,
                    color: theme.cesiumColor,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: earthMode === 'cyber' ? 1.2 : 0.8,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                  }}
                />
              ))}
            </span>
          );
        })}

        {/* ── Orbital satellites ────────────────────────────────────────── */}
        {(activeCategory === 'Satellite Network' || ov.satellite) && (
          <>
            {activeSats.map((o, i) => (
              <Polyline key={`orb-${i}`}
                positions={generateOrbitPoints(o.tilt, o.height)} width={1}
                material={Cesium.Material.fromType('Color', { color: o.color.withAlpha(orbitAlpha) })}
              />
            ))}
            {activeSats.map((o, i) => (
              <Entity key={`sat-${i}`} position={getSatPos(o.tilt, o.height, o.speed)}
                point={{
                  pixelSize: earthMode === 'cyber' ? 10 : 8,
                  color: o.color, outlineColor: Cesium.Color.WHITE, outlineWidth: 1.5,
                  disableDepthTestDistance: Number.POSITIVE_INFINITY,
                }}
              />
            ))}
            {ov.satellite && (
              <>
                <Entity position={Cesium.Cartesian3.ZERO}
                  ellipsoid={{ radii: new Cesium.Cartesian3(6378137+400000, 6378137+400000, 6378137+400000),
                    material: theme.cesiumColor.withAlpha(0.03 + yearFactor * 0.04), fill: true, outline: true,
                    outlineColor: theme.cesiumColor.withAlpha((0.03 + yearFactor * 0.04) * 3), outlineWidth: 1 }}
                />
                <Entity position={Cesium.Cartesian3.ZERO}
                  ellipsoid={{ radii: new Cesium.Cartesian3(6378137+850000, 6378137+850000, 6378137+850000),
                    material: theme.cesiumColor.withAlpha((0.03 + yearFactor * 0.04) * 0.4), fill: true, outline: true,
                    outlineColor: theme.cesiumColor.withAlpha((0.03 + yearFactor * 0.04) * 1.5), outlineWidth: 0.5 }}
                />
              </>
            )}
          </>
        )}
      </Viewer>

      {/* ── Hover card — adapts to mode ─────────────────────────────────── */}
      {hoveredCity && hoverPos && (
        <div className="absolute pointer-events-none select-none z-50"
          style={{ left: `${hoverPos.x + 14}px`, top: `${hoverPos.y - 42}px`, animation: 'fade-in-up 0.2s ease-out forwards' }}>
          {earthMode === 'cyber' ? (
            <div style={{ padding: '7px 12px', background: 'rgba(0,8,20,0.90)', backdropFilter: 'blur(16px)',
              border: `1px solid ${theme.primary}50`, borderRadius: '2px', boxShadow: `0 0 20px ${theme.primary}20` }}>
              <div style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.25em', color: theme.primary,
                textTransform: 'uppercase', textShadow: `0 0 10px ${theme.primary}80`, marginBottom: '3px' }}>
                {hoveredCity.name}
              </div>
              <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', letterSpacing: '0.12em' }}>
                {hoveredCity.lat.toFixed(3)}° N · {hoveredCity.lon.toFixed(3)}° E
              </div>
              <div style={{ marginTop: '2px', fontSize: '7px', color: `${theme.primary}90`, fontFamily: 'monospace', letterSpacing: '0.15em' }}>
                {hoveredCity.country.toUpperCase()} · FOCUS NODE
              </div>
            </div>
          ) : (
            <div style={{ padding: '6px 10px', background: 'rgba(3,5,10,0.75)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '2px' }}>
              <div style={{ fontSize: '9px', fontWeight: 300, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.80)', textTransform: 'uppercase' }}>
                {hoveredCity.name}
              </div>
              <div style={{ marginTop: '2px', fontSize: '7px', fontWeight: 200, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.30)' }}>
                {hoveredCity.lat.toFixed(2)}° N &nbsp; {hoveredCity.lon.toFixed(2)}° E
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Loader overlay ──────────────────────────────────────────────── */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center z-50 transition-opacity duration-1000 ease-in-out ${isGlobeReady ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        style={{ background: '#030508' }}>
        {earthMode === 'cyber' ? (
          <>
            <div style={{ width: 72, height: 72, borderRadius: '50%', border: '1px solid rgba(0,240,255,0.20)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'breathe 2s ease-in-out infinite' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', border: '1px dashed rgba(0,240,255,0.12)', animation: 'spin 8s linear infinite' }} />
            </div>
            <p style={{ marginTop: 18, fontSize: 8, fontWeight: 300, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(0,240,255,0.40)', fontFamily: 'monospace' }}>
              Syncing Telemetry
            </p>
          </>
        ) : (
          <>
            <div style={{ width: 56, height: 56, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'breathe 2.5s ease-in-out infinite' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', border: '1px dashed rgba(255,255,255,0.07)', animation: 'spin 10s linear infinite' }} />
            </div>
            <p style={{ marginTop: 16, fontSize: 8, fontWeight: 300, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)' }}>
              Initializing Globe
            </p>
          </>
        )}
      </div>
    </div>
  );
}
