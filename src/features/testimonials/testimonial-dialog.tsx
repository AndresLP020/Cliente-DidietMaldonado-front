"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Loader2, MessageSquarePlus, Send, Star } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { CreateTestimonialInput } from "@/types/testimonial";
import { type TestimonialFormValues, testimonialSchema } from "./testimonial-schema";

const ratingLabels = ["Malo", "Regular", "Bueno", "Muy bueno", "Excelente"];

function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429) return "Recibimos varios comentarios desde tu conexión. Intenta de nuevo en unos minutos.";
    if (error.status === 400 && error.body) return [error.body.message].flat().join(" ");
  }
  return "No pudimos enviar tu comentario. Verifica tu conexión e inténtalo de nuevo.";
}

const emptyValues: TestimonialFormValues = { name: "", company: "", role: "", email: "", rating: 0, message: "", consent: false, website: "" };

/** Botón + diálogo para que un cliente deje su comentario. Se publica solo tras la revisión en el panel. */
export function TestimonialDialog({ triggerClassName }: { triggerClassName?: string }) {
  const [open, setOpen] = useState(false);
  const form = useForm<TestimonialFormValues>({ resolver: zodResolver(testimonialSchema), defaultValues: emptyValues });
  const { errors } = form.formState;

  const mutation = useMutation({
    mutationFn: (values: TestimonialFormValues) => {
      const body: CreateTestimonialInput = {
        name: values.name,
        company: values.company || undefined,
        role: values.role || undefined,
        email: values.email || undefined,
        rating: values.rating,
        message: values.message,
        consent: true,
        website: values.website,
      };
      return apiFetch<{ received: true }>("/testimonials", { method: "POST", json: body });
    },
  });

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    // Al cerrar después de un envío exitoso, el formulario vuelve a quedar limpio.
    if (!next && mutation.isSuccess) {
      mutation.reset();
      form.reset(emptyValues);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="brand" size="xl" className={triggerClassName}>
          <MessageSquarePlus data-icon="inline-start" />
          Deja tu comentario
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto bg-card p-6 sm:max-w-lg">
        {mutation.isSuccess ? (
          <div role="status" className="flex flex-col items-center gap-4 py-6 text-center">
            <CheckCircle2 className="size-12 text-success" aria-hidden />
            <DialogTitle className="font-heading text-xl font-semibold text-navy">¡Gracias por tu comentario!</DialogTitle>
            <DialogDescription className="max-w-sm text-foreground-secondary">
              Lo recibimos correctamente. Se publicará en el sitio una vez que nuestro equipo lo revise.
            </DialogDescription>
            <Button variant="glass" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-heading text-xl font-semibold text-navy">Comparte tu experiencia</DialogTitle>
              <DialogDescription className="text-foreground-secondary">
                Tu opinión ayuda a otros negocios a conocernos. Los comentarios se publican después de una revisión.
              </DialogDescription>
            </DialogHeader>

            <form noValidate onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="relative space-y-5">
              {mutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle />
                  <AlertTitle>No se envió tu comentario</AlertTitle>
                  <AlertDescription>{describeError(mutation.error)}</AlertDescription>
                </Alert>
              )}

              <Controller
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <fieldset aria-describedby={errors.rating ? "t-rating-error" : undefined} className="space-y-2">
                    <legend className="mb-2 text-sm font-medium">
                      Calificación<span className="text-royal" aria-hidden>*</span>
                    </legend>
                    <div className="flex items-center gap-1">
                      {ratingLabels.map((label, index) => {
                        const value = index + 1;
                        const active = value <= field.value;
                        return (
                          <label key={label} className="group cursor-pointer rounded-md p-0.5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring">
                            <input
                              type="radio"
                              name="rating"
                              value={value}
                              checked={field.value === value}
                              onChange={() => field.onChange(value)}
                              className="sr-only"
                            />
                            <Star
                              aria-hidden
                              className={cn("size-7 transition-colors", active ? "fill-gold text-gold" : "text-soft-gray group-hover:text-gold")}
                            />
                            <span className="sr-only">
                              {value} de 5 — {label}
                            </span>
                          </label>
                        );
                      })}
                      <span className="ml-2 text-sm text-muted-foreground" aria-hidden>
                        {field.value ? ratingLabels[field.value - 1] : "Sin calificar"}
                      </span>
                    </div>
                    {errors.rating && (
                      <p id="t-rating-error" className="text-sm text-destructive">
                        {errors.rating.message}
                      </p>
                    )}
                  </fieldset>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="t-name" label="Nombre" required error={errors.name?.message}>
                  <Input className="h-10" id="t-name" autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "t-name-error" : undefined} {...form.register("name")} />
                </Field>
                <Field id="t-company" label="Empresa o negocio" error={errors.company?.message}>
                  <Input className="h-10" id="t-company" autoComplete="organization" {...form.register("company")} />
                </Field>
                <Field id="t-role" label="Cargo" error={errors.role?.message}>
                  <Input className="h-10" id="t-role" autoComplete="organization-title" {...form.register("role")} />
                </Field>
                <Field id="t-email" label="Correo (no se publica)" error={errors.email?.message}>
                  <Input className="h-10" id="t-email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "t-email-error" : undefined} {...form.register("email")} />
                </Field>
              </div>

              <Field id="t-message" label="Comentario" required error={errors.message?.message}>
                <Textarea
                  id="t-message"
                  rows={4}
                  placeholder="¿Qué solución implementaste y cómo ha sido tu experiencia?"
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "t-message-error" : undefined}
                  {...form.register("message")}
                />
              </Field>

              {/* Honeypot: oculto para personas y tecnologías de asistencia. */}
              <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label htmlFor="t-website">No llenes este campo</label>
                <input id="t-website" type="text" tabIndex={-1} autoComplete="off" {...form.register("website")} />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-start gap-3">
                  <Controller
                    control={form.control}
                    name="consent"
                    render={({ field }) => (
                      <Checkbox
                        id="t-consent"
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                        aria-invalid={Boolean(errors.consent)}
                        aria-describedby={errors.consent ? "t-consent-error" : undefined}
                        className="mt-0.5"
                      />
                    )}
                  />
                  <Label htmlFor="t-consent" className="text-sm leading-relaxed font-normal text-foreground-secondary">
                    Autorizo que ReaperSys publique en su sitio mi nombre, empresa, cargo y comentario. Mi correo no se publicará.
                  </Label>
                </div>
                {errors.consent && (
                  <p id="t-consent-error" className="text-sm text-destructive">
                    {errors.consent.message}
                  </p>
                )}
              </div>

              <Button type="submit" variant="brand" size="xl" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" data-icon="inline-start" /> Enviando…
                  </>
                ) : (
                  <>
                    Enviar comentario <Send data-icon="inline-end" />
                  </>
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ id, label, required, error, children }: { id: string; label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="text-royal" aria-hidden>
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
