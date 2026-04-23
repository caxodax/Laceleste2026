'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

export function AppInit({ children }: { children: React.ReactNode }) {
  const fetchSettings = useSettingsStore(state => state.fetchSettings);

  useEffect(() => {
    fetchSettings();

    // Register Service Worker for PWA
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => console.log('SW registered: ', registration),
        (error) => console.log('SW registration failed: ', error)
      );
    }
  }, [fetchSettings]);

  return <>{children}</>;
}
