"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2, LogIn } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api-client";
import { adminApi, setCsrfToken } from "./admin-api";
import { SESSION_QUERY_KEY } from "./session";
import type { SessionView } from "./types";

/** Solo se permite volver a rutas internas del panel (evita redirecciones abiertas). */
function safeNext(next: string | null): string {
  return next && /^\/admin(\/[\w\-/]*)?$/.test(next) && !next.startsWith("/admin/login") ? next : "/admin";
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => adminApi.send<SessionView>("POST", "/auth/login", { email, password }),
    onSuccess: (session) => {
      setCsrfToken(session.csrfToken);
      queryClient.setQueryData(SESSION_QUERY_KEY, session);
      router.replace(safeNext(params.get("next")));
    },
    onError: () => setPassword(""),
  });

  const message =
    mutation.error instanceof ApiError
      ? mutation.error.status === 429
        ? "Demasiados intentos. Espera unos minutos antes de volver a intentar."
        : mutation.error.message
      : mutation.error
        ? "No pudimos conectar con el servidor."
        : null;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate();
      }}
      className="space-y-5 rounded-2xl border border-border bg-card p-6"
    >
      {message && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input id="email" type="email" autoComplete="username" required className="h-11" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-11"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" variant="brand" size="xl" className="w-full" disabled={mutation.isPending || !email || !password}>
        {mutation.isPending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <LogIn data-icon="inline-start" />}
        Iniciar sesión
      </Button>
    </form>
  );
}
