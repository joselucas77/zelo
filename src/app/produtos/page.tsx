"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getProductColumns } from "./columns";
import { ProductsDataTable } from "./data-table";
import { productsService } from "@/services/products.service";
import { useDataStore } from "@/store/useDataStore";
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
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [stockDialog, setStockDialog] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products],
  );

  const columns = useMemo(
    () =>
      getProductColumns({
        onStock: setStockDialog,
        onEdit: setEditing,
        onDelete: setDeleting,
      }),
    [],
  );

  return (
    <div className="w-full px-4">
      <ProductsDataTable
        columns={columns}
        data={products}
        categories={categories}
        onCreateClick={() => setCreating(true)} // NOVA PROP AQUI
      />

      {/* MILAGRE DO KEY: Quando o editing muda, o React recria o componente, 
          limpando o estado do formulário automaticamente! */}
      <ProductForm
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
      <DeleteProduct product={deleting} onClose={() => setDeleting(null)} />
    </div>
  );
}

function DeleteProduct({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  return (
    <AlertDialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover produto?</AlertDialogTitle>
          <AlertDialogDescription>
            "{product?.name}" será removido do catálogo. Esta ação não pode ser
            desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              if (!product) return;
              await productsService.remove(product.id);
              toast.success("Produto removido");
              onClose();
            }}
          >
            Remover
          </AlertDialogAction>
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

  // REMOVIDO O useMemo BUGADO. O prop "key" no pai cuida de resetar o estado!

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
          <div className="sm:col-span-2">
            <Label>Nome</Label>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>
          <div>
            <Label>Categoria</Label>
            <Input
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
            />
          </div>
          <div>
            <Label>Estoque atual</Label>
            <Input
              type="number"
              value={form.stock}
              onChange={(e) => update("stock", Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Preço de custo</Label>
            <Input
              type="number"
              step="0.01"
              value={form.costPrice}
              onChange={(e) => update("costPrice", Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Preço de venda</Label>
            <Input
              type="number"
              step="0.01"
              value={form.salePrice}
              onChange={(e) => update("salePrice", Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Estoque mínimo</Label>
            <Input
              type="number"
              value={form.minStock}
              onChange={(e) => update("minStock", Number(e.target.value))}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Descrição</Label>
            <Textarea
              rows={2}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Observações</Label>
            <Textarea
              rows={2}
              value={form.notes ?? ""}
              onChange={(e) => update("notes", e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
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
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {product.name}
              </span>{" "}
              — atual: {product.stock}
            </div>
            <div>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
