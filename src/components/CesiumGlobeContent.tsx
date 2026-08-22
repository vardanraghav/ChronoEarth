'use client';

import { useEffect, useRef, useState } from 'react';
import { citiesRawData, CityData } from '../data/citiesData';

export type EarthMode = 'realistic' | 'cyber';

interface CesiumGlobeContentProps {
  activeYear:        number;
  activeCategory:    string;
  activeCity:        CityData | null;
  setActiveCity:     (city: CityData | null) => void;
  activeCountry:     string | null;
  setActiveCountry:  (code: string | null) => void;
  overlays:          { climate: boolean; pollution: boolean; energy: boolean; satellite: boolean; ai: boolean };
  earthMode:         EarthMode;
  activeLayers:      {
    cities: boolean;
    climate: boolean;
    tech: boolean;
    energy: boolean;
    space: boolean;
    geopolitical: boolean;
    seismic?: boolean;
    markets?: boolean;
  };
  activeSimulations: {
    seaLevelRise: number;
    fusionBreakthrough: boolean;
    agiEmergence: boolean;
    popDecline: boolean;
    renewableTransition: boolean;
    arcticDominance: boolean;
    semiDisruptions: boolean;
  };
  cities?: CityData[];
  focusCoords?: { lat: number; lon: number; height?: number } | null;
  earthquakes?: any[];
  onEarthReady?: () => void;
}

declare const Cesium: any;

// ─── STRICT COLOR PALETTE ───────────────────────────────────────────────────
const C = {
  emerald: '#00F5B0',
  cyan: '#00FFFF',
  iceBlue: '#33FFFF',
  white: '#FFFFFF',
  spaceBg:  '#02060A',
  black:    '#000000',
} as const;

const DISABLE_CRASH_PRONE_EFFECTS = true;
const DISABLE_LAND_OUTLINES = false;

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
  { name: 'New York',      lat:  40.7128, lon:  -74.0060, color: '#00F5B0' },
  { name: 'London',        lat:  51.5074, lon:   -0.1278, color: '#00D98F' },
  { name: 'Dubai',         lat:  25.2048, lon:   55.2708, color: '#00F5B0' },
  { name: 'Mumbai',        lat:  19.0760, lon:   72.8777, color: '#00F5B0' },
  { name: 'Singapore',     lat:   1.3521, lon:  103.8198, color: '#00F5B0' },
  { name: 'Tokyo',         lat:  35.6762, lon:  139.6503, color: '#00F5B0' },
  { name: 'Shanghai',      lat:  31.2304, lon:  121.4737, color: '#00F5B0' },
  { name: 'San Francisco', lat:  37.7749, lon: -122.4194, color: '#00D98F' },
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
  { name: 'LEO',   radius: 6378137 + 550000,   tiltX: 0.42, tiltY: 0.18, color: C.cyan,    sats: 4, speed: 0.045 },
  { name: 'MEO',   radius: 6378137 + 3200000,  tiltX: -0.52,tiltY: 0.35, color: C.iceBlue, sats: 2,  speed: 0.022 },
  { name: 'GEO',   radius: 6378137 + 10000000, tiltX: 0.0,  tiltY: 0.0,  color: C.emerald, sats: 1,  speed: 0.008 },
];
// ─── GEOPOLITICAL / INTEL LAYER DATASETS ───────────────────────────────────
const COUNTRY_COORDINATES: Record<string, { lat: number; lon: number; height: number }> = {
  'IND': { lat: 20.5937, lon: 78.9629, height: 4000000 },
  'USA': { lat: 37.0902, lon: -95.7129, height: 5000000 },
  'CHN': { lat: 35.8617, lon: 104.1954, height: 5000000 },
  'JPN': { lat: 36.2048, lon: 138.2529, height: 2000000 },
  'GBR': { lat: 55.3781, lon: -3.4360, height: 1500000 },
  'DEU': { lat: 51.1657, lon: 10.4515, height: 1200000 },
  'SGP': { lat: 1.3521, lon: 103.8198, height: 180000 },
  'ARE': { lat: 23.4241, lon: 53.8478, height: 1200000 },
  'SAU': { lat: 23.8859, lon: 45.0792, height: 2500000 },
  'KEN': { lat: -0.0236, lon: 37.9062, height: 2000000 },
  'CAN': { lat: 56.1304, lon: -106.3468, height: 6000000 },
  'BRA': { lat: -14.2350, lon: -51.9253, height: 5000000 },
  'RUS': { lat: 61.5240, lon: 105.3188, height: 8000000 },
  'EGY': { lat: 26.8206, lon: 30.8025, height: 2000000 },
  'PAK': { lat: 30.3753, lon: 69.3451, height: 2000000 },
  'ISL': { lat: 64.9631, lon: -19.0208, height: 1000000 }
};

const AUTONOMOUS_ROUTES = [
  { a: 'New Delhi', b: 'Mumbai' },
  { a: 'Mumbai', b: 'Bengaluru' },
  { a: 'Tokyo', b: 'Seoul' },
  { a: 'Singapore', b: 'Forest City' },
  { a: 'London', b: 'Paris' },
  { a: 'Paris', b: 'Berlin' },
  { a: 'Berlin', b: 'Munich' },
  { a: 'New York', b: 'Toronto' },
  { a: 'New York', b: 'Los Angeles' },
  { a: 'Los Angeles', b: 'Tesla Colony One' },
  { a: 'Dubai', b: 'Masdar City' },
  { a: 'Riyadh', b: 'Neom' }
];

const CLIMATE_REGIONS = [
  { name: 'Sahara Desertification Zone', lat: 23.0, lon: 12.0, radius: 1500000, color: '#D2691E', alpha: 0.18 },
  { name: 'Gobi Desertification Zone', lat: 42.0, lon: 105.0, radius: 800000, color: '#D2691E', alpha: 0.18 },
  { name: 'Amazon Biodiversity Corridor', lat: -3.0, lon: -60.0, radius: 1800000, color: '#00FF66', alpha: 0.15 },
  { name: 'Congo Biodiversity Corridor', lat: -1.0, lon: 20.0, radius: 1000000, color: '#00FF66', alpha: 0.15 },
  { name: 'Middle East Water Stress Zone', lat: 25.0, lon: 45.0, radius: 1000000, color: '#FF3333', alpha: 0.15 }
];

const FLOOD_ZONES = [
  { name: 'Netherlands Inundation Risk', lat: 52.3, lon: 4.9, radius: 150000 },
  { name: 'Florida Inundation Risk', lat: 27.5, lon: -81.5, radius: 250000 },
  { name: 'Bangladesh Delta Inundation Risk', lat: 22.2, lon: 90.0, radius: 200000 },
  { name: 'Jakarta Inundation Risk', lat: -6.2, lon: 106.8, radius: 80000 }
];

const TECH_HUBS = [
  { name: 'Hsinchu Fab Cluster', lat: 24.78, lon: 120.97 },
  { name: 'Shenzhen Data Hub', lat: 22.54, lon: 114.06 },
  { name: 'Seoul Neural Center', lat: 37.56, lon: 126.97 },
  { name: 'Munich Quantum Node', lat: 48.13, lon: 11.58 },
  { name: 'Austin Fab Center', lat: 30.26, lon: -97.74 }
];

const QUANTUM_LINKS = [
  { a: { lat: 34.05, lon: -118.24 }, b: { lat: 35.67, lon: 139.65 } }, // LA/SF to Tokyo
  { a: { lat: 35.67, lon: 139.65 }, b: { lat: 24.78, lon: 120.97 } }, // Tokyo to Hsinchu
  { a: { lat: 24.78, lon: 120.97 }, b: { lat: 1.35, lon: 103.82 } }, // Hsinchu to Singapore
  { a: { lat: 1.35, lon: 103.82 }, b: { lat: 12.97, lon: 77.59 } }, // Singapore to Bengaluru
  { a: { lat: 12.97, lon: 77.59 }, b: { lat: 48.13, lon: 11.58 } }, // Bengaluru to Munich
  { a: { lat: 48.13, lon: 11.58 }, b: { lat: 51.51, lon: -0.13 } }, // Munich to London
  { a: { lat: 51.51, lon: -0.13 }, b: { lat: 40.71, lon: -74.01 } }, // London to NY
  { a: { lat: 40.71, lon: -74.01 }, b: { lat: 30.26, lon: -97.74 } } // NY to Austin
];

const FUSION_HUBS = [
  { name: 'ITER Cadarache', lat: 43.68, lon: 5.76 },
  { name: 'JT-60SA Naka', lat: 36.48, lon: 140.55 },
  { name: 'EAST Hefei', lat: 31.86, lon: 117.27 },
  { name: 'SPARC Boston', lat: 42.36, lon: -71.06 },
  { name: 'JET Culham', lat: 51.65, lon: -1.22 }
];

const FUSION_GRID = [
  { a: { lat: 43.68, lon: 5.76 }, b: { lat: 48.86, lon: 2.35 } }, // Cadarache to Paris
  { a: { lat: 43.68, lon: 5.76 }, b: { lat: 48.13, lon: 11.58 } }, // Cadarache to Munich
  { a: { lat: 36.48, lon: 140.55 }, b: { lat: 35.67, lon: 139.65 } }, // Naka to Tokyo
  { a: { lat: 31.86, lon: 117.27 }, b: { lat: 31.23, lon: 121.47 } }, // Hefei to Shanghai
  { a: { lat: 42.36, lon: -71.06 }, b: { lat: 40.71, lon: -74.01 } }, // Boston to NY
  { a: { lat: 51.65, lon: -1.22 }, b: { lat: 51.51, lon: -0.13 } } // Culham to London
];

