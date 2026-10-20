"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminApi } from "@/features/admin/admin-api";
import { useSession } from "@/features/admin/session";
import type { AdminUser, Role } from "@/features/admin/types";
import { ErrorState, formatDateTime, PageHeader, Panel, roleLabels, StatusPill, TableSkeleton, useAdminMutation } from "@/features/admin/ui";

const roleHints: Record<Role, string> = {
  owner: "Todo, incluida la gestión de usuarios.",
  admin: "Catálogo, precios, costos, cotizaciones y configuración.",
  sales: "Cotizaciones, clientes y prospectos. Sin costos ni precios.",
  viewer: "Solo consulta, sin costos.",
};

export function UsersPage() {
  const { user: me } = useSession();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [resetFor, setResetFor] = useState<AdminUser | null>(null);

  const { data, isPending, error } = useQuery({ queryKey: ["admin", "users"], queryFn: () => adminApi.get<{ items: AdminUser[] }>("/admin/users") });
  const update = useAdminMutation({
    mutationFn: ({ id, patch }: { id: string; patch: object }) => adminApi.send("PATCH", `/admin/users/${id}`, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Cambiar el rol, desactivar o restablecer la contraseña de un usuario cierra sus sesiones abiertas."
        actions={
          <Button variant="brand" onClick={() => setCreateOpen(true)}>
            <UserPlus data-icon="inline-start" /> Nuevo usuario
          </Button>
        }
      />
      {update.error && <ErrorState error={update.error} className="mb-4" />}
      <Panel>
        {error ? (
          <ErrorState error={error} className="m-4" />
        ) : isPending ? (
          <TableSkeleton />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="hidden md:table-cell">Último acceso</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead className="text-right"><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((u) => {
                const self = u.id === me.id;
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <span className="block font-medium">{u.name}{self && <span className="text-xs text-muted-foreground"> (tú)</span>}</span>
                      <span className="block text-xs text-muted-foreground">{u.email}</span>
                      {u.locked && <StatusPill status="expired" label="Bloqueado temporalmente" />}
                    </TableCell>
                    <TableCell>
                      <Select value={u.role} disabled={self || update.isPending} onValueChange={(role) => update.mutate({ id: u.id, patch: { role } })}>
                        <SelectTrigger className="w-44" aria-label={`Rol de ${u.name}`}><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(roleLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{formatDateTime(u.lastLoginAt)}</TableCell>
                    <TableCell>
                      <Switch checked={u.active} disabled={self || update.isPending} onCheckedChange={(active) => update.mutate({ id: u.id, patch: { active } })} aria-label={`Activar a ${u.name}`} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setResetFor(u)}>
                        <KeyRound /> Contraseña
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Panel>

      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ResetPasswordDialog user={resetFor} onClose={() => setResetFor(null)} />
    </>
  );
}

function CreateUserDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", email: "", role: "sales" as Role, password: "" });
  const mutation = useAdminMutation({
    mutationFn: () => adminApi.send("POST", "/admin/users", form),
    onSuccess: () => {
      setForm({ name: "", email: "", role: "sales", password: "" });
      onOpenChange(false);
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="space-y-4"
        >
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
            <DialogDescription>Comparte la contraseña inicial por un canal seguro; la persona podrá cambiarla en «Mi cuenta».</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="u-name">Nombre</Label>
            <Input id="u-name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="u-email">Correo</Label>
            <Input id="u-email" type="email" required autoComplete="off" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="u-role">Rol</Label>
            <Select value={form.role} onValueChange={(role) => setForm((f) => ({ ...f, role: role as Role }))}>
              <SelectTrigger id="u-role" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(roleLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{roleHints[form.role]}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="u-pass">Contraseña inicial</Label>
            <Input id="u-pass" type="password" autoComplete="new-password" required value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
            <p className="text-xs text-muted-foreground">Mínimo 8 caracteres combinando mayúsculas, minúsculas, números o símbolos.</p>
          </div>
          {mutation.error && <ErrorState error={mutation.error} />}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" variant="brand" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="animate-spin" data-icon="inline-start" />} Crear usuario
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ResetPasswordDialog({ user, onClose }: { user: AdminUser | null; onClose: () => void }) {
  const [password, setPassword] = useState("");
  const mutation = useAdminMutation({
    mutationFn: () => adminApi.send("PATCH", `/admin/users/${user!.id}`, { password }),
    onSuccess: () => {
      setPassword("");
      onClose();
    },
  });
  return (
    <Dialog open={user !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="space-y-4"
        >
          <DialogHeader>
            <DialogTitle>Restablecer contraseña</DialogTitle>
            <DialogDescription>Se cerrarán todas las sesiones de {user?.name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="r-pass">Nueva contraseña</Label>
            <Input id="r-pass" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {mutation.error && <ErrorState error={mutation.error} />}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="brand" disabled={mutation.isPending || password.length === 0}>
              {mutation.isPending && <Loader2 className="animate-spin" data-icon="inline-start" />} Restablecer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
