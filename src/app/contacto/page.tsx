'use client';

import { motion } from 'framer-motion';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Instagram, 
  MessageCircle
} from 'lucide-react';
import { Header, Footer, WhatsAppButton } from '@/components/layout';
import { Button, Card, CardContent } from '@/components/ui';
import { restaurantSettings } from '@/data/menu';
import { getWhatsAppLink } from '@/lib/utils';

export default function ContactoPage() {

  const contactInfo = [
    {
      icon: Phone,
      label: 'Teléfono',
      value: restaurantSettings.phone,
      href: `tel:${restaurantSettings.phone}`,
      color: 'text-celeste-500',
    },
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: 'Escríbenos',
      href: getWhatsAppLink(restaurantSettings.whatsapp, '¡Hola! Tengo una consulta'),
      color: 'text-green-500',
    },
    {
      icon: Instagram,
      label: 'Instagram',
      value: restaurantSettings.instagram,
      href: `https://instagram.com/${restaurantSettings.instagram.replace('@', '')}`,
      color: 'text-pink-500',
    },
    {
      icon: MapPin,
      label: 'Ubicación',
      value: restaurantSettings.address,
      href: '#',
      color: 'text-red-500',
    },
  ];

  const schedule = [
    { day: 'Lunes', hours: 'Cerrado', closed: true },
    { day: 'Martes a Domingo', hours: '5:00 PM - 12:00 AM' },
  ];

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
              <h1 className="heading-1 text-white mb-4">Contáctanos</h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                ¿Tienes alguna pregunta o sugerencia? 
                ¡Nos encantaría escucharte!
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container-app py-16">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Map Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full overflow-hidden">
                <CardContent className="p-0 h-full min-h-[450px]">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.2859631310166!2d-69.29971862423683!3d10.075638671727194!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e8767006e9be2e5%3A0x64980fa2ae3f4c14!2sLa%20Celeste!5e0!3m2!1ses!2sve!4v1776873199145!5m2!1ses!2sve" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0, minHeight: '450px' }} 
                    allowFullScreen={true} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Ubicación de La Celeste"
                  ></iframe>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Contact Cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                {contactInfo.map((item, index) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="card-hover p-6 flex items-center gap-4"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center ${item.color}`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{item.label}</p>
                      <p className="font-medium text-gray-900">{item.value}</p>
                    </div>
                  </motion.a>
                ))}
              </div>

              {/* Schedule */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gold-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-gold-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Horario</h3>
                  </div>
                  
                  <div className="space-y-2">
                    {schedule.map((item) => (
                      <div
                        key={item.day}
                        className={`flex justify-between py-2 ${
                          item.closed ? 'text-gray-400' : 'text-gray-700'
                        }`}
                      >
                        <span className="font-medium">{item.day}</span>
                        <span>{item.hours}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
