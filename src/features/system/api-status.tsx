"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { HealthResponse } from "@/types/api";

/** Diagnóstico de conectividad frontend → API → MongoDB. Muestra solo el estado real. */
export function ApiStatus() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["system", "health"],
    queryFn: () => apiFetch<HealthResponse>("/health"),
  });

  const rows: { label: string; value: string; tone: "ok" | "warn" | "error" | "idle" }[] = isPending
    ? [{ label: "API", value: "Comprobando…", tone: "idle" }]
    : isError || !data
      ? [{ label: "API", value: "Sin conexión", tone: "error" }]
      : [
          { label: "API", value: data.status === "ok" ? "Operativa" : "Degradada", tone: data.status === "ok" ? "ok" : "warn" },
          { label: "MongoDB", value: data.database.up ? "Conectado" : "Sin conexión", tone: data.database.up ? "ok" : "error" },
          {
            label: "Transacciones",
            value: data.database.transactions ? "Disponibles" : "No disponibles",
            tone: data.database.transactions ? "ok" : "warn",
          },
          {
            label: "Correo",
            value: data.integrations.email.simulated ? "Simulado (pendiente de credenciales)" : data.integrations.email.provider,
            tone: data.integrations.email.simulated ? "warn" : "ok",
          },
          {
            label: "WhatsApp",
            value: data.integrations.whatsapp.simulated
              ? "Simulado (pendiente de credenciales)"
              : data.integrations.whatsapp.provider,
            tone: data.integrations.whatsapp.simulated ? "warn" : "ok",
          },
        ];

  return (
    <dl className="grid gap-px overflow-hidden rounded-md border border-border bg-border" aria-live="polite">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-6 bg-surface px-5 py-3 text-sm">
          <dt className="text-foreground-muted">{row.label}</dt>
          <dd className="flex items-center gap-2 text-right text-foreground-secondary">
            <span
              aria-hidden
              className={cn(
                "size-2 shrink-0 rounded-full",
                row.tone === "ok" && "bg-electric",
                row.tone === "warn" && "bg-magenta",
                row.tone === "error" && "bg-magenta",
                row.tone === "idle" && "animate-pulse bg-muted-gray",
              )}
            />
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
