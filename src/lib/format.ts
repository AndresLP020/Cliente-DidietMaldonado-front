/**
 * Formato de importes recibidos del backend (enteros en centavos).
 * Solo presentación: el frontend nunca calcula importes autoritativos.
 */
const mxnWhole = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const mxnCents = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(amountCents: number): string {
  if (!Number.isSafeInteger(amountCents)) throw new Error(`Importe inválido: ${amountCents}`);
  // Los importes enteros en pesos se muestran sin decimales ($3,499); el resto con dos.
  return amountCents % 100 === 0 ? mxnWhole.format(amountCents / 100) : mxnCents.format(amountCents / 100);
}
