'use client';

import { useEffect, useRef, useState } from 'react';
import { citiesRawData, CityData } from '../data/citiesData';

export type EarthMode = 'realistic' | 'cyber';

interface CesiumGlobeContentProps {
  activeYear:        number;
  activeCategory:    string;
  hoveredCategory?:  string | null;
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
  onReady?:          () => void;
}

declare const Cesium: any;

// ─── STRICT COLOR PALETTE (2050.EARTH INSPIRED) ─────────────────────────────
const C = {
  emerald:   '#00F5D4', // Primary Emerald
  mint:      '#00E5BC', // Secondary Mint
  ocean:     '#02060B', // Ocean Base
  continent: '#07131A', // Continent Fill
  amber:     '#FFB300', // Amber Telemetry
  purple:    '#BD00FF', // Purple Telemetry
  cyan:      '#00E5BC', // Map old C.cyan reference to Mint
  iceBlue:   '#00F5D4', // Map old C.iceBlue reference to Emerald
  white:     '#FFFFFF',
  spaceBg:   '#02060A',
  black:     '#000000',
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
  { name: 'Washington DC', lat:  38.9072, lon:  -77.0369, color: '#6EE7FF' },
  { name: 'New York',      lat:  40.7128, lon:  -74.0060, color: '#6EE7FF' },
  { name: 'Los Angeles',   lat:  34.0522, lon: -118.2437, color: '#6EE7FF' },
  { name: 'Chicago',       lat:  41.8781, lon:  -87.6298, color: '#6EE7FF' },
  { name: 'London',        lat:  51.5074, lon:   -0.1278, color: '#6EE7FF' },
  { name: 'Paris',         lat:  48.8566, lon:    2.3522, color: '#6EE7FF' },
  { name: 'Berlin',        lat:  52.5200, lon:   13.4050, color: '#6EE7FF' },
  { name: 'Madrid',        lat:  40.4168, lon:   -3.7038, color: '#6EE7FF' },
  { name: 'Rome',          lat:  41.9028, lon:   12.4964, color: '#6EE7FF' },
  { name: 'Moscow',        lat:  55.7558, lon:   37.6173, color: '#6EE7FF' },
  { name: 'Istanbul',      lat:  41.0082, lon:   28.9784, color: '#6EE7FF' },
  { name: 'Dubai',         lat:  25.2048, lon:   55.2708, color: '#6EE7FF' },
  { name: 'Riyadh',        lat:  24.7136, lon:   46.6753, color: '#6EE7FF' },
  { name: 'Cairo',         lat:  30.0444, lon:   31.2357, color: '#6EE7FF' },
  { name: 'Mumbai',        lat:  19.0760, lon:   72.8777, color: '#6EE7FF' },
  { name: 'Delhi',         lat:  28.6139, lon:   77.2090, color: '#6EE7FF' },
  { name: 'Bengaluru',     lat:  12.9716, lon:   77.5946, color: '#6EE7FF' },
  { name: 'Singapore',     lat:   1.3521, lon:  103.8198, color: '#6EE7FF' },
  { name: 'Hong Kong',     lat:  22.3193, lon:  114.1694, color: '#6EE7FF' },
  { name: 'Shanghai',      lat:  31.2304, lon:  121.4737, color: '#6EE7FF' },
  { name: 'Beijing',       lat:  39.9042, lon:  116.4074, color: '#6EE7FF' },
  { name: 'Seoul',         lat:  37.5665, lon:  126.9780, color: '#6EE7FF' },
  { name: 'Tokyo',         lat:  35.6762, lon:  139.6503, color: '#6EE7FF' },
  { name: 'Sydney',        lat: -33.8688, lon:  151.2093, color: '#6EE7FF' },
  { name: 'Melbourne',     lat: -37.8136, lon:  144.9631, color: '#6EE7FF' },
  { name: 'São Paulo',     lat: -23.5505, lon:  -46.6333, color: '#6EE7FF' },
  { name: 'Mexico City',   lat:  19.4326, lon:  -99.1332, color: '#6EE7FF' },
  { name: 'Johannesburg',  lat: -26.2041, lon:   28.0473, color: '#6EE7FF' },
  { name: 'Lagos',         lat:   6.5244, lon:    3.3792, color: '#6EE7FF' },
];

