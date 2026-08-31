'use client';

import { useEffect, useRef, useState } from 'react';
import { citiesRawData, CityData } from '../data/citiesData';
import { renderQualityConfig, RenderQualityMode } from '../lib/renderQualityConfig';

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
  { name: 'New York',      lat:  40.7128, lon:  -74.0060, color: '#00E5FF' },
  { name: 'London',        lat:  51.5074, lon:   -0.1278, color: '#00E5FF' },
  { name: 'Dubai',         lat:  25.2048, lon:   55.2708, color: '#00E5FF' },
  { name: 'Mumbai',        lat:  19.0760, lon:   72.8777, color: '#00E5FF' },
  { name: 'Singapore',     lat:   1.3521, lon:  103.8198, color: '#00E5FF' },
  { name: 'Tokyo',         lat:  35.6762, lon:  139.6503, color: '#00E5FF' },
  { name: 'Shanghai',      lat:  31.2304, lon:  121.4737, color: '#00E5FF' },
  { name: 'San Francisco', lat:  37.7749, lon: -122.4194, color: '#00E5FF' },
];

const GLOBAL_TIER1_HUBS = new Set([
  'New Delhi', 'Mumbai', 'Bengaluru', 'Tokyo', 'Singapore', 'Dubai', 'London', 'New York',
  'San Francisco', 'Beijing', 'Shanghai', 'Seoul', 'Sydney', 'Nairobi', 'Sao Paulo', 'Paris',
  'Berlin', 'Cairo', 'Riyadh', 'Jakarta', 'Bangkok', 'Toronto', 'Johannesburg'
]);

function getHardwareProfile(): RenderQualityMode {
  if (typeof window === 'undefined') return 'balanced';
  const isMobile = window.innerWidth < 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  if (isMobile) return 'performance';

  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as any).deviceMemory;

  let isLowEndGPU = false;
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
        if (
          renderer.includes('intel') ||
          renderer.includes('celeron') ||
          renderer.includes('pentium') ||
          renderer.includes('uhd') ||
          renderer.includes('hd graphics') ||
          renderer.includes('swiftshader') ||
          renderer.includes('llvmpipe')
        ) {
          isLowEndGPU = true;
        }
      }
    }
  } catch (e) {}

  if (isLowEndGPU || cores < 4 || (memory !== undefined && memory < 6)) {
    return 'performance';
  }
  if (cores >= 8 && (memory === undefined || memory >= 8)) {
    return 'cinematic';
  }
  return 'balanced';
}

function applyQualitySettings(viewer: any, activeQuality: RenderQualityMode) {
  if (!viewer || viewer.isDestroyed()) return;
  const config = renderQualityConfig[activeQuality];

  // 1. Resolution Scale & Browser Recommended Resolution
  if (activeQuality === 'performance') {
    viewer.useBrowserRecommendedResolution = true; // Use standard CSS pixels (no high-DPI scaling)
    viewer.resolutionScale = config.resolutionScale; // 0.75x CSS resolution for low-end/mobile
  } else if (activeQuality === 'balanced') {
    viewer.useBrowserRecommendedResolution = true; // Use standard CSS pixels
    viewer.resolutionScale = config.resolutionScale; // 1.0x CSS resolution
  } else {
    viewer.useBrowserRecommendedResolution = false; // Enable browser high-DPI scaling (Retina)
    viewer.resolutionScale = config.resolutionScale; // 1.2x of high-DPI
  }

  // 2. Globe LOD & Cache Settings
  if (viewer.scene.globe) {
    viewer.scene.globe.maximumScreenSpaceError = config.maximumScreenSpaceError;
    viewer.scene.globe.tileCacheSize = config.tileCacheSize;
    viewer.scene.globe.loadingDescendantLimit = config.loadingDescendantLimit;
    viewer.scene.globe.preloadAncestors = config.preloadAncestors;
    viewer.scene.globe.preloadSiblings = config.preloadSiblings;
    viewer.scene.globe.showGroundAtmosphere = config.showGroundAtmosphere;
  }

  // 3. Sky Atmosphere
  if (viewer.scene.skyAtmosphere) {
    viewer.scene.skyAtmosphere.show = config.showSkyAtmosphere;
  }
}

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