const SPACEPORTS = [
  { name: 'Cape Canaveral', lat: 28.39, lon: -80.60 },
  { name: 'Kourou Spaceport', lat: 5.16, lon: -52.65 },
  { name: 'Tanegashima Space Center', lat: 30.37, lon: 130.97 },
  { name: 'Baikonur Cosmodrome', lat: 45.96, lon: 63.30 },
  { name: 'Wenchang Spaceport', lat: 19.61, lon: 110.95 }
];

const SEMI_FABS = [
  { name: 'TSMC Gigafab (Hsinchu)', lat: 24.78, lon: 120.97 },
  { name: 'Intel Fab 34 (Hillsboro)', lat: 45.52, lon: -122.95 },
  { name: 'Samsung Pyeongtaek Fab', lat: 37.27, lon: 127.12 },
  { name: 'Micron Fab 15 (Boise)', lat: 43.61, lon: -116.20 },
  { name: 'GlobalFoundries Fab 8 (Malta)', lat: 42.97, lon: -73.79 },
  { name: 'ASML HQ (Veldhoven)', lat: 51.41, lon: 5.40 }
];

const SEMI_SUPPLY_LINKS = [
  { a: { lat: 51.41, lon: 5.40 }, b: { lat: 24.78, lon: 120.97 } }, // ASML to TSMC
  { a: { lat: 24.78, lon: 120.97 }, b: { lat: 45.52, lon: -122.95 } }, // TSMC to Intel
  { a: { lat: 37.27, lon: 127.12 }, b: { lat: 51.41, lon: 5.40 } }, // Samsung to ASML
  { a: { lat: 42.97, lon: -73.79 }, b: { lat: 43.61, lon: -116.20 } }, // GF to Micron
  { a: { lat: 24.78, lon: 120.97 }, b: { lat: 42.97, lon: -73.79 } } // TSMC to GF
];

const LANDING_STATIONS = [
  { name: 'Bude Cable Station (UK)', lat: 50.83, lon: -4.54 },
  { name: 'Marseille Landing Hub (FR)', lat: 43.30, lon: 5.37 },
  { name: 'Chennai Landing Hub (IN)', lat: 13.08, lon: 80.27 },
  { name: 'Hillsboro Cable Landing (US)', lat: 45.52, lon: -122.95 },
  { name: 'Chikura Cable Station (JP)', lat: 34.97, lon: 139.97 }
];

const GEOPOLITICAL_LANES = [
  {
    name: 'Suez Maritime Route',
    coords: [
      { lat: 51.5, lon: 0 },      // London
      { lat: 36.0, lon: -5.6 },    // Gibraltar
      { lat: 30.0, lon: 32.5 },    // Suez
      { lat: 12.6, lon: 43.5 },    // Bab-el-Mandeb
      { lat: 1.3, lon: 103.0 }     // Malacca / Singapore
    ],
    isArctic: false
  },
  {
    name: 'Panama Maritime Route',
    coords: [
      { lat: 40.71, lon: -74.01 }, // NY
      { lat: 9.0, lon: -79.5 },    // Panama
      { lat: 35.67, lon: 139.65 }  // Tokyo
    ],
    isArctic: false
  },
  {
    name: 'Arctic Shipping Passage',
    coords: [
      { lat: 51.5, lon: 0 },       // London
      { lat: 75.0, lon: 45.0 },    // Barents Sea
      { lat: 78.0, lon: 110.0 },   // Laptev Sea
      { lat: 65.6, lon: -168.9 },  // Bering Strait
      { lat: 35.67, lon: 139.65 }  // Tokyo
    ],
    isArctic: true
  }
];

const MINERAL_NODES = [
  { name: 'Katanga Cobalt Belt', lat: -10.7, lon: 26.5 },
  { name: 'Pilbara Lithium Deposits', lat: -21.8, lon: 118.6 },
  { name: 'Salar de Uyuni Lithium Flats', lat: -20.3, lon: -67.5 }
];

