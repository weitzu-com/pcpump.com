import Link from "next/link";
import { type Locale } from "@/lib/locales";
import { uiCopy } from "@/lib/site-content";

export function ContactBand({ locale }: { locale: Locale }) {
  const copy = uiCopy(locale);

  return (
    <section className="contact-band" aria-labelledby="contact-title">
      <div>
        <p className="eyebrow">sales@pcpump.com</p>
        <h2 id="contact-title">{copy.contactTitle}</h2>
      </div>
      <div>
        <p>{copy.contactBody}</p>
        <div className="hero-actions">
          <a className="button button-light" href="mailto:sales@pcpump.com">
            {copy.email}
          </a>
          <Link className="button button-outline-light" href={`/${locale}/request-quote`}>
            {copy.quote}
          </Link>
        </div>
      </div>
    </section>
  );
}
