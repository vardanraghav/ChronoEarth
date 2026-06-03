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

// ─── Category colour palette ───────────────────────────────────────────────
const categoryThemes: Record<string, { primary: string; glow: string; cesiumColorHex: string }> = {
  'Ocean Monitoring': {
    primary: '#00f0ff', glow: 'rgba(0,240,255,0.15)',
    cesiumColorHex: '#00f0ff',
  },
  'Biodiversity': {
    primary: '#10b981', glow: 'rgba(16,185,129,0.15)',
    cesiumColorHex: '#10b981',
  },
  'Clean Energy': {
    primary: '#8b5cf6', glow: 'rgba(139,92,246,0.15)',
    cesiumColorHex: '#8b5cf6',
  },
  'Satellite Network': {
    primary: '#3b82f6', glow: 'rgba(59,130,246,0.15)',
    cesiumColorHex: '#3b82f6',
  },
};

// ─── Static city connections (for Great-Circle/Geodesic Data Highways) ─────
const cityConnections = [
  { start: 'New York',  end: 'London'   , alt: 420000 },
  { start: 'London',    end: 'Berlin'   , alt: 250000 },
  { start: 'Berlin',    end: 'Moscow'   , alt: 320000 },
  { start: 'Moscow',    end: 'Shanghai' , alt: 580000 },
  { start: 'Shanghai',  end: 'Delhi'    , alt: 450000 },
  { start: 'Delhi',     end: 'Mumbai'   , alt: 250000 },
  { start: 'Mumbai',    end: 'Dubai'    , alt: 350000 },
  { start: 'Dubai',     end: 'Riyadh'   , alt: 200000 },
  { start: 'Dubai',     end: 'London'   , alt: 520000 },
  { start: 'New York',  end: 'Toronto'  , alt: 180000 },
  { start: 'Shanghai',  end: 'Moscow'   , alt: 560000 },
  { start: 'Bangalore', end: 'Hyderabad', alt: 200000 },
  { start: 'Hyderabad', end: 'Mumbai'   , alt: 200000 },
  { start: 'Bangalore', end: 'Chennai'  , alt: 180000 },
  { start: 'Kolkata',   end: 'Delhi'    , alt: 380000 },
  { start: 'Ahmedabad', end: 'Mumbai'   , alt: 180000 },
];

const getCityCoords = (name: string) => {
  const c = citiesRawData.find(x => x.name === name);
  return c ? { lat: c.lat, lon: c.lon } : null;
};

// Holographic overlay coordinates
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

