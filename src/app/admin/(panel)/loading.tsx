import { Skeleton } from "@/components/ui/skeleton";

/**
 * Límite de Suspense entre el layout del panel (ya montado) y cada página. Cubre las navegaciones
 * internas: las páginas leen la URL (filtros, id) y sin este límite la navegación no sería instantánea.
 */
export default function PanelLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Cargando">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-72 w-full rounded-2xl" />
    </div>
  );
}
