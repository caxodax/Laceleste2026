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
  Table as TableIcon
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
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Mesas</h1>
          <p className="text-gray-500">Controla el estado y el Menú QR de tu local</p>
        </div>
        
        <form onSubmit={handleAddTable} className="flex gap-2">
          <input 
            type="number"
            placeholder="Nº Mesa"
            value={newTableNumber}
            onChange={(e) => setNewTableNumber(e.target.value)}
            className="w-24 px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-celeste-500 outline-none"
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
              const qrLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/menu?mesa=${table.number}`;

              return (
                <motion.div
                  key={table.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className={!table.active ? 'opacity-60 grayscale' : ''}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-celeste-50 flex items-center justify-center text-celeste-600 font-bold">
                            {table.number}
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(qrLink);
                                toast.success(`Link de Mesa ${table.number} copiado`);
                              }}
                              className="p-2 text-gray-400 hover:text-celeste-600 hover:bg-celeste-50 rounded-lg transition-colors"
                              title="Copiar Link para QR"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleResetStatus(table.id)}
                              className="p-2 text-gray-400 hover:text-celeste-600 hover:bg-celeste-50 rounded-lg transition-colors"
                              title="Reiniciar a Libre"
                            >
                              <RefreshCcw className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(table.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between group">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <ExternalLink className="w-4 h-4" />
                              <span className="truncate max-w-[120px] font-mono text-[10px]">
                                {qrLink.replace(/^https?:\/\//, '')}
                              </span>
                            </div>
                            <a 
                              href={qrLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-1 px-3 bg-white border border-gray-200 rounded-lg text-[10px] font-bold hover:border-celeste-500 hover:text-celeste-600 transition-all flex items-center gap-1"
                            >
                              Abrir Menú v3.0
                            </a>
                          </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-sm font-medium text-gray-600">
                            {table.active ? 'Habilitada' : 'Inactiva'}
                          </span>
                          <button
                            onClick={() => handleToggleActive(table.id, table.active)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              table.active ? 'bg-celeste-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                table.active ? 'translate-x-6' : 'translate-x-1'
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
    </div>
  );
}
