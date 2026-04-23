'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Receipt, X, Check, HelpCircle, Wallet } from 'lucide-react';
import { useTableStore } from '@/store/tableStore';
import { updateTableStatus } from '@/lib/services/tables';
import { toast } from 'react-hot-toast';
import TableAccountModal from './TableAccountModal';

export default function TableActions() {
  const { currentTable, tableId, isOrderingAtTable } = useTableStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOrderingAtTable || !tableId) return null;

  const handleAction = async (status: 'calling' | 'billing') => {
    try {
      setLoading(true);
      await updateTableStatus(tableId, status);
      toast.success(
        status === 'calling' 
          ? 'Mesonero notificado. Ya vamos hacia allá.' 
          : 'Solicitud de cuenta enviada.'
      );
      setIsOpen(false);
    } catch (error) {
      toast.error('Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 flex flex-col gap-3 items-end"
          >
            <button
              onClick={() => setIsAccountOpen(true)}
              className="flex items-center gap-2 bg-celeste-600 text-white px-4 py-3 rounded-2xl shadow-xl hover:bg-celeste-700 transition-all border-2 border-white"
            >
              <Wallet className="w-5 h-5" />
              <span className="font-bold text-sm">Ver Mi Cuenta</span>
            </button>

            <button
              onClick={() => handleAction('billing')}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-2xl shadow-xl hover:bg-blue-700 transition-all"
            >
              <Receipt className="w-5 h-5" />
              <span className="font-bold text-sm">Pedir Cuenta</span>
            </button>
            
            <button
              onClick={() => handleAction('calling')}
              disabled={loading}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-3 rounded-2xl shadow-xl hover:bg-red-600 transition-all"
            >
              <Bell className="w-5 h-5" />
              <span className="font-bold text-sm">Llamar Mesonero</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAccountOpen && (
          <TableAccountModal 
            onClose={() => setIsAccountOpen(false)}
            tableId={tableId}
          />
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform active:scale-95 ${
          isOpen ? 'bg-gray-800 text-white rotate-90' : 'bg-celeste-600 text-white'
        }`}
      >
        {isOpen ? (
          <X className="w-8 h-8" />
        ) : (
          <div className="relative">
            <HelpCircle className="w-8 h-8" />
            <span className="absolute -top-4 -right-1 bg-white text-celeste-600 px-2 py-0.5 rounded-full text-[10px] font-bold border-2 border-celeste-600">
              M{currentTable}
            </span>
          </div>
        )}
      </button>
    </div>
  );
}
