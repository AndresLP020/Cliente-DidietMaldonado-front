"use client";

import { type UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { QuoteStatus } from "@/types/quote";
import { SESSION_QUERY_KEY } from "./session";
import type { BillingMonths, ContractStatus, ContractType, DueState, LeadStatus, PaymentMethod, Role, TestimonialStatus } from "./types";

// ------------------------------------------------------------------ etiquetas

export const quoteStatusLabels: Record<QuoteStatus, string> = {
  needs_review: "En revisión",
  issued: "Emitida",
  sent: "Enviada",
  approved: "Aprobada",
  rejected: "Rechazada",
  expired: "Vencida",
  cancelled: "Cancelada",
};

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: "Nuevo",
  contacted: "Contactado",
  qualified: "Calificado",
  converted: "Convertido",
  discarded: "Descartado",
};

export const contractStatusLabels: Record<ContractStatus, string> = {
  active: "Activo",
  paused: "En pausa",
  cancelled: "Cancelado",
  completed: "Liquidado",
};

export const contractTypeLabels: Record<ContractType, string> = { rental: "Renta", purchase: "Compra" };

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: "Efectivo",
  transfer: "Transferencia",
  card: "Tarjeta",
  other: "Otro",
};

export const billingPeriodLabels: Record<BillingMonths, string> = { 1: "Mensual", 6: "Semestral", 12: "Anual" };

export const testimonialStatusLabels: Record<TestimonialStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
};

/** Texto del vencimiento a partir de los días que calcula el backend. */
export function dueLabel(dueState: DueState, daysUntilDue: number | null): string {
  if (dueState === "none" || daysUntilDue === null) return "Sin cobro pendiente";
  if (daysUntilDue < 0) {
    const days = -daysUntilDue;
    return `Vencido hace ${days} ${days === 1 ? "día" : "días"}`;
  }
  if (daysUntilDue === 0) return "Vence hoy";
  if (dueState === "due_soon") return `Vence en ${daysUntilDue} ${daysUntilDue === 1 ? "día" : "días"}`;
  return "Al corriente";
}

export function DuePill({ dueState, daysUntilDue }: { dueState: DueState; daysUntilDue: number | null }) {
  return <StatusPill status={dueState === "none" ? "cancelled" : dueState} label={dueLabel(dueState, daysUntilDue)} />;
}

/** Hoy (zona local) como YYYY-MM-DD para campos de fecha. */
export function todayInput(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/** Fecha ISO del backend → YYYY-MM-DD (los vencimientos se guardan a mediodía UTC). */
export function isoToDateInput(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : "";
}

const calendarDate = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeZone: "UTC" });

/** Fechas de calendario (vencimientos, pagos): en UTC para no desplazar el día. */
export function formatCalendarDate(value: string | null | undefined): string {
  return value ? calendarDate.format(new Date(value)) : "—";
}

export const roleLabels: Record<Role, string> = {
  owner: "Propietario",
  admin: "Administrador",
  sales: "Asesor comercial",
  viewer: "Solo lectura",
};

export const priceModeLabels = { fixed: "Fijo", starting_at: "Desde", pending: "Pendiente" } as const;

const statusTone: Record<string, string> = {
  needs_review: "bg-electric/10 text-electric",
  issued: "bg-sky text-royal",
  sent: "bg-indigo-accent/10 text-indigo-accent",
  approved: "bg-success/15 text-success",
  converted: "bg-success/15 text-success",
  published: "bg-success/15 text-success",
  priced: "bg-success/15 text-success",
  rejected: "bg-magenta/15 text-magenta",
  cancelled: "bg-surface-raised text-muted-foreground",
  discarded: "bg-surface-raised text-muted-foreground",
  superseded: "bg-surface-raised text-muted-foreground",
  expired: "bg-magenta/10 text-magenta",
  draft: "bg-warning/15 text-warning",
  pending_pricing: "bg-warning/15 text-warning",
  new: "bg-electric/10 text-electric",
  active: "bg-success/10 text-success",
  completed: "bg-sky text-royal",
  paused: "bg-warning/10 text-warning",
  overdue: "bg-magenta/10 text-magenta",
  due_soon: "bg-warning/10 text-warning",
  current: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
};

