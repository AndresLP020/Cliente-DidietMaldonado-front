"use client";

import { CheckCircle2, Clock, Copy, ExternalLink, FileDown, FileText, Mail, MessageCircle, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DeliveryState } from "@/types/quote";
import { quotePdfUrl } from "@/services/quote-access-urls";
import { useQuoteStore } from "../store";

const deliveryLabels: Record<DeliveryState["status"], string> = {
  not_requested: "No solicitado",
  not_available: "No disponible",
  available: "Disponible",
  queued: "En proceso",
  simulated: "Simulado",
  deferred: "Pospuesto",
  sent: "Enviado",
  failed: "Falló",
};

export function ResultStep() {
  const { result, reset } = useQuoteStore();
  const [copied, setCopied] = useState(false);
  if (!result) return null;

  const issued = result.status === "issued";
  const url = typeof window !== "undefined" ? new URL(result.accessPath, window.location.origin).toString() : result.accessPath;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl space-y-6" role="status">
      <div className="rounded-2xl border border-royal/40 bg-card p-6 text-center sm:p-10">
        {issued ? <CheckCircle2 className="mx-auto mb-4 size-12 text-electric" aria-hidden /> : <Clock className="mx-auto mb-4 size-12 text-electric" aria-hidden />}
        <p className="text-sm text-muted-foreground">Folio</p>
        <p className="font-mono text-3xl font-semibold tracking-wide">{result.folio}</p>
        <h2 className="mt-4 font-heading text-2xl font-semibold">
          {issued ? "Tu cotización fue emitida" : "Recibimos tu solicitud de cotización"}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-foreground-secondary">
          {issued
            ? `Vigente hasta el ${new Date(result.validUntil!).toLocaleDateString("es-MX", { dateStyle: "long" })}.`
            : "Un asesor revisará los puntos pendientes y te enviará la propuesta definitiva. Los importes mostrados son preliminares."}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild variant="brand" size="xl">
            <Link href={result.accessPath}>
              Ver mi cotización <ExternalLink data-icon="inline-end" />
            </Link>
          </Button>
          <Button asChild variant="glass" size="xl">
            <a href={quotePdfUrl(result.accessToken)} target="_blank" rel="noopener noreferrer">
              <FileDown data-icon="inline-start" /> Descargar PDF
            </a>
          </Button>
          <Button variant="glass" size="xl" onClick={copy}>
            <Copy data-icon="inline-start" /> {copied ? "Enlace copiado" : "Copiar enlace"}
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Guarda este enlace: es privado y es la forma de consultar tu cotización. Vence el{" "}
          {new Date(result.accessExpiresAt).toLocaleDateString("es-MX", { dateStyle: "long" })}.
        </p>
      </div>

      <ul className="divide-y divide-border rounded-2xl border border-border bg-card shadow-card" aria-label="Estado de las entregas">
        <Delivery icon={FileText} label="Documento PDF" state={result.deliveries.pdf} />
        <Delivery icon={Mail} label="Envío por correo" state={result.deliveries.email} />
        <Delivery icon={MessageCircle} label="Envío por WhatsApp" state={result.deliveries.whatsapp} />
      </ul>

      <div className="text-center">
        <Button variant="ghost" onClick={reset}>
          <RotateCcw data-icon="inline-start" /> Crear otra cotización
        </Button>
      </div>
    </motion.div>
  );
}

function Delivery({ icon: Icon, label, state }: { icon: typeof Mail; label: string; state: DeliveryState }) {
  return (
    <li className="flex items-start justify-between gap-4 px-5 py-4 text-sm">
      <span className="flex items-start gap-3">
        <Icon className="mt-0.5 size-4 shrink-0 text-electric" aria-hidden />
        <span>
          <span className="font-medium">{label}</span>
          <span className="block text-xs text-muted-foreground">{state.message}</span>
        </span>
      </span>
      <span
        className={cn(
          "shrink-0 rounded-full px-2.5 py-0.5 text-xs",
          state.status === "sent" || state.status === "available" || state.status === "queued" ? "bg-royal/15 text-electric" : state.status === "failed" ? "bg-magenta/15 text-magenta" : "bg-surface-raised text-muted-foreground",
        )}
      >
        {deliveryLabels[state.status]}
      </span>
    </li>
  );
}
