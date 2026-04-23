'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useTableStore } from '@/store/tableStore';
import { createOrder } from '@/lib/services/orders';
import { updateTableStatus } from '@/lib/services/tables';
import { Button } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, getSubtotal, clearCart } = useCartStore();
  const { isOrderingAtTable, currentTable, tableId, customerName, customerIdCard, setCustomerInfo } = useTableStore();
  const [loading, setLoading] = useState(false);
  const [showInfoForm, setShowInfoForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formId, setFormId] = useState('');

  const subtotal = getSubtotal();

  const handleKitchenOrder = async () => {
    if (!customerName || !customerIdCard) {
      setShowInfoForm(true);
      return;
    }

    try {
      setLoading(true);
      
      const orderData = {
        customerName,
        customerIdCard,
        customerPhone: 'N/A',
        customerAddress: `Mesa #${currentTable}`,
        status: 'pending' as const,
        items: items.map(item => ({
          productId: item.product.id,
          product: item.product,
          quantity: item.quantity
        })),
        subtotal: subtotal,
        tax: 0,
        deliveryFee: 0,
        total: subtotal,
        deliveryType: 'table' as const,
        paymentMethod: 'cash' as const, // Will be finalized later
        tableId: tableId!
      };

      await createOrder(orderData);
      // Waiter notified via Supabase/WhatsApp also
      await updateTableStatus(tableId!, 'busy');
      
      clearCart();
      toast.success('¡Comanda enviada a cocina! 👨‍🍳');
      onClose();
    } catch (error) {
      toast.error('Error al enviar comanda. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formId) return;
    setCustomerInfo(formName, formId);
    setShowInfoForm(false);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        {/* Drawer */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b">
                      <Dialog.Title className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <ShoppingBag className="w-6 h-6 text-celeste-500" />
                        {isOrderingAtTable ? `Comanda Mesa #${currentTable}` : 'Tu Carrito'}
                      </Dialog.Title>
                      <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                      {showInfoForm ? (
                        <div className="py-6 space-y-6">
                          <div className="text-center">
                            <h3 className="text-lg font-bold text-gray-900">¿Quién disfruta hoy?</h3>
                            <p className="text-sm text-gray-500">Solo necesitamos esto una vez para tus puntos de regalo 🎁</p>
                          </div>
                          <form onSubmit={handleSaveInfo} className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre y Apellido</label>
                              <input 
                                type="text"
                                required
                                value={formName}
                                onChange={e => setFormName(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-celeste-500 outline-none"
                                placeholder="Ej. Juan Pérez"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Cédula de Identidad</label>
                              <input 
                                type="text"
                                required
                                value={formId}
                                onChange={e => setFormId(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-celeste-500 outline-none"
                                placeholder="V-12345678"
                              />
                            </div>
                            <Button type="submit" fullWidth variant="primary">
                              Guardar y Continuar
                            </Button>
                            <button 
                              type="button" 
                              onClick={() => setShowInfoForm(false)}
                              className="w-full py-2 text-sm text-gray-400"
                            >
                              Volver al carrito
                            </button>
                          </form>
                        </div>
                      ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <ShoppingBag className="w-12 h-12 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Tu carrito está vacío
                          </h3>
                          <p className="text-gray-500 mb-6">
                            ¡Agrega algunas hamburguesas deliciosas!
                          </p>
                          <Button onClick={onClose} variant="primary">
                            Ver Menú
                          </Button>
                        </div>
                      ) : (
                        <AnimatePresence>
                          <ul className="space-y-4">
                            {items.map((item) => (
                              <motion.li
                                key={item.product.id}
                                layout
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex gap-4 p-4 bg-gray-50 rounded-xl"
                              >
                                {/* Image */}
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

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900 truncate">
                                    {item.product.name}
                                  </h4>
                                  <p className="text-celeste-600 font-semibold">
                                    {formatCurrency(item.product.price)}
                                  </p>

                                  {/* Quantity controls */}
                                  <div className="flex items-center gap-3 mt-2">
                                    <button
                                      onClick={() =>
                                        updateQuantity(item.product.id, item.quantity - 1)
                                      }
                                      className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                      <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="font-medium w-8 text-center">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() =>
                                        updateQuantity(item.product.id, item.quantity + 1)
                                      }
                                      className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => removeItem(item.product.id)}
                                      className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </motion.li>
                            ))}
                          </ul>
                        </AnimatePresence>
                      )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && !showInfoForm && (
                      <div className="border-t px-6 py-4 space-y-4">
                        {/* Subtotal */}
                        <div className="flex items-center justify-between text-lg">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-bold text-gray-900">
                            {formatCurrency(subtotal)}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                          {isOrderingAtTable ? (
                            <Button 
                              variant="primary" 
                              fullWidth
                              onClick={handleKitchenOrder}
                              disabled={loading}
                            >
                              {loading ? 'Enviando...' : 'Pedir a Cocina 👨‍🍳'}
                            </Button>
                          ) : (
                            <Link href="/pedido" onClick={onClose}>
                              <Button variant="primary" fullWidth>
                                Continuar Pedido
                              </Button>
                            </Link>
                          )}
                          <button
                            onClick={clearCart}
                            className="w-full py-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
                          >
                            Vaciar carrito
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
