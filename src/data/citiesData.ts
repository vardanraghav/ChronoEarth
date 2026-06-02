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
  offsets: {
    temp: number;       // base temp offset (e.g. Dubai is hot, Toronto is cold)
    tempRise: number;   // rate of temp rise (e.g. higher in landlocked/desert cities)
    seaLevel: number;   // sea level impact coefficient (0 for landlocked, 1+ for coastal)
    population: number; // base population in billions
    popGrowth: number;  // annual growth rate factor
  };
  details: Record<string, string>; // localized features
}

export const citiesRawData: Omit<CityData, 'projections'>[] = [
  {
    name: 'Delhi',
    country: 'India',
    lat: 28.6139,
    lon: 77.2090,
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
    offsets: { temp: 2.5, tempRise: 0.8, seaLevel: 1.5, population: 0.021, popGrowth: 1.08 },
    details: {
      climate: "Sea-level dikes. Storm surge floodgates. Marine salinity sensors.",
      energy: "Offshore wind turbines. Tidal kinetic power arrays. Floating solar bays.",
      satellites: "Monsoon tracking radars. Tidal wave warning orbital arrays.",
      biodiversity: "Coastal mangrove restoration. Marine sanctuaries. Urban parklands."
    }
  },
  {
    name: 'Bangalore',
    country: 'India',
    lat: 12.9716,
    lon: 77.5946,
    offsets: { temp: 1.2, tempRise: 0.9, seaLevel: 0, population: 0.014, popGrowth: 1.15 },
    details: {
      climate: "Microclimate control nodes. Rainwater hyper-harvesting. Cool-roof paint.",
      energy: "Smart microgrids. Perovskite solar glazing. Geothermal thermal loops.",
      satellites: "IoT communications swarms. Air pollution spectral sensors.",
      biodiversity: "Hanging sky-gardens. Eco-corridors. Native planting grids."
    }
  },
  {
    name: 'Hyderabad',
    country: 'India',
    lat: 17.3850,
    lon: 78.4867,
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
    offsets: { temp: 4.2, tempRise: 1.1, seaLevel: 0, population: 0.009, popGrowth: 1.09 },
    details: {
      climate: "Sabarmati riverfront bio-filters. Cool corridors. Urban shade meshes.",
      energy: "Canal-top solar systems. High-capacity battery storage. Grid nodes.",
      satellites: "Urban heat island radars. Green cover density spectral mapping.",
      biodiversity: "Native mini-forests. Green river buffers. Urban rooftop farms."
    }
  },
  {
    name: 'Shanghai',
    country: 'China',
    lat: 31.2304,
    lon: 121.4737,
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
    offsets: { temp: 1.0, tempRise: 1.0, seaLevel: 0, population: 0.003, popGrowth: 1.14 },
    details: {
      climate: "Foothill microclimate shields. Glacier runoff regulators. Cloud sensors.",
      energy: "Hydroelectric micro-turbines. High-altitude solar. Biogas loops.",
      satellites: "Himalayan ice-melt radars. Forestry density mapping swarms.",
      biodiversity: "Margalla Hills eco-link. Reforestation corridors. Terraced gardens."
    }
  },
  {
    name: 'Dubai',
    country: 'Middle East',
    lat: 25.2048,
    lon: 55.2708,
    offsets: { temp: 8.5, tempRise: 1.4, seaLevel: 0.8, population: 0.005, popGrowth: 1.11 },
    details: {
      climate: "Climate-controlled biodomes. Cloud-seeding towers. Air cooling vents.",
      energy: "Desert mega-solar. CSP receiver tower. Green hydrogen hypergrids.",
      satellites: "Hyperloop navigation meshes. Orbital sandstorm warning beams.",
      biodiversity: "Desert forestation biomes. Coastal reef grids. Desert pocket parks."
    }
  },
  {
    name: 'Riyadh',
    country: 'Middle East',
    lat: 24.7136,
    lon: 46.6753,
    offsets: { temp: 8.0, tempRise: 1.3, seaLevel: 0, population: 0.009, popGrowth: 1.10 },
    details: {
      climate: "Thermal shielding canopies. Deep aquifer pumps. Desal water channels.",
      energy: "Neom-tied hypergrids. Concentrated solar fields. Geothermal cooling.",
      satellites: "Ground moisture radars. Drone delivery satellite flight guidance.",
      biodiversity: "Wadi Hanifa bio-buffers. Arid planting parks. Smart date palms."
    }
  },
  {
    name: 'London',
    country: 'Europe',
    lat: 51.5074,
    lon: -0.1278,
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
    country: 'Europe',
    lat: 52.5200,
    lon: 13.4050,
    offsets: { temp: -1.0, tempRise: 0.6, seaLevel: 0, population: 0.004, popGrowth: 1.01 },
    details: {
      climate: "Rainwater swales. Evaporative cooling plazas. Heat pump arrays.",
      energy: "Balcony solar mesh. Biogas circular plants. Wind corridors.",
      satellites: "Micro-mobility beacons. Autonomous bike/drone lane telemetry.",
      biodiversity: "Forest expansion corridors. Green rooftops. Bee highway trails."
    }
  },
  {
    name: 'New York',
    country: 'North America',
    lat: 40.7128,
    lon: -74.0060,
    offsets: { temp: -0.5, tempRise: 0.6, seaLevel: 1.4, population: 0.021, popGrowth: 1.02 },
    details: {
      climate: "Harbor surge gates. Subway automated bilge. Sea level monitors.",
      energy: "Atlantic wind array. Skyscraper solar paint. Distributed battery hubs.",
      satellites: "Grid stability telemetry. Autonomous cargo drone orbital controls.",
      biodiversity: "Central Park rewilding. Vertical garden high-rises. Oyster reef grids."
    }
  },
  {
    name: 'Toronto',
    country: 'North America',
    lat: 43.6532,
    lon: -79.3832,
    offsets: { temp: -3.5, tempRise: 0.5, seaLevel: 0, population: 0.007, popGrowth: 1.04 },
    details: {
      climate: "Lake cooling loops. Snowmelt collection tanks. Deep geothermal heating.",
      energy: "Nuclear small modular reactors. Geothermal loops. Kinetic walkways.",
      satellites: "Great Lakes ice mapping. Great Lakes freight tracking beacons.",
      biodiversity: "Ravine ecosystem corridors. Smart windbreak trees. Green rooftops."
    }
  },
  {
    name: 'Moscow',
    country: 'Russia',
    lat: 55.7558,
    lon: 37.6173,
    offsets: { temp: -4.5, tempRise: 0.7, seaLevel: 0, population: 0.014, popGrowth: 1.01 },
    details: {
      climate: "Sub-zero grid buffers. Heated drone pathways. Permafrost telemetry.",
      energy: "Compact fusion plants. Nuclear thermal grid. Solar heat traps.",
      satellites: "Arctic logistics satellite guides. Northern route tracking systems.",
      biodiversity: "Taiga buffer corridors. Sub-zero urban biomes. Pine micro-parks."
    }
  }
];

