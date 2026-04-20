'use client';

import { useState } from 'react';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { deleteUser } from '@/lib/services/users';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

export function DeleteUserButton({ userId, userName }: { userId: string; userName: string }) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { user: currentUser } = useAuthStore();

  // No permitir borrarte a ti mismo
  if (currentUser?.id === userId) {
    return null;
  }

  const handleDelete = async () => {
    try {
      setLoading(true);
      const result = await deleteUser(userId);
      if (result.success) {
        toast.success(`Usuario ${userName} eliminado`);
      } else {
        toast.error(result.error || 'Error al eliminar usuario');
      }
    } catch (error) {
      toast.error('Error al procesar la solicitud');
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2 bg-red-50 p-2 rounded-lg border border-red-100">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        <span className="text-xs font-medium text-red-700">¿Borrar?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Sí'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={loading}
          className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 disabled:opacity-50"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      title="Eliminar usuario"
    >
      <Trash2 className="w-5 h-5" />
    </button>
  );
}
