import { useState, useEffect, useCallback } from 'react';
import { getMarketOverview } from '@/services/market';
import { DBMarketSnapshot } from '@/types/database';

export function useMarketOverview() {
  const [snapshots, setSnapshots] = useState<DBMarketSnapshot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMarkets = useCallback(async () => {
    try {
      setLoading(true);
      const overview = await getMarketOverview();
      setSnapshots(overview);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  return { snapshots, loading, error, refetch: fetchMarkets };
}
