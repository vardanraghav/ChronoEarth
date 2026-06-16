export interface Comment {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  timestamp: string;
  votes: number;
  replies?: Comment[];
}

export interface Futurologist {
  name: string;
  slug: string;
  role: string;
  specialization: string;
  avatar: string;
  bio: string;
  contributions: number;
  influenceScore: number;
}

export interface Prediction {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: 'AI' | 'Climate' | 'Energy' | 'Space' | 'Cities' | 'Transport' | 'Healthcare' | 'Society';
  year: 2030 | 2040 | 2050;
  author: string;
  city: string;
  confidenceScore: number; // 0 to 100
  initialVotes: number;
  votes: number;
  tags: string[];
  comments: Comment[];
  shareUrl: string;
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
    name: 'Dr. Ishita Iyer',
    slug: 'ishita-iyer',
    role: 'Lead AI Ethicist',
    specialization: 'Quantum Intelligence & Bio-Neural Systems',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=60',
    bio: 'Pioneered the Singularity Accords of 2038. Researches structural alignment in planetary cybernetics from Bengaluru.',
    contributions: 142,
    influenceScore: 94
  },
  {
    name: 'Prof. Arjun Sharma',
    slug: 'arjun-sharma',
    role: 'Planetary Ecologist',
    specialization: 'Geo-Engineering & Biosphere Reclamation',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=60',
    bio: 'Principal designer of the Sahara Green Belt project. Advisor to the IPCC Global Desalination Grid.',
    contributions: 98,
    influenceScore: 89
  },
  {
    name: 'Dr. Rajesh Nair',
    slug: 'rajesh-nair',
    role: 'Orbital Logistics Director',
    specialization: 'LEO Debris Remediation & Helium-3 Extraction',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=60',
    bio: 'Oversees the Lunar Helium-3 fusion highway and coordinate networks for GEO infrastructure.',
    contributions: 115,
    influenceScore: 91
  },
  {
    name: 'Dr. Sneha Patil',
    slug: 'sneha-patil',
    role: 'Bio-Geneticist',
    specialization: 'Genetic Engineering & Cellular Regeneration',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=60',
    bio: 'Recipient of the 2042 Nobel Prize in Medicine for developing cellular rejuvenation therapies.',
    contributions: 87,
    influenceScore: 95
  }
];

// Seed comments helper to keep code clean
const createSampleComments = (title: string): Comment[] => [
  {
    id: `c-${title.toLowerCase().replace(/\s+/g, '-')}-1`,
    author: 'Aravind_Observer',
    content: `This projection for ${title} seems highly probable given the current rate of technological convergence. But bhai, systemic risks are still there.`,
    timestamp: '2026-06-02T10:45:00Z',
    votes: 38,
    replies: [
      {
        id: `c-${title.toLowerCase().replace(/\s+/g, '-')}-2`,
        author: 'Dr_Kulkarni',
        content: 'Agreed, doctor saab. The primary bottleneck isn\'t the core science, but international policy alignment which is taking too much time.',
        timestamp: '2026-06-02T12:30:00Z',
        votes: 19,
        replies: []
      }
    ]
  },
  {
    id: `c-${title.toLowerCase().replace(/\s+/g, '-')}-3`,
    author: 'Nikhil_Forecaster',
    content: 'True yaar, we need to factor in localized supply chain disruptions when calculating the implementation timeline.',
    timestamp: '2026-06-03T16:15:00Z',
    votes: 24,
    replies: []
  }
];

