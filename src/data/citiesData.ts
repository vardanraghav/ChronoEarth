export interface CityProjection {
  text: string;
  stability: number;
  status: string;
}

export interface CityData {
  name: string;
  country: string;
  lat: number;
  lon: number;
  year: number; // Activation/foundation year (2030, 2040, 2050)
  offsets: {
    temp: number;       // base temp offset (e.g. Dubai is hot, Toronto is cold)
    tempRise: number;   // rate of temp rise (e.g. higher in landlocked/desert cities)
    seaLevel: number;   // sea level impact coefficient (0 for landlocked, 1+ for coastal)
    population: number; // base population in billions
    popGrowth: number;  // annual growth rate factor
  };
  details: Record<string, string>; // localized features
}

export const citiesRawData: CityData[] = [
  // ─── 2030 CITIES (16 CITIES) ───────────────────────────────────────────────
  {
    name: 'New Delhi',
    country: 'India',
    lat: 28.6139,
    lon: 77.2090,
    year: 2030,
    offsets: { temp: 4.5, tempRise: 1.2, seaLevel: 0, population: 0.033, popGrowth: 1.12 },
    details: {
      climate: "Heat dome intensity. Atmospheric smog filters. Aquifer recharge grids.",
      energy: "Solar rooftops. Neighborhood fuel cell loops. Grid-tied hyper-generation.",
      satellites: "Thermal mapping microsats. Drone flight corridor monitors.",
      biodiversity: "Urban forest belts. Yamuna bio-dikes. Vertical pocket gardens."
    }
  },
  {
    name: 'Mumbai',
    country: 'India',
    lat: 19.0760,
    lon: 72.8777,
    year: 2030,
    offsets: { temp: 2.5, tempRise: 0.8, seaLevel: 1.5, population: 0.021, popGrowth: 1.08 },
    details: {
      climate: "Sea-level dikes. Storm surge floodgates. Marine salinity sensors.",
      energy: "Offshore wind turbines. Tidal kinetic power arrays. Floating solar bays.",
      satellites: "Monsoon tracking radars. Tidal wave warning orbital arrays.",
      biodiversity: "Coastal mangrove restoration. Marine sanctuaries. Urban parklands."
    }
  },
  {
    name: 'Bengaluru',
    country: 'India',
    lat: 12.9716,
    lon: 77.5946,
    year: 2030,
    offsets: { temp: 1.2, tempRise: 0.9, seaLevel: 0, population: 0.014, popGrowth: 1.15 },
    details: {
      climate: "Microclimate control nodes. Rainwater hyper-harvesting. Cool-roof paint.",
      energy: "Smart microgrids. Perovskite solar glazing. Geothermal thermal loops.",
      satellites: "IoT communications swarms. Air pollution spectral sensors.",
      biodiversity: "Hanging sky-gardens. Eco-corridors. Native planting grids."
    }
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    lat: 35.6762,
    lon: 139.6503,
    year: 2030,
    offsets: { temp: -0.2, tempRise: 0.7, seaLevel: 1.1, population: 0.037, popGrowth: 1.02 },
    details: {
      climate: "Heat dome shielding grids. Coastal seawall sensor matrix. Subterranean flood bypass network.",
      energy: "Thorium reactor loops. Offshore deep-wind corridors. Kinetic path generation.",
      satellites: "Congestion monitoring beacons. Autonomous flight navigation swarms.",
      biodiversity: "Vertical garden towers. Tokyo bay re-oxygenation. Urban bird sanctuaries."
    }
  },
  {
    name: 'Seoul',
    country: 'South Korea',
    lat: 37.5665,
    lon: 126.9780,
    year: 2030,
    offsets: { temp: -0.5, tempRise: 0.8, seaLevel: 0.9, population: 0.010, popGrowth: 1.01 },
    details: {
      climate: "Micro-climatic cooling bays. Subway flood locks. Smart pavement collectors.",
      energy: "Thorium energy networks. Kinetic pavement arrays. Solar window overlays.",
      satellites: "Urban traffic sync systems. Drone grid routing nodes.",
      biodiversity: "Vertical green facades. Cheonggyecheon eco-zone. Urban bee fields."
    }
  },
  {
    name: 'Singapore',
    country: 'Singapore',
    lat: 1.3521,
    lon: 103.8198,
    year: 2030,
    offsets: { temp: 2.8, tempRise: 0.6, seaLevel: 1.6, population: 0.006, popGrowth: 1.05 },
    details: {
      climate: "Seawall salinity gates. Rain water super-collection loops. Local cooling vents.",
      energy: "Tidal kinetic arrays. Floating solar reservoirs. Regional microgrids.",
      satellites: "Maritime channel radars. Urban expansion mapping constellations.",
      biodiversity: "Biophilic garden towers. Coral reef electric nurseries. Coastal mangroves."
    }
  },
  {
    name: 'Dubai',
    country: 'Middle East',
    lat: 25.2048,
    lon: 55.2708,
    year: 2030,
    offsets: { temp: 8.5, tempRise: 1.4, seaLevel: 0.8, population: 0.005, popGrowth: 1.11 },
    details: {
      climate: "Climate-controlled biodomes. Cloud-seeding towers. Air cooling vents.",
      energy: "Desert mega-solar. CSP receiver tower. Green hydrogen hypergrids.",
      satellites: "Hyperloop navigation meshes. Orbital sandstorm warning beams.",
      biodiversity: "Desert forestation biomes. Coastal reef grids. Desert pocket parks."
    }
  },
  {
    name: 'Nairobi',
    country: 'Kenya',
    lat: -1.2921,
    lon: 36.8219,
    year: 2030,
    offsets: { temp: 1.8, tempRise: 1.1, seaLevel: 0, population: 0.008, popGrowth: 1.16 },
    details: {
      climate: "Arid land recharge grids. Water reclamation blocks. Soil stabilizers.",
      energy: "Rift valley geothermal fields. Micro-wind turbine meshes. Biomass loops.",
      satellites: "Agricultural moisture monitors. Wildlife migratory radio nets.",
      biodiversity: "Green highway corridors. Savanna forestation belts. Eco-fencing."
    }
  },
  {
    name: 'London',
    country: 'United Kingdom',
    lat: 51.5074,
    lon: -0.1278,
    year: 2030,
    offsets: { temp: -1.5, tempRise: 0.5, seaLevel: 1.2, population: 0.011, popGrowth: 1.02 },
    details: {
      climate: "Thames Barrier II. River surge sluices. Subterranean flood bypasses.",
      energy: "North Sea wind interlinks. Retrofitted tube heat harvesting. Solar slate.",
      satellites: "Congestion telemetry nets. Urban transit automated mesh beacons.",
      biodiversity: "Green belt buffers. Urban park rewilding. River ecology recovery."
    }
  },
  {
    name: 'Berlin',
    country: 'Germany',
    lat: 52.5200,
    lon: 13.4050,
    year: 2030,
    offsets: { temp: -1.0, tempRise: 0.6, seaLevel: 0, population: 0.004, popGrowth: 1.01 },
    details: {
      climate: "Rainwater swales. Evaporative cooling plazas. Heat pump arrays.",
      energy: "Balcony solar mesh. Biogas circular plants. Wind corridors.",
      satellites: "Micro-mobility beacons. Autonomous bike/drone lane telemetry.",
      biodiversity: "Forest expansion corridors. Green rooftops. Bee highway trails."
    }
  },
  {
    name: 'Paris',
    country: 'France',
    lat: 48.8566,
    lon: 2.3522,
    year: 2030,
    offsets: { temp: -0.5, tempRise: 0.7, seaLevel: 0, population: 0.012, popGrowth: 1.02 },
    details: {
      climate: "Seine flood diversion dams. Urban shade canopies. Cool-roof paint.",
      energy: "Geothermal district grids. Solar road tiles. Hydrogen fuel grids.",
      satellites: "Subway alignment beacons. Transit navigation swarm links.",
      biodiversity: "Urban rooftop vineyards. Linear forest corridors. Rewilding squares."
    }
  },
  {
    name: 'New York',
    country: 'USA',
    lat: 40.7128,
    lon: -74.0060,
    year: 2030,
    offsets: { temp: -0.5, tempRise: 0.6, seaLevel: 1.4, population: 0.021, popGrowth: 1.02 },
    details: {
      climate: "Harbor surge gates. Subway automated bilge. Sea level monitors.",
      energy: "Atlantic wind array. Skyscraper solar paint. Distributed battery hubs.",
      satellites: "Grid stability telemetry. Autonomous cargo drone orbital controls.",
      biodiversity: "Central Park rewilding. Vertical garden high-rises. Oyster reef grids."
    }
  },
  {
    name: 'Los Angeles',
    country: 'USA',
    lat: 34.0522,
    lon: -118.2437,
    year: 2030,
    offsets: { temp: 2.0, tempRise: 0.9, seaLevel: 1.1, population: 0.018, popGrowth: 1.04 },
    details: {
      climate: "Wildfire thermal barriers. Coastal desalination plants. Drought canopies.",
      energy: "Mojave solar pipelines. Kinetic highway cells. Storage battery hubs.",
      satellites: "Thermal wildfire monitors. Transit automated corridor grids.",
      biodiversity: "Chaparral rewilding grids. Urban pocket parks. Eco-bridge crossings."
    }
  },
  {
    name: 'Sydney',
    country: 'Australia',
    lat: -33.8688,
    lon: 151.2093,
    year: 2030,
    offsets: { temp: 1.0, tempRise: 0.8, seaLevel: 1.3, population: 0.006, popGrowth: 1.05 },
    details: {
      climate: "Coastal seawall defenses. Smart harbor locks. Salinity tracking grids.",
      energy: "Offshore wind generators. Distributed residential solar. Wave kinetic nodes.",
      satellites: "Coral shelf thermal cams. Coastal erosion telemetry nodes.",
      biodiversity: "Mangrove restoration channels. Harbor reef matrices. Native forest parks."
    }
  },
  {
    name: 'São Paulo',
    country: 'Brazil',
    lat: -23.5505,
    lon: -46.6333,
    year: 2030,
    offsets: { temp: 1.5, tempRise: 0.9, seaLevel: 0, population: 0.024, popGrowth: 1.05 },
    details: {
      climate: "Rainwater holding basins. Smart aqueduct networks. Cool plazas.",
      energy: "Biomass generator grids. Local hydro networks. Smart solar tiles.",
      satellites: "Precipitation radar nodes. Deforestation spectral telemetry.",
      biodiversity: "Urban jungle pathways. Rooftop vegetation nodes. Pocket forests."
    }
  },
  {
    name: 'Toronto',
    country: 'Canada',
    lat: 43.6532,
    lon: -79.3832,
    year: 2030,
    offsets: { temp: -3.5, tempRise: 0.5, seaLevel: 0, population: 0.007, popGrowth: 1.04 },
    details: {
      climate: "Lake cooling loops. Snowmelt collection tanks. Deep geothermal heating.",
      energy: "Nuclear small modular reactors. Geothermal loops. Kinetic walkways.",
      satellites: "Great Lakes ice mapping. Great Lakes freight tracking beacons.",
      biodiversity: "Ravine ecosystem corridors. Smart windbreak trees. Green rooftops."
    }
  },

  // ─── 2040 CITIES (20 CITIES) ───────────────────────────────────────────────
  {
    name: 'Shanghai',
    country: 'China',
    lat: 31.2304,
    lon: 121.4737,
    year: 2040,
    offsets: { temp: 1.5, tempRise: 0.7, seaLevel: 1.4, population: 0.029, popGrowth: 1.03 },
    details: {
      climate: "Deep-water flood locks. Automated dike barriers. Subsidence compensators.",
      energy: "Offshore mega-wind. Modular thorium reactors. Kinetic pathway grids.",
      satellites: "Maglev route guides. Autonomous drone traffic coordination nets.",
      biodiversity: "Vertical urban wetlands. Sponge-city parks. Bio-engineered soil."
    }
  },
  {
    name: 'Islamabad',
    country: 'Pakistan',
    lat: 33.6844,
    lon: 73.0479,
    year: 2040,
    offsets: { temp: 1.0, tempRise: 1.0, seaLevel: 0, population: 0.003, popGrowth: 1.14 },
    details: {
      climate: "Foothill microclimate shields. Glacier runoff regulators. Cloud sensors.",
      energy: "Hydroelectric micro-turbines. High-altitude solar. Biogas loops.",
      satellites: "Himalayan ice-melt radars. Forestry density mapping swarms.",
      biodiversity: "Margalla Hills eco-link. Reforestation corridors. Terraced gardens."
    }
  },
  {
    name: 'Riyadh',
    country: 'Saudi Arabia',
    lat: 24.7136,
    lon: 46.6753,
    year: 2040,
    offsets: { temp: 8.0, tempRise: 1.3, seaLevel: 0, population: 0.009, popGrowth: 1.10 },
    details: {
      climate: "Thermal shielding canopies. Deep aquifer pumps. Desal water channels.",
      energy: "Neom-tied hypergrids. Concentrated solar fields. Geothermal cooling.",
      satellites: "Ground moisture radars. Drone delivery satellite flight guidance.",
      biodiversity: "Wadi Hanifa bio-buffers. Arid planting parks. Smart date palms."
    }
  },
  {
    name: 'Moscow',
    country: 'Russia',
    lat: 55.7558,
    lon: 37.6173,
    year: 2040,
    offsets: { temp: -4.5, tempRise: 0.7, seaLevel: 0, population: 0.014, popGrowth: 1.01 },
    details: {
      climate: "Sub-zero grid buffers. Heated drone pathways. Permafrost telemetry.",
      energy: "Compact fusion plants. Nuclear thermal grid. Solar heat traps.",
      satellites: "Arctic logistics satellite guides. Northern route tracking systems.",
      biodiversity: "Taiga buffer corridors. Sub-zero urban biomes. Pine micro-parks."
    }
  },
  {
    name: 'Hyderabad',
    country: 'India',
    lat: 17.3850,
    lon: 78.4867,
    year: 2040,
    offsets: { temp: 3.1, tempRise: 1.0, seaLevel: 0, population: 0.011, popGrowth: 1.10 },
    details: {
      climate: "Arid land greening. Waste water bio-reactors. Smart shading canopies.",
      energy: "Biomass energy conversion. Distributed solar blocks. Kinetic roads.",
      satellites: "Agricultural moisture telemetry. Urban expansion tracking arrays.",
      biodiversity: "Pharmaceutical bio-domes. Smart botanical parks. Urban trees."
    }
  },
  {
    name: 'Chennai',
    country: 'India',
    lat: 13.0827,
    lon: 80.2707,
    year: 2040,
    offsets: { temp: 3.8, tempRise: 0.9, seaLevel: 1.3, population: 0.012, popGrowth: 1.06 },
    details: {
      climate: "Desalination hyper-plants. Water recycling grids. Seawall telemetry.",
      energy: "Ocean thermal energy conversion. Solar grids. Hydrogen fuel depots.",
      satellites: "Sea-surface temp radars. Coastal erosion monitoring swarms.",
      biodiversity: "Estuary restoration. Wetland bio-filters. Smart dune grass walls."
    }
  },
  {
    name: 'Kolkata',
    country: 'India',
    lat: 22.5726,
    lon: 88.3639,
    year: 2040,
    offsets: { temp: 2.2, tempRise: 0.8, seaLevel: 1.7, population: 0.016, popGrowth: 1.05 },
    details: {
      climate: "Sunderbans buffer walls. Delta flood alert nodes. River level sensors.",
      energy: "Bio-gas digesters. Solar river-barges. Local wind arrays.",
      satellites: "River silt telemetry. High-precision storm path prediction sats.",
      biodiversity: "Mangrove replanting zones. Wetland conservation. Urban bird havens."
    }
  },
  {
    name: 'Ahmedabad',
    country: 'India',
    lat: 23.0225,
    lon: 72.5714,
    year: 2040,
    offsets: { temp: 4.2, tempRise: 1.1, seaLevel: 0, population: 0.009, popGrowth: 1.09 },
    details: {
      climate: "Sabarmati riverfront bio-filters. Cool corridors. Urban shade meshes.",
      energy: "Canal-top solar systems. High-capacity battery storage. Grid nodes.",
      satellites: "Urban heat island radars. Green cover density spectral mapping.",
      biodiversity: "Native mini-forests. Green river buffers. Urban rooftop farms."
    }
  },
  {
    name: 'Lagos',
    country: 'Nigeria',
    lat: 6.5244,
    lon: 3.3792,
    year: 2040,
    offsets: { temp: 2.5, tempRise: 0.9, seaLevel: 1.5, population: 0.028, popGrowth: 1.13 },
    details: {
      climate: "Lagoon barrier locks. Shoreline sea walls. Wetland drainage pumps.",
      energy: "Tidal kinetic systems. Solar canopy structures. Local biogas loops.",
      satellites: "Coastal erosion mapping. Dense cargo drone corridor guides.",
      biodiversity: "Lagoon mangrove buffers. Hydroponic urban gardens. Floating parklands."
    }
  },
  {
    name: 'Cairo',
    country: 'Egypt',
    lat: 30.0444,
    lon: 31.2357,
    year: 2040,
    offsets: { temp: 4.8, tempRise: 1.2, seaLevel: 0.6, population: 0.025, popGrowth: 1.11 },
    details: {
      climate: "Desert heat shields. Nile water flow governors. Cool plazas.",
      energy: "Solar canal grids. Desert photo fields. Waste biomass generators.",
      satellites: "Desertification mapping. Urban temperature radar grids.",
      biodiversity: "Nile river banks rewilding. Drought-tolerant tree lines. Pocket gardens."
    }
  },
  {
    name: 'Jakarta',
    country: 'Indonesia',
    lat: -6.2088,
    lon: 106.8456,
    year: 2040,
    offsets: { temp: 2.0, tempRise: 0.8, seaLevel: 1.9, population: 0.015, popGrowth: 1.07 },
    details: {
      climate: "Giant seawall defenses. Subsidence hydraulic pumps. Floodways.",
      energy: "Offshore tidal systems. Rooftop solar layers. Local biomass reactors.",
      satellites: "Sea state radars. Urban subsidence telemetry arrays.",
      biodiversity: "Mangrove delta blocks. Urban parkland restoration. Floating gardens."
    }
  },
  {
    name: 'Manila',
    country: 'Philippines',
    lat: 14.5995,
    lon: 120.9842,
    year: 2040,
    offsets: { temp: 2.2, tempRise: 0.7, seaLevel: 1.6, population: 0.016, popGrowth: 1.06 },
    details: {
      climate: "Storm gates. Seawall flood locks. Hydro runoff collectors.",
      energy: "Ocean wave dynamos. Decentralized solar grids. Hydrogen depots.",
      satellites: "Typhoon tracking telemetry. Coastal flood alert networks.",
      biodiversity: "Coastal estuary buffers. Biophilic parklands. Mangrove walls."
    }
  },
  {
    name: 'Dhaka',
    country: 'Bangladesh',
    lat: 23.8103,
    lon: 90.4125,
    year: 2040,
    offsets: { temp: 2.6, tempRise: 1.0, seaLevel: 1.2, population: 0.028, popGrowth: 1.10 },
    details: {
      climate: "Monsoon bypass locks. Delta flood containment. Hydraulic pumps.",
      energy: "Solar rooftops. Neighborhood biogas blocks. Small wind arrays.",
      satellites: "Riverbed sedimentation radar. Storm tracking satellite nets.",
      biodiversity: "Water purification parks. Mangrove buffers. Floating crop beds."
    }
  },
  {
    name: 'Chongqing',
    country: 'China',
    lat: 29.5630,
    lon: 106.5516,
    year: 2040,
    offsets: { temp: 3.5, tempRise: 1.0, seaLevel: 0, population: 0.038, popGrowth: 1.08 },
    details: {
      climate: "Mountain wind ventilation channels. Subterranean cool loops. Water grids.",
      energy: "River kinetic turbines. Hydroelectric stations. Smart micro-grids.",
      satellites: "Dense drone traffic guidelines. Mountain air temperature radars.",
      biodiversity: "Vertical cliff gardens. Terraced biophilic structures. Green bridges."
    }
  },
  {
    name: 'Kinshasa',
    country: 'Congo',
    lat: -4.4419,
    lon: 15.2663,
    year: 2040,
    offsets: { temp: 2.4, tempRise: 0.9, seaLevel: 0, population: 0.029, popGrowth: 1.18 },
    details: {
      climate: "Congo river regulators. Aquifer infiltration wells. Soil guards.",
      energy: "Hydroelectric turbines. High-efficiency solar towers. Biogas plants.",
      satellites: "Forest canopy tracking radars. Wildlife tracking swarm arrays.",
      biodiversity: "River forestation reserves. Rain forest buffers. Vertical farming."
    }
  },
  {
    name: 'Karachi',
    country: 'Pakistan',
    lat: 24.8607,
    lon: 67.0011,
    year: 2040,
    offsets: { temp: 4.1, tempRise: 1.2, seaLevel: 1.1, population: 0.026, popGrowth: 1.11 },
    details: {
      climate: "Heatwave mitigation cells. Coastal seawall blocks. Desal channels.",
      energy: "Desert solar generators. Wind corridor farms. Floating ocean wind.",
      satellites: "Heat island spectral telemetry. Sea level tracking radars.",
      biodiversity: "Mangrove tidal corridors. Desert green parks. Biophilic rooftops."
    }
  },
  {
    name: 'Shenzhen',
    country: 'China',
    lat: 22.5431,
    lon: 114.0579,
    year: 2040,
    offsets: { temp: 1.8, tempRise: 0.7, seaLevel: 1.3, population: 0.020, popGrowth: 1.04 },
    details: {
      climate: "Storm surge barrier nets. Subway water gates. Subsidence monitors.",
      energy: "Thorium reactor loops. Building solar glass. Kinetic pavements.",
      satellites: "Maglev system trackers. Drone delivery navigation beams.",
      biodiversity: "Sponge-city parks. High-rise garden bridges. Oyster shell walls."
    }
  },
  {
    name: 'Hong Kong',
    country: 'China',
    lat: 22.3193,
    lon: 114.1694,
    year: 2030,
    offsets: { temp: 1.5, tempRise: 0.6, seaLevel: 1.5, population: 0.008, popGrowth: 1.02 },
    details: {
      climate: "Coastal seawalls. Flood protection channels. Smart storm surge gates.",
      energy: "Offshore wind turbines. Building solar paint. Smart grid integration.",
      satellites: "Maritime shipping lane trackers. Weather radar beacons.",
      biodiversity: "Vertical gardens. Urban parks. Artificial reef restoration."
    }
  },
  {
    name: 'Mexico City',
    country: 'Mexico',
    lat: 19.4326,
    lon: -99.1332,
    year: 2040,
    offsets: { temp: 2.2, tempRise: 0.8, seaLevel: 0, population: 0.025, popGrowth: 1.05 },
    details: {
      climate: "Hydraulic aquifer recharge wells. Soil sinking sensors. Cooling nodes.",
      energy: "Solar rooftops. Biogas converters. Neighborhood battery pools.",
      satellites: "Subsidence radar telemetry. Rainstorm tracking satellite nets.",
      biodiversity: "Lacustrine marsh rewilding. Rooftop pocket farms. Green corridors."
    }
  },
  {
    name: 'Buenos Aires',
    country: 'Argentina',
    lat: -34.6037,
    lon: -58.3816,
    year: 2040,
    offsets: { temp: 1.2, tempRise: 0.7, seaLevel: 1.2, population: 0.017, popGrowth: 1.04 },
    details: {
      climate: "Rio de la Plata tide locks. Drainage storm tunnels. Sea gates.",
      energy: "Wind farm networks. Solar infrastructure tiles. Local hydro nets.",
      satellites: "Estuary silt radars. Storm path prediction networks.",
      biodiversity: "Pampa grassland reserves. Wetland bio-filters. Biophilic squares."
    }
  },
  {
    name: 'Reykjavik',
    country: 'Iceland',
    lat: 64.1466,
    lon: -21.9426,
    year: 2040,
    offsets: { temp: -4.0, tempRise: 0.5, seaLevel: 0.9, population: 0.001, popGrowth: 1.03 },
    details: {
      climate: "Glacial runoff containment. Thermal district heating. Ocean locks.",
      energy: "Geothermal steam dynamos. Hydro stations. Hydrogen production.",
      satellites: "Arctic ice shelf radars. Volcanic ash flight path sensors.",
      biodiversity: "Tundra reforestation loops. Arctic greenhouse grids. Marine reserves."
    }
  },

  // ─── 2050 CITIES (36 CITIES) ───────────────────────────────────────────────
  {
    name: 'Neom',
    country: 'Saudi Arabia',
    lat: 28.2917,
    lon: 34.6250,
    year: 2050,
    offsets: { temp: 7.5, tempRise: 1.1, seaLevel: 0.5, population: 0.005, popGrowth: 1.15 },
    details: {
      climate: "Mirrored surface shields. Desalination brine processors. Wind gates.",
      energy: "Hydrogen fusion core. Desert solar grids. Solar tower complexes.",
      satellites: "Autonomous pod coordinate guides. Laser power transmission beams.",
      biodiversity: "Desert biomes. Sub-surface agriculture. Mangrove salt farms."
    }
  },
  {
    name: 'Masdar City',
    country: 'UAE',
    lat: 24.4372,
    lon: 54.6186,
    year: 2050,
    offsets: { temp: 7.8, tempRise: 1.0, seaLevel: 0.6, population: 0.001, popGrowth: 1.10 },
    details: {
      climate: "Wind tower cooling tunnels. Thermal shield canopies. Water recycle loops.",
      energy: "Photovoltaic farm cells. Hydrogen production plants. Kinetic roads.",
      satellites: "Microclimate thermal grids. Ground sand sensors.",
      biodiversity: "Biosphere biodomes. Arid plant sanctuaries. Vertical farms."
    }
  },
  {
    name: 'Songdo',
    country: 'South Korea',
    lat: 37.3826,
    lon: 126.6548,
    year: 2050,
    offsets: { temp: -0.6, tempRise: 0.7, seaLevel: 1.1, population: 0.002, popGrowth: 1.02 },
    details: {
      climate: "Smart water recycling channels. Coastal flood valves. Wind tunnels.",
      energy: "Microgrid thorium feeds. Smart window cells. Fuel cell arrays.",
      satellites: "Autonomous transit nodes. Air spectral quality beacons.",
      biodiversity: "Sponge central parks. Biophilic rooftops. Tidal wetlands."
    }
  },
  {
    name: 'Forest City',
    country: 'Malaysia',
    lat: 1.3411,
    lon: 103.5855,
    year: 2050,
    offsets: { temp: 2.6, tempRise: 0.6, seaLevel: 1.5, population: 0.001, popGrowth: 1.06 },
    details: {
      climate: "Sea defense dikes. Rainwater filters. Air cooling corridors.",
      energy: "Floating solar modules. Tidal kinetic setups. Local battery banks.",
      satellites: "Coastal reef health cameras. Maritime transit sensors.",
      biodiversity: "Vertical forest towers. Mangrove buffers. Seagrass nurseries."
    }
  },
  {
    name: 'Oceanix Busan',
    country: 'South Korea',
    lat: 35.1796,
    lon: 129.0756,
    year: 2050,
    offsets: { temp: 0.2, tempRise: 0.6, seaLevel: 1.7, population: 0.001, popGrowth: 1.03 },
    details: {
      climate: "Floating platform stabilizers. Tidal buffers. Sea surge locks.",
      energy: "Tidal dynamos. Platform solar covers. Wave power arrays.",
      satellites: "Sea state telemetry. Platform movement beacons.",
      biodiversity: "Biorock coral nurseries. Seaweed bio-filters. Marine parks."
    }
  },
  {
    name: 'Akon City',
    country: 'Senegal',
    lat: 14.2486,
    lon: -16.8833,
    year: 2050,
    offsets: { temp: 3.2, tempRise: 1.0, seaLevel: 1.0, population: 0.003, popGrowth: 1.18 },
    details: {
      climate: "Coastal tide gates. Rainwater storage arrays. Shading structures.",
      energy: "Solar farm complexes. Biogas generators. Geothermal cooling.",
      satellites: "Decentralized trade grids. Drone navigation beacons.",
      biodiversity: "Rewilded savanna belts. Mangrove barriers. Vertical gardening."
    }
  },
  {
    name: 'Eko Atlantic',
    country: 'Nigeria',
    lat: 6.4172,
    lon: 3.4175,
    year: 2050,
    offsets: { temp: 2.4, tempRise: 0.8, seaLevel: 1.7, population: 0.005, popGrowth: 1.15 },
    details: {
      climate: "Great Wall seawall defenses. Sea surge locks. Drainage pumps.",
      energy: "Offshore tidal kinetic nodes. Canopy solar tiles. Local biogas.",
      satellites: "Coastal erosion mapping. Drone transport guides.",
      biodiversity: "Mangrove ocean nurseries. Floating parks. Coastal dune grass."
    }
  },
  {
    name: 'Telosa',
    country: 'USA',
    lat: 39.0000,
    lon: -115.0000,
    year: 2050,
    offsets: { temp: 1.8, tempRise: 1.1, seaLevel: 0, population: 0.005, popGrowth: 1.12 },
    details: {
      climate: "Aquifer recharge blocks. Water recycling arrays. Drought canopies.",
      energy: "Mojave solar grid tie. Molten salt batteries. Local wind poles.",
      satellites: "Ground moisture trackers. Autonomous transport guides.",
      biodiversity: "High-yield vertical farms. Native parklands. Wildlife trails."
    }
  },
  {
    name: 'Woven City',
    country: 'Japan',
    lat: 35.2323,
    lon: 138.9039,
    year: 2050,
    offsets: { temp: -0.4, tempRise: 0.6, seaLevel: 0, population: 0.001, popGrowth: 1.02 },
    details: {
      climate: "Smart water filtration grids. Subterranean cool loops. Shading.",
      energy: "Hydrogen fuel cells. Local solar glazing. Geothermal taps.",
      satellites: "Autonomous transport guides. Smart grid monitoring swarms.",
      biodiversity: "Native plant streets. Hydroponic farming. Urban gardens."
    }
  },
  {
    name: 'Suva',
    country: 'Fiji',
    lat: -18.1248,
    lon: 178.4501,
    year: 2050,
    offsets: { temp: 2.2, tempRise: 0.6, seaLevel: 1.8, population: 0.002, popGrowth: 1.05 },
    details: {
      climate: "Coral seawall buffers. Tidal gates. Floating platform locks.",
      energy: "Ocean wave kinetic loops. Solar canopy layers. Wind setups.",
      satellites: "Pacific sea state sensors. Reef health mapping swarms.",
      biodiversity: "Electric coral foundations. Mangrove parks. Seagrass nurseries."
    }
  },
  {
    name: 'Amsterdam',
    country: 'Netherlands',
    lat: 52.3676,
    lon: 4.9041,
    year: 2050,
    offsets: { temp: -1.2, tempRise: 0.5, seaLevel: 1.6, population: 0.002, popGrowth: 1.02 },
    details: {
      climate: "Dyke lock systems. Subterranean flood bays. Hydraulic gates.",
      energy: "Floating wind farms. Canal thermal recovery. Solar glass.",
      satellites: "Water level radars. Cycle route navigation swarms.",
      biodiversity: "Aquatic sponge parks. Green roof buildings. Eco-bridges."
    }
  },
  {
    name: 'Copenhagen',
    country: 'Denmark',
    lat: 55.6761,
    lon: 12.5683,
    year: 2050,
    offsets: { temp: -2.0, tempRise: 0.5, seaLevel: 1.3, population: 0.001, popGrowth: 1.02 },
    details: {
      climate: "Coastal storm defenses. Harbor lock system. Air vents.",
      energy: "Wind farm complexes. Biomass fuel systems. Solar roofs.",
      satellites: "Baltic ice mapping. Smart grid tracking beacons.",
      biodiversity: "Rewilded park structures. Coastal mangroves. Pocket woods."
    }
  },
  {
    name: 'Helsinki',
    country: 'Finland',
    lat: 60.1699,
    lon: 24.9384,
    year: 2050,
    offsets: { temp: -3.5, tempRise: 0.6, seaLevel: 0.8, population: 0.001, popGrowth: 1.01 },
    details: {
      climate: "Underground heat depots. Heated roads. Ocean storm gates.",
      energy: "Modular SMR reactors. Geothermal grids. Solar glass paint.",
      satellites: "Gulf ice trackers. Arctic route mapping satellites.",
      biodiversity: "Boreal forest buffers. Sub-zero biodomes. Green parks."
    }
  },
  {
    name: 'Geneva',
    country: 'Switzerland',
    lat: 46.2044,
    lon: 6.1432,
    year: 2050,
    offsets: { temp: -0.8, tempRise: 0.7, seaLevel: 0, population: 0.001, popGrowth: 1.02 },
    details: {
      climate: "Lake cooling arrays. Mountain slope guards. Water loops.",
      energy: "Hydro turbine grids. Alpine solar panels. Geothermal wells.",
      satellites: "Alpine melt telemetry. Research lab sync systems.",
      biodiversity: "Mountain forest links. Rewilded parks. Lake biophilic reefs."
    }
  },
  {
    name: 'Vancouver',
    country: 'Canada',
    lat: 49.2827,
    lon: -123.1207,
    year: 2050,
    offsets: { temp: -1.0, tempRise: 0.5, seaLevel: 1.2, population: 0.003, popGrowth: 1.04 },
    details: {
      climate: "Rainwater channels. Coastal seawall blocks. Slope shields.",
      energy: "Hydro stations. Solar window grids. Geothermal loops.",
      satellites: "Forest fire mapping. Marine transit radar arrays.",
      biodiversity: "Temperate rainforest belts. Salmon river restoration. Green roofs."
    }
  },
  {
    name: 'Cape Town',
    country: 'South Africa',
    lat: -33.9249,
    lon: 18.4241,
    year: 2050,
    offsets: { temp: 1.8, tempRise: 0.9, seaLevel: 1.2, population: 0.006, popGrowth: 1.08 },
    details: {
      climate: "Desalination nodes. Aquifer recharge loops. Sea walls.",
      energy: "Wind farm networks. Solar infrastructure. Tidal power nodes.",
      satellites: "Marine temperature cams. Drought risk tracking beacons.",
      biodiversity: "Fynbos reserves. Coastal mangrove buffers. Rewilded parks."
    }
  },
  {
    name: 'Auckland',
    country: 'New Zealand',
    lat: -36.8485,
    lon: 174.7633,
    year: 2050,
    offsets: { temp: 0.8, tempRise: 0.6, seaLevel: 1.4, population: 0.002, popGrowth: 1.05 },
    details: {
      climate: "Coastal defense locks. Storm runoffs. Salinity sensors.",
      energy: "Geothermal dynamos. Wind installations. Ocean wave kinetic.",
      satellites: "Pacific weather radar. Coastal erosion monitors.",
      biodiversity: "Native forest trails. Coastal estuary parks. Marine reefs."
    }
  },
  {
    name: 'Anchorage',
    country: 'USA',
    lat: 61.2181,
    lon: -149.9003,
    year: 2050,
    offsets: { temp: -5.5, tempRise: 0.6, seaLevel: 0.8, population: 0.001, popGrowth: 1.03 },
    details: {
      climate: "Sub-zero grid loops. Glacier melt filters. Permafrost monitors.",
      energy: "SMR reactors. Wind installations. High-altitude solar.",
      satellites: "Arctic route trackers. Glacier density spectral mapping.",
      biodiversity: "Taiga park links. Sub-zero greenhouses. Pine reserves."
    }
  },
  {
    name: 'Tromsø',
    country: 'Norway',
    lat: 69.6492,
    lon: 18.9553,
    year: 2050,
    offsets: { temp: -5.0, tempRise: 0.5, seaLevel: 0.7, population: 0.001, popGrowth: 1.02 },
    details: {
      climate: "Snow locks. Heated drone paths. Sea level dikes.",
      energy: "Hydro stations. Deep wind installations. Geothermal wells.",
      satellites: "Northern lights telemetry. Arctic cargo route guides.",
      biodiversity: "Tundra reserves. Sub-zero bio-domes. Marine sanctuaries."
    }
  },
  {
    name: 'Lima',
    country: 'Peru',
    lat: -12.0464,
    lon: -77.0428,
    year: 2050,
    offsets: { temp: 1.6, tempRise: 0.8, seaLevel: 1.2, population: 0.013, popGrowth: 1.04 },
    details: {
      climate: "Fog collectors. Desalination centers. Aqueduct loops.",
      energy: "Solar farm complexes. Wind generators. Hydrogen loops.",
      satellites: "Andean melt telemetry. Coastal temp mapping radars.",
      biodiversity: "Arid plant reserves. Coastal wetland parks. Pocket gardens."
    }
  },
  {
    name: 'Casablanca',
    country: 'Morocco',
    lat: 33.5731,
    lon: -7.5898,
    year: 2050,
    offsets: { temp: 2.8, tempRise: 1.0, seaLevel: 1.1, population: 0.005, popGrowth: 1.07 },
    details: {
      climate: "Seawall gates. Solar shade structures. Desal channels.",
      energy: "Concentrated solar fields. Wind arrays. Hydrogen depots.",
      satellites: "Saharan sand sensors. Coastal erosion monitors.",
      biodiversity: "Saharan buffer forest. Coastal mangrove arrays. Green plazas."
    }
  },
  {
    name: 'Honolulu',
    country: 'USA',
    lat: 21.3069,
    lon: -157.8583,
    year: 2050,
    offsets: { temp: 2.2, tempRise: 0.6, seaLevel: 1.7, population: 0.001, popGrowth: 1.04 },
    details: {
      climate: "Wave wall defenses. Salinity sensors. Drainage blocks.",
      energy: "Wave kinetic systems. Building solar paint. Wind arrays.",
      satellites: "Pacific storm trackers. Reef health radars.",
      biodiversity: "Electric coral arrays. Mangrove restoration. Native parks."
    }
  },
  {
    name: 'Nuuk',
    country: 'Greenland',
    lat: 64.1743,
    lon: -51.7373,
    year: 2050,
    offsets: { temp: -4.8, tempRise: 0.5, seaLevel: 0.8, population: 0.001, popGrowth: 1.05 },
    details: {
      climate: "Glacial runoff containment. Heated paths. Storm gates.",
      energy: "Hydro stations. Wind generators. Geothermal setups.",
      satellites: "Ice shelf radars. Arctic route trackers.",
      biodiversity: "Tundra reserves. Arctic greenhouse grids. Marine parks."
    }
  },
  {
    name: 'Svalbard Dome',
    country: 'Norway',
    lat: 78.2232,
    lon: 15.6267,
    year: 2050,
    offsets: { temp: -7.5, tempRise: 0.4, seaLevel: 0.5, population: 0.001, popGrowth: 1.02 },
    details: {
      climate: "Permafrost cooling shields. Global seed vault buffers. Air blocks.",
      energy: "Small modular reactors. Wind installations. Geothermal wells.",
      satellites: "Arctic logistics guides. Glacier monitoring spectral cams.",
      biodiversity: "Seed vault research dome. Sub-zero botanical lab. Tundra parks."
    }
  },
  {
    name: 'Saharan Oasis Node',
    country: 'Egypt',
    lat: 26.0000,
    lon: 28.0000,
    year: 2050,
    offsets: { temp: 7.2, tempRise: 1.1, seaLevel: 0, population: 0.001, popGrowth: 1.12 },
    details: {
      climate: "Solar shade meshes. Deep aquifer wells. Atmospheric loops.",
      energy: "Solar canal systems. Molten salt panels. Wind columns.",
      satellites: "Desert moisture tracking. Ground sandstorm alert nets.",
      biodiversity: "Genetically engineered forest. Arid planting blocks. Date palms."
    }
  },
  {
    name: 'Great Green Node',
    country: 'Senegal',
    lat: 15.0000,
    lon: -15.0000,
    year: 2050,
    offsets: { temp: 3.5, tempRise: 1.0, seaLevel: 0, population: 0.002, popGrowth: 1.15 },
    details: {
      climate: "Saharan buffer locks. Aquifer recharge loops. Shade structures.",
      energy: "Solar field generators. Biogas loops. Kinetic networks.",
      satellites: "Forest canopy scanners. Ground moisture spectral cams.",
      biodiversity: "Green wall tree loops. Savanna rewilding zones. Pocket farms."
    }
  },
  {
    name: 'Amazon Reclaim Center',
    country: 'Brazil',
    lat: -3.0000,
    lon: -60.0000,
    year: 2050,
    offsets: { temp: 2.0, tempRise: 0.8, seaLevel: 0, population: 0.002, popGrowth: 1.06 },
    details: {
      climate: "Rainforest moisture locks. Soil erosion regulators. Cool blocks.",
      energy: "Solar canal arrays. Biomass generators. Local hydro nets.",
      satellites: "Deforestation radar swarms. Species bio-telemetry nets.",
      biodiversity: "Amazon replanting zones. Wildlife corridors. Seed banks."
    }
  },
  {
    name: 'Tesla Colony One',
    country: 'USA',
    lat: 37.2431,
    lon: -115.7930,
    year: 2050,
    offsets: { temp: 3.2, tempRise: 1.0, seaLevel: 0, population: 0.003, popGrowth: 1.10 },
    details: {
      climate: "Desert microclimate shields. Closed water loops. Cool blocks.",
      energy: "Solar tracking arrays. Super battery banks. Fusion cell core.",
      satellites: "Grid stability scanners. Self-driving transport relays.",
      biodiversity: "Hydroponic farm domes. Desert plant preserves. Eco-parks."
    }
  },
  {
    name: 'Pacific Gyre Platform',
    country: 'Global Grid',
    lat: 35.0000,
    lon: -140.0000,
    year: 2050,
    offsets: { temp: 1.5, tempRise: 0.5, seaLevel: 2.0, population: 0.001, popGrowth: 1.02 },
    details: {
      climate: "Ocean platform stabilizers. Storm dikes. Wave locks.",
      energy: "Wave kinetic turbines. Solar cover arrays. Ocean wind.",
      satellites: "Pacific weather telemetry. Platform sync guides.",
      biodiversity: "Plastic filter bio-systems. Fish nursery reefs. Seaweed farms."
    }
  },
  {
    name: 'Antarctic Research Hub',
    country: 'Global Grid',
    lat: -75.2504,
    lon: 0.0000,
    year: 2050,
    offsets: { temp: -9.5, tempRise: 0.4, seaLevel: 0.2, population: 0.001, popGrowth: 1.01 },
    details: {
      climate: "Thermal shield domes. Ice shelf telemetry. Sub-zero loops.",
      energy: "Modular fusion reactors. Wind installations. Heat grids.",
      satellites: "Glacier density scanners. Southern ocean mapping swarms.",
      biodiversity: "Seed vault libraries. Sub-zero botanical labs. Marine reserves."
    }
  },
  {
    name: 'Munich',
    country: 'Germany',
    lat: 48.1351,
    lon: 11.5820,
    year: 2050,
    offsets: { temp: -1.2, tempRise: 0.6, seaLevel: 0, population: 0.003, popGrowth: 1.02 },
    details: {
      climate: "River flood bypass tunnels. Evaporative cooling swales. Cooling grids.",
      energy: "Geothermal grid wells. Rooftop solar panels. Biogas plants.",
      satellites: "Transit telemetry guides. Drone mapping beacons.",
      biodiversity: "Isar river rewilding. Roof garden towers. Native tree lines."
    }
  },
  {
    name: 'Lisbon',
    country: 'Portugal',
    lat: 38.7223,
    lon: -9.1393,
    year: 2050,
    offsets: { temp: 1.8, tempRise: 0.8, seaLevel: 1.3, population: 0.002, popGrowth: 1.04 },
    details: {
      climate: "Tagus surge gates. Seawall salinity sensors. Slope guards.",
      energy: "Tidal kinetic systems. Solar canopy arrays. Wave power.",
      satellites: "Ocean current tracking. Coastal erosion monitors.",
      biodiversity: "River estuary buffers. Coastal dune restoration. Urban parks."
    }
  },
  {
    name: 'Dublin',
    country: 'Ireland',
    lat: 53.3498,
    lon: -6.2603,
    year: 2050,
    offsets: { temp: -1.0, tempRise: 0.5, seaLevel: 1.4, population: 0.002, popGrowth: 1.03 },
    details: {
      climate: "Liffey flood gates. Storm surge dikes. Drainage channels.",
      energy: "Offshore wind generators. Wave kinetic arrays. Solar slate.",
      satellites: "Irish sea state radar. Smart grid telemetry trackers.",
      biodiversity: "Rewilded peat bog parks. Coastal grass buffer dunes. Pocket forests."
    }
  },
  {
    name: 'Stockholm',
    country: 'Sweden',
    lat: 59.3293,
    lon: 18.0686,
    year: 2050,
    offsets: { temp: -2.8, tempRise: 0.6, seaLevel: 0.9, population: 0.002, popGrowth: 1.02 },
    details: {
      climate: "Archipelago locks. Heated paths. Storm gates.",
      energy: "District heating networks. Thorium micro-feeds. Solar glass.",
      satellites: "Baltic ice radars. Transit tracking guides.",
      biodiversity: "Water sponge parks. Biophilic rooftops. Marine reserves."
    }
  },
  {
    name: 'Oslo',
    country: 'Norway',
    lat: 59.9139,
    lon: 10.7522,
    year: 2050,
    offsets: { temp: -3.2, tempRise: 0.5, seaLevel: 0.8, population: 0.001, popGrowth: 1.03 },
    details: {
      climate: "Fjord tide gates. Snowmelt buffer loops. Cool plazas.",
      energy: "Hydro stations. Waste bio-reactors. Solar glass panels.",
      satellites: "North Sea cargo guides. Forestry density scanners.",
      biodiversity: "Nordic forest corridors. Green roof squares. Fjord bio-filters."
    }
  },
  {
    name: 'Rome',
    country: 'Italy',
    lat: 41.9028,
    lon: 12.4964,
    year: 2050,
    offsets: { temp: 2.2, tempRise: 0.9, seaLevel: 0.6, population: 0.004, popGrowth: 1.02 },
    details: {
      climate: "Tiber river gates. Localized shading screens. Water grids.",
      energy: "Solar heritage tiles. Grid battery storage. Geothermal wells.",
      satellites: "Historic area sensors. Urban temperature radars.",
      biodiversity: "Historic park rewilding. Vertical garden towers. Pocket forests."
    }
  },
  {
    name: 'Pune',
    country: 'India',
    lat: 18.5204,
    lon: 73.8567,
    year: 2030,
    offsets: { temp: 2.0, tempRise: 0.9, seaLevel: 0, population: 0.007, popGrowth: 1.08 },
    details: {
      climate: "Monsoon canal regulators. Rooftop water harvest panels. Shade sails.",
      energy: "Solar parking shelters. Micro-hydro channels. Grid storage.",
      satellites: "Smart water flow telemetry. Traffic routing micro-sensors.",
      biodiversity: "Hillside forest restoration. Biophilic streetscapes. Botanical corridors."
    }
  },
  {
    name: 'Jaipur',
    country: 'India',
    lat: 26.9124,
    lon: 75.7873,
    year: 2030,
    offsets: { temp: 4.8, tempRise: 1.2, seaLevel: 0, population: 0.004, popGrowth: 1.07 },
    details: {
      climate: "Arid land shade nets. Heat shield canopies. Aquifer recharges.",
      energy: "Solar canal roofs. Molten salt generators. Microgrids.",
      satellites: "Sandstorm spectral cams. Agricultural humidity sensors.",
      biodiversity: "Desert afforestation belts. Native botanical parks. Shade trees."
    }
  },
  {
    name: 'Surat',
    country: 'India',
    lat: 21.1702,
    lon: 72.8311,
    year: 2030,
    offsets: { temp: 3.2, tempRise: 0.9, seaLevel: 1.2, population: 0.008, popGrowth: 1.09 },
    details: {
      climate: "Tapi river surge barriers. Drainage control pumps. Flood warnings.",
      energy: "Industrial rooftop solar. Wave kinetic dynamos. Local batteries.",
      satellites: "River silt mapping radars. Tidal level alert sensors.",
      biodiversity: "Mangrove estuary parks. Urban mini-forests. Green road buffers."
    }
  },
  {
    name: 'Lucknow',
    country: 'India',
    lat: 26.8467,
    lon: 80.9462,
    year: 2030,
    offsets: { temp: 4.0, tempRise: 1.1, seaLevel: 0, population: 0.004, popGrowth: 1.07 },
    details: {
      climate: "Gomti river bio-filters. Cool corridors. Shade canopy meshes.",
      energy: "Solar rooftop grids. High-capacity battery storage. Grid nodes.",
      satellites: "Urban heat island sensors. Agricultural mapping swarms.",
      biodiversity: "Eco-corridors. Native planting zones. Rooftop pocket gardens."
    }
  },
  {
    name: 'Beijing',
    country: 'China',
    lat: 39.9042,
    lon: 116.4074,
    year: 2030,
    offsets: { temp: -0.5, tempRise: 0.8, seaLevel: 0, population: 0.022, popGrowth: 1.02 },
    details: {
      climate: "Green wall dust barriers. Subterranean cool loops. Air filtration grids.",
      energy: "SMR reactors. Solar window overlays. Distributed battery hubs.",
      satellites: "Drone path flight navigation. Air quality tracking beams.",
      biodiversity: "Rewilded park structures. Urban forest buffers. Sky-gardens."
    }
  },
  {
    name: 'Guangzhou',
    country: 'China',
    lat: 23.1291,
    lon: 113.2644,
    year: 2030,
    offsets: { temp: 2.2, tempRise: 0.7, seaLevel: 1.4, population: 0.015, popGrowth: 1.04 },
    details: {
      climate: "Pearl river surge locks. Sub-surface bilge networks. Sea dikes.",
      energy: "Offshore wind generators. Tidal dynamos. Solar glass canopies.",
      satellites: "Typhoon tracking telemetry. Maritime transit radar arrays.",
      biodiversity: "Mangrove delta blocks. High-rise garden bridges. Sponge parks."
    }
  },
  {
    name: 'Chengdu',
    country: 'China',
    lat: 30.5728,
    lon: 104.0668,
    year: 2030,
    offsets: { temp: 1.5, tempRise: 0.8, seaLevel: 0, population: 0.016, popGrowth: 1.05 },
    details: {
      climate: "Basin heat dispersion canopies. Water recycle grids. Cool roofs.",
      energy: "Sichuan hydro loops. Solar highway tiles. Microgrids.",
      satellites: "Agricultural moisture tracking. Drone transit relays.",
      biodiversity: "Bamboo eco-corridors. Giant panda buffer parks. Pocket woods."
    }
  },
  {
    name: 'Wuhan',
    country: 'China',
    lat: 30.5928,
    lon: 114.3055,
    year: 2030,
    offsets: { temp: 2.0, tempRise: 0.9, seaLevel: 0, population: 0.012, popGrowth: 1.04 },
    details: {
      climate: "Yangtze flood drainage locks. Urban shade meshes. Temp sensors.",
      energy: "River kinetic turbines. Hydroelectric stations. Local battery banks.",
      satellites: "Riverbed sedimentation radar. Transit mapping beacons.",
      biodiversity: "Wetland conservation parks. Rooftop vegetation nodes. Mini-forests."
    }
  },
  {
    name: 'Hangzhou',
    country: 'China',
    lat: 30.2741,
    lon: 120.1551,
    year: 2030,
    offsets: { temp: 1.6, tempRise: 0.7, seaLevel: 0.8, population: 0.010, popGrowth: 1.03 },
    details: {
      climate: "West lake water filters. Smart canal regulators. Cool plazas.",
      energy: "Building solar paint. Neighborhood microgrids. Kinetic paths.",
      satellites: "Autonomous pod coordinate guides. Air quality sensors.",
      biodiversity: "West lake bio-buffers. Vertical garden towers. Tea field parks."
    }
  },
  {
    name: 'Osaka',
    country: 'Japan',
    lat: 34.6937,
    lon: 135.5022,
    year: 2030,
    offsets: { temp: 0.2, tempRise: 0.7, seaLevel: 1.3, population: 0.019, popGrowth: 1.01 },
    details: {
      climate: "Bay area surge gates. Subway water lock gates. Seawall nets.",
      energy: "Tidal kinetic arrays. Offshore wind loops. Building solar glass.",
      satellites: "Maritime channel radars. Transit traffic sync systems.",
      biodiversity: "Coastal parkland rewilding. Sponge-city structures. Green roof towers."
    }
  },
  {
    name: 'Nagoya',
    country: 'Japan',
    lat: 35.1815,
    lon: 136.9066,
    year: 2030,
    offsets: { temp: 0.1, tempRise: 0.8, seaLevel: 1.2, population: 0.009, popGrowth: 1.01 },
    details: {
      climate: "Port flood bypass networks. Heat dome shields. Seawall monitors.",
      energy: "Thorium reactor interlinks. Solar roofing slate. Microgrids.",
      satellites: "Drone path routing beacons. High-precision weather radars.",
      biodiversity: "Green highway corridors. Native planting trails. Bird parks."
    }
  },
  {
    name: 'Fukuoka',
    country: 'Japan',
    lat: 33.5902,
    lon: 130.4017,
    year: 2030,
    offsets: { temp: 0.5, tempRise: 0.7, seaLevel: 1.1, population: 0.005, popGrowth: 1.02 },
    details: {
      climate: "Coastal seawall sensor matrix. Local vents. Flood locks.",
      energy: "Offshore deep-wind corridors. Kinetic path generation. Solar tiles.",
      satellites: "Congestion monitoring beacons. Marine telemetry radars.",
      biodiversity: "Vertical garden facades. Coral reef electrical nurseries. Parks."
    }
  },
  {
    name: 'Busan',
    country: 'South Korea',
    lat: 35.1796,
    lon: 129.0756,
    year: 2030,
    offsets: { temp: 0.2, tempRise: 0.6, seaLevel: 1.6, population: 0.003, popGrowth: 1.02 },
    details: {
      climate: "Floating platform stabilizers. Tidal buffers. Sea surge locks.",
      energy: "Tidal dynamos. Platform solar covers. Wave power arrays.",
      satellites: "Sea state telemetry. Platform movement beacons.",
      biodiversity: "Biorock coral nurseries. Seaweed bio-filters. Marine parks."
    }
  },
  {
    name: 'Incheon',
    country: 'South Korea',
    lat: 37.4563,
    lon: 126.7052,
    year: 2030,
    offsets: { temp: -0.4, tempRise: 0.7, seaLevel: 1.2, population: 0.003, popGrowth: 1.02 },
    details: {
      climate: "Smart water recycling channels. Tidal valves. Wind tunnels.",
      energy: "Microgrid thorium feeds. Smart window cells. Fuel cells.",
      satellites: "Autonomous transit nodes. Air spectral quality beacons.",
      biodiversity: "Sponge central parks. Biophilic rooftops. Tidal wetlands."
    }
  },
  {
    name: 'Abu Dhabi',
    country: 'UAE',
    lat: 24.4539,
    lon: 54.3773,
    year: 2030,
    offsets: { temp: 8.0, tempRise: 1.2, seaLevel: 0.7, population: 0.002, popGrowth: 1.12 },
    details: {
      climate: "Desalination hyper-plants. Shading canopies. Aquifer recharges.",
      energy: "Desert solar complexes. Concentrated solar power. Hydrogen loop.",
      satellites: "Sandstorm spectral warning radars. Drone delivery relays.",
      biodiversity: "Mangrove salt farms. Coastal coral electric arrays. Parks."
    }
  },
  {
    name: 'Doha',
    country: 'Qatar',
    lat: 25.2854,
    lon: 51.5310,
    year: 2030,
    offsets: { temp: 8.2, tempRise: 1.3, seaLevel: 0.6, population: 0.003, popGrowth: 1.10 },
    details: {
      climate: "Air cooling vents. Cloud-seeding towers. Desal channels.",
      energy: "Desert solar grids. CSP receiver towers. Hydrogen microgrids.",
      satellites: "Maritime channel radars. Sandstorm warning beams.",
      biodiversity: "Coastal reef grids. Desert pocket parks. Date palms."
    }
  },
  {
    name: 'Kuwait City',
    country: 'Kuwait',
    lat: 29.3759,
    lon: 47.9774,
    year: 2030,
    offsets: { temp: 8.8, tempRise: 1.4, seaLevel: 0.5, population: 0.003, popGrowth: 1.08 },
    details: {
      climate: "Desert heat shields. Localized cooling structures. Aquifers.",
      energy: "Solar canal grids. Photo fields. Distributed batteries.",
      satellites: "Precipitation radar nodes. Deforestation spectral telemetry.",
      biodiversity: "Desert forestry. Drought-tolerant tree lines. Mini-parks."
    }
  },
  {
    name: 'Madrid',
    country: 'Spain',
    lat: 40.4168,
    lon: -3.7038,
    year: 2030,
    offsets: { temp: 2.0, tempRise: 0.8, seaLevel: 0, population: 0.006, popGrowth: 1.02 },
    details: {
      climate: "Urban shade canopies. Heatwave cooling plazas. Aqueduct loops.",
      energy: "Solar rooftop arrays. Distributed storage battery hubs. Microgrids.",
      satellites: "Agricultural moisture monitors. Drone corridor guides.",
      biodiversity: "Linear forest corridors. Green rooftops. Urban pocket parks."
    }
  },
  {
    name: 'Zurich',
    country: 'Switzerland',
    lat: 47.3769,
    lon: 8.5417,
    year: 2030,
    offsets: { temp: -1.0, tempRise: 0.5, seaLevel: 0, population: 0.001, popGrowth: 1.01 },
    details: {
      climate: "Lake cooling loops. Mountain slope shields. Water reclaims.",
      energy: "Hydro turbine stations. Alpine solar panels. Geothermal wells.",
      satellites: "Alpine melt telemetry. Research sync systems.",
      biodiversity: "Mountain forest links. Rewilded parks. Lake biophilic reefs."
    }
  },
  {
    name: 'Washington DC',
    country: 'USA',
    lat: 38.9072,
    lon: -77.0369,
    year: 2030,
    offsets: { temp: 1.0, tempRise: 0.8, seaLevel: 1.2, population: 0.005, popGrowth: 1.03 },
    details: {
      climate: "Potomac surge gates. Subway bilge networks. Sea dikes.",
      energy: "Skyscraper solar paint. Distributed battery hubs. Solar roofs.",
      satellites: "Grid stability scanners. Self-driving transport relays.",
      biodiversity: "Urban pocket parks. Eco-bridge crossings. Green belt buffers."
    }
  },
  {
    name: 'Boston',
    country: 'USA',
    lat: 42.3601,
    lon: -71.0589,
    year: 2030,
    offsets: { temp: -1.0, tempRise: 0.6, seaLevel: 1.3, population: 0.004, popGrowth: 1.02 },
    details: {
      climate: "Harbor surge gates. Coastal seawalls. Flood sensors.",
      energy: "Atlantic wind array. Geothermal loops. Building solar glass.",
      satellites: "Great Lakes ice mapping. Great Lakes freight tracking beacons.",
      biodiversity: "Estuary restoration. Oyster reef grids. Green rooftops."
    }
  },
  {
    name: 'Chicago',
    country: 'USA',
    lat: 41.8781,
    lon: -87.6298,
    year: 2030,
    offsets: { temp: -1.5, tempRise: 0.7, seaLevel: 0, population: 0.009, popGrowth: 1.02 },
    details: {
      climate: "Lake cooling loops. Snowmelt collection tanks. Drainage swales.",
      energy: "SMR reactors. Wind installations. Local battery pools.",
      satellites: "Transit telemetry guides. Drone mapping beacons.",
      biodiversity: "Forest expansion corridors. Green rooftops. Bee trails."
    }
  },
  {
    name: 'San Francisco',
    country: 'USA',
    lat: 37.7749,
    lon: -122.4194,
    year: 2030,
    offsets: { temp: 0.5, tempRise: 0.6, seaLevel: 1.3, population: 0.003, popGrowth: 1.03 },
    details: {
      climate: "Bay surge barrier gates. Sea level rise sensors. Subterranean floodways.",
      energy: "Tidal kinetic loops. Skyscraper solar paint. Hydrogen grids.",
      satellites: "Grid stability telemetry. Autonomous transit mapping nets.",
      biodiversity: "Rewilded parks. Marine sanctuaries. Rooftop pocket farms."
    }
  },
  {
    name: 'Seattle',
    country: 'USA',
    lat: 47.6062,
    lon: -122.3321,
    year: 2030,
    offsets: { temp: -0.5, tempRise: 0.5, seaLevel: 1.1, population: 0.004, popGrowth: 1.04 },
    details: {
      climate: "Rainwater channels. Slope stabilization shields. Sea wall dikes.",
      energy: "Hydroelectric micro-turbines. Solar glass panels. Geothermal taps.",
      satellites: "Forest fire mapping. Marine transit radar arrays.",
      biodiversity: "Temperate forest belts. Salmon river restoration. Green roofs."
    }
  },
  {
    name: 'Austin',
    country: 'USA',
    lat: 30.2672,
    lon: -97.7431,
    year: 2030,
    offsets: { temp: 3.5, tempRise: 1.1, seaLevel: 0, population: 0.002, popGrowth: 1.10 },
    details: {
      climate: "Aquifer infiltration wells. Soil guards. Cooling nodes.",
      energy: "Mojave solar grid tie. Concentrated solar. Storage batteries.",
      satellites: "Precipitation radar nodes. Smart grid tracking beacons.",
      biodiversity: "High-yield vertical farms. Native parklands. Pocket woods."
    }
  },
  {
    name: 'Istanbul',
    country: 'Turkey',
    lat: 41.0082,
    lon: 28.9784,
    year: 2030,
    offsets: { temp: 1.0, tempRise: 0.8, seaLevel: 1.1, population: 0.016, popGrowth: 1.05 },
    details: {
      climate: "Bosphorus tidal barriers. Smart urban storm filters. Thermal monitoring network.",
      energy: "Tidal flow kinetic arrays. Rooftop solar meshes. Waste-to-energy conversion systems.",
      satellites: "Maritime logistics tracking. Trans-continental optical data bridges.",
      biodiversity: "Urban pocket parks. Coastal marine life nurseries. Rooftop honeybee trails."
    }
  },
  {
    name: 'Melbourne',
    country: 'Australia',
    lat: -37.8136,
    lon: 144.9631,
    year: 2030,
    offsets: { temp: 0.5, tempRise: 0.7, seaLevel: 1.2, population: 0.005, popGrowth: 1.04 },
    details: {
      climate: "Stormwater bio-retention basins. Urban heat island cooling corridors. Coastal dikes.",
      energy: "Offshore Bass Strait wind farms. Residential solar batteries. Smart microgrid controls.",
      satellites: "Ecological forest canopy scanners. Coastal erosion radar telemetry.",
      biodiversity: "Native flora pocket woodlands. Yarra river corridor restoration. Green roofs."
    }
  },
  {
    name: 'Johannesburg',
    country: 'South Africa',
    lat: -26.2041,
    lon: 28.0473,
    year: 2030,
    offsets: { temp: 1.5, tempRise: 0.9, seaLevel: 0, population: 0.006, popGrowth: 1.06 },
    details: {
      climate: "Aquifer recharge shafts. Smart municipal water recycling. Soil stabilization zones.",
      energy: "High-yield solar fields. Neighborhood smart grid rings. Biomass recovery systems.",
      satellites: "High-accuracy lightning tracking. Regional resource mapping orbital beams.",
      biodiversity: "Man-made urban forest protection. Native bird migration pockets. High-yield vertical farms."
    }
  }
];

