export interface Futurologist {
  name: string;
  role: string;
  specialization: string;
  avatar: string;
  bio: string;
  contributions: number;
}

export interface Prediction {
  id: string;
  title: string;
  description: string;
  category: 'AI' | 'Climate' | 'Energy' | 'Space' | 'Cities' | 'Transport' | 'Healthcare';
  year: 2030 | 2040 | 2050;
  author: string;
  initialVotes: number;
  tags: string[];
}

export interface KBArticle {
  id: string;
  title: string;
  category: 'Technologies' | 'Future Jobs' | 'Climate' | 'Energy' | 'Space';
  shortDesc: string;
  content: string;
  readinessIndex: number; // 0 to 100
  impactLevel: 'High' | 'Critical' | 'Moderate';
}

export const FUTUROLOGISTS: Futurologist[] = [
  {
    name: 'Dr. Evelyn Wright',
    role: 'Lead AI Ethicist',
    specialization: 'Quantum Intelligence & Bio-Neural Systems',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=60',
    bio: 'Pioneered the Singularity Accords of 2038. Researches structural alignment in planetary cybernetics.',
    contributions: 142
  },
  {
    name: 'Prof. Liam Carter',
    role: 'Planetary Ecologist',
    specialization: 'Geo-Engineering & Biosphere Reclamation',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=60',
    bio: 'Principal designer of the Sahara Green Belt project. Advisor to the IPCC Global Desalination Grid.',
    contributions: 98
  },
  {
    name: 'Dr. Kenji Sato',
    role: 'Orbital Logistics Director',
    specialization: 'LEO Debris Remediation & Helium-3 Extraction',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=60',
    bio: 'Oversees the Lunar Helium-3 fusion highway and coordinate networks for GEO infrastructure.',
    contributions: 115
  },
  {
    name: 'Dr. Sarah Jenkins',
    role: 'Bio-Geneticist',
    specialization: 'Genetic Engineering & Cellular Regeneration',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=60',
    bio: 'Recipient of the 2042 Nobel Prize in Medicine for developing cellular rejuvenation therapies.',
    contributions: 87
  }
];

