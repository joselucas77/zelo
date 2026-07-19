import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product, Client, Sale } from "@/types";
import { mockProducts } from "@/mocks/products";
import { mockClients } from "@/mocks/clients";
import { mockSales } from "@/mocks/sales";

interface DataState {
  products: Product[];
  clients: Client[];
  sales: Sale[];
  setProducts: (p: Product[]) => void;
  setClients: (c: Client[]) => void;
  setSales: (s: Sale[]) => void;
  reset: () => void;
}

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      products: mockProducts,
      clients: mockClients,
      sales: mockSales,
      setProducts: (p) => set({ products: p }),
      setClients: (c) => set({ clients: c }),
      setSales: (s) => set({ sales: s }),
      reset: () =>
        set({ products: mockProducts, clients: mockClients, sales: mockSales }),
    }),
    {
      name: "revenda-data-v1",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : (undefined as unknown as Storage),
      ),
      skipHydration: true,
    },
  ),
);

if (typeof window !== "undefined") {
  // Rehydrate on the client after hydration
  void useDataStore.persist.rehydrate();
}
