'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Header, Footer, WhatsAppButton } from '@/components/layout';
import { Button, Card, CardContent } from '@/components/ui';
import { useCartStore } from '@/store/cartStore';
import { useSettingsStore } from '@/store/settingsStore';
import { formatCurrency, formatBs } from '@/lib/utils';
import { restaurantSettings } from '@/data/menu';

export default function CarritoPage() {
  const { info, bcvRate } = useSettingsStore();
  const { items, updateQuantity, removeItem, getSubtotal, clearCart } = useCartStore();
  const subtotal = getSubtotal();
  const tax = info?.showTax ? subtotal * (info?.taxRate || 0) : 0;
  const total = subtotal + tax;
  const totalBs = bcvRate ? total * bcvRate : 0;

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
              className="text-center"
            >
              <h1 className="heading-2 text-white mb-2">Tu Carrito</h1>
              <p className="text-white/90">
                {items.length === 0
                  ? 'Tu carrito está vacío'
                  : `${items.length} producto${items.length > 1 ? 's' : ''} en tu carrito`}
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container-app py-8">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Tu carrito está vacío
              </h2>
              <p className="text-gray-600 mb-8">
                ¡Agrega algunas hamburguesas deliciosas para comenzar!
              </p>
              <Link href="/menu">
                <Button variant="primary" size="lg">
                  Ver Menú
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Productos ({items.length})
                      </h2>
                      <button
                        onClick={clearCart}
                        className="text-sm text-red-500 hover:text-red-600 transition-colors"
                      >
                        Vaciar carrito
                      </button>
                    </div>

                    <div className="space-y-4">
                      {items.map((item, index) => (
                        <motion.div
                          key={item.product.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex gap-4 p-4 bg-gray-50 rounded-xl"
                        >
                          {/* Image */}
                          <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {item.product.image ? (
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-4xl">
                                🍔
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900">
                              {item.product.name}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {item.product.description}
                            </p>
                            <p className="text-celeste-600 font-semibold mt-1">
                              {formatCurrency(item.product.price)}
                            </p>

                            {/* Quantity controls */}
                            <div className="flex items-center gap-3 mt-3">
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
                            </div>
                          </div>

                          {/* Total & Remove */}
                          <div className="flex flex-col items-end justify-between">
                            <span className="font-bold text-gray-900">
                              {formatCurrency(item.product.price * item.quantity)}
                            </span>
                            <button
                              onClick={() => removeItem(item.product.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Continue Shopping */}
                    <div className="mt-6 pt-6 border-t">
                      <Link href="/menu">
                        <Button variant="ghost">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Seguir comprando
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Resumen del Pedido
                      </h3>

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-medium">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">IVA (16%)</span>
                          <span className="font-medium">{formatCurrency(tax)}</span>
                        </div>
                        <hr />
                        <div className="flex justify-between text-lg">
                          <span className="font-semibold">Total</span>
                          <span className="font-bold text-celeste-600">
                            {formatCurrency(total)}
                          </span>
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

                      <div className="mt-6 space-y-3">
                        <Link href="/pedido">
                          <Button
                            variant="primary"
                            fullWidth
                            size="lg"
                            icon={<ArrowRight className="w-5 h-5" />}
                            iconPosition="right"
                          >
                            Continuar Pedido
                          </Button>
                        </Link>
                        <p className="text-xs text-center text-gray-500">
                          El costo de delivery se calculará en el siguiente paso
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Methods */}
                  <Card className="mt-4">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600 mb-3">Métodos de pago aceptados:</p>
                      <div className="flex flex-wrap gap-2">
                        {((info?.paymentMethods?.length ? info.paymentMethods : restaurantSettings.paymentMethods) || []).filter(m => m.active).map((method) => (
                          <span
                            key={method.id}
                            className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                          >
                            {method.name}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
