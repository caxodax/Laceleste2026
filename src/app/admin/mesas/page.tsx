'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  QrCode, 
  Bell, 
  Receipt, 
  RefreshCcw, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  Table as TableIcon,
  Printer,
  X
} from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { getTables, createTable, toggleTableActive, deleteTable, updateTableStatus } from '@/lib/services/tables';
import { RestaurantTable } from '@/types';
import { toast } from 'react-hot-toast';

export default function AdminMesasPage() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const data = await getTables();
      setTables(data);
    } catch (error) {
      toast.error('Error al cargar las mesas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber) return;

    try {
      setIsAdding(true);
      await createTable(parseInt(newTableNumber));
      setNewTableNumber('');
      toast.success('Mesa agregada correctamente');
      fetchTables();
    } catch (error) {
      toast.error('Error al agregar la mesa. ¿El número ya existe?');
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      await toggleTableActive(id, !active);
      toast.success('Estado actualizado');
      setTables(tables.map(t => t.id === id ? { ...t, active: !active } : t));
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta mesa?')) return;
    try {
      await deleteTable(id);
      toast.success('Mesa eliminada');
      setTables(tables.filter(t => t.id !== id));
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const handleResetStatus = async (id: string) => {
    try {
      await updateTableStatus(id, 'free');
      toast.success('Estado de la mesa reiniciado');
      setTables(tables.map(t => t.id === id ? { ...t, status: 'free' } : t));
    } catch (error) {
      toast.error('Error al reiniciar estado');
    }
  };

  const getStatusInfo = (status: RestaurantTable['status']) => {
    switch (status) {
      case 'busy': return { label: 'Ocupada', color: 'bg-orange-100 text-orange-700', icon: CheckCircle2 };
      case 'calling': return { label: 'Llamando...', color: 'bg-red-100 text-red-700 animate-pulse', icon: Bell };
      case 'billing': return { label: 'Pidiendo Cuenta', color: 'bg-blue-100 text-blue-700 animate-pulse', icon: Receipt };
      default: return { label: 'Libre', color: 'bg-green-100 text-green-700', icon: CheckCircle2 };
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TableIcon className="w-8 h-8 text-celeste-600" />
            Gestión de Mesas
          </h1>
          <p className="text-gray-500">Controla el estado y el Menú QR de tu local</p>
        </div>
        
        <form onSubmit={handleAddTable} className="flex gap-2">
          <input 
            type="number"
            placeholder="Nº Mesa"
            value={newTableNumber}
            onChange={(e) => setNewTableNumber(e.target.value)}
            className="w-24 px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-celeste-500 outline-none transition-all"
            min="1"
          />
          <Button type="submit" disabled={isAdding}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Mesa
          </Button>
        </form>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-2xl animate-pulse shadow-sm" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {tables.map((table) => {
              const status = getStatusInfo(table.status);
              const qrLink = typeof window !== 'undefined' 
                ? `${window.location.origin}/menu?mesa=${table.number}`
                : '';

              return (
                <motion.div
                  key={table.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className={`transition-all duration-300 ${!table.active ? 'opacity-60 grayscale' : 'hover:shadow-md'}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-celeste-50 flex items-center justify-center text-celeste-600 font-bold border border-celeste-100">
                            {table.number}
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => setSelectedTable(table)}
                            className="p-1.5 text-gray-400 hover:text-celeste-600 hover:bg-celeste-50 rounded-lg transition-colors"
                            title="Ver QR"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleResetStatus(table.id)}
                            className="p-1.5 text-gray-400 hover:text-celeste-600 hover:bg-celeste-50 rounded-lg transition-colors"
                            title="Reiniciar"
                          >
                            <RefreshCcw className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(table.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between group border border-gray-100">
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono truncate mr-2">
                             <ExternalLink className="w-3 h-3" />
                             {qrLink.replace(/^https?:\/\//, '')}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-[10px] px-2 bg-white border border-gray-200"
                            onClick={() => {
                              navigator.clipboard.writeText(qrLink);
                              toast.success('Enlace copiado');
                            }}
                          >
                            Copiar
                          </Button>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-2">
                          <span className="text-xs font-medium text-gray-600">
                            {table.active ? 'Mesa Habilitada' : 'Mesa Inactiva'}
                          </span>
                          <button
                            onClick={() => handleToggleActive(table.id, table.active)}
                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                              table.active ? 'bg-celeste-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                table.active ? 'translate-x-[22px]' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* QR MODAL */}
      <AnimatePresence>
        {selectedTable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTable(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="flex justify-between items-center mb-6">
                  <div className="text-left">
                    <h3 className="text-xl font-black text-gray-900 uppercase">Mesa {selectedTable.number}</h3>
                    <p className="text-xs text-gray-400">Menú Digital Interactivo</p>
                  </div>
                  <button onClick={() => setSelectedTable(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="bg-celeste-50 p-8 rounded-[1.5rem] mb-6 flex flex-col items-center justify-center border-2 border-dashed border-celeste-200">
                  <div className="bg-white p-6 rounded-2xl shadow-xl">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${window.location.origin}/menu?mesa=${selectedTable.number}`)}`}
                      alt={`QR Mesa ${selectedTable.number}`}
                      className="w-48 h-48 sm:w-56 sm:h-56"
                    />
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-[10px] font-bold text-celeste-600 uppercase tracking-widest mb-1">Escanea para pedir</p>
                    <p className="text-[9px] text-celeste-400 font-mono break-all line-clamp-1">
                      {window.location.origin}/menu?mesa={selectedTable.number}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="ghost" 
                    fullWidth
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/menu?mesa=${selectedTable.number}`);
                      toast.success('Link copiado');
                    }}
                  >
                    Copiar Link
                  </Button>
                  <Button 
                    variant="primary"
                    fullWidth
                    onClick={() => window.print()}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir
                  </Button>
                </div>
                
                <p className="mt-6 text-[10px] text-gray-400 italic">
                  Tip: Coloca este QR en un porta-menú o pegado directamente en la mesa.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #qr-to-print, .fixed, .fixed * {
            visibility: visible !important;
          }
          .fixed {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            display: flex !important;
            justify-content: center !important;
            padding-top: 50px !important;
          }
          .fixed button, .fixed .bg-black, .fixed .p-2 {
            display: none !important;
          }
          .shadow-2xl, .shadow-xl {
            box-shadow: none !important;
          }
          .bg-celeste-50 {
            background-color: white !important;
            border: 2px solid #eee !important;
          }
        }
      `}</style>
    </div>
  );
}
