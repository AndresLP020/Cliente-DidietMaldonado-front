import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { PrivacyNoticeContent } from "@/features/legal/privacy-notice-content";
import { getPublicSettings } from "@/services/public-settings";

export const metadata: Metadata = {
  title: "Aviso de privacidad",
  description: "Cómo tratamos los datos personales que nos compartes en nuestros formularios y cotizaciones.",
  alternates: { canonical: "/aviso-de-privacidad" },
};

/** Solo existe cuando se publica desde /admin/configuracion con los datos del responsable completos. */
export default async function PrivacyNoticePage() {
  const settings = await getPublicSettings();
  const notice = settings.privacyNotice;
  if (!notice.published) notFound();

  return (
    <section className="bg-tint pt-32 pb-24 sm:pt-40">
      <Container className="max-w-3xl">
        <PrivacyNoticeContent data={{ ...notice, tradeName: settings.tradeName }} />
      </Container>
    </section>
  );
}
