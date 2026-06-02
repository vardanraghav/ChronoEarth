'use client';

import { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import { Viewer, Scene, Entity, Polyline } from 'resium';
import { citiesRawData, CityData } from '../data/citiesData';
import "cesium/Build/Cesium/Widgets/widgets.css";

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

// Connections array representing the inter-city energy hypergrid links
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

// Helper to look up coordinates from city data list
const getCityCoords = (cityName: string) => {
  const city = citiesRawData.find(c => c.name === cityName);
  return city ? { lat: city.lat, lon: city.lon } : null;
};

// Ocean Temperature / Climate warming hotspots
const climateZones = [
  { name: 'Pacific Ocean Thermal Center', lat: 0.0, lon: -140.0 },
  { name: 'Atlantic Ocean Thermal Center', lat: 20.0, lon: -40.0 },
  { name: 'Indian Ocean Thermal Center', lat: -10.0, lon: 75.0 },
];

// Major industrial AQI pollution centers
const pollutionZones = [
  { name: 'Delhi Industrial AQI Node', lat: 28.6139, lon: 77.2090 },
  { name: 'Shanghai Port Silt Node', lat: 31.2304, lon: 121.4737 },
  { name: 'New York Congestion Node', lat: 40.7128, lon: -74.0060 },
  { name: 'Moscow Permafrost Sluice', lat: 55.7558, lon: 37.6173 },
  { name: 'London Estuary Barrier', lat: 51.5074, lon: -0.1278 },
  { name: 'Dubai Desal Outflow Center', lat: 25.2048, lon: 55.2708 },
];

// High-tech AI server grid clusters
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

  const theme = categoryThemes[activeCategory] || categoryThemes['Ocean Monitoring'];

  // Global overlay ticker
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
    if (!viewerRef.current || !viewerRef.current.cesiumElement) return;
    const viewer = viewerRef.current.cesiumElement;

    const updateHoverPosition = () => {
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
      removePostRender();
      removeCameraChange();
    };
  }, [hoveredCity]);

  // Handle camera movements (flyTo) for selected cities
  useEffect(() => {
    if (!viewerRef.current || !viewerRef.current.cesiumElement || !activeCity) return;
    const viewer = viewerRef.current.cesiumElement;

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(activeCity.lon, activeCity.lat - 1.2, 1400000),
      duration: 3.5,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
    });
  }, [activeCity]);

  // Handle camera movements (flyTo) based on active category (when no city is selected)
  useEffect(() => {
    if (!viewerRef.current || !viewerRef.current.cesiumElement) return;
    const viewer = viewerRef.current.cesiumElement;
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
  }, [activeCategory, activeCity]);

  // Handle continuous slow rotation when user is NOT dragging the globe
  useEffect(() => {
    if (isInteracting || activeCity) return;

    let lastTime = Date.now();
    let frameId: number;

    const rotate = () => {
      if (!viewerRef.current || !viewerRef.current.cesiumElement) return;
      const viewer = viewerRef.current.cesiumElement;

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
  }, [isInteracting, activeCity]);

  // Generate satellite orbits
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

  // Pulse calculations (concentric radar loops)
  const pulseFactor = (time * 1.2) % 1.0;
  const pulseRadius = pulseFactor * 320000;
  const pulseAlpha = 0.65 * (1.0 - pulseFactor);

  // Year Progression logic scaling indicators
  const yearFactor = (activeYear - 2025) / 25; // 0.0 at 2025, 1.0 at 2050

  // 1. Satellite mesh count and shell opacity
  const satelliteMeshOpacity = 0.03 + yearFactor * 0.05;
  const satList = [
    { tilt: 0.4, height: 1400000, speed: 0.08, color: Cesium.Color.fromCssColorString('#00f0ff') },
    { tilt: -0.7, height: 2000000, speed: 0.05, color: Cesium.Color.fromCssColorString('#8b5cf6') },
    { tilt: 1.2, height: 1700000, speed: 0.07, color: Cesium.Color.fromCssColorString('#14b8a6') },
    { tilt: 0.1, height: 2500000, speed: 0.06, color: Cesium.Color.fromCssColorString('#3b82f6') },
    { tilt: -1.1, height: 2200000, speed: 0.09, color: Cesium.Color.fromCssColorString('#00f0ff') },
  ];
  // Filter active satellite counts by decade progression
  const activeSats = activeYear <= 2025
    ? satList.slice(0, 1)
    : activeYear <= 2030
      ? satList.slice(0, 2)
      : activeYear <= 2040
        ? satList.slice(0, 3)
        : satList;

  // 2. Climate Change parameters (Reddening oceans and expanding scope)
  const climateRadius = 1200000 + yearFactor * 1600000; // 1.2M meters up to 2.8M meters
  const climateColorStr = yearFactor < 0.3
    ? '#3b82f6' // Blue
    : yearFactor < 0.6
      ? '#f97316' // Orange
      : '#ef4444'; // Hot red
  const climateColorVal = Cesium.Color.fromCssColorString(climateColorStr).withAlpha(0.08 + yearFactor * 0.17);

  // 3. AQI Pollution parameters (Cleaning up, greening, shrinking)
  const pollutionRadius = 350000 - yearFactor * 230000; // 350km down to 120km
  const pollutionColorStr = yearFactor > 0.75
    ? '#10b981' // Clean green
    : yearFactor > 0.4
      ? '#84cc16' // Lime
      : '#eab308'; // Heavy yellow smog
  const pollutionColorVal = Cesium.Color.fromCssColorString(pollutionColorStr).withAlpha(0.24 - yearFactor * 0.14);

  // 4. AI Networks parameters (Vast violet expansions)
  const aiRadius = 100000 + yearFactor * 900000; // 100km to 1000km
  const aiColorVal = Cesium.Color.fromCssColorString('#8b5cf6').withAlpha(0.06 + yearFactor * 0.14);

  // 5. Energy hypergrid calculations
  const energyPacketsCount = activeYear <= 2025 ? 1 : activeYear <= 2035 ? 2 : 3;
  const energyPacketSpeed = 0.05 + yearFactor * 0.10; // travels faster in 2050
  
  // Calculate traveling packet locations along vector line segments
  const getLinePulsePos = (start: { lat: number; lon: number }, end: { lat: number; lon: number }, speed: number, offset: number) => {
    const t = ((time * speed) + offset) % 1.0;
    const lat = start.lat + (end.lat - start.lat) * t;
    const lon = start.lon + (end.lon - start.lon) * t;
    return Cesium.Cartesian3.fromDegrees(lon, lat);
  };

  return (
    <div
      className="absolute inset-0 w-screen h-screen bg-[#060918] z-0 overflow-hidden"
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
        creditContainer={typeof document !== 'undefined' ? document.createElement('div') : undefined}
        style={{ width: '100vw', height: '100vh' }}
      >
        <Scene
          skyAtmosphere={new Cesium.SkyAtmosphere()}
          backgroundColor={Cesium.Color.BLACK}
        />

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

        {/* ==============================================
            PLANETARY SENSOR OVERLAYS (WebGL Layers)
            ============================================== */}

        {/* 1. Climate Heatmap (Ocean temperature indices) */}
        {overlays.climate &&
          climateZones.map((zone, i) => (
            <Entity
              key={`climate-${i}`}
              position={Cesium.Cartesian3.fromDegrees(zone.lon, zone.lat)}
              ellipse={{
                semiMajorAxis: climateRadius,
                semiMinorAxis: climateRadius,
                material: climateColorVal,
                height: 5000, // floating slightly above sea level
              }}
            />
          ))}

        {/* 2. AQI Air Pollution Nodes */}
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

        {/* 3. AI Infrastructure Zones (Purple net clusters) */}
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

        {/* 4. Inter-City Energy Hypergrids */}
        {overlays.energy &&
          cityConnections.map((conn, i) => {
            const c1 = getCityCoords(conn.start);
            const c2 = getCityCoords(conn.end);
            if (!c1 || !c2) return null;

            // Generate traveling energy packages
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
                {/* Static grid link */}
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
                {/* Moving nodes */}
                {packets}
              </span>
            );
          })}

        {/* 5. Orbital Satellites & Holographic Satellite Shield */}
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

            {/* Futuristic spherical shield mapping quantum satcom coverage */}
            {overlays.satellite && (
              <>
                {/* Inner shell boundary */}
                <Entity
                  position={Cesium.Cartesian3.ZERO}
                  ellipsoid={{
                    radii: new Cesium.Cartesian3(6378137 + 400000, 6378137 + 400000, 6378137 + 400000),
                    material: theme.cesiumColor.withAlpha(satelliteMeshOpacity),
                    fill: true,
                    outline: true,
                    outlineColor: theme.cesiumColor.withAlpha(satelliteMeshOpacity * 3),
                    outlineWidth: 1.0,
                  }}
                />
                {/* Outer shell boundary */}
                <Entity
                  position={Cesium.Cartesian3.ZERO}
                  ellipsoid={{
                    radii: new Cesium.Cartesian3(6378137 + 850000, 6378137 + 850000, 6378137 + 850000),
                    material: theme.cesiumColor.withAlpha(satelliteMeshOpacity * 0.4),
                    fill: true,
                    outline: true,
                    outlineColor: theme.cesiumColor.withAlpha(satelliteMeshOpacity * 1.5),
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
    </div>
  );
}
