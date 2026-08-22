import Link from "next/link";
import { localeNames, locales, type Locale, ui } from "@/lib/site-content";

export function SiteFooter({ locale }: { locale: Locale }) {
  const copy = ui[locale];

  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <Link className="wordmark wordmark-light" href={`/${locale}`}>
          PCPUMP<span>.COM</span>
        </Link>
        <p>{copy.footerLine}</p>
      </div>
      <div>
        <p className="footer-label">{copy.email}</p>
        <a className="footer-email" href="mailto:sales@pcpump.com">sales@pcpump.com</a>
      </div>
      <div>
        <p className="footer-label">{copy.language}</p>
        <div className="footer-links">
          {locales.map((item) => <Link href={`/${item}`} key={item}>{localeNames[item]}</Link>)}
          <Link href={`/${locale}/privacy`}>{copy.privacy}</Link>
        </div>
      </div>
    </footer>
  );
}
