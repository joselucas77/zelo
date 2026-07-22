"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { clientsService } from "@/services/clients.service";
import { useDataStore } from "@/store/useDataStore";
import { currency, dateTime, initials } from "@/lib/format";
import type { Client } from "@/types";
import Link from "next/link";

const empty: Omit<Client, "id"> = {
  name: "",
  phone: "",
  whatsapp: "",
  address: "",
  notes: "",
};

export default function ClientesPage() {
  const clients = useDataStore((s) => s.clients);
  const sales = useDataStore((s) => s.sales);
  const [q, setQ] = useState("");
  const [form, setForm] = useState<Omit<Client, "id">>(empty);
  const [editing, setEditing] = useState<Client | null>(null);
  const [creating, setCreating] = useState(false);
  const [detail, setDetail] = useState<Client | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.phone.includes(term) ||
        c.whatsapp.includes(term),
    );
  }, [q, clients]);

  const openForm = (c?: Client) => {
    if (c) {
      setEditing(c);
      setForm({
        name: c.name,
        phone: c.phone,
        whatsapp: c.whatsapp,
        address: c.address,
        notes: c.notes ?? "",
      });
    } else {
      setEditing(null);
      setForm(empty);
      setCreating(true);
    }
  };

  const dialogOpen = creating || !!editing;
  const closeDialog = () => {
    setCreating(false);
    setEditing(null);
  };

  const clientStats = (id: string) => {
    const list = sales.filter((s) => s.clientId === id);
    const total = list.reduce((s, v) => s + v.total, 0);
    const pending = list
      .filter((s) => s.status === "pending")
      .reduce((s, v) => s + v.total, 0);
    const last = list[0]?.date;
    return { total, pending, last, list };
  };

  return (
    <div className="w-full px-4">
      <div className="relative mb-4 flex flex-row items-center justify-between gap-2">
        <div className="relative basis-lg">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="rounded-xl pl-9"
          />
        </div>
        <Button size="sm" className="rounded-full" onClick={() => openForm()}>
          <Plus className="mr-1 h-4 w-4" /> Novo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {filtered.map((c) => {
          const s = clientStats(c.id);
          return (
            <Card
              key={c.id}
              className="cursor-pointer border-border/70 transition hover:border-primary/40"
              onClick={() => setDetail(c)}
            >
              <CardContent className="flex items-center gap-3 p-3">
                <Avatar className="h-11 w-11">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {initials(c.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{c.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {c.whatsapp || c.phone}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold tabular-nums">
                    {currency(s.total)}
                  </div>
                  {s.pending > 0 && (
                    <Badge
                      variant="outline"
                      className="mt-1 border-amber-500/40 text-amber-700"
                    >
                      {currency(s.pending)} pendente
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Nenhum cliente encontrado.
          </div>
        )}
      </div>

      {/* Form */}
      <Dialog open={dialogOpen} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar cliente" : "Novo cliente"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nome</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Telefone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>WhatsApp</Label>
                <Input
                  value={form.whatsapp}
                  onChange={(e) =>
                    setForm({ ...form, whatsapp: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Endereço</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea
                rows={2}
                value={form.notes ?? ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button
              disabled={!form.name.trim()}
              onClick={async () => {
                if (editing) {
                  await clientsService.update(editing.id, form);
                  toast.success("Cliente atualizado");
                } else {
                  await clientsService.create(form);
                  toast.success("Cliente cadastrado");
                }
                closeDialog();
              }}
            >
              {editing ? "Salvar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail */}
      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-md"
        >
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle>{detail.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4 px-4 pb-6">
                <div className="rounded-xl border border-border bg-card p-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Telefone:</span>{" "}
                    {detail.phone}
                  </div>
                  <div>
                    <span className="text-muted-foreground">WhatsApp:</span>{" "}
                    {detail.whatsapp}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Endereço:</span>{" "}
                    {detail.address || "—"}
                  </div>
                  {detail.notes && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {detail.notes}
                    </div>
                  )}
                </div>

                {(() => {
                  const s = clientStats(detail.id);
                  return (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        <MiniStat label="Total" value={currency(s.total)} />
                        <MiniStat
                          label="Pendente"
                          value={currency(s.pending)}
                          tone={s.pending > 0 ? "warn" : "default"}
                        />
                        <MiniStat
                          label="Última"
                          value={s.last ? dateTime(s.last).split(",")[0]! : "—"}
                        />
                      </div>
                      <Separator />
                      <div>
                        <h4 className="mb-2 text-xs font-semibold text-muted-foreground">
                          Histórico
                        </h4>
                        {s.list.length === 0 && (
                          <div className="text-sm text-muted-foreground">
                            Nenhuma compra ainda.
                          </div>
                        )}
                        <div className="space-y-1">
                          {s.list.slice(0, 8).map((v) => (
                            <div
                              key={v.id}
                              className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm"
                            >
                              <div className="text-xs text-muted-foreground">
                                {dateTime(v.date)}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold tabular-nums">
                                  {currency(v.total)}
                                </span>
                                <Badge
                                  variant={
                                    v.status === "paid"
                                      ? "secondary"
                                      : "outline"
                                  }
                                  className={
                                    v.status === "pending"
                                      ? "border-amber-500/40 text-amber-700"
                                      : ""
                                  }
                                >
                                  {v.status === "paid" ? "Pago" : "Pendente"}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()}

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    render={
                      <Link
                        href={`https://wa.me/${detail.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle className="mr-1 h-4 w-4" /> WhatsApp
                      </Link>
                    }
                    variant="outline"
                    size="sm"
                  ></Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setDetail(null);
                      openForm(detail);
                    }}
                  >
                    <Pencil className="mr-1 h-4 w-4" /> Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                        >
                          <Trash2 className="mr-1 h-4 w-4" /> Excluir
                        </Button>
                      }
                    ></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            await clientsService.remove(detail.id);
                            toast.success("Cliente removido");
                            setDetail(null);
                          }}
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "warn";
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2">
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-0.5 truncate text-sm font-semibold tabular-nums ${
          tone === "warn" ? "text-amber-600" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
