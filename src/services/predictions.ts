import { supabase } from '@/lib/supabase';
import { DBPrediction } from '@/types/database';

export async function getPredictions(): Promise<DBPrediction[]> {
  const { data, error } = await supabase
    .from('predictions')
    .select('*');

  if (error) {
    throw error;
  }

  return (data || []) as DBPrediction[];
}

