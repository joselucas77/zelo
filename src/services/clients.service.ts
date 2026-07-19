import type { Client } from "@/types";
import { useDataStore } from "@/store/useDataStore";

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));
const uid = () => "c_" + Math.random().toString(36).slice(2, 10);

export const clientsService = {
  async list(): Promise<Client[]> {
    await delay();
    return useDataStore.getState().clients;
  },
  async create(data: Omit<Client, "id">): Promise<Client> {
    await delay();
    const client: Client = { ...data, id: uid() };
    const list = useDataStore.getState().clients;
    useDataStore.getState().setClients([client, ...list]);
    return client;
  },
  async update(id: string, data: Partial<Client>): Promise<Client> {
    await delay();
    const list = useDataStore.getState().clients;
    const next = list.map((c) => (c.id === id ? { ...c, ...data } : c));
    useDataStore.getState().setClients(next);
    return next.find((c) => c.id === id)!;
  },
  async remove(id: string): Promise<void> {
    await delay();
    const list = useDataStore.getState().clients;
    useDataStore.getState().setClients(list.filter((c) => c.id !== id));
  },
};
