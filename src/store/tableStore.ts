import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TableState {
  currentTable: number | null;
  tableId: string | null;
  isOrderingAtTable: boolean;
  setTable: (tableNumber: number | null, tableId?: string | null) => void;
  clearTable: () => void;
}

export const useTableStore = create<TableState>()(
  persist(
    (set) => ({
      currentTable: null,
      tableId: null,
      isOrderingAtTable: false,
      setTable: (tableNumber, tableId = null) => 
        set({ 
          currentTable: tableNumber, 
          tableId: tableId, 
          isOrderingAtTable: tableNumber !== null 
        }),
      clearTable: () => set({ currentTable: null, tableId: null, isOrderingAtTable: false }),
    }),
    {
      name: 'la-celeste-table-storage',
    }
  )
);
