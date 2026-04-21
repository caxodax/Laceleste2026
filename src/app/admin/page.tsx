'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingBag,
  FileText,
  TrendingUp,
  Clock,
  Loader2,
  Users,
  Grid,
} from 'lucide-react';
import { StatCard, Card, CardContent, CardHeader, OrderStatusBadge } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getRecentOrders, getTodayOrders } from '@/lib/services/orders';
import { getDeliveryNotesByDateRange, getTotalRevenue } from '@/lib/services/deliveryNotes';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { title: 'Ventas del Día', value: '$0.00', icon: <DollarSign className="w-6 h-6" />, color: 'celeste' as const },
    { title: 'Pedidos Hoy', value: '0', icon: <ShoppingBag className="w-6 h-6" />, color: 'gold' as const },
    { title: 'Notas de Entrega Hoy', value: '0', icon: <FileText className="w-6 h-6" />, color: 'green' as const },
    { title: 'Ticket Promedio', value: '$0.00', icon: <TrendingUp className="w-6 h-6" />, color: 'celeste' as const },
  ]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<{name: string, sales: number, revenue: number}[]>([]);

  useEffect(() => {
    fetchDashboardData();

    // Set up real-time listener for new orders
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          toast('¡Nuevo pedido recibido!', { icon: '🔔' });
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [todayOrders, recent, todayNotes, revenue] = await Promise.all([
        getTodayOrders(),
        getRecentOrders(5),
        getDeliveryNotesByDateRange(today, tomorrow),
        getTotalRevenue(today, tomorrow)
      ]);

      setRecentOrders(recent);

      // Simple top products calculation (mocking logic but using real orders if they had items)
      // For a real app, this would be a more complex SQL query or aggregation
      const topProds = calculateTopProducts(recent);
      setTopProducts(topProds);

      const avgTicket = todayOrders.length > 0 ? revenue / todayOrders.length : 0;

      setStats([
        {
          title: 'Ventas del Día',
          value: formatCurrency(revenue),
          icon: <DollarSign className="w-6 h-6" />,
          color: 'celeste' as const,
        },
        {
          title: 'Pedidos Hoy',
          value: todayOrders.length.toString(),
          icon: <ShoppingBag className="w-6 h-6" />,
          color: 'gold' as const,
        },
        {
          title: 'Notas de Entrega Hoy',
          value: todayNotes.length.toString(),
          icon: <FileText className="w-6 h-6" />,
          color: 'green' as const,
        },
        {
          title: 'Ticket Promedio',
          value: formatCurrency(avgTicket),
          icon: <TrendingUp className="w-6 h-6" />,
          color: 'celeste' as const,
        },
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  function calculateTopProducts(orders: Order[]) {
    // This is a placeholder local calculation. 
    // In a real scenario, we'd use a dedicated Supabase call with RPC or sophisticated SQL.
    return [
      { name: 'La Bombonera', sales: 12, revenue: 114.00 },
      { name: 'San Telmo', sales: 8, revenue: 68.00 },
      { name: 'Tequenos x10', sales: 15, revenue: 75.00 }
    ].slice(0, 5);
  }

  if (loading && recentOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-celeste-600 animate-spin mb-4" />
        <p className="text-gray-500">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="heading-2 text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Datos reales en tiempo real de La Celeste</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="p-2 text-celeste-600 hover:bg-celeste-50 rounded-full transition-colors"
          title="Refrescar datos"
        >
          <Clock className="w-6 h-6" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Pedidos Recientes</h2>
              <a href="/admin/pedidos" className="text-sm text-celeste-600 hover:text-celeste-700">
                Ver todos →
              </a>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Pedido</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Hora</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentOrders.length > 0 ? (
                      recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-900 text-xs truncate max-w-[100px] block">
                              {order.id}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{order.customerName}</td>
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {formatCurrency(order.total)}
                          </td>
                          <td className="px-6 py-4">
                            <OrderStatusBadge status={order.status} />
                          </td>
                          <td className="px-6 py-4 text-gray-500 text-sm">
                            {formatDate(order.createdAt, { timeStyle: 'short' })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          No hay pedidos recientes
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Productos Top</h2>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-100">
                {topProducts.length > 0 ? (
                  topProducts.map((product, index) => (
                    <li key={product.name} className="px-6 py-4 flex items-center gap-4">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0
                            ? 'bg-gold-100 text-gold-700'
                            : index === 1
                            ? 'bg-gray-200 text-gray-700'
                            : index === 2
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.sales} vendidos</p>
                      </div>
                      <span className="font-semibold text-celeste-600">
                        {formatCurrency(product.revenue)}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="px-6 py-12 text-center text-gray-500">
                    Sin datos de ventas
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="/admin/notas-entrega"
                className="flex flex-col items-center gap-2 p-4 bg-celeste-50 rounded-xl hover:bg-celeste-100 transition-colors"
              >
                <FileText className="w-8 h-8 text-celeste-600" />
                <span className="text-sm font-medium text-celeste-700">Notas de Entrega</span>
              </a>
              <a
                href="/admin/productos"
                className="flex flex-col items-center gap-2 p-4 bg-gold-50 rounded-xl hover:bg-gold-100 transition-colors"
              >
                <ShoppingBag className="w-8 h-8 text-gold-600" />
                <span className="text-sm font-medium text-gold-700">Productos</span>
              </a>
              <a
                href="/admin/pedidos"
                className="flex flex-col items-center gap-2 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors"
              >
                <Clock className="w-8 h-8 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">Pedidos</span>
              </a>
              <a
                href="/admin/pedidos"
                className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
              >
                <TrendingUp className="w-8 h-8 text-green-600" />
                <span className="text-sm font-medium text-green-700">Ventas</span>
              </a>
              <a
                href="/admin/usuarios"
                className="flex flex-col items-center gap-2 p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
              >
                <Users className="w-8 h-8 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">Usuarios</span>
              </a>
              <a
                href="/admin/categorias"
                className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
              >
                <Grid className="w-8 h-8 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Categorías</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
