'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Download,
  Eye,
  Printer,
  MoreVertical,
  FileText,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { Button, Input, Card, CardContent, DeliveryNoteStatusBadge, Modal } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getDeliveryNotes } from '@/lib/services/deliveryNotes';
import { DeliveryNote } from '@/types';
import toast from 'react-hot-toast';

export default function NotasEntregaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedNote, setSelectedNote] = useState<DeliveryNote | null>(null);
  const [notesList, setNotesList] = useState<DeliveryNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    try {
      setLoading(true);
      const data = await getDeliveryNotes();
      setNotesList(data);
    } catch (error) {
      toast.error('Error al cargar notas de entrega');
    } finally {
      setLoading(false);
    }
  }

  const filteredNotes = notesList.filter((note) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      note.noteNumber.toLowerCase().includes(term) ||
      note.customerName.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || note.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPaid = notesList
    .filter((n) => n.status === 'paid')
    .reduce((sum, n) => sum + n.total, 0);

  if (loading && notesList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-10 h-10 text-celeste-600 animate-spin mb-4" />
        <p className="text-gray-500">Cargando notas de entrega...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="heading-2 text-gray-900">Notas de Entrega</h1>
          <p className="text-gray-600 mt-1">Gestión administrativa interna</p>
        </div>
        <Link href="/admin/notas-entrega/nueva">
          <Button variant="primary" icon={<Plus className="w-5 h-5" />}>
            Nueva Nota
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-500 font-medium">Total Registros</p>
          <p className="text-2xl font-bold text-gray-900">{notesList.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500 font-medium">Pagadas</p>
          <p className="text-2xl font-bold text-green-600">
            {notesList.filter((n) => n.status === 'paid').length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500 font-medium">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-600">
            {notesList.filter((n) => n.status === 'issued').length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500 font-medium">Total Recaudado</p>
          <p className="text-2xl font-bold text-celeste-600">{formatCurrency(totalPaid)}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por número o cliente..."
                icon={<Search className="w-5 h-5" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-celeste-500 focus:outline-none bg-white font-medium"
              >
                <option value="all">Todos los estados</option>
                <option value="draft">Borrador</option>
                <option value="issued">Emitida</option>
                <option value="paid">Pagada</option>
                <option value="cancelled">Anulada</option>
              </select>
              <Button variant="secondary" icon={<Download className="w-5 h-5" />}>
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Comprobante</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">RIF</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredNotes.map((note, index) => (
                <motion.tr
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-celeste-100 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-celeste-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-xs">{note.noteNumber}</p>
                        <p className="text-[10px] text-gray-400">Pedido: {note.orderId.substring(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">{note.customerName}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{note.customerRif || '-'}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(note.total)}</td>
                  <td className="px-6 py-4">
                    <DeliveryNoteStatusBadge status={note.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(note.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedNote(note)}
                        className="p-1.5 text-gray-400 hover:text-celeste-600 hover:bg-celeste-50 rounded-lg transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-celeste-600 hover:bg-celeste-50 rounded-lg transition-colors" title="Imprimir">
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredNotes.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No se encontraron registros</p>
          </div>
        )}
      </Card>

      <Modal
        isOpen={!!selectedNote}
        onClose={() => setSelectedNote(null)}
        title={`Detalle de Comprobante Interno`}
        size="lg"
      >
        {selectedNote && (
          <div className="space-y-6">
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700 font-bold uppercase tracking-wide">
                ESTO NO ES UNA FACTURA FISCAL
              </p>
              <p className="text-xs text-amber-600">Documento para control interno y logística únicamente.</p>
            </div>
          </div>
        </div>
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h3 className="font-bold text-2xl text-celeste-600">LA CELESTE</h3>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Hamburguesas Artesanales</p>
                <p className="text-[10px] text-gray-400 mt-2 font-mono">{selectedNote.noteNumber}</p>
              </div>
              <DeliveryNoteStatusBadge status={selectedNote.status} />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Cliente</p>
                <p className="font-bold text-gray-900">{selectedNote.customerName}</p>
                <p className="text-sm text-gray-600">Rif/DNI: {selectedNote.customerRif || 'N/A'}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Fecha Emisión</p>
                <p className="font-bold text-gray-900">{formatDate(selectedNote.createdAt)}</p>
                <p className="text-sm text-gray-600">Ref Pedido: {selectedNote.orderId.substring(0, 10)}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b pb-2">
                    <th className="pb-2 font-semibold">Producto</th>
                    <th className="pb-2 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedNote.items && selectedNote.items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-2 text-gray-900">{item.productName}</td>
                      <td className="py-2 text-center text-gray-600">{item.quantity}</td>
                      <td className="py-2 text-right text-gray-900 font-medium">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center p-5 bg-celeste-600 text-white rounded-2xl shadow-lg shadow-celeste-200">
              <div>
                <p className="text-xs font-bold text-celeste-100 uppercase tracking-widest">Monto Total</p>
                <p className="text-xs text-celeste-100 opacity-80 decoration-celeste-100">Incluye IGTF/IVA si aplica</p>
              </div>
              <span className="text-3xl font-black">{formatCurrency(selectedNote.total)}</span>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="primary" icon={<Printer className="w-5 h-5" />} fullWidth>Imprimir</Button>
              <Button variant="secondary" icon={<Download className="w-5 h-5" />} fullWidth>PDF</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
