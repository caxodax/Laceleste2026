'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Star, Clock, MapPin, Phone } from 'lucide-react';
import Image from 'next/image';
import { Header, Footer, WhatsAppButton } from '@/components/layout';
import { Button, MenuCard, Skeleton } from '@/components/ui';
import { MenuCardSkeleton } from '@/components/menu';
import { useCartStore } from '@/store/cartStore';
import { getProducts, getCategories } from '@/lib/services/products';
import { getAllSettings } from '@/lib/services/settings';
import { Product, Category, HeroSettings, AboutSettings, RestaurantSettings } from '@/types';
import { ProductDetailModal } from '@/components/menu/ProductDetailModal';
import toast from 'react-hot-toast';

export default function HomePage() {
  const addItem = useCartStore((state) => state.addItem);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<{
    info: RestaurantSettings | null;
    hero: HeroSettings | null;
    about: AboutSettings | null;
  }>({ info: null, hero: null, about: null });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsData, categoriesData, settingsData] = await Promise.all([
          getProducts(),
          getCategories(),
          getAllSettings()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
        setSettings({
          info: settingsData.restaurant_info || null,
          hero: settingsData.hero_settings || null,
          about: settingsData.about_settings || null,
        });
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Carousel logic
  const nextSlide = useCallback(() => {
    if (settings.hero?.useCarousel && settings.hero.carouselImages?.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % settings.hero!.carouselImages.length);
    }
  }, [settings.hero]);

  useEffect(() => {
    if (settings.hero?.useCarousel && settings.hero.carouselImages?.length > 1) {
      const timer = setInterval(nextSlide, 5000);
      return () => clearInterval(timer);
    }
  }, [settings.hero, nextSlide]);

  const featuredProducts = products.filter((p) => p.featured).slice(0, 4);

  const handleAddToCart = (product: Product, quantity = 1) => {
    addItem(product as any, quantity);
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

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-celeste-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background Layer */}
          <div className="absolute inset-0 z-0">
            <AnimatePresence mode="wait">
              {settings.hero?.useCarousel && settings.hero.carouselImages.length > 0 ? (
                <motion.div
                  key={`slide-${currentSlide}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={settings.hero.carouselImages[currentSlide]}
                    alt={`Hero slide ${currentSlide}`}
                    fill
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 z-10" />
                </motion.div>
              ) : settings.hero?.backgroundImage ? (
                <motion.div 
                  key="single-bg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={settings.hero.backgroundImage}
                    alt="Hero background"
                    fill
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 z-10" />
                </motion.div>
              ) : (
                <div key="gradient-bg" className="absolute inset-0 bg-gradient-to-br from-celeste-600 via-celeste-50 to-celeste-700" />
              )}
            </AnimatePresence>
          </div>

          {/* Carousel Indicators */}
          {settings.hero?.useCarousel && settings.hero.carouselImages.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {settings.hero.carouselImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentSlide === idx ? 'w-8 bg-gold-400' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
          
          <div className="container-app relative z-10 py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="text-center lg:text-left"
              >
                {settings.hero?.badge && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white mb-6"
                  >
                    <Star className="w-4 h-4 text-gold-400 fill-gold-400" />
                    <span className="text-sm font-medium">{settings.hero.badge}</span>
                  </motion.div>
                )}

                <h1 className="heading-1 text-white mb-6">
                  {settings.hero?.title || 'Hamburguesas'}
                  <span className="block text-gold-400">Artesanales</span>
                </h1>

                <p className="text-xl text-white/90 mb-8 max-w-lg mx-auto lg:mx-0 whitespace-pre-line">
                  {settings.hero?.subtitle || 'Inspiradas en los sabores de Argentina 🇦🇷\nHechas con amor y los mejores ingredientes'}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href={settings.hero?.ctaLink || "/menu"}>
                    <Button variant="gold" size="lg" icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
                      {settings.hero?.ctaText || 'Ver Menú'}
                    </Button>
                  </Link>
                  <Link href={settings.hero?.secondaryCtaLink || "/pedido"}>
                    <Button variant="secondary" size="lg" className="bg-white/10 border-white text-white hover:bg-white hover:text-celeste-600">
                      {settings.hero?.secondaryCtaText || 'Hacer Pedido'}
                    </Button>
                  </Link>
                </div>

                <div className="flex flex-wrap gap-4 mt-8 justify-center lg:justify-start">
                  <div className="flex items-center gap-2 text-white/80">
                    <Clock className="w-5 h-5" />
                    <span className="text-sm font-medium">5PM - 12AM</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <MapPin className="w-5 h-5" />
                    <span className="text-sm font-medium">Barquisimeto</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Phone className="w-5 h-5" />
                    <span className="text-sm font-medium">{settings.info?.phone || '0424-5645357'}</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
                className="relative hidden lg:block"
              >
                <div className="relative w-96 h-96 mx-auto">
                  <div className="absolute inset-0 bg-gold-400/30 rounded-full blur-3xl animate-pulse" />
                  <div className="relative w-full h-full rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-celeste-400 to-celeste-600 flex items-center justify-center shadow-2xl">
                        <span className="font-logo text-white text-5xl">C</span>
                      </div>
                      <h2 className="font-logo text-3xl text-white">La Celeste</h2>
                      <p className="text-white/70 text-xs mt-1">Sabor Argentino</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="section bg-white overflow-hidden">
          <div className="container-app">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="badge-gold mb-4">⭐ Lo más pedido</span>
              <h2 className="heading-2 text-gray-900 mb-4">Nuestros Favoritos</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Las hamburguesas que nuestros clientes más aman. 
                Preparadas con ingredientes frescos y mucho sabor.
              </p>
            </motion.div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <MenuCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <MenuCard
                      title={product.name}
                      description={product.description}
                      price={product.price}
                      image={product.thumbnail || product.image}
                      badge="⭐ Popular"
                      available={product.available}
                      onAddToCart={() => handleAddToCart(product)}
                      onClick={() => handleOpenModal(product)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* About Us (Nosotros) Section */}
        {settings.about && (
          <section className="section bg-cream-50 overflow-hidden">
            <div className="container-app">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="relative aspect-square sm:aspect-video lg:aspect-square rounded-3xl overflow-hidden shadow-2xl">
                    {settings.about.image ? (
                      <Image 
                        src={settings.about.image} 
                        alt="Sobre La Celeste" 
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-celeste-100 flex items-center justify-center">
                        <Star className="w-20 h-20 text-celeste-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-3xl z-10" />
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gold-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
                  <div className="absolute -top-6 -left-6 w-32 h-32 bg-celeste-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="space-y-6"
                >
                  <span className="badge-celeste">🇦🇷 Nuestra Historia</span>
                  <h2 className="heading-2 text-gray-900">{settings.about.title}</h2>
                  <div className="space-y-4 text-gray-600 leading-relaxed text-lg font-serif italic">
                    <p className="whitespace-pre-line">
                      {settings.about.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 pt-4">
                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 min-w-[150px]">
                      <p className="text-3xl font-bold text-celeste-600 mb-1">100%</p>
                      <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Artesanal</p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 min-w-[150px]">
                      <p className="text-3xl font-bold text-gold-500 mb-1">Top</p>
                      <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Ingredientes</p>
                    </div>
                  </div>

                  <Link href="/menu" className="inline-block mt-4">
                    <Button variant="ghost" className="text-celeste-600 hover:text-celeste-700 p-0">
                      Descubre nuestra pasión por el sabor →
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="section bg-celeste-600 text-white">
          <div className="container-app text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="heading-2 mb-4 text-white">¿Listo para ordenar?</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Haz tu pedido ahora y disfruta de las mejores hamburguesas de Barquisimeto
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/pedido">
                  <Button variant="gold" size="lg">Hacer Pedido Online</Button>
                </Link>
                <a
                  href={`https://wa.me/${settings.info?.whatsapp || '584245645357'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary" size="lg" className="bg-white/10 border-white text-white hover:bg-white hover:text-celeste-600">
                    WhatsApp
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
      
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleAddToCart}
      />
    </>
  );
}
