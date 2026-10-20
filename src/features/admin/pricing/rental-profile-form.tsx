"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { formatMoney } from "@/lib/format";
import { adminApi } from "../admin-api";
import { useCan } from "../session";
import type { OperatingCost, RentalProfile, RentalSuggestion } from "../types";
import { centsToInput, ErrorState, parsePesosInput, priceModeLabels, useAdminMutation } from "../ui";

const NO_HOSTING = "none";

/** Qué cubre la suscripción del paquete y qué valor se recupera en el plazo (alimenta la sugerencia). */
export function RentalProfileForm({ packageId, profile, onSaved }: { packageId: string; profile: RentalProfile; onSaved: () => void }) {
  const canCosts = useCan("costs:read");
  const costs = useQuery({
    queryKey: ["admin", "operating-costs"],
    queryFn: () => adminApi.get<{ items: OperatingCost[] }>("/admin/operating-costs"),
    enabled: canCosts,
  });
  const hostingOptions = (costs.data?.items ?? []).filter((c) => c.unit === "month");

  const [enabled, setEnabled] = useState(profile.enabled);
  const [hosting, setHosting] = useState(profile.hostingCostKey ?? NO_HOSTING);
  const [storage, setStorage] = useState(String(profile.storageGb));
  const [domain, setDomain] = useState(profile.includesDomain);
  const [hardware, setHardware] = useState(profile.hardwareUpfront);
  const [recoverableMode, setRecoverableMode] = useState(profile.recoverableMode);
  const [recoverable, setRecoverable] = useState(centsToInput(profile.recoverableCents));
  const [formError, setFormError] = useState<string | null>(null);

  const save = useAdminMutation({
    mutationFn: (rentalProfile: object) => adminApi.send("PATCH", `/admin/packages/${packageId}`, { rentalProfile }),
    onSuccess: onSaved,
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const storageGb = Number(storage);
    if (!Number.isInteger(storageGb) || storageGb < 0) return setFormError("El almacenamiento debe ser un número entero de GB.");
    let recoverableCents: number | null = null;
    if (recoverableMode === "manual") {
      recoverableCents = parsePesosInput(recoverable);
      if (recoverableCents === null) return setFormError("Escribe el valor a recuperar.");
    }
    save.mutate({
      enabled,
      ...(canCosts ? { hostingCostKey: hosting === NO_HOSTING ? null : hosting } : {}),
      storageGb,
      includesDomain: domain,
      hardwareUpfront: hardware,
      recoverableMode,
      recoverableCents,
    });
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-xl border border-border p-4" aria-label="Perfil de la suscripción">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-heading font-semibold">Suscripción mensual</h3>
          <p className="text-xs text-muted-foreground">ReaperSys conserva la propiedad; la mensualidad cubre lo que se indica aquí.</p>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Ofrecer en suscripción" />
      </div>

      {enabled && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {canCosts && (
              <div className="space-y-2">
                <Label htmlFor="rental-hosting">Hosting</Label>
                <Select value={hosting} onValueChange={setHosting}>
                  <SelectTrigger id="rental-hosting" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_HOSTING}>Sin hosting (instalación local)</SelectItem>
                    {hostingOptions.map((c) => (
                      <SelectItem key={c.key} value={c.key}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="rental-storage">Almacenamiento (GB)</Label>
              <Input id="rental-storage" inputMode="numeric" value={storage} onChange={(e) => setStorage(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rental-recoverable-mode">Valor a recuperar en el plazo</Label>
              <Select value={recoverableMode} onValueChange={(v) => setRecoverableMode(v as RentalProfile["recoverableMode"])}>
                <SelectTrigger id="rental-recoverable-mode" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="package_price">Precio publicado del paquete</SelectItem>
                  <SelectItem value="manual">Importe manual (p. ej. solo el software)</SelectItem>
                  <SelectItem value="combo_parts">Suma de sus paquetes con el descuento del combo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {recoverableMode === "manual" && (
              <div className="space-y-2">
                <Label htmlFor="rental-recoverable">Importe a recuperar (MXN)</Label>
                <Input id="rental-recoverable" inputMode="decimal" value={recoverable} onChange={(e) => setRecoverable(e.target.value)} />
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <label className="flex items-center gap-2">
              <Switch checked={domain} onCheckedChange={setDomain} /> Incluye dominio
            </label>
            <label className="flex items-center gap-2">
              <Switch checked={hardware} onCheckedChange={setHardware} /> Equipo de contado
            </label>
          </div>
          {(profile.services.length > 0 || profile.coveredComponents.length > 0) && (
            <p className="text-xs text-muted-foreground">
              Servicios incluidos: {[...profile.services, ...profile.coveredComponents].join(", ")}.
            </p>
          )}
        </>
      )}

      {formError && <p className="text-sm text-destructive">{formError}</p>}
      {save.error && <ErrorState error={save.error} />}
      <Button type="submit" variant="glass" disabled={save.isPending}>
        {save.isPending && <Loader2 className="animate-spin" data-icon="inline-start" />} Guardar perfil de renta
      </Button>
    </form>
  );
}

/** Desglose de la mensualidad sugerida a partir de los costos de operación. */
export function RentalSuggestionCard({ suggestion, onUse }: { suggestion: RentalSuggestion; onUse?: () => void }) {
  return (
    <div className="space-y-3 rounded-lg border border-royal/40 bg-royal/10 p-3 text-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-medium">Mensualidad sugerida</p>
        <p className="font-heading text-lg font-semibold tabular-nums">
          {suggestion.suggestedMonthlyCents === null ? "Faltan datos" : formatMoney(suggestion.suggestedMonthlyCents)}
          {suggestion.suggestedMonthlyCents !== null && (
            <span className="ml-1 text-xs font-normal text-muted-foreground">({priceModeLabels[suggestion.mode]})</span>
          )}
        </p>
      </div>
      <ul className="space-y-1 text-xs text-foreground-secondary">
        {suggestion.lines.map((line) => (
          <li key={line.key} className="flex justify-between gap-3">
            <span>
              {line.label}
              {line.note && <span className="text-muted-foreground"> · {line.note}</span>}
            </span>
            <span className="tabular-nums">{line.monthlyCents === null ? "—" : formatMoney(line.monthlyCents)}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        Plazo de {suggestion.termMonths} meses{suggestion.financingBp ? ` · recargo ${suggestion.financingBp / 100} %` : ""} · redondeado al peso.
      </p>
      {suggestion.missing.length > 0 && <p className="text-xs text-warning">Falta: {suggestion.missing.join(", ")}.</p>}
      {suggestion.unconfirmed.length > 0 && <p className="text-xs text-muted-foreground">Por confirmar: {suggestion.unconfirmed.join(", ")}.</p>}
      {onUse && suggestion.suggestedMonthlyCents !== null && (
        <Button type="button" variant="glass" size="sm" onClick={onUse}>
          Usar en el borrador
        </Button>
      )}
    </div>
  );
}
