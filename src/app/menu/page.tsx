import { Metadata } from 'next';
import MenuContent from '@/components/menu/MenuContent';

export const metadata: Metadata = {
  title: 'Nuestro Menú | Hamburguesas, Tequeños y Más',
  description: 'Explora el menú de La Celeste. Hamburguesas artesanales, tequeños venezolanos, combos y postres. ¡Haz tu pedido por WhatsApp hoy mismo!',
};

export default function MenuPage() {
  return <MenuContent />;
}
