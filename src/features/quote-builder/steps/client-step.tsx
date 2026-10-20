"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api-client";
import { quoteApi } from "@/services/quotes";
import { StepHeader } from "../controls";
import { selectionOf, useQuoteStore } from "../store";
import { useQuotePreview } from "../use-quote-preview";

const schema = z
  .object({
    name: z.string().trim().min(2, "Escribe tu nombre.").max(120),
    company: z.string().trim().max(160).optional(),
    email: z.string().trim().pipe(z.email("Escribe un correo electrónico válido.")),
    phone: z.string().trim().regex(/^(\+?[\d\s-]{10,20})?$/, "Escribe un teléfono válido.").optional(),
    country: z.string().trim().regex(/^([A-Za-z]{2})?$/, "Usa el código de 2 letras, p. ej. MX.").optional(),
    comments: z.string().trim().max(2000).optional(),
    consentContact: z.boolean().refine((v) => v, "Necesitamos tu consentimiento para preparar tu cotización."),
    channelEmail: z.boolean(),
    channelWhatsapp: z.boolean(),
    whatsapp: z.string().trim().optional(),
    consentWhatsapp: z.boolean(),
    requestEvaluation: z.boolean(),
    website: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.channelWhatsapp) {
      if (!/^\+?[\d\s-]{10,20}$/.test(values.whatsapp ?? "")) {
        ctx.addIssue({ code: "custom", path: ["whatsapp"], message: "Escribe tu número de WhatsApp con lada (10 a 15 dígitos)." });
      }
      if (!values.consentWhatsapp) {
        ctx.addIssue({ code: "custom", path: ["consentWhatsapp"], message: "Autoriza el envío para recibirla por WhatsApp." });
      }
    }
  });
type FormValues = z.infer<typeof schema>;

function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429) return "Recibimos varias solicitudes desde tu conexión. Intenta de nuevo en unos minutos.";
    if (error.status === 400 || error.status === 422) return error.message;
  }
  return "No pudimos registrar tu solicitud. Verifica tu conexión e inténtalo de nuevo.";
}

