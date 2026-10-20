import { PackageSearch } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getPackages } from "@/services/catalog";
import { getPublicSettings } from "@/services/public-settings";
import { cn } from "@/lib/utils";
import type { PackageCategory } from "@/types/catalog";
import { PackageCard } from "./package-card";

interface PackageGridProps {
  category?: PackageCategory;
  featured?: boolean;
  limit?: number;
  className?: string;
}

/** Paquetes leídos de la API en cada solicitud (el backend es la fuente autoritativa de precios). */
export function PackageGrid(props: PackageGridProps) {
  return (
    <Suspense fallback={<PackageGridSkeleton count={props.limit ?? 3} className={props.className} />}>
      <PackageGridContent {...props} />
    </Suspense>
  );
}

async function PackageGridContent({ category, featured, limit, className }: PackageGridProps) {
  const [result, settings] = await Promise.all([getPackages({ category, featured }), getPublicSettings()]);

  if (result.status === "unavailable") return <CatalogUnavailable />;
  const items = limit ? result.items.slice(0, limit) : result.items;
  if (items.length === 0) return <CatalogUnavailable empty />;

  return (
    <div className={cn("grid gap-6 md:grid-cols-2 xl:grid-cols-3", className)}>
      {items.map((pkg) => (
        <PackageCard key={pkg.slug} pkg={pkg} plans={settings.subscription} />
      ))}
    </div>
  );
}

export function PackageGridSkeleton({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid gap-6 md:grid-cols-2 xl:grid-cols-3", className)} aria-busy="true" aria-label="Cargando paquetes">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="space-y-5 rounded-2xl border border-border bg-card p-7 text-foreground shadow-card">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-1/2" />
          <div className="space-y-2.5">
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
  );
}

function CatalogUnavailable({ empty = false }: { empty?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-canvas px-6 py-14 text-center text-foreground">
      <PackageSearch className="size-10 text-electric" aria-hidden />
      <div className="max-w-md space-y-2">
        <p className="font-heading text-lg font-semibold">
          {empty ? "Aún no hay paquetes publicados en esta categoría" : "El catálogo de paquetes no está disponible por el momento"}
        </p>
        <p className="text-sm text-foreground-secondary">
          Puedes describirnos lo que necesitas y te enviaremos una propuesta.
        </p>
      </div>
      <Button asChild variant="glass">
        <Link href="/contacto">Solicitar información</Link>
      </Button>
    </div>
  );
}
