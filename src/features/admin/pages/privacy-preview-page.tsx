"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { PrivacyNoticeContent } from "@/features/legal/privacy-notice-content";
import { adminApi } from "../admin-api";
import type { BusinessSettings } from "../types";
import { ErrorState, Panel } from "../ui";

const MISSING = (label: string) => `[${label} pendiente]`;

/** Vista previa del aviso de privacidad con los datos guardados, publicado o no. */
export function PrivacyPreviewPage() {
  const { data, isPending, error } = useQuery({ queryKey: ["admin", "settings"], queryFn: () => adminApi.get<BusinessSettings>("/admin/settings") });
  if (error) return <ErrorState error={error} />;
  if (isPending) return <Skeleton className="h-96 rounded-2xl" />;

  const missing = [!data.legalName && "razón social", !data.legalAddress && "domicilio", !data.contact.email && "correo de contacto"].filter(Boolean);

  return (
    <>
      <Link href="/admin/configuracion" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Configuración
      </Link>
      <div role="status" className="mb-6 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-foreground-secondary">
        Vista previa con los datos guardados. Estado: <strong className="text-foreground">{data.privacyNotice.published ? "publicado" : "sin publicar"}</strong>.
        {missing.length > 0 && <> Falta: {missing.join(", ")}.</>} Revísalo con tu asesor legal antes de publicarlo.
      </div>
      <Panel>
        <div className="p-6 sm:p-10">
          <PrivacyNoticeContent
            data={{
              tradeName: data.tradeName,
              legalName: data.legalName || MISSING("Razón social"),
              legalAddress: data.legalAddress || MISSING("Domicilio"),
              contactEmail: data.contact.email || MISSING("Correo"),
              updatedAt: data.privacyNotice.publishedAt ?? new Date(),
            }}
          />
        </div>
      </Panel>
    </>
  );
}
