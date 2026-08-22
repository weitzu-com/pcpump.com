import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { type Locale, ui } from "@/lib/site-content";

export function SiteHeader({ locale }: { locale: Locale }) {
  const copy = ui[locale];

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header">
        <Link className="wordmark" href={`/${locale}`} aria-label="PCPUMP.COM home">
          PCPUMP<span>.COM</span>
        </Link>
        <nav className="primary-nav" aria-label="Primary navigation">
          <Link href={`/${locale}/products`}>{copy.navProducts}</Link>
          <Link href={`/${locale}/applications`}>{copy.navIndustries}</Link>
          <Link href={`/${locale}/quality-and-engineering`}>{copy.navCapabilities}</Link>
          <Link href={`/${locale}/about`}>{copy.navAbout}</Link>
          <Link className="header-cta" href={`/${locale}/request-quote`}>
            {copy.quote}
          </Link>
        </nav>
        <LanguageSwitcher locale={locale} />
      </header>
    </>
  );
}
