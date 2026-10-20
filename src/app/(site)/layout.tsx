import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { publicEnv } from "@/lib/env";
import { contactLinks, getPublicSettings } from "@/services/public-settings";

/** Datos estructurados de la organización (solo datos reales configurados en el panel). */
async function OrganizationJsonLd() {
  const settings = await getPublicSettings();
  const contact = contactLinks(settings);
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.tradeName,
    url: publicEnv.NEXT_PUBLIC_SITE_URL,
    description:
      "Soluciones tecnológicas y digitales: páginas web, tiendas en línea, sistemas de punto de venta, software personalizado e integraciones.",
    ...(contact.email ? { email: contact.email } : {}),
    ...(contact.social.length ? { sameAs: contact.social.map((item) => item.url) } : {}),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <OrganizationJsonLd />
      <SiteHeader />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
