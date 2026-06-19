import { supabase } from '@/lib/supabase';
import { DBFuturologist } from '@/types/database';

export async function getFuturologists(): Promise<DBFuturologist[]> {
  const { data, error } = await supabase
    .from('futurologists')
    .select('*');

  if (error) {
    throw error;
  }

  return (data || []) as DBFuturologist[];
}

