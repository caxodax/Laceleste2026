'use client';

import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = "Buscar en el menú..." }: SearchInputProps) {
  return (
    <div className="relative max-w-2xl mx-auto mb-6 px-4">
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-celeste-500 transition-colors">
          <Search className="w-5 h-5" />
        </div>
        
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-4 bg-white border-2 border-gray-100 rounded-2xl shadow-sm focus:border-celeste-500 focus:ring-4 focus:ring-celeste-50/50 outline-none transition-all text-gray-700 placeholder:text-gray-400"
        />

        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => onChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 -z-10 bg-celeste-400/5 blur-2xl rounded-3xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
    </div>
  );
}
