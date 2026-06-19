import { supabase } from '@/lib/supabase';
import { DBCity } from '@/types/database';

export async function getCities(): Promise<DBCity[]> {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*');

    if (error) {
      throw error;
    }

    return (data || []) as DBCity[];
  } catch (err) {
    throw err;
  }
}
