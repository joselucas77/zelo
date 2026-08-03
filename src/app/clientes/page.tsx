"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Pencil } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
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
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"; // Importação do Drawer
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area"; // Importação do ScrollArea
import { clientsService } from "@/services/clients.service";
import { useDataStore } from "@/store/useDataStore";
import { useIsMobile } from "@/hooks/use-mobile"; // Importação do Hook
import { currency, dateTime } from "@/lib/format";
import type { Client } from "@/types";
import { getClientColumns, type ClientTableData } from "./columns";
import { ClientsDataTable } from "./data-table";

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

  const [editing, setEditing] = useState<Client | null>(null);
  const [creating, setCreating] = useState(false);
  const [detail, setDetail] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState<Client | null>(null);

  // 1. Enriquece os dados do cliente com as estatísticas para mandar pra tabela
  const enrichedClients = useMemo<ClientTableData[]>(() => {
    return clients.map((c) => {
      const clientSales = sales.filter((s) => s.clientId === c.id);
      return {
        ...c,
        totalSpent: clientSales.reduce((sum, s) => sum + s.total, 0),
        pendingAmount: clientSales
          .filter((s) => s.status === "pending")
          .reduce((sum, s) => sum + s.total, 0),
      };
    });
  }, [clients, sales]);

  const columns = useMemo(
    () =>
      getClientColumns({
        onView: setDetail,
        onEdit: setEditing,
        onDelete: setDeleting,
      }),
    [],
  );

  return (
    <div className="w-full px-4">
      <ClientsDataTable
        columns={columns}
        data={enrichedClients}
        onCreateClick={() => setCreating(true)}
      />

      {/* Formulário (Usando o truque do Key para resetar o estado) */}
      <ClientForm
        key={editing?.id ?? "new"}
        open={creating || !!editing}
        onOpenChange={(o) => {
          if (!o) {
            setCreating(false);
            setEditing(null);
          }
        }}
        initial={editing ?? empty}
        isEdit={!!editing}
        onSubmit={async (data) => {
          if (editing) {
            await clientsService.update(editing.id, data);
            toast.success("Cliente atualizado");
          } else {
            await clientsService.create(data);
            toast.success("Cliente cadastrado");
          }
          setCreating(false);
          setEditing(null);
        }}
      />

      {/* Detalhes */}
      <ClientDetail
        client={detail}
        sales={sales}
        onClose={() => setDetail(null)}
        onEdit={(c) => {
          setDetail(null);
          setEditing(c);
        }}
      />

      {/* Exclusão (Fora do Sheet/Drawer para evitar bugs de foco do Radix) */}
      <DeleteClient client={deleting} onClose={() => setDeleting(null)} />
    </div>
  );
}

// --- COMPONENTES SECUNDÁRIOS ---

