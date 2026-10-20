"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowDownRight, ArrowUpRight, Banknote } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/features/admin/admin-api";
import { IncomeChart } from "@/features/admin/billing/income-chart";
import { PaymentDialog } from "@/features/admin/billing/payment-dialog";
import { useCan } from "@/features/admin/session";
import type { BillingSummary, ContractListItem } from "@/features/admin/types";
import { contractTypeLabels, DuePill, ErrorState, formatCalendarDate, PageHeader, Panel } from "@/features/admin/ui";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

const MONTH_OPTIONS = [6, 12, 24] as const;

function Kpi({ label, value, hint, tone, href, children }: { label: string; value: string; hint?: string; tone?: "danger" | "warning"; href?: string; children?: React.ReactNode }) {
  const body = (
    <>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={cn("mt-2 text-2xl font-semibold tabular-nums sm:text-3xl", tone === "danger" && "text-magenta", tone === "warning" && "text-warning")}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {children}
    </>
  );
  const classes = cn(
    "block rounded-2xl border bg-card p-5 shadow-card transition-colors",
    tone === "danger" ? "border-magenta/30" : tone === "warning" ? "border-warning/30" : "border-border",
  );
  return href ? (
    <Link href={href} className={cn(classes, "hover:border-royal/40")}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}

function Delta({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return <p className="mt-1 text-xs text-muted-foreground">Sin cobros el mes anterior</p>;
  const pct = Math.round(((current - previous) / previous) * 100);
  const up = pct >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <p className={cn("mt-1 inline-flex items-center gap-1 text-xs", up ? "text-success" : "text-magenta")}>
      <Icon className="size-3.5" aria-hidden />
      {up ? "+" : ""}
      {pct} % vs. mes anterior ({formatMoney(previous)})
    </p>
  );
}

export function BillingPage() {
  const [months, setMonths] = useState<number>(12);
  const [paying, setPaying] = useState<ContractListItem | null>(null);
  const canWrite = useCan("billing:write");
  const { data, isPending, error } = useQuery({
    queryKey: ["admin", "billing-summary", months],
    queryFn: () => adminApi.get<BillingSummary>("/admin/billing/summary", { months }),
  });

  return (
    <>
      <PageHeader
        title="Reporte de ingresos y cobranza"
        description="Rentas y compras activas, lo que está vencido o por vencer y los ingresos cobrados por mes."
        actions={
          <Button asChild variant="brand">
            <Link href="/admin/contratos">Ver rentas y compras</Link>
          </Button>
        }
      />
      {error ? (
        <ErrorState error={error} />
      ) : isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Kpi label="Rentas activas" value={String(data.activeRentals)} hint={`${data.activePurchases} compras con saldo activo`} href="/admin/contratos?type=rental&status=active" />
            <Kpi label="Ingreso mensual recurrente" value={formatMoney(data.monthlyRecurringCents)} hint="Suma de mensualidades de rentas activas" />
            <Kpi
              label="Vencido"
              value={formatMoney(data.overdue.amountCents)}
              hint={`${data.overdue.count} ${data.overdue.count === 1 ? "cobro vencido" : "cobros vencidos"}`}
              tone={data.overdue.count > 0 ? "danger" : undefined}
              href="/admin/contratos?due=overdue"
            />
            <Kpi
              label="Por vencer (7 días)"
              value={formatMoney(data.dueSoon.amountCents)}
              hint={`${data.dueSoon.count} ${data.dueSoon.count === 1 ? "cobro próximo" : "cobros próximos"}`}
              tone={data.dueSoon.count > 0 ? "warning" : undefined}
              href="/admin/contratos?due=due_soon"
            />
            <Kpi label="Cobrado este mes" value={formatMoney(data.collectedThisMonthCents)}>
              <Delta current={data.collectedThisMonthCents} previous={data.collectedLastMonthCents} />
            </Kpi>
            <Kpi label="Saldo pendiente de compras" value={formatMoney(data.outstandingPurchasesCents)} hint="Compras activas aún no liquidadas" href="/admin/contratos?type=purchase&status=active" />
          </div>

          <Panel
            title="Ingresos cobrados por mes"
            actions={
              <Select value={String(months)} onValueChange={(v) => setMonths(Number(v))}>
                <SelectTrigger className="w-40" aria-label="Periodo del reporte"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTH_OPTIONS.map((m) => (
                    <SelectItem key={m} value={String(m)}>Últimos {m} meses</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
          >
            <div className="p-5">
              <IncomeChart data={data.incomeByMonth} />
            </div>
          </Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            <ContractMiniList
              title="Cobros vencidos"
              items={data.overdueContracts}
              empty="No hay cobros vencidos."
              moreHref="/admin/contratos?due=overdue"
              onPay={canWrite ? setPaying : undefined}
            />
            <ContractMiniList
              title="Próximos cobros (30 días)"
              items={data.upcomingContracts}
              empty="No hay cobros en los próximos 30 días."
              moreHref="/admin/contratos"
              onPay={canWrite ? setPaying : undefined}
            />
          </div>
        </div>
      )}
      <PaymentDialog contract={paying} onClose={() => setPaying(null)} />
    </>
  );
}

function ContractMiniList({ title, items, empty, moreHref, onPay }: { title: string; items: ContractListItem[]; empty: string; moreHref: string; onPay?: (c: ContractListItem) => void }) {
  return (
    <Panel title={title} actions={<Link href={moreHref} className="text-sm text-electric hover:underline">Ver todos</Link>}>
      {items.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
              <Link href={`/admin/contratos/${c.id}`} className="min-w-0 flex-1 rounded-md hover:text-royal">
                <span className="block truncate font-medium">{c.client?.name ?? "Cliente eliminado"}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  <span className="font-mono">{c.reference}</span> · {contractTypeLabels[c.type]} · {c.packageName}
                </span>
              </Link>
              <span className="flex shrink-0 flex-col items-end gap-1">
                <span className="tabular-nums">{c.chargeCents !== null ? formatMoney(c.chargeCents) : "—"}</span>
                <span className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{formatCalendarDate(c.nextDueDate)}</span>
                  <DuePill dueState={c.dueState} daysUntilDue={c.daysUntilDue} />
                </span>
              </span>
              {onPay && c.status === "active" && (
                <Button size="sm" variant="outline" onClick={() => onPay(c)} aria-label={`Registrar pago de ${c.reference}`}>
                  <Banknote /> Registrar pago
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
