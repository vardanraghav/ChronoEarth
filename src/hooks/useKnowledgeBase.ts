import { useState, useEffect, useCallback } from 'react';
import { getKnowledgeBase } from '@/services/knowledge';
import { KnowledgeCard, KNOWLEDGE_CARDS } from '@/data/knowledgeCards';
import { KBArticle } from '@/data/predictionsData';

// Static fallbacks for KB Articles (merged like in knowledge/page.tsx)
const FALLBACK_KB_ARTICLES: KBArticle[] = [
  {
    id: 'kb-1',
    title: 'Magnetized Target Fusion',
    category: 'Energy',
    shortDesc: 'Helium-3 and deuterium reactors supplying zero-emission grid baseloads.',
    content: 'Advanced target chamber designs use magnetic fields to contain superheated plasma. Deuterium-tritium fuel pellets are compressed by high-velocity gas pistons to trigger thermonuclear fusion. Modular reactors supply clean power directly into smart metropolitan grids.',
    readinessIndex: 78,
    impactLevel: 'Critical'
  },
  {
    id: 'kb-2',
    title: 'Ocean Thermal Energy Conversion (OTEC)',
    category: 'Energy',
    shortDesc: 'Deep ocean temperature gradients driving continuous offshore turbines.',
    content: 'OTEC plants utilize the temperature difference between warm surface waters and cold deep ocean water to vaporize and condense a working fluid, driving low-pressure turbines for continuous baseload power. Coastal nodes route desalinated byproduct water to local municipal storage reservoirs.',
    readinessIndex: 65,
    impactLevel: 'High'
  },
  {
    id: 'kb-3',
    title: 'Synthetic Biosphere Anchors',
    category: 'Climate',
    shortDesc: 'Genetically designed root matrices and soil mycorrhiza halting desertification.',
    content: 'Targeted agricultural zones deploy bio-engineered vegetation with deep root structures. These root grids stabilize soil layers, retain moisture, and host engineered mycorrhizal networks that accelerate nutrient cycling, reclaiming arid zones and buffering storm inflows.',
    readinessIndex: 72,
    impactLevel: 'High'
  },
  {
    id: 'kb-4',
    title: 'Stratospheric Albedo Deflection',
    category: 'Climate',
    shortDesc: 'Aerosol injection systems cooling polar feedback dome structures.',
    content: 'Under global coordination frameworks, high-altitude sub-orbital platforms release micro-reflective calcium carbonate particles into the upper atmosphere. The particles scatter a fraction of incoming solar radiation back to space, dampening regional heat feedback loops.',
    readinessIndex: 45,
    impactLevel: 'Critical'
  },
  {
    id: 'kb-5',
    title: 'Lunar Regolith Helium-3 Harvesting',
    category: 'Space',
    shortDesc: 'Offworld mining operations refining aneutronic fusion fuels for Earth.',
    content: 'Autonomous surface crawlers mine lunar dust, heating regolith to extract trapped Helium-3 deposits. Automated cargo shuttles launch the fuel to low Earth orbit staging hubs, powering next-generation aneutronic fusion reactors.',
    readinessIndex: 35,
    impactLevel: 'High'
  },
  {
    id: 'kb-6',
    title: 'Entangled Orbital Communication Grids',
    category: 'Space',
    shortDesc: 'Quantum satellite constellations enabling secure municipal sync pathways.',
    content: 'Low-orbit satellite arrays maintain active quantum key distribution networks. Intercept-proof communications sync automated transit fleets, orbital sensors, and localized smart microgrids, preventing cyber disruptions.',
    readinessIndex: 82,
    impactLevel: 'High'
  },
  {
    id: 'kb-7',
    title: 'Algorithmic Resource Allocators',
    category: 'Technologies',
    shortDesc: 'Autonomous neural routing distributing grid power and municipal water.',
    content: 'Metropolitan utility systems route resources based on predictive neural networks. Smart flow controllers adjust grid distribution, battery bank charging, and desal output in response to real-time population density and atmospheric weather shifts.',
    readinessIndex: 90,
    impactLevel: 'Critical'
  },
  {
    id: 'kb-8',
    title: 'Global Semiconductor Alliance',
    category: 'Geopolitics',
    shortDesc: 'Decentralized fabrication nodes and shipping corridors across trade blocks.',
    content: 'Global silicon production has shifted away from centralized coastal nodes to secure, decentralized alliances. Allied regions construct high-yield fabrication centers inland, connected by secure rail networks and defended by orbital monitoring constellations to protect hardware supply lines against disruption vectors.',
    readinessIndex: 85,
    impactLevel: 'Critical'
  },
  {
    id: 'kb-9',
    title: 'Lifecycle Carbon Tariffs',
    category: 'Economics',
    shortDesc: 'Algorithmic border tax adjustments based on lifecycle carbon emissions.',
    content: 'Enforces carbon taxation dynamically at regional borders using digital ledgers. The carbon footprint of every imported raw material or finished pod is calculated using real-time sensor metrics and taxed instantly, funding geo-engineering cooling grids and incentivizing clean local manufacturing.',
    readinessIndex: 90,
    impactLevel: 'High'
  }
];

export function useKnowledgeBase() {
  const [knowledgeCards, setKnowledgeCards] = useState<Record<string, KnowledgeCard>>(KNOWLEDGE_CARDS);
  const [kbArticles, setKbArticles] = useState<KBArticle[]>(FALLBACK_KB_ARTICLES);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchKnowledgeBase = useCallback(async () => {
    try {
      const dbKB = await getKnowledgeBase();
      if (dbKB && dbKB.length > 0) {
        // Separate thematic layers from KB articles
        const cards: Record<string, KnowledgeCard> = {};
        const articles: KBArticle[] = [];

        dbKB.forEach((item) => {
          if (item.category === 'Thematic Layer') {
            // Generate standard card ID from title if missing slug
            const cardId = item.explanation.includes('Urban zones') ? 'layer-cities' : 
                           item.explanation.includes('Monitors global') ? 'layer-climate' :
                           item.explanation.includes('Coordinates lunar') ? 'layer-space' : 'layer-tech';
            
            cards[cardId] = {
              id: cardId,
              title: item.title,
              category: item.category,
              stats: (item.stats || {}) as Record<string, string | number>,
              explanation: item.explanation,
              forecast: item.forecast,
              risks: item.risks || [],
              opportunities: item.opportunities || [],
              sources: item.sources || []
            };
          } else {
            articles.push({
              id: item.slug || `kb-${articles.length + 1}`,
              title: item.title,
              category: item.category as any,
              shortDesc: item.short_desc || '',
              content: item.content || '',
              readinessIndex: item.readiness_index || 50,
              impactLevel: (item.impact_level || 'Moderate') as any
            });
          }
        });

        if (Object.keys(cards).length > 0) {
          setKnowledgeCards(cards);
        }
        if (articles.length > 0) {
          setKbArticles(articles);
        }
      } else {
        setKnowledgeCards(KNOWLEDGE_CARDS);
        setKbArticles(FALLBACK_KB_ARTICLES);
      }
      setError(null);
    } catch (err) {
      const fetchError = err instanceof Error ? err : new Error(String(err));
      setError(fetchError);
      setKnowledgeCards(KNOWLEDGE_CARDS);
      setKbArticles(FALLBACK_KB_ARTICLES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKnowledgeBase();
  }, [fetchKnowledgeBase]);

  return { knowledgeCards, kbArticles, loading, error, refetch: fetchKnowledgeBase };
}
