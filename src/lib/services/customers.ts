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

export const addPointsToCustomer = async (idCard: string, increment: number = 1): Promise<void> => {
  const { data: current, error: fetchError } = await supabase
    .from('customers')
    .select('points')
    .eq('id_card', idCard)
    .single();

  if (fetchError) throw fetchError;

  const newPoints = (current?.points || 0) + increment;

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

export const getCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('points', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map((item) => ({
    id: item.id,
    idCard: item.id_card,
    name: item.name,
    phone: item.phone,
    email: item.email,
    points: item.points || 0,
    lastVisit: item.last_visit ? new Date(item.last_visit) : undefined,
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at),
  }));
};

export const createCustomer = async (customer: Omit<Customer, 'id' | 'points'>): Promise<Customer> => {
  const payload = {
    id_card: customer.idCard,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    points: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('customers')
    .insert(payload)
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
    lastVisit: data.last_visit ? new Date(data.last_visit) : undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
};

export const updateCustomer = async (id: string, customer: Partial<Customer>): Promise<Customer> => {
  const payload: any = {
    updated_at: new Date().toISOString()
  };
  
  if (customer.idCard !== undefined) payload.id_card = customer.idCard;
  if (customer.name !== undefined) payload.name = customer.name;
  if (customer.phone !== undefined) payload.phone = customer.phone;
  if (customer.email !== undefined) payload.email = customer.email;
  if (customer.points !== undefined) payload.points = customer.points;
  if (customer.lastVisit !== undefined) payload.last_visit = customer.lastVisit?.toISOString() || null;

  const { data, error } = await supabase
    .from('customers')
    .update(payload)
    .eq('id', id)
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
    lastVisit: data.last_visit ? new Date(data.last_visit) : undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
};

export const deleteCustomer = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
