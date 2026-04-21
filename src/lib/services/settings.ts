import { supabase } from '@/lib/supabase';

export async function getSettings<T>(key: string): Promise<T | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error) {
    console.error(`Error fetching setting ${key}:`, error);
    return null;
  }

  return data.value as T;
}

export async function updateSettings<T>(key: string, value: T): Promise<void> {
  const { error } = await supabase
    .from('settings')
    .upsert({
      key,
      value: value as any,
      updated_at: new Date().toISOString(),
    });

  if (error) throw error;
}

export async function getAllSettings(): Promise<Record<string, any>> {
  const { data, error } = await supabase
    .from('settings')
    .select('*');

  if (error) throw error;

  return data.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, any>);
}
