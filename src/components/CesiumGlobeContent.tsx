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
  emerald: '#00F5B0',
  cyan: '#00D98F',
  iceBlue: '#00D98F',
  white: '#FFFFFF',
  spaceBg:  '#02060A',
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

const MAJOR_HUBS = [
  { name: 'New York',   lat:  40.7128, lon:  -74.0060, color: '#00F5B0' },
  { name: 'London',     lat:  51.5074, lon:   -0.1278, color: '#00D98F' },
  { name: 'Dubai',      lat:  25.2048, lon:   55.2708, color: '#00F5B0' },
  { name: 'Mumbai',     lat:  19.0760, lon:   72.8777, color: '#00F5B0' },
  { name: 'Singapore',  lat:   1.3521, lon:  103.8198, color: '#00F5B0' },
  { name: 'Tokyo',      lat:  35.6762, lon:  139.6503, color: '#00F5B0' },
  { name: 'Seoul',      lat:  37.5665, lon:  126.9780, color: '#00F5B0' },
  { name: 'Sydney',     lat: -33.8688, lon:  151.2093, color: '#00D98F' },
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
  { name: 'LEO',   radius: 6378137 + 550000,   tiltX: 0.42, tiltY: 0.18, color: C.cyan,    sats: 12, speed: 0.045 },
  { name: 'MEO',   radius: 6378137 + 3200000,  tiltX: -0.52,tiltY: 0.35, color: C.iceBlue, sats: 8,  speed: 0.022 },
  { name: 'GEO',   radius: 6378137 + 10000000, tiltX: 0.0,  tiltY: 0.0,  color: C.emerald, sats: 5,  speed: 0.008 },
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
      destination: Cesium.Cartesian3.fromDegrees(20.0, 10.0, 12500000),
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
      if (Cesium.defined(picked)) {
        if (picked.id?.properties?.cityData) {
          setActiveCity(picked.id.properties.cityData.getValue());
        } else if (picked.primitive?._cityRef) {
          setActiveCity(picked.primitive._cityRef);
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.setInputAction((mv: any) => {
      const picked = viewer.scene.pick(mv.endPosition);
      if (Cesium.defined(picked)) {
        if (picked.id?.properties?.cityData) {
          setHoveredCity(picked.id.properties.cityData.getValue());
        } else if (picked.primitive?._cityRef) {
          setHoveredCity(picked.primitive._cityRef);
        } else {
          setHoveredCity(null);
        }
      } else {
        setHoveredCity(null);
      }
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

    // Set black/very dark base globe
    if (viewer.scene.globe) {
      viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#02060A'); // deep dark space-blue
      viewer.scene.globe.showGroundAtmosphere = false; // removes pink terminator
      viewer.scene.globe.enableLighting = true;
      viewer.scene.globe.atmosphereLightIntensity = 0.0; // disable default atmosphere lighting to use our shells
    }

    // Set dark space ambient and directional lights
    viewer.scene.light = new Cesium.DirectionalLight({
      direction: new Cesium.Cartesian3(-0.55, -0.18, -0.82),
      color: Cesium.Color.fromCssColorString('#001A0E'), // Dark green
      intensity: 1.5, // breathing will animate this
    });
    viewer.scene.ambientColor = new Cesium.Color(0.0, 0.02, 0.0, 1.0);

    // Volumetric Atmospheric Limb (4 layers + outer breathing layer)
    const atmosphereShells = [
      { r: 6378137 + 180000, color: C.cyan, alpha: 0.015 },
      { r: 6378137 + 110000, color: C.cyan, alpha: 0.035 },
      { r: 6378137 + 60000,  color: C.iceBlue, alpha: 0.055 },
      { r: 6378137 + 25000,  color: C.iceBlue, alpha: 0.085 },
    ];
    atmosphereShells.forEach((shell) => {
      viewer.entities.add({
        position: Cesium.Cartesian3.ZERO,
        ellipsoid: {
          radii: new Cesium.Cartesian3(shell.r, shell.r, shell.r),
          material: Cesium.Color.fromCssColorString(shell.color).withAlpha(shell.alpha),
          fill: true,
          outline: false,
        },
      });
    });

    // Breathing atmosphere shell
    viewer.entities.add({
      position: Cesium.Cartesian3.ZERO,
      ellipsoid: {
        radii: new Cesium.CallbackProperty(() => {
          const pulse = 1.0 + 0.0025 * Math.sin(timeRef.current * 0.6);
          const r = (6378137 + 45000) * pulse;
          return new Cesium.Cartesian3(r, r, r);
        }, false),
        material: new Cesium.ColorMaterialProperty(
          new Cesium.CallbackProperty(() =>
            Cesium.Color.fromCssColorString(C.cyan).withAlpha(
              0.03 + 0.02 * Math.sin(timeRef.current * 0.6)
            ), false)
        ),
        fill: true,
        outline: false,
      },
    });

    // Enable Depth & Bloom & Fog
    if (viewer.scene.postProcessStages && viewer.scene.postProcessStages.bloom) {
      viewer.scene.postProcessStages.bloom.enabled = true;
      viewer.scene.postProcessStages.bloom.uniforms.glowOnly = false;
      viewer.scene.postProcessStages.bloom.uniforms.contrast = 120.0;
      viewer.scene.postProcessStages.bloom.uniforms.brightness = -0.25;
      viewer.scene.postProcessStages.bloom.uniforms.delta = 1.0;
      viewer.scene.postProcessStages.bloom.uniforms.sigma = 2.0;
      viewer.scene.postProcessStages.bloom.uniforms.stepSize = 1.0;
    }
    if (viewer.scene.fog) {
      viewer.scene.fog.enabled = true;
      viewer.scene.fog.density = 2.5e-4;
      viewer.scene.fog.screenSpaceLinearDiscardDistance = 1.0e8;
    }

    // Primitive collections for high-performance rendering
    const dotCollection        = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
    const staticNodeCollection = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
    const mainNodeCollection   = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
    const beamCollection       = viewer.scene.primitives.add(new Cesium.PolylineCollection());
    const scanRingCollection   = viewer.scene.primitives.add(new Cesium.PolylineCollection());

    // Structs for animation values
    type DotAnim = {
      phase: number;
      isLand: boolean;
      nx: number;
      ny: number;
      nz: number;
      hubProximity: number;
    };
    type StaticNodeAnim = { phase: number; period: number; baseSize: number; color: any; baseAlpha: number };
    type MainNodeAnim = { phase: number; period: number; baseSize: number; tier: number; color: any };
    type BeamAnim = { lat: number; lon: number; maxH: number; speed: number; phase: number; glow: any; core: any };

    const dotAnimData: DotAnim[] = [];
    const staticNodeAnimData: StaticNodeAnim[] = [];
    const mainNodeAnimData: MainNodeAnim[] = [];
    const beamAnimData: BeamAnim[] = [];

    // Helper: Draw high-precision neon outlines
    function addHierarchyLines(v: any, hierarchy: any, color: any, height: number) {
      if (!hierarchy) return;
      const positions = hierarchy.positions;
      if (positions && positions.length > 1) {
        const adjustedPositions = positions.map((p: any) => {
          const cart = Cesium.Cartographic.fromCartesian(p);
          return Cesium.Cartesian3.fromRadians(cart.longitude, cart.latitude, height);
        });
        adjustedPositions.push(adjustedPositions[0]); // close the outline loop
        v.entities.add({
          polyline: {
            positions: adjustedPositions,
            width: 1.0, // clean thin lines
            material: color,
          }
        });
      }
      if (hierarchy.holes) {
        hierarchy.holes.forEach((hole: any) => addHierarchyLines(v, hole, color, height));
      }
    }

    // Load land GeoJSON
    Cesium.GeoJsonDataSource.load(
      'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson',
      { stroke: Cesium.Color.TRANSPARENT, fill: Cesium.Color.TRANSPARENT }
    ).then((ds: any) => {
      if (viewer.isDestroyed() || !isCyber) return;
      viewer.dataSources.add(ds);

      const neonColor = Cesium.Color.fromCssColorString('#00F5B0').withAlpha(0.85);

      ds.entities.values.forEach((e: any) => {
        if (e.polygon) {
          e.polygon.outline = false;
          // Dark space-blue solid continent fill
          e.polygon.material = Cesium.Color.fromCssColorString('#040B12').withAlpha(0.96);

          // Add neon outline as polylines
          const hierarchy = e.polygon.hierarchy ? e.polygon.hierarchy.getValue() : null;
          if (hierarchy) {
            addHierarchyLines(viewer, hierarchy, neonColor, 4000); // float outlines at 4km
          }
        }
      });

      // Rasterize land mask to canvas for procedural mapping
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
              pos.forEach((p: any, idx: number) => {
                const cg = Cesium.Cartographic.fromCartesian(p);
                const x = ((Cesium.Math.toDegrees(cg.longitude) + 180) / 360) * W;
                const y = ((90 - Cesium.Math.toDegrees(cg.latitude)) / 180) * H;
                idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
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

      // Generate dense wrap-around dot-matrix surface
      for (let y = 0; y < H; y += 4) {
        for (let x = 0; x < W; x += 4) {
          const idx = (y * W + x) * 4;
          const isLand = imgData[idx] > 120;
          const lon = (x / W) * 360 - 180;
          const lat = 90 - (y / H) * 180;

          const radLat = Cesium.Math.toRadians(lat);
          const radLon = Cesium.Math.toRadians(lon);

          // Precompute normal vectors
          const cosLat = Math.cos(radLat);
          const nx = cosLat * Math.cos(radLon);
          const ny = cosLat * Math.sin(radLon);
          const nz = Math.sin(radLat);

          // Precompute proximity to the 8 Major Hubs
          let hubProximity = 0.0;
          MAJOR_HUBS.forEach((hub) => {
            const hLat = Cesium.Math.toRadians(hub.lat);
            const hLon = Cesium.Math.toRadians(hub.lon);
            const dLon = hLon - radLon;
            const cosAngle = Math.sin(radLat) * Math.sin(hLat) + Math.cos(radLat) * Math.cos(hLat) * Math.cos(dLon);
            const angle = Math.acos(Math.max(-1.0, Math.min(1.0, cosAngle)));
            const decay = 0.35; // ~20 degrees influence
            if (angle < decay) {
              const factor = 1.0 - angle / decay;
              hubProximity += factor * factor; // quad curve for tighter bloom focus
            }
          });

          if (isLand) {
            landCoords.push({ lat, lon });
            dotCollection.add({
              position: Cesium.Cartesian3.fromDegrees(lon, lat, 2000), // 2km
              color: Cesium.Color.fromCssColorString('#00F5B0').withAlpha(0.20),
              pixelSize: 1.2,
            });
            dotAnimData.push({
              phase: Math.random() * Math.PI * 2,
              isLand: true,
              nx, ny, nz,
              hubProximity,
            });
          } else if (Math.random() < 0.04) {
            // Sparse ocean dots
            dotCollection.add({
              position: Cesium.Cartesian3.fromDegrees(lon, lat, 2000),
              color: Cesium.Color.fromCssColorString(C.iceBlue).withAlpha(0.04),
              pixelSize: 0.8,
            });
            dotAnimData.push({
              phase: Math.random() * Math.PI * 2,
              isLand: false,
              nx, ny, nz,
              hubProximity: 0.0,
            });
          }
        }
      }

      // Generate static global nodes
      const numStaticNodes = 500;
      for (let i = 0; i < numStaticNodes; i++) {
        const lat = (Math.random() - 0.5) * 140; // -70 to 70
        const lon = (Math.random() - 0.5) * 360;

        const cx = Math.floor(((lon + 180) / 360) * W);
        const cy = Math.floor(((90 - lat) / 180) * H);
        let isLandNode = false;
        if (cx >= 0 && cx < W && cy >= 0 && cy < H) {
          const idx = (cy * W + cx) * 4;
          isLandNode = imgData[idx] > 120;
        }

        const colorStr = isLandNode ? '#00F5B0' : C.iceBlue;
        const baseSize = isLandNode ? (1.5 + Math.random() * 2.0) : (1.0 + Math.random() * 1.0);
        const baseAlpha = isLandNode ? (0.45 + Math.random() * 0.35) : (0.15 + Math.random() * 0.15);
        const period = 1.8 + Math.random() * 3.5;
        const phase = Math.random() * Math.PI * 2;

        staticNodeCollection.add({
          position: Cesium.Cartesian3.fromDegrees(lon, lat, 3500), // 3.5km float
          color: Cesium.Color.fromCssColorString(colorStr).withAlpha(baseAlpha),
          pixelSize: baseSize,
        });

        staticNodeAnimData.push({
          phase,
          period,
          baseSize,
          color: Cesium.Color.fromCssColorString(colorStr),
          baseAlpha,
        });
      }

      // Generate active uplink beams from land coordinates
      const shuffled = [...landCoords].sort(() => Math.random() - 0.5);
      const numBeams = Math.min(30, shuffled.length);
      for (let i = 0; i < numBeams; i++) {
        const { lat, lon } = shuffled[i];
        const maxH = 150000 + Math.random() * 1000000;
        const speed = 1.2 + Math.random() * 3.8;
        const phase = Math.random() * Math.PI * 2;

        const glow = beamCollection.add({
          positions: [
            Cesium.Cartesian3.fromDegrees(lon, lat, 0),
            Cesium.Cartesian3.fromDegrees(lon, lat, maxH),
          ],
          width: 3.0,
          material: Cesium.Material.fromType('PolylineGlow', {
            color: Cesium.Color.fromCssColorString(C.cyan).withAlpha(0.50),
            glowPower: 0.30,
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

    // Setup 8 Major Hubs (Tier 3) and standard cities (Tier 2)
    MAJOR_HUBS.forEach((hub) => {
      const isSel = activeCity?.name === hub.name;
      const pt = mainNodeCollection.add({
        position: Cesium.Cartesian3.fromDegrees(hub.lon, hub.lat, 6000),
        color: Cesium.Color.WHITE,
        pixelSize: isSel ? 18 : 14,
        outlineColor: Cesium.Color.fromCssColorString(hub.color),
        outlineWidth: 2.5,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });
      mainNodeAnimData.push({
        phase: Math.random() * Math.PI * 2,
        period: 1.4 + Math.random() * 1.2,
        baseSize: isSel ? 18 : 14,
        tier: 3,
        color: Cesium.Color.fromCssColorString(hub.color),
      });
      const fullCity = citiesRawData.find(c => c.name.toLowerCase() === hub.name.toLowerCase()) || {
        name: hub.name,
        country: 'Global',
        lat: hub.lat,
        lon: hub.lon,
        offsets: { population: 10.0, popGrowth: 1.02, tempRise: 1.0 },
        details: { climate: 'Operational adaptation.', energy: 'Nuclear fusion integration.', satellites: 'Stable bandwidth.' }
      };
      (pt as any)._animIdx = mainNodeAnimData.length - 1;
      (pt as any)._cityRef = fullCity;
    });

    // Populate normal city nodes (Tier 2)
    citiesRawData.forEach((city) => {
      if (MAJOR_HUBS.some(h => h.name === city.name)) return;
      const isSel = activeCity?.name === city.name;
      const pt = mainNodeCollection.add({
        position: Cesium.Cartesian3.fromDegrees(city.lon, city.lat, 5000),
        color: Cesium.Color.WHITE,
        pixelSize: isSel ? 10 : 7,
        outlineColor: Cesium.Color.fromCssColorString(C.emerald),
        outlineWidth: 1.5,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });
      mainNodeAnimData.push({
        phase: Math.random() * Math.PI * 2,
        period: 2.0 + Math.random() * 2.0,
        baseSize: isSel ? 10 : 7,
        tier: 2,
        color: Cesium.Color.WHITE,
      });
      (pt as any)._animIdx = mainNodeAnimData.length - 1;
      (pt as any)._cityRef = city;
    });

    // 8 Major Hub expansions (expanding rings + bloom)
    MAJOR_HUBS.forEach((hub, hi) => {
      // Concentric expanding ring wave pulses
      for (let rIdx = 0; rIdx < 3; rIdx++) {
        const ringOffset = rIdx / 3;
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(hub.lon, hub.lat, 5000),
          ellipse: {
            semiMajorAxis: new Cesium.CallbackProperty(() => {
              const age = ((timeRef.current * 0.45) + ringOffset) % 1.0;
              return 350000 * age;
            }, false),
            semiMinorAxis: new Cesium.CallbackProperty(() => {
              const age = ((timeRef.current * 0.45) + ringOffset) % 1.0;
              return 350000 * age;
            }, false),
            material: new Cesium.ColorMaterialProperty(
              new Cesium.CallbackProperty(() => {
                const age = ((timeRef.current * 0.45) + ringOffset) % 1.0;
                return Cesium.Color.fromCssColorString(hub.color).withAlpha(0.06 * (1.0 - age));
              }, false)
            ),
            outline: true,
            outlineColor: new Cesium.CallbackProperty(() => {
              const age = ((timeRef.current * 0.45) + ringOffset) % 1.0;
              return Cesium.Color.fromCssColorString(hub.color).withAlpha(0.13 * (1.0 - age));
            }, false),
            outlineWidth: 1.0,
          },
        });
      }

      // Volumetric bloom glow layers
      const bloomPhase = hi * 0.785;
      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(hub.lon, hub.lat, 10000),
        ellipse: {
          semiMajorAxis: new Cesium.CallbackProperty(() =>
            450000 * (1.0 + 0.08 * Math.sin(timeRef.current * 0.7 + bloomPhase)), false),
          semiMinorAxis: new Cesium.CallbackProperty(() =>
            450000 * (1.0 + 0.08 * Math.sin(timeRef.current * 0.7 + bloomPhase)), false),
          material: new Cesium.ColorMaterialProperty(
            new Cesium.CallbackProperty(() =>
              Cesium.Color.fromCssColorString(hub.color).withAlpha(
                0.02 + 0.01 * Math.sin(timeRef.current * 0.7 + bloomPhase)
              ), false)
          ),
          outline: false,
        },
      });

      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(hub.lon, hub.lat, 8000),
        ellipse: {
          semiMajorAxis: new Cesium.CallbackProperty(() =>
            150000 * (1.0 + 0.12 * Math.sin(timeRef.current * 1.1 + bloomPhase)), false),
          semiMinorAxis: new Cesium.CallbackProperty(() =>
            150000 * (1.0 + 0.12 * Math.sin(timeRef.current * 1.1 + bloomPhase)), false),
          material: new Cesium.ColorMaterialProperty(
            new Cesium.CallbackProperty(() =>
              Cesium.Color.fromCssColorString(hub.color).withAlpha(
                0.05 + 0.02 * Math.sin(timeRef.current * 1.1 + bloomPhase)
              ), false)
          ),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString(hub.color).withAlpha(0.10),
          outlineWidth: 1.0,
        },
      });
    });

    // Thin Geodesic Highways with travelling sub-pulses
    HIGHWAYS.forEach((hw, hwIdx) => {
      const ca = hubCoord(hw.a);
      const cb = hubCoord(hw.b);
      if (!ca || !cb) return;

      const arcPoints = geodesicArc(ca, cb, hw.alt);

      // Base route line
      viewer.entities.add({
        polyline: {
          positions: arcPoints,
          width: 0.6,
          material: Cesium.Color.fromCssColorString(C.emerald).withAlpha(0.024),
        },
      });

      // Staggered travelling pulse segment
      const N = arcPoints.length;
      const pulsePositions = new Cesium.CallbackProperty(() => {
        const period = 6.0;
        const travelTime = 1.4;
        const offset = hwIdx * 0.45;
        const cycleTime = (timeRef.current + offset) % period;

        if (cycleTime > travelTime) {
          return [];
        }

        const progress = cycleTime / travelTime;
        const centerIdx = Math.floor(progress * (N - 1));
        const start = Math.max(0, centerIdx - 2);
        const end = Math.min(N - 1, centerIdx + 2);
        return arcPoints.slice(start, end + 1);
      }, false);

      viewer.entities.add({
        polyline: {
          positions: pulsePositions,
          width: 1.2,
          material: Cesium.Color.fromCssColorString(C.cyan).withAlpha(0.18),
        },
      });
    });

    // Segmented Rotating Holographic Global Scanning Rings
    const scanRing1Segments: any[] = [];
    const scanRing2Segments: any[] = [];
    for (let i = 0; i < 3; i++) {
      scanRing1Segments.push(
        scanRingCollection.add({
          width: 1.0,
          material: Cesium.Material.fromType('Color', {
            color: Cesium.Color.fromCssColorString(C.cyan).withAlpha(0.036)
          })
        })
      );
    }
    for (let i = 0; i < 4; i++) {
      scanRing2Segments.push(
        scanRingCollection.add({
          width: 0.8,
          material: Cesium.Material.fromType('Color', {
            color: Cesium.Color.fromCssColorString(C.emerald).withAlpha(0.024)
          })
        })
      );
    }

    // Streamlined Orbital Infrastructure
    ORBITAL_SHELLS.forEach((shell, shIdx) => {
      const R = shell.radius;
      const { tiltX, tiltY } = shell;

      // Orbit ring tracks
      const ringPts = Array.from({ length: 181 }, (_, i) => {
        const a = (i / 180) * Math.PI * 2;
        const { x, y, z } = rotateXY(R * Math.cos(a), R * Math.sin(a), 0, tiltX, tiltY);
        return new Cesium.Cartesian3(x, y, z);
      });
      viewer.entities.add({
        polyline: {
          positions: ringPts,
          width: 0.8,
          material: Cesium.Color.fromCssColorString(shell.color).withAlpha(0.018),
        },
      });

      // Satellites
      for (let s = 0; s < shell.sats; s++) {
        const phase0 = (s / shell.sats) * Math.PI * 2;
        const speed = shell.speed;
        const color = shell.color;

        viewer.entities.add({
          position: new Cesium.CallbackProperty(() => {
            const a = (timeRef.current * speed + phase0) % (Math.PI * 2);
            const { x, y, z } = rotateXY(R * Math.cos(a), R * Math.sin(a), 0, tiltX, tiltY);
            return new Cesium.Cartesian3(x, y, z);
          }, false),
          point: {
            pixelSize: 3,
            color: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.fromCssColorString(color),
            outlineWidth: 1.0,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        });
      }
    });

    // Unified Performance Animation Loop
    let frameCount = 0;
    const animate = () => {
      if (viewer.isDestroyed() || !isCyber) return;

      const lightDir = viewer.scene.light?.direction;
      if (!lightDir) return;

      const time = timeRef.current;
      frameCount++;

      // Subtle breathing planet effect
      const pulseBreathe = Math.sin(time * 0.8);
      if (viewer.scene.light) {
        viewer.scene.light.intensity = 1.35 + 0.15 * pulseBreathe;
      }

      // Update rotating scanning rings
      // Ring 1 (Inner, tilted, rotating clockwise)
      const R1 = 6378137 + 850000;
      const tilt1X = 0.35, tilt1Y = 0.15;
      const rot1 = time * 0.06;
      const segs1 = 3;
      const ptsPerSeg = 30;
      for (let s = 0; s < segs1; s++) {
        if (!scanRing1Segments[s]) continue;
        const startAngle = rot1 + (s / segs1) * Math.PI * 2;
        const endAngle = startAngle + (Math.PI * 2 / segs1) * 0.40;
        const pts = [];
        for (let i = 0; i <= ptsPerSeg; i++) {
          const a = startAngle + (i / ptsPerSeg) * (endAngle - startAngle);
          const { x, y, z } = rotateXY(R1 * Math.cos(a), R1 * Math.sin(a), 0, tilt1X, tilt1Y);
          pts.push(new Cesium.Cartesian3(x, y, z));
        }
        scanRing1Segments[s].positions = pts;
      }

      // Ring 2 (Outer, opposite tilt, rotating counter-clockwise)
      const R2 = 6378137 + 1450000;
      const tilt2X = -0.25, tilt2Y = 0.35;
      const rot2 = -time * 0.04;
      const segs2 = 4;
      for (let s = 0; s < segs2; s++) {
        if (!scanRing2Segments[s]) continue;
        const startAngle = rot2 + (s / segs2) * Math.PI * 2;
        const endAngle = startAngle + (Math.PI * 2 / segs2) * 0.35;
        const pts = [];
        for (let i = 0; i <= ptsPerSeg; i++) {
          const a = startAngle + (i / ptsPerSeg) * (endAngle - startAngle);
          const { x, y, z } = rotateXY(R2 * Math.cos(a), R2 * Math.sin(a), 0, tilt2X, tilt2Y);
          pts.push(new Cesium.Cartesian3(x, y, z));
        }
        scanRing2Segments[s].positions = pts;
      }

      // Update dot-matrix grid (every 3rd frame for performance)
      if (frameCount % 3 === 0) {
        const numDots = dotCollection.length;
        for (let i = 0; i < numDots; i++) {
          const pt = dotCollection.get(i);
          if (!pt) continue;
          const anim = dotAnimData[i];
          if (!anim) continue;

          // Compute fast dot product using precalculated normals
          const dot = anim.nx * lightDir.x + anim.ny * lightDir.y + anim.nz * lightDir.z;

          // Day side is dot < 0, Night side is dot > 0.
          // We fade smoothly towards the night side.
          const lightFactor = Math.max(0.04, Math.min(1.0, (-dot + 0.45) / 0.90));
          const tw = 0.75 + 0.25 * Math.sin(time * 2.5 + anim.phase);
          const proximityGlow = 1.0 + anim.hubProximity * 2.5;

          if (anim.isLand) {
            const alpha = 0.32 * lightFactor * tw * proximityGlow;
            pt.color = Cesium.Color.fromCssColorString('#00F5B0').withAlpha(Math.min(0.95, alpha));
            pt.pixelSize = (1.2 + anim.hubProximity * 1.5) * (0.8 + 0.2 * tw);
          } else {
            const alpha = 0.05 * lightFactor * tw;
            pt.color = Cesium.Color.fromCssColorString(C.iceBlue).withAlpha(Math.min(0.25, alpha));
            pt.pixelSize = 0.8 * (0.8 + 0.2 * tw);
          }
        }
      }

      // Update 2000 static network nodes (pulsing independently)
      const numStatic = staticNodeCollection.length;
      for (let i = 0; i < numStatic; i++) {
        const pt = staticNodeCollection.get(i);
        if (!pt) continue;
        const anim = staticNodeAnimData[i];
        if (!anim) continue;

        const pulse = 0.40 + 0.60 * Math.sin(time * ((Math.PI * 2) / anim.period) + anim.phase);
        pt.pixelSize = anim.baseSize * (0.8 + 0.4 * pulse);
        pt.color = anim.color.withAlpha(anim.baseAlpha * pulse);
      }

      // Update main nodes (Tier 3 hubs & Tier 2 cities)
      const numMain = mainNodeCollection.length;
      for (let i = 0; i < numMain; i++) {
        const pt = mainNodeCollection.get(i);
        if (!pt) continue;
        const anim = mainNodeAnimData[i];
        if (!anim) continue;

        const pulse = 0.70 + 0.30 * Math.sin(time * ((Math.PI * 2) / anim.period) + anim.phase);

        if (anim.tier === 3) {
          // Major Hub: bright core, glowing outline
          pt.pixelSize = anim.baseSize * (0.85 + 0.15 * pulse);
          pt.color = Cesium.Color.WHITE.withAlpha(0.95 * pulse);
        } else {
          // Standard city: white core pulsing
          pt.pixelSize = anim.baseSize * (0.8 + 0.2 * pulse);
          pt.color = Cesium.Color.WHITE.withAlpha(0.85 * pulse);
        }
      }

      // Update active uplink beams (height and flicker)
      const numBeams = beamAnimData.length;
      for (let i = 0; i < numBeams; i++) {
        const b = beamAnimData[i];
        const pos = Cesium.Cartesian3.fromDegrees(b.lon, b.lat, 0);
        const normal = Cesium.Cartesian3.normalize(pos, new Cesium.Cartesian3());
        const dot = Cesium.Cartesian3.dot(normal, lightDir);
        const flicker = Math.sin(time * b.speed * 3.5 + b.phase);
        const hFactor = 0.80 + 0.20 * flicker;
        const curH = b.maxH * hFactor;

        b.glow.positions = [
          Cesium.Cartesian3.fromDegrees(b.lon, b.lat, 0),
          Cesium.Cartesian3.fromDegrees(b.lon, b.lat, curH),
        ];
        b.core.positions = b.glow.positions;

        if (dot > -0.20) {
          const intensity = Math.min(1.0, (dot + 0.20) / 0.45);
          const gw = (4.0 + 3.0 * Math.abs(flicker)) * intensity;
          b.glow.width = gw;
          b.core.width = (1.2 + 0.5 * Math.abs(flicker)) * intensity;
          b.glow.material.uniforms.color = Cesium.Color.fromCssColorString(C.cyan).withAlpha(0.60 * intensity);
          b.core.material.uniforms.color = Cesium.Color.WHITE.withAlpha(0.90 * intensity);
        } else {
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
    const [lat, lon, height] = targets[activeCategory] ?? [10.0, 20.0, 12500000];
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
              background: 'rgba(2, 8, 15, 0.95)',
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
              background: 'rgba(2, 8, 15, 0.85)',
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
        style={{ background: '#02060A' }}>
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
