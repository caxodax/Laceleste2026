import { supabase } from '@/lib/supabase';
import { DeliveryNote, DeliveryNoteItem } from '@/types';
import { generateNoteNumber } from '@/lib/utils';

export async function getDeliveryNotes(statusFilter?: string): Promise<DeliveryNote[]> {
  let query = supabase
    .from('delivery_notes')
    .select('*, delivery_note_items(*)');

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(mapNoteFromDB);
}

export async function getDeliveryNote(id: string): Promise<DeliveryNote | null> {
  const { data, error } = await supabase
    .from('delivery_notes')
    .select('*, delivery_note_items(*)')
    .eq('id', id)
    .single();

  if (error) return null;

  return mapNoteFromDB(data);
}

export async function createDeliveryNote(
  data: Omit<DeliveryNote, 'id' | 'noteNumber' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const noteNumber = generateNoteNumber();
  
  // 1. Insert delivery note
  const { data: note, error: noteError } = await supabase
    .from('delivery_notes')
    .insert({
      note_number: noteNumber,
      order_id: data.orderId,
      customer_name: data.customerName,
      customer_phone: data.customerPhone,
      customer_email: data.customerEmail,
      customer_address: data.customerAddress,
      customer_rif: data.customerRif,
      subtotal: data.subtotal,
      tax: data.tax,
      delivery_fee: data.deliveryFee,
      discount: data.discount,
      total: data.total,
      payment_method: data.paymentMethod,
      payment_reference: data.paymentReference,
      status: data.status,
      notes: data.notes,
    })
    .select()
    .single();

  if (noteError) throw noteError;

  // 2. Insert items
  const noteItems = data.items.map((item: DeliveryNoteItem) => ({
    note_id: note.id,
    product_name: item.productName,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total: item.total,
    notes: item.notes,
  }));

  const { error: itemsError } = await supabase
    .from('delivery_note_items')
    .insert(noteItems);

  if (itemsError) throw itemsError;

  return note.id;
}

export async function updateDeliveryNote(id: string, data: Partial<DeliveryNote>): Promise<void> {
  const { error } = await supabase
    .from('delivery_notes')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

export async function issueDeliveryNote(id: string): Promise<void> {
  const { error } = await supabase
    .from('delivery_notes')
    .update({
      status: 'issued',
      issued_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

export async function markNoteAsPaid(id: string, paymentReference?: string): Promise<void> {
  const { error } = await supabase
    .from('delivery_notes')
    .update({
      status: 'paid',
      payment_reference: paymentReference,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

export async function cancelDeliveryNote(id: string): Promise<void> {
  const { error } = await supabase
    .from('delivery_notes')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

export async function getDeliveryNotesByDateRange(
  startDate: Date,
  endDate: Date
): Promise<DeliveryNote[]> {
  const { data, error } = await supabase
    .from('delivery_notes')
    .select('*, delivery_note_items(*)')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(mapNoteFromDB);
}

export async function getTotalRevenue(startDate?: Date, endDate?: Date): Promise<number> {
  let query = supabase
    .from('delivery_notes')
    .select('total')
    .eq('status', 'paid');

  if (startDate && endDate) {
    query = query.gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) throw error;

  return data.reduce((sum, item) => sum + item.total, 0);
}

// Helper to map DB record to DeliveryNote type
function mapNoteFromDB(record: any): DeliveryNote {
  return {
    id: record.id,
    noteNumber: record.note_number,
    orderId: record.order_id,
    customerName: record.customer_name,
    customerPhone: record.customer_phone,
    customerEmail: record.customer_email,
    customerAddress: record.customer_address,
    customerRif: record.customer_rif,
    subtotal: record.subtotal,
    tax: record.tax,
    taxRate: 0.16,
    deliveryFee: record.delivery_fee,
    discount: record.discount,
    total: record.total,
    paymentMethod: record.payment_method,
    paymentReference: record.payment_reference,
    status: record.status,
    notes: record.notes,
    createdAt: new Date(record.created_at),
    updatedAt: new Date(record.updated_at),
    issuedAt: record.issued_at ? new Date(record.issued_at) : undefined,
    paidAt: record.paid_at ? new Date(record.paid_at) : undefined,
    items: (record.delivery_note_items || []).map((item: any) => ({
      productId: '', 
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      total: item.total,
      notes: item.notes,
    })),
  } as any;
}
