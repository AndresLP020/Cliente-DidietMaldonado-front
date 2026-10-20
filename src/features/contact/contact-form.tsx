"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { industries } from "@/content/industries";
import { ApiError, apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { contactInterests, contactSchema, type ContactFormValues, type ContactReceipt } from "./contact-schema";

function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429) return "Recibimos varias solicitudes desde tu conexión. Intenta de nuevo en unos minutos.";
    if (error.status === 400 && error.body) return [error.body.message].flat().join(" ");
  }
  return "No pudimos enviar tu mensaje. Verifica tu conexión e inténtalo de nuevo.";
}

export function ContactForm({ defaultIndustry, privacyNoticeAvailable = false }: { defaultIndustry?: string; privacyNoticeAvailable?: boolean }) {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      phone: "",
      industry: defaultIndustry,
      message: "",
      consent: false,
      website: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: ContactFormValues) =>
      apiFetch<ContactReceipt>("/contact", {
        method: "POST",
        json: {
          ...values,
          company: values.company || undefined,
          phone: values.phone || undefined,
        },
      }),
  });

  const { errors } = form.formState;

  if (mutation.isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        role="status"
        className="flex flex-col items-center gap-4 rounded-2xl border border-royal/40 bg-card px-6 py-14 text-center"
      >
        <CheckCircle2 className="size-12 text-electric" aria-hidden />
        <h2 className="font-heading text-2xl font-semibold">Recibimos tu mensaje</h2>
        <p className="max-w-md text-foreground-secondary">
          Tu referencia es <span className="font-mono font-semibold text-foreground">{mutation.data.reference}</span>. Un
          asesor revisará tu solicitud y te contactará por los medios que nos compartiste.
        </p>
        <Button
          variant="glass"
          onClick={() => {
            mutation.reset();
            form.reset();
          }}
        >
          Enviar otro mensaje
        </Button>
      </motion.div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      className="space-y-6 rounded-2xl border border-border bg-card shadow-card p-6 sm:p-8"
      aria-describedby={mutation.isError ? "contact-error" : undefined}
    >
      <AnimatePresence>
        {mutation.isError && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Alert variant="destructive" id="contact-error">
              <AlertCircle />
              <AlertTitle>No se envió tu mensaje</AlertTitle>
              <AlertDescription>{describeError(mutation.error)}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Nombre" required error={errors.name?.message}>
          <Input className="h-11" id="name" autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} {...form.register("name")} />
        </Field>
        <Field id="company" label="Empresa" error={errors.company?.message}>
          <Input className="h-11" id="company" autoComplete="organization" {...form.register("company")} />
        </Field>
        <Field id="email" label="Correo electrónico" required error={errors.email?.message}>
          <Input className="h-11" id="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} {...form.register("email")} />
        </Field>
        <Field id="phone" label="Teléfono o WhatsApp" error={errors.phone?.message}>
          <Input className="h-11" id="phone" type="tel" autoComplete="tel" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "phone-error" : undefined} {...form.register("phone")} />
        </Field>

        <Field id="industry" label="Tipo de negocio">
          <Controller
            control={form.control}
            name="industry"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger id="industry" className="w-full data-[size=default]:h-11">
                  <SelectValue placeholder="Selecciona una opción" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry.slug} value={industry.slug}>
                      {industry.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field id="interest" label="¿Qué te interesa?">
          <Controller
            control={form.control}
            name="interest"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger id="interest" className="w-full data-[size=default]:h-11">
                  <SelectValue placeholder="Selecciona una opción" />
                </SelectTrigger>
                <SelectContent>
                  {contactInterests.map((interest) => (
                    <SelectItem key={interest.value} value={interest.value}>
                      {interest.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>

      <Field id="message" label="Mensaje" required error={errors.message?.message}>
        <Textarea
          id="message"
          rows={5}
          placeholder="Cuéntanos sobre tu negocio y lo que necesitas."
          aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "message-error" : undefined}
          {...form.register("message")}
        />
      </Field>

      {/* Honeypot: oculto para personas y tecnologías de asistencia. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">No llenes este campo</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...form.register("website")} />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-start gap-3">
          <Controller
            control={form.control}
            name="consent"
            render={({ field }) => (
              <Checkbox
                id="consent"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                aria-invalid={Boolean(errors.consent)}
                aria-describedby={errors.consent ? "consent-error" : undefined}
                className="mt-0.5"
              />
            )}
          />
          <Label htmlFor="consent" className="text-sm leading-relaxed font-normal text-foreground-secondary">
            Acepto que ReaperSys utilice estos datos únicamente para responder a mi solicitud.
            {privacyNoticeAvailable && (
              <>
                {" "}
                <Link href="/aviso-de-privacidad" target="_blank" className="text-electric underline underline-offset-2">
                  Consulta el aviso de privacidad
                </Link>
                .
              </>
            )}
          </Label>
        </div>
        {errors.consent && (
          <p id="consent-error" className="text-sm text-destructive">
            {errors.consent.message}
          </p>
        )}
      </div>

      <Button type="submit" variant="brand" size="xl" className="w-full sm:w-auto" disabled={mutation.isPending}>
        {mutation.isPending ? (
          <>
            <Loader2 className="animate-spin" data-icon="inline-start" /> Enviando…
          </>
        ) : (
          <>
            Enviar mensaje <Send data-icon="inline-end" />
          </>
        )}
      </Button>
    </form>
  );
}

function Field({
  id,
  label,
  required,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="text-electric" aria-hidden>
            *
          </span>
        )}
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
