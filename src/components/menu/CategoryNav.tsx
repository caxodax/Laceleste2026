'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Category } from '@/types';
import { cn } from '@/lib/utils';

interface CategoryNavProps {
  categories: Category[];
  activeCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
}

export function CategoryNav({ categories, activeCategory, onCategoryChange }: CategoryNavProps) {
  const [active, setActive] = useState(activeCategory || categories[0]?.id);

  useEffect(() => {
    if (activeCategory) {
      setActive(activeCategory);
    }
  }, [activeCategory]);

  const handleClick = (categoryId: string) => {
    setActive(categoryId);
    onCategoryChange?.(categoryId);
    
    // Scroll to section
    const element = document.getElementById(categoryId);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-lg shadow-sm py-4">
      <div className="container-app">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => handleClick(category.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300',
                active === category.id
                  ? 'bg-celeste-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>{category.icon}</span>
              <span className="font-medium">{category.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
