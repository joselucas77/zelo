"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Minus,
  Plus,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDataStore } from "@/store/useDataStore";
import { useCartStore } from "@/store/useCartStore";
import { salesService } from "@/services/sales.service";
import { currency, initials } from "@/lib/format";
import type { PaymentMethod, SaleStatus } from "@/types";
import { PAYMENT_LABELS } from "@/types";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ProductThumb } from "@/components/product-thumb";

import { ClientPicker } from "@/components/nova-venda/client-picker";
import { ProductPicker } from "@/components/nova-venda/product-picker";

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
    <div className="w-full h-[80vh] flex flex-col px-4">
      <Card
        className="mb-3 min-h-24 cursor-pointer border-border/70 transition hover:border-primary/40"
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

      <div className="mb-4 flex gap-2">
        <Button
          onClick={() => setProductPicker(true)}
          variant="outline"
          className="h-12 flex-1 justify-start rounded-xl border-dashed"
        >
          <Plus className="mr-2 h-4 w-4" /> Adicionar produto
        </Button>
        {items.length > 0 && (
          <Button
            onClick={clear}
            variant="outline"
            size="icon"
            className="h-12 w-12 shrink-0 rounded-xl border-dashed border-destructive/40 text-destructive hover:border-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Nenhum produto no carrinho.
        </div>
      ) : (
        <div className="max-h-[50vh] flex-1">
          <ScrollArea className="h-full **:data-radix-scroll-area-thumb:hidden">
            <div className="space-y-2 p-0.5 pb-4 pr-3">
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
          </ScrollArea>
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

      <ClientPicker
        open={clientPicker}
        onClose={() => setClientPicker(false)}
        onPick={(c) => {
          setClient(c);
          setClientPicker(false);
        }}
        clients={clients}
      />

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
          {/* 1. Header com shrink-0 para nunca encolher */}
          <DrawerHeader className="shrink-0 px-4 md:px-6">
            <DrawerTitle>
              {checkoutStep === "review" ? "Revisar carrinho" : "Pagamento"}
            </DrawerTitle>
          </DrawerHeader>

          {/* 2. Container principal com flex-1 e min-h-0 para o scroll funcionar */}
          <div className="flex min-h-0 flex-1 flex-col px-4 pb-6 md:px-6">
            {/* 3. Card de resumo fixo no topo (shrink-0) */}
            <div className="mb-3 shrink-0 rounded-xl border border-border bg-card p-3 text-sm">
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
                  /* 4. Área de scroll com flex-1 e min-h-0 (igual aos Pickers) */
                  <div className="min-h-0 flex-1 mb-4">
                    <ScrollArea className="h-full **:data-radix-scroll-area-thumb:hidden">
                      <div className="space-y-2 pr-3 pb-4 p-0.5">
                        {items.map((it) => (
                          <Card key={it.productId} className="border-border/70">
                            <CardContent className="flex items-center gap-3 p-3">
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-medium">
                                  {it.productName}
                                </div>
                                <div className="text-xs text-muted-foreground">
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
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
                {/* 5. Botão fixo no fundo (shrink-0) */}
                <div className="shrink-0">
                  <Button
                    onClick={() => setStep("payment")}
                    size="lg"
                    className="w-full rounded-full"
                    disabled={items.length === 0}
                  >
                    Avançar para pagamento · {currency(total)}
                  </Button>
                </div>
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

                <div className="flex gap-2 pb-4 shrink-0 mt-auto">
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
