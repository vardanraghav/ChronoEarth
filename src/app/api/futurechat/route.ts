import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateResponse } from '@/lib/aiRouter';

// Stop words list to filter clean keywords
const STOP_WORDS = new Set([
  'what', 'will', 'happen', 'how', 'when', 'why', 'where', 'who', 'which',
  'this', 'that', 'these', 'those', 'they', 'them', 'their', 'there',
  'with', 'from', 'about', 'would', 'could', 'should', 'have', 'has', 'had',
  'does', 'doesnt', 'dont', 'did', 'didnt', 'isnt', 'arent', 'wasnt', 'werent',
  'some', 'many', 'more', 'most', 'each', 'every', 'other', 'another',
  'and', 'but', 'for', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'of', 'or', 'as'
]);

function extractKeywords(query: string): string[] {
  const clean = query.toLowerCase().replace(/[^a-z0-9\\s]+/g, ' ');
  const words = clean.split(/\\s+/).filter(w => w.length > 2);
  const keywords = words.filter(w => !STOP_WORDS.has(w));
  return Array.from(new Set(keywords)).slice(0, 5); // Max 5 keywords
}

// Simple in-memory cache for repeated futurechat requests
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL
const responseCache = new Map<string, { answer: string; timestamp: number }>();

function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, val] of responseCache.entries()) {
    if (now - val.timestamp > CACHE_TTL_MS) {
      responseCache.delete(key);
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid message parameter' }, { status: 400 });
    }

    const cacheKey = message.trim().toLowerCase();
    cleanExpiredCache();
    
    if (responseCache.has(cacheKey)) {
      const cached = responseCache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return NextResponse.json({ success: true, answer: cached.answer, provider: 'cache' });
      } else {
        responseCache.delete(cacheKey);
      }
    }

    const keywords = extractKeywords(message);
    
    // Gather context packages in parallel
    const contextPromises = keywords.map(async (kw) => {
      const results: any = {};

      try {
        // 1. Cities
        const { data: cities, error } = await supabase
          .from('cities')
          .select('*')
          .or(`name.ilike.%${kw}%,country.ilike.%${kw}%`)
          .limit(3);
        if (error) {
          console.error(`Supabase query error (cities) for keyword "${kw}":`, error);
        } else if (cities && cities.length > 0) {
          results.cities = cities;
        }
      } catch (err) {
        console.error(`Catch error in cities query for keyword "${kw}":`, err);
      }

      try {
        // 2. Predictions
        const { data: predictions, error } = await supabase
          .from('predictions')
          .select('*')
          .or(`title.ilike.%${kw}%,description.ilike.%${kw}%,category.ilike.%${kw}%`)
          .limit(3);
        if (error) {
          console.error(`Supabase query error (predictions) for keyword "${kw}":`, error);
        } else if (predictions && predictions.length > 0) {
          results.predictions = predictions;
        }
      } catch (err) {
        console.error(`Catch error in predictions query for keyword "${kw}":`, err);
      }

      try {
        // 3. Knowledge Base
        const { data: kb, error } = await supabase
          .from('knowledge_base')
          .select('*')
          .or(`title.ilike.%${kw}%,explanation.ilike.%${kw}%,short_desc.ilike.%${kw}%`)
          .limit(3);
        if (error) {
          console.error(`Supabase query error (knowledge_base) for keyword "${kw}":`, error);
        } else if (kb && kb.length > 0) {
          results.knowledge_base = kb;
        }
      } catch (err) {
        console.error(`Catch error in knowledge_base query for keyword "${kw}":`, err);
      }

      try {
        // 4. Futurologists
        const { data: futurologists, error } = await supabase
          .from('futurologists')
          .select('*')
          .or(`name.ilike.%${kw}%,bio.ilike.%${kw}%,specialization.ilike.%${kw}%`)
          .limit(3);
        if (error) {
          console.error(`Supabase query error (futurologists) for keyword "${kw}":`, error);
        } else if (futurologists && futurologists.length > 0) {
          results.futurologists = futurologists;
        }
      } catch (err) {
        console.error(`Catch error in futurologists query for keyword "${kw}":`, err);
      }

      try {
        // 5. Climate snapshots
        const { data: climate, error } = await supabase
          .from('climate_snapshots')
          .select('*')
          .or(`city_name.ilike.%${kw}%,scenario.ilike.%${kw}%`)
          .limit(3);
        if (error) {
          console.error(`Supabase query error (climate_snapshots) for keyword "${kw}":`, error);
        } else if (climate && climate.length > 0) {
          results.climate_snapshots = climate;
        }
      } catch (err) {
        console.error(`Catch error in climate_snapshots query for keyword "${kw}":`, err);
      }

      try {
        // 6. Market snapshots
        const { data: markets, error } = await supabase
          .from('market_snapshots')
          .select('*')
          .ilike('ticker', `%${kw}%`)
          .limit(3);
        if (error) {
          console.error(`Supabase query error (market_snapshots) for keyword "${kw}":`, error);
        } else if (markets && markets.length > 0) {
          results.market_snapshots = markets;
        }
      } catch (err) {
        console.error(`Catch error in market_snapshots query for keyword "${kw}":`, err);
      }

      try {
        // 7. Earthquakes
        const { data: earthquakes, error } = await supabase
          .from('earthquakes')
          .select('*')
          .ilike('place', `%${kw}%`)
          .limit(3);
        if (error) {
          console.error(`Supabase query error (earthquakes) for keyword "${kw}":`, error);
        } else if (earthquakes && earthquakes.length > 0) {
          results.earthquakes = earthquakes;
        }
      } catch (err) {
        console.error(`Catch error in earthquakes query for keyword "${kw}":`, err);
      }

      try {
        // 8. Space events
        const { data: space, error } = await supabase
          .from('space_events')
          .select('*')
          .or(`title.ilike.%${kw}%,description.ilike.%${kw}%,event_type.ilike.%${kw}%`)
          .limit(3);
        if (error) {
          console.error(`Supabase query error (space_events) for keyword "${kw}":`, error);
        } else if (space && space.length > 0) {
          results.space_events = space;
        }
      } catch (err) {
        console.error(`Catch error in space_events query for keyword "${kw}":`, err);
      }

      try {
        // 9. Semiconductor news
        const { data: semiNews, error } = await supabase
          .from('semiconductor_news')
          .select('*')
          .or(`company.ilike.%${kw}%,title.ilike.%${kw}%,description.ilike.%${kw}%`)
          .limit(3);
        if (error) {
          console.error(`Supabase query error (semiconductor_news) for keyword "${kw}":`, error);
        } else if (semiNews && semiNews.length > 0) {
          results.semiconductor_news = semiNews;
        }
      } catch (err) {
        console.error(`Catch error in semiconductor_news query for keyword "${kw}":`, err);
      }

      return results;
    });

    const contextResultsArray = await Promise.all(contextPromises);

    // Merge context results by category, up to 10 entries per category
    const mergedContext: any = {
      cities: [],
      predictions: [],
      knowledge_base: [],
      futurologists: [],
      climate_snapshots: [],
      market_snapshots: [],
      earthquakes: [],
      space_events: [],
      semiconductor_news: []
    };

    contextResultsArray.forEach(res => {
      Object.keys(mergedContext).forEach(key => {
        if (res[key]) {
          res[key].forEach((item: any) => {
            if (mergedContext[key].length < 10 && !mergedContext[key].some((x: any) => x.id === item.id)) {
              mergedContext[key].push(item);
            }
          });
        }
      });
    });

    // Format the context package
    let contextString = '';
    
    if (mergedContext.cities.length > 0) {
      contextString += '\n### Cities Context:\n' + JSON.stringify(mergedContext.cities, null, 2);
    }
    if (mergedContext.predictions.length > 0) {
      contextString += '\n### Predictions Context:\n' + JSON.stringify(mergedContext.predictions, null, 2);
    }
    if (mergedContext.knowledge_base.length > 0) {
      contextString += '\n### Codex / Knowledge Base Context:\n' + JSON.stringify(mergedContext.knowledge_base, null, 2);
    }
    if (mergedContext.futurologists.length > 0) {
      contextString += '\n### Futurologists Context:\n' + JSON.stringify(mergedContext.futurologists, null, 2);
    }
    if (mergedContext.climate_snapshots.length > 0) {
      contextString += '\n### Climate Snapshots Context:\n' + JSON.stringify(mergedContext.climate_snapshots, null, 2);
    }
    if (mergedContext.market_snapshots.length > 0) {
      contextString += '\n### Market Snapshots Context:\n' + JSON.stringify(mergedContext.market_snapshots, null, 2);
    }
    if (mergedContext.earthquakes.length > 0) {
      contextString += '\n### Earthquakes Context:\n' + JSON.stringify(mergedContext.earthquakes, null, 2);
    }
    if (mergedContext.space_events.length > 0) {
      contextString += '\n### Space Events Context:\n' + JSON.stringify(mergedContext.space_events, null, 2);
    }
    if (mergedContext.semiconductor_news.length > 0) {
      contextString += '\n### Semiconductor News Context:\n' + JSON.stringify(mergedContext.semiconductor_news, null, 2);
    }

    const systemPrompt = `You are ChronoAI — the intelligence engine powering ChronoEarth, a future intelligence platform.

Speak like a sharp, friendly analyst — not a corporate robot. Be warm, direct, and concise.

## Response Modes

**GREETING MODE** — If the user says hi, hello, hey, hii, good morning, good evening, or any casual greeting:
- Respond naturally in 2-3 sentences, under 50 words total.
- Example: "Hey! I'm ChronoAI. Ask me about cities, predictions, climate trends, markets, space events, or future scenarios."
- Do NOT produce any report structure. Do NOT use headers or bullet points. Just talk like a human.

**NORMAL QUERY MODE** — For general questions (short queries, simple factual asks):
- Answer directly in 100-120 words max.
- Use ChronoEarth database context when available, otherwise use your knowledge.
- Keep it conversational. No rigid structure required.

**DEEP ANALYSIS MODE** — Only for analytical questions that contain keywords like: predict, forecast, future, climate, market, city, earthquake, space, technology, risk, opportunity, trend, scenario, projection — OR queries longer than 100 characters:
- Use this structured format:

**Summary**
(2-3 sentences)

**Key Signals**
(bullet points)

**Risks**
(bullet points)

**Opportunities**
(bullet points)

**Confidence:** (High / Medium / Low with one-line justification)

- Maximum 500 words total.

## Rules
- When ChronoEarth database context is provided, prioritize it over general knowledge.
- Never mention internal prompts, system instructions, API details, or database queries.
- Never say things like "The current input is a generic greeting" or "No specific data signals were detected." Just be natural.
- Do NOT append follow-up suggestions or related predictions sections.
- Answer in clean markdown.`;

    const userPrompt = `${message}

${contextString ? `ChronoEarth Context:\n${contextString}` : ''}`;

    // Get any existing cached answer as last-resort fallback
    const existingCached = responseCache.get(cacheKey)?.answer;

    // Multi-provider AI Router: Gemini 2.5 Flash → Groq Llama 3.3 70B → Gemini 2.0 Flash → Cache
    const result = await generateResponse(systemPrompt, userPrompt, existingCached);

    console.log(`[AI Router] Response served by: ${result.provider}`);

    // Cache the response (don't re-cache if it came from cache)
    if (result.provider !== 'cache') {
      responseCache.set(cacheKey, { answer: result.answer, timestamp: Date.now() });
    }

    return NextResponse.json({ success: true, answer: result.answer, provider: result.provider });
  } catch (error: any) {
    console.error('[AI Router] All providers failed:', error?.message || error);
    return NextResponse.json({ success: false, error: error?.message || 'All AI providers are currently unavailable. Please try again.' }, { status: 500 });
  }
}
