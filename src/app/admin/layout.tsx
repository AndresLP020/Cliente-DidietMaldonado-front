import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s · Panel | ReaperSys" },
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <div className="flex min-h-svh flex-col">{children}</div>;
}
