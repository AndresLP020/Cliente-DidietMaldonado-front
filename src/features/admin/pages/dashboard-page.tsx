"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/features/admin/admin-api";
import { QuotesPerDayChart } from "@/features/admin/dashboard/quotes-per-day-chart";
import { useCan, useSession } from "@/features/admin/session";
import type { BillingSummary, Dashboard } from "@/features/admin/types";
import { ErrorState, formatDateTime, leadStatusLabels, PageHeader, Panel, quoteStatusLabels, StatusPill } from "@/features/admin/ui";
import { formatMoney } from "@/lib/format";

function StatTile({ label, value, hint, href }: { label: string; value: string; hint?: string; href?: string }) {
  const body = (
    <>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-sans text-3xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </>
  );
  const classes = "block rounded-2xl border border-border bg-card p-5 shadow-card transition-colors";
  return href ? (
    <Link href={href} className={`${classes} hover:border-royal/40`}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}

export function DashboardPage() {
  const { user } = useSession();
  const { data, isPending, error } = useQuery({ queryKey: ["admin", "dashboard"], queryFn: () => adminApi.get<Dashboard>("/admin/dashboard") });

  return (
    <>
      <PageHeader title={`Hola, ${user.name.split(" ")[0]}`} description="Resumen de la actividad comercial con datos reales de la plataforma." />
      {error ? (
        <ErrorState error={error} />
      ) : isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {data.alerts.length > 0 && (
            <ul className="space-y-2" aria-label="Pendientes">
              {data.alerts.map((alert) => (
                <li key={alert.code}>
                  <Link
                    href={alert.href}
                    className="flex items-center justify-between gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm hover:border-warning/60"
                  >
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="size-4 shrink-0 text-warning" aria-hidden />
                      <span className="sr-only">Advertencia:</span>
                      {alert.message}
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile label="Por revisar" value={String(data.quotes.needsReview)} hint="Cotizaciones en revisión" href="/admin/cotizaciones?status=needs_review" />
            <StatTile label="Cotizaciones (30 días)" value={String(data.quotes.last30Days)} href="/admin/cotizaciones" />
            <StatTile
              label="Emitidas este mes"
              value={formatMoney(data.quotes.issuedValueThisMonthCents)}
              hint={`${data.quotes.issuedThisMonth} con importes definitivos`}
            />
            <StatTile label="Prospectos nuevos" value={String(data.leads.new)} hint={`${data.leads.last30Days} en los últimos 30 días`} href="/admin/prospectos?status=new" />
          </div>

          <BillingCard />

          <Panel title="Cotizaciones por día">
            <div className="p-5">
              <QuotesPerDayChart data={data.quotes.perDay} />
            </div>
          </Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Cotizaciones recientes" actions={<Link href="/admin/cotizaciones" className="text-sm text-electric hover:underline">Ver todas</Link>}>
              {data.recentQuotes.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-muted-foreground">Aún no hay cotizaciones.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {data.recentQuotes.map((q) => (
                    <li key={q.id}>
                      <Link href={`/admin/cotizaciones/${q.id}`} className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-surface-raised/60">
                        <span className="min-w-0">
                          <span className="block font-mono text-xs text-muted-foreground">{q.folio}</span>
                          <span className="block truncate">{q.packageName}</span>
                        </span>
                        <span className="flex shrink-0 flex-col items-end gap-1">
                          <span className="tabular-nums">
                            {formatMoney(q.totalCents)}
                            {q.hasPendingAmounts && <span className="text-xs text-muted-foreground"> parcial</span>}
                          </span>
                          <StatusPill status={q.status} label={quoteStatusLabels[q.status]} />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
            <Panel title="Prospectos recientes" actions={<Link href="/admin/prospectos" className="text-sm text-electric hover:underline">Ver todos</Link>}>
              {data.recentLeads.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-muted-foreground">Aún no hay prospectos.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {data.recentLeads.map((l) => (
                    <li key={l.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                      <span className="min-w-0">
                        <span className="block truncate">{l.name}{l.company ? ` · ${l.company}` : ""}</span>
                        <span className="block text-xs text-muted-foreground">
                          {l.source === "quote_builder" ? "Cotizador" : "Formulario de contacto"} · {formatDateTime(l.createdAt)}
                        </span>
                      </span>
                      <StatusPill status={l.status} label={leadStatusLabels[l.status]} />
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}

/** Resumen compacto de cobranza (solo con permiso billing:read). */
function BillingCard() {
  const canRead = useCan("billing:read");
  const { data, error } = useQuery({
    queryKey: ["admin", "billing-summary", 1],
    queryFn: () => adminApi.get<BillingSummary>("/admin/billing/summary", { months: 1 }),
    enabled: canRead,
  });
  if (!canRead || error) return null;

  return (
    <Panel title="Cobranza" actions={<Link href="/admin/cobranza" className="text-sm text-electric hover:underline">Ver reporte</Link>}>
      {!data ? (
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Link href="/admin/contratos?due=overdue" className="px-5 py-4 hover:bg-mist">
            <dl>
              <dt className="text-sm text-muted-foreground">Vencidos</dt>
              <dd className={`mt-1 text-2xl font-semibold tabular-nums ${data.overdue.count > 0 ? "text-magenta" : ""}`}>{formatMoney(data.overdue.amountCents)}</dd>
              <dd className="text-xs text-muted-foreground">{data.overdue.count} {data.overdue.count === 1 ? "cobro" : "cobros"}</dd>
            </dl>
          </Link>
          <Link href="/admin/contratos?due=due_soon" className="px-5 py-4 hover:bg-mist">
            <dl>
              <dt className="text-sm text-muted-foreground">Por vencer (7 días)</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">{formatMoney(data.dueSoon.amountCents)}</dd>
              <dd className="text-xs text-muted-foreground">{data.dueSoon.count} {data.dueSoon.count === 1 ? "cobro" : "cobros"}</dd>
            </dl>
          </Link>
          <div className="px-5 py-4">
            <dl>
              <dt className="text-sm text-muted-foreground">Cobrado este mes</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">{formatMoney(data.collectedThisMonthCents)}</dd>
              <dd className="text-xs text-muted-foreground">{data.activeRentals} rentas activas</dd>
            </dl>
          </div>
        </div>
      )}
    </Panel>
  );
}
