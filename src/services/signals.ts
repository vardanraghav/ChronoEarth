import { supabase } from '@/lib/supabase';
import { DBSignal } from '@/types/database';

export async function getSignals(): Promise<DBSignal[]> {
  const { data, error } = await supabase
    .from('signals')
    .select('*');

  if (error) {
    throw error;
  }

  return (data || []) as DBSignal[];
}