export const PREDICTIONS: Prediction[] = [
  // 2030 Predictions
  {
    id: 'pred-1',
    slug: 'ai-decides-regional-agriculture',
    title: 'AI Decides Regional Agriculture',
    description: 'Decentralized AI grids are given full autonomous authority to distribute regional seed supplies, water allocations, and crop rotation cycles to optimize yields under shifting rain patterns.',
    category: 'AI',
    year: 2030,
    author: 'Dr. Ishita Iyer',
    city: 'Nairobi',
    confidenceScore: 78,
    initialVotes: 234,
    votes: 234,
    tags: ['Autonomous Farming', 'Neural Grids'],
    comments: createSampleComments('AI Decides Regional Agriculture'),
    shareUrl: '/predictions/ai-decides-regional-agriculture'
  },
  {
    id: 'pred-2',
    slug: 'carbon-tax-smart-contracts-go-live',
    title: 'Carbon-Tax Smart Contracts Go Live',
    description: 'Global trade agreements enforce automatic blockchain carbon tariffs on all industrial logistics, shifting financial incentives to local micro-manufacturing instantly.',
    category: 'Climate',
    year: 2030,
    author: 'Prof. Arjun Sharma',
    city: 'London',
    confidenceScore: 84,
    initialVotes: 189,
    votes: 189,
    tags: ['Blockchain Carbon', 'Automated Tariffs'],
    comments: createSampleComments('Carbon-Tax Smart Contracts Go Live'),
    shareUrl: '/predictions/carbon-tax-smart-contracts-go-live'
  },
  {
    id: 'pred-3',
    slug: 'first-commercial-fusion-plant-connects',
    title: 'First Commercial Fusion Plant Connects',
    description: 'A 500MW magnetized target fusion reactor in Helion, Canada, officially begins feeding electricity into the regional grid, proving continuous net energy gain.',
    category: 'Energy',
    year: 2030,
    author: 'Prof. Arjun Sharma',
    city: 'Toronto',
    confidenceScore: 91,
    initialVotes: 342,
    votes: 342,
    tags: ['Commercial Fusion', 'Zero Emission'],
    comments: createSampleComments('First Commercial Fusion Plant Connects'),
    shareUrl: '/predictions/first-commercial-fusion-plant-connects'
  },
  {
    id: 'pred-4',
    slug: 'debris-sweeper-satellites-patrol-leo',
    title: 'Debris Sweeper Satellites Patrol LEO',
    description: 'An international fleet of autonomous lasers and magnetic sweepers begins clearing orbital debris corridors, lowering satellite launch insurance rates by 40%.',
    category: 'Space',
    year: 2030,
    author: 'Dr. Rajesh Nair',
    city: 'Tokyo',
    confidenceScore: 88,
    initialVotes: 156,
    votes: 156,
    tags: ['LEO Clean', 'Orbital Safety'],
    comments: createSampleComments('Debris Sweeper Satellites Patrol LEO'),
    shareUrl: '/predictions/debris-sweeper-satellites-patrol-leo'
  },
  {
    id: 'pred-5',
    slug: 'autonomous-transit-zones-in-europe',
    title: 'Autonomous Transit Zones in Europe',
    description: 'Cities like Berlin and Amsterdam ban human-driven vehicles in downtown cores, replacing them with a shared, AI-scheduled fleet of biomorphic electric pods.',
    category: 'Transport',
    year: 2030,
    author: 'Dr. Ishita Iyer',
    city: 'Berlin',
    confidenceScore: 94,
    initialVotes: 207,
    votes: 207,
    tags: ['Smart Transit', 'Autonomous Pods'],
    comments: createSampleComments('Autonomous Transit Zones in Europe'),
    shareUrl: '/predictions/autonomous-transit-zones-in-europe'
  },

  // 2040 Predictions
  {
    id: 'pred-6',
    slug: 'quantum-weather-supercomputers',
    title: 'Quantum Weather Supercomputers',
    description: '10,000-qubit quantum arrays forecast monsoons and storms with 99% accuracy up to 30 days in advance, allowing preventative evacuation and localized water collection.',
    category: 'AI',
    year: 2040,
    author: 'Dr. Ishita Iyer',
    city: 'Tokyo',
    confidenceScore: 82,
    initialVotes: 412,
    votes: 412,
    tags: ['Quantum Forecasting', 'Storm Shield'],
    comments: createSampleComments('Quantum Weather Supercomputers'),
    shareUrl: '/predictions/quantum-weather-supercomputers'
  },
  {
    id: 'pred-7',
    slug: 'atmospheric-aerosol-injection-begins',
    title: 'Atmospheric Aerosol Injection Begins',
    description: 'Under strict UN supervision, sulfur-dispensing sub-orbital drones deploy reflectant aerosols above the Arctic Circle to slow down permafrost methane emissions.',
    category: 'Climate',
    year: 2040,
    author: 'Prof. Arjun Sharma',
    city: 'Reykjavik',
    confidenceScore: 65,
    initialVotes: 284,
    votes: 284,
    tags: ['Geo-Engineering', 'Arctic Reflectance'],
    comments: createSampleComments('Atmospheric Aerosol Injection Begins'),
    shareUrl: '/predictions/atmospheric-aerosol-injection-begins'
  },
  {
    id: 'pred-8',
    slug: 'wireless-orbital-power-transmissions',
    title: 'Wireless Orbital Power Transmissions',
    description: 'GEO solar satellites successfully beam high-frequency microwaves to rectenna fields in arid deserts, delivering clean power directly through cloud layers.',
    category: 'Energy',
    year: 2040,
    author: 'Dr. Rajesh Nair',
    city: 'Cairo',
    confidenceScore: 72,
    initialVotes: 320,
    votes: 320,
    tags: ['Space Solar', 'Microwave Beaming'],
    comments: createSampleComments('Wireless Orbital Power Transmissions'),
    shareUrl: '/predictions/wireless-orbital-power-transmissions'
  },
  {
    id: 'pred-9',
    slug: 'moon-base-artemis-operational',
    title: 'Moon Base Artemis Operational',
    description: 'A permanent habitat at Shackleton Crater houses 50 astronauts and robotic engineers, utilizing lunar regolith 3D printing to expand launch bays.',
    category: 'Space',
    year: 2040,
    author: 'Dr. Rajesh Nair',
    city: 'Sydney',
    confidenceScore: 87,
    initialVotes: 298,
    votes: 298,
    tags: ['Lunar Colonization', 'Artemis Base'],
    comments: createSampleComments('Moon Base Artemis Operational'),
    shareUrl: '/predictions/moon-base-artemis-operational'
  },
  {
    id: 'pred-10',
    slug: 'anti-aging-rejuvenation-therapy-approved',
    title: 'Anti-Aging Rejuvenation Therapy Approved',
    description: 'UN approves cellular epigenetic reprogramming therapy for individuals over 50, successfully restoring immune systems and increasing healthy lifespan by 25 years.',
    category: 'Healthcare',
    year: 2040,
    author: 'Dr. Sneha Patil',
    city: 'Paris',
    confidenceScore: 79,
    initialVotes: 489,
    votes: 489,
    tags: ['Epigenetics', 'Longevity Medicine'],
    comments: createSampleComments('Anti-Aging Rejuvenation Therapy Approved'),
    shareUrl: '/predictions/anti-aging-rejuvenation-therapy-approved'
  },

  // 2050 Predictions
  {
    id: 'pred-11',
    slug: 'earth-wide-cybernetic-singularity',
    title: 'Earth-wide Cybernetic Singularity',
    description: 'Atmospheric sensors, oceanic data logs, and city infrastructures are linked into a global neural grid that actively balances Earth ecosystems dynamically.',
    category: 'AI',
    year: 2050,
    author: 'Dr. Ishita Iyer',
    city: 'New York',
    confidenceScore: 68,
    initialVotes: 612,
    votes: 612,
    tags: ['ChronoOS Integration', 'Global Singularity'],
    comments: createSampleComments('Earth-wide Cybernetic Singularity'),
    shareUrl: '/predictions/earth-wide-cybernetic-singularity'
  },
  {
    id: 'pred-12',
    slug: 'sahara-fully-greened-by-desal-grids',
    title: 'Sahara Fully Greened by Desal Grids',
    description: 'Thousands of solar-powered desalination stations pump nutrient-infused water deep into the desert, converting 1.5 million square miles into bio-farms.',
    category: 'Climate',
    year: 2050,
    author: 'Prof. Arjun Sharma',
    city: 'Cairo',
    confidenceScore: 81,
    initialVotes: 518,
    votes: 518,
    tags: ['Desert Greening', 'IPCC Irrigation'],
    comments: createSampleComments('Sahara Fully Greened by Desal Grids'),
    shareUrl: '/predictions/sahara-fully-greened-by-desal-grids'
  },
  {
    id: 'pred-13',
    slug: 'global-fusion-grid-meets-85-percent-demand',
    title: 'Global Fusion Grid Meets 85% Demand',
    description: 'Magnetized fusion networks and orbital space-solar arrays provide the vast majority of human power needs, rendering hydrocarbon plants fully obsolete.',
    category: 'Energy',
    year: 2050,
    author: 'Prof. Arjun Sharma',
    city: 'London',
    confidenceScore: 89,
    initialVotes: 588,
    votes: 588,
    tags: ['Fusion Network', 'Zero Carbon Planet'],
    comments: createSampleComments('Global Fusion Grid Meets 85% Demand'),
    shareUrl: '/predictions/global-fusion-grid-meets-85-percent-demand'
  },
  {
    id: 'pred-14',
    slug: 'asteroid-mining-ship-returns-with-metals',
    title: 'Asteroid Mining Ship Returns with Metals',
    description: 'The automated harvester ship *Vanguard* arrives in High Earth Orbit carrying 20 million tons of raw platinum and rare earth elements extracted from Psyche-16.',
    category: 'Space',
    year: 2050,
    author: 'Dr. Rajesh Nair',
    city: 'Singapore',
    confidenceScore: 74,
    initialVotes: 423,
    votes: 423,
    tags: ['Asteroid Mining', 'Psyche Harvester'],
    comments: createSampleComments('Asteroid Mining Ship Returns with Metals'),
    shareUrl: '/predictions/asteroid-mining-ship-returns-with-metals'
  },
  {
    id: 'pred-15',
    slug: 'fully-biophilic-floating-megacities',
    title: 'Fully Biophilic Floating Megacities',
    description: 'Dynamic floating cities powered by ocean currents and geothermal loops house 50 million climate refugees in the South Pacific, featuring self-healing coral foundations.',
    category: 'Cities',
    year: 2050,
    author: 'Dr. Ishita Iyer',
    city: 'Suva',
    confidenceScore: 76,
    initialVotes: 462,
    votes: 462,
    tags: ['Floating Metropolis', 'Biophilic Coral'],
    comments: createSampleComments('Fully Biophilic Floating Megacities'),
    shareUrl: '/predictions/fully-biophilic-floating-megacities'
  },
  {
    id: 'pred-16',
    slug: 'vacuum-tube-hyperloop-global-web',
    title: 'Vacuum Tube Hyperloop Global Web',
    description: 'Sub-oceanic vacuum tunnels connect London, New York, Tokyo, and Sydney, transporting magnetic cargo and passengers at speeds exceeding Mach 2.5.',
    category: 'Transport',
    year: 2050,
    author: 'Dr. Rajesh Nair',
    city: 'Sydney',
    confidenceScore: 83,
    initialVotes: 495,
    votes: 495,
    tags: ['Trans-oceanic Hyperloop', 'Mach 2.5 Transit'],
    comments: createSampleComments('Vacuum Tube Hyperloop Global Web'),
    shareUrl: '/predictions/vacuum-tube-hyperloop-global-web'
  },
  {
    id: 'pred-17',
    slug: 'nanobot-synthetic-immune-systems',
    title: 'Nanobot Synthetic Immune Systems',
    description: 'Injected microscopic bio-bots patrol the human bloodstream, identifying and neutralizing cancer cells, virus strains, and vascular plaque instantly.',
    category: 'Healthcare',
    year: 2050,
    author: 'Dr. Sneha Patil',
    city: 'New York',
    confidenceScore: 85,
    initialVotes: 540,
    votes: 540,
    tags: ['Nanomedicine', 'Synthetic Biology'],
    comments: createSampleComments('Nanobot Synthetic Immune Systems'),
    shareUrl: '/predictions/nanobot-synthetic-immune-systems'
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

