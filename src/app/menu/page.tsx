'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header, Footer, WhatsAppButton } from '@/components/layout';
import { MenuSection, CategoryNav } from '@/components/menu';
import { getProducts, getCategories } from '@/lib/services/products';
import { Product, Category } from '@/types';
import { Loader2 } from 'lucide-react';

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <>
      <Header />
      
      <main className="pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-r from-celeste-600 to-celeste-700 py-16">
          <div className="container-app text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="heading-1 text-white mb-4">Nuestro Menú</h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Descubre todas nuestras deliciosas opciones. 
                Hamburguesas artesanales, tequeños, postres y más.
              </p>
            </motion.div>
          </div>
        </section>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-celeste-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Cargando nuestro delicioso menú...</p>
          </div>
        ) : (
          <>
            {/* Category Navigation */}
            <CategoryNav categories={categories} />

            {/* Menu Sections */}
            <div className="container-app py-8">
              {categories.map((category) => {
                const categoryProducts = products.filter(
                  (p) => p.category === category.id
                );
                if (categoryProducts.length === 0) return null;
                
                // Map products to include thumbnail fallback
                const optimizedProducts = categoryProducts.map(p => ({
                  ...p,
                  image: p.thumbnail || p.image
                }));

                return (
                  <MenuSection
                    key={category.id}
                    category={category}
                    products={optimizedProducts}
                  />
                );
              })}
            </div>
          </>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
