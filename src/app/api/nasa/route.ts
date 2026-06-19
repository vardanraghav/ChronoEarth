import { NextRequest, NextResponse } from 'next/server';

const NASA_API_KEY = process.env.NASA_API_KEY || 'jaODbhEh1voKUhbhT1q8IEVFt6C0oqFB9lNwWDTS';

async function safeFetch(url: string) {
  try {
    const res = await fetch(url, { next: { revalidate: 300 } }); // cache 5 min
    if (!res.ok) {
      console.warn(`[NASA API Proxy] Failed: ${url} — ${res.status} ${res.statusText}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`[NASA API Proxy] Exception for ${url}:`, err);
    return null;
  }
}

export async function GET(req: NextRequest) {
  const today = new Date().toISOString().split('T')[0];

  console.log('[NASA API Proxy] Fetching APOD, NEO, EPIC for date:', today);

  const [apodData, neoData, epicData] = await Promise.all([
    safeFetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`),
    safeFetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${NASA_API_KEY}`),
    safeFetch(`https://api.nasa.gov/EPIC/api/natural?api_key=${NASA_API_KEY}`),
  ]);

  // --- Build APOD event ---
  let apod = null;
  if (apodData) {
    const imageUrl = apodData.hdurl || apodData.url || null;
    console.log('[NASA API Proxy] APOD Status: OK — title:', apodData.title);
    console.log('[NASA API Proxy] Orbital Image URL (APOD):', imageUrl);
    apod = {
      id: `apod-${today}`,
      created_at: new Date().toISOString(),
      event_type: 'APOD',
      title: apodData.title || 'Astronomy Picture of the Day',
      description: apodData.explanation || '',
      image_url: imageUrl,
      event_date: apodData.date || today,
      metadata: {
        media_type: apodData.media_type,
        service_version: apodData.service_version,
        copyright: apodData.copyright,
      },
      slug: `apod-${today}`,
    };
  } else {
    console.warn('[NASA API Proxy] APOD Status: FAILED — null response');
  }

  // --- Build NEO events ---
  const neos: any[] = [];
  if (neoData) {
    const dayObjects = neoData.near_earth_objects?.[today] || [];
    console.log('[NASA API Proxy] NEO Count:', dayObjects.length);
    dayObjects.slice(0, 5).forEach((neo: any, idx: number) => {
      neos.push({
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
          velocity_km_h: neo.close_approach_data?.[0]?.relative_velocity?.kilometers_per_hour,
        },
        slug: `neo-${neo.id}-${today}`,
      });
    });
  } else {
    console.warn('[NASA API Proxy] NEO Status: FAILED — null response');
  }

  // --- Build EPIC event ---
  let epic = null;
  if (epicData && Array.isArray(epicData) && epicData.length > 0) {
    const epicItem = epicData[0];
    const datePart = epicItem.date.split(' ')[0].replace(/-/g, '/'); // YYYY/MM/DD
    const imageUrl = `https://epic.gsfc.nasa.gov/archive/natural/${datePart}/png/${epicItem.image}.png`;
    console.log('[NASA API Proxy] Orbital Image URL (EPIC):', imageUrl);
    epic = {
      id: `epic-${today}`,
      created_at: new Date().toISOString(),
      event_type: 'EPIC',
      title: `EPIC Earth Observation: ${epicItem.caption || 'Daily Image'}`,
      description: `Centroid coordinates: Lat ${epicItem.centroid_coordinates?.lat?.toFixed(3)}, Lon ${epicItem.centroid_coordinates?.lon?.toFixed(3)}. Position: X: ${epicItem.dscovr_j2000_position?.x?.toFixed(1)}, Y: ${epicItem.dscovr_j2000_position?.y?.toFixed(1)}, Z: ${epicItem.dscovr_j2000_position?.z?.toFixed(1)}.`,
      image_url: imageUrl,
      event_date: today,
      metadata: {
        image_name: epicItem.image,
        centroid_coordinates: epicItem.centroid_coordinates,
        dscovr_j2000_position: epicItem.dscovr_j2000_position,
        lunar_j2000_position: epicItem.lunar_j2000_position,
        sun_j2000_position: epicItem.sun_j2000_position,
      },
      slug: `epic-${today}`,
    };
  } else {
    console.warn('[NASA API Proxy] EPIC Status: FAILED or empty array');
  }

  console.log('[NASA API Proxy] Response — APOD:', !!apod, '| NEOs:', neos.length, '| EPIC:', !!epic);

  return NextResponse.json({
    success: true,
    data: { apod, neos, epic },
  });
}
