'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  animated?: boolean;
}

const variants = {
  primary: 'bg-gradient-to-r from-celeste-500 to-celeste-600 text-white shadow-lg hover:shadow-glow hover:from-celeste-600 hover:to-celeste-700',
  secondary: 'bg-white text-celeste-600 border-2 border-celeste-500 hover:bg-celeste-50',
  gold: 'bg-gradient-to-r from-gold-400 to-gold-500 text-gray-900 shadow-lg hover:shadow-glow-gold hover:from-gold-500 hover:to-gold-600',
  ghost: 'bg-transparent text-celeste-600 hover:bg-celeste-50',
  danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      animated = true,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const buttonContent = (
      <>
        {loading && (
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
        )}
        {!loading && icon && iconPosition === 'left' && (
          <span className="mr-2">{icon}</span>
        )}
        {children}
        {!loading && icon && iconPosition === 'right' && (
          <span className="ml-2">{icon}</span>
        )}
      </>
    );

    const baseClasses = cn(
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
      variants[variant],
      sizes[size],
      fullWidth && 'w-full',
      className
    );

    if (animated && !disabled && !loading) {
      return (
        <motion.button
          ref={ref as any}
          className={baseClasses}
          disabled={disabled || loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          {...(props as HTMLMotionProps<'button'>)}
        >
          {buttonContent}
        </motion.button>
      );
    }

    return (
      <button
        ref={ref}
        className={baseClasses}
        disabled={disabled || loading}
        {...props}
      >
        {buttonContent}
      </button>
    );
  }
);

Button.displayName = 'Button';
