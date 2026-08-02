import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangle,
  ArrowUpDown,
  MoreVertical,
  PackagePlus,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { currency } from "@/lib/format";
import type { Product } from "@/types";

export type ProductActions = {
  onStock: (p: Product) => void;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
};

export function getProductColumns({
  onStock,
  onEdit,
  onDelete,
}: ProductActions): ColumnDef<Product>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 h-8 px-2 hover:bg-none focus:bg-none"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Produto <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => {
        const p = row.original;
        const low = p.stock <= p.minStock;
        return (
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">{p.name}</span>
                {low && (
                  <Badge
                    variant="outline"
                    className="shrink-0 border-amber-500/40 text-amber-700"
                  >
                    <AlertTriangle className="mr-1 h-3 w-3" /> Baixo
                  </Badge>
                )}
              </div>
              <div className="sm:hidden">
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    }
                  ></PopoverTrigger>
                  <PopoverContent className="w-52" align="end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-9 px-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStock(p);
                      }}
                    >
                      <PackagePlus className="mr-2 h-4 w-4" />
                      Entrada de estoque
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-9 px-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(p);
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar produto
                    </Button>
                    <Separator className="my-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-9 px-3 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(p);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remover produto
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="mt-0.5 text-xs text-muted-foreground sm:hidden">
              {p.stock} un · {currency(p.salePrice)}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Categoria",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.category}
        </span>
      ),
      filterFn: (row, id, value) => row.getValue(id) === value,
    },
    {
      accessorKey: "stock",
      header: () => <div className="text-right">Estoque</div>,
      cell: ({ row }) => (
        <div className="text-right text-sm tabular-nums">
          {row.original.stock} un
        </div>
      ),
    },
    {
      accessorKey: "salePrice",
      header: () => <div className="text-right">Valor</div>,
      cell: ({ row }) => (
        <div className="text-right text-sm font-semibold tabular-nums">
          {currency(row.original.salePrice)}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Ações</div>,
      enableHiding: false,
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="hidden justify-end gap-1 sm:flex">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => onStock(p)}
            >
              <PackagePlus className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => onEdit(p)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive"
              onClick={() => onDelete(p)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}
