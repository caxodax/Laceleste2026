'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Award,
  Calendar,
  Phone,
  Mail,
  User,
  PlusCircle,
  TrendingUp,
  CheckCircle,
  Loader2,
  ChevronUp,
} from 'lucide-react';
import { Button, Input, Card, CardContent, Badge, Modal, ConfirmModal } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addPointsToCustomer,
} from '@/lib/services/customers';
import { Customer } from '@/types';
import toast from 'react-hot-toast';

export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'points' | 'visit' | 'name'>('points');
  const [customersList, setCustomersList] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    idCard: '',
    phone: '',
    email: '',
    points: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomersList(data);
    } catch (error) {
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  }

  const handleRegisterVisit = async (customer: Customer) => {
    try {
      await addPointsToCustomer(customer.idCard);
      setCustomersList((prev) =>
        prev.map((c) =>
          c.id === customer.id
            ? { ...c, points: c.points + 1, lastVisit: new Date() }
            : c
        )
      );
      toast.success(`¡Visita registrada! +1 punto para ${customer.name}`, {
        icon: '⭐',
        style: {
          borderRadius: '12px',
          background: '#0ea5e9',
          color: '#fff',
        },
      });
    } catch (error) {
      toast.error('Error al registrar visita');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomer(id);
      setCustomersList((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirm(null);
      toast.success('Cliente eliminado');
    } catch (error) {
      toast.error('Error al eliminar cliente');
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData(customer);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      idCard: '',
      phone: '',
      email: '',
      points: 0,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCustomer) {
        const updated = await updateCustomer(editingCustomer.id, formData);
        toast.success('Cliente actualizado');
        setCustomersList((prev) =>
          prev.map((c) => (c.id === editingCustomer.id ? updated : c))
        );
      } else {
        const created = await createCustomer(formData as Omit<Customer, 'id' | 'points'>);
        toast.success('Cliente registrado exitosamente');
        setCustomersList((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Save error:', error);
      if (error.message && error.message.includes('duplicate key')) {
        toast.error('Esta Cédula/RIF ya está registrada');
      } else {
        toast.error('Error al guardar cliente');
      }
    } finally {
      setSaving(false);
    }
  };

  const filteredCustomers = customersList
    .filter((customer) => {
      const search = searchTerm.toLowerCase();
      return (
        customer.name.toLowerCase().includes(search) ||
        customer.idCard.toLowerCase().includes(search) ||
        (customer.phone && customer.phone.includes(search)) ||
        (customer.email && customer.email.toLowerCase().includes(search))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'points') return b.points - a.points;
      if (sortBy === 'visit') {
        if (!a.lastVisit) return 1;
        if (!b.lastVisit) return -1;
        return b.lastVisit.getTime() - a.lastVisit.getTime();
      }
      return a.name.localeCompare(b.name);
    });

  // Stats calculations
  const totalCustomers = customersList.length;
  const totalPoints = customersList.reduce((acc, c) => acc + c.points, 0);
  const avgPoints = totalCustomers > 0 ? Math.round(totalPoints / totalCustomers) : 0;
  
  // Active customers in the last 30 days
  const activeCustomers = customersList.filter((c) => {
    if (!c.lastVisit) return false;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return c.lastVisit >= thirtyDaysAgo;
  }).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-celeste-600 animate-spin mb-4" />
        <p className="text-gray-500">Cargando clientes CRM...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="heading-2 text-gray-900">Clientes & Fidelización</h1>
          <p className="text-gray-600 mt-1">Gestiona la base de datos de tus clientes y sus puntos de fidelidad</p>
        </div>
        <Button variant="primary" icon={<Plus className="w-5 h-5" />} onClick={handleAddNew}>
          Nuevo Cliente
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 shadow-sm border border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-celeste-50 text-celeste-600 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 shadow-sm border border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gold-50 text-gold-500 rounded-2xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Puntos</p>
              <p className="text-2xl font-bold text-gray-900">{totalPoints}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 shadow-sm border border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Clientes Activos</p>
              <p className="text-2xl font-bold text-green-600">{activeCustomers}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 shadow-sm border border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Puntos Promedio</p>
              <p className="text-2xl font-bold text-purple-600">{avgPoints}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters & Sorting */}
      <Card className="shadow-sm border border-gray-100 bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-1/2">
              <Input
                placeholder="Buscar por nombre, cédula/RIF, teléfono..."
                icon={<Search className="w-5 h-5" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto justify-end">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-celeste-500 focus:outline-none bg-white text-gray-700 font-medium"
              >
                <option value="points">Ordenar por Puntos</option>
                <option value="visit">Ordenar por Última Visita</option>
                <option value="name">Ordenar por Nombre</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers List - Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer, index) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.04, 0.4) }}
          >
            <Card className="h-full flex flex-col justify-between overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 bg-white">
              <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
                {/* User Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-2xl bg-celeste-50 flex items-center justify-center text-celeste-600 shrink-0 font-bold text-lg">
                      {customer.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{customer.name}</h3>
                      <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                        CI: {customer.idCard}
                      </span>
                    </div>
                  </div>
                  {/* Points Badge */}
                  <div className="flex flex-col items-center bg-gold-50 border border-gold-100 rounded-2xl px-3 py-1.5 shrink-0">
                    <span className="text-xl font-black text-gold-600 leading-none">{customer.points}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gold-500 mt-1">Puntos</span>
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-2 text-sm text-gray-600 border-t border-gray-50 pt-4 flex-1">
                  {customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <a href={`tel:${customer.phone}`} className="hover:text-celeste-600 hover:underline">
                        {customer.phone}
                      </a>
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                      <a href={`mailto:${customer.email}`} className="hover:text-celeste-600 hover:underline line-clamp-1">
                        {customer.email}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>
                      Última Visita:{' '}
                      <strong>
                        {customer.lastVisit ? formatDate(customer.lastVisit) : 'Ninguna registrada'}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleRegisterVisit(customer)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-celeste-50 hover:bg-celeste-100 text-celeste-600 rounded-xl text-xs font-bold transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Registrar Visita (+1)
                  </button>
                  <button
                    onClick={() => handleEdit(customer)}
                    className="p-2 text-gray-500 hover:text-celeste-600 hover:bg-celeste-50 rounded-xl transition-colors border border-gray-100"
                    title="Editar cliente"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(customer.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-gray-100"
                    title="Eliminar cliente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <Card className="shadow-sm border border-gray-100 bg-white">
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No se encontraron clientes registrados</p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !saving && setIsModalOpen(false)}
        title={editingCustomer ? 'Editar Cliente CRM' : 'Registrar Nuevo Cliente'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre y Apellido"
              placeholder="Ej: Juan Pérez"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Cédula de Identidad / RIF"
              placeholder="Ej: V-12345678"
              value={formData.idCard}
              onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
              required
              disabled={!!editingCustomer} // No permitir cambiar CI de usuario existente para evitar conflictos de clave única
            />
            <Input
              label="Teléfono"
              placeholder="Ej: 04241234567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="Ej: juan.perez@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {editingCustomer && (
              <Input
                label="Puntos de Fidelidad"
                type="number"
                min="0"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
              />
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="primary" className="flex-1" type="submit" loading={saving}>
              {editingCustomer ? 'Guardar Cambios' : 'Registrar Cliente'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Eliminar Cliente"
        message="¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer y borrará permanentemente sus puntos y su historial."
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  );
}
