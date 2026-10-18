import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteEventTracker } from "@/components/site-event-tracker";
import {pcpShareImage} from '@/lib/pcp-metadata';
import { isLocale, locales } from "@/lib/site-content";
import "@/app/globals.css";
import "@/app/engineering.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.pcpump.com"),
  title: { default: "PCPUMP.COM", template: "%s | PCPUMP.COM" },
  description: "Oilfield production, drilling, intervention and tubular equipment for global projects.",
  applicationName: "PCPUMP.COM",
  creator: "PCPUMP.COM",
  publisher: "PCPUMP.COM",
  category: "Industrial equipment",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    siteName: "PCPUMP.COM",
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
        <SiteHeader locale={locale} />
        <SiteEventTracker enabled={Boolean(process.env.INQUIRY_RECEIVER_URL)} />
        {children}
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
