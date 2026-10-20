"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect } from "react";
import { ApiError } from "@/lib/api-client";
import { adminApi, setCsrfToken } from "./admin-api";
import type { Permission, SessionView } from "./types";

export const SESSION_QUERY_KEY = ["admin", "session"] as const;

const SessionContext = createContext<SessionView | null>(null);

/** Sesión actual (solo dentro del panel autenticado). */
export function useSession(): SessionView {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession debe usarse dentro de <AuthGate>.");
  return session;
}

export function useCan(permission: Permission): boolean {
  return useSession().user.permissions.includes(permission);
}

/** Verifica la sesión con el backend; sin sesión redirige al inicio de sesión conservando el destino. */
export function AuthGate({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { data, error, isPending } = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: () => adminApi.get<SessionView>("/auth/me"),
    staleTime: 60_000,
    retry: false,
  });

  useEffect(() => {
    if (data) setCsrfToken(data.csrfToken);
  }, [data]);

  const unauthorized = error instanceof ApiError && error.status === 401;
  useEffect(() => {
    if (!unauthorized) return;
    setCsrfToken(null);
    queryClient.removeQueries({ queryKey: ["admin"] });
    router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
  }, [unauthorized, pathname, router, queryClient]);

  if (isPending || unauthorized) return <>{fallback}</>;
  if (error || !data) {
    return (
      <div role="alert" className="flex min-h-svh items-center justify-center p-6 text-center text-foreground-secondary">
        No pudimos verificar tu sesión. Revisa tu conexión y recarga la página.
      </div>
    );
  }
  return <SessionContext.Provider value={data}>{children}</SessionContext.Provider>;
}
