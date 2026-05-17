'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Star, Clock, MapPin, Phone, Award, ShieldCheck, Zap, Utensils, MessageSquare, Mail, Calendar, Sparkles, Instagram } from 'lucide-react';
import Image from 'next/image';
import { Header, Footer, WhatsAppButton } from '@/components/layout';
import { Button, MenuCard, Skeleton } from '@/components/ui';
import { MenuCardSkeleton } from '@/components/menu';
import { useCartStore } from '@/store/cartStore';
import { getProducts, getCategories } from '@/lib/services/products';
import { getAllSettings } from '@/lib/services/settings';
import { Product, Category, HeroSettings, AboutSettings, RestaurantSettings, LoyaltySettings } from '@/types';
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
    loyalty: LoyaltySettings | null;
  }>({ info: null, hero: null, about: null, loyalty: null });
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
        const defaultLoyalty: LoyaltySettings = {
          active: true,
          pointsPerOrder: 1,
          pointsToReward: 10,
          rewardDescription: 'Hamburguesa Gratis'
        };

        const defaultAbout: AboutSettings = {
          title: 'La Celeste: Pasión por las Hamburguesas Artesanales',
          description: 'Nacimos con la pasión de ofrecer hamburguesas artesanales de verdad en Barquisimeto, fusionando la tradición culinaria y las recetas clásicas de nuestra historia.\n\nCada día seleccionamos los cortes de carne más tiernos y horneamos nuestro pan brioche para entregarte un sabor inigualable.',
          image: 'https://ttglahstbeogwzqlmhkj.supabase.co/storage/v1/object/public/products/8esix4dbahv-1778969817795-full.webp'
        };

        setSettings({
          info: settingsData.restaurant_info || null,
          hero: settingsData.hero_settings || null,
          about: settingsData.about_settings || defaultAbout,
          loyalty: settingsData.loyalty_settings || defaultLoyalty,
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
        <section className="relative min-h-screen flex items-end justify-start overflow-hidden">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                </motion.div>
              ) : (
                <div key="gradient-bg" className="absolute inset-0 bg-gradient-to-br from-celeste-600 via-celeste-50 to-celeste-700" />
              )}
            </AnimatePresence>
          </div>

          {/* Carousel Indicators */}
          {settings.hero?.useCarousel && settings.hero.carouselImages.length > 1 && (
            <div className="absolute bottom-8 right-8 z-20 flex gap-2">
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
          
          <div className="container-app relative z-10 pb-16 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex flex-col sm:flex-row gap-4 justify-start"
            >
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
            </motion.div>
          </div>
        </section>

        {/* Sello de Calidad / Ventajas */}
        <section className="py-16 bg-cream-50 overflow-hidden border-b border-gray-100">
          <div className="container-app">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <Utensils className="w-8 h-8 text-celeste-600" />,
                  title: "Carne 100% Selecta",
                  desc: "Carne selecta de res de la mejor calidad, molida y sazonada artesanalmente cada mañana."
                },
                {
                  icon: <Sparkles className="w-8 h-8 text-gold-500" />,
                  title: "Pan Brioche Diario",
                  desc: "Horneado fresco todos los días. Increíblemente suave, tierno y con el toque de mantequilla perfecto."
                },
                {
                  icon: <Zap className="w-8 h-8 text-celeste-600" />,
                  title: "Pedidos QR en Mesa",
                  desc: "Escanea el código de tu mesa, realiza tu pedido en segundos y disfruta de una experiencia sin demoras."
                },
                {
                  icon: <ShieldCheck className="w-8 h-8 text-gold-500" />,
                  title: "Delivery Térmico",
                  desc: "Empacado en bolsas térmicas premium para garantizar que tu comida llegue tan perfecta como en el local."
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 group"
                >
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-300 group-hover:bg-celeste-50">
                    {item.icon}
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
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

        {/* Club de Puntos / Tarjeta Digital */}
        {settings.loyalty && settings.loyalty.active && (
          <section className="section bg-white overflow-hidden border-t border-gray-100">
            <div className="container-app">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                
                {/* Visual Card Column */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="relative flex justify-center lg:justify-start"
                >
                  {/* Vista previa en tarjeta premium estilo Club */}
                  <div className="w-full max-w-md p-8 bg-gradient-to-br from-gold-400 via-gold-500 to-amber-600 rounded-3xl text-white shadow-2xl relative overflow-hidden flex flex-col justify-between h-56 transition-transform duration-500 hover:scale-[1.03] group">
                    <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold tracking-widest uppercase opacity-80">Club La Celeste</span>
                        <h4 className="text-2xl font-black mt-1">Tarjeta de Puntos</h4>
                      </div>
                      <Award className="w-12 h-12 text-amber-100 animate-pulse" />
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs uppercase font-bold tracking-wider opacity-85">Tu Meta</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black">{settings.loyalty.pointsToReward} Puntos</span>
                        <span className="text-sm opacity-90">= 1 {settings.loyalty.rewardDescription || 'Recompensa'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gold-400 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob" />
                  <div className="absolute -top-6 -left-6 w-32 h-32 bg-celeste-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000" />
                </motion.div>

                {/* Text and Steps Column */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="space-y-6"
                >
                  <span className="badge-gold">🎁 Club La Celeste</span>
                  <h2 className="heading-2 text-gray-900">Programa de Fidelización</h2>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    ¡Queremos premiar tu preferencia! Únete gratis a nuestro club. Cada vez que realices una compra en la web o comas en nuestro local, acumulas puntos para canjearlos por una recompensa deliciosa.
                  </p>

                  <div className="space-y-4 pt-2">
                    {[
                      {
                        step: "01",
                        title: "Realiza tu Pedido",
                        desc: "Ingresa tu número de Cédula o RIF al hacer tu compra online o al cerrar tu cuenta en el local."
                      },
                      {
                        step: "02",
                        title: "Acumula Puntos",
                        desc: `Suma ${settings.loyalty.pointsPerOrder} ${settings.loyalty.pointsPerOrder === 1 ? 'punto' : 'puntos'} automáticamente con cada compra que realices.`
                      },
                      {
                        step: "03",
                        title: `¡Reclama tu ${settings.loyalty.rewardDescription}!`,
                        desc: `Al alcanzar los ${settings.loyalty.pointsToReward} puntos, tu próxima recompensa va por nuestra cuenta.`
                      }
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-start">
                        <span className="text-2xl font-black text-gold-500 font-mono leading-none pt-1">{item.step}</span>
                        <div>
                          <h4 className="font-bold text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
                
              </div>
            </div>
          </section>
        )}

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
                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 min-w-[120px]">
                      <p className="text-3xl font-bold text-celeste-600 mb-1">100%</p>
                      <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Artesanal</p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 min-w-[120px]">
                      <p className="text-3xl font-bold text-gold-500 mb-1">Top</p>
                      <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Ingredientes</p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 min-w-[120px]">
                      <p className="text-3xl font-bold text-celeste-600 mb-1">+10K</p>
                      <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Satisfechos</p>
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

        {/* Horarios, Ubicación y Contacto */}
        <section className="section bg-cream-50 overflow-hidden border-t border-b border-gray-100">
          <div className="container-app">
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Card 1: Horarios */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 bg-celeste-50 rounded-2xl flex items-center justify-center mb-6 text-celeste-600">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Horarios comerciales</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                      <span className="font-semibold text-gray-700">Martes a Domingo</span>
                      <span className="text-gray-600 font-bold font-mono">5:00 PM - 12:00 AM</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-gray-700">Lunes</span>
                      <span className="text-red-500 font-bold uppercase text-[11px] bg-red-50 px-3 py-1 rounded-full">Cerrado</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Card 2: Contacto Rápido */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 bg-gold-50 rounded-2xl flex items-center justify-center mb-6 text-gold-600">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Ponte en contacto</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-6">
                    ¿Tienes dudas, deseas cotizar un evento privado o quieres hacer tu pedido directamente? Estamos listos para atenderte por cualquier canal.
                  </p>
                  
                  <div className="space-y-4">
                    <a 
                      href={`https://wa.me/${settings.info?.whatsapp || '584245645357'}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 transition-colors hover:bg-celeste-50 hover:border-celeste-100 group"
                    >
                      <Phone className="w-5 h-5 text-gray-400 group-hover:text-celeste-600" />
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">WhatsApp</p>
                        <p className="text-sm font-bold text-gray-800">{settings.info?.whatsapp || '+58 424-5645357'}</p>
                      </div>
                    </a>

                    <a 
                      href={settings.info?.instagram || "https://instagram.com/laceleste"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 transition-colors hover:bg-gold-50 hover:border-gold-100 group"
                    >
                      <Instagram className="w-5 h-5 text-gray-400 group-hover:text-gold-600" />
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Instagram</p>
                        <p className="text-sm font-bold text-gray-800">@laceleste.bqto</p>
                      </div>
                    </a>
                  </div>
                </div>
              </motion.div>

              {/* Card 3: Ubicación y Mapa */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 bg-celeste-50 rounded-2xl flex items-center justify-center mb-6 text-celeste-600">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">¿Dónde estamos?</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-6">
                    {settings.info?.address || 'Urb. Nueva Segovia, Barquisimeto, Estado Lara.'}
                  </p>
                  
                  {/* Google Maps Real Iframe */}
                  <div className="w-full h-44 rounded-2xl overflow-hidden border border-gray-100 shadow-inner relative">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.288142233411!2d-69.29710159999999!3d10.075459799999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e8767006e9be2e5%3A0x64980fa2ae3f4c14!2sLa%20Celeste!5e0!3m2!1ses!2sve!4v1778989416935!5m2!1ses!2sve" 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      className="rounded-2xl"
                    />
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

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
