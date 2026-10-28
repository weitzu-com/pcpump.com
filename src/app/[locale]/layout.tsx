import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteEventTracker } from "@/components/site-event-tracker";
import { I18nPendingHint } from "@/components/i18n-pending-hint";
import { pcpShareImage } from "@/lib/pcp-metadata";
import { htmlLang, isLocale, localeDir, locales, type Locale } from "@/lib/locales";
import { jsonLdScript, organizationJsonLd } from "@/lib/seo";
import "@/app/globals.css";
import "@/app/engineering.css";
import "@/app/i18n-layout.css";

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
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  return (
    <html lang={htmlLang(locale)} dir={localeDir(locale)}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(organizationJsonLd)} />
        <div id="language" tabIndex={-1} />
        <SiteHeader locale={locale} />
        <I18nPendingHint locale={locale} />
        <SiteEventTracker enabled={Boolean(process.env.INQUIRY_RECEIVER_URL)} />
        {children}
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
