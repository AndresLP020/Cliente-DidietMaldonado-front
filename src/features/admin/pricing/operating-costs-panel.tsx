"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatMoney } from "@/lib/format";
import { adminApi } from "../admin-api";
import { useCan } from "../session";
import type { OperatingCost } from "../types";
import { centsToInput, EmptyState, ErrorState, Panel, parsePesosInput, StatusPill, TableSkeleton, useAdminMutation } from "../ui";

const unitLabels: Record<OperatingCost["unit"], string> = { month: "al mes", year: "al año", gb_month: "por GB al mes" };

/**
 * Costos de operación de ReaperSys (hosting, almacenamiento, dominio). Alimentan la mensualidad
 * sugerida de la suscripción; no son públicos y solo los ve quien tiene permiso de costos.
 */
export function OperatingCostsPanel() {
  const { data, error, isPending } = useQuery({
    queryKey: ["admin", "operating-costs"],
    queryFn: () => adminApi.get<{ items: OperatingCost[] }>("/admin/operating-costs"),
  });

  return (
    <Panel>
      <p className="border-b border-border p-4 text-sm text-foreground-secondary">
        Referencias de mercado para calcular la mensualidad sugerida de cada paquete. Mientras un costo no esté confirmado, las
        mensualidades que lo usan se muestran como «desde» y las cotizaciones en suscripción pasan a revisión.
      </p>
      {error ? (
        <ErrorState error={error} className="m-4" />
      ) : isPending ? (
        <TableSkeleton rows={4} />
      ) : data.items.length === 0 ? (
        <EmptyState message="Aún no hay costos de operación. Ejecuta el seed para cargar las referencias." />
      ) : (
        <ul className="divide-y divide-border">
          {data.items.map((cost) => (
            <CostRow key={`${cost.id}-${cost.costCents}-${cost.confirmed}`} cost={cost} />
          ))}
        </ul>
      )}
    </Panel>
  );
}

function CostRow({ cost }: { cost: OperatingCost }) {
  const queryClient = useQueryClient();
  const canWrite = useCan("prices:write");
  const [value, setValue] = useState(centsToInput(cost.costCents));
  const [confirmed, setConfirmed] = useState(cost.confirmed);
  const [note, setNote] = useState(cost.sourceNote);
  const [formError, setFormError] = useState<string | null>(null);
  const save = useAdminMutation({
    mutationFn: (body: object) => adminApi.send("PATCH", `/admin/operating-costs/${cost.id}`, body),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin"] }),
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    // El costo por GB se captura con centavos de precisión (p. ej. $0.28).
    const costCents = parsePesosInput(value);
    if (costCents === null) return setFormError("Escribe un importe válido.");
    save.mutate({ costCents, confirmed, sourceNote: note.trim() });
  };

  return (
    <li className="space-y-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium">{cost.name}</p>
          <p className="font-mono text-xs text-muted-foreground">{cost.key}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="tabular-nums">
            {formatMoney(cost.costCents)} <span className="text-xs text-muted-foreground">{unitLabels[cost.unit]}</span>
          </span>
          {cost.confirmed ? <StatusPill status="approved" label="Confirmado" /> : <StatusPill status="pending_pricing" label="Por confirmar" />}
        </div>
      </div>
      {cost.sourceUrl && (
        <a href={cost.sourceUrl} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-xs text-electric underline underline-offset-4">
          Fuente de la referencia <ExternalLink className="size-3" aria-hidden />
        </a>
      )}
      {canWrite ? (
        <form onSubmit={submit} noValidate className="grid gap-3 sm:grid-cols-[9rem_1fr_auto_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor={`cost-${cost.id}`}>Costo (MXN)</Label>
            <Input id={`cost-${cost.id}`} inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`note-${cost.id}`}>Nota de la fuente</Label>
            <Input id={`note-${cost.id}`} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <label className="flex h-9 items-center gap-2 text-sm text-foreground-secondary">
            <Switch checked={confirmed} onCheckedChange={setConfirmed} /> Confirmado
          </label>
          <Button type="submit" variant="brand" disabled={save.isPending}>
            {save.isPending && <Loader2 className="animate-spin" data-icon="inline-start" />} Guardar
          </Button>
        </form>
      ) : (
        cost.sourceNote && <p className="text-xs text-muted-foreground">{cost.sourceNote}</p>
      )}
      {formError && <p className="text-sm text-destructive">{formError}</p>}
      {save.error && <ErrorState error={save.error} />}
    </li>
  );
}