export function StatusPill({ status, label }: { status: string; label?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", statusTone[status] ?? "bg-surface-raised text-foreground-secondary")}>
      {label ?? status}
    </span>
  );
}

// ------------------------------------------------------------------ formato

const dateTime = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" });
const dateOnly = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" });

export function formatDateTime(value: string | Date | null | undefined): string {
  return value ? dateTime.format(new Date(value)) : "—";
}

export function formatDate(value: string | Date | null | undefined): string {
  return value ? dateOnly.format(new Date(value)) : "—";
}

export function formatBp(bp: number | null | undefined): string {
  if (bp === null || bp === undefined) return "—";
  return `${(bp / 100).toLocaleString("es-MX", { maximumFractionDigits: 2 })} %`;
}

/**
 * Convierte lo que el usuario escribe en pesos ("1,500.50") a centavos enteros SIN aritmética
 * de punto flotante. Devuelve null si el texto no es un importe válido.
 */
export function parsePesosInput(input: string, { allowNegative = false } = {}): number | null {
  const clean = input.replace(/[\s,$]/g, "");
  const match = /^(-?)(\d{1,11})(?:\.(\d{1,2}))?$/.exec(clean);
  if (!match) return null;
  const [, sign, whole, fraction = ""] = match;
  if (sign && !allowNegative) return null;
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return sign ? -cents : cents;
}

/** Centavos → texto editable en pesos (inverso de parsePesosInput). */
export function centsToInput(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "";
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const fraction = abs % 100;
  return `${sign}${Math.trunc(abs / 100)}${fraction ? `.${String(fraction).padStart(2, "0")}` : ""}`;
}

// ------------------------------------------------------------------ mutaciones

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) return error.message || "No tienes permiso para realizar esta acción.";
    return error.message;
  }
  return "Ocurrió un error inesperado. Inténtalo de nuevo.";
}

/** useMutation que, ante una sesión vencida (401), invalida la sesión para volver al inicio de sesión. */
export function useAdminMutation<TData, TVariables = void>(options: UseMutationOptions<TData, Error, TVariables>) {
  const queryClient = useQueryClient();
  return useMutation<TData, Error, TVariables>({
    ...options,
    onError: (error, ...rest) => {
      if (error instanceof ApiError && error.status === 401) void queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
      return options.onError?.(error, ...rest);
    },
  });
}

// ------------------------------------------------------------------ bloques de página

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {description && <p className="max-w-2xl text-sm text-foreground-secondary">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Panel({ className, children, title, actions }: { className?: string; children: React.ReactNode; title?: string; actions?: React.ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card shadow-card", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          {title && <h2 className="font-heading text-base font-semibold">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function ErrorState({ error, className }: { error: unknown; className?: string }) {
  return (
    <div role="alert" className={cn("flex items-start gap-2 rounded-xl border border-magenta/30 bg-magenta/5 px-4 py-3 text-sm text-magenta", className)}>
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-magenta" aria-hidden />
      {errorMessage(error)}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center text-sm text-muted-foreground">
      <Inbox className="size-8 text-electric/70" aria-hidden />
      {message}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-5" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </div>
  );
}

export function Pagination({ page, pageSize, total, onPage }: { page: number; pageSize: number; total: number; onPage: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;
  return (
    <nav aria-label="Paginación" className="flex items-center justify-between gap-3 border-t border-border px-5 py-3 text-sm text-muted-foreground">
      <span>
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} de {total}
      </span>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon-sm" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Página anterior">
          <ChevronLeft />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => onPage(page + 1)} disabled={page >= pages} aria-label="Página siguiente">
          <ChevronRight />
        </Button>
      </div>
    </nav>
  );
}
