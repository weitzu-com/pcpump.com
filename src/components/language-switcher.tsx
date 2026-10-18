"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeNames, locales, type Locale } from "@/lib/site-content";
import { switcherHref } from "@/lib/seo";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <div className="language-switcher" aria-label="Language selector">
      {locales.map((nextLocale) => {
        const nextSegments = [...segments];
        if (nextSegments.length === 0) nextSegments.push(nextLocale);
        else nextSegments[0] = nextLocale;

        return (
          <Link
            href={switcherHref(pathname, nextSegments[0], nextSegments.slice(1).join("/"))}
            hrefLang={nextLocale}
            key={nextLocale}
            aria-current={nextLocale === locale ? "page" : undefined}
          >
            {localeNames[nextLocale]}
          </Link>
        );
      })}
    </div>
  );
}
