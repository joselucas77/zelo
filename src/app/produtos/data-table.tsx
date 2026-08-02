"use client";

import { useEffect, useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product } from "@/types";

export function ProductsDataTable({
  columns,
  data,
  categories,
  onCreateClick, // NOVA PROP RECEBIDA AQUI
}: {
  columns: ColumnDef<Product>[];
  data: Product[];
  categories: string[];
  onCreateClick: () => void; // TIPO DA NOVA PROP
}) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _id, value) => {
      const term = String(value).trim().toLowerCase();
      if (!term) return true;
      const p = row.original;
      return (
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  const categoryFilter =
    (table.getColumn("category")?.getFilterValue() as string) ?? "Todas";

  useEffect(() => {
    table.setPageIndex(0);
  }, [globalFilter, categoryFilter, table]);

  const rows = table.getRowModel().rows;
  const totalFiltered = table.getFilteredRowModel().rows.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;

  return (
    <div>
      <div className="mb-4 flex flex-col sm:justify-between gap-2 sm:flex-row sm:items-center">
        <div className="flex gap-2 flex-row items-center w-full">
          <div className="relative flex w-full max-w-sm items-center">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar produto ou categoria..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="rounded-xl pl-9"
            />
          </div>
          <Select
            value={categoryFilter}
            onValueChange={(v) =>
              table
                .getColumn("category")
                ?.setFilterValue(v === "Todas" ? undefined : v)
            }
          >
            <SelectTrigger className="w-full max-w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas">Todas as categorias</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* BOTÃO AGORA CONECTADO CORRETAMENTE */}
        <Button onClick={onCreateClick} size="sm" className="rounded-full">
          <Plus className="mr-1 h-4 w-4" /> Novo
        </Button>
      </div>

      <Card className="border-border/70 p-0">
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={
                          header.column.id === "name" ||
                          header.column.id === "actions"
                            ? undefined
                            : "hidden sm:table-cell"
                        }
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {rows.length ? (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={
                            cell.column.id === "name" ||
                            cell.column.id === "actions"
                              ? undefined
                              : "hidden sm:table-cell"
                          }
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-sm text-muted-foreground"
                    >
                      Nenhum produto encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">
          {totalFiltered === 0 ? 0 : pageIndex * pageSize + 1}–
          {Math.min((pageIndex + 1) * pageSize, totalFiltered)} de{" "}
          {totalFiltered}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-xs tabular-nums text-muted-foreground">
            {pageIndex + 1} / {table.getPageCount() || 1}
          </div>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            aria-label="Próxima página"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
