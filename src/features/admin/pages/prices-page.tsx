"use client";

import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminApi } from "@/features/admin/admin-api";
import { ComponentEditor } from "@/features/admin/pricing/component-editor";
import { OperatingCostsPanel } from "@/features/admin/pricing/operating-costs-panel";
import { PackageEditor } from "@/features/admin/pricing/package-editor";
import { useCan } from "@/features/admin/session";
import type { AdminComponent, AdminPackageSummary } from "@/features/admin/types";
import { EmptyState, ErrorState, formatBp, PageHeader, Panel, priceModeLabels, StatusPill, TableSkeleton } from "@/features/admin/ui";
import { useListParams } from "@/features/admin/use-list-params";
import { formatMoney } from "@/lib/format";

const categoryLabels = { web: "Web", ecommerce: "E-commerce", pos: "Punto de venta", combo: "Combinado", custom: "A la medida" } as const;
const billingLabels: Record<string, string> = { one_time: "Pago único", monthly: "Mensual", annual: "Anual", third_party_variable: "Según proveedor" };

function PriceCell({ mode, cents }: { mode: keyof typeof priceModeLabels; cents: number | null }) {
  if (mode === "pending" || cents === null) return <StatusPill status="pending_pricing" label="Pendiente" />;
  return (
    <span className="tabular-nums">
      {mode === "starting_at" && <span className="text-xs text-muted-foreground">desde </span>}
      {formatMoney(cents)}
    </span>
  );
}

export function PricesPage() {
  const { values, update } = useListParams(["tab", "pricing"] as const);
  const canCosts = useCan("costs:read");
  const [search, setSearch] = useState("");
  const [componentId, setComponentId] = useState<string | null>(null);
  const [packageId, setPackageId] = useState<string | null>(null);

  const components = useQuery({
    queryKey: ["admin", "components", values.pricing],
    queryFn: () => adminApi.get<{ items: AdminComponent[] }>("/admin/components", { pricing: values.pricing }),
  });
  const packages = useQuery({ queryKey: ["admin", "packages"], queryFn: () => adminApi.get<{ items: AdminPackageSummary[] }>("/admin/packages") });

  const term = search.trim().toLowerCase();
  const filtered = (components.data?.items ?? []).filter((c) => !term || c.name.toLowerCase().includes(term) || c.sku.toLowerCase().includes(term));
  const selected = components.data?.items.find((c) => c.id === componentId) ?? null;

  return (
    <>
      <PageHeader
        title="Catálogo y precios"
        description="Cada cambio de precio se guarda como borrador y se publica de forma auditada. Las cotizaciones emitidas conservan sus importes."
      />
      <Tabs value={values.tab || "componentes"} onValueChange={(tab) => update({ tab: tab === "componentes" ? "" : tab })}>
        <TabsList className="mb-4">
          <TabsTrigger value="componentes">Componentes</TabsTrigger>
          <TabsTrigger value="paquetes">Paquetes</TabsTrigger>
          {canCosts && <TabsTrigger value="costos">Costos de operación</TabsTrigger>}
        </TabsList>

        <TabsContent value="componentes">
          <Panel>
            <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative max-w-sm flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input type="search" placeholder="Buscar por nombre o SKU" aria-label="Buscar componentes" className="h-10 pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground-secondary">
                <Switch checked={values.pricing === "pending"} onCheckedChange={(v) => update({ pricing: v ? "pending" : "" })} />
                Solo sin precio aprobado
              </label>
            </div>
            {components.error ? (
              <ErrorState error={components.error} className="m-4" />
            ) : components.isPending ? (
              <TableSkeleton rows={10} />
            ) : filtered.length === 0 ? (
              <EmptyState message="No hay componentes con estos filtros." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Componente</TableHead>
                    <TableHead className="hidden md:table-cell">Cobro</TableHead>
                    <TableHead className="text-right">Precio vigente</TableHead>
                    {canCosts && <TableHead className="hidden text-right lg:table-cell">Costo</TableHead>}
                    {canCosts && <TableHead className="hidden text-right lg:table-cell">Margen</TableHead>}
                    <TableHead className="hidden sm:table-cell">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="whitespace-normal">
                        <button type="button" onClick={() => setComponentId(c.id)} className="text-left font-medium text-electric hover:underline">
                          {c.name}
                        </button>
                        <span className="block font-mono text-xs text-muted-foreground">{c.sku} · {c.category.name}</span>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">{billingLabels[c.billing] ?? c.billing}</TableCell>
                      <TableCell className="text-right">{c.price ? <PriceCell mode={c.price.mode} cents={c.price.saleCents} /> : "—"}</TableCell>
                      {canCosts && (
                        <TableCell className="hidden text-right tabular-nums lg:table-cell">
                          {c.price?.costCents !== null && c.price?.costCents !== undefined ? formatMoney(c.price.costCents) : "—"}
                        </TableCell>
                      )}
                      {canCosts && <TableCell className="hidden text-right tabular-nums lg:table-cell">{formatBp(c.price?.marginBp)}</TableCell>}
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {c.status !== "active" && <StatusPill status="cancelled" label="Inactivo" />}
                          {c.hasDraft && <StatusPill status="draft" label="Borrador" />}
                          {c.publicVisible && <Badge variant="outline">Complemento</Badge>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="paquetes">
          <Panel>
            {packages.error ? (
              <ErrorState error={packages.error} className="m-4" />
            ) : packages.isPending ? (
              <TableSkeleton />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paquete</TableHead>
                    <TableHead className="text-right">Precio base</TableHead>
                    <TableHead className="hidden text-right md:table-cell">Mensualidad</TableHead>
                    <TableHead className="hidden sm:table-cell">Pendientes</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.data.items.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="whitespace-normal">
                        <button type="button" onClick={() => setPackageId(p.id)} className="text-left font-medium text-electric hover:underline">
                          {p.name}
                        </button>
                        <span className="block text-xs text-muted-foreground">{categoryLabels[p.category]}</span>
                      </TableCell>
                      <TableCell className="text-right">{p.price ? <PriceCell mode={p.price.mode} cents={p.price.baseCents} /> : "—"}</TableCell>
                      <TableCell className="hidden text-right md:table-cell">
                        {!p.rentalEnabled ? (
                          <span className="text-muted-foreground">—</span>
                        ) : p.rental ? (
                          <PriceCell mode={p.rental.mode} cents={p.rental.monthlyCents} />
                        ) : (
                          <StatusPill status="pending_pricing" label="Pendiente" />
                        )}
                      </TableCell>
                      <TableCell className="hidden text-sm whitespace-normal text-muted-foreground sm:table-cell">
                        {p.pendingVariants + p.pendingCredits === 0 ? (
                          "—"
                        ) : (
                          <>
                            {p.pendingVariants > 0 && <span className="block text-warning">{p.pendingVariants} variante(s) sin precio</span>}
                            {p.pendingCredits > 0 && <span className="block">{p.pendingCredits} crédito(s) de retiro</span>}
                          </>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {p.status !== "active" && <StatusPill status="cancelled" label="Inactivo" />}
                          {p.hasDraft && <StatusPill status="draft" label="Borrador" />}
                          {p.featured && <Badge variant="outline">Destacado</Badge>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Panel>
        </TabsContent>

        {canCosts && (
          <TabsContent value="costos">
            <OperatingCostsPanel />
          </TabsContent>
        )}
      </Tabs>

      <ComponentEditor component={selected} onClose={() => setComponentId(null)} />
      <PackageEditor packageId={packageId} onClose={() => setPackageId(null)} />
    </>
  );
}
