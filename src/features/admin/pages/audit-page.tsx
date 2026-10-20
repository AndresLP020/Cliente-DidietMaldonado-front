"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminApi } from "@/features/admin/admin-api";
import type { AuditEntry, Paged } from "@/features/admin/types";
import { EmptyState, ErrorState, formatDateTime, PageHeader, Pagination, Panel, TableSkeleton } from "@/features/admin/ui";
import { useListParams } from "@/features/admin/use-list-params";

const ALL = "all";
const entityLabels: Record<string, string> = {
  component: "Componentes",
  package: "Paquetes",
  quote: "Cotizaciones",
  lead: "Prospectos",
  settings: "Configuración",
  user: "Usuarios",
};

const actionLabels: Record<string, string> = {
  "component_price.published": "Publicó un precio de componente",
  "component_price.restored": "Restauró un precio de componente",
  "component_price.draft_discarded": "Descartó un borrador de precio",
  "package_price.published": "Publicó un precio de paquete",
  "package_price.restored": "Restauró un precio de paquete",
  "package_price.draft_discarded": "Descartó un borrador de paquete",
  "component.updated": "Modificó un componente",
  "package.updated": "Modificó un paquete",
  "quote.created": "Se registró una cotización",
  "quote.revised": "Creó una nueva versión de cotización",
  "quote.status_changed": "Cambió el estado de una cotización",
  "lead.status_changed": "Cambió el estado de un prospecto",
  "settings.updated": "Actualizó la configuración comercial",
  "user.created": "Creó un usuario",
  "user.updated": "Modificó un usuario",
  "auth.login": "Inició sesión",
  "auth.logout": "Cerró sesión",
  "auth.locked": "Cuenta bloqueada por intentos fallidos",
  "auth.password_changed": "Cambió su contraseña",
};

export function AuditPage() {
  const { values, page, update } = useListParams(["entityType"] as const);
  const { data, isPending, error } = useQuery({
    queryKey: ["admin", "audit", values, page],
    queryFn: () => adminApi.get<Paged<AuditEntry>>("/admin/audit", { ...values, page }),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <PageHeader title="Auditoría" description="Registro inmutable de las acciones relevantes. Las entradas no se pueden editar ni borrar." />
      <Panel>
        <div className="border-b border-border p-4">
          <Select value={values.entityType || ALL} onValueChange={(v) => update({ entityType: v === ALL ? "" : v })}>
            <SelectTrigger className="w-full data-[size=default]:h-10 sm:w-56" aria-label="Filtrar por tipo">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todo</SelectItem>
              {Object.entries(entityLabels).map(([value, label]) => (
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
          <EmptyState message="Sin registros." />
        ) : (
          <>
            <ul className="divide-y divide-border">
              {data.items.map((entry) => (
                <li key={entry.id} className="px-5 py-3 text-sm">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p>
                      <span className="font-medium">{entry.actor}</span> · {actionLabels[entry.action] ?? entry.action}
                    </p>
                    <time className="text-xs text-muted-foreground" dateTime={entry.at}>{formatDateTime(entry.at)}</time>
                  </div>
                  {(entry.before !== undefined || entry.after !== undefined) && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-xs text-muted-foreground">Detalle del cambio</summary>
                      <div className="mt-2 grid gap-2 md:grid-cols-2">
                        {entry.before !== undefined && entry.before !== null && <Json label="Antes" value={entry.before} />}
                        {entry.after !== undefined && entry.after !== null && <Json label="Después" value={entry.after} />}
                      </div>
                    </details>
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

function Json({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      <pre className="max-h-48 overflow-auto rounded-lg bg-surface-raised p-3 font-mono text-xs">{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
}