const CHOKE_POINTS = [
  { name: 'Malacca Strait', lat: 1.3, lon: 103.0 },
  { name: 'Suez Canal', lat: 30.0, lon: 32.5 },
  { name: 'Panama Canal', lat: 9.0, lon: -79.5 },
  { name: 'Strait of Hormuz', lat: 26.6, lon: 56.2 }
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
  const cappedSteps = Math.min(steps, 40);
  for (let i = 0; i <= cappedSteps; i++) {
    const t = i / cappedSteps;
    const c = geo.interpolateUsingFraction(t);
    const h = Math.sin(t * Math.PI) * maxAlt;
    pts.push(Cesium.Cartesian3.fromRadians(c.longitude, c.latitude, h));
  }
  return pts;
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function CesiumGlobeContent({
  activeYear, activeCategory, activeCity, setActiveCity, activeCountry, setActiveCountry, overlays, earthMode, activeLayers, activeSimulations, cities = citiesRawData, focusCoords, earthquakes = [], onEarthReady
}: CesiumGlobeContentProps) {
  const hubCoord = (name: string) => {
    return AI_HUBS.find(h => h.name === name) ?? cities.find(c => c.name === name) ?? null;
  };
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef    = useRef<any>(null);
  const timeRef      = useRef(0);
  const earthquakeEntitiesRef = useRef<any[]>([]);

  // Dynamic flags for GPU/WebGL crash audit
  const disableBloom = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('disableBloom') === 'true' : false;
  const disableOutlines = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('disableOutlines') === 'true' : false;
  const disableDots = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('disableDots') === 'true' : false;

  const [isInteracting,  setIsInteracting]  = useState(false);
  const [hoveredCity,    setHoveredCity]    = useState<CityData | null>(null);
  const [hoverPos,       setHoverPos]       = useState<{ x: number; y: number } | null>(null);
  const [isGlobeReady,   setIsGlobeReady]   = useState(false);
  const [isMobile,       setIsMobile]       = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const activeCityRef = useRef<CityData | null>(activeCity);
  const hoveredCityRef = useRef<CityData | null>(hoveredCity);
  const setActiveCityRef = useRef(setActiveCity);

  activeCityRef.current = activeCity;
  hoveredCityRef.current = hoveredCity;
  setActiveCityRef.current = setActiveCity;
  const isInteractingRef = useRef(false);
  const lastInteractionTimeRef = useRef(Date.now());
  const isFlyingRef = useRef(false);

  const isCyber = earthMode === 'cyber';

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 8;
      const y = (e.clientY / window.innerHeight - 0.5) * 8;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

    const isMobileDevice = window.innerWidth < 768;

    console.log("[EXEC_TRACE] E = Cesium Viewer constructor starts at " + performance.now().toFixed(1) + "ms");
    const vStart = performance.now();
    const viewer = new Cesium.Viewer(containerRef.current, {
      timeline: false, animation: false, baseLayerPicker: false,
      navigationHelpButton: false, homeButton: false, sceneModePicker: false,
      geocoder: false, infoBox: false, selectionIndicator: false,
      fullscreenButton: false, skyBox: false,
      baseLayer: false, // Prevent duplicate conflicting default base layer
      navigationInstructionsInitiallyVisible: false,
      contextOptions: { webgl: { alpha: true } },
      creditContainer: document.createElement('div'),
    });
    const vTime = performance.now() - vStart;
    console.log("[EXEC_TRACE] F = Cesium Viewer constructor completes at " + performance.now().toFixed(1) + "ms");
    console.log(`[ChronoEarth] Viewer: ${vTime.toFixed(1)} ms`);

    viewer.scene.backgroundColor = Cesium.Color.TRANSPARENT;
    
    // HDR Rendering & filmic tone mapping / exposure control
    viewer.scene.highDynamicRange = true;
    if (viewer.scene.postProcessStages) {
      viewer.scene.postProcessStages.exposure = 0.75; // Film exposure level
    }

    // Planet momentum & heavy inertia feel
    viewer.scene.screenSpaceCameraController.inertiaSpin = 0.88;
    viewer.scene.screenSpaceCameraController.inertiaTranslate = 0.85;
    viewer.scene.screenSpaceCameraController.inertiaZoom = 0.80;
    viewer.scene.screenSpaceCameraController.enableLook = false;

    // Pull camera FOV back for cinematic telephoto compression
    if (viewer.camera.frustum instanceof Cesium.PerspectiveFrustum) {
      viewer.camera.frustum.fov = Cesium.Math.toRadians(38.0);
    }
    
    // Resolution scale & Device Pixel Ratio handling
    const pixelRatio = window.devicePixelRatio || 1.0;
    viewer.useBrowserRecommendedResolution = true;

    // Apply Mobile Performance Optimizations to Cesium Viewer
    if (isMobileDevice) {
      // Crisp but not GPU-overloading on mobile
      viewer.resolutionScale = Math.max(1.0, 1.3 / pixelRatio); 
      viewer.scene.requestRenderMode = true;
      viewer.scene.maximumRenderTimeChange = Number.POSITIVE_INFINITY;
      viewer.scene.highDynamicRange = false;
      
      if (viewer.scene.globe) {
        viewer.scene.globe.showGroundAtmosphere = false;
        viewer.scene.globe.enableLighting = true; // Premium realistic look
        viewer.scene.globe.maximumScreenSpaceError = 3.0; // Crisp textures
      }
      if (viewer.scene.skyAtmosphere) {
        viewer.scene.skyAtmosphere.show = false;
      }
      if (viewer.scene.fog) {
        viewer.scene.fog.enabled = false;
      }
      
      // Audit touch event camera inertia
      viewer.scene.screenSpaceCameraController.enableLook = false;
      viewer.scene.screenSpaceCameraController.inertiaSpin = 0.15;
      viewer.scene.screenSpaceCameraController.inertiaTranslate = 0.15;
      viewer.scene.screenSpaceCameraController.inertiaZoom = 0.25;
    } else {
      viewer.resolutionScale = 1.0;
      if (viewer.scene.globe) {
        viewer.scene.globe.maximumScreenSpaceError = 1.5; // High terrain resolution for sharp ridges
      }
    }

    // Set camera starting viewpoint way out in deep space at an oblique tilted angle
    const cameraHeight = isMobileDevice ? 18000000 : 23500000;
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(-25.0, 15.0, 38000000), // Oblique start
      orientation: {
        heading: Cesium.Math.toRadians(-15),
        pitch: Cesium.Math.toRadians(-65), // Cinematic tilted horizon view
        roll: 0
      },
    });

    // Smooth cinematic zoom-in fly-in on load
    const flyTimeout = setTimeout(() => {
      if (viewer.isDestroyed()) return;
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-25.0, 15.0, cameraHeight * 0.92),
        orientation: {
          heading: Cesium.Math.toRadians(-15),
          pitch: Cesium.Math.toRadians(-65), // Settle showing atmosphere limb
          roll: 0
        },
        duration: 4.5,
        easingFunction: Cesium.EasingFunction.CUBIC_OUT,
      });
    }, 600);
    viewerRef.current = viewer;
     (window as any).viewer = viewer;

    // Camera movement lifecycle listeners for idle rotation pausing
    viewer.camera.moveStart.addEventListener(() => {
      isFlyingRef.current = true;
      lastInteractionTimeRef.current = Date.now();
    });
    viewer.camera.moveEnd.addEventListener(() => {
      isFlyingRef.current = false;
      lastInteractionTimeRef.current = Date.now();
    });

    // Initiate imagery provider loading immediately in parallel
    console.log("[EXEC_TRACE] IMAGERY_REQUEST_START at " + performance.now().toFixed(1) + "ms");
    const imgStart = performance.now();
    Cesium.ArcGisMapServerImageryProvider.fromUrl(
      'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
      { enablePickFeatures: false, maximumLevel: 23 }
    ).then((provider: any) => {
      if (viewer.isDestroyed() || !viewer.imageryLayers) return;
      viewer.imageryLayers.removeAll();
      const lyr = viewer.imageryLayers.addImageryProvider(provider);
      lyr.brightness = 0.86;
      lyr.contrast = 1.0;
      lyr.saturation = 1.0;
      lyr.gamma = 0.92;
      console.log(`[ChronoEarth] Base Imagery Setup: ${(performance.now() - imgStart).toFixed(1)} ms`);
    }).catch(async () => {
      try {
        const fb = new Cesium.OpenStreetMapImageryProvider({ url: 'https://tile.openstreetmap.org/' });
        if (!viewer.isDestroyed() && viewer.imageryLayers) {
          viewer.imageryLayers.removeAll();
          const lyr = viewer.imageryLayers.addImageryProvider(fb);
          lyr.brightness = 0.86;
          lyr.contrast = 1.0;
          lyr.saturation = 1.0;
          lyr.gamma = 0.92;
          console.log(`[ChronoEarth] Base Imagery Setup: ${(performance.now() - imgStart).toFixed(1)} ms`);
        }
      } catch {}
    });

    // Explicit Resize Observer / Listener
    const handleResize = () => {
      if (viewer && !viewer.isDestroyed()) {
        viewer.resize();
      }
    };
    window.addEventListener('resize', handleResize);

    viewer.scene.renderError.addEventListener((scene: any, error: any) => {
      console.error("CESIUM_RENDER_ERROR", error ? (error.message || error) : "unknown error", error ? error.stack : undefined);
    });

    const canvas = viewer.scene.canvas;
    const handleContextLost = (e: any) => {
      console.error("WEBGL_CONTEXT_LOST");
    };
    canvas.addEventListener("webglcontextlost", handleContextLost);

    let isEarthReadyTriggered = false;
    const triggerEarthReady = () => {
      if (isEarthReadyTriggered) return;
      isEarthReadyTriggered = true;
      console.log("[EXEC_TRACE] I = first Earth imagery becomes visible at " + performance.now().toFixed(1) + "ms");
      console.log(`[ChronoEarth] Earth Ready: ${performance.now().toFixed(1)} ms`);
      if (onEarthReady) onEarthReady();
      setIsGlobeReady(true);
    };

    // 1. Monitor real imagery tile load progress from Cesium Globe engine
    let firstTileProgressLogged = false;
    const removeTileLoadListener = viewer.scene.globe.tileLoadProgressEvent.addEventListener((queueLength: number) => {
      if (viewer.isDestroyed() || isEarthReadyTriggered) return;
      if (queueLength > 0) {
        if (!firstTileProgressLogged) {
          firstTileProgressLogged = true;
          console.log("[EXEC_TRACE] H = first Earth imagery request at " + performance.now().toFixed(1) + "ms");
        }
      } else if (queueLength === 0 && !isEarthReadyTriggered) {
        triggerEarthReady();
      }
    });

    // 2. Monitor rendered frames with imagery
    let renderedFrames = 0;
    const removePostRenderListener = viewer.scene.postRender.addEventListener(() => {
      if (viewer.isDestroyed() || isEarthReadyTriggered) return;
      renderedFrames++;
      if (renderedFrames === 1) {
        console.log("[EXEC_TRACE] G = first Cesium render at " + performance.now().toFixed(1) + "ms");
        console.log(`[ChronoEarth] First Earth frame: ${performance.now().toFixed(1)} ms`);
      }
      if (renderedFrames > 2) {
        if (viewer.scene.globe.tilesLoaded || (viewer.imageryLayers && viewer.imageryLayers.length > 0)) {
          triggerEarthReady();
        }
      }
    });

    const safety = setTimeout(() => {
      if (!isEarthReadyTriggered) {
        triggerEarthReady();
      }
    }, 4500);

    // Event handlers
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((click: any) => {
      const picked = viewer.scene.pick(click.position);
      if (Cesium.defined(picked)) {
        if (picked.id?.properties?.cityData) {
          setActiveCityRef.current(picked.id.properties.cityData.getValue());
        } else if (picked.primitive?._cityRef) {
          setActiveCityRef.current(picked.primitive._cityRef);
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction((click: any) => {
      const picked = viewer.scene.pick(click.position);
      if (Cesium.defined(picked)) {
        let city = null;
        if (picked.id?.properties?.cityData) {
          city = picked.id.properties.cityData.getValue();
        } else if (picked.primitive?._cityRef) {
          city = picked.primitive._cityRef;
        }
        if (city) {
          setActiveCityRef.current(city);
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(city.lon, city.lat - 0.6, 650000), // Close zoom
            duration: 2.0,
            easingFunction: Cesium.EasingFunction.CUBIC_OUT,
          });
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
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

    handler.setInputAction(() => {
      isInteractingRef.current = true;
      lastInteractionTimeRef.current = Date.now();
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    handler.setInputAction(() => {
      isInteractingRef.current = false;
      lastInteractionTimeRef.current = Date.now();
    }, Cesium.ScreenSpaceEventType.LEFT_UP);

    handler.setInputAction(() => {
      isInteractingRef.current = true;
      lastInteractionTimeRef.current = Date.now();
    }, Cesium.ScreenSpaceEventType.RIGHT_DOWN);

    handler.setInputAction(() => {
      isInteractingRef.current = false;
      lastInteractionTimeRef.current = Date.now();
    }, Cesium.ScreenSpaceEventType.RIGHT_UP);

    handler.setInputAction(() => {
      lastInteractionTimeRef.current = Date.now();
    }, Cesium.ScreenSpaceEventType.WHEEL);

    handler.setInputAction(() => {
      isInteractingRef.current = true;
      lastInteractionTimeRef.current = Date.now();
    }, Cesium.ScreenSpaceEventType.PINCH_START);

    handler.setInputAction(() => {
      isInteractingRef.current = false;
      lastInteractionTimeRef.current = Date.now();
    }, Cesium.ScreenSpaceEventType.PINCH_END);

    return () => {
      if (removeTileLoadListener) removeTileLoadListener();
      if (removePostRenderListener) removePostRenderListener();
      window.removeEventListener('resize', handleResize);
      clearTimeout(safety);
      clearTimeout(flyTimeout);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      handler.destroy();
      viewer.destroy();
      viewerRef.current = null;
      delete (window as any).viewer;
    };
  }, []);

  // ─── Build Scene Layers ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current) return;
    const viewer = viewerRef.current;
    let active = true;

    // Timing tracking
    const startTime = performance.now();
    console.log(`[ChronoEarth] Starting progressive intelligence layer loading at ${startTime.toFixed(1)} ms`);

    // Strict safety caps
    let entityCount = 0;
    const safeAddEntity = (options: any) => {
      if (entityCount >= 5000) {
        return null;
      }
      try {
        const ent = viewer.entities.add(options);
        if (ent) entityCount++;
        return ent;
      } catch (e) {
        return null;
      }
    };

    // Reset entities (note: we don't clear imageryLayers.removeAll() here to preserve base day imagery!)
    viewer.entities.removeAll();
    viewer.dataSources.removeAll();

    // Reset primitive collections
    const primRm: any[] = [];
    for (let i = 0; i < viewer.scene.primitives.length; i++) {
      const p = viewer.scene.primitives.get(i);
      if (p instanceof Cesium.PointPrimitiveCollection || p instanceof Cesium.PolylineCollection) {
        primRm.push(p);
      }
    }
    primRm.forEach(p => viewer.scene.primitives.remove(p));

    // Remove old boundaries layer if exists
    if (viewer._borderLayer) {
      viewer.imageryLayers.remove(viewer._borderLayer);
      viewer._borderLayer = null;
    }
    if (viewer._updateBorderAlphaListener) {
      viewer.camera.changed.removeEventListener(viewer._updateBorderAlphaListener);
      viewer._updateBorderAlphaListener = null;
    }

    // Apply globe settings based on Earth Mode
    if (!isCyber) {
      if (viewer.scene.globe) {
        viewer.scene.globe.baseColor = Cesium.Color.BLUE;
        viewer.scene.globe.showGroundAtmosphere = false;
        viewer.scene.globe.enableLighting = false;
        viewer.scene.globe.dynamicAtmosphereLighting = false;
        viewer.scene.globe.dynamicAtmosphereLightingFromSun = false;
        viewer.scene.globe.preloadAncestors = true;
        viewer.scene.globe.preloadSiblings = true;
        viewer.scene.globe.tileCacheSize = 1500;
        viewer.scene.globe.maximumScreenSpaceError = 0.35;
        viewer.scene.globe.loadingDescendantLimit = 64;
        viewer.scene.globe.depthTestAgainstTerrain = true;
      }
      if (viewer.scene.skyAtmosphere) {
        viewer.scene.skyAtmosphere.show = true;
        viewer.scene.skyAtmosphere.brightnessShift = -0.25;
        viewer.scene.skyAtmosphere.saturationShift = 0.0;
      }
    } else {
      if (viewer.scene.globe) {
        viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#020b18');
        viewer.scene.globe.showGroundAtmosphere = false;
        viewer.scene.globe.enableLighting = false;
        viewer.scene.globe.dynamicAtmosphereLighting = false;
        viewer.scene.globe.dynamicAtmosphereLightingFromSun = false;
        viewer.scene.globe.preloadAncestors = true;
        viewer.scene.globe.preloadSiblings = true;
        viewer.scene.globe.tileCacheSize = 1500;
        viewer.scene.globe.maximumScreenSpaceError = 0.35;
        viewer.scene.globe.loadingDescendantLimit = 64;
        viewer.scene.globe.depthTestAgainstTerrain = true;
      }
      if (viewer.scene.skyAtmosphere) {
        viewer.scene.skyAtmosphere.show = true;
        viewer.scene.skyAtmosphere.brightnessShift = -0.25;
        viewer.scene.skyAtmosphere.saturationShift = 0.0;
      }
      if (viewer.scene.postProcessStages && viewer.scene.postProcessStages.bloom) {
        viewer.scene.postProcessStages.bloom.enabled = false;
      }
      if (viewer.scene.fog) {
        viewer.scene.fog.enabled = false;
      }
    }

    // Initialize primitive collections (instantly added, populated progressively)
    let dotCollection: any;
    let staticNodeCollection: any;
    let mainNodeCollection: any;
    let beamCollection: any;
    let citiesRoutesLines: any;
    let techPoints: any;
    let techLines: any;
    let energyPoints: any;
    let energyLines: any;
    let spacePoints: any;
    let geoPoints: any;
    let geoLines: any;
    let marketsPoints: any;
    let marketsLines: any;

    if (isCyber) {
      dotCollection        = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
      staticNodeCollection = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
      mainNodeCollection   = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
      beamCollection       = viewer.scene.primitives.add(new Cesium.PolylineCollection());
      citiesRoutesLines    = viewer.scene.primitives.add(new Cesium.PolylineCollection());
      citiesRoutesLines.layerId = 'cities';
      techPoints           = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
      techPoints.layerId   = 'tech';
      techLines            = viewer.scene.primitives.add(new Cesium.PolylineCollection());
      techLines.layerId    = 'tech';
      energyPoints         = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
      energyPoints.layerId = 'energy';
      energyLines          = viewer.scene.primitives.add(new Cesium.PolylineCollection());
      energyLines.layerId  = 'energy';
      spacePoints          = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
      spacePoints.layerId  = 'space';
      geoPoints            = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
      geoPoints.layerId    = 'geopolitical';
      geoLines             = viewer.scene.primitives.add(new Cesium.PolylineCollection());
      geoLines.layerId     = 'geopolitical';
      marketsPoints        = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
      marketsPoints.layerId = 'markets';
      marketsLines         = viewer.scene.primitives.add(new Cesium.PolylineCollection());
      marketsLines.layerId = 'markets';
    }

    type DotAnim = {
      phase: number;
      isLand: boolean;
      nx: number;
      ny: number;
      nz: number;
      hubProximity: number;
    };
    type StaticNodeAnim = { phase: number; period: number; baseSize: number; color: any; baseAlpha: number };
    type MainNodeAnim = {
      phase: number;
      period: number;
      baseSize: number;
      tier: number;
      color: any;
      corePt: any;
      glowPt: any;
      outerPt: any;
    };

    const dotAnimData: DotAnim[] = [];
    const staticNodeAnimData: StaticNodeAnim[] = [];
    const mainNodeAnimData: MainNodeAnim[] = [];

    let removeRenderListener: (() => void) | null = null;
    const timeouts: any[] = [];

    const stages = [
      // Stage 1: country boundaries & terrain
      () => {
        const stageStart = performance.now();
        if (viewer.isDestroyed() || !active) return;
        
        // Load high resolution terrain asynchronously
        try {
          const ionToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
          if (ionToken) {
            Cesium.createWorldTerrainAsync({ requestVertexNormals: true })
              .then((tp: any) => {
                if (viewer.isDestroyed() || !active) return;
                viewer.terrainProvider = tp;
              })
              .catch(() => {});
          }
        } catch (e) {}

        // Load country boundaries reference layer
        Cesium.ArcGisMapServerImageryProvider.fromUrl(
          'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer',
          { enablePickFeatures: false }
        ).then((borderProvider: any) => {
          if (viewer.isDestroyed() || !active) return;
          const borderLayer = viewer.imageryLayers.addImageryProvider(borderProvider);
          viewer._borderLayer = borderLayer;
          
          borderLayer.alpha = 0.65;
          borderLayer.brightness = 1.15;
          borderLayer.contrast = 1.25;
          borderLayer.saturation = 0.0;
          borderLayer.gamma = 0.90;

          const updateBorderAlpha = () => {
            if (viewer.isDestroyed() || !borderLayer) return;
            const height = viewer.camera.positionCartographic?.height || 20000000;
            if (height > 22000000) {
              borderLayer.alpha = 0.45;
            } else if (height > 6000000) {
              borderLayer.alpha = 0.65;
            } else {
              borderLayer.alpha = 0.78;
            }
          };
          viewer.camera.changed.addEventListener(updateBorderAlpha);
          viewer._updateBorderAlphaListener = updateBorderAlpha;
        }).catch(() => {});

        console.log(`[ChronoEarth] country boundaries: ${(performance.now() - startTime).toFixed(1)} ms (took ${(performance.now() - stageStart).toFixed(1)} ms)`);
      },
      // Stage 2: city markers
      () => {
        const stageStart = performance.now();
        if (viewer.isDestroyed() || !active) return;

        if (!isCyber) {
          const baseCrimson = Cesium.Color.fromCssColorString('#FF3B4D');
          const glowCrimson = Cesium.Color.fromCssColorString('#FF2A40');
          const whiteRedCore = Cesium.Color.fromCssColorString('#FFF2F4');
          const GLOBAL_TIER1_HUBS = new Set([
            'New Delhi', 'Mumbai', 'Bengaluru', 'Tokyo', 'Singapore', 'Dubai', 'London', 'New York',
            'San Francisco', 'Beijing', 'Shanghai', 'Seoul', 'Sydney', 'Nairobi', 'Sao Paulo', 'Paris',
            'Berlin', 'Cairo', 'Riyadh', 'Jakarta', 'Bangkok', 'Toronto', 'Johannesburg'
          ]);
          const globalMarkerDistance = new Cesium.DistanceDisplayCondition(0, 50000000);

          cities.forEach((city) => {
            if (!active || viewer.isDestroyed()) return;
            const isTier1 = GLOBAL_TIER1_HUBS.has(city.name);
            const pop = city.offsets?.population || 0.01;
            const isTier2 = !isTier1 && (pop > 0.008 || city.year === 2030);

            const labelDistance = isTier1 
              ? new Cesium.DistanceDisplayCondition(0, 18000000) 
              : (isTier2 ? new Cesium.DistanceDisplayCondition(0, 8500000) : new Cesium.DistanceDisplayCondition(0, 4500000));

            const isVisible = activeLayers.cities;
            const isYearActive = (!city.year || city.year <= activeYear);
            const coreSize = isTier1 ? 4.2 : (isTier2 ? 3.4 : 2.8);

            const cityEnt = safeAddEntity({
              position: Cesium.Cartesian3.fromDegrees(city.lon, city.lat),
              show: isVisible,
              point: {
                pixelSize: coreSize,
                color: isYearActive ? (isTier1 ? whiteRedCore : baseCrimson) : baseCrimson.withAlpha(0.65),
                outlineColor: isTier1 ? baseCrimson : glowCrimson.withAlpha(0.85),
                outlineWidth: isTier1 ? 2.5 : 1.5,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                distanceDisplayCondition: globalMarkerDistance,
                scaleByDistance: new Cesium.NearFarScalar(1500000, 1.2, 35000000, 0.65),
              },
              label: {
                text: city.name.toUpperCase(),
                font: '600 10px "Inter", -apple-system, sans-serif',
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                fillColor: isYearActive ? Cesium.Color.WHITE : Cesium.Color.WHITE.withAlpha(0.7),
                outlineColor: Cesium.Color.fromCssColorString('#0a0204'),
                outlineWidth: 3,
                pixelOffset: new Cesium.Cartesian2(0, -12),
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                distanceDisplayCondition: labelDistance,
              },
              properties: { cityData: city },
            });
            if (cityEnt) {
              (cityEnt as any).cityData = city;
              cityEnt.layerId = 'cities';
              cityEnt.cityYear = city.year || 2030;
            }
          });
        } else {
          const cyberCityColor = Cesium.Color.fromCssColorString('#FF3B4D');
          cities.forEach((city) => {
            if (!active || viewer.isDestroyed()) return;
            const pos = Cesium.Cartesian3.fromDegrees(city.lon, city.lat, 10000);
            const isVisible = activeLayers.cities;
            const isYearActive = (!city.year || city.year <= activeYear);

            const corePt = mainNodeCollection.add({
              position: pos,
              color: isYearActive ? Cesium.Color.WHITE : cyberCityColor.withAlpha(0.7),
              pixelSize: 4.5,
              show: isVisible,
              translucencyByDistance: new Cesium.NearFarScalar(1500000, 1.0, 35000000, 0.65),
              scaleByDistance: new Cesium.NearFarScalar(1500000, 1.0, 35000000, 0.45),
            });

            const glowPt = mainNodeCollection.add({
              position: pos,
              color: cyberCityColor.withAlpha(0.35),
              pixelSize: 8.5,
              show: isVisible,
              translucencyByDistance: new Cesium.NearFarScalar(1500000, 1.0, 35000000, 0.40),
              scaleByDistance: new Cesium.NearFarScalar(1500000, 1.0, 35000000, 0.45),
            });

            const outerPt = mainNodeCollection.add({
              position: pos,
              color: cyberCityColor.withAlpha(0.12),
              pixelSize: 14.0,
              show: isVisible,
              translucencyByDistance: new Cesium.NearFarScalar(1500000, 1.0, 35000000, 0.20),
              scaleByDistance: new Cesium.NearFarScalar(1500000, 1.0, 35000000, 0.45),
            });

            corePt._cityRef = city;
            glowPt._cityRef = city;
            outerPt._cityRef = city;

            mainNodeAnimData.push({
              phase: Math.random() * Math.PI * 2,
              period: 1.4 + Math.random() * 1.2,
              baseSize: 12,
              tier: 3,
              color: cyberCityColor,
              corePt,
              glowPt,
              outerPt,
            });
          });
        }

        console.log(`[ChronoEarth] cities: ${(performance.now() - startTime).toFixed(1)} ms (took ${(performance.now() - stageStart).toFixed(1)} ms)`);
      },
      // Stage 3: night-light imagery
      () => {
        const stageStart = performance.now();
        if (viewer.isDestroyed() || !active) return;
        // Night lights reference stage (can be used for additional styled imagery)
        console.log(`[ChronoEarth] night lights: ${(performance.now() - startTime).toFixed(1)} ms (took ${(performance.now() - stageStart).toFixed(1)} ms)`);
      },
      // Stage 4: satellite/orbit visuals
      () => {
        const stageStart = performance.now();
        if (viewer.isDestroyed() || !active) return;

        if (isCyber) {
          let orbitCount = 0;
          const maxOrbitTracks = 8;

          ORBITAL_SHELLS.forEach((shell, shIdx) => {
            if (orbitCount >= maxOrbitTracks) return;
            orbitCount++;
            const R = shell.radius;
            const { tiltX, tiltY } = shell;

            const ringPts = Array.from({ length: 181 }, (_, i) => {
              const a = (i / 180) * Math.PI * 2;
              const { x, y, z } = rotateXY(R * Math.cos(a), R * Math.sin(a), 0, tiltX, tiltY);
              return new Cesium.Cartesian3(x, y, z);
            });

            if (!isMobile) {
              const ringEnt = safeAddEntity({
                polyline: {
                  positions: ringPts,
                  width: 0.8,
                  material: Cesium.Color.WHITE.withAlpha(0.008),
                  arcType: Cesium.ArcType.GEODESIC,
                  granularity: Cesium.Math.toRadians(8.0),
                },
              });
              if (ringEnt) ringEnt.layerId = 'space';
            }

            for (let s = 0; s < shell.sats; s++) {
              if (isMobile && s > 0) continue;
              const phase0 = (s / shell.sats) * Math.PI * 2;
              const speed = shell.speed;

              const satEnt = safeAddEntity({
                position: new Cesium.CallbackProperty(() => {
                  const a = (timeRef.current * speed + phase0) % (Math.PI * 2);
                  const { x, y, z } = rotateXY(R * Math.cos(a), R * Math.sin(a), 0, tiltX, tiltY);
                  return new Cesium.Cartesian3(x, y, z);
                }, false),
                point: {
                  pixelSize: 1.2,
                  color: Cesium.Color.WHITE.withAlpha(0.70),
                  outlineColor: Cesium.Color.WHITE.withAlpha(0.25),
                  outlineWidth: 0.5,
                },
              });
              if (satEnt) satEnt.layerId = 'space';
            }
          });

          if (!isMobile) {
            const R_iss = 6378137 + 420000;
            const tiltX_iss = Cesium.Math.toRadians(51.6);
            const tiltY_iss = Cesium.Math.toRadians(12.0);

            const issTrackPts = Array.from({ length: 181 }, (_, i) => {
              const a = (i / 180) * Math.PI * 2;
              const { x, y, z } = rotateXY(R_iss * Math.cos(a), R_iss * Math.sin(a), 0, tiltX_iss, tiltY_iss);
              return new Cesium.Cartesian3(x, y, z);
            });

            const issTrack = safeAddEntity({
              polyline: {
                positions: issTrackPts,
                width: 0.6,
                material: Cesium.Color.fromCssColorString('#FFDF9E').withAlpha(0.012),
                arcType: Cesium.ArcType.GEODESIC,
                granularity: Cesium.Math.toRadians(6.0),
              },
            });
            if (issTrack) issTrack.layerId = 'space';

            const issSat = safeAddEntity({
              position: new Cesium.CallbackProperty(() => {
                const a = (timeRef.current * 0.08) % (Math.PI * 2);
                const { x, y, z } = rotateXY(R_iss * Math.cos(a), R_iss * Math.sin(a), 0, tiltX_iss, tiltY_iss);
                return new Cesium.Cartesian3(x, y, z);
              }, false),
              point: {
                pixelSize: new Cesium.CallbackProperty(() => {
                  return 2.5 + 0.8 * Math.sin(timeRef.current * 4.0);
                }, false),
                color: Cesium.Color.fromCssColorString('#FFE6A3'),
                outlineColor: Cesium.Color.fromCssColorString('#FF9D20').withAlpha(0.4),
                outlineWidth: 1.0,
              },
            });
            if (issSat) issSat.layerId = 'space';
          }
        }

        console.log(`[ChronoEarth] satellites: ${(performance.now() - startTime).toFixed(1)} ms (took ${(performance.now() - stageStart).toFixed(1)} ms)`);
      },
      // Stage 5: network arcs
      () => {
        const stageStart = performance.now();
        if (viewer.isDestroyed() || !active) return;

        if (isCyber) {
          let routeCount = 0;
          const maxAnimatedRoutes = 10;

          HIGHWAYS.forEach((hw, hwIdx) => {
            if (routeCount >= maxAnimatedRoutes) return;
            const ca = hubCoord(hw.a);
            const cb = hubCoord(hw.b);
            if (!ca || !cb) return;
            routeCount++;

            const arcPoints = geodesicArc(ca, cb, hw.alt);

            if (!isMobile) {
              safeAddEntity({
                polyline: {
                  positions: arcPoints,
                  width: 0.6,
                  material: Cesium.Color.fromCssColorString(C.emerald).withAlpha(0.04),
                  arcType: Cesium.ArcType.NONE,
                },
              });

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

              safeAddEntity({
                polyline: {
                  positions: pulsePositions,
                  width: 1.2,
                  material: new Cesium.PolylineGlowMaterialProperty({
                    glowPower: 0.1,
                    taperPower: 0.15,
                    color: Cesium.Color.fromCssColorString(C.cyan).withAlpha(0.25),
                  }),
                  arcType: Cesium.ArcType.NONE,
                },
              });
            }
          });

          AUTONOMOUS_ROUTES.forEach((conn, index) => {
            if (isMobile && index % 2 !== 0) return;
            const ca = cities.find(c => c.name === conn.a);
            const cb = cities.find(c => c.name === conn.b);
            if (ca && cb) {
              citiesRoutesLines.add({
                positions: Cesium.Cartesian3.fromDegreesArray([ca.lon, ca.lat, cb.lon, cb.lat]),
                width: 0.6,
                color: Cesium.Color.fromCssColorString('#FFA726').withAlpha(0.07),
              });
            }
          });

          QUANTUM_LINKS.forEach((link, index) => {
            if (isMobile && index % 2 !== 0) return;
            techLines.add({
              positions: Cesium.Cartesian3.fromDegreesArray([link.a.lon, link.a.lat, link.b.lon, link.b.lat]),
              width: 0.6,
              color: Cesium.Color.fromCssColorString('#9933FF').withAlpha(0.08),
            });
          });

          FUSION_GRID.forEach((grid, index) => {
            if (isMobile && index % 2 !== 0) return;
            energyLines.add({
              positions: Cesium.Cartesian3.fromDegreesArray([grid.a.lon, grid.a.lat, grid.b.lon, grid.b.lat]),
              width: 0.6,
              color: Cesium.Color.fromCssColorString('#FF9900').withAlpha(0.08),
            });
          });

          GEOPOLITICAL_LANES.forEach((lane, index) => {
            if (isMobile && index % 2 !== 0) return;
            const flatCoords = lane.coords.flatMap(c => [c.lon, c.lat]);
            geoLines.add({
              positions: Cesium.Cartesian3.fromDegreesArray(flatCoords),
              width: 0.6,
              color: Cesium.Color.fromCssColorString(lane.isArctic ? '#00FFFF' : '#1F75FE').withAlpha(0.08),
            });
          });

          const AVIATION_LANES = [
            { a: { lat: 51.5074, lon: -0.1278 }, b: { lat: 40.7128, lon: -74.0060 } },
            { a: { lat: 48.8566, lon: 2.3522 }, b: { lat: 25.2048, lon: 55.2708 } },
            { a: { lat: 35.6762, lon: 139.6503 }, b: { lat: 34.0522, lon: -118.2437 } }
          ];
          AVIATION_LANES.forEach((lane) => {
            const pts = geodesicArc(lane.a, lane.b, 650000);
            geoLines.add({
              positions: pts,
              width: 0.5,
              color: Cesium.Color.fromCssColorString('#00FF66').withAlpha(0.04),
            });
          });

          SEMI_SUPPLY_LINKS.forEach((link, index) => {
            if (isMobile && index % 2 !== 0) return;
            marketsLines.add({
              positions: Cesium.Cartesian3.fromDegreesArray([link.a.lon, link.a.lat, link.b.lon, link.b.lat]),
              width: 0.6,
              color: Cesium.Color.fromCssColorString('#00E5FF').withAlpha(0.07),
            });
          });
        }

        console.log(`[ChronoEarth] network arcs: ${(performance.now() - startTime).toFixed(1)} ms (took ${(performance.now() - stageStart).toFixed(1)} ms)`);
      },
      // Stage 6: telemetry rings
      () => {
        const stageStart = performance.now();
        if (viewer.isDestroyed() || !active) return;

        if (isCyber && !isMobile) {
          const orbitPts: any[] = [];
          const incl = Cesium.Math.toRadians(32.0);
          for (let i = 0; i <= 360; i += 2) {
            const rad = Cesium.Math.toRadians(i);
            const r = 6378137 + 750000;
            const x = r * Math.cos(rad);
            const y = r * Math.sin(rad) * Math.cos(incl);
            const z = r * Math.sin(rad) * Math.sin(incl);
            orbitPts.push(new Cesium.Cartesian3(x, y, z));
          }
          safeAddEntity({
            polyline: {
              positions: orbitPts,
              width: 0.8,
              material: Cesium.Color.fromCssColorString('#00FFFF').withAlpha(0.08),
              arcType: Cesium.ArcType.NONE,
            }
          });

          const equatorialRingPts = Array.from({ length: 361 }, (_, i) => {
            const a = (i / 360) * Math.PI * 2;
            const R = 6378137 + 10000;
            return new Cesium.Cartesian3(R * Math.cos(a), R * Math.sin(a), 0);
          });
          safeAddEntity({
            polyline: {
              positions: equatorialRingPts,
              width: 0.8,
              material: Cesium.Color.fromCssColorString(C.cyan).withAlpha(0.025),
              arcType: Cesium.ArcType.GEODESIC,
              granularity: Cesium.Math.toRadians(4.0),
            },
          });
        }

        console.log(`[ChronoEarth] telemetry: ${(performance.now() - startTime).toFixed(1)} ms (took ${(performance.now() - stageStart).toFixed(1)} ms)`);
      },
      // Stage 7: pulses/animations
      () => {
        const stageStart = performance.now();
        if (viewer.isDestroyed() || !active) return;

        if (isCyber) {
          const cyberCityColor = Cesium.Color.fromCssColorString('#FF3B4D');

          cities.forEach((city) => {
            if (!active || viewer.isDestroyed()) return;
            const isVisible = activeLayers.cities;

            if (city.year === 2030 || (city.offsets?.population || 0) > 0.015) {
              for (let r = 0; r < 2; r++) {
                const ringEnt = safeAddEntity({
                  position: Cesium.Cartesian3.fromDegrees(city.lon, city.lat),
                  show: isVisible,
                  ellipse: {
                    semiMajorAxis: new Cesium.CallbackProperty(() => {
                      const offset = r * 0.5;
                      const cycle = ((timeRef.current * 0.5 + offset) % 1.0);
                      return 40000 + cycle * 260000;
                    }, false),
                    semiMinorAxis: new Cesium.CallbackProperty(() => {
                      const offset = r * 0.5;
                      const cycle = ((timeRef.current * 0.5 + offset) % 1.0);
                      return 40000 + cycle * 260000;
                    }, false),
                    material: new Cesium.ColorMaterialProperty(
                      new Cesium.CallbackProperty(() => {
                        const offset = r * 0.5;
                        const cycle = ((timeRef.current * 0.5 + offset) % 1.0);
                        const alpha = (1.0 - cycle) * 0.35;
                        return cyberCityColor.withAlpha(alpha);
                      }, false)
                    ),
                    height: 4000,
                    outline: true,
                    outlineColor: new Cesium.CallbackProperty(() => {
                      const offset = r * 0.5;
                      const cycle = ((timeRef.current * 0.5 + offset) % 1.0);
                      const alpha = (1.0 - cycle) * 0.5;
                      return cyberCityColor.withAlpha(alpha);
                    }, false),
                    outlineWidth: 1.5,
                  }
                });
                if (ringEnt) {
                  ringEnt.layerId = 'cities';
                  ringEnt.cityYear = city.year || 2030;
                }
              }

              const beaconEnt = safeAddEntity({
                show: isVisible,
                polyline: {
                  positions: [
                    Cesium.Cartesian3.fromDegrees(city.lon, city.lat, 0),
                    Cesium.Cartesian3.fromDegrees(city.lon, city.lat, 600000)
                  ],
                  width: new Cesium.CallbackProperty(() => {
                    return 3.0 + 1.5 * Math.sin(timeRef.current * 4.0);
                  }, false),
                  material: new Cesium.PolylineGlowMaterialProperty({
                    glowPower: 0.3,
                    taperPower: 0.85,
                    color: cyberCityColor.withAlpha(0.75),
                  }),
                  arcType: Cesium.ArcType.NONE,
                  distanceDisplayCondition: new Cesium.DistanceDisplayCondition(2500000, 35000000),
                }
              });
              if (beaconEnt) {
                beaconEnt.layerId = 'cities';
                beaconEnt.cityYear = city.year || 2030;
              }
            }
          });

          const scratchColor = new Cesium.Color();
          let lastRotTime = performance.now();
          const animate = () => {
            if (viewer.isDestroyed() || !active) return;

            const nowMs = performance.now();
            const dt = Math.min(0.1, (nowMs - lastRotTime) / 1000);
            lastRotTime = nowMs;

            const isPaused = isInteractingRef.current || isFlyingRef.current || !!activeCityRef.current || (Date.now() - lastInteractionTimeRef.current < 4500);
            if (!isPaused && isGlobeReady) {
              viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, -0.00035 * dt);
            }

            const time = timeRef.current;
            const numMain = mainNodeAnimData.length;
            for (let i = 0; i < numMain; i++) {
              const anim = mainNodeAnimData[i];
              if (!anim) continue;

              const pulse = 0.75 + 0.25 * Math.sin(time * 1.4 * ((Math.PI * 2) / anim.period) + anim.phase);

              const isSel = activeCityRef.current?.name === anim.corePt._cityRef?.name;
              const isHover = hoveredCityRef.current?.name === anim.corePt._cityRef?.name;

              let flashIntensity = 0.0;
              if (anim.tier === 3) {
                const flashCycle = (time * 0.8 + anim.phase) % 4.0;
                if (flashCycle < 0.35) {
                  flashIntensity = 1.0 - (flashCycle / 0.35);
                }
              }

              const scale = (isSel ? 2.0 : (isHover ? 1.4 : 1.0)) * (1.0 + 0.5 * flashIntensity);

              const baseCore = anim.tier === 3 ? 5.0 : 3.0;
              const baseGlow = anim.tier === 3 ? 10.0 : 6.0;
              const baseHalo = anim.tier === 3 ? 16.0 : 10.0;

              if (anim.corePt) {
                anim.corePt.pixelSize = baseCore * scale * (0.9 + 0.1 * pulse);
                scratchColor.red = 1.0;
                scratchColor.green = 1.0;
                scratchColor.blue = 1.0;
                scratchColor.alpha = Math.min(1.0, 0.85 + 0.15 * pulse + 0.15 * flashIntensity);
                if (!disableDots) anim.corePt.color = scratchColor;
              }

              if (anim.glowPt) {
                const glowFactor = 0.70 + 0.30 * pulse;
                anim.glowPt.pixelSize = baseGlow * scale * glowFactor;
                const animColor = anim.color;
                scratchColor.red = Math.min(1.0, animColor.red + 0.3 * flashIntensity);
                scratchColor.green = Math.min(1.0, animColor.green + 0.3 * flashIntensity);
                scratchColor.blue = Math.min(1.0, animColor.blue + 0.3 * flashIntensity);
                scratchColor.alpha = Math.min(1.0, (0.55 * pulse + 0.25) * (isSel ? 1.0 : (isHover ? 0.90 : 0.80)) + 0.35 * flashIntensity);
                if (!disableDots) anim.glowPt.color = scratchColor;
              }

              if (anim.outerPt) {
                const outerFactor = 0.60 + 0.40 * pulse;
                anim.outerPt.pixelSize = baseHalo * scale * outerFactor;
                const animColor = anim.color;
                scratchColor.red = animColor.red;
                scratchColor.green = animColor.green;
                scratchColor.blue = animColor.blue;
                scratchColor.alpha = Math.min(1.0, (0.15 * pulse + 0.05) + 0.15 * flashIntensity);
                if (!disableDots) anim.outerPt.color = scratchColor;
              }
            }
          };

          removeRenderListener = viewer.scene.preRender.addEventListener(animate);
        }

        console.log(`[ChronoEarth] pulses/animations: ${(performance.now() - startTime).toFixed(1)} ms (took ${(performance.now() - stageStart).toFixed(1)} ms)`);
      },
      // Stage 8: other non-essential overlays
      () => {
        const stageStart = performance.now();
        if (viewer.isDestroyed() || !active) return;

        if (isCyber) {
          CLIMATE_REGIONS.forEach(r => {
            const ent = safeAddEntity({
              position: Cesium.Cartesian3.fromDegrees(r.lon, r.lat),
              ellipse: {
                semiMajorAxis: r.radius,
                semiMinorAxis: r.radius,
                material: Cesium.Color.fromCssColorString(r.color).withAlpha(0.02),
                outline: true,
                outlineColor: Cesium.Color.fromCssColorString(r.color).withAlpha(0.12),
                outlineWidth: 1.0,
                height: 1000,
                granularity: isMobile ? Cesium.Math.RADIANS_PER_DEGREE * 5.0 : Cesium.Math.RADIANS_PER_DEGREE
              }
            });
            if (ent) ent.layerId = 'climate';
          });

          FLOOD_ZONES.forEach(fz => {
            const ent = safeAddEntity({
              position: Cesium.Cartesian3.fromDegrees(fz.lon, fz.lat),
              ellipse: {
                semiMajorAxis: fz.radius,
                semiMinorAxis: fz.radius,
                material: Cesium.Color.fromCssColorString('#FF0055').withAlpha(0.02),
                outline: true,
                outlineColor: Cesium.Color.fromCssColorString('#FF0055').withAlpha(0.12),
                outlineWidth: 1.0,
                height: 2000,
                granularity: isMobile ? Cesium.Math.RADIANS_PER_DEGREE * 5.0 : Cesium.Math.RADIANS_PER_DEGREE
              }
            });
            if (ent) {
              ent.layerId = 'climate';
              ent.isFloodOutline = true;
            }
          });

          TECH_HUBS.forEach((th, index) => {
            if (isMobile && index % 2 !== 0) return;
            techPoints.add({
              position: Cesium.Cartesian3.fromDegrees(th.lon, th.lat, 9000),
              pixelSize: 5.5,
              color: Cesium.Color.fromCssColorString('#BF5AF2'),
              outlineColor: Cesium.Color.WHITE.withAlpha(0.5),
              outlineWidth: 1.0,
            });
          });

          LANDING_STATIONS.forEach((ls, index) => {
            if (isMobile && index % 2 !== 0) return;
            techPoints.add({
              position: Cesium.Cartesian3.fromDegrees(ls.lon, ls.lat, 9000),
              pixelSize: 4.5,
              color: Cesium.Color.fromCssColorString('#9933FF'),
              outlineColor: Cesium.Color.WHITE.withAlpha(0.4),
              outlineWidth: 1.0,
            });
          });

          FUSION_HUBS.forEach((fh, index) => {
            if (isMobile && index % 2 !== 0) return;
            energyPoints.add({
              position: Cesium.Cartesian3.fromDegrees(fh.lon, fh.lat, 9000),
              pixelSize: 6.0,
              color: Cesium.Color.fromCssColorString('#FFD60A'),
              outlineColor: Cesium.Color.fromCssColorString('#FFA000').withAlpha(0.5),
              outlineWidth: 1.0,
            });
          });

          SPACEPORTS.forEach((sp, index) => {
            if (isMobile && index % 2 !== 0) return;
            spacePoints.add({
              position: Cesium.Cartesian3.fromDegrees(sp.lon, sp.lat, 9000),
              pixelSize: 5.5,
              color: Cesium.Color.fromCssColorString('#FF3366'),
              outlineColor: Cesium.Color.WHITE.withAlpha(0.5),
              outlineWidth: 1.0,
            });
          });

          MINERAL_NODES.forEach((mn, index) => {
            if (isMobile && index % 2 !== 0) return;
            geoPoints.add({
              position: Cesium.Cartesian3.fromDegrees(mn.lon, mn.lat, 9000),
              pixelSize: 4.5,
              color: Cesium.Color.fromCssColorString('#007FFF'),
              outlineColor: Cesium.Color.WHITE.withAlpha(0.4),
              outlineWidth: 1.0,
            });
          });

          CHOKE_POINTS.forEach((cp, index) => {
            if (isMobile && index % 2 !== 0) return;
            geoPoints.add({
              position: Cesium.Cartesian3.fromDegrees(cp.lon, cp.lat, 9000),
              pixelSize: 5.5,
              color: Cesium.Color.fromCssColorString('#005FFF'),
              outlineColor: Cesium.Color.fromCssColorString('#88C5FF'),
              outlineWidth: 1.0,
            });
          });

          SEMI_FABS.forEach((fab, index) => {
            if (isMobile && index % 2 !== 0) return;
            marketsPoints.add({
              position: Cesium.Cartesian3.fromDegrees(fab.lon, fab.lat, 9000),
              pixelSize: 5.5,
              color: Cesium.Color.fromCssColorString('#00E5FF'),
              outlineColor: Cesium.Color.WHITE.withAlpha(0.5),
              outlineWidth: 1.0,
            });
          });
        }

        console.log(`[ChronoEarth] final initialization: ${(performance.now() - startTime).toFixed(1)} ms (took ${(performance.now() - stageStart).toFixed(1)} ms)`);
        console.log(`[ChronoEarth] Intelligence layers complete: ${(performance.now() - startTime).toFixed(1)} ms`);
      }
    ];

    let currentStage = 0;
    const runNextStage = () => {
      if (!active || viewer.isDestroyed()) return;
      if (currentStage < stages.length) {
        stages[currentStage]();
        currentStage++;
        const id = setTimeout(runNextStage, 100);
        timeouts.push(id);
      }
    };

    // Begin progressive staged loading of overlays after the main thread relaxes
    const initialDelay = setTimeout(runNextStage, 200);
    timeouts.push(initialDelay);

    return () => {
      active = false;
      timeouts.forEach(id => clearTimeout(id));
      if (removeRenderListener) removeRenderListener();
      
      if (viewer._updateBorderAlphaListener) {
        viewer.camera.changed.removeEventListener(viewer._updateBorderAlphaListener);
        viewer._updateBorderAlphaListener = null;
      }

      if (!viewer.isDestroyed()) {
        viewer.entities.removeAll();
        
        if (viewer._borderLayer) {
          viewer.imageryLayers.remove(viewer._borderLayer);
          viewer._borderLayer = null;
        }

        if (isCyber) {
          if (dotCollection) viewer.scene.primitives.remove(dotCollection);
          if (staticNodeCollection) viewer.scene.primitives.remove(staticNodeCollection);
          if (mainNodeCollection) viewer.scene.primitives.remove(mainNodeCollection);
          if (beamCollection) viewer.scene.primitives.remove(beamCollection);
          if (citiesRoutesLines) viewer.scene.primitives.remove(citiesRoutesLines);
          if (techPoints) viewer.scene.primitives.remove(techPoints);
          if (techLines) viewer.scene.primitives.remove(techLines);
          if (energyPoints) viewer.scene.primitives.remove(energyPoints);
          if (energyLines) viewer.scene.primitives.remove(energyLines);
          if (spacePoints) viewer.scene.primitives.remove(spacePoints);
          if (geoPoints) viewer.scene.primitives.remove(geoPoints);
          if (geoLines) viewer.scene.primitives.remove(geoLines);
          if (marketsPoints) viewer.scene.primitives.remove(marketsPoints);
          if (marketsLines) viewer.scene.primitives.remove(marketsLines);
        }
      }
    };
  }, [isGlobeReady, earthMode, isMobile]);

  // ─── Year Transition Handler ───────────────────────────────────────────────
  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current) return;
    const viewer = viewerRef.current;
    // Update visibility of entities (Realistic Mode + Cyber custom entities)
    viewer.entities.values.forEach((e: any) => {
      if (e.point && e.properties?.cityData) {
        const cityData = e.properties.cityData.getValue();
        e.show = (!cityData.year || cityData.year <= activeYear);
      } else if (e.layerId === 'cities' && e.cityYear) {
        const isYearVisible = (e.cityYear <= activeYear);
        e.show = activeLayers.cities && isYearVisible;
      }
    });

    // Update visibility of PointPrimitives (Cyber Mode)
    for (let i = 0; i < viewer.scene.primitives.length; i++) {
      const p = viewer.scene.primitives.get(i);
      if (p instanceof Cesium.PointPrimitiveCollection) {
        for (let j = 0; j < p.length; j++) {
          const pt = p.get(j);
          if (pt && pt._cityRef) {
            pt.show = (!pt._cityRef.year || pt._cityRef.year <= activeYear);
          }
        }
      }
    }
  }, [activeYear, isGlobeReady]);

  // ─── Layers & Simulations Visibility Handler ─────────────────────────────────
  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current) return;
    const viewer = viewerRef.current;

    viewer.entities.values.forEach((e: any) => {
      if (e.layerId) {
        const isActive = activeLayers[e.layerId as keyof typeof activeLayers] ?? false;
        let shouldShow = isActive;

        if (e.isFloodOutline) {
          shouldShow = isActive && (activeSimulations.seaLevelRise > 0);
        }

        if (e.cityYear) {
          shouldShow = shouldShow && (e.cityYear <= activeYear);
        }

        e.show = shouldShow;

        if (e.isArcticRoute) {
          if (activeSimulations.arcticDominance) {
            e.polyline.width = 2.4;
            e.polyline.material = Cesium.Color.fromCssColorString('#00FF66');
          } else {
            e.polyline.width = 1.2;
            e.polyline.material = Cesium.Color.fromCssColorString('#00FFFF').withAlpha(0.35);
          }
        }
      }
    });

    // Toggle city points visibility based on activeLayers.cities
    for (let i = 0; i < viewer.scene.primitives.length; i++) {
      const p = viewer.scene.primitives.get(i);
      if (p instanceof Cesium.PointPrimitiveCollection) {
        for (let j = 0; j < p.length; j++) {
          const pt = p.get(j);
          if (pt && pt._cityRef) {
            const isYearVisible = (!pt._cityRef.year || pt._cityRef.year <= activeYear);
            pt.show = activeLayers.cities && isYearVisible;
          }
        }
      }
    }

  }, [activeLayers, activeSimulations, activeYear, isGlobeReady]);

  // ─── Camera: fly to active country ─────────────────────────────────────────
  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current || !activeCountry) return;
    const viewer = viewerRef.current;
    if (viewer.isDestroyed()) return;

    const coord = COUNTRY_COORDINATES[activeCountry];
    if (coord) {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(coord.lon, coord.lat - 1.5, coord.height),
        duration: 3.0,
        easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
      });
    }
  }, [activeCountry, isGlobeReady]);

  // ─── Selection state updates (in-place highlight to avoid full reconstruction) ───
  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current) return;
    const viewer = viewerRef.current;
    if (viewer.isDestroyed()) return;

    // 1. Update entities (for Realistic Mode)
    viewer.entities.values.forEach((e: any) => {
      if (e.point && e.properties?.cityData) {
        const cityData = e.properties.cityData.getValue();
        const isSel = activeCity?.name === cityData.name;
        e.point.pixelSize = isSel ? 6 : 4;
        e.point.color = Cesium.Color.WHITE.withAlpha(isSel ? 0.90 : 0.50);
      }
    });
  }, [activeCity, isGlobeReady]);

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
    const [lat, lon, height] = targets[activeCategory] ?? [20.0, 0.0, 12500000];
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
      duration: 3.5,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
    });
  }, [activeCategory, activeCity, isGlobeReady]);

  // ─── Camera: fly to focusCoords ────────────────────────────────────────────
  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current || !focusCoords) return;
    const viewer = viewerRef.current;
    if (viewer.isDestroyed()) return;

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(focusCoords.lon, focusCoords.lat - 1.0, focusCoords.height || 1800000),
      duration: 3.0,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
    });
  }, [focusCoords, isGlobeReady]);

  // ─── Seismic Layer: Draw live earthquakes ──────────────────────────────────
  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current) return;
    const viewer = viewerRef.current;
    if (viewer.isDestroyed()) return;

    // Clear old earthquake markers
    earthquakeEntitiesRef.current.forEach(e => {
      if (viewer && !viewer.isDestroyed()) {
        viewer.entities.remove(e);
      }
    });
    earthquakeEntitiesRef.current = [];

    // Draw new ones if seismic layer is toggled on
    if (activeLayers.seismic && earthquakes && earthquakes.length > 0) {
      earthquakes.slice(0, 50).forEach(eq => {
        const color = eq.magnitude >= 6.0 
          ? Cesium.Color.fromCssColorString('#EF4444') 
          : (eq.magnitude >= 5.0 ? Cesium.Color.fromCssColorString('#F97316') : Cesium.Color.fromCssColorString('#EAB308'));
        
        const eqEnt = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(eq.lon, eq.lat, 8000), // Raised slightly for depth testing
          point: {
            pixelSize: Math.max(8, eq.magnitude * 2.5),
            color: color.withAlpha(0.85),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 1.5,
            translucencyByDistance: new Cesium.NearFarScalar(1500000, 1.0, 16000000, 0.3),
            scaleByDistance: new Cesium.NearFarScalar(1500000, 1.0, 16000000, 0.4),
          },
          description: `Location: ${eq.place} | Mag: ${eq.magnitude}`
        });
        
        if (eqEnt) {
          eqEnt.layerId = 'seismic';
          earthquakeEntitiesRef.current.push(eqEnt);
        }

        // Animated seismic wave propagation ripple
        const eqRipple = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(eq.lon, eq.lat),
          ellipse: {
            semiMajorAxis: new Cesium.CallbackProperty(() => {
              const age = (timeRef.current * 0.4 + eq.magnitude) % 4.0; // 4 second loop
              return age * 220000; // expand up to 880km
            }, false),
            semiMinorAxis: new Cesium.CallbackProperty(() => {
              const age = (timeRef.current * 0.4 + eq.magnitude) % 4.0;
              return age * 220000;
            }, false),
            material: new Cesium.ColorMaterialProperty(
              new Cesium.CallbackProperty(() => {
                const age = (timeRef.current * 0.4 + eq.magnitude) % 4.0;
                const alpha = Math.max(0.0, 0.40 * (1.0 - age / 4.0));
                return Cesium.Color.fromCssColorString('#F97316').withAlpha(alpha); // Orange ripple
              }, false)
            ),
            height: 2000, // Clamp slightly off-ground for normal terrain visibility
          }
        });
        
        if (eqRipple) {
          eqRipple.layerId = 'seismic';
          earthquakeEntitiesRef.current.push(eqRipple);
        }
      });
    }
  }, [earthquakes, activeLayers.seismic, isGlobeReady]);

  // ─── Sync 3D Starfield Parallax & Rotation ──────────────────────────────────
  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current) return;
    const viewer = viewerRef.current;
    if (viewer.isDestroyed()) return;

    const mouseRef = { x: 0, y: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.x = (e.clientX / window.innerWidth - 0.5) * 12;
      mouseRef.y = (e.clientY / window.innerHeight - 0.5) * 12;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const syncBackground = () => {
      if (viewer.isDestroyed()) return;
      const bg = document.getElementById('space-background');
      if (bg) {
        const heading = viewer.camera.heading;
        bg.style.transform = `translate(${-mouseRef.x}px, ${-mouseRef.y}px) rotate(${-heading}rad) scale(1.15)`;
      }
    };

    viewer.scene.postRender.addEventListener(syncBackground);
    viewer.camera.changed.addEventListener(syncBackground);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (!viewer.isDestroyed()) {
        viewer.scene.postRender.removeEventListener(syncBackground);
        viewer.camera.changed.removeEventListener(syncBackground);
      }
    };
  }, [isGlobeReady]);

  // ─── Hover tracker ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current) return;
    const viewer = viewerRef.current;
    const update = () => {
      if (viewer.isDestroyed()) return;
      const city = hoveredCityRef.current;
      if (city) {
        const cart = Cesium.Cartesian3.fromDegrees(city.lon, city.lat);
        const pos  = viewer.scene.cartesianToCanvasCoordinates(cart);
        setHoverPos(pos ? { x: pos.x, y: pos.y } : null);
      } else { setHoverPos(null); }
    };
    viewer.scene.postRender.addEventListener(update);
    viewer.camera.changed.addEventListener(update);
    return () => {
      if (!viewer.isDestroyed()) {
        viewer.scene.postRender.removeEventListener(update);
        viewer.camera.changed.removeEventListener(update);
      }
    };
  }, [isGlobeReady]);

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
      
      // Auto-rotation around UNIT_Z
      v.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, speed * dt);
      
      // Faint floating/drift camera movement (slow orbital oscillation)
      const time = timeRef.current;
      const driftSpeed = 0.0006;
      v.scene.camera.rotate(Cesium.Cartesian3.UNIT_X, Math.sin(time * 0.4) * driftSpeed * dt);
      v.scene.camera.rotate(Cesium.Cartesian3.UNIT_Y, Math.cos(time * 0.3) * driftSpeed * dt);
      
      v.scene.requestRender();
    };
    const t = setTimeout(() => {
      const v = viewerRef.current;
      if (!v || v.isDestroyed()) return;
      v.scene.postRender.addEventListener(spin);
    }, 1500);
    return () => {
      clearTimeout(t);
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.scene.postRender.removeEventListener(spin);
      }
    };
  }, [isInteracting, activeCity, isGlobeReady]);

  // ─── Diagnostics Logger ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current) return;
    const viewer = viewerRef.current;

    const intervalId = setInterval(() => {
      if (viewer.isDestroyed()) return;

      const primCount = viewer.scene.primitives.length;
      let totalPoints = 0;
      let totalPolylines = 0;
      let estimatedVertices = 0;

      const CesiumGlobal = (window as any).Cesium || Cesium;
      for (let i = 0; i < viewer.scene.primitives.length; i++) {
        const p = viewer.scene.primitives.get(i);
        if (!p) continue;
        if (CesiumGlobal && CesiumGlobal.PointPrimitiveCollection && p instanceof CesiumGlobal.PointPrimitiveCollection) {
          totalPoints += p.length;
          estimatedVertices += p.length;
        } else if (CesiumGlobal && CesiumGlobal.PolylineCollection && p instanceof CesiumGlobal.PolylineCollection) {
          totalPolylines += p.length;
          for (let j = 0; j < p.length; j++) {
            const poly = p.get(j);
            if (poly && poly.positions) {
              estimatedVertices += poly.positions.length;
            }
          }
        }
      }

      viewer.entities.values.forEach((e: any) => {
        if (e.polyline) {
          totalPolylines++;
          const pos = e.polyline.positions ? e.polyline.positions.getValue() : null;
          if (pos && pos.length) {
            estimatedVertices += pos.length;
          }
        }
        if (e.polygon) {
          const hierarchy = e.polygon.hierarchy ? e.polygon.hierarchy.getValue() : null;
          if (hierarchy) {
            const countVertices = (h: any): number => {
              let pts = h.positions ? h.positions.length : 0;
              if (h.holes) {
                h.holes.forEach((hole: any) => { pts += countVertices(hole); });
              }
              return pts;
            };
            estimatedVertices += countVertices(hierarchy);
          }
        }
      });

      const imageryCount = viewer.imageryLayers ? viewer.imageryLayers.length : 0;
      const activePostRender = viewer.scene.postRender.numberOfListeners;
      const activeCameraChanged = viewer.camera.changed.numberOfListeners;

      const memory = (performance as any).memory;
      const heapUsed = memory ? `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB` : 'N/A';
      const heapLimit = memory ? `${(memory.jsHeapLimit / 1024 / 1024).toFixed(2)} MB` : 'N/A';

    }, 30000);

    return () => clearInterval(intervalId);
  }, [isGlobeReady]);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="absolute inset-0 w-full h-full bg-transparent z-0 overflow-hidden"
      onMouseDown={() => setIsInteracting(true)}   onMouseUp={() => setIsInteracting(false)}
      onTouchStart={() => setIsInteracting(true)}  onTouchEnd={() => setIsInteracting(false)}
      style={{
        transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
        transition: 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}
    >
      <div ref={containerRef} className="w-full h-full animate-globe-breathe" />

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
