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
import { Button, Input, Card, CardContent, InvoiceStatusBadge, Modal } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getInvoices } from '@/lib/services/invoices';
import { Invoice } from '@/types';
import toast from 'react-hot-toast';

export default function FacturasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoicesList, setInvoicesList] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
    try {
      setLoading(true);
      const data = await getInvoices();
      setInvoicesList(data);
    } catch (error) {
      toast.error('Error al cargar facturas');
    } finally {
      setLoading(false);
    }
  }

  const filteredInvoices = invoicesList.filter((invoice) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      invoice.id.toLowerCase().includes(term) ||
      invoice.customerName.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPaid = invoicesList
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.total, 0);

  if (loading && invoicesList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-celeste-600 animate-spin mb-4" />
        <p className="text-gray-500">Cargando facturas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="heading-2 text-gray-900">Facturas</h1>
          <p className="text-gray-600 mt-1">Gestiona las facturas del restaurante</p>
        </div>
        <Link href="/admin/facturas/nueva">
          <Button variant="primary" icon={<Plus className="w-5 h-5" />}>
            Nueva Factura
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-500 font-medium">Total Facturas</p>
          <p className="text-2xl font-bold text-gray-900">{invoicesList.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500 font-medium">Pagadas</p>
          <p className="text-2xl font-bold text-green-600">
            {invoicesList.filter((i) => i.status === 'paid').length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500 font-medium">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-600">
            {invoicesList.filter((i) => i.status === 'issued').length}
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Factura</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">RIF</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.map((invoice, index) => (
                <motion.tr
                  key={invoice.id}
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
                        <p className="font-medium text-gray-900 text-xs">{invoice.id.substring(0, 15)}...</p>
                        <p className="text-[10px] text-gray-400">Pedido: {invoice.orderId.substring(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">{invoice.customerName}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{invoice.customerRif || '-'}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(invoice.total)}</td>
                  <td className="px-6 py-4">
                    <InvoiceStatusBadge status={invoice.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(invoice.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
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

        {filteredInvoices.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No se encontraron facturas</p>
          </div>
        )}
      </Card>

      {/* Invoice Preview Modal */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title={`Detalle de Factura`}
        size="lg"
      >
        {selectedInvoice && (
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h3 className="font-bold text-2xl text-celeste-600">LA CELESTE</h3>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Hamburguesas Artesanales</p>
                <p className="text-[10px] text-gray-400 mt-2 font-mono">{selectedInvoice.id}</p>
              </div>
              <InvoiceStatusBadge status={selectedInvoice.status} />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Cliente</p>
                <p className="font-bold text-gray-900">{selectedInvoice.customerName}</p>
                <p className="text-sm text-gray-600">Rif/DNI: {selectedInvoice.customerRif || 'N/A'}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Fecha Emisión</p>
                <p className="font-bold text-gray-900">{formatDate(selectedInvoice.createdAt)}</p>
                <p className="text-sm text-gray-600">Ref Pedido: {selectedInvoice.orderId.substring(0, 10)}</p>
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
                  {selectedInvoice.items && selectedInvoice.items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-2 text-gray-700">{item.quantity}x {item.product_name}</td>
                      <td className="py-2 text-right font-medium">{formatCurrency(item.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center p-5 bg-celeste-600 text-white rounded-2xl shadow-lg shadow-celeste-200">
              <div>
                <p className="text-xs font-bold text-celeste-100 uppercase tracking-widest">Total Facturado</p>
                <p className="text-xs text-celeste-100 opacity-80 decoration-celeste-100">Incluye IGTF/IVA si aplica</p>
              </div>
              <span className="text-3xl font-black">{formatCurrency(selectedInvoice.total)}</span>
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
