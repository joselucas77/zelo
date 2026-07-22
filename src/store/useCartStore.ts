import { create } from "zustand";
import type { Product, Client, SaleItem } from "@/types";

interface CartState {
  client: Client | null;
  items: SaleItem[];
  setClient: (c: Client | null) => void;
  addProduct: (p: Product, qty?: number) => void;
  updateQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  client: null,
  items: [],
  setClient: (c) => set({ client: c }),
  addProduct: (p, qty = 1) =>
    set((s) => {
      const existing = s.items.find((it) => it.productId === p.id);
      if (existing) {
        return {
          items: s.items.map((it) =>
            it.productId === p.id ? { ...it, quantity: it.quantity + qty } : it,
          ),
        };
      }
      return {
        items: [
          ...s.items,
          {
            productId: p.id,
            productName: p.name,
            quantity: qty,
            unitPrice: p.salePrice,
          },
        ],
      };
    }),
  updateQty: (productId, qty) =>
    set((s) => ({
      items:
        qty <= 0
          ? s.items.filter((it) => it.productId !== productId)
          : s.items.map((it) =>
              it.productId === productId ? { ...it, quantity: qty } : it,
            ),
    })),
  removeItem: (productId) =>
    set((s) => ({ items: s.items.filter((it) => it.productId !== productId) })),
  clear: () => set({ client: null, items: [] }),
}));
