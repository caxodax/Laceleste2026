'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

export function AppInit({ children }: { children: React.ReactNode }) {
  const fetchSettings = useSettingsStore(state => state.fetchSettings);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return <>{children}</>;
}
