export interface CountryIntelligenceProfile {
  code: string;       // ISO 3166-1 alpha-3 code (e.g. "USA", "IND")
  name: string;
  year: number;
  stats: {
    population: number; // in billions
    gdp: number;        // in trillion USD
    hdi: number;        // 0.0 to 1.0
  };
  scores: {
    climateRisk: number;  // 0 to 100
    aiReadiness: number;  // 0 to 100
  };
  energyMix: {
    fusion: number;       // percentage
    renewables: number;   // percentage
    nuclear: number;      // percentage
    hydrocarbon: number;  // percentage
  };
  industries: string[];
  futureOutlook: string;  // Foresight summary paragraph
}

export const countryRawData: Record<string, CountryIntelligenceProfile> = {
  'IND': {
    code: 'IND',
    name: 'Bharat Unified (India)',
    year: 2030,
    stats: { population: 1.52, gdp: 8.5, hdi: 0.76 },
    scores: { climateRisk: 78, aiReadiness: 65 },
    energyMix: { fusion: 0, renewables: 35, nuclear: 10, hydrocarbon: 55 },
    industries: ['Software Architecture', 'Quantum Textiles', 'Bio-Reclamation', 'Heavy Maglev Manufacturing'],
    futureOutlook: 'Rapidly transforming into a global technology powerhouse. Solar canal arrays and rural bio-reclamation loops are stabilizing food output, though intense thermal domes threaten central agricultural zones.'
  },
  'USA': {
    code: 'USA',
    name: 'United States',
    year: 2030,
    stats: { population: 0.36, gdp: 28.2, hdi: 0.94 },
    scores: { climateRisk: 62, aiReadiness: 94 },
    energyMix: { fusion: 5, renewables: 40, nuclear: 20, hydrocarbon: 35 },
    industries: ['Quantum Informatics', 'Sub-Orbital Logistics', 'Longevity Bio-Medicine', 'Automated Defense Systems'],
    futureOutlook: 'Maintains technological lead through quantum internet rings and sub-orbital supply networks. Coastal zones remain highly exposed to sea-level surges, pushing infrastructure inland.'
  },
  'CHN': {
    code: 'CHN',
    name: 'China',
    year: 2030,
    stats: { population: 1.38, gdp: 24.5, hdi: 0.84 },
    scores: { climateRisk: 68, aiReadiness: 88 },
    energyMix: { fusion: 2, renewables: 45, nuclear: 25, hydrocarbon: 28 },
    industries: ['Modular SMR Core Casting', 'Autonomous Drone Avionics', 'Lithium-Silicon Batteries', 'Deep-Water Flood Locks'],
    futureOutlook: 'Highly secured through large thorium networks and automated seawall systems. Transitioning industrial cores to floating ocean ports to mitigate coastal land subsidence.'
  },
  'JPN': {
    code: 'JPN',
    name: 'Japan',
    year: 2030,
    stats: { population: 0.11, gdp: 6.2, hdi: 0.93 },
    scores: { climateRisk: 64, aiReadiness: 85 },
    energyMix: { fusion: 5, renewables: 30, nuclear: 20, hydrocarbon: 45 },
    industries: ['Holographic Display Arrays', 'Biorock Coastal Accretion', 'Robot Caregivers', 'Deep-Sea Kinetic Generators'],
    futureOutlook: 'Pioneering biophilic urban adaptation. Extensive coastal seawalls and offshore deep-wind corridors protect coastal cores, but low domestic energy output requires thorium partnerships.'
  },
  'GBR': {
    code: 'GBR',
    name: 'United Kingdom',
    year: 2030,
    stats: { population: 0.07, gdp: 3.8, hdi: 0.91 },
    scores: { climateRisk: 58, aiReadiness: 82 },
    energyMix: { fusion: 2, renewables: 42, nuclear: 15, hydrocarbon: 41 },
    industries: ['Blockchain Carbon Systems', 'North Sea Wind Interlinks', 'Retrofitted Thermal Infrastructure', 'Marine Hydrology'],
    futureOutlook: 'Adapting to intense North Sea storms. Thames Barrier upgrades and deep-water surge bypass grids protect historical centers, while trade flows pivot toward clean shipping lanes.'
  },
  'DEU': {
    code: 'DEU',
    name: 'Germany',
    year: 2030,
    stats: { population: 0.08, gdp: 4.9, hdi: 0.94 },
    scores: { climateRisk: 52, aiReadiness: 80 },
    energyMix: { fusion: 0, renewables: 55, nuclear: 0, hydrocarbon: 45 },
    industries: ['Balcony Solar Meshes', 'Circular Biomass Engines', 'Hydrogen Transport Tech', 'Drone Guideline Systems'],
    futureOutlook: 'Pioneering localized microgrids and sponge-city plazas. Centralized carbon tax contracts force rapid industrial shifts, establishing Berlin as a model for emission-free logistics.'
  },
  'SGP': {
    code: 'SGP',
    name: 'Singapore',
    year: 2030,
    stats: { population: 0.006, gdp: 0.65, hdi: 0.96 },
    scores: { climateRisk: 82, aiReadiness: 91 },
    energyMix: { fusion: 0, renewables: 25, nuclear: 15, hydrocarbon: 60 },
    industries: ['Maritime Channel Radars', 'Biophilic Concrete Reefs', 'Rooftop Aquaponics', 'Tidal Kinetic Arrays'],
    futureOutlook: 'Operating as a hyper-dense biophilic smart node. Protected by automated salinity gates and artificial coral foundations, Singapore remains a crucial quantum logic node in Asia.'
  },
  'ARE': {
    code: 'ARE',
    name: 'United Arab Emirates',
    year: 2030,
    stats: { population: 0.011, gdp: 0.72, hdi: 0.89 },
    scores: { climateRisk: 75, aiReadiness: 78 },
    energyMix: { fusion: 0, renewables: 30, nuclear: 20, hydrocarbon: 50 },
    industries: ['Cloud Seeding Systems', 'Burj Solar Deflection Shields', 'Desalination Brine Plants', 'Sub-Orbital Air Ports'],
    futureOutlook: 'Mitigating hyper-arid climates through massive solar arrays, localized cloud-seeding, and thermal shielding canopies, pivoting to a major global hydrogen shipping hub.'
  },
  'SAU': {
    code: 'SAU',
    name: 'Saudi Arabia',
    year: 2030,
    stats: { population: 0.038, gdp: 1.4, hdi: 0.86 },
    scores: { climateRisk: 72, aiReadiness: 72 },
    energyMix: { fusion: 0, renewables: 20, nuclear: 10, hydrocarbon: 70 },
    industries: ['Desert Mirror Coatings', 'Sub-surface Agriculture', 'Solar Tower Infrastructure', 'Green Hydrogen Loops'],
    futureOutlook: 'Undergoing historic layout pivot. The Line megacity projects act as hyper-monitors for desert reclamation, powered by vast concentrated desert solar grids.'
  },
  'KEN': {
    code: 'KEN',
    name: 'Kenya',
    year: 2030,
    stats: { population: 0.065, gdp: 0.28, hdi: 0.68 },
    scores: { climateRisk: 74, aiReadiness: 55 },
    energyMix: { fusion: 0, renewables: 68, nuclear: 0, hydrocarbon: 32 },
    industries: ['Rift Valley Geothermal Taps', 'Wildlife Telemetry Swarms', 'Aquifer Soil Stabilizers', 'Mobile Solar Nets'],
    futureOutlook: 'Harnessing Rift Valley geothermal heat to run localized agricultural water hubs. Strong ecological corridors protect savannas from desertification, supported by orbital telemetry.'
  },
  'CAN': {
    code: 'CAN',
    name: 'Canada',
    year: 2030,
    stats: { population: 0.042, gdp: 2.8, hdi: 0.93 },
    scores: { climateRisk: 42, aiReadiness: 84 },
    energyMix: { fusion: 5, renewables: 50, nuclear: 25, hydrocarbon: 20 },
    industries: ['Lake Cooling Loops', 'Nuclear SMR Fabrication', 'Arctic Navigation Beacons', 'Geothermal Heating Hubs'],
    futureOutlook: 'Benefiting from milder sub-zero months but managing severe boreal forest fires. Toronto operates as a major SMR nuclear reactor manufacturing center for North America.'
  },
  'BRA': {
    code: 'BRA',
    name: 'Brazil',
    year: 2030,
    stats: { population: 0.23, gdp: 2.6, hdi: 0.82 },
    scores: { climateRisk: 65, aiReadiness: 62 },
    energyMix: { fusion: 0, renewables: 75, nuclear: 5, hydrocarbon: 20 },
    industries: ['Rainforest Moisture Radars', 'Biomass Fuel Loop Refinement', 'Rooftop Pocket Gardens', 'Aqueduct Flow Regulators'],
    futureOutlook: 'Focusing on large-scale rewilding of the Amazon basin. Employs advanced radar arrays to coordinate forestation corridors and combat regional aquifer depletion.'
  },
  'RUS': {
    code: 'RUS',
    name: 'Russia',
    year: 2030,
    stats: { population: 0.13, gdp: 2.1, hdi: 0.81 },
    scores: { climateRisk: 48, aiReadiness: 70 },
    energyMix: { fusion: 2, renewables: 15, nuclear: 35, hydrocarbon: 48 },
    industries: ['Sub-zero Infrastructure', 'Arctic Shipping Logistics', 'SMR Thermal Grids', 'Volcanic Ash Sensors'],
    futureOutlook: 'Capitalizing on melting Arctic sea routes to establish dominance in trans-oceanic shipping corridors, backed by decentralized thorium nuclear plants.'
  },
  'EGY': {
    code: 'EGY',
    name: 'Egypt',
    year: 2030,
    stats: { population: 0.12, gdp: 0.58, hdi: 0.74 },
    scores: { climateRisk: 80, aiReadiness: 58 },
    energyMix: { fusion: 0, renewables: 28, nuclear: 12, hydrocarbon: 60 },
    industries: ['Nile River Regulation Systems', 'Saharan Oasis Irrigation', 'Desalination Power Grids', 'Solar Canal Overlays'],
    futureOutlook: 'Combating severe desertification via agricultural bio-domes. Nile water flow governors are synced to temperature telemetry to prevent catastrophic water crises.'
  },
  'PAK': {
    code: 'PAK',
    name: 'Pakistan',
    year: 2030,
    stats: { population: 0.28, gdp: 0.48, hdi: 0.62 },
    scores: { climateRisk: 85, aiReadiness: 50 },
    energyMix: { fusion: 0, renewables: 30, nuclear: 15, hydrocarbon: 55 },
    industries: ['Glacier Runoff Dams', 'Heatwave Mitigation Shards', 'Himalayan Ice Telemetry', 'Reforestation Corridors'],
    futureOutlook: 'Highly vulnerable to melting Himalayan glaciers. Deploys advanced runoff governors to manage floodwaters and cool urban pathways during extreme heat domes.'
  },
  'Reykjavik': {
    // Falls back to ISL (Iceland)
    code: 'ISL',
    name: 'Iceland',
    year: 2030,
    stats: { population: 0.0004, gdp: 0.04, hdi: 0.95 },
    scores: { climateRisk: 38, aiReadiness: 84 },
    energyMix: { fusion: 0, renewables: 95, nuclear: 0, hydrocarbon: 5 },
    industries: ['Glacier Melt Converters', 'Geothermal Steam Generators', 'Arctic Greenhouses', 'Volcanic Telemetry'],
    futureOutlook: 'Maintains full geothermal independence. Reykjavik serves as a critical monitoring node for Arctic glacier density and transatlantic logistics lanes.'
  }
};

