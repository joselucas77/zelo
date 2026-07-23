"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDataStore } from "@/store/useDataStore";
import { useCartStore } from "@/store/useCartStore";
import { salesService } from "@/services/sales.service";
import { currency, initials } from "@/lib/format";
import type { PaymentMethod, SaleStatus } from "@/types";
import { PAYMENT_LABELS } from "@/types";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ProductThumb } from "@/components/product-thumb";

export default function NovaVenda() {
  const router = useRouter();
  const clients = useDataStore((s) => s.clients);
  const products = useDataStore((s) => s.products);
  const {
    client,
    items,
    step,
    payment,
    status,
    dueDate,
    notes,
    setClient,
    addProduct,
    updateQty,
    removeItem,
    setStep,
    setPayment,
    setStatus,
    setDueDate,
    setNotes,
    clear,
  } = useCartStore();

  const [clientPicker, setClientPicker] = useState(false);
  const [productPicker, setProductPicker] = useState(false);
  const checkout = step === "review" || step === "payment";
  const checkoutStep = step === "payment" ? "payment" : "review";

  const total = useMemo(
    () => items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
    [items],
  );

  const canCheckout = client && items.length > 0;

  const finalize = async () => {
    if (!client) return;
    await salesService.create({
      clientId: client.id,
      clientName: client.name,
      items,
      total,
      paymentMethod: payment,
      status,
      dueDate: status === "pending" ? dueDate || undefined : undefined,
      notes,
    });
    toast.success("Venda registrada!");
    clear();
    router.push("/historico");
  };

  return (
    <div className="w-full px-4">
      <Card
        className="mb-3 cursor-pointer border-border/70 transition hover:border-primary/40"
        onClick={() => setClientPicker(true)}
      >
        <CardContent className="flex items-center gap-3 p-3">
          {client ? (
            <>
              <Avatar className="h-11 w-11">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {initials(client.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {client.name}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {client.whatsapp || client.phone}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setClient(null);
                }}
              >
                Trocar
              </Button>
            </>
          ) : (
            <>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <User className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">Selecionar cliente</div>
                <div className="text-xs text-muted-foreground">
                  Toque para escolher
                </div>
              </div>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </>
          )}
        </CardContent>
      </Card>

      {/* Add produto button */}
      <Button
        onClick={() => setProductPicker(true)}
        variant="outline"
        className="mb-4 h-12 w-full justify-start rounded-xl border-dashed"
      >
        <Plus className="mr-2 h-4 w-4" /> Adicionar produto
      </Button>

      {/* Cart */}
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Nenhum produto no carrinho.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <Card key={it.productId} className="border-border/70">
              <CardContent className="flex items-center gap-3 p-3">
                <ProductThumb name={it.productName} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {it.productName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {currency(it.unitPrice)} un
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => updateQty(it.productId, it.quantity - 1)}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <div className="w-7 text-center text-sm font-medium tabular-nums">
                    {it.quantity}
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => updateQty(it.productId, it.quantity + 1)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeItem(it.productId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary bar */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-background/95 backdrop-blur-lg md:sticky md:bottom-0 md:left-64 md:mt-6 md:rounded-2xl md:border md:bg-card md:shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div>
            <div className="text-xs text-muted-foreground">
              {items.length} item{items.length === 1 ? "" : "s"}
            </div>
            <div className="text-lg font-semibold tabular-nums">
              {currency(total)}
            </div>
          </div>
          <Button
            disabled={!canCheckout}
            onClick={() => setStep("review")}
            size="lg"
            className="rounded-full"
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> Finalizar
          </Button>
        </div>
      </div>

      {/* Client picker */}
      <ClientPicker
        open={clientPicker}
        onClose={() => setClientPicker(false)}
        onPick={(c) => {
          setClient(c);
          setClientPicker(false);
        }}
        clients={clients}
      />

      {/* Product picker */}
      <ProductPicker
        open={productPicker}
        onClose={() => setProductPicker(false)}
        products={products}
        onPick={(p) => {
          addProduct(p);
          toast.success(`${p.name} adicionado`);
        }}
      />

      {/* Checkout */}
      <Drawer
        open={checkout}
        onOpenChange={(o) => {
          if (!o) setStep("cart");
        }}
      >
        <DrawerContent className="h-screen">
          <DrawerHeader>
            <DrawerTitle>
              {checkoutStep === "review" ? "Revisar carrinho" : "Pagamento"}
            </DrawerTitle>
          </DrawerHeader>
          <div className="max-h-[70vh] overflow-y-auto px-4 pb-6">
            <div className="mb-3 rounded-xl border border-border bg-card p-3 text-sm">
              <div className="font-medium">{client?.name}</div>
              <div className="text-xs text-muted-foreground">
                {items.length} item{items.length === 1 ? "" : "s"} ·{" "}
                {currency(total)}
              </div>
            </div>

            {checkoutStep === "review" ? (
              <>
                {items.length === 0 ? (
                  <div className="mb-4 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    Carrinho vazio.
                  </div>
                ) : (
                  <div className="mb-4 space-y-2">
                    {items.map((it) => (
                      <div
                        key={it.productId}
                        className="flex items-center gap-2 rounded-xl border border-border/70 p-2.5"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">
                            {it.productName}
                          </div>
                          <div className="text-xs text-muted-foreground tabular-nums">
                            {currency(it.unitPrice)} ·{" "}
                            {currency(it.unitPrice * it.quantity)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQty(it.productId, it.quantity - 1)
                            }
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <div className="w-7 text-center text-sm font-medium tabular-nums">
                            {it.quantity}
                          </div>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQty(it.productId, it.quantity + 1)
                            }
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeItem(it.productId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  onClick={() => setStep("payment")}
                  size="lg"
                  className="w-full rounded-full"
                  disabled={items.length === 0}
                >
                  Avançar para pagamento · {currency(total)}
                </Button>
              </>
            ) : (
              <>
                <div className="mb-3 space-y-1">
                  {items.map((it) => (
                    <div
                      key={it.productId}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="min-w-0 truncate pr-2">
                        {it.quantity}× {it.productName}
                      </div>
                      <div className="font-medium tabular-nums">
                        {currency(it.unitPrice * it.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-3">
                  <Label>Forma de pagamento</Label>
                  <Select
                    value={payment}
                    onValueChange={(v) => setPayment(v as PaymentMethod)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PAYMENT_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mb-3">
                  <Label>Status</Label>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    {(["paid", "pending"] as SaleStatus[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(s)}
                        className={cn(
                          "rounded-xl border px-3 py-2 text-sm font-medium transition",
                          status === s
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground",
                        )}
                      >
                        {s === "paid" ? "Pago" : "Pendente"}
                      </button>
                    ))}
                  </div>
                </div>

                {status === "pending" && (
                  <div className="mb-3 space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
                    <div className="text-sm text-amber-700">
                      Valor pendente:{" "}
                      <span className="font-semibold">{currency(total)}</span>
                    </div>
                    <div>
                      <Label>Data prevista</Label>
                      <Input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <Label>Observações</Label>
                  <Textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full"
                    onClick={() => setStep("review")}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={finalize}
                    size="lg"
                    className="flex-1 rounded-full"
                  >
                    <Check className="mr-2 h-4 w-4" /> Confirmar ·{" "}
                    {currency(total)}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function ClientPicker({
  open,
  onClose,
  clients,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  clients: import("@/types").Client[];
  onPick: (c: import("@/types").Client) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t
      ? clients.filter((c) => c.name.toLowerCase().includes(t))
      : clients;
  }, [q, clients]);
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="h-screen">
        <DrawerHeader className="flex-row items-center gap-2">
          <Button size="icon" variant="ghost" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <DrawerTitle>Escolher cliente</DrawerTitle>
        </DrawerHeader>
        <div className="flex min-h-0 flex-1 flex-col px-4 pb-4">
          <div className="relative shrink-0 mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar..."
              className="rounded-xl pl-9"
            />
          </div>
          <div className="min-h-0 flex-1">
            <ScrollArea className="h-full">
              <div className="space-y-1 pr-2">
                {filtered.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onPick(c)}
                    className="flex w-full items-center gap-3 rounded-xl border border-border/60 p-2.5 text-left transition hover:border-primary/40 hover:bg-accent"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {initials(c.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {c.name}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {c.whatsapp}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function ProductPicker({
  open,
  onClose,
  products,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  products: import("@/types").Product[];
  onPick: (p: import("@/types").Product) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t
      ? products.filter(
          (p) =>
            p.name.toLowerCase().includes(t) ||
            p.category.toLowerCase().includes(t),
        )
      : products;
  }, [q, products]);
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="h-screen">
        <DrawerHeader className="flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DrawerTitle>Produtos</DrawerTitle>
          </div>
          <Button size="sm" onClick={onClose}>
            Concluir
          </Button>
        </DrawerHeader>
        <div className="flex min-h-0 flex-1 flex-col px-4 pb-4">
          <div className="relative shrink-0 mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar..."
              className="rounded-xl pl-9"
            />
          </div>
          <div className="min-h-0 flex-1">
            <ScrollArea className="h-full">
              <div className="space-y-1 pr-2">
                {filtered.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onPick(p)}
                    disabled={p.stock <= 0}
                    className="flex w-full items-center gap-3 rounded-xl border border-border/60 p-2.5 text-left transition hover:border-primary/40 hover:bg-accent disabled:opacity-50"
                  >
                    <ProductThumb name={p.name} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {p.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {p.stock} em estoque
                      </div>
                    </div>
                    <div className="text-sm font-semibold tabular-nums">
                      {currency(p.salePrice)}
                    </div>
                    {p.stock <= 0 && <Badge variant="outline">Esgotado</Badge>}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
