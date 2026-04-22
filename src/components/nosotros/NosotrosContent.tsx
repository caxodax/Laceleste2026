'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Header, Footer, WhatsAppButton } from '@/components/layout';
import { Button } from '@/components/ui';
import { useSettingsStore } from '@/store/settingsStore';
import { Star, Heart, Utensils, Award, Clock } from 'lucide-react';
import Link from 'next/link';

export default function NosotrosContent() {
  const { about, info, initialized } = useSettingsStore();

  if (!initialized) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-celeste-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sections = [
    {
      title: 'Nuestra Misión',
      icon: <Utensils className="w-6 h-6" />,
      content: 'Brindar a nuestros clientes una experiencia culinaria única, fusionando la tradición de las hamburguesas artesanales con el toque auténtico del sabor argentino.',
      color: 'bg-celeste-50'
    },
    {
      title: 'Nuestra Visión',
      icon: <Star className="w-6 h-6" />,
      content: 'Ser el destino gastronómico preferido en Barquisimeto, reconocidos por nuestra innovación constante y el compromiso inquebrantable con la calidad.',
      color: 'bg-gold-50'
    },
    {
      title: 'Calidad Premium',
      icon: <Award className="w-6 h-6" />,
      content: 'Seleccionamos cuidadosamente cada ingrediente, desde el pan recién horneado hasta la carne de primera, para garantizar que cada bocado sea memorable.',
      color: 'bg-red-50'
    }
  ];

  return (
    <>
      <Header />
      
      <main className="pt-24 lg:pt-32">
        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[400px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            {about?.image ? (
              <Image 
                src={about.image} 
                alt="Nosotros Hero" 
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-celeste-600 to-gray-900" />
            )}
            <div className="absolute inset-0 bg-black/50" />
          </div>
          
          <div className="container-app relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="max-w-2xl text-white"
            >
              <span className="badge-gold mb-4 inline-flex">🇦🇷 Tradición & Sabor</span>
              <h1 className="heading-1 mb-6">{about?.title || 'Quienes Somos'}</h1>
              <p className="text-xl text-white/90 font-light leading-relaxed">
                Descubre el corazón de La Celeste, donde la pasión por la cocina artesanal se encuentra con la calidez del servicio barquisimetano.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Story Section */}
        <section className="section bg-white overflow-hidden">
          <div className="container-app">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <div className="inline-flex p-3 bg-celeste-50 rounded-2xl">
                  <Heart className="w-6 h-6 text-celeste-600" />
                </div>
                <h2 className="heading-2 text-gray-900">Pasión por cada detalle</h2>
                <div className="text-gray-600 leading-relaxed text-lg whitespace-pre-line font-serif italic">
                  {about?.description || 'La historia de La Celeste comenzó con un sueño simple: traer el sabor auténtico de las hamburguesas artesanales con un toque argentino a Barquisimeto.'}
                </div>
                
                <div className="pt-6 grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-4xl font-logo text-celeste-600">10k+</p>
                    <p className="text-sm text-gray-500 uppercase tracking-widest mt-1">Clientes Felices</p>
                  </div>
                  <div>
                    <p className="text-4xl font-logo text-gold-500">100%</p>
                    <p className="text-sm text-gray-500 uppercase tracking-widest mt-1">Artesanal</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
                   <Image 
                    src={about?.image || "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1965&auto=format&fit=crop"} 
                    alt="Cocina Artisana" 
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                </div>
                
                {/* Decorative floating card */}
                <div className="absolute -bottom-8 -left-8 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/50 max-w-[250px] hidden sm:block">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-celeste-600" />
                    <span className="font-bold text-gray-900">Horario de Gala</span>
                  </div>
                  <p className="text-sm text-gray-600">Disfruta de nuestra sazón de Martes a Domingo, de 5:00 PM a 12:00 AM.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="section bg-cream-50">
          <div className="container-app">
            <div className="text-center mb-16">
              <h2 className="heading-2 text-gray-900 mb-4">Nuestros Pilares</h2>
              <p className="text-gray-600 max-w-2xl mx-auto italic">
                Lo que nos define y nos guía en cada preparación y atención al cliente.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {sections.map((section, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`${section.color} p-8 rounded-3xl border border-white/20 shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 text-gray-900">
                    {section.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {section.content}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section relative overflow-hidden">
          <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-celeste-600" />
             <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          </div>
          
          <div className="container-app relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-white"
            >
              <h2 className="heading-2 text-white mb-6">¿Quieres probar la diferencia?</h2>
              <p className="text-xl text-white/90 mb-10 font-light">
                Ven y vive la experiencia La Celeste. Calidad, sabor y tradición en cada hamburguesa.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/menu">
                  <Button variant="gold" size="lg">Ver Menú Completo</Button>
                </Link>
                <Link href="/pedido">
                  <Button variant="secondary" size="lg" className="bg-white/10 border-white text-white hover:bg-white hover:text-celeste-600">
                    Hacer Pedido Ahora
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
