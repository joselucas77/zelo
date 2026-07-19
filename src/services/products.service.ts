import type { Product } from "@/types";
import { useDataStore } from "@/store/useDataStore";

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));
const uid = () => "p_" + Math.random().toString(36).slice(2, 10);

export const productsService = {
  async list(): Promise<Product[]> {
    await delay();
    return useDataStore.getState().products;
  },
  async create(data: Omit<Product, "id">): Promise<Product> {
    await delay();
    const product: Product = { ...data, id: uid() };
    const list = useDataStore.getState().products;
    useDataStore.getState().setProducts([product, ...list]);
    return product;
  },
  async update(id: string, data: Partial<Product>): Promise<Product> {
    await delay();
    const list = useDataStore.getState().products;
    const next = list.map((p) => (p.id === id ? { ...p, ...data } : p));
    useDataStore.getState().setProducts(next);
    return next.find((p) => p.id === id)!;
  },
  async remove(id: string): Promise<void> {
    await delay();
    const list = useDataStore.getState().products;
    useDataStore.getState().setProducts(list.filter((p) => p.id !== id));
  },
  async addStock(id: string, qty: number): Promise<void> {
    await delay();
    const list = useDataStore.getState().products;
    useDataStore
      .getState()
      .setProducts(
        list.map((p) => (p.id === id ? { ...p, stock: p.stock + qty } : p)),
      );
  },
  async decreaseStockBulk(items: { productId: string; quantity: number }[]) {
    await delay();
    const list = useDataStore.getState().products;
    const next = list.map((p) => {
      const it = items.find((i) => i.productId === p.id);
      if (!it) return p;
      return { ...p, stock: Math.max(0, p.stock - it.quantity) };
    });
    useDataStore.getState().setProducts(next);
  },
};
