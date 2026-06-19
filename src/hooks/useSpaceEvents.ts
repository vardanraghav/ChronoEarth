import { useState, useEffect, useCallback } from 'react';
import { fetchAPOD, fetchNEOs, fetchEPIC } from '@/services/nasa';
import { DBSpaceEvent } from '@/types/database';

export function useSpaceEvents() {
  const [spaceEvents, setSpaceEvents] = useState<DBSpaceEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch directly from NASA API — no Supabase write needed
      const [apod, neos, epic] = await Promise.allSettled([
        fetchAPOD(),
        fetchNEOs(),
        fetchEPIC()
      ]);

      const collected: DBSpaceEvent[] = [];
      if (apod.status === 'fulfilled' && apod.value) collected.push(apod.value);
      if (neos.status === 'fulfilled' && neos.value) collected.push(...neos.value);
      if (epic.status === 'fulfilled' && epic.value) collected.push(epic.value);

      setSpaceEvents(collected);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { spaceEvents, loading, error, refetch: fetchEvents };
}

