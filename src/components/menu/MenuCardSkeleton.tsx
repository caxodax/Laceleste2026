'use client';

import { Skeleton } from '@/components/ui/Skeleton';

export function MenuCardSkeleton() {
  return (
    <div className="p-4 flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Image Skeleton */}
      <Skeleton className="w-full h-40 mb-4 rounded-xl" />
      
      {/* Title Skeleton */}
      <Skeleton className="h-6 w-3/4 mb-2" />
      
      {/* Description Skeleton */}
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      
      {/* Footer Skeleton */}
      <div className="flex items-center justify-between mt-auto pt-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="w-9 h-9 rounded-lg" />
      </div>
    </div>
  );
}
