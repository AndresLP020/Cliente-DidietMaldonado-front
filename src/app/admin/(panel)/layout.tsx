import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminShell } from "@/features/admin/admin-shell";
import { AuthGate } from "@/features/admin/session";

function PanelSkeleton() {
  return (
    <div className="flex min-h-svh" aria-busy="true" aria-label="Cargando panel">
      <div className="hidden w-64 border-r border-border bg-mist lg:block" />
      <div className="flex-1 space-y-4 p-10">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    </div>
  );
}

/**
 * El panel se renderiza en el cliente: la sesión es una cookie httpOnly de la API,
 * que solo el navegador envía. La protección real de los datos está en el backend.
 */
export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <AuthGate fallback={<PanelSkeleton />}>
        <AdminShell>{children}</AdminShell>
      </AuthGate>
    </Suspense>
  );
}
