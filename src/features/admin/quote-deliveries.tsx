"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Mail, MessageCircle, RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminApi } from "./admin-api";
import { useCan } from "./session";
import type { AdminDelivery } from "./types";
import { ErrorState, formatDateTime, Panel, StatusPill, useAdminMutation } from "./ui";

export const deliveryStatusLabels: Record<AdminDelivery["status"], string> = {
  queued: "En cola",
  sending: "Enviando",
  sent: "Enviado",
  delivered: "Entregado",
  read: "Leído",
  failed: "Falló",
  simulated: "Simulado",
  skipped: "Omitido",
};

export const deliveryStatusTone: Record<AdminDelivery["status"], string> = {
  queued: "draft",
  sending: "draft",
  sent: "published",
  delivered: "published",
  read: "published",
  failed: "rejected",
  simulated: "cancelled",
  skipped: "cancelled",
};

const kindLabels: Record<AdminDelivery["kind"], string> = {
  quote_issued: "Cotización con PDF",
  quote_received: "Acuse de recepción",
  admin_new_quote: "Aviso interno",
  admin_new_lead: "Aviso interno",
  payment_reminder: "Recordatorio de pago",
  admin_billing_digest: "Resumen de cobranza",
  admin_new_testimonial: "Aviso interno",
};

interface Props {
  quoteId: string;
  deliveries: AdminDelivery[];
  canSend: boolean;
  integrations: { emailSimulated: boolean; whatsappSimulated: boolean };
}

/** Envíos de la cotización: estado real de cada uno, envío manual y reintento de fallidos. */
export function QuoteDeliveries({ quoteId, deliveries, canSend, integrations }: Props) {
  const queryClient = useQueryClient();
  const canWrite = useCan("quotes:write");
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin"] });

  const send = useAdminMutation({
    mutationFn: (channel: "email" | "whatsapp") => adminApi.send("POST", `/admin/quotes/${quoteId}/send`, { channels: [channel] }),
    // El envío se procesa en segundo plano: se vuelve a consultar en unos segundos.
    onSuccess: () => {
      void refresh();
      setTimeout(() => void refresh(), 4000);
    },
  });
  const retry = useAdminMutation({
    mutationFn: (id: string) => adminApi.send("POST", `/admin/deliveries/${id}/retry`),
    onSuccess: () => {
      void refresh();
      setTimeout(() => void refresh(), 4000);
    },
  });

  return (
    <Panel title="Envíos">
      <div className="space-y-4 p-5">
        {(integrations.emailSimulated || integrations.whatsappSimulated) && (
          <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-foreground-secondary">
            Modo simulado para {[integrations.emailSimulated && "correo", integrations.whatsappSimulated && "WhatsApp"].filter(Boolean).join(" y ")}: los envíos
            se registran pero no se entregan hasta configurar las credenciales.
          </p>
        )}

        {canWrite && (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" disabled={!canSend || send.isPending} onClick={() => send.mutate("email")}>
              {send.isPending && send.variables === "email" ? <Loader2 className="animate-spin" /> : <Mail />} Enviar por correo
            </Button>
            <Button size="sm" variant="outline" disabled={!canSend || send.isPending} onClick={() => send.mutate("whatsapp")}>
              {send.isPending && send.variables === "whatsapp" ? <Loader2 className="animate-spin" /> : <MessageCircle />} Enviar por WhatsApp
            </Button>
          </div>
        )}
        {canWrite && !canSend && <p className="text-xs text-muted-foreground">Solo se envían cotizaciones emitidas y vigentes.</p>}
        {send.error && <ErrorState error={send.error} />}
        {retry.error && <ErrorState error={retry.error} />}

        {deliveries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin envíos registrados.</p>
        ) : (
          <ul className="space-y-3">
            {deliveries.map((d) => (
              <li key={d.id} className="rounded-xl border border-border p-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <span className="flex items-center gap-2">
                    {d.channel === "email" ? <Mail className="size-4 text-electric" aria-hidden /> : <MessageCircle className="size-4 text-electric" aria-hidden />}
                    <span>
                      <span className="block font-medium">{kindLabels[d.kind]}</span>
                      <span className="block text-xs text-muted-foreground">
                        {d.recipient}
                        {d.quoteVersion ? ` · v${d.quoteVersion}` : ""}
                      </span>
                    </span>
                  </span>
                  <StatusPill status={deliveryStatusTone[d.status]} label={deliveryStatusLabels[d.status]} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDateTime(d.updatedAt)} · {d.requestedBy === "system" ? "automático" : d.requestedBy}
                  {d.attempts > 1 && ` · ${d.attempts} intentos`}
                </p>
                {d.lastError && d.status !== "sent" && <p className="mt-1 text-xs break-words text-magenta">{d.lastError}</p>}
                {d.status === "failed" && canWrite && (
                  <Button size="sm" variant="ghost" className="mt-2" disabled={retry.isPending} onClick={() => retry.mutate(d.id)}>
                    <RotateCcw /> Reintentar
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
        {canWrite && canSend && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Send className="size-3" aria-hidden /> Se envía la versión vigente con su PDF.
          </p>
        )}
      </div>
    </Panel>
  );
}
