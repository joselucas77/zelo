"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  PackagePlus,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header, ProductThumb } from "@/components/header";
import { productsService } from "@/services/products.service";
import { useDataStore } from "@/store/useDataStore";
import { currency } from "@/lib/format";
import type { Product } from "@/types";

type FormState = Omit<Product, "id">;
const empty: FormState = {
  name: "",
  category: "",
  description: "",
  costPrice: 0,
  salePrice: 0,
  stock: 0,
  minStock: 0,
  notes: "",
};

export default function ProdutosPage() {
  const products = useDataStore((s) => s.products);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [stockDialog, setStockDialog] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term),
    );
  }, [q, products]);

  return (
    <div className="w-full">
      <Header
        title="Produtos"
        description={`${products.length} itens no catálogo`}
        action={
          <Button
            onClick={() => setCreating(true)}
            size="sm"
            className="rounded-full"
          >
            <Plus className="mr-1 h-4 w-4" /> Novo
          </Button>
        }
      />

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar produto ou categoria..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="rounded-xl pl-9"
        />
      </div>

      <div className="grid grid-cols-1 gap-2">
        {filtered.map((p) => {
          const low = p.stock <= p.minStock;
          return (
            <Card
              key={p.id}
              className="border-border/70 transition hover:border-primary/40"
            >
              <CardContent className="flex items-center gap-3 p-3">
                <ProductThumb name={p.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    {low && (
                      <Badge
                        variant="outline"
                        className="shrink-0 border-amber-500/40 text-amber-700"
                      >
                        <AlertTriangle className="mr-1 h-3 w-3" /> Baixo
                      </Badge>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {p.category} · {p.stock} un
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-sm font-semibold tabular-nums">
                    {currency(p.salePrice)}
                  </div>
                  <div className="mt-1 flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => setStockDialog(p)}
                      aria-label="Entrada de estoque"
                    >
                      <PackagePlus className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => setEditing(p)}
                      aria-label="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <DeleteProduct product={p} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Nenhum produto encontrado.
          </div>
        )}
      </div>

      <ProductForm
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
            await productsService.update(editing.id, data);
            toast.success("Produto atualizado");
          } else {
            await productsService.create(data);
            toast.success("Produto cadastrado");
          }
          setCreating(false);
          setEditing(null);
        }}
      />

      <StockEntry product={stockDialog} onClose={() => setStockDialog(null)} />
    </div>
  );
}

function DeleteProduct({ product }: { product: Product }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        }
      ></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover produto?</AlertDialogTitle>
          <AlertDialogDescription>
            "{product.name}" será removido do catálogo. Esta ação não pode ser
            desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className="flex flex-row justify-between w-full">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await productsService.remove(product.id);
                toast.success("Produto removido");
              }}
            >
              Remover
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ProductForm({
  open,
  onOpenChange,
  initial,
  isEdit,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial: FormState;
  isEdit: boolean;
  onSubmit: (data: FormState) => Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [busy, setBusy] = useState(false);

  // Sync when opening
  useMemo(() => {
    if (open) setForm(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const update = (k: keyof FormState, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar produto" : "Novo produto"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2 flex flex-col gap-2">
            <Label>Nome</Label>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Categoria</Label>
            <Input
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Estoque atual</Label>
            <Input
              type="number"
              value={form.stock}
              onChange={(e) => update("stock", Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Preço de custo</Label>
            <Input
              type="number"
              step="0.01"
              value={form.costPrice}
              onChange={(e) => update("costPrice", Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Preço de venda</Label>
            <Input
              type="number"
              step="0.01"
              value={form.salePrice}
              onChange={(e) => update("salePrice", Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Estoque mínimo</Label>
            <Input
              type="number"
              value={form.minStock}
              onChange={(e) => update("minStock", Number(e.target.value))}
            />
          </div>
          <div className="sm:col-span-2 flex flex-col gap-2">
            <Label>Descrição</Label>
            <Textarea
              rows={2}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2 flex flex-col gap-2">
            <Label>Observações</Label>
            <Textarea
              rows={2}
              value={form.notes ?? ""}
              onChange={(e) => update("notes", e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <div className="flex flex-row justify-between w-full">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              disabled={busy || !form.name.trim()}
              onClick={async () => {
                setBusy(true);
                try {
                  await onSubmit(form);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {isEdit ? "Salvar" : "Cadastrar"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StockEntry({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const [qty, setQty] = useState(1);
  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Entrada de estoque</DialogTitle>
        </DialogHeader>
        {product && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground flex justify-between items-center">
              <span className="font-medium italic">{product.name}</span>
              <span>Atual: {product.stock}</span>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Quantidade a adicionar</Label>
              <Input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <div className="flex flex-row justify-between w-full">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                if (!product || qty <= 0) return;
                await productsService.addStock(product.id, qty);
                toast.success(`+${qty} un adicionados`);
                setQty(1);
                onClose();
              }}
            >
              Adicionar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