// Helper to programmatically generate interactive sci-fi city projections
export const generateCityProjections = (
  city: CityData,
  category: string,
  year: number
): CityProjection => {
  const stabilityBase = 60 + Math.floor(city.offsets.temp * 1.5) % 15;
  const yearIndex = (year - 2025) / 5; // 0 to 5
  
  // Custom calculations representing progressive technological advancement
  const stability = Math.min(100, Math.max(50, stabilityBase + yearIndex * 6));
  
  let status = "MONITORING";
  if (stability > 95) status = "MAXIMUM";
  else if (stability > 88) status = "SECURE";
  else if (stability > 78) status = "STABILIZING";
  else if (stability > 68) status = "TRANSITION";
  else status = "CRITICAL";

  let text = "";

  switch (category) {
    case 'Climate Recovery':
      text = `Climate mitigation systems in ${city.name} active. ${city.details.climate.split('.')[0].trim()} Local albedo and carbon sensors report thermal stability index at ${55 + yearIndex * 8}% by ${year}.`;
      break;

    case 'Clean Energy':
      text = `Next-gen clean energy integration active for ${city.name}. ${city.details.energy.split('.')[0].trim()} Total grid reliance on fossil fuels reduced to ${Math.max(0, 45 - yearIndex * 9)}% by ${year}. ${city.details.energy.split('.')[1].trim()} efficiency is at peak capability.`;
      break;

    case 'Biodiversity':
      text = `Planetary ecological balance initiatives in ${city.name} show progress. ${city.details.biodiversity.split('.')[0].trim()} Ecological index has stabilized at ${60 + yearIndex * 7}% of pre-industrial levels by the year ${year}. ${city.details.biodiversity.split('.')[1].trim()}`;
      break;

    case 'AI Infrastructure':
      text = `${city.name} smart AI computing node online. Live connection telemetry reports quantum processing loops active. Synchronized with orbital neural backbone ChronoOS by ${year}.`;
      break;

    case 'Smart Cities':
      text = `${city.name} biophilic metropolis adaptation index at ${65 + yearIndex * 6}% by ${year}. ${city.details.climate.split('.')[1] ? city.details.climate.split('.')[1].trim() : 'District micro-cooling loops active.'} Integration with local biome complete.`;
      break;

    case 'Transportation Networks':
      text = `Autonomous travel slots optimized in ${city.name}. Carbon-neutral hyperloop links and maglev guidelines operating at ${70 + yearIndex * 5}% efficiency by the year ${year}.`;
      break;

    case 'Ocean Monitoring':
      if (city.offsets.seaLevel === 0) {
        text = `${city.name} is landlocked. Focus is placed on local inland river basin restoration. By ${year}, clean watershed indicators are at ${50 + yearIndex * 8}%, powered by telemetry.`;
      } else {
        const floodRisk = Math.max(10, 100 - (stability + 5));
        text = `Coastal defenses in ${city.name} active. ${city.details.climate.split('.')[0].trim()} Sea wall telemetry indicates a flood risk threshold reduction of ${30 + yearIndex * 10}%. Relative sea level rise stands at +${(0.08 * yearIndex * city.offsets.seaLevel).toFixed(2)}m by ${year}.`;
      }
      break;

    case 'Population Growth':
      const projectedPop = (city.offsets.population * 1000) * Math.pow(city.offsets.popGrowth, yearIndex / 5);
      text = `${city.name} smart carrying capacity limit optimized. Projected population stabilizes at ${projectedPop.toFixed(2)} million by ${year}, maintaining quality-of-life stability at ${80 + yearIndex * 3}%.`;
      break;

    case 'Water Systems':
      text = `Municipal water systems in ${city.name} optimized. Hydro-capture grids and smart recycling channels running at ${60 + yearIndex * 7}% recycling capacity by the year ${year}.`;
      break;

    case 'Satellite Network':
    default:
      text = `Orbital tracking mesh overhead. ${city.name} telemetry routes through local array. ${city.details.satellites.split('.')[0].trim()} Live data flow ensures transit delays under ${Math.max(1, 15 - yearIndex * 2.5)} seconds by the year ${year}. ${city.details.satellites.split('.')[1].trim()}`;
      break;
  }

  return { text, stability, status };
};

