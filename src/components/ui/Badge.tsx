'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'celeste' | 'gold' | 'success' | 'warning' | 'danger' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variants = {
  celeste: 'bg-celeste-100 text-celeste-700',
  gold: 'bg-gold-100 text-gold-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
  gray: 'bg-gray-100 text-gray-700',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export function Badge({
  children,
  variant = 'celeste',
  size = 'md',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

// Badge para estados de pedidos
interface OrderStatusBadgeProps {
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | 'billing' | 'closed';
}

const statusConfig = {
  pending: { label: 'Pendiente', variant: 'warning' as const },
  confirmed: { label: 'Confirmado', variant: 'celeste' as const },
  preparing: { label: 'Preparando', variant: 'gold' as const },
  ready: { label: 'Listo', variant: 'success' as const },
  delivered: { label: 'Entregado', variant: 'success' as const },
  cancelled: { label: 'Cancelado', variant: 'danger' as const },
  billing: { label: 'Pidiendo Cuenta', variant: 'warning' as const },
  closed: { label: 'Finalizado', variant: 'gray' as const },
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant}>
      <span className={cn('w-2 h-2 rounded-full mr-2', {
        'bg-yellow-500': status === 'pending' || status === 'billing',
        'bg-celeste-500': status === 'confirmed',
        'bg-gold-500': status === 'preparing',
        'bg-green-500': status === 'ready' || status === 'delivered',
        'bg-red-500': status === 'cancelled',
        'bg-gray-500': status === 'closed',
      })} />
      {config.label}
    </Badge>
  );
}

interface DeliveryNoteStatusBadgeProps {
  status: 'draft' | 'issued' | 'paid' | 'cancelled';
}

export function DeliveryNoteStatusBadge({ status }: DeliveryNoteStatusBadgeProps) {
  const configs = {
    draft: { label: 'Borrador', className: 'bg-gray-100 text-gray-600' },
    issued: { label: 'Pendiente', className: 'bg-amber-100 text-amber-600' },
    paid: { label: 'Pagada', className: 'bg-green-100 text-green-600' },
    cancelled: { label: 'Anulada', className: 'bg-red-100 text-red-600' },
  };

  const config = configs[status] || configs.draft;

  return (
    <span className={cn(
      'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
      config.className
    )}>
      {config.label}
    </span>
  );
}
