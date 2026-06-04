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
  emerald: '#00FF88',
  cyan: '#00E5FF',
  iceBlue: '#00C8FF',
  white: '#FFFFFF',
  spaceBg: '#001018',
  black: '#000000'
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
  { start: 'Paris',     end: 'Dubai'    , alt: 350000, color: themeColors.iceBlue },
  { start: 'Dubai',     end: 'Mumbai'   , alt: 250000, color: themeColors.emerald },
  { start: 'Mumbai',    end: 'Delhi'    , alt: 200000, color: themeColors.cyan },
  { start: 'Delhi',     end: 'Singapore', alt: 350000, color: themeColors.white },
  { start: 'Mumbai',    end: 'Singapore', alt: 300000, color: themeColors.emerald },
  { start: 'Singapore', end: 'Tokyo'    , alt: 320000, color: themeColors.cyan },
  { start: 'Tokyo',     end: 'Seoul'    , alt: 150000, color: themeColors.white },
  { start: 'Sydney',    end: 'Singapore', alt: 450000, color: themeColors.iceBlue },
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

    // Clean up any old primitives added dynamically
    const primitivesToRemove = [];
    for (let i = 0; i < viewer.scene.primitives.length; i++) {
      const prim = viewer.scene.primitives.get(i);
      if (prim instanceof Cesium.PointPrimitiveCollection || 
          prim instanceof Cesium.PolylineCollection) {
        primitivesToRemove.push(prim);
      }
    }
    primitivesToRemove.forEach((prim) => {
      viewer.scene.primitives.remove(prim);
    });

    let removeRenderListener: (() => void) | undefined;

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
      // ─── CYBER 2050 MODE (Planetary AI Operating System) ───────────────────
      // Strict Visual Theme: Green (#00FF88), Cyan (#00E5FF), SpaceBg (#001018), White/Black
      
      // 1. Base Globe & Atmospheric Lighting
      viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#000305');
      viewer.scene.globe.showGroundAtmosphere = true;
      viewer.scene.globe.enableLighting = true;
      viewer.scene.globe.atmosphereLightIntensity = 30.0; // Strong cinematic atmosphere scattering
      viewer.scene.globe.atmosphereHueShift = 0.45;        // Cyan/Emerald scattering bloom
      viewer.scene.globe.atmosphereSaturationShift = 0.95;
      viewer.scene.globe.atmosphereBrightnessShift = 0.35;

      // Pure cyan/emerald light source representing planetary illumination
      viewer.scene.light = new Cesium.DirectionalLight({
        direction: new Cesium.Cartesian3(-0.6, -0.2, -0.77),
        color: Cesium.Color.fromCssColorString('#00E5FF'),
        intensity: 5.0
      });
      viewer.scene.ambientColor = new Cesium.Color(0.0, 0.04, 0.02, 1.0);

      // Add Grid wireframe base topology
      viewer.imageryLayers.addImageryProvider(
        new Cesium.GridImageryProvider({
          color: Cesium.Color.fromCssColorString('#00FF88').withAlpha(0.12), // Emerald Grid lines
          backgroundColor: Cesium.Color.fromCssColorString('#000305'),
          cells: 64,
          glowColor: Cesium.Color.fromCssColorString('#00E5FF').withAlpha(0.06), // Cyan glow
          glowWidth: 6
        })
      );

      // Cybernetic clouds with subtle cyan tint
      viewer.entities.add({
        position: Cesium.Cartesian3.ZERO,
        orientation: new Cesium.CallbackProperty(() => {
          return Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_Z, timeRef.current * 0.003);
        }, false),
        ellipsoid: {
          radii: new Cesium.Cartesian3(6378137 + 16000, 6378137 + 16000, 6378137 + 16000),
          material: new Cesium.ImageMaterialProperty({
            image: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png',
            transparent: true,
            color: Cesium.Color.fromCssColorString('#00E5FF').withAlpha(0.20)
          })
        }
      });

      // Collections to hold optimized WebGL elements
      const pointCollection = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
      const cityLightsCollection = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
      const beamCollection = viewer.scene.primitives.add(new Cesium.PolylineCollection());

      const beamsData: { lat: number; lon: number; maxHeight: number; speed: number; phase: number; lineGlow: any; lineCore: any }[] = [];

      // 2. Load World GeoJSON and generate high-density point matrix + continental outlines
      Cesium.GeoJsonDataSource.load('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson', {
        stroke: Cesium.Color.fromCssColorString('#00FF88'),
        fill: Cesium.Color.TRANSPARENT,
        strokeWidth: 2
      }).then((dataSource: any) => {
        if (viewer.isDestroyed() || !isCyber) return;
        viewer.dataSources.add(dataSource);
        
        dataSource.entities.values.forEach((entity: any) => {
          if (entity.polygon) {
            entity.polygon.outline = true;
            entity.polygon.outlineColor = Cesium.Color.fromCssColorString('#00FF88');
            entity.polygon.outlineWidth = 2.0;
            // Translucent cyber-ocean contrast fill
            entity.polygon.material = Cesium.Color.fromCssColorString('#001018').withAlpha(0.50);
          }
        });

        // 3. Generate Land & Ocean High-Density Dot Matrix using Canvas Sampler
        const canvas = document.createElement('canvas');
        canvas.width = 360;
        canvas.height = 180;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#ffffff';

          dataSource.entities.values.forEach((entity: any) => {
            if (entity.polygon) {
              const hierarchy = entity.polygon.hierarchy.getValue();
              const drawPolygon = (hierarchyObj: any) => {
                const positions = hierarchyObj.positions;
                if (positions && positions.length > 0) {
                  ctx.beginPath();
                  positions.forEach((pos: any, idx: number) => {
                    const cartographic = Cesium.Cartographic.fromCartesian(pos);
                    const lon = Cesium.Math.toDegrees(cartographic.longitude);
                    const lat = Cesium.Math.toDegrees(cartographic.latitude);
                    const x = ((lon + 180) / 360) * canvas.width;
                    const y = ((90 - lat) / 180) * canvas.height;
                    if (idx === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                  });
                  ctx.closePath();
                  ctx.fill();
                }
                if (hierarchyObj.holes && hierarchyObj.holes.length > 0) {
                  hierarchyObj.holes.forEach((hole: any) => drawPolygon(hole));
                }
              };
              drawPolygon(hierarchy);
            }
          });

          // Read image mask
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixelData = imgData.data;

          const landCoords: { lat: number; lon: number }[] = [];

          // Grid generation
          for (let y = 0; y < canvas.height; y += 2) {
            for (let x = 0; x < canvas.width; x += 2) {
              const pixelIdx = (y * canvas.width + x) * 4;
              const isLand = pixelData[pixelIdx] > 200;

              const lon = (x / canvas.width) * 360 - 180;
              const lat = 90 - (y / canvas.height) * 180;
              const pos = Cesium.Cartesian3.fromDegrees(lon, lat, 300);
              const phase = Math.random() * Math.PI * 2;

              if (isLand) {
                landCoords.push({ lat, lon });
                const p = pointCollection.add({
                  position: pos,
                  color: Cesium.Color.fromCssColorString('#00FF88').withAlpha(0.2),
                  pixelSize: 1.5
                });
                (p as any)._customPhase = phase;
                (p as any)._customIsLand = true;
              } else {
                // Ocean low-density grid mapping
                if (Math.random() < 0.18) {
                  const p = pointCollection.add({
                    position: pos,
                    color: Cesium.Color.fromCssColorString('#00C8FF').withAlpha(0.1),
                    pixelSize: 1.0
                  });
                  (p as any)._customPhase = phase;
                  (p as any)._customIsLand = false;
                }
              }
            }
          }

          // 4. Node & Uplink System: generate 100+ vertical energy beams on land coordinates
          const numBeams = Math.min(130, landCoords.length);
          const shuffledLand = [...landCoords].sort(() => 0.5 - Math.random());
          for (let i = 0; i < numBeams; i++) {
            const coord = shuffledLand[i];
            const maxHeight = 300000 + Math.random() * 900000; // reach LEO & MEO orbits
            const speed = 2.0 + Math.random() * 3.5;
            const phase = Math.random() * Math.PI * 2;

            // White core + Cyan bloom volumetric simulation
            const lineGlow = beamCollection.add({
              positions: [
                Cesium.Cartesian3.fromDegrees(coord.lon, coord.lat, 0),
                Cesium.Cartesian3.fromDegrees(coord.lon, coord.lat, maxHeight)
              ],
              width: 3.0,
              material: Cesium.Material.fromType('PolylineGlow', {
                color: Cesium.Color.fromCssColorString('#00E5FF').withAlpha(0.50),
                glowPower: 0.30
              })
            });

            const lineCore = beamCollection.add({
              positions: [
                Cesium.Cartesian3.fromDegrees(coord.lon, coord.lat, 0),
                Cesium.Cartesian3.fromDegrees(coord.lon, coord.lat, maxHeight)
              ],
              width: 1.2,
              material: Cesium.Material.fromType('Color', {
                color: Cesium.Color.WHITE
              })
            });

            beamsData.push({
              lat: coord.lat,
              lon: coord.lon,
              maxHeight,
              speed,
              phase,
              lineGlow,
              lineCore
            });
          }
        }
      }).catch(() => {});

      // 5. Generate City Lights around cities (pulsing clusters on night side)
      citiesRawData.forEach((city) => {
        for (let c = 0; c < 8; c++) {
          const offsetLat = (Math.random() - 0.5) * 1.8;
          const offsetLon = (Math.random() - 0.5) * 1.8;
          const lat = city.lat + offsetLat;
          const lon = city.lon + offsetLon;
          const pos = Cesium.Cartesian3.fromDegrees(lon, lat, 150);
          const phase = Math.random() * Math.PI * 2;

          const p = cityLightsCollection.add({
            position: pos,
            color: Cesium.Color.WHITE.withAlpha(0.0),
            pixelSize: 0.0
          });
          (p as any)._customPhase = phase;
          (p as any)._cityCenter = city;
        }
      });

      // 6. Geodesic Connections (Communication pipelines)
      globalHighways.forEach((highway) => {
        const c1 = getHubCoords(highway.start);
        const c2 = getHubCoords(highway.end);
        if (!c1 || !c2) return;

        const highwayColor = Cesium.Color.fromCssColorString('#00FF88'); // Unified Emerald Theme

        viewer.entities.add({
          polyline: {
            positions: generateGeodesicArcPoints(c1, c2, highway.alt),
            width: 2.2,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: new Cesium.CallbackProperty(() => {
                return 0.18 + 0.12 * Math.sin(timeRef.current * 3.0);
              }, false),
              color: highwayColor.withAlpha(0.80)
            })
          }
        });

        // Packets
        for (let k = 0; k < 3; k++) {
          viewer.entities.add({
            position: new Cesium.CallbackProperty(() => {
              const t = ((timeRef.current * 0.14) + (k / 3)) % 1.0;
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
              outlineColor: Cesium.Color.fromCssColorString('#00E5FF'),
              outlineWidth: 1.5,
              disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
          });
        }
      });

      // 7. Interactive Hub Concentric Scan Rings
      Object.keys(customHubCoords).forEach((hubName) => {
        const coords = customHubCoords[hubName];
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(coords.lon, coords.lat, 10),
          ellipse: {
            semiMajorAxis: new Cesium.CallbackProperty(() => {
              return 250000 * ((timeRef.current * 0.5 + Math.random() * 0.05) % 1.0);
            }, false),
            semiMinorAxis: new Cesium.CallbackProperty(() => {
              return 250000 * ((timeRef.current * 0.5 + Math.random() * 0.05) % 1.0);
            }, false),
            material: new Cesium.ColorMaterialProperty(
              new Cesium.CallbackProperty(() => {
                const age = (timeRef.current * 0.5) % 1.0;
                return Cesium.Color.fromCssColorString('#00FF88').withAlpha(0.25 * (1.0 - age));
              }, false)
            ),
            outline: true,
            outlineColor: Cesium.Color.fromCssColorString('#00FF88').withAlpha(0.35),
            outlineWidth: 1.2
          }
        });
      });

      // 8. Distinct Orbital Shells (LEO, MEO, GEO Constellation Highways)
      const shells = [
        { name: 'LEO Swarm', radius: 6378137 + 550000, tiltX: 0.5, tiltY: 0.2, color: '#00E5FF', sats: 12, speed: 0.06 },
        { name: 'MEO Network', radius: 6378137 + 3500000, tiltX: -0.6, tiltY: 0.4, color: '#00C8FF', sats: 8, speed: 0.035 },
        { name: 'GEO Highway', radius: 6378137 + 12000000, tiltX: 0.0, tiltY: 0.0, color: '#00FF88', sats: 3, speed: 0.015 }
      ];

      shells.forEach((shell, shIdx) => {
        const ringPoints = Array.from({ length: 91 }, (_, idx) => {
          const a = (idx / 90) * Math.PI * 2;
          const pos = new Cesium.Cartesian3(shell.radius * Math.cos(a), shell.radius * Math.sin(a), 0);
          
          const cosX = Math.cos(shell.tiltX); const sinX = Math.sin(shell.tiltX);
          const cosY = Math.cos(shell.tiltY); const sinY = Math.sin(shell.tiltY);
          
          const y1 = pos.y * cosX - pos.z * sinX;
          const z1 = pos.y * sinX + pos.z * cosX;
          
          const x2 = pos.x * cosY + z1 * sinY;
          const z2 = -pos.x * sinY + z1 * cosY;
          
          return new Cesium.Cartesian3(x2, y1, z2);
        });

        // Track line
        viewer.entities.add({
          polyline: {
            positions: ringPoints,
            width: 1.0,
            material: Cesium.Color.fromCssColorString(shell.color).withAlpha(0.18)
          }
        });

        // Swarms
        for (let s = 0; s < shell.sats; s++) {
          const phase = (s / shell.sats) * Math.PI * 2;
          viewer.entities.add({
            position: new Cesium.CallbackProperty(() => {
              const a = (timeRef.current * shell.speed + phase) % (Math.PI * 2);
              const pos = new Cesium.Cartesian3(shell.radius * Math.cos(a), shell.radius * Math.sin(a), 0);
              
              const cosX = Math.cos(shell.tiltX); const sinX = Math.sin(shell.tiltX);
              const cosY = Math.cos(shell.tiltY); const sinY = Math.sin(shell.tiltY);
              
              const y1 = pos.y * cosX - pos.z * sinX;
              const z1 = pos.y * sinX + pos.z * cosX;
              
              const x2 = pos.x * cosY + z1 * sinY;
              const z2 = -pos.x * sinY + z1 * cosY;
              return new Cesium.Cartesian3(x2, y1, z2);
            }, false),
            point: {
              pixelSize: 6,
              color: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.fromCssColorString(shell.color),
              outlineWidth: 1.5,
              disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
          });

          // GEO Solar Energy Collectors overlays
          if (shIdx === 2) {
            viewer.entities.add({
              position: new Cesium.CallbackProperty(() => {
                const a = (timeRef.current * shell.speed + phase) % (Math.PI * 2);
                const pos = new Cesium.Cartesian3(shell.radius * Math.cos(a), shell.radius * Math.sin(a), 0);
                return new Cesium.Cartesian3(pos.x, pos.y, 0); // geo synced on equatorial
              }, false),
              ellipse: {
                semiMajorAxis: new Cesium.CallbackProperty(() => {
                  return 240000 + 40000 * Math.sin(timeRef.current * 2.0);
                }, false),
                semiMinorAxis: new Cesium.CallbackProperty(() => {
                  return 240000 + 40000 * Math.sin(timeRef.current * 2.0);
                }, false),
                material: Cesium.Color.fromCssColorString(shell.color).withAlpha(0.08),
                outline: true,
                outlineColor: Cesium.Color.fromCssColorString(shell.color).withAlpha(0.40),
                outlineWidth: 1.0
              }
            });
          }
        }
      });

      // City Hub Node Markers (Interactive green/cyan target nodes)
      citiesRawData.forEach((city) => {
        const isSel = activeCity?.name === city.name;
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(city.lon, city.lat, 500),
          point: {
            pixelSize: isSel ? 14 : 9,
            color: isSel ? Cesium.Color.WHITE : Cesium.Color.fromCssColorString('#00FF88'),
            outlineColor: Cesium.Color.fromCssColorString('#00E5FF'),
            outlineWidth: 2.0,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          properties: { cityData: city }
        });
      });

      // 9. Frame Update loop for real-time Day/Night terminator transitions
      const updateDayNight = () => {
        if (viewer.isDestroyed() || !isCyber) return;

        // Retrieve light source vector
        const lightDir = viewer.scene.light.direction;
        const time = timeRef.current;

        // Update dot matrix points
        const numPoints = pointCollection.length;
        for (let i = 0; i < numPoints; i++) {
          const p = pointCollection.get(i);
          if (!p) continue;
          
          const pos = p.position;
          const normal = Cesium.Cartesian3.normalize(pos, new Cesium.Cartesian3());
          const dot = Cesium.Cartesian3.dot(normal, lightDir);
          
          const phase = (p as any)._customPhase ?? 0.0;
          const isLand = (p as any)._customIsLand ?? false;
          
          const twinkle = 0.82 + 0.18 * Math.sin(time * 3.5 + phase);

          if (isLand) {
            // dot < -0.1 is Day side. dot > 0.1 is Night side
            if (dot < -0.1) {
              // Day Land: subtle desaturated cyan
              p.color = Cesium.Color.fromCssColorString('#00E5FF').withAlpha(0.12 * twinkle);
              p.pixelSize = 1.2;
            } else if (dot > 0.1) {
              // Night Land: glowing emerald green intelligence node
              p.color = Cesium.Color.fromCssColorString('#00FF88').withAlpha(0.75 * twinkle);
              p.pixelSize = 2.4;
            } else {
              // Terminator: smooth color interpolation
              const factor = (dot + 0.1) / 0.2;
              const color = Cesium.Color.lerp(
                Cesium.Color.fromCssColorString('#00E5FF').withAlpha(0.12),
                Cesium.Color.fromCssColorString('#00FF88').withAlpha(0.75),
                factor,
                new Cesium.Color()
              );
              p.color = color.withAlpha(color.alpha * twinkle);
              p.pixelSize = 1.2 + 1.2 * factor;
            }
          } else {
            // Ocean points
            if (dot < -0.1) {
              p.color = Cesium.Color.fromCssColorString('#001018').withAlpha(0.08);
              p.pixelSize = 0.8;
            } else if (dot > 0.1) {
              p.color = Cesium.Color.fromCssColorString('#00C8FF').withAlpha(0.28 * twinkle);
              p.pixelSize = 1.2;
            } else {
              p.color = Cesium.Color.fromCssColorString('#00C8FF').withAlpha(0.15);
              p.pixelSize = 1.0;
            }
          }
        }

        // Update city lights: show only on night side
        const numCityLights = cityLightsCollection.length;
        for (let i = 0; i < numCityLights; i++) {
          const p = cityLightsCollection.get(i);
          if (!p) continue;
          
          const pos = p.position;
          const normal = Cesium.Cartesian3.normalize(pos, new Cesium.Cartesian3());
          const dot = Cesium.Cartesian3.dot(normal, lightDir);
          const phase = (p as any)._customPhase ?? 0.0;

          if (dot > 0.05) {
            // Bright white/cyan pulsing city lights on night side
            const pulse = 0.72 + 0.28 * Math.sin(time * 5.0 + phase);
            p.color = Cesium.Color.fromCssColorString('#FFFFFF').withAlpha(0.85 * pulse);
            p.pixelSize = 1.8 + 1.8 * pulse;
          } else {
            // Faded/hidden on day side
            p.color = Cesium.Color.TRANSPARENT;
            p.pixelSize = 0;
          }
        }

        // Update vertical energy beams: show/flicker on night side, fade on day side
        const numBeams = beamsData.length;
        for (let i = 0; i < numBeams; i++) {
          const b = beamsData[i];
          const pos = Cesium.Cartesian3.fromDegrees(b.lon, b.lat, 0);
          const normal = Cesium.Cartesian3.normalize(pos, new Cesium.Cartesian3());
          const dot = Cesium.Cartesian3.dot(normal, lightDir);

          const flicker = Math.sin(time * b.speed * 4.0 + b.phase);
          const heightFactor = 0.82 + 0.18 * flicker;
          const currentHeight = b.maxHeight * heightFactor;

          const startPos = Cesium.Cartesian3.fromDegrees(b.lon, b.lat, 0);
          const endPos = Cesium.Cartesian3.fromDegrees(b.lon, b.lat, currentHeight);

          b.lineGlow.positions = [startPos, endPos];
          b.lineCore.positions = [startPos, endPos];

          if (dot > -0.2) {
            // Night side / transition visible beams
            const intensity = Math.min(1.0, (dot + 0.2) / 0.35); // Fade near terminator
            b.lineGlow.width = (4.0 + 3.0 * flicker) * intensity;
            b.lineCore.width = (1.2 + 0.4 * flicker) * intensity;

            b.lineGlow.material.uniforms.color = Cesium.Color.fromCssColorString('#00E5FF').withAlpha(0.65 * intensity);
            b.lineCore.material.uniforms.color = Cesium.Color.WHITE.withAlpha(intensity);
          } else {
            // Day side beams are inactive
            b.lineGlow.width = 0;
            b.lineCore.width = 0;
            b.lineGlow.material.uniforms.color = Cesium.Color.TRANSPARENT;
            b.lineCore.material.uniforms.color = Cesium.Color.TRANSPARENT;
          }
        }
      };

      removeRenderListener = viewer.scene.postRender.addEventListener(updateDayNight);
    }

    return () => {
      if (removeRenderListener) {
        removeRenderListener();
      }
    };

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
              <div style={{ marginTop: '2px', fontSize: '7px', color: `${themeColors.emerald}c0`, fontFamily: 'monospace', letterSpacing: '0.15em' }}>
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
