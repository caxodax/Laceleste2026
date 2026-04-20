'use client';

import Link from 'next/link';
import { Instagram, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Logo } from '@/components/ui';
import { restaurantSettings } from '@/data/menu';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Main Footer */}
      <div className="container-app py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-celeste-400 to-celeste-600 flex items-center justify-center">
                <span className="font-logo text-white text-xl">C</span>
              </div>
              <div>
                <h3 className="font-logo text-2xl text-celeste-400">La Celeste</h3>
                <p className="text-xs text-gray-400">Hamburguesas</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Las mejores hamburguesas artesanales de Barquisimeto. 
              Inspiradas en los sabores de Argentina 🇦🇷
            </p>
            <div className="flex gap-4">
              <a
                href={`https://instagram.com/${restaurantSettings.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-pink-500 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={`https://wa.me/${restaurantSettings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-green-500 transition-colors"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-celeste-400 transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/menu" className="text-gray-400 hover:text-celeste-400 transition-colors">
                  Menú Completo
                </Link>
              </li>
              <li>
                <Link href="/pedido" className="text-gray-400 hover:text-celeste-400 transition-colors">
                  Hacer Pedido
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-gray-400 hover:text-celeste-400 transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-400">
                <Phone className="w-5 h-5 text-celeste-400" />
                <span>{restaurantSettings.phone}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Instagram className="w-5 h-5 text-pink-400" />
                <span>{restaurantSettings.instagram}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-5 h-5 text-red-400" />
                <span>{restaurantSettings.address}</span>
              </li>
            </ul>
          </div>

          {/* Schedule */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Horario</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-3 text-gray-400">
                <Clock className="w-5 h-5 text-gold-400" />
                <span>Martes a Domingo</span>
              </li>
              <li className="text-gray-400 ml-8">5:00 PM - 12:00 AM</li>
              <li className="text-gray-500 ml-8 text-sm">Lunes cerrado</li>
            </ul>
            <div className="mt-4 p-3 bg-celeste-500/20 rounded-lg">
              <p className="text-sm text-celeste-300">
                💬 Pedidos por WhatsApp o Instagram
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="container-app py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © {currentYear} La Celeste. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/terminos" className="text-gray-500 hover:text-gray-300 transition-colors">
                Términos y Condiciones
              </Link>
              <Link href="/privacidad" className="text-gray-500 hover:text-gray-300 transition-colors">
                Privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
