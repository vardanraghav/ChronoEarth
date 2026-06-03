'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as Cesium from 'cesium';
import { Viewer, Scene, Entity, Polyline, useCesium } from 'resium';
import { citiesRawData, CityData } from '../data/citiesData';
import "cesium/Build/Cesium/Widgets/widgets.css";

// Helper component to configure the Cesium Viewer from inside its React Context
function ViewerConfigurator({ onReady }: { onReady: (viewer: any) => void }) {
  const { viewer } = useCesium();

  useEffect(() => {
    if (viewer && !viewer.isDestroyed()) {
      onReady(viewer);
    }
  }, [viewer, onReady]);

  return null;
}

interface CesiumGlobeContentProps {
  activeYear: number;
  activeCategory: string;
  activeCity: CityData | null;
  setActiveCity: (city: CityData | null) => void;
  overlays: {
    climate: boolean;
    pollution: boolean;
    energy: boolean;
    satellite: boolean;
    ai: boolean;
  };
}

const categoryThemes: Record<
  string,
  { primary: string; secondary: string; glow: string; particleColor: string; cesiumColor: Cesium.Color }
> = {
  'Ocean Monitoring': {
    primary: '#00f0ff',
    secondary: '#14b8a6',
    glow: 'rgba(0, 240, 255, 0.15)',
    particleColor: '#00f0ff',
    cesiumColor: Cesium.Color.fromCssColorString('#00f0ff'),
  },
  'Biodiversity': {
    primary: '#10b981',
    secondary: '#34d399',
    glow: 'rgba(16, 185, 129, 0.15)',
    particleColor: '#10b981',
    cesiumColor: Cesium.Color.fromCssColorString('#10b981'),
  },
  'Clean Energy': {
    primary: '#8b5cf6',
    secondary: '#f97316',
    glow: 'rgba(139, 92, 246, 0.15)',
    particleColor: '#8b5cf6',
    cesiumColor: Cesium.Color.fromCssColorString('#8b5cf6'),
  },
  'Satellite Network': {
    primary: '#3b82f6',
    secondary: '#00f0ff',
    glow: 'rgba(59, 130, 246, 0.15)',
    particleColor: '#3b82f6',
    cesiumColor: Cesium.Color.fromCssColorString('#3b82f6'),
  },
};

const cityConnections = [
  { start: 'Mumbai', end: 'Delhi' },
  { start: 'Bangalore', end: 'Hyderabad' },
  { start: 'Hyderabad', end: 'Mumbai' },
  { start: 'Bangalore', end: 'Chennai' },
  { start: 'Kolkata', end: 'Delhi' },
  { start: 'Ahmedabad', end: 'Mumbai' },
  { start: 'Delhi', end: 'Islamabad' },
  { start: 'Mumbai', end: 'Dubai' },
  { start: 'Dubai', end: 'Riyadh' },
  { start: 'Shanghai', end: 'Delhi' },
  { start: 'Moscow', end: 'Berlin' },
  { start: 'Berlin', end: 'London' },
  { start: 'London', end: 'New York' },
  { start: 'New York', end: 'Toronto' },
  { start: 'Moscow', end: 'Shanghai' },
  { start: 'Riyadh', end: 'Dubai' },
];

const getCityCoords = (cityName: string) => {
  const city = citiesRawData.find(c => c.name === cityName);
  return city ? { lat: city.lat, lon: city.lon } : null;
};

const climateZones = [
  { name: 'Pacific Ocean Thermal Center', lat: 0.0, lon: -140.0 },
  { name: 'Atlantic Ocean Thermal Center', lat: 20.0, lon: -40.0 },
  { name: 'Indian Ocean Thermal Center', lat: -10.0, lon: 75.0 },
];

const pollutionZones = [
  { name: 'Delhi Industrial AQI Node', lat: 28.6139, lon: 77.2090 },
  { name: 'Shanghai Port Silt Node', lat: 31.2304, lon: 121.4737 },
  { name: 'New York Congestion Node', lat: 40.7128, lon: -74.0060 },
  { name: 'Moscow Permafrost Sluice', lat: 55.7558, lon: 37.6173 },
  { name: 'London Estuary Barrier', lat: 51.5074, lon: -0.1278 },
  { name: 'Dubai Desal Outflow Center', lat: 25.2048, lon: 55.2708 },
];

