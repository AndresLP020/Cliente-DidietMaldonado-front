import type { Metadata } from "next";
import { webPage } from "@/content/service-pages";
import { ServiceDetail } from "@/features/marketing/service-detail";

export const metadata: Metadata = {
  title: webPage.metaTitle,
  description: webPage.metaDescription,
  alternates: { canonical: "/desarrollo-web" },
};

export default function Page() {
  return <ServiceDetail content={webPage} image="/images/backgrounds/web-wireframe.webp" featureImage="/images/backgrounds/services-desk.webp" />;
}