// Helper to programmatically generate interactive sci-fi city projections
export const generateCityProjections = (
  city: Omit<CityData, 'projections'>,
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
    case 'Ocean Monitoring':
      if (city.offsets.seaLevel === 0) {
        text = `${city.name} is landlocked. Focus is placed on local hydrological grids. By ${year}, ${city.details.climate.split('.')[1].trim()} System efficiency is at ${50 + yearIndex * 8}%, powered by smart telemetry.`;
      } else {
        const floodRisk = Math.max(10, 100 - (stability + 5));
        text = `Coastal defenses in ${city.name} active. ${city.details.climate.split('.')[0].trim()} Sea wall telemetry indicates a flood risk threshold reduction of ${30 + yearIndex * 10}%. Relative sea level rise stands at +${(0.08 * yearIndex * city.offsets.seaLevel).toFixed(2)}m by ${year}.`;
      }
      break;

    case 'Biodiversity':
      text = `Planetary ecological balance initiatives in ${city.name} show progress. ${city.details.biodiversity.split('.')[0].trim()} Ecological index has stabilized at ${60 + yearIndex * 7}% of pre-industrial levels by the year ${year}. ${city.details.biodiversity.split('.')[1].trim()}`;
      break;

    case 'Clean Energy':
      text = `Next-gen clean energy integration active for ${city.name}. ${city.details.energy.split('.')[0].trim()} Total grid reliance on fossil fuels reduced to ${Math.max(0, 45 - yearIndex * 9)}% by ${year}. ${city.details.energy.split('.')[1].trim()} efficiency is at peak capability.`;
      break;

    case 'Satellite Network':
    default:
      text = `Orbital tracking mesh overhead. ${city.name} telemetry routes through local array. ${city.details.satellites.split('.')[0].trim()} Live data flow ensures transit delays under ${Math.max(1, 15 - yearIndex * 2.5)} seconds by the year ${year}. ${city.details.satellites.split('.')[1].trim()}`;
      break;
  }

  return { text, stability, status };
};
