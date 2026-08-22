/**
 * ChronoEarth Image Resolution Utilities
 *
 * Priority order:
 *  1. Database image_url (from Supabase)
 *  2. Topic-specific semantic mapping (by title)
 *  3. Category-level fallback
 *  4. Universal default
 *
 * All Unsplash URLs use photo IDs that have been verified to exist.
 * Use stable Unsplash source URLs for reliability.
 */

// ─── Category Fallbacks ──────────────────────────────────────────────────────

export const KNOWLEDGE_CATEGORY_IMAGES: Record<string, string> = {
  // Neural network visualization - stable popular photo
  ai:          'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
  // Earth / climate from orbit
  climate:     'https://images.unsplash.com/photo-1569163139599-0f4517e36f31?w=800&auto=format&fit=crop&q=80',
  // Nuclear/energy reactor interior
  energy:      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80',
  // Space / cosmos / galaxy
  space:       'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&auto=format&fit=crop&q=80',
  // Futuristic city night
  cities:      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&auto=format&fit=crop&q=80',
  // Global network / connections / globe
  geopolitics: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
  // Circuit board / digital tech
  default:     'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
};

export const PREDICTION_CATEGORY_IMAGES: Record<string, string> = {
  // Humanoid robot / AI
  ai:         'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
  // Storm clouds lightning radar
  climate:    'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&auto=format&fit=crop&q=80',
  // Wind turbines at sunset
  energy:     'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&auto=format&fit=crop&q=80',
  // Deep space galaxy  
  space:      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&auto=format&fit=crop&q=80',
  // City skyline night
  cities:     'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&auto=format&fit=crop&q=80',
  // High-speed rail maglev
  transport:  'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop&q=80',
  // Medical lab biology research
  healthcare: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&auto=format&fit=crop&q=80',
  // Community people
  society:    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80',
  // Cyber security  
  default:    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
};

export const SENSOR_IMAGES = {
  // Earthquake fault lines / earth rupture
  earthquake: 'https://images.unsplash.com/photo-1503945438517-f65904a52ce6?w=800&auto=format&fit=crop&q=80',
  // Orbiting satellite view
  space:      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&auto=format&fit=crop&q=80',
  // Weather radar storm system
  climate:    'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&auto=format&fit=crop&q=80',
};

export const MARKET_LOGOS: Record<string, string> = {
  fusion:   'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=150&auto=format&fit=crop&q=80',
  carbon:   'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=150&auto=format&fit=crop&q=80',
  quantum:  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=80',
  lithium:  'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=150&auto=format&fit=crop&q=80',
  space:    'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=150&auto=format&fit=crop&q=80',
  default:  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=80',
};

// ─── Topic-Specific Semantic Image Map ────────────────────────────────────────
// Keyed by article/prediction title (lowercased). Prioritized over category fallbacks.