export const PREDICTIONS: Prediction[] = [
  // 2030 Predictions
  {
    id: 'pred-1',
    title: 'AI Decides Regional Agriculture',
    description: 'Decentralized AI grids are given full autonomous authority to distribute regional seed supplies, water allocations, and crop rotation cycles to optimize yields under shifting rain patterns.',
    category: 'AI',
    year: 2030,
    author: 'Dr. Evelyn Wright',
    initialVotes: 234,
    tags: ['Autonomous Farming', 'Neural Grids']
  },
  {
    id: 'pred-2',
    title: 'Carbon-Tax Smart Contracts Go Live',
    description: 'Global trade agreements enforce automatic blockchain carbon tariffs on all industrial logistics, shifting financial incentives to local micro-manufacturing instantly.',
    category: 'Climate',
    year: 2030,
    author: 'Prof. Liam Carter',
    initialVotes: 189,
    tags: ['Blockchain Carbon', 'Automated Tariffs']
  },
  {
    id: 'pred-3',
    title: 'First Commercial Fusion Plant Connects',
    description: 'A 500MW magnetized target fusion reactor in Helion, Canada, officially begins feeding electricity into the regional grid, proving continuous net energy gain.',
    category: 'Energy',
    year: 2030,
    author: 'Prof. Liam Carter',
    initialVotes: 342,
    tags: ['Commercial Fusion', 'Zero Emission']
  },
  {
    id: 'pred-4',
    title: 'Debris Sweeper Satellites Patrol LEO',
    description: 'An international fleet of autonomous lasers and magnetic sweepers begins clearing orbital debris corridors, lowering satellite launch insurance rates by 40%.',
    category: 'Space',
    year: 2030,
    author: 'Dr. Kenji Sato',
    initialVotes: 156,
    tags: ['LEO Clean', 'Orbital Safety']
  },
  {
    id: 'pred-5',
    title: 'Autonomous Transit Zones in Europe',
    description: 'Cities like Berlin and Amsterdam ban human-driven vehicles in downtown cores, replacing them with a shared, AI-scheduled fleet of biomorphic electric pods.',
    category: 'Transport',
    year: 2030,
    author: 'Dr. Evelyn Wright',
    initialVotes: 207,
    tags: ['Smart Transit', 'Autonomous Pods']
  },

  // 2040 Predictions
  {
    id: 'pred-6',
    title: 'Quantum Weather Supercomputers',
    description: '10,000-qubit quantum arrays forecast monsoons and storms with 99% accuracy up to 30 days in advance, allowing preventative evacuation and localized water collection.',
    category: 'AI',
    year: 2040,
    author: 'Dr. Evelyn Wright',
    initialVotes: 412,
    tags: ['Quantum Forecasting', 'Storm Shield']
  },
  {
    id: 'pred-7',
    title: 'Atmospheric Aerosol Injection Begins',
    description: 'Under strict UN supervision, sulfur-dispensing sub-orbital drones deploy reflectant aerosols above the Arctic Circle to slow down permafrost methane emissions.',
    category: 'Climate',
    year: 2040,
    author: 'Prof. Liam Carter',
    initialVotes: 284,
    tags: ['Geo-Engineering', 'Arctic Reflectance']
  },
  {
    id: 'pred-8',
    title: 'Wireless Orbital Power Transmissions',
    description: 'GEO solar satellites successfully beam high-frequency microwaves to rectenna fields in arid deserts, delivering clean power directly through cloud layers.',
    category: 'Energy',
    year: 2040,
    author: 'Dr. Kenji Sato',
    initialVotes: 320,
    tags: ['Space Solar', 'Microwave Beaming']
  },
  {
    id: 'pred-9',
    title: 'Moon Base Artemis Operational',
    description: 'A permanent habitat at Shackleton Crater houses 50 astronauts and robotic engineers, utilizing lunar regolith 3D printing to expand launch bays.',
    category: 'Space',
    year: 2040,
    author: 'Dr. Kenji Sato',
    initialVotes: 298,
    tags: ['Lunar Colonization', 'Artemis Base']
  },
  {
    id: 'pred-10',
    title: 'Anti-Aging Rejuvenation Therapy Approved',
    description: 'UN approves cellular epigenetic reprogramming therapy for individuals over 50, successfully restoring immune systems and increasing healthy lifespan by 25 years.',
    category: 'Healthcare',
    year: 2040,
    author: 'Dr. Sarah Jenkins',
    initialVotes: 489,
    tags: ['Epigenetics', 'Longevity Medicine']
  },

  // 2050 Predictions
  {
    id: 'pred-11',
    title: 'Earth-wide Cybernetic Singularity',
    description: 'Atmospheric sensors, oceanic data logs, and city infrastructures are linked into a global neural grid that actively balances Earth ecosystems dynamically.',
    category: 'AI',
    year: 2050,
    author: 'Dr. Evelyn Wright',
    initialVotes: 612,
    tags: ['ChronoOS Integration', 'Global Singularity']
  },
  {
    id: 'pred-12',
    title: 'Sahara Fully Greened by Desal Grids',
    description: 'Thousands of solar-powered desalination stations pump nutrient-infused water deep into the desert, converting 1.5 million square miles into bio-farms.',
    category: 'Climate',
    year: 2050,
    author: 'Prof. Liam Carter',
    initialVotes: 518,
    tags: ['Desert Greening', 'IPCC Irrigation']
  },
  {
    id: 'pred-13',
    title: 'Global Fusion Grid Meets 85% Demand',
    description: 'Magnetized fusion networks and orbital space-solar arrays provide the vast majority of human power needs, rendering hydrocarbon plants fully obsolete.',
    category: 'Energy',
    year: 2050,
    author: 'Prof. Liam Carter',
    initialVotes: 588,
    tags: ['Fusion Network', 'Zero Carbon Planet']
  },
  {
    id: 'pred-14',
    title: 'Asteroid Mining Ship Returns with Metals',
    description: 'The automated harvester ship *Vanguard* arrives in High Earth Orbit carrying 20 million tons of raw platinum and rare earth elements extracted from Psyche-16.',
    category: 'Space',
    year: 2050,
    author: 'Dr. Kenji Sato',
    initialVotes: 423,
    tags: ['Asteroid Mining', 'Psyche Harvester']
  },
  {
    id: 'pred-15',
    title: 'Fully Biophilic Floating Megacities',
    description: 'Dynamic floating cities powered by ocean currents and geothermal loops house 50 million climate refugees in the South Pacific, featuring self-healing coral foundations.',
    category: 'Cities',
    year: 2050,
    author: 'Dr. Evelyn Wright',
    initialVotes: 462,
    tags: ['Floating Metropolis', 'Biophilic Coral']
  },
  {
    id: 'pred-16',
    title: 'Vacuum Tube Hyperloop Global Web',
    description: 'Sub-oceanic vacuum tunnels connect London, New York, Tokyo, and Sydney, transporting magnetic cargo and passengers at speeds exceeding Mach 2.5.',
    category: 'Transport',
    year: 2050,
    author: 'Dr. Kenji Sato',
    initialVotes: 495,
    tags: ['Trans-oceanic Hyperloop', 'Mach 2.5 Transit']
  },
  {
    id: 'pred-17',
    title: 'Nanobot Synthetic Immune Systems',
    description: 'Injected microscopic bio-bots patrol the human bloodstream, identifying and neutralizing cancer cells, virus strains, and vascular plaque instantly.',
    category: 'Healthcare',
    year: 2050,
    author: 'Dr. Sarah Jenkins',
    initialVotes: 540,
    tags: ['Nanomedicine', 'Synthetic Biology']
  }
];

