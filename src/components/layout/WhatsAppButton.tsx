'use client';

import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { restaurantSettings } from '@/data/menu';
import { getWhatsAppLink } from '@/lib/utils';

export function WhatsAppButton() {
  const message = '¡Hola! 👋 Me gustaría hacer un pedido en La Celeste 🍔';
  const whatsappLink = getWhatsAppLink(restaurantSettings.whatsapp, message);

  return (
    <motion.a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fab-whatsapp group"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <MessageCircle className="w-6 h-6" />
      
      {/* Tooltip */}
      <span className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        ¡Escríbenos por WhatsApp!
      </span>
      
      {/* Pulse animation */}
      <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25" />
    </motion.a>
  );
}
