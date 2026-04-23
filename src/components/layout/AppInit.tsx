'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSettingsStore } from '@/store/settingsStore';
import { useTableStore } from '@/store/tableStore';
import { getTables } from '@/lib/services/tables';

export function AppInit({ children }: { children: React.ReactNode }) {
  const fetchSettings = useSettingsStore(state => state.fetchSettings);
  const searchParams = useSearchParams();
  const setTable = useTableStore(state => state.setTable);

  useEffect(() => {
    fetchSettings();

    // Browser features
    if (typeof window !== 'undefined') {
      // 1. Service Worker for PWA
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW failed', err));
      }

      // 2. Table Detection (?mesa=X)
      const mesaParam = searchParams.get('mesa');
      if (mesaParam) {
        const mesaNum = parseInt(mesaParam);
        if (!isNaN(mesaNum)) {
          // Verify table exists and is active
          getTables().then(tables => {
            const table = tables.find(t => t.number === mesaNum && t.active);
            if (table) {
              setTable(table.number, table.id);
            }
          });
        }
      }
    }
  }, [fetchSettings, searchParams, setTable]);

  return <>{children}</>;
}
