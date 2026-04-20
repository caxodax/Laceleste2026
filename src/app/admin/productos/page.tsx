'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Package,
  Upload,
  Loader2,
} from 'lucide-react';
import { Button, Input, Card, CardContent, Badge, Modal, ConfirmModal } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct, toggleProductAvailability } from '@/lib/services/products';
import { uploadProductImage, deleteProductImage } from '@/lib/services/storage';
import { Product, Category } from '@/types';
import toast from 'react-hot-toast';

export default function ProductosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: '',
    description: '',
    available: true,
    featured: false,
    order: 0,
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
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProductsList(productsData);
      setCategoriesList(categoriesData);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = productsList.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleToggleAvailability = async (product: Product) => {
    try {
      await toggleProductAvailability(product.id, !product.available);
      setProductsList((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, available: !p.available } : p
        )
      );
      toast.success('Disponibilidad actualizada');
    } catch (error) {
      toast.error('Error al actualizar disponibilidad');
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      const product = productsList.find(p => p.id === productId);
      if (product?.image && product.image.includes('supabase')) {
        await deleteProductImage(product.image, product.thumbnail);
      }
      await deleteProduct(productId);
      setProductsList((prev) => prev.filter((p) => p.id !== productId));
      setDeleteConfirm(null);
      toast.success('Producto eliminado');
    } catch (error) {
      toast.error('Error al eliminar producto');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setImagePreview(product.image || null);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: 0,
      category: categoriesList[0]?.id || '',
      description: '',
      available: true,
      featured: false,
      order: productsList.length + 1,
    });
    setImagePreview(null);
    setImageFile(null);
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
      let imageUrl = formData.image || '';
      let thumbnailUrl = formData.thumbnail || '';

      if (imageFile) {
        const uploadResult = await uploadProductImage(imageFile);
        imageUrl = uploadResult.image;
        thumbnailUrl = uploadResult.thumbnail;
      }

      const finalData = { ...formData, image: imageUrl, thumbnail: thumbnailUrl } as Product;

      if (editingProduct) {
        await updateProduct(editingProduct.id, finalData);
        toast.success('Producto actualizado');
      } else {
        await createProduct(finalData);
        toast.success('Producto creado');
      }
      
      fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Error al guardar producto');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-celeste-600 animate-spin mb-4" />
        <p className="text-gray-500">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="heading-2 text-gray-900">Productos</h1>
          <p className="text-gray-600 mt-1">Gestiona el menú del restaurante en tiempo real</p>
        </div>
        <Button variant="primary" icon={<Plus className="w-5 h-5" />} onClick={handleAddNew}>
          Nuevo Producto
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-500">Total Productos</p>
          <p className="text-2xl font-bold text-gray-900">{productsList.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Disponibles</p>
          <p className="text-2xl font-bold text-green-600">
            {productsList.filter((p) => p.available).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">No Disponibles</p>
          <p className="text-2xl font-bold text-red-600">
            {productsList.filter((p) => !p.available).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Categorías</p>
          <p className="text-2xl font-bold text-celeste-600">{categoriesList.length}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar productos..."
                icon={<Search className="w-5 h-5" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-celeste-500 focus:outline-none bg-white"
            >
              <option value="all">Todas las categorías</option>
              {categoriesList.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`h-full ${!product.available ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                {/* Image */}
                <div className="relative w-full h-32 mb-4 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                  {(product.thumbnail || product.image) ? (
                    <img
                      src={product.thumbnail || product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      🍔
                    </div>
                  )}
                  {product.featured && (
                    <span className="absolute top-2 left-2 badge-gold text-xs">
                      ⭐ Popular
                    </span>
                  )}
                  {!product.available && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">No disponible</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="mb-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <span className="text-lg font-bold text-celeste-600">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-[40px]">
                    {product.description}
                  </p>
                  <Badge variant="gray" size="sm" className="mt-2">
                    {categoriesList.find((c) => c.id === product.category)?.name || 'Sin categoría'}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleToggleAvailability(product)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                      product.available
                        ? 'bg-green-50 text-green-600 hover:bg-green-100'
                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                    }`}
                  >
                    {product.available ? (
                      <><Eye className="w-4 h-4" /> Visible</>
                    ) : (
                      <><EyeOff className="w-4 h-4" /> Oculto</>
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 text-gray-500 hover:text-celeste-600 hover:bg-celeste-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(product.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No se encontraron productos</p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !saving && setIsModalOpen(false)}
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Image Preview & Upload */}
            <div className="md:col-span-2">
              <label className="label">Imagen del Producto</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative w-full h-48 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-celeste-400 transition-colors bg-gray-50 overflow-hidden"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Haz clic para subir imagen</span>
                  </>
                )}
                {saving && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-celeste-600 animate-spin" />
                  </div>
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

            <Input
              label="Nombre"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Precio ($)"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              required
            />
            <div>
              <label className="label">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-celeste-500 focus:outline-none bg-white"
                required
              >
                {categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Orden"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
            />
          </div>

          <div>
            <label className="label">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-celeste-500 focus:outline-none resize-none"
              placeholder="Describe el producto..."
              required
            />
          </div>

          <div className="flex items-center gap-6 py-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                className="w-5 h-5 text-celeste-600 rounded border-gray-300 focus:ring-celeste-500"
              />
              <span className="text-sm font-medium text-gray-700">Disponible</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-5 h-5 text-celeste-600 rounded border-gray-300 focus:ring-celeste-500"
              />
              <span className="text-sm font-medium text-gray-700">Destacado (Populares)</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              type="submit"
              loading={saving}
            >
              {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Eliminar Producto"
        message="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer y borrará la imagen si es necesario."
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  );
}
