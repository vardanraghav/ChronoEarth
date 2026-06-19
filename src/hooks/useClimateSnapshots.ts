import { useState, useEffect, useCallback } from 'react';
import { getClimateHistory, generateProjections } from '@/services/climate';
import { DBClimateSnapshot } from '@/types/database';

export function useClimateSnapshots(cityName: string) {
  const [climateSnapshots, setClimateSnapshots] = useState<DBClimateSnapshot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchClimate = useCallback(async () => {
    if (!cityName) return;
    try {
      setLoading(true);
      let data = await getClimateHistory(cityName);
      
      // If no data exists yet, generate projections on-the-fly
      if (data.length === 0) {
        data = await generateProjections(cityName);
      }
      
      setClimateSnapshots(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [cityName]);

  useEffect(() => {
    fetchClimate();
  }, [fetchClimate]);

  return { climateSnapshots, loading, error, refetch: fetchClimate };
}
