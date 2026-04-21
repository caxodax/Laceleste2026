'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FolderOpen,
  Image as ImageIcon,
  Smile,
  Upload,
  Loader2,
  Check,
  X,
  GripVertical
} from 'lucide-react';
import { Button, Input, Card, CardContent, Badge, Modal, ConfirmModal } from '@/components/ui';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/services/products';
import { uploadProductImage, deleteProductImage } from '@/lib/services/storage';
import { Category } from '@/types';
import toast from 'react-hot-toast';

export default function CategoriasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [useCustomImage, setUseCustomImage] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    description: '',
    icon: '🍔',
    order: 0,
    active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategoriesList(data);
    } catch (error) {
      toast.error('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  }

  const filteredCategories = categoriesList.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      const cat = categoriesList.find(c => c.id === id);
      if (cat?.image_url && cat.image_url.includes('supabase')) {
        await deleteProductImage(cat.image_url, cat.thumbnail_url);
      }
      await deleteCategory(id);
      setCategoriesList((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirm(null);
      toast.success('Categoría eliminada');
    } catch (error) {
      toast.error('Error al eliminar categoría');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData(category);
    setImagePreview(category.image_url || null);
    setUseCustomImage(!!category.image_url);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: '📁',
      order: categoriesList.length + 1,
      active: true,
    });
    setImagePreview(null);
    setUseCustomImage(false);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let imageUrl = formData.image_url || '';
      let thumbnailUrl = formData.thumbnail_url || '';

      if (useCustomImage && imageFile) {
        const uploadResult = await uploadProductImage(imageFile);
        imageUrl = uploadResult.image;
        thumbnailUrl = uploadResult.thumbnail;
      }

      const finalData = { 
        ...formData, 
        image_url: useCustomImage ? imageUrl : null, 
        thumbnail_url: useCustomImage ? thumbnailUrl : null,
        icon: useCustomImage ? null : formData.icon
      } as Category;

      if (editingCategory) {
        await updateCategory(editingCategory.id, finalData);
        toast.success('Categoría actualizada');
      } else {
        await createCategory(finalData);
        toast.success('Categoría creada');
      }
      
      fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Error al guardar categoría');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-celeste-600 animate-spin mb-4" />
        <p className="text-gray-500">Cargando categorías...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="heading-2 text-gray-900">Categorías</h1>
          <p className="text-gray-600 mt-1">Organiza los productos de tu menú</p>
        </div>
        <Button variant="primary" icon={<Plus className="w-5 h-5" />} onClick={handleAddNew}>
          Nueva Categoría
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 text-gray-600">
          <Input
            placeholder="Buscar categorías..."
            icon={<Search className="w-5 h-5" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((cat, index) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={!cat.active ? 'opacity-60' : ''}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-celeste-50 flex items-center justify-center text-2xl overflow-hidden border border-celeste-100">
                      {cat.image_url ? (
                        <img src={cat.thumbnail_url || cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        cat.icon
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{cat.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-1">{cat.description || 'Sin descripción'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="p-2 text-gray-400 hover:text-celeste-600 hover:bg-celeste-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(cat.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Badge variant={cat.active ? 'success' : 'gray'}>
                      {cat.active ? 'Activa' : 'Inactiva'}
                    </Badge>
                    <span className="text-xs text-gray-400">Orden: {cat.order}</span>
                  </div>
                  <GripVertical className="w-4 h-4 text-gray-300" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-gray-600">
            <FolderOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p>No se encontraron categorías</p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !saving && setIsModalOpen(false)}
        title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex gap-4 p-1 bg-gray-100 rounded-xl mb-4">
            <button
              type="button"
              onClick={() => setUseCustomImage(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${!useCustomImage ? 'bg-white shadow-sm text-celeste-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Smile className="w-4 h-4" /> Emoji / Icono
            </button>
            <button
              type="button"
              onClick={() => setUseCustomImage(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${useCustomImage ? 'bg-white shadow-sm text-celeste-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <ImageIcon className="w-4 h-4" /> Imagen URL
            </button>
          </div>

          {!useCustomImage ? (
            <Input
              label="Emoji o Icono"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="Ej: 🍔, 🍕, 🥤"
              required
            />
          ) : (
            <div className="space-y-2">
              <label className="label">Imagen de la Categoría</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative w-full h-32 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-celeste-400 transition-colors bg-gray-50 overflow-hidden"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500">Haz clic para subir imagen</span>
                  </>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>
          )}

          <Input
            label="Nombre de la Categoría"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Plato Principal"
            required
          />

          <div>
            <label className="label">Descripción (Opcional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-celeste-500 focus:outline-none resize-none"
              placeholder="Describe qué incluye esta categoría..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Orden de visualización"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
            />
            <div className="flex items-center gap-2 h-full pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-5 h-5 text-celeste-600 rounded border-gray-300 focus:ring-celeste-500"
                />
                <span className="text-sm font-medium text-gray-700">Categoría Activa</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="primary" className="flex-1" type="submit" loading={saving}>
              {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Eliminar Categoría"
        message="¿Estás seguro de que deseas eliminar esta categoría? Nota: Los productos asignados a esta categoría seguirán existiendo pero podrías necesitar reasignarlos."
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  );
}
