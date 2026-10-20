import { CheckCircle2, FlaskConical, GitBranch, Layers3, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Ilustración del hero: ventana de editor con código TypeScript de un servicio de ventas.
 * Es decorativa (aria-hidden): no representa un proyecto real ni métricas de la empresa.
 * Solo HTML + CSS; las animaciones respetan prefers-reduced-motion (globals.css).
 */

type TokenKind = "plain" | "keyword" | "type" | "fn" | "string" | "number" | "comment";
type Line = [TokenKind, string][];

const tokenColor: Record<TokenKind, string> = {
  plain: "text-[var(--rs-code-plain)]",
  keyword: "text-[var(--rs-code-keyword)]",
  type: "text-[var(--rs-code-type)]",
  fn: "text-[var(--rs-code-fn)]",
  string: "text-[var(--rs-code-string)]",
  number: "text-[var(--rs-code-number)]",
  comment: "text-[var(--rs-code-comment)] italic",
};

const k = (text: string): [TokenKind, string] => ["keyword", text];
const t = (text: string): [TokenKind, string] => ["type", text];
const f = (text: string): [TokenKind, string] => ["fn", text];
const s = (text: string): [TokenKind, string] => ["string", text];
const n = (text: string): [TokenKind, string] => ["number", text];
const c = (text: string): [TokenKind, string] => ["comment", text];
const p = (text: string): [TokenKind, string] => ["plain", text];

const code: Line[] = [
  [k("import"), p(" { z } "), k("from"), p(" "), s('"zod"'), p(";")],
  [k("import"), p(" { db, "), t("Receipt"), p(" } "), k("from"), p(" "), s('"./db"'), p(";")],
  [],
  [k("const"), p(" "), t("OrderSchema"), p(" = z."), f("object"), p("({")],
  [p("  customerId: z."), f("string"), p("()."), f("uuid"), p("(),")],
  [p("  items: z."), f("array"), p("("), t("LineItem"), p(")."), f("min"), p("("), n("1"), p("),")],
  [p("});")],
  [],
  [c("/** Registra la venta, descuenta inventario y emite el ticket. */")],
  [k("export async function"), p(" "), f("createOrder"), p("(input: "), t("unknown"), p("): "), t("Promise"), p("<"), t("Receipt"), p("> {")],
  [p("  "), k("const"), p(" order = "), t("OrderSchema"), p("."), f("parse"), p("(input);")],
  [],
  [p("  "), k("return"), p(" db."), f("transaction"), p("("), k("async"), p(" (tx) => {")],
  [p("    "), k("for"), p(" ("), k("const"), p(" item "), k("of"), p(" order.items) {")],
  [p("      "), k("await"), p(" tx.inventory."), f("decrement"), p("(item.sku, item.qty);")],
  [p("    }")],
  [p("    "), k("const"), p(" sale = "), k("await"), p(" tx.sales."), f("insert"), p("(order);")],
  [p("    "), k("return"), p(" "), f("issueReceipt"), p("(sale, { currency: "), s('"MXN"'), p(" });")],
  [p("  });")],
  [p("}")],
];

const tabs = ["orders.service.ts", "inventory.ts", "receipt.ts"];

function FloatingCard({ className, icon: Icon, title, detail }: { className?: string; icon: typeof CheckCircle2; title: string; detail: string }) {
  return (
    <div className={cn("absolute z-10 flex items-center gap-3 rounded-xl border border-border bg-canvas px-3.5 py-2.5 shadow-elevated", className)}>
      <span className="inline-flex size-8 items-center justify-center rounded-lg bg-sky text-royal">
        <Icon className="size-4" />
      </span>
      <span className="leading-tight">
        <span className="block text-xs font-semibold text-navy">{title}</span>
        <span className="block text-[0.7rem] text-muted-foreground">{detail}</span>
      </span>
    </div>
  );
}

export function CodeShowcase() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-xl px-2 py-8 sm:px-6 lg:max-w-none">
      {/* Halo discreto detrás de la ventana */}
      <div className="absolute inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--rs-royal)_45%,transparent),transparent_70%)] blur-2xl" />

      <div className="overflow-hidden rounded-2xl border border-snow/10 bg-ink shadow-[0_30px_80px_-30px_rgb(0_0_0/0.6)]">
        {/* Barra de título */}
        <div className="flex items-center gap-2 border-b border-snow/10 bg-navy-soft/60 px-4 py-3">
          <span className="size-3 rounded-full bg-magenta" />
          <span className="size-3 rounded-full bg-[var(--rs-code-number)]" />
          <span className="size-3 rounded-full bg-[var(--rs-code-string)]" />
          <span className="ml-3 truncate font-mono text-[0.7rem] text-snow/60">reapersys / pos-service</span>
        </div>
        {/* Pestañas */}
        <div className="flex border-b border-snow/10 bg-navy/40 font-mono text-[0.7rem]">
          {tabs.map((tab, index) => (
            <span
              key={tab}
              className={cn(
                "border-r border-snow/10 px-4 py-2",
                index === 0 ? "border-t-2 border-t-gold bg-ink text-snow" : "text-snow/65",
                index === 2 && "hidden sm:inline",
              )}
            >
              {tab}
            </span>
          ))}
        </div>

        {/* Código */}
        <div className="relative overflow-hidden py-4 font-mono text-[0.68rem] leading-[1.6rem] sm:text-[0.78rem]">
          <div
            className="pointer-events-none absolute inset-x-0 top-4 h-[1.6rem] bg-royal/15 motion-safe:animate-code-scan motion-reduce:hidden"
            style={{ ["--scan-distance" as string]: `${(code.length - 1) * 1.6}rem` }}
          />
          {code.map((line, index) => (
            <div key={index} className="relative flex whitespace-pre">
              <span className="w-10 shrink-0 pr-3 text-right text-snow/55 select-none sm:w-12">{index + 1}</span>
              <span className="min-w-0 overflow-hidden text-ellipsis">
                {line.map(([kind, text], i) => (
                  <span key={i} className={tokenColor[kind]}>
                    {text}
                  </span>
                ))}
                {index === code.length - 1 && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-gold motion-safe:animate-caret" />}
              </span>
            </div>
          ))}
        </div>

        {/* Barra de estado */}
        <div className="flex items-center justify-between gap-3 border-t border-snow/10 bg-navy-soft/60 px-4 py-2 font-mono text-[0.65rem] text-snow/60">
          <span className="inline-flex items-center gap-1.5">
            <GitBranch className="size-3" /> main
          </span>
          <span className="inline-flex items-center gap-1.5 text-[var(--rs-code-string)]">
            <CheckCircle2 className="size-3" /> Sin errores de tipos
          </span>
          <span className="hidden sm:inline">TypeScript</span>
        </div>
      </div>

      <FloatingCard className="-top-1 right-0 sm:right-2" icon={CheckCircle2} title="Build exitoso" detail="Compilación de producción" />
      <FloatingCard className="-top-1 left-0 hidden sm:flex lg:-left-6" icon={FlaskConical} title="Pruebas aprobadas" detail="Unitarias y de extremo a extremo" />
      <FloatingCard className="right-4 -bottom-2 hidden sm:flex" icon={ShieldCheck} title="Despliegue seguro" detail="HTTPS · cabeceras de seguridad" />
      <div className="absolute -bottom-2 left-4 z-10 hidden items-center gap-2 rounded-full border border-snow/15 bg-navy-soft px-3 py-1.5 text-[0.7rem] font-medium text-snow/85 shadow-elevated md:inline-flex">
        <Layers3 className="size-3.5 text-gold-soft" /> TypeScript · Next.js · NestJS
      </div>
    </div>
  );
}
