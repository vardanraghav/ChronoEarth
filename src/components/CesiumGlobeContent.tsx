'use client';

import { useEffect, useRef, useState } from 'react';
import { citiesRawData, CityData } from '../data/citiesData';

export type EarthMode = 'realistic' | 'cyber';

interface CesiumGlobeContentProps {
  activeYear:     number;
  activeCategory: string;
  activeCity:     CityData | null;
  setActiveCity:  (city: CityData | null) => void;
  overlays: { climate: boolean; pollution: boolean; energy: boolean; satellite: boolean; ai: boolean };
  earthMode:      EarthMode;
}

declare const Cesium: any;

// ─── STRICT COLOR PALETTE ───────────────────────────────────────────────────
const C = {
  emerald:  '#00FF88',
  cyan:     '#00E5FF',
  iceBlue:  '#00C8FF',
  white:    '#FFFFFF',
  spaceBg:  '#001018',
  black:    '#000000',
} as const;

// ─── AI HUB COORDINATES ─────────────────────────────────────────────────────
const AI_HUBS: { name: string; lat: number; lon: number }[] = [
  { name: 'New York',   lat:  40.7128, lon:  -74.0060 },
  { name: 'London',     lat:  51.5074, lon:   -0.1278 },
  { name: 'Paris',      lat:  48.8566, lon:    2.3522 },
  { name: 'Dubai',      lat:  25.2048, lon:   55.2708 },
  { name: 'Mumbai',     lat:  19.0760, lon:   72.8777 },
  { name: 'Delhi',      lat:  28.6139, lon:   77.2090 },
  { name: 'Singapore',  lat:   1.3521, lon:  103.8198 },
  { name: 'Tokyo',      lat:  35.6762, lon:  139.6503 },
  { name: 'Seoul',      lat:  37.5665, lon:  126.9780 },
  { name: 'Sydney',     lat: -33.8688, lon:  151.2093 },
  { name: 'São Paulo',  lat: -23.5505, lon:  -46.6333 },
  { name: 'Lagos',      lat:   6.5244, lon:    3.3792 },
  { name: 'Cairo',      lat:  30.0444, lon:   31.2357 },
  { name: 'Beijing',    lat:  39.9042, lon:  116.4074 },
  { name: 'Los Angeles',lat:  34.0522, lon: -118.2437 },
];

// ─── GEODESIC HIGHWAYS ──────────────────────────────────────────────────────
const HIGHWAYS = [
  { a: 'New York',   b: 'London',     alt: 500000 },
  { a: 'London',     b: 'Paris',      alt: 150000 },
  { a: 'Paris',      b: 'Dubai',      alt: 400000 },
  { a: 'Dubai',      b: 'Mumbai',     alt: 300000 },
  { a: 'Mumbai',     b: 'Delhi',      alt: 250000 },
  { a: 'Delhi',      b: 'Singapore',  alt: 400000 },
  { a: 'Mumbai',     b: 'Singapore',  alt: 350000 },
  { a: 'Singapore',  b: 'Tokyo',      alt: 380000 },
  { a: 'Tokyo',      b: 'Seoul',      alt: 200000 },
  { a: 'Sydney',     b: 'Singapore',  alt: 500000 },
  { a: 'New York',   b: 'Tokyo',      alt: 750000 },
  { a: 'London',     b: 'Singapore',  alt: 650000 },
  { a: 'Seoul',      b: 'New York',   alt: 800000 },
  { a: 'São Paulo',  b: 'New York',   alt: 550000 },
  { a: 'Lagos',      b: 'London',     alt: 450000 },
  { a: 'Cairo',      b: 'Dubai',      alt: 280000 },
  { a: 'Beijing',    b: 'Tokyo',      alt: 220000 },
  { a: 'Los Angeles',b: 'Tokyo',      alt: 700000 },
  { a: 'Los Angeles',b: 'New York',   alt: 350000 },
  { a: 'Beijing',    b: 'Moscow',     alt: 300000 },
];

// ─── ORBITAL SHELLS ──────────────────────────────────────────────────────────
const ORBITAL_SHELLS = [
  { name: 'LEO',   radius: 6378137 + 550000,   tiltX: 0.52, tiltY: 0.24, color: C.cyan,    sats: 30, speed: 0.07,  trailLen: 0.15 },
  { name: 'MEO',   radius: 6378137 + 3500000,  tiltX: -0.62,tiltY: 0.45, color: C.iceBlue, sats: 20, speed: 0.035, trailLen: 0.08 },
  { name: 'GEO',   radius: 6378137 + 12000000, tiltX: 0.0,  tiltY: 0.0,  color: C.emerald, sats: 12, speed: 0.012, trailLen: 0.05 },
  { name: 'DEEP',  radius: 6378137 + 30000000, tiltX: 0.28, tiltY: 0.12, color: C.white,   sats: 5,  speed: 0.005, trailLen: 0.03 },
];

// Helper: rotate a point by X then Y axis
function rotateXY(x: number, y: number, z: number, tx: number, ty: number) {
  const cosX = Math.cos(tx), sinX = Math.sin(tx);
  const cosY = Math.cos(ty), sinY = Math.sin(ty);
  const y1 = y * cosX - z * sinX;
  const z1 = y * sinX + z * cosX;
  const x2 = x * cosY + z1 * sinY;
  const z2 = -x * sinY + z1 * cosY;
  return { x: x2, y: y1, z: z2 };
}

// Helper: geodesic arc
function geodesicArc(c1: {lat:number;lon:number}, c2: {lat:number;lon:number}, maxAlt: number, steps = 40) {
  const pts = [];
  const s = Cesium.Cartographic.fromDegrees(c1.lon, c1.lat);
  const e = Cesium.Cartographic.fromDegrees(c2.lon, c2.lat);
  const geo = new Cesium.EllipsoidGeodesic(s, e);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const c = geo.interpolateUsingFraction(t);
    const h = Math.sin(t * Math.PI) * maxAlt;
    pts.push(Cesium.Cartesian3.fromRadians(c.longitude, c.latitude, h));
  }
  return pts;
}

