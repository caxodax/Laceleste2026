'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Plus,
  Trash2,
  Save,
  FileText,
  Printer,
} from 'lucide-react';
import Link from 'next/link';
import { Button, Input, Textarea, Select, Card, CardContent, CardHeader } from '@/components/ui';
import { formatCurrency, formatBs, generateNoteNumber } from '@/lib/utils';
import { useSettingsStore } from '@/store/settingsStore';
import { products, paymentMethods, restaurantSettings } from '@/data/menu';
import { createDeliveryNote } from '@/lib/services/deliveryNotes';
import toast from 'react-hot-toast';

interface DeliveryNoteFormData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  customerRif?: string;
  paymentMethod: string;
  paymentReference?: string;
  notes?: string;
}

interface DeliveryNoteItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export default function NuevaNotaEntregaPage() {
  const router = useRouter();
  const { info, bcvRate } = useSettingsStore();
  const [items, setItems] = useState<DeliveryNoteItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const noteNumber = generateNoteNumber();

  const { register, handleSubmit, formState: { errors } } = useForm<DeliveryNoteFormData>({
    defaultValues: {
      paymentMethod: 'efectivo',
    },
  });

  // Cálculos
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const taxRate = info?.showTax ? (info?.taxRate || 0) : 0;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  const totalBs = bcvRate ? total * bcvRate : 0;

  const addItem = () => {
    if (!selectedProduct) {
      toast.error('Selecciona un producto');
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    const existingIndex = items.findIndex((i) => i.productId === selectedProduct);
    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex].quantity += quantity;
      setItems(newItems);
    } else {
      setItems([
        ...items,
        {
          productId: product.id,
          productName: product.name,
          quantity,
          unitPrice: product.price,
        },
      ]);
    }

    setSelectedProduct('');
    setQuantity(1);
    toast.success('Producto agregado');
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(index);
      return;
    }
    const newItems = [...items];
    newItems[index].quantity = newQuantity;
    setItems(newItems);
  };

  const onSubmit = async (data: DeliveryNoteFormData) => {
    if (items.length === 0) {
      toast.error('Agrega al menos un producto');
      return;
    }

    setIsSubmitting(true);

    try {
      await createDeliveryNote({
        ...data,
        items: items.map(item => ({
          ...item,
          total: item.unitPrice * item.quantity
        })),
        subtotal,
        tax,
        deliveryFee: 0, 
        discount: 0,
        total,
        status: 'issued',
        orderId: 'MANUAL',
      });

      toast.success('Nota de entrega creada exitosamente');
      router.push('/admin/notas-entrega');
    } catch (error) {
      toast.error('Error al guardar la nota de entrega');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/notas-entrega">
          <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
            Volver
          </Button>
        </Link>
        <div className="mt-4">
          <h1 className="heading-2 text-gray-900">Nueva Nota de Entrega</h1>
          <p className="text-gray-600 mt-1">Generar comprobante para control interno</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-celeste-500" />
                  Datos del Cliente
                </h2>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Nombre / Razón Social"
                  placeholder="Nombre del cliente"
                  {...register('customerName', { required: 'El nombre es requerido' })}
                  error={errors.customerName?.message}
                />
                <Input
                  label="RIF / Cédula"
                  placeholder="V-12345678-9"
                  {...register('customerRif')}
                />
                <Input
                  label="Teléfono"
                  placeholder="0412-1234567"
                  icon={<Phone className="w-5 h-5" />}
                  {...register('customerPhone', { required: 'El teléfono es requerido' })}
                  error={errors.customerPhone?.message}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="cliente@email.com"
                  icon={<Mail className="w-5 h-5" />}
                  {...register('customerEmail')}
                />
                <div className="sm:col-span-2">
                  <Textarea
                    label="Dirección"
                    placeholder="Dirección del cliente"
                    {...register('customerAddress')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Products */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-celeste-500" />
                  Productos
                </h2>
              </CardHeader>
              <CardContent>
                {/* Add product */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-celeste-500 focus:outline-none"
                    >
                      <option value="">Seleccionar producto...</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {formatCurrency(product.price)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-celeste-500 focus:outline-none text-center"
                    />
                  </div>
                  <Button type="button" onClick={addItem} icon={<Plus className="w-5 h-5" />}>
                    Agregar
                  </Button>
                </div>

                {/* Items list */}
                {items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p>No hay productos agregados</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 text-left text-sm font-semibold text-gray-600">
                            Producto
                          </th>
                          <th className="py-3 text-center text-sm font-semibold text-gray-600">
                            Cantidad
                          </th>
                          <th className="py-3 text-right text-sm font-semibold text-gray-600">
                            Precio Unit.
                          </th>
                          <th className="py-3 text-right text-sm font-semibold text-gray-600">
                            Total
                          </th>
                          <th className="py-3 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {items.map((item, index) => (
                          <motion.tr
                            key={item.productId}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <td className="py-3 font-medium text-gray-900">
                              {item.productName}
                            </td>
                            <td className="py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => updateItemQuantity(index, item.quantity - 1)}
                                  className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateItemQuantity(index, item.quantity + 1)}
                                  className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="py-3 text-right text-gray-600">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="py-3 text-right font-semibold text-gray-900">
                              {formatCurrency(item.unitPrice * item.quantity)}
                            </td>
                            <td className="py-3">
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-celeste-500" />
                  Pago
                </h2>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Método de Pago</label>
                  <select
                    {...register('paymentMethod')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-celeste-500 focus:outline-none"
                  >
                    {paymentMethods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.icon} {method.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Referencia de Pago"
                  placeholder="Número de referencia"
                  {...register('paymentReference')}
                />
                <div className="sm:col-span-2">
                  <Textarea
                    label="Notas"
                    placeholder="Notas adicionales para el comprobante"
                    {...register('notes')}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Resumen</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">IVA (16%)</span>
                    <span className="font-medium">{formatCurrency(tax)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-celeste-600">{formatCurrency(total)}</span>
                  </div>
                  {(info?.showBs && totalBs > 0) && (
                    <div className="flex justify-between items-center p-3 bg-celeste-50 rounded-xl border border-celeste-100 mt-2">
                      <span className="text-xs font-bold text-celeste-700 uppercase">Equivalente en Bs.</span>
                      <span className="font-bold text-celeste-700">{formatBs(totalBs)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={isSubmitting}
                  icon={<Save className="w-5 h-5" />}
                >
                  Guardar Nota
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  icon={<Printer className="w-5 h-5" />}
                  disabled={items.length === 0}
                >
                  Guardar e Imprimir
                </Button>
              </div>

              {/* Vista Previa */}
              <Card className="p-4 bg-gray-50">
                <div className="text-center mb-4">
                  <h4 className="font-logo text-xl text-celeste-600">La Celeste</h4>
                  <p className="text-xs text-gray-500">Hamburguesas Artesanales</p>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><strong>Comprobante:</strong> {noteNumber}</p>
                  <p><strong>Fecha:</strong> {new Date().toLocaleDateString('es-VE')}</p>
                  <p><strong>Items:</strong> {items.length}</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
