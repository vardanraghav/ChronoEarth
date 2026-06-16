export interface FamousPlace {
  name: string;
  desc: string;
}

export interface NotablePerson {
  name: string;
  role: string;
  specialty: string;
  avatar: string;
  contribution: string;
}

export interface FutureProject {
  name: string;
  desc: string;
}

export interface ExtendedCityData {
  image: string;
  famousPlaces: FamousPlace[];
  notablePeople: NotablePerson[];
  futureProjects: FutureProject[];
}

export const CITIES_EXTENDED_DATA: Record<string, ExtendedCityData> = {
  'tokyo': {
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?w=800&auto=format&fit=crop&q=60',
    famousPlaces: [
      { name: "Neo Shinjuku Forest Tower", desc: "A 1,200m vertical biophilic skyscraper housing 100,000 residents and acting as a primary carbon scrubber." },
      { name: "Tokyo Quantum Exchange", desc: "The central core node of quantum computing grids managing Asian logistics and financial ledgers." },
      { name: "Pacific Hyperloop Terminal", desc: "Sub-oceanic hyperloop station connecting Tokyo to Sydney and San Francisco at Mach 2.5." }
    ],
    notablePeople: [
      { name: "Kaito Tanaka", role: "AI Grid Governor", specialty: "Autonomous Logistics", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60", contribution: "Created the quantum routing algorithms for metropolitan transit networks." },
      { name: "Yuki Sato", role: "Biophilic Architect", specialty: "Vertical Urbanism", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60", contribution: "Designed the Neo Shinjuku Forest Tower." }
    ],
    futureProjects: [
      { name: "Atmospheric Cooling Spire", desc: "A massive geostationary structure cooling air layers to counteract metropolitan heat island effects." },
      { name: "Tokyo Bay Algal Oxygenator", desc: "Autonomous bio-barges releasing engineered oxygen-producing microalgae into coastal channels." }
    ]
  },
  'new-delhi': {
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop&q=60',
    famousPlaces: [
      { name: "Yamuna Bio-Dike", desc: "An active ecological barrier reclaiming marshlands and filtering heavy metal runoffs." },
      { name: "Delhi Climate Dome", desc: "A localized air filtration microclimate canopy covering historical areas." },
      { name: "Bharat AI Governance Center", desc: "Headquarters directing decentralized regional agricultural AI grids." }
    ],
    notablePeople: [
      { name: "Dr. Aarav Sharma", role: "Director of Aquifer Reclaim", specialty: "Hydrological Systems", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60", contribution: "Deployed aquifer charge grids across the National Capital Region." },
      { name: "Ananya Patel", role: "AI Agriculture Coordinator", specialty: "Agricultural Models", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=60", contribution: "Integrated regional crop rotators with central neural networks." }
    ],
    futureProjects: [
      { name: "Neighborhood Fuel Cell Loop", desc: "Decentralized green hydrogen fuel networks backing up grid hyper-generators." },
      { name: "Urban Forest Belt System", desc: "Dense corridors of genetically adapted trees filtering atmospheric smog particles." }
    ]
  },
  'mumbai': {
    image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=800&auto=format&fit=crop&q=60',
    famousPlaces: [
      { name: "Mumbai Tide gates", desc: "Smart tidal floodgates with automated closures powered by sea-level AI scanners." },
      { name: "Offshore Wind Array Hub", desc: "Floating wind farms beaming power to South Mumbai substations." },
      { name: "Coastal Mangrove Nursery", desc: "Restored mangrove networks absorbing storm surges." }
    ],
    notablePeople: [
      { name: "Karan Mehta", role: "Seawall Project Lead", specialty: "Coastal Defense Dynamics", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=60", contribution: "Designed Mumbai's marine salinity barrier network." }
    ],
    futureProjects: [
      { name: "Tidal Kinetic Arrays", desc: "Baseload generators converting ocean currents to electricity." }
    ]
  },
  'bengaluru': {
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&auto=format&fit=crop&q=60',
    famousPlaces: [
      { name: "Hanging Sky Gardens", desc: "Lush botanical skyways linking high-tech skyscrapers." },
      { name: "Silicon Microgrids Central", desc: "Autonomous grid managers routing localized perovskite solar arrays." }
    ],
    notablePeople: [
      { name: "Priya Rao", role: "Eco-Corridor Director", specialty: "Urban Rewilding", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60", contribution: "Designed Bengaluru's microclimatic pocket reserves." }
    ],
    futureProjects: [
      { name: "Rainwater Hyper-harvesting Grid", desc: "Decentralized aquifer recharge nodes recovering 95% of rainfall." }
    ]
  },
  'seoul': {
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=60',
    famousPlaces: [
      { name: "Cheonggyecheon Cyber Canal", desc: "Bio-remediating smart water channels cooling downtown core sectors." },
      { name: "Seoul Quantum Nexus", desc: "Central quantum core directing transit guidelines and maglev grids." }
    ],
    notablePeople: [
      { name: "Ji-Won Park", role: "Smart Pavement Architect", specialty: "Kinetic Road Capture", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60", contribution: "Engineered localized pressure energy capture roadways." }
    ],
    futureProjects: [
      { name: "Thorium District Feeders", desc: "Next-gen zero-emission nuclear loops powering municipal apartments." }
    ]
  },
  'london': {
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=60',
    famousPlaces: [
      { name: "Thames Barrier II", desc: "Smart tidal floodgates with automated lock closures powered by sea-level AI scanners." },
      { name: "Greenwich Fusion Rectenna", desc: "Beamed microwave receiver collecting geo-space solar power." },
      { name: "Westminster Subterranean Flood Bypass", desc: "Giant storm diversion channels keeping historical crypts dry." }
    ],
    notablePeople: [
      { name: "Sir Charles Vance", role: "Coastal Defense Architect", specialty: "Tidal Engineering", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=60", contribution: "Designed the smart sea defense barrier network." },
      { name: "Emma Watson", role: "Urban Rewilding Director", specialty: "Ecological Restoration", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60", contribution: "Reestablished native ecosystems inside London's outer green belt." }
    ],
    futureProjects: [
      { name: "North Sea Wind Interlink", desc: "Subsea super-conducting grid ties linking London to floating offshore turbines." },
      { name: "Retrofitted Tube Heat Collector", desc: "Subway vent recovery systems heating 50,000 public housing modules." }
    ]
  },
  'singapore': {
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&auto=format&fit=crop&q=60',
    famousPlaces: [
      { name: "Marina Bay Coral Nursery", desc: "Electrified reef restoration arrays growing minerals onto steel foundations." },
      { name: "Changi Water Recovery Loop", desc: "Rainwater hyper-harvesting system recycling 98% of municipal waste." },
      { name: "Sentosa Ocean Current Turbine", desc: "Baseload kinetic arrays tapping into deep-ocean currents." }
    ],
    notablePeople: [
      { name: "Dr. Lin Chen", role: "Marine Biologist", specialty: "Accretion Coral Reefs", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=60", contribution: "Engineered Marina Bay's self-healing marine concrete reefs." },
      { name: "Marcus Koh", role: "Microgrid Director", specialty: "Decentralized Energy", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=60", contribution: "Built Singapore's autonomous localized solar grids." }
    ],
    futureProjects: [
      { name: "Floating Solar Bay Network", desc: "Scalable photovoltaic arrays covering marine ports without interrupting cargo flow." },
      { name: "Cloud Seeding Tower Network", desc: "Aerosol spray masts balancing relative humidity levels in key districts." }
    ]
  },
  'dubai': {
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=60',
    famousPlaces: [
      { name: "Burj Khalifa Albedo Shield", desc: "Reflective mirror layers redirecting excessive solar radiation into GEO collectors." },
      { name: "Gulf Desalination Loop", desc: "High-capacity desalination stations powered by desert solar-thermal plants." },
      { name: "Jumeirah Drone Port", desc: "A central terminal coordinating sub-orbital logistics and air taxis." }
    ],
    notablePeople: [
      { name: "Faisal Al-Mansoori", role: "Geo-Engineering Director", specialty: "Albedo Deflection", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=60", contribution: "Deployed reflective aerosol swarms over the Persian Gulf." },
      { name: "Amira Hassan", role: "Hydrogen Grid Architect", specialty: "Clean Fuels", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=60", contribution: "Pioneered Dubai's green hydrogen pipeline conversions." }
    ],
    futureProjects: [
      { name: "Desert Forestation Biome", desc: "Nutrient-infused underground water channels supporting genetically modified desert brush." },
      { name: "Hyperloop Navigation Beacons", desc: "High-frequency orbital transmitters tracking pod arrays passing at Mach 2.5." }
    ]
  },
  'nairobi': {
    image: 'https://images.unsplash.com/photo-1589196728045-f9168925434d?w=800&auto=format&fit=crop&q=60',
    famousPlaces: [
      { name: "Savanna Reforestation Belt", desc: "Dense corridors of drought-resistant trees stabilizing regional soils." },
      { name: "Nairobi Geothermal Core", desc: "Clean power grids utilizing heat from the Rift Valley." }
    ],
    notablePeople: [
      { name: "Wanjiku Njoroge", role: "Wildlife Tech Director", specialty: "Sensor Networks", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=60", contribution: "Integrated wildlife monitoring radio meshes with orbital tracking networks." }
    ],
    futureProjects: [
      { name: "Arid Land Water Recharge Wells", desc: "Hydrological systems recovering rainfall for agricultural fields." }
    ]
  },
  'paris': {
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=60',
    famousPlaces: [
      { name: "Seine Flood Lock System", desc: "Smart bypass gates preventing river overflow during high-tide storms." },
      { name: "Eiffel Solar Tower", desc: "Upgraded solar panels and micro-wind harvesting loops embedded in the historic tower." }
    ],
    notablePeople: [
      { name: "Chloe Dupont", role: "Urban Canopy Architect", specialty: "Biophilic Plazas", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60", contribution: "Implemented climate-adaptive forest corridors across historical streets." }
    ],
    futureProjects: [
      { name: "District Geothermal Grid", desc: "Deep hot-water loops warming residential complexes with zero emissions." }
    ]
  },
  'new-york': {
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop&q=60',
    famousPlaces: [
      { name: "Hudson Surge Barrier", desc: "A 2-mile automated seawall protecting lower Manhattan from storm tides." },
      { name: "Central Park Dome Conservatory", desc: "Sleek canopy systems sheltering endangered micro-species from acid rain." },
      { name: "Skyscraper Solar Paint Array", desc: "Photovoltaic coatings turning glass facades into high-efficiency solar farms." }
    ],
    notablePeople: [
      { name: "Sarah Connor", role: "Coastal Barrier Lead", specialty: "Sea Surge Mechanics", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=60", contribution: "Designed the Hudson River surge wall dynamics." },
      { name: "David Miller", role: "Metropolitan Battery Director", specialty: "Energy Storage", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60", contribution: "Integrated Manhattan's decentralized lithium-sodium battery buffers." }
    ],
    futureProjects: [
      { name: "Atlantic Wind Array Hub", desc: "Floating deep-water wind arrays beaming power to Brooklyn substations." },
      { name: "East River Oyster Bio-Dikes", desc: "Restored oyster grids filtering water pollutants and absorbing tidal waves." }
    ]
  },
  'los-angeles': {
    image: 'https://images.unsplash.com/photo-1422490980249-0ab1d7228f2d?w=800&auto=format&fit=crop&q=60',
    famousPlaces: [
      { name: "LA Seawall Defense", desc: "Automated coastal barriers protecting Santa Monica beaches." },
      { name: "Mojave Solar Pipeline", desc: "High-capacity lines beaming desert solar power to municipal grids." }
    ],
    notablePeople: [
      { name: "Mark Davis", role: "Wildfire Telemetry Coordinator", specialty: "Sensor Arrays", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60", contribution: "Deployed thermal drone networks across the southern mountain regions." }
    ],
    futureProjects: [
      { name: "Coastal Desalination loops", desc: "Solar-thermal powered water processing stations." }
    ]
  },
  'sydney': {
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&auto=format&fit=crop&q=60',
    famousPlaces: [
      { name: "Sydney Harbor Seawalls", desc: "Smart tidal barriers regulating water entry to the inner harbor." },
      { name: "Botany Bay Wave Array", desc: "Wave kinetic dynamos feeding clean energy to local grids." }
    ],
    notablePeople: [
      { name: "Isla Johnston", role: "Marine Ecologist", specialty: "Reef Restoration", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=60", contribution: "Pioneered self-healing concrete reef blocks inside Sydney harbor." }
    ],
    futureProjects: [
      { name: "Coastal Mangrove Canal Channels", desc: "Ecological storm surge mitigation networks." }
    ]
  },
  'sao-paulo': {
    image: 'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=800&auto=format&fit=crop&q=60',
    famousPlaces: [
      { name: "Sao Paulo Rainwater Basins", desc: "Decentralized collection tanks preventing metropolitan floods." },
      { name: "Biomass Loop Central", desc: "Waste conversion facilities generating clean neighborhood power." }
    ],
    notablePeople: [
      { name: "Mateo Silva", role: "Urban Forestry Coordinator", specialty: "Micro-Forestry", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=60", contribution: "Created the biophilic pocket forest mapping systems." }
    ],
    futureProjects: [
      { name: "Rooftop Vegetation Grids", desc: "Carbon scrubbing rooftop plantings across downtown sectors." }
    ]
  },
  'toronto': {
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&auto=format&fit=crop&q=60',
    famousPlaces: [
      { name: "Ontario Deep Heat Loop", desc: "Geothermal district grids warming housing complexes during sub-zero months." },
      { name: "Great Lakes Freight Terminal", desc: "Autonomous logistics dock coordinating clean waterway freight." }
    ],
    notablePeople: [
      { name: "Dr. Helen Vance", role: "Geothermal Engineer", specialty: "Closed-loop Heating", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=60", contribution: "Integrated lake-cooling loops with district energy stations." }
    ],
    futureProjects: [
      { name: "Ravine Eco-Corridor Systems", desc: "Wilderness conservation pathways spanning the metropolitan area." }
    ]
  }
};

export const getCitySlug = (name: string): string => name.toLowerCase().replace(/\s+/g, '-');
export const getExtendedCityData = (name: string): ExtendedCityData => {
  const slug = getCitySlug(name);
  return CITIES_EXTENDED_DATA[slug] || {
    image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800&auto=format&fit=crop&q=60', // Fallback cityscape
    famousPlaces: [
      { name: "Local Hyperloop Station", desc: "High-speed vacuum tube logistics portal linking to global networks." },
      { name: "Metropolitan Power Grid", desc: "Localized microgrids supplying clean baseload power from municipal fusion feeds." }
    ],
    notablePeople: [
      { name: "Alex Mercer", role: "District Architect", specialty: "System Integration", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60", contribution: "Engineered local biophilic adaptations." }
    ],
    futureProjects: [
      { name: "District Water Recycling Grid", desc: "Self-repairing water lines recovering waste with zero leakage." }
    ]
  };
};

