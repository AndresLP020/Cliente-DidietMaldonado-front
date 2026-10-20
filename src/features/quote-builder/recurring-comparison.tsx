import { Check } from "lucide-react";
import { PriceTag } from "@/features/packages/package-card";
import type { PublicComponent } from "@/types/quote";

/** Qué cubre cada servicio recurrente y por qué su precio es el que es. */
const SCOPE: Record<string, { why: string; includes: string[] }> = {
  "maintenance-web-basic": {
    why: "Alcanza para un sitio que casi no cambia.",
    includes: ["Revisión de que el sitio abre y se ve bien", "Ajustes de textos e imágenes"],
  },
  "maintenance-web-business": {
    why: "El sitio tiene más páginas y se actualiza con más frecuencia.",
    includes: ["Revisión de que el sitio abre y se ve bien", "Ajustes de textos e imágenes", "Cambios en páginas y secciones", "Revisión del formulario de contacto"],
  },
  "maintenance-ecommerce": {
    why: "La tienda se mueve cada mes: productos, pedidos y pagos.",
    includes: [
      "Revisión de que el sitio abre y se ve bien",
      "Ajustes de textos e imágenes",
      "Cambios en páginas y secciones",
      "Revisión del formulario de contacto",
      "Altas y cambios de productos",
      "Revisión de carrito, pedidos y pagos",
    ],
  },
  "support-pos": {
    why: "Depende de cuántas cajas hay y de qué tan a la medida está el sistema. Por eso el precio es «desde».",
    includes: ["Dudas de cobro, usuarios y tickets", "Acompañamiento de la operación del punto de venta"],
  },
  "integration-monitoring": {
    why: "Depende de cuántos sistemas están conectados. Por eso el precio es «desde».",
    includes: ["Vigilancia de las conexiones entre sistemas", "Revisión si una conexión deja de funcionar"],
  },
  "software-licenses": {
    why: "No es mano de obra: lo cobra quien vende la licencia. Por eso no hay un precio fijo.",
    includes: ["Pago al proveedor de la licencia"],
  },
};

const INCLUDE_ORDER = [
  "Revisión de que el sitio abre y se ve bien",
  "Ajustes de textos e imágenes",
  "Cambios en páginas y secciones",
  "Revisión del formulario de contacto",
  "Altas y cambios de productos",
  "Revisión de carrito, pedidos y pagos",
];

export function recurringScope(slug: string): { why: string; includes: string[] } | null {
  return SCOPE[slug] ?? null;
}

/** Tabla de lo que incluye cada servicio de la lista y por qué cambia el precio. */
export function RecurringComparison({ services, selected }: { services: PublicComponent[]; selected: string[] }) {
  const comparable = services
    .filter((service) => SCOPE[service.slug])
    .sort((a, b) => (a.pricing.amountCents ?? Number.MAX_SAFE_INTEGER) - (b.pricing.amountCents ?? Number.MAX_SAFE_INTEGER));
  if (comparable.length < 2) return null;

  const rows = [...new Set(comparable.flatMap((service) => SCOPE[service.slug]!.includes))].sort(
    (a, b) => (INCLUDE_ORDER.indexOf(a) + 1 || 99) - (INCLUDE_ORDER.indexOf(b) + 1 || 99),
  );
  const picked = (slug: string) => selected.includes(slug);

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[720px] text-sm">
        <caption className="sr-only">Comparación de servicios recurrentes: qué incluye cada uno y por qué cambia el precio</caption>
        <thead className="bg-surface-raised/70">
          <tr>
            <th scope="col" className="sticky left-0 bg-surface-raised px-4 py-3 text-left font-medium text-muted-foreground">Qué incluye</th>
            {comparable.map((service) => (
              <th key={service.slug} scope="col" className={cnHeader(picked(service.slug))}>
                <span className="block">{service.name}</span>
                <div className="mt-1 font-sans font-normal">
                  <PriceTag pricing={service.pricing} size="sm" />
                  {service.pricing.amountCents !== null && service.billing === "monthly" ? (
                    <p className="text-xs text-muted-foreground">/ mes</p>
                  ) : null}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row}>
              <th scope="row" className="sticky left-0 bg-card px-4 py-2.5 text-left font-normal text-foreground-secondary">{row}</th>
              {comparable.map((service) => (
                <td key={service.slug} className={cnCell(picked(service.slug))}>
                  {SCOPE[service.slug]!.includes.includes(row) ? (
                    <Check className="size-4 text-electric" aria-label="Incluido" />
                  ) : (
                    <span className="text-muted-foreground" aria-label="No incluido">—</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <th scope="row" className="sticky left-0 bg-card px-4 py-3 text-left font-medium text-foreground">Por qué este precio</th>
            {comparable.map((service) => (
              <td key={service.slug} className={`${cnCell(picked(service.slug))} text-xs text-foreground-secondary`}>
                {SCOPE[service.slug]!.why}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function cnHeader(selected: boolean): string {
  return `px-4 py-3 text-left align-bottom font-heading font-semibold ${selected ? "bg-electric/10" : ""}`;
}

function cnCell(selected: boolean): string {
  return `px-4 py-2.5 align-top ${selected ? "bg-electric/10" : ""}`;
}
