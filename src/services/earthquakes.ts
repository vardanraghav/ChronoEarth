import { supabase } from '@/lib/supabase';
import { DBEarthquake } from '@/types/database';

const USGS_API_URL = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

export async function fetchRecentEarthquakes(minMagnitude = 4.5): Promise<DBEarthquake[]> {
  try {
    console.log('Fetching recent earthquakes from USGS...');
    const url = `${USGS_API_URL}?format=geojson&minmagnitude=${minMagnitude}&limit=50`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`USGS API error: ${res.status}`);
    const data = await res.json();

    const features = data.features || [];
    const earthquakes: Omit<DBEarthquake, 'id' | 'created_at'>[] = features.map((feat: any) => {
      const props = feat.properties || {};
      const geom = feat.geometry || {};
      const coords = geom.coordinates || [0, 0, 0];
      return {
        usgs_id: feat.id,
        magnitude: props.mag ?? 0.0,
        place: props.place || 'Unknown Location',
        time: new Date(props.time).toISOString(),
        lon: coords[0],
        lat: coords[1],
        depth: coords[2] ?? null
      };
    });

    if (earthquakes.length === 0) return [];

    // Batch upsert to database on conflict of usgs_id
    const { data: inserted, error: insertErr } = await supabase
      .from('earthquakes')
      .upsert(earthquakes, { onConflict: 'usgs_id' })
      .select();

    if (insertErr) {
      console.error('Error inserting earthquakes into Supabase:', insertErr.message);
      // Return temporary client-side mock if db fails
      return earthquakes.map((eq, i) => ({
        ...eq,
        id: 'temp-' + i,
        created_at: new Date().toISOString()
      })) as DBEarthquake[];
    }

    return (inserted || []) as DBEarthquake[];
  } catch (err) {
    console.error('Exception in fetchRecentEarthquakes:', err);
    return [];
  }
}

export async function getEarthquakesFromDB(limit = 100): Promise<DBEarthquake[]> {
  try {
    const { data, error } = await supabase
      .from('earthquakes')
      .select('*')
      .order('time', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as DBEarthquake[];
  } catch (err) {
    console.error('Error querying earthquakes from DB:', err);
    return [];
  }
}
