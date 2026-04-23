import { supabase } from '../supabase';
import { RestaurantTable } from '@/types';

export const getTables = async (): Promise<RestaurantTable[]> => {
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .order('number', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const updateTableStatus = async (id: string, status: RestaurantTable['status']): Promise<void> => {
  const { error } = await supabase
    .from('tables')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
};

export const createTable = async (number: number): Promise<RestaurantTable> => {
  const { data, error } = await supabase
    .from('tables')
    .insert([{ number, status: 'free', active: true }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const toggleTableActive = async (id: string, active: boolean): Promise<void> => {
  const { error } = await supabase
    .from('tables')
    .update({ active, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
};

export const deleteTable = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('tables')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
