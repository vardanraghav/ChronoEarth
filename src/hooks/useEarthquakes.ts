import { useState, useEffect, useCallback } from 'react';
import { getEarthquakesFromDB, fetchRecentEarthquakes } from '@/services/earthquakes';
import { DBEarthquake } from '@/types/database';

export function useEarthquakes(minMagnitude = 4.5) {
  const [earthquakes, setEarthquakes] = useState<DBEarthquake[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEarthquakesData = useCallback(async () => {
    try {
      setLoading(true);
      // Run sync in background
      await fetchRecentEarthquakes(minMagnitude);
      const dbData = await getEarthquakesFromDB(100);
      setEarthquakes(dbData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [minMagnitude]);

  useEffect(() => {
    fetchEarthquakesData();
  }, [fetchEarthquakesData]);

  return { earthquakes, loading, error, refetch: fetchEarthquakesData };
}
