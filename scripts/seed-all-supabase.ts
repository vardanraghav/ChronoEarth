import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { citiesRawData } from '../src/data/citiesData';
import { PREDICTIONS, FUTUROLOGISTS, KB_ARTICLES } from '../src/data/predictionsData';
import { KNOWLEDGE_CARDS } from '../src/data/knowledgeCards';

// 1. Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const cleanedLine = line.trim();
    if (!cleanedLine || cleanedLine.startsWith('#')) return;
    const eqIdx = cleanedLine.indexOf('=');
    if (eqIdx > 0) {
      const key = cleanedLine.slice(0, eqIdx).trim();
      const val = cleanedLine.slice(eqIdx + 1).trim().replace(/(^["']|["']$)/g, '');
      process.env[key] = val;
    }
  });
}

// 2. Resolve URL and Key
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
if (supabaseUrl.endsWith('/rest/v1/')) {
  supabaseUrl = supabaseUrl.slice(0, -9);
} else if (supabaseUrl.endsWith('/rest/v1')) {
  supabaseUrl = supabaseUrl.slice(0, -8);
}

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or Key missing in .env.local');
  process.exit(1);
}

console.log('📊 Supabase All-Tables Seeder initializing...');
console.log(`URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedCities() {
  try {
    console.log('\n🌍 Seeding CITIES table...');
    const { data: existing, error: fetchErr } = await supabase
      .from('cities')
      .select('name');

    if (fetchErr) {
      console.error('Error querying existing cities:', fetchErr.message);
      return false;
    }

    const existingNames = new Set((existing || []).map((c: any) => c.name.toLowerCase()));
    const newCities = citiesRawData
      .filter((city) => !existingNames.has(city.name.toLowerCase()))
      .map((city) => ({
        name: city.name,
        country: city.country,
        lat: city.lat,
        lon: city.lon,
        year: city.year,
        offsets: city.offsets,
        details: city.details
      }));

    if (newCities.length === 0) {
      console.log('✓ Cities table is already up to date.');
      return true;
    }

    const { data, error: insertErr } = await supabase
      .from('cities')
      .insert(newCities)
      .select();

    if (insertErr) {
      console.error('Error inserting cities:', insertErr.message);
      return false;
    }

    console.log(`✓ Inserted ${data ? data.length : newCities.length} cities.`);
    return true;
  } catch (err) {
    console.error('Cities seeding exception:', err);
    return false;
  }
}

async function seedPredictions() {
  try {
    console.log('\n🔮 Seeding PREDICTIONS table...');
    const { data: existing, error: fetchErr } = await supabase
      .from('predictions')
      .select('slug');

    if (fetchErr) {
      console.error('Error querying existing predictions:', fetchErr.message);
      return false;
    }

    const existingSlugs = new Set((existing || []).map((p: any) => p.slug));
    const newPredictions = PREDICTIONS
      .filter((pred) => !existingSlugs.has(pred.slug))
      .map((pred) => ({
        title: pred.title,
        slug: pred.slug,
        description: pred.description,
        category: pred.category,
        year: pred.year,
        author: pred.author,
        city: pred.city,
        confidence_score: pred.confidenceScore,
        initial_votes: pred.initialVotes,
        votes: pred.votes,
        tags: pred.tags,
        comments: pred.comments,
        share_url: pred.shareUrl
      }));

    if (newPredictions.length === 0) {
      console.log('✓ Predictions table is already up to date.');
      return true;
    }

    const { data, error: insertErr } = await supabase
      .from('predictions')
      .insert(newPredictions)
      .select();

    if (insertErr) {
      console.error('Error inserting predictions:', insertErr.message);
      return false;
    }

    console.log(`✓ Inserted ${data ? data.length : newPredictions.length} predictions.`);
    return true;
  } catch (err) {
    console.error('Predictions seeding exception:', err);
    return false;
  }
}

async function seedFuturologists() {
  try {
    console.log('\n👤 Seeding FUTUROLOGISTS table...');
    const { data: existing, error: fetchErr } = await supabase
      .from('futurologists')
      .select('slug');

    if (fetchErr) {
      console.error('Error querying existing futurologists:', fetchErr.message);
      return false;
    }

    const existingSlugs = new Set((existing || []).map((fut: any) => fut.slug));
    const newFuturologists = FUTUROLOGISTS
      .filter((fut) => !existingSlugs.has(fut.slug))
      .map((fut) => ({
        name: fut.name,
        slug: fut.slug,
        role: fut.role,
        specialization: fut.specialization,
        avatar: fut.avatar,
        bio: fut.bio,
        contributions: fut.contributions,
        influenceScore: fut.influenceScore
      }));

    if (newFuturologists.length === 0) {
      console.log('✓ Futurologists table is already up to date.');
      return true;
    }

    const { data, error: insertErr } = await supabase
      .from('futurologists')
      .insert(newFuturologists)
      .select();

    if (insertErr) {
      console.error('Error inserting futurologists:', insertErr.message);
      return false;
    }

    console.log(`✓ Inserted ${data ? data.length : newFuturologists.length} futurologists.`);
    return true;
  } catch (err) {
    console.error('Futurologists seeding exception:', err);
    return false;
  }
}

async function seedKnowledgeBase() {
  try {
    console.log('\n📚 Seeding KNOWLEDGE_BASE table...');
    const { data: existing, error: fetchErr } = await supabase
      .from('knowledge_base')
      .select('title');

    if (fetchErr) {
      console.error('Error querying existing knowledge base:', fetchErr.message);
      return false;
    }

    const existingTitles = new Set((existing || []).map((k: any) => k.title.toLowerCase()));

    // 1. Map Thematic Layers (KNOWLEDGE_CARDS)
    const thematicLayers = Object.entries(KNOWLEDGE_CARDS).map(([key, kb]) => ({
      title: kb.title,
      category: kb.category,
      stats: kb.stats,
      explanation: kb.explanation,
      forecast: kb.forecast,
      risks: kb.risks,
      opportunities: kb.opportunities,
      sources: kb.sources,
      short_desc: '',
      content: '',
      readiness_index: null,
      impact_level: null,
      slug: key
    }));

    // 2. Map KB Articles (KB_ARTICLES + Extras)
    const kbArticles = [
      ...KB_ARTICLES,
      {
        id: 'kb-8',
        title: 'Global Semiconductor Alliance',
        category: 'Geopolitics',
        shortDesc: 'Decentralized fabrication nodes and shipping corridors across trade blocks.',
        content: 'Global silicon production has shifted away from centralized coastal nodes to secure, decentralized alliances. Allied regions construct high-yield fabrication centers inland, connected by secure rail networks and defended by orbital monitoring constellations to protect hardware supply lines against disruption vectors.',
        readinessIndex: 85,
        impactLevel: 'Critical' as const
      },
      {
        id: 'kb-9',
        title: 'Lifecycle Carbon Tariffs',
        category: 'Economics',
        shortDesc: 'Algorithmic border tax adjustments based on lifecycle carbon emissions.',
        content: 'Enforces carbon taxation dynamically at regional borders using digital ledgers. The carbon footprint of every imported raw material or finished pod is calculated using real-time sensor metrics and taxed instantly, funding geo-engineering cooling grids and incentivizing clean local manufacturing.',
        readinessIndex: 90,
        impactLevel: 'High' as const
      }
    ].map(kb => ({
      title: kb.title,
      category: kb.category,
      stats: null,
      explanation: '',
      forecast: '',
      risks: null,
      opportunities: null,
      sources: null,
      short_desc: kb.shortDesc,
      content: kb.content,
      readiness_index: kb.readinessIndex,
      impact_level: kb.impactLevel,
      slug: kb.id
    }));

    const allKnowledge = [...thematicLayers, ...kbArticles]
      .filter(item => !existingTitles.has(item.title.toLowerCase()));

    if (allKnowledge.length === 0) {
      console.log('✓ Knowledge base table is already up to date.');
      return true;
    }

    const { data, error: insertErr } = await supabase
      .from('knowledge_base')
      .insert(allKnowledge)
      .select();

    if (insertErr) {
      console.error('Error inserting knowledge base:', insertErr.message);
      return false;
    }

    console.log(`✓ Inserted ${data ? data.length : allKnowledge.length} knowledge base entries.`);
    return true;
  } catch (err) {
    console.error('Knowledge base seeding exception:', err);
    return false;
  }
}

async function seedNews() {
  try {
    console.log('\n📰 Seeding NEWS table...');
    const { data: existing, error: fetchErr } = await supabase
      .from('news')
      .select('slug');

    if (fetchErr) {
      console.error('Error querying existing news:', fetchErr.message);
      return false;
    }

    const existingSlugs = new Set((existing || []).map((n: any) => n.slug));

    const fallbackNews = [
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

    const newNews = fallbackNews
      .filter((news) => !existingSlugs.has(news.slug))
      .map((news) => ({
        category: news.category,
        time: news.time,
        title: news.title,
        description: news.description,
        image: news.image,
        slug: news.slug,
        year: news.year
      }));

    if (newNews.length === 0) {
      console.log('✓ News table is already up to date.');
      return true;
    }

    const { data, error: insertErr } = await supabase
      .from('news')
      .insert(newNews)
      .select();

    if (insertErr) {
      console.error('Error inserting news:', insertErr.message);
      return false;
    }

    console.log(`✓ Inserted ${data ? data.length : newNews.length} news items.`);
    return true;
  } catch (err) {
    console.error('News seeding exception:', err);
    return false;
  }
}

async function seed() {
  try {
    const results = {
      cities: await seedCities(),
      predictions: await seedPredictions(),
      futurologists: await seedFuturologists(),
      knowledgeBase: await seedKnowledgeBase(),
      news: await seedNews()
    };

    console.log('\n📋 SEEDING SUMMARY:');
    console.log(`   Cities: ${results.cities ? '✓ Success' : '✗ Failed'}`);
    console.log(`   Predictions: ${results.predictions ? '✓ Success' : '✗ Failed'}`);
    console.log(`   Futurologists: ${results.futurologists ? '✓ Success' : '✗ Failed'}`);
    console.log(`   Knowledge Base: ${results.knowledgeBase ? '✓ Success' : '✗ Failed'}`);
    console.log(`   News: ${results.news ? '✓ Success' : '✗ Failed'}`);

    if (Object.values(results).every((r) => r)) {
      console.log('\n✨ All tables seeded successfully!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tables failed to seed. Check errors above.');
      process.exit(1);
    }
  } catch (err) {
    console.error('Seeder exception occurred:', err);
    process.exit(1);
  }
}

seed();
