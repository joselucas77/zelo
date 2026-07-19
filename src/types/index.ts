export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  image?: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  address: string;
  notes?: string;
}

export type PaymentMethod = "cash" | "pix" | "credit" | "debit";
export type SaleStatus = "paid" | "pending";

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Sale {
  id: string;
  clientId: string;
  clientName: string;
  date: string; // ISO
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  dueDate?: string;
  notes?: string;
}

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: "Dinheiro",
  pix: "Pix",
  credit: "Cartão de Crédito",
  debit: "Cartão de Débito",
};
