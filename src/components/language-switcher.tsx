"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import {
  hreflangCode,
  localeNames,
  switcherLocales,
  type Locale,
} from "@/lib/locales";
import { isPendingLocalePage, switcherFallbackHref, switcherHref } from "@/lib/seo";

/**
 * Batch0 language switcher (≥5 locales): current language button + list.
 * No country flags. Pending/shell targets stay selectable; same-path when
 * possible, else locale home via switcherFallbackHref hook.
 */
export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const slug = segments.slice(1).join("/");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="language-switcher" ref={rootRef}>
      <button
        type="button"
        className="lang-button"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`Language: ${localeNames[locale]}`}
        onClick={() => setOpen((value) => !value)}
      >
        {localeNames[locale]} <span className="chevron" aria-hidden="true">▾</span>
      </button>
      {open ? (
        <ul className="lang-list" id={listId} role="listbox" aria-label="Languages">
          {switcherLocales.map((nextLocale) => {
            const pending = isPendingLocalePage(nextLocale, slug);
            // Same-path when routable; pending pages keep path + hint (no 404).
            // Fallback hook reserved for true missing routes.
            const href = switcherHref(pathname, nextLocale, slug) || switcherFallbackHref(nextLocale);
            const current = nextLocale === locale;
            return (
              <li key={nextLocale} role="option" aria-selected={current}>
                <Link
                  href={href}
                  hrefLang={hreflangCode(nextLocale)}
                  aria-current={current ? "true" : undefined}
                  data-pending={pending ? "true" : undefined}
                  onClick={() => setOpen(false)}
                >
                  <span>{localeNames[nextLocale]}</span>
                  {current ? <span className="mark" aria-hidden="true">✓</span> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
