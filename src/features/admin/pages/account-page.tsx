"use client";

import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminApi, setCsrfToken } from "@/features/admin/admin-api";
import { SESSION_QUERY_KEY, useSession } from "@/features/admin/session";
import type { SessionView } from "@/features/admin/types";
import { ErrorState, PageHeader, Panel, roleLabels, useAdminMutation } from "@/features/admin/ui";

export function AccountPage() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const mutation = useAdminMutation({
    mutationFn: () => adminApi.send<SessionView>("POST", "/auth/password", { currentPassword: current, newPassword: next }),
    onSuccess: (session) => {
      // El servidor cerró las demás sesiones y entregó una nueva (con otro token CSRF).
      setCsrfToken(session.csrfToken);
      queryClient.setQueryData(SESSION_QUERY_KEY, session);
      setCurrent("");
      setNext("");
      setConfirm("");
    },
  });
  const mismatch = confirm.length > 0 && next !== confirm;

  return (
    <>
      <PageHeader title="Mi cuenta" description={`${user.name} · ${user.email} · ${roleLabels[user.role]}`} />
      <Panel title="Cambiar contraseña" className="max-w-xl">
        <form
          className="space-y-4 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!mismatch) mutation.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="current">Contraseña actual</Label>
            <Input id="current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="next">Nueva contraseña</Label>
            <Input id="next" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
            <p className="text-xs text-muted-foreground">Mínimo 8 caracteres combinando mayúsculas, minúsculas, números o símbolos.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirmar nueva contraseña</Label>
            <Input id="confirm" type="password" autoComplete="new-password" aria-invalid={mismatch} aria-describedby={mismatch ? "confirm-error" : undefined} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            {mismatch && <p id="confirm-error" className="text-sm text-destructive">Las contraseñas no coinciden.</p>}
          </div>
          {mutation.error && <ErrorState error={mutation.error} />}
          {mutation.isSuccess && (
            <p role="status" className="flex items-center gap-2 text-sm text-success">
              <CheckCircle2 className="size-4" aria-hidden /> Contraseña actualizada. Se cerraron tus demás sesiones.
            </p>
          )}
          <Button type="submit" variant="brand" disabled={mutation.isPending || !current || !next || mismatch}>
            {mutation.isPending && <Loader2 className="animate-spin" data-icon="inline-start" />} Actualizar contraseña
          </Button>
        </form>
      </Panel>
    </>
  );
}
