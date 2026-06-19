import { useState, useEffect, useCallback } from 'react';
import { getNews } from '@/services/news';
import { DBNews } from '@/types/database';

export interface NewsItem {
  category: string;
  time: string;
  title: string;
  description: string;
  image: string;
  slug: string;
  year: number;
}

const FALLBACK_NEWS: NewsItem[] = [
  // 2030
  {
    category: 'TECHNOLOGY',
    time: '2h ago',
    title: 'AI Decides Regional Agriculture',
    description: 'Decentralized AI grids are given full autonomous authority to distribute regional seed supplies and water allocations.',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=120&auto=format&fit=crop&q=80',
    slug: 'ai-decides-regional-agriculture',
    year: 2030
  },
  {
    category: 'ENERGY',
    time: '5h ago',
    title: 'First Commercial Fusion Plant Connects',
    description: 'A 500MW magnetized target fusion reactor officially begins feeding electricity into the regional grid.',
    image: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=120&auto=format&fit=crop&q=80',
    slug: 'first-commercial-fusion-plant-connects',
    year: 2030
  },
  {
    category: 'CLIMATE',
    time: '7h ago',
    title: 'Carbon-Tax Smart Contracts Go Live',
    description: 'Global trade agreements enforce automatic blockchain carbon tariffs on all industrial logistics.',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=120&auto=format&fit=crop&q=80',
    slug: 'carbon-tax-smart-contracts-go-live',
    year: 2030
  },
  {
    category: 'GEOPOLITICS',
    time: '9h ago',
    title: 'Debris Sweeper Satellites Patrol LEO',
    description: 'An international fleet of autonomous lasers and sweepers begins clearing orbital debris corridors.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=120&auto=format&fit=crop&q=80',
    slug: 'debris-sweeper-satellites-patrol-leo',
    year: 2030
  },
  // 2040
  {
    category: 'TECHNOLOGY',
    time: '2h ago',
    title: 'Quantum Weather Supercomputers',
    description: '10,000-qubit quantum arrays forecast monsoons and storms with 99% accuracy up to 30 days in advance.',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=120&auto=format&fit=crop&q=80',
    slug: 'quantum-weather-supercomputers',
    year: 2040
  },
  {
    category: 'ENERGY',
    time: '5h ago',
    title: 'Wireless Orbital Power Transmissions',
    description: 'GEO solar satellites successfully beam high-frequency microwaves to rectenna fields in arid deserts.',
    image: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=120&auto=format&fit=crop&q=80',
    slug: 'wireless-orbital-power-transmissions',
    year: 2040
  },
  {
    category: 'CLIMATE',
    time: '7h ago',
    title: 'Atmospheric Aerosol Injection Begins',
    description: 'Under strict UN supervision, sulfur-dispensing sub-orbital drones deploy reflectant aerosols above the Arctic.',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=120&auto=format&fit=crop&q=80',
    slug: 'atmospheric-aerosol-injection-begins',
    year: 2040
  },
  {
    category: 'GEOPOLITICS',
    time: '9h ago',
    title: 'Moon Base Artemis Operational',
    description: 'A permanent habitat at Shackleton Crater houses 50 astronauts and robotic engineers for launch expansions.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=120&auto=format&fit=crop&q=80',
    slug: 'moon-base-artemis-operational',
    year: 2040
  },
  // 2050
  {
    category: 'TECHNOLOGY',
    time: '2h ago',
    title: 'Human-Cognitive Uploading Sandbox',
    description: 'Neural link networks successfully establish sandbox environments for non-biological synaptic consciousness.',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=120&auto=format&fit=crop&q=80',
    slug: 'human-cognitive-uploading-sandbox',
    year: 2050
  },
  {
    category: 'ENERGY',
    time: '5h ago',
    title: 'Planetary Superconductor Cable Grids',
    description: 'Zero-resistance carbon-nanotube lines link global continents, distributing solar and fusion yields.',
    image: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=120&auto=format&fit=crop&q=80',
    slug: 'planetary-superconductor-cable-grids',
    year: 2050
  },
  {
    category: 'CLIMATE',
    time: '7h ago',
    title: 'Oceanic De-Acidification Drones',
    description: 'Fleets of autonomous submersibles successfully balance alkaline levels in 60% of dying coral reef zones.',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=120&auto=format&fit=crop&q=80',
    slug: 'oceanic-de-acidification-drones',
    year: 2050
  },
  {
    category: 'GEOPOLITICS',
    time: '9h ago',
    title: 'New Global Alliances',
    description: 'South-South partnerships reshape economic and geopolitical balance.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=120&auto=format&fit=crop&q=80',
    slug: 'fully-biophilic-floating-megacities',
    year: 2050
  }
];

export function useNews() {
  const [news, setNews] = useState<NewsItem[]>(FALLBACK_NEWS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      const dbNews = await getNews();
      if (dbNews && dbNews.length > 0) {
        setNews(dbNews.map(n => ({
          category: n.category,
          time: n.time,
          title: n.title,
          description: n.description,
          image: n.image,
          slug: n.slug,
          year: n.year
        })));
      } else {
        setNews(FALLBACK_NEWS);
      }
      setError(null);
    } catch (err) {
      const fetchError = err instanceof Error ? err : new Error(String(err));
      setError(fetchError);
      setNews(FALLBACK_NEWS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return { news, loading, error, refetch: fetchNews };
}
