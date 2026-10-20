"use client";

import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminApi } from "@/features/admin/admin-api";
import { useCan } from "@/features/admin/session";
import type { AdminLead, LeadStatus, Paged } from "@/features/admin/types";
import { EmptyState, ErrorState, formatDateTime, leadStatusLabels, PageHeader, Pagination, Panel, StatusPill, TableSkeleton, useAdminMutation } from "@/features/admin/ui";
import { useListParams } from "@/features/admin/use-list-params";

const ALL = "all";
const sourceLabels = { contact_form: "Formulario de contacto", quote_builder: "Cotizador" } as const;

export function LeadsPage() {
  const { values, page, update } = useListParams(["status", "source"] as const);
  const canWrite = useCan("leads:write");
  const queryClient = useQueryClient();

  const { data, isPending, error } = useQuery({
    queryKey: ["admin", "leads", values, page],
    queryFn: () => adminApi.get<Paged<AdminLead>>("/admin/leads", { ...values, page }),
    placeholderData: keepPreviousData,
  });

  const mutation = useAdminMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) => adminApi.send("PATCH", `/admin/leads/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin"] }),
  });

  return (
    <>
      <PageHeader title="Prospectos" description="Solicitudes recibidas por el formulario de contacto y el cotizador." />
      {mutation.error && <ErrorState error={mutation.error} className="mb-4" />}
      <Panel>
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row">
          <Select value={values.status || ALL} onValueChange={(v) => update({ status: v === ALL ? "" : v })}>
            <SelectTrigger className="w-full data-[size=default]:h-10 sm:w-52" aria-label="Filtrar por estado">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos los estados</SelectItem>
              {Object.entries(leadStatusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={values.source || ALL} onValueChange={(v) => update({ source: v === ALL ? "" : v })}>
            <SelectTrigger className="w-full data-[size=default]:h-10 sm:w-60" aria-label="Filtrar por origen">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos los orígenes</SelectItem>
              {Object.entries(sourceLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error ? (
          <ErrorState error={error} className="m-4" />
        ) : isPending ? (
          <TableSkeleton />
        ) : data.items.length === 0 ? (
          <EmptyState message="No hay prospectos con estos filtros." />
        ) : (
          <>
            <ul className="divide-y divide-border">
              {data.items.map((lead) => (
                <li key={lead.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto] md:items-start">
                  <div className="min-w-0 space-y-1">
                    <p className="font-medium">
                      {lead.name}
                      {lead.company && <span className="text-muted-foreground"> · {lead.company}</span>}
                    </p>
                    <p className="text-sm">
                      <a href={`mailto:${lead.email}`} className="break-all text-electric hover:underline">{lead.email}</a>
                      {lead.phone && <span className="text-muted-foreground"> · {lead.phone}</span>}
                    </p>
                    <p className="line-clamp-2 text-sm text-foreground-secondary">{lead.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {sourceLabels[lead.source]} · <span className="font-mono">{lead.reference}</span> · {formatDateTime(lead.createdAt)}
                      {lead.quoteId && (
                        <>
                          {" · "}
                          <Link href={`/admin/cotizaciones/${lead.quoteId}`} className="text-electric hover:underline">Ver cotización</Link>
                        </>
                      )}
                    </p>
                  </div>
                  {canWrite ? (
                    <Select value={lead.status} onValueChange={(status) => mutation.mutate({ id: lead.id, status: status as LeadStatus })}>
                      <SelectTrigger className="w-full md:w-44" aria-label={`Estado del prospecto ${lead.name}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(leadStatusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <StatusPill status={lead.status} label={leadStatusLabels[lead.status]} />
                  )}
                </li>
              ))}
            </ul>
            <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPage={(p) => update({ page: p })} />
          </>
        )}
      </Panel>
    </>
  );
}
