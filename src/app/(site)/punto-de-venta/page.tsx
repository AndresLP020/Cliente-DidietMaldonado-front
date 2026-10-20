import type { Metadata } from "next";
import { posPage } from "@/content/service-pages";
import { ServiceDetail } from "@/features/marketing/service-detail";

export const metadata: Metadata = {
  title: posPage.metaTitle,
  description: posPage.metaDescription,
  alternates: { canonical: "/punto-de-venta" },
};

export default function Page() {
  return <ServiceDetail content={posPage} image="/images/industries/negocios-sucursales.jpg" variant="strip" featureImage="/images/industries/tiendas-abarrotes.jpg" />;
}
