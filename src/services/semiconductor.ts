import { supabase } from '@/lib/supabase';
import { DBSemiconductorNews } from '@/types/database';

const GNEWS_API_KEY = process.env.GNEWS_API_KEY || '402659a614441d404021b838e5c715ea';
const GNEWS_BASE_URL = 'https://gnews.io/api/v4/search';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function fetchSemiconductorNews(company: string): Promise<DBSemiconductorNews[]> {
  try {
    console.log(`Fetching semiconductor news for company: "${company}"...`);
    const query = `${company} semiconductor chip fab lithography foundry`;
    const url = `${GNEWS_BASE_URL}?q=${encodeURIComponent(query)}&lang=en&max=3&apikey=${GNEWS_API_KEY}`;
    
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`GNews error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    const articles = data.articles || [];

    const newsItems: Omit<DBSemiconductorNews, 'id' | 'created_at'>[] = articles.map((article: any) => {
      const title = article.title || `${company} Semiconductor Update`;
      return {
        company,
        title,
        description: article.description || article.content || '',
        url: article.url || 'https://gnews.io',
        source: article.source?.name || 'GNews',
        image_url: article.image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
        published_at: article.publishedAt || new Date().toISOString(),
        slug: generateSlug(`${company}-${title}`)
      };
    });

    const savedNews: DBSemiconductorNews[] = [];
    for (const item of newsItems) {
      // Upsert on slug to prevent duplicate inserts
      const { data: inserted, error: insertErr } = await supabase
        .from('semiconductor_news')
        .upsert([item], { onConflict: 'slug' })
        .select()
        .maybeSingle();

      if (!insertErr && inserted) {
        savedNews.push(inserted as DBSemiconductorNews);
      } else {
        savedNews.push({ ...item, id: 'temp-' + Math.random(), created_at: new Date().toISOString() } as DBSemiconductorNews);
      }
    }

    return savedNews;
  } catch (err) {
    console.error(`Exception in fetchSemiconductorNews for ${company}:`, err);
    return [];
  }
}

export async function fetchAllSemiconductorNews(): Promise<void> {
  const companies = ['NVIDIA', 'AMD', 'Intel', 'TSMC', 'ASML', 'Qualcomm', 'Micron', 'Samsung Semiconductor'];
  for (const company of companies) {
    await fetchSemiconductorNews(company);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Sleep to prevent rate-limit
  }
}

export async function getSemiconductorNewsFromDB(company?: string): Promise<DBSemiconductorNews[]> {
  try {
    let query = supabase.from('semiconductor_news').select('*');
    if (company) {
      query = query.eq('company', company);
    }
    const { data, error } = await query.order('published_at', { ascending: false });
    if (error) throw error;
    return (data || []) as DBSemiconductorNews[];
  } catch (err) {
    console.error('Error querying semiconductor news:', err);
    return [];
  }
}
