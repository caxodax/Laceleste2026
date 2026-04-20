'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui';
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Smartphone, 
  ArrowLeft,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { createAdminUser } from '@/lib/services/users';
import toast from 'react-hot-toast';

export default function NuevoUsuarioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'staff' as 'admin' | 'staff' | 'customer',
    phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.displayName) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      const result = await createAdminUser(formData);
      
      if (result.success) {
        toast.success('Usuario creado exitosamente');
        router.push('/admin/usuarios');
        router.refresh();
      } else {
        toast.error(result.error || 'Error al crear usuario');
      }
    } catch (error) {
      toast.error('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/usuarios"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="heading-3 text-gray-900">Crear Nuevo Usuario</h1>
          <p className="text-gray-600">Asigna permisos y acceso al sistema</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4 text-celeste-600" />
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Juan Pérez"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-celeste-500 focus:border-transparent outline-none transition-all"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-celeste-600" />
                Correo Electrónico *
              </label>
              <input
                type="email"
                required
                placeholder="correo@ejemplo.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-celeste-500 focus:border-transparent outline-none transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4 text-celeste-600" />
                Contraseña Inicial *
              </label>
              <input
                type="password"
                required
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-celeste-500 focus:border-transparent outline-none transition-all"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rol */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-celeste-600" />
                  Rol de Usuario
                </label>
                <select
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-celeste-500 focus:border-transparent outline-none transition-all"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                >
                  <option value="admin">Administrador</option>
                  <option value="staff">Personal / Staff</option>
                  <option value="customer">Cliente Registrado</option>
                </select>
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-celeste-600" />
                  Teléfono (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="+58 412..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-celeste-500 focus:border-transparent outline-none transition-all"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-celeste-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-celeste-700 transition-colors shadow-lg shadow-celeste-200 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Creando Usuario...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    <span>Crear Usuario e Permitir Entrada</span>
                  </>
                )}
              </button>
            </div>
            
            <p className="text-center text-xs text-gray-500">
              * El usuario podrá iniciar sesión inmediatamente después de su creación.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
