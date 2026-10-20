"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { AdminPackageDetail, PackagePriceVersion, PriceMode } from "../types";
import { centsToInput, ErrorState, parsePesosInput, priceModeLabels, useAdminMutation } from "../ui";
import { PriceHistory } from "./price-history";
import { RentalProfileForm, RentalSuggestionCard } from "./rental-profile-form";

export function PackageEditor({ packageId, onClose }: { packageId: string | null; onClose: () => void }) {
  return (
    <Sheet open={packageId !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto bg-canvas data-[side=right]:w-full data-[side=right]:sm:max-w-2xl">
        {packageId && <Loader key={packageId} packageId={packageId} />}
      </SheetContent>
    </Sheet>
  );
}

function Loader({ packageId }: { packageId: string }) {
  const { data, error, isPending } = useQuery({
    queryKey: ["admin", "package", packageId],
    queryFn: () => adminApi.get<AdminPackageDetail>(`/admin/packages/${packageId}`),
  });
  if (error) return <ErrorState error={error} className="m-4" />;
  if (isPending) return <Skeleton className="m-4 h-96 rounded-xl" />;
  // La clave reinicia el formulario cuando cambia la versión vigente (p. ej. tras publicar).
  const published = data.history.find((h) => h.status === "published");
  return <EditorBody key={published?.id ?? "none"} detail={data} />;
}

interface AmountField {
  pending: boolean;
  value: string;
}

function EditorBody({ detail }: { detail: AdminPackageDetail }) {
  const queryClient = useQueryClient();
  const canWrite = useCan("prices:write");
  const canPublish = useCan("prices:publish");
  const canCatalog = useCan("catalog:write");
  const published = detail.history.find((h) => h.status === "published");

  const variantOptions = detail.variantGroups.flatMap((g) =>
    g.options.filter((o) => o.key !== g.defaultOption).map((o) => ({ groupKey: g.key, groupName: g.name, optionKey: o.key, name: o.name })),
  );

  const [mode, setMode] = useState<PriceMode>(published?.mode ?? "fixed");
  const [base, setBase] = useState(centsToInput(published?.baseCents));
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const renting = detail.rentalProfile.enabled;
  const [rentalMode, setRentalMode] = useState<PriceMode>(published?.rental?.mode ?? "pending");
  const [monthly, setMonthly] = useState(centsToInput(published?.rental?.monthlyCents));
  const [setupFee, setSetupFee] = useState(centsToInput(published?.rental?.setupFeeCents));
  const [variants, setVariants] = useState<Record<string, AmountField>>(() =>
    Object.fromEntries(
      variantOptions.map((o) => {
        const v = published?.variantPrices.find((p) => p.groupKey === o.groupKey && p.optionKey === o.optionKey);
        return [`${o.groupKey}/${o.optionKey}`, { pending: !v || v.mode === "pending", value: centsToInput(v?.deltaCents) }];
      }),
    ),
  );
  const [credits, setCredits] = useState<Record<string, AmountField>>(() =>
    Object.fromEntries(
      detail.removableItems.map((item) => {
        const c = published?.removalCredits.find((r) => r.componentId === item.componentId);
        return [item.componentId, { pending: !c || c.mode === "pending", value: centsToInput(c?.creditCents) }];
      }),
    ),
  );

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin"] });
  const createDraft = useAdminMutation({
    mutationFn: (body: object) => adminApi.send("POST", `/admin/packages/${detail.id}/prices`, body),
    onSuccess: () => {
      setNotes("");
      void refresh();
    },
  });
  const action = useAdminMutation({
    mutationFn: ({ kind, id }: { kind: "publish" | "restore" | "discard"; id: string }) =>
      kind === "discard" ? adminApi.send("DELETE", `/admin/package-prices/${id}`) : adminApi.send("POST", `/admin/package-prices/${id}/${kind}`),
    onSuccess: () => void refresh(),
  });
  const updatePackage = useAdminMutation({
    mutationFn: (patch: object) => adminApi.send("PATCH", `/admin/packages/${detail.id}`, patch),
    onSuccess: () => void refresh(),
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const baseCents = mode === "pending" ? null : parsePesosInput(base);
    if (mode !== "pending" && baseCents === null) return setFormError("Escribe un precio base válido.");

    const variantPrices = [];
    for (const o of variantOptions) {
      const field = variants[`${o.groupKey}/${o.optionKey}`]!;
      if (field.pending) {
        variantPrices.push({ groupKey: o.groupKey, optionKey: o.optionKey, mode: "pending", deltaCents: null });
        continue;
      }
      const delta = parsePesosInput(field.value, { allowNegative: true });
      if (delta === null) return setFormError(`Diferencia inválida para «${o.name}».`);
      variantPrices.push({ groupKey: o.groupKey, optionKey: o.optionKey, mode: "fixed", deltaCents: delta });
    }
    const removalCredits = [];
    for (const item of detail.removableItems) {
      const field = credits[item.componentId]!;
      if (field.pending) {
        removalCredits.push({ componentId: item.componentId, mode: "pending", creditCents: null });
        continue;
      }
      const credit = parsePesosInput(field.value);
      if (credit === null) return setFormError(`Crédito inválido para «${item.name}».`);
      removalCredits.push({ componentId: item.componentId, mode: "fixed", creditCents: credit });
    }
    let rental: object | undefined;
    if (renting) {
      const monthlyCents = rentalMode === "pending" ? null : parsePesosInput(monthly);
      if (rentalMode !== "pending" && monthlyCents === null) return setFormError("Escribe una mensualidad válida o márcala como pendiente.");
      const setupFeeCents = setupFee.trim() === "" ? null : parsePesosInput(setupFee);
      if (setupFee.trim() !== "" && setupFeeCents === null) return setFormError("Pago inicial inválido.");
      rental = { mode: rentalMode, monthlyCents, setupFeeCents };
    }
    createDraft.mutate({ mode, baseCents, variantPrices, removalCredits, rental, notes: notes.trim() || undefined });
  };

  const optionName = (groupKey: string, optionKey: string) => variantOptions.find((o) => o.groupKey === groupKey && o.optionKey === optionKey)?.name ?? optionKey;
  const itemName = (id: string) => detail.removableItems.find((i) => i.componentId === id)?.name ?? "Componente";

  return (
    <>
      <SheetHeader>
        <SheetTitle>{detail.name}</SheetTitle>
        <SheetDescription>
          {detail.comboPolicy
            ? `Combo: retirar esenciales → ${detail.comboPolicy.onEssentialRemoval === "review" ? "revisión" : "recálculo"}; cambiar variantes → ${detail.comboPolicy.onVariantChange === "review" ? "revisión" : "recálculo"}.`
            : "Precio base con las variantes predeterminadas."}
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-8 px-4 pb-8">
        {canCatalog && (
          <section className="space-y-3 rounded-xl border border-border p-4" aria-label="Publicación del paquete">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="pkg-active">Activo en el sitio y el cotizador</Label>
              <Switch id="pkg-active" checked={detail.status === "active"} disabled={updatePackage.isPending} onCheckedChange={(v) => updatePackage.mutate({ status: v ? "active" : "inactive" })} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="pkg-featured">Destacado en la página de inicio</Label>
              <Switch id="pkg-featured" checked={detail.featured} disabled={updatePackage.isPending} onCheckedChange={(v) => updatePackage.mutate({ featured: v })} />
            </div>
            {updatePackage.error && <ErrorState error={updatePackage.error} />}
          </section>
        )}

        {canCatalog && <RentalProfileForm packageId={detail.id} profile={detail.rentalProfile} onSaved={() => void refresh()} />}

        {canWrite && (
          <form onSubmit={submit} noValidate className="space-y-5 rounded-xl border border-border p-4">
            <div>
              <h3 className="font-heading font-semibold">Nueva versión de precio</h3>
              <p className="text-xs text-muted-foreground">Se guarda como borrador. Los campos parten de la versión vigente.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pkg-mode">Tipo de precio</Label>
                <Select value={mode} onValueChange={(v) => setMode(v as PriceMode)}>
                  <SelectTrigger id="pkg-mode" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fijo</SelectItem>
                    <SelectItem value="starting_at">Desde</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pkg-base">Precio base (MXN)</Label>
                <Input id="pkg-base" inputMode="decimal" value={mode === "pending" ? "" : base} disabled={mode === "pending"} onChange={(e) => setBase(e.target.value)} />
              </div>
            </div>

            {variantOptions.length > 0 && (
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium">Diferencia por variante (respecto a la predeterminada)</legend>
                {variantOptions.map((o) => {
                  const key = `${o.groupKey}/${o.optionKey}`;
                  return (
                    <AmountRow
                      key={key}
                      id={`variant-${key}`}
                      label={`${o.groupName}: ${o.name}`}
                      field={variants[key]!}
                      onChange={(field) => setVariants((s) => ({ ...s, [key]: field }))}
                      placeholder="+1500 o -500"
                    />
                  );
                })}
              </fieldset>
            )}

            {detail.removableItems.length > 0 && (
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium">Crédito al retirar componentes</legend>
                <p className="text-xs text-muted-foreground">Monto que se descuenta si el cliente retira el componente. No equivale a su precio individual.</p>
                {detail.removableItems.map((item) => (
                  <AmountRow
                    key={item.componentId}
                    id={`credit-${item.componentId}`}
                    label={`${item.name}${item.essential ? " (esencial)" : ""}`}
                    field={credits[item.componentId]!}
                    onChange={(field) => setCredits((s) => ({ ...s, [item.componentId]: field }))}
                  />
                ))}
              </fieldset>
            )}

            {renting && (
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium">Suscripción mensual</legend>
                {detail.rentalSuggestion && (
                  <RentalSuggestionCard
                    suggestion={detail.rentalSuggestion}
                    onUse={() => {
                      setRentalMode(detail.rentalSuggestion!.mode);
                      setMonthly(centsToInput(detail.rentalSuggestion!.suggestedMonthlyCents));
                    }}
                  />
                )}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="rental-mode">Tipo de mensualidad</Label>
                    <Select value={rentalMode} onValueChange={(v) => setRentalMode(v as PriceMode)}>
                      <SelectTrigger id="rental-mode" className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fija</SelectItem>
                        <SelectItem value="starting_at">Desde</SelectItem>
                        <SelectItem value="pending">Pendiente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rental-monthly">Mensualidad (MXN)</Label>
                    <Input id="rental-monthly" inputMode="decimal" value={rentalMode === "pending" ? "" : monthly} disabled={rentalMode === "pending"} onChange={(e) => setMonthly(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rental-setup">{detail.rentalProfile.hardwareUpfront ? "Equipo de contado (MXN)" : "Pago inicial (MXN)"}</Label>
                    <Input id="rental-setup" inputMode="decimal" placeholder="Opcional" value={setupFee} onChange={(e) => setSetupFee(e.target.value)} />
                  </div>
                </div>
              </fieldset>
            )}

            <div className="space-y-2">
              <Label htmlFor="pkg-notes">Nota del cambio</Label>
              <Textarea id="pkg-notes" rows={2} maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            {createDraft.error && <ErrorState error={createDraft.error} />}
            <Button type="submit" variant="brand" disabled={createDraft.isPending}>
              {createDraft.isPending && <Loader2 className="animate-spin" data-icon="inline-start" />} Guardar borrador
            </Button>
          </form>
        )}

        <section aria-labelledby="pkg-history" className="space-y-3">
          <h3 id="pkg-history" className="font-heading font-semibold">Historial de precios</h3>
          {action.error && <ErrorState error={action.error} />}
          <PriceHistory<PackagePriceVersion>
            entries={detail.history}
            canWrite={canWrite}
            canPublish={canPublish}
            pendingId={action.isPending ? (action.variables?.id ?? null) : null}
            onPublish={(e) => action.mutate({ kind: "publish", id: e.id })}
            onDiscard={(e) => action.mutate({ kind: "discard", id: e.id })}
            onRestore={(e) => action.mutate({ kind: "restore", id: e.id })}
            renderAmounts={(e) => (
              <div className="space-y-1">
                <p>
                  <span className="text-muted-foreground">{priceModeLabels[e.mode]}: </span>
                  {e.baseCents === null ? "Sin importe" : formatMoney(e.baseCents)}
                </p>
                {e.variantPrices.map((v) => (
                  <p key={`${v.groupKey}/${v.optionKey}`} className="text-xs text-foreground-secondary">
                    {optionName(v.groupKey, v.optionKey)}: {v.deltaCents === null ? "pendiente" : `${v.deltaCents >= 0 ? "+" : "−"}${formatMoney(Math.abs(v.deltaCents))}`}
                  </p>
                ))}
                {e.rental && (
                  <p className="text-xs text-foreground-secondary">
                    Mensualidad: {e.rental.monthlyCents === null ? "pendiente" : `${e.rental.mode === "starting_at" ? "desde " : ""}${formatMoney(e.rental.monthlyCents)}`}
                    {e.rental.setupFeeCents !== null && ` · pago inicial ${formatMoney(e.rental.setupFeeCents)}`}
                  </p>
                )}
                {e.removalCredits.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Créditos: {e.removalCredits.filter((c) => c.mode === "fixed").length} aprobados de {e.removalCredits.length}
                    {e.removalCredits.some((c) => c.mode === "fixed") &&
                      ` (${e.removalCredits.filter((c) => c.mode === "fixed").map((c) => `${itemName(c.componentId)} ${formatMoney(c.creditCents!)}`).join(", ")})`}
                  </p>
                )}
              </div>
            )}
          />
        </section>
      </div>
    </>
  );
}

function AmountRow({ id, label, field, onChange, placeholder = "0.00" }: { id: string; label: string; field: AmountField; onChange: (f: AmountField) => void; placeholder?: string }) {
  return (
    <div className="grid items-center gap-2 rounded-lg border border-border px-3 py-2.5 sm:grid-cols-[1fr_auto_9rem]">
      <Label htmlFor={id} className="text-sm font-normal">{label}</Label>
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <Checkbox checked={field.pending} onCheckedChange={(v) => onChange({ ...field, pending: v === true })} aria-label={`${label}: pendiente`} />
        Pendiente
      </label>
      <Input id={id} inputMode="decimal" placeholder={placeholder} value={field.pending ? "" : field.value} disabled={field.pending} onChange={(e) => onChange({ ...field, value: e.target.value })} />
    </div>
  );
}
