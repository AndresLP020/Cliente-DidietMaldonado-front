"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FileDown, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/features/admin/admin-api";
import { useCan } from "@/features/admin/session";
import type { AdminQuoteDetail } from "@/features/admin/types";
import {
  ErrorState,
  formatDate,
  formatDateTime,
  leadStatusLabels,
  PageHeader,
  Panel,
  quoteStatusLabels,
  StatusPill,
  useAdminMutation,
} from "@/features/admin/ui";
import { QuoteDeliveries } from "@/features/admin/quote-deliveries";
import { QuoteBreakdown } from "@/features/quote-builder/quote-breakdown";
import { adminQuotePdfUrl } from "@/services/quote-access-urls";
import type { QuoteStatus } from "@/types/quote";

const transitionLabels: Partial<Record<QuoteStatus, string>> = {
  sent: "Marcar como enviada",
  approved: "Marcar como aprobada",
  rejected: "Marcar como rechazada",
  cancelled: "Cancelar",
};

const actionLabels: Record<string, string> = {
  "quote.created": "Cotización registrada",
  "quote.revised": "Nueva versión",
  "quote.status_changed": "Cambio de estado",
};

export function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const canWrite = useCan("quotes:write");
  const [versionShown, setVersionShown] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<QuoteStatus | null>(null);
  const [reviseOpen, setReviseOpen] = useState(false);
  const [reason, setReason] = useState("Actualización con precios vigentes");

  const { data, isPending, error } = useQuery({
    queryKey: ["admin", "quote", id],
    queryFn: () => adminApi.get<AdminQuoteDetail>(`/admin/quotes/${id}`),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin"] });
  const statusMutation = useAdminMutation({
    mutationFn: (status: QuoteStatus) => adminApi.send("PATCH", `/admin/quotes/${id}/status`, { status }),
    onSuccess: () => {
      setConfirm(null);
      void refresh();
    },
  });
  const reviseMutation = useAdminMutation({
    mutationFn: () => {
      const current = data!.versions.find((v) => v.version === data!.currentVersion)!;
      return adminApi.send("POST", `/admin/quotes/${id}/revise`, { selection: current.selection, reason });
    },
    onSuccess: () => {
      setReviseOpen(false);
      setVersionShown(null);
      void refresh();
    },
  });

  if (error) return <ErrorState error={error} />;
  if (isPending) return <Skeleton className="h-96 rounded-2xl" />;

  const shown = data.versions.find((v) => v.version === (versionShown ?? data.currentVersion)) ?? data.versions[0]!;
  const closed = ["approved", "rejected", "cancelled"].includes(data.status);

  return (
    <>
      <Link
        href="/admin/cotizaciones"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> Cotizaciones
      </Link>
      <PageHeader
        title={data.folio}
        description={`Registrada el ${formatDateTime(data.createdAt)} · vigencia ${data.validUntil ? formatDate(data.validUntil) : "por definir"}`}
        actions={
          <>
            <Button asChild variant="outline">
              <a href={adminQuotePdfUrl(data.id, shown.version)} target="_blank" rel="noopener noreferrer">
                <FileDown data-icon="inline-start" /> PDF v{shown.version}
              </a>
            </Button>
            {canWrite && (
              <>
                {!closed && (
                  <Button variant="glass" onClick={() => setReviseOpen(true)}>
                    <RefreshCw data-icon="inline-start" /> Recalcular con precios vigentes
                  </Button>
                )}
                {data.allowedTransitions.map((status) => (
                  <Button
                    key={status}
                    variant={status === "approved" ? "brand" : "outline"}
                    onClick={() => setConfirm(status)}
                  >
                    {transitionLabels[status] ?? status}
                  </Button>
                ))}
              </>
            )}
          </>
        }
      />

      {statusMutation.error && <ErrorState error={statusMutation.error} className="mb-4" />}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Panel
          title={`Versión ${shown.version}${shown.version === data.currentVersion ? " (vigente)" : ""}`}
          actions={<StatusPill status={data.status} label={quoteStatusLabels[data.status]} />}
        >
          <div className="p-5">
            <p className="mb-4 text-sm text-muted-foreground">
              {shown.reason} · {shown.createdBy} · {formatDateTime(shown.createdAt)}
            </p>
            {shown.calculation.package && (
              <p className="mb-4 font-heading text-lg font-semibold">{shown.calculation.package.name}</p>
            )}
            <QuoteBreakdown calculation={shown.calculation} />
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Cliente">
            {data.client ? (
              <dl className="space-y-2 p-5 text-sm">
                <div>
                  <dt className="sr-only">Nombre</dt>
                  <dd className="font-medium">
                    <Link href={`/admin/clientes/${data.client.id}`} className="hover:underline">
                      {data.client.name}
                    </Link>
                  </dd>
                  {data.client.company && <dd className="text-muted-foreground">{data.client.company}</dd>}
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Correo</dt>
                  <dd>
                    <a href={`mailto:${data.client.email}`} className="break-all text-electric hover:underline">
                      {data.client.email}
                    </a>
                  </dd>
                </div>
                {data.client.phone && (
                  <div>
                    <dt className="text-xs text-muted-foreground">Teléfono</dt>
                    <dd>{data.client.phone}</dd>
                  </div>
                )}
                {data.client.whatsapp && (
                  <div>
                    <dt className="text-xs text-muted-foreground">WhatsApp</dt>
                    <dd>{data.client.whatsapp}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-muted-foreground">Desea recibirla por</dt>
                  <dd>
                    {[data.channels.email && "correo", data.channels.whatsapp && "WhatsApp"]
                      .filter(Boolean)
                      .join(" y ") || "—"}
                  </dd>
                </div>
                {data.lead && (
                  <div>
                    <dt className="text-xs text-muted-foreground">Prospecto</dt>
                    <dd>
                      <StatusPill
                        status={data.lead.status}
                        label={leadStatusLabels[data.lead.status as keyof typeof leadStatusLabels]}
                      />
                    </dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="p-5 text-sm text-muted-foreground">Sin datos del cliente.</p>
            )}
          </Panel>

          <QuoteDeliveries
            quoteId={data.id}
            deliveries={data.deliveries}
            integrations={data.integrations}
            canSend={data.status === "issued" || data.status === "sent"}
          />

          {data.comments && (
            <Panel title="Comentarios del cliente">
              <p className="p-5 text-sm whitespace-pre-line text-foreground-secondary">{data.comments}</p>
            </Panel>
          )}

          <Panel title="Versiones">
            <ul className="divide-y divide-border">
              {data.versions.map((v) => (
                <li key={v.version}>
                  <button
                    type="button"
                    onClick={() => setVersionShown(v.version)}
                    aria-current={v.version === shown.version ? "true" : undefined}
                    className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left text-sm hover:bg-surface-raised/60 aria-[current]:bg-royal/10"
                  >
                    <span>
                      Versión {v.version}
                      <span className="block text-xs text-muted-foreground">{formatDateTime(v.createdAt)}</span>
                    </span>
                    {v.version === data.currentVersion && <StatusPill status="published" label="Vigente" />}
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Historial">
            <ol className="space-y-3 p-5 text-sm">
              {data.history.map((h, i) => (
                <li key={i}>
                  <p>
                    {actionLabels[h.action] ?? h.action}
                    {h.action === "quote.status_changed" && typeof h.after?.status === "string" && (
                      <> → {quoteStatusLabels[h.after.status as QuoteStatus] ?? h.after.status}</>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {h.actor} · {formatDateTime(h.at)}
                  </p>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>

      <Dialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirm ? transitionLabels[confirm] : ""}</DialogTitle>
            <DialogDescription>
              La cotización {data.folio} pasará a «{confirm ? quoteStatusLabels[confirm] : ""}». El cambio queda
              registrado en el historial.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Volver
            </Button>
            <Button
              variant="brand"
              disabled={statusMutation.isPending}
              onClick={() => confirm && statusMutation.mutate(confirm)}
            >
              {statusMutation.isPending && <Loader2 className="animate-spin" data-icon="inline-start" />} Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reviseOpen} onOpenChange={setReviseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recalcular con precios vigentes</DialogTitle>
            <DialogDescription>
              Se crea la versión {data.currentVersion + 1} con la misma selección del cliente y los precios publicados
              hoy. La versión {data.currentVersion} se conserva sin cambios.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo</Label>
            <Input id="reason" value={reason} maxLength={300} onChange={(e) => setReason(e.target.value)} />
          </div>
          {reviseMutation.error && <ErrorState error={reviseMutation.error} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviseOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="brand"
              disabled={reviseMutation.isPending || reason.trim().length < 3}
              onClick={() => reviseMutation.mutate()}
            >
              {reviseMutation.isPending && <Loader2 className="animate-spin" data-icon="inline-start" />} Crear versión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
