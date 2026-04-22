'use client';

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Skeleton } from './Skeleton';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  animated?: boolean;
  delay?: number;
  onClick?: () => void;
}

export function Card({
  children,
  className,
  hover = false,
  animated = false,
  delay = 0,
  onClick,
}: CardProps) {
  const baseClasses = cn(
    'bg-white rounded-2xl shadow-card',
    hover && 'transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 cursor-pointer',
    className
  );

  if (animated) {
    return (
      <motion.div
        className={baseClasses}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClasses} onClick={onClick}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('p-6 border-b border-gray-100', className)}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn('p-6', className)}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('p-6 pt-0', className)}>
      {children}
    </div>
  );
}

// Card especial para productos del menú
interface MenuCardProps {
  image?: string;
  title: string;
  description: string;
  price: number;
  badge?: string;
  onAddToCart?: () => void;
  onClick?: () => void;
  available?: boolean;
}

export function MenuCard({
  image,
  title,
  description,
  price,
  badge,
  onAddToCart,
  onClick,
  available = true,
}: MenuCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  return (
    <motion.div
      onClick={onClick}
      className={cn(
        'card-hover p-4 flex flex-col h-full relative overflow-hidden',
        onClick && 'cursor-pointer',
        !available && 'opacity-60'
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      {/* Badge */}
      {badge && (
        <div className="absolute top-2 right-2 z-10">
          <span className="badge-gold text-xs">{badge}</span>
        </div>
      )}

      {/* Imagen */}
      <div className="relative w-full h-40 mb-4 rounded-xl overflow-hidden bg-gray-100 group">
        {image ? (
          <>
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              onLoadingComplete={() => setIsImageLoading(false)}
            />
            <AnimatePresence>
              {isImageLoading && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 z-10"
                >
                  <Skeleton className="w-full h-full rounded-none" />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🍔
          </div>
        )}
        {!available && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="text-white font-bold text-sm bg-black/50 px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
              No disponible
            </span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 flex-grow mb-3 line-clamp-2">
        {description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto">
        <span className="text-xl font-bold text-celeste-600">
          ${price.toFixed(2)}
        </span>
        {available && onAddToCart && (
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            className="p-2 bg-celeste-500 text-white rounded-lg hover:bg-celeste-600 transition-colors z-30"
            whileTap={{ scale: 0.95 }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// Card de estadísticas para el dashboard
interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'celeste' | 'gold' | 'green' | 'red';
}

export function StatCard({ title, value, icon, trend, color = 'celeste' }: StatCardProps) {
  const colorClasses = {
    celeste: 'from-celeste-400 to-celeste-600',
    gold: 'from-gold-400 to-gold-600',
    green: 'from-green-400 to-green-600',
    red: 'from-red-400 to-red-600',
  };

  return (
    <Card className="p-6" animated>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p
              className={cn(
                'text-sm mt-1',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div
          className={cn(
            'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white',
            colorClasses[color]
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}
