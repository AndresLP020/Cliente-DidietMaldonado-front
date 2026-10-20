"use client";

import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Star, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminApi } from "@/features/admin/admin-api";
import type { AdminTestimonial, Paged, TestimonialStatus } from "@/features/admin/types";
import { EmptyState, ErrorState, formatDateTime, PageHeader, Pagination, Panel, StatusPill, TableSkeleton, testimonialStatusLabels, useAdminMutation } from "@/features/admin/ui";
import { useListParams } from "@/features/admin/use-list-params";
import { cn } from "@/lib/utils";

const TABS: { value: TestimonialStatus | "all"; label: string }[] = [
  { value: "pending", label: "Pendientes" },
  { value: "approved", label: "Aprobados" },
  { value: "rejected", label: "Rechazados" },
  { value: "all", label: "Todos" },
];

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${rating} de 5 estrellas`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={cn("size-4", i < rating ? "fill-warning text-warning" : "text-soft-gray")} aria-hidden />
      ))}
    </span>
  );
}

/** Moderación de comentarios enviados desde el sitio: solo los aprobados se publican. */
export function TestimonialsPage() {
  const { values, page, update } = useListParams(["status"] as const);
  // Sin filtro en la URL se muestran los pendientes; "all" muestra todos.
  const tab = (values.status || "pending") as TestimonialStatus | "all";
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState<AdminTestimonial | null>(null);

  const { data, isPending, error } = useQuery({
    queryKey: ["admin", "testimonials", tab, page],
    queryFn: () => adminApi.get<Paged<AdminTestimonial>>("/admin/testimonials", { status: tab === "all" ? undefined : tab, page }),
    placeholderData: keepPreviousData,
  });

  const review = useAdminMutation({
    mutationFn: ({ id, patch }: { id: string; patch: { status?: TestimonialStatus; featured?: boolean } }) => adminApi.send("PATCH", `/admin/testimonials/${id}`, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "testimonials"] }),
  });
  const remove = useAdminMutation({
    mutationFn: (id: string) => adminApi.send("DELETE", `/admin/testimonials/${id}`),
    onSuccess: () => {
      setDeleting(null);
      void queryClient.invalidateQueries({ queryKey: ["admin", "testimonials"] });
    },
  });
  const busy = review.isPending || remove.isPending;

  return (
    <>
      <PageHeader title="Testimonios" description="Comentarios que dejan los clientes en el sitio. Solo los aprobados se muestran públicamente; el correo nunca se publica." />
      {review.error && <ErrorState error={review.error} className="mb-4" />}
      <Panel>
        <div role="tablist" aria-label="Filtrar por estado" className="flex flex-wrap gap-1 border-b border-border p-3">
          {TABS.map((t) => (
            <button
              key={t.value}
              role="tab"
              type="button"
              aria-selected={tab === t.value}
              onClick={() => update({ status: t.value === "pending" ? "" : t.value })}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                tab === t.value ? "bg-sky text-royal" : "text-foreground-secondary hover:bg-mist hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error ? (
          <ErrorState error={error} className="m-4" />
        ) : isPending ? (
          <TableSkeleton />
        ) : data.items.length === 0 ? (
          <EmptyState message={tab === "pending" ? "No hay comentarios pendientes de revisión." : "No hay comentarios en esta categoría."} />
        ) : (
          <>
            <ul className="grid gap-4 p-4 md:grid-cols-2">
              {data.items.map((t) => (
                <li key={t.id} className={cn("flex flex-col rounded-xl border bg-canvas p-4", t.featured ? "border-warning/40" : "border-border")}>
                  <div className="flex items-start justify-between gap-3">
                    <Stars rating={t.rating} />
                    <span className="flex flex-wrap justify-end gap-1">
                      {t.featured && <StatusPill status="pending" label="Destacado" />}
                      <StatusPill status={t.status === "approved" ? "published" : t.status === "rejected" ? "rejected" : "pending"} label={testimonialStatusLabels[t.status]} />
                    </span>
                  </div>
                  <blockquote className="mt-3 flex-1 text-sm leading-relaxed whitespace-pre-line text-foreground-secondary">“{t.message}”</blockquote>
                  <div className="mt-4 text-sm">
                    <p className="font-medium">{t.name}</p>
                    {(t.role || t.company) && <p className="text-muted-foreground">{[t.role, t.company].filter(Boolean).join(" · ")}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t.email ? (
                        <>
                          <a href={`mailto:${t.email}`} className="text-electric hover:underline">{t.email}</a> (privado) ·{" "}
                        </>
                      ) : null}
                      {formatDateTime(t.createdAt)}
                      {t.reviewedBy && ` · revisado por ${t.reviewedBy}`}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
                    {t.status !== "approved" && (
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => review.mutate({ id: t.id, patch: { status: "approved" } })}>
                        <Check /> Aprobar
                      </Button>
                    )}
                    {t.status !== "rejected" && (
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => review.mutate({ id: t.id, patch: { status: "rejected" } })}>
                        <X /> Rechazar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy || t.status !== "approved"}
                      aria-pressed={t.featured}
                      title={t.status !== "approved" ? "Solo se destacan comentarios aprobados" : undefined}
                      onClick={() => review.mutate({ id: t.id, patch: { featured: !t.featured } })}
                    >
                      <Star className={cn(t.featured && "fill-warning text-warning")} /> {t.featured ? "Quitar destacado" : "Destacar"}
                    </Button>
                    <Button size="sm" variant="ghost" className="ml-auto text-magenta hover:text-magenta" disabled={busy} onClick={() => setDeleting(t)}>
                      <Trash2 /> Eliminar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPage={(p) => update({ page: p })} />
          </>
        )}
      </Panel>

      <Dialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar comentario</DialogTitle>
            <DialogDescription>Se eliminará definitivamente el comentario de {deleting?.name}. Esta acción no se puede deshacer.</DialogDescription>
          </DialogHeader>
          {remove.error && <ErrorState error={remove.error} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancelar</Button>
            <Button variant="destructive" disabled={remove.isPending} onClick={() => deleting && remove.mutate(deleting.id)}>
              {remove.isPending && <Loader2 className="animate-spin" data-icon="inline-start" />} Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