export const KB_ARTICLES: KBArticle[] = [
  {
    id: 'kb-1',
    title: 'Compact Magnetized Fusion',
    category: 'Technologies',
    shortDesc: 'Continuous net-energy fusion using high-temperature superconductor magnets.',
    content: 'Magnetized target fusion utilizes intense magnetic fields to confine burning plasma at high densities. High-temperature superconductors (HTS) allow coils to generate double the magnetic field strength of traditional tokamaks, lowering reactor size by 90% and enabling modular integration with regional power grids.',
    readinessIndex: 82,
    impactLevel: 'Critical'
  },
  {
    id: 'kb-2',
    title: 'Ocean Thermal Energy Conversion (OTEC)',
    category: 'Energy',
    shortDesc: 'Generating constant baseload power using deep-ocean temperature differentials.',
    content: 'OTEC systems use the temperature difference between warm tropical surface water and freezing deep-sea water to vaporize a working fluid with a low boiling point (such as ammonia), driving generator turbines. Since ocean temperature gradients are permanent, OTEC provides continuous, non-fluctuating green energy.',
    readinessIndex: 78,
    impactLevel: 'High'
  },
  {
    id: 'kb-3',
    title: 'Synthetic Ecologist',
    category: 'Future Jobs',
    shortDesc: 'Designing and engineering artificial ecosystems to restore biodiversity.',
    content: 'Synthetic Ecologists specialize in gene-editing microflora, soil microbes, and plants to stabilize ecosystems under severe climate changes. They develop tailored bio-networks that can thrive in arid soils, filter pollutants from major rivers, or create self-repairing coral foundations in coastal cities.',
    readinessIndex: 90,
    impactLevel: 'High'
  },
  {
    id: 'kb-4',
    title: 'Albedo Geo-engineering',
    category: 'Climate',
    shortDesc: 'Deflecting solar radiation to cool polar regions and preserve ice sheets.',
    content: 'Albedo geo-engineering involves scattering micro-droplets of sea-water or reflectant silica particles into the stratosphere. This artificially increases cloud reflectivity, deflecting a small fraction of solar radiation back into space to stabilize glacier temperatures and check runaway sea-level rise.',
    readinessIndex: 65,
    impactLevel: 'Critical'
  },
  {
    id: 'kb-5',
    title: 'Helium-3 Lunar Mining',
    category: 'Space',
    shortDesc: 'Extracting clean fusion fuel from Lunar regolith deposits.',
    content: 'Lunar dust contains significant deposits of Helium-3, deposited by solar winds over billions of years. Helium-3 fusion is aneutronic, producing zero radioactive waste and making it the ideal fuel for Earth-wide compact fusion grids. Permanent lunar factories automate mining and capsule transport to LEO cargo docks.',
    readinessIndex: 55,
    impactLevel: 'High'
  },
  {
    id: 'kb-6',
    title: 'Quantum Grid Architect',
    category: 'Future Jobs',
    shortDesc: 'Designing quantum entangled infrastructure communication loops.',
    content: 'Quantum Grid Architects write and manage decentralized routing algorithms for entangled communications. They coordinate LEO satellite constellations and metropolitan neural nodes to achieve instantaneous data transit with 100% security against intercept vectors.',
    readinessIndex: 88,
    impactLevel: 'High'
  },
  {
    id: 'kb-7',
    title: 'Biophilic Coral Foundations',
    category: 'Technologies',
    shortDesc: 'Self-healing ocean structures that grow using electrical accretion.',
    content: 'By sending low-voltage electrical currents through steel frames submerged in seawater, minerals precipitate onto the metal, creating solid calcium carbonate structures identical to natural coral reefs. These biophilic foundations house floating cities and act as highly effective storm surge buffers.',
    readinessIndex: 74,
    impactLevel: 'High'
  }
];
