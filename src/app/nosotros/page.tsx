import { Metadata } from 'next';
import NosotrosContent from '@/components/nosotros/NosotrosContent';

export const metadata: Metadata = {
  title: 'Sobre Nosotros | Pasión por las Hamburguesas',
  description: 'Conoce la historia de La Celeste. Nuestra pasión por las hamburguesas artesanales y cómo traemos los sabores de Argentina a Barquisimeto.',
};

export default function NosotrosPage() {
  return <NosotrosContent />;
}
