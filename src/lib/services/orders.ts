import { supabase } from '@/lib/supabase';
import { Order, CartItem } from '@/types';

export async function getOrders(statusFilter?: string): Promise<Order[]> {
  let query = supabase
    .from('orders')
    .select('*, order_items(*)');

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(mapOrderFromDB);
}

export async function getRecentOrders(count: number = 10): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })
    .limit(count);

  if (error) throw error;

  return data.map(mapOrderFromDB);
}

export async function getOrder(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single();

  if (error) return null;

  return mapOrderFromDB(data);
}

export async function createOrder(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  // 1. Insert the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_name: data.customerName,
      customer_phone: data.customerPhone,
      customer_email: data.customerEmail,
      delivery_address: data.deliveryAddress,
      delivery_type: data.deliveryType,
      payment_method: data.paymentMethod,
      status: data.status,
      subtotal: data.subtotal,
      tax: data.tax,
      delivery_fee: data.deliveryFee,
      total: data.total,
      notes: data.notes,
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // 2. Insert order items
  const orderItems = data.items.map((item: CartItem) => ({
    order_id: order.id,
    product_id: item.product.id,
    quantity: item.quantity,
    unit_price: item.product.price,
    total_price: item.product.price * item.quantity,
    notes: item.notes,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return order.id;
}

export async function updateOrderStatus(
  id: string,
  status: Order['status']
): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function getOrdersByDateRange(
  startDate: Date,
  endDate: Date
): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(mapOrderFromDB);
}

export async function getTodayOrders(): Promise<Order[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return getOrdersByDateRange(today, tomorrow);
}

// Helper to map DB record to Order type
function mapOrderFromDB(record: any): Order {
  return {
    id: record.id,
    customerName: record.customer_name,
    customerPhone: record.customer_phone,
    customerEmail: record.customer_email,
    deliveryAddress: record.delivery_address,
    deliveryType: record.delivery_type,
    paymentMethod: record.payment_method,
    status: record.status,
    subtotal: record.subtotal,
    tax: record.tax,
    deliveryFee: record.delivery_fee,
    total: record.total,
    notes: record.notes,
    createdAt: new Date(record.created_at),
    updatedAt: new Date(record.updated_at),
    items: record.order_items.map((item: any) => ({
      product: { id: item.product_id, price: item.unit_price } as any, // Full product info might be needed if UI expects it
      quantity: item.quantity,
      notes: item.notes,
    })),
  };
}
