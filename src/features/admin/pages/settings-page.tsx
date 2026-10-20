"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/features/admin/admin-api";
import { useCan } from "@/features/admin/session";
import type { BusinessSettings } from "@/features/admin/types";
import { ErrorState, PageHeader, Panel, useAdminMutation } from "@/features/admin/ui";

/** Porcentaje escrito por el usuario ("16" o "16.5") → puntos base, sin coma flotante. */
function percentToBp(input: string): number | null {
  const match = /^(\d{1,3})(?:\.(\d{1,2}))?$/.exec(input.trim());
  if (!match) return null;
  const bp = Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  return bp <= 10_000 ? bp : null;
}
const bpToPercent = (bp: number) => (bp % 100 === 0 ? String(bp / 100) : (bp / 100).toFixed(2).replace(/0$/, ""));

export function SettingsPage() {
  const { data, isPending, error } = useQuery({ queryKey: ["admin", "settings"], queryFn: () => adminApi.get<BusinessSettings>("/admin/settings") });
  if (error) return <ErrorState error={error} />;
  if (isPending) return <Skeleton className="h-[600px] rounded-2xl" />;
  return <SettingsForm settings={data} />;
}

function SettingsForm({ settings }: { settings: BusinessSettings }) {
  const queryClient = useQueryClient();
  const canWrite = useCan("settings:write");
  const [deposit, setDeposit] = useState(bpToPercent(settings.quote.depositRateBp));
  const [validity, setValidity] = useState(settings.quote.validityDays?.toString() ?? "");
  const [warrantyDays, setWarrantyDays] = useState(settings.warranty.referenceDays?.toString() ?? "");
  const [warrantyConfirmed, setWarrantyConfirmed] = useState(settings.warranty.confirmed);
  const [terms, setTerms] = useState(settings.commercialTerms.join("\n"));
  const [tradeName, setTradeName] = useState(settings.tradeName);
  const [legalName, setLegalName] = useState(settings.legalName);
  const [legalAddress, setLegalAddress] = useState(settings.legalAddress);
  const [privacyPublished, setPrivacyPublished] = useState(settings.privacyNotice.published);
  const [contact, setContact] = useState({ email: "", whatsapp: "", facebook: "", instagram: "", tiktok: "", ...settings.contact });
  const [rentalTerm, setRentalTerm] = useState(String(settings.rental.minimumTermMonths));
  const [financing, setFinancing] = useState(bpToPercent(settings.rental.financingBp));
  const [monthToMonth, setMonthToMonth] = useState(bpToPercent(settings.rental.monthToMonthSurchargeBp));
  const [semiannual, setSemiannual] = useState(bpToPercent(settings.rental.semiannualDiscountBp));
  const [annual, setAnnual] = useState(bpToPercent(settings.rental.annualDiscountBp));
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useAdminMutation({
    mutationFn: (body: object) => adminApi.send<BusinessSettings>("PATCH", "/admin/settings", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin"] }),
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const depositRateBp = percentToBp(deposit);
    const validityDays = validity.trim() === "" ? null : Number(validity);
    const referenceDays = warrantyDays.trim() === "" ? null : Number(warrantyDays);
    if (depositRateBp === null) return setFormError("El anticipo debe ser un porcentaje entre 0 y 100.");
    if (validityDays !== null && (!Number.isInteger(validityDays) || validityDays < 1 || validityDays > 365)) return setFormError("La vigencia debe ser de 1 a 365 días.");
    if (referenceDays !== null && (!Number.isInteger(referenceDays) || referenceDays < 0)) return setFormError("La garantía debe ser un número de días.");
    const minimumTermMonths = Number(rentalTerm);
    if (!Number.isInteger(minimumTermMonths) || minimumTermMonths < 1 || minimumTermMonths > 60) return setFormError("El plazo mínimo debe ser de 1 a 60 meses.");
    const financingBp = percentToBp(financing);
    const monthToMonthSurchargeBp = percentToBp(monthToMonth);
    const semiannualDiscountBp = percentToBp(semiannual);
    const annualDiscountBp = percentToBp(annual);
    if (financingBp === null || monthToMonthSurchargeBp === null) return setFormError("El recargo debe ser un porcentaje entre 0 y 100.");
    if (semiannualDiscountBp === null || annualDiscountBp === null || semiannualDiscountBp > 5_000 || annualDiscountBp > 5_000) {
      return setFormError("Los descuentos del semestral y del anual deben ser de 0 a 50 %.");
    }

    mutation.mutate({
      tradeName,
      legalName,
      legalAddress,
      privacyNoticePublished: privacyPublished,
      quote: { depositRateBp, validityDays },
      warranty: { referenceDays, confirmed: warrantyConfirmed },
      commercialTerms: terms.split("\n").map((t) => t.trim()).filter(Boolean),
      contact,
      rental: { minimumTermMonths, financingBp, monthToMonthSurchargeBp, semiannualDiscountBp, annualDiscountBp },
    });
  };

  const readiness = [
    { ok: validity.trim() !== "", label: "Vigencia de cotizaciones definida" },
  ];

  return (
    <form onSubmit={submit} noValidate>
      <PageHeader
        title="Configuración comercial"
        description="Estos valores aplican a las cotizaciones nuevas. Las cotizaciones ya registradas conservan los suyos."
        actions={
          canWrite && (
            <Button type="submit" variant="brand" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="animate-spin" data-icon="inline-start" />} Guardar cambios
            </Button>
          )
        }
      />

      {formError && <p role="alert" className="mb-4 text-sm text-destructive">{formError}</p>}
      {mutation.error && <ErrorState error={mutation.error} className="mb-4" />}
      {mutation.isSuccess && !mutation.isPending && (
        <p role="status" className="mb-4 flex items-center gap-2 text-sm text-success">
          <CheckCircle2 className="size-4" aria-hidden /> Configuración guardada y registrada en la auditoría.
        </p>
      )}

      <fieldset disabled={!canWrite} className="grid gap-6 lg:grid-cols-2">
        <Panel title="Emisión de cotizaciones formales" className="lg:col-span-2">
          <div className="space-y-4 p-5">
            <p className="text-sm text-foreground-secondary">Para emitir cotizaciones con importes definitivos se necesita:</p>
            <ul className="flex flex-wrap gap-3 text-sm">
              {readiness.map((r) => (
                <li key={r.label} className={r.ok ? "text-success" : "text-warning"}>
                  {r.ok ? "✓" : "•"} {r.label}
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        <Panel title="Cotizaciones y pagos">
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Field id="validity" label="Vigencia (días)" hint="Vacío = sin definir: las cotizaciones quedan en revisión.">
              <Input id="validity" inputMode="numeric" value={validity} onChange={(e) => setValidity(e.target.value)} />
            </Field>
            <Field id="deposit" label="Anticipo (%)">
              <Input id="deposit" inputMode="decimal" value={deposit} onChange={(e) => setDeposit(e.target.value)} />
            </Field>
            <Field id="warranty" label="Garantía de equipos (días)">
              <Input id="warranty" inputMode="numeric" value={warrantyDays} onChange={(e) => setWarrantyDays(e.target.value)} />
            </Field>
            <div className="flex items-end pb-1">
              <ToggleField id="warranty-confirmed" label="Garantía confirmada" checked={warrantyConfirmed} onChange={setWarrantyConfirmed} />
            </div>
          </div>
        </Panel>

        <Panel title="Suscripción mensual" className="lg:col-span-2">
          <div className="space-y-4 p-5">
            <p className="text-sm text-foreground-secondary">
              La mensualidad publicada de cada paquete es la del plan mensual. El plazo mínimo solo aplica a ese plan.
              El semestral se cobra y se presupuesta cada 6 meses; el anual, cada 12.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Field id="rental-term" label="Plazo mínimo (meses)" hint="Solo del plan mensual.">
                <Input id="rental-term" inputMode="numeric" value={rentalTerm} onChange={(e) => setRentalTerm(e.target.value)} />
              </Field>
              <Field id="rental-m2m" label="Recargo mes con mes (%)" hint="Sin plazo forzoso.">
                <Input id="rental-m2m" inputMode="decimal" value={monthToMonth} onChange={(e) => setMonthToMonth(e.target.value)} />
              </Field>
              <Field id="rental-semiannual" label="Descuento semestral (%)" hint="Cada 6 meses. El presupuesto cubre ese semestre.">
                <Input id="rental-semiannual" inputMode="decimal" value={semiannual} onChange={(e) => setSemiannual(e.target.value)} />
              </Field>
              <Field id="rental-annual" label="Descuento anual (%)" hint="Cada 12 meses. El presupuesto cubre ese año.">
                <Input id="rental-annual" inputMode="decimal" value={annual} onChange={(e) => setAnnual(e.target.value)} />
              </Field>
              <Field id="rental-financing" label="Recargo de financiamiento (%)" hint="Para la mensualidad sugerida.">
                <Input id="rental-financing" inputMode="decimal" value={financing} onChange={(e) => setFinancing(e.target.value)} />
              </Field>
            </div>
          </div>
        </Panel>

        <Panel title="Condiciones comerciales">
          <div className="p-5">
            <Field id="terms" label="Una condición por línea" hint="Se muestran en cada cotización.">
              <Textarea id="terms" rows={7} value={terms} onChange={(e) => setTerms(e.target.value)} />
            </Field>
          </div>
        </Panel>

        <Panel title="Empresa y contacto">
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Field id="trade" label="Nombre comercial">
              <Input id="trade" value={tradeName} onChange={(e) => setTradeName(e.target.value)} />
            </Field>
            <Field id="legal" label="Razón social">
              <Input id="legal" value={legalName} onChange={(e) => setLegalName(e.target.value)} />
            </Field>
            <Field id="c-email" label="Correo de contacto">
              <Input id="c-email" type="email" value={contact.email} onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))} />
            </Field>
            <Field id="c-wa" label="WhatsApp (solo dígitos con lada)">
              <Input id="c-wa" inputMode="numeric" placeholder="5215512345678" value={contact.whatsapp} onChange={(e) => setContact((c) => ({ ...c, whatsapp: e.target.value }))} />
            </Field>
            {(["facebook", "instagram", "tiktok"] as const).map((network) => (
              <Field key={network} id={`c-${network}`} label={network[0]!.toUpperCase() + network.slice(1)}>
                <Input id={`c-${network}`} type="url" placeholder="https://" value={contact[network]} onChange={(e) => setContact((c) => ({ ...c, [network]: e.target.value }))} />
              </Field>
            ))}
            <p className="text-xs text-muted-foreground sm:col-span-2">
              El correo, WhatsApp y redes se muestran en el sitio público; los cambios aparecen en uno o dos minutos.
            </p>
          </div>
        </Panel>

        <Panel title="Aviso de privacidad" className="lg:col-span-2">
          <div className="space-y-4 p-5">
            <Field id="legal-address" label="Domicilio del responsable" hint="Domicilio completo que aparecerá en el aviso de privacidad.">
              <Textarea id="legal-address" rows={2} maxLength={400} value={legalAddress} onChange={(e) => setLegalAddress(e.target.value)} />
            </Field>
            <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-foreground-secondary">
              Antes de publicarlo, revisa{" "}
              <Link href="/admin/configuracion/aviso-de-privacidad" className="text-electric hover:underline">
                la vista previa del aviso
              </Link>{" "}
              con tu asesor legal. Requiere razón social, domicilio y correo de contacto. Al publicarlo, los formularios enlazan al aviso.
            </div>
            <ToggleField id="privacy-published" label="Aviso de privacidad publicado" checked={privacyPublished} onChange={setPrivacyPublished} />
            {settings.privacyNotice.publishedAt && (
              <p className="text-xs text-muted-foreground">
                Versión vigente del {new Date(settings.privacyNotice.publishedAt).toLocaleDateString("es-MX", { dateStyle: "long" })}.
              </p>
            )}
          </div>
        </Panel>
      </fieldset>
    </form>
  );
}

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ToggleField({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3">
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id}>{label}</Label>
    </div>
  );
}
