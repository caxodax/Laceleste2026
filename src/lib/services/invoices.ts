import { supabase } from '@/lib/supabase';
import { Invoice, InvoiceItem } from '@/types';
import { generateInvoiceNumber } from '@/lib/utils';

export async function getInvoices(statusFilter?: string): Promise<Invoice[]> {
  let query = supabase
    .from('invoices')
    .select('*, invoice_items(*)');

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(mapInvoiceFromDB);
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*, invoice_items(*)')
    .eq('id', id)
    .single();

  if (error) return null;

  return mapInvoiceFromDB(data);
}

export async function createInvoice(
  data: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const invoiceNumber = generateInvoiceNumber();
  
  // 1. Insert invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      invoice_number: invoiceNumber,
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

  if (invoiceError) throw invoiceError;

  // 2. Insert items
  const invoiceItems = data.items.map((item: InvoiceItem) => ({
    invoice_id: invoice.id,
    product_name: item.productName,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total: item.total,
    notes: item.notes,
  }));

  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(invoiceItems);

  if (itemsError) throw itemsError;

  return invoice.id;
}

export async function updateInvoice(id: string, data: Partial<Invoice>): Promise<void> {
  const { error } = await supabase
    .from('invoices')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

export async function issueInvoice(id: string): Promise<void> {
  const { error } = await supabase
    .from('invoices')
    .update({
      status: 'issued',
      issued_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

export async function markInvoiceAsPaid(id: string, paymentReference?: string): Promise<void> {
  const { error } = await supabase
    .from('invoices')
    .update({
      status: 'paid',
      payment_reference: paymentReference,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

export async function cancelInvoice(id: string): Promise<void> {
  const { error } = await supabase
    .from('invoices')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

export async function getInvoicesByDateRange(
  startDate: Date,
  endDate: Date
): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*, invoice_items(*)')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(mapInvoiceFromDB);
}

export async function getTotalRevenue(startDate?: Date, endDate?: Date): Promise<number> {
  let query = supabase
    .from('invoices')
    .select('total')
    .eq('status', 'paid');

  if (startDate && endDate) {
    query = query.gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) throw error;

  return data.reduce((sum, inv) => sum + inv.total, 0);
}

// Helper to map DB record to Invoice type
function mapInvoiceFromDB(record: any): Invoice {
  return {
    id: record.id,
    invoiceNumber: record.invoice_number,
    orderId: record.order_id,
    customerName: record.customer_name,
    customerPhone: record.customer_phone,
    customerEmail: record.customer_email,
    customerAddress: record.customer_address,
    customerRif: record.customer_rif,
    subtotal: record.subtotal,
    tax: record.tax,
    taxRate: 0.16, // Default or fetch from settings
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
    items: record.invoice_items.map((item: any) => ({
      productId: '', // Not strictly needed for display
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      total: item.total,
      notes: item.notes,
    })),
  } as any;
}