const aiZones = [
  { name: 'Bangalore Bio-Computing Grid', lat: 12.9716, lon: 77.5946 },
  { name: 'Silicon Valley/NY Cyber Core', lat: 40.7128, lon: -74.0060 },
  { name: 'Shanghai Hyper-Automation Net', lat: 31.2304, lon: 121.4737 },
  { name: 'London FinTech Ledger Array', lat: 51.5074, lon: -0.1278 },
  { name: 'Dubai Smart Logistics Hub', lat: 25.2048, lon: 55.2708 },
];

export default function CesiumGlobeContent({
  activeYear,
  activeCategory,
  activeCity,
  setActiveCity,
  overlays,
}: CesiumGlobeContentProps) {
  const viewerRef = useRef<any>(null);
  const [time, setTime] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [hoveredCity, setHoveredCity] = useState<CityData | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  
  // Custom states to handle the WebGL loading progression
  const [isGlobeReady, setIsGlobeReady] = useState(false);

  const theme = categoryThemes[activeCategory] || categoryThemes['Ocean Monitoring'];

  // Ref to store cleanup function for tile loading progress listeners
  const tileLoadCleanupRef = useRef<(() => void) | null>(null);

  // Use refs (not useMemo) for Viewer constructor props — refs are 100% stable across renders.
  // useMemo CAN be invalidated under concurrent-mode or StrictMode, causing Viewer recreation.
  const contextOptionsRef = useRef({
    webgl: {
      alpha: true, // Enable WebGL transparency blending
    },
  });

  const creditContainerRef = useRef<HTMLDivElement | undefined>(undefined);
  if (typeof document !== 'undefined' && !creditContainerRef.current) {
    creditContainerRef.current = document.createElement('div');
  }

  // Clean up tile loader listener on unmount
  useEffect(() => {
    return () => {
      if (tileLoadCleanupRef.current) {
        tileLoadCleanupRef.current();
      }
    };
  }, []);

  // Satellite and radar animation loop (drives UI-level time state)
  useEffect(() => {
    let animationId: number;
    const start = Date.now();

    const update = () => {
      setTime((Date.now() - start) / 1000);
      animationId = requestAnimationFrame(update);
    };

    animationId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Post-render coordinate transformer: locks HTML hover HUD box onto the 3D city node
  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current || !viewerRef.current.cesiumElement) return;
    const viewer = viewerRef.current.cesiumElement;
    if (viewer.isDestroyed() || !viewer.scene) return;

    const updateHoverPosition = () => {
      if (viewer.isDestroyed() || !viewer.scene) return;
      if (hoveredCity) {
        const cartesian = Cesium.Cartesian3.fromDegrees(hoveredCity.lon, hoveredCity.lat);
        const canvasPos = viewer.scene.cartesianToCanvasCoordinates(cartesian);
        if (canvasPos) {
          setHoverPos({ x: canvasPos.x, y: canvasPos.y });
        } else {
          setHoverPos(null);
        }
      } else {
        setHoverPos(null);
      }
    };

    const removePostRender = viewer.scene.postRender.addEventListener(updateHoverPosition);
    const removeCameraChange = viewer.camera.changed.addEventListener(updateHoverPosition);

    return () => {
      try { removePostRender(); } catch(e){}
      try { removeCameraChange(); } catch(e){}
    };
  }, [hoveredCity, isGlobeReady]);

  // Handle camera movements (flyTo) for selected cities
  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current || !viewerRef.current.cesiumElement || !activeCity) return;
    const viewer = viewerRef.current.cesiumElement;
    if (viewer.isDestroyed() || !viewer.camera) return;

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(activeCity.lon, activeCity.lat - 1.2, 1400000),
      duration: 3.5,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
    });
  }, [activeCity, isGlobeReady]);

  // Handle camera movements (flyTo) based on active category (when no city is selected)
  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current || !viewerRef.current.cesiumElement) return;
    const viewer = viewerRef.current.cesiumElement;
    if (viewer.isDestroyed() || !viewer.camera) return;
    if (activeCity) return;

    let destLat = 0;
    let destLon = 0;
    let destHeight = 15000000;

    switch (activeCategory) {
      case 'Ocean Monitoring':
        destLat = -18.2861;
        destLon = 147.7000; // Great Barrier Reef
        destHeight = 2200000;
        break;
      case 'Biodiversity':
        destLat = -3.46;
        destLon = -62.2; // Amazon Rainforest
        destHeight = 2800000;
        break;
      case 'Clean Energy':
        destLat = 24.0;
        destLon = 12.0; // Sahara Desert
        destHeight = 3200000;
        break;
      case 'Satellite Network':
        destLon = -45.0;
        destLat = 25.0;
        destHeight = 16000000;
        break;
      default:
        break;
    }

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(destLon, destLat, destHeight),
      duration: 3.5,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
    });
  }, [activeCategory, activeCity, isGlobeReady]);

  // Handle continuous slow rotation using Cesium's native postRender event (safer than rAF).
  // This fires AFTER Cesium has finished its own render, so scene/camera are always valid.
  useEffect(() => {
    if (isInteracting || activeCity || !isGlobeReady) return;
    if (!viewerRef.current || !viewerRef.current.cesiumElement) return;
    const viewer = viewerRef.current.cesiumElement;
    if (viewer.isDestroyed() || !viewer.scene) return;

    let lastTime = Date.now();
    const rotationSpeed = 0.012;

    const onPostRender = () => {
      // Re-check inside the callback — viewer may be destroyed between renders
      if (!viewerRef.current?.cesiumElement) return;
      const v = viewerRef.current.cesiumElement;
      if (v.isDestroyed() || !v.scene || !v.scene.camera) return;

      const now = Date.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      v.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, rotationSpeed * delta);
    };

    // Delay start slightly so camera flyTo can settle
    let removeListener: (() => void) | undefined;
    const timeout = setTimeout(() => {
      if (!viewerRef.current?.cesiumElement) return;
      const v = viewerRef.current.cesiumElement;
      if (v.isDestroyed() || !v.scene) return;
      removeListener = v.scene.postRender.addEventListener(onPostRender);
    }, 1500);

    return () => {
      clearTimeout(timeout);
      if (removeListener) {
        try { removeListener(); } catch (e) {}
      }
    };
  }, [isInteracting, activeCity, isGlobeReady]);

  // ─── Viewer Initialization ────────────────────────────────────────────────
  // Called once by ViewerConfigurator after the Cesium Viewer has fully mounted.
  // We configure EVERYTHING here — imagery, lighting, atmosphere, camera — so there
  // is a single source of truth and no race conditions with JSX-rendered layers.
  const handleViewerReady = useCallback((viewer: any) => {
    if (!viewer || viewer.isDestroyed() || !viewer.scene || !viewer.camera) return;

    // ── 1. CAMERA — cinematic opening angle ──────────────────────────────────
    // Pull back far enough to see the whole sphere beautifully, slight tilt
    // so the horizon curve is visible. This is the NASA/Interstellar aesthetic.
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(20.0, 22.0, 18000000),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch:   Cesium.Math.toRadians(-18), // slight downward tilt — feels cinematic
        roll:    0.0,
      },
    });

    // ── 2. IMAGERY — replace default tiles with real satellite photography ────
    // The #1 fix: CartoDB "dark_all" is a stylized map, NOT a satellite photo.
    // Cesium Ion asset 2 = Bing Maps Aerial — real 15m global satellite imagery.
    // We removeAll() first so we never double-stack layers.
    viewer.imageryLayers.removeAll();

    Cesium.createWorldImageryAsync({
      style: Cesium.IonWorldImageryStyle.AERIAL,
    }).then((provider: any) => {
      if (viewer.isDestroyed()) return;
      const satelliteLayer = viewer.imageryLayers.addImageryProvider(provider);
      // Minimal corrections only — keep it looking like real Earth photography.
      // The old settings (brightness 2.2, contrast 1.6, saturation 1.4) caused
      // the yellow/blown-out tint. Natural values restore true colors.
      satelliteLayer.brightness = 1.05; // imperceptibly lifted for monitor gamma
      satelliteLayer.contrast   = 1.05; // very slightly crisper continents
      satelliteLayer.saturation = 1.0;  // pure natural saturation
      satelliteLayer.hue        = 0.0;  // zero hue shift — actual Earth colors
    }).catch(() => {
      // Fallback: ESRI World Imagery — free, always available, natural colors
      if (viewer.isDestroyed()) return;
      const fallback = new Cesium.ArcGisMapServerImageryProvider({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
      });
      const fallbackLayer = viewer.imageryLayers.addImageryProvider(fallback);
      fallbackLayer.brightness = 1.05;
      fallbackLayer.contrast   = 1.05;
      fallbackLayer.saturation = 1.0;
    });

    // ── 3. WEBGL TRANSPARENCY — let the CSS star field show through ───────────
    viewer.scene.backgroundColor = Cesium.Color.TRANSPARENT;

    // ── 4. GLOBE — enable real lighting, keep atmosphere natural ─────────────
    if (viewer.scene.globe) {
      viewer.scene.globe.showGroundAtmosphere = true;
      // enableLighting = true gives a real day/night terminator line — critical
      // for the volumetric, spherical feel. Night side goes naturally dark.
      viewer.scene.globe.enableLighting = true;

      // Atmosphere tweaks:
      // Old values (22.0 intensity, 0.58 hue shift) caused the RGB chromatic
      // edge glow artifact. Restored to near-default for a natural blue limb.
      viewer.scene.globe.atmosphereLightIntensity    = 10.0; // Cesium default — no glow artifact
      viewer.scene.globe.atmosphereHueShift          = 0.0;  // Natural blue — NOT shifted to cyan
      viewer.scene.globe.atmosphereSaturationShift   = 0.0;  // Natural saturation
      viewer.scene.globe.atmosphereBrightnessShift   = 0.08; // Very subtle brightening of limb
    }

    // ── 5. SKY ATMOSPHERE — thin, realistic blue rim ──────────────────────────
    if (viewer.scene.skyAtmosphere) {
      viewer.scene.skyAtmosphere.show              = true;
      // Old hueShift 0.58 turned the atmosphere cyan/green. Zero = real blue.
      viewer.scene.skyAtmosphere.hueShift          = 0.0;
      viewer.scene.skyAtmosphere.saturationShift   = 0.0;
      // Very slightly lifted so the atmosphere rim reads cleanly on the dark bg
      viewer.scene.skyAtmosphere.brightnessShift   = 0.08;
    }

    // ── 6. SUNLIGHT — realistic warm-white directional light ─────────────────
    // Old intensity 3.8 overexposed continents. 2.2 is natural and cinematic.
    // The warm white color (#fff8f0) mimics real sunlight color temperature.
    viewer.scene.light = new Cesium.DirectionalLight({
      direction: new Cesium.Cartesian3(-0.7, -0.5, -0.5),
      color:     Cesium.Color.fromCssColorString('#fff8f0'), // warm-white sunlight
      intensity: 2.2,
    });

    // ── 7. AMBIENT LIGHT — earthshine on the night side ──────────────────────
    // Old value (0.08, 0.14, 0.35) was a heavy indigo that tinted the dark side
    // an unrealistic blue. Real earthshine is extremely subtle (~0.03 luminance).
    // This barely lifts the night side so it's not pitch black — like a real photo.
    viewer.scene.ambientColor = new Cesium.Color(0.03, 0.03, 0.04, 1.0);

    // ── 8. TILE LOADING PROGRESS — fade loader when Earth is visible ──────────
    let isFullyLoaded = false;
    let removeTileLoadListener: (() => void) | undefined;
    if (viewer.scene.globe) {
      removeTileLoadListener = viewer.scene.globe.tileLoadProgressEvent.addEventListener(
        (queueLength: number) => {
          if (queueLength === 0 && !isFullyLoaded) {
            isFullyLoaded = true;
            setIsGlobeReady(true);
            if (removeTileLoadListener) removeTileLoadListener();
          }
        }
      );
    }

    // Safety: force ready after 5s max (satellite imagery takes longer than map tiles)
    const safetyTimeout = setTimeout(() => {
      if (!isFullyLoaded) {
        isFullyLoaded = true;
        setIsGlobeReady(true);
        if (removeTileLoadListener) {
          try { removeTileLoadListener(); } catch(e){}
        }
      }
    }, 5000);

    tileLoadCleanupRef.current = () => {
      clearTimeout(safetyTimeout);
      if (removeTileLoadListener) {
        try { removeTileLoadListener(); } catch(e){}
      }
    };
  }, []);

  // Generate coordinates for high-tech satellite orbit circles
  const generateOrbitPoints = (tiltRad: number, height: number) => {
    const points = [];
    const radius = 6378137 + height;
    for (let i = 0; i <= 72; i++) {
      const angle = (i / 72) * Math.PI * 2;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle) * Math.cos(tiltRad);
      const z = radius * Math.sin(angle) * Math.sin(tiltRad);
      points.push(new Cesium.Cartesian3(x, y, z));
    }
    return points;
  };

  const getSatellitePos = (tiltRad: number, height: number, speed: number) => {
    const radius = 6378137 + height;
    const angle = (time * speed) % (Math.PI * 2);
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle) * Math.cos(tiltRad);
    const z = radius * Math.sin(angle) * Math.sin(tiltRad);
    return new Cesium.Cartesian3(x, y, z);
  };

  const orbits = [
    { tilt: 0.4, height: 1400000, speed: 0.08, color: Cesium.Color.fromCssColorString('#00f0ff') },
    { tilt: -0.7, height: 2000000, speed: 0.05, color: Cesium.Color.fromCssColorString('#8b5cf6') },
    { tilt: 1.2, height: 1700000, speed: 0.07, color: Cesium.Color.fromCssColorString('#14b8a6') },
    { tilt: 0.1, height: 2500000, speed: 0.06, color: Cesium.Color.fromCssColorString('#3b82f6') },
    { tilt: -1.1, height: 2200000, speed: 0.09, color: Cesium.Color.fromCssColorString('#00f0ff') },
  ];

  const yearFactor = (activeYear - 2025) / 25; // 0.0 to 1.0

  const activeSats = activeYear <= 2025
    ? orbits.slice(0, 1)
    : activeYear <= 2030
      ? orbits.slice(0, 2)
      : activeYear <= 2040
        ? orbits.slice(0, 3)
        : orbits;

  const climateRadius = 1200000 + yearFactor * 1600000;
  const climateColorStr = yearFactor < 0.3
    ? '#3b82f6'
    : yearFactor < 0.6
      ? '#f97316'
      : '#ef4444';
  const climateColorVal = Cesium.Color.fromCssColorString(climateColorStr).withAlpha(0.08 + yearFactor * 0.17);

  const pollutionRadius = 350000 - yearFactor * 230000;
  const pollutionColorStr = yearFactor > 0.75
    ? '#10b981'
    : yearFactor > 0.4
      ? '#84cc16'
      : '#eab308';
  const pollutionColorVal = Cesium.Color.fromCssColorString(pollutionColorStr).withAlpha(0.24 - yearFactor * 0.14);

  const aiRadius = 100000 + yearFactor * 900000;
  const aiColorVal = Cesium.Color.fromCssColorString('#8b5cf6').withAlpha(0.06 + yearFactor * 0.14);

  const energyPacketsCount = activeYear <= 2025 ? 1 : activeYear <= 2035 ? 2 : 3;
  const energyPacketSpeed = 0.05 + yearFactor * 0.10;

  const getLinePulsePos = (start: { lat: number; lon: number }, end: { lat: number; lon: number }, speed: number, offset: number) => {
    const t = ((time * speed) + offset) % 1.0;
    const lat = start.lat + (end.lat - start.lat) * t;
    const lon = start.lon + (end.lon - start.lon) * t;
    return Cesium.Cartesian3.fromDegrees(lon, lat);
  };

  // Radar pulse animation variables around the active selected city
  const pulseFactor = (time * 1.2) % 1.0;
  const pulseRadius = pulseFactor * 320000;
  const pulseAlpha = 0.65 * (1.0 - pulseFactor);

  return (
    <div
      className="absolute inset-0 w-screen h-screen bg-transparent z-0 overflow-hidden"
      onMouseDown={() => setIsInteracting(true)}
      onMouseUp={() => setIsInteracting(false)}
      onTouchStart={() => setIsInteracting(true)}
      onTouchEnd={() => setIsInteracting(false)}
    >
      <Viewer
        ref={viewerRef}
        full
        timeline={false}
        animation={false}
        baseLayerPicker={false}
        navigationHelpButton={false}
        homeButton={false}
        sceneModePicker={false}
        geocoder={false}
        infoBox={false}
        selectionIndicator={false}
        fullscreenButton={false}
        skyBox={false} // Disable default skybox to allow underlying CSS stars and auroras to show through
        contextOptions={contextOptionsRef.current} // Ref-stabilized to prevent constructor recreation crash loops
        creditContainer={creditContainerRef.current} // Ref-stabilized to prevent constructor recreation crash loops
        style={{ width: '100vw', height: '100vh' }}
      >
        <ViewerConfigurator onReady={handleViewerReady} />

        {/* Scene: transparent WebGL so CSS stars show through. SkyAtmosphere is
            configured in handleViewerReady — don't pass new SkyAtmosphere() here
            as it would create a fresh object on every render. */}
        <Scene backgroundColor={Cesium.Color.TRANSPARENT} />

        {/* 16 Futuristic Cities Rendered as Point Nodes */}
        {citiesRawData.map((city) => {
          const isSelected = activeCity?.name === city.name;
          return (
            <Entity
              key={city.name}
              position={Cesium.Cartesian3.fromDegrees(city.lon, city.lat)}
              point={{
                // Minimal white dots — city nodes are data, not decoration
                pixelSize:  isSelected ? 6 : 4,
                color:      Cesium.Color.WHITE.withAlpha(isSelected ? 0.90 : 0.50),
                outlineColor: Cesium.Color.WHITE.withAlpha(0.0),
                outlineWidth: 0,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
              }}
              onClick={() => { setActiveCity(city as CityData); }}
              onMouseEnter={() => { setHoveredCity(city as CityData); }}
              onMouseLeave={() => { setHoveredCity(null); }}
            />
          );
        })}

        {/* Subtle pulse ring — very low alpha so it doesn't dominate the globe */}
        {activeCity && (
          <Entity
            position={Cesium.Cartesian3.fromDegrees(activeCity.lon, activeCity.lat)}
            ellipse={{
              semiMajorAxis: pulseRadius,
              semiMinorAxis: pulseRadius,
              material:      Cesium.Color.WHITE.withAlpha(pulseAlpha * 0.35),
              height:        0,
            }}
          />
        )}

        {/* Climate Heatmap (Ocean temperature indices) */}
        {overlays.climate &&
          climateZones.map((zone, i) => (
            <Entity
              key={`climate-${i}`}
              position={Cesium.Cartesian3.fromDegrees(zone.lon, zone.lat)}
              ellipse={{
                semiMajorAxis: climateRadius,
                semiMinorAxis: climateRadius,
                material: climateColorVal,
                height: 5000,
              }}
            />
          ))}

        {/* AQI Air Pollution Nodes */}
        {overlays.pollution &&
          pollutionZones.map((zone, i) => (
            <Entity
              key={`pollution-${i}`}
              position={Cesium.Cartesian3.fromDegrees(zone.lon, zone.lat)}
              ellipse={{
                semiMajorAxis: pollutionRadius,
                semiMinorAxis: pollutionRadius,
                material: pollutionColorVal,
                height: 10000,
              }}
            />
          ))}

        {/* AI Infrastructure Zones */}
        {overlays.ai &&
          aiZones.map((zone, i) => (
            <Entity
              key={`ai-${i}`}
              position={Cesium.Cartesian3.fromDegrees(zone.lon, zone.lat)}
              ellipse={{
                semiMajorAxis: aiRadius,
                semiMinorAxis: aiRadius,
                material: aiColorVal,
                height: 8000,
              }}
            />
          ))}

        {/* Inter-City Energy Hypergrids */}
        {overlays.energy &&
          cityConnections.map((conn, i) => {
            const c1 = getCityCoords(conn.start);
            const c2 = getCityCoords(conn.end);
            if (!c1 || !c2) return null;

            const packets = [];
            for (let k = 0; k < energyPacketsCount; k++) {
              const offset = k / energyPacketsCount;
              packets.push(
                <Entity
                  key={`packet-${i}-${k}`}
                  position={getLinePulsePos(c1, c2, energyPacketSpeed, offset)}
                  point={{
                    pixelSize: 4.5,
                    color: theme.cesiumColor,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 0.8,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                  }}
                />
              );
            }

            return (
              <span key={`group-${i}`}>
                <Polyline
                  positions={[
                    Cesium.Cartesian3.fromDegrees(c1.lon, c1.lat),
                    Cesium.Cartesian3.fromDegrees(c2.lon, c2.lat),
                  ]}
                  width={1}
                  material={Cesium.Material.fromType('Color', {
                    color: theme.cesiumColor.withAlpha(0.12),
                  })}
                />
                {packets}
              </span>
            );
          })}

        {/* Orbital Satellites & Holographic Satellite Shield */}
        {activeCategory === 'Satellite Network' || overlays.satellite ? (
          <>
            {activeSats.map((orb, i) => (
              <Polyline
                key={`orbit-${i}`}
                positions={generateOrbitPoints(orb.tilt, orb.height)}
                width={1}
                material={Cesium.Material.fromType('Color', {
                  color: orb.color.withAlpha(0.25),
                })}
              />
            ))}

            {activeSats.map((orb, i) => (
              <Entity
                key={`sat-${i}`}
                position={getSatellitePos(orb.tilt, orb.height, orb.speed)}
                point={{
                  pixelSize: 8,
                  color: orb.color,
                  outlineColor: Cesium.Color.WHITE,
                  outlineWidth: 1.5,
                  disableDepthTestDistance: Number.POSITIVE_INFINITY,
                }}
              />
            ))}

            {overlays.satellite && (
              <>
                <Entity
                  position={Cesium.Cartesian3.ZERO}
                  ellipsoid={{
                    radii: new Cesium.Cartesian3(6378137 + 400000, 6378137 + 400000, 6378137 + 400000),
                    material: theme.cesiumColor.withAlpha(0.03 + yearFactor * 0.04),
                    fill: true,
                    outline: true,
                    outlineColor: theme.cesiumColor.withAlpha((0.03 + yearFactor * 0.04) * 3),
                    outlineWidth: 1.0,
                  }}
                />
                <Entity
                  position={Cesium.Cartesian3.ZERO}
                  ellipsoid={{
                    radii: new Cesium.Cartesian3(6378137 + 850000, 6378137 + 850000, 6378137 + 850000),
                    material: theme.cesiumColor.withAlpha((0.03 + yearFactor * 0.04) * 0.4),
                    fill: true,
                    outline: true,
                    outlineColor: theme.cesiumColor.withAlpha((0.03 + yearFactor * 0.04) * 1.5),
                    outlineWidth: 0.5,
                  }}
                />
              </>
            )}
          </>
        ) : null}
      </Viewer>

      {/* City hover label — minimal floating text, no glassmorphism box */}
      {hoveredCity && hoverPos && (
        <div
          className="absolute pointer-events-none select-none z-50"
          style={{
            left:      `${hoverPos.x + 14}px`,
            top:       `${hoverPos.y - 38}px`,
            animation: 'fade-in-up 0.2s ease-out forwards',
          }}
        >
          <div
            style={{
              padding:       '6px 10px',
              background:    'rgba(3, 5, 10, 0.75)',
              backdropFilter:'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border:        '1px solid rgba(255,255,255,0.08)',
              borderRadius:  '2px',
            }}
          >
            <div
              style={{
                fontSize:     '9px',
                fontWeight:   300,
                letterSpacing:'0.2em',
                color:        'rgba(255,255,255,0.80)',
                textTransform:'uppercase',
              }}
            >
              {hoveredCity.name}
            </div>
            <div
              style={{
                marginTop:    '2px',
                fontSize:     '7px',
                fontWeight:   200,
                letterSpacing:'0.15em',
                color:        'rgba(255,255,255,0.30)',
              }}
            >
              {hoveredCity.lat.toFixed(2)}° N &nbsp; {hoveredCity.lon.toFixed(2)}° E
            </div>
          </div>
        </div>
      )}

      {/* Futuristic Smooth Loader Overlay — fades out only once globe is fully loaded and centered */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center bg-[#060918] z-50 transition-opacity duration-1000 ease-in-out ${
          isGlobeReady ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="relative w-24 h-24 rounded-full border border-cyan-500/30 flex items-center justify-center animate-pulse">
          <div
            className="absolute inset-0 rounded-full border border-dashed border-cyan-400/20 animate-spin"
            style={{ animationDuration: '8s' }}
          />
          <div className="w-16 h-16 rounded-full bg-cyan-950/20 border border-cyan-400/50 flex items-center justify-center">
            <span className="text-[10px] tracking-widest text-cyan-400 uppercase font-mono">GRID</span>
          </div>
        </div>
        <p className="mt-4 text-xs font-light text-cyan-400/60 uppercase tracking-[0.25em] font-mono">
          Syncing Planet Telemetry...
        </p>
      </div>
    </div>
  );
}
