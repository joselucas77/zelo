"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Pencil,
  Users as UsersIcon,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsersStore, type AppUser } from "@/store/useUsersStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { getUserColumns, type UserTableData } from "./columns";
import { UsersDataTable } from "./data-table";

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

export default function UsuariosPage() {
  const users = useUsersStore((s) => s.users);
  const groups = useSettingsStore((s) => s.groups);
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<AppUser | null>(null);

  const enrichedUsers = useMemo<UserTableData[]>(() => {
    const groupMap = Object.fromEntries(groups.map((g) => [g.id, g]));
    return users.map((u) => ({
      ...u,
      groupLabel: groupMap[u.groupId]?.name ?? "—",
    }));
  }, [users, groups]);

  const columns = useMemo(
    () =>
      getUserColumns({
        onToggle: (id) => useUsersStore.getState().toggleUser(id),
        onEdit: setEditing,
        onDelete: setDeleting,
      }),
    [],
  );

  return (
    <div className="w-full px-4">
      <div className="mb-4">
        <Link
          href="/configuracoes"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para Configurações
        </Link>
      </div>

      <UsersDataTable
        columns={columns}
        data={enrichedUsers}
        groups={groups}
        onCreateClick={() => setCreating(true)}
      />

      <UserForm
        key={editing?.id ?? "new"}
        open={creating || !!editing}
        onOpenChange={(o) => {
          if (!o) {
            setCreating(false);
            setEditing(null);
          }
        }}
        initial={editing}
      />

      <DeleteUser user={deleting} onClose={() => setDeleting(null)} />
    </div>
  );
}

// --- COMPONENTES SECUNDÁRIOS ---

function UserForm({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial: AppUser | null;
}) {
  const isMobile = useIsMobile();
  const addUser = useUsersStore((s) => s.addUser);
  const updateUser = useUsersStore((s) => s.updateUser);
  const users = useUsersStore((s) => s.users);
  const groups = useSettingsStore((s) => s.groups);

  const [form, setForm] = useState<FormData>(emptyForm);
  const [showPassword, setShowPassword] = useState(false);

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

  const FormFields = (
    <div className="space-y-4">
      <div className="sm:col-span-2 space-y-2">
        <Label>Nome *</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Ex.: Ana Silva"
        />
      </div>
      <div className="sm:col-span-2 space-y-2">
        <Label>E-mail *</Label>
        <Input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="usuario@minhaloja.com"
        />
      </div>
      <div className="sm:col-span-2 space-y-2">
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
      <div className="sm:col-span-2 space-y-2">
        <Label>Escopo de acesso *</Label>
        <Select
          value={form.groupId}
          onValueChange={(v) => setForm({ ...form, groupId: v as string })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um grupo" />
          </SelectTrigger>
          <SelectContent>
            {groups.filter((g) => g.active).length === 0 && (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                Nenhum grupo ativo cadastrado. Crie um em Configurações.
              </div>
            )}
            {groups
              .filter((g) => g.active)
              .map((g) => (
                <SelectItem key={g.id} value={g.name}>
                  {g.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border/70 p-3">
        <div>
          <div className="text-sm font-medium">Status</div>
          <div className="text-xs text-muted-foreground">
            Usuários inativos não acessam o sistema.
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
  );

  const ActionButtons = (
    <div className="flex gap-2 w-full justify-between">
      <Button variant="outline" onClick={() => onOpenChange(false)}>
        Cancelar
      </Button>
      <Button onClick={submit}>
        {isEdit ? "Salvar alterações" : "Criar usuário"}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-screen">
          <DrawerHeader className="shrink-0 px-4">
            <DrawerTitle>
              {isEdit ? "Editar usuário" : "Novo usuário"}
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar usuário" : "Novo usuário"}
          </DialogTitle>
        </DialogHeader>
        {FormFields}
        <DialogFooter>{ActionButtons}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteUser({
  user,
  onClose,
}: {
  user: AppUser | null;
  onClose: () => void;
}) {
  const removeUser = useUsersStore((s) => s.removeUser);
  return (
    <AlertDialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover usuário?</AlertDialogTitle>
          <AlertDialogDescription>
            {user?.name} perderá o acesso ao sistema. Esta ação não pode ser
            desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (!user) return;
              removeUser(user.id);
              toast.success("Usuário removido");
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