function ClientForm({
  open,
  onOpenChange,
  initial,
  isEdit,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial: Omit<Client, "id">;
  isEdit: boolean;
  onSubmit: (data: Omit<Client, "id">) => Promise<void>;
}) {
  const isMobile = useIsMobile();
  const [form, setForm] = useState(initial);

  const update = (k: keyof Omit<Client, "id">, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  // 1. Extrair os campos do formulário
  const FormFields = (
    <div className="space-y-3">
      <div className="sm:col-span-2 space-y-2">
        <Label>Nome</Label>
        <Input
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </div>
      <div className="sm:col-span-2 space-y-2">
        <Label>Telefone</Label>
        <Input
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
        />
      </div>
      <div className="sm:col-span-2 space-y-2">
        <Label>WhatsApp</Label>
        <Input
          value={form.whatsapp}
          onChange={(e) => update("whatsapp", e.target.value)}
        />
      </div>
      <div className="sm:col-span-2 space-y-2">
        <Label>Endereço</Label>
        <Input
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
        />
      </div>
      <div className="sm:col-span-2 space-y-2">
        <Label>Observações</Label>
        <Textarea
          rows={2}
          value={form.notes ?? ""}
          onChange={(e) => update("notes", e.target.value)}
        />
      </div>
    </div>
  );

  // 2. Extrair os botões de ação
  const ActionButtons = (
    <div className="flex w-full justify-between gap-2">
      <Button variant="outline" onClick={() => onOpenChange(false)}>
        Cancelar
      </Button>
      <Button
        disabled={!form.name.trim()}
        onClick={async () => await onSubmit(form)}
      >
        {isEdit ? "Salvar" : "Cadastrar"}
      </Button>
    </div>
  );

  // 3. Renderização Mobile (Drawer Bottom)
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-screen">
          <DrawerHeader className="shrink-0 px-4">
            <DrawerTitle>
              {isEdit ? "Editar cliente" : "Novo cliente"}
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex min-h-0 flex-1 flex-col px-4 pb-6">
            <ScrollArea className="flex-1 **:data-radix-scroll-area-thumb:hidden">
              {FormFields}
            </ScrollArea>
            <div className="shrink-0 pt-4 border-t border-border">
              {ActionButtons}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // 4. Renderização Desktop (Modal Padrão)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar cliente" : "Novo cliente"}
          </DialogTitle>
        </DialogHeader>
        {FormFields}
        <DialogFooter>{ActionButtons}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ClientDetail({
  client,
  sales,
  onClose,
  onEdit,
}: {
  client: Client | null;
  sales: import("@/types").Sale[];
  onClose: () => void;
  onEdit: (c: Client) => void;
}) {
  const isMobile = useIsMobile();

  if (!client) return null;

  const clientSales = sales
    .filter((s) => s.clientId === client.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const total = clientSales.reduce((s, v) => s + v.total, 0);
  const pending = clientSales
    .filter((s) => s.status === "pending")
    .reduce((s, v) => s + v.total, 0);
  const last = clientSales[0]?.date;

  // Conteúdo compartilhado entre Desktop e Mobile
  const DetailContent = (
    <div className="space-y-4 pb-4">
      <div className="rounded-xl border border-border bg-card p-3 text-sm">
        <div>
          <span className="text-muted-foreground">Telefone:</span>{" "}
          {client.phone}
        </div>
        <div>
          <span className="text-muted-foreground">WhatsApp:</span>{" "}
          {client.whatsapp}
        </div>
        <div>
          <span className="text-muted-foreground">Endereço:</span>{" "}
          {client.address || "—"}
        </div>
        {client.notes && (
          <div className="mt-2 text-xs text-muted-foreground">
            {client.notes}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <MiniStat label="Total" value={currency(total)} />
        <MiniStat
          label="Pendente"
          value={currency(pending)}
          tone={pending > 0 ? "warn" : "default"}
        />
        <MiniStat
          label="Última"
          value={last ? dateTime(last).split(",")[0]! : "—"}
        />
      </div>

      <Separator />

      <div>
        <h4 className="mb-2 text-xs font-semibold text-muted-foreground">
          Histórico
        </h4>
        {clientSales.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Nenhuma compra ainda.
          </div>
        ) : (
          <div className="space-y-1">
            {clientSales.slice(0, 8).map((v) => (
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
                    variant={v.status === "paid" ? "secondary" : "outline"}
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
        )}
      </div>
    </div>
  );

  // Botões fixos no rodapé
  const FooterButtons = (
    <div className="shrink-0 pt-4 border-t border-border flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        render={
          <Link
            href={`https://wa.me/${client.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle className="mr-1 h-4 w-4" /> WhatsApp
          </Link>
        }
      ></Button>
      <Button size="sm" variant="outline" onClick={() => onEdit(client)}>
        <Pencil className="mr-1 h-4 w-4" /> Editar
      </Button>
    </div>
  );

  // Renderização Mobile (Drawer Bottom)
  if (isMobile) {
    return (
      <Drawer open={!!client} onOpenChange={(o) => !o && onClose()}>
        <DrawerContent className="h-screen">
          <DrawerHeader className="shrink-0 px-4">
            <DrawerTitle>{client.name}</DrawerTitle>
          </DrawerHeader>
          <div className="flex min-h-0 flex-1 flex-col px-4 pb-6 overflow-hidden">
            <ScrollArea className="flex-1 **:data-radix-scroll-area-thumb:hidden">
              {DetailContent}
            </ScrollArea>
            {FooterButtons}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Renderização Desktop (Sheet Lateral Padrão)
  return (
    <Sheet open={!!client} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{client.name}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 px-4 pb-6">
          {DetailContent}
          <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              render={
                <Link
                  href={`https://wa.me/${client.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="mr-1 h-4 w-4" /> WhatsApp
                </Link>
              }
            ></Button>
            <Button size="sm" variant="outline" onClick={() => onEdit(client)}>
              <Pencil className="mr-1 h-4 w-4" /> Editar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DeleteClient({
  client,
  onClose,
}: {
  client: Client | null;
  onClose: () => void;
}) {
  return (
    <AlertDialog open={!!client} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
          <AlertDialogDescription>
            &quot;{client?.name}&quot; será removido permanentemente. Esta ação
            não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              if (!client) return;
              await clientsService.remove(client.id);
              toast.success("Cliente removido");
              onClose();
            }}
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
