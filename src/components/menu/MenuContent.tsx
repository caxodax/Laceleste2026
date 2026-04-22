'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header, Footer, WhatsAppButton } from '@/components/layout';
import { MenuSection, CategoryNav, SearchInput, MenuCardSkeleton } from '@/components/menu';
import { Button } from '@/components/ui';
import { getProducts, getCategories } from '@/lib/services/products';
import { Product, Category } from '@/types';
import { Loader2 } from 'lucide-react';

export default function MenuContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        setProducts(productsData);
        setCategories(categoriesData.filter(c => c.active));
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const allCategories = [
    { id: 'all', name: 'Todas', icon: '🍽️', active: true },
    ...categories
  ] as Category[];

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-celeste-600 animate-spin" />
      </div>
    );
  }

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
          <div className="container-app py-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <MenuCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="py-8 bg-cream-50/50">
              <SearchInput value={searchQuery} onChange={setSearchQuery} />
              
              {/* Category Navigation */}
              <CategoryNav 
                categories={allCategories} 
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </div>

            {/* Menu Sections */}
            <div className="container-app py-8">
              {categories
                .filter(cat => activeCategory === 'all' || cat.id === activeCategory)
                .map((category) => {
                  const filteredProducts = products.filter(p => {
                    const matchesCategory = p.category === category.id;
                    const matchesSearch = searchQuery === '' || 
                      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
                    return matchesCategory && matchesSearch;
                  });

                  if (filteredProducts.length === 0) return null;
                  
                  // Map products to include thumbnail fallback
                  const optimizedProducts = filteredProducts.map(p => ({
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

              {/* No results message */}
              {products.length > 0 && categories.filter(cat => activeCategory === 'all' || cat.id === activeCategory).every(cat => 
                products.filter(p => {
                  const matchesCategory = p.category === cat.id;
                  const matchesSearch = searchQuery === '' || 
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.description?.toLowerCase().includes(searchQuery.toLowerCase());
                  return matchesCategory && matchesSearch;
                }).length === 0
              ) && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <p className="text-xl text-gray-500 mb-2">No encontramos resultados para "{searchQuery}"</p>
                  <p className="text-gray-400">Intenta con otros términos o cambia de categoría</p>
                  <Button 
                    variant="ghost" 
                    className="mt-4 text-celeste-600"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('all');
                    }}
                  >
                    Borrar búsqueda
                  </Button>
                </motion.div>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
