import type { Sale, PaymentMethod, SaleStatus } from "@/types";

const methods: PaymentMethod[] = ["cash", "pix", "credit", "debit"];
const statuses: SaleStatus[] = ["paid", "paid", "paid", "pending"];

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function daysAhead(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

// 30 vendas mockadas
export const mockSales: Sale[] = Array.from({ length: 30 }).map((_, i) => {
  const clientIdx = (i % 15) + 1;
  const status = statuses[i % statuses.length]!;
  const method = methods[i % methods.length]!;
  const itemsCount = (i % 3) + 1;
  const items = Array.from({ length: itemsCount }).map((__, j) => {
    const pid = ((i * 3 + j) % 20) + 1;
    const qty = (j % 2) + 1;
    const unitPrice = [
      89.9, 149.9, 39.9, 45.9, 34.9, 59.9, 22.9, 42.9, 79.9, 26.9,
    ][(i + j) % 10]!;
    return {
      productId: `p${pid}`,
      productName: `Produto ${pid}`,
      quantity: qty,
      unitPrice,
    };
  });
  const total = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
  return {
    id: `s${i + 1}`,
    clientId: `c${clientIdx}`,
    clientName: `Cliente ${clientIdx}`,
    date: daysAgo(i),
    items,
    total: Math.round(total * 100) / 100,
    paymentMethod: method,
    status,
    dueDate: status === "pending" ? daysAhead(7) : undefined,
    notes: "",
  };
});
