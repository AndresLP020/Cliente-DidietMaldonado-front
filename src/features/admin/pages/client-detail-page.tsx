"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/features/admin/admin-api";
import type { AdminClientDetail } from "@/features/admin/types";
import { ErrorState, formatDate, formatDateTime, PageHeader, Panel, quoteStatusLabels, StatusPill } from "@/features/admin/ui";
import { formatMoney } from "@/lib/format";

const channelLabels: Record<string, string> = { contact: "Uso de datos para responder", email: "Envío por correo", whatsapp: "Envío por WhatsApp" };

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isPending, error } = useQuery({ queryKey: ["admin", "client", id], queryFn: () => adminApi.get<AdminClientDetail>(`/admin/clients/${id}`) });

  if (error) return <ErrorState error={error} />;
  if (isPending) return <Skeleton className="h-96 rounded-2xl" />;

  return (
    <>
      <Link href="/admin/clientes" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Clientes
      </Link>
      <PageHeader title={data.name} description={data.company} />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Panel title={`Cotizaciones (${data.quotes.length})`}>
          <ul className="divide-y divide-border">
            {data.quotes.map((q) => (
              <li key={q.id}>
                <Link href={`/admin/cotizaciones/${q.id}`} className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-surface-raised/60">
                  <span>
                    <span className="block font-mono text-xs text-muted-foreground">{q.folio} · {formatDate(q.createdAt)}</span>
                    {q.packageName}
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <span className="tabular-nums">{formatMoney(q.totalCents)}</span>
                    <StatusPill status={q.status} label={quoteStatusLabels[q.status]} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
        <div className="space-y-6">
          <Panel title="Contacto">
            <dl className="space-y-3 p-5 text-sm">
              <div><dt className="text-xs text-muted-foreground">Correo</dt><dd className="break-all">{data.email}</dd></div>
              {data.phone && <div><dt className="text-xs text-muted-foreground">Teléfono</dt><dd>{data.phone}</dd></div>}
              {data.whatsapp && <div><dt className="text-xs text-muted-foreground">WhatsApp</dt><dd>{data.whatsapp}</dd></div>}
              {data.country && <div><dt className="text-xs text-muted-foreground">País</dt><dd>{data.country}</dd></div>}
            </dl>
          </Panel>
          <Panel title="Consentimientos">
            <ul className="space-y-3 p-5 text-sm">
              {data.consents.map((c, i) => (
                <li key={i}>
                  <p>{channelLabels[c.channel] ?? c.channel}: {c.granted ? "otorgado" : "revocado"}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(c.at)} · texto {c.textVersion}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
