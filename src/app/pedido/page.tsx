'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  ShoppingBag, 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  Truck, 
  Store,
  Minus,
  Plus,
  Trash2,
  CheckCircle,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { Header, Footer, WhatsAppButton } from '@/components/layout';
import { Button, Input, Textarea, Select, Card, CardContent } from '@/components/ui';
import { useCartStore } from '@/store/cartStore';
import { useSettingsStore } from '@/store/settingsStore';
import { formatCurrency, formatBs, getWhatsAppLink } from '@/lib/utils';
import { restaurantSettings } from '@/data/menu';
import { useTableStore } from '@/store/tableStore';
import { getCustomerByIdCard, upsertCustomer, addPointsToCustomer } from '@/lib/services/customers';
import { createOrder } from '@/lib/services/orders';
import { updateTableStatus } from '@/lib/services/tables';
import toast from 'react-hot-toast';

interface OrderFormData {
  customerName: string;
  customerPhone: string;
  customerIdCard: string;
  customerEmail?: string;
  deliveryType: 'pickup' | 'delivery' | 'table';
  deliveryAddress?: string;
  paymentMethod: string;
  notes?: string;
}

export default function PedidoPage() {
  const { info, bcvRate, initialized } = useSettingsStore();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const { items, updateQuantity, removeItem, getSubtotal, clearCart } = useCartStore();
  const { currentTable, tableId, clearTable } = useTableStore();
  const subtotal = getSubtotal();
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<OrderFormData>({
    defaultValues: {
      deliveryType: currentTable ? 'table' : 'pickup',
      paymentMethod: 'efectivo',
    },
  });

  const deliveryType = watch('deliveryType');
  const customerIdCard = watch('customerIdCard');
  
  // Lookup customer when ID Card changes
  useEffect(() => {
    if (customerIdCard?.length >= 5) {
      getCustomerByIdCard(customerIdCard).then(customer => {
        if (customer) {
          setValue('customerName', customer.name);
          if (customer.phone) setValue('customerPhone', customer.phone);
          if (customer.email) setValue('customerEmail', customer.email);
          toast.success(`¡Hola de nuevo, ${customer.name.split(' ')[0]}! Tienes ${customer.points} puntos acumulados.`);
        }
      });
    }
  }, [customerIdCard, setValue]);

  const deliveryFee = (deliveryType === 'delivery' && (info?.showDelivery ?? restaurantSettings.showDelivery)) ? (info?.deliveryFee ?? restaurantSettings.deliveryFee ?? 0) : 0;
  const tax = (info?.showTax ?? restaurantSettings.showTax) ? (subtotal * (info?.taxRate ?? restaurantSettings.taxRate ?? 0)) : 0;
  const total = subtotal + tax + deliveryFee;
  const totalBs = bcvRate ? total * bcvRate : 0;

  const onSubmit = async (data: OrderFormData) => {
    if (items.length === 0) {
      toast.error('Tu carrito está vacío');
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. CRM: Save/Update customer
      const customer = await upsertCustomer({
        idCard: data.customerIdCard,
        name: data.customerName,
        phone: data.customerPhone,
        email: data.customerEmail
      });

      // 2. Save Order to Database
      const orderId = await createOrder({
        items,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        customerId: customer.id,
        customerIdCard: data.customerIdCard,
        deliveryType: data.deliveryType,
        deliveryAddress: data.deliveryAddress,
        tableId: tableId || undefined,
        tableNumber: currentTable || undefined,
        paymentMethod: data.paymentMethod as any,
        status: 'pending',
        subtotal,
        tax,
        deliveryFee,
        total,
        notes: data.notes
      });

      // 3. Loyalty: Credit points (1 point per dollar)
      await addPointsToCustomer(data.customerIdCard, Math.floor(total));

      // 4. If table order, update table status
      if (tableId && data.deliveryType === 'table') {
        await updateTableStatus(tableId, 'busy');
      }

      // 5. WhatsApp Message
      const itemsList = items
        .map((item) => `• ${item.quantity}x ${item.product.name} - ${formatCurrency(item.product.price * item.quantity)}`)
        .join('\n');

      const paymentMethodsList = info?.paymentMethods?.length ? info.paymentMethods : restaurantSettings.paymentMethods;
      const paymentInfo = paymentMethodsList.find((m) => m.id === data.paymentMethod);

      const deliveryLabel = data.deliveryType === 'delivery' 
        ? '🚗 Delivery' 
        : data.deliveryType === 'table' 
        ? `🪑 Mesa #${currentTable}` 
        : '🏪 Retiro en local';

      const message = `
🍔 *NUEVO PEDIDO - ${info?.name || restaurantSettings.name || 'LA CELESTE'}*

👤 *Cliente:* ${data.customerName}
🆔 *ID:* ${data.customerIdCard}
📱 *Teléfono:* ${data.customerPhone}

📦 *Tipo de entrega:* ${deliveryLabel}
${data.deliveryType === 'delivery' && data.deliveryAddress ? `📍 *Dirección:* ${data.deliveryAddress}` : ''}

🛒 *PEDIDO:*
${itemsList}

💰 *RESUMEN:*
Subtotal: ${formatCurrency(subtotal)}
${tax > 0 ? `IVA (${(info?.taxRate ?? restaurantSettings.taxRate ?? 0) * 100}%): ${formatCurrency(tax)}` : ''}
${deliveryFee > 0 ? `Delivery: ${formatCurrency(deliveryFee)}` : ''}
*TOTAL: ${formatCurrency(total)}*
${((info?.showBs ?? restaurantSettings.showBs) && totalBs > 0) ? `*TOTAL BS: ${formatBs(totalBs)}*` : ''}

💳 *Método de pago:* ${paymentInfo?.name || data.paymentMethod}

${data.notes ? `📝 *Notas:* ${data.notes}` : ''}

_Orden registrada: ${orderId.slice(0, 8)}_
`.trim();

      const whatsappLink = getWhatsAppLink(info?.whatsapp || restaurantSettings.whatsapp || '584245645357', message);
      window.open(whatsappLink, '_blank');

      setIsSubmitting(false);
      setOrderComplete(true);
      clearCart();
      if (data.deliveryType !== 'table') clearTable();
    } catch (error) {
      console.error(error);
      toast.error('Hubo un problema al procesar tu pedido. Intenta de nuevo.');
      setIsSubmitting(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-celeste-600 animate-spin" />
      </div>
    );
  }

  if (orderComplete) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen bg-cream-50">
          <div className="container-app py-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto text-center"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h1 className="heading-2 text-gray-900 mb-4">¡Pedido Enviado!</h1>
              <p className="text-gray-600 mb-8">
                Tu pedido ha sido enviado por WhatsApp. 
                Te contactaremos pronto para confirmar los detalles.
              </p>
              <div className="space-y-4">
                <Link href="/menu">
                  <Button variant="primary" fullWidth>
                    Seguir Comprando
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="ghost" fullWidth>
                    Volver al Inicio
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <main className="pt-20 min-h-screen bg-cream-50">
        {/* Hero */}
        <section className="bg-gradient-to-r from-celeste-600 to-celeste-700 py-12">
          <div className="container-app">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="text-center"
            >
              <h1 className="heading-2 text-white mb-2">Finalizar Pedido</h1>
              <p className="text-white/90">Completa tus datos para enviar tu pedido</p>
            </motion.div>
          </div>
        </section>

        {/* Progress Steps */}
        <div className="bg-white border-b">
          <div className="container-app py-4">
            <div className="flex items-center justify-center gap-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                      step >= s
                        ? 'bg-celeste-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {s}
                  </div>
                  <span className={`ml-2 text-sm hidden sm:inline ${step >= s ? 'text-celeste-600' : 'text-gray-500'}`}>
                    {s === 1 ? 'Carrito' : s === 2 ? 'Datos' : 'Confirmar'}
                  </span>
                  {s < 3 && (
                    <div className={`w-12 h-0.5 mx-2 ${step > s ? 'bg-celeste-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container-app py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Step 1: Cart Review */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                          <ShoppingBag className="w-6 h-6 text-celeste-500" />
                          Tu Carrito
                        </h2>

                        {items.length === 0 ? (
                          <div className="text-center py-12">
                            <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
                            <Link href="/menu">
                              <Button variant="primary">Ver Menú</Button>
                            </Link>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {items.map((item) => (
                              <div
                                key={item.product.id}
                                className="flex gap-4 p-4 bg-gray-50 rounded-xl"
                              >
                                <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                  {item.product.image ? (
                                    <img
                                      src={item.product.image}
                                      alt={item.product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl">
                                      🍔
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                                  <p className="text-celeste-600 font-semibold">
                                    {formatCurrency(item.product.price)}
                                  </p>
                                  <div className="flex items-center gap-3 mt-2">
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                      className="w-8 h-8 flex items-center justify-center bg-white border rounded-lg hover:bg-gray-100"
                                    >
                                      <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="font-medium w-8 text-center">{item.quantity}</span>
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                      className="w-8 h-8 flex items-center justify-center bg-white border rounded-lg hover:bg-gray-100"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeItem(item.product.id)}
                                      className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="font-semibold text-gray-900">
                                    {formatCurrency(item.product.price * item.quantity)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {items.length > 0 && (
                          <div className="mt-6 flex justify-end">
                            <Button type="button" onClick={() => setStep(2)}>
                              Continuar
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Step 2: Customer Info */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                          <User className="w-6 h-6 text-celeste-500" />
                          Tus Datos
                        </h2>

                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                              label="Cédula / ID"
                              placeholder="V-12345678"
                              icon={<CreditCard className="w-5 h-5" />}
                              {...register('customerIdCard', { required: 'La cédula es requerida' })}
                              error={errors.customerIdCard?.message}
                            />

                            <Input
                              label="Nombre completo"
                              placeholder="Tu nombre"
                              icon={<User className="w-5 h-5" />}
                              {...register('customerName', { required: 'El nombre es requerido' })}
                              error={errors.customerName?.message}
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                              label="Teléfono"
                              placeholder="0412-1234567"
                              icon={<Phone className="w-5 h-5" />}
                              {...register('customerPhone', { required: 'El teléfono es requerido' })}
                              error={errors.customerPhone?.message}
                            />

                            <Input
                              label="Email (opcional)"
                              type="email"
                              placeholder="tu@email.com"
                              {...register('customerEmail')}
                            />
                          </div>

                          {/* Delivery Type */}
                          <div>
                            <label className="label">¿Cómo recibes tu pedido?</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                              {currentTable && (
                                <label
                                  className={`flex flex-col items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all ${
                                    deliveryType === 'table'
                                      ? 'border-celeste-500 bg-celeste-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    value="table"
                                    {...register('deliveryType')}
                                    className="sr-only"
                                  />
                                  <motion.div
                                    animate={deliveryType === 'table' ? { scale: [1, 1.1, 1], rotate: [0, 5, 0] } : {}}
                                  >
                                    <CheckCircle className={`w-6 h-6 mb-1 ${deliveryType === 'table' ? 'text-celeste-600' : 'text-gray-400'}`} />
                                  </motion.div>
                                  <span className="font-bold text-sm">Mesa #{currentTable}</span>
                                </label>
                              )}
                              
                              <label
                                className={`flex flex-col items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all ${
                                  deliveryType === 'pickup'
                                    ? 'border-celeste-500 bg-celeste-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  value="pickup"
                                  {...register('deliveryType')}
                                  className="sr-only"
                                />
                                <Store className={`w-6 h-6 mb-1 ${deliveryType === 'pickup' ? 'text-celeste-600' : 'text-gray-400'}`} />
                                <span className="font-bold text-sm">Retiro</span>
                              </label>

                              <label
                                className={`flex flex-col items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all ${
                                  deliveryType === 'delivery'
                                    ? 'border-celeste-500 bg-celeste-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                } ${currentTable ? 'col-span-2 sm:col-span-1' : ''}`}
                              >
                                <input
                                  type="radio"
                                  value="delivery"
                                  {...register('deliveryType')}
                                  className="sr-only"
                                />
                                <Truck className={`w-6 h-6 mb-1 ${deliveryType === 'delivery' ? 'text-celeste-600' : 'text-gray-400'}`} />
                                <span className="font-bold text-sm">Delivery</span>
                              </label>
                            </div>
                          </div>

                          {deliveryType === 'delivery' && (
                            <Textarea
                              label="Dirección de entrega"
                              placeholder="Calle, edificio, piso, referencia..."
                              {...register('deliveryAddress', {
                                required: deliveryType === 'delivery' ? 'La dirección es requerida' : false,
                              })}
                              error={errors.deliveryAddress?.message}
                            />
                          )}
                        </div>

                        <div className="mt-6 flex gap-4">
                          <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Atrás
                          </Button>
                          <Button type="button" onClick={() => setStep(3)} className="flex-1">
                            Continuar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Step 3: Payment & Confirm */}
                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                          <CreditCard className="w-6 h-6 text-celeste-500" />
                          Método de Pago
                        </h2>

                        <div className="space-y-3">
                          {((info?.paymentMethods?.length ? info.paymentMethods : restaurantSettings.paymentMethods) || []).filter(m => m.active).map((method) => (
                            <label
                              key={method.id}
                              className="flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer hover:border-celeste-300 transition-all"
                            >
                              <input
                                type="radio"
                                value={method.id}
                                {...register('paymentMethod')}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{method.name}</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{method.details}</p>
                              </div>
                            </label>
                          ))}
                        </div>

                        <div className="mt-6">
                          <Textarea
                            label="Notas adicionales (opcional)"
                            placeholder="Instrucciones especiales, alergias, etc."
                            {...register('notes')}
                          />
                        </div>

                        <div className="mt-6 flex gap-4">
                          <Button type="button" variant="ghost" onClick={() => setStep(2)}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Atrás
                          </Button>
                          <Button type="submit" loading={isSubmitting} className="flex-1">
                            Enviar Pedido por WhatsApp
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </form>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Pedido</h3>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal ({items.length} items)</span>
                        <span className="font-medium">{formatCurrency(subtotal)}</span>
                      </div>
                      {tax > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">IVA ({(info?.taxRate || 0) * 100}%)</span>
                          <span className="font-medium">{formatCurrency(tax)}</span>
                        </div>
                      )}
                      {deliveryFee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Delivery</span>
                          <span className="font-medium">{formatCurrency(deliveryFee)}</span>
                        </div>
                      )}
                      <hr />
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold">Total</span>
                        <span className="font-bold text-celeste-600">{formatCurrency(total)}</span>
                      </div>
                      {(info?.showBs !== false && totalBs > 0) && (
                        <div className="flex flex-col p-3 bg-celeste-50 rounded-xl border border-celeste-100 mt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-celeste-700 uppercase">Total en Bs.</span>
                            <span className="font-bold text-celeste-700">{formatBs(totalBs)}</span>
                          </div>
                          <div className="mt-1 text-[10px] text-celeste-600/70 text-right">
                            Tasa BCV: 1$ = {formatBs(bcvRate || 0, false)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Items preview */}
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Productos</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {items.map((item) => (
                          <div key={item.product.id} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {item.quantity}x {item.product.name}
                            </span>
                            <span className="font-medium">
                              {formatCurrency(item.product.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
