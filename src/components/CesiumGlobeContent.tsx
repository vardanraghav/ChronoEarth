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

// ─── Cyberpunk Color Palette ────────────────────────────────────────────────
const themeColors = {
  cyan: '#00f0ff',
  teal: '#14b8a6',
  violet: '#8b5cf6',
  white: '#ffffff'
};

// Hub coordinates for the 10 specified network hubs
const customHubCoords: Record<string, { lat: number, lon: number }> = {
  'New York': { lat: 40.7128, lon: -74.0060 },
  'London': { lat: 51.5074, lon: -0.1278 },
  'Paris': { lat: 48.8566, lon: 2.3522 },
  'Dubai': { lat: 25.2048, lon: 55.2708 },
  'Mumbai': { lat: 19.0760, lon: 72.8777 },
  'Delhi': { lat: 28.6139, lon: 77.2090 },
  'Singapore': { lat: 1.3521, lon: 103.8198 },
  'Tokyo': { lat: 35.6762, lon: 139.6503 },
  'Seoul': { lat: 37.5665, lon: 126.9780 },
  'Sydney': { lat: -33.8688, lon: 151.2093 }
};

const getHubCoords = (name: string) => {
  if (customHubCoords[name]) return customHubCoords[name];
  const c = citiesRawData.find(x => x.name === name);
  return c ? { lat: c.lat, lon: c.lon } : null;
};

// Geodesic connections between the exact hubs
const globalHighways = [
  { start: 'New York',  end: 'London'   , alt: 420000, color: themeColors.cyan },
  { start: 'London',    end: 'Paris'    , alt: 120000, color: themeColors.white },
  { start: 'Paris',     end: 'Dubai'    , alt: 350000, color: themeColors.violet },
  { start: 'Dubai',     end: 'Mumbai'   , alt: 250000, color: themeColors.teal },
  { start: 'Mumbai',    end: 'Delhi'    , alt: 200000, color: themeColors.cyan },
  { start: 'Delhi',     end: 'Singapore', alt: 350000, color: themeColors.white },
  { start: 'Mumbai',    end: 'Singapore', alt: 300000, color: themeColors.teal },
  { start: 'Singapore', end: 'Tokyo'    , alt: 320000, color: themeColors.cyan },
  { start: 'Tokyo',     end: 'Seoul'    , alt: 150000, color: themeColors.white },
  { start: 'Sydney',    end: 'Singapore', alt: 450000, color: themeColors.violet },
];

