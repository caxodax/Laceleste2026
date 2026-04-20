'use client';

import { motion } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Instagram, 
  MessageCircle,
  Send
} from 'lucide-react';
import { Header, Footer, WhatsAppButton } from '@/components/layout';
import { Button, Input, Textarea, Card, CardContent } from '@/components/ui';
import { restaurantSettings } from '@/data/menu';
import { getWhatsAppLink } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ContactoPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Mensaje enviado. ¡Te contactaremos pronto!');
  };

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
    { day: 'Martes', hours: '5:00 PM - 12:00 AM' },
    { day: 'Miércoles', hours: '5:00 PM - 12:00 AM' },
    { day: 'Jueves', hours: '5:00 PM - 12:00 AM' },
    { day: 'Viernes', hours: '5:00 PM - 12:00 AM' },
    { day: 'Sábado', hours: '5:00 PM - 12:00 AM' },
    { day: 'Domingo', hours: '5:00 PM - 12:00 AM' },
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
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-8">
                  <h2 className="heading-3 text-gray-900 mb-6">Envíanos un mensaje</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label="Nombre"
                        placeholder="Tu nombre"
                        required
                      />
                      <Input
                        label="Teléfono"
                        placeholder="0412-1234567"
                        required
                      />
                    </div>
                    <Input
                      label="Email"
                      type="email"
                      placeholder="tu@email.com"
                    />
                    <Textarea
                      label="Mensaje"
                      placeholder="¿En qué podemos ayudarte?"
                      required
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      fullWidth
                      icon={<Send className="w-5 h-5" />}
                    >
                      Enviar Mensaje
                    </Button>
                  </form>
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

              {/* Quick Actions */}
              <div className="grid sm:grid-cols-2 gap-4">
                <a
                  href={getWhatsAppLink(restaurantSettings.whatsapp, '¡Hola! Quiero hacer un pedido 🍔')}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="primary" fullWidth size="lg" className="bg-green-500 hover:bg-green-600">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    WhatsApp
                  </Button>
                </a>
                <a
                  href={`https://instagram.com/${restaurantSettings.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary" fullWidth size="lg">
                    <Instagram className="w-5 h-5 mr-2" />
                    Instagram
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Map Section (Placeholder) */}
        <section className="bg-gray-100 py-16">
          <div className="container-app">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="heading-3 text-gray-900 mb-2">Encuéntranos</h2>
              <p className="text-gray-600">{restaurantSettings.address}</p>
            </motion.div>
            
            <div className="aspect-video bg-gray-200 rounded-2xl overflow-hidden flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Mapa de ubicación</p>
                <p className="text-sm text-gray-400 mt-2">
                  Integra Google Maps aquí
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
