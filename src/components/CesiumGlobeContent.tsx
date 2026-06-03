'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as Cesium from 'cesium';
import { Viewer, Scene, Entity, Polyline, ImageryLayer, useCesium } from 'resium';
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
  const [imageryProvider, setImageryProvider] = useState<any>(null);

  const theme = categoryThemes[activeCategory] || categoryThemes['Ocean Monitoring'];

  // Ref to store cleanup function for tile loading progress listeners
  const tileLoadCleanupRef = useRef<(() => void) | null>(null);

  // Stabilize contextOptions and creditContainer to prevent Viewer recreation crashes
  const contextOptions = useMemo(() => ({
    webgl: {
      alpha: true, // Enable WebGL transparency blending
    },
  }), []);

  const creditContainer = useMemo(() => {
    if (typeof document !== 'undefined') {
      return document.createElement('div');
    }
    return undefined;
  }, []);

  // Clean up tile loader listener on unmount
  useEffect(() => {
    return () => {
      if (tileLoadCleanupRef.current) {
        tileLoadCleanupRef.current();
      }
    };
  }, []);

  // Initialize CartoDB Dark Matter Imagery Provider
  useEffect(() => {
    const provider = new Cesium.UrlTemplateImageryProvider({
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      subdomains: ['a', 'b', 'c', 'd'],
      minimumLevel: 0,
      maximumLevel: 18,
    });
    setImageryProvider(provider);
  }, []);

  // Satellite and radar animation loop
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

  // Handle continuous slow rotation when user is NOT dragging the globe
  useEffect(() => {
    if (isInteracting || activeCity || !isGlobeReady) return; // Freeze if loading or interacting

    let lastTime = Date.now();
    let frameId: number;

    const rotate = () => {
      if (!viewerRef.current || !viewerRef.current.cesiumElement) return;
      const viewer = viewerRef.current.cesiumElement;
      if (viewer.isDestroyed() || !viewer.scene || !viewer.scene.camera) return;

      const currentTime = Date.now();
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const rotationSpeed = 0.012;
      viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, rotationSpeed * delta);

      frameId = requestAnimationFrame(rotate);
    };

    const timeout = setTimeout(() => {
      frameId = requestAnimationFrame(rotate);
    }, 1500);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(frameId);
    };
  }, [isInteracting, activeCity, isGlobeReady]);

  // Setup viewer configuration on load: sets coordinates view, overlays, brightness, and fades loading layer
  const handleViewerReady = useCallback((viewer: any) => {
    if (!viewer || viewer.isDestroyed() || !viewer.scene || !viewer.camera) return;

    // 1. Zoom and tilt camera view immediately to fill viewport (cinematic curvature focus)
    // We bring the camera closer (7,200,000 meters) and tilt it slightly (-30 degrees) to reduce empty space and emphasize the Earth's curvature.
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(38.0, 25.0, 7200000), // Focused closer to center the globe and reduce empty space
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-30), // Cinematic angle highlighting curved horizon and space background
        roll: 0.0,
      },
    });

    // 2. Tweak brightness/contrast on our CartoDB Dark Matter imagery to make it vibrant and neon
    const layer = viewer.imageryLayers.get(0);
    if (layer) {
      layer.brightness = 2.2;  // Significantly brighten the base imagery
      layer.contrast = 1.6;    // Increase contrast for sharp landmasses and glowing city lights
      layer.saturation = 1.4;  // Saturate colors for high-contrast neon tones
    }

    // 3. Customize atmospheric glow, lighting defaults, and sky transparency
    if (viewer.scene.skyAtmosphere) viewer.scene.skyAtmosphere.show = true;
    if (viewer.scene.globe) {
      viewer.scene.globe.showGroundAtmosphere = true;
      viewer.scene.globe.enableLighting = true; // Enable lighting so the globe is realistically shaded
    }
    
    // Set a transparent background for WebGL to let the CSS stars/auroras show through
    viewer.scene.backgroundColor = Cesium.Color.TRANSPARENT;

    // Add a custom DirectionalLight to illuminate the Earth cinematically from front-left
    viewer.scene.light = new Cesium.DirectionalLight({
      direction: new Cesium.Cartesian3(-0.8, -0.6, -0.6), // Beautiful side/top lighting angle
      color: Cesium.Color.fromCssColorString('#ffffff'),
      intensity: 3.8, // Brighter sun lighting
    });

    // Add glowing blue/indigo ambient color so the night side is clearly visible and has a beautiful sci-fi glow
    viewer.scene.ambientColor = new Cesium.Color(0.08, 0.14, 0.35, 1.0); // Soft glowing indigo/blue ambient

    // Tweak atmosphere properties for a beautiful futuristic cyan/purple glow matching our theme
    if (viewer.scene.globe) {
      viewer.scene.globe.atmosphereLightIntensity = 22.0; // Intensely bright atmosphere glow
      viewer.scene.globe.atmosphereHueShift = 0.58; // Shifts atmosphere colors to futuristic cyan/blue
      viewer.scene.globe.atmosphereSaturationShift = 0.85; // Highly saturated neon atmosphere
      viewer.scene.globe.atmosphereBrightnessShift = 0.35; // Brighter atmospheric envelope
    }

    if (viewer.scene.skyAtmosphere) {
      viewer.scene.skyAtmosphere.hueShift = 0.58;
      viewer.scene.skyAtmosphere.saturationShift = 0.85;
      viewer.scene.skyAtmosphere.brightnessShift = 0.35;
    }

    // 4. Track tile loading progress to fade out the loader overlay only when imagery is fully rendered
    let isFullyLoaded = false;
    let removeTileLoadListener: (() => void) | undefined;
    if (viewer.scene.globe) {
      removeTileLoadListener = viewer.scene.globe.tileLoadProgressEvent.addEventListener((queueLength: number) => {
        if (queueLength === 0 && !isFullyLoaded) {
          isFullyLoaded = true;
          setIsGlobeReady(true);
          if (removeTileLoadListener) removeTileLoadListener();
        }
      });
    }

    // Safety fallback: force ready state after 3.5 seconds max to ensure it doesn't hang
    const safetyTimeout = setTimeout(() => {
      if (!isFullyLoaded) {
        isFullyLoaded = true;
        setIsGlobeReady(true);
        if (removeTileLoadListener) {
          try { removeTileLoadListener(); } catch(e){}
        }
      }
    }, 3500);

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
        contextOptions={contextOptions} // Memoized to prevent constructor recreation crash loops
        creditContainer={creditContainer} // Memoized to prevent constructor recreation crash loops
        style={{ width: '100vw', height: '100vh' }}
      >
        <ViewerConfigurator onReady={handleViewerReady} />

        {/* Render dark matter imagery provider dynamically on mount */}
        {imageryProvider && <ImageryLayer imageryProvider={imageryProvider} />}

        {/* Configure scene to be transparent and show ground atmosphere */}
        <Scene backgroundColor={Cesium.Color.TRANSPARENT} skyAtmosphere={new Cesium.SkyAtmosphere()} />

        {/* 16 Futuristic Cities Rendered as Point Nodes */}
        {citiesRawData.map((city) => {
          const isSelected = activeCity?.name === city.name;
          return (
            <Entity
              key={city.name}
              position={Cesium.Cartesian3.fromDegrees(city.lon, city.lat)}
              point={{
                pixelSize: isSelected ? 12 : 7,
                color: theme.cesiumColor,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: isSelected ? 2.0 : 1.0,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
              }}
              onClick={() => {
                setActiveCity(city as CityData);
              }}
              onMouseEnter={() => {
                setHoveredCity(city as CityData);
              }}
              onMouseLeave={() => {
                setHoveredCity(null);
              }}
            />
          );
        })}

        {/* Dynamic Radar Ring Pulse overlaying around the Active/Selected City */}
        {activeCity && (
          <Entity
            position={Cesium.Cartesian3.fromDegrees(activeCity.lon, activeCity.lat)}
            ellipse={{
              semiMajorAxis: pulseRadius,
              semiMinorAxis: pulseRadius,
              material: theme.cesiumColor.withAlpha(pulseAlpha),
              height: 0,
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

      {/* Futuristic Hover HUD Card aligned with 2D coordinates on screen */}
      {hoveredCity && hoverPos && (
        <div
          className="absolute pointer-events-none select-none z-50"
          style={{
            left: `${hoverPos.x + 12}px`,
            top: `${hoverPos.y - 50}px`,
            animation: 'fade-in-up 0.25s ease-out forwards',
          }}
        >
          <div
            className="rounded px-3 py-2 border flex flex-col gap-1 min-w-[155px]"
            style={{
              borderColor: `${theme.primary}50`,
              background: 'rgba(6, 12, 30, 0.88)',
              backdropFilter: 'blur(8px)',
              boxShadow: `0 0 15px ${theme.primary}20, inset 0 0 8px rgba(0, 240, 255, 0.05)`,
            }}
          >
            <div
              className="flex items-center justify-between border-b pb-1"
              style={{ borderColor: `${theme.primary}20` }}
            >
              <span className="text-[10px] font-semibold tracking-wider text-white uppercase font-mono">
                {hoveredCity.name}
              </span>
              <span className="text-[7px] font-mono tracking-widest text-white/50">
                {hoveredCity.country.toUpperCase()}
              </span>
            </div>
            <div
              className="text-[7.5px] font-mono tracking-wide"
              style={{ color: `${theme.primary}d0` }}
            >
              LAT: {hoveredCity.lat.toFixed(3)} | LON: {hoveredCity.lon.toFixed(3)}
            </div>
            <div className="text-[8px] font-light text-white/60 font-mono mt-0.5">
              Click to load telemetry.
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
