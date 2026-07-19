import type { Sale } from "@/types";
import { useDataStore } from "@/store/useDataStore";
import { productsService } from "./products.service";

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));
const uid = () => "s_" + Math.random().toString(36).slice(2, 10);

export const salesService = {
  async list(): Promise<Sale[]> {
    await delay();
    return useDataStore.getState().sales;
  },
  async create(
    data: Omit<Sale, "id" | "date"> & { date?: string },
  ): Promise<Sale> {
    await delay();
    const sale: Sale = {
      ...data,
      id: uid(),
      date: data.date ?? new Date().toISOString(),
    };
    const list = useDataStore.getState().sales;
    useDataStore.getState().setSales([sale, ...list]);
    await productsService.decreaseStockBulk(
      sale.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    );
    return sale;
  },
  async markPaid(id: string): Promise<void> {
    await delay();
    const list = useDataStore.getState().sales;
    useDataStore
      .getState()
      .setSales(
        list.map((s) => (s.id === id ? { ...s, status: "paid" as const } : s)),
      );
  },
};
