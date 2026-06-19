import { useState, useEffect, useCallback } from 'react';
import { getCities } from '@/services/cities';
import { CityData, citiesRawData } from '@/data/citiesData';

export function useCities() {
  const [cities, setCities] = useState<CityData[]>(citiesRawData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCities = useCallback(async () => {
    try {
      const dbCities = await getCities();
      
      if (dbCities && dbCities.length > 0) {
        // Map database cities to CityData (which matches the type exactly)
        setCities(dbCities as CityData[]);
      } else {
        setCities(citiesRawData);
      }
      setError(null);
    } catch (err) {
      const fetchError = err instanceof Error ? err : new Error(String(err));
      setError(fetchError);
      
      // Fallback on error
      setCities(citiesRawData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCities();

    // Set up 5-minute refresh (300,000 milliseconds)
    const intervalId = setInterval(() => {
      fetchCities();
    }, 300000);

    return () => clearInterval(intervalId);
  }, [fetchCities]);

  return { cities, loading, error, refetch: fetchCities };
}