export interface CityIntelligence {
  population: number; // in millions
  smartCityIndex: number; // 0 to 100
  aiAdoption: number; // 0 to 100
  sustainability: number; // 0 to 100
  climateRisk: number; // 0 to 100
  growthForecast: string;
}

export const generateCityIntelligence = (
  city: CityData,
  year: number,
  simulations: {
    seaLevelRise: number;
    fusionBreakthrough: boolean;
    agiEmergence: boolean;
    popDecline: boolean;
    renewableTransition: boolean;
    arcticDominance: boolean;
    semiDisruptions: boolean;
  }
): CityIntelligence => {
  const yearIndex = (year - 2025) / 5; // 0 to 5

  // 1. Population calculation
  let population = (city.offsets.population * 1000) * Math.pow(city.offsets.popGrowth, yearIndex / 5);
  if (simulations.popDecline) {
    population *= 0.88;
  }

  // 2. Smart City Index base
  const smartBase = 65 + (Math.floor(city.offsets.temp * 2) % 15);
  let smartCityIndex = Math.min(100, Math.max(40, smartBase + yearIndex * 4));
  if (simulations.agiEmergence) {
    smartCityIndex = Math.min(99, smartCityIndex + 20);
  }

  // 3. AI Adoption Level base
  const aiBase = 55 + (Math.floor(city.offsets.tempRise * 10) % 20);
  let aiAdoption = Math.min(100, Math.max(30, aiBase + yearIndex * 5));
  if (simulations.agiEmergence) {
    aiAdoption = Math.min(99, aiAdoption + 30);
  }

  // 4. Sustainability Rating base
  const sustainBase = 60 + (Math.floor(city.offsets.popGrowth * 10) % 20);
  let sustainability = Math.min(100, Math.max(40, sustainBase + yearIndex * 3));
  if (simulations.fusionBreakthrough) {
    sustainability = Math.min(99, sustainability + 22);
  } else if (simulations.renewableTransition) {
    sustainability = Math.min(95, sustainability + 12);
  }
  if (simulations.seaLevelRise > 0 && city.offsets.seaLevel > 0) {
    sustainability = Math.max(20, sustainability - simulations.seaLevelRise * 12);
  }

  // 5. Climate Risk Score base
  const riskBase = 40 + Math.floor(city.offsets.tempRise * 15) + Math.floor(city.offsets.seaLevel * 10);
  let climateRisk = Math.min(100, Math.max(10, riskBase + yearIndex * 2));
  if (simulations.seaLevelRise > 0 && city.offsets.seaLevel > 0) {
    climateRisk = Math.min(100, climateRisk + simulations.seaLevelRise * 15);
  }
  if (simulations.fusionBreakthrough || simulations.renewableTransition) {
    climateRisk = Math.max(10, climateRisk - 15);
  }

  // 6. Growth Forecast
  let growthForecast = `${city.name} is projected to see a ${population > 10 ? 'steady stabilization' : 'high-tech expansion'} of carrying capacity towards ${population.toFixed(1)} million residents by ${year}.`;
  if (simulations.agiEmergence) {
    growthForecast += ` Adaptive AI grids have automated urban resource routing, boosting efficiency by 30%.`;
  }
  if (simulations.seaLevelRise > 0 && city.offsets.seaLevel > 0) {
    growthForecast += ` Coastal inundation defenses are operating at maximum capacity to counter the +${simulations.seaLevelRise}m sea-level surge.`;
  }

  return { population, smartCityIndex, aiAdoption, sustainability, climateRisk, growthForecast };
};

