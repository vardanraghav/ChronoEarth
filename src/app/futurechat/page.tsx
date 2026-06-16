'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BackgroundEffects from '@/components/BackgroundEffects';





// ─── TYPES & DATA ───────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  author: string;
  avatar: string;
  role: string;
  text: string;
  time: string;
  reactions: Record<string, number>;
  replyTo?: { author: string; text: string };
  isAi?: boolean;
}

interface ChatRoom {
  id: string;
  name: string;
  category: string;
  icon: string;
  topic: string;
  onlineCount: number;
}

const ROOMS: ChatRoom[] = [
  { id: 'global', name: 'Global Chat', category: 'Global', icon: '🌍', topic: 'General discussion on the future of humanity, civilization timelines, and planetary metrics.', onlineCount: 7 },
  { id: 'ind', name: 'India Future', category: 'Countries', icon: '🇮🇳', topic: 'Decadal projections for India: semiconductor superpower status, solar microgrids, macroeconomics, and demographics.', onlineCount: 8 },
  { id: 'usa', name: 'USA Future', category: 'Countries', icon: '🇺🇸', topic: 'US technological pipelines: fusion commercialization, quantum encryption, smart cities, and societal shifts.', onlineCount: 6 },
  { id: 'chn', name: 'China Future', category: 'Countries', icon: '🇨🇳', topic: 'Chinese infrastructure updates: spaceports, Gobi desert albedo projects, and neural computing grids.', onlineCount: 5 },
  { id: 'eur', name: 'Europe Future', category: 'Countries', icon: '🇪🇺', topic: 'European updates: clean energy transition, biotech networks, quantum grids, and regulatory frameworks.', onlineCount: 7 },
  { id: 'ai', name: 'AI & AGI', category: 'Sectors', icon: '🤖', topic: 'AGI timelines, compute scaling, neural parameter densities, safety frameworks, and cognitive automation.', onlineCount: 9 },
  { id: 'energy', name: 'Planetary Energy', category: 'Sectors', icon: '⚡', topic: 'Net-gain fusion reactors, baseload ocean thermal grids, space solar mirrors, and green hydrogen supply lines.', onlineCount: 6 },
  { id: 'space', name: 'Space Infra', category: 'Sectors', icon: '🚀', topic: 'Orbit slots, low Earth orbit logistics, lunar mining platforms, launch metrics, and satellite networks.', onlineCount: 8 },
  { id: 'biotech', name: 'Biotechnology', category: 'Sectors', icon: '🧬', topic: 'Synthetic biomes, genetic editing precision, longevity therapeutics, and ecosystem self-repair indices.', onlineCount: 5 },
  { id: 'cities', name: 'Future Cities', category: 'Sectors', icon: '🏙', topic: 'Smart transport grids, accreted coastal reefs, circular resource recycling, and decentralized microgrids.', onlineCount: 7 },
  { id: 'geopolitics', name: 'Geopolitics', category: 'Sectors', icon: '🌐', topic: 'Supply chain security, digital alliances, Arctic shipping routes, resource checkpoints, and space treaties.', onlineCount: 8 },
  { id: 'economy', name: 'Economy', category: 'Sectors', icon: '📈', topic: 'Carbon border tariffs, tokenized raw materials, resource indexes, and universal automation subsidies.', onlineCount: 6 },
  { id: 'defense', name: 'Defense', category: 'Sectors', icon: '🛡', topic: 'Orbital monitoring networks, autonomous logistics pods, software defensive grids, and AI threat modeling.', onlineCount: 7 },
  { id: 'climate', name: 'Climate', category: 'Sectors', icon: '🌱', topic: 'Albedo deflection rates, carbon scrubbing networks, sea-level rise models, and reforestation programs.', onlineCount: 9 },
  { id: 'semiconductors', name: 'Semiconductors', category: 'Sectors', icon: '💻', topic: 'Inland fabs, neural processing units, quantum computing gates, raw mineral buffers, and fabrication yields.', onlineCount: 8 },
  { id: '2030', name: '2030 Chat', category: 'Timeline', icon: '⏳', topic: 'Reviewing 2030 targets: initial fusion ignition, early-stage AGI models, and electric vehicle adoption.', onlineCount: 6 },
  { id: '2040', name: '2040 Chat', category: 'Timeline', icon: '⏳', topic: 'Reviewing 2040 targets: commercial AGI realization, 90% renewable grids, and orbital cargo systems.', onlineCount: 7 },
  { id: '2050', name: '2050 Chat', category: 'Timeline', icon: '⏳', topic: 'Reviewing 2050 targets: planetary zero-emissions, space elevator tests, and offworld mining logistics.', onlineCount: 8 },
  { id: '2060', name: '2060 Chat', category: 'Timeline', icon: '⏳', topic: 'Long-term forecasting: stellar exploration networks, ocean floor colonization, and neural integrations.', onlineCount: 5 }
];