const TOPIC_IMAGE_MAP: Record<string, string> = {
  // ─── Knowledge Base — Energy ──────────────────────────────────────────────
  'compact magnetized fusion':
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80', // nuclear/energy reactor
  'ocean thermal energy conversion (otec)':
    'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&auto=format&fit=crop&q=80', // ocean waves
  'ocean thermal energy conversion':
    'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&auto=format&fit=crop&q=80',

  // ─── Knowledge Base — Climate ─────────────────────────────────────────────
  'synthetic ecologist':
    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80', // dense green forest / ecosystem
  'albedo geo-engineering':
    'https://images.unsplash.com/photo-1569163139599-0f4517e36f31?w=800&auto=format&fit=crop&q=80', // earth from orbit / atmosphere
  'sea level rise (+1m / +2m / +5m)':
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80', // coastal flooding
  'sea level rise':
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',

  // ─── Knowledge Base — Space ───────────────────────────────────────────────
  'helium-3 lunar mining':
    'https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?w=800&auto=format&fit=crop&q=80', // moon surface

  // ─── Knowledge Base — AI ──────────────────────────────────────────────────
  'quantum grid architect':
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80', // circuit quantum computing

  // ─── Knowledge Base — Cities ──────────────────────────────────────────────
  'biophilic coral foundations':
    'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&auto=format&fit=crop&q=80', // ocean underwater structure

  // ─── Simulations ──────────────────────────────────────────────────────────
  'fusion breakthrough':
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80', // reactor
  'agi emergence':
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80', // humanoid AI robot

  // ─── Thematic Layers ──────────────────────────────────────────────────────
  'future cities & urbanism':
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&auto=format&fit=crop&q=80',
  'climate intelligence protocol':
    'https://images.unsplash.com/photo-1569163139599-0f4517e36f31?w=800&auto=format&fit=crop&q=80',
  'ai & technology backbone':
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
  'planetary energy transition':
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&auto=format&fit=crop&q=80',
  'space infrastructure network':
    'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&auto=format&fit=crop&q=80',
  'geopolitical supply chains':
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',

  // ─── Predictions — AI ─────────────────────────────────────────────────────
  'ai decides regional agriculture':
    'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&auto=format&fit=crop&q=80', // drone over farmland
  'quantum weather supercomputers':
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80', // circuit computing
  'earth-wide cybernetic singularity':
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80', // AI singularity visual

  // ─── Predictions — Climate ────────────────────────────────────────────────
  'carbon-tax smart contracts go live':
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80', // green forest carbon
  'atmospheric aerosol injection begins':
    'https://images.unsplash.com/photo-1569163139599-0f4517e36f31?w=800&auto=format&fit=crop&q=80', // atmosphere from space
  'sahara fully greened by desal grids':
    'https://images.unsplash.com/photo-1447433589675-4aaa569f3e05?w=800&auto=format&fit=crop&q=80', // desert to green

  // ─── Predictions — Energy ─────────────────────────────────────────────────
  'first commercial fusion plant connects':
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80', // reactor/nuclear
  'wireless orbital power transmissions':
    'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&auto=format&fit=crop&q=80', // satellite in orbit
  'global fusion grid meets 85% demand':
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&auto=format&fit=crop&q=80', // global energy

  // ─── Predictions — Space ──────────────────────────────────────────────────
  'debris sweeper satellites patrol leo':
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&auto=format&fit=crop&q=80', // satellites LEO
  'moon base artemis operational':
    'https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?w=800&auto=format&fit=crop&q=80', // moon surface
  'asteroid mining ship returns with metals':
    'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&auto=format&fit=crop&q=80', // deep space

  // ─── Predictions — Cities ─────────────────────────────────────────────────
  'fully biophilic floating megacities':
    'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&auto=format&fit=crop&q=80', // ocean platform

  // ─── Predictions — Transport ──────────────────────────────────────────────
  'autonomous transit zones in europe':
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop&q=80', // futuristic autonomous vehicles
  'vacuum tube hyperloop global web':
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop&q=80', // hyperloop transport

  // ─── Predictions — Healthcare ─────────────────────────────────────────────
  'anti-aging rejuvenation therapy approved':
    'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&auto=format&fit=crop&q=80', // biotech lab
  'nanobot synthetic immune systems':
    'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&auto=format&fit=crop&q=80', // microscopic nanotech
};

// ─── Helper: Topic Lookup ─────────────────────────────────────────────────────

