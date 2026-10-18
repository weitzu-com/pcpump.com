import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteEventTracker } from "@/components/site-event-tracker";
import {pcpShareImage} from '@/lib/pcp-metadata';
import { isLocale, locales } from "@/lib/site-content";
import { jsonLdScript, organizationJsonLd } from "@/lib/seo";
import "@/app/globals.css";
import "@/app/engineering.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.pcpump.com"),
  title: { default: "PCPUMP", template: "%s | PCPUMP" },
  description: "Oilfield production, drilling, intervention and tubular equipment for global projects.",
  applicationName: "PCPUMP",
  creator: "PCPUMP",
  publisher: "PCPUMP",
  category: "Industrial equipment",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    siteName: "PCPUMP",
    type: "website",
    images: [{ url: pcpShareImage, width: 1200, height: 630, alt: "PCPUMP artificial lift systems and technical reference" }],
  },
  twitter: { card: "summary_large_image", images: [pcpShareImage] },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(organizationJsonLd)} />
        <SiteHeader locale={locale} />
        <SiteEventTracker enabled={Boolean(process.env.INQUIRY_RECEIVER_URL)} />
        {children}
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
