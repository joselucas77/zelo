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

export type PaymentMethod =
  | "Dinheiro"
  | "Pix"
  | "Cartão de Crédito"
  | "Cartão de Débito";
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
  Dinheiro: "Dinheiro",
  Pix: "Pix",
  "Cartão de Crédito": "Cartão de Crédito",
  "Cartão de Débito": "Cartão de Débito",
};
