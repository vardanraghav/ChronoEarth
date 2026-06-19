import { NextResponse } from 'next/server';
import { fetchAPOD, fetchNEOs, fetchEPIC } from '@/services/nasa';
import { generateProjections } from '@/services/climate';
import { fetchRecentEarthquakes } from '@/services/earthquakes';
import { fetchAllCategoriesNews } from '@/services/newsService';
import { fetchAllSemiconductorNews } from '@/services/semiconductor';
import { fetchAllMarketQuotes } from '@/services/market';
import { citiesRawData } from '@/data/citiesData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'all';
  const secret = searchParams.get('secret');

  // Basic secret security token verification
  if (secret !== 'chronoearth_secret_sync_2026') {
    return NextResponse.json({ error: 'Unauthorized sync request' }, { status: 401 });
  }

  try {
    const results: Record<string, string> = {};

    if (action === 'all' || action === 'nasa') {
      console.log('Running NASA scheduled sync...');
      await fetchAPOD();
      await fetchNEOs();
      await fetchEPIC();
      results.nasa = 'success';
    }

    if (action === 'all' || action === 'climate') {
      console.log('Running Climate scheduled sync...');
      // Sync projections for top 5 cities to prevent hitting API limits too hard
      const targetCities = citiesRawData.slice(0, 5);
      for (const city of targetCities) {
        await generateProjections(city.name);
      }
      results.climate = 'success';
    }

    if (action === 'all' || action === 'usgs') {
      console.log('Running USGS Earthquake scheduled sync...');
      await fetchRecentEarthquakes();
      results.usgs = 'success';
    }

    if (action === 'all' || action === 'news') {
      console.log('Running News Feed scheduled sync...');
      await fetchAllCategoriesNews();
      results.news = 'success';
    }

    if (action === 'all' || action === 'semiconductor') {
      console.log('Running Semiconductor scheduled sync...');
      await fetchAllSemiconductorNews();
      results.semiconductor = 'success';
    }

    if (action === 'all' || action === 'stocks') {
      console.log('Running Markets scheduled sync...');
      await fetchAllMarketQuotes();
      results.stocks = 'success';
    }

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      results
    });
  } catch (err: any) {
    console.error('Scheduled sync failed:', err);
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}
