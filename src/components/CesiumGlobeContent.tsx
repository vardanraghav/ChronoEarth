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

// ─── Static data ────────────────────────────────────────────────────────────
const cityConnections = [
  { start: 'Mumbai',    end: 'Delhi'     }, { start: 'Bangalore', end: 'Hyderabad'  },
  { start: 'Hyderabad', end: 'Mumbai'    }, { start: 'Bangalore', end: 'Chennai'    },
  { start: 'Kolkata',   end: 'Delhi'     }, { start: 'Ahmedabad', end: 'Mumbai'     },
  { start: 'Delhi',     end: 'Islamabad' }, { start: 'Mumbai',    end: 'Dubai'      },
  { start: 'Dubai',     end: 'Riyadh'   }, { start: 'Shanghai',  end: 'Delhi'      },
  { start: 'Moscow',    end: 'Berlin'    }, { start: 'Berlin',    end: 'London'     },
  { start: 'London',    end: 'New York'  }, { start: 'New York',  end: 'Toronto'    },
  { start: 'Moscow',    end: 'Shanghai'  }, { start: 'Riyadh',   end: 'Dubai'      },
];

const getCityCoords = (name: string) => {
  const c = citiesRawData.find(x => x.name === name);
  return c ? { lat: c.lat, lon: c.lon } : null;
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
    if (earthMode === 'realistic') {
      Cesium.createWorldImageryAsync({ style: Cesium.IonWorldImageryStyle.AERIAL })
        .then((provider: any) => {
          if (viewer.isDestroyed()) return;
          const lyr = viewer.imageryLayers.addImageryProvider(provider);
          lyr.brightness = 1.05; lyr.contrast = 1.05; lyr.saturation = 1.0; lyr.hue = 0.0;
        })
        .catch(async () => {
          if (viewer.isDestroyed()) return;
          const fb = await Cesium.ArcGisMapServerImageryProvider.fromUrl(
            'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
          );
          const lyr = viewer.imageryLayers.addImageryProvider(fb);
          lyr.brightness = 1.05; lyr.contrast = 1.05; lyr.saturation = 1.0;
        });

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
      const cyberProvider = new Cesium.UrlTemplateImageryProvider({
        url:          'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',
        subdomains:   ['a', 'b', 'c', 'd'],
        minimumLevel: 0, maximumLevel: 18,
      });
      const lyr = viewer.imageryLayers.addImageryProvider(cyberProvider);
      lyr.brightness = 1.75;
      lyr.contrast   = 1.20;
      lyr.saturation = 0.60;
      lyr.hue        = 0.54;

      viewer.scene.light = new Cesium.DirectionalLight({
        direction: new Cesium.Cartesian3(-0.7, -0.5, -0.5),
        color:     Cesium.Color.fromCssColorString('#80ffef'),
        intensity: 4.5,
      });
      viewer.scene.ambientColor = new Cesium.Color(0.06, 0.14, 0.28, 1.0);

      if (viewer.scene.globe) {
        viewer.scene.globe.showGroundAtmosphere = true;
        viewer.scene.globe.enableLighting       = true;
        viewer.scene.globe.atmosphereLightIntensity  = 20.0;
        viewer.scene.globe.atmosphereHueShift        = 0.52;
        viewer.scene.globe.atmosphereSaturationShift = 0.70;
        viewer.scene.globe.atmosphereBrightnessShift = 0.30;
      }
      if (viewer.scene.skyAtmosphere) {
        viewer.scene.skyAtmosphere.show = true;
        viewer.scene.skyAtmosphere.hueShift          = 0.52;
        viewer.scene.skyAtmosphere.saturationShift   = 0.70;
        viewer.scene.skyAtmosphere.brightnessShift   = 0.30;
      }
    }

    // ── Variables for overlays
    const isCyber = earthMode === 'cyber';
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

    // ── 3. Climate Heatmaps
    if (ov.climate) {
      const climateRadius   = 1200000 + yearFactor * 1600000;
      const climateAlpha    = (0.08 + yearFactor * 0.17) * cyberBoost;
      const climateColor    = Cesium.Color.fromCssColorString(
        yearFactor < 0.3 ? '#3b82f6' : yearFactor < 0.6 ? '#f97316' : '#ef4444'
      ).withAlpha(Math.min(climateAlpha, 0.45));

      climateZones.forEach((z) => {
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(z.lon, z.lat),
          ellipse: {
            semiMajorAxis: climateRadius,
            semiMinorAxis: climateRadius,
            material: climateColor,
            height: 5000,
          }
        });
      });
    }

    // ── 4. Pollution Zones
    if (ov.pollution) {
      const pollRadius  = 350000 - yearFactor * 230000;
      const pollAlpha   = (0.24 - yearFactor * 0.14) * cyberBoost;
      const pollColor   = Cesium.Color.fromCssColorString(
        yearFactor > 0.75 ? '#10b981' : yearFactor > 0.4 ? '#84cc16' : '#eab308'
      ).withAlpha(Math.min(pollAlpha, 0.55));

      pollutionZones.forEach((z) => {
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(z.lon, z.lat),
          ellipse: {
            semiMajorAxis: pollRadius,
            semiMinorAxis: pollRadius,
            material: pollColor,
            height: 10000,
          }
        });
      });
    }

    // ── 5. AI Zones
    if (ov.ai) {
      const aiRadius = 100000 + yearFactor * 900000;
      const aiAlpha  = (0.06 + yearFactor * 0.14) * cyberBoost;
      const aiColor  = Cesium.Color.fromCssColorString('#8b5cf6').withAlpha(Math.min(aiAlpha, 0.40));

      aiZones.forEach((z) => {
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(z.lon, z.lat),
          ellipse: {
            semiMajorAxis: aiRadius,
            semiMinorAxis: aiRadius,
            material: aiColor,
            height: 8000,
          }
        });
      });
    }

    // ── 6. Energy transmission connections
    if (ov.energy) {
      const pktCount  = activeYear <= 2025 ? 1 : activeYear <= 2035 ? 2 : 3;
      const pktSpeed  = 0.05 + yearFactor * 0.10;
      const lineAlpha = isCyber ? 0.25 : 0.10;

      cityConnections.forEach((conn) => {
        const c1 = getCityCoords(conn.start);
        const c2 = getCityCoords(conn.end);
        if (!c1 || !c2) return;

        viewer.entities.add({
          polyline: {
            positions: [Cesium.Cartesian3.fromDegrees(c1.lon, c1.lat), Cesium.Cartesian3.fromDegrees(c2.lon, c2.lat)],
            width: isCyber ? 1.5 : 1,
            material: Cesium.Color.fromCssColorString(theme.cesiumColorHex).withAlpha(lineAlpha),
          }
        });

        // Animated packets
        for (let k = 0; k < pktCount; k++) {
          viewer.entities.add({
            position: new Cesium.CallbackProperty(() => {
              const t = ((timeRef.current * pktSpeed) + (k / pktCount)) % 1.0;
              return Cesium.Cartesian3.fromDegrees(c1.lon + (c2.lon - c1.lon) * t, c1.lat + (c2.lat - c1.lat) * t);
            }, false),
            point: {
              pixelSize: isCyber ? 5.5 : 4.5,
              color: cesiumColor,
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: isCyber ? 1.2 : 0.8,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            }
          });
        }
      });
    }

    // ── 7. Satellites and Orbits
    if (activeCategory === 'Satellite Network' || ov.satellite) {
      const orbitsList = [
        { tilt:  0.4,  height: 1400000, speed: 0.08, color: Cesium.Color.fromCssColorString('#00f0ff') },
        { tilt: -0.7,  height: 2000000, speed: 0.05, color: Cesium.Color.fromCssColorString('#8b5cf6') },
        { tilt:  1.2,  height: 1700000, speed: 0.07, color: Cesium.Color.fromCssColorString('#14b8a6') },
        { tilt:  0.1,  height: 2500000, speed: 0.06, color: Cesium.Color.fromCssColorString('#3b82f6') },
        { tilt: -1.1,  height: 2200000, speed: 0.09, color: Cesium.Color.fromCssColorString('#00f0ff') },
      ];
      const activeSats = orbitsList.slice(0, activeYear <= 2025 ? 1 : activeYear <= 2030 ? 2 : activeYear <= 2040 ? 3 : 5);
      const orbitAlpha = isCyber ? 0.50 : 0.25;

      activeSats.forEach((o) => {
        // Orbit line
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

        // Satellite point
        viewer.entities.add({
          position: new Cesium.CallbackProperty(() => {
            const a = (timeRef.current * o.speed) % (Math.PI * 2);
            return new Cesium.Cartesian3(r * Math.cos(a), r * Math.sin(a) * Math.cos(o.tilt), r * Math.sin(a) * Math.sin(o.tilt));
          }, false),
          point: {
            pixelSize: isCyber ? 10 : 8,
            color: o.color,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 1.5,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          }
        });
      });

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
