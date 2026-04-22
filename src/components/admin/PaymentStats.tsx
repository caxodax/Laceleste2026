'use client';

import { motion } from 'framer-motion';

interface PaymentStatsProps {
  data: { method: string, count: number }[];
}

const methodColors: Record<string, string> = {
  'zelle': 'bg-purple-500',
  'pago_movil': 'bg-celeste-500',
  'cash': 'bg-green-500',
  'binance': 'bg-yellow-500',
  'efectivo': 'bg-green-500', // Alias for cash
};

const methodLabels: Record<string, string> = {
  'zelle': 'Zelle',
  'pago_movil': 'Pago Móvil',
  'cash': 'Efectivo',
  'binance': 'Binance',
  'efectivo': 'Efectivo',
};

export function PaymentStats({ data }: PaymentStatsProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return (
      <div className="py-8 text-center text-gray-500 italic">
        Sin datos de pagos
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Visual Bar */}
      <div className="h-6 flex w-full rounded-full overflow-hidden shadow-inner bg-gray-100">
        {data.map((item, index) => {
          const width = (item.count / total) * 100;
          const colorClass = methodColors[item.method] || 'bg-gray-400';
          
          return (
            <motion.div
              key={item.method}
              initial={{ width: 0 }}
              animate={{ width: `${width}%` }}
              transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
              className={`${colorClass} h-full border-r border-white/20 last:border-0`}
              title={`${methodLabels[item.method] || item.method}: ${item.count}`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-4">
        {data.map((item) => {
          const percentage = Math.round((item.count / total) * 100);
          const colorClass = methodColors[item.method] || 'bg-gray-400';

          return (
            <div key={item.method} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${colorClass}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {methodLabels[item.method] || item.method}
                </p>
                <p className="text-xs text-gray-500">
                  {item.count} pedidos ({percentage}%)
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
