"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const dayLabel = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", timeZone: "UTC" });
const label = (iso: string) => dayLabel.format(new Date(`${iso}T00:00:00Z`));

/**
 * Cotizaciones por día (una sola serie): barras finas con extremo redondeado anclado a la base,
 * separación de 2px, tooltip por barra con zona de contacto de toda la columna y tabla accesible.
 */
export function QuotesPerDayChart({ data }: { data: { date: string; count: number }[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const current = active !== null ? data[active] : null;

  return (
    <figure className="space-y-3">
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <figcaption className="text-muted-foreground">Últimos 30 días · {total} en total</figcaption>
        <p aria-live="polite" className="min-h-5 text-foreground-secondary">
          {current ? (
            <>
              {label(current.date)}: <span className="font-medium text-foreground">{current.count}</span>{" "}
              {current.count === 1 ? "cotización" : "cotizaciones"}
            </>
          ) : null}
        </p>
      </div>

      <div className="relative" aria-hidden>
        {/* Rejilla recesiva: solo línea base y máximo. */}
        <span className="absolute top-0 left-0 text-[10px] text-muted-foreground tabular-nums">{max}</span>
        <div className="flex h-40 items-end gap-[2px] border-b border-border pl-6" onMouseLeave={() => setActive(null)}>
          {data.map((d, i) => (
            <div
              key={d.date}
              className="flex h-full flex-1 cursor-default items-end"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
            >
              <div
                className={cn(
                  "w-full rounded-t-[4px] transition-colors",
                  d.count === 0 ? "h-px bg-border" : active === i ? "bg-electric" : "bg-royal",
                )}
                style={d.count === 0 ? undefined : { height: `${(d.count / max) * 100}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex justify-between pl-6 text-[10px] text-muted-foreground">
          <span>{label(data[0]!.date)}</span>
          <span>{label(data[data.length - 1]!.date)}</span>
        </div>
      </div>

      <table className="sr-only">
        <caption>Cotizaciones registradas por día</caption>
        <thead>
          <tr>
            <th scope="col">Fecha</th>
            <th scope="col">Cotizaciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.date}>
              <td>{label(d.date)}</td>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
