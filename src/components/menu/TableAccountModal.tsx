'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Receipt, ShoppingBag, Clock, Wallet } from 'lucide-react';
import { getActiveTableOrders } from '@/lib/services/orders';
import { Order } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui';

interface TableAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: string;
  tableNumber: number;
  onRequestBill: () => void;
}

export default function TableAccountModal({ 
  isOpen, 
  onClose, 
  tableId, 
  tableNumber,
  onRequestBill
}: TableAccountModalProps) {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && tableId) {
      setLoading(true);
      getActiveTableOrders(tableId).then(orders => {
        setActiveOrders(orders);
        setLoading(false);
      });
    }
  }, [isOpen, tableId]);

  const total = activeOrders.reduce((sum, order) => sum + order.total, 0);
  const allItems = activeOrders.flatMap(order => order.items);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="relative w-full max-w-lg bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-celeste-600 flex items-center justify-center text-white shadow-lg">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 leading-none">MI CUENTA</h3>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">Mesa #{tableNumber}</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <div className="max-h-[50vh] overflow-y-auto mb-6 pr-2 space-y-4 scrollbar-hide">
            {loading ? (
              <div className="flex flex-col items-center py-12 gap-3">
                <div className="w-8 h-8 border-4 border-celeste-200 border-t-celeste-600 rounded-full animate-spin" />
                <p className="text-gray-400 text-sm font-medium">Consultando cocina...</p>
              </div>
            ) : allItems.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-3 text-center">
                <ShoppingBag className="w-12 h-12 text-gray-200" />
                <div>
                  <p className="text-gray-500 font-bold">Aún no has pedido nada</p>
                  <p className="text-gray-400 text-xs">Vuelve al menú y disfruta</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {activeOrders.map((order, idx) => (
                  <div key={order.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <Clock className="w-3 h-3" />
                        Pedido #{idx + 1} • {order.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase">
                        Confirmado
                      </span>
                    </div>
                    <div className="space-y-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-[10px] font-bold text-celeste-600">
                              {item.quantity}
                            </span>
                            <span className="text-gray-700 font-medium">{item.product.name}</span>
                          </div>
                          <span className="text-gray-900 font-bold">
                            {formatCurrency(item.product.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-6">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Total Acumulado</span>
              <span className="text-3xl font-black text-celeste-600 leading-none">{formatCurrency(total)}</span>
            </div>
            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden mt-4">
              <div className="h-full bg-celeste-500 w-full opacity-20" />
            </div>
            <p className="mt-4 text-[10px] text-gray-400 leading-relaxed text-center">
              Este es el total de todos tus pedidos confirmados en esta mesa.<br/> 
              Los pedidos nuevos se reflejarán en 1 min.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              variant="primary" 
              fullWidth 
              className="h-14 rounded-2xl shadow-xl shadow-celeste-100 text-base font-bold"
              onClick={onRequestBill}
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
        </div>
      </motion.div>
    </div>
  );
}
