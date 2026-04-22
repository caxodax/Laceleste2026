'use client';

import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';

interface SalesChartProps {
  data: { date: string, amount: number }[];
  height?: number;
}

export function SalesChart({ data, height = 250 }: SalesChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-gray-500 italic">
        Sin datos de ventas para este periodo
      </div>
    );
  }

  const maxAmount = Math.max(...data.map(d => d.amount), 1);
  const chartData = data.slice(-7); // Last 7 days

  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-2 px-2" style={{ height: `${height}px` }}>
        {chartData.map((day, index) => {
          const barHeight = (day.amount / maxAmount) * 100;
          const date = new Date(day.date + 'T00:00:00');
          const dayLabel = date.toLocaleDateString('es', { weekday: 'short' });

          return (
            <div key={day.date} className="flex-1 flex flex-col items-center group relative h-full justify-end">
              {/* Tooltip */}
              <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform origin-bottom bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-xl z-10 whitespace-nowrap">
                {formatCurrency(day.amount)}
              </div>

              {/* Bar */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${barHeight}%` }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                className="w-full max-w-[40px] bg-gradient-to-t from-celeste-500 to-celeste-400 rounded-t-lg group-hover:from-celeste-600 group-hover:to-celeste-500 transition-all duration-300 shadow-md group-hover:shadow-glow-blue"
              />

              {/* Label */}
              <span className="text-[10px] sm:text-xs font-medium text-gray-500 mt-2 capitalize">
                {dayLabel}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Grid line (0) */}
      <div className="w-full h-px bg-gray-200 mt-1" />
    </div>
  );
}
