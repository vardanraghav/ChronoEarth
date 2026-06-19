import { useState, useEffect, useCallback } from 'react';
import { getPredictions } from '@/services/predictions';
import { DBPrediction } from '@/types/database';
import { PREDICTIONS, Prediction } from '@/data/predictionsData';

// Helper to map DBPrediction to frontend Prediction
export function mapDBPredictionToFrontend(p: DBPrediction): Prediction {
  return {
    id: p.id.toString(),
    slug: p.slug,
    title: p.title,
    description: p.description,
    category: p.category,
    year: p.year,
    author: p.author,
    city: p.city,
    confidenceScore: p.confidence_score,
    initialVotes: p.initial_votes,
    votes: p.votes,
    tags: p.tags || [],
    comments: p.comments || [],
    shareUrl: p.share_url,
    created_at: p.created_at
  };
}

export function usePredictions() {
  const [predictions, setPredictions] = useState<Prediction[]>(PREDICTIONS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPredictions = useCallback(async () => {
    try {
      const dbPreds = await getPredictions();
      if (dbPreds && dbPreds.length > 0) {
        setPredictions(dbPreds.map(mapDBPredictionToFrontend));
      } else {
        setPredictions(PREDICTIONS);
      }
      setError(null);
    } catch (err) {
      const fetchError = err instanceof Error ? err : new Error(String(err));
      setError(fetchError);
      setPredictions(PREDICTIONS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  return { predictions, loading, error, refetch: fetchPredictions };
}
