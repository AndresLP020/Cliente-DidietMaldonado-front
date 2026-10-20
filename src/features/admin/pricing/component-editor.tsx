"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatMoney } from "@/lib/format";
import { adminApi } from "../admin-api";
import { useCan } from "../session";
import type { AdminComponent, AdminComponentPrice, PriceMode } from "../types";
import { centsToInput, ErrorState, formatBp, parsePesosInput, priceModeLabels, useAdminMutation } from "../ui";
import { PriceHistory } from "./price-history";

export function ComponentEditor({ component, onClose }: { component: AdminComponent | null; onClose: () => void }) {
  return (
    <Sheet open={component !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto bg-canvas data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
        {component && <EditorBody key={component.id} component={component} />}
      </SheetContent>
    </Sheet>
  );
}

function EditorBody({ component }: { component: AdminComponent }) {
  const queryClient = useQueryClient();
  const canCosts = useCan("costs:read");
  const canWrite = useCan("prices:write");
  const canPublish = useCan("prices:publish");
  const canCatalog = useCan("catalog:write");

  const current = component.price;
  const [mode, setMode] = useState<PriceMode>(current?.mode ?? "fixed");
  const [sale, setSale] = useState(centsToInput(current?.saleCents));
  const [cost, setCost] = useState(centsToInput(current?.costCents));
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const history = useQuery({
    queryKey: ["admin", "component-prices", component.id],
    queryFn: () => adminApi.get<{ items: AdminComponentPrice[] }>(`/admin/components/${component.id}/prices`),
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin"] });

  const createDraft = useAdminMutation({
    mutationFn: (body: object) => adminApi.send<AdminComponentPrice>("POST", `/admin/components/${component.id}/prices`, body),
    onSuccess: () => {
      setNotes("");
      void refresh();
    },
  });
  const action = useAdminMutation({
    mutationFn: ({ kind, id }: { kind: "publish" | "restore" | "discard"; id: string }) =>
      kind === "discard"
        ? adminApi.send("DELETE", `/admin/component-prices/${id}`)
        : adminApi.send("POST", `/admin/component-prices/${id}/${kind}`),
    onSuccess: () => void refresh(),
  });
  const updateComponent = useAdminMutation({
    mutationFn: (patch: object) => adminApi.send("PATCH", `/admin/components/${component.id}`, patch),
    onSuccess: () => void refresh(),
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const saleCents = mode === "pending" ? null : parsePesosInput(sale);
    if (mode !== "pending" && saleCents === null) return setFormError("Escribe un precio válido, por ejemplo 1500 o 1,500.50.");
    let costCents: number | null | undefined;
    if (canCosts) {
      costCents = cost.trim() === "" ? null : parsePesosInput(cost);
      if (cost.trim() !== "" && costCents === null) return setFormError("El costo no es un importe válido.");
    }
    createDraft.mutate({ mode, saleCents, ...(canCosts ? { costCents } : {}), notes: notes.trim() || undefined });
  };

  const hasDraft = history.data?.items.some((p) => p.status === "draft");

  return (
    <>
      <SheetHeader>
        <SheetTitle>{component.name}</SheetTitle>
        <SheetDescription>
          <span className="font-mono">{component.sku}</span> · {component.category.name} · por {component.unit}
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-8 px-4 pb-8">
        {canCatalog && (
          <section className="space-y-3 rounded-xl border border-border p-4" aria-label="Disponibilidad">
            <ToggleRow
              id="active"
              label="Activo"
              hint="Los componentes inactivos no se pueden cotizar."
              checked={component.status === "active"}
              disabled={updateComponent.isPending}
              onChange={(v) => updateComponent.mutate({ status: v ? "active" : "inactive" })}
            />
            <ToggleRow
              id="public"
              label="Visible como complemento"
              hint="Se ofrece en el cotizador para agregarse por separado."
              checked={component.publicVisible}
              disabled={updateComponent.isPending}
              onChange={(v) => updateComponent.mutate({ publicVisible: v })}
            />
            <ToggleRow
              id="evaluation"
              label="Requiere valoración"
              hint="Envía la cotización a revisión aunque tenga precio."
              checked={component.requiresEvaluation}
              disabled={updateComponent.isPending}
              onChange={(v) => updateComponent.mutate({ requiresEvaluation: v })}
            />
            {updateComponent.error && <ErrorState error={updateComponent.error} />}
          </section>
        )}

        {canWrite && (
          <form onSubmit={submit} className="space-y-4 rounded-xl border border-border p-4" noValidate>
            <h3 className="font-heading font-semibold">Nueva versión de precio</h3>
            <p className="text-xs text-muted-foreground">
              Se guarda como borrador; los precios públicos no cambian hasta publicarla. Las cotizaciones ya emitidas conservan sus importes.
            </p>
            {hasDraft && <p className="text-xs text-warning">Ya existe un borrador sin publicar para este componente.</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mode">Tipo de precio</Label>
                <Select value={mode} onValueChange={(v) => setMode(v as PriceMode)}>
                  <SelectTrigger id="mode" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fijo</SelectItem>
                    <SelectItem value="starting_at">Desde (mínimo sujeto a valoración)</SelectItem>
                    <SelectItem value="pending">Pendiente (sin importe)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale">Precio de venta (MXN)</Label>
                <Input id="sale" inputMode="decimal" placeholder="0.00" value={mode === "pending" ? "" : sale} disabled={mode === "pending"} onChange={(e) => setSale(e.target.value)} />
              </div>
              {canCosts && (
                <div className="space-y-2">
                  <Label htmlFor="cost">Costo de adquisición (privado)</Label>
                  <Input id="cost" inputMode="decimal" placeholder="Opcional" value={cost} onChange={(e) => setCost(e.target.value)} />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Nota del cambio</Label>
              <Textarea id="notes" rows={2} maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            {createDraft.error && <ErrorState error={createDraft.error} />}
            <Button type="submit" variant="brand" disabled={createDraft.isPending}>
              {createDraft.isPending && <Loader2 className="animate-spin" data-icon="inline-start" />} Guardar borrador
            </Button>
          </form>
        )}

        <section aria-labelledby="history-title" className="space-y-3">
          <h3 id="history-title" className="font-heading font-semibold">Historial de precios</h3>
          {action.error && <ErrorState error={action.error} />}
          {history.error ? (
            <ErrorState error={history.error} />
          ) : history.isPending ? (
            <Skeleton className="h-32 rounded-xl" />
          ) : (
            <PriceHistory
              entries={history.data.items}
              canWrite={canWrite}
              canPublish={canPublish}
              pendingId={action.isPending ? (action.variables?.id ?? null) : null}
              onPublish={(e) => action.mutate({ kind: "publish", id: e.id })}
              onDiscard={(e) => action.mutate({ kind: "discard", id: e.id })}
              onRestore={(e) => action.mutate({ kind: "restore", id: e.id })}
              renderAmounts={(e) => (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
                  <Metric label={priceModeLabels[e.mode]} value={e.saleCents === null ? "Sin importe" : formatMoney(e.saleCents)} />
                  {canCosts && <Metric label="Costo" value={e.costCents === null || e.costCents === undefined ? "—" : formatMoney(e.costCents)} />}
                  {canCosts && <Metric label="Recargo s/costo" value={formatBp(e.markupBp)} />}
                  {canCosts && <Metric label="Margen bruto" value={formatBp(e.marginBp)} />}
                  {canCosts && e.grossProfitCents !== null && e.grossProfitCents !== undefined && <Metric label="Utilidad" value={formatMoney(e.grossProfitCents)} />}
                </dl>
              )}
            />
          )}
        </section>
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

function ToggleRow({ id, label, hint, checked, disabled, onChange }: { id: string; label: string; hint: string; checked: boolean; disabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <Label htmlFor={id}>{label}</Label>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch id={id} checked={checked} disabled={disabled} onCheckedChange={onChange} />
    </div>
  );
}
