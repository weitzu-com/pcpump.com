import Link from "next/link";
import { LanguageSwitcher } from "./language-switcher";
import { MobileNavigation } from "./mobile-navigation";
import { type Locale } from "@/lib/locales";

const navLabels: Record<"en" | "es" | "ru", string[]> = {
  en: ["PCP systems", "Other lift systems", "Engineering", "Resources", "Engineering inquiry"],
  es: ["Sistemas PCP", "Otros sistemas", "Ingeniería", "Recursos", "Consulta técnica"],
  ru: ["Системы PCP", "Другие системы", "Инжиниринг", "Ресурсы", "Технический запрос"],
};

const menuLabels: Record<"en" | "es" | "ru", string> = {
  en: "Menu",
  es: "Menú",
  ru: "Меню",
};

export function SiteHeader({ locale }: { locale: Locale }) {
  const labels = navLabels[locale as "en" | "es" | "ru"] ?? navLabels.en;
  const links: [string, string][] = [
    [`/${locale}/pcp-systems`, labels[0]],
    [`/${locale}#other-lift-equipment`, labels[1]],
    [`/${locale}/quality-and-engineering`, labels[2]],
    [`/${locale}/technical-resources`, labels[3]],
  ];
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <Link className="wordmark" href={`/${locale}`} aria-label="PCPUMP.COM home">
          <span className="brand-symbol" aria-hidden="true">
            ≋
          </span>
          PCPUMP<span>.COM</span>
        </Link>
        <nav className="primary-nav" aria-label="Primary navigation">
          {links.map(([href, t]) => (
            <Link key={href} href={href}>
              {t}
            </Link>
          ))}
          <Link className="header-cta" href={`/${locale}/engineering-inquiry`}>
            {labels[4]} <span className="dir-arrow" aria-hidden="true">↗</span>
          </Link>
        </nav>
        <MobileNavigation
          links={links}
          inquiryHref={`/${locale}/engineering-inquiry`}
          inquiryLabel={labels[4]}
          menuLabel={menuLabels[locale as "en" | "es" | "ru"] ?? menuLabels.en}
        />
        <LanguageSwitcher locale={locale} />
      </header>
    </>
  );
}
