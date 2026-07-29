"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Users as UsersIcon,
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsersStore, type AppUser } from "@/store/useUsersStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import Link from "next/link";

export default function UsuariosPage() {
  const users = useUsersStore((s) => s.users);
  const groups = useSettingsStore((s) => s.groups);
  const removeUser = useUsersStore((s) => s.removeUser);
  const toggleUser = useUsersStore((s) => s.toggleUser);
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [creating, setCreating] = useState(false);

  const groupMap = useMemo(
    () => Object.fromEntries(groups.map((g) => [g.id, g])),
    [groups],
  );

  return (
    <div className="w-full px-4">
      <div className="top-0">
        <Link
          href="/configuracoes"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para Configurações
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UsersIcon className="h-4 w-4 text-primary" />
            Usuários cadastrados
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              ({users.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {users.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Nenhum usuário cadastrado.
            </div>
          )}
          {users.map((u) => {
            const group = groupMap[u.groupId];
            return (
              <div
                key={u.id}
                className="flex flex-col gap-3 rounded-xl border border-border/70 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {u.name.trim().slice(0, 1).toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="truncate text-sm font-medium">
                        {u.name}
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          u.active
                            ? "border-emerald-500/40 text-emerald-700"
                            : "border-muted-foreground/30 text-muted-foreground"
                        }
                      >
                        {u.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {u.email}
                      </span>
                      <span>
                        Escopo:{" "}
                        <span className="font-medium text-foreground">
                          {group?.name ?? "—"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <div className="flex items-center gap-2 pr-2">
                    <Switch
                      checked={u.active}
                      onCheckedChange={() => toggleUser(u.id)}
                      aria-label="Ativar usuário"
                    />
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => setEditing(u)}
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
                        <AlertDialogTitle>Remover usuário?</AlertDialogTitle>
                        <AlertDialogDescription>
                          "{u.name}" perderá o acesso ao sistema. Esta ação não
                          pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            removeUser(u.id);
                            toast.success("Usuário removido");
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
      </Card>

      <UserForm
        open={creating || !!editing}
        initial={editing}
        onOpenChange={(o) => {
          if (!o) {
            setCreating(false);
            setEditing(null);
          }
        }}
      />
    </div>
  );
}

interface FormData {
  name: string;
  email: string;
  password: string;
  groupId: string;
  active: boolean;
}

const emptyForm: FormData = {
  name: "",
  email: "",
  password: "",
  groupId: "",
  active: true,
};

function UserForm({
  open,
  initial,
  onOpenChange,
}: {
  open: boolean;
  initial: AppUser | null;
  onOpenChange: (o: boolean) => void;
}) {
  const addUser = useUsersStore((s) => s.addUser);
  const updateUser = useUsersStore((s) => s.updateUser);
  const users = useUsersStore((s) => s.users);
  const groups = useSettingsStore((s) => s.groups);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (open) {
      setShowPassword(false);
      setForm(
        initial
          ? {
              name: initial.name,
              email: initial.email,
              password: initial.password,
              groupId: initial.groupId,
              active: initial.active,
            }
          : emptyForm,
      );
    }
  }, [open, initial]);

  const isEdit = !!initial;

  const submit = () => {
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    if (!name) return toast.error("Informe o nome");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return toast.error("E-mail inválido");
    if (!form.password || form.password.length < 6)
      return toast.error("A senha deve ter pelo menos 6 caracteres");
    if (!form.groupId) return toast.error("Selecione um grupo de acesso");

    const duplicated = users.some(
      (u) => u.email.toLowerCase() === email && u.id !== initial?.id,
    );
    if (duplicated) return toast.error("Já existe um usuário com este e-mail");

    if (isEdit && initial) {
      updateUser(initial.id, {
        name,
        email,
        password: form.password,
        groupId: form.groupId,
        active: form.active,
      });
      toast.success("Usuário atualizado");
    } else {
      addUser({
        name,
        email,
        password: form.password,
        groupId: form.groupId,
        active: form.active,
      });
      toast.success("Usuário criado");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar usuário" : "Novo usuário"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Nome *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex.: Ana Silva"
            />
          </div>
          <div>
            <Label>E-mail *</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="usuario@minhaloja.com"
            />
          </div>
          <div>
            <Label>Senha *</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div>
            <Label>Escopo de acesso *</Label>
            <Select
              value={form.groupId}
              onValueChange={(v) => setForm({ ...form, groupId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um grupo" />
              </SelectTrigger>
              <SelectContent>
                {groups.length === 0 && (
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    Nenhum grupo cadastrado. Crie um em Configurações.
                  </div>
                )}
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id} disabled={!g.active}>
                    {g.name}
                    {!g.active ? " (inativo)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/70 p-3">
            <div>
              <div className="text-sm font-medium">Status</div>
              <div className="text-xs text-muted-foreground">
                Usuários inativos não conseguem acessar o sistema.
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={submit}>
            {isEdit ? "Salvar alterações" : "Criar usuário"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
