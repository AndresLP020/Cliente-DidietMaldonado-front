"use client";

import { AlertTriangle, ArrowRight, Info, Loader2 } from "lucide-react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api-client";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Amount, subscriptionBudget } from "./quote-breakdown";
import { useQuoteStore } from "./store";
import { useQuotePreview } from "./use-quote-preview";

/**
 * Barra inferior fija en móvil con el total en vivo (el panel lateral solo se muestra en escritorio).
 * Se monta en <body> con un portal: dentro del contenedor animado (con transform), `position: fixed`
 * quedaría relativo a ese contenedor y no al viewport.
 */
export function MobileSummaryBar() {
  const goTo = useQuoteStore((s) => s.goTo);
  const { data, isFetching, isEnabled } = useQuotePreview();
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-canvas/95 px-4 py-3 shadow-[0_-8px_24px_-12px_rgb(15_23_42/0.18)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4" aria-live="polite">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            {data?.subscription ? subscriptionBudget(data.subscription).label : `Total${data?.totals.hasPendingAmounts ? " parcial" : ""}`}
            {data && !data.isFinal ? " · preliminar" : ""}
          </p>
          <p className={cn("font-heading text-xl font-semibold transition-opacity", isFetching && "opacity-60")}>
            {data?.subscription ? (
              <Amount cents={subscriptionBudget(data.subscription).cents} pendingLabel="Por confirmar" />
            ) : data ? (
              <Amount cents={data.totals.totalCents} />
            ) : isEnabled ? (
              "…"
            ) : (
              "—"
            )}
          </p>
        </div>
        <Button variant="brand" className="h-11 shrink-0 rounded-xl" onClick={() => goTo(5)} disabled={!data}>
          Ver resumen <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </div>,
    document.body,
  );
}

/** Panel lateral con el presupuesto en vivo (calculado por el backend). */
export function LiveSummary({ className }: { className?: string }) {
  const goTo = useQuoteStore((s) => s.goTo);
  const { data, isPending, isFetching, error, isEnabled } = useQuotePreview();

  return (
    <aside aria-label="Presupuesto actualizado" aria-live="polite" className={cn("rounded-2xl border border-border bg-card p-5 shadow-elevated", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading font-semibold">Tu presupuesto</h2>
        {isFetching && <Loader2 className="size-4 animate-spin text-electric" aria-label="Actualizando" />}
      </div>

      {!isEnabled ? (
        <p className="text-sm text-muted-foreground">Agrega componentes para ver el presupuesto.</p>
      ) : error ? (
        <p role="alert" className="text-sm text-destructive">
          {error instanceof ApiError ? error.message : "No pudimos calcular el presupuesto."}
        </p>
      ) : isPending || !data ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-full" />
        </div>
      ) : (
        <div className={cn("space-y-3 transition-opacity", isFetching && "opacity-60")}>
          <dl className="space-y-1.5 text-sm">
            {data.subscription && (
              <div className="mb-2 space-y-1.5 border-b border-border pb-3">
                <div className="flex items-baseline justify-between">
                  <dt className="font-medium">{subscriptionBudget(data.subscription).label}</dt>
                  <dd className="font-heading text-2xl font-semibold">
                    <Amount cents={subscriptionBudget(data.subscription).cents} pendingLabel="Por confirmar" />
                  </dd>
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.subscription.priceMode === "starting_at" ? "Mínimo estimado · " : ""}
                  {data.subscription.planLabel}
                  {data.subscription.annualCharge
                    ? ` · ${data.subscription.annualCharge.name.toLowerCase()} ${formatMoney(data.subscription.annualCharge.cents)} al año`
                    : data.subscription.hostingCharge
                      ? ` · hosting ${data.subscription.hostingCharge.upfront ? "en el primer pago" : data.subscription.hostingCharge.billingMonths > 1 ? `cada ${data.subscription.hostingCharge.billingMonths} meses` : "cada mes"}${data.subscription.hostingCharge.chargeCents !== null ? ` ${formatMoney(data.subscription.hostingCharge.chargeCents)}` : ""}`
                      : ""}
                  {data.subscription.subsequentPaymentCents !== null
                    ? ` · siguientes pagos ${formatMoney(data.subscription.subsequentPaymentCents)} ${data.subscription.billingMonths > 1 ? `cada ${data.subscription.billingMonths} meses` : "cada mes"}`
                    : ""}
                </p>
              </div>
            )}
            {data.subscription && <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Pago inicial</p>}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd><Amount cents={data.totals.subtotalCents} /></dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-border pt-2">
              <dt className="font-medium">{data.subscription ? "Pago inicial" : "Total"}{data.totals.hasPendingAmounts ? " parcial" : ""}</dt>
              <dd className={cn("font-heading font-semibold", data.subscription ? "text-lg" : "text-2xl")}><Amount cents={data.totals.totalCents} /></dd>
            </div>
            {data.totals.recurringMonthlyCents > 0 && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <dt>{data.subscription ? "Servicios adicionales" : "Recurrente (aparte)"}</dt>
                <dd><Amount cents={data.totals.recurringMonthlyCents} /> / mes</dd>
              </div>
            )}
            {data.totals.recurringAnnualCents > 0 && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <dt>{data.subscription ? "Servicios adicionales" : "Recurrente (aparte)"}</dt>
                <dd><Amount cents={data.totals.recurringAnnualCents} /> / año</dd>
              </div>
            )}
          </dl>

          {data.status === "blocked" ? (
            <p className="flex gap-2 text-xs text-magenta">
              <AlertTriangle className="size-4 shrink-0" aria-hidden /> Revisa los componentes marcados como incompatibles.
            </p>
          ) : data.status === "needs_review" ? (
            <p className="flex gap-2 text-xs text-muted-foreground">
              <Info className="size-4 shrink-0 text-electric" aria-hidden /> Presupuesto preliminar: {data.reviewReasons.length}{" "}
              {data.reviewReasons.length === 1 ? "punto requiere" : "puntos requieren"} revisión.
            </p>
          ) : null}

          <Button variant="brand" className="h-11 w-full rounded-xl" onClick={() => goTo(5)}>
            Ver resumen <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      )}
    </aside>
  );
}
