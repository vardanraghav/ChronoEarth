import { supabase } from '@/lib/supabase';
import { DBKnowledgeBase } from '@/types/database';

export async function getKnowledgeBase(): Promise<DBKnowledgeBase[]> {
  try {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*');

    if (error) throw error;
    return (data || []) as DBKnowledgeBase[];
  } catch (err) {
    console.error('Error in getKnowledgeBase:', err);
    return [];
  }
}

export async function searchKnowledgeBase(queryText: string): Promise<DBKnowledgeBase[]> {
  try {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .or(`title.ilike.%${queryText}%,category.ilike.%${queryText}%,explanation.ilike.%${queryText}%,short_desc.ilike.%${queryText}%,content.ilike.%${queryText}%`);

    if (error) throw error;
    return (data || []) as DBKnowledgeBase[];
  } catch (err) {
    console.error(`Error searching knowledge base for "${queryText}":`, err);
    return [];
  }
}

export async function getKnowledgeByCategory(category: string): Promise<DBKnowledgeBase[]> {
  try {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('category', category);

    if (error) throw error;
    return (data || []) as DBKnowledgeBase[];
  } catch (err) {
    console.error(`Error querying knowledge category "${category}":`, err);
    return [];
  }
}

export async function getKnowledgeTimeline(): Promise<DBKnowledgeBase[]> {
  try {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .order('readiness_index', { ascending: false, nullsFirst: false });

    if (error) throw error;
    return (data || []) as DBKnowledgeBase[];
  } catch (err) {
    console.error('Error querying knowledge timeline:', err);
    return [];
  }
}
