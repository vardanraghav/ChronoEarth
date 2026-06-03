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

    // ── 1. Realistic Satellite Imagery Base Map (recognizable planet)
    Cesium.createWorldImageryAsync({ style: Cesium.IonWorldImageryStyle.AERIAL })
      .then((provider: any) => {
        if (viewer.isDestroyed()) return;
        const lyr = viewer.imageryLayers.addImageryProvider(provider);
        if (isCyber) {
          // Cyber 2050: Realistic colors but slightly darkened so night lights and cyber lines pop
          lyr.brightness = 0.55;
          lyr.contrast = 1.30;
          lyr.saturation = 0.90; // Natural green continents & blue oceans remain visible!
        } else {
          lyr.brightness = 1.05;
          lyr.contrast = 1.05;
          lyr.saturation = 1.00;
        }
      })
      .catch(async () => {
        if (viewer.isDestroyed()) return;
        const fb = await Cesium.ArcGisMapServerImageryProvider.fromUrl(
          'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
        );
        const lyr = viewer.imageryLayers.addImageryProvider(fb);
        if (isCyber) {
          lyr.brightness = 0.55; lyr.contrast = 1.30; lyr.saturation = 0.90;
        }
      });

    // ── 2. Dynamic Rotating 3D Cloud Ellipsoid (adds depth/parallax)
    viewer.entities.add({
      position: Cesium.Cartesian3.ZERO,
      orientation: new Cesium.CallbackProperty(() => {
        // Slow rotation around the Z axis
        const angle = timeRef.current * 0.005;
        return Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_Z, angle);
      }, false),
      ellipsoid: {
        radii: new Cesium.Cartesian3(6378137 + 15000, 6378137 + 15000, 6378137 + 15000), // 15km altitude shell
        material: new Cesium.ImageMaterialProperty({
          image: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png',
          transparent: true,
          color: Cesium.Color.WHITE.withAlpha(isCyber ? 0.28 : 0.40)
        })
      }
    });

    // ── 3. Blended Night Lights (styled to cyberpunk cyan-blue)
    if (isCyber) {
      Cesium.IonImageryProvider.fromAssetId(3812)
        .then((nightProvider: any) => {
          if (viewer.isDestroyed()) return;
          const nightLyr = viewer.imageryLayers.addImageryProvider(nightProvider);
          nightLyr.alpha = 0.70;
          nightLyr.brightness = 3.20; // Prominent neon city lights
          nightLyr.contrast = 1.80;
          nightLyr.hue = 0.55; // Hue-shift yellow/orange lights to cyan-blue!
          nightLyr.saturation = 1.20;
        })
        .catch(() => {});
    }

    // ── 4. Ambient and Pure White Sunlight (physically plausible daylight rendering)
    viewer.scene.light = new Cesium.DirectionalLight({
      direction: new Cesium.Cartesian3(-0.7, -0.5, -0.5),
      color:     Cesium.Color.fromCssColorString('#ffffff'), // Pure white realistic sunlight!
      intensity: 3.5,
    });
    viewer.scene.ambientColor = new Cesium.Color(0.02, 0.03, 0.05, 1.0);

    if (!isCyber) {
      if (viewer.scene.globe) {
        viewer.scene.globe.showGroundAtmosphere = true;
        viewer.scene.globe.enableLighting       = true;
        viewer.scene.globe.atmosphereLightIntensity  = 10.0;
        viewer.scene.globe.atmosphereHueShift        = 0.0;
        viewer.scene.globe.atmosphereSaturationShift = 0.0;
        viewer.scene.globe.atmosphereBrightnessShift = 0.08;
      }
    } else {
      if (viewer.scene.globe) {
        viewer.scene.globe.showGroundAtmosphere = true;
        viewer.scene.globe.enableLighting       = true;
        viewer.scene.globe.atmosphereLightIntensity  = 18.0;
        viewer.scene.globe.atmosphereHueShift        = 0.54; // Electric blue atmosphere rim
        viewer.scene.globe.atmosphereSaturationShift = 0.80;
        viewer.scene.globe.atmosphereBrightnessShift = 0.25;
      }
    }

    // ── 5. City Hub Markers (clean white/cyan points)
    const activeColor = Cesium.Color.fromCssColorString(themeColorHex);
    citiesRawData.forEach((city) => {
      const isSel  = activeCity?.name === city.name;
      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(city.lon, city.lat),
        point: {
          pixelSize:    isCyber ? (isSel ? 12 : 7) : (isSel ? 6 : 4),
          color:        isCyber
            ? (isSel ? Cesium.Color.WHITE : activeColor.withAlpha(0.75))
            : Cesium.Color.WHITE.withAlpha(isSel ? 0.90 : 0.50),
          outlineColor: isCyber ? activeColor : Cesium.Color.WHITE.withAlpha(0.0),
          outlineWidth: isCyber ? 1.5 : 0,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        properties: { cityData: city }
      });
    });

    // ── 6. Geodesic Networks between the 10 exact hubs
    const ov = isCyber ? { climate: true, pollution: true, energy: true, satellite: true, ai: true } : overlays;
    const yearFactor  = (activeYear - 2025) / 25;

    if (ov.energy) {
      const pktCount = isCyber ? 2 : 1;
      const pktSpeed = 0.06 + yearFactor * 0.08;

      globalHighways.forEach((highway) => {
        const c1 = getHubCoords(highway.start);
        const c2 = getHubCoords(highway.end);
        if (!c1 || !c2) return;

        const connectionColor = Cesium.Color.fromCssColorString(highway.color);

        // Curving data arc above surface
        viewer.entities.add({
          polyline: {
            positions: generateGeodesicArcPoints(c1, c2, highway.alt),
            width: isCyber ? 2.0 : 1.0,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.15,
              color: connectionColor.withAlpha(isCyber ? 0.85 : 0.25)
            })
          }
        });

        // Pulsing packets along the geodesic curve
        for (let k = 0; k < pktCount; k++) {
          viewer.entities.add({
            position: new Cesium.CallbackProperty(() => {
              const t = ((timeRef.current * pktSpeed) + (k / pktCount)) % 1.0;
              const sRad = Cesium.Cartographic.fromDegrees(c1.lon, c1.lat);
              const eRad = Cesium.Cartographic.fromDegrees(c2.lon, c2.lat);
              const geodesic = new Cesium.EllipsoidGeodesic(sRad, eRad);
              const cart = geodesic.interpolateUsingFraction(t);
              const height = Math.sin(t * Math.PI) * highway.alt;
              return Cesium.Cartesian3.fromRadians(cart.longitude, cart.latitude, height);
            }, false),
            point: {
              pixelSize: isCyber ? 6.0 : 4.0,
              color: Cesium.Color.WHITE,
              outlineColor: connectionColor,
              outlineWidth: isCyber ? 1.5 : 0.8,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            }
          });
        }
      });
    }

    // ── 7. LEO, MEO, GEO Satellites (clean, meaningful layers)
    if (activeCategory === 'Satellite Network' || ov.satellite) {
      const satelliteConfig = [
        // LEO: Fast orbit at 600km, polar tilt (tilt = 1.3), leaves glowing trails
        { level: 'LEO', height: 600000, speed: 0.08, color: Cesium.Color.fromCssColorString(themeColors.cyan), count: 3, tilt: 1.3 },
        // MEO: Medium speed at 3500km, inclined tilt (tilt = -0.7)
        { level: 'MEO', height: 3500000, speed: 0.04, color: Cesium.Color.fromCssColorString(themeColors.violet), count: 2, tilt: -0.7 },
      ];

      satelliteConfig.forEach((cfg) => {
        const r = 6378137 + cfg.height;
        const positions = Array.from({ length: 73 }, (_, i) => {
          const a = (i / 72) * Math.PI * 2;
          return new Cesium.Cartesian3(r * Math.cos(a), r * Math.sin(a) * Math.cos(cfg.tilt), r * Math.sin(a) * Math.sin(cfg.tilt));
        });

        // Orbit path line
        viewer.entities.add({
          polyline: {
            positions: positions,
            width: 1,
            material: cfg.color.withAlpha(isCyber ? 0.25 : 0.10)
          }
        });

        // Satellites
        for (let s = 0; s < cfg.count; s++) {
          const phase = (s / cfg.count) * Math.PI * 2;

          // Decaying light trail in LEO/MEO
          if (isCyber) {
            viewer.entities.add({
              polyline: {
                positions: new Cesium.CallbackProperty(() => {
                  const trailPoints = [];
                  const trailLength = 10;
                  const step = 0.035;
                  for (let j = 0; j < trailLength; j++) {
                    const a = ((timeRef.current - j * step) * cfg.speed + phase) % (Math.PI * 2);
                    trailPoints.push(new Cesium.Cartesian3(r * Math.cos(a), r * Math.sin(a) * Math.cos(cfg.tilt), r * Math.sin(a) * Math.sin(cfg.tilt)));
                  }
                  return trailPoints;
                }, false),
                width: 1.2,
                material: new Cesium.PolylineGlowMaterialProperty({
                  glowPower: 0.08,
                  color: cfg.color.withAlpha(0.50),
                })
              }
            });
          }

          // Satellite dot
          viewer.entities.add({
            position: new Cesium.CallbackProperty(() => {
              const a = (timeRef.current * cfg.speed + phase) % (Math.PI * 2);
              return new Cesium.Cartesian3(r * Math.cos(a), r * Math.sin(a) * Math.cos(cfg.tilt), r * Math.sin(a) * Math.sin(cfg.tilt));
            }, false),
            point: {
              pixelSize: isCyber ? 8 : 5,
              color: Cesium.Color.WHITE,
              outlineColor: cfg.color,
              outlineWidth: 1.2,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            }
          });
        }
      });

      // GEO: 3 Stationary Satellites (12000km, equatorial orbit, static longitudes)
      const geoSatellites = [
        { lon: -45.0, color: Cesium.Color.fromCssColorString(themeColors.teal) }, // Geo-1 (Atlantic)
        { lon: 55.0,  color: Cesium.Color.fromCssColorString(themeColors.cyan) }, // Geo-2 (Indian)
        { lon: 140.0, color: Cesium.Color.fromCssColorString(themeColors.violet) } // Geo-3 (Pacific)
      ];
      const geoRadius = 6378137 + 12000000;

      // Equatorial GEO Orbit Ring
      const geoPositions = Array.from({ length: 73 }, (_, i) => {
        const a = (i / 72) * Math.PI * 2;
        return new Cesium.Cartesian3(geoRadius * Math.cos(a), geoRadius * Math.sin(a), 0);
      });
      viewer.entities.add({
        polyline: {
          positions: geoPositions,
          width: 1,
          material: Cesium.Color.WHITE.withAlpha(isCyber ? 0.15 : 0.05)
        }
      });

      geoSatellites.forEach((sat) => {
        // Satellite core point
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(sat.lon, 0, 12000000),
          point: {
            pixelSize: isCyber ? 9 : 5,
            color: Cesium.Color.WHITE,
            outlineColor: sat.color,
            outlineWidth: 1.5,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          }
        });

        // GEO Solar Power Satellite: rotating holographic energy collector ring overlay
        if (isCyber) {
          viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(sat.lon, 0, 12000000),
            ellipse: {
              semiMajorAxis: 250000, // 250km radius collector
              semiMinorAxis: 250000,
              material: sat.color.withAlpha(0.12),
              outline: true,
              outlineColor: sat.color.withAlpha(0.85),
              outlineWidth: 1.5
            }
          });
        }
      });
    }

    // ── 8. Climate Recovery Holographic Indicators (Floating at 200km - 300km)
    if (ov.climate) {
      // 3 Layers representing metrics in Cyan, Teal, Violet
      const climateLayers = [
        { name: 'Climate Recovery', alt: 200000, radius: 1500000, color: Cesium.Color.fromCssColorString(themeColors.cyan), lon: (z: { lon: number, lat: number }) => z.lon, lat: (z: { lon: number, lat: number }) => z.lat },
        { name: 'Ocean Restoration', alt: 250000, radius: 1300000, color: Cesium.Color.fromCssColorString(themeColors.teal), lon: (z: { lon: number, lat: number }) => z.lon + 5.0, lat: (z: { lon: number, lat: number }) => z.lat - 5.0 },
        { name: 'Renewable Grid Coverage', alt: 300000, radius: 1100000, color: Cesium.Color.fromCssColorString(themeColors.violet), lon: (z: { lon: number, lat: number }) => z.lon - 5.0, lat: (z: { lon: number, lat: number }) => z.lat + 5.0 }
      ];

      climateZones.forEach((z) => {
        climateLayers.forEach((layer) => {
          const cLon = layer.lon(z);
          const cLat = layer.lat(z);

          // Floating wireframe ring
          viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(cLon, cLat),
            ellipse: {
              semiMajorAxis: layer.radius,
              semiMinorAxis: layer.radius,
              material: layer.color.withAlpha(0.04),
              height: layer.alt,
              outline: true,
              outlineColor: layer.color.withAlpha(isCyber ? 0.80 : 0.20),
              outlineWidth: 1.5
            }
          });

          if (isCyber) {
            // Floating center core target
            viewer.entities.add({
              position: Cesium.Cartesian3.fromDegrees(cLon, cLat),
              ellipse: {
                semiMajorAxis: layer.radius * 0.08,
                semiMinorAxis: layer.radius * 0.08,
                height: layer.alt,
                material: layer.color.withAlpha(0.80)
              }
            });

            // Center telemetry pole extending to ground
            viewer.entities.add({
              polyline: {
                positions: [
                  Cesium.Cartesian3.fromDegrees(cLon, cLat, 0),
                  Cesium.Cartesian3.fromDegrees(cLon, cLat, layer.alt)
                ],
                width: 1.0,
                material: layer.color.withAlpha(0.40)
              }
            });
          }
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
