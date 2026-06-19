import { supabase } from '@/lib/supabase';
import { DBNews } from '@/types/database';

export async function getNews(): Promise<DBNews[]> {
  const { data, error } = await supabase
    .from('news')
    .select('*');

  if (error) {
    throw error;
  }

  return (data || []) as DBNews[];
}

