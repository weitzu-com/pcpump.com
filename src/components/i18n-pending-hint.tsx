"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isLocale, type Locale } from "@/lib/locales";
import { isPendingLocalePage, localHref } from "@/lib/seo";

/** Quiet chrome-only hint strings (not page body). EN fallback for unset locales. */
const hintCopy: Partial<Record<Locale, { stillEnglish: string; choose: string; orBrowse: string; home: string }>> = {
  en: {
    stillEnglish: "This page is still in English.",
    choose: "Choose another language",
    orBrowse: "or",
    home: "browse the home page",
  },
  es: {
    stillEnglish: "Esta página sigue en inglés.",
    choose: "Elija otro idioma",
    orBrowse: "o",
    home: "vaya a la página de inicio",
  },
  ru: {
    stillEnglish: "Эта страница пока на английском.",
    choose: "Выберите другой язык",
    orBrowse: "или",
    home: "перейдите на главную",
  },
  ar: {
    stillEnglish: "لا تزال هذه страница باللغة الإنجليزية.",
    choose: "اختر لغة أخرى",
    orBrowse: "أو",
    home: "تصفّح الصفحة الرئيسية",
  },
  "pt-BR": {
    stillEnglish: "Esta página ainda está em inglês.",
    choose: "Escolha outro idioma",
    orBrowse: "ou",
    home: "vá à página inicial",
  },
  fr: {
    stillEnglish: "Cette page est encore en anglais.",
    choose: "Choisissez une autre langue",
    orBrowse: "ou",
    home: "consultez l’accueil",
  },
  zh: {
    stillEnglish: "本页暂为英文。",
    choose: "请选择其他语言",
    orBrowse: "或",
    home: "浏览该语言首页",
  },
};

export function I18nPendingHint({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const pathLocale = segments[0];
  const slug = isLocale(pathLocale) ? segments.slice(1).join("/") : "";
  if (!isPendingLocalePage(locale, slug)) return null;
  const copy = hintCopy[locale] ?? hintCopy.en!;
  return (
    <div className="i18n-hint" role="status" data-i18n-hint="missing-translation">
      <p>
        <span className="hint-mark" aria-hidden="true">ⓘ</span>
        {copy.stillEnglish}{" "}
        <a href="#language">{copy.choose}</a> {copy.orBrowse}{" "}
        <Link href={localHref(locale)}>{copy.home}</Link>.
      </p>
    </div>
  );
}
