'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart, User, Instagram, Phone } from 'lucide-react';
import { Logo } from '@/components/ui';
import { useCartStore } from '@/store/cartStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
export function Header() {
  const info = useSettingsStore(state => state.info);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/nosotros', label: 'Nosotros' },
    { href: '/menu', label: 'Menú' },
    { href: '/pedido', label: 'Hacer Pedido' },
    { href: '/contacto', label: 'Contacto' },
  ];

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-lg py-2'
            : 'bg-transparent py-4'
        )}
      >
        <div className="container-app">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/">
              <Logo size="sm" animated={false} />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'font-medium transition-colors',
                    isScrolled
                      ? 'text-gray-700 hover:text-celeste-600'
                      : 'text-gray-800 hover:text-celeste-500'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Social Links */}
              {info?.instagram && (
                <a
                  href={`https://instagram.com/${info.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex p-2 text-gray-600 hover:text-pink-500 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}

              {/* Cart */}
              <Link
                href="/carrito"
                className="relative p-2 text-gray-600 hover:text-celeste-600 transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="cart-badge"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </Link>

              {/* Admin/Login */}
              {user ? (
                <Link
                  href="/admin"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-celeste-500 text-white rounded-lg hover:bg-celeste-600 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Admin</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="hidden sm:flex p-2 text-gray-600 hover:text-celeste-600 transition-colors"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-16 z-40 md:hidden"
          >
            <div className="bg-white shadow-xl rounded-b-2xl mx-4 overflow-hidden">
              <nav className="py-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-6 py-3 text-gray-700 hover:bg-celeste-50 hover:text-celeste-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <hr className="my-2" />
                {info?.instagram && (
                  <a
                    href={`https://instagram.com/${info.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-celeste-50"
                  >
                    <Instagram className="w-5 h-5 text-pink-500" />
                    Instagram
                  </a>
                )}
                {info?.phone && (
                  <a
                    href={`tel:${info.phone}`}
                    className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-celeste-50"
                  >
                    <Phone className="w-5 h-5 text-celeste-500" />
                    {info.phone}
                  </a>
                )}
                {!user && (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-celeste-50"
                  >
                    <User className="w-5 h-5" />
                    Iniciar Sesión
                  </Link>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
