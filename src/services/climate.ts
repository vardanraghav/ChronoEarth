import { supabase } from '@/lib/supabase';
import { DBClimateSnapshot } from '@/types/database';
import { CityData, citiesRawData } from '@/data/citiesData';

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export async function fetchCurrentClimate(city: CityData): Promise<{
  temp: number;
  humidity: number;
  windspeed: number;
  rainfall: number;
} | null> {
  try {
    const url = `${OPEN_METEO_BASE_URL}?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,rain`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);
    const data = await res.json();
    
    return {
      temp: data.current?.temperature_2m ?? 20.0,
      humidity: data.current?.relative_humidity_2m ?? 50.0,
      windspeed: data.current?.wind_speed_10m ?? 10.0,
      rainfall: data.current?.rain ?? 0.0,
    };
  } catch (err) {
    console.error(`Error fetching climate for ${city.name}:`, err);
    return null;
  }
}

export async function generateProjections(cityName: string): Promise<DBClimateSnapshot[]> {
  const city = citiesRawData.find(c => c.name.toLowerCase() === cityName.toLowerCase());
  if (!city) {
    throw new Error(`City '${cityName}' not found in raw data`);
  }

  try {
    // 1. Fetch current climate as baseline
    const baseline = await fetchCurrentClimate(city) || { temp: 22.0, humidity: 60.0, windspeed: 12.0, rainfall: 0.5 };
    const currentYear = new Date().getFullYear();
    const years = [2030, 2040, 2050];
    const snapshots: DBClimateSnapshot[] = [];

    // Current year baseline snapshot
    const baselineSnapshot: DBClimateSnapshot = {
      id: `current-${city.name}-${currentYear}`,
      created_at: new Date().toISOString(),
      city_name: city.name,
      temperature: baseline.temp,
      humidity: baseline.humidity,
      windspeed: baseline.windspeed,
      rainfall: baseline.rainfall,
      year: currentYear,
      scenario: 'current',
      timestamp: new Date().toISOString()
    };
    snapshots.push(baselineSnapshot);

    // 2. Generate projections for 2030, 2040, 2050
    for (const targetYear of years) {
      const yearsElapsed = targetYear - currentYear;

      const projectedTemp = baseline.temp + (yearsElapsed * (city.offsets.tempRise / 10)) + (city.offsets.temp / 10);
      const projectedRainfall = Math.max(0, baseline.rainfall + (yearsElapsed * (city.offsets.seaLevel > 0 ? 0.02 : -0.01)));
      const projectedHumidity = Math.max(10, Math.min(100, baseline.humidity + (yearsElapsed * (city.offsets.tempRise > 1.0 ? -0.3 : 0.1))));

      const projection: DBClimateSnapshot = {
        id: `projection-${city.name}-${targetYear}`,
        created_at: new Date().toISOString(),
        city_name: city.name,
        temperature: parseFloat(projectedTemp.toFixed(2)),
        humidity: parseFloat(projectedHumidity.toFixed(1)),
        windspeed: parseFloat(baseline.windspeed.toFixed(1)),
        rainfall: parseFloat(projectedRainfall.toFixed(2)),
        year: targetYear,
        scenario: 'projection',
        timestamp: new Date().toISOString()
      };

      snapshots.push(projection);
    }

    return snapshots;
  } catch (err) {
    console.error(`Exception generating projections for ${cityName}:`, err);
    return [];
  }
}

export async function getClimateHistory(cityName: string): Promise<DBClimateSnapshot[]> {
  try {
    const { data, error } = await supabase
      .from('climate_snapshots')
      .select('*')
      .eq('city_name', cityName)
      .order('year', { ascending: true });

    if (error) throw error;
    return (data || []) as DBClimateSnapshot[];
  } catch (err) {
    console.error(`Error querying climate history for ${cityName}:`, err);
    return [];
  }
}
