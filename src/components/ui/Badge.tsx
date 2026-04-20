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
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
}

const statusConfig = {
  pending: { label: 'Pendiente', variant: 'warning' as const },
  confirmed: { label: 'Confirmado', variant: 'celeste' as const },
  preparing: { label: 'Preparando', variant: 'gold' as const },
  ready: { label: 'Listo', variant: 'success' as const },
  delivered: { label: 'Entregado', variant: 'success' as const },
  cancelled: { label: 'Cancelado', variant: 'danger' as const },
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant}>
      <span className={cn('w-2 h-2 rounded-full mr-2', {
        'bg-yellow-500': status === 'pending',
        'bg-celeste-500': status === 'confirmed',
        'bg-gold-500': status === 'preparing',
        'bg-green-500': status === 'ready' || status === 'delivered',
        'bg-red-500': status === 'cancelled',
      })} />
      {config.label}
    </Badge>
  );
}

// Badge para estados de facturas
interface InvoiceStatusBadgeProps {
  status: 'draft' | 'issued' | 'paid' | 'cancelled';
}

const invoiceStatusConfig = {
  draft: { label: 'Borrador', variant: 'gray' as const },
  issued: { label: 'Emitida', variant: 'celeste' as const },
  paid: { label: 'Pagada', variant: 'success' as const },
  cancelled: { label: 'Anulada', variant: 'danger' as const },
};

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const config = invoiceStatusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
