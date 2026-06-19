import fs from 'fs';
import path from 'path';

// 1. Load environment variables
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

import { fetchAPOD, fetchNEOs, fetchEPIC } from '../src/services/nasa';
import { generateProjections } from '../src/services/climate';
import { fetchRecentEarthquakes } from '../src/services/earthquakes';
import { fetchAllCategoriesNews } from '../src/services/newsService';
import { fetchAllSemiconductorNews } from '../src/services/semiconductor';
import { fetchAllMarketQuotes } from '../src/services/market';
import { citiesRawData } from '../src/data/citiesData';

async function runScheduledJobs() {
  console.log(`\n⏰ Starting scheduled sync jobs at: ${new Date().toISOString()}`);
  
  try {
    // 1. USGS Earthquake (every 30 mins)
    console.log('Syncing USGS Earthquakes...');
    await fetchRecentEarthquakes();

    // 2. News Feed (every 30 mins)
    console.log('Syncing News Feed...');
    await fetchAllCategoriesNews();

    // 3. Stocks and Market Quotes (every 1 hour)
    console.log('Syncing Markets...');
    await fetchAllMarketQuotes();

    // 4. Semiconductor Intelligence (every 1 hour)
    console.log('Syncing Semiconductor news...');
    await fetchAllSemiconductorNews();

    // 5. Climate forecast (every 3 hours)
    console.log('Syncing Climate forecast...');
    const targetCities = citiesRawData.slice(0, 5);
    for (const city of targetCities) {
      await generateProjections(city.name);
    }

    // 6. NASA Deep Space (every 6 hours)
    console.log('Syncing NASA Events...');
    await fetchAPOD();
    await fetchNEOs();
    await fetchEPIC();

    console.log('✨ All sync tasks finished successfully.');
  } catch (err) {
    console.error('Error in sync scheduler execution:', err);
  }
}

runScheduledJobs();
