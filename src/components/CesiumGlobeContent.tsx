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
  activeYear, activeCategory, activeCity, setActiveCity, activeCountry, setActiveCountry, overlays, earthMode, activeLayers, activeSimulations, cities = citiesRawData, focusCoords, earthquakes = []
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

    const viewer = new Cesium.Viewer(containerRef.current, {
      timeline: false, animation: false, baseLayerPicker: false,
      navigationHelpButton: false, homeButton: false, sceneModePicker: false,
      geocoder: false, infoBox: false, selectionIndicator: false,
      fullscreenButton: false, skyBox: false,
      navigationInstructionsInitiallyVisible: false,
      contextOptions: { webgl: { alpha: true } },
      creditContainer: document.createElement('div'),
    });

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
        viewer.scene.globe.maximumScreenSpaceError = 2.0;
      }
    }

    // Set camera starting viewpoint way out in deep space
    const cameraHeight = isMobileDevice ? 18000000 : 23500000;
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(0.0, 20.0, 38000000), // Deep space start
      orientation: { heading: 0, pitch: Cesium.Math.toRadians(-90), roll: 0 },
    });

    // Smooth cinematic zoom-in fly-in on load
    const flyTimeout = setTimeout(() => {
      if (viewer.isDestroyed()) return;
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(0.0, 20.0, cameraHeight),
        orientation: { heading: 0, pitch: Cesium.Math.toRadians(-90), roll: 0 },
        duration: 4.5,
        easingFunction: Cesium.EasingFunction.CUBIC_OUT,
      });
    }, 600);
    viewerRef.current = viewer;
     (window as any).viewer = viewer;

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

    // Globe ready
    let done = false;
    const onProgress = (q: number) => {
      if (q === 0 && !done) {
        done = true;
        setIsGlobeReady(true);
        if (viewer.scene.globe) {
          viewer.scene.globe.tileLoadProgressEvent.removeEventListener(onProgress);
        }
      }
    };
    if (viewer.scene.globe) {
      viewer.scene.globe.tileLoadProgressEvent.addEventListener(onProgress);
    }
    const safety = setTimeout(() => {
      if (!done) {
        done = true;
        setIsGlobeReady(true);
        if (viewer.scene.globe) {
          try { viewer.scene.globe.tileLoadProgressEvent.removeEventListener(onProgress); } catch(e){}
        }
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
      window.removeEventListener('resize', handleResize);
      clearTimeout(safety);
      clearTimeout(flyTimeout);
      if (viewer.scene.globe) {
        try { viewer.scene.globe.tileLoadProgressEvent.removeEventListener(onProgress); } catch(e){}
      }
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

    // Reset
    viewer.entities.removeAll();
    if (viewer.imageryLayers) {
      viewer.imageryLayers.removeAll();
    }
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
      // 1. Terrain Provider (World Terrain with normals for hill shading and water mask for specular reflections)
      Cesium.CesiumTerrainProvider.fromUrl('https://assets.ion.cesium.com/1/terrain', {
        requestVertexNormals: true,
        requestWaterMask: true
      })
      .then((tp: any) => {
        if (viewer.isDestroyed() || isCyber) return;
        viewer.terrainProvider = tp;
      })
      .catch(() => {});

      // 2. Day Imagery Layer
      Cesium.createWorldImageryAsync({ style: Cesium.IonWorldImageryStyle.AERIAL })
        .then((provider: any) => {
          if (viewer.isDestroyed() || isCyber) return;
          const lyr = viewer.imageryLayers.addImageryProvider(provider);
          lyr.brightness = 1.1;
          lyr.contrast = 1.25;
          lyr.saturation = 1.35;
          lyr.gamma = 1.1;
        })
        .catch(async () => {
          if (viewer.isDestroyed() || isCyber) return;
          try {
            const fb = await Cesium.ArcGisMapServerImageryProvider.fromUrl(
              'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
            );
            if (viewer.isDestroyed() || isCyber) return;
            const lyr = viewer.imageryLayers.addImageryProvider(fb);
            lyr.brightness = 1.1;
            lyr.contrast = 1.25;
            lyr.saturation = 1.35;
            lyr.gamma = 1.1;
          } catch (err) {
            // Fallback failed
          }
        });

      // 2. Night Lights (Black Marble) Layer
      Cesium.IonImageryProvider.fromAssetId(3812)
        .then((provider: any) => {
          if (viewer.isDestroyed() || isCyber) return;
          const lyr = viewer.imageryLayers.addImageryProvider(provider);
          lyr.dayAlpha = 0.0;
          lyr.nightAlpha = 1.0;
          lyr.brightness = 1.8;
        })
        .catch(async () => {
          if (viewer.isDestroyed() || isCyber) return;
          try {
            const fb = new Cesium.WebMapTileServiceImageryProvider({
              url: "https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/wmts.cgi",
              layer: "VIIRS_CityLights_2012",
              style: "default",
              format: "image/png",
              tileMatrixSetID: "EPSG4326_500m",
              credit: "Black Marble imagery courtesy NASA Earthdata",
              tilingScheme: new Cesium.GeographicTilingScheme()
            });
            if (viewer.isDestroyed() || isCyber) return;
            const lyr = viewer.imageryLayers.addImageryProvider(fb);
            lyr.dayAlpha = 0.0;
            lyr.nightAlpha = 1.0;
            lyr.brightness = 1.8;
          } catch (err) {
            // Fallback failed
          }
        });

      viewer.scene.light = new Cesium.DirectionalLight({
        direction: new Cesium.Cartesian3(-0.85, 0.0, -0.5), // Cinematic terminator angle
        color: Cesium.Color.fromCssColorString('#fffbe8'), // Warm golden sunlight
        intensity: 4.2, // Bright crisp light
      });
      viewer.scene.ambientColor = new Cesium.Color(0.01, 0.015, 0.03, 1.0);

      if (viewer.scene.globe) {
        viewer.scene.globe.showGroundAtmosphere = true;
        viewer.scene.globe.enableLighting = true;
        viewer.scene.globe.atmosphereLightIntensity = 12.0; // Glow limb
        viewer.scene.globe.atmosphereHueShift = 0.0;
        viewer.scene.globe.atmosphereSaturationShift = 0.1;
        viewer.scene.globe.atmosphereBrightnessShift = 0.15;
      }

      if (viewer.scene.skyAtmosphere) {
        viewer.scene.skyAtmosphere.show = true;
        viewer.scene.skyAtmosphere.brightnessShift = 0.1;
        viewer.scene.skyAtmosphere.saturationShift = 0.1;
      }

      // Cloud Shadows (performant simulated shadow projection)
      safeAddEntity({
        position: Cesium.Cartesian3.ZERO,
        orientation: new Cesium.CallbackProperty(() =>
          // Rotated slightly behind the actual clouds to project shadows away from the light source
          Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_Z, timeRef.current * 0.005 - 0.003), false),
        ellipsoid: {
          radii: new Cesium.Cartesian3(6378137 + 6000, 6378137 + 6000, 6378137 + 6000),
          material: new Cesium.ImageMaterialProperty({
            image: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png',
            transparent: true,
            color: Cesium.Color.BLACK.withAlpha(0.28), // Soft dark shadow
          }),
        },
      });

      // Clouds
      safeAddEntity({
        position: Cesium.Cartesian3.ZERO,
        orientation: new Cesium.CallbackProperty(() =>
          Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_Z, timeRef.current * 0.005), false),
        ellipsoid: {
          radii: new Cesium.Cartesian3(6378137 + 15000, 6378137 + 15000, 6378137 + 15000),
          material: new Cesium.ImageMaterialProperty({
            image: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png',
            transparent: true,
            color: Cesium.Color.WHITE.withAlpha(0.35),
          }),
        },
      });

      let rNodeCount = 0;
      const baseCityColor = Cesium.Color.fromCssColorString('#FF9D20'); // Natural warm sodium-vapor glow
      const fadeCondition = new Cesium.NearFarScalar(2000000, 1.0, 16000000, 0.0);
      const scaleCondition = new Cesium.NearFarScalar(2000000, 1.0, 16000000, 0.35);

      cities.forEach((city) => {
        if (rNodeCount >= 250) return;
        rNodeCount++;
        const isVisible = (!city.year || city.year <= activeYear);
        
        const pop = city.offsets.population || 0.01;
        const scaleFactor = Math.max(0.6, Math.min(1.8, pop * 50.0));
        const coreSize = 1.6 + 1.2 * scaleFactor;
        const bloomSize = 4.5 + 4.5 * scaleFactor;
        const maxAlpha = 0.2 + 0.3 * Math.min(1.0, pop * 40.0);
        
        // 1. Inner Core
        safeAddEntity({
          position: Cesium.Cartesian3.fromDegrees(city.lon, city.lat),
          show: isVisible,
          point: {
            pixelSize: coreSize,
            color: Cesium.Color.fromCssColorString('#FFFDF5'), // Warm white core
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            translucencyByDistance: fadeCondition,
            scaleByDistance: scaleCondition
          },
          properties: { cityData: city },
        });

        // 2. Outer Pulse Bloom
        safeAddEntity({
          position: Cesium.Cartesian3.fromDegrees(city.lon, city.lat),
          show: isVisible,
          point: {
            pixelSize: new Cesium.CallbackProperty(() => {
              const pulse = 0.85 + 0.15 * Math.sin(timeRef.current * 1.6 + city.lon * 0.2);
              return bloomSize * pulse;
            }, false),
            color: new Cesium.CallbackProperty(() => {
              const pulse = 0.5 + 0.3 * Math.sin(timeRef.current * 1.6 + city.lon * 0.2);
              return baseCityColor.withAlpha(maxAlpha * pulse);
            }, false),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            translucencyByDistance: fadeCondition,
            scaleByDistance: scaleCondition
          }
        });
      });

      return () => {
        if (!viewer.isDestroyed()) {
          viewer.entities.removeAll();
          viewer.dataSources.removeAll();
          if (viewer.imageryLayers) {
            viewer.imageryLayers.removeAll();
          }
        }
      };
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  CYBER 2050 MODE — PLANETARY AI OPERATING SYSTEM
    // ══════════════════════════════════════════════════════════════════════════

    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();

    // Set black/very dark base globe
    if (viewer.scene.globe) {
      viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#000103'); // darker space-black/blue
      viewer.scene.globe.showGroundAtmosphere = false; // removes pink terminator
      viewer.scene.globe.enableLighting = true;
      viewer.scene.globe.atmosphereLightIntensity = 0.0; // disable default atmosphere lighting to use our shells
    }

    // Set dark space ambient and directional lights
    viewer.scene.light = new Cesium.DirectionalLight({
      direction: new Cesium.Cartesian3(-0.55, -0.18, -0.82),
      color: Cesium.Color.fromCssColorString('#002615'), // Slightly brighter dark green
      intensity: 1.8, // breathing will animate this
    });
    viewer.scene.ambientColor = new Cesium.Color(0.0, 0.03, 0.01, 1.0);

    // Volumetric Atmospheric Limb (4 layers + outer breathing layer) - Desktop only
    // Volumetric Atmospheric Limb (4 layers + outer breathing layer) - Desktop only
    if (!isMobile) {
      const atmosphereShells = [
        { r: 6378137 + 115000, color: C.cyan, alpha: 0.0090 }, // wider and brighter
        { r: 6378137 + 75000,  color: C.cyan, alpha: 0.0160 },
        { r: 6378137 + 45000,  color: C.iceBlue, alpha: 0.0240 },
        { r: 6378137 + 20000,  color: C.iceBlue, alpha: 0.0380 },
      ];
      atmosphereShells.forEach((shell) => {
        safeAddEntity({
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
      safeAddEntity({
        position: Cesium.Cartesian3.ZERO,
        ellipsoid: {
          radii: new Cesium.CallbackProperty(() => {
            const pulse = 1.0 + 0.0025 * Math.sin(timeRef.current * 0.6);
            const r = (6378137 + 22000) * pulse; // Tighter breathing shell
            return new Cesium.Cartesian3(r, r, r);
          }, false),
          material: new Cesium.ColorMaterialProperty(
            new Cesium.CallbackProperty(() =>
              Cesium.Color.fromCssColorString(C.cyan).withAlpha(
                0.015 + 0.010 * Math.sin(timeRef.current * 0.6)
              ), false)
          ),
          fill: true,
          outline: false,
        },
      });

      // Equatorial Grid Ring representing planetary energy mesh
      const equatorialRingPts = Array.from({ length: 361 }, (_, i) => {
        const a = (i / 360) * Math.PI * 2;
        const R = 6378137 + 10000; // 10km above surface
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

    // Enable Depth & Bloom & Fog
    if (viewer.scene.postProcessStages && viewer.scene.postProcessStages.bloom) {
      viewer.scene.postProcessStages.bloom.enabled = !disableBloom;
      viewer.scene.postProcessStages.bloom.uniforms.glowOnly = false;
      viewer.scene.postProcessStages.bloom.uniforms.contrast = 130.0;
      viewer.scene.postProcessStages.bloom.uniforms.brightness = 0.015; // reduced by ~50% from 0.03
      viewer.scene.postProcessStages.bloom.uniforms.delta = 2.0;
      viewer.scene.postProcessStages.bloom.uniforms.sigma = 4.0;
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

    // Setup 8 Major Hubs (Tier 3) and standard cities (Tier 2) - Capped at 200 total
    let nodeCount = 0;
    const maxSurfaceNodes = 200;

    MAJOR_HUBS.forEach((hub) => {
      if (nodeCount >= maxSurfaceNodes) return;
      nodeCount++;

      const pos = Cesium.Cartesian3.fromDegrees(hub.lon, hub.lat, 10000); // Raised to prevent clipping during depth testing
      const color = Cesium.Color.fromCssColorString(hub.color);

      const fullCity = cities.find(c => c.name.toLowerCase() === hub.name.toLowerCase()) || {
        name: hub.name,
        country: 'Global',
        lat: hub.lat,
        lon: hub.lon,
        year: 2030,
        offsets: { population: 10.0, popGrowth: 1.02, tempRise: 1.0 },
        details: { climate: 'Operational adaptation.', energy: 'Nuclear fusion integration.', satellites: 'Stable bandwidth.' }
      };

      const isVisible = (!fullCity.year || fullCity.year <= activeYear);

      // Core point (white) - size 7
      const corePt = mainNodeCollection.add({
        position: pos,
        color: Cesium.Color.WHITE,
        pixelSize: 7,
        show: isVisible,
        translucencyByDistance: new Cesium.NearFarScalar(1500000, 1.0, 16000000, 0.15),
        scaleByDistance: new Cesium.NearFarScalar(1500000, 1.0, 16000000, 0.4),
      });

      // Inner glow (colored) - size 14, alpha 0.40
      const glowPt = mainNodeCollection.add({
        position: pos,
        color: color.withAlpha(0.40),
        pixelSize: 14,
        show: isVisible,
        translucencyByDistance: new Cesium.NearFarScalar(1500000, 1.0, 16000000, 0.10),
        scaleByDistance: new Cesium.NearFarScalar(1500000, 1.0, 16000000, 0.4),
      });

      // Outer halo (soft color) - size 22, alpha 0.08
      const outerPt = mainNodeCollection.add({
        position: pos,
        color: color.withAlpha(0.08),
        pixelSize: 22,
        show: isVisible,
        translucencyByDistance: new Cesium.NearFarScalar(1500000, 1.0, 16000000, 0.05),
        scaleByDistance: new Cesium.NearFarScalar(1500000, 1.0, 16000000, 0.4),
      });

      corePt._cityRef = fullCity;
      glowPt._cityRef = fullCity;
      outerPt._cityRef = fullCity;

      mainNodeAnimData.push({
        phase: Math.random() * Math.PI * 2,
        period: 1.4 + Math.random() * 1.2,
        baseSize: 12,
        tier: 3,
        color: color,
        corePt,
        glowPt,
        outerPt,
      });

      // Cyber Mode Infrastructure (concentric pulse rings, spaceport beacons, cargo particles)
      if (isCyber) {
        // 1. Concentric Pulse Rings
        for (let r = 0; r < 2; r++) {
          const ringEnt = safeAddEntity({
            position: Cesium.Cartesian3.fromDegrees(hub.lon, hub.lat),
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
                  return color.withAlpha(alpha);
                }, false)
              ),
              height: 4000,
              outline: true,
              outlineColor: new Cesium.CallbackProperty(() => {
                const offset = r * 0.5;
                const cycle = ((timeRef.current * 0.5 + offset) % 1.0);
                const alpha = (1.0 - cycle) * 0.5;
                return color.withAlpha(alpha);
              }, false),
              outlineWidth: 1.5,
            }
          });
          if (ringEnt) {
            ringEnt.layerId = 'cities';
            ringEnt.cityYear = fullCity.year || 2030;
          }
        }

        // 2. Vertical Beacons
        const beaconEnt = safeAddEntity({
          show: isVisible,
          polyline: {
            positions: [
              Cesium.Cartesian3.fromDegrees(hub.lon, hub.lat, 0),
              Cesium.Cartesian3.fromDegrees(hub.lon, hub.lat, 600000)
            ],
            width: new Cesium.CallbackProperty(() => {
              return 3.0 + 1.5 * Math.sin(timeRef.current * 4.0);
            }, false),
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.3,
              taperPower: 0.85,
              color: color.withAlpha(0.75),
            }),
            arcType: Cesium.ArcType.NONE,
          }
        });
        if (beaconEnt) {
          beaconEnt.layerId = 'cities';
          beaconEnt.cityYear = fullCity.year || 2030;
        }

        // 3. Space Cargo Particles
        for (let p = 0; p < 3; p++) {
          const partEnt = safeAddEntity({
            show: isVisible,
            position: new Cesium.CallbackProperty(() => {
              const offset = p * 1.2;
              const cycle = ((timeRef.current * 0.6 + offset) % 3.0) / 3.0;
              const height = cycle * 600000;
              return Cesium.Cartesian3.fromDegrees(hub.lon, hub.lat, height);
            }, false),
            point: {
              pixelSize: new Cesium.CallbackProperty(() => {
                return 3.0 + 1.0 * Math.sin(timeRef.current * 5.0 + p);
              }, false),
              color: new Cesium.CallbackProperty(() => {
                const offset = p * 1.2;
                const cycle = ((timeRef.current * 0.6 + offset) % 3.0) / 3.0;
                const alpha = (1.0 - cycle) * 0.9;
                return Cesium.Color.WHITE.withAlpha(alpha);
              }, false),
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            }
          });
          if (partEnt) {
            partEnt.layerId = 'cities';
            partEnt.cityYear = fullCity.year || 2030;
          }
        }
      }
    });

    // Populate normal city nodes (Tier 2)
    cities.forEach((city, index) => {
      if (MAJOR_HUBS.some(h => h.name === city.name)) return;
      if (isMobile && index % 2 !== 0) return; // 50% density on mobile
      if (nodeCount >= maxSurfaceNodes) return;
      nodeCount++;

      const pos = Cesium.Cartesian3.fromDegrees(city.lon, city.lat, 9000); // Raised for depth testing occlusion
      const color = Cesium.Color.fromCssColorString(C.emerald);
      const isVisible = (!city.year || city.year <= activeYear);

      // Core point (white) - size 12
      const corePt = mainNodeCollection.add({
        position: pos,
        color: Cesium.Color.WHITE,
        pixelSize: 12,
        show: isVisible,
        translucencyByDistance: new Cesium.NearFarScalar(1500000, 1.0, 16000000, 0.15),
        scaleByDistance: new Cesium.NearFarScalar(1500000, 1.0, 16000000, 0.4),
      });

      // Inner glow (colored) - size 24, alpha 0.55
      const glowPt = mainNodeCollection.add({
        position: pos,
        color: color.withAlpha(0.55),
        pixelSize: 24,
        show: isVisible,
        translucencyByDistance: new Cesium.NearFarScalar(1500000, 1.0, 16000000, 0.10),
        scaleByDistance: new Cesium.NearFarScalar(1500000, 1.0, 16000000, 0.4),
      });

      // Outer halo (soft color) - size 40, alpha 0.12
      const outerPt = mainNodeCollection.add({
        position: pos,
        color: color.withAlpha(0.12),
        pixelSize: 40,
        show: isVisible,
        translucencyByDistance: new Cesium.NearFarScalar(1500000, 1.0, 16000000, 0.05),
        scaleByDistance: new Cesium.NearFarScalar(1500000, 1.0, 16000000, 0.4),
      });

      corePt._cityRef = city;
      glowPt._cityRef = city;
      outerPt._cityRef = city;

      mainNodeAnimData.push({
        phase: Math.random() * Math.PI * 2,
        period: 2.0 + Math.random() * 2.0,
        baseSize: 12,
        tier: 2,
        color: color,
        corePt,
        glowPt,
        outerPt,
      });
    });

    // Thin Geodesic Highways with travelling sub-pulses (Capped at 10 routes) - Desktop only
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
        // Base route line
        safeAddEntity({
          polyline: {
            positions: arcPoints,
            width: 1.5,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.1,
              taperPower: 0.05,
              color: Cesium.Color.fromCssColorString(C.emerald).withAlpha(0.12),
            }),
            arcType: Cesium.ArcType.NONE,
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

        safeAddEntity({
          polyline: {
            positions: pulsePositions,
            width: 4.0,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.35,
              taperPower: 0.2,
              color: Cesium.Color.fromCssColorString(C.cyan).withAlpha(0.8),
            }),
            arcType: Cesium.ArcType.NONE,
          },
        });
      }
    });

    // Streamlined Orbital Infrastructure (Capped at 8 tracks) - Desktop only
    let orbitCount = 0;
    const maxOrbitTracks = 8;

    ORBITAL_SHELLS.forEach((shell, shIdx) => {
      if (orbitCount >= maxOrbitTracks) return;
      orbitCount++;
      const R = shell.radius;
      const { tiltX, tiltY } = shell;

      // Orbit ring tracks
      const ringPts = Array.from({ length: 181 }, (_, i) => {
        const a = (i / 180) * Math.PI * 2;
        const { x, y, z } = rotateXY(R * Math.cos(a), R * Math.sin(a), 0, tiltX, tiltY);
        return new Cesium.Cartesian3(x, y, z);
      });

      if (!isMobile) {
        safeAddEntity({
          polyline: {
            positions: ringPts,
            width: 0.8,
            material: Cesium.Color.fromCssColorString(shell.color).withAlpha(0.003),
            arcType: Cesium.ArcType.GEODESIC,
            granularity: Cesium.Math.toRadians(8.0),
          },
        });
      }

      // Satellites
      for (let s = 0; s < shell.sats; s++) {
        if (isMobile && s > 0) continue; // limit satellites count on mobile
        const phase0 = (s / shell.sats) * Math.PI * 2;
        const speed = shell.speed;
        const color = shell.color;

        const satEnt = safeAddEntity({
          position: new Cesium.CallbackProperty(() => {
            const a = (timeRef.current * speed + phase0) % (Math.PI * 2);
            const { x, y, z } = rotateXY(R * Math.cos(a), R * Math.sin(a), 0, tiltX, tiltY);
            return new Cesium.Cartesian3(x, y, z);
          }, false),
          point: {
            pixelSize: 1.5,
            color: Cesium.Color.WHITE.withAlpha(0.40),
            outlineColor: Cesium.Color.fromCssColorString(color).withAlpha(0.20),
            outlineWidth: 0.5,
          },
        });
        if (satEnt) satEnt.layerId = 'space';
      }
    });

    // ISS Low Earth Orbit Tracker (faint cinematic orbital tracker)
    if (!isMobile) {
      const R_iss = 6378137 + 420000; // 420km altitude
      const tiltX_iss = Cesium.Math.toRadians(51.6); // 51.6 degrees LEO inclination
      const tiltY_iss = Cesium.Math.toRadians(12.0);

      // Track line (very faint trail)
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

      // ISS Satellite dot pulsing
      const issSat = safeAddEntity({
        position: new Cesium.CallbackProperty(() => {
          const a = (timeRef.current * 0.08) % (Math.PI * 2); // Fast orbit speed
          const { x, y, z } = rotateXY(R_iss * Math.cos(a), R_iss * Math.sin(a), 0, tiltX_iss, tiltY_iss);
          return new Cesium.Cartesian3(x, y, z);
        }, false),
        point: {
          pixelSize: new Cesium.CallbackProperty(() => {
            return 2.5 + 0.8 * Math.sin(timeRef.current * 4.0); // Gentle pulsing
          }, false),
          color: Cesium.Color.fromCssColorString('#FFE6A3'),
          outlineColor: Cesium.Color.fromCssColorString('#FF9D20').withAlpha(0.4),
          outlineWidth: 1.0,
        },
      });
      if (issSat) issSat.layerId = 'space';
    }

    // Load land GeoJSON
    Cesium.GeoJsonDataSource.load(
      'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson',
      { stroke: Cesium.Color.TRANSPARENT, fill: Cesium.Color.TRANSPARENT }
    ).then((ds: any) => {
      if (viewer.isDestroyed() || !isCyber) return;

  const neonColor = Cesium.Color.fromCssColorString('#00FFFF').withAlpha(0.60);
      let totalLandOutlines = 0;
      let totalLandPositions = 0;

      // Helper: Downsample standard polygon and hole boundary coordinate arrays to a safe cap (e.g. 120 points on mobile)
      function cleanPolygonHierarchy(hierarchy: any): any {
        if (!hierarchy) return null;
        const positions = hierarchy.positions;
        let cleanedPositions = positions;
        if (positions && positions.length > 0) {
          const maxPts = isMobile ? 120 : 1000;
          if (positions.length > maxPts) {
            const step = Math.ceil(positions.length / maxPts);
            const downsampled = [];
            for (let i = 0; i < positions.length; i += step) {
              downsampled.push(positions[i]);
            }
            if (positions.length > 1) {
              downsampled.push(positions[positions.length - 1]);
            }
            cleanedPositions = downsampled;
          }
        }

        const cleanedHoles = [];
        if (hierarchy.holes && hierarchy.holes.length > 0) {
          for (let i = 0; i < hierarchy.holes.length; i++) {
            const h = cleanPolygonHierarchy(hierarchy.holes[i]);
            if (h) {
              cleanedHoles.push(h);
            }
          }
        }

        return new Cesium.PolygonHierarchy(cleanedPositions, cleanedHoles);
      }

      // Helper: Draw high-precision neon outlines
      function addHierarchyLines(v: any, hierarchy: any, color: any, height: number) {
        if (!hierarchy) return;
        const positions = hierarchy.positions;
        if (positions && positions.length > 1) {
          totalLandOutlines++;

          // Downsample instead of slicing to preserve the entire shape
          const maxPts = isMobile ? 120 : 1000;
          let positionsToUse = positions;
          if (positions.length > maxPts) {
            const step = Math.ceil(positions.length / maxPts);
            const downsampled = [];
            for (let i = 0; i < positions.length; i += step) {
              downsampled.push(positions[i]);
            }
            // Preserve last point to keep loop closed if it was closed
            downsampled.push(positions[positions.length - 1]);
            positionsToUse = downsampled;
          }
          
          totalLandPositions += positionsToUse.length;

          // Convert to Cartographic and validate coordinates
          const cartographics: any[] = [];
          for (let i = 0; i < positionsToUse.length; i++) {
            const p = positionsToUse[i];
            try {
              const cart = Cesium.Cartographic.fromCartesian(p);
              if (cart && !isNaN(cart.longitude) && !isNaN(cart.latitude) && isFinite(cart.longitude) && isFinite(cart.latitude)) {
                cartographics.push(cart);
              }
            } catch (e) {}
          }

          // Split segments on antimeridian crossing (179 to -179 degrees, ~3.0 radians)
          const segments: any[][] = [];
          let currentSegment: any[] = [];

          for (let i = 0; i < cartographics.length; i++) {
            const curr = cartographics[i];
            if (currentSegment.length > 0) {
              const prev = currentSegment[currentSegment.length - 1];
              const diffLon = Math.abs(curr.longitude - prev.longitude);
              if (diffLon > 3.0) {
                // Split! Save current segment and start a new one
                segments.push(currentSegment);
                currentSegment = [];
              }
            }
            currentSegment.push(curr);
          }
          if (currentSegment.length > 0) {
            segments.push(currentSegment);
          }

          // Draw each segment as a separate polyline
          segments.forEach((segment) => {

            if (segment.length > 1) {
              // Check if we should close the loop for this segment
              const first = segment[0];
              const last = segment[segment.length - 1];
              const isClosed = Math.abs(first.longitude - last.longitude) < 0.05 && 
                               Math.abs(first.latitude - last.latitude) < 0.05;

              const adjustedPositions = segment.map((cart: any) => {
                return Cesium.Cartesian3.fromRadians(cart.longitude, cart.latitude, height);
              });

              if (isClosed) {
                adjustedPositions.push(adjustedPositions[0]);
              }

safeAddEntity({
  polyline: {
    positions: adjustedPositions,
    width: 1.6, // rebalanced to clean professional outline
    material: neonColor,
    arcType: Cesium.ArcType.GEODESIC,
    granularity: isMobile ? Cesium.Math.RADIANS_PER_DEGREE * 5.0 : Cesium.Math.RADIANS_PER_DEGREE,
  }
});
            }
          });
        }
        if (hierarchy.holes) {
          hierarchy.holes.forEach((hole: any) => addHierarchyLines(v, hole, color, height));
        }
      }

      ds.entities.values.forEach((e: any) => {
        if (e.polygon) {
          e.polygon.outline = false;
          // Dark space-blue solid continent fill
          e.polygon.material = Cesium.Color.fromCssColorString('#081a2e').withAlpha(0.98);
          e.polygon.arcType = Cesium.ArcType.GEODESIC;
          e.polygon.granularity = Cesium.Math.RADIANS_PER_DEGREE;

          // Add neon outline as polylines
          const hierarchy = e.polygon.hierarchy ? e.polygon.hierarchy.getValue() : null;
          if (hierarchy) {
            const cleaned = cleanPolygonHierarchy(hierarchy);

            if (cleaned) {
              e.polygon.hierarchy = new Cesium.ConstantProperty(cleaned);
            }
            if (!DISABLE_LAND_OUTLINES && !disableOutlines) {
              if (cleaned) {
                addHierarchyLines(viewer, cleaned, neonColor, 4000);
              }
            }
          }
        }
      });

      // Add to viewer after all entities have been modified and sanitized in-place
      viewer.dataSources.add(ds);

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
      const dotStep = isMobile ? 22 : 10;
      for (let y = 0; y < H; y += dotStep) {
        for (let x = 0; x < W; x += dotStep) {
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

      // Generate static global nodes (Capped at 50)
      const numStaticNodes = isMobile ? 10 : 50;
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

      // ─── 1. Cities Autonomous Transport Networks ───
      AUTONOMOUS_ROUTES.forEach((conn, index) => {
        if (isMobile && index % 2 !== 0) return;
        const ca = cities.find(c => c.name === conn.a);
        const cb = cities.find(c => c.name === conn.b);
        if (ca && cb) {
          const ent = safeAddEntity({
            polyline: {
              positions: Cesium.Cartesian3.fromDegreesArray([ca.lon, ca.lat, cb.lon, cb.lat]),
              width: 1.0,
              material: Cesium.Color.fromCssColorString('#00F5B0').withAlpha(0.25),
              arcType: Cesium.ArcType.GEODESIC,
              granularity: isMobile ? Cesium.Math.RADIANS_PER_DEGREE * 5.0 : Cesium.Math.RADIANS_PER_DEGREE
            }
          });
          if (ent) ent.layerId = 'cities';
        }
      });

      // ─── 2. Climate Intelligence Zones & Flood Outlines ───
      CLIMATE_REGIONS.forEach(r => {
        const ent = safeAddEntity({
          position: Cesium.Cartesian3.fromDegrees(r.lon, r.lat),
          ellipse: {
            semiMajorAxis: r.radius,
            semiMinorAxis: r.radius,
            material: Cesium.Color.fromCssColorString(r.color).withAlpha(r.alpha),
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
            material: Cesium.Color.fromCssColorString('#FF0055').withAlpha(0.35),
            height: 2000,
            granularity: isMobile ? Cesium.Math.RADIANS_PER_DEGREE * 5.0 : Cesium.Math.RADIANS_PER_DEGREE
          }
        });
        if (ent) {
          ent.layerId = 'climate';
          ent.isFloodOutline = true;
        }
      });

      // ─── 3. AI & Technology Layer ───
      TECH_HUBS.forEach((th, index) => {
        if (isMobile && index % 2 !== 0) return;
        const ent = safeAddEntity({
          position: Cesium.Cartesian3.fromDegrees(th.lon, th.lat, 9000), // Raised to prevent terrain clipping
          point: {
            pixelSize: 8,
            color: Cesium.Color.fromCssColorString('#00BFFF'),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 1,
            translucencyByDistance: new Cesium.NearFarScalar(1500000, 1.0, 16000000, 0.2),
            scaleByDistance: new Cesium.NearFarScalar(1500000, 1.0, 16000000, 0.4),
          }
        });
        if (ent) ent.layerId = 'tech';
      });

      QUANTUM_LINKS.forEach((link, index) => {
        if (isMobile && index % 2 !== 0) return;
        const ent = safeAddEntity({
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray([link.a.lon, link.a.lat, link.b.lon, link.b.lat]),
            width: 1.2,
            material: Cesium.Color.fromCssColorString('#00BFFF').withAlpha(0.3),
            arcType: Cesium.ArcType.GEODESIC,
            granularity: isMobile ? Cesium.Math.RADIANS_PER_DEGREE * 5.0 : Cesium.Math.RADIANS_PER_DEGREE
          }
        });
        if (ent) ent.layerId = 'tech';
      });

      // ─── 4. Energy Layer ───
      FUSION_HUBS.forEach((fh, index) => {
        if (isMobile && index % 2 !== 0) return;
        const ent = safeAddEntity({
          position: Cesium.Cartesian3.fromDegrees(fh.lon, fh.lat, 9000), // Raised to prevent terrain clipping
          point: {
            pixelSize: 8,
            color: Cesium.Color.fromCssColorString('#FF8C00'),
            outlineColor: Cesium.Color.YELLOW,
            outlineWidth: 1.5,
            translucencyByDistance: new Cesium.NearFarScalar(1500000, 1.0, 16000000, 0.2),
            scaleByDistance: new Cesium.NearFarScalar(1500000, 1.0, 16000000, 0.4),
          }
        });
        if (ent) ent.layerId = 'energy';
      });

      FUSION_GRID.forEach((grid, index) => {
        if (isMobile && index % 2 !== 0) return;
        const ent = safeAddEntity({
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray([grid.a.lon, grid.a.lat, grid.b.lon, grid.b.lat]),
            width: 1.0,
            material: Cesium.Color.fromCssColorString('#FF8C00').withAlpha(0.35),
            arcType: Cesium.ArcType.GEODESIC,
            granularity: isMobile ? Cesium.Math.RADIANS_PER_DEGREE * 5.0 : Cesium.Math.RADIANS_PER_DEGREE
          }
        });
        if (ent) ent.layerId = 'energy';
      });

      // ─── 5. Space Layer spaceports ───
      SPACEPORTS.forEach((sp, index) => {
        if (isMobile && index % 2 !== 0) return;
        const ent = safeAddEntity({
          position: Cesium.Cartesian3.fromDegrees(sp.lon, sp.lat, 9000), // Raised to prevent terrain clipping
          point: {
            pixelSize: 8,
            color: Cesium.Color.fromCssColorString('#9400D3'),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 1,
            translucencyByDistance: new Cesium.NearFarScalar(1500000, 1.0, 16000000, 0.2),
            scaleByDistance: new Cesium.NearFarScalar(1500000, 1.0, 16000000, 0.4),
          }
        });
        if (ent) ent.layerId = 'space';
      });

      // ─── 6. Geopolitical Layer ───
      GEOPOLITICAL_LANES.forEach((lane, index) => {
        if (isMobile && index % 2 !== 0) return;
        const flatCoords = lane.coords.flatMap(c => [c.lon, c.lat]);
        const ent = safeAddEntity({
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray(flatCoords),
            width: 1.2,
            material: Cesium.Color.fromCssColorString(lane.isArctic ? '#00FFFF' : '#1E90FF').withAlpha(0.35),
            arcType: Cesium.ArcType.GEODESIC,
            granularity: isMobile ? Cesium.Math.RADIANS_PER_DEGREE * 5.0 : Cesium.Math.RADIANS_PER_DEGREE
          }
        });
        if (ent) {
          ent.layerId = 'geopolitical';
          if (lane.isArctic) {
            ent.isArcticRoute = true;
          }
        }
      });

      MINERAL_NODES.forEach((mn, index) => {
        if (isMobile && index % 2 !== 0) return;
        const ent = safeAddEntity({
          position: Cesium.Cartesian3.fromDegrees(mn.lon, mn.lat, 9000), // Raised to prevent terrain clipping
          point: {
            pixelSize: 7,
            color: Cesium.Color.fromCssColorString('#FF1493'),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 1,
            translucencyByDistance: new Cesium.NearFarScalar(1500000, 1.0, 16000000, 0.2),
            scaleByDistance: new Cesium.NearFarScalar(1500000, 1.0, 16000000, 0.4),
          }
        });
        if (ent) ent.layerId = 'geopolitical';
      });

      CHOKE_POINTS.forEach((cp, index) => {
        if (isMobile && index % 2 !== 0) return;
        const ent = safeAddEntity({
          position: Cesium.Cartesian3.fromDegrees(cp.lon, cp.lat, 9000), // Raised to prevent terrain clipping
          point: {
            pixelSize: 9,
            color: Cesium.Color.fromCssColorString('#FF3333'),
            outlineColor: Cesium.Color.YELLOW,
            outlineWidth: 1,
            translucencyByDistance: new Cesium.NearFarScalar(1500000, 1.0, 16000000, 0.2),
            scaleByDistance: new Cesium.NearFarScalar(1500000, 1.0, 16000000, 0.4),
          }
        });
        if (ent) ent.layerId = 'geopolitical';
      });

    }).catch(() => {});

    // Pre-cache base colors to prevent per-frame parsing overhead
    const colorLand = Cesium.Color.fromCssColorString('#00F5B0');
    const colorIceBlue = Cesium.Color.fromCssColorString(C.iceBlue);
    const scratchColor = new Cesium.Color();

    // Unified Performance Animation Loop
    let frameCount = 0;
    let lastFrameTime = performance.now();
    let frameTimes: number[] = [];
    let lastTelemetryTime = performance.now();

    const animate = () => {
      if (viewer.isDestroyed() || !isCyber) return;

      const lightDir = viewer.scene.light?.direction;
      if (!lightDir) return;

      const time = timeRef.current;
      frameCount++;

      const nowMs = performance.now();
      const frameDelta = nowMs - lastFrameTime;
      lastFrameTime = nowMs;
      frameTimes.push(frameDelta);

      // Print telemetry diagnostics every 5 seconds (5000 ms)
      if (nowMs - lastTelemetryTime >= 5000) {
        const totalF = frameTimes.length;
        const avgFrameTime = totalF > 0 ? (frameTimes.reduce((a, b) => a + b, 0) / totalF) : 0;
        const fps = avgFrameTime > 0 ? Math.round(1000 / avgFrameTime) : 0;
        frameTimes = [];
        lastTelemetryTime = nowMs;

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

        const activeEntities = viewer.entities.values.length;
        const memory = (performance as any).memory;
        const heapUsed = memory ? `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB` : 'N/A';

      }

      // Subtle breathing planet effect
      const pulseBreathe = Math.sin(time * 0.8);
      if (viewer.scene.light) {
        viewer.scene.light.intensity = 1.35 + 0.15 * pulseBreathe;
      }

      // Update dot-matrix grid (every 3rd frame for performance)
      if (!isMobile && frameCount % 3 === 0) {
        const numDots = dotCollection.length;
        for (let i = 0; i < numDots; i++) {
          const pt = dotCollection.get(i);
          if (!pt) continue;
          const anim = dotAnimData[i];
          if (!anim) continue;

          const dot = anim.nx * lightDir.x + anim.ny * lightDir.y + anim.nz * lightDir.z;
          const lightFactor = Math.max(0.04, Math.min(1.0, (-dot + 0.45) / 0.90));
          const tw = 0.75 + 0.25 * Math.sin(time * 2.5 + anim.phase);
          const proximityGlow = 1.0 + anim.hubProximity * 2.5;

          if (anim.isLand) {
            const alpha = 0.32 * lightFactor * tw * proximityGlow;
            scratchColor.red = colorLand.red;
            scratchColor.green = colorLand.green;
            scratchColor.blue = colorLand.blue;
            scratchColor.alpha = Math.min(0.95, alpha);
            if (!disableDots) pt.color = scratchColor;
            pt.pixelSize = (1.2 + anim.hubProximity * 1.5) * (0.8 + 0.2 * tw);
          } else {
            const alpha = 0.05 * lightFactor * tw;
            scratchColor.red = colorIceBlue.red;
            scratchColor.green = colorIceBlue.green;
            scratchColor.blue = colorIceBlue.blue;
            scratchColor.alpha = Math.min(0.25, alpha);
            if (!disableDots) pt.color = scratchColor;
            pt.pixelSize = 0.8 * (0.8 + 0.2 * tw);
          }
        }
      }

      // Update 50 static network nodes (pulsing independently)
      if (!isMobile) {
        const numStatic = staticNodeCollection.length;
        for (let i = 0; i < numStatic; i++) {
          const pt = staticNodeCollection.get(i);
          if (!pt) continue;
          const anim = staticNodeAnimData[i];
          if (!anim) continue;

          const pulse = 0.40 + 0.60 * Math.sin(time * ((Math.PI * 2) / anim.period) + anim.phase);
          pt.pixelSize = anim.baseSize * (0.8 + 0.4 * pulse);
          
          const animColor = anim.color;
          scratchColor.red = animColor.red;
          scratchColor.green = animColor.green;
          scratchColor.blue = animColor.blue;
          scratchColor.alpha = anim.baseAlpha * pulse;
          if (!disableDots) pt.color = scratchColor;
        }
      }

      // Update main nodes (Tier 3 hubs & Tier 2 cities with nested pulsing glow)
      const numMain = mainNodeAnimData.length;
      for (let i = 0; i < numMain; i++) {
        const anim = mainNodeAnimData[i];
        if (!anim) continue;

        // Increase pulse frequency by 50% from base (time * 2.1)
        const pulse = 0.70 + 0.30 * Math.sin(time * 2.1 * ((Math.PI * 2) / anim.period) + anim.phase);

        // Hover & Selection state scaling
        const isSel = activeCityRef.current?.name === anim.corePt._cityRef?.name;
        const isHover = hoveredCityRef.current?.name === anim.corePt._cityRef?.name;

        // Every 3.0 seconds, there is a sharp energy flash for major hubs
        let flashIntensity = 0.0;
        if (anim.tier === 3) {
          const flashCycle = (time + anim.phase) % 3.0;
          if (flashCycle < 0.25) {
            flashIntensity = 1.0 - (flashCycle / 0.25);
          }
        }

        const scale = (isSel ? 2.0 : (isHover ? 1.4 : 1.0)) * (1.0 + 0.5 * flashIntensity);

        // Update core size & opacity - Base 7
        if (anim.corePt) {
          anim.corePt.pixelSize = 7 * scale * (0.9 + 0.1 * pulse);
          scratchColor.red = 1.0;
          scratchColor.green = 1.0;
          scratchColor.blue = 1.0;
          scratchColor.alpha = Math.min(1.0, 0.85 + 0.15 * pulse + 0.15 * flashIntensity); // core remains highly bright and solid
          if (!disableDots) anim.corePt.color = scratchColor;
        }

        // Update glow size & opacity - Base 14
        if (anim.glowPt) {
          const glowFactor = 0.70 + 0.30 * pulse;
          anim.glowPt.pixelSize = 14 * scale * glowFactor;
          const animColor = anim.color;
          scratchColor.red = Math.min(1.0, animColor.red + 0.3 * flashIntensity);
          scratchColor.green = Math.min(1.0, animColor.green + 0.3 * flashIntensity);
          scratchColor.blue = Math.min(1.0, animColor.blue + 0.3 * flashIntensity);
          scratchColor.alpha = Math.min(1.0, (0.55 * pulse + 0.25) * (isSel ? 1.0 : (isHover ? 0.90 : 0.80)) + 0.35 * flashIntensity); // boosted inner glow opacity
          if (!disableDots) anim.glowPt.color = scratchColor;
        }

        // Update outer halo size & opacity - Base 22
        if (anim.outerPt) {
          const outerFactor = 0.60 + 0.40 * pulse;
          anim.outerPt.pixelSize = 22 * scale * outerFactor;
          const animColor = anim.color;
          scratchColor.red = animColor.red;
          scratchColor.green = animColor.green;
          scratchColor.blue = animColor.blue;
          scratchColor.alpha = Math.min(1.0, (0.15 * pulse + 0.05) + 0.15 * flashIntensity); // increased halo definition
          if (!disableDots) anim.outerPt.color = scratchColor;
        }
      }
    };

    removeRenderListener = viewer.scene.postRender.addEventListener(animate);

    return () => {
      if (removeRenderListener) removeRenderListener();
      if (!viewer.isDestroyed()) {
        viewer.scene.primitives.remove(dotCollection);
        viewer.scene.primitives.remove(staticNodeCollection);
        viewer.scene.primitives.remove(mainNodeCollection);
        viewer.scene.primitives.remove(beamCollection);
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
