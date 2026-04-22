'use client';

import { Product } from '@/types';
import { Modal, Button } from '@/components/ui';
import { ShoppingCart, X, Minus, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen) setQuantity(1);
  }, [isOpen]);

  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      showCloseButton={false}
      className="p-0 overflow-hidden bg-cream-50"
    >
      <div className="flex flex-col md:flex-row min-h-[500px]">
        {/* Image Section */}
        <div className="relative w-full md:w-1/2 h-[300px] md:h-auto bg-gray-100">
          <Image
            src={product.image || 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1965&auto=format&fit=crop'}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 bg-black/50 text-white rounded-full backdrop-blur-md hover:bg-black/70 transition-colors z-10 md:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Info Section */}
        <div className="w-full md:w-1/2 p-8 flex flex-col relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors hidden md:block"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="mb-8">
            <span className="badge-gold mb-4 inline-block">🍔 Especialidad</span>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h2>
            <p className="text-2xl font-bold text-celeste-600">
              {formatCurrency(product.price)}
            </p>
          </div>

          <div className="prose prose-sm text-gray-600 mb-8 max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
            <p className="leading-relaxed text-lg italic">
              {product.description}
            </p>
          </div>

          <div className="mt-auto pt-6 border-t border-gray-200">
            <div className="flex items-center gap-4 mb-6 justify-center">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                disabled={quantity <= 1}
              >
                <Minus className="w-6 h-6" />
              </button>
              <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            <Button
              onClick={() => {
                onAddToCart(product, quantity);
                onClose();
              }}
              className="w-full py-4 text-lg"
              disabled={!product.available}
              variant="gold"
              icon={<ShoppingCart className="w-6 h-6" />}
            >
              {product.available ? `Agregar ${quantity} al Carrito` : 'No Disponible'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