// Helper: Attach subtle Google Earth-style country boundaries reference layer
function attachSubtleCountryBorders(v: any) {
  if (typeof window === 'undefined' || !(window as any).Cesium || !v || v.isDestroyed() || !v.imageryLayers) return;
  const Cesium = (window as any).Cesium;
  Cesium.ArcGisMapServerImageryProvider.fromUrl(
    'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer',
    { enablePickFeatures: false }
  ).then((borderProvider: any) => {
    if (v.isDestroyed() || !v.imageryLayers) return;
    const borderLayer = v.imageryLayers.addImageryProvider(borderProvider);
    
    // Planetary Intelligence style: thin, crisp soft-white/light-grey lines, clearly defined, no glow
    borderLayer.alpha = 0.65;
    borderLayer.brightness = 1.15;
    borderLayer.contrast = 1.25;
    borderLayer.saturation = 0.0; // Pure neutral grayscale
    borderLayer.gamma = 0.90;

    // Dynamic distance-based visibility:
    // far zoom -> clearly visible (0.45), default view -> crisp & distinct (0.65), close zoom -> sharp & prominent (0.78)
    const updateBorderAlpha = () => {
      if (v.isDestroyed() || !borderLayer) return;
      const height = v.camera.positionCartographic?.height || 20000000;
      if (height > 22000000) {
        borderLayer.alpha = 0.45; // far zoom: clearly discernible boundaries across the sphere
      } else if (height > 6000000) {
        borderLayer.alpha = 0.65; // default view: crisp, clearly defined country borders
      } else {
        borderLayer.alpha = 0.78; // close zoom: sharp, fine-line geographic precision
      }
    };
    v.camera.changed.addEventListener(updateBorderAlpha);
  }).catch(() => {});
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

  const [isInteracting,        setIsInteracting]        = useState(false);
  const [hoveredCity,          setHoveredCity]          = useState<CityData | null>(null);
  const [isGlobeReady,         setIsGlobeReady]         = useState(false);
  const [earthLoadingStatus,   setEarthLoadingStatus]   = useState<'init' | 'camera' | 'streaming' | 'ready'>('init');
  const [initError,            setInitError]            = useState<string | null>(null);
  const [isMobile,             setIsMobile]             = useState(false);
  const [isCesiumReady,  setIsCesiumReady]  = useState(typeof window !== 'undefined' && !!(window as any).Cesium);

  const [qualityMode, setQualityMode] = useState<RenderQualityMode | 'auto'>('balanced');
  const [activeQuality, setActiveQuality] = useState<RenderQualityMode>('balanced');

  const activeQualityRef = useRef(activeQuality);
  useEffect(() => {
    activeQualityRef.current = activeQuality;
  }, [activeQuality]);

  const frameCountRef = useRef(0);
  const lastFPSCheckTimeRef = useRef(0);

  // Sync render quality setting from localStorage
  useEffect(() => {
    const syncQuality = () => {
      try {
        const stored = localStorage.getItem('chronoearth-render-quality') || 'balanced';
        setQualityMode(stored as any);
        if (stored === 'auto') {
          const profile = getHardwareProfile();
          setActiveQuality(profile);
          console.log(`[AUTO-QUALITY] Auto mode initialized. Device profile set to: ${profile}`);
        } else {
          setActiveQuality(stored as any);
          console.log(`[QUALITY] Quality preference set to: ${stored}`);
        }
      } catch (e) {
        console.error('[QUALITY] Failed to load quality settings:', e);
      }
    };

    syncQuality();
    window.addEventListener('chrono_settings_changed', syncQuality);
    return () => window.removeEventListener('chrono_settings_changed', syncQuality);
  }, []);

  // Adaptive FPS Monitor for AUTO mode
  useEffect(() => {
    if (qualityMode !== 'auto' || !isGlobeReady || !viewerRef.current) return;

    frameCountRef.current = 0;
    lastFPSCheckTimeRef.current = performance.now();

    // Wait 5 seconds after startup before beginning monitoring to allow caching/loading to settle
    let isMonitoringEnabled = false;
    const enableTimeout = setTimeout(() => {
      isMonitoringEnabled = true;
      lastFPSCheckTimeRef.current = performance.now();
      frameCountRef.current = 0;
      console.log("[AUTO-QUALITY] Starting active FPS telemetry monitoring.");
    }, 5000);

    let consecutiveLowFPS = 0;
    let consecutiveHighFPS = 0;
    let cooldownTimer = 0;

    const interval = setInterval(() => {
      if (viewerRef.current?.isDestroyed()) return;
      if (!isMonitoringEnabled) return;

      if (cooldownTimer > 0) {
        cooldownTimer -= 2;
        return;
      }

      const now = performance.now();
      const timeElapsed = (now - lastFPSCheckTimeRef.current) / 1000;
      if (timeElapsed <= 0) return;

      const currentFPS = frameCountRef.current / timeElapsed;
      frameCountRef.current = 0;
      lastFPSCheckTimeRef.current = now;

      console.log(`[AUTO-QUALITY] Current FPS: ${currentFPS.toFixed(1)} | Profile: ${activeQuality}`);

      // Evaluate FPS thresholds
      if (currentFPS < 35) {
        consecutiveLowFPS++;
        consecutiveHighFPS = 0;
        if (consecutiveLowFPS >= 3) {
          let nextQuality: RenderQualityMode | null = null;
          if (activeQuality === 'cinematic') nextQuality = 'balanced';
          else if (activeQuality === 'balanced') nextQuality = 'performance';

          if (nextQuality) {
            console.log(`[AUTO-QUALITY] Low FPS sustained. Downgrading to: ${nextQuality}`);
            setActiveQuality(nextQuality);
            cooldownTimer = 15;
          }
          consecutiveLowFPS = 0;
        }
      } else if (currentFPS > 55) {
        consecutiveHighFPS++;
        consecutiveLowFPS = 0;
        if (consecutiveHighFPS >= 5) {
          let nextQuality: RenderQualityMode | null = null;
          if (activeQuality === 'performance') nextQuality = 'balanced';
          else if (activeQuality === 'balanced') nextQuality = 'cinematic';

          if (nextQuality) {
            console.log(`[AUTO-QUALITY] High FPS sustained. Upgrading to: ${nextQuality}`);
            setActiveQuality(nextQuality);
            cooldownTimer = 15;
          }
          consecutiveHighFPS = 0;
        }
      } else {
        consecutiveLowFPS = 0;
        consecutiveHighFPS = 0;
      }
    }, 2000);

    return () => {
      clearTimeout(enableTimeout);
      clearInterval(interval);
    };
  }, [qualityMode, isGlobeReady, activeQuality]);

  useEffect(() => {
    if (typeof window === 'undefined' || isCesiumReady) return;
    let cancel = false;
    const check = () => {
      if (cancel) return;
      if ((window as any).Cesium) {
        setIsCesiumReady(true);
      } else {
        requestAnimationFrame(check);
      }
    };
    check();
    return () => { cancel = true; };
  }, [isCesiumReady]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const activeCityRef = useRef<CityData | null>(activeCity);
  const hoveredCityRef = useRef<CityData | null>(hoveredCity);
  const setActiveCityRef = useRef(setActiveCity);
  const isInteractingRef = useRef(false);
  const lastInteractionTimeRef = useRef(Date.now());
  const isFlyingRef = useRef(false);
  const isFirstCategoryRender = useRef(true);

  activeCityRef.current = activeCity;
  hoveredCityRef.current = hoveredCity;
  setActiveCityRef.current = setActiveCity;

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
    console.log("[EXEC_TRACE] D = Earth/Cesium component mounts at " + performance.now().toFixed(1) + "ms");
    if (typeof window === 'undefined' || !containerRef.current || !(window as any).Cesium) return;

    // Clear expired default token to prevent Ion 401 network stalls
    Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || '';

    const isMobileDevice = window.innerWidth < 768;

    console.log("[EXEC_TRACE] E = Cesium Viewer constructor starts at " + performance.now().toFixed(1) + "ms");
    const viewer = new Cesium.Viewer(containerRef.current, {
      timeline: false, animation: false, baseLayerPicker: false,
      navigationHelpButton: false, homeButton: false, sceneModePicker: false,
      geocoder: false, infoBox: false, selectionIndicator: false,
      fullscreenButton: false, skyBox: false,
      baseLayer: false, // Prevent duplicate conflicting default base layer
      terrainProvider: new Cesium.EllipsoidTerrainProvider(), // Instant local ellipsoid geometry (zero 401 Ion network attempts)
      navigationInstructionsInitiallyVisible: false,
      contextOptions: { webgl: { alpha: true } },
      creditContainer: document.createElement('div'),
    });
    console.log("[EXEC_TRACE] F = Cesium Viewer constructor completes at " + performance.now().toFixed(1) + "ms");

    viewer.scene.backgroundColor = Cesium.Color.TRANSPARENT;
    
    // Natural linear sRGB rendering without dark HDR tone-mapping clipping
    viewer.scene.highDynamicRange = false;

    // Planet momentum & heavy inertia feel
    viewer.scene.screenSpaceCameraController.inertiaSpin = 0.88;
    viewer.scene.screenSpaceCameraController.inertiaTranslate = 0.85;
    viewer.scene.screenSpaceCameraController.inertiaZoom = 0.80;
    viewer.scene.screenSpaceCameraController.enableLook = false;

    // Pull camera FOV back for cinematic telephoto compression
    if (viewer.camera.frustum instanceof Cesium.PerspectiveFrustum) {
      viewer.camera.frustum.fov = Cesium.Math.toRadians(38.0);
    }
    
    // Resolution scale & Native Device Pixel Ratio handling
    viewer.useBrowserRecommendedResolution = false;

    // Disable atmospheric fog overlay to keep close-zoom satellite imagery razor-sharp
    if (viewer.scene.fog) {
      viewer.scene.fog.enabled = false;
    }

    // Apply base render quality configurations
    applyQualitySettings(viewer, activeQuality);

    // Apply Mobile Performance/Interaction Optimizations to Cesium Viewer
    if (isMobileDevice) {
      viewer.scene.requestRenderMode = true;
      viewer.scene.maximumRenderTimeChange = Number.POSITIVE_INFINITY;
      viewer.scene.highDynamicRange = false;
      
      if (viewer.scene.globe) {
        viewer.scene.globe.enableLighting = false;
      }
      
      // Touch event camera inertia
      viewer.scene.screenSpaceCameraController.enableLook = false;
      viewer.scene.screenSpaceCameraController.inertiaSpin = 0.15;
      viewer.scene.screenSpaceCameraController.inertiaTranslate = 0.15;
      viewer.scene.screenSpaceCameraController.inertiaZoom = 0.25;
    }

    // Set default initial viewpoint centered on India / South Asia (Middle East on left, SE Asia on right)
    const cameraHeight = isMobileDevice ? 20000000 : 25500000;
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(78.0, 20.0, 32000000),
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-88), // Centered directly in viewport
        roll: 0
      },
    });

    // Smooth cinematic zoom-in fly-in on load settling on South Asia
    const flyTimeout = setTimeout(() => {
      if (viewer.isDestroyed()) return;
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(78.0, 20.0, cameraHeight),
        orientation: {
          heading: 0,
          pitch: Cesium.Math.toRadians(-88), // Perfectly centered
          roll: 0
        },
        duration: 2.0,
        easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
      });
    }, 400);
    viewerRef.current = viewer;
    (window as any).viewer = viewer;

    // Initiate imagery provider loading immediately in parallel
    console.log("[EXEC_TRACE] IMAGERY_REQUEST_START at " + performance.now().toFixed(1) + "ms");
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
      attachSubtleCountryBorders(viewer);
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
          attachSubtleCountryBorders(viewer);
        }
      } catch {}
    });

    // Camera movement lifecycle listeners for idle rotation pausing
    viewer.camera.moveStart.addEventListener(() => {
      isFlyingRef.current = true;
      lastInteractionTimeRef.current = Date.now();
    });
    viewer.camera.moveEnd.addEventListener(() => {
      isFlyingRef.current = false;
      lastInteractionTimeRef.current = Date.now();
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

    // Single authoritative, lightweight idle planetary rotation (preRender, zero allocations)
    let lastRotTime = performance.now();
    const removeRotationListener = viewer.scene.preRender.addEventListener(() => {
      if (viewer.isDestroyed()) return;
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastRotTime) / 1000);
      lastRotTime = now;

      const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isPerformance = activeQualityRef.current === 'performance';
      const isPaused = isInteractingRef.current || isFlyingRef.current || !!activeCityRef.current || (Date.now() - lastInteractionTimeRef.current < 4500) || prefersReducedMotion || isPerformance;
      if (!isPaused) {
        viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, -0.00035 * dt);
      }
    });

    // Real State-Driven Earth Readiness Detection
    let isEarthReadyTriggered = false;
    const triggerEarthReady = () => {
      if (isEarthReadyTriggered) return;
      isEarthReadyTriggered = true;
      console.log("[EXEC_TRACE] I = first Earth imagery becomes visible at " + performance.now().toFixed(1) + "ms");
      setEarthLoadingStatus('ready');
      setIsGlobeReady(true);
      if (onEarthReady) onEarthReady();
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
        setEarthLoadingStatus('streaming');
      } else if (queueLength === 0 && !isEarthReadyTriggered) {
        // Visible tiles for current viewpoint have finished downloading
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
      }
      if (renderedFrames > 2) {
        if (viewer.scene.globe.tilesLoaded || (viewer.imageryLayers && viewer.imageryLayers.length > 0)) {
          triggerEarthReady();
        }
      }
    });

    // Helper to extract city data safely from any picked entity or primitive
    const extractCityData = (picked: any): CityData | null => {
      if (!Cesium.defined(picked)) return null;
      if (picked.id?.properties?.cityData) {
        const prop = picked.id.properties.cityData;
        return (typeof prop.getValue === 'function' ? prop.getValue() : prop) as CityData;
      }
      if (picked.id?.cityData) return picked.id.cityData as CityData;
      if (picked.primitive?._cityRef) return picked.primitive._cityRef as CityData;
      return null;
    };

    // Helper to perform proximity-based picking of visible cities
    const getProximityCity = (windowPosition: { x: number; y: number }, maxDistance = 35.0): { city: CityData; screenPos: any } | null => {
      if (!windowPosition) return null;
      
      const config = renderQualityConfig[activeQualityRef.current];
      const occluder = new Cesium.EllipsoidalOccluder(Cesium.Ellipsoid.WGS84, viewer.camera.position);
      
      let closestCity: CityData | null = null;
      let minDistance = maxDistance;
      let closestScreenPos: any = null;

      for (const city of cities) {
        const isTier1 = GLOBAL_TIER1_HUBS.has(city.name);
        const pop = city.offsets?.population || 0.01;
        const isTier2 = !isTier1 && (pop > 0.008 || city.year === 2030);

        if (config.citiesLimit === 'tier1' && !isTier1) continue;
        if (config.citiesLimit === 'tier1_tier2' && !isTier1 && !isTier2) continue;

        const pos3d = Cesium.Cartesian3.fromDegrees(city.lon, city.lat, 10000);
        
        // Ensure the city is on the visible front hemisphere of the Earth
        if (!occluder.isPointVisible(pos3d)) continue;

        const screenPos = Cesium.SceneTransforms.worldToWindowCoordinates(viewer.scene, pos3d);
        if (screenPos) {
          const dx = windowPosition.x - screenPos.x;
          const dy = windowPosition.y - screenPos.y;
          const dist = Math.hypot(dx, dy);
          if (dist < minDistance) {
            minDistance = dist;
            closestCity = city;
            closestScreenPos = screenPos;
          }
        }
      }

      if (closestCity && closestScreenPos) {
        return { city: closestCity, screenPos: closestScreenPos };
      }
      return null;
    };

    // Event handlers with interaction tracking
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((click: any) => {
      lastInteractionTimeRef.current = Date.now();
      
      const proximityResult = getProximityCity(click.position, 35.0);
      if (proximityResult) {
        setActiveCityRef.current(proximityResult.city);
      } else {
        const picked = viewer.scene.pick(click.position, 10, 10);
        const city = extractCityData(picked);
        if (city) {
          setActiveCityRef.current(city);
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction((click: any) => {
      lastInteractionTimeRef.current = Date.now();

      const proximityResult = getProximityCity(click.position, 35.0);
      const targetCity = proximityResult?.city || extractCityData(viewer.scene.pick(click.position, 12, 12));

      if (targetCity) {
        setActiveCityRef.current(targetCity);
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(targetCity.lon, targetCity.lat - 0.6, 650000), // Close zoom
          duration: 2.0,
          easingFunction: Cesium.EasingFunction.CUBIC_OUT,
        });
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);


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

    // Fast Direct DOM Tooltip Updaters (0 React re-renders)
    const updateHoverTooltipDOM = (city: CityData, px: number, py: number) => {
      const panel = document.getElementById('city-hover-dossier-panel');
      if (!panel) return;

      const cardWidth = 270;
      const cardHeight = 175;
      const pad = 16;
      let left = px + 18;
      let top = py - 20;

      if (left + cardWidth > window.innerWidth - pad) {
        left = px - cardWidth - 18;
      }
      if (left < pad) {
        left = pad;
      }
      if (top + cardHeight > window.innerHeight - pad) {
        top = window.innerHeight - cardHeight - pad;
      }
      if (top < 70) {
        top = py + 24;
      }

      panel.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      panel.style.display = 'block';
      panel.style.opacity = '1';

      const elName = document.getElementById('hover-dossier-name');
      if (elName && elName.textContent !== city.name) {
        elName.textContent = city.name;
        const elCountry = document.getElementById('hover-dossier-country');
        if (elCountry) elCountry.textContent = `${city.country} · PLANETARY NODE`;
        const elHorizon = document.getElementById('hover-dossier-horizon');
        if (elHorizon) elHorizon.textContent = `${city.year || 2030} HORIZON`;
        const elCoords = document.getElementById('hover-dossier-coords');
        if (elCoords) elCoords.textContent = `${city.lat.toFixed(2)}° N · ${city.lon.toFixed(2)}° E`;
        const popMillions = (city.offsets?.population || 0) * 1000;
        const elPop = document.getElementById('hover-dossier-pop');
        if (elPop) elPop.textContent = `${popMillions > 0 ? popMillions.toFixed(1) + 'M' : 'Emerging'} Residents`;
        const detail = (city.details?.climate || city.details?.energy || city.details?.satellites || '').split('.')[0];
        const elDetail = document.getElementById('hover-dossier-detail');
        if (elDetail) elDetail.textContent = detail ? `${detail}.` : 'Operational planetary intelligence node.';
      }
    };

    const hideHoverTooltipDOM = () => {
      const panel = document.getElementById('city-hover-dossier-panel');
      if (panel && panel.style.display !== 'none') {
        panel.style.display = 'none';
        panel.style.opacity = '0';
      }
    };

    // Coalesced rAF picking handler (maximum 1 pick per rendered frame)
    let pendingPickPos: any = null;
    let isPickScheduled = false;

    handler.setInputAction((mv: any) => {
      pendingPickPos = mv.endPosition;
      if (!isPickScheduled) {
        isPickScheduled = true;
        requestAnimationFrame(() => {
          isPickScheduled = false;
          if (!pendingPickPos || viewer.isDestroyed()) return;

          const proximityResult = getProximityCity(pendingPickPos, 35.0);

          if (proximityResult) {
            // Lock tooltip to actual city coordinates to prevent jitter
            updateHoverTooltipDOM(proximityResult.city, proximityResult.screenPos.x, proximityResult.screenPos.y);
            if ((hoveredCityRef.current as any)?.name !== proximityResult.city.name) {
              hoveredCityRef.current = proximityResult.city;
              setHoveredCity(proximityResult.city);
            }
          } else {
            if (hoveredCityRef.current !== null) {
              hoveredCityRef.current = null;
              setHoveredCity(null);
            }
            hideHoverTooltipDOM();
          }
        });
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    return () => {
      if (removeRotationListener) removeRotationListener();
      if (removeTileLoadListener) removeTileLoadListener();
      if (removePostRenderListener) removePostRenderListener();
      window.removeEventListener('resize', handleResize);
      clearTimeout(flyTimeout);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      handler.destroy();
      viewer.destroy();
      viewerRef.current = null;
      delete (window as any).viewer;
    };
  }, [isCesiumReady]);

  // Dynamic updates when activeQuality profile changes
  useEffect(() => {
    if (!viewerRef.current || viewerRef.current.isDestroyed()) return;
    applyQualitySettings(viewerRef.current, activeQuality);
    console.log(`[QUALITY] In-place applied quality settings: ${activeQuality}`);
  }, [activeQuality]);

  // ─── Build Scene Layers ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current) return;
    const viewer = viewerRef.current;
    const config = renderQualityConfig[activeQuality];

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

    // Reset everything first
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

    // Staggered timer tracker for progressive loading
    const activeTimeouts: any[] = [];
    const runStaggered = (delay: number, fn: () => void) => {
      const t = setTimeout(() => {
        if (viewer.isDestroyed()) return;
        fn();
      }, delay);
      activeTimeouts.push(t);
    };

    let removeRenderListener: (() => void) | undefined;

    // ══════════════════════════════════════════════════════════════════════════
    //  REALISTIC MODE
    // ══════════════════════════════════════════════════════════════════════════
    if (!isCyber) {
      // 1. Terrain Provider (Fast, resilient non-blocking initialization)
      try {
        const ionToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
        if (ionToken) {
          Cesium.createWorldTerrainAsync({
            requestVertexNormals: true
          })
          .then((tp: any) => {
            if (viewer.isDestroyed() || isCyber) return;
            viewer.terrainProvider = tp;
          })
          .catch(() => {});
        }
      } catch (e) {}

      // 2. Day Imagery Layer (Google Earth style natural photographic satellite imagery)
      viewer.imageryLayers.removeAll();
      Cesium.ArcGisMapServerImageryProvider.fromUrl(
        'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
        { enablePickFeatures: false, maximumLevel: 23 }
      )
        .then((provider: any) => {
          if (viewer.isDestroyed() || isCyber) return;
          const lyr = viewer.imageryLayers.addImageryProvider(provider);
          lyr.brightness = 0.86; // Kept exactly the same
          lyr.contrast = 1.0;    // Pure neutral linear contrast (zero crushed shadows)
          lyr.saturation = 1.0;  // 100% natural satellite colors
          lyr.gamma = 0.92;      // Subtle shadow lift revealing forest, valley, and mountain textures
          attachSubtleCountryBorders(viewer);
        })
        .catch(async () => {
          if (viewer.isDestroyed() || isCyber) return;
          try {
            const fb = new Cesium.OpenStreetMapImageryProvider({ url: 'https://tile.openstreetmap.org/' });
            if (viewer.isDestroyed() || isCyber) return;
            const lyr = viewer.imageryLayers.addImageryProvider(fb);
            lyr.brightness = 0.86;
            lyr.contrast = 1.0;
            lyr.saturation = 1.0;
            lyr.gamma = 0.92;
            attachSubtleCountryBorders(viewer);
          } catch (err) {}
        });

      if (viewer.scene.globe) {
        viewer.scene.globe.showGroundAtmosphere = config.showGroundAtmosphere;
        viewer.scene.globe.enableLighting = false; // Permanent uniform Google Earth daytime illumination
        viewer.scene.globe.dynamicAtmosphereLighting = false; // Eliminates directional sun angle gradient / left-right difference
        viewer.scene.globe.dynamicAtmosphereLightingFromSun = false; // Eliminates edge falloff
        viewer.scene.globe.preloadAncestors = config.preloadAncestors;
        viewer.scene.globe.preloadSiblings = config.preloadSiblings;
        viewer.scene.globe.tileCacheSize = config.tileCacheSize;
        viewer.scene.globe.maximumScreenSpaceError = config.maximumScreenSpaceError;
        viewer.scene.globe.loadingDescendantLimit = config.loadingDescendantLimit;
        viewer.scene.globe.depthTestAgainstTerrain = true; // Authentic 3D mountain and valley depth
      }

      if (viewer.scene.skyAtmosphere) {
        viewer.scene.skyAtmosphere.show = config.showSkyAtmosphere;
        viewer.scene.skyAtmosphere.brightnessShift = -0.25; // Subtle natural blue outer limb
        viewer.scene.skyAtmosphere.saturationShift = 0.0;
      }

      // STAGE 1: Load essential city entities immediately
      runStaggered(0, () => {
        const baseCyan = Cesium.Color.fromCssColorString('#00E5FF'); // Primary Future City Cyan
        const glowBlue = Cesium.Color.fromCssColorString('#0055FF'); // Subtle electric-blue glow/outline
        const whiteCyanCore = Cesium.Color.fromCssColorString('#E0F7FA'); // Glowing core
        const globalMarkerDistance = new Cesium.DistanceDisplayCondition(0, 50000000);

        cities.forEach((city) => {
          const isTier1 = GLOBAL_TIER1_HUBS.has(city.name);
          const pop = city.offsets?.population || 0.01;
          const isTier2 = !isTier1 && (pop > 0.008 || city.year === 2030);

          // Apply city limits based on rendering quality profile
          if (config.citiesLimit === 'tier1' && !isTier1) return;
          if (config.citiesLimit === 'tier1_tier2' && !isTier1 && !isTier2) return;

          const labelDistance = isTier1 
            ? new Cesium.DistanceDisplayCondition(0, 18000000) 
            : (isTier2 ? new Cesium.DistanceDisplayCondition(0, 8500000) : new Cesium.DistanceDisplayCondition(0, 4500000));

          const isVisible = activeLayers.cities;
          const isYearActive = (!city.year || city.year <= activeYear);
          
          // Clear scale hierarchy: Tier 1 (Primary) is largest, Tier 2 is medium, Tier 3 (Normal) is smallest
          const coreSize = isTier1 ? 6.0 : (isTier2 ? 4.5 : 3.0);

          const cityEnt = safeAddEntity({
            position: Cesium.Cartesian3.fromDegrees(city.lon, city.lat),
            show: isVisible,
            point: {
              pixelSize: coreSize,
              color: isYearActive ? (isTier1 ? whiteCyanCore : baseCyan) : baseCyan.withAlpha(0.65),
              outlineColor: isTier1 ? baseCyan : glowBlue.withAlpha(0.85),
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
              outlineColor: Cesium.Color.fromCssColorString('#02060a'),
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
      });

      return () => {
        activeTimeouts.forEach(clearTimeout);
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

    // Load Terrain Provider (Fast, non-blocking)
    try {
      const ionToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
      if (ionToken) {
        Cesium.createWorldTerrainAsync({
          requestVertexNormals: true
        })
        .then((tp: any) => {
          if (viewer.isDestroyed()) return;
          viewer.terrainProvider = tp;
        })
        .catch(() => {});
      }
    } catch (e) {}

    // Load Day Imagery Layer
    viewer.imageryLayers.removeAll();
    Cesium.ArcGisMapServerImageryProvider.fromUrl(
      'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
      { enablePickFeatures: false, maximumLevel: 23 }
    )
      .then((provider: any) => {
        if (viewer.isDestroyed()) return;
        const lyr = viewer.imageryLayers.addImageryProvider(provider);
        lyr.brightness = 0.86;
        lyr.contrast = 1.0;
        lyr.saturation = 1.0;
        lyr.gamma = 0.92;
        attachSubtleCountryBorders(viewer);
      })
      .catch(async () => {
        if (viewer.isDestroyed()) return;
        try {
          const fb = new Cesium.OpenStreetMapImageryProvider({ url: 'https://tile.openstreetmap.org/' });
          if (viewer.isDestroyed()) return;
          const lyr = viewer.imageryLayers.addImageryProvider(fb);
          lyr.brightness = 0.86;
          lyr.contrast = 1.0;
          lyr.saturation = 1.0;
          lyr.gamma = 0.92;
          attachSubtleCountryBorders(viewer);
        } catch (err) {}
      });

    // Configure base globe settings
    if (viewer.scene.globe) {
      viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#020b18'); // Rich deep blue oceans
      viewer.scene.globe.showGroundAtmosphere = config.showGroundAtmosphere;
      viewer.scene.globe.enableLighting = false;
      viewer.scene.globe.dynamicAtmosphereLighting = false;
      viewer.scene.globe.dynamicAtmosphereLightingFromSun = false;
      viewer.scene.globe.preloadAncestors = config.preloadAncestors;
      viewer.scene.globe.preloadSiblings = config.preloadSiblings;
      viewer.scene.globe.tileCacheSize = config.tileCacheSize;
      viewer.scene.globe.maximumScreenSpaceError = config.maximumScreenSpaceError;
      viewer.scene.globe.loadingDescendantLimit = config.loadingDescendantLimit;
      viewer.scene.globe.depthTestAgainstTerrain = true;
    }

    if (viewer.scene.skyAtmosphere) {
      viewer.scene.skyAtmosphere.show = config.showSkyAtmosphere;
      viewer.scene.skyAtmosphere.brightnessShift = -0.25;
      viewer.scene.skyAtmosphere.saturationShift = 0.0;
    }

    // ─── Cyber 2050 Space Telemetry Ring ───
    if (config.loadOrbitalShells && !isMobile) {
      const orbitPts: any[] = [];
      const incl = Cesium.Math.toRadians(32.0); // 32 degree tilt for oblique cyber orbital ring
      for (let i = 0; i <= 360; i += 2) {
        const rad = Cesium.Math.toRadians(i);
        const r = 6378137 + 750000; // 750km orbital height
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
    }

    // Equatorial Grid Ring representing planetary energy mesh
    if (config.loadGeopoliticalLanes && !isMobile) {
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

    if (viewer.scene.postProcessStages && viewer.scene.postProcessStages.bloom) {
      viewer.scene.postProcessStages.bloom.enabled = false;
    }
    if (viewer.scene.fog) {
      viewer.scene.fog.enabled = false;
    }

    // Primitive collections for high-performance rendering
    const dotCollection        = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
    const staticNodeCollection = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
    const mainNodeCollection   = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
    const beamCollection       = viewer.scene.primitives.add(new Cesium.PolylineCollection());
    
    // Tagged category-specific primitive collections for fast toggling and performance
    const citiesRoutesLines = viewer.scene.primitives.add(new Cesium.PolylineCollection());
    (citiesRoutesLines as any).layerId = 'cities';

    const techPoints = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
    (techPoints as any).layerId = 'tech';

    const techLines = viewer.scene.primitives.add(new Cesium.PolylineCollection());
    (techLines as any).layerId = 'tech';

    const energyPoints = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
    (energyPoints as any).layerId = 'energy';

    const energyLines = viewer.scene.primitives.add(new Cesium.PolylineCollection());
    (energyLines as any).layerId = 'energy';

    const spacePoints = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
    (spacePoints as any).layerId = 'space';

    const geoPoints = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
    (geoPoints as any).layerId = 'geopolitical';

    const geoLines = viewer.scene.primitives.add(new Cesium.PolylineCollection());
    (geoLines as any).layerId = 'geopolitical';

    const marketsPoints = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
    (marketsPoints as any).layerId = 'markets';

    const marketsLines = viewer.scene.primitives.add(new Cesium.PolylineCollection());
    (marketsLines as any).layerId = 'markets';

    // Structs for animation values
    type DotAnim = { phase: number; isLand: boolean; nx: number; ny: number; nz: number; hubProximity: number };
    type StaticNodeAnim = { phase: number; period: number; baseSize: number; color: any; baseAlpha: number };
    type MainNodeAnim = {
      phase: number; period: number; baseSize: number; tier: number; color: any; corePt: any; glowPt: any; outerPt: any;
    };

    const dotAnimData: DotAnim[] = [];
    const staticNodeAnimData: StaticNodeAnim[] = [];
    const mainNodeAnimData: MainNodeAnim[] = [];

    const cyberCityColor = Cesium.Color.fromCssColorString('#00E5FF'); // Chrono Cyan
    const glowBlue = Cesium.Color.fromCssColorString('#0055FF'); // Subtle electric blue

    // STAGE 1 (0ms): Cities points and beacons
    runStaggered(0, () => {
      cities.forEach((city) => {
        const isTier1 = GLOBAL_TIER1_HUBS.has(city.name);
        const pop = city.offsets?.population || 0.01;
        const isTier2 = !isTier1 && (pop > 0.008 || city.year === 2030);
        const tier = isTier1 ? 3 : (isTier2 ? 2 : 1);

        // Apply rendering quality city limits
        if (config.citiesLimit === 'tier1' && !isTier1) return;
        if (config.citiesLimit === 'tier1_tier2' && !isTier1 && !isTier2) return;

        const pos = Cesium.Cartesian3.fromDegrees(city.lon, city.lat, 10000);
        const isVisible = activeLayers.cities;
        const isYearActive = (!city.year || city.year <= activeYear);

        // Clear visual hierarchy: Tier 1 (Primary) is largest, Tier 2 is medium, Tier 3 (Normal) is smallest
        const coreSize = isTier1 ? 6.0 : (isTier2 ? 4.5 : 3.0);
        const glowSize = isTier1 ? 14.0 : (isTier2 ? 10.0 : 6.0);
        const haloSize = isTier1 ? 24.0 : (isTier2 ? 16.0 : 10.0);

        // Core point
        const corePt = mainNodeCollection.add({
          position: pos,
          color: isYearActive ? Cesium.Color.WHITE : cyberCityColor.withAlpha(0.7),
          pixelSize: coreSize,
          show: isVisible,
          translucencyByDistance: new Cesium.NearFarScalar(1500000, 1.0, 35000000, 0.65),
          scaleByDistance: new Cesium.NearFarScalar(1500000, 1.0, 35000000, 0.45),
        });

        // Inner glow
        const glowPt = mainNodeCollection.add({
          position: pos,
          color: cyberCityColor.withAlpha(0.35),
          pixelSize: glowSize,
          show: isVisible,
          translucencyByDistance: new Cesium.NearFarScalar(1500000, 1.0, 35000000, 0.40),
          scaleByDistance: new Cesium.NearFarScalar(1500000, 1.0, 35000000, 0.45),
        });

        // Outer halo
        const outerPt = mainNodeCollection.add({
          position: pos,
          color: glowBlue.withAlpha(0.15),
          pixelSize: haloSize,
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
          tier,
          color: cyberCityColor,
          corePt,
          glowPt,
          outerPt,
        });

        // Concentric pulse rings & beacons (for important nodes)
        if (isTier1 || isTier2 || city.year === 2030 || (city.offsets?.population || 0) > 0.015) {
          if (config.enablePulseRings) {
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
          }

          if (config.enableBeacons) {
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
        }
      });
    });

    // STAGE 2 (200ms): Transport routes & shipping lanes
    runStaggered(200, () => {
      // Autonomous routes
      if (config.loadRoutes) {
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
      }

      // Geopolitical lanes
      if (config.loadGeopoliticalLanes) {
        GEOPOLITICAL_LANES.forEach((lane, index) => {
          if (isMobile && index % 2 !== 0) return;
          const flatCoords = lane.coords.flatMap(c => [c.lon, c.lat]);
          geoLines.add({
            positions: Cesium.Cartesian3.fromDegreesArray(flatCoords),
            width: 0.6,
            color: Cesium.Color.fromCssColorString(lane.isArctic ? '#00FFFF' : '#1F75FE').withAlpha(0.08),
          });
        });

        // Aviation corridors
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
      }
    });

    // STAGE 3 (400ms): Overlays (Climate, Tech, Energy, Spaceports)
    runStaggered(400, () => {
      // Climate zones
      if (config.loadClimateRegions) {
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
      }

      // Tech Hubs
      if (config.loadTechHubs) {
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

        QUANTUM_LINKS.forEach((link, index) => {
          if (isMobile && index % 2 !== 0) return;
          techLines.add({
            positions: Cesium.Cartesian3.fromDegreesArray([link.a.lon, link.a.lat, link.b.lon, link.b.lat]),
            width: 0.6,
            color: Cesium.Color.fromCssColorString('#9933FF').withAlpha(0.08),
          });
        });
      }

      // Energy Grid
      if (config.loadEnergyHubs) {
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

        FUSION_GRID.forEach((grid, index) => {
          if (isMobile && index % 2 !== 0) return;
          energyLines.add({
            positions: Cesium.Cartesian3.fromDegreesArray([grid.a.lon, grid.a.lat, grid.b.lon, grid.b.lat]),
            width: 0.6,
            color: Cesium.Color.fromCssColorString('#FF9900').withAlpha(0.08),
          });
        });
      }

      // Spaceports
      if (config.loadSpaceports) {
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
      }
    });

    // STAGE 4 (650ms): Geopolitical choke points + Semiconductor supply + earthquakes
    runStaggered(650, () => {
      if (config.loadGeopoliticalLanes) {
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
      }

      if (config.loadMarketsFabs) {
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

        SEMI_SUPPLY_LINKS.forEach((link, index) => {
          if (isMobile && index % 2 !== 0) return;
          marketsLines.add({
            positions: Cesium.Cartesian3.fromDegreesArray([link.a.lon, link.a.lat, link.b.lon, link.b.lat]),
            width: 0.6,
            color: Cesium.Color.fromCssColorString('#00E5FF').withAlpha(0.07),
          });
        });
      }
    });

    // STAGE 5 (900ms): Orbital shell orbits & ISS orbits
    runStaggered(900, () => {
      if (config.loadOrbitalShells) {
        ORBITAL_SHELLS.forEach((shell) => {
          const R = shell.radius;
          const { tiltX, tiltY } = shell;

          // Track rings
          if (!isMobile) {
            const ringPts = Array.from({ length: 181 }, (_, i) => {
              const a = (i / 180) * Math.PI * 2;
              const { x, y, z } = rotateXY(R * Math.cos(a), R * Math.sin(a), 0, tiltX, tiltY);
              return new Cesium.Cartesian3(x, y, z);
            });
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

          // Satellites
          const totalSats = config.limitSatellites ? Math.min(2, shell.sats) : shell.sats;
          for (let s = 0; s < totalSats; s++) {
            if (isMobile && s > 0) continue;
            const phase0 = (s / totalSats) * Math.PI * 2;
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

        // ISS Track
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
    });

    // STAGE 6 (1200ms): Highways pulses, start clock animations
    runStaggered(1200, () => {
      if (config.loadHighways && !isMobile) {
        HIGHWAYS.forEach((hw, hwIdx) => {
          const ca = hubCoord(hw.a);
          const cb = hubCoord(hw.b);
          if (!ca || !cb) return;

          const arcPoints = geodesicArc(ca, cb, hw.alt);
          safeAddEntity({
            polyline: {
              positions: arcPoints,
              width: 0.6,
              material: Cesium.Color.fromCssColorString(C.emerald).withAlpha(0.04),
              arcType: Cesium.ArcType.NONE,
            },
          });

          if (config.enableTravelingPulses) {
            const N = arcPoints.length;
            const pulsePositions = new Cesium.CallbackProperty(() => {
              const period = 6.0;
              const travelTime = 1.4;
              const offset = hwIdx * 0.45;
              const cycleTime = (timeRef.current + offset) % period;

              if (cycleTime > travelTime) return [];

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
      }

      // Pre-cache colors & trigger unified animation frame loop
      const colorLand = Cesium.Color.fromCssColorString('#00F5B0');
      const colorIceBlue = Cesium.Color.fromCssColorString(C.iceBlue);
      const scratchColor = new Cesium.Color();

      let lastRotTime = performance.now();
      const animate = () => {
        if (viewer.isDestroyed()) return;

        const nowMs = performance.now();
        const dt = Math.min(0.1, (nowMs - lastRotTime) / 1000);
        lastRotTime = nowMs;

        const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isPaused = isInteractingRef.current || isFlyingRef.current || !!activeCityRef.current || (Date.now() - lastInteractionTimeRef.current < 4500) || prefersReducedMotion;
        if (!isPaused && isGlobeReady) {
          viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, -0.00035 * dt);
        }

        const time = timeRef.current;
        frameCountRef.current++;

        // Pulse animations
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

          const scale = (isSel ? 1.8 : (isHover ? 1.4 : 1.0)) * (1.0 + 0.35 * flashIntensity);

          const baseCore = anim.tier === 3 ? 6.0 : (anim.tier === 2 ? 4.5 : 3.0);
          const baseGlow = anim.tier === 3 ? 14.0 : (anim.tier === 2 ? 10.0 : 6.0);
          const baseHalo = anim.tier === 3 ? 24.0 : (anim.tier === 2 ? 16.0 : 10.0);

          if (anim.corePt) {
            anim.corePt.pixelSize = baseCore * scale * (0.9 + 0.1 * pulse);
            scratchColor.red = 0.88; scratchColor.green = 0.97; scratchColor.blue = 0.98; // white-cyan
            scratchColor.alpha = Math.min(1.0, 0.85 + 0.15 * pulse + 0.15 * flashIntensity);
            if (!disableDots) anim.corePt.color = scratchColor;
          }

          if (anim.glowPt) {
            const glowFactor = 0.70 + 0.30 * pulse;
            anim.glowPt.pixelSize = baseGlow * scale * glowFactor;
            const animColor = anim.color; // Cyan
            scratchColor.red = animColor.red; scratchColor.green = animColor.green; scratchColor.blue = animColor.blue;
            scratchColor.alpha = Math.min(1.0, (0.55 * pulse + 0.25) * (isSel ? 1.0 : (isHover ? 0.90 : 0.80)) + 0.35 * flashIntensity);
            if (!disableDots) anim.glowPt.color = scratchColor;
          }

          if (anim.outerPt) {
            const outerFactor = 0.60 + 0.40 * pulse;
            anim.outerPt.pixelSize = baseHalo * scale * outerFactor;
            // Electric Blue accent color for outer halo
            scratchColor.red = 0.0; scratchColor.green = 0.33; scratchColor.blue = 1.0; // #0055ff
            scratchColor.alpha = Math.min(1.0, (0.22 * pulse + 0.08) * (isSel ? 1.2 : (isHover ? 1.1 : 1.0)) + 0.15 * flashIntensity);
            if (!disableDots) anim.outerPt.color = scratchColor;
          }
        }
      };

      removeRenderListener = viewer.scene.preRender.addEventListener(animate);
    });

    return () => {
      activeTimeouts.forEach(clearTimeout);
      if (removeRenderListener) removeRenderListener();
      if (!viewer.isDestroyed()) {
        viewer.scene.primitives.remove(dotCollection);
        viewer.scene.primitives.remove(staticNodeCollection);
        viewer.scene.primitives.remove(mainNodeCollection);
        viewer.scene.primitives.remove(beamCollection);
        viewer.scene.primitives.remove(citiesRoutesLines);
        viewer.scene.primitives.remove(techPoints);
        viewer.scene.primitives.remove(techLines);
        viewer.scene.primitives.remove(energyPoints);
        viewer.scene.primitives.remove(energyLines);
        viewer.scene.primitives.remove(spacePoints);
        viewer.scene.primitives.remove(geoPoints);
        viewer.scene.primitives.remove(geoLines);
        viewer.scene.primitives.remove(marketsPoints);
        viewer.scene.primitives.remove(marketsLines);
      }
    };
  }, [isGlobeReady, earthMode, isMobile, activeQuality]);

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
    const config = renderQualityConfig[activeQuality];

    viewer.entities.values.forEach((e: any) => {
      if (e.layerId) {
        const isActive = activeLayers[e.layerId as keyof typeof activeLayers] ?? false;
        let shouldShow = isActive;

        if (e.isFloodOutline) {
          shouldShow = isActive && (activeSimulations.seaLevelRise > 0) && config.loadClimateRegions;
        }

        if (e.cityYear) {
          shouldShow = shouldShow && (e.cityYear <= activeYear);
          // Apply city limits based on rendering quality profile
          if (e.cityData || e.properties?.cityData) {
            const prop = e.cityData || e.properties?.cityData;
            const city = typeof prop.getValue === 'function' ? prop.getValue() : prop;
            if (city) {
              const isTier1 = GLOBAL_TIER1_HUBS.has(city.name);
              const pop = city.offsets?.population || 0.01;
              const isTier2 = !isTier1 && (pop > 0.008 || city.year === 2030);

              if (config.citiesLimit === 'tier1' && !isTier1) shouldShow = false;
              if (config.citiesLimit === 'tier1_tier2' && !isTier1 && !isTier2) shouldShow = false;
            }
          }
        }

        if (e.layerId === 'climate' && !config.loadClimateRegions) shouldShow = false;
        if (e.layerId === 'space' && !config.loadOrbitalShells) shouldShow = false;

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

    // Toggle city points visibility based on activeLayers.cities and quality limits
    for (let i = 0; i < viewer.scene.primitives.length; i++) {
      const p = viewer.scene.primitives.get(i);
      if (p instanceof Cesium.PointPrimitiveCollection) {
        for (let j = 0; j < p.length; j++) {
          const pt = p.get(j);
          if (pt && pt._cityRef) {
            const isYearVisible = (!pt._cityRef.year || pt._cityRef.year <= activeYear);
            let shouldShow = activeLayers.cities && isYearVisible;

            const isTier1 = GLOBAL_TIER1_HUBS.has(pt._cityRef.name);
            const pop = pt._cityRef.offsets?.population || 0.01;
            const isTier2 = !isTier1 && (pop > 0.008 || pt._cityRef.year === 2030);

            if (config.citiesLimit === 'tier1' && !isTier1) shouldShow = false;
            if (config.citiesLimit === 'tier1_tier2' && !isTier1 && !isTier2) shouldShow = false;

            pt.show = shouldShow;
          }
        }
      }
    }
    // Toggle tagged custom primitive collections based on activeLayers and quality parameters
    for (let i = 0; i < viewer.scene.primitives.length; i++) {
      const p = viewer.scene.primitives.get(i);
      if (p && (p as any).layerId) {
        const lyrId = (p as any).layerId;
        const isActive = activeLayers[lyrId as keyof typeof activeLayers] ?? false;
        let shouldShow = isActive;

        if (lyrId === 'cities' && !config.loadRoutes) shouldShow = false; // transport routes
        if (lyrId === 'tech' && !config.loadTechHubs) shouldShow = false;
        if (lyrId === 'energy' && !config.loadEnergyHubs) shouldShow = false;
        if (lyrId === 'space' && !config.loadOrbitalShells) shouldShow = false;
        if (lyrId === 'geopolitical' && !config.loadGeopoliticalLanes) shouldShow = false;
        if (lyrId === 'markets' && !config.loadMarketsFabs) shouldShow = false;

        p.show = shouldShow;
      }
    }

  }, [activeLayers, activeSimulations, activeYear, isGlobeReady, activeQuality]);

  // ─── Camera: fly to active country ─────────────────────────────────────────
  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current || !activeCountry) return;
    const viewer = viewerRef.current;
    if (viewer.isDestroyed()) return;

    const coord = COUNTRY_COORDINATES[activeCountry];
    if (coord) {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(coord.lon, coord.lat - 1.5, coord.height),
        duration: 2.0,
        easingFunction: Cesium.EasingFunction.CUBIC_OUT,
      });
    }
  }, [activeCountry, isGlobeReady]);

  // ─── Selection & Hover state updates (in-place highlight to avoid full reconstruction) ───
  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current) return;
    const viewer = viewerRef.current;
    if (viewer.isDestroyed()) return;

    // 1. Update entities (for Realistic Mode)
    viewer.entities.values.forEach((e: any) => {
      if (e.point && (e.cityData || e.properties?.cityData)) {
        const prop = e.cityData || e.properties?.cityData;
        const cityData = typeof prop.getValue === 'function' ? prop.getValue() : prop;
        const isSel = activeCity?.name === cityData?.name;
        const isHov = hoveredCity?.name === cityData?.name;

        if (isSel) {
          e.point.pixelSize = 8.0;
          e.point.color = Cesium.Color.fromCssColorString('#E0F7FA');
          e.point.outlineColor = Cesium.Color.fromCssColorString('#00E5FF');
          e.point.outlineWidth = 2.5;
        } else if (isHov) {
          e.point.pixelSize = 6.5;
          e.point.color = Cesium.Color.fromCssColorString('#E0F7FA');
          e.point.outlineColor = Cesium.Color.fromCssColorString('#0055FF');
          e.point.outlineWidth = 2.0;
        } else {
          const isTier1 = ['New Delhi', 'Mumbai', 'Bengaluru', 'Tokyo', 'Singapore', 'Dubai', 'London', 'New York', 'San Francisco', 'Beijing', 'Shanghai', 'Seoul', 'Sydney', 'Nairobi', 'Sao Paulo', 'Paris', 'Berlin', 'Cairo', 'Riyadh', 'Jakarta', 'Bangkok', 'Toronto', 'Johannesburg'].includes(cityData?.name);
          const isYearActive = (!cityData?.year || cityData?.year <= activeYear);
          e.point.pixelSize = isTier1 ? 6.0 : (GLOBAL_TIER1_HUBS.has(cityData?.name) ? 6.0 : (cityData?.offsets?.population > 0.008 ? 4.5 : 3.0));
          e.point.color = isYearActive ? (isTier1 ? Cesium.Color.fromCssColorString('#E0F7FA') : Cesium.Color.fromCssColorString('#00E5FF')) : Cesium.Color.fromCssColorString('#00E5FF').withAlpha(0.65);
          e.point.outlineColor = isTier1 ? Cesium.Color.fromCssColorString('#00E5FF') : Cesium.Color.fromCssColorString('#0055FF').withAlpha(0.85);
          e.point.outlineWidth = isTier1 ? 2.5 : 1.5;
        }
      }
    });
  }, [activeCity, hoveredCity, activeYear, isGlobeReady]);

  // ─── Camera: fly to active city ────────────────────────────────────────────
  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current || !activeCity) return;
    const viewer = viewerRef.current;
    if (viewer.isDestroyed()) return;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(activeCity.lon, activeCity.lat - 1.0, 1200000),
      duration: 2.0,
      easingFunction: Cesium.EasingFunction.CUBIC_OUT,
    });
  }, [activeCity, isGlobeReady]);

  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current || activeCity) return;
    // Skip on initial mount so we preserve the authoritative South Asia default view
    if (isFirstCategoryRender.current) {
      isFirstCategoryRender.current = false;
      return;
    }
    const viewer = viewerRef.current;
    if (viewer.isDestroyed()) return;
    const targets: Record<string, [number, number, number]> = {
      'Ocean Monitoring':   [-18.3,  147.7, 2200000],
      'Biodiversity':       [ -3.5,  -62.2, 2800000],
      'Clean Energy':       [ 24.0,   12.0, 3200000],
      'Satellite Network':  [ 25.0,  -45.0, 16000000],
    };
    const target = targets[activeCategory];
    if (!target) return;
    const [lat, lon, height] = target;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
      duration: 2.0,
      easingFunction: Cesium.EasingFunction.CUBIC_OUT,
    });
  }, [activeCategory, activeCity, isGlobeReady]);

  // ─── Camera: fly to focusCoords ────────────────────────────────────────────
  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current || !focusCoords) return;
    const viewer = viewerRef.current;
    if (viewer.isDestroyed()) return;

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(focusCoords.lon, focusCoords.lat - 1.0, focusCoords.height || 1800000),
      duration: 2.0,
      easingFunction: Cesium.EasingFunction.CUBIC_OUT,
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



  // ─── Auto-rotation ──────────────────────────────────────────────────────────
  useEffect(() => {
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    if (activeQuality === 'performance') return; // Disable idle spinning/drift to enable 0% GPU rendering idle state
    if (isInteracting || activeCity || !isGlobeReady) return;
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
  }, [isInteracting, activeCity, isGlobeReady, activeQuality]);

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
    >
      <div ref={containerRef} className="w-full h-full" />

      {/* High-Performance Direct DOM Future City Hover Intelligence Dossier (Zero-Re-Render) */}
      <div
        id="city-hover-dossier-panel"
        className="absolute pointer-events-none select-none z-50 transition-opacity duration-100"
        style={{
          display: 'none',
          opacity: 0,
          left: '0px',
          top: '0px',
          width: '270px',
          willChange: 'transform, opacity',
        }}
      >
        <div
          style={{
            background: 'rgba(8, 12, 18, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 229, 255, 0.30)',
            borderRadius: '4px',
            padding: '12px 14px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.85), 0 0 20px rgba(0, 229, 255, 0.10), inset 0 0 16px rgba(0, 229, 255, 0.03)',
          }}
        >
          {/* Header Status Badge */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00F5B0] animate-pulse shadow-[0_0_8px_#00F5B0]" />
              <span style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.22em', color: '#00E5FF', fontFamily: 'monospace' }}>
                FUTURE CITY DOSSIER
              </span>
            </div>
            <span
              id="hover-dossier-horizon"
              style={{
                fontSize: '7.5px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: '#FFF',
                background: 'rgba(0, 229, 255, 0.12)',
                border: '1px solid rgba(0, 229, 255, 0.30)',
                borderRadius: '2px',
                padding: '1px 5px',
                fontFamily: 'monospace',
              }}
            >
              2030 HORIZON
            </span>
          </div>

          {/* City Name & Country */}
          <div className="mb-2">
            <div id="hover-dossier-name" style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.12em', color: '#FFFFFF', textTransform: 'uppercase', lineHeight: 1.2 }}>
              MUMBAI
            </div>
            <div id="hover-dossier-country" style={{ fontSize: '8.5px', fontWeight: 600, letterSpacing: '0.18em', color: 'rgba(255, 255, 255, 0.55)', textTransform: 'uppercase', marginTop: '2px', fontFamily: 'monospace' }}>
              INDIA · PLANETARY NODE
            </div>
          </div>

          {/* Stats Grid: Coordinates & Population */}
          <div className="grid grid-cols-2 gap-2 pt-2 pb-2 mb-2 border-t border-b border-white/10" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
            <div>
              <div style={{ fontSize: '7px', fontWeight: 500, letterSpacing: '0.14em', color: 'rgba(255, 255, 255, 0.40)', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                COORDINATES
              </div>
              <div id="hover-dossier-coords" style={{ fontSize: '8px', fontWeight: 600, color: '#E2E8F0', fontFamily: 'monospace', marginTop: '1px' }}>
                19.08° N · 72.88° E
              </div>
            </div>
            <div>
              <div style={{ fontSize: '7px', fontWeight: 500, letterSpacing: '0.14em', color: 'rgba(255, 255, 255, 0.40)', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                POPULATION
              </div>
              <div id="hover-dossier-pop" style={{ fontSize: '8px', fontWeight: 700, color: '#00F5B0', fontFamily: 'monospace', marginTop: '1px' }}>
                21.0M Residents
              </div>
            </div>
          </div>

          {/* Intelligence Detail */}
          <div className="mb-2">
            <div id="hover-dossier-detail" style={{ fontSize: '7.5px', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              Operational planetary intelligence node.
            </div>
          </div>

          {/* Bottom Interaction Hint */}
          <div className="flex items-center justify-between pt-1 text-[7px] text-white/30 tracking-wider font-mono">
            <span>CLICK TO SELECT</span>
            <span>DOUBLE-CLICK TO ZOOM</span>
          </div>
        </div>
      </div>

      {/* Earth Page Loading State Overlay */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center z-40 bg-[#02060A] transition-opacity duration-500 ${
          isGlobeReady && !initError ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
        }`}
      >
        {initError ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.35em] text-red-400 uppercase">
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
              <span>{initError}</span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 text-[9px] font-mono tracking-widest text-white/70 hover:text-white border border-white/15 hover:border-white/40 rounded bg-white/5 transition-colors uppercase cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#00E5FF]"
            >
              Retry Initialization
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.35em] text-white/70 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse shadow-[0_0_8px_#00e5ff]" />
              <span>LOADING EARTH…</span>
            </div>
            <div className="font-mono text-[8px] tracking-[0.25em] text-white/35 uppercase">
              {earthLoadingStatus === 'streaming'
                ? 'Streaming satellite imagery'
                : earthLoadingStatus === 'camera'
                ? 'Orienting South Asia vantage'
                : 'Initializing planetary engine'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
