'use client';

export type RenderQualityMode = 'performance' | 'balanced' | 'cinematic';

export interface RenderQualityProfile {
  // Cesium Native Settings
  maximumScreenSpaceError: number;
  tileCacheSize: number;
  loadingDescendantLimit: number;
  preloadAncestors: boolean;
  preloadSiblings: boolean;
  showGroundAtmosphere: boolean;
  showSkyAtmosphere: boolean;
  resolutionScale: number; // Factor multiplied by devicePixelRatio

  // Intelligence Layer & Entity Limits
  citiesLimit: 'all' | 'tier1_tier2' | 'tier1';
  loadHighways: boolean;
  loadOrbitalShells: boolean;
  loadRoutes: boolean;
  loadClimateRegions: boolean;
  loadTechHubs: boolean;
  loadEnergyHubs: boolean;
  loadSpaceports: boolean;
  loadGeopoliticalLanes: boolean;
  loadMarketsFabs: boolean;

  // Animation & Visual Effects Complexity
  enablePulseRings: boolean;
  enableBeacons: boolean;
  enableTravelingPulses: boolean;
  enableSeismicRipples: boolean;
  limitSatellites: boolean;
}

export const renderQualityConfig: Record<RenderQualityMode, RenderQualityProfile> = {
  performance: {
    // Highly optimized for weak laptops and mobile devices
    maximumScreenSpaceError: 2.5, // Cache larger tiles (less CPU/network workload)
    tileCacheSize: 300,
    loadingDescendantLimit: 12,
    preloadAncestors: false,
    preloadSiblings: false,
    showGroundAtmosphere: false,
    showSkyAtmosphere: false,
    resolutionScale: 0.75, // Scale down slightly to improve GPU pixel rendering

    citiesLimit: 'tier1', // Only show Tier 1 cities to drastically reduce labels & points
    loadHighways: false,
    loadOrbitalShells: false,
    loadRoutes: false,
    loadClimateRegions: false,
    loadTechHubs: false,
    loadEnergyHubs: false,
    loadSpaceports: false,
    loadGeopoliticalLanes: false,
    loadMarketsFabs: false,

    enablePulseRings: false,
    enableBeacons: false,
    enableTravelingPulses: false,
    enableSeismicRipples: false,
    limitSatellites: true,
  },
  balanced: {
    // Default optimized ChronoEarth baseline experience
    maximumScreenSpaceError: 0.6,
    tileCacheSize: 1000,
    loadingDescendantLimit: 48,
    preloadAncestors: true,
    preloadSiblings: true,
    showGroundAtmosphere: false,
    showSkyAtmosphere: true,
    resolutionScale: 1.0, // Clean crisp display

    citiesLimit: 'tier1_tier2', // Load main hubs & secondary cities
    loadHighways: true,
    loadOrbitalShells: true,
    loadRoutes: true,
    loadClimateRegions: true,
    loadTechHubs: true,
    loadEnergyHubs: true,
    loadSpaceports: true,
    loadGeopoliticalLanes: true,
    loadMarketsFabs: true,

    enablePulseRings: true,
    enableBeacons: true,
    enableTravelingPulses: true,
    enableSeismicRipples: true,
    limitSatellites: false,
  },
  cinematic: {
    // Unconstrained highest rendering quality for powerful hardware
    maximumScreenSpaceError: 0.25, // Ultra-sharp textures and mesh
    tileCacheSize: 2000,
    loadingDescendantLimit: 96,
    preloadAncestors: true,
    preloadSiblings: true,
    showGroundAtmosphere: true,
    showSkyAtmosphere: true,
    resolutionScale: 1.2, // Maximum crispness up to device limits

    citiesLimit: 'all', // Full city index
    loadHighways: true,
    loadOrbitalShells: true,
    loadRoutes: true,
    loadClimateRegions: true,
    loadTechHubs: true,
    loadEnergyHubs: true,
    loadSpaceports: true,
    loadGeopoliticalLanes: true,
    loadMarketsFabs: true,

    enablePulseRings: true,
    enableBeacons: true,
    enableTravelingPulses: true,
    enableSeismicRipples: true,
    limitSatellites: false,
  },
};
