"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

const monthFmt = new Intl.DateTimeFormat("es-MX", { month: "short", year: "2-digit", timeZone: "UTC" });
const monthLong = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric", timeZone: "UTC" });
const monthDate = (ym: string) => new Date(`${ym}-01T12:00:00Z`);

interface Row {
  month: string;
  rentalCents: number;
  purchaseCents: number;
}

/**
 * Ingresos cobrados por mes, apilados (rentas abajo, compras arriba): misma gramática que la
 * gráfica de cotizaciones por día, con detalle del mes activo y tabla accesible.
 */
export function IncomeChart({ data }: { data: Row[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.rentalCents + d.purchaseCents));
  const total = data.reduce((sum, d) => sum + d.rentalCents + d.purchaseCents, 0);
  const current = active !== null ? data[active] : null;

  if (data.length === 0) return <p className="py-8 text-center text-sm text-muted-foreground">Sin pagos registrados en el periodo.</p>;

  return (
    <figure className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
        <figcaption className="text-muted-foreground">
          {data.length} {data.length === 1 ? "mes" : "meses"} · {formatMoney(total)} cobrados
        </figcaption>
        <p aria-live="polite" className="min-h-5 text-foreground-secondary">
          {current ? (
            <>
              <span className="capitalize">{monthLong.format(monthDate(current.month))}</span>:{" "}
              <span className="font-medium text-foreground">{formatMoney(current.rentalCents + current.purchaseCents)}</span>
              <span className="text-muted-foreground">
                {" "}
                (rentas {formatMoney(current.rentalCents)} · compras {formatMoney(current.purchaseCents)})
              </span>
            </>
          ) : null}
        </p>
      </div>

      <div className="flex items-center gap-4 text-xs text-foreground-secondary" aria-hidden>
        <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-royal" /> Rentas</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-sky ring-1 ring-royal/30 ring-inset" /> Compras</span>
      </div>

      <div className="relative" aria-hidden>
        <span className="absolute top-0 left-0 text-[10px] text-muted-foreground tabular-nums">{formatMoney(Math.round(max / 100) * 100)}</span>
        <div className="flex h-48 items-end gap-1.5 border-b border-border pl-16" onMouseLeave={() => setActive(null)}>
          {data.map((d, i) => {
            const sum = d.rentalCents + d.purchaseCents;
            return (
              <div key={d.month} className="flex h-full flex-1 cursor-default flex-col justify-end" onMouseEnter={() => setActive(i)}>
                {sum === 0 ? (
                  <div className="h-px w-full bg-border" />
                ) : (
                  <div className={cn("flex w-full flex-col overflow-hidden rounded-t-[4px] transition-opacity", active !== null && active !== i && "opacity-60")} style={{ height: `${(sum / max) * 100}%` }}>
                    <div className="w-full bg-sky shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--rs-royal)_25%,transparent)]" style={{ height: `${(d.purchaseCents / sum) * 100}%` }} />
                    <div className="w-full flex-1 bg-royal" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-1.5 flex gap-1.5 pl-16 text-[10px] text-muted-foreground">
          {data.map((d, i) => (
            <span key={d.month} className={cn("flex-1 truncate text-center", data.length > 12 && i % 2 === 1 && "invisible")}>
              {monthFmt.format(monthDate(d.month))}
            </span>
          ))}
        </div>
      </div>

      <table className="sr-only">
        <caption>Ingresos cobrados por mes</caption>
        <thead>
          <tr>
            <th scope="col">Mes</th>
            <th scope="col">Rentas</th>
            <th scope="col">Compras</th>
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.month}>
              <td>{monthLong.format(monthDate(d.month))}</td>
              <td>{formatMoney(d.rentalCents)}</td>
              <td>{formatMoney(d.purchaseCents)}</td>
              <td>{formatMoney(d.rentalCents + d.purchaseCents)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
