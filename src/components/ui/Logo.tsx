'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  animated?: boolean;
}

const sizes = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
};

const textSizes = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-4xl',
  xl: 'text-5xl',
};

export function Logo({ size = 'md', showText = true, className, animated = true }: LogoProps) {
  const Wrapper = animated ? motion.div : 'div';
  const animationProps = animated
    ? {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { duration: 0.5, ease: 'easeOut' },
      }
    : {};

  return (
    <Wrapper
      className={cn('flex items-center gap-3', className)}
      {...animationProps}
    >
      {/* Logo Icon - Representación del logo de La Celeste */}
      <div
        className={cn(
          sizes[size],
          'relative rounded-full bg-gradient-to-br from-celeste-400 via-celeste-500 to-celeste-600 shadow-lg flex items-center justify-center overflow-hidden'
        )}
      >
        {/* Estrellas decorativas */}
        <div className="absolute top-1 left-2 text-white/80 text-xs">★</div>
        <div className="absolute top-1 right-2 text-white/80 text-xs">★</div>
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-white/80 text-xs">★</div>
        
        {/* Letra C estilizada */}
        <span className="font-logo text-white text-2xl md:text-3xl font-bold drop-shadow-lg">
          C
        </span>
        
        {/* Efecto de brillo */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/30 rounded-full" />
      </div>

      {/* Texto del logo */}
      {showText && (
        <div className="flex flex-col">
          <span
            className={cn(
              'font-logo tracking-wide leading-none',
              textSizes[size],
              'bg-gradient-to-r from-celeste-500 via-celeste-600 to-celeste-700 bg-clip-text text-transparent'
            )}
          >
            La Celeste
          </span>
          <span className="text-xs text-gray-500 font-medium tracking-widest uppercase">
            Hamburguesas
          </span>
        </div>
      )}
    </Wrapper>
  );
}

export function LogoMini({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'w-8 h-8 rounded-full bg-gradient-to-br from-celeste-400 to-celeste-600 flex items-center justify-center shadow-md',
        className
      )}
    >
      <span className="font-logo text-white text-sm font-bold">C</span>
    </div>
  );
}
