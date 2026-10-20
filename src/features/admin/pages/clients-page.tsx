"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminApi } from "@/features/admin/admin-api";
import type { AdminClientRow, Paged } from "@/features/admin/types";
import { EmptyState, ErrorState, formatDate, PageHeader, Pagination, Panel, TableSkeleton } from "@/features/admin/ui";
import { useListParams } from "@/features/admin/use-list-params";

export function ClientsPage() {
  const { values, page, update } = useListParams(["q"] as const);
  const [search, setSearch] = useState(values.q);

  useEffect(() => {
    const timer = setTimeout(() => search !== values.q && update({ q: search }), 350);
    return () => clearTimeout(timer);
  }, [search, values.q, update]);

  const { data, isPending, error } = useQuery({
    queryKey: ["admin", "clients", values, page],
    queryFn: () => adminApi.get<Paged<AdminClientRow>>("/admin/clients", { ...values, page }),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <PageHeader title="Clientes" description="Clientes que han solicitado cotizaciones." />
      <Panel>
        <div className="border-b border-border p-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input type="search" placeholder="Buscar por nombre, empresa o correo" aria-label="Buscar clientes" className="h-10 pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        {error ? (
          <ErrorState error={error} className="m-4" />
        ) : isPending ? (
          <TableSkeleton />
        ) : data.items.length === 0 ? (
          <EmptyState message="No hay clientes con esta búsqueda." />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Contacto</TableHead>
                  <TableHead className="text-right">Cotizaciones</TableHead>
                  <TableHead className="hidden lg:table-cell">Última solicitud</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link href={`/admin/clientes/${c.id}`} className="font-medium text-electric hover:underline">{c.name}</Link>
                      {c.company && <span className="block text-xs text-muted-foreground">{c.company}</span>}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="block">{c.email}</span>
                      {(c.phone ?? c.whatsapp) && <span className="block text-xs text-muted-foreground">{c.phone ?? c.whatsapp}</span>}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{c.quotes}</TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">{formatDate(c.lastRequestAt)}</TableCell>
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
