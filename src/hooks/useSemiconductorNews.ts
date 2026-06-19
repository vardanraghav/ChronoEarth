import { useState, useEffect, useCallback } from 'react';
import { getSemiconductorNewsFromDB, fetchAllSemiconductorNews } from '@/services/semiconductor';
import { DBSemiconductorNews } from '@/types/database';

export function useSemiconductorNews(company?: string) {
  const [semiNews, setSemiNews] = useState<DBSemiconductorNews[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch latest articles in background
      await fetchAllSemiconductorNews();
      const news = await getSemiconductorNewsFromDB(company);
      setSemiNews(news);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [company]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return { semiNews, loading, error, refetch: fetchNews };
}