// Dynamic Projection Generator based on active What-If Simulations
export const generateCountryProjections = (
  countryCode: string,
  year: number,
  simulations: {
    seaLevelRise: number;        // 0 (none), 1 (+1m), 2 (+2m), 5 (+5m)
    fusionBreakthrough: boolean;
    agiEmergence: boolean;
    popDecline: boolean;
    renewableTransition: boolean;
    arcticDominance: boolean;
    semiDisruptions: boolean;
  }
): CountryIntelligenceProfile => {
  const baseProfile = countryRawData[countryCode] || {
    code: countryCode,
    name: `Sector-${countryCode}`,
    year: 2030,
    stats: { population: 0.05, gdp: 1.2, hdi: 0.80 },
    scores: { climateRisk: 50, aiReadiness: 50 },
    energyMix: { fusion: 0, renewables: 30, nuclear: 10, hydrocarbon: 60 },
    industries: ['Advanced Smart Plazas', 'Regional Transit Beacons'],
    futureOutlook: 'Operating on general foresight parameters.'
  };

  // Deep clone profile to prevent mutating static data
  const profile = JSON.parse(JSON.stringify(baseProfile)) as CountryIntelligenceProfile;

  const yearStep = (year - 2025) / 5; // 1 to 5

  // 1. Time progression calculations
  profile.stats.population += yearStep * (profile.stats.population * 0.005);
  profile.stats.gdp += yearStep * (profile.stats.gdp * 0.025);
  profile.scores.aiReadiness = Math.min(100, profile.scores.aiReadiness + yearStep * 1.5);
  
  // 2. Simulation overrides
  if (simulations.seaLevelRise > 0) {
    const level = simulations.seaLevelRise;
    // Coastal vulnerability multiplier
    const isCoastal = profile.energyMix.hydrocarbon > 0 || profile.code === 'NLD' || profile.code === 'SGP' || profile.code === 'BGD' || profile.code === 'USA' || profile.code === 'CHN' || profile.code === 'JPN';
    
    if (isCoastal) {
      profile.scores.climateRisk = Math.min(100, profile.scores.climateRisk + level * 10);
      profile.stats.gdp *= (1.0 - (0.015 * level));
      profile.stats.hdi = Math.max(0.4, profile.stats.hdi - (0.02 * level));
      profile.futureOutlook += ` WARNING: Coastal flooding from +${level}m sea-level rise has compromised metropolitan corridors.`;
    }
  }

  if (simulations.fusionBreakthrough) {
    profile.energyMix.fusion = Math.min(95, profile.energyMix.fusion + 65);
    profile.energyMix.hydrocarbon = Math.max(0, profile.energyMix.hydrocarbon - 50);
    profile.energyMix.renewables = Math.max(5, profile.energyMix.renewables - 15);
    profile.scores.climateRisk = Math.max(10, profile.scores.climateRisk - 25);
    profile.stats.gdp *= 1.15; // 15% GDP boost from energy abundance
    profile.futureOutlook += ' Fusion energy breakthrough has eliminated energy scarcity, slashing carbon index by 90%.';
  }

  if (simulations.agiEmergence) {
    profile.scores.aiReadiness = Math.min(99, profile.scores.aiReadiness + 30);
    profile.stats.gdp *= 1.25; // 25% GDP boost from AGI automation
    profile.futureOutlook += ' AGI emergence has optimized infrastructure and accelerated cognitive logistics.';
  }

  if (simulations.popDecline) {
    profile.stats.population *= 0.88; // 12% drop
    profile.stats.gdp *= 0.92;
    profile.futureOutlook += ' Depopulation vectors are straining municipal carrying capacity.';
  }

  if (simulations.renewableTransition) {
    profile.energyMix.renewables = Math.min(90, profile.energyMix.renewables + 40);
    profile.energyMix.hydrocarbon = Math.max(5, profile.energyMix.hydrocarbon - 40);
    profile.scores.climateRisk = Math.max(15, profile.scores.climateRisk - 15);
    profile.futureOutlook += ' Rapid global renewable deployment has stabilized climate impact metrics.';
  }

  if (simulations.arcticDominance) {
    if (profile.code === 'RUS' || profile.code === 'CAN' || profile.code === 'ISL') {
      profile.stats.gdp *= 1.12; // 12% boost
      profile.futureOutlook += ' Arctic shipping corridors are routing the majority of global shipping tonnage.';
    }
  }

  if (simulations.semiDisruptions) {
    profile.stats.gdp *= 0.95; // 5% global GDP drop
    profile.scores.aiReadiness = Math.max(10, profile.scores.aiReadiness - 15);
    profile.futureOutlook += ' Geopolitical semiconductor supply chains are disrupted, slowing hardware rollouts.';
  }

  // Normalize energy mix
  const total = profile.energyMix.fusion + profile.energyMix.renewables + profile.energyMix.nuclear + profile.energyMix.hydrocarbon;
  if (total > 0) {
    profile.energyMix.fusion = Math.round((profile.energyMix.fusion / total) * 100);
    profile.energyMix.renewables = Math.round((profile.energyMix.renewables / total) * 100);
    profile.energyMix.nuclear = Math.round((profile.energyMix.nuclear / total) * 100);
    profile.energyMix.hydrocarbon = Math.round((profile.energyMix.hydrocarbon / total) * 100);
  }

  return profile;
};

