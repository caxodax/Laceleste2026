import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TableState {
  currentTable: number | null;
  tableId: string | null;
  customerName: string | null;
  customerIdCard: string | null;
  isOrderingAtTable: boolean;
  setTable: (tableNumber: number | null, tableId?: string | null) => void;
  setCustomerInfo: (name: string, idCard: string) => void;
  clearTable: () => void;
}

export const useTableStore = create<TableState>()(
  persist(
    (set) => ({
      currentTable: null,
      tableId: null,
      customerName: null,
      customerIdCard: null,
      isOrderingAtTable: false,
      setTable: (tableNumber, tableId = null) => 
        set({ 
          currentTable: tableNumber, 
          tableId: tableId, 
          isOrderingAtTable: tableNumber !== null 
        }),
      setCustomerInfo: (name, idCard) => set({ customerName: name, customerIdCard: idCard }),
      clearTable: () => set({ 
        currentTable: null, 
        tableId: null, 
        customerName: null, 
        customerIdCard: null, 
        isOrderingAtTable: false 
      }),
    }),
    {
      name: 'la-celeste-table-storage',
    }
  )
);
