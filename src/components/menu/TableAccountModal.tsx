'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, X, Clock, CheckCircle2, ChevronRight, 
  CreditCard, Banknote, Smartphone, Receipt 
} from 'lucide-react';
import { Button } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { Order } from '@/types';
import { requestTableBilling } from '@/lib/services/orders';
import { toast } from 'react-hot-toast';

interface TableAccountModalProps {
  orders: Order[];
  total: number;
  onClose: () => void;
  tableId: string;
}

export default function TableAccountModal({ orders, total, onClose, tableId }: TableAccountModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'summary' | 'payment'>('summary');
  const allItems = orders.flatMap(o => o.items);

  const handleRequestBill = async (method: string) => {
    try {
      setLoading(true);
      await requestTableBilling(tableId, method);
      toast.success('¡Solicitud enviada! Ya verificamos tu pago.');
      onClose();
    } catch (error) {
      toast.error('Error al solicitar cuenta');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status?: string) => {
    switch(status) {
      case 'served': return { label: 'Servido', color: 'bg-green-100 text-green-700', icon: CheckCircle2 };
      case 'confirmed': return { label: 'En Cocina', color: 'bg-orange-100 text-orange-700', icon: Clock };
      default: return { label: 'Recibido', color: 'bg-blue-50 text-blue-600', icon: Clock };
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div 
        className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl relative"
        layoutId="account-modal"
      >
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Mi Cuenta Abierta</h2>
              <p className="text-sm text-gray-400 font-medium">Desglose de consumos</p>
            </div>
            <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="max-h-[50vh] overflow-y-auto mb-8 pr-2 space-y-4 custom-scrollbar">
            {step === 'summary' ? (
              <div className="space-y-4">
                {orders.map((order, oIndex) => (
                  <div key={order.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PEDIDO #{order.id.slice(-4)}</span>
                      {(() => {
                        const status = getStatusDisplay(order.preparationStatus);
                        return (
                          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${status.color}`}>
                            <status.icon className="w-3 h-3" />
                            {status.label}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="space-y-3">
                      {order.items.map((item, iIndex) => (
                        <div key={`${oIndex}-${iIndex}`} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-celeste-500 bg-celeste-50 w-6 h-6 flex items-center justify-center rounded-lg">{item.quantity}</span>
                            <span className="text-sm font-bold text-gray-700">{item.product.name}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-400">{formatCurrency(item.product.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {orders.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Wallet className="w-8 h-8 text-gray-200" />
                    </div>
                    <p className="text-gray-400 font-medium">Aún no has pedido nada</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h3 className="text-center font-bold text-gray-900 mb-6">Selecciona tu método de pago</h3>
                {[
                  { id: 'pago_movil', name: 'Pago Móvil', icon: Smartphone, color: 'hover:border-celeste-500 text-purple-600' },
                  { id: 'zelle', name: 'Zelle', icon: Banknote, color: 'hover:border-purple-500 text-indigo-600' },
                  { id: 'cash', name: 'Efectivo', icon: Banknote, color: 'hover:border-green-500 text-green-600' },
                  { id: 'pos', name: 'Punto de Venta / Tarjeta', icon: CreditCard, color: 'hover:border-blue-500 text-blue-600' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleRequestBill(m.id)}
                    disabled={loading}
                    className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 border-gray-100 transition-all ${m.color.split(' ')[0]} group bg-white hover:bg-gray-50`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-gray-50 group-hover:bg-white ${m.color.split(' ')[1]}`}>
                        <m.icon className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-gray-700">{m.name}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
                <button 
                  onClick={() => setStep('summary')} 
                  className="w-full text-center text-sm font-bold text-gray-400 hover:text-celeste-500 py-4 transition-colors"
                >
                  Volver al resumen
                </button>
              </div>
            )}
          </div>

          {step === 'summary' && (
            <>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Total Acumulado</span>
                  <span className="text-3xl font-black text-celeste-600 leading-none">{formatCurrency(total)}</span>
                </div>
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden mt-4">
                  <div className="h-full bg-celeste-500 w-full opacity-20" />
                </div>
                <p className="mt-4 text-[10px] text-gray-400 leading-relaxed text-center">
                  Este es el total de todos tus pedidos en esta mesa.<br/> 
                  Al pedir la cuenta podrás seleccionar tu forma de pago.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  variant="primary" 
                  fullWidth 
                  className="h-14 rounded-2xl shadow-xl shadow-celeste-100 text-base font-bold"
                  onClick={() => setStep('payment')}
                  disabled={allItems.length === 0}
                >
                  <Wallet className="w-5 h-5 mr-3" />
                  Pedir la Cuenta Final
                </Button>
                <button 
                  onClick={onClose} 
                  className="py-3 text-sm font-bold text-gray-400 hover:text-celeste-500 transition-colors"
                >
                  Seguir Pidiendo
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