function hubCoord(name: string) {
  return AI_HUBS.find(h => h.name === name) ?? citiesRawData.find(c => c.name === name) ?? null;
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function CesiumGlobeContent({
  activeYear, activeCategory, activeCity, setActiveCity, overlays, earthMode,
}: CesiumGlobeContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef    = useRef<any>(null);
  const timeRef      = useRef(0);
  const [isInteracting,  setIsInteracting]  = useState(false);
  const [hoveredCity,    setHoveredCity]    = useState<CityData | null>(null);
  const [hoverPos,       setHoverPos]       = useState<{ x: number; y: number } | null>(null);
  const [isGlobeReady,   setIsGlobeReady]   = useState(false);

  const isCyber = earthMode === 'cyber';

  // Animation clock
  useEffect(() => {
    let id: number;
    const t0 = Date.now();
    const tick = () => { timeRef.current = (Date.now() - t0) / 1000; id = requestAnimationFrame(tick); };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  // ─── Initialize Cesium Viewer ───────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current || !(window as any).Cesium) return;

    const viewer = new Cesium.Viewer(containerRef.current, {
      timeline: false, animation: false, baseLayerPicker: false,
      navigationHelpButton: false, homeButton: false, sceneModePicker: false,
      geocoder: false, infoBox: false, selectionIndicator: false,
      fullscreenButton: false, skyBox: false,
      contextOptions: { webgl: { alpha: true } },
      creditContainer: document.createElement('div'),
    });

    viewer.scene.backgroundColor = Cesium.Color.TRANSPARENT;
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(20.0, 22.0, 18000000),
      orientation: { heading: 0, pitch: Cesium.Math.toRadians(-18), roll: 0 },
    });
    viewerRef.current = viewer;

    // Globe ready
    let done = false;
    let rmTile: (() => void) | undefined;
    if (viewer.scene.globe) {
      rmTile = viewer.scene.globe.tileLoadProgressEvent.addEventListener((q: number) => {
        if (q === 0 && !done) { done = true; setIsGlobeReady(true); if (rmTile) rmTile(); }
      });
    }
    const safety = setTimeout(() => {
      if (!done) { done = true; setIsGlobeReady(true); if (rmTile) try { rmTile(); } catch(e){} }
    }, 4500);

    // Event handlers
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((click: any) => {
      const picked = viewer.scene.pick(click.position);
      if (Cesium.defined(picked) && picked.id?.properties?.cityData) {
        setActiveCity(picked.id.properties.cityData.getValue());
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.setInputAction((mv: any) => {
      const picked = viewer.scene.pick(mv.endPosition);
      if (Cesium.defined(picked) && picked.id?.properties?.cityData) {
        setHoveredCity(picked.id.properties.cityData.getValue());
      } else { setHoveredCity(null); }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    return () => {
      clearTimeout(safety);
      if (rmTile) try { rmTile(); } catch(e) {}
      handler.destroy();
      viewer.destroy();
      viewerRef.current = null;
    };
  }, [setActiveCity]);

  // ─── Build Scene Layers ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current) return;
    const viewer = viewerRef.current;

    // Reset
    viewer.entities.removeAll();
    viewer.imageryLayers.removeAll();
    viewer.dataSources.removeAll();
    const primRm: any[] = [];
    for (let i = 0; i < viewer.scene.primitives.length; i++) {
      const p = viewer.scene.primitives.get(i);
      if (p instanceof Cesium.PointPrimitiveCollection || p instanceof Cesium.PolylineCollection) {
        primRm.push(p);
      }
    }
    primRm.forEach(p => viewer.scene.primitives.remove(p));

    let removeRenderListener: (() => void) | undefined;

    // ══════════════════════════════════════════════════════════════════════════
    //  REALISTIC MODE
    // ══════════════════════════════════════════════════════════════════════════
    if (!isCyber) {
      Cesium.createWorldImageryAsync({ style: Cesium.IonWorldImageryStyle.AERIAL })
        .then((provider: any) => {
          if (viewer.isDestroyed() || isCyber) return;
          const lyr = viewer.imageryLayers.addImageryProvider(provider);
          lyr.brightness = 1.05; lyr.contrast = 1.05; lyr.saturation = 1.0;
        })
        .catch(async () => {
          if (viewer.isDestroyed() || isCyber) return;
          const fb = await Cesium.ArcGisMapServerImageryProvider.fromUrl(
            'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
          );
          const lyr = viewer.imageryLayers.addImageryProvider(fb);
          lyr.brightness = 1.05; lyr.contrast = 1.05; lyr.saturation = 1.0;
        });

      viewer.scene.light = new Cesium.DirectionalLight({
        direction: new Cesium.Cartesian3(-0.7, -0.5, -0.5),
        color: Cesium.Color.fromCssColorString('#ffffff'),
        intensity: 3.5,
      });
      viewer.scene.ambientColor = new Cesium.Color(0.02, 0.03, 0.05, 1.0);

      if (viewer.scene.globe) {
        viewer.scene.globe.showGroundAtmosphere = true;
        viewer.scene.globe.enableLighting = true;
        viewer.scene.globe.atmosphereLightIntensity = 10.0;
        viewer.scene.globe.atmosphereHueShift = 0.0;
        viewer.scene.globe.atmosphereSaturationShift = 0.0;
        viewer.scene.globe.atmosphereBrightnessShift = 0.08;
      }

      // Clouds
      viewer.entities.add({
        position: Cesium.Cartesian3.ZERO,
        orientation: new Cesium.CallbackProperty(() =>
          Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_Z, timeRef.current * 0.005), false),
        ellipsoid: {
          radii: new Cesium.Cartesian3(6378137 + 15000, 6378137 + 15000, 6378137 + 15000),
          material: new Cesium.ImageMaterialProperty({
            image: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png',
            transparent: true, color: Cesium.Color.WHITE.withAlpha(0.40),
          }),
        },
      });

      citiesRawData.forEach((city) => {
        const isSel = activeCity?.name === city.name;
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(city.lon, city.lat),
          point: {
            pixelSize: isSel ? 6 : 4,
            color: Cesium.Color.WHITE.withAlpha(isSel ? 0.90 : 0.50),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          properties: { cityData: city },
        });
      });
      return;
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  CYBER 2050 MODE — PLANETARY AI OPERATING SYSTEM
    // ══════════════════════════════════════════════════════════════════════════

    // ── AGENT 1: Planet Visual System ─────────────────────────────────────────
    // Globe base
    if (viewer.scene.globe) {
      viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#000508');
      // CRITICAL: showGroundAtmosphere=false eliminates the pink/magenta/orange terminator
      viewer.scene.globe.showGroundAtmosphere = false;
      viewer.scene.globe.enableLighting = true;
      // All shifts at 0 — no hue warping that causes warm/pink tones
      viewer.scene.globe.atmosphereLightIntensity = 4.0;
      viewer.scene.globe.atmosphereHueShift = 0.0;
      viewer.scene.globe.atmosphereSaturationShift = 0.0;
      viewer.scene.globe.atmosphereBrightnessShift = 0.0;
    }

    // Cyber light: very dim so day side stays DARK (not beige/orange)
    // The globe should look like a dark digital sphere, not a natural planet
    viewer.scene.light = new Cesium.DirectionalLight({
      direction: new Cesium.Cartesian3(-0.55, -0.18, -0.82),
      color: Cesium.Color.fromCssColorString('#001A14'), // Dark teal — no warm tones
      intensity: 1.5, // Low: keeps day side dark
    });
    viewer.scene.ambientColor = new Cesium.Color(0.0, 0.02, 0.015, 1.0);

    // ── Holographic atmospheric rim — multiple shells for volumetric depth
    // Outermost: wide cyan halo
    viewer.entities.add({
      position: Cesium.Cartesian3.ZERO,
      ellipsoid: {
        radii: new Cesium.Cartesian3(6378137 + 180000, 6378137 + 180000, 6378137 + 180000),
        material: Cesium.Color.fromCssColorString(C.cyan).withAlpha(0.018),
        fill: true, outline: false,
        shadows: Cesium.ShadowMode.DISABLED,
      },
    });
    // Mid: brighter cyan band
    viewer.entities.add({
      position: Cesium.Cartesian3.ZERO,
      ellipsoid: {
        radii: new Cesium.Cartesian3(6378137 + 90000, 6378137 + 90000, 6378137 + 90000),
        material: Cesium.Color.fromCssColorString(C.cyan).withAlpha(0.042),
        fill: true, outline: false,
        shadows: Cesium.ShadowMode.DISABLED,
      },
    });
    // Inner: emerald data-layer haze right above surface
    viewer.entities.add({
      position: Cesium.Cartesian3.ZERO,
      ellipsoid: {
        radii: new Cesium.Cartesian3(6378137 + 38000, 6378137 + 38000, 6378137 + 38000),
        material: Cesium.Color.fromCssColorString(C.emerald).withAlpha(0.028),
        fill: true, outline: false,
        shadows: Cesium.ShadowMode.DISABLED,
      },
    });
    // Pulse shell — animated breathing glow
    viewer.entities.add({
      position: Cesium.Cartesian3.ZERO,
      ellipsoid: {
        radii: new Cesium.CallbackProperty(() => {
          const pulse = 1.0 + 0.003 * Math.sin(timeRef.current * 0.8);
          const r = (6378137 + 65000) * pulse;
          return new Cesium.Cartesian3(r, r, r);
        }, false),
        material: new Cesium.ColorMaterialProperty(
          new Cesium.CallbackProperty(() =>
            Cesium.Color.fromCssColorString(C.cyan).withAlpha(
              0.020 + 0.012 * Math.sin(timeRef.current * 0.8)
            ), false)
        ),
        fill: true, outline: false,
        shadows: Cesium.ShadowMode.DISABLED,
      },
    });

    // Grid wireframe base (GridImageryProvider)
    viewer.imageryLayers.addImageryProvider(
      new Cesium.GridImageryProvider({
        color: Cesium.Color.fromCssColorString(C.emerald).withAlpha(0.10),
        backgroundColor: Cesium.Color.fromCssColorString('#000508'),
        cells: 72,
        glowColor: Cesium.Color.fromCssColorString(C.cyan).withAlpha(0.04),
        glowWidth: 5,
      })
    );

    // Cyber clouds (translucent cyan-tinted)
    viewer.entities.add({
      position: Cesium.Cartesian3.ZERO,
      orientation: new Cesium.CallbackProperty(() =>
        Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_Z, timeRef.current * 0.003), false),
      ellipsoid: {
        radii: new Cesium.Cartesian3(6378137 + 17000, 6378137 + 17000, 6378137 + 17000),
        material: new Cesium.ImageMaterialProperty({
          image: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png',
          transparent: true,
          color: Cesium.Color.fromCssColorString(C.cyan).withAlpha(0.15),
        }),
      },
    });

    // ── AGENT 8: Performance — Use primitive collections ───────────────────────
    const dotCollection    = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
    const cityLightCol     = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
    const nodeCollection   = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
    const beamCollection   = viewer.scene.primitives.add(new Cesium.PolylineCollection());

    // Animation data stores
    type DotAnim = { phase: number; isLand: boolean };
    type CityLightAnim = { phase: number };
    type BeamAnim = { lat: number; lon: number; maxH: number; speed: number; phase: number; glow: any; core: any };
    type NodeAnim = { phase: number; baseSize: number; tier: number; period?: number };

    const dotAnimData: DotAnim[]      = [];
    const cityLightData: CityLightAnim[] = [];
    const beamAnimData: BeamAnim[]    = [];
    const nodeAnimData: NodeAnim[]    = [];

    // ── AGENT 1 + 2: Dense Dot-Matrix Surface (land + ocean) ─────────────────
    Cesium.GeoJsonDataSource.load(
      'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson',
      { stroke: Cesium.Color.fromCssColorString(C.emerald), fill: Cesium.Color.TRANSPARENT, strokeWidth: 3 }
    ).then((ds: any) => {
      if (viewer.isDestroyed() || !isCyber) return;
      viewer.dataSources.add(ds);

      // Style continent outlines — OPAQUE dark fill to unify the cyber earth look
      ds.entities.values.forEach((e: any) => {
        if (e.polygon) {
          e.polygon.outline = true;
          e.polygon.outlineColor = Cesium.Color.fromCssColorString(C.emerald).withAlpha(0.95);
          e.polygon.outlineWidth = 3.5;
          // Solid dark fill: eliminates any natural terrain color showing through
          e.polygon.material = Cesium.Color.fromCssColorString('#000810').withAlpha(0.96);
        }
      });

      // Rasterize land mask to canvas (high density)
      const W = 720, H = 360;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      ds.entities.values.forEach((e: any) => {
        if (e.polygon) {
          const draw = (hier: any) => {
            const pos = hier.positions;
            if (pos?.length > 0) {
              ctx.beginPath();
              pos.forEach((p: any, i: number) => {
                const cg = Cesium.Cartographic.fromCartesian(p);
                const x = ((Cesium.Math.toDegrees(cg.longitude) + 180) / 360) * W;
                const y = ((90 - Cesium.Math.toDegrees(cg.latitude)) / 180) * H;
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
              });
              ctx.closePath(); ctx.fill();
            }
            hier.holes?.forEach((h: any) => draw(h));
          };
          draw(e.polygon.hierarchy.getValue());
        }
      });

      const imgData = ctx.getImageData(0, 0, W, H).data;
      const landCoords: { lat: number; lon: number }[] = [];

      // AGENT 1: Dense dot matrix — 2px sampling (safe limit for Cesium PointPrimitiveCollection)
      for (let y = 0; y < H; y += 2) {
        for (let x = 0; x < W; x += 2) {
          const idx = (y * W + x) * 4;
          const isLand = imgData[idx] > 120;
          const lon = (x / W) * 360 - 180;
          const lat = 90 - (y / H) * 180;

          if (isLand) {
            landCoords.push({ lat, lon });
            const pt = dotCollection.add({
              position: Cesium.Cartesian3.fromDegrees(lon, lat, 200),
              color: Cesium.Color.fromCssColorString(C.emerald).withAlpha(0.25),
              pixelSize: 1.5,
            });
            dotAnimData.push({ phase: Math.random() * Math.PI * 2, isLand: true });
            (pt as any)._animIdx = dotAnimData.length - 1;
          } else if (Math.random() < 0.06) {
            dotCollection.add({
              position: Cesium.Cartesian3.fromDegrees(lon, lat, 200),
              color: Cesium.Color.fromCssColorString(C.iceBlue).withAlpha(0.08),
              pixelSize: 1.0,
            });
            dotAnimData.push({ phase: Math.random() * Math.PI * 2, isLand: false });
          }
        }
      }

      // AGENT 4: Uplink Beams (150 max — avoids Cesium geometry limits)
      const shuffled = [...landCoords].sort(() => Math.random() - 0.5);
      const numBeams = Math.min(150, shuffled.length);
      for (let i = 0; i < numBeams; i++) {
        const { lat, lon } = shuffled[i];
        const maxH    = 200000 + Math.random() * 1200000;
        const speed   = 1.5 + Math.random() * 4.5;
        const phase   = Math.random() * Math.PI * 2;

        const glow = beamCollection.add({
          positions: [
            Cesium.Cartesian3.fromDegrees(lon, lat, 0),
            Cesium.Cartesian3.fromDegrees(lon, lat, maxH),
          ],
          width: 3.5,
          material: Cesium.Material.fromType('PolylineGlow', {
            color: Cesium.Color.fromCssColorString(C.cyan).withAlpha(0.55),
            glowPower: 0.35,
          }),
        });
        const core = beamCollection.add({
          positions: [
            Cesium.Cartesian3.fromDegrees(lon, lat, 0),
            Cesium.Cartesian3.fromDegrees(lon, lat, maxH),
          ],
          width: 1.0,
          material: Cesium.Material.fromType('Color', { color: Cesium.Color.WHITE }),
        });
        beamAnimData.push({ lat, lon, maxH, speed, phase, glow, core });
      }

    }).catch(() => {});

    // ── AGENT 3: City Lights (dense clusters) ─────────────────────────────────
    // 25 bright light points per city = massive density on night side
    citiesRawData.forEach((city) => {
      for (let k = 0; k < 25; k++) {
        const dlat = (Math.random() - 0.5) * 2.5;
        const dlon = (Math.random() - 0.5) * 2.5;
        const pt = cityLightCol.add({
          position: Cesium.Cartesian3.fromDegrees(city.lon + dlon, city.lat + dlat, 300),
          color:    Cesium.Color.WHITE.withAlpha(0.0),
          pixelSize: 0.0,
        });
        cityLightData.push({ phase: Math.random() * Math.PI * 2 });
        (pt as any)._animIdx = cityLightData.length - 1;
        (pt as any)._city = city;
      }
    });

    // ── AGENT 3: Multi-tier Intelligence Nodes ────────────────────────────────
    // Large AI hubs (tier 3)
    AI_HUBS.forEach((hub) => {
      const isSel = activeCity?.name === hub.name;
      const pt = nodeCollection.add({
        position: Cesium.Cartesian3.fromDegrees(hub.lon, hub.lat, 800),
        color: Cesium.Color.WHITE,
        pixelSize: isSel ? 16 : 12,
        outlineColor: Cesium.Color.fromCssColorString(C.emerald),
        outlineWidth: 2.5,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });
      nodeAnimData.push({
        phase: Math.random() * Math.PI * 2,
        baseSize: isSel ? 16 : 12,
        tier: 3,
        // Each hub gets its own prime-based period: 1.7, 2.1, 2.7, 3.1, 2.4, ...
        period: 1.5 + Math.random() * 1.8,
      });
      (pt as any)._animIdx = nodeAnimData.length - 1;
      (pt as any)._cityRef = hub;
    });

    // Medium city nodes (tier 2)
    citiesRawData.forEach((city) => {
      if (AI_HUBS.some(h => h.name === city.name)) return;
      const isSel = activeCity?.name === city.name;
      const pt = nodeCollection.add({
        position: Cesium.Cartesian3.fromDegrees(city.lon, city.lat, 500),
        color: Cesium.Color.fromCssColorString(C.emerald),
        pixelSize: isSel ? 10 : 7,
        outlineColor: Cesium.Color.fromCssColorString(C.cyan),
        outlineWidth: 1.5,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });
      nodeAnimData.push({
        phase: Math.random() * Math.PI * 2,
        baseSize: isSel ? 10 : 7,
        tier: 2,
        period: 1.8 + Math.random() * 2.2,
      });
      (pt as any)._animIdx = nodeAnimData.length - 1;
      (pt as any)._cityRef = city;
    });

    // Small telemetry stations (tier 1) — randomly distributed
    const telemetryCoords = [
      { lat: 60.0, lon: -100 }, { lat: 55.0, lon: 80 }, { lat: -15.0, lon: 30 },
      { lat: 0.0,  lon: -60 },  { lat: 45.0, lon: 120}, { lat: -30.0, lon: -65 },
      { lat: 20.0, lon: -20 },  { lat: 35.0, lon: 100}, { lat: -45.0, lon: 170 },
      { lat: 70.0, lon:  30 },  { lat: 10.0, lon: 50 }, { lat: -20.0, lon: -40 },
      { lat: 50.0, lon: -80 },  { lat: 25.0, lon: 85 }, { lat: -5.0,  lon: 115 },
      { lat: 65.0, lon: 160 },  { lat: -55.0, lon: -65 }, { lat: 30.0, lon: 45 },
      { lat: 15.0, lon: -90 },  { lat: 40.0, lon: 65 },
    ];
    telemetryCoords.forEach(({ lat, lon }) => {
      const pt = nodeCollection.add({
        position: Cesium.Cartesian3.fromDegrees(lon, lat, 300),
        color: Cesium.Color.fromCssColorString(C.iceBlue).withAlpha(0.75),
        pixelSize: 4,
        outlineColor: Cesium.Color.fromCssColorString(C.cyan).withAlpha(0.40),
        outlineWidth: 1.0,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });
      nodeAnimData.push({
        phase: Math.random() * Math.PI * 2,
        baseSize: 4,
        tier: 1,
        period: 2.2 + Math.random() * 3.0,
      });
      (pt as any)._animIdx = nodeAnimData.length - 1;
    });

    // ── AGENT 5: Geodesic Highways + Packet Flow ──────────────────────────────
    HIGHWAYS.forEach((hw) => {
      const ca = hubCoord(hw.a);
      const cb = hubCoord(hw.b);
      if (!ca || !cb) return;

      // Highway glow line (entities — needed for CallbackProperty)
      // Highway: ultra-thin, almost invisible — supports network visually, never dominates
      viewer.entities.add({
        polyline: {
          positions: geodesicArc(ca, cb, hw.alt),
          width: 0.8,
          material: Cesium.Color.fromCssColorString(C.emerald).withAlpha(0.18),
        },
      });

      // Static breathing nodes along the route (replace moving packets)
      // Each node has its own unique async pulse period — they never pulse together
      const nodePositions = [0.20, 0.40, 0.60, 0.80]; // fixed fractions along route
      const sR2 = Cesium.Cartographic.fromDegrees(ca!.lon, ca!.lat);
      const eR2 = Cesium.Cartographic.fromDegrees(cb!.lon, cb!.lat);
      const geo2 = new Cesium.EllipsoidGeodesic(sR2, eR2);
      nodePositions.forEach((frac, ni) => {
        const pt2   = geo2.interpolateUsingFraction(frac);
        const h2    = Math.sin(frac * Math.PI) * hw.alt;
        const pos3d = Cesium.Cartesian3.fromRadians(pt2.longitude, pt2.latitude, h2);
        // Unique prime-based pulse period so no two nodes pulse at the same time
        const pulsePhase  = (ni * 1.618 + hw.alt * 0.000003) % (Math.PI * 2);
        const pulsePeriod = 1.4 + ni * 0.85; // 1.4 / 2.25 / 3.1 / 3.95 seconds

        const routeNode = nodeCollection.add({
          position: pos3d,
          color: Cesium.Color.fromCssColorString(C.cyan).withAlpha(0.70),
          pixelSize: 4,
          outlineColor: Cesium.Color.fromCssColorString(C.emerald).withAlpha(0.50),
          outlineWidth: 1.0,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        });
        nodeAnimData.push({ phase: pulsePhase, baseSize: 4, tier: 0, period: pulsePeriod });
        (routeNode as any)._animIdx = nodeAnimData.length - 1;
      });
    });

    // ── AGENT 7: Hub Concentric Scan Rings ────────────────────────────────────
    AI_HUBS.slice(0, 10).forEach((hub) => {
      // 3 rings per hub, offset phases
      for (let ring = 0; ring < 3; ring++) {
        const ringOffset = ring / 3;
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(hub.lon, hub.lat, 5000),
          ellipse: {
            semiMajorAxis: new Cesium.CallbackProperty(() => {
              const age = ((timeRef.current * 0.4) + ringOffset) % 1.0;
              return 300000 * age;
            }, false),
            semiMinorAxis: new Cesium.CallbackProperty(() => {
              const age = ((timeRef.current * 0.4) + ringOffset) % 1.0;
              return 300000 * age;
            }, false),
            material: new Cesium.ColorMaterialProperty(
              new Cesium.CallbackProperty(() => {
                const age = ((timeRef.current * 0.4) + ringOffset) % 1.0;
                return Cesium.Color.fromCssColorString(C.emerald).withAlpha(0.30 * (1.0 - age));
              }, false)
            ),
            outline: true,
            outlineColor: new Cesium.CallbackProperty(() => {
              const age = ((timeRef.current * 0.4) + ringOffset) % 1.0;
              return Cesium.Color.fromCssColorString(C.cyan).withAlpha(0.55 * (1.0 - age));
            }, false),
            outlineWidth: 1.5,
          },
        });
      }
    });

    // ── MAJOR HUB BLOOM — 6 primary hubs emit strong environmental light ───────
    const BLOOM_HUBS = [
      { name: 'Tokyo',    lat: 35.6762, lon: 139.6503, r: 420000, color: C.cyan   },
      { name: 'Seoul',    lat: 37.5665, lon: 126.9780, r: 380000, color: C.cyan   },
      { name: 'Singapore',lat:  1.3521, lon: 103.8198, r: 360000, color: C.emerald},
      { name: 'Dubai',    lat: 25.2048, lon:  55.2708, r: 340000, color: C.emerald},
      { name: 'London',   lat: 51.5074, lon:  -0.1278, r: 400000, color: C.iceBlue},
      { name: 'New York', lat: 40.7128, lon: -74.0060, r: 420000, color: C.iceBlue},
    ];
    BLOOM_HUBS.forEach((hub, hi) => {
      const bloomPhase = hi * 1.047; // 60° offset each hub
      // Outer wide bloom
      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(hub.lon, hub.lat, 12000),
        ellipse: {
          semiMajorAxis: new Cesium.CallbackProperty(() =>
            hub.r * (1.0 + 0.06 * Math.sin(timeRef.current * (0.55 + hi * 0.07) + bloomPhase)), false),
          semiMinorAxis: new Cesium.CallbackProperty(() =>
            hub.r * (1.0 + 0.06 * Math.sin(timeRef.current * (0.55 + hi * 0.07) + bloomPhase)), false),
          material: new Cesium.ColorMaterialProperty(
            new Cesium.CallbackProperty(() =>
              Cesium.Color.fromCssColorString(hub.color).withAlpha(
                0.055 + 0.035 * Math.sin(timeRef.current * (0.55 + hi * 0.07) + bloomPhase)
              ), false)
          ),
          outline: false,
          heightReference: Cesium.HeightReference.NONE,
        },
      });
      // Inner bright core bloom
      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(hub.lon, hub.lat, 8000),
        ellipse: {
          semiMajorAxis: new Cesium.CallbackProperty(() =>
            hub.r * 0.30 * (1.0 + 0.10 * Math.sin(timeRef.current * (0.80 + hi * 0.09) + bloomPhase)), false),
          semiMinorAxis: new Cesium.CallbackProperty(() =>
            hub.r * 0.30 * (1.0 + 0.10 * Math.sin(timeRef.current * (0.80 + hi * 0.09) + bloomPhase)), false),
          material: new Cesium.ColorMaterialProperty(
            new Cesium.CallbackProperty(() =>
              Cesium.Color.fromCssColorString(hub.color).withAlpha(
                0.12 + 0.07 * Math.sin(timeRef.current * (0.80 + hi * 0.09) + bloomPhase)
              ), false)
          ),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString(hub.color).withAlpha(0.40),
          outlineWidth: 1.0,
          heightReference: Cesium.HeightReference.NONE,
        },
      });
    });

    // ── AGENT 7: Global Radar Sweep (rotating scan arc) ───────────────────────
    // Rotating scan arc from Beijing and New York hubs
    const sweepHubs = [
      { lat: 39.9042, lon: 116.4074 },
      { lat: 40.7128, lon: -74.0060 },
      { lat: 1.3521,  lon: 103.8198 },
    ];
    sweepHubs.forEach((sh) => {
      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(sh.lon, sh.lat, 0),
        ellipse: {
          semiMajorAxis: new Cesium.CallbackProperty(() => {
            return 1800000 + 200000 * Math.sin(timeRef.current * 0.7);
          }, false),
          semiMinorAxis: new Cesium.CallbackProperty(() => {
            return 1800000 + 200000 * Math.sin(timeRef.current * 0.7);
          }, false),
          material: Cesium.Color.TRANSPARENT,
          outline: true,
          outlineColor: new Cesium.CallbackProperty(() => {
            return Cesium.Color.fromCssColorString(C.cyan).withAlpha(
              0.08 + 0.05 * Math.sin(timeRef.current * 1.4)
            );
          }, false),
          outlineWidth: 1.0,
        },
      });

      // Rotating sector wedge
      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(sh.lon, sh.lat, 0),
        ellipse: {
          semiMajorAxis: 1600000,
          semiMinorAxis: 1600000,
          startAngle: new Cesium.CallbackProperty(() =>
            Cesium.Math.toRadians((timeRef.current * 25) % 360), false),
          stopAngle: new Cesium.CallbackProperty(() =>
            Cesium.Math.toRadians((timeRef.current * 25 + 60) % 360), false),
          material: Cesium.Color.fromCssColorString(C.emerald).withAlpha(0.04),
          outline: false,
        },
      });
    });

    // ── AGENT 6: Orbital Infrastructure ──────────────────────────────────────
    ORBITAL_SHELLS.forEach((shell, shIdx) => {
      const R = shell.radius;
      const { tiltX, tiltY } = shell;

      // Orbital ring track
      const ringPts = Array.from({ length: 181 }, (_, i) => {
        const a = (i / 180) * Math.PI * 2;
        const { x, y, z } = rotateXY(R * Math.cos(a), R * Math.sin(a), 0, tiltX, tiltY);
        return new Cesium.Cartesian3(x, y, z);
      });
      viewer.entities.add({
        polyline: {
          positions: ringPts,
          width: shIdx === 0 ? 1.5 : 1.0,
          material: Cesium.Color.fromCssColorString(shell.color).withAlpha(
            shIdx === 0 ? 0.22 : shIdx === 1 ? 0.16 : 0.12
          ),
        },
      });

      // Satellite swarms
      for (let s = 0; s < shell.sats; s++) {
        const phase0 = (s / shell.sats) * Math.PI * 2;
        const speed  = shell.speed;
        const color  = shell.color;
        const trail  = shell.trailLen;

        // Satellite point
        viewer.entities.add({
          position: new Cesium.CallbackProperty(() => {
            const a = (timeRef.current * speed + phase0) % (Math.PI * 2);
            const { x, y, z } = rotateXY(R * Math.cos(a), R * Math.sin(a), 0, tiltX, tiltY);
            return new Cesium.Cartesian3(x, y, z);
          }, false),
          point: {
            pixelSize: shIdx === 0 ? 5 : shIdx === 1 ? 4 : shIdx === 2 ? 5 : 3,
            color: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.fromCssColorString(color),
            outlineWidth: 1.5,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        });

        // Satellite trail: use a static arc segment instead of CallbackProperty polyline
        // (CallbackProperty polylines trigger Cesium's rhumb-line subdivider and crash)
        // Trail effect is achieved via the point outline + lower opacity color
      }

      // GEO communication bursts
      if (shIdx === 2) {
        for (let s = 0; s < shell.sats; s++) {
          const phase0 = (s / shell.sats) * Math.PI * 2;
          viewer.entities.add({
            position: new Cesium.CallbackProperty(() => {
              const a = (timeRef.current * shell.speed + phase0) % (Math.PI * 2);
              const { x, y, z } = rotateXY(R * Math.cos(a), R * Math.sin(a), 0, tiltX, tiltY);
              return new Cesium.Cartesian3(x, y, z);
            }, false),
            ellipse: {
              semiMajorAxis: new Cesium.CallbackProperty(() =>
                280000 + 50000 * Math.sin(timeRef.current * 2.0 + phase0), false),
              semiMinorAxis: new Cesium.CallbackProperty(() =>
                280000 + 50000 * Math.sin(timeRef.current * 2.0 + phase0), false),
              material: Cesium.Color.fromCssColorString(shell.color).withAlpha(0.06),
              outline: true,
              outlineColor: Cesium.Color.fromCssColorString(shell.color).withAlpha(0.35),
              outlineWidth: 1.0,
            },
          });
        }
      }
    });

    // ── AGENT 2 + 4: Unified Animation Loop ───────────────────────────────────
    let frameCount = 0;
    const animate = () => {
      if (viewer.isDestroyed() || !isCyber) return;

      const lightDir = viewer.scene.light?.direction;
      if (!lightDir) return;

      const time = timeRef.current;
      frameCount++;

      // Only update dot matrix every 3rd frame (100k+ dots: performance)
      if (frameCount % 3 === 0) {
        const numDots = dotCollection.length;
        for (let i = 0; i < numDots; i++) {
          const pt   = dotCollection.get(i);
          if (!pt) continue;
          const anim = dotAnimData[i];
          if (!anim) continue;

          const pos    = pt.position;
          const normal = Cesium.Cartesian3.normalize(pos, new Cesium.Cartesian3());
          const dot    = Cesium.Cartesian3.dot(normal, lightDir);
          const tw     = 0.80 + 0.20 * Math.sin(time * 3.0 + anim.phase);

          if (anim.isLand) {
            if (dot < -0.1) {
              // Day side land — dim cyan digital mesh
              pt.color    = Cesium.Color.fromCssColorString(C.iceBlue).withAlpha(0.18 * tw);
              pt.pixelSize = 1.4;
            } else if (dot > 0.1) {
              // Night side land — glowing emerald AI nodes
              pt.color    = Cesium.Color.fromCssColorString(C.emerald).withAlpha(0.82 * tw);
              pt.pixelSize = 2.8;
            } else {
              // Terminator: lerp ONLY between cyan colors — no pink
              const f = (dot + 0.1) / 0.2;
              pt.color    = Cesium.Color.lerp(
                Cesium.Color.fromCssColorString(C.iceBlue).withAlpha(0.18),
                Cesium.Color.fromCssColorString(C.emerald).withAlpha(0.82),
                f, new Cesium.Color()
              );
              pt.pixelSize = 1.4 + 1.4 * f;
            }
          } else {
            // Ocean points: always dim iceblue
            if (dot > 0.05) {
              pt.color    = Cesium.Color.fromCssColorString(C.iceBlue).withAlpha(0.22 * tw);
              pt.pixelSize = 1.0;
            } else {
              pt.color    = Cesium.Color.fromCssColorString(C.spaceBg).withAlpha(0.05);
              pt.pixelSize = 0.7;
            }
          }
        }
      } // end dot frame-skip
      // City lights: bright on night side
      const numCL = cityLightCol.length;
      for (let i = 0; i < numCL; i++) {
        const pt   = cityLightCol.get(i);
        if (!pt) continue;
        const anim = cityLightData[i];
        if (!anim) continue;

        const pos    = pt.position;
        const normal = Cesium.Cartesian3.normalize(pos, new Cesium.Cartesian3());
        const dot    = Cesium.Cartesian3.dot(normal, lightDir);
        const pulse  = 0.70 + 0.30 * Math.sin(time * 5.0 + anim.phase);

        if (dot > 0.05) {
          // Night side — brilliant city lights
          const brightness = (dot > 0.4 ? 1.0 : dot / 0.4) * pulse;
          pt.color    = Cesium.Color.WHITE.withAlpha(0.88 * brightness);
          pt.pixelSize = 2.5 + 2.0 * pulse;
        } else if (dot > -0.05) {
          // Terminator transition
          const f = (dot + 0.05) / 0.10;
          pt.color    = Cesium.Color.WHITE.withAlpha(0.88 * f * pulse);
          pt.pixelSize = (2.5 + 2.0 * pulse) * f;
        } else {
          // Day side — dim/off
          pt.color    = Cesium.Color.fromCssColorString(C.iceBlue).withAlpha(0.06);
          pt.pixelSize = 1.0;
        }
      }

      // Intelligence nodes: independent pulsing
      const numNodes = nodeCollection.length;
      for (let i = 0; i < numNodes; i++) {
        const pt   = nodeCollection.get(i);
        if (!pt) continue;
        const anim = nodeAnimData[i];
        if (!anim) continue;

        // Each node uses its own period for fully asynchronous breathing
        const freq  = anim.period ? (Math.PI * 2) / anim.period : (1.5 + anim.tier * 0.5);
        const pulse = 0.70 + 0.30 * Math.sin(time * freq + anim.phase);

        if (anim.tier === 3) {
          // Major AI Hub — white core, strong emerald outline
          pt.pixelSize = anim.baseSize * (0.85 + 0.15 * pulse);
          pt.color     = Cesium.Color.WHITE.withAlpha(0.92 * pulse);
        } else if (anim.tier === 2) {
          // City node — emerald breathing
          pt.pixelSize = anim.baseSize * pulse;
          pt.color     = Cesium.Color.fromCssColorString(C.emerald).withAlpha(0.82 * pulse);
        } else if (anim.tier === 1) {
          // Telemetry station — slow cyan blink
          pt.pixelSize = anim.baseSize * pulse;
          pt.color     = Cesium.Color.fromCssColorString(C.iceBlue).withAlpha(0.62 * pulse);
        } else {
          // Route relay node (tier 0) — very small, faint cyan pulse
          // Uses its own unique period so it never pulses with neighbors
          pt.pixelSize = anim.baseSize * (0.60 + 0.40 * pulse);
          pt.color     = Cesium.Color.fromCssColorString(C.cyan).withAlpha(0.55 * pulse);
        }
      }

      // Uplink beams: flickering height + intensity
      const numBeams = beamAnimData.length;
      for (let i = 0; i < numBeams; i++) {
        const b = beamAnimData[i];
        const pos    = Cesium.Cartesian3.fromDegrees(b.lon, b.lat, 0);
        const normal = Cesium.Cartesian3.normalize(pos, new Cesium.Cartesian3());
        const dot    = Cesium.Cartesian3.dot(normal, lightDir);
        const flicker = Math.sin(time * b.speed * 3.5 + b.phase);
        const hFactor = 0.75 + 0.25 * flicker;
        const curH   = b.maxH * hFactor;

        b.glow.positions = [
          Cesium.Cartesian3.fromDegrees(b.lon, b.lat, 0),
          Cesium.Cartesian3.fromDegrees(b.lon, b.lat, curH),
        ];
        b.core.positions = b.glow.positions;

        if (dot > -0.15) {
          // Night/terminator side — active beams
          const intensity = Math.min(1.0, (dot + 0.15) / 0.40);
          const gw = (5.0 + 3.5 * Math.abs(flicker)) * intensity;
          b.glow.width = gw;
          b.core.width = (1.2 + 0.6 * Math.abs(flicker)) * intensity;
          b.glow.material.uniforms.color = Cesium.Color.fromCssColorString(C.cyan).withAlpha(0.65 * intensity);
          b.core.material.uniforms.color = Cesium.Color.WHITE.withAlpha(0.90 * intensity);
        } else {
          // Day side — inactive
          b.glow.width = 0; b.core.width = 0;
          b.glow.material.uniforms.color = Cesium.Color.TRANSPARENT;
          b.core.material.uniforms.color = Cesium.Color.TRANSPARENT;
        }
      }
    };

    removeRenderListener = viewer.scene.postRender.addEventListener(animate);

    return () => {
      if (removeRenderListener) removeRenderListener();
    };

  }, [isGlobeReady, activeYear, activeCategory, activeCity, overlays, earthMode]);

  // ─── Camera: fly to active city ────────────────────────────────────────────
  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current || !activeCity) return;
    const viewer = viewerRef.current;
    if (viewer.isDestroyed()) return;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(activeCity.lon, activeCity.lat - 1.0, 1200000),
      duration: 3.0,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
    });
  }, [activeCity, isGlobeReady]);

  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current || activeCity) return;
    const viewer = viewerRef.current;
    if (viewer.isDestroyed()) return;
    const targets: Record<string, [number, number, number]> = {
      'Ocean Monitoring':   [-18.3,  147.7, 2200000],
      'Biodiversity':       [ -3.5,  -62.2, 2800000],
      'Clean Energy':       [ 24.0,   12.0, 3200000],
      'Satellite Network':  [ 25.0,  -45.0, 16000000],
    };
    const [lat, lon, height] = targets[activeCategory] ?? [0, 0, 18000000];
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
      duration: 3.5,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
    });
  }, [activeCategory, activeCity, isGlobeReady]);

  // ─── Hover tracker ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current) return;
    const viewer = viewerRef.current;
    const update = () => {
      if (viewer.isDestroyed()) return;
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

  // ─── Auto-rotation ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (isInteracting || activeCity || !isGlobeReady) return;
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;
    if (viewer.isDestroyed()) return;
    let last = Date.now();
    const speed = 0.012;
    const spin = () => {
      if (!viewerRef.current) return;
      const v = viewerRef.current;
      if (v.isDestroyed() || !v.scene?.camera) return;
      const now = Date.now(); const dt = (now - last) / 1000; last = now;
      v.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, speed * dt);
    };
    let remove: (() => void) | undefined;
    const t = setTimeout(() => {
      const v = viewerRef.current;
      if (!v || v.isDestroyed()) return;
      remove = v.scene.postRender.addEventListener(spin);
    }, 1500);
    return () => { clearTimeout(t); if (remove) try { remove(); } catch(e){} };
  }, [isInteracting, activeCity, isGlobeReady]);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="absolute inset-0 w-screen h-screen bg-transparent z-0 overflow-hidden"
      onMouseDown={() => setIsInteracting(true)}   onMouseUp={() => setIsInteracting(false)}
      onTouchStart={() => setIsInteracting(true)}  onTouchEnd={() => setIsInteracting(false)}
    >
      <div ref={containerRef} className="w-full h-full" />

      {/* Hover Card */}
      {hoveredCity && hoverPos && (
        <div className="absolute pointer-events-none select-none z-50"
          style={{ left: `${hoverPos.x + 16}px`, top: `${hoverPos.y - 50}px` }}>
          {isCyber ? (
            <div style={{
              padding: '8px 14px',
              background: 'rgba(0,8,20,0.95)',
              backdropFilter: 'blur(24px)',
              border: `1px solid ${C.cyan}55`,
              borderRadius: '2px',
              boxShadow: `0 0 24px ${C.cyan}30, inset 0 0 12px ${C.cyan}08`,
            }}>
              <div style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.28em', color: C.cyan,
                textTransform: 'uppercase', textShadow: `0 0 12px ${C.cyan}90`, marginBottom: '4px' }}>
                {hoveredCity.name}
              </div>
              <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.40)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                {hoveredCity.lat.toFixed(4)}° N · {hoveredCity.lon.toFixed(4)}° E
              </div>
              <div style={{ marginTop: '3px', fontSize: '7px', color: `${C.emerald}c0`, fontFamily: 'monospace', letterSpacing: '0.18em' }}>
                {hoveredCity.country.toUpperCase()} · AI NODE ONLINE
              </div>
              <div style={{
                marginTop: '4px', height: '1px',
                background: `linear-gradient(90deg, ${C.cyan}80, transparent)`,
              }} />
              <div style={{ marginTop: '3px', fontSize: '6px', color: `${C.iceBlue}80`, fontFamily: 'monospace', letterSpacing: '0.2em' }}>
                ORBITAL LINK ACTIVE
              </div>
            </div>
          ) : (
            <div style={{
              padding: '6px 10px',
              background: 'rgba(3,5,10,0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '2px',
            }}>
              <div style={{ fontSize: '9px', fontWeight: 300, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.88)', textTransform: 'uppercase' }}>
                {hoveredCity.name}
              </div>
              <div style={{ marginTop: '2px', fontSize: '7px', fontWeight: 200, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.38)' }}>
                {hoveredCity.lat.toFixed(2)}° N &nbsp; {hoveredCity.lon.toFixed(2)}° E
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading screen */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center z-50 transition-opacity duration-1000 ${isGlobeReady ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        style={{ background: '#020608' }}>
        {isCyber ? (
          <>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              border: `1px solid ${C.cyan}35`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 30px ${C.cyan}15`,
              animation: 'breathe 2s ease-in-out infinite',
            }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', border: `1px dashed ${C.emerald}25`, animation: 'spin 6s linear infinite' }} />
            </div>
            <p style={{ marginTop: 20, fontSize: 8, fontWeight: 300, letterSpacing: '0.5em', textTransform: 'uppercase', color: `${C.cyan}70`, fontFamily: 'monospace' }}>
              Initializing Planet OS
            </p>
            <p style={{ marginTop: 6, fontSize: 7, letterSpacing: '0.3em', color: `${C.emerald}50`, fontFamily: 'monospace' }}>
              Loading AI Infrastructure
            </p>
          </>
        ) : (
          <>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'breathe 2.5s ease-in-out infinite',
            }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', border: '1px dashed rgba(255,255,255,0.07)', animation: 'spin 10s linear infinite' }} />
            </div>
            <p style={{ marginTop: 16, fontSize: 8, fontWeight: 300, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)' }}>
              Initializing Earth
            </p>
          </>
        )}
      </div>
    </div>
  );
}
