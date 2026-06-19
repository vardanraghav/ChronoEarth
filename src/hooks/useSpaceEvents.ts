import { useState, useEffect, useCallback } from 'react';
import { DBSpaceEvent } from '@/types/database';

export function useSpaceEvents() {
  const [spaceEvents, setSpaceEvents] = useState<DBSpaceEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Call the server-side NASA proxy to avoid client-side CORS / API key issues
      const res = await fetch('/api/nasa');
      console.log('[useSpaceEvents] NASA proxy response status:', res.status);

      if (!res.ok) {
        throw new Error(`NASA proxy returned ${res.status}`);
      }

      const payload = await res.json();
      console.log('[useSpaceEvents] NASA Response', payload?.data);

      if (!payload.success || !payload.data) {
        throw new Error('NASA proxy returned unsuccessful response');
      }

      const { apod, neos, epic } = payload.data;

      const collected: DBSpaceEvent[] = [];

      if (apod) {
        console.log('[useSpaceEvents] APOD Status: loaded — image:', apod.image_url);
        collected.push(apod as DBSpaceEvent);
      }

      if (Array.isArray(neos) && neos.length > 0) {
        console.log('[useSpaceEvents] NEO Count:', neos.length);
        collected.push(...(neos as DBSpaceEvent[]));
      }

      if (epic) {
        console.log('[useSpaceEvents] EPIC Status: loaded — image:', epic.image_url);
        collected.push(epic as DBSpaceEvent);
      }

      setSpaceEvents(collected);
    } catch (err) {
      console.error('[useSpaceEvents] Failed to load NASA data:', err);
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
