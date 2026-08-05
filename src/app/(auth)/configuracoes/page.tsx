"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Store as StoreIcon,
  ShieldCheck,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  MODULES,
  useSettingsStore,
  type AccessGroup,
  type ActionKey,
  type ModuleKey,
  type Permissions,
  type StoreInfo,
} from "@/store/useSettingsStore";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ConfiguracoesPage() {
  const isMobile = useIsMobile();
  return (
    <div className="w-full px-4">
      <StoreSection />
      <GroupsSection />
    </div>
  );
}

function StoreSection() {
  const store = useSettingsStore((s) => s.store);
  const setStore = useSettingsStore((s) => s.setStore);
  const [form, setForm] = useState<StoreInfo>(store);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm(store);
  }, [store]);

  const update = <K extends keyof StoreInfo>(k: K, v: StoreInfo[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const dirty = JSON.stringify(form) !== JSON.stringify(store);

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <StoreIcon className="h-4 w-4 text-primary" />
          Dados da loja
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2 flex flex-col gap-2">
            <Label>Nome da loja *</Label>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Ex.: Boutique Bella"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Responsável</Label>
            <Input
              value={form.ownerName}
              onChange={(e) => update("ownerName", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Documento (CNPJ/CPF)</Label>
            <Input
              value={form.document}
              onChange={(e) => update("document", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Telefone</Label>
            <Input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>E-mail</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            disabled={!dirty || busy}
            onClick={() => setForm(store)}
          >
            Cancelar
          </Button>
          <Button
            disabled={!dirty || busy || !form.name.trim()}
            onClick={async () => {
              setBusy(true);
              try {
                setStore(form);
                toast.success("Dados da loja salvos");
              } finally {
                setBusy(false);
              }
            }}
          >
            <Save className="mr-1 h-4 w-4" /> Salvar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function GroupsSection() {
  const groups = useSettingsStore((s) => s.groups);
  const removeGroup = useSettingsStore((s) => s.removeGroup);
  const toggleGroup = useSettingsStore((s) => s.toggleGroup);
  const [editing, setEditing] = useState<AccessGroup | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Grupos de acesso
        </CardTitle>
        <Button
          size="sm"
          className="rounded-full"
          onClick={() => setCreating(true)}
        >
          <Plus className="mr-1 h-4 w-4" /> Novo grupo
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {groups.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Nenhum grupo cadastrado.
          </div>
        )}
        {groups.map((g) => {
          const total = totalPermissions(g.permissions);
          return (
            <div
              key={g.id}
              className="flex flex-col gap-3 rounded-xl border border-border/70 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="truncate text-sm font-medium">{g.name}</div>
                  <Badge
                    variant="outline"
                    className={
                      g.active
                        ? "border-emerald-500/40 text-emerald-700"
                        : "border-muted-foreground/30 text-muted-foreground"
                    }
                  >
                    {g.active ? "Ativo" : "Inativo"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {total} permiss{total === 1 ? "ão" : "ões"}
                  </span>
                </div>
                {g.description && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {g.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="flex items-center gap-2 pr-2">
                  <Switch
                    checked={g.active}
                    onCheckedChange={() => toggleGroup(g.id)}
                    aria-label="Ativar grupo"
                  />
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => setEditing(g)}
                  aria-label="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
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
                      <AlertDialogTitle>Remover grupo?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {g.name} será removido. Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          removeGroup(g.id);
                          toast.success("Grupo removido");
                        }}
                      >
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          );
        })}
      </CardContent>

      <GroupForm
        open={creating || !!editing}
        initial={editing}
        onOpenChange={(o) => {
          if (!o) {
            setCreating(false);
            setEditing(null);
          }
        }}
      />
    </Card>
  );
}

function totalPermissions(p: Permissions): number {
  return Object.values(p).reduce((acc, arr) => acc + (arr?.length ?? 0), 0);
}

interface FormData {
  name: string;
  description: string;
  active: boolean;
  permissions: Permissions;
}

const emptyForm: FormData = {
  name: "",
  description: "",
  active: true,
  permissions: {},
};

function GroupForm({
  open,
  initial,
  onOpenChange,
}: {
  open: boolean;
  initial: AccessGroup | null;
  onOpenChange: (o: boolean) => void;
}) {
  const addGroup = useSettingsStore((s) => s.addGroup);
  const updateGroup = useSettingsStore((s) => s.updateGroup);
  const [form, setForm] = useState<FormData>(emptyForm);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              name: initial.name,
              description: initial.description,
              active: initial.active,
              permissions: { ...initial.permissions },
            }
          : emptyForm,
      );
    }
  }, [open, initial]);

  const isEdit = !!initial;

  const toggleAction = (mod: ModuleKey, action: ActionKey) => {
    setForm((f) => {
      const current = f.permissions[mod] ?? [];
      const next = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action];
      return { ...f, permissions: { ...f.permissions, [mod]: next } };
    });
  };

  const setAllForModule = (mod: ModuleKey, all: boolean) => {
    setForm((f) => {
      const actions = MODULES.find((m) => m.key === mod)!.actions.map(
        (a) => a.key,
      );
      return {
        ...f,
        permissions: { ...f.permissions, [mod]: all ? actions : [] },
      };
    });
  };

  const totalSelected = useMemo(
    () => totalPermissions(form.permissions),
    [form.permissions],
  );

  const submit = () => {
    if (!form.name.trim()) {
      toast.error("Informe o nome do grupo");
      return;
    }
    if (isEdit && initial) {
      updateGroup(initial.id, {
        name: form.name.trim(),
        description: form.description.trim(),
        active: form.active,
        permissions: form.permissions,
      });
      toast.success("Grupo atualizado");
    } else {
      addGroup({
        name: form.name.trim(),
        description: form.description.trim(),
        active: form.active,
        permissions: form.permissions,
      });
      toast.success("Grupo criado");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar grupo" : "Novo grupo de acesso"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2 flex flex-col gap-2">
              <Label>Nome *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex.: Vendedor"
              />
            </div>
            <div className="sm:col-span-2 flex flex-col gap-2">
              <Label>Descrição</Label>
              <Textarea
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Para que serve este grupo?"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/70 p-3 sm:col-span-2">
              <div>
                <div className="text-sm font-medium">Status</div>
                <div className="text-xs text-muted-foreground">
                  Grupos inativos não concedem acesso aos usuários.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {form.active ? "Ativo" : "Inativo"}
                </span>
                <Switch
                  checked={form.active}
                  onCheckedChange={(v) => setForm({ ...form, active: v })}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Permissões por módulo</div>
                <div className="text-xs text-muted-foreground">
                  Selecione as ações permitidas em cada página do sistema.
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {totalSelected} selecionada{totalSelected === 1 ? "" : "s"}
              </span>
            </div>

            <div className="space-y-2">
              {MODULES.map((mod) => {
                const selected = form.permissions[mod.key] ?? [];
                const allChecked = selected.length === mod.actions.length;
                const someChecked = selected.length > 0 && !allChecked;
                return (
                  <div
                    key={mod.key}
                    className="rounded-lg border border-border/70 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={
                            allChecked ? true : someChecked ? undefined : false
                          }
                          onCheckedChange={(v) =>
                            setAllForModule(mod.key, v === true)
                          }
                          aria-label={`Selecionar todas de ${mod.label}`}
                        />
                        <div className="text-sm font-medium">{mod.label}</div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {selected.length}/{mod.actions.length}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 pl-6 sm:grid-cols-4">
                      {mod.actions.map((a) => {
                        const checked = selected.includes(a.key);
                        const id = `${mod.key}-${a.key}`;
                        return (
                          <label
                            key={a.key}
                            htmlFor={id}
                            className="flex cursor-pointer items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-sm hover:border-border"
                          >
                            <Checkbox
                              id={id}
                              checked={checked}
                              onCheckedChange={() =>
                                toggleAction(mod.key, a.key)
                              }
                            />
                            {a.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={!form.name.trim()}>
            {isEdit ? "Salvar" : "Criar grupo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