// Helper to generate coordinates along a geodesic arc curving above the ellipsoid
const generateArcPositions = (c1: {lat: number, lon: number}, c2: {lat: number, lon: number}, maxAlt: number) => {
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

  const theme = categoryThemes[activeCategory] || categoryThemes['Ocean Monitoring'];

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

    // Cinematic opening angle — full sphere visible
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
    }, 4000);

    // Click handlers
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
  //  Update entities & styles based on props changes
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!isGlobeReady || !viewerRef.current) return;
    const viewer = viewerRef.current;

    // Clear previous entities
    viewer.entities.removeAll();
    viewer.imageryLayers.removeAll();

    // ── Apply rendering mode styles
    const cesiumColor = Cesium.Color.fromCssColorString(theme.cesiumColorHex);
    const isCyber = earthMode === 'cyber';

    // Base imagery: load high-detail satellite photos for realistic and digital-twin looks
    Cesium.createWorldImageryAsync({ style: Cesium.IonWorldImageryStyle.AERIAL })
      .then((provider: any) => {
        if (viewer.isDestroyed()) return;
        const lyr = viewer.imageryLayers.addImageryProvider(provider);
        if (isCyber) {
          // Cyber 2050: styling to look like a high-tech low-saturation digital twin
          lyr.brightness = 0.50;
          lyr.contrast = 1.55;
          lyr.saturation = 0.10;
          lyr.hue = 0.56; // shift towards cyan-blue
        } else {
          // Realistic: warm natural colours
          lyr.brightness = 1.05;
          lyr.contrast = 1.05;
          lyr.saturation = 1.00;
          lyr.hue = 0.00;
        }
      })
      .catch(async () => {
        if (viewer.isDestroyed()) return;
        const fb = await Cesium.ArcGisMapServerImageryProvider.fromUrl(
          'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
        );
        const lyr = viewer.imageryLayers.addImageryProvider(fb);
        if (isCyber) {
          lyr.brightness = 0.50; lyr.contrast = 1.55; lyr.saturation = 0.10; lyr.hue = 0.56;
        } else {
          lyr.brightness = 1.05; lyr.contrast = 1.05; lyr.saturation = 1.00;
        }
      });

    // Blended Earth at Night (city lights) overlay for Cyber 2050
    if (isCyber) {
      Cesium.IonImageryProvider.fromAssetId(3812)
        .then((nightProvider: any) => {
          if (viewer.isDestroyed()) return;
          const nightLyr = viewer.imageryLayers.addImageryProvider(nightProvider);
          nightLyr.alpha = 0.60;
          nightLyr.brightness = 2.80; // Bright city light connections
        })
        .catch(() => {});
    }

    if (!isCyber) {
      // Warm realistic lighting
      viewer.scene.light = new Cesium.DirectionalLight({
        direction: new Cesium.Cartesian3(-0.7, -0.5, -0.5),
        color:     Cesium.Color.fromCssColorString('#fff8f0'),
        intensity: 2.2,
      });
      viewer.scene.ambientColor = new Cesium.Color(0.03, 0.03, 0.04, 1.0);

      if (viewer.scene.globe) {
        viewer.scene.globe.showGroundAtmosphere = true;
        viewer.scene.globe.enableLighting       = true;
        viewer.scene.globe.atmosphereLightIntensity  = 10.0;
        viewer.scene.globe.atmosphereHueShift        = 0.0;
        viewer.scene.globe.atmosphereSaturationShift = 0.0;
        viewer.scene.globe.atmosphereBrightnessShift = 0.08;
      }
      if (viewer.scene.skyAtmosphere) {
        viewer.scene.skyAtmosphere.show = true;
        viewer.scene.skyAtmosphere.hueShift = 0.0;
        viewer.scene.skyAtmosphere.saturationShift = 0.0;
        viewer.scene.skyAtmosphere.brightnessShift = 0.08;
      }
    } else {
      // Intense cyan-white directional light for hologram digital-twin highlights
      viewer.scene.light = new Cesium.DirectionalLight({
        direction: new Cesium.Cartesian3(-0.7, -0.5, -0.5),
        color:     Cesium.Color.fromCssColorString('#80ffef'),
        intensity: 4.8,
      });
      // Dark glowing ambient tone
      viewer.scene.ambientColor = new Cesium.Color(0.04, 0.12, 0.25, 1.0);

      if (viewer.scene.globe) {
        viewer.scene.globe.showGroundAtmosphere = true;
        viewer.scene.globe.enableLighting       = true;
        viewer.scene.globe.atmosphereLightIntensity  = 22.0; // Dynamic limb glow
        viewer.scene.globe.atmosphereHueShift        = 0.53; // Cyan/blue shift
        viewer.scene.globe.atmosphereSaturationShift = 0.75;
        viewer.scene.globe.atmosphereBrightnessShift = 0.32;
      }
      if (viewer.scene.skyAtmosphere) {
        viewer.scene.skyAtmosphere.show = true;
        viewer.scene.skyAtmosphere.hueShift          = 0.53;
        viewer.scene.skyAtmosphere.saturationShift   = 0.75;
        viewer.scene.skyAtmosphere.brightnessShift   = 0.32;
      }
    }

    // ── Variables for overlays
    const ov = isCyber
      ? { climate: true, pollution: true, energy: true, satellite: true, ai: true }
      : overlays;
    const yearFactor  = (activeYear - 2025) / 25;
    const cyberBoost = isCyber ? 1.8 : 1.0;

    // ── 1. City Points
    citiesRawData.forEach((city) => {
      const isSel  = activeCity?.name === city.name;
      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(city.lon, city.lat),
        point: {
          pixelSize:    isCyber ? (isSel ? 14 : 8)   : (isSel ? 6 : 4),
          color:        isCyber
            ? cesiumColor.withAlpha(isSel ? 1.0 : 0.75)
            : Cesium.Color.WHITE.withAlpha(isSel ? 0.90 : 0.50),
          outlineColor: isCyber
            ? Cesium.Color.WHITE.withAlpha(isSel ? 0.9 : 0.25)
            : Cesium.Color.WHITE.withAlpha(0.0),
          outlineWidth: isCyber ? (isSel ? 2.5 : 1.0) : 0,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        properties: { cityData: city }
      });
    });

    // ── 2. Selected city pulse
    if (activeCity) {
      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(activeCity.lon, activeCity.lat),
        ellipse: {
          semiMajorAxis: new Cesium.CallbackProperty(() => {
            const factor = (timeRef.current * 1.2) % 1.0;
            return factor * 320000;
          }, false),
          semiMinorAxis: new Cesium.CallbackProperty(() => {
            const factor = (timeRef.current * 1.2) % 1.0;
            return factor * 320000;
          }, false),
          material: new Cesium.ColorMaterialProperty(
            new Cesium.CallbackProperty(() => {
              const factor = (timeRef.current * 1.2) % 1.0;
              const alpha = 0.65 * (1 - factor) * (isCyber ? 1.0 : 0.35);
              return isCyber ? cesiumColor.withAlpha(alpha) : Cesium.Color.WHITE.withAlpha(alpha);
            }, false)
          ),
          height: 0,
        }
      });
    }

    // ── 3. Climate Heatmaps (Floating Holograms in Cyber mode)
    if (ov.climate) {
      const climateRadius   = 1200000 + yearFactor * 1600000;
      const climateAlpha    = (0.08 + yearFactor * 0.17) * cyberBoost;
      const climateColor    = Cesium.Color.fromCssColorString(
        yearFactor < 0.3 ? '#3b82f6' : yearFactor < 0.6 ? '#f97316' : '#ef4444'
      ).withAlpha(Math.min(climateAlpha, 0.45));

      climateZones.forEach((z) => {
        const heightVal = isCyber ? 150000 : 5000;
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(z.lon, z.lat),
          ellipse: {
            semiMajorAxis: climateRadius,
            semiMinorAxis: climateRadius,
            material: climateColor.withAlpha(isCyber ? Math.min(climateAlpha * 0.4, 0.15) : climateColor.alpha),
            height: heightVal,
            outline: isCyber,
            outlineColor: climateColor.withAlpha(0.9),
            outlineWidth: 1.5,
          }
        });

        if (isCyber) {
          // Inner core floating target marker
          viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(z.lon, z.lat),
            ellipse: {
              semiMajorAxis: climateRadius * 0.12,
              semiMinorAxis: climateRadius * 0.12,
              height: heightVal,
              material: climateColor.withAlpha(0.85),
            }
          });
          // Telemetry connecting line to the ground
          viewer.entities.add({
            polyline: {
              positions: [
                Cesium.Cartesian3.fromDegrees(z.lon, z.lat, 0),
                Cesium.Cartesian3.fromDegrees(z.lon, z.lat, heightVal)
              ],
              width: 1,
              material: climateColor.withAlpha(0.5)
            }
          });
        }
      });
    }

    // ── 4. Pollution Zones (Floating Holograms in Cyber mode)
    if (ov.pollution) {
      const pollRadius  = 350000 - yearFactor * 230000;
      const pollAlpha   = (0.24 - yearFactor * 0.14) * cyberBoost;
      const pollColor   = Cesium.Color.fromCssColorString(
        yearFactor > 0.75 ? '#10b981' : yearFactor > 0.4 ? '#84cc16' : '#eab308'
      ).withAlpha(Math.min(pollAlpha, 0.55));

      pollutionZones.forEach((z) => {
        const heightVal = isCyber ? 200000 : 10000;
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(z.lon, z.lat),
          ellipse: {
            semiMajorAxis: pollRadius,
            semiMinorAxis: pollRadius,
            material: pollColor.withAlpha(isCyber ? Math.min(pollAlpha * 0.4, 0.15) : pollColor.alpha),
            height: heightVal,
            outline: isCyber,
            outlineColor: pollColor.withAlpha(0.9),
            outlineWidth: 1.5,
          }
        });

        if (isCyber) {
          viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(z.lon, z.lat),
            ellipse: {
              semiMajorAxis: pollRadius * 0.15,
              semiMinorAxis: pollRadius * 0.15,
              height: heightVal,
              material: pollColor.withAlpha(0.85),
            }
          });
          viewer.entities.add({
            polyline: {
              positions: [
                Cesium.Cartesian3.fromDegrees(z.lon, z.lat, 0),
                Cesium.Cartesian3.fromDegrees(z.lon, z.lat, heightVal)
              ],
              width: 1,
              material: pollColor.withAlpha(0.5)
            }
          });
        }
      });
    }

    // ── 5. AI Infrastructure Zones (Floating Holograms in Cyber mode)
    if (ov.ai) {
      const aiRadius = 100000 + yearFactor * 900000;
      const aiAlpha  = (0.06 + yearFactor * 0.14) * cyberBoost;
      const aiColor  = Cesium.Color.fromCssColorString('#8b5cf6').withAlpha(Math.min(aiAlpha, 0.40));

      aiZones.forEach((z) => {
        const heightVal = isCyber ? 250000 : 8000;
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(z.lon, z.lat),
          ellipse: {
            semiMajorAxis: aiRadius,
            semiMinorAxis: aiRadius,
            material: aiColor.withAlpha(isCyber ? Math.min(aiAlpha * 0.4, 0.15) : aiColor.alpha),
            height: heightVal,
            outline: isCyber,
            outlineColor: aiColor.withAlpha(0.9),
            outlineWidth: 1.5,
          }
        });

        if (isCyber) {
          viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(z.lon, z.lat),
            ellipse: {
              semiMajorAxis: aiRadius * 0.12,
              semiMinorAxis: aiRadius * 0.12,
              height: heightVal,
              material: aiColor.withAlpha(0.85),
            }
          });
          viewer.entities.add({
            polyline: {
              positions: [
                Cesium.Cartesian3.fromDegrees(z.lon, z.lat, 0),
                Cesium.Cartesian3.fromDegrees(z.lon, z.lat, heightVal)
              ],
              width: 1,
              material: aiColor.withAlpha(0.5)
            }
          });
        }
      });
    }

    // ── 6. Geodesic Data Highways (Energy, Quantum & Shipping Lanes)
    if (ov.energy) {
      const pktCount  = activeYear <= 2025 ? 1 : activeYear <= 2035 ? 2 : 3;
      const pktSpeed  = 0.05 + yearFactor * 0.10;
      const lineAlpha = isCyber ? 0.8 : 0.10;

      cityConnections.forEach((conn) => {
        const c1 = getCityCoords(conn.start);
        const c2 = getCityCoords(conn.end);
        if (!c1 || !c2) return;

        // 3D Geodesic line curving above the surface
        viewer.entities.add({
          polyline: {
            positions: generateArcPositions(c1, c2, conn.alt),
            width: isCyber ? 1.8 : 1,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: isCyber ? 0.15 : 0.05,
              color: Cesium.Color.fromCssColorString(theme.cesiumColorHex).withAlpha(lineAlpha),
            })
          }
        });

        // Glowing animated transmission packets along the arc
        for (let k = 0; k < pktCount; k++) {
          viewer.entities.add({
            position: new Cesium.CallbackProperty(() => {
              const t = ((timeRef.current * pktSpeed) + (k / pktCount)) % 1.0;
              const sRad = Cesium.Cartographic.fromDegrees(c1.lon, c1.lat);
              const eRad = Cesium.Cartographic.fromDegrees(c2.lon, c2.lat);
              const geodesic = new Cesium.EllipsoidGeodesic(sRad, eRad);
              const cart = geodesic.interpolateUsingFraction(t);
              const height = Math.sin(t * Math.PI) * conn.alt;
              return Cesium.Cartesian3.fromRadians(cart.longitude, cart.latitude, height);
            }, false),
            point: {
              pixelSize: isCyber ? 6.5 : 4.5,
              color: isCyber ? Cesium.Color.WHITE : cesiumColor,
              outlineColor: cesiumColor,
              outlineWidth: isCyber ? 1.5 : 0.8,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            }
          });
        }
      });
    }

    // ── 7. Massive Satellite Constellations with Decaying Trails
    if (activeCategory === 'Satellite Network' || ov.satellite) {
      const orbitsList = [
        { tilt:  0.0,  height: 1600000, speed: 0.055, color: Cesium.Color.fromCssColorString('#00f0ff') }, // Equatorial
        { tilt:  1.35, height: 2300000, speed: 0.065, color: Cesium.Color.fromCssColorString('#8b5cf6') }, // Polar-inclined
        { tilt: -0.80, height: 1900000, speed: 0.045, color: Cesium.Color.fromCssColorString('#14b8a6') }, // Negative inclined
        { tilt:  0.80, height: 2600000, speed: 0.050, color: Cesium.Color.fromCssColorString('#e0a96d') }, // Positive inclined
      ];
      const activePlanes = isCyber ? orbitsList : orbitsList.slice(0, 2);
      const satsPerPlane = isCyber ? 8 : 2;
      const orbitAlpha = isCyber ? 0.35 : 0.15;

      activePlanes.forEach((o) => {
        // Draw the circular orbit path
        const r = 6378137 + o.height;
        const positions = Array.from({ length: 73 }, (_, i) => {
          const a = (i / 72) * Math.PI * 2;
          return new Cesium.Cartesian3(r * Math.cos(a), r * Math.sin(a) * Math.cos(o.tilt), r * Math.sin(a) * Math.sin(o.tilt));
        });

        viewer.entities.add({
          polyline: {
            positions: positions,
            width: 1,
            material: o.color.withAlpha(orbitAlpha),
          }
        });

        // Render satellites and trails
        for (let s = 0; s < satsPerPlane; s++) {
          const phase = (s / satsPerPlane) * Math.PI * 2;

          // Decaying glowing trail behind the satellite
          if (isCyber) {
            viewer.entities.add({
              polyline: {
                positions: new Cesium.CallbackProperty(() => {
                  const trailPoints = [];
                  const trailLength = 12; // 12 points of trail length
                  const step = 0.04;
                  for (let j = 0; j < trailLength; j++) {
                    const a = ((timeRef.current - j * step) * o.speed + phase) % (Math.PI * 2);
                    trailPoints.push(new Cesium.Cartesian3(r * Math.cos(a), r * Math.sin(a) * Math.cos(o.tilt), r * Math.sin(a) * Math.sin(o.tilt)));
                  }
                  return trailPoints;
                }, false),
                width: 1.5,
                material: new Cesium.PolylineGlowMaterialProperty({
                  glowPower: 0.10,
                  color: o.color.withAlpha(0.60),
                })
              }
            });
          }

          // Lead satellite point
          viewer.entities.add({
            position: new Cesium.CallbackProperty(() => {
              const a = (timeRef.current * o.speed + phase) % (Math.PI * 2);
              return new Cesium.Cartesian3(r * Math.cos(a), r * Math.sin(a) * Math.cos(o.tilt), r * Math.sin(a) * Math.sin(o.tilt));
            }, false),
            point: {
              pixelSize: isCyber ? 9 : 6,
              color: Cesium.Color.WHITE,
              outlineColor: o.color,
              outlineWidth: 1.5,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            }
          });
        }
      });

      // Orbital atmospheric rings
      if (ov.satellite) {
        viewer.entities.add({
          position: Cesium.Cartesian3.ZERO,
          ellipsoid: {
            radii: new Cesium.Cartesian3(6378137 + 400000, 6378137 + 400000, 6378137 + 400000),
            material: cesiumColor.withAlpha(0.03 + yearFactor * 0.04),
            fill: true,
            outline: true,
            outlineColor: cesiumColor.withAlpha((0.03 + yearFactor * 0.04) * 3),
            outlineWidth: 1,
          }
        });
        viewer.entities.add({
          position: Cesium.Cartesian3.ZERO,
          ellipsoid: {
            radii: new Cesium.Cartesian3(6378137 + 850000, 6378137 + 850000, 6378137 + 850000),
            material: cesiumColor.withAlpha((0.03 + yearFactor * 0.04) * 0.4),
            fill: true,
            outline: true,
            outlineColor: cesiumColor.withAlpha((0.03 + yearFactor * 0.04) * 1.5),
            outlineWidth: 0.5,
          }
        });
      }
    }

  }, [isGlobeReady, activeYear, activeCategory, activeCity, overlays, earthMode, theme]);

  // ═══════════════════════════════════════════════════════════════════════════
  //  Camera Flying (to activeCity or activeCategory target)
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

  // ─── Slow Orbit Auto-Rotation
  useEffect(() => {
    if (isInteracting || activeCity || !isGlobeReady) return;
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;
    if (viewer.isDestroyed() || !viewer.scene) return;
    let last  = Date.now();
    const speed = 0.012;
    const spin  = () => {
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
      {/* ── Cesium Canvas Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* ── Hover card */}
      {hoveredCity && hoverPos && (
        <div className="absolute pointer-events-none select-none z-50"
          style={{ left: `${hoverPos.x + 14}px`, top: `${hoverPos.y - 42}px`, animation: 'fade-in-up 0.2s ease-out forwards' }}>
          {earthMode === 'cyber' ? (
            <div style={{ padding: '7px 12px', background: 'rgba(0,8,20,0.90)', backdropFilter: 'blur(16px)',
              border: `1px solid ${theme.primary}50`, borderRadius: '2px', boxShadow: `0 0 20px ${theme.primary}20` }}>
              <div style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.25em', color: theme.primary,
                textTransform: 'uppercase', textShadow: `0 0 10px ${theme.primary}80`, marginBottom: '3px' }}>
                {hoveredCity.name}
              </div>
              <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', letterSpacing: '0.12em' }}>
                {hoveredCity.lat.toFixed(3)}° N · {hoveredCity.lon.toFixed(3)}° E
              </div>
              <div style={{ marginTop: '2px', fontSize: '7px', color: `${theme.primary}90`, fontFamily: 'monospace', letterSpacing: '0.15em' }}>
                {hoveredCity.country.toUpperCase()} · FOCUS NODE
              </div>
            </div>
          ) : (
            <div style={{ padding: '6px 10px', background: 'rgba(3,5,10,0.75)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '2px' }}>
              <div style={{ fontSize: '9px', fontWeight: 300, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.80)', textTransform: 'uppercase' }}>
                {hoveredCity.name}
              </div>
              <div style={{ marginTop: '2px', fontSize: '7px', fontWeight: 200, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.30)' }}>
                {hoveredCity.lat.toFixed(2)}° N &nbsp; {hoveredCity.lon.toFixed(2)}° E
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Loader overlay */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center z-50 transition-opacity duration-1000 ease-in-out ${isGlobeReady ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        style={{ background: '#030508' }}>
        {earthMode === 'cyber' ? (
          <>
            <div style={{ width: 72, height: 72, borderRadius: '50%', border: '1px solid rgba(0,240,255,0.20)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'breathe 2s ease-in-out infinite' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', border: '1px dashed rgba(0,240,255,0.12)', animation: 'spin 8s linear infinite' }} />
            </div>
            <p style={{ marginTop: 18, fontSize: 8, fontWeight: 300, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(0,240,255,0.40)', fontFamily: 'monospace' }}>
              Syncing Telemetry
            </p>
          </>
        ) : (
          <>
            <div style={{ width: 56, height: 56, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'breathe 2.5s ease-in-out infinite' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', border: '1px dashed rgba(255,255,255,0.07)', animation: 'spin 10s linear infinite' }} />
            </div>
            <p style={{ marginTop: 16, fontSize: 8, fontWeight: 300, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)' }}>
              Initializing Globe
            </p>
          </>
        )}
      </div>
    </div>
  );
}
