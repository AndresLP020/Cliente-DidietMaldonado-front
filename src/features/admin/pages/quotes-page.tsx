"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminApi } from "@/features/admin/admin-api";
import type { AdminQuoteRow, Paged } from "@/features/admin/types";
import { EmptyState, ErrorState, formatDate, PageHeader, Pagination, Panel, quoteStatusLabels, StatusPill, TableSkeleton } from "@/features/admin/ui";
import { useListParams } from "@/features/admin/use-list-params";
import { formatMoney } from "@/lib/format";

const ALL = "all";

const PLAN_SHORT: Record<string, string> = { month_to_month: "mes con mes", semiannual: "semestral", annual: "anual" };

export function QuotesPage() {
  const { values, page, update } = useListParams(["status", "q"] as const);
  const [search, setSearch] = useState(values.q);

  useEffect(() => {
    const timer = setTimeout(() => search !== values.q && update({ q: search }), 350);
    return () => clearTimeout(timer);
  }, [search, values.q, update]);

  const { data, isPending, error } = useQuery({
    queryKey: ["admin", "quotes", values, page],
    queryFn: () => adminApi.get<Paged<AdminQuoteRow>>("/admin/quotes", { ...values, page }),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <PageHeader title="Cotizaciones" description="Solicitudes del cotizador con su estado, versión vigente e importes calculados por el sistema." />
      <Panel>
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              type="search"
              placeholder="Buscar por folio, cliente o correo"
              aria-label="Buscar cotizaciones"
              className="h-10 pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={values.status || ALL} onValueChange={(v) => update({ status: v === ALL ? "" : v })}>
            <SelectTrigger className="w-full data-[size=default]:h-10 sm:w-52" aria-label="Filtrar por estado">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos los estados</SelectItem>
              {Object.entries(quoteStatusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error ? (
          <ErrorState error={error} className="m-4" />
        ) : isPending ? (
          <TableSkeleton />
        ) : data.items.length === 0 ? (
          <EmptyState message="No hay cotizaciones con estos filtros." />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Folio</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Solución</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="hidden sm:table-cell">Estado</TableHead>
                  <TableHead className="hidden lg:table-cell">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell>
                      <Link href={`/admin/cotizaciones/${q.id}`} className="font-mono text-sm text-electric hover:underline">
                        {q.folio}
                      </Link>
                      {q.version > 1 && <span className="ml-1 text-xs text-muted-foreground">v{q.version}</span>}
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <span className="block max-w-48 truncate">{q.client?.name ?? "—"}</span>
                      {q.client?.company && <span className="block max-w-48 truncate text-xs text-muted-foreground">{q.client.company}</span>}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{q.packageName}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(q.totalCents)}
                      {q.hasPendingAmounts && <span className="block text-xs text-muted-foreground">parcial</span>}
                      {q.paymentMode === "subscription" && (
                        <span className="block text-xs text-electric">
                          {q.monthlyCents != null ? `+ ${formatMoney(q.monthlyCents)} / mes` : "Suscripción"}
                          {q.subscriptionPlan && q.subscriptionPlan !== "monthly" && ` · ${PLAN_SHORT[q.subscriptionPlan] ?? ""}`}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <StatusPill status={q.status} label={quoteStatusLabels[q.status]} />
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">{formatDate(q.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPage={(p) => update({ page: p })} />
          </>
        )}
      </Panel>
    </>
  );
}