export function ClientStep() {
  const store = useQuoteStore();
  const preview = useQuotePreview();
  const settings = useQuery({ queryKey: ["public-settings"], queryFn: quoteApi.publicSettings, staleTime: 5 * 60_000 });
  const blocked = preview.data?.status === "blocked";

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      phone: "",
      country: "MX",
      comments: "",
      consentContact: false,
      channelEmail: true,
      channelWhatsapp: false,
      whatsapp: "",
      consentWhatsapp: false,
      requestEvaluation: false,
      website: "",
    },
  });
  const { errors } = form.formState;
  const channelWhatsapp = useWatch({ control: form.control, name: "channelWhatsapp" });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      quoteApi.create({
        selection: selectionOf(store),
        industry: store.industry && store.industry !== "otro" ? store.industry : undefined,
        solution: store.solution ?? undefined,
        client: {
          name: values.name,
          company: values.company || undefined,
          email: values.email,
          phone: values.phone || undefined,
          whatsapp: values.channelWhatsapp ? values.whatsapp?.replace(/[\s+-]/g, "") : undefined,
          country: values.country || undefined,
        },
        comments: [store.industry === "otro" ? "Giro: otro." : "", values.comments ?? ""].filter(Boolean).join(" ") || undefined,
        consents: { contact: true, whatsapp: values.channelWhatsapp && values.consentWhatsapp },
        channels: { email: values.channelEmail, whatsapp: values.channelWhatsapp },
        requestEvaluation: blocked ? values.requestEvaluation : undefined,
        website: values.website,
      }),
    onSuccess: (result) => store.setResult(result),
  });

  const field = (name: keyof FormValues) => ({
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  return (
    <div className="mx-auto max-w-3xl">
      <StepHeader title="Tus datos" description="Los usamos únicamente para preparar tu cotización y darle seguimiento." />
      <form
        noValidate
        onSubmit={form.handleSubmit((values) => {
          if (blocked && !values.requestEvaluation) {
            form.setError("requestEvaluation", { message: "Confirma que deseas una valoración personalizada." });
            return;
          }
          mutation.mutate(values);
        })}
        className="space-y-6 rounded-2xl border border-border bg-card shadow-card p-6 sm:p-8"
      >
        {mutation.isError && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>No se registró tu solicitud</AlertTitle>
            <AlertDescription>{describeError(mutation.error)}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="name" label="Nombre" required error={errors.name?.message}>
            <Input id="name" className="h-11" autoComplete="name" {...field("name")} {...form.register("name")} />
          </Field>
          <Field id="company" label="Empresa" error={errors.company?.message}>
            <Input id="company" className="h-11" autoComplete="organization" {...form.register("company")} />
          </Field>
          <Field id="email" label="Correo electrónico" required error={errors.email?.message}>
            <Input id="email" type="email" className="h-11" autoComplete="email" {...field("email")} {...form.register("email")} />
          </Field>
          <Field id="phone" label="Teléfono" error={errors.phone?.message}>
            <Input id="phone" type="tel" className="h-11" autoComplete="tel" {...field("phone")} {...form.register("phone")} />
          </Field>
          <Field id="country" label="País (código)" error={errors.country?.message}>
            <Input id="country" className="h-11 uppercase" maxLength={2} autoComplete="country" {...field("country")} {...form.register("country")} />
          </Field>
        </div>

        <Field id="comments" label="Comentarios" error={errors.comments?.message}>
          <Textarea id="comments" rows={4} placeholder="Cuéntanos detalles de tu operación o lo que te gustaría lograr." {...form.register("comments")} />
        </Field>

        <fieldset className="space-y-3 rounded-xl border border-border p-4">
          <legend className="px-1 text-sm font-medium">¿Cómo quieres recibir tu cotización?</legend>
          <CheckboxField control={form.control} name="channelEmail" label="Por correo electrónico" />
          <CheckboxField control={form.control} name="channelWhatsapp" label="Por WhatsApp" />
          {channelWhatsapp && (
            <div className="space-y-3 pl-7">
              <Field id="whatsapp" label="Número de WhatsApp con lada" required error={errors.whatsapp?.message}>
                <Input id="whatsapp" type="tel" className="h-11" placeholder="52 55 1234 5678" {...field("whatsapp")} {...form.register("whatsapp")} />
              </Field>
              <CheckboxField
                control={form.control}
                name="consentWhatsapp"
                label="Autorizo a ReaperSys a enviarme esta cotización por WhatsApp."
                error={errors.consentWhatsapp?.message}
              />
            </div>
          )}
        </fieldset>

        {blocked && (
          <CheckboxField
            control={form.control}
            name="requestEvaluation"
            label="Mi selección incluye componentes incompatibles: solicito una valoración personalizada."
            error={errors.requestEvaluation?.message}
          />
        )}

        <CheckboxField
          control={form.control}
          name="consentContact"
          label={
            <>
              Acepto que ReaperSys utilice estos datos para preparar mi cotización y darle seguimiento.
              {settings.data?.privacyNotice.published && (
                <>
                  {" "}
                  <Link href="/aviso-de-privacidad" target="_blank" className="text-electric underline underline-offset-2">
                    Consulta el aviso de privacidad
                  </Link>
                  .
                </>
              )}
            </>
          }
          error={errors.consentContact?.message}
        />

        {/* Honeypot oculto para personas y lectores de pantalla */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="website">No llenes este campo</label>
          <input id="website" type="text" tabIndex={-1} autoComplete="off" {...form.register("website")} />
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
          <Button type="button" variant="glass" size="xl" onClick={() => store.goTo(5)}>
            <ArrowLeft data-icon="inline-start" /> Volver al resumen
          </Button>
          <Button type="submit" variant="brand" size="xl" disabled={mutation.isPending || !preview.data}>
            {mutation.isPending ? (
              <>
                <Loader2 className="animate-spin" data-icon="inline-start" /> Registrando…
              </>
            ) : (
              <>
                Solicitar cotización <Send data-icon="inline-end" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ id, label, required, error, children }: { id: string; label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-electric" aria-hidden>*</span>}
      </Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function CheckboxField({
  control,
  name,
  label,
  error,
}: {
  control: ReturnType<typeof useForm<FormValues>>["control"];
  name: "channelEmail" | "channelWhatsapp" | "consentWhatsapp" | "consentContact" | "requestEvaluation";
  label: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-start gap-3">
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <Checkbox
              id={name}
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${name}-error` : undefined}
              className="mt-0.5"
            />
          )}
        />
        <Label htmlFor={name} className="text-sm leading-relaxed font-normal text-foreground-secondary">
          {label}
        </Label>
      </div>
      {error && (
        <p id={`${name}-error`} className="pl-7 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
