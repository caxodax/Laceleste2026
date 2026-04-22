'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MenuCard } from '@/components/ui';
import { Product, Category } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { ProductDetailModal } from './ProductDetailModal';
import toast from 'react-hot-toast';

interface MenuSectionProps {
  category: Category;
  products: Product[];
}

export function MenuSection({ category, products }: MenuSectionProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCart = (product: Product, quantity = 1) => {
    addItem(product, quantity);
    toast.success(`${quantity > 1 ? quantity + ' ' : ''}${product.name} agregado al carrito`, {
      icon: '🍔',
      style: {
        borderRadius: '12px',
        background: '#0ea5e9',
        color: '#fff',
      },
    });
  };

  const handleOpenModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-8" id={category.id}>
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="flex items-center gap-4 mb-6"
      >
        <div className="w-12 h-12 flex items-center justify-center text-4xl overflow-hidden rounded-xl">
          {category.image_url ? (
            <img src={category.thumbnail_url || category.image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            category.icon
          )}
        </div>
        <div>
          <h2 className="heading-3 text-gray-900">{category.name}</h2>
          {category.description && (
            <p className="text-gray-600">{category.description}</p>
          )}
        </div>
      </motion.div>

      {/* Products Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {products.map((product) => (
          <motion.div key={product.id} variants={itemVariants}>
            <MenuCard
              title={product.name}
              description={product.description}
              price={product.price}
              image={product.image}
              badge={product.featured ? '⭐ Popular' : undefined}
              available={product.available}
              onAddToCart={() => handleAddToCart(product)}
              onClick={() => handleOpenModal(product)}
            />
          </motion.div>
        ))}
      </motion.div>

      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleAddToCart}
      />
    </section>
  );
}
