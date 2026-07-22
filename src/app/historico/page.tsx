"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useDataStore } from "@/store/useDataStore";
import { currency, dateTime, initials } from "@/lib/format";
import { PAYMENT_LABELS, type Sale } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function HistoricoPage() {
  const sales = useDataStore((s) => s.sales);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all");
  const [detail, setDetail] = useState<Sale | null>(null);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return sales.filter((s) => {
      if (filter !== "all" && s.status !== filter) return false;
      if (t && !s.clientName.toLowerCase().includes(t)) return false;
      return true;
    });
  }, [q, filter, sales]);

  return (
    <div className="w-full px-4">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por cliente..."
            className="rounded-xl pl-9"
          />
        </div>
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as typeof filter)}
        >
          <TabsList className="rounded-full">
            <TabsTrigger value="all" className="rounded-full">
              Todas
            </TabsTrigger>
            <TabsTrigger value="paid" className="rounded-full">
              Pagas
            </TabsTrigger>
            <TabsTrigger value="pending" className="rounded-full">
              Pendentes
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {list.map((s) => (
          <Card
            key={s.id}
            className="cursor-pointer border-border/70 transition hover:border-primary/40"
            onClick={() => setDetail(s)}
          >
            <CardContent className="flex items-center gap-3 p-3">
              <Avatar className="h-11 w-11">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {initials(s.clientName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {s.clientName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {dateTime(s.date)} · {PAYMENT_LABELS[s.paymentMethod]}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold tabular-nums">
                  {currency(s.total)}
                </div>
                <Badge
                  variant={s.status === "paid" ? "default" : "outline"}
                  className={
                    s.status === "pending"
                      ? "border-amber-500/40 text-amber-700"
                      : ""
                  }
                >
                  {s.status === "paid" ? "Pago" : "Pendente"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
        {list.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Nenhuma venda encontrada.
          </div>
        )}
      </div>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da venda</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-card p-3">
                <div className="text-sm font-medium">{detail.clientName}</div>
                <div className="text-xs text-muted-foreground">
                  {dateTime(detail.date)}
                </div>
              </div>
              <div>
                <h4 className="mb-1 text-xs font-semibold text-muted-foreground">
                  Itens
                </h4>
                <div className="space-y-1">
                  {detail.items.map((it) => (
                    <div
                      key={it.productId}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="min-w-0 truncate pr-2">
                        {it.quantity}× {it.productName}
                      </div>
                      <div className="tabular-nums">
                        {currency(it.unitPrice * it.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="text-lg font-semibold tabular-nums">
                  {currency(detail.total)}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pagamento</span>
                <span>{PAYMENT_LABELS[detail.paymentMethod]}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant={detail.status === "paid" ? "secondary" : "outline"}
                  className={
                    detail.status === "pending"
                      ? "border-amber-500/40 text-amber-700"
                      : ""
                  }
                >
                  {detail.status === "paid" ? "Pago" : "Pendente"}
                </Badge>
              </div>
              {detail.dueDate && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Vencimento</span>
                  <span>
                    {new Date(detail.dueDate).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              )}
              {detail.notes && (
                <div className="rounded-lg bg-muted p-2 text-xs text-muted-foreground">
                  {detail.notes}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
