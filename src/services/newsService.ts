import { supabase } from '@/lib/supabase';
import { DBNews } from '@/types/database';

const GNEWS_API_KEY = process.env.GNEWS_API_KEY || '402659a614441d404021b838e5c715ea';
const GNEWS_BASE_URL = 'https://gnews.io/api/v4/search';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function fetchGNewsArticles(query: string, category: string): Promise<DBNews[]> {
  try {
    console.log(`Fetching GNews articles for query: "${query}" in category: "${category}"...`);
    // GNews API search
    const url = `${GNEWS_BASE_URL}?q=${encodeURIComponent(query)}&lang=en&max=5&apikey=${GNEWS_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 429) {
        console.warn('GNews API rate limit hit.');
      }
      throw new Error(`GNews error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    const articles = data.articles || [];

    const newsItems: Omit<DBNews, 'id' | 'created_at'>[] = articles.map((article: any) => {
      const title = article.title || 'Breaking News';
      const slug = generateSlug(title);
      // Determine year based on current system year or default to 2030
      const currentYear = new Date().getFullYear();
      const year = currentYear >= 2050 ? 2050 : (currentYear >= 2040 ? 2040 : 2030);

      return {
        title,
        category: category.toUpperCase(),
        time: 'Just now',
        description: article.description || article.content || '',
        image: article.image || 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80',
        slug,
        year
      };
    });

    const savedNews: DBNews[] = [];
    for (const news of newsItems) {
      // Upsert on slug to prevent duplicates
      const { data: inserted, error: insertErr } = await supabase
        .from('news')
        .upsert([news], { onConflict: 'slug' })
        .select()
        .maybeSingle();

      if (!insertErr && inserted) {
        savedNews.push(inserted as DBNews);
      } else {
        // Fallback local representation if supabase fails
        savedNews.push({ ...news, id: 'temp-' + Math.random(), created_at: new Date().toISOString() } as DBNews);
      }
    }

    return savedNews;
  } catch (err) {
    console.error(`Exception in fetchGNewsArticles for query "${query}":`, err);
    return [];
  }
}

export async function fetchAllCategoriesNews(): Promise<void> {
  const topics = [
    { query: 'Artificial Intelligence AI', category: 'TECHNOLOGY' },
    { query: 'Climate Change Climate Crisis', category: 'CLIMATE' },
    { query: 'Nuclear Fusion Solar Battery Power', category: 'ENERGY' },
    { query: 'Space Exploration Rocket Asteroid', category: 'SPACE' },
    { query: 'Smart Cities Urban Architecture Grid', category: 'CITIES' },
    { query: 'Healthcare Biotechnology Gene CRISPR', category: 'HEALTHCARE' },
    { query: 'Autonomous Vehicles Electric Hyperloop', category: 'TRANSPORT' }
  ];

  for (const topic of topics) {
    await fetchGNewsArticles(topic.query, topic.category);
    // Brief sleep to avoid hitting GNews rate limits on developer keys
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