const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  global: [
    { id: 'g-1', author: 'Ananya_Iyer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80', role: 'AI Safety Lead', text: 'Hey guys, has anyone reviewed the raw confidence score models for 2040 AGI realisation?', time: '09:05', reactions: { '👍': 4, '🚀': 2 } },
    { id: 'g-2', author: 'Dr_Aditya_Rao', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80', role: 'Strategic Futurologist', text: 'Yes yaar, the models show a sudden 12% probability jump due to the new quantum gate yields. Looks super solid.', time: '09:07', reactions: { '🤯': 5 } },
    { id: 'g-3', author: 'Pranav_Foresight', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80', role: 'System Monitor', text: 'SYSTEM ALERT: Climate stress coefficients for delta regions updated. Proceed with caution, brothers.', time: '09:10', reactions: { '⚠️': 1 } }
  ],
  ai: [
    { id: 'ai-1', author: 'Ananya_Iyer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80', role: 'AI Safety Lead', text: 'Neural parameter scaling has hit the hardware bottleneck in high-density chips. Big tension for the next cluster.', time: '08:45', reactions: { '👍': 3 } },
    { id: 'ai-2', author: 'Rohan_Qubit', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80', role: 'Hardware Architect', text: 'Decentralized neural fabrics could bypass this easily if we entangle nodes over quantum links. Let\'s try it.', time: '08:52', reactions: { '🚀': 4, '🤯': 2 } }
  ],
  energy: [
    { id: 'en-1', author: 'Dr_Aditya_Rao', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80', role: 'Strategic Futurologist', text: 'ITER Cadarache is reporting a steady Q = 22 net energy gain inside modular trials. Truly game-changing!', time: '09:01', reactions: { '🔥': 8, '👍': 3 } },
    { id: 'en-2', author: 'Amit_Solar', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80&auto=format&fit=crop&q=80', role: 'Grid Analyst', text: 'Superb! That makes municipal baseload microgrids fully viable for floating cities as well.', time: '09:14', reactions: { '👍': 5 } }
  ],
  ind: [
    { id: 'ind-1', author: 'Aarav_Bengaluru', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80', role: 'Futurologist', text: 'Hey guys, did you see the new monorail construction updates in Bengaluru? Commuting is going to be so much easier, yaar.', time: '09:02', reactions: { '👍': 3 } },
    { id: 'ind-2', author: 'Diya_Tech', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80', role: 'Systems Engineer', text: 'Yeah, it\'s fully automated. Supposedly launches early next year. No more traffic tension!', time: '09:05', reactions: { '🚀': 2 } }
  ]
};

const RANDOM_DISCUSSIONS: Record<string, Array<{ author: string; role: string; avatar: string; text: string }>> = {
  global: [
    { author: 'Karan_Space', role: 'Orbital Logistics', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80', text: 'Should we prioritize Lagrange point spaceports over direct lunar launches, bhai?' },
    { author: 'Sanya_2050', role: 'Ecosystem Architect', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80', text: 'Carbon border taxes are driving 100% clean supply lines in Southeast Asian zones. Very neat.' },
    { author: 'Sameer_Cyber', role: 'FUI Enthusiast', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80&auto=format&fit=crop&q=80', text: 'I think the geopolitical shift towards decentralized chip blocks is accelerating. Solid move.' }
  ],
  ind: [
    { author: 'Aarav_Bengaluru', role: 'Futurologist', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80', text: 'The Gujarat semiconductor cluster yields look incredible. Self-reliance by 2035 is highly likely, guys.' },
    { author: 'Rohan_Sys', role: 'Grid Analyst', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80', text: 'The smart grid integration in Chennai is really stabilizing energy fluctuations nicely.' },
    { author: 'Diya_Tech', role: 'Systems Engineer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80', text: 'We are finally seeing proper flood buffers in the Mumbai sub-basins. Big relief!' }
  ],
  usa: [
    { author: 'Tanvi_Innovations', role: 'Longevity Researcher', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80', text: 'The FDA has just cleared a new gene therapeutic targeting cellular senescence markers. Massive potential.' },
    { author: 'Arjun_Quantum', role: 'Cryptography Expert', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80', text: 'Austin neural centers are transitioning fully to quantum-entangled security lines. Absolutely needed.' }
  ],
  chn: [
    { author: 'Dev_Semis', role: 'Algorithmic Lead', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80', text: 'Shenzhen chip fabrics are testing carbon tariff compliance adjustors. Interesting.' },
    { author: 'Kavya_DesertBloom', role: 'Ecosystem Specialist', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80', text: 'Albedo deflectors in the Gobi desert are reflecting an average 1.5% irradiance now. Works well.' }
  ],
  eur: [
    { author: 'Sneha_Quantum', role: 'Quantum Physicist', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80', text: 'Munich Quantum Node has entangled 10,000 qubit arrays with negligible transit delays. Superb achievement.' },
    { author: 'Rajesh_Ecology', role: 'Climate Strategist', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80', text: 'Rotterdam smart ports are now 100% automated with zero-emissions logistics. Very neat setup.' }
  ],
  ai: [
    { author: 'Ishaan_Logic', role: 'Machine Intelligence', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80', text: 'If neural density surpasses human synapse counts by 2035, will safety overrides hold, yaar?' },
    { author: 'Priya_Ethicist', role: 'AI Safety Advocate', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80', text: 'We need to bake hardware lock switches directly into compute clusters to prevent drift.' }
  ],
  energy: [
    { author: 'Karan_Fission', role: 'Nuclear Analyst', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80', text: 'Ocean thermal energy conversions are proving much more reliable than wind loops, guys.' }
  ],
  semiconductors: [
    { author: 'Sunil_Silicon', role: 'Yield Specialist', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80', text: 'Lithography yields are hitting 99% in secure inland fabs. Decentralization is really paying off.' }
  ]
};

const DISCUSSION_THREADS: Record<string, Array<Array<{ author: string; role: string; avatar: string; text: string }>>> = {
  global: [
    [
      { author: 'Ananya_Iyer', role: 'AI Safety Lead', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80', text: 'I think AGI before 2040 is almost guaranteed at this point, guys.' },
      { author: 'Rohan_Qubit', role: 'Hardware Architect', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80', text: 'No way, yaar. Energy grid capacity and raw compute limitations are still huge bottlenecks.' },
      { author: 'Tanvi_Innovations', role: 'Longevity Researcher', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80', text: 'People said the exact same thing about smartphone scaling back in 2005. Look where we are.' },
      { author: 'Sameer_West', role: 'System Analyst', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80&auto=format&fit=crop&q=80', text: 'Interesting point. The real bottleneck might be international regulation though.' }
    ],
    [
      { author: 'Karan_Space', role: 'Orbital Logistics', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80', text: 'We seriously need to clean up low Earth orbit before launching more cargo fleets, guys.' },
      { author: 'Dev_Semis', role: 'Algorithmic Lead', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80', text: 'Agreed, bhai. One bad cascade collision and we are locked out of orbit for a century.' },
      { author: 'Dr_Aditya_Rao', role: 'Strategic Futurologist', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80', text: 'Isn\'t there a startup testing automated laser sweepers from L1?' },
      { author: 'Arjun_Quantum', role: 'Cryptography Expert', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80', text: 'Yeah, but it\'s currently stuck in treaty approvals. Geopolitics as usual, no progress.' }
    ],
    [
      { author: 'Amit_Solar', role: 'Grid Analyst', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80&auto=format&fit=crop&q=80', text: 'Wait, did anyone see the new confinement metrics from ITER? Q=22 is insane!' },
      { author: 'Karan_Fission', role: 'Nuclear Analyst', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80', text: 'Unpopular opinion: fusion is still 20 years away from actual commercial grid integration.' },
      { author: 'Amit_Fabs', role: 'Silicon Architect', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80', text: 'Even if it takes 20 years, it completely changes the terminal value of civilization.' },
      { author: 'Sneha_Quantum', role: 'Quantum Physicist', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80', text: 'Exactly. It\'s the ultimate cheat code for climate stabilization.' }
    ]
  ],
  ai: [
    [
      { author: 'Ishaan_Logic', role: 'Machine Intelligence', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80', text: 'If neural density surpasses human synapse counts by 2035, will safety overrides hold, yaar?' },
      { author: 'Priya_Ethicist', role: 'AI Safety Advocate', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80', text: 'We need to bake hardware lock switches directly into the compute clusters to prevent drift.' },
      { author: 'Ishaan_Logic', role: 'Machine Intelligence', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80', text: 'A hardware lock is useless if the system is distributed across 10 million edge nodes though.' }
    ],
    [
      { author: 'Ananya_Iyer', role: 'AI Safety Lead', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80', text: 'The new transformer-mesh architectures are showing extreme zero-shot reasoning leaps.' },
      { author: 'Sameer_West', role: 'System Analyst', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80&auto=format&fit=crop&q=80', text: 'Zero-shot is fine, but how do we prevent hallucination cascades in critical medical grids, bhai?' },
      { author: 'Ananya_Iyer', role: 'AI Safety Lead', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80', text: 'We wrap them in deterministic verification layers. Basically, code checking code.' }
    ]
  ],
  energy: [
    [
      { author: 'Amit_Solar', role: 'Grid Analyst', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80&auto=format&fit=crop&q=80', text: 'Are we ignoring space-based solar mirrors? They bypass the weather/night bottleneck entirely.' },
      { author: 'Karan_Fission', role: 'Nuclear Analyst', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80', text: 'The beam-down transmission efficiency is still under 40% though. Fusion is much tighter.' },
      { author: 'Rajesh_Ecology', role: 'Climate Strategist', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80', text: 'Even 40% efficiency on constant solar is better than land-based solar with batteries.' }
    ]
  ],
  ind: [
    [
      { author: 'Aarav_Bengaluru', role: 'Futurologist', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80', text: 'Is the hyperloop line between Bengaluru and Chennai actually opening in 2032? Commuting would be so much easier, yaar.' },
      { author: 'Diya_Tech', role: 'Systems Engineer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80', text: 'Yes, trial run phase 3 starts next month. 20 minutes from KIAL to Chennai Central is wild.' },
      { author: 'Rohan_Sys', role: 'Grid Analyst', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80', text: 'Unbelievable. But let\'s hope it runs on green energy. The grid is already under load.' },
      { author: 'Ananya_Ecology', role: 'Ecosystem Architect', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80', text: 'It\'s fully powered by the solar fields near Kolar. Solar-backed transport is the way forward.' }
    ],
    [
      { author: 'Dev_Gujarat', role: 'Silicon Lead', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80', text: 'Semiconductor yields at the Sanand fab are hitting 98%! We might not need to import anything by 2035.' },
      { author: 'Ishaan_Chips', role: 'VLSI Engineer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80', text: 'Exactly. The local supply chain is growing so fast. Lots of job openings for VLSI grads.' },
      { author: 'Aarav_Bengaluru', role: 'Futurologist', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80', text: 'True, even Bengaluru design houses are shifting their layouts to Gujarat fabs.' }
    ],
    [
      { author: 'Ananya_Ecology', role: 'Ecosystem Architect', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80', text: 'The Thar solar shields are reflecting 2% solar irradiance. Climate warming indices in Rajasthan are actually stabilizing.' },
      { author: 'Dev_Gujarat', role: 'Silicon Lead', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80', text: 'Awesome. I heard they are installing atmospheric water generators powered by the same solar grids.' },
      { author: 'Rohan_Sys', role: 'Grid Analyst', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80', text: 'Yes, clean water plus clean energy. Thar is going to be our powerhouse.' }
    ]
  ],
  usa: [
    [
      { author: 'Sameer_West', role: 'System Analyst', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80&auto=format&fit=crop&q=80', text: 'Austin computing labs & security lines are transitioning fully to quantum-entangled security.' },
      { author: 'Arjun_Quantum', role: 'Cryptography Expert', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80', text: 'Long overdue. Classical standards are getting run over by quantum gate yields.' }
    ]
  ],
  chn: [
    [
      { author: 'Dev_Wei', role: 'Quantum Lead', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80', text: 'The new quantum cryptography hubs in Shenzhen are now fully operational.' },
      { author: 'Kavya_DesertBloom', role: 'Ecosystem Specialist', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80', text: 'Incredible speed. How is the albedo alinement looking over the Gobi solar deflector arrays?' },
      { author: 'Dev_Wei', role: 'Quantum Lead', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80', text: 'Deflecting 1.2% solar irradiance steadily. The climate stabilization loop is holding.' }
    ]
  ]
};

// ─── CHRONOAI ANSWERS ────────────────────────────────────────────────────────
const getAiResponse = (query: string, room: string): string => {
  const q = query.toLowerCase();
  if (q.includes('india') || q.includes('economy')) {
    return 'Based on ChronoEarth GDP models and demographic projections, India\'s probability of becoming the largest or second largest economy by 2050 is rated HIGH (78%). Key drivers: high working-age population buffers, local semiconductor fab yields, and complete transition to solar microgrids.';
  }
  if (q.includes('agi') || q.includes('intelligence') || q.includes('2040')) {
    return 'Cognitive neural scaling matrices indicate that commercial AGI realization is probable (72% confidence) between 2038 and 2042. Major bottlenecks: compute capacity bounds and raw material gate yields. AGI emergence would automate 88% of strategic forecasting lines.';
  }
  if (q.includes('fusion') || q.includes('energy')) {
    return 'ITER reactor confinement metrics project grid integration of net-gain fusion by 2045. Baseload energy gain ratio (Q = 22) has been verified. Fusion adoption will reduce global ocean warming stress by 18% and render coal arrays fully obsolete.';
  }
  if (q.includes('semiconductor') || q.includes('fabs')) {
    return 'Decentralized microchip blocks have shifted fabrications to secure inland nodes. Fabs are running at 98.5% yield rates, supported by critical raw mineral reserves. Trade bottlenecks are bypassed via new secure transport networks.';
  }
  return 'Foresight models compiled. Current simulation indicators show stable trajectories. Parameter values: population scaling (8.4B by 2050), global temperature rise capped at +1.45°C under active albedo mirror arrays.';
};

function FutureChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Selected Room
  const roomParam = searchParams.get('room');
  const activeRoomCode = roomParam ? roomParam.toLowerCase() : 'global';
  
  // Custom room generator
  const getDynamicRoom = (code: string): ChatRoom => {
    const c = code.toUpperCase();
    const countryNames: Record<string, string> = {
      IND: 'India Future',
      USA: 'USA Future',
      CHN: 'China Future',
      JPN: 'Japan Future',
      GBR: 'United Kingdom Future',
      DEU: 'Germany Future',
      SGP: 'Singapore Future',
      ARE: 'UAE Future',
      FRA: 'France Future',
      RUS: 'Russia Future',
      BRA: 'Brazil Future',
      CAN: 'Canada Future',
      AUS: 'Australia Future',
      ZAF: 'South Africa Future',
    };
    const countryFlags: Record<string, string> = {
      IND: '🇮🇳',
      USA: '🇺🇸',
      CHN: '🇨🇳',
      JPN: '🇯🇵',
      GBR: '🇬🇧',
      DEU: '🇩🇪',
      SGP: '🇸🇬',
      ARE: '🇦🇪',
      FRA: '🇫🇷',
      RUS: '🇷🇺',
      BRA: '🇧🇷',
      CAN: '🇨🇦',
      AUS: '🇦🇺',
      ZAF: '🇿🇦',
    };
    const name = countryNames[c] || `${c} Future`;
    const flag = countryFlags[c] || '🏳️';
    return {
      id: code.toLowerCase(),
      name,
      category: 'Countries',
      icon: flag,
      topic: `Foresight discussions and projections for ${name}. Monitoring macroeconomics, resources, and tech corridors.`,
      onlineCount: Math.floor(Math.random() * 5) + 5
    };
  };

  // Find or create active room
  let activeRoom = ROOMS.find(r => r.id === activeRoomCode || r.name.toLowerCase().includes(activeRoomCode));
  if (!activeRoom && roomParam) {
    activeRoom = getDynamicRoom(roomParam);
  }
  if (!activeRoom) {
    activeRoom = ROOMS[0];
  }

  // Combine static rooms with dynamic active room if it is not static
  const displayRooms = [...ROOMS];
  if (roomParam && !ROOMS.some(r => r.id === roomParam.toLowerCase())) {
    displayRooms.push(activeRoom);
  }

  // States
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState<ChatMessage | null>(null);
  
  // Voice room mock state
  const [isAudioConnected, setIsAudioConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [raisedHand, setRaisedHand] = useState(false);

  // Safety lists
  const [mutedUsers, setMutedUsers] = useState<Set<string>>(new Set());
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Believable online counts state (5 - 9)
  const [onlineCounts, setOnlineCounts] = useState<Record<string, number>>({});

  // Active thread state to simulate cohesive conversations
  const [activeThread, setActiveThread] = useState<{ room: string; threadIndex: number; messageIndex: number } | null>(null);

  const messageEndRef = useRef<HTMLDivElement>(null);

  // Initialize online counts dynamically between 5 and 9
  useEffect(() => {
    const initialCounts: Record<string, number> = {};
    displayRooms.forEach(room => {
      // Pick random believable starting counts (5 to 9)
      initialCounts[room.id] = Math.floor(Math.random() * 5) + 5;
    });
    setOnlineCounts(initialCounts);
  }, [displayRooms.length]);

  // Slowly drift online counts over time to make them look alive (5 to 9)
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCounts(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(roomId => {
          const shift = Math.random() < 0.5 ? 1 : -1;
          next[roomId] = Math.max(5, Math.min(9, (next[roomId] || 7) + (Math.random() < 0.3 ? shift : 0)));
        });
        return next;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Load message logs & initialize
  useEffect(() => {
    // Load existing messages or populate from defaults
    const defaults = MOCK_MESSAGES[activeRoom.id] || [
      { id: 'd-1', author: 'Global_Citizen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80', role: 'Planetary Citizen', text: `Welcome to the #${activeRoom.name.toLowerCase().replace(/\s+/g, '-')} foresight channel. Projections matrix sync active.`, time: '09:00', reactions: {} }
    ];
    setMessages(defaults);
    setActiveThread(null);
    setReplyMessage(null);
  }, [activeRoom.id]);

  // Scroll to bottom
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  // Cohesive Fallback threads generator for rooms without predefined threads
  const getFallbackThreads = (room: ChatRoom) => {
    return [
      [
        { author: 'Fateh_Future', role: 'Futurologist', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80', text: `Honestly, the projected growth curve for #${room.id} looks much steeper than we predicted last year.` },
        { author: 'Siddharth_Node', role: 'Strategic Analyst', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80', text: 'I am still highly skeptical. We haven\'t accounted for resource scarcity and regulatory delays.' },
        { author: 'Tanvi_Tech', role: 'Systems Engineer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80', text: 'Scarcity can be solved by carbon-neutral synthesis, but I agree on the regulatory bottlenecks.' }
      ]
    ];
  };

  // Automated Message Simulation Engine supporting thread sequences
  useEffect(() => {
    const triggerSimulation = () => {
      let roomThreads = DISCUSSION_THREADS[activeRoom.id];
      if (!roomThreads) {
        roomThreads = getFallbackThreads(activeRoom);
      }

      // 1. Check if there is an active thread for the current room
      if (activeThread && activeThread.room === activeRoom.id) {
        const thread = roomThreads[activeThread.threadIndex];
        if (thread && activeThread.messageIndex < thread.length) {
          const nextMsgTemplate = thread[activeThread.messageIndex];
          
          if (blockedUsers.has(nextMsgTemplate.author) || mutedUsers.has(nextMsgTemplate.author)) {
            // Advance past blocked user's message
            setActiveThread(prev => prev ? { ...prev, messageIndex: prev.messageIndex + 1 } : null);
            return;
          }

          setTypingUser(nextMsgTemplate.author);
          setTimeout(() => {
            setTypingUser(null);
            const newMsg: ChatMessage = {
              id: `sim-${Date.now()}`,
              author: nextMsgTemplate.author,
              avatar: nextMsgTemplate.avatar,
              role: nextMsgTemplate.role,
              text: nextMsgTemplate.text,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              reactions: {}
            };
            setMessages(prev => [...prev, newMsg]);

            if (activeThread.messageIndex + 1 >= thread.length) {
              setActiveThread(null); // Thread finished
            } else {
              setActiveThread(prev => prev ? { ...prev, messageIndex: prev.messageIndex + 1 } : null);
            }
          }, 2000);
          return;
        } else {
          setActiveThread(null);
        }
      }

      // 2. Start a new thread or post a single message
      const startThread = Math.random() < 0.6 && roomThreads && roomThreads.length > 0;

      if (startThread) {
        const threadIndex = Math.floor(Math.random() * roomThreads.length);
        const thread = roomThreads[threadIndex];
        const firstMsgTemplate = thread[0];
        
        if (blockedUsers.has(firstMsgTemplate.author) || mutedUsers.has(firstMsgTemplate.author)) return;

        setTypingUser(firstMsgTemplate.author);
        setTimeout(() => {
          setTypingUser(null);
          const newMsg: ChatMessage = {
            id: `sim-${Date.now()}`,
            author: firstMsgTemplate.author,
            avatar: firstMsgTemplate.avatar,
            role: firstMsgTemplate.role,
            text: firstMsgTemplate.text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            reactions: {}
          };
          setMessages(prev => [...prev, newMsg]);

          if (thread.length > 1) {
            setActiveThread({ room: activeRoom.id, threadIndex, messageIndex: 1 });
          } else {
            setActiveThread(null);
          }
        }, 2000);
      } else {
        // Fallback: Pick single random text template for active room
        let options = RANDOM_DISCUSSIONS[activeRoom.id];
        if (!options && activeRoom.category === 'Countries') {
          options = [
            { author: 'Aditya_Foresight', role: 'Macro Strategist', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80', text: `How is the infrastructural buildout looking for ${activeRoom.name} by 2040?` },
            { author: 'Gita_Citizen', role: 'Planetary Citizen', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80', text: `Monitoring the climate resilience index and agricultural outputs in the ${activeRoom.name} corridor.` },
            { author: 'Farhan_Enthusiast', role: 'Futurologist', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80&auto=format&fit=crop&q=80', text: `With decentralization accelerating, ${activeRoom.name} is positioning itself as a key regional node.` }
          ];
        }
        if (!options && activeRoom.category === 'Timeline') {
          options = [
            { author: 'Tarun_Traveler', role: 'Chronology Analyst', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80', text: `Comparing current simulation data points to our target benchmarks for ${activeRoom.name}.` },
            { author: 'Farah_Foresight', role: 'Strategic Director', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80', text: `The probability curve for orbital manufacturing and green transition milestones looks highly stable in the ${activeRoom.name} horizon.` },
            { author: 'Manoj_Predictor', role: 'Algorithmic Lead', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80', text: `Will we see complete convergence of carbon capture targets before ${activeRoom.id}?` }
          ];
        }
        if (!options && activeRoom.category === 'Sectors') {
          options = [
            { author: 'Sanjay_Analyst', role: 'Subject Expert', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80', text: `The latest research indices in the #${activeRoom.id} sector indicate a major productivity leap.` },
            { author: 'Farhan_Foresight', role: 'Innovation Scout', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80', text: `Are there any regulatory roadblocks for these proposed ${activeRoom.name.toLowerCase()} grids?` },
            { author: 'Tanvi_Tech', role: 'Systems Engineer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80', text: `Decentralized networks are making it much easier to deploy sandbox trials for ${activeRoom.name.toLowerCase()}.` }
          ];
        }
        if (!options) {
          options = RANDOM_DISCUSSIONS.global;
        }
        const template = options[Math.floor(Math.random() * options.length)];
        if (!template || blockedUsers.has(template.author) || mutedUsers.has(template.author)) return;

        setTypingUser(template.author);
        setTimeout(() => {
          setTypingUser(null);
          const newMsg: ChatMessage = {
            id: `sim-${Date.now()}`,
            author: template.author,
            avatar: template.avatar,
            role: template.role,
            text: template.text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            reactions: {}
          };
          setMessages(prev => [...prev, newMsg]);
        }, 2000);
      }
    };

    // Trigger simulation every 14 seconds
    const interval = setInterval(triggerSimulation, 14000);
    return () => clearInterval(interval);
  }, [activeRoom.id, blockedUsers, mutedUsers, activeThread]);

  // Send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const myMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      author: 'You_Citizen',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop&q=80',
      role: 'Strategic Analyst',
      text: inputValue,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: {},
      replyTo: replyMessage ? { author: replyMessage.author, text: replyMessage.text } : undefined
    };

    setMessages(prev => [...prev, myMsg]);
    setInputValue('');
    setReplyMessage(null);

    // ChronoAI Trigger Check
    const matchesAi = inputValue.includes('@ChronoAI') || inputValue.toLowerCase().includes('@ai') || inputValue.endsWith('?');
    if (matchesAi) {
      // Trigger AI reply
      setTimeout(() => {
        setTypingUser('ChronoAI');
      }, 600);

      setTimeout(() => {
        setTypingUser(null);
        const aiAnswerText = getAiResponse(inputValue, activeRoom.name);
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          author: 'ChronoAI',
          avatar: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=80&auto=format&fit=crop&q=80',
          role: 'Platform Intelligence Core',
          text: aiAnswerText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          reactions: { '🤖': 2, '🚀': 1 },
          isAi: true,
          replyTo: { author: 'You_Citizen', text: inputValue }
        };
        setMessages(prev => [...prev, aiMsg]);
      }, 2500);
    }
  };

  const addReaction = (msgId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        const count = m.reactions[emoji] || 0;
        return {
          ...m,
          reactions: { ...m.reactions, [emoji]: count + 1 }
        };
      }
      return m;
    }));
  };

  // Safety handlers
  const handleMute = (username: string) => {
    setMutedUsers(prev => {
      const next = new Set(prev);
      next.add(username);
      return next;
    });
    triggerFeedback(`User ${username} muted. Messages hidden.`);
  };

  const handleBlock = (username: string) => {
    setBlockedUsers(prev => {
      const next = new Set(prev);
      next.add(username);
      return next;
    });
    setMessages(prev => prev.filter(m => m.author !== username));
    triggerFeedback(`User ${username} blocked.`);
  };

  const handleReport = (msgId: string) => {
    triggerFeedback('Message reported to cognitive sanitization core.');
  };

  const triggerFeedback = (txt: string) => {
    setFeedbackMsg(txt);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Group rooms by category
  const categories = Array.from(new Set(displayRooms.map(r => r.category)));

  // Filter messages based on safety lists
  const visibleMessages = messages.filter(m => !mutedUsers.has(m.author) && !blockedUsers.has(m.author));

  return (
    <main className="h-screen w-screen bg-[#02060B] text-[#EAF7FF] relative overflow-hidden flex flex-col font-sans">
      <BackgroundEffects earthMode="cyber" />
      <Navbar />

      {/* Premium Badged Header */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-[#040B12]/70 border-b border-white/5 mt-20 z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-white tracking-wide uppercase font-display m-0">FutureChat Beta</h1>
          <span className="px-2 py-0.5 bg-[#00E5FF]/10 text-[#00E5FF] text-[9px] font-mono rounded uppercase tracking-wider font-semibold border border-[#00E5FF]/20">Community Preview</span>
        </div>
        <span className="px-2 py-0.5 bg-[#6FEAFF]/10 text-[#6FEAFF] text-[9px] font-mono rounded uppercase tracking-wider font-semibold border border-[#6FEAFF]/20 flex items-center gap-1.5 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6FEAFF]" />
          AI Simulated Discussions Active
        </span>
      </div>

      {/* Floating feedback toast */}
      {feedbackMsg && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 px-5 py-2.5 bg-black/90 border border-[#00E5FF] text-[#00E5FF] text-xs font-mono rounded z-50 shadow-[0_0_20px_rgba(0, 229, 255,0.3)] animate-fade-up">
          ⚡ {feedbackMsg}
        </div>
      )}

      {/* Dynamic Voice Stage Connection Overlay */}
      {isAudioConnected && (
        <div className="fixed bottom-24 left-10 z-50 premium-glass p-4 rounded-lg flex items-center gap-4 border border-[#00E5FF]/30 shadow-[0_0_24px_rgba(0, 229, 255,0.15)] animate-fade-up">
          <div className="flex flex-col gap-1 font-mono">
            <span className="text-[9px] text-[#00E5FF] uppercase font-bold tracking-widest flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Connected to voice stage
            </span>
            <span className="text-[11px] text-white">Future debate: Fusion vs Fission</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className={`p-2 rounded cursor-pointer border text-xs transition-colors ${
                isMuted ? 'bg-rose-950/40 border-rose-500/30 text-rose-400' : 'bg-[#00E5FF]/10 border-[#00E5FF]/30 text-[#00E5FF]'
              }`}
            >
              {isMuted ? '🎤 Muted' : '🎤 Active'}
            </button>
            <button 
              onClick={() => setRaisedHand(!raisedHand)} 
              className={`p-2 rounded cursor-pointer border text-xs transition-colors ${
                raisedHand ? 'bg-[#00E5FF] border-transparent text-black font-bold' : 'bg-transparent border-white/10 text-white/60'
              }`}
            >
              ✋
            </button>
            <button 
              onClick={() => setIsAudioConnected(false)} 
              className="p-2 rounded cursor-pointer bg-rose-600 hover:bg-rose-700 text-white text-xs border border-transparent"
            >
              Leave
            </button>
          </div>
        </div>
      )}

      {/* main Grid Layout */}
      <div className="flex-1 pt-24 pb-4 px-6 grid grid-cols-1 lg:grid-cols-[260px_1fr_320px] gap-6 overflow-hidden">
        
        {/* COLUMN 1: SIDEBAR CHANNEL SELECTOR */}
        <div className="premium-glass p-5 rounded-lg flex flex-col gap-6 overflow-y-auto custom-scrollbar h-full bg-[#040B12]/85">
          <div className="flex flex-col gap-1 border-b border-[#00E5FF]/15 pb-3">
            <span className="text-[10px] font-mono text-[#00E5FF] uppercase tracking-widest font-semibold">FutureChat Node</span>
            <h3 className="text-sm font-bold text-white tracking-wider uppercase font-mono m-0">Planetary Rooms</h3>
          </div>

          <div className="flex flex-col gap-5">
            {categories.map((cat) => (
              <div key={cat} className="flex flex-col gap-1">
                <span className="text-[9px] font-mono text-[#94A3B8] uppercase tracking-[0.2em] font-bold mb-1 px-2">{cat}</span>
                <div className="flex flex-col gap-0.5">
                  {displayRooms.filter(r => r.category === cat).map((room) => {
                    const isSelected = activeRoom.id === room.id;
                    return (
                      <button
                        key={room.id}
                        onClick={() => router.push(`/futurechat?room=${room.id}`)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded font-mono transition-all text-left cursor-pointer border ${
                          isSelected
                            ? 'bg-[#00E5FF]/10 border-[#00E5FF]/30 text-[#00E5FF] font-semibold'
                            : 'bg-transparent border-transparent text-white/55 hover:bg-white/2 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={isSelected ? 'animate-breathe' : ''}>{room.icon}</span>
                          <span>#{room.name.toLowerCase().replace(/\s+/g, '-')}</span>
                        </div>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: MESSAGING AREA */}
        <div className="premium-glass rounded-lg flex flex-col overflow-hidden h-full bg-[#040B12]/80 border border-white/5 relative">
          
          {/* Channel Header */}
          <div className="px-6 py-4 border-b border-[#00E5FF]/15 bg-black/40 flex justify-between items-center">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-sm font-bold text-white tracking-wide m-0 flex items-center gap-2">
                <span>{activeRoom.icon}</span>
                <span>#{activeRoom.name.toLowerCase().replace(/\s+/g, '-')}</span>
              </h2>
              <span className="text-[10px] text-[#94A3B8] font-light font-mono truncate max-w-lg">{activeRoom.topic}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400 font-bold">{(onlineCounts[activeRoom.id] || 7).toLocaleString()} Online</span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 px-6 py-4 overflow-y-auto custom-scrollbar flex flex-col gap-4 bg-black/10">
            {visibleMessages.map((msg) => {
              const isAi = msg.isAi;
              return (
                <div 
                  key={msg.id} 
                  className={`group flex gap-4 items-start p-3.5 rounded-lg border transition-all duration-300 relative ${
                    isAi 
                      ? 'bg-[#00E5FF]/5 border-[#00E5FF]/20' 
                      : 'bg-black/30 border-transparent hover:border-white/5'
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-white/10 bg-white/5">
                    <img src={msg.avatar} alt={msg.author} className="w-full h-full object-cover" />
                  </div>

                  {/* Body */}
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex items-center gap-2">
                        <span className="chat-username font-bold text-white font-mono">{msg.author}</span>
                        {isAi && (
                          <span className="text-[7px] font-mono font-bold bg-[#00E5FF] text-[#02060A] px-1 rounded-sm uppercase tracking-wider">
                            ChronoAI
                          </span>
                        )}
                        <span className="chat-role font-mono text-[#94A3B8] uppercase tracking-wider px-1 bg-white/5 rounded">
                          {msg.role}
                        </span>
                      </div>
                      <span className="chat-timestamp font-mono text-[#7A8694]">{msg.time}</span>
                    </div>

                    {/* Reply quote */}
                    {msg.replyTo && (
                      <div className="bg-black/40 border-l-2 border-[#00E5FF]/40 pl-2.5 py-1 text-[10px] text-[#94A3B8] italic rounded mb-1">
                        @{msg.replyTo.author}: "{msg.replyTo.text}"
                      </div>
                    )}

                    <p className={`chat-message-body text-xs leading-relaxed m-0 font-light ${isAi ? 'text-[#00E5FF]' : 'text-[#E2E8F0]'}`}>
                      {msg.text}
                    </p>

                    {/* Reactions display */}
                    {Object.keys(msg.reactions).length > 0 && (
                      <div className="flex gap-1.5 mt-2">
                        {Object.entries(msg.reactions).map(([emoji, count]) => (
                          <button
                            key={emoji}
                            onClick={() => addReaction(msg.id, emoji)}
                            className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[10px] flex items-center gap-1 hover:border-[#00E5FF]/40 transition-colors cursor-pointer text-white/70"
                          >
                            <span>{emoji}</span>
                            <span className="font-mono text-[9px] font-semibold">{count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Context menu actions overlay on hover */}
                  <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-black/80 border border-white/10 rounded p-1 shadow-lg z-10">
                    {['👍', '🔥', '🚀', '🤯'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => addReaction(msg.id, emoji)}
                        className="hover:scale-125 transition-transform p-1 cursor-pointer bg-transparent border-none text-xs"
                      >
                        {emoji}
                      </button>
                    ))}
                    <div className="w-[1px] bg-white/10 mx-1" />
                    <button 
                      onClick={() => setReplyMessage(msg)}
                      className="text-[9px] text-[#00E5FF] font-mono px-1.5 hover:underline cursor-pointer bg-transparent border-none"
                    >
                      [REPLY]
                    </button>
                    <button 
                      onClick={() => handleMute(msg.author)}
                      className="text-[9px] text-[#94A3B8] font-mono px-1.5 hover:text-white cursor-pointer bg-transparent border-none"
                    >
                      [MUTE]
                    </button>
                    <button 
                      onClick={() => handleBlock(msg.author)}
                      className="text-[9px] text-rose-400 font-mono px-1.5 hover:text-rose-500 cursor-pointer bg-transparent border-none"
                    >
                      [BLOCK]
                    </button>
                    <button 
                      onClick={() => handleReport(msg.id)}
                      className="text-[9px] text-[#7A8694] font-mono px-1.5 hover:text-white cursor-pointer bg-transparent border-none"
                    >
                      [REPORT]
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Simulated Typing Indicator */}
            {typingUser && (
              <div className="flex gap-4 items-start p-3 bg-black/10 border border-transparent rounded-lg">
                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-white/5 bg-white/2 flex items-center justify-center text-[10px] font-bold text-white">
                  Typ
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-xs font-bold text-white/50 font-mono">{typingUser}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] font-mono text-[#94A3B8] italic">is processing tensors</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>

          {/* Reply Quote Banner */}
          {replyMessage && (
            <div className="px-6 py-2 bg-[#00E5FF]/5 border-t border-[#00E5FF]/15 flex justify-between items-center text-xs text-[#94A3B8]">
              <span>Replying to <span className="text-[#00E5FF] font-mono font-semibold">@{replyMessage.author}</span>: "{replyMessage.text.slice(0, 50)}..."</span>
              <button 
                onClick={() => setReplyMessage(null)}
                className="text-rose-400 hover:text-rose-500 font-mono bg-transparent border-none cursor-pointer"
              >
                [✕ CANCEL]
              </button>
            </div>
          )}

          {/* Chat Input form */}
          <form onSubmit={handleSendMessage} className="px-6 py-4 bg-[#02060B]/70 border-t border-[#00E5FF]/15 flex gap-3 items-center">
            <span className="text-[#00E5FF] font-bold font-mono select-none">chrono_os:~$ &gt;</span>
            <input
              type="text"
              placeholder="Synthesize forecast idea... (Ask question ending in '?' or mention @ai for ChronoAI analysis)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder-white/20 font-mono"
            />
            <div className="flex gap-2 shrink-0">
              {['👍', '🔥', '🚀', '🤯'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setInputValue(prev => prev + ` ${emoji}`)}
                  className="bg-white/5 border border-white/10 hover:border-[#00E5FF]/40 transition-colors p-1.5 rounded text-xs cursor-pointer text-white/80"
                >
                  {emoji}
                </button>
              ))}
              <button 
                type="submit" 
                className="px-4 py-1.5 bg-[#00E5FF] hover:bg-[#6FEAFF] text-[#02060A] text-xs font-mono font-bold rounded uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_10px_rgba(0, 229, 255,0.3)]"
              >
                Transmit
              </button>
            </div>
          </form>
        </div>

        {/* COLUMN 3: RIGHT DETAILS (CHRONOAI ASSISTANT & AUDIO DEBATES) */}
        <div className="hidden lg:flex flex-col gap-6 overflow-y-auto custom-scrollbar h-full">
          
          {/* ChronoAI Assistant Dossier */}
          <div className="premium-glass p-5 rounded-lg flex flex-col gap-4 bg-[#040B12]/85 border border-[#00E5FF]/10">
            <div className="flex flex-col gap-1 border-b border-[#00E5FF]/15 pb-3">
              <span className="text-[10px] font-mono text-[#00E5FF] uppercase tracking-widest font-semibold">Cognitive Agent</span>
              <h3 className="text-sm font-bold text-white tracking-wider uppercase font-mono m-0">ChronoAI Core</h3>
            </div>
            
            <p className="text-xs text-[#CBD5E1] leading-relaxed font-light m-0">
              ChronoAI monitors this planetary network stream in real-time. Direct prompts will draw demographic growth curves, GDP indexes, and fact-check future events.
            </p>

            <div className="bg-black/35 border border-white/5 rounded p-3 flex flex-col gap-2">
              <span className="text-[8px] font-mono text-[#94A3B8] uppercase">Futurology Prompt Command</span>
              <div className="flex flex-col gap-1.5">
                {[
                  'Can India become the largest economy by 2050?',
                  'Will AGI arrive before 2040?',
                  'Explain fusion energy impact vector'
                ].map((txt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputValue(`@ai ${txt}`)}
                    className="text-left bg-white/2 hover:bg-[#00E5FF]/5 border border-white/5 hover:border-[#00E5FF]/20 rounded p-2 text-[10px] text-white/85 transition-colors font-mono cursor-pointer"
                  >
                    &gt; "{txt}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Voice Stages / Spaces (Future Feature Architecture Mock) */}
          <div className="premium-glass p-5 rounded-lg flex flex-col gap-4 bg-[#040B12]/85">
            <div className="flex flex-col gap-1 border-b border-[#00E5FF]/15 pb-3">
              <span className="text-[10px] font-mono text-[#00E5FF] uppercase tracking-widest font-semibold">Audio Channels</span>
              <h3 className="text-sm font-bold text-white tracking-wider uppercase font-mono m-0">Live Voice Stages</h3>
            </div>

            <p className="text-[11px] text-[#94A3B8] leading-relaxed m-0">
              Participate in live audio debates and future panels. Similar to Discord stages, moderated by strategic futurologists.
            </p>

            {/* Active Stage Widget */}
            <div className="border border-white/10 rounded-lg p-4 bg-black/40 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="px-1.5 py-0.5 bg-rose-950/40 text-rose-400 border border-rose-500/25 rounded text-[8px] font-mono uppercase font-bold tracking-wider animate-pulse">
                  Live Stage
                </span>
                <span className="text-[8px] font-mono text-[#7A8694]">8 Listening</span>
              </div>
              <h4 className="text-xs font-bold text-white m-0 tracking-wide leading-snug">
                Fusion Grid Commercialization: 2045 vs 2050
              </h4>

              {/* Speakers */}
              <div className="flex items-center gap-2.5 py-1">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-500 animate-pulse">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-[8px] p-0.5 rounded-full">🗣️</div>
                </div>
                <div className="relative">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#00E5FF]/30">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="flex flex-col font-mono text-[9px]">
                  <span className="text-white font-bold">Dr. Aditya Rao</span>
                  <span className="text-[#7A8694]">Futurologist</span>
                </div>
              </div>

              {/* Connect button */}
              <button
                onClick={() => {
                  setIsAudioConnected(true);
                  triggerFeedback('Connected to fusion voice stage.');
                }}
                disabled={isAudioConnected}
                className="w-full py-2 bg-[#00E5FF]/10 border border-[#00E5FF]/30 hover:border-[#00E5FF]/70 text-[#00E5FF] hover:bg-[#00E5FF]/20 rounded text-xs font-mono font-bold transition-all uppercase tracking-wider cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              >
                {isAudioConnected ? '✓ Connected to Audio' : '🔊 Listen In'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

export default function FutureChatPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen bg-[#02060B] flex items-center justify-center font-mono text-[#00E5FF] text-xs">
        CONNECTING TO FUTURECHAT BROADCASTS...
      </div>
    }>
      <FutureChatContent />
    </Suspense>
  );
}

