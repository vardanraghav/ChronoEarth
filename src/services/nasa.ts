import { supabase } from '@/lib/supabase';
import { DBSpaceEvent } from '@/types/database';

const NASA_API_KEY = process.env.NASA_API_KEY || 'jaODbhEh1voKUhbhT1q8IEVFt6C0oqFB9lNwWDTS';

// Helper for fetching with retry logic
async function fetchWithRetry(url: string, retries = 3, delay = 1000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.status === 429) {
        console.warn(`NASA API Rate Limited. Retrying after delay...`);
        await new Promise((resolve) => setTimeout(resolve, delay * 2));
        continue;
      }
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
      return response;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  throw new Error('Fetch failed after retries');
}

export async function fetchAPOD(): Promise<DBSpaceEvent | null> {
  const today = new Date().toISOString().split('T')[0];
  const slug = `apod-${today}`;

  try {
    // Fetch from NASA API directly
    console.log('Fetching Astronomy Picture of the Day (APOD)...');
    const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;
    const res = await fetchWithRetry(url);
    const data = await res.json();

    const spaceEvent: DBSpaceEvent = {
      id: `apod-${today}`,
      created_at: new Date().toISOString(),
      event_type: 'APOD',
      title: data.title || 'Astronomy Picture of the Day',
      description: data.explanation || '',
      image_url: data.hdurl || data.url || null,
      event_date: data.date || today,
      metadata: {
        media_type: data.media_type,
        service_version: data.service_version,
        copyright: data.copyright
      },
      slug
    };

    return spaceEvent;
  } catch (err) {
    console.error('Exception in fetchAPOD:', err);
    return null;
  }
}

export async function fetchNEOs(): Promise<DBSpaceEvent[]> {
  const today = new Date().toISOString().split('T')[0];
  const slug = `neo-${today}`;

  try {
    // Fetch from NASA API directly
    console.log('Fetching Near Earth Objects (NEO)...');
    const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${NASA_API_KEY}`;
    const res = await fetchWithRetry(url);
    const result = await res.json();

    const dayObjects = result.near_earth_objects?.[today] || [];
    const events: DBSpaceEvent[] = dayObjects.slice(0, 5).map((neo: any, idx: number) => ({
      id: `neo-${neo.id || idx}-${today}`,
      created_at: new Date().toISOString(),
      event_type: 'NEO',
      title: `NEO: ${neo.name}`,
      description: `Hazardous: ${neo.is_potentially_hazardous_asteroid ? 'YES' : 'NO'}. Miss distance: ${neo.close_approach_data?.[0]?.miss_distance?.kilometers || 'unknown'} km. Estimated diameter: ${neo.estimated_diameter?.meters?.estimated_diameter_min?.toFixed(1) || '0'}m - ${neo.estimated_diameter?.meters?.estimated_diameter_max?.toFixed(1) || '0'}m.`,
      image_url: null,
      event_date: today,
      metadata: {
        neo_reference_id: neo.neo_reference_id,
        nasa_jpl_url: neo.nasa_jpl_url,
        absolute_magnitude_h: neo.absolute_magnitude_h,
        is_potentially_hazardous_asteroid: neo.is_potentially_hazardous_asteroid,
        close_approach_data: neo.close_approach_data,
        velocity_km_h: neo.close_approach_data?.[0]?.relative_velocity?.kilometers_per_hour
      },
      slug: `neo-${neo.id}-${today}`
    }));

    return events;
  } catch (err) {
    console.error('Exception in fetchNEOs:', err);
    return [];
  }
}

export async function fetchEPIC(): Promise<DBSpaceEvent | null> {
  const today = new Date().toISOString().split('T')[0];
  const slug = `epic-${today}`;

  try {
    console.log('Fetching EPIC Earth Images...');
    const url = `https://api.nasa.gov/EPIC/api/natural?api_key=${NASA_API_KEY}`;
    const res = await fetchWithRetry(url);
    const data = await res.json();

    if (!data || data.length === 0) return null;

    const epic = data[0];
    // Formulate EPIC image url
    // Format: https://epic.gsfc.nasa.gov/archive/natural/YYYY/MM/DD/png/epic_1b_YYYYMMDDxxxxxx.png
    const datePart = epic.date.split(' ')[0].replace(/-/g, '/'); // YYYY/MM/DD
    const imageUrl = `https://epic.gsfc.nasa.gov/archive/natural/${datePart}/png/${epic.image}.png`;

    const spaceEvent: DBSpaceEvent = {
      id: `epic-${today}`,
      created_at: new Date().toISOString(),
      event_type: 'EPIC',
      title: `EPIC Earth Observation: ${epic.caption || 'Daily Image'}`,
      description: `Centroid coordinates: Lat ${epic.centroid_coordinates?.lat?.toFixed(3)}, Lon ${epic.centroid_coordinates?.lon?.toFixed(3)}. Position: X: ${epic.dscovr_j2000_position?.x?.toFixed(1)}, Y: ${epic.dscovr_j2000_position?.y?.toFixed(1)}, Z: ${epic.dscovr_j2000_position?.z?.toFixed(1)}.`,
      image_url: imageUrl,
      event_date: today,
      metadata: {
        image_name: epic.image,
        centroid_coordinates: epic.centroid_coordinates,
        dscovr_j2000_position: epic.dscovr_j2000_position,
        lunar_j2000_position: epic.lunar_j2000_position,
        sun_j2000_position: epic.sun_j2000_position
      },
      slug
    };

    return spaceEvent;
  } catch (err) {
    console.error('Exception in fetchEPIC:', err);
    return null;
  }
}

export async function getSpaceEvents(): Promise<DBSpaceEvent[]> {
  try {
    const { data, error } = await supabase
      .from('space_events')
      .select('*')
      .order('event_date', { ascending: false });

    if (error) throw error;
    return (data || []) as DBSpaceEvent[];
  } catch (err) {
    console.error('Error querying space events:', err);
    return [];
  }
}
