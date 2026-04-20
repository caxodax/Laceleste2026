import { supabase } from '@/lib/supabase';
import { Product, Category } from '@/types';

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) throw error;

  return data.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category_id,
    image: item.image_url,
    thumbnail: item.thumbnail_url,
    available: item.available,
    featured: item.featured,
    order: item.order_index,
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at),
  })) as Product[];
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .order('order_index', { ascending: true });

  if (error) throw error;

  return data.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category_id,
    image: item.image_url,
    thumbnail: item.thumbnail_url,
    available: item.available,
    featured: item.featured,
    order: item.order_index,
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at),
  })) as Product[];
}

export async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    price: data.price,
    category: data.category_id,
    image: data.image_url,
    thumbnail: data.thumbnail_url,
    available: data.available,
    featured: data.featured,
    order: data.order_index,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  } as Product;
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) throw error;

  return data.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    icon: item.icon,
    order: item.order_index,
    active: item.active,
  })) as Category[];
}

export async function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const { data: item, error } = await supabase
    .from('products')
    .insert({
      id: data.name.toLowerCase().replace(/\s+/g, '-'),
      name: data.name,
      description: data.description,
      price: data.price,
      category_id: data.category,
      image_url: data.image,
      thumbnail_url: data.thumbnail,
      available: data.available,
      featured: data.featured,
      order_index: data.order,
    })
    .select()
    .single();

  if (error) throw error;
  return item.id;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({
      name: data.name,
      description: data.description,
      price: data.price,
      category_id: data.category,
      image_url: data.image,
      thumbnail_url: data.thumbnail,
      available: data.available,
      featured: data.featured,
      order_index: data.order,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function toggleProductAvailability(id: string, available: boolean): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ available, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}
