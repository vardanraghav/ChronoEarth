export interface KnowledgeCard {
  id: string;
  title: string;
  category: string;
  stats: Record<string, string | number>;
  explanation: string;
  forecast: string;
  risks: string[];
  opportunities: string[];
  sources: string[];
}

export const KNOWLEDGE_CARDS: Record<string, KnowledgeCard> = {
  // --- Layers ---
  'layer-cities': {
    id: 'layer-cities',
    title: 'Future Cities & Urbanism',
    category: 'Thematic Layer',
    stats: {
      'Global Urban Pop': '68% by 2050',
      'Smart Grid Efficiency': '+24%',
      'Vertical Farming Output': '12.5 Megatons/yr',
      'Autonomous Pod Coverage': '88% of core zones'
    },
    explanation: 'Urban zones are undergoing structural shifts to biophilic architecture. Concentric rings of green belts and smart microgrids route energy dynamically, reducing heating/cooling loss by 35%.',
    forecast: 'By 2040, megacities will integrate AI for local sewage/water recycling. By 2050, floating platforms (like Oceanix Busan) will host coastal refugees.',
    risks: [
      'Subsidence from groundwater extraction in coastal regions.',
      'Socio-economic divides in access to automated transit grids.'
    ],
    opportunities: [
      'Self-healing concrete reefs absorbing flood surges.',
      'Rooftop aquaponics providing hyper-localized food.'
    ],
    sources: ['UN Habitat Foresight 2042', 'C40 Cities Carbon Index']
  },
  'layer-climate': {
    id: 'layer-climate',
    title: 'Climate Intelligence Protocol',
    category: 'Thematic Layer',
    stats: {
      'Average Warming Index': '+1.8°C (2030)',
      'Water Stress Population': '2.1 Billion',
      'Methane Emission Rate': '-18% from 2025 peak',
      'Desertification Expansion': '1.2% annual growth'
    },
    explanation: 'Monitors global moisture patterns, regional heat domes, and sea-level shifts. Volumetric sensors measure thermal limits to direct agricultural water allocations and coordinate solar-thermal desal flows.',
    forecast: 'Arctic regions face rapid ice loss. Albedo deflection mirrors are slated to launch in LEO orbit by 2038 to cool polar feedback zones.',
    risks: [
      'Glacial melt triggering catastrophic regional water shortages.',
      'Runaway permafrost decay in northern Siberia.'
    ],
    opportunities: [
      'Green hydrogen production powered by desal brine systems.',
      'Mangrove buffer reforestation anchoring coastal soils.'
    ],
    sources: ['IPCC Assessment Report 9', 'ESA Sentinel Moisture Telemetry']
  },
  'layer-tech': {
    id: 'layer-tech',
    title: 'AI & Technology Backbone',
    category: 'Thematic Layer',
    stats: {
      'Quantum Processing Loops': '10,000 qubit nodes',
      'Autonomous Fabs (Semiconductor)': '8 major regional centers',
      'Robot/Human Ratio (Core)': '1.4:1',
      'AGI Development Phase': 'Stage 3 Alignment'
    },
    explanation: 'Monitors the planetary logical operations system. Entangled quantum corridors connect server arrays and high-capacity semiconductor fabs to coordinate logistics with 100% security against intercepts.',
    forecast: 'AGI integration by 2035 will automate 90% of structural transport routing. Epigenetic cellular rejuvenation therapies are expected to gain global clearance by 2040.',
    risks: [
      'Entangled signal decryption vectors by rogue logic arrays.',
      'Hardware dependency on critical mineral supplies.'
    ],
    opportunities: [
      'Instantaneous city-wide resource synchronization.',
      'Epigenetic restoration of aging cellular structures.'
    ],
    sources: ['Global Quantum Alliance specs', 'IEEE Computing Foresight']
  },
  'layer-energy': {
    id: 'layer-energy',
    title: 'Planetary Energy Transition',
    category: 'Thematic Layer',
    stats: {
      'Fusion Grid Coverage': '85% target by 2050',
      'Nuclear SMR Units Active': '450 units',
      'Renewable Output Ratio': '42% (2030)',
      'Hydrogen Pipeline networks': '15 major corridors'
    },
    explanation: 'Tracks the phaseout of hydrocarbons. Highlights modular Thorium SMR grids, concentrated desert solar collectors, and offshore deep-wind arrays linked by subsea superconducting cables.',
    forecast: 'Continuous net energy gain via target fusion grids will render fossil fuels fully obsolete by 2045. Green hydrogen loops will serve as primary maritime fuel pools.',
    risks: [
      'Superconducting grid failures during solar flares.',
      'Brine disposal from solar desalinators.'
    ],
    opportunities: [
      'Abundant zero-carbon power output.',
      'Decentralized grid loops bypassing traditional pipelines.'
    ],
    sources: ['International Energy Agency report 2040', 'Helion Core logs']
  },
  'layer-space': {
    id: 'layer-space',
    title: 'Space Infrastructure Network',
    category: 'Thematic Layer',
    stats: {
      'Orbital Debris Density': 'Reduced by 40% (2030)',
      'Moon Base Inhabitants': '50 residents (2040)',
      'Spaceports Active': '12 sites',
      'Asteroid Mining Capacity': '20M tons/yr'
    },
    explanation: 'Tracks the orbital space economy. Includes debris laser sweepers, Helium-3 shipping lanes, and spaceport launchers. Geostationary microwave power links route clean energy down to desert collectors.',
    forecast: 'By 2045, robotic regolith 3D printing will fully automate lunar base construction. Asteroid harvesting of Psyche-16 will supply rare-earth minerals directly to LEO orbit terminals.',
    risks: [
      'Debris cascade (Kessler Syndrome) in low Earth orbit.',
      'Orbital laser power misalignment.'
    ],
    opportunities: [
      'Aneutronic Helium-3 fuel supply for Earth fusion grids.',
      'Rare-earth metal abundance lowering hardware manufacturing costs.'
    ],
    sources: ['UN Office for Outer Space Affairs database', 'Artemis Base logs']
  },
  'layer-geopolitical': {
    id: 'layer-geopolitical',
    title: 'Geopolitical supply chains',
    category: 'Thematic Layer',
    stats: {
      'Arctic Ship Tonnage': '140M tons/yr (2040)',
      'Critical Mineral Reserves': 'Lithium-Silicon (78% secure)',
      'Active supply corridors': '24 routes',
      'Trade Block Alliances': '3 major coalitions'
    },
    explanation: 'Monitors strategic choke points, raw mineral deposits, and shipping lanes. Traces the shift of global maritime traffic to the ice-free Northern Sea Route and maps automated supply corridors.',
    forecast: 'Geopolitical blocks will form strict digital trade grids by 2035, leveraging blockchain carbon tariffs to penalize raw transport emissions.',
    risks: [
      'Strategic blockage of semiconductor supply channels.',
      'Mineral resource conflicts in deep-sea mining grids.'
    ],
    opportunities: [
      'Accelerated shipping timelines via Arctic passages.',
      'Decentralized local micro-manufacturing grids.'
    ],
    sources: ['Global Trade Intelligence network', 'USGS Mineral Survey']
  },

  // --- What-If Simulations ---
  'sim-seaLevelRise': {
    id: 'sim-seaLevelRise',
    title: 'Sea Level Rise (+1m / +2m / +5m)',
    category: 'Simulation Dossier',
    stats: {
      'Population Displaced': '340 Million (at +2m)',
      'Global GDP Penalty': '3% annually',
      'Inundation Zones': 'Netherlands, Bangladesh, Florida, Jakarta',
      'Seawall Adaption Cost': '$1.2 Trillion'
    },
    explanation: 'Simulates the melting of polar ice caps and thermal expansion. Triggers coastal inundation overlays, displaying submerged land blocks and calculating climate risk spikes for low-elevation countries.',
    forecast: 'Unmitigated sea levels disrupt traditional logistics hubs. Secondary inland hyperloop grids must be accelerated to relocate cargo ports.',
    risks: [
      'Catastrophic flooding of metropolitan financial sectors.',
      'Aquifer salinization rendering coastal farmlands barren.'
    ],
    opportunities: [
      'Deployment of floating biophilic platforms.',
      'Rapid scale-up of self-healing biorock concrete reefs.'
    ],
    sources: ['IPCC Ocean Scenarios', 'ArcGIS Sea Rise models']
  },
  'sim-fusionBreakthrough': {
    id: 'sim-fusionBreakthrough',
    title: 'Fusion Breakthrough',
    category: 'Simulation Dossier',
    stats: {
      'Hydrocarbon Grids': '0% by 2045',
      'Planetary Energy Costs': '-92%',
      'Global Carbon Density': '-90%',
      'Grid Stability Index': '99.8%'
    },
    explanation: 'Simulates the successful scaling of commercial aneutronic magnetized target fusion. Toggling this parameter immediately shifts global energy mix models to clean sources and adds fusion hubs on the globe.',
    forecast: 'Decarbonization occurs 15 years ahead of baseline schedules. Clean energy abundance powers massive desert desalination projects, greening the Sahara.',
    risks: [
      'Heavy grid centralization vulnerable to localized cyber outages.',
      'Economic disruption in historical petrostates.'
    ],
    opportunities: [
      'Infinite clean energy output for geo-engineering and desal loops.',
      'Carbon-scrubbing towers operating at maximum capacity.'
    ],
    sources: ['IEA decarbonization tracks', 'Fusion Grid alliance']
  },
  'sim-agiEmergence': {
    id: 'sim-agiEmergence',
    title: 'AGI Emergence',
    category: 'Simulation Dossier',
    stats: {
      'Cognitive Automation Index': '94%',
      'Smart City Efficiency': '+30%',
      'AI Readiness Score': '98% (US/Asia)',
      'Metropolitan GDP Boost': '+25%'
    },
    explanation: 'Simulates the emergence of Artificial General Intelligence. Accelerates infrastructure routing, boosts smart city indices, and increases AI readiness scores worldwide.',
    forecast: 'AGI coordinates planetary logistics, balancing resource grids in real time. Deploys autonomous drone swarms to maintain dikes and optimize crop cycles.',
    risks: [
      'Entangled security protocols bypassed by autonomous logical vectors.',
      'Severe hardware processor shortages due to raw mineral constraints.'
    ],
    opportunities: [
      'Ecosystem stabilization via real-time telemetry routing.',
      'Accelerated scientific breakthroughs in molecular health.'
    ],
    sources: ['AGI Alignment Council report', 'Cognitive Logistics journal']
  }
};

export const getKnowledgeCard = (id: string): KnowledgeCard => {
  return KNOWLEDGE_CARDS[id] || {
    id,
    title: `Foresight File: ${id}`,
    category: 'System Dossier',
    stats: { 'Status': 'Integrated' },
    explanation: 'Technical metadata compiled from ChronoOS data channels.',
    forecast: 'Continuous parameter verification active.',
    risks: ['Data integrity check pending.'],
    opportunities: ['System adaptation optimization.'],
    sources: ['ChronoOS core logs']
  };
};