// Helper to generate positions along a curved geodesic path
const generateGeodesicArcPoints = (c1: {lat: number, lon: number}, c2: {lat: number, lon: number}, maxAlt: number) => {
  const points = [];
  const count = 30;
  const sRad = Cesium.Cartographic.fromDegrees(c1.lon, c1.lat);
  const eRad = Cesium.Cartographic.fromDegrees(c2.lon, c2.lat);
  const geodesic = new Cesium.EllipsoidGeodesic(sRad, eRad);
  
  for (let i = 0; i <= count; i++) {
    const fraction = i / count;
    const cart = geodesic.interpolateUsingFraction(fraction);
    const height = Math.sin(fraction * Math.PI) * maxAlt;
    points.push(Cesium.Cartesian3.fromRadians(cart.longitude, cart.latitude, height));
  }
  return points;
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

export default function CesiumGlobeContent({
  activeYear, activeCategory, activeCity, setActiveCity, overlays, earthMode,
}: CesiumGlobeContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef  = useRef<any>(null);
  const timeRef = useRef(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [hoveredCity,   setHoveredCity]   = useState<CityData | null>(null);
  const [hoverPos,      setHoverPos]      = useState<{ x: number; y: number } | null>(null);
  const [isGlobeReady,  setIsGlobeReady]  = useState(false);

  const isCyber = earthMode === 'cyber';
  const themeColorHex = isCyber ? themeColors.cyan : '#ffffff';

  // Animation time counter
  useEffect(() => {
    let id: number;
    const start = Date.now();
    const tick = () => { timeRef.current = (Date.now() - start) / 1000; id = requestAnimationFrame(tick); };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  //  Initialize Cesium Viewer
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current || !(window as any).Cesium) return;

    const viewer = new Cesium.Viewer(containerRef.current, {
      timeline: false,
      animation: false,
      baseLayerPicker: false,
      navigationHelpButton: false,
      homeButton: false,
      sceneModePicker: false,
      geocoder: false,
      infoBox: false,
      selectionIndicator: false,
      fullscreenButton: false,
      skyBox: false,
      contextOptions: { webgl: { alpha: true } },
      creditContainer: document.createElement('div'), // Hide credits
    });

    viewer.scene.backgroundColor = Cesium.Color.TRANSPARENT;

    // Cinematic opening angle
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(20.0, 22.0, 18000000),
      orientation: { heading: Cesium.Math.toRadians(0), pitch: Cesium.Math.toRadians(-18), roll: 0.0 },
    });

    viewerRef.current = viewer;

    // Tile load watcher
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
    }, 4500);

    // Event Handler for clicks and hovers
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((click: any) => {
      const picked = viewer.scene.pick(click.position);
      if (Cesium.defined(picked) && picked.id && picked.id.properties?.cityData) {
        const city = picked.id.properties.cityData.getValue();
        setActiveCity(city);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction((movement: any) => {
      const picked = viewer.scene.pick(movement.endPosition);
      if (Cesium.defined(picked) && picked.id && picked.id.properties?.cityData) {
        const city = picked.id.properties.cityData.getValue();
        setHoveredCity(city);
      } else {
        setHoveredCity(null);
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    return () => {
      clearTimeout(safety);
      if (removeTileListener) try { removeTileListener(); } catch(e){}
      handler.destroy();
      viewer.destroy();
      viewerRef.current = null;
    };
  }, [setActiveCity]);

  // ═══════════════════════════════════════════════════════════════════════════
  //  Update Globe layers, assets, and 3D overlays
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current) return;
    const viewer = viewerRef.current;

    // Reset components
    viewer.entities.removeAll();
    viewer.imageryLayers.removeAll();
    viewer.dataSources.removeAll();

    if (!isCyber) {
      // ─── REALISTIC MODE ──────────────────────────────────────────────────
      Cesium.createWorldImageryAsync({ style: Cesium.IonWorldImageryStyle.AERIAL })
        .then((provider: any) => {
          if (viewer.isDestroyed() || isCyber) return;
          const lyr = viewer.imageryLayers.addImageryProvider(provider);
          lyr.brightness = 1.05;
          lyr.contrast = 1.05;
          lyr.saturation = 1.00;
        })
        .catch(async () => {
          if (viewer.isDestroyed() || isCyber) return;
          const fb = await Cesium.ArcGisMapServerImageryProvider.fromUrl(
            'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
          );
          const lyr = viewer.imageryLayers.addImageryProvider(fb);
          lyr.brightness = 1.05; lyr.contrast = 1.05; lyr.saturation = 1.00;
        });

      // Ambient and Sunlight
      viewer.scene.light = new Cesium.DirectionalLight({
        direction: new Cesium.Cartesian3(-0.7, -0.5, -0.5),
        color:     Cesium.Color.fromCssColorString('#ffffff'),
        intensity: 3.5,
      });
      viewer.scene.ambientColor = new Cesium.Color(0.02, 0.03, 0.05, 1.0);

      if (viewer.scene.globe) {
        viewer.scene.globe.showGroundAtmosphere = true;
        viewer.scene.globe.enableLighting       = true;
        viewer.scene.globe.atmosphereLightIntensity  = 10.0;
        viewer.scene.globe.atmosphereHueShift        = 0.0;
        viewer.scene.globe.atmosphereSaturationShift = 0.0;
        viewer.scene.globe.atmosphereBrightnessShift = 0.08;
      }

      // Dynamic Clouds
      viewer.entities.add({
        position: Cesium.Cartesian3.ZERO,
        orientation: new Cesium.CallbackProperty(() => {
          return Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_Z, timeRef.current * 0.005);
        }, false),
        ellipsoid: {
          radii: new Cesium.Cartesian3(6378137 + 15000, 6378137 + 15000, 6378137 + 15000),
          material: new Cesium.ImageMaterialProperty({
            image: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png',
            transparent: true,
            color: Cesium.Color.WHITE.withAlpha(0.40)
          })
        }
      });

      // City Hub Markers (clean white points)
      citiesRawData.forEach((city) => {
        const isSel = activeCity?.name === city.name;
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(city.lon, city.lat),
          point: {
            pixelSize: isSel ? 6 : 4,
            color: Cesium.Color.WHITE.withAlpha(isSel ? 0.90 : 0.50),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          properties: { cityData: city }
        });
      });

    } else {
      // ─── CYBER 2050 MODE (Earth's AI Operating System) ───────────────────
      // 1. Dark Black Globe Base with glowing Emerald Green/Cyan wireframe topology
      viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#000305');
      viewer.scene.globe.showGroundAtmosphere = true;
      viewer.scene.globe.enableLighting = true;
      viewer.scene.globe.atmosphereLightIntensity = 25.0; // High intensity atmospheric bloom
      viewer.scene.globe.atmosphereHueShift = 0.40;        // Beautiful Cyan and Emerald green shift
      viewer.scene.globe.atmosphereSaturationShift = 0.90;
      viewer.scene.globe.atmosphereBrightnessShift = 0.30;

      viewer.scene.light = new Cesium.DirectionalLight({
        direction: new Cesium.Cartesian3(-0.5, -0.3, -0.7),
        color: Cesium.Color.fromCssColorString('#00ffaa'), // Emerald/Cyan sunlight casting
        intensity: 4.0
      });
      viewer.scene.ambientColor = new Cesium.Color(0.0, 0.05, 0.03, 1.0); // trans-emerald space ambient

      // Add Grid topology layer
      viewer.imageryLayers.addImageryProvider(
        new Cesium.GridImageryProvider({
          color: Cesium.Color.fromCssColorString('#00ff88').withAlpha(0.20), // Neon Emerald Green
          backgroundColor: Cesium.Color.fromCssColorString('#000305'),
          cells: 64,
          glowColor: Cesium.Color.fromCssColorString('#00f0ff').withAlpha(0.10), // Cyan secondary glow
          glowWidth: 8
        })
      );

      // 2. Neon Emerald-Green Continental outlines from Natural Earth GeoJSON
      Cesium.GeoJsonDataSource.load('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson', {
        stroke: Cesium.Color.fromCssColorString('#00ff66'),
        fill: Cesium.Color.fromCssColorString('#000804').withAlpha(0.60),
        strokeWidth: 2
      }).then((dataSource: any) => {
        if (viewer.isDestroyed() || !isCyber) return;
        viewer.dataSources.add(dataSource);
        dataSource.entities.values.forEach((entity: any) => {
          if (entity.polygon) {
            entity.polygon.outline = true;
            entity.polygon.outlineColor = Cesium.Color.fromCssColorString('#00ff66');
            entity.polygon.outlineWidth = 2.0;
            entity.polygon.material = Cesium.Color.fromCssColorString('#000e06').withAlpha(0.60);
          }
        });
      }).catch(() => {});

      // 3. Dense matrix of 300+ glowing points globally (Planetary Intelligence Mesh)
      const numNodes = 300;
      const nodesData: { lat: number; lon: number; phase: number; isBeam: boolean }[] = [];
      
      // Let's seed coordinates globally
      for (let i = 0; i < numNodes; i++) {
        const u = Math.random();
        const v = Math.random();
        const lat = Math.acos(2 * v - 1) * (180 / Math.PI) - 90;
        const lon = u * 360 - 180;
        const phase = Math.random() * Math.PI * 2;
        // Make around 35 nodes shoot dramatic vertical beams
        const isBeam = i % 8 === 0; 
        nodesData.push({ lat, lon, phase, isBeam });
      }

      nodesData.forEach((node) => {
        // Pulse billboard / point
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(node.lon, node.lat, 100),
          point: {
            pixelSize: new Cesium.CallbackProperty(() => {
              return 2.5 + 1.5 * Math.sin(timeRef.current * 4.0 + node.phase);
            }, false),
            color: new Cesium.CallbackProperty(() => {
              const alpha = 0.4 + 0.5 * Math.sin(timeRef.current * 4.0 + node.phase);
              return Cesium.Color.fromCssColorString('#00ff66').withAlpha(alpha);
            }, false),
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        });

        // 4. Dramatic Vertical Light Beams (White core, Cyan glow, atmospheric bloom, variable intensity)
        if (node.isBeam) {
          const beamMaxHeight = 800000 + Math.random() * 1200000;
          const beamPhase = Math.random() * Math.PI * 2;
          const flickerSpeed = 10.0 + Math.random() * 15.0;

          // Glowing Outer Beam (Cyan)
          viewer.entities.add({
            polyline: {
              positions: new Cesium.CallbackProperty(() => {
                const height = beamMaxHeight * (0.9 + 0.1 * Math.sin(timeRef.current * 2.0 + beamPhase));
                return [
                  Cesium.Cartesian3.fromDegrees(node.lon, node.lat, 0),
                  Cesium.Cartesian3.fromDegrees(node.lon, node.lat, height)
                ];
              }, false),
              width: new Cesium.CallbackProperty(() => {
                // Flickering width
                const noise = Math.sin(timeRef.current * flickerSpeed);
                return 4.0 + 3.0 * noise;
              }, false),
              material: new Cesium.PolylineGlowMaterialProperty({
                glowPower: 0.35,
                color: Cesium.Color.fromCssColorString('#00f0ff')
              })
            }
          });

          // Core Beam (White)
          viewer.entities.add({
            polyline: {
              positions: new Cesium.CallbackProperty(() => {
                const height = beamMaxHeight * (0.9 + 0.1 * Math.sin(timeRef.current * 2.0 + beamPhase));
                return [
                  Cesium.Cartesian3.fromDegrees(node.lon, node.lat, 0),
                  Cesium.Cartesian3.fromDegrees(node.lon, node.lat, height)
                ];
              }, false),
              width: new Cesium.CallbackProperty(() => {
                const noise = Math.sin(timeRef.current * flickerSpeed);
                return 1.2 + 0.4 * noise;
              }, false),
              material: Cesium.Color.WHITE
            }
          });
        }
      });

      // 5. Geodesic Connections (AI communication pathways / neural network)
      globalHighways.forEach((highway) => {
        const c1 = getHubCoords(highway.start);
        const c2 = getHubCoords(highway.end);
        if (!c1 || !c2) return;

        const highwayColor = Cesium.Color.fromCssColorString('#00ff66'); // Make connection green/cyan

        // Glowing geodesic highway
        viewer.entities.add({
          polyline: {
            positions: generateGeodesicArcPoints(c1, c2, highway.alt),
            width: 2.5,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: new Cesium.CallbackProperty(() => {
                return 0.20 + 0.15 * Math.sin(timeRef.current * 3.0);
              }, false),
              color: highwayColor.withAlpha(0.85)
            })
          }
        });

        // Packets
        for (let k = 0; k < 3; k++) {
          viewer.entities.add({
            position: new Cesium.CallbackProperty(() => {
              const t = ((timeRef.current * 0.15) + (k / 3)) % 1.0;
              const sRad = Cesium.Cartographic.fromDegrees(c1.lon, c1.lat);
              const eRad = Cesium.Cartographic.fromDegrees(c2.lon, c2.lat);
              const geodesic = new Cesium.EllipsoidGeodesic(sRad, eRad);
              const cart = geodesic.interpolateUsingFraction(t);
              const height = Math.sin(t * Math.PI) * highway.alt;
              return Cesium.Cartesian3.fromRadians(cart.longitude, cart.latitude, height);
            }, false),
            point: {
              pixelSize: 6.0,
              color: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.fromCssColorString('#00f0ff'),
              outlineWidth: 1.5,
              disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
          });
        }
      });

      // 6. 10 Hub Ground Data Layers (Concentric Scan Zones, grid rings)
      Object.keys(customHubCoords).forEach((hubName) => {
        const coords = customHubCoords[hubName];
        // Dynamic scan circle
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(coords.lon, coords.lat, 10),
          ellipse: {
            semiMajorAxis: new Cesium.CallbackProperty(() => {
              return 200000 * ((timeRef.current * 0.6 + Math.random() * 0.1) % 1.0);
            }, false),
            semiMinorAxis: new Cesium.CallbackProperty(() => {
              return 200000 * ((timeRef.current * 0.6 + Math.random() * 0.1) % 1.0);
            }, false),
            material: new Cesium.ColorMaterialProperty(
              new Cesium.CallbackProperty(() => {
                const age = (timeRef.current * 0.6) % 1.0;
                return Cesium.Color.fromCssColorString('#00ff66').withAlpha(0.25 * (1.0 - age));
              }, false)
            ),
            outline: true,
            outlineColor: Cesium.Color.fromCssColorString('#00ff66').withAlpha(0.4),
            outlineWidth: 1.5
          }
        });
      });

      // 7. Advanced Orbital Systems & Satellite Swarms
      // Horizontal and Inclined orbital wireframe rings
      const ringsConfig = [
        { radius: 6378137 + 1200000, tiltX: 0.0, tiltY: 0.0, color: '#00ff66' },
        { radius: 6378137 + 2500000, tiltX: 0.4, tiltY: 0.3, color: '#00f0ff' },
        { radius: 6378137 + 4000000, tiltX: -0.5, tiltY: 0.2, color: '#00ffaa' }
      ];

      ringsConfig.forEach((rc, rIdx) => {
        const ringPositions = Array.from({ length: 91 }, (_, idx) => {
          const a = (idx / 90) * Math.PI * 2;
          const pos = new Cesium.Cartesian3(rc.radius * Math.cos(a), rc.radius * Math.sin(a), 0);
          
          // Apply tilt rotations
          const cosX = Math.cos(rc.tiltX); const sinX = Math.sin(rc.tiltX);
          const cosY = Math.cos(rc.tiltY); const sinY = Math.sin(rc.tiltY);
          
          const y1 = pos.y * cosX - pos.z * sinX;
          const z1 = pos.y * sinX + pos.z * cosX;
          
          const x2 = pos.x * cosY + z1 * sinY;
          const z2 = -pos.x * sinY + z1 * cosY;
          
          return new Cesium.Cartesian3(x2, y1, z2);
        });

        // Orbital line path
        viewer.entities.add({
          polyline: {
            positions: ringPositions,
            width: 1.5,
            material: Cesium.Color.fromCssColorString(rc.color).withAlpha(0.20)
          }
        });

        // Satellite swarm on the rings
        const satCount = 6;
        for (let s = 0; s < satCount; s++) {
          const phase = (s / satCount) * Math.PI * 2;
          viewer.entities.add({
            position: new Cesium.CallbackProperty(() => {
              const a = (timeRef.current * (0.05 - rIdx * 0.01) + phase) % (Math.PI * 2);
              const pos = new Cesium.Cartesian3(rc.radius * Math.cos(a), rc.radius * Math.sin(a), 0);
              const cosX = Math.cos(rc.tiltX); const sinX = Math.sin(rc.tiltX);
              const cosY = Math.cos(rc.tiltY); const sinY = Math.sin(rc.tiltY);
              const y1 = pos.y * cosX - pos.z * sinX;
              const z1 = pos.y * sinX + pos.z * cosX;
              const x2 = pos.x * cosY + z1 * sinY;
              const z2 = -pos.x * sinY + z1 * cosY;
              return new Cesium.Cartesian3(x2, y1, z2);
            }, false),
            point: {
              pixelSize: 8,
              color: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.fromCssColorString(rc.color),
              outlineWidth: 2,
              disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
          });
        }
      });

      // City Hub Markers in Cyber (clean pulsing nodes)
      citiesRawData.forEach((city) => {
        const isSel = activeCity?.name === city.name;
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(city.lon, city.lat),
          point: {
            pixelSize: isSel ? 14 : 9,
            color: isSel ? Cesium.Color.WHITE : Cesium.Color.fromCssColorString('#00ff66'),
            outlineColor: Cesium.Color.fromCssColorString('#00f0ff'),
            outlineWidth: 2.0,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          properties: { cityData: city }
        });
      });
    }

  }, [isGlobeReady, activeYear, activeCategory, activeCity, overlays, earthMode]);

  // ═══════════════════════════════════════════════════════════════════════════
  //  Camera Control & Orbit transitions
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current || !activeCity) return;
    const viewer = viewerRef.current;
    if (viewer.isDestroyed() || !viewer.camera) return;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(activeCity.lon, activeCity.lat - 1.2, 1400000),
      duration: 3.5,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
    });
  }, [activeCity, isGlobeReady]);

  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current || activeCity) return;
    const viewer = viewerRef.current;
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

  // ─── 2D Hover Tracker
  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current) return;
    const viewer = viewerRef.current;
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

  // ─── Auto Rotation
  useEffect(() => {
    if (isInteracting || activeCity || !isGlobeReady) return;
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;
    if (viewer.isDestroyed() || !viewer.scene) return;
    let last  = Date.now();
    const speed = 0.012;
    const spin = () => {
      if (!viewerRef.current) return;
      const v = viewerRef.current;
      if (v.isDestroyed() || !v.scene?.camera) return;
      const now = Date.now(); const delta = (now - last) / 1000; last = now;
      v.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, speed * delta);
    };
    let remove: (() => void) | undefined;
    const t = setTimeout(() => {
      const v = viewerRef.current;
      if (!v || v.isDestroyed() || !v.scene) return;
      remove = v.scene.postRender.addEventListener(spin);
    }, 1500);
    return () => { clearTimeout(t); if (remove) try { remove(); } catch(e){} };
  }, [isInteracting, activeCity, isGlobeReady]);

  return (
    <div
      className="absolute inset-0 w-screen h-screen bg-transparent z-0 overflow-hidden"
      onMouseDown={() => setIsInteracting(true)}   onMouseUp={() => setIsInteracting(false)}
      onTouchStart={() => setIsInteracting(true)}  onTouchEnd={() => setIsInteracting(false)}
    >
      {/* ── Cesium Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* ── Hover Overlay Card */}
      {hoveredCity && hoverPos && (
        <div className="absolute pointer-events-none select-none z-50"
          style={{ left: `${hoverPos.x + 14}px`, top: `${hoverPos.y - 42}px`, animation: 'fade-in-up 0.2s ease-out forwards' }}>
          {isCyber ? (
            <div style={{ padding: '7px 12px', background: 'rgba(0,8,20,0.92)', backdropFilter: 'blur(20px)',
              border: `1px solid ${themeColors.cyan}50`, borderRadius: '2px', boxShadow: `0 0 20px ${themeColors.cyan}25` }}>
              <div style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.25em', color: themeColors.cyan,
                textTransform: 'uppercase', textShadow: `0 0 10px ${themeColors.cyan}80`, marginBottom: '3px' }}>
                {hoveredCity.name}
              </div>
              <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', letterSpacing: '0.12em' }}>
                {hoveredCity.lat.toFixed(3)}° N · {hoveredCity.lon.toFixed(3)}° E
              </div>
              <div style={{ marginTop: '2px', fontSize: '7px', color: `${themeColors.teal}c0`, fontFamily: 'monospace', letterSpacing: '0.15em' }}>
                {hoveredCity.country.toUpperCase()} · ORBITAL CONNECTOR
              </div>
            </div>
          ) : (
            <div style={{ padding: '6px 10px', background: 'rgba(3,5,10,0.80)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '2px' }}>
              <div style={{ fontSize: '9px', fontWeight: 300, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase' }}>
                {hoveredCity.name}
              </div>
              <div style={{ marginTop: '2px', fontSize: '7px', fontWeight: 200, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)' }}>
                {hoveredCity.lat.toFixed(2)}° N &nbsp; {hoveredCity.lon.toFixed(2)}° E
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Load Telemetry Loader Overlay */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center z-50 transition-opacity duration-1000 ease-in-out ${isGlobeReady ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        style={{ background: '#030508' }}>
        {isCyber ? (
          <>
            <div style={{ width: 72, height: 72, borderRadius: '50%', border: `1px solid ${themeColors.cyan}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'breathe 2s ease-in-out infinite' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', border: `1px dashed ${themeColors.cyan}18`, animation: 'spin 8s linear infinite' }} />
            </div>
            <p style={{ marginTop: 18, fontSize: 8, fontWeight: 300, letterSpacing: '0.4em', textTransform: 'uppercase', color: `${themeColors.cyan}70`, fontFamily: 'monospace' }}>
              Accessing Planet OS
            </p>
          </>
        ) : (
          <>
            <div style={{ width: 56, height: 56, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'breathe 2.5s ease-in-out infinite' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', border: '1px dashed rgba(255,255,255,0.07)', animation: 'spin 10s linear infinite' }} />
            </div>
            <p style={{ marginTop: 16, fontSize: 8, fontWeight: 300, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)' }}>
              Initializing Planet Earth
            </p>
          </>
        )}
      </div>
    </div>
  );
}
