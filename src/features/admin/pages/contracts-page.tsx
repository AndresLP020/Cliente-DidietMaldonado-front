"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminApi } from "@/features/admin/admin-api";
import { CreateContractDialog } from "@/features/admin/billing/create-contract-dialog";
import { useCan } from "@/features/admin/session";
import type { ContractListItem, Paged } from "@/features/admin/types";
import {
  billingPeriodLabels,
  contractStatusLabels,
  contractTypeLabels,
  DuePill,
  EmptyState,
  ErrorState,
  formatCalendarDate,
  PageHeader,
  Pagination,
  Panel,
  StatusPill,
  TableSkeleton,
} from "@/features/admin/ui";
import { useListParams } from "@/features/admin/use-list-params";
import { formatMoney } from "@/lib/format";

const ALL = "all";
const dueFilterLabels = { overdue: "Vencidos", due_soon: "Por vencer (7 días)" } as const;

/** Importe que se cobra: renta = mensualidad × periodo; compra = saldo pendiente. */
export function chargeSummary(c: Pick<ContractListItem, "type" | "chargeCents" | "billingMonths" | "totalCents" | "balanceCents">): { amount: string; detail: string } {
  if (c.type === "rental") {
    return { amount: c.chargeCents !== null ? formatMoney(c.chargeCents) : "—", detail: billingPeriodLabels[c.billingMonths] };
  }
  return {
    amount: c.balanceCents !== null ? formatMoney(c.balanceCents) : "—",
    detail: c.totalCents !== null ? `Saldo de ${formatMoney(c.totalCents)}` : "Saldo",
  };
}

export function ContractsPage() {
  const { values, page, update } = useListParams(["type", "status", "due", "q"] as const);
  const [search, setSearch] = useState(values.q);
  const [createOpen, setCreateOpen] = useState(false);
  const canWrite = useCan("billing:write");

  useEffect(() => {
    const timer = setTimeout(() => search !== values.q && update({ q: search }), 350);
    return () => clearTimeout(timer);
  }, [search, values.q, update]);

  const { data, isPending, error } = useQuery({
    queryKey: ["admin", "contracts", values, page],
    queryFn: () => adminApi.get<Paged<ContractListItem>>("/admin/contracts", { ...values, page }),
    placeholderData: keepPreviousData,
  });

  const filter = (key: "type" | "status" | "due", label: string, options: Record<string, string>, allLabel: string) => (
    <Select value={values[key] || ALL} onValueChange={(v) => update({ [key]: v === ALL ? "" : v })}>
      <SelectTrigger className="w-full data-[size=default]:h-10 sm:w-48" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {Object.entries(options).map(([value, text]) => (
          <SelectItem key={value} value={value}>{text}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <>
      <PageHeader
        title="Rentas y compras"
        description="Paquetes rentados y vendidos a cada cliente, con su próximo cobro y el historial de pagos."
        actions={
          canWrite && (
            <Button variant="brand" onClick={() => setCreateOpen(true)}>
              <Plus data-icon="inline-start" /> Nueva renta o compra
            </Button>
          )
        }
      />
      <Panel>
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:flex-wrap">
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input type="search" placeholder="Referencia, cliente o paquete" aria-label="Buscar rentas y compras" className="h-10 pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {filter("type", "Filtrar por modalidad", contractTypeLabels, "Rentas y compras")}
          {filter("status", "Filtrar por estado", contractStatusLabels, "Todos los estados")}
          {filter("due", "Filtrar por vencimiento", dueFilterLabels, "Cualquier vencimiento")}
        </div>

        {error ? (
          <ErrorState error={error} className="m-4" />
        ) : isPending ? (
          <TableSkeleton />
        ) : data.items.length === 0 ? (
          <EmptyState message={canWrite ? "No hay registros con estos filtros. Usa «Nueva renta o compra» para dar de alta el primero." : "No hay registros con estos filtros."} />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referencia</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden lg:table-cell">Paquete</TableHead>
                  <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                  <TableHead className="text-right">Importe</TableHead>
                  <TableHead>Próximo cobro</TableHead>
                  <TableHead className="hidden md:table-cell">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((c) => {
                  const charge = chargeSummary(c);
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Link href={`/admin/contratos/${c.id}`} className="font-mono text-sm text-electric hover:underline">{c.reference}</Link>
                      </TableCell>
                      <TableCell className="max-w-48">
                        <span className="block truncate font-medium">{c.client?.name ?? "—"}</span>
                        {c.client?.company && <span className="block truncate text-xs text-muted-foreground">{c.client.company}</span>}
                      </TableCell>
                      <TableCell className="hidden max-w-56 truncate lg:table-cell">{c.packageName}</TableCell>
                      <TableCell className="hidden sm:table-cell">{contractTypeLabels[c.type]}</TableCell>
                      <TableCell className="text-right">
                        <span className="block tabular-nums">{charge.amount}</span>
                        <span className="block text-xs text-muted-foreground">{charge.detail}</span>
                      </TableCell>
                      <TableCell>
                        <span className="block text-sm">{formatCalendarDate(c.nextDueDate)}</span>
                        {c.status === "active" && <DuePill dueState={c.dueState} daysUntilDue={c.daysUntilDue} />}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <StatusPill status={c.status} label={contractStatusLabels[c.status]} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPage={(p) => update({ page: p })} />
          </>
        )}
      </Panel>
      {canWrite && <CreateContractDialog open={createOpen} onOpenChange={setCreateOpen} />}
    </>
  );
}
