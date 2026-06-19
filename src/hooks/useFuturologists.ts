import { useState, useEffect, useCallback } from 'react';
import { getFuturologists } from '@/services/futurologists';
import { FUTUROLOGISTS, Futurologist } from '@/data/predictionsData';

export function useFuturologists() {
  const [futurologists, setFuturologists] = useState<Futurologist[]>(FUTUROLOGISTS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFuturologists = useCallback(async () => {
    try {
      const dbFuts = await getFuturologists();
      if (dbFuts && dbFuts.length > 0) {
        setFuturologists(dbFuts.map(f => ({
          name: f.name,
          slug: f.slug,
          role: f.role,
          specialization: f.specialization,
          avatar: f.avatar,
          bio: f.bio,
          contributions: f.contributions,
          influenceScore: f.influenceScore
        })));
      } else {
        setFuturologists(FUTUROLOGISTS);
      }
      setError(null);
    } catch (err) {
      const fetchError = err instanceof Error ? err : new Error(String(err));
      setError(fetchError);
      setFuturologists(FUTUROLOGISTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFuturologists();
  }, [fetchFuturologists]);

  return { futurologists, loading, error, refetch: fetchFuturologists };
}
