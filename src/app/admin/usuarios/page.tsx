import { getUsers } from '@/lib/services/users';
import { Card, CardContent, CardHeader } from '@/components/ui';
import { Plus, User, Trash2, Mail, Phone, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { UserRoleBadge } from '@/components/admin/UserRoleBadge';
import { DeleteUserButton } from '@/components/admin/DeleteUserButton';

export const dynamic = 'force-dynamic';

export default async function UsuariosPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="heading-2 text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Administra los accesos al panel de control</p>
        </div>
        <Link
          href="/admin/usuarios/nuevo"
          className="flex items-center gap-2 bg-celeste-600 text-white px-4 py-2 rounded-xl hover:bg-celeste-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Usuario</span>
        </Link>
      </div>

      <div className="grid gap-6">
        {users.length > 0 ? (
          users.map((user) => (
            <Card key={user.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-celeste-100 flex items-center justify-center text-celeste-600 shrink-0">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{user.displayName}</h3>
                        <UserRoleBadge role={user.role} />
                      </div>
                      <div className="flex flex-col gap-1 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Registrado: {formatDate(user.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 self-end md:self-center">
                    {/* Solo permitimos borrar si no es el usuario actual (esto se maneja en el componente cliente) */}
                    <DeleteUserButton userId={user.id} userName={user.displayName} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No se encontraron usuarios registrados</p>
          </div>
        )}
      </div>
    </div>
  );
}
