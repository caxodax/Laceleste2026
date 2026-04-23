import { supabase } from '../supabase';
import { Customer } from '@/types';

export const getCustomerByIdCard = async (idCard: string): Promise<Customer | null> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id_card', idCard)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    idCard: data.id_card,
    name: data.name,
    phone: data.phone,
    email: data.email,
    points: data.points || 0,
    lastVisit: data.last_visit ? new Date(data.last_visit) : undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
};

export const upsertCustomer = async (customer: Partial<Customer>): Promise<Customer> => {
  const payload = {
    id_card: customer.idCard,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('customers')
    .upsert(payload, { onConflict: 'id_card' })
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    idCard: data.id_card,
    name: data.name,
    phone: data.phone,
    email: data.email,
    points: data.points || 0,
    lastVisit: data.last_visit ? new Date(data.last_visit) : undefined
  } as Customer;
};

export const addPointsToCustomer = async (idCard: string): Promise<void> => {
  const { data: current, error: fetchError } = await supabase
    .from('customers')
    .select('points')
    .eq('id_card', idCard)
    .single();

  if (fetchError) throw fetchError;

  const newPoints = (current?.points || 0) + 1;

  const { error } = await supabase
    .from('customers')
    .update({ 
      points: newPoints, 
      last_visit: new Date().toISOString(),
      updated_at: new Date().toISOString() 
    })
    .eq('id_card', idCard);

  if (error) throw error;
};
