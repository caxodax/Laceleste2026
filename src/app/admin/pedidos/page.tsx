'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Truck,
  ChefHat,
  Package,
  Loader2,
} from 'lucide-react';
import { Button, Input, Card, CardContent, OrderStatusBadge, Modal } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getOrders, updateOrderStatus as updateOrderInDB } from '@/lib/services/orders';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types';
import toast from 'react-hot-toast';

const statusActions: Record<string, { next: string; label: string; icon: any } | null> = {
  pending: { next: 'confirmed', label: 'Confirmar', icon: CheckCircle },
  confirmed: { next: 'preparing', label: 'Preparar', icon: ChefHat },
  preparing: { next: 'ready', label: 'Listo', icon: Package },
  ready: { next: 'delivered', label: 'Entregar', icon: Truck },
  delivered: null,
  cancelled: null,
};

export default function PedidosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();

    // Listen for real-time changes
    const channel = supabase
      .channel('orders-admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchOrders() // Refresh whenever any order changes
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [statusFilter]);

  async function fetchOrders() {
    try {
      setLoading(true);
      const data = await getOrders(statusFilter);
      setOrdersList(data);
    } catch (error) {
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = ordersList.filter((order) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      order.id.toLowerCase().includes(term) ||
      order.customerName.toLowerCase().includes(term) ||
      (order.customerPhone && order.customerPhone.includes(term));
    return matchesSearch;
  });

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderInDB(orderId, newStatus as any);
      toast.success('Pedido actualizado');
      setSelectedOrder(null);
      // fetchOrders will be triggered by real-time subscription
    } catch (error) {
      toast.error('Error al actualizar pedido');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await updateOrderInDB(orderId, 'cancelled');
      toast.success('Pedido cancelado');
      setSelectedOrder(null);
    } catch (error) {
      toast.error('Error al cancelar pedido');
    }
  };

  const getStatusCount = (status: string) =>
    ordersList.filter((o) => o.status === status).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="heading-2 text-gray-900">Pedidos</h1>
        <p className="text-gray-600 mt-1">Gestión de pedidos en tiempo real</p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { value: 'all', label: 'Todos' },
          { value: 'pending', label: 'Pendientes' },
          { value: 'confirmed', label: 'Confirmados' },
          { value: 'preparing', label: 'Preparando' },
          { value: 'ready', label: 'Listos' },
          { value: 'delivered', label: 'Entregados' },
          { value: 'cancelled', label: 'Cancelados' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              statusFilter === tab.value
                ? 'bg-celeste-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Buscar por número de pedido o cliente..."
            icon={<Search className="w-5 h-5" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Loading state or Grid */}
      {loading && ordersList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-celeste-600 animate-spin mb-4" />
          <p className="text-gray-500">Cargando pedidos...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((order, index) => {
            const action = statusActions[order.status];
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`h-full hover:shadow-lg transition-shadow bg-white ${order.status === 'pending' ? 'border-orange-200 bg-orange-50/20' : ''}`}>
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-xs truncate max-w-[120px]" title={order.id}>
                          {order.id}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {formatDate(order.createdAt, { timeStyle: 'short' })}
                        </p>
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </div>

                    {/* Customer */}
                    <div className="mb-4">
                      <p className="font-medium text-gray-900">{order.customerName}</p>
                      <p className="text-sm text-gray-500">{order.customerPhone}</p>
                      {order.deliveryType === 'delivery' && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          {order.deliveryAddress}
                        </p>
                      )}
                    </div>

                    {/* Items Preview */}
                    <div className="space-y-1 mb-4">
                      {order.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-gray-600 truncate max-w-[150px]">
                            {item.quantity}x {item.product.name || 'Producto'}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-xs text-celeste-600">+{order.items.length - 3} más...</p>
                      )}
                    </div>

                    {/* Total & Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-semibold">Total</p>
                        <p className="text-lg font-bold text-celeste-600">
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {action && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleUpdateStatus(order.id, action.next)}
                          >
                            <action.icon className="w-4 h-4 mr-1" />
                            {action.label}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {filteredOrders.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No se encontraron pedidos</p>
          </CardContent>
        </Card>
      )}

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Detalle de Pedido`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-400 font-mono">{selectedOrder.id}</span>
              <OrderStatusBadge status={selectedOrder.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase">Cliente</h4>
                <p className="font-semibold text-gray-900">{selectedOrder.customerName}</p>
                <p className="text-sm text-gray-600">{selectedOrder.customerPhone || 'Sin teléfono'}</p>
                <p className="text-sm text-gray-600">{selectedOrder.customerEmail || ''}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase">Entrega</h4>
                <p className="font-semibold text-gray-900 capitalize">{selectedOrder.deliveryType}</p>
                {selectedOrder.deliveryAddress && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    {selectedOrder.deliveryAddress}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Productos</h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg">
                    <span>{item.quantity}x {item.product.name || 'Producto'}</span>
                    <span className="font-medium">{formatCurrency((item.product.price || 0) * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-celeste-50 rounded-xl">
              <div>
                <p className="text-xs text-celeste-600 font-semibold uppercase">Método de pago</p>
                <p className="font-bold text-celeste-700 capitalize">{selectedOrder.paymentMethod}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-celeste-600 font-semibold uppercase">Total a pagar</p>
                <p className="text-2xl font-bold text-celeste-700">{formatCurrency(selectedOrder.total)}</p>
              </div>
            </div>

            {selectedOrder.notes && (
              <div className="p-3 bg-gold-50 border border-gold-100 rounded-lg text-sm text-gold-800">
                <strong>Nota:</strong> {selectedOrder.notes}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              {statusActions[selectedOrder.status] && (
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleUpdateStatus(selectedOrder.id, statusActions[selectedOrder.status]!.next)}
                >
                  {(() => {
                    const Icon = statusActions[selectedOrder.status]!.icon;
                    return <Icon className="w-5 h-5 mr-2" />;
                  })()}
                  {statusActions[selectedOrder.status]!.label}
                </Button>
              )}
              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                <Button variant="danger" onClick={() => handleCancelOrder(selectedOrder.id)}>
                  Cancelar Pedido
                </Button>
              )}
              <Button variant="ghost" onClick={() => setSelectedOrder(null)}>Cerrar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