function lookupByTitle(title: string): string | null {
  if (!title) return null;
  const key = title.toLowerCase().trim();
  return TOPIC_IMAGE_MAP[key] || null;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Resolves the best image URL for a Knowledge Base Article.
 * Returns null only if no image is available at all (caller should hide the image container).
 */
export function getKnowledgeCardImage(card: any): string | null {
  if (!card) return null;

  const category = (card?.category || '').toLowerCase();
  const title = (card?.title || '').toLowerCase();
  const isSpace = category.includes('space') || title.includes('space') || title.includes('lunar') || title.includes('orbit');

  // 1. For space-related, check NASA sources/fallback first
  if (isSpace) {
    if (card.image_url) return card.image_url;
    return KNOWLEDGE_CATEGORY_IMAGES.space;
  }

  // 1. Database-provided image
  if (card.image_url) return card.image_url;

  // 2. Exact title match (semantic mapping)
  const titleMatch = lookupByTitle(card.title);
  if (titleMatch) return titleMatch;

  // 3. ID-based category mapping
  const id = card?.id || '';
  if (id === 'kb-1') return KNOWLEDGE_CATEGORY_IMAGES.energy;      // Compact Magnetized Fusion
  if (id === 'kb-2') return KNOWLEDGE_CATEGORY_IMAGES.energy;      // OTEC
  if (id === 'kb-3') return KNOWLEDGE_CATEGORY_IMAGES.climate;     // Synthetic Ecologist
  if (id === 'kb-4') return KNOWLEDGE_CATEGORY_IMAGES.climate;     // Albedo Geo-engineering
  if (id === 'kb-5') return KNOWLEDGE_CATEGORY_IMAGES.space;       // Helium-3 Lunar Mining
  if (id === 'kb-6') return KNOWLEDGE_CATEGORY_IMAGES.ai;          // Quantum Grid Architect
  if (id === 'kb-7') return KNOWLEDGE_CATEGORY_IMAGES.cities;      // Biophilic Coral Foundations
  if (id === 'kb-8') return KNOWLEDGE_CATEGORY_IMAGES.geopolitics; // Digital Chip Blocks
  if (id === 'kb-9') return KNOWLEDGE_CATEGORY_IMAGES.geopolitics; // Carbon Tariffs

  // 4. Text-based category inference
  if (category.includes('ai') || category.includes('tech') || category.includes('future jobs')) {
    return KNOWLEDGE_CATEGORY_IMAGES.ai;
  }
  if (category.includes('climate') || category.includes('weather') || category.includes('simulation')) {
    return KNOWLEDGE_CATEGORY_IMAGES.climate;
  }
  if (category.includes('energy') || category.includes('fusion')) {
    return KNOWLEDGE_CATEGORY_IMAGES.energy;
  }
  if (category.includes('city') || category.includes('urban') || category.includes('cities')) {
    return KNOWLEDGE_CATEGORY_IMAGES.cities;
  }

  return KNOWLEDGE_CATEGORY_IMAGES.default;
}

/**
 * Resolves the best image URL for a Prediction Card.
 * Returns null only if truly nothing is available.
 */
export function getPredictionImage(prediction: any): string | null {
  if (!prediction) return null;

  const category = (prediction?.category || '').toLowerCase();
  const title = (prediction?.title || '').toLowerCase();
  const isSpace = category.includes('space') || title.includes('space') || title.includes('lunar') || title.includes('orbit') || title.includes('artemis') || title.includes('asteroid') || title.includes('leo');

  // Space priority: NASA image, existing image_url, category fallback
  if (isSpace) {
    if (prediction.image_url) return prediction.image_url;
    return PREDICTION_CATEGORY_IMAGES.space;
  }

  // 1. Database-provided image
  if (prediction.image_url) return prediction.image_url;

  // 2. Exact title match (semantic mapping)
  const titleMatch = lookupByTitle(prediction.title);
  if (titleMatch) return titleMatch;

  // 3. Category fallback
  if (category.includes('ai'))          return PREDICTION_CATEGORY_IMAGES.ai;
  if (category.includes('climate'))     return PREDICTION_CATEGORY_IMAGES.climate;
  if (category.includes('energy'))      return PREDICTION_CATEGORY_IMAGES.energy;
  if (category.includes('cities') || category.includes('city')) return PREDICTION_CATEGORY_IMAGES.cities;
  if (category.includes('transport'))   return PREDICTION_CATEGORY_IMAGES.transport;
  if (category.includes('health'))      return PREDICTION_CATEGORY_IMAGES.healthcare;
  if (category.includes('society'))     return PREDICTION_CATEGORY_IMAGES.society;

  return PREDICTION_CATEGORY_IMAGES.default;
}

/**
 * Resolves the best image URL for an Intel Feed Item.
 */
const feedImages = {
  // Semiconductors
  asml: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
  tsmc: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=80",
  qualcomm: "https://images.unsplash.com/photo-1601524909162-be87252be298?w=600&auto=format&fit=crop&q=80",
  intel: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80",
  amd: "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?w=600&auto=format&fit=crop&q=80",
  nvidia: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
  
  // Cities
  singapore: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&auto=format&fit=crop&q=80",
  dubai: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop&q=80",
  tokyo: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80",
  newyork: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&auto=format&fit=crop&q=80",

  // Seismic (Earthquakes)
  seismic1: "https://images.unsplash.com/photo-1503945438517-f65904a52ce6?w=600&auto=format&fit=crop&q=80",
  seismic2: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&auto=format&fit=crop&q=80",
  seismic3: "https://images.unsplash.com/photo-1600298882283-40b4dca8704a?w=600&auto=format&fit=crop&q=80",

  // Space
  space1: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
  space2: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80",
  space3: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&auto=format&fit=crop&q=80",

  // Climate
  climate1: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=600&auto=format&fit=crop&q=80",
  climate2: "https://images.unsplash.com/photo-1569163139599-0f4517e36f31?w=600&auto=format&fit=crop&q=80",
  climate3: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80",

  // Markets
  markets1: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80",
  markets2: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=80",
  markets3: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80"
};

const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export function getIntelFeedImage(item: any): string {
  if (!item) return PREDICTION_CATEGORY_IMAGES.default;

  const source = (item?.source || '').toLowerCase();
  const category = (item?.category || '').toLowerCase();
  const title = (item?.title || '').toLowerCase();

  // 1. Check for specific chip/semiconductor entities
  if (title.includes('asml')) return feedImages.asml;
  if (title.includes('tsmc')) return feedImages.tsmc;
  if (title.includes('qualcomm')) return feedImages.qualcomm;
  if (title.includes('intel') || title.includes('intc')) return feedImages.intel;
  if (title.includes('amd')) return feedImages.amd;
  if (title.includes('nvidia') || title.includes('nvda')) return feedImages.nvidia;

  // 2. Check for specific cities
  if (title.includes('singapore')) return feedImages.singapore;
  if (title.includes('dubai')) return feedImages.dubai;
  if (title.includes('tokyo')) return feedImages.tokyo;
  if (title.includes('new york') || title.includes('new-york')) return feedImages.newyork;

  // 3. Category/Type based stable hashing
  const idHash = hashString(item?.id || item?.title || '');

  if (category.includes('seismic') || title.includes('seismic') || title.includes('earthquake')) {
    const list = [feedImages.seismic1, feedImages.seismic2, feedImages.seismic3];
    return list[idHash % list.length];
  }
  if (category.includes('space') || title.includes('space') || source.includes('nasa')) {
    if (item.image_url) return item.image_url;
    if (item.image) return item.image;
    const list = [feedImages.space1, feedImages.space2, feedImages.space3];
    return list[idHash % list.length];
  }
  if (category.includes('market') || category.includes('stock') || category.includes('financial')) {
    const list = [feedImages.markets1, feedImages.markets2, feedImages.markets3];
    return list[idHash % list.length];
  }
  if (category.includes('climate') || category.includes('cities')) {
    const list = [feedImages.climate1, feedImages.climate2, feedImages.climate3];
    return list[idHash % list.length];
  }

  // 4. Database-provided image
  if (item.image_url) return item.image_url;

  // 5. Title semantic match
  const titleMatch = lookupByTitle(item.title);
  if (titleMatch) return titleMatch;

  // 6. Final hash fallback using keys
  const keys = Object.keys(PREDICTION_CATEGORY_IMAGES).filter(k => k !== 'default');
  const fallbackKey = keys[idHash % keys.length];
  return PREDICTION_CATEGORY_IMAGES[fallbackKey];
}

/**
 * Resolves the image for a Sensor event.
 */
export function getSensorImage(sensor: any, type: 'earthquake' | 'space' | 'climate'): string {
  if (type === 'space') {
    if (sensor?.image_url) return sensor.image_url;
    return SENSOR_IMAGES.space;
  }
  if (sensor?.image_url) return sensor.image_url;
  return SENSOR_IMAGES[type] || PREDICTION_CATEGORY_IMAGES.default;
}

/**
 * Resolves the logo for a market company/commodity.
 */
export function getMarketLogo(marketName: string): string {
  const name = marketName.toLowerCase();
  if (name.includes('fusion') || name.includes('helion'))     return MARKET_LOGOS.fusion;
  if (name.includes('carbon') || name.includes('offset'))     return MARKET_LOGOS.carbon;
  if (name.includes('quantum') || name.includes('qbit'))      return MARKET_LOGOS.quantum;
  if (name.includes('lithium') || name.includes('mineral'))   return MARKET_LOGOS.lithium;
  if (name.includes('satellite') || name.includes('orbit'))   return MARKET_LOGOS.space;
  return MARKET_LOGOS.default;
}

/**
 * Returns the category-level fallback URL for a given Knowledge category string.
 * Used as the onError fallback source in SafeImage components.
 */
export function getKnowledgeCategoryFallback(category: string, id?: string): string {
  if (id) {
    if (['kb-1', 'kb-2'].includes(id)) return KNOWLEDGE_CATEGORY_IMAGES.energy;
    if (['kb-3', 'kb-4'].includes(id)) return KNOWLEDGE_CATEGORY_IMAGES.climate;
    if (id === 'kb-5')                 return KNOWLEDGE_CATEGORY_IMAGES.space;
    if (id === 'kb-6')                 return KNOWLEDGE_CATEGORY_IMAGES.ai;
    if (id === 'kb-7')                 return KNOWLEDGE_CATEGORY_IMAGES.cities;
    if (['kb-8', 'kb-9'].includes(id)) return KNOWLEDGE_CATEGORY_IMAGES.geopolitics;
  }
  const cat = (category || '').toLowerCase();
  if (cat.includes('ai') || cat.includes('tech') || cat.includes('future jobs')) return KNOWLEDGE_CATEGORY_IMAGES.ai;
  if (cat.includes('climate')) return KNOWLEDGE_CATEGORY_IMAGES.climate;
  if (cat.includes('energy'))  return KNOWLEDGE_CATEGORY_IMAGES.energy;
  if (cat.includes('space'))   return KNOWLEDGE_CATEGORY_IMAGES.space;
  if (cat.includes('cities') || cat.includes('city')) return KNOWLEDGE_CATEGORY_IMAGES.cities;
  return KNOWLEDGE_CATEGORY_IMAGES.default;
}

/**
 * Returns the category-level fallback URL for a given Prediction category string.
 * Used as the onError fallback source in SafeImage components.
 */
export function getPredictionCategoryFallback(category: string): string {
  const cat = (category || '').toLowerCase();
  if (cat.includes('ai'))        return PREDICTION_CATEGORY_IMAGES.ai;
  if (cat.includes('climate'))   return PREDICTION_CATEGORY_IMAGES.climate;
  if (cat.includes('energy'))    return PREDICTION_CATEGORY_IMAGES.energy;
  if (cat.includes('space'))     return PREDICTION_CATEGORY_IMAGES.space;
  if (cat.includes('cities') || cat.includes('city')) return PREDICTION_CATEGORY_IMAGES.cities;
  if (cat.includes('transport')) return PREDICTION_CATEGORY_IMAGES.transport;
  if (cat.includes('health'))    return PREDICTION_CATEGORY_IMAGES.healthcare;
  if (cat.includes('society'))   return PREDICTION_CATEGORY_IMAGES.society;
  return PREDICTION_CATEGORY_IMAGES.default;
}