const DENSITY_CITIES = [
  // India
  { name: 'Delhi', lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
  { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Pune', lat: 18.5204, lon: 73.8567 },
  { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
  
  // China
  { name: 'Beijing', lat: 39.9042, lon: 116.4074 },
  { name: 'Shanghai', lat: 31.2304, lon: 121.4737 },
  { name: 'Shenzhen', lat: 22.5431, lon: 114.0579 },
  { name: 'Guangzhou', lat: 23.1291, lon: 113.2644 },
  
  // Japan
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { name: 'Osaka', lat: 34.6937, lon: 135.5023 },
  
  // Korea
  { name: 'Seoul', lat: 37.5665, lon: 126.9780 },
  { name: 'Busan', lat: 35.1796, lon: 129.0756 },
  
  // Europe
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'Paris', lat: 48.8566, lon: 2.3522 },
  { name: 'Berlin', lat: 52.5200, lon: 13.4050 },
  
  // USA
  { name: 'New York', lat: 40.7128, lon: -74.0060 },
  { name: 'Washington DC', lat: 38.9072, lon: -77.0369 },
  { name: 'San Francisco', lat: 37.7749, lon: -122.4194 }
];

// ─── GEODESIC HIGHWAYS ──────────────────────────────────────────────────────
const HIGHWAYS = [
  { a: 'Washington DC', b: 'New York',    alt: 150000 },
  { a: 'New York',      b: 'London',      alt: 450000 },
  { a: 'London',        b: 'Paris',       alt: 120000 },
  { a: 'Paris',         b: 'Berlin',      alt: 150000 },
  { a: 'London',        b: 'Dubai',       alt: 400000 },
  { a: 'Dubai',         b: 'Mumbai',      alt: 300000 },
  { a: 'Mumbai',        b: 'Bengaluru',   alt: 150000 },
  { a: 'Bengaluru',     b: 'Singapore',   alt: 220000 },
  { a: 'Singapore',     b: 'Tokyo',       alt: 380000 },
  { a: 'Tokyo',         b: 'Seoul',       alt: 120000 },
  { a: 'Shanghai',      b: 'Beijing',     alt: 180000 },
  { a: 'Beijing',       b: 'Tokyo',       alt: 250000 },
  { a: 'Shanghai',      b: 'Singapore',   alt: 320000 },
  { a: 'Dubai',         b: 'Singapore',   alt: 450000 },
  { a: 'Washington DC', b: 'Tokyo',       alt: 750000 },
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

function hubCoord(name: string) {
  return AI_HUBS.find(h => h.name === name) ?? citiesRawData.find(c => c.name === name) ?? null;
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function CesiumGlobeContent({
  activeYear, activeCategory, hoveredCategory, activeCity, setActiveCity, activeCountry, setActiveCountry, overlays, earthMode, activeLayers, activeSimulations, onReady
}: CesiumGlobeContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef    = useRef<any>(null);
  const timeRef      = useRef(0);

  // Dynamic flags for GPU/WebGL crash audit
  const disableBloom = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('disableBloom') === 'true' : false;
  const disableOutlines = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('disableOutlines') === 'true' : false;
  const disableDots = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('disableDots') === 'true' : false;

  const [isInteracting,  setIsInteracting]  = useState(false);
  const [hoveredCity,    setHoveredCity]    = useState<CityData | null>(null);
  const [hoverPos,       setHoverPos]       = useState<{ x: number; y: number } | null>(null);
  const [isGlobeReady,   setIsGlobeReady]   = useState(false);

  useEffect(() => {
    if (isGlobeReady) {
      onReady?.();
    }
  }, [isGlobeReady, onReady]);
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
  const mainNodeAnimDataRef = useRef<any[]>([]);

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

    const cameraHeight = isMobileDevice ? 9500000 : 9800000;
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(75.0, 0.0, cameraHeight),
      orientation: { heading: 0, pitch: Cesium.Math.toRadians(-62), roll: 0 },
    });
    viewerRef.current = viewer;
    (window as any).viewer = viewer;

    // Print Initial Diagnostics Logs
    console.log(
      "Viewer Size:",
      viewer.canvas.width,
      viewer.canvas.height
    );
    if (containerRef.current) {
      console.log(
        "Container Size:",
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
    }
    console.log(
      "Device Pixel Ratio:",
      window.devicePixelRatio
    );

    // Explicit Resize Observer / Listener
    const handleResize = () => {
      if (viewer && !viewer.isDestroyed()) {
        viewer.resize();
        console.log(
          "Viewer Size (Resize):",
          viewer.canvas.width,
          viewer.canvas.height
        );
        if (containerRef.current) {
          console.log(
            "Container Size (Resize):",
            containerRef.current.clientWidth,
            containerRef.current.clientHeight
          );
        }
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

    // Occlusion & screen coordinates scratch variables
    const scratchNormal = new Cesium.Cartesian3();
    const scratchToCamera = new Cesium.Cartesian3();
    const scratchScreenPos = new Cesium.Cartesian2();

    const isPointOccluded = (pos: any, cameraPos: any) => {
      Cesium.Cartesian3.normalize(pos, scratchNormal);
      Cesium.Cartesian3.subtract(cameraPos, pos, scratchToCamera);
      return Cesium.Cartesian3.dot(scratchToCamera, scratchNormal) < 0.0;
    };

    // Event handlers
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((click: any) => {
      if (hoveredCityRef.current) {
        setActiveCityRef.current(hoveredCityRef.current);
        return;
      }
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
      const mousePos = mv.endPosition;
      if (!mousePos) return;

      const cameraPos = viewer.camera.position;
      let minDistance = Infinity;
      let nearestCity: any = null;

      const anims = mainNodeAnimDataRef.current;
      const numAnims = anims ? anims.length : 0;

      for (let i = 0; i < numAnims; i++) {
        const anim = anims[i];
        if (!anim || !anim.corePt || !anim.corePt.show) continue;

        // Skip nodes that do not represent cities
        const cityRef = anim.corePt._cityRef;
        if (!cityRef) continue;

        const pos = anim.corePt.position;
        if (!pos) continue;

        if (isPointOccluded(pos, cameraPos)) continue;

        const screenPos = viewer.scene.cartesianToCanvasCoordinates(pos, scratchScreenPos);
        if (!screenPos) continue;

        const dx = mousePos.x - screenPos.x;
        const dy = mousePos.y - screenPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < minDistance) {
          minDistance = dist;
          nearestCity = cityRef;
        }
      }

      // Hysteresis logic
      const currentHover = hoveredCityRef.current;

      if (nearestCity) {
        if (minDistance < 25) {
          if (!currentHover || currentHover.name !== nearestCity.name) {
            setHoveredCity(nearestCity);
          }
        } else if (minDistance > 40) {
          if (currentHover && currentHover.name === nearestCity.name) {
            const picked = viewer.scene.pick(mousePos);
            if (Cesium.defined(picked)) {
              if (picked.id?.properties?.cityData) {
                setHoveredCity(picked.id.properties.cityData.getValue());
                return;
              } else if (picked.primitive?._cityRef) {
                setHoveredCity(picked.primitive._cityRef);
                return;
              }
            }
            setHoveredCity(null);
          }
        }
      } else {
        const picked = viewer.scene.pick(mousePos);
        if (Cesium.defined(picked)) {
          if (picked.id?.properties?.cityData) {
            setHoveredCity(picked.id.properties.cityData.getValue());
            return;
          } else if (picked.primitive?._cityRef) {
            setHoveredCity(picked.primitive._cityRef);
            return;
          }
        }
        if (currentHover) {
          setHoveredCity(null);
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(safety);
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
        console.warn('[Cesium Safety] Maximum entities cap (500) reached. Skipping entity.');
        return null;
      }
      try {
        const ent = viewer.entities.add(options);
        if (ent) entityCount++;
        return ent;
      } catch (e) {
        console.warn('[Cesium Safety] Failed to add entity:', e);
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
      Cesium.createWorldImageryAsync({ style: Cesium.IonWorldImageryStyle.AERIAL })
        .then((provider: any) => {
          if (viewer.isDestroyed() || isCyber) return;
          const lyr = viewer.imageryLayers.addImageryProvider(provider);
          lyr.brightness = 1.05; lyr.contrast = 1.05; lyr.saturation = 1.0;
        })
        .catch(async () => {
          if (viewer.isDestroyed() || isCyber) return;
          try {
            const fb = await Cesium.ArcGisMapServerImageryProvider.fromUrl(
              'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
            );
            if (viewer.isDestroyed() || isCyber) return;
            const lyr = viewer.imageryLayers.addImageryProvider(fb);
            lyr.brightness = 1.05; lyr.contrast = 1.05; lyr.saturation = 1.0;
          } catch (err) {
            console.warn('[Cesium fallback imagery] failed:', err);
          }
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
      safeAddEntity({
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

      let rNodeCount = 0;
      citiesRawData.forEach((city) => {
        if (rNodeCount >= 200) return;
        rNodeCount++;
        const isVisible = (!city.year || city.year <= activeYear);
        safeAddEntity({
          position: Cesium.Cartesian3.fromDegrees(city.lon, city.lat),
          show: isVisible,
          point: {
            pixelSize: 4,
            color: Cesium.Color.WHITE.withAlpha(0.50),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          properties: { cityData: city },
        });
      });

      console.log(`[Cesium Globe Diagnostics] Realistic Mode Init`);
      console.log(`- Surface Nodes: ${rNodeCount}`);
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

    // Set solid base globe & disable translucency
    if (viewer.scene.globe) {
      viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#02060B'); // Deep matte black ocean base
      viewer.scene.globe.translucency.enabled = false; // Solid matte finish
      viewer.scene.globe.showGroundAtmosphere = false; // Disable ground atmosphere
      viewer.scene.globe.enableLighting = true; // Enable lighting for smooth depth gradient
    }

    if (viewer.scene.skyAtmosphere) {
      viewer.scene.skyAtmosphere.show = true; // Show atmospheric rim
      viewer.scene.skyAtmosphere.hueShift = -0.15; // Cyan-white desaturated hue
      viewer.scene.skyAtmosphere.saturationShift = -0.6; // High desaturation for cyan-white subtle rim
      viewer.scene.skyAtmosphere.brightnessShift = -0.38; // Soft, subtle, low opacity outer rim (premium appearance)
    }

    // Set desaturated white/cyan DirectionalLight and ambient space-blue light
    viewer.scene.light = new Cesium.DirectionalLight({
      direction: new Cesium.Cartesian3(0.0, 0.0, -1.0), // Will be updated dynamically in animate loop
      color: Cesium.Color.fromCssColorString('#FFFFFF'),
      intensity: 4.0,
    });
    viewer.scene.ambientColor = new Cesium.Color(0.25, 0.30, 0.38, 1.0); // Uniform ambient lighting

    // Disable bloom to match 2050.earth visual style (clean, sharp nodes without glow haze)
    if (viewer.scene.postProcessStages && viewer.scene.postProcessStages.bloom) {
      viewer.scene.postProcessStages.bloom.enabled = false;
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
      baseSize?: number;
      baseAlpha?: number;
      isWhite?: boolean;
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
      pulsePt?: any;
      beamInner?: any;
      beamOuter?: any;
    };
    type PacketAnim = {
      pts: any[];
      arcPoints: any[];
      speed: number;
      offset: number;
    };

    const dotAnimData: DotAnim[] = [];
    const staticNodeAnimData: StaticNodeAnim[] = [];
    const mainNodeAnimData: MainNodeAnim[] = [];
    const packetAnimData: PacketAnim[] = [];

    // Setup Major Hubs (Tier 3) and standard cities (Tier 2) - Capped at 1000 total
    let nodeCount = 0;
    const maxSurfaceNodes = 1000;

    MAJOR_HUBS.forEach((hub, index) => {
      if (nodeCount >= maxSurfaceNodes) return;
      nodeCount++;

      const pos = Cesium.Cartesian3.fromDegrees(hub.lon, hub.lat, 6000);
      
      // Hub color distribution: 80% Emerald (#00F5D4), 20% White (#FFFFFF) (no red)
      let colorStr = '#00F5D4';
      if (index === 7 || index === 8) colorStr = '#FFFFFF';
      const color = Cesium.Color.fromCssColorString(colorStr);

      const fullCity = citiesRawData.find(c => c.name.toLowerCase() === hub.name.toLowerCase() || 
                                               (hub.name.toLowerCase() === 'delhi' && c.name.toLowerCase() === 'new delhi')) || {
        name: hub.name,
        country: 'Global',
        lat: hub.lat,
        lon: hub.lon,
        year: 2030,
        offsets: { population: 10.0, popGrowth: 1.02, tempRise: 1.0 },
        details: { climate: 'Operational adaptation.', energy: 'Nuclear fusion integration.', satellites: 'Stable bandwidth.' }
      };

      const isVisible = (!fullCity.year || fullCity.year <= activeYear);

      // Core point (white) - size 8.0 (Tier 3 Layer A)
      const corePt = mainNodeCollection.add({
        position: pos,
        color: Cesium.Color.WHITE,
        pixelSize: 8,
        show: isVisible,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });

      // Inner glow (emerald) - size 18.0, alpha 0.15 (Tier 3 Layer B)
      const glowPt = mainNodeCollection.add({
        position: pos,
        color: Cesium.Color.fromCssColorString('#00F5D4').withAlpha(0.15),
        pixelSize: 18,
        show: isVisible,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });

      // Expanding pulse ring (emerald) - size 18.0, alpha 0.15 (Tier 3 Layer C)
      const pulsePt = mainNodeCollection.add({
        position: pos,
        color: Cesium.Color.fromCssColorString('#00F5D4').withAlpha(0.15),
        pixelSize: 18,
        show: isVisible,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });

      // Vertical Intelligence Beam
      const beamDir = Cesium.Cartesian3.normalize(pos, new Cesium.Cartesian3());
      const earthRadius = Cesium.Cartesian3.magnitude(pos);
      const beamHeight = 150000 + Math.random() * 250000; // 150km to 400km height
      const topPos = Cesium.Cartesian3.multiplyByScalar(beamDir, earthRadius + beamHeight, new Cesium.Cartesian3());

      // Outer glow line
      const beamOuter = beamCollection.add({
        positions: [pos, topPos],
        width: 4.5,
        show: isVisible,
      });
      beamOuter.material = Cesium.Material.fromType('PolylineGlow', {
        color: Cesium.Color.fromCssColorString('#00F5D4'),
        glowPower: 0.35,
      });

      // Inner white core line
      const beamInner = beamCollection.add({
        positions: [pos, topPos],
        width: 1.2,
        show: isVisible,
      });
      beamInner.material = Cesium.Material.fromType('Color', {
        color: Cesium.Color.WHITE.withAlpha(0.60),
      });

      // Outer halo (soft color) - Disabled
      const outerPt = mainNodeCollection.add({
        position: pos,
        color: color.withAlpha(0.0),
        pixelSize: 0,
        show: false,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });

      corePt._cityRef = fullCity;
      glowPt._cityRef = fullCity;
      outerPt._cityRef = fullCity;

      mainNodeAnimData.push({
        phase: Math.random() * Math.PI * 2,
        period: 1.4 + Math.random() * 1.2,
        baseSize: 8.0,
        tier: 3,
        color: color,
        corePt,
        glowPt,
        outerPt,
        pulsePt,
        beamInner,
        beamOuter,
      });

      // Cyber Mode Infrastructure (concentric pulse rings, spaceport beacons, cargo particles - commented out to remove visual clutter)
      /*
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
      */
    });

    // Populate normal city nodes (Tier 2)
    citiesRawData.forEach((city, index) => {
      if (MAJOR_HUBS.some(h => h.name === city.name)) return;

      const isDensityCity = DENSITY_CITIES.some(dc => dc.name.toLowerCase() === city.name.toLowerCase() || 
        (dc.name.toLowerCase() === 'delhi' && city.name.toLowerCase() === 'new delhi'));

      if (isMobile && index % 2 !== 0) return; // 50% density on mobile
      if (!isDensityCity && nodeCount >= maxSurfaceNodes) return;
      if (!isDensityCity) nodeCount++;

      const pos = Cesium.Cartesian3.fromDegrees(city.lon, city.lat, 5000);
      
      // Node Telemetry Color Distribution
      const rand = Math.random();
      let nodeColorStr = '#00F5D4'; // 70% Emerald
      if (rand > 0.95) nodeColorStr = '#FFB300'; // 5% Amber
      else if (rand > 0.85) nodeColorStr = '#BD00FF'; // 10% Purple
      else if (rand > 0.70) nodeColorStr = '#00E5BC'; // 15% Mint
      const color = Cesium.Color.fromCssColorString(nodeColorStr);
      
      const isVisible = (!city.year || city.year <= activeYear);

      // Core point (white) - size 4.0 (Tier 2)
      const corePt = mainNodeCollection.add({
        position: pos,
        color: Cesium.Color.WHITE,
        pixelSize: 4,
        show: isVisible,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });

      // Inner glow (colored) - size 6.0, alpha 0.24
      const glowPt = mainNodeCollection.add({
        position: pos,
        color: color.withAlpha(0.24),
        pixelSize: 6,
        show: isVisible,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });

      // Outer halo (soft color) - Disabled
      const outerPt = mainNodeCollection.add({
        position: pos,
        color: color.withAlpha(0.0),
        pixelSize: 0,
        show: false,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });

      corePt._cityRef = city;
      glowPt._cityRef = city;
      outerPt._cityRef = city;

      mainNodeAnimData.push({
        phase: Math.random() * Math.PI * 2,
        period: 2.0 + Math.random() * 2.0,
        baseSize: 4.0,
        tier: 2,
        color: color,
        corePt,
        glowPt,
        outerPt,
      });
    });

    // Generate vibrant local intelligence node clusters (Tier 1 & Tier 2) around major hubs
    MAJOR_HUBS.forEach((hub) => {
      const parentCity = citiesRawData.find(c => c.name.toLowerCase() === hub.name.toLowerCase() || 
                                               (hub.name.toLowerCase() === 'delhi' && c.name.toLowerCase() === 'new delhi')) || {
        name: hub.name,
        country: 'Global',
        lat: hub.lat,
        lon: hub.lon,
        year: 2030,
        offsets: { population: 10.0, popGrowth: 1.02, tempRise: 1.0 },
        details: { climate: 'Operational adaptation.', energy: 'Nuclear fusion integration.', satellites: 'Stable bandwidth.' }
      };

      const numClustered = isMobile ? 3 : 8; // 8 cluster nodes per hub city
      for (let s = 0; s < numClustered; s++) {
        // Random offset within 3.5 degrees for tight local city clusters
        const dLat = (Math.random() - 0.5) * 3.5;
        const dLon = (Math.random() - 0.5) * 4.5;
        
        // 80% Tier 1 (Small 2px, tier: 1 in code), 20% Tier 2 (Medium 4px, tier: 2 in code)
        const isTier2 = Math.random() < 0.20;
        const tier = isTier2 ? 2 : 1;
        const baseSize = isTier2 ? 4.0 : 2.0;
        const baseGlowSize = isTier2 ? 6.0 : 3.0;
        const maxGlowAlpha = isTier2 ? 0.28 : 0.22;
        
        // Pure Cyan/Teal color distribution
        const isCyan = Math.random() < 0.65;
        const nodeColorStr = isCyan ? '#00D9FF' : '#00E5FF';
        const nodeColor = Cesium.Color.fromCssColorString(nodeColorStr);
        
        const pos = Cesium.Cartesian3.fromDegrees(hub.lon + dLon, hub.lat + dLat, 4000 + Math.random() * 2000);
        
        const corePt = mainNodeCollection.add({
          position: pos,
          color: Cesium.Color.WHITE,
          pixelSize: baseSize,
          show: true,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        });
        corePt._layerId = 'cities';
        corePt._cityRef = parentCity;
        
        const glowPt = mainNodeCollection.add({
          position: pos,
          color: nodeColor.withAlpha(maxGlowAlpha),
          pixelSize: baseGlowSize,
          show: true,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        });
        glowPt._layerId = 'cities';
        glowPt._cityRef = parentCity;
        
        const outerPt = mainNodeCollection.add({
          position: pos,
          color: nodeColor.withAlpha(0.0),
          pixelSize: 0,
          show: false,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        });
        outerPt._layerId = 'cities';
        outerPt._cityRef = parentCity;
        
        mainNodeAnimData.push({
          phase: Math.random() * Math.PI * 2,
          period: 1.5 + Math.random() * 2.0,
          baseSize: baseSize,
          tier: tier,
          color: nodeColor,
          corePt,
          glowPt,
          outerPt,
        });
      }
    });

    // Thin Geodesic Highways with travelling sub-pulses (Capped at 60 routes) - Desktop only
    let routeCount = 0;
    const maxAnimatedRoutes = 60;

    HIGHWAYS.forEach((hw, hwIdx) => {
      if (routeCount >= maxAnimatedRoutes) return;
      const ca = hubCoord(hw.a);
      const cb = hubCoord(hw.b);
      if (!ca || !cb) return;
      routeCount++;

      const arcPoints = geodesicArc(ca, cb, hw.alt);

      if (!isMobile) {
        // Base route line - ultra-thin primary emerald line
        safeAddEntity({
          polyline: {
            positions: arcPoints,
            width: 0.4, // Thinner lines
            material: Cesium.Color.fromCssColorString('#00F5D4').withAlpha(0.06), // Very low opacity background route
            arcType: Cesium.ArcType.NONE,
          },
        });

        // Staggered travelling pulse segment
        const N = arcPoints.length;
        const pulsePositions = new Cesium.CallbackProperty(() => {
          const period = 8.0; // Slower, calmer pulse cycles
          const travelTime = 1.6;
          const offset = hwIdx * 0.45;
          const cycleTime = (timeRef.current + offset) % period;

          if (cycleTime > travelTime) {
            return [];
          }

          const progress = cycleTime / travelTime;
          const centerIdx = Math.floor(progress * (N - 1));
          const start = Math.max(0, centerIdx - 1);
          const end = Math.min(N - 1, centerIdx + 1);
          return arcPoints.slice(start, end + 1);
        }, false);

        safeAddEntity({
          polyline: {
            positions: pulsePositions,
            width: 0.6, // Subtle, thinned out pulse
            material: Cesium.Color.fromCssColorString('#00E5BC').withAlpha(0.10), // Mint glow pulse
            arcType: Cesium.ArcType.NONE,
          },
        });
      }
    });

    // Initialize Highway Data Packets along main routes
    const packetRoutes = [
      { a: 'New York', b: 'London', alt: 450000, speed: 0.12 },
      { a: 'London', b: 'Dubai', alt: 400000, speed: 0.14 },
      { a: 'Dubai', b: 'Mumbai', alt: 200000, speed: 0.16 },
      { a: 'Singapore', b: 'Tokyo', alt: 350000, speed: 0.13 },
    ];

    packetRoutes.forEach((route, rIdx) => {
      const ca = hubCoord(route.a);
      const cb = hubCoord(route.b);
      if (!ca || !cb) return;

      const arcPoints = geodesicArc(ca, cb, route.alt, 60);

      // Pre-allocate Leader (White) & 3 Tails (Mint/Emerald)
      const leader = mainNodeCollection.add({
        position: arcPoints[0],
        color: Cesium.Color.WHITE,
        pixelSize: 4.0,
        show: true,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });

      const tail1 = mainNodeCollection.add({
        position: arcPoints[0],
        color: Cesium.Color.fromCssColorString('#00E5BC').withAlpha(0.60),
        pixelSize: 3.0,
        show: true,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });

      const tail2 = mainNodeCollection.add({
        position: arcPoints[0],
        color: Cesium.Color.fromCssColorString('#00F5D4').withAlpha(0.40),
        pixelSize: 2.0,
        show: true,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });

      const tail3 = mainNodeCollection.add({
        position: arcPoints[0],
        color: Cesium.Color.fromCssColorString('#00F5D4').withAlpha(0.20),
        pixelSize: 1.5,
        show: true,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });

      packetAnimData.push({
        pts: [leader, tail1, tail2, tail3],
        arcPoints,
        speed: route.speed,
        offset: rIdx * 0.25,
      });
    });

    // Streamlined Orbital Infrastructure (Capped at 4 tracks for background look)
    let orbitCount = 0;
    const maxOrbitTracks = 4;

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
            width: 0.5,
            material: Cesium.Color.fromCssColorString('#00F5D4').withAlpha(0.02), // Subtle emerald cyber ring
            arcType: Cesium.ArcType.GEODESIC,
            granularity: Cesium.Math.toRadians(8.0),
          },
        });
      }

      // Satellites
      for (let s = 0; s < shell.sats; s++) {
        if (isMobile && s > 0) continue; // limit satellites count on mobile
        const phase0 = (s / shell.sats) * Math.PI * 2;
        const speed = shell.speed * 0.4; // Slower motion for a calmer feel

        safeAddEntity({
          position: new Cesium.CallbackProperty(() => {
            const a = (timeRef.current * speed + phase0) % (Math.PI * 2);
            const { x, y, z } = rotateXY(R * Math.cos(a), R * Math.sin(a), 0, tiltX, tiltY);
            return new Cesium.Cartesian3(x, y, z);
          }, false),
          point: {
            pixelSize: 1.5, // Tiny satellites
            color: Cesium.Color.fromCssColorString('#00E5BC').withAlpha(0.15),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        });
      }
    });

    // Load land GeoJSON
    Cesium.GeoJsonDataSource.load(
      'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson',
      { stroke: Cesium.Color.TRANSPARENT, fill: Cesium.Color.TRANSPARENT }
    ).then((ds: any) => {
      if (viewer.isDestroyed() || !isCyber) return;

      const neonColor = Cesium.Color.fromCssColorString('#00F5D4').withAlpha(0.80); // Bright emerald, highly visible outline
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

// Layer A: Thin coastline outline
safeAddEntity({
  polyline: {
    positions: adjustedPositions,
    width: 0.8,
    material: Cesium.Color.fromCssColorString('#00F5D4').withAlpha(0.25),
    arcType: Cesium.ArcType.GEODESIC,
    granularity: isMobile ? Cesium.Math.RADIANS_PER_DEGREE * 5.0 : Cesium.Math.RADIANS_PER_DEGREE,
  }
});

// Layer B: Soft coastline glow envelope (Desktop only)
if (!isMobile) {
  safeAddEntity({
    polyline: {
      positions: adjustedPositions,
      width: 3.0,
      material: Cesium.Color.fromCssColorString('#00F5D4').withAlpha(0.05),
      arcType: Cesium.ArcType.GEODESIC,
      granularity: Cesium.Math.RADIANS_PER_DEGREE * 2.0,
    }
  });
}
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
          // Continent fill color to stand out from the deep black oceans (#07131A)
          e.polygon.material = Cesium.Color.fromCssColorString('#07131A');
          e.polygon.arcType = Cesium.ArcType.GEODESIC,
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

      // Grid lines and axes rings commented out to match 2050.earth solid appearance
      /*
      // Generate lat/lon wireframe grid for a clean digital-twin holographic sphere look
      const gridColor = Cesium.Color.fromCssColorString('#00E5FF').withAlpha(0.04);
      
      // Parallels (latitude lines) every 15 degrees
      for (let lat = -75; lat <= 75; lat += 15) {
        const pts = [];
        for (let lon = -180; lon <= 180; lon += 5) {
          pts.push(Cesium.Cartesian3.fromDegrees(lon, lat, 1000));
        }
        safeAddEntity({
          polyline: {
            positions: pts,
            width: 0.5,
            material: gridColor,
            arcType: Cesium.ArcType.NONE,
          }
        });
      }

      // Meridians (longitude lines) every 30 degrees
      for (let lon = -180; lon < 180; lon += 30) {
        const pts = [];
        for (let lat = -90; lat <= 90; lat += 5) {
          pts.push(Cesium.Cartesian3.fromDegrees(lon, lat, 1000));
        }
        safeAddEntity({
          polyline: {
            positions: pts,
            width: 0.5,
            material: gridColor,
            arcType: Cesium.ArcType.NONE,
          }
        });
      }

      // Intersecting major axes rings for the holographic sphere outline
      const axesColor = Cesium.Color.fromCssColorString('#00E5FF').withAlpha(0.12);
      
      // Equator Ring
      const eqPts = [];
      for (let lon = -180; lon <= 180; lon += 2) {
        eqPts.push(Cesium.Cartesian3.fromDegrees(lon, 0, 1500));
      }
      safeAddEntity({
        polyline: {
          positions: eqPts,
          width: 0.8,
          material: axesColor,
          arcType: Cesium.ArcType.NONE,
        }
      });

      // Prime Meridian Ring
      const pmPts = [];
      for (let lat = -90; lat <= 90; lat += 2) {
        pmPts.push(Cesium.Cartesian3.fromDegrees(0, lat, 1500));
      }
      for (let lat = 90; lat >= -90; lat -= 2) {
        pmPts.push(Cesium.Cartesian3.fromDegrees(180, lat, 1500));
      }
      safeAddEntity({
        polyline: {
          positions: pmPts,
          width: 0.8,
          material: axesColor,
          arcType: Cesium.ArcType.NONE,
        }
      });
      */

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

      // Helper: Check if a coordinate is on land using our canvas
      const isLandCoord = (lat: number, lon: number) => {
        const cx = Math.floor(((lon + 180) / 360) * W);
        const cy = Math.floor(((90 - lat) / 180) * H);
        if (cx < 0 || cx >= W || cy < 0 || cy >= H) return false;
        const idx = (cy * W + cx) * 4;
        return imgData[idx] > 120;
      };

      // Sprawl dot clusters based on real city coordinates and densities
      citiesRawData.forEach((city) => {
        // Base counts and spreads per city (scaled down for performance on mobile)
        let baseCount = 10;
        let spreadRadius = 2.0;

        if (city.name === 'Singapore') {
          baseCount = 80;
          spreadRadius = 0.55;
        } else if (city.country === 'United States' || city.country === 'USA') {
          if (city.lon > -95.0) {
            baseCount = 55; // East Coast - High density
            spreadRadius = 2.5;
          } else {
            baseCount = 25; // West Coast - Medium density
            spreadRadius = 2.0;
          }
        } else if (['United Kingdom', 'Germany', 'France', 'Netherlands', 'Spain', 'Italy', 'Switzerland', 'Sweden', 'Belgium', 'Austria', 'Denmark', 'Poland', 'Portugal'].includes(city.country)) {
          baseCount = 55; // Europe - High density
          spreadRadius = 2.4;
        } else if (city.country === 'India') {
          baseCount = 35; // India - Medium density
          spreadRadius = 2.2;
        } else if (city.country === 'China') {
          baseCount = 35; // China - Medium density
          spreadRadius = 2.2;
        } else if (city.country === 'Japan') {
          baseCount = 30; // Japan - Medium density
          spreadRadius = 1.6;
        } else if (city.country === 'South Korea') {
          baseCount = 25; // South Korea - Medium density
          spreadRadius = 1.3;
        } else if (['Dubai', 'Abu Dhabi', 'Riyadh', 'Doha', 'Kuwait City', 'UAE', 'Saudi Arabia', 'Middle East'].includes(city.country) || ['Dubai', 'Abu Dhabi', 'Riyadh', 'Doha', 'Kuwait City'].includes(city.name)) {
          baseCount = 22; // Middle East
          spreadRadius = 1.3;
        } else if (city.country === 'Turkey') {
          baseCount = 30; // Turkey / Istanbul sprawl
          spreadRadius = 1.8;
        } else if (city.country === 'Australia') {
          baseCount = 20; // Australia sprawl
          spreadRadius = 2.0;
        } else if (city.country === 'Brazil') {
          baseCount = 25; // South America sprawl
          spreadRadius = 2.0;
        } else if (city.country === 'Mexico') {
          baseCount = 25; // Mexico sprawl
          spreadRadius = 2.0;
        } else if (city.country === 'South Africa') {
          baseCount = 20; // South Africa sprawl
          spreadRadius = 1.8;
        } else if (city.country === 'Nigeria') {
          baseCount = 20; // Nigeria sprawl
          spreadRadius = 1.8;
        } else if (city.country === 'Russia') {
          baseCount = 20; // Russia sprawl
          spreadRadius = 1.8;
        } else if (city.country === 'Egypt') {
          baseCount = 20; // Egypt sprawl
          spreadRadius = 1.8;
        }

        const count = isMobile ? Math.floor(baseCount * 0.3) : baseCount;

        let added = 0;
        let attempts = 0;
        const maxAttempts = count * 5;

        while (added < count && attempts < maxAttempts) {
          attempts++;
          // Generate a concentrated circular cluster (power of 1.5 concentrations near center)
          const r = Math.pow(Math.random(), 1.5) * spreadRadius;
          const theta = Math.random() * Math.PI * 2;
          const dotLat = city.lat + r * Math.sin(theta);
          const dotLon = city.lon + r * Math.cos(theta);

          if (isLandCoord(dotLat, dotLon)) {
            // 95% Small 1.0px dots, 5% Medium 2.2px dots
            const isMedium = Math.random() < 0.05;
            const size = isMedium ? 2.2 : 1.0;
            
            // Opacity: small is low-opacity (0.15 to 0.40), medium is 0.45 to 0.70
            const baseAlpha = isMedium ? (0.45 + Math.random() * 0.25) : (0.15 + Math.random() * 0.25);
            
            // 95% of small are 50/50 White vs Cyan. Medium are strictly Cyan.
            const isWhite = !isMedium && Math.random() < 0.50;
            const colorStr = isWhite ? '#FFFFFF' : '#00FFFF';

            dotCollection.add({
              position: Cesium.Cartesian3.fromDegrees(dotLon, dotLat, 2000 + Math.random() * 800),
              color: Cesium.Color.fromCssColorString(colorStr).withAlpha(baseAlpha),
              pixelSize: size,
            });

            // Precompute normal vectors for dynamic lighting calculations
            const radLat = Cesium.Math.toRadians(dotLat);
            const radLon = Cesium.Math.toRadians(dotLon);
            const cosLat = Math.cos(radLat);
            const nx = cosLat * Math.cos(radLon);
            const ny = cosLat * Math.sin(radLon);
            const nz = Math.sin(radLat);

            dotAnimData.push({
              phase: Math.random() * Math.PI * 2,
              isLand: true,
              nx, ny, nz,
              hubProximity: 0.0,
              baseSize: size,
              baseAlpha: baseAlpha,
              isWhite: isWhite,
            });

            added++;
          }
        }
      });

      // Generate static global nodes on land (Capped at 50)
      const numStaticNodes = isMobile ? 10 : 50;
      let staticAdded = 0;
      while (staticAdded < numStaticNodes) {
        const lat = (Math.random() - 0.5) * 140; // -70 to 70
        const lon = (Math.random() - 0.5) * 360;

        const cx = Math.floor(((lon + 180) / 360) * W);
        const cy = Math.floor(((90 - lat) / 180) * H);
        let isLandNode = false;
        if (cx >= 0 && cx < W && cy >= 0 && cy < H) {
          const idx = (cy * W + cx) * 4;
          isLandNode = imgData[idx] > 120;
        }

        if (!isLandNode) continue; // Only add on land

        const colorStr = '#00E5FF';
        const baseSize = 1.0 + Math.random() * 1.5;
        const baseAlpha = 0.25 + Math.random() * 0.25;
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
        staticAdded++;
      }

      // ─── 1. Cities Autonomous Transport Networks ───
      AUTONOMOUS_ROUTES.forEach((conn, index) => {
        if (isMobile && index % 2 !== 0) return;
        const ca = citiesRawData.find(c => c.name === conn.a);
        const cb = citiesRawData.find(c => c.name === conn.b);
        if (ca && cb) {
          const ent = safeAddEntity({
            polyline: {
              positions: Cesium.Cartesian3.fromDegreesArray([ca.lon, ca.lat, cb.lon, cb.lat]),
              width: 0.25,
              material: Cesium.Color.fromCssColorString('#00E5FF').withAlpha(0.05),
              arcType: Cesium.ArcType.GEODESIC,
              granularity: isMobile ? Cesium.Math.RADIANS_PER_DEGREE * 5.0 : Cesium.Math.RADIANS_PER_DEGREE
            }
          });
          if (ent) ent.layerId = 'cities';
        }
      });

      // ─── 2. Climate Intelligence Zones & Flood Outlines (Disabled to remove brown/orange/red blobs)
      /*
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
      */

      // ─── 3. AI & Technology Layer ───
      TECH_HUBS.forEach((th, index) => {
        if (isMobile && index % 2 !== 0) return;
        const pos = Cesium.Cartesian3.fromDegrees(th.lon, th.lat, 4000);
        const nodeColor = Cesium.Color.fromCssColorString('#00E5FF');
        
        const corePt = mainNodeCollection.add({
          position: pos,
          color: Cesium.Color.WHITE,
          pixelSize: 4.0,
          show: activeLayers.tech,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        });
        corePt._layerId = 'tech';
        
        const glowPt = mainNodeCollection.add({
          position: pos,
          color: nodeColor.withAlpha(0.10),
          pixelSize: 6.0,
          show: activeLayers.tech,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        });
        glowPt._layerId = 'tech';
        
        const outerPt = mainNodeCollection.add({
          position: pos,
          color: nodeColor.withAlpha(0.0),
          pixelSize: 0,
          show: false,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        });
        outerPt._layerId = 'tech';
        
        mainNodeAnimData.push({
          phase: Math.random() * Math.PI * 2,
          period: 1.8 + Math.random() * 2.0,
          baseSize: 4.0,
          tier: 1,
          color: nodeColor,
          corePt,
          glowPt,
          outerPt,
        });
      });

      QUANTUM_LINKS.forEach((link, index) => {
        if (isMobile && index % 2 !== 0) return;
        const ent = safeAddEntity({
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray([link.a.lon, link.a.lat, link.b.lon, link.b.lat]),
            width: 0.25,
            material: Cesium.Color.fromCssColorString('#00E5FF').withAlpha(0.05),
            arcType: Cesium.ArcType.GEODESIC,
            granularity: isMobile ? Cesium.Math.RADIANS_PER_DEGREE * 5.0 : Cesium.Math.RADIANS_PER_DEGREE
          }
        });
        if (ent) ent.layerId = 'tech';
      });

      // ─── 4. Energy Layer ───
      FUSION_HUBS.forEach((fh, index) => {
        if (isMobile && index % 2 !== 0) return;
        const pos = Cesium.Cartesian3.fromDegrees(fh.lon, fh.lat, 4000);
        const nodeColor = Cesium.Color.fromCssColorString('#FFCC00');
        
        const corePt = mainNodeCollection.add({
          position: pos,
          color: Cesium.Color.WHITE,
          pixelSize: 6.0,
          show: activeLayers.energy,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        });
        corePt._layerId = 'energy';
        
        const glowPt = mainNodeCollection.add({
          position: pos,
          color: nodeColor.withAlpha(0.12),
          pixelSize: 10.0,
          show: activeLayers.energy,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        });
        glowPt._layerId = 'energy';
        
        const outerPt = mainNodeCollection.add({
          position: pos,
          color: nodeColor.withAlpha(0.0),
          pixelSize: 0,
          show: false,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        });
        outerPt._layerId = 'energy';
        
        mainNodeAnimData.push({
          phase: Math.random() * Math.PI * 2,
          period: 1.5 + Math.random() * 2.0,
          baseSize: 6.0,
          tier: 2,
          color: nodeColor,
          corePt,
          glowPt,
          outerPt,
        });
      });

      FUSION_GRID.forEach((grid, index) => {
        if (isMobile && index % 2 !== 0) return;
        const ent = safeAddEntity({
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray([grid.a.lon, grid.a.lat, grid.b.lon, grid.b.lat]),
            width: 0.25,
            material: Cesium.Color.fromCssColorString('#00E5FF').withAlpha(0.05),
            arcType: Cesium.ArcType.GEODESIC,
            granularity: isMobile ? Cesium.Math.RADIANS_PER_DEGREE * 5.0 : Cesium.Math.RADIANS_PER_DEGREE
          }
        });
        if (ent) ent.layerId = 'energy';
      });

      // ─── 5. Space Layer spaceports ───
      SPACEPORTS.forEach((sp, index) => {
        if (isMobile && index % 2 !== 0) return;
        const pos = Cesium.Cartesian3.fromDegrees(sp.lon, sp.lat, 4000);
        const nodeColor = Cesium.Color.fromCssColorString('#9966FF');
        
        const corePt = mainNodeCollection.add({
          position: pos,
          color: Cesium.Color.WHITE,
          pixelSize: 4.0,
          show: activeLayers.space,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        });
        corePt._layerId = 'space';
        
        const glowPt = mainNodeCollection.add({
          position: pos,
          color: nodeColor.withAlpha(0.10),
          pixelSize: 6.0,
          show: activeLayers.space,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        });
        glowPt._layerId = 'space';
        
        const outerPt = mainNodeCollection.add({
          position: pos,
          color: nodeColor.withAlpha(0.0),
          pixelSize: 0,
          show: false,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        });
        outerPt._layerId = 'space';
        
        mainNodeAnimData.push({
          phase: Math.random() * Math.PI * 2,
          period: 1.8 + Math.random() * 2.0,
          baseSize: 4.0,
          tier: 1,
          color: nodeColor,
          corePt,
          glowPt,
          outerPt,
        });
      });

      // ─── 6. Geopolitical Layer ───
      GEOPOLITICAL_LANES.forEach((lane, index) => {
        if (isMobile && index % 2 !== 0) return;
        const flatCoords = lane.coords.flatMap(c => [c.lon, c.lat]);
        const ent = safeAddEntity({
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray(flatCoords),
            width: 0.25,
            material: Cesium.Color.fromCssColorString(lane.isArctic ? '#00FFFF' : '#00A3FF').withAlpha(0.05),
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
        const pos = Cesium.Cartesian3.fromDegrees(mn.lon, mn.lat, 4000);
        const nodeColor = Cesium.Color.fromCssColorString('#FF9900');
        
        const corePt = mainNodeCollection.add({
          position: pos,
          color: Cesium.Color.WHITE,
          pixelSize: 4.0,
          show: activeLayers.geopolitical,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        });
        corePt._layerId = 'geopolitical';
        
        const glowPt = mainNodeCollection.add({
          position: pos,
          color: nodeColor.withAlpha(0.10),
          pixelSize: 6.0,
          show: activeLayers.geopolitical,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        });
        glowPt._layerId = 'geopolitical';
        
        const outerPt = mainNodeCollection.add({
          position: pos,
          color: nodeColor.withAlpha(0.0),
          pixelSize: 0,
          show: false,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        });
        outerPt._layerId = 'geopolitical';
        
        mainNodeAnimData.push({
          phase: Math.random() * Math.PI * 2,
          period: 1.8 + Math.random() * 2.0,
          baseSize: 4.0,
          tier: 1,
          color: nodeColor,
          corePt,
          glowPt,
          outerPt,
        });
      });

      CHOKE_POINTS.forEach((cp, index) => {
        if (isMobile && index % 2 !== 0) return;
        const pos = Cesium.Cartesian3.fromDegrees(cp.lon, cp.lat, 4000);
        const nodeColor = Cesium.Color.fromCssColorString('#00D9FF');
        
        const corePt = mainNodeCollection.add({
          position: pos,
          color: Cesium.Color.WHITE,
          pixelSize: 6.0,
          show: activeLayers.geopolitical,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        });
        corePt._layerId = 'geopolitical';
        
        const glowPt = mainNodeCollection.add({
          position: pos,
          color: nodeColor.withAlpha(0.12),
          pixelSize: 10.0,
          show: activeLayers.geopolitical,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        });
        glowPt._layerId = 'geopolitical';
        
        const outerPt = mainNodeCollection.add({
          position: pos,
          color: nodeColor.withAlpha(0.0),
          pixelSize: 0,
          show: false,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        });
        outerPt._layerId = 'geopolitical';
        
        mainNodeAnimData.push({
          phase: Math.random() * Math.PI * 2,
          period: 1.5 + Math.random() * 2.0,
          baseSize: 6.0,
          tier: 2,
          color: nodeColor,
          corePt,
          glowPt,
          outerPt,
        });
      });

      console.log(`[Cesium Globe Diagnostics] Initialization Complete`);
      console.log(`- Polyline Count: ${totalLandOutlines}`);
      console.log(`- Orbit Count: ${orbitCount}`);
      console.log(`- Route Count: ${routeCount}`);
      console.log(`- Entity Count: ${viewer.entities.values.length}`);

    }).catch(() => {});

    // Pre-cache base colors to prevent per-frame parsing overhead
    const colorLand = Cesium.Color.fromCssColorString('#00E5FF');
    const colorIceBlue = Cesium.Color.fromCssColorString(C.iceBlue);
    const scratchColor = new Cesium.Color();

    // Unified Performance Animation Loop
    let frameCount = 0;
    let lastFrameTime = performance.now();
    let frameTimes: number[] = [];
    let lastTelemetryTime = performance.now();

    const animate = () => {
      if (viewer.isDestroyed() || !isCyber) return;

      // Dynamically align scene light direction with the camera's position vector
      // to guarantee the visible Earth disc is always 100% illuminated and the sky atmosphere halo remains uniform.
      if (viewer.scene.light) {
        const cameraPos = viewer.camera.position;
        const lightDir = Cesium.Cartesian3.normalize(cameraPos, new Cesium.Cartesian3());
        Cesium.Cartesian3.negate(lightDir, viewer.scene.light.direction);
      }

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

        console.log(
          `%c[Telemetry - ${new Date().toLocaleTimeString()}]`,
          'color: #00D98F; font-weight: bold;',
          `\n- FPS: ${fps}`,
          `\n- Frame Time: ${avgFrameTime.toFixed(1)} ms`,
          `\n- JS Heap: ${heapUsed}`,
          `\n- Point Count: ${totalPoints}`,
          `\n- Polyline Count: ${totalPolylines}`,
          `\n- Active Entities: ${activeEntities}`
        );
      }

      // Subtle breathing planet effect
      const pulseBreathe = Math.sin(time * 0.8);
      if (viewer.scene.light) {
        viewer.scene.light.intensity = 4.0; // Keep fully lit
      }

      // Update dot-matrix grid (every 3rd frame for performance)
      if (!isMobile && frameCount % 3 === 0) {
        const numDots = dotCollection.length;
        for (let i = 0; i < numDots; i++) {
          const pt = dotCollection.get(i);
          if (!pt) continue;
          const anim = dotAnimData[i];
          if (!anim) continue;

          const lightFactor = 1.0; // Fully illuminated, no day/night look
          const tw = 0.75 + 0.25 * Math.sin(time * 2.5 + anim.phase);
          const proximityGlow = 1.0 + anim.hubProximity * 2.5;

          if (anim.isLand) {
            const alpha = (anim.baseAlpha || 0.25) * tw;
            const size = (anim.baseSize || 1.0) * (0.85 + 0.15 * tw);
            const colorStr = anim.isWhite ? '#FFFFFF' : '#00FFFF';
            const baseColor = Cesium.Color.fromCssColorString(colorStr);
            scratchColor.red = baseColor.red;
            scratchColor.green = baseColor.green;
            scratchColor.blue = baseColor.blue;
            scratchColor.alpha = alpha;
            if (!disableDots) pt.color = scratchColor;
            pt.pixelSize = size;
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

        // Slow, subtle breathing pulse
        const pulse = 0.90 + 0.10 * Math.sin(time * 1.2 * ((Math.PI * 2) / anim.period) + anim.phase);

        // Hover & Selection state scaling
        const isSel = activeCityRef.current?.name === anim.corePt._cityRef?.name;
        const isHover = hoveredCityRef.current?.name === anim.corePt._cityRef?.name;

        const scale = (isSel ? 1.8 : (isHover ? 1.6 : 1.0));
        const baseCore = anim.tier === 3 ? 8.0 : (anim.tier === 2 ? 1.8 : 1.2);
        const baseGlow = anim.tier === 3 ? 18.0 : (anim.tier === 2 ? 5.0 : 2.5);
        const maxGlowAlpha = anim.tier === 3 ? 0.15 : (anim.tier === 2 ? 0.20 : 0.12);

        // Core sizing - Crisp White Core (Layer A)
        if (anim.corePt) {
          anim.corePt.pixelSize = baseCore * scale * pulse;
          scratchColor.red = 1.0;
          scratchColor.green = 1.0;
          scratchColor.blue = 1.0;
          scratchColor.alpha = 1.0;
          if (!disableDots) anim.corePt.color = scratchColor;
        }

        // Glow sizing - Clean Emerald Glow (Layer B)
        if (anim.glowPt) {
          const glowScale = (isSel ? 2.5 : (isHover ? 2.2 : 1.0));
          anim.glowPt.pixelSize = baseGlow * glowScale * pulse;
          const glowColor = anim.tier === 3 ? Cesium.Color.fromCssColorString('#00F5D4') : anim.color;
          scratchColor.red = glowColor.red;
          scratchColor.green = glowColor.green;
          scratchColor.blue = glowColor.blue;
          scratchColor.alpha = (anim.tier === 3 ? (isHover || isSel ? 0.20 : 0.15) : maxGlowAlpha) * pulse;
          if (!disableDots) anim.glowPt.color = scratchColor;
        }

        // Layer C Expanding Concentric Pulse Ring (Tier 3 only)
        if (anim.pulsePt) {
          const cyclePeriod = isHover || isSel ? 1.25 : 2.5; // faster loops on hover
          const cycle = (time * (1.0 / cyclePeriod) + anim.phase) % 1.0;
          
          anim.pulsePt.pixelSize = 18.0 + cycle * 22.0; // expands 18px -> 40px
          
          const alpha = 0.15 * (1.0 - cycle); // fade out alpha 0.15 -> 0
          const emeraldColor = Cesium.Color.fromCssColorString('#00F5D4');
          scratchColor.red = emeraldColor.red;
          scratchColor.green = emeraldColor.green;
          scratchColor.blue = emeraldColor.blue;
          scratchColor.alpha = alpha;
          if (!disableDots) anim.pulsePt.color = scratchColor;
          anim.pulsePt.show = anim.corePt.show; // sync visibility
        }

        // Upward Beam Pulse Animation (Tier 3 only)
        if (anim.beamInner && anim.beamOuter) {
          const beamPulse = 0.70 + 0.30 * Math.sin(time * 2.0 + anim.phase);
          const hoverMultiplier = isHover || isSel ? 2.5 : 1.0; // brighter on hover
          
          const innerAlpha = Math.min(1.0, 0.60 * beamPulse * hoverMultiplier);
          const outerAlpha = Math.min(1.0, 0.35 * beamPulse * hoverMultiplier);
          
          anim.beamInner.material.uniforms.color.alpha = innerAlpha;
          anim.beamOuter.material.uniforms.color.alpha = outerAlpha;
        }

        // Update outer halo size & opacity - Disabled to remove large glowing halos
        if (anim.outerPt) {
          anim.outerPt.show = false;
          anim.outerPt.pixelSize = 0.0;
        }
      }

      // Update Highway Data Packets
      const numPackets = packetAnimData.length;
      for (let i = 0; i < numPackets; i++) {
        const pAnim = packetAnimData[i];
        if (!pAnim) continue;

        const progress = (time * pAnim.speed + pAnim.offset) % 1.0;
        const N = pAnim.arcPoints.length;
        const leaderIdx = Math.floor(progress * (N - 1));

        pAnim.pts[0].position = pAnim.arcPoints[leaderIdx];
        pAnim.pts[1].position = pAnim.arcPoints[Math.max(0, leaderIdx - 1)];
        pAnim.pts[2].position = pAnim.arcPoints[Math.max(0, leaderIdx - 2)];
        pAnim.pts[3].position = pAnim.arcPoints[Math.max(0, leaderIdx - 3)];
      }
    };
    mainNodeAnimDataRef.current = mainNodeAnimData;

    removeRenderListener = viewer.scene.postRender.addEventListener(animate);

    return () => {
      mainNodeAnimDataRef.current = [];
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
    console.log(
      '[Year Switch]',
      activeYear,
      'Entities:',
      viewer.entities.values.length,
      'Primitives:',
      viewer.scene.primitives.length
    );

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

    // Toggle point primitive layers visibility
    for (let i = 0; i < viewer.scene.primitives.length; i++) {
      const p = viewer.scene.primitives.get(i);
      if (p instanceof Cesium.PointPrimitiveCollection) {
        for (let j = 0; j < p.length; j++) {
          const pt = p.get(j);
          if (pt) {
            if (pt._cityRef) {
              const isYearVisible = (!pt._cityRef.year || pt._cityRef.year <= activeYear);
              pt.show = activeLayers.cities && isYearVisible;
            } else if (pt._layerId) {
              const isActive = activeLayers[pt._layerId as keyof typeof activeLayers] ?? false;
              pt.show = isActive;
            }
          }
        }
      }
    }

    console.log('[Layers Toggle] Active Layers:', activeLayers, 'Active Simulations:', activeSimulations);
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
    const [lat, lon, height] = targets[activeCategory] ?? [15.0, 115.0, 16000000];
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
    const speed = 0.005;
    const spin = () => {
      if (!viewerRef.current) return;
      const v = viewerRef.current;
      if (v.isDestroyed() || !v.scene?.camera) return;
      const now = Date.now(); const dt = (now - last) / 1000; last = now;
      v.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, speed * dt);
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

      console.log(
        `%c[Cesium Diagnostics - ${new Date().toLocaleTimeString()}]`,
        'color: #00F5B0; font-weight: bold;',
        `\n- Top-level Primitives: ${primCount}`,
        `\n- Total Point Primitives: ${totalPoints}`,
        `\n- Total Polyline Primitives: ${totalPolylines}`,
        `\n- Active postRender Listeners: ${activePostRender}`,
        `\n- Active camera.changed Listeners: ${activeCameraChanged}`,
        `\n- JS Heap Usage: ${heapUsed} (Limit: ${heapLimit})`,
        `\n- Entity Count: ${viewer.entities.values.length}`,
        `\n- Total Vertices Rendered: ${estimatedVertices}`,
        `\n- Imagery Layer Count: ${imageryCount}`
      );
    }, 30000);

    return () => clearInterval(intervalId);
  }, [isGlobeReady]);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      style={isMobile ? {
        position: 'absolute',
        top: '22vh',
        left: '5vw',
        width: '90vw',
        height: '50vh',
        zIndex: 0,
        overflow: 'hidden'
      } : {
        position: 'absolute',
        top: 0,
        left: '6vw',
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        overflow: 'hidden'
      }}
      onMouseDown={() => setIsInteracting(true)}   onMouseUp={() => setIsInteracting(false)}
      onTouchStart={() => setIsInteracting(true)}  onTouchEnd={() => setIsInteracting(false)}
    >
      <div ref={containerRef} className="w-full h-full" />

      {/* Hover Card */}
      {hoveredCity && hoverPos && (() => {
        const status = hoveredCity.year && hoveredCity.year <= activeYear ? 'ACTIVE' : 'MONITORING';
        return (
          <div className="absolute pointer-events-none select-none z-50"
            style={{ left: `${hoverPos.x + 16}px`, top: `${hoverPos.y - 60}px` }}>
            <div style={{
              padding: '8px 12px',
              background: 'rgba(2, 6, 11, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 245, 212, 0.35)', // primary emerald border
              borderRadius: '2px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8), 0 0 10px rgba(0, 245, 212, 0.05)',
              minWidth: '140px',
            }}>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#FFFFFF',
                textTransform: 'uppercase', marginBottom: '1px', fontFamily: 'monospace' }}>
                {hoveredCity.name}
              </div>
              <div style={{ fontSize: '8px', color: '#00E5BC', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px', fontFamily: 'monospace' }}>
                {hoveredCity.country}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', fontFamily: 'monospace', color: '#A2CCE2' }}>
                  <span style={{ marginRight: '16px' }}>STATUS:</span>
                  <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', fontFamily: 'monospace', color: '#A2CCE2' }}>
                  <span style={{ marginRight: '16px' }}>CONNECTED:</span>
                  <span style={{ color: '#00F5D4', fontWeight: 600 }}>YES</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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
